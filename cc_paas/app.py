import os
import joblib
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import logging
from prometheus_client import Counter, Histogram, Gauge, generate_latest, CONTENT_TYPE_LATEST
from werkzeug.middleware.dispatcher import DispatcherMiddleware
from prometheus_client import make_wsgi_app
import time
import threading

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Prometheus metrics
REQUEST_COUNT = Counter(
    'app_requests_total',
    'Total number of requests',
    ['method', 'endpoint', 'status']
)
REQUEST_LATENCY = Histogram(
    'app_request_latency_seconds',
    'Request latency in seconds',
    ['method', 'endpoint']
)
PREDICTIONS_COUNT = Counter(
    'app_predictions_total',
    'Total number of predictions made',
    ['category']
)
MODEL_LOADED = Gauge(
    'app_model_loaded',
    'Whether ML models are loaded (1=loaded, 0=not loaded)'
)
ACTIVE_REQUESTS = Gauge(
    'app_active_requests',
    'Number of requests currently being processed'
)

# ML Performance Metrics
MODEL_INFERENCE_TIME = Histogram(
    'app_model_inference_seconds',
    'Time taken for model inference only',
    ['category']
)
PREDICTION_CONFIDENCE = Histogram(
    'app_prediction_confidence',
    'Confidence score distribution',
    ['category'],
    buckets=[0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0]
)
LOW_CONFIDENCE_PREDICTIONS = Counter(
    'app_low_confidence_predictions_total',
    'Predictions with confidence below 50%',
    ['category']
)
AVG_CONFIDENCE = Gauge(
    'app_average_confidence',
    'Average confidence score across recent predictions',
    ['category']
)

# Business Intelligence Metrics
TEXT_LENGTH = Histogram(
    'app_text_length_chars',
    'Length of input text in characters',
    buckets=[10, 50, 100, 200, 500, 1000, 2000, 5000]
)
ERROR_TYPES = Counter(
    'app_errors_total',
    'Errors by type',
    ['error_type', 'endpoint']
)
PREDICTIONS_BY_CONFIDENCE_LEVEL = Counter(
    'app_predictions_by_confidence_level_total',
    'Predictions grouped by confidence level',
    ['level', 'category']  # level: low/medium/high
)

# Database Metrics
DB_QUERY_LATENCY = Histogram(
    'app_db_query_seconds',
    'Database query latency',
    ['operation']  # save, stats, init
)
DB_ERRORS = Counter(
    'app_db_errors_total',
    'Database errors by type',
    ['operation', 'error_type']
)
DB_OPERATIONS = Counter(
    'app_db_operations_total',
    'Database operations count',
    ['operation', 'status']  # status: success/failure
)

# Resource Metrics
import psutil
import sys

PROCESS_MEMORY_BYTES = Gauge(
    'app_process_memory_bytes',
    'Memory used by the application process'
)
PROCESS_CPU_PERCENT = Gauge(
    'app_process_cpu_percent',
    'CPU usage percentage'
)
PYTHON_INFO = Gauge(
    'app_python_info',
    'Python version info',
    ['version', 'implementation']
)

# Set Python info once
PYTHON_INFO.labels(
    version=f"{sys.version_info.major}.{sys.version_info.minor}.{sys.version_info.micro}",
    implementation=sys.implementation.name
).set(1)

# Track confidence scores for averaging
confidence_tracker = {category: [] for category in ['Bug Report', 'Feature Request', 'Pricing Complaint', 'Positive Feedback', 'Negative Experience']}

# Initialize process object once
_process = psutil.Process()

def update_resource_metrics():
    """Update resource usage metrics"""
    try:
        PROCESS_MEMORY_BYTES.set(_process.memory_info().rss)
        # Use non-blocking cpu_percent (interval=None uses previous call)
        cpu = _process.cpu_percent(interval=None)
        if cpu > 0:  # Only update if we get a valid reading
            PROCESS_CPU_PERCENT.set(cpu)
    except Exception as e:
        logger.warning(f"Failed to update resource metrics: {e}")

# Background thread for continuous CPU monitoring
def cpu_monitor_thread():
    """Background thread to continuously monitor CPU usage"""
    logger.info("Starting CPU monitoring thread...")
    while True:
        try:
            cpu = _process.cpu_percent(interval=1)  # Measure over 1 second
            PROCESS_CPU_PERCENT.set(cpu)
            PROCESS_MEMORY_BYTES.set(_process.memory_info().rss)
        except Exception as e:
            logger.warning(f"CPU monitor error: {e}")
        time.sleep(2)  # Update every 2 seconds

# Start CPU monitoring in background
cpu_thread = threading.Thread(target=cpu_monitor_thread, daemon=True)
cpu_thread.start()

# Load ML models globally (cached)
MODEL = None
VECTORIZER = None

def load_models():
    """Load ML models once on startup"""
    global MODEL, VECTORIZER
    if MODEL is None:
        logger.info("Loading ML models...")
        try:
            MODEL = joblib.load('textcat_model.pkl')
            VECTORIZER = joblib.load('tfidf_vectorizer.pkl')
            MODEL_LOADED.set(1)
            logger.info("✅ Models loaded successfully")
        except Exception as e:
            MODEL_LOADED.set(0)
            logger.error(f"❌ Failed to load models: {e}")
            raise

# Load models on startup
load_models()

# Middleware to track metrics
@app.before_request
def before_request():
    """Track request start time and increment active requests"""
    request.start_time = time.time()
    ACTIVE_REQUESTS.inc()

@app.after_request
def after_request(response):
    """Track request metrics after processing"""
    request_latency = time.time() - request.start_time
    
    REQUEST_COUNT.labels(
        method=request.method,
        endpoint=request.endpoint or 'unknown',
        status=response.status_code
    ).inc()
    
    REQUEST_LATENCY.labels(
        method=request.method,
        endpoint=request.endpoint or 'unknown'
    ).observe(request_latency)
    
    ACTIVE_REQUESTS.dec()
    
    # Update resource metrics periodically
    update_resource_metrics()
    
    return response

def get_db():
    """Get PostgreSQL database connection"""
    try:
        database_url = os.environ.get('DATABASE_URL')
        if not database_url:
            logger.warning("DATABASE_URL not set - running without database")
            return None
        
        # Render uses postgres:// but psycopg2 needs postgresql://
        if database_url.startswith('postgres://'):
            database_url = database_url.replace('postgres://', 'postgresql://', 1)
        
        return psycopg2.connect(database_url, cursor_factory=RealDictCursor)
    except Exception as e:
        logger.error(f"Database connection error: {e}")
        return None

@app.route('/metrics')
def metrics():
    """Prometheus metrics endpoint"""
    return generate_latest(), 200, {'Content-Type': CONTENT_TYPE_LATEST}

@app.route('/')
def home():
    """Home endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Text Categorization API',
        'version': '1.0.0',
        'model_loaded': MODEL is not None,
        'endpoints': {
            'health': '/',
            'predict': '/predict',
            'stats': '/stats',
            'metrics': '/metrics'
        }
    }), 200

@app.route('/health')
def health():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Text Categorization API',
        'version': '1.0.0',
        'model_loaded': MODEL is not None
    }), 200

@app.route('/predict', methods=['POST'])
def predict():
    """Main prediction endpoint"""
    try:
        # Validate request
        data = request.get_json()
        if not data:
            ERROR_TYPES.labels(error_type='no_json_data', endpoint='predict').inc()
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Extract text (support both 'text' and 'feedback' fields)
        text = data.get('text') or data.get('feedback', '')
        text = text.strip()
        
        # Validate text
        if not text:
            ERROR_TYPES.labels(error_type='empty_text', endpoint='predict').inc()
            return jsonify({'error': 'Text field is required'}), 400
        
        if len(text) < 3:
            ERROR_TYPES.labels(error_type='text_too_short', endpoint='predict').inc()
            return jsonify({'error': 'Text must be at least 3 characters long'}), 400
        
        if len(text) > 5000:
            ERROR_TYPES.labels(error_type='text_too_long', endpoint='predict').inc()
            return jsonify({'error': 'Text must be less than 5000 characters'}), 400
        
        # Track text length
        TEXT_LENGTH.observe(len(text))
        
        # Make prediction with timing
        inference_start = time.time()
        text_vec = VECTORIZER.transform([text])
        prediction = MODEL.predict(text_vec)[0]
        proba = MODEL.predict_proba(text_vec)[0]
        inference_time = time.time() - inference_start
        
        confidence = float(max(proba))
        
        # Track ML performance metrics
        MODEL_INFERENCE_TIME.labels(category=prediction).observe(inference_time)
        PREDICTION_CONFIDENCE.labels(category=prediction).observe(confidence)
        PREDICTIONS_COUNT.labels(category=prediction).inc()
        
        # Track confidence levels
        if confidence < 0.5:
            confidence_level = 'low'
            LOW_CONFIDENCE_PREDICTIONS.labels(category=prediction).inc()
        elif confidence < 0.7:
            confidence_level = 'medium'
        else:
            confidence_level = 'high'
        
        PREDICTIONS_BY_CONFIDENCE_LEVEL.labels(level=confidence_level, category=prediction).inc()
        
        # Update rolling average confidence
        if prediction not in confidence_tracker:
            confidence_tracker[prediction] = []
        confidence_tracker[prediction].append(confidence)
        # Keep last 100 predictions for rolling average
        confidence_tracker[prediction] = confidence_tracker[prediction][-100:]
        AVG_CONFIDENCE.labels(category=prediction).set(sum(confidence_tracker[prediction]) / len(confidence_tracker[prediction]))
        
        # Create all scores
        all_probabilities = {
            category: round(float(score) * 100, 2)
            for category, score in zip(MODEL.classes_, proba)
        }
        
        # Prepare result
        result = {
            'success': True,
            'prediction': prediction,
            'confidence': round(confidence * 100, 2),
            'all_probabilities': all_probabilities,
            'feedback': text[:100] + '...' if len(text) > 100 else text,
            'processing_time_ms': 0,
            'timestamp': datetime.utcnow().isoformat()
        }
        
        # Save to database (if available)
        conn = get_db()
        if conn:
            db_start = time.time()
            try:
                with conn.cursor() as cur:
                    cur.execute("""
                        INSERT INTO predictions (text, category, confidence, created_at)
                        VALUES (%s, %s, %s, %s)
                        RETURNING id
                    """, (text, prediction, confidence, datetime.utcnow()))
                    
                    row = cur.fetchone()
                    result['firestore_id'] = str(row['id'])  # Keep same field name for compatibility
                    conn.commit()
                    
                    db_latency = time.time() - db_start
                    DB_QUERY_LATENCY.labels(operation='save').observe(db_latency)
                    DB_OPERATIONS.labels(operation='save', status='success').inc()
                    logger.info(f"✅ Saved prediction {row['id']}")
            except Exception as e:
                db_latency = time.time() - db_start
                DB_QUERY_LATENCY.labels(operation='save').observe(db_latency)
                DB_OPERATIONS.labels(operation='save', status='failure').inc()
                DB_ERRORS.labels(operation='save', error_type=type(e).__name__).inc()
                logger.error(f"Database save error: {e}")
                result['warning'] = 'Prediction succeeded but database save failed'
            finally:
                conn.close()
        
        logger.info(f"Prediction: {prediction} ({confidence:.2%})")
        return jsonify(result), 200
        
    except Exception as e:
        ERROR_TYPES.labels(error_type=type(e).__name__, endpoint='predict').inc()
        logger.error(f"Prediction error: {e}", exc_info=True)
        return jsonify({
            'success': False,
            'error': 'Internal server error',
            'details': str(e)
        }), 500

@app.route('/stats', methods=['GET'])
def stats():
    """Get prediction statistics"""
    conn = get_db()
    if not conn:
        ERROR_TYPES.labels(error_type='db_unavailable', endpoint='stats').inc()
        return jsonify({'error': 'Database not available'}), 503
    
    db_start = time.time()
    try:
        with conn.cursor() as cur:
            # Total predictions
            cur.execute("SELECT COUNT(*) as total FROM predictions")
            total = cur.fetchone()['total']
            
            # Category breakdown
            cur.execute("""
                SELECT category, COUNT(*) as count, AVG(confidence) as avg_conf
                FROM predictions
                GROUP BY category
                ORDER BY count DESC
            """)
            categories = cur.fetchall()
            
            db_latency = time.time() - db_start
            DB_QUERY_LATENCY.labels(operation='stats').observe(db_latency)
            DB_OPERATIONS.labels(operation='stats', status='success').inc()
            
            return jsonify({
                'total_predictions': total,
                'categories': [
                    {
                        'name': row['category'],
                        'count': row['count'],
                        'avg_confidence': round(float(row['avg_conf']), 2)
                    }
                    for row in categories
                ],
                'timestamp': datetime.utcnow().isoformat()
            }), 200
            
    except Exception as e:
        db_latency = time.time() - db_start
        DB_QUERY_LATENCY.labels(operation='stats').observe(db_latency)
        DB_OPERATIONS.labels(operation='stats', status='failure').inc()
        DB_ERRORS.labels(operation='stats', error_type=type(e).__name__).inc()
        ERROR_TYPES.labels(error_type=type(e).__name__, endpoint='stats').inc()
        logger.error(f"Stats error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Initialize database table on first run
def init_db():
    """Create predictions table if it doesn't exist"""
    if not hasattr(app, 'db_initialized'):
        conn = get_db()
        if conn:
            try:
                with conn.cursor() as cur:
                    cur.execute("""
                        CREATE TABLE IF NOT EXISTS predictions (
                            id SERIAL PRIMARY KEY,
                            text TEXT NOT NULL,
                            category VARCHAR(50) NOT NULL,
                            confidence FLOAT NOT NULL,
                            created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
                        )
                    """)
                    conn.commit()
                    logger.info("✅ Database table ready")
                    app.db_initialized = True
            except Exception as e:
                logger.error(f"Table creation error: {e}")
            finally:
                conn.close()

# Call init_db once on startup
with app.app_context():
    init_db()

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

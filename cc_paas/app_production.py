import os
import pickle
from flask import Flask, request, jsonify
from flask_cors import CORS
from datetime import datetime
import psycopg2
from psycopg2.extras import RealDictCursor
import logging

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

app = Flask(__name__)
CORS(app)  # Enable CORS for frontend

# Load ML models globally (cached)
MODEL = None
VECTORIZER = None

def load_models():
    """Load ML models once on startup"""
    global MODEL, VECTORIZER
    if MODEL is None:
        logger.info("Loading ML models...")
        try:
            with open('textcat_model.pkl', 'rb') as f:
                MODEL = pickle.load(f)
            with open('tfidf_vectorizer.pkl', 'rb') as f:
                VECTORIZER = pickle.load(f)
            logger.info("✅ Models loaded successfully")
        except Exception as e:
            logger.error(f"❌ Failed to load models: {e}")
            raise

# Load models on startup
load_models()

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
            'stats': '/stats'
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
            return jsonify({'error': 'No JSON data provided'}), 400
        
        # Extract text (support both 'text' and 'feedback' fields)
        text = data.get('text') or data.get('feedback', '')
        text = text.strip()
        
        # Validate text
        if not text:
            return jsonify({'error': 'Text field is required'}), 400
        
        if len(text) < 3:
            return jsonify({'error': 'Text must be at least 3 characters long'}), 400
        
        if len(text) > 5000:
            return jsonify({'error': 'Text must be less than 5000 characters'}), 400
        
        # Make prediction
        text_vec = VECTORIZER.transform([text])
        prediction = MODEL.predict(text_vec)[0]
        proba = MODEL.predict_proba(text_vec)[0]
        confidence = float(max(proba))
        
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
                    logger.info(f"✅ Saved prediction {row['id']}")
            except Exception as e:
                logger.error(f"Database save error: {e}")
                result['warning'] = 'Prediction succeeded but database save failed'
            finally:
                conn.close()
        
        logger.info(f"Prediction: {prediction} ({confidence:.2%})")
        return jsonify(result), 200
        
    except Exception as e:
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
        return jsonify({'error': 'Database not available'}), 503
    
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
        logger.error(f"Stats error: {e}")
        return jsonify({'error': str(e)}), 500
    finally:
        conn.close()

# Initialize database table on first run
@app.before_request
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

if __name__ == '__main__':
    port = int(os.environ.get('PORT', 5000))
    app.run(host='0.0.0.0', port=port, debug=False)

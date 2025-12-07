from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib
import firebase_admin
from firebase_admin import credentials, firestore

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# ---- Load trained model and vectorizer ----
model = joblib.load("textcat_model.pkl")
vectorizer = joblib.load("tfidf_vectorizer.pkl")

# ---- Initialize Firebase ----
cred = credentials.Certificate("serviceAccountKey.json")
firebase_admin.initialize_app(cred)
db = firestore.client()

# ---- Define routes ----
@app.route('/')
def home():
    return "✅ Text Categorization API is running!"

@app.route('/health', methods=['GET'])
def health():
    return jsonify({
        "status": "healthy",
        "message": "API is running"
    })

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        # accept either 'text' or 'feedback' from frontend
        feedback_text = None
        if data is None:
            return jsonify({"error": "Invalid or missing JSON body"}), 400
        feedback_text = data.get("feedback") or data.get("text")

        if not feedback_text:
            return jsonify({"error": "No feedback text provided"}), 400

        # Convert text → TF-IDF → predict
        X = vectorizer.transform([feedback_text])
        prediction = model.predict(X)[0]

        # Get prediction probability for confidence (if available)
        confidence = None
        try:
            probabilities = model.predict_proba(X)[0]
            max_prob = max(probabilities)
            confidence = round(max_prob * 100, 2)
        except Exception:
            # some models may not implement predict_proba
            confidence = None

        # Save to Firestore
        doc = {
            'text': feedback_text,
            'category': prediction,
            'confidence': confidence,
            'timestamp': firestore.SERVER_TIMESTAMP
        }
        doc_ref = db.collection('predictions').add(doc)

        # Log to console
        print(f"Feedback: {feedback_text}")
        print(f"Prediction: {prediction}")
        print(f"Confidence: {confidence}%")
        try:
            print(f"Saved to Firestore with ID: {doc_ref[1].id}")
        except Exception:
            pass

        # Calculate all probabilities for better UI display
        all_probabilities = {}
        try:
            probabilities = model.predict_proba(X)[0]
            classes = model.classes_
            for cls, prob in zip(classes, probabilities):
                all_probabilities[cls] = round(prob * 100, 2)
        except Exception:
            pass

        response = {
            "success": True,
            "prediction": prediction,
            "confidence": confidence,
            "feedback": feedback_text,
            "all_probabilities": all_probabilities,
            "processing_time_ms": 0  # Can be calculated if needed
        }
        try:
            response["firestore_id"] = doc_ref[1].id
        except Exception:
            pass

        return jsonify(response)

    except Exception as e:
        print(f"Error: {str(e)}")
        return jsonify({"error": str(e)}), 500

# ---- Run locally ----
if __name__ == '__main__':
    app.run(debug=True)

from flask import Flask, request, jsonify
from flask_cors import CORS
import joblib

# Initialize Flask app
app = Flask(__name__)
CORS(app)  # Enable CORS for frontend communication

# ---- Load trained model and vectorizer ----
model = joblib.load("textcat_model.pkl")
vectorizer = joblib.load("tfidf_vectorizer.pkl")

# ---- Define routes ----
@app.route('/')
def home():
    return "✅ Text Categorization API is running!"

@app.route('/predict', methods=['POST'])
def predict():
    try:
        data = request.get_json()
        feedback_text = data.get("feedback")

        if not feedback_text:
            return jsonify({"error": "No feedback text provided"}), 400

        # Convert text → TF-IDF → predict
        X = vectorizer.transform([feedback_text])
        prediction = model.predict(X)[0]
        
        # Get prediction probability for confidence
        probabilities = model.predict_proba(X)[0]
        max_prob = max(probabilities)
        confidence = round(max_prob * 100, 2)

        return jsonify({
            "prediction": prediction,
            "confidence": confidence,
            "feedback": feedback_text
        })

    except Exception as e:
        return jsonify({"error": str(e)}), 500

# ---- Run the app ----
if __name__ == "__main__":
    print("🚀 Starting Text Categorization API...")
    print("📊 Model loaded successfully!")
    app.run(debug=True, host="127.0.0.1", port=5000)
# test_model.py

import joblib

# Load saved model and vectorizer
model = joblib.load("textcat_model.pkl")
vectorizer = joblib.load("tfidf_vectorizer.pkl")

print("✅ Model and vectorizer loaded successfully!\n")

# Example new reviews (you can change these)
new_feedbacks = [
    "I love the new update, it works perfectly!",
    "The app keeps freezing whenever I upload an image.",
    "Please include payment via UPI.",
    "The subscription plans are too costly for students.",
    "Customer support resolved my issue quickly."
]

# Convert text to TF-IDF features
X_new = vectorizer.transform(new_feedbacks)

# Predict categories
predictions = model.predict(X_new)

print("🧾 Predicted Categories:\n")
for text, label in zip(new_feedbacks, predictions):
    print(f"Feedback: {text}\n→ Predicted Category: {label}\n")

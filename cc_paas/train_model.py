# train_model.py

import pandas as pd
from sklearn.model_selection import train_test_split
from sklearn.feature_extraction.text import TfidfVectorizer
from sklearn.naive_bayes import MultinomialNB
from sklearn.metrics import accuracy_score, classification_report
import joblib

# 1️⃣ Load dataset
df = pd.read_csv("customer_feedback.csv")

print("✅ Dataset loaded successfully!")
print(df.head(), "\n")

# 2️⃣ Split data
X = df['feedback_text']
y = df['category']

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2, random_state=42)

# 3️⃣ Convert text → numerical features using TF-IDF
vectorizer = TfidfVectorizer(stop_words='english', max_features=1000)
X_train_tfidf = vectorizer.fit_transform(X_train)
X_test_tfidf = vectorizer.transform(X_test)

# 4️⃣ Train a Naive Bayes model
model = MultinomialNB()
model.fit(X_train_tfidf, y_train)

# 5️⃣ Evaluate model
y_pred = model.predict(X_test_tfidf)
accuracy = accuracy_score(y_test, y_pred)

print("📊 Model Accuracy:", round(accuracy * 100, 2), "%\n")
print("🧾 Classification Report:\n", classification_report(y_test, y_pred))

# 6️⃣ Save model and vectorizer
joblib.dump(model, "textcat_model.pkl")
joblib.dump(vectorizer, "tfidf_vectorizer.pkl")

print("💾 Model and vectorizer saved successfully!")

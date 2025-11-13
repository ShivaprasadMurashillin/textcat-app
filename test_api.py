import requests
import json

print("🧪 Testing Flask API...\n")

# Test 1: Health Check
try:
    response = requests.get("http://127.0.0.1:5000/health", timeout=5)
    print("✅ /health endpoint:")
    print(json.dumps(response.json(), indent=2))
    print()
except Exception as e:
    print(f"❌ /health failed: {e}\n")

# Test 2: Prediction
try:
    test_text = "The app crashes when I try to upload files. Getting 404 error."
    response = requests.post(
        "http://127.0.0.1:5000/predict",
        json={"text": test_text},
        timeout=5
    )
    print("✅ /predict endpoint:")
    print(f"Input: {test_text}")
    print(f"Response: {json.dumps(response.json(), indent=2)}")
except Exception as e:
    print(f"❌ /predict failed: {e}")

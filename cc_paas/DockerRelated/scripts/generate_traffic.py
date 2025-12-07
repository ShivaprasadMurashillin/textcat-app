import requests
import time

feedbacks = [
    'The app crashes when I click submit',
    'Please add dark mode feature',
    'Your pricing is too high',
    'Great application, love it!',
    'Terrible experience, very slow',
    'Bug in the login form',
    'Need better documentation',
    'Too expensive for small teams',
    'Excellent customer support!',
    'Very disappointed with performance'
]

print("Generating traffic to populate Grafana dashboard...")
print("=" * 60)

for i in range(100):
    feedback = feedbacks[i % len(feedbacks)]
    try:
        response = requests.post(
            'http://localhost:5000/predict',
            json={'feedback': feedback}
        )
        result = response.json()
        print(f"Request {i+1}/100: {result.get('category', 'Error')}")
        time.sleep(0.1)
    except Exception as e:
        print(f"Request {i+1}/100: Error - {e}")

print("=" * 60)
print("Traffic generation complete!")
print("\nNow open Grafana at: http://localhost:3000")
print("Username: admin")
print("Password: admin")
print("Dashboard: Text Categorization Monitoring")

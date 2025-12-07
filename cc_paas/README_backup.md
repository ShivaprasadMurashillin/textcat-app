# Text Categorization System 🧾

> AI-powered customer feedback analysis system using Machine Learning, Render, and Netlify

[![Render](https://img.shields.io/badge/Render-Backend-purple?style=flat&logo=render)](https://render.com/)
[![Netlify](https://img.shields.io/badge/Netlify-Frontend-00C7B7?style=flat&logo=netlify)](https://www.netlify.com/)
[![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat&logo=python)](https://www.python.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.3.2-orange?style=flat&logo=scikit-learn)](https://scikit-learn.org/)
[![License](https://img.shields.io/badge/license-MIT-green)](LICENSE)

**Live Demo:** [https://wonderful-truffle-84e414.netlify.app](https://wonderful-truffle-84e414.netlify.app)

---

## 📋 Overview

Automated text categorization system that classifies customer feedback into 5 actionable categories:

- 🐛 **Bug Report** - Technical issues and system errors
- 💡 **Feature Request** - Suggestions for new functionality  
- 💰 **Pricing Complaint** - Cost and billing concerns
- ✅ **Positive Feedback** - Satisfied customer experiences
- 😞 **Negative Experience** - Poor service or usability issues

**Model Accuracy**: 87.23% on 500 labeled customer reviews

---

## 🏗️ Architecture

### Production Stack
```
┌─────────────────────────────────────────────────────────┐
│              Netlify + Render Architecture               │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  Frontend (Netlify CDN)                                 │
│  https://wonderful-truffle-84e414.netlify.app           │
│                    │                                     │
│                    │ HTTPS API Calls                     │
│                    ▼                                     │
│  Backend API (Render Web Service)                       │
│  https://textcat-app.onrender.com                       │
│                    │                                     │
│                    ├──▶ ML Model (Naive Bayes)          │
│                    ├──▶ TF-IDF Vectorizer               │
│                    │                                     │
│                    ▼                                     │
│  Database (Render PostgreSQL)                           │
│  • User feedback storage                                │
│  • Classification history                               │
│  • Analytics data                                       │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

### Local Development
```
Frontend (HTML/CSS/JS) ──▶ Flask API ──▶ Local Storage
         Port 8080          Port 5000     (Browser)
                               │
                               ├──▶ ML Model (Naive Bayes)
                               └──▶ TF-IDF Vectorizer
```

---

## ⚡ Quick Start

### Local Development

```bash
# 1. Clone repository
git clone https://github.com/ShivaprasadMurashillin/textcat-app.git
cd textcat-app
cd text-categorization

# 2. Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# source .venv/bin/activate  # Mac/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Start Flask backend
python app.py

# 5. Start frontend (new terminal)
cd frontend
python -m http.server 8080

# 6. Open browser
# http://localhost:8080
```

### Docker Deployment

```bash
# Build and run with Docker Compose
docker-compose up -d

# Access application
# Frontend: http://localhost:8080
# Backend: http://localhost:5000
```

---

## 🚀 Firebase Cloud Deployment

See detailed instructions in [DEPLOYMENT.md](DEPLOYMENT.md)

### Quick Deploy

```bash
# 1. Install Firebase CLI
npm install -g firebase-tools

# 2. Login to Firebase
firebase login

# 3. Upload ML models
python scripts/upload_models.py

# 4. Deploy everything
firebase deploy

# Your app is live! 🎉
# https://your-project.web.app
```

---

## 📁 Project Structure

```
text-categorization/
├── functions/                    # Firebase Cloud Functions
│   ├── main.py                  # Serverless backend
│   └── requirements.txt         # Python dependencies
├── public/                      # Frontend (Firebase Hosting)
│   ├── index.html              # UI
│   ├── script.js               # Client logic
│   └── style.css               # Styling
├── scripts/                     # Utility scripts
│   └── upload_models.py        # Upload models to Cloud Storage
├── .github/workflows/          # CI/CD pipelines
│   └── deploy.yml              # GitHub Actions
├── app.py                      # Flask API (local dev)
├── train_model.py              # ML model training
├── customer_reviews_dataset.csv # Training data (500 samples)
├── textcat_model.pkl           # Trained classifier
├── tfidf_vectorizer.pkl        # Text vectorizer
├── Dockerfile                  # Container image
├── docker-compose.yml          # Multi-container setup
├── firebase.json               # Firebase configuration
├── firestore.rules             # Database security rules
├── storage.rules               # Storage security rules
└── DEPLOYMENT.md              # Deployment guide
```

---

## 🎯 Features

### Current Implementation

- ✅ **Machine Learning**
  - Naive Bayes classifier with TF-IDF
  - 87.23% accuracy on test set
  - 5 balanced categories
  - Confidence scores

- ✅ **Backend API**
  - Flask REST API
  - Firebase Firestore integration
  - CORS enabled
  - Error handling and logging

- ✅ **Frontend**
  - Responsive web interface
  - Real-time classification
  - Category-specific styling
  - Confidence visualization

- ✅ **Cloud Integration**
  - Firebase Cloud Functions
  - Automatic scaling
  - Cloud Storage for models
  - Firestore database

### Production Features

- ✅ **Security**
  - Input validation and sanitization
  - Firestore security rules
  - Storage security rules
  - Rate limiting ready

- ✅ **Monitoring**
  - Health check endpoints
  - Structured logging
  - Performance metrics
  - Error tracking

- ✅ **DevOps**
  - Docker containerization
  - CI/CD with GitHub Actions
  - Automated testing
  - Environment management

---

## 📊 API Documentation

### Predict Endpoint

**POST** `/api/predict`

Request:
```json
{
  "feedback": "The app crashes when I try to login"
}
```

Response:
```json
{
  "success": true,
  "prediction": "Bug Report",
  "confidence": 89.45,
  "all_probabilities": {
    "Bug Report": 89.45,
    "Negative Experience": 7.32,
    "Feature Request": 1.89,
    "Pricing Complaint": 0.87,
    "Positive Feedback": 0.47
  },
  "metadata": {
    "icon": "🐛",
    "color": "#e74c3c",
    "priority": "high",
    "description": "Technical issues or system errors"
  },
  "processing_time_ms": 145.23,
  "firestore_id": "abc123xyz",
  "timestamp": "2025-11-12T10:30:00Z"
}
```

### Health Check

**GET** `/api/health`

Response:
```json
{
  "status": "healthy",
  "service": "text-categorization-api",
  "version": "1.0.0",
  "models_status": "loaded",
  "firestore_status": "connected",
  "timestamp": "2025-11-12T10:30:00Z"
}
```

---

## 🧪 Testing

```bash
# Run local tests
pytest functions/tests/

# Test API endpoint
curl -X POST http://localhost:5000/predict \
  -H "Content-Type: application/json" \
  -d '{"feedback": "Great service!"}'

# Test health check
curl http://localhost:5000/
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file:

```env
FLASK_ENV=production
FLASK_DEBUG=False
FIREBASE_PROJECT_ID=your-project-id
MODEL_BUCKET=your-project.appspot.com
```

### Firebase Configuration

Update `.firebaserc`:

```json
{
  "projects": {
    "default": "your-project-id"
  }
}
```

---

## 📈 Performance Metrics

| Metric | Value |
|--------|-------|
| Model Accuracy | 87.23% |
| Average Prediction Time | ~150ms |
| Cold Start Time | ~2-3s |
| Warm Start Time | ~100-200ms |
| Max Throughput | ~50 req/sec |

---

## 🛣️ Roadmap

### Phase 1: Firebase PaaS ✅
- [x] Cloud Functions backend
- [x] Firebase Hosting
- [x] Firestore database
- [x] Cloud Storage for models
- [x] CI/CD pipeline

### Phase 2: Advanced Features 🚧
- [ ] User authentication
- [ ] Admin dashboard
- [ ] Analytics and insights
- [ ] Batch processing API
- [ ] Multi-language support

### Phase 3: IaaS Migration 📋
- [ ] AWS EC2 deployment
- [ ] Azure VM deployment
- [ ] Kubernetes orchestration
- [ ] Multi-region setup
- [ ] Advanced monitoring

### Phase 4: ML Improvements 📋
- [ ] Fine-tuned BERT model
- [ ] Active learning pipeline
- [ ] A/B testing framework
- [ ] Model versioning
- [ ] Explainable AI

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

---

## 👨‍💻 Author

**Your Name**
- GitHub: [@yourusername](https://github.com/yourusername)
- LinkedIn: [Your LinkedIn](https://linkedin.com/in/yourprofile)
- Email: your.email@example.com

---

## 🙏 Acknowledgments

- scikit-learn for ML capabilities
- Firebase for cloud infrastructure
- Dataset contributors
- Open source community

---

## 📞 Support

- 📖 [Documentation](DEPLOYMENT.md)
- 🐛 [Issue Tracker](https://github.com/yourusername/text-categorization/issues)
- 💬 [Discussions](https://github.com/yourusername/text-categorization/discussions)

---

**⭐ If this project helped you, please give it a star!**

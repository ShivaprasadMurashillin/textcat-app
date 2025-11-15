# Text Categorization System 🧾

> AI-powered customer feedback analysis system using Machine Learning, Render, and Netlify

[![Render](https://img.shields.io/badge/Render-Backend-purple?style=flat&logo=render)](https://render.com/)
[![Netlify](https://img.shields.io/badge/Netlify-Frontend-00C7B7?style=flat&logo=netlify)](https://www.netlify.com/)
[![Python](https://img.shields.io/badge/Python-3.11-blue?style=flat&logo=python)](https://www.python.org/)
[![scikit-learn](https://img.shields.io/badge/scikit--learn-1.3.2-orange?style=flat&logo=scikit-learn)](https://scikit-learn.org/)

**Live Demo:** [https://textcat.netlify.app](https://textcat.netlify.app)

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

### Production Stack (Render + Netlify)

```
┌──────────────────────────────────────────────────────────────┐
│              Netlify + Render Architecture                    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Frontend (Netlify CDN)                                │ │
│  │  https://textcat.netlify.app                           │ │
│  │  • Single & Batch Analysis                             │ │
│  │  • Dark Mode UI                                        │ │
│  │  • CSV Upload & Export                                 │ │
│  │  • Real-time Statistics                                │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                   │
│                           │ HTTPS API Calls                   │
│                           ▼                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Backend API (Render Web Service)                      │ │
│  │  https://textcat-app.onrender.com                      │ │
│  │  • Flask REST API                                      │ │
│  │  • ML Model (Naive Bayes)                              │ │
│  │  • TF-IDF Vectorizer                                   │ │
│  │  • Health Check Endpoint                               │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                   │
│                           │                                   │
│                           ▼                                   │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Database (Render PostgreSQL)                          │ │
│  │  • User feedback storage                               │ │
│  │  • Classification history                              │ │
│  │  • Analytics data                                      │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                               │
└──────────────────────────────────────────────────────────────┘
```

### Local Development

```
Frontend (HTML/CSS/JS) ──▶ Flask API (Port 5000) ──▶ Local Storage
         Port 8080                │                    (Browser)
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

# 2. Create virtual environment
python -m venv .venv
.venv\Scripts\activate  # Windows
# OR
source .venv/bin/activate  # macOS/Linux

# 3. Install dependencies
pip install -r requirements.txt

# 4. Train the model (if needed)
python train_model.py

# 5. Run Flask backend
python app.py
# Backend will run on http://localhost:5000

# 6. Open frontend (in a new terminal)
cd frontend
# Open index.html in a browser, or use:
python -m http.server 8080
# Frontend will run on http://localhost:8080
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

## 📁 Project Structure

```
textcat-app/
├── frontend/                 # Netlify deployment
│   ├── index.html           # Main UI with batch analysis
│   ├── style.css            # Dark mode + responsive design
│   ├── script.js            # App logic + CSV upload
│   └── sample_feedbacks.csv # Example CSV for testing
│
├── app.py                   # Flask API (Render deployment)
├── train_model.py           # Model training script
├── textcat_model.pkl        # Trained Naive Bayes model
├── tfidf_vectorizer.pkl     # TF-IDF vectorizer
├── customer_feedback.csv    # Training dataset (500 samples)
│
├── requirements.txt         # Python dependencies
├── runtime.txt              # Python version for Render
├── render.yaml              # Render deployment config
├── Procfile                 # Render startup command
├── Dockerfile               # Docker configuration
├── docker-compose.yml       # Docker Compose setup
└── README.md                # This file
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
  - Flask REST API on Render
  - PostgreSQL database integration
  - CORS enabled for cross-origin requests
  - Error handling and logging
  - Health check endpoint

- ✅ **Frontend**
  - Responsive web interface
  - Dark mode with deep blue/purple theme
  - Single and batch analysis modes
  - CSV file upload for batch processing
  - Real-time classification
  - Category-specific styling with emojis
  - Confidence visualization
  - History tracking with localStorage

- ✅ **Batch Analysis**
  - Process up to 100 feedbacks at once
  - Progress tracking with animated progress bar
  - Comprehensive statistics dashboard
  - Interactive charts (category distribution, confidence levels)
  - Individual result cards with details
  - Export options: CSV, JSON, Copy Summary, Copy All Results

- ✅ **Cloud Integration**
  - Render Web Services for API hosting
  - Render PostgreSQL for database
  - Netlify CDN for frontend delivery
  - Automatic scaling
  - GitHub auto-deploy

### Security

- ✅ Input validation and sanitization
- ✅ CORS configuration
- ✅ Rate limiting ready
- ✅ Secure database connections

### Monitoring

- ✅ Health check endpoints
- ✅ Structured logging
- ✅ Error tracking

---

## 📈 Performance Metrics

| Metric | Value |
|--------|-------|
| Model Accuracy | 87.23% |
| Average Prediction Time | ~150ms |
| Cold Start Time (Render) | ~2-3s |
| Warm Start Time | ~100-200ms |
| Max Throughput | ~50 req/sec |

---

## 🛣️ Roadmap

### Phase 1: Production Deployment ✅
- [x] Render backend deployment
- [x] Netlify frontend hosting
- [x] PostgreSQL database
- [x] CI/CD pipeline (GitHub auto-deploy)
- [x] Dark mode UI
- [x] Batch analysis feature
- [x] CSV upload and export

### Phase 2: Advanced Features 🚧
- [ ] User authentication
- [ ] Admin dashboard
- [ ] Analytics and insights
- [ ] Email notifications
- [ ] Multi-language support
- [ ] API rate limiting

### Phase 3: ML Improvements 📋
- [ ] Fine-tuned BERT model
- [ ] Active learning pipeline
- [ ] A/B testing framework
- [ ] Model versioning
- [ ] Explainable AI (LIME/SHAP)

### Phase 4: Scale & Performance 📋
- [ ] Redis caching
- [ ] Load balancing
- [ ] Multi-region deployment
- [ ] Advanced monitoring (Datadog/New Relic)
- [ ] Kubernetes orchestration

---

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Commit changes: `git commit -m 'Add amazing feature'`
4. Push to branch: `git push origin feature/amazing-feature`
5. Open a Pull Request

---

## 👨‍💻 Team

**Built by:**
- **Shivaprasad** - Project Lead & ML Engineer
- **Vaishnavi** - Frontend Developer
- **Bhavana** - Backend Developer

**GitHub:** [@ShivaprasadMurashillin](https://github.com/ShivaprasadMurashillin)

---

## 🙏 Acknowledgments

- scikit-learn for ML capabilities
- Render for cloud infrastructure
- Netlify for CDN hosting
- Dataset contributors
- Open source community

---

**⭐ If this project helped you, please give it a star!**

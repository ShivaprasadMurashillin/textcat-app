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

### Production Stack (Render + Netlify)

```
┌──────────────────────────────────────────────────────────────┐
│              Netlify + Render Architecture                    │
├──────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  Frontend (Netlify CDN)                                │ │
│  │  https://wonderful-truffle-84e414.netlify.app          │ │
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

## 🚀 Deployment

### Prerequisites
- GitHub account
- Render account (for backend + database)
- Netlify account (for frontend)

### Deploy Backend to Render

1. **Connect GitHub Repository**
   - Go to [Render Dashboard](https://dashboard.render.com/)
   - Click "New +" → "Web Service"
   - Connect your GitHub repository: `ShivaprasadMurashillin/textcat-app`

2. **Configure Web Service**
   ```
   Name: textcat-app
   Environment: Python 3
   Build Command: pip install -r requirements.txt
   Start Command: gunicorn app:app
   ```

3. **Set Environment Variables**
   ```
   FLASK_ENV=production
   DATABASE_URL=<your-render-postgres-url>
   ```

4. **Create PostgreSQL Database**
   - In Render Dashboard → "New +" → "PostgreSQL"
   - Name: `textcat-database`
   - Copy the Internal Database URL
   - Add it to your web service environment variables as `DATABASE_URL`

5. **Deploy**
   - Render will automatically build and deploy
   - Your API will be live at: `https://textcat-app.onrender.com`

### Deploy Frontend to Netlify

1. **Connect GitHub Repository**
   - Go to [Netlify Dashboard](https://app.netlify.com/)
   - Click "Add new site" → "Import an existing project"
   - Choose GitHub and select: `ShivaprasadMurashillin/textcat-app`

2. **Configure Build Settings**
   ```
   Base directory: frontend
   Build command: (leave empty)
   Publish directory: .
   ```

3. **Set Environment Variables** (optional)
   ```
   API_URL=https://textcat-app.onrender.com
   ```

4. **Deploy**
   - Netlify will automatically deploy
   - Your app will be live at: `https://wonderful-truffle-84e414.netlify.app`

5. **Auto-Deploy on Git Push**
   - Both Render and Netlify watch the `main` branch
   - Automatic deployments on every `git push`

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
  "timestamp": "2025-01-12T10:30:00Z"
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
  "timestamp": "2025-01-12T10:30:00Z"
}
```

---

## 🧪 Testing

```bash
# Test locally
python app.py

# Test API endpoint
curl -X POST http://localhost:5000/api/predict \
  -H "Content-Type: application/json" \
  -d '{"feedback": "Great service!"}'

# Test health check
curl http://localhost:5000/api/health

# Test production API
curl -X POST https://textcat-app.onrender.com/api/predict \
  -H "Content-Type: application/json" \
  -d '{"feedback": "App is very slow"}'
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file for local development:

```env
FLASK_ENV=development
FLASK_DEBUG=True
DATABASE_URL=postgresql://user:password@localhost/textcat_db
```

For production (Render):
```env
FLASK_ENV=production
DATABASE_URL=<render-postgres-url>
```

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

## 📝 License

This project is licensed under the MIT License - see [LICENSE](LICENSE) file for details.

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

## 📞 Support

- 📖 [Documentation](DEPLOYMENT.md)
- 🐛 [Issue Tracker](https://github.com/ShivaprasadMurashillin/textcat-app/issues)
- 💬 [Discussions](https://github.com/ShivaprasadMurashillin/textcat-app/discussions)

---

**⭐ If this project helped you, please give it a star!**

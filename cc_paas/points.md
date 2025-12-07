# Review Preparation Points

## 1. Cloud Service Models (IaaS vs PaaS)
- **Infrastructure as a Service (IaaS)**: Cloud provider gives virtualized compute, storage, networking. You manage OS, runtime, app. Examples: AWS EC2, Azure Virtual Machines, Google Compute Engine, DigitalOcean Droplets.
- **Platform as a Service (PaaS)**: Cloud provider manages infrastructure + runtime + scaling. You focus on code and configuration. Examples: Render, Heroku, AWS Elastic Beanstalk, Google App Engine, Azure App Service.
- **Our deployment**: Backend on **Render Web Service** (PaaS) + database on **Render PostgreSQL** (managed DB service, also PaaS). Frontend on **Netlify** (PaaS for static hosting). Therefore overall solution is primarily PaaS-based.

## 2. Project Overview
- **Title**: Text Categorization System – AI-powered customer-feedback analysis.
- **Problem Statement**: Customer support teams receive massive amounts of feedback. Manually tagging every comment into actionable categories is slow, inconsistent, and expensive.
- **Solution**: End-to-end ML pipeline that automatically classifies feedback into 5 meaningful categories (Bug Report, Feature Request, Pricing Complaint, Positive Feedback, Negative Experience) with confidence scores, batch analysis, CSV exports, insights, and dark-mode friendly UI.
- **Inspiration**: Real product teams struggle to prioritize user feedback. We wanted a lightweight tool that founders, support leads, and product managers can plug into their workflow without hiring a full data team.

## 3. Backend Deep Dive
- **Stack**: Python 3.11, Flask REST API, scikit-learn model, joblib for model persistence, psycopg2 for PostgreSQL access.
- **Hosting**: Flask API deployed on **Render**. Database also hosted on Render (managed PostgreSQL). Render handles SSL, process monitoring, auto-redeploys from GitHub.
- **Workflow**:
  1. Frontend sends POST `/predict` with `feedback` text.
  2. Flask loads pre-trained TF-IDF vectorizer + Multinomial Naive Bayes model (cached in memory).
  3. Text is validated (length, empty checks), vectorized, and classified.
  4. Response returns predicted category, confidence %, all category probabilities, timestamp.
  5. Result is stored in Render PostgreSQL (`predictions` table) for analytics/roadmap features.
- **Model Training**:
  - Dataset: `customer_feedback.csv` (500 labeled records).
  - Preprocessing: TF-IDF vectorizer with max 1000 features, English stop-words removed.
  - Algorithm: Multinomial Naive Bayes (accurate + fast for sparse text data).
  - Accuracy: 87.23% on hold-out test set (train/test split 80/20).
  - Script: `train_model.py` handles loading data, vectorization, training, evaluation, saving `.pkl` artifacts.
- **Output Example**:
```json
{
  "prediction": "Bug Report",
  "confidence": 89.45,
  "all_probabilities": {
    "Bug Report": 89.45,
    "Negative Experience": 7.32,
    "Feature Request": 1.89,
    "Pricing Complaint": 0.87,
    "Positive Feedback": 0.47
  }
}
```

## 4. Frontend Deep Dive
- **Stack**: Vanilla HTML/CSS/JavaScript (no frameworks). Deployed on **Netlify** (`https://textcat.netlify.app`).
- **Key Features**:
  - Single feedback classification with live character count, keyboard shortcuts (Ctrl+Enter).
  - Batch analysis mode (up to 100 feedbacks) with CSV upload, progress tracking, statistics dashboard (counts, confidence tiers, insights), export to CSV/JSON/copy clipboard.
  - Dark mode with smooth transitions and deep blue/purple palette.
  - Example chips, random example generator, copy result, history (localStorage), API health indicator.
  - Accessibility: ARIA labels, responsive design, mobile-friendly layout.
- **Workflow on “Classify Feedback”**:
  1. User enters feedback and clicks **Classify Feedback**.
  2. JS sends `fetch` POST to Render API `/predict`.
  3. Shows loading spinner while waiting.
  4. Receives JSON, updates UI with category card (emoji, color), confidence ring, probability list.
  5. Saves entry to local history for quick re-use.
  6. For batch mode, iterates through entries sequentially with rate limiting, updates progress bar, builds stats summary.
- **Understanding Scores**:
  - **Prediction**: Category with highest probability.
  - **Confidence %**: Probability of that category (0–100%). High (>80%) = strong signal, Medium (50–80%) = moderate, Low (<50%) = needs human review.
  - **All probabilities**: Show model certainty across all categories; helpful when two categories are close.

## 5. Real-World Use Cases
- Triage Zendesk / Intercom tickets into product backlog automatically.
- Identify top pain points or pricing complaints week over week.
- Provide customer success teams with quick summaries for leadership.
- Batch-analyze survey responses, app-store reviews, or beta feedback.
- Export structured insights to spreadsheets, BI dashboards, or CRM systems.

## 6. End-to-End Flow Summary
1. User visits Netlify site → selects mode (single/batch).
2. Enters feedback → clicks classify.
3. Frontend validates input, calls Render API.
4. Flask processes text, runs ML model, saves record, responds with JSON.
5. Frontend renders card + charts, updates history/localStorage, enables copy/export.
6. If batch mode, same loop repeats with progress tracking and aggregated stats.

## 7. Conclusion Points
- Fully PaaS-based deployment ensures fast iteration without managing servers.
- Lightweight but production-ready ML workflow: training script, API, database, responsive UI.
- Real-time + batch capabilities make it suitable for startups and enterprise teams.
- Extensible roadmap: add sentiment analysis, user authentication, admin dashboards, advanced analytics.
- Demonstrates complete lifecycle: data collection → training → inference → visualization → export.

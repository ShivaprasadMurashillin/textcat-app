# 🚀 Firebase Deployment Guide

## Text Categorization System - Production Deployment

This guide will walk you through deploying your ML-powered text categorization system to Firebase Cloud Platform.

---

## 📋 Prerequisites

### Required Tools
- **Node.js** (v18+) and npm
- **Python** (3.12+)
- **Firebase CLI**: `npm install -g firebase-tools`
- **Git** for version control

### Required Accounts
- Firebase/Google Cloud account
- GitHub account (for CI/CD)

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────────┐
│                     FIREBASE CLOUD PLATFORM                  │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐    ┌─────────────────┐   ┌──────────────┐ │
│  │   Firebase   │    │  Cloud Storage  │   │  Firestore   │ │
│  │   Hosting    │───▶│   (ML Models)   │──▶│  (Database)  │ │
│  │  (Frontend)  │    │                 │   │              │ │
│  └──────────────┘    └─────────────────┘   └──────────────┘ │
│         │                     │                              │
│         │                     │                              │
│         ▼                     ▼                              │
│  ┌────────────────────────────────────────────┐             │
│  │      Firebase Cloud Functions              │             │
│  │   (Python Runtime - Serverless Backend)    │             │
│  │                                             │             │
│  │  • /predict - Text categorization          │             │
│  │  • /health  - Health check endpoint        │             │
│  │  • Auto-scaling & Load balancing           │             │
│  └────────────────────────────────────────────┘             │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📦 Step 1: Initial Setup

### 1.1 Install Firebase CLI

```bash
npm install -g firebase-tools
```

### 1.2 Login to Firebase

```bash
firebase login
```

### 1.3 Initialize Firebase Project

```bash
# In your project root (c:\cc)
firebase init

# Select these features:
# ☑ Functions: Configure a Cloud Functions directory
# ☑ Firestore: Configure Firestore rules and indexes
# ☑ Hosting: Configure files for Firebase Hosting
# ☑ Storage: Configure storage rules

# Configuration options:
# - Language: Python
# - Use existing project: text-cat-feedback
# - Public directory: public
# - Single-page app: No
# - GitHub Actions: Yes (optional)
```

### 1.4 Update Firebase Project ID

Edit `.firebaserc` and update your project ID:

```json
{
  "projects": {
    "default": "YOUR-PROJECT-ID"
  }
}
```

---

## 🔑 Step 2: Configure Firebase Credentials

### 2.1 Generate Service Account Key

1. Go to [Firebase Console](https://console.firebase.google.com/)
2. Select your project
3. Go to **Project Settings** → **Service Accounts**
4. Click **Generate New Private Key**
5. Save the JSON file as `serviceAccountKey.json` in your project root

⚠️ **Security**: Never commit this file to Git! It's already in `.gitignore`.

### 2.2 Update Config in Cloud Function

Edit `functions/main.py` if needed:

```python
CONFIG = {
    'model_bucket': 'YOUR-PROJECT-ID.appspot.com',  # Update this
    # ... rest of config
}
```

---

## 📤 Step 3: Upload ML Models to Cloud Storage

### 3.1 Run the Upload Script

```bash
# Make sure your models are in the root directory:
# - textcat_model.pkl
# - tfidf_vectorizer.pkl

python scripts/upload_models.py
```

Expected output:
```
🚀 Starting model upload to Cloud Storage...
📦 Bucket: your-project.appspot.com
──────────────────────────────────────────────────────
✅ Firebase Admin initialized
✅ Connected to bucket: your-project.appspot.com

📤 Uploading: textcat_model.pkl
   Size: 0.45 MB
   Destination: gs://your-project.appspot.com/models/textcat_model.pkl
   ✅ Upload successful!

📤 Uploading: tfidf_vectorizer.pkl
   Size: 1.23 MB
   Destination: gs://your-project.appspot.com/models/tfidf_vectorizer.pkl
   ✅ Upload successful!

══════════════════════════════════════════════════════
🎉 All models uploaded successfully!
```

### 3.2 Verify Upload

```bash
python scripts/upload_models.py --verify
```

---

## 🚀 Step 4: Deploy to Firebase

### 4.1 Deploy Everything

```bash
firebase deploy
```

This deploys:
- ✅ Cloud Functions (backend API)
- ✅ Hosting (frontend)
- ✅ Firestore rules
- ✅ Storage rules

### 4.2 Deploy Specific Components

```bash
# Deploy only functions
firebase deploy --only functions

# Deploy only hosting
firebase deploy --only hosting

# Deploy only firestore rules
firebase deploy --only firestore:rules

# Deploy only storage rules
firebase deploy --only storage:rules
```

---

## 🧪 Step 5: Test Your Deployment

### 5.1 Check Hosting URL

Firebase will provide URLs like:
- **Hosting**: `https://YOUR-PROJECT-ID.web.app`
- **Cloud Function**: `https://us-central1-YOUR-PROJECT-ID.cloudfunctions.net/predict`

### 5.2 Test Health Endpoint

```bash
curl https://YOUR-PROJECT-ID.web.app/api/health
```

Expected response:
```json
{
  "status": "healthy",
  "service": "text-categorization-api",
  "version": "1.0.0",
  "models_status": "loaded",
  "firestore_status": "connected",
  "timestamp": "2025-11-12T..."
}
```

### 5.3 Test Prediction Endpoint

```bash
curl -X POST https://YOUR-PROJECT-ID.web.app/api/predict \
  -H "Content-Type: application/json" \
  -d '{"feedback": "The app crashes when I login"}'
```

Expected response:
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
    "priority": "high"
  },
  "processing_time_ms": 145.23,
  "firestore_id": "abc123...",
  "timestamp": "2025-11-12T..."
}
```

### 5.4 Test Frontend

Open your browser and go to:
```
https://YOUR-PROJECT-ID.web.app
```

Try classifying some feedback text!

---

## 🔧 Step 6: Configure Custom Domain (Optional)

### 6.1 Add Custom Domain

```bash
firebase hosting:channel:deploy production --only hosting
```

1. Go to Firebase Console → Hosting
2. Click "Add custom domain"
3. Follow DNS configuration instructions
4. Wait for SSL certificate provisioning (can take up to 24 hours)

---

## 📊 Step 7: Monitor Your Deployment

### 7.1 View Logs

```bash
# View Cloud Functions logs
firebase functions:log

# Stream logs in real-time
firebase functions:log --only predict
```

### 7.2 Firebase Console

Go to [Firebase Console](https://console.firebase.google.com/) to monitor:

- **Functions**: Invocations, errors, execution time
- **Hosting**: Traffic, bandwidth usage
- **Firestore**: Document count, reads/writes
- **Storage**: File storage, bandwidth

### 7.3 Cloud Monitoring

Visit [Google Cloud Console](https://console.cloud.google.com/) → Monitoring for advanced metrics.

---

## 🔐 Step 8: Security Configuration

### 8.1 Update Firestore Rules

Edit `firestore.rules` for production:

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    match /predictions/{predictionId} {
      // Restrict read access
      allow read: if request.auth != null;
      allow create: if true;  // Cloud Functions can write
      allow update, delete: if request.auth.token.admin == true;
    }
  }
}
```

Deploy rules:
```bash
firebase deploy --only firestore:rules
```

### 8.2 Update CORS Configuration

Edit `functions/main.py`:

```python
CONFIG = {
    'cors_origins': ['https://your-domain.com'],  # Replace '*' with your domain
    # ...
}
```

---

## 🔄 Step 9: Set Up CI/CD (GitHub Actions)

### 9.1 Generate Firebase Token

```bash
firebase login:ci
```

Copy the generated token.

### 9.2 Add GitHub Secrets

Go to your GitHub repo → Settings → Secrets → Actions

Add these secrets:
- `FIREBASE_TOKEN`: Token from step 9.1
- `FIREBASE_SERVICE_ACCOUNT`: Contents of `serviceAccountKey.json`

### 9.3 Enable GitHub Actions

The workflow file is already created at `.github/workflows/deploy.yml`

Every push to `main` branch will trigger automatic deployment!

---

## 📈 Step 10: Scaling and Optimization

### 10.1 Adjust Cloud Function Resources

Edit `functions/main.py`:

```python
@https_fn.on_request(
    memory=options.MemoryOption.MB_1GB,  # Increase for large models
    timeout_sec=300,
    max_instances=100,  # Max concurrent instances
    min_instances=1     # Keep 1 warm instance
)
```

### 10.2 Enable Caching

Models are already cached in memory. For better performance:

1. Keep `min_instances=1` to avoid cold starts
2. Use Cloud CDN for static assets
3. Enable Firebase Performance Monitoring

---

## 🐛 Troubleshooting

### Issue: "Model loading failed"

**Solution**: Verify models are uploaded to Cloud Storage
```bash
python scripts/upload_models.py --verify
```

### Issue: "CORS error"

**Solution**: Update CORS origins in `functions/main.py`
```python
CONFIG = {
    'cors_origins': ['*']  # Or specific domain
}
```

### Issue: "Function timeout"

**Solution**: Increase timeout in function decorator
```python
@https_fn.on_request(timeout_sec=300)  # 5 minutes
```

### Issue: "Cold start latency"

**Solution**: Enable minimum instances
```python
@https_fn.on_request(min_instances=1)
```

---

## 💰 Cost Estimation

### Firebase Free Tier (Spark Plan)
- ✅ 125K Cloud Function invocations/month
- ✅ 10 GB bandwidth/month
- ✅ 1 GB Firestore storage
- ✅ 5 GB Cloud Storage

### Paid Plan (Blaze - Pay as you go)
**Estimated costs for 10,000 predictions/day:**

- Cloud Functions: ~$5-10/month
- Cloud Storage: ~$0.50/month
- Firestore: ~$2-5/month
- Hosting: ~$1/month

**Total: ~$10-20/month**

---

## 📚 Additional Resources

- [Firebase Documentation](https://firebase.google.com/docs)
- [Cloud Functions Python Guide](https://firebase.google.com/docs/functions/python)
- [Firestore Security Rules](https://firebase.google.com/docs/firestore/security/get-started)
- [Firebase CLI Reference](https://firebase.google.com/docs/cli)

---

## 🎉 Success Checklist

- [ ] Firebase CLI installed and logged in
- [ ] Service account key downloaded
- [ ] ML models uploaded to Cloud Storage
- [ ] Cloud Functions deployed
- [ ] Frontend deployed to Hosting
- [ ] Firestore and Storage rules deployed
- [ ] Health endpoint returning success
- [ ] Prediction endpoint working correctly
- [ ] Frontend loading and functional
- [ ] CI/CD pipeline configured (optional)
- [ ] Custom domain configured (optional)
- [ ] Monitoring and alerts set up

---

## 📞 Support

If you encounter issues:

1. Check Firebase Console logs
2. Review `firebase debug.log`
3. Test with Firebase emulators: `firebase emulators:start`
4. Check GitHub Issues for known problems

---

**🎊 Congratulations! Your ML text categorization system is now live on Firebase Cloud Platform!**

Next: Scale to IaaS (AWS/Azure) for enterprise deployment →

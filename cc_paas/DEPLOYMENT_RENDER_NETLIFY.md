# 🚀 Text Categorization System - Deployment Guide

## 📦 Project Structure
```
textcat-app/
├── app.py                          # Backend Flask API
├── requirements.txt                # Python dependencies
├── Procfile                        # Render start command
├── textcat_model.pkl              # Trained ML model
├── tfidf_vectorizer.pkl           # TF-IDF vectorizer
├── customer_reviews_dataset.csv    # Training data (optional)
├── frontend/                       # Frontend files
│   ├── index.html
│   ├── style.css
│   └── script.js
├── .gitignore
└── README.md
```

---

## 🎯 PHASE 1: Deploy Backend to Render

### Step 1: Prepare Git Repository

```bash
# Initialize git (if not already done)
git init

# Add all files
git add .

# Commit
git commit -m "Initial commit - Text Categorization System"

# Create GitHub repository and push
git remote add origin https://github.com/YOUR-USERNAME/textcat-app.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Render

1. **Go to** https://render.com and sign up/login
2. **Click** "New +" → "Web Service"
3. **Connect** your GitHub repository
4. **Configure:**
   - **Name**: `textcat-api` (or your choice)
   - **Environment**: `Python 3`
   - **Build Command**: `pip install -r requirements.txt`
   - **Start Command**: `gunicorn app:app` (already in Procfile)
   - **Plan**: Free (or paid for better performance)

5. **Environment Variables** (if needed):
   - For Firebase: Add `GOOGLE_APPLICATION_CREDENTIALS_JSON` with your serviceAccountKey.json content
   - Or remove Firebase code if not using it

6. **Click** "Create Web Service"

7. **Wait** for deployment (5-10 minutes)

8. **Copy** your Render URL: `https://textcat-api-xxxx.onrender.com`

### Step 3: Test Backend API

```bash
# Test health endpoint
curl https://textcat-api-xxxx.onrender.com/health

# Test prediction
curl -X POST https://textcat-api-xxxx.onrender.com/predict \
  -H "Content-Type: application/json" \
  -d '{"feedback":"The app crashes when I upload photos"}'
```

---

## 🎨 PHASE 2: Deploy Frontend to Netlify

### Step 1: Update Frontend API URL

Edit `frontend/script.js` line 8-10:

```javascript
const CONFIG = {
  API_BASE_URL: window.location.hostname === 'localhost' 
    ? 'http://127.0.0.1:5000'
    : 'https://textcat-api-xxxx.onrender.com',  // ← YOUR RENDER URL HERE
```

**Commit the change:**
```bash
git add frontend/script.js
git commit -m "Update API URL for production"
git push
```

### Step 2: Deploy to Netlify

#### Option A: Drag & Drop (Easiest)

1. **Go to** https://app.netlify.com
2. **Sign up/Login**
3. **Drag** the `frontend/` folder onto Netlify
4. **Done!** Your site is live at `https://random-name-12345.netlify.app`

#### Option B: Git Integration (Recommended)

1. **Go to** https://app.netlify.com
2. **Click** "Add new site" → "Import an existing project"
3. **Connect** GitHub → Select your repository
4. **Configure:**
   - **Base directory**: `frontend`
   - **Build command**: (leave empty)
   - **Publish directory**: `.` (or leave empty)
5. **Deploy**

### Step 3: Custom Domain (Optional)

1. In Netlify dashboard → **Domain settings**
2. Click **"Add custom domain"**
3. Follow instructions to configure DNS

---

## 🧪 PHASE 3: Test Your Deployed App

### Test Checklist

- [ ] Backend health check: `https://YOUR-RENDER-URL/health`
- [ ] Backend prediction: Test with curl or Postman
- [ ] Frontend loads: Visit your Netlify URL
- [ ] Frontend → Backend: Click example chips and test classification
- [ ] Dark mode toggle works
- [ ] History saves and loads correctly
- [ ] Copy to clipboard works
- [ ] All 5 example buttons work

---

## 🔧 Troubleshooting

### Backend Issues

**Error: "Application failed to start"**
- Check Render logs
- Verify `requirements.txt` has all dependencies
- Ensure `Procfile` exists with correct command

**Error: "Module not found"**
- Add missing module to `requirements.txt`
- Redeploy

**Firebase errors:**
- Remove Firebase code if not using Firestore
- Or add Firebase credentials as environment variable

### Frontend Issues

**Error: "Failed to fetch"**
- Check if backend is running
- Verify CORS is enabled in `app.py` (flask-cors)
- Check API_BASE_URL in `script.js` is correct
- Check browser console (F12) for errors

**CORS Error:**
- Ensure `flask-cors` is installed
- Verify `CORS(app)` is in `app.py`

**Blank page:**
- Check browser console (F12)
- Verify all files (HTML, CSS, JS) deployed correctly
- Check Network tab for failed requests

---

## 📊 Performance Optimization

### Backend (Render)

```python
# Add caching for faster responses
from functools import lru_cache

@lru_cache(maxsize=100)
def predict_cached(feedback):
    X = vectorizer.transform([feedback])
    return model.predict(X)[0]
```

### Frontend (Netlify)

- Already optimized with:
  - Retry logic
  - Request timeouts
  - Loading states
  - Error handling
  - LocalStorage caching

---

## 💰 Cost Estimates

### Free Tier
- **Render**: 750 hours/month free (good for demo/testing)
- **Netlify**: 100GB bandwidth/month free
- **Total**: $0/month

### Paid Tier (Production)
- **Render**: $7/month (starter plan, always-on)
- **Netlify**: Free is usually enough
- **Total**: ~$7/month

---

## 🔐 Security Checklist

- [ ] Remove `serviceAccountKey.json` from git (in .gitignore)
- [ ] Use environment variables for secrets
- [ ] Enable HTTPS (automatic on Render & Netlify)
- [ ] Add rate limiting (optional)
- [ ] Input validation enabled in backend
- [ ] CORS configured for production domain only

---

## 🚀 Next Steps

1. **Monitor** your Render dashboard for usage
2. **Check** Netlify analytics
3. **Set up** custom domain (optional)
4. **Add** Google Analytics (optional)
5. **Scale** to paid tier if needed

---

## 📞 Support

### Render Issues
- Docs: https://render.com/docs
- Discord: https://render.com/discord

### Netlify Issues
- Docs: https://docs.netlify.com
- Support: https://answers.netlify.com

---

## ✅ Deployment Complete!

Your Text Categorization System is now live:
- **Backend API**: `https://YOUR-RENDER-URL.onrender.com`
- **Frontend**: `https://YOUR-NETLIFY-SITE.netlify.app`

**Total deployment time**: ~15-20 minutes

**Share your app** and start collecting feedback! 🎉

---

## 📝 Quick Commands Reference

```bash
# Local development
python app.py                          # Start backend
cd frontend && python -m http.server   # Start frontend

# Git deployment
git add .
git commit -m "Update"
git push

# Test API
curl https://YOUR-RENDER-URL/health
curl -X POST https://YOUR-RENDER-URL/predict -H "Content-Type: application/json" -d '{"feedback":"test"}'
```

---

## 🎯 Project Info

- **Model Accuracy**: 87.23%
- **Categories**: 5 (Bug Report, Feature Request, Pricing Complaint, Positive Feedback, Negative Experience)
- **Tech Stack**: Python, Flask, scikit-learn, HTML/CSS/JavaScript
- **ML Model**: Naive Bayes with TF-IDF vectorization

# ✅ Pre-Deployment Checklist

## Before You Deploy

### 1. Code Review
- [ ] `app.py` has all required endpoints (`/`, `/health`, `/predict`)
- [ ] CORS is enabled in `app.py` (flask-cors)
- [ ] Model files exist (`textcat_model.pkl`, `tfidf_vectorizer.pkl`)
- [ ] `requirements.txt` has all dependencies
- [ ] `Procfile` exists with correct command

### 2. Frontend Configuration
- [ ] `web-frontend/index.html` exists and loads
- [ ] `web-frontend/style.css` exists and loads
- [ ] `web-frontend/script.js` exists and loads
- [ ] API_BASE_URL in `script.js` will be updated after Render deployment

### 3. Git Setup
- [ ] `.gitignore` exists and excludes sensitive files
- [ ] `serviceAccountKey.json` is in `.gitignore` (if using Firebase)
- [ ] Virtual environment folders excluded (`.venv/`, `venv/`)
- [ ] `__pycache__/` excluded

### 4. Local Testing
- [ ] Backend runs locally: `python app.py`
- [ ] Health endpoint works: `curl http://127.0.0.1:5000/health`
- [ ] Predict endpoint works with sample data
- [ ] Frontend loads locally: `python -m http.server 8080` in `web-frontend/`
- [ ] Frontend → Backend communication works

---

## During Deployment

### Backend (Render)
- [ ] GitHub repo created and code pushed
- [ ] Render account created
- [ ] Web service created from GitHub repo
- [ ] Build command: `pip install -r requirements.txt`
- [ ] Start command: `gunicorn app:app`
- [ ] Environment: Python 3
- [ ] Deployment successful (check logs)
- [ ] Health endpoint accessible: `https://YOUR-URL/health`
- [ ] Predict endpoint works with test data

### Frontend (Netlify)
- [ ] Updated API_BASE_URL in `web-frontend/script.js` with Render URL
- [ ] Committed and pushed changes to GitHub
- [ ] Netlify account created
- [ ] Site deployed (drag-and-drop OR GitHub integration)
- [ ] Base directory set to `web-frontend/` (if using GitHub)
- [ ] Site loads without errors
- [ ] Browser console shows no errors (F12)

---

## After Deployment

### Testing
- [ ] Visit frontend URL
- [ ] API Status shows "🟢 Online"
- [ ] Click example chip → prediction appears
- [ ] Confidence score displays correctly
- [ ] All probabilities expand and show correctly
- [ ] Dark mode toggle works
- [ ] History saves and restores correctly
- [ ] Copy to clipboard works
- [ ] Character counter works
- [ ] Keyboard shortcut (Ctrl+Enter) works
- [ ] All 5 category types can be predicted

### Performance
- [ ] First request completes (may take 30-60s on Render free tier)
- [ ] Subsequent requests are fast (<2s)
- [ ] No CORS errors in console
- [ ] No network errors
- [ ] Loading spinner shows during prediction
- [ ] Error messages display correctly

### Optional Enhancements
- [ ] Custom domain configured (Netlify)
- [ ] SSL certificate active (automatic)
- [ ] Analytics added (Google Analytics, optional)
- [ ] Monitoring setup (UptimeRobot, optional)
- [ ] Upgraded to paid Render tier (for instant response)

---

## Troubleshooting Guide

### Issue: "Failed to fetch" on frontend
**Solutions:**
1. Check if Render backend is awake (visit health endpoint)
2. Verify API_BASE_URL in script.js matches Render URL
3. Check browser console for CORS errors
4. Ensure CORS is enabled in app.py

### Issue: Backend sleeping on Render
**Solutions:**
1. Wait 30-60 seconds for cold start
2. Upgrade to paid Render tier ($7/month)
3. Implement keep-alive ping (see documentation)

### Issue: Blank frontend page
**Solutions:**
1. Check browser console (F12) for JavaScript errors
2. Verify all files uploaded to Netlify
3. Check Network tab for 404 errors
4. Ensure script.js loads correctly

### Issue: "Application failed to start" on Render
**Solutions:**
1. Check Render build logs
2. Verify all dependencies in requirements.txt
3. Ensure Procfile has correct syntax
4. Check Python version compatibility

---

## Success Criteria

Your deployment is successful when:

✅ Backend health endpoint returns `{"status": "healthy"}`
✅ Backend predict endpoint classifies feedback correctly
✅ Frontend loads without errors
✅ Frontend can communicate with backend
✅ All UI features work (dark mode, history, copy, etc.)
✅ Model predictions are accurate
✅ Response times are acceptable

---

## Next Steps After Successful Deployment

1. Share your app URL with others
2. Monitor usage in Render and Netlify dashboards
3. Consider adding analytics
4. Collect user feedback
5. Plan improvements and new features
6. Consider scaling if needed

---

## Documentation References

- **Quick Start**: `DEPLOYMENT_QUICKSTART.md`
- **Full Guide**: `DEPLOYMENT_RENDER_NETLIFY.md`
- **Readiness Check**: Run `python check_deployment.py`

---

## Notes

- Render free tier spins down after 15 minutes of inactivity
- First request after sleep takes 30-60 seconds
- Netlify free tier is usually sufficient for most projects
- Keep serviceAccountKey.json secret (never commit to git)
- Model files (76.8 KB + 36.5 KB) are small enough for git

---

**Good luck with your deployment!** 🚀


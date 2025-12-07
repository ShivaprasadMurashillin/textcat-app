# Railway Deployment Guide

## Deploy Flask App to Railway (Free - No Credit Card)

### Step 1: Sign Up
1. Go to https://railway.app/
2. Click **Login with GitHub**
3. Authorize Railway to access your repos
4. You get **$5 free credit/month** (enough for your app)

### Step 2: Create New Project
1. Click **New Project**
2. Select **Deploy from GitHub repo**
3. Choose: `ShivaprasadMurashillin/textcat-app`
4. Railway will auto-detect your Dockerfile

### Step 3: Configure Environment Variables
1. Click your service → **Variables** tab
2. Add variable:
   - **Name**: `DATABASE_URL`
   - **Value**: `postgresql://textcat_user:4PO5g4iuFfFoo4XTH4jNOZj2h89zOebz@dpg-d4b1dongi27c73935vj0-a.singapore-postgres.render.com/predictions_t5kp`
3. Click **Add**

### Step 4: Deploy
1. Railway automatically starts building
2. Wait 3-5 minutes for deployment
3. Click **Settings** → **Generate Domain** to get public URL
4. Your Flask API will be live at: `https://your-app.up.railway.app`

### Step 5: Test Your Deployment
```bash
# Health check
curl https://your-app.up.railway.app/health

# Make a prediction
curl -X POST https://your-app.up.railway.app/predict \
  -H "Content-Type: application/json" \
  -d '{"feedback": "This app is amazing!"}'
```

### Step 6: Access Metrics Endpoint
Your Prometheus metrics will be available at:
`https://your-app.up.railway.app/metrics`

## Next Steps: Add Monitoring

### Option A: Grafana Cloud (Recommended - Free Forever)
1. Sign up at https://grafana.com/auth/sign-up/create-user (no card)
2. In Grafana Cloud, add Prometheus data source:
   - URL: `https://your-app.up.railway.app/metrics`
   - Type: Prometheus
3. Import your dashboard JSON
4. Done! Full monitoring stack in cloud

### Option B: Deploy Prometheus Separately
1. In Railway, click **New Service**
2. Deploy from Docker Hub: `prom/prometheus:latest`
3. Add config to scrape your Flask app
4. Connect to Grafana Cloud

## Railway Features
- ✅ Auto-deploy on git push
- ✅ Free SSL certificates
- ✅ View logs in real-time
- ✅ Automatic restarts on failures
- ✅ $5 free credit/month (renews monthly)

## Troubleshooting
- **Build fails?** Check logs in Railway dashboard
- **502 Bad Gateway?** App might be starting, wait 1-2 minutes
- **Environment variables not working?** Redeploy after adding variables
- **Out of memory?** Railway free tier has 512MB RAM limit

## Your App URLs (after deployment)
- **Flask API**: `https://textcat-app-production.up.railway.app`
- **Health Check**: `https://textcat-app-production.up.railway.app/health`
- **Metrics**: `https://textcat-app-production.up.railway.app/metrics`
- **Predictions**: POST to `https://textcat-app-production.up.railway.app/predict`

# 🚀 Deploy Docker Containers to Render Cloud
## Complete Guide for Grafana Dashboard Deployment

---

## 📋 Overview

You will deploy **3 separate Docker services** on Render (all FREE tier):

1. ✅ **Flask App** - Already deployed at `https://textcat-app.onrender.com`
2. 🆕 **Prometheus** - Metrics collection (scrapes Flask app)
3. 🆕 **Grafana** - Dashboard visualization (your professor will access this!)

---

## 🎯 What Your Professor Will See

**Final URL:** `https://textcat-grafana.onrender.com`

A live Grafana dashboard with 15 panels showing:
- Request rate, latency, total requests
- CPU & Memory usage
- ML predictions by category
- Database query performance
- Model inference times
- And more!

---

## 📁 Files Created

All deployment files are ready in:

```
DockerRelated/
├── render-prometheus/
│   ├── Dockerfile              # Prometheus container config
│   ├── prometheus.yml          # Scrapes your Flask app
│   └── render.yaml             # Render deployment config
│
└── render-grafana/
    ├── Dockerfile              # Grafana container config
    ├── render.yaml             # Render deployment config
    ├── provisioning/
    │   ├── datasources/
    │   │   └── datasource.yml  # Points to Prometheus
    │   └── dashboards/
    │       └── dashboard.yml   # Auto-load dashboards
    └── dashboards/
        └── enhanced-dashboard.json  # Your 15-panel dashboard
```

---

## 🚀 DEPLOYMENT STEPS

### **STEP 1: Deploy Prometheus Service**

1. **Go to Render Dashboard:** https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**
3. **Connect Repository:**
   - Click "Connect GitHub" (if not already connected)
   - Or choose "Deploy from Docker"
   
4. **If using GitHub:**
   - Select your repository
   - Service name: `textcat-prometheus`
   - Region: `Singapore`
   - Branch: `main`
   - Root Directory: `DockerRelated/render-prometheus`
   - Environment: `Docker`
   
5. **If manually deploying:**
   - Upload the `render-prometheus` folder
   
6. **Configuration:**
   - Plan: **Free**
   - Docker Command: (leave default, uses Dockerfile CMD)
   
7. Click **"Create Web Service"**

8. **Wait 3-5 minutes for deployment**

9. **Verify:**
   - Open `https://textcat-prometheus.onrender.com`
   - Should see Prometheus UI
   - Go to Status → Targets
   - Should show `flask-app` target as **UP**

---

### **STEP 2: Update Grafana Datasource URL**

⚠️ **IMPORTANT:** Update the datasource to use your actual Prometheus URL

1. Open `C:\ThirdYear\CC\DockerRelated\render-grafana\provisioning\datasources\datasource.yml`

2. Replace the URL line with your Prometheus service URL:
   ```yaml
   url: https://textcat-prometheus.onrender.com
   ```
   (Use the exact URL from Step 1)

3. Save the file

---

### **STEP 3: Deploy Grafana Service**

1. **Go to Render Dashboard:** https://dashboard.render.com
2. Click **"New +"** → **"Web Service"**

3. **If using GitHub:**
   - Select your repository
   - Service name: `textcat-grafana`
   - Region: `Singapore`
   - Branch: `main`
   - Root Directory: `DockerRelated/render-grafana`
   - Environment: `Docker`

4. **Configuration:**
   - Plan: **Free**
   - Docker Command: (leave default)

5. **Environment Variables:**
   - `GF_SECURITY_ADMIN_USER` = `admin`
   - `GF_SECURITY_ADMIN_PASSWORD` = `admin`
   - `PORT` = `3000`

6. Click **"Create Web Service"**

7. **Wait 3-5 minutes for deployment**

---

### **STEP 4: Access Grafana Dashboard**

1. **Open:** `https://textcat-grafana.onrender.com`

2. **Login:**
   - Username: `admin`
   - Password: `admin`

3. **Your dashboard should automatically load!**
   - Click **☰** (menu) → **Dashboards**
   - You should see "Enhanced Text Categorization Monitoring"
   - Click it to open

4. **Verify all 15 panels are showing data:**
   - Request Rate
   - Total Requests
   - Active Requests
   - Request Latency
   - Predictions by Category (pie chart)
   - Prediction Rate
   - Model Status
   - Model Inference Time
   - Predictions by Confidence Level
   - Average Confidence
   - Input Text Length
   - Memory Usage
   - CPU Usage
   - DB Query Latency
   - DB Operations

---

### **STEP 5: Generate Traffic to Show Live Metrics**

Since your Render app goes to sleep after inactivity, generate some traffic:

1. **Open PowerShell:**
   ```powershell
   cd C:\ThirdYear\CC\DockerRelated
   ```

2. **Run traffic generator for your ONLINE app:**
   ```powershell
   $feedbacks = @("Great app!", "Bug found", "Too expensive", "Love it!", "Slow performance")
   1..20 | ForEach-Object {
       $body = @{feedback=$feedbacks[$_ % 5]} | ConvertTo-Json
       Invoke-RestMethod -Uri https://textcat-app.onrender.com/predict -Method Post -Body $body -ContentType "application/json" | Out-Null
       Write-Host "Request $_/20 sent"
   }
   ```

3. **Watch Grafana dashboard update in real-time!**
   - Refresh will happen every 5 seconds
   - All graphs should start showing data

---

## ✅ VERIFICATION CHECKLIST

Before showing to your professor, verify:

- [ ] Flask app responding: `https://textcat-app.onrender.com/health`
- [ ] Prometheus showing target UP: `https://textcat-prometheus.onrender.com/targets`
- [ ] Grafana accessible: `https://textcat-grafana.onrender.com`
- [ ] Grafana login works: `admin / admin`
- [ ] Dashboard loads automatically
- [ ] All 15 panels showing data (not "No data")
- [ ] Metrics updating (check Request Rate panel)

---

## 🎓 WHAT TO SHOW YOUR PROFESSOR

**Simply give her this URL:**
```
https://textcat-grafana.onrender.com
Login: admin / admin
```

**She will see:**
- ✅ Docker containerized application deployed
- ✅ Prometheus collecting performance metrics
- ✅ Grafana visualizing 15 different performance parameters
- ✅ Real-time monitoring dashboard
- ✅ All 29 metrics being tracked

This **perfectly matches** her requirement:
> "Deploy the web application using docker container and visualize the performance parameters using grafana and Prometheus"

---

## 🔧 TROUBLESHOOTING

### **Issue: Grafana shows "No data"**

**Solution 1:** Check Prometheus is scraping
- Go to `https://textcat-prometheus.onrender.com/targets`
- Flask-app target should be **UP** (green)
- If DOWN, wait 30 seconds (Render services sleep when idle)

**Solution 2:** Wake up Flask app
```powershell
Invoke-RestMethod https://textcat-app.onrender.com/health
```

**Solution 3:** Check datasource in Grafana
- Go to Grafana → ⚙️ Settings → Data Sources
- Click "Prometheus"
- Click "Test" button
- Should show "Data source is working"

---

### **Issue: Prometheus target shows DOWN**

**Solution:** Render free tier services sleep after 15 minutes of inactivity

1. Wake up Flask app:
   ```powershell
   Invoke-RestMethod https://textcat-app.onrender.com/health
   ```

2. Wait 30 seconds

3. Check Prometheus targets again

4. Generate traffic to keep it alive

---

### **Issue: Dashboard not auto-loading**

**Solution 1:** Manual import
1. Go to Grafana
2. Click **☰** → **Dashboards** → **Import**
3. Copy contents of: `C:\ThirdYear\CC\DockerRelated\render-grafana\dashboards\enhanced-dashboard.json`
4. Paste in "Import via panel json"
5. Click "Load"

**Solution 2:** Check provisioning
- Container logs might show provisioning errors
- Check Render service logs

---

### **Issue: Can't login to Grafana**

**Default credentials:**
- Username: `admin`
- Password: `admin`

If changed, check Render environment variables.

---

## 📊 ARCHITECTURE DIAGRAM

```
┌─────────────────────────────────────────────────────┐
│                  RENDER CLOUD                        │
│                                                      │
│  ┌──────────────────┐                               │
│  │   Flask App      │ ◄─── Users (Netlify frontend) │
│  │ textcat-app      │                               │
│  │ :5000            │                               │
│  │ /metrics         │                               │
│  └────────┬─────────┘                               │
│           │                                          │
│           │ scrape /metrics every 5s                 │
│           │                                          │
│  ┌────────▼─────────┐                               │
│  │  Prometheus      │                               │
│  │ textcat-         │                               │
│  │ prometheus       │                               │
│  │ :9090            │                               │
│  └────────┬─────────┘                               │
│           │                                          │
│           │ query metrics                            │
│           │                                          │
│  ┌────────▼─────────┐                               │
│  │   Grafana        │ ◄─── Professor views this!   │
│  │ textcat-grafana  │                               │
│  │ :3000            │                               │
│  │ Dashboard: 15    │                               │
│  │ visualization    │                               │
│  │ panels           │                               │
│  └──────────────────┘                               │
│                                                      │
└─────────────────────────────────────────────────────┘
```

---

## 🎯 FINAL DELIVERABLE

**URL for submission:** `https://textcat-grafana.onrender.com`

**What it shows:**
- Docker containers deployed ✅
- Prometheus collecting metrics ✅
- Grafana visualizing performance ✅
- 15 panels with real-time data ✅

**Requirements met:**
✅ "Deploy the web application using docker container"
✅ "Visualize the performance parameters using grafana and Prometheus"

---

## 💡 COST

**Total: FREE** 🎉
- Flask app: Free tier
- Prometheus: Free tier
- Grafana: Free tier

**Limitations:**
- Services sleep after 15 min inactivity
- 750 hours/month free runtime per service
- Perfect for demonstration and evaluation!

---

## 📞 QUICK ACCESS

- **Flask App:** https://textcat-app.onrender.com
- **Flask Metrics:** https://textcat-app.onrender.com/metrics
- **Flask Health:** https://textcat-app.onrender.com/health
- **Prometheus:** https://textcat-prometheus.onrender.com
- **Prometheus Targets:** https://textcat-prometheus.onrender.com/targets
- **Grafana:** https://textcat-grafana.onrender.com (admin/admin)

---

## 🎓 DEMONSTRATION SCRIPT

When showing to professor:

1. **"Here's the deployed Grafana dashboard"**
   - Open: https://textcat-grafana.onrender.com

2. **"All services are Docker containers on Render"**
   - Show Render dashboard with 3 services

3. **"Prometheus collects 29 metrics from the Flask app"**
   - Open: https://textcat-prometheus.onrender.com/targets
   - Show flask-app target UP

4. **"Grafana visualizes all performance parameters"**
   - Show 15 panels in dashboard
   - Point out: Request rate, CPU, Memory, ML metrics, DB metrics

5. **"Let me generate some traffic to show real-time updates"**
   - Run the traffic generation script
   - Watch graphs update live

6. **"All 3 services are containerized and deployed to cloud"**
   - Perfect match for requirement ✅

---

**Good luck with your evaluation!** 🚀

Everything is ready - just follow the deployment steps above!

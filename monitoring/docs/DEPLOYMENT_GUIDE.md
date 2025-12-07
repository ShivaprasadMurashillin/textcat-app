# 🚀 Quick Deployment Guide

## Current Status: Building Docker Images... ⏳

The system is currently building:
- ✅ Text Categorization Flask App
- ✅ Prometheus (Metrics Collection)
- ✅ Grafana (Visualization)

**Build Progress:** Installing Python packages (10-12 minutes for first build)

---

## 📊 After Build Completes

### 1. Start All Services
```cmd
cd C:\ThirdYear\CC\monitoring
docker-compose -f docker-compose.yml up -d
```

### 2. Verify Containers Running
```cmd
docker-compose -f C:\ThirdYear\CC\monitoring\docker-compose.yml ps
```

Expected output:
```
NAME           IMAGE                    STATUS          PORTS
textcat-app    monitoring-app        Up             0.0.0.0:5000->5000/tcp
prometheus     prom/prometheus:latest   Up             0.0.0.0:9090->9090/tcp
grafana        grafana/grafana:latest   Up             0.0.0.0:3000->3000/tcp
```

### 3. Access Services

| Service | URL | Credentials |
|---------|-----|-------------|
| **Web App** | http://localhost:5000 | - |
| **App Metrics** | http://localhost:5000/metrics | - |
| **Prometheus** | http://localhost:9090 | - |
| **Grafana** | http://localhost:3000 | admin / admin |

---

## 🧪 Test the Application

### Test Single Prediction
```cmd
curl -X POST http://localhost:5000/predict -H "Content-Type: application/json" -d "{\"text\": \"Your product is amazing!\"}"
```

### Generate Test Load (PowerShell)
```powershell
for ($i=1; $i -le 100; $i++) {
    $body = @{text = "Test feedback number $i - Great service!"} | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:5000/predict" -Method POST -Body $body -ContentType "application/json"
    Write-Host "Request $i completed"
    Start-Sleep -Milliseconds 200
}
```

---

## 📈 View Metrics in Prometheus

1. Open http://localhost:9090
2. Go to **Status → Targets**
3. Verify `textcat-app` is **UP**
4. Try these queries in **Graph** tab:

```promql
# Total requests
app_requests_total

# Request rate per second
rate(app_requests_total[1m])

# Predictions by category
sum by (category) (app_predictions_total)

# Average latency
rate(app_request_latency_seconds_sum[1m]) / rate(app_request_latency_seconds_count[1m])

# Active requests
app_active_requests

# Model status
app_model_loaded
```

---

## 📊 View Dashboard in Grafana

### Step 1: Login
1. Open http://localhost:3000
2. Login: `admin` / `admin`
3. Skip password change (or set new password)

### Step 2: Access Pre-Built Dashboard
1. Click **☰ Menu** (top-left)
2. Go to **Dashboards → Browse**
3. Click **Text Categorization App Monitoring**

### Dashboard Panels:
- ✅ **Request Rate** - Requests per second
- ✅ **Total Requests** - Cumulative count
- ✅ **Active Requests** - Current processing
- ✅ **Request Latency** - p50 & p95 response times
- ✅ **Predictions by Category** - Pie chart
- ✅ **Prediction Rate** - Trend by category
- ✅ **ML Model Status** - Loaded/Not loaded

---

## 🔍 Monitoring Commands

### View Logs
```cmd
# All services
docker-compose -f C:\ThirdYear\CC\monitoring\docker-compose.yml logs -f

# Specific service
docker-compose -f C:\ThirdYear\CC\monitoring\docker-compose.yml logs -f app
docker-compose -f C:\ThirdYear\CC\monitoring\docker-compose.yml logs -f prometheus
docker-compose -f C:\ThirdYear\CC\monitoring\docker-compose.yml logs -f grafana
```

### Check Container Status
```cmd
docker ps
```

### Restart Services
```cmd
docker-compose -f C:\ThirdYear\CC\monitoring\docker-compose.yml restart app
```

### Stop All Services
```cmd
docker-compose -f C:\ThirdYear\CC\monitoring\docker-compose.yml down
```

### Complete Cleanup (Remove volumes)
```cmd
docker-compose -f C:\ThirdYear\CC\monitoring\docker-compose.yml down -v
```

---

## 🎯 Key Performance Metrics Being Tracked

| Metric | Description | Prometheus Query |
|--------|-------------|------------------|
| **Request Rate** | HTTP requests per second | `rate(app_requests_total[1m])` |
| **Request Latency** | Response time distribution | `histogram_quantile(0.95, rate(app_request_latency_seconds_bucket[5m]))` |
| **Predictions** | Total ML predictions made | `sum(app_predictions_total)` |
| **Category Distribution** | Predictions by category | `sum by (category) (app_predictions_total)` |
| **Active Requests** | Concurrent requests | `app_active_requests` |
| **Model Status** | ML model loaded (1/0) | `app_model_loaded` |
| **Error Rate** | 5xx errors | `rate(app_requests_total{status=~"5.."}[1m])` |

---

## 🏗️ Architecture Overview

```
┌─────────────────────────────────────────────────────────┐
│                  Docker Network: monitoring              │
├─────────────────────────────────────────────────────────┤
│                                                          │
│  ┌────────────────────────────────────────────────┐    │
│  │  Flask App Container (textcat-app)             │    │
│  │  Port: 5000                                    │    │
│  │  • REST API endpoints                          │    │
│  │  • ML Model (Naive Bayes)                      │    │
│  │  • /metrics endpoint (Prometheus format)       │    │
│  └────────────────┬───────────────────────────────┘    │
│                   │ Scrapes /metrics every 5s           │
│                   ▼                                      │
│  ┌────────────────────────────────────────────────┐    │
│  │  Prometheus Container                          │    │
│  │  Port: 9090                                    │    │
│  │  • Metrics collection & storage                │    │
│  │  • PromQL query engine                         │    │
│  │  • 15-day data retention                       │    │
│  └────────────────┬───────────────────────────────┘    │
│                   │ Queries metrics                     │
│                   ▼                                      │
│  ┌────────────────────────────────────────────────┐    │
│  │  Grafana Container                             │    │
│  │  Port: 3000                                    │    │
│  │  • Visualization dashboards                    │    │
│  │  • Auto-configured Prometheus datasource       │    │
│  │  • Pre-loaded monitoring dashboard             │    │
│  └────────────────────────────────────────────────┘    │
│                                                          │
└─────────────────────────────────────────────────────────┘
```

---

## ✅ Success Checklist

After deployment, verify:

- [ ] Flask app responds at http://localhost:5000
- [ ] `/metrics` endpoint shows Prometheus metrics
- [ ] Prometheus shows target as **UP** at http://localhost:9090/targets
- [ ] Grafana loads at http://localhost:3000
- [ ] Dashboard displays metrics (after generating some requests)
- [ ] Test prediction works via API
- [ ] Metrics update in real-time on Grafana

---

## 🐛 Troubleshooting

### Issue: Container won't start
```cmd
# Check logs
docker-compose -f C:\ThirdYear\CC\monitoring\docker-compose.yml logs app

# Rebuild container
docker-compose -f C:\ThirdYear\CC\monitoring\docker-compose.yml build --no-cache app
docker-compose -f C:\ThirdYear\CC\monitoring\docker-compose.yml up -d
```

### Issue: Prometheus target DOWN
```cmd
# Check if app container is running
docker ps | findstr textcat

# Check app health
curl http://localhost:5000/health

# Restart Prometheus
docker-compose -f C:\ThirdYear\CC\monitoring\docker-compose.yml restart prometheus
```

### Issue: Grafana shows "No data"
1. Verify Prometheus is UP: http://localhost:9090/targets
2. Check data source: Grafana → Configuration → Data Sources → Prometheus
3. Generate test requests to create metrics
4. Refresh dashboard

### Issue: Port already in use
```cmd
# Find process using port 5000
netstat -ano | findstr :5000

# Stop the service or change port in docker-compose.yml
```

---

## 📝 Notes

- First Docker build: 10-15 minutes
- Subsequent builds: 30 seconds (cached)
- Grafana data persists in Docker volume
- Prometheus retains 15 days of metrics
- All containers restart automatically

---

**🎉 Once build completes, run:**
```cmd
docker-compose -f C:\ThirdYear\CC\monitoring\docker-compose.yml up -d
```

**Then visit:** http://localhost:3000 (Grafana) to see your monitoring dashboard!


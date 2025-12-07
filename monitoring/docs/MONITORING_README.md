# 📊 Docker Monitoring Setup - Prometheus & Grafana

Complete monitoring stack for the Text Categorization Application using Docker, Prometheus, and Grafana.

---

## 📁 Project Structure

```
C:/ThirdYear/CC/
├── cc_paas/                          # Your Flask application
│   ├── app.py                        # ✅ Now includes /metrics endpoint
│   ├── requirements.txt              # ✅ Updated with prometheus-client
│   ├── Dockerfile                    # Docker build configuration
│   └── ...
│
└── DockerRelated/                    # Monitoring setup
    ├── docker-compose.yml            # ✅ NEW - Orchestrates all services
    ├── prometheus/
    │   └── prometheus.yml            # ✅ UPDATED - Scrapes app metrics
    └── grafana/
        ├── provisioning/
        │   ├── datasources/
        │   │   └── prometheus.yml    # ✅ NEW - Auto-configures Prometheus
        │   └── dashboards/
        │       └── default.yml       # ✅ NEW - Auto-loads dashboard
        └── dashboards/
            └── textcat-dashboard.json # ✅ NEW - Pre-built dashboard
```

---

## 🚀 Quick Start

### 1. Navigate to Monitoring Directory

```cmd
cd C:\ThirdYear\CC\DockerRelated
```

### 2. Build and Start All Services

```cmd
docker-compose up -d
```

This will start:
- **Text Categorization App** on port `5000`
- **Prometheus** on port `9090`
- **Grafana** on port `3000`

### 3. Verify Services

#### Check running containers:
```cmd
docker-compose ps
```

Expected output:
```
NAME                IMAGE                    STATUS          PORTS
textcat-app         dockerrelated-app        Up             0.0.0.0:5000->5000/tcp
prometheus          prom/prometheus:latest   Up             0.0.0.0:9090->9090/tcp
grafana             grafana/grafana:latest   Up             0.0.0.0:3000->3000/tcp
```

#### Check logs:
```cmd
docker-compose logs -f app
docker-compose logs -f prometheus
docker-compose logs -f grafana
```

---

## 🔍 Accessing Services

### 1. Text Categorization App
**URL:** http://localhost:5000

**Test the API:**
```cmd
curl http://localhost:5000/health
```

**View Metrics Endpoint:**
```cmd
curl http://localhost:5000/metrics
```

### 2. Prometheus
**URL:** http://localhost:9090

**Verify Targets:**
1. Open http://localhost:9090/targets
2. You should see `textcat-app` with status **UP**

**Run Sample Queries:**
- Go to http://localhost:9090/graph
- Try these queries:
  - `app_requests_total` - Total requests
  - `rate(app_requests_total[1m])` - Request rate per second
  - `app_predictions_total` - Total predictions
  - `app_model_loaded` - Model status (1=loaded, 0=not loaded)
  - `app_active_requests` - Current active requests

### 3. Grafana
**URL:** http://localhost:3000

**Default Credentials:**
- Username: `admin`
- Password: `admin`

**Access Dashboard:**
1. Login to Grafana
2. The **Text Categorization App Monitoring** dashboard will be auto-loaded
3. Navigate to **Dashboards → Browse** → **Text Categorization App Monitoring**

---

## 📈 Metrics Exposed by the App

Your Flask application now exposes the following metrics at `/metrics`:

| Metric Name | Type | Description |
|------------|------|-------------|
| `app_requests_total` | Counter | Total HTTP requests (by method, endpoint, status) |
| `app_request_latency_seconds` | Histogram | Request latency distribution |
| `app_predictions_total` | Counter | Total predictions made (by category) |
| `app_model_loaded` | Gauge | ML model status (1=loaded, 0=not loaded) |
| `app_active_requests` | Gauge | Currently processing requests |

---

## 📊 Grafana Dashboard Features

The pre-configured dashboard includes:

1. **Request Rate Panel** - Real-time requests per second
2. **Total Requests Gauge** - Cumulative request count
3. **Active Requests** - Current concurrent requests
4. **Request Latency** - p50 and p95 response times
5. **Predictions by Category** - Pie chart of ML classifications
6. **Prediction Rate** - Category-wise prediction trends
7. **ML Model Status** - Whether models are loaded

**Auto-refresh:** Dashboard refreshes every 5 seconds

---

## 🧪 Testing the Monitoring Setup

### 1. Generate Test Traffic

**Single Prediction:**
```cmd
curl -X POST http://localhost:5000/predict ^
  -H "Content-Type: application/json" ^
  -d "{\"text\": \"Your product is amazing! I love it.\"}"
```

**Batch Test Script (PowerShell):**
```powershell
for ($i=1; $i -le 50; $i++) {
    $body = @{text = "Test feedback number $i"} | ConvertTo-Json
    Invoke-RestMethod -Uri "http://localhost:5000/predict" `
                      -Method POST `
                      -Body $body `
                      -ContentType "application/json"
    Start-Sleep -Milliseconds 100
}
```

### 2. Monitor in Grafana

1. Open http://localhost:3000
2. Go to **Text Categorization App Monitoring** dashboard
3. Watch metrics update in real-time:
   - Request rate increases
   - Prediction counters increment
   - Latency graphs show response times

### 3. Query in Prometheus

Open http://localhost:9090/graph and try:

```promql
# Total predictions in last 5 minutes
increase(app_predictions_total[5m])

# Average request latency
rate(app_request_latency_seconds_sum[1m]) / rate(app_request_latency_seconds_count[1m])

# Requests per minute by endpoint
sum by (endpoint) (rate(app_requests_total[1m]) * 60)
```

---

## 🛠️ Management Commands

### Stop All Services
```cmd
docker-compose down
```

### Stop and Remove Volumes (Clean Slate)
```cmd
docker-compose down -v
```

### Restart Specific Service
```cmd
docker-compose restart app
docker-compose restart prometheus
docker-compose restart grafana
```

### View Logs
```cmd
docker-compose logs -f app          # Follow app logs
docker-compose logs --tail=100 app  # Last 100 lines
```

### Rebuild Application
```cmd
docker-compose up -d --build app
```

---

## 🔧 Configuration Details

### Prometheus Configuration
**File:** `C:/ThirdYear/CC/DockerRelated/prometheus/prometheus.yml`

```yaml
global:
  scrape_interval: 5s  # Scrape every 5 seconds

scrape_configs:
  - job_name: "textcat-app"
    static_configs:
      - targets: ["app:5000"]  # Docker service name
    metrics_path: "/metrics"
```

### Docker Network
All services run in the `monitoring` network, allowing:
- Prometheus to scrape `app:5000/metrics`
- Grafana to query `prometheus:9090`

---

## 🐛 Troubleshooting

### Issue: Prometheus shows target as DOWN

**Solution:**
1. Check app is running: `docker-compose ps`
2. Verify metrics endpoint: `curl http://localhost:5000/metrics`
3. Check Prometheus logs: `docker-compose logs prometheus`

### Issue: Grafana shows "No data"

**Solution:**
1. Verify Prometheus is UP: http://localhost:9090/targets
2. Check Grafana data source: Settings → Data Sources → Prometheus
3. Ensure dashboard time range includes recent data

### Issue: App container keeps restarting

**Solution:**
1. Check app logs: `docker-compose logs app`
2. Verify models exist: `textcat_model.pkl` and `tfidf_vectorizer.pkl`
3. Check requirements installed: `docker-compose exec app pip list`

### Issue: Port already in use

**Solution:**
```cmd
# Find process using port 5000
netstat -ano | findstr :5000

# Kill process (replace PID)
taskkill /PID <PID> /F

# Or change port in docker-compose.yml
ports:
  - "5001:5000"  # Use port 5001 instead
```

---

## 📦 What Was Modified in Your App

### `app.py` Changes:
1. ✅ Added `prometheus_client` imports
2. ✅ Created metrics: Counters, Histograms, Gauges
3. ✅ Added `/metrics` endpoint
4. ✅ Added `@app.before_request` hook to track active requests
5. ✅ Added `@app.after_request` hook to record metrics
6. ✅ Track predictions by category

### `requirements.txt` Changes:
1. ✅ Added `prometheus-client==0.19.0`

### No Breaking Changes
- All existing functionality preserved
- Metrics collection is non-intrusive
- Minimal performance overhead (~1-2ms per request)

---

## 🎯 Next Steps

### 1. Customize Dashboard
- Edit `grafana/dashboards/textcat-dashboard.json`
- Add custom panels in Grafana UI
- Save and export updated dashboard

### 2. Add Alerts
Create `prometheus/alerts.yml`:
```yaml
groups:
  - name: textcat-alerts
    rules:
      - alert: HighErrorRate
        expr: rate(app_requests_total{status=~"5.."}[5m]) > 0.1
        annotations:
          summary: "High error rate detected"
```

### 3. Add More Metrics
In `app.py`:
```python
DB_ERRORS = Counter('app_db_errors_total', 'Database errors')
PREDICTION_CONFIDENCE = Histogram('app_prediction_confidence', 'Prediction confidence scores')
```

### 4. Production Enhancements
- Add authentication to Grafana
- Configure Prometheus retention
- Set up alerting (email/Slack)
- Enable HTTPS
- Add Nginx reverse proxy

---

## 📚 Useful Links

- **Prometheus Query Language:** https://prometheus.io/docs/prometheus/latest/querying/basics/
- **Grafana Dashboards:** https://grafana.com/docs/grafana/latest/dashboards/
- **Prometheus Python Client:** https://github.com/prometheus/client_python
- **PromQL Examples:** https://prometheus.io/docs/prometheus/latest/querying/examples/

---

## ✅ Checklist

- [x] Flask app exposes `/metrics` endpoint
- [x] Prometheus scrapes metrics every 5 seconds
- [x] Grafana dashboard auto-loads with 7 panels
- [x] All services run in same Docker network
- [x] Health checks configured
- [x] Volume persistence for Prometheus and Grafana
- [x] Auto-configured Grafana data source

---

**🎉 Your monitoring stack is ready!**

Run `docker-compose up -d` and visit:
- App: http://localhost:5000
- Prometheus: http://localhost:9090
- Grafana: http://localhost:3000 (admin/admin)

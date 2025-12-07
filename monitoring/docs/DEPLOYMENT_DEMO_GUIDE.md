# Docker Deployment with Prometheus & Grafana Monitoring
## Complete Demonstration Guide for Assignment Evaluation

---

## 🎯 **REQUIREMENT**
"Deploy the web application using docker container and visualize the performance parameters using grafana and Prometheus"

---

## ✅ **DEPLOYMENT STATUS - ALL RUNNING**

### **Docker Containers (3 Services):**
```
✓ textcat-app    - Flask ML Application (Port 5000)
✓ prometheus     - Metrics Collection (Port 9090)
✓ grafana        - Visualization Dashboard (Port 3000)
```

### **Current System Status:**
- **Total Predictions Processed:** 587+
- **Database:** Connected (PostgreSQL on Render)
- **Metrics Collected:** 29 different metrics
- **Dashboard Panels:** 15 visualization panels
- **Uptime:** All services healthy

---

## 📋 **DEMONSTRATION STEPS**

### **Step 1: Show Docker Deployment**

**Command to show running containers:**
```powershell
docker ps
```

**Expected Output:**
```
CONTAINER ID   IMAGE                    STATUS         PORTS
xxxxx          monitoring-app       Up X minutes   0.0.0.0:5000->5000/tcp
xxxxx          prom/prometheus         Up X minutes   0.0.0.0:9090->9090/tcp
xxxxx          grafana/grafana         Up X minutes   0.0.0.0:3000->3000/tcp
```

**Show docker-compose configuration:**
```powershell
cat docker-compose.yml
```

---

### **Step 2: Test Flask Application**

**Health Check:**
```powershell
Invoke-RestMethod -Uri http://localhost:5000/health
```

**Expected Output:**
```json
{
  "status": "healthy",
  "service": "Text Categorization API",
  "version": "1.0.0",
  "model_loaded": true
}
```

**Make a Test Prediction:**
```powershell
$body = @{feedback="Great application!"} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:5000/predict -Method Post -Body $body -ContentType "application/json"
```

**Expected Output:**
```json
{
  "prediction": "Positive Feedback",
  "confidence": 42.55,
  "all_probabilities": {...}
}
```

---

### **Step 3: Show Prometheus Metrics Collection**

**Access Prometheus UI:**
```
http://localhost:9090
```

**Show Targets (verify scraping):**
```
http://localhost:9090/targets
```
- Should show `flask-app` endpoint as **UP**
- Scrape interval: 5 seconds

**Test Prometheus Queries:**

1. **Total Requests:**
   ```promql
   sum(app_requests_total)
   ```

2. **Request Rate (per second):**
   ```promql
   rate(app_requests_total[1m])
   ```

3. **Request Latency (95th percentile):**
   ```promql
   histogram_quantile(0.95, rate(app_request_latency_seconds_bucket[5m]))
   ```

4. **CPU Usage:**
   ```promql
   app_process_cpu_percent
   ```

5. **Memory Usage (in MB):**
   ```promql
   app_process_memory_bytes / 1024 / 1024
   ```

6. **Database Query Latency:**
   ```promql
   histogram_quantile(0.95, rate(app_db_query_seconds_bucket[5m]))
   ```

---

### **Step 4: Demonstrate Grafana Visualization**

**Access Grafana:**
```
http://localhost:3000
Login: admin / admin
```

**Import Enhanced Dashboard:**
1. Click **☰** (hamburger menu) → **Dashboards**
2. Click **Import** (or **New** → **Import**)
3. Click **Upload JSON file**
4. Select: `C:\ThirdYear\CC\monitoring\grafana\dashboards\enhanced-dashboard.json`
5. Click **Import**

**Dashboard Shows 15 Panels:**

**ROW 1 - Request Metrics:**
- Request Rate (requests/second)
- Total Requests (counter with thresholds)
- Active Requests (current concurrent load)
- Request Latency (p50 & p95 percentiles)

**ROW 2 - ML Predictions:**
- Predictions by Category (pie chart)
- Prediction Rate by Category (timeseries)
- Model Status (loaded indicator)

**ROW 3 - ML Performance:**
- Model Inference Time (prediction speed by category)
- Predictions by Confidence Level (low/medium/high distribution)
- Average Confidence by Category (bar chart)

**ROW 4 - Business & Resources:**
- Input Text Length (median & p95)
- Memory Usage (MB with color thresholds)
- CPU Usage (% with color thresholds)

**ROW 5 - Database Monitoring:**
- Database Query Latency (p50 & p95)
- Database Operations (success vs failure)

---

### **Step 5: Generate Live Traffic for Demo**

**Generate 50 predictions to show real-time monitoring:**

```powershell
cd C:\ThirdYear\CC\monitoring

$feedbacks = @(
    "The app crashes on startup",
    "Please add dark mode feature",
    "The pricing is too expensive",
    "Great application! Love it!",
    "Very slow performance",
    "Critical bug in login system",
    "Would be great to have API docs",
    "Your pricing is unfair",
    "Excellent customer support!",
    "The app is unusable",
    "Minor UI bug in dashboard",
    "Feature request: PDF export",
    "The premium plan costs too much",
    "Amazing app!",
    "Poor mobile performance"
)

1..50 | ForEach-Object {
    $f = $feedbacks[$_ % 15]
    $body = @{feedback=$f} | ConvertTo-Json
    $result = Invoke-RestMethod -Uri http://localhost:5000/predict -Method Post -Body $body -ContentType "application/json"
    Write-Host "[$_/50] $($result.prediction) - $($result.confidence)%"
    Start-Sleep -Milliseconds 100
}

Write-Host "`n✓ Generated 50 predictions! Check Grafana for live updates!" -ForegroundColor Green
```

**Watch Grafana dashboard update in real-time as requests are processed!**

---

## 📊 **METRICS BEING MONITORED**

### **1. Request Tracking (5 metrics)**
- `app_requests_total` - Total API requests
- `app_request_latency_seconds` - Response time
- `app_active_requests` - Concurrent requests
- `app_model_loaded` - ML model status

### **2. ML Performance (4 metrics)**
- `app_model_inference_seconds` - Prediction speed
- `app_prediction_confidence` - Model confidence scores
- `app_low_confidence_predictions_total` - Uncertain predictions
- `app_average_confidence` - Average confidence by category

### **3. Business Intelligence (3 metrics)**
- `app_predictions_total` - Predictions per category
- `app_text_length_chars` - Input text length distribution
- `app_predictions_by_confidence_level_total` - Quality distribution

### **4. Database Performance (3 metrics)**
- `app_db_query_seconds` - Database query latency
- `app_db_operations_total` - DB operations (success/failure)
- `app_db_errors_total` - Database errors

### **5. Resource Utilization (3 metrics)**
- `app_process_memory_bytes` - RAM usage
- `app_process_cpu_percent` - CPU usage
- `app_python_info` - Python version

### **6. System Metrics (11 auto-generated)**
- Process memory, CPU, file descriptors
- Python garbage collection stats
- Process start time and uptime

---

## 🎓 **EVALUATION TALKING POINTS**

### **1. Docker Containerization:**
✓ Application packaged in Docker container
✓ Multi-container setup using docker-compose
✓ Isolated networking (monitoring network)
✓ Health checks configured
✓ Persistent volumes for data retention

### **2. Prometheus Integration:**
✓ Metrics exposed via `/metrics` endpoint
✓ Prometheus scraping every 5 seconds
✓ 29 different metrics collected
✓ 15-day data retention configured
✓ Time-series database for historical analysis

### **3. Grafana Visualization:**
✓ Auto-provisioned datasource
✓ Pre-configured dashboard with 15 panels
✓ Real-time monitoring
✓ Multiple visualization types (timeseries, pie charts, gauges, stats)
✓ Color-coded thresholds for alerts

### **4. Production-Ready Features:**
✓ Database integration (PostgreSQL)
✓ 587+ predictions stored
✓ Non-root user for security
✓ Resource monitoring (CPU, Memory)
✓ Error tracking and logging
✓ Background CPU monitoring thread

### **5. Performance Insights:**
✓ Request latency: ~3-5ms median
✓ ML inference: ~2-5ms per prediction
✓ Memory usage: ~102-108 MB stable
✓ Database query p95: ~500ms
✓ 99%+ database success rate

---

## 🔍 **KEY COMMANDS FOR DEMONSTRATION**

### **Show Docker Deployment:**
```powershell
# List running containers
docker ps

# Show container logs
docker logs textcat-app

# Show docker-compose configuration
cat docker-compose.yml

# Show resource usage
docker stats --no-stream
```

### **Test Application:**
```powershell
# Health check
Invoke-RestMethod http://localhost:5000/health

# Make prediction
$body = @{feedback="Test"} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:5000/predict -Method Post -Body $body -ContentType "application/json"

# Check stats
Invoke-RestMethod http://localhost:5000/stats

# View raw metrics
Invoke-WebRequest http://localhost:5000/metrics
```

### **Show Prometheus:**
```powershell
# Open Prometheus UI
Start-Process "http://localhost:9090"

# Check targets
Start-Process "http://localhost:9090/targets"

# Show metrics endpoint
Invoke-WebRequest http://localhost:5000/metrics | Select-Object -ExpandProperty Content | Select-String "app_"
```

### **Show Grafana:**
```powershell
# Open Grafana
Start-Process "http://localhost:3000"
```

---

## 📸 **WHAT TO SHOW IN DEMO**

### **Screenshot 1: Docker Containers Running**
- `docker ps` output showing 3 containers

### **Screenshot 2: Flask Application Response**
- Prediction API response with JSON output

### **Screenshot 3: Prometheus Targets**
- Showing flask-app target as UP

### **Screenshot 4: Prometheus Query**
- Graph showing request rate or CPU usage

### **Screenshot 5: Grafana Dashboard Overview**
- Full dashboard with all 15 panels visible

### **Screenshot 6: Grafana Panel Details**
- Close-up of specific metrics (e.g., Request Latency, CPU Usage)

### **Screenshot 7: Real-time Updates**
- Dashboard updating as you generate traffic

### **Screenshot 8: Database Stats**
- `/stats` endpoint showing 587+ predictions stored

---

## 🚀 **QUICK DEMO SCRIPT (5 Minutes)**

```powershell
# 1. Show containers (30 seconds)
Write-Host "=== Docker Deployment ===" -ForegroundColor Cyan
docker ps

# 2. Test application (30 seconds)
Write-Host "`n=== Testing Flask App ===" -ForegroundColor Cyan
Invoke-RestMethod http://localhost:5000/health
$body = @{feedback="Great app!"} | ConvertTo-Json
Invoke-RestMethod -Uri http://localhost:5000/predict -Method Post -Body $body -ContentType "application/json"

# 3. Show Prometheus (1 minute)
Write-Host "`n=== Opening Prometheus ===" -ForegroundColor Cyan
Start-Process "http://localhost:9090/graph"
Write-Host "Query: rate(app_requests_total[1m])"

# 4. Show Grafana (2 minutes)
Write-Host "`n=== Opening Grafana Dashboard ===" -ForegroundColor Cyan
Start-Process "http://localhost:3000"
Write-Host "Login: admin/admin, then navigate to dashboard"

# 5. Generate live traffic (1 minute)
Write-Host "`n=== Generating Live Traffic ===" -ForegroundColor Cyan
$feedbacks = @("Great!", "Too expensive", "Bug found", "Love it!", "Slow performance")
1..20 | ForEach-Object {
    $body = @{feedback=$feedbacks[$_ % 5]} | ConvertTo-Json
    Invoke-RestMethod -Uri http://localhost:5000/predict -Method Post -Body $body -ContentType "application/json" | Out-Null
    Write-Host "Request $_/20"
}

Write-Host "`n✓ Demo Complete! Watch metrics update in Grafana!" -ForegroundColor Green
```

---

## 📚 **DOCUMENTATION FILES**

All documentation available in `C:\ThirdYear\CC\monitoring\`:

1. **METRICS_DOCUMENTATION.md** - Detailed metrics explanation
2. **METRICS_SUMMARY.txt** - Quick reference guide
3. **DEPLOYMENT_DEMO_GUIDE.md** - This file
4. **docker-compose.yml** - Container orchestration config
5. **prometheus/prometheus.yml** - Metrics scraping config
6. **grafana/dashboards/enhanced-dashboard.json** - Dashboard configuration

---

## ✅ **CHECKLIST FOR FULL MARKS**

### **Deployment (30%):**
- [x] Application containerized with Docker
- [x] Multi-container setup with docker-compose
- [x] All containers running and healthy
- [x] Proper networking and port configuration
- [x] Database integration working

### **Monitoring Setup (30%):**
- [x] Prometheus installed and configured
- [x] Metrics endpoint exposed (/metrics)
- [x] 29 metrics being collected
- [x] Proper scraping configuration (5s interval)
- [x] Data retention configured (15 days)

### **Visualization (30%):**
- [x] Grafana installed and configured
- [x] Datasource auto-provisioned
- [x] Dashboard with multiple panels (15 panels)
- [x] Real-time updates working
- [x] Multiple visualization types

### **Documentation & Demo (10%):**
- [x] Clear documentation provided
- [x] Demo script ready
- [x] Commands documented
- [x] Screenshots capability
- [x] Performance metrics visible

---

## 🎯 **FINAL STATUS**

✅ **Deployment:** COMPLETE - 3 containers running
✅ **Prometheus:** COMPLETE - Collecting 29 metrics
✅ **Grafana:** COMPLETE - 15-panel dashboard ready
✅ **Database:** COMPLETE - 587+ predictions stored
✅ **Monitoring:** COMPLETE - Real-time performance tracking
✅ **Documentation:** COMPLETE - Full guides available

**READY FOR EVALUATION!** 🚀

---

## 📞 **ACCESS INFORMATION**

- **Flask API:** http://localhost:5000
- **Prometheus:** http://localhost:9090
- **Grafana:** http://localhost:3000 (admin/admin)
- **Metrics Endpoint:** http://localhost:5000/metrics
- **Health Check:** http://localhost:5000/health
- **Stats:** http://localhost:5000/stats

---

## 🔧 **TROUBLESHOOTING**

### **If containers are stopped:**
```powershell
cd C:\ThirdYear\CC\monitoring
docker-compose up -d
```

### **If you need to rebuild:**
```powershell
docker-compose down
docker-compose up -d --build
```

### **If Grafana dashboard is missing:**
```powershell
# Restart Grafana
docker-compose restart grafana

# Or manually import the dashboard JSON file
```

### **Check logs:**
```powershell
docker logs textcat-app
docker logs prometheus
docker logs grafana
```

---

**END OF DEMONSTRATION GUIDE**

Good luck with your evaluation! 🎓


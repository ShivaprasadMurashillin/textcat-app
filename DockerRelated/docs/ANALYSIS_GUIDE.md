# 📊 Complete Grafana & Prometheus Analysis Guide

## 🎯 Quick Start - 3 Steps to See Your Metrics

### Step 1: Open Prometheus
1. Go to: **http://localhost:9090/graph**
2. In the search box at the top, type: `app_requests_total`
3. Click the blue **"Execute"** button
4. Click the **"Graph"** tab to see the visualization

### Step 2: Open Grafana Dashboard (RECOMMENDED - Easiest)
1. Go to: **http://localhost:3000**
2. Login: Username: `admin`, Password: `admin`
3. Click **"Skip"** if asked to change password
4. Click the **☰ menu icon** (top left)
5. Click **"Dashboards"**
6. Click **"Text Categorization App Monitoring"**
7. **You'll see 7 panels with live metrics!**

### Step 3: Generate Test Traffic
```powershell
# Run this to create activity:
for ($i=1; $i -le 100; $i++) {
    $texts = @("Great product!", "App has bugs", "Add features", "Too costly", "Bad service")
    Invoke-RestMethod -Uri "http://localhost:5000/predict" -Method POST -Body "{`"text`":`"$($texts[$i % 5])`"}" -ContentType "application/json" | Out-Null
    Write-Host "Request $i completed"
}
```

---

## 📈 Understanding Prometheus Queries

### Basic Queries (Copy & Paste These)

Open http://localhost:9090/graph and try these:

#### 1. **See All Requests**
```promql
app_requests_total
```
**What it shows:** Every request made to your app, grouped by method, endpoint, and status code.

**Example output:**
```
app_requests_total{endpoint="predict", method="POST", status="200"} → 150
app_requests_total{endpoint="health", method="GET", status="200"} → 5
```

#### 2. **Request Rate (Requests per Second)**
```promql
rate(app_requests_total[1m])
```
**What it shows:** How many requests per second in the last minute.

**Example:** If you see `2.5`, that means 2.5 requests/second.

#### 3. **Total Predictions Made**
```promql
sum(app_predictions_total)
```
**What it shows:** Total number of ML predictions.

#### 4. **Predictions by Category**
```promql
sum by (category) (app_predictions_total)
```
**What it shows:** Breakdown of predictions:
- Positive Feedback: 30
- Bug Report: 15
- Feature Request: 10
- etc.

#### 5. **Average Response Time**
```promql
rate(app_request_latency_seconds_sum[1m]) / rate(app_request_latency_seconds_count[1m])
```
**What it shows:** Average time to process each request (in seconds).

**Example:** `0.15` = 150 milliseconds average response time.

#### 6. **95th Percentile Latency (p95)**
```promql
histogram_quantile(0.95, rate(app_request_latency_seconds_bucket[5m]))
```
**What it shows:** 95% of requests complete faster than this time.

**Example:** `0.2` = 200ms → 95% of requests finish in under 200ms.

#### 7. **Current Active Requests**
```promql
app_active_requests
```
**What it shows:** How many requests are being processed RIGHT NOW.

#### 8. **Is Model Loaded?**
```promql
app_model_loaded
```
**What it shows:** 
- `1` = Model is loaded ✅
- `0` = Model failed to load ❌

---

## 🎨 Understanding the Grafana Dashboard

### Panel 1: Request Rate
**What it shows:** Graph of requests per second over time.
- **Spikes** = Heavy traffic periods
- **Flat line** = No activity

**How to read:**
- Y-axis: Requests per second
- X-axis: Time
- Different colored lines = Different endpoints

### Panel 2: Total Requests (Gauge)
**What it shows:** Big number showing cumulative requests.
- Green = Normal
- Yellow = Above 1000 requests
- Red = Above 5000 requests

### Panel 3: Active Requests
**What it shows:** How many requests are processing NOW.
- Should be low (0-5) normally
- High numbers (50+) = System is slow or overloaded

### Panel 4: Request Latency (p50 & p95)
**What it shows:** Response time percentiles.
- **p50 (median)**: Half of requests are faster
- **p95**: 95% of requests are faster
- Lower = Better performance

**Example:**
- p50 = 100ms → Typical request takes 100ms
- p95 = 250ms → 95% of requests under 250ms

### Panel 5: Predictions by Category (Pie Chart)
**What it shows:** Distribution of prediction categories.
- Each slice = One category
- Bigger slice = More predictions in that category

**Use case:** Identify which types of feedback are most common.

### Panel 6: Prediction Rate by Category
**What it shows:** Trend of predictions over time, color-coded by category.

**Use case:** See if certain categories are increasing over time.

### Panel 7: ML Model Status
**What it shows:**
- Green "LOADED" = Model working ✅
- Red "NOT LOADED" = Model failed ❌

---

## 🔍 Analysis Examples

### Example 1: Check if System is Healthy

**Go to Prometheus:** http://localhost:9090/graph

**Query:**
```promql
up{job="textcat-app"}
```

**Result:**
- `1` = App is UP ✅
- `0` = App is DOWN ❌

### Example 2: Find Slow Requests

**Query:**
```promql
histogram_quantile(0.99, rate(app_request_latency_seconds_bucket[5m]))
```

**Result:** Shows the 99th percentile latency.
- `< 0.5s` = Good ✅
- `0.5s - 1s` = Acceptable ⚠️
- `> 1s` = Slow, needs optimization ❌

### Example 3: Identify Most Common Prediction Category

**Query:**
```promql
topk(1, sum by (category) (app_predictions_total))
```

**Result:** Shows the category with most predictions.

Example output:
```
Bug Report: 45
```
Means: 45 bug reports were predicted (most common).

### Example 4: Calculate Error Rate

**Query:**
```promql
rate(app_requests_total{status=~"5.."}[1m])
```

**Result:** Shows rate of 5xx errors (server errors).
- `0` = No errors ✅
- `> 0` = Errors occurring ❌

### Example 5: Monitor Request Success Rate

**Query:**
```promql
sum(rate(app_requests_total{status="200"}[1m])) / sum(rate(app_requests_total[1m])) * 100
```

**Result:** Percentage of successful requests.
- `100%` = Perfect ✅
- `< 95%` = Issues ❌

---

## 🎯 Real-World Analysis Scenarios

### Scenario 1: "Is my app fast enough?"

**Check:**
1. Go to Grafana Dashboard
2. Look at **Request Latency** panel
3. Check p95 value

**Interpretation:**
- p95 < 200ms = Excellent ⚡
- p95 < 500ms = Good ✅
- p95 > 1s = Slow, optimize ⚠️

### Scenario 2: "How many users are using my app?"

**Check:**
1. Prometheus query: `rate(app_requests_total[1h])`
2. Multiply by 3600 (seconds in hour)

**Example:**
- Result: `0.5` requests/second
- = `0.5 × 3600 = 1800` requests per hour

### Scenario 3: "What type of feedback is most common?"

**Check:**
1. Go to Grafana Dashboard
2. Look at **Predictions by Category** pie chart
3. Largest slice = Most common category

**Action:** If "Bug Report" is 50%, prioritize bug fixes!

### Scenario 4: "Is my system overloaded?"

**Check:**
1. Prometheus query: `app_active_requests`
2. Look at current value

**Interpretation:**
- 0-10 = Normal ✅
- 10-50 = Busy but OK ⚠️
- 50+ = Overloaded, scale up! ❌

---

## 📊 Quick Reference: Prometheus Query Cheat Sheet

| What You Want | Query |
|---------------|-------|
| Total requests | `sum(app_requests_total)` |
| Requests/second | `rate(app_requests_total[1m])` |
| Total predictions | `sum(app_predictions_total)` |
| Predictions by category | `sum by (category) (app_predictions_total)` |
| Average latency | `rate(app_request_latency_seconds_sum[1m]) / rate(app_request_latency_seconds_count[1m])` |
| p95 latency | `histogram_quantile(0.95, rate(app_request_latency_seconds_bucket[5m]))` |
| p99 latency | `histogram_quantile(0.99, rate(app_request_latency_seconds_bucket[5m]))` |
| Active requests | `app_active_requests` |
| Model status | `app_model_loaded` |
| Error rate | `rate(app_requests_total{status=~"5.."}[1m])` |
| Success rate % | `sum(rate(app_requests_total{status="200"}[1m])) / sum(rate(app_requests_total[1m])) * 100` |

---

## 🎓 Pro Tips

### Tip 1: Use Time Ranges
In Grafana, top-right corner:
- Click time picker (e.g., "Last 5 minutes")
- Change to "Last 1 hour" for broader view
- Or select custom range

### Tip 2: Refresh Dashboard
- Auto-refresh: Top-right dropdown → "5s" = refreshes every 5 seconds
- Manual refresh: Click the 🔄 icon

### Tip 3: Zoom into Graphs
- Click and drag on a graph to zoom into that time period
- Click "Zoom out" to reset

### Tip 4: Compare Time Periods
In Prometheus:
```promql
app_requests_total offset 1h
```
Shows data from 1 hour ago (compare with current).

### Tip 5: Create Alerts
Grafana can alert you when metrics cross thresholds:
1. Edit a panel
2. Click "Alert" tab
3. Set conditions (e.g., "Alert if latency > 1s")

---

## ✅ Quick Health Check

Run these 3 queries to verify everything is working:

### 1. App is Running
```promql
up{job="textcat-app"}
```
**Expected:** `1`

### 2. Receiving Requests
```promql
rate(app_requests_total[5m]) > 0
```
**Expected:** Shows positive numbers

### 3. Model is Loaded
```promql
app_model_loaded
```
**Expected:** `1`

---

## 🚀 Next Steps

1. **Run the test traffic generator** (see top of guide)
2. **Watch the Grafana dashboard update** in real-time
3. **Try the Prometheus queries** to understand your data
4. **Experiment with time ranges** to see historical trends

**Need help?** Check `DEPLOYMENT_GUIDE.md` for troubleshooting!

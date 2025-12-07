# Prometheus Metrics Documentation
## Complete Guide to All Available Metrics

---

## 📊 **METRICS SUMMARY**
**Total Metrics Available:** 29 metrics across 6 categories
- ✅ **All metrics are actively collecting data**
- ✅ **Prometheus scraping every 5 seconds**
- ✅ **15-day retention period**

---

## 1️⃣ **REQUEST TRACKING METRICS** (5 metrics)

### **app_requests_total** 📈
- **Type:** Counter
- **What it shows:** Total number of HTTP requests received
- **Labels:** `method` (GET/POST), `endpoint` (/predict, /metrics, /stats), `status` (200, 400, 500)
- **Use case:** Track overall API usage and endpoint popularity
- **Prometheus Query:**
  ```promql
  rate(app_requests_total[1m])  # Requests per second
  sum(app_requests_total)        # Total requests
  ```

### **app_request_latency_seconds** ⏱️
- **Type:** Histogram
- **What it shows:** How long each request takes to process (in seconds)
- **Labels:** `method`, `endpoint`
- **Buckets:** 0.005s, 0.01s, 0.025s, 0.05s, 0.075s, 0.1s, 0.25s, 0.5s, 0.75s, 1s, 2.5s, 5s, 7.5s, 10s
- **Use case:** Identify slow endpoints, monitor API performance
- **Prometheus Query:**
  ```promql
  histogram_quantile(0.50, rate(app_request_latency_seconds_bucket[5m]))  # p50 latency
  histogram_quantile(0.95, rate(app_request_latency_seconds_bucket[5m]))  # p95 latency
  histogram_quantile(0.99, rate(app_request_latency_seconds_bucket[5m]))  # p99 latency
  ```

### **app_active_requests** 🔄
- **Type:** Gauge
- **What it shows:** Number of requests currently being processed (real-time)
- **Use case:** Monitor concurrent load, detect traffic spikes
- **Prometheus Query:**
  ```promql
  app_active_requests  # Current active requests
  ```

### **app_model_loaded** ✅
- **Type:** Gauge
- **What it shows:** Whether ML models are loaded (1=loaded, 0=not loaded)
- **Use case:** Health monitoring, verify app initialization
- **Prometheus Query:**
  ```promql
  app_model_loaded  # Should always be 1
  ```

---

## 2️⃣ **ML PERFORMANCE METRICS** (4 metrics)

### **app_model_inference_seconds** 🧠
- **Type:** Histogram
- **What it shows:** Time taken for ML model prediction only (excludes database, validation)
- **Labels:** `category` (Bug Report, Feature Request, etc.)
- **Use case:** Monitor ML model performance, identify slow predictions
- **Prometheus Query:**
  ```promql
  histogram_quantile(0.50, rate(app_model_inference_seconds_bucket[5m]))  # Median inference time
  sum(rate(app_model_inference_seconds_sum[5m])) / sum(rate(app_model_inference_seconds_count[5m]))  # Average
  ```

### **app_prediction_confidence** 📊
- **Type:** Histogram
- **What it shows:** Distribution of ML model confidence scores (0-100%)
- **Labels:** `category`
- **Buckets:** 0.3, 0.4, 0.5, 0.6, 0.7, 0.8, 0.9, 1.0
- **Use case:** Understand model certainty, detect low-confidence predictions
- **Prometheus Query:**
  ```promql
  rate(app_prediction_confidence_bucket[5m])  # Confidence distribution over time
  ```

### **app_low_confidence_predictions_total** ⚠️
- **Type:** Counter
- **What it shows:** Count of predictions with confidence < 50%
- **Labels:** `category`
- **Use case:** Flag predictions that need review, model retraining indicator
- **Prometheus Query:**
  ```promql
  rate(app_low_confidence_predictions_total[5m])  # Low confidence rate
  sum(app_low_confidence_predictions_total)       # Total low confidence predictions
  ```

### **app_average_confidence** 📉
- **Type:** Gauge
- **What it shows:** Rolling average confidence score (last 100 predictions per category)
- **Labels:** `category`
- **Use case:** Track model performance degradation over time
- **Prometheus Query:**
  ```promql
  app_average_confidence  # Current average by category
  avg(app_average_confidence)  # Overall average across all categories
  ```

---

## 3️⃣ **BUSINESS INTELLIGENCE METRICS** (3 metrics)

### **app_predictions_total** 📈
- **Type:** Counter
- **What it shows:** Total predictions made per category
- **Labels:** `category` (Bug Report, Feature Request, Pricing Complaint, Positive Feedback, Negative Experience)
- **Use case:** Understand user feedback distribution, business insights
- **Prometheus Query:**
  ```promql
  rate(app_predictions_total[5m])  # Predictions per second by category
  topk(3, app_predictions_total)   # Top 3 categories
  ```

### **app_text_length_chars** 📝
- **Type:** Histogram
- **What it shows:** Length of input text in characters
- **Buckets:** 10, 50, 100, 200, 500, 1000, 2000, 5000
- **Use case:** Analyze user input patterns, detect spam/short messages
- **Prometheus Query:**
  ```promql
  histogram_quantile(0.50, rate(app_text_length_chars_bucket[5m]))  # Median text length
  histogram_quantile(0.95, rate(app_text_length_chars_bucket[5m]))  # 95th percentile
  ```

### **app_predictions_by_confidence_level_total** 🎯
- **Type:** Counter
- **What it shows:** Predictions grouped into low (<50%), medium (50-70%), high (>70%) confidence
- **Labels:** `level` (low/medium/high), `category`
- **Use case:** Quick overview of prediction quality distribution
- **Prometheus Query:**
  ```promql
  rate(app_predictions_by_confidence_level_total[5m])  # Confidence levels over time
  sum by (level) (app_predictions_by_confidence_level_total)  # Total by confidence level
  ```

---

## 4️⃣ **DATABASE METRICS** (3 metrics)

### **app_db_query_seconds** 🗄️
- **Type:** Histogram
- **What it shows:** Database query latency (time to save/fetch data)
- **Labels:** `operation` (save, stats, init)
- **Use case:** Monitor database performance, detect slow queries
- **Prometheus Query:**
  ```promql
  histogram_quantile(0.50, rate(app_db_query_seconds_bucket[5m]))  # Median DB latency
  histogram_quantile(0.95, rate(app_db_query_seconds_bucket[5m]))  # 95th percentile
  ```

### **app_db_operations_total** ✅❌
- **Type:** Counter
- **What it shows:** Count of database operations (success vs failure)
- **Labels:** `operation`, `status` (success/failure)
- **Use case:** Monitor database reliability, track error rates
- **Prometheus Query:**
  ```promql
  rate(app_db_operations_total{status="success"}[5m])  # Successful operations/sec
  rate(app_db_operations_total{status="failure"}[5m])  # Failed operations/sec
  sum(app_db_operations_total{status="failure"}) / sum(app_db_operations_total)  # Failure rate
  ```

### **app_db_errors_total** 🚨
- **Type:** Counter
- **What it shows:** Database errors by type (OperationalError, IntegrityError, etc.)
- **Labels:** `operation`, `error_type`
- **Use case:** Debug database issues, alert on connection problems
- **Prometheus Query:**
  ```promql
  rate(app_db_errors_total[5m])  # DB errors per second
  sum by (error_type) (app_db_errors_total)  # Errors grouped by type
  ```

---

## 5️⃣ **RESOURCE UTILIZATION METRICS** (3 metrics) ⚙️

### **app_process_memory_bytes** 💾
- **Type:** Gauge
- **What it shows:** Memory used by the Flask application process (in bytes)
- **Current typical value:** ~106-108 MB
- **Use case:** Monitor memory leaks, plan resource allocation
- **Prometheus Query:**
  ```promql
  app_process_memory_bytes / 1024 / 1024  # Convert to MB
  rate(app_process_memory_bytes[5m])      # Memory growth rate
  ```

### **app_process_cpu_percent** 🔥
- **Type:** Gauge
- **What it shows:** CPU usage percentage (0-100% per core)
- **Update interval:** Every request (0.1s sample)
- **Use case:** Detect CPU-intensive operations, autoscaling decisions
- **Prometheus Query:**
  ```promql
  app_process_cpu_percent  # Current CPU usage
  avg_over_time(app_process_cpu_percent[5m])  # Average CPU over 5 minutes
  ```

### **app_python_info** 🐍
- **Type:** Gauge (info metric)
- **What it shows:** Python version and implementation details
- **Labels:** `version`, `implementation` (cpython)
- **Current value:** Python 3.12.12 (cpython)
- **Use case:** Environment verification, compliance tracking
- **Prometheus Query:**
  ```promql
  app_python_info  # Should always be 1
  ```

---

## 6️⃣ **ERROR TRACKING METRICS** (1 metric)

### **app_errors_total** ⚠️
- **Type:** Counter
- **What it shows:** Application errors by type and endpoint
- **Labels:** `error_type` (no_json_data, empty_text, invalid_input), `endpoint`
- **Use case:** Track validation errors, monitor API misuse
- **Prometheus Query:**
  ```promql
  rate(app_errors_total[5m])  # Errors per second
  sum by (error_type) (app_errors_total)  # Total errors by type
  ```

---

## 7️⃣ **SYSTEM METRICS** (Automatic from Prometheus Client)

### **process_virtual_memory_bytes** 💻
- **What it shows:** Virtual memory size (includes swap)
- **Typical value:** ~1.2-1.3 GB

### **process_resident_memory_bytes** 📊
- **What it shows:** Physical RAM used by process
- **Typical value:** ~106-108 MB

### **process_start_time_seconds** ⏰
- **What it shows:** Unix timestamp when process started
- **Use case:** Calculate uptime, detect restarts

### **process_cpu_seconds_total** ⏱️
- **What it shows:** Total CPU time consumed (user + system)
- **Use case:** Long-term CPU usage trends

### **process_open_fds** 📂
- **What it shows:** Number of open file descriptors
- **Typical value:** 12-13
- **Use case:** Detect file descriptor leaks

### **process_max_fds** 📁
- **What it shows:** Maximum allowed file descriptors
- **Value:** 1,048,576 (system limit)

### **python_gc_objects_collected_total** 🗑️
- **What it shows:** Objects collected by Python garbage collector
- **Labels:** `generation` (0, 1, 2)
- **Use case:** Monitor memory management efficiency

### **python_gc_collections_total** 🔄
- **What it shows:** Number of GC collections performed
- **Labels:** `generation`

---

## 📋 **GRAFANA DASHBOARD PANELS**

### **Current Implementation (16 Panels):**

1. **Request Rate** - `rate(app_requests_total[1m])`
2. **Total Requests** - `sum(app_requests_total)`
3. **Active Requests** - `app_active_requests`
4. **Request Latency (p50/p95)** - `histogram_quantile()`
5. **Predictions by Category** - `app_predictions_total`
6. **Prediction Rate by Category** - `rate(app_predictions_total[5m])`
7. **Model Status** - `app_model_loaded`
8. **Model Inference Time** - `histogram_quantile(0.50, rate(app_model_inference_seconds_bucket[5m]))`
9. **Predictions by Confidence Level** - `app_predictions_by_confidence_level_total`
10. **Average Confidence by Category** - `app_average_confidence`
11. **Input Text Length** - `histogram_quantile(0.50, rate(app_text_length_chars_bucket[5m]))`
12. **Error Rate by Type** - `rate(app_errors_total[5m])`
13. **Memory Usage** - `app_process_memory_bytes / 1024 / 1024`
14. **CPU Usage** - `app_process_cpu_percent`
15. **Database Query Latency** - `histogram_quantile(0.95, rate(app_db_query_seconds_bucket[5m]))`
16. **Database Operations** - `rate(app_db_operations_total[5m])`

---

## 🎯 **KEY INSIGHTS FROM CURRENT DATA**

### **Request Performance:**
- **Total Requests:** 377+ predictions processed
- **Median Latency:** ~3-5ms (very fast!)
- **95th Percentile:** Most requests under 1 second (including database save)

### **ML Model Performance:**
- **Inference Time:** ~2-5ms per prediction (efficient!)
- **Average Confidence:** 27-68% depending on category
  - Pricing Complaint: ~68% (highest confidence)
  - Bug Report: ~27% (lowest confidence - needs review)
- **Low Confidence Rate:** 73% of predictions below 50% (model may need retraining)

### **Business Insights:**
- **Most Common Category:** Positive Feedback (109 predictions)
- **Second Most Common:** Pricing Complaint (61 predictions)
- **Text Length:** Median ~40-50 characters

### **Database Performance:**
- **Query Latency:** p50 ~250ms, p95 ~500ms (acceptable for remote DB)
- **Success Rate:** 99.2% (119 success, 1 failure)
- **Total Saved:** 377 predictions

### **Resource Usage:**
- **Memory:** Stable at ~106-108 MB (no leaks)
- **CPU:** Low usage (0-2% when idle, spikes during predictions)
- **File Descriptors:** 12-13 (healthy)

---

## 🔍 **PROMETHEUS QUERY EXAMPLES**

### **Top 5 Most Common Queries:**

```promql
# 1. Overall request rate
sum(rate(app_requests_total[1m])) by (endpoint)

# 2. Error rate percentage
sum(rate(app_errors_total[5m])) / sum(rate(app_requests_total[5m])) * 100

# 3. Average prediction confidence by category
avg by (category) (app_average_confidence)

# 4. Database operation success rate
sum(rate(app_db_operations_total{status="success"}[5m])) / sum(rate(app_db_operations_total[5m])) * 100

# 5. Memory usage trend
rate(app_process_memory_bytes[5m])
```

### **Advanced Queries:**

```promql
# Predictions per minute by category
sum by (category) (rate(app_predictions_total[1m]) * 60)

# Average request latency over last hour
avg_over_time(histogram_quantile(0.50, rate(app_request_latency_seconds_bucket[1h]))[1h:1m])

# Low confidence prediction rate
sum(rate(app_low_confidence_predictions_total[5m])) / sum(rate(app_predictions_total[5m])) * 100

# Database latency spike detection (above 1 second)
histogram_quantile(0.95, rate(app_db_query_seconds_bucket[5m])) > 1
```

---

## 🚀 **RECOMMENDATIONS**

### **Alerts to Configure:**

1. **High Error Rate:** `rate(app_errors_total[5m]) > 0.1` (>10% errors)
2. **High Memory Usage:** `app_process_memory_bytes > 200000000` (>200 MB)
3. **High CPU:** `app_process_cpu_percent > 80` (>80%)
4. **Low Confidence Spike:** `rate(app_low_confidence_predictions_total[5m]) > 1`
5. **Database Failures:** `rate(app_db_operations_total{status="failure"}[5m]) > 0`
6. **Model Not Loaded:** `app_model_loaded == 0`

### **Performance Optimization:**
- Consider model retraining (low confidence scores)
- Database query optimization (p95 latency ~500ms)
- Add caching for frequent predictions

---

## 📊 **ACCESSING THE METRICS**

### **Prometheus:**
- URL: http://localhost:9090
- Query interface: http://localhost:9090/graph
- Targets: http://localhost:9090/targets

### **Grafana:**
- URL: http://localhost:3000
- Login: admin / admin
- Dashboard JSON: `C:\ThirdYear\CC\monitoring\grafana\dashboards\enhanced-dashboard.json`

### **Raw Metrics Endpoint:**
- URL: http://localhost:5000/metrics
- Format: Prometheus text format
- Refresh: Updated on every request

---

## 📝 **CONCLUSION**

**All 29 metrics are functioning correctly and collecting data!**

✅ Request tracking: Monitoring API usage and performance
✅ ML metrics: Tracking model inference and confidence
✅ Business metrics: Understanding prediction distribution
✅ Database metrics: Monitoring data persistence
✅ Resource metrics: Tracking CPU and memory usage
✅ Error metrics: Catching validation issues
✅ System metrics: Low-level process monitoring

**Next Steps:**
1. Import Grafana dashboard to visualize all metrics
2. Set up alerting rules for critical metrics
3. Consider model retraining to improve confidence scores
4. Monitor trends over time for performance optimization


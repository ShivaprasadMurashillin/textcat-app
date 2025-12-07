# 🐳 Docker + Prometheus + Grafana Monitoring Stack
## ML Text Categorization API with Full Observability

<p align="center">
  <img src="https://img.shields.io/badge/Docker-2496ED?style=for-the-badge&logo=docker&logoColor=white" alt="Docker">
  <img src="https://img.shields.io/badge/Prometheus-E6522C?style=for-the-badge&logo=prometheus&logoColor=white" alt="Prometheus">
  <img src="https://img.shields.io/badge/Grafana-F46800?style=for-the-badge&logo=grafana&logoColor=white" alt="Grafana">
  <img src="https://img.shields.io/badge/Python-3776AB?style=for-the-badge&logo=python&logoColor=white" alt="Python">
</p>

---

## 📋 Overview

Production-ready monitoring system for a Machine Learning Flask API that categorizes customer feedback. The stack includes:

- **Flask Application**: ML-powered text categorization (87.23% accuracy)
- **Prometheus**: Metrics collection and time-series database
- **Grafana**: Real-time visualization dashboards (15 panels)
- **PostgreSQL**: Predictions storage

**Features:**
- 🎯 29 metrics tracked (request, ML performance, database, resources)
- 📊 Real-time dashboard with 15 visualization panels
- 🐳 Fully containerized with Docker Compose
- ☁️ Cloud deployment ready (Render)
- 🔒 Secure environment variable management

---

## 🚀 Quick Start

### Prerequisites
- Docker & Docker Compose installed
- Git

### Local Development Setup

1. **Clone repository:**
   ```bash
   git clone <your-repo-url>
   cd DockerRelated
   ```

2. **Set up environment:**
   ```bash
   cp .env.example .env
   # Edit .env with your database credentials
   ```

3. **Start the stack:**
   ```bash
   docker-compose up -d
   ```

4. **Access services:**
   - **Flask API**: http://localhost:5000
   - **Prometheus**: http://localhost:9090
   - **Grafana**: http://localhost:3000 (admin/admin)

5. **Import Grafana Dashboard:**
   - Open Grafana → Dashboards → Import
   - Upload: `grafana/dashboards/enhanced-dashboard.json`

---

## 📊 Monitoring Dashboard

The Grafana dashboard visualizes 15 key metrics:

### Request Metrics
- Request Rate (requests/second)
- Total Requests Counter
- Active Requests Gauge
- Request Latency (p50 & p95)

### ML Performance
- Model Inference Time
- Predictions by Category
- Prediction Rate by Category
- Average Confidence by Category
- Predictions by Confidence Level

### System Resources
- CPU Usage
- Memory Usage
- Input Text Length Distribution

### Database Metrics
- Query Latency (p50 & p95)
- Database Operations (success/failure)

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│          Docker Compose Stack               │
│                                             │
│  ┌──────────────┐       ┌──────────────┐   │
│  │  Flask App   │◄──────┤  Prometheus  │   │
│  │  Port 5000   │ scrape│  Port 9090   │   │
│  │  /metrics    │       └──────┬───────┘   │
│  └──────────────┘              │           │
│                                 │ query    │
│                         ┌───────▼───────┐   │
│                         │   Grafana     │   │
│                         │   Port 3000   │   │
│                         └───────────────┘   │
│                                             │
│  Network: monitoring (bridge)               │
└─────────────────────────────────────────────┘
          │
          ▼
┌─────────────────────┐
│  PostgreSQL (Cloud) │
│  Render Database    │
└─────────────────────┘
```

---

## 📁 Project Structure

```
DockerRelated/
├── docker-compose.yml           # Multi-container orchestration
├── .env.example                 # Environment template
├── .gitignore                   # Git ignore rules
│
├── prometheus/
│   └── prometheus.yml           # Prometheus config
│
├── grafana/
│   ├── provisioning/
│   │   ├── datasources/         # Auto-provision datasource
│   │   └── dashboards/          # Auto-load dashboards
│   └── dashboards/
│       └── enhanced-dashboard.json  # 15-panel dashboard
│
├── render-prometheus/           # Cloud deployment (Prometheus)
├── render-grafana/              # Cloud deployment (Grafana)
│
├── scripts/
│   ├── quick_demo.ps1          # Verification script
│   └── generate_traffic.ps1   # Load testing
│
└── docs/
    ├── RENDER_DEPLOYMENT_GUIDE.md    # Cloud deployment
    ├── DEPLOYMENT_DEMO_GUIDE.md      # Local demo guide
    ├── METRICS_DOCUMENTATION.md      # All metrics explained
    └── METRICS_SUMMARY.txt           # Quick reference
```

---

## 🔧 Configuration

### Environment Variables

Create `.env` file (from `.env.example`):

```bash
# Database Configuration
DATABASE_URL=postgresql://user:password@host/database

# Grafana Configuration
GF_SECURITY_ADMIN_USER=admin
GF_SECURITY_ADMIN_PASSWORD=your_password
```

### Prometheus Scraping

Configured in `prometheus/prometheus.yml`:
- **Scrape interval**: 5 seconds
- **Target**: Flask app at `app:5000/metrics`
- **Retention**: 15 days

---

## 📈 Metrics Overview

### 29 Metrics Tracked

**Request Tracking (5)**
- `app_requests_total` - Total API requests
- `app_request_latency_seconds` - Response time histogram
- `app_active_requests` - Current concurrent requests
- `app_model_loaded` - Model health status

**ML Performance (4)**
- `app_model_inference_seconds` - Prediction latency
- `app_prediction_confidence` - Model confidence scores
- `app_low_confidence_predictions_total` - Quality tracking
- `app_average_confidence` - Category confidence averages

**Business Intelligence (3)**
- `app_predictions_total` - Predictions per category
- `app_text_length_chars` - Input text distribution
- `app_predictions_by_confidence_level_total` - Quality levels

**Database (3)**
- `app_db_query_seconds` - Database latency
- `app_db_operations_total` - Operations counter
- `app_db_errors_total` - Error tracking

**Resources (3)**
- `app_process_memory_bytes` - RAM usage
- `app_process_cpu_percent` - CPU utilization
- `app_python_info` - Python version

**+ 11 System metrics** (process stats, GC stats)

Full documentation: [`docs/METRICS_DOCUMENTATION.md`](docs/METRICS_DOCUMENTATION.md)

---

## ☁️ Cloud Deployment

### Deploy to Render (Free Tier)

Deploy 3 separate services:

1. **Flask App** → Already deployed
2. **Prometheus** → Use `render-prometheus/` directory
3. **Grafana** → Use `render-grafana/` directory

**Step-by-step guide:** [`docs/RENDER_DEPLOYMENT_GUIDE.md`](docs/RENDER_DEPLOYMENT_GUIDE.md)

**Result:**
- Flask API: `https://textcat-app.onrender.com`
- Prometheus: `https://textcat-prometheus.onrender.com`
- Grafana: `https://textcat-grafana.onrender.com`

---

## 🧪 Testing

### Quick Demo Script

```powershell
.\scripts\quick_demo.ps1
```

Verifies:
- All 3 containers running
- Flask app responding
- Prometheus scraping
- Grafana accessible
- Database connected

### Generate Traffic

```powershell
.\scripts\generate_traffic.ps1
```

Sends 50 diverse predictions to show live metrics.

---

## 📊 Dashboard Panels

| Row | Panels | Metrics |
|-----|--------|---------|
| 1 | Request Rate, Total Requests, Active Requests, Request Latency | Real-time request tracking |
| 2 | Predictions by Category, Prediction Rate, Model Status | ML performance |
| 3 | Model Inference Time, Confidence Levels, Avg Confidence | Prediction quality |
| 4 | Input Text Length, Memory Usage, CPU Usage | System resources |
| 5 | DB Query Latency, DB Operations | Database health |

---

## 🔒 Security

**Protected files** (not committed to Git):
- `.env` - Contains database credentials
- `logs/` - Application logs
- `*-data/` - Docker volumes
- `*_key.json` - Service account keys

**Safe for GitHub:**
- `.env.example` - Template only
- All configuration files use environment variables
- No hardcoded secrets

---

## 🛠️ Development

### Add New Metrics

1. **Instrument in Flask app:**
   ```python
   from prometheus_client import Counter
   
   MY_METRIC = Counter('app_my_metric', 'Description')
   MY_METRIC.inc()
   ```

2. **Prometheus auto-discovers** via scraping

3. **Add to Grafana:**
   - Create new panel
   - Query: `rate(app_my_metric[1m])`

### Customize Dashboard

Edit `grafana/dashboards/enhanced-dashboard.json` or use Grafana UI.

---

## 📖 Documentation

- **[Cloud Deployment Guide](docs/RENDER_DEPLOYMENT_GUIDE.md)** - Deploy to Render
- **[Local Demo Guide](docs/DEPLOYMENT_DEMO_GUIDE.md)** - Run locally
- **[Metrics Documentation](docs/METRICS_DOCUMENTATION.md)** - All 29 metrics explained
- **[Metrics Summary](docs/METRICS_SUMMARY.txt)** - Quick reference

---

## 🎯 Use Cases

- **Performance Monitoring**: Track request latency, throughput
- **ML Model Observability**: Monitor inference time, confidence scores
- **Resource Management**: CPU, memory usage tracking
- **Database Health**: Query latency, operation success rates
- **Business Analytics**: Prediction distribution, user behavior

---

## 📝 Requirements

- Docker 20.10+
- Docker Compose 2.0+
- 2GB RAM minimum
- Python 3.12 (for Flask app)

---

## 🤝 Contributing

1. Fork the repository
2. Create feature branch (`git checkout -b feature/amazing-feature`)
3. Commit changes (`git commit -m 'Add amazing feature'`)
4. Push to branch (`git push origin feature/amazing-feature`)
5. Open Pull Request

---

## 📄 License

This project is for educational purposes.

---

## 🙏 Acknowledgments

- **Prometheus** - Metrics collection
- **Grafana** - Visualization
- **Docker** - Containerization
- **Render** - Cloud hosting

---

## 📞 Support

For issues or questions:
1. Check [documentation](docs/)
2. Review [deployment guides](docs/RENDER_DEPLOYMENT_GUIDE.md)
3. Open an issue on GitHub

---

**Built with ❤️ for production-grade ML monitoring**

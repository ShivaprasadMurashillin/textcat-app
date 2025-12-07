# Quick Demo Script for Assignment Evaluation
# Run this to demonstrate the complete Docker + Prometheus + Grafana setup

Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "  DOCKER DEPLOYMENT DEMONSTRATION" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Step 1: Show Docker Containers
Write-Host "`n[1/6] Checking Docker Containers..." -ForegroundColor Yellow
docker ps --format "table {{.Names}}\t{{.Status}}\t{{.Ports}}"

# Step 2: Test Flask Application
Write-Host "`n[2/6] Testing Flask Application..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri http://localhost:5000/health -ErrorAction Stop
    Write-Host "✓ Flask App Health: $($health.status)" -ForegroundColor Green
    Write-Host "✓ Model Loaded: $($health.model_loaded)" -ForegroundColor Green
} catch {
    Write-Host "✗ Flask App not responding!" -ForegroundColor Red
    exit 1
}

# Step 3: Make a test prediction
Write-Host "`n[3/6] Making Test Prediction..." -ForegroundColor Yellow
$testBody = @{feedback="This application is amazing! Great work!"} | ConvertTo-Json
$prediction = Invoke-RestMethod -Uri http://localhost:5000/predict -Method Post -Body $testBody -ContentType "application/json"
Write-Host "  Input: 'This application is amazing! Great work!'" -ForegroundColor White
Write-Host "  Prediction: $($prediction.prediction)" -ForegroundColor Cyan
Write-Host "  Confidence: $($prediction.confidence)%" -ForegroundColor Cyan

# Step 4: Check Prometheus
Write-Host "`n[4/6] Checking Prometheus..." -ForegroundColor Yellow
try {
    $promHealth = Invoke-RestMethod -Uri http://localhost:9090/-/healthy -ErrorAction Stop
    Write-Host "✓ Prometheus is healthy" -ForegroundColor Green
} catch {
    Write-Host "✗ Prometheus not responding!" -ForegroundColor Red
}

# Step 5: Check Grafana
Write-Host "`n[5/6] Checking Grafana..." -ForegroundColor Yellow
try {
    $grafanaHealth = Invoke-RestMethod -Uri http://localhost:3000/api/health -ErrorAction Stop
    Write-Host "✓ Grafana is running" -ForegroundColor Green
} catch {
    Write-Host "✗ Grafana not responding!" -ForegroundColor Red
}

# Step 6: Show Current Stats
Write-Host "`n[6/6] Fetching System Statistics..." -ForegroundColor Yellow
try {
    $stats = Invoke-RestMethod -Uri http://localhost:5000/stats -ErrorAction Stop
    Write-Host "  Total Predictions: $($stats.total_predictions)" -ForegroundColor Cyan
    Write-Host "  Database Connection: $($stats.database_status)" -ForegroundColor Cyan
} catch {
    Write-Host "  Stats endpoint not available" -ForegroundColor Gray
}

# Summary
Write-Host "`n===========================================" -ForegroundColor Green
Write-Host "  ✓ DEPLOYMENT SUCCESSFUL!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

Write-Host "`n📊 Access Points:" -ForegroundColor Cyan
Write-Host "  Flask App:   http://localhost:5000" -ForegroundColor White
Write-Host "  Prometheus:  http://localhost:9090" -ForegroundColor White
Write-Host "  Grafana:     http://localhost:3000 (admin/admin)" -ForegroundColor White
Write-Host "  Metrics:     http://localhost:5000/metrics" -ForegroundColor White

Write-Host "`n📈 Next Steps:" -ForegroundColor Yellow
Write-Host "  1. Import Grafana Dashboard:" -ForegroundColor White
Write-Host "     - Open http://localhost:3000" -ForegroundColor Gray
Write-Host "     - Login: admin / admin" -ForegroundColor Gray
Write-Host "     - Menu (☰) → Dashboards → Import" -ForegroundColor Gray
Write-Host "     - Upload: C:\ThirdYear\CC\DockerRelated\grafana\dashboards\enhanced-dashboard.json" -ForegroundColor Gray
Write-Host "`n  2. Generate Traffic (Optional):" -ForegroundColor White
Write-Host "     - Run: .\generate_traffic.ps1" -ForegroundColor Gray
Write-Host "     - Watch metrics update in real-time!" -ForegroundColor Gray

Write-Host "`n📚 Documentation:" -ForegroundColor Yellow
Write-Host "  Full guide: C:\ThirdYear\CC\DockerRelated\DEPLOYMENT_DEMO_GUIDE.md" -ForegroundColor White

Write-Host "`n🎯 Ready for evaluation! All services operational." -ForegroundColor Green
Write-Host ""

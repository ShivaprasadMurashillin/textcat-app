# Test Railway Deployment - Generate 50 Predictions

$flaskUrl = "https://textcat-app-production.up.railway.app"

Write-Host "`n=== Testing Railway Deployment ===" -ForegroundColor Cyan
Write-Host "Flask API: $flaskUrl" -ForegroundColor White

# Test health endpoint
Write-Host "`nChecking Flask health..." -ForegroundColor Yellow
try {
    $health = Invoke-RestMethod -Uri "$flaskUrl/health"
    Write-Host "✓ Flask is healthy: $($health.status)" -ForegroundColor Green
    Write-Host "✓ Model loaded: $($health.model_loaded)" -ForegroundColor Green
} catch {
    Write-Host "✗ Flask health check failed" -ForegroundColor Red
    exit 1
}

# Sample feedbacks
$feedbacks = @(
    "This application is fantastic! Love the interface.",
    "Great job! Very impressed with the quality.",
    "The application crashes when I upload files.",
    "Getting a 500 error. Please fix this bug.",
    "Please add dark mode support!",
    "Feature request: export to CSV would help.",
    "The premium plan is too expensive.",
    "Your pricing is unfair compared to competitors.",
    "Very slow loading times. Takes forever.",
    "The app is extremely laggy during peak hours.",
    "Excellent work! Runs smoothly.",
    "Amazing! Best tool I've used.",
    "Critical bug: data not saving.",
    "App freezes on mobile devices.",
    "Can you add multi-language support?",
    "Please implement two-factor authentication.",
    "Cannot afford the subscription prices.",
    "Pricing structure needs to be reasonable.",
    "Poor performance on older devices.",
    "Loading time is unacceptable.",
    "Outstanding performance! Very happy.",
    "Login functionality is broken.",
    "Would be great to have API docs.",
    "Too expensive! Offer a free tier.",
    "Mobile app performance is terrible."
)

Write-Host "`n=== Sending 50 Predictions ===" -ForegroundColor Cyan
$successCount = 0
$errorCount = 0

for ($i = 1; $i -le 50; $i++) {
    $feedback = $feedbacks[$i % $feedbacks.Length]
    
    try {
        $body = @{feedback=$feedback} | ConvertTo-Json
        $result = Invoke-RestMethod -Uri "$flaskUrl/predict" -Method Post -Body $body -ContentType "application/json"
        
        $color = if ($result.confidence -ge 40) { "Green" } elseif ($result.confidence -ge 30) { "Yellow" } else { "Red" }
        
        Write-Host "[$i/50] " -NoNewline
        Write-Host "$($result.prediction)" -NoNewline -ForegroundColor $color
        Write-Host " ($([math]::Round($result.confidence, 1))%)" -ForegroundColor Gray
        
        $successCount++
    } catch {
        Write-Host "[$i/50] Request failed" -ForegroundColor Red
        $errorCount++
    }
    
    Start-Sleep -Milliseconds 100
}

Write-Host "`n=== Test Complete ===" -ForegroundColor Green
Write-Host "Successful: $successCount" -ForegroundColor Green
Write-Host "Failed: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Gray" })

Write-Host "`n=== Check Your Dashboards ===" -ForegroundColor Cyan
Write-Host "Prometheus: https://impartial-prosperity-production.up.railway.app/metrics" -ForegroundColor White
Write-Host "Grafana: [Your Grafana Railway URL]" -ForegroundColor White
Write-Host "`nWait 10-15 seconds for metrics to update in Grafana dashboards" -ForegroundColor Yellow

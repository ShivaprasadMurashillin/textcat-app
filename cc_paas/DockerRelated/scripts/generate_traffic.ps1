# Generate Traffic Script - Creates realistic prediction requests
# Run this to populate Grafana dashboard with live metrics

Write-Host "`n===========================================" -ForegroundColor Cyan
Write-Host "  TRAFFIC GENERATION FOR DEMO" -ForegroundColor Cyan
Write-Host "===========================================" -ForegroundColor Cyan

# Diverse feedback samples representing all 5 categories
$feedbacks = @(
    # Positive Feedback
    "This application is absolutely fantastic! Love the interface and performance.",
    "Great job on this project! Very impressed with the quality.",
    "Excellent work! The app runs smoothly and does exactly what I need.",
    "Amazing application! Best tool I've used in a while.",
    "Outstanding performance! Very happy with the results.",
    
    # Technical Issues
    "The application crashes when I try to upload large files.",
    "Getting a 500 error on the login page. Please fix this bug.",
    "Critical bug: data not saving properly after form submission.",
    "App freezes frequently on mobile devices. Needs optimization.",
    "Login functionality is completely broken on Chrome browser.",
    
    # Feature Requests
    "Please add dark mode support! It would be very useful.",
    "Feature request: export data to CSV format would be helpful.",
    "Can you add multi-language support? Would love to use it in Spanish.",
    "Please implement two-factor authentication for better security.",
    "Would be great to have API documentation and developer access.",
    
    # Pricing Concerns
    "The premium plan is way too expensive for small businesses.",
    "Your pricing model is unfair compared to competitors.",
    "Cannot afford the current subscription prices. Too costly.",
    "The pricing structure needs to be more transparent and reasonable.",
    "Too expensive! Please offer a free tier with basic features.",
    
    # Performance Complaints
    "Very slow loading times. Takes forever to open the dashboard.",
    "The app is extremely laggy and unresponsive during peak hours.",
    "Poor performance on older devices. Needs better optimization.",
    "Loading time is unacceptable. Page takes 30+ seconds to load.",
    "Mobile app performance is terrible. Desktop version works fine though."
)

$totalRequests = 50
$successCount = 0
$errorCount = 0

Write-Host "`nGenerating $totalRequests prediction requests..." -ForegroundColor Yellow
Write-Host "(Open Grafana at http://localhost:3000 to watch live updates)`n" -ForegroundColor Gray

$startTime = Get-Date

for ($i = 1; $i -le $totalRequests; $i++) {
    $feedback = $feedbacks[$i % $feedbacks.Length]
    
    try {
        $body = @{feedback=$feedback} | ConvertTo-Json
        $result = Invoke-RestMethod -Uri http://localhost:5000/predict -Method Post -Body $body -ContentType "application/json" -ErrorAction Stop
        
        # Color code by confidence
        $color = if ($result.confidence -ge 40) { "Green" } elseif ($result.confidence -ge 30) { "Yellow" } else { "Red" }
        
        Write-Host "[$i/$totalRequests] " -NoNewline -ForegroundColor White
        Write-Host "$($result.prediction)" -NoNewline -ForegroundColor $color
        Write-Host " ($([math]::Round($result.confidence, 1))%) " -NoNewline -ForegroundColor Gray
        Write-Host "✓" -ForegroundColor Green
        
        $successCount++
    } catch {
        Write-Host "[$i/$totalRequests] Request failed ✗" -ForegroundColor Red
        $errorCount++
    }
    
    # Small delay to make metrics observable in Grafana
    Start-Sleep -Milliseconds 100
}

$endTime = Get-Date
$duration = ($endTime - $startTime).TotalSeconds

Write-Host "`n===========================================" -ForegroundColor Green
Write-Host "  TRAFFIC GENERATION COMPLETE!" -ForegroundColor Green
Write-Host "===========================================" -ForegroundColor Green

Write-Host "`n📊 Statistics:" -ForegroundColor Cyan
Write-Host "  Total Requests: $totalRequests" -ForegroundColor White
Write-Host "  Successful: $successCount" -ForegroundColor Green
Write-Host "  Failed: $errorCount" -ForegroundColor $(if ($errorCount -gt 0) { "Red" } else { "Gray" })
Write-Host "  Duration: $([math]::Round($duration, 2)) seconds" -ForegroundColor White
Write-Host "  Throughput: $([math]::Round($totalRequests / $duration, 2)) requests/sec" -ForegroundColor White

Write-Host "`n🎯 What to observe in Grafana:" -ForegroundColor Yellow
Write-Host "  ✓ Request Rate spike in 'Request Rate' panel" -ForegroundColor White
Write-Host "  ✓ Total Requests counter increased by $successCount" -ForegroundColor White
Write-Host "  ✓ Predictions distributed across 5 categories (pie chart)" -ForegroundColor White
Write-Host "  ✓ CPU usage spike during processing" -ForegroundColor White
Write-Host "  ✓ Memory usage stable (should stay around 100-110 MB)" -ForegroundColor White
Write-Host "  ✓ Request latency showing ~3-5ms median" -ForegroundColor White
Write-Host "  ✓ Database operations showing INSERT queries" -ForegroundColor White

Write-Host "`n📈 Grafana Dashboard: http://localhost:3000" -ForegroundColor Cyan
Write-Host "   Dashboard will update in real-time (5s refresh)" -ForegroundColor Gray

Write-Host ""

# Test Script - Generate Sample Predictions

Write-Host "🚀 Testing Text Categorization API..." -ForegroundColor Cyan

$testFeedbacks = @(
    "Your product is amazing! I love it.",
    "The app crashes every time I try to upload a file.",
    "Can you add dark mode feature?",
    "The pricing is too expensive for small businesses.",
    "Worst experience ever. Customer support is terrible.",
    "The new update works perfectly!",
    "I found a bug in the payment system.",
    "Please add integration with Google Calendar.",
    "Why is the premium plan so costly?",
    "Excellent service, highly recommended!"
)

Write-Host "`nSending $($testFeedbacks.Count) test predictions..." -ForegroundColor Yellow
Write-Host ""

$count = 1
foreach ($text in $testFeedbacks) {
    try {
        $body = @{text = $text} | ConvertTo-Json
        $response = Invoke-RestMethod -Uri "http://localhost:5000/predict" -Method POST -Body $body -ContentType "application/json"
        
        Write-Host "[$count] " -NoNewline -ForegroundColor White
        Write-Host "$($response.prediction)" -NoNewline -ForegroundColor Green
        Write-Host " ($($response.confidence)% confidence)" -ForegroundColor Gray
        Write-Host "    Text: $($text.Substring(0, [Math]::Min(60, $text.Length)))..." -ForegroundColor DarkGray
        
        $count++
        Start-Sleep -Milliseconds 500
    }
    catch {
        Write-Host "❌ Error: $_" -ForegroundColor Red
    }
}

Write-Host "`n✅ Test completed!" -ForegroundColor Green
Write-Host "`n📊 View metrics at:" -ForegroundColor Cyan
Write-Host "   - Prometheus: http://localhost:9090" -ForegroundColor White
Write-Host "   - Grafana:    http://localhost:3000 (admin/admin)" -ForegroundColor White
Write-Host "   - App:        http://localhost:5000" -ForegroundColor White

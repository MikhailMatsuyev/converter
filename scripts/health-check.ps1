# health-check.ps1
Write-Host "🏥 Health check for AI File Processor services" -ForegroundColor Cyan
Write-Host "==============================================" -ForegroundColor Cyan
Write-Host ""

# Проверка локального сервиса
Write-Host "=== LOCAL SERVICE ===" -ForegroundColor Green
$localUrl = "http://localhost:3000/health"

try {
    $response = Invoke-WebRequest -Uri $localUrl -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Local service is UP (HTTP $($response.StatusCode))" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Local service not running or error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""

# Проверка Koyeb сервиса
Write-Host "=== KOYEB SERVICE ===" -ForegroundColor Green
# ⚠️ ЗАМЕНИТЕ 'your-username' на ваш логин Koyeb или имя сервиса
$koyebUsername = "your-username"  
$koyebUrl = "https://ai-file-processor-backend-$koyebUsername.koyeb.app/health"

try {
    $response = Invoke-WebRequest -Uri $koyebUrl -TimeoutSec 10 -ErrorAction Stop
    Write-Host "✅ Koyeb service is UP (HTTP $($response.StatusCode))" -ForegroundColor Green
    Write-Host "Response: $($response.Content)" -ForegroundColor Gray
} catch {
    Write-Host "❌ Koyeb service not responding or error: $($_.Exception.Message)" -ForegroundColor Red
}

Write-Host ""
Write-Host "=== QUICK COMMANDS ===" -ForegroundColor Yellow
Write-Host "To see Koyeb logs: https://app.koyeb.com/apps/ai-file-processor-backend/logs"
Write-Host "To restart local: docker-compose up -d"
Write-Host "To stop local: docker-compose down"
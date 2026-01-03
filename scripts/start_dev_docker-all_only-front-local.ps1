Write-Host "========================================" -ForegroundColor Cyan
Write-Host "   AI File Processor - Development      " -ForegroundColor Yellow
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Пути
$PROJECT_ROOT = "E:\project\converter"
$FRONTEND_DIR = "$PROJECT_ROOT\frontend"
$COMPOSE_FILE = "$PROJECT_ROOT\docker-compose.dev.yml"

# Проверка Docker
Write-Host "Checking Docker..." -ForegroundColor Gray
try {
    docker --version | Out-Null
    Write-Host "  Docker OK" -ForegroundColor Green
}
catch {
    Write-Host "  Docker NOT FOUND" -ForegroundColor Red
    Write-Host "  Start Docker Desktop first" -ForegroundColor Yellow
    pause
    exit 1
}

# Проверка compose-файла
if (-Not (Test-Path $COMPOSE_FILE)) {
    Write-Host "  ERROR: docker-compose.dev.yml not found!" -ForegroundColor Red
    Write-Host "  Expected at: $COMPOSE_FILE" -ForegroundColor Yellow
    pause
    exit 1
}
Write-Host "  Using: docker-compose.dev.yml" -ForegroundColor Green

# Запуск Docker Compose
Write-Host "`n[1/3] Starting Docker services..." -ForegroundColor Green
Set-Location $PROJECT_ROOT

# Останавливаем старые контейнеры (оба варианта для очистки)
Write-Host "  Stopping old containers..." -ForegroundColor Gray
docker-compose -f $COMPOSE_FILE down 2>$null | Out-Null
docker-compose down 2>$null | Out-Null

# Запускаем Docker DEV версию
Write-Host "  Running: docker-compose -f docker-compose.dev.yml up -d" -ForegroundColor Gray
docker-compose -f $COMPOSE_FILE up -d

if ($LASTEXITCODE -ne 0) {
    Write-Host "  ERROR: Failed to start Docker services" -ForegroundColor Red
    Write-Host "  Check logs with: docker-compose -f docker-compose.dev.yml logs" -ForegroundColor Yellow
    pause
    exit 1
}

# Ждем немного
Write-Host "  Waiting 5 seconds for services to initialize..." -ForegroundColor Gray
Start-Sleep -Seconds 5

# Показываем статус
Write-Host "`n[2/3] Container status:" -ForegroundColor Green
docker-compose -f $COMPOSE_FILE ps

# Проверяем, запустился ли бэкенд
$backendStatus = docker-compose -f $COMPOSE_FILE ps --services --filter "status=running" | Select-String "backend"
if (-Not $backendStatus) {
    Write-Host "`n  WARNING: Backend might not be running!" -ForegroundColor Yellow
    Write-Host "  Check logs: docker-compose -f docker-compose.dev.yml logs backend" -ForegroundColor Gray
    Write-Host "  Or try: docker-compose -f docker-compose.dev.yml up -d --build backend" -ForegroundColor Gray
}

# Информация
Write-Host "`n[3/3] Starting Angular frontend..." -ForegroundColor Green

Write-Host "`n" + ("=" * 50) -ForegroundColor Cyan
Write-Host "   DEVELOPMENT READY   " -ForegroundColor Yellow
Write-Host ("=" * 50) -ForegroundColor Cyan

Write-Host "`nURLs:" -ForegroundColor White
Write-Host "  Frontend: http://localhost:4200" -ForegroundColor Magenta
Write-Host "  Backend:  http://localhost:3000" -ForegroundColor Cyan
Write-Host "  Swagger:  http://localhost:3000/api" -ForegroundColor Blue
Write-Host "  PostgreSQL: localhost:5432" -ForegroundColor Green
Write-Host "  pgAdmin: http://localhost:5050" -ForegroundColor Green
Write-Host "  Redis: localhost:6379" -ForegroundColor Red
Write-Host "  MailHog: http://localhost:8025" -ForegroundColor Yellow

Write-Host "`nControls:" -ForegroundColor White
Write-Host "  To stop Angular: Ctrl+C" -ForegroundColor Gray
Write-Host "  To stop Docker: docker-compose -f docker-compose.dev.yml down" -ForegroundColor Gray
Write-Host "  Backend logs: docker-compose -f docker-compose.dev.yml logs backend -f" -ForegroundColor Gray

Write-Host "`n" + ("=" * 50) -ForegroundColor Cyan
Write-Host ""

# Запуск Angular
Set-Location $FRONTEND_DIR
Write-Host "Starting Angular..." -ForegroundColor Gray
ng serve --open --host localhost
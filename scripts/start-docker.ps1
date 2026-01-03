# start-docker.ps1
Write-Host "Checking Docker Desktop..." -ForegroundColor Cyan

# Проверить, работает ли Docker
try {
    docker version 2>$null
    Write-Host "Docker Desktop is already running!" -ForegroundColor Green
    exit 0
} catch {
    Write-Host "Docker Desktop is not running. Starting..." -ForegroundColor Yellow
}

# Пути к Docker Desktop
$dockerPaths = @(
    "C:\Program Files\Docker\Docker\Docker Desktop.exe",
    "C:\Program Files (x86)\Docker\Docker\Docker Desktop.exe",
    "$env:LOCALAPPDATA\Docker\Docker Desktop\Docker Desktop.exe",
    "$env:ProgramFiles\Docker\Docker\Docker Desktop.exe"
)

# Попробовать найти и запустить
foreach ($path in $dockerPaths) {
    if (Test-Path $path) {
        Write-Host "Found Docker at: $path" -ForegroundColor Gray
        Write-Host "Starting Docker Desktop..." -ForegroundColor Yellow

        # Запустить Docker Desktop
        Start-Process -FilePath $path

        # Подождать запуска
        Write-Host "Waiting for Docker to start (30 seconds)..." -ForegroundColor Yellow
        Start-Sleep -Seconds 30

        # Проверить
        try {
            docker version 2>$null
            Write-Host "Docker Desktop started successfully!" -ForegroundColor Green
            exit 0
        } catch {
            Write-Host "Docker failed to start" -ForegroundColor Red
            exit 1
        }
    }
}

Write-Host "Docker Desktop not found!" -ForegroundColor Red
Write-Host "Please install Docker Desktop from: https://www.docker.com/products/docker-desktop/" -ForegroundColor Yellow
exit 1
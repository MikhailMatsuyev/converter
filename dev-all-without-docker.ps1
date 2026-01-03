$ErrorActionPreference = "Stop"

try {
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "   AI File Processor - Development Mode   " -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    # Улучшенная проверка портов
    Write-Host "Checking ports..." -ForegroundColor Gray

    function Stop-ProcessIfPortUsed {
        param($Port, $ServiceName)

        $connections = Get-NetTCPConnection -LocalPort $Port -ErrorAction SilentlyContinue | Where-Object {$_.State -eq "Listen"}
        if ($connections) {
            foreach ($conn in $connections) {
                Write-Host "   Port $Port ($ServiceName) used by PID: $($conn.OwningProcess)" -ForegroundColor Red

                try {
                    $proc = Get-Process -Id $conn.OwningProcess -ErrorAction SilentlyContinue
                    if ($proc) {
                        Write-Host "   Process name: $($proc.ProcessName)" -ForegroundColor Gray
                    }
                } catch {}

                $choice = Read-Host "   Kill process $($conn.OwningProcess) and free port? (y/N)"
                if ($choice -eq 'y' -or $choice -eq 'Y') {
                    try {
                        Stop-Process -Id $conn.OwningProcess -Force -ErrorAction Stop
                        Write-Host "   Process terminated" -ForegroundColor Green
                        Start-Sleep -Seconds 1
                    } catch {
                        Write-Host "   Failed to kill process: $_" -ForegroundColor Red
                        Write-Host "   Please close it manually and press Enter..." -ForegroundColor Yellow
                        pause
                    }
                } else {
                    Write-Host "   Port $Port will remain in use" -ForegroundColor Yellow
                }
            }
        }
    }

    # Проверяем и освобождаем порты
    Stop-ProcessIfPortUsed -Port 3000 -ServiceName "backend"
    Stop-ProcessIfPortUsed -Port 4200 -ServiceName "frontend"

    # Проверяем текущее состояние портов
    $port3000After = Get-NetTCPConnection -LocalPort 3000 -ErrorAction SilentlyContinue | Where-Object {$_.State -eq "Listen"}
    $port4200After = Get-NetTCPConnection -LocalPort 4200 -ErrorAction SilentlyContinue | Where-Object {$_.State -eq "Listen"}

    if ($port3000After -or $port4200After) {
        Write-Host "`nWarning: Some ports are still in use!" -ForegroundColor Yellow
        if ($port3000After) {
            Write-Host "   Port 3000 will use another port" -ForegroundColor Yellow
        }
        if ($port4200After) {
            Write-Host "   Port 4200 will use another port" -ForegroundColor Yellow
        }
        Start-Sleep -Seconds 2
    }

    # 1. SHARED WATCH
    Write-Host "`n[1/4] Starting shared watch..." -ForegroundColor Green
    $sharedProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"E:\project\converter\shared`"; npm run watch" -PassThru -WindowStyle Normal
    Write-Host "   Shared started (PID: $($sharedProcess.Id))" -ForegroundColor Gray
    Start-Sleep -Seconds 2

    # Проверяем что процесс запустился
    if ($sharedProcess.HasExited) {
        throw "Shared process failed to start"
    }

    # 2. BACKEND WITH HOT RELOAD (убрали ручную сборку tsc)
    Write-Host "`n[2/4] Starting NestJS with hot reload..." -ForegroundColor Green
    Set-Location "E:\project\converter\backend"

    # Очищаем старый dist (опционально, но лучше очистить)
    if (Test-Path "dist") {
        Write-Host "   Cleaning previous build..." -ForegroundColor Gray
        Remove-Item dist -Recurse -Force -ErrorAction SilentlyContinue
    }

    # Запускаем NestJS с watch mode (сам компилирует TS и перезапускает при изменениях)
    $backendProcess = Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd `"E:\project\converter\backend`"; npx nest start --watch" -PassThru -WindowStyle Normal
    Write-Host "   NestJS started with hot reload (PID: $($backendProcess.Id))" -ForegroundColor Gray
    Write-Host "   ⏳ Waiting for initial compilation..." -ForegroundColor Gray
    Start-Sleep -Seconds 5  # Даем время на первую компиляцию

    # Проверяем что процесс запустился
    if ($backendProcess.HasExited) {
        throw "Backend process failed to start"
    }

    # Проверяем что сервер действительно запустился
    Write-Host "   Verifying backend is running..." -ForegroundColor Gray
    $backendReady = $false
    for ($i = 1; $i -le 10; $i++) {
        try {
            $response = Invoke-WebRequest -Uri "http://localhost:3000/health" -Method GET -TimeoutSec 2 -ErrorAction SilentlyContinue
            if ($response.StatusCode -eq 200) {
                $backendReady = $true
                Write-Host "   ✅ Backend is ready" -ForegroundColor Green
                break
            }
        } catch {
            Write-Host "   Attempt $i/10: Backend not ready yet..." -ForegroundColor Gray
            Start-Sleep -Seconds 2
        }
    }

    if (-not $backendReady) {
        Write-Host "   ⚠️  Backend might be starting slowly, continuing..." -ForegroundColor Yellow
    }

    # 3. FRONTEND
    Write-Host "`n[3/4] Starting Angular..." -ForegroundColor Green
    Set-Location "E:\project\converter\frontend"

    Write-Host "`n========================================" -ForegroundColor Cyan
    Write-Host "   All services started!                " -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "Frontend:    http://localhost:4200" -ForegroundColor Magenta
    Write-Host "             (will auto-select port if 4200 busy)" -ForegroundColor Gray
    Write-Host "Backend API: http://localhost:3000" -ForegroundColor Cyan
    Write-Host "Swagger UI:  http://localhost:3000/api" -ForegroundColor Blue
    Write-Host "Shared:      watch mode" -ForegroundColor Yellow
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "`nHot Reload Status:" -ForegroundColor White
    Write-Host "✅ Shared:     auto-rebuild on changes" -ForegroundColor Green
    Write-Host "✅ Backend:    auto-recompile & restart on changes" -ForegroundColor Green
    Write-Host "✅ Frontend:   live reload on changes" -ForegroundColor Green
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host "`nManagement:" -ForegroundColor White
    Write-Host "This window:    Angular + control" -ForegroundColor Gray
    Write-Host "Other windows:  Shared and NestJS" -ForegroundColor Gray
    Write-Host "Ctrl+C:         stops only Angular" -ForegroundColor Gray
    Write-Host "Close other windows manually" -ForegroundColor Gray
    Write-Host "========================================" -ForegroundColor Cyan
    Write-Host ""

    # Запускаем Angular с auto-port
    Write-Host "Starting Angular server (will auto-select port if needed)..." -ForegroundColor Gray
    ng serve --open

} catch {
    Write-Host "`nError: $_" -ForegroundColor Red
    Write-Host "`nProcesses that were started:" -ForegroundColor Yellow
    if ($sharedProcess) {
        Write-Host "Shared watch (PID: $($sharedProcess.Id))" -ForegroundColor Gray
    }
    if ($backendProcess) {
        Write-Host "Backend server (PID: $($backendProcess.Id))" -ForegroundColor Gray
    }
    Write-Host "`nHow to close:" -ForegroundColor Yellow
    Write-Host "1. Close this window (Angular)" -ForegroundColor White
    Write-Host "2. Find PowerShell windows in Taskbar and close them" -ForegroundColor White
    Write-Host "3. Or use Task Manager to kill processes" -ForegroundColor White
    Write-Host ""
    pause
}
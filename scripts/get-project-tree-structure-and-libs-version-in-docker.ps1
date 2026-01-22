# scripts/get-project-tree-structure-and-libs-version-in-docker.ps1 - ASCII совместимый
param(
    [string]$Path = ".",
    [switch]$All,
    [switch]$DockerOnly,
    [switch]$Simple
)

# Определяем корень проекта
$ScriptDir = Split-Path -Parent $MyInvocation.MyCommand.Path
$ProjectRoot = Split-Path -Parent $ScriptDir

# Если путь относительный, делаем его абсолютным
if (-not [System.IO.Path]::IsPathRooted($Path)) {
    $Path = Join-Path $ProjectRoot $Path
}

# Определяем платформу (совместимо с PowerShell 5.1)
if ($PSVersionTable.PSVersion.Major -ge 6) {
    $IsWindows = $IsWindows
    $IsLinux = $IsLinux
    $IsMacOS = $IsMacOS
} else {
    # PowerShell 5.1 или ниже
    $IsWindows = $true
    $IsLinux = $false
    $IsMacOS = $false
}

# Для надежности также проверяем переменные окружения
if ($env:OS -eq "Windows_NT") {
    $IsWindows = $true
    $IsLinux = $false
    $IsMacOS = $false
} elseif (Test-Path "/etc/os-release") {
    $IsWindows = $false
    $IsLinux = $true
    $IsMacOS = $false
} elseif ($env:OSTYPE -like "*darwin*") {
    $IsWindows = $false
    $IsLinux = $false
    $IsMacOS = $true
}

# Цветовая схема в зависимости от платформы
if ($IsWindows) {
    $PlatformColor = "Blue"
    $PlatformName = "Windows"
} elseif ($IsLinux) {
    $PlatformColor = "Magenta"
    $PlatformName = "Linux"
} elseif ($IsMacOS) {
    $PlatformColor = "Cyan"
    $PlatformName = "macOS"
}

function Get-ProjectTree {
    param(
        [string]$CurrentPath,
        [string]$Indent = "",
        [bool]$IsLast = $false
    )

    # Базовые исключения
    $alwaysExclude = 'node_modules', 'dist', '.angular', '.vscode', '.idea', '.git', '.github', 'postgres', 'pgadmin_data', 'redis_data', 'postgres_data'

    if (-not $All) {
        $alwaysExclude += '.env', '.env.*', '*.log', '*.tmp', '*.temp'
    }

    $items = Get-ChildItem $CurrentPath -Exclude $alwaysExclude -ErrorAction SilentlyContinue

    # Сортировка: папки сначала
    $sortedItems = $items | Sort-Object @{Expression={if($_.PSIsContainer){0}else{1}}}, Name

    $itemCount = $sortedItems.Count
    $currentIndex = 0

    foreach ($item in $sortedItems) {
        $currentIndex++
        $isLastItem = $currentIndex -eq $itemCount

        # Иконки текстом
        $icon = ""
        if ($item.PSIsContainer) {
            if ($item.Name -eq 'backend') { $icon = '[BACK] ' }
            elseif ($item.Name -eq 'frontend') { $icon = '[FRONT] ' }
            elseif ($item.Name -eq 'shared') { $icon = '[SHARED] ' }
            elseif ($item.Name -eq 'scripts') { $icon = '[SCRIPTS] ' }
            elseif ($item.Name -eq 'firebase') { $icon = '[FIREBASE] ' }
            else { $icon = '[DIR] ' }
        } else {
            if ($item.Name -match '^Dockerfile') { $icon = '[DOCKER] ' }
            elseif ($item.Name -match '^docker-compose') { $icon = '[COMPOSE] ' }
            elseif ($item.Name -match '\.ps1$') { $icon = '[PS1] ' }
            elseif ($item.Name -match '\.json$') { $icon = '[JSON] ' }
            elseif ($item.Name -match '\.(yml|yaml)$') { $icon = '[YAML] ' }
            elseif ($item.Name -match '\.md$') { $icon = '[MD] ' }
            elseif ($item.Name -match '\.ts$') { $icon = '[TS] ' }
            elseif ($item.Name -match '\.js$') { $icon = '[JS] ' }
            else { $icon = '[FILE] ' }
        }

        $prefix = '+--'

        if ($item.PSIsContainer) {
            Write-Host ($Indent + $prefix + $icon + $item.Name) -ForegroundColor Green
            if ($item.PSIsContainer -and -not $DockerOnly) {
                if ($isLastItem) {
                    $newIndent = $Indent + '   '
                } else {
                    $newIndent = $Indent + '|  '
                }
                Get-ProjectTree -CurrentPath $item.FullName -Indent $newIndent -IsLast $isLastItem
            }
        } else {
            Write-Host ($Indent + $prefix + $icon + $item.Name) -ForegroundColor Yellow
        }
    }
}

function Get-TechnologyVersions {
    Write-Host ""
    Write-Host "TECHNOLOGY VERSIONS:" -ForegroundColor Cyan

    $versions = @{}

    # Docker версия (локально)
    try {
        $dockerVersion = docker --version 2>$null
        if ($dockerVersion) {
            $versions['Docker'] = ($dockerVersion -split ' ')[2] -replace ',', ''
        } else {
            $versions['Docker'] = "N/A"
        }
    } catch {
        $versions['Docker'] = "N/A"
    }

    # Node.js версия через Docker (из контейнера backend)
    try {
        $nodeVersion = docker exec nest-backend-dev node --version 2>$null
        if ($nodeVersion -and $nodeVersion.Trim()) {
            $versions['Node.js'] = $nodeVersion.Trim()
        } else {
            # Если нет контейнера nest-backend-dev, пробуем другой или локальный
            $localNodeVersion = node --version 2>$null
            if ($localNodeVersion) {
                $versions['Node.js'] = $localNodeVersion.Trim() + " (local)"
            } else {
                $versions['Node.js'] = "N/A"
            }
        }
    } catch {
        $versions['Node.js'] = "N/A"
    }

    # npm версия
    try {
        $npmVersion = docker exec nest-backend-dev npm --version 2>$null
        if ($npmVersion -and $npmVersion.Trim()) {
            $versions['npm'] = "v" + $npmVersion.Trim()
        } else {
            $localNpmVersion = npm --version 2>$null
            if ($localNpmVersion) {
                $versions['npm'] = "v" + $localNpmVersion.Trim() + " (local)"
            } else {
                $versions['npm'] = "N/A"
            }
        }
    } catch {
        $versions['npm'] = "N/A"
    }

    # TypeScript версия
    try {
        $tsVersion = docker exec nest-backend-dev npx tsc --version 2>$null
        if ($tsVersion -and $tsVersion.Trim()) {
            $versions['TypeScript'] = ($tsVersion.Trim() -split ' ')[1]
        } else {
            $localTsVersion = npx tsc --version 2>$null
            if ($localTsVersion) {
                $versions['TypeScript'] = ($localTsVersion.Trim() -split ' ')[1] + " (local)"
            } else {
                $versions['TypeScript'] = "N/A"
            }
        }
    } catch {
        $versions['TypeScript'] = "N/A"
    }

    # NestJS версия
    try {
        $nestVersion = docker exec nest-backend-dev nest --version 2>$null
        if ($nestVersion -and $nestVersion.Trim()) {
            $versions['NestJS'] = "v" + $nestVersion.Trim()
        } else {
            $localNestVersion = nest --version 2>$null
            if ($localNestVersion) {
                $versions['NestJS'] = "v" + $localNestVersion.Trim() + " (local)"
            } else {
                $versions['NestJS'] = "N/A"
            }
        }
    } catch {
        $versions['NestJS'] = "N/A"
    }

    # Angular версия (локально, так как обычно не в Docker)
    try {
        $angularOutput = npm list -g @angular/cli --depth=0 2>$null
        if ($angularOutput) {
            foreach ($line in $angularOutput) {
                if ($line -match "@angular/cli") {
                    $parts = $line -split '@'
                    if ($parts.Count -ge 3) {
                        $ver = $parts[2] -replace '[^\d.]', ''
                        $versions['Angular CLI'] = "v" + $ver
                        break
                    }
                }
            }
        }
        if (-not $versions['Angular CLI']) {
            $versions['Angular CLI'] = "Not installed globally"
        }
    } catch {
        $versions['Angular CLI'] = "N/A"
    }

    # PostgreSQL версия
    try {
        $postgresVersion = docker exec postgres-dev psql -U postgres -t -c "SELECT version();" 2>$null
        if ($postgresVersion -and $postgresVersion.Trim()) {
            $versions['PostgreSQL'] = ($postgresVersion.Trim() -split ' ')[1]
        } else {
            $versions['PostgreSQL'] = "Container not running"
        }
    } catch {
        $versions['PostgreSQL'] = "N/A"
    }

    # Redis версия
    try {
        $redisVersion = docker exec redis-dev redis-server --version 2>$null
        if ($redisVersion -and $redisVersion.Trim()) {
            $ver = ($redisVersion -split '=')[1] -split ' ' | Select-Object -First 1
            $versions['Redis'] = $ver
        } else {
            $versions['Redis'] = "Container not running"
        }
    } catch {
        $versions['Redis'] = "N/A"
    }

    # Prisma версия
    try {
        $prismaOutput = docker exec nest-backend-dev npx prisma --version 2>$null
        if ($prismaOutput) {
            $firstLine = ($prismaOutput -split "`n")[0]
            if ($firstLine -and $firstLine.Trim()) {
                $versions['Prisma'] = ($firstLine.Trim() -split ' ')[1]
            } else {
                $versions['Prisma'] = "N/A"
            }
        } else {
            $localPrismaOutput = npx prisma --version 2>$null
            if ($localPrismaOutput) {
                $firstLineLocal = ($localPrismaOutput -split "`n")[0]
                if ($firstLineLocal) {
                    $versions['Prisma'] = ($firstLineLocal.Trim() -split ' ')[1] + " (local)"
                } else {
                    $versions['Prisma'] = "N/A"
                }
            } else {
                $versions['Prisma'] = "N/A"
            }
        }
    } catch {
        $versions['Prisma'] = "N/A"
    }

    # Выводим все версии
    $techOrder = @('Docker', 'Node.js', 'npm', 'TypeScript', 'NestJS', 'Angular CLI', 'PostgreSQL', 'Redis', 'Prisma')

    foreach ($tech in $techOrder) {
        $value = $versions[$tech]
        if ($value -match "N/A|not running|Not installed|Error") {
            $color = "Red"
        } elseif ($value -match "local") {
            $color = "Yellow"
        } else {
            $color = "Green"
        }
        Write-Host ("  {0,-15} : {1}" -f $tech, $value) -ForegroundColor $color
    }
}

function Get-RunningContainers {
    try {
        $containers = docker ps --format "table {{.Names}}`t{{.Image}}`t{{.Status}}`t{{.Ports}}" 2>$null
        if ($containers) {
            Write-Host ""
            Write-Host "RUNNING CONTAINERS:" -ForegroundColor Cyan
            $containers | Out-Host
        }
    } catch {
        # Docker не установлен
    }
}

function Get-PlatformInfo {
    Write-Host ""
    Write-Host "PLATFORM INFO:" -ForegroundColor $PlatformColor
    Write-Host "  OS: $PlatformName" -ForegroundColor Gray
    Write-Host "  PowerShell: v$($PSVersionTable.PSVersion)" -ForegroundColor Gray

    if ($IsWindows) {
        try {
            $osInfo = Get-WmiObject Win32_OperatingSystem -ErrorAction SilentlyContinue
            if ($osInfo) {
                Write-Host "  Windows: $($osInfo.Caption)" -ForegroundColor Gray
                Write-Host "  Version: $($osInfo.Version)" -ForegroundColor Gray
            }
        } catch {
            Write-Host "  Windows: Unknown version" -ForegroundColor Gray
        }
    }

    # Информация о процессоре и памяти (только для Windows в этом примере)
    if ($IsWindows) {
        try {
            $cpu = Get-WmiObject Win32_Processor -ErrorAction SilentlyContinue | Select-Object -First 1
            $memory = Get-WmiObject Win32_ComputerSystem -ErrorAction SilentlyContinue
            if ($cpu) {
                Write-Host "  CPU: $($cpu.Name.Trim())" -ForegroundColor Gray
            }
            if ($memory) {
                $ramGB = [math]::Round($memory.TotalPhysicalMemory / 1GB, 1)
                Write-Host "  RAM: $ramGB GB" -ForegroundColor Gray
            }
        } catch {
            # Пропускаем, если не удалось получить информацию
        }
    }
}

# Основной вывод
if (-not $Simple) {
    Clear-Host
    Write-Host '=== AI FILE PROCESSOR PROJECT TREE ===' -ForegroundColor Cyan
    Write-Host "Project Root: $ProjectRoot" -ForegroundColor Gray
    Write-Host "Showing: $Path" -ForegroundColor Gray
    Write-Host "Time: $(Get-Date -Format 'HH:mm:ss')" -ForegroundColor Gray
    Write-Host ""
}

Get-ProjectTree -CurrentPath $Path

# Статистика
if (-not $Simple -and -not $DockerOnly) {
    Write-Host ""

    # Информация о платформе
    Get-PlatformInfo

    # Получаем версии технологий
    Get-TechnologyVersions

    # Показываем запущенные контейнеры
    Get-RunningContainers
}

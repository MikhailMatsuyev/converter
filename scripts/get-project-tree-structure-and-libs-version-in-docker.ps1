# scripts/get-project-tree-structure-and-libs-version-in-docker.ps1
# Скрипт для отображения структуры проекта и версий технологий
# PowerShell команды для работы с проектом:
# .\scripts\get-project-tree-structure-and-libs-version-in-docker.ps1 -Simple  # Простая структура
# .\scripts\get-project-tree-structure-and-libs-version-in-docker.ps1 -All     # Полная информация
# .\scripts\get-project-tree-structure-and-libs-version-in-docker.ps1 -DockerOnly  # Только Docker инфо
# .\scripts\get-project-tree-structure-and-libs-version-in-docker.ps1 -Path frontend  # Только фронтенд

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

# Определяем платформу
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

# Цветовая схема
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

function Get-RunningContainers {
    try {
        $containers = docker ps --format "table {{.Names}}\t{{.Image}}\t{{.Status}}\t{{.Ports}}" 2>$null
        if ($containers) {
            Write-Host ""
            Write-Host "RUNNING CONTAINERS:" -ForegroundColor Cyan
            $containerLines = $containers -split "`n" | Where-Object { $_ -and $_.Trim() }
            if ($containerLines.Count -gt 0) {
                foreach ($line in $containerLines) {
                    Write-Host "  $line" -ForegroundColor Gray
                }
            } else {
                Write-Host "  No containers running" -ForegroundColor DarkGray
            }
        } else {
            Write-Host ""
            Write-Host "RUNNING CONTAINERS:" -ForegroundColor Cyan
            Write-Host "  No containers running" -ForegroundColor DarkGray
        }
    } catch {
        Write-Host ""
        Write-Host "RUNNING CONTAINERS:" -ForegroundColor Cyan
        Write-Host "  Docker not available" -ForegroundColor Red
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

    # Информация о процессоре и памяти
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

function Get-TechnologyVersions {
    Write-Host ""
    Write-Host "TECHNOLOGY VERSIONS:" -ForegroundColor Cyan

    $versions = @{}
    $runningContainers = @{}

    # Получаем список запущенных контейнеров
    try {
        $containerList = docker ps --format "{{.Names}}|{{.Image}}" 2>$null
        if ($containerList) {
            foreach ($line in ($containerList -split "`n" | Where-Object { $_ })) {
                $parts = $line -split '\|'
                if ($parts.Count -ge 2) {
                    $containerName = $parts[0].Trim()
                    $imageName = $parts[1].Trim()
                    $runningContainers[$containerName] = $imageName
                }
            }
        }
    } catch {
        # Docker не установлен
    }

    # Docker версия
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

    # Node.js версия
    try {
        $nodeVersion = $null
        $fromContainer = $false

        # Пробуем из контейнера
        foreach ($container in $runningContainers.Keys) {
            if ($container -match "backend|node|nest|api") {
                $nodeVersion = docker exec $container node --version 2>$null
                if ($nodeVersion -and $nodeVersion.Trim()) {
                    $versions['Node.js'] = $nodeVersion.Trim() + " (container: $container)"
                    $fromContainer = $true
                    break
                }
            }
        }

        if (-not $fromContainer) {
            $nodeVersion = node --version 2>$null
            if ($nodeVersion) {
                $versions['Node.js'] = $nodeVersion.Trim() + " (local)"
            } else {
                $versions['Node.js'] = "N/A"
            }
        }
    } catch {
        $versions['Node.js'] = "N/A"
    }

    # npm версия
    try {
        $npmVersion = $null
        $fromContainer = $false

        # Пробуем из контейнера
        foreach ($container in $runningContainers.Keys) {
            if ($container -match "backend|node|nest|api") {
                $npmVersion = docker exec $container npm --version 2>$null
                if ($npmVersion -and $npmVersion.Trim()) {
                    $versions['npm'] = "v" + $npmVersion.Trim() + " (container: $container)"
                    $fromContainer = $true
                    break
                }
            }
        }

        if (-not $fromContainer) {
            $npmVersion = npm --version 2>$null
            if ($npmVersion) {
                $versions['npm'] = "v" + $npmVersion.Trim() + " (local)"
            } else {
                $versions['npm'] = "N/A"
            }
        }
    } catch {
        $versions['npm'] = "N/A"
    }

    # TypeScript версия
    try {
        $tsVersion = $null
        $fromContainer = $false

        # Пробуем из контейнера
        foreach ($container in $runningContainers.Keys) {
            if ($container -match "backend|node|nest|api") {
                $tsVersion = docker exec $container npx tsc --version 2>$null
                if ($tsVersion -and $tsVersion.Trim()) {
                    $versions['TypeScript'] = ($tsVersion.Trim() -split ' ')[1] + " (container: $container)"
                    $fromContainer = $true
                    break
                }
            }
        }

        if (-not $fromContainer) {
            $tsVersion = npx tsc --version 2>$null
            if ($tsVersion) {
                $versions['TypeScript'] = ($tsVersion.Trim() -split ' ')[1] + " (local)"
            } else {
                $versions['TypeScript'] = "N/A"
            }
        }
    } catch {
        $versions['TypeScript'] = "N/A"
    }

    # NestJS версия
    try {
        $nestVersion = $null
        $fromContainer = $false

        # Пробуем из контейнера
        foreach ($container in $runningContainers.Keys) {
            if ($container -match "backend|node|nest|api") {
                $nestVersion = docker exec $container nest --version 2>$null
                if ($nestVersion -and $nestVersion.Trim()) {
                    $versions['NestJS'] = "v" + $nestVersion.Trim() + " (container: $container)"
                    $fromContainer = $true
                    break
                }
            }
        }

        if (-not $fromContainer) {
            $nestVersion = nest --version 2>$null
            if ($nestVersion) {
                $versions['NestJS'] = "v" + $nestVersion.Trim() + " (local)"
            } else {
                $versions['NestJS'] = "N/A"
            }
        }
    } catch {
        $versions['NestJS'] = "N/A"
    }

    # Angular CLI версия
    try {
        $angularVersion = $null

        # Проверяем глобально
        $angularGlobal = npm list -g @angular/cli --depth=0 2>$null
        if ($angularGlobal -and ($angularGlobal | Where-Object { $_ -match "@angular/cli@" })) {
            $match = [regex]::Match($angularGlobal, "@angular/cli@(\d+\.\d+\.\d+)")
            if ($match.Success) {
                $versions['Angular CLI'] = "v" + $match.Groups[1].Value + " (global)"
            }
        }

        # Проверяем в проекте
        if (-not $versions['Angular CLI'] -and (Test-Path "package.json")) {
            $packageJson = Get-Content "package.json" | ConvertFrom-Json -ErrorAction SilentlyContinue
            if ($packageJson.devDependencies.'@angular/cli') {
                $versions['Angular CLI'] = "v" + $packageJson.devDependencies.'@angular/cli' + " (project)"
            } elseif ($packageJson.dependencies.'@angular/cli') {
                $versions['Angular CLI'] = "v" + $packageJson.dependencies.'@angular/cli' + " (project)"
            }
        }

        if (-not $versions['Angular CLI']) {
            $versions['Angular CLI'] = "Not found"
        }
    } catch {
        $versions['Angular CLI'] = "N/A"
    }

    # PostgreSQL версия
    try {
        $postgresFound = $false
        foreach ($container in $runningContainers.Keys) {
            # Ищем контейнер, имя которого содержит "postgres" и не содержит "pgadmin"
            if ($container -match "postgres" -and $container -notmatch "pgadmin") {
                # Пробуем получить версию через psql --version
                $postgresVersion = docker exec $container psql --version 2>$null
                if ($postgresVersion -and $postgresVersion.Trim()) {
                    $versionMatch = [regex]::Match($postgresVersion.Trim(), "psql \(PostgreSQL\) (\d+\.\d+)")
                    if ($versionMatch.Success) {
                        $versions['PostgreSQL'] = $versionMatch.Groups[1].Value + " (container: $container)"
                    } else {
                        # Если не получилось, пробуем запрос к БД
                        $postgresVersion = docker exec $container psql -U postgres -t -c "SELECT version();" 2>$null
                        if ($postgresVersion -and $postgresVersion.Trim()) {
                            $versionMatch = [regex]::Match($postgresVersion.Trim(), "PostgreSQL (\d+\.\d+)")
                            if ($versionMatch.Success) {
                                $versions['PostgreSQL'] = $versionMatch.Groups[1].Value + " (container: $container)"
                            } else {
                                $versions['PostgreSQL'] = "Unknown version (container: $container)"
                            }
                        } else {
                            $versions['PostgreSQL'] = "Unknown version (container: $container)"
                        }
                    }
                    $postgresFound = $true
                    break
                }
            }
        }

        if (-not $postgresFound) {
            $versions['PostgreSQL'] = "Container not running"
        }
    } catch {
        $versions['PostgreSQL'] = "N/A"
    }

    # Redis версия
    try {
        $redisFound = $false
        foreach ($container in $runningContainers.Keys) {
            if ($container -match "redis|cache") {
                $redisVersion = docker exec $container redis-server --version 2>$null
                if ($redisVersion -and $redisVersion.Trim()) {
                    $versionMatch = [regex]::Match($redisVersion, "Redis server v=(\d+\.\d+\.\d+)")
                    if ($versionMatch.Success) {
                        $versions['Redis'] = $versionMatch.Groups[1].Value + " (container: $container)"
                    } else {
                        # Альтернативный парсинг
                        $ver = ($redisVersion -split '=')[1] -split ' ' | Select-Object -First 1
                        if ($ver) {
                            $versions['Redis'] = $ver + " (container: $container)"
                        } else {
                            $versions['Redis'] = "Unknown version (container: $container)"
                        }
                    }
                    $redisFound = $true
                    break
                }
            }
        }

        if (-not $redisFound) {
            $versions['Redis'] = "Container not running"
        }
    } catch {
        $versions['Redis'] = "N/A"
    }

    # Prisma версия - ИСПРАВЛЕНО: ищем в папке backend
    try {
        $prismaVersion = $null
        $source = ""

        # 1. Проверяем package.json в папке backend
        $backendPackageJsonPath = Join-Path $ProjectRoot "backend\package.json"
        $rootPackageJsonPath = Join-Path $ProjectRoot "package.json"

        # Сначала пробуем backend/package.json
        if (Test-Path $backendPackageJsonPath) {
            $packageJson = Get-Content $backendPackageJsonPath | ConvertFrom-Json -ErrorAction SilentlyContinue
            if ($packageJson.devDependencies.prisma) {
                $prismaVersion = $packageJson.devDependencies.prisma
                $source = "backend/package.json (dev)"
            }
            if (-not $prismaVersion -and $packageJson.dependencies.prisma) {
                $prismaVersion = $packageJson.dependencies.prisma
                $source = "backend/package.json"
            }
            if (-not $prismaVersion -and $packageJson.devDependencies.'@prisma/client') {
                $prismaVersion = $packageJson.devDependencies.'@prisma/client'
                $source = "backend/client (dev)"
            }
            if (-not $prismaVersion -and $packageJson.dependencies.'@prisma/client') {
                $prismaVersion = $packageJson.dependencies.'@prisma/client'
                $source = "backend/client"
            }
        }

        # 2. Если не нашли в backend, пробуем в корне
        if (-not $prismaVersion -and (Test-Path $rootPackageJsonPath)) {
            $packageJson = Get-Content $rootPackageJsonPath | ConvertFrom-Json -ErrorAction SilentlyContinue
            if ($packageJson.devDependencies.prisma) {
                $prismaVersion = $packageJson.devDependencies.prisma
                $source = "root/package.json (dev)"
            }
            if (-not $prismaVersion -and $packageJson.dependencies.prisma) {
                $prismaVersion = $packageJson.dependencies.prisma
                $source = "root/package.json"
            }
            if (-not $prismaVersion -and $packageJson.devDependencies.'@prisma/client') {
                $prismaVersion = $packageJson.devDependencies.'@prisma/client'
                $source = "root/client (dev)"
            }
            if (-not $prismaVersion -and $packageJson.dependencies.'@prisma/client') {
                $prismaVersion = $packageJson.dependencies.'@prisma/client'
                $source = "root/client"
            }
        }

        # 3. Если нашли в package.json
        if ($prismaVersion) {
            $versions['Prisma'] = $prismaVersion + " ($source)"
        }
        # 4. Если не нашли в package.json, пробуем контейнер
        elseif ($runningContainers.Count -gt 0) {
            foreach ($container in $runningContainers.Keys) {
                if ($container -match "backend|node|nest|api") {
                    # Пробуем несколько команд в контейнере
                    $prismaOutput = docker exec $container npm list prisma --depth=0 2>$null
                    if ($prismaOutput -and $prismaOutput -match "prisma@(\d+\.\d+\.\d+)") {
                        $versions['Prisma'] = $Matches[1] + " (container: $container)"
                        $prismaVersion = $Matches[1]
                        break
                    }

                    $prismaClientOutput = docker exec $container npm list @prisma/client --depth=0 2>$null
                    if (-not $prismaVersion -and $prismaClientOutput -and $prismaClientOutput -match "@prisma/client@(\d+\.\d+\.\d+)") {
                        $versions['Prisma'] = $Matches[1] + " (container client: $container)"
                        $prismaVersion = $Matches[1]
                        break
                    }
                }
            }
        }

        # 5. Если всё еще не нашли, пробуем локально через npm list
        if (-not $prismaVersion) {
            $npmListOutput = npm list prisma --depth=0 2>$null
            if ($npmListOutput -and $npmListOutput -match "prisma@(\d+\.\d+\.\d+)") {
                $versions['Prisma'] = $Matches[1] + " (local npm)"
            } else {
                $npmClientOutput = npm list @prisma/client --depth=0 2>$null
                if ($npmClientOutput -and $npmClientOutput -match "@prisma/client@(\d+\.\d+\.\d+)") {
                    $versions['Prisma'] = $Matches[1] + " (local client)"
                } else {
                    $versions['Prisma'] = "Not found"
                }
            }
        }
    } catch {
        $versions['Prisma'] = "N/A"
    }

    # PowerShell версия
    $versions['PowerShell'] = "v$($PSVersionTable.PSVersion)"

    # Выводим все версии
    $techOrder = @('PowerShell', 'Docker', 'Node.js', 'npm', 'TypeScript', 'NestJS', 'Angular CLI', 'PostgreSQL', 'Redis', 'Prisma')

    Write-Host ""
    foreach ($tech in $techOrder) {
        $value = $versions[$tech]
        if (-not $value) {
            $value = "Not checked"
        }

        if ($value -match "N/A|not running|Not found|Error|can't get|Not checked") {
            $color = "Red"
        } elseif ($value -match "local|project|global|package.json") {
            $color = "Yellow"
        } elseif ($value -match "unknown|Unknown") {
            $color = "DarkYellow"
        } elseif ($value -match "container:") {
            $color = "Green"
        } else {
            $color = "White"
        }

        Write-Host ("  {0,-15} : {1}" -f $tech, $value) -ForegroundColor $color
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

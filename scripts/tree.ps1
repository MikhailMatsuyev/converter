# scripts/tree.ps1 - ASCII совместимый
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

        if ($isLastItem) {
            $prefix = '+--'
        } else {
            $prefix = '+--'
        }

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
    Write-Host "STATISTICS:" -ForegroundColor Cyan

    $excludeForStats = 'node_modules', 'dist', '.git', 'postgres*'
    $allItems = Get-ChildItem -Path $Path -Recurse -Exclude $excludeForStats -ErrorAction SilentlyContinue

    $folders = 0
    $files = 0
    foreach ($item in $allItems) {
        if ($item.PSIsContainer) {
            $folders++
        } else {
            $files++
        }
    }

    Write-Host "  [DIR] Folders: $folders" -ForegroundColor Gray
    Write-Host "  [FILE] Files: $files" -ForegroundColor Gray

    # Docker статус
    try {
        $runningContainers = docker ps -q 2>$null
        if ($runningContainers) {
            Write-Host ""
            Write-Host "DOCKER: $($runningContainers.Count) containers running" -ForegroundColor Green
        }
    } catch {
        # Docker не установлен
    }
}
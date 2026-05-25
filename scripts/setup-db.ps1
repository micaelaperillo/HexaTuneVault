# Load .env if present
if (Test-Path .env) {
    Get-Content .env | ForEach-Object {
        if ($_ -match '^([^#][^=]*)=(.*)$') {
            [System.Environment]::SetEnvironmentVariable($Matches[1].Trim(), $Matches[2].Trim())
        }
    }
}

$dbUser      = if ($env:DB_USER)     { $env:DB_USER }     else { 'postgres' }
$container   = 'hexatunevault-db'
$maxAttempts = 30

Write-Host 'Starting PostgreSQL container...'
docker compose up -d db

if ($LASTEXITCODE -ne 0) {
    Write-Host 'docker compose failed to start.' -ForegroundColor Red
    exit 1
}

Write-Host 'Waiting for PostgreSQL to be ready...'
$attempt = 0
$ready   = $false

while (-not $ready -and $attempt -lt $maxAttempts) {
    $attempt++
    docker exec $container pg_isready -U $dbUser 2>$null | Out-Null
    if ($LASTEXITCODE -eq 0) {
        $ready = $true
    } else {
        Write-Host "  Attempt $attempt/$maxAttempts..."
        Start-Sleep -Seconds 1
    }
}

if ($ready) {
    Write-Host 'PostgreSQL is ready!' -ForegroundColor Green
} else {
    Write-Host "PostgreSQL did not become ready after $maxAttempts attempts." -ForegroundColor Red
    exit 1
}

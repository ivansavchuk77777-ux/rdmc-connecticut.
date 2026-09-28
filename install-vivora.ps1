$ErrorActionPreference = 'Stop'

Write-Host "RDMC Sol - Vivora installer" -ForegroundColor Cyan
Write-Host "This will install/start the local Vivora avatar engine on this Windows PC." -ForegroundColor Gray

function Require-Command($name, $installHint) {
  if (-not (Get-Command $name -ErrorAction SilentlyContinue)) {
    Write-Host "Missing: $name" -ForegroundColor Yellow
    Write-Host $installHint -ForegroundColor Yellow
    exit 1
  }
}

Require-Command "git" "Install Git for Windows, then run this installer again: https://git-scm.com/download/win"
Require-Command "docker" "Install Docker Desktop, start it, then run this installer again: https://www.docker.com/products/docker-desktop/"

try {
  docker info *> $null
} catch {
  Write-Host "Docker Desktop is installed but not running. Start Docker Desktop, wait until it says Engine running, then run this installer again." -ForegroundColor Yellow
  exit 1
}

$base = Join-Path $env:USERPROFILE "RDMC-Sol"
$vivora = Join-Path $base "vivora"
New-Item -ItemType Directory -Force -Path $base | Out-Null

if (-not (Test-Path $vivora)) {
  Write-Host "Downloading Vivora..." -ForegroundColor Cyan
  git clone https://github.com/sur950/vivora.git $vivora
} else {
  Write-Host "Vivora already exists. Updating it..." -ForegroundColor Cyan
  Push-Location $vivora
  git pull
  Pop-Location
}

Set-Location $vivora

# Configure Vivora for RDMC Sol: local/free LLM + forced MuseTalk lip-sync.
$envFile = Join-Path $vivora ".env"
$envExample = Join-Path $vivora ".env.example"
if (-not (Test-Path $envFile) -and (Test-Path $envExample)) {
  Copy-Item $envExample $envFile
}
if (Test-Path $envFile) {
  $cfg = Get-Content $envFile -Raw
  function Set-EnvValue([string]$text,[string]$key,[string]$value) {
    $pattern = "(?m)^" + [regex]::Escape($key) + "=.*$"
    if ($text -match $pattern) { return [regex]::Replace($text,$pattern,"$key=$value") }
    return $text.TrimEnd() + [Environment]::NewLine + "$key=$value" + [Environment]::NewLine
  }
  $secret = -join ((1..64) | ForEach-Object { "{0:x}" -f (Get-Random -Maximum 16) })
  $jwt = -join ((1..64) | ForEach-Object { "{0:x}" -f (Get-Random -Maximum 16) })
  $cfg = Set-EnvValue $cfg "LLM_PROVIDER" "ollama"
  $cfg = Set-EnvValue $cfg "LLM_MODEL" "llama3.1"
  $cfg = Set-EnvValue $cfg "OPENAI_BASE_URL" "http://host.docker.internal:11434/v1"
  $cfg = Set-EnvValue $cfg "AVATAR_ENGINE" "musetalk"
  $cfg = Set-EnvValue $cfg "AVATAR_ALLOW_VIDEO" "true"
  $cfg = Set-EnvValue $cfg "SECRET_KEY" $secret
  $cfg = Set-EnvValue $cfg "JWT_SECRET_KEY" $jwt
  Set-Content -Path $envFile -Value $cfg -Encoding UTF8
  Write-Host "Configured Vivora for local Ollama + forced MuseTalk lip-sync." -ForegroundColor Green
}

# Keep the approved RDMC Sol face beside Vivora so it is easy to upload.
$rdmcSol = Join-Path $PSScriptRoot "sol-avatar.jpg"
if (Test-Path $rdmcSol) {
  Copy-Item $rdmcSol (Join-Path $vivora "RDMC-Sol.jpg") -Force
  Write-Host "Copied approved Sol face to RDMC-Sol.jpg." -ForegroundColor Green
}

# Install Ollama automatically when winget is available; otherwise show the exact requirement.
if (-not (Get-Command "ollama" -ErrorAction SilentlyContinue)) {
  if (Get-Command "winget" -ErrorAction SilentlyContinue) {
    Write-Host "Installing Ollama for local/free Sol responses..." -ForegroundColor Cyan
    winget install --id Ollama.Ollama -e --accept-source-agreements --accept-package-agreements
    $env:Path += ";$env:LOCALAPPDATA\Programs\Ollama"
  } else {
    Write-Host "Ollama is not installed. Install it from https://ollama.com/download/windows, then rerun this setup." -ForegroundColor Yellow
  }
}
if (Get-Command "ollama" -ErrorAction SilentlyContinue) {
  Write-Host "Preparing local llama3.1 model for Sol..." -ForegroundColor Cyan
  Start-Process "ollama" -ArgumentList "serve" -WindowStyle Hidden -ErrorAction SilentlyContinue
  Start-Sleep -Seconds 3
  & ollama pull llama3.1
}

Write-Host "Starting Vivora..." -ForegroundColor Cyan
if (Test-Path ".\start.ps1") {
  & .\start.ps1
} elseif (Test-Path ".\start.bat") {
  & .\start.bat
} elseif (Test-Path ".\start.sh") {
  if (Get-Command bash -ErrorAction SilentlyContinue) {
    bash ./start.sh
  } else {
    Write-Host "Vivora provides start.sh. Install Git Bash or WSL, then run this installer again." -ForegroundColor Yellow
    exit 1
  }
} else {
  Write-Host "Could not find Vivora's startup script. Open the folder and follow its README:" -ForegroundColor Yellow
  Write-Host $vivora
  exit 1
}

if (Test-Path ".\scripts\setup_musetalk.sh") {
  Write-Host "Installing MuseTalk lip-sync support..." -ForegroundColor Cyan
  if (Get-Command bash -ErrorAction SilentlyContinue) {
    bash ./scripts/setup_musetalk.sh
  } else {
    Write-Host "MuseTalk setup needs Bash. Install Git Bash or WSL, then run:" -ForegroundColor Yellow
    Write-Host "bash scripts/setup_musetalk.sh"
  }
}

Write-Host "Vivora setup step finished." -ForegroundColor Green
Write-Host "Opening local Sol engine..." -ForegroundColor Green
Start-Process "http://localhost:3000"

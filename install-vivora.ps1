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

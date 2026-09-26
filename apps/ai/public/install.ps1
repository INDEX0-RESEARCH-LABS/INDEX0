# ==============================================================================
# INDEX0 AI — Windows PowerShell Native Installer
# Usage:
#   irm https://ai.index0.in/install.ps1 | iex
# ==============================================================================
$ErrorActionPreference = "Stop"

Write-Host @"

  ██╗███╗   ██╗██████╗ ███████╗██╗  ██╗ ██████╗       █████╗ ██╗
  ██║████╗  ██║██╔══██╗██╔════╝╚██╗██╔╝██╔═████╗     ██╔══██╗██║
  ██║██╔██╗ ██║██║  ██║█████╗   ╚███╔╝ ██║██╔██║     ███████║██║
  ██║██║╚██╗██║██║  ██║██╔══╝   ██╔██╗ ████╔╝██║     ██╔══██║██║
  ██║██║ ╚████║██████╔╝███████╗██╔╝ ██╗╚██████╔╝     ██║  ██║██║
  ╚═╝╚═╝  ╚═══╝╚═════╝ ╚══════╝╚═╝  ╚═╝ ╚═════╝      ╚═╝  ╚═╝╚═╝

  INDEX0 AI // Sovereign Software Engineering Operating System
  "People Over Tools. Work Verified. Time to Unplug."
"@ -ForegroundColor Cyan

# 1. Check Node.js
Write-Host "`n[1/3] Checking Node.js runtime..." -ForegroundColor White
$hasNode = $false
try {
    $nodeVer = (node -v) 2>$null
    if ($nodeVer -match "v(\d+)") {
        $major = [int]$matches[1]
        if ($major -ge 18) {
            $hasNode = $true
            Write-Host "  ✓ Node.js detected: $nodeVer" -ForegroundColor Green
        }
    }
} catch {}

if (-not $hasNode) {
    Write-Host "  ! Node.js (v18+) is required." -ForegroundColor Yellow
    Write-Host "  Attempting install via winget..." -ForegroundColor Gray
    try {
        winget install OpenJS.NodeJS.LTS --silent --accept-package-agreements --accept-source-agreements
        $hasNode = $true
    } catch {
        Write-Host "Please install Node.js manually from: https://nodejs.org" -ForegroundColor Red
        Exit 1
    }
}

# 2. Setup INDEX0 directories
Write-Host "`n[2/3] Installing INDEX0 CLI bundle..." -ForegroundColor White
$index0Dir = Join-Path $HOME ".index0"
$binDir = Join-Path $HOME ".local\bin"
New-Item -ItemType Directory -Force -Path $index0Dir | Out-Null
New-Item -ItemType Directory -Force -Path $binDir | Out-Null

$tarUrl = "https://ai.index0.in/index0-cli.tar.gz"
$tarFile = Join-Path $env:TEMP "index0-cli.tar.gz"

Invoke-WebRequest -Uri $tarUrl -OutFile $tarFile
tar -xzf $tarFile -C $index0Dir
Remove-Item -Force $tarFile

# Create Windows .cmd and PowerShell wrappers
$cmdWrapper = Join-Path $binDir "index0.cmd"
@"
@echo off
node "$index0Dir\dist\cli.js" %*
"@ | Out-File -FilePath $cmdWrapper -Encoding ascii -Force

Write-Host "  ✓ Installed binary wrapper: $cmdWrapper" -ForegroundColor Green

# 3. Add to User PATH if needed
Write-Host "`n[3/3] Configuring environment PATH..." -ForegroundColor White
$userPath = [Environment]::GetEnvironmentVariable("Path", [EnvironmentVariableTarget]::User)
if ($userPath -notlike "*$binDir*") {
    [Environment]::SetEnvironmentVariable("Path", "$binDir;$userPath", [EnvironmentVariableTarget]::User)
    $env:Path = "$binDir;$env:Path"
    Write-Host "  ✓ Added $binDir to User PATH." -ForegroundColor Green
} else {
    Write-Host "  ✓ $binDir is already in User PATH." -ForegroundColor Green
}

Write-Host @"

==============================================================================
             INDEX0 SOVEREIGN CLI INSTALLED SUCCESSFULLY!
==============================================================================

Quick Start Guide:
  index0 login              # Sign in with GitHub Device Flow
  index0 prompt "your task" # Stream to Azure OpenAI East US
  index0 models             # List all available sovereign models
  index0 --help             # Command menu

"@ -ForegroundColor Green

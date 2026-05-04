# Quick Start Script for Electricity Demand Prediction App
# PowerShell version for Windows

Write-Host ""
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "Electricity Demand Prediction - Quick Start" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Check if we're in the correct directory
if (-not (Test-Path "backend")) {
    Write-Host "Error: backend folder not found. Please run this script from the project root." -ForegroundColor Red
    Read-Host "Press Enter to exit"
    exit 1
}

# Menu
Write-Host "What would you like to do?" -ForegroundColor Yellow
Write-Host "1. Start Backend Only (FastAPI)" -ForegroundColor White
Write-Host "2. Start Frontend Only (Next.js)" -ForegroundColor White
Write-Host "3. Start Both (Backend and Frontend)" -ForegroundColor White
Write-Host "4. Install Dependencies" -ForegroundColor White
Write-Host "5. Check System Status" -ForegroundColor White
Write-Host "6. Exit" -ForegroundColor White
Write-Host ""

$choice = Read-Host "Enter your choice (1-6)"

function Start-Backend {
    Clear-Host
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "Starting Backend Server (FastAPI)" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    
    Push-Location backend
    
    # Check if venv exists
    if (-not (Test-Path "venv")) {
        Write-Host "Virtual environment not found. Creating..." -ForegroundColor Yellow
        python -m venv venv
        Write-Host ""
    }
    
    # Activate venv
    Write-Host "Activating virtual environment..." -ForegroundColor Green
    & .\venv\Scripts\Activate.ps1
    
    # Check if FastAPI is installed
    $fastapiCheck = pip list | Select-String -Pattern "fastapi" -Quiet
    if (-not $fastapiCheck) {
        Write-Host "Installing dependencies..." -ForegroundColor Yellow
        pip install -r requirements.txt
    }
    
    # Start server
    Write-Host ""
    Write-Host "Starting FastAPI server on http://localhost:8000" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
    
    python run.py
    
    Pop-Location
}

function Start-Frontend {
    Clear-Host
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "Starting Frontend Server (Next.js)" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Check if node_modules exists
    if (-not (Test-Path "node_modules")) {
        Write-Host "node_modules not found. Installing dependencies..." -ForegroundColor Yellow
        
        # Try pnpm first
        $pnpmCheck = Get-Command pnpm -ErrorAction SilentlyContinue
        if ($pnpmCheck) {
            pnpm install
        } else {
            Write-Host "pnpm not found. Using npm..." -ForegroundColor Yellow
            npm install
        }
    }
    
    # Start frontend
    Write-Host ""
    Write-Host "Starting Next.js on http://localhost:3000" -ForegroundColor Green
    Write-Host "Press Ctrl+C to stop" -ForegroundColor Yellow
    Write-Host ""
    
    # Try pnpm first
    $pnpmCheck = Get-Command pnpm -ErrorAction SilentlyContinue
    if ($pnpmCheck) {
        pnpm dev
    } else {
        npm run dev
    }
}

function Install-Dependencies {
    Clear-Host
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "Installing Dependencies" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Backend dependencies
    Write-Host "Installing Backend Dependencies..." -ForegroundColor Yellow
    Push-Location backend
    
    if (-not (Test-Path "venv")) {
        Write-Host "Creating virtual environment..." -ForegroundColor Yellow
        python -m venv venv
    }
    
    & .\venv\Scripts\Activate.ps1
    
    Write-Host "Installing Python packages from requirements.txt..." -ForegroundColor Yellow
    pip install -r requirements.txt
    
    Pop-Location
    
    # Frontend dependencies
    Write-Host ""
    Write-Host "Installing Frontend Dependencies..." -ForegroundColor Yellow
    
    $pnpmCheck = Get-Command pnpm -ErrorAction SilentlyContinue
    if ($pnpmCheck) {
        pnpm install
    } else {
        Write-Host "pnpm not found. Using npm..." -ForegroundColor Yellow
        npm install
    }
    
    Write-Host ""
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host "Dependencies installed successfully!" -ForegroundColor Green
    Write-Host "============================================================" -ForegroundColor Green
    Write-Host ""
    Write-Host "Next steps:" -ForegroundColor Yellow
    Write-Host "1. Start backend: python backend\run.py"
    Write-Host "2. Start frontend: pnpm dev"
    Write-Host ""
    Read-Host "Press Enter to continue"
}

function Check-Status {
    Clear-Host
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host "System Status Check" -ForegroundColor Cyan
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host ""
    
    # Python check
    Write-Host "Checking Python..." -ForegroundColor Yellow
    $pythonVersion = python --version 2>&1
    Write-Host "  $pythonVersion" -ForegroundColor Green
    
    # Node check
    Write-Host ""
    Write-Host "Checking Node.js..." -ForegroundColor Yellow
    $nodeVersion = node --version
    Write-Host "  $nodeVersion" -ForegroundColor Green
    
    # npm check
    Write-Host ""
    Write-Host "Checking npm..." -ForegroundColor Yellow
    $npmVersion = npm --version
    Write-Host "  $npmVersion" -ForegroundColor Green
    
    # pnpm check
    Write-Host ""
    Write-Host "Checking pnpm..." -ForegroundColor Yellow
    $pnpmCheck = Get-Command pnpm -ErrorAction SilentlyContinue
    if ($pnpmCheck) {
        $pnpmVersion = pnpm --version
        Write-Host "  $pnpmVersion" -ForegroundColor Green
    } else {
        Write-Host "  Not installed (optional, can use npm instead)" -ForegroundColor Yellow
    }
    
    # Port check
    Write-Host ""
    Write-Host "Checking ports..." -ForegroundColor Yellow
    $port5000 = netstat -ano | Select-String ":5000" -Quiet
    $port3000 = netstat -ano | Select-String ":3000" -Quiet
    
    if ($port5000) {
        Write-Host "  Port 5000 (Backend): IN USE" -ForegroundColor Red
    } else {
        Write-Host "  Port 5000 (Backend): AVAILABLE" -ForegroundColor Green
    }
    
    if ($port3000) {
        Write-Host "  Port 3000 (Frontend): IN USE" -ForegroundColor Red
    } else {
        Write-Host "  Port 3000 (Frontend): AVAILABLE" -ForegroundColor Green
    }
    
    # Virtual environment check
    Write-Host ""
    Write-Host "Checking Backend Setup..." -ForegroundColor Yellow
    if (Test-Path "backend\venv") {
        Write-Host "  Virtual environment: EXISTS" -ForegroundColor Green
    } else {
        Write-Host "  Virtual environment: NOT FOUND" -ForegroundColor Yellow
    }
    
    if (Test-Path "backend\node_modules") {
        Write-Host "  Frontend node_modules: EXISTS" -ForegroundColor Green
    } else {
        Write-Host "  Frontend node_modules: NOT FOUND" -ForegroundColor Yellow
    }
    
    Write-Host ""
    Read-Host "Press Enter to continue"
}

switch ($choice) {
    "1" { Start-Backend }
    "2" { Start-Frontend }
    "3" {
        Write-Host ""
        Write-Host "Starting both services will require TWO terminal windows." -ForegroundColor Yellow
        Write-Host ""
        Write-Host "Follow these steps:" -ForegroundColor Cyan
        Write-Host "1. This window will start the Backend (FastAPI)" -ForegroundColor White
        Write-Host "2. Open another PowerShell window" -ForegroundColor White
        Write-Host "3. Navigate to this project's root directory" -ForegroundColor White
        Write-Host "4. Run: pnpm dev" -ForegroundColor White
        Write-Host ""
        Read-Host "Press Enter to start Backend. Keep this window open"
        Start-Backend
    }
    "4" { Install-Dependencies }
    "5" { Check-Status }
    "6" {
        Write-Host "Exiting..." -ForegroundColor Yellow
        exit 0
    }
    default {
        Write-Host "Invalid choice. Please select 1-6." -ForegroundColor Red
    }
}

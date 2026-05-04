@echo off
REM Quick Start Script for Electricity Demand Prediction App
REM Windows PowerShell version

echo.
echo ============================================================
echo Electricity Demand Prediction - Quick Start
echo ============================================================
echo.

REM Check if we're in the correct directory
if not exist "backend" (
    echo Error: backend folder not found. Please run this script from the project root.
    pause
    exit /b 1
)

REM Ask user what to start
echo What would you like to do?
echo 1. Start Backend Only (FastAPI)
echo 2. Start Frontend Only (Next.js)
echo 3. Start Both (Backend and Frontend)
echo 4. Install Dependencies
echo 5. Exit
echo.

set /p choice="Enter your choice (1-5): "

if "%choice%"=="1" (
    cls
    echo ============================================================
    echo Starting Backend Server (FastAPI)
    echo ============================================================
    echo.
    cd backend
    
    REM Check if venv exists
    if not exist "venv" (
        echo Virtual environment not found. Creating...
        python -m venv venv
        echo.
    )
    
    REM Activate venv
    call venv\Scripts\activate.bat
    
    REM Install dependencies if needed
    pip show fastapi >nul 2>&1
    if errorlevel 1 (
        echo Installing dependencies...
        pip install -r requirements.txt
    )
    
    REM Start server
    echo.
    echo Starting FastAPI server on http://localhost:8000
    echo Press Ctrl+C to stop
    echo.
    python -m uvicorn predict_api_fast:app --reload --host 127.0.0.1 --port 8000
    
) else if "%choice%"=="2" (
    cls
    echo ============================================================
    echo Starting Frontend Server (Next.js)
    echo ============================================================
    echo.
    
    REM Check if node_modules exists
    if not exist "node_modules" (
        echo node_modules not found. Installing dependencies...
        pnpm install
        if errorlevel 1 (
            echo pnpm not found. Trying npm...
            npm install
        )
    )
    
    REM Start frontend
    echo.
    echo Starting Next.js on http://localhost:3000
    echo Press Ctrl+C to stop
    echo.
    pnpm dev
    if errorlevel 1 (
        npm run dev
    )
    
) else if "%choice%"=="3" (
    cls
    echo ============================================================
    echo Starting Both Services
    echo ============================================================
    echo.
    echo This will start two servers:
    echo   - Backend: http://localhost:5000
    echo   - Frontend: http://localhost:3000
    echo.
    echo Make sure you have two terminal windows open.
    echo.
    echo Instructions:
    echo 1. Keep this window for the backend
    echo 2. Open another PowerShell window for the frontend
    echo 3. In new window, cd to project root and run: pnpm dev
    echo.
    pause
    
    cls
    echo ============================================================
    echo Starting Backend Server (FastAPI)
    echo ============================================================
    echo.
    cd backend
    
    REM Check if venv exists
    if not exist "venv" (
        echo Virtual environment not found. Creating...
        python -m venv venv
    )
    
    REM Activate venv
    call venv\Scripts\activate.bat
    
    REM Install dependencies
    pip show fastapi >nul 2>&1
    if errorlevel 1 (
        echo Installing dependencies...
        pip install -r requirements.txt
    )
    
    REM Start server
    echo.
    echo Starting FastAPI server on http://localhost:8000
    echo Open another terminal window and run: pnpm dev
    echo.
    python -m uvicorn predict_api_fast:app --reload --host 127.0.0.1 --port 8000
    
) else if "%choice%"=="4" (
    cls
    echo ============================================================
    echo Installing Dependencies
    echo ============================================================
    echo.
    
    REM Backend dependencies
    echo Installing Backend Dependencies...
    cd backend
    
    if not exist "venv" (
        echo Creating virtual environment...
        python -m venv venv
    )
    
    call venv\Scripts\activate.bat
    echo Installing Python packages from requirements.txt...
    pip install -r requirements.txt
    
    cd ..
    
    REM Frontend dependencies
    echo.
    echo Installing Frontend Dependencies...
    echo Trying pnpm...
    pnpm install
    
    if errorlevel 1 (
        echo pnpm not found. Trying npm...
        npm install
    )
    
    echo.
    echo ============================================================
    echo Dependencies installed successfully!
    echo ============================================================
    echo.
    echo Next steps:
    echo 1. Start backend: python backend\run.py
    echo 2. Start frontend: pnpm dev
    echo.
    pause
    
) else (
    echo Exiting...
    exit /b 0
)

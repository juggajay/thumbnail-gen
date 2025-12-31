@echo off
setlocal

echo ======================================
echo   Thumbnail Generator - Starting...
echo ======================================

:: Check for .env file
if not exist .env (
    echo.
    echo Warning: .env file not found!
    echo Copy .env.example to .env and add your GEMINI_API_KEY
    echo.
)

:: Create data directories if they don't exist
if not exist data\templates mkdir data\templates
if not exist data\assets\backgrounds mkdir data\assets\backgrounds
if not exist data\assets\fonts mkdir data\assets\fonts
if not exist data\assets\overlays mkdir data\assets\overlays
if not exist data\outputs mkdir data\outputs

:: Install backend dependencies if needed
if not exist backend\__pycache__ (
    echo.
    echo Installing backend dependencies...
    pip install -r backend\requirements.txt
)

:: Install frontend dependencies if needed
if not exist frontend\node_modules (
    echo.
    echo Installing frontend dependencies...
    cd frontend
    call npm install
    cd ..
)

echo.
echo Starting services...
echo.

:: Start backend in new window
echo [Backend] Starting FastAPI on http://localhost:8000
start "Thumbnail Generator - Backend" cmd /c "cd backend && uvicorn main:app --reload --host 0.0.0.0 --port 8000"

:: Give backend a moment to start
timeout /t 2 /nobreak > nul

:: Start frontend in new window
echo [Frontend] Starting Vite on http://localhost:5173
start "Thumbnail Generator - Frontend" cmd /c "cd frontend && npm run dev"

echo.
echo ======================================
echo   Services Started!
echo ======================================
echo.
echo   UI:  http://localhost:5173
echo   API: http://localhost:8000
echo   Docs: http://localhost:8000/docs
echo.
echo Close the terminal windows to stop services
echo.

pause

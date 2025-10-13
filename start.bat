@echo off
echo ============================================================
echo    AI Documind - Starting Application
echo ============================================================
echo.

REM Start backend in new window
echo Starting Backend Server (Port 8000)...
start "AI Documind - Backend" cmd /k "cd /d %~dp0 && python -m uvicorn backend.api:app --host 0.0.0.0 --port 8000"

REM Wait for backend to initialize
timeout /t 5 /nobreak >nul

REM Start frontend in new window
echo Starting Frontend UI (Port 8501)...
start "AI Documind - Frontend" cmd /k "cd /d %~dp0 && streamlit run frontend/app_api.py --server.port 8501"

echo.
echo ============================================================
echo    Both servers are starting...
echo ============================================================
echo.
echo    Backend API:  http://localhost:8000
echo    Frontend UI:  http://localhost:8501
echo    API Docs:     http://localhost:8000/docs
echo.
echo    Press Ctrl+C in each window to stop the servers
echo ============================================================
pause

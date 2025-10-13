# AI Documind - PowerShell Launcher
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host "   AI Documind - Starting Application" -ForegroundColor Cyan
Write-Host "============================================================" -ForegroundColor Cyan
Write-Host ""

# Start backend in new window
Write-Host "Starting Backend Server (Port 8000)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'P:\Projects\RAG'; Write-Host 'AI Documind Backend Server' -ForegroundColor Green; python -m uvicorn backend.api:app --host 0.0.0.0 --port 8000"

# Wait for backend to initialize
Write-Host "Waiting for backend to initialize..." -ForegroundColor Yellow
Start-Sleep -Seconds 5

# Start frontend in new window
Write-Host "Starting Frontend UI (Port 8501)..." -ForegroundColor Yellow
Start-Process powershell -ArgumentList "-NoExit", "-Command", "cd 'P:\Projects\RAG'; Write-Host 'AI Documind Frontend UI' -ForegroundColor Green; streamlit run frontend/app_api.py --server.port 8501"

Write-Host ""
Write-Host "============================================================" -ForegroundColor Green
Write-Host "   Both servers are starting..." -ForegroundColor Green
Write-Host "============================================================" -ForegroundColor Green
Write-Host ""
Write-Host "   Backend API:  http://localhost:8000" -ForegroundColor Cyan
Write-Host "   Frontend UI:  http://localhost:8501" -ForegroundColor Cyan
Write-Host "   API Docs:     http://localhost:8000/docs" -ForegroundColor Cyan
Write-Host ""
Write-Host "   Your browser should open automatically to the Frontend UI" -ForegroundColor Yellow
Write-Host "   Press Ctrl+C in each window to stop the servers" -ForegroundColor Yellow
Write-Host "============================================================" -ForegroundColor Cyan

@echo off
echo Starting Project Management SaaS...

echo Starting Backend Server (FastAPI on port 8000)...
start cmd /k "cd Backend && .venv\Scripts\activate && uvicorn main:app --reload"

echo Starting Frontend Server (Vite on port 5173)...
start cmd /k "cd frontend && npm run dev"

echo ========================================================
echo Both servers have been launched in separate windows!
echo - Backend API:  http://localhost:8000 (Docs: http://localhost:8000/docs)
echo - Frontend UI:  http://localhost:5173
echo ========================================================
pause

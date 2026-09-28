@echo off
title StudySnap - Instant Public URL
color 0B

echo =======================================================
echo          StudySnap - Public Device Access
echo =======================================================
echo.
echo Starting StudySnap local server if not already running...

:: Check if server is running on port 5000
netstat -ano | findstr :5000 >nul 2>&1
if errorlevel 1 (
    echo Starting Python server in background...
    start /b python app.py >nul 2>&1
    timeout /t 3 >nul
)

echo.
echo Starting public secure tunnel (Cloudflare)...
echo Your public HTTPS link will appear below:
echo =======================================================
echo.

if exist "tools\cloudflared.exe" (
    tools\cloudflared.exe tunnel --url http://127.0.0.1:5000
) else (
    ssh -R 80:127.0.0.1:5000 -o StrictHostKeyChecking=no -o ServerAliveInterval=30 nokey@localhost.run
)

pause

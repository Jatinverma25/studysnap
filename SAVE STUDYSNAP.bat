@echo off
title SAVE STUDYSNAP
color 0F
mode con: cols=60 lines=8 >nul 2>&1

cls
echo Saving...

:: Target project directory
set "TARGET_DIR=C:\Users\Lenovo\.gemini\antigravity\scratch\StudySnap"

:: Handle path without leading dot if applicable
if not exist "%TARGET_DIR%" (
    if exist "C:\Users\Lenovo.gemini\antigravity\scratch\StudySnap" (
        set "TARGET_DIR=C:\Users\Lenovo.gemini\antigravity\scratch\StudySnap"
    )
)

:: If target folder lacks a Git repository, fallback to active workspace repo
if not exist "%TARGET_DIR%\.git" (
    if exist "C:\Projects\Mini project\.git" (
        set "TARGET_DIR=C:\Projects\Mini project"
    )
)

cd /d "%TARGET_DIR%"

:: Add all changes, commit with timestamp, and push to GitHub
git add -A >nul 2>&1
git commit -m "Auto-save: %date% %time%" >nul 2>&1
git push origin main >nul 2>&1 || git push >nul 2>&1

echo.
echo Done! Press any key
pause >nul
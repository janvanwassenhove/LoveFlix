@echo off
REM LoveFlix Desktop App - Windows Startup Script
REM ==============================================

echo.
echo  💕 LoveFlix - Transform Any Movie Into Romance! 💕
echo  ==================================================
echo.

REM Check if Node.js is installed
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo  ❌ Node.js is not installed!
    echo  Please install Node.js from https://nodejs.org/
    echo.
    pause
    exit /b 1
)

REM Navigate to electron-app directory
cd /d "%~dp0electron-app"

REM Check if node_modules exists
if not exist "node_modules" (
    echo  📦 Installing dependencies...
    echo.
    call npm install
    if %ERRORLEVEL% NEQ 0 (
        echo  ❌ Failed to install dependencies!
        pause
        exit /b 1
    )
    echo.
)

echo  🚀 Starting LoveFlix...
echo.

REM Start the app
call npm start

if %ERRORLEVEL% NEQ 0 (
    echo.
    echo  ❌ Failed to start LoveFlix!
    pause
    exit /b 1
)

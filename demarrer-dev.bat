@echo off
SETLOCAL ENABLEDELAYEDEXPANSION
:: Project root starter: frees ports then starts backend and Expo web on fixed ports
set BACKEND_PORT=8082
set EXPO_PORT=8083

echo Freeing ports %BACKEND_PORT% and %EXPO_PORT% if occupied...
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%BACKEND_PORT% "') do (
  if "%%a" neq "" (
    echo Killing PID %%a using port %BACKEND_PORT%...
    taskkill /PID %%a /F >nul 2>&1 || echo Could not kill %%a
  )
)
for /f "tokens=5" %%a in ('netstat -aon ^| findstr ":%EXPO_PORT% "') do (
  if "%%a" neq "" (
    echo Killing PID %%a using port %EXPO_PORT%...
    taskkill /PID %%a /F >nul 2>&1 || echo Could not kill %%a
  )
)

:: Start backend in a new window (ensures PORT env is set for start-server.js)
echo Starting backend on port %BACKEND_PORT%...
start "Backend" cmd /k "cd /d %~dp0 && set PORT=%BACKEND_PORT% && node start-server.js"

:: Give backend a moment to bind
timeout /t 2 /nobreak >nul

:: Start Expo web in a new window with fixed port
echo Starting Expo web on port %EXPO_PORT%...
start "Expo" cmd /k "cd /d %~dp0 && npx expo start --web --port %EXPO_PORT%"

echo Done. Two windows should have opened: Backend and Expo.
ENDLOCAL
pause

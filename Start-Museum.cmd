@echo off
setlocal
cd /d "%~dp0"
if exist "tools\node.exe" (
  "tools\node.exe" scripts\serve.mjs
) else (
  where node >nul 2>nul
  if errorlevel 1 (
    echo Install Node.js 20 or later, then run this launcher again.
    pause
    exit /b 1
  )
  node scripts\serve.mjs
)
pause

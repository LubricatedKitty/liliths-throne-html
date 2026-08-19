@echo off
title Upload Liliths Throne HTML to GitHub
cd /d "%~dp0"
echo.
echo This uploads ONLY the Liliths Throne HTML folder.
echo Official Java / 0.4.10 / Twine files next door are left alone.
echo.
powershell -NoProfile -ExecutionPolicy Bypass -File "%~dp0upload-to-github.ps1" %*
echo.
if errorlevel 1 (
  echo Upload failed.
) else (
  echo Finished.
)
pause

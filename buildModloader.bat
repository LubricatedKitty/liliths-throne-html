@echo off
cd /d "%~dp0"
python buildModloader.py
if errorlevel 1 (
    echo Build failed.
    pause
    exit /b 1
)
echo KittyLoader.exe is in this folder.
pause

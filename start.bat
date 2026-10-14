@echo off
cd /d "%~dp0"
echo Jokai web -^> http://localhost:8000  (Ctrl+C para parar)
python -m http.server 8000
pause

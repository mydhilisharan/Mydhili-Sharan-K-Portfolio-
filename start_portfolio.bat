@echo off
echo Starting Local Portfolio Server...
echo This will bypass all Firebase "Unknown Error" CORS blocks!
echo.
python -m http.server 8000
pause

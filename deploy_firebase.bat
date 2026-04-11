@echo off
echo ========================================================
echo FIREBASE AUTO-DEPLOYMENT SCRIPT
echo ========================================================
echo.
echo Step 1: Logging into Firebase...
echo A browser window will pop up. Please select your Google account and click "Allow".
call firebase login

echo.
echo Step 2: Deploying Database and Storage Rules...
call firebase deploy --project sharan-portfolio-660af --only firestore,storage

echo.
echo ========================================================
echo All Done! Your Firebase rules are now 100%% active.
echo You can close this window and try uploading on your website!
echo ========================================================
pause

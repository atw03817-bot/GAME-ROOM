@echo off
echo Updating Diagnosis Schema...
echo.
cd backend
node ../UPDATE_DIAGNOSIS_SCHEMA.js
echo.
echo Schema update completed!
pause
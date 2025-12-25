@echo off
echo Updating Model Schema...
echo.
cd backend
node ../UPDATE_MODEL_SCHEMA.js
echo.
echo Schema update completed!
echo Now restart the backend server and try again.
pause
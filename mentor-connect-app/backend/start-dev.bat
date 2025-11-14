@echo off
echo Starting Mentor Connect Backend Development Server...
echo.

REM Check if .env file exists
if not exist ".env" (
    echo Creating .env file from template...
    copy "env.example" ".env"
    echo Please edit .env file with your configuration before starting the server.
    echo.
)

REM Check if node_modules exists
if not exist "node_modules" (
    echo Installing dependencies...
    npm install
    echo.
)

echo Starting development server...
echo Server will be available at: http://localhost:5000
echo Health check: http://localhost:5000/api/health
echo.
echo Press Ctrl+C to stop the server
echo.

npm run dev

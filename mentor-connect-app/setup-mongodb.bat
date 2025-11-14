@echo off
echo ========================================
echo MongoDB Setup for Mentor Connect App
echo ========================================
echo.

echo This script will help you set up MongoDB for your application.
echo.

echo Step 1: Creating .env file in backend directory...
echo.

if not exist "backend\.env" (
    echo Creating .env file...
    (
        echo # Server Configuration
        echo PORT=5000
        echo NODE_ENV=development
        echo.
        echo # MongoDB Configuration ^(Atlas^)
        echo MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/mentor-connect?retryWrites=true^&w=majority
        echo MONGODB_URI_PROD=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/mentor-connect?retryWrites=true^&w=majority
        echo.
        echo # JWT Configuration
        echo JWT_SECRET=mentor-connect-super-secret-jwt-key-2024-change-this-in-production
        echo JWT_EXPIRES_IN=7d
        echo.
        echo # CORS Configuration
        echo CORS_ORIGIN=http://localhost:3000
        echo.
        echo # File Upload Configuration
        echo MAX_FILE_SIZE=5242880
        echo UPLOAD_PATH=./uploads
        echo.
        echo # Rate Limiting
        echo RATE_LIMIT_WINDOW_MS=900000
        echo RATE_LIMIT_MAX_REQUESTS=100
    ) > backend\.env
    echo .env file created successfully!
) else (
    echo .env file already exists.
)

echo.
echo Step 2: Installing backend dependencies...
cd backend
npm install

echo.
echo Step 3: Testing MongoDB connection...
echo.
echo IMPORTANT: Before running this test, make sure you have:
echo 1. Created a MongoDB Atlas account
echo 2. Set up your cluster and database user
echo 3. Updated the MONGODB_URI in backend\.env with your actual connection string
echo.
echo Press any key to continue with the connection test...
pause >nul

echo.
echo Starting backend server to test MongoDB connection...
echo.
npm run dev

echo.
echo If you see "MongoDB connected successfully", your setup is working!
echo If you see connection errors, please check your .env file and MongoDB Atlas setup.
echo.
echo Press any key to exit...
pause >nul

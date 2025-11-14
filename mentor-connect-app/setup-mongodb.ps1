Write-Host "========================================" -ForegroundColor Cyan
Write-Host "MongoDB Setup for Mentor Connect App" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

Write-Host "This script will help you set up MongoDB for your application." -ForegroundColor Yellow
Write-Host ""

Write-Host "Step 1: Creating .env file in backend directory..." -ForegroundColor Green
Write-Host ""

if (-not (Test-Path "backend\.env")) {
    Write-Host "Creating .env file..." -ForegroundColor Yellow
    
    $envContent = @"
# Server Configuration
PORT=5000
NODE_ENV=development

# MongoDB Configuration (Atlas)
MONGODB_URI=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/mentor-connect?retryWrites=true&w=majority
MONGODB_URI_PROD=mongodb+srv://your-username:your-password@your-cluster.mongodb.net/mentor-connect?retryWrites=true&w=majority

# JWT Configuration
JWT_SECRET=mentor-connect-super-secret-jwt-key-2024-change-this-in-production
JWT_EXPIRES_IN=7d

# CORS Configuration
CORS_ORIGIN=http://localhost:3000

# File Upload Configuration
MAX_FILE_SIZE=5242880
UPLOAD_PATH=./uploads

# Rate Limiting
RATE_LIMIT_WINDOW_MS=900000
RATE_LIMIT_MAX_REQUESTS=100
"@

    $envContent | Out-File -FilePath "backend\.env" -Encoding UTF8
    Write-Host ".env file created successfully!" -ForegroundColor Green
} else {
    Write-Host ".env file already exists." -ForegroundColor Yellow
}

Write-Host ""
Write-Host "Step 2: Installing backend dependencies..." -ForegroundColor Green
Set-Location backend
npm install

Write-Host ""
Write-Host "Step 3: Testing MongoDB connection..." -ForegroundColor Green
Write-Host ""
Write-Host "IMPORTANT: Before running this test, make sure you have:" -ForegroundColor Red
Write-Host "1. Created a MongoDB Atlas account" -ForegroundColor White
Write-Host "2. Set up your cluster and database user" -ForegroundColor White
Write-Host "3. Updated the MONGODB_URI in backend\.env with your actual connection string" -ForegroundColor White
Write-Host ""
Write-Host "Press any key to continue with the connection test..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

Write-Host ""
Write-Host "Starting backend server to test MongoDB connection..." -ForegroundColor Green
Write-Host ""
npm run dev

Write-Host ""
Write-Host "If you see 'MongoDB connected successfully', your setup is working!" -ForegroundColor Green
Write-Host "If you see connection errors, please check your .env file and MongoDB Atlas setup." -ForegroundColor Red
Write-Host ""
Write-Host "Press any key to exit..." -ForegroundColor Yellow
$null = $Host.UI.RawUI.ReadKey("NoEcho,IncludeKeyDown")

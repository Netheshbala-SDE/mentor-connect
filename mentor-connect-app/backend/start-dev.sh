#!/bin/bash

echo "Starting Mentor Connect Backend Development Server..."
echo

# Check if .env file exists
if [ ! -f ".env" ]; then
    echo "Creating .env file from template..."
    cp "env.example" ".env"
    echo "Please edit .env file with your configuration before starting the server."
    echo
fi

# Check if node_modules exists
if [ ! -d "node_modules" ]; then
    echo "Installing dependencies..."
    npm install
    echo
fi

echo "Starting development server..."
echo "Server will be available at: http://localhost:5000"
echo "Health check: http://localhost:5000/api/health"
echo
echo "Press Ctrl+C to stop the server"
echo

npm run dev

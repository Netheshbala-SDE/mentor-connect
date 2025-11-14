# MongoDB Setup Guide for Mentor Connect App

This guide will help you set up MongoDB for your Mentor Connect application using MongoDB Atlas (cloud-based solution).

## Option 1: MongoDB Atlas (Recommended - Cloud-based)

### Step 1: Create MongoDB Atlas Account

1. Go to [MongoDB Atlas](https://www.mongodb.com/atlas)
2. Click "Try Free" or "Sign Up"
3. Create an account or sign in with Google/GitHub
4. Choose "Free" tier (M0) - this gives you 512MB storage and shared RAM

### Step 2: Create a Cluster

1. Click "Build a Database"
2. Choose "FREE" tier (M0)
3. Select your preferred cloud provider (AWS, Google Cloud, or Azure)
4. Choose a region close to you
5. Click "Create"

### Step 3: Set Up Database Access

1. In the left sidebar, click "Database Access"
2. Click "Add New Database User"
3. Choose "Password" authentication
4. Create a username (e.g., `mentor-connect-user`)
5. Click "Autogenerate Secure Password" or create your own
6. **IMPORTANT**: Save the username and password - you'll need them for the connection string
7. Under "Database User Privileges", select "Read and write to any database"
8. Click "Add User"

### Step 4: Set Up Network Access

1. In the left sidebar, click "Network Access"
2. Click "Add IP Address"
3. For development, click "Allow Access from Anywhere" (0.0.0.0/0)
4. Click "Confirm"

### Step 5: Get Your Connection String

1. Go back to "Database" in the left sidebar
2. Click "Connect" on your cluster
3. Choose "Connect your application"
4. Copy the connection string
5. Replace `<password>` with your actual password
6. Replace `<dbname>` with `mentor-connect`

### Step 6: Create Environment File

Create a file called `.env` in the `backend` folder with the following content:

```env
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
```

**Replace the following in your `.env` file:**
- `your-username` with your MongoDB Atlas username
- `your-password` with your MongoDB Atlas password
- `your-cluster` with your actual cluster name

## Option 2: Local MongoDB Installation

If you prefer to run MongoDB locally:

### Windows Installation

1. Download MongoDB Community Server from [MongoDB Download Center](https://www.mongodb.com/try/download/community)
2. Run the installer and follow the setup wizard
3. Install MongoDB Compass (GUI tool) when prompted
4. Start MongoDB service

### macOS Installation (using Homebrew)

```bash
# Install MongoDB
brew tap mongodb/brew
brew install mongodb-community

# Start MongoDB service
brew services start mongodb/brew/mongodb-community
```

### Linux Installation (Ubuntu)

```bash
# Import MongoDB public GPG key
wget -qO - https://www.mongodb.org/static/pgp/server-6.0.asc | sudo apt-key add -

# Create list file for MongoDB
echo "deb [ arch=amd64,arm64 ] https://repo.mongodb.org/apt/ubuntu focal/mongodb-org/6.0 multiverse" | sudo tee /etc/apt/sources.list.d/mongodb-org-6.0.list

# Update package database
sudo apt-get update

# Install MongoDB
sudo apt-get install -y mongodb-org

# Start MongoDB
sudo systemctl start mongod
sudo systemctl enable mongod
```

### Local Environment Configuration

For local MongoDB, use this connection string in your `.env` file:

```env
MONGODB_URI=mongodb://localhost:27017/mentor-connect
```

## Step 7: Test Your Connection

1. Navigate to the backend directory:
   ```bash
   cd backend
   ```

2. Install dependencies (if not already done):
   ```bash
   npm install
   ```

3. Start the development server:
   ```bash
   npm run dev
   ```

4. Check the console output - you should see:
   ```
   MongoDB connected successfully
   Server running on port 5000
   ```

## Step 8: Verify Database Creation

1. Go to your MongoDB Atlas dashboard
2. Click "Browse Collections" on your cluster
3. You should see a `mentor-connect` database
4. The collections will be created automatically when you first use the API

## Troubleshooting

### Common Issues

1. **Connection Error**: Make sure your IP address is whitelisted in Network Access
2. **Authentication Error**: Double-check your username and password in the connection string
3. **Cluster Not Found**: Verify your cluster name in the connection string

### Connection String Format

Your connection string should look like this:
```
mongodb+srv://username:password@cluster-name.xxxxx.mongodb.net/mentor-connect?retryWrites=true&w=majority
```

### Security Notes

- Never commit your `.env` file to version control
- Use strong passwords for your database user
- In production, use environment-specific connection strings
- Consider using MongoDB Atlas VPC peering for enhanced security

## Next Steps

Once MongoDB is set up:

1. Start your backend server: `cd backend && npm run dev`
2. Start your frontend: `npm start` (from root directory)
3. Test the API endpoints using the frontend or tools like Postman
4. Check that data is being saved to your MongoDB database

## MongoDB Compass (Optional GUI Tool)

For easier database management, install MongoDB Compass:

1. Download from [MongoDB Compass](https://www.mongodb.com/try/download/compass)
2. Install and open the application
3. Connect using your Atlas connection string
4. Browse and manage your collections visually

## Support

If you encounter any issues:
1. Check the MongoDB Atlas documentation
2. Verify your connection string format
3. Ensure your IP is whitelisted
4. Check the backend console for detailed error messages

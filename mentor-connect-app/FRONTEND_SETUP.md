# Frontend Setup Guide

This guide will help you set up the frontend to connect with the backend API.

## 🚀 Quick Start

### 1. Environment Configuration

Create a `.env` file in the root directory (same level as `package.json`):

```bash
# Copy the example file
cp env.example .env
```

Edit the `.env` file with your backend configuration:

```env
# Backend API URL
REACT_APP_API_URL=http://localhost:5000/api

# Environment
REACT_APP_ENV=development
```

### 2. Install Dependencies

```bash
npm install
```

### 3. Start the Development Server

```bash
npm start
```

The frontend will be available at `http://localhost:3000`

## 🔧 Backend Requirements

Before running the frontend, ensure your backend is:

1. **Running** on `http://localhost:5000`
2. **MongoDB** is connected and running
3. **Environment variables** are properly configured in `backend/.env`

## 📡 API Integration

### Authentication Flow

The frontend now uses real API authentication:

1. **Registration**: Creates user account and receives JWT token
2. **Login**: Authenticates user and receives JWT token
3. **Token Storage**: JWT tokens are stored in localStorage
4. **Auto-login**: App checks for valid token on startup
5. **Logout**: Clears token and user data

### API Service

All API calls are handled through `src/services/api.ts`:

- **Centralized API client** with error handling
- **Automatic token management** for authenticated requests
- **TypeScript interfaces** for type safety
- **Comprehensive error handling** and user feedback

### Custom Hooks

Use the provided custom hooks for API operations:

```typescript
import { useMentors, useProjects, useUserProfile } from '../hooks/useApi';

// In your component
const { data, loading, error, execute } = useMentors();

useEffect(() => {
  execute(); // Fetch mentors
}, [execute]);
```

## 🎯 Updated Features

### 1. Real Authentication
- ✅ JWT-based authentication
- ✅ Automatic token validation
- ✅ Secure logout functionality
- ✅ Error handling for auth failures

### 2. Dynamic Data Loading
- ✅ Mentors page loads from API
- ✅ Projects page loads from API
- ✅ Loading states and error handling
- ✅ Search and filtering functionality

### 3. Error Handling
- ✅ Global error boundary
- ✅ API error handling
- ✅ User-friendly error messages
- ✅ Retry functionality

### 4. Type Safety
- ✅ TypeScript interfaces for all API responses
- ✅ Type-safe API service
- ✅ Proper error typing

## 🔍 Testing the Integration

### 1. Health Check
Visit `http://localhost:3000` and check the browser console for any API connection errors.

### 2. Authentication Test
1. Go to `/register` and create a new account
2. Check that you're automatically logged in
3. Go to `/login` and test login functionality
4. Test logout functionality

### 3. Data Loading Test
1. Visit `/mentors` - should show loading state then mentors data
2. Visit `/projects` - should show loading state then projects data
3. Test search and filtering functionality

## 🛠️ Development

### Adding New API Endpoints

1. **Add to API Service** (`src/services/api.ts`):
```typescript
async getNewData(): Promise<ApiResponse<NewDataType>> {
  return this.request<NewDataType>('/new-endpoint');
}
```

2. **Create Custom Hook** (`src/hooks/useApi.ts`):
```typescript
export function useNewData() {
  return useApi(apiService.getNewData);
}
```

3. **Use in Component**:
```typescript
const { data, loading, error, execute } = useNewData();
```

### Environment Variables

Add new environment variables to `.env`:
```env
REACT_APP_NEW_VARIABLE=value
```

Access in code:
```typescript
const value = process.env.REACT_APP_NEW_VARIABLE;
```

## 🚨 Troubleshooting

### Common Issues

1. **CORS Errors**
   - Ensure backend CORS is configured for `http://localhost:3000`
   - Check `backend/.env` has `CORS_ORIGIN=http://localhost:3000`

2. **API Connection Failed**
   - Verify backend is running on port 5000
   - Check `REACT_APP_API_URL` in `.env`
   - Ensure MongoDB is running

3. **Authentication Issues**
   - Clear localStorage and try again
   - Check JWT_SECRET in backend `.env`
   - Verify token expiration settings

4. **TypeScript Errors**
   - Run `npm run build` to check for type errors
   - Ensure all API interfaces are properly typed

### Debug Mode

Enable debug logging by adding to `.env`:
```env
REACT_APP_DEBUG=true
```

This will log all API requests and responses to the console.

## 📚 API Documentation

For detailed API documentation, see `backend/README.md`.

## 🔄 Next Steps

1. **Test all features** with real backend data
2. **Add more API integrations** as needed
3. **Implement real-time features** (WebSocket)
4. **Add offline support** (Service Workers)
5. **Optimize performance** (React.memo, useMemo, etc.)

## 🆘 Support

If you encounter issues:

1. Check the browser console for errors
2. Verify backend is running and accessible
3. Check environment variable configuration
4. Review API documentation in `backend/README.md`
5. Create an issue with detailed error information

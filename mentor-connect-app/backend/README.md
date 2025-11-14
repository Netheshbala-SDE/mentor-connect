# Mentor Connect Backend API

A robust Node.js/Express backend API for the Mentor Connect platform, built with TypeScript, MongoDB, and JWT authentication.

## 🚀 Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control
- **User Management**: Complete user CRUD operations with profile management
- **Mentor System**: Find and connect with mentors based on skills and availability
- **Project Management**: Create, update, and manage projects with mentor assignments
- **Profile System**: Comprehensive user profiles with statistics and project history
- **Security**: Rate limiting, input validation, CORS, and security headers
- **Database**: MongoDB with Mongoose ODM
- **TypeScript**: Full TypeScript support with type safety

## 📋 Prerequisites

- Node.js (v16 or higher)
- MongoDB (local or cloud instance)
- npm or yarn

## 🛠️ Installation

1. **Clone the repository and navigate to backend directory:**
   ```bash
   cd backend
   ```

2. **Install dependencies:**
   ```bash
   npm install
   ```

3. **Set up environment variables:**
   ```bash
   cp env.example .env
   ```
   
   Edit `.env` file with your configuration:
   ```env
   PORT=5000
   NODE_ENV=development
   MONGODB_URI=mongodb://localhost:27017/mentor-connect
   JWT_SECRET=your-super-secret-jwt-key
   JWT_EXPIRES_IN=7d
   CORS_ORIGIN=http://localhost:3000
   ```

4. **Start MongoDB** (if using local instance):
   ```bash
   # On Windows
   mongod
   
   # On macOS/Linux
   sudo systemctl start mongod
   ```

5. **Run the development server:**
   ```bash
   npm run dev
   ```

6. **Build for production:**
   ```bash
   npm run build
   npm start
   ```

## 📚 API Documentation

### Authentication Endpoints

#### Register User
```http
POST /api/auth/register
Content-Type: application/json

{
  "name": "John Doe",
  "email": "john@example.com",
  "password": "password123",
  "role": "engineer",
  "skills": ["React", "Node.js", "TypeScript"],
  "experience": "5 years"
}
```

#### Login User
```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "john@example.com",
  "password": "password123"
}
```

#### Get Current User
```http
GET /api/auth/me
Authorization: Bearer <token>
```

### User Endpoints

#### Get All Users
```http
GET /api/users?role=engineer&skills=React&page=1&limit=10
Authorization: Bearer <token>
```

#### Get Single User
```http
GET /api/users/:id
Authorization: Bearer <token>
```

#### Update User
```http
PUT /api/users/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe Updated",
  "bio": "Experienced software engineer",
  "location": "San Francisco, CA",
  "github": "https://github.com/johndoe",
  "linkedin": "https://linkedin.com/in/johndoe"
}
```

### Mentor Endpoints

#### Get All Mentors
```http
GET /api/mentors?skills=React&location=San Francisco&page=1&limit=10
```

#### Get Top Rated Mentors
```http
GET /api/mentors/top/rated?limit=5
```

#### Search Mentors by Skills
```http
GET /api/mentors/search/skills?skills=React&skills=Node.js&page=1&limit=10
```

#### Update Mentor Availability
```http
PUT /api/mentors/:id/availability
Authorization: Bearer <token>
Content-Type: application/json

{
  "isAvailable": false
}
```

### Project Endpoints

#### Get All Projects
```http
GET /api/projects?status=open&difficulty=intermediate&skills=React&page=1&limit=10
```

#### Create Project
```http
POST /api/projects
Authorization: Bearer <token>
Content-Type: application/json

{
  "title": "E-commerce Platform",
  "description": "A full-stack e-commerce platform built with React and Node.js",
  "skills": ["React", "Node.js", "MongoDB"],
  "difficulty": "intermediate",
  "duration": "3 months",
  "budget": 5000,
  "githubUrl": "https://github.com/user/ecommerce-platform"
}
```

#### Assign Mentor to Project
```http
PUT /api/projects/:id/assign-mentor
Authorization: Bearer <token>
Content-Type: application/json

{
  "mentorId": "mentor-user-id"
}
```

### Profile Endpoints

#### Get User Profile
```http
GET /api/profiles/:id
```

#### Update Profile
```http
PUT /api/profiles/:id
Authorization: Bearer <token>
Content-Type: application/json

{
  "name": "John Doe",
  "bio": "Experienced software engineer",
  "skills": ["React", "Node.js", "TypeScript"],
  "isAvailable": true
}
```

#### Get User Statistics
```http
GET /api/profiles/:id/stats
```

## 🔐 Authentication

The API uses JWT (JSON Web Tokens) for authentication. Include the token in the Authorization header:

```http
Authorization: Bearer <your-jwt-token>
```

## 📊 Database Schema

### User Model
```typescript
{
  name: string;
  email: string;
  password: string;
  role: 'engineer' | 'student';
  skills: string[];
  experience: string;
  avatar?: string;
  bio?: string;
  location?: string;
  github?: string;
  linkedin?: string;
  website?: string;
  isAvailable: boolean;
  rating: number;
  totalReviews: number;
}
```

### Project Model
```typescript
{
  title: string;
  description: string;
  owner: ObjectId;
  mentor?: ObjectId;
  skills: string[];
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  status: 'open' | 'in-progress' | 'completed' | 'cancelled';
  duration: string;
  budget?: number;
  githubUrl?: string;
  liveUrl?: string;
  images: string[];
}
```

## 🛡️ Security Features

- **Rate Limiting**: Prevents abuse with configurable limits
- **Input Validation**: Comprehensive validation using express-validator
- **CORS**: Configurable Cross-Origin Resource Sharing
- **Helmet**: Security headers for protection
- **Password Hashing**: bcrypt for secure password storage
- **JWT**: Secure token-based authentication

## 🧪 Testing

```bash
npm test
```

## 📝 Environment Variables

| Variable | Description | Default |
|----------|-------------|---------|
| `PORT` | Server port | 5000 |
| `NODE_ENV` | Environment | development |
| `MONGODB_URI` | MongoDB connection string | mongodb://localhost:27017/mentor-connect |
| `JWT_SECRET` | JWT signing secret | fallback-secret |
| `JWT_EXPIRES_IN` | JWT expiration time | 7d |
| `CORS_ORIGIN` | Allowed CORS origin | http://localhost:3000 |
| `RATE_LIMIT_WINDOW_MS` | Rate limit window | 900000 (15 min) |
| `RATE_LIMIT_MAX_REQUESTS` | Max requests per window | 100 |

## 🚀 Deployment

1. **Build the application:**
   ```bash
   npm run build
   ```

2. **Set production environment variables**

3. **Start the server:**
   ```bash
   npm start
   ```

## 📞 Support

For support and questions, please open an issue in the repository.

## 📄 License

This project is licensed under the MIT License.

# Mentor Connect App - Features Documentation

## Overview
Mentor Connect is a platform connecting software engineers with engineering students for mutual benefit. Engineers get project assistance from students in exchange for mentorship.

## Architecture
- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + TypeScript + MongoDB
- **API Base URL**: `http://localhost:5000/api`

---

## Features Implemented

### 1. Authentication System

#### 1.1 User Registration
- **Route**: `POST /api/auth/register`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "name": "string (2-50 chars)",
    "email": "valid email",
    "password": "string (min 6 chars)",
    "role": "engineer" | "student",
    "skills": ["string[]"],
    "experience": "string"
  }
  ```
- **Response**: 
  ```json
  {
    "success": true,
    "data": {
      "token": "JWT token",
      "user": { /* user object */ }
    }
  }
  ```
- **Intended Behavior**: Creates new user account, hashes password, generates JWT token, returns user data without password

#### 1.2 User Login
- **Route**: `POST /api/auth/login`
- **Access**: Public
- **Request Body**:
  ```json
  {
    "email": "valid email",
    "password": "string"
  }
  ```
- **Response**: Same as registration
- **Intended Behavior**: Validates credentials, returns JWT token and user data

#### 1.3 Get Current User
- **Route**: `GET /api/auth/me`
- **Access**: Private (requires JWT token)
- **Response**: 
  ```json
  {
    "success": true,
    "data": {
      "user": { /* user object */ }
    }
  }
  ```
- **Intended Behavior**: Returns authenticated user's profile data

---

### 2. User Management

#### 2.1 Get All Users
- **Route**: `GET /api/users`
- **Access**: Private
- **Query Params**: `role`, `skills[]`, `page`, `limit`
- **Response**: 
  ```json
  {
    "success": true,
    "data": {
      "data": [/* users */],
      "count": number,
      "total": number,
      "pagination": { "page", "limit", "pages" }
    }
  }
  ```

#### 2.2 Get Single User
- **Route**: `GET /api/users/:id`
- **Access**: Private
- **Response**: 
  ```json
  {
    "success": true,
    "data": {
      "data": { /* user object */ }
    }
  }
  ```

#### 2.3 Update User
- **Route**: `PUT /api/users/:id`
- **Access**: Private (own profile only)
- **Intended Behavior**: Updates user profile fields (name, bio, location, social links, skills, etc.)

#### 2.4 Delete User
- **Route**: `DELETE /api/users/:id`
- **Access**: Private (own account only)
- **Intended Behavior**: Deletes user account

---

### 3. Mentors

#### 3.1 Get All Mentors
- **Route**: `GET /api/mentors`
- **Access**: Public
- **Query Params**: `skills[]`, `location`, `page`, `limit`
- **Response**: 
  ```json
  {
    "success": true,
    "data": {
      "data": [/* mentors (engineers) */],
      "count": number,
      "total": number,
      "pagination": { "page", "limit", "pages" }
    }
  }
  ```
- **Intended Behavior**: Returns available engineers (mentors) with filtering options

#### 3.2 Get Single Mentor
- **Route**: `GET /api/mentors/:id`
- **Access**: Public
- **Response**: 
  ```json
  {
    "success": true,
    "data": { /* mentor object */ }
  }
  ```
- **BUG IDENTIFIED**: Response structure inconsistent - should be `{ data: { data: mentor } }` to match other endpoints

#### 3.3 Get Top Rated Mentors
- **Route**: `GET /api/mentors/top/rated`
- **Access**: Public
- **Query Params**: `limit` (default: 5)
- **Response**: 
  ```json
  {
    "success": true,
    "data": {
      "data": [/* top mentors */],
      "count": number
    }
  }
  ```

#### 3.4 Search Mentors by Skills
- **Route**: `GET /api/mentors/search/skills`
- **Access**: Public
- **Query Params**: `skills[]` (required), `page`, `limit`
- **Intended Behavior**: Returns mentors matching specific skills

#### 3.5 Update Mentor Availability
- **Route**: `PUT /api/mentors/:id/availability`
- **Access**: Private (own profile only, engineers only)
- **Request Body**: `{ "isAvailable": boolean }`
- **Intended Behavior**: Toggles mentor availability status

---

### 4. Projects

#### 4.1 Get All Projects
- **Route**: `GET /api/projects`
- **Access**: Public
- **Query Params**: `status`, `difficulty`, `skills[]`, `page`, `limit`
- **Response**: 
  ```json
  {
    "success": true,
    "data": {
      "data": [/* projects */],
      "count": number,
      "total": number,
      "pagination": { "page", "limit", "pages" }
    }
  }
  ```
- **Intended Behavior**: Returns projects with owner and mentor populated

#### 4.2 Get Single Project
- **Route**: `GET /api/projects/:id`
- **Access**: Public
- **Response**: 
  ```json
  {
    "success": true,
    "data": {
      "data": { /* project object */ }
    }
  }
  ```

#### 4.3 Create Project
- **Route**: `POST /api/projects`
- **Access**: Private
- **Request Body**:
  ```json
  {
    "title": "string (5-100 chars)",
    "description": "string (20-2000 chars)",
    "skills": ["string[]"],
    "difficulty": "beginner" | "intermediate" | "advanced",
    "duration": "string",
    "budget": number (optional),
    "githubUrl": "url" (optional),
    "liveUrl": "url" (optional)
  }
  ```
- **Intended Behavior**: Creates project, sets owner to authenticated user, status defaults to "open"

#### 4.4 Update Project
- **Route**: `PUT /api/projects/:id`
- **Access**: Private (project owner only)
- **Intended Behavior**: Updates project fields

#### 4.5 Assign Mentor to Project
- **Route**: `PUT /api/projects/:id/assign-mentor`
- **Access**: Private (project owner only)
- **Request Body**: `{ "mentorId": "string" }`
- **Intended Behavior**: Assigns mentor, sets project status to "in-progress"

#### 4.6 Delete Project
- **Route**: `DELETE /api/projects/:id`
- **Access**: Private (project owner only)
- **Intended Behavior**: Deletes project

---

### 5. Profiles

#### 5.1 Get User Profile
- **Route**: `GET /api/profiles/:id`
- **Access**: Public
- **Response**: 
  ```json
  {
    "success": true,
    "data": {
      "data": {
        "user": { /* user object */ },
        "projects": [/* user's projects */],
        "statistics": {
          "ownedProjects": number,
          "mentoredProjects": number,
          "completedProjects": number,
          "inProgressProjects": number
        },
        "recentActivity": [/* activity items */]
      }
    }
  }
  ```
- **BUG IDENTIFIED**: Response has double nesting - `data.data.data` instead of `data.data`

#### 5.2 Update Profile
- **Route**: `PUT /api/profiles/:id`
- **Access**: Private (own profile only)
- **Intended Behavior**: Updates profile information

#### 5.3 Get User's Projects
- **Route**: `GET /api/profiles/:id/projects`
- **Access**: Public
- **Query Params**: `type` (all|owned|mentored), `page`, `limit`
- **Intended Behavior**: Returns user's projects filtered by type

#### 5.4 Get User Statistics
- **Route**: `GET /api/profiles/:id/stats`
- **Access**: Public
- **Response**: Project counts, rating, total reviews

#### 5.5 Update Avatar
- **Route**: `PUT /api/profiles/:id/avatar`
- **Access**: Private (own profile only)
- **Request Body**: `{ "avatar": "url" }`
- **Intended Behavior**: Updates user avatar URL

---

### 6. Dashboard

#### 6.1 Get Home Content
- **Route**: `GET /api/dashboard/home`
- **Access**: Public
- **Response**: 
  ```json
  {
    "success": true,
    "data": {
      "stats": [/* home statistics */],
      "features": [/* feature items */],
      "testimonials": [/* testimonial items */],
      "highlights": {
        "topMentors": [/* top mentors */],
        "recentProjects": [/* recent projects */]
      }
    }
  }
  ```
- **Intended Behavior**: Returns homepage content including stats, features, testimonials, and highlights
- **Auto-seeding**: Creates default features and testimonials if database is empty

---

## Frontend Pages

### 1. Home Page (`/`)
- **Component**: `src/pages/Home.tsx`
- **Data Source**: `/api/dashboard/home`
- **Features**: 
  - Hero section
  - Dynamic statistics
  - Features grid
  - Testimonials carousel
  - Top mentors preview
  - Recent projects preview

### 2. Projects Page (`/projects`)
- **Component**: `src/pages/Projects.tsx`
- **Data Source**: `/api/projects`
- **Features**: 
  - Project listing with filters
  - Search by title/description/skills
  - Filter by difficulty and status
  - Project cards with details

### 3. Mentors Page (`/mentors`)
- **Component**: `src/pages/Mentors.tsx`
- **Data Source**: `/api/mentors`
- **Features**: 
  - Mentor listing
  - Search by name/skills
  - Filter by skills
  - Mentor cards with ratings

### 4. Profile Page (`/profile`)
- **Component**: `src/pages/Profile.tsx`
- **Data Source**: `/api/profiles/:id`
- **Features**: 
  - Profile information display/edit
  - Statistics dashboard
  - Recent activity
  - Projects overview
  - Quick actions (role-based)

### 5. Create Project Page (`/create-project`)
- **Component**: `src/pages/CreateProject.tsx`
- **Data Source**: `POST /api/projects`
- **Features**: 
  - Project creation form
  - Role-based access (engineers only)
  - Validation
  - Skill tagging

### 6. Login Page (`/login`)
- **Component**: `src/pages/Login.tsx`
- **Data Source**: `POST /api/auth/login`

### 7. Register Page (`/register`)
- **Component**: `src/pages/Register.tsx`
- **Data Source**: `POST /api/auth/register`

---

## Identified Bugs & Issues

### Critical Bugs

1. **Response Structure Inconsistencies**
   - **Issue**: Backend responses have inconsistent nesting
   - **Examples**:
     - `/api/mentors/:id` returns `{ success: true, data: mentor }` but should be `{ success: true, data: { data: mentor } }`
     - `/api/profiles/:id` returns `{ success: true, data: { data: { user, projects, ... } } }` (triple nesting)
   - **Impact**: Frontend can't parse responses correctly
   - **Fix**: Standardize all responses to `{ success: true, data: { ... } }` format

2. **ID Field Mismatch**
   - **Issue**: Backend uses MongoDB `_id` but frontend expects `id`
   - **Impact**: Frontend can't access object IDs
   - **Fix**: Transform `_id` to `id` in all responses

3. **Profile Response Structure**
   - **Issue**: `/api/profiles/:id` has incorrect nesting
   - **Current**: `{ success: true, data: { data: { user, projects, ... } } }`
   - **Expected**: `{ success: true, data: { user, projects, ... } }`
   - **Fix**: Remove extra nesting layer

4. **Mentor Single Endpoint**
   - **Issue**: `/api/mentors/:id` response structure doesn't match frontend expectations
   - **Fix**: Wrap response in `{ data: mentor }` structure

### Medium Priority Issues

5. **Error Handling**
   - **Issue**: HTML error pages returned instead of JSON
   - **Status**: Partially fixed in API service
   - **Remaining**: Need to ensure all backend routes return JSON errors

6. **Empty State Handling**
   - **Issue**: No graceful handling when database is empty
   - **Fix**: Add default data seeding and empty state messages

7. **Type Safety**
   - **Issue**: Some API responses don't match TypeScript interfaces
   - **Fix**: Align backend responses with frontend interfaces

### Low Priority Issues

8. **Pagination Defaults**
   - **Issue**: Inconsistent default page/limit values
   - **Fix**: Standardize to page=1, limit=10

9. **Validation Messages**
   - **Issue**: Some validation errors not user-friendly
   - **Fix**: Improve error messages

---

## Data Models

### User Model
```typescript
{
  _id: ObjectId,
  name: string,
  email: string (unique),
  password: string (hashed),
  role: "engineer" | "student",
  skills: string[],
  experience: string,
  avatar?: string,
  bio?: string,
  location?: string,
  github?: string,
  linkedin?: string,
  website?: string,
  isAvailable: boolean,
  rating: number,
  totalReviews: number,
  createdAt: Date,
  updatedAt: Date
}
```

### Project Model
```typescript
{
  _id: ObjectId,
  title: string,
  description: string,
  owner: ObjectId (ref: User),
  mentor?: ObjectId (ref: User),
  skills: string[],
  difficulty: "beginner" | "intermediate" | "advanced",
  status: "open" | "in-progress" | "completed" | "cancelled",
  duration: string,
  budget?: number,
  githubUrl?: string,
  liveUrl?: string,
  images: string[],
  createdAt: Date,
  updatedAt: Date
}
```

---

## Next Steps for Bug Fixes

1. **Standardize Response Structures** - Fix all endpoint responses to match frontend expectations
2. **ID Field Transformation** - Add middleware or utility to convert `_id` to `id`
3. **Fix Profile Endpoint** - Remove extra nesting in profile response
4. **Fix Mentor Endpoint** - Standardize single mentor response
5. **Test All Endpoints** - Verify each endpoint returns correct structure
6. **Update Frontend Types** - Ensure TypeScript interfaces match actual responses
7. **Add Error Boundaries** - Improve error handling in React components
8. **Add Loading States** - Ensure all async operations show loading indicators


 # API Features & Routes

This document lists the backend API endpoints, their HTTP methods, request shapes, authentication requirements, and the expected response shape. All endpoints return the unified response format:

```json
{ "success": boolean, "data"?: any, "message"?: string, "error"?: string, "errors"?: any[] }
```

Base API path: `/api`

---

## Authentication

- POST `/api/auth/register` — Public
  - Body: { name, email, password, role: 'engineer'|'student', skills: string[], experience }
  - Response: `201` { success: true, data: { token, user } }

- POST `/api/auth/login` — Public
  - Body: { email, password }
  - Response: { success: true, data: { token, user } }

- GET `/api/auth/me` — Protected
  - Headers: Authorization: Bearer <token>
  - Response: { success: true, data: { user } }

---

## Users

- GET `/api/users` — Protected
  - Query: `role`, `skills` (repeatable), `page`, `limit`
  - Response: { success: true, data: { data: User[], count, total, pagination } }

- GET `/api/users/:id` — Protected
  - Response: { success: true, data: { data: User } }

- PUT `/api/users/:id` — Protected
  - Body: partial user fields (name, bio, location, github, linkedin, website, skills[], isAvailable)
  - Response: { success: true, data: { data: User } }

- DELETE `/api/users/:id` — Protected
  - Response: { success: true, data: { message } }

---

## Mentors

- GET `/api/mentors` — Public
  - Query: `skills` (repeatable), `location`, `page`, `limit`
  - Response: { success: true, data: { data: User[], count, total, pagination } }

- GET `/api/mentors/:id` — Public
  - Response: { success: true, data: { data: User } }

- GET `/api/mentors/top/rated` — Public
  - Query: `limit` (default 5)
  - Response: { success: true, data: { data: User[], count } }

- GET `/api/mentors/search/skills` — Public
  - Query: `skills` (repeatable), `page`, `limit`
  - Response: { success: true, data: { data: User[], count, total, pagination } }

- PUT `/api/mentors/:id/availability` — Protected (engineer only)
  - Body: { isAvailable: boolean }
  - Response: { success: true, data: { data: User } }

---

## Students

- GET `/api/students` — Public
  - Query: `skills` (repeatable), `location`, `page`, `limit`
  - Response: { success: true, data: { data: User[], count, total, pagination } }

- GET `/api/students/:id` — Public
  - Response: { success: true, data: { data: User } }

- GET `/api/students/search/skills` — Public
  - Query: `skills` (repeatable), `page`, `limit`
  - Response: { success: true, data: { data: User[], count, total, pagination } }

---

## Projects

- GET `/api/projects` — Public
  - Query: `status`, `difficulty`, `skills` (repeatable), `page`, `limit`
  - Response: { success: true, data: { data: Project[], count, total, pagination } }

- GET `/api/projects/:id` — Public
  - Response: { success: true, data: { data: Project } }

- POST `/api/projects` — Protected
  - Body: { title, description, skills[], difficulty, duration, budget?, githubUrl?, liveUrl? }
  - Response: `201` { success: true, data: { data: Project } }

- PUT `/api/projects/:id` — Protected (owner only)
  - Body: partial project fields
  - Response: { success: true, data: { data: Project } }

- PUT `/api/projects/:id/assign-mentor` — Protected (owner only)
  - Body: { mentorId }
  - Response: { success: true, data: { data: Project } }

- DELETE `/api/projects/:id` — Protected (owner only)
  - Response: { success: true, data: { message } }

---

## Profiles

- GET `/api/profiles/:id` — Public
  - Response: { success: true, data: { user, projects, statistics, recentActivity } }

- PUT `/api/profiles/:id` — Protected (owner only)
  - Body: profile fields (name, bio, location, github, linkedin, website, skills[], experience, isAvailable)
  - Response: { success: true, data: { data: User } }

- GET `/api/profiles/:id/projects` — Public
  - Query: `type` = all|owned|mentored, `page`, `limit`
  - Response: { success: true, data: { data: Project[], count, total, pagination } }

- GET `/api/profiles/:id/stats` — Public
  - Response: { success: true, data: { projects: { owned, mentored, completed, inProgress }, rating, totalReviews, role } }

- PUT `/api/profiles/:id/avatar` — Protected (owner only)
  - Body: { avatar: string (URL) }
  - Response: { success: true, data: { data: User } }

---

## Dashboard

- GET `/api/dashboard/home` — Public
  - Response: { success: true, data: { stats, features, testimonials, highlights: { topMentors, recentProjects } } }

---

Notes
- All protected endpoints require `Authorization: Bearer <token>` header.
- Pagination query params: `page` and `limit` default to `1` and `10` respectively when not provided.
- For list endpoints, the frontend expects the payload under `data.data` (i.e., response.data.data is the array) — this matches the `ApiResponse` generic shape used by the frontend client.

If you want, I can also generate an OpenAPI (Swagger) spec from these routes — tell me and I will scaffold a minimal `openapi.yaml` describing these endpoints.

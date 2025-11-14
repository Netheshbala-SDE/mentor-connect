# MentorConnect — Project Story

This file explains MentorConnect as a story — the characters, their goals, and the main flows they follow while using the platform.

## Characters

- Alex (Engineer): An experienced software engineer who needs help building a side-project UI. Alex wants fast, reliable help and enjoys mentoring students.
- Priya (Student): A motivated engineering student who wants practical experience and mentorship to grow her portfolio and learn best practices.
- The Platform: MentorConnect — where Alex and Priya meet, collaborate, and learn from each other.

## Story: How a collaboration happens

1. Priya discovers MentorConnect and registers (name, email, password, role=student, skills, experience). The frontend sends `POST /api/auth/register` and receives a JSON response containing a JWT token and the user object.

2. Alex also registers as an engineer and completes his profile listing skills such as "React", "Node.js", and "TypeScript".

3. Alex creates a new project: "E-commerce UI" with description, required skills, difficulty, duration, and optional budget. The frontend calls `POST /api/projects` with Alex's JWT in Authorization header. The backend stores the project and returns the created project under `data`.

4. Priya browses the Projects page. The frontend calls `GET /api/projects` (supports filtering by skills, difficulty, paging). The backend returns `{ success: true, data: { data: Project[], count, total, pagination } }`.

5. Priya applies or contacts Alex off-platform. They agree to collaborate. Alex assigns Priya by calling `PUT /api/projects/:id/assign-mentor` with `mentorId` set to the chosen user.

6. The project's status moves from `open` to `in-progress`. Both participants can view updates on the Project page. Mentor availability and profile stats are available via the Mentors API.

7. During collaboration, Alex provides mentorship (code reviews, architectural guidance). Priya completes tasks and updates project progress. When complete, Alex or Priya marks the project `completed`.

8. Both participants' profiles reflect their collaboration history. Mentors accumulate `rating` and `totalReviews` while students build portfolio pieces in their profiles.

## Other flows

- Search Mentors: Users can filter mentors by skills and location (`GET /api/mentors` and `GET /api/mentors/search/skills`).
- Profile Management: Users can update profile info (`PUT /api/profiles/:id`) and avatar images (`PUT /api/profiles/:id/avatar`).
- Authentication: All protected endpoints require a Bearer JWT in the `Authorization` header.

## Developer notes

- API responses follow the shape `{ success, data?, message?, error?, errors? }` to make client-side handling consistent.
- For local development use a local MongoDB instance (`mongodb://localhost:27017/mentor-connect`) or Atlas with a valid IP whitelist and credentials.
- See `backend/src/routes` for route implementations and `src/services/api.ts` for the frontend client expectations.

## Example quick scenario

- Alex creates a project → `POST /api/projects` → response contains created project under `data.data`.
- Priya loads projects → `GET /api/projects?page=1&limit=10` → response `data.data` is the array of projects.
- Alex assigns mentor → `PUT /api/projects/:id/assign-mentor` with `{ mentorId }` → response returns updated project under `data.data`.

---

This story provides a quick mental model for how the application behaves from a user's perspective. Use it while testing and exploring features to validate UX and API shape expectations.

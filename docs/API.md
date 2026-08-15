# EduCore — API Documentation

**Project:** EduCore — Enterprise Learning Management System
**Track:** Fullstack Development
**Backend:** Node.js + Express.js
**Database:** MongoDB + Mongoose
**Authentication:** JWT
**API Style:** RESTful API
**Current Sprint:** Sprint 13 — Product Planning & System Architecture
**Status:** API Planning

## 1. API Overview

EduCore uses a RESTful API architecture to allow the frontend application to communicate with the backend server.

The API will handle:

* User authentication
* Role-based authorization
* Course management
* Lesson management
* Course enrollment
* Learning progress tracking
* Instructor management
* Administrative operations
* Platform statistics

### Base URL
/api

The production API URL will be added after backend deployment.

# 2. Authentication

EduCore will use **JSON Web Tokens (JWT)** for authentication.

Protected API requests will require the following authorization header:

Authorization: Bearer <JWT_TOKEN>

## User Roles

| Role         | Description                             |
| ------------ | --------------------------------------- |
| `student`    | Browse, enroll in and consume courses   |
| `instructor` | Create and manage courses and lessons   |
| `admin`      | Manage users and approve/reject courses |


# 3. Standard API Response

### Success Response

```json
{
  "success": true,
  "message": "Operation successful",
  "data": {}
}
```

### Error Response

```json
{
  "success": false,
  "message": "Error message"
}
```

### Validation Error

```json
{
  "success": false,
  "message": "Validation failed",
  "errors": []
}

# 4. Authentication APIs

## 4.1 Register User

### Endpoint

```http
POST /api/auth/register
```

**Access:** Public

**Description:** Creates a new student or instructor account.

### Request Body

```json
{
  "name": "Anushka Singh",
  "email": "anushka@example.com",
  "password": "Password@123",
  "role": "student"
}
```

### Response

```json
{
  "success": true,
  "message": "User registered successfully",
  "data": {
    "user": {
      "id": "USER_ID",
      "name": "Anushka Singh",
      "email": "anushka@example.com",
      "role": "student"
    }
  }
}

## 4.2 Login User

### Endpoint

```http
POST /api/auth/login
```

**Access:** Public

**Description:** Authenticates a user and returns a JWT token.

### Request Body

```json
{
  "email": "anushka@example.com",
  "password": "Password@123"
}
```

### Response

```json
{
  "success": true,
  "message": "Login successful",
  "data": {
    "token": "JWT_TOKEN",
    "user": {
      "id": "USER_ID",
      "name": "Anushka Singh",
      "email": "anushka@example.com",
      "role": "student"
    }
  }
}
```

---

## 4.3 Logout User

### Endpoint

```http
POST /api/auth/logout
```

**Access:** Authenticated

**Description:** Logs the authenticated user out of the application.

### Response

```json
{
  "success": true,
  "message": "Logout successful"
}
```

---

## 4.4 Get Current User

### Endpoint

```http
GET /api/auth/me
```

**Access:** Authenticated

**Description:** Returns information about the currently authenticated user.

### Response

```json
{
  "success": true,
  "data": {
    "id": "USER_ID",
    "name": "Anushka Singh",
    "email": "anushka@example.com",
    "role": "student"
  }
}
```

---

# 5. Course APIs

## 5.1 Get All Courses

### Endpoint

```http
GET /api/courses
```

**Access:** Public

**Description:** Returns published courses available in the course catalog.

### Query Parameters

```text
?search=javascript
&category=web-development
&level=beginner
&page=1
&limit=10
```

### Response

```json
{
  "success": true,
  "data": {
    "courses": [],
    "page": 1,
    "limit": 10,
    "total": 0
  }
}

## 5.2 Get Course by ID

### Endpoint

```http
GET /api/courses/:id
```

**Access:** Public

**Description:** Returns detailed information about a specific course.

### Response

```json
{
  "success": true,
  "data": {
    "id": "COURSE_ID",
    "title": "Full Stack Web Development",
    "description": "Learn modern full-stack development.",
    "thumbnail": "CLOUDINARY_URL",
    "category": "Web Development",
    "level": "Beginner",
    "status": "published",
    "instructor": {
      "id": "INSTRUCTOR_ID",
      "name": "Instructor Name"
    }
  }
}

## 5.3 Create Course

### Endpoint

```http
POST /api/courses
```

**Access:** Instructor

**Description:** Creates a new course.

### Request Body

```json
{
  "title": "Full Stack Web Development",
  "description": "Learn modern full-stack development.",
  "category": "Web Development",
  "level": "Beginner"
}
```

### Initial Status

```text
draft
```

### Response

```json
{
  "success": true,
  "message": "Course created successfully",
  "data": {
    "course": {}
  }
}


## 5.4 Update Course

### Endpoint

```http
PUT /api/courses/:id
```

**Access:** Instructor

**Description:** Updates a course owned by the authenticated instructor.

### Request Body

```json
{
  "title": "Advanced Full Stack Web Development",
  "description": "Updated course description",
  "category": "Web Development",
  "level": "Advanced"
}

## 5.5 Delete Course

### Endpoint

```http
DELETE /api/courses/:id
```

**Access:** Instructor / Admin

**Description:** Deletes a course.

### Response

```json
{
  "success": true,
  "message": "Course deleted successfully"
}
## 5.6 Submit Course for Approval

### Endpoint

```http
PATCH /api/courses/:id/submit
```

**Access:** Instructor

**Description:** Submits a draft course for administrator approval.

### Course Workflow

```text
Draft
  ↓
Pending
  ↓
Approved / Rejected
  ↓
Published
```

### Response

```json
{
  "success": true,
  "message": "Course submitted for approval"
}
# 6. Lesson APIs

## 6.1 Get Course Lessons

### Endpoint

```http
GET /api/courses/:courseId/lessons
```

**Access:** Authenticated

**Description:** Returns lessons belonging to a course.

## 6.2 Create Lesson

### Endpoint

```http
POST /api/courses/:courseId/lessons
```

**Access:** Instructor

**Description:** Creates a new lesson inside a course.

### Request Body

```json
{
  "title": "Introduction to React",
  "description": "Learn the basics of React.",
  "videoUrl": "CLOUDINARY_VIDEO_URL",
  "duration": 600,
  "order": 1
}
```

### Response

```json
{
  "success": true,
  "message": "Lesson created successfully",
  "data": {
    "lesson": {}
  }
}

## 6.3 Update Lesson

### Endpoint

```http
PUT /api/lessons/:id
```

**Access:** Instructor

**Description:** Updates an existing lesson.

## 6.4 Delete Lesson

### Endpoint

```http
DELETE /api/lessons/:id
```

**Access:** Instructor

**Description:** Deletes an existing lesson.

# 7. Enrollment APIs

## 7.1 Enroll in Course

### Endpoint

```http
POST /api/courses/:courseId/enroll
```

**Access:** Student

**Description:** Enrolls the authenticated student in a published course.

### Response

```json
{
  "success": true,
  "message": "Successfully enrolled in course",
  "data": {
    "enrollment": {}
  }
}
```

### Business Rule

A student cannot enroll in the same course more than once.

## 7.2 Get My Courses

### Endpoint

```http
GET /api/enrollments/my-courses
```

**Access:** Student

**Description:** Returns all courses in which the authenticated student is enrolled.

### Response

```json
{
  "success": true,
  "data": {
    "courses": []
  }
}

## 7.3 Check Enrollment Status

### Endpoint

```http
GET /api/courses/:courseId/enrollment
```

**Access:** Student

**Description:** Checks whether the current student is enrolled in a course.

### Response

```json
{
  "success": true,
  "data": {
    "enrolled": true,
    "completionPercentage": 65
  }
}

# 8. Progress APIs

## 8.1 Get Course Progress

### Endpoint

```http
GET /api/progress/:courseId
```

**Access:** Student

**Description:** Returns the student's progress for a specific course.

### Response

```json
{
  "success": true,
  "data": {
    "courseId": "COURSE_ID",
    "completionPercentage": 65,
    "completedLessons": 6,
    "totalLessons": 10
  }
}

## 8.2 Update Lesson Progress

### Endpoint

```http
PUT /api/progress/:lessonId
```

**Access:** Student

**Description:** Updates the student's progress for a lesson.

### Request Body

```json
{
  "completed": true,
  "watchTime": 540
}
```

### Response

```json
{
  "success": true,
  "message": "Progress updated successfully",
  "data": {
    "completed": true,
    "watchTime": 540,
    "courseProgress": 70
  }
}
```

---

## 8.3 Mark Lesson Complete

### Endpoint

```http
POST /api/progress/:lessonId/complete
```

**Access:** Student

**Description:** Marks a lesson as completed.

### Response

```json
{
  "success": true,
  "message": "Lesson completed successfully"
}
```

---

# 9. Instructor APIs

## 9.1 Get Instructor Courses

### Endpoint

```http
GET /api/instructor/courses
```

**Access:** Instructor

**Description:** Returns courses created by the authenticated instructor.

---

## 9.2 Get Instructor Statistics

### Endpoint

```http
GET /api/instructor/stats
```

**Access:** Instructor

**Description:** Returns course and enrollment statistics for the instructor.

### Response

```json
{
  "success": true,
  "data": {
    "totalCourses": 8,
    "publishedCourses": 5,
    "draftCourses": 2,
    "pendingCourses": 1,
    "totalStudents": 245
  }
}

## 9.3 Get Course Students

### Endpoint

```http
GET /api/instructor/courses/:courseId/students
```

**Access:** Instructor

**Description:** Returns students enrolled in an instructor's course.

# 10. Administration APIs

## 10.1 Get All Users

### Endpoint

```http
GET /api/admin/users
```

**Access:** Admin

**Description:** Returns users registered on the platform.

### Query Parameters

```text
?role=student
&role=instructor
&page=1
&limit=20

## 10.2 Get All Courses

### Endpoint

```http
GET /api/admin/courses
```

**Access:** Admin

**Description:** Returns courses including draft, pending, published and rejected courses.

## 10.3 Approve Course

### Endpoint

```http
PATCH /api/admin/courses/:id/approve
```

**Access:** Admin

**Description:** Approves a pending course.

### Response

```json
{
  "success": true,
  "message": "Course approved successfully"
}

## 10.4 Reject Course

### Endpoint

```http
PATCH /api/admin/courses/:id/reject
```

**Access:** Admin

**Description:** Rejects a pending course.

### Request Body

```json
{
  "reason": "Course content requires additional review."
}
```

### Response

```json
{
  "success": true,
  "message": "Course rejected successfully"
}

## 10.5 Admin Statistics

### Endpoint

```http
GET /api/admin/stats
```

**Access:** Admin

**Description:** Returns platform-level statistics.

### Response

```json
{
  "success": true,
  "data": {
    "totalUsers": 1250,
    "totalStudents": 1100,
    "totalInstructors": 140,
    "totalCourses": 85,
    "pendingCourses": 7
  }
}

# 11. Course Status Workflow

Courses will follow the following lifecycle:

```text
        ┌─────────┐
        │  Draft  │
        └────┬────┘
             │
             ▼
       ┌───────────┐
       │  Pending  │
       └─────┬─────┘
             │
       ┌─────┴─────┐
       ▼           ▼
┌───────────┐ ┌──────────┐
│ Published │ │ Rejected │
└───────────┘ └────┬─────┘
                    │
                    ▼
                  Draft


# 12. HTTP Status Codes

| Status Code | Meaning                  |
| ----------- | ------------------------ |
| `200`       | Successful request       |
| `201`       | Resource created         |
| `400`       | Bad request              |
| `401`       | Authentication required  |
| `403`       | Insufficient permissions |
| `404`       | Resource not found       |
| `409`       | Resource conflict        |
| `422`       | Validation error         |
| `500`       | Internal server error    |


# 13. Security

EduCore API security will include:

* JWT-based authentication
* Password hashing
* Role-Based Access Control
* Protected API routes
* Request validation
* CORS configuration
* Environment variables for secrets
* Instructor ownership verification
* Secure Cloudinary media handling

Sensitive credentials will not be committed to GitHub.

Example environment variables:

```text
MONGO_URI
JWT_SECRET
CLOUDINARY_CLOUD_NAME
CLOUDINARY_API_KEY
CLOUDINARY_API_SECRET

# 14. Middleware Architecture

The planned request flow is:

```text
Client Request
      ↓
CORS Middleware
      ↓
Authentication Middleware
      ↓
Role Authorization Middleware
      ↓
Request Validation
      ↓
Controller
      ↓
Business Logic / Service
      ↓
MongoDB / Cloudinary
      ↓
API Response

# 15. Planned Backend Structure

```text
backend/
│
├── src/
│   ├── config/
│   ├── controllers/
│   ├── middleware/
│   ├── models/
│   ├── routes/
│   ├── services/
│   ├── validators/
│   ├── utils/
│   └── server.js
│
├── .env
├── .gitignore
├── package.json
└── README.md

# 16. API Testing

The EduCore APIs will be tested using **Postman** during the development and testing sprints.

Testing will cover:

* User registration
* User login
* JWT authentication
* Role-based authorization
* Course CRUD
* Lesson CRUD
* Course enrollment
* Progress tracking
* Course approval workflow
* Validation errors
* Unauthorized requests
* Resource ownership

A Postman collection will be added after API implementation.

# 17. Future API Extensions

The following APIs may be added after the MVP:

```text
/api/reviews
/api/ratings
/api/notifications
/api/certificates
/api/bookmarks
/api/recommendations
/api/analytics
```

These features are outside the mandatory Sprint 14 MVP scope.


# 18. API Development Status

| Module               | Status       |
| -------------------- | ------------ |
| Authentication       | 🟡 Planned   |
| Authorization / RBAC | 🟡 Planned   |
| Course APIs          | 🟡 Planned   |
| Lesson APIs          | 🟡 Planned   |
| Enrollment APIs      | 🟡 Planned   |
| Progress APIs        | 🟡 Planned   |
| Instructor APIs      | 🟡 Planned   |
| Admin APIs           | 🟡 Planned   |
| Postman Testing      | 🔵 Planned   |
| Production API       | 🔵 Sprint 17 |

## Sprint 13 Deliverable

**Current Phase:** Sprint 13 — Product Planning & System Architecture

**Deliverable:** API architecture and endpoint planning completed.

**Implementation:** API development will begin during Sprint 14.

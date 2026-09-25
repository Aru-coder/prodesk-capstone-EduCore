# EduCore — AI Architecture & Development Prompts

**Project:** EduCore — Enterprise Learning Management System  
**Track:** Fullstack Development  
**Developer:** Anushka Singh  
**Sprint:** Sprint 15 — Feature Complete  
**Status:** Feature Complete — CRUD + Stripe Monetization

---

# 1. Purpose of This Document

This document records the AI-assisted prompts used during the planning, architecture, design, development, debugging, testing, and documentation of the EduCore project.

AI tools are used as development assistants for:

- Requirement analysis
- Feature planning
- Database architecture
- API design
- System architecture
- UI/UX planning
- Code generation assistance
- Debugging
- Security review
- Testing
- Documentation
- Deployment planning


---

# 2. Product Planning Prompt (Sprint 13)

### Prompt

I am building an enterprise-oriented Learning Management System called EduCore.

The platform will support three roles:
1. Student
2. Instructor
3. Administrator

Students should be able to register, browse courses, search and filter courses, enroll in courses, watch lessons, track progress, and continue learning.

Instructors should be able to create and manage courses, create lessons, upload course media, save courses as drafts, submit courses for approval, and view enrolled students.

Administrators should be able to manage users, review courses, approve or reject courses, and view platform statistics.

Create a realistic MVP feature list for a 5-week full-stack capstone project. Prioritize features using P0, P1, and P2 categories and prevent unnecessary scope creep.

---

# 3. Database Schema Architecture Prompt (Sprint 14)

### Prompt

I am building EduCore, a fullstack LMS using Node.js, Express, and MongoDB with Mongoose.

Design the Mongoose schema for:

1. **User** — name, email, hashed password, role (student/instructor/admin), timestamps
2. **Course** — title, description, category, level (Beginner/Intermediate/Advanced), price, instructorId (ref User), instructorName, status (draft/submitted/approved/published), thumbnail URL, lessons (embedded array), timestamps
3. **Lesson** (embedded in Course) — title, content, videoUrl, duration, order
4. **Enrollment** — studentId (ref User), courseId (ref Course), paymentStatus (free/paid/pending), paymentId, completedLessons (array of lessonIds), progress (0-100), timestamps

Include a unique compound index on Enrollment (studentId + courseId) to prevent duplicate enrollments.

---

# 4. Secure CRUD REST API Design Prompt (Sprint 15 — P0)

### Prompt

I am building the REST API for EduCore using Node.js and Express.

Implement full CRUD for courses with JWT authentication and data ownership validation:

- **POST /api/courses** — Create a course (Instructor/Admin only)
- **GET /api/courses** — Fetch all published courses with optional filters (category, level, search)
- **GET /api/courses/instructor/my** — Fetch only the logged-in instructor's courses
- **GET /api/courses/:id** — Fetch a single course by ID
- **PUT /api/courses/:id** — Update a course — MUST validate that the instructorId on the document matches the userId from the decoded JWT token. Reject with 403 Forbidden if not owner.
- **DELETE /api/courses/:id** — Delete a course — SAME ownership validation. Also cascade-delete all related Enrollment documents.
- **POST /api/courses/:id/lessons** — Add a lesson to a course (owner/admin only)

---

# 5. Client-Side State Management & Optimistic UI Prompt (Sprint 15 — P1)

### Prompt

I am building the React frontend for EduCore. Implement optimistic UI state management so the DOM updates instantly without waiting for backend responses or causing a page reload.

**Optimistic Delete Pattern:**
When a user deletes a course after confirming the safety modal, immediately filter it from local React state using:
```js
setCourses(prev => prev.filter(c => c._id !== deletedId))
```
Then fire the async DELETE API call in the background.

**Optimistic Create Pattern:**
After POSTing a new course, immediately prepend the returned document to state:
```js
setCourses(prev => [newCourse, ...prev])
```

**Optimistic Update Pattern:**
After PUTting an updated course, replace the stale object in state:
```js
setCourses(prev => prev.map(c => c._id === updatedId ? updatedCourse : c))
```

This prevents page reloads and makes the UI feel instant and enterprise-grade.

---

# 6. Stripe Checkout Monetization Prompt (Sprint 15 — P2)

### Prompt

I am integrating Stripe Test Mode checkout into EduCore for paid course enrollment.

**Architecture:**
- Frontend uses Stripe's **Publishable Key** only
- Backend uses Stripe's **Secret Key** (NEVER exposed to frontend)
- No Webhook required for MVP — use standard Stripe Checkout redirect flow

**Flow:**
1. User clicks "Buy with Stripe" on a paid course card
2. Frontend calls POST /api/payment/create-checkout-session with courseId
3. Backend uses Stripe SDK to create a Checkout Session with line_items, success_url, and cancel_url
4. Backend returns the Stripe-hosted checkout URL
5. Frontend redirects to window.location.href = res.url
6. After payment, Stripe redirects to /payment-success?session_id=...&course_id=...
7. PaymentSuccess page calls POST /api/payment/confirm to auto-enroll the student

**Security Note:** STRIPE_SECRET_KEY must only live in backend .env and NEVER be committed to GitHub.

---

# 7. Data Analytics & Visualization Prompt (Sprint 15 — P2)

### Prompt

I need to implement a data analytics dashboard for EduCore without installing a third-party charting library.

Using native JavaScript .reduce() and .map():
1. Aggregate course count by category from the courses array
2. Reduce enrollment progress into: completed (progress === 100), in-progress (progress > 0), not-started (progress === 0)
3. Calculate total platform revenue by summing course prices using .reduce()

Render the aggregated data as:
- A horizontal CSS bar chart for course category distribution
- A segmented progress visualization for user learning status
- KPI metric cards for totalCourses, totalEnrollments, totalRevenue, completedCourses

This satisfies the Phase 3 Data Aggregation and Visualization Engine requirements from Sprint 15.

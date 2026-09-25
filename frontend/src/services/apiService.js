const BASE_URL = "http://localhost:5000/api";

const getAuthHeaders = () => {
  const token = localStorage.getItem("token");
  return {
    "Content-Type": "application/json",
    Authorization: token ? `Bearer ${token}` : "",
  };
};

// ===================================
// COURSES API
// ===================================
export const fetchCourses = async (filters = {}) => {
  const queryParams = new URLSearchParams(filters).toString();
  const res = await fetch(`${BASE_URL}/courses?${queryParams}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch courses");
  return data;
};

export const fetchInstructorCourses = async () => {
  const res = await fetch(`${BASE_URL}/courses/instructor/my`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch instructor courses");
  return data;
};

export const fetchCourseById = async (id) => {
  const res = await fetch(`${BASE_URL}/courses/${id}`);
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch course details");
  return data;
};

export const createCourse = async (courseData) => {
  const res = await fetch(`${BASE_URL}/courses`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(courseData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to create course");
  return data;
};

export const updateCourse = async (id, courseData) => {
  const res = await fetch(`${BASE_URL}/courses/${id}`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify(courseData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update course");
  return data;
};

export const deleteCourse = async (id) => {
  const res = await fetch(`${BASE_URL}/courses/${id}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to delete course");
  return data;
};

export const addLessonToCourse = async (courseId, lessonData) => {
  const res = await fetch(`${BASE_URL}/courses/${courseId}/lessons`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify(lessonData),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to add lesson");
  return data;
};

// ===================================
// ENROLLMENTS API
// ===================================
export const fetchMyEnrollments = async () => {
  const res = await fetch(`${BASE_URL}/enrollments/my`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch enrollments");
  return data;
};

export const enrollInCourse = async (courseId) => {
  const res = await fetch(`${BASE_URL}/enrollments`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ courseId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to enroll in course");
  return data;
};

export const updateLessonProgress = async (enrollmentId, lessonId, isCompleted) => {
  const res = await fetch(`${BASE_URL}/enrollments/${enrollmentId}/progress`, {
    method: "PUT",
    headers: getAuthHeaders(),
    body: JSON.stringify({ lessonId, isCompleted }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to update progress");
  return data;
};

export const deleteEnrollment = async (enrollmentId) => {
  const res = await fetch(`${BASE_URL}/enrollments/${enrollmentId}`, {
    method: "DELETE",
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to unenroll");
  return data;
};

// ===================================
// STRIPE PAYMENT API
// ===================================
export const createCheckoutSession = async (courseId) => {
  const res = await fetch(`${BASE_URL}/payment/create-checkout-session`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({
      courseId,
      originUrl: window.location.origin,
    }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to initiate payment");
  return data;
};

export const confirmPayment = async (courseId, sessionId) => {
  const res = await fetch(`${BASE_URL}/payment/confirm`, {
    method: "POST",
    headers: getAuthHeaders(),
    body: JSON.stringify({ courseId, sessionId }),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to confirm payment");
  return data;
};

// ===================================
// ANALYTICS API
// ===================================
export const fetchAnalyticsDashboard = async () => {
  const res = await fetch(`${BASE_URL}/analytics/dashboard`, {
    headers: getAuthHeaders(),
  });
  const data = await res.json();
  if (!res.ok) throw new Error(data.message || "Failed to fetch analytics");
  return data;
};

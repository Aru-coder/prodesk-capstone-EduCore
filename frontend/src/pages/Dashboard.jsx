import { useState, useEffect, useMemo } from "react";
import Navbar from "../components/Navbar";
import CourseCard from "../components/CourseCard";
import CreateCourseModal from "../components/CreateCourseModal";
import EditCourseModal from "../components/EditCourseModal";
import ConfirmModal from "../components/ConfirmModal";
import AnalyticsChart from "../components/AnalyticsChart";
import {
  fetchCourses,
  fetchInstructorCourses,
  fetchMyEnrollments,
  createCourse,
  updateCourse,
  deleteCourse,
  enrollInCourse,
  deleteEnrollment,
  createCheckoutSession,
  fetchAnalyticsDashboard,
} from "../services/apiService";

function Dashboard() {
  const [user, setUser] = useState(null);
  const [activeTab, setActiveTab] = useState("catalog"); // 'catalog', 'learning', 'instructor', 'analytics'

  // Data States
  const [courses, setCourses] = useState([]);
  const [instructorCourses, setInstructorCourses] = useState([]);
  const [enrollments, setEnrollments] = useState([]);
  const [analyticsData, setAnalyticsData] = useState(null);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("All");

  // Loading & Error States
  const [loading, setLoading] = useState(true);
  const [actionLoading, setActionLoading] = useState(false);
  const [error, setError] = useState("");

  // Modals
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [targetEditCourse, setTargetEditCourse] = useState(null);

  // Safety Confirmation Delete Modal
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState({ id: null, title: "", type: "course" });

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }
  }, []);

  // Fetch initial data
  const loadDashboardData = async () => {
    setLoading(true);
    setError("");
    try {
      // 1. Fetch public courses
      const allCoursesData = await fetchCourses();
      setCourses(allCoursesData);

      // 2. Fetch user's enrollments
      const myEnrollmentsData = await fetchMyEnrollments();
      setEnrollments(myEnrollmentsData);

      // 3. If instructor or admin, fetch instructor courses
      const storedUser = JSON.parse(localStorage.getItem("user") || "{}");
      if (storedUser.role === "instructor" || storedUser.role === "admin") {
        const myCoursesData = await fetchInstructorCourses();
        setInstructorCourses(myCoursesData);
      }

      // 4. Fetch platform analytics
      const analytics = await fetchAnalyticsDashboard();
      setAnalyticsData(analytics);
    } catch (err) {
      console.error("Dashboard hydration error:", err);
      setError("Failed to load dashboard data. Please make sure backend is running.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadDashboardData();
  }, []);

  // Map of enrolled course IDs
  const enrolledCourseMap = useMemo(() => {
    const map = {};
    enrollments.forEach((en) => {
      if (en.courseId && en.courseId._id) {
        map[en.courseId._id] = en.progress || 0;
      }
    });
    return map;
  }, [enrollments]);

  // Filtered courses for catalog
  const filteredCourses = useMemo(() => {
    return courses.filter((c) => {
      const matchesSearch = c.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        c.description.toLowerCase().includes(searchQuery.toLowerCase());
      const matchesCategory = selectedCategory === "All" || c.category === selectedCategory;
      return matchesSearch && matchesCategory;
    });
  }, [courses, searchQuery, selectedCategory]);

  // Handle CREATE Course
  const handleCreateCourse = async (coursePayload) => {
    setActionLoading(true);
    try {
      const res = await createCourse(coursePayload);
      const newCourse = res.course;

      // Optimistic UI state update
      setCourses((prev) => [newCourse, ...prev]);
      setInstructorCourses((prev) => [newCourse, ...prev]);

      setIsCreateModalOpen(false);
    } catch (err) {
      alert(`Create Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle EDIT Course Trigger
  const handleTriggerEdit = (course) => {
    setTargetEditCourse(course);
    setIsEditModalOpen(true);
  };

  // Handle UPDATE Course Save
  const handleSaveCourse = async (courseId, updatedPayload) => {
    setActionLoading(true);
    try {
      const res = await updateCourse(courseId, updatedPayload);
      const updatedCourse = res.course;

      // Optimistic state mutation
      setCourses((prev) =>
        prev.map((c) => (c._id === courseId ? updatedCourse : c))
      );
      setInstructorCourses((prev) =>
        prev.map((c) => (c._id === courseId ? updatedCourse : c))
      );

      setIsEditModalOpen(false);
      setTargetEditCourse(null);
    } catch (err) {
      alert(`Update Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle DELETE Trigger (Safety confirmation prompt)
  const handleTriggerDeleteCourse = (id, title) => {
    setDeleteTarget({ id, title, type: "course" });
    setIsConfirmModalOpen(true);
  };

  const handleTriggerUnenroll = (enrollmentId, courseTitle) => {
    setDeleteTarget({ id: enrollmentId, title: courseTitle, type: "enrollment" });
    setIsConfirmModalOpen(true);
  };

  // Execute Confirmed DESTRUCTION (Delete)
  const handleConfirmDelete = async () => {
    if (!deleteTarget.id) return;
    setActionLoading(true);

    try {
      if (deleteTarget.type === "course") {
        await deleteCourse(deleteTarget.id);

        // OPTIMISTIC UI: Instantly filter from DOM state without reloading!
        setCourses((prev) => prev.filter((c) => c._id !== deleteTarget.id));
        setInstructorCourses((prev) => prev.filter((c) => c._id !== deleteTarget.id));
        setEnrollments((prev) => prev.filter((e) => e.courseId?._id !== deleteTarget.id));
      } else if (deleteTarget.type === "enrollment") {
        await deleteEnrollment(deleteTarget.id);

        // OPTIMISTIC UI: Filter out enrollment instantly
        setEnrollments((prev) => prev.filter((e) => e._id !== deleteTarget.id));
      }

      setIsConfirmModalOpen(false);
      setDeleteTarget({ id: null, title: "", type: "course" });
    } catch (err) {
      alert(`Deletion Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle FREE ENROLLMENT
  const handleEnrollFree = async (courseId) => {
    setActionLoading(true);
    try {
      const res = await enrollInCourse(courseId);

      // Optimistically update enrollments list
      setEnrollments((prev) => [res.enrollment, ...prev]);
    } catch (err) {
      alert(`Enrollment Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  // Handle STRIPE CHECKOUT PAYOUT
  const handleStripePay = async (courseId) => {
    setActionLoading(true);
    try {
      const res = await createCheckoutSession(courseId);
      if (res.url) {
        window.location.href = res.url;
      }
    } catch (err) {
      alert(`Stripe Error: ${err.message}`);
    } finally {
      setActionLoading(false);
    }
  };

  return (
    <div className="dashboard-wrapper">
      <Navbar user={user} activeTab={activeTab} setActiveTab={setActiveTab} />

      <main className="dashboard-content">
        {error && <div className="error-alert">⚠️ {error}</div>}

        {loading ? (
          <div className="center-loader">
            <div className="spinner"></div>
            <p>Hydrating state from database...</p>
          </div>
        ) : (
          <>
            {/* ==================================================== */}
            {/* TAB 1: CATALOG (BROWSE & SEARCH COURSES)             */}
            {/* ==================================================== */}
            {activeTab === "catalog" && (
              <section className="tab-section">
                <div className="catalog-header">
                  <div>
                    <h1>Explore Courses & Digital Modules</h1>
                    <p>Discover expert-led courses across multiple engineering tracks</p>
                  </div>
                  {(user?.role === "instructor" || user?.role === "admin") && (
                    <button
                      className="btn btn-success"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      ➕ Create New Course
                    </button>
                  )}
                </div>

                {/* Filters & Search Toolbar */}
                <div className="toolbar">
                  <div className="search-box">
                    <span className="search-icon">🔍</span>
                    <input
                      type="text"
                      placeholder="Search courses by title or keyword..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                    />
                  </div>

                  <div className="category-pills">
                    {["All", "Development", "Computer Science", "Design", "Business", "Data Science"].map(
                      (cat) => (
                        <button
                          key={cat}
                          className={`pill ${selectedCategory === cat ? "active" : ""}`}
                          onClick={() => setSelectedCategory(cat)}
                        >
                          {cat}
                        </button>
                      )
                    )}
                  </div>
                </div>

                {/* Course Grid */}
                {filteredCourses.length > 0 ? (
                  <div className="courses-grid">
                    {filteredCourses.map((course) => (
                      <CourseCard
                        key={course._id}
                        course={course}
                        user={user}
                        isEnrolled={Boolean(enrolledCourseMap[course._id] !== undefined)}
                        enrollmentProgress={enrolledCourseMap[course._id] || 0}
                        onEdit={handleTriggerEdit}
                        onDelete={handleTriggerDeleteCourse}
                        onEnroll={handleEnrollFree}
                        onStripePay={handleStripePay}
                        loading={actionLoading}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <h3>No courses match your filter criteria</h3>
                    <p>Try resetting your search query or category filter.</p>
                  </div>
                )}
              </section>
            )}

            {/* ==================================================== */}
            {/* TAB 2: MY COURSES (LEARNING DASHBOARD)               */}
            {/* ==================================================== */}
            {activeTab === "learning" && (
              <section className="tab-section">
                <div className="catalog-header">
                  <div>
                    <h1>My Enrolled Learning Journey</h1>
                    <p>Continue from where you left off</p>
                  </div>
                </div>

                {enrollments.length > 0 ? (
                  <div className="courses-grid">
                    {enrollments.map((en) => {
                      if (!en.courseId) return null;
                      return (
                        <div key={en._id} className="enrolled-card-wrapper">
                          <CourseCard
                            course={en.courseId}
                            user={user}
                            isEnrolled={true}
                            enrollmentProgress={en.progress || 0}
                            onEdit={handleTriggerEdit}
                            onDelete={handleTriggerDeleteCourse}
                            onEnroll={handleEnrollFree}
                            onStripePay={handleStripePay}
                            loading={actionLoading}
                          />
                          <button
                            className="btn btn-link-danger"
                            onClick={() => handleTriggerUnenroll(en._id, en.courseId?.title)}
                          >
                            Unenroll from Course
                          </button>
                        </div>
                      );
                    })}
                  </div>
                ) : (
                  <div className="empty-state">
                    <h3>You are not enrolled in any courses yet</h3>
                    <p>Explore the catalog tab to find and enroll in your first course.</p>
                    <button className="btn btn-primary" onClick={() => setActiveTab("catalog")}>
                      Browse Course Catalog
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* ==================================================== */}
            {/* TAB 3: INSTRUCTOR PORTAL (CRUD MANAGEMENT)            */}
            {/* ==================================================== */}
            {activeTab === "instructor" && (
              <section className="tab-section">
                <div className="catalog-header">
                  <div>
                    <h1>🛠️ Instructor Course Management Portal</h1>
                    <p>Manage, edit, publish, and inspect your created course modules</p>
                  </div>
                  <button
                    className="btn btn-success"
                    onClick={() => setIsCreateModalOpen(true)}
                  >
                    ➕ Create New Course
                  </button>
                </div>

                {instructorCourses.length > 0 ? (
                  <div className="courses-grid">
                    {instructorCourses.map((course) => (
                      <CourseCard
                        key={course._id}
                        course={course}
                        user={user}
                        isEnrolled={Boolean(enrolledCourseMap[course._id] !== undefined)}
                        enrollmentProgress={enrolledCourseMap[course._id] || 0}
                        onEdit={handleTriggerEdit}
                        onDelete={handleTriggerDeleteCourse}
                        onEnroll={handleEnrollFree}
                        onStripePay={handleStripePay}
                        loading={actionLoading}
                      />
                    ))}
                  </div>
                ) : (
                  <div className="empty-state">
                    <h3>You haven't created any courses yet</h3>
                    <p>Click the button below to design and publish your first course.</p>
                    <button
                      className="btn btn-success"
                      onClick={() => setIsCreateModalOpen(true)}
                    >
                      ➕ Create First Course
                    </button>
                  </div>
                )}
              </section>
            )}

            {/* ==================================================== */}
            {/* TAB 4: ANALYTICS & VISUALIZATION                     */}
            {/* ==================================================== */}
            {activeTab === "analytics" && (
              <section className="tab-section">
                <AnalyticsChart
                  metrics={analyticsData?.metrics}
                  categoryData={analyticsData?.categoryData}
                  userEnrollments={enrollments}
                  allCourses={courses}
                />
              </section>
            )}
          </>
        )}
      </main>

      {/* Modals */}
      <CreateCourseModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onCreate={handleCreateCourse}
        loading={actionLoading}
      />

      <EditCourseModal
        isOpen={isEditModalOpen}
        course={targetEditCourse}
        onClose={() => {
          setIsEditModalOpen(false);
          setTargetEditCourse(null);
        }}
        onSave={handleSaveCourse}
        loading={actionLoading}
      />

      <ConfirmModal
        isOpen={isConfirmModalOpen}
        title={`Confirm Delete: ${deleteTarget.title}`}
        message={`Are you sure you want to permanently delete "${deleteTarget.title}"? This action will mutate your database and cannot be undone.`}
        onConfirm={handleConfirmDelete}
        onCancel={() => {
          setIsConfirmModalOpen(false);
          setDeleteTarget({ id: null, title: "", type: "course" });
        }}
        loading={actionLoading}
      />
    </div>
  );
}

export default Dashboard;
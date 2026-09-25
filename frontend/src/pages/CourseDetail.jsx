import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  fetchCourseById,
  fetchMyEnrollments,
  updateLessonProgress,
  addLessonToCourse,
} from "../services/apiService";

function CourseDetail() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [course, setCourse] = useState(null);
  const [enrollment, setEnrollment] = useState(null);
  const [activeLessonIndex, setActiveLessonIndex] = useState(0);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  // Modal for adding lesson (Instructor mode)
  const [showAddLessonModal, setShowAddLessonModal] = useState(false);
  const [newLessonData, setNewLessonData] = useState({
    title: "",
    content: "",
    duration: "15 mins",
  });
  const [lessonLoading, setLessonLoading] = useState(false);

  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) {
      setUser(JSON.parse(storedUser));
    }

    const loadCourseData = async () => {
      try {
        setLoading(true);
        const courseData = await fetchCourseById(id);
        setCourse(courseData);

        // Fetch user's enrollments to check if enrolled
        const token = localStorage.getItem("token");
        if (token) {
          const myEnrollments = await fetchMyEnrollments();
          const found = myEnrollments.find(
            (en) => en.courseId && en.courseId._id === id
          );
          if (found) {
            setEnrollment(found);
          }
        }
      } catch (err) {
        console.error("Load course error:", err);
        setError(err.message || "Failed to load course");
      } finally {
        setLoading(false);
      }
    };

    loadCourseData();
  }, [id]);

  const handleToggleLesson = async (lessonId) => {
    if (!enrollment) return;

    const isCompleted = enrollment.completedLessons?.includes(lessonId);
    try {
      const updated = await updateLessonProgress(
        enrollment._id,
        lessonId,
        !isCompleted
      );
      setEnrollment(updated.enrollment);
    } catch (err) {
      console.error("Failed to toggle lesson progress:", err);
    }
  };

  const handleAddLessonSubmit = async (e) => {
    e.preventDefault();
    setLessonLoading(true);
    try {
      const result = await addLessonToCourse(id, newLessonData);
      setCourse(result.course);
      setShowAddLessonModal(false);
      setNewLessonData({ title: "", content: "", duration: "15 mins" });
    } catch (err) {
      alert(err.message || "Failed to add lesson");
    } finally {
      setLessonLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="center-loader">
        <div className="spinner"></div>
        <p>Loading course content...</p>
      </div>
    );
  }

  if (error || !course) {
    return (
      <div className="center-loader">
        <h2>⚠️ Course Not Found</h2>
        <p>{error || "The requested course could not be loaded."}</p>
        <button className="btn btn-primary" onClick={() => navigate("/dashboard")}>
          Back to Catalog
        </button>
      </div>
    );
  }

  const currentLesson = course.lessons?.[activeLessonIndex];
  const isOwner =
    user &&
    (user.id === (typeof course.instructorId === "object" ? course.instructorId._id : course.instructorId) ||
      user.role === "admin");

  return (
    <div className="course-detail-container">
      {/* Header Banner */}
      <div className="course-header-banner">
        <div className="banner-content">
          <button className="back-btn" onClick={() => navigate("/dashboard")}>
            ← Back to Dashboard
          </button>
          <div className="course-title-section">
            <span className="badge category-badge">{course.category}</span>
            <span className={`badge level-badge level-${course.level?.toLowerCase()}`}>
              {course.level}
            </span>
            <h1>{course.title}</h1>
            <p className="course-subtitle">{course.description}</p>
          </div>

          {enrollment && (
            <div className="enrollment-status-box">
              <div className="status-label">Your Course Progress:</div>
              <div className="progress-bar-bg">
                <div
                  className="progress-bar-fill"
                  style={{ width: `${enrollment.progress || 0}%` }}
                ></div>
              </div>
              <div className="progress-percentage">{enrollment.progress || 0}% Complete</div>
            </div>
          )}

          {isOwner && (
            <div className="instructor-tool-bar">
              <button
                className="btn btn-primary"
                onClick={() => setShowAddLessonModal(true)}
              >
                ➕ Add New Lesson
              </button>
            </div>
          )}
        </div>
      </div>

      {/* Main Content & Sidebar Layout */}
      <div className="course-workspace">
        {/* Sidebar: Lesson Navigation List */}
        <div className="lessons-sidebar">
          <h3>📖 Course Syllabus ({course.lessons?.length || 0} Lessons)</h3>
          <div className="lessons-list">
            {course.lessons && course.lessons.length > 0 ? (
              course.lessons.map((lesson, idx) => {
                const isCompleted = enrollment?.completedLessons?.includes(
                  lesson._id || idx.toString()
                );
                return (
                  <div
                    key={lesson._id || idx}
                    className={`lesson-item ${activeLessonIndex === idx ? "active" : ""}`}
                    onClick={() => setActiveLessonIndex(idx)}
                  >
                    <div className="lesson-item-header">
                      {enrollment && (
                        <input
                          type="checkbox"
                          checked={!!isCompleted}
                          onChange={(e) => {
                            e.stopPropagation();
                            handleToggleLesson(lesson._id || idx.toString());
                          }}
                          className="lesson-checkbox"
                        />
                      )}
                      <span className="lesson-num">{idx + 1}.</span>
                      <span className="lesson-title-text">{lesson.title}</span>
                    </div>
                    <span className="lesson-duration">⏱️ {lesson.duration || "10 mins"}</span>
                  </div>
                );
              })
            ) : (
              <p className="empty-lessons">No lessons created for this course yet.</p>
            )}
          </div>
        </div>

        {/* Main Lesson Content Player / Viewer */}
        <div className="lesson-content-area">
          {currentLesson ? (
            <div className="lesson-viewer-card">
              <div className="lesson-card-header">
                <h2>Lesson {activeLessonIndex + 1}: {currentLesson.title}</h2>
                <span className="lesson-badge">{currentLesson.duration}</span>
              </div>

              <div className="lesson-media-preview">
                {currentLesson.videoUrl ? (
                  <iframe
                    src={currentLesson.videoUrl}
                    title={currentLesson.title}
                    allowFullScreen
                    className="video-frame"
                  ></iframe>
                ) : (
                  <div className="placeholder-video">
                    <span>📺 Interactive Interactive Lesson Player</span>
                  </div>
                )}
              </div>

              <div className="lesson-body-text">
                <h3>Lesson Overview & Study Notes</h3>
                <p>{currentLesson.content || "Content and lecture notes for this lesson module."}</p>
              </div>

              {enrollment && (
                <div className="lesson-completion-footer">
                  <button
                    className={`btn ${
                      enrollment.completedLessons?.includes(currentLesson._id || activeLessonIndex.toString())
                        ? "btn-secondary"
                        : "btn-success"
                    }`}
                    onClick={() =>
                      handleToggleLesson(currentLesson._id || activeLessonIndex.toString())
                    }
                  >
                    {enrollment.completedLessons?.includes(currentLesson._id || activeLessonIndex.toString())
                      ? "Mark as Incomplete 🔄"
                      : "Mark Lesson Completed ✅"}
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="lesson-viewer-card empty">
              <h3>Select a lesson from the syllabus sidebar to begin learning</h3>
            </div>
          )}
        </div>
      </div>

      {/* Add Lesson Modal */}
      {showAddLessonModal && (
        <div className="modal-overlay">
          <div className="modal-content">
            <div className="modal-header">
              <h3>➕ Add New Lesson</h3>
              <button
                className="close-btn"
                onClick={() => setShowAddLessonModal(false)}
              >
                &times;
              </button>
            </div>
            <form onSubmit={handleAddLessonSubmit}>
              <div className="modal-body">
                <div className="form-group">
                  <label>Lesson Title *</label>
                  <input
                    type="text"
                    value={newLessonData.title}
                    onChange={(e) =>
                      setNewLessonData({ ...newLessonData, title: e.target.value })
                    }
                    required
                  />
                </div>
                <div className="form-group">
                  <label>Lesson Content / Notes</label>
                  <textarea
                    rows="4"
                    value={newLessonData.content}
                    onChange={(e) =>
                      setNewLessonData({ ...newLessonData, content: e.target.value })
                    }
                  />
                </div>
                <div className="form-group">
                  <label>Estimated Duration</label>
                  <input
                    type="text"
                    value={newLessonData.duration}
                    onChange={(e) =>
                      setNewLessonData({ ...newLessonData, duration: e.target.value })
                    }
                  />
                </div>
              </div>
              <div className="modal-footer">
                <button
                  type="button"
                  className="btn btn-secondary"
                  onClick={() => setShowAddLessonModal(false)}
                  disabled={lessonLoading}
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="btn btn-primary"
                  disabled={lessonLoading}
                >
                  {lessonLoading ? "Adding..." : "Add Lesson"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default CourseDetail;

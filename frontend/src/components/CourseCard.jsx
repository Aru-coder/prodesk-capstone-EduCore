import { useNavigate } from "react-router-dom";

function CourseCard({
  course,
  user,
  isEnrolled,
  enrollmentProgress,
  onEdit,
  onDelete,
  onEnroll,
  onStripePay,
  loading,
}) {
  const navigate = useNavigate();

  const instructorIdStr =
    typeof course.instructorId === "object"
      ? course.instructorId?._id
      : course.instructorId;

  const isOwner =
    user && (user.id === instructorIdStr || user.role === "admin");

  return (
    <div className="course-card">
      <div className="card-media">
        <img
          src={course.thumbnail || "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80"}
          alt={course.title}
          className="card-img"
        />
        <span className="badge category-badge">{course.category || "General"}</span>
        <span className={`badge level-badge level-${course.level?.toLowerCase()}`}>
          {course.level || "Beginner"}
        </span>
      </div>

      <div className="card-body">
        <h3 className="course-title" onClick={() => navigate(`/courses/${course._id}`)}>
          {course.title}
        </h3>
        <p className="course-description">{course.description}</p>

        <div className="course-meta">
          <span className="instructor-name">
            👨‍🏫 {course.instructorName || course.instructorId?.name || "Instructor"}
          </span>
          <span className="lesson-count">
            📚 {course.lessons?.length || 0} Lessons
          </span>
        </div>

        {isEnrolled && (
          <div className="progress-container">
            <div className="progress-bar-bg">
              <div
                className="progress-bar-fill"
                style={{ width: `${enrollmentProgress || 0}%` }}
              ></div>
            </div>
            <span className="progress-text">{enrollmentProgress || 0}% Completed</span>
          </div>
        )}
      </div>

      <div className="card-footer">
        <div className="price-tag">
          {course.price > 0 ? (
            <span className="price-amount">${course.price.toFixed(2)}</span>
          ) : (
            <span className="free-badge">FREE</span>
          )}
        </div>

        <div className="card-actions">
          {isEnrolled ? (
            <button
              className="btn btn-primary"
              onClick={() => navigate(`/courses/${course._id}`)}
            >
              Continue Learning 🚀
            </button>
          ) : (
            <>
              {course.price > 0 ? (
                <button
                  className="btn btn-stripe"
                  onClick={() => onStripePay(course._id)}
                  disabled={loading}
                >
                  💳 Buy with Stripe
                </button>
              ) : (
                <button
                  className="btn btn-success"
                  onClick={() => onEnroll(course._id)}
                  disabled={loading}
                >
                  Enroll Free ✨
                </button>
              )}
            </>
          )}

          {isOwner && (
            <div className="owner-actions">
              <button
                className="btn-icon edit-btn"
                title="Edit Course"
                onClick={() => onEdit(course)}
              >
                ✏️
              </button>
              <button
                className="btn-icon delete-btn"
                title="Delete Course (Safety Prompt)"
                onClick={() => onDelete(course._id, course.title)}
              >
                🗑️
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}

export default CourseCard;

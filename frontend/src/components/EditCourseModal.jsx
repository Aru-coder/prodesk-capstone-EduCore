import { useState, useEffect } from "react";

function EditCourseModal({ isOpen, course, onClose, onSave, loading }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Development",
    level: "Beginner",
    price: 0,
    thumbnail: "",
    status: "published",
  });

  useEffect(() => {
    if (course) {
      setFormData({
        title: course.title || "",
        description: course.description || "",
        category: course.category || "Development",
        level: course.level || "Beginner",
        price: course.price || 0,
        thumbnail: course.thumbnail || "",
        status: course.status || "published",
      });
    }
  }, [course]);

  if (!isOpen || !course) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onSave(course._id, formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>✏️ Edit Course Details</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Course Title</label>
              <input
                type="text"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Description</label>
              <textarea
                rows="3"
                value={formData.description}
                onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                required
              />
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>Category</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                >
                  <option value="Development">Development</option>
                  <option value="Computer Science">Computer Science</option>
                  <option value="Design">Design</option>
                  <option value="Business">Business</option>
                  <option value="Data Science">Data Science</option>
                </select>
              </div>

              <div className="form-group half">
                <label>Level</label>
                <select
                  value={formData.level}
                  onChange={(e) => setFormData({ ...formData, level: e.target.value })}
                >
                  <option value="Beginner">Beginner</option>
                  <option value="Intermediate">Intermediate</option>
                  <option value="Advanced">Advanced</option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group half">
                <label>Price ($ USD)</label>
                <input
                  type="number"
                  step="0.01"
                  min="0"
                  value={formData.price}
                  onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                />
              </div>

              <div className="form-group half">
                <label>Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="draft">Draft</option>
                  <option value="published">Published</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Thumbnail Image URL</label>
              <input
                type="url"
                value={formData.thumbnail}
                onChange={(e) => setFormData({ ...formData, thumbnail: e.target.value })}
              />
            </div>
          </div>

          <div className="modal-footer">
            <button type="button" className="btn btn-secondary" onClick={onClose} disabled={loading}>
              Cancel
            </button>
            <button type="submit" className="btn btn-primary" disabled={loading}>
              {loading ? "Saving..." : "Save Changes"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default EditCourseModal;

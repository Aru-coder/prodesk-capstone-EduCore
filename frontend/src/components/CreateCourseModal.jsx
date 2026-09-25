import { useState } from "react";

function CreateCourseModal({ isOpen, onClose, onCreate, loading }) {
  const [formData, setFormData] = useState({
    title: "",
    description: "",
    category: "Development",
    level: "Beginner",
    price: 0,
    thumbnail: "https://images.unsplash.com/photo-1516321318423-f06f85e504b3?w=600&auto=format&fit=crop&q=80",
    status: "published",
    lessons: [
      { title: "Introduction & Setup", content: "Getting started with course setup.", duration: "10 mins" },
      { title: "Core Concepts & Architecture", content: "Understanding main concepts.", duration: "20 mins" }
    ],
  });

  if (!isOpen) return null;

  const handleSubmit = (e) => {
    e.preventDefault();
    onCreate(formData);
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <div className="modal-header">
          <h3>➕ Create New Course</h3>
          <button className="close-btn" onClick={onClose}>&times;</button>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="modal-body">
            <div className="form-group">
              <label>Course Title *</label>
              <input
                type="text"
                placeholder="e.g. Master Full-Stack Web Development"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
                required
              />
            </div>

            <div className="form-group">
              <label>Description *</label>
              <textarea
                rows="3"
                placeholder="Provide a comprehensive summary of what students will learn..."
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
                <label>Publish Status</label>
                <select
                  value={formData.status}
                  onChange={(e) => setFormData({ ...formData, status: e.target.value })}
                >
                  <option value="published">Publish Immediately</option>
                  <option value="draft">Save as Draft</option>
                </select>
              </div>
            </div>

            <div className="form-group">
              <label>Thumbnail URL</label>
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
            <button type="submit" className="btn btn-success" disabled={loading}>
              {loading ? "Creating..." : "Create Course"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

export default CreateCourseModal;

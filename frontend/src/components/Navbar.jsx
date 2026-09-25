import { Link, useNavigate } from "react-router-dom";

function Navbar({ user, activeTab, setActiveTab }) {
  const navigate = useNavigate();

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    navigate("/login");
  };

  return (
    <nav className="navbar">
      <div className="nav-container">
        <div className="nav-brand" onClick={() => navigate("/dashboard")}>
          <span className="brand-logo">🎓</span>
          <span className="brand-name">EduCore</span>
          <span className="brand-tag">LMS</span>
        </div>

        <div className="nav-links">
          <button
            className={`nav-btn ${activeTab === "catalog" ? "active" : ""}`}
            onClick={() => setActiveTab("catalog")}
          >
            📚 Catalog
          </button>

          <button
            className={`nav-btn ${activeTab === "learning" ? "active" : ""}`}
            onClick={() => setActiveTab("learning")}
          >
            📖 My Courses
          </button>

          {(user?.role === "instructor" || user?.role === "admin") && (
            <button
              className={`nav-btn ${activeTab === "instructor" ? "active" : ""}`}
              onClick={() => setActiveTab("instructor")}
            >
              🛠️ Instructor Portal
            </button>
          )}

          <button
            className={`nav-btn ${activeTab === "analytics" ? "active" : ""}`}
            onClick={() => setActiveTab("analytics")}
          >
            📊 Analytics
          </button>
        </div>

        <div className="nav-user">
          <div className="user-profile">
            <span className="user-name">{user?.name || "User"}</span>
            <span className={`role-badge role-${user?.role || "student"}`}>
              {user?.role || "student"}
            </span>
          </div>

          <button className="logout-btn" onClick={handleLogout}>
            Logout 🚪
          </button>
        </div>
      </div>
    </nav>
  );
}

export default Navbar;

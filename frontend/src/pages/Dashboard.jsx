import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { getCurrentUser } from "../services/authService";

function Dashboard() {
  const navigate = useNavigate();

  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const token = localStorage.getItem("token");

    if (!token) {
      navigate("/login", { replace: true });
      return;
    }

    const fetchUser = async () => {
      try {
        const data = await getCurrentUser(token);

        setUser(data.user);

        // Keep user information synchronized
        localStorage.setItem("user", JSON.stringify(data.user));
      } catch (error) {
        console.error("Authentication failed:", error);

        localStorage.removeItem("token");
        localStorage.removeItem("user");

        navigate("/login", { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");

    navigate("/login", { replace: true });
  };

  if (loading) {
    return (
      <div className="dashboard-container">
        <div className="dashboard-card">
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard-container">
      <div className="dashboard-card">
        <h1>Welcome to EduCore 🎓</h1>

        {user && (
          <div className="user-info">
            <h2>Hello, {user.name}!</h2>

            <p>
              <strong>Email:</strong> {user.email}
            </p>

            <p className="success-text">
              You are successfully authenticated.
            </p>
          </div>
        )}

        <button
          className="logout-button"
          onClick={handleLogout}
        >
          Logout
        </button>
      </div>
    </div>
  );
}

export default Dashboard;
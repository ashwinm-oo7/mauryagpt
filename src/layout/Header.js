import React, { useEffect, useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../css/header.css";
import api from "../auth/axiosInstance";

function Header() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);
  // const currentToken = localStorage.getItem("refreshToken");
  const [sessions, setSessions] = useState([]);
  // const isCurrent = (token) => token === currentToken;
  const handleLogout = async (token) => {
    await logout(token);
    fetchSessions(); // refresh UI
    navigate("/login");
  };
  const fetchSessions = async () => {
    try {
      const res = await api.get("/api/auth/sessions");
      console.log("/api/auth/sessions", res);
      setSessions(res.data);
    } catch (err) {
      console.error(err);
    }
  };

  useEffect(() => {
    if (user) fetchSessions();
  }, [user]);
  if (loading) return null;

  return (
    <div className="header">
      <h1 className="app-title">Maurya AI</h1>

      {/* Mobile Menu Icon */}
      <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
        ☰
      </div>

      <div className={`nav-right ${menuOpen ? "active" : ""}`}>
        {user && (
          <Link className="btn purple" to="/profile">
            Profile
          </Link>
        )}

        {user ? (
          <>
            {Array.isArray(sessions) &&
              sessions.map((s, i) => (
                <div key={i}>
                  <button
                    className="btn light"
                    onClick={() => handleLogout(s.token)}
                  >
                    Logout
                  </button>
                </div>
              ))}
            <Link className="btn dark" to="/UserDashboard">
              Dashboard
            </Link>
            <Link className="btn dark" to="/user">
              User Dashboard
            </Link>

            {user.role === "admin" && (
              <>
                {/* <Link className="btn dark" to="/admin/dashboard">
                  Admin
                </Link> */}
                <Link className="btn dark" to="/admin">
                  AdminLayouts
                </Link>
              </>
            )}
          </>
        ) : (
          <Link className="btn blue" to="/login">
            Login
          </Link>
        )}

        <Link className="btn green" to="/knowledge">
          Knowledge
        </Link>

        <Link className="btn dark" to="/SabReport">
          SabReport
        </Link>
      </div>
    </div>
  );
}

export default Header;

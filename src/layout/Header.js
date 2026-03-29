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
  const handleLogout = async () => {
    const refreshToken = localStorage.getItem("refreshToken"); // ✅ current device

    if (sessions || refreshToken) {
      await logout(refreshToken);
    }

    localStorage.removeItem("refreshToken"); // cleanup
    navigate("/login");
    setMenuOpen(false); // ✅ close menu
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
    if (menuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "auto";
    }
  }, [menuOpen]);
  useEffect(() => {
    if (user) fetchSessions();
  }, [user]);
  if (loading) return null;

  return (
    <>
      <div className="header">
        <h1 className="app-title">Maurya AI</h1>

        {/* Mobile Menu Icon */}
        <div className="menu-icon" onClick={() => setMenuOpen(!menuOpen)}>
          ☰
        </div>
        {menuOpen && (
          <div className="overlay" onClick={() => setMenuOpen(false)} />
        )}

        <div className={`nav-right ${menuOpen ? "active" : ""}`}>
          <div className="mobile-header">
            <h2>Menu</h2>
            <span onClick={() => setMenuOpen(false)}>✕</span>
          </div>

          {user && (
            <Link
              onClick={() => setMenuOpen(false)}
              className="btn purple"
              to="/profile"
            >
              Profile
            </Link>
          )}

          {user ? (
            <>
              <div className="btn light" onClick={handleLogout}>
                Logout
              </div>

              <Link
                onClick={() => setMenuOpen(false)}
                className="btn dark"
                to="/user"
              >
                User Dashboard
              </Link>

              {user.role === "admin" && (
                <>
                  {/* <Link className="btn dark" to="/admin/dashboard">
                  Admin
                </Link> */}
                  <Link
                    onClick={() => setMenuOpen(false)}
                    className="btn dark"
                    to="/admin"
                  >
                    AdminLayouts
                  </Link>
                </>
              )}
            </>
          ) : (
            <Link
              onClick={() => setMenuOpen(false)}
              className="btn blue"
              to="/login"
            >
              Login
            </Link>
          )}
          <div className="divider" />

          <Link
            onClick={() => setMenuOpen(false)}
            className="btn green"
            to="/knowledge"
          >
            Knowledge
          </Link>

          <Link
            onClick={() => setMenuOpen(false)}
            className="btn dark"
            to="/SabReport"
          >
            SabReport
          </Link>
        </div>
      </div>
      {/* {menuOpen && (
        <div className="overlay" onClick={() => setMenuOpen(false)} />
      )} */}
    </>
  );
}

export default Header;

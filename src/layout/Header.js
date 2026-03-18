import React, { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import "../css/header.css";

function Header() {
  const { user, loading, logout } = useAuth();
  const navigate = useNavigate();
  const [menuOpen, setMenuOpen] = useState(false);

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
            <button className="btn light" onClick={handleLogout}>
              Logout
            </button>

            <Link className="btn dark" to="/UserDashboard">
              Dashboard
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

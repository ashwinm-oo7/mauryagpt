import React, { useState } from "react";
import { NavLink, Outlet, useNavigate } from "react-router-dom";
import {
  FaTachometerAlt,
  FaChartBar,
  FaQuestionCircle,
  FaBars,
  FaSignOutAlt,
  FaMoon,
  FaSun,
  FaBell,
} from "react-icons/fa";

import "./AdminLayout.css";
import { useAuth } from "../../auth/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNotifications } from "../../context/NotificationContext";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const { logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAllRead } = useNotifications();

  const navigate = useNavigate();

  const handleNotificationClick = (n) => {
    navigate(`/admin/exam/${n.examId}`);
    setShowDropdown(false);
    n.read = true;
    markAllRead();
  };

  return (
    <div className={`AdminLayout-container ${darkMode ? "dark" : ""}`}>
      {/* OVERLAY */}
      {mobileOpen && (
        <div className="admin-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* SIDEBAR (DESKTOP) */}
      <aside
        className={`AdminLayout-sidebar 
        ${collapsed ? "collapsed" : ""} 
        ${mobileOpen ? "mobile-open" : ""}`}
      >
        <div className="sidebar-header">
          <h2>Admin</h2>
          <span onClick={() => setMobileOpen(false)}>✕</span>
        </div>

        <nav>
          <NavLink to="/admin" end onClick={() => setCollapsed(!collapsed)}>
            <FaTachometerAlt /> <span>Dashboard</span>
          </NavLink>

          <NavLink
            to="/admin/analytics"
            onClick={() => setCollapsed(!collapsed)}
          >
            <FaChartBar /> <span>Exam Attempts</span>
          </NavLink>

          <NavLink to="/admin/mcq" onClick={() => setCollapsed(!collapsed)}>
            <FaQuestionCircle /> <span>MCQ</span>
          </NavLink>
        </nav>

        <div
          className="sidebar-footer"
          onClick={() => setCollapsed(!collapsed)}
        >
          <button onClick={logout}>
            <FaSignOutAlt /> <span>Logout</span>
          </button>
        </div>
      </aside>

      {/* MAIN */}
      <div className="AdminLayout-main">
        {/* TOPBAR */}
        <div className="AdminLayout-topbar">
          <div className="topbar-left">
            <button
              className="icon-btn mobile-only"
              onClick={() => setMobileOpen(true)}
            >
              <FaBars />
            </button>

            <button
              className="icon-btn desktop-only"
              onClick={() => setCollapsed(!collapsed)}
            >
              <FaBars />
            </button>
          </div>

          <div className="topbar-right">
            {/* NOTIFICATIONS */}
            <div className="notification-wrapper">
              <button
                className="icon-btn"
                onClick={() => setShowDropdown(!showDropdown)}
              >
                <FaBell />
                {unreadCount > 0 && (
                  <span className="badge">{unreadCount}</span>
                )}
              </button>

              {showDropdown && (
                <div className="dropdown">
                  {notifications.length === 0 ? (
                    <div className="empty">No notifications</div>
                  ) : (
                    notifications.map((n) => (
                      <div
                        key={n._id}
                        className={`dropdown-item ${n.read ? "" : "unread"}`}
                        onClick={() => handleNotificationClick(n)}
                      >
                        <div>{n.message}</div>
                        <small>
                          {new Date(n.createdAt).toLocaleTimeString()}
                        </small>
                      </div>
                    ))
                  )}
                </div>
              )}
            </div>

            <button className="icon-btn" onClick={toggleTheme}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            <FaSignOutAlt className="logout-icon" onClick={logout} />
          </div>
        </div>

        {/* CONTENT */}
        <div className="AdminLayout-content">
          <Outlet />
        </div>
      </div>

      {/* 🔥 MOBILE BOTTOM NAV */}
      <div className="mobile-bottom-nav">
        <NavLink to="/admin" end>
          <FaTachometerAlt />
          <span>Home</span>
        </NavLink>

        <NavLink to="/admin/analytics">
          <FaChartBar />
          <span>Attempts</span>
        </NavLink>

        <NavLink to="/admin/mcq">
          <FaQuestionCircle />
          <span>MCQ</span>
        </NavLink>

        <button onClick={logout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button>
      </div>
    </div>
  );
}

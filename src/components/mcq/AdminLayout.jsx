import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
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

import { useNavigate } from "react-router-dom";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const { logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAllRead } = useNotifications();
  const navigate = useNavigate();

  const handleNotificationClick = (n) => {
    // Navigate to exam attempt
    navigate(`/admin/exam/${n.examId}`);
    setShowDropdown(false);

    // Mark as read locally
    n.read = true;
    markAllRead();
  };

  return (
    <div
      className={`AdminLayout-container ${collapsed ? "collapsed" : ""} ${
        darkMode ? "dark" : ""
      }`}
    >
      {/* SIDEBAR */}
      <aside className="AdminLayout-sidebar">
        <h2 className="AdminLayout-logo">Admin</h2>
        <nav>
          <NavLink to="/admin" end>
            <FaTachometerAlt /> <span>Dashboard</span>
          </NavLink>
          <NavLink to="/admin/analytics">
            <FaChartBar /> <span>Exam Attempts</span>
          </NavLink>
          <NavLink to="/admin/mcq">
            <FaQuestionCircle /> <span>MCQ</span>
          </NavLink>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="AdminLayout-main">
        <div className="AdminLayout-topbar">
          {/* Notification Bell */}
          <div className="AdminLayout-notification">
            <button
              className="AdminLayout-bell"
              onClick={() => setShowDropdown(!showDropdown)}
            >
              <FaBell />
              {unreadCount > 0 && (
                <span className="AdminLayout-badge">{unreadCount}</span>
              )}
            </button>

            {showDropdown && (
              <div className="AdminLayout-dropdown">
                {notifications.length === 0 && (
                  <div className="AdminLayout-dropdown-empty">
                    No new notifications
                  </div>
                )}

                {notifications.map((n) => (
                  <div
                    key={n._id}
                    className={`AdminLayout-dropdown-item ${
                      n.read ? "" : "unread"
                    }`}
                    onClick={() => handleNotificationClick(n)}
                  >
                    <div className="AdminLayout-dropdown-text">{n.message}</div>
                    <div className="AdminLayout-dropdown-time">
                      {new Date(n.createdAt).toLocaleTimeString()}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Other topbar buttons */}
          <button
            className="AdminLayout-toggle"
            onClick={() => setCollapsed(!collapsed)}
          >
            <FaBars />
          </button>
          <button className="AdminLayout-toggle" onClick={toggleTheme}>
            {darkMode ? <FaSun /> : <FaMoon />}
          </button>
          <div className="AdminLayout-user">
            <span>Admin</span>
            <FaSignOutAlt className="logout-icon" onClick={logout} />
          </div>
        </div>

        <div className="AdminLayout-content">
          <Outlet />
        </div>
      </div>
    </div>
  );
}

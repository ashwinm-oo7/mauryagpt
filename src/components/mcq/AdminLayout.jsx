import React, { useEffect, useState } from "react";
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
  FaUserShield,
  FaListAlt,
} from "react-icons/fa";

import { motion, AnimatePresence } from "framer-motion";
import "./AdminLayout.css";

import { useAuth } from "../../auth/AuthContext";
import { useTheme } from "../../context/ThemeContext";
import { useNotifications } from "../../context/NotificationContext";

export default function AdminLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth <= 768);

  const { logout } = useAuth();
  const { darkMode, toggleTheme } = useTheme();
  const { notifications, unreadCount, markAllRead } = useNotifications();

  const navigate = useNavigate();

  /* ================== RESPONSIVE ================== */
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth <= 768);
    };

    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  /* ================== LOCK SCROLL ON MOBILE MENU ================== */
  useEffect(() => {
    document.body.style.overflow = mobileOpen ? "hidden" : "auto";
  }, [mobileOpen]);

  /* ================== SWIPE SUPPORT ================== */
  useEffect(() => {
    let startX = 0;

    const handleTouchStart = (e) => {
      startX = e.touches[0].clientX;
    };

    const handleTouchMove = (e) => {
      const currentX = e.touches[0].clientX;

      if (startX < 50 && currentX > 120) {
        setMobileOpen(true);
      }

      if (currentX < 50) {
        setMobileOpen(false);
      }
    };

    window.addEventListener("touchstart", handleTouchStart);
    window.addEventListener("touchmove", handleTouchMove);

    return () => {
      window.removeEventListener("touchstart", handleTouchStart);
      window.removeEventListener("touchmove", handleTouchMove);
    };
  }, []);

  /* ================== NOTIFICATION ================== */
  const handleNotificationClick = (n) => {
    navigate(`/admin/exam/${n.examId}`);
    setShowDropdown(false);
    n.read = true;
    markAllRead();
  };

  return (
    <div className={`AdminLayout-container ${darkMode ? "dark" : ""}`}>
      {/* OVERLAY (Mobile) */}
      {mobileOpen && (
        <div className="admin-overlay" onClick={() => setMobileOpen(false)} />
      )}

      {/* SIDEBAR */}
      <AnimatePresence>
        {(!isMobile || mobileOpen) && (
          <motion.aside
            initial={isMobile ? { x: -260 } : false}
            animate={{ x: 0 }}
            exit={isMobile ? { x: -260 } : false}
            transition={{ type: "spring", stiffness: 260, damping: 25 }}
            className={`AdminLayout-sidebar ${collapsed ? "collapsed" : ""}`}
          >
            {/* HEADER */}
            <div className="sidebar-header">
              <h2>
                <FaUserShield />
                <strong>Admin</strong>
              </h2>
              {isMobile && <span onClick={() => setMobileOpen(false)}>✕</span>}
            </div>

            {/* NAVIGATION */}
            <nav>
              <NavLink
                to="/admin"
                end
                onClick={() => isMobile && setMobileOpen(false)}
              >
                <FaTachometerAlt />
                <span>Dashboard</span>
              </NavLink>

              <NavLink
                to="/admin/analytics"
                onClick={() => isMobile && setMobileOpen(false)}
              >
                <FaChartBar />
                <span>Exam Attempts</span>
              </NavLink>

              <NavLink
                to="/admin/mcq"
                onClick={() => isMobile && setMobileOpen(false)}
              >
                <FaQuestionCircle />
                <span>MCQ</span>
              </NavLink>
              <NavLink
                to="/admin/level/users"
                onClick={() => isMobile && setMobileOpen(false)}
              >
                <FaListAlt />
                <span>User List</span>
              </NavLink>
              <NavLink
                to="/admin/mail/AdminInbox"
                onClick={() => isMobile && setMobileOpen(false)}
              >
                <FaListAlt />
                <span>AdminInbox</span>
              </NavLink>
            </nav>

            {/* FOOTER */}
            <div className="sidebar-footer">
              <button onClick={logout}>
                <FaSignOutAlt />
                <span>Logout</span>
              </button>
            </div>
          </motion.aside>
        )}
      </AnimatePresence>

      {/* MAIN */}
      <div className="AdminLayout-main">
        {/* TOPBAR */}
        <div className="AdminLayout-topbar">
          <div className="topbar-left">
            {/* MOBILE MENU */}
            <button
              className="icon-btn mobile-only"
              onClick={() => setMobileOpen(true)}
            >
              <FaBars />
            </button>

            {/* DESKTOP COLLAPSE */}
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

            {/* THEME */}
            <button className="icon-btn" onClick={toggleTheme}>
              {darkMode ? <FaSun /> : <FaMoon />}
            </button>

            {/* LOGOUT */}
            <FaSignOutAlt className="logout-icon" onClick={logout} />
          </div>
        </div>

        {/* CONTENT */}
        <div className="AdminLayout-content">
          <Outlet />
        </div>
      </div>

      {/* MOBILE BOTTOM NAV */}
      <div className="mobile-bottom-nav">
        <NavLink to="/admin" end>
          <FaTachometerAlt />
        </NavLink>

        <NavLink to="/admin/analytics">
          <FaChartBar />
        </NavLink>

        <NavLink to="/admin/mcq">
          <FaQuestionCircle />
        </NavLink>
        <NavLink
          to="/admin/level/users"
          onClick={() => isMobile && setMobileOpen(false)}
        >
          <FaListAlt />
        </NavLink>
        <NavLink
          to="/admin/mail/AdminInbox"
          onClick={() => isMobile && setMobileOpen(false)}
        >
          <FaListAlt />
        </NavLink>

        {/* <button onClick={logout}>
          <FaSignOutAlt />
          <span>Logout</span>
        </button> */}
      </div>
    </div>
  );
}

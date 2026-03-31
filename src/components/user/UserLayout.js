import React, { useState } from "react";
import { NavLink, Outlet } from "react-router-dom";
import {
  FaHome,
  FaAward,
  FaCertificate,
  FaChartBar,
  FaSignOutAlt,
  FaBars,
  FaTelegramPlane,
} from "react-icons/fa";

import "./css/UserLayout.css";
import { useAuth } from "../../auth/AuthContext";

export default function UserLayout() {
  const [collapsed, setCollapsed] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);
  const { logout } = useAuth();

  return (
    <div className={`UserLayout-container ${collapsed ? "collapsed" : ""}`}>
      {/* SIDEBAR */}
      {/* 🔥 OVERLAY (mobile only) */}
      {mobileOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => {
            if (window.innerWidth < 768) {
              setMobileOpen(true);
            } else {
              setCollapsed(!collapsed);
            }
          }}
        />
      )}

      <aside
        className={`UserLayout-sidebar 
        ${collapsed ? "collapsed" : ""} 
        ${mobileOpen ? "mobile-active" : ""}`}
      >
        {/* HEADER */}
        <div className="sidebar-header">
          <h2 className="UserLayout-logo">User Dashboard</h2>
          <span onClick={() => setMobileOpen(false)}>✕</span>
        </div>

        <nav>
          <NavLink to="/user" end onClick={() => setMobileOpen(false)}>
            <FaHome />{" "}
            <span className="UserLayout-sidebar-span">Dashboard</span>
          </NavLink>
          <NavLink to="/user/DomainList" onClick={() => setMobileOpen(false)}>
            <FaTelegramPlane />{" "}
            <span className="UserLayout-sidebar-span">DomainList</span>
          </NavLink>
          <NavLink to="/user/certificates" onClick={() => setMobileOpen(false)}>
            <FaCertificate />{" "}
            <span className="UserLayout-sidebar-span">Certificates</span>
          </NavLink>

          <NavLink to="/user/badges" onClick={() => setMobileOpen(false)}>
            <FaAward /> <span className="UserLayout-sidebar-span">Badges</span>
          </NavLink>

          <NavLink to="/user/leaderboard" onClick={() => setMobileOpen(false)}>
            <FaChartBar />
            <span className="UserLayout-sidebar-span">Leaderboard</span>
          </NavLink>
        </nav>
      </aside>

      {/* MAIN */}
      <div className="UserLayout-main">
        <div className="UserLayout-topbar">
          <button
            className="UserLayout-toggle"
            onClick={() => setCollapsed(!collapsed)}
          >
            <FaBars />
          </button>

          <div className="UserLayout-user">
            <span>User</span>
            <FaSignOutAlt onClick={logout} />
          </div>
        </div>

        <div className="UserLayout-content">
          <Outlet />
        </div>
      </div>
      <div className="mobile-bottom-nav">
        <NavLink to="/user">
          <FaHome />
        </NavLink>
        <NavLink to="/user/DomainList">
          <FaTelegramPlane />
        </NavLink>
        <NavLink to="/user/certificates">
          <FaCertificate />
        </NavLink>
        <NavLink to="/user/badges">
          <FaAward />
        </NavLink>
        <NavLink to="/user/leaderboard">
          <FaChartBar />
        </NavLink>
      </div>
    </div>
  );
}

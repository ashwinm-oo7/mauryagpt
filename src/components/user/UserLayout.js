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
  const { logout } = useAuth();

  return (
    <div className={`UserLayout-container ${collapsed ? "collapsed" : ""}`}>
      {/* SIDEBAR */}
      <aside className="UserLayout-sidebar">
        <h2 className="UserLayout-logo">Maurya</h2>

        <nav>
          <NavLink to="/user" end>
            <FaHome />{" "}
            <span className="UserLayout-sidebar-span">Dashboard</span>
          </NavLink>
          <NavLink to="/user/DomainList" end>
            <FaTelegramPlane />{" "}
            <span className="UserLayout-sidebar-span">DomainList</span>
          </NavLink>
          <NavLink to="/user/certificates">
            <FaCertificate />{" "}
            <span className="UserLayout-sidebar-span">Certificates</span>
          </NavLink>

          <NavLink to="/user/badges">
            <FaAward /> <span className="UserLayout-sidebar-span">Badges</span>
          </NavLink>

          <NavLink to="/user/leaderboard">
            <span className="UserLayout-sidebar-span">Leaderboard</span>
            <FaChartBar />
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
    </div>
  );
}

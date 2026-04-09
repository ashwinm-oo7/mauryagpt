import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../auth/axiosInstance";
import { FaUser } from "react-icons/fa";
import "./LogoutAll.css";

const LogoutAll = () => {
  const navigate = useNavigate();
  const [loading, setLoading] = useState(false);

  const handleLogoutAll = async () => {
    try {
      setLoading(true);

      await api.post("/api/auth/logout-all");

      // 🧹 clear local storage
      localStorage.removeItem("refreshToken");

      toast.success("Logged out from all devices");

      navigate("/login");
    } catch (err) {
      toast.error("Failed to logout from all devices");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="logoutall-wrapper">
      <button
        className="logoutall-btn"
        onClick={handleLogoutAll}
        disabled={loading}
      >
        <span className="logoutall-icon">
          <FaUser />
        </span>

        <span className="logoutall-text">
          {loading ? "Logging out..." : "Logout from All Devices"}
        </span>

        <span className="logoutall-glow" />
      </button>
    </div>
  );
};

export default LogoutAll;

import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../auth/axiosInstance";

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
    <div style={{ marginTop: "20px" }}>
      <button
        className="btn danger"
        onClick={handleLogoutAll}
        disabled={loading}
      >
        {loading ? "Logging out..." : "Logout from All Devices"}
      </button>
    </div>
  );
};

export default LogoutAll;

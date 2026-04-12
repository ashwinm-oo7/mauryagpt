import React, { useEffect, useState } from "react";
import api from "../../auth/axiosInstance";
import toast from "react-hot-toast";
import "./AdminUserList.css";

export default function AdminUserList() {
  const [users, setUsers] = useState([]);

  const fetchUsers = async () => {
    try {
      const res = await api.get("/api/admin/users");
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users");
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);
  const resetAttempts = async (userId) => {
    const domain = prompt("Enter domain to reset:");
    const level = prompt("Enter level:");

    if (!domain || !level) return;

    try {
      const res = await api.put("/api/admin/users/reset-attempts", {
        userId,
        domain,
        level,
      });

      toast.success(res.data.msg);
    } catch {
      toast.error("Reset failed");
    }
  };
  const toggleBlock = async (userId) => {
    try {
      const res = await api.put(`/api/admin/users/block/${userId}`);
      toast.success(res.data.msg);
      fetchUsers(); // refresh
    } catch {
      toast.error("Action failed");
    }
  };
  const toggleNameLock = async (userId) => {
    try {
      const res = await api.put(`/api/admin/users/toggle-name-lock/${userId}`);

      toast.success(res.data.msg);
      fetchUsers();
    } catch {
      toast.error("Action failed");
    }
  };
  return (
    <div className="admin-users-container">
      <h2>👤 User Management</h2>

      <table className="admin-users-table">
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Locked Name</th>
            <th>Status</th>
            <th>Reset Exam</th>
            <th>Actions</th>
          </tr>
        </thead>

        <tbody>
          {users.map((user) => (
            <tr key={user._id}>
              <td>{user.name}</td>
              <td>{user.email}</td>

              <td>
                {user.nameLocked ? "🔒 Locked" : "✏️ Editable"}
                <button
                  className={
                    user.nameLocked
                      ? "admin-users-btn purple"
                      : "admin-users-btn red"
                  }
                  onClick={() => toggleNameLock(user._id)}
                >
                  {user.nameLocked ? "🔓 Unlock Name" : "🔐 Lock Name"}
                </button>
              </td>

              <td>{user.isBlocked ? "🚫 Blocked" : "✅ Active"}</td>
              <td>
                <button
                  className="admin-users-btn warning"
                  onClick={() => resetAttempts(user._id)}
                >
                  🔄 Reset Attempts
                </button>
              </td>
              <td>
                <button
                  className={`admin-users-btn ${
                    user.isBlocked ? "success" : "danger"
                  }`}
                  onClick={() => toggleBlock(user._id)}
                >
                  {user.isBlocked ? "Unblock" : "Block"}
                </button>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

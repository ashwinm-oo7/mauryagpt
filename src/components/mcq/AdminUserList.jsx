import React, { useEffect, useRef, useState } from "react";
import api from "../../auth/axiosInstance";
import toast from "react-hot-toast";
import "./AdminUserList.css";
import { useNavigate } from "react-router-dom";
import { FaChartBar } from "react-icons/fa";

export default function AdminUserList() {
  const scrollRef = useRef();
  const navigate = useNavigate();
  const [users, setUsers] = useState([]);
  // const [actionLoading, setActionLoading] = useState(null);
  const [loading, setLoading] = useState(false);
  // const [resetData, setResetData] = useState({
  //   userId: null,
  //   domain: "",
  //   level: "",
  // });
  useEffect(() => {
    const el = scrollRef.current;
    let isDown = false;
    let startX;
    let scrollLeft;

    const mouseDown = (e) => {
      isDown = true;
      startX = e.pageX - el.offsetLeft;
      scrollLeft = el.scrollLeft;
    };

    const mouseLeave = () => (isDown = false);
    const mouseUp = () => (isDown = false);

    const mouseMove = (e) => {
      if (!isDown) return;
      e.preventDefault();
      const x = e.pageX - el.offsetLeft;
      const walk = (x - startX) * 1.5; // speed
      el.scrollLeft = scrollLeft - walk;
    };

    el.addEventListener("mousedown", mouseDown);
    el.addEventListener("mouseleave", mouseLeave);
    el.addEventListener("mouseup", mouseUp);
    el.addEventListener("mousemove", mouseMove);

    return () => {
      el.removeEventListener("mousedown", mouseDown);
      el.removeEventListener("mouseleave", mouseLeave);
      el.removeEventListener("mouseup", mouseUp);
      el.removeEventListener("mousemove", mouseMove);
    };
  }, []);
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/users/getAll");
      console.log("fetchUsers", res);
      setUsers(res.data);
    } catch {
      toast.error("Failed to load users");
    } finally {
      setLoading(false);
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
    } catch (err) {
      toast.error(err.response?.data?.msg || "Reset failed");
    }
  };
  const updateRole = async (userId, role) => {
    try {
      await api.put(`/api/admin/users/set-role/${userId}`, {
        role,
      });

      toast.success("Role updated");
      fetchUsers();
    } catch {
      toast.error("Failed to update role");
    }
  };
  const toggleBlock = async (userId) => {
    if (!window.confirm("Are you sure?")) return;

    try {
      const res = await api.put(`/api/admin/users/block/${userId}`);
      toast.success(res.data.msg);
      fetchUsers(); // refresh
    } catch (err) {
      toast.error(err.response?.data?.msg || "Action failed");
    }
  };
  const toggleNameLock = async (userId) => {
    try {
      const res = await api.put(`/api/admin/users/toggle-name-lock/${userId}`);
      //   console.log("api/admin/users/toggle-name-lock", res);
      toast.success(res.data.msg);
      fetchUsers();
    } catch (err) {
      toast.error(err.response?.data?.msg || "Action failed");
    }
  };
  const updatePermission = async (userId, key) => {
    const user = users.find((u) => u._id === userId);

    const updated = {
      ...user.permissions,
      [key]: !user.permissions?.[key],
    };

    await api.put(`/api/admin/users/set-permissions/${userId}`, updated);

    fetchUsers();
  };
  return (
    <div className="admin-users-container">
      <h2>👤 User Management</h2>
      {loading ? (
        <p>Loading users...</p>
      ) : (
        <div className="admin-table-wrapper" ref={scrollRef}>
          {" "}
          {/* ✅ ADD THIS */}
          <table className="admin-users-table">
            <thead>
              <tr>
                <th>Name</th>
                <th>Email</th>
                <th>Locked Name</th>
                <th>Status</th>
                <th>Reset Exam</th>
                <th>Activity</th>
                <th>Actions</th>
                <th>Permission</th>
                <th>Role Access</th>
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
                      className="admin-users-btn"
                      onClick={() =>
                        navigate(`/admin/level/AdminUserActivity/${user._id}`)
                      }
                    >
                      <FaChartBar />
                      <span style={{ margin: "2px" }}>User Activity</span>
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
                  <td>
                    <div className="permission-box">
                      <label>
                        <input
                          type="checkbox"
                          checked={user.permissions?.canBlockUser}
                          onChange={() =>
                            updatePermission(user._id, "canBlockUser")
                          }
                        />
                        Block User
                      </label>

                      <label>
                        <input
                          type="checkbox"
                          checked={user.permissions?.canResetAttempts}
                          onChange={() =>
                            updatePermission(user._id, "canResetAttempts")
                          }
                        />
                        Reset Attempts
                      </label>
                    </div>
                  </td>
                  <td>
                    <select
                      value={user.role}
                      onChange={(e) => updateRole(user._id, e.target.value)}
                    >
                      <option value="admin">Admin</option>
                      <option value="moderator">Moderator</option>
                      <option value="analyst">Analyst</option>
                      <option value="user">User</option>
                      <option value="custom">Custom</option>
                    </select>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}

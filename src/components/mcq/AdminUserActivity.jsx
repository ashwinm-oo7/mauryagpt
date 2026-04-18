import React, { useEffect, useRef, useState } from "react";
import api from "../../auth/axiosInstance";
import "./AdminUserActivity.css";
import { useParams } from "react-router-dom";
import { io } from "socket.io-client";

export default function AdminUserActivity() {
  const { userId } = useParams();
  const [search, setSearch] = useState("");
  const [logs, setLogs] = useState([]);
  const [filter, setFilter] = useState("ALL");
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_URL, {
      transports: ["websocket"],
    });

    const socket = socketRef.current;

    socket.on("connect", () => {
      socket.emit("joinAdmin");
    });

    socket.on("activityUpdate", (newLog) => {
      if (newLog.user === userId) {
        setLogs((prev) => [newLog, ...prev]);
      }
    });

    return () => socket.disconnect();
  }, [userId]);
  useEffect(() => {
    const fetchLogs = async () => {
      const res = await api.get(`/api/admin/users/activity/${userId}`);
      setLogs(res.data);
    };

    if (userId) fetchLogs();
  }, [userId]);
  useEffect(() => {
    const fetchLogs = async () => {
      try {
        const res = await api.get(`/api/admin/users/activity/${userId}`);
        setLogs(res.data);
      } catch (err) {
        console.error(err);
      }
    };

    if (userId) fetchLogs();
  }, [userId]);

  // 🔍 FILTER LOGIC
  const filteredLogs = logs.filter((log) => {
    const matchFilter = filter === "ALL" || log.action.includes(filter);

    const matchSearch =
      log.action.toLowerCase().includes(search.toLowerCase()) ||
      JSON.stringify(log.metadata || {})
        .toLowerCase()
        .includes(search.toLowerCase());

    return matchFilter && matchSearch;
  });

  // 📅 GROUP BY DATE
  const groupLogs = (logs) => {
    const today = new Date().toDateString();
    const yesterday = new Date(Date.now() - 86400000).toDateString();

    return logs.reduce((acc, log) => {
      const date = new Date(log.createdAt).toDateString();

      if (date === today) acc["Today"] = [...(acc["Today"] || []), log];
      else if (date === yesterday)
        acc["Yesterday"] = [...(acc["Yesterday"] || []), log];
      else acc["Older"] = [...(acc["Older"] || []), log];

      return acc;
    }, {});
  };

  const grouped = groupLogs(filteredLogs);

  const getClass = (action) => {
    if (action.includes("LOGIN")) return "login";
    if (action.includes("EXAM")) return "exam";
    if (action.includes("NAME")) return "name";
    if (action.includes("ADMIN")) return "admin";
    return "default";
  };

  const isSuspicious = (log) => {
    return log.action.includes("BLOCK") || log.action.includes("FAILED");
  };
  const exportCSV = () => {
    const rows = logs.map((log) => ({
      action: log.action,
      time: new Date(log.createdAt).toLocaleString(),
      metadata: JSON.stringify(log.metadata),
    }));

    const csv = [
      ["Action", "Time", "Metadata"],
      ...rows.map((r) => [r.action, r.time, r.metadata]),
    ]
      .map((e) => e.join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);

    const a = document.createElement("a");
    a.href = url;
    a.download = "activity_logs.csv";
    a.click();
  };
  return (
    <div className="timeline-container">
      <h2 className="timeline-title">📜 Activity Timeline</h2>
      <input
        className="timeline-search"
        placeholder="Search activity..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
      />
      <button className="export-btn" onClick={exportCSV}>
        📥 Export CSV
      </button>
      {/* 🔍 FILTER BAR */}
      <div className="timeline-filter">
        {["ALL", "LOGIN", "EXAM", "NAME", "ADMIN"].map((f) => (
          <button
            key={f}
            className={filter === f ? "active" : ""}
            onClick={() => setFilter(f)}
          >
            {f}
          </button>
        ))}
      </div>

      {/* 📅 GROUPED TIMELINE */}
      {Object.entries(grouped).map(([group, logs]) => (
        <div key={group}>
          <h3 className="timeline-group">{group}</h3>

          <div className="timeline">
            {logs.map((log) => (
              <div
                key={log._id}
                className={`timeline-item ${getClass(log.action)} ${
                  isSuspicious(log) ? "alert" : ""
                }`}
              >
                <div className="timeline-dot" />

                <div className="timeline-content">
                  <div className="timeline-header">
                    <span className="timeline-action">{log.action}</span>
                    <span className="timeline-time">
                      {new Date(log.createdAt).toLocaleString()}
                    </span>
                    {/* <span className="timeline-time">
                      {new Date(log.createdAt).toLocaleTimeString()}
                    </span> */}
                  </div>

                  {log.metadata && (
                    <div className="timeline-meta">
                      {Object.entries(log.metadata).map(([key, value]) => (
                        <div key={key}>
                          <b>{key}:</b> {value}
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

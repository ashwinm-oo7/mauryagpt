import React, { useEffect, useState } from "react";
import api from "../../auth/axiosInstance";
import { useNavigate } from "react-router-dom";
export default function AdminExamAnalytics() {
  const [domains, setDomains] = useState([]);
  const [levels, setLevels] = useState([]);
  const [attempts, setAttempts] = useState([]);

  const [domain, setDomain] = useState("");
  const [level, setLevel] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    loadDomains();
  }, []);

  const loadDomains = async () => {
    const res = await api.get("/api/admin/exams/domains");

    setDomains(res.data);
  };

  const loadLevels = async (d) => {
    const res = await api.get(`/api/admin/exams/levels/${d}`);

    setLevels(res.data);
  };

  const loadAttempts = async () => {
    const res = await api.get(
      `/api/admin/exams/attempts?domain=${domain}&level=${level}`,
    );

    setAttempts(res.data);
  };

  return (
    <div className="admin-card">
      <h2 className="admin-title">Exam Attempts</h2>
      <div className="admin-filter-bar">
        <select
          value={domain}
          onChange={(e) => {
            setDomain(e.target.value);
            loadLevels(e.target.value);
          }}
        >
          <option value="">Select Domain</option>

          {domains.map((d) => (
            <option key={d} value={d}>
              {d}
            </option>
          ))}
        </select>
        <select value={level} onChange={(e) => setLevel(e.target.value)}>
          <option value="">Select Level</option>

          {levels.map((l) => (
            <option key={l} value={l}>
              Level {l}
            </option>
          ))}
        </select>
        <button className="admin-primary-btn" onClick={loadAttempts}>
          Load Attempts
        </button>
      </div>
      <table className="admin-table">
        <thead>
          <tr>
            <th>User</th>
            <th>Email</th>
            <th>Score</th>
            <th>Date</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {attempts.map((a) => (
            <tr key={a._id}>
              <td>{a.user?.name}</td>

              <td>{a.user?.email}</td>

              <td>{a.score}</td>

              <td>{new Date(a.createdAt).toLocaleString()}</td>

              <td>
                <button
                  className="admin-action-btn"
                  onClick={() => navigate(`/admin/exam/${a._id}`)}
                >
                  View
                </button>{" "}
              </td>
            </tr>
          ))}
        </tbody>
        {attempts.length === 0 && (
          <tr>
            <td colSpan="5" style={{ textAlign: "center", padding: "25px" }}>
              No exam attempts found
            </td>
          </tr>
        )}
      </table>
    </div>
  );
}

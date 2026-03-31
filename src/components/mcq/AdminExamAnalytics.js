import React, { useEffect, useState } from "react";
import api from "../../auth/axiosInstance";
import { useNavigate } from "react-router-dom";
import "./AdminExamAnalytics.css";
export default function AdminExamAnalytics() {
  const [domains, setDomains] = useState([]);
  const [levels, setLevels] = useState([]);
  const [attempts, setAttempts] = useState([]);
  const [loading, setLoading] = useState(false);

  const [domain, setDomain] = useState("");
  const [level, setLevel] = useState("");
  const navigate = useNavigate();
  useEffect(() => {
    loadDomains();
  }, []);

  useEffect(() => {
    if (domain && level) {
      loadAttempts();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [domain, level]);
  const loadDomains = async () => {
    try {
      setLoading(true);

      const res = await api.get("/api/admin/exams/domains");

      setDomains(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadLevels = async (d) => {
    try {
      setLoading(true);

      const res = await api.get(`/api/admin/exams/levels/${d}`);

      setLevels(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const loadAttempts = async (d, l) => {
    try {
      setLoading(true);
      const res = await api.get(
        `/api/admin/exams/attempts?domain=${domain || d}&level=${level || l}`,
      );
      setAttempts(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };
  return (
    <div className="AdminExamAnalytics-container">
      <h2 className="AdminExamAnalytics-title">Exam Attempts</h2>
      <div className="AdminExamAnalytics-filters">
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
        <button
          className="AdminExamAnalytics-btn"
          onClick={loadAttempts}
          disabled={loading || !domain || !level}
        >
          {loading ? "Loading..." : "Load Attempts"}
        </button>{" "}
      </div>
      <div className="AdminExamAnalytics-tableWrapper">
        <table className="AdminExamAnalytics-table">
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
                <td data-label="User">
                  <span>{a.user?.name}</span>
                </td>
                <td data-label="Email">
                  <span>{a.user?.email}</span>
                </td>
                <td data-label="Score">
                  <span>{a.score}</span>
                </td>
                <td data-label="Date">
                  <span>{new Date(a.createdAt).toLocaleString()}</span>
                </td>
                <td data-label="Action">
                  <button
                    className="AdminExamAnalytics-viewBtn"
                    onClick={() =>
                      navigate(`/admin/exam/${a._id}`, {
                        state: { domain, level },
                      })
                    }
                  >
                    View
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>

        {attempts.length === 0 && !loading && (
          <div className="AdminExamAnalytics-empty">No attempts found</div>
        )}
      </div>
    </div>
  );
}

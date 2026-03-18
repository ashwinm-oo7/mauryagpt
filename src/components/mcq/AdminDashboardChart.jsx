import React, { useEffect, useState } from "react";
import "./AdminDashboardChart.css";
import api from "../../auth/axiosInstance";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
} from "recharts";
export default function AdminDashboardChart() {
  const [stats, setStats] = useState({
    totalAttempts: 0,
    avgScore: 0,
    domainStats: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    try {
      const res = await api.get("/api/admin/exams/analytics/summary");
      setStats(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  if (loading)
    return <div className="AdminDashboardChart-loading">Loading...</div>;

  return (
    <div className="AdminDashboardChart-container">
      <h2 className="AdminDashboardChart-title">Admin Dashboard</h2>

      {/* CARDS */}
      <div className="AdminDashboardChart-cards">
        <div className="AdminDashboardChart-card">
          <h3>Total Attempts</h3>
          <p>{stats.totalAttempts}</p>
        </div>

        <div className="AdminDashboardChart-card">
          <h3>Average Score</h3>
          <p>{stats.avgScore}</p>
        </div>
      </div>

      {/* DOMAIN STATS */}
      <div className="AdminDashboardChart-section">
        <h3>Attempts by Domain</h3>

        <div className="AdminDashboardChart-domainList">
          {stats.domainStats.map((d) => (
            <div key={d._id} className="AdminDashboardChart-domainItem">
              <span>{d._id}</span>
              <span>{d.count}</span>
            </div>
          ))}
        </div>
        <div className="AdminDashboardChart-charts">
          {/* BAR CHART */}
          <div className="AdminDashboardChart-chartCard">
            <h3>Attempts by Domain</h3>

            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={stats.domainStats}>
                <XAxis dataKey="_id" />
                <YAxis />
                <Tooltip />
                <Bar dataKey="count" fill="#6366f1" />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* PIE CHART */}
          <div className="AdminDashboardChart-chartCard">
            <h3>Distribution</h3>

            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={stats.domainStats}
                  dataKey="count"
                  nameKey="_id"
                  outerRadius={100}
                >
                  {stats.domainStats.map((_, i) => (
                    <Cell
                      key={i}
                      fill={["#6366f1", "#22c55e", "#f59e0b", "#ef4444"][i % 4]}
                    />
                  ))}
                </Pie>
                <Tooltip />
              </PieChart>
            </ResponsiveContainer>
          </div>
        </div>
      </div>
    </div>
  );
}

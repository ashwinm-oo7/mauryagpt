import React, { useEffect, useState } from "react";
import api from "../../auth/axiosInstance";

export default function UserBadges() {
  const [badges, setBadges] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    setLoading(true);
    setError("");

    try {
      const res = await api.get("/api/exam/badges");

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to load badges");
      }

      setBadges(res.data.data || []);
    } catch (err) {
      console.error("Badges load error:", err);

      setError(
        err?.response?.data?.message || err.message || "Failed to load badges",
      );
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <p>Loading badges...</p>;

  if (error) return <p style={{ color: "red" }}>{error}</p>;

  return (
    <div className="user-badges">
      <h2>My Badges</h2>

      {badges.length === 0 ? (
        <p>No badges earned yet</p>
      ) : (
        badges.map((b, i) => (
          <div key={i} className="badge-card">
            🏅 {b.domain} Level {b.level}
          </div>
        ))
      )}
    </div>
  );
}

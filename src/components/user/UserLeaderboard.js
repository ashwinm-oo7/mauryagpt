import React, { useEffect, useState } from "react";
import api from "../../auth/axiosInstance";

export default function UserLeaderboard() {
  const [users, setUsers] = useState([]);

  useEffect(() => {
    load();
  }, []);

  const load = async () => {
    const res = await api.get("/api/exam/leaderboard/MERN");

    setUsers(res.data);
  };

  return (
    <div className="leaderboard-item">
      {" "}
      <h2>Leaderboard</h2>
      {users.map((u, i) => (
        <div key={i}>
          #{i + 1} {u.user.email} — {u.percentage}%
        </div>
      ))}
    </div>
  );
}

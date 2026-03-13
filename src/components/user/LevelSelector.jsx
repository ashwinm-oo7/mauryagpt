import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../auth/axiosInstance";
import "./css/LevelSelector.css";
const LevelSelector = () => {
  const { domain } = useParams();
  const [levels, setLevels] = useState([]);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await api.get(`/api/mcq?domain=${domain}`);
        const uniqueLevels = Array.from(
          new Set(res.data.map((q) => q.level)),
        ).sort((a, b) => a - b);
        setLevels(uniqueLevels);
      } catch {
        toast.error("Failed to load levels");
      }
    };
    fetchLevels();
  }, [domain]);

  const startExam = async (level) => {
    try {
      const res = await api.post("/api/exam/start", { domain, level });
      console.log("Exam start response:", res.data);

      if (!res.data.examId) {
        toast.error("Failed to get exam ID from server");
        return;
      }

      navigate(`/user/test/${domain}/${level}`, {
        state: { examId: res.data.examId },
      });
    } catch (err) {
      console.error(err);
      toast.error("Failed to start exam");
    }
  };
  return (
    <div className="container">
      <h2>{domain} - Select Level</h2>
      <ul className="level-list">
        {levels.map((lvl) => (
          <li key={lvl}>
            <button onClick={() => startExam(lvl)}>Level {lvl}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LevelSelector;

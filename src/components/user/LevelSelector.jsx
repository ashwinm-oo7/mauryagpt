import React, { useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../auth/axiosInstance";
import "./css/LevelSelector.css";
import confetti from "canvas-confetti";

const LevelSelector = () => {
  const { domain } = useParams();
  const [levels, setLevels] = useState([]);
  const navigate = useNavigate();

  // useEffect(() => {
  //   const fetchLevels = async () => {
  //     try {
  //       const res = await api.get(`/api/mcq?domain=${domain}`);
  //       const uniqueLevels = Array.from(
  //         new Set(res.data.map((q) => q.level)),
  //       ).sort((a, b) => a - b);
  //       setLevels(uniqueLevels);
  //     } catch {
  //       toast.error("Failed to load levels");
  //     }
  //   };
  //   fetchLevels();
  // }, [domain]);

  useEffect(() => {
    const fetchLevels = async () => {
      try {
        const res = await api.get(`/api/mcq/levels/${domain}`);
        setLevels(res.data);
      } catch {
        toast.error("Failed to load levels");
      }
    };
    fetchLevels();
  }, [domain]);

  const startExam = async (level) => {
    try {
      confetti({
        particleCount: 120,
        spread: 70,
        origin: { y: 0.6 },
      });

      const res = await api.post("/api/exam/start", { domain, level });
      console.log("Exam start response:", res.data);

      if (!res.data.examId) {
        toast.error("Failed to get exam ID from server");
        return;
      }
      localStorage.setItem("examId", res.data.examId);
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
          <li key={lvl.level}>
            <button
              disabled={!lvl.unlocked}
              className={`
      ${lvl.unlocked ? "level-list-active" : "level-list-locked"}
      ${lvl.completed ? "level-completed" : ""}
    `}
              onClick={() => startExam(lvl.level)}
            >
              Level {lvl.level} <span>{lvl.unlocked ? "🔓" : "🔒"}</span>
            </button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default LevelSelector;

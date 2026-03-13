import React, { useEffect } from "react";
import "./css/Timer.css";

const Timer = ({ timeLeft, onTimeOut }) => {
  useEffect(() => {
    if (timeLeft <= 0) {
      onTimeOut();
    }
  }, [timeLeft, onTimeOut]);

  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;

  const radius = 45;
  const circumference = 2 * Math.PI * radius;
  const progress = circumference - (timeLeft / 3600) * circumference;

  return (
    <div className="timer-container">
      <svg className="timer-svg">
        <circle className="timer-bg" cx="50" cy="50" r={radius} />
        <circle
          className="timer-progress"
          cx="50"
          cy="50"
          r={radius}
          strokeDasharray={circumference}
          strokeDashoffset={progress}
        />
      </svg>

      <div className="timer-text">
        {minutes}:{seconds.toString().padStart(2, "0")}
      </div>
    </div>
  );
};

export default Timer;

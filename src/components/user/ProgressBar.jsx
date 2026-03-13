import React from "react";
import "./css/ProgressBar.css";
const ProgressBar = ({ currentStep, totalSteps }) => {
  const progressPercent = ((currentStep + 1) / totalSteps) * 100;

  return (
    <div className="progress-container">
      <div className="progress-bar" style={{ width: `${progressPercent}%` }} />
      <span className="progress-text">
        Question {currentStep + 1} of {totalSteps}
      </span>
    </div>
  );
};

export default ProgressBar;

import React from "react";
import "./css/QuestionNavigationPanel.css";
const QuestionNavigationPanel = ({
  totalSteps,
  currentStep,
  answers,
  visited,
  onJump,
}) => {
  return (
    <div className="question-nav-panel">
      {Array.from({ length: totalSteps }, (_, i) => {
        let status = "";

        if (currentStep === i) status = "active";
        else if (answers[i]) status = "answered";
        else if (visited[i]) status = "visited";

        return (
          <button
            key={i}
            className={`nav-btn ${status}`}
            onClick={() => onJump(i || 0)}
          >
            {i || 0 + 1}
          </button>
        );
      })}
    </div>
  );
};

export default QuestionNavigationPanel;

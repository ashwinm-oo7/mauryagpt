import React from "react";
import "./css/QuestionPalette.css";

const QuestionPalette = ({
  questions,
  answers,
  visited,
  currentStep,
  onJump,
}) => {
  return (
    <div className="palette">
      <h4>Question Palette</h4>

      <div className="palette-grid">
        {questions.map((q, i) => {
          let status = "notvisited";

          if (currentStep === i) status = "current";
          else if (answers[q._id]) status = "answered";
          else if (visited[i]) status = "visited";

          return (
            <button
              key={i}
              className={`palette-btn ${status}`}
              onClick={() => onJump(i)}
            >
              {i + 1}
            </button>
          );
        })}
      </div>

      <div className="legend">
        <p>
          <span className="l answered" /> Answered
        </p>
        <p>
          <span className="l visited" /> Visited
        </p>
        <p>
          <span className="l notvisited" /> Not Visited
        </p>
        <p>
          <span className="l current" /> Current
        </p>
      </div>
    </div>
  );
};

export default QuestionPalette;

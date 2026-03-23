import React from "react";
import "./css/QuestionCard.css";
// import NavigationButtons from "./NavigationButtons";
const QuestionCard = ({
  questionData,
  selectedAnswer,
  onAnswerSelect,
  toggleFlag,
  flagged,
  mode,
  currentStep,
  totalSteps,
  onPrev,
  onNext,
  onSubmit,
}) => {
  const { question, options, correctAnswer } = questionData;
  if (!questionData) {
    return <p>Loading question...</p>;
  }

  return (
    <div className="question-card" style={{ userSelect: "none" }}>
      <p>
        <b>{questionData.step || ""} Q:</b> {question}
      </p>

      <ul>
        {options.map((opt, i) => {
          const optLetter = String.fromCharCode(65 + i);
          const isCorrect = correctAnswer === optLetter;
          const isUserAnswer = selectedAnswer === optLetter;

          let color = "black";
          if (mode === "result") {
            if (isCorrect) color = "green";
            else if (isUserAnswer && !isCorrect) color = "red";
          }

          return (
            <li key={i} style={{ color }}>
              {mode === "test" ? (
                <label className="question-card-label">
                  <input
                    onChange={() => onAnswerSelect(questionData._id, optLetter)}
                    type="radio"
                    name={questionData._id}
                    value={optLetter}
                    checked={selectedAnswer === optLetter}
                  />
                  {optLetter}. {opt}
                </label>
              ) : (
                <>
                  {optLetter}. {opt} {isCorrect ? "(Correct)" : ""}{" "}
                  {isUserAnswer && !isCorrect ? "(Your Answer)" : ""}
                </>
              )}
            </li>
          );
        })}
      </ul>

      {mode === "test" && (
        <button
          className={`flag-btn ${flagged[questionData._id] ? "flagged" : ""}`}
          onClick={() => toggleFlag(questionData._id)}
        >
          🚩 {flagged[questionData._id] ? "Flagged" : "Mark for Review"}
        </button>
      )}
      {/* <NavigationButtons
          currentStep={currentStep}
          totalSteps={totalSteps}
          onPrev={onPrev}
          onNext={onNext}
          onSubmit={onSubmit}
        /> */}

      {mode === "result" && (
        <p>
          <b>Explanation:</b> {questionData.explanation}
        </p>
      )}
    </div>
  );
};

export default QuestionCard;

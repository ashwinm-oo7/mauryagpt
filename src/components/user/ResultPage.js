import React from "react";
import { useLocation, useNavigate } from "react-router-dom";
import QuestionCard from "./QuestionCard";

const ResultPage = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { questions, answers } = location.state;

  const score = questions.filter(
    (q) => answers[q._id] === q.correctAnswer,
  ).length;

  return (
    <div className="container">
      <h1>Result</h1>
      <p>
        Score: {score} / {questions.length}
      </p>

      {questions.map((q) => (
        <QuestionCard
          key={q._id}
          questionData={q}
          selectedAnswer={answers[q._id]}
          mode="result"
        />
      ))}

      <button onClick={() => navigate("/")}>Back to Dashboard</button>
    </div>
  );
};

export default ResultPage;

import React from "react";
import { useParams } from "react-router-dom";
import "./AdminAttemptViewer.css";
import { useAdminAttempt } from "./useAdminAttempt";
import { useNavigate } from "react-router-dom";
export default function AdminAttemptViewer() {
  const { examId } = useParams();
  const navigate = useNavigate();
  // const location = useLocation();
  const { exam, questions, loading, error } = useAdminAttempt(examId);
  if (loading) return <div className="loading">Loading Attempt...</div>;
  if (error) return <div className="error">{error}</div>;
  if (!exam) return null;
  // const handleBack = () => {
  //   if (location.state?.domain && location.state?.level) {
  //     navigate("/admin/exam-analytics", {
  //       state: location.state,
  //     });
  //   } else {
  //     navigate(-1);
  //   }
  // };
  const totalQuestions = questions.length;
  const scorePercent =
    totalQuestions > 0 ? (exam.score / totalQuestions) * 100 : 0;
  return (
    <div className="attempt-container">
      <h2 className="attempt-title">Exam Attempt Review</h2>
      <button className="back-btn" onClick={() => navigate(-1)}>
        ← Back
      </button>
      {/* USER INFO */}
      <div className="attempt-info">
        <div className="info-grid">
          <div>
            <b>User:</b> {exam.user?.name}
          </div>
          <div>
            <b>Email:</b> {exam.user?.email}
          </div>
          <div>
            <b>Domain:</b> {exam.domain}
          </div>
          <div>
            <b>Level:</b> {exam.level}
          </div>
        </div>

        {/* SCORE */}
        <div className="score-section">
          <div className="score-text">
            Score: {exam.score} / {totalQuestions}
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill"
              style={{ width: `${scorePercent}%` }}
            />
          </div>

          <div className="progress-percent">{Math.round(scorePercent)}%</div>
        </div>
      </div>

      {/* QUESTIONS */}
      <div className="questions-list">
        {questions.map((q, index) => {
          const answer = exam.answers.find(
            (a) => a.questionId.toString() === q._id.toString(),
          );

          const userAnswer = answer?.selectedAnswer;
          const correct = q.correctAnswer;

          const isCorrect = userAnswer === correct;

          return (
            <div
              key={q._id}
              className={`admin-question-card ${
                isCorrect ? "correct" : "wrong"
              }`}
            >
              <h4 className="admin-question-title">
                Q{index + 1}. {q.question}
              </h4>

              <ul className="admin-options-list">
                {q.options.map((opt, i) => {
                  const letter = ["A", "B", "C", "D"][i];

                  let className = "admin-option";

                  // Correct answer (always green)
                  if (letter === correct) {
                    className += " correct-option";
                  }

                  // If user selected wrong option
                  if (letter === userAnswer && userAnswer !== correct) {
                    className += " user-option";
                  }

                  return (
                    <li key={i} className={className}>
                      <span className="admin-option-letter">{letter}</span>
                      {opt}
                    </li>
                  );
                })}
              </ul>

              <div className="answer-meta">
                <p className="explain-card-p">
                  <b>User Answer:</b> {userAnswer || "Not Answered"}
                </p>

                <p className="explain-card-p">
                  <b>Correct Answer:</b> {correct}
                </p>
              </div>

              <p className="explanation">
                <b>Explanation:</b> {q.explanation}
              </p>
            </div>
          );
        })}
      </div>
    </div>
  );
}

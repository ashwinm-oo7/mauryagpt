import React from "react";
import "./suggestions.css";

export default function SuggestedQuestions({ onSelect }) {
  const quickQuestions = [
    "What is CompanyHeader?",
    "What is PageHeader?",
    "What is Details?",
    "What is ReportFooter?",
    "Show example of CompanyHeader",
    "Show example of PageHeader",
    "Generate pageheader for repcode inwe table asab9",
    "Explain line and vline",
  ];

  return (
    <div className="suggest-box">
      <h3 className="suggest-title">💬 Suggested Questions</h3>

      <div className="suggest-grid">
        {quickQuestions.map((q, i) => (
          <button key={i} className="suggest-btn" onClick={() => onSelect(q)}>
            {q}
          </button>
        ))}
      </div>
    </div>
  );
}

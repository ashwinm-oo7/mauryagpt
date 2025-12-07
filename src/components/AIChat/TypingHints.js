import React from "react";
import "./suggestions.css";

export default function TypingHints({ text, onSelect }) {
  if (!text) return null;

  const lower = text.toLowerCase();

  let hints = [];

  if (lower.startsWith("co")) {
    hints = [
      "What is CompanyHeader?",
      "Example CompanyHeader",
      "Generate companyheader SQL",
    ];
  } else if (lower.startsWith("pa")) {
    hints = [
      "What is PageHeader?",
      "Example PageHeader",
      "Generate pageheader SQL",
    ];
  } else if (lower.startsWith("de")) {
    hints = ["What is Details?", "Example Details view"];
  } else if (lower.startsWith("re")) {
    hints = ["What is ReportFooter?", "Example reportfooter view"];
  } else if (lower.startsWith("ge")) {
    hints = ["Generate pageheader SQL", "Generate companyheader SQL"];
  }

  if (!hints.length) return null;

  return (
    <div className="typing-hints">
      {hints.map((h, i) => (
        <div key={i} className="hint-item" onClick={() => onSelect(h)}>
          {h}
        </div>
      ))}
    </div>
  );
}

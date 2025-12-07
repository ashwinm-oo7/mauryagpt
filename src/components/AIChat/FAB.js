import React from "react";
import "./fab.css";

export default function FAB({ onSelect }) {
  return (
    <div className="fab-container">
      <button
        className="fab-btn"
        onClick={() => onSelect("generate pageheader sql")}
      >
        ⚙ Generate SQL
      </button>

      <button
        className="fab-btn"
        onClick={() => onSelect("explain colname bname sabid")}
      >
        ❓ Explain Field
      </button>

      <button
        className="fab-btn"
        onClick={() => onSelect("show example of pageheader")}
      >
        📄 Example
      </button>
    </div>
  );
}

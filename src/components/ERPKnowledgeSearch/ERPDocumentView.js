import React from "react";
import "./erpSearch.css";

export default function ERPDocumentView({ doc, back }) {
  return (
    <div className="erp-doc-box">
      <button onClick={back} className="erp-back-btn">
        ← Back
      </button>

      <h2 className="erp-doc-title">{doc.title}</h2>
      <div className="erp-doc-type">Type: {doc.type}</div>

      <pre className="erp-doc-content">{JSON.stringify(doc.raw, null, 2)}</pre>
    </div>
  );
}

import React, { useState } from "react";
import "./erpSearch.css";
import ERPDocumentView from "./ERPDocumentView";

const API_BASE = `${process.env.REACT_APP_URL}/search-engine`;

export default function ERPKnowledgeSearch() {
  const [q, setQ] = useState("");
  const [loading, setLoading] = useState(false);
  const [results, setResults] = useState([]);
  const [selectedDoc, setSelectedDoc] = useState(null);
  const [generatedSQL, setGeneratedSQL] = useState("");
  const [explanation, setExplanation] = useState("");
  const [mode, setMode] = useState("");

  const generateSQL = async () => {
    setExplanation("");
    setSelectedDoc(null);
    setResults([]);

    const res = await fetch(
      `${process.env.REACT_APP_URL}/ai-generator/generate-view`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text: q }),
      }
    );

    const data = await res.json();
    setMode("sql");
    setGeneratedSQL(data.sql || "❌ No SQL Generated");
  };

  const search = async () => {
    if (!q.trim()) return;

    setLoading(true);
    setSelectedDoc(null);
    setGeneratedSQL("");
    setExplanation("");

    try {
      const res = await fetch(`${API_BASE}/search?q=${encodeURIComponent(q)}`);
      const data = await res.json();

      console.log("Search output:", data);

      setMode(data.mode);

      if (data.mode === "question") {
        setExplanation(data.explanation);
        setResults([]);
      } else {
        setResults(data.results || []);
      }
    } catch (e) {
      console.error("Search error:", e);
    }

    setLoading(false);
  };

  const openDoc = async (id) => {
    const res = await fetch(`${API_BASE}/doc/${id}`);
    const data = await res.json();
    setSelectedDoc(data);
  };

  return (
    <div className="erp-container">
      <h1 className="erp-title">ERP Knowledge Search</h1>

      {/* SEARCH BAR */}
      <div className="erp-search-box">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Ask anything… e.g., 'format of pageheader view'"
          className="erp-input"
        />
        <button className="erp-btn" onClick={search}>
          Search
        </button>
        <button className="erp-btn" onClick={generateSQL}>
          Generate SQL
        </button>
      </div>

      {loading && <div className="erp-loading">⏳ Searching…</div>}

      {/* ================================
             MODE: QUESTION EXPLANATION
         ================================= */}
      {mode === "question" && explanation && (
        <div className="erp-explain-box">
          <h3>📘 Explanation</h3>
          <pre className="erp-doc-content">{explanation}</pre>
        </div>
      )}

      {/* ================================
             MODE: SQL GENERATOR
         ================================= */}
      {mode === "sql" && (
        <div className="erp-explain-box">
          <h3>🛠️ Generated SQL</h3>
          <pre className="erp-doc-content">{generatedSQL}</pre>
        </div>
      )}

      {/* ================================
             MODE: SEARCH RESULTS
         ================================= */}
      {mode === "search" && results.length > 0 && (
        <div className="erp-results">
          {results.map((r, index) => (
            <div
              key={index}
              className="erp-result-card"
              onClick={() => openDoc(r.id)}
            >
              <div className="erp-result-title">{r.title}</div>
              <div className="erp-result-type">{r.type}</div>
              <div className="erp-result-snippet">{r.snippet}</div>
            </div>
          ))}
        </div>
      )}

      {/* No results case */}
      {mode === "search" && results.length === 0 && !loading && (
        <div className="erp-no-results">❌ No results found.</div>
      )}

      {/* ================================
             DOCUMENT VIEWER
         ================================= */}
      {selectedDoc && (
        <ERPDocumentView doc={selectedDoc} back={() => setSelectedDoc(null)} />
      )}
    </div>
  );
}

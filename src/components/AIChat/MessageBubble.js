// src/components/AIChat/MessageBubble.js
import React, { useState } from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
// 1) IMPORT SQL LANGUAGE + THEME
import sqlLang from "react-syntax-highlighter/dist/esm/languages/hljs/sql";
import atomOneLight from "react-syntax-highlighter/dist/esm/styles/hljs/atom-one-light";

import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
SyntaxHighlighter.registerLanguage("sql", sqlLang);

export default function MessageBubble({ role, text, timestamp }) {
  const isUser = role === "user";
  const time = timestamp || "";
  const cls = isUser ? "msg-row user" : "msg-row assistant";

  // Detect SQL even if NOT fenced inside ```sql
  const looksLikeSQL =
    /^\s*create\s+view/i.test(text) ||
    /^\s*select/i.test(text) ||
    /^\s*update/i.test(text) ||
    /^\s*delete/i.test(text) ||
    /^\s*insert/i.test(text);

  // If it's plain SQL → show SQLBlock directly
  if (!isUser && looksLikeSQL) {
    return (
      <div className={cls}>
        <div className="bubble">
          <div className="model-tag">Maurya-AI</div>
          <SQLBlock sql={text} />
          <div className="bubble-footer">
            <span className="timestamp">{time}</span>
          </div>
        </div>
      </div>
    );
  }

  // Otherwise → normal markdown message
  return (
    <div className={cls}>
      <div className="bubble">
        {!isUser && <div className="model-tag">Maurya-AI</div>}

        <div className={`bubble-text bubble-${role}`}>
          <ReactMarkdown
            remarkPlugins={[remarkGfm]}
            components={{
              code({ inline, className, children, ...props }) {
                const language = className?.replace("language-", "");

                if (inline || language !== "sql") {
                  return (
                    <code className={className} {...props}>
                      {children}
                    </code>
                  );
                }

                const sqlText = String(children).replace(/\n$/, "");
                return <SQLBlock sql={sqlText} />;
              },
            }}
          >
            {text}
          </ReactMarkdown>
        </div>

        <div className="bubble-footer">
          <span className="timestamp">{time}</span>
        </div>
      </div>
    </div>
  );
}

/* -----------------------------
   SQL BLOCK COMPONENT
------------------------------ */
function SQLBlock({ sql }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(sql);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div style={{ position: "relative", marginTop: "4px" }}>
      <button
        className="copy-btn"
        onClick={handleCopy}
        style={{
          position: "absolute",
          right: "10px",
          top: "8px",
          padding: "4px 10px",
          background: "#2563eb",
          color: "white",
          borderRadius: "6px",
          border: "none",
          cursor: "pointer",
          zIndex: 1,
        }}
      >
        {copied ? "Copied!" : "Copy"}
      </button>

      <SyntaxHighlighter
        language="sql"
        style={atomOneLight}
        customStyle={{
          borderRadius: "10px",
          padding: "5px",
          fontSize: "14px",
          lineHeight: "1.5",
          background: "#f8fafc", // clean light background
          border: "1px solid #e5e7eb", // light border like ChatGPT
          overflowX: "auto",
        }}
        // showLineNumbers={false}
      >
        {sql}
      </SyntaxHighlighter>
    </div>
  );
}

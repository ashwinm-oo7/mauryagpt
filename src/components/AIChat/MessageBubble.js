// src/components/AIChat/MessageBubble.js
import React from "react";
import { Light as SyntaxHighlighter } from "react-syntax-highlighter";
// choose a style you like:
import sqlStyle from "react-syntax-highlighter/dist/esm/styles/hljs/atom-one-dark";

export default function MessageBubble({ role, text }) {
  const isUser = role === "user";
  const cls = isUser
    ? "msg-row user"
    : role === "assistant"
    ? "msg-row assistant"
    : "msg-row system";

  const isSQL =
    typeof text === "string" &&
    (/\bcreate\s+view\b/i.test(text) || /\bselect\b/i.test(text));

  return (
    <div className={cls}>
      <div className="bubble">
        {isSQL ? (
          <>
            <div className="sql-header">Generated SQL</div>
            <SyntaxHighlighter
              language="sql"
              style={sqlStyle}
              customStyle={{
                borderRadius: 8,
                padding: 12,
                background: "#f5f7fa",
                fontSize: "14px",
              }}
            >
              {text}
            </SyntaxHighlighter>
          </>
        ) : (
          <div className="bubble-text">{text}</div>
        )}
      </div>
    </div>
  );
}

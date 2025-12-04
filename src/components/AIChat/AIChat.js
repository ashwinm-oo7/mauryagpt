// src/components/AIChat/AIChat.js
import React, { useState, useRef, useEffect } from "react";
import "./aiChat.css";
import MessageBubble from "./MessageBubble";

const API = `${process.env.REACT_APP_URL}/ai/ask`;
const STORAGE_KEY = "maurya_ai_chat_v1";

function saveConversation(messages) {
  try {
    const data = JSON.stringify(messages);
    localStorage.setItem(STORAGE_KEY, data);
  } catch (e) {
    console.warn("save failed", e);
  }
}

function loadConversation() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    return JSON.parse(raw);
  } catch (e) {
    console.warn("load failed", e);
    return null;
  }
}

export default function AIChat() {
  const [input, setInput] = useState("");
  const [messages, setMessages] = useState([
    {
      id: "sys-1",
      role: "assistant",
      text: "Hi — ask me about report views, SQL generation, formats or generate a view for you.",
    },
  ]);
  const [loading, setLoading] = useState(false);
  const containerRef = useRef(null);
  const saved = loadConversation();
  useEffect(() => {
    saveConversation(messages);
  }, [messages]);

  useEffect(() => {
    // auto-scroll to bottom when messages update
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight + 200;
    }
  }, [messages, loading]);

  const send = async (evt) => {
    if (evt) evt.preventDefault();
    const text = input.trim();
    if (!text) return;

    // add user message
    const userMsg = { id: `u-${Date.now()}`, role: "user", text };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    // call backend
    try {
      const res = await fetch(API, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ text }),
      });
      const data = await res.json();

      // build assistant reply depending on backend shape
      let assistantText = "";
      if (data.answer) {
        assistantText = data.answer;
      } else if (data.mode === "SQL_GEN" || data.mode === "sql") {
        assistantText = data.answer || data.sql || "No SQL generated.";
      } else if (
        data.mode === "EXPLAIN" ||
        data.mode === "EXPLANATION" ||
        data.mode === "EXPLAIN"
      ) {
        assistantText =
          data.answer || data.explanation || "Explanation unavailable.";
      } else if (data.mode === "SEARCH" || data.mode === "search") {
        // fallback: show search results or instruction
        if (Array.isArray(data.results) && data.results.length) {
          assistantText =
            "I found some documents — click a result in the Knowledge tab.";
        } else {
          assistantText =
            "I couldn't find a direct doc. Try: 'generate pageheader repcode inwe table asab9' or ask for format.";
        }
      } else {
        // generic fallback
        assistantText =
          data.answer ||
          data.explanation ||
          (data.message ? data.message : "No response.");
      }

      // if assistantText looks like SQL, keep it; you may want to format differently
      const assistantMsg = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: assistantText,
      };
      setMessages((prev) => [...prev, assistantMsg]);
    } catch (err) {
      console.error("AI call failed:", err);
      setMessages((prev) => [
        ...prev,
        {
          id: `a-err-${Date.now()}`,
          role: "assistant",
          text: "Sorry — failed to get reply from server.",
        },
      ]);
    } finally {
      setLoading(false);
    }
  };

  const clearChat = () => {
    setMessages([
      {
        id: "sys-1",
        role: "assistant",
        text: "Hi — ask me about report views, SQL generation, formats or generate a view for you.",
      },
    ]);
  };

  return (
    <div className="ai-wrap">
      <div className="ai-header">
        <div className="ai-title">Maurya AI — ERP Assistant</div>
        <div className="ai-actions">
          <button className="ai-clear" onClick={clearChat}>
            New
          </button>
          <button
            className="ai-save"
            onClick={() => {
              saveConversation(messages);
              alert("Saved");
            }}
          >
            Save
          </button>
          <button
            className="ai-export"
            onClick={() => {
              const blob = new Blob([JSON.stringify(messages, null, 2)], {
                type: "application/json",
              });
              const url = URL.createObjectURL(blob);
              const a = document.createElement("a");
              a.href = url;
              a.download = "maurya_chat.json";
              a.click();
              URL.revokeObjectURL(url);
            }}
          >
            Export
          </button>

          {/* And import */}
          <input
            type="file"
            accept="application/json"
            onChange={async (e) => {
              const f = e.target.files?.[0];
              if (!f) return;
              const txt = await f.text();
              try {
                const imported = JSON.parse(txt);
                if (Array.isArray(imported)) {
                  setMessages(imported);
                  saveConversation(imported);
                  alert("Imported");
                } else alert("Invalid file");
              } catch (err) {
                alert("Invalid JSON");
              }
            }}
          />
        </div>
      </div>

      <div className="ai-body" ref={containerRef}>
        {messages.map((m) => (
          <MessageBubble key={m.id} role={m.role} text={m.text} />
        ))}
        {loading && (
          <div className="ai-loading-row">
            <div className="loading-dot" />
            <div className="loading-dot" />
            <div className="loading-dot" />
          </div>
        )}
      </div>

      <form className="ai-input-area" onSubmit={send}>
        <input
          className="ai-input"
          placeholder="Ask (example: 'generate pageheader for repcode inwe table asab9' or 'what is the pageheader format?')"
          value={input}
          onChange={(e) => setInput(e.target.value)}
        />
        <button type="submit" className="ai-send" disabled={loading}>
          Send
        </button>
      </form>
    </div>
  );
}

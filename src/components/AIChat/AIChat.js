// src/components/AIChat/AIChat.js
import React, { useState, useRef, useEffect } from "react";
import "./aiChat.css";
import MessageBubble from "./MessageBubble";
import AutoGrowTextarea from "./AutoGrowTextarea";
import SuggestedQuestions from "./SuggestedQuestions";
import TypingHints from "./TypingHints";
import Sidebar from "./Sidebar";
import Wizard from "./Wizard";
import FAB from "./FAB";

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
  const [dark, setDark] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(true); // NEW: sidebar toggle

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
  const isFirstLoad = messages.length === 1; // Only system message exists
  useEffect(() => {
    saveConversation(messages);
  }, [messages]);

  useEffect(() => {
    // auto-scroll to bottom when messages update
    if (containerRef.current) {
      containerRef.current.scrollTop = containerRef.current.scrollHeight + 200;
    }
  }, [messages, loading]);

  const send = async (evt, forceText) => {
    if (evt) evt.preventDefault();
    const text = forceText ? forceText : input.trim();
    if (!text) return;

    // add user message
    const userMsg = {
      id: `u-${Date.now()}`,
      role: "user",
      text,
      timestamp: new Date().toLocaleTimeString(),
    };
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
      let assistantText =
        data.answer ||
        data.sql ||
        data.explanation ||
        data.message ||
        "No response.";
      // if (data.answer) {
      //   assistantText = data.answer;
      // } else if (data.mode === "SQL_GEN" || data.mode === "sql") {
      //   assistantText = data.answer || data.sql || "No SQL generated.";
      // } else if (
      //   data.mode === "EXPLAIN" ||
      //   data.mode === "EXPLANATION" ||
      //   data.mode === "EXPLAIN"
      // ) {
      //   assistantText =
      //     data.answer || data.explanation || "Explanation unavailable.";
      // } else if (data.mode === "SEARCH" || data.mode === "search") {
      //   if (Array.isArray(data.results) && data.results.length) {
      //     assistantText =
      //       "I found some documents — click a result in the Knowledge tab.";
      //   } else {
      //     assistantText =
      //       "I couldn't find a direct doc. Try: 'generate pageheader repcode inwe table asab9' or ask for format.";
      //   }
      // } else {
      //   assistantText =
      //     data.answer ||
      //     data.explanation ||
      //     (data.message ? data.message : "No response.");
      // }

      // if assistantText looks like SQL, keep it; you may want to format differently

      const assistantMsg = {
        id: `a-${Date.now()}`,
        role: "assistant",
        text: assistantText,
        mode: data.mode, // <– ADD THIS
        timestamp: new Date().toLocaleTimeString(),
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
  const renderedMessages = React.useMemo(() => {
    return messages.map((m) => (
      <MessageBubble
        key={m.id}
        role={m.role}
        text={m.text}
        mode={m.mode}
        timestamp={m.timestamp}
      />
    ));
  }, [messages]);

  return (
    <div className={`ai-container ${dark ? "dark-mode" : ""}`}>
      {/* LEFT SIDEBAR */}
      <Sidebar
        className={`sidebar ${sidebarOpen ? "open" : ""}`}
        onSelect={(q) => {
          send(null, q);
          setSidebarOpen(false);
        }}
      />
      <div className={`ai-wrap ${sidebarOpen ? "with-sidebar" : ""}`}>
        <div className="ai-header">
          <div className="ai-title">Maurya AI — ERP Assistant</div>
          <div className="ai-actions">
            <button
              className={`hamburger ${sidebarOpen ? "open" : ""}`}
              onClick={() => setSidebarOpen(!sidebarOpen)}
            >
              <span></span>
              <span></span>
              <span></span>
            </button>

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
            <strong className="ai-import">Import</strong>
            <input
              className="ai-import"
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
            <button className="ai-toggle" onClick={() => setDark(!dark)}>
              {dark ? "Light" : "Dark"}
            </button>
          </div>
        </div>

        <div className="ai-body" ref={containerRef}>
          {isFirstLoad && (
            <SuggestedQuestions
              onSelect={(q) => {
                setInput(q);
                send({ preventDefault: () => {} }, q);
              }}
            />
          )}

          {renderedMessages}

          {loading && (
            <div className="typing-indicator">
              <span></span>
              <span></span>
              <span></span>
            </div>
          )}
        </div>

        <form className="ai-input-area" onSubmit={send}>
          <AutoGrowTextarea
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                send();
              }
            }}
          />
          <TypingHints
            text={input}
            onSelect={(q) => {
              setInput(q);
              send({ preventDefault: () => {} }, q);
            }}
          />

          <button type="submit" className="ai-send" disabled={loading}>
            Send
          </button>
        </form>
      </div>
      <Wizard onGenerate={(q) => send(null, q)} />

      {/* FLOATING ACTION BUTTONS */}
      <FAB onSelect={(q) => send(null, q)} />
    </div>
  );
}

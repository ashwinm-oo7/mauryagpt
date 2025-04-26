import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import "../css/style.css";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";

const Chats = () => {
  const { token } = useAuth(); // Access the token from context

  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);

  const messageEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);

  const scrollToBottom = () => {
    const container = messageEndRef.current?.parentElement;
    if (!container) return;

    const isAtBottom =
      container.scrollHeight - container.scrollTop <=
      container.clientHeight + 50;

    if (isAtBottom) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const stopTyping = () => {
    clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
  };

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const res = await fetch(`${process.env.REACT_APP_URL}/api/chat`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ messages: input }),
      });

      const data = await res.json();
      const fullText = data.content;
      let currentText = "";

      // Add a blank bot message first
      setMessages((prev) => [...prev, { role: "bot", content: "" }]);

      const typeCharByChar = () => {
        if (currentText.length < fullText.length) {
          currentText += fullText[currentText.length];
          setMessages((prev) => {
            const updated = [...prev];
            updated[updated.length - 1] = {
              role: "bot",
              content: currentText,
            };
            return updated;
          });

          typingTimeoutRef.current = setTimeout(typeCharByChar, 5); // 🏎️ speed boost!
        } else {
          setIsTyping(false);
        }
      };

      typeCharByChar();
    } catch (err) {
      console.error("Error:", err);
      setIsTyping(false);
    }
  };

  return (
    <>
      {!token && (
        <div>
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      )}
      <div className="chat-box">
        <div className="message-list">
          {messages.map((msg, i) => (
            <ChatMessage key={i} role={msg.role} content={msg.content} />
          ))}
          <div ref={messageEndRef} />
        </div>

        <form onSubmit={sendMessage} className="input-area">
          <input
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Ask anything..."
            disabled={isTyping}
          />
          <button type="submit" disabled={isTyping}>
            {isTyping ? "Typing..." : "Send"}
          </button>
          {isTyping && (
            <button type="button" onClick={stopTyping} className="stop-button">
              Stop
            </button>
          )}
        </form>
      </div>
    </>
  );
};

export default Chats;

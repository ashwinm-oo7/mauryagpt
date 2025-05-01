import React, { useEffect, useRef, useState } from "react";
import "../css/input.css";

const MessageInput = ({
  input,
  setInput,
  sendMessage,
  setMessages,
  isTyping,
  stopTyping,
  regenerateResponse,
  suggestions = [],
  handleSuggestionClick,
  replyingTo,
  handleCancelReply,
}) => {
  const [listening, setListening] = useState(false);
  const [dots, setDots] = useState("");
  const formRef = useRef(null);

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e?.preventDefault();
      sendMessage(e);
    }
  };
  // Animate typing dots "..." ➡️ "." ".." "..."
  useEffect(() => {
    if (!isTyping) {
      setDots("");
      return;
    }

    const interval = setInterval(() => {
      setDots((prev) => (prev.length >= 3 ? "" : prev + "."));
    }, 500);

    return () => clearInterval(interval);
  }, [isTyping]);

  // Voice recognition logic
  const startListening = () => {
    if (!("webkitSpeechRecognition" in window)) {
      alert("Voice recognition not supported in this browser");
      return;
    }
    const SpeechRecognition =
      window.SpeechRecognition || window.webkitSpeechRecognition;
    let recognition;

    if (SpeechRecognition) {
      recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = false;
      recognition.lang = "en-US";
    }

    recognition.start();
    setListening(true);

    recognition.onresult = (event) => {
      const speechResult = event.results[0][0].transcript;
      const updatedInput = input ? input + " " + speechResult : speechResult;
      setInput(updatedInput);
      setMessages((prev) => [...prev, { sender: "user", text: updatedInput }]); // Show in UI
      setTimeout(() => {
        formRef.current?.requestSubmit(); // Proper submit
      }, 100);
      // Auto-send after speaking

      setTimeout(() => {
        const fakeEvent = { preventDefault: () => {} };
        sendMessage(fakeEvent); // This will use current input value
      }, 100);
      setListening(false);
    };

    recognition.onerror = (event) => {
      console.error("Speech recognition error", event);
      setListening(false);
    };

    recognition.onend = () => {
      setListening(false);
    };
  };

  return (
    <div className="input-wrapper">
      <form onSubmit={sendMessage} ref={formRef} className="input-area">
        <textarea
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Type your message..."
          disabled={isTyping}
          rows={3}
        />

        <div className="buttons-right">
          <button
            type="button"
            className={`mic-button ${listening ? "listening" : ""}`}
            onClick={startListening}
            disabled={isTyping || listening}
          >
            🎤
          </button>
          {!isTyping && (
            <button type="submit" className="send-button" disabled={isTyping}>
              {isTyping ? dots : "➤"}
            </button>
          )}
          {isTyping && (
            <button
              type="button"
              onClick={stopTyping}
              className="send-button"
              // disabled={isTyping}
            >
              {!isTyping ? "➤" : dots}
            </button>
          )}
        </div>
      </form>

      <div className="bottom-buttons">
        <button
          type="button"
          className="regenerate-button"
          onClick={regenerateResponse}
        >
          🔄 Regenerate Response
        </button>

        <div className="suggestions">
          {suggestions.map((suggestion, idx) => (
            <button
              key={idx}
              type="button"
              className="suggestion-button"
              onClick={() => handleSuggestionClick(suggestion)}
            >
              {suggestion}
            </button>
          ))}
        </div>
      </div>
    </div>
  );
};

export default MessageInput;

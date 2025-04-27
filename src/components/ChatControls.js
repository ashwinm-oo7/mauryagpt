import React from "react";

const ChatControls = ({
  input,
  setInput,
  sendMessage,
  downloadChatAsPDF,
  isTyping,
}) => {
  return (
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
      <button
        type="button"
        onClick={downloadChatAsPDF}
        className="download-button"
      >
        Download Chat
      </button>
    </form>
  );
};

export default ChatControls;

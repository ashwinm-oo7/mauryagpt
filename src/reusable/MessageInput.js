import React from "react";
import "../css/chats.css";

const MessageInput = ({
  input,
  setInput,
  sendMessage,
  isTyping,
  stopTyping,
  clearConversation,
  downloadChatAsPDF,
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
      {/* <button
        type="button"
        onClick={clearConversation}
        className="clear-button"
      >
        Clear Chat
      </button> */}
      {/* <button
        type="button"
        onClick={downloadChatAsPDF}
        className="download-button"
      >
        Download Chat
      </button> */}

      {isTyping && (
        <button type="button" onClick={stopTyping} className="stop-button">
          Stop
        </button>
      )}
    </form>
  );
};

export default MessageInput;

import React from "react";

const MessageInput = ({
  userMessage,
  setUserMessage,
  sendMessage,
  loading,
}) => {
  const handleSubmit = (e) => {
    e.preventDefault();
    sendMessage(userMessage);
  };

  return (
    <div className="message-input">
      <form onSubmit={handleSubmit}>
        <textarea
          value={userMessage}
          onChange={(e) => setUserMessage(e.target.value)}
          placeholder="Enter your message..."
          rows="4"
          cols="50"
          disabled={loading}
        />
        <button type="submit" disabled={loading}>
          {loading ? "Sending..." : "Send Message"}
        </button>
      </form>
    </div>
  );
};

export default MessageInput;

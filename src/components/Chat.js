import React, { useState } from "react";
import ChatMessage from "./ChatMessage";
import "../css/style.css"; // you can define custom styles

const Chat = () => {
  const [messages, setMessages] = useState([]);
  const [input, setInput] = useState("");

  const sendMessage = async (e) => {
    e.preventDefault();
    const newMessages = [...messages, { role: "user", content: input }];
    setMessages(newMessages);

    const res = await fetch("http://localhost:8080/api/chat", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ messages: input }),
    });

    const data = await res.json();

    setMessages([...newMessages, { role: "bot", content: data.content }]);
    setInput("");
  };
  console.log(messages);
  return (
    <div className="chat-box">
      <div className="message-list">
        {messages.map((msg, i) => (
          <ChatMessage key={i} role={msg.role} content={msg.content} />
        ))}
      </div>
      <form onSubmit={sendMessage} className="input-area">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Ask anything..."
        />
        <button type="submit">Send</button>
      </form>
    </div>
  );
};

export default Chat;

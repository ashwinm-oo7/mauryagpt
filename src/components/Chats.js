import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import "../css/style.css";
import { Link } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { jsPDF } from "jspdf";
const Chats = () => {
  const { token, user } = useAuth(); // Access the token from context
  const [chatId, setChatId] = useState(() => {
    return localStorage.getItem("chatId") || "";
  });
  const [messages, setMessages] = useState([]);
  const [chatList, setChatList] = useState([]);

  // const [messages, setMessages] = useState(() => {
  //   const savedMessages = localStorage.getItem("chatMessages");
  //   return savedMessages ? JSON.parse(savedMessages) : [];
  // });
  const [topic, setTopic] = useState(""); // Or any selected topic
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const messageEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isLoggedIn = !!token;
  // Load chat on page load
  useEffect(() => {
    if (chatId) {
      localStorage.setItem("chatId", chatId);
    }
  }, [chatId]);

  useEffect(() => {
    if (!isLoggedIn) {
      const savedMessages = localStorage.getItem("chatMessages");
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    } else {
      fetchChatFromBackend();
    }
    if (chatId) {
      fetchChatFromBackend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, chatId]);
  const fetchChatFromBackend = async () => {
    try {
      const res = await fetch(
        `${process.env.REACT_APP_URL}/chats/chat/history/${chatId}`,
        {
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );
      const data = await res.json();
      setMessages(data.conversation?.messages || []); // Adjusted to match backend response
    } catch (err) {
      console.error("Failed to fetch history:", err);
    }
  };
  const startNewChat = async () => {
    try {
      const res = await fetch(`${process.env.REACT_APP_URL}/chats/new-chat`, {
        method: "POST",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          topic: "New Chat", // Optionally pass a topic here
        }),
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setMessages([]); // Clear current chat messages
        setChatId(data.chatId); // Set the new chat ID
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error starting new chat:", err);
      alert("Failed to start a new chat.");
    }
  };

  // Save to localStorage only for guest user
  useEffect(() => {
    if (!isLoggedIn) {
      localStorage.setItem("chatMessages", JSON.stringify(messages));
    }
  }, [messages, isLoggedIn]);

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
  useEffect(() => {
    localStorage.setItem("chatMessages", JSON.stringify(messages));
  }, [messages]);

  const sendMessage = async (e) => {
    e.preventDefault();
    if (!input.trim() || isTyping) return;

    const userMessage = { role: "user", content: input };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    try {
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }

      const res = await fetch(
        `${process.env.REACT_APP_URL}/chats/savedchat/${chatId}`,
        {
          method: "POST",
          headers: headers,
          body: JSON.stringify({
            conversation: [...messages, userMessage],
            topic: topic || "General",
            userID: user.userId,
          }),
        }
      );

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

          typingTimeoutRef.current = setTimeout(typeCharByChar, 3); // 🏎️ speed boost!
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
  const clearConversation = () => {
    setMessages([]);
    if (!isLoggedIn) {
      localStorage.removeItem("chatMessages");
    } else {
      clearBackendChat();
    }
  };
  const clearBackendChat = async () => {
    if (!token) {
      alert("You must be logged in to clear your chat history.");
      return;
    }

    try {
      const res = await fetch(`${process.env.REACT_APP_URL}/chats/chat/reset`, {
        method: "DELETE",
        headers: {
          Authorization: `Bearer ${token}`,
          "Content-Type": "application/json",
        },
      });

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setMessages([]); // Clear local messages as well
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error resetting chat:", err);
      alert("Failed to reset chat.");
    }
  };
  useEffect(() => {
    const fetchChatList = async () => {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_URL}/chats/chat/getChatID`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        const data = await res.json();
        console.log("chatBYID", data);
        setChatList(data.conversations); // Assuming `data.conversations` contains a list of all the chats
      } catch (err) {
        console.error("Failed to fetch chat list:", err);
      }
    };

    fetchChatList();
  }, []);

  const handleChatSwitch = (chatId) => {
    setChatId(chatId);
    fetchChatFromBackend();
  };
  const downloadChatAsPDF = () => {
    const doc = new jsPDF();
    let y = 20; // Start a little lower

    // Add a Title
    doc.setFontSize(18);
    doc.text("Chat Conversation", 105, 10, { align: "center" });

    // Add Date-Time
    const currentDate = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.text(`Date: ${currentDate}`, 200, 10, { align: "right" });

    messages.forEach((msg) => {
      if (msg.role === "user") {
        doc.setTextColor(0, 0, 255); // Blue for User
        doc.setFont("helvetica", "bold");
        doc.text(`You: ${msg.content}`, 10, y);
      } else {
        doc.setTextColor(0, 128, 0); // Green for Assistant
        doc.setFont("times", "normal");
        doc.text(`Assistant: ${msg.content}`, 10, y);
      }

      y += 10;

      if (y > 280) {
        doc.addPage();
        y = 20;
      }
    });

    doc.save("chat_conversation.pdf");
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
      <div>
        <h3>Your Chats:</h3>
        <ul>
          {chatList.map((chat) => (
            <li key={chat._id}>
              <button onClick={() => handleChatSwitch(chat._id)}>
                {chat.topic}
              </button>
            </li>
          ))}
        </ul>
      </div>

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
          <button
            type="button"
            onClick={clearConversation}
            className="clear-button"
          >
            Clear Chat
          </button>
          <button
            type="button"
            onClick={downloadChatAsPDF}
            className="download-button"
          >
            Download Chat
          </button>

          {isTyping && (
            <button type="button" onClick={stopTyping} className="stop-button">
              Stop
            </button>
          )}
          <button
            type="button"
            onClick={startNewChat}
            className="new-chat-button"
          >
            Start New Chat
          </button>
        </form>
      </div>
    </>
  );
};

export default Chats;

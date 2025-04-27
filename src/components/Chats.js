import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import "../css/chats.css";
import { FaBars, FaTimes } from "react-icons/fa";

import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../auth/AuthContext";
import { jsPDF } from "jspdf";
// import html2canvas from "html2canvas";

import ChatListTopic from "../reusable/ChatListTopic";
import MessageInput from "../reusable/MessageInput";
const Chats = () => {
  const [chatId, setChatId] = useState(() => {
    return localStorage.getItem("chatId") || "";
  });
  const [messages, setMessages] = useState([]);
  const [chatList, setChatList] = useState([]);
  const { token, logout, user } = useAuth();

  // const [messages, setMessages] = useState(() => {
  //   const savedMessages = localStorage.getItem("chatMessages");
  //   return savedMessages ? JSON.parse(savedMessages) : [];
  // });
  const [topic, setTopic] = useState(""); // Or any selected topic
  const [input, setInput] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [isSidebarOpen, setIsSidebarOpen] = useState(true); // State for sidebar visibility

  const messageEndRef = useRef(null);
  const typingTimeoutRef = useRef(null);
  const isLoggedIn = !!token;
  const chatRef = useRef();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

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
  const clearConversation = (chatId) => {
    if (!isLoggedIn) {
      localStorage.removeItem("chatMessages");
    } else {
      clearBackendChat(chatId);
    }
  };
  const clearBackendChat = async (chatId) => {
    if (!token) {
      alert("You must be logged in to clear your chat history.");
      return;
    }

    try {
      const res = await fetch(
        `${process.env.REACT_APP_URL}/chats/chat/reset/${chatId}`,
        {
          method: "DELETE",
          headers: {
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const data = await res.json();
      if (res.ok) {
        alert(data.message);
        setMessages([]); // Clear local messages as well
        localStorage.removeItem("chatId"); // Remove chatId from localStorage
        setChatId(""); // Also clear state
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error resetting chat:", err);
      alert("Failed to reset chat.");
    }
  };
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
  useEffect(() => {
    if (isLoggedIn) {
      fetchChatList();
    }
  }, [isLoggedIn]);

  const handleChatSwitch = (chatId) => {
    setChatId(chatId);
    fetchChatFromBackend();
  };
  // const downloadChatAsPDF = () => {
  //   const doc = new jsPDF();
  //   let y = 20;

  //   // Add a Title
  //   doc.setFontSize(18);
  //   doc.text("Chat Conversation", 105, 10, { align: "center" });

  //   // Add Date-Time
  //   const currentDate = new Date().toLocaleString();
  //   doc.setFontSize(10);
  //   doc.text(`Date: ${currentDate}`, 200, 10, { align: "right" });

  //   messages.forEach((msg) => {
  //     if (msg.role === "user") {
  //       doc.setTextColor(0, 0, 255); // Blue for User
  //       doc.setFont("helvetica", "bold");
  //       doc.text(`You: ${msg.content}`, 10, y);
  //     } else {
  //       doc.setTextColor(0, 128, 0); // Green for Assistant
  //       doc.setFont("times", "normal");
  //       doc.text(`Assistant: ${msg.content}`, 10, y);
  //     }

  //     y += 10;

  //     if (y > 280) {
  //       doc.addPage();
  //       y = 20;
  //     }
  //   });

  //   doc.save("chat_conversation.pdf");
  // };

  // This function will download the chat conversation as a PDF
  const downloadChatAsPDF = () => {
    const doc = new jsPDF();
    let y = 20; // Starting Y position for the content
    const pageHeight = doc.internal.pageSize.height; // Get the height of the page (A4 size)

    // Add Title
    doc.setFontSize(18);
    doc.text("Chat Conversation", 105, y, { align: "center" });
    y += 20;

    // Add Date-Time
    const currentDate = new Date().toLocaleString();
    doc.setFontSize(10);
    doc.text(`Date: ${currentDate}`, 200, y, { align: "right" });
    y += 10;

    // Loop through messages and format them
    messages.forEach((msg, index) => {
      if (msg.role === "user") {
        // Formatting user messages
        doc.setTextColor(0, 0, 255); // Blue for User
        doc.setFont("helvetica", "bold");
        doc.text("You:", 10, y); // Display "You:"
        y += 5; // Spacing

        // Displaying the message content
        doc.setFont("helvetica", "normal");
        const userMessageLines = formatMessage(msg.content);
        userMessageLines.forEach((line) => {
          doc.text(line, 10, y);
          y += 5;
        });
      } else {
        // Formatting assistant messages
        doc.setTextColor(0, 128, 0); // Green for Assistant
        doc.setFont("times", "normal");
        doc.text("Assistant:", 10, y); // Display "Assistant:"
        y += 5; // Spacing

        // Displaying the message content
        doc.setFont("times", "normal");
        const assistantMessageLines = formatMessage(msg.content);
        assistantMessageLines.forEach((line) => {
          doc.text(line, 10, y);
          y += 5;
        });
      }

      // Handle code formatting (check if content includes code)
      if (msg.content.includes("```")) {
        // Extract and format code block content
        const codeBlock = msg.content.match(/```([\s\S]+?)```/)[1];
        doc.setFont("courier", "normal");
        doc.setTextColor(0, 0, 0); // Default color for code
        doc.setFillColor(240, 240, 240); // Light gray background for code block
        doc.rect(10, y - 2, 190, 30, "F"); // Draw a filled rectangle for code block background
        doc.text(codeBlock, 10, y + 5);
        y += 40; // Adjust after code block to avoid overlap
      }

      // Add spacing between messages
      y += 10;

      // Handle page overflow: Add new page if content exceeds the bottom
      if (y > pageHeight - 30) {
        // Keep some margin from the bottom
        doc.addPage();
        y = 20; // Reset position for new page
      }
    });

    // Save the PDF
    doc.save("chat_conversation.pdf");
  };

  // Helper function to split message content into multiple lines if it's too long
  const formatMessage = (message) => {
    const maxLength = 180; // Max characters per line
    let lines = [];
    while (message.length > maxLength) {
      let spaceIndex = message.lastIndexOf(" ", maxLength);
      if (spaceIndex === -1) spaceIndex = maxLength;
      lines.push(message.substring(0, spaceIndex));
      message = message.substring(spaceIndex).trim();
    }
    if (message) lines.push(message); // Add the remaining part of the message
    return lines;
  };

  const toggleSidebar = () => {
    setIsSidebarOpen(!isSidebarOpen);
  };

  return (
    <>
      <div className="chat-container">
        <button onClick={toggleSidebar} className="toggle-sidebar-button">
          {isSidebarOpen ? <FaTimes /> : <FaBars />}
        </button>
        {/* {!token && (
        <div>
          <p>
            Don't have an account? <Link to="/register">Register here</Link>
          </p>
        </div>
      )} */}
        {isSidebarOpen && (
          <div className="chat-list-container">
            <ChatListTopic
              chatList={chatList}
              handleChatSwitch={handleChatSwitch}
              startNewChat={startNewChat}
              toggleSidebar={toggleSidebar}
              isSidebarOpen={isSidebarOpen}
              clearConversation={clearConversation}
              downloadChatAsPDF={downloadChatAsPDF}
            />
          </div>
        )}

        <div
          className={`chat-box ${
            isSidebarOpen ? "with-sidebar" : "no-sidebar"
          }`}
        >
          <div
            className="message-list chat-content"
            id="chat-content"
            ref={chatRef}
          >
            {messages &&
              messages?.map((msg, i) => (
                <ChatMessage key={i} role={msg.role} content={msg.content} />
              ))}
            <div ref={messageEndRef} />
          </div>

          <MessageInput
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            isTyping={isTyping}
            stopTyping={stopTyping}
            clearConversation={clearConversation}
            downloadChatAsPDF={downloadChatAsPDF}
          />
        </div>
      </div>
    </>
  );
};

export default Chats;

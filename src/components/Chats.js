import React, { useState, useRef, useEffect } from "react";
import ChatMessage from "./ChatMessage";
import "../css/chats.css";
import { FaBars, FaTimes } from "react-icons/fa";

import { useAuth } from "../auth/AuthContext";

import ChatListTopic from "../reusable/ChatListTopic";
import MessageInput from "../reusable/MessageInput";
import { useChat } from "../context/ChatContext";
const Chats = () => {
  const { setChatList, fetchChatList, chatIds } = useChat();

  const [chatId, setChatId] = useState(() => {
    return chatIds || localStorage.getItem("chatId") || "";
  });
  const [messages, setMessages] = useState([]);
  const [replyingTo, setReplyingTo] = useState("");

  // const [chatList, setChatList] = useState([]);
  const { token, user } = useAuth();
  const [isAutoScroll, setIsAutoScroll] = useState(true);

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

  // Load chat on page load
  useEffect(() => {
    if (!token) return; // must be logged in
    if (!chatId) return; // must have chatId
    if (messages.length > 0) return; // prevent duplicate fetch

    localStorage.setItem("chatId", chatId);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [chatId, token]);

  useEffect(() => {
    if (!isLoggedIn) {
      const savedMessages = localStorage.getItem("chatMessages");
      if (savedMessages) {
        setMessages(JSON.parse(savedMessages));
      }
    }
    if (!chatId || messages.length > 0) return;

    if (chatId) {
      fetchChatFromBackend();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn, chatId]);

  const fetchChatFromBackend = async () => {
    if (!chatId) return; // prevent empty call

    if (chatId) {
      try {
        const res = await fetch(
          `${process.env.REACT_APP_URL}/chats/chat/history/${chatId}`,
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          }
        );
        if (!res.ok) throw new Error("Chat not found or invalid request");

        const data = await res.json();

        setMessages(data.conversation?.messages || []); // Adjusted to match backend response
        console.log("setMessages", messages);
      } catch (err) {
        console.error("Failed to fetch history:", err);
      }
    }
  };
  const startNewChat = async () => {
    if (token) {
      try {
        const res = await fetch(`${process.env.REACT_APP_URL}/chats/new-chat`, {
          method: "POST",
          headers: {
            Authorization: `Bearer ${token}`,
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            topic: topic, // Optionally pass a topic here
          }),
        });

        const data = await res.json();
        if (res.ok) {
          alert(data.message);
          setMessages([]); // Clear current chat messages
          setChatId(data.chatId); // Set the new chat ID
          fetchChatList();
        } else {
          alert(data.message);
        }
      } catch (err) {
        console.error("Error starting new chat:", err);
        alert("Failed to start a new chat.");
      }
    } else {
      localStorage.clear();
      window.location.reload();
    }
  };
  function handleSelectReply(message) {
    if (message && message._id) {
      setReplyingTo(message); // Only set if message exists and has an _id
    } else {
      console.error("Message is undefined or missing _id", message);
    }
  }

  function handleCancelReply() {
    setReplyingTo(null);
  }
  const getReplyContentById = (id) => {
    const msg = messages.find((m) => m._id === id);
    return msg ? msg?.content?.slice(0, 100) : "(message not found)";
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
    if (isAutoScroll) {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }
  };

  useEffect(() => {
    scrollToBottom();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);
  useEffect(() => {
    const chatContent = chatRef.current;

    const handleScroll = () => {
      if (!chatContent) return;

      const isAtBottom =
        chatContent.scrollHeight - chatContent.scrollTop <=
        chatContent.clientHeight + 100; // Allow some margin

      setIsAutoScroll(isAtBottom);
    };

    if (chatContent) {
      chatContent.addEventListener("scroll", handleScroll);
    }

    return () => {
      if (chatContent) {
        chatContent.removeEventListener("scroll", handleScroll);
      }
    };
  }, []);

  const stopTyping = () => {
    clearTimeout(typingTimeoutRef.current);
    setIsTyping(false);
  };
  const sendMessage = async (e) => {
    if (e?.preventDefault) e?.preventDefault?.();
    if (!input.trim() || isTyping) return;

    // const userMessage = { role: "user", content: input };
    const userMessage = {
      role: "user",
      content: input,
      replyTo: replyingTo?.messageId || null,
      replySnippet: replyingTo?.text || null,
    };

    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsTyping(true);

    setTimeout(() => {
      messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, 100);

    try {
      const headers = {
        "Content-Type": "application/json",
      };
      if (token) {
        headers["Authorization"] = `Bearer ${token}`;
      }
      const endpoint = chatId
        ? `${process.env.REACT_APP_URL}/chats/savedchat/${chatId}`
        : `${process.env.REACT_APP_URL}/chats/savedchat`; // <-- use this fallback

      const res = await fetch(endpoint, {
        method: "POST",
        headers: headers,
        body: JSON.stringify({
          conversation: [...messages, userMessage],
          topic: topic || null,
          userID: user?.userId,
        }),
      });

      const data = await res.json();
      console.log("chats/savedchat", data);
      if (!chatId && data.chatId && user?.userID && data.chatId !== chatId) {
        setChatId(data.chatId);
        if (data.topic) {
          setTopic(data.topic); // ✅ Update topic state
        }

        // ✅ Fetch updated chat list
        await fetchChatList();
      }

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
      console.error("chats/savedchat:", err);
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
        await fetchChatList();
      } else {
        alert(data.message);
      }
    } catch (err) {
      console.error("Error resetting chat:", err);
      alert("Failed to reset chat.");
    }
  };

  useEffect(() => {
    if (isLoggedIn) {
      fetchChatList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [isLoggedIn]);

  const handleChatSwitch = (chatId) => {
    setChatId(chatId);
    if (chatId) {
      fetchChatFromBackend();
    }
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
        {isSidebarOpen && (
          <div className="chat-list-container">
            <ChatListTopic
              // chatList={chatList && chatList}
              handleChatSwitch={handleChatSwitch}
              startNewChat={startNewChat}
              toggleSidebar={toggleSidebar}
              isSidebarOpen={isSidebarOpen}
              clearConversation={clearConversation}
              messages={messages}
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
                <ChatMessage
                  // key={i}
                  key={msg._id} // Use unique message _id for key
                  role={msg.role}
                  content={msg.content}
                  message={msg}
                  onReply={() => handleSelectReply(msg.content)} // Enable reply on click
                  getReplyContentById={getReplyContentById}
                  setReplyingTo={setReplyingTo}
                />
              ))}
            <div ref={messageEndRef} />
          </div>
          {/* {replyingTo && (
            <div className="reply-box">
              <span className="reply-label">Replying toaa:</span>
              <span className="reply-text">{replyingTo}</span>
              <button onClick={handleCancelReply}>Cancel</button>
            </div>
          )} */}

          <MessageInput
            input={input}
            setInput={setInput}
            sendMessage={sendMessage}
            setMessages={setMessages}
            isTyping={isTyping}
            stopTyping={stopTyping}
            // regenerateResponse={handleRegenerateResponse}
            suggestions={[
              "Tell me a joke",
              "Explain React hooks",
              "Give a coding tip",
            ]}
            handleSuggestionClick={(text) => setInput(text)}
            replyingTo={replyingTo}
            handleCancelReply={handleCancelReply}
          />
        </div>
      </div>
    </>
  );
};

export default Chats;

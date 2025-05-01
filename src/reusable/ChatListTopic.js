import React, { useEffect, useRef, useState } from "react";
import "../css/chats.css";
import { FaEdit, FaEllipsisV } from "react-icons/fa";
import { useChat } from "../context/ChatContext";
import DownloadChatPDF from "../components/DownloadChatPDF";

const ChatListTopic = ({
  // chatList,
  handleChatSwitch,
  startNewChat,
  clearConversation,
  renameChat,
  shareChat,
  messages,
}) => {
  const { chatList } = useChat();
  const [openMenu, setOpenMenu] = useState(null);
  const menuRef = useRef(null);

  const toggleMenu = (chatId) => {
    setOpenMenu(openMenu === chatId ? null : chatId);
  };
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (menuRef.current && !menuRef.current.contains(event.target)) {
        setOpenMenu(null);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  return (
    <div className="chat-list-topic">
      <h3>Your Chats</h3>
      <strong
        style={{
          display: "flex",
          justifyContent: "space-between",
          width: "100%",
          cursor: "pointer",
        }}
        title="New Chat"
        onClick={startNewChat}
      >
        <span>New Chat</span> {/* This keeps the text aligned to the left */}
        <FaEdit className="chat-edit-button" />{" "}
      </strong>

      <ul>
        {chatList &&
          chatList?.map((chat) => (
            <li key={chat._id}>
              <span
                className="chat-list-map"
                onClick={() => handleChatSwitch(chat._id)}
              >
                {chat.topic}
              </span>
              <FaEllipsisV
                className="three-dots"
                onClick={() => toggleMenu(chat._id)}
              />
              {openMenu === chat._id && (
                <div className="chat-options" ref={menuRef}>
                  <button onClick={() => renameChat(chat._id)}>Rename</button>
                  <button onClick={() => shareChat(chat._id)}>Share</button>
                  <DownloadChatPDF messages={messages} />
                  <button
                    type="button"
                    onClick={() => clearConversation(chat._id)}
                    className="clear-button"
                  >
                    Clear Chat
                  </button>
                </div>
              )}
            </li>
          ))}
      </ul>
    </div>
  );
};

export default ChatListTopic;

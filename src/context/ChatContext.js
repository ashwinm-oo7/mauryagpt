import { createContext, useContext, useState, useEffect } from "react";
import { useAuth } from "../auth/AuthContext";

const ChatContext = createContext();

export const ChatProvider = ({ children }) => {
  const { token } = useAuth();
  const [chatList, setChatList] = useState([]);
  const [chatIds, setChatIds] = useState([]);
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
      const conversations = data.conversations || [];
      const sortedChats = conversations && conversations?.reverse(); // Ensure newest is on top

      setChatList(sortedChats);

      // if (conversations && conversations?.length > 0) {
      //   const lastChat = conversations[conversations.length - 1];
      //   setChatId(lastChat._id);
      // }
      if (
        sortedChats.length > 0 &&
        !sortedChats.some((chat) => chat._id === chatIds)
      ) {
        setChatIds(sortedChats[0]._id); // Automatically switch to new chat
      }
    } catch (err) {
      console.error("Failed to fetch chat list:", err);
    }
  };

  useEffect(() => {
    if (token) {
      fetchChatList();
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [token]);

  return (
    <ChatContext.Provider
      value={{ chatList, setChatList, fetchChatList, chatIds }}
    >
      {children}
    </ChatContext.Provider>
  );
};

export const useChat = () => useContext(ChatContext);

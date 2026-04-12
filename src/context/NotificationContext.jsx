import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { io } from "socket.io-client";

const NotificationContext = createContext();

export const NotificationProvider = ({ children }) => {
  const [notifications, setNotifications] = useState([]);
  const [unreadCount, setUnreadCount] = useState(0);
  const socketRef = useRef(null);

  useEffect(() => {
    socketRef.current = io(process.env.REACT_APP_URL, {
      transports: ["websocket"],
      withCredentials: true,
    });

    const socket = socketRef.current;

    // ✅ CONNECT
    socket.on("connect", () => {
      console.log("✅ Connected:", socket.id);

      // 🔥 VERY IMPORTANT (JOIN ADMIN ROOM)
      socket.emit("joinAdmin");
    });

    // ✅ SINGLE LISTENER ONLY
    socket.on("newExamAttempt", (data) => {
      console.log("📡 Notification received:", data);

      setNotifications((prev) => [data, ...prev]);
      setUnreadCount((prev) => prev + 1);

      // 🎯 TYPE HANDLING
      switch (data.type) {
        case "START":
          console.log("🚀 Exam Started");
          break;

        case "PROGRESS":
          console.log("📊 Progress:", data.progress);
          break;

        case "SUBMIT":
          console.log("✅ Exam Submitted");
          break;

        default:
          console.log("🔔 General Notification");
      }
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const markAllRead = () => {
    setUnreadCount(0);
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
  };

  return (
    <NotificationContext.Provider
      value={{ notifications, unreadCount, markAllRead }}
    >
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = () => useContext(NotificationContext);

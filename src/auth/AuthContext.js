import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";
import api from "./axiosInstance";

// Create a context
const AuthContext = createContext();

// Create a provider component
export const AuthProvider = ({ children }) => {
  const [token, setToken] = useState(localStorage.getItem("token") || "");
  const [user, setUser] = useState({ userId: "", userEmail: "" });
  useEffect(() => {
    const fetchUserDetails = async () => {
      if (token) {
        try {
          const res = await api.get(`${process.env.REACT_APP_URL}/api/auth/me`);
          console.log("fetchUserDetails", res);
          setUser({
            userId: res.data.userId,
            userEmail: res.data.email,
          });
        } catch (error) {
          if (error.response?.data?.code === "TOKEN_EXPIRED") {
            logout();
            window.location.href = "/login";
          } else {
            logout();
          }
        }
      }
    };

    fetchUserDetails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []); // <-- only run once when page loads (empty array)

  const saveToken = async (newToken) => {
    setToken(newToken);
    localStorage.setItem("token", newToken);

    try {
      const res = await axios.get(`${process.env.REACT_APP_URL}/api/auth/me`, {
        headers: {
          Authorization: `Bearer ${newToken}`,
        },
      });
      console.log("saveToken", res);

      setUser({
        userId: res.data.userId,
        userEmail: res.data.email,
      });
    } catch (error) {
      console.error("Failed to fetch user details", error);
    }
  };
  const logout = async () => {
    try {
      if (token) {
        await axios.post(
          `${process.env.REACT_APP_URL}/api/auth/logout`,
          {},
          {
            headers: {
              Authorization: `Bearer ${token}`,
            },
          },
        );
      }
    } catch (err) {
      console.error("Logout API failed", err);
    }

    setToken("");
    setUser({ userId: "", userEmail: "" });

    localStorage.removeItem("token");
    localStorage.clear();

    window.location.href = "/login";
  };
  return (
    <AuthContext.Provider value={{ token, user, saveToken, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth context
export const useAuth = () => useContext(AuthContext);

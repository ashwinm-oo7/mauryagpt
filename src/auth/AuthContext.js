import React, { createContext, useContext, useEffect, useState } from "react";
import axios from "axios";

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
          const res = await axios.get(
            `${process.env.REACT_APP_URL}/api/auth/me`,
            {
              headers: {
                Authorization: `Bearer ${token}`,
              },
            }
          );
          console.log("fetchUserDetails", res);
          setUser({
            userId: res.data.userId,
            userEmail: res.data.email,
          });
        } catch (error) {
          console.error("Failed to fetch user details", error);
          setToken(""); // Optional: Clear invalid token
          setUser({ userId: "", userEmail: "" });
          localStorage.removeItem("token");
        }
      }
    };

    fetchUserDetails();
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
  const logout = () => {
    setToken("");
    setUser({ userId: "", userEmail: "" });
    localStorage.removeItem("token");
    localStorage.clear(); // <-- FULL clear
  };

  return (
    <AuthContext.Provider value={{ token, user, saveToken, setToken, logout }}>
      {children}
    </AuthContext.Provider>
  );
};

// Custom hook to use the Auth context
export const useAuth = () => useContext(AuthContext);

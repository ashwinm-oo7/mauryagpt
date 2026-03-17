// AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import api, { fetchCsrfToken } from "./axiosInstance";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  // Fetch user info from /me
  const fetchUser = async (initial = false) => {
    if (initial) setLoading(true);

    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data);
    } catch (err) {
      try {
        await api.post("/api/auth/refresh");

        const res = await api.get("/api/auth/me");
        setUser(res.data);
      } catch {
        setUser(null);
      }
    } finally {
      if (initial) setLoading(false);
    }
  };

  useEffect(() => {
    const initAuth = async () => {
      await fetchCsrfToken(); // get csrf token first
      await fetchUser(true);
    };

    initAuth();
  }, []); // Login via credentials
  const login = async (email, password) => {
    try {
      await api.post("/api/auth/login", { email, password });
      await fetchUser(); // refresh user data
      return true;
    } catch (err) {
      console.error("Login failed", err);
      throw err;
    }
  };

  // Logout clears cookie and resets user
  const logout = async () => {
    try {
      await api.post("/api/auth/logout"); // clears cookie on server
    } catch (err) {
      console.error("Logout failed", err);
    } finally {
      setUser(null);
      window.location.href = "/login";
    }
  };

  return (
    <AuthContext.Provider
      value={{
        user,
        loading,
        fetchUser,
        login,
        logout,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

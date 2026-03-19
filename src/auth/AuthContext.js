// AuthContext.js
import React, { createContext, useContext, useEffect, useState } from "react";
import api from "./axiosInstance";
import { authStore } from "./authStore";

const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);
  const [loading, setLoading] = useState(true);
  const [accessToken, setAccessToken] = useState(null);
  // Fetch user info from /me
  const fetchUser = async (initial = false) => {
    if (initial) setLoading(true);

    try {
      const res = await api.get("/api/auth/me");
      setUser(res.data);
    } catch (err) {
      try {
        const ress = await api.post("/api/auth/refresh", {
          token: localStorage.getItem("refreshToken"),
        });

        saveToken(ress.data.accessToken);
        const res = await api.get("/api/auth/me");
        setUser(res.data);
      } catch {
        setUser(null);
      }
    } finally {
      if (initial) setLoading(false);
    }
  };
  const handleLogoutAll = async () => {
    try {
      await api.post("/api/auth/logout-all");
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
    } catch (err) {
      console.error(err);
    }
  };
  useEffect(() => {
    const initAuth = async () => {
      try {
        const res = await api.post("/api/auth/refresh", {
          token: localStorage.getItem("refreshToken"),
        });

        saveToken(res.data.accessToken);

        await fetchUser(true);
      } catch {
        setUser(null);
        setLoading(false);
      }
    };

    initAuth();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);
  const saveToken = (token) => {
    setAccessToken(token);
    authStore.setAccessToken(token);
  };
  const login = async (email, password) => {
    try {
      const res = await api.post("/api/auth/login", { email, password });
      // localStorage.setItem("accessToken", res.data.accessToken);
      setAccessToken(res.data.accessToken);
      authStore.setAccessToken(res.data.accessToken); // 🔥 important

      localStorage.setItem("refreshToken", res.data.refreshToken);

      await fetchUser(); // refresh user data
      return true;
    } catch (err) {
      console.error("Login failed", err);
      throw err;
    }
  };

  // Logout clears cookie and resets user
  const logout = async (token) => {
    try {
      localStorage.removeItem("accessToken");
      localStorage.removeItem("refreshToken");
      await api.post("/api/auth/logout", {
        refreshToken: token,
      }); // clears cookie on server
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
        accessToken,
        loading,
        fetchUser,
        login,
        logout,
        handleLogoutAll,
        isAuthenticated: !!user,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => useContext(AuthContext);

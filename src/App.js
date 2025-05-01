// App.js

import React from "react";
import { AuthProvider, useAuth } from "./auth/AuthContext";

import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  Navigate,
  useNavigate,
} from "react-router-dom";

import "./App.css";
import Chats from "./components/Chats";
import Login from "./auth/Login";
import Register from "./auth/Register";
import { ChatProvider } from "./context/ChatContext";

function AppContent() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };

  return (
    <div className="App">
      {/* Header section */}
      <div
        style={{
          position: "relative",
          padding: "10px 0",
          borderBottom: "1px solid #ccc",
          marginBottom: "12px",
        }}
      >
        {/* Centered H2 */}
        <h1
          className="app-h2"
          style={{
            textAlign: "center",
            margin: 0,
            fontSize: "28px",
          }}
        >
          Chat with Maurya AI
        </h1>

        {/* Top-right buttons */}
        <div
          style={{
            position: "absolute",
            top: "12px",
            right: "20px",
          }}
          className="handle-logout-container"
        >
          {token ? (
            <button
              onClick={handleLogout}
              style={{
                padding: "6px 15px",
                fontSize: "16px",
                cursor: "pointer",
              }}
            >
              Logout
            </button>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  marginRight: "10px",
                  fontSize: "20px",
                  textDecoration: "none",
                  padding: "10px 20px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  display: "inline-block",
                  textAlign: "center",
                }}
              >
                Login
              </Link>

              {/* <Link
                to="/register"
                style={{ fontSize: "16px", textDecoration: "none" }}
              >
                Register
              </Link> */}
            </>
          )}
        </div>
      </div>

      {/* Page Routes */}
      <Routes>
        <Route path="/" element={<Chats />} />
        <Route
          path="/login"
          element={!token ? <Login /> : <Navigate to="/" replace />}
        />
        <Route
          path="/register"
          element={!token ? <Register /> : <Navigate to="/" replace />}
        />

        {/* Catch-all for invalid paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <AppContent />
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;

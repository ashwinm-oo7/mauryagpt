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
import Profile from "./components/Profile/Profile";
import "./App.css";
import Chats from "./components/Chats";
import Login from "./auth/Login";
import Register from "./auth/Register";
import { ChatProvider } from "./context/ChatContext";
import ERPKnowledgeSearch from "./components/ERPKnowledgeSearch/ERPKnowledgeSearch";
// import Mcqtest from "./components/mcq/Mcqtest";
// App.js (where your routes are defined)
/* import ... */
import AIChat from "./components/AIChat/AIChat";
import AntiDebug from "./security/AntiDebug";
import AdminMcq from "./components/mcq/AdminMcq";
/* inside <Routes> */
import TestPage from "./components/user/TestPage";
import ResultPage from "./components/user/ResultPage";
import UserDashboard from "./components/user/UserDashboard";
import LevelSelector from "./components/user/LevelSelector";
import { Toaster } from "react-hot-toast";

function AppContent() {
  const { token, logout } = useAuth();
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate("/login");
  };
  if (process.env.NODE_ENV === "production") {
    AntiDebug();
  }

  return (
    <div className="App">
      {/* Header section */}
      <Toaster
        position="top-right"
        toastOptions={{
          duration: 3000,
          style: {
            fontSize: "14px",
          },
        }}
      />

      <div
        style={{
          position: "relative",
          padding: "10px 0",
          borderBottom: "1px solid #ccc",
          marginBottom: "5px",
        }}
      >
        {token && (
          <Link
            to="/profile"
            style={{
              marginRight: "10px",
              padding: "6px 10px",
              background: "#6f42c1",
              color: "white",
              borderRadius: "5px",
              textDecoration: "none",
            }}
          >
            Profile
          </Link>
        )}
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
            <>
              <Link
                onClick={handleLogout}
                style={{
                  padding: "6px 15px",
                  marginRight: "10px",
                  fontSize: "16px",
                  cursor: "pointer",
                  background:
                    "linear-gradient(45deg,rgb(242, 235, 235),rgb(217, 216, 213),rgb(194, 199, 200),rgb(183, 189, 189))",
                  color: "black",
                  border: "none",
                  borderRadius: "5px",
                  boxShadow: "rgba(0, 0, 0, 1.2) 2px 3px 7px",
                  transition: "background 0.3s ease-in-out",
                  textDecoration: "none",
                }}
              >
                Logout
              </Link>
              <Link
                to="/mcq-test"
                style={{
                  padding: "6px 15px",
                  marginRight: "10px",
                  fontSize: "16px",
                  cursor: "pointer",
                  background:
                    "linear-gradient(45deg,rgb(242, 235, 235),rgb(217, 216, 213),rgb(194, 199, 200),rgb(183, 189, 189))",
                  color: "black",
                  border: "none",
                  borderRadius: "5px",
                  boxShadow: "rgba(0, 0, 0, 1.2) 2px 3px 7px",
                  transition: "background 0.3s ease-in-out",
                  textDecoration: "none",
                }}
              >
                Test
              </Link>
            </>
          ) : (
            <>
              <Link
                to="/login"
                style={{
                  marginRight: "10px",
                  fontSize: "20px",
                  textDecoration: "none",
                  padding: "5px 10px",
                  backgroundColor: "#007bff",
                  color: "white",
                  border: "none",
                  borderRadius: "5px",
                  display: "inline-block",
                  textAlign: "center",
                  boxShadow: " rgba(0, 0, 0, 1.2) 2px 3px 7px",
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
          <Link
            to="/knowledge"
            style={{
              marginRight: "10px",
              fontSize: "16px",
              padding: "6px 10px",
              backgroundColor: "#28a745",
              color: "white",
              borderRadius: "5px",
              textDecoration: "none",
              boxShadow: "rgba(0,0,0,0.2) 2px 2px 4px",
            }}
          >
            Knowledge
          </Link>
          <Link
            to="/UserDashboard"
            style={{
              marginRight: "10px",
              padding: "6px 10px",
              background: "#111827",
              color: "#fff",
              borderRadius: 6,
              textDecoration: "none",
            }}
          >
            UserDashboard
          </Link>

          <Link
            to="/SabReport"
            style={{
              marginRight: "10px",
              padding: "6px 10px",
              background: "#111827",
              color: "#fff",
              borderRadius: 6,
              textDecoration: "none",
            }}
          >
            SabReport
          </Link>
          <Link
            to="/admin/mcq"
            style={{
              marginRight: "10px",
              padding: "6px 10px",
              background: "#111827",
              color: "#fff",
              borderRadius: 6,
              textDecoration: "none",
            }}
          >
            Admin
          </Link>
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
        {/* <Route
          path="/mcq-test"
          element={!token ? <Navigate to="/" replace /> : <Mcqtest />}
        /> */}
        {/* Catch-all for invalid paths */}
        <Route path="*" element={<Navigate to="/" replace />} />
        <Route path="/knowledge" element={<ERPKnowledgeSearch />} />
        <Route
          path="/profile"
          element={token ? <Profile /> : <Navigate to="/" replace />}
        />
        <Route path="/SabReport" element={<AIChat />} />
        <Route
          path="/admin/mcq"
          element={token ? <AdminMcq /> : <Navigate to="/login" replace />}
        />
        <Route path="/UserDashboard" element={<UserDashboard />} />
        <Route path="/user/levels/:domain" element={<LevelSelector />} />
        <Route path="/user/test/:domain/:level" element={<TestPage />} />
        <Route path="/result" element={<ResultPage />} />{" "}
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

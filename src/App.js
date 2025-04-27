import React from "react";
import { AuthProvider } from "./auth/AuthContext"; // Import the provider

import { BrowserRouter as Router, Routes, Route } from "react-router-dom"; // Import necessary Router components
import "./App.css"; // Import the CSS file
import Chats from "./components/Chats";
import Login from "./auth/Login"; // Add the login page component
import Register from "./auth/Register"; // Add the register page component

function App() {
  return (
    <div className="App">
      <h1 style={{ textAlign: "center" }}>Chat with Maurya AI</h1>

      {/* Wrapping the Routes inside Router */}
      <AuthProvider>
        <Router>
          <Routes>
            {/* Define routes for different pages */}
            <Route path="/" element={<Chats />} />
            <Route path="/login" element={<Login />} />
            <Route path="/register" element={<Register />} />
          </Routes>
        </Router>
      </AuthProvider>
    </div>
  );
}

export default App;

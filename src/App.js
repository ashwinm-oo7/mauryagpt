import React from "react";
import "./App.css"; // Import the CSS file
import Chats from "./components/Chats";
import Login from "./auth/Login";

function App() {
  return (
    <div className="App">
      <h1 style={{ textAlign: "center" }}>Chat with Maurya AI</h1>
      <Chats />
    </div>
  );
}

export default App;

// App.js

import React from "react";
import { AuthProvider, useAuth } from "./auth/AuthContext";
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Link,
  useNavigate,
} from "react-router-dom";
import "./App.css";
import Chats from "./components/Chats";
import Login from "./auth/Login";
import Register from "./auth/Register";

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
          padding: "20px 0",
          borderBottom: "1px solid #ccc",
          marginBottom: "20px",
        }}
      >
        {/* Centered H2 */}
        <h1
          className="app-h2"
          style={{
            textAlign: "center",
            margin: 0,
            fontSize: "28px",
            cursor: "pointer", // show pointer
          }}
          onClick={() => navigate("/")} // Navigate to home on click
        >
          Chat with Maurya AI
        </h1>

        {/* Top-right buttons */}
        <div
          style={{
            position: "absolute",
            top: "20px",
            right: "20px",
          }}
        >
          {token ? (
            <button
              onClick={handleLogout}
              style={{
                padding: "8px 16px",
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
                  fontSize: "16px",
                  textDecoration: "none",
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
        <Route path="/login" element={<Login />} />
        <Route path="/register" element={<Register />} />
      </Routes>
    </div>
  );
}

function App() {
  return (
    <AuthProvider>
      <Router>
        <AppContent />
      </Router>
    </AuthProvider>
  );
}

export default App;

// import React from "react";
// import { AuthProvider, useAuth } from "./auth/AuthContext"; // Import the provider

// import {
//   BrowserRouter as Router,
//   Routes,
//   Route,
//   Link,
//   useNavigate,
// } from "react-router-dom"; // Import necessary Router components
// import "./App.css"; // Import the CSS file
// import Chats from "./components/Chats";
// import Login from "./auth/Login"; // Add the login page component
// import Register from "./auth/Register"; // Add the register page component

// function App() {
//   const { token, logout } = useAuth();
//   const navigate = useNavigate();

//   const handleLogout = () => {
//     logout();
//     navigate("/login");
//   };
//   return (
//     <div className="App">
//       <h1 className="app-h2" style={{ textAlign: "center" }}>
//         Chat with Maurya AI
//       </h1>
//       <div style={{ textAlign: "center", marginBottom: "20px" }}>
//         {token ? (
//           <button
//             onClick={handleLogout}
//             style={{ padding: "8px 16px", fontSize: "16px" }}
//           >
//             Logout
//           </button>
//         ) : (
//           <>
//             <Link to="/login" style={{ marginRight: "10px" }}>
//               Login
//             </Link>
//             <Link to="/register">Register</Link>
//           </>
//         )}
//       </div>
//       {/* Wrapping the Routes inside Router */}
//       <AuthProvider>
//         <Router>
//           <Routes>
//             {/* Define routes for different pages */}
//             <Route path="/" element={<Chats />} />
//             <Route path="/login" element={<Login />} />
//             <Route path="/register" element={<Register />} />
//           </Routes>
//         </Router>
//       </AuthProvider>
//     </div>
//   );
// }

// export default App;

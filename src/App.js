import React from "react";
import { BrowserRouter as Router } from "react-router-dom";

import { AuthProvider, useAuth } from "./auth/AuthContext";
import { ChatProvider } from "./context/ChatContext";

import AppLayout from "./layout/AppLayout";
import AppRoutes from "./routes/AppRoutes";

import AntiDebug from "./security/AntiDebug";
import { ThemeProvider } from "./context/ThemeContext";
import { NotificationProvider } from "./context/NotificationContext";

const AppWrapper = () => {
  const { loading } = useAuth();

  if (loading)
    return (
      <div
        style={{
          width: "100vw",
          height: "100vh",
          display: "flex",
          justifyContent: "center",
          alignItems: "center",
          fontSize: "1.5rem",
        }}
      >
        Loading...
      </div>
    );

  return <AppRoutes />;
};
function App() {
  if (process.env.NODE_ENV === "production") {
    AntiDebug();
  }

  return (
    <AuthProvider>
      <ChatProvider>
        <Router>
          <NotificationProvider>
            <AppLayout>
              <ThemeProvider>
                <AppWrapper />
              </ThemeProvider>
            </AppLayout>
          </NotificationProvider>
        </Router>
      </ChatProvider>
    </AuthProvider>
  );
}

export default App;

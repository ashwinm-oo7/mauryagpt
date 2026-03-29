import React from "react";
import Header from "./Header";
import { Toaster } from "react-hot-toast";
import { Outlet, useLocation } from "react-router-dom";

function AppLayout({ children }) {
  const location = useLocation();
  const hideHeader = location.pathname.startsWith("/verify/");

  return (
    <div className="App">
      <Toaster position="top-right" />

      {!hideHeader && <Header />}
      <main style={{ paddingTop: "5px" }}>
        <Outlet />
      </main>
      <div className="page-container">{children}</div>
    </div>
  );
}

export default AppLayout;

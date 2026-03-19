import React from "react";
import Header from "./Header";
import { Toaster } from "react-hot-toast";
import { Outlet } from "react-router-dom";

function AppLayout({ children }) {
  return (
    <div className="App">
      <Toaster position="top-right" />

      <Header />
      <main style={{ paddingTop: "5px" }}>
        <Outlet />
      </main>
      <div className="page-container">{children}</div>
    </div>
  );
}

export default AppLayout;

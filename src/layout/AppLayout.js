import React from "react";
import Header from "./Header";
import { Toaster } from "react-hot-toast";

function AppLayout({ children }) {
  return (
    <div className="App">
      <Toaster position="top-right" />

      <Header />

      <div className="page-container">{children}</div>
    </div>
  );
}

export default AppLayout;

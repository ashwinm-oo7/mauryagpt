import React from "react";
import "./loading.css";

export const LoadingComponent = ({ text = "Maurya Institute" }) => {
  return (
    <div className="loading-wrapper">
      <div className="loader-ring"></div>
      <h2 className="loading-text">{text}</h2>
    </div>
  );
};

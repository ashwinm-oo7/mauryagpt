import React from "react";
import "./uploadProgress.css";

export default function UploadProgressModal({ progress, status }) {
  return (
    <div className="upload-modal">
      <div className="upload-box">
        <h2>📤 Uploading Certificate Data</h2>

        <div className="progress-bar">
          <div
            className="progress-fill"
            style={{ width: `${progress}%` }}
          ></div>
        </div>

        <p>{progress}%</p>

        <span className="status-text">{status}</span>
      </div>
    </div>
  );
}

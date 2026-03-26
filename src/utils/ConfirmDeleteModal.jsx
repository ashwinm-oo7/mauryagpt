import React, { useState } from "react";
import "./ConfirmDeleteModal.css";

const ConfirmDeleteModal = ({
  isOpen,
  onClose,
  onConfirm,
  textToMatch,
  title = "Confirm Deletion",
}) => {
  const [input, setInput] = useState("");

  if (!isOpen) return null;

  const isMatch = input === textToMatch;

  return (
    <div className="modal-overlay">
      <div className="confirm-modal-box">
        <h2>{title}</h2>

        <p className="warning-text">
          This action is <strong>permanent</strong> and cannot be undone.
        </p>

        <p>
          Please type: <span className="highlight">{textToMatch}</span>
        </p>

        <input
          className="confirm-input"
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder="Type to confirm..."
        />

        <div className="modal-actions">
          <button onClick={onClose} className="cancel-btn">
            Cancel
          </button>

          <button
            onClick={() => {
              onConfirm();
              setInput("");
            }}
            disabled={!isMatch}
            className={`delete-btn ${!isMatch ? "disabled" : ""}`}
          >
            Delete Permanently
          </button>
        </div>
      </div>
    </div>
  );
};

export default ConfirmDeleteModal;

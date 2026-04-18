// 📁 AdminInbox.jsx
import React, { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import api from "../../auth/axiosInstance";
import "./AdminInbox.css";

export default function AdminInbox() {
  const [emails, setEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const fetchEmails = async () => {
    try {
      setLoading(true);
      const res = await api.get("/api/admin/users/emails");
      setEmails(res.data);
    } catch (err) {
      setError("Failed to load emails");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchEmails();
  }, []);

  return (
    <div className="inbox-container">
      {/* SIDEBAR */}
      <div className="inbox-sidebar">
        <h3>📬 Mail</h3>
        <div className="menu-item active">Inbox</div>
        <div className="menu-item">Sent</div>
        <div className="menu-item">Starred</div>
      </div>

      {/* EMAIL LIST */}
      <div className="inbox-list">
        <div className="inbox-header">
          <h4>Inbox</h4>
          <button onClick={fetchEmails}>🔄 Refresh</button>
        </div>

        {loading && <p className="info">Loading...</p>}
        {error && <p className="error">{error}</p>}

        {emails.map((mail) => (
          <div
            key={mail.id}
            className={`email-item ${
              selectedEmail?.id === mail.id ? "selected" : ""
            }`}
            onClick={() => setSelectedEmail(mail)}
          >
            <div className="email-from">{mail.from}</div>
            <div className="email-subject">{mail.subject}</div>
            <div className="email-snippet">{mail.snippet}</div>
          </div>
        ))}
      </div>

      {/* EMAIL VIEW */}
      <div className="inbox-view">
        {selectedEmail ? (
          <>
            <h3>{selectedEmail.subject}</h3>
            <p className="meta">
              From: {selectedEmail.from} <br />
              Date: {selectedEmail.date}
            </p>
            <div
              dangerouslySetInnerHTML={{
                __html: DOMPurify.sanitize(selectedEmail.body),
              }}
            />{" "}
          </>
        ) : (
          <div className="empty-view">Select an email to read 📩</div>
        )}
      </div>
    </div>
  );
}

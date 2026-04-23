import React, { useEffect, useState } from "react";
import DOMPurify from "dompurify";
import api from "../../auth/axiosInstance";
import "./AdminInbox.css";
import { FaTrash } from "react-icons/fa";

export default function AdminInbox() {
  const [allEmails, setAllEmails] = useState([]);
  const [selectedEmail, setSelectedEmail] = useState(null);
  const [filter, setFilter] = useState("inbox");
  const [search, setSearch] = useState("");
  const [showCompose, setShowCompose] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [tab, setTab] = useState("primary");
  const [replyMode, setReplyMode] = useState(false);
  const [replyText, setReplyText] = useState("");
  const [form, setForm] = useState({
    to: "",
    subject: "",
    body: "",
  });
  const [nextToken, setNextToken] = useState(null);
  const [loadingMore, setLoadingMore] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [composeMode, setComposeMode] = useState("compose");
  const [sidebarOpen, setSidebarOpen] = useState(false);
  // "compose" | "reply"
  // FETCH
  useEffect(() => {
    setReplyMode(false);
    setReplyText("");
  }, [selectedEmail]);
  const extractEmail = (text) => {
    const match = text.match(/<(.+?)>/);
    return match ? match[1] : text;
  };
  const fetchEmails = async (type = "inbox", loadMore = false) => {
    try {
      let url = "/api/admin/users/emails";

      if (type === "sent") {
        url = "/api/admin/users/emails/sent";
      }

      if (type === "trash") {
        url = "/api/admin/users/emails/trash";
      }

      if (loadMore && nextToken) {
        url += `?pageToken=${nextToken}`;
      }
      const res = await api.get(url);

      if (loadMore) {
        setAllEmails((prev) => [...prev, ...res.data.emails]);
      } else {
        setAllEmails(res.data.emails);
      }

      setNextToken(res.data.nextPageToken);
    } catch {
      console.error("Error loading emails");
    }
  };
  useEffect(() => {
    fetchEmails();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleScroll = (e) => {
    const bottom =
      e.target.scrollHeight - e.target.scrollTop <= e.target.clientHeight + 50;

    if (bottom && nextToken && !loadingMore) {
      setLoadingMore(true);
      fetchEmails(filter, true).finally(() => setLoadingMore(false));
    }
  };
  // FILTER + SEARCH
  const filteredEmails = allEmails.filter((mail) => {
    const s = search.toLowerCase();

    const matchesSearch =
      mail.subject?.toLowerCase().includes(s) ||
      mail.from?.toLowerCase().includes(s);

    // 👇 TAB FILTER LOGIC
    const matchesTab =
      tab === "primary"
        ? mail.category === "primary"
        : tab === "social"
        ? mail.category === "social"
        : tab === "promo"
        ? mail.category === "promo"
        : true;
    return matchesSearch && matchesTab;
  });
  useEffect(() => {
    const handleKey = (e) => {
      if (selectedEmail) return;

      if (e.key === "ArrowDown") {
        setActiveIndex((prev) => Math.min(prev + 1, filteredEmails.length - 1));
      }

      if (e.key === "ArrowUp") {
        setActiveIndex((prev) => Math.max(prev - 1, 0));
      }

      if (e.key === "Enter") {
        const mail = filteredEmails[activeIndex];
        if (mail) {
          setSelectedEmail(mail);
          if (!mail.read) markAsRead(mail.id);
        }
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [filteredEmails, activeIndex, selectedEmail]);
  // CREATE (SEND MAIL)
  const sendMail = async () => {
    try {
      if (composeMode === "reply") {
        await api.post("/api/admin/users/emails/reply", {
          to: form.to,
          subject: form.subject,
          message: form.body,
          originalEmail: selectedEmail,
        });
      } else {
        const res = await api.post("/api/admin/users/emails", form);
        setAllEmails([res.data, ...allEmails]);
      }

      setShowCompose(false);
      setForm({ to: "", subject: "", body: "" });
    } catch {
      alert("Failed to send");
    }
  };

  // UPDATE
  const toggleStar = async (id) => {
    setAllEmails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, starred: !m.starred } : m)),
    );
    await api.patch(`/api/admin/users/emails/${id}/star`);
  };

  const markAsRead = async (id) => {
    setAllEmails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, read: true } : m)),
    );
    await api.patch(`/api/admin/users/emails/${id}/read`);
  };
  useEffect(() => {
    const handleKey = (e) => {
      if (!selectedEmail) return;

      // DELETE key
      if (e.key === "Delete") {
        deleteMail(selectedEmail.id);
      }

      // STAR toggle
      if (e.key === "s") {
        toggleStar(selectedEmail.id);
      }

      // MARK READ
      if (e.key === "r") {
        markAsRead(selectedEmail.id);
      }
    };

    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [selectedEmail]);
  // DELETE (soft delete)
  const deleteMail = async (id) => {
    setAllEmails((prev) =>
      prev.map((m) => (m.id === id ? { ...m, deleted: true } : m)),
    );
    setSelectedEmail(null);
    await api.delete(`/api/admin/users/emails/${id}`);
  };
  const handleBulkDelete = async () => {
    await Promise.all(
      selectedIds.map((id) => api.delete(`/api/admin/users/emails/${id}`)),
    );

    setAllEmails((prev) =>
      prev.map((m) =>
        selectedIds.includes(m.id) ? { ...m, deleted: true } : m,
      ),
    );

    setSelectedIds([]);
  };
  const safeHTML = DOMPurify.sanitize(selectedEmail?.body || "", {
    ADD_TAGS: ["img", "a", "style"],
    ADD_ATTR: [
      "src",
      "href",
      "alt",
      "title",
      "target",
      "rel",
      "width",
      "height",
      "style",
      "class",
      "loading",
      "data-src",
    ],
  });

  return (
    <div className="inbox-container">
      {/* SIDEBAR */}
      {sidebarOpen && (
        <div
          className="sidebar-overlay"
          onClick={() => setSidebarOpen(false)}
        />
      )}
      <div className={`inbox-container-sidebar ${sidebarOpen ? "open" : ""}`}>
        <div className="close-sidebar" onClick={() => setSidebarOpen(false)}>
          ✕
        </div>{" "}
        <button className="compose" onClick={() => setShowCompose(true)}>
          + Compose
        </button>
        <div
          onClick={() => {
            setFilter("inbox");
            fetchEmails("inbox");

            setSelectedEmail(null);
            setSidebarOpen(false);
          }}
        >
          📥 Inbox
        </div>
        <div
          onClick={() => {
            setFilter("starred");
            setSelectedEmail(null);
            setSidebarOpen(false);
          }}
        >
          ⭐ Starred
        </div>
        <div
          onClick={() => {
            setFilter("sent");
            fetchEmails("sent"); // 🔥 IMPORTANT FIX
            setSelectedEmail(null);
            setSidebarOpen(false);
          }}
        >
          📤 Sent
        </div>
        <div
          onClick={() => {
            setFilter("trash");
            fetchEmails("trash");
            setSelectedEmail(null);
            setSidebarOpen(false);
          }}
        >
          <FaTrash /> Trash
        </div>
      </div>

      {/* MAIN PANEL (THIS IS THE FIX) */}
      <div className="main">
        {/* TABS */}
        <div className="tabs">
          <div
            className={!sidebarOpen ? "hamburger" : "hidehamburger"}
            onClick={() => setSidebarOpen(true)}
          >
            ☰
          </div>
          <div
            className={tab === "primary" ? "tab active" : "tab"}
            onClick={() => setTab("primary")}
          >
            📩 Primary
          </div>

          <div
            className={tab === "social" ? "tab active" : "tab"}
            onClick={() => setTab("social")}
          >
            👥 Social
          </div>

          <div
            className={tab === "promo" ? "tab active" : "tab"}
            onClick={() => setTab("promo")}
          >
            🏷 Promotions
          </div>
        </div>

        {/* CONDITIONAL CONTENT (KEY PART) */}
        {selectedEmail ? (
          /* ================= DETAIL VIEW ================= */
          <div className="view">
            <div className="view-header">
              <button onClick={() => setSelectedEmail(null)}>⬅ Back</button>
              <button onClick={() => setReplyMode(!replyMode)}>Reply</button>

              <button onClick={() => deleteMail(selectedEmail.id)}>
                Delete
              </button>
            </div>

            <div className="email-header">
              <h2 className="email-header-h2">{selectedEmail.subject}</h2>

              <div className="email-meta">
                <span className="email-from">{selectedEmail.fullfrom}</span>
                <span className="email-date">{selectedEmail.date}</span>
              </div>
            </div>
            <div className="email-body">
              <div dangerouslySetInnerHTML={{ __html: safeHTML }} />
            </div>
            {replyMode && (
              <div className="reply-box">
                <textarea
                  placeholder="Write your reply..."
                  value={replyText}
                  onChange={(e) => setReplyText(e.target.value)}
                />
                <button
                  onClick={() => {
                    setComposeMode("reply");
                    setForm({
                      to: extractEmail(selectedEmail.fullfrom),
                      subject: `Re: ${selectedEmail.subject}`,
                      body: "",
                    });
                    setShowCompose(true);
                  }}
                >
                  Reply
                </button>
                <button onClick={() => setReplyMode(false)}>Cancel</button>
              </div>
            )}
          </div>
        ) : (
          /* ================= EMAIL LIST ================= */
          <div className="list" onScroll={handleScroll}>
            <div className="list-header">
              <input
                placeholder="Search mail"
                value={search}
                onChange={(e) => setSearch(e.target.value)}
              />

              <button className="refresh-btn" onClick={fetchEmails}>
                🔄
              </button>

              {selectedIds.length > 0 && (
                <button onClick={handleBulkDelete}>
                  Delete ({selectedIds.length})
                </button>
              )}
            </div>

            {filteredEmails.map((mail, index) => (
              <div
                key={mail.id}
                className={`mail-row ${!mail.read ? "unread" : ""} ${
                  index === activeIndex ? "active" : ""
                }`}
                onClick={(e) => {
                  // prevent checkbox click from triggering row open
                  if (e.target.type === "checkbox") return;

                  setSelectedEmail(mail);

                  if (!mail.read) markAsRead(mail.id);
                }}
              >
                <input
                  type="checkbox"
                  checked={selectedIds.includes(mail.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    setSelectedIds((prev) =>
                      prev.includes(mail.id)
                        ? prev.filter((id) => id !== mail.id)
                        : [...prev, mail.id],
                    );
                  }}
                />

                <span
                  onClick={(e) => {
                    e.stopPropagation();
                    toggleStar(mail.id);
                  }}
                >
                  {mail.starred ? "⭐" : "☆"}
                </span>

                <span className="from">{mail.from}</span>

                <span className="subject">
                  {mail.read ? mail.subject : <b>{mail.subject}</b>}
                  <span className="snippet"> — {mail.snippet}</span>
                </span>

                <span className="date">{mail.date}</span>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* COMPOSE MODAL */}
      {showCompose && (
        <div className="modal">
          <div className="modal-box">
            <h3>New Message</h3>

            <input
              placeholder="To"
              value={form.to}
              onChange={(e) => setForm({ ...form, to: e.target.value })}
              required
            />

            <input
              placeholder="Subject"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
            />

            <textarea
              placeholder="Message..."
              value={form.body}
              onChange={(e) => setForm({ ...form, body: e.target.value })}
            />

            <div className="actions">
              <button
                className="actions-buttons"
                onClick={() => setShowCompose(false)}
              >
                Cancel
              </button>
              <button onClick={sendMail}>Send</button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

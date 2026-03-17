import React, { useState } from "react";
import AdminMcq from "../components/mcq/AdminMcq";
import AdminExamAnalytics from "../components/mcq/AdminExamAnalytics";
import "./css/AdminDashboard.css";
export default function AdminDashboard() {
  const [tab, setTab] = useState("mcq");

  return (
    <div className="admin-dashboard">
      <div className="admin-tabs">
        <button
          className={tab === "mcq" ? "active" : ""}
          onClick={() => setTab("mcq")}
        >
          MCQ Manager
        </button>
        <button
          className={tab === "exam" ? "active" : ""}
          onClick={() => setTab("exam")}
        >
          Exam Attempts
        </button>
      </div>

      <div className="admin-content">
        {tab === "mcq" && <AdminMcq />}

        {tab === "exam" && <AdminExamAnalytics />}
      </div>
    </div>
  );
}

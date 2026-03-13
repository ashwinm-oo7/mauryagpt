import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import api from "../../auth/axiosInstance";
import DomainSelector from "./DomainSelector";
import MCQForm from "./MCQForm";
import LevelMCQs from "./LevelMCQs";
import "./AdminMcq.css";

const AdminMcq = () => {
  const { token } = useAuth();
  const navigate = useNavigate();

  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingMCQ, setEditingMCQ] = useState(null);
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);

  const generateAI = async () => {
    try {
      const res = await api.post("/api/mcq/generate-ai", {
        topic,
        count,
      });

      console.log(res.data);

      toast.success("AI questions generated");
    } catch {
      toast.error("AI generation failed");
    }
  };
  // Redirect if not logged in
  useEffect(() => {
    if (!token) navigate("/login");
  }, [token, navigate]);

  // Fetch all domains
  const fetchDomains = async () => {
    try {
      const res = await api.get("/api/mcq/domains");
      setDomains(res.data);
    } catch {
      toast.error("Failed to load domains");
    }
  };

  // Fetch MCQs per domain
  const fetchDomainData = async (domain) => {
    if (!domain) return;
    try {
      setLoading(true);
      const res = await api.get(`/api/mcq?domain=${domain}`);
      const data = res.data;

      const lvlMap = Array.from(
        data.reduce((map, m) => {
          if (!map.has(m.level)) map.set(m.level, []);
          map.get(m.level).push(m);
          return map;
        }, new Map()),
      ).map(([levelNumber, questions]) => ({
        number: levelNumber,
        questions,
        count: questions.length,
        timeLimit: questions[0]?.timeLimit || 10,
      }));

      setLevels(lvlMap);
    } catch {
      toast.error("Failed to load MCQs for domain");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchDomains();
  }, []);

  useEffect(() => {
    fetchDomainData(selectedDomain);
  }, [selectedDomain]);

  // Add or update MCQ
  const handleSubmitMCQ = async (mcqData) => {
    try {
      if (editingMCQ) {
        await api.put(`/api/mcq/${editingMCQ._id}`, mcqData);
        toast.success("MCQ updated!");
        setEditingMCQ(null);
      } else {
        await api.post("/api/mcq", mcqData);
        toast.success("MCQ added!");
      }
      fetchDomainData(selectedDomain);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // Delete MCQ
  const handleDeleteMCQ = async (id) => {
    if (!window.confirm("Are you sure you want to delete this MCQ?")) return;
    try {
      await api.delete(`/api/mcq/${id}`);
      toast.success("MCQ deleted!");
      fetchDomainData(selectedDomain);
    } catch (err) {
      toast.error(err.response?.data?.message || err.message);
    }
  };

  // Edit MCQ
  const handleEditMCQ = (mcq) => {
    setEditingMCQ(mcq);
    window.scrollTo({ top: 0, behavior: "smooth" }); // Scroll to top for edit form
  };
  const handleBulkUpload = async (e) => {
    const file = e.target.files[0];

    const formData = new FormData();
    formData.append("file", file);

    try {
      await api.post("/api/mcq/bulk-upload", formData);

      toast.success("Bulk upload successful");

      fetchDomainData(selectedDomain);
    } catch {
      toast.error("Upload failed");
    }
  };
  return (
    <div className="admin-mcq-page">
      <Toaster position="top-right" />
      <div className="container">
        <div className="ai-generator">
          <input
            placeholder="Topic (e.g. JavaScript closures)"
            value={topic}
            onChange={(e) => setTopic(e.target.value)}
          />

          <input
            type="number"
            value={count}
            onChange={(e) => setCount(e.target.value)}
          />

          <button onClick={generateAI}>Generate MCQs</button>
        </div>
        <h1 className="page-title">Admin MCQ Dashboard</h1>
        <input type="file" onChange={handleBulkUpload} />
        {/* STEP 1: Domain Selector */}
        <DomainSelector
          domains={domains}
          selectedDomain={selectedDomain}
          setSelectedDomain={setSelectedDomain}
        />

        {/* STEP 2: Add/Edit MCQ Form (Top right) */}
        {selectedDomain && (
          <MCQForm
            selectedDomain={selectedDomain}
            onSubmit={handleSubmitMCQ}
            initialData={editingMCQ}
          />
        )}

        {/* STEP 3: Levels & Questions */}
        {selectedDomain && (
          <div className="domain-list">
            {loading ? (
              <p className="loading-text">Loading MCQs...</p>
            ) : levels.length === 0 ? (
              <p className="loading-text">
                No questions exist for this domain yet.
              </p>
            ) : (
              levels.map((level) => (
                <LevelMCQs
                  key={level.number}
                  level={level}
                  onDelete={handleDeleteMCQ}
                  onEdit={handleEditMCQ}
                  domain={selectedDomain}
                  refresh={() => fetchDomainData(selectedDomain)}
                />
              ))
            )}
          </div>
        )}
      </div>
    </div>
  );
};

export default AdminMcq;

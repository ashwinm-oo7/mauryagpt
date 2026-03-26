import React, { useState, useEffect } from "react";
import { useAuth } from "../../auth/AuthContext";
import { useNavigate } from "react-router-dom";
import toast, { Toaster } from "react-hot-toast";
import api from "../../auth/axiosInstance";
import DomainSelector from "./DomainSelector";
import MCQForm from "./MCQForm";
import LevelMCQs from "./LevelMCQs";
import "./AdminMcq.css";
import ExcelPreview from "./ExcelPreview";
import UploadProgressModal from "../../utils/UploadProgressModal";

const AdminMcq = () => {
  const { user } = useAuth();
  const navigate = useNavigate();

  const [domains, setDomains] = useState([]);
  const [selectedDomain, setSelectedDomain] = useState("");
  const [levels, setLevels] = useState([]);
  const [loading, setLoading] = useState(false);
  const [editingMCQ, setEditingMCQ] = useState(null);
  const [topic, setTopic] = useState("");
  const [count, setCount] = useState(5);
  const [progress, setProgress] = useState(0);
  const [showProgress, setShowProgress] = useState(false);
  const [status, setStatus] = useState("Preparing upload...");
  const [resetPreview, setResetPreview] = useState(false);
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
    if (!user) navigate("/login");
  }, [user, navigate]);

  // Fetch all domains
  const fetchDomains = async () => {
    try {
      const res = await api.get("/api/mcq/domains");
      console.log("mcq/domains", res.data);
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
      ).map(([levelNumber, questions]) => {
        const totalTimeLimit = questions.reduce(
          (sum, question) => sum + question.timeLimit,
          0,
        );
        return {
          number: levelNumber,
          questions,
          count: questions.length,
          timeLimit: totalTimeLimit || 10, // Summing time limits or fallback to 10
        };
      });

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

  const handleBulkUpload = async (file) => {
    if (!file) {
      toast.error("Please select an Excel file");
      return;
    }

    const formData = new FormData();
    formData.append("file", file);

    try {
      setShowProgress(true);
      setProgress(0);
      setStatus("Uploading file...");

      const res = await api.post("/api/mcq/bulk-upload", formData, {
        headers: {
          "Content-Type": "multipart/form-data",
        },
        onUploadProgress: (progressEvent) => {
          const percent = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total,
          );
          setProgress(percent);

          if (percent === 100) {
            setStatus("Processing data...");
          }
        },
      });

      setStatus("Finalizing...");

      setTimeout(() => {
        setShowProgress(false);
        setProgress(0);
      }, 1000);

      toast.success(res.data.message || "Upload successful");
      setResetPreview((prev) => !prev);

      fetchDomainData(selectedDomain);
    } catch (err) {
      const message =
        err.response?.data?.message || // backend message
        err.response?.data?.error ||
        err.message || // network error
        "Upload failed";

      setShowProgress(false);
      toast.error(message);
    } finally {
      setShowProgress(false);
    }
  };
  return (
    <div className="admin-mcq-page">
      <Toaster position="top-right" />
      <div className="adminmcq-container">
        {/* Top Right Container with both AI Generator and File Upload */}
        <div className="top-right-container">
          <h1 className="page-title">Admin MCQ Dashboard</h1>
          <div className="ai-generator">
            <div className="input-container">
              <input
                placeholder="Topic (e.g. JavaScript closures)"
                value={topic || ""}
                onChange={(e) => setTopic(e.target.value || "")}
              />
              <input
                type="number"
                value={count || 5}
                onChange={(e) => setCount(e.target.value ? +e.target.value : 5)}
              />
              <button onClick={generateAI}>Generate MCQs</button>
              {/* <div className="custom-file-input">
                <button disabled={uploading} htmlFor="file-upload">
                  <input
                    type="file"
                    id="file-upload"
                    onChange={handleBulkUpload}
                  />
                  Choose a File
                </button>
                <div className="file-name" id="file-name"></div>
              </div> */}
              <ExcelPreview
                onConfirm={(file) => handleBulkUpload(file)}
                resetTrigger={resetPreview}
                showProgress={showProgress}
              />{" "}
            </div>
          </div>
        </div>
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
      {showProgress && (
        <UploadProgressModal progress={progress} status={status} />
      )}
    </div>
  );
};

export default AdminMcq;

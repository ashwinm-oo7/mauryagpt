import React, { useEffect, useState } from "react";
import { useLocation, useParams } from "react-router-dom";
import api from "../../auth/axiosInstance";
import "./VerifyCertificate.css";

export default function VerifyCertificate() {
  const { certificateId } = useParams();
  const [data, setData] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);
  const location = useLocation();
  const queryParams = new URLSearchParams(location.search);
  const isThumbnail = queryParams.get("thumbnail") === "true";
  // Simple mobile detection
  // const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

  useEffect(() => {
    const loadCertificate = async () => {
      try {
        // 1️⃣ Verify certificate
        const res = await api.get(`/api/exam/verify/${certificateId}`);
        setData(res.data);

        // 2️⃣ Create blob URL for PDF preview
        const pdfRes = await api.get(
          `/api/exam/certificate/download/${res.data.domain}/${res.data.level}/${certificateId}`,
          { responseType: "blob" },
        );

        const url = URL.createObjectURL(
          new Blob([pdfRes.data], { type: "application/pdf" }),
        );
        setPdfUrl(url);
      } catch (err) {
        setData({ valid: false });
      } finally {
        setLoading(false);
      }
    };

    loadCertificate();
  }, [certificateId]);
  useEffect(() => {
    const handleContextMenu = (e) => e.preventDefault();
    document.addEventListener("contextmenu", handleContextMenu);

    return () => {
      document.removeEventListener("contextmenu", handleContextMenu);
    };
  }, []);
  // useEffect(() => {
  //   const handleBlur = () => {
  //     document.body.style.filter = "blur(8px)";
  //   };
  //   const handleFocus = () => {
  //     document.body.style.filter = "none";
  //   };

  //   window.addEventListener("blur", handleBlur);
  //   window.addEventListener("focus", handleFocus);

  //   return () => {
  //     window.removeEventListener("blur", handleBlur);
  //     window.removeEventListener("focus", handleFocus);
  //   };
  // }, []);
  useEffect(() => {
    const handleKeyDown = (e) => {
      if (
        e.key === "F12" ||
        (e.ctrlKey && e.shiftKey && ["I", "J", "C"].includes(e.key)) ||
        (e.ctrlKey && e.key === "U")
      ) {
        e.preventDefault();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, []);

  if (loading) return <h2>Loading Certificate...</h2>;
  if (!data?.valid) return <h2>❌ Invalid Certificate</h2>;

  return (
    <div className={isThumbnail ? "thumbnail-container" : "verify-container"}>
      {!isThumbnail && (
        <div className="verify-left">
          <div className="brand">
            <h2>MauryaAI 🚀</h2>
            <p className="tagline">Skill Certification System</p>
          </div>
          <div className="user-info">
            <p>
              <span>User:</span> {data.userfullname}
            </p>
            <p>
              <span>Domain:</span> {data.domain}
            </p>
            <p>
              <span>Level:</span> {data.level}
            </p>
            <p>
              <span>Score:</span> {data.score}%
            </p>
          </div>
          <div className="watermark">
            {data.userfullname} • Verified • {new Date().toLocaleDateString()}
          </div>{" "}
          <a href="/" className="home-btn">
            🏠 Back to Home
          </a>
        </div>
      )}
      <div className={isThumbnail ? "thumbnail-view" : "verify-right"}>
        {pdfUrl ? (
          <iframe
            src={
              isThumbnail
                ? `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&zoom=20`
                : `${pdfUrl}#toolbar=0&navpanes=0&scrollbar=0&zoom=60`
            }
            title="Certificate Preview"
            width="100%"
            height="100%"
            style={{ border: "none" }}
          />
        ) : (
          <p>Loading preview...</p>
        )}
      </div>
    </div>
  );
}

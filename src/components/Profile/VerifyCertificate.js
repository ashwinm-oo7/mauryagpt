import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../auth/axiosInstance";
import "./VerifyCertificate.css";

export default function VerifyCertificate() {
  const { certificateId } = useParams();
  const [data, setData] = useState(null);
  const [pdfUrl, setPdfUrl] = useState(null);
  const [loading, setLoading] = useState(true);

  // Simple mobile detection
  const isMobile = /iPhone|iPad|iPod|Android/i.test(navigator.userAgent);

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

  if (loading) return <h2>Loading Certificate...</h2>;
  if (!data?.valid) return <h2>❌ Invalid Certificate</h2>;

  return (
    <div className="verify-container">
      <div className="verify-left">
        <h2>Your Platform 🚀</h2>
        <p>Skill Certification System</p>
        <hr />
        <p>
          <b>User:</b> {data.userfullname}
        </p>
        <p>
          <b>Domain:</b> {data.domain}
        </p>
        <p>
          <b>Level:</b> {data.level}
        </p>
        <p>
          <b>Score:</b> {data.score}%
        </p>
        <p className="verified">✅ Verified Certificate</p>
      </div>

      <div className="verify-right">
        {isMobile ? (
          <p>
            Mobile preview may not work.{" "}
            <a
              href={`/api/exam/certificate/download/${data.domain}/${data.level}/${certificateId}`}
              target="_blank"
              rel="noopener noreferrer"
            >
              Download Certificate
            </a>
          </p>
        ) : pdfUrl ? (
          <iframe
            src={pdfUrl}
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

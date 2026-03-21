import React, { useEffect, useState } from "react";
import api from "../../auth/axiosInstance";
// import { safeApi } from "../../utils/safeApi";

export default function UserCertificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const loadCerts = async () => {
    setLoading(true);

    try {
      const res = await api.get("/api/exam/exam/my-certificates");

      if (!res.data.success) {
        throw new Error(res.data.message || "Failed to load certificates");
      }

      setCerts(res.data.data || []);
    } catch (err) {
      console.error("Certificate load error:", err);

      setError(
        err?.response?.data?.message ||
          err.message ||
          "Failed to load certificates",
      );
    } finally {
      setLoading(false);
    }
  };
  useEffect(() => {
    loadCerts();
  }, []);
  const downloadCertificate = async (domain, level) => {
    try {
      const res = await api.get(
        `/api/exam/certificate/download/${domain}/${level}`,
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(new Blob([res.data]));

      const link = document.createElement("a");
      link.href = url;
      link.download = `${domain}-level-${level}-certificate.pdf`;

      document.body.appendChild(link);
      link.click();
      link.remove();
    } catch (err) {
      alert("Failed to download certificate");
    }
  };
  const previewCertificate = async (domain, level) => {
    try {
      const res = await api.get(
        `/api/exam/certificate/download/${domain}/${level}?preview=true`,
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" }),
      );

      // 👇 OPEN IN NEW TAB (PREVIEW)
      window.open(url, "_blank");
    } catch (err) {
      alert("Failed to preview certificate");
    }
  };
  if (loading) {
    return <p>Loading certificates...</p>;
  }

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }
  return (
    <div className="certificate-card">
      {" "}
      <h2>My Certificates</h2>
      {certs.length === 0 ? (
        <p>No certificates found</p>
      ) : (
        certs.map((c) => (
          <div key={c.certificateId} className="certificate-card">
            <h3>
              {c.domain} Level {c.level}
            </h3>
            <p>Score: {c.percentage}%</p>
            <p>
              Issued: {new Date(c.certificateIssuedAt).toLocaleDateString()}
            </p>
            <button onClick={() => downloadCertificate(c.domain, c.level)}>
              Download Certificate
            </button>{" "}
            <button onClick={() => previewCertificate(c.domain, c.level)}>
              Preview Certificate
            </button>
          </div>
        ))
      )}
    </div>
  );
}

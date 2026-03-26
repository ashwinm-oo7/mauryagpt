import React, { useEffect, useState } from "react";
import api from "../../auth/axiosInstance";
import { LoadingComponent } from "../../utils/LoadingComponent";
// import { safeApi } from "../../utils/safeApi";

export default function UserCertificates() {
  const [certs, setCerts] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [actionLoading, setActionLoading] = useState(null); // track per button

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
  const downloadCertificate = async (domain, level, certificateId) => {
    setActionLoading(certificateId + "-download");

    try {
      const res = await api.get(
        `/api/exam/certificate/download/${domain}/${level}/${certificateId}`,
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
    } finally {
      setActionLoading(null);
    }
  };
  const getShareLink = (certificateId) => {
    const link = `${window.location.origin}/verify/${certificateId}`;
    navigator.clipboard.writeText(link);
    alert("Link copied!");
  };
  const previewCertificate = async (domain, level, certificateId) => {
    setActionLoading(certificateId + "-preview");

    try {
      const res = await api.get(
        `/api/exam/certificate/download/${domain}/${level}/${certificateId}?preview=true`,
        { responseType: "blob" },
      );

      const url = window.URL.createObjectURL(
        new Blob([res.data], { type: "application/pdf" }),
      );

      // 👇 OPEN IN NEW TAB (PREVIEW)
      window.open(url, "_blank");
    } catch (err) {
      alert("Failed to preview certificate");
    } finally {
      setActionLoading(null);
    }
  };

  if (loading) return <LoadingComponent />;

  if (error) {
    return <p style={{ color: "red" }}>{error}</p>;
  }
  return (
    <div className="certificate-card-container">
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
            <button
              disabled={actionLoading !== null}
              onClick={() =>
                downloadCertificate(c.domain, c.level, c.certificateId)
              }
            >
              {actionLoading === c.certificateId + "-download"
                ? "Downloading..."
                : "Download Certificate"}
            </button>{" "}
            <button
              disabled={actionLoading !== null}
              onClick={() =>
                previewCertificate(c.domain, c.level, c.certificateId)
              }
            >
              {actionLoading === c.certificateId + "-preview"
                ? "Opening..."
                : "Preview Certificate"}
            </button>
            <button onClick={() => getShareLink(c.certificateId)}>
              Get Share Link
            </button>
          </div>
        ))
      )}
      {actionLoading && (
        <LoadingComponent text="Maurya Institute Processing..." />
      )}
    </div>
  );
}

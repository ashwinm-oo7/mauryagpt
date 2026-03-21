import React, { useEffect, useState } from "react";
import api from "../../auth/axiosInstance";
import { safeApi } from "../../utils/safeApi";

export default function UserDashboards() {
  const [certificates, setCertificates] = useState([]);
  const [badges, setBadges] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let mounted = true;

    const fetchData = async () => {
      setLoading(true);
      setError("");

      try {
        const [certs, badges] = await Promise.all([
          safeApi(api.get("/api/exam/exam/my-certificates")),
          safeApi(api.get("/api/exam/badges")),
        ]);
        console.log("certData, badgeData", certs, badges);
        if (!mounted) return;

        setCertificates(Array.isArray(certs) ? certs : []);
        setBadges(Array.isArray(badges) ? badges : []);
      } catch (err) {
        console.error("Dashboard load error:", err);

        if (!mounted) return;

        setError(err.message || "Failed to load dashboard");
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchData();

    return () => {
      mounted = false;
    };
  }, []);

  if (loading) {
    return <p>Loading dashboard...</p>;
  }

  //   if (error) {
  //     return (
  //   <div className="dashboard-error">
  //     <p>{error}</p>
  //     <button onClick={() => window.location.reload()}>Retry</button>
  //   </div>;
  //     );
  //   }

  return (
    <div className="dashboard-cards">
      <div className="dashboard-card">
        <div className="dashboard-error">
          {error && (
            <>
              <p>{error}</p>
              <button onClick={() => window.location.reload()}>Retry</button>
            </>
          )}
        </div>

        <h3>Certificates</h3>
        <p>{certificates.length}</p>
      </div>

      <div className="dashboard-card">
        <h3>Badges</h3>
        <p>{badges.length}</p>
      </div>
    </div>
  );
}

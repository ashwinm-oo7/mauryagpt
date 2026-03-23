import React, { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import api from "../../auth/axiosInstance";
import "./PublicProfile.css";

export default function PublicProfile() {
  const { username } = useParams();

  const [profile, setProfile] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    loadProfile();
  }, [username]);

  const loadProfile = async () => {
    try {
      const res = await api.get(`/api/profile/getid`);

      setProfile(res.data.data);
    } catch (err) {
      console.error(err);
      setError("Profile not found");
    } finally {
      setLoading(false);
    }
  };

  if (loading) return <div className="public-profile-loading">Loading...</div>;

  if (error) return <div className="public-profile-error">{error}</div>;

  return (
    <div className="public-profile-container">
      <div className="public-profile-card">
        <h1>{profile.name}</h1>

        <p className="public-profile-email">{profile.email}</p>

        <div className="public-profile-stats">
          <div className="stat">
            <span className="stat-value">{profile.certificates.length}</span>
            <span className="stat-label">Certificates</span>
          </div>

          <div className="stat">
            <span className="stat-value">{profile.avgScore}%</span>
            <span className="stat-label">Avg Score</span>
          </div>

          <div className="stat">
            <span className="stat-value">
              {profile.domainsCompleted.length}
            </span>
            <span className="stat-label">Domains</span>
          </div>
        </div>

        <div className="public-profile-section">
          <h3>Completed Domains</h3>

          <div className="PublicProfile-domain-list">
            {profile.domainsCompleted.map((d, i) => (
              <span key={i} className="PublicProfile-domain-chip">
                {d}
              </span>
            ))}
          </div>
        </div>

        <div className="public-profile-section">
          <h3>Certificates</h3>

          {profile.certificates.map((c, i) => (
            <div key={i} className="certificate-item">
              <div>
                <strong>{c.domain}</strong> Level {c.level}
              </div>

              <div>{c.percentage}%</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../auth/axiosInstance";
import "./DomainList.css";

const DomainList = () => {
  const [domains, setDomains] = useState([]);
  const [search, setSearch] = useState("");
  const navigate = useNavigate();

  useEffect(() => {
    const fetchDomains = async () => {
      try {
        const res = await api.get("/api/mcq/domains");
        setDomains(res.data);
      } catch {
        toast.error("Failed to load domains");
      }
    };

    fetchDomains();
  }, []);

  const handleSelectDomain = (domain) => navigate(`/user/levels/${domain}`);

  // 🔍 FILTERED LIST
  const filteredDomains = domains.filter((d) =>
    d.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="domain-container">
      <h2 className="domain-title">Available Domains</h2>

      {/* 🔍 SEARCH BAR */}
      <div className="domain-search-box">
        <input
          type="text"
          placeholder="Search domain..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
      </div>

      {/* LIST */}
      <ul className="domain-list">
        {filteredDomains.length > 0 ? (
          filteredDomains.map((domain) => (
            <li key={domain}>
              <button onClick={() => handleSelectDomain(domain)}>
                {domain}
              </button>
            </li>
          ))
        ) : (
          <p className="no-result">No domain found</p>
        )}
      </ul>
    </div>
  );
};

export default DomainList;

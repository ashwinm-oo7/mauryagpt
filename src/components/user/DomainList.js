import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import api from "../../auth/axiosInstance";
import "./DomainList.css";
const DomainList = () => {
  const [domains, setDomains] = useState([]);
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

  return (
    <div className="container">
      <h2>Available Domains</h2>
      <ul className="domain-list">
        {domains.map((domain) => (
          <li key={domain}>
            <button onClick={() => handleSelectDomain(domain)}>{domain}</button>
          </li>
        ))}
      </ul>
    </div>
  );
};

export default DomainList;

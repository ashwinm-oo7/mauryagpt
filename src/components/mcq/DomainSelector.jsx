import React, { useState } from "react";

const DomainSelector = ({ domains, selectedDomain, setSelectedDomain }) => {
  const [search, setSearch] = useState("");

  const filteredDomains = domains.filter((d) =>
    d.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <div className="create-card domain-selector">
      <label>Select Domain</label>
      <input
        type="text"
        placeholder="Search domains..."
        value={search}
        onChange={(e) => setSearch(e.target.value)}
        className="domain-search"
      />
      <select
        value={selectedDomain}
        onChange={(e) => setSelectedDomain(e.target.value)}
      >
        <option value="">-- Choose a domain --</option>
        {filteredDomains.map((d) => (
          <option key={d} value={d}>
            {d}
          </option>
        ))}
      </select>
    </div>
  );
};

export default DomainSelector;

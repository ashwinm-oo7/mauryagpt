import React, { useState, useRef } from "react";
import "./sidebar.css";

export default function Sidebar({ className = "", onSelect }) {
  const [width, setWidth] = useState(250); // default width
  const resizerRef = useRef(null);
  const isResizing = useRef(false);

  // Original top-level scenarios
  const baseScenarios = [
    { label: "CompanyHeader", value: "what is companyheader?" },
    { label: "PageHeader", value: "what is pageheader?" },
    { label: "Details", value: "what is details view?" },
    { label: "ReportFooter", value: "what is reportfooter?" },
    { label: "SQL Generator", value: "generate sql" },
    { label: "Lines / vLines", value: "explain line and vline" },
    { label: "Formats", value: "explain formats" },
  ];

  // The full views JSON (simplified to only what's needed for sidebarQuestions)
  const views = [
    {
      name: "companyheader",
      sidebarQuestions: [
        "What is companyheader?",
        "Show companyheader example",
        "Explain companyheader attributes",
        "Explain !heading keyword in companyheader",
        "Explain line/vline usage in companyheader",
      ],
    },
    {
      name: "pageheader",
      sidebarQuestions: [
        "What is pageheader?",
        "Show pageheader example",
        "Explain pageheader attributes",
        "Explain !heading keyword in pageheader",
        "Explain line/vline usage in pageheader",
      ],
    },
    {
      name: "details",
      sidebarQuestions: [
        "What is details section?",
        "Show details example",
        "Explain details attributes",
        "How to show line/vline in details",
      ],
    },
    {
      name: "reportfooter",
      sidebarQuestions: [
        "What is reportfooter?",
        "Show reportfooter example",
        "Explain reportfooter attributes",
        "How to show line/vline in reportfooter",
      ],
    },
    {
      name: "formats",
      sidebarQuestions: [
        "Explain font properties",
        "Explain bold and alignment",
        "Explain visibility in formats",
      ],
    },
    {
      name: "lines",
      sidebarQuestions: [
        "How to draw horizontal line?",
        "How to draw vertical line?",
        "Explain line_height property",
      ],
    },
  ];

  // Combine baseScenarios + all sidebarQuestions from views
  const scenarios = [
    ...baseScenarios,
    ...views.flatMap((view) =>
      view.sidebarQuestions.map((q) => ({ label: q, value: q }))
    ),
  ];

  // Resizer logic
  const handleMouseDown = (e) => {
    isResizing.current = true;
    document.addEventListener("mousemove", handleMouseMove);
    document.addEventListener("mouseup", handleMouseUp);
    e.preventDefault();
  };

  const handleMouseMove = (e) => {
    if (!isResizing.current) return;
    let newWidth = e.clientX;
    if (newWidth < 150) newWidth = 150;
    if (newWidth > 500) newWidth = 500;
    setWidth(newWidth);
  };

  const handleMouseUp = () => {
    isResizing.current = false;
    document.removeEventListener("mousemove", handleMouseMove);
    document.removeEventListener("mouseup", handleMouseUp);
  };

  return (
    <div className={`sidebar ${className}`} style={{ width: `${width}px` }}>
      <div className="sidebar-content">
        <h3>Maurya AI Menu</h3>
        <ul>
          {scenarios.map((s, idx) => (
            <li key={idx} onClick={() => onSelect(s.value)}>
              {s.label}
            </li>
          ))}
        </ul>
      </div>

      <div
        className="resizer"
        ref={resizerRef}
        onMouseDown={handleMouseDown}
      ></div>
    </div>
  );
}

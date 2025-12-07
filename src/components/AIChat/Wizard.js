import React, { useState } from "react";
import "./wizard.css";

export default function Wizard({ onGenerate }) {
  const [step, setStep] = useState(1);

  const [repcode, setRepcode] = useState("");
  const [table, setTable] = useState("");
  const [section, setSection] = useState("");

  const repcodes = ["INW", "ACCOUNTS", "INVENTORY", "SALES"];
  const tables = ["asab9", "item", "ledger", "stktrans"];
  const sections = ["companyheader", "pageheader", "details", "reportfooter"];

  return (
    <div className="wizard-box">
      <h3>Report Wizard</h3>

      {step === 1 && (
        <>
          <label>Choose Repcode</label>
          <select value={repcode} onChange={(e) => setRepcode(e.target.value)}>
            <option value="">-- Select --</option>
            {repcodes.map((m) => (
              <option key={m}>{m}</option>
            ))}
          </select>

          <button disabled={!repcode} onClick={() => setStep(2)}>
            Next →
          </button>
        </>
      )}

      {step === 2 && (
        <>
          <label>Choose Table</label>
          <select value={table} onChange={(e) => setTable(e.target.value)}>
            <option value="">-- Select --</option>
            {tables.map((t) => (
              <option key={t}>{t}</option>
            ))}
          </select>

          <div className="wiz-actions">
            <button onClick={() => setStep(1)}>← Back</button>
            <button disabled={!table} onClick={() => setStep(3)}>
              Next →
            </button>
          </div>
        </>
      )}

      {step === 3 && (
        <>
          <label>Select Report Section</label>
          <select value={section} onChange={(e) => setSection(e.target.value)}>
            <option value="">-- Select --</option>
            {sections.map((s) => (
              <option key={s}>{s}</option>
            ))}
          </select>

          <div className="wiz-actions">
            <button onClick={() => setStep(2)}>← Back</button>
            <button
              disabled={!section}
              onClick={() => {
                onGenerate(
                  `generate ${section} for repcode ${repcode} table ${table}`
                );
              }}
            >
              Generate 🚀
            </button>
          </div>
        </>
      )}
    </div>
  );
}

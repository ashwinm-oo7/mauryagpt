import React, { useState, useEffect } from "react";

const MCQForm = ({ selectedDomain, onSubmit, initialData }) => {
  const [form, setForm] = useState(
    initialData || {
      level: 1,
      step: 1,
      timeLimit: 10,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "A",
      explanation: "",
    },
  );

  useEffect(() => {
    if (initialData) setForm(initialData);
  }, [initialData]);

  const handleSubmit = (e) => {
    e.preventDefault();
    if (
      !form.question.trim() ||
      !form.explanation.trim() ||
      form.options.some((o) => !o.trim())
    )
      return alert("All fields are required!");
    onSubmit({ ...form, domain: selectedDomain });
    setForm({
      level: 1,
      step: 1,
      timeLimit: 10,
      question: "",
      options: ["", "", "", ""],
      correctAnswer: "A",
      explanation: "",
    });
  };

  return (
    <div className="create-card">
      <h2>
        {initialData ? "Edit MCQ" : `Add New Question to "${selectedDomain}"`}
      </h2>
      <form onSubmit={handleSubmit}>
        <div className="form-row">
          <div className="form-group">
            <label>Level</label>
            <input
              type="number"
              min="1"
              max="30"
              value={form.level}
              onChange={(e) =>
                setForm({ ...form, level: Number(e.target.value) })
              }
            />
          </div>
          <div className="form-group">
            <label>Step</label>
            <input
              type="number"
              min="1"
              max="25"
              value={form.step}
              onChange={(e) =>
                setForm({ ...form, step: Number(e.target.value) })
              }
            />
          </div>
          <div className="form-group">
            <label>Time Limit (min)</label>
            <input
              type="number"
              min="1"
              max="60"
              value={form.timeLimit}
              onChange={(e) =>
                setForm({ ...form, timeLimit: Number(e.target.value) })
              }
            />
          </div>
        </div>

        <div className="form-group">
          <label>Question</label>
          <textarea
            value={form.question}
            onChange={(e) => setForm({ ...form, question: e.target.value })}
          />
        </div>

        <div className="form-row options-group">
          {form.options.map((opt, i) => (
            <div key={i} className="form-group">
              <label>Option {String.fromCharCode(65 + i)}</label>
              <input
                value={opt}
                onChange={(e) => {
                  const newOpts = [...form.options];
                  newOpts[i] = e.target.value;
                  setForm({ ...form, options: newOpts });
                }}
              />
            </div>
          ))}
        </div>

        {/* Replace the select with radio group */}
        <div className="form-group correct-answer-group">
          <label>Correct Answer</label>
          <div className="radio-options">
            {["A", "B", "C", "D"].map((label) => (
              <label key={label} className="radio-label">
                <input
                  type="radio"
                  name="correctAnswer"
                  value={label}
                  checked={form.correctAnswer === label}
                  onChange={(e) =>
                    setForm({ ...form, correctAnswer: e.target.value })
                  }
                />
                <span>Option {label}</span>
              </label>
            ))}
          </div>
        </div>
        <div className="form-group">
          <label>Explanation</label>
          <textarea
            value={form.explanation}
            onChange={(e) => setForm({ ...form, explanation: e.target.value })}
          />
        </div>

        <button type="submit" className="submit-btn">
          {initialData ? "Update MCQ" : "Add MCQ"}
        </button>
      </form>
    </div>
  );
};

export default MCQForm;

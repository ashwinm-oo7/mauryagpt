import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../../auth/axiosInstance";
import ConfirmDeleteModal from "../../utils/ConfirmDeleteModal";

const LevelMCQs = ({ level, onDelete, onEdit, domain, refresh }) => {
  const [questions, setQuestions] = useState(level.questions);
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState("");
  const [showModal, setShowModal] = useState(false);
  const [selectedIds, setSelectedIds] = useState([]);
  const [lastSelectedIndex, setLastSelectedIndex] = useState(null);
  const [selectAllGlobal, setSelectAllGlobal] = useState(false);
  // Filter questions
  const filteredQuestions = questions.filter((q) =>
    q.question.toLowerCase().includes(search.toLowerCase()),
  );
  const handleSelect = (e, id, index) => {
    if (e.shiftKey && lastSelectedIndex !== null) {
      const start = Math.min(lastSelectedIndex, index);
      const end = Math.max(lastSelectedIndex, index);

      const rangeIds = filteredQuestions
        .slice(start, end + 1)
        .map((q) => q._id);

      setSelectedIds((prev) => [...new Set([...prev, ...rangeIds])]);
    } else {
      setSelectedIds((prev) =>
        prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id],
      );
    }

    setLastSelectedIndex(index);
  };
  const handleSelectAllFiltered = () => {
    const allIds = filteredQuestions.map((q) => q._id);

    const isAllSelected = allIds.every((id) => selectedIds.includes(id));

    if (isAllSelected) {
      setSelectedIds((prev) => prev.filter((id) => !allIds.includes(id)));
    } else {
      setSelectedIds((prev) => [...new Set([...prev, ...allIds])]);
    }
  };
  const handleSelectAllGlobal = () => {
    if (selectAllGlobal) {
      setSelectedIds([]);
      setSelectAllGlobal(false);
    } else {
      const allIds = questions.map((q) => q._id);
      setSelectedIds(allIds);
      setSelectAllGlobal(true);
    }
  };

  const handleDragEnd = async (result) => {
    if (!result.destination) return;

    const reordered = Array.from(questions);
    const [removed] = reordered.splice(result.source.index, 1);

    reordered.splice(result.destination.index, 0, removed);

    setQuestions(reordered);

    try {
      const payload = reordered.map((q, index) => ({
        _id: q._id,
        step: index + 1,
      }));

      await api.put("/api/mcq/reorder", {
        questions: payload,
      });

      toast.success("Order saved");
      refresh();
    } catch (err) {
      toast.error("Failed to save order");
    }
  };
  const handleBulkDelete = async () => {
    if (selectedIds.length === 0) {
      toast.error("No questions selected");
      return;
    }

    try {
      await api.post("/api/mcq/delete-selected", {
        ids: selectedIds,
      });

      toast.success(`${selectedIds.length} questions deleted`);
      setSelectedIds([]);
      setSelectAllGlobal(false); // ✅ ADD THIS
      setShowModal(false);
      refresh();
    } catch (err) {
      toast.error("Bulk delete failed");
    }
  };
  const handleDeleteLevel = async () => {
    try {
      await api.post(
        `/api/mcq/deletedomainlevel?domain=${domain}&level=${level.number}`,
      );

      toast.success("Level deleted successfully");
      setSelectedIds([]); // ✅ ADD THIS
      setSelectAllGlobal(false); // ✅ ADD THIS

      setShowModal(false);

      refresh();
    } catch (err) {
      toast.error("Failed to delete level");
    }
  };
  return (
    <div className="level-card">
      {/* LEVEL HEADER */}
      <div className="level-header" onClick={() => setOpen(!open)}>
        <span onClick={() => setOpen(!open)} style={{ cursor: "pointer" }}>
          Level {level.number} — Timer: {level.timeLimit} min
        </span>

        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <span onClick={() => setOpen(!open)} style={{ cursor: "pointer" }}>
            {questions.length} / {questions.length} {open ? "▲" : "▼"}
          </span>
          <button
            className="delete-level-btn"
            onClick={(e) => {
              e.stopPropagation(); // ✅ FIX
              setShowModal(true);
            }}
            disabled={selectedIds.length > 0}
          >
            DELETE {domain}:LEVEL-{level.number}
          </button>
        </div>
      </div>
      {/* LEVEL PROGRESS BAR */}
      <div className="level-progress">
        <div
          className="level-progress-bar"
          style={{
            width: `${(questions.length / 25) * 100}%`,
          }}
        />
      </div>
      {open && (
        <>
          {/* SEARCH */}
          <input
            className="mcq-search"
            placeholder="Search question..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
          />
          <div className="bulk-actions">
            <label>
              <ianput
                type="checkbox"
                onChange={handleSelectAllFiltered}
                checked={
                  filteredQuestions.length > 0 &&
                  filteredQuestions.every((q) => selectedIds.includes(q._id))
                }
              />
              Select Filtered
            </label>
            <label>
              <input
                type="checkbox"
                onChange={handleSelectAllGlobal}
                checked={selectAllGlobal}
              />
              Select ALL ({questions.length})
            </label>
            {selectedIds.length > 0 && (
              <p className="selection-info">{selectedIds.length} selected</p>
            )}{" "}
            <button
              className="bulk-delete-btn"
              disabled={selectedIds.length === 0}
              onClick={() => setShowModal(true)}
            >
              Delete Selected ({selectedIds.length})
            </button>
          </div>
          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={`level-${level.number}`}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {filteredQuestions.map((q, idx) => (
                    <Draggable key={q._id} draggableId={q._id} index={idx}>
                      {(provided) => (
                        <div
                          className={`mcq-card ${
                            selectedIds.includes(q._id) ? "selected-card" : ""
                          }`}
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
                          <input
                            type="checkbox"
                            onClick={(e) => e.stopPropagation()} // ✅ prevents drag conflict
                            checked={selectedIds.includes(q._id)}
                            onChange={(e) => handleSelect(e, q._id, idx)}
                          />{" "}
                          <p className="question">
                            {q.step}) {q.question}
                          </p>
                          <p>(Min:{q.timeLimit})</p>
                          <ul className="options">
                            {q.options.map((opt, i) => (
                              <li key={i}>
                                {String.fromCharCode(65 + i)}. {opt}
                                {q.correctAnswer ===
                                  String.fromCharCode(65 + i) && (
                                  <span className="correct">(Correct)</span>
                                )}
                              </li>
                            ))}
                          </ul>
                          <p className="explanation">{q.explanation}</p>
                          <div className="mcq-actions">
                            <button
                              className="edit-btn"
                              onClick={() => onEdit(q)}
                            >
                              Edit
                            </button>

                            <button
                              className="delete-btn"
                              onClick={() => onDelete(q._id)}
                            >
                              Delete
                            </button>
                          </div>
                        </div>
                      )}
                    </Draggable>
                  ))}

                  {provided.placeholder}
                </div>
              )}
            </Droppable>
          </DragDropContext>
        </>
      )}
      <ConfirmDeleteModal
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onConfirm={
          selectedIds.length > 0 ? handleBulkDelete : handleDeleteLevel
        }
        textToMatch={
          selectedIds.length > 0
            ? `DELETE-${selectedIds.length}`
            : `${domain}-LEVEL-${level.number}`
        }
        title={
          selectedIds.length > 0
            ? `Delete ${selectedIds.length} Selected Questions`
            : `Delete ${domain} Level ${level.number}`
        }
      />{" "}
    </div>
  );
};

export default LevelMCQs;

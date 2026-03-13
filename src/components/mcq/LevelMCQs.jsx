import React, { useState } from "react";
import { toast } from "react-hot-toast";
import { DragDropContext, Droppable, Draggable } from "@hello-pangea/dnd";
import api from "../../auth/axiosInstance";

const LevelMCQs = ({ level, onDelete, onEdit, refresh }) => {
  const [questions, setQuestions] = useState(level.questions);
  const [open, setOpen] = useState(true);
  const [search, setSearch] = useState("");

  // Filter questions
  const filteredQuestions = questions.filter((q) =>
    q.question.toLowerCase().includes(search.toLowerCase()),
  );
  console.log("filteredQuestions", filteredQuestions);
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
  return (
    <div className="level-card">
      {/* LEVEL HEADER */}
      <div
        className="level-header"
        onClick={() => setOpen(!open)}
        style={{ cursor: "pointer" }}
      >
        <span>
          Level {level.number} — Timer: {level.timeLimit} min
        </span>

        <span>
          {questions.length} / {questions.length} {open ? "▲" : "▼"}
        </span>
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

          <DragDropContext onDragEnd={handleDragEnd}>
            <Droppable droppableId={`level-${level.number}`}>
              {(provided) => (
                <div ref={provided.innerRef} {...provided.droppableProps}>
                  {filteredQuestions.map((q, idx) => (
                    <Draggable key={q._id} draggableId={q._id} index={idx}>
                      {(provided) => (
                        <div
                          className="mcq-card"
                          ref={provided.innerRef}
                          {...provided.draggableProps}
                          {...provided.dragHandleProps}
                        >
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
    </div>
  );
};

export default LevelMCQs;

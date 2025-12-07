import React, { useRef, useEffect } from "react";

export default function AutoGrowTextarea({ value, onChange, onKeyDown }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;

    el.style.height = "auto"; // reset
    el.style.height = el.scrollHeight + "px"; // grow
  }, [value]);

  return (
    <textarea
      ref={ref}
      className="ai-input"
      value={value}
      onChange={onChange}
      placeholder="Ask (example: 'generate pageheader for repcode inwe table asab9' or 'what is the pageheader format?')"
      onKeyDown={onKeyDown}
      rows={1}
      style={{
        overflow: "hidden",
        resize: "none",
      }}
    />
  );
}

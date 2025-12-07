export default function AntiDebug() {
  if (process.env.NODE_ENV !== "production") return;

  // Disable Right Click
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  // Disable F12 (safe)
  document.addEventListener("keydown", (e) => {
    if (e.key === "F12") {
      e.preventDefault();
      return false;
    }
  });

  // Disable ctrl+shift+i (safe)
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "i") {
      e.preventDefault();
      return false;
    }
  });

  // Disable ctrl+u (safe)
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === "u") {
      e.preventDefault();
      return false;
    }
  });

  // Disable ctrl+s (safe)
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.key.toLowerCase() === "s") {
      e.preventDefault();
      return false;
    }
  });

  // Disable ctrl+shift+c (element inspect)
  document.addEventListener("keydown", (e) => {
    if (e.ctrlKey && e.shiftKey && e.key.toLowerCase() === "c") {
      e.preventDefault();
      return false;
    }
  });

  // Disable React DevTools (safe version)
  try {
    Object.defineProperty(window, "__REACT_DEVTOOLS_GLOBAL_HOOK__", {
      value: { isDisabled: true },
      writable: false,
    });
  } catch (err) {
    // Do nothing (SAFE)
  }
}

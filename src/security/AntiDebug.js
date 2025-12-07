// security/AntiDebug.js
export default function AntiDebug() {
  // Disable right-click
  //   if (process.env.NODE_ENV !== "production") return;

  //   const noop = () => {};

  //   // Disable ALL console methods in production
  //   console.log = noop;
  //   console.warn = noop;
  //   console.error = noop;
  //   console.info = noop;
  //   console.debug = noop;
  //   console.trace = noop;
  //   console.table = noop;
  //   console.group = noop;
  //   console.groupCollapsed = noop;
  //   console.groupEnd = noop;

  // Freeze console to prevent re-enable attempts
  //   Object.freeze(console);

  document.addEventListener("contextmenu", (e) => e.preventDefault());

  // Disable F12, Ctrl+Shift+I, Ctrl+U, Ctrl+S
  document.onkeydown = (e) => {
    if (
      e.key === "F12" ||
      (e.ctrlKey && e.shiftKey && e.key === "I") ||
      (e.ctrlKey && e.shiftKey && e.key === "J") ||
      (e.ctrlKey && e.key === "U") ||
      (e.ctrlKey && e.key === "S")
    ) {
      e.preventDefault();
      return false;
    }
  };

  // Prevent DevTools opening by checking viewport resizing
  setInterval(function () {
    let threshold = 160;
    if (
      window.outerWidth - window.innerWidth > threshold ||
      window.outerHeight - window.innerHeight > threshold
    ) {
      document.body.innerHTML = "<h2>DevTools is not allowed</h2>";
    }
  }, 500);

  // Anti React DevTools Injectors
  window.__REACT_DEVTOOLS_GLOBAL_HOOK__ = {
    isDisabled: true,
    inject: () => {},
    onCommitFiberRoot: () => {},
    onCommitFiberUnmount: () => {},
  };
}

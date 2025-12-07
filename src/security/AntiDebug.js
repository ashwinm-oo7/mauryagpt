export default function AntiDebug() {
  if (process.env.NODE_ENV !== "production") return;

  // Disable Right Click
  document.addEventListener("contextmenu", (e) => e.preventDefault());

  // Disable F12 Only (SAFE)
  document.addEventListener("keydown", (e) => {
    if (e.key === "F12") {
      e.preventDefault();
      return false;
    }
  });

  // Block React DevTools Injection
  Object.defineProperty(window, "__REACT_DEVTOOLS_GLOBAL_HOOK__", {
    value: { isDisabled: true },
    writable: false,
    configurable: false,
  });

  // DO NOT modify DOM or body.innerHTML (causes blank screen)
}

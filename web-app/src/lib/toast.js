/**
 * Simple, global toast dispatcher (Item 25).
 * Can be called from any component or utility without prop drilling.
 */
export function showToast(message, options = {}) {
  if (typeof window === "undefined") return;
  const event = new CustomEvent("app:toast", {
    detail: {
      id: Math.random().toString(36).substring(2, 9),
      message,
      type: options.type || "success", // "success" | "info" | "warning"
      duration: options.duration || 2600,
    },
  });
  window.dispatchEvent(event);
}

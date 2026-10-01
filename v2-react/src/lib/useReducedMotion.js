import { useEffect, useState } from "react";

/* True when the reader's OS asks for reduced motion. Components that drive
   animation from JavaScript timers (typing effects, auto-play loops) use it,
   because the global CSS rule only covers CSS animations and transitions. */
export default function useReducedMotion() {
  const query = "(prefers-reduced-motion: reduce)";
  const [reduced, setReduced] = useState(() => typeof window !== "undefined" && !!window.matchMedia && window.matchMedia(query).matches);
  useEffect(() => {
    if (!window.matchMedia) return undefined;
    const mq = window.matchMedia(query);
    const on = () => setReduced(mq.matches);
    mq.addEventListener("change", on);
    return () => mq.removeEventListener("change", on);
  }, []);
  return reduced;
}

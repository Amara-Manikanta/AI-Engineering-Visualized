import { useEffect, useState } from "react";

/**
 * ReadingSize
 *
 * A−/A+ control for text size. Writes --reading-scale on <html>, which every
 * rem-based size on the site multiplies against, and remembers the choice
 * per device. index.html restores it before first paint so there is no jump.
 */
const STEPS = [0.9, 1, 1.12, 1.25, 1.4];
const KEY = "reading-scale";

function read() {
  try {
    const v = parseFloat(localStorage.getItem(KEY));
    return STEPS.includes(v) ? v : 1;
  } catch {
    return 1;
  }
}

export default function ReadingSize({ compact = false }) {
  const [scale, setScale] = useState(read);

  useEffect(() => {
    document.documentElement.style.setProperty("--reading-scale", String(scale));
    try {
      localStorage.setItem(KEY, String(scale));
    } catch {
      /* private mode: the size still applies for this visit */
    }
  }, [scale]);

  const i = STEPS.indexOf(scale);
  const step = (d) => setScale(STEPS[Math.min(STEPS.length - 1, Math.max(0, i + d))]);

  const btn =
    "flex items-center justify-center rounded-lg border border-white/15 bg-white/5 text-gray-300 " +
    "hover:text-white hover:border-white/35 disabled:opacity-30 transition-colors";

  return (
    <div className="flex items-center gap-1" role="group" aria-label="Text size">
      <button
        onClick={() => step(-1)}
        disabled={i <= 0}
        aria-label="Smaller text"
        className={`${btn} ${compact ? "w-8 h-8 text-xs" : "w-9 h-9 text-sm"} font-bold`}
      >
        A−
      </button>
      {!compact && (
        <span className="text-xs font-mono text-gray-500 w-11 text-center">{Math.round(scale * 100)}%</span>
      )}
      <button
        onClick={() => step(1)}
        disabled={i >= STEPS.length - 1}
        aria-label="Larger text"
        className={`${btn} ${compact ? "w-8 h-8 text-sm" : "w-9 h-9 text-base"} font-bold`}
      >
        A+
      </button>
    </div>
  );
}

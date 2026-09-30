import React from "react";

/* ---------------------------------------------------------------------------
   Sequence diagram built from HTML rows, so labels wrap on a phone.
   lanes: ["Model", "Host / Client", "Server"]
   steps: [{ from, to, label, tag }]  (from / to are lane indexes)
   Rows after `active` are dimmed. Clicking a row calls onSelect(index).
--------------------------------------------------------------------------- */

const TAG = {
  MCP: "text-emerald-300 border-emerald-500/50",
  "LLM API": "text-purple-300 border-purple-500/50",
  HTTP: "text-sky-300 border-sky-500/50",
  Browser: "text-amber-300 border-amber-500/50",
};

export default function Sequence({ lanes, steps, active = steps.length - 1, onSelect }) {
  const n = lanes.length;
  const pos = (i) => `${((i + 0.5) / n) * 100}%`;
  return (
    <div className="rounded-xl bg-black/40 border border-white/10 p-3 overflow-hidden">
      <div className="grid text-[0.6875rem] font-semibold text-gray-300 mb-2 text-center" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
        {lanes.map((l) => (
          <div key={l} className="px-1 py-1 rounded bg-white/5 mx-1 leading-tight">{l}</div>
        ))}
      </div>
      <div>
        {steps.map((s, i) => {
          const lo = Math.min(s.from, s.to);
          const hi = Math.max(s.from, s.to);
          const right = s.to > s.from;
          const on = i <= active;
          const cur = i === active;
          return (
            <button
              key={i}
              onClick={() => onSelect && onSelect(i)}
              className={`relative block w-full text-left min-h-[58px] transition-opacity ${on ? "opacity-100" : "opacity-30"} ${cur ? "bg-white/[0.06] rounded-lg" : ""}`}
              aria-label={`Step ${i + 1}: ${s.label}`}
            >
              {lanes.map((_, k) => (
                <span key={k} className="absolute top-0 bottom-0 w-px bg-white/15" style={{ left: pos(k) }} />
              ))}
              <span
                className="absolute"
                style={{ left: pos(lo), width: `calc(${pos(hi)} - ${pos(lo)})`, top: 6, bottom: 6 }}
              >
                <span className="absolute left-0 right-0 top-0 text-center text-[0.6875rem] leading-tight text-gray-200 px-1">
                  <span className="text-gray-500 mr-1">{i + 1}.</span>
                  {s.label}
                </span>
                <span className={`absolute left-0 right-0 bottom-1 h-0.5 ${cur ? "bg-white" : "bg-gray-500"}`}>
                  <span
                    className={`absolute -top-[3px] w-2 h-2 rotate-45 border-t-2 ${right ? "right-0 border-r-2" : "left-0 border-l-2"} ${cur ? "border-white" : "border-gray-500"}`}
                    style={{ transform: right ? "rotate(45deg)" : "rotate(-45deg)" }}
                  />
                </span>
                <span className={`absolute right-0 bottom-3 text-[0.625rem] px-1 rounded border bg-black/60 ${TAG[s.tag] || "text-gray-300 border-white/20"}`}>{s.tag}</span>
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}

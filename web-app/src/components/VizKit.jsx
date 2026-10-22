import React from "react";
import { quantile } from "../lib/stats";

/* ---------------------------------------------------------------------------
   Shared building blocks for the interactive panels on the statistics, data
   and learning pages: a toned card, labelled sliders, a segmented picker,
   metric tiles and an SVG histogram. Class strings are spelled out in full so
   Tailwind can see them.
--------------------------------------------------------------------------- */

export const TONE = {
  indigo: { box: "border-indigo-500/25 bg-indigo-500/[0.07]", text: "text-indigo-400", soft: "text-indigo-300", accent: "accent-indigo-500", btn: "border-indigo-500/40 bg-indigo-500/15 text-indigo-200 hover:bg-indigo-500/25", fill: "#818cf8" },
  blue: { box: "border-blue-500/25 bg-blue-500/[0.07]", text: "text-blue-400", soft: "text-blue-300", accent: "accent-blue-500", btn: "border-blue-500/40 bg-blue-500/15 text-blue-200 hover:bg-blue-500/25", fill: "#60a5fa" },
  emerald: { box: "border-emerald-500/25 bg-emerald-500/[0.07]", text: "text-emerald-400", soft: "text-emerald-300", accent: "accent-emerald-500", btn: "border-emerald-500/40 bg-emerald-500/15 text-emerald-200 hover:bg-emerald-500/25", fill: "#34d399" },
  amber: { box: "border-amber-500/25 bg-amber-500/[0.07]", text: "text-amber-400", soft: "text-amber-300", accent: "accent-amber-500", btn: "border-amber-500/40 bg-amber-500/15 text-amber-200 hover:bg-amber-500/25", fill: "#fbbf24" },
  rose: { box: "border-rose-500/25 bg-rose-500/[0.07]", text: "text-rose-400", soft: "text-rose-300", accent: "accent-rose-500", btn: "border-rose-500/40 bg-rose-500/15 text-rose-200 hover:bg-rose-500/25", fill: "#fb7185" },
  purple: { box: "border-purple-500/25 bg-purple-500/[0.07]", text: "text-purple-400", soft: "text-purple-300", accent: "accent-purple-500", btn: "border-purple-500/40 bg-purple-500/15 text-purple-200 hover:bg-purple-500/25", fill: "#a78bfa" },
  teal: { box: "border-teal-500/25 bg-teal-500/[0.07]", text: "text-teal-400", soft: "text-teal-300", accent: "accent-teal-500", btn: "border-teal-500/40 bg-teal-500/15 text-teal-200 hover:bg-teal-500/25", fill: "#2dd4bf" },
};

export function Panel({ tone = "indigo", title, children, actions, className = "" }) {
  const t = TONE[tone] || TONE.indigo;
  return (
    <div className={`rounded-2xl border p-4 sm:p-6 ${t.box} ${className}`}>
      {(title || actions) && (
        <div className="flex flex-wrap items-center justify-between gap-3 mb-3">
          {title && <h3 className={`font-bold m-0 ${t.text}`}>{title}</h3>}
          {actions && <div className="flex flex-wrap gap-2">{actions}</div>}
        </div>
      )}
      {children}
    </div>
  );
}

export function Button({ tone = "indigo", onClick, children, disabled }) {
  const t = TONE[tone] || TONE.indigo;
  return (
    <button
      onClick={onClick}
      disabled={disabled}
      className={`px-3.5 py-1.5 min-h-9 rounded-lg text-xs font-semibold border transition-colors disabled:opacity-40 ${t.btn}`}
    >
      {children}
    </button>
  );
}

export function Slider({ label, value, min, max, step = 1, onChange, format, tone = "indigo" }) {
  const t = TONE[tone] || TONE.indigo;
  return (
    <label className="block">
      <span className="flex items-baseline justify-between gap-2">
        <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
        <span className={`font-mono text-sm ${t.soft}`}>{format ? format(value) : value}</span>
      </span>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        aria-valuetext={format ? String(format(value)) : undefined}
        className={`w-full mt-1.5 ${t.accent}`}
      />
    </label>
  );
}

export function Segmented({ options, value, onChange, tone = "indigo" }) {
  const t = TONE[tone] || TONE.indigo;
  return (
    <div className="flex flex-wrap gap-1.5">
      {options.map((o) => (
        <button
          key={o.v}
          onClick={() => onChange(o.v)}
          aria-pressed={value === o.v}
          className={`px-3 py-1.5 min-h-9 rounded-lg text-xs font-semibold border transition-colors ${
            value === o.v ? t.btn : "border-white/10 bg-white/5 text-gray-400 hover:text-gray-200"
          }`}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function Metric({ label, value, sub, tone }) {
  const t = tone ? TONE[tone] : null;
  return (
    <div className="p-3 rounded-xl bg-black/40 border border-white/10 min-w-0">
      <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-0.5">{label}</div>
      <div className={`text-xl font-bold font-mono truncate ${t ? t.soft : "text-white"}`}>{value}</div>
      {sub && <div className="text-[0.6875rem] text-gray-500 mt-0.5 leading-snug">{sub}</div>}
    </div>
  );
}

/* Histogram of precomputed counts. `curve` is an optional function giving the
   expected count at x (drawn as a line); `marks` are vertical reference lines. */
export function Histogram({
  counts,
  min,
  max,
  color = "#818cf8",
  curve,
  marks = [],
  width = 360,
  height = 170,
  ticks = 5,
  tickFormat = (v) => v.toFixed(1),
  shade,
  stack,
  stackColor = "#fbbf24",
}) {
  const padL = 8;
  const padR = 8;
  const padT = 10;
  const padB = 22;
  const innerW = width - padL - padR;
  const innerH = height - padT - padB;
  const bins = counts.length;
  const bw = innerW / bins;
  const totals = counts.map((c, i) => c + (stack ? stack[i] : 0));
  let top = Math.max(1, ...totals);
  if (curve) {
    for (let i = 0; i <= 60; i++) top = Math.max(top, curve(min + ((max - min) * i) / 60));
  }
  const sx = (x) => padL + ((x - min) / (max - min)) * innerW;
  const sy = (c) => padT + innerH - (c / top) * innerH;

  let path = "";
  if (curve) {
    for (let i = 0; i <= 80; i++) {
      const x = min + ((max - min) * i) / 80;
      path += `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(curve(x)).toFixed(1)}`;
    }
  }

  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto block" role="img">
      {shade && (
        <rect x={sx(shade[0])} y={padT} width={Math.max(0, sx(shade[1]) - sx(shade[0]))} height={innerH} fill="rgba(255,255,255,0.05)" />
      )}
      {counts.map((c, i) => {
        const h = (c / top) * innerH;
        return (
          <rect
            key={i}
            x={padL + i * bw + 1}
            y={padT + innerH - h}
            width={Math.max(0.5, bw - 2)}
            height={h}
            rx="1.5"
            fill={color}
            opacity="0.75"
          />
        );
      })}
      {stack &&
        stack.map((c, i) => {
          if (!c) return null;
          const base = (counts[i] / top) * innerH;
          const h = (c / top) * innerH;
          return (
            <rect key={`s${i}`} x={padL + i * bw + 1} y={padT + innerH - base - h} width={Math.max(0.5, bw - 2)} height={h} rx="1.5" fill={stackColor} opacity="0.9" />
          );
        })}
      {curve && <path d={path} fill="none" stroke="#f472b6" strokeWidth="2" />}
      {marks.map((m, i) => (
        <g key={i}>
          <line x1={sx(m.x)} y1={padT - 4} x2={sx(m.x)} y2={padT + innerH} stroke={m.color || "#fbbf24"} strokeWidth="2" strokeDasharray={m.dash ? "4 3" : undefined} />
          {m.label && (
            <text
              x={sx(m.x) > width * 0.62 ? sx(m.x) - 4 : sx(m.x) + 4}
              y={padT + 8 + i * 13}
              textAnchor={sx(m.x) > width * 0.62 ? "end" : "start"}
              fill={m.color || "#fbbf24"}
              fontSize="11"
              fontFamily="monospace"
            >
              {m.label}
            </text>
          )}
        </g>
      ))}
      <line x1={padL} y1={padT + innerH} x2={width - padR} y2={padT + innerH} stroke="rgba(255,255,255,0.2)" />
      {Array.from({ length: ticks }, (_, i) => {
        const v = min + ((max - min) * i) / (ticks - 1);
        return (
          <text key={i} x={sx(v)} y={height - 6} fill="#6b7280" fontSize="11" textAnchor={i === 0 ? "start" : i === ticks - 1 ? "end" : "middle"}>
            {tickFormat(v)}
          </text>
        );
      })}
    </svg>
  );
}

/* A plain card for "concept + short explanation" grids. */
export function Card({ title, tone, children }) {
  const t = tone ? TONE[tone] : null;
  return (
    <div className={`p-5 rounded-xl border ${t ? t.box : "border-white/10 bg-white/5"}`}>
      {title && <div className={`text-sm font-semibold mb-2 ${t ? t.text : "text-white"}`}>{title}</div>}
      <div className="text-sm text-gray-300 leading-relaxed [&>p]:m-0 [&>p+p]:mt-2">{children}</div>
    </div>
  );
}

/* Callout used for "the one thing to remember" notes. */
export function Note({ tone = "amber", children }) {
  const t = TONE[tone] || TONE.amber;
  return (
    <div className={`p-4 rounded-xl border ${t.box}`}>
      <p className="text-sm text-gray-200 leading-relaxed m-0">{children}</p>
    </div>
  );
}

export function Section({ id, title, lead, children }) {
  return (
    <section id={id} className="mb-16 scroll-mt-24">
      <h2 className="text-2xl font-bold text-white mb-4">{title}</h2>
      {lead && <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">{lead}</p>}
      {children}
    </section>
  );
}

/* Scatter plot in data coordinates. `lines` are {a, b, color} for y = a + b·x;
   points may carry their own color and radius. */
export function Scatter({
  points,
  x = [0, 1],
  y = [0, 1],
  lines = [],
  width = 360,
  height = 260,
  xLabel,
  yLabel,
  children,
}) {
  const cid = "clip" + React.useId().replace(/[^a-zA-Z0-9_-]/g, "");
  const padL = 30;
  const padR = 10;
  const padT = 10;
  const padB = 28;
  const sx = (v) => padL + ((v - x[0]) / (x[1] - x[0])) * (width - padL - padR);
  const sy = (v) => padT + (1 - (v - y[0]) / (y[1] - y[0])) * (height - padT - padB);
  const tick = (a, b) => [a, a + (b - a) / 2, b];
  const f = (v) => (Math.abs(v) >= 100 ? v.toFixed(0) : Math.abs(v) >= 10 ? v.toFixed(0) : v.toFixed(1));
  return (
    <svg viewBox={`0 0 ${width} ${height}`} className="w-full h-auto block">
      <defs>
        <clipPath id={cid}>
          <rect x={padL} y={padT} width={width - padL - padR} height={height - padT - padB} />
        </clipPath>
      </defs>
      <rect x={padL} y={padT} width={width - padL - padR} height={height - padT - padB} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" />
      {tick(...x).map((v, i) => (
        <text key={`x${i}`} x={sx(v)} y={height - 12} fill="#6b7280" fontSize="11" textAnchor="middle">{f(v)}</text>
      ))}
      {tick(...y).map((v, i) => (
        <text key={`y${i}`} x={padL - 4} y={sy(v) + 4} fill="#6b7280" fontSize="11" textAnchor="end">{f(v)}</text>
      ))}
      {xLabel && <text x={width - padR} y={height - 1} fill="#9ca3af" fontSize="11" textAnchor="end">{xLabel}</text>}
      {yLabel && <text x={padL + 4} y={padT + 12} fill="#9ca3af" fontSize="11">{yLabel}</text>}
      <g clipPath={`url(#${cid})`}>
        {lines.map((l, i) => (
          <line key={i} x1={sx(x[0])} y1={sy(l.a + l.b * x[0])} x2={sx(x[1])} y2={sy(l.a + l.b * x[1])} stroke={l.color || "#f472b6"} strokeWidth="2" strokeDasharray={l.dash ? "5 4" : undefined} />
        ))}
        {points.map((p, i) => (
          <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r={p.r || 4} fill={p.color || "#818cf8"} fillOpacity={p.o ?? 0.8} stroke="rgba(0,0,0,0.5)" strokeWidth="1" />
        ))}
        {children && children({ sx, sy })}
      </g>
    </svg>
  );
}

/* Five-number summary with 1.5 × IQR whiskers and outlier circles. */
export function BoxPlot({ data, min, max, width = 360, labels = true, color = "#a5b4fc" }) {
  const q1 = quantile(data, 0.25);
  const q2 = quantile(data, 0.5);
  const q3 = quantile(data, 0.75);
  const iqr = q3 - q1;
  const loF = q1 - 1.5 * iqr;
  const hiF = q3 + 1.5 * iqr;
  const inside = data.filter((v) => v >= loF && v <= hiF);
  const wLo = Math.min(...inside);
  const wHi = Math.max(...inside);
  const out = data.filter((v) => v < loF || v > hiF);
  const sx = (v) => 8 + ((v - min) / (max - min)) * (width - 16);
  return (
    <svg viewBox={`0 0 ${width} ${labels ? 74 : 48}`} className="w-full h-auto block">
      <line x1={sx(wLo)} y1="30" x2={sx(q1)} y2="30" stroke={color} strokeWidth="1.5" />
      <line x1={sx(q3)} y1="30" x2={sx(wHi)} y2="30" stroke={color} strokeWidth="1.5" />
      <line x1={sx(wLo)} y1="22" x2={sx(wLo)} y2="38" stroke={color} strokeWidth="1.5" />
      <line x1={sx(wHi)} y1="22" x2={sx(wHi)} y2="38" stroke={color} strokeWidth="1.5" />
      <rect x={sx(q1)} y="16" width={Math.max(1, sx(q3) - sx(q1))} height="28" fill="rgba(129,140,248,0.25)" stroke={color} strokeWidth="1.5" rx="3" />
      <line x1={sx(q2)} y1="16" x2={sx(q2)} y2="44" stroke="#fbbf24" strokeWidth="2.5" />
      {out.map((v, i) => (
        <circle key={i} cx={sx(v)} cy="30" r="2.5" fill="none" stroke="#fb7185" strokeWidth="1.2" />
      ))}
      {labels && (
        <>
          <text x={sx(q1)} y="60" fill="#9ca3af" fontSize="11" textAnchor="middle">Q1</text>
          <text x={sx(q2)} y="60" fill="#fbbf24" fontSize="11" textAnchor="middle">median</text>
          <text x={sx(q3)} y="72" fill="#9ca3af" fontSize="11" textAnchor="middle">Q3</text>
        </>
      )}
    </svg>
  );
}


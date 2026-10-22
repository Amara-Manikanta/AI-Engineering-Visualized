import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";

/**
 * LoraFlow
 *
 * The two-path diagram, animated. An input vector splits: one copy through the
 * frozen base matrix, one through the thin A→B adapter, and the two sums meet
 * at the addition node.
 *
 * The matrix boxes are drawn to scale from the actual dimensions, so the
 * adapter visibly collapses as you lower the rank — that shape difference is
 * the whole idea, and a fixed-size diagram hides it.
 */

const STEPS = [
  { k: "idle", label: "Start", say: "An input vector x arrives at the layer." },
  { k: "split", label: "1. Split", say: "The same x is sent down two paths at once. Nothing is chosen between them — both always run." },
  { k: "frozen", label: "2. Frozen path", say: "W₀ · x. The pretrained weights are used but never updated; no gradient is stored for them at all." },
  { k: "down", label: "3. Project down", say: "A squeezes x from d dimensions down to r. This is the bottleneck that makes the whole thing cheap." },
  { k: "up", label: "4. Project up", say: "B expands the r-dimensional code back out to k, producing the correction ΔW · x = B·A·x." },
  { k: "sum", label: "5. Add", say: "h = W₀·x + (α/r)·B·A·x. The adapter's output is scaled, then added to the frozen result." },
  { k: "merge", label: "6. Merge (optional)", say: "After training, compute W₀ + (α/r)·B·A once and store it. The adapter disappears and inference costs exactly what the base model cost." },
];

export default function LoraFlow({ d = 4096, k = 4096, rank = 8 }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const step = STEPS[i];

  useEffect(() => {
    if (!playing) return;
    if (i >= STEPS.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setI((s) => s + 1), 2100);
    return () => clearTimeout(t);
  }, [playing, i]);

  const at = (key) => STEPS.findIndex((s) => s.k === key);
  const on = (key) => i >= at(key);
  const isNow = (key) => step.k === key;
  const merged = isNow("merge");

  const stats = useMemo(() => {
    const full = d * k;
    const lora = rank * (d + k);
    return { full, lora, pct: (lora / full) * 100, saved: 100 - (lora / full) * 100 };
  }, [d, k, rank]);

  // Adapter box widths scale with rank so the bottleneck is visible.
  const rW = Math.max(10, Math.min(64, 10 + (rank / 64) * 54));

  const Pulse = ({ x1, y1, x2, y2, show, delay = 0, color = "#818cf8" }) =>
    show ? (
      <motion.circle
        r="4"
        fill={color}
        initial={{ cx: x1, cy: y1, opacity: 0 }}
        animate={{ cx: x2, cy: y2, opacity: [0, 1, 1, 0] }}
        transition={{ duration: 1.1, delay, repeat: Infinity, repeatDelay: 0.7, ease: "easeInOut" }}
      />
    ) : null;

  return (
    <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.07] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <h3 className="text-indigo-400 font-bold m-0">Two paths, one output</h3>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (i >= STEPS.length - 1) setI(0);
              setPlaying((p) => !p);
            }}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-indigo-500/40 bg-indigo-500/15 text-indigo-200 hover:bg-indigo-500/25 transition-colors"
          >
            {playing ? "❚❚ Pause" : i >= STEPS.length - 1 ? "↻ Replay" : "▶ Play"}
          </button>
          <button
            onClick={() => {
              setPlaying(false);
              setI(0);
            }}
            className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-white/15 bg-white/5 text-gray-300 hover:text-white transition-colors"
          >
            ↺ Reset
          </button>
        </div>
      </div>
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        The base matrix is frozen and the correction travels through a narrow detour. Step through it, or drag the
        rank on the calculator below and watch the adapter change shape.
      </p>

      <div className="flex flex-wrap gap-1.5 mb-4">
        {STEPS.map((s, idx) => (
          <button
            key={s.k}
            onClick={() => {
              setPlaying(false);
              setI(idx);
            }}
            className={`px-2.5 py-1 rounded-md text-[0.6875rem] font-medium border transition-colors ${
              idx === i
                ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-200"
                : idx < i
                ? "border-white/10 bg-white/5 text-gray-400 hover:text-white"
                : "border-white/5 bg-white/[0.02] text-gray-600 hover:text-gray-300"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      <div className="rounded-xl bg-black/50 border border-white/10 p-3 mb-4 overflow-x-auto">
        <svg viewBox="0 0 640 300" className="w-full h-auto min-w-[560px]">
          <defs>
            <marker id="lf-arrow" markerWidth="9" markerHeight="9" refX="7" refY="3" orient="auto">
              <path d="M0,0 L0,6 L7,3 z" fill="rgba(255,255,255,0.35)" />
            </marker>
          </defs>

          {/* ---- input ---- */}
          <motion.g animate={{ opacity: on("idle") ? 1 : 0.4 }}>
            <circle cx="40" cy="150" r="17" fill="rgba(129,140,248,0.18)" stroke="#818cf8" strokeWidth="2" />
            <text x="40" y="156" textAnchor="middle" fontSize="15" fill="#c7d2fe" fontFamily="monospace">x</text>
            <text x="40" y="188" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="monospace">d={d}</text>
          </motion.g>

          {/* ---- split lines ---- */}
          <line x1="58" y1="150" x2="95" y2="150" stroke="rgba(255,255,255,0.25)" strokeWidth="1.5" />
          <path d="M95,150 L95,92 L150,92" fill="none" stroke={on("split") ? "#818cf8" : "rgba(255,255,255,0.18)"} strokeWidth="1.8" markerEnd="url(#lf-arrow)" />
          <path d="M95,150 L95,218 L150,218" fill="none" stroke={on("split") ? "#34d399" : "rgba(255,255,255,0.18)"} strokeWidth="1.8" markerEnd="url(#lf-arrow)" />

          {/* ---- frozen W0 ---- */}
          <motion.g animate={{ opacity: merged ? 0.25 : 1 }}>
            <rect
              x="155" y="44" width="180" height="96" rx="10"
              fill={isNow("frozen") ? "rgba(129,140,248,0.22)" : "rgba(255,255,255,0.04)"}
              stroke={on("frozen") ? "#818cf8" : "rgba(255,255,255,0.18)"}
              strokeWidth={isNow("frozen") ? 2.5 : 1.5}
            />
            <text x="245" y="80" textAnchor="middle" fontSize="16" fill="#e5e7eb" fontFamily="monospace" fontWeight="bold">W₀</text>
            <text x="245" y="100" textAnchor="middle" fontSize="10" fill="#9ca3af" fontFamily="monospace">{d} × {k}</text>
            <text x="245" y="120" textAnchor="middle" fontSize="10" fill="#60a5fa">🔒 FROZEN · no gradients</text>
          </motion.g>

          {/* ---- adapter A -> B ---- */}
          <motion.g animate={{ opacity: merged ? 0.25 : 1 }}>
            <rect
              x="168" y={218 - rW / 2} width="52" height={rW} rx="6"
              fill={isNow("down") ? "rgba(52,211,153,0.3)" : "rgba(52,211,153,0.1)"}
              stroke={on("down") ? "#34d399" : "rgba(255,255,255,0.18)"}
              strokeWidth={isNow("down") ? 2.5 : 1.5}
            />
            <text x="194" y="222" textAnchor="middle" fontSize="13" fill="#a7f3d0" fontFamily="monospace" fontWeight="bold">A</text>
            <text x="194" y={218 + rW / 2 + 15} textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="monospace">{d}×{rank}</text>

            <line x1="220" y1="218" x2="262" y2="218" stroke={on("down") ? "#34d399" : "rgba(255,255,255,0.18)"} strokeWidth="1.8" markerEnd="url(#lf-arrow)" />
            <text x="241" y="208" textAnchor="middle" fontSize="9" fill="#34d399" fontFamily="monospace">r={rank}</text>

            <rect
              x="266" y={218 - rW / 2} width="52" height={rW} rx="6"
              fill={isNow("up") ? "rgba(52,211,153,0.3)" : "rgba(52,211,153,0.1)"}
              stroke={on("up") ? "#34d399" : "rgba(255,255,255,0.18)"}
              strokeWidth={isNow("up") ? 2.5 : 1.5}
            />
            <text x="292" y="222" textAnchor="middle" fontSize="13" fill="#a7f3d0" fontFamily="monospace" fontWeight="bold">B</text>
            <text x="292" y={218 + rW / 2 + 15} textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="monospace">{rank}×{k}</text>
            <text x="243" y="262" textAnchor="middle" fontSize="9" fill="#34d399">🔥 TRAINABLE · B starts at 0</text>
          </motion.g>

          {/* ---- merged single box ---- */}
          {merged && (
            <motion.g initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }}>
              <rect x="155" y="118" width="180" height="64" rx="10" fill="rgba(251,191,36,0.16)" stroke="#fbbf24" strokeWidth="2.5" />
              <text x="245" y="144" textAnchor="middle" fontSize="13" fill="#fde68a" fontFamily="monospace" fontWeight="bold">W₀ + (α/r)·BA</text>
              <text x="245" y="164" textAnchor="middle" fontSize="10" fill="#fbbf24">one matrix · zero overhead</text>
            </motion.g>
          )}

          {/* ---- into the adder ---- */}
          <path d={`M335,92 L440,92 L440,${merged ? 136 : 136}`} fill="none" stroke={on("frozen") && !merged ? "#818cf8" : "rgba(255,255,255,0.18)"} strokeWidth="1.8" />
          <path d="M318,218 L440,218 L440,164" fill="none" stroke={on("up") && !merged ? "#34d399" : "rgba(255,255,255,0.18)"} strokeWidth="1.8" />
          {merged && <line x1="335" y1="150" x2="423" y2="150" stroke="#fbbf24" strokeWidth="2" />}

          {/* scale label on the adapter branch */}
          {!merged && (
            <text x="385" y="210" textAnchor="middle" fontSize="9" fill="#9ca3af" fontFamily="monospace">× α/r</text>
          )}

          {/* ---- adder ---- */}
          <circle
            cx="440" cy="150" r="17"
            fill={isNow("sum") ? "rgba(251,191,36,0.3)" : "rgba(255,255,255,0.05)"}
            stroke={on("sum") ? "#fbbf24" : "rgba(255,255,255,0.2)"}
            strokeWidth={isNow("sum") ? 2.5 : 1.5}
          />
          <text x="440" y="157" textAnchor="middle" fontSize="18" fill="#fde68a" fontFamily="monospace">+</text>

          {/* ---- output ---- */}
          <line x1="458" y1="150" x2="560" y2="150" stroke={on("sum") ? "#fbbf24" : "rgba(255,255,255,0.18)"} strokeWidth="1.8" markerEnd="url(#lf-arrow)" />
          <motion.g animate={{ opacity: on("sum") ? 1 : 0.35 }}>
            <circle cx="585" cy="150" r="17" fill="rgba(251,191,36,0.16)" stroke="#fbbf24" strokeWidth="2" />
            <text x="585" y="156" textAnchor="middle" fontSize="15" fill="#fde68a" fontFamily="monospace">h</text>
            <text x="585" y="188" textAnchor="middle" fontSize="9" fill="#6b7280" fontFamily="monospace">k={k}</text>
          </motion.g>

          {/* ---- travelling pulses ---- */}
          <Pulse x1={100} y1={150} x2={150} y2={92} show={isNow("split")} />
          <Pulse x1={100} y1={150} x2={150} y2={218} show={isNow("split")} color="#34d399" delay={0.15} />
          <Pulse x1={160} y1={92} x2={430} y2={140} show={isNow("frozen")} />
          <Pulse x1={170} y1={218} x2={216} y2={218} show={isNow("down")} color="#34d399" />
          <Pulse x1={268} y1={218} x2={430} y2={165} show={isNow("up")} color="#34d399" />
          <Pulse x1={458} y1={150} x2={565} y2={150} show={isNow("sum")} color="#fbbf24" />
        </svg>
      </div>

      <div className="p-4 rounded-xl bg-black/40 border border-white/10 mb-4 min-h-[68px]">
        <div className="text-[0.625rem] uppercase tracking-wide text-indigo-400 mb-1.5">{step.label}</div>
        <p className="text-sm text-gray-300 leading-relaxed m-0">{step.say}</p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Full matrix W₀</div>
          <div className="text-xl font-bold font-mono text-gray-300">{stats.full.toLocaleString()}</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">{d} × {k} parameters</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/30">
          <div className="text-[0.625rem] uppercase tracking-wide text-emerald-400 mb-1">Adapter A + B</div>
          <div className="text-xl font-bold font-mono text-emerald-300">{stats.lora.toLocaleString()}</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">
            {rank}×{d} + {rank}×{k}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-amber-500/30">
          <div className="text-[0.625rem] uppercase tracking-wide text-amber-400 mb-1">Reduction</div>
          <div className="text-xl font-bold font-mono text-amber-300">{stats.saved.toFixed(2)}%</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">trains {stats.pct.toFixed(2)}% of the layer</div>
        </div>
      </div>
    </div>
  );
}

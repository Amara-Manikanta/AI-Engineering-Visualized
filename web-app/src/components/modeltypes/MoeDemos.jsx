import React, { useEffect, useMemo, useState } from "react";
import { Panel, Slider, Segmented, Metric, Button } from "../VizKit";
import { rng, randn, fmt, pct } from "../../lib/stats";
import useReducedMotion from "../../lib/useReducedMotion";

/* Interactive pieces for the MoE section of the Model Types page. */

const E = 8;
const DIM = 6;
const TOKENS = [
  ["The", 0], [" cat", 0], [" sat", 0], [" on", 0], [" the", 0], [" mat", 0], [".", 1],
  [" def", 2], [" sort", 2], ["(", 1], ["xs", 2], [")", 1], [":", 1],
];

const ROUTER = (() => {
  const r = rng(808);
  const W = Array.from({ length: E }, () => Array.from({ length: DIM }, () => randn(r)));
  const types = Array.from({ length: 3 }, () => Array.from({ length: DIM }, () => 1.2 * randn(r)));
  const emb = (type) => types[type].map((v) => v + 0.6 * randn(r));
  const sentence = TOKENS.map(([, type]) => emb(type));
  const batch = Array.from({ length: 300 }, (_, i) => emb(i % 3));
  return { W, sentence, batch };
})();
const COLLAPSE = [7, 5.5, 0, 0, 0, 0, 0, 0];
const EXPERT_COLORS = ["#818cf8", "#60a5fa", "#34d399", "#fbbf24", "#fb7185", "#a78bfa", "#2dd4bf", "#f472b6"];

const rawLogits = (e) => ROUTER.W.map((w) => w.reduce((a, v, j) => a + v * e[j], 0));

// bias only changes WHICH experts are picked; gate weights come from the unbiased scores.
function route(e, k, bias) {
  const logits = rawLogits(e);
  const m = Math.max(...logits);
  const ex = logits.map((l) => Math.exp(l - m));
  const s = ex.reduce((a, b) => a + b, 0);
  const probs = ex.map((v) => v / s);
  const top = logits.map((l, i) => [l + bias[i], i]).sort((a, b) => b[0] - a[0]).slice(0, k);
  const tot = top.reduce((a, [, i]) => a + probs[i], 0);
  return { probs, chosen: top.map(([, i]) => ({ i, g: probs[i] / tot })) };
}

const loadOf = (k, bias) => {
  const L = new Array(E).fill(0);
  ROUTER.batch.forEach((e) => route(e, k, bias).chosen.forEach(({ i }) => (L[i] += 1)));
  return L;
};

// Auxiliary-loss-free balancing, as in DeepSeek-V3: nudge each expert's selection
// bias down when it is overloaded and up when it is idle.
function balancedBias(k) {
  let b = new Array(E).fill(0);
  for (let it = 0; it < 150; it++) {
    const L = loadOf(k, b);
    const mean = L.reduce((a, x) => a + x, 0) / E;
    b = b.map((v, i) => v - 0.05 * Math.sign(L[i] - mean));
  }
  return b;
}

export function RouterDemo() {
  const [k, setK] = useState(2);
  const [collapsed, setCollapsed] = useState(false);
  const [cur, setCur] = useState(0);
  const reduced = useReducedMotion();
  const [auto, setAuto] = useState(!reduced);

  useEffect(() => {
    if (!auto) return undefined;
    const id = setInterval(() => setCur((c) => (c + 1) % TOKENS.length), 1100);
    return () => clearInterval(id);
  }, [auto]);

  const bias = useMemo(() => (collapsed ? COLLAPSE : balancedBias(k)), [k, collapsed]);
  const r = route(ROUTER.sentence[cur], k, bias);
  const load = useMemo(() => loadOf(k, bias), [k, bias]);
  const meanLoad = load.reduce((a, b) => a + b, 0) / E;
  const imbalance = Math.max(...load) / meanLoad;

  const W = 360;
  const tx = (i) => 14 + (i / (TOKENS.length - 1)) * (W - 28);
  const ex = (i) => 24 + (i / (E - 1)) * (W - 48);

  return (
    <Panel
      tone="amber"
      title="The router picks experts for each token"
      actions={<Button tone="amber" onClick={() => setAuto((a) => !a)}>{auto ? "Pause" : "▶ Play"}</Button>}
    >
      <svg viewBox={`0 0 ${W} 190`} className="w-full h-auto block max-w-xl">
        {TOKENS.map(([t], i) => (
          <g key={i} onClick={() => { setCur(i); setAuto(false); }} style={{ cursor: "pointer" }}>
            <rect x={tx(i) - 13} y="6" width="26" height="22" rx="5" fill={i === cur ? "rgba(251,191,36,0.35)" : "rgba(255,255,255,0.06)"} stroke={i === cur ? "#fbbf24" : "rgba(255,255,255,0.15)"} />
            <text x={tx(i)} y="21" fill="#e5e7eb" fontSize="10" textAnchor="middle" fontFamily="monospace">{t.trim() || "·"}</text>
          </g>
        ))}
        <rect x={W / 2 - 38} y="58" width="76" height="24" rx="6" fill="rgba(129,140,248,0.2)" stroke="#818cf8" />
        <text x={W / 2} y="74" fill="#c7d2fe" fontSize="11" textAnchor="middle">router</text>
        <line x1={tx(cur)} y1="28" x2={W / 2} y2="58" stroke="#fbbf24" strokeWidth="2" />
        {r.chosen.map(({ i, g }) => (
          <line key={i} x1={W / 2} y1="82" x2={ex(i)} y2="130" stroke={EXPERT_COLORS[i]} strokeWidth={1 + g * 7} strokeLinecap="round" style={{ transition: "all 250ms" }} />
        ))}
        {Array.from({ length: E }, (_, i) => {
          const on = r.chosen.find((c) => c.i === i);
          return (
            <g key={i}>
              <rect x={ex(i) - 17} y="130" width="34" height="30" rx="6" fill={on ? EXPERT_COLORS[i] : "rgba(255,255,255,0.05)"} fillOpacity={on ? 0.55 : 1} stroke={on ? EXPERT_COLORS[i] : "rgba(255,255,255,0.15)"} />
              <text x={ex(i)} y="149" fill="#e5e7eb" fontSize="11" textAnchor="middle">E{i + 1}</text>
              <text x={ex(i)} y="178" fill="#9ca3af" fontSize="10" textAnchor="middle">{on ? pct(on.g, 0) : ""}</text>
            </g>
          );
        })}
      </svg>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-4">
        <Slider tone="amber" label="Experts per token (top-k)" value={k} min={1} max={4} onChange={setK} />
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-1.5">Router training</div>
          <Segmented tone="amber" value={collapsed ? "c" : "b"} onChange={(v) => setCollapsed(v === "c")} options={[{ v: "b", label: "With load balancing" }, { v: "c", label: "Collapsed" }]} />
        </div>
      </div>
      <div className="text-xs text-gray-500 mb-1.5">Load across a batch of 300 tokens</div>
      <div className="flex items-end gap-1.5 h-20 mb-2">
        {load.map((l, i) => (
          <div key={i} className="flex-1 flex flex-col items-center justify-end h-full">
            <div className="w-full rounded-t" style={{ height: `${(l / Math.max(...load)) * 100}%`, background: EXPERT_COLORS[i], opacity: 0.75, transition: "height 300ms" }} />
            <span className="text-[0.625rem] text-gray-500 mt-0.5">E{i + 1}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <Metric label="This token's gate weights" value={r.chosen.map((c) => `E${c.i + 1} ${pct(c.g, 0)}`).join(" · ")} tone="amber" />
        <Metric label="Busiest expert vs average" value={`${fmt(imbalance, 1)}×`} tone={imbalance > 2 ? "rose" : "emerald"} sub="1× = perfectly even" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        Tap a token. The router is a small linear layer: it scores all 8 experts, keeps the top k, and mixes their
        outputs by the renormalised scores. Switch to <em>Collapsed</em> — a router trained without a balancing
        penalty drifts toward sending almost everything to one or two experts, which then do all the work while the
        rest waste memory. The balanced mode here uses DeepSeek-V3's approach: a per-expert bias, nudged down when an
        expert is overloaded and up when it is idle, changes which experts get picked without changing how their
        outputs are weighted. The older alternative is an auxiliary loss that penalises uneven load.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Total vs active parameters. Presets are fitted to published totals.
--------------------------------------------------------------------------- */

const MOE_PRESETS = {
  mixtral: { label: "Mixtral 8x7B", E: 8, k: 2, shared: 0, e: 5.63, a: 1.63 },
  ds3: { label: "DeepSeek-V3", E: 256, k: 8, shared: 1, e: 2.556, a: 14.0 },
  oss: { label: "gpt-oss-120b", E: 128, k: 4, shared: 0, e: 0.9024, a: 1.49 },
  mav: { label: "Llama 4 Maverick", E: 128, k: 1, shared: 1, e: 3.016, a: 10.97 },
};

export function MoeCalc() {
  const [c, setC] = useState(MOE_PRESETS.mixtral);
  const [preset, setPreset] = useState("mixtral");
  const set = (key, v) => {
    setPreset(null);
    setC((o) => ({ ...o, [key]: v, ...(key === "E" && o.k > v ? { k: v } : {}) }));
  };
  const total = c.a + (c.E + c.shared) * c.e;
  const active = c.a + (c.k + c.shared) * c.e;
  const B = (x) => (x >= 1000 ? `${fmt(x / 1000, 2)}T` : `${fmt(x, 1)}B`);

  return (
    <Panel tone="indigo" title="Total parameters vs active parameters">
      <div className="mb-4">
        <Segmented value={preset} onChange={(k) => { setPreset(k); setC(MOE_PRESETS[k]); }} options={Object.entries(MOE_PRESETS).map(([v, p]) => ({ v, label: p.label }))} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        <Slider label="Routed experts" value={c.E} min={2} max={256} onChange={(v) => set("E", v)} />
        <Slider label="Active per token (k)" value={c.k} min={1} max={Math.min(16, c.E)} onChange={(v) => set("k", v)} />
        <Slider label="Shared experts (always on)" value={c.shared} min={0} max={2} onChange={(v) => set("shared", v)} />
        <Slider label="Size of one expert" value={c.e} min={0.1} max={10} step={0.01} onChange={(v) => set("e", v)} format={(v) => `${v.toFixed(2)}B`} />
        <Slider label="Everything else (attention, embeddings)" value={c.a} min={0.5} max={30} step={0.01} onChange={(v) => set("a", v)} format={(v) => `${v.toFixed(1)}B`} />
      </div>
      <div className="mb-2 text-xs text-gray-500">Active share of the model</div>
      <div className="h-6 rounded-lg bg-white/5 overflow-hidden mb-4 relative">
        <div className="h-full bg-indigo-500/70" style={{ width: `${Math.max(1, (active / total) * 100)}%`, transition: "width 200ms" }} />
        <span className="absolute inset-0 flex items-center justify-center text-xs text-white font-mono">{pct(active / total)} of weights used per token</span>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <Metric label="Total parameters" value={B(total)} tone="indigo" />
        <Metric label="Active per token" value={B(active)} tone="emerald" />
        <Metric label="Memory at 8-bit" value={`${fmt(total, 0)} GB`} tone="rose" sub={`4-bit: ${fmt(total / 2, 0)} GB`} />
        <Metric label="Compute per token" value={`${fmt(2 * active, 0)} GFLOP`} sub="≈ 2 × active params" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        The presets are fitted to each model's published total and active counts. MoE gives you the compute bill of
        the active size and the memory bill of the total size: DeepSeek-V3 runs about as fast as a 37B dense model
        but needs the memory of a 671B one, because any token may be routed to any expert.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Published MoE models, total vs active (log scale).
--------------------------------------------------------------------------- */

const REAL = [
  { n: "Qwen3.8-Max", t: 2400, a: 95 },
  { n: "DeepSeek-V4-Pro", t: 1600, a: 49 },
  { n: "Llama 4 Maverick", t: 400, a: 17 },
  { n: "DeepSeek-V4-Flash", t: 284, a: 13 },
  { n: "Command A+", t: 218, a: 25 },
  { n: "gpt-oss-120b", t: 117, a: 5.1 },
  { n: "Llama 4 Scout", t: 109, a: 17 },
  { n: "Mixtral 8x7B", t: 46.7, a: 12.9 },
  { n: "Gemma 4 26B A4B", t: 26, a: 4 },
];

export function MoeModels() {
  const lo = Math.log10(1);
  const hi = Math.log10(3000);
  const w = (v) => ((Math.log10(v) - lo) / (hi - lo)) * 100;
  return (
    <Panel tone="purple" title="Mixture-of-experts models in the wild">
      <div className="space-y-2.5">
        {REAL.map((m) => (
          <div key={m.n}>
            <div className="flex justify-between text-xs mb-1 gap-2">
              <span className="text-gray-200">{m.n}</span>
              <span className="font-mono text-gray-400 shrink-0">
                {m.t >= 1000 ? `${m.t / 1000}T` : `${m.t}B`} total · <span className="text-emerald-300">{m.a}B active</span> · {pct(m.a / m.t, 0)}
              </span>
            </div>
            <div className="h-3.5 rounded bg-white/5 relative overflow-hidden">
              <div className="absolute inset-y-0 left-0 bg-purple-500/45 rounded" style={{ width: `${w(m.t)}%` }} />
              <div className="absolute inset-y-0.5 left-0 bg-emerald-400/85 rounded" style={{ width: `${w(m.a)}%` }} />
            </div>
          </div>
        ))}
      </div>
      <div className="flex justify-between text-[0.625rem] text-gray-500 mt-1"><span>1B</span><span>30B</span><span>1T</span></div>
      <p className="text-xs text-gray-500 leading-relaxed mt-3 mb-0">
        Log scale; purple is total, green is active. Recent models push the ratio further: Qwen3.8-Max activates about
        4% of its weights per token. At trillion-parameter scale, sparse activation is what keeps serving affordable.
      </p>
    </Panel>
  );
}

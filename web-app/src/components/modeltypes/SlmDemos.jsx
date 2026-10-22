import React, { useState } from "react";
import { Panel, Slider, Segmented, Metric } from "../VizKit";
import { fmt, pct } from "../../lib/stats";

/* Interactive pieces for the SLM section of the Model Types page. */

/* ---------------------------------------------------------------------------
   Tokens seen per parameter: small models are trained far past "optimal".
--------------------------------------------------------------------------- */

const RUNS = [
  { n: "Chinchilla-optimal rule", tpp: 20, note: "best model for a fixed training budget (2022)" },
  { n: "Llama 2 7B", tpp: 2e12 / 6.7e9, note: "2T tokens" },
  { n: "Llama 3 8B", tpp: 15e12 / 8.03e9, note: "15T tokens" },
  { n: "Qwen2.5 7B", tpp: 18e12 / 7.6e9, note: "18T tokens" },
  { n: "Llama 3.2 1B", tpp: 9e12 / 1.24e9, note: "up to 9T tokens, plus distillation" },
];

export function OvertrainChart() {
  const max = Math.log10(10000);
  return (
    <Panel tone="emerald" title="Training tokens per parameter">
      <div className="space-y-2.5">
        {RUNS.map((r, i) => (
          <div key={r.n}>
            <div className="flex justify-between text-xs mb-1 gap-3">
              <span className={i === 0 ? "text-amber-300" : "text-gray-200"}>{r.n} <span className="text-gray-500">— {r.note}</span></span>
              <span className="font-mono text-gray-300 shrink-0">{Math.round(r.tpp).toLocaleString()}</span>
            </div>
            <div className="h-3 rounded bg-white/5 overflow-hidden">
              <div className={`h-full rounded ${i === 0 ? "bg-amber-400/80" : "bg-emerald-500/70"}`} style={{ width: `${(Math.log10(r.tpp) / max) * 100}%` }} />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Log scale. Training a small model on far more data than "optimal" costs extra once, at training time, and
        saves on every one of the billions of requests it later serves. That trade is the single biggest reason
        small models improved so fast.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Will it run on my device? Weights + KV cache vs memory; speed from bandwidth.
--------------------------------------------------------------------------- */

const MODELS = {
  l1: { n: "Llama 3.2 1B", p: 1.24e9, kv: 32768 },
  l3: { n: "Llama 3.2 3B", p: 3.21e9, kv: 114688 },
  q7: { n: "Qwen2.5 7B", p: 7.61e9, kv: 57344 },
  l8: { n: "Llama 3.1 8B", p: 8.03e9, kv: 131072 },
  p14: { n: "Phi-4 14B", p: 14.7e9, kv: 204800 },
};
const PREC = { bf16: { n: "16-bit", b: 2 }, q8: { n: "8-bit", b: 1.07 }, q4: { n: "4-bit", b: 0.6 } };
const DEVICES = [
  { n: "Phone, 8 GB", mem: 4, bw: 60 },
  { n: "Laptop, 16 GB (M4)", mem: 10, bw: 120 },
  { n: "RTX 4090, 24 GB", mem: 22, bw: 1008 },
  { n: "MacBook Pro, 64 GB (M4 Max)", mem: 48, bw: 546 },
];

export function DeviceFit() {
  const [m, setM] = useState("l3");
  const [prec, setPrec] = useState("q4");
  const [ctx, setCtx] = useState(8192);
  const M = MODELS[m];
  const weights = M.p * PREC[prec].b;
  const kv = M.kv * ctx;
  const need = (weights + kv) / 1e9;

  return (
    <Panel tone="teal" title="Will it run on my device?">
      <div className="space-y-3 mb-4">
        <Segmented tone="teal" value={m} onChange={setM} options={Object.entries(MODELS).map(([v, x]) => ({ v, label: x.n }))} />
        <Segmented tone="teal" value={prec} onChange={setPrec} options={Object.entries(PREC).map(([v, x]) => ({ v, label: x.n }))} />
        <Slider tone="teal" label="Context length" value={ctx} min={1024} max={131072} step={1024} onChange={setCtx} format={(v) => `${(v / 1024).toFixed(0)}K tokens`} />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-4">
        <Metric label="Weights" value={`${fmt(weights / 1e9, 1)} GB`} />
        <Metric label="KV cache" value={`${fmt(kv / 1e9, 1)} GB`} sub="16-bit" />
        <Metric label="Total needed" value={`${fmt(need, 1)} GB`} tone="teal" />
      </div>
      <div className="space-y-2">
        {DEVICES.map((d) => {
          const fits = need <= d.mem;
          const tps = (d.bw * 0.7) / need;
          return (
            <div key={d.n} className={`grid grid-cols-[minmax(0,1fr)_auto] gap-3 items-center rounded-lg border px-3 py-2 ${fits ? "border-emerald-500/30 bg-emerald-500/[0.06]" : "border-rose-500/30 bg-rose-500/[0.06]"}`}>
              <div className="min-w-0">
                <div className="text-sm text-gray-200">{d.n}</div>
                <div className="text-[0.6875rem] text-gray-500">~{d.mem} GB usable for the model · {d.bw} GB/s memory bandwidth</div>
              </div>
              <div className="text-right">
                <div className={`text-sm font-semibold ${fits ? "text-emerald-300" : "text-rose-300"}`}>{fits ? "fits" : "too big"}</div>
                {fits && <div className="text-[0.6875rem] font-mono text-gray-400">~{Math.round(tps)} tok/s</div>}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Generating a token means reading every weight (and the cache) from memory once, so speed is roughly memory
        bandwidth ÷ model size — the figures assume 70% of peak and one conversation at a time. Two lessons: 4-bit
        quantization is what makes phones and laptops viable, and at long context the KV cache can outgrow the
        weights of a small model.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   A cascade: the small model answers first, escalating when unsure.
--------------------------------------------------------------------------- */

export function Cascade() {
  const [share, setShare] = useState(70);
  const [slm, setSlm] = useState(0.2);
  const [llm, setLlm] = useState(8);
  const [q, setQ] = useState(100);
  const n = q * 1000;
  const llmOnly = (n * llm) / 1000;
  const cascade = (n * slm) / 1000 + (n * (1 - share / 100) * llm) / 1000;
  return (
    <Panel tone="amber" title="Small model first, big model when needed">
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        A router or the small model's own confidence decides which requests it can handle; the rest escalate. Costs
        are per 1,000 requests — replace them with your own.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Slider tone="amber" label="Share the small model handles" value={share} min={0} max={95} onChange={setShare} format={(v) => `${v}%`} />
        <Slider tone="amber" label="Requests per day" value={q} min={1} max={1000} onChange={setQ} format={(v) => `${v}K`} />
        <Slider tone="amber" label="Small model $ / 1K requests" value={slm} min={0.05} max={2} step={0.05} onChange={setSlm} format={(v) => `$${v.toFixed(2)}`} />
        <Slider tone="amber" label="Large model $ / 1K requests" value={llm} min={1} max={40} step={0.5} onChange={setLlm} format={(v) => `$${v.toFixed(1)}`} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Metric label="Large model only" value={`$${Math.round(llmOnly).toLocaleString()}/day`} />
        <Metric label="Cascade" value={`$${Math.round(cascade).toLocaleString()}/day`} tone="amber" />
        <Metric label="Saving" value={pct(1 - cascade / llmOnly, 0)} tone={cascade < llmOnly ? "emerald" : "rose"} />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Every request pays for the small model, and escalated ones pay for both — so a cascade only saves money if the
        small model handles a real share of traffic. Measure quality on the requests it keeps: the saving is worthless
        if those answers are worse.
      </p>
    </Panel>
  );
}

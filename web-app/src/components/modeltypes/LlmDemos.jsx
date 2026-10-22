import React, { useEffect, useState } from "react";
import { PROFILES, FAMILY_ORDER, FAMILY_NAMES, FAMILY_PATHS } from "../../data/modelProfiles";
import { Panel, Slider, Segmented, Metric, Button } from "../VizKit";
import { rng, fmt, pct } from "../../lib/stats";

/* Interactive pieces for the LLM section of the Model Types page. */

/* ---------------------------------------------------------------------------
   Generation, one token at a time. Each step has the model's top-5 logits;
   temperature and top-p are applied live.
--------------------------------------------------------------------------- */

const SCRIPT = [
  [[" Sunlight", 3.1], [" Because", 2.7], [" The", 2.5], [" Light", 1.6], [" It", 1.0]],
  [[" is", 3.0], [" contains", 2.2], [" gets", 1.9], [" scatters", 1.8], [" has", 0.7]],
  [[" scattered", 3.4], [" made", 1.9], [" split", 1.7], [" bent", 1.1], [" blue", 0.2]],
  [[" by", 3.8], [" in", 2.3], [" off", 1.5], [" as", 1.0], [" through", 0.8]],
  [[" air", 2.9], [" molecules", 2.4], [" the", 2.3], [" gas", 1.4], [" tiny", 1.3]],
  [[" molecules", 3.9], [" particles", 2.6], [",", 1.2], [" atoms", 1.1], [" and", 0.3]],
  [[",", 3.0], [" in", 2.1], [".", 1.9], [" and", 1.8], [" —", 0.6]],
  [[" and", 3.1], [" which", 2.2], [" but", 1.5], [" so", 1.4], [" with", 0.4]],
  [[" blue", 3.3], [" shorter", 2.8], [" the", 1.9], [" short", 1.6], [" violet", 0.9]],
  [[" light", 3.5], [" wavelengths", 2.9], [" scatters", 1.3], [" is", 0.8], [" waves", 0.7]],
  [[" scatters", 3.2], [" is", 2.4], [" gets", 1.9], [" bends", 1.1], [" spreads", 0.8]],
  [[" most", 3.0], [" more", 2.9], [" the", 1.4], [" far", 1.2], [" easily", 0.9]],
  [[".", 4.0], [",", 1.9], [" strongly", 1.0], [" of", 0.5], ["!", 0.2]],
];

function softmaxT(logits, t) {
  const z = logits.map((l) => l / t);
  const m = Math.max(...z);
  const e = z.map((v) => Math.exp(v - m));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / s);
}

export function GenerationDemo() {
  const [step, setStep] = useState(0);
  const [temp, setTemp] = useState(1);
  const [topP, setTopP] = useState(0.9);
  const [playing, setPlaying] = useState(false);
  const [sampled, setSampled] = useState(null);
  const [seed, setSeed] = useState(1);

  useEffect(() => {
    if (!playing) return undefined;
    if (step >= SCRIPT.length) {
      setPlaying(false);
      return undefined;
    }
    const id = setTimeout(() => setStep((s) => s + 1), 900);
    return () => clearTimeout(id);
  }, [playing, step]);

  const cur = SCRIPT[Math.min(step, SCRIPT.length - 1)];
  const probs = softmaxT(cur.map((c) => c[1]), temp);
  // nucleus: smallest set of top tokens whose probability reaches top-p
  const order = probs.map((p, i) => [p, i]).sort((a, b) => b[0] - a[0]);
  const keep = new Set();
  let acc = 0;
  for (const [p, i] of order) {
    keep.add(i);
    acc += p;
    if (acc >= topP) break;
  }
  const done = step >= SCRIPT.length;

  const sampleOnce = () => {
    const r = rng(seed * 7 + step)();
    setSeed((s) => s + 1);
    const kept = [...keep];
    const tot = kept.reduce((a, i) => a + probs[i], 0);
    let u = r * tot;
    for (const i of kept) {
      u -= probs[i];
      if (u <= 0) {
        setSampled(cur[i][0]);
        return;
      }
    }
    setSampled(cur[kept[kept.length - 1]][0]);
  };

  return (
    <Panel
      tone="indigo"
      title="Watch an LLM write, one token at a time"
      actions={
        <>
          <Button onClick={() => setPlaying((p) => !p)} disabled={done}>{playing ? "Pause" : "▶ Generate"}</Button>
          <Button onClick={() => { setStep((s) => Math.min(SCRIPT.length, s + 1)); setSampled(null); }} disabled={done}>Next token</Button>
          <Button onClick={() => { setStep(0); setPlaying(false); setSampled(null); }}>Reset</Button>
        </>
      }
    >
      <div className="rounded-xl bg-black/50 border border-white/10 p-4 mb-4 font-mono text-sm leading-relaxed min-h-[4.5rem]">
        <span className="text-gray-500">User: Why is the sky blue?{"\n"}</span>
        <br />
        <span className="text-gray-500">Assistant:</span>
        {SCRIPT.slice(0, step).map((s, i) => (
          <span key={i} className={`text-gray-100 ${i === step - 1 ? "bg-indigo-500/30 rounded" : ""}`}>{s[0][0]}</span>
        ))}
        {!done && <span className="inline-block w-2 h-4 bg-indigo-300 align-middle animate-pulse ml-0.5" />}
      </div>
      {!done ? (
        <>
          <div className="text-xs text-gray-500 mb-2">Step {step + 1}: the model's five most likely next tokens</div>
          <div className="space-y-1.5 mb-4">
            {cur.map(([tok], i) => (
              <div key={tok + i} className={`grid grid-cols-[92px_minmax(0,1fr)_64px] items-center gap-2 ${keep.has(i) ? "" : "opacity-35"}`}>
                <span className="font-mono text-xs text-gray-200 whitespace-pre">"{tok}"</span>
                <div className="h-4 rounded bg-white/5 overflow-hidden">
                  <div className={`h-full ${i === 0 ? "bg-indigo-400/80" : "bg-slate-500/70"}`} style={{ width: `${probs[i] * 100}%`, transition: "width 200ms" }} />
                </div>
                <span className="text-xs font-mono text-gray-400 text-right">{pct(probs[i])}</span>
              </div>
            ))}
          </div>
        </>
      ) : (
        <p className="text-sm text-emerald-300 mb-4">Done — 13 tokens, 13 separate forward passes through the whole network.</p>
      )}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
        <Slider label="Temperature" value={temp} min={0.1} max={2} step={0.05} onChange={setTemp} format={(v) => v.toFixed(2)} />
        <Slider label="Top-p (nucleus)" value={topP} min={0.1} max={1} step={0.05} onChange={setTopP} format={(v) => v.toFixed(2)} />
      </div>
      {!done && (
        <div className="flex flex-wrap items-center gap-3 mb-3">
          <Button onClick={sampleOnce}>Sample this step</Button>
          {sampled !== null && (
            <span className="text-xs text-gray-400">
              Drew <span className="font-mono text-white whitespace-pre">"{sampled}"</span>
              {sampled !== cur[0][0] && " — a real model would now continue from this token, and every later step would change."}
            </span>
          )}
        </div>
      )}
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        Logits are divided by the temperature before softmax: below 1 the top token dominates, above 1 the
        distribution flattens. Top-p then keeps only the smallest set of tokens covering that much probability (faded
        rows are cut). The model never plans the whole sentence — each token is chosen, appended, and the longer text
        is fed back in to choose the next.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Anatomy of a decoder-only transformer, using Llama 3 8B's real shapes.
--------------------------------------------------------------------------- */

const PARTS = [
  { n: "Tokenizer", shape: "text → 128,256-word vocabulary IDs", d: "Splits text into subword tokens and maps each to an integer. Not learned by gradient descent — built beforehand, usually with BPE. See Tokenization." },
  { n: "Embedding table", shape: "128,256 × 4,096", d: "Looks up a 4,096-number vector for each token ID. This is where a token first becomes something the network can compute with." },
  { n: "32 × transformer block", shape: "each: attention + MLP", d: "The same structure repeated 32 times. Each block reads the whole sequence so far and adds its contribution to every token's vector (the residual stream)." },
  { n: "  · Self-attention", shape: "32 query heads, 8 key/value heads", d: "Lets each token gather information from earlier tokens. A causal mask stops it looking ahead. Grouped-query attention shares each key/value head across 4 query heads to shrink the KV cache." },
  { n: "  · MLP (SwiGLU)", shape: "4,096 → 14,336 → 4,096", d: "A feed-forward network applied to each token separately. About two-thirds of the parameters live here, and much of the model's stored knowledge with them." },
  { n: "Final norm + LM head", shape: "4,096 → 128,256 logits", d: "Projects the last token's vector to one score per vocabulary entry." },
  { n: "Softmax + sampling", shape: "logits → probabilities → token", d: "Turns scores into probabilities and picks the next token — the demo above." },
];

export function Anatomy() {
  const [i, setI] = useState(2);
  return (
    <Panel tone="purple" title="Inside a decoder-only LLM (Llama 3 8B shapes)">
      <div className="grid grid-cols-1 lg:grid-cols-[260px_minmax(0,1fr)] gap-5 items-start">
        <div className="space-y-1.5">
          {PARTS.map((p, j) => (
            <button
              key={p.n}
              onClick={() => setI(j)}
              className={`w-full text-left rounded-lg border px-3 py-2 text-sm transition-colors whitespace-pre ${
                j === i ? "border-purple-400/60 bg-purple-500/20 text-white" : "border-white/10 bg-black/30 text-gray-400 hover:text-gray-200"
              }`}
            >
              {p.n}
            </button>
          ))}
        </div>
        <div className="rounded-xl border border-white/10 bg-black/40 p-4">
          <div className="text-lg font-bold text-white mb-1">{PARTS[i].n.trim()}</div>
          <div className="font-mono text-xs text-purple-300 mb-3">{PARTS[i].shape}</div>
          <p className="text-sm text-gray-300 leading-relaxed m-0">{PARTS[i].d}</p>
        </div>
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Count the parameters from the architecture.
--------------------------------------------------------------------------- */

const PRESETS = {
  gpt2: { label: "GPT-2 small", L: 12, d: 768, heads: 12, kv: 12, ff: 3072, V: 50257, swiglu: false, tied: true },
  l8: { label: "Llama 3 8B", L: 32, d: 4096, heads: 32, kv: 8, ff: 14336, V: 128256, swiglu: true, tied: false },
  l70: { label: "Llama 3 70B", L: 80, d: 8192, heads: 64, kv: 8, ff: 28672, V: 128256, swiglu: true, tied: false },
};

export function ParamCounter() {
  const [cfg, setCfg] = useState(PRESETS.l8);
  const [preset, setPreset] = useState("l8");
  const [ctx, setCtx] = useState(8192);
  const set = (k, v) => {
    setPreset(null);
    setCfg((c) => ({ ...c, [k]: v }));
  };
  const hd = cfg.d / cfg.heads;
  const attn = cfg.L * (2 * cfg.d * cfg.d + 2 * cfg.d * cfg.kv * hd);
  const mlp = cfg.L * (cfg.swiglu ? 3 : 2) * cfg.d * cfg.ff;
  const emb = cfg.V * cfg.d * (cfg.tied ? 1 : 2);
  const total = attn + mlp + emb;
  const kvPerTok = 2 * cfg.L * cfg.kv * hd * 2; // K and V, bf16
  const B = (x) => (x >= 1e9 ? `${fmt(x / 1e9, 2)}B` : `${fmt(x / 1e6, 1)}M`);
  const GB = (x) => (x >= 1e9 ? `${fmt(x / 1e9, 1)} GB` : `${fmt(x / 1e6, 0)} MB`);

  const parts = [
    ["Embeddings" + (cfg.tied ? " (tied)" : " + LM head"), emb, "bg-amber-500/70"],
    ["Attention", attn, "bg-blue-500/70"],
    ["MLP", mlp, "bg-purple-500/70"],
  ];

  return (
    <Panel tone="blue" title="Where the parameters are">
      <div className="mb-4">
        <Segmented
          tone="blue"
          value={preset}
          onChange={(k) => { setPreset(k); setCfg(PRESETS[k]); }}
          options={Object.entries(PRESETS).map(([v, p]) => ({ v, label: p.label }))}
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-4 mb-4">
        <Slider tone="blue" label="Layers L" value={cfg.L} min={2} max={128} onChange={(v) => set("L", v)} />
        <Slider tone="blue" label="Width d_model" value={cfg.d} min={256} max={16384} step={256} onChange={(v) => set("d", v)} />
        <Slider tone="blue" label="MLP hidden size" value={cfg.ff} min={512} max={65536} step={256} onChange={(v) => set("ff", v)} />
        <Slider tone="blue" label="Vocabulary" value={cfg.V} min={8000} max={262144} step={256} onChange={(v) => set("V", v)} />
        <Slider tone="blue" label="KV heads (of the query heads)" value={cfg.kv} min={1} max={cfg.heads} onChange={(v) => set("kv", v)} format={(v) => `${v} / ${cfg.heads}`} />
        <Slider tone="blue" label="Context for KV cache" value={ctx} min={1024} max={131072} step={1024} onChange={setCtx} format={(v) => `${(v / 1024).toFixed(0)}K`} />
      </div>
      <div className="flex h-7 rounded-lg overflow-hidden mb-2">
        {parts.map(([n, v, c]) => (
          <div key={n} className={`${c} flex items-center justify-center text-[0.6875rem] text-white overflow-hidden whitespace-nowrap border-r border-black/40`} style={{ width: `${(v / total) * 100}%` }}>
            {v / total > 0.12 ? `${n} ${pct(v / total, 0)}` : ""}
          </div>
        ))}
      </div>
      <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.6875rem] text-gray-400 mb-4">
        {parts.map(([n, v]) => (
          <span key={n}>{n}: <span className="font-mono text-gray-200">{B(v)}</span></span>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <Metric label="Total parameters" value={B(total)} tone="blue" />
        <Metric label="Weights at bf16" value={GB(total * 2)} sub={`int4: ${GB(total * 0.5)}`} />
        <Metric label="KV cache / token" value={`${fmt(kvPerTok / 1024, 0)} KB`} />
        <Metric label={`KV cache @ ${(ctx / 1024).toFixed(0)}K`} value={GB(kvPerTok * ctx)} tone="amber" sub="one sequence, bf16" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        The presets reproduce the published sizes — 124M, 8.0B and 70.6B — from nothing but the architecture (biases
        and norms are too small to matter). Notice how little the vocabulary contributes in big models and how much
        the MLP does. Fewer KV heads leave the parameter count almost unchanged but shrink the KV cache, which is
        why nearly every modern model uses grouped-query attention.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Training compute: C ≈ 6 · N · D.
--------------------------------------------------------------------------- */

export function ComputeCalc() {
  const [ln, setLn] = useState(Math.log10(8e9));
  const [ld, setLd] = useState(Math.log10(15e12));
  const [mfu, setMfu] = useState(40);
  const [gpus, setGpus] = useState(1024);
  const N = 10 ** ln;
  const D = 10 ** ld;
  const C = 6 * N * D;
  const perGpu = 989e12 * (mfu / 100); // H100 dense bf16 peak × utilisation
  const gpuDays = C / perGpu / 86400;
  const chin = 20 * N;
  const big = (x) => (x >= 1e12 ? `${fmt(x / 1e12, 1)}T` : x >= 1e9 ? `${fmt(x / 1e9, 1)}B` : `${fmt(x / 1e6, 0)}M`);

  return (
    <Panel tone="amber" title="How much compute does training take?">
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        A useful rule: training costs about <span className="font-mono text-amber-200">6 × parameters × tokens</span>{" "}
        floating-point operations — 2 for the forward pass and 4 for the backward pass, per parameter per token.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Slider tone="amber" label="Parameters N" value={ln} min={8} max={12.3} step={0.01} onChange={setLn} format={() => big(N)} />
        <Slider tone="amber" label="Training tokens D" value={ld} min={10} max={13.6} step={0.01} onChange={setLd} format={() => big(D)} />
        <Slider tone="amber" label="GPU utilisation (MFU)" value={mfu} min={15} max={60} onChange={setMfu} format={(v) => `${v}%`} />
        <Slider tone="amber" label="H100 GPUs" value={gpus} min={8} max={32768} step={8} onChange={setGpus} format={(v) => v.toLocaleString()} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <Metric label="Compute" value={`${fmt(C / 10 ** Math.floor(Math.log10(C)), 1)}e${Math.floor(Math.log10(C))}`} tone="amber" sub="FLOPs" />
        <Metric label="GPU-days" value={Math.round(gpuDays).toLocaleString()} />
        <Metric label="Wall-clock" value={`${fmt(gpuDays / gpus, 1)} days`} tone="amber" sub={`on ${gpus.toLocaleString()} GPUs`} />
        <Metric label="Tokens per parameter" value={fmt(D / N, 0)} tone={D / N >= 20 ? "emerald" : "rose"} sub={`compute-optimal ≈ 20 → ${big(chin)} tokens`} />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        DeepMind's Chinchilla work (2022) found that for a fixed training budget, about 20 tokens per parameter gives
        the best model. Modern models are trained far past that — Llama 3 8B saw 15 trillion tokens, roughly 1,900 per
        parameter — because a smaller model trained longer is cheaper to serve to millions of users. These figures
        are a floor: real runs also pay for restarts, experiments and evaluation.
      </p>
    </Panel>
  );
}

export function Families() {
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
      {FAMILY_ORDER.map((id) => {
        const p = PROFILES[id];
        const status = p.weights.status;
        return (
          <a key={id} href={`#${FAMILY_PATHS[id]}`} className="block p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.08] no-underline">
            <div className="flex items-center justify-between gap-2 mb-1">
              <span className="font-semibold text-white">{FAMILY_NAMES[id]}</span>
              <span className={`text-[0.625rem] uppercase tracking-wide px-2 py-0.5 rounded-full border ${status === "open" ? "border-emerald-500/40 text-emerald-300" : status === "closed" ? "border-rose-500/40 text-rose-300" : "border-amber-500/40 text-amber-300"}`}>
                {status} weights
              </span>
            </div>
            <div className="text-xs text-gray-400">{p.maker} · current: <span className="text-gray-200">{p.lineup[0].name}</span></div>
          </a>
        );
      })}
    </div>
  );
}

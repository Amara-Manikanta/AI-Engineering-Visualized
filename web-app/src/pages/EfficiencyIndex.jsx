import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";

/* --------------------------------------------------------------------------
   Every technique here is a claim about arithmetic, so the page does the
   arithmetic and lets you stack them.

   Weights   = params × bytes_per_param
   KV cache  = 2 (K and V) × layers × kv_heads × head_dim × bytes × tokens

   The KV figure is the one people get wrong, because it depends on the number
   of KEY/VALUE heads, not query heads — which is exactly what GQA reduces.
-------------------------------------------------------------------------- */

const MODELS = {
  "8B (Llama-class)": { params: 8.0e9, layers: 32, qHeads: 32, kvHeads: 8, headDim: 128, active: 8.0e9 },
  "70B (Llama-class)": { params: 70.6e9, layers: 80, qHeads: 64, kvHeads: 8, headDim: 128, active: 70.6e9 },
  "405B (Llama-class)": { params: 405e9, layers: 126, qHeads: 128, kvHeads: 8, headDim: 128, active: 405e9 },
  "MoE 8×7B (Mixtral)": { params: 46.7e9, layers: 32, qHeads: 32, kvHeads: 8, headDim: 128, active: 12.9e9 },
};

const WEIGHT_BITS = {
  "fp16 — none": 16,
  "int8 — 2×": 8,
  "4-bit — 4× (GGUF/AWQ)": 4,
  "~1.58-bit — 10× (BitNet)": 1.6,
};

const KV_MODES = {
  "Full MHA (no GQA)": { factor: null, note: "one KV head per query head" },
  "GQA (grouped-query)": { factor: 1, note: "the modern default" },
  "GQA + 4-bit KV quant": { factor: 0.25, note: "quantise the cache itself" },
  "MLA (latent attention)": { factor: 0.07, note: "DeepSeek-style, ~93% smaller" },
  "None — linear architecture": { factor: 0, note: "Mamba/RWKV: constant state" },
};

const HARDWARE = [
  { n: "Phone / 8GB laptop", gb: 6 },
  { n: "16GB laptop", gb: 13 },
  { n: "32GB workstation", gb: 28 },
  { n: "RTX 4090 (24GB)", gb: 23 },
  { n: "A100 80GB", gb: 78 },
  { n: "8× A100 node", gb: 624 },
];

const GB = (bytes) => bytes / 1e9;

function BudgetCalculator() {
  const [modelName, setModelName] = useState("70B (Llama-class)");
  const [bitsName, setBitsName] = useState("4-bit — 4× (GGUF/AWQ)");
  const [kvName, setKvName] = useState("GQA (grouped-query)");
  const [logCtx, setLogCtx] = useState(15); // 32768

  const m = MODELS[modelName];
  const ctx = Math.round(Math.pow(2, logCtx));

  const calc = useMemo(() => {
    const bits = WEIGHT_BITS[bitsName];
    const weights = (m.params * bits) / 8;

    const kv = KV_MODES[kvName];
    // Full MHA means one KV head per query head; GQA shares them.
    const kvHeads = kv.factor === null ? m.qHeads : m.kvHeads;
    const perTokenFull = 2 * m.layers * kvHeads * m.headDim * 2; // fp16 bytes
    const scale = kv.factor === null ? 1 : kv.factor;
    const cache = perTokenFull * scale * ctx;

    const total = weights + cache;
    const fp16Baseline = m.params * 2 + 2 * m.layers * m.qHeads * m.headDim * 2 * ctx;

    return {
      weights,
      cache,
      total,
      perToken: perTokenFull * scale,
      saving: fp16Baseline / Math.max(total, 1),
      fp16Baseline,
      activeRatio: m.active / m.params,
    };
  }, [m, bitsName, kvName, ctx]);

  const fits = HARDWARE.filter((h) => GB(calc.total) <= h.gb);
  const smallest = fits[0];

  return (
    <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.07] p-6">
      <h3 className="text-indigo-400 font-bold mb-1">What actually fits in your RAM</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        Two numbers decide everything: the weights, which are fixed once you pick a precision, and the KV cache,
        which grows with every token in the conversation. Most people budget for the first and are surprised by the
        second.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Model</span>
          <select
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className="w-full mt-2 bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-sm text-gray-200"
          >
            {Object.keys(MODELS).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Weight quantization</span>
          <select
            value={bitsName}
            onChange={(e) => setBitsName(e.target.value)}
            className="w-full mt-2 bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-sm text-gray-200"
          >
            {Object.keys(WEIGHT_BITS).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">KV cache strategy</span>
          <select
            value={kvName}
            onChange={(e) => setKvName(e.target.value)}
            className="w-full mt-2 bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-sm text-gray-200"
          >
            {Object.keys(KV_MODES).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
          <span className="text-[0.6875rem] text-gray-600">{KV_MODES[kvName].note}</span>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Context length</span>
          <input
            type="range"
            min="10"
            max="20"
            step="1"
            value={logCtx}
            onChange={(e) => setLogCtx(Number(e.target.value))}
            className="w-full mt-3 accent-indigo-500"
          />
          <span className="font-mono text-indigo-300 text-sm">{ctx.toLocaleString()} tokens</span>
        </label>
      </div>

      {/* stacked bar */}
      <div className="mb-4">
        <div className="flex h-9 rounded-lg overflow-hidden border border-white/10 bg-black/40">
          <div
            className="bg-indigo-500/70 flex items-center justify-center text-[0.625rem] font-mono text-white font-bold"
            style={{ width: `${Math.max((calc.weights / calc.total) * 100, 0)}%` }}
          >
            {calc.weights / calc.total > 0.15 ? "weights" : ""}
          </div>
          <div
            className="bg-amber-500/60 flex items-center justify-center text-[0.625rem] font-mono text-black font-bold"
            style={{ width: `${Math.max((calc.cache / calc.total) * 100, 0)}%` }}
          >
            {calc.cache / calc.total > 0.15 ? "KV cache" : ""}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-4 rounded-xl bg-black/40 border border-indigo-500/30">
          <div className="text-[0.625rem] uppercase tracking-wide text-indigo-400 mb-1">Weights</div>
          <div className="text-2xl font-bold font-mono text-indigo-300">{GB(calc.weights).toFixed(1)}</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">GB</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-amber-500/30">
          <div className="text-[0.625rem] uppercase tracking-wide text-amber-400 mb-1">KV cache</div>
          <div className="text-2xl font-bold font-mono text-amber-300">{GB(calc.cache).toFixed(1)}</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">
            {(calc.perToken / 1024).toFixed(0)} KB per token
          </div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Total</div>
          <div className="text-2xl font-bold font-mono text-white">{GB(calc.total).toFixed(1)}</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">GB resident</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/30">
          <div className="text-[0.625rem] uppercase tracking-wide text-emerald-400 mb-1">vs fp16 + MHA</div>
          <div className="text-2xl font-bold font-mono text-emerald-300">{calc.saving.toFixed(1)}×</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">
            was {GB(calc.fp16Baseline).toFixed(0)} GB
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2 mb-3">
        {HARDWARE.map((h) => {
          const ok = GB(calc.total) <= h.gb;
          return (
            <span
              key={h.n}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                ok
                  ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
                  : "border-white/10 bg-white/[0.03] text-gray-600"
              }`}
            >
              {ok ? "✓" : "✗"} {h.n}
            </span>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 leading-relaxed">
        {smallest
          ? `Smallest thing this runs on: ${smallest.n}.`
          : "Does not fit on any single machine listed — this is where offloading or distributed inference starts."}{" "}
        {calc.activeRatio < 1 && (
          <>
            Note this is a sparse model: all {GB(calc.weights).toFixed(0)} GB must be resident, but only{" "}
            {(calc.activeRatio * 100).toFixed(0)}% of the parameters run per token. Mixture of experts buys speed,
            not memory.
          </>
        )}
      </p>
    </div>
  );
}

/* --------------------------------------------------------------------------
   The eleven techniques, grouped by WHICH budget they attack. The flat list
   is harder to reason about than the grouping, because techniques in the
   same group often do not compose.
-------------------------------------------------------------------------- */


/** Alternate names and acronyms that live in prose, so search can find them. */
export const SEARCH_KEYWORDS = [
  "PTQ", "GGUF", "AWQ", "GPTQ", "EXL2", "BitNet", "post-training quantization",
  "KV cache", "KV-cache compression", "MLA", "Multi-head Latent Attention",
  "PagedAttention", "GQA", "grouped-query attention", "KV quantization",
  "state space model", "SSM", "Jamba", "sub-quadratic",
  "MoE", "mixture of experts", "sparse activation",
  "speculative decoding", "Medusa", "EAGLE", "draft and verify",
  "prompt caching", "prefix caching", "RadixAttention",
  "offloading", "mmap", "NVMe", "AirLLM", "DeepSpeed", "layer paging", "tiered memory",
  "teacher-student", "synthetic data",
  "early exit", "adaptive depth", "layer skipping", "CALM",
  "distributed inference", "Petals", "Exo", "pipeline parallelism", "swarm",
  "agent harness", "scaffolding", "LLMOps", "edge AI", "vLLM", "continuous batching",
];

const GROUPS = [
  {
    n: "Shrink the weights",
    budget: "Disk and resident RAM",
    tone: "border-indigo-500/30 bg-indigo-500/[0.07]",
    label: "text-indigo-400",
    items: [
      {
        id: "quantization",
        t: "Extreme weight quantization",
        real: "Post-training quantization — GGUF, AWQ, GPTQ, EXL2, BitNet",
        d: "Store each weight in 8, 4, or fewer bits instead of 16. A 70B model goes from 140 GB to about 35 GB at 4-bit. Quality holds surprisingly well down to 4-bit and degrades sharply below it; the sub-2-bit results require training that way from scratch, not converting afterwards.",
        fails:
          "Below 4-bit, quality falls off a cliff for models converted after training. The sub-2-bit results come from models trained that way from scratch, which you cannot do to a checkpoint you downloaded.",
        link: "#/genai/quantization",
        linkLabel: "Quantization",
      },
      {
        id: "distillation",
        t: "Knowledge distillation",
        real: "Teacher–student distillation",
        d: "Train a small model to imitate a large one, often on synthetic reasoning traces. Unlike quantization this changes the architecture, so the savings are unbounded — but the student inherits the teacher's ceiling and its errors.",
        fails:
          "The student inherits the teacher's errors and its ceiling, and narrows to whatever distribution it was distilled on. It will be confidently wrong in exactly the places the teacher was.",
        link: "#/genai/distillation",
        linkLabel: "Distillation",
      },
    ],
  },
  {
    n: "Shrink the runtime state",
    budget: "RAM that grows with the conversation",
    tone: "border-amber-500/30 bg-amber-500/[0.07]",
    label: "text-amber-400",
    items: [
      {
        id: "kv-cache",
        t: "KV-cache compression",
        real: "GQA, Multi-head Latent Attention (MLA), KV quantization, PagedAttention",
        d: "The cache is the cost that surprises people: at long context it can exceed the weights. Grouped-query attention shares key/value heads across query heads. MLA projects KV into a small latent and reconstructs on the fly. PagedAttention does not shrink the cache but stops it fragmenting, which in practice recovers a similar amount.",
        fails:
          "MLA is an architectural choice, not something you can bolt onto an existing model. KV quantization below 4-bit degrades long-context recall noticeably, because early tokens are read through the most rounding.",
      },
      {
        id: "linear",
        t: "Linear / sub-quadratic architecture",
        real: "State space models, Mamba, RWKV, Jamba hybrids",
        d: "Replace attention with a recurrence carrying a fixed-size state. The KV cache disappears entirely — memory per token becomes constant rather than linear. The cost is weaker exact recall, which is why production systems interleave a few attention layers.",
        fails:
          "Exact recall of a specific earlier token. A fixed-size state is a lossy summary, which is why hybrids keep a few attention layers rather than none.",
        link: "#/ml/mamba",
        linkLabel: "Mamba & SSMs",
      },
    ],
  },
  {
    n: "Do less work per token",
    budget: "FLOPs and latency",
    tone: "border-emerald-500/30 bg-emerald-500/[0.07]",
    label: "text-emerald-400",
    items: [
      {
        id: "moe",
        t: "Selective compute activation",
        real: "Mixture of Experts, sparse activation",
        d: "A router sends each token to a few of many expert subnetworks. Mixtral holds 46.7B parameters but runs about 12.9B per token. Read the trade carefully: every expert must still be in memory, so this buys compute, not RAM.",
        fails:
          "Every expert must be resident, so this saves no memory at all. It also makes batching lumpier, since tokens in one batch may route to different experts.",
        link: "#/llms/types#moe",
        linkLabel: "Mixture of Experts",
      },
      {
        id: "early-exit",
        t: "Early exit / adaptive depth",
        real: "Early-exit inference, dynamic layer skipping, CALM",
        d: "Attach a classifier after intermediate layers; when it is confident enough, stop and emit. Most tokens in ordinary text are easy — punctuation, function words, the obvious continuation. The difficulty is that batching breaks down when different sequences exit at different depths.",
        fails:
          "Batching. If sequences in a batch exit at different depths you either pad to the deepest or break the batch, and both give the throughput back.",
      },
      {
        id: "speculative",
        t: "Draft-and-verify generation",
        real: "Speculative decoding, Medusa heads, EAGLE",
        d: "A small model proposes several tokens; the large model checks them all in one parallel pass. Rejected drafts cost nothing but the wasted draft compute, and the output distribution is provably identical to the large model alone. Typically 2–3× faster.",
        fails:
          "A low acceptance rate makes it a net loss — you pay for the draft and throw it away. It also competes for memory bandwidth, so it fights offloading.",
        link: "#/llm-inference",
        linkLabel: "LLM Inference",
      },
    ],
  },
  {
    n: "Reuse work you already did",
    budget: "Time-to-first-token, and the bill",
    tone: "border-purple-500/30 bg-purple-500/[0.07]",
    label: "text-purple-400",
    items: [
      {
        id: "prompt-caching",
        t: "System prompt re-use",
        real: "Prompt caching, prefix caching, RadixAttention",
        d: "A long system prompt produces the same KV entries every call. Cache them and the prefill for that span drops to nearly zero. It only works on an exact prefix match — one changed character near the start invalidates everything after it, so put the volatile parts last.",
        fails:
          "It matches an exact prefix. A timestamp, a session id, or a shuffled retrieval order near the start invalidates everything after it, silently, and you just pay full price.",
      },
    ],
  },
  {
    n: "Move the bottleneck elsewhere",
    budget: "VRAM, at the cost of bandwidth",
    tone: "border-rose-500/30 bg-rose-500/[0.07]",
    label: "text-rose-400",
    items: [
      {
        id: "offloading",
        t: "Memory-mapped SSD streaming",
        real: "Tiered memory offloading, layer paging, mmap, AirLLM, DeepSpeed-Inference",
        d: "Keep the weights on NVMe and stream each layer in as it is needed. It genuinely lets a 70B model run on 16 GB of RAM, and it is slow — you are bounded by SSD bandwidth rather than memory bandwidth, so expect seconds per token rather than tens per second. Useful for batch work, painful for chat.",
        fails:
          "You become bound by SSD bandwidth rather than memory bandwidth, so expect seconds per token. Fine for batch work, unusable for chat.",
      },
      {
        id: "swarm",
        t: "Local swarm compute",
        real: "Distributed edge inference, pipeline parallelism, Exo, Petals",
        d: "Split the layers across several machines on a LAN and pass activations between them. Pooled RAM is the win. Network latency per layer boundary is the cost, and it compounds with every token, so this works far better over Thunderbolt or 10GbE than over Wi-Fi.",
        fails:
          "Per-layer network latency compounds with every token. Over Wi-Fi this often ends up slower than a smaller model running locally.",
      },
    ],
  },
];

const SCAFFOLD = {
  t: "Agent scaffolding",
  real: "Agent harness, multi-pass planning, deterministic repair",
  d: "Structure around the model rather than inside it: plan before acting, verify with tools, repair failures deterministically instead of re-prompting. It can lift a small model's usable output well above its raw benchmark score, and it is the only item here that costs more tokens rather than fewer.",
};

export default function EfficiencyIndex() {
  const toc = [
    { label: "Three Budgets", hash: "budgets" },
    { label: "Memory Calculator", hash: "calc" },
    { label: "The Techniques", hash: "techniques" },
    { label: "Extreme weight quantization", hash: "quantization", indent: true },
    { label: "Knowledge distillation", hash: "distillation", indent: true },
    { label: "KV-cache compression", hash: "kv-cache", indent: true },
    { label: "Linear / sub-quadratic architecture", hash: "linear", indent: true },
    { label: "Selective compute activation", hash: "moe", indent: true },
    { label: "Early exit / adaptive depth", hash: "early-exit", indent: true },
    { label: "Draft-and-verify generation", hash: "speculative", indent: true },
    { label: "System prompt re-use", hash: "prompt-caching", indent: true },
    { label: "Memory-mapped SSD streaming", hash: "offloading", indent: true },
    { label: "Local swarm compute", hash: "swarm", indent: true },
    { label: "Agent scaffolding", hash: "scaffolding", indent: true },
    { label: "What Composes", hash: "compose" },
    { label: "A Note on the Eleventh", hash: "scaffolding" },
    { label: "Picking a Stack", hash: "stacks" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Efficient Inference"
      intro="How a 70B model ends up running on a laptop. Every technique here trades one resource for another — the skill is knowing which trade you are making."
      toc={toc}
    >
      <section id="budgets" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Three Budgets, Not One</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          "Making the model smaller" is not one problem. Techniques that look interchangeable in a list attack
          different resources, and confusing them leads to the most common planning mistake: quantizing a model
          heavily, then running out of memory anyway because the KV cache was the real constraint.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ["Memory", "Weights plus the KV cache. Weights are fixed; the cache grows with every token. This is what decides whether the model runs at all.", "border-indigo-500/25 bg-indigo-500/[0.07]", "text-indigo-400"],
            ["Compute", "FLOPs per token. Decides throughput on a busy server, and battery life on a device. Sparsity and early exit live here.", "border-emerald-500/25 bg-emerald-500/[0.07]", "text-emerald-400"],
            ["Latency", "Time to the first token, then time between tokens. Governed by memory bandwidth far more than by raw FLOPs, which is why quantization often speeds things up as a side effect.", "border-purple-500/25 bg-purple-500/[0.07]", "text-purple-400"],
          ].map(([n, d, box, tone]) => (
            <div key={n} className={`p-5 rounded-xl border ${box}`}>
              <div className={`font-bold mb-1.5 ${tone}`}>{n}</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="calc" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Memory Calculator</h2>
        <BudgetCalculator />
        <div className="mt-5 p-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>Try this.</strong> Take the 70B model at fp16 with full multi-head attention and push the context
            to 128k — the cache alone dwarfs the weights. Now switch to grouped-query attention, which almost every
            modern model already uses, and watch the same number collapse. GQA is the single largest KV saving
            available and it is already in the architecture you are using.
          </p>
        </div>
      </section>

      <section id="techniques" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Techniques</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Grouped by which budget each one attacks, because that is what determines whether two of them stack.
        </p>
        <div className="space-y-6">
          {GROUPS.map((g) => (
            <div key={g.n} className={`rounded-2xl border p-5 ${g.tone}`}>
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-4">
                <div className={`font-bold ${g.label}`}>{g.n}</div>
                <div className="text-[0.625rem] uppercase tracking-wide text-gray-500">Saves: {g.budget}</div>
              </div>
              <div className="space-y-3">
                {g.items.map((it) => (
                  <section key={it.t} id={it.id} className="p-4 rounded-xl bg-black/30 border border-white/10 scroll-mt-24">
                    <div className="flex flex-wrap items-baseline gap-2 mb-1">
                      <span className="text-sm font-semibold text-white">{it.t}</span>
                      {it.link && (
                        <a href={it.link} className="text-[0.6875rem] text-blue-400 hover:underline shrink-0">
                          {it.linkLabel} →
                        </a>
                      )}
                    </div>
                    <div className="text-[0.6875rem] font-mono text-gray-500 mb-2">{it.real}</div>
                    <p className="text-xs text-gray-300 leading-relaxed mb-2">{it.d}</p>
                    {it.fails && (
                      <p className="text-xs text-rose-300/90 leading-relaxed m-0">
                        <span className="text-gray-500 uppercase tracking-wide text-[0.625rem]">Where it bites </span>
                        {it.fails}
                      </p>
                    )}
                  </section>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="compose" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">What Composes and What Does Not</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Savings across different budgets multiply. Savings within the same budget usually do not, and a few pairs
          actively fight each other.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="p-5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07]">
            <div className="font-semibold text-emerald-400 mb-2">Stacks cleanly</div>
            <ul className="text-xs text-gray-300 space-y-1.5 list-disc pl-5 m-0">
              <li>4-bit weights + KV quantization — different memory, both count.</li>
              <li>Quantization + speculative decoding — memory and latency.</li>
              <li>MoE + quantization — compute and memory.</li>
              <li>Prompt caching + almost anything — it is upstream of the model.</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-rose-500/25 bg-rose-500/[0.07]">
            <div className="font-semibold text-rose-400 mb-2">Fights or overlaps</div>
            <ul className="text-xs text-gray-300 space-y-1.5 list-disc pl-5 m-0">
              <li>Linear architecture + KV compression — there is no cache left to compress.</li>
              <li>Early exit + batching — sequences exiting at different depths wreck the batch.</li>
              <li>Offloading + speculative decoding — the draft model competes for the same bandwidth.</li>
              <li>Aggressive quantization + distillation — errors compound, and both cost quality.</li>
            </ul>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            The rule worth remembering: <strong className="text-white">sparsity is not compression.</strong> A
            mixture-of-experts model needs every expert resident in memory even though it runs a fraction of them.
            People routinely plan capacity from the active parameter count and come up short by a factor of four.
          </p>
        </div>
      </section>

      <section id="scaffolding" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">A Note on the Eleventh</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          Agent scaffolding is often listed alongside the ten above. It belongs in a different category, and the
          distinction is worth keeping.
        </p>
        <div className="p-5 rounded-xl border border-cyan-500/25 bg-cyan-500/[0.07] mb-5">
          <div className="text-sm font-semibold text-white mb-1">{SCAFFOLD.t}</div>
          <div className="text-[0.6875rem] font-mono text-gray-500 mb-2">{SCAFFOLD.real}</div>
          <p className="text-xs text-gray-300 leading-relaxed m-0">{SCAFFOLD.d}</p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm font-semibold text-white mb-2">The other ten change the model</div>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              They alter what runs, or how, and are measured in gigabytes, FLOPs and milliseconds. They cost quality
              and buy resources.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm font-semibold text-white mb-2">Scaffolding changes the system</div>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              The model is untouched. It costs <em>more</em> tokens and more wall-clock time, and buys reliability.
              That is the opposite trade, which is why putting it in the same table is misleading.
            </p>
          </div>
        </div>
        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            Both matter, and they combine well — a heavily quantized small model with good scaffolding often beats a
            larger model called naively. See{" "}
            <a href="#/agents/frameworks" className="text-blue-400 hover:underline">agent frameworks</a> and{" "}
            <a href="#/agents/debugging" className="text-blue-400 hover:underline">debugging agents</a>, where the
            compounding-reliability arithmetic explains why the extra passes pay for themselves.
          </p>
        </div>
      </section>

      <section id="stacks" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Picking a Stack</h2>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-left">
                <th className="px-4 py-3 font-semibold text-white">Situation</th>
                <th className="px-4 py-3 font-semibold text-white">Reach for</th>
                <th className="px-4 py-3 font-semibold text-white">Skip</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                ["Laptop, chat, 16GB", "4-bit weights, GQA, prompt caching", "Offloading — seconds per token kills chat"],
                ["Phone / embedded", "Small distilled model at 4-bit, early exit", "MoE — all experts must still fit"],
                ["One GPU, serving many users", "Quantization, PagedAttention, continuous batching", "Early exit — it breaks batching"],
                ["Very long documents", "Linear or hybrid architecture, or MLA", "Plain MHA at any precision"],
                ["Batch job, no latency budget", "SSD offloading, largest model you can stream", "Speculative decoding — it competes for bandwidth"],
                ["Several machines on a LAN", "Pipeline parallelism over the fastest link you have", "Wi-Fi, if there is any wired option"],
              ].map(([s, y, n]) => (
                <tr key={s} className="border-t border-white/10">
                  <td className="px-4 py-3 text-xs font-semibold text-gray-300 align-top whitespace-nowrap">{s}</td>
                  <td className="px-4 py-3 text-xs text-emerald-300 leading-relaxed">{y}</td>
                  <td className="px-4 py-3 text-xs text-rose-300 leading-relaxed">{n}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="code" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">In Code</h2>
        <CodeBlock
          language="python"
          code={`# --- Budget it before you download 140 GB ---------------------------------
def memory_gb(params, layers, kv_heads, head_dim, weight_bits, ctx, kv_bits=16):
    weights = params * weight_bits / 8
    # 2 for K and V. kv_heads, NOT query heads — this is what GQA reduces.
    per_token = 2 * layers * kv_heads * head_dim * (kv_bits / 8)
    return (weights + per_token * ctx) / 1e9

# Llama-70B: 80 layers, 8 KV heads (GQA), head_dim 128
print(memory_gb(70.6e9, 80, 8,  128, 4, 32_768))    # ~46 GB
print(memory_gb(70.6e9, 80, 64, 128, 4, 32_768))    # ~121 GB without GQA


# --- vLLM: paged KV, prefix caching, quantized weights --------------------
from vllm import LLM, SamplingParams

llm = LLM(
    model="meta-llama/Llama-3.1-70B-Instruct",
    quantization="awq",              # 4-bit weights
    kv_cache_dtype="fp8",            # halve the cache again
    enable_prefix_caching=True,      # reuse the system prompt's KV
    gpu_memory_utilization=0.92,
    max_model_len=32_768,
    # A small model drafts, the big one verifies — same output distribution.
    speculative_config={"model": "meta-llama/Llama-3.2-1B-Instruct",
                        "num_speculative_tokens": 5},
)

# Put the STABLE text first. Prefix caching matches an exact prefix, so one
# changed character early invalidates everything after it.
prompt = SYSTEM_PROMPT + RETRIEVED_DOCS + user_question`}
        />
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          The two printed numbers are the point of this page. Same model, same 4-bit weights, same context — and a
          2.6× difference in total memory that comes entirely from how many key/value heads the architecture shares.
        </p>
      </section>

      <KnowledgeCheck questions={questionsFor("efficiency")} />
    </GuideLayout>
  );
}

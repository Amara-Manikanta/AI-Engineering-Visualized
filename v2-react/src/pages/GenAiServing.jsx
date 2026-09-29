import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section, Segmented } from "../components/VizKit";
import { rng } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "LLM serving", "inference server", "prefill", "decode", "memory bound", "compute bound", "arithmetic intensity",
  "roofline", "KV cache", "KV cache size", "continuous batching", "in-flight batching", "static batching",
  "PagedAttention", "vLLM", "SGLang", "RadixAttention", "TensorRT-LLM", "Triton Inference Server", "TGI",
  "llama.cpp", "Ollama", "ONNX Runtime", "FlashAttention", "prefix caching", "prompt caching",
  "speculative decoding", "Medusa", "EAGLE", "disaggregated serving", "prefill decode disaggregation",
  "multi-LoRA serving", "S-LoRA", "LoRAX", "TTFT", "time to first token", "TPOT", "inter-token latency",
  "throughput", "goodput", "batch API",
];

/* ---------------------------------------------------------------------------
   Decode is memory-bound: every step must read all the weights plus every
   sequence's KV cache from GPU memory. This calculator uses Llama-3-8B-like
   shapes on one H100 (80 GB, ~3.35 TB/s HBM, ~989 TFLOP/s dense bf16).
--------------------------------------------------------------------------- */

const GPU = { mem: 80e9, bw: 3.35e12, flops: 989e12 };
const MODELS = {
  "8b": { label: "8B (32 layers, 8 KV heads)", params: 8e9, layers: 32, kvHeads: 8, headDim: 128 },
  "70b-fp8": { label: "70B in fp8 (80 layers, 8 KV heads)", params: 70e9, layers: 80, kvHeads: 8, headDim: 128, bytes: 1 },
};

function DecodeLab() {
  const [modelId, setModelId] = useState("8b");
  const [batch, setBatch] = useState(16);
  const [ctx, setCtx] = useState(4096);
  const m = MODELS[modelId];
  const wBytes = m.params * (m.bytes ?? 2);
  const kvPerToken = 2 * m.layers * m.kvHeads * m.headDim * 2; // K and V, bf16
  const kvBytes = batch * ctx * kvPerToken;
  const fits = wBytes + kvBytes <= GPU.mem * 0.92;
  const maxBatch = Math.max(0, Math.floor((GPU.mem * 0.92 - wBytes) / (ctx * kvPerToken)));

  const memTime = (wBytes + kvBytes) / GPU.bw; // seconds per decode step, memory side
  const compTime = (2 * m.params * batch) / GPU.flops; // compute side (ignoring attention FLOPs)
  const step = Math.max(memTime, compTime);
  const perUser = 1 / step;
  const total = batch / step;
  const bound = memTime >= compTime ? "memory-bound" : "compute-bound";

  // Throughput curve against batch size, at this context length.
  const curve = useMemo(() => {
    const pts = [];
    for (let b = 1; b <= 256; b *= 2) {
      const kv = b * ctx * kvPerToken;
      if (wBytes + kv > GPU.mem * 0.92) break;
      const st = Math.max((wBytes + kv) / GPU.bw, (2 * m.params * b) / GPU.flops);
      pts.push({ b, total: b / st, per: 1 / st });
    }
    return pts;
  }, [ctx, kvPerToken, wBytes, m.params]);
  const maxT = Math.max(1, ...curve.map((p) => p.total));
  const W = 340;
  const H = 150;
  const x = (b) => 24 + (Math.log2(b) / 8) * (W - 36);
  const y = (v) => H - 20 - (v / maxT) * (H - 32);

  return (
    <Panel tone="indigo" title="Decode speed is set by memory bandwidth, not FLOPs">
      <div className="mb-4">
        <Segmented value={modelId} onChange={setModelId} options={Object.entries(MODELS).map(([v, o]) => ({ v, label: o.label }))} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_270px] gap-5">
        <div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
            <Slider label="Concurrent sequences (batch)" value={batch} min={1} max={256} onChange={setBatch} />
            <Slider label="Context per sequence" value={ctx} min={512} max={32768} step={512} onChange={setCtx} format={(v) => `${(v / 1024).toFixed(1)}K tokens`} />
          </div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
            <path d={curve.map((p, i) => `${i ? "L" : "M"}${x(p.b)},${y(p.total)}`).join("")} fill="none" stroke="#818cf8" strokeWidth="2" />
            {curve.map((p) => (
              <g key={p.b}>
                <circle cx={x(p.b)} cy={y(p.total)} r="3" fill="#818cf8" />
                <text x={x(p.b)} y={H - 6} fill="#6b7280" fontSize="9" textAnchor="middle">{p.b}</text>
              </g>
            ))}
            {fits && <line x1={x(batch)} y1="6" x2={x(batch)} y2={H - 20} stroke="#e5e7eb" strokeDasharray="3 3" />}
            <text x="24" y="14" fill="#818cf8" fontSize="10">total tokens/s vs batch (until memory runs out)</text>
          </svg>
        </div>
        <div className="space-y-2">
          {fits ? (
            <>
              <div className="grid grid-cols-2 gap-2">
                <Metric label="Per user, tok/s" value={perUser.toFixed(0)} tone="emerald" />
                <Metric label="Total, tok/s" value={Math.round(total).toLocaleString()} tone="indigo" />
              </div>
              <Metric label="Regime" value={bound} tone={bound === "memory-bound" ? "amber" : "rose"} />
            </>
          ) : (
            <Metric label="Does not fit" value="out of memory" tone="rose" sub={`max batch at this context ≈ ${maxBatch}`} />
          )}
          <Metric label="KV cache" value={`${(kvBytes / 1e9).toFixed(1)} GB`} sub={`${(kvPerToken / 1024).toFixed(0)} KB per token × ${batch} × ${ctx.toLocaleString()}`} />
          <Metric label="Weights" value={`${(wBytes / 1e9).toFixed(0)} GB`} />
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Each decode step generates one token per sequence but must stream every weight through the GPU. At batch 1
        the chip does little arithmetic per byte fetched, so speed is bandwidth ÷ model size. Batching shares each
        weight read across many sequences — total throughput climbs almost linearly — until the KV cache, which
        grows with batch × context, eats the memory and the reading time. This is why serving engines obsess over
        batching and KV-cache memory. Figures are idealised upper bounds; real engines reach a fraction of them.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Static vs continuous batching on the same 12 requests with varied lengths.
--------------------------------------------------------------------------- */

const REQS = (() => {
  const r = rng(6);
  return Array.from({ length: 12 }, (_, i) => ({ id: i, arrive: Math.floor(i * 2.5), len: 4 + Math.floor(r() * 26) }));
})();

function schedule(kind, slots = 4) {
  const out = [];
  if (kind === "static") {
    let t = 0;
    for (let i = 0; i < REQS.length; i += slots) {
      const group = REQS.slice(i, i + slots);
      const start = Math.max(t, ...group.map((g) => g.arrive));
      const longest = Math.max(...group.map((g) => g.len));
      group.forEach((g, k) => out.push({ ...g, slot: k, start, end: start + g.len, batchEnd: start + longest }));
      t = start + longest;
    }
  } else {
    const free = new Array(slots).fill(0);
    REQS.forEach((g) => {
      let k = 0;
      for (let j = 1; j < slots; j++) if (free[j] < free[k]) k = j;
      const start = Math.max(free[k], g.arrive);
      out.push({ ...g, slot: k, start, end: start + g.len, batchEnd: start + g.len });
      free[k] = start + g.len;
    });
  }
  const makespan = Math.max(...out.map((o) => o.batchEnd));
  const latency = out.reduce((s, o) => s + (o.end - o.arrive), 0) / out.length;
  const busy = out.reduce((s, o) => s + o.len, 0);
  return { out, makespan, latency, util: busy / (makespan * slots) };
}

function BatchingLab() {
  const [kind, setKind] = useState("continuous");
  const res = schedule(kind);
  const other = schedule(kind === "static" ? "continuous" : "static");
  const W = 380;
  const rowH = 24;
  const scaleMax = Math.max(res.makespan, other.makespan);
  const x = (t) => 40 + (t / scaleMax) * (W - 50);
  const colours = ["#818cf8", "#34d399", "#fbbf24", "#fb7185", "#60a5fa", "#a78bfa"];
  return (
    <Panel tone="emerald" title="Static vs continuous batching — 12 requests, 4 slots">
      <div className="mb-4">
        <Segmented tone="emerald" value={kind} onChange={setKind} options={[{ v: "static", label: "Static batching" }, { v: "continuous", label: "Continuous batching" }]} />
      </div>
      <svg viewBox={`0 0 ${W} ${4 * rowH + 24}`} className="w-full h-auto block">
        {[0, 1, 2, 3].map((s) => (
          <g key={s}>
            <text x="4" y={s * rowH + 16} fill="#6b7280" fontSize="10">slot {s + 1}</text>
            <rect x={x(0)} y={s * rowH + 3} width={x(scaleMax) - x(0)} height={rowH - 6} fill="rgba(255,255,255,0.03)" />
          </g>
        ))}
        {res.out.map((o) => (
          <g key={o.id}>
            {kind === "static" && o.batchEnd > o.end && (
              <rect x={x(o.end)} y={o.slot * rowH + 3} width={x(o.batchEnd) - x(o.end)} height={rowH - 6} fill="rgba(251,113,133,0.18)" stroke="rgba(251,113,133,0.4)" strokeDasharray="2 2" />
            )}
            <rect x={x(o.start)} y={o.slot * rowH + 3} width={Math.max(1, x(o.end) - x(o.start) - 1)} height={rowH - 6} rx="3" fill={colours[o.id % colours.length]} opacity="0.85" />
            <text x={x(o.start) + 3} y={o.slot * rowH + 16} fill="#0a0a0a" fontSize="9" fontWeight="700">{o.id + 1}</text>
          </g>
        ))}
        <text x={x(0)} y={4 * rowH + 18} fill="#6b7280" fontSize="10">time (decode steps) →</text>
      </svg>
      <div className="grid grid-cols-3 gap-2 mt-3">
        <Metric label="All done at step" value={res.makespan} tone="emerald" sub={`other: ${other.makespan}`} />
        <Metric label="Mean latency" value={res.latency.toFixed(1)} sub={`other: ${other.latency.toFixed(1)}`} />
        <Metric label="Slot utilisation" value={`${Math.round(res.util * 100)}%`} tone="indigo" sub={`other: ${Math.round(other.util * 100)}%`} />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        With static batching a batch starts together and ends together, so short answers sit idle (red dashed)
        until the longest one finishes, and new requests wait for the whole batch. Continuous (in-flight) batching
        schedules at the level of single decode steps: the moment a sequence finishes, a waiting request takes its
        slot. Every modern serving engine does this.
      </p>
    </Panel>
  );
}

const ENGINES = [
  { n: "vLLM", d: "PagedAttention, continuous batching, prefix caching, speculative decoding, multi-LoRA. The common open-source default for GPU serving." },
  { n: "SGLang", d: "RadixAttention for aggressive prefix sharing, fast structured output; strong for agent and multi-turn workloads." },
  { n: "TensorRT-LLM", d: "NVIDIA's compiled engines with fp8/fp4 kernels; highest raw throughput on NVIDIA GPUs, more build effort. Often served via Triton Inference Server." },
  { n: "Hugging Face TGI", d: "Serving server integrated with the Hugging Face ecosystem." },
  { n: "llama.cpp / Ollama", d: "CPU, Apple Silicon and consumer GPUs with GGUF quantized models; the local and edge default." },
  { n: "ONNX Runtime / MLX", d: "Portable runtimes for exported models across hardware (ONNX) and Apple Silicon (MLX)." },
];

export default function GenAiServing() {
  const toc = [
    { label: "Two Phases: Prefill & Decode", hash: "phases" },
    { label: "Decode Calculator", hash: "decode" },
    { label: "Continuous Batching", hash: "batching" },
    { label: "KV Cache Management", hash: "kv" },
    { label: "FlashAttention", hash: "flash" },
    { label: "Faster Decoding", hash: "speculative" },
    { label: "Serving Architecture", hash: "architecture" },
    { label: "Serving Engines", hash: "engines" },
    { label: "Metrics That Matter", hash: "metrics" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="The LLM Serving Stack"
      intro="What happens between an API request and a stream of tokens: why decoding is memory-bound, continuous batching, KV-cache paging and prefix caching, FlashAttention, speculative decoding, and the engines that put it together."
      toc={toc}
    >
      <Section id="phases" title="Two Phases: Prefill & Decode" lead="Every request runs in two very different phases. Understanding the difference explains almost every serving optimisation.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Prefill — read the prompt" tone="indigo"><p>All prompt tokens go through the model in parallel, filling the KV cache. Lots of arithmetic per weight read, so it is <strong>compute-bound</strong>. Its duration is the time to first token (TTFT).</p></Card>
          <Card title="Decode — write the answer" tone="amber"><p>One token per step per sequence, each step reading all weights and the KV cache. Little arithmetic per byte, so it is <strong>memory-bandwidth-bound</strong>. Its speed is the inter-token latency.</p></Card>
        </div>
        <Note tone="indigo">
          For the model-side walk-through of one generation step, see <a href="#/llm-inference" className="text-blue-400 hover:underline">How LLMs Generate Text</a>; for model compression, <a href="#/efficiency" className="text-blue-400 hover:underline">Efficient Inference</a>.
        </Note>
      </Section>

      <Section id="decode" title="Decode Calculator">
        <DecodeLab />
      </Section>

      <Section id="batching" title="Continuous Batching">
        <BatchingLab />
      </Section>

      <Section id="kv" title="KV Cache Management" lead="The KV cache is the largest dynamic memory consumer in serving. How it is allocated decides how many requests fit.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="PagedAttention" tone="indigo"><p>vLLM stores the cache in fixed-size blocks, like virtual-memory pages, instead of one contiguous slab per request sized for the maximum length. Almost no waste from fragmentation, so far more sequences fit.</p></Card>
          <Card title="Prefix caching" tone="emerald"><p>Requests that share a prefix — the same system prompt, few-shot examples or document — reuse its cached KV blocks and skip that prefill. Provider-side "prompt caching" is the same idea, billed at a discount.</p></Card>
          <Card title="Shrinking the cache" tone="amber"><p>Grouped-query and multi-latent attention store fewer K/V heads; KV quantisation stores them in 8 or 4 bits; offloading moves cold blocks to CPU memory.</p></Card>
        </div>
      </Section>

      <Section id="flash" title="FlashAttention" lead="Standard attention writes the full n × n score matrix to GPU memory and reads it back. FlashAttention never materialises it.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Tiling" tone="purple"><p>Split Q, K and V into blocks that fit in the GPU's small on-chip SRAM, and compute attention block by block.</p></Card>
          <Card title="Online softmax" tone="indigo"><p>Keep a running maximum and running sum so the softmax can be computed incrementally, block by block, with the exact same result.</p></Card>
          <Card title="Why it is faster" tone="emerald"><p>The bottleneck was memory traffic, not arithmetic. Fewer trips to slow HBM means several-times-faster attention and memory linear in sequence length. It is exact, not an approximation.</p></Card>
        </div>
      </Section>

      <Section id="speculative" title="Faster Decoding" lead="Decode steps are memory-bound, so checking several tokens in one step costs about the same as generating one.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Speculative decoding" tone="indigo"><p>A small draft model proposes several tokens; the large model verifies them in one parallel pass and keeps the longest correct prefix. Output is identical to the large model's. Walk through it in <a href="#/llm-inference" className="text-blue-400 hover:underline">LLM Inference</a>.</p></Card>
          <Card title="Medusa & EAGLE" tone="purple"><p>Instead of a separate draft model, extra lightweight heads on the main model predict several future tokens; EAGLE drafts from the model's own hidden features for high acceptance rates.</p></Card>
          <Card title="Structured output" tone="emerald"><p>Constrained decoding masks tokens that would break a JSON schema or grammar. Engines like SGLang and XGrammar make this nearly free. See <a href="#/genai/decoding" className="text-blue-400 hover:underline">Decoding & Sampling</a>.</p></Card>
        </div>
      </Section>

      <Section id="architecture" title="Serving Architecture">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Disaggregated prefill & decode" tone="amber"><p>Run prefill and decode on separate GPU pools and ship the KV cache between them, so long prompts do not stall other users' token streams and each pool can be sized for its own bottleneck.</p></Card>
          <Card title="Multi-LoRA serving" tone="purple"><p>One base model in memory, many small <a href="#/genai/peft/lora" className="text-blue-400 hover:underline">LoRA adapters</a> swapped per request (S-LoRA, LoRAX, vLLM). Hundreds of fine-tuned variants for the cost of one deployment.</p></Card>
          <Card title="Routing & autoscaling" tone="indigo"><p>Route by prefix to maximise cache hits, by model size to control cost, and scale on queue depth and KV-cache usage rather than CPU load.</p></Card>
          <Card title="Batch APIs" tone="emerald"><p>For work that can wait hours — evals, bulk classification, embeddings — providers' batch endpoints trade latency for a large discount by filling idle capacity.</p></Card>
        </div>
      </Section>

      <Section id="engines" title="Serving Engines">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {ENGINES.map((e) => (
            <Card key={e.n} title={e.n} tone="indigo"><p>{e.d}</p></Card>
          ))}
        </div>
      </Section>

      <Section id="metrics" title="Metrics That Matter">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="TTFT" tone="indigo"><p>Time to first token: queueing plus prefill. What users feel as "responsiveness".</p></Card>
          <Card title="TPOT / ITL" tone="emerald"><p>Time per output token, or inter-token latency: how fast the stream flows once it starts.</p></Card>
          <Card title="Throughput" tone="amber"><p>Total tokens per second across all users — what sets cost per token.</p></Card>
          <Card title="Goodput" tone="rose"><p>Requests per second that meet the latency targets. Throughput at the price of blown SLOs is not a win.</p></Card>
        </div>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="bash"
          code={`# An OpenAI-compatible server with vLLM
vllm serve meta-llama/Llama-3.1-8B-Instruct \\
  --max-model-len 16384 \\
  --gpu-memory-utilization 0.90 \\
  --enable-prefix-caching \\
  --enable-lora --lora-modules support=./adapters/support

# Benchmark TTFT, inter-token latency and throughput under load
vllm bench serve --model meta-llama/Llama-3.1-8B-Instruct \\
  --dataset-name random --random-input-len 1024 --random-output-len 256 \\
  --request-rate 8 --num-prompts 500`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("genai-serving")} />
    </GuideLayout>
  );
}

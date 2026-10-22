import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import CodeBlock from "../components/CodeBlock";
import LoraFlow from "../components/LoraFlow";

/* --------------------------------------------------------------------------
   LoRA's whole argument is an arithmetic one, so the page does the arithmetic.

   A weight matrix W is d_out x d_in. LoRA freezes it and learns B·A instead,
   where A is r x d_in and B is d_out x r. Trainable parameters per matrix drop
   from d_out·d_in to r·(d_out + d_in). Everything below is that formula
   applied to real model shapes.
-------------------------------------------------------------------------- */

const MODELS = {
  "7B (Llama-class)": { layers: 32, d: 4096, dFf: 11008, total: 6.74e9 },
  "13B": { layers: 40, d: 5120, dFf: 13824, total: 13.0e9 },
  "70B": { layers: 80, d: 8192, dFf: 28672, total: 70.6e9 },
};

// Which projections the adapter is attached to.
const TARGETS = {
  "q, v only": (m) => 2 * m.d * m.d,
  "all attention (q,k,v,o)": (m) => 4 * m.d * m.d,
  "attention + MLP": (m) => 4 * m.d * m.d + 3 * m.d * m.dFf,
};
const TARGET_SHAPES = {
  "q, v only": (m) => [
    [m.d, m.d],
    [m.d, m.d],
  ],
  "all attention (q,k,v,o)": (m) => Array(4).fill([m.d, m.d]),
  "attention + MLP": (m) => [...Array(4).fill([m.d, m.d]), ...Array(3).fill([m.dFf, m.d])],
};

const fmt = (n) => {
  if (n >= 1e9) return `${(n / 1e9).toFixed(2)}B`;
  if (n >= 1e6) return `${(n / 1e6).toFixed(1)}M`;
  if (n >= 1e3) return `${(n / 1e3).toFixed(1)}K`;
  return String(Math.round(n));
};

function LoraCalculator() {
  const [modelName, setModelName] = useState("7B (Llama-class)");
  const [targetName, setTargetName] = useState("all attention (q,k,v,o)");
  const [rank, setRank] = useState(16);

  const m = MODELS[modelName];

  const stats = useMemo(() => {
    const shapes = TARGET_SHAPES[targetName](m);
    const perLayerFull = shapes.reduce((a, [o, i]) => a + o * i, 0);
    const perLayerLora = shapes.reduce((a, [o, i]) => a + rank * (o + i), 0);
    const full = perLayerFull * m.layers;
    const lora = perLayerLora * m.layers;
    return {
      full,
      lora,
      pctOfTargeted: (lora / full) * 100,
      pctOfModel: (lora / m.total) * 100,
      // fp16 optimiser state for Adam is roughly 2 bytes weights + 4+4 moments.
      adapterMB: (lora * 2) / 1e6,
      optimiserMB: (lora * 8) / 1e6,
      fullTuneGB: (m.total * (2 + 4 + 4 + 4)) / 1e9,
    };
  }, [m, targetName, rank]);

  return (
    <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.07] p-6">
      <h3 className="text-indigo-400 font-bold mb-1">What LoRA actually saves</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        Trainable parameters per matrix go from{" "}
        <span className="font-mono text-indigo-300">d_out × d_in</span> to{" "}
        <span className="font-mono text-indigo-300">r × (d_out + d_in)</span>. Every number below is that formula
        applied to real layer shapes — nothing is rounded off a blog post.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Base model</span>
          <select
            value={modelName}
            onChange={(e) => setModelName(e.target.value)}
            className="w-full mt-2 bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-sm text-gray-200"
          >
            {Object.keys(MODELS).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Target modules</span>
          <select
            value={targetName}
            onChange={(e) => setTargetName(e.target.value)}
            className="w-full mt-2 bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-sm text-gray-200"
          >
            {Object.keys(TARGETS).map((k) => (
              <option key={k} value={k}>
                {k}
              </option>
            ))}
          </select>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Rank r</span>
          <input
            type="range"
            min="1"
            max="128"
            step="1"
            value={rank}
            onChange={(e) => setRank(Number(e.target.value))}
            className="w-full mt-3 accent-indigo-500"
          />
          <span className="font-mono text-indigo-300 text-sm">{rank}</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Full fine-tune of these</div>
          <div className="text-2xl font-bold font-mono text-gray-300">{fmt(stats.full)}</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">trainable parameters</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-indigo-500/30">
          <div className="text-[0.625rem] uppercase tracking-wide text-indigo-400 mb-1">With LoRA</div>
          <div className="text-2xl font-bold font-mono text-indigo-300">{fmt(stats.lora)}</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">{stats.pctOfTargeted.toFixed(2)}% of the above</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Of the whole model</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{stats.pctOfModel.toFixed(3)}%</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">{fmt(m.total)} total parameters</div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Adapter file size</div>
          <div className="text-xl font-bold font-mono text-gray-300">{stats.adapterMB.toFixed(1)} MB</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">fp16 weights only</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Optimiser state</div>
          <div className="text-xl font-bold font-mono text-gray-300">{stats.optimiserMB.toFixed(0)} MB</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">Adam moments for the adapter</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-rose-500/25">
          <div className="text-[0.625rem] uppercase tracking-wide text-rose-400 mb-1">Full fine-tune would need</div>
          <div className="text-xl font-bold font-mono text-rose-300">~{stats.fullTuneGB.toFixed(0)} GB</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">weights + gradients + Adam state</div>
        </div>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed">
        The memory column is the part that decides projects. The adapter itself being small is convenient; the
        optimiser state being small is what moves a 70B fine-tune from a cluster onto a couple of GPUs. Gradients and
        Adam moments only exist for trainable parameters, and there are barely any.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */


export default function GenAiLora() {
  const toc = [
    { label: "What LoRA Is", hash: "what" },
    { label: "The Core Problem", hash: "problem" },
    { label: "The Low-Rank Idea", hash: "idea" },
    { label: "Matrix Decomposition", hash: "decomposition" },
    { label: "Hyperparameters", hash: "rank" },
    { label: "See It Flow", hash: "flow" },
    { label: "Worked Example", hash: "worked" },
    { label: "Do the Arithmetic", hash: "calc" },
    { label: "Key Benefits", hash: "benefits" },
    { label: "Serving Many Adapters", hash: "serving" },
    { label: "In Code", hash: "code" },
    { label: "When LoRA Is Not Enough", hash: "limits" },
  ];

  return (
    <GuideLayout
      title="LoRA — Low-Rank Adaptation"
      intro="Fine-tune a 70B model by training 0.1% of it. The frozen base plus two thin matrices — the method the rest of PEFT is measured against."
      toc={toc}
    >
      <section id="what" className="mb-14 scroll-mt-24">
        <div className="p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/[0.12] to-transparent mb-6">
          <div className="text-[0.625rem] uppercase tracking-wider text-indigo-400 mb-2">Low-Rank Adaptation</div>
          <p className="text-lg text-gray-100 leading-relaxed mb-3">
            <strong className="text-white">LoRA stands for Low-Rank Adaptation.</strong> It adapts a large
            pretrained language model — Llama 3, DeepSeek, Qwen — to a custom task{" "}
            <strong className="text-white">without updating the billions of weights of the original model.</strong>
          </p>
          <p className="text-base text-gray-300 leading-relaxed m-0">
            Instead of retraining the entire model, LoRA keeps the original completely frozen and attaches a tiny
            pair of trainable <span className="text-indigo-300">adapter</span> matrices to the side.
          </p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            ["❄️", "Base stays frozen", "No gradients, no optimiser state, no second copy of the weights."],
            ["🔥", "Two thin matrices train", "A projects down to rank r, B projects back up. Typically under 1% of the layer."],
            ["🔗", "Merge or swap", "Fold the adapter into the weights for zero overhead, or keep it separate and hot-swap per request."],
          ].map(([icon, t, d]) => (
            <div key={t} className="p-5 rounded-xl border border-white/10 bg-white/5">
              <div className="text-2xl mb-2">{icon}</div>
              <div className="text-sm font-semibold text-white mb-1">{t}</div>
              <p className="text-xs text-gray-400 leading-relaxed m-0">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="problem" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Core Problem LoRA Solves</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          When you perform full fine-tuning on a large language model, three costs arrive together.
        </p>
        <div className="space-y-3 mb-5">
          {[
            {
              n: "1",
              t: "You update 100% of the weights",
              d: "Gradients must be calculated for every parameter — all 8 billion, or all 70 billion. Nothing is held back, and nothing is shared between tasks.",
              box: "border-rose-500/30 bg-rose-500/[0.08]",
              tone: "text-rose-400",
            },
            {
              n: "2",
              t: "Enormous memory requirements",
              d: "You need hundreds of gigabytes of VRAM — a GPU cluster — just to hold the optimizer states, the gradients and the model weights at the same time. In mixed precision that is roughly 14 to 16 bytes per parameter, so a 7B model passes 100 GB before you load a single training example.",
              box: "border-amber-500/30 bg-amber-500/[0.08]",
              tone: "text-amber-400",
            },
            {
              n: "3",
              t: "Storage nightmare",
              d: "Every fine-tuned version of a 70B model produces another 140 GB file on disk. Ten customers means ten complete copies of the same model and ten separate deployments.",
              box: "border-purple-500/30 bg-purple-500/[0.08]",
              tone: "text-purple-400",
            },
          ].map((c) => (
            <div key={c.n} className={`flex gap-4 p-5 rounded-xl border ${c.box}`}>
              <div className={`shrink-0 w-8 h-8 rounded-lg bg-black/30 border border-white/10 font-bold flex items-center justify-center text-sm ${c.tone}`}>
                {c.n}
              </div>
              <div>
                <div className={`text-sm font-semibold mb-1 ${c.tone}`}>{c.t}</div>
                <p className="text-xs text-gray-300 leading-relaxed m-0">{c.d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            <strong className="text-white">The observation LoRA is built on:</strong> weight changes during
            fine-tuning have a low <em>intrinsic rank</em>. The information required to adapt a model to a new task
            compresses into a much smaller mathematical subspace than the weight matrix it modifies. So learn that
            subspace directly instead of the whole matrix.
          </p>
        </div>
      </section>

      <section id="idea" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Low-Rank Idea</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Freeze W. Represent the update as a product of two thin matrices and train only those.
        </p>
        <div className="p-5 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.07] mb-5">
          <div className="font-mono text-base text-indigo-200 mb-3 text-center">h = Wx + (α / r) · B·A·x</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-300">
            <div>
              <div className="font-semibold text-white mb-1">W — frozen</div>
              d_out × d_in. Never updated, never stored twice.
            </div>
            <div>
              <div className="font-semibold text-white mb-1">A — r × d_in</div>
              Initialised from a small random distribution.
            </div>
            <div>
              <div className="font-semibold text-white mb-1">B — d_out × r</div>
              Initialised to zero, so the adapter starts as a no-op and training begins from the base model exactly.
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            Because B starts at zero, the product B·A is zero at step one and the model is bit-for-bit the base model.
            That is not a detail — it is why LoRA training is stable without a warmup phase that repairs damage from
            random initialisation.
          </p>
        </div>
      </section>

      <section id="decomposition" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Matrix Decomposition</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          The whole method rests on one claim from linear algebra: the <em>change</em> a model needs in order to
          learn a new task has low intrinsic rank. The adaptation fits in a far smaller subspace than the weight
          matrix it modifies, so you never need to represent it at full size.
        </p>

        <div className="space-y-3 mb-5">
          {[
            ["Ordinary layer", "h = W₀ · x", "One matrix multiply. To fine-tune it you would update every entry of W₀.", "border-gray-600/40 bg-white/[0.03]", "text-gray-300"],
            ["Add a parallel branch", "h = W₀ · x + ΔW · x", "Freeze W₀ and learn a separate correction ΔW. Mathematically identical so far, and no cheaper — ΔW is still full size.", "border-blue-500/30 bg-blue-500/[0.08]", "text-blue-400"],
            ["Factorise the correction", "ΔW = B × A", "Here is the saving. Instead of one d×k matrix, store a d×r and an r×k, with r far smaller than either dimension.", "border-emerald-500/30 bg-emerald-500/[0.08]", "text-emerald-400"],
            ["What actually runs", "h = W₀ · x + (α/r) · B · A · x", "The scaling factor α/r keeps the adapter's influence steady when you change rank.", "border-amber-500/30 bg-amber-500/[0.08]", "text-amber-400"],
          ].map(([t, eq, d, box, tone]) => (
            <div key={t} className={`p-5 rounded-xl border ${box}`}>
              <div className="flex flex-wrap items-baseline gap-3 mb-2">
                <span className={`text-sm font-semibold ${tone}`}>{t}</span>
                <span className="font-mono text-base text-white">{eq}</span>
              </div>
              <p className="text-xs text-gray-400 leading-relaxed m-0">{d}</p>
            </div>
          ))}
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            Read the shapes and the constraint falls out: A is <span className="font-mono text-gray-300">d × r</span>,
            B is <span className="font-mono text-gray-300">r × k</span>, and their product is{" "}
            <span className="font-mono text-gray-300">d × k</span> — the same shape as W₀, so it can be added
            directly. The rank r is the only free dimension, and it is where all the savings live.
          </p>
        </div>
      </section>

      <section id="rank" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Important LoRA Hyperparameters</h2>
        <div className="space-y-4 mb-5">
          <div className="p-5 rounded-xl border border-indigo-500/30 bg-indigo-500/[0.08]">
            <div className="flex flex-wrap items-baseline gap-3 mb-2">
              <span className="font-bold text-indigo-400">Rank (r)</span>
              <span className="font-mono text-xs text-gray-500">common values: 8, 16, 32, 64</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-2">
              The inner dimension of the bottleneck. A higher rank lets the adapter learn a more complex task, and
              increases memory use in proportion.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed m-0">
              In practice r = 8 to 16 handles style, tone and format — most of what people actually want. Reach for
              32 to 64 only when teaching genuinely new task behaviour.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/[0.08]">
            <div className="flex flex-wrap items-baseline gap-3 mb-2">
              <span className="font-bold text-amber-400">Alpha (α)</span>
              <span className="font-mono text-xs text-gray-500">scales the adapter: (α / r) · ΔW</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-2">
              A scaling factor applied to the LoRA output. It controls how strongly the adapter overrides the base
              model's knowledge.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed m-0">
              Because the scale is α/r, the convention α = 2r keeps the adapter's influence constant as you change
              rank. Treat α/r as the real knob, not α alone.
            </p>
          </div>

          <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08]">
            <div className="flex flex-wrap items-baseline gap-3 mb-2">
              <span className="font-bold text-emerald-400">Target Modules</span>
              <span className="font-mono text-xs text-gray-500">q_proj, k_proj, v_proj, o_proj</span>
            </div>
            <p className="text-sm text-gray-300 leading-relaxed mb-2">
              The specific projection layers inside the transformer where adapters are attached — typically the
              attention projections.
            </p>
            <p className="text-xs text-gray-500 leading-relaxed m-0">
              Extending to the MLP projections (gate_proj, up_proj, down_proj) is the usual next step, and published
              ablations favour it over raising the rank on attention alone.
            </p>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>Breadth beats depth.</strong> If quality is short, attach a low-rank adapter to more modules
            before you double r. More target modules at the same rank consistently outperforms fewer at a higher one,
            for a similar parameter budget.
          </p>
        </div>
      </section>

      <section id="flow" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">See It Flow</h2>
        <LoraFlow d={4096} k={4096} rank={8} />
      </section>

      <section id="worked" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Worked Example</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          One attention projection in a typical 7B-class transformer, at rank 8.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/[0.08]">
            <div className="text-sm font-semibold text-rose-400 mb-3">Full fine-tuning</div>
            <div className="font-mono text-xs text-gray-400 mb-2">W₀ = 4,096 × 4,096</div>
            <div className="text-3xl font-bold font-mono text-rose-300 mb-1">16,777,216</div>
            <div className="text-xs text-gray-500">trainable parameters, for this one matrix</div>
          </div>
          <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.08]">
            <div className="text-sm font-semibold text-emerald-400 mb-3">LoRA at r = 8</div>
            <div className="font-mono text-xs text-gray-400 mb-1">A = 4,096 × 8 = 32,768</div>
            <div className="font-mono text-xs text-gray-400 mb-2">B = 8 × 4,096 = 32,768</div>
            <div className="text-3xl font-bold font-mono text-emerald-300 mb-1">65,536</div>
            <div className="text-xs text-gray-500">trainable parameters</div>
          </div>
        </div>
        <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/[0.1] text-center">
          <div className="text-[0.625rem] uppercase tracking-wider text-amber-400 mb-1">Reduction for this layer</div>
          <div className="text-4xl font-bold font-mono text-amber-300">99.61%</div>
          <div className="text-xs text-gray-500 mt-1 font-mono">65,536 / 16,777,216 = 0.39%</div>
        </div>
      </section>

      <section id="calc" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Do the Arithmetic</h2>
        <LoraCalculator />
      </section>

      <section id="benefits" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Key Benefits</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            {
              icon: "💾",
              t: "Drastic VRAM reduction",
              d: "Gradients and optimiser state exist only for trainable parameters. At under 1% of the model, an 8B fine-tune fits on a single consumer GPU or a Mac with unified memory — hardware that could not hold the full-tuning state at all.",
              box: "border-indigo-500/30 bg-indigo-500/[0.08]",
              tone: "text-indigo-400",
            },
            {
              icon: "📦",
              t: "Tiny artefacts",
              d: "A full fine-tune of a 70B model is another 140 GB file, per task. A LoRA adapter file is typically only 10 MB to 100 MB. You can version them in git, ship them over the wire, and keep hundreds around.",
              box: "border-emerald-500/30 bg-emerald-500/[0.08]",
              tone: "text-emerald-400",
            },
            {
              icon: "⚡",
              t: "Zero inference overhead",
              d: "Compute W₀ + (α/r)·B·A once after training and store the result. The adapter stops existing as a separate thing, and the served model runs at exactly the speed of the original.",
              box: "border-amber-500/30 bg-amber-500/[0.08]",
              tone: "text-amber-400",
            },
            {
              icon: "🔄",
              t: "Dynamic adapter swapping",
              d: "Keep one base model resident and attach a different adapter per request — a coding adapter for one user, a legal one for the next. Servers like vLLM batch requests for different adapters in a single forward pass.",
              box: "border-purple-500/30 bg-purple-500/[0.08]",
              tone: "text-purple-400",
            },
          ].map((b) => (
            <div key={b.t} className={`p-5 rounded-xl border ${b.box}`}>
              <div className="flex items-center gap-2.5 mb-2">
                <span className="text-2xl">{b.icon}</span>
                <span className={`font-bold ${b.tone}`}>{b.t}</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{b.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 p-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>Merging and swapping are mutually exclusive.</strong> Once you fold an adapter into the base
            weights you have one specialised model and the multi-tenant trick is gone. Merge when you serve a single
            variant; keep adapters separate when you serve many.
          </p>
        </div>
      </section>

      <section id="serving" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Serving Many Adapters</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          This is the operational payoff, and it is easy to miss. Adapters are tiny and separable, so one base model
          in memory can serve many customised variants at once.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="p-5 rounded-xl border border-rose-500/25 bg-rose-500/[0.07]">
            <div className="font-semibold text-rose-400 mb-2">Full fine-tunes</div>
            <p className="text-xs text-gray-300 leading-relaxed m-0">
              Ten customers, ten complete 14GB models, ten deployments. GPU memory scales linearly with the number of
              variants and most of it is duplicate weights.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07]">
            <div className="font-semibold text-emerald-400 mb-2">LoRA adapters</div>
            <p className="text-xs text-gray-300 leading-relaxed m-0">
              One base model in memory plus ten adapters of tens of megabytes each. Servers like vLLM can batch
              requests for different adapters together in a single forward pass.
            </p>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            You can also merge an adapter permanently into the base weights before deploying. That gives exactly zero
            inference overhead but gives up the multi-tenant trick. Merge when you serve one variant; keep adapters
            separate when you serve many.
          </p>
        </div>
      </section>

      <section id="code" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">In Code</h2>
        <CodeBlock
          language="python"
          code={`from transformers import AutoModelForCausalLM, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
import torch

# QLoRA: load the frozen base in 4-bit, train adapters in bf16 on top.
bnb = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",          # normal-float 4, not plain int4
    bnb_4bit_compute_dtype=torch.bfloat16,
    bnb_4bit_use_double_quant=True,     # quantise the quantisation constants too
)

base = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-8B", quantization_config=bnb, device_map="auto"
)
base = prepare_model_for_kbit_training(base)

config = LoraConfig(
    r=16,
    lora_alpha=32,            # alpha = 2r keeps the effective scale steady
    lora_dropout=0.05,
    bias="none",
    task_type="CAUSAL_LM",
    # Breadth beats depth: more modules at low rank > fewer at high rank.
    target_modules=[
        "q_proj", "k_proj", "v_proj", "o_proj",
        "gate_proj", "up_proj", "down_proj",
    ],
)

model = get_peft_model(base, config)
model.print_trainable_parameters()
# trainable params: 41,943,040 || all params: 8,072,204,288 || trainable%: 0.5196

# ... train ...

model.save_pretrained("./adapter")   # tens of MB, not tens of GB

# Later, for single-variant serving, fold it in and pay no inference cost:
# merged = model.merge_and_unload()`}
        />
      </section>

      <section id="limits" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">When PEFT Is Not Enough</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          PEFT changes how a model behaves. It is a poor way to change what a model knows.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">PEFT is the right tool for</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Output format, tone, and house style.</li>
              <li>Domain vocabulary and phrasing conventions.</li>
              <li>Reliable structured output and tool-call formats.</li>
              <li>Task specialisation from a few thousand examples.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Reach for something else when</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>You need current or frequently changing facts — use retrieval.</li>
              <li>You need a capability the base model lacks entirely.</li>
              <li>The knowledge must be auditable and citable.</li>
              <li>You have fewer than a few hundred examples — try prompting first.</li>
            </ul>
          </div>
        </div>
        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            The decision is common enough to deserve its own walkthrough — see{" "}
            <a href="#/rag/vs-fine-tuning" className="text-blue-400 hover:underline">RAG vs Fine-tuning</a>. Related
            reading: <a href="#/genai/quantization" className="text-blue-400 hover:underline">Quantization</a> and{" "}
            <a href="#/genai/distillation" className="text-blue-400 hover:underline">Distillation</a>.
          </p>
        </div>
      </section>
      <KnowledgeCheck questions={questionsFor("genai-peft")} />
    </GuideLayout>
  );
}

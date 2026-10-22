import React, { useState } from "react";
import { Link } from "react-router-dom";
import GuideLayout from "../components/GuideLayout";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";

/** Alternate names and acronyms that live in prose, so search can find them. */
export const SEARCH_KEYWORDS = [
  "PEFT", "parameter-efficient fine-tuning", "LoRA", "low-rank adaptation",
  "QLoRA", "NF4", "double quantization", "paged optimizers", "bitsandbytes",
  "DoRA", "weight-decomposed", "prefix tuning", "p-tuning", "prompt tuning",
  "soft prompts", "virtual tokens", "IA3", "(IA)3", "adapter layers",
  "Houlsby", "bottleneck adapter", "adapter", "rank", "alpha", "target modules",
];

const METHODS = [
  {
    id: "lora",
    n: "LoRA",
    full: "Low-Rank Adaptation",
    path: "/genai/peft/lora",
    icon: "🎛️",
    tag: "The default",
    d: "Freeze the weights and learn a low-rank update B·A alongside each matrix. Merges back in for zero inference cost.",
    params: "~0.1–1%",
    merge: "Yes",
    where: "Parallel to weights",
    box: "border-indigo-500/30 bg-indigo-500/[0.08] hover:border-indigo-500/60",
    tone: "text-indigo-400",
  },
  {
    id: "qlora",
    n: "QLoRA",
    full: "Quantized LoRA",
    path: "/genai/peft/qlora",
    icon: "🗜️",
    tag: "LoRA on a budget",
    d: "LoRA with the frozen base stored in 4-bit NF4. Puts a 70B fine-tune on a single card, at a cost in training speed.",
    params: "~0.1–1%",
    merge: "With care",
    where: "Parallel, 4-bit base",
    box: "border-emerald-500/30 bg-emerald-500/[0.08] hover:border-emerald-500/60",
    tone: "text-emerald-400",
  },
  {
    id: "dora",
    n: "DoRA",
    full: "Weight-Decomposed LoRA",
    path: "/genai/peft/dora",
    icon: "🧭",
    tag: "LoRA, refined",
    d: "Split each weight into magnitude and direction; the low-rank update steers direction only. Strongest at low rank.",
    params: "~0.1–1%",
    merge: "Yes",
    where: "Parallel + norm",
    box: "border-purple-500/30 bg-purple-500/[0.08] hover:border-purple-500/60",
    tone: "text-purple-400",
  },
  {
    id: "prefix",
    n: "Prefix / P-tuning",
    full: "Soft prompts",
    path: "/genai/peft/prefix-tuning",
    icon: "📎",
    tag: "Train the input",
    d: "Leave every weight frozen and learn vectors prepended to the sequence. Costs context on every single request.",
    params: "~0.01–0.1%",
    merge: "No",
    where: "Activations",
    box: "border-amber-500/30 bg-amber-500/[0.08] hover:border-amber-500/60",
    tone: "text-amber-400",
  },
  {
    id: "ia3",
    n: "(IA)³",
    full: "Inhibiting and Amplifying Activations",
    path: "/genai/peft/ia3",
    icon: "🎚️",
    tag: "Scale, don't add",
    d: "Three learned scaling vectors per layer, multiplied into activations. The smallest artefact of anything here.",
    params: "~0.01%",
    merge: "Yes",
    where: "Elementwise gain",
    box: "border-blue-500/30 bg-blue-500/[0.08] hover:border-blue-500/60",
    tone: "text-blue-400",
  },
  {
    id: "adapters",
    n: "Adapter Layers",
    full: "Houlsby bottleneck adapters",
    path: "/genai/peft/adapters",
    icon: "🧱",
    tag: "The original",
    d: "Small bottleneck MLPs inserted between sublayers. Started the field; the nonlinearity means it cannot be merged.",
    params: "~1–3%",
    merge: "No",
    where: "In series",
    box: "border-rose-500/30 bg-rose-500/[0.08] hover:border-rose-500/60",
    tone: "text-rose-400",
  },
];

function Chooser() {
  const [q, setQ] = useState(null);

  const ANSWERS = {
    memory: { pick: "QLoRA", why: "The 16-bit base does not fit. Quantise it to 4-bit and train adapters on top — you pay training speed for the run being possible.", path: "/genai/peft/qlora", tone: "text-emerald-400" },
    quality: { pick: "DoRA", why: "You are pinned to a low rank and LoRA has plateaued. Decomposing magnitude from direction recovers much of the gap, at a cost in training time.", path: "/genai/peft/dora", tone: "text-purple-400" },
    size: { pick: "(IA)³", why: "Hundreds of task variants and the artefact size genuinely matters. Three vectors per layer is kilobytes, and it still merges to zero inference cost.", path: "/genai/peft/ia3", tone: "text-blue-400" },
    frozen: { pick: "Prefix tuning", why: "The base must stay bit-identical, or you only reach activations rather than weights. Accept that it consumes context on every request.", path: "/genai/peft/prefix-tuning", tone: "text-amber-400" },
    default: { pick: "LoRA", why: "No unusual constraint. Start here, measure, and only move if you hit a specific wall — most projects never need to.", path: "/genai/peft/lora", tone: "text-indigo-400" },
  };

  const a = q ? ANSWERS[q] : null;

  return (
    <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.07] p-6">
      <h3 className="text-indigo-400 font-bold mb-1">Which one should you use?</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        What is your binding constraint? Pick the one that actually stops you, not the one that sounds most
        interesting.
      </p>
      <div className="flex flex-wrap gap-2 mb-5">
        {[
          ["default", "Nothing in particular"],
          ["memory", "GPU memory — it will not fit"],
          ["quality", "Quality at low rank"],
          ["size", "Adapter file size"],
          ["frozen", "The base must stay untouched"],
        ].map(([k, label]) => (
          <button
            key={k}
            onClick={() => setQ(k)}
            className={`px-3.5 py-2 rounded-lg text-sm font-medium border transition-colors ${
              q === k
                ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-200"
                : "border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/30"
            }`}
          >
            {label}
          </button>
        ))}
      </div>
      {a && (
        <div className="p-5 rounded-xl border border-white/15 bg-black/40">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Start with</div>
          <div className={`text-2xl font-bold mb-2 ${a.tone}`}>{a.pick}</div>
          <p className="text-sm text-gray-300 leading-relaxed mb-3">{a.why}</p>
          <Link to={a.path} className="text-xs font-semibold text-blue-400 hover:underline">
            Read the {a.pick} guide →
          </Link>
        </div>
      )}
    </div>
  );
}

export default function GenAiPeft() {
  const toc = [
    { label: "What PEFT Is", hash: "what" },
    { label: "The Six Methods", hash: "methods" },
    { label: "Side by Side", hash: "compare" },
    { label: "Which One", hash: "choose" },
    { label: "The Common Skeleton", hash: "skeleton" },
    { label: "When PEFT Is Not Enough", hash: "limits" },
  ];

  return (
    <GuideLayout
      title="PEFT — Parameter-Efficient Fine-Tuning"
      intro="Six ways to adapt a large model without retraining it. They share one insight and differ in where they attach — which decides what each one costs you."
      toc={toc}
    >
      <section id="what" className="mb-14 scroll-mt-24">
        <div className="p-6 rounded-2xl border border-indigo-500/30 bg-gradient-to-br from-indigo-500/[0.12] to-transparent mb-6">
          <div className="text-[0.625rem] uppercase tracking-wider text-indigo-400 mb-2">Parameter-Efficient Fine-Tuning</div>
          <p className="text-lg text-gray-100 leading-relaxed m-0">
            Full fine-tuning updates every weight, which means holding gradients and optimiser state for all of
            them.{" "}
            <strong className="text-white">
              PEFT freezes the pretrained model and trains a small number of new parameters instead
            </strong>{" "}
            — typically well under 1% — reaching comparable quality for a fraction of the memory.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            <strong className="text-white">The shared observation:</strong> weight changes during fine-tuning have a
            low <em>intrinsic rank</em>. The information needed to adapt a model to a new task compresses into a far
            smaller subspace than the weights it modifies. Every method below is a different bet on how to
            parameterise that subspace.
          </p>
        </div>
      </section>

      <section id="methods" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Six Methods</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Each has its own page with the mechanism, an interactive visual, the arithmetic and the failure modes.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {METHODS.map((m) => (
            <Link
              key={m.id}
              to={m.path}
              className={`block p-5 rounded-xl border transition-colors no-underline ${m.box}`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">{m.icon}</span>
                  <div>
                    <div className={`font-bold ${m.tone}`}>{m.n}</div>
                    <div className="text-[0.625rem] text-gray-500">{m.full}</div>
                  </div>
                </div>
                <span className="text-[0.625rem] uppercase tracking-wide text-gray-500 shrink-0 mt-1">{m.tag}</span>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed mb-3">{m.d}</p>
              <div className="flex flex-wrap gap-3 text-[0.625rem] font-mono text-gray-500">
                <span>trains {m.params}</span>
                <span>·</span>
                <span>merges: {m.merge}</span>
              </div>
            </Link>
          ))}
        </div>
      </section>

      <section id="compare" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Side by Side</h2>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-left">
                <th className="px-4 py-3 font-semibold text-white">Method</th>
                <th className="px-4 py-3 font-semibold text-white">Attaches</th>
                <th className="px-4 py-3 font-semibold text-white">Trains</th>
                <th className="px-4 py-3 font-semibold text-white">Merges away</th>
                <th className="px-4 py-3 font-semibold text-white">Costs context</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {METHODS.map((m) => (
                <tr key={m.id} className="border-t border-white/10">
                  <td className="px-4 py-3 whitespace-nowrap">
                    <Link to={m.path} className={`text-xs font-semibold hover:underline ${m.tone}`}>{m.n}</Link>
                  </td>
                  <td className="px-4 py-3 text-xs">{m.where}</td>
                  <td className="px-4 py-3 text-xs font-mono">{m.params}</td>
                  <td className={`px-4 py-3 text-xs ${m.merge === "No" ? "text-rose-300" : "text-emerald-300"}`}>{m.merge}</td>
                  <td className={`px-4 py-3 text-xs ${m.id === "prefix" ? "text-rose-300" : "text-gray-500"}`}>
                    {m.id === "prefix" ? "Yes — every request" : "No"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5 p-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>The "merges away" column is the one to read first.</strong> A method that folds into the base
            weights costs nothing at inference, forever. One that does not is a permanent tax on every token you
            ever serve — which is why LoRA displaced adapter layers despite both working.
          </p>
        </div>
      </section>

      <section id="choose" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Which One</h2>
        <Chooser />
      </section>

      <section id="skeleton" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Common Skeleton</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Read the six together and the same three design choices appear each time.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ["A bottleneck", "Down-project to a small dimension, do something, come back up. Adapters call it m, LoRA calls it r. Same idea, and it is where the parameter saving comes from.", "border-indigo-500/25 bg-indigo-500/[0.07]", "text-indigo-400"],
            ["Near-identity at init", "Every method starts as a no-op — B at zero, (IA)³ vectors at one, adapter up-projection at zero. Training begins from the base model exactly, which is what makes it stable without a warmup.", "border-emerald-500/25 bg-emerald-500/[0.07]", "text-emerald-400"],
            ["A placement choice", "In series, in parallel, or on the activations. This decides merging and latency, and it is the single most consequential difference between them.", "border-amber-500/25 bg-amber-500/[0.07]", "text-amber-400"],
          ].map(([n, d, box, tone]) => (
            <div key={n} className={`p-5 rounded-xl border ${box}`}>
              <div className={`font-semibold mb-1.5 ${tone}`}>{n}</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="limits" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">When PEFT Is Not Enough</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          All six change how a model behaves. None of them is a good way to change what a model knows.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">PEFT is the right tool for</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Output format, tone and house style.</li>
              <li>Domain vocabulary and phrasing conventions.</li>
              <li>Reliable structured output and tool-call formats.</li>
              <li>Task specialisation from a few thousand examples.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Reach for something else when</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>You need current or changing facts — use retrieval.</li>
              <li>You need a capability the base model lacks entirely.</li>
              <li>The knowledge must be auditable and citable.</li>
              <li>You have under a few hundred examples — try prompting first.</li>
            </ul>
          </div>
        </div>
        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            That decision has its own walkthrough:{" "}
            <a href="#/rag/vs-fine-tuning" className="text-blue-400 hover:underline">RAG vs Fine-tuning</a>. See also{" "}
            <a href="#/genai/quantization" className="text-blue-400 hover:underline">Quantization</a>,{" "}
            <a href="#/genai/distillation" className="text-blue-400 hover:underline">Distillation</a>, and{" "}
            <a href="#/efficiency" className="text-blue-400 hover:underline">Efficient Inference</a> for where PEFT
            sits among the other ways to make a model affordable.
          </p>
        </div>
      </section>

      <KnowledgeCheck questions={questionsFor("genai-peft")} />
    </GuideLayout>
  );
}

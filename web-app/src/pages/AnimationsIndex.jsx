import React, { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import GuideLayout from "../components/GuideLayout";

/* ===========================================================================
   One declarative stepper drives all five animations.

   Each animation supplies `stages` (the boxes) and `steps` (which stages are
   lit at each point, plus the explanation). Keeping them data-driven means
   every flow behaves identically and the diagrams stay consistent.
=========================================================================== */

const TONES = {
  gray:    "border-gray-600 bg-white/5 text-gray-300",
  indigo:  "border-indigo-500/60 bg-indigo-500/20 text-indigo-100",
  emerald: "border-emerald-500/60 bg-emerald-500/20 text-emerald-100",
  amber:   "border-amber-500/60 bg-amber-500/20 text-amber-100",
  rose:    "border-rose-500/60 bg-rose-500/20 text-rose-100",
  purple:  "border-purple-500/60 bg-purple-500/20 text-purple-100",
  cyan:    "border-cyan-500/60 bg-cyan-500/20 text-cyan-100",
};

export const ANIMATIONS = [
  /* ---------------------------------------------------------------- RLHF */
  {
    id: "rlhf",
    label: "🎯 RLHF",
    title: "RLHF Training Loop",
    intro:
      "How a raw pretrained model becomes a helpful assistant. Three separate training stages, the last of which is a reinforcement-learning loop against a learned reward model.",
    stages: [
      { id: "base",   label: "Base model",      sub: "next-token pretraining", tone: "gray" },
      { id: "sft",    label: "SFT",             sub: "supervised fine-tune",   tone: "indigo" },
      { id: "pairs",  label: "Preference data", sub: "humans rank A vs B",     tone: "amber" },
      { id: "rm",     label: "Reward model",    sub: "predicts human score",   tone: "purple" },
      { id: "ppo",    label: "PPO / policy",    sub: "optimise for reward",    tone: "emerald" },
      { id: "kl",     label: "KL penalty",      sub: "stay near SFT model",    tone: "rose" },
    ],
    steps: [
      { active: ["base"], note: "Start with a pretrained model. It can continue text fluently but has no idea it is supposed to be helpful — ask it a question and it may just write more questions." },
      { active: ["base", "sft"], note: "Supervised fine-tuning on curated (prompt, good answer) demonstrations. This teaches the format of being an assistant. Cheap, effective, and gets you most of the way." },
      { active: ["sft", "pairs"], note: "Now collect preferences: show humans two model outputs and ask which is better. Ranking is far easier and more reliable for humans than writing ideal answers from scratch." },
      { active: ["pairs", "rm"], note: "Train a reward model on those comparisons. Its job is to predict what a human would prefer — turning subjective judgement into a differentiable score." },
      { active: ["rm", "ppo"], note: "Reinforcement learning: the policy generates answers, the reward model scores them, and PPO nudges the weights toward higher-scoring behaviour." },
      { active: ["ppo", "kl"], note: "The KL penalty anchors the policy to the SFT model. Without it the policy finds degenerate text that games the reward model — Goodhart's Law in action." },
      { active: ["sft", "rm", "ppo", "kl"], note: "Steps 4-6 repeat. The result is aligned, but only as good as the reward model — which is why DPO (skipping the RM and RL loop entirely) became popular." },
    ],
    footer: "Constitutional AI / RLAIF replaces much of the human labelling with model-generated critiques against written principles.",
  },

  /* ------------------------------------------------------- TOOL CALLING */
  {
    id: "tools",
    label: "🔧 Tool Calling",
    title: "Tool Use / Function Calling",
    intro:
      "The mechanism behind every agent. The model never executes anything itself — it emits a structured request, your code runs it, and the result comes back as another message.",
    stages: [
      { id: "user",   label: "User prompt",   sub: '"weather in Tokyo?"',     tone: "gray" },
      { id: "schema", label: "Tool schemas",  sub: "JSON definitions",        tone: "cyan" },
      { id: "model",  label: "Model",         sub: "decides: call or answer", tone: "indigo" },
      { id: "call",   label: "Tool call",     sub: 'get_weather{city:"Tokyo"}', tone: "amber" },
      { id: "exec",   label: "Your code",     sub: "actually runs it",        tone: "emerald" },
      { id: "result", label: "Result message",sub: '{"temp": 18}',            tone: "purple" },
      { id: "final",  label: "Final answer",  sub: "grounded in the result",  tone: "emerald" },
    ],
    steps: [
      { active: ["user", "schema"], note: "The request goes to the model together with the tool schemas — name, description and JSON parameter shape for each available function." },
      { active: ["model"], note: "The model decides whether it needs a tool at all. A question it can answer from memory gets answered directly; this one needs live data." },
      { active: ["call"], note: "Instead of text, the model returns a structured tool call. Crucially it has not run anything — it has only asked. Nothing has touched the outside world yet." },
      { active: ["exec"], note: "Your application validates the arguments and executes the function. This is your security boundary: check permissions here, not in the prompt." },
      { active: ["result"], note: "The return value is appended to the conversation as a tool-result message, so the model can see what actually happened." },
      { active: ["model", "final"], note: "The model runs again with the result in context and writes the final answer. If it needs another tool, the loop repeats — that loop is what makes it an agent." },
    ],
    footer: "Treat tool results as untrusted data. Content fetched by a tool must never decide which tool runs next.",
  },

  /* ------------------------------------------------------ CONTEXT WINDOW */
  {
    id: "context",
    label: "🪟 Context Window",
    title: "Context Window Management",
    intro:
      "Context is a fixed budget, not infinite memory. Watch it fill, and the strategies for what happens when it runs out.",
    stages: [
      { id: "sys",    label: "System prompt", sub: "reserved, never dropped", tone: "purple" },
      { id: "hist",   label: "History",       sub: "grows every turn",        tone: "indigo" },
      { id: "rag",    label: "Retrieved docs",sub: "often the biggest chunk", tone: "cyan" },
      { id: "full",   label: "Window full",   sub: "limit reached",           tone: "rose" },
      { id: "trunc",  label: "Truncate",      sub: "drop oldest turns",       tone: "amber" },
      { id: "compact",label: "Compact",       sub: "summarise the middle",    tone: "emerald" },
    ],
    steps: [
      { active: ["sys"], note: "The system prompt is reserved first. It defines behaviour for the whole conversation, so it is the one thing you never evict." },
      { active: ["sys", "hist"], note: "Each turn appends both the user message and the model's reply. Cost grows quadratically over a long chat because every turn re-reads everything before it." },
      { active: ["sys", "hist", "rag"], note: "Retrieved documents land here too — and in a RAG app they usually dwarf the conversation. This is why retrieval precision is a cost lever, not just a quality one." },
      { active: ["full"], note: "The budget is exhausted. Something has to go, and the choice of what determines whether the assistant feels forgetful or coherent." },
      { active: ["trunc"], note: "Truncation drops the oldest turns. Simple and cheap, but the model abruptly forgets what you agreed 20 messages ago." },
      { active: ["compact"], note: "Compaction summarises the middle instead: keep the system prompt, a running summary, and the most recent turns verbatim. Costs an extra call, preserves continuity." },
    ],
    footer: "Also watch the 'lost in the middle' effect — models attend most reliably to the start and end of a long context.",
  },

  /* ------------------------------------------------------------- LoRA */
  {
    id: "lora",
    label: "🧬 LoRA",
    title: "Fine-Tuning & LoRA",
    intro:
      "Full fine-tuning updates every weight and needs the memory to match. LoRA freezes the base model and trains two small matrices instead — often <1% of the parameters.",
    stages: [
      { id: "base",  label: "Base weights", sub: "frozen ❄️",              tone: "gray" },
      { id: "data",  label: "Dataset",      sub: "your task examples",     tone: "cyan" },
      { id: "aandb", label: "A · B adapters", sub: "low-rank, trainable",  tone: "amber" },
      { id: "fwd",   label: "Forward pass", sub: "W·x + (B·A)·x",          tone: "indigo" },
      { id: "loss",  label: "Loss + backprop", sub: "only adapters update", tone: "purple" },
      { id: "merge", label: "Merge or serve", sub: "swap adapters per task", tone: "emerald" },
    ],
    steps: [
      { active: ["base"], note: "Freeze the pretrained weights. They already contain the language ability — you only need to nudge behaviour, not relearn English." },
      { active: ["data"], note: "Prepare task examples. Quality beats quantity here: a few hundred clean, consistent examples usually beat tens of thousands of noisy ones." },
      { active: ["aandb"], note: "Insert two small matrices A (d×r) and B (r×d) with rank r typically 8–64. Their product has the shape of a weight update but a tiny fraction of the parameters." },
      { active: ["fwd", "base", "aandb"], note: "During the forward pass the adapter output is added to the frozen layer: W·x + (B·A)·x. The base contributes its knowledge; the adapter contributes your task." },
      { active: ["loss", "aandb"], note: "Backprop updates only A and B. Optimiser state shrinks proportionally, which is what makes this fit on a single consumer GPU." },
      { active: ["merge"], note: "Ship it either way: merge B·A into W for zero inference overhead, or keep adapters separate and hot-swap them to serve many tasks from one base model." },
    ],
    footer: "QLoRA adds 4-bit quantisation of the frozen base, cutting memory again at a small quality cost.",
  },

  /* ------------------------------------------------- SPECULATIVE DECODING */
  {
    id: "spec",
    label: "⚡ Speculative Decoding",
    title: "Speculative Decoding",
    intro:
      "Generation is memory-bound: one token per full pass over the weights. Speculative decoding lets a small model guess ahead so the big model can verify several tokens in a single pass.",
    stages: [
      { id: "draft",  label: "Draft model",  sub: "small + fast",            tone: "cyan" },
      { id: "guess",  label: "k candidates", sub: '"the cat sat on"',        tone: "amber" },
      { id: "verify", label: "Target model", sub: "one batched pass",        tone: "indigo" },
      { id: "accept", label: "Accept prefix",sub: "matching tokens kept",    tone: "emerald" },
      { id: "reject", label: "Reject + fix", sub: "first mismatch corrected",tone: "rose" },
      { id: "out",    label: "Output",       sub: "identical distribution",  tone: "emerald" },
    ],
    steps: [
      { active: ["draft"], note: "A much smaller model runs first. It is cheap enough that several of its passes cost less than one pass of the big model." },
      { active: ["guess"], note: "It proposes k tokens ahead — a guess at the continuation. Often it is right, because most next tokens in fluent text are easy." },
      { active: ["verify"], note: "The large model scores all k candidates in one batched forward pass. This is the trick: verifying many tokens costs roughly the same as generating one." },
      { active: ["accept"], note: "Every candidate matching what the big model would have chosen is accepted at once. A good draft yields several tokens for the price of one." },
      { active: ["reject"], note: "At the first mismatch the draft is discarded from there on, and the big model's own token is used instead. Nothing incorrect slips through." },
      { active: ["out"], note: "The output distribution is provably identical to running the large model alone — this is pure latency optimisation, not a quality tradeoff." },
    ],
    footer: "Typical speedups are 2–3×, and depend entirely on draft acceptance rate. A poorly matched draft model can be slower than no draft at all.",
  },
];

/* ------------------------------------------------------------------------ */

export function StepPlayer({ anim }) {
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);
  const last = anim.steps.length - 1;

  // reset whenever the animation changes
  useEffect(() => {
    setStep(0);
    setPlaying(false);
  }, [anim.id]);

  useEffect(() => {
    if (!playing) return;
    if (step >= last) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setStep((s) => s + 1), 2600);
    return () => clearTimeout(t);
  }, [playing, step, last]);

  // `step` resets in an effect, which runs after this render — so on the first
  // render with a new `anim` it can still hold the previous, possibly larger,
  // index. Clamp rather than indexing past the end.
  const activeIds = anim.steps[Math.min(step, last)]?.active ?? [];

  return (
    <div>
      <p className="text-sm text-gray-400 mb-5 max-w-3xl">{anim.intro}</p>

      {/* stage diagram */}
      <div className="rounded-2xl border border-white/10 bg-black/40 p-6 mb-4">
        <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
          {anim.stages.map((s) => {
            const on = activeIds.includes(s.id);
            return (
              <motion.div
                key={s.id}
                animate={{ scale: on ? 1.03 : 1, opacity: on ? 1 : 0.35 }}
                transition={{ duration: 0.28 }}
                className={`rounded-xl border-2 p-3.5 ${on ? TONES[s.tone] : "border-gray-800 bg-transparent text-gray-500"}`}
              >
                <div className="text-sm font-bold leading-tight">{s.label}</div>
                <div className="text-[0.625rem] opacity-75 mt-0.5 font-mono leading-snug">{s.sub}</div>
              </motion.div>
            );
          })}
        </div>
      </div>

      {/* narration */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -6 }}
          transition={{ duration: 0.2 }}
          className="rounded-xl border border-indigo-500/25 bg-indigo-500/10 p-4 mb-4 min-h-[86px]"
        >
          <div className="text-[0.625rem] uppercase tracking-wide text-indigo-400 mb-1.5">
            Step {step + 1} of {anim.steps.length}
          </div>
          <p className="text-sm text-gray-200 leading-relaxed m-0">{anim.steps[step].note}</p>
        </motion.div>
      </AnimatePresence>

      {/* progress rail */}
      <div className="flex gap-1.5 mb-4">
        {anim.steps.map((_, i) => (
          <button
            key={i}
            onClick={() => { setStep(i); setPlaying(false); }}
            aria-label={`Go to step ${i + 1}`}
            className={`h-1.5 flex-1 rounded-full transition-colors ${
              i <= step ? "bg-indigo-500" : "bg-white/10 hover:bg-white/25"
            }`}
          />
        ))}
      </div>

      {/* controls */}
      <div className="flex flex-wrap items-center gap-3">
        <button
          onClick={() => { setStep((s) => Math.max(0, s - 1)); setPlaying(false); }}
          disabled={step === 0}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 disabled:opacity-30 hover:border-white/30 transition-colors"
        >
          ‹ Prev
        </button>
        <button
          onClick={() => (step >= last ? (setStep(0), setPlaying(true)) : setPlaying((p) => !p))}
          className="px-4 py-2 rounded-lg bg-indigo-600 border border-indigo-500 text-sm text-white hover:bg-indigo-500 transition-colors"
        >
          {playing ? "⏸ Pause" : step >= last ? "↻ Replay" : "▶ Play"}
        </button>
        <button
          onClick={() => { setStep((s) => Math.min(last, s + 1)); setPlaying(false); }}
          disabled={step >= last}
          className="px-4 py-2 rounded-lg bg-white/5 border border-white/10 text-sm text-gray-300 disabled:opacity-30 hover:border-white/30 transition-colors"
        >
          Next ›
        </button>
        <button
          onClick={() => { setStep(0); setPlaying(false); }}
          className="ml-auto px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 hover:border-white/30 transition-colors"
        >
          ↺ Reset
        </button>
      </div>

      {anim.footer && (
        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-xs text-gray-400 leading-relaxed m-0">{anim.footer}</p>
        </div>
      )}
    </div>
  );
}

export default function AnimationsIndex() {
  const [active, setActive] = useState(ANIMATIONS[0].id);
  const anim = ANIMATIONS.find((a) => a.id === active);
  const toc = ANIMATIONS.map((a) => ({ label: a.title, hash: a.id }));

  return (
    <GuideLayout
      title="Step-by-Step Animations"
      intro="The processes that are hard to picture from prose — training loops, tool calls, context budgets and decoding tricks — walked through one step at a time."
      toc={toc}
    >
      <div className="flex flex-wrap gap-2 mb-6">
        {ANIMATIONS.map((a) => (
          <button
            key={a.id}
            onClick={() => setActive(a.id)}
            className={`px-3.5 py-2 rounded-lg border text-sm font-medium transition-all ${
              active === a.id
                ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_4px_14px_rgba(99,102,241,0.35)]"
                : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-gray-200"
            }`}
          >
            {a.label}
          </button>
        ))}
      </div>

      <section id={anim.id} className="scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">{anim.title}</h2>
        <StepPlayer anim={anim} />
      </section>
    </GuideLayout>
  );
}

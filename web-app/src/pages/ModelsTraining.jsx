import { useState } from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import GuideLayout from "../components/GuideLayout";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { METHOD_TONE } from "../components/ModelProfile";
import { AS_OF, METHODS, PROFILES, FAMILY_ORDER, FAMILY_NAMES, FAMILY_PATHS } from "../data/modelProfiles";

/** Alternate names so search finds this page. */
export const SEARCH_KEYWORDS = [
  "how LLMs are trained", "training methods", "RLHF", "PPO", "DPO", "GRPO", "Constitutional AI", "RLAIF",
  "SFT", "supervised fine-tuning", "pretraining", "rejection sampling", "distillation", "reasoning RL",
  "reward model", "model weights", "open weights", "licence", "license", "Apache 2.0", "MIT licence",
];

// Methods with a page of their own.
const DEEP_DIVE = {
  sft: ["/genai/fine-tuning", "Fine-tuning guide"],
  "rlhf-ppo": ["/ml/rlhf", "RLHF, with a reward-model and reward-hacking demo"],
  dpo: ["/ml/dpo", "DPO, derived and trained step by step"],
  grpo: ["/ml/grpo", "GRPO and verifiable rewards, simulated"],
  rlaif: ["/ml/rlaif", "RLAIF and Constitutional AI"],
  "reasoning-rl": ["/ml/grpo", "How reasoning RL works (GRPO)"],
  distill: ["/genai/distillation", "Distillation guide"],
};

const METHOD_ORDER = ["pretrain", "synthetic", "sft", "rlhf-ppo", "dpo", "grpo", "rlaif", "rejection-sampling", "reasoning-rl", "distill"];

const uses = (fam, m) => PROFILES[fam].stages.some((s) => s.m === m);

/* ---- the stage every model passes through, drawn once ------------------- */
const CANON = [
  { k: "pretrain", t: "Pretraining", d: "Trillions of tokens. Months of compute. Produces a base model that continues text.", tone: "border-indigo-500/40 bg-indigo-500/10 text-indigo-200" },
  { k: "sft", t: "Supervised fine-tuning", d: "Tens of thousands of ideal answers. Teaches the assistant format.", tone: "border-blue-500/40 bg-blue-500/10 text-blue-200" },
  { k: "pref", t: "Preference tuning", d: "Humans or AI say which answer is better. PPO, DPO, GRPO or Constitutional AI live here.", tone: "border-pink-500/40 bg-pink-500/10 text-pink-200" },
  { k: "reason", t: "Reasoning RL", d: "Reward correct answers after long thinking. Newer, and where 'thinking' models come from.", tone: "border-rose-500/40 bg-rose-500/10 text-rose-200" },
];

function CanonicalPipeline() {
  const [i, setI] = useState(0);
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
        {CANON.map((c, k) => (
          <motion.button
            key={c.k}
            onClick={() => setI(k)}
            animate={{ scale: i === k ? 1.04 : 1, opacity: i === k ? 1 : 0.6 }}
            className={`text-left p-4 rounded-xl border ${c.tone}`}
          >
            <div className="text-[0.6875rem] uppercase tracking-wide opacity-70 mb-1">Stage {k + 1}</div>
            <div className="font-bold text-base">{c.t}</div>
          </motion.button>
        ))}
      </div>
      <motion.p key={i} initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="text-base text-gray-300 leading-relaxed m-0">
        {CANON[i].d}
      </motion.p>
    </div>
  );
}

/* ---- the memory argument behind the PPO → DPO → GRPO progression -------- */
const RL_ALGOS = [
  { n: "RLHF with PPO", models: ["Policy (training)", "Reference (frozen)", "Reward model", "Value model"], who: "OpenAI's InstructGPT recipe", tone: "text-pink-300" },
  { n: "GRPO", models: ["Policy (training)", "Reference (frozen)", "Reward / checker"], who: "DeepSeek — no value model; the group average is the baseline", tone: "text-orange-300" },
  { n: "DPO", models: ["Policy (training)", "Reference (frozen)"], who: "No reward model at all; learns from preference pairs directly", tone: "text-purple-300" },
];

function RlMemory() {
  return (
    <div className="rounded-2xl border border-pink-500/25 bg-pink-500/[0.06] p-5 sm:p-6">
      <h3 className="text-pink-300 font-bold text-lg mb-1">Why the field moved from PPO to DPO and GRPO</h3>
      <p className="text-base text-gray-400 leading-relaxed mb-5">
        Count the full-size models that must sit in GPU memory during training. Every one you remove is a model's
        worth of memory back.
      </p>
      <div className="space-y-4">
        {RL_ALGOS.map((a) => (
          <div key={a.n}>
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-2">
              <span className={`font-bold ${a.tone}`}>{a.n}</span>
              <span className="text-sm text-gray-500">{a.who}</span>
            </div>
            <div className="flex flex-wrap gap-2">
              {a.models.map((m, k) => (
                <motion.span
                  key={m}
                  initial={{ opacity: 0, y: 6 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: k * 0.08 }}
                  className="px-3 py-2 rounded-lg border border-white/15 bg-black/40 text-sm text-gray-200"
                >
                  🧠 {m}
                </motion.span>
              ))}
              <span className="px-3 py-2 text-sm font-mono text-gray-400">= {a.models.length} models in memory</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* ---- pick a method, see who uses it ------------------------------------- */
function MethodExplorer() {
  const [m, setM] = useState("grpo");
  const t = METHOD_TONE[m];
  const users = FAMILY_ORDER.filter((f) => uses(f, m));
  return (
    <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.06] p-5 sm:p-6">
      <div className="flex flex-wrap gap-2 mb-5">
        {METHOD_ORDER.map((k) => (
          <button
            key={k}
            onClick={() => setM(k)}
            className={`px-3 py-2 rounded-lg text-sm font-medium border transition-colors ${
              m === k ? `${METHOD_TONE[k].bg} ${METHOD_TONE[k].border} ${METHOD_TONE[k].text}` : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            {METHODS[k].name.replace(/ \(.*\)$/, "")}
          </button>
        ))}
      </div>
      <motion.div key={m} initial={{ opacity: 0, y: 6 }} animate={{ opacity: 1, y: 0 }}>
        <div className={`text-xl font-bold mb-1 ${t.text}`}>{METHODS[m].name}</div>
        <p className="text-base text-gray-200 leading-relaxed mb-2">{METHODS[m].short}</p>
        <p className="text-sm text-gray-400 leading-relaxed mb-2">{METHODS[m].detail}</p>
        {DEEP_DIVE[m] && (
          <a href={`#${DEEP_DIVE[m][0]}`} className="inline-block text-sm text-blue-400 hover:underline mb-5">
            {DEEP_DIVE[m][1]} →
          </a>
        )}
        {!DEEP_DIVE[m] && <div className="mb-3" />}
        <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Documented in {users.length} of {FAMILY_ORDER.length} families</div>
        <div className="space-y-2">
          {users.map((f) => (
            <Link key={f} to={FAMILY_PATHS[f]} className="block p-3 rounded-lg border border-white/10 bg-black/30 hover:border-white/30 no-underline">
              <div className="text-sm font-semibold text-white mb-0.5">{FAMILY_NAMES[f]}</div>
              <div className="text-sm text-gray-400 leading-relaxed">{PROFILES[f].stages.find((s) => s.m === m).note}</div>
            </Link>
          ))}
          {!users.length && <p className="text-sm text-gray-500">No family documents this method publicly.</p>}
        </div>
      </motion.div>
    </div>
  );
}

export default function ModelsTraining() {
  const toc = [
    { label: "The Four Stages", hash: "stages" },
    { label: "Method Explorer", hash: "explorer" },
    { label: "Who Uses What", hash: "matrix" },
    { label: "PPO vs DPO vs GRPO", hash: "rl" },
    { label: "Weights Compared", hash: "weights" },
    { label: "What Is Not Disclosed", hash: "disclosure" },
  ];

  return (
    <GuideLayout
      title="How Models Are Trained"
      intro="Every major model family, side by side: which training methods each one uses, what its weights are and under which licence, and what its maker has not disclosed."
      toc={toc}
    >
      <section id="stages" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Four Stages</h2>
        <p className="text-base text-gray-300 leading-relaxed max-w-3xl mb-5">
          Almost every modern model passes through the same four stages. The families differ in which method they
          use inside each stage — and that is where their personalities come from.
        </p>
        <CanonicalPipeline />
      </section>

      <section id="explorer" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Method Explorer</h2>
        <p className="text-base text-gray-300 leading-relaxed max-w-3xl mb-5">
          Pick a method to see what it does and which families have documented using it.
        </p>
        <MethodExplorer />
      </section>

      <section id="matrix" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Who Uses What</h2>
        <p className="text-sm text-gray-400 leading-relaxed max-w-3xl mb-4">
          ✓ means publicly documented. A blank means not documented, not necessarily not used — closed labs disclose
          very little. ★ marks the method each family is best known for.
        </p>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5">
                <th className="px-3 py-3 text-left font-semibold text-white sticky left-0 bg-[#141414]">Family</th>
                {METHOD_ORDER.map((m) => (
                  <th key={m} className={`px-2 py-3 text-center font-semibold text-xs whitespace-nowrap ${METHOD_TONE[m].text}`}>
                    {METHODS[m].name.replace(/ \(.*\)$/, "").replace("Supervised fine-tuning", "SFT").replace("Constitutional AI / RLAIF", "Const. AI").replace("Rejection sampling", "Reject. sampling")}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {FAMILY_ORDER.map((f) => (
                <tr key={f} className="border-t border-white/10">
                  <td className="px-3 py-2.5 sticky left-0 bg-[#0f0f0f]">
                    <Link to={FAMILY_PATHS[f]} className="text-sm font-semibold text-gray-100 hover:text-blue-400 whitespace-nowrap">
                      {FAMILY_NAMES[f]}
                    </Link>
                  </td>
                  {METHOD_ORDER.map((m) => (
                    <td key={m} className="px-2 py-2.5 text-center">
                      {PROFILES[f].signature === m ? (
                        <span className="text-amber-300 font-bold" title="signature method">★</span>
                      ) : uses(f, m) ? (
                        <span className="text-emerald-400">✓</span>
                      ) : (
                        <span className="text-gray-700">·</span>
                      )}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="rl" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">PPO vs DPO vs GRPO</h2>
        <RlMemory />
      </section>

      <section id="weights" className="mb-16 scroll-mt-24">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
          <h2 className="text-2xl font-bold text-white m-0">Weights Compared</h2>
          <span className="text-xs font-mono text-gray-500">as of {AS_OF}</span>
        </div>
        <div className="space-y-2">
          {FAMILY_ORDER.map((f) => {
            const w = PROFILES[f].weights;
            const badge =
              w.status === "open" ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200"
              : w.status === "closed" ? "border-rose-500/40 bg-rose-500/15 text-rose-200"
              : "border-amber-500/40 bg-amber-500/15 text-amber-200";
            return (
              <Link key={f} to={FAMILY_PATHS[f]} className="block p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:border-white/25 no-underline">
                <div className="flex flex-wrap items-center gap-3 mb-1">
                  <span className="font-semibold text-white">{FAMILY_NAMES[f]}</span>
                  <span className={`px-2 py-0.5 rounded-md border text-xs font-semibold ${badge}`}>
                    {w.status === "open" ? "Open" : w.status === "closed" ? "Closed" : "Mixed"}
                  </span>
                  <span className="text-sm text-gray-400">{w.licence}</span>
                </div>
                <div className="text-sm text-gray-500">Current: {PROFILES[f].lineup[0].name}</div>
              </Link>
            );
          })}
        </div>
        <div className="mt-4 p-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>"Open weights" is not the same as "open source".</strong> MIT and Apache 2.0 are standard
            open-source licences. The Llama community licence allows commercial use but adds an acceptable-use policy
            and terms above 700 million monthly users. And almost no family releases its training data — you get
            the finished model, not the means to rebuild it.
          </p>
        </div>
      </section>

      <section id="disclosure" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">What Is Not Disclosed</h2>
        <p className="text-base text-gray-300 leading-relaxed max-w-3xl mb-5">
          The honest summary: the most capable models are the least documented. Open-weight labs publish technical
          reports; frontier closed labs publish capability claims and safety evaluations, but rarely training details.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {FAMILY_ORDER.map((f) => (
            <div key={f} className="p-4 rounded-xl border border-white/10 bg-white/[0.03]">
              <div className="text-sm font-semibold text-white mb-1.5">{FAMILY_NAMES[f]}</div>
              <div className="text-sm text-gray-400 leading-relaxed">{PROFILES[f].undisclosed.join(" · ")}</div>
            </div>
          ))}
        </div>
      </section>
      <KnowledgeCheck questions={questionsFor("models-training")} />
    </GuideLayout>
  );
}

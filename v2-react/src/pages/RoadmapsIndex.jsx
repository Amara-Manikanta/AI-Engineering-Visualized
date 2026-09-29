import React, { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import GuideLayout from "../components/GuideLayout";
import { useReadPages } from "../lib/progress";

/* ===========================================================================
   Guided learning paths. Every step links to a page that actually exists in
   this app. Completion is per-step and persisted to localStorage, which also
   serves as the progress tracker.
=========================================================================== */

const STORE_KEY = "mani-notes:progress:v1";

const PATHS = [
  {
    id: "beginner",
    emoji: "🟢",
    name: "Beginner",
    tagline: "No AI background needed",
    blurb:
      "Start from Python and finish having built your first retrieval app. Each step assumes only the ones before it.",
    accent: { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/40", dot: "bg-emerald-500" },
    steps: [
      { t: "Python foundations", p: "/python/foundations", why: "Variables, control flow, and the memory model everything else rests on." },
      { t: "Data structures & functions", p: "/python/data-structures", why: "Lists, dicts and comprehensions — the shapes all AI data arrives in." },
      { t: "Intro to Machine Learning", p: "/ml", why: "The vocabulary: features, labels, training, overfitting." },
      { t: "Supervised learning", p: "/ml/supervised", why: "The most common ML shape, and how to tell if a model actually works." },
      { t: "What embeddings are", p: "/rag/embeddings", why: "Turning text into vectors — the bridge from words to maths." },
      { t: "Try the playgrounds", p: "/playgrounds", why: "See tokenization, temperature and embeddings behave for yourself." },
      { t: "RAG fundamentals", p: "/rag/fundamentals", why: "The four stages, end to end." },
      { t: "Build it: chunking → retrieval", p: "/rag/chunking", why: "The two decisions that most affect whether your first app works." },
    ],
  },
  {
    id: "data",
    emoji: "📊",
    name: "Data & Statistics",
    tagline: "Before any model",
    blurb:
      "The groundwork every model rests on: getting data, cleaning it, understanding it, and knowing when a pattern is real.",
    accent: { text: "text-sky-400", bg: "bg-sky-500/10", border: "border-sky-500/40", dot: "bg-sky-500" },
    steps: [
      { t: "Data sourcing", p: "/ml/data-sourcing", why: "Where data comes from, sampling bias, and labeller agreement." },
      { t: "Data cleaning", p: "/ml/data-cleaning", why: "Duplicates, types, impossible values, outliers and missing data." },
      { t: "Data analysis (EDA)", p: "/ml/data-analysis", why: "Centre, spread and shape of every column, before you model." },
      { t: "Bivariate analysis", p: "/ml/bivariate-analysis", why: "Correlation, crosstabs, ANOVA — and why correlation is not causation." },
      { t: "Inferential statistics", p: "/ml/inferential-statistics", why: "From a sample to the population, with confidence intervals." },
      { t: "Central limit theorem", p: "/ml/central-limit-theorem", why: "Why averages are bell-shaped, and when that fails." },
      { t: "Hypothesis testing", p: "/ml/hypothesis-testing", why: "p-values, power, A/B tests and the multiple-testing trap." },
      { t: "Multiple linear regression", p: "/ml/multiple-regression", why: "Your first model, with statistics you can now interpret." },
      { t: "Logistic regression", p: "/ml/logistic-regression", why: "Probabilities, thresholds, confusion matrices and ROC." },
      { t: "Naive Bayes", p: "/ml/naive-bayes", why: "Bayes' theorem turned into a fast text classifier." },
    ],
  },
  {
    id: "ai-engineer",
    emoji: "🟡",
    name: "AI Engineer",
    tagline: "Shipping LLM products",
    blurb:
      "For people building on top of models rather than training them. Heavy on retrieval, agents and the operational reality.",
    accent: { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/40", dot: "bg-amber-500" },
    steps: [
      { t: "Prompt engineering", p: "/prompting", why: "The cheapest lever you have. Exhaust it before reaching for anything else." },
      { t: "Tokenization & cost", p: "/playgrounds", why: "Tokens are the unit of both latency and billing." },
      { t: "RAG from scratch", p: "/rag", why: "The whole pipeline, and where each stage fails." },
      { t: "Data ingestion", p: "/rag/ingestion", why: "The right LangChain loader for each format — PDFs, scans, web, SaaS — and metadata worth keeping." },
      { t: "Chunking strategies", p: "/rag/chunking", why: "Get this wrong and nothing downstream can recover." },
      { t: "Advanced retrieval", p: "/rag/advanced-retrieval", why: "Hybrid search and re-ranking — the highest value-per-effort upgrade." },
      { t: "Contextual compression", p: "/rag/compression", why: "Cut the padding out of retrieved context — cheaper and more accurate." },
      { t: "RAG vs fine-tuning", p: "/rag/vs-fine-tuning", why: "Decide which problem you have before you build the wrong thing." },
      { t: "RAG evaluation", p: "/rag/evaluation", why: "How to know a change helped, with a number rather than a vibe." },
      { t: "Agent architecture", p: "/agents", why: "The core loop, plus reasoning strategies and guardrails." },
      { t: "Tool calling", p: "/agents/tool-calling", why: "How agents actually touch the world — and where the security boundary is." },
      { t: "MCP", p: "/mcp", why: "The standard way to connect models to external systems." },
      { t: "Multi-agent systems", p: "/agents/multi-agent", why: "Including when *not* to use them, which is most of the time." },
      { t: "LangChain + LangGraph", p: "/agents/langchain", why: "Orchestration, and stateful graphs for cyclic agent flows." },
      { t: "Framework choice", p: "/agents/frameworks", why: "CrewAI, AutoGen and LangGraph on the same task — pick on control flow." },
      { t: "Debugging agents", p: "/agents/debugging", why: "Compounding failure, tracing, and the caps you need before shipping." },
      { t: "Production deployment", p: "/rag/development", why: "Index-time vs query-time, monitoring, and the security checklist." },
    ],
  },
  {
    id: "ml-engineer",
    emoji: "🔴",
    name: "ML Engineer",
    tagline: "Models and training",
    blurb:
      "For people who need to understand and modify the models themselves, not just call them.",
    accent: { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/40", dot: "bg-rose-500" },
    steps: [
      { t: "Supervised learning", p: "/ml/supervised", why: "Bias/variance, cross-validation, and honest evaluation." },
      { t: "Linear & logistic regression", p: "/ml/linear-regression", why: "Gradient descent and the loss surface, on the simplest possible model." },
      { t: "Multiple linear regression", p: "/ml/multiple-regression", why: "Fit real coefficients, read residual plots, and spot multicollinearity." },
      { t: "Naive Bayes", p: "/ml/naive-bayes", why: "Bayes' theorem as a classifier — build a spam filter by counting words." },
      { t: "Unsupervised learning", p: "/ml/unsupervised", why: "Clustering and dimensionality reduction." },
      { t: "Decision trees & KNN", p: "/ml/decision-trees", why: "The non-parametric family, and why ensembles beat single trees." },
      { t: "Support vector machines", p: "/ml/svm", why: "Margin geometry and the kernel trick, both computed live." },
      { t: "Random forests", p: "/ml/random-forests", why: "Why averaging works, and the variance floor correlation puts under it." },
      { t: "Gradient boosting & XGBoost", p: "/ml/xgboost", why: "Still the strongest default on tabular data. Watch it fit residuals." },
      { t: "Deep learning", p: "/ml/deep-learning", why: "From one neuron to backprop through a stack of layers." },
      { t: "CNNs", p: "/ml/cnn", why: "Apply a real kernel to a real grid and watch an edge detector fall out." },
      { t: "RNNs & LSTMs", p: "/ml/rnn", why: "The vanishing-gradient arithmetic that made attention necessary." },
      { t: "GANs", p: "/ml/gans", why: "Adversarial training, run in the browser on a two-parameter generator." },
      { t: "NLP fundamentals", p: "/ml/nlp", why: "Tokenization through TF-IDF — the ideas transformers replaced." },
      { t: "Transformers", p: "/ml/transformers", why: "Attention, positional encoding, and the architecture behind every LLM." },
      { t: "Attention, hands-on", p: "/playgrounds", why: "Watch a causal attention matrix respond to your own sentence." },
      { t: "Fine-tuning & LoRA", p: "/animations", why: "Step through the adapter pipeline before reading the theory." },
      { t: "Tokenization", p: "/genai/tokenization", why: "Train BPE merge by merge, and see which model failures it explains." },
      { t: "PEFT & LoRA", p: "/genai/peft", why: "The parameter and memory arithmetic that makes large fine-tunes possible." },
      { t: "Quantization", p: "/genai/quantization", why: "Trading precision for memory, and where quality actually degrades." },
      { t: "Distillation", p: "/genai/distillation", why: "Teaching a small model from a large one, and what temperature exposes." },
      { t: "Reinforcement learning", p: "/ml/reinforcement-learning", why: "Bandits, Q-learning and PPO — the machinery behind alignment." },
      { t: "RLHF & alignment", p: "/ml/rlhf", why: "SFT → reward model → PPO, and why the KL penalty matters." },
      { t: "DPO", p: "/ml/dpo", why: "The same goal as RLHF with a single supervised loss." },
      { t: "GRPO & verifiable rewards", p: "/ml/grpo", why: "How reasoning models are trained with checkable answers." },
    ],
  },
  {
    id: "cloud",
    emoji: "☁️",
    name: "Cloud & Deployment",
    tagline: "Running it in production",
    blurb:
      "The infrastructure half: where the model runs, what it costs, and how you keep it up.",
    accent: { text: "text-blue-400", bg: "bg-blue-500/10", border: "border-blue-500/40", dot: "bg-blue-500" },
    steps: [
      { t: "Python tooling & async", p: "/python/tooling-async", why: "Virtual envs, APIs, asyncio, and concurrency limits for API calls." },
      { t: "Azure basics", p: "/azure", why: "Identity, compute and storage primitives." },
      { t: "AWS basics", p: "/aws", why: "The equivalent primitives on the other major cloud." },
      { t: "Vector databases", p: "/rag/vector-dbs", why: "The one piece of stateful infrastructure a RAG app really needs." },
      { t: "Indexing at scale", p: "/rag/indexing", why: "HNSW and IVF — the speed/recall tradeoff you control." },
      { t: "Cost modelling", p: "/playgrounds", why: "Model the bill before you commit to an architecture." },
      { t: "Production checklist", p: "/rag/development", why: "Deployment, monitoring and security for an LLM service." },
    ],
  },
];

function loadProgress() {
  try {
    return JSON.parse(localStorage.getItem(STORE_KEY)) ?? {};
  } catch {
    return {};
  }
}

export default function RoadmapsIndex() {
  const [active, setActive] = useState(PATHS[0].id);
  const [done, setDone] = useState({});
  const readPages = useReadPages();

  // localStorage can throw (private mode, blocked storage) — never let it break the page.
  useEffect(() => setDone(loadProgress()), []);

  const toggle = (key) => {
    setDone((d) => {
      const next = { ...d, [key]: !d[key] };
      if (!next[key]) delete next[key];
      try {
        localStorage.setItem(STORE_KEY, JSON.stringify(next));
      } catch { /* storage unavailable — progress just won't persist */ }
      return next;
    });
  };

  const resetPath = (path) => {
    setDone((d) => {
      const next = { ...d };
      path.steps.forEach((_, i) => delete next[`${path.id}:${i}`]);
      try { localStorage.setItem(STORE_KEY, JSON.stringify(next)); } catch { /* noop */ }
      return next;
    });
  };

  const path = PATHS.find((p) => p.id === active);
  const counts = useMemo(
    () =>
      Object.fromEntries(
        PATHS.map((p) => [p.id, p.steps.filter((_, i) => done[`${p.id}:${i}`]).length])
      ),
    [done]
  );
  const completed = counts[path.id] ?? 0;
  const pct = Math.round((completed / path.steps.length) * 100);

  const toc = PATHS.map((p) => ({ label: `${p.name} Path`, hash: p.id }));

  return (
    <GuideLayout
      title="Learning Paths"
      intro={`${PATHS.length} ordered routes through the material, depending on what you're trying to become. Tick steps off as you go — progress is saved in your browser.`}
      toc={toc}
      // Only the active path is rendered, so a contents click switches to it.
      onTocClick={(id) => {
        if (PATHS.some((p) => p.id === id)) setActive(id);
      }}
    >
      {/* path picker with progress */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 mb-8">
        {PATHS.map((p) => {
          const c = counts[p.id] ?? 0;
          const pp = Math.round((c / p.steps.length) * 100);
          const on = active === p.id;
          return (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              className={`text-left p-4 rounded-xl border transition-all ${
                on ? `${p.accent.bg} ${p.accent.border}` : "bg-white/5 border-white/10 hover:border-white/30"
              }`}
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{p.emoji}</span>
                <span className={`font-bold text-sm ${on ? p.accent.text : "text-gray-300"}`}>{p.name}</span>
              </div>
              <div className="text-[0.625rem] text-gray-500 mb-2.5">{p.tagline}</div>
              <div className="h-1.5 rounded-full bg-black/40 overflow-hidden">
                <motion.div
                  className={`h-full ${p.accent.dot}`}
                  animate={{ width: `${pp}%` }}
                  transition={{ type: "spring", stiffness: 80, damping: 18 }}
                />
              </div>
              <div className="text-[0.625rem] text-gray-500 mt-1.5 font-mono">
                {c}/{p.steps.length} done
              </div>
            </button>
          );
        })}
      </div>

      {/* active path */}
      <section id={path.id} className="scroll-mt-24">
        <div className="flex flex-wrap items-end justify-between gap-3 mb-2">
          <h2 className="text-2xl font-bold text-white">
            {path.emoji} {path.name} Path
          </h2>
          <div className="flex items-center gap-3">
            <span className={`text-sm font-mono ${path.accent.text}`}>{pct}% complete</span>
            {completed > 0 && (
              <button
                onClick={() => resetPath(path)}
                className="text-[0.6875rem] px-2.5 py-1 rounded-lg bg-white/5 border border-white/10 text-gray-400 hover:border-white/30 transition-colors"
              >
                ↺ Reset path
              </button>
            )}
          </div>
        </div>
        <p className="text-sm text-gray-400 mb-6 max-w-3xl">{path.blurb}</p>

        <div className="relative">
          {/* vertical rail */}
          <div className="absolute left-[15px] top-2 bottom-2 w-px bg-white/10" aria-hidden="true" />

          <ol className="space-y-3 list-none p-0 m-0">
            {path.steps.map((s, i) => {
              const key = `${path.id}:${i}`;
              const isDone = !!done[key];
              return (
                <motion.li
                  key={key}
                  initial={{ opacity: 0, x: -8 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.03 }}
                  className="relative flex gap-4 items-start"
                >
                  <button
                    onClick={() => toggle(key)}
                    aria-label={isDone ? `Mark "${s.t}" not done` : `Mark "${s.t}" done`}
                    aria-pressed={isDone}
                    className={`relative z-10 w-8 h-8 shrink-0 rounded-full border-2 flex items-center justify-center text-xs font-bold transition-all ${
                      isDone
                        ? `${path.accent.dot} border-transparent text-black`
                        : "bg-[#0a0a0a] border-gray-700 text-gray-500 hover:border-gray-500"
                    }`}
                  >
                    {isDone ? "✓" : i + 1}
                  </button>

                  <div
                    className={`flex-1 rounded-xl border p-4 transition-opacity ${
                      isDone ? "border-white/10 bg-white/[0.02] opacity-60" : "border-white/10 bg-white/5"
                    }`}
                  >
                    <div className="flex flex-wrap items-center gap-2 mb-1">
                      <Link
                        to={s.p}
                        className={`font-semibold text-sm hover:underline ${isDone ? "text-gray-400 line-through" : "text-white"}`}
                      >
                        {s.t}
                      </Link>
                      <span className="text-[0.625rem] font-mono text-gray-600">{s.p}</span>
                      {readPages.has(s.p) && (
                        <span className="text-[0.625rem] px-1.5 py-0.5 rounded bg-emerald-500/15 text-emerald-300 border border-emerald-500/30">
                          page read
                        </span>
                      )}
                    </div>
                    <p className="text-xs text-gray-400 leading-relaxed m-0">{s.why}</p>
                  </div>
                </motion.li>
              );
            })}
          </ol>
        </div>

        {pct === 100 && (
          <motion.div
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            className={`mt-6 p-5 rounded-xl border text-center ${path.accent.border} ${path.accent.bg}`}
          >
            <div className="text-2xl mb-1">🎉</div>
            <div className={`font-bold ${path.accent.text}`}>{path.name} path complete</div>
            <p className="text-xs text-gray-400 mt-1 mb-0">
              Try another path, or press <kbd className="font-mono">⌘K</kbd> to search for a specific topic.
            </p>
          </motion.div>
        )}

        <div className="mt-8 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-xs text-gray-400 leading-relaxed m-0">
            Progress is stored in this browser only — it isn't synced, and clearing site data resets it. Paths overlap
            deliberately: a step ticked in one path stays independent in another, so you can follow two at once
            without one marking the other done. A "page read" badge appears when you have used the Mark as read button
            at the foot of that page.
          </p>
        </div>
      </section>
    </GuideLayout>
  );
}

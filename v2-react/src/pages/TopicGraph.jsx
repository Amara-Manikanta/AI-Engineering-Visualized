import React, { useCallback, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import GuideLayout from "../components/GuideLayout";

/* --------------------------------------------------------------------------
   A map of the whole site as a force-directed graph.

   The layout is a small spring/repulsion simulation written here rather than
   pulled from a library: repulsion between every pair, springs along edges,
   a weak pull toward the centre, and velocity damping. It runs for a fixed
   number of ticks on mount, so there is no animation loop burning CPU.
-------------------------------------------------------------------------- */

const GROUPS = {
  Foundations: { color: "#818cf8", ring: "rgba(129,140,248,0.35)" },
  Data: { color: "#38bdf8", ring: "rgba(56,189,248,0.35)" },
  ML: { color: "#34d399", ring: "rgba(52,211,153,0.35)" },
  "Deep Learning": { color: "#a78bfa", ring: "rgba(167,139,250,0.35)" },
  GenAI: { color: "#fbbf24", ring: "rgba(251,191,36,0.35)" },
  RAG: { color: "#60a5fa", ring: "rgba(96,165,250,0.35)" },
  Agents: { color: "#f472b6", ring: "rgba(244,114,182,0.35)" },
  Build: { color: "#2dd4bf", ring: "rgba(45,212,191,0.35)" },
};

const NODES = [
  // Foundations
  { id: "python", label: "Python", group: "Foundations", path: "/python", size: 13 },
  { id: "ml", label: "ML Basics", group: "Foundations", path: "/ml", size: 15 },
  { id: "supervised", label: "Supervised", group: "Foundations", path: "/ml/supervised", size: 10 },
  { id: "unsupervised", label: "Unsupervised", group: "Foundations", path: "/ml/unsupervised", size: 10 },
  { id: "datasrc", label: "Data Sourcing", group: "Data", path: "/ml/data-sourcing", size: 9 },
  { id: "dataclean", label: "Data Cleaning", group: "Data", path: "/ml/data-cleaning", size: 10 },
  { id: "eda", label: "EDA", group: "Data", path: "/ml/data-analysis", size: 10 },
  { id: "bivariate", label: "Bivariate", group: "Data", path: "/ml/bivariate-analysis", size: 9 },
  { id: "inferstats", label: "Inferential Stats", group: "Data", path: "/ml/inferential-statistics", size: 10 },
  { id: "clt", label: "CLT", group: "Data", path: "/ml/central-limit-theorem", size: 9 },
  { id: "hypothesis", label: "Hypothesis Tests", group: "Data", path: "/ml/hypothesis-testing", size: 10 },

  // Classical ML
  { id: "linreg", label: "Linear Reg", group: "ML", path: "/ml/linear-regression", size: 9 },
  { id: "logreg", label: "Logistic Reg", group: "ML", path: "/ml/logistic-regression", size: 9 },
  { id: "multireg", label: "Multiple Reg", group: "ML", path: "/ml/multiple-regression", size: 9 },
  { id: "naivebayes", label: "Naive Bayes", group: "ML", path: "/ml/naive-bayes", size: 9 },
  { id: "rl", label: "Reinforcement Learning", group: "ML", path: "/ml/reinforcement-learning", size: 11 },
  { id: "trees", label: "Decision Trees", group: "ML", path: "/ml/decision-trees", size: 10 },
  { id: "knn", label: "KNN", group: "ML", path: "/ml/knn", size: 8 },
  { id: "svm", label: "SVM", group: "ML", path: "/ml/svm", size: 9 },
  { id: "forests", label: "Random Forests", group: "ML", path: "/ml/random-forests", size: 10 },
  { id: "xgboost", label: "XGBoost", group: "ML", path: "/ml/xgboost", size: 10 },

  // Deep learning
  { id: "dl", label: "Neural Nets", group: "Deep Learning", path: "/ml/deep-learning", size: 13 },
  { id: "cnn", label: "CNNs", group: "Deep Learning", path: "/ml/cnn", size: 10 },
  { id: "rnn", label: "RNNs & LSTMs", group: "Deep Learning", path: "/ml/rnn", size: 10 },
  { id: "gans", label: "GANs", group: "Deep Learning", path: "/ml/gans", size: 9 },
  { id: "transformers", label: "Transformers", group: "Deep Learning", path: "/ml/transformers", size: 16 },
  { id: "nlp", label: "NLP", group: "Deep Learning", path: "/ml/nlp", size: 10 },
  { id: "mamba", label: "Mamba / SSM", group: "Deep Learning", path: "/ml/mamba", size: 11 },
  { id: "rwkv", label: "RWKV", group: "Deep Learning", path: "/ml/rwkv", size: 10 },

  // GenAI
  { id: "llms", label: "LLMs", group: "GenAI", path: "/llms", size: 15 },
  { id: "tokenization", label: "Tokenization", group: "GenAI", path: "/genai/tokenization", size: 10 },
  { id: "prompting", label: "Prompting", group: "GenAI", path: "/prompting", size: 12 },
  { id: "finetune", label: "Fine-tuning", group: "GenAI", path: "/genai/fine-tuning", size: 12 },
  { id: "peft", label: "PEFT & LoRA", group: "GenAI", path: "/genai/peft", size: 11 },
  { id: "distill", label: "Distillation", group: "GenAI", path: "/genai/distillation", size: 9 },
  { id: "quant", label: "Quantization", group: "GenAI", path: "/genai/quantization", size: 9 },
  { id: "inference", label: "LLM Inference", group: "GenAI", path: "/llm-inference", size: 10 },
  { id: "safety", label: "Safety", group: "GenAI", path: "/safety", size: 10 },
  { id: "efficiency", label: "Efficiency", group: "GenAI", path: "/efficiency", size: 12 },
  { id: "decision", label: "Decision Models", group: "GenAI", path: "/genai/decision-models", size: 10 },
  { id: "modeltypes", label: "Model Types", group: "GenAI", path: "/llms/types", size: 11 },
  { id: "rlhf", label: "RLHF", group: "GenAI", path: "/ml/rlhf", size: 11 },
  { id: "dpo", label: "DPO", group: "GenAI", path: "/ml/dpo", size: 9 },
  { id: "grpo", label: "GRPO", group: "GenAI", path: "/ml/grpo", size: 9 },
  { id: "rlaif", label: "RLAIF", group: "GenAI", path: "/ml/rlaif", size: 8 },
  { id: "training", label: "How Models Train", group: "Build", path: "/models/training", size: 11 },

  // RAG
  { id: "rag", label: "RAG", group: "RAG", path: "/rag", size: 15 },
  { id: "embeddings", label: "Embeddings", group: "RAG", path: "/rag/embeddings", size: 12 },
  { id: "chunking", label: "Chunking", group: "RAG", path: "/rag/chunking", size: 9 },
  { id: "vectordbs", label: "Vector DBs", group: "RAG", path: "/rag/vector-dbs", size: 10 },
  { id: "retrieval", label: "Retrieval", group: "RAG", path: "/rag/retrieval", size: 10 },
  { id: "advretrieval", label: "Adv Retrieval", group: "RAG", path: "/rag/advanced-retrieval", size: 10 },
  { id: "compression", label: "Compression", group: "RAG", path: "/rag/compression", size: 9 },
  { id: "ragvsft", label: "RAG vs FT", group: "RAG", path: "/rag/vs-fine-tuning", size: 9 },
  { id: "ragEval", label: "RAG Eval", group: "RAG", path: "/rag/evaluation", size: 9 },

  // Agents
  { id: "agents", label: "Agents", group: "Agents", path: "/agents", size: 15 },
  { id: "tools", label: "Tool Calling", group: "Agents", path: "/agents/tool-calling", size: 10 },
  { id: "mcp", label: "MCP", group: "Agents", path: "/mcp", size: 11 },
  { id: "a2a", label: "A2A", group: "Agents", path: "/agents/a2a", size: 9 },
  { id: "memory", label: "Agent Memory", group: "Agents", path: "/agents/memory", size: 9 },
  { id: "multiagent", label: "Multi-Agent", group: "Agents", path: "/agents/multi-agent", size: 10 },
  { id: "frameworks", label: "Frameworks", group: "Agents", path: "/agents/frameworks", size: 10 },
  { id: "debugging", label: "Debugging", group: "Agents", path: "/agents/debugging", size: 9 },
  { id: "langchain", label: "LangChain", group: "Agents", path: "/agents/langchain", size: 10 },

  // Build
  { id: "sysdesign", label: "System Design", group: "Build", path: "/system-design", size: 12 },
  { id: "projects", label: "Projects", group: "Build", path: "/projects", size: 10 },
  { id: "models", label: "Model Families", group: "Build", path: "/models/anthropic", size: 11 },

  // Added guides
  { id: "evalmetrics", label: "Eval Metrics", group: "ML", path: "/ml/evaluation-metrics", size: 11 },
  { id: "regularization", label: "Regularisation", group: "ML", path: "/ml/regularization", size: 10 },
  { id: "optimization", label: "Optimisation", group: "Deep Learning", path: "/ml/optimization", size: 10 },
  { id: "features", label: "Feature Eng", group: "Data", path: "/ml/feature-engineering", size: 10 },
  { id: "clustering", label: "Clustering", group: "ML", path: "/ml/clustering", size: 9 },
  { id: "dimred", label: "Dim Reduction", group: "ML", path: "/ml/dimensionality-reduction", size: 9 },
  { id: "timeseries", label: "Time Series", group: "ML", path: "/ml/time-series", size: 9 },
  { id: "recommenders", label: "Recommenders", group: "ML", path: "/ml/recommenders", size: 9 },
  { id: "anomaly", label: "Anomalies", group: "ML", path: "/ml/anomaly-detection", size: 9 },
  { id: "transfer", label: "Transfer & SSL", group: "Deep Learning", path: "/ml/transfer-learning", size: 10 },
  { id: "gnn", label: "GNNs", group: "Deep Learning", path: "/ml/graph-neural-networks", size: 9 },
  { id: "decoding", label: "Decoding", group: "GenAI", path: "/genai/decoding", size: 9 },
  { id: "reasoning", label: "Reasoning Models", group: "GenAI", path: "/genai/reasoning-models", size: 10 },
  { id: "serving", label: "Serving Stack", group: "GenAI", path: "/genai/serving", size: 10 },
  { id: "distributed", label: "Distributed Training", group: "GenAI", path: "/genai/distributed-training", size: 9 },
  { id: "merging", label: "Model Merging", group: "GenAI", path: "/genai/model-merging", size: 8 },
  { id: "multimodal", label: "Multimodal Gen", group: "GenAI", path: "/genai/multimodal-generation", size: 10 },
  { id: "ingestion", label: "Data Ingestion", group: "RAG", path: "/rag/ingestion", size: 10 },
  { id: "lateint", label: "Late Interaction", group: "RAG", path: "/rag/late-interaction", size: 8 },
  { id: "text2sql", label: "Text-to-SQL", group: "RAG", path: "/rag/text-to-sql", size: 9 },
  { id: "skills", label: "Agent Skills", group: "Agents", path: "/agents/skills", size: 10 },
  { id: "sdks", label: "Agent SDKs & Skills", group: "Agents", path: "/agents/sdks", size: 10 },
  { id: "redteam", label: "Red Teaming", group: "Build", path: "/safety/red-teaming", size: 9 },
  { id: "governance", label: "Governance", group: "Build", path: "/safety/governance", size: 9 },
  { id: "llmprod", label: "LLM in Production", group: "Build", path: "/llm-production", size: 11 },
  { id: "mlops", label: "MLOps", group: "Build", path: "/mlops", size: 10 },
  { id: "cloudai", label: "Cloud AI", group: "Build", path: "/cloud/ai-platforms", size: 9 },
];

const EDGES = [
  // Added guides
  ["supervised", "evalmetrics"],
  ["hypothesis", "evalmetrics"],
  ["supervised", "regularization"],
  ["evalmetrics", "regularization"],
  ["linreg", "optimization"],
  ["dl", "optimization"],
  ["dataclean", "features"],
  ["features", "supervised"],
  ["unsupervised", "clustering"],
  ["unsupervised", "dimred"],
  ["clustering", "anomaly"],
  ["dimred", "clustering"],
  ["ml", "timeseries"],
  ["ml", "recommenders"],
  ["dimred", "recommenders"],
  ["dl", "transfer"],
  ["transfer", "finetune"],
  ["dl", "gnn"],
  ["inference", "decoding"],
  ["decoding", "reasoning"],
  ["grpo", "reasoning"],
  ["inference", "serving"],
  ["efficiency", "serving"],
  ["optimization", "distributed"],
  ["finetune", "distributed"],
  ["finetune", "merging"],
  ["peft", "merging"],
  ["transformers", "multimodal"],
  ["gans", "multimodal"],
  ["rag", "ingestion"],
  ["ingestion", "chunking"],
  ["embeddings", "lateint"],
  ["advretrieval", "lateint"],
  ["rag", "text2sql"],
  ["agents", "sdks"],
  ["skills", "agents"],
  ["skills", "sdks"],
  ["skills", "mcp"],
  ["skills", "prompting"],
  ["frameworks", "sdks"],
  ["safety", "redteam"],
  ["tools", "redteam"],
  ["safety", "governance"],
  ["serving", "llmprod"],
  ["ragEval", "llmprod"],
  ["debugging", "llmprod"],
  ["ml", "mlops"],
  ["llmprod", "mlops"],
  ["sysdesign", "llmprod"],
  ["cloudai", "llmprod"],
  ["cloudai", "mlops"],
  ["python", "ml"],
  ["python", "datasrc"],
  ["datasrc", "dataclean"],
  ["dataclean", "eda"],
  ["eda", "bivariate"],
  ["eda", "inferstats"],
  ["inferstats", "clt"],
  ["inferstats", "hypothesis"],
  ["clt", "hypothesis"],
  ["dataclean", "ml"],
  ["eda", "ml"],
  ["hypothesis", "supervised"],
  ["bivariate", "multireg"],
  ["linreg", "multireg"],
  ["supervised", "multireg"],
  ["supervised", "naivebayes"],
  ["logreg", "naivebayes"],
  ["ml", "rl"],
  ["rl", "rlhf"],
  ["rlhf", "dpo"],
  ["rlhf", "grpo"],
  ["rlhf", "rlaif"],
  ["finetune", "rlhf"],
  ["rlhf", "training"],
  ["dpo", "training"],
  ["grpo", "training"],
  ["rlaif", "safety"],
  ["llms", "modeltypes"],
  ["modeltypes", "decision"],
  ["modeltypes", "efficiency"],
  ["modeltypes", "models"],
  ["ml", "supervised"],
  ["ml", "unsupervised"],
  ["supervised", "linreg"],
  ["supervised", "logreg"],
  ["supervised", "trees"],
  ["supervised", "knn"],
  ["supervised", "svm"],
  ["trees", "forests"],
  ["trees", "xgboost"],
  ["forests", "xgboost"],
  ["ml", "dl"],
  ["dl", "cnn"],
  ["dl", "rnn"],
  ["dl", "gans"],
  ["rnn", "transformers"],
  ["dl", "transformers"],
  ["nlp", "transformers"],
  ["rnn", "mamba"],
  ["rnn", "rwkv"],
  ["transformers", "mamba"],
  ["transformers", "rwkv"],
  ["mamba", "rwkv"],
  ["mamba", "llms"],
  ["transformers", "llms"],
  ["tokenization", "llms"],
  ["nlp", "tokenization"],
  ["llms", "prompting"],
  ["llms", "finetune"],
  ["finetune", "peft"],
  ["llms", "distill"],
  ["llms", "quant"],
  ["llms", "inference"],
  ["inference", "efficiency"],
  ["quant", "efficiency"],
  ["mamba", "efficiency"],
  ["distill", "efficiency"],
  ["quant", "peft"],
  ["llms", "safety"],
  ["llms", "models"],
  ["llms", "decision"],
  ["efficiency", "decision"],
  ["models", "training"],
  ["finetune", "training"],
  ["peft", "training"],
  ["distill", "training"],
  ["prompting", "rag"],
  ["rag", "embeddings"],
  ["rag", "chunking"],
  ["rag", "vectordbs"],
  ["rag", "retrieval"],
  ["retrieval", "advretrieval"],
  ["advretrieval", "compression"],
  ["chunking", "compression"],
  ["rag", "ragEval"],
  ["rag", "ragvsft"],
  ["finetune", "ragvsft"],
  ["embeddings", "vectordbs"],
  ["transformers", "embeddings"],
  ["rag", "agents"],
  ["llms", "agents"],
  ["agents", "tools"],
  ["tools", "mcp"],
  ["agents", "memory"],
  ["agents", "multiagent"],
  ["multiagent", "frameworks"],
  ["multiagent", "a2a"],
  ["mcp", "a2a"],
  ["agents", "langchain"],
  ["frameworks", "langchain"],
  ["agents", "debugging"],
  ["frameworks", "debugging"],
  ["agents", "sysdesign"],
  ["rag", "sysdesign"],
  ["inference", "sysdesign"],
  ["sysdesign", "projects"],
  ["agents", "projects"],
];

const W = 1000;
const H = 720;

/* Deterministic PRNG so the layout is identical on every load. */
function lcg(seed) {
  let s = seed;
  return () => {
    s = (s * 1664525 + 1013904223) % 4294967296;
    return s / 4294967296;
  };
}

function layout() {
  const rand = lcg(20260912);
  const idx = new Map(NODES.map((n, i) => [n.id, i]));
  const pts = NODES.map((n) => ({
    ...n,
    x: W / 2 + (rand() - 0.5) * 520,
    y: H / 2 + (rand() - 0.5) * 420,
    vx: 0,
    vy: 0,
  }));
  const links = EDGES.map(([a, b]) => [idx.get(a), idx.get(b)]).filter(
    ([a, b]) => a !== undefined && b !== undefined
  );

  const REPULSION = 4800;
  const SPRING = 0.022;
  const REST = 95;
  const CENTER = 0.002;
  const DAMP = 0.85;

  for (let tick = 0; tick < 900; tick++) {
    // Repulsion between every pair.
    for (let i = 0; i < pts.length; i++) {
      for (let j = i + 1; j < pts.length; j++) {
        let dx = pts[j].x - pts[i].x;
        let dy = pts[j].y - pts[i].y;
        let d2 = dx * dx + dy * dy;
        if (d2 < 1) {
          dx = 0.5;
          dy = 0.5;
          d2 = 0.5;
        }
        const d = Math.sqrt(d2);
        const f = REPULSION / d2;
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        pts[i].vx -= fx;
        pts[i].vy -= fy;
        pts[j].vx += fx;
        pts[j].vy += fy;
      }
    }

    // Springs along edges.
    for (const [a, b] of links) {
      const dx = pts[b].x - pts[a].x;
      const dy = pts[b].y - pts[a].y;
      const d = Math.sqrt(dx * dx + dy * dy) || 1;
      const f = (d - REST) * SPRING;
      const fx = (dx / d) * f;
      const fy = (dy / d) * f;
      pts[a].vx += fx;
      pts[a].vy += fy;
      pts[b].vx -= fx;
      pts[b].vy -= fy;
    }

    // Weak pull to centre, damping, and integration.
    for (const p of pts) {
      p.vx += (W / 2 - p.x) * CENTER;
      p.vy += (H / 2 - p.y) * CENTER;
      p.vx *= DAMP;
      p.vy *= DAMP;
      p.x += Math.max(-14, Math.min(14, p.vx));
      p.y += Math.max(-14, Math.min(14, p.vy));
      p.x = Math.max(60, Math.min(W - 60, p.x));
      p.y = Math.max(44, Math.min(H - 44, p.y));
    }
  }

  return { pts, links };
}

function Graph() {
  const { pts, links } = useMemo(layout, []);
  const navigate = useNavigate();
  const [hover, setHover] = useState(null);
  const [activeGroups, setActiveGroups] = useState(() => new Set(Object.keys(GROUPS)));

  const neighbours = useMemo(() => {
    if (hover === null) return null;
    const s = new Set([hover]);
    for (const [a, b] of links) {
      if (a === hover) s.add(b);
      if (b === hover) s.add(a);
    }
    return s;
  }, [hover, links]);

  const visible = useCallback((i) => activeGroups.has(pts[i].group), [activeGroups, pts]);

  /* ---- pan and zoom -------------------------------------------------------
     The viewBox is the camera. Zooming keeps the point under the cursor fixed
     by scaling the box around it; panning converts pixel deltas into viewBox
     units so the drag tracks the pointer exactly at any zoom level. -------- */
  const svgRef = useRef(null);
  const [view, setView] = useState({ x: 0, y: 0, w: W, h: H });
  const drag = useRef(null);

  const MIN_W = W / 6; // zoom in to 6x
  const MAX_W = W * 1.6; // and a little wider than the whole graph

  /** Pointer position in viewBox units. */
  const toView = useCallback(
    (e) => {
      const r = svgRef.current.getBoundingClientRect();
      return {
        x: view.x + ((e.clientX - r.left) / r.width) * view.w,
        y: view.y + ((e.clientY - r.top) / r.height) * view.h,
      };
    },
    [view]
  );

  const zoomAt = useCallback(
    (factor, anchor) => {
      setView((v) => {
        const w = Math.min(MAX_W, Math.max(MIN_W, v.w * factor));
        const k = w / v.w; // actual applied factor after clamping
        const h = v.h * k;
        const a = anchor ?? { x: v.x + v.w / 2, y: v.y + v.h / 2 };
        return { x: a.x - (a.x - v.x) * k, y: a.y - (a.y - v.y) * k, w, h };
      });
    },
    [MIN_W, MAX_W]
  );

  const onWheel = (e) => {
    e.preventDefault();
    zoomAt(e.deltaY > 0 ? 1.12 : 1 / 1.12, toView(e));
  };

  const onPointerDown = (e) => {
    if (e.button !== 0) return;
    drag.current = { sx: e.clientX, sy: e.clientY, vx: view.x, vy: view.y, moved: false };
    svgRef.current.setPointerCapture?.(e.pointerId);
  };

  const onPointerMove = (e) => {
    const d = drag.current;
    if (!d) return;
    const r = svgRef.current.getBoundingClientRect();
    const dx = ((e.clientX - d.sx) / r.width) * view.w;
    const dy = ((e.clientY - d.sy) / r.height) * view.h;
    if (Math.abs(e.clientX - d.sx) + Math.abs(e.clientY - d.sy) > 4) d.moved = true;
    setView((v) => ({ ...v, x: d.vx - dx, y: d.vy - dy }));
  };

  const endDrag = (e) => {
    svgRef.current?.releasePointerCapture?.(e.pointerId);
    // keep `moved` readable by the click handler for one tick
    const d = drag.current;
    drag.current = null;
    if (d?.moved) {
      lastDragEnd.current = Date.now();
    }
  };

  // A drag that ends on a node must not also navigate.
  const lastDragEnd = useRef(0);
  const wasDragging = () => Date.now() - lastDragEnd.current < 150;

  const zoomed = view.w !== W || view.x !== 0 || view.y !== 0;
  const zoomPct = Math.round((W / view.w) * 100);

  const toggle = (g) =>
    setActiveGroups((prev) => {
      const next = new Set(prev);
      if (next.has(g)) next.delete(g);
      else next.add(g);
      return next.size === 0 ? new Set(Object.keys(GROUPS)) : next;
    });

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.entries(GROUPS).map(([g, { color }]) => (
          <button
            key={g}
            onClick={() => toggle(g)}
            className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              activeGroups.has(g)
                ? "border-white/20 bg-white/10 text-gray-100"
                : "border-white/5 bg-white/[0.02] text-gray-600"
            }`}
          >
            <span
              className="w-2.5 h-2.5 rounded-full shrink-0"
              style={{ background: activeGroups.has(g) ? color : "#4b5563" }}
            />
            {g}
          </button>
        ))}
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-3">
        <button onClick={() => zoomAt(1 / 1.35)} className="w-8 h-8 rounded-lg border border-white/15 bg-white/5 text-gray-300 hover:text-white hover:border-white/35 transition-colors font-bold">+</button>
        <button onClick={() => zoomAt(1.35)} className="w-8 h-8 rounded-lg border border-white/15 bg-white/5 text-gray-300 hover:text-white hover:border-white/35 transition-colors font-bold">−</button>
        <button
          onClick={() => setView({ x: 0, y: 0, w: W, h: H })}
          disabled={!zoomed}
          className="px-3 h-8 rounded-lg border border-white/15 bg-white/5 text-xs font-semibold text-gray-300 hover:text-white hover:border-white/35 disabled:opacity-30 transition-colors"
        >
          Reset view
        </button>
        <span className="text-xs font-mono text-gray-600 ml-1">{zoomPct}%</span>
        <span className="text-[0.6875rem] text-gray-600 ml-auto">scroll to zoom · drag to pan</span>
      </div>

      <div className="rounded-2xl bg-black/50 border border-white/10 p-2 overflow-hidden">
        <svg
          ref={svgRef}
          viewBox={`${view.x} ${view.y} ${view.w} ${view.h}`}
          className={`w-full h-auto min-w-[760px] touch-none select-none ${drag.current ? "cursor-grabbing" : "cursor-grab"}`}
          onMouseLeave={() => setHover(null)}
          onWheel={onWheel}
          onPointerDown={onPointerDown}
          onPointerMove={onPointerMove}
          onPointerUp={endDrag}
          onPointerCancel={endDrag}
        >
          {/* edges */}
          {links.map(([a, b], i) => {
            const shown = visible(a) && visible(b);
            const lit = neighbours && (neighbours.has(a) || neighbours.has(b));
            if (!shown) return null;
            return (
              <line
                key={i}
                x1={pts[a].x}
                y1={pts[a].y}
                x2={pts[b].x}
                y2={pts[b].y}
                stroke={lit ? "rgba(255,255,255,0.55)" : "rgba(255,255,255,0.2)"}
                strokeWidth={lit ? 2 : 1.1}
              />
            );
          })}

          {/* nodes */}
          {pts.map((p, i) => {
            if (!visible(i)) return null;
            const g = GROUPS[p.group];
            const dim = neighbours && !neighbours.has(i);
            const isHover = hover === i;
            return (
              <g
                key={p.id}
                opacity={dim ? 0.22 : 1}
                onMouseEnter={() => setHover(i)}
                onClick={() => { if (!wasDragging()) navigate(p.path); }}
                onKeyDown={(e) => {
                  if (e.key === "Enter" || e.key === " ") {
                    e.preventDefault();
                    navigate(p.path);
                  }
                }}
                tabIndex={0}
                role="link"
                aria-label={p.label}
                style={{ cursor: "pointer" }}
              >
                {isHover && <circle cx={p.x} cy={p.y} r={p.size + 8} fill={g.ring} />}
                <circle cx={p.x} cy={p.y} r={p.size} fill={g.color} stroke="rgba(0,0,0,0.55)" strokeWidth="2" />
                <text
                  x={p.x}
                  y={p.y + p.size + 14}
                  textAnchor="middle"
                  fontSize={isHover ? 13 : 11}
                  fontWeight={isHover ? 700 : 500}
                  fill={isHover ? "#fff" : "#9ca3af"}
                  style={{ pointerEvents: "none", userSelect: "none" }}
                >
                  {p.label}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <p className="text-xs text-gray-500 mt-3 leading-relaxed">
        Hover a node to isolate what it connects to. Click to open that topic. Toggle the coloured chips to hide whole
        areas — useful for seeing how densely one region connects on its own.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const PATHS = [
  {
    n: "Classical ML first",
    d: "Python → ML Basics → Supervised → the individual algorithms → ensembles. The most traditional route, and the one that makes deep learning feel less magical when you reach it.",
    box: "border-emerald-500/25 bg-emerald-500/[0.07]",
    label: "text-emerald-400",
  },
  {
    n: "Straight to LLM applications",
    d: "Prompting → RAG → Agents. Skips the maths entirely. You will build working things quickly and hit a ceiling when something behaves strangely and you have no model of why.",
    box: "border-blue-500/25 bg-blue-500/[0.07]",
    label: "text-blue-400",
  },
  {
    n: "The architecture route",
    d: "Neural Nets → RNNs → Transformers → LLMs → Fine-tuning. Follow how the field actually got here. Best if you want to read papers rather than only use APIs.",
    box: "border-purple-500/25 bg-purple-500/[0.07]",
    label: "text-purple-400",
  },
];

export default function TopicGraph() {
  const toc = [
    { label: "The Map", hash: "map" },
    { label: "Reading It", hash: "reading" },
    { label: "Three Routes Through", hash: "routes" },
  ];

  return (
    <GuideLayout
      title="Topic Map"
      intro="Every topic on the site and what it connects to. The layout is computed from the links themselves, so clusters are real rather than drawn."
      toc={toc}
    >
      <section id="map" className="mb-14 scroll-mt-24">
        <Graph />
      </section>

      <section id="reading" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Reading It</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Positions are not editorial. A spring simulation pulls connected topics together and pushes unconnected ones
          apart, so anything that ends up adjacent does so because of shared prerequisites.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ["Node size", "Roughly how central a topic is — how much else depends on it. Transformers is the largest node for a reason."],
            ["Distance", "Topics that share prerequisites drift together. Clusters form on their own from the edge list."],
            ["Bridges", "A few nodes sit between clusters. Transformers joins deep learning to generative AI; RAG joins retrieval to agents. These are the concepts worth learning properly."],
          ].map(([t, d]) => (
            <div key={t} className="p-5 rounded-xl border border-white/10 bg-white/5">
              <div className="text-sm font-semibold text-white mb-2">{t}</div>
              <p className="text-xs text-gray-400 leading-relaxed m-0">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="routes" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Three Routes Through</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {PATHS.map((p) => (
            <div key={p.n} className={`p-5 rounded-xl border ${p.box}`}>
              <div className={`font-semibold mb-1.5 ${p.label}`}>{p.n}</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{p.d}</p>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            For an ordered curriculum with checkpoints rather than a map, see{" "}
            <a href="#/roadmaps" className="text-blue-400 hover:underline">Learning Paths</a>. To check what stuck,
            try the <a href="#/quizzes" className="text-blue-400 hover:underline">knowledge checks</a>.
          </p>
        </div>
      </section>
    </GuideLayout>
  );
}

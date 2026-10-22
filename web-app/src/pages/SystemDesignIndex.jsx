import React, { useState } from "react";
import { motion } from "framer-motion";
import GuideLayout from "../components/GuideLayout";

/* ===========================================================================
   Five reference architectures. Each is a layered diagram plus the decisions
   that actually matter when you build it — not just box names.
=========================================================================== */

const TONE = {
  gray:    "border-gray-600/60 bg-white/5 text-gray-300",
  indigo:  "border-indigo-500/50 bg-indigo-500/15 text-indigo-100",
  emerald: "border-emerald-500/50 bg-emerald-500/15 text-emerald-100",
  amber:   "border-amber-500/50 bg-amber-500/15 text-amber-100",
  rose:    "border-rose-500/50 bg-rose-500/15 text-rose-100",
  purple:  "border-purple-500/50 bg-purple-500/15 text-purple-100",
  cyan:    "border-cyan-500/50 bg-cyan-500/15 text-cyan-100",
};

const SYSTEMS = [
  {
    id: "chatbot",
    label: "💬 Chatbot",
    title: "AI Chatbot Architecture",
    intro:
      "The default shape of an LLM product. Most of the engineering is not the model call — it's session state, routing and the safety envelope around it.",
    rows: [
      { name: "Client", items: [["Web / mobile UI", "cyan"], ["Streaming renderer", "cyan"]] },
      { name: "Edge", items: [["API gateway", "gray"], ["Auth + rate limit", "rose"]] },
      { name: "Orchestration", items: [["Router", "indigo"], ["Prompt assembly", "indigo"], ["Tool dispatch", "amber"]] },
      { name: "State", items: [["Session store", "purple"], ["Summary memory", "purple"], ["Vector store", "emerald"]] },
      { name: "Model", items: [["Primary LLM", "indigo"], ["Cheap fallback", "gray"], ["Moderation", "rose"]] },
    ],
    decisions: [
      ["Stream from the first token", "Time-to-first-token is what users perceive as speed. A 6-second streamed answer feels faster than a 3-second blocking one."],
      ["Route by difficulty", "Send easy turns to a small model. This is usually the single biggest cost reduction available, and users rarely notice."],
      ["Summarise, don't truncate", "Keep the system prompt, a rolling summary and recent turns verbatim. Truncation makes the bot visibly forgetful."],
      ["Idempotent tool calls", "Users retry. A double-charged payment is worse than a slow reply."],
    ],
    pitfall: "Storing raw transcripts forever. They contain user PII, grow without bound, and become a liability — set a retention policy on day one.",
  },
  {
    id: "search",
    label: "🔍 AI Search",
    title: "AI Search Engine (RAG)",
    intro:
      "Retrieval quality is a hard ceiling on answer quality, so almost all the design effort belongs before the model call.",
    rows: [
      { name: "Ingest (offline)", items: [["Loaders", "gray"], ["Parse / OCR", "gray"], ["Chunk", "amber"], ["Embed", "emerald"]] },
      { name: "Storage", items: [["Vector index (HNSW)", "emerald"], ["Keyword index (BM25)", "amber"], ["Metadata + ACLs", "rose"]] },
      { name: "Query (online)", items: [["Query rewrite", "indigo"], ["Hybrid retrieve", "cyan"], ["RRF fuse", "cyan"], ["Re-rank", "purple"]] },
      { name: "Answer", items: [["Prompt + context", "indigo"], ["LLM", "indigo"], ["Citations", "emerald"]] },
    ],
    decisions: [
      ["Two separate programs", "Ingest is a batch job; query is a web service. Conflating them is how you end up re-embedding a corpus per request."],
      ["Hybrid + re-rank is the baseline", "Dense search alone misses exact IDs and error codes; keyword alone misses paraphrase. Fuse both, then re-rank."],
      ["Filter ACLs in the query", "Permission filtering belongs in the vector query, not the prompt. Asking the model to respect permissions is not access control."],
      ["Cite spans, not documents", "A citation the user can verify in one click is the difference between trusted and ignored."],
    ],
    pitfall: "Optimising chunk size before you have an eval set. Without measurement you cannot tell an improvement from a coincidence.",
  },
  {
    id: "code",
    label: "👨‍💻 Code Assistant",
    title: "AI Code Assistant",
    intro:
      "Code has structure text doesn't, and the latency budget is brutal — an inline completion has roughly 200ms before the developer has moved on.",
    rows: [
      { name: "Editor", items: [["Inline ghost text", "cyan"], ["Chat panel", "cyan"], ["Diff review", "cyan"]] },
      { name: "Context builder", items: [["Open file + cursor", "indigo"], ["AST / symbol index", "purple"], ["Recent edits", "purple"], ["Repo retrieval", "emerald"]] },
      { name: "Models", items: [["FIM completion (small)", "amber"], ["Chat / agent (large)", "indigo"]] },
      { name: "Verification", items: [["Type check", "rose"], ["Tests", "rose"], ["Lint / format", "rose"]] },
    ],
    decisions: [
      ["Fill-in-the-middle, not left-to-right", "Completion models need the code *after* the cursor too. FIM training is what makes mid-function suggestions sane."],
      ["Two models, two budgets", "A tiny fast model for keystroke completions; a large one for chat and multi-file edits. One model cannot serve both budgets."],
      ["Verify with tools, not vibes", "Type checkers and tests are free, deterministic signals. Run them before showing a multi-file edit as done."],
      ["Rank context by proximity", "Cursor > same file > recent edits > imports > repo search. Nearby code is almost always more relevant."],
    ],
    pitfall: "Sending the whole repo. It blows the latency budget and buries the relevant lines — retrieval precision matters more here than anywhere.",
  },
  {
    id: "image",
    label: "🎨 Image Generation",
    title: "Image Generation Pipeline",
    intro:
      "Diffusion works in a compressed latent space, not pixels. That single choice is what made high-resolution generation affordable.",
    rows: [
      { name: "Conditioning", items: [["Prompt", "gray"], ["Text encoder (CLIP/T5)", "cyan"], ["Neg. prompt", "rose"]] },
      { name: "Latent init", items: [["Random noise", "gray"], ["or input image (img2img)", "amber"]] },
      { name: "Denoise loop", items: [["UNet / DiT", "indigo"], ["Cross-attention", "purple"], ["Scheduler × N steps", "indigo"]] },
      { name: "Decode", items: [["VAE decoder", "emerald"], ["Upscale", "emerald"], ["Safety filter", "rose"]] },
    ],
    decisions: [
      ["Latent, not pixel space", "Denoising a 64×64 latent instead of a 512×512 image is ~64× less work per step. The VAE decodes back at the end."],
      ["Steps trade quality for latency", "Modern schedulers get usable results in 4–20 steps where early models needed 50+."],
      ["Guidance scale is a dial, not a setting", "Too low ignores the prompt; too high produces oversaturated, brittle images."],
      ["Filter after decode", "Safety classifiers need the actual image. A latent tells you little about what will appear."],
    ],
    pitfall: "Treating generation as deterministic. Same prompt, different seed, different image — pin the seed if you need reproducibility.",
  },
  {
    id: "serving",
    label: "🚀 LLM Serving",
    title: "Production LLM Deployment",
    intro:
      "Self-hosting is mostly a memory-bandwidth problem. Throughput comes from batching and from not recomputing what you already computed.",
    rows: [
      { name: "Entry", items: [["Load balancer", "gray"], ["Auth + quota", "rose"], ["Request queue", "amber"]] },
      { name: "Engine", items: [["vLLM / TGI", "indigo"], ["Continuous batching", "indigo"], ["PagedAttention", "purple"]] },
      { name: "Memory", items: [["KV cache", "purple"], ["Prefix cache", "emerald"], ["Weights (quantised)", "cyan"]] },
      { name: "Ops", items: [["Autoscale on queue depth", "amber"], ["Token metrics", "emerald"], ["Canary rollout", "gray"]] },
    ],
    decisions: [
      ["Continuous batching, not static", "Static batches wait for the slowest sequence. Continuous batching admits new requests as others finish — often several× the throughput."],
      ["The KV cache dominates memory", "It grows with batch size × sequence length. PagedAttention manages it like virtual memory instead of pre-reserving worst case."],
      ["Cache shared prefixes", "A long system prompt reused across every request should be computed once, not per call."],
      ["Scale on queue depth", "CPU and GPU utilisation both mislead for LLM serving. Queue wait time is what users feel."],
    ],
    pitfall: "Benchmarking with one request at a time. Single-stream latency tells you almost nothing about behaviour at concurrency.",
  },
];

function SystemDiagram({ sys }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-5 overflow-x-auto">
      <div className="min-w-[560px] space-y-2.5">
        {sys.rows.map((row, ri) => (
          <motion.div
            key={row.name}
            initial={{ opacity: 0, x: -10 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: ri * 0.08 }}
            className="flex items-center gap-3"
          >
            <div className="w-32 shrink-0 text-[0.625rem] uppercase tracking-wide text-gray-500 text-right pr-1">
              {row.name}
            </div>
            <div className="flex-1 flex flex-wrap gap-2">
              {row.items.map(([label, tone]) => (
                <span key={label} className={`px-3 py-2 rounded-lg border text-xs font-medium ${TONE[tone]}`}>
                  {label}
                </span>
              ))}
            </div>
          </motion.div>
        ))}
        <div className="flex items-center gap-3 pt-1">
          <div className="w-32 shrink-0" />
          <div className="flex-1 text-[0.625rem] text-gray-600">↓ data flows downward · each row is a layer you can scale or swap independently</div>
        </div>
      </div>
    </div>
  );
}

export default function SystemDesignIndex() {
  const [active, setActive] = useState(SYSTEMS[0].id);
  const sys = SYSTEMS.find((s) => s.id === active);
  const toc = SYSTEMS.map((s) => ({ label: s.title, hash: s.id }));

  return (
    <GuideLayout
      title="AI System Design Patterns"
      intro="Reference architectures for the five systems people actually build — with the design decisions and the mistake each one invites."
      toc={toc}
      // Only the active system is mounted, so a toc click must switch tabs
      // before GuideLayout looks for the section to scroll to.
      onTocClick={(id) => {
        if (SYSTEMS.some((s) => s.id === id)) setActive(id);
      }}
    >
      <div className="flex flex-wrap gap-2 mb-6">
        {SYSTEMS.map((s) => (
          <button
            key={s.id}
            onClick={() => setActive(s.id)}
            className={`px-3.5 py-2 rounded-lg border text-sm font-medium transition-all ${
              active === s.id
                ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_4px_14px_rgba(99,102,241,0.35)]"
                : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-gray-200"
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

        <motion.section
          key={sys.id}
          id={sys.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-bold text-white mb-3">{sys.title}</h2>
          <p className="text-sm text-gray-400 mb-5 max-w-3xl">{sys.intro}</p>

          <SystemDiagram sys={sys} />

          <h3 className="text-lg font-bold text-white mt-7 mb-3">Decisions that matter</h3>
          <div className="space-y-2.5">
            {sys.decisions.map(([t, d], i) => (
              <motion.div
                key={t}
                initial={{ opacity: 0, x: -8 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex gap-3 p-4 rounded-xl border border-white/10 bg-white/5"
              >
                <span className="w-6 h-6 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-[0.6875rem] font-bold shrink-0">
                  {i + 1}
                </span>
                <div>
                  <div className="font-semibold text-white text-sm mb-0.5">{t}</div>
                  <p className="text-xs text-gray-400 leading-relaxed m-0">{d}</p>
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-5 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10">
            <div className="text-xs font-bold text-rose-300 mb-1">⚠️ The mistake this design invites</div>
            <p className="text-xs text-gray-300 leading-relaxed m-0">{sys.pitfall}</p>
          </div>
        </motion.section>

      <div className="mt-10 p-5 rounded-xl border border-white/10 bg-white/5">
        <p className="text-sm text-gray-400 leading-relaxed m-0">
          These share more than they differ: an ingest path separate from a query path, a cache in front of anything
          expensive, deterministic verification around a probabilistic core, and permissions enforced in code rather
          than in a prompt. Get those four right and the specific diagram matters less than it looks. Related:{" "}
          <a href="#/rag/development" className="text-blue-400 hover:underline">RAG in production</a>,{" "}
          <a href="#/agents/multi-agent" className="text-blue-400 hover:underline">multi-agent tradeoffs</a>, and{" "}
          <a href="#/safety" className="text-blue-400 hover:underline">defence in depth</a>.
        </p>
      </div>
    </GuideLayout>
  );
}

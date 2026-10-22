import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";

const LAYERS = [
  {
    id: "observability",
    label: "Observability",
    modules: [
      {
        id: "langsmith",
        name: "LangSmith",
        tag: null,
        color: "border-violet-400/50 bg-violet-500/10",
        text: "text-violet-300",
        desc: "A unified DevOps platform that sits above your whole app. Every Runnable in an LCEL chain automatically emits trace events, so LangSmith can show you the exact input/output of each step, how long it took, and where it failed — without adding any logging code yourself.",
        points: ["Automatic tracing of every chain step", "Prompt Playground for iterating live", "Dataset-based evaluation & regression testing", "Human annotation queues for review"],
      },
    ],
  },
  {
    id: "deployments",
    label: "Deployments",
    modules: [
      {
        id: "langserve",
        name: "LangServe",
        tag: "Python",
        color: "border-slate-400/50 bg-slate-500/10",
        text: "text-slate-300",
        desc: "Turns any LCEL Runnable into a production REST API in a couple of lines. Because every chain already implements invoke/batch/stream, LangServe can expose those as matching HTTP endpoints — plus an auto-generated OpenAPI schema and a built-in test playground.",
        points: ["/invoke, /batch, /stream endpoints for free", "Auto-generated OpenAPI docs", "Built-in playground UI at /playground", "Deploys behind FastAPI"],
      },
      {
        id: "templates",
        name: "Templates",
        tag: "Python",
        color: "border-teal-400/50 bg-teal-500/10",
        text: "text-teal-300",
        desc: "Reference applications you can pull down with the LangChain CLI as a starting point — a RAG app, a SQL agent, an extraction pipeline — pre-wired with LangServe so you get a working API on day one instead of assembling one from scratch.",
        points: ["`langchain app new` scaffolds a project", "Pre-wired with LangServe routes", "Covers RAG, agents, extraction, SQL"],
      },
    ],
  },
  {
    id: "cognitive",
    label: "Cognitive Architectures",
    modules: [
      {
        id: "langchain",
        name: "LangChain",
        tag: "Python / JS",
        color: "border-emerald-400/50 bg-emerald-500/10",
        text: "text-emerald-300",
        desc: "The main package: pre-built cognitive architectures for common patterns. Instead of hand-rolling an agent loop or a retrieval strategy, you compose these higher-level building blocks on top of langchain-core's primitives.",
        points: ["Chains — fixed, multi-step call sequences", "Agents — LLM decides which tool to call next", "Retrieval Strategies — RAG variants (multi-query, self-query, parent-document…)"],
      },
      {
        id: "langchain-community",
        name: "LangChain-Community",
        tag: "Python / JS",
        color: "border-emerald-500/40 bg-emerald-600/10",
        text: "text-emerald-200",
        desc: "The integration layer: hundreds of third-party connectors grouped by what they touch. Most actively-maintained integrations have since moved into dedicated langchain-[partner] packages, but community still hosts the long tail.",
        points: ["Model I/O — Model, Prompt, Example Selector, Output Parser", "Retrieval — Retriever, Document Loader, Vector Store, Text Splitter, Embedding Model", "Agent Tooling — Tool, Toolkit"],
      },
      {
        id: "langchain-core",
        name: "LangChain-Core",
        tag: "Python / JS",
        color: "border-emerald-600/40 bg-emerald-700/10",
        text: "text-emerald-100",
        desc: "The foundation everything else is built on: the Runnable protocol and LCEL. It changes the least of any package because so much depends on it staying stable.",
        points: ["LCEL — the declarative | composition syntax", "Parallelization, Fallbacks, Tracing built in", "Batching, Streaming, Async, Composition"],
      },
    ],
  },
  {
    id: "protocol",
    label: "Protocol",
    modules: [
      {
        id: "lcel",
        name: "LCEL",
        tag: null,
        color: "border-fuchsia-400/50 bg-fuchsia-500/10",
        text: "text-fuchsia-300",
        desc: "The shared contract every layer above ultimately speaks. Because a Prompt, a Model, a Retriever, and even a whole Chain all implement the same Runnable interface, they're interchangeable — the pipe operator just wires invoke() calls together.",
        points: ["Every component implements invoke/batch/stream", "Enables automatic parallel + async execution", "Is why any block can connect to any other block"],
      },
    ],
  },
];

const SIDEBAR = [
  { label: "Debugging" },
  { label: "Playground" },
  { label: "Evaluation" },
  { label: "Annotation" },
  { label: "Monitoring" },
];

export default function LangChainArchitecture() {
  const [active, setActive] = useState(LAYERS[2].modules[0]);

  return (
    <div className="mb-6">
      <p className="text-sm text-gray-500 mb-4">Click any module below to see what it actually does.</p>
      <div className="flex flex-col lg:flex-row gap-4">
        <div className="flex-1 bg-[#0d0d0d] border border-white/10 rounded-2xl p-4 sm:p-6">
          {LAYERS.map((layer) => (
            <div key={layer.id} className="flex items-start gap-3 mb-3 last:mb-0">
              <div className="hidden sm:flex w-24 shrink-0 text-[0.6875rem] uppercase tracking-wider text-gray-500 font-semibold pt-3 text-right pr-1">
                {layer.label}
              </div>
              <div className="flex-1 flex flex-wrap gap-2">
                {layer.modules.map((m) => {
                  const isActive = active.id === m.id;
                  return (
                    <motion.button
                      key={m.id}
                      onClick={() => setActive(m)}
                      whileHover={{ y: -2 }}
                      whileTap={{ scale: 0.97 }}
                      className={`text-left rounded-xl border px-4 py-3 transition-colors ${m.color} ${
                        isActive ? "ring-2 ring-white/60" : "hover:border-white/40"
                      }`}
                    >
                      <div className="flex items-center gap-2">
                        <span className={`font-bold text-sm ${m.text}`}>{m.name}</span>
                        {m.tag && (
                          <span className="text-[0.5625rem] font-semibold px-1.5 py-0.5 rounded-full bg-black/40 text-gray-400 border border-white/10">
                            {m.tag}
                          </span>
                        )}
                      </div>
                    </motion.button>
                  );
                })}
              </div>
            </div>
          ))}

          <div className="mt-4 pt-4 border-t border-white/10 flex flex-wrap gap-x-6 gap-y-2">
            {SIDEBAR.map((s) => (
              <span key={s.label} className="text-xs text-gray-500 flex items-center gap-1.5">
                <span className="text-emerald-400">✓</span>
                {s.label}
              </span>
            ))}
          </div>
        </div>

        <div className="lg:w-[340px] shrink-0">
          <AnimatePresence mode="wait">
            <motion.div
              key={active.id}
              initial={{ opacity: 0, x: 16 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -16 }}
              transition={{ duration: 0.25 }}
              className={`h-full rounded-2xl border p-5 ${active.color}`}
            >
              <div className={`font-bold text-lg mb-2 ${active.text}`}>{active.name}</div>
              <p className="text-sm text-gray-300 leading-relaxed mb-4">{active.desc}</p>
              <ul className="space-y-1.5">
                {active.points.map((p, i) => (
                  <motion.li
                    key={p}
                    initial={{ opacity: 0, x: 8 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.1 + i * 0.06 }}
                    className="text-xs text-gray-400 flex items-start gap-2"
                  >
                    <span className={`mt-1 h-1 w-1 rounded-full shrink-0 ${active.text.replace("text-", "bg-")}`} />
                    {p}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
}

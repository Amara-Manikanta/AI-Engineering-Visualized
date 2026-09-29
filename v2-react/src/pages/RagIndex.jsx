import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout';
import { BookOpen, Database, Zap, Layers, FileText, Search, Activity, GitBranch, ArrowRight, Sparkles, ClipboardCheck, Rocket } from 'lucide-react';

/* ---------------------------------------------------------------------------
   The four RAG stages — the spine the whole page is organized around.
--------------------------------------------------------------------------- */

const STAGES = [
  {
    id: 'index',
    n: 1,
    name: 'Index',
    sub: 'Runs once, ahead of time',
    blurb:
      'Everything that happens before a user ever asks a question: load the documents, split them into chunks, turn each chunk into a vector, and store it somewhere searchable. Get this wrong and nothing downstream can recover.',
    accent: 'purple',
    icon: <Database size={18} />,
    topics: [
      { title: 'Fundamentals', path: '/rag/fundamentals', icon: <BookOpen size={18} />, desc: 'Why RAG exists, and the four stages end to end.' },
      { title: 'Data Prep', path: '/rag/data-prep', icon: <FileText size={18} />, desc: 'Load, parse, clean, enrich, normalize. The quality ceiling.' },
      { title: 'Chunking', path: '/rag/chunking', icon: <Layers size={18} />, desc: 'Splitting text so each piece is one coherent idea.' },
      { title: 'Embeddings', path: '/rag/embeddings', icon: <Activity size={18} />, desc: 'Turning text into vectors that encode meaning.' },
      { title: 'Vector DBs', path: '/rag/vector-dbs', icon: <Database size={18} />, desc: 'Where the vectors live, and how to query them.' },
      { title: 'Indexing', path: '/rag/indexing', icon: <GitBranch size={18} />, desc: 'HNSW, IVF, and the speed/recall tradeoff.' },
    ],
  },
  {
    id: 'retrieve',
    n: 2,
    name: 'Retrieve',
    sub: 'Runs on every query',
    blurb:
      'Find the chunks that actually answer the question. This is where most RAG systems fail — and where most of the engineering leverage is, because the LLM can only reason over what you hand it.',
    accent: 'blue',
    icon: <Search size={18} />,
    topics: [
      { title: 'Retrieval', path: '/rag/retrieval', icon: <Search size={18} />, desc: 'Similarity search, top-k, and MMR for diversity.' },
      { title: 'Advanced Retrieval', path: '/rag/advanced-retrieval', icon: <Sparkles size={18} />, desc: 'Hybrid search, re-ranking, HyDE, decomposition.', badge: 'Deep dive' },
      { title: 'Contextual Compression', path: '/rag/compression', icon: <Layers size={18} />, desc: 'Strip the padding out of retrieved chunks before generation.' },
    ],
  },
  {
    id: 'generate',
    n: 3,
    name: 'Generate',
    sub: 'Turn context into an answer',
    blurb:
      'Assemble the retrieved chunks into a prompt and let the model write a grounded, citable answer — while refusing to invent anything the context does not support.',
    accent: 'amber',
    icon: <Zap size={18} />,
    topics: [
      { title: 'Generation', path: '/rag/generation', icon: <Zap size={18} />, desc: 'Prompt construction, grounding, and citations.' },
    ],
  },
  {
    id: 'ship',
    n: 4,
    name: 'Measure & Ship',
    sub: 'Make it real',
    blurb:
      'The difference between a demo and a product. Prove the system works with numbers rather than anecdotes, then deploy it in a way that stays fast, cheap, and secure.',
    accent: 'emerald',
    icon: <Rocket size={18} />,
    topics: [
      { title: 'Evaluation', path: '/rag/evaluation', icon: <ClipboardCheck size={18} />, desc: 'Precision, recall, NDCG, RAGAS, and the 7 failure points.', badge: 'Interactive' },
      { title: 'Development', path: '/rag/development', icon: <Rocket size={18} />, desc: 'Frameworks, pipeline code, and the production checklist.' },
      { title: 'RAG vs Fine-tuning', path: '/rag/vs-fine-tuning', icon: <GitBranch size={18} />, desc: 'Which problem you actually have — walk the decision tree.' },
    ],
  },
];

const ACCENT = {
  purple: {
    text: 'text-purple-400',
    border: 'border-purple-500/40',
    bg: 'bg-purple-500/10',
    ring: 'ring-purple-500/50',
    dot: 'bg-purple-500',
    hover: 'hover:border-purple-500/50',
  },
  blue: {
    text: 'text-blue-400',
    border: 'border-blue-500/40',
    bg: 'bg-blue-500/10',
    ring: 'ring-blue-500/50',
    dot: 'bg-blue-500',
    hover: 'hover:border-blue-500/50',
  },
  amber: {
    text: 'text-amber-400',
    border: 'border-amber-500/40',
    bg: 'bg-amber-500/10',
    ring: 'ring-amber-500/50',
    dot: 'bg-amber-500',
    hover: 'hover:border-amber-500/50',
  },
  emerald: {
    text: 'text-emerald-400',
    border: 'border-emerald-500/40',
    bg: 'bg-emerald-500/10',
    ring: 'ring-emerald-500/50',
    dot: 'bg-emerald-500',
    hover: 'hover:border-emerald-500/50',
  },
};

/* ---------------------------------------------------------------------------
   Hero: the pipeline itself, with a packet animating through it
--------------------------------------------------------------------------- */

function PipelineHero({ active, setActive }) {
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6 relative overflow-hidden">
      {/* subtle grid backdrop */}
      <div className="absolute inset-0 bg-[linear-gradient(to_right,#80808010_1px,transparent_1px),linear-gradient(to_bottom,#80808010_1px,transparent_1px)] bg-[size:24px_24px] pointer-events-none" />

      <div className="relative">
        <div className="flex items-stretch gap-2 overflow-x-auto pb-1">
          {STAGES.map((s, i) => {
            const a = ACCENT[s.accent];
            const isActive = active.id === s.id;
            return (
              <React.Fragment key={s.id}>
                <motion.button
                  onClick={() => setActive(s)}
                  whileHover={{ y: -3 }}
                  initial={{ opacity: 0, y: 14 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: i * 0.09 }}
                  className={`flex-1 min-w-[140px] rounded-xl border p-4 text-left transition-all ${
                    isActive ? `${a.bg} ${a.border} ring-2 ${a.ring}` : 'bg-white/5 border-white/10 hover:border-white/30'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-2">
                    <span
                      className={`w-6 h-6 rounded-full flex items-center justify-center text-[0.6875rem] font-bold shrink-0 ${
                        isActive ? `${a.dot} text-black` : 'bg-white/10 text-gray-400'
                      }`}
                    >
                      {s.n}
                    </span>
                    <span className={isActive ? a.text : 'text-gray-500'}>{s.icon}</span>
                  </div>
                  <div className={`font-bold text-sm mb-0.5 ${isActive ? 'text-white' : 'text-gray-300'}`}>
                    {s.name}
                  </div>
                  <div className="text-[0.625rem] text-gray-500 leading-snug">{s.sub}</div>
                  <div className="text-[0.625rem] text-gray-600 mt-2">
                    {s.topics.length} {s.topics.length === 1 ? 'guide' : 'guides'}
                  </div>
                </motion.button>

                {i < STAGES.length - 1 && (
                  <div className="flex items-center shrink-0 px-0.5">
                    <div className="relative w-6 h-0.5 bg-white/10 rounded-full overflow-hidden">
                      <motion.div
                        className="absolute inset-y-0 w-2 bg-white/60 rounded-full"
                        animate={{ left: ['-20%', '110%'] }}
                        transition={{ duration: 1.8, repeat: Infinity, ease: 'linear', delay: i * 0.6 }}
                      />
                    </div>
                  </div>
                )}
              </React.Fragment>
            );
          })}
        </div>

          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.2 }}
            className={`mt-4 rounded-xl border p-4 ${ACCENT[active.accent].bg} ${ACCENT[active.accent].border}`}
          >
            <p className="text-sm text-gray-300 leading-relaxed m-0">{active.blurb}</p>
          </motion.div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Advanced architectures
--------------------------------------------------------------------------- */

const ARCHITECTURES = [
  { title: 'Types of RAG', path: '/rag/types-of-rag', desc: 'The full taxonomy — start here to see how the variants relate.', icon: '🗺️', featured: true },
  { title: 'Naive RAG', path: '/rag/naive-rag', desc: 'The baseline: embed, search, stuff into a prompt.', icon: '🌱' },
  { title: 'Advanced RAG', path: '/rag/advanced-rag', desc: 'Pre- and post-retrieval optimization around the same core loop.', icon: '⚡' },
  { title: 'Hybrid RAG', path: '/rag/hybrid-rag', desc: 'Dense vectors plus sparse keywords, fused with RRF.', icon: '🔀' },
  { title: 'Graph RAG', path: '/rag/graph-rag', desc: 'Build a knowledge graph and retrieve subgraphs, not chunks.', icon: '🕸️' },
  { title: 'Agentic RAG', path: '/rag/agentic-rag', desc: 'An agent decides what to search, evaluates, and loops.', icon: '🤖' },
  { title: 'Corrective RAG', path: '/rag/crag', desc: 'Grade retrieved docs, fall back to web search when they are weak.', icon: '🩹' },
  { title: 'Self-RAG', path: '/rag/self-rag', desc: 'The model decides when to retrieve and critiques its own output.', icon: '🪞' },
  { title: 'Multimodal RAG', path: '/rag/multimodal-rag', desc: 'Retrieve across images, tables, and audio — not just text.', icon: '🖼️' },
];

/* ------------------------------------------------------------------------ */

export default function RagIndex() {
  const [activeStage, setActiveStage] = useState(STAGES[0]);

  const toc = [
    { label: 'The Four Stages', hash: 'stages' },
    { label: 'Learning Path', hash: 'path' },
    { label: 'Advanced Architectures', hash: 'architectures' },
  ];

  return (
    <GuideLayout
      title="RAG from Scratch"
      intro="Index → Retrieve → Generate → Measure. A complete, visual walkthrough of Retrieval-Augmented Generation."
      toc={toc}
    >
      <div className="space-y-16">
        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          id="stages"
          className="scroll-mt-24"
        >
          <p className="text-gray-300 leading-relaxed mb-6 max-w-3xl">
            An LLM only knows what it was trained on. RAG fixes that by looking things up in <em>your</em> data at
            question time and handing the model the relevant passages before it answers — which is what makes answers
            current, private, and citable.
          </p>

          <PipelineHero active={activeStage} setActive={setActiveStage} />

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
            {[
              { k: 'Grounded', v: 'Answers cite real documents instead of model memory.' },
              { k: 'Current', v: 'Update the index, not the model weights.' },
              { k: 'Private', v: 'Your data stays in your vector store.' },
            ].map((c) => (
              <div key={c.k} className="p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="text-sm font-semibold text-white mb-1">{c.k}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{c.v}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          id="path"
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-white mb-2">Learning Path</h2>
          <p className="text-gray-400 leading-relaxed mb-8 max-w-3xl">
            Eleven guides, ordered the way the pipeline actually runs. If you are new to RAG, read straight down.
          </p>

          <div className="space-y-10">
            {STAGES.map((stage) => {
              const a = ACCENT[stage.accent];
              return (
                <div key={stage.id} className="relative">
                  {/* Stage header */}
                  <div className="flex items-center gap-3 mb-4">
                    <span
                      className={`w-8 h-8 rounded-full ${a.dot} text-black flex items-center justify-center font-bold text-sm shrink-0`}
                    >
                      {stage.n}
                    </span>
                    <div>
                      <h3 className={`font-bold text-lg leading-tight ${a.text}`}>{stage.name}</h3>
                      <div className="text-[0.6875rem] text-gray-500">{stage.sub}</div>
                    </div>
                    <div className={`flex-1 h-px ${a.bg}`} />
                  </div>

                  {/* Topic cards */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 md:pl-11">
                    {stage.topics.map((t, i) => (
                      <motion.div
                        key={t.path}
                        initial={{ opacity: 0, y: 14 }}
                        whileInView={{ opacity: 1, y: 0 }}
                        viewport={{ once: true }}
                        transition={{ delay: i * 0.05 }}
                        whileHover={{ y: -4 }}
                      >
                        <Link
                          to={t.path}
                          className={`group block h-full p-5 rounded-xl border border-white/10 bg-white/5 ${a.hover} hover:bg-white/[0.07] transition-colors`}
                        >
                          <div className="flex items-start justify-between gap-2 mb-3">
                            <span className={`p-2 rounded-lg bg-black/40 border border-white/10 ${a.text}`}>
                              {t.icon}
                            </span>
                            {t.badge && (
                              <span
                                className={`text-[0.5625rem] font-bold uppercase tracking-wide px-2 py-1 rounded-full border ${a.border} ${a.bg} ${a.text}`}
                              >
                                {t.badge}
                              </span>
                            )}
                          </div>
                          <h4 className="font-bold text-white mb-1.5">{t.title}</h4>
                          <p className="text-xs text-gray-400 leading-relaxed mb-4">{t.desc}</p>
                          <div className={`flex items-center text-xs font-medium mt-auto ${a.text}`}>
                            Read
                            <ArrowRight
                              size={13}
                              className="ml-1 group-hover:translate-x-1 transition-transform"
                            />
                          </div>
                        </Link>
                      </motion.div>
                    ))}
                  </div>
                </div>
              );
            })}
          </div>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-80px' }}
          id="architectures"
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-white mb-2">Advanced Architectures</h2>
          <p className="text-gray-400 leading-relaxed mb-6 max-w-3xl">
            Once the basic pipeline works, these are the named variants you will run into. Each one changes the shape
            of the retrieval loop rather than just tuning it.
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {ARCHITECTURES.map((arch, i) => (
              <motion.div
                key={arch.path}
                initial={{ opacity: 0, y: 14 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.04 }}
                whileHover={{ y: -4 }}
              >
                <Link
                  to={arch.path}
                  className={`group block h-full p-5 rounded-xl border transition-colors ${
                    arch.featured
                      ? 'border-indigo-500/40 bg-indigo-500/10 hover:border-indigo-500/60'
                      : 'border-white/10 bg-white/5 hover:border-white/30 hover:bg-white/[0.07]'
                  }`}
                >
                  <div className="flex items-center gap-2.5 mb-2">
                    <span className="text-xl">{arch.icon}</span>
                    <h4 className="font-bold text-white text-sm">{arch.title}</h4>
                    {arch.featured && (
                      <span className="text-[0.5625rem] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full border border-indigo-500/40 text-indigo-300 ml-auto">
                        Start
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-400 leading-relaxed m-0">{arch.desc}</p>
                </Link>
              </motion.div>
            ))}
          </div>

          <div className="mt-8 p-5 rounded-xl border border-white/10 bg-white/5">
            <p className="text-sm text-gray-400 leading-relaxed m-0">
              <strong className="text-white">Not sure where to start?</strong> Read{' '}
              <Link to="/rag/fundamentals" className="text-blue-400 hover:underline">
                Fundamentals
              </Link>{' '}
              for the whole picture, then{' '}
              <Link to="/rag/chunking" className="text-blue-400 hover:underline">
                Chunking
              </Link>{' '}
              and{' '}
              <Link to="/rag/advanced-retrieval" className="text-blue-400 hover:underline">
                Advanced Retrieval
              </Link>{' '}
              — those two account for most of the quality difference between a demo and something people trust.
            </p>
          </div>
        </motion.section>
      </div>
    </GuideLayout>
  );
}

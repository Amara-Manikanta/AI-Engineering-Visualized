import React from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';
import AdvancedFlowchart from '../components/AdvancedFlowchart';
import * as charts from '../data/flowcharts';

const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 50 } },
};

const COMPLEXITY = {
  Concept: 'border-gray-500/40 bg-gray-500/10 text-gray-300',
  Baseline: 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300',
  Intermediate: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
  Advanced: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
};

const TYPES = [
  {
    n: 1,
    id: 'vector-vs-vectorless',
    title: 'Vector vs Vectorless RAG',
    complexity: 'Concept',
    chart: charts.vectorVsVectorless,
    how: 'Before you pick a RAG architecture, you pick how retrieval finds documents at all. Vector retrieval embeds text into a dense space where "dogs" sits near "puppies", matching on meaning. Vectorless retrieval skips embeddings and matches on exact tokens (BM25) or structured queries (SQL) — cheaper, faster, and exact, but blind to synonyms and paraphrase.',
    bestFor: ['Deciding your retrieval backbone', 'Understanding semantic vs lexical'],
    watchOut: ['Vector misses exact IDs/codes', 'Vectorless misses paraphrase'],
    keyIdea: 'Most production systems end up using both — see Hybrid RAG.',
  },
  {
    n: 2,
    id: 'vectorless-rag',
    title: 'Vectorless RAG',
    complexity: 'Baseline',
    chart: charts.vectorlessRag,
    how: 'Retrieval with no embedding model at all. The query hits a lexical index like Elasticsearch/BM25 or a SQL database, and the matching rows are passed to the LLM. With no vector math it is extremely fast, cheap, and trivially explainable — you can see exactly why a document matched.',
    bestFor: ['Exact-match domains: logs, code, IDs, SKUs', 'High-throughput or low-budget systems'],
    watchOut: ['No semantic understanding', 'Synonyms & paraphrase slip through'],
    keyIdea: 'Lexical search (BM25) is a surprisingly strong baseline.',
  },
  {
    n: 3,
    id: 'naive-rag',
    title: 'Naive RAG',
    complexity: 'Baseline',
    chart: charts.naiveRag,
    how: 'The canonical pattern everyone starts with: embed the query, run one cosine-similarity search, stuff the top-k chunks into the prompt, and generate. No query preprocessing, no re-ranking, no branching. It is the right first build — and the thing every other architecture here improves upon.',
    bestFor: ['Prototypes and first versions', 'Clean, homogeneous document sets'],
    watchOut: ['One bad retrieval sinks the answer', 'No recovery path when retrieval fails'],
    keyIdea: 'Ship this first, measure it, then add complexity only where the numbers demand.',
  },
  {
    n: 4,
    id: 'advanced-rag',
    title: 'Advanced RAG',
    complexity: 'Intermediate',
    chart: charts.advancedRag,
    how: 'Naive RAG with quality gates on both ends of retrieval. Pre-retrieval, the query is rewritten, expanded, or decomposed so it searches for the right thing. Post-retrieval, a re-ranker re-scores candidates so only genuinely relevant chunks reach the LLM. Same core loop, far higher precision.',
    bestFor: ['Most production systems', 'Multi-turn chat (needs query rewriting)'],
    watchOut: ['Each stage adds latency and cost', 'More moving parts to monitor'],
    keyIdea: 'Pre-retrieval fixes the query; post-retrieval fixes the ranking.',
  },
  {
    n: 5,
    id: 'hybrid-rag',
    title: 'Hybrid RAG',
    complexity: 'Intermediate',
    chart: charts.hybridRag,
    how: 'Runs dense vector search and sparse keyword search in parallel, then fuses the two ranked lists with Reciprocal Rank Fusion. It captures semantic matches ("sign-in failure" ≈ "login error") and exact-token matches (error code "5012") in one retrieval — covering the blind spot of each method alone.',
    bestFor: ['Technical docs, catalogs, codes/IDs', 'The highest-value upgrade over Naive RAG'],
    watchOut: ['Two indexes to maintain', 'Fusion weighting needs tuning'],
    keyIdea: 'RRF merges rankings without needing to normalize scores.',
  },
  {
    n: 6,
    id: 'agentic-rag',
    title: 'Agentic RAG',
    complexity: 'Advanced',
    chart: charts.agenticRag,
    how: 'Retrieval stops being a fixed step and becomes a decision. An LLM agent inspects the question, decides which sources to query (vector store, web, SQL, an API), reads the results, and loops — reformulating or searching again until it judges it has enough to answer.',
    bestFor: ['Complex, multi-hop questions', 'Multiple heterogeneous data sources'],
    watchOut: ['Unbounded loops = latency/cost spikes', 'Harder to debug and evaluate'],
    keyIdea: 'The agent decides what and where to retrieve, not just how.',
  },
  {
    n: 7,
    id: 'graph-rag',
    title: 'GraphRAG',
    complexity: 'Advanced',
    chart: charts.graphRag,
    how: 'Instead of retrieving isolated chunks, GraphRAG first extracts entities and relationships into a knowledge graph. At query time it retrieves connected subgraphs, so the model sees how facts relate — enabling answers that require synthesizing across many documents ("how are these three people connected?") that chunk retrieval cannot assemble.',
    bestFor: ['Multi-hop reasoning over relationships', 'Global questions spanning a whole corpus'],
    watchOut: ['Expensive graph construction', 'Overkill for simple lookup Q&A'],
    keyIdea: 'The answer lives in the edges between facts, not the facts alone.',
  },
  {
    n: 8,
    id: 'crag',
    title: 'Corrective RAG (CRAG)',
    complexity: 'Advanced',
    chart: charts.crag,
    how: 'CRAG adds a lightweight grader that scores retrieved documents before the LLM trusts them. If the docs are clearly relevant, it proceeds; if they are ambiguous or wrong, it corrects course — refining the query or falling back to web search — rather than confidently answering from bad context.',
    bestFor: ['Reducing hallucination from weak retrieval', 'Open-domain questions with patchy coverage'],
    watchOut: ['Grader quality gates the whole system', 'Web fallback adds latency'],
    keyIdea: 'Grade retrieval first; only answer once the context earns trust.',
  },
  {
    n: 9,
    id: 'multimodal-rag',
    title: 'Multimodal RAG',
    complexity: 'Advanced',
    chart: charts.multimodalRag,
    how: 'Extends retrieval beyond text to images, tables, charts, and audio. Using models like CLIP or ColPali, every modality is embedded into one shared vector space, so a text query can retrieve a relevant diagram and a screenshot can retrieve related docs. A vision-language model then reasons over the mixed context.',
    bestFor: ['Docs where meaning lives in figures/tables', 'Catalogs, slide decks, scanned PDFs'],
    watchOut: ['Needs a vision-capable generator', 'Cross-modal ranking is still immature'],
    keyIdea: 'One shared embedding space for every modality.',
  },
  {
    n: 10,
    id: 'self-rag',
    title: 'Self-RAG',
    complexity: 'Advanced',
    chart: charts.selfRag,
    how: 'The model controls its own retrieval through special reflection tokens. Mid-generation it decides whether retrieval is even needed, emits a critique of whether retrieved passages are relevant and supported, and re-queries if not. Retrieval and self-critique become part of the generation loop rather than fixed pre-steps.',
    bestFor: ['Mixing parametric knowledge with retrieval', 'Skipping needless retrievals on easy queries'],
    watchOut: ['Requires a specially fine-tuned model', 'Complex to train and reproduce'],
    keyIdea: 'The model decides when to retrieve and whether to trust what it got.',
  },
];

function MiniCard({ label, tone, items, text }) {
  const tones = {
    emerald: 'border-emerald-500/20 bg-emerald-500/[0.07] text-emerald-400',
    rose: 'border-rose-500/20 bg-rose-500/[0.07] text-rose-400',
    blue: 'border-blue-500/20 bg-blue-500/[0.07] text-blue-400',
  };
  return (
    <div className={`rounded-xl border p-4 ${tones[tone]}`}>
      <div className="text-[0.625rem] uppercase tracking-wide font-bold mb-2">{label}</div>
      {items ? (
        <ul className="space-y-1.5">
          {items.map((it) => (
            <li key={it} className="text-xs text-gray-300 leading-relaxed flex gap-2">
              <span className="opacity-60 shrink-0">•</span>
              {it}
            </li>
          ))}
        </ul>
      ) : (
        <p className="text-xs text-gray-300 leading-relaxed m-0">{text}</p>
      )}
    </div>
  );
}

export default function RagTypes() {
  const toc = TYPES.map((t) => ({ label: `${t.n}. ${t.title}`, hash: t.id }));

  return (
    <GuideLayout
      title="Types of RAG"
      intro="The 10 most important RAG architectures — how each one works, when to reach for it, and what it costs you."
      toc={toc}
    >
      <motion.section
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="mb-12"
      >
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-4">
          These are not ten unrelated systems — they are a progression. Each one adds a specific capability to the
          baseline in exchange for complexity, latency, or cost. Read them roughly top to bottom: the first few are
          where you start, the later ones are targeted answers to specific failures you hit as your corpus and
          questions get harder.
        </p>
        <div className="flex flex-wrap gap-2">
          {Object.entries(COMPLEXITY).map(([label, tone]) => (
            <span key={label} className={`text-[0.625rem] font-bold uppercase tracking-wide px-2.5 py-1 rounded-full border ${tone}`}>
              {label}
            </span>
          ))}
        </div>
      </motion.section>

      <motion.div
        initial="hidden"
        animate="visible"
        variants={{ visible: { transition: { staggerChildren: 0.06 } } }}
        className="space-y-16"
      >
        {TYPES.map((t) => (
          <motion.section key={t.id} variants={itemVariants} id={t.id} className="scroll-mt-24">
            <div className="flex items-center gap-3 mb-3 flex-wrap">
              <span className="w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-sm shrink-0">
                {t.n}
              </span>
              <h3 className="text-xl font-bold text-white">{t.title}</h3>
              <span className={`text-[0.625rem] font-bold uppercase tracking-wide px-2 py-1 rounded-full border ${COMPLEXITY[t.complexity]}`}>
                {t.complexity}
              </span>
            </div>

            <p className="text-gray-300 leading-relaxed mb-4 max-w-3xl">{t.how}</p>

            <AdvancedFlowchart nodes={t.chart.nodes} edges={t.chart.edges} currentStep={10} />

            <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
              <MiniCard label="Best for" tone="emerald" items={t.bestFor} />
              <MiniCard label="Watch out for" tone="rose" items={t.watchOut} />
              <MiniCard label="Key idea" tone="blue" text={t.keyIdea} />
            </div>
          </motion.section>
        ))}
      </motion.div>

      <motion.section
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        className="mt-16 p-6 rounded-2xl border border-white/10 bg-white/5"
      >
        <h3 className="text-lg font-bold text-white mb-3">How to choose</h3>
        <p className="text-sm text-gray-400 leading-relaxed m-0">
          Start with <strong className="text-gray-200">Naive RAG</strong> and measure it. Add{' '}
          <strong className="text-gray-200">Hybrid + re-ranking</strong> (Advanced RAG) the moment retrieval returns
          near-misses — that combination fixes most real-world quality problems. Reach for{' '}
          <strong className="text-gray-200">Agentic, Graph, CRAG, or Self-RAG</strong> only when a specific failure
          demands it: multi-source questions, relationship reasoning, weak-retrieval hallucination, or wasted retrievals
          respectively. Every step up the ladder buys a capability and costs you latency, money, and things that can
          break — so let your{' '}
          <a href="#/rag/evaluation" className="text-blue-400 hover:underline">
            evaluation numbers
          </a>{' '}
          justify each one.
        </p>
      </motion.section>
    </GuideLayout>
  );
}

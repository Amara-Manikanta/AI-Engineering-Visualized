import React, { useState, useMemo } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';

/* ---------------------------------------------------------------------------
   Interactive retrieval-metrics calculator.
   Toggle which retrieved documents are actually relevant and watch every
   metric recompute — the fastest way to build intuition for how they differ.
--------------------------------------------------------------------------- */

const INITIAL = [
  { id: 'doc_93', title: 'Refund policy — Enterprise plan', relevant: false },
  { id: 'doc_41', title: 'Pricing overview (marketing page)', relevant: false },
  { id: 'doc_57', title: 'How to request a refund', relevant: true },
  { id: 'doc_12', title: 'Terms of service, section 4', relevant: false },
  { id: 'doc_08', title: 'Refund processing times', relevant: true },
  { id: 'doc_77', title: 'Contact support', relevant: false },
];

// Total relevant docs that exist in the whole corpus (not just what we retrieved).
const TOTAL_RELEVANT_IN_CORPUS = 3;

function MetricsPlayground() {
  const [docs, setDocs] = useState(INITIAL);
  const [k, setK] = useState(5);

  const toggle = (id) =>
    setDocs((d) => d.map((doc) => (doc.id === id ? { ...doc, relevant: !doc.relevant } : doc)));

  const m = useMemo(() => {
    const topK = docs.slice(0, k);
    const relInTopK = topK.filter((d) => d.relevant).length;

    const precision = k > 0 ? relInTopK / k : 0;
    const recall = TOTAL_RELEVANT_IN_CORPUS > 0 ? relInTopK / TOTAL_RELEVANT_IN_CORPUS : 0;

    const firstRelIdx = docs.findIndex((d) => d.relevant);
    const mrr = firstRelIdx === -1 ? 0 : 1 / (firstRelIdx + 1);

    // DCG@k with binary relevance: sum(rel_i / log2(i+1))
    const dcg = topK.reduce((acc, d, i) => acc + (d.relevant ? 1 / Math.log2(i + 2) : 0), 0);
    // IDCG: the same relevant docs, ideally ordered at the very top
    const idealCount = Math.min(relInTopK, k);
    let idcg = 0;
    for (let i = 0; i < idealCount; i++) idcg += 1 / Math.log2(i + 2);
    const ndcg = idcg > 0 ? dcg / idcg : 0;

    return { precision, recall, mrr, ndcg, relInTopK, firstRelRank: firstRelIdx + 1, dcg, idcg };
  }, [docs, k]);

  const Metric = ({ label, value, formula, explain, tone }) => (
    <div className={`p-4 rounded-xl border ${tone}`}>
      <div className="flex items-baseline justify-between mb-1">
        <span className="text-sm font-semibold text-white">{label}</span>
        <motion.span
          key={value.toFixed(3)}
          initial={{ scale: 1.25, opacity: 0.4 }}
          animate={{ scale: 1, opacity: 1 }}
          className="text-xl font-bold font-mono text-white"
        >
          {value.toFixed(2)}
        </motion.span>
      </div>
      <div className="h-1.5 rounded-full bg-black/40 overflow-hidden mb-2.5">
        <motion.div
          className="h-full bg-current opacity-70"
          animate={{ width: `${Math.min(value, 1) * 100}%` }}
          transition={{ type: 'spring', stiffness: 120, damping: 18 }}
        />
      </div>
      <div className="text-[0.625rem] font-mono text-gray-400 mb-1.5">{formula}</div>
      <div className="text-[0.6875rem] text-gray-400 leading-relaxed">{explain}</div>
    </div>
  );

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-2">
        <div>
          <div className="text-sm font-semibold text-white">Query: "how do refunds work?"</div>
          <div className="text-xs text-gray-500">
            Click any result to flip whether it's actually relevant.
          </div>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-xs text-gray-400">k =</span>
          {[3, 5, 6].map((v) => (
            <button
              key={v}
              onClick={() => setK(v)}
              className={`px-2.5 py-1 rounded text-xs font-mono border transition-colors ${
                k === v
                  ? 'bg-blue-500/20 border-blue-500/50 text-blue-200'
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
              }`}
            >
              {v}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mt-5">
        {/* Ranked list */}
        <div>
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-2">Retrieved, in rank order</div>
          <div className="space-y-1.5">
            {docs.map((d, i) => {
              const inTopK = i < k;
              return (
                <button
                  key={d.id}
                  onClick={() => toggle(d.id)}
                  className={`w-full flex items-center gap-3 px-3 py-2.5 rounded-lg border text-left transition-all ${
                    d.relevant
                      ? 'bg-emerald-500/15 border-emerald-500/40'
                      : 'bg-white/5 border-white/10 hover:border-white/25'
                  } ${inTopK ? '' : 'opacity-35'}`}
                >
                  <span className="text-[0.625rem] font-mono text-gray-500 w-4 shrink-0">{i + 1}</span>
                  <span className={`text-sm shrink-0 ${d.relevant ? 'text-emerald-400' : 'text-gray-600'}`}>
                    {d.relevant ? '✓' : '○'}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className={`block text-xs truncate ${d.relevant ? 'text-emerald-100' : 'text-gray-400'}`}>
                      {d.title}
                    </span>
                    <span className="block text-[0.625rem] font-mono text-gray-600">{d.id}</span>
                  </span>
                  {!inTopK && (
                    <span className="text-[0.5625rem] uppercase tracking-wide text-gray-600 shrink-0">below k</span>
                  )}
                </button>
              );
            })}
          </div>
          <div className="mt-3 text-[0.6875rem] text-gray-500 leading-relaxed">
            Assume <strong className="text-gray-300">{TOTAL_RELEVANT_IN_CORPUS} relevant documents</strong> exist in the
            corpus overall. That number is what makes recall computable — and why you need a labelled dataset to
            measure it honestly.
          </div>
        </div>

        {/* Metrics */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 content-start">
          <Metric
            label={`Precision@${k}`}
            value={m.precision}
            formula={`${m.relInTopK} relevant / ${k} retrieved`}
            explain="Of what you showed the LLM, how much was signal? Low precision means you're padding the context with noise."
            tone="border-blue-500/30 bg-blue-500/10 text-blue-400"
          />
          <Metric
            label={`Recall@${k}`}
            value={m.recall}
            formula={`${m.relInTopK} found / ${TOTAL_RELEVANT_IN_CORPUS} that exist`}
            explain="Of everything you needed, how much did you find? Low recall is fatal — the answer never reaches the model."
            tone="border-emerald-500/30 bg-emerald-500/10 text-emerald-400"
          />
          <Metric
            label="MRR"
            value={m.mrr}
            formula={m.firstRelRank > 0 ? `1 / ${m.firstRelRank} (first hit's rank)` : 'no relevant doc found'}
            explain="How high was the first good result? Rewards getting one right answer to the very top — useful for single-answer lookups."
            tone="border-amber-500/30 bg-amber-500/10 text-amber-400"
          />
          <Metric
            label={`NDCG@${k}`}
            value={m.ndcg}
            formula={`DCG ${m.dcg.toFixed(2)} / IDCG ${m.idcg.toFixed(2)}`}
            explain="Quality of the whole ordering, discounting hits further down the list. The most complete single number."
            tone="border-purple-500/30 bg-purple-500/10 text-purple-400"
          />
        </div>
      </div>

      <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
        <div className="text-xs font-semibold text-white mb-1.5">Try this</div>
        <p className="text-[0.6875rem] text-gray-400 leading-relaxed m-0">
          Mark only <span className="font-mono text-gray-300">doc_77</span> (rank 6) as relevant, then set k=5.
          Precision and recall both collapse to zero even though the retriever <em>did</em> surface the right document —
          it just ranked it one position too low. That single scenario is why you tune <em>k</em> and why re-ranking
          exists.
        </p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   RAGAS triangle: which two of (question, context, answer) each metric compares
--------------------------------------------------------------------------- */

const RAGAS = [
  {
    id: 'faithfulness',
    name: 'Faithfulness',
    edge: 'answer-context',
    color: '#f43f5e',
    tone: 'border-rose-500/30 bg-rose-500/10',
    text: 'text-rose-400',
    q: 'Is every claim in the answer supported by the retrieved context?',
    detail:
      'The answer is decomposed into individual factual claims, and each one is checked against the context. Score = supported claims / total claims. This is your direct hallucination measure — a faithfulness of 0.6 means 40% of what your system asserted was invented.',
    fix: 'Low faithfulness → tighten the prompt ("answer only from the context, say I don\'t know otherwise"), or lower the temperature.',
  },
  {
    id: 'answer-relevancy',
    name: 'Answer Relevancy',
    edge: 'answer-question',
    color: '#3b82f6',
    tone: 'border-blue-500/30 bg-blue-500/10',
    text: 'text-blue-400',
    q: 'Does the answer actually address what was asked?',
    detail:
      'An LLM generates several questions that the answer *would* be a good response to, embeds them, and compares them to the real question. An answer can be perfectly faithful to the context and still fail here — by being evasive, padded with caveats, or answering a subtly different question.',
    fix: 'Low relevancy → the model is hedging or rambling. Constrain the output format and ask for a direct answer first.',
  },
  {
    id: 'context-precision',
    name: 'Context Precision',
    edge: 'question-context',
    color: '#a855f7',
    tone: 'border-purple-500/30 bg-purple-500/10',
    text: 'text-purple-400',
    q: 'Are the relevant chunks ranked at the top?',
    detail:
      'Checks whether the useful chunks appear before the useless ones. Low precision means you are burning context window — and money — on noise, and risking the model latching onto an irrelevant passage.',
    fix: 'Low precision → add a re-ranker, or reduce k.',
  },
  {
    id: 'context-recall',
    name: 'Context Recall',
    edge: 'question-context',
    color: '#10b981',
    tone: 'border-emerald-500/30 bg-emerald-500/10',
    text: 'text-emerald-400',
    q: 'Did retrieval find everything needed to answer?',
    detail:
      'Each claim in the ground-truth answer is checked for whether it is present in the retrieved context. This is the one metric that requires labelled ground truth — and the one that catches the most damaging failure, where the answer simply is not there.',
    fix: 'Low recall → fix chunking, switch to hybrid search, or raise k. No prompt change can save you here.',
  },
];

function RagasTriangle() {
  const [active, setActive] = useState(RAGAS[0]);

  // Triangle vertex coordinates in the 320x240 viewBox
  const P = { question: [160, 30], context: [30, 205], answer: [290, 205] };
  const edgeFor = (m) => m.edge.split('-');

  const isEdgeActive = (a, b) => {
    const [x, y] = edgeFor(active);
    return (x === a && y === b) || (x === b && y === a);
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 items-start">
      <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
        <svg viewBox="0 0 320 240" className="w-full max-w-[340px] mx-auto">
          {/* Edges */}
          {[
            ['question', 'context'],
            ['question', 'answer'],
            ['context', 'answer'],
          ].map(([a, b]) => {
            const on = isEdgeActive(a, b);
            return (
              <motion.line
                key={`${a}-${b}`}
                x1={P[a][0]}
                y1={P[a][1]}
                x2={P[b][0]}
                y2={P[b][1]}
                stroke={on ? active.color : 'rgba(255,255,255,0.14)'}
                strokeWidth={on ? 3 : 1.5}
                animate={{ opacity: on ? 1 : 0.5 }}
              />
            );
          })}

          {/* Vertices */}
          {Object.entries(P).map(([key, [x, y]]) => {
            const on = edgeFor(active).includes(key);
            return (
              <g key={key}>
                <motion.circle
                  cx={x}
                  cy={y}
                  r={on ? 30 : 26}
                  fill={on ? active.color : '#1a1a1a'}
                  fillOpacity={on ? 0.22 : 1}
                  stroke={on ? active.color : 'rgba(255,255,255,0.2)'}
                  strokeWidth={on ? 2.5 : 1.5}
                  animate={{ r: on ? 30 : 26 }}
                />
                <text
                  x={x}
                  y={y + 4}
                  textAnchor="middle"
                  className="text-[0.6875rem] font-semibold"
                  fill={on ? '#fff' : '#8b8b8b'}
                >
                  {key === 'question' ? 'Question' : key === 'context' ? 'Context' : 'Answer'}
                </text>
              </g>
            );
          })}
        </svg>
        <p className="text-[0.6875rem] text-gray-500 text-center mt-3 mb-0 leading-relaxed">
          Every RAGAS metric measures the relationship between <strong className="text-gray-300">two</strong> of these
          three. That's the whole framework.
        </p>
      </div>

      <div>
        <div className="flex flex-wrap gap-2 mb-4">
          {RAGAS.map((r) => (
            <button
              key={r.id}
              onClick={() => setActive(r)}
              className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-all ${
                active.id === r.id
                  ? `${r.tone} ${r.text} ring-2 ring-white/40`
                  : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
              }`}
            >
              {r.name}
            </button>
          ))}
        </div>

        <AnimatePresence mode="wait">
          <motion.div
            key={active.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.22 }}
            className={`rounded-xl border p-5 ${active.tone}`}
          >
            <div className={`font-bold mb-1 ${active.text}`}>{active.name}</div>
            <div className="text-sm text-gray-200 italic mb-3">"{active.q}"</div>
            <p className="text-xs text-gray-300 leading-relaxed mb-3">{active.detail}</p>
            <div className="p-3 rounded-lg bg-black/30 border border-white/10">
              <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">If the score is low</div>
              <div className="text-xs text-gray-300 leading-relaxed">{active.fix}</div>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   The seven failure points, positioned along the pipeline where they occur
--------------------------------------------------------------------------- */

const FAILURES = [
  { n: 1, stage: 'Ingest', name: 'Missing content', desc: 'The answer was never in the corpus. No retrieval technique can fix this — the fix is content, not code.', fix: 'Audit coverage against real user questions.' },
  { n: 2, stage: 'Retrieve', name: 'Missed the top-k cutoff', desc: 'The right document was retrieved but ranked below your cutoff, so it was discarded before the LLM ever saw it.', fix: 'Add re-ranking, or raise k.' },
  { n: 3, stage: 'Retrieve', name: 'Not in context', desc: 'Too many chunks were retrieved to fit the context window, and consolidation dropped the important one.', fix: 'Re-rank first, then truncate.' },
  { n: 4, stage: 'Generate', name: 'Not extracted', desc: 'The answer was present in the context, but the model failed to pull it out — usually because of surrounding noise or contradictory passages.', fix: 'Reduce k, improve precision.' },
  { n: 5, stage: 'Generate', name: 'Wrong format', desc: 'You asked for a table or JSON and got prose. Structurally wrong even when factually right.', fix: 'Structured outputs or tool schemas.' },
  { n: 6, stage: 'Generate', name: 'Wrong specificity', desc: 'The answer is too vague or too detailed for what was asked — technically correct, practically useless.', fix: 'Few-shot examples at the right altitude.' },
  { n: 7, stage: 'Generate', name: 'Hallucination', desc: 'The model asserted something the context never supported. The most damaging failure because it is the least visible.', fix: 'Measure faithfulness; require citations.' },
];

const STAGE_TONE = {
  Ingest: 'border-purple-500/40 bg-purple-500/10 text-purple-300',
  Retrieve: 'border-blue-500/40 bg-blue-500/10 text-blue-300',
  Generate: 'border-amber-500/40 bg-amber-500/10 text-amber-300',
};

export default function RagEvaluation() {
  const toc = [
    { label: 'Why Evaluate', hash: 'why' },
    { label: 'Retrieval Metrics (interactive)', hash: 'retrieval-metrics' },
    { label: 'Generation Metrics — RAGAS', hash: 'ragas' },
    { label: 'Human vs LLM-as-a-Judge', hash: 'human-vs-auto' },
    { label: 'The 7 Failure Points', hash: 'failure-modes' },
    { label: 'Building an Eval Set', hash: 'eval-set' },
  ];

  return (
    <GuideLayout
      title="Evaluation"
      intro="Measuring the success of your RAG pipeline — the metrics, what each one actually catches, and how to tell which half of the system is broken."
      toc={toc}
    >
      <div className="space-y-16">
        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          id="why"
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Why Evaluate</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Without evaluation, tuning a RAG system is superstition. You change the chunk size, spot-check three
            queries, decide it feels better, and ship — having no idea whether you improved the average case or just
            got lucky on the examples you happened to try.
          </p>
          <p className="text-gray-300 leading-relaxed mb-6">
            RAG has two failure surfaces, and they need different metrics. Diagnosing which half is broken is the
            single most useful thing evaluation buys you:
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-blue-500/30 bg-blue-500/10">
              <div className="text-blue-400 font-semibold mb-2">🔍 Retrieval quality</div>
              <p className="text-sm text-gray-300 leading-relaxed mb-3">
                Did we find the right chunks? Measured with classic search metrics — precision, recall, MRR, NDCG —
                against a labelled set of question/document pairs.
              </p>
              <div className="text-[0.6875rem] text-blue-300 bg-black/30 rounded px-2.5 py-1.5 border border-blue-500/20">
                Fix with: chunking, hybrid search, re-ranking
              </div>
            </div>
            <div className="p-5 rounded-xl border border-amber-500/30 bg-amber-500/10">
              <div className="text-amber-400 font-semibold mb-2">✍️ Generation quality</div>
              <p className="text-sm text-gray-300 leading-relaxed mb-3">
                Given the chunks we found, did the model write a good answer? Measured with LLM-graded metrics —
                faithfulness, answer relevancy — via frameworks like RAGAS or TruLens.
              </p>
              <div className="text-[0.6875rem] text-amber-300 bg-black/30 rounded px-2.5 py-1.5 border border-amber-500/20">
                Fix with: prompting, model choice, output constraints
              </div>
            </div>
          </div>

          <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/5">
            <p className="text-sm text-gray-400 leading-relaxed m-0">
              <strong className="text-white">The diagnostic rule:</strong> if retrieval metrics are bad, generation
              metrics are meaningless — the model was never given a chance. Always fix retrieval first, then measure
              generation on top of a retrieval layer you trust.
            </p>
          </div>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          id="retrieval-metrics"
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Retrieval Metrics</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Four metrics, each answering a different question about the same ranked list. They disagree with each
            other constantly, which is exactly why you track more than one. Play with the list below — flip which
            results are relevant and watch how differently each metric reacts.
          </p>

          <MetricsPlayground />

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
            <div className="p-5 rounded-xl border border-white/10 bg-white/5">
              <div className="font-semibold text-white mb-2 text-sm">Precision vs Recall — the tradeoff</div>
              <p className="text-xs text-gray-400 leading-relaxed m-0">
                Raising <em>k</em> almost always raises recall and lowers precision: you find more of what you need,
                but you also drag in more junk. For RAG specifically, <strong className="text-gray-200">recall
                matters more</strong> — a missing document is unrecoverable, whereas a few irrelevant chunks are
                something a good model can usually ignore. This is why the standard pattern is "retrieve 100, re-rank
                to 5": maximize recall first, then restore precision.
              </p>
            </div>
            <div className="p-5 rounded-xl border border-white/10 bg-white/5">
              <div className="font-semibold text-white mb-2 text-sm">MRR vs NDCG — when to use which</div>
              <p className="text-xs text-gray-400 leading-relaxed m-0">
                <strong className="text-gray-200">MRR</strong> only looks at the first correct hit, so it suits
                lookups with one right answer ("what's the refund window?"). <strong className="text-gray-200">NDCG</strong>{' '}
                scores the entire ordering with a logarithmic discount, so it suits synthesis questions where the model
                needs several documents ("summarize our refund policy"). If you track one number, track NDCG.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          id="ragas"
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Generation Metrics — the RAGAS Framework</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Retrieval metrics need labelled data. Generation metrics mostly do not — RAGAS uses an LLM to grade
            outputs, so you can run it on production traffic. The framework is simpler than it first appears: there
            are only three objects in play, and every metric compares two of them.
          </p>

          <RagasTriangle />
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          id="human-vs-auto"
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Human vs LLM-as-a-Judge</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="p-3 text-left text-gray-300 border-b border-white/10 font-semibold"> </th>
                  <th className="p-3 text-left text-emerald-400 border-b border-white/10 font-semibold">Human evaluation</th>
                  <th className="p-3 text-left text-blue-400 border-b border-white/10 font-semibold">LLM-as-a-Judge</th>
                </tr>
              </thead>
              <tbody className="text-gray-400">
                {[
                  ['Accuracy', 'The gold standard — the only real ground truth', 'Correlates well (~80%) on clear-cut cases, drifts on nuance'],
                  ['Cost', 'Very high — expert time per example', 'Cents per example'],
                  ['Speed', 'Days', 'Minutes'],
                  ['Scale', 'Dozens to hundreds of examples', 'Thousands, on every commit'],
                  ['Known biases', 'Fatigue, inconsistency between raters', 'Prefers longer answers, its own outputs, and the first option shown'],
                  ['Best used for', 'Building the golden set; final release sign-off', 'Continuous regression testing in CI'],
                ].map(([k, h, l], i) => (
                  <tr key={k} className={i % 2 ? 'bg-white/[0.02]' : ''}>
                    <td className="p-3 border-b border-white/5 font-semibold text-gray-200">{k}</td>
                    <td className="p-3 border-b border-white/5">{h}</td>
                    <td className="p-3 border-b border-white/5">{l}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="mt-4 p-4 rounded-xl border border-amber-500/25 bg-amber-500/10">
            <p className="text-sm text-amber-200 leading-relaxed m-0">
              <strong>Use both, for different jobs.</strong> Have humans label a small golden set of 100–200 examples
              once. Then use an LLM judge to run against that set continuously — and periodically check that the
              judge still agrees with your humans. A judge whose agreement with humans has quietly drifted is worse
              than no judge at all, because you will trust it.
            </p>
          </div>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          id="failure-modes"
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">The 7 Failure Points of RAG</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            From the paper <em>"Seven Failure Points When Engineering a RAG System"</em>. What makes this taxonomy
            useful is that each failure occurs at a specific pipeline stage — so identifying the failure tells you
            exactly where to look.
          </p>

          <div className="space-y-2.5">
            {FAILURES.map((f, i) => (
              <motion.div
                key={f.n}
                initial={{ opacity: 0, x: -12 }}
                whileInView={{ opacity: 1, x: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.05 }}
                className="flex flex-col sm:flex-row gap-3 p-4 rounded-xl border border-white/10 bg-white/5"
              >
                <div className="flex sm:flex-col items-center sm:items-start gap-2 shrink-0 sm:w-24">
                  <span className="w-6 h-6 rounded-full bg-black/40 border border-white/15 flex items-center justify-center text-[0.6875rem] font-bold text-gray-400 shrink-0">
                    {f.n}
                  </span>
                  <span className={`text-[0.5625rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded border ${STAGE_TONE[f.stage]}`}>
                    {f.stage}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="font-semibold text-white text-sm mb-1">{f.name}</div>
                  <p className="text-xs text-gray-400 leading-relaxed m-0">{f.desc}</p>
                </div>
                <div className="sm:w-52 shrink-0 flex items-center">
                  <div className="text-[0.6875rem] text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 rounded px-2.5 py-1.5 w-full">
                    → {f.fix}
                  </div>
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          id="eval-set"
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Building an Eval Set</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Every technique on the{' '}
            <a href="#/rag/advanced-retrieval" className="text-blue-400 hover:underline">
              Advanced Retrieval
            </a>{' '}
            page is a hypothesis. An eval set is how you test one. Start smaller than feels rigorous — 50 good
            examples beat 500 careless ones, and you can have them by this afternoon.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            {[
              { icon: '📥', title: '1. Harvest real questions', body: 'Pull from support tickets, search logs, and Slack. Invented questions are cleaner than reality and will flatter your system.' },
              { icon: '🏷️', title: '2. Label the ground truth', body: 'For each question, record which chunks should be retrieved and what a correct answer contains. This is the slow part — and the part worth doing properly.' },
              { icon: '🔁', title: '3. Run it on every change', body: 'Wire it into CI. Any change to chunking, embeddings, k, or the prompt reruns the suite and reports the delta.' },
            ].map((s, i) => (
              <motion.div
                key={s.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1 }}
                className="p-5 rounded-xl border border-white/10 bg-white/5"
              >
                <div className="text-2xl mb-2.5">{s.icon}</div>
                <div className="font-semibold text-white text-sm mb-1.5">{s.title}</div>
                <p className="text-xs text-gray-400 leading-relaxed m-0">{s.body}</p>
              </motion.div>
            ))}
          </div>

          <pre className="bg-[#141414] border border-white/10 rounded-xl p-4 font-mono text-xs text-gray-300 overflow-x-auto">
{`from ragas import evaluate
from ragas.metrics import (
    faithfulness, answer_relevancy,
    context_precision, context_recall,
)
from datasets import Dataset

# One row per eval question
data = Dataset.from_dict({
    "question":     ["How do refunds work?"],
    "answer":       [rag_pipeline.invoke("How do refunds work?")],
    "contexts":     [[c.page_content for c in retrieved_chunks]],
    "ground_truth": ["Refunds are issued within 30 days of purchase."],
})

report = evaluate(data, metrics=[
    faithfulness,        # answer  <-> context   (hallucination)
    answer_relevancy,    # answer  <-> question  (did it respond?)
    context_precision,   # question <-> context  (ranking quality)
    context_recall,      # question <-> context  (coverage)  [needs ground_truth]
])
print(report)
# {'faithfulness': 0.92, 'answer_relevancy': 0.88,
#  'context_precision': 0.75, 'context_recall': 0.67}`}
          </pre>

          <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/5">
            <p className="text-sm text-gray-400 leading-relaxed m-0">
              <strong className="text-white">Reading that output:</strong> faithfulness and relevancy are healthy, so
              generation is fine. Context recall at 0.67 is the problem — a third of the needed information never
              made it into the context. That points squarely at retrieval, and no amount of prompt tuning will move
              it.
            </p>
          </div>
        </motion.section>
      </div>
    </GuideLayout>
  );
}

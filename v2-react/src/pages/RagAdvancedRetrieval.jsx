import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';

/* ---------------------------------------------------------------------------
   Per-technique visuals. Each one is a small bespoke diagram that shows the
   *shape* of the technique rather than a generic box-and-arrow flow.
--------------------------------------------------------------------------- */

const Box = ({ children, tone = 'gray', className = '' }) => {
  const tones = {
    gray: 'bg-white/5 border-white/15 text-gray-300',
    blue: 'bg-blue-500/15 border-blue-500/40 text-blue-200',
    amber: 'bg-amber-500/15 border-amber-500/40 text-amber-200',
    emerald: 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200',
    purple: 'bg-purple-500/15 border-purple-500/40 text-purple-200',
    rose: 'bg-rose-500/15 border-rose-500/40 text-rose-200',
  };
  return (
    <div className={`px-3 py-2 rounded-lg border text-xs font-mono ${tones[tone]} ${className}`}>
      {children}
    </div>
  );
};

const Arrow = ({ label, vertical = false }) => (
  <div className={`flex ${vertical ? 'flex-col' : 'flex-row'} items-center justify-center gap-1 text-gray-600 shrink-0`}>
    {label && <span className="text-[0.625rem] text-gray-500 whitespace-nowrap">{label}</span>}
    <span className="text-lg leading-none">{vertical ? '↓' : '→'}</span>
  </div>
);

function HybridVisual() {
  return (
    <div className="flex flex-col items-center gap-3">
      <Box tone="gray">query: "error code 5012 on login"</Box>
      <div className="flex gap-8 w-full justify-center">
        <div className="flex flex-col items-center gap-2">
          <Arrow vertical />
          <Box tone="blue">Dense / Vector</Box>
          <div className="text-[0.625rem] text-gray-500 text-center max-w-[130px]">
            catches meaning:<br />"sign-in failure"
          </div>
        </div>
        <div className="flex flex-col items-center gap-2">
          <Arrow vertical />
          <Box tone="amber">Sparse / BM25</Box>
          <div className="text-[0.625rem] text-gray-500 text-center max-w-[130px]">
            catches exact token:<br /><span className="text-amber-300">"5012"</span>
          </div>
        </div>
      </div>
      <Arrow vertical label="Reciprocal Rank Fusion" />
      <Box tone="emerald">merged ranking — both signals</Box>
    </div>
  );
}

function RewriteVisual() {
  return (
    <div className="flex flex-col gap-3">
      <div className="flex items-center gap-3">
        <span className="text-[0.625rem] uppercase tracking-wide text-gray-500 w-16 shrink-0">Before</span>
        <Box tone="rose" className="flex-1">"whats it cost"</Box>
      </div>
      <div className="flex items-center gap-3">
        <span className="w-16 shrink-0" />
        <div className="text-gray-600 text-lg">↓</div>
        <span className="text-[0.625rem] text-gray-500">LLM rewrite, using chat history for context</span>
      </div>
      <div className="flex items-center gap-3">
        <span className="text-[0.625rem] uppercase tracking-wide text-gray-500 w-16 shrink-0">After</span>
        <Box tone="emerald" className="flex-1">
          "What is the monthly pricing of the Enterprise plan?"
        </Box>
      </div>
    </div>
  );
}

function DecompositionVisual() {
  return (
    <div className="flex flex-col items-center gap-3">
      <Box tone="gray" className="max-w-md text-center">
        "Did Tesla or Ford have higher revenue in 2023?"
      </Box>
      <Arrow vertical label="decompose" />
      <div className="flex flex-wrap gap-3 justify-center">
        <div className="flex flex-col items-center gap-1.5">
          <Box tone="blue">"Tesla 2023 revenue"</Box>
          <span className="text-[0.625rem] text-gray-500">retrieve →  $96.8B</span>
        </div>
        <div className="flex flex-col items-center gap-1.5">
          <Box tone="blue">"Ford 2023 revenue"</Box>
          <span className="text-[0.625rem] text-gray-500">retrieve →  $176.2B</span>
        </div>
      </div>
      <Arrow vertical label="synthesize both" />
      <Box tone="emerald">"Ford, by roughly $79B."</Box>
    </div>
  );
}

function HydeVisual() {
  return (
    <div className="flex flex-col items-center gap-3">
      <Box tone="gray">"How do I rotate API keys?"</Box>
      <Arrow vertical label="LLM invents a plausible answer" />
      <div className="max-w-md p-3 rounded-lg border border-dashed border-purple-500/40 bg-purple-500/10">
        <div className="text-[0.625rem] uppercase tracking-wide text-purple-400 mb-1">Hypothetical document (may be factually wrong — that's fine)</div>
        <div className="text-xs text-gray-300 italic leading-relaxed">
          "To rotate an API key, open Settings → Credentials, click Regenerate, then update the secret in your deployment environment…"
        </div>
      </div>
      <Arrow vertical label="embed THIS, not the question" />
      <Box tone="emerald">search — answer-shaped text matches answer-shaped docs</Box>
    </div>
  );
}

function ParentChildVisual() {
  return (
    <div className="flex flex-col md:flex-row items-center justify-center gap-6">
      <div className="flex flex-col items-center gap-2">
        <div className="text-[0.625rem] uppercase tracking-wide text-gray-500">Indexed: small chunks</div>
        <div className="grid grid-cols-3 gap-1.5">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <motion.div
              key={i}
              animate={i === 4 ? { borderColor: ['rgba(255,255,255,0.15)', 'rgba(52,211,153,0.9)', 'rgba(255,255,255,0.15)'] } : {}}
              transition={{ duration: 2, repeat: Infinity }}
              className={`w-12 h-8 rounded border ${i === 4 ? 'bg-emerald-500/20 border-emerald-500/60' : 'bg-white/5 border-white/15'}`}
            />
          ))}
        </div>
        <div className="text-[0.625rem] text-gray-500">precise match ↑</div>
      </div>

      <div className="flex flex-col items-center text-gray-600">
        <span className="text-[0.625rem] text-gray-500 whitespace-nowrap mb-1">but return…</span>
        <span className="text-2xl">→</span>
      </div>

      <div className="flex flex-col items-center gap-2">
        <div className="text-[0.625rem] uppercase tracking-wide text-gray-500">Returned: whole parent</div>
        <div className="w-40 h-[74px] rounded-lg border-2 border-emerald-500/60 bg-emerald-500/10 flex items-center justify-center text-[0.625rem] text-emerald-200 text-center px-2">
          full section, surrounding context intact
        </div>
        <div className="text-[0.625rem] text-gray-500">LLM sees the whole story ↑</div>
      </div>
    </div>
  );
}

function ContextualVisual() {
  return (
    <div className="flex flex-col gap-4">
      <div>
        <div className="text-[0.625rem] uppercase tracking-wide text-rose-400 mb-1.5">Naive chunk — ambiguous on its own</div>
        <div className="p-3 rounded-lg border border-rose-500/30 bg-rose-500/10 text-xs text-gray-300 font-mono">
          "Revenue grew 12% year over year."
        </div>
        <div className="text-[0.625rem] text-gray-500 mt-1.5">Whose revenue? Which year? The embedding has no idea.</div>
      </div>
      <div>
        <div className="text-[0.625rem] uppercase tracking-wide text-emerald-400 mb-1.5">Contextualized chunk — self-describing</div>
        <div className="p-3 rounded-lg border border-emerald-500/30 bg-emerald-500/10 text-xs font-mono">
          <span className="text-emerald-300">[From: Acme Corp FY2024 Q3 earnings report, Financials section]</span>{' '}
          <span className="text-gray-300">"Revenue grew 12% year over year."</span>
        </div>
        <div className="text-[0.625rem] text-gray-500 mt-1.5">An LLM writes that prefix once at index time, per chunk.</div>
      </div>
    </div>
  );
}

function RerankVisual() {
  const before = [
    { t: 'doc_41', s: 0.71, rel: false },
    { t: 'doc_08', s: 0.70, rel: false },
    { t: 'doc_93', s: 0.69, rel: true },
    { t: 'doc_12', s: 0.68, rel: false },
    { t: 'doc_57', s: 0.67, rel: true },
  ];
  const after = [
    { t: 'doc_93', s: 9.4, rel: true },
    { t: 'doc_57', s: 8.8, rel: true },
    { t: 'doc_41', s: 2.1, rel: false },
    { t: 'doc_12', s: 1.7, rel: false },
    { t: 'doc_08', s: 0.9, rel: false },
  ];

  const Col = ({ title, sub, rows, tone }) => (
    <div className="flex-1 min-w-[150px]">
      <div className={`text-[0.625rem] uppercase tracking-wide mb-1 ${tone}`}>{title}</div>
      <div className="text-[0.625rem] text-gray-500 mb-2">{sub}</div>
      <div className="space-y-1.5">
        {rows.map((r, i) => (
          <motion.div
            key={r.t}
            initial={{ opacity: 0, x: -8 }}
            whileInView={{ opacity: 1, x: 0 }}
            viewport={{ once: true }}
            transition={{ delay: i * 0.06 }}
            className={`flex items-center justify-between px-2.5 py-1.5 rounded border text-[0.6875rem] font-mono ${
              r.rel ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200' : 'bg-white/5 border-white/10 text-gray-500'
            }`}
          >
            <span>{r.rel ? '✓ ' : '  '}{r.t}</span>
            <span className="opacity-60">{r.s}</span>
          </motion.div>
        ))}
      </div>
    </div>
  );

  return (
    <div>
      <div className="flex items-center gap-3">
        <Col title="Vector top-5" sub="scores bunched, order ~arbitrary" rows={before} tone="text-rose-400" />
        <div className="flex flex-col items-center text-gray-600 shrink-0 pt-8">
          <span className="text-[0.625rem] text-gray-500 whitespace-nowrap mb-1">cross-encoder</span>
          <span className="text-2xl">→</span>
        </div>
        <Col title="After re-rank" sub="clear separation, relevant on top" rows={after} tone="text-emerald-400" />
      </div>
      <p className="text-[0.6875rem] text-gray-500 mt-3 leading-relaxed">
        A bi-encoder embeds query and document <em>separately</em>, so it never directly compares them. A cross-encoder
        reads both together in one pass — far more accurate, far too slow to run over the whole corpus. So you use
        vector search to get 100 candidates, then the cross-encoder to pick the best 5.
      </p>
    </div>
  );
}

/* ------------------------------------------------------------------------ */

const STAGES = {
  index: { label: 'Index-time', tone: 'text-purple-400', bg: 'bg-purple-500/15 border-purple-500/40' },
  pre: { label: 'Pre-retrieval', tone: 'text-amber-400', bg: 'bg-amber-500/15 border-amber-500/40' },
  retrieve: { label: 'Retrieval', tone: 'text-blue-400', bg: 'bg-blue-500/15 border-blue-500/40' },
  post: { label: 'Post-retrieval', tone: 'text-emerald-400', bg: 'bg-emerald-500/15 border-emerald-500/40' },
};

const TECHNIQUES = [
  {
    id: 'hybrid',
    name: 'Hybrid Search',
    stage: 'retrieve',
    tagline: 'Semantics + exact keywords, fused.',
    problem:
      'Pure vector search is great at meaning but terrible at exact tokens. Search for error code "5012" or SKU "XR-9920" and the embedding happily returns semantically similar text that never contains the literal string. Pure keyword search has the opposite failure: it misses "sign-in failure" when the doc says "login error".',
    how: 'Run both searches in parallel, then merge the two ranked lists with Reciprocal Rank Fusion (RRF) — each doc scores sum(1 / (k + rank)) across the lists, so a doc ranked well by either method surfaces. k is typically 60.',
    visual: HybridVisual,
    code: `# RRF: no score normalization needed — it only uses rank position
def reciprocal_rank_fusion(rankings, k=60):
    scores = {}
    for ranking in rankings:          # e.g. [vector_hits, bm25_hits]
        for rank, doc_id in enumerate(ranking):
            scores[doc_id] = scores.get(doc_id, 0) + 1 / (k + rank)
    return sorted(scores, key=scores.get, reverse=True)

fused = reciprocal_rank_fusion([vector_ids, bm25_ids])`,
    when: 'Almost always. This is the highest value-per-effort upgrade over naive RAG, especially for technical docs, product catalogs, and anything with codes or IDs.',
    cost: 'Low',
    latency: 'Negligible — the two searches run in parallel',
  },
  {
    id: 'rewriting',
    name: 'Query Rewriting',
    stage: 'pre',
    tagline: 'Fix the question before you search with it.',
    problem:
      'Real user queries are short, misspelled, and full of pronouns that only make sense given the conversation ("what about the other one?"). Embedding that raw text searches for the wrong thing entirely.',
    how: 'Before retrieval, pass the query (plus recent chat history) to a small fast LLM and ask it to produce a standalone, fully-specified search query. This also fixes typos and expands jargon.',
    visual: RewriteVisual,
    code: `REWRITE_PROMPT = """Given the conversation and the latest user question,
rewrite the question as a standalone search query.
Resolve all pronouns and references. Output only the query.

History: {history}
Question: {question}"""

standalone = fast_llm.invoke(REWRITE_PROMPT.format(...))
docs = retriever.invoke(standalone)   # search with the rewrite`,
    when: 'Any multi-turn chat interface. Skip it for single-shot search where the user already types full queries.',
    cost: 'Low — use a small model',
    latency: '+200-500ms (one extra LLM call before search)',
  },
  {
    id: 'decomposition',
    name: 'Query Decomposition',
    stage: 'pre',
    tagline: 'Split comparative questions into separate searches.',
    problem:
      'A single embedding cannot represent two different things at once. "Did Tesla or Ford have higher revenue?" produces a vector sitting somewhere between both companies — often retrieving documents about neither, or about only one.',
    how: 'Ask an LLM to break the question into independent sub-questions, retrieve for each separately, then give the LLM all the results to synthesize a final answer.',
    visual: DecompositionVisual,
    code: `sub_questions = llm.invoke(
    "Break this into independent sub-questions, one per line:\\n" + question
).split("\\n")

# Retrieve for each sub-question independently
contexts = [retriever.invoke(sq) for sq in sub_questions]

answer = llm.invoke(synthesis_prompt.format(
    question=question,
    context="\\n\\n".join(flatten(contexts))
))`,
    when: 'Comparative, multi-hop, or aggregate questions. Detect them with a cheap classifier so you skip decomposition on simple lookups.',
    cost: 'Medium — N retrievals plus 2 LLM calls',
    latency: 'High — but sub-queries can run in parallel',
  },
  {
    id: 'hyde',
    name: 'HyDE',
    stage: 'pre',
    tagline: 'Search with a fake answer instead of the question.',
    problem:
      'Questions and answers do not look alike. "How do I rotate API keys?" is short and interrogative; the document that answers it is long, declarative, and full of specific nouns. Embedding a question and comparing it to answer-shaped documents is an asymmetric match.',
    how: 'Have the LLM hallucinate a plausible answer first, embed that, and search with it. The fake answer does not need to be factually correct — it just needs to have the same *shape and vocabulary* as the real document you want to find.',
    visual: HydeVisual,
    code: `# Hypothetical Document Embeddings
hypothetical = llm.invoke(
    f"Write a short passage that answers this question. "
    f"It's fine to invent specifics.\\n\\nQuestion: {question}"
)

# Search using the fake answer's embedding, not the question's
docs = vectorstore.similarity_search(hypothetical, k=5)`,
    when: 'Zero-shot domains where you have no training data to tune the embedding model, and where queries are phrased very differently from documents.',
    cost: 'Medium',
    latency: '+300-800ms',
  },
  {
    id: 'parent-child',
    name: 'Parent-Child Retrieval',
    stage: 'index',
    tagline: 'Search small for precision, return big for context.',
    problem:
      'Chunk size is a direct tradeoff. Small chunks embed precisely (one idea per vector) but strand the LLM without surrounding context. Large chunks preserve context but their embeddings become a muddy average of several topics, hurting retrieval accuracy.',
    how: 'Break the tradeoff by decoupling the two. Index small child chunks for accurate matching, but store a pointer from each child to its larger parent. On a hit, return the parent.',
    visual: ParentChildVisual,
    code: `from langchain.retrievers import ParentDocumentRetriever

retriever = ParentDocumentRetriever(
    vectorstore=vectorstore,      # holds small child embeddings
    docstore=InMemoryStore(),     # holds large parent documents
    child_splitter=RecursiveCharacterTextSplitter(chunk_size=200),
    parent_splitter=RecursiveCharacterTextSplitter(chunk_size=2000),
)
retriever.add_documents(docs)   # splits + links both levels automatically`,
    when: 'Long-form prose — documentation, contracts, research papers — where a matched sentence is meaningless without its section.',
    cost: 'Low at query time; more storage',
    latency: 'Negligible',
  },
  {
    id: 'contextual',
    name: 'Contextual Retrieval',
    stage: 'index',
    tagline: 'Give every chunk a memory of where it came from.',
    problem:
      'A chunk reading "Revenue grew 12% year over year" is nearly useless as an embedding — it has no company, no year, no document. It will never rank for "Acme 2024 revenue growth" because none of those tokens are in it.',
    how: 'At index time, ask an LLM to write a one-line description of how each chunk fits into its source document, and prepend it before embedding. Anthropic reported this cuts failed retrievals substantially, and combines well with hybrid search.',
    visual: ContextualVisual,
    code: `CONTEXT_PROMPT = """<document>{full_doc}</document>
Here is a chunk from it:
<chunk>{chunk}</chunk>
Give a short line situating this chunk in the document,
to improve search retrieval. Answer with only that line."""

for chunk in chunks:
    prefix = llm.invoke(CONTEXT_PROMPT.format(...))
    embed(prefix + " " + chunk)     # embed the contextualized text`,
    when: 'Large heterogeneous corpora where chunks share vocabulary across many documents. Use prompt caching on the full document to keep the cost sane.',
    cost: 'High one-time — an LLM call per chunk',
    latency: 'Zero at query time (all work happens at index time)',
  },
  {
    id: 'reranking',
    name: 'Re-ranking',
    stage: 'post',
    tagline: 'Cast a wide net, then judge the catch properly.',
    problem:
      'Vector similarity is an approximation. Among your top 100 hits the truly relevant document might sit at rank 37, and if you only pass the top 5 to the LLM, it never sees it. Worse, similarity scores bunch together (0.71 vs 0.69), so the ordering is close to arbitrary.',
    how: 'Retrieve a deliberately generous candidate set (50-100), then re-score every candidate with a cross-encoder that reads the query and document *together*. Keep the best 3-5.',
    visual: RerankVisual,
    code: `# 1. Cast a wide net with cheap vector search
candidates = vectorstore.similarity_search(query, k=100)

# 2. Re-score with a cross-encoder (slow but accurate)
from sentence_transformers import CrossEncoder
reranker = CrossEncoder("cross-encoder/ms-marco-MiniLM-L-6-v2")

pairs = [(query, d.page_content) for d in candidates]
scores = reranker.predict(pairs)

# 3. Keep only the best few for the LLM
top = [d for _, d in sorted(zip(scores, candidates), reverse=True)][:5]`,
    when: 'Whenever answer quality matters more than latency. Pairs extremely well with hybrid search — fuse, then re-rank.',
    cost: 'Medium — hosted APIs (Cohere, Voyage) or self-hosted',
    latency: '+100-400ms for 100 candidates',
  },
];

export default function RagAdvancedRetrieval() {
  const [active, setActive] = useState(TECHNIQUES[0]);

  const toc = [
    { label: 'Why Retrieval Is the Bottleneck', hash: 'bottleneck' },
    { label: 'Where Each Technique Fits', hash: 'stage-map' },
    { label: 'The 7 Techniques', hash: 'techniques' },
    { label: 'Choosing a Stack', hash: 'stack' },
  ];

  const ActiveVisual = active.visual;

  return (
    <GuideLayout
      title="Advanced Retrieval Techniques"
      intro="Optimizing the search step for maximum precision — the seven techniques that separate a demo from a production RAG system."
      toc={toc}
    >
      <div className="space-y-16">
        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          id="bottleneck"
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Why Retrieval Is the Bottleneck</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            An LLM can only reason over what you hand it. If the relevant passage never makes it into the context
            window, no amount of prompt engineering, no larger model, and no better output parser will recover the
            answer — the information simply is not there. This makes retrieval quality a hard ceiling on the entire
            system.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
            <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/10">
              <div className="text-rose-400 font-semibold mb-2 text-sm">❌ Retrieval misses</div>
              <div className="space-y-2 text-xs font-mono">
                <div className="px-3 py-2 rounded bg-black/30 border border-white/10 text-gray-400">wrong chunks →</div>
                <div className="px-3 py-2 rounded bg-black/30 border border-white/10 text-gray-400">🧠 best LLM available</div>
                <div className="px-3 py-2 rounded bg-rose-500/20 border border-rose-500/40 text-rose-200">
                  "I don't have information on that." — or a confident hallucination
                </div>
              </div>
            </div>
            <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
              <div className="text-emerald-400 font-semibold mb-2 text-sm">✅ Retrieval hits</div>
              <div className="space-y-2 text-xs font-mono">
                <div className="px-3 py-2 rounded bg-black/30 border border-white/10 text-gray-400">right chunks →</div>
                <div className="px-3 py-2 rounded bg-black/30 border border-white/10 text-gray-400">🧠 even a mid-tier LLM</div>
                <div className="px-3 py-2 rounded bg-emerald-500/20 border border-emerald-500/40 text-emerald-200">
                  a grounded, citable answer
                </div>
              </div>
            </div>
          </div>

          <div className="p-4 rounded-xl border border-blue-500/25 bg-blue-500/10">
            <p className="text-sm text-blue-200 leading-relaxed m-0">
              <strong>The practical implication:</strong> when a RAG system gives a bad answer, debug retrieval first.
              Log the chunks that were actually retrieved for the failing query — nine times out of ten the problem is
              visible immediately, and it is not the model's fault.
            </p>
          </div>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          id="stage-map"
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Where Each Technique Fits</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            These seven techniques are not alternatives to each other — they act at four different points in the
            pipeline, and a mature system stacks several. Knowing <em>where</em> a technique intervenes tells you what
            it can and cannot fix.
          </p>

          <div className="p-6 rounded-2xl border border-white/10 bg-black/40 overflow-x-auto">
            <div className="flex items-stretch gap-3 min-w-[720px]">
              {[
                { key: 'index', sub: 'before any query arrives', items: ['Parent-Child', 'Contextual Retrieval'] },
                { key: 'pre', sub: 'transform the query', items: ['Query Rewriting', 'Decomposition', 'HyDE'] },
                { key: 'retrieve', sub: 'the search itself', items: ['Hybrid Search'] },
                { key: 'post', sub: 'refine the results', items: ['Re-ranking'] },
              ].map((stage, i, arr) => {
                const s = STAGES[stage.key];
                return (
                  <React.Fragment key={stage.key}>
                    <motion.div
                      initial={{ opacity: 0, y: 12 }}
                      whileInView={{ opacity: 1, y: 0 }}
                      viewport={{ once: true }}
                      transition={{ delay: i * 0.1 }}
                      className={`flex-1 rounded-xl border p-4 ${s.bg}`}
                    >
                      <div className={`text-xs font-bold uppercase tracking-wide mb-0.5 ${s.tone}`}>{s.label}</div>
                      <div className="text-[0.625rem] text-gray-500 mb-3">{stage.sub}</div>
                      <div className="space-y-1.5">
                        {stage.items.map((it) => (
                          <button
                            key={it}
                            onClick={() => {
                              const t = TECHNIQUES.find((x) => x.name.startsWith(it.split(' ')[0]));
                              if (t) setActive(t);
                              document.getElementById('techniques')?.scrollIntoView({ behavior: 'smooth' });
                            }}
                            className="w-full text-left px-2.5 py-1.5 rounded bg-black/30 border border-white/10 text-[0.6875rem] text-gray-300 hover:border-white/40 hover:text-white transition-colors"
                          >
                            {it}
                          </button>
                        ))}
                      </div>
                    </motion.div>
                    {i < arr.length - 1 && (
                      <div className="flex items-center text-gray-600 text-xl shrink-0">→</div>
                    )}
                  </React.Fragment>
                );
              })}
            </div>
          </div>
          <p className="text-xs text-gray-500 mt-3">Click any technique above to jump to its explanation.</p>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          id="techniques"
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">The 7 Techniques</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Select a technique to see the problem it solves, how it works visually, and what it costs you.
          </p>

          {/* Selector */}
          <div className="flex flex-wrap gap-2 mb-6">
            {TECHNIQUES.map((t) => {
              const s = STAGES[t.stage];
              const isActive = active.id === t.id;
              return (
                <button
                  key={t.id}
                  onClick={() => setActive(t)}
                  className={`px-3.5 py-2 rounded-lg border text-sm font-medium transition-all ${
                    isActive
                      ? `${s.bg} ${s.tone} ring-2 ring-white/50`
                      : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-gray-200'
                  }`}
                >
                  {t.name}
                </button>
              );
            })}
          </div>

          {/* Detail panel */}
            <motion.div
              key={active.id}
              initial={{ opacity: 0, y: 12 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
              className="rounded-2xl border border-white/10 bg-white/5 overflow-hidden"
            >
              {/* Header */}
              <div className="p-6 border-b border-white/10">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h3 className="text-xl font-bold text-white">{active.name}</h3>
                  <span className={`text-[0.625rem] font-bold uppercase tracking-wide px-2 py-1 rounded-full border ${STAGES[active.stage].bg} ${STAGES[active.stage].tone}`}>
                    {STAGES[active.stage].label}
                  </span>
                </div>
                <p className="text-gray-400 text-sm m-0">{active.tagline}</p>
              </div>

              <div className="p-6 space-y-6">
                {/* Problem */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-rose-400 mb-2">The problem</div>
                  <p className="text-sm text-gray-300 leading-relaxed m-0">{active.problem}</p>
                </div>

                {/* How */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-emerald-400 mb-2">How it works</div>
                  <p className="text-sm text-gray-300 leading-relaxed m-0">{active.how}</p>
                </div>

                {/* Visual */}
                <div className="p-6 rounded-xl border border-white/10 bg-black/40 overflow-x-auto">
                  <ActiveVisual />
                </div>

                {/* Code */}
                <div>
                  <div className="text-xs font-bold uppercase tracking-wide text-blue-400 mb-2">In code</div>
                  <pre className="bg-[#141414] border border-white/10 rounded-xl p-4 font-mono text-xs text-gray-300 overflow-x-auto m-0">
                    {active.code}
                  </pre>
                </div>

                {/* Tradeoffs */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  <div className="p-3.5 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">When to use</div>
                    <div className="text-xs text-gray-300 leading-relaxed">{active.when}</div>
                  </div>
                  <div className="p-3.5 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Cost</div>
                    <div className="text-xs text-gray-300 leading-relaxed">{active.cost}</div>
                  </div>
                  <div className="p-3.5 rounded-lg bg-white/5 border border-white/10">
                    <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Latency impact</div>
                    <div className="text-xs text-gray-300 leading-relaxed">{active.latency}</div>
                  </div>
                </div>
              </div>
            </motion.div>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          id="stack"
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Choosing a Stack</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            Do not adopt all seven at once. Each one adds latency, cost, and a new thing that can break. Add them in
            this order, measuring after each step.
          </p>

          <div className="space-y-3">
            {[
              {
                n: 1,
                title: 'Hybrid Search + Re-ranking',
                body: 'The baseline production stack. Biggest quality jump for the least complexity, and it fixes both the exact-token blindness and the arbitrary-ordering problems at once.',
                tone: 'emerald',
              },
              {
                n: 2,
                title: 'Add Parent-Child chunking',
                body: 'If answers feel truncated or lack context — the model quotes a sentence but misses the caveat in the next paragraph — decouple your search granularity from your context granularity.',
                tone: 'blue',
              },
              {
                n: 3,
                title: 'Add Query Rewriting',
                body: 'The moment your interface becomes multi-turn. Without it, follow-up questions like "what about the enterprise tier?" retrieve nothing useful.',
                tone: 'amber',
              },
              {
                n: 4,
                title: 'Add Contextual Retrieval',
                body: 'When your corpus is large and heterogeneous enough that chunks become ambiguous out of context. Budget for the one-time indexing cost.',
                tone: 'purple',
              },
              {
                n: 5,
                title: 'Add Decomposition or HyDE last',
                body: 'These are targeted fixes, not general upgrades. Reach for decomposition only if you see comparative questions failing, and HyDE only if question/document phrasing is badly mismatched.',
                tone: 'rose',
              },
            ].map((s, i) => {
              const tones = {
                emerald: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
                blue: 'border-blue-500/30 bg-blue-500/10 text-blue-400',
                amber: 'border-amber-500/30 bg-amber-500/10 text-amber-400',
                purple: 'border-purple-500/30 bg-purple-500/10 text-purple-400',
                rose: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
              };
              return (
                <motion.div
                  key={s.n}
                  initial={{ opacity: 0, x: -12 }}
                  whileInView={{ opacity: 1, x: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  className={`flex gap-4 p-5 rounded-xl border ${tones[s.tone]}`}
                >
                  <div className={`shrink-0 w-8 h-8 rounded-full border flex items-center justify-center font-bold text-sm ${tones[s.tone]}`}>
                    {s.n}
                  </div>
                  <div>
                    <div className="font-semibold text-white mb-1">{s.title}</div>
                    <div className="text-sm text-gray-400 leading-relaxed">{s.body}</div>
                  </div>
                </motion.div>
              );
            })}
          </div>

          <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/5">
            <p className="text-sm text-gray-400 leading-relaxed m-0">
              <strong className="text-white">Measure, don't guess.</strong> Every one of these techniques is a
              hypothesis about why your retrieval is failing. Build an evaluation set first so you can tell whether a
              change actually helped — see the{' '}
              <a href="#/rag/evaluation" className="text-blue-400 hover:underline">
                Evaluation
              </a>{' '}
              guide.
            </p>
          </div>
        </motion.section>
      </div>
    </GuideLayout>
  );
}

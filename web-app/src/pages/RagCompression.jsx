import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import CodeBlock from "../components/CodeBlock";

/* --------------------------------------------------------------------------
   Contextual compression is a budget argument. The panel computes the budget.
-------------------------------------------------------------------------- */

function BudgetPanel() {
  const [chunks, setChunks] = useState(20);
  const [chunkTokens, setChunkTokens] = useState(500);
  const [relevantPct, setRelevantPct] = useState(18);
  const [pricePerM, setPricePerM] = useState(3);

  const stats = useMemo(() => {
    const raw = chunks * chunkTokens;
    const useful = Math.round((raw * relevantPct) / 100);
    const wasted = raw - useful;
    // Compression keeps the useful sentences plus a little connective text.
    const compressed = Math.round(useful * 1.15);
    const perCallSaving = ((raw - compressed) / 1e6) * pricePerM;
    return {
      raw,
      useful,
      wasted,
      compressed,
      ratio: raw / Math.max(compressed, 1),
      monthly: perCallSaving * 100000,
    };
  }, [chunks, chunkTokens, relevantPct, pricePerM]);

  const controls = [
    ["Chunks retrieved", chunks, setChunks, 1, 50, 1, ""],
    ["Tokens per chunk", chunkTokens, setChunkTokens, 100, 1500, 50, ""],
    ["Actually relevant", relevantPct, setRelevantPct, 2, 100, 1, "%"],
    ["$ per 1M input tokens", pricePerM, setPricePerM, 0.5, 15, 0.5, ""],
  ];

  return (
    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] p-6">
      <h3 className="text-emerald-400 font-bold mb-1">The budget you are actually spending</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        Retrieval returns whole chunks because chunks are the unit you indexed. But relevance is sentence-shaped, not
        chunk-shaped. Most of what reaches the model is padding around the one line that mattered.
      </p>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-5">
        {controls.map(([label, val, set, min, max, step, suffix]) => (
          <label key={label} className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500">{label}</span>
            <input
              type="range"
              min={min}
              max={max}
              step={step}
              value={val}
              onChange={(e) => set(Number(e.target.value))}
              className="w-full mt-2 accent-emerald-500"
            />
            <span className="font-mono text-emerald-300 text-sm">
              {val}
              {suffix}
            </span>
          </label>
        ))}
      </div>

      <div className="mb-5">
        <div className="flex h-8 rounded-lg overflow-hidden border border-white/10">
          <div
            className="bg-emerald-500/70 flex items-center justify-center text-[0.625rem] font-mono text-black font-bold"
            style={{ width: `${relevantPct}%` }}
          >
            {relevantPct >= 12 ? "signal" : ""}
          </div>
          <div className="bg-rose-500/30 flex items-center justify-center text-[0.625rem] font-mono text-rose-200">
            {100 - relevantPct >= 12 ? "padding you pay for" : ""}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-4 gap-3 mb-4">
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Sent uncompressed</div>
          <div className="text-2xl font-bold font-mono text-gray-300">{stats.raw.toLocaleString()}</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">tokens per query</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-rose-500/25">
          <div className="text-[0.625rem] uppercase tracking-wide text-rose-400 mb-1">Wasted</div>
          <div className="text-2xl font-bold font-mono text-rose-300">{stats.wasted.toLocaleString()}</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">irrelevant tokens</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/30">
          <div className="text-[0.625rem] uppercase tracking-wide text-emerald-400 mb-1">After compression</div>
          <div className="text-2xl font-bold font-mono text-emerald-300">{stats.compressed.toLocaleString()}</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">{stats.ratio.toFixed(1)}× smaller</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Saved at 100k queries</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">${stats.monthly.toFixed(0)}</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">input tokens only</div>
        </div>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed">
        Cost is the easy argument. The better one is accuracy: models attend less reliably to material buried in the
        middle of a long context, so cutting the padding raises answer quality even where the budget is not a
        constraint.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const METHODS = [
  {
    n: "Extractive filtering",
    cost: "cheap",
    d: "Split each retrieved chunk into sentences, embed them, and keep only those above a similarity threshold against the query. No generation involved, so it costs one embedding call and nothing else.",
    box: "border-emerald-500/25 bg-emerald-500/[0.07]",
    label: "text-emerald-400",
  },
  {
    n: "LLM extraction",
    cost: "expensive",
    d: "Ask a small model to pull out only the spans of each document that bear on the query. Far better at recognising relevance that is not lexically obvious, but it adds a model call per document.",
    box: "border-blue-500/25 bg-blue-500/[0.07]",
    label: "text-blue-400",
  },
  {
    n: "Re-ranking then truncating",
    cost: "moderate",
    d: "A cross-encoder scores every chunk against the query properly, then you keep the top few. Not compression within a document, but it removes whole documents that never deserved a slot.",
    box: "border-indigo-500/25 bg-indigo-500/[0.07]",
    label: "text-indigo-400",
  },
  {
    n: "Token pruning",
    cost: "cheap",
    d: "Drop low-information tokens using a small language model's perplexity, keeping what carries meaning. Achieves high ratios but produces text that reads as damaged — fine for a model, not for a human reviewer.",
    box: "border-purple-500/25 bg-purple-500/[0.07]",
    label: "text-purple-400",
  },
  {
    n: "Abstractive summarisation",
    cost: "expensive",
    d: "Summarise each document with respect to the query. The highest compression ratio available, and the only method here that can introduce a claim the source did not make.",
    box: "border-amber-500/25 bg-amber-500/[0.07]",
    label: "text-amber-400",
  },
  {
    n: "Redundancy removal",
    cost: "cheap",
    d: "Drop chunks that are near-duplicates of ones already selected, using maximal marginal relevance. Cheap, safe, and often the single biggest win on corpora with repeated boilerplate.",
    box: "border-teal-500/25 bg-teal-500/[0.07]",
    label: "text-teal-400",
  },
];

export default function RagCompression() {
  const toc = [
    { label: "The Problem", hash: "problem" },
    { label: "Count the Waste", hash: "budget" },
    { label: "Six Techniques", hash: "methods" },
    { label: "Where It Sits", hash: "pipeline" },
    { label: "Lost in the Middle", hash: "middle" },
    { label: "In Code", hash: "code" },
    { label: "The Risk", hash: "risk" },
  ];

  return (
    <GuideLayout
      title="Contextual Compression"
      intro="Retrieval gives you chunks. Only a fraction of each chunk answers the question. Compression strips the rest before it reaches the model."
      toc={toc}
    >
      <section id="problem" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Problem</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          Chunking is a compromise made at index time, before anyone knows what will be asked. A 500-token chunk is
          large enough to carry context and small enough to embed meaningfully. But when a query arrives, the answer
          might be one sentence inside it, and the other 480 tokens go to the model anyway.
        </p>
        <p className="text-gray-300 leading-relaxed max-w-3xl">
          Contextual compression closes that gap. It is a post-retrieval step that re-reads what came back, now that
          the query is known, and keeps only the parts that bear on it.
        </p>
      </section>

      <section id="budget" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Count the Waste</h2>
        <BudgetPanel />
      </section>

      <section id="methods" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Six Techniques</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          They differ mainly in what they spend to decide what to keep. Start at the cheap end.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {METHODS.map((m) => (
            <div key={m.n} className={`p-5 rounded-xl border ${m.box}`}>
              <div className="flex items-baseline justify-between gap-2 mb-1.5">
                <div className={`font-semibold ${m.label}`}>{m.n}</div>
                <div className="text-[0.625rem] uppercase tracking-wide text-gray-500">{m.cost}</div>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{m.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            A sensible default stack is redundancy removal, then a cross-encoder re-rank, then extractive filtering.
            All three are cheap, none of them can invent text, and together they typically cut context by half without
            touching answer quality.
          </p>
        </div>
      </section>

      <section id="pipeline" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Where It Sits</h2>
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 flex flex-wrap items-center justify-center gap-3 text-xs font-mono mb-5">
          {[
            ["query", "text-gray-300 border-gray-700 bg-black/40"],
            ["retrieve top-k", "text-blue-300 border-blue-500/40 bg-blue-900/20"],
            ["re-rank", "text-indigo-300 border-indigo-500/40 bg-indigo-900/20"],
            ["compress", "text-emerald-300 border-emerald-500/40 bg-emerald-900/20"],
            ["generate", "text-purple-300 border-purple-500/40 bg-purple-900/20"],
          ].map(([label, cls], i) => (
            <React.Fragment key={label}>
              {i > 0 && <span className="text-gray-600">→</span>}
              <span className={`px-3 py-1.5 border rounded-full ${cls}`}>{label}</span>
            </React.Fragment>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm font-semibold text-white mb-2">Retrieve more, not less</div>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              Compression changes the calculus upstream. Because you are no longer paying for every retrieved token,
              you can widen k and let compression do the narrowing. Recall goes up and context size still goes down.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm font-semibold text-white mb-2">Latency is the real cost</div>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              An LLM-based compressor adds a call before the call you wanted. Run compression across documents in
              parallel, and use a small fast model for it — this is not a job that needs your best one.
            </p>
          </div>
        </div>
      </section>

      <section id="middle" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Lost in the Middle</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          Models retrieve information from the start and end of a long context far more reliably than from the middle.
          The effect is well documented and it does not go away with larger context windows.
        </p>
        <div className="p-5 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>Two consequences for ordering.</strong> Shorter context means less middle to get lost in, which is
            the accuracy argument for compression. And when you do have several chunks, put the highest-scoring ones
            at the edges rather than in rank order — some frameworks call this long-context reordering, and it is a
            free improvement.
          </p>
        </div>
      </section>

      <section id="code" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">In Code</h2>
        <CodeBlock
          language="python"
          code={`from langchain.retrievers import ContextualCompressionRetriever
from langchain.retrievers.document_compressors import (
    DocumentCompressorPipeline,
    EmbeddingsFilter,
    LLMChainExtractor,
)
from langchain_community.document_transformers import (
    EmbeddingsRedundantFilter,
    LongContextReorder,
)
from langchain_text_splitters import CharacterTextSplitter

# Cheapest stages first, so the expensive ones see less work.
pipeline = DocumentCompressorPipeline(transformers=[
    CharacterTextSplitter(chunk_size=300, chunk_overlap=0),
    EmbeddingsRedundantFilter(embeddings=embeddings),      # drop near-duplicates
    EmbeddingsFilter(embeddings=embeddings, similarity_threshold=0.72),
    LongContextReorder(),        # best material to the edges, not the middle
])

retriever = ContextualCompressionRetriever(
    base_compressor=pipeline,
    # Retrieve wide: compression is what makes a large k affordable.
    base_retriever=vectorstore.as_retriever(search_kwargs={"k": 25}),
)

docs = retriever.invoke("What is the refund window for annual plans?")

# Measure it. Compression that does not shrink anything is pure added latency.
before = sum(len(d.page_content) for d in vectorstore.similarity_search(q, k=25))
after = sum(len(d.page_content) for d in docs)
print(f"{before} -> {after} chars ({before / max(after, 1):.1f}x)")`}
        />
      </section>

      <section id="risk" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Risk</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          Every compressor is a classifier, and classifiers make mistakes. The mistake that matters here is dropping
          the one sentence that held the answer — and unlike a retrieval miss, it is invisible downstream. The model
          answers confidently from what survived.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Ways it goes wrong</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>A threshold tuned on easy queries silently fails on hard ones.</li>
              <li>Qualifying clauses get cut, leaving a claim stated absolutely.</li>
              <li>Abstractive summaries introduce content not in the source.</li>
              <li>Cross-chunk context disappears, so pronouns lose their referents.</li>
            </ul>
          </div>
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">How to stay safe</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Measure end-to-end answer quality, never compression ratio alone.</li>
              <li>Prefer extractive methods where claims must be verbatim.</li>
              <li>Keep a floor: never compress below a minimum token count.</li>
              <li>Log what was dropped so a failure can be diagnosed later.</li>
            </ul>
          </div>
        </div>
        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            Related: <a href="#/rag/advanced-retrieval" className="text-blue-400 hover:underline">Advanced Retrieval</a>{" "}
            for the re-ranking stage, <a href="#/rag/chunking" className="text-blue-400 hover:underline">Chunking</a>{" "}
            for the upstream decision that creates the waste, and{" "}
            <a href="#/rag/evaluation" className="text-blue-400 hover:underline">Evaluation</a> for measuring whether
            any of this helped.
          </p>
        </div>
      </section>
      <KnowledgeCheck questions={questionsFor("rag-core")} />
    </GuideLayout>
  );
}

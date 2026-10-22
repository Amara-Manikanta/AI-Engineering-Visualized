import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section, Segmented } from "../components/VizKit";
import { rng, randn, pct, fmt } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "late interaction", "ColBERT", "ColBERTv2", "PLAID", "MaxSim", "multi-vector retrieval", "token-level embeddings",
  "ColPali", "bi-encoder", "cross-encoder", "Matryoshka embeddings", "Matryoshka representation learning", "MRL",
  "embedding truncation", "dimensions", "binary quantization", "binary embeddings", "Hamming distance", "int8 embeddings",
  "rescoring", "embedding storage cost",
];

/* ---------------------------------------------------------------------------
   MaxSim by hand. Tiny 4-D token vectors whose axes loosely mean
   [refund, time/days, shipping, electronics]. Everything is computed.
--------------------------------------------------------------------------- */

const TOK = {
  refund: [1, 0.1, 0, 0],
  return: [0.9, 0.1, 0.2, 0],
  window: [0.2, 0.9, 0, 0],
  days: [0.1, 1, 0, 0],
  "30": [0, 0.9, 0.1, 0],
  laptop: [0, 0, 0.1, 1],
  electronics: [0, 0.1, 0, 0.95],
  shipping: [0, 0.2, 1, 0],
  free: [0.1, 0, 0.8, 0.1],
  policy: [0.5, 0.3, 0.3, 0.3],
  orders: [0.2, 0.1, 0.7, 0.3],
  items: [0.3, 0, 0.3, 0.5],
  general: [0.42, 0.38, 0.1, 0.35],
  terms: [0.45, 0.35, 0.05, 0.38],
  conditions: [0.38, 0.4, 0.08, 0.32],
  purchases: [0.4, 0.3, 0.12, 0.42],
};

const norm = (v) => {
  const n = Math.hypot(...v) || 1;
  return v.map((x) => x / n);
};
const dot = (a, b) => a.reduce((s, x, i) => s + x * b[i], 0);

const QUERY = ["laptop", "refund", "window"];
const DOCS = [
  { id: "A", text: "Electronics can be returned within 30 days for a refund", tokens: ["electronics", "return", "30", "days", "refund"] },
  { id: "B", text: "General terms and conditions apply to all purchases and policy", tokens: ["general", "terms", "conditions", "purchases", "policy"] },
];

function meanPool(tokens) {
  const vs = tokens.map((t) => norm(TOK[t]));
  return norm(vs[0].map((_, i) => vs.reduce((s, v) => s + v[i], 0) / vs.length));
}

function MaxSimLab() {
  const [docId, setDocId] = useState("A");
  const doc = DOCS.find((d) => d.id === docId);
  const q = QUERY.map((t) => norm(TOK[t]));
  const scoreOf = (d) => {
    const dv = d.tokens.map((t) => norm(TOK[t]));
    const sims = q.map((qv) => dv.map((v) => dot(qv, v)));
    return { sims, maxsim: sims.reduce((s, row) => s + Math.max(...row), 0), single: dot(meanPool(QUERY), meanPool(d.tokens)) };
  };
  const all = DOCS.map((d) => ({ d, ...scoreOf(d) }));
  const cur = all.find((x) => x.d.id === docId);

  return (
    <Panel tone="indigo" title="Query: “laptop refund window” — which document should win?">
      <div className="mb-4">
        <Segmented value={docId} onChange={setDocId} options={DOCS.map((d) => ({ v: d.id, label: `Doc ${d.id}` }))} />
        <p className="text-sm text-gray-300 mt-3 mb-0">“{doc.text}”</p>
      </div>
      <div className="overflow-x-auto">
        <table className="text-xs font-mono border-separate border-spacing-1">
          <thead>
            <tr>
              <th />
              {doc.tokens.map((t, j) => (
                <th key={j} className="px-1 font-normal text-gray-400">{t}</th>
              ))}
              <th className="px-2 font-normal text-amber-300">max</th>
            </tr>
          </thead>
          <tbody>
            {QUERY.map((qt, i) => {
              const row = cur.sims[i];
              const m = Math.max(...row);
              return (
                <tr key={qt}>
                  <td className="pr-2 text-indigo-300">{qt}</td>
                  {row.map((v, j) => (
                    <td
                      key={j}
                      className={`w-14 h-8 text-center rounded ${v === m ? "ring-1 ring-amber-300 text-white" : "text-gray-400"}`}
                      style={{ background: `rgba(129,140,248,${Math.max(0, v) * 0.7})` }}
                    >
                      {v.toFixed(2)}
                    </td>
                  ))}
                  <td className="px-2 text-amber-300 font-bold">{m.toFixed(2)}</td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mt-4">
        {all.map((x) => (
          <React.Fragment key={x.d.id}>
            <Metric label={`Doc ${x.d.id} · MaxSim`} value={fmt(x.maxsim, 2)} tone={x.maxsim === Math.max(...all.map((y) => y.maxsim)) ? "emerald" : undefined} />
            <Metric label={`Doc ${x.d.id} · single vector`} value={fmt(x.single, 3)} tone={x.single === Math.max(...all.map((y) => y.single)) ? "rose" : undefined} />
          </React.Fragment>
        ))}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Late interaction keeps one vector per token. For each query token it finds the best-matching document
        token (the amber cells), then adds those maxima: every part of the question must be answered by something
        in the document. Doc A covers laptop (electronics), refund and window (30 days) and wins clearly. Now look
        at the single-vector scores, where each text is averaged into one vector: Doc B's vague, catch-all words
        average out to something close to the averaged query, so B edges ahead even though no word in it answers
        any part of the question. The single vector blurred away the detail that mattered.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Matryoshka truncation and binary quantisation, measured on a synthetic
   corpus whose embedding variance decays across dimensions the way
   Matryoshka training arranges it.
--------------------------------------------------------------------------- */

const DIM = 64;
const CORPUS = (() => {
  const r = rng(77);
  const scale = Array.from({ length: DIM }, (_, i) => Math.exp(-i / 18));
  const docs = Array.from({ length: 400 }, () => scale.map((s) => randn(r) * s));
  const queries = docs.slice(0, 150).map((d) => d.map((v, i) => v + randn(r) * 0.55 * scale[i]));
  return { docs, queries };
})();

function recallAt1(dims, binary) {
  const { docs, queries } = CORPUS;
  const cut = (v) => v.slice(0, dims);
  const cos = (a, b) => dot(a, b) / (Math.hypot(...a) * Math.hypot(...b) || 1);
  const bits = (v) => v.map((x) => (x > 0 ? 1 : 0));
  const D = docs.map(cut);
  const Db = binary ? D.map(bits) : null;
  let hit = 0;
  queries.forEach((qFull, qi) => {
    const q = cut(qFull);
    let best = -Infinity;
    let arg = -1;
    if (binary) {
      const qb = bits(q);
      D.forEach((_, di) => {
        let same = 0;
        for (let k = 0; k < dims; k++) same += qb[k] === Db[di][k] ? 1 : 0;
        if (same > best) {
          best = same;
          arg = di;
        }
      });
    } else {
      D.forEach((d, di) => {
        const s = cos(q, d);
        if (s > best) {
          best = s;
          arg = di;
        }
      });
    }
    if (arg === qi) hit++;
  });
  return hit / queries.length;
}

const DIM_STEPS = [4, 8, 16, 24, 32, 48, 64];

function MatryoshkaLab() {
  const [dims, setDims] = useState(32);
  const [binary, setBinary] = useState(false);
  const curve = useMemo(() => DIM_STEPS.map((d) => ({ d, full: recallAt1(d, false), bin: recallAt1(d, true) })), []);
  const cur = useMemo(() => recallAt1(dims, binary), [dims, binary]);
  // Storage for 10 million vectors at the chosen size, scaled up to a real 1024-D model.
  const realDims = Math.round((dims / DIM) * 1024);
  const bytes = binary ? realDims / 8 : realDims * 4;
  const gb = (bytes * 10_000_000) / 1e9;

  const W = 340;
  const H = 150;
  const x = (d) => 20 + ((d - 4) / 60) * (W - 34);
  const y = (v) => H - 20 - v * (H - 30);
  const path = (k) => curve.map((c, i) => `${i ? "L" : "M"}${x(c.d)},${y(c[k])}`).join("");

  return (
    <Panel tone="purple" title="Keep fewer dimensions, or fewer bits per dimension">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-5">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          <path d={path("full")} fill="none" stroke="#a78bfa" strokeWidth="2" />
          <path d={path("bin")} fill="none" stroke="#fbbf24" strokeWidth="2" strokeDasharray="5 3" />
          <line x1={x(dims)} y1="6" x2={x(dims)} y2={H - 20} stroke="#e5e7eb" strokeDasharray="3 3" />
          {[0, 0.5, 1].map((v) => (
            <text key={v} x="16" y={y(v) + 3} fill="#6b7280" fontSize="9" textAnchor="end">{v}</text>
          ))}
          <text x={W - 6} y="14" fill="#a78bfa" fontSize="10" textAnchor="end">float32, truncated</text>
          <text x={W - 6} y="28" fill="#fbbf24" fontSize="10" textAnchor="end">1 bit per dimension</text>
          <text x={x(4)} y={H - 5} fill="#6b7280" fontSize="10">4 dims</text>
          <text x={x(64)} y={H - 5} fill="#6b7280" fontSize="10" textAnchor="end">64</text>
        </svg>
        <div className="space-y-3">
          <Slider tone="purple" label="Dimensions kept (prefix)" value={dims} min={4} max={64} step={4} onChange={setDims} />
          <Segmented tone="purple" value={binary ? "bin" : "f32"} onChange={(v) => setBinary(v === "bin")} options={[{ v: "f32", label: "float32" }, { v: "bin", label: "binary" }]} />
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Recall@1" value={pct(cur, 0)} tone="purple" />
            <Metric label="Index for 10M docs" value={gb >= 1 ? `${gb.toFixed(1)} GB` : `${(gb * 1000).toFixed(0)} MB`} sub={`as if a 1024-D model → ${realDims} dims`} />
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Matryoshka-trained models pack the most important information into the first dimensions, so a prefix of
        the vector is itself a usable embedding — the curve rises steeply and then flattens. Binary quantisation
        keeps only the sign of each dimension (32× smaller) and compares with Hamming distance; it loses more
        recall, which is why systems retrieve extra candidates with bits and then rescore them with the full
        vectors. This corpus is synthetic and small; measure the trade-off on your own data before choosing.
      </p>
    </Panel>
  );
}

export default function RagLateInteraction() {
  const toc = [
    { label: "Beyond One Vector per Chunk", hash: "why" },
    { label: "Bi-encoder, Cross-encoder, Late Interaction", hash: "three" },
    { label: "MaxSim, by Hand", hash: "maxsim" },
    { label: "ColBERT in Practice", hash: "colbert" },
    { label: "Matryoshka & Binary Embeddings", hash: "matryoshka" },
    { label: "When to Use What", hash: "when" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Late Interaction & Matryoshka Embeddings"
      intro="Two ways to get more out of embeddings: keep a vector per token and match them at query time (ColBERT), or shrink vectors by truncation and binarisation (Matryoshka, binary quantisation) — with both computed live."
      toc={toc}
    >
      <Section id="why" title="Beyond One Vector per Chunk" lead="Standard dense retrieval squeezes a whole chunk into one vector. That is fast and cheap, but a single point in space has to stand for every idea in the text, and specific details get averaged away.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Keep more detail" tone="indigo"><p>Late interaction stores one vector per token and compares at the token level — better precision on specific, multi-part questions and new domains.</p></Card>
          <Card title="Spend less storage" tone="purple"><p>Matryoshka and binary embeddings cut index size by 4–32× so the same budget serves far more documents, with a measurable recall cost.</p></Card>
        </div>
      </Section>

      <Section id="three" title="Bi-encoder, Cross-encoder, Late Interaction">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Bi-encoder (dense)" tone="emerald"><p>Query and document encoded separately into one vector each; score = cosine. Documents pre-computed, search is a nearest-neighbour lookup. Fastest; least precise.</p></Card>
          <Card title="Cross-encoder (reranker)" tone="rose"><p>Query and document fed through the model together; every token attends to every other. Most accurate, but must run per pair at query time — only for re-ranking a shortlist. See <a href="#/rag/advanced-retrieval" className="text-blue-400 hover:underline">Advanced Retrieval</a>.</p></Card>
          <Card title="Late interaction (ColBERT)" tone="indigo"><p>Encode separately, but keep token vectors; interact only at the end with a cheap MaxSim. Documents still pre-computed, precision closer to a cross-encoder.</p></Card>
        </div>
      </Section>

      <Section id="maxsim" title="MaxSim, by Hand" lead="Toy 4-dimensional token vectors, so the arithmetic is visible. Real ColBERT vectors have 128 dimensions.">
        <MaxSimLab />
        <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-sm text-gray-200 text-center mt-5 overflow-x-auto">
          score(q, d) = Σ over query tokens i of  max over doc tokens j of  (qᵢ · dⱼ)
        </div>
      </Section>

      <Section id="colbert" title="ColBERT in Practice">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Storage is the cost" tone="rose"><p>A 300-token chunk stores 300 vectors instead of one. ColBERTv2 compresses them with centroids plus small residuals, and PLAID-style engines prune candidates before full scoring.</p></Card>
          <Card title="Strong out of domain" tone="emerald"><p>Token-level matching generalises well to domains the model was not trained on — a common failure point for single-vector models.</p></Card>
          <Card title="ColPali for documents" tone="purple"><p>The same idea on page images: patch vectors from a vision-language model, so PDFs can be searched without OCR or parsing. See <a href="#/rag/multimodal-rag" className="text-blue-400 hover:underline">Multimodal RAG</a>.</p></Card>
        </div>
      </Section>

      <Section id="matryoshka" title="Matryoshka & Binary Embeddings" lead="Recall@1 on a synthetic corpus of 400 documents, computed in your browser for every setting.">
        <MatryoshkaLab />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <Card title="Matryoshka (MRL)" tone="purple"><p>Trained so the first 64, 128, 256… dimensions each work as an embedding on their own. Several hosted and open embedding models support choosing a shorter output size.</p></Card>
          <Card title="int8 / scalar" tone="indigo"><p>Store each dimension as one byte instead of four. Usually a small recall loss for a 4× saving.</p></Card>
          <Card title="Binary + rescore" tone="amber"><p>1 bit per dimension and Hamming distance for a first pass over many candidates; rescore the shortlist with float vectors kept on disk.</p></Card>
        </div>
      </Section>

      <Section id="when" title="When to Use What">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-white/5 text-gray-400 text-left">
              <tr><th className="p-3 font-medium">Situation</th><th className="p-3 font-medium">Reach for</th></tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-t border-white/5"><td className="p-3">Good recall already, answers miss specifics</td><td className="p-3 text-xs">Add a cross-encoder reranker first — cheapest precision win</td></tr>
              <tr className="border-t border-white/5"><td className="p-3">Specialised domain, multi-part questions, reranking too slow</td><td className="p-3 text-xs">Late interaction (ColBERT) as the retriever or reranker</td></tr>
              <tr className="border-t border-white/5"><td className="p-3">Index too large or too expensive</td><td className="p-3 text-xs">Matryoshka truncation, then int8 or binary with rescoring</td></tr>
              <tr className="border-t border-white/5"><td className="p-3">Scanned PDFs, slides, charts</td><td className="p-3 text-xs">ColPali-style visual late interaction</td></tr>
            </tbody>
          </table>
        </div>
        <Note tone="indigo">
          Whatever you try, measure it on your own queries with <a href="#/rag/evaluation" className="text-blue-400 hover:underline">retrieval metrics</a> — these trade-offs vary a lot between corpora.
        </Note>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`# Late interaction with the RAGatouille wrapper around ColBERT
from ragatouille import RAGPretrainedModel
colbert = RAGPretrainedModel.from_pretrained("colbert-ir/colbertv2.0")
colbert.index(collection=[d.page_content for d in docs], index_name="kb")
hits = colbert.search("laptop refund window", k=5)

# Matryoshka truncation + binary quantisation with sentence-transformers
from sentence_transformers import SentenceTransformer
from sentence_transformers.quantization import quantize_embeddings

model = SentenceTransformer("your-matryoshka-embedding-model", truncate_dim=256)
emb = model.encode(texts, normalize_embeddings=True)          # 256-D prefix
binary = quantize_embeddings(emb, precision="ubinary")          # 32 bytes per vector`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("rag-late-interaction")} />
    </GuideLayout>
  );
}

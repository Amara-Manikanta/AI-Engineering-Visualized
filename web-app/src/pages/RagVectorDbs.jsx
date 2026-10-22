import React, { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Database, Search, Zap, ArrowRight, GitBranch, Layers, Shuffle, AlertTriangle, CheckCircle } from "lucide-react";
import GuideLayout from "../components/GuideLayout";

const toc = [
  { label: "1. What is a Vector Database?", hash: "#what-is-vdb" },
  { label: "2. Why RAG needs a Vector DB", hash: "#why-rag-vdb" },
  { label: "3. Vector DB vs SQL vs Keyword Search", hash: "#vdb-vs-sql" },
  { label: "4. What gets stored?", hash: "#what-stored" },
  { label: "5. Collections, indexes, records, metadata", hash: "#collections" },
  { label: "6. Indexing-time flow", hash: "#indexing-flow" },
  { label: "7. Query-time flow", hash: "#query-flow" },
  { label: "8. Similarity search", hash: "#sim-search" },
  { label: "9. Similarity metrics", hash: "#sim-metrics" },
  { label: "10. Exact vs Approximate search", hash: "#exact-vs-approx" },
  { label: "11. ANN search", hash: "#ann-search" },
  { label: "12. Vector index types", hash: "#index-types" },
  { label: "13. Metadata filtering", hash: "#metadata-filtering" },
  { label: "14. Hybrid search", hash: "#hybrid-search" },
  { label: "15. Re-ranking", hash: "#reranking" },
  { label: "16. Namespaces & multi-tenancy", hash: "#namespaces" },
  { label: "17. Popular Vector DBs", hash: "#popular-vdbs" },
  { label: "18. How to choose a Vector DB", hash: "#how-to-choose" },
  { label: "19. Python example with Chroma", hash: "#python-chroma" },
  { label: "20. Production considerations", hash: "#production" },
  { label: "21. Common mistakes", hash: "#mistakes" },
  { label: "22. Summary", hash: "#summary" },
];

// ─── Animated Comparison: SQL vs Keyword vs Vector ──────────────────────────
const SearchCompare = () => {
  const [active, setActive] = useState("sql");
  const data = {
    sql: {
      label: "SQL / Relational",
      color: "blue",
      query: 'SELECT * FROM docs WHERE title = "RAG"',
      description: "Exact match only. Finds documents with the exact word 'RAG' in the title. Misses 'Retrieval-Augmented Generation'.",
      result: ["✅ RAG tutorial", "❌ Misses: 'Retrieval-Augmented Generation'", "❌ Misses: 'Vector search in LLMs'"],
    },
    keyword: {
      label: "Keyword / BM25",
      color: "amber",
      query: '"What is RAG?"  →  BM25 score by word frequency',
      description: "Scores documents by word frequency (TF-IDF). Better than SQL but still misses semantic synonyms.",
      result: ["✅ RAG overview", "✅ RAG guide", "❌ Misses: 'How LLMs use external knowledge'"],
    },
    vector: {
      label: "Vector DB",
      color: "indigo",
      query: '"What is RAG?"  →  embed  →  [0.91, 0.13, ...]  →  cosine similarity',
      description: "Understands meaning. Finds semantically similar documents even if they use completely different words.",
      result: ["✅ Retrieval-Augmented Generation", "✅ How LLMs use external knowledge", "✅ Grounding AI with real-time data"],
    },
  };
  const c = data[active];
  const colorMap = {
    blue: { bg: "bg-blue-900/20", border: "border-blue-500/40", text: "text-blue-400", btn: "bg-blue-600" },
    amber: { bg: "bg-amber-900/20", border: "border-amber-500/40", text: "text-amber-400", btn: "bg-amber-600" },
    indigo: { bg: "bg-indigo-900/20", border: "border-indigo-500/40", text: "text-indigo-400", btn: "bg-indigo-600" },
  };
  const col = colorMap[c.color];
  return (
    <div className="bg-[#111] border border-gray-800 rounded-xl p-6 my-6">
      <div className="flex flex-wrap gap-3 mb-6">
        {Object.entries(data).map(([k, v]) => (
          <button key={k} onClick={() => setActive(k)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${active === k ? colorMap[v.color].btn + " text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
          >{v.label}</button>
        ))}
      </div>
        <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
          <div className={`${col.bg} border ${col.border} rounded-lg p-4 font-mono text-xs mb-4 ${col.text}`}>{c.query}</div>
          <p className="text-gray-300 text-sm mb-4">{c.description}</p>
          <ul className="space-y-2">
            {c.result.map((r, i) => (
              <li key={i} className={`text-sm font-mono ${r.startsWith("✅") ? "text-emerald-400" : "text-rose-400"}`}>{r}</li>
            ))}
          </ul>
        </motion.div>
    </div>
  );
};

// ─── Indexing Flow Animation ─────────────────────────────────────────────────
const IndexingFlow = () => {
  const steps = [
    { icon: <Layers size={20} />, label: "Raw Document", sub: "PDF / TXT / HTML", color: "text-gray-400 border-gray-600" },
    { icon: <GitBranch size={20} />, label: "Chunking", sub: "Split into passages", color: "text-blue-400 border-blue-600" },
    { icon: <Zap size={20} />, label: "Embedding Model", sub: "text → [0.12, ...]", color: "text-purple-400 border-purple-600" },
    { icon: <Database size={20} />, label: "Vector Store", sub: "Save vector + metadata", color: "text-indigo-400 border-indigo-600" },
  ];
  return (
    <div className="bg-[#111] border border-gray-800 rounded-xl p-6 my-6">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.2, type: "spring" }}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border bg-[#1a1a1a] ${s.color} w-32`}>
              {s.icon}
              <span className="text-xs font-bold text-center">{s.label}</span>
              <span className="text-[0.625rem] text-gray-500 text-center">{s.sub}</span>
            </motion.div>
            {i < steps.length - 1 && (
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.2 + 0.1 }}>
                <ArrowRight size={20} className="text-gray-600" />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ─── Query Flow Animation ─────────────────────────────────────────────────────
const QueryFlow = () => {
  const steps = [
    { icon: <Search size={20} />, label: "User Query", sub: '"What is RAG?"', color: "text-emerald-400 border-emerald-600" },
    { icon: <Zap size={20} />, label: "Embedding Model", sub: "Same model as index", color: "text-purple-400 border-purple-600" },
    { icon: <Database size={20} />, label: "Vector DB Search", sub: "Top-K nearest neighbors", color: "text-indigo-400 border-indigo-600" },
    { icon: <CheckCircle size={20} />, label: "Retrieved Chunks", sub: "Context for LLM", color: "text-teal-400 border-teal-600" },
  ];
  return (
    <div className="bg-[#111] border border-gray-800 rounded-xl p-6 my-6">
      <div className="flex flex-wrap items-center justify-center gap-2">
        {steps.map((s, i) => (
          <React.Fragment key={i}>
            <motion.div initial={{ opacity: 0, scale: 0.8 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.2, type: "spring" }}
              className={`flex flex-col items-center gap-2 p-4 rounded-xl border bg-[#1a1a1a] ${s.color} w-32`}>
              {s.icon}
              <span className="text-xs font-bold text-center">{s.label}</span>
              <span className="text-[0.625rem] text-gray-500 text-center">{s.sub}</span>
            </motion.div>
            {i < steps.length - 1 && (
              <motion.div initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: i * 0.2 + 0.1 }}>
                <ArrowRight size={20} className="text-gray-600" />
              </motion.div>
            )}
          </React.Fragment>
        ))}
      </div>
    </div>
  );
};

// ─── Similarity Metrics Visualizer ───────────────────────────────────────────
const SimilarityMetrics = () => {
  const [active, setActive] = useState("cosine");
  const metrics = {
    cosine: {
      name: "Cosine Similarity",
      formula: "cos(θ) = (A · B) / (‖A‖ × ‖B‖)",
      color: "indigo",
      desc: "Measures the angle between two vectors. Ignores magnitude — only cares about direction. Most common for text.",
      range: "Range: −1 to +1 (higher = more similar)",
      useCase: "✅ Best for: Text similarity in RAG",
    },
    dot: {
      name: "Dot Product",
      formula: "A · B = Σ(Aᵢ × Bᵢ)",
      color: "emerald",
      desc: "Measures both angle AND magnitude. If your vectors are normalized to length 1, it equals cosine similarity.",
      range: "Range: −∞ to +∞ (higher = more similar)",
      useCase: "✅ Best for: Normalized vectors, fast computation",
    },
    euclidean: {
      name: "Euclidean Distance",
      formula: "d = √Σ(Aᵢ − Bᵢ)²",
      color: "rose",
      desc: "Measures the straight-line distance between two points in space. Unlike cosine, it is sensitive to magnitude.",
      range: "Range: 0 to +∞ (lower = more similar)",
      useCase: "✅ Best for: Image embeddings, clustering",
    },
  };
  const colorMap = {
    indigo: { bg: "bg-indigo-900/20", border: "border-indigo-500/40", text: "text-indigo-400", btn: "bg-indigo-600" },
    emerald: { bg: "bg-emerald-900/20", border: "border-emerald-500/40", text: "text-emerald-400", btn: "bg-emerald-600" },
    rose: { bg: "bg-rose-900/20", border: "border-rose-500/40", text: "text-rose-400", btn: "bg-rose-600" },
  };
  const m = metrics[active];
  const col = colorMap[m.color];
  return (
    <div className="bg-[#111] border border-gray-800 rounded-xl p-6 my-6">
      <div className="flex flex-wrap gap-3 mb-6">
        {Object.entries(metrics).map(([k, v]) => (
          <button key={k} onClick={() => setActive(k)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${active === k ? colorMap[v.color].btn + " text-white" : "bg-gray-800 text-gray-400 hover:bg-gray-700"}`}
          >{v.name}</button>
        ))}
      </div>
        <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }}>
          <div className={`${col.bg} border ${col.border} rounded-lg p-4 font-mono text-lg text-center mb-4 ${col.text} font-bold`}>{m.formula}</div>
          <p className="text-gray-300 text-sm mb-2">{m.desc}</p>
          <p className="text-gray-400 text-xs mb-2 font-mono">{m.range}</p>
          <p className="text-sm font-semibold text-emerald-400">{m.useCase}</p>
        </motion.div>
    </div>
  );
};

// ─── Index Types Visualizer ───────────────────────────────────────────────────
const IndexTypeCards = () => {
  const [open, setOpen] = useState(null);
  const types = [
    { id: "flat", name: "Flat / Brute Force", color: "bg-gray-900/50 border-gray-600", icon: "🔍", summary: "Checks every single vector.", detail: "100% accurate but extremely slow at scale. Use only for small datasets (< 10k vectors) or offline benchmarks.", complexity: "Time: O(n·d)", good: "< 10k vectors, needs 100% recall", bad: "Large production datasets" },
    { id: "hnsw", name: "HNSW", color: "bg-indigo-900/20 border-indigo-600", icon: "🌐", summary: "Multi-layer graph navigation.", detail: "Hierarchical Navigable Small World. Builds a multi-layer proximity graph. Entry point at top layer, zoom in progressively. Extremely fast and accurate. Most popular choice for production.", complexity: "Build: O(n log n)", good: "High recall, fast query, production", bad: "High RAM usage" },
    { id: "ivf", name: "IVF", color: "bg-blue-900/20 border-blue-600", icon: "📦", summary: "Cluster first, search cluster.", detail: "Inverted File Index. Clusters all vectors using k-means. At query time, only searches the nearest clusters (nprobe). Lower RAM than HNSW but slightly less accurate.", complexity: "Requires training step", good: "Large datasets, low RAM budget", bad: "Needs re-training on data changes" },
    { id: "pq", name: "PQ", color: "bg-purple-900/20 border-purple-600", icon: "🗜️", summary: "Compress vectors to save RAM.", detail: "Product Quantization. Compresses high-dimensional vectors into small codes (e.g., 32 bytes instead of 3072×4=12KB). Often combined with IVF as IVF-PQ.", complexity: "Lossy compression", good: "Billions of vectors, RAM-constrained", bad: "Reduced recall vs HNSW" },
    { id: "diskann", name: "DiskANN", color: "bg-teal-900/20 border-teal-600", icon: "💾", summary: "Graph index stored on disk.", detail: "Designed by Microsoft. Stores the index on an SSD instead of RAM. Can handle billion-scale datasets on commodity hardware. Used in Azure AI Search.", complexity: "Disk I/O bound", good: "Billion-scale, cost-sensitive infra", bad: "Slower query than HNSW (disk latency)" },
  ];
  return (
    <div className="grid grid-cols-1 gap-4 my-6">
      {types.map(t => (
        <motion.div key={t.id} layout className={`border rounded-xl p-4 cursor-pointer transition-colors bg-[#111] ${t.color}`} onClick={() => setOpen(open === t.id ? null : t.id)}>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3">
              <span className="text-2xl">{t.icon}</span>
              <div>
                <h4 className="text-white font-bold">{t.name}</h4>
                <p className="text-gray-400 text-sm">{t.summary}</p>
              </div>
            </div>
            <span className="text-gray-500 text-lg">{open === t.id ? "▲" : "▼"}</span>
          </div>
          <AnimatePresence>
            {open === t.id && (
              <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }} transition={{ duration: 0.3 }} className="overflow-hidden">
                <div className="mt-4 pt-4 border-t border-gray-800 space-y-3">
                  <p className="text-gray-300 text-sm">{t.detail}</p>
                  <p className="text-gray-500 font-mono text-xs">{t.complexity}</p>
                  <div className="flex flex-wrap gap-3 text-xs">
                    <span className="bg-emerald-900/30 border border-emerald-600/40 text-emerald-400 px-2 py-1 rounded">✅ {t.good}</span>
                    <span className="bg-rose-900/30 border border-rose-600/40 text-rose-400 px-2 py-1 rounded">❌ {t.bad}</span>
                  </div>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      ))}
    </div>
  );
};

// ─── Popular Vector DBs Table ─────────────────────────────────────────────────
const VectorDBTable = () => {
  const dbs = [
    { name: "Pinecone", type: "Managed Cloud", license: "Proprietary", index: "HNSW", hybrid: "✅", best: "Production SaaS, zero ops" },
    { name: "Weaviate", type: "OSS / Cloud", license: "BSD", index: "HNSW", hybrid: "✅", best: "Hybrid search, modules" },
    { name: "Milvus", type: "OSS / Cloud", license: "Apache 2", index: "HNSW, IVF, DiskANN", hybrid: "✅", best: "Billion-scale, enterprise" },
    { name: "Chroma", type: "OSS", license: "Apache 2", index: "HNSW", hybrid: "❌", best: "Local dev, prototyping" },
    { name: "Qdrant", type: "OSS / Cloud", license: "Apache 2", index: "HNSW", hybrid: "✅", best: "Performance (Rust-based)" },
    { name: "pgvector", type: "Extension", license: "Open Source", index: "HNSW, IVF", hybrid: "✅", best: "Already using PostgreSQL" },
    { name: "Elasticsearch", type: "OSS / Cloud", license: "Elastic", index: "HNSW", hybrid: "✅", best: "Existing search infra" },
  ];
  return (
    <div className="overflow-x-auto my-6">
      <table className="w-full text-sm border-collapse">
        <thead>
          <tr className="bg-[#222] text-left">
            <th className="p-3 font-semibold text-white border-b border-[#333]">Name</th>
            <th className="p-3 font-semibold text-white border-b border-[#333]">Type</th>
            <th className="p-3 font-semibold text-white border-b border-[#333]">Index</th>
            <th className="p-3 font-semibold text-white border-b border-[#333]">Hybrid</th>
            <th className="p-3 font-semibold text-white border-b border-[#333]">Best For</th>
          </tr>
        </thead>
        <tbody>
          {dbs.map((db, i) => (
            <motion.tr key={db.name} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className={`border-b border-[#333] ${i % 2 === 0 ? "bg-[#1a1a1a]" : "bg-[#111]"} hover:bg-[#222] transition-colors`}>
              <td className="p-3 font-bold text-indigo-400">{db.name}</td>
              <td className="p-3 text-gray-300">{db.type}</td>
              <td className="p-3 font-mono text-xs text-gray-400">{db.index}</td>
              <td className="p-3 text-center">{db.hybrid}</td>
              <td className="p-3 text-gray-300 text-xs">{db.best}</td>
            </motion.tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default function RagVectorDbs() {
  return (
    <GuideLayout title="Vector Databases" intro="Specialized databases designed to store, index, and query high-dimensional embeddings at speed." toc={toc}>

      {/* 1 */}
      <section id="what-is-vdb" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">1. What is a Vector Database?</h2>
        <p className="text-gray-300 mb-4">A vector database is a specialized database system designed to store and efficiently search high-dimensional vectors (embeddings). Unlike traditional databases that search for exact matches, vector databases use mathematical similarity to find the most relevant results.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-5">
            <h4 className="font-bold text-rose-400 mb-2 flex items-center gap-2"><Database size={16}/> Traditional Database</h4>
            <p className="text-gray-400 text-sm">Stores structured data (rows, columns). Queries using exact match or range filters. Fast for CRUD operations, terrible for "find me something similar".</p>
          </div>
          <div className="bg-[#1a1a1a] border border-indigo-500/30 rounded-xl p-5">
            <h4 className="font-bold text-indigo-400 mb-2 flex items-center gap-2"><Database size={16}/> Vector Database</h4>
            <p className="text-gray-400 text-sm">Stores vectors (arrays of floats). Queries by similarity — finds neighbors in high-dimensional space. Built for semantic search, RAG, recommendations.</p>
          </div>
        </div>
        <p className="text-gray-300">The core operation of a vector database is: given a query vector, find the top-K vectors that are closest to it according to a similarity metric like cosine similarity.</p>
      </section>

      {/* 2 */}
      <section id="why-rag-vdb" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">2. Why RAG needs a Vector Database</h2>
        <p className="text-gray-300 mb-6">RAG works by first retrieving relevant context before generating an answer. For this retrieval to be semantic (not just keyword matching), you need a vector database. Here's why:</p>
        <div className="space-y-3 mb-6">
          {[
            { n: "1", t: "Your knowledge base is embedded into vectors and stored in a Vector DB.", c: "indigo" },
            { n: "2", t: "When a user asks a question, it is also embedded into a vector using the exact same model.", c: "purple" },
            { n: "3", t: "The Vector DB performs ANN search to find the top-K most semantically relevant chunks.", c: "emerald" },
            { n: "4", t: "Those chunks are injected into the LLM prompt as context.", c: "teal" },
          ].map(s => (
            <div key={s.n} className={`flex items-start gap-3 bg-${s.c}-900/10 border border-${s.c}-500/20 rounded-lg p-4`}>
              <span className={`text-${s.c}-400 font-black text-lg mt-0.5`}>{s.n}</span>
              <p className="text-gray-300 text-sm">{s.t}</p>
            </div>
          ))}
        </div>
        <p className="text-gray-300">Without a vector database, you'd need to embed the entire knowledge base into every single prompt — which is prohibitively expensive and exceeds context window limits.</p>
      </section>

      {/* 3 */}
      <section id="vdb-vs-sql" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">3. Vector DB vs SQL vs Keyword Search</h2>
        <p className="text-gray-300 mb-4">Click each option below to see how the same query behaves across different search paradigms:</p>
        <SearchCompare />
      </section>

      {/* 4 */}
      <section id="what-stored" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">4. What gets stored in a Vector DB?</h2>
        <p className="text-gray-300 mb-6">Each record in a vector database is called a <strong className="text-white">vector record</strong> or <strong className="text-white">point</strong>. It consists of three components stored together:</p>
        <div className="bg-[#111] border border-gray-800 rounded-xl p-6 font-mono text-sm mb-4">
          <div className="text-gray-400 mb-1">// A single record in a vector DB:</div>
          <div className="text-gray-200">{"{"}</div>
          <div className="ml-4">
            <span className="text-indigo-400">id</span>: <span className="text-emerald-400">"doc_chunk_42"</span>,<br/>
            <span className="text-indigo-400">vector</span>: <span className="text-yellow-400">[0.021, -0.541, 0.113, 0.882, ... 1536 floats]</span>,<br/>
            <span className="text-indigo-400">metadata</span>: {"{"}<br/>
            <span className="ml-4 text-purple-400">source</span>: <span className="text-emerald-400">"employee_handbook.pdf"</span>,<br/>
            <span className="ml-4 text-purple-400">page</span>: <span className="text-orange-400">12</span>,<br/>
            <span className="ml-4 text-purple-400">created_at</span>: <span className="text-emerald-400">"2024-01-15"</span>,<br/>
            <span className="ml-4 text-purple-400">text</span>: <span className="text-emerald-400">"Employees are entitled to 21 days of annual leave..."</span><br/>
            {"}"}
          </div>
          <div className="text-gray-200">{"}"}</div>
        </div>
        <p className="text-gray-300">The <strong className="text-indigo-400">vector</strong> enables similarity search. The <strong className="text-purple-400">metadata</strong> enables filtering and lets you display the original text to the user.</p>
      </section>

      {/* 5 */}
      <section id="collections" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">5. Collections, indexes, records, and metadata</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          {[
            { t: "Collection / Namespace", d: "A logical grouping of vectors, similar to a table in SQL. You might have separate collections for 'products', 'docs', and 'support tickets'.", c: "indigo" },
            { t: "Index", d: "The underlying data structure (HNSW, IVF, etc.) built on top of the vectors to enable fast approximate nearest neighbor search.", c: "purple" },
            { t: "Record / Point", d: "A single entry in the database: one vector + its ID + its metadata payload. The atomic unit of storage.", c: "teal" },
            { t: "Metadata / Payload", d: "Arbitrary key-value pairs attached to each record. Used for filtering results (e.g., only search documents from 2024, or from department=HR).", c: "emerald" },
          ].map(item => (
            <div key={item.t} className={`bg-[#1a1a1a] border border-${item.c}-500/20 rounded-xl p-5`}>
              <h4 className={`font-bold text-${item.c}-400 mb-2`}>{item.t}</h4>
              <p className="text-gray-400 text-sm">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 6 */}
      <section id="indexing-flow" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">6. Indexing-time flow</h2>
        <p className="text-gray-300 mb-4">This happens <strong className="text-white">before</strong> any user ever asks a question. You process your entire knowledge base and store it in the vector DB.</p>
        <IndexingFlow />
        <div className="bg-amber-900/10 border border-amber-500/20 rounded-xl p-4 mt-4">
          <p className="text-amber-400 text-sm font-semibold">⚠️ Important: You must use the exact same embedding model at both indexing time and query time. Mixing models will produce incompatible vector spaces and completely wrong results.</p>
        </div>
      </section>

      {/* 7 */}
      <section id="query-flow" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">7. Query-time flow</h2>
        <p className="text-gray-300 mb-4">This happens in real time, every time a user sends a message to your application.</p>
        <QueryFlow />
      </section>

      {/* 8 */}
      <section id="sim-search" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">8. Similarity search</h2>
        <p className="text-gray-300 mb-4">Similarity search is the core operation of a vector database. Given a query vector <strong className="text-white">q</strong>, find the <strong className="text-white">K</strong> vectors in the database that are most similar to it.</p>
        <div className="bg-[#111] border border-gray-800 rounded-xl p-6 mb-4">
          <div className="flex flex-col md:flex-row items-center gap-6">
            <div className="flex-1">
              <h4 className="text-white font-bold mb-2">Query Vector</h4>
              <div className="font-mono text-xs text-indigo-400 bg-[#1a1a1a] p-3 rounded">[0.91, 0.13, 0.05, ...]</div>
            </div>
            <div className="text-gray-500 flex-shrink-0">→ Compare to all →</div>
            <div className="flex-1 space-y-2">
              <div className="font-mono text-xs text-emerald-400 bg-emerald-900/20 border border-emerald-600/30 p-2 rounded">Score: 0.98 — "What is RAG?"</div>
              <div className="font-mono text-xs text-emerald-400 bg-emerald-900/20 border border-emerald-600/30 p-2 rounded">Score: 0.95 — "Retrieval-Augmented Generation"</div>
              <div className="font-mono text-xs text-emerald-400 bg-emerald-900/20 border border-emerald-600/30 p-2 rounded">Score: 0.88 — "How LLMs use external data"</div>
              <div className="font-mono text-xs text-gray-600 bg-[#1a1a1a] border border-[#333] p-2 rounded">Score: 0.21 — "How to bake biryani"</div>
            </div>
          </div>
        </div>
        <p className="text-gray-300">The top-K results (e.g., K=3) are returned as the retrieved context. The value of K is a hyperparameter you tune based on your use case — too small misses relevant info, too large adds noise.</p>
      </section>

      {/* 9 */}
      <section id="sim-metrics" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">9. Similarity metrics</h2>
        <p className="text-gray-300 mb-4">Click a metric to explore it:</p>
        <SimilarityMetrics />
        <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 mt-4">
          <p className="text-gray-300 text-sm"><strong className="text-white">Critical rule:</strong> The similarity metric you use at query time must match the metric the embedding model was trained with. For most OpenAI and HuggingFace models, this is <strong className="text-indigo-400">cosine similarity</strong>.</p>
        </div>
      </section>

      {/* 10 */}
      <section id="exact-vs-approx" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">10. Exact search vs Approximate search</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
          <div className="bg-[#1a1a1a] border border-rose-500/20 rounded-xl p-5">
            <h4 className="font-bold text-rose-400 mb-2">Exact / Brute-Force</h4>
            <p className="text-gray-400 text-sm mb-3">Compares the query to every single vector. Guaranteed 100% accurate (recall = 1.0).</p>
            <ul className="text-xs space-y-1 text-gray-500">
              <li>✅ Perfect recall</li>
              <li>❌ O(n) time — scales terribly</li>
              <li>❌ Unusable for millions of vectors</li>
            </ul>
          </div>
          <div className="bg-[#1a1a1a] border border-indigo-500/20 rounded-xl p-5">
            <h4 className="font-bold text-indigo-400 mb-2">Approximate Nearest Neighbor (ANN)</h4>
            <p className="text-gray-400 text-sm mb-3">Trades a tiny bit of recall for massive speed gains. Recall is typically 95–99%, which is good enough for RAG.</p>
            <ul className="text-xs space-y-1 text-gray-500">
              <li>✅ Sub-millisecond queries at scale</li>
              <li>✅ Works with millions/billions of vectors</li>
              <li>❌ Occasionally misses a perfect match</li>
            </ul>
          </div>
        </div>
        <p className="text-gray-300">For RAG applications, ANN is always the right choice. The tiny recall loss is irrelevant — the LLM can generate a good answer from 95%-relevant context.</p>
      </section>

      {/* 11 */}
      <section id="ann-search" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">11. ANN search</h2>
        <p className="text-gray-300 mb-4">ANN (Approximate Nearest Neighbor) search is powered by a <strong className="text-white">vector index</strong> — a data structure built at insert time that allows the database to skip most of the vectors during a query. The main families are graph-based (HNSW), cluster-based (IVF), and compression-based (PQ).</p>
        <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-5">
          <p className="text-indigo-300 text-sm font-mono">Query time: O(log n) for HNSW · versus · O(n·d) for Flat</p>
          <p className="text-gray-400 text-sm mt-2">For 10 million 1536-dim vectors, HNSW queries in ~2ms. Flat search takes ~60 seconds. That's a 30,000× speedup.</p>
        </div>
      </section>

      {/* 12 */}
      <section id="index-types" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">12. Vector index types</h2>
        <p className="text-gray-300 mb-4">Click any index type to expand its explanation:</p>
        <IndexTypeCards />
      </section>

      {/* 13 */}
      <section id="metadata-filtering" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">13. Metadata filtering</h2>
        <p className="text-gray-300 mb-4">Metadata filtering lets you combine vector similarity search with traditional attribute filters. This is essential for real-world RAG applications where you need to scope results to a specific user, date range, department, or category.</p>
        <div className="bg-[#111] border border-gray-800 rounded-xl p-6 font-mono text-sm mb-4 space-y-3">
          <div className="text-gray-400">// Without filter — searches all documents</div>
          <div className="text-gray-300">collection.query(query_embeddings=q, n_results=5)</div>
          <div className="border-t border-[#333] pt-3 text-gray-400">// With metadata filter — only HR documents from 2024</div>
          <div className="text-emerald-400">{'collection.query(query_embeddings=q, n_results=5,'}<br/>{'  where={"department": "HR", "year": {"$gte": 2024}})'}</div>
        </div>
        <div className="bg-amber-900/10 border border-amber-500/20 rounded-xl p-4">
          <p className="text-amber-400 text-sm"><strong>⚠️ Performance note:</strong> Pre-filtering (filter then search) can hurt recall. Post-filtering (search then filter) can return fewer than K results. Most production databases use ACORN or similar algorithms to handle this correctly.</p>
        </div>
      </section>

      {/* 14 */}
      <section id="hybrid-search" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">14. Hybrid search</h2>
        <p className="text-gray-300 mb-4">Hybrid search combines <strong className="text-white">dense vector search</strong> (semantic) with <strong className="text-white">sparse keyword search</strong> (BM25/TF-IDF). The scores are then fused together using RRF (Reciprocal Rank Fusion) or a weighted sum.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="bg-[#1a1a1a] border border-indigo-500/20 rounded-xl p-4 text-center">
            <p className="text-indigo-400 font-bold mb-1">Dense (Vector)</p>
            <p className="text-gray-400 text-xs">Understands meaning. Handles synonyms and paraphrases.</p>
          </div>
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4 text-center flex flex-col items-center justify-center">
            <Shuffle size={24} className="text-gray-500 mb-1" />
            <p className="text-gray-500 text-xs font-bold">RRF Fusion</p>
          </div>
          <div className="bg-[#1a1a1a] border border-amber-500/20 rounded-xl p-4 text-center">
            <p className="text-amber-400 font-bold mb-1">Sparse (BM25)</p>
            <p className="text-gray-400 text-xs">Matches exact keywords. Great for product codes, names, IDs.</p>
          </div>
        </div>
        <p className="text-gray-300">Hybrid search consistently outperforms either method alone, especially for queries that mix semantic and keyword intent (e.g., "Python RAG tutorial 2024").</p>
      </section>

      {/* 15 */}
      <section id="reranking" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">15. Re-ranking</h2>
        <p className="text-gray-300 mb-4">After ANN retrieves the top-K results (e.g., 50), a <strong className="text-white">re-ranker model</strong> re-scores each result by doing a deep cross-attention comparison between the query and each chunk. It is much slower but far more accurate than vector similarity alone.</p>
        <div className="flex flex-col md:flex-row items-center gap-4 bg-[#111] border border-gray-800 rounded-xl p-6">
          <div className="flex-1 text-center">
            <p className="text-gray-400 text-sm mb-1">ANN retrieves</p>
            <p className="text-white font-bold text-2xl">Top 50</p>
            <p className="text-gray-500 text-xs">fast, approximate</p>
          </div>
          <ArrowRight className="text-gray-600" />
          <div className="flex-1 text-center">
            <p className="text-gray-400 text-sm mb-1">Reranker scores</p>
            <p className="text-white font-bold text-2xl">All 50</p>
            <p className="text-gray-500 text-xs">slow, cross-attention</p>
          </div>
          <ArrowRight className="text-gray-600" />
          <div className="flex-1 text-center">
            <p className="text-gray-400 text-sm mb-1">Returns</p>
            <p className="text-white font-bold text-2xl">Top 5</p>
            <p className="text-gray-500 text-xs">accurate, to LLM</p>
          </div>
        </div>
        <p className="text-gray-300 mt-4">Popular reranker models: <code className="bg-[#222] text-indigo-300 px-1.5 py-0.5 rounded">cohere.rerank</code>, <code className="bg-[#222] text-indigo-300 px-1.5 py-0.5 rounded">BAAI/bge-reranker-v2-m3</code>, <code className="bg-[#222] text-indigo-300 px-1.5 py-0.5 rounded">cross-encoder/ms-marco-MiniLM</code>.</p>
      </section>

      {/* 16 */}
      <section id="namespaces" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">16. Namespaces and multi-tenancy</h2>
        <p className="text-gray-300 mb-4">In a multi-tenant SaaS application, each customer's data must be isolated. Vector databases support this via <strong className="text-white">namespaces</strong> (Pinecone) or <strong className="text-white">collections</strong> (Chroma/Weaviate) or <strong className="text-white">tenant IDs in metadata</strong>.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4">
            <h4 className="font-bold text-indigo-400 mb-2">Per-namespace approach</h4>
            <p className="text-gray-400 text-sm">Each customer gets their own namespace/collection. Cleanest isolation. Scales to thousands of tenants easily.</p>
            <div className="font-mono text-xs text-gray-500 mt-2">namespace=f"tenant_{'{customer_id}'}"</div>
          </div>
          <div className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4">
            <h4 className="font-bold text-amber-400 mb-2">Metadata-filter approach</h4>
            <p className="text-gray-400 text-sm">All tenants share one collection. Filter by tenant_id on every query. Simpler to manage but needs careful access control.</p>
            <div className="font-mono text-xs text-gray-500 mt-2">{'where={"tenant_id": customer_id}'}</div>
          </div>
        </div>
      </section>

      {/* 17 */}
      <section id="popular-vdbs" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">17. Popular Vector DBs</h2>
        <p className="text-gray-300 mb-2">Here is a comparison of the most widely used vector databases:</p>
        <VectorDBTable />
      </section>

      {/* 18 */}
      <section id="how-to-choose" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">18. How to choose a Vector DB</h2>
        <div className="space-y-3">
          {[
            { q: "Prototyping or local dev?", a: "→ Use Chroma. Zero setup, runs in-memory or on disk.", c: "indigo" },
            { q: "Already using PostgreSQL?", a: "→ Use pgvector. Zero additional infrastructure.", c: "blue" },
            { q: "Need managed cloud, zero ops?", a: "→ Use Pinecone or Qdrant Cloud.", c: "purple" },
            { q: "Need billion-scale open source?", a: "→ Use Milvus or Weaviate.", c: "teal" },
            { q: "Need top performance (Rust)?", a: "→ Use Qdrant.", c: "emerald" },
            { q: "Need hybrid (vector + keyword)?", a: "→ Use Weaviate, Milvus, Qdrant, or Elasticsearch.", c: "amber" },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, x: -10 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.07 }}
              className="flex flex-col md:flex-row gap-2 md:items-center bg-[#1a1a1a] border border-[#333] rounded-xl p-4">
              <p className="text-gray-300 font-semibold text-sm md:w-64 flex-shrink-0">{item.q}</p>
              <p className={`text-${item.c}-400 text-sm font-mono`}>{item.a}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* 19 */}
      <section id="python-chroma" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">19. Python example with Chroma</h2>
        <p className="text-gray-300 mb-4">ChromaDB is the easiest vector database to get started with locally. Here's a complete working example:</p>
        <h4 className="text-white font-semibold mb-2 mt-4">Install</h4>
        <pre className="bg-[#111] border border-[#333] rounded-xl p-4 font-mono text-sm overflow-x-auto text-gray-300 mb-4"><code>{`pip install chromadb sentence-transformers`}</code></pre>
        <h4 className="text-white font-semibold mb-2">Index documents</h4>
        <pre className="bg-[#111] border border-[#333] rounded-xl p-4 font-mono text-sm overflow-x-auto text-gray-300 mb-4"><code>{`import chromadb

# Create a local persistent client
client = chromadb.PersistentClient(path="./my_vector_db")

# Create a collection
collection = client.get_or_create_collection(
    name="my_docs",
    metadata={"hnsw:space": "cosine"}  # use cosine similarity
)

# Add documents (Chroma auto-embeds with all-MiniLM by default)
collection.add(
    ids=["doc1", "doc2", "doc3"],
    documents=[
        "RAG helps LLMs use external knowledge.",
        "Retrieval-Augmented Generation reduces hallucinations.",
        "How to bake a chocolate cake.",
    ],
    metadatas=[
        {"source": "ml_guide.pdf", "year": 2024},
        {"source": "rag_paper.pdf", "year": 2023},
        {"source": "recipes.pdf", "year": 2022},
    ]
)`}</code></pre>
        <h4 className="text-white font-semibold mb-2">Query</h4>
        <pre className="bg-[#111] border border-[#333] rounded-xl p-4 font-mono text-sm overflow-x-auto text-gray-300"><code>{`# Semantic search
results = collection.query(
    query_texts=["What is RAG?"],
    n_results=2,
    where={"year": {"$gte": 2023}}  # optional metadata filter
)

print(results["documents"])
# [['RAG helps LLMs use external knowledge.',
#   'Retrieval-Augmented Generation reduces hallucinations.']]`}</code></pre>
      </section>

      {/* 20 */}
      <section id="production" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">20. Production considerations</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { t: "Index warming", d: "After loading vectors, allow the HNSW index to 'warm up' with a few dummy queries before serving real traffic. Cold indexes have higher latency.", icon: "🔥" },
            { t: "Batch upserts", d: "Always upsert in batches (e.g., 1000 at a time). Single-insert loops are 10-100× slower than batch inserts due to round-trip overhead.", icon: "📦" },
            { t: "Embedding caching", d: "Cache query embeddings using a short TTL. The same or similar question asked twice shouldn't hit the embedding API twice.", icon: "💾" },
            { t: "Dimension mismatch", d: "Switching embedding models requires re-indexing the entire database. Plan your model choice carefully before going to production.", icon: "⚠️" },
            { t: "Quantization", d: "Use scalar quantization (SQ8) or binary quantization to compress stored vectors by 4-32×, dramatically reducing RAM and storage costs.", icon: "🗜️" },
            { t: "Monitoring recall", d: "Track retrieval quality metrics in production. If P95 cosine similarity drops, your data or queries have drifted — consider re-indexing.", icon: "📊" },
          ].map(item => (
            <div key={item.t} className="bg-[#1a1a1a] border border-[#333] rounded-xl p-4">
              <h4 className="font-bold text-white mb-2">{item.icon} {item.t}</h4>
              <p className="text-gray-400 text-sm">{item.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* 21 */}
      <section id="mistakes" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">21. Common mistakes</h2>
        <div className="space-y-4">
          {[
            { t: "Using different embedding models at index vs query time", d: "Produces completely wrong results. The vectors live in different mathematical spaces and are incompatible." },
            { t: "Using wrong similarity metric", d: "Using Euclidean distance with a model trained on cosine similarity will produce incorrect rankings." },
            { t: "Not storing original text in metadata", d: "You can't retrieve the actual document content for the LLM if you don't persist it alongside the vector." },
            { t: "Setting K too high", d: "Retrieving top-50 chunks when your LLM context is 4K tokens means most of the context will be truncated or diluted." },
            { t: "Ignoring HNSW efConstruction and M parameters", d: "Default HNSW settings trade recall for speed. For high-precision RAG, tune efConstruction and M upward." },
            { t: "Not using metadata filtering", d: "Searching the entire database when you should be filtering by user, department, or date adds noise and can leak cross-tenant data." },
          ].map((item, i) => (
            <div key={i} className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-4 flex gap-3">
              <AlertTriangle size={18} className="text-rose-400 mt-0.5 flex-shrink-0" />
              <div>
                <p className="text-rose-300 font-bold text-sm">{item.t}</p>
                <p className="text-gray-400 text-sm mt-1">{item.d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* 22 */}
      <section id="summary" className="mb-12">
        <h2 className="text-2xl font-bold mb-6 text-white">22. Summary</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { t: "Vector DB = similarity engine", d: "Built for finding semantically closest matches in high-dimensional space, not exact matches.", c: "indigo" },
            { t: "RAG relies on it", d: "Without a vector DB, you can't do efficient semantic retrieval at scale.", c: "purple" },
            { t: "HNSW is the default choice", d: "Fast, accurate, and supported by every major vector DB. Start here.", c: "blue" },
            { t: "ANN not exact", d: "Approximate is fine for RAG — 97% recall is good enough, and it's 10,000× faster.", c: "teal" },
            { t: "Metadata is essential", d: "Store source, date, user ID — enables filtering, access control, and displaying provenance.", c: "emerald" },
            { t: "Hybrid > dense alone", d: "Combine vector + BM25 search using RRF for best retrieval quality across query types.", c: "amber" },
            { t: "Add a reranker for precision", d: "A cross-encoder reranker on top of ANN results significantly improves final answer quality.", c: "rose" },
            { t: "Choose the right DB", d: "Chroma for local, pgvector if on Postgres, Qdrant for performance, Pinecone for managed.", c: "gray" },
          ].map((item, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }}
              className={`bg-[#1a1a1a] border border-${item.c}-500/20 rounded-xl p-4 flex items-start gap-3`}>
              <CheckCircle size={18} className={`text-${item.c}-400 mt-0.5 flex-shrink-0`} />
              <div>
                <p className="text-white font-bold text-sm">{item.t}</p>
                <p className="text-gray-400 text-xs mt-1">{item.d}</p>
              </div>
            </motion.div>
          ))}
        </div>
      </section>

    </GuideLayout>
  );
}

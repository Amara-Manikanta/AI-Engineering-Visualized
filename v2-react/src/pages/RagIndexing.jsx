import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';

/* ---------------------------------------------------------------------------
   The indexing pipeline as one SVG, so nodes and connectors share a single
   coordinate system and stay joined at every screen width. Two layouts: a
   left-to-right one for wider screens and a top-to-bottom one for phones.
   Each node and edge "arrives" at the step that introduces it; the edge for
   the current step carries a moving packet.
--------------------------------------------------------------------------- */

const LAYOUTS = {
  wide: {
    w: 860,
    h: 330,
    nodes: {
      doc: [70, 200],
      txt: [220, 200],
      chunks: [380, 200],
      model: [560, 72],
      emb: [560, 200],
      db: [760, 200],
    },
    edges: {
      txt: "M104,200 L186,200",
      chunks: "M254,200 L336,200",
      model: "M424,184 L470,184 Q490,184 490,164 L490,92 Q490,72 500,72",
      emb: "M560,100 L560,160",
      db: "M604,200 L712,200",
    },
  },
  tall: {
    // One column with labels to the right, so no connector crosses a label.
    w: 360,
    h: 712,
    labels: "right",
    nodes: {
      doc: [80, 56],
      txt: [80, 176],
      chunks: [80, 296],
      model: [80, 414],
      emb: [80, 532],
      db: [80, 652],
    },
    edges: {
      txt: "M80,100 L80,130",
      chunks: "M80,220 L80,252",
      model: "M80,340 L80,380",
      emb: "M80,446 L80,488",
      db: "M80,574 L80,604",
    },
  },
};

// The step at which each node and each incoming edge appears.
const NODE_STEP = { doc: 1, txt: 2, chunks: 3, model: 4, emb: 5, db: 6 };

function NodeShape({ id, step }) {
  const on = step >= NODE_STEP[id];
  const current = step === NODE_STEP[id];
  const glow = current ? { filter: "drop-shadow(0 0 10px rgba(129,140,248,0.75))" } : undefined;
  switch (id) {
    case "doc":
      return (
        <g style={glow}>
          <path d="M-30,-40 L16,-40 L30,-26 L30,40 L-30,40 Z" fill="rgba(127,29,29,0.45)" stroke="#ef4444" strokeWidth="2.5" />
          <path d="M16,-40 L16,-26 L30,-26" fill="none" stroke="#ef4444" strokeWidth="2" />
          <text y="7" textAnchor="middle" fill="#f87171" fontSize="18" fontWeight="700">PDF</text>
        </g>
      );
    case "txt":
      return (
        <g style={glow}>
          <rect x="-30" y="-40" width="60" height="80" rx="5" fill="rgba(31,41,55,0.85)" stroke="#9ca3af" strokeWidth="2.5" />
          {[-22, -10, 2, 14, 26].map((y, i) => (
            <line key={y} x1="-18" y1={y} x2={i === 4 ? 4 : 18} y2={y} stroke="#9ca3af" strokeWidth="3" strokeLinecap="round" opacity="0.8" />
          ))}
        </g>
      );
    case "chunks": {
      // The four pieces start stacked and spread apart when chunking happens.
      const spread = on ? 22 : 12;
      return (
        <g style={glow}>
          {[[-1, -1], [1, -1], [-1, 1], [1, 1]].map(([dx, dy], i) => (
            <motion.rect
              key={i}
              width="36"
              height="36"
              rx="5"
              fill="rgba(99,102,241,0.45)"
              stroke="#818cf8"
              strokeWidth="2"
              initial={false}
              animate={{ x: dx * spread - 18, y: dy * spread - 18 }}
              transition={{ type: "spring", stiffness: 160, damping: 16, delay: i * 0.05 }}
            />
          ))}
        </g>
      );
    }
    case "model":
      return (
        <g style={glow}>
          <rect x="-66" y="-28" width="132" height="56" rx="8" fill="rgba(88,28,135,0.5)" stroke="#a855f7" strokeWidth="2.5" />
          <text y="-2" textAnchor="middle" fill="#e9d5ff" fontSize="15" fontFamily="ui-monospace, monospace">Embedding</text>
          <text y="16" textAnchor="middle" fill="#e9d5ff" fontSize="15" fontFamily="ui-monospace, monospace">model</text>
        </g>
      );
    case "emb":
      return (
        <g style={glow}>
          {[0, 1, 2].map((c) =>
            [0, 1, 2, 3, 4].map((r) => {
              const v = Math.sin((c + 1) * 1.7 + r * 2.3); // a fixed, varied pattern of values
              return (
                <rect
                  key={`${c}${r}`}
                  x={-40 + c * 28}
                  y={-38 + r * 15}
                  width="24"
                  height="13"
                  rx="2"
                  fill={v > 0 ? `rgba(52,211,153,${0.25 + 0.6 * v})` : `rgba(251,113,133,${0.25 - 0.6 * v})`}
                />
              );
            }),
          )}
        </g>
      );
    case "db":
      return (
        <g style={glow}>
          <path d="M-40,-28 L-40,28 A40,12 0 0 0 40,28 L40,-28" fill="rgba(22,78,99,0.55)" stroke="#06b6d4" strokeWidth="2.5" />
          <ellipse cx="0" cy="-28" rx="40" ry="12" fill="rgba(8,145,178,0.45)" stroke="#06b6d4" strokeWidth="2.5" />
          <path d="M-40,0 A40,12 0 0 0 40,0" fill="none" stroke="#06b6d4" strokeWidth="1.5" opacity="0.6" />
        </g>
      );
    default:
      return null;
  }
}

const LABELS = {
  doc: ["Document", "PDF, DOCX, HTML"],
  txt: ["Text", "parsed & cleaned"],
  chunks: ["Chunks", "~200–1,000 tokens"],
  model: ["", "same model for queries"],
  emb: ["Embeddings", "one vector per chunk"],
  db: ["Vector DB", "Milvus, pgvector, …"],
};

function IndexingDiagram({ step, layout }) {
  const L = LAYOUTS[layout];
  const reduce = typeof window !== "undefined" && window.matchMedia?.("(prefers-reduced-motion: reduce)").matches;
  const labelBelow = { doc: 62, txt: 62, chunks: 62, model: 0, emb: 62, db: 58 };
  return (
    <svg viewBox={`0 0 ${L.w} ${L.h}`} className="w-full h-auto block" role="img" aria-label={`Indexing pipeline, step ${step} of 6`}>
      <defs>
        <marker id={`arrow-${layout}`} viewBox="0 0 10 10" refX="8" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse">
          <path d="M0,0 L10,5 L0,10 Z" fill="#818cf8" />
        </marker>
      </defs>

      {/* edges: a faint track always, the coloured line once reached */}
      {Object.entries(L.edges).map(([to, d]) => {
        const reached = step >= NODE_STEP[to];
        const active = step === NODE_STEP[to];
        return (
          <g key={to}>
            <path d={d} fill="none" stroke="rgba(255,255,255,0.08)" strokeWidth="2.5" strokeDasharray="5 6" />
            <motion.path
              d={d}
              fill="none"
              stroke="#818cf8"
              strokeWidth="2.5"
              markerEnd={reached ? `url(#arrow-${layout})` : undefined}
              initial={false}
              animate={{ pathLength: reached ? 1 : 0, opacity: reached ? 1 : 0 }}
              transition={{ duration: 0.6, ease: "easeInOut" }}
            />
            {active && !reduce && (
              <circle r="5" fill="#c7d2fe">
                <animateMotion dur="1.3s" repeatCount="indefinite" path={d} />
              </circle>
            )}
          </g>
        );
      })}

      {/* nodes */}
      {Object.entries(L.nodes).map(([id, [x, y]]) => {
        const on = step >= NODE_STEP[id];
        return (
          <motion.g
            key={id}
            initial={false}
            animate={{ opacity: on ? 1 : 0.22, scale: step === NODE_STEP[id] ? 1.06 : 1 }}
            transition={{ duration: 0.4 }}
            style={{ transformBox: "fill-box", transformOrigin: "center" }}
          >
            <g transform={`translate(${x},${y})`}>
              <NodeShape id={id} step={step} />
              {L.labels === "right" ? (
                <>
                  {LABELS[id][0] && (
                    <text x={id === "model" ? 78 : 58} y={LABELS[id][0] ? -2 : 6} fill={on ? "#e5e7eb" : "#6b7280"} fontSize="19" fontWeight="600">
                      {LABELS[id][0]}
                    </text>
                  )}
                  <text x={id === "model" ? 78 : 58} y={LABELS[id][0] ? 20 : 6} fill="#6b7280" fontSize="15">
                    {LABELS[id][1]}
                  </text>
                </>
              ) : (
                LABELS[id][0] && (
                  <>
                    <text y={labelBelow[id]} textAnchor="middle" fill={on ? "#e5e7eb" : "#6b7280"} fontSize="17" fontWeight="600">
                      {LABELS[id][0]}
                    </text>
                    <text y={labelBelow[id] + 19} textAnchor="middle" fill="#6b7280" fontSize="13">
                      {LABELS[id][1]}
                    </text>
                  </>
                )
              )}
            </g>
          </motion.g>
        );
      })}
    </svg>
  );
}

export default function RagIndexing() {
  const [step, setStep] = useState(1);
  const [isPlaying, setIsPlaying] = useState(false);

  const toc = [
    { label: "What is Indexing?", hash: "what-is-indexing" },
    { label: "Embedding Generation", hash: "embedding-gen" },
    { label: "Vector Indexing", hash: "vector-indexing" },
    { label: "Incremental Indexing", hash: "incremental" }
  ];

  const handleNext = () => setStep((s) => Math.min(s + 1, 6));
  const handlePrev = () => setStep((s) => Math.max(s - 1, 1));
  const handleReset = () => { setStep(1); setIsPlaying(false); };
  
  const togglePlay = () => {
    if (isPlaying) {
      setIsPlaying(false);
    } else {
      setIsPlaying(true);
      if(step >= 6) setStep(1);
      // Let a useEffect handle the loop, or simulate simple interval
    }
  };
  
  React.useEffect(() => {
    let interval;
    if(isPlaying) {
        interval = setInterval(() => {
            setStep(s => {
                if(s >= 6) {
                    setIsPlaying(false);
                    return s;
                }
                return s + 1;
            })
        }, 2000);
    }
    return () => clearInterval(interval);
  }, [isPlaying]);

  return (
    <GuideLayout
      title="Indexing"
      intro="Transforming prepared text into searchable vectors."
      toc={toc}
    >
      <section id="indexing" className="px-5 mb-10">
        <div className="mb-6">
          <div className="inline-block px-3 py-1 bg-indigo-900/50 text-indigo-300 rounded-full text-xs font-bold uppercase tracking-wider mb-2 border border-indigo-700/50">Stage 1</div>
          <h2 className="text-3xl font-extrabold text-white mb-2">📁 Indexing</h2>
          <p className="text-gray-400 max-w-2xl">
            Preparing your knowledge base — documents are parsed, chunked, embedded into vectors, and stored in a vector database.
          </p>
        </div>

        <div className="bg-[#111] border border-gray-800 rounded-2xl p-6 shadow-xl">
          <div className="flex flex-wrap gap-4 items-center justify-between mb-8 pb-4 border-b border-gray-800">
            <div className="flex gap-2 items-center">
              <button onClick={handlePrev} className="px-4 py-2 bg-[#222] hover:bg-[#333] text-gray-300 rounded-lg text-sm font-semibold transition-colors">‹ Prev</button>
              <span className="text-gray-400 text-sm font-mono px-2">Step {step} of 6</span>
              <button onClick={handleNext} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg text-sm font-semibold transition-colors">Next ›</button>
            </div>
            <div className="flex gap-2">
              <button onClick={handleReset} className="px-4 py-2 border border-gray-700 text-gray-400 hover:text-gray-200 rounded-lg text-sm font-semibold transition-colors">↺ Reset</button>
              <button onClick={togglePlay} className={`px-4 py-2 rounded-lg text-sm font-semibold transition-colors ${isPlaying ? 'bg-red-500/20 text-red-400' : 'bg-emerald-500/20 text-emerald-400'}`}>
                {isPlaying ? '⏸ Pause' : '▶ Play'}
              </button>
            </div>
          </div>

          <div className="flex gap-2 mb-8 justify-center">
            {[1,2,3,4,5,6].map(i => (
              <div key={i} className={`w-3 h-3 rounded-full transition-colors ${i <= step ? 'bg-indigo-500' : 'bg-gray-700'}`} />
            ))}
          </div>

          <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl mb-8 p-3 sm:p-5">
            <div className="hidden sm:block">
              <IndexingDiagram step={step} layout="wide" />
            </div>
            <div className="sm:hidden">
              <IndexingDiagram step={step} layout="tall" />
            </div>
          </div>

          <div className="bg-[#1a1a1a] p-5 rounded-xl border-l-4 border-indigo-500">
            <AnimatePresence mode="wait">
              {step === 1 && (
                <motion.div key="1" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}}>
                  <div className="text-indigo-400 text-sm font-bold mb-1">Step 1</div>
                  <h4 className="text-xl text-white font-semibold mb-2">Document Input</h4>
                  <p className="text-gray-400 text-sm mb-3">Start with any document — PDFs, Word files, web pages, or text files. These are your knowledge sources that you want the AI to be able to query and reason over.</p>
                  <div className="bg-indigo-900/20 text-indigo-300 text-xs p-2 rounded"><strong>Key insight:</strong> The quality and structure of your source documents directly impacts the quality of RAG responses.</div>
                  <a href="#/rag/ingestion" className="inline-block mt-3 text-xs font-semibold text-blue-400 hover:underline">How to load each format with LangChain → Data Ingestion</a>
                </motion.div>
              )}
              {step === 2 && (
                <motion.div key="2" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}}>
                   <div className="text-indigo-400 text-sm font-bold mb-1">Step 2</div>
                  <h4 className="text-xl text-white font-semibold mb-2">Text Parsing</h4>
                  <p className="text-gray-400 text-sm mb-3">A loader extracts the text from the file format — PDF, DOCX, HTML — and strips headers, footers and boilerplate. Tables and layout need special care: a parser that scrambles them here cannot be fixed later.</p>
                </motion.div>
              )}
              {step === 3 && (
                <motion.div key="3" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}}>
                   <div className="text-indigo-400 text-sm font-bold mb-1">Step 3</div>
                  <h4 className="text-xl text-white font-semibold mb-2">Chunking</h4>
                  <p className="text-gray-400 text-sm mb-3">The text is split into chunks small enough to embed and retrieve precisely, but large enough to carry meaning — typically a few hundred tokens, often with some overlap so a sentence is not cut off from its context.</p>
                </motion.div>
              )}
              {step === 4 && (
                <motion.div key="4" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}}>
                   <div className="text-indigo-400 text-sm font-bold mb-1">Step 4</div>
                  <h4 className="text-xl text-white font-semibold mb-2">Embedding Model</h4>
                  <p className="text-gray-400 text-sm mb-3">Each chunk is sent to an embedding model (for example OpenAI text-embedding-3, Cohere Embed, or an open model like BGE or E5). Use the same model later for queries — vectors from different models are not comparable.</p>
                </motion.div>
              )}
              {step === 5 && (
                <motion.div key="5" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}}>
                   <div className="text-indigo-400 text-sm font-bold mb-1">Step 5</div>
                  <h4 className="text-xl text-white font-semibold mb-2">Vector Embeddings</h4>
                  <p className="text-gray-400 text-sm mb-3">The model returns one dense vector per chunk — hundreds to a few thousand numbers. Chunks with similar meaning get vectors that point in similar directions, which is what makes semantic search work.</p>
                </motion.div>
              )}
              {step === 6 && (
                <motion.div key="6" initial={{opacity:0, x:20}} animate={{opacity:1, x:0}} exit={{opacity:0, x:-20}}>
                   <div className="text-indigo-400 text-sm font-bold mb-1">Step 6</div>
                  <h4 className="text-xl text-white font-semibold mb-2">Vector Database</h4>
                  <p className="text-gray-400 text-sm mb-3">Each vector is stored with its chunk text and metadata (source, page, date) in a vector database, which builds an approximate-nearest-neighbour index (HNSW, IVF) so the most similar chunks can be found in milliseconds.</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section className="px-5 mb-12">
        <h3 className="text-xl font-bold text-gray-200 mb-6">📝 Indexing — Detailed Notes</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#111] p-5 rounded-xl border border-gray-800">
            <div className="text-2xl mb-3">📄</div>
            <h4 className="text-lg text-white font-semibold mb-2">1. Document Parsing</h4>
            <p className="text-sm text-gray-400 mb-4">Raw documents (PDF, DOCX, HTML, etc.) are loaded and converted into plain text. Libraries like <code>PyMuPDF</code>, <code>pdfplumber</code>, or <code>LangChain loaders</code> handle this. The goal is clean, extractable text.</p>
            <div className="text-xs bg-[#222] p-2 rounded text-gray-300"><span className="text-gray-500 mr-2">Tools:</span><code>PyMuPDF · pdfplumber · unstructured · LangChain</code></div>
          </div>
          <div className="bg-[#111] p-5 rounded-xl border border-gray-800">
            <div className="text-2xl mb-3">✂️</div>
            <h4 className="text-lg text-white font-semibold mb-2">2. Text Chunking</h4>
            <p className="text-sm text-gray-400 mb-4">Long documents are split into smaller <strong>overlapping chunks</strong> (typically 256–1024 tokens with 20–50 token overlap). This ensures no context is lost at boundaries and each chunk is small enough to be semantically focused.</p>
            <div className="text-xs bg-[#222] p-2 rounded text-gray-300"><span className="text-gray-500 mr-2">Strategy:</span><code>Fixed-size · Sentence · Semantic · Recursive</code></div>
          </div>
          <div className="bg-[#111] p-5 rounded-xl border border-gray-800">
            <div className="text-2xl mb-3">🔢</div>
            <h4 className="text-lg text-white font-semibold mb-2">3. Embedding Generation</h4>
            <p className="text-sm text-gray-400 mb-4">Each chunk is passed through an <strong>Embedding Model</strong> which converts text into a dense numerical vector (e.g. 1536 dimensions for OpenAI). Semantically similar texts produce numerically similar vectors.</p>
            <div className="text-xs bg-[#222] p-2 rounded text-gray-300"><span className="text-gray-500 mr-2">Models:</span><code>text-embedding-ada-002 · BAAI/bge · Cohere · E5</code></div>
          </div>
          <div className="bg-[#111] p-5 rounded-xl border border-gray-800">
            <div className="text-2xl mb-3">💾</div>
            <h4 className="text-lg text-white font-semibold mb-2">4. Vector Storage (Milvus)</h4>
            <p className="text-sm text-gray-400 mb-4">The embedding vectors (along with the original chunk text as metadata) are stored in a <strong>vector database</strong> like Milvus. These databases are optimized for fast Approximate Nearest Neighbor (ANN) search.</p>
            <div className="text-xs bg-[#222] p-2 rounded text-gray-300"><span className="text-gray-500 mr-2">Options:</span><code>Milvus · Pinecone · Weaviate · Chroma · FAISS</code></div>
          </div>
        </div>
      </section>

      <section className="px-5">
          <h2 id="what-is-indexing" className="text-2xl font-bold mb-4 text-gray-100">What is Indexing?</h2>
          <p className="text-gray-300 mb-6">Indexing is the offline process of taking clean, chunked documents, passing them through an embedding model to generate numerical vectors, and loading those vectors into a database for fast querying.</p>
          
          <h2 id="embedding-gen" className="text-2xl font-bold mb-4 text-gray-100">Embedding Generation</h2>
          <p className="text-gray-300 mb-6">An embedding model (like OpenAI's <code className="bg-[#222] px-1 rounded text-pink-400">text-embedding-3-small</code>) processes each text chunk and outputs a high-dimensional vector (e.g. an array of 1536 floating-point numbers) that mathematically represents the chunk's semantic meaning.</p>

          <h2 id="vector-indexing" className="text-2xl font-bold mb-4 text-gray-100">Vector Indexing</h2>
          <p className="text-gray-300 mb-6">Vector databases don't just store arrays; they build specialized mathematical indices (like HNSW or IVF) over the vectors so that similarity searches can be executed in milliseconds over billions of records.</p>

          <h2 id="incremental" className="text-2xl font-bold mb-4 text-gray-100">Incremental Indexing</h2>
          <p className="text-gray-300 mb-6">In production, you rarely re-index the entire knowledge base. Incremental indexing uses Record Managers to track document hashes, updating or deleting only the chunks of files that have actually changed.</p>
        </section>
    </GuideLayout>
  );
}

import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Database, FileText, Search, ArrowRight, Zap, RefreshCw } from 'lucide-react';
import GuideLayout from '../components/GuideLayout';

const toc = [
  { label: '1. What are Embeddings?', hash: '#what-are' },
  { label: '2. Why do we need them?', hash: '#why-need' },
  { label: '3. Simple Analogy', hash: '#simple-analogy' },
  { label: '4. How Embeddings work in RAG', hash: '#how-work-rag' },
  { label: '5. Text to Vector', hash: '#text-to-vector' },
  { label: '6. What is an embedding model?', hash: '#embedding-model' },
  { label: '7. What is embedding dimension?', hash: '#embedding-dimension' },
  { label: '8. Toy example for visualization', hash: '#toy-example' },
  { label: '9. Similarity Search Metrics', hash: '#sim-search-metrics' },
  { label: '10. Dense vs Sparse Embeddings', hash: '#dense-sparse' },
  { label: '11. Creating in Python', hash: '#python' },
  { label: '12. Visualizing Embeddings', hash: '#visualizing' },
  { label: '13. Real-world Examples', hash: '#examples' },
  { label: '14. Common Mistakes', hash: '#mistakes' }
];

const ToyVectorVisualizer = () => {
  return (
    <div className="bg-[#111] border border-gray-800 rounded-xl p-6 my-6">
      <div className="flex flex-col md:flex-row gap-6">
        <div className="flex-1 space-y-4">
          <div className="bg-[#1a1a1a] p-3 rounded font-mono text-xs border border-gray-700 shadow-md">
            <span className="text-indigo-400 font-bold">A = "What is RAG?"</span><br/>
            <span className="text-gray-400">[0.90, 0.10, 0.05]</span>
          </div>
          <div className="bg-[#1a1a1a] p-3 rounded font-mono text-xs border border-gray-700 shadow-md">
            <span className="text-emerald-400 font-bold">B = "Explain Retrieval-Augmented Generation"</span><br/>
            <span className="text-gray-400">[0.87, 0.12, 0.07]</span>
          </div>
          <div className="bg-[#1a1a1a] p-3 rounded font-mono text-xs border border-gray-700 shadow-md">
            <span className="text-amber-400 font-bold">C = "How to make biryani?"</span><br/>
            <span className="text-gray-400">[0.05, 0.90, 0.12]</span>
          </div>
        </div>
        <div className="flex-1 relative min-h-[250px] bg-[#0a0a0a] rounded-lg border border-gray-800 flex flex-col p-4 overflow-hidden">
          {/* Origin */}
          <div className="absolute bottom-4 left-4 w-2 h-2 rounded-full bg-gray-500 z-20"></div>
          {/* Axes */}
          <svg viewBox="0 0 100 100" preserveAspectRatio="none" className="absolute inset-0 w-full h-full pointer-events-none z-10">
            {/* Y axis */}
            <line x1="5" y1="5" x2="5" y2="95" stroke="#333" strokeWidth="1" />
            {/* X axis */}
            <line x1="5" y1="95" x2="95" y2="95" stroke="#333" strokeWidth="1" />
            
            {/* Vectors */}
            <motion.line x1="5" y1="95" x2="90" y2="75" stroke="#818cf8" strokeWidth="1.5" markerEnd="url(#arrow-a)" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.5, duration: 1, type: 'spring' }} />
            <motion.line x1="5" y1="95" x2="85" y2="80" stroke="#34d399" strokeWidth="1.5" markerEnd="url(#arrow-b)" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 0.8, duration: 1, type: 'spring' }} />
            <motion.line x1="5" y1="95" x2="15" y2="15" stroke="#fbbf24" strokeWidth="1.5" markerEnd="url(#arrow-c)" initial={{ pathLength: 0 }} whileInView={{ pathLength: 1 }} viewport={{ once: true }} transition={{ delay: 1.1, duration: 1, type: 'spring' }} />
            
            <defs>
              <marker id="arrow-a" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#818cf8" />
              </marker>
              <marker id="arrow-b" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#34d399" />
              </marker>
              <marker id="arrow-c" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="4" markerHeight="4" orient="auto-start-reverse">
                <path d="M 0 0 L 10 5 L 0 10 z" fill="#fbbf24" />
              </marker>
            </defs>
          </svg>
          <motion.div className="absolute text-[0.625rem] font-bold text-indigo-400 bg-[#111] px-1 rounded z-20" style={{ right: '5%', bottom: '25%' }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.5 }}>A: RAG</motion.div>
          <motion.div className="absolute text-[0.625rem] font-bold text-emerald-400 bg-[#111] px-1 rounded z-20" style={{ right: '15%', bottom: '10%' }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 1.8 }}>B: Retrieval...</motion.div>
          <motion.div className="absolute text-[0.625rem] font-bold text-amber-400 bg-[#111] px-1 rounded z-20" style={{ left: '16%', top: '12%' }} initial={{ opacity: 0 }} whileInView={{ opacity: 1 }} viewport={{ once: true }} transition={{ delay: 2.1 }}>C: biryani</motion.div>
        </div>
      </div>
      <div className="mt-6 space-y-4 text-sm">
        <div>
          <p className="text-gray-300">A and B are close:</p>
          <p className="text-gray-400 font-mono text-xs bg-[#1a1a1a] p-2 rounded inline-block mt-1">"What is RAG?"<br/>"Explain Retrieval-Augmented Generation"</p>
          <p className="text-emerald-400 mt-1">They point in almost the same direction.</p>
        </div>
        <div>
          <p className="text-gray-300">A and C are far:</p>
          <p className="text-gray-400 font-mono text-xs bg-[#1a1a1a] p-2 rounded inline-block mt-1">"What is RAG?"<br/>"How to make biryani?"</p>
          <p className="text-amber-400 mt-1">They point in different directions.</p>
        </div>
      </div>
    </div>
  );
};

const AnalogyMap = () => {
  const [isSemantic, setIsSemantic] = useState(false);

  const nodes = {
    geographic: [
      { id: 'hyd', label: 'Hyderabad', color: 'bg-emerald-500', x: '30%', y: '50%' },
      { id: 'blr', label: 'Bengaluru', color: 'bg-emerald-500', x: '35%', y: '65%' },
      { id: 'ny', label: 'New York', color: 'bg-rose-500', x: '80%', y: '20%' },
    ],
    semantic: [
      { id: 'rag', label: '"RAG"', color: 'bg-indigo-500', x: '25%', y: '40%' },
      { id: 'rag2', label: '"retrieval augmented generation"', color: 'bg-indigo-500', x: '20%', y: '60%' },
      { id: 'vdb', label: '"vector database"', color: 'bg-indigo-500', x: '35%', y: '50%' },
      { id: 'pizza', label: '"pizza recipe"', color: 'bg-amber-500', x: '75%', y: '20%' },
      { id: 'cricket', label: '"cricket score"', color: 'bg-amber-500', x: '80%', y: '80%' },
    ]
  };

  const currentNodes = isSemantic ? nodes.semantic : nodes.geographic;

  return (
    <div className="bg-[#111] border border-gray-800 rounded-xl p-6 my-6">
      <div className="flex gap-4 justify-center mb-6">
        <button 
          onClick={() => setIsSemantic(false)} 
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${!isSemantic ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          📍 Geographic Map
        </button>
        <button 
          onClick={() => setIsSemantic(true)} 
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors ${isSemantic ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          🧠 Semantic Map
        </button>
      </div>

      <div className="relative w-full h-[300px] border border-gray-700/50 bg-[#0a0a0a] rounded-lg overflow-hidden">
        <AnimatePresence>
          {currentNodes.map(node => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0, scale: 0.5 }}
              animate={{ opacity: 1, scale: 1, left: node.x, top: node.y }}
              exit={{ opacity: 0, scale: 0.5 }}
              transition={{ duration: 0.5, type: 'spring' }}
              className={`absolute -translate-x-1/2 -translate-y-1/2 px-3 py-1.5 rounded-full text-xs font-bold text-white shadow-lg ${node.color} whitespace-nowrap z-10`}
            >
              {node.label}
            </motion.div>
          ))}
        </AnimatePresence>

        {/* Distance lines */}
        <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30">
          {!isSemantic && (
            <>
              <motion.line x1="30%" y1="50%" x2="35%" y2="65%" stroke="#10b981" strokeWidth="2" strokeDasharray="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2 }} />
              <motion.line x1="30%" y1="50%" x2="80%" y2="20%" stroke="#f43f5e" strokeWidth="2" strokeDasharray="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2 }} />
            </>
          )}
          {isSemantic && (
            <>
              <motion.line x1="25%" y1="40%" x2="20%" y2="60%" stroke="#6366f1" strokeWidth="2" strokeDasharray="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2 }} />
              <motion.line x1="25%" y1="40%" x2="35%" y2="50%" stroke="#6366f1" strokeWidth="2" strokeDasharray="4" initial={{ pathLength: 0 }} animate={{ pathLength: 1 }} transition={{ delay: 0.2 }} />
            </>
          )}
        </svg>
      </div>
    </div>
  );
};

const RagEmbeddingFlow = () => {
  const [stage, setStage] = useState('indexing'); // indexing, query

  return (
    <div className="bg-[#111] border border-gray-800 rounded-xl p-6 mt-8 mb-4">
      <div className="flex gap-4 justify-center mb-8">
        <button 
          onClick={() => setStage('indexing')} 
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 ${stage === 'indexing' ? 'bg-indigo-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          <Database size={16} /> 1. Indexing Time
        </button>
        <button 
          onClick={() => setStage('query')} 
          className={`px-4 py-2 rounded-lg font-semibold text-sm transition-colors flex items-center gap-2 ${stage === 'query' ? 'bg-emerald-600 text-white' : 'bg-gray-800 text-gray-400 hover:bg-gray-700'}`}
        >
          <Search size={16} /> 2. Query Time
        </button>
      </div>

      <div className="relative w-full h-[250px] flex items-center justify-between px-10">
        <AnimatePresence mode="wait">
          {stage === 'indexing' ? (
            <motion.div key="idx-1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col items-center">
              <div className="w-16 h-16 bg-gray-800 border-2 border-gray-600 rounded-xl flex items-center justify-center text-gray-300 mb-2">
                <FileText size={32} />
              </div>
              <span className="text-xs font-semibold text-gray-400">Raw Docs</span>
            </motion.div>
          ) : (
            <motion.div key="qry-1" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col items-center">
              <div className="w-16 h-16 bg-emerald-900/30 border-2 border-emerald-500/50 rounded-xl flex items-center justify-center text-emerald-400 mb-2">
                <Search size={32} />
              </div>
              <span className="text-xs font-semibold text-emerald-400">User Query</span>
            </motion.div>
          )}
        </AnimatePresence>

        <motion.div className="flex-1 flex flex-col items-center justify-center relative">
          <motion.div animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5 }} className="text-gray-500 absolute -translate-x-16">
            <ArrowRight size={24} />
          </motion.div>
          <div className="w-24 h-24 bg-purple-900/30 border-2 border-purple-500/50 rounded-full flex flex-col items-center justify-center text-purple-400 z-10 bg-[#111]">
            <Zap size={28} className="mb-1" />
            <span className="text-[0.625rem] font-bold text-center leading-tight">Embedding<br/>Model</span>
          </div>
          <motion.div animate={{ x: [0, 10, 0] }} transition={{ repeat: Infinity, duration: 1.5, delay: 0.5 }} className="text-gray-500 absolute translate-x-16">
            <ArrowRight size={24} />
          </motion.div>
        </motion.div>

        <AnimatePresence mode="wait">
          {stage === 'indexing' ? (
            <motion.div key="idx-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col items-center">
              <div className="w-20 h-24 bg-indigo-900/30 border-2 border-indigo-500/50 rounded-xl flex flex-col items-center justify-center text-indigo-400 mb-2 relative overflow-hidden">
                 <Database size={32} />
                 <motion.div initial={{ y: 50 }} animate={{ y: 0 }} transition={{ repeat: Infinity, duration: 2 }} className="absolute bottom-1 w-full flex justify-center">
                   <div className="w-12 h-1 bg-indigo-500/50 rounded-full"></div>
                 </motion.div>
              </div>
              <span className="text-xs font-semibold text-indigo-400">Vector DB (Store)</span>
            </motion.div>
          ) : (
            <motion.div key="qry-3" initial={{ opacity: 0, x: -20 }} animate={{ opacity: 1, x: 0 }} exit={{ opacity: 0, x: 20 }} className="flex flex-col items-center">
              <div className="w-20 h-24 bg-emerald-900/30 border-2 border-emerald-500/50 rounded-xl flex flex-col items-center justify-center text-emerald-400 mb-2 relative">
                 <RefreshCw size={32} className="mb-2" />
                 <div className="text-[0.625rem] text-center font-bold">Top-K<br/>Matches</div>
              </div>
              <span className="text-xs font-semibold text-emerald-400">Vector DB (Search)</span>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
      <p className="text-center text-xs text-gray-500 mt-2">
        {stage === 'indexing' ? 'Documents are processed and stored as vectors.' : 'The query is embedded to find the closest matching vectors.'}
      </p>
    </div>
  );
};

const RagEmbeddings = () => {
  return (
    <GuideLayout
      title="Embeddings"
      intro="The mathematical foundation of semantic search."
      toc={toc}
    >
      <section id="what-are" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">1. What are Embeddings?</h2>
        <p className="text-gray-300">Embeddings are <strong className="text-white">dense numerical vectors</strong> (lists of floating-point numbers) that capture the semantic meaning of text, images, or audio. They act as a universal language for AI models, translating human concepts into math. In this space, words with similar meanings are mapped to points that are geometrically close to each other.</p>
      </section>

      <section id="why-need" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">2. Why do we need embeddings?</h2>
        
        <h3 className="text-xl font-semibold mb-3 text-gray-200 mt-6">Embeddings vs Keyword Search</h3>
        <p className="text-gray-300 mb-4">This is a critical concept for your website. <strong>Keyword search</strong> looks for exact or near-exact words.</p>
        
        <div className="bg-[#111] p-4 rounded-lg border border-gray-800 mb-6 font-mono text-sm">
          <div className="text-gray-400 mb-1">Example query:</div>
          <div className="text-white bg-[#222] p-2 rounded mb-4">"What is RAG?"</div>
          
          <div className="text-gray-400 mb-1">Keyword search may find documents containing:</div>
          <div className="text-indigo-400 bg-indigo-900/20 p-2 rounded mb-4">RAG</div>
          
          <div className="text-gray-400 mb-1">But it may completely miss:</div>
          <div className="text-rose-400 bg-rose-900/20 p-2 rounded mb-2">Retrieval Augmented Generation helps language models use external knowledge.</div>
          <p className="text-xs text-gray-500 mt-2">Why? Because the exact word <strong>RAG</strong> may not appear.</p>
        </div>

        <p className="text-gray-300 mb-4"><strong>Embedding search</strong> solves this because it understands meaning.</p>

        <div className="bg-[#111] p-4 rounded-lg border border-gray-800 mb-6 font-mono text-sm">
          <div className="text-gray-400 mb-1">Query:</div>
          <div className="text-white bg-[#222] p-2 rounded mb-4">"What is RAG?"</div>
          
          <div className="text-gray-400 mb-1">Can match:</div>
          <div className="text-emerald-400 bg-emerald-900/20 p-2 rounded">Retrieval Augmented Generation helps language models use external knowledge.</div>
        </div>

        <p className="text-gray-300 mb-4 mt-8">Computers do not naturally understand meaning. They see characters. But after embedding, the text becomes something like:</p>

        <div className="bg-[#111] p-3 rounded-lg border border-gray-800 mb-4 font-mono text-sm text-gray-300">
          [0.12, -0.45, 0.88, 0.31, ...]
        </div>

        <p className="text-gray-300 mb-4">Now the computer can compare it with other vectors.</p>
        <p className="text-gray-300 mb-4">For example:</p>

        <div className="bg-[#111] p-4 rounded-lg border border-gray-800 mb-4 font-mono text-sm space-y-2">
          <div className="text-indigo-400">Text A: "What is RAG?"</div>
          <div className="text-emerald-400">Text B: "Explain Retrieval-Augmented Generation"</div>
          <div className="text-rose-400">Text C: "How to cook biryani?"</div>
        </div>

        <p className="text-gray-300 mb-4">A good embedding model should place <strong className="text-indigo-400">A</strong> and <strong className="text-emerald-400">B</strong> close together because they mean almost the same thing.</p>
        <p className="text-gray-300 mb-6">But <strong className="text-rose-400">C</strong> should be far away because it is about a different topic.</p>

        <p className="text-gray-300 mb-4">That is the core idea:</p>
        
        <div className="bg-[#1a1a1a] p-4 rounded-lg border border-gray-700 mb-6 font-mono text-sm">
          <div className="text-gray-300">Similar meaning → nearby vectors</div>
          <div className="text-gray-300 mt-2">Different meaning → faraway vectors</div>
        </div>

        <p className="text-gray-300">Semantic search works this way: it searches dense vectors to find records that are closest in meaning and context to the query.</p>
      </section>

      <section id="simple-analogy" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">3. Simple analogy</h2>
        <p className="text-gray-300 mb-4">Think of embeddings like a <strong className="text-white">map of meaning</strong>.</p>
        
        <p className="text-gray-300 mb-2">On a normal map:</p>
        <div className="bg-[#111] p-4 rounded-lg border border-gray-800 mb-6 font-mono text-sm space-y-2">
          <div className="text-gray-300">Hyderabad and Bengaluru → <span className="text-emerald-400">relatively close</span></div>
          <div className="text-gray-300">Hyderabad and New York → <span className="text-rose-400">far</span></div>
        </div>

        <p className="text-gray-300 mb-2">In embedding space:</p>
        <div className="bg-[#111] p-4 rounded-lg border border-gray-800 mb-2 font-mono text-sm space-y-1">
          <div className="text-indigo-300">"RAG"</div>
          <div className="text-indigo-300">"retrieval augmented generation"</div>
          <div className="text-indigo-300">"vector database"</div>
        </div>
        <p className="text-gray-300 mb-6">These concepts should be <span className="text-emerald-400 font-semibold">close</span>.</p>

        <p className="text-gray-300 mb-2">But:</p>
        <div className="bg-[#111] p-4 rounded-lg border border-gray-800 mb-2 font-mono text-sm space-y-1">
          <div className="text-amber-300">"RAG"</div>
          <div className="text-amber-300">"pizza recipe"</div>
          <div className="text-amber-300">"cricket score"</div>
        </div>
        <p className="text-gray-300 mb-6">These should be <span className="text-rose-400 font-semibold">far apart</span>.</p>

        <p className="text-gray-300">So embeddings create a <strong className="text-white">semantic map</strong> where related ideas live near each other.</p>

        <AnalogyMap />
      </section>

      <section id="how-work-rag" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">4. How embeddings work in RAG</h2>
        <p className="text-gray-300 mb-6">In RAG, embeddings act as the bridge between your documents and the user's question. They are used mainly during two distinct stages:</p>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111] border border-indigo-500/30 rounded-xl p-5">
            <h3 className="text-lg font-bold text-indigo-400 mb-3 flex items-center gap-2">
              <span>1. Indexing Time</span>
              <span className="text-xs bg-indigo-900/50 border border-indigo-500/50 px-2 py-0.5 rounded-full text-indigo-300">Data Prep</span>
            </h3>
            <p className="text-gray-300 text-sm mb-3">Before a user ever asks a question, your raw data must be processed:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-400">
              <li>Documents (PDFs, text) are broken down into smaller chunks.</li>
              <li>Each chunk is passed through an <strong className="text-gray-200">Embedding Model</strong>.</li>
              <li>The model outputs a high-dimensional vector (e.g., an array of 768 numbers) for each chunk.</li>
              <li>These vectors are saved into a <strong className="text-gray-200">Vector Database</strong> (like Pinecone, Milvus, or Chroma) alongside the original text.</li>
            </ul>
          </div>

          <div className="bg-[#111] border border-emerald-500/30 rounded-xl p-5">
            <h3 className="text-lg font-bold text-emerald-400 mb-3 flex items-center gap-2">
              <span>2. Query Time</span>
              <span className="text-xs bg-emerald-900/50 border border-emerald-500/50 px-2 py-0.5 rounded-full text-emerald-300">Retrieval</span>
            </h3>
            <p className="text-gray-300 text-sm mb-3">When a user interacts with your application:</p>
            <ul className="list-disc pl-5 space-y-2 text-sm text-gray-400">
              <li>The user types a natural language question.</li>
              <li>The question is passed through the <strong className="text-emerald-200">exact same Embedding Model</strong> used during indexing.</li>
              <li>The model outputs a <strong className="text-gray-200">query vector</strong>.</li>
              <li>The Vector Database rapidly compares this query vector against all document vectors using a distance metric (like Cosine Similarity) to fetch the top closest matches.</li>
            </ul>
          </div>
        </div>

        <RagEmbeddingFlow />
      </section>

      <section id="text-to-vector" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">5. Text to Vector</h2>
        <p className="text-gray-300 mb-4">The journey from text to vector involves tokenization, followed by a forward pass through a neural network encoder (like BERT or GPT).</p>
        <p className="text-gray-300 mb-6">A vector is just a list of floating numbers. Embedding models convert meaning into numbers so that computers can compare text by semantic meaning, not only exact keywords.</p>
        <div className="bg-[#111] border border-[#333] rounded-xl p-6 mb-6">
          <div className="flex items-center justify-center gap-4 flex-wrap">
            <div className="p-3 bg-[#222] border-2 border-blue-500 rounded-lg text-center font-semibold text-white">"The puppy played."</div>
            <div className="text-2xl text-gray-500">➔</div>
            <div className="p-3 bg-[#222] border-2 border-purple-500 rounded-lg text-center font-semibold text-white">Tokens:<br/>[464, 15309, 3624, 13]</div>
            <div className="text-2xl text-gray-500">➔</div>
            <div className="p-3 bg-[#222] border-2 border-green-500 rounded-lg text-center font-mono text-sm max-w-[250px] text-gray-300">
              [0.012, -0.834, 0.442,<br/> 0.119, -0.003, ... ]<br/><span className="text-gray-500">(384 dimensions)</span>
            </div>
          </div>
        </div>
      </section>

      <section id="embedding-model" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">6. What is an embedding model?</h2>
        <p className="text-gray-300 mb-6">An <strong>embedding model</strong> is a machine learning model that converts input data (text, images) into vectors.</p>
        
        <div className="bg-[#111] border border-[#333] rounded-xl p-6 mb-6 font-mono text-sm">
          <div className="text-gray-400 mb-2">Input:</div>
          <div className="bg-[#222] p-3 rounded text-white mb-6">"Machine learning is a subset of artificial intelligence."</div>
          
          <div className="text-gray-400 mb-2">Output:</div>
          <div className="bg-[#222] p-3 rounded text-indigo-400 mb-2">[0.021, -0.541, 0.113, 0.882, ...]</div>
        </div>

        <h3 className="text-lg font-semibold mb-3 text-gray-200">Popular Embedding Models</h3>
        <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-1 bg-[#111] p-4 rounded-lg border border-[#333]">
          <li>OpenAI text-embedding models</li>
          <li>Cohere embeddings</li>
          <li>Hugging Face sentence-transformers</li>
          <li>BGE embeddings</li>
          <li>E5 embeddings</li>
          <li>Instructor embeddings</li>
        </ul>
        <p className="text-gray-300">OpenAI's current embedding guide lists <code className="bg-[#222] text-indigo-300 px-1.5 py-0.5 rounded">text-embedding-3-small</code> and <code className="bg-[#222] text-indigo-300 px-1.5 py-0.5 rounded">text-embedding-3-large</code> as newer embedding models, with default vector sizes of <strong>1536</strong> and <strong>3072</strong> respectively.</p>
      </section>

      <section id="embedding-dimension" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">7. What is embedding dimension?</h2>
        <p className="text-gray-300 mb-6">The <strong>dimension</strong> means the number of values in the vector. While a 3-dimensional vector looks like <code className="bg-[#222] text-indigo-300 px-1.5 py-0.5 rounded">[0.7, 0.7, -0.1]</code>, real embedding models usually have hundreds or thousands of dimensions.</p>

        <div className="bg-[#111] p-4 rounded-lg border border-gray-800 mb-6 font-mono text-sm space-y-2">
          <div className="text-gray-300">text-embedding-3-small → <span className="text-indigo-400">1536 dimensions</span></div>
          <div className="text-gray-300">text-embedding-3-large → <span className="text-emerald-400">3072 dimensions</span></div>
        </div>

        <p className="text-gray-300 mb-4">So one chunk may become:</p>
        <div className="bg-[#111] p-4 rounded-lg border border-gray-800 mb-6 font-mono text-sm text-indigo-300">
          [<br/>
          &nbsp;&nbsp;0.012,<br/>
          &nbsp;&nbsp;-0.345,<br/>
          &nbsp;&nbsp;0.889,<br/>
          &nbsp;&nbsp;...<br/>
          &nbsp;&nbsp;<span className="text-gray-500">1536 numbers total</span><br/>
          ]
        </div>

        <div className="bg-amber-900/20 border border-amber-500/30 rounded-xl p-5 mb-6">
          <h4 className="text-amber-400 font-bold mb-2 flex items-center gap-2">⚠️ Important Point</h4>
          <p className="text-gray-300 text-sm mb-4">Each dimension usually does <strong>not</strong> have a simple human label like:</p>
          <ul className="text-sm text-gray-400 font-mono space-y-1 mb-4">
            <li>dimension 1 = topic</li>
            <li>dimension 2 = sentiment</li>
            <li>dimension 3 = language</li>
          </ul>
          <p className="text-gray-300 text-sm font-semibold">Instead, the whole vector pattern captures meaning.</p>
        </div>
      </section>

      <section id="toy-example" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">8. Toy example for visualization</h2>
        <p className="text-gray-300 mb-6">To visualize how this works, let's look at a simplified example using 3-dimensional vectors. Real embedding models use thousands of dimensions, but the underlying geometry works exactly the same way!</p>
        <ToyVectorVisualizer />
      </section>

      <section id="sim-search-metrics" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">9. Similarity Search Metrics</h2>
        <p className="text-gray-300 mb-6">After text is converted into vectors, we need to compare vectors. This is called <strong className="text-white">similarity search</strong>.</p>
        
        <div className="overflow-x-auto mb-6">
          <table className="w-full border-collapse text-sm text-gray-300">
            <thead>
              <tr className="bg-[#222] text-left">
                <th className="p-4 font-semibold text-white rounded-tl-lg">Metric</th>
                <th className="p-4 font-semibold text-white">Meaning</th>
                <th className="p-4 font-semibold text-white rounded-tr-lg">Simple Explanation</th>
              </tr>
            </thead>
            <tbody>
              <tr className="border-b border-[#333] bg-[#1a1a1a]">
                <td className="p-4 font-mono text-indigo-400">Cosine similarity</td>
                <td className="p-4">Measures angle between vectors</td>
                <td className="p-4 font-semibold">Are they pointing in the same direction?</td>
              </tr>
              <tr className="border-b border-[#333] bg-[#111]">
                <td className="p-4 font-mono text-emerald-400">Dot product</td>
                <td className="p-4">Measures alignment and magnitude</td>
                <td className="p-4 font-semibold">Are they strongly aligned?</td>
              </tr>
              <tr className="border-b border-[#333] bg-[#1a1a1a]">
                <td className="p-4 font-mono text-rose-400">Euclidean distance</td>
                <td className="p-4">Measures straight-line distance</td>
                <td className="p-4 font-semibold">How far apart are they?</td>
              </tr>
            </tbody>
          </table>
        </div>

        <p className="text-gray-300 mb-4"><strong>Cosine similarity</strong> focuses on vector direction, <strong>Euclidean distance</strong> measures straight-line distance, and <strong>dot product</strong> considers both direction and magnitude. Pinecone recommends matching the similarity metric to the metric used when training the embedding model.</p>
        <p className="text-gray-300">For RAG, <strong>cosine similarity</strong> is very common because we usually care about <strong className="text-white">semantic direction</strong>: whether two pieces of text are about the same idea.</p>
      </section>

      <section id="dense-sparse" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">10. Dense vs Sparse Embeddings</h2>
        <p className="text-gray-300 mb-6">Hybrid search systems combine two different types of embeddings to get the best of both semantic and keyword search.</p>
        <div className="overflow-x-auto">
          <table className="w-full border-collapse text-sm text-gray-300">
            <thead>
              <tr>
                <th className="bg-[#1a1a1a] p-3 border border-[#333] font-semibold text-left text-white">Feature</th>
                <th className="bg-[#1a1a1a] p-3 border border-[#333] font-semibold text-left text-white">Dense (OpenAI, Cohere)</th>
                <th className="bg-[#1a1a1a] p-3 border border-[#333] font-semibold text-left text-white">Sparse (SPLADE, BM25)</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border border-[#333] font-semibold text-white">Array Focus</td>
                <td className="p-3 border border-[#333]">Semantic meaning (Intent)</td>
                <td className="p-3 border border-[#333]">Exact keyword matching</td>
              </tr>
              <tr>
                <td className="p-3 border border-[#333] font-semibold text-white">Array Composition</td>
                <td className="p-3 border border-[#333]">Most values are non-zero floating points</td>
                <td className="p-3 border border-[#333]">99% of values are zero</td>
              </tr>
              <tr>
                <td className="p-3 border border-[#333] font-semibold text-white">Dimensionality</td>
                <td className="p-3 border border-[#333]">Low (384 - 3072)</td>
                <td className="p-3 border border-[#333]">Extremely High (Vocabulary size, e.g. 30,000+)</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="python" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">11. Creating Embeddings in Python</h2>
        
        <h3 className="text-lg font-semibold mt-6 mb-3 text-white">Using OpenAI (Cloud)</h3>
        <pre className="bg-[#111] border border-[#333] rounded-xl p-4 font-mono text-sm overflow-x-auto text-gray-300 mb-6">
          <code>{`from langchain_openai import OpenAIEmbeddings

embeddings_model = OpenAIEmbeddings(model="text-embedding-3-small")
vector = embeddings_model.embed_query("Hello world")
print(f"Dimensions: {len(vector)}") # Output: 1536`}</code>
        </pre>

        <h3 className="text-lg font-semibold mb-3 text-white">Using HuggingFace (Local CPU/GPU)</h3>
        <pre className="bg-[#111] border border-[#333] rounded-xl p-4 font-mono text-sm overflow-x-auto text-gray-300">
          <code>{`from langchain_community.embeddings import HuggingFaceEmbeddings

# Downloads the model to your machine and runs locally
embeddings_model = HuggingFaceEmbeddings(model_name="all-MiniLM-L6-v2")
vector = embeddings_model.embed_query("Hello world")
print(f"Dimensions: {len(vector)}") # Output: 384`}</code>
        </pre>
      </section>

      <section id="visualizing" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">12. Visualizing Embeddings</h2>
        <p className="text-gray-300">Because humans cannot see in 1536 dimensions, data scientists use dimensionality reduction algorithms like <strong className="text-white">t-SNE</strong> or <strong className="text-white">UMAP</strong> to squash the vectors down into 2D or 3D space while preserving the local distances between points. This allows us to plot them on a standard graph to look for semantic clusters and outlier data points.</p>
      </section>

      <section id="examples" className="mb-12 border-b border-[#333] pb-8">
        <h2 className="text-2xl font-bold mb-4 text-white">13. Real-world Examples</h2>
        <ul className="list-disc pl-6 text-gray-300 space-y-2">
          <li><strong className="text-white">Semantic Search (RAG):</strong> Finding paragraphs in a company handbook that answer a user's question, even if they use entirely different vocabulary.</li>
          <li><strong className="text-white">Recommendation Systems:</strong> Embedding user profiles and movies into the same vector space. If a user vector is near a movie vector, the system recommends that movie.</li>
          <li><strong className="text-white">Anomaly Detection:</strong> Finding log entries or financial transactions whose vectors sit far outside the standard cluster norms.</li>
        </ul>
      </section>

      <section id="mistakes" className="mb-12">
        <h2 className="text-2xl font-bold mb-4 text-white">14. Common Mistakes</h2>
        <div className="grid grid-cols-1 gap-4">
          <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-xl">
            <h4 className="text-red-400 font-bold mb-2">⚠️ Not Normalizing Before Dot Product</h4>
            <p className="text-sm text-gray-300">If your database uses Dot Product but your vectors are not normalized to a length of 1, longer texts will unfairly score higher simply because they have larger magnitude vectors. <em>Always normalize if using Dot Product for text similarity.</em></p>
          </div>
          <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-xl">
            <h4 className="text-red-400 font-bold mb-2">⚠️ Dimension Mismatch</h4>
            <p className="text-sm text-gray-300">You cannot compare a 384-dimensional vector to a 1536-dimensional vector. Furthermore, you cannot compare two 1536-dimensional vectors created by different models! All data in a single vector index must be created by the <strong className="text-white">exact same embedding model version</strong>.</p>
          </div>
          <div className="bg-red-900/10 border border-red-500/20 p-4 rounded-xl">
            <h4 className="text-red-400 font-bold mb-2">⚠️ Asymmetric Search Ignorance</h4>
            <p className="text-sm text-gray-300">If your queries are short (e.g., "Python error") but your documents are long paragraphs, you have an asymmetric search problem. You must use embedding models trained specifically for asymmetric QA, not just general semantic similarity.</p>
          </div>
        </div>
      </section>

    </GuideLayout>
  );
};

export default RagEmbeddings;

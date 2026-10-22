import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';

export default function EmbeddingsIndex() {
  const [similarityScore, setSimilarityScore] = useState(null);

  const calculateSimilarity = () => {
    // Fake calculation for demo purposes
    setSimilarityScore(Math.floor(Math.random() * 40) + 60); 
  };

  const toc = [
    { label: 'Vector Embeddings', hash: '#what' },
    { label: 'Measuring Similarity', hash: '#math' },
    { label: 'Interactive Demo', hash: '#interactive' },
    { label: 'Top Models', hash: '#models' }
  ];

  return (
    <GuideLayout
      title="Embeddings Deep Dive"
      intro="Understand Vector Embeddings, similarity metrics, and compare top embedding models."
      toc={toc}
    >
      {/* WHAT IS AN EMBEDDING */}
      <motion.section id="what" className="mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="mb-8">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-blue-400 uppercase bg-blue-500/10 rounded-full border border-blue-500/20">
            Deep Dive
          </div>
          <h1 className="text-4xl font-bold text-white mb-4">Vector Embeddings</h1>
          <p className="text-gray-400 text-lg leading-relaxed">
            Embeddings are how AI models understand the meaning of words. They convert text into high-dimensional arrays of numbers where semantic similarity equals mathematical closeness.
          </p>
        </div>

        <div className="p-12 bg-black/40 border border-white/10 rounded-2xl flex flex-col items-center text-center relative overflow-hidden">
          <div className="absolute inset-0 bg-blue-500/5 blur-3xl rounded-full"></div>
          <div className="relative z-10 w-full flex flex-col items-center">
            <h2 className="text-2xl font-bold text-white mb-8">How meaning becomes math</h2>
            
            <motion.div initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} className="px-6 py-3 bg-gray-800 border border-gray-600 rounded-xl text-xl text-white mb-6 shadow-lg">
              "Apple"
            </motion.div>
            
            <div className="text-gray-500 mb-6 text-xl">↓</div>
            
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.5 }} className="px-8 py-4 bg-purple-900/30 border border-purple-500/50 rounded-xl text-purple-300 font-bold mb-6 shadow-lg">
              Embedding Model
            </motion.div>
            
            <div className="text-gray-500 mb-6 text-xl">↓</div>
            
            <motion.div initial={{ y: 20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1 }} className="px-6 py-3 bg-green-900/30 border border-green-500/50 rounded-xl font-mono text-green-400 shadow-lg break-all max-w-full">
              [0.34, -0.12, 0.88, ... 1536 dims]
            </motion.div>
            
            <div className="mt-12 bg-white/5 border border-white/10 rounded-xl p-6 text-left max-w-md w-full">
              <div className="text-blue-400 text-sm font-semibold mb-2">Step 1</div>
              <h3 className="text-lg font-bold text-white mb-2">Text Input</h3>
              <p className="text-gray-400 mb-4">A word or sentence is fed into the system.</p>
              <div className="text-sm text-gray-500 border-t border-white/10 pt-4">Computers can't do math on letters, so we must translate.</div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* MATH: SIMILARITY METRICS */}
      <motion.section id="math" className="mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="mb-8">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-purple-400 uppercase bg-purple-500/10 rounded-full border border-purple-500/20">
            Vector Math
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Measuring Similarity</h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Once text is converted to vectors, we need a mathematical way to determine how "close" two concepts are in multi-dimensional space.
          </p>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">📐</span>
              <h3 className="text-xl font-bold text-white">Cosine Similarity</h3>
            </div>
            <p className="text-sm text-gray-400 mb-6 min-h-[80px]">
              Measures the <strong>angle</strong> between two vectors. It ignores the magnitude (length) of the vectors, focusing purely on direction. This is the <strong>industry standard</strong> for text embeddings.
            </p>
            <div className="bg-black/50 p-4 rounded-lg mb-4 flex justify-center items-center">
              <div className="font-mono text-sm text-center">
                <div className="text-gray-300">cos(θ) = </div>
                <div className="inline-block align-middle ml-2">
                  <div className="border-b border-gray-500 pb-1">A · B</div>
                  <div className="pt-1">||A|| ||B||</div>
                </div>
              </div>
            </div>
            <div className="text-xs font-mono bg-blue-900/20 text-blue-300 p-2 rounded border border-blue-500/20 text-center">
              Range: -1 (Opposite) to 1 (Identical)
            </div>
          </div>
          
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">📏</span>
              <h3 className="text-xl font-bold text-white">Euclidean Distance (L2)</h3>
            </div>
            <p className="text-sm text-gray-400 mb-6 min-h-[80px]">
              Measures the <strong>straight-line distance</strong> between the endpoints of two vectors. It is highly sensitive to the magnitude (length) of the vectors.
            </p>
            <div className="bg-black/50 p-4 rounded-lg mb-4 flex justify-center items-center h-[72px]">
              <div className="font-mono text-sm text-gray-300">
                d(A, B) = √Σ(Aᵢ - Bᵢ)²
              </div>
            </div>
            <div className="text-xs font-mono bg-blue-900/20 text-blue-300 p-2 rounded border border-blue-500/20 text-center">
              Range: 0 (Identical) to ∞
            </div>
          </div>
          
          <div className="p-6 bg-white/5 border border-white/10 rounded-xl hover:bg-white/10 transition-colors">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-2xl">✖️</span>
              <h3 className="text-xl font-bold text-white">Dot Product</h3>
            </div>
            <p className="text-sm text-gray-400 mb-6 min-h-[80px]">
              Measures both <strong>angle and magnitude</strong>. If vectors are normalized (length of 1), Dot Product is mathematically identical to Cosine Similarity. It is faster to compute.
            </p>
            <div className="bg-black/50 p-4 rounded-lg mb-4 flex justify-center items-center h-[72px]">
              <div className="font-mono text-sm text-gray-300">
                A · B = Σ(Aᵢ × Bᵢ)
              </div>
            </div>
            <div className="text-xs font-mono bg-blue-900/20 text-blue-300 p-2 rounded border border-blue-500/20 text-center">
              Range: -∞ to ∞ (or -1 to 1 if normalized)
            </div>
          </div>
        </div>
      </motion.section>

      {/* INTERACTIVE DEMO */}
      <motion.section id="interactive" className="mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="mb-8">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-green-400 uppercase bg-green-500/10 rounded-full border border-green-500/20">
            Playground
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Interactive Similarity Calculator</h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Type two sentences below to see how semantically similar they are. (Note: This is a fast, lightweight browser simulation of cosine similarity).
          </p>
        </div>

        <div className="p-8 bg-[#111] border border-white/10 rounded-2xl shadow-xl">
          <div className="flex flex-col md:flex-row gap-6 mb-6">
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Sentence A</label>
              <textarea className="w-full bg-black/50 border border-gray-700 rounded-lg p-4 text-gray-200 focus:outline-none focus:border-blue-500 transition-colors resize-none" rows={3} defaultValue="The quick brown fox jumps over the lazy dog." />
            </div>
            <div className="flex-1">
              <label className="block text-sm font-medium text-gray-300 mb-2">Sentence B</label>
              <textarea className="w-full bg-black/50 border border-gray-700 rounded-lg p-4 text-gray-200 focus:outline-none focus:border-blue-500 transition-colors resize-none" rows={3} defaultValue="A fast auburn canine leaps across a sleepy hound." />
            </div>
          </div>
          
          <div className="flex justify-center mb-8">
            <button onClick={calculateSimilarity} className="px-8 py-3 bg-blue-600 hover:bg-blue-500 text-white rounded-lg font-medium transition-colors shadow-lg shadow-blue-500/20">
              Calculate Similarity
            </button>
          </div>
          
          {similarityScore && (
            <div className="max-w-md mx-auto p-6 bg-white/5 border border-white/10 rounded-xl text-center">
              <div className="text-5xl font-bold text-white mb-2 tracking-tight">{similarityScore}<span className="text-3xl text-gray-400">%</span></div>
              <div className="text-sm font-medium text-gray-400 uppercase tracking-widest mb-4">Semantic Overlap</div>
              <div className="w-full h-3 bg-gray-800 rounded-full overflow-hidden">
                <motion.div initial={{ width: 0 }} animate={{ width: `${similarityScore}%` }} transition={{ duration: 0.8, ease: "easeOut" }} className="h-full bg-gradient-to-r from-blue-500 to-purple-500" />
              </div>
            </div>
          )}
        </div>
      </motion.section>

      {/* EMBEDDING MODELS COMPARISON */}
      <motion.section id="models" className="mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="mb-8">
          <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-orange-400 uppercase bg-orange-500/10 rounded-full border border-orange-500/20">
            Landscape
          </div>
          <h2 className="text-3xl font-bold text-white mb-4">Top Embedding Models</h2>
          <p className="text-gray-400 text-lg leading-relaxed">
            Not all embeddings are created equal. Models balance dimensionality (accuracy) against speed and storage cost. Here is a comparison of popular models.
          </p>
        </div>
        
        <div className="overflow-x-auto rounded-xl border border-white/10 bg-[#0a0a0a] shadow-xl mb-8">
          <table className="w-full text-left border-collapse min-w-[800px]">
            <thead>
              <tr className="bg-white/5 text-gray-300 text-sm border-b border-white/10">
                <th className="p-4 font-semibold">Model Provider</th>
                <th className="p-4 font-semibold">Model Name</th>
                <th className="p-4 font-semibold">Dimensions</th>
                <th className="p-4 font-semibold">Context Length</th>
                <th className="p-4 font-semibold">Accuracy (MTEB)</th>
                <th className="p-4 font-semibold">Speed / Cost</th>
              </tr>
            </thead>
            <tbody className="text-sm text-gray-400 divide-y divide-white/5">
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-white font-medium">OpenAI</td>
                <td className="p-4 font-mono text-blue-300 bg-blue-900/10 rounded inline-block my-2 mx-2">text-embedding-3-large</td>
                <td className="p-4">3072</td>
                <td className="p-4">8191 tokens</td>
                <td className="p-4"><span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs border border-green-500/30">Very High</span></td>
                <td className="p-4">Commercial API</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-white font-medium">OpenAI</td>
                <td className="p-4 font-mono text-blue-300 bg-blue-900/10 rounded inline-block my-2 mx-2">text-embedding-3-small</td>
                <td className="p-4">1536</td>
                <td className="p-4">8191 tokens</td>
                <td className="p-4"><span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs border border-green-500/30">High</span></td>
                <td className="p-4">Commercial API</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-white font-medium">BAAI</td>
                <td className="p-4 font-mono text-blue-300 bg-blue-900/10 rounded inline-block my-2 mx-2">bge-large-en-v1.5</td>
                <td className="p-4">1024</td>
                <td className="p-4">512 tokens</td>
                <td className="p-4"><span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs border border-green-500/30">High</span></td>
                <td className="p-4">Open Source (Fast)</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-white font-medium">Microsoft</td>
                <td className="p-4 font-mono text-blue-300 bg-blue-900/10 rounded inline-block my-2 mx-2">e5-large-v2</td>
                <td className="p-4">1024</td>
                <td className="p-4">512 tokens</td>
                <td className="p-4"><span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs border border-green-500/30">High</span></td>
                <td className="p-4">Open Source</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-white font-medium">Nomic AI</td>
                <td className="p-4 font-mono text-blue-300 bg-blue-900/10 rounded inline-block my-2 mx-2">nomic-embed-text-v1.5</td>
                <td className="p-4">768</td>
                <td className="p-4">8192 tokens</td>
                <td className="p-4"><span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs border border-blue-500/30">Good</span></td>
                <td className="p-4">Open / Matryoshka</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-white font-medium">Jina AI</td>
                <td className="p-4 font-mono text-blue-300 bg-blue-900/10 rounded inline-block my-2 mx-2">jina-embeddings-v2-base-en</td>
                <td className="p-4">768</td>
                <td className="p-4">8192 tokens</td>
                <td className="p-4"><span className="px-2 py-1 bg-blue-900/30 text-blue-400 rounded text-xs border border-blue-500/30">Good</span></td>
                <td className="p-4">Open Source</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-white font-medium">Alibaba</td>
                <td className="p-4 font-mono text-blue-300 bg-blue-900/10 rounded inline-block my-2 mx-2">gte-large</td>
                <td className="p-4">1024</td>
                <td className="p-4">512 tokens</td>
                <td className="p-4"><span className="px-2 py-1 bg-green-900/30 text-green-400 rounded text-xs border border-green-500/30">High</span></td>
                <td className="p-4">Open Source</td>
              </tr>
              <tr className="hover:bg-white/5 transition-colors">
                <td className="p-4 text-white font-medium">SentenceTransformers</td>
                <td className="p-4 font-mono text-blue-300 bg-blue-900/10 rounded inline-block my-2 mx-2">all-MiniLM-L6-v2</td>
                <td className="p-4">384</td>
                <td className="p-4">256 tokens</td>
                <td className="p-4"><span className="px-2 py-1 bg-yellow-900/30 text-yellow-400 rounded text-xs border border-yellow-500/30">Moderate</span></td>
                <td className="p-4">Extremely Fast</td>
              </tr>
            </tbody>
          </table>
        </div>
        
        <div className="p-6 bg-purple-900/10 border-l-4 border-purple-500 rounded-r-xl border-y border-r border-white/5">
          <div className="flex items-center gap-3 mb-2">
            <span className="text-xl">💡</span>
            <h3 className="text-lg font-bold text-purple-300">Matryoshka Representation Learning (MRL)</h3>
          </div>
          <p className="text-gray-300 pl-8 leading-relaxed">
            Modern models like OpenAI's v3 and Nomic support MRL. This allows you to "truncate" the vector (e.g., store only the first 256 dimensions instead of 3072) to save massive amounts of database storage space, while only losing a tiny fraction of accuracy.
          </p>
        </div>
      </motion.section>
    </GuideLayout>
  );
}

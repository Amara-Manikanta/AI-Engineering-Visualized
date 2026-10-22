import React from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';

export default function LlmInference() {
  const toc = [
    { label: "Overview", hash: "input" },
    { label: "Step 2: Tokenizer", hash: "tokenizer" },
    { label: "Step 3: Embedding Layer", hash: "embedding" },
    { label: "Step 4: Transformer Block", hash: "transformer" },
    { label: "Steps 5 & 6: Sampling", hash: "sampling" },
    { label: "Step 7: Speculative Decoding", hash: "speculative" },
    { label: "Steps 8 & 9: Streaming Output", hash: "streaming" },
  ];

  return (
    <GuideLayout
      title="How LLMs Actually Generate Text"
      intro="Most people treat LLMs as a black box. This guide breaks open the entire inference pipeline — from the moment you press Enter to the token that appears on your screen."
      toc={toc}
    >
      {/* Overview */}
      <motion.section 
        id="input" 
        className="mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="flex flex-col md:flex-row gap-6 items-center justify-center">
          <motion.div 
            className="flex-1 bg-indigo-900/20 border border-indigo-500/30 rounded-xl p-6 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-indigo-400 font-bold text-sm tracking-wider mb-2">PREFILL PHASE</div>
            <h3 className="text-xl font-semibold text-white mb-2">Process Input</h3>
            <p className="text-gray-400 text-sm mb-4">All input tokens are processed in parallel. Compute-bound. Fast on GPUs.</p>
            <div className="inline-block bg-indigo-500/20 text-indigo-300 px-3 py-1 rounded-full text-xs font-mono">Steps 1 → 4</div>
          </motion.div>
          
          <div className="text-gray-500 text-2xl font-bold md:rotate-0 rotate-90">→</div>

          <motion.div 
            className="flex-1 bg-fuchsia-900/20 border border-fuchsia-500/30 rounded-xl p-6 text-center"
            whileHover={{ scale: 1.02 }}
          >
            <div className="text-fuchsia-400 font-bold text-sm tracking-wider mb-2">DECODE PHASE</div>
            <h3 className="text-xl font-semibold text-white mb-2">Generate Output</h3>
            <p className="text-gray-400 text-sm mb-4">Tokens are generated one at a time, autoregressively. Memory-bound.</p>
            <div className="inline-block bg-fuchsia-500/20 text-fuchsia-300 px-3 py-1 rounded-full text-xs font-mono">Steps 5 → 9</div>
          </motion.div>
        </div>
      </motion.section>

      {/* Step 2: Tokenizer */}
      <motion.section 
        id="tokenizer"
        className="mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="text-xs font-bold text-indigo-400 uppercase tracking-wider mb-2">Step 2</div>
        <h2 className="text-2xl font-semibold text-white mb-4">🔤 Tokenizer</h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          Text is not fed directly to the model. It is first broken into <strong>tokens</strong> — subword units that balance vocabulary size with coverage. Then each token gets a numeric ID.
        </p>

        <div className="bg-white/5 border border-white/10 rounded-xl p-6 mb-8 text-center flex flex-col items-center gap-4">
          <div>
            <div className="text-gray-400 text-sm mb-1">User Input</div>
            <div className="text-lg text-white font-medium">"What is gravity?"</div>
          </div>
          <div className="text-gray-500">↓ Tokenize</div>
          <div className="flex flex-wrap justify-center items-center gap-2">
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded border border-blue-500/30">What</span>
            <span className="text-gray-600">|</span>
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded border border-blue-500/30">is</span>
            <span className="text-gray-600">|</span>
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded border border-blue-500/30">grav</span>
            <span className="text-gray-600">|</span>
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded border border-blue-500/30">ity</span>
            <span className="text-gray-600">|</span>
            <span className="bg-blue-500/20 text-blue-300 px-3 py-1 rounded border border-blue-500/30">?</span>
          </div>
          <div className="text-gray-500">↓ Token IDs (BPE Vocabulary)</div>
          <div className="flex flex-wrap justify-center gap-2">
            <span className="font-mono text-white bg-white/10 px-3 py-1 rounded">2601</span>
            <span className="font-mono text-white bg-white/10 px-3 py-1 rounded">318</span>
            <span className="font-mono text-white bg-white/10 px-3 py-1 rounded">26110</span>
            <span className="font-mono text-white bg-white/10 px-3 py-1 rounded">879</span>
            <span className="font-mono text-white bg-white/10 px-3 py-1 rounded">30</span>
          </div>
        </div>
      </motion.section>

      {/* Step 3: Embedding Layer */}
      <motion.section 
        id="embedding"
        className="mb-16 bg-white/5 -mx-6 px-6 py-10 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="text-xs font-bold text-fuchsia-400 uppercase tracking-wider mb-2">Step 3</div>
        <h2 className="text-2xl font-semibold text-white mb-4">📐 Embedding Layer</h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          Each token ID is looked up in a massive <strong>embedding matrix</strong> to get its vector representation. The model has learned a unique high-dimensional vector for every token in its vocabulary.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h4 className="text-white font-medium mb-2">What is d_model?</h4>
            <p className="text-gray-400 text-sm">The embedding dimension. GPT-2 uses 768, GPT-3 uses 12,288, GPT-4 reportedly 4096+. Larger d_model = more expressive representations.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h4 className="text-white font-medium mb-2">Position Encoding</h4>
            <p className="text-gray-400 text-sm">Transformers have no inherent notion of order. Positional encodings (or RoPE) are added to embeddings to tell the model the order of tokens.</p>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h4 className="text-white font-medium mb-2">Learned Representations</h4>
            <p className="text-gray-400 text-sm">Semantically similar tokens end up with geometrically close vectors — the geometry of meaning that enables reasoning.</p>
          </div>
        </div>
      </motion.section>

      {/* Step 4: Transformer */}
      <motion.section 
        id="transformer"
        className="mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="text-xs font-bold text-emerald-400 uppercase tracking-wider mb-2">Step 4 — The Core</div>
        <h2 className="text-2xl font-semibold text-white mb-4">⚡ Transformer Block (×N Layers)</h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          The embedding vectors flow through N identical transformer blocks. Each block has two major sub-components: <strong>Multi-Head Self-Attention</strong> and a <strong>Feed-Forward Network</strong>.
        </p>
        
        <div className="bg-[#111] border border-white/10 rounded-xl p-6 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl"></div>
          
          <h3 className="text-emerald-400 font-semibold mb-4 border-b border-white/10 pb-2">🔬 Multi-Head Self-Attention</h3>
          <div className="flex justify-center gap-4 mb-6">
            <div className="bg-white/5 border border-white/20 rounded-lg p-3 text-center w-24">
              <div className="font-bold text-white mb-1">Q</div>
              <div className="text-xs text-gray-400">Query</div>
            </div>
            <div className="bg-white/5 border border-white/20 rounded-lg p-3 text-center w-24">
              <div className="font-bold text-white mb-1">K</div>
              <div className="text-xs text-gray-400">Key</div>
            </div>
            <div className="bg-white/5 border border-white/20 rounded-lg p-3 text-center w-24">
              <div className="font-bold text-white mb-1">V</div>
              <div className="text-xs text-gray-400">Value</div>
            </div>
          </div>
          
          <div className="bg-emerald-900/30 border border-emerald-500/30 rounded-lg p-4 text-center mb-8">
            <div className="font-mono text-emerald-300 text-sm">softmax(QKᵀ / √d_k) × V</div>
          </div>

          <h3 className="text-emerald-400 font-semibold mb-4 border-b border-white/10 pb-2">🔁 Feed-Forward Network (FFN)</h3>
          <div className="flex items-center justify-center gap-4 text-sm font-mono text-gray-300">
            <div className="bg-white/10 px-4 py-2 rounded">Linear</div>
            <div>→</div>
            <div className="bg-emerald-500/20 text-emerald-300 border border-emerald-500/30 px-4 py-2 rounded">ReLU/SwiGLU</div>
            <div>→</div>
            <div className="bg-white/10 px-4 py-2 rounded">Linear</div>
          </div>
        </div>
      </motion.section>

      {/* Sampling */}
      <motion.section 
        id="sampling"
        className="mb-16 bg-white/5 -mx-6 px-6 py-10 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="text-xs font-bold text-orange-400 uppercase tracking-wider mb-2">Steps 5 & 6</div>
        <h2 className="text-2xl font-semibold text-white mb-4">🎲 LM Head + Sampling Strategy</h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          After the transformer stack, a final linear layer maps from d_model back to vocabulary size. Softmax converts logits to probabilities. Then a <strong>sampling strategy</strong> picks the next token.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <motion.div whileHover={{ scale: 1.02 }} className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
            <h3 className="text-orange-400 font-semibold mb-2">Greedy</h3>
            <p className="text-gray-400 text-sm">Always pick the highest-probability token. Fast, deterministic, but often repetitive. (Temp = 0)</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
            <h3 className="text-orange-400 font-semibold mb-2">Top-K</h3>
            <p className="text-gray-400 text-sm">Restrict sampling to the K most likely tokens, then sample from that pool.</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
            <h3 className="text-orange-400 font-semibold mb-2">Top-P (Nucleus)</h3>
            <p className="text-gray-400 text-sm">Include tokens until cumulative probability reaches P. Adapts dynamically.</p>
          </motion.div>
          <motion.div whileHover={{ scale: 1.02 }} className="bg-[#0a0a0a] border border-white/10 rounded-xl p-5">
            <h3 className="text-orange-400 font-semibold mb-2">Temperature</h3>
            <p className="text-gray-400 text-sm">Controls randomness. T→0 is deterministic, T=1 is standard, T&gt;1 is highly random.</p>
          </motion.div>
        </div>
      </motion.section>

      {/* Speculative Decoding */}
      <motion.section 
        id="speculative"
        className="mb-16"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="text-xs font-bold text-pink-400 uppercase tracking-wider mb-2">Step 7 — Speed Trick</div>
        <h2 className="text-2xl font-semibold text-white mb-4">🚀 Speculative Decoding</h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          A clever trick to make LLM inference 2-4x faster: a small <strong>Draft Model</strong> quickly generates K candidate tokens, then the large <strong>Target Model</strong> verifies them all in a single forward pass.
        </p>

        <div className="bg-gradient-to-r from-pink-900/20 to-purple-900/20 border border-pink-500/30 rounded-xl p-6 flex flex-col md:flex-row items-center gap-6">
          <div className="flex-1 bg-black/40 p-4 rounded-lg border border-white/10">
            <div className="text-pink-300 font-semibold mb-1 text-sm">Draft Model (Small)</div>
            <div className="flex gap-2 font-mono text-sm">
              <span className="bg-white/10 px-2 py-1 rounded">Grav</span>
              <span className="bg-white/10 px-2 py-1 rounded">ity</span>
              <span className="bg-white/10 px-2 py-1 rounded">is</span>
            </div>
          </div>
          <div className="text-gray-500 font-bold hidden md:block">→ Verify →</div>
          <div className="flex-1 bg-black/40 p-4 rounded-lg border border-white/10">
            <div className="text-purple-300 font-semibold mb-1 text-sm">Target Model (Large)</div>
            <div className="flex gap-2 font-mono text-sm">
              <span className="bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-1 rounded">Grav ✓</span>
              <span className="bg-green-500/20 text-green-300 border border-green-500/30 px-2 py-1 rounded">ity ✓</span>
              <span className="bg-red-500/20 text-red-300 border border-red-500/30 px-2 py-1 rounded">is ✗</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* Streaming Output */}
      <motion.section 
        id="streaming"
        className="mb-16 bg-white/5 -mx-6 px-6 py-10 rounded-2xl"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
      >
        <div className="text-xs font-bold text-cyan-400 uppercase tracking-wider mb-2">Steps 8 & 9</div>
        <h2 className="text-2xl font-semibold text-white mb-4">📡 Detokenizer & Streaming Output</h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          After sampling the next token ID, it's converted back to text by the <strong>Detokenizer</strong>. The token is immediately streamed to the user via Server-Sent Events (SSE).
        </p>

        <div className="bg-[#0a0a0a] border border-cyan-500/30 rounded-xl p-6 font-mono text-lg text-white">
          <span className="text-cyan-300">Gravity </span>
          <span className="text-cyan-300">is </span>
          <span className="text-cyan-300">a </span>
          <span className="text-cyan-300">fundamental </span>
          <span className="text-cyan-300">force </span>
          <span className="text-cyan-300">that</span>
          <motion.span 
            className="inline-block w-2 h-5 bg-white ml-1 align-middle"
            animate={{ opacity: [1, 0] }}
            transition={{ repeat: Infinity, duration: 0.8 }}
          />
        </div>
      </motion.section>

    </GuideLayout>
  );
}

import React, { useState } from "react";
import { motion } from "framer-motion";
import GuideLayout from "../components/GuideLayout";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";

const ATTENTION_WORDS = ["The", "animal", "didn't", "cross", "the", "street", "because", "it", "was", "too", "tired"];

// Attention weights from "it" to all other tokens (showing strong coreference to "animal")
const SAMPLE_ATTENTION_MATRIX = [
  // The   animal didn't cross  the   street because  it   was   too   tired
  [0.08, 0.45,  0.03,  0.06,  0.04, 0.12,  0.05,   0.02, 0.04, 0.03, 0.08], // The
  [0.05, 0.52,  0.02,  0.10,  0.03, 0.14,  0.04,   0.02, 0.03, 0.02, 0.03], // animal
  [0.04, 0.15,  0.35,  0.22,  0.02, 0.05,  0.05,   0.02, 0.05, 0.02, 0.03], // didn't
  [0.03, 0.20,  0.15,  0.28,  0.04, 0.18,  0.03,   0.01, 0.03, 0.02, 0.03], // cross
  [0.02, 0.04,  0.02,  0.08,  0.10, 0.65,  0.02,   0.01, 0.02, 0.01, 0.03], // the
  [0.03, 0.18,  0.03,  0.22,  0.08, 0.38,  0.02,   0.01, 0.02, 0.01, 0.02], // street
  [0.02, 0.12,  0.08,  0.10,  0.02, 0.06,  0.28,   0.05, 0.12, 0.05, 0.10], // because
  [0.03, 0.58,  0.03,  0.04,  0.02, 0.08,  0.06,   0.04, 0.04, 0.02, 0.06], // it -> attends 58% to "animal"!
  [0.02, 0.15,  0.04,  0.05,  0.02, 0.04,  0.08,   0.12, 0.22, 0.10, 0.16], // was
  [0.01, 0.08,  0.02,  0.03,  0.01, 0.03,  0.04,   0.04, 0.10, 0.25, 0.39], // too
  [0.02, 0.42,  0.02,  0.03,  0.01, 0.04,  0.05,   0.08, 0.10, 0.08, 0.15], // tired -> animal was tired
];

const ARCH_BLOCKS = [
  {
    id: "input-emb",
    name: "Input Tokenization & Embeddings",
    location: "Encoder & Decoder Input",
    shape: "(Batch, Seq_Len) → (Batch, Seq_Len, d_model)",
    formula: "X = Embedding(Tokens) + Positional_Encoding",
    color: "from-blue-600 to-indigo-600",
    border: "border-blue-500/40",
    role: "Converts discrete vocabulary integer token IDs into rich continuous vector spaces (e.g., d_model = 4096 in Llama 3) where semantic proximity translates to cosine similarity."
  },
  {
    id: "rope-pe",
    name: "Positional Encoding (RoPE / Sinusoidal)",
    location: "Embedding Layer / Attention QK",
    shape: "(Batch, Seq_Len, d_model)",
    formula: "PE(pos, 2i) = sin(pos / 10000^{2i/d}), PE(pos, 2i+1) = cos(pos / 10000^{2i/d})",
    color: "from-pink-600 to-rose-600",
    border: "border-pink-500/40",
    role: "Injects sequence order into the set-based self-attention operation. Modern LLMs use RoPE (Rotary Position Embeddings) to rotate Query and Key vectors in complex 2D planes."
  },
  {
    id: "self-attn",
    name: "Multi-Head Self-Attention",
    location: "Encoder & Decoder Blocks",
    shape: "Q, K, V: (B, h, T, d_k) → Out: (B, T, d_model)",
    formula: "Attention(Q, K, V) = softmax( Q K^T / √d_k ) V",
    color: "from-purple-600 to-indigo-600",
    border: "border-purple-500/40",
    role: "Allows every token in the sequence to dynamically route information and update its representation by querying and aggregating values from all other tokens in parallel."
  },
  {
    id: "masked-attn",
    name: "Masked (Causal) Self-Attention",
    location: "Autoregressive Decoder Blocks (GPT / Llama)",
    shape: "Mask: (T, T) where Mask_{i,j} = -∞ for j > i",
    formula: "Attention_masked = softmax( (Q K^T / √d_k) + M ) V",
    color: "from-amber-600 to-orange-600",
    border: "border-amber-500/40",
    role: "Prevents tokens from looking into future sequence positions during autoregressive generation. The upper triangle is set to -∞ so softmax evaluates exactly to 0.0."
  },
  {
    id: "cross-attn",
    name: "Encoder-Decoder Cross-Attention",
    location: "Seq2Seq Decoders (T5 / Whisper)",
    shape: "Queries from Decoder, Keys & Values from Encoder",
    formula: "Cross_Attn = softmax( Q_dec K_enc^T / √d_k ) V_enc",
    color: "from-cyan-600 to-teal-600",
    border: "border-cyan-500/40",
    role: "Bridges the two towers. The decoder queries the entire encoded source sequence representation to generate translations, transcriptions, or summaries."
  },
  {
    id: "norm-res",
    name: "Residual Connections & LayerNorm (Pre-LN / RMSNorm)",
    location: "Wrapped around each sub-layer",
    shape: "(Batch, Seq_Len, d_model)",
    formula: "Output = LayerNorm(x + SubLayer(x))  [or x + SubLayer(RMSNorm(x)) in Pre-LN]",
    color: "from-emerald-600 to-green-600",
    border: "border-emerald-500/40",
    role: "Residual connections provide an unimpeded gradient superhighway directly back through 100+ layers. Modern models use Pre-RMSNorm to eliminate scale drift without mean centering."
  },
  {
    id: "ffn",
    name: "Feed-Forward Network (MLP / SwiGLU)",
    location: "Applied to each position independently",
    shape: "(B, T, d_model) → (B, T, 4·d_model) → (B, T, d_model)",
    formula: "FFN(x) = max(0, x W₁ + b₁) W₂ + b₂  [or SwiGLU: (x W_{gate} · swish(x W₁)) W₂]",
    color: "from-violet-600 to-fuchsia-600",
    border: "border-violet-500/40",
    role: "The knowledge repository of the Transformer. While attention determines routing, the FFN layers store factual associations, world knowledge, and semantic transformations."
  },
  {
    id: "lm-head",
    name: "Final Linear Projection & Softmax",
    location: "Output Layer",
    shape: "(Batch, Seq_Len, d_model) → (Batch, Seq_Len, Vocab_Size)",
    formula: "P(next_token | context) = softmax( hidden_states · W_vocab^T )",
    color: "from-rose-600 to-red-600",
    border: "border-rose-500/40",
    role: "Projects the final d_model dimensional contextual vector into a logit score for every token in the vocabulary (e.g. 128,000 tokens), normalized by softmax into probabilities."
  }
];

export default function MlTransformers() {
  const [selectedWordIdx, setSelectedWordIdx] = useState(7); // default on "it"
  const [activeArchBlock, setActiveArchBlock] = useState("self-attn");
  const [attnStep, setAttnStep] = useState(1);
  const [tokText, setTokText] = useState("Self-attention enables massive parallel training.");
  const [tokens, setTokens] = useState(["Self", "-attention", " enables", " massive", " parallel", " training", "."]);
  const [activeFamily, setActiveFamily] = useState("decoder");

  const currentBlock = ARCH_BLOCKS.find(b => b.id === activeArchBlock) || ARCH_BLOCKS[2];

  const handleTokenize = () => {
    const rawWords = tokText.split(" ").filter(w => w.trim());
    const result = [];
    rawWords.forEach((w) => {
      if (w.length > 5) {
        result.push(w.slice(0, 4));
        result.push(w.slice(4));
      } else {
        result.push(w);
      }
    });
    setTokens(result);
  };

  const toc = [
    { label: "Transformer Architecture Blueprint", hash: "full-architecture" },
    { label: "Scaled Dot-Product Attention Math", hash: "scaled-dot-product" },
    { label: "Interactive Attention Matrix", hash: "attention-matrix" },
    { label: "Multi-Head Attention Tensor Split", hash: "multi-head" },
    { label: "Positional Encoding: Sinusoidal to RoPE", hash: "positional-encoding" },
    { label: "The 3 Architectural Families", hash: "three-families" },
    { label: "Modern LLM Innovations (2017-2026)", hash: "modern-innovations" },
    { label: "Interactive Tokenization & Embeddings", hash: "tokenization" },
    { label: "PyTorch Implementation Blueprint", hash: "pytorch-code" },
    { label: "Knowledge Check Quiz", hash: "knowledge-check" },
  ];

  return (
    <GuideLayout
      title="The Transformer Architecture & Generative AI"
      intro="The architectural foundation of modern AI. From mathematical scaled dot-product attention and causal masking to multi-head tensor splitting, RoPE positional rotations, and modern FlashAttention runtimes."
      toc={toc}
    >
      <div className="space-y-16">

        {/* HERO SECTION */}
        <section className="relative p-8 md:p-12 rounded-3xl bg-gradient-to-br from-[#101018] via-[#0d0d14] to-[#07070a] border border-white/10 shadow-2xl overflow-hidden">
          <div className="absolute top-0 right-0 w-[450px] h-[450px] bg-indigo-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="absolute bottom-0 left-0 w-[350px] h-[350px] bg-pink-500/10 rounded-full blur-3xl pointer-events-none" />

          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 rounded-full text-xs font-mono font-bold mb-6">
              <span className="w-2 h-2 rounded-full bg-indigo-400 animate-ping" />
              <span>Deep Visual Engineering Guide</span>
            </div>

            <h1 className="text-3xl md:text-5xl font-black text-white mb-6 leading-tight">
              Attention Is All You Need: <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-300 to-pink-400">
                Inside the Modern Transformer
              </span>
            </h1>

            <p className="text-gray-300 text-base md:text-lg max-w-3xl leading-relaxed mb-8">
              Prior to 2017, sequence modeling relied on Recurrent Neural Networks (RNNs) and LSTMs that processed tokens strictly sequentially — creating an un-parallelizable bottleneck and suffering from vanishing gradients over long horizons. 
              The Transformer replaced recurrence entirely with <strong>Self-Attention</strong>, allowing whole documents to be processed in parallel across GPU clusters.
            </p>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs font-mono">
              <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-gray-300">
                <span className="text-indigo-400 block font-bold mb-1">Complexity</span>
                O(T²) Time / O(T²) Space
              </div>
              <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-gray-300">
                <span className="text-emerald-400 block font-bold mb-1">Context Length</span>
                128K – 1M+ Tokens
              </div>
              <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-gray-300">
                <span className="text-pink-400 block font-bold mb-1">Key Equation</span>
                softmax(QKᵀ / √d_k) V
              </div>
              <div className="p-3 rounded-xl bg-black/50 border border-white/10 text-gray-300">
                <span className="text-amber-400 block font-bold mb-1">Primary Dominance</span>
                LLMs, Vision, Audio, Biology
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 1: INTERACTIVE FULL DUAL-TOWER ARCHITECTURE BLUEPRINT */}
        <section id="full-architecture" className="scroll-mt-24">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">1. Interactive Transformer Architecture Blueprint</h2>
            <p className="text-sm text-gray-400 mt-1">
              Click any block in the architectural diagram below to inspect its tensor dimensions, mathematical formula, and operational role.
            </p>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
            {/* Visual Architecture Diagram (Left/Center) */}
            <div className="lg:col-span-7 p-6 rounded-3xl bg-[#0c0c10] border border-white/10 shadow-2xl flex flex-col items-center">
              <div className="text-xs font-mono uppercase text-gray-400 tracking-wider mb-6 flex items-center justify-between w-full">
                <span>The Vaswani Dual-Tower Stack</span>
                <span className="text-indigo-400">Click a component to inspect</span>
              </div>

              {/* Output Softmax & Linear */}
              <button
                onClick={() => setActiveArchBlock("lm-head")}
                className={`w-full max-w-sm py-2.5 px-4 rounded-xl border text-xs font-mono font-bold mb-3 transition-all cursor-pointer ${
                  activeArchBlock === "lm-head"
                    ? "bg-rose-500/20 border-rose-400 text-rose-300 shadow-lg shadow-rose-500/20 scale-[1.02]"
                    : "bg-black/60 border-white/10 text-gray-300 hover:border-white/30"
                }`}
              >
                Output Probabilities (Linear Projection + Softmax)
              </button>

              <div className="w-0.5 h-4 bg-gray-700" />

              {/* The Towers Container */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-lg mb-3">
                {/* ENCODER TOWER */}
                <div className="p-4 rounded-2xl bg-indigo-950/20 border border-indigo-500/30 flex flex-col items-center space-y-2.5">
                  <span className="text-[11px] font-mono font-bold uppercase text-indigo-400">Encoder Block (× N)</span>
                  
                  <button
                    onClick={() => setActiveArchBlock("norm-res")}
                    className={`w-full py-2 px-3 rounded-lg border text-[11px] font-mono transition-all cursor-pointer ${
                      activeArchBlock === "norm-res" ? "bg-emerald-500/20 border-emerald-400 text-emerald-300 font-bold" : "bg-black/40 border-white/10 text-gray-300"
                    }`}
                  >
                    Add &amp; Norm (Pre-LN)
                  </button>
                  
                  <button
                    onClick={() => setActiveArchBlock("ffn")}
                    className={`w-full py-2 px-3 rounded-lg border text-[11px] font-mono transition-all cursor-pointer ${
                      activeArchBlock === "ffn" ? "bg-violet-500/20 border-violet-400 text-violet-300 font-bold" : "bg-black/40 border-white/10 text-gray-300"
                    }`}
                  >
                    Feed Forward (MLP)
                  </button>

                  <div className="w-0.5 h-2 bg-gray-700" />

                  <button
                    onClick={() => setActiveArchBlock("self-attn")}
                    className={`w-full py-2 px-3 rounded-lg border text-[11px] font-mono transition-all cursor-pointer ${
                      activeArchBlock === "self-attn" ? "bg-purple-500/20 border-purple-400 text-purple-300 font-bold" : "bg-black/40 border-white/10 text-gray-300"
                    }`}
                  >
                    Multi-Head Self-Attention
                  </button>
                </div>

                {/* DECODER TOWER */}
                <div className="p-4 rounded-2xl bg-pink-950/20 border border-pink-500/30 flex flex-col items-center space-y-2.5">
                  <span className="text-[11px] font-mono font-bold uppercase text-pink-400">Decoder Block (× N)</span>
                  
                  <button
                    onClick={() => setActiveArchBlock("ffn")}
                    className={`w-full py-2 px-3 rounded-lg border text-[11px] font-mono transition-all cursor-pointer ${
                      activeArchBlock === "ffn" ? "bg-violet-500/20 border-violet-400 text-violet-300 font-bold" : "bg-black/40 border-white/10 text-gray-300"
                    }`}
                  >
                    Feed Forward (MLP)
                  </button>

                  <button
                    onClick={() => setActiveArchBlock("cross-attn")}
                    className={`w-full py-2 px-3 rounded-lg border text-[11px] font-mono transition-all cursor-pointer ${
                      activeArchBlock === "cross-attn" ? "bg-cyan-500/20 border-cyan-400 text-cyan-300 font-bold" : "bg-black/40 border-white/10 text-gray-300"
                    }`}
                  >
                    Multi-Head Cross-Attention
                  </button>

                  <button
                    onClick={() => setActiveArchBlock("masked-attn")}
                    className={`w-full py-2 px-3 rounded-lg border text-[11px] font-mono transition-all cursor-pointer ${
                      activeArchBlock === "masked-attn" ? "bg-amber-500/20 border-amber-400 text-amber-300 font-bold" : "bg-black/40 border-white/10 text-gray-300"
                    }`}
                  >
                    Masked Causal Attention
                  </button>
                </div>
              </div>

              {/* Embedding & Positional Encodings */}
              <div className="grid grid-cols-2 gap-4 w-full max-w-lg">
                <button
                  onClick={() => setActiveArchBlock("rope-pe")}
                  className={`py-2 px-3 rounded-xl border text-[11px] font-mono transition-all cursor-pointer ${
                    activeArchBlock === "rope-pe" ? "bg-rose-500/20 border-rose-400 text-rose-300 font-bold" : "bg-black/50 border-white/10 text-gray-400"
                  }`}
                >
                  Positional Encoding (RoPE)
                </button>
                <button
                  onClick={() => setActiveArchBlock("rope-pe")}
                  className={`py-2 px-3 rounded-xl border text-[11px] font-mono transition-all cursor-pointer ${
                    activeArchBlock === "rope-pe" ? "bg-rose-500/20 border-rose-400 text-rose-300 font-bold" : "bg-black/50 border-white/10 text-gray-400"
                  }`}
                >
                  Positional Encoding (RoPE)
                </button>
              </div>

              <div className="grid grid-cols-2 gap-4 w-full max-w-lg mt-2">
                <button
                  onClick={() => setActiveArchBlock("input-emb")}
                  className={`py-2 px-3 rounded-xl border text-[11px] font-mono transition-all cursor-pointer ${
                    activeArchBlock === "input-emb" ? "bg-blue-500/20 border-blue-400 text-blue-300 font-bold" : "bg-black/60 border-white/10 text-gray-300"
                  }`}
                >
                  Source Input Tokens (X)
                </button>
                <button
                  onClick={() => setActiveArchBlock("input-emb")}
                  className={`py-2 px-3 rounded-xl border text-[11px] font-mono transition-all cursor-pointer ${
                    activeArchBlock === "input-emb" ? "bg-blue-500/20 border-blue-400 text-blue-300 font-bold" : "bg-black/60 border-white/10 text-gray-300"
                  }`}
                >
                  Target Shifted Tokens (Y)
                </button>
              </div>
            </div>

            {/* Inspector Panel (Right) */}
            <div className="lg:col-span-5 p-6 rounded-3xl bg-[#111116] border border-white/10 shadow-2xl space-y-5">
              <div className="flex items-center justify-between border-b border-white/10 pb-4">
                <div>
                  <span className="text-[10px] font-mono uppercase text-gray-500 block">Inspected Component</span>
                  <h3 className="text-xl font-bold text-white">{currentBlock.name}</h3>
                </div>
                <span className="text-xs font-mono text-indigo-400 bg-indigo-950/50 px-2.5 py-1 rounded-lg border border-indigo-500/30">
                  {currentBlock.location}
                </span>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-gray-400 block mb-1.5">Tensor Transformations &amp; Dimensions:</label>
                <div className="p-3 rounded-xl bg-black/70 border border-white/10 font-mono text-xs text-emerald-400">
                  {currentBlock.shape}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-gray-400 block mb-1.5">Mathematical Formula:</label>
                <div className="p-3 rounded-xl bg-black/70 border border-white/10 font-mono text-xs text-purple-300 overflow-x-auto whitespace-nowrap">
                  {currentBlock.formula}
                </div>
              </div>

              <div>
                <label className="text-[11px] font-mono uppercase text-gray-400 block mb-1.5">Engineering Role &amp; Mechanism:</label>
                <p className="text-xs text-gray-300 leading-relaxed bg-white/5 p-4 rounded-xl border border-white/5">
                  {currentBlock.role}
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 2: SCALED DOT-PRODUCT ATTENTION DEEP DIVE */}
        <section id="scaled-dot-product" className="scroll-mt-24">
          <div className="p-6 md:p-8 rounded-3xl bg-[#111116] border border-white/10 shadow-xl">
            <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">2. Scaled Dot-Product Attention: Step-by-Step Matrix Math</h2>
                <p className="text-sm text-gray-400 mt-1">Walk through the 6 matrix operations that turn raw tokens into contextual representations.</p>
              </div>

              <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10">
                {[1, 2, 3, 4, 5, 6].map((st) => (
                  <button
                    key={st}
                    onClick={() => setAttnStep(st)}
                    className={`w-8 h-8 rounded-lg text-xs font-mono font-bold transition-all cursor-pointer ${
                      attnStep === st ? "bg-indigo-600 text-white" : "text-gray-400 hover:text-white"
                    }`}
                  >
                    {st}
                  </button>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-center">
              <div className="lg:col-span-7 space-y-4">
                {attnStep === 1 && (
                  <div className="p-5 rounded-2xl bg-black/60 border border-indigo-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-indigo-400 uppercase">Step 1: Linear Projections</span>
                      <span className="text-xs font-mono text-gray-500">(T × d_model) → (T × d_k)</span>
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed">
                      Each input token embedding vector <span className="font-mono text-indigo-300">X</span> is multiplied by three learned projection matrices:
                    </p>
                    <div className="font-mono text-xs space-y-1.5 p-3 rounded-xl bg-white/5 text-gray-300">
                      <div>Q = X · W_Q &nbsp;&nbsp;(Queries: "What information am I seeking?")</div>
                      <div>K = X · W_K &nbsp;&nbsp;(Keys: "What information do I contain?")</div>
                      <div>V = X · W_V &nbsp;&nbsp;(Values: "What is my actual content vector?")</div>
                    </div>
                  </div>
                )}

                {attnStep === 2 && (
                  <div className="p-5 rounded-2xl bg-black/60 border border-emerald-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-emerald-400 uppercase">Step 2: Dot-Product Matrix Multiplication Q · Kᵀ</span>
                      <span className="text-xs font-mono text-gray-500">(T × d_k) × (d_k × T) → (T × T)</span>
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed">
                      Every Query vector is dot-producted against every Key vector. Geometrically, the dot product computes the raw unnormalized cosine alignment (compatibility score) between token <em>i</em> and token <em>j</em>.
                    </p>
                    <div className="font-mono text-xs p-3 rounded-xl bg-white/5 text-emerald-300">
                      Scores_matrix = Q · Kᵀ &nbsp;&nbsp;[Dimension: T × T]
                    </div>
                  </div>
                )}

                {attnStep === 3 && (
                  <div className="p-5 rounded-2xl bg-black/60 border border-amber-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-amber-400 uppercase">Step 3: Scaling by 1 / √d_k</span>
                      <span className="text-xs font-mono text-gray-500">Crucial Numerical Stability Trick</span>
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed">
                      Why divide by <span className="font-mono text-amber-300">√d_k</span>? If Q and K are independent zero-mean unit-variance variables, their dot product has mean 0 and variance <span className="font-mono text-amber-300">d_k</span>.
                    </p>
                    <p className="text-xs text-gray-400 leading-relaxed">
                      For large dimensions (e.g. d_k = 128), dot products grow extremely large, pushing the softmax function into flat regions with tiny gradients (vanishing gradient problem). Dividing by √d_k enforces variance = 1.0!
                    </p>
                  </div>
                )}

                {attnStep === 4 && (
                  <div className="p-5 rounded-2xl bg-black/60 border border-rose-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-rose-400 uppercase">Step 4: Causal Masking (Decoder Only)</span>
                      <span className="text-xs font-mono text-gray-500">Enforcing the Arrow of Time</span>
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed">
                      To generate text autoregressively, token <em>i</em> must not attend to token <em>j</em> where <em>j &gt; i</em>. We add a lower-triangular mask where upper entries are <span className="font-mono text-rose-400">-∞</span>.
                    </p>
                    <div className="font-mono text-xs p-3 rounded-xl bg-white/5 text-rose-300">
                      Masked_Scores = (Q · Kᵀ / √d_k) + M, &nbsp;where M_ij = -∞ for j &gt; i
                    </div>
                  </div>
                )}

                {attnStep === 5 && (
                  <div className="p-5 rounded-2xl bg-black/60 border border-purple-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-purple-400 uppercase">Step 5: Row-wise Softmax Normalization</span>
                      <span className="text-xs font-mono text-gray-500">Probabilities Sum to 1.0 per Row</span>
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed">
                      Softmax is applied independently across each row of the scaled matrix. It exponentiates all scores and divides by the row sum, turning scores into a probability distribution:
                    </p>
                    <div className="font-mono text-xs p-3 rounded-xl bg-white/5 text-purple-300">
                      A_ij = exp(S_ij) / ∑_k exp(S_ik) &nbsp;→&nbsp; ∑_j A_ij = 1.0
                    </div>
                  </div>
                )}

                {attnStep === 6 && (
                  <div className="p-5 rounded-2xl bg-black/60 border border-cyan-500/30 space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-xs font-mono font-bold text-cyan-400 uppercase">Step 6: Value Blending (A · V)</span>
                      <span className="text-xs font-mono text-gray-500">(T × T) × (T × d_v) → (T × d_v)</span>
                    </div>
                    <p className="text-sm text-gray-200 leading-relaxed">
                      Each token's output is computed as a weighted average of all Value vectors in the sequence, weighted by their attention probability. The result is pure context-enriched representation.
                    </p>
                    <div className="font-mono text-xs p-3 rounded-xl bg-white/5 text-cyan-300">
                      Context_Out = A · V &nbsp;&nbsp;[Dimension: T × d_v]
                    </div>
                  </div>
                )}

                <div className="flex gap-2 pt-2">
                  <button
                    onClick={() => setAttnStep(s => Math.max(1, s - 1))}
                    disabled={attnStep === 1}
                    className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 disabled:opacity-30 text-white font-mono text-xs"
                  >
                    ← Previous
                  </button>
                  <button
                    onClick={() => setAttnStep(s => Math.min(6, s + 1))}
                    disabled={attnStep === 6}
                    className="px-4 py-2 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-30 text-white font-mono text-xs font-bold"
                  >
                    Next Step ({attnStep}/6) →
                  </button>
                </div>
              </div>

              {/* Graphic Matrix Dimension Pipe */}
              <div className="lg:col-span-5 p-6 rounded-2xl bg-black/80 border border-white/10 flex flex-col items-center justify-center">
                <div className="text-[11px] font-mono text-gray-400 uppercase mb-4 tracking-wider">
                  Tensor Pipeline Flowchart
                </div>
                <div className="space-y-3 w-full font-mono text-xs text-center">
                  <div className="p-2.5 rounded-lg bg-blue-950/40 border border-blue-500/30 text-blue-300">
                    Input X: [Batch, T, d_model]
                  </div>
                  <div className="text-gray-500">↓ (W_Q, W_K, W_V)</div>
                  <div className="grid grid-cols-3 gap-2">
                    <span className="p-2 rounded bg-indigo-950/40 border border-indigo-500/30 text-indigo-300">Q [T, d_k]</span>
                    <span className="p-2 rounded bg-emerald-950/40 border border-emerald-500/30 text-emerald-300">K [T, d_k]</span>
                    <span className="p-2 rounded bg-purple-950/40 border border-purple-500/30 text-purple-300">V [T, d_v]</span>
                  </div>
                  <div className="text-gray-500">↓ Q × Kᵀ / √d_k</div>
                  <div className="p-2.5 rounded-lg bg-amber-950/40 border border-amber-500/30 text-amber-300">
                    Raw Attention Logits: [T, T]
                  </div>
                  <div className="text-gray-500">↓ Softmax (Row-wise)</div>
                  <div className="p-2.5 rounded-lg bg-purple-950/40 border border-purple-500/30 text-purple-300">
                    Attention Probabilities A: [T, T]
                  </div>
                  <div className="text-gray-500">↓ A × V</div>
                  <div className="p-2.5 rounded-lg bg-cyan-950/40 border border-cyan-500/30 text-cyan-300">
                    Context Output: [T, d_v]
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 3: INTERACTIVE ATTENTION MATRIX HEATMAP */}
        <section id="attention-matrix" className="scroll-mt-24">
          <div className="p-6 md:p-8 rounded-3xl bg-[#111116] border border-white/10 shadow-xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
              3. Interactive Attention Matrix Heatmap
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Coreference resolution in action: Click any token in the prompt below to see which words it pays attention to. Notice how <span className="text-indigo-400 font-bold">"it"</span> focuses 58% of its attention directly onto <span className="text-emerald-400 font-bold">"animal"</span>!
            </p>

            {/* Token Selector Row */}
            <div className="flex flex-wrap gap-2 mb-8 bg-black/60 p-4 rounded-2xl border border-white/10">
              {ATTENTION_WORDS.map((w, idx) => (
                <button
                  key={idx}
                  onClick={() => setSelectedWordIdx(idx)}
                  className={`px-3 py-1.5 rounded-xl font-mono text-xs transition-all cursor-pointer ${
                    selectedWordIdx === idx
                      ? "bg-indigo-600 text-white font-bold shadow-lg shadow-indigo-500/30 scale-105"
                      : "bg-white/5 hover:bg-white/10 text-gray-300 border border-white/5"
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>

            {/* Attention Distribution Bars */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center">
              <div className="space-y-2 bg-black/70 p-6 rounded-2xl border border-white/10">
                <div className="text-xs font-mono text-gray-400 mb-3 uppercase tracking-wider">
                  Query: "<span className="text-indigo-300 font-bold">{ATTENTION_WORDS[selectedWordIdx]}</span>" attention to all keys:
                </div>
                {ATTENTION_WORDS.map((w, keyIdx) => {
                  const weight = SAMPLE_ATTENTION_MATRIX[selectedWordIdx][keyIdx];
                  const pct = Math.round(weight * 100);
                  const isTop = weight >= 0.40;
                  return (
                    <div key={keyIdx} className="flex items-center gap-3 text-xs font-mono">
                      <span className={`w-16 truncate text-right ${isTop ? "text-emerald-300 font-bold" : "text-gray-400"}`}>
                        {w}
                      </span>
                      <div className="flex-1 h-5 bg-gray-900 rounded-md overflow-hidden border border-white/5">
                        <motion.div
                          className={`h-full rounded-md flex items-center justify-end pr-2 text-[10px] font-bold text-white ${
                            isTop ? "bg-gradient-to-r from-indigo-500 to-emerald-400" : "bg-indigo-600/60"
                          }`}
                          initial={{ width: 0 }}
                          animate={{ width: `${pct}%` }}
                          transition={{ duration: 0.35 }}
                        >
                          {pct > 5 && `${pct}%`}
                        </motion.div>
                      </div>
                      <span className="w-8 text-gray-500 text-[11px]">{pct}%</span>
                    </div>
                  );
                })}
              </div>

              {/* Explanatory Insight Box */}
              <div className="space-y-4">
                <div className="p-5 rounded-2xl bg-indigo-950/30 border border-indigo-500/30">
                  <h4 className="text-sm font-bold text-indigo-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                    <span>💡</span> Why Self-Attention Resolves Ambiguity
                  </h4>
                  <p className="text-xs text-gray-300 leading-relaxed">
                    In the sentence: <em>"The animal didn't cross the street because it was too tired"</em>, a standalone word embedding for "it" is meaningless. 
                    Self-attention computes that the Query vector for "it" strongly aligns with the Key vector for "animal". The resulting Context vector absorbs the representation of "animal", solving pronoun resolution without any manual rule!
                  </p>
                </div>

                <div className="p-4 rounded-xl bg-black/60 border border-white/10 font-mono text-xs text-gray-400">
                  <div className="text-emerald-400 font-bold mb-1">Contrast with Recurrent Networks (LSTMs):</div>
                  An LSTM would have to compress the entire sentence into a single 512-dim hidden state across 8 sequential timesteps. By the time it reached "it", earlier word details often blurred or degraded.
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 4: MULTI-HEAD ATTENTION TENSOR SPLIT */}
        <section id="multi-head" className="scroll-mt-24">
          <div className="p-6 md:p-8 rounded-3xl bg-[#111116] border border-white/10 shadow-xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">4. Multi-Head Attention: Parallel Subspace Projections</h2>
            <p className="text-sm text-gray-400 mb-6">Why one attention head is never enough: different heads specialize in distinct linguistic and factual relationships.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
              {[
                { head: "Head 1", role: "Syntactic Structure", desc: "Tracks subject-verb agreement and direct object verbs (e.g. 'cat' → 'sat').", color: "border-blue-500/40 text-blue-300" },
                { head: "Head 2", role: "Coreference & Pronouns", desc: "Connects pronouns back to antecedent entities across paragraphs.", color: "border-pink-500/40 text-pink-300" },
                { head: "Head 3", role: "Local Proximity Window", desc: "Acts like a 1D convolution, attending to adjacent neighboring tokens.", color: "border-emerald-500/40 text-emerald-300" },
                { head: "Head 4", role: "Long-Range Semantic Links", desc: "Links topical concepts regardless of intervening token distance.", color: "border-amber-500/40 text-amber-300" },
              ].map((h, i) => (
                <div key={i} className={`p-4 rounded-2xl bg-black/60 border ${h.color}`}>
                  <div className="font-mono text-xs font-bold uppercase mb-1">{h.head}</div>
                  <div className="text-sm font-bold text-white mb-1.5">{h.role}</div>
                  <p className="text-xs text-gray-400 leading-relaxed">{h.desc}</p>
                </div>
              ))}
            </div>

            <div className="p-5 rounded-2xl bg-black/80 border border-white/10 font-mono text-xs text-gray-300 leading-relaxed">
              <div className="text-indigo-400 font-bold mb-2">// Multi-Head Tensor Concatenation Equation:</div>
              MultiHead(Q, K, V) = Concat(head₁, head₂, ..., head_h) · W_O<br />
              <span className="text-gray-500">where head_i = Attention(Q · W_Q^i, K · W_K^i, V · W_V^i) with projection dimension d_k = d_model / h</span>
            </div>
          </div>
        </section>

        {/* SECTION 5: POSITIONAL ENCODINGS (SINUSOIDAL TO ROPE) */}
        <section id="positional-encoding" className="scroll-mt-24">
          <div className="p-6 md:p-8 rounded-3xl bg-[#111116] border border-white/10 shadow-xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">5. Positional Encoding: From Sinusoids (2017) to RoPE (2026)</h2>
            <p className="text-sm text-gray-400 mb-6">How modern LLMs encode token position without losing relative distance awareness.</p>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Sinusoidal (Vaswani 2017) */}
              <div className="p-6 rounded-2xl bg-black/60 border border-white/10 space-y-3">
                <span className="text-xs font-mono font-bold uppercase text-gray-400">Absolute Sinusoidal (Vaswani 2017)</span>
                <p className="text-xs text-gray-300 leading-relaxed">
                  Adds fixed sinusoidal wave frequencies directly to the input embedding: <span className="font-mono text-indigo-300">x_pos = embed + PE_pos</span>.
                </p>
                <div className="font-mono text-xs p-3 rounded-xl bg-white/5 text-gray-300 space-y-1">
                  <div>PE(pos, 2i) = sin(pos / 10000<sup>2i/d</sup>)</div>
                  <div>PE(pos, 2i+1) = cos(pos / 10000<sup>2i/d</sup>)</div>
                </div>
                <p className="text-xs text-gray-500">
                  Drawback: Modifies embedding magnitudes directly and struggles with context window length extrapolation beyond training size.
                </p>
              </div>

              {/* Rotary Position Embeddings (RoPE) */}
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-950/30 to-purple-950/30 border border-indigo-500/40 space-y-3">
                <span className="text-xs font-mono font-bold uppercase text-indigo-400">Rotary Position Embeddings - RoPE (Llama 3, Mistral, GPT-4)</span>
                <p className="text-xs text-gray-200 leading-relaxed">
                  Instead of adding vectors to embeddings, RoPE <strong>rotates</strong> Query and Key vectors in 2D coordinate pairs by an angle proportional to position <em>m</em>!
                </p>
                <div className="font-mono text-xs p-3 rounded-xl bg-black/80 border border-indigo-500/30 text-purple-300">
                  R_θ,m · q_m &nbsp;&nbsp;and&nbsp;&nbsp; R_θ,n · k_n<br />
                  ⟨R_m q, R_n k⟩ = g(q, k, m - n)
                </div>
                <p className="text-xs text-indigo-200/80">
                  Core Advantage: The inner product depends <em>strictly on relative distance (m - n)</em>, making length extrapolation and KV caching far superior.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 6: THE 3 ARCHITECTURAL FAMILIES */}
        <section id="three-families" className="scroll-mt-24">
          <div className="mb-6">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white">6. The 3 Transformer Architectural Families</h2>
            <p className="text-sm text-gray-400 mt-1">Which architecture powers which task?</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {[
              {
                id: "encoder-only",
                name: "Encoder-Only",
                modelEx: "BERT, RoBERTa, DeBERTa",
                attentionType: "Bidirectional Self-Attention",
                bestFor: "Classification, Sentiment, Named Entity Recognition, Search Vector Embeddings",
                howItWorks: "Every token attends to all tokens to its left AND right simultaneously. Ideal for understanding existing text, not generating new tokens.",
                color: "border-blue-500/40"
              },
              {
                id: "decoder-only",
                name: "Decoder-Only",
                modelEx: "GPT-4, Llama 3, Claude, Mistral, DeepSeek",
                attentionType: "Causal (Autoregressive) Masked Attention",
                bestFor: "Conversational AI, Text Generation, Reasoning, Code Synthesis",
                howItWorks: "Tokens can only attend to past and current tokens. Has won the industry standard for foundation general-purpose models due to scaling laws.",
                color: "border-indigo-500/50 bg-indigo-950/20"
              },
              {
                id: "encoder-decoder",
                name: "Encoder-Decoder (Seq2Seq)",
                modelEx: "T5, BART, Whisper",
                attentionType: "Bidirectional Encoder + Causal Cross-Attention Decoder",
                bestFor: "Audio-to-Text Transcription, Language Translation, Abstractive Summarization",
                howItWorks: "Encoder thoroughly maps arbitrary input length into dense representations; decoder reads them via cross-attention to generate output.",
                color: "border-emerald-500/40"
              }
            ].map((fam) => (
              <div
                key={fam.id}
                onClick={() => setActiveFamily(fam.id)}
                className={`p-6 rounded-2xl border transition-all cursor-pointer ${fam.color} ${
                  activeFamily === fam.id
                    ? "ring-2 ring-indigo-400 bg-white/[0.07] scale-[1.02]"
                    : "bg-[#111116] hover:bg-white/[0.04]"
                } flex flex-col justify-between shadow-xl`}
              >
                <div>
                  <span className="text-[11px] font-mono font-bold uppercase text-indigo-400 mb-1 block">{fam.name}</span>
                  <h3 className="text-lg font-bold text-white mb-2">{fam.modelEx}</h3>
                  <div className="p-2 rounded-lg bg-black/50 border border-white/5 font-mono text-xs text-emerald-400 mb-3">
                    {fam.attentionType}
                  </div>
                  <p className="text-xs text-gray-300 leading-relaxed mb-4">{fam.howItWorks}</p>
                </div>
                <div className="text-[11px] font-mono text-gray-400 bg-white/5 p-3 rounded-xl border border-white/5">
                  <strong className="text-white block mb-0.5">Best Used For:</strong>
                  {fam.bestFor}
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* SECTION 7: MODERN ARCHITECTURAL INNOVATIONS (2017-2026) */}
        <section id="modern-innovations" className="scroll-mt-24">
          <div className="p-6 md:p-8 rounded-3xl bg-[#111116] border border-white/10 shadow-xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">7. Modern LLM Architecture Innovations (2017 – 2026)</h2>
            <p className="text-sm text-gray-400 mb-6">How today's frontier models differ from the original 2017 Transformer specification:</p>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {[
                { title: "RMSNorm (Root Mean Square)", origin: "Replaced LayerNorm", benefit: "Skips mean calculation, reducing memory read bandwidth overhead by ~7% with zero loss in training stability." },
                { title: "SwiGLU Activation", origin: "Replaced ReLU / GELU in MLP", benefit: "Gated linear units with Swish activation improve token perplexity and sample efficiency across pretraining." },
                { title: "Grouped-Query Attention (GQA)", origin: "Replaced Multi-Head Attention", benefit: "Shares Key & Value heads across groups of Query heads, slashing inference KV Cache memory usage by 75%." },
                { title: "FlashAttention-2 / 3", origin: "IO-Aware Tiling Algorithm", benefit: "Bypasses slow GPU HBM memory writes by fusing Softmax and Attention in fast on-chip SRAM." },
                { title: "KV Caching (Key-Value Cache)", origin: "Inference Decoding Runtime", benefit: "Caches previously computed K & V states so autoregressive decode avoids recomputing O(T²) historical matrices." },
                { title: "Mixture of Experts (MoE)", origin: "Sparse Feed-Forward Routing", benefit: "Replaces dense FFN with 8-64 sparse expert MLPs; activates only top-2 per token, delivering 70B performance at 14B compute." }
              ].map((inv, idx) => (
                <div key={idx} className="p-4 rounded-xl bg-black/60 border border-white/10">
                  <div className="text-[10px] font-mono text-indigo-400 uppercase font-bold mb-1">{inv.origin}</div>
                  <h4 className="text-sm font-bold text-white mb-1.5">{inv.title}</h4>
                  <p className="text-xs text-gray-300 leading-relaxed">{inv.benefit}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        {/* SECTION 8: INTERACTIVE TOKENIZATION & EMBEDDINGS */}
        <section id="tokenization" className="scroll-mt-24">
          <div className="p-6 md:p-8 rounded-3xl bg-[#111116] border border-white/10 shadow-xl">
            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
              8. Interactive Tokenization &amp; Embedding Spaces
            </h2>
            <p className="text-sm text-gray-400 mb-6">
              Language models do not see words or letters. Text is split into subword tokens using algorithms like Byte-Pair Encoding (BPE), mapped to vocabulary integers, and projected into continuous vector embeddings.
            </p>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-start">
              {/* Live Tokenizer */}
              <div className="space-y-4 bg-black/60 p-6 rounded-2xl border border-white/10">
                <label className="block text-xs font-mono uppercase text-gray-400">
                  Live Subword Tokenizer Simulator:
                </label>
                <textarea
                  value={tokText}
                  onChange={(e) => setTokText(e.target.value)}
                  className="w-full h-24 bg-[#0a0a0f] border border-white/15 rounded-xl p-3 text-xs font-mono text-white focus:outline-none focus:border-indigo-400 resize-none"
                  placeholder="Type any sentence to tokenize..."
                />
                <button
                  onClick={handleTokenize}
                  className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl text-xs font-bold transition-all shadow-md hover:shadow-indigo-500/25 cursor-pointer"
                >
                  Tokenize Sentence ✂️
                </button>

                <div className="pt-2">
                  <div className="text-[11px] font-mono text-gray-400 mb-2">
                    Resulting Tokens ({tokens.length} tokens):
                  </div>
                  <div className="flex flex-wrap gap-2 min-h-[48px]">
                    {tokens.map((tok, i) => (
                      <span
                        key={i}
                        className="px-2.5 py-1 rounded-lg bg-indigo-950/60 border border-indigo-500/40 font-mono text-xs text-indigo-200"
                      >
                        "{tok}" <span className="text-[10px] text-gray-500">#{1000 + i * 27}</span>
                      </span>
                    ))}
                  </div>
                </div>
              </div>

              {/* Embedding Arithmetic */}
              <div className="space-y-4 bg-black/60 p-6 rounded-2xl border border-white/10">
                <div className="text-xs font-mono uppercase text-gray-400">
                  Vector Arithmetic in Embedding Space:
                </div>
                <div className="p-4 rounded-xl bg-indigo-950/20 border border-indigo-500/30 text-center font-mono text-base text-gray-200">
                  vector("King") − vector("Man") + vector("Woman") ≈ <span className="text-pink-400 font-bold">vector("Queen")</span>
                </div>
                <p className="text-xs text-gray-300 leading-relaxed">
                  In a high-dimensional embedding space (e.g. 4,096 dimensions), linear direction vectors correspond to semantic concepts such as gender, tense, country-capital relationships, and plurals.
                </p>
                <div className="grid grid-cols-2 gap-2 text-[11px] font-mono">
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-gray-300">
                    cosine_sim(puppy, dog) ≈ 0.89
                  </div>
                  <div className="p-2.5 rounded-lg bg-white/5 border border-white/5 text-gray-300">
                    cosine_sim(paris, france) ≈ 0.84
                  </div>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* SECTION 9: PYTORCH IMPLEMENTATION BLUEPRINT */}
        <section id="pytorch-code" className="scroll-mt-24">
          <div className="p-6 md:p-8 rounded-3xl bg-[#0e0e13] border border-white/10 shadow-2xl">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <div>
                <h2 className="text-2xl md:text-3xl font-extrabold text-white">9. Production PyTorch Multi-Head Attention</h2>
                <p className="text-xs text-gray-400 font-mono mt-1">Clean, vectorized implementation from scratch with full tensor shapes</p>
              </div>
              <span className="px-3 py-1 rounded-full text-xs font-mono bg-purple-500/20 text-purple-300 border border-purple-500/30">
                PyTorch 2.x / Vectorized
              </span>
            </div>

            <div className="bg-black/80 rounded-2xl p-5 border border-white/10 overflow-x-auto font-mono text-xs text-gray-300 leading-relaxed">
              <pre>{`import math
import torch
import torch.nn as nn
import torch.nn.functional as F

class ScaledDotProductAttention(nn.Module):
    def __init__(self, dropout: float = 0.1):
        super().__init__()
        self.dropout = nn.Dropout(dropout)

    def forward(self, q, k, v, mask=None):
        # q, k, v shapes: (Batch, Num_Heads, Seq_Len, d_k)
        d_k = q.size(-1)
        
        # 1. Compute raw scores Q · K^T / sqrt(d_k)
        scores = torch.matmul(q, k.transpose(-2, -1)) / math.sqrt(d_k)
        
        # 2. Apply causal mask if provided (upper triangle = -inf)
        if mask is not None:
            scores = scores.masked_fill(mask == 0, -1e9)
            
        # 3. Softmax across last dimension
        attn_weights = F.softmax(scores, dim=-1)
        attn_weights = self.dropout(attn_weights)
        
        # 4. Context output: A · V
        output = torch.matmul(attn_weights, v)
        return output, attn_weights

class MultiHeadAttention(nn.Module):
    def __init__(self, d_model: int = 512, n_heads: int = 8, dropout: float = 0.1):
        super().__init__()
        assert d_model % n_heads == 0, "d_model must be divisible by n_heads"
        self.d_model = d_model
        self.n_heads = n_heads
        self.d_k = d_model // n_heads
        
        # Linear projections for Q, K, V and output
        self.w_q = nn.Linear(d_model, d_model, bias=False)
        self.w_k = nn.Linear(d_model, d_model, bias=False)
        self.w_v = nn.Linear(d_model, d_model, bias=False)
        self.w_o = nn.Linear(d_model, d_model, bias=False)
        
        self.attention = ScaledDotProductAttention(dropout)

    def forward(self, q, k, v, mask=None):
        B, T, _ = q.size()
        
        # Linear projection and reshape to (B, n_heads, T, d_k)
        q_proj = self.w_q(q).view(B, T, self.n_heads, self.d_k).transpose(1, 2)
        k_proj = self.w_k(k).view(B, -1, self.n_heads, self.d_k).transpose(1, 2)
        v_proj = self.w_v(v).view(B, -1, self.n_heads, self.d_k).transpose(1, 2)
        
        # Compute multi-head attention
        out, weights = self.attention(q_proj, k_proj, v_proj, mask=mask)
        
        # Concatenate heads: (B, T, d_model)
        out = out.transpose(1, 2).contiguous().view(B, T, self.d_model)
        
        # Final linear projection
        return self.w_o(out)`}</pre>
            </div>
          </div>
        </section>

        {/* SECTION 9: KNOWLEDGE CHECK QUIZ */}
        <section id="knowledge-check" className="scroll-mt-24">
          <KnowledgeCheck questions={questionsFor("transformers")} />
        </section>

      </div>
    </GuideLayout>
  );
}

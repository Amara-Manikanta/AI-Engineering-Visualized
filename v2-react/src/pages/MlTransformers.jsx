import React, { useState } from "react";
import { motion } from "framer-motion";
import GuideLayout from "../components/GuideLayout";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";

const ATTENTION_WORDS = ["The", "cat", "sat", "on", "the", "mat"];
const ATTENTION_WEIGHTS = [
  [0.10, 0.50, 0.10, 0.05, 0.15, 0.10],
  [0.15, 0.10, 0.45, 0.05, 0.05, 0.20],
  [0.05, 0.35, 0.10, 0.30, 0.05, 0.15],
  [0.05, 0.05, 0.20, 0.10, 0.20, 0.40],
  [0.05, 0.05, 0.05, 0.15, 0.10, 0.60],
  [0.05, 0.10, 0.10, 0.20, 0.45, 0.10],
];
const BAR_COLORS = ["bg-indigo-500", "bg-pink-500", "bg-emerald-500", "bg-amber-500", "bg-cyan-500", "bg-purple-500"];

const PIPELINE_STEPS = [
  {
    icon: "📝", title: "Input Text", color: "indigo",
    detail: "We start with a raw sentence: \"I love AI\". The model has no idea yet what these words mean — it only sees characters."
  },
  {
    icon: "✂️", title: "Tokenize → Token IDs", color: "pink",
    detail: "The text is split into tokens and mapped to integer IDs from the model's vocabulary: [\"I\", \"love\", \"AI\"] → [40, 3021, 15680]. These IDs are just lookup indexes — no meaning yet."
  },
  {
    icon: "🧮", title: "Token Embeddings", color: "emerald",
    detail: "Each token ID looks up a row in a learned embedding table, turning it into a dense vector. Similar words end up with similar vectors — this is where meaning first enters the pipeline."
  },
  {
    icon: "🌊", title: "+ Positional Encoding", color: "amber",
    detail: "Attention has no built-in sense of word order, so a position-dependent sine/cosine pattern is added to each embedding — telling the model \"I\" is 1st, \"love\" is 2nd, \"AI\" is 3rd."
  },
  {
    icon: "👁️", title: "Self-Attention (Q, K, V)", color: "cyan",
    detail: "Each token produces a Query, Key, and Value vector. Every token compares its Query against every other token's Key to compute attention scores, then blends in Values weighted by those scores — so \"AI\" absorbs relevant context from \"love\" and \"I\"."
  },
  {
    icon: "➕", title: "Add & Normalize", color: "purple",
    detail: "The attention output is added back to the original embedding (a residual connection, so information never gets fully overwritten) and the result is normalized to keep values stable across many layers."
  },
  {
    icon: "🔀", title: "Feed-Forward Network", color: "rose",
    detail: "Each token's vector independently passes through a small 2-layer MLP (expand → non-linearity → compress), followed by another Add & Normalize. This whole block — attention + FFN — then repeats N times (96 layers in a GPT-4-scale model)."
  },
  {
    icon: "🎯", title: "Linear + Softmax → Next Token", color: "green",
    detail: "After the final layer, a linear projection maps each token's vector to a score for every word in the vocabulary. Softmax turns those scores into probabilities, and the model samples (or picks the top one) as the next token — then feeds it back in and repeats."
  },
];

export default function MlTransformers() {
  const [archStep, setArchStep] = useState(1);
  const [tokText, setTokText] = useState("The Transformer model is a deep learning architecture.");
  const [tokens, setTokens] = useState([]);
  const [selectedWord, setSelectedWord] = useState(1);
  const [pipelineStep, setPipelineStep] = useState(1);

  const handleTokenize = () => {
    // Dummy subword tokenization simulation
    const rawWords = tokText.split(' ').filter(w => w.trim());
    const result = [];
    rawWords.forEach(w => {
      if (w.length > 6) {
        result.push(w.substring(0, 4));
        result.push(w.substring(4));
      } else {
        result.push(w);
      }
    });
    setTokens(result);
  };

  const nextArchStep = () => setArchStep(s => (s < 5 ? s + 1 : s));
  const prevArchStep = () => setArchStep(s => (s > 1 ? s - 1 : s));

  return (
    <GuideLayout
      title="Transformers & Gen AI"
      intro="Interactive visual explainer of Generative AI, Transformer architecture, Tokenization, Embeddings, Positional Encoding, Attention, and the full pipeline — inspired by transformer-explainer."
      toc={[
        { label: "What is Generative AI?", hash: "genai" },
        { label: "AI History Timeline", hash: "ai-history" },
        { label: "Types of AI", hash: "ai-types" },
        { label: "Language Models", hash: "language-models" },
        { label: "Transformer Architecture", hash: "transformer" },
        { label: "Tokenization", hash: "tokenization" },
        { label: "Embeddings", hash: "embeddings" },
        { label: "Positional Encoding", hash: "positional-encoding" },
        { label: "Attention Mechanism", hash: "attention" },
        { label: "Full Pipeline Walkthrough", hash: "pipeline-walkthrough" },
      ]}
    >
      {/* HERO SECTION */}
      <section className="text-center py-20 bg-gradient-to-b from-[#0a0a0a] to-[#111] rounded-2xl mb-16 border border-gray-800 relative overflow-hidden">
        <motion.div 
          className="absolute inset-0 opacity-20 pointer-events-none"
          animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          style={{ backgroundImage: 'radial-gradient(circle at center, #6366f1 1px, transparent 1px)', backgroundSize: '40px 40px' }}
        />
        <div className="relative z-10">
          <div className="inline-block px-3 py-1 bg-indigo-500/20 text-indigo-300 rounded-full text-sm font-semibold mb-6">Interactive Visual Explainer</div>
          <h1 className="text-5xl md:text-6xl font-black text-white mb-6 leading-tight">
            Transformers &amp;<br/>
            <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 to-pink-500">Generative AI</span>
          </h1>
          <p className="text-xl text-gray-400 max-w-2xl mx-auto mb-10">From raw text to intelligent generation — understand how Transformers work, step by step, with live animations.</p>
          <div className="flex justify-center gap-4 mb-10">
            <a href="#genai" className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium">Start Exploring ↓</a>
            <a href="#attention" className="px-6 py-3 bg-gray-800 hover:bg-gray-700 text-white rounded-lg transition-colors font-medium border border-gray-700">Jump to Attention</a>
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <span className="px-3 py-1 bg-[#111] border border-gray-800 rounded-full text-sm text-gray-400">🤖 Gen AI</span>
            <span className="px-3 py-1 bg-[#111] border border-gray-800 rounded-full text-sm text-gray-400">📜 Tokenization</span>
            <span className="px-3 py-1 bg-[#111] border border-gray-800 rounded-full text-sm text-gray-400">🧮 Embeddings</span>
            <span className="px-3 py-1 bg-[#111] border border-gray-800 rounded-full text-sm text-gray-400">👁️ Attention</span>
            <span className="px-3 py-1 bg-[#111] border border-gray-800 rounded-full text-sm text-gray-400">🔄 Encoder-Decoder</span>
          </div>
        </div>
      </section>

      {/* SECTION 1 */}
      <motion.section id="genai" className="guide-section mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="mb-8">
          <span className="inline-block px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs font-bold mb-2">01</span>
          <h2 className="text-3xl font-bold text-gray-100 mb-4">What is Generative AI?</h2>
          <p className="text-gray-400 text-lg">Generative AI involves models that can create new data that resembles a training dataset — from text, to images, music, and code.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8 items-center bg-[#111] p-8 rounded-xl border border-gray-800">
          <div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Generative AI models are trained to <strong>understand patterns</strong> in data and produce outputs that look and feel like the real thing. Unlike traditional AI that classifies or predicts, Gen AI creates.
            </p>
            <p className="text-gray-300 mb-6 leading-relaxed">
              The key breakthrough was the <strong>Transformer architecture</strong> (2017), which allowed models to process entire sequences in parallel and understand long-range dependencies — making large-scale generation possible.
            </p>
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800 text-gray-300"><span className="mr-2">📝</span> <strong>Text</strong> ChatGPT, Gemini, Claude</div>
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800 text-gray-300"><span className="mr-2">🖼️</span> <strong>Images</strong> DALL·E, Stable Diffusion</div>
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800 text-gray-300"><span className="mr-2">🎵</span> <strong>Music</strong> Suno, Udio</div>
              <div className="bg-black/40 p-3 rounded-lg border border-gray-800 text-gray-300"><span className="mr-2">💻</span> <strong>Code</strong> GitHub Copilot, Cursor</div>
            </div>
          </div>
          <div className="flex flex-col items-center">
            <div className="text-sm font-bold text-gray-400 mb-4">Raw Text Input</div>
            <div className="text-gray-500 mb-4">↓</div>
            <motion.div 
              animate={{ y: [0, -10, 0] }} 
              transition={{ duration: 3, repeat: Infinity }}
              className="bg-indigo-900/40 border border-indigo-500/50 rounded-2xl p-8 text-center w-full max-w-xs relative overflow-hidden"
            >
              <div className="text-xl font-bold text-indigo-300 relative z-10 mb-4">Transformer</div>
              <div className="flex gap-4 justify-center relative z-10">
                <div className="w-8 h-8 bg-white/20 rounded-lg animate-pulse" />
                <div className="w-8 h-8 bg-white/20 rounded-lg animate-pulse delay-75" />
                <div className="w-8 h-8 bg-white/20 rounded-lg animate-pulse delay-150" />
              </div>
            </motion.div>
            <div className="text-gray-500 mt-4 mb-4">↓</div>
            <div className="flex gap-4">
              <div className="px-3 py-1 bg-black/40 border border-gray-800 rounded-lg text-sm text-gray-300">📝 Text</div>
              <div className="px-3 py-1 bg-black/40 border border-gray-800 rounded-lg text-sm text-gray-300">🖼️ Image</div>
              <div className="px-3 py-1 bg-black/40 border border-gray-800 rounded-lg text-sm text-gray-300">💻 Code</div>
            </div>
          </div>
        </div>
      </motion.section>

      {/* AI HISTORY TIMELINE */}
      <motion.section id="ai-history" className="guide-section mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="mb-8">
          <span className="inline-block px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs font-bold mb-2">AI Journey</span>
          <h2 className="text-3xl font-bold text-gray-100 mb-4">Understanding AI's History</h2>
          <p className="text-gray-400 text-lg">From Alan Turing's test in the 1950s to today's powerful generative models — a visual journey through 7 decades of AI.</p>
        </div>
        
        <div className="overflow-x-auto pb-4">
          <div className="flex items-start min-w-[800px] gap-4">
            {[
              { year: "1950s", color: "bg-purple-500", text: "Alan Turing's Test", sub: "McCarthy coins \"Artificial Intelligence\"" },
              { year: "1960s", color: "bg-pink-500", text: "ELIZA & SHRDLU", sub: "First NLP chatbots" },
              { year: "1970s", color: "bg-emerald-500", text: "Expert Systems", sub: "Rise of rule-based AI" },
              { year: "1980s", color: "bg-blue-500", text: "ML Boom", sub: "Machine learning algorithms emerge" },
              { year: "1990s", color: "bg-purple-500", text: "Neural Networks", sub: "Backpropagation & SVMs" },
              { year: "2000s", color: "bg-amber-500", text: "Deep Learning Rise", sub: "GPUs unlock large models" },
              { year: "2010s", color: "bg-emerald-500", text: "NLP & Vision", sub: "BERT, GPT, ImageNet winners" },
              { year: "2020s", color: "bg-blue-500", text: "Gen AI Era", sub: "GPT-4, Gemini, autonomous AI agents" }
            ].map((node, i, arr) => (
              <React.Fragment key={i}>
                <div className="flex flex-col items-center w-32 shrink-0">
                  <div className={`w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-sm mb-4 ${node.color} shadow-[0_0_15px_rgba(255,255,255,0.2)] z-10`}>{node.year}</div>
                  <div className="text-center text-sm">
                    <strong className="text-gray-200 block mb-1">{node.text}</strong>
                    <span className="text-gray-500 text-xs">{node.sub}</span>
                  </div>
                </div>
                {i < arr.length - 1 && <div className="text-gray-700 mt-6 font-bold">→</div>}
              </React.Fragment>
            ))}
          </div>
        </div>
      </motion.section>

      {/* SECTION 2 · TYPES OF AI */}
      <motion.section id="ai-types" className="guide-section mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="mb-8">
          <span className="inline-block px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs font-bold mb-2">02</span>
          <h2 className="text-3xl font-bold text-gray-100 mb-4">Different Types of AI</h2>
          <p className="text-gray-400 text-lg">AI is not a monolith. Different AI systems are designed for fundamentally different purposes.</p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: "🔬", title: "Diagnostic / Descriptive", desc: "Analyzes historical data to understand what happened and why. Focuses on assessing correctness of past behavior.", ex: "Fraud detection reports", border: "border-indigo-500/30" },
            { icon: "📈", title: "Predictive AI", desc: "Forecasts future outcomes based on historical patterns. Concerned with answering: What will happen next?", ex: "Stock price models", border: "border-blue-500/30" },
            { icon: "🎯", title: "Prescriptive AI", desc: "Determines the optimal course of action by providing data-driven recommendations.", ex: "Route optimization", border: "border-emerald-500/30" },
            { icon: "✨", title: "Generative / Cognitive", desc: "Produces new content: code, articles, images, music. This is what powers ChatGPT, DALL·E, and Suno.", ex: "GPT-4, Stable Diffusion", border: "border-pink-500/50 bg-pink-900/10", glow: true },
            { icon: "⚡", title: "Reactive AI", desc: "Responds to specific inputs with predetermined responses. No memory, no learning from experience.", ex: "Deep Blue chess engine", border: "border-amber-500/30" },
            { icon: "🧠", title: "Limited Memory AI", desc: "Uses past experiences to inform current decisions. Modern ML models fall into this category.", ex: "Self-driving cars", border: "border-purple-500/30" },
            { icon: "💡", title: "Narrow AI (Weak AI)", desc: "Designed to perform a specific, limited range of tasks. Highly capable within its domain but nothing else.", ex: "Image classifiers", border: "border-indigo-500/30" },
            { icon: "🌐", title: "General AI (Strong AI)", desc: "Can understand, learn, and apply knowledge across a wide range of tasks like human intelligence. Still theoretical.", ex: "Hypothetical AGI", border: "border-pink-500/30" },
          ].map((type, i) => (
            <div key={i} className={`bg-[#111] border ${type.border} rounded-xl p-5 hover:border-gray-500 transition-colors ${type.glow ? 'shadow-[0_0_20px_rgba(236,72,153,0.1)]' : ''}`}>
              <div className="text-3xl mb-3">{type.icon}</div>
              <h3 className="text-lg font-bold text-gray-200 mb-2">{type.title}</h3>
              <p className="text-gray-400 text-sm mb-4 leading-relaxed">{type.desc}</p>
              <div className="text-xs font-mono text-gray-500 bg-black/50 p-2 rounded">EX: {type.ex}</div>
            </div>
          ))}
        </div>
      </motion.section>

      {/* SECTION 3 · LANGUAGE MODELS */}
      <motion.section id="language-models" className="guide-section mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="mb-8">
          <span className="inline-block px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs font-bold mb-2">03</span>
          <h2 className="text-3xl font-bold text-gray-100 mb-4">What are Language Models?</h2>
          <p className="text-gray-400 text-lg">Generative AI applications are powered by language models — specialized ML models for natural language processing.</p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="space-y-6">
            <div className="bg-[#111] p-6 rounded-xl border border-gray-800 flex gap-4">
              <div className="text-3xl">📖</div>
              <p className="text-gray-300 leading-relaxed text-sm">
                A <strong>Language Model (LM)</strong> is a machine learning model trained to understand, generate, and manipulate natural language. At its core, it <em>predicts the next token</em> in a sequence given all the previous ones.
              </p>
            </div>
            
            <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
              <h4 className="text-lg font-bold text-gray-200 mb-4">NLP Tasks Language Models Power:</h4>
              <div className="space-y-3">
                <div className="flex items-center gap-3 text-gray-300"><span className="text-xl">😊</span> Sentiment Analysis &amp; Text Classification</div>
                <div className="flex items-center gap-3 text-gray-300"><span className="text-xl">📄</span> Text Summarization</div>
                <div className="flex items-center gap-3 text-gray-300"><span className="text-xl">🔗</span> Semantic Similarity Comparison</div>
                <div className="flex items-center gap-3 text-gray-300"><span className="text-xl">✍️</span> New Natural Language Generation</div>
                <div className="flex items-center gap-3 text-gray-300"><span className="text-xl">🌍</span> Machine Translation</div>
              </div>
            </div>
          </div>

          <div className="bg-[#111] border border-gray-800 rounded-xl p-8 flex flex-col items-center justify-center text-center">
            <h4 className="text-xl font-bold text-gray-200 mb-6">Next Token Prediction Demo</h4>
            <div className="flex flex-wrap justify-center gap-2 mb-8">
              {['The', 'quick', 'brown', 'fox', 'jumps'].map((word, i) => (
                <span key={i} className="px-3 py-1 bg-gray-800 text-gray-300 rounded font-mono">{word}</span>
              ))}
              <span className="px-3 py-1 bg-indigo-900/50 text-indigo-300 border border-indigo-500 rounded font-mono animate-pulse">over</span>
            </div>
            <div className="w-full max-w-sm space-y-2 mb-6">
              <div className="flex items-center gap-2">
                <div className="w-[85%] bg-indigo-600 h-6 rounded flex items-center px-2 text-xs font-bold text-white">the</div>
                <div className="text-xs font-bold text-indigo-400 w-10 text-right">85%</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-[8%] bg-indigo-800 h-6 rounded flex items-center px-2 text-xs font-bold text-gray-300">a</div>
                <div className="text-xs font-bold text-indigo-400 w-10 text-right">8%</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-[4%] bg-indigo-900 h-6 rounded flex items-center px-2 text-xs font-bold text-gray-400">his</div>
                <div className="text-xs font-bold text-indigo-400 w-10 text-right">4%</div>
              </div>
              <div className="flex items-center gap-2">
                <div className="w-[3%] bg-gray-800 h-6 rounded flex items-center px-2 text-xs font-bold text-gray-500">every</div>
                <div className="text-xs font-bold text-indigo-400 w-10 text-right">3%</div>
              </div>
            </div>
            <button className="px-6 py-2 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-medium">Next Token →</button>
          </div>
        </div>
      </motion.section>

      {/* SECTION 4 · TRANSFORMER ARCHITECTURE */}
      <motion.section id="transformer" className="guide-section mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="mb-8">
          <span className="inline-block px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs font-bold mb-2">04</span>
          <h2 className="text-3xl font-bold text-gray-100 mb-4">The Transformer Architecture</h2>
          <p className="text-gray-400 text-lg">Introduced in "Attention is All You Need" (Vaswani et al., 2017). Click each component below to learn how it works.</p>
        </div>

        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-8 mb-8">
          <div className="flex justify-between items-center mb-8">
            <h3 className="text-lg font-bold text-gray-300">Step {archStep} / 5</h3>
            <div className="flex gap-3">
              <button onClick={prevArchStep} disabled={archStep === 1} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-50 text-white rounded-lg transition-colors font-medium">← Previous</button>
              <button onClick={nextArchStep} disabled={archStep === 5} className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-50 text-white rounded-lg transition-colors font-medium">Next Step →</button>
            </div>
          </div>
          
          <div className="flex flex-col md:flex-row gap-6 items-stretch justify-center mb-10">
            {/* Input Side */}
            <div className="flex flex-col items-center justify-center w-48">
              <motion.div animate={{ opacity: archStep >= 1 ? 1 : 0.3 }} className="bg-[#111] p-6 rounded-xl border border-gray-700 w-full text-center shadow-lg">
                <div className="text-4xl mb-3">📄</div>
                <div className="font-bold text-white">Documents</div>
              </motion.div>
              <div className="text-gray-500 my-2">↓</div>
            </div>
            
            {/* Center Box */}
            <div className="flex-1 max-w-xl bg-[#111] border border-gray-800 rounded-xl p-6 relative overflow-hidden flex flex-col gap-6">
              <div className="flex gap-4">
                <motion.div animate={{ opacity: archStep >= 2 ? 1 : 0.3, borderColor: archStep === 2 ? '#6366f1' : '#374151' }} className="flex-1 bg-[#1a1a1a] border-2 border-gray-700 p-5 rounded-lg text-center relative">
                  <div className="absolute top-2 left-2 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-xs text-gray-400 font-bold">2</div>
                  <div className="text-xl font-bold text-indigo-400 mb-1">Encoder</div>
                  <div className="text-xs text-gray-500">Tokenize → Embed → Attend</div>
                </motion.div>
                <motion.div animate={{ opacity: archStep >= 4 ? 1 : 0.3, borderColor: archStep === 4 ? '#ec4899' : '#374151' }} className="flex-1 bg-[#1a1a1a] border-2 border-gray-700 p-5 rounded-lg text-center relative">
                  <div className="absolute top-2 left-2 w-6 h-6 bg-gray-800 rounded-full flex items-center justify-center text-xs text-gray-400 font-bold">4</div>
                  <div className="text-xl font-bold text-pink-400 mb-1">Decoder</div>
                  <div className="text-xs text-gray-500">Cross-attend → Generate</div>
                </motion.div>
              </div>
              
              <motion.div animate={{ opacity: archStep >= 3 ? 1 : 0.3, borderColor: archStep === 3 ? '#10b981' : '#374151' }} className="bg-[#1a1a1a] border-2 border-gray-700 p-4 rounded-lg">
                <div className="text-sm font-bold text-emerald-400 mb-3 text-center">3 · Embeddings</div>
                <div className="grid grid-cols-2 gap-2 text-xs font-mono">
                  <div className="flex justify-between bg-black/50 p-2 rounded border border-gray-800"><span className="text-gray-300">🐕 dog</span> <span className="text-emerald-500/70">[10, 3, 2]</span></div>
                  <div className="flex justify-between bg-black/50 p-2 rounded border border-gray-800"><span className="text-gray-300">🐈 cat</span> <span className="text-emerald-500/70">[10, 3, 1]</span></div>
                  <div className="flex justify-between bg-black/50 p-2 rounded border border-gray-800"><span className="text-gray-300">🐶 puppy</span> <span className="text-emerald-500/70">[5, 2, 1]</span></div>
                  <div className="flex justify-between bg-black/50 p-2 rounded border border-gray-800"><span className="text-gray-300">🛹 skateboard</span> <span className="text-emerald-500/70">[-3, 3, 2]</span></div>
                </div>
              </motion.div>
            </div>

            {/* Output Side */}
            <div className="flex flex-col items-center justify-center w-48">
              <motion.div animate={{ opacity: archStep >= 5 ? 1 : 0.3 }} className="bg-[#111] p-6 rounded-xl border border-gray-700 w-full text-center shadow-lg">
                <div className="text-4xl mb-3">💬</div>
                <div className="font-bold text-white mb-3">Output Generation</div>
                <div className="bg-black/50 border border-gray-800 p-3 rounded text-left">
                  <div className="text-xs text-gray-500 mb-1">When my dog was…</div>
                  <div className="text-sm font-mono text-emerald-400 min-h-[20px] font-bold">
                    {archStep === 5 && <motion.span initial={{ opacity: 0 }} animate={{ opacity: 1 }}>a puppy</motion.span>}
                  </div>
                </div>
              </motion.div>
            </div>
          </div>
          
          <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-6 h-32 flex items-center justify-center text-center">
            {archStep === 1 && <p className="text-gray-300 text-lg"><strong>Step 1 · Document Ingestion:</strong> The model is trained with a large volume of natural language text — from the internet, books, and code. This corpus teaches the model patterns in language.</p>}
            {archStep === 2 && <p className="text-gray-300 text-lg"><strong>Step 2 · Encoder:</strong> The encoder takes input token sequences and uses the <strong>self-attention mechanism</strong> to determine relationships between tokens — which words influence which other words in the same sequence.</p>}
            {archStep === 3 && <p className="text-gray-300 text-lg"><strong>Step 3 · Embeddings:</strong> The encoder's output is a collection of <strong>vectors</strong> (multi-valued numeric arrays) where each element represents a semantic attribute of a token. Related words cluster near each other in this high-dimensional space.</p>}
            {archStep === 4 && <p className="text-gray-300 text-lg"><strong>Step 4 · Decoder:</strong> The decoder works on a new sequence of tokens and uses the embeddings generated by the encoder to produce an appropriate natural language output. It uses <strong>cross-attention</strong> to reference the encoder's context.</p>}
            {archStep === 5 && <p className="text-gray-300 text-lg"><strong>Step 5 · Generation:</strong> Given "When my dog was", the model uses attention over the input tokens and the encoder embeddings to predict the most probable next token — and continues until it generates a complete sequence like "a puppy".</p>}
          </div>
        </div>
      </motion.section>

      {/* SECTION 5 · TOKENIZATION */}
      <motion.section id="tokenization" className="guide-section mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="mb-8">
          <span className="inline-block px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs font-bold mb-2">05</span>
          <h2 className="text-3xl font-bold text-gray-100 mb-4">Tokenization</h2>
          <p className="text-gray-400 text-lg">Tokenization is the process of breaking text into smaller units called <strong>tokens</strong> — the atomic units a language model processes.</p>
        </div>
        
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 bg-[#111] border border-gray-800 p-8 rounded-xl mb-8">
          <div>
            <label className="block text-gray-400 font-bold mb-3">Enter text to tokenize:</label>
            <textarea 
              value={tokText}
              onChange={(e) => setTokText(e.target.value)}
              className="w-full h-32 bg-black border border-gray-700 rounded-lg p-4 text-gray-300 focus:outline-none focus:border-indigo-500 mb-4 resize-none font-mono text-sm shadow-inner"
              placeholder="Type something…"
            />
            <button onClick={handleTokenize} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-500 text-white rounded-lg transition-colors font-bold w-full md:w-auto shadow-lg shadow-indigo-500/20">Tokenize ✂️</button>
          </div>
          <div className="bg-black/50 border border-gray-800 rounded-lg p-5">
            <div className="flex justify-between items-center mb-4">
              <div className="text-gray-400 font-bold text-sm">Output Tokens</div>
              {tokens.length > 0 && <div className="text-xs text-indigo-400 bg-indigo-900/30 px-2 py-1 rounded">{tokens.length} tokens</div>}
            </div>
            
            <div className="flex flex-wrap gap-2 content-start min-h-[100px]">
              {tokens.length === 0 ? (
                <div className="text-gray-600 italic text-sm w-full text-center mt-8">Click Tokenize to see output</div>
              ) : (
                tokens.map((t, i) => (
                  <motion.div 
                    key={i}
                    initial={{ opacity: 0, scale: 0.8 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{ delay: i * 0.05 }}
                    className="flex flex-col items-center group"
                  >
                    <span className="px-2 py-1 bg-[#222] group-hover:bg-indigo-900/60 text-gray-200 border border-gray-700 group-hover:border-indigo-500/50 rounded font-mono text-sm transition-colors">
                      {t}
                    </span>
                    <span className="text-[0.625rem] text-gray-500 mt-1 font-mono">{Math.floor(Math.random() * 90000) + 10000}</span>
                  </motion.div>
                ))
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
            <div className="text-3xl mb-4">📝</div>
            <h4 className="text-lg font-bold text-gray-200 mb-2">Word Tokenization</h4>
            <p className="text-gray-400 text-sm mb-4">Splits on whitespace. Simple but fails on punctuation and new words.</p>
            <div className="flex gap-1 flex-wrap">
              <span className="px-2 py-1 bg-blue-900/30 text-blue-300 border border-blue-500/30 rounded text-xs font-mono">Hello</span>
              <span className="px-2 py-1 bg-blue-900/30 text-blue-300 border border-blue-500/30 rounded text-xs font-mono">world</span>
              <span className="px-2 py-1 bg-blue-900/30 text-blue-300 border border-blue-500/30 rounded text-xs font-mono">!</span>
            </div>
          </div>
          <div className="bg-[#111] p-6 rounded-xl border border-gray-800 border-t-4 border-t-purple-500">
            <div className="text-3xl mb-4">🔠</div>
            <h4 className="text-lg font-bold text-gray-200 mb-2">Subword Tokenization (BPE)</h4>
            <p className="text-gray-400 text-sm mb-4">Splits rare words into known subword pieces. Used by GPT and most modern LLMs.</p>
            <div className="flex gap-1 flex-wrap">
              <span className="px-2 py-1 bg-purple-900/30 text-purple-300 border border-purple-500/30 rounded text-xs font-mono">Trans</span>
              <span className="px-2 py-1 bg-purple-900/30 text-purple-300 border border-purple-500/30 rounded text-xs font-mono">form</span>
              <span className="px-2 py-1 bg-purple-900/30 text-purple-300 border border-purple-500/30 rounded text-xs font-mono">er</span>
            </div>
          </div>
          <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
            <div className="text-3xl mb-4">🔤</div>
            <h4 className="text-lg font-bold text-gray-200 mb-2">Character Tokenization</h4>
            <p className="text-gray-400 text-sm mb-4">Treats each character as a token. Very granular, very long sequences.</p>
            <div className="flex gap-1 flex-wrap">
              <span className="px-2 py-1 bg-emerald-900/30 text-emerald-300 border border-emerald-500/30 rounded text-xs font-mono">A</span>
              <span className="px-2 py-1 bg-emerald-900/30 text-emerald-300 border border-emerald-500/30 rounded text-xs font-mono">I</span>
              <span className="px-2 py-1 bg-emerald-900/30 text-emerald-300 border border-emerald-500/30 rounded text-xs font-mono opacity-50 block w-4 h-6"></span>
              <span className="px-2 py-1 bg-emerald-900/30 text-emerald-300 border border-emerald-500/30 rounded text-xs font-mono">i</span>
              <span className="px-2 py-1 bg-emerald-900/30 text-emerald-300 border border-emerald-500/30 rounded text-xs font-mono">s</span>
            </div>
          </div>
        </div>
      </motion.section>

      {/* SECTION 6 · EMBEDDINGS */}
      <motion.section id="embeddings" className="guide-section mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="mb-8">
          <span className="inline-block px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs font-bold mb-2">06</span>
          <h2 className="text-3xl font-bold text-gray-100 mb-4">Embeddings</h2>
          <p className="text-gray-400 text-lg">Embeddings represent complex data as numerical vectors — capturing meaning so machines can process it mathematically.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
          <div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              An <strong>embedding</strong> is a dense vector of floating-point numbers. The key property is that <em>semantically similar items produce similar vectors</em>.
            </p>
            <p className="text-gray-300 mb-4 leading-relaxed">Word2Vec famously discovered that:</p>
            
            <div className="bg-black/50 border border-gray-800 rounded-lg p-5 mb-6 text-center text-xl font-mono text-gray-200">
              king − man + woman ≈ queen
            </div>
            
            <p className="text-gray-300 mb-8 leading-relaxed">
              This arithmetic works because the embedding space encodes meaning — not just individual words, but the relationships between them.
            </p>

            <div className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-gray-700 shadow-xl">
              <div className="bg-[#2d2d2d] px-4 py-2 flex items-center gap-2 border-b border-gray-700">
                <div className="flex gap-1.5">
                  <div className="w-3 h-3 rounded-full bg-red-500"></div>
                  <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                  <div className="w-3 h-3 rounded-full bg-green-500"></div>
                </div>
                <div className="text-xs font-mono text-gray-400 ml-2">Word Embedding with Word2Vec</div>
              </div>
              <div className="p-4 overflow-x-auto">
                <pre className="text-sm font-mono leading-relaxed"><code className="text-gray-300"><span className="text-pink-400">from</span> gensim.models <span className="text-pink-400">import</span> Word2Vec{`

`}<span className="text-gray-500 italic"># Sample sentences</span>{`
`}sentences = [[<span className="text-green-400">"I"</span>, <span className="text-green-400">"love"</span>, <span className="text-green-400">"NLP"</span>],{`
`}             [<span className="text-green-400">"Transformers"</span>, <span className="text-green-400">"are"</span>, <span className="text-green-400">"amazing"</span>]]{`

`}<span className="text-gray-500 italic"># Train Word2Vec model</span>{`
`}model = Word2Vec(sentences, vector_size=<span className="text-orange-400">50</span>,{`
`}                 window=<span className="text-orange-400">5</span>, min_count=<span className="text-orange-400">1</span>){`

`}<span className="text-gray-500 italic"># Get the embedding for a word</span>{`
`}embedding = model.wv[<span className="text-green-400">"NLP"</span>]{`
`}<span className="text-blue-400">print</span>(embedding)  <span className="text-gray-500 italic"># [0.23, -0.11, ...]</span></code></pre>
              </div>
            </div>
          </div>

          <div className="bg-[#111] p-8 rounded-xl border border-gray-800 text-center flex flex-col items-center">
            <h4 className="text-lg font-bold text-gray-200 mb-6">2D Embedding Space Visualization</h4>
            
            <div className="w-full max-w-[400px] aspect-square bg-[#0a0a0a] border border-gray-800 rounded-lg relative mb-4">
              {/* Fake scatter plot */}
              <div className="absolute inset-0 grid grid-cols-4 grid-rows-4 opacity-10 pointer-events-none">
                {Array(16).fill(0).map((_,i) => <div key={i} className="border border-gray-500"></div>)}
              </div>
              
              <div className="absolute top-[20%] left-[20%] w-3 h-3 bg-indigo-500 rounded-full shadow-[0_0_10px_#6366f1] group cursor-pointer">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">King</div>
              </div>
              <div className="absolute top-[30%] left-[30%] w-3 h-3 bg-indigo-400 rounded-full shadow-[0_0_10px_#818cf8] group cursor-pointer">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Man</div>
              </div>
              
              <div className="absolute top-[20%] right-[30%] w-3 h-3 bg-pink-500 rounded-full shadow-[0_0_10px_#ec4899] group cursor-pointer">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Queen</div>
              </div>
              <div className="absolute top-[30%] right-[20%] w-3 h-3 bg-pink-400 rounded-full shadow-[0_0_10px_#f472b6] group cursor-pointer">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Woman</div>
              </div>

              <div className="absolute bottom-[25%] left-[45%] w-3 h-3 bg-emerald-500 rounded-full shadow-[0_0_10px_#10b981] group cursor-pointer">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Dog</div>
              </div>
              <div className="absolute bottom-[20%] left-[55%] w-3 h-3 bg-emerald-400 rounded-full shadow-[0_0_10px_#34d399] group cursor-pointer">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Puppy</div>
              </div>
              <div className="absolute bottom-[35%] left-[50%] w-3 h-3 bg-emerald-600 rounded-full shadow-[0_0_10px_#059669] group cursor-pointer">
                <div className="absolute top-4 left-1/2 -translate-x-1/2 bg-gray-800 text-xs px-2 py-1 rounded opacity-0 group-hover:opacity-100 whitespace-nowrap pointer-events-none transition-opacity">Cat</div>
              </div>

              <svg className="absolute inset-0 w-full h-full pointer-events-none opacity-30" style={{ zIndex: 0 }}>
                <path d="M 80 80 L 120 120" stroke="white" strokeWidth="1" strokeDasharray="4" />
                <path d="M 280 80 L 320 120" stroke="white" strokeWidth="1" strokeDasharray="4" />
                <path d="M 80 80 L 280 80" stroke="#ec4899" strokeWidth="1" strokeDasharray="2" />
                <path d="M 120 120 L 320 120" stroke="#ec4899" strokeWidth="1" strokeDasharray="2" />
              </svg>
            </div>
            
            <p className="text-gray-500 text-sm italic">Hover over dots to see words. Similar meanings cluster together.</p>
          </div>
        </div>
      </motion.section>

      {/* SECTION 6.5 · POSITIONAL ENCODING */}
      <motion.section id="positional-encoding" className="guide-section mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="mb-8">
          <span className="inline-block px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs font-bold mb-2">06.5</span>
          <h2 className="text-3xl font-bold text-gray-100 mb-4">Positional Encoding</h2>
          <p className="text-gray-400 text-lg">Self-attention compares every token to every other token <em>at the same time</em> — it has no built-in sense of order. Positional encoding is how the model learns "this word comes first, that one comes third."</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 items-center">
          <div>
            <p className="text-gray-300 mb-4 leading-relaxed">
              Shuffle the words in a sentence and pure attention would compute the exact same output — it treats the input as a <em>set</em>, not a <em>sequence</em>. But "dog bites man" and "man bites dog" mean very different things.
            </p>
            <p className="text-gray-300 mb-4 leading-relaxed">
              The fix: for every position in the sequence, generate a fixed pattern of sine and cosine waves at different frequencies, and <strong>add it directly to the token embedding</strong>. Each position ends up with a unique "fingerprint" the model can learn to recognize.
            </p>
            <div className="bg-black/50 border border-gray-800 rounded-lg p-5 mb-4 text-center font-mono text-gray-200 text-sm space-y-1">
              <div>PE(pos, 2i) &nbsp;=&nbsp; sin( pos / 10000<sup>2i/d</sup> )</div>
              <div>PE(pos, 2i+1) =&nbsp; cos( pos / 10000<sup>2i/d</sup> )</div>
            </div>
            <p className="text-gray-400 text-sm leading-relaxed">
              Low dimensions oscillate fast (fine-grained position), high dimensions oscillate slowly (coarse position) — together they let the model infer both exact position and relative distance between tokens.
            </p>
          </div>

          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">Positional Encoding Waves (per embedding dimension)</h4>
            <svg viewBox="0 0 400 220" className="w-full h-auto">
              <line x1="0" y1="110" x2="400" y2="110" stroke="#374151" strokeWidth="1" />
              {[
                { freq: 0.15, amp: 40, color: "#818cf8", label: "dim 0" },
                { freq: 0.06, amp: 40, color: "#f472b6", label: "dim 8" },
                { freq: 0.02, amp: 40, color: "#34d399", label: "dim 24" },
              ].map((wave, wi) => {
                const points = Array.from({ length: 81 }, (_, i) => {
                  const x = i * 5;
                  const y = 110 - Math.sin(i * wave.freq) * wave.amp;
                  return `${x},${y}`;
                }).join(" ");
                return (
                  <motion.polyline
                    key={wi}
                    points={points}
                    fill="none"
                    stroke={wave.color}
                    strokeWidth="2.5"
                    initial={{ pathLength: 0, opacity: 0 }}
                    whileInView={{ pathLength: 1, opacity: 1 }}
                    viewport={{ once: true }}
                    transition={{ duration: 1.5, delay: wi * 0.3, ease: "easeInOut" }}
                  />
                );
              })}
              {[0, 8, 24].map((pos, i) => (
                <motion.circle
                  key={pos}
                  cx={pos * 5 % 400}
                  cy={110}
                  r="4"
                  fill="#fbbf24"
                  initial={{ scale: 0 }}
                  whileInView={{ scale: 1 }}
                  viewport={{ once: true }}
                  transition={{ delay: 1.2 + i * 0.15 }}
                />
              ))}
            </svg>
            <div className="flex justify-center gap-4 mt-3 text-xs">
              <span className="flex items-center gap-1.5 text-indigo-300"><span className="w-3 h-0.5 bg-indigo-400 inline-block"></span> dim 0 (fast)</span>
              <span className="flex items-center gap-1.5 text-pink-300"><span className="w-3 h-0.5 bg-pink-400 inline-block"></span> dim 8 (medium)</span>
              <span className="flex items-center gap-1.5 text-emerald-300"><span className="w-3 h-0.5 bg-emerald-400 inline-block"></span> dim 24 (slow)</span>
            </div>
            <p className="text-gray-500 text-xs text-center mt-4 italic">Each token position reads a different point along every wave — together those readings form its unique positional fingerprint.</p>
          </div>
        </div>
      </motion.section>

      {/* SECTION 7 · ATTENTION */}
      <motion.section id="attention" className="guide-section mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="mb-8">
          <span className="inline-block px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs font-bold mb-2">07</span>
          <h2 className="text-3xl font-bold text-gray-100 mb-4">The Attention Mechanism</h2>
          <p className="text-gray-400 text-lg">Attention allows the model to focus on the most relevant parts of the input when predicting each token. Click on a word to see which tokens it attends to.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-5 gap-8 mb-12">
          <div className="lg:col-span-3 bg-[#111] border border-gray-800 p-8 rounded-xl flex flex-col items-center">
            <h4 className="text-xl font-bold text-gray-200 mb-2">Attention Heatmap</h4>
            <p className="text-gray-400 text-sm mb-6">Click a word in the sentence to see where it pays attention.</p>
            
            <div className="flex gap-2 mb-8 bg-black/40 p-4 rounded-lg border border-gray-800 w-full justify-center flex-wrap">
              {ATTENTION_WORDS.map((w, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedWord(i)}
                  className={`px-4 py-2 rounded font-mono transition-colors border ${
                    selectedWord === i
                      ? 'bg-indigo-600 border-indigo-500 text-white shadow-[0_0_12px_rgba(99,102,241,0.5)]'
                      : 'bg-[#222] hover:bg-indigo-900/50 text-gray-300 border-gray-700 hover:border-indigo-500'
                  }`}
                >
                  {w}
                </button>
              ))}
            </div>

            <div className="w-full max-w-[420px] bg-gradient-to-br from-indigo-900/10 to-pink-900/10 border border-gray-800 rounded-lg p-6">
              <p className="text-sm text-gray-400 mb-4 text-center">
                Attention from "<span className="text-indigo-300 font-bold">{ATTENTION_WORDS[selectedWord]}</span>" to every other token:
              </p>
              <div className="space-y-2.5">
                {ATTENTION_WORDS.map((w, i) => (
                  <div key={`${selectedWord}-${i}`} className="flex items-center gap-3">
                    <span className="w-10 text-xs font-mono text-gray-400 shrink-0">{w}</span>
                    <div className="flex-1 h-5 bg-gray-800 rounded overflow-hidden">
                      <motion.div
                        className={`h-full ${BAR_COLORS[i]} rounded flex items-center justify-end pr-1.5`}
                        initial={{ width: 0 }}
                        animate={{ width: `${ATTENTION_WEIGHTS[selectedWord][i] * 100}%` }}
                        transition={{ duration: 0.5, ease: "easeOut" }}
                      >
                        <span className="text-[0.625rem] font-bold text-white/90">{Math.round(ATTENTION_WEIGHTS[selectedWord][i] * 100)}%</span>
                      </motion.div>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-gray-500 text-xs text-center mt-4 italic">Weights always sum to 100% — this is what softmax(QKᵀ/√d) actually produces per token.</p>
            </div>
          </div>

          <div className="lg:col-span-2 space-y-6">
            <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
              <h4 className="text-lg font-bold text-gray-200 mb-4">How Attention Works</h4>
              <ol className="space-y-4">
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded bg-blue-900/50 text-blue-400 flex items-center justify-center font-bold border border-blue-500/30 shrink-0">Q</div>
                  <div><strong>Query</strong> — the current token asking "who should I pay attention to?"</div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded bg-emerald-900/50 text-emerald-400 flex items-center justify-center font-bold border border-emerald-500/30 shrink-0">K</div>
                  <div><strong>Key</strong> — each token broadcasts what kind of information it holds.</div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded bg-purple-900/50 text-purple-400 flex items-center justify-center font-bold border border-purple-500/30 shrink-0">V</div>
                  <div><strong>Value</strong> — the actual information to retrieve if attention is high.</div>
                </li>
                <li className="flex gap-4">
                  <div className="w-8 h-8 rounded bg-pink-900/50 text-pink-400 flex items-center justify-center font-bold border border-pink-500/30 shrink-0">⊗</div>
                  <div><strong>Score</strong> — Q·K<sup>T</sup> / √d gives us how much each token should contribute.</div>
                </li>
              </ol>
            </div>

            <div className="bg-[#111] p-6 rounded-xl border border-gray-800">
              <div className="text-gray-400 text-sm font-bold uppercase tracking-wider mb-3">Attention Formula</div>
              <div className="font-mono text-gray-300 text-center bg-black/50 p-4 rounded-lg border border-gray-700 overflow-x-auto whitespace-nowrap">
                {`Attention(Q,K,V) = softmax( QK`}<sup className="text-xs">T</sup>{` / √d`}<sub className="text-xs">k</sub>{` ) · V`}
              </div>
            </div>
          </div>
        </div>

        {/* Multi-head attention */}
        <div className="bg-gradient-to-br from-[#111] to-[#1a1a2e] border border-indigo-900/50 p-8 rounded-xl relative overflow-hidden">
          <div className="relative z-10">
            <h3 className="text-2xl font-bold text-gray-100 mb-4">Multi-Head Attention</h3>
            <p className="text-gray-300 mb-8 max-w-3xl leading-relaxed">
              Instead of running attention once, the Transformer runs it <strong>multiple times in parallel</strong>, each with different learned weight matrices. This lets the model attend to different types of relationships simultaneously.
            </p>
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <div className="font-bold text-gray-200">Head 1</div>
                    <div className="text-sm text-indigo-400">Syntactic roles</div>
                  </div>
                  <div className="text-xs font-mono text-gray-500">90%</div>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-indigo-500 w-[90%]"></div>
                </div>
              </div>
              
              <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <div className="font-bold text-gray-200">Head 2</div>
                    <div className="text-sm text-pink-400">Coreference</div>
                  </div>
                  <div className="text-xs font-mono text-gray-500">75%</div>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-pink-500 w-[75%]"></div>
                </div>
              </div>
              
              <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <div className="font-bold text-gray-200">Head 3</div>
                    <div className="text-sm text-emerald-400">Positional proximity</div>
                  </div>
                  <div className="text-xs font-mono text-gray-500">60%</div>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-[60%]"></div>
                </div>
              </div>
              
              <div className="bg-black/40 p-4 rounded-lg border border-gray-800">
                <div className="flex justify-between items-end mb-2">
                  <div>
                    <div className="font-bold text-gray-200">Head 4</div>
                    <div className="text-sm text-amber-400">Semantic similarity</div>
                  </div>
                  <div className="text-xs font-mono text-gray-500">85%</div>
                </div>
                <div className="w-full h-2 bg-gray-800 rounded-full overflow-hidden">
                  <div className="h-full bg-amber-500 w-[85%]"></div>
                </div>
              </div>
            </div>
          </div>
          
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/10 rounded-full blur-3xl pointer-events-none -translate-y-1/2 translate-x-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-pink-500/10 rounded-full blur-3xl pointer-events-none translate-y-1/2 -translate-x-1/2"></div>
        </div>
      </motion.section>

      {/* SECTION 8 · FULL PIPELINE WALKTHROUGH */}
      <motion.section id="pipeline-walkthrough" className="guide-section mb-16" initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }}>
        <div className="mb-8">
          <span className="inline-block px-2 py-1 bg-gray-800 text-gray-300 rounded text-xs font-bold mb-2">08</span>
          <h2 className="text-3xl font-bold text-gray-100 mb-4">The Full Pipeline, Step by Step</h2>
          <p className="text-gray-400 text-lg">Every piece above — tokens, embeddings, positional encoding, attention — combines into one repeating block. Walk through it with a real toy sentence: <span className="text-white font-mono">"I love AI"</span>.</p>
        </div>

        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 md:p-8">
          {/* Progress rail */}
          <div className="flex items-center justify-between mb-8 overflow-x-auto pb-2 gap-1">
            {PIPELINE_STEPS.map((s, i) => (
              <React.Fragment key={i}>
                <button
                  onClick={() => setPipelineStep(i + 1)}
                  className="flex flex-col items-center gap-2 shrink-0"
                >
                  <motion.div
                    animate={{
                      scale: pipelineStep === i + 1 ? 1.15 : 1,
                      opacity: pipelineStep >= i + 1 ? 1 : 0.35,
                    }}
                    className={`w-11 h-11 rounded-full flex items-center justify-center text-lg border-2 transition-colors ${
                      pipelineStep === i + 1
                        ? 'border-indigo-400 bg-indigo-500/20 shadow-[0_0_14px_rgba(99,102,241,0.5)]'
                        : pipelineStep > i + 1
                        ? 'border-emerald-500/60 bg-emerald-900/20'
                        : 'border-gray-700 bg-gray-900'
                    }`}
                  >
                    {pipelineStep > i + 1 ? '✓' : s.icon}
                  </motion.div>
                  <span className="text-[0.625rem] text-gray-500 font-mono hidden md:block">{i + 1}</span>
                </button>
                {i < PIPELINE_STEPS.length - 1 && (
                  <div className="flex-1 h-0.5 bg-gray-800 min-w-[12px] relative overflow-hidden">
                    <motion.div
                      className="absolute inset-0 bg-indigo-500"
                      initial={{ width: '0%' }}
                      animate={{ width: pipelineStep > i + 1 ? '100%' : '0%' }}
                      transition={{ duration: 0.4 }}
                    />
                  </div>
                )}
              </React.Fragment>
            ))}
          </div>

          <div className="flex items-center gap-4 mb-6 justify-center">
            <button
              onClick={() => setPipelineStep((s) => Math.max(1, s - 1))}
              disabled={pipelineStep === 1}
              className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm"
            >
              ← Previous
            </button>
            <span className="text-sm text-gray-400 font-mono">Step {pipelineStep} / {PIPELINE_STEPS.length}</span>
            <button
              onClick={() => setPipelineStep((s) => Math.min(PIPELINE_STEPS.length, s + 1))}
              disabled={pipelineStep === PIPELINE_STEPS.length}
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm"
            >
              Next →
            </button>
          </div>

          {/* Detail panel */}
          <motion.div
            key={pipelineStep}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8"
          >
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{PIPELINE_STEPS[pipelineStep - 1].icon}</span>
              <h3 className="text-xl font-bold text-gray-100">{PIPELINE_STEPS[pipelineStep - 1].title}</h3>
            </div>
            <p className="text-gray-300 leading-relaxed mb-6">{PIPELINE_STEPS[pipelineStep - 1].detail}</p>

            {/* Per-step mini visual */}
            {pipelineStep === 1 && (
              <div className="flex justify-center gap-3">
                {["I", "love", "AI"].map((w) => (
                  <span key={w} className="px-4 py-2 bg-black/40 border border-gray-700 rounded-lg font-mono text-gray-200">{w}</span>
                ))}
              </div>
            )}
            {pipelineStep === 2 && (
              <div className="flex justify-center gap-6 flex-wrap">
                {[["I", 40], ["love", 3021], ["AI", 15680]].map(([w, id]) => (
                  <div key={w} className="flex flex-col items-center gap-1">
                    <span className="px-3 py-1.5 bg-indigo-900/30 border border-indigo-500/40 rounded font-mono text-indigo-200 text-sm">{w}</span>
                    <span className="text-gray-500 text-xs">↓</span>
                    <span className="px-3 py-1.5 bg-black/50 border border-gray-700 rounded font-mono text-emerald-400 text-sm">{id}</span>
                  </div>
                ))}
              </div>
            )}
            {pipelineStep === 3 && (
              <div className="flex justify-center gap-4 flex-wrap font-mono text-xs">
                {[["I", "0.12, -0.08, 0.55, 0.03"], ["love", "0.71, 0.44, -0.02, 0.19"], ["AI", "-0.30, 0.61, 0.28, -0.15"]].map(([w, v]) => (
                  <div key={w} className="bg-black/50 border border-gray-700 rounded-lg p-3 text-center">
                    <div className="text-gray-200 font-bold mb-1">{w}</div>
                    <div className="text-emerald-400">[{v}]</div>
                  </div>
                ))}
              </div>
            )}
            {pipelineStep === 4 && (
              <div className="flex justify-center gap-4 flex-wrap font-mono text-xs items-center">
                {[["I", "0.12, -0.08, 0.55, 0.03"], ["love", "0.71, 0.44, -0.02, 0.19"], ["AI", "-0.30, 0.61, 0.28, -0.15"]].map(([w, v], i) => (
                  <React.Fragment key={w}>
                    <div className="bg-black/50 border border-gray-700 rounded-lg p-3 text-center">
                      <div className="text-gray-200 font-bold mb-1">{w}</div>
                      <div className="text-emerald-400">[{v}]</div>
                      <div className="text-amber-400 text-[0.625rem] mt-1">+ pos({i})</div>
                    </div>
                    {i < 2 && <span className="text-gray-600">→</span>}
                  </React.Fragment>
                ))}
              </div>
            )}
            {pipelineStep === 5 && (
              <div className="flex justify-center gap-3 flex-wrap">
                {["Q", "K", "V"].map((label, i) => (
                  <div key={label} className={`px-5 py-4 rounded-lg border text-center ${['border-blue-500/40 bg-blue-900/20', 'border-emerald-500/40 bg-emerald-900/20', 'border-purple-500/40 bg-purple-900/20'][i]}`}>
                    <div className={`font-bold text-lg ${['text-blue-400', 'text-emerald-400', 'text-purple-400'][i]}`}>{label}</div>
                    <div className="text-[0.625rem] text-gray-400 mt-1">{['queries', 'keys', 'values'][i]}</div>
                  </div>
                ))}
                <div className="flex items-center px-2 text-gray-500">→ softmax(QKᵀ/√d)·V →</div>
                <div className="px-5 py-4 rounded-lg border border-indigo-500/40 bg-indigo-900/20 text-center">
                  <div className="font-bold text-lg text-indigo-300">Context</div>
                  <div className="text-[0.625rem] text-gray-400 mt-1">blended vector</div>
                </div>
              </div>
            )}
            {pipelineStep === 6 && (
              <div className="flex justify-center items-center gap-3 font-mono text-sm">
                <span className="px-3 py-2 bg-black/50 border border-gray-700 rounded text-gray-300">original embedding</span>
                <span className="text-gray-500">+</span>
                <span className="px-3 py-2 bg-indigo-900/30 border border-indigo-500/40 rounded text-indigo-300">attention output</span>
                <span className="text-gray-500">→ normalize →</span>
                <span className="px-3 py-2 bg-emerald-900/30 border border-emerald-500/40 rounded text-emerald-300">stable vector</span>
              </div>
            )}
            {pipelineStep === 7 && (
              <div className="flex justify-center items-center gap-3 font-mono text-sm flex-wrap">
                <span className="px-3 py-2 bg-black/50 border border-gray-700 rounded text-gray-300">vector</span>
                <span className="text-gray-500">→</span>
                <span className="px-3 py-2 bg-rose-900/30 border border-rose-500/40 rounded text-rose-300">Linear (expand 4×)</span>
                <span className="text-gray-500">→</span>
                <span className="px-3 py-2 bg-amber-900/30 border border-amber-500/40 rounded text-amber-300">GELU</span>
                <span className="text-gray-500">→</span>
                <span className="px-3 py-2 bg-rose-900/30 border border-rose-500/40 rounded text-rose-300">Linear (compress)</span>
                <span className="text-gray-500">→ Add & Norm →</span>
                <span className="px-3 py-2 bg-emerald-900/30 border border-emerald-500/40 rounded text-emerald-300">next layer</span>
              </div>
            )}
            {pipelineStep === 8 && (
              <div className="flex flex-col items-center gap-3">
                <div className="flex gap-2 items-center font-mono text-xs">
                  <span className="px-3 py-2 bg-black/50 border border-gray-700 rounded text-gray-300">final vector</span>
                  <span className="text-gray-500">→ Linear → Softmax →</span>
                </div>
                <div className="w-full max-w-sm space-y-1.5">
                  {[["is", 62], ["helps", 18], ["learns", 12], ["rocks", 8]].map(([w, p]) => (
                    <div key={w} className="flex items-center gap-2">
                      <span className="w-14 text-xs font-mono text-gray-400">{w}</span>
                      <div className="flex-1 h-4 bg-gray-800 rounded overflow-hidden">
                        <motion.div initial={{ width: 0 }} animate={{ width: `${p}%` }} transition={{ duration: 0.5 }} className="h-full bg-green-500" />
                      </div>
                      <span className="text-xs font-mono text-gray-500 w-8">{p}%</span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </motion.div>
        </div>
      </motion.section>

      <KnowledgeCheck questions={questionsFor("transformers")} />
    </GuideLayout>
  );
}

import React, { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';

/* Interactive Sliding Window animation */
function SlidingWindowDemo() {
  const words = ["RAG", "holds", "search", "and", "model", "answers", "query", "with", "context"];
  const [activeChunk, setActiveChunk] = useState(0);
  
  // 3 chunks with overlap: [0-3], [2-5], [4-7]
  const chunks = [
    { start: 0, end: 3, label: "Chunk 1" },
    { start: 2, end: 5, label: "Chunk 2" },
    { start: 4, end: 7, label: "Chunk 3" },
  ];

  useEffect(() => {
    const interval = setInterval(() => {
      setActiveChunk(prev => (prev + 1) % 3);
    }, 2500);
    return () => clearInterval(interval);
  }, []);

  const current = chunks[activeChunk];
  const prev = activeChunk > 0 ? chunks[activeChunk - 1] : null;

  return (
    <div className="bg-[#111] border border-gray-800 rounded-xl p-5 mb-6">
      <div className="flex items-center justify-between mb-4">
        <span className="text-sm font-semibold text-indigo-400">{current.label}</span>
        <div className="flex gap-1.5">
          {chunks.map((_, i) => (
            <button 
              key={i} 
              onClick={() => setActiveChunk(i)}
              className={`w-2.5 h-2.5 rounded-full transition-colors ${i === activeChunk ? 'bg-indigo-500' : 'bg-gray-700'}`}
            />
          ))}
        </div>
      </div>
      <div className="flex flex-wrap gap-1.5">
        {words.map((word, i) => {
          const inCurrent = i >= current.start && i <= current.end;
          const isOverlap = prev && i >= current.start && i <= prev.end;
          
          let bg = 'bg-gray-800/50 text-gray-600';
          if (isOverlap) bg = 'bg-purple-600/40 border-purple-500/60 text-purple-300';
          else if (inCurrent) bg = 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300';

          return (
            <motion.span
              key={`${i}-${activeChunk}`}
              className={`px-3 py-2 rounded-lg text-sm font-mono border border-transparent transition-all duration-300 ${bg}`}
              animate={{ scale: inCurrent ? 1 : 0.9, opacity: inCurrent ? 1 : 0.4 }}
              transition={{ duration: 0.3 }}
            >
              {word}
            </motion.span>
          );
        })}
      </div>
      <div className="flex gap-4 mt-4 text-xs">
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-indigo-600/40 border border-indigo-500/50 inline-block"></span> Current chunk</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-purple-600/40 border border-purple-500/60 inline-block"></span> Overlap (shared context)</span>
        <span className="flex items-center gap-1.5"><span className="w-3 h-3 rounded bg-gray-800/50 inline-block"></span> Not in window</span>
      </div>
    </div>
  );
}

export default function RagChunking() {
  const [activeTab, setActiveTab] = useState(1);

  const toc = [
    { label: "What is Chunking?", hash: "what-is-chunking" },
    { label: "Basic Chunking Methods", hash: "basic-chunking" },
    { label: "Advanced Chunking Methods", hash: "advanced-chunking" },
    { label: "How Chunk Size Works", hash: "chunk-size-calc" },
    { label: "Best Practices", hash: "best-practices" }
  ];

  const tabs = [
    { id: 1, label: "📁 Fixed-Size" },
    { id: 2, label: "↔️ Sliding Window" },
    { id: 3, label: "🧠 Semantic" },
    { id: 4, label: "🌲 Hierarchical" },
    { id: 5, label: "🔁 Recursive" },
    { id: 6, label: "📄 Doc-Aware" }
  ];

  return (
    <GuideLayout
      title="Chunking Strategies"
      intro="Breaking large documents into optimal semantic pieces."
      toc={toc}
    >
      <section className="px-5">
        <h2 id="what-is-chunking" className="text-2xl font-bold mb-4 text-gray-100">What is Chunking?</h2>
        <p className="mb-6 text-gray-300">
          Embedding models have token limits (e.g. 8192 tokens). Therefore, a 100-page PDF must be split into smaller "chunks". The goal of chunking is to keep related context together without capturing irrelevant noise.
        </p>
        
        <h2 id="basic-chunking" className="text-2xl font-bold mb-4 text-gray-100">Basic Chunking Methods</h2>
        <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-2">
          <li><strong className="text-gray-100">Fixed-size:</strong> Splitting text blindly every N characters. (Fast, but breaks sentences).</li>
          <li><strong className="text-gray-100">Recursive Character:</strong> Tries to split on paragraphs, then sentences, then words, only falling back to characters if necessary. (The industry standard baseline).</li>
          <li><strong className="text-gray-100">Token Chunking:</strong> Splitting based on the exact token counts used by the LLM (using tiktoken).</li>
        </ul>

        <h2 id="advanced-chunking" className="text-2xl font-bold mb-4 text-gray-100">Advanced Chunking Methods</h2>
        <ul className="list-disc pl-6 mb-6 text-gray-300 space-y-2">
          <li><strong className="text-gray-100">Semantic Chunking:</strong> Uses embeddings during the chunking phase to group sentences that are mathematically similar, breaking the chunk when the topic shifts.</li>
          <li><strong className="text-gray-100">Markdown / Code Chunking:</strong> Uses AST parsers or regex to split code by functions/classes, or markdown by headers (H1, H2), ensuring structural integrity.</li>
          <li><strong className="text-gray-100">Hierarchical / Parent-Child:</strong> Documents are split into large Parent chunks, which are further split into small Child chunks. The small chunks are embedded for precise retrieval, but the LLM is fed the entire Parent chunk for maximum context.</li>
        </ul>

      </section>

      {/* ── How is Chunk Size Calculated & Implemented? ── */}
      <section className="px-5 mt-12">
        <h2 id="chunk-size-calc" className="text-2xl font-bold mb-4 text-gray-100">How is Chunk Size Calculated & Implemented?</h2>
        <p className="mb-6 text-gray-300">
          The most common confusion in chunking is understanding 
          <strong className="text-white"> what "chunk_size" actually measures</strong>. 
          It can refer to <em className="text-indigo-300">characters</em>, <em className="text-emerald-300">tokens</em>, or <em className="text-amber-300">words</em> — and choosing the wrong unit leads to chunks that are far too large or far too small.
        </p>

        {/* Characters vs Tokens Visual */}
        <h3 className="text-lg font-semibold mb-3 text-gray-200">Characters vs Tokens vs Words</h3>
        <div className="bg-[#111] border border-gray-800 rounded-xl p-5 mb-6">
          <p className="text-sm text-gray-400 mb-4">Consider the sentence: <code className="bg-gray-800 px-1.5 py-0.5 rounded text-pink-400">"Retrieval-Augmented Generation improves accuracy."</code></p>
          <div className="space-y-4">
            <div className="flex items-start gap-3">
              <span className="bg-indigo-600/30 border border-indigo-500/50 text-indigo-300 px-2.5 py-1 rounded text-xs font-bold whitespace-nowrap">Characters</span>
              <div>
                <p className="text-sm text-gray-300 mb-1">Count every single letter, space, and punctuation mark.</p>
                <div className="flex flex-wrap gap-0.5 font-mono text-xs">
                  {"Retrieval-Augmented Generation improves accuracy.".split('').map((c, i) => (
                    <span key={i} className={`px-1 py-0.5 rounded ${c === ' ' ? 'bg-gray-700 text-gray-500' : c === '-' || c === '.' ? 'bg-rose-900/40 text-rose-400' : 'bg-indigo-900/30 text-indigo-300'}`}>
                      {c === ' ' ? '␣' : c}
                    </span>
                  ))}
                </div>
                <p className="text-xs text-indigo-400 mt-1 font-semibold">= 49 characters</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="bg-emerald-600/30 border border-emerald-500/50 text-emerald-300 px-2.5 py-1 rounded text-xs font-bold whitespace-nowrap">Tokens</span>
              <div>
                <p className="text-sm text-gray-300 mb-1">Subword units from the LLM's tokenizer (BPE). Common words stay whole, rare words get split.</p>
                <div className="flex flex-wrap gap-1 font-mono text-xs">
                  {["Retr", "ieval", "-", "Aug", "mented", " Generation", " improves", " accuracy", "."].map((t, i) => (
                    <span key={i} className="bg-emerald-900/30 border border-emerald-500/30 text-emerald-300 px-2 py-1 rounded">{t}</span>
                  ))}
                </div>
                <p className="text-xs text-emerald-400 mt-1 font-semibold">= 9 tokens (GPT-4 / tiktoken cl100k_base)</p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <span className="bg-amber-600/30 border border-amber-500/50 text-amber-300 px-2.5 py-1 rounded text-xs font-bold whitespace-nowrap">Words</span>
              <div>
                <p className="text-sm text-gray-300 mb-1">Split on whitespace. The simplest unit but least precise for LLM limits.</p>
                <div className="flex flex-wrap gap-1 font-mono text-xs">
                  {["Retrieval-Augmented", "Generation", "improves", "accuracy."].map((w, i) => (
                    <span key={i} className="bg-amber-900/30 border border-amber-500/30 text-amber-300 px-2 py-1 rounded">{w}</span>
                  ))}
                </div>
                <p className="text-xs text-amber-400 mt-1 font-semibold">= 4 words</p>
              </div>
            </div>
          </div>
        </div>

        {/* Key Insight */}
        <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-lg p-4 mb-8">
          <p className="text-sm text-indigo-300">
            <strong className="text-indigo-200">💡 Key Insight:</strong> A <code className="bg-gray-800 px-1 rounded">chunk_size=500</code> in characters is roughly <strong>~100 tokens</strong> (very small!), while <code className="bg-gray-800 px-1 rounded">chunk_size=500</code> in tokens is roughly <strong>~2,000 characters</strong> (a full paragraph). Always check which unit your library uses!
          </p>
        </div>

        {/* The Math Behind Chunk Overlap */}
        <h3 className="text-lg font-semibold mb-3 text-gray-200">The Math Behind Chunk Overlap</h3>
        <p className="text-sm text-gray-300 mb-4">
          Overlap ensures that sentences sitting on a chunk boundary aren't lost. Here's how to calculate the number of chunks and total tokens generated:
        </p>

        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-5 mb-6">
          <div className="space-y-3 text-sm font-mono">
            <p className="text-gray-400"><span className="text-purple-400">Given:</span></p>
            <p className="text-gray-300 pl-4">Document length  = <span className="text-cyan-400">10,000</span> tokens</p>
            <p className="text-gray-300 pl-4">chunk_size       = <span className="text-emerald-400">500</span> tokens</p>
            <p className="text-gray-300 pl-4">chunk_overlap    = <span className="text-amber-400">50</span> tokens (10%)</p>
            <p className="text-gray-400 mt-4"><span className="text-purple-400">Step size (stride):</span></p>
            <p className="text-gray-300 pl-4">stride = chunk_size − overlap = <span className="text-emerald-400">500</span> − <span className="text-amber-400">50</span> = <span className="text-pink-400">450</span> tokens</p>
            <p className="text-gray-400 mt-4"><span className="text-purple-400">Number of chunks:</span></p>
            <p className="text-gray-300 pl-4">n_chunks = ⌈(doc_length − overlap) / stride⌉</p>
            <p className="text-gray-300 pl-4">n_chunks = ⌈(10,000 − 50) / 450⌉ = ⌈22.11⌉ = <span className="text-pink-400">23 chunks</span></p>
            <p className="text-gray-400 mt-4"><span className="text-purple-400">Total tokens stored:</span></p>
            <p className="text-gray-300 pl-4">total = n_chunks × chunk_size = 23 × 500 = <span className="text-pink-400">11,500 tokens</span></p>
            <p className="text-gray-300 pl-4 text-amber-400">→ 15% storage overhead from overlap</p>
          </div>
        </div>

        {/* Decision Matrix */}
        <h3 className="text-lg font-semibold mb-3 text-gray-200">Chunk Size Decision Matrix</h3>
        <p className="text-sm text-gray-300 mb-4">
          Different use cases demand different chunk sizes. Use this matrix as a starting point:
        </p>
        <div className="overflow-x-auto mb-8">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="px-4 py-3 text-left text-gray-300 border border-gray-700">Use Case</th>
                <th className="px-4 py-3 text-left text-gray-300 border border-gray-700">Chunk Size</th>
                <th className="px-4 py-3 text-left text-gray-300 border border-gray-700">Overlap</th>
                <th className="px-4 py-3 text-left text-gray-300 border border-gray-700">Unit</th>
                <th className="px-4 py-3 text-left text-gray-300 border border-gray-700">Why</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              <tr><td className="px-4 py-2 border border-gray-800">Q&A over docs</td><td className="px-4 py-2 border border-gray-800 text-emerald-400">256–512</td><td className="px-4 py-2 border border-gray-800">50</td><td className="px-4 py-2 border border-gray-800">tokens</td><td className="px-4 py-2 border border-gray-800">Precise, focused retrieval</td></tr>
              <tr className="bg-gray-900/30"><td className="px-4 py-2 border border-gray-800">Summarization</td><td className="px-4 py-2 border border-gray-800 text-emerald-400">1024–2048</td><td className="px-4 py-2 border border-gray-800">200</td><td className="px-4 py-2 border border-gray-800">tokens</td><td className="px-4 py-2 border border-gray-800">Needs broader context per chunk</td></tr>
              <tr><td className="px-4 py-2 border border-gray-800">Code analysis</td><td className="px-4 py-2 border border-gray-800 text-emerald-400">Function/Class</td><td className="px-4 py-2 border border-gray-800">0</td><td className="px-4 py-2 border border-gray-800">AST</td><td className="px-4 py-2 border border-gray-800">Structural boundaries matter most</td></tr>
              <tr className="bg-gray-900/30"><td className="px-4 py-2 border border-gray-800">Legal / contracts</td><td className="px-4 py-2 border border-gray-800 text-emerald-400">512–1024</td><td className="px-4 py-2 border border-gray-800">100</td><td className="px-4 py-2 border border-gray-800">tokens</td><td className="px-4 py-2 border border-gray-800">Clause-level precision needed</td></tr>
              <tr><td className="px-4 py-2 border border-gray-800">Chat / conversation</td><td className="px-4 py-2 border border-gray-800 text-emerald-400">128–256</td><td className="px-4 py-2 border border-gray-800">25</td><td className="px-4 py-2 border border-gray-800">tokens</td><td className="px-4 py-2 border border-gray-800">Short, snappy retrieval for speed</td></tr>
            </tbody>
          </table>
        </div>

        {/* Step-by-step Implementation */}
        <h3 className="text-lg font-semibold mb-3 text-gray-200">Step-by-Step Implementation</h3>
        <p className="text-sm text-gray-300 mb-4">
          Here is the complete workflow to go from raw text to optimally sized chunks:
        </p>
        <div className="space-y-4 mb-8">
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">1</span>
            <div>
              <p className="text-gray-200 font-semibold">Choose your unit</p>
              <p className="text-sm text-gray-400">Decide between characters, tokens, or words. For LLM pipelines, <strong className="text-gray-300">tokens are strongly recommended</strong> since they map directly to model limits.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">2</span>
            <div>
              <p className="text-gray-200 font-semibold">Pick your chunk size</p>
              <p className="text-sm text-gray-400">Start with 512 tokens. If retrieval quality is poor (answers miss context), increase to 1024. If answers contain too much irrelevant info, decrease to 256.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">3</span>
            <div>
              <p className="text-gray-200 font-semibold">Set your overlap</p>
              <p className="text-sm text-gray-400">Use 10–20% of chunk_size. For 512 tokens → overlap of 50–100 tokens. This is the "safety net" for boundary sentences.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">4</span>
            <div>
              <p className="text-gray-200 font-semibold">Choose your splitting strategy</p>
              <p className="text-sm text-gray-400">Use <code className="bg-gray-800 px-1 rounded text-pink-400">RecursiveCharacterTextSplitter</code> as the default. It tries paragraph → sentence → word → character splits in order.</p>
            </div>
          </div>
          <div className="flex gap-3">
            <span className="flex-shrink-0 w-8 h-8 rounded-full bg-indigo-600 text-white flex items-center justify-center text-sm font-bold">5</span>
            <div>
              <p className="text-gray-200 font-semibold">Measure with the right tokenizer</p>
              <p className="text-sm text-gray-400">Always count using the <strong className="text-gray-300">same tokenizer</strong> as your embedding model. Use <code className="bg-gray-800 px-1 rounded text-pink-400">tiktoken</code> for OpenAI models, or <code className="bg-gray-800 px-1 rounded text-pink-400">AutoTokenizer</code> for HuggingFace models.</p>
            </div>
          </div>
        </div>

        {/* Code Examples */}
        <h3 className="text-lg font-semibold mb-3 text-gray-200">Code: Token-Based Chunking with tiktoken</h3>
        <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-6 text-gray-300 whitespace-pre">
{`import tiktoken
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Step 1: Load the tokenizer for your embedding model
encoder = tiktoken.encoding_for_model("text-embedding-3-small")

# Step 2: Create a length function that counts TOKENS, not characters
def token_length(text):
    return len(encoder.encode(text))

# Step 3: Configure the splitter
splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,          # in characters, but measured by token_length
    chunk_overlap=50,        # 50-char overlap (~10 tokens)
    length_function=token_length,  # ← THIS IS THE KEY!
    separators=["\n\n", "\n", ". ", " ", ""]
)

# Step 4: Split your document
chunks = splitter.split_text(document_text)

# Verify: print each chunk's token count
for i, chunk in enumerate(chunks):
    print(f"Chunk {i}: {token_length(chunk)} tokens, {len(chunk)} chars")`}</div>

        <h3 className="text-lg font-semibold mb-3 text-gray-200">Code: HuggingFace Tokenizer-Based Chunking</h3>
        <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-8 text-gray-300 whitespace-pre">
{`from transformers import AutoTokenizer
from langchain_text_splitters import RecursiveCharacterTextSplitter

# Use the SAME tokenizer as your embedding model
tokenizer = AutoTokenizer.from_pretrained("BAAI/bge-small-en-v1.5")

def hf_token_length(text):
    return len(tokenizer.encode(text, add_special_tokens=False))

splitter = RecursiveCharacterTextSplitter(
    chunk_size=512,
    chunk_overlap=50,
    length_function=hf_token_length
)

chunks = splitter.split_text(document_text)`}</div>

        {/* Common Pitfalls */}
        <h3 className="text-lg font-semibold mb-3 text-gray-200">Common Pitfalls</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
          <div className="bg-rose-900/10 border border-rose-500/20 p-4 rounded-lg">
            <h4 className="text-rose-400 font-semibold mb-2 mt-0">❌ Mistake: Using default length_function</h4>
            <p className="text-sm text-gray-400">LangChain's default <code className="bg-gray-800 px-1 rounded">len()</code> counts <em>characters</em>. So <code className="bg-gray-800 px-1 rounded">chunk_size=500</code> gives you only ~100 tokens — way too small for most use cases.</p>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 p-4 rounded-lg">
            <h4 className="text-rose-400 font-semibold mb-2 mt-0">❌ Mistake: Mismatched tokenizers</h4>
            <p className="text-sm text-gray-400">If you count with GPT-4's tokenizer but embed with <code className="bg-gray-800 px-1 rounded">bge-small</code>, your "500 token" chunks may actually be 600+ tokens for the embedding model and get silently truncated.</p>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 p-4 rounded-lg">
            <h4 className="text-rose-400 font-semibold mb-2 mt-0">❌ Mistake: Zero overlap</h4>
            <p className="text-sm text-gray-400">With 0 overlap, a sentence like "The contract expires on Dec 31. Penalties apply after that." gets split across two chunks, making neither chunk independently useful.</p>
          </div>
          <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-lg">
            <h4 className="text-emerald-400 font-semibold mb-2 mt-0">✅ Best Practice: Evaluate empirically</h4>
            <p className="text-sm text-gray-400">There is no universally perfect chunk size. Run your RAG pipeline with 256, 512, and 1024 token chunks, measure retrieval precision@k, and pick the best performer for your data.</p>
          </div>
        </div>
      </section>

      <section className="px-5 mt-12">
        <h2 id="best-practices" className="text-2xl font-bold mb-4 text-gray-100">Chunk Size & Overlap Best Practices</h2>
        <p className="mb-8 text-gray-300">
          Generally, a chunk size of 512-1024 tokens is optimal. You must include a <strong className="text-gray-100">Chunk Overlap</strong> (e.g. 10-20%) to ensure concepts aren't abruptly cut in half across the boundary of two chunks.
        </p>
      </section>

      <div className="max-w-5xl mx-auto p-5">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`p-3 rounded-lg border font-semibold text-sm flex items-center justify-center transition-all ${
                activeTab === tab.id
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-[0_4px_14px_rgba(99,102,241,0.4)]'
                  : 'bg-[#111] border-gray-800 text-gray-400 hover:bg-[#222] hover:border-indigo-500 hover:text-gray-200'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        <div>
            {activeTab === 1 && (
              <motion.div
                key="tab1"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <h2 className="text-2xl font-bold mb-4 text-gray-100">1. Fixed-Size Chunking</h2>
                <p className="mb-6 text-gray-300">
                  Splits documents into equal segments of characters or tokens regardless of word limits, sentence endings, or paragraphs. Simple, fast, but highly disruptive to sentence structure.
                </p>
                
                <div className="h-64 bg-[#111] border border-gray-800 rounded-xl relative overflow-hidden mb-6 flex flex-col items-center justify-center gap-4 px-6">
                  <p className="text-xs text-gray-500 mb-2">Text split every 12 characters — breaks words mid-way</p>
                  <div className="flex flex-wrap gap-0 text-base sm:text-lg font-mono">
                    <motion.span className="bg-indigo-600/30 border border-indigo-500/50 px-2 py-1 rounded-l-md text-indigo-300" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.2 }}>Artificial I</motion.span>
                    <motion.span className="bg-emerald-600/30 border border-emerald-500/50 px-2 py-1 text-emerald-300" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.6 }}>ntelligence </motion.span>
                    <motion.span className="bg-amber-600/30 border border-amber-500/50 px-2 py-1 text-amber-300" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.0 }}>is transform</motion.span>
                    <motion.span className="bg-rose-600/30 border border-rose-500/50 px-2 py-1 text-rose-300" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.4 }}>ing our worl</motion.span>
                    <motion.span className="bg-cyan-600/30 border border-cyan-500/50 px-2 py-1 rounded-r-md text-cyan-300" initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 1.8 }}>d rapidly.</motion.span>
                  </div>
                  <div className="flex gap-2 mt-2">
                    <span className="text-[0.625rem] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">⚠️ "Artificial" split into 2 chunks</span>
                    <span className="text-[0.625rem] bg-red-500/20 text-red-400 px-2 py-0.5 rounded-full border border-red-500/30">⚠️ "world" split into 2 chunks</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-2 text-gray-200">Python Template</h3>
                <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-6 text-gray-300 whitespace-pre">
{`from langchain_text_splitters import CharacterTextSplitter

splitter = CharacterTextSplitter(
    separator="",
    chunk_size=100,
    chunk_overlap=0
)
chunks = splitter.split_text(text)`}</div>

                <h3 className="text-lg font-semibold mb-2 text-gray-200">Examples</h3>
                <p className="text-gray-300 mb-1"><strong className="text-gray-100">Input:</strong> <code className="bg-gray-800 px-1 rounded text-pink-400">"Artificial Intelligence is transforming our world rapidly."</code></p>
                <p className="text-gray-300 mb-6"><strong className="text-gray-100">Output (chunk_size=12):</strong> <code className="bg-gray-800 px-1 rounded text-pink-400">["Artificial I", "ntelligence ", "is transform", "ing our worl", "d rapidly."]</code></p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
                  <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-lg">
                    <h4 className="text-emerald-400 font-semibold mb-2 mt-0">Advantages</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                      <li>Predictable output chunk sizing.</li>
                      <li>Extremely fast to compute.</li>
                      <li>Very simple to configure and write.</li>
                    </ul>
                  </div>
                  <div className="bg-rose-900/10 border border-rose-500/20 p-4 rounded-lg">
                    <h4 className="text-rose-400 font-semibold mb-2 mt-0">Disadvantages</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                      <li>Splits words and sentences mid-word.</li>
                      <li>Severely degrades semantic meaning.</li>
                      <li>Causes information fragmentation.</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 2 && (
              <motion.div
                key="tab2"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <h2 className="text-2xl font-bold mb-4 text-gray-100">2. Sliding Window Chunking</h2>
                <p className="mb-6 text-gray-300">
                  Extends Fixed-Size chunking by adding a <strong className="text-white">Chunk Overlap</strong>. Part of the text from the end of the previous chunk is carried over to the start of the next chunk. This protects data boundaries from losing their context.
                </p>
                
                <SlidingWindowDemo />

                <h3 className="text-lg font-semibold mb-2 text-gray-200">Python Template</h3>
                <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-6 text-gray-300 whitespace-pre">
{`from langchain_text_splitters import CharacterTextSplitter

# LangChain uses separator + size + overlap
splitter = CharacterTextSplitter(
    separator=" ",
    chunk_size=100,
    chunk_overlap=20
)
chunks = splitter.split_text(text)`}</div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 mt-6">
                  <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-lg">
                    <h4 className="text-emerald-400 font-semibold mb-2 mt-0">Advantages</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                      <li>Preserves context that drops off at normal boundaries.</li>
                      <li>Configurable overlap percentage.</li>
                      <li>Very effective for sequential reading.</li>
                    </ul>
                  </div>
                  <div className="bg-rose-900/10 border border-rose-500/20 p-4 rounded-lg">
                    <h4 className="text-rose-400 font-semibold mb-2 mt-0">Disadvantages</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                      <li>Produces redundant tokens.</li>
                      <li>Higher database load.</li>
                      <li>Increases input tokens fed to the LLM.</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 3 && (
              <motion.div
                key="tab3"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                 <h2 className="text-2xl font-bold mb-4 text-gray-100">3. Semantic Chunking</h2>
                 <p className="mb-6 text-gray-300">
                  Computes vector embeddings for adjacent sentences and determines their mathematical similarity (cosine distance). If similarity between sentence A and B drops below a threshold, it marks a topic transition and cuts the chunk.
                </p>
                <div className="h-64 bg-[#0a0a0a] border border-gray-800 rounded-xl relative overflow-hidden mb-6 flex items-center justify-center">
                    <motion.div className="w-3 h-3 rounded-full bg-blue-500 absolute" style={{left: '20%', top: '30%'}} animate={{scale: [1,1.2,1]}} transition={{duration: 2, repeat: Infinity}} />
                    <motion.div className="w-3 h-3 rounded-full bg-blue-500 absolute" style={{left: '25%', top: '40%'}} animate={{scale: [1,1.2,1], delay: 0.2}} transition={{duration: 2, repeat: Infinity}} />
                    <motion.div className="w-3 h-3 rounded-full bg-blue-500 absolute" style={{left: '18%', top: '55%'}} animate={{scale: [1,1.2,1], delay: 0.4}} transition={{duration: 2, repeat: Infinity}} />
                    
                    <div className="absolute left-[45%] top-[20%] bottom-[20%] w-[2px] border-l-2 border-dashed border-red-500/50"></div>
                    
                    <motion.div className="w-3 h-3 rounded-full bg-emerald-500 absolute" style={{left: '70%', top: '40%'}} animate={{scale: [1,1.2,1]}} transition={{duration: 2, repeat: Infinity}}/>
                    <motion.div className="w-3 h-3 rounded-full bg-emerald-500 absolute" style={{left: '75%', top: '55%'}} animate={{scale: [1,1.2,1], delay: 0.2}} transition={{duration: 2, repeat: Infinity}}/>
                    <motion.div className="w-3 h-3 rounded-full bg-emerald-500 absolute" style={{left: '68%', top: '30%'}} animate={{scale: [1,1.2,1], delay: 0.4}} transition={{duration: 2, repeat: Infinity}}/>
                    <div className="absolute bottom-5 text-sm text-gray-500">Sentence embeddings clustered by topic similarity</div>
                </div>

                <h3 className="text-lg font-semibold mb-2 text-gray-200">Python Template</h3>
                <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-6 text-gray-300 whitespace-pre">
{`from langchain_experimental.text_splitter import SemanticChunker
from langchain_openai import OpenAIEmbeddings

# Splitter automatically measures distance threshold
splitter = SemanticChunker(OpenAIEmbeddings())
docs = splitter.create_documents([text])`}</div>

                <h3 className="text-lg font-semibold mb-2 text-gray-200">Examples</h3>
                <p className="text-gray-300 mb-1"><strong className="text-gray-100">Input:</strong> <code className="bg-gray-800 px-1 rounded text-pink-400">"Apples are high in fiber. Bananas offer potassium. Linear regression is an ML method."</code></p>
                <p className="text-gray-300 mb-6"><strong className="text-gray-100">Output:</strong><br />
                Chunk 1 (Nutrition): <code className="bg-gray-800 px-1 rounded text-pink-400">["Apples are high in fiber. Bananas offer potassium."]</code><br />
                Chunk 2 (Math/ML): <code className="bg-gray-800 px-1 rounded text-pink-400">["Linear regression is an ML method."]</code></p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 mt-6">
                  <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-lg">
                    <h4 className="text-emerald-400 font-semibold mb-2 mt-0">Advantages</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                      <li>Ensures all content inside a chunk is semantically unified.</li>
                      <li>Highly coherent for complex QA.</li>
                      <li>No arbitrary word slicing.</li>
                    </ul>
                  </div>
                  <div className="bg-rose-900/10 border border-rose-500/20 p-4 rounded-lg">
                    <h4 className="text-rose-400 font-semibold mb-2 mt-0">Disadvantages</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                      <li>Very slow and computationally heavy.</li>
                      <li>Requires active API calls to generate sentence vectors.</li>
                      <li>Heavily dependent on the embedding model quality.</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 4 && (
              <motion.div
                key="tab4"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <h2 className="text-2xl font-bold mb-4 text-gray-100">4. Hierarchical Chunking (Parent-Child)</h2>
                <p className="mb-6 text-gray-300">
                  Processes text into large **Parent Chunks** (for broad context) and splits them further into small **Child Chunks** (for search indexing). The child chunks are searched, but if a match is found, the larger Parent is loaded and sent to the LLM to give the generation full context.
                </p>
                
                <div className="h-64 bg-[#111] border border-gray-800 rounded-xl relative overflow-hidden mb-6 flex items-center justify-center">
                  <div className="bg-[#1a1a1a] border border-indigo-500 px-3 py-2 rounded-md text-xs font-semibold absolute left-[40%] top-[15%]">Parent Chunk (1000 Tokens)</div>
                  <div className="absolute left-[50%] top-[28%] w-[2px] h-[35px] bg-gray-700"></div>
                  
                  <div className="bg-[#1a1a1a] border border-emerald-500 px-3 py-2 rounded-md text-xs font-semibold absolute left-[15%] top-[50%]">Child A (200 T)</div>
                  <div className="bg-[#1a1a1a] border border-emerald-500 px-3 py-2 rounded-md text-xs font-semibold absolute left-[42%] top-[50%]">Child B (200 T)</div>
                  <div className="bg-[#1a1a1a] border border-emerald-500 px-3 py-2 rounded-md text-xs font-semibold absolute left-[68%] top-[50%]">Child C (200 T)</div>
                  
                  <div className="absolute left-[25%] top-[40%] w-[20%] h-[2px] bg-gray-700"></div>
                  <div className="absolute left-[55%] top-[40%] w-[20%] h-[2px] bg-gray-700"></div>
                </div>

                <h3 className="text-lg font-semibold mb-2 text-gray-200">Python Template</h3>
                <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-6 text-gray-300 whitespace-pre">
{`from langchain.retrievers import ParentDocumentRetriever
from langchain.storage import InMemoryStore
from langchain_text_splitters import RecursiveCharacterTextSplitter

parent_splitter = RecursiveCharacterTextSplitter(chunk_size=2000)
child_splitter = RecursiveCharacterTextSplitter(chunk_size=400)

# Links parent store to child vectors
retriever = ParentDocumentRetriever(
    vectorstore=vectorstore,
    docstore=InMemoryStore(),
    child_splitter=child_splitter,
    parent_splitter=parent_splitter,
)`}</div>

                <h3 className="text-lg font-semibold mb-2 text-gray-200">Examples</h3>
                <p className="text-gray-300 mb-6"><strong className="text-gray-100">System Workflow:</strong> Child chunk matching <code className="bg-gray-800 px-1 rounded text-pink-400">"financial losses in Q2"</code> retrieves. But the retriever loads the **entire Parent document** containing all 4 quarterly tables to ensure the LLM has complete context.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 mt-6">
                  <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-lg">
                    <h4 className="text-emerald-400 font-semibold mb-2 mt-0">Advantages</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                      <li>Small chunks give precise embedding lookup.</li>
                      <li>Large chunks provide the LLM with full context, avoiding hallucination.</li>
                      <li>Highly effective for reports and technical manuals.</li>
                    </ul>
                  </div>
                  <div className="bg-rose-900/10 border border-rose-500/20 p-4 rounded-lg">
                    <h4 className="text-rose-400 font-semibold mb-2 mt-0">Disadvantages</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                      <li>More complex database architecture.</li>
                      <li>Needs synchronization between Vector DB and Document DB.</li>
                      <li>Higher memory footprint.</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
            
            {activeTab === 5 && (
              <motion.div
                key="tab5"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <h2 className="text-2xl font-bold mb-4 text-gray-100">5. Recursive Chunking</h2>
                <p className="mb-6 text-gray-300">
                  Attempts to split text using a hierarchical list of separators (e.g. paragraphs <code className="bg-gray-800 px-1 rounded">\n\n</code>, then lines <code className="bg-gray-800 px-1 rounded">\n</code>, then words <code className="bg-gray-800 px-1 rounded">" "</code>, then characters <code className="bg-gray-800 px-1 rounded">""</code>). It only falls back to smaller separators if a chunk remains larger than target size.
                </p>
                
                <div className="h-64 bg-[#111] border border-gray-800 rounded-xl relative overflow-hidden mb-6 flex flex-col items-start pl-[20%] justify-center gap-3">
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <span>1. Try splitting by Paragraph (<code className="text-pink-400 bg-gray-800 px-1 rounded">\n\n</code>) ➔</span>
                    <span className="text-rose-500 font-bold">Too Big</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <span>2. Try splitting by Sentence (<code className="text-pink-400 bg-gray-800 px-1 rounded">. </code>) ➔</span>
                    <span className="text-emerald-500 font-bold">Split Success</span>
                  </div>
                  <div className="flex items-center gap-3 text-sm text-gray-300">
                    <span>3. Try splitting by Word (<code className="text-pink-400 bg-gray-800 px-1 rounded">" "</code>) ➔</span>
                    <span className="text-gray-500">Skip (Already under size)</span>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-2 text-gray-200">Python Template</h3>
                <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-6 text-gray-300 whitespace-pre">
{`from langchain_text_splitters import RecursiveCharacterTextSplitter

splitter = RecursiveCharacterTextSplitter(
    chunk_size=500,
    chunk_overlap=50,
    separators=["\\n\\n", "\\n", ". ", " ", ""]
)
chunks = splitter.split_text(text)`}</div>

                <h3 className="text-lg font-semibold mb-2 text-gray-200">Examples</h3>
                <p className="text-gray-300 mb-1"><strong className="text-gray-100">Input:</strong> A 1500-character document with 3 paragraphs of 500 characters each.</p>
                <p className="text-gray-300 mb-6"><strong className="text-gray-100">Output (chunk_size=600):</strong> Splits cleanly at the <code className="bg-gray-800 px-1 rounded text-pink-400">"\\n\\n"</code> boundaries, returning 3 perfect paragraphs as 3 chunks.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 mt-6">
                  <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-lg">
                    <h4 className="text-emerald-400 font-semibold mb-2 mt-0">Advantages</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                      <li>The industry standard baseline splitter.</li>
                      <li>Keeps paragraphs and sentences intact.</li>
                      <li>Highly adaptive and predictable performance.</li>
                    </ul>
                  </div>
                  <div className="bg-rose-900/10 border border-rose-500/20 p-4 rounded-lg">
                    <h4 className="text-rose-400 font-semibold mb-2 mt-0">Disadvantages</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                      <li>Still relies on heuristics (size/overlap margins).</li>
                      <li>Does not evaluate semantic meaning.</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}

            {activeTab === 6 && (
              <motion.div
                key="tab6"
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.3 }}
                className="w-full"
              >
                <h2 className="text-2xl font-bold mb-4 text-gray-100">6. Document-Aware Chunking</h2>
                <p className="mb-6 text-gray-300">
                  Uses structural parses (like Markdown, HTML, or PDF-layout engines) to chunk text based on logical document boundaries. It ensures that elements like **Tables**, **Lists**, and **Code Blocks** are kept whole inside a single chunk.
                </p>
                
                <div className="h-64 bg-[#111] border border-gray-800 rounded-xl relative overflow-hidden mb-6 flex items-center justify-center">
                  <div className="w-[80%] h-[80%] border-2 border-gray-700 bg-[#0a0a0a] rounded-lg p-3 flex flex-col gap-2">
                    <div className="h-[25%] bg-indigo-900/20 border border-indigo-500 rounded flex items-center justify-center text-xs font-bold text-indigo-400">H1 Header</div>
                    <div className="h-[40%] bg-emerald-900/20 border border-emerald-500 rounded flex items-center justify-center text-xs font-bold text-emerald-400">Code Block (Kept Intact)</div>
                    <div className="h-[25%] bg-amber-900/20 border border-amber-500 rounded flex items-center justify-center text-xs font-bold text-amber-400">Table (Kept Intact)</div>
                  </div>
                </div>

                <h3 className="text-lg font-semibold mb-2 text-gray-200">Python Template</h3>
                <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-6 text-gray-300 whitespace-pre">
{`from langchain_text_splitters import MarkdownHeaderTextSplitter

headers_to_split_on = [
    ("#", "Header 1"),
    ("##", "Header 2"),
]
splitter = MarkdownHeaderTextSplitter(headers_to_split_on=headers_to_split_on)
chunks = splitter.split_text(markdown_text)`}</div>

                <h3 className="text-lg font-semibold mb-2 text-gray-200">Examples</h3>
                <p className="text-gray-300 mb-6"><strong className="text-gray-100">Markdown Splitting:</strong> If the text contains <code className="bg-gray-800 px-1 rounded text-pink-400">"# Architecture\\nSome text...\\n# API Docs"</code>, the splitter slices it at <code className="bg-gray-800 px-1 rounded text-pink-400">"# API Docs"</code> and appends <code className="bg-gray-800 px-1 rounded text-pink-400">{`{"Header 1": "Architecture"}`}</code> to the first chunk's metadata.</p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5 mt-6">
                  <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-lg">
                    <h4 className="text-emerald-400 font-semibold mb-2 mt-0">Advantages</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                      <li>Protects semantic blocks (never cuts tables or code in half).</li>
                      <li>Appends layout hierarchy paths directly to metadata.</li>
                      <li>Extremely rich context matching.</li>
                    </ul>
                  </div>
                  <div className="bg-rose-900/10 border border-rose-500/20 p-4 rounded-lg">
                    <h4 className="text-rose-400 font-semibold mb-2 mt-0">Disadvantages</h4>
                    <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                      <li>Requires structural files (Markdown, HTML, XML).</li>
                      <li>Parser logic is fragile on bad/messy source files.</li>
                      <li>Computational parser overhead.</li>
                    </ul>
                  </div>
                </div>
              </motion.div>
            )}
        </div>
      </div>
    </GuideLayout>
  );
}

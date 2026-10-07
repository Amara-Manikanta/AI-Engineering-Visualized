import React, { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Link } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout';

const EDITIONS = [
  {
    id: 14,
    title: "DeepSeek-R1 & The Era of Open-Source Reasoning Models",
    date: "Oct 2026",
    category: "Frontier Models",
    categoryColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    readTime: "6 min read",
    summary: "How DeepSeek achieved GPT-4o and o1 level reasoning at 99% lower training cost using GRPO reinforcement learning without massive SFT datasets.",
    takeaways: [
      "GRPO (Group Relative Policy Optimization) eliminates the separate Critic model, saving 50%+ VRAM.",
      "Pure RL induces Chain-of-Thought reasoning, self-correction, and verification naturally.",
      "Distilled 1.5B to 70B open weights perform on par with proprietary reasoning endpoints."
    ],
    highlights: ["GRPO Algorithm", "Pure RL Training", "Distillation", "Open Weights"],
    featured: true
  },
  {
    id: 13,
    title: "Claude Code CLI & Terminal-Native Agentic Engineering",
    date: "Sep 2026",
    category: "Developer Tools",
    categoryColor: "bg-orange-500/20 text-orange-400 border-orange-500/30",
    readTime: "5 min read",
    summary: "Exploring Anthropic's terminal agent: multi-file AST context indexing, permission safety hooks, subagent spawning, and checkpoint reverts.",
    takeaways: [
      "Project memory files (CLAUDE.md) give instant zero-latency stack context.",
      "Subagent delegation divides complex refactors into concurrent sub-tasks.",
      "Automated git checkpoints ensure zero-risk undo capabilities."
    ],
    highlights: ["Claude Code", "CLI Agents", "CLAUDE.md", "Subagents"],
    featured: false
  },
  {
    id: 12,
    title: "Model Context Protocol (MCP) 1.0 Specification",
    date: "Aug 2026",
    category: "Architecture & RAG",
    categoryColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    readTime: "7 min read",
    summary: "Replacing 100+ bespoke API integrations with Anthropic's open MCP standard connecting AI hosts to databases, tools, and enterprise servers.",
    takeaways: [
      "Decouples LLM application logic from external tool implementation details.",
      "Standardizes JSON-RPC 2.0 transport over stdio and SSE (Server-Sent Events).",
      "Enables dynamic server discovery across databases, GitHub, Slack, and local OS."
    ],
    highlights: ["MCP Spec", "Tool Protocol", "JSON-RPC", "Context Sharing"],
    featured: false
  },
  {
    id: 11,
    title: "vLLM 0.7 & Chunked Prefill Acceleration for Production LLMs",
    date: "Jul 2026",
    category: "MLOps & Systems",
    categoryColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    readTime: "4 min read",
    summary: "How Chunked Prefill and PagedAttention 2.0 eliminate GPU memory fragmentation and double throughput during long-context prompt serving.",
    takeaways: [
      "Chunked prefill interleaves long prompt prefill tokens with decode tokens in single batches.",
      "FP8 and INT4 KV-cache quantization reduces memory footprint by 50%.",
      "Multi-GPU Tensor Parallelism scaling achieves 2,000+ output tokens per second."
    ],
    highlights: ["vLLM 0.7", "PagedAttention", "Chunked Prefill", "FP8 KV-Cache"],
    featured: false
  },
  {
    id: 10,
    title: "Microsoft GraphRAG: Combining Knowledge Graphs with Vector Search",
    date: "Jun 2026",
    category: "Architecture & RAG",
    categoryColor: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    readTime: "6 min read",
    summary: "Moving beyond naive vector retrieval by extracting entity-relationship graphs and community summaries for holistic document comprehension.",
    takeaways: [
      "LLMs extract entities, relations, and claims into a structured Graph Database.",
      "Hierarchical Community Detection groups related nodes and pre-summarizes topics.",
      "Global Search handles abstract queries like 'What are the main risks across all contracts?'"
    ],
    highlights: ["GraphRAG", "Knowledge Graphs", "Community Detection", "Global Search"],
    featured: false
  },
  {
    id: 9,
    title: "LoRA, QLoRA, and DoRA: Parameter-Efficient Fine-Tuning Demystified",
    date: "May 2026",
    category: "MLOps & Systems",
    categoryColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    readTime: "8 min read",
    summary: "A complete comparative guide to PEFT methods: how 4-bit NormalFloat (NF4) and Weight-Decomposed LoRA enable 70B fine-tuning on consumer GPUs.",
    takeaways: [
      "LoRA freezes base weights and trains small A × B low-rank adapter matrices.",
      "QLoRA quantizes frozen base weights to 4-bit NF4 while keeping adapters in 16-bit BF16.",
      "DoRA decomposes weights into magnitude and direction for superior learning accuracy."
    ],
    highlights: ["LoRA", "QLoRA", "DoRA", "4-bit NF4"],
    featured: false
  },
  {
    id: 8,
    title: "OpenAI o3 & System 2 Test-Time Compute Scaling",
    date: "Apr 2026",
    category: "Frontier Models",
    categoryColor: "bg-purple-500/20 text-purple-400 border-purple-500/30",
    readTime: "5 min read",
    summary: "Analyzing the transition from fast completion (System 1) to deliberate step-by-step reasoning (System 2) powered by Process Reward Models (PRMs).",
    takeaways: [
      "Test-time compute allows models to generate and verify hidden Chain-of-Thought paths.",
      "Process Reward Models score each intermediate step rather than just the final answer.",
      "Outperforms standard LLMs on ARC-AGI, Competitive Programming, and PhD math."
    ],
    highlights: ["System 2", "Test-Time Compute", "PRMs", "o3 Series"],
    featured: false
  },
  {
    id: 7,
    title: "Speculative Decoding: 3x Faster LLM Inference at Zero Accuracy Loss",
    date: "Mar 2026",
    category: "MLOps & Systems",
    categoryColor: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    readTime: "5 min read",
    summary: "Pairing a small 1B draft model with a 70B target model to propose and verify candidate tokens in parallel batches.",
    takeaways: [
      "Draft model generates 5 candidate tokens rapidly in sequence.",
      "Target 70B model verifies all 5 candidates in a single GPU forward pass.",
      "Mathematically guarantees identical output distribution to full target model."
    ],
    highlights: ["Speculative Decoding", "Draft Models", "Fast Inference", "GPU Parallelism"],
    featured: false
  }
];

const TECH_RADAR = [
  {
    ring: "Adopt",
    color: "border-emerald-500/50 bg-emerald-500/10 text-emerald-400",
    items: [
      { name: "MCP Protocol 1.0", desc: "Standardized tool integration across LLM hosts and external servers." },
      { name: "vLLM & PagedAttention", desc: "Production standard for high-throughput LLM serving." },
      { name: "LangGraph", desc: "Cyclic state-machine orchestration for multi-agent workflows." },
      { name: "Qwen2.5-Coder", desc: "Top open-weight coding model family for enterprise self-hosting." }
    ]
  },
  {
    ring: "Trial",
    color: "border-cyan-500/50 bg-cyan-500/10 text-cyan-400",
    items: [
      { name: "DeepSeek-R1 Distillations", desc: "Small 7B/14B models with frontier-level reasoning weights." },
      { name: "Claude Code CLI", desc: "Terminal-native agentic coding with permission boundaries." },
      { name: "Hybrid RAG + Reranking", desc: "Dense vector + BM25 keyword search paired with Cohere/BGE reranker." }
    ]
  },
  {
    ring: "Assess",
    color: "border-amber-500/50 bg-amber-500/10 text-amber-400",
    items: [
      { name: "Speculative Decoding", desc: "Draft + target model acceleration for latency-critical API endpoints." },
      { name: "GraphRAG Indexing", desc: "Knowledge Graph + Entity extraction for global document queries." },
      { name: "Native Audio/Video LLMs", desc: "Processing interleaved raw audio/video frames directly in prompt." }
    ]
  },
  {
    ring: "Hold",
    color: "border-rose-500/50 bg-rose-500/10 text-rose-400",
    items: [
      { name: "Pure SFT without DPO/RL", desc: "Supervised fine-tuning alone without preference optimization." },
      { name: "Raw Uncompressed Context Stuffing", desc: "Feeding 100k+ tokens without chunking or compression." }
    ]
  }
];

export default function NewsletterIndex() {
  const [selectedCategory, setSelectedCategory] = useState("All");
  const [searchQuery, setSearchQuery] = useState("");
  const [subscribed, setSubscribed] = useState(false);
  const [email, setEmail] = useState("");
  const [expandedEdition, setExpandedEdition] = useState(null);

  const categories = ["All", "Frontier Models", "Developer Tools", "Architecture & RAG", "MLOps & Systems"];

  const filteredEditions = EDITIONS.filter((ed) => {
    const matchesCategory = selectedCategory === "All" || ed.category === selectedCategory;
    const matchesSearch = searchQuery === "" || 
      ed.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ed.summary.toLowerCase().includes(searchQuery.toLowerCase()) ||
      ed.highlights.some(h => h.toLowerCase().includes(searchQuery.toLowerCase()));
    return matchesCategory && matchesSearch;
  });

  const featuredIssue = EDITIONS.find(ed => ed.featured);

  const handleSubscribe = (e) => {
    e.preventDefault();
    if (email.trim()) {
      setSubscribed(true);
      localStorage.setItem("mani_notes_newsletter_email", email);
    }
  };

  const toc = [
    { label: "Featured Issue", hash: "featured" },
    { label: "Latest Editions", hash: "editions" },
    { label: "AI Tech Radar 2026", hash: "tech-radar" },
    { label: "Subscribe", hash: "subscribe" }
  ];

  return (
    <GuideLayout
      title="📰 Tech Radar & Newsletter"
      intro="Weekly visual breakdowns of frontier AI models, emerging developer tools, research breakthroughs, and production engineering practices."
      toc={toc}
    >
      {/* ====== FEATURED EDITION (HERO SPOTLIGHT) ====== */}
      <section id="featured" className="mb-14 scroll-mt-24">
        <div className="flex items-center gap-2 mb-4 text-xs font-bold uppercase tracking-wider text-purple-400">
          <span className="w-2.5 h-2.5 rounded-full bg-purple-500 animate-pulse"></span>
          Featured Issue Spotlight
        </div>

        {featuredIssue && (
          <div className="bg-gradient-to-br from-purple-950/40 via-[#111111] to-[#0a0a0a] border border-purple-500/30 rounded-2xl p-6 md:p-8 relative overflow-hidden shadow-2xl">
            <div className="absolute top-0 right-0 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl pointer-events-none"></div>

            <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
              <span className={`px-3 py-1 rounded-full text-xs font-bold border ${featuredIssue.categoryColor}`}>
                {featuredIssue.category}
              </span>
              <span className="text-xs text-gray-400 font-mono">Issue #{featuredIssue.id} · {featuredIssue.date} · {featuredIssue.readTime}</span>
            </div>

            <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-4 leading-tight">
              {featuredIssue.title}
            </h2>

            <p className="text-gray-300 text-base leading-relaxed mb-6">
              {featuredIssue.summary}
            </p>

            <div className="bg-black/50 border border-white/10 rounded-xl p-5 mb-6 space-y-2">
              <h4 className="text-sm font-bold text-purple-300 uppercase tracking-wide mb-3">⚡ Key Architectural Takeaways:</h4>
              {featuredIssue.takeaways.map((point, idx) => (
                <div key={idx} className="flex items-start gap-3 text-sm text-gray-200">
                  <span className="text-purple-400 font-bold mt-0.5">✓</span>
                  <span>{point}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-4 pt-2">
              <div className="flex flex-wrap gap-2">
                {featuredIssue.highlights.map((h, idx) => (
                  <span key={idx} className="px-2.5 py-1 rounded-md bg-white/5 border border-white/10 text-xs text-gray-300 font-mono">
                    #{h}
                  </span>
                ))}
              </div>

              <button
                onClick={() => setExpandedEdition(featuredIssue)}
                className="px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold text-sm transition-all shadow-lg hover:shadow-purple-500/25 flex items-center gap-2"
              >
                Read Deep Dive <span>→</span>
              </button>
            </div>
          </div>
        )}
      </section>

      {/* ====== FILTER TABS & SEARCH ====== */}
      <section id="editions" className="mb-14 scroll-mt-24">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
            <h2 className="text-2xl font-bold text-white mb-1">Newsletter Archive & Issues</h2>
            <p className="text-sm text-gray-400">Filter by domain or search for specific tools and concepts.</p>
          </div>

          <div className="relative w-full md:w-64">
            <input
              type="text"
              placeholder="Search editions & topics..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full bg-[#141414] border border-white/10 rounded-xl px-4 py-2 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-500 transition-colors"
            />
          </div>
        </div>

        {/* Category Pills */}
        <div className="flex flex-wrap gap-2 mb-8">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-4 py-2 rounded-xl text-xs font-bold transition-all border ${
                selectedCategory === cat
                  ? "bg-white text-black border-white shadow-lg"
                  : "bg-[#111111] text-gray-400 border-white/10 hover:text-white hover:border-white/20"
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* EDITIONS GRID */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {filteredEditions.map((ed) => (
            <motion.div
              key={ed.id}
              whileHover={{ y: -4 }}
              className="bg-[#111111] border border-white/10 hover:border-white/20 rounded-2xl p-6 flex flex-col justify-between transition-all group"
            >
              <div>
                <div className="flex items-center justify-between gap-2 mb-3">
                  <span className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold border ${ed.categoryColor}`}>
                    {ed.category}
                  </span>
                  <span className="text-xs text-gray-500 font-mono">Issue #{ed.id} · {ed.date}</span>
                </div>

                <h3 className="text-lg font-bold text-white mb-2 group-hover:text-indigo-300 transition-colors leading-snug">
                  {ed.title}
                </h3>

                <p className="text-gray-400 text-sm leading-relaxed mb-4 line-clamp-3">
                  {ed.summary}
                </p>
              </div>

              <div>
                <div className="flex flex-wrap gap-1.5 mb-4">
                  {ed.highlights.map((h, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-[10px] font-mono text-gray-400 border border-white/5">
                      #{h}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-3 border-t border-white/5">
                  <span className="text-xs text-gray-500 font-mono">⏱️ {ed.readTime}</span>
                  <button
                    onClick={() => setExpandedEdition(ed)}
                    className="text-xs font-bold text-indigo-400 hover:text-indigo-300 transition-colors flex items-center gap-1"
                  >
                    View Highlights <span>→</span>
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </div>

        {filteredEditions.length === 0 && (
          <div className="text-center py-16 bg-[#111111] rounded-2xl border border-white/10 text-gray-400">
            <p className="text-base font-semibold mb-2">No newsletter editions match your filter.</p>
            <button
              onClick={() => { setSelectedCategory("All"); setSearchQuery(""); }}
              className="text-xs text-indigo-400 underline font-bold"
            >
              Clear filters and search
            </button>
          </div>
        )}
      </section>

      {/* ====== TECH RADAR WIDGET ====== */}
      <section id="tech-radar" className="mb-14 scroll-mt-24">
        <div className="flex items-center gap-3 mb-2">
          <span className="text-2xl">📡</span>
          <h2 className="text-2xl font-bold text-white">AI Engineering Tech Radar 2026</h2>
        </div>
        <p className="text-gray-400 text-sm mb-6 max-w-2xl">
          Our opinionated radar tracking which frameworks, models, and paradigms to Adopt, Trial, Assess, or Hold in production.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {TECH_RADAR.map((radar) => (
            <div key={radar.ring} className={`border rounded-2xl p-6 bg-[#0e0e0e] ${radar.color.split(' ')[0]}`}>
              <div className="flex items-center justify-between mb-4 pb-2 border-b border-white/10">
                <span className={`px-3 py-1 rounded-full text-xs font-bold border ${radar.color}`}>
                  Ring: {radar.ring.toUpperCase()}
                </span>
                <span className="text-xs text-gray-500 font-mono">{radar.items.length} Technologies</span>
              </div>

              <div className="space-y-3">
                {radar.items.map((tech) => (
                  <div key={tech.name} className="bg-black/40 border border-white/5 rounded-xl p-3.5">
                    <h4 className="text-sm font-bold text-white mb-1 flex items-center justify-between">
                      {tech.name}
                    </h4>
                    <p className="text-xs text-gray-400 leading-relaxed">{tech.desc}</p>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ====== SUBSCRIBE CARD ====== */}
      <section id="subscribe" className="mb-14 scroll-mt-24">
        <div className="bg-gradient-to-r from-indigo-950/50 via-[#141414] to-purple-950/40 border border-indigo-500/30 rounded-2xl p-8 text-center relative overflow-hidden shadow-2xl">
          <span className="text-4xl block mb-3">📬</span>
          <h2 className="text-2xl md:text-3xl font-extrabold text-white mb-2">
            Subscribe to Mani Notes Tech Digest
          </h2>
          <p className="text-gray-300 text-sm max-w-xl mx-auto mb-6 leading-relaxed">
            Get curated visual architecture breakdowns, tool reviews, and AI engineering field notes delivered straight to your inbox every week.
          </p>

          {!subscribed ? (
            <form onSubmit={handleSubscribe} className="flex flex-col sm:flex-row items-center justify-center gap-3 max-w-md mx-auto">
              <input
                type="email"
                required
                placeholder="Enter your work email..."
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-[#0a0a0a] border border-white/20 rounded-xl px-4 py-3 text-sm text-white placeholder-gray-500 focus:outline-none focus:border-indigo-400 transition-colors"
              />
              <button
                type="submit"
                className="w-full sm:w-auto px-6 py-3 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold text-sm transition-all whitespace-nowrap shadow-lg shadow-indigo-600/30"
              >
                Subscribe Free
              </button>
            </form>
          ) : (
            <div className="bg-emerald-500/20 border border-emerald-500/40 rounded-xl p-4 max-w-md mx-auto text-emerald-300 text-sm font-bold flex items-center justify-center gap-2">
              <span>🎉 You're subscribed! Welcome to the Mani Notes digest.</span>
            </div>
          )}

          <p className="text-xs text-gray-500 mt-4 font-mono">
            Zero spam. Unsubscribe anytime with 1-click.
          </p>
        </div>
      </section>

      {/* ====== EXPAND MODAL FOR EDITION DETAILS ====== */}
      <AnimatePresence>
        {expandedEdition && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-md">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              className="bg-[#121212] border border-white/20 rounded-2xl p-6 md:p-8 max-w-2xl w-full max-h-[85vh] overflow-y-auto relative shadow-2xl"
            >
              <button
                onClick={() => setExpandedEdition(null)}
                className="absolute top-4 right-4 w-8 h-8 rounded-full bg-white/10 text-gray-300 hover:text-white flex items-center justify-center text-sm font-bold"
              >
                ✕
              </button>

              <div className="flex items-center gap-2 mb-3">
                <span className={`px-2.5 py-0.5 rounded-full text-xs font-bold border ${expandedEdition.categoryColor}`}>
                  {expandedEdition.category}
                </span>
                <span className="text-xs text-gray-400 font-mono">Issue #{expandedEdition.id} · {expandedEdition.date}</span>
              </div>

              <h2 className="text-2xl font-extrabold text-white mb-4">
                {expandedEdition.title}
              </h2>

              <p className="text-gray-300 text-sm leading-relaxed mb-6">
                {expandedEdition.summary}
              </p>

              <div className="bg-black/60 border border-white/10 rounded-xl p-5 mb-6 space-y-3">
                <h4 className="text-xs font-bold text-indigo-300 uppercase tracking-wider">Key Architecture Takeaways:</h4>
                {expandedEdition.takeaways.map((point, idx) => (
                  <div key={idx} className="flex items-start gap-3 text-sm text-gray-200">
                    <span className="text-indigo-400 font-bold mt-0.5">✓</span>
                    <span>{point}</span>
                  </div>
                ))}
              </div>

              <div className="flex justify-between items-center pt-4 border-t border-white/10">
                <div className="flex gap-2">
                  {expandedEdition.highlights.map((h, i) => (
                    <span key={i} className="px-2 py-0.5 rounded bg-white/5 text-xs text-gray-400 font-mono border border-white/5">
                      #{h}
                    </span>
                  ))}
                </div>
                <button
                  onClick={() => setExpandedEdition(null)}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-bold transition-colors"
                >
                  Close Edition
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </GuideLayout>
  );
}

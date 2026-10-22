import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GlobalHeader from '../components/GlobalHeader';

const LEVELS = [
  {
    level: 'Beginner', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400',
    projects: [
      { title: 'Prompt-Engineered Q&A Bot', desc: 'A single-call assistant that answers questions well using nothing but careful prompt design — no retrieval, no tools.', stack: ['Python', 'Any Chat API'], link: '/prompting' },
      { title: 'Document Summarizer', desc: 'Chunk a long PDF and produce a structured summary — your first hands-on look at chunking strategy tradeoffs.', stack: ['Python', 'LangChain'], link: '/rag/chunking' },
      { title: 'Simple Sentiment Classifier', desc: 'Train a classic supervised model (logistic regression) on labeled text to predict positive/negative sentiment.', stack: ['scikit-learn', 'Pandas'], link: '/ml/logistic-regression' },
    ],
  },
  {
    level: 'Intermediate', color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400',
    projects: [
      { title: 'RAG Chatbot Over Your Own Docs', desc: 'Full pipeline: chunk → embed → store in a vector DB → retrieve → generate a grounded, cited answer.', stack: ['Vector DB', 'Embeddings API', 'LLM API'], link: '/rag/fundamentals' },
      { title: 'Tool-Using Research Agent', desc: 'An agent that decides when to call a web-search tool vs. answer from memory, looping until it has enough information.', stack: ['Agent SDK', 'Tool Calling'], link: '/agents/tool-calling' },
      { title: 'Fine-Tuned Support Assistant', desc: 'LoRA fine-tune a small open model on your own support-ticket transcripts to match your team\'s tone.', stack: ['PEFT/LoRA', 'Open-weight model'], link: '/genai/fine-tuning' },
    ],
  },
  {
    level: 'Advanced', color: 'border-rose-500/30 bg-rose-500/10 text-rose-400',
    projects: [
      { title: 'Multi-Agent Research Team', desc: 'Orchestrator agent delegates to specialized research, writing, and fact-checking subagents, then merges their output.', stack: ['LangGraph', 'Multi-Agent'], link: '/agents/multi-agent' },
      { title: 'Self-Correcting RAG (CRAG)', desc: 'A retrieval pipeline that grades its own results and falls back to web search when local documents are insufficient.', stack: ['Vector DB', 'Grader LLM'], link: '/rag/crag' },
      { title: 'Local Quantized Model Server', desc: 'Quantize an open-weight model to 4-bit and serve it locally with a tool-calling-compatible API.', stack: ['llama.cpp / Ollama', 'GGUF'], link: '/genai/quantization' },
    ],
  },
];

export default function ProjectsIndex() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <GlobalHeader />
      <div className="max-w-5xl mx-auto px-5 pt-16 pb-24">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/15 text-indigo-400 text-sm font-bold border border-indigo-500/30 mb-4">
            Build-Along Projects
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-white to-indigo-300 bg-clip-text text-transparent mb-4">
            Projects
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Reading about RAG and agents only gets you so far — these are project ideas ordered by difficulty, each
            linked to the relevant guide on this site to get you started.
          </p>
        </div>

        {LEVELS.map((group) => (
          <section key={group.level} className="mb-14">
            <h2 className={`inline-block text-sm font-bold uppercase tracking-wider px-3 py-1 rounded-full border mb-6 ${group.color}`}>
              {group.level}
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
              {group.projects.map((p, i) => (
                <motion.div
                  key={p.title}
                  initial={{ opacity: 0, y: 20 }}
                  whileInView={{ opacity: 1, y: 0 }}
                  viewport={{ once: true }}
                  transition={{ delay: i * 0.08 }}
                  whileHover={{ y: -4 }}
                >
                  <Link to={p.link} className="block h-full p-5 rounded-xl border border-white/10 bg-white/5 hover:border-white/25 hover:bg-white/[0.07] transition-colors">
                    <h3 className="font-bold text-gray-100 mb-2">{p.title}</h3>
                    <p className="text-sm text-gray-400 leading-relaxed mb-4">{p.desc}</p>
                    <div className="flex flex-wrap gap-1.5">
                      {p.stack.map((s) => (
                        <span key={s} className="text-[0.625rem] font-semibold px-2 py-1 rounded bg-black/40 border border-white/10 text-gray-400">{s}</span>
                      ))}
                    </div>
                  </Link>
                </motion.div>
              ))}
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import GlobalHeader from '../components/GlobalHeader';

const CATEGORIES = [
  {
    title: 'Official Model Docs', icon: '📖', color: 'border-indigo-500/30 bg-indigo-500/10',
    links: [
      { name: 'Anthropic (Claude) Docs', url: 'https://docs.anthropic.com' },
      { name: 'OpenAI Platform Docs', url: 'https://platform.openai.com/docs' },
      { name: 'Google AI for Developers', url: 'https://ai.google.dev' },
      { name: 'Hugging Face Docs', url: 'https://huggingface.co/docs' },
    ],
  },
  {
    title: 'Frameworks & Tooling', icon: '🛠️', color: 'border-emerald-500/30 bg-emerald-500/10',
    links: [
      { name: 'LangChain Docs', url: 'https://python.langchain.com' },
      { name: 'LangGraph Docs', url: 'https://langchain-ai.github.io/langgraph' },
      { name: 'LlamaIndex Docs', url: 'https://docs.llamaindex.ai' },
      { name: 'Hugging Face Hub', url: 'https://huggingface.co' },
    ],
  },
  {
    title: 'Research & Papers', icon: '📄', color: 'border-amber-500/30 bg-amber-500/10',
    links: [
      { name: 'arXiv (cs.CL / cs.LG)', url: 'https://arxiv.org' },
      { name: 'Papers with Code', url: 'https://paperswithcode.com' },
      { name: 'Google DeepMind Research', url: 'https://deepmind.google/research' },
    ],
  },
  {
    title: 'Communities', icon: '👥', color: 'border-rose-500/30 bg-rose-500/10',
    links: [
      { name: 'Hugging Face Forums', url: 'https://discuss.huggingface.co' },
      { name: 'r/MachineLearning', url: 'https://www.reddit.com/r/MachineLearning' },
      { name: 'r/LocalLLaMA', url: 'https://www.reddit.com/r/LocalLLaMA' },
    ],
  },
];

export default function ResourcesIndex() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <GlobalHeader />
      <div className="max-w-5xl mx-auto px-5 pt-16 pb-24">
        <div className="text-center mb-16">
          <div className="inline-block px-4 py-1.5 rounded-full bg-indigo-500/15 text-indigo-400 text-sm font-bold border border-indigo-500/30 mb-4">
            Curated Links
          </div>
          <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-br from-white to-indigo-300 bg-clip-text text-transparent mb-4">
            Resources
          </h1>
          <p className="text-lg text-gray-400 max-w-2xl mx-auto leading-relaxed">
            Docs, papers, tools, and communities worth bookmarking as you go deeper into AI engineering.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
          {CATEGORIES.map((cat, ci) => (
            <motion.div
              key={cat.title}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: ci * 0.08 }}
              className={`rounded-2xl border p-6 ${cat.color}`}
            >
              <div className="flex items-center gap-3 mb-4">
                <span className="text-2xl">{cat.icon}</span>
                <h2 className="font-bold text-lg text-white">{cat.title}</h2>
              </div>
              <ul className="space-y-2">
                {cat.links.map((l) => (
                  <li key={l.name}>
                    <a
                      href={l.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="flex items-center justify-between text-sm text-gray-300 hover:text-white bg-black/20 hover:bg-black/40 px-3 py-2 rounded-lg transition-colors group"
                    >
                      <span>{l.name}</span>
                      <span className="text-gray-500 group-hover:text-gray-300 transition-colors">↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import GlobalHeader from '../components/GlobalHeader';

const SECTIONS = [
  { icon: '🐍', name: 'Python', path: '/python', desc: 'Foundations through regex' },
  { icon: '🤖', name: 'Machine Learning', path: '/ml', desc: 'Supervised to transformers' },
  { icon: '✨', name: 'Generative AI', path: '/genai', desc: 'Models, prompting, tuning' },
  { icon: '🔍', name: 'RAG', path: '/rag', desc: 'Index, retrieve, generate' },
  { icon: '🕸️', name: 'Agentic AI', path: '/agents', desc: 'Agents, MCP, multi-agent' },
  { icon: '🧩', name: 'Models', path: '/models', desc: 'Claude, GPT, Gemini, Llama' },
];

export default function NotFound() {
  const { pathname } = useLocation();

  return (
    <div className="min-h-screen bg-[#0a0a0a] text-white">
      <GlobalHeader />
      <div className="max-w-3xl mx-auto px-5 pt-20 pb-24 text-center">
        <div className="text-7xl font-black bg-gradient-to-br from-white to-indigo-400 bg-clip-text text-transparent mb-4">
          404
        </div>
        <h1 className="text-2xl font-bold text-white mb-3">This page doesn't exist</h1>
        <p className="text-gray-400 leading-relaxed mb-2">
          Nothing is mapped to{' '}
          <code className="px-1.5 py-0.5 rounded bg-white/10 text-indigo-300 font-mono text-sm break-all">
            {pathname}
          </code>
          .
        </p>
        <p className="text-sm text-gray-500 mb-10">
          The link may be out of date — a few topics have moved between sections.
        </p>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3 text-left mb-10">
          {SECTIONS.map((s) => (
            <Link
              key={s.path}
              to={s.path}
              className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-indigo-500/50 hover:bg-white/[0.07] transition-colors"
            >
              <div className="flex items-center gap-2 mb-1">
                <span className="text-lg">{s.icon}</span>
                <span className="font-semibold text-white text-sm">{s.name}</span>
              </div>
              <p className="text-xs text-gray-400 m-0">{s.desc}</p>
            </Link>
          ))}
        </div>

        <Link
          to="/"
          className="inline-block px-6 py-3 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white font-medium transition-colors"
        >
          ← Back to home
        </Link>
      </div>
    </div>
  );
}

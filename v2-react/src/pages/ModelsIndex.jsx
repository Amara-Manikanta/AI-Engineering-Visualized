import React from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout';
import ModelBenchmarks from '../components/ModelBenchmarks';
import { PROFILES } from '../data/modelProfiles';

const MODELS = [
  {
    id: 'claude', name: 'Claude', maker: 'Anthropic', path: '/models/claude', icon: '🧠',
    color: 'from-orange-500/20 to-orange-600/5', border: 'border-orange-500/30', text: 'text-orange-400',
    access: 'Closed', context: '200K–1M', strength: 'Agentic coding & long-context reasoning',
  },
  {
    id: 'gpt', name: 'GPT', maker: 'OpenAI', path: '/models/gpt', icon: '🌀',
    color: 'from-emerald-500/20 to-emerald-600/5', border: 'border-emerald-500/30', text: 'text-emerald-400',
    access: 'Closed', context: '128K–1M', strength: 'Broadest ecosystem & multimodal tooling',
  },
  {
    id: 'gemini', name: 'Gemini', maker: 'Google DeepMind', path: '/models/gemini', icon: '♊',
    color: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/30', text: 'text-blue-400',
    access: 'Closed', context: '1M', strength: 'Native video/audio & massive context',
  },
  {
    id: 'llama', name: 'Llama', maker: 'Meta', path: '/models/llama', icon: '🦙',
    color: 'from-indigo-500/20 to-indigo-600/5', border: 'border-indigo-500/30', text: 'text-indigo-400',
    access: 'Mixed — Llama licence + Apache 2.0', context: '128K', strength: 'Self-hostable, fine-tune-friendly',
  },
  {
    id: 'qwen', name: 'Qwen', maker: 'Alibaba', path: '/models/qwen', icon: '🐉',
    color: 'from-rose-500/20 to-rose-600/5', border: 'border-rose-500/30', text: 'text-rose-400',
    access: 'Open weights', context: '128K–1M', strength: 'Multilingual & strong small-size coding',
  },
  {
    id: 'deepseek', name: 'DeepSeek', maker: 'DeepSeek AI', path: '/models/deepseek', icon: '🐋',
    color: 'from-cyan-500/20 to-cyan-600/5', border: 'border-cyan-500/30', text: 'text-cyan-400',
    access: 'Open weights (MIT)', context: '1M', strength: 'Efficient MoE training & reasoning (R1)',
  },
  {
    id: 'mistral', name: 'Mistral', maker: 'Mistral AI', path: '/models/mistral', icon: '🌬️',
    color: 'from-amber-500/20 to-amber-600/5', border: 'border-amber-500/30', text: 'text-amber-400',
    access: 'Open + Closed', context: '128K', strength: 'Lean, fast, cost-efficient European models',
  },
  {
    id: 'grok', name: 'Grok', maker: 'xAI', path: '/models/grok', icon: '✖️',
    color: 'from-slate-500/20 to-slate-600/5', border: 'border-slate-500/30', text: 'text-slate-300',
    access: 'Closed (older generations open)', context: '128K+', strength: 'Real-time social knowledge & uncensored personality',
  },
  {
    id: 'gemma', name: 'Gemma', maker: 'Google', path: '/models/gemma', icon: '💎',
    color: 'from-sky-500/20 to-sky-600/5', border: 'border-sky-500/30', text: 'text-sky-400',
    access: 'Open weights (Apache 2.0)', context: '256K', strength: 'Small models with high quality-per-parameter',
  },
  {
    id: 'command-r', name: 'Cohere Command', maker: 'Cohere', path: '/models/command-r', icon: '🧭',
    color: 'from-teal-500/20 to-teal-600/5', border: 'border-teal-500/30', text: 'text-teal-400',
    access: 'Open weights (Apache 2.0)', context: '128K', strength: 'RAG-native with structured citations',
  },
  {
    id: 'phi', name: 'Phi', maker: 'Microsoft', path: '/models/phi', icon: '🔷',
    color: 'from-blue-500/20 to-blue-600/5', border: 'border-blue-500/30', text: 'text-blue-400',
    access: 'Open weights (MIT)', context: '16K', strength: 'Reasoning far above its parameter count',
  },
];

const staggerContainer = {
  hidden: { opacity: 0 },
  show: { opacity: 1, transition: { staggerChildren: 0.08 } },
};
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};

export default function ModelsIndex() {
  const toc = [
    { label: 'Overview', hash: 'overview' },
    { label: 'Model Cards', hash: 'model-cards' },
    { label: 'Comparison Table', hash: 'comparison' },
    { label: 'Open vs Closed Weights', hash: 'open-vs-closed' },
    { label: 'Choosing a Model', hash: 'choosing' },
  ];

  return (
    <GuideLayout
      title="AI Models"
      intro="A field guide to the frontier LLM families — who makes them, how they differ architecturally, and when to reach for each one."
      toc={toc}
    >
      <section id="overview" className="mb-16 scroll-mt-24">
        <p className="text-gray-300 leading-relaxed max-w-3xl">
          Every "model" on the market is really a family: a base architecture (often a Mixture-of-Experts
          Transformer), trained at several sizes, then tuned for chat, coding, or reasoning. The differences that
          matter for engineers are less about raw benchmark scores and more about <strong className="text-white">context window,
          license/access model, tool-use quality, and cost per token</strong> — pick based on those constraints first.
        </p>
      </section>

      <section id="model-cards" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">The 11 Model Families</h2>
        <motion.div
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5"
          variants={staggerContainer}
          initial="hidden"
          whileInView="show"
          viewport={{ once: true }}
        >
          {MODELS.map((m) => (
            <motion.div key={m.id} variants={fadeUp} whileHover={{ y: -4, scale: 1.02 }}>
              <Link
                to={m.path}
                className={`block h-full p-6 rounded-2xl border ${m.border} bg-gradient-to-br ${m.color} backdrop-blur-xl hover:border-white/30 transition-colors group`}
              >
                <div className="flex items-center justify-between mb-4">
                  <span className="text-3xl">{m.icon}</span>
                  <span className={`text-[0.625rem] font-bold uppercase tracking-wider px-2 py-1 rounded-full border ${m.border} ${m.text}`}>
                    {m.access}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-1">{m.name}</h3>
                <p className="text-xs text-gray-400 mb-3">{m.maker} · {m.context} context</p>
                {PROFILES[m.id === 'command-r' ? 'commandr' : m.id] && (
                  <p className="text-xs text-indigo-300 mb-3">
                    Current: <span className="font-semibold">{PROFILES[m.id === 'command-r' ? 'commandr' : m.id].lineup[0].name}</span>
                  </p>
                )}
                <p className="text-sm text-gray-300 leading-relaxed">{m.strength}</p>
              </Link>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section id="comparison" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Quick Comparison</h2>
        <p className="text-gray-400 text-sm mb-4">Rough positioning as of 2026 — always check current provider docs for exact context limits and pricing.</p>
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">Model</th>
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">Maker</th>
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">Access</th>
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">Context</th>
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">Signature Strength</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              {MODELS.map((m, i) => (
                <tr key={m.id} className={i % 2 === 1 ? 'bg-gray-900/30' : ''}>
                  <td className="px-4 py-2.5 border-b border-gray-900 font-semibold text-gray-200">{m.icon} {m.name}</td>
                  <td className="px-4 py-2.5 border-b border-gray-900">{m.maker}</td>
                  <td className="px-4 py-2.5 border-b border-gray-900">{m.access}</td>
                  <td className="px-4 py-2.5 border-b border-gray-900">{m.context}</td>
                  <td className="px-4 py-2.5 border-b border-gray-900">{m.strength}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <ModelBenchmarks />
      </section>

      <section id="open-vs-closed" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Open Weights vs Closed API</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-emerald-400 font-semibold mb-3">🔓 Open Weights (Llama, Qwen, DeepSeek, Mistral)</h3>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Download and self-host — full control over data residency and uptime.</li>
              <li>Free to fine-tune (LoRA/QLoRA) on private data without vendor lock-in.</li>
              <li>Requires your own GPU infrastructure or a hosting provider (Together, Fireworks, Groq).</li>
              <li>Usually a step behind closed frontier models on the hardest reasoning tasks.</li>
            </ul>
          </div>
          <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-6">
            <h3 className="text-indigo-400 font-semibold mb-3">🔒 Closed API (Claude, GPT, Gemini)</h3>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Pay-per-token; zero infrastructure to manage — call an endpoint and go.</li>
              <li>Usually leads on frontier reasoning, tool-use, and agentic coding benchmarks.</li>
              <li>Weights and training data are proprietary — no on-prem deployment option.</li>
              <li>Vendor-dependent pricing, rate limits, and deprecation schedules.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="choosing" className="mb-8 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Choosing a Model</h2>
        <div className="space-y-3">
          {[
            { q: 'Need the best agentic coding assistant?', a: 'Claude — purpose-built for long tool-use chains and codebase-scale context.' },
            { q: 'Need deep integration with a huge existing tool ecosystem?', a: 'GPT — the widest plugin/function-calling ecosystem and ChatGPT familiarity.' },
            { q: 'Need to process video, audio, or a massive document in one call?', a: 'Gemini — native multimodal input and the largest context windows.' },
            { q: 'Need to self-host for data privacy or fine-tune cheaply?', a: 'Llama or Qwen — open weights you can run and adapt on your own infrastructure.' },
            { q: 'Need the cheapest inference at reasonable quality?', a: 'DeepSeek or Mistral — MoE efficiency keeps cost per token low.' },
          ].map((item, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -10 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 bg-white/5 border border-white/10 rounded-lg p-4"
            >
              <span className="text-gray-200 font-medium sm:w-[45%] shrink-0">{item.q}</span>
              <span className="text-indigo-300 text-sm">{item.a}</span>
            </motion.div>
          ))}
        </div>
      </section>
    </GuideLayout>
  );
}

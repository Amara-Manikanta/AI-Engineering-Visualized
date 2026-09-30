import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout';
import ModelBenchmarks from '../components/ModelBenchmarks';
import { PROFILES } from '../data/modelProfiles';
import { Slider, Metric, Segmented } from '../components/VizKit';

const MODELS = [
  {
    id: 'claude', name: 'Claude', maker: 'Anthropic', path: '/models/anthropic', icon: '🧠',
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

export const SEARCH_KEYWORDS = [
  "model comparison", "benchmarks", "Artificial Analysis", "intelligence index", "tokens per second",
  "cost per task", "price per million tokens", "context window", "knowledge cutoff", "rate limits",
  "reasoning effort", "open weights", "licence", "choosing a model", "model routing", "cost calculator",
];
const SPEC = [
  { i: '📏', t: 'Context window', d: 'The maximum tokens the model can read and write in one request — prompt, documents, conversation history and the answer together. 200K tokens is roughly a 500-page book.', w: 'Fitting in the window is not the same as using it well. Recall of details in the middle of very long inputs can drop, and you pay for every token you send on every call.' },
  { i: '💵', t: 'Price per million tokens', d: 'Quoted twice: input (what you send) and output (what it writes). Output is typically 4–5× the input price because generation is sequential and slower.', w: 'Reasoning models bill their thinking tokens as output. A long hidden chain of thought can dominate the bill.' },
  { i: '🧠', t: 'Reasoning effort / thinking', d: 'Many models can think before answering, controlled by an effort level or thinking budget. More thinking helps on maths, code and planning.', w: 'It adds latency and cost and buys nothing on simple extraction or chat. Benchmark results are usually reported at maximum effort.' },
  { i: '🖼️', t: 'Modalities', d: 'What the model accepts (text, images, PDFs, audio, video) and what it produces. Most models read images; far fewer generate them.', w: 'Image and audio inputs are converted to tokens too, and a single high-resolution image or a minute of audio can cost thousands.' },
  { i: '🔓', t: 'Weights & licence', d: 'Closed models are API-only. Open-weight models can be downloaded, self-hosted and fine-tuned, under a licence that sets what you may do.', w: '"Open" varies — some licences restrict commercial use, large-scale deployment, or using outputs to train other models.' },
  { i: '📅', t: 'Knowledge cutoff', d: 'The date the training data ends. The model knows nothing after it unless you give it the information (search, RAG, tools).', w: 'Models are often unsure of their own cutoff and may confidently describe a stale world. Put the current date in the system prompt.' },
  { i: '🛠️', t: 'Tool use & structured output', d: 'Whether the model can call functions you define and return JSON that matches a schema. Essential for agents and integrations.', w: 'Support is not quality. Tool-use reliability over long chains varies a lot between models — test it on your tools.' },
  { i: '🚦', t: 'Rate limits', d: 'Caps on requests and tokens per minute, usually rising with your usage tier. They decide how much concurrent traffic you can actually serve.', w: 'New or top-tier models often launch with tight limits. Plan retries with backoff and a fallback model.' },
];

const TIERS = {
  small: { label: 'Small', pin: 0.1, pout: 0.5 },
  mid: { label: 'Mid', pin: 2, pout: 10 },
  frontier: { label: 'Frontier', pin: 4, pout: 20 },
};

function CostCalculator() {
  const [tier, setTier] = useState('mid');
  const [tin, setTin] = useState(3000);
  const [tout, setTout] = useState(500);
  const [reqs, setReqs] = useState(10000);
  const [cache, setCache] = useState(0);
  const { pin, pout } = TIERS[tier];
  // Cached input is billed at roughly a tenth of the normal input price (varies by provider).
  const inCost = (tin * (1 - cache / 100) * pin + tin * (cache / 100) * pin * 0.1) / 1e6;
  const outCost = (tout * pout) / 1e6;
  const perReq = inCost + outCost;
  const month = perReq * reqs * 30;
  const money = (v) => (v >= 100 ? `$${Math.round(v).toLocaleString()}` : v >= 1 ? `$${v.toFixed(2)}` : `$${v.toFixed(4)}`);
  return (
    <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.07] p-5 sm:p-6">
      <div className="mb-4">
        <Segmented
          options={Object.entries(TIERS).map(([k, t]) => ({ v: k, label: `${t.label} · $${t.pin} / $${t.pout}` }))}
          value={tier}
          onChange={setTier}
        />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-2 mb-5">
        <Slider label="Input tokens per request" value={tin} min={200} max={50000} step={100} onChange={setTin} format={(v) => v.toLocaleString()} />
        <Slider label="Output tokens per request" value={tout} min={50} max={8000} step={50} onChange={setTout} format={(v) => v.toLocaleString()} />
        <Slider label="Requests per day" value={reqs} min={100} max={200000} step={100} onChange={setReqs} format={(v) => v.toLocaleString()} />
        <Slider label="Input served from prompt cache" value={cache} min={0} max={90} step={5} onChange={setCache} format={(v) => `${v}%`} />
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label="Per request" value={money(perReq)} />
        <Metric label="Per month" value={money(month)} tone="indigo" />
        <Metric label="Input share" value={`${Math.round((inCost / perReq) * 100)}%`} />
        <Metric label="Output share" value={`${Math.round((outCost / perReq) * 100)}%`} />
      </div>
      <p className="text-xs text-gray-500 mt-4 mb-0">
        Example prices per million tokens (input / output) taken from current small, mid and frontier models; cached
        input is assumed to cost 10% of the normal input price, which varies by provider. Try the same traffic on each
        tier: at the defaults the frontier tier costs 40× the small one.
      </p>
    </div>
  );
}

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
    { label: 'Reading a Model Spec', hash: 'spec' },
    { label: 'What It Will Cost', hash: 'cost' },
    { label: 'Model Cards', hash: 'model-cards' },
    { label: 'Comparison Table', hash: 'comparison' },
    { label: 'Benchmarks', hash: 'benchmarks' },
    { label: 'Open vs Closed Weights', hash: 'open-vs-closed' },
    { label: 'Choosing a Model', hash: 'choosing' },
    { label: 'Where to Next', hash: 'next' },
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          {[
            { t: 'Families come in tiers', d: 'Most vendors ship a large flagship, a balanced mid-size model, and a small fast one (Anthropic: Opus / Sonnet / Haiku; OpenAI: Astra / Sol / Luna). The small ones are usually distilled from the large one, so they share its style at a fraction of the price.' },
            { t: 'Names hide versions', d: 'A family name ("Claude", "Gemini") is not a model. Production code should pin an exact model ID so an upgrade is a deliberate change you test, not something that happens to you overnight.' },
            { t: 'The leaderboard moves monthly', d: 'New releases reshuffle the rankings every few weeks. Build your app so the model is a configuration value, keep a small evaluation set, and re-run it when something new ships.' },
          ].map((c) => (
            <div key={c.t} className="p-5 rounded-xl border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white text-sm mb-2">{c.t}</h3>
              <p className="text-xs text-gray-400 leading-relaxed m-0">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="spec" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-2">Reading a Model Spec</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-3xl">
          Every provider's model page lists the same handful of numbers. This is what each one means in practice and
          the trap hiding in it.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {SPEC.map((f) => (
            <div key={f.t} className="p-5 rounded-xl border border-white/10 bg-white/5">
              <div className="flex items-center gap-2 mb-2">
                <span className="text-xl">{f.i}</span>
                <h3 className="font-semibold text-white text-sm m-0">{f.t}</h3>
              </div>
              <p className="text-xs text-gray-300 leading-relaxed mb-2">{f.d}</p>
              <p className="text-xs text-amber-200/80 leading-relaxed m-0"><span className="font-semibold text-amber-300">Watch out:</span> {f.w}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="cost" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-2">What It Will Cost</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-3xl">
          Prices are quoted per million tokens, separately for input and output. Multiply by your traffic before you
          pick a tier — the difference between tiers is often 20–40×, which matters far more at scale than a few
          benchmark points.
        </p>
        <CostCalculator />
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
      </section>

      <section id="benchmarks" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-2">Benchmarks</h2>
        <p className="text-gray-400 text-sm mb-4 max-w-3xl">
          Three numbers decide most model choices: how capable it is, how fast it answers, and what a task costs.
          Switch between them below, then look at the trade-off view — the interesting models are the ones no other
          model beats on both quality and price.
        </p>
        <ModelBenchmarks />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          {[
            { t: 'Contamination', d: 'Public benchmark questions leak into training data. A model can score well on a test it has effectively seen. Fresh or private evaluations are more trustworthy.' },
            { t: 'Settings change the score', d: 'Reasoning effort, thinking budget, sampling temperature and the prompt template all move results. Compare models at the settings you will actually run.' },
            { t: 'Your task is not the benchmark', d: 'A model that leads on competition maths may not lead on your support tickets. Fifty real examples from your own product beat any leaderboard.' },
            { t: 'Averages hide failures', d: 'An index averages many tests. For production, the worst case on your critical path (a wrong refund, a leaked secret) matters more than the mean.' },
          ].map((c) => (
            <div key={c.t} className="p-4 rounded-xl border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white text-sm mb-1.5">{c.t}</h3>
              <p className="text-xs text-gray-400 leading-relaxed m-0">{c.d}</p>
            </div>
          ))}
        </div>
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
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          {[
            { t: 'Open weights ≠ open source', d: 'Most "open" models release the trained weights but not the training data or code. You can run and fine-tune them, but you cannot reproduce them.' },
            { t: 'Read the licence', d: 'Apache 2.0 and MIT allow almost anything. Community licences (Llama, some Qwen and Gemma versions) add acceptable-use rules or user-count thresholds. Check before you ship commercially.' },
            { t: 'The middle ground', d: 'You can call open models through a hosted API (Together, Fireworks, Bedrock, Vertex) — no GPUs to run, and you can move to self-hosting later without changing models.' },
          ].map((c) => (
            <div key={c.t} className="p-4 rounded-xl border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white text-sm mb-1.5">{c.t}</h3>
              <p className="text-xs text-gray-400 leading-relaxed m-0">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="choosing" className="mb-8 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-2">Choosing a Model</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-3xl">
          Don't pick from a leaderboard. Pick with a short, repeatable process — then the next release is a
          ten-minute re-run instead of a debate.
        </p>
        <ol className="space-y-3 mb-8">
          {[
            ['Write down the constraints', 'Data residency, self-hosting, latency budget, cost ceiling, languages, modalities. These eliminate most options before quality even comes up.'],
            ['Build a small evaluation set', '30–100 real inputs with what a good answer looks like. Without it, every comparison is a vibe.'],
            ['Start at the top', 'Run the strongest model first. That sets the quality ceiling and tells you whether the task is solvable with prompting at all.'],
            ['Step down a tier until quality drops', 'Try the mid and small tiers on the same set. Often a cheaper model is indistinguishable on your task, and that saving compounds with traffic.'],
            ['Consider routing', 'Send easy requests to a small model and escalate hard ones. Many products run two or three models behind one interface.'],
            ['Pin the version and re-test on release', 'Use an exact model ID in production and re-run the evaluation set when a new model ships.'],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-4 p-4 rounded-xl border border-white/10 bg-white/5">
              <span className="shrink-0 w-7 h-7 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 text-sm font-bold flex items-center justify-center">{i + 1}</span>
              <div>
                <div className="text-sm font-semibold text-white mb-0.5">{t}</div>
                <p className="text-xs text-gray-400 leading-relaxed m-0">{d}</p>
              </div>
            </li>
          ))}
        </ol>
        <h3 className="text-lg font-semibold text-white mb-3">Rules of thumb</h3>
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

      <section id="next" className="mb-8 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Where to Next</h2>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            { t: 'How Models Are Trained', d: 'Every family\'s pipeline side by side.', p: '/models/training' },
            { t: 'Model Types', d: 'Base, instruct, reasoning, embedding and multimodal models.', p: '/llms/types' },
            { t: 'Reasoning Models', d: 'When extended thinking is worth its tokens.', p: '/genai/reasoning-models' },
            { t: 'Serving Stack', d: 'What it takes to self-host an open model.', p: '/genai/serving' },
            { t: 'AGI Claims: A Case Study', d: 'How to read a headline claim about a new model.', p: '/models/agi-claims' },
          ].map((c) => (
            <Link key={c.t} to={c.p} className="block p-4 rounded-xl border border-white/10 bg-white/5 hover:border-indigo-500/50 transition-colors">
              <div className="text-sm font-semibold text-white mb-1">{c.t}</div>
              <p className="text-xs text-gray-400 leading-relaxed m-0">{c.d}</p>
            </Link>
          ))}
        </div>
      </section>
    </GuideLayout>
  );
}

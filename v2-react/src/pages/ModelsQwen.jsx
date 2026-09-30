import React from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';
import { ModelLineup, ModelWeights, ModelAccess, ModelPipeline } from '../components/ModelProfile';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };

export default function ModelsQwen() {
  const toc = [
    { label: 'Overview', hash: 'overview' },
    { label: 'Current Lineup', hash: 'lineup' },
    { label: 'Model Weights', hash: 'weights' },
    { label: 'When to Choose It', hash: 'choose' },
    { label: 'How to Access It', hash: 'access' },
    { label: 'Architecture', hash: 'architecture' },
    { label: 'Training Pipeline', hash: 'pipeline' },
    { label: 'Training & Uniqueness', hash: 'training' },
    { label: 'Strengths & Weaknesses', hash: 'strengths' },
    { label: 'Ideal Use Cases', hash: 'use-cases' },
  ];

  return (
    <GuideLayout title="Qwen (Alibaba)" intro="One of the largest and most actively updated open-weight families, with unusually strong multilingual and small-model coding performance." toc={toc}>
      <section id="overview" className="mb-14 scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🐉</span>
          <span className="px-3 py-1 rounded-full bg-rose-500/15 text-rose-400 text-xs font-bold border border-rose-500/30">Alibaba · Open Weights</span>
        </div>
        <p className="text-gray-300 leading-relaxed max-w-3xl">
          Qwen ships an unusually wide range of sizes — from sub-1B edge models to frontier-scale MoE — all open
          weight, updated on a rapid release cadence. It's particularly strong at Chinese/English bilingual tasks and
          punches above its weight on coding and math benchmarks at small parameter counts.
        </p>
      </section>

      <ModelLineup id="qwen" />

      <ModelWeights id="qwen" />

      <ModelAccess id="qwen" name="Qwen" />


      <section id="architecture" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Architecture Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '🌐', title: 'Strong Bilingual Training', desc: 'Trained on massive Chinese and English corpora, giving it an edge on cross-lingual and translation-heavy tasks.' },
            { icon: '🧩', title: 'Mixture-of-Experts at Scale', desc: 'Flagship tiers use sparse routing to reach frontier parameter counts without frontier inference costs.' },
            { icon: '👨‍💻', title: 'Dedicated Coder Variants', desc: 'Qwen-Coder checkpoints are fine-tuned specifically for code completion and repository-level tasks.' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-200 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <ModelPipeline id="qwen" name="Qwen" />

      <section id="training" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">How Qwen Is Trained</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Qwen follows pretrain → SFT → preference alignment like the rest of the field, but a few choices give it a
          distinct personality: an unusually multilingual and math/code-heavy pretraining corpus, and a lighter-weight
          alignment method for its later releases.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h3 className="text-rose-400 font-semibold mb-3">🌏 Multilingual + Math/Code-Heavy Pretraining</h3>
            <p className="text-sm text-gray-300 leading-relaxed mb-3">
              Where many labs pretrain mostly on English text, Qwen's corpus is built with heavy Chinese representation
              alongside English and dozens of other languages from the start, plus an intense focus on mathematics and
              code data, refined with synthetic-data pipelines before fine-tuning. That's why a comparatively small
              Qwen model — especially the <strong className="text-gray-100">Qwen2.5-Coder</strong> variants — can outperform much
              larger, English-centric models on cross-lingual, math, and coding benchmarks.
            </p>
            <div className="flex flex-wrap gap-1.5 text-xs font-mono">
              {['🇨🇳 Chinese', '🇺🇸 English', '🌐 +100 languages', '💻 Code', '➗ Math'].map((m) => (
                <span key={m} className="px-2 py-1 bg-black/30 border border-rose-500/30 rounded text-rose-200">{m}</span>
              ))}
            </div>
          </div>
          <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-5">
            <h3 className="text-purple-400 font-semibold mb-3">⚡ Direct Preference Optimization (DPO)</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Rather than training a separate reward model and running an unstable PPO reinforcement-learning loop,
              later Qwen releases align the SFT model directly on (chosen, rejected) response pairs via DPO — a single
              supervised-style loss that pushes the model toward preferred responses and away from rejected ones,
              skipping the reward-model-plus-RL machinery entirely.
            </p>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
          <span className="px-3 py-1.5 bg-black/40 border border-gray-700 rounded-full text-gray-300">SFT Model</span>
          <span className="text-gray-500">→</span>
          <span className="px-3 py-1.5 bg-purple-900/20 border border-purple-500/40 rounded-full text-purple-300">(chosen, rejected) pairs</span>
          <span className="text-gray-500">→ DPO loss →</span>
          <span className="px-3 py-1.5 bg-emerald-900/20 border border-emerald-500/40 rounded-full text-emerald-300">Aligned Qwen Model</span>
          <span className="text-gray-600 italic ml-2">(no separate reward model, no PPO loop)</span>
        </div>
      </section>

      <section id="strengths" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Strengths & Weaknesses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Strengths</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Widest range of open sizes — a model for nearly any hardware budget.</li>
              <li>Best-in-class multilingual quality, especially Chinese/English.</li>
              <li>Small coding variants rival much larger closed models.</li>
              <li>Very active, frequent open releases.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Weaknesses</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>You self-host — no first-party managed API in every region.</li>
              <li>Fewer English-language fine-tuning guides than Llama.</li>
              <li>Licensing terms vary by model size/version — check before commercial use.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="use-cases" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Ideal Use Cases</h2>
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {['Multilingual products (esp. Chinese/English)', 'Lightweight self-hosted coding assistants', 'Edge & mobile on-device inference'].map((u, i) => (
            <motion.div key={i} variants={fadeUp} className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-gray-300 text-center">{u}</motion.div>
          ))}
        </motion.div>
      </section>
    </GuideLayout>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';
import { ModelLineup, ModelWeights, ModelAccess, ModelPipeline } from '../components/ModelProfile';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };

export default function ModelsDeepseek() {
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
    <GuideLayout title="DeepSeek (DeepSeek AI)" intro="Proved that frontier-level reasoning could be trained far more cheaply than assumed, via aggressive Mixture-of-Experts efficiency and reinforcement-learning-based reasoning." toc={toc}>
      <section id="overview" className="mb-14 scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🐋</span>
          <span className="px-3 py-1 rounded-full bg-cyan-500/15 text-cyan-400 text-xs font-bold border border-cyan-500/30">DeepSeek AI · Open Weights</span>
        </div>
        <p className="text-gray-300 leading-relaxed max-w-3xl">
          DeepSeek's V-series and R-series models showed the industry that near-frontier reasoning quality didn't
          require frontier-scale training budgets. Its R1 "reasoning" line popularized visible chain-of-thought
          tokens and reinforcement-learning-trained reasoning as an open, reproducible technique.
        </p>
      </section>

      <ModelLineup id="deepseek" />

      <ModelWeights id="deepseek" />

      <ModelAccess id="deepseek" name="DeepSeek" />


      <section id="architecture" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Architecture Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '🧩', title: 'Aggressive MoE Sparsity', desc: 'Activates a very small fraction of total parameters per token, drastically cutting training and inference compute.' },
            { icon: '🎯', title: 'RL-Trained Reasoning', desc: 'The R-series is trained with reinforcement learning to produce long, self-checking chains of thought before answering.' },
            { icon: '💰', title: 'Training Efficiency', desc: 'Demonstrated competitive quality at a fraction of the reported training cost of comparable closed frontier models.' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-200 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <ModelPipeline id="deepseek" name="DeepSeek" />

      <section id="training" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">How DeepSeek Is Trained</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          DeepSeek's V-series follows the familiar pretrain → SFT → RLHF/DPO recipe, running on an ultra-sparse
          Mixture-of-Experts architecture that activates only a fraction of its total parameters per token (V3: 37B of 671B; V4-Pro: 49B of 1.6 trillion) — a
          big part of how it trains and serves so cheaply. The <strong className="text-white">R-series (R1)</strong> is where it
          breaks from the standard playbook entirely, and it's the most influential open training recipe of the last
          two years: it showed reasoning ability can emerge from reinforcement learning
          <em className="text-gray-200"> without</em> a supervised fine-tuning step first.
        </p>

        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">R1's Training Path</h3>
          <div className="flex flex-col items-center gap-3">
            <div className="flex items-center gap-3 flex-wrap justify-center text-xs font-mono">
              <span className="px-3 py-2 bg-black/40 border border-gray-700 rounded-lg text-gray-300">Base Model</span>
              <span className="text-rose-400">✕ skip SFT</span>
              <span className="text-gray-500">→ large-scale RL (GRPO) →</span>
            </div>
            <div className="px-4 py-2 bg-cyan-900/20 border border-cyan-500/40 rounded-lg text-cyan-300 text-xs font-mono">
              Reward = "Is the final answer verifiably correct?" (math, code) + format checks
            </div>
            <div className="text-gray-500">↓</div>
            <div className="px-4 py-2 bg-amber-900/20 border border-amber-500/40 rounded-lg text-amber-300 text-sm font-bold">
              DeepSeek-R1-Zero — strong reasoning, but messy/mixed-language output
            </div>
            <div className="text-gray-500">↓ add a small "cold-start" SFT dataset + further RL rounds ↓</div>
            <div className="px-4 py-2 bg-emerald-900/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-sm font-bold">
              DeepSeek-R1 — strong reasoning, readable, aligned
            </div>
            <div className="text-gray-500">↓ distill reasoning traces into smaller dense models (Llama/Qwen architectures) ↓</div>
            <div className="px-4 py-2 bg-purple-900/20 border border-purple-500/40 rounded-lg text-purple-300 text-sm font-bold">
              Distilled 7B–70B models — most of R1's reasoning gains, tiny fraction of the size
            </div>
          </div>
        </div>

        <div className="bg-cyan-900/10 border border-cyan-500/20 rounded-xl p-6">
          <h3 className="text-cyan-400 font-semibold mb-3">🔑 The Key Differentiator: RL Before SFT, With a Verifiable Reward</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            Every other pipeline on this site trains a reward model from human preference rankings — an inherently
            fuzzy, subjective signal. R1-Zero instead uses <strong className="text-gray-100">automatically verifiable rewards</strong>: for
            a math problem, did the model's final answer match the known correct one? For code, did it pass the tests?
            No human rater or learned reward model is needed for this signal — it's checked programmatically. Trained
            purely with GRPO (Group Relative Policy Optimization, a lighter-weight alternative to PPO that compares a
            group of sampled responses against each other instead of needing a separate value network — saving
            substantial compute), the model spontaneously learned to generate long chains of reasoning before
            answering, without ever being shown a single human-written example of "how to think." DeepSeek then
            open-sourced both the full R1 weights and the smaller distilled models, unlike closed reasoning models such
            as OpenAI's o-series.
          </p>
        </div>
      </section>

      <section id="strengths" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Strengths & Weaknesses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Strengths</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Exceptional price-to-performance — among the cheapest frontier-adjacent inference available.</li>
              <li>Open weights with permissive commercial licensing.</li>
              <li>R-series reasoning is transparent — you can inspect the chain-of-thought.</li>
              <li>Distilled variants bring reasoning gains to small, cheap-to-run models.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Weaknesses</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Reasoning models produce long outputs — higher token cost and latency per answer.</li>
              <li>Smaller ecosystem of managed hosting options than Llama or Qwen.</li>
              <li>Data governance and jurisdiction questions matter more for regulated industries.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="use-cases" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Ideal Use Cases</h2>
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {['Math/logic-heavy reasoning tasks', 'Budget-constrained high-volume inference', 'Research needing inspectable reasoning traces'].map((u, i) => (
            <motion.div key={i} variants={fadeUp} className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-gray-300 text-center">{u}</motion.div>
          ))}
        </motion.div>
      </section>
    </GuideLayout>
  );
}

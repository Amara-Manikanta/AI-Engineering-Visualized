import React from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';
import { ModelLineup, ModelWeights, ModelAccess, ModelPipeline } from '../components/ModelProfile';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };

export default function ModelsLlama() {
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
    <GuideLayout title="Llama (Meta)" intro="The open-weights model that kickstarted the self-hosted LLM ecosystem — download it, fine-tune it, and run it on your own hardware." toc={toc}>
      <section id="overview" className="mb-14 scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🦙</span>
          <span className="px-3 py-1 rounded-full bg-indigo-500/15 text-indigo-400 text-xs font-bold border border-indigo-500/30">Meta · Open Weights</span>
        </div>
        <p className="text-gray-300 leading-relaxed max-w-3xl">
          Llama's weights are freely downloadable under Meta's community license — commercial use allowed, with an acceptable-use policy and extra terms above 700 million monthly users — which made it the default
          starting point for teams that want to fine-tune a model on private data, run inference on their own GPUs,
          or avoid sending sensitive data to a third-party API at all.
        </p>
      </section>

      <ModelLineup id="llama" />

      <ModelWeights id="llama" />

      <ModelAccess id="llama" name="Llama" />


      <section id="architecture" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Architecture Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '📦', title: 'Downloadable Weights', desc: 'Full model checkpoints are published for local or cloud self-hosting — no API dependency required.' },
            { icon: '🧩', title: 'Mixture-of-Experts (large tiers)', desc: 'Newer Llama generations use sparse expert routing to scale total parameters without scaling inference cost linearly.' },
            { icon: '🛠️', title: 'Fine-Tuning Friendly', desc: 'The most battle-tested target for LoRA/QLoRA tooling — nearly every fine-tuning library supports Llama first.' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-200 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <ModelPipeline id="llama" name="Llama" />

      <section id="training" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">How Llama Is Trained</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Meta has published Llama's training recipe in detail (the Llama 2 and 3 papers), making it the most openly
          documented alignment pipeline of any frontier-adjacent model. It follows pretrain → SFT → RLHF, but runs the
          RLHF stage as a <strong className="text-white">repeated, iterative loop</strong> rather than a single pass.
        </p>

        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 mb-6">
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono mb-4">
            <span className="px-3 py-1.5 bg-black/40 border border-gray-700 rounded-full text-gray-300">SFT Model</span>
            <span className="text-gray-500">→ generate responses →</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4">
            <div className="px-4 py-3 bg-indigo-900/20 border border-indigo-500/40 rounded-lg text-center">
              <div className="text-sm font-bold text-indigo-300">Helpfulness<br/>Reward Model</div>
            </div>
            <div className="px-4 py-3 bg-rose-900/20 border border-rose-500/40 rounded-lg text-center">
              <div className="text-sm font-bold text-rose-300">Safety<br/>Reward Model</div>
            </div>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
            <span className="text-gray-500">→ rejection sampling + PPO →</span>
            <span className="px-3 py-1.5 bg-emerald-900/20 border border-emerald-500/40 rounded-full text-emerald-300">Improved Model</span>
          </div>
          <motion.div
            animate={{ opacity: [0.4, 1, 0.4] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="text-center text-amber-400 text-xs font-bold mt-4"
          >
            ↻ repeat for multiple rounds — each round's model generates fresh comparisons for the next round's reward models
          </motion.div>
        </div>

        <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-6">
          <h3 className="text-indigo-400 font-semibold mb-3">🔑 The Key Differentiator: Two Reward Models, Many Rounds</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            Instead of a single reward model scoring "good vs bad," Llama trains <strong className="text-gray-100">separate reward
            models for helpfulness and safety</strong>, so the two objectives (be useful vs don't cause harm) don't get
            blended into one number and silently traded off against each other. Both a rejection-sampling step (generate
            many candidates, keep the best-scoring one) and PPO are used across <strong className="text-gray-100">several successive
            rounds</strong> — the model keeps improving, and each improved version generates new comparison data to train an
            even better reward model for the next round. Meta also layers in large-scale <strong className="text-gray-100">synthetic
            data generation</strong>, using its largest model to produce high-quality reasoning and coding examples that get
            distilled down into the smaller 8B/70B checkpoints.
          </p>
        </div>
      </section>

      <section id="strengths" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Strengths & Weaknesses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Strengths</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Full control over deployment — on-prem, air-gapped, or any cloud.</li>
              <li>No per-token vendor cost once hosted; only your own compute.</li>
              <li>Largest open fine-tuning community and tooling ecosystem.</li>
              <li>No risk of API deprecation pulling the model out from under you.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Weaknesses</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>You own the infrastructure — GPUs, scaling, and uptime.</li>
              <li>Trails closed frontier models on the hardest reasoning benchmarks.</li>
              <li>No built-in hosted tool-use ecosystem; you wire that up yourself.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="use-cases" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Ideal Use Cases</h2>
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {['Regulated industries needing on-prem AI', 'Custom fine-tuned domain assistants', 'Cost-sensitive high-volume inference'].map((u, i) => (
            <motion.div key={i} variants={fadeUp} className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-gray-300 text-center">{u}</motion.div>
          ))}
        </motion.div>
      </section>
    </GuideLayout>
  );
}

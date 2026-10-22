import React from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';
import { ModelLineup, ModelWeights, ModelAccess, ModelPipeline } from '../components/ModelProfile';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };

export default function ModelsMistral() {
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
    <GuideLayout title="Mistral (Mistral AI)" intro="A lean, efficiency-obsessed European lab shipping some of the best quality-per-parameter models available, both open and hosted." toc={toc}>
      <section id="overview" className="mb-14 scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🌬️</span>
          <span className="px-3 py-1 rounded-full bg-amber-500/15 text-amber-400 text-xs font-bold border border-amber-500/30">Mistral AI · Open + Closed</span>
        </div>
        <p className="text-gray-300 leading-relaxed max-w-3xl">
          Mistral's defining trait is efficiency: small dense and Mixture-of-Experts models (like Mixtral) that punch
          above their parameter count. It ships both freely downloadable open-weight models and a hosted API, giving
          teams a middle path between "fully open" Llama and "fully closed" GPT/Claude.
        </p>
      </section>

      <ModelLineup id="mistral" />

      <ModelWeights id="mistral" />

      <ModelAccess id="mistral" name="Mistral" />


      <section id="architecture" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Architecture Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '⚡', title: 'Sparse Mixture-of-Experts', desc: 'Mixtral routes each token to 2 of 8 experts, matching much larger dense models while running noticeably cheaper.' },
            { icon: '📏', title: 'Sliding Window Attention', desc: 'Early Mistral models pioneered efficient attention windows that keep long-context inference fast on modest hardware.' },
            { icon: '🌍', title: 'Dual Distribution', desc: 'Ships both open-weight checkpoints and a hosted La Plateforme API — pick self-hosted or managed per use case.' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-200 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <ModelPipeline id="mistral" name="Mistral" />

      <section id="training" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">How Mistral Is Trained</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Mistral pairs a "lean training" philosophy — obsessively curated, high-quality data plus architectural
          tricks like Sliding Window Attention, letting smaller models like the original 7B outperform models several
          times their size — with <strong className="text-white">Direct Preference Optimization (DPO)</strong> for alignment, the
          same lightweight method Qwen's later releases adopted and one Mistral's own team helped popularize as an
          efficient alternative to full RLHF.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h3 className="text-rose-400 font-semibold mb-3 text-sm">🐢 Classic RLHF (3 moving parts)</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="px-3 py-2 bg-black/30 border border-gray-700 rounded text-gray-300">1. Train a reward model on human rankings</div>
              <div className="px-3 py-2 bg-black/30 border border-gray-700 rounded text-gray-300">2. Run PPO — an RL loop with its own tuning headaches</div>
              <div className="px-3 py-2 bg-black/30 border border-gray-700 rounded text-gray-300">3. Balance reward vs KL penalty to avoid reward hacking</div>
            </div>
          </div>
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h3 className="text-emerald-400 font-semibold mb-3 text-sm">⚡ DPO (1 moving part)</h3>
            <div className="space-y-2 text-xs font-mono">
              <div className="px-3 py-2 bg-black/30 border border-emerald-500/30 rounded text-emerald-200">1. Take (chosen, rejected) response pairs</div>
              <div className="px-3 py-2 bg-black/30 border border-emerald-500/30 rounded text-emerald-200">2. Directly optimize one loss that raises chosen, lowers rejected</div>
              <div className="px-3 py-2 bg-black/30 border border-emerald-500/30 rounded text-emerald-200">3. Done — no reward model, no RL loop</div>
            </div>
          </div>
        </div>

        <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-6">
          <h3 className="text-indigo-400 font-semibold mb-3">🔑 The Key Differentiator: Preference Alignment Without the RL Machinery</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            DPO is mathematically derived to optimize the <em className="text-gray-200">same underlying objective</em> that
            RLHF's reward-model-plus-PPO pipeline optimizes — it just reformulates it as a single supervised loss on
            preference pairs, computed directly against the policy. That removes an entire unstable, hyperparameter-sensitive
            RL loop and the cost of training and hosting a separate reward model, which is a big part of how Mistral
            keeps its Mixtral (MoE) and dense models lean and fast to iterate on — while, as a French company, also
            offering EU-hosted endpoints that appeal to GDPR-sensitive enterprises.
          </p>
        </div>
      </section>

      <section id="strengths" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Strengths & Weaknesses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Strengths</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Excellent quality-per-parameter — cheap to run relative to output quality.</li>
              <li>Flexibility to self-host or use a managed API depending on the model.</li>
              <li>EU-based hosting option, useful for GDPR-sensitive workloads.</li>
              <li>Fast inference, especially on the MoE tiers.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Weaknesses</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Smaller model catalog and community than Llama or Qwen.</li>
              <li>Frontier "Large" tier still trails GPT/Claude/Gemini on the hardest tasks.</li>
              <li>Smaller ecosystem of pre-built agent integrations.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="use-cases" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Ideal Use Cases</h2>
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {['Cost-sensitive production workloads', 'EU-hosted / data-residency requirements', 'Fast small-model deployments at the edge'].map((u, i) => (
            <motion.div key={i} variants={fadeUp} className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-gray-300 text-center">{u}</motion.div>
          ))}
        </motion.div>
      </section>
    </GuideLayout>
  );
}

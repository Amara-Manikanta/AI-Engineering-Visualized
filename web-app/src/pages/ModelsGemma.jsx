import React from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';
import { ModelLineup, ModelWeights, ModelAccess, ModelPipeline } from '../components/ModelProfile';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };

export default function ModelsGemma() {
  const toc = [
    { label: 'Overview', hash: 'overview' },
    { label: 'Current Lineup', hash: 'lineup' },
    { label: 'Model Weights', hash: 'weights' },
    { label: 'When to Choose It', hash: 'choose' },
    { label: 'How to Access It', hash: 'access' },
    { label: 'Architecture', hash: 'architecture' },
    { label: 'Training Pipeline', hash: 'pipeline' },
    { label: 'How Gemma Is Trained', hash: 'training' },
    { label: 'Strengths & Weaknesses', hash: 'strengths' },
    { label: 'Ideal Use Cases', hash: 'use-cases' },
  ];

  return (
    <GuideLayout
      title="Gemma (Google)"
      intro="Google's open-weight family, built from the same research lineage as Gemini but released for you to download, inspect and run yourself."
      toc={toc}
    >
      <section id="overview" className="mb-14 scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">💎</span>
          <span className="px-3 py-1 rounded-full bg-sky-500/15 text-sky-400 text-xs font-bold border border-sky-500/30">Google · Open Weights</span>
        </div>
        <p className="text-gray-300 leading-relaxed max-w-3xl">
          Gemma is Google's answer to Llama: a family of small, permissively licensed models that share architectural
          research with the closed Gemini line but ship as downloadable weights. The emphasis is on models small enough
          to run on a single GPU — or a laptop — while staying genuinely useful.
        </p>
      </section>

      <ModelLineup id="gemma" />

      <ModelWeights id="gemma" />

      <ModelAccess id="gemma" name="Gemma" />


      <section id="architecture" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Architecture Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '🔬', title: 'Gemini lineage', desc: 'Shares architecture and training research with Google\'s frontier line, so improvements flow downward into the open models.' },
            { icon: '📐', title: 'Wide vocabulary', desc: 'A notably large tokenizer vocabulary improves multilingual efficiency — fewer tokens for the same non-English text.' },
            { icon: '🪶', title: 'Designed small', desc: 'These are not truncated big models. The small sizes are the design target, which shows in quality-per-parameter.' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-200 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <ModelPipeline id="gemma" name="Gemma" />

      <section id="training" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">How Gemma Is Trained</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Gemma follows the familiar pretrain → instruction-tune → preference-align pipeline. What distinguishes it is
          less the recipe than two deliberate choices: heavy investment in <strong className="text-white">data
          curation and filtering</strong> before training, and <strong className="text-white">distillation from larger
          models</strong> so a small student inherits behaviour it could not learn alone from raw text.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="bg-sky-900/10 border border-sky-500/20 rounded-xl p-5">
            <h3 className="text-sky-400 font-semibold mb-3">🧹 Filtering before scale</h3>
            <p className="text-sm text-gray-300 leading-relaxed m-0">
              Aggressive removal of personal data, unsafe content and low-quality text happens before pretraining, not
              after. For a small model this matters more than for a large one: with fewer parameters, every token of
              training budget spent on junk is capability you do not get back.
            </p>
          </div>
          <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-5">
            <h3 className="text-purple-400 font-semibold mb-3">🎓 Distillation from a larger teacher</h3>
            <p className="text-sm text-gray-300 leading-relaxed m-0">
              Rather than training only on hard next-token targets, the smaller model learns from the teacher's full
              output distribution — a much richer signal per example. This is a large part of why Gemma's small sizes
              outperform their parameter count.
            </p>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
          <span className="px-3 py-1.5 bg-black/40 border border-gray-700 rounded-full text-gray-300">Filtered corpus</span>
          <span className="text-gray-500">→</span>
          <span className="px-3 py-1.5 bg-sky-900/20 border border-sky-500/40 rounded-full text-sky-300">Pretrain (small)</span>
          <span className="text-gray-500">→</span>
          <span className="px-3 py-1.5 bg-purple-900/20 border border-purple-500/40 rounded-full text-purple-300">Distil from teacher</span>
          <span className="text-gray-500">→</span>
          <span className="px-3 py-1.5 bg-emerald-900/20 border border-emerald-500/40 rounded-full text-emerald-300">Instruction + preference tune</span>
        </div>
      </section>

      <section id="strengths" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Strengths & Weaknesses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Strengths</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Excellent quality-per-parameter at small sizes.</li>
              <li>Genuinely runnable on consumer hardware, including laptops.</li>
              <li>Permissive licence suitable for commercial use.</li>
              <li>Strong tooling support across the open ecosystem.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Weaknesses</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Does not reach frontier closed models on hard reasoning.</li>
              <li>Smaller context windows than the large hosted models.</li>
              <li>Smaller fine-tuning community than Llama.</li>
              <li>You own the serving infrastructure and its costs.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="use-cases" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Ideal Use Cases</h2>
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {['On-device and offline features', 'Privacy-sensitive data that cannot leave your infrastructure', 'High-volume cheap classification and routing'].map((u, i) => (
            <motion.div key={i} variants={fadeUp} className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-gray-300 text-center">{u}</motion.div>
          ))}
        </motion.div>
        <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            Choosing between open families? Gemma and <a href="#/models/llama" className="text-blue-400 hover:underline">Llama</a> overlap heavily;
            Llama has the larger ecosystem, Gemma often the better small-size quality. Compare the field on the{' '}
            <a href="#/models" className="text-blue-400 hover:underline">Models overview</a>.
          </p>
        </div>
      </section>
    </GuideLayout>
  );
}

import React from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';
import { ModelLineup, ModelWeights, ModelAccess, ModelPipeline } from '../components/ModelProfile';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };

export default function ModelsPhi() {
  const toc = [
    { label: 'Overview', hash: 'overview' },
    { label: 'Current Lineup', hash: 'lineup' },
    { label: 'Model Weights', hash: 'weights' },
    { label: 'When to Choose It', hash: 'choose' },
    { label: 'How to Access It', hash: 'access' },
    { label: 'The Small-Model Case', hash: 'small' },
    { label: 'Training Pipeline', hash: 'pipeline' },
    { label: 'How Phi Is Trained', hash: 'training' },
    { label: 'Data Quality vs Scale', hash: 'quality' },
    { label: 'Strengths & Weaknesses', hash: 'strengths' },
    { label: 'Ideal Use Cases', hash: 'use-cases' },
  ];

  return (
    <GuideLayout
      title="Phi-4 (Microsoft)"
      intro="The strongest argument that training data quality can substitute for scale — a small model that reasons well above its parameter count."
      toc={toc}
    >
      <section id="overview" className="mb-14 scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🔷</span>
          <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 text-xs font-bold border border-blue-500/30">Microsoft · Open Weights</span>
        </div>
        <p className="text-gray-300 leading-relaxed max-w-3xl">
          The Phi series exists to test a specific hypothesis: that much of what large models learn is wasted on
          low-quality web text, and a far smaller model trained on carefully curated, <strong className="text-white">
          textbook-quality</strong> data can match it on reasoning. Phi-4 is the most convincing version of that
          argument so far — competitive on maths and reasoning benchmarks against models several times its size.
        </p>
      </section>

      <ModelLineup id="phi" />

      <ModelWeights id="phi" />

      <ModelAccess id="phi" name="Phi" />

      <section id="small" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Small-Model Case</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Parameter count is not the only axis. A ~14B model that fits on one GPU changes what you can build, because
          it changes the unit economics and the deployment surface.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            { icon: '💵', t: 'Cost per call collapses', d: 'Orders of magnitude cheaper than a frontier API call, which makes high-volume tasks — classification, extraction, routing — economically viable.' },
            { icon: '⚡', t: 'Latency you control', d: 'No network hop, no rate limits, no provider queue. Predictable tail latency matters more than average for interactive products.' },
            { icon: '🔒', t: 'Data never leaves', d: 'For regulated or sensitive workloads, self-hosting is not a preference but a requirement.' },
            { icon: '🧱', t: 'Fits one GPU', d: 'Fine-tuning and serving on a single accelerator removes the distributed-systems tax entirely.' },
          ].map((c) => (
            <motion.div key={c.t} initial={{ opacity: 0, y: 12 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-5 rounded-xl border border-white/10 bg-white/5">
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="font-semibold text-white text-sm mb-1">{c.t}</div>
              <p className="text-xs text-gray-400 leading-relaxed m-0">{c.d}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <ModelPipeline id="phi" name="Phi" />

      <section id="training" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">How Phi Is Trained</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          The recipe is unusual in where the effort goes. Most of the work is upstream of training: constructing a
          corpus rather than collecting one.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-5">
            <h3 className="text-blue-400 font-semibold mb-3">📚 Synthetic "textbook" data</h3>
            <p className="text-sm text-gray-300 leading-relaxed m-0">
              A large teacher model generates explanatory material — worked examples, exercises, step-by-step
              reasoning — in the style of a textbook rather than a web page. Every token carries pedagogical signal,
              which is exactly what a parameter-constrained model needs.
            </p>
          </div>
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h3 className="text-emerald-400 font-semibold mb-3">🔎 Ruthless filtering of real data</h3>
            <p className="text-sm text-gray-300 leading-relaxed m-0">
              Web text is kept only where a classifier judges it to have genuine educational value. Most of the
              internet is discarded — the opposite instinct to scale-maximising pretraining.
            </p>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 flex flex-wrap items-center justify-center gap-3 text-xs font-mono mb-4">
          <span className="px-3 py-1.5 bg-black/40 border border-gray-700 rounded-full text-gray-300">Teacher model</span>
          <span className="text-gray-500">→</span>
          <span className="px-3 py-1.5 bg-blue-900/20 border border-blue-500/40 rounded-full text-blue-300">Synthetic textbooks</span>
          <span className="text-gray-500">+</span>
          <span className="px-3 py-1.5 bg-emerald-900/20 border border-emerald-500/40 rounded-full text-emerald-300">Filtered web</span>
          <span className="text-gray-500">→</span>
          <span className="px-3 py-1.5 bg-purple-900/20 border border-purple-500/40 rounded-full text-purple-300">Pretrain small model</span>
          <span className="text-gray-500">→</span>
          <span className="px-3 py-1.5 bg-amber-900/20 border border-amber-500/40 rounded-full text-amber-300">SFT + DPO</span>
        </div>

        <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/10">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>The tradeoff this creates:</strong> a curriculum optimised for reasoning is narrower than the open
            internet. Phi is strong at maths, logic and code, and comparatively thin on obscure world knowledge, recent
            events and long-tail trivia — because that material was largely filtered out on purpose.
          </p>
        </div>
      </section>

      <section id="quality" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Data Quality vs Scale</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Phi is the clearest counterexample to "just add parameters". It does not refute scaling laws — it shows they
          assume a fixed data distribution, and that improving the distribution moves the whole curve.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-xl border border-gray-600/40 bg-white/5">
            <div className="text-gray-300 font-semibold mb-2 text-sm">Scale-first</div>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">More parameters, more tokens, minimal filtering. Broad knowledge, high cost, strong general capability.</p>
            <div className="text-[0.6875rem] text-gray-500 font-mono">capability ≈ f(params, tokens)</div>
          </div>
          <div className="p-5 rounded-xl border border-blue-500/40 bg-blue-500/10">
            <div className="text-blue-300 font-semibold mb-2 text-sm">Data-first (Phi)</div>
            <p className="text-xs text-gray-300 leading-relaxed mb-3">Fewer parameters, curated tokens. Narrower knowledge, far lower cost, surprisingly strong reasoning.</p>
            <div className="text-[0.6875rem] text-blue-300/70 font-mono">capability ≈ f(params, tokens, quality)</div>
          </div>
        </div>
      </section>

      <section id="strengths" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Strengths & Weaknesses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Strengths</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Reasoning and maths well above its parameter count.</li>
              <li>Cheap enough for high-volume and on-device work.</li>
              <li>Fine-tunes comfortably on a single GPU.</li>
              <li>Permissive licence for commercial use.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Weaknesses</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Thin on world knowledge and long-tail facts by design.</li>
              <li>Weaker at open-ended conversation and creative writing.</li>
              <li>Benchmark-heavy training invites contamination questions.</li>
              <li>Smaller context window than hosted frontier models.</li>
            </ul>
          </div>
        </div>
        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            The knowledge gap is less limiting than it sounds if you pair it with{' '}
            <a href="#/rag" className="text-blue-400 hover:underline">retrieval</a> — supply the facts at query time and
            let the small model do the reasoning over them. That combination is often cheaper and more controllable
            than a large model answering from memory.
          </p>
        </div>
      </section>

      <section id="use-cases" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Ideal Use Cases</h2>
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {['High-volume extraction and classification', 'On-device reasoning where cost per call matters', 'RAG systems where retrieval supplies the knowledge'].map((u, i) => (
            <motion.div key={i} variants={fadeUp} className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-gray-300 text-center">{u}</motion.div>
          ))}
        </motion.div>
      </section>
    </GuideLayout>
  );
}

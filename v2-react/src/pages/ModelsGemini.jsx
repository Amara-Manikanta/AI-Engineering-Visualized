import React from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';
import { ModelLineup, ModelWeights, ModelAccess, ModelPipeline } from '../components/ModelProfile';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };

export default function ModelsGemini() {
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
    <GuideLayout title="Gemini (Google DeepMind)" intro="Built natively multimodal from the ground up, with the largest production context windows of any frontier model." toc={toc}>
      <section id="overview" className="mb-14 scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">♊</span>
          <span className="px-3 py-1 rounded-full bg-blue-500/15 text-blue-400 text-xs font-bold border border-blue-500/30">Google DeepMind · Closed Weights</span>
        </div>
        <p className="text-gray-300 leading-relaxed max-w-3xl">
          Unlike models that bolt vision onto a text-trained network, Gemini was trained jointly on text, images,
          audio, and video from the start. Combined with context windows that scale into the millions of tokens, it's
          the model of choice when the input itself is huge or multimodal — an hour of video, a full monorepo, or a
          stack of PDFs in one call.
        </p>
      </section>

      <ModelLineup id="gemini" />

      <ModelWeights id="gemini" />

      <ModelAccess id="gemini" name="Gemini" />


      <section id="architecture" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Architecture Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '🎞️', title: 'Native Multimodality', desc: 'Text, images, audio, and video share a single trained representation — no separate vision adapter bolted on afterward.' },
            { icon: '📚', title: 'Massive Context Window', desc: 'Scales into the millions of tokens, enough to fit entire codebases, hour-long videos, or hundreds of documents in one prompt.' },
            { icon: '🔗', title: 'Google Ecosystem Integration', desc: 'First-class hooks into Search, Workspace, and Cloud — retrieval-augmented answers can pull live grounded data.' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-200 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <ModelPipeline id="gemini" name="Gemini" />

      <section id="training" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">How Gemini Is Trained</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Gemini follows the same broad shape as every frontier chat model — pretrain, then align with human-guided
          fine-tuning and reinforcement learning. What sets it apart is <strong className="text-white">when</strong> the multimodal
          data enters the pipeline.
        </p>

        <div className="flex flex-col md:flex-row items-stretch gap-3 mb-8">
          {[
            { icon: '🎞️', title: 'Joint Multimodal Pretraining', sub: 'Text + image + audio + video, together', color: 'border-blue-500/40 bg-blue-900/10 text-blue-300' },
            { icon: '🎯', title: 'Instruction Tuning', sub: 'Human demonstrations → chat-ready model', color: 'border-emerald-500/40 bg-emerald-900/10 text-emerald-300' },
            { icon: '🏆', title: 'RLHF + Tool-Use Tuning', sub: 'Preference optimization + agentic behaviors', color: 'border-amber-500/40 bg-amber-900/10 text-amber-300' },
          ].map((s, i, arr) => (
            <React.Fragment key={i}>
              <motion.div initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className={`flex-1 rounded-xl border p-5 ${s.color.split(' ')[0]} ${s.color.split(' ')[1]}`}>
                <div className="text-2xl mb-2">{s.icon}</div>
                <h3 className="font-bold text-gray-100 text-sm">{s.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
              </motion.div>
              {i < arr.length - 1 && <div className="hidden md:flex items-center justify-center text-gray-600 text-xl px-1">→</div>}
            </React.Fragment>
          ))}
        </div>

        <div className="bg-blue-900/10 border border-blue-500/20 rounded-xl p-6">
          <h3 className="text-blue-400 font-semibold mb-3">🔑 The Key Differentiator: Native, Not Bolted-On</h3>
          <p className="text-sm text-gray-300 leading-relaxed mb-4">
            Most earlier multimodal models started as a text-only language model, then had a vision encoder attached
            afterward to translate images into something the text model could read. Gemini instead trains on
            interleaved text, image, audio, and video data <em className="text-gray-200">from the very first pretraining step</em> —
            all modalities share one model and one training objective from the start, rather than vision being a
            plugin bolted onto a language-only foundation.
          </p>
          <div className="flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
            {['📝 Text', '🖼️ Images', '🔊 Audio', '🎬 Video'].map((m) => (
              <span key={m} className="px-3 py-1.5 bg-black/30 border border-blue-500/30 rounded-full text-blue-200">{m}</span>
            ))}
            <span className="text-blue-400">→ one joint pretraining objective →</span>
            <span className="px-3 py-1.5 bg-blue-500/20 border border-blue-500/50 rounded-full text-blue-200 font-bold">Gemini base model</span>
          </div>
          <p className="text-xs text-gray-500 mt-4 italic">This is why Gemini can reason natively over an hour of video or a live audio stream, instead of first converting it to a text description and losing detail in the process.</p>
        </div>
      </section>

      <section id="strengths" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Strengths & Weaknesses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Strengths</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Largest usable context window of any mainstream frontier model.</li>
              <li>Genuinely native video and audio understanding, not just image captioning.</li>
              <li>Flash tier is very fast and cheap for its capability level.</li>
              <li>Deep, grounded integration with live Google Search results.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Weaknesses</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Closed weights — API-only, no self-hosting.</li>
              <li>Very long contexts can still suffer "lost in the middle" recall issues.</li>
              <li>Smaller third-party agent-framework ecosystem than GPT.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="use-cases" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Ideal Use Cases</h2>
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {['Video/audio understanding pipelines', 'Whole-codebase or whole-document-set analysis', 'Products already on Google Cloud / Workspace'].map((u, i) => (
            <motion.div key={i} variants={fadeUp} className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-gray-300 text-center">{u}</motion.div>
          ))}
        </motion.div>
      </section>
    </GuideLayout>
  );
}

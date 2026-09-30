import React from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';
import { ModelLineup, ModelWeights, ModelAccess, ModelPipeline } from '../components/ModelProfile';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };

export default function ModelsGrok() {
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
    <GuideLayout title="Grok (xAI)" intro="Developed by xAI, Grok is an AI model natively integrated into the X (formerly Twitter) platform, designed with real-time knowledge and a uniquely unfiltered personality." toc={toc}>
      <section id="overview" className="mb-14 scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">✖️</span>
          <span className="px-3 py-1 rounded-full bg-slate-500/15 text-slate-300 text-xs font-bold border border-slate-500/30">xAI · Closed Weights / Open Weights (Early versions)</span>
        </div>
        <p className="text-gray-300 leading-relaxed max-w-3xl">
          Grok stands out in the AI ecosystem due to its direct integration with X (Twitter), allowing it to access real-time streams of global conversations, news, and events. Built by Elon Musk's xAI, Grok is positioned as an "anti-woke" or less censored alternative to other major models, often featuring a "Fun Mode" that allows for more edgy or humorous responses. While early versions like Grok-1 were open-sourced, frontier models like Grok-2 and Grok-3 are accessed primarily via X Premium or the xAI console.
        </p>
      </section>

      <ModelLineup id="grok" />

      <ModelWeights id="grok" />

      <ModelAccess id="grok" name="Grok" />


      <section id="architecture" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Architecture Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '🐦', title: 'Real-Time X Integration', desc: 'Unique access to the X firehose gives Grok an unparalleled understanding of breaking news and live cultural trends.' },
            { icon: '🎭', title: 'Unfiltered Personality', desc: 'Designed to answer "spicy" questions that other models might refuse, featuring a toggleable "Fun Mode" for sarcasm and humor.' },
            { icon: '🧩', title: 'Massive MoE Roots', desc: 'Grok-1 was released as a 314-billion parameter Mixture-of-Experts model, one of the largest open-source models ever dropped.' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-200 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <ModelPipeline id="grok" name="Grok" />

      <section id="training" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">How Grok Is Trained</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Grok starts from the same base — massive pretraining, then alignment — but runs on xAI's purpose-built
          "Colossus" supercomputer (100,000+ Nvidia H100 GPUs), and its defining trait is
          <strong className="text-white"> what keeps flowing into the model after pretraining</strong>: a continuous stream of
          live data from X, rather than a single frozen snapshot of the internet.
        </p>

        <div className="flex flex-col md:flex-row items-stretch gap-3 mb-8">
          {[
            { icon: '🖥️', title: 'Massive-Scale Pretraining', sub: 'Web-scale text on the Colossus cluster', color: 'border-slate-500/40 bg-slate-800/20 text-slate-300' },
            { icon: '🐦', title: 'Continuous Live-Data Fine-Tuning', sub: 'Ongoing ingestion of the X firehose', color: 'border-sky-500/40 bg-sky-900/10 text-sky-300' },
            { icon: '🎭', title: 'Personality & Light-Touch Alignment', sub: 'Tuned for "Fun Mode" & fewer refusals', color: 'border-amber-500/40 bg-amber-900/10 text-amber-300' },
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

        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 mb-6 flex flex-col items-center">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4">Live Data Loop vs a Frozen Snapshot</h3>
          <div className="flex items-center gap-3 flex-wrap justify-center">
            {['🐦', '💬', '📰', '🔥'].map((e, i) => (
              <motion.span
                key={i}
                className="text-2xl"
                animate={{ y: [0, -8, 0], opacity: [0.5, 1, 0.5] }}
                transition={{ duration: 1.8, repeat: Infinity, delay: i * 0.25 }}
              >
                {e}
              </motion.span>
            ))}
          </div>
          <div className="text-gray-500 my-2">↓ continuously ↓</div>
          <motion.div
            animate={{ boxShadow: ['0 0 0px rgba(56,189,248,0)', '0 0 20px rgba(56,189,248,0.4)', '0 0 0px rgba(56,189,248,0)'] }}
            transition={{ duration: 2.5, repeat: Infinity }}
            className="px-6 py-3 bg-sky-900/30 border border-sky-500/50 rounded-xl font-bold text-sky-300"
          >
            Grok — Weights Updated on a Rolling Cadence
          </motion.div>
          <p className="text-xs text-gray-500 mt-4 italic text-center max-w-md">
            Most models train on a corpus with a hard knowledge cutoff, then ship a frozen checkpoint. Grok's pipeline
            is built to keep folding in fresh X data well past the initial pretraining cut, so it can reason about a
            trending topic from hours ago — a different tradeoff (freshness) for a different risk (unverified,
            in-the-moment social content shaping the model's knowledge).
          </p>
        </div>

        <div className="bg-sky-900/10 border border-sky-500/20 rounded-xl p-6">
          <h3 className="text-sky-400 font-semibold mb-3">🔑 The Key Differentiator: Alignment Tuned for Fewer Refusals</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            Where most labs' alignment stage optimizes heavily for caution on sensitive topics, xAI has explicitly
            aligned Grok in the opposite direction — deliberately reducing refusals and enabling a toggleable
            <strong className="text-gray-100"> "Fun Mode"</strong> for sarcastic, edgy, less-filtered responses. It's the same SFT +
            preference-alignment machinery every other model uses, just pointed at a different target personality —
            proof that the training <em className="text-gray-200">method</em> is fairly standardized across the industry, while the
            <em className="text-gray-200"> values baked in during alignment</em> are a deliberate, lab-specific choice.
          </p>
        </div>
      </section>

      <section id="strengths" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Strengths & Weaknesses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Strengths</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Immediate, real-time knowledge of world events via X data.</li>
              <li>Willingness to tackle controversial or edgy topics without excessive guardrails.</li>
              <li>Strong coding and reasoning capabilities in Grok-2 and newer models.</li>
              <li>Integrated image generation (via Flux integration on X).</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Weaknesses</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>API ecosystem and developer tooling are less mature than OpenAI/Anthropic.</li>
              <li>Frontier models are closed-weight and tied heavily to the X ecosystem.</li>
              <li>Real-time social data can occasionally introduce hallucinations or unverified rumors.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="use-cases" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Ideal Use Cases</h2>
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {['Monitoring breaking news and social trends', 'Generating less-restricted or humorous content', 'Integrated workflow for heavy X (Twitter) users'].map((u, i) => (
            <motion.div key={i} variants={fadeUp} className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-gray-300 text-center">{u}</motion.div>
          ))}
        </motion.div>
      </section>
    </GuideLayout>
  );
}

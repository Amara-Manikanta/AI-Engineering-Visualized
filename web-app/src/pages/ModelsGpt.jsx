import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';
import { ModelLineup, ModelWeights, ModelAccess, ModelPipeline } from '../components/ModelProfile';

const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };

const RLHF_STEPS = [
  {
    icon: '💬', title: 'Sample Multiple Responses',
    detail: 'The SFT model is given the same prompt and asked to generate several different candidate responses (typically 4–9). Because sampling is stochastic, each one comes out slightly different in tone, detail, or approach.',
  },
  {
    icon: '🏅', title: 'Humans Rank Them',
    detail: 'A human labeler reads all the candidates for the same prompt and ranks them from best to worst — not scoring each one in isolation, but comparing them directly against each other, which is a much easier and more consistent judgment for a person to make.',
  },
  {
    icon: '🧠', title: 'Train a Reward Model',
    detail: "Those rankings become training data for a separate Reward Model: given a (prompt, response) pair, predict a scalar score that matches human preference. It's trained with a cross-entropy-style loss that pushes the score of the preferred response above the score of the rejected one.",
  },
  {
    icon: '⚖️', title: 'Optimize the Policy with PPO',
    detail: "Proximal Policy Optimization (PPO) then fine-tunes the SFT model — now called the \"policy\" — to generate responses that score higher on the Reward Model, nudging its weights a small, controlled step at a time so training stays stable.",
  },
  {
    icon: '🪢', title: 'KL-Divergence Keeps It Honest',
    detail: 'Chasing reward score alone is dangerous — a model can learn to "game" the reward model (Goodhart\'s Law: "when a measure becomes a target, it ceases to be a good measure"). A KL-divergence penalty punishes the policy for drifting too far from the original SFT model, keeping responses grounded and coherent while still improving.',
  },
];

export default function ModelsGpt() {
  const [rlhfStep, setRlhfStep] = useState(1);

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
    <GuideLayout title="GPT (OpenAI)" intro="The model family that popularized the chat-assistant interface and the modern function-calling / tool-use pattern." toc={toc}>
      <section id="overview" className="mb-14 scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🌀</span>
          <span className="px-3 py-1 rounded-full bg-emerald-500/15 text-emerald-400 text-xs font-bold border border-emerald-500/30">OpenAI · Closed Weights</span>
        </div>
        <p className="text-gray-300 leading-relaxed max-w-3xl">
          GPT (Generative Pre-trained Transformer) is OpenAI's flagship line. It's the model that put LLMs on the map via
          ChatGPT, and it now anchors the widest third-party integration ecosystem of any provider — most agent
          frameworks, IDE plugins, and SaaS "AI features" were built against the GPT API first.
        </p>
      </section>

      <ModelLineup id="gpt" />

      <ModelWeights id="gpt" />

      <ModelAccess id="gpt" name="GPT" />


      <section id="architecture" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Architecture Highlights</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '🧩', title: 'Mixture-of-Experts', desc: 'Flagship tiers route each token through a subset of specialized expert networks, cutting inference cost versus a dense model of equal quality.' },
            { icon: '🛠️', title: 'Native Function Calling', desc: 'Structured JSON tool schemas were standardized here first — most agent SDKs still model their tool-call format on this API.' },
            { icon: '🖼️', title: 'Multimodal Input', desc: 'Accepts text, images, and audio in a single context; output can include generated images and voice.' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-200 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <ModelPipeline id="gpt" name="GPT" />

      <section id="training" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">How GPT Models Are Trained</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-8">
          Going from a raw language model to something like ChatGPT takes three distinct training stages, each solving a
          problem the previous one left behind. This is the same pipeline OpenAI describes for InstructGPT and ChatGPT —
          <strong className="text-white"> pretrain → supervised fine-tune → reinforcement learning from human feedback</strong>.
        </p>

        {/* Macro 3-stage overview */}
        <div className="flex flex-col md:flex-row items-stretch gap-3 mb-14">
          {[
            { icon: '🌐', num: '1', title: 'Pretraining', sub: 'Raw internet text → Base Model', color: 'border-indigo-500/40 bg-indigo-900/10 text-indigo-300' },
            { icon: '🎯', num: '2', title: 'Supervised Fine-Tuning', sub: 'Human demonstrations → SFT Model', color: 'border-emerald-500/40 bg-emerald-900/10 text-emerald-300' },
            { icon: '🏆', num: '3', title: 'RLHF', sub: 'Human preferences → Aligned Model (ChatGPT)', color: 'border-amber-500/40 bg-amber-900/10 text-amber-300' },
          ].map((s, i, arr) => (
            <React.Fragment key={i}>
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className={`flex-1 rounded-xl border p-5 ${s.color.split(' ')[0]} ${s.color.split(' ')[1]}`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <span className="text-2xl">{s.icon}</span>
                  <span className={`text-xs font-bold px-2 py-0.5 rounded-full bg-black/30 ${s.color.split(' ')[2]}`}>Stage {s.num}</span>
                </div>
                <h3 className="font-bold text-gray-100">{s.title}</h3>
                <p className="text-xs text-gray-400 mt-1">{s.sub}</p>
              </motion.div>
              {i < arr.length - 1 && (
                <div className="hidden md:flex items-center justify-center text-gray-600 text-xl px-1">→</div>
              )}
            </React.Fragment>
          ))}
        </div>

        {/* STAGE 1: Pretraining */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-indigo-500/20 text-indigo-300 border border-indigo-500/40 flex items-center justify-center font-bold text-sm">1</span>
            <h3 className="text-xl font-bold text-gray-100">Generative Pretraining</h3>
          </div>
          <p className="text-gray-300 leading-relaxed mb-6">
            The transformer trains on a massive corpus of internet text — websites, books, articles, code — with one
            simple, self-supervised objective: <strong className="text-white">predict the next token</strong>. No human labels are
            needed because the "answer key" is just the next word in the existing text. Repeated across billions of
            examples, the model absorbs grammar, facts, reasoning patterns, and style. The result is a <strong className="text-white">base model</strong> —
            fluent, knowledgeable, but not yet a chat assistant.
          </p>

          <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 flex flex-col items-center mb-6">
            <div className="flex items-center gap-3 flex-wrap justify-center text-xs font-mono mb-3">
              {['🌐 Websites', '📚 Books', '📰 Articles', '💻 Code'].map((s) => (
                <span key={s} className="px-3 py-1.5 bg-black/40 border border-gray-700 rounded-full text-gray-400">{s}</span>
              ))}
            </div>
            <div className="text-gray-600 mb-3">↓</div>
            <motion.div
              animate={{ boxShadow: ['0 0 0px rgba(99,102,241,0)', '0 0 20px rgba(99,102,241,0.4)', '0 0 0px rgba(99,102,241,0)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="px-6 py-3 bg-indigo-900/30 border border-indigo-500/50 rounded-xl font-bold text-indigo-300"
            >
              Transformer — Next-Token Prediction
            </motion.div>
            <div className="text-gray-600 my-3">↓</div>
            <div className="px-5 py-2.5 bg-black/40 border border-gray-700 rounded-lg font-bold text-gray-200">Base Model</div>
          </div>

          <p className="text-sm text-gray-400 mb-4">The catch: a base model was never trained to <em>answer</em> — only to continue text plausibly. That mismatch is exactly why Stage 2 exists:</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
              <h4 className="text-rose-400 font-semibold mb-3 text-sm">❌ What a raw base model does</h4>
              <div className="font-mono text-xs text-gray-400 space-y-2">
                <div className="text-gray-300">Prompt: <span className="text-white">"What's the capital of France?"</span></div>
                <div className="pl-3 border-l-2 border-rose-500/40 text-gray-500">"What's the capital of Germany?<br/>What's the capital of Italy?<br/>What's the capital of Spain?..."</div>
              </div>
              <p className="text-xs text-gray-500 mt-3 italic">It's just continuing what looks like a quiz document — because that's a plausible continuation too.</p>
            </div>
            <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
              <h4 className="text-emerald-400 font-semibold mb-3 text-sm">✅ What users actually expect</h4>
              <div className="font-mono text-xs text-gray-400 space-y-2">
                <div className="text-gray-300">Prompt: <span className="text-white">"What's the capital of France?"</span></div>
                <div className="pl-3 border-l-2 border-emerald-500/40 text-gray-300">"The capital of France is Paris."</div>
              </div>
              <p className="text-xs text-gray-500 mt-3 italic">A direct, conversational answer — behavior that has to be explicitly taught.</p>
            </div>
          </div>
        </div>

        {/* STAGE 2: SFT */}
        <div className="mb-14">
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/40 flex items-center justify-center font-bold text-sm">2</span>
            <h3 className="text-xl font-bold text-gray-100">Supervised Fine-Tuning (SFT)</h3>
          </div>
          <p className="text-gray-300 leading-relaxed mb-6">
            Human labelers write out ideal conversations by hand — playing both the user <em className="text-gray-300">and</em> the
            assistant — to demonstrate exactly how a good response looks. The base model is then fine-tuned on this
            (prompt → ideal response) dataset using ordinary supervised learning: predict the human's response, compare
            it to what was actually written, compute the loss, and adjust the weights with <strong className="text-white">gradient descent</strong> —
            repeated over the whole dataset until the model reliably imitates the demonstrated style.
          </p>

          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 items-center">
            <div className="lg:col-span-3 bg-[#111] border border-gray-800 rounded-xl p-5">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Human-Written Training Example</h4>
              <div className="space-y-2 font-mono text-xs">
                <div className="bg-black/40 border border-gray-700 rounded p-3"><span className="text-indigo-400 font-bold">Prompt:</span> <span className="text-gray-300">"Explain photosynthesis to a 10-year-old."</span></div>
                <div className="bg-emerald-900/20 border border-emerald-500/30 rounded p-3"><span className="text-emerald-400 font-bold">Ideal response (human-written):</span> <span className="text-gray-300">"Plants use sunlight, water, and air to make their own food — kind of like a tiny kitchen powered by the sun!"</span></div>
              </div>
            </div>

            <div className="lg:col-span-2 flex flex-col items-center">
              <h4 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-3">Training Loop (SGD)</h4>
              <motion.div
                animate={{ rotate: 360 }}
                transition={{ duration: 8, repeat: Infinity, ease: 'linear' }}
                className="w-36 h-36 border-4 border-dashed border-emerald-500/30 rounded-full flex items-center justify-center relative"
              >
                <div className="absolute top-0 -translate-y-1/2 bg-[#0a0a0a] border border-emerald-500/50 text-emerald-300 px-2 py-0.5 rounded-full text-[0.625rem] font-bold whitespace-nowrap">Predict</div>
                <div className="absolute right-0 translate-x-1/2 bg-[#0a0a0a] border border-emerald-500/50 text-emerald-300 px-2 py-0.5 rounded-full text-[0.625rem] font-bold whitespace-nowrap">Compare</div>
                <div className="absolute bottom-0 translate-y-1/2 bg-[#0a0a0a] border border-emerald-500/50 text-emerald-300 px-2 py-0.5 rounded-full text-[0.625rem] font-bold whitespace-nowrap">Loss</div>
                <div className="absolute left-0 -translate-x-1/2 bg-[#0a0a0a] border border-emerald-500/50 text-emerald-300 px-2 py-0.5 rounded-full text-[0.625rem] font-bold whitespace-nowrap">Adjust</div>
                <div className="w-14 h-14 bg-emerald-500/20 rounded-full flex items-center justify-center text-2xl blur-[1px]">🎯</div>
              </motion.div>
            </div>
          </div>

          <div className="bg-amber-900/10 border border-amber-500/20 rounded-lg p-4 mt-6">
            <p className="text-sm text-amber-200"><strong>⚠️ New problem — Distributional Shift:</strong> the SFT model only really knows how to behave on prompts similar to what humans demonstrated. Ask it something meaningfully different and its quality can degrade unpredictably. Stage 3 fixes this by letting the model learn from far more feedback than hand-written demos alone could ever cover.</p>
          </div>
        </div>

        {/* STAGE 3: RLHF interactive walkthrough */}
        <div>
          <div className="flex items-center gap-3 mb-4">
            <span className="w-8 h-8 rounded-full bg-amber-500/20 text-amber-300 border border-amber-500/40 flex items-center justify-center font-bold text-sm">3</span>
            <h3 className="text-xl font-bold text-gray-100">Reinforcement Learning from Human Feedback (RLHF)</h3>
          </div>
          <p className="text-gray-300 leading-relaxed mb-6">
            RLHF scales human judgment far beyond what hand-written examples can cover, by turning "which response is
            better?" — an easy question for a person — into a training signal a model can optimize against.
          </p>

          <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 md:p-8">
            {/* Progress rail */}
            <div className="flex items-center justify-between mb-8 gap-1">
              {RLHF_STEPS.map((s, i) => (
                <React.Fragment key={i}>
                  <button onClick={() => setRlhfStep(i + 1)} className="flex flex-col items-center gap-2 shrink-0">
                    <motion.div
                      animate={{ scale: rlhfStep === i + 1 ? 1.15 : 1, opacity: rlhfStep >= i + 1 ? 1 : 0.35 }}
                      className={`w-11 h-11 rounded-full flex items-center justify-center text-lg border-2 transition-colors ${
                        rlhfStep === i + 1
                          ? 'border-amber-400 bg-amber-500/20 shadow-[0_0_14px_rgba(245,158,11,0.5)]'
                          : rlhfStep > i + 1
                          ? 'border-emerald-500/60 bg-emerald-900/20'
                          : 'border-gray-700 bg-gray-900'
                      }`}
                    >
                      {rlhfStep > i + 1 ? '✓' : s.icon}
                    </motion.div>
                  </button>
                  {i < RLHF_STEPS.length - 1 && (
                    <div className="flex-1 h-0.5 bg-gray-800 min-w-[8px] relative overflow-hidden">
                      <motion.div className="absolute inset-0 bg-amber-500" initial={{ width: '0%' }} animate={{ width: rlhfStep > i + 1 ? '100%' : '0%' }} transition={{ duration: 0.4 }} />
                    </div>
                  )}
                </React.Fragment>
              ))}
            </div>

            <div className="flex items-center gap-4 mb-6 justify-center">
              <button onClick={() => setRlhfStep((s) => Math.max(1, s - 1))} disabled={rlhfStep === 1} className="px-4 py-2 bg-gray-800 hover:bg-gray-700 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm">← Previous</button>
              <span className="text-sm text-gray-400 font-mono">Step {rlhfStep} / {RLHF_STEPS.length}</span>
              <button onClick={() => setRlhfStep((s) => Math.min(RLHF_STEPS.length, s + 1))} disabled={rlhfStep === RLHF_STEPS.length} className="px-4 py-2 bg-amber-600 hover:bg-amber-500 disabled:opacity-40 disabled:cursor-not-allowed text-white rounded-lg transition-colors font-medium text-sm">Next →</button>
            </div>

            <AnimatePresence mode="wait">
              <motion.div key={rlhfStep} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }} className="bg-white/5 border border-white/10 rounded-xl p-6 md:p-8">
                <div className="flex items-center gap-3 mb-4">
                  <span className="text-3xl">{RLHF_STEPS[rlhfStep - 1].icon}</span>
                  <h4 className="text-lg font-bold text-gray-100">{RLHF_STEPS[rlhfStep - 1].title}</h4>
                </div>
                <p className="text-gray-300 leading-relaxed mb-6">{RLHF_STEPS[rlhfStep - 1].detail}</p>

                {rlhfStep === 1 && (
                  <div className="flex flex-wrap justify-center gap-3">
                    {['Response A', 'Response B', 'Response C', 'Response D'].map((r) => (
                      <span key={r} className="px-4 py-2 bg-black/40 border border-gray-700 rounded-lg font-mono text-xs text-gray-300">{r}</span>
                    ))}
                  </div>
                )}
                {rlhfStep === 2 && (
                  <div className="flex flex-wrap justify-center gap-3">
                    {[['Response C', 1, 'border-amber-400 text-amber-300'], ['Response A', 2, 'border-gray-500 text-gray-300'], ['Response D', 3, 'border-gray-600 text-gray-400'], ['Response B', 4, 'border-gray-700 text-gray-500']].map(([r, rank, cls]) => (
                      <motion.div key={r} initial={{ opacity: 0, scale: 0.8 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: rank * 0.1 }} className={`flex items-center gap-2 px-4 py-2 bg-black/40 border rounded-lg font-mono text-xs ${cls}`}>
                        <span className="font-bold">#{rank}</span> {r}
                      </motion.div>
                    ))}
                  </div>
                )}
                {rlhfStep === 3 && (
                  <div className="flex items-center justify-center gap-3 flex-wrap font-mono text-xs">
                    <span className="px-3 py-2 bg-black/40 border border-gray-700 rounded text-gray-300">(prompt, response)</span>
                    <span className="text-gray-500">→</span>
                    <span className="px-3 py-2 bg-purple-900/30 border border-purple-500/40 rounded text-purple-300">Reward Model</span>
                    <span className="text-gray-500">→</span>
                    <span className="px-3 py-2 bg-emerald-900/30 border border-emerald-500/40 rounded text-emerald-300">score: 8.4</span>
                  </div>
                )}
                {rlhfStep === 4 && (
                  <div className="flex items-center justify-center gap-3 flex-wrap font-mono text-xs">
                    <span className="px-3 py-2 bg-black/40 border border-gray-700 rounded text-gray-300">SFT Model (policy)</span>
                    <span className="text-gray-500">→ generates → scored by →</span>
                    <span className="px-3 py-2 bg-purple-900/30 border border-purple-500/40 rounded text-purple-300">Reward Model</span>
                    <span className="text-gray-500">→ PPO nudges weights →</span>
                    <span className="px-3 py-2 bg-amber-900/30 border border-amber-500/40 rounded text-amber-300">Updated Policy</span>
                  </div>
                )}
                {rlhfStep === 5 && (
                  <div className="flex flex-col items-center gap-3">
                    <div className="flex items-center gap-6">
                      <div className="text-center">
                        <div className="text-2xl mb-1">🏆</div>
                        <div className="text-xs text-gray-400">Reward Model pulls toward</div>
                        <div className="text-xs text-emerald-400 font-bold">higher scores</div>
                      </div>
                      <motion.div animate={{ x: [-4, 4, -4] }} transition={{ duration: 1.5, repeat: Infinity }} className="text-3xl text-gray-500">⟷</motion.div>
                      <div className="text-center">
                        <div className="text-2xl mb-1">🪢</div>
                        <div className="text-xs text-gray-400">KL penalty pulls back toward</div>
                        <div className="text-xs text-indigo-400 font-bold">original SFT behavior</div>
                      </div>
                    </div>
                    <p className="text-xs text-gray-500 italic mt-2 max-w-md text-center">Without this tug-of-war, the model can learn to "hack" the reward model — e.g. padding answers with reassuring filler because the reward model over-values length or agreeableness — instead of genuinely improving.</p>
                  </div>
                )}
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </section>

      <section id="strengths" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Strengths & Weaknesses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Strengths</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Largest third-party ecosystem — most frameworks default to this API shape.</li>
              <li>Strong general-purpose reasoning across coding, writing, and analysis.</li>
              <li>Mature multimodal support (vision, voice, image generation).</li>
              <li>Extensive fine-tuning and Assistants/Agents tooling.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Weaknesses</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Closed weights — no self-hosting or on-prem deployment.</li>
              <li>Pricing and rate limits are entirely vendor-controlled.</li>
              <li>Frontier tier is expensive for high-volume production use.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="use-cases" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Ideal Use Cases</h2>
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {['General-purpose chat products', 'Multimodal apps (vision + voice)', 'Teams already on the OpenAI SDK ecosystem'].map((u, i) => (
            <motion.div key={i} variants={fadeUp} className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-gray-300 text-center">{u}</motion.div>
          ))}
        </motion.div>
      </section>
    </GuideLayout>
  );
}

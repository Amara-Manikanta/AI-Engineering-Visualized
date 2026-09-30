import React from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';
import { ModelLineup, ModelWeights, ModelAccess, ModelPipeline } from '../components/ModelProfile';

const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } };
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };

export default function ModelsCommandR() {
  const toc = [
    { label: 'Overview', hash: 'overview' },
    { label: 'Current Lineup', hash: 'lineup' },
    { label: 'Model Weights', hash: 'weights' },
    { label: 'When to Choose It', hash: 'choose' },
    { label: 'How to Access It', hash: 'access' },
    { label: 'Built for RAG', hash: 'rag' },
    { label: 'Training Pipeline', hash: 'pipeline' },
    { label: 'How Command Is Trained', hash: 'training' },
    { label: 'Strengths & Weaknesses', hash: 'strengths' },
    { label: 'Ideal Use Cases', hash: 'use-cases' },
  ];

  return (
    <GuideLayout
      title="Cohere Command (A+ and R+)"
      intro="A model family designed around retrieval rather than adapted to it — grounded generation and inline citations are first-class, not prompt tricks."
      toc={toc}
    >
      <section id="overview" className="mb-14 scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🧭</span>
          <span className="px-3 py-1 rounded-full bg-teal-500/15 text-teal-400 text-xs font-bold border border-teal-500/30">Cohere · Enterprise / Open Weights</span>
        </div>
        <p className="text-gray-300 leading-relaxed max-w-3xl">
          Most model families treat RAG as something you build on top with prompting. Cohere's Command line inverts
          that: the model is trained to accept a list of documents as a structured input and return answers with
          <strong className="text-white"> machine-readable citations</strong> pointing at which document supported which
          span. For enterprise search, that single property often matters more than a few benchmark points.
        </p>
      </section>

      <ModelLineup id="commandr" />

      <ModelWeights id="commandr" />

      <ModelAccess id="commandr" name="Cohere Command" />


      <section id="rag" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Built for RAG</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          The difference shows up in the API shape. Instead of you concatenating documents into a prompt and hoping the
          model cites them, documents are a typed parameter and citations come back as structured spans.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="p-5 rounded-xl border border-rose-500/25 bg-rose-500/10">
            <div className="text-rose-400 font-semibold mb-2 text-sm">Typical approach elsewhere</div>
            <ul className="text-xs text-gray-300 space-y-1.5">
              <li>• Paste documents into the prompt as text</li>
              <li>• Ask nicely for citations in the system prompt</li>
              <li>• Parse citations back out of prose with regex</li>
              <li>• Hope the model didn't invent a source id</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-emerald-500/25 bg-emerald-500/10">
            <div className="text-emerald-400 font-semibold mb-2 text-sm">Command's approach</div>
            <ul className="text-xs text-gray-300 space-y-1.5">
              <li>• Documents passed as a structured list with ids</li>
              <li>• Citations returned as spans with document ids</li>
              <li>• Grounding trained in, not prompted in</li>
              <li>• Verifiable: you can check each cited span mechanically</li>
            </ul>
          </div>
        </div>

        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
          <span className="px-3 py-1.5 bg-black/40 border border-gray-700 rounded-full text-gray-300">query + documents[]</span>
          <span className="text-gray-500">→</span>
          <span className="px-3 py-1.5 bg-teal-900/20 border border-teal-500/40 rounded-full text-teal-300">Command R+</span>
          <span className="text-gray-500">→</span>
          <span className="px-3 py-1.5 bg-emerald-900/20 border border-emerald-500/40 rounded-full text-emerald-300">answer + citations[{'{'}start, end, doc_ids{'}'}]</span>
        </div>
      </section>

      <ModelPipeline id="commandr" name="Command" />

      <section id="training" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">How Command Is Trained</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          The pipeline is conventional — pretrain, instruction-tune, preference-align — but the fine-tuning data is
          deliberately skewed toward two behaviours that enterprises pay for: <strong className="text-white">grounded
          answering with attribution</strong>, and <strong className="text-white">multi-step tool use</strong>.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          {[
            { t: 'Citation supervision', d: 'Training examples pair an answer with the exact supporting spans, so attribution is a learned behaviour rather than an instruction the model may ignore.', tone: 'border-teal-500/25 bg-teal-500/10', label: 'text-teal-400' },
            { t: 'Refusal when ungrounded', d: 'Explicitly trained to say the documents do not contain the answer — the behaviour most RAG systems have to beg for in the system prompt.', tone: 'border-blue-500/25 bg-blue-500/10', label: 'text-blue-400' },
            { t: 'Multilingual breadth', d: 'Strong coverage across major business languages, which matters for enterprise document sets that are rarely monolingual.', tone: 'border-purple-500/25 bg-purple-500/10', label: 'text-purple-400' },
          ].map((c) => (
            <div key={c.t} className={`p-4 rounded-xl border ${c.tone}`}>
              <div className={`text-sm font-semibold mb-1.5 ${c.label}`}>{c.t}</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{c.d}</p>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/10">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>The key differentiator:</strong> a model trained to abstain when the context is insufficient is
            solving the hallucination problem at the source rather than downstream. That is worth more in a compliance
            setting than a higher score on a general reasoning benchmark.
          </p>
        </div>
      </section>

      <section id="strengths" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Strengths & Weaknesses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Strengths</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Best-in-class structured citations and grounded answering.</li>
              <li>Companion embed + rerank models make a complete retrieval stack.</li>
              <li>Strong multilingual coverage for enterprise corpora.</li>
              <li>Private and on-prem deployment options.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Weaknesses</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Trails frontier models on general reasoning and coding.</li>
              <li>Smaller developer community than OpenAI or Anthropic.</li>
              <li>Older Command R+ weights are non-commercial only; Command A+ fixed this with Apache 2.0.</li>
              <li>Optimised for RAG — less compelling if you aren't doing retrieval.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="use-cases" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Ideal Use Cases</h2>
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {['Enterprise document search needing auditable citations', 'Regulated domains where every claim must be attributable', 'Multilingual knowledge bases'].map((u, i) => (
            <motion.div key={i} variants={fadeUp} className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-gray-300 text-center">{u}</motion.div>
          ))}
        </motion.div>
      </section>
    </GuideLayout>
  );
}

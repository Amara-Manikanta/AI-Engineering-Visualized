import React from "react";
import { motion } from "framer-motion";
import GuideLayout from "../components/GuideLayout";

const toc = [
  { label: "What is Fine-tuning?", hash: "overview" },
  { label: "Full Fine-tuning vs PEFT", hash: "full-vs-peft" },
  { label: "How LoRA Works", hash: "lora" },
  { label: "QLoRA", hash: "qlora" },
  { label: "When to Fine-tune vs RAG", hash: "when" },
];

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } };

export default function GenAiFineTuning() {
  return (
    <GuideLayout
      title="Fine-tuning LLMs"
      intro="Adapting a pre-trained model's behavior, tone, or format to a specific task — without retraining it from scratch."
      toc={toc}
    >
      <section id="overview" className="mb-14 scroll-mt-24">
        <p className="text-gray-300 leading-relaxed max-w-3xl">
          Fine-tuning continues training an already-pretrained model on a smaller, task-specific dataset. It doesn't
          teach the model new facts efficiently (that's what RAG is for) — it teaches the model <em className="text-gray-200">how
          to respond</em>: a consistent tone, a strict output format, a specialized skill like SQL generation, or
          faithfully following a company's writing style.
        </p>
      </section>

      <section id="full-vs-peft" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Full Fine-tuning vs PEFT</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <h3 className="text-rose-400 font-semibold mb-2">Full Fine-tuning</h3>
            <p className="text-sm text-gray-300 mb-3">Updates every single weight in the model. Most expressive, but requires storing a full copy of gradients and optimizer states for every parameter.</p>
            <ul className="list-disc pl-5 text-sm text-gray-400 space-y-1">
              <li>Needs multiple high-VRAM GPUs even for mid-size models</li>
              <li>Produces a full new model checkpoint (same size as original)</li>
              <li>Highest risk of "catastrophic forgetting" of general skills</li>
            </ul>
          </div>
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-6">
            <h3 className="text-emerald-400 font-semibold mb-2">PEFT (Parameter-Efficient Fine-Tuning)</h3>
            <p className="text-sm text-gray-300 mb-3">Freezes the original model and trains only a small number of new parameters injected into it. LoRA is the dominant PEFT technique.</p>
            <ul className="list-disc pl-5 text-sm text-gray-400 space-y-1">
              <li>Trains &lt;1% of total parameters — runs on a single consumer GPU</li>
              <li>Produces a tiny "adapter" file (megabytes, not gigabytes)</li>
              <li>Original model weights stay untouched — easy to swap adapters</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="lora" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">How LoRA Works</h2>
        <p className="text-gray-300 mb-4 max-w-3xl">
          LoRA (Low-Rank Adaptation) freezes the original weight matrix <code className="text-pink-400 bg-gray-800 px-1 rounded">W</code> and
          learns a small correction on top of it, decomposed into two tiny low-rank matrices <code className="text-indigo-300">A</code> and <code className="text-indigo-300">B</code>:
        </p>
        <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-sm text-gray-200 mb-4">
          h = Wx + (B · A)x &nbsp;&nbsp;&nbsp; where W ∈ ℝ^(d×d) frozen, A ∈ ℝ^(r×d), B ∈ ℝ^(d×r), r ≪ d
        </div>
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 flex flex-col items-center gap-3">
          <div className="flex items-center gap-3 text-sm font-mono">
            <span className="bg-white/10 px-3 py-2 rounded-lg">Input x</span>
            <span className="text-gray-500">→</span>
            <span className="bg-gray-700/40 border border-gray-600 px-3 py-2 rounded-lg text-gray-300">Frozen W (❄️ not trained)</span>
          </div>
          <div className="text-indigo-400 text-xs">+ (added on top)</div>
          <div className="flex items-center gap-3 text-sm font-mono">
            <span className="bg-white/10 px-3 py-2 rounded-lg">Input x</span>
            <span className="text-gray-500">→</span>
            <span className="bg-indigo-600/30 border border-indigo-500/50 px-3 py-2 rounded-lg text-indigo-300">A (r×d, trained)</span>
            <span className="text-gray-500">→</span>
            <span className="bg-purple-600/30 border border-purple-500/50 px-3 py-2 rounded-lg text-purple-300">B (d×r, trained)</span>
          </div>
          <p className="text-xs text-gray-500 mt-2">Rank <code className="text-indigo-300">r</code> is typically 4–64 — a fraction of the full hidden dimension, which is why LoRA trains &lt;1% of the parameters.</p>
        </div>
      </section>

      <section id="qlora" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">QLoRA — Quantized LoRA</h2>
        <p className="text-gray-300 mb-4 max-w-3xl">
          QLoRA combines LoRA with quantization: the frozen base model is loaded in 4-bit precision (cutting memory
          ~4x versus 16-bit), while the small LoRA adapter matrices are still trained in higher precision. This is
          what lets a 70B-parameter model be fine-tuned on a single consumer GPU.
        </p>
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">Method</th>
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">~VRAM for a 7B model</th>
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">Quality</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              <tr><td className="px-4 py-2.5 border-b border-gray-900 text-gray-200 font-semibold">Full fine-tuning</td><td className="px-4 py-2.5 border-b border-gray-900">~60–80 GB</td><td className="px-4 py-2.5 border-b border-gray-900">Highest ceiling</td></tr>
              <tr className="bg-gray-900/30"><td className="px-4 py-2.5 border-b border-gray-900 text-gray-200 font-semibold">LoRA (16-bit base)</td><td className="px-4 py-2.5 border-b border-gray-900">~16–20 GB</td><td className="px-4 py-2.5 border-b border-gray-900">Very close to full fine-tuning</td></tr>
              <tr><td className="px-4 py-2.5 border-b border-gray-900 text-gray-200 font-semibold">QLoRA (4-bit base)</td><td className="px-4 py-2.5 border-b border-gray-900">~6–10 GB</td><td className="px-4 py-2.5 border-b border-gray-900">Minor quality tradeoff, huge memory win</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="when" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Fine-tuning vs RAG</h2>
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          <motion.div variants={fadeUp} className="bg-indigo-900/10 border border-indigo-500/20 rounded-lg p-5">
            <h4 className="text-indigo-400 font-semibold mb-2">Reach for Fine-tuning when...</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
              <li>You need a consistent tone, persona, or strict output format.</li>
              <li>You're teaching a narrow skill (e.g. converting English to a proprietary DSL).</li>
              <li>Latency matters and you can't afford a retrieval step.</li>
            </ul>
          </motion.div>
          <motion.div variants={fadeUp} className="bg-amber-900/10 border border-amber-500/20 rounded-lg p-5">
            <h4 className="text-amber-400 font-semibold mb-2">Reach for RAG when...</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
              <li>The knowledge changes frequently (docs, prices, live data).</li>
              <li>You need citations back to source documents.</li>
              <li>You want to avoid the cost and complexity of a training run.</li>
            </ul>
          </motion.div>
        </motion.div>
      </section>
    </GuideLayout>
  );
}

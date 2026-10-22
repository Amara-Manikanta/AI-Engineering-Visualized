import React from "react";
import { motion } from "framer-motion";
import GuideLayout from "../components/GuideLayout";

const toc = [
  { label: "What is Quantization?", hash: "overview" },
  { label: "Precision Formats", hash: "precision" },
  { label: "Post-Training vs QAT", hash: "ptq-vs-qat" },
  { label: "GGUF & Quant Levels", hash: "gguf" },
  { label: "Quality vs Size Tradeoff", hash: "tradeoff" },
];

export default function GenAiQuantization() {
  return (
    <GuideLayout
      title="Quantization"
      intro="Shrinking a model's weights to lower-precision numbers so it uses less memory and runs faster — usually with only a small quality cost."
      toc={toc}
    >
      <section id="overview" className="mb-14 scroll-mt-24">
        <p className="text-gray-300 leading-relaxed max-w-3xl">
          A model's weights are just numbers. Quantization stores those numbers with fewer bits — say 4 bits instead
          of 16 — which shrinks the model's memory footprint by roughly 4x and speeds up inference, at the cost of
          some numerical precision. It's the single biggest lever for running large models on consumer hardware.
        </p>
      </section>

      <section id="precision" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Precision Formats</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">Format</th>
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">Bits</th>
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">7B Model Size</th>
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">Typical Use</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              <tr><td className="px-4 py-2.5 border-b border-gray-900 text-gray-200 font-semibold">FP32</td><td className="px-4 py-2.5 border-b border-gray-900">32-bit</td><td className="px-4 py-2.5 border-b border-gray-900">~28 GB</td><td className="px-4 py-2.5 border-b border-gray-900">Training (rarely used for inference)</td></tr>
              <tr className="bg-gray-900/30"><td className="px-4 py-2.5 border-b border-gray-900 text-gray-200 font-semibold">FP16 / BF16</td><td className="px-4 py-2.5 border-b border-gray-900">16-bit</td><td className="px-4 py-2.5 border-b border-gray-900">~14 GB</td><td className="px-4 py-2.5 border-b border-gray-900">Standard training & full-precision inference</td></tr>
              <tr><td className="px-4 py-2.5 border-b border-gray-900 text-gray-200 font-semibold">INT8</td><td className="px-4 py-2.5 border-b border-gray-900">8-bit</td><td className="px-4 py-2.5 border-b border-gray-900">~7 GB</td><td className="px-4 py-2.5 border-b border-gray-900">Production inference, near-lossless quality</td></tr>
              <tr className="bg-gray-900/30"><td className="px-4 py-2.5 border-b border-gray-900 text-gray-200 font-semibold">INT4 / NF4</td><td className="px-4 py-2.5 border-b border-gray-900">4-bit</td><td className="px-4 py-2.5 border-b border-gray-900">~4 GB</td><td className="px-4 py-2.5 border-b border-gray-900">Consumer GPU / local inference (Ollama, llama.cpp)</td></tr>
            </tbody>
          </table>
        </div>
        <div className="mt-4 bg-[#0a0a0a] border border-gray-800 rounded-xl p-4 flex items-center gap-1 overflow-hidden">
          {[
            { label: 'FP32', width: '100%', color: 'bg-rose-500/40' },
            { label: 'FP16', width: '50%', color: 'bg-amber-500/40' },
            { label: 'INT8', width: '25%', color: 'bg-indigo-500/40' },
            { label: 'INT4', width: '12.5%', color: 'bg-emerald-500/40' },
          ].map((b, i) => (
            <motion.div key={i} initial={{ width: 0 }} whileInView={{ width: b.width }} viewport={{ once: true }} transition={{ duration: 0.6, delay: i * 0.1 }} className={`h-8 rounded ${b.color} flex items-center justify-center text-xs font-bold text-white shrink-0`} style={{ minWidth: '50px' }}>
              {b.label}
            </motion.div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-2">Relative memory footprint for the same 7B-parameter model at each precision.</p>
      </section>

      <section id="ptq-vs-qat" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Post-Training Quantization vs QAT</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <h3 className="text-indigo-400 font-semibold mb-2">Post-Training Quantization (PTQ)</h3>
            <p className="text-sm text-gray-300 mb-2">Take an already-trained full-precision model and convert its weights to lower precision afterward — fast, no retraining needed.</p>
            <ul className="list-disc pl-5 text-sm text-gray-400 space-y-1">
              <li>Runs in minutes, not GPU-hours</li>
              <li>Small accuracy drop, usually acceptable at INT8</li>
              <li>Most GGUF / bitsandbytes quantization is PTQ</li>
            </ul>
          </div>
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <h3 className="text-emerald-400 font-semibold mb-2">Quantization-Aware Training (QAT)</h3>
            <p className="text-sm text-gray-300 mb-2">Simulates low-precision rounding <em>during</em> training, so the model learns weights that are more robust to quantization.</p>
            <ul className="list-disc pl-5 text-sm text-gray-400 space-y-1">
              <li>Better quality retention at very low bit-widths (4-bit and below)</li>
              <li>Requires access to training infrastructure and data</li>
              <li>Used by model providers before releasing official quantized checkpoints</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="gguf" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">GGUF & Quant Levels</h2>
        <p className="text-gray-300 mb-4 max-w-3xl">
          GGUF is the file format used by <code className="text-pink-400 bg-gray-800 px-1 rounded">llama.cpp</code>, Ollama,
          and LM Studio for running quantized models locally. You'll see labels like <code className="text-pink-400 bg-gray-800 px-1 rounded">Q4_K_M</code> —
          decoding them tells you exactly what tradeoff you're picking:
        </p>
        <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-sm text-gray-200 mb-4">
          Q4_K_M &nbsp; → &nbsp; <span className="text-indigo-300">Q4</span> = 4-bit weights &nbsp;·&nbsp; <span className="text-emerald-300">K</span> = k-quant method &nbsp;·&nbsp; <span className="text-amber-300">M</span> = medium size/quality variant
        </div>
        <p className="text-gray-400 text-sm">Common rule of thumb: <code className="text-indigo-300">Q4_K_M</code> is the sweet spot most people should start with — noticeably smaller than Q8 with minimal perceptible quality loss for chat use cases.</p>
      </section>

      <section id="tradeoff" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Quality vs Size Tradeoff</h2>
        <ul className="list-disc pl-6 text-gray-300 space-y-2">
          <li><strong className="text-white">INT8 is close to free.</strong> Quality loss is usually imperceptible; use it as the default for production serving.</li>
          <li><strong className="text-white">INT4 is where things get interesting.</strong> Great for local/edge use, but reasoning-heavy tasks (math, long chains of logic) degrade more than casual chat.</li>
          <li><strong className="text-white">Always benchmark your actual task.</strong> Aggregate benchmark scores hide task-specific degradation — test quantized models against your real prompts before shipping.</li>
        </ul>
      </section>
    </GuideLayout>
  );
}

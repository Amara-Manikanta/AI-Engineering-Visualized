import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";

/* --------------------------------------------------------------------------
   QLoRA is LoRA with the frozen base quantised to 4-bit. The whole claim is a
   memory claim, so the page computes the memory.
-------------------------------------------------------------------------- */

const MODELS = {
  "7B": 7.0e9,
  "13B": 13.0e9,
  "33B": 33.0e9,
  "70B": 70.6e9,
};

function MemoryStack() {
  const [name, setName] = useState("70B");
  const [nf4, setNf4] = useState(true);
  const [dq, setDq] = useState(true);
  const params = MODELS[name];

  const calc = useMemo(() => {
    // Base weights: 16-bit, or 4-bit under NF4.
    const bitsPerWeight = nf4 ? 4 : 16;
    // Double quantization stores the per-block scale factors in 8-bit and
    // quantises those too, saving about 0.37 bits per parameter.
    const overhead = nf4 ? (dq ? 0.127 : 0.5) : 0;
    const base = (params * (bitsPerWeight + overhead)) / 8;

    // LoRA adapters stay in bf16 and are a rounding error by comparison.
    const adapter = params * 0.002 * 2;
    // Gradients + Adam moments exist only for the adapter.
    const optimiser = params * 0.002 * 8;
    // Activations with gradient checkpointing — roughly constant-ish here.
    const activations = 2e9;

    const total = base + adapter + optimiser + activations;
    const fullFt = params * (2 + 2 + 4 + 4) + activations;
    return { base, adapter, optimiser, activations, total, fullFt };
  }, [params, nf4, dq]);

  const GB = (b) => b / 1e9;
  const parts = [
    ["Base weights", calc.base, "bg-indigo-500/70", "text-indigo-300"],
    ["LoRA adapters", calc.adapter, "bg-emerald-500/70", "text-emerald-300"],
    ["Optimiser state", calc.optimiser, "bg-amber-500/70", "text-amber-300"],
    ["Activations", calc.activations, "bg-purple-500/60", "text-purple-300"],
  ];

  // 48GB is the card the QLoRA paper's headline result is about, so it has
  // to be on this list or the panel appears to contradict the prose above.
  const CARDS = [
    ["RTX 4090 (24GB)", 23],
    ["A100 40GB", 39],
    ["A6000 / L40S (48GB)", 47],
    ["A100 80GB", 78],
  ];

  return (
    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] p-6">
      <h3 className="text-emerald-400 font-bold mb-1">Where the memory actually goes</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        In full fine-tuning the optimiser state is the biggest line. QLoRA removes it almost entirely by freezing
        the base, then shrinks what remains by storing those frozen weights in 4 bits.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Model</span>
          <select
            value={name}
            onChange={(e) => setName(e.target.value)}
            className="w-full mt-2 bg-black/50 border border-white/15 rounded-lg px-3 py-2 text-sm text-gray-200"
          >
            {Object.keys(MODELS).map((k) => (
              <option key={k} value={k}>{k}</option>
            ))}
          </select>
        </label>
        <label className="flex items-center gap-2.5 mt-6 cursor-pointer">
          <input type="checkbox" checked={nf4} onChange={(e) => setNf4(e.target.checked)} className="w-4 h-4 accent-emerald-500" />
          <span className="text-sm text-gray-300">NF4 base (4-bit)</span>
        </label>
        <label className={`flex items-center gap-2.5 mt-6 ${nf4 ? "cursor-pointer" : "opacity-40"}`}>
          <input type="checkbox" checked={dq && nf4} disabled={!nf4} onChange={(e) => setDq(e.target.checked)} className="w-4 h-4 accent-emerald-500" />
          <span className="text-sm text-gray-300">Double quantization</span>
        </label>
      </div>

      <div className="flex h-10 rounded-lg overflow-hidden border border-white/10 bg-black/40 mb-3">
        {parts.map(([label, bytes, bg]) => (
          <div
            key={label}
            className={`${bg} flex items-center justify-center text-[0.625rem] font-mono text-black font-bold transition-all duration-300`}
            style={{ width: `${(bytes / calc.total) * 100}%` }}
          >
            {bytes / calc.total > 0.12 ? label.split(" ")[0] : ""}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {parts.map(([label, bytes, , tone]) => (
          <div key={label} className="p-3 rounded-xl bg-black/40 border border-white/10">
            <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">{label}</div>
            <div className={`text-xl font-bold font-mono ${tone}`}>{GB(bytes).toFixed(1)}</div>
            <div className="text-[0.625rem] text-gray-600">GB</div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/30">
          <div className="text-[0.625rem] uppercase tracking-wide text-emerald-400 mb-1">Training footprint</div>
          <div className="text-3xl font-bold font-mono text-emerald-300">{GB(calc.total).toFixed(1)} GB</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-rose-500/30">
          <div className="text-[0.625rem] uppercase tracking-wide text-rose-400 mb-1">Full fine-tuning would need</div>
          <div className="text-3xl font-bold font-mono text-rose-300">{GB(calc.fullFt).toFixed(0)} GB</div>
        </div>
      </div>

      <div className="flex flex-wrap gap-2">
        {CARDS.map(([n, gb]) => {
          const ok = GB(calc.total) <= gb;
          return (
            <span
              key={n}
              className={`px-3 py-1.5 rounded-lg text-xs font-medium border ${
                ok ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200" : "border-white/10 bg-white/[0.03] text-gray-600"
              }`}
            >
              {ok ? "✓" : "✗"} {n}
            </span>
          );
        })}
      </div>

      <p className="text-xs text-gray-500 mt-4 leading-relaxed">
        These are order-of-magnitude figures — real usage depends on batch size, sequence length and whether
        gradient checkpointing is on. The shape is what matters: untick NF4 and the base line dominates; tick it and
        the whole thing drops onto hardware you can actually buy.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const INNOVATIONS = [
  {
    n: "NF4 — 4-bit NormalFloat",
    d: "A data type whose 16 buckets are placed at the quantiles of a normal distribution, rather than spread evenly. Pretrained weights are approximately normally distributed, so quantile spacing puts precision where the weights actually are. It is information-theoretically optimal for normally distributed data, and measurably better than int4 at the same bit width.",
    box: "border-emerald-500/30 bg-emerald-500/[0.08]",
    tone: "text-emerald-400",
  },
  {
    n: "Double quantization",
    d: "Quantization needs a scale factor per block of weights, and those constants are themselves memory. QLoRA quantises the constants too, saving roughly 0.37 bits per parameter — about 3 GB on a 70B model. Small, but free.",
    box: "border-indigo-500/30 bg-indigo-500/[0.08]",
    tone: "text-indigo-400",
  },
  {
    n: "Paged optimizers",
    d: "Gradient checkpointing produces memory spikes that can kill a run hours in. Paged optimizers use NVIDIA unified memory to page optimiser state out to CPU RAM during a spike and back afterwards, turning a crash into a slowdown.",
    box: "border-amber-500/30 bg-amber-500/[0.08]",
    tone: "text-amber-400",
  },
];

export default function GenAiQlora() {
  const toc = [
    { label: "What QLoRA Adds", hash: "what" },
    { label: "Three Innovations", hash: "innovations" },
    { label: "Memory Breakdown", hash: "memory" },
    { label: "The Dequantise Dance", hash: "dance" },
    { label: "What It Costs", hash: "cost" },
    { label: "In Code", hash: "code" },
    { label: "When to Use It", hash: "when" },
  ];

  return (
    <GuideLayout
      title="QLoRA — Quantized LoRA"
      intro="LoRA with the frozen base compressed to 4 bits. It is what moved fine-tuning a 70B model from a GPU cluster onto a single card."
      toc={toc}
    >
      <section id="what" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">What QLoRA Adds</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          <a href="#/genai/peft/lora" className="text-blue-400 hover:underline">LoRA</a> already removes the
          optimiser state, which is the largest line in a full fine-tune. What it leaves behind is the frozen base
          model itself, sitting in memory at 16 bits per weight. For a 70B model that is still 140 GB, so LoRA alone
          does not put it on one GPU.
        </p>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          QLoRA's observation is that the base is <em>frozen</em>. Nothing is ever written back to it, so it does not
          need the precision that training requires — it only needs to be accurate enough to compute a forward pass
          through. Store it in 4 bits and train the adapters in bf16 on top.
        </p>
        <div className="p-5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.08]">
          <p className="text-sm text-gray-300 leading-relaxed m-0">
            <strong className="text-white">The headline result:</strong> fine-tuning a 65B model on a single 48 GB
            GPU, reaching quality indistinguishable from 16-bit full fine-tuning on the benchmarks tested. The paper
            is the reason "fine-tune a big model at home" stopped being a joke.
          </p>
        </div>
      </section>

      <section id="innovations" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Three Innovations</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          QLoRA is not just "LoRA but 4-bit". Three separate pieces had to work for the quality to survive.
        </p>
        <div className="space-y-4">
          {INNOVATIONS.map((x) => (
            <div key={x.n} className={`p-5 rounded-xl border ${x.box}`}>
              <div className={`font-bold mb-2 ${x.tone}`}>{x.n}</div>
              <p className="text-sm text-gray-300 leading-relaxed m-0">{x.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="memory" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Memory Breakdown</h2>
        <MemoryStack />
      </section>

      <section id="dance" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Dequantise Dance</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          The weights are stored in 4 bits but arithmetic does not happen in 4 bits. Every forward pass
          dequantises each block back to bf16, multiplies, and throws the expanded copy away.
        </p>
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 flex flex-wrap items-center justify-center gap-3 text-xs font-mono mb-5">
          {[
            ["NF4 block in memory", "text-emerald-300 border-emerald-500/40 bg-emerald-900/20"],
            ["dequantise → bf16", "text-amber-300 border-amber-500/40 bg-amber-900/20"],
            ["matmul", "text-indigo-300 border-indigo-500/40 bg-indigo-900/20"],
            ["discard the bf16 copy", "text-gray-400 border-gray-700 bg-black/40"],
          ].map(([label, cls], i) => (
            <React.Fragment key={label}>
              {i > 0 && <span className="text-gray-600">→</span>}
              <span className={`px-3 py-1.5 border rounded-full ${cls}`}>{label}</span>
            </React.Fragment>
          ))}
        </div>
        <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>This is why QLoRA is slower than LoRA.</strong> You are trading compute for memory: roughly 30
            to 50% slower per step, in exchange for the run being possible at all. Only one block is expanded at a
            time, which is what keeps the peak memory at the 4-bit figure rather than the 16-bit one.
          </p>
        </div>
      </section>

      <section id="cost" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">What It Costs</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">What you gain</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>A 4× cut in the largest remaining memory line.</li>
              <li>Large-model fine-tuning on one consumer or prosumer GPU.</li>
              <li>Quality close to 16-bit LoRA in published comparisons.</li>
              <li>Paged optimizers turn out-of-memory crashes into slowdowns.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">What you give up</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Training speed — dequantisation on every forward pass.</li>
              <li>Clean merging: folding a bf16 adapter into a 4-bit base needs care.</li>
              <li>Some quality at the margins on the hardest reasoning tasks.</li>
              <li>A dependency on bitsandbytes and CUDA-specific kernels.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="code" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">In Code</h2>
        <CodeBlock
          language="python"
          code={`from transformers import AutoModelForCausalLM, BitsAndBytesConfig
from peft import LoraConfig, get_peft_model, prepare_model_for_kbit_training
import torch

bnb = BitsAndBytesConfig(
    load_in_4bit=True,
    bnb_4bit_quant_type="nf4",            # quantile buckets, not even spacing
    bnb_4bit_use_double_quant=True,       # quantise the quantisation constants
    bnb_4bit_compute_dtype=torch.bfloat16,  # arithmetic still happens in bf16
)

base = AutoModelForCausalLM.from_pretrained(
    "meta-llama/Llama-3.1-70B", quantization_config=bnb, device_map="auto"
)

# Casts layer norms to fp32 and enables gradient checkpointing — without this
# the 4-bit base and the bf16 adapters disagree about dtypes mid-backward.
base = prepare_model_for_kbit_training(base)

model = get_peft_model(base, LoraConfig(
    r=16, lora_alpha=32, lora_dropout=0.05, bias="none", task_type="CAUSAL_LM",
    target_modules=["q_proj","k_proj","v_proj","o_proj",
                    "gate_proj","up_proj","down_proj"],
))

# optim="paged_adamw_8bit" in your TrainingArguments is the third piece —
# it survives the memory spikes that gradient checkpointing produces.`}
        />
      </section>

      <section id="when" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">When to Use It</h2>
        <div className="p-5 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            The rule is simple: use plain{" "}
            <a href="#/genai/peft/lora" className="text-blue-400 hover:underline">LoRA</a> if the 16-bit base fits in
            your memory, and QLoRA when it does not. You are paying training speed for the run to be possible, so
            there is no reason to pay it when the run was already possible. Compare with{" "}
            <a href="#/genai/quantization" className="text-blue-400 hover:underline">Quantization</a> for what NF4 is
            doing underneath, and{" "}
            <a href="#/genai/peft" className="text-blue-400 hover:underline">the PEFT family</a> for the alternatives.
          </p>
        </div>
      </section>
    </GuideLayout>
  );
}

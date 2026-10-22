import React, { useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section, Segmented } from "../components/VizKit";

export const SEARCH_KEYWORDS = [
  "distributed training", "data parallel", "DDP", "all-reduce", "ZeRO", "ZeRO-1", "ZeRO-2", "ZeRO-3", "FSDP",
  "fully sharded data parallel", "DeepSpeed", "tensor parallel", "pipeline parallel", "pipeline bubble",
  "sequence parallel", "context parallel", "expert parallel", "Megatron-LM", "3D parallelism", "mixed precision",
  "bf16", "fp16", "fp8", "loss scaling", "gradient checkpointing", "activation checkpointing",
  "gradient accumulation", "training memory", "optimizer state memory", "MFU", "training FLOPs", "6ND",
];

/* ---------------------------------------------------------------------------
   Memory per GPU for mixed-precision Adam training, the ZeRO accounting:
   bf16 weights (2 B) + bf16 grads (2 B) + fp32 master weights, momentum and
   variance (4 + 4 + 4 B) = 16 bytes per parameter before activations.
--------------------------------------------------------------------------- */

function MemoryLab() {
  const [params, setParams] = useState(7);
  const [gpus, setGpus] = useState(8);
  const [stage, setStage] = useState("0");
  const [tp, setTp] = useState(1);
  const gpuMem = 80;

  const P = params * 1e9;
  const dp = Math.max(1, Math.floor(gpus / tp)); // data-parallel replicas after tensor parallelism
  const perParam = { w: 2, g: 2, o: 12 };
  const shard = (part) => {
    const s = Number(stage);
    const sharded = (part === "o" && s >= 1) || (part === "g" && s >= 2) || (part === "w" && s >= 3);
    return (P / tp) * perParam[part] / (sharded ? dp : 1) / 1e9;
  };
  const w = shard("w");
  const g = shard("g");
  const o = shard("o");
  const total = w + g + o;
  const fits = total < gpuMem * 0.8; // leave room for activations and buffers

  const bar = (v, c) => <div className="h-full" style={{ width: `${Math.min(100, (v / Math.max(total, gpuMem)) * 100)}%`, background: c }} />;

  return (
    <Panel tone="indigo" title="Will it fit? Memory per GPU for full fine-tuning / training">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-5">
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Slider label="Model size" value={params} min={1} max={405} step={1} onChange={setParams} format={(v) => `${v}B params`} />
            <Slider label="GPUs (80 GB each)" value={gpus} min={1} max={512} step={1} onChange={setGpus} />
            <Slider label="Tensor-parallel degree" value={tp} min={1} max={8} step={1} onChange={setTp} format={(v) => `${v}-way`} />
          </div>
          <div>
            <div className="text-xs uppercase tracking-wide text-gray-500 mb-1.5">Sharding</div>
            <Segmented
              value={stage}
              onChange={setStage}
              options={[
                { v: "0", label: "DDP (none)" },
                { v: "1", label: "ZeRO-1: optimizer" },
                { v: "2", label: "ZeRO-2: + gradients" },
                { v: "3", label: "ZeRO-3 / FSDP: + weights" },
              ]}
            />
          </div>
          <div>
            <div className="flex h-7 rounded-lg overflow-hidden border border-white/10 bg-black/40 relative">
              {bar(w, "#818cf8")}
              {bar(g, "#34d399")}
              {bar(o, "#fbbf24")}
              <div className="absolute top-0 bottom-0 border-r-2 border-dashed border-rose-400" style={{ left: `${Math.min(100, (gpuMem / Math.max(total, gpuMem)) * 100)}%` }} />
            </div>
            <div className="flex flex-wrap gap-x-4 text-[0.6875rem] text-gray-400 mt-1.5">
              <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-indigo-400 mr-1" />weights {w.toFixed(1)} GB</span>
              <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-emerald-400 mr-1" />gradients {g.toFixed(1)} GB</span>
              <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400 mr-1" />Adam states {o.toFixed(1)} GB</span>
              <span className="text-rose-300">┊ 80 GB GPU</span>
            </div>
          </div>
        </div>
        <div className="space-y-2">
          <Metric label="Per GPU, before activations" value={`${total.toFixed(1)} GB`} tone={fits ? "emerald" : "rose"} sub={fits ? "fits, with headroom for activations" : "does not fit — shard more, or add GPUs"} />
          <Metric label="Whole model state" value={`${((P * 16) / 1e9).toFixed(0)} GB`} sub="16 bytes × parameters" />
          <Metric label="Data-parallel replicas" value={dp} sub={`${gpus} GPUs ÷ ${tp}-way tensor parallel`} />
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        A 7B model needs about 112 GB of weights, gradients and Adam state — more than one 80 GB GPU before a single
        activation is stored. Plain data parallelism copies all of it to every GPU, so adding GPUs does not help
        memory at all. ZeRO shards the optimizer state, then gradients, then the weights themselves across the
        data-parallel group; at stage 3 the per-GPU share shrinks roughly in proportion to the number of GPUs.
        Tensor parallelism splits each layer's matrices instead. Activations come on top and depend on batch size
        and sequence length — gradient checkpointing trades recomputation for most of that memory.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Training compute: ≈ 6 · N · D FLOPs (forward + backward), divided by what
   the cluster actually sustains.
--------------------------------------------------------------------------- */

const GPU_TYPES = {
  a100: { label: "A100 (312 TFLOP/s bf16)", peak: 312e12 },
  h100: { label: "H100 (989 TFLOP/s bf16)", peak: 989e12 },
};

function ComputeLab() {
  const [params, setParams] = useState(8);
  const [tokens, setTokens] = useState(15);
  const [gpus, setGpus] = useState(1024);
  const [gpu, setGpu] = useState("h100");
  const [mfu, setMfu] = useState(40);
  const flops = 6 * params * 1e9 * tokens * 1e12;
  const seconds = flops / (gpus * GPU_TYPES[gpu].peak * (mfu / 100));
  const days = seconds / 86400;
  const gpuHours = (seconds * gpus) / 3600;

  return (
    <Panel tone="amber" title="How long does pretraining take?">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        <Slider tone="amber" label="Parameters" value={params} min={1} max={400} onChange={setParams} format={(v) => `${v}B`} />
        <Slider tone="amber" label="Training tokens" value={tokens} min={1} max={40} onChange={setTokens} format={(v) => `${v}T`} />
        <Slider tone="amber" label="GPUs" value={gpus} min={8} max={16384} step={8} onChange={setGpus} />
        <Slider tone="amber" label="Utilisation (MFU)" value={mfu} min={15} max={60} onChange={setMfu} format={(v) => `${v}%`} />
      </div>
      <div className="mb-4">
        <Segmented tone="amber" value={gpu} onChange={setGpu} options={Object.entries(GPU_TYPES).map(([v, g]) => ({ v, label: g.label }))} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
        <Metric label="Total compute" value={`${flops.toExponential(1)} FLOPs`} tone="amber" sub="≈ 6 × params × tokens" />
        <Metric label="Wall-clock" value={days >= 1 ? `${days.toFixed(1)} days` : `${(days * 24).toFixed(1)} hours`} tone="indigo" />
        <Metric label="GPU-hours" value={gpuHours >= 1e6 ? `${(gpuHours / 1e6).toFixed(2)} M` : `${Math.round(gpuHours).toLocaleString()}`} sub="× your $/GPU-hour = the bill" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Each training token costs about 2 FLOPs per parameter forward and 4 backward. Model FLOP utilisation (MFU)
        — the share of the GPUs' peak you actually sustain — is typically 30–50% for large dense models, eaten by
        communication, pipeline bubbles and memory-bound operations. Peak figures are for dense bf16 without
        sparsity; this is an order-of-magnitude estimate, not a quote.
      </p>
    </Panel>
  );
}

export default function GenAiDistributed() {
  const toc = [
    { label: "Why One GPU Is Not Enough", hash: "why" },
    { label: "Memory Lab", hash: "memory" },
    { label: "Data Parallelism", hash: "dp" },
    { label: "ZeRO & FSDP", hash: "zero" },
    { label: "Tensor, Pipeline & More", hash: "model-parallel" },
    { label: "Mixed Precision", hash: "precision" },
    { label: "Saving Memory", hash: "saving" },
    { label: "Compute Lab", hash: "compute" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Distributed Training"
      intro="How models too big for one GPU get trained: the memory arithmetic of Adam, data parallelism, ZeRO and FSDP sharding, tensor and pipeline parallelism, mixed precision, and a back-of-the-envelope for training time."
      toc={toc}
    >
      <Section id="why" title="Why One GPU Is Not Enough" lead="Training needs far more memory than inference. For every parameter you store the weight, its gradient, and two optimizer statistics — plus the activations of every layer for the backward pass.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Memory" tone="rose"><p>Model state for mixed-precision Adam is about 16 bytes per parameter. A 70B model needs over a terabyte before activations.</p></Card>
          <Card title="Time" tone="amber"><p>Pretraining uses around 10²³–10²⁵ FLOPs. One GPU would take centuries; thousands take weeks.</p></Card>
          <Card title="Communication" tone="indigo"><p>Splitting the work means GPUs must exchange gradients or activations every step. Fast interconnects (NVLink within a node, InfiniBand between nodes) decide how well it scales.</p></Card>
        </div>
      </Section>

      <Section id="memory" title="Memory Lab">
        <MemoryLab />
      </Section>

      <Section id="dp" title="Data Parallelism" lead="The simplest scaling: every GPU holds a full copy of the model and processes a different slice of each batch.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="1. Forward & backward" tone="indigo"><p>Each GPU computes gradients on its own micro-batch.</p></Card>
          <Card title="2. All-reduce" tone="emerald"><p>Gradients are averaged across GPUs so every copy sees the same update. PyTorch DDP overlaps this with the backward pass.</p></Card>
          <Card title="3. Identical step" tone="amber"><p>Every GPU applies the same update and stays in sync. Throughput scales well; memory does not improve at all.</p></Card>
        </div>
      </Section>

      <Section id="zero" title="ZeRO & FSDP" lead="Data parallelism wastes memory by storing the same optimizer state, gradients and weights on every GPU. ZeRO (DeepSpeed) and FSDP (PyTorch) shard them instead.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <Card title="Stage 1" tone="amber"><p>Shard the optimizer state — the biggest part (12 of the 16 bytes per parameter).</p></Card>
          <Card title="Stage 2" tone="emerald"><p>Also shard gradients: each GPU keeps only the gradients for the parameters whose optimizer state it owns.</p></Card>
          <Card title="Stage 3 / FSDP" tone="indigo"><p>Also shard the weights. Each layer's weights are gathered just before use and freed right after — more communication, near-linear memory scaling.</p></Card>
        </div>
        <Note tone="indigo">
          ZeRO-Offload and FSDP CPU offload push optimizer state to CPU RAM (or NVMe), letting one GPU fine-tune a
          much larger model, slowly. For fine-tuning on a budget, <a href="#/genai/peft" className="text-blue-400 hover:underline">PEFT / LoRA</a> removes most of the optimizer state instead.
        </Note>
      </Section>

      <Section id="model-parallel" title="Tensor, Pipeline & More" lead="When even one layer's activations or the per-GPU compute is too much, split the model itself. Large runs combine several of these (3D or 4D parallelism).">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Tensor parallelism" tone="indigo"><p>Split each weight matrix across GPUs; each computes part of every matrix multiply, then they combine results. Needs very fast links, so it usually stays within one node (Megatron-LM).</p></Card>
          <Card title="Pipeline parallelism" tone="purple"><p>Put different layers on different GPUs and stream micro-batches through like an assembly line. The start-up and drain idle time is the "pipeline bubble"; more micro-batches shrink it.</p></Card>
          <Card title="Sequence / context parallelism" tone="emerald"><p>Split long sequences across GPUs so million-token contexts fit; attention needs special handling (ring attention) to see the whole sequence.</p></Card>
          <Card title="Expert parallelism" tone="amber"><p>For <a href="#/llms/types#moe" className="text-blue-400 hover:underline">mixture-of-experts</a> models, place different experts on different GPUs and route tokens to them — an all-to-all exchange each layer.</p></Card>
        </div>
      </Section>

      <Section id="precision" title="Mixed Precision">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="bf16 compute" tone="indigo"><p>Matrix multiplies run in 16-bit brain-float, which has fp32's exponent range — no loss scaling needed. The standard for LLM training.</p></Card>
          <Card title="fp32 master weights" tone="emerald"><p>Updates are accumulated into a 32-bit copy of the weights, because tiny updates vanish when added to 16-bit numbers.</p></Card>
          <Card title="fp16 and fp8" tone="amber"><p>fp16 has a narrow range and needs loss scaling to avoid underflow. fp8 training (on recent GPUs) roughly doubles throughput again with careful per-tensor scaling.</p></Card>
        </div>
      </Section>

      <Section id="saving" title="Saving Memory">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Gradient checkpointing" tone="purple"><p>Keep only some layers' activations and recompute the rest during the backward pass: roughly 30% more compute for a large cut in activation memory.</p></Card>
          <Card title="Gradient accumulation" tone="emerald"><p>Run several small micro-batches and add their gradients before stepping, to reach a large effective batch size.</p></Card>
          <Card title="Efficient kernels" tone="indigo"><p>FlashAttention avoids materialising the full attention matrix, so memory grows linearly with sequence length. See <a href="#/genai/serving" className="text-blue-400 hover:underline">the Serving Stack</a>.</p></Card>
        </div>
      </Section>

      <Section id="compute" title="Compute Lab">
        <ComputeLab />
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`# PyTorch FSDP2 (fully_shard) — launch with: torchrun --nproc_per_node=8 train.py
import torch, torch.distributed as dist
from torch.distributed.fsdp import fully_shard, MixedPrecisionPolicy

dist.init_process_group("nccl")
torch.cuda.set_device(dist.get_rank() % torch.cuda.device_count())

model = build_model()
mp = MixedPrecisionPolicy(param_dtype=torch.bfloat16, reduce_dtype=torch.float32)
for block in model.layers:                 # shard each transformer block…
    fully_shard(block, mp_policy=mp)
fully_shard(model, mp_policy=mp)           # …then the root

# Hugging Face models: model.gradient_checkpointing_enable() trades compute for activation memory
opt = torch.optim.AdamW(model.parameters(), lr=3e-4, weight_decay=0.1)

for batch in loader:
    loss = model(**batch).loss
    loss.backward()
    torch.nn.utils.clip_grad_norm_(model.parameters(), 1.0)
    opt.step(); opt.zero_grad()

# With Hugging Face Accelerate or DeepSpeed, the same idea is a config file:
#   deepspeed --num_gpus 8 train.py --deepspeed ds_zero3.json`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("genai-distributed")} />
    </GuideLayout>
  );
}

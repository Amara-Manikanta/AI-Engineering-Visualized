import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section, Segmented } from "../components/VizKit";

export const SEARCH_KEYWORDS = [
  "model merging", "mergekit", "task vectors", "task arithmetic", "linear merge", "model soup", "SLERP",
  "TIES-merging", "DARE", "sign conflict", "catastrophic forgetting", "continual learning", "EWC",
  "elastic weight consolidation", "replay", "rehearsal", "LoRA forgetting", "negation", "forgetting a task",
];

/* ---------------------------------------------------------------------------
   Task vectors: fine-tuned weights minus base weights. Two toy task vectors
   over 10 parameters, merged four ways. Everything is computed.
--------------------------------------------------------------------------- */

const TV_A = [0.9, -0.22, 0.7, -0.18, -0.8, 0.2, 0.6, -0.15, 0.12, -0.1];
const TV_B = [-0.2, 0.8, -0.15, 0.9, 0.18, -0.7, -0.12, 0.6, -0.1, 0.14];

function ties(vs, keep, lambda) {
  const n = vs[0].length;
  // 1. trim: keep only the top `keep` fraction of each vector by magnitude
  const trimmed = vs.map((v) => {
    const cut = [...v].map(Math.abs).sort((a, b) => b - a)[Math.max(0, Math.ceil(keep * n) - 1)];
    return v.map((x) => (Math.abs(x) >= cut ? x : 0));
  });
  // 2. elect a sign per parameter by total mass; 3. average only the agreeing values
  return Array.from({ length: n }, (_, i) => {
    const sum = trimmed.reduce((s, v) => s + v[i], 0);
    const sign = Math.sign(sum);
    const agree = trimmed.map((v) => v[i]).filter((x) => x !== 0 && Math.sign(x) === sign);
    return agree.length ? (lambda * agree.reduce((a, b) => a + b, 0)) / agree.length : 0;
  });
}

function merge(method, lambda, keep) {
  if (method === "average") return TV_A.map((a, i) => (a + TV_B[i]) / 2);
  if (method === "arith") return TV_A.map((a, i) => lambda * (a + TV_B[i]));
  return ties([TV_A, TV_B], keep, lambda);
}

// How much of each task's vector survives in the merge: projection / own norm².
const retained = (m, v) => m.reduce((s, x, i) => s + x * v[i], 0) / v.reduce((s, x) => s + x * x, 0);

function MergeLab() {
  const [method, setMethod] = useState("ties");
  const [lambda, setLambda] = useState(1);
  const [keep, setKeep] = useState(0.5);
  const m = useMemo(() => merge(method, lambda, keep), [method, lambda, keep]);
  // Shade parameters where both tasks push noticeably in opposite directions.
  const conflicts = TV_A.map((a, i) => Math.sign(a) !== Math.sign(TV_B[i]) && Math.abs(a) > 0.15 && Math.abs(TV_B[i]) > 0.15);
  const W = 360;
  const H = 180;
  const bw = (W - 20) / TV_A.length;
  const y0 = H / 2;
  const sy = (v) => v * 70;

  return (
    <Panel tone="purple" title="Merge two task vectors — and watch interference">
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <Segmented
          tone="purple"
          value={method}
          onChange={setMethod}
          options={[
            { v: "average", label: "Average" },
            { v: "arith", label: "Task arithmetic" },
            { v: "ties", label: "TIES" },
          ]}
        />
        {method !== "average" && <div className="w-40"><Slider tone="purple" label="scale λ" value={lambda} min={0.3} max={1.5} step={0.05} onChange={setLambda} format={(v) => v.toFixed(2)} /></div>}
        {method === "ties" && <div className="w-40"><Slider tone="purple" label="keep top" value={keep} min={0.1} max={1} step={0.1} onChange={setKeep} format={(v) => `${Math.round(v * 100)}%`} /></div>}
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px] gap-5">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          <line x1="10" y1={y0} x2={W - 10} y2={y0} stroke="rgba(255,255,255,0.2)" />
          {TV_A.map((a, i) => {
            const x = 10 + i * bw;
            const b = TV_B[i];
            return (
              <g key={i}>
                {conflicts[i] && <rect x={x} y="4" width={bw} height={H - 8} fill="rgba(251,113,133,0.08)" />}
                <rect x={x + 2} y={a > 0 ? y0 - sy(a) : y0} width={bw / 3 - 2} height={Math.abs(sy(a))} fill="#60a5fa" opacity="0.75" />
                <rect x={x + bw / 3 + 1} y={b > 0 ? y0 - sy(b) : y0} width={bw / 3 - 2} height={Math.abs(sy(b))} fill="#fbbf24" opacity="0.75" />
                <rect x={x + (2 * bw) / 3} y={m[i] > 0 ? y0 - sy(m[i]) : y0} width={bw / 3 - 2} height={Math.abs(sy(m[i]))} fill="#c084fc" />
              </g>
            );
          })}
        </svg>
        <div className="space-y-2">
          <div className="flex flex-wrap gap-x-3 text-[0.6875rem] text-gray-400">
            <span><span className="inline-block w-2.5 h-2.5 bg-blue-400 mr-1" />task A</span>
            <span><span className="inline-block w-2.5 h-2.5 bg-amber-400 mr-1" />task B</span>
            <span><span className="inline-block w-2.5 h-2.5 bg-purple-400 mr-1" />merged</span>
            <span><span className="inline-block w-2.5 h-2.5 bg-rose-400/30 mr-1" />sign conflict</span>
          </div>
          <Metric label="Task A retained" value={`${Math.round(retained(m, TV_A) * 100)}%`} tone="indigo" />
          <Metric label="Task B retained" value={`${Math.round(retained(m, TV_B) * 100)}%`} tone="amber" />
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Each bar group is one parameter. A task vector is fine-tuned weights minus base weights. Each task made a
        few large, important changes plus many small incidental ones — and the small ones often point against the
        other task's important changes (shaded). Plain averaging halves both tasks everywhere and lets that noise
        eat into the signal. Task arithmetic
        adds them with a scale. TIES first trims each vector to its largest changes, elects one sign per parameter,
        and averages only the values that agree — so small, noisy updates and conflicts stop dragging the important
        ones toward zero. "Retained" is how much of each task's direction survives (100% = fully kept).
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Catastrophic forgetting on a 2-parameter model. Task A cares a lot about
   w1; task B cares a lot about w2. Train on B starting from A's optimum,
   with and without an EWC penalty anchored at A.
--------------------------------------------------------------------------- */

const A_OPT = [2, 0];
const lossA = ([w1, w2]) => 4 * (w1 - 2) ** 2 + 0.2 * (w2 - 0) ** 2;
const lossB = ([w1, w2]) => 0.5 * (w1 + 1) ** 2 + 4 * (w2 - 2.5) ** 2;
const FISHER = [8, 0.4]; // curvature of loss A: how much each weight matters for A

function trainB(ewc, steps = 250, lr = 0.02) {
  let w = [...A_OPT];
  const path = [w];
  for (let t = 0; t < steps; t++) {
    const g = [1.0 * (w[0] + 1), 8 * (w[1] - 2.5)];
    if (ewc) {
      g[0] += ewc * FISHER[0] * (w[0] - A_OPT[0]);
      g[1] += ewc * FISHER[1] * (w[1] - A_OPT[1]);
    }
    w = [w[0] - lr * g[0], w[1] - lr * g[1]];
    if (t % 5 === 0) path.push(w);
  }
  path.push(w);
  return { w, path };
}

function ForgettingLab() {
  const [ewc, setEwc] = useState(0);
  const res = useMemo(() => trainB(ewc), [ewc]);
  const S = 300;
  const x = (v) => 20 + ((v + 2) / 5) * (S - 30);
  const y = (v) => S - 20 - ((v + 0.5) / 3.5) * (S - 30);
  return (
    <Panel tone="rose" title="Fine-tune on task B and task A is forgotten — unless you protect what A needs">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_250px] gap-5">
        <svg viewBox={`0 0 ${S} ${S}`} className="w-full max-w-sm h-auto block rounded-lg bg-black/30 border border-white/10">
          {[0.5, 2, 5, 10].map((lvl) => (
            <ellipse key={`a${lvl}`} cx={x(2)} cy={y(0)} rx={x(2 + Math.sqrt(lvl / 4)) - x(2)} ry={y(0) - y(Math.sqrt(lvl / 0.2))} fill="none" stroke="rgba(96,165,250,0.35)" />
          ))}
          {[0.5, 2, 5, 10].map((lvl) => (
            <ellipse key={`b${lvl}`} cx={x(-1)} cy={y(2.5)} rx={x(-1 + Math.sqrt(lvl / 0.5)) - x(-1)} ry={y(2.5) - y(2.5 + Math.sqrt(lvl / 4))} fill="none" stroke="rgba(251,191,36,0.35)" />
          ))}
          <path d={res.path.map(([a, b], i) => `${i ? "L" : "M"}${x(a).toFixed(1)},${y(b).toFixed(1)}`).join("")} fill="none" stroke="#f472b6" strokeWidth="2" />
          <circle cx={x(2)} cy={y(0)} r="4" fill="#60a5fa" />
          <circle cx={x(-1)} cy={y(2.5)} r="4" fill="#fbbf24" />
          <circle cx={x(res.w[0])} cy={y(res.w[1])} r="5" fill="#f472b6" stroke="#fff" />
          <text x={x(2) + 6} y={y(0) + 4} fill="#60a5fa" fontSize="10">A's optimum</text>
          <text x={x(-1) + 6} y={y(2.5) - 6} fill="#fbbf24" fontSize="10">B's optimum</text>
          <text x="22" y={S - 6} fill="#6b7280" fontSize="10">w₁ →  (A cares a lot)</text>
          <text x="6" y="14" fill="#6b7280" fontSize="10">w₂ ↑ (B cares a lot)</text>
        </svg>
        <div className="space-y-3">
          <Slider tone="rose" label="EWC penalty strength" value={ewc} min={0} max={2} step={0.05} onChange={setEwc} format={(v) => v.toFixed(2)} />
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Loss on A" value={lossA(res.w).toFixed(2)} tone={lossA(res.w) > 2 ? "rose" : "emerald"} sub="was 0.00" />
            <Metric label="Loss on B" value={lossB(res.w).toFixed(2)} tone="amber" sub={`was ${lossB(A_OPT).toFixed(1)}`} />
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Blue rings are task A's loss, yellow are task B's. Starting from A's optimum and training only on B, the
        weights slide all the way to B's optimum and A's loss explodes — catastrophic forgetting. Elastic weight
        consolidation adds a penalty for moving each weight, scaled by how much A depended on it. A needs w₁ and
        barely cares about w₂, so with the penalty on, training keeps w₁ near A's value and still moves w₂ freely:
        both losses end up low.
      </p>
    </Panel>
  );
}

export default function GenAiMerging() {
  const toc = [
    { label: "Why Merge Models", hash: "why" },
    { label: "Task Vectors", hash: "vectors" },
    { label: "Merge Lab", hash: "lab" },
    { label: "Merge Methods", hash: "methods" },
    { label: "Catastrophic Forgetting", hash: "forgetting" },
    { label: "Avoiding Forgetting", hash: "avoid" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Model Merging & Catastrophic Forgetting"
      intro="Combining fine-tuned models by doing arithmetic on their weights — task vectors, TIES, DARE and SLERP — and the flip side: why fine-tuning on something new erases what a model knew, and how to prevent it."
      toc={toc}
    >
      <Section id="why" title="Why Merge Models" lead="You have one model fine-tuned for maths and another for coding. Training a third on both datasets is expensive. Merging combines their weights directly, with no training and no data.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Combine skills" tone="purple"><p>Merge specialists that share a base model into one that does several tasks reasonably well.</p></Card>
          <Card title="Robustness" tone="emerald"><p>“Model soups” — averaging several fine-tunes of the same model with different hyperparameters — often beat the best single run.</p></Card>
          <Card title="Cheap experiments" tone="amber"><p>A merge takes minutes on a CPU. Many strong open models on public leaderboards are merges.</p></Card>
        </div>
      </Section>

      <Section id="vectors" title="Task Vectors" lead="Fine-tuning moves the weights from θ_base to θ_task. The difference τ = θ_task − θ_base is a task vector, and it behaves surprisingly like a direction in skill space.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Add" tone="emerald"><p>θ_base + τ_maths + τ_code gives a model with both skills (to a degree).</p></Card>
          <Card title="Scale" tone="indigo"><p>θ_base + λτ turns a skill up or down; λ is tuned on a validation set.</p></Card>
          <Card title="Subtract" tone="rose"><p>θ_base − τ_toxic reduces a behaviour learned from a toxic fine-tune — “forgetting by negation”.</p></Card>
        </div>
        <Note tone="amber">All of this assumes the models share the same base and architecture. Merging unrelated models does not work.</Note>
      </Section>

      <Section id="lab" title="Merge Lab" lead="Two toy task vectors over ten parameters, merged in your browser.">
        <MergeLab />
      </Section>

      <Section id="methods" title="Merge Methods">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Linear / model soup" tone="indigo"><p>A weighted average of the weights. Simple and effective for fine-tunes of one model on similar data.</p></Card>
          <Card title="SLERP" tone="purple"><p>Spherical interpolation between two models, following the arc between weight vectors instead of the straight line, which preserves their norm. Limited to two models at a time.</p></Card>
          <Card title="TIES" tone="emerald"><p>Trim small changes, elect a sign per parameter, merge only agreeing values. Reduces interference when merging several task vectors.</p></Card>
          <Card title="DARE" tone="amber"><p>Randomly drop most of each task vector's entries (often 90%) and rescale the rest. Fine-tuning deltas are highly redundant, so little is lost and conflicts shrink; often combined with TIES.</p></Card>
        </div>
      </Section>

      <Section id="forgetting" title="Catastrophic Forgetting" lead="Neural networks store everything in the same shared weights. Train on a new task, and the gradient happily overwrites whatever the old task relied on.">
        <ForgettingLab />
      </Section>

      <Section id="avoid" title="Avoiding Forgetting">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Replay" tone="emerald"><p>Mix a slice of the original or general data into the new fine-tuning set. The simplest and most reliable fix.</p></Card>
          <Card title="PEFT / LoRA" tone="indigo"><p>Freeze the base and train small adapters. The base knowledge is untouched, and adapters can be swapped per task. See <a href="#/genai/peft" className="text-blue-400 hover:underline">PEFT</a>.</p></Card>
          <Card title="Regularise toward the original" tone="rose"><p>EWC-style penalties, or the KL penalty in RLHF, keep the new model close to the old one where it matters.</p></Card>
          <Card title="Low learning rate, few epochs" tone="amber"><p>Aggressive fine-tuning forgets more. Evaluate general capability before and after — not only the new task.</p></Card>
        </div>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="yaml"
          code={`# mergekit config: TIES-merge two fine-tunes of the same base model
# run with:  mergekit-yaml ties.yml ./merged-model
merge_method: ties
base_model: org/base-7b
models:
  - model: org/base-7b-maths
    parameters: { density: 0.5, weight: 1.0 }   # keep top 50% of changes
  - model: org/base-7b-code
    parameters: { density: 0.5, weight: 1.0 }
parameters:
  normalize: true
dtype: bfloat16`}
        />
        <p className="text-xs text-gray-500 mt-2">Always evaluate a merge on every task you care about: gains on one can hide losses on another.</p>
      </Section>

      <KnowledgeCheck questions={questionsFor("genai-merging")} />
    </GuideLayout>
  );
}

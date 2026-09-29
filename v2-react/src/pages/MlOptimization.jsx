import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Card, Note, Section, Segmented } from "../components/VizKit";

export const SEARCH_KEYWORDS = [
  "optimization", "optimisation", "optimizer", "gradient descent", "stochastic gradient descent", "SGD",
  "mini-batch", "momentum", "Nesterov", "RMSProp", "Adam", "AdamW", "learning rate", "learning rate schedule",
  "warmup", "cosine decay", "step decay", "loss landscape", "saddle point", "local minimum", "ill-conditioned",
  "Rosenbrock", "gradient clipping", "batch size", "convergence", "divergence",
];

/* ---------------------------------------------------------------------------
   Two loss surfaces with analytic gradients, and four optimisers run on them
   step by step. Nothing here is precomputed.
--------------------------------------------------------------------------- */

const SURFACES = {
  ravine: {
    label: "Narrow ravine",
    f: (x, y) => 0.5 * (0.1 * x * x + 3 * y * y),
    g: (x, y) => [0.1 * x, 3 * y],
    start: [-4.5, 1.6],
    x: [-5, 5],
    y: [-2.5, 2.5],
    min: [0, 0],
    lr: -1, // log10 of the default learning rate
    steps: 80,
  },
  rosen: {
    label: "Rosenbrock banana",
    f: (x, y) => (1 - x) ** 2 + 100 * (y - x * x) ** 2,
    g: (x, y) => [-2 * (1 - x) - 400 * x * (y - x * x), 200 * (y - x * x)],
    start: [-1.2, 1],
    x: [-2, 2],
    y: [-0.8, 2.2],
    min: [1, 1],
    lr: -2.5,
    steps: 200,
  },
};

const OPTIMISERS = [
  { id: "sgd", label: "Gradient descent", color: "#e5e7eb" },
  { id: "momentum", label: "Momentum (β = 0.9)", color: "#fbbf24" },
  { id: "rmsprop", label: "RMSProp", color: "#34d399" },
  { id: "adam", label: "Adam", color: "#f472b6" },
];

function run(surface, id, lr, steps) {
  let [x, y] = surface.start;
  let vx = 0, vy = 0, sx = 0, sy = 0, mx = 0, my = 0;
  const path = [[x, y]];
  const b1 = 0.9, b2 = 0.999, rho = 0.9, eps = 1e-8;
  for (let t = 1; t <= steps; t++) {
    const [gx, gy] = surface.g(x, y);
    if (id === "sgd") {
      x -= lr * gx;
      y -= lr * gy;
    } else if (id === "momentum") {
      vx = 0.9 * vx + gx;
      vy = 0.9 * vy + gy;
      x -= lr * vx;
      y -= lr * vy;
    } else if (id === "rmsprop") {
      sx = rho * sx + (1 - rho) * gx * gx;
      sy = rho * sy + (1 - rho) * gy * gy;
      x -= (lr * gx) / (Math.sqrt(sx) + eps);
      y -= (lr * gy) / (Math.sqrt(sy) + eps);
    } else {
      mx = b1 * mx + (1 - b1) * gx;
      my = b1 * my + (1 - b1) * gy;
      sx = b2 * sx + (1 - b2) * gx * gx;
      sy = b2 * sy + (1 - b2) * gy * gy;
      const mhx = mx / (1 - b1 ** t), mhy = my / (1 - b1 ** t);
      const vhx = sx / (1 - b2 ** t), vhy = sy / (1 - b2 ** t);
      x -= (lr * mhx) / (Math.sqrt(vhx) + eps);
      y -= (lr * mhy) / (Math.sqrt(vhy) + eps);
    }
    if (!Number.isFinite(x) || !Number.isFinite(y) || Math.abs(x) > 1e6 || Math.abs(y) > 1e6) {
      return { path, diverged: true, loss: Infinity };
    }
    path.push([x, y]);
  }
  return { path, diverged: false, loss: surface.f(x, y) };
}

function Landscape() {
  const [which, setWhich] = useState("ravine");
  const surface = SURFACES[which];
  const [logLr, setLogLr] = useState(surface.lr);
  const [steps, setSteps] = useState(surface.steps);
  const [on, setOn] = useState({ sgd: true, momentum: true, rmsprop: false, adam: true });
  const lr = 10 ** logLr;

  const W = 360;
  const H = 240;
  const px = (x) => ((x - surface.x[0]) / (surface.x[1] - surface.x[0])) * W;
  const py = (y) => H - ((y - surface.y[0]) / (surface.y[1] - surface.y[0])) * H;

  const heat = useMemo(() => {
    const n = 48;
    const cells = [];
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const x = surface.x[0] + ((i + 0.5) / n) * (surface.x[1] - surface.x[0]);
        const y = surface.y[0] + ((j + 0.5) / n) * (surface.y[1] - surface.y[0]);
        const v = Math.log(1 + surface.f(x, y));
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
        cells.push({ i, j, v });
      }
    return { n, cells, lo, hi };
  }, [surface]);

  const runs = OPTIMISERS.filter((o) => on[o.id]).map((o) => ({ ...o, ...run(surface, o.id, lr, steps) }));
  const cw = W / heat.n;
  const ch = H / heat.n;

  return (
    <Panel tone="indigo" title="Four optimisers, one starting point">
      <div className="flex flex-wrap items-end gap-4 mb-4">
        <Segmented
          value={which}
          onChange={(v) => {
            setWhich(v);
            setLogLr(SURFACES[v].lr);
            setSteps(SURFACES[v].steps);
          }}
          options={Object.entries(SURFACES).map(([v, s]) => ({ v, label: s.label }))}
        />
        <div className="flex flex-wrap gap-1.5">
          {OPTIMISERS.map((o) => (
            <button
              key={o.id}
              onClick={() => setOn((s) => ({ ...s, [o.id]: !s[o.id] }))}
              aria-pressed={on[o.id]}
              className={`px-2.5 py-1 rounded-lg text-xs border transition-colors ${on[o.id] ? "border-white/30 bg-white/10 text-white" : "border-white/10 text-gray-500"}`}
            >
              <span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: o.color }} />
              {o.label}
            </button>
          ))}
        </div>
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_250px] gap-5">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block rounded-lg border border-white/10">
          {heat.cells.map((c) => {
            const t = (c.v - heat.lo) / (heat.hi - heat.lo || 1);
            return <rect key={`${c.i}-${c.j}`} x={c.i * cw} y={H - (c.j + 1) * ch} width={cw + 0.4} height={ch + 0.4} fill={`hsl(${240 - t * 200}, 55%, ${10 + t * 30}%)`} />;
          })}
          <circle cx={px(surface.min[0])} cy={py(surface.min[1])} r="5" fill="none" stroke="#fff" strokeWidth="1.5" />
          {runs.map((r) => (
            <g key={r.id}>
              <path d={r.path.map(([x, y], i) => `${i ? "L" : "M"}${px(x).toFixed(1)},${py(y).toFixed(1)}`).join("")} fill="none" stroke={r.color} strokeWidth="1.8" strokeOpacity="0.9" />
              {!r.diverged && <circle cx={px(r.path.at(-1)[0])} cy={py(r.path.at(-1)[1])} r="3.5" fill={r.color} />}
            </g>
          ))}
          <circle cx={px(surface.start[0])} cy={py(surface.start[1])} r="4" fill="#fff" />
        </svg>
        <div className="space-y-3">
          <Slider label="Learning rate" value={logLr} min={-4} max={0} step={0.1} onChange={setLogLr} format={(v) => (10 ** v).toPrecision(2)} />
          <Slider label="Steps" value={steps} min={10} max={300} step={10} onChange={setSteps} />
          <div className="space-y-1.5">
            {runs.map((r) => (
              <div key={r.id} className="flex items-center justify-between text-xs font-mono">
                <span className="flex items-center gap-1.5 text-gray-300">
                  <span className="w-2 h-2 rounded-full" style={{ background: r.color }} />
                  {r.label.split(" (")[0]}
                </span>
                <span className={r.diverged ? "text-rose-400" : "text-gray-300"}>{r.diverged ? "diverged" : `loss ${r.loss < 1e-3 ? r.loss.toExponential(1) : r.loss.toFixed(3)}`}</span>
              </div>
            ))}
          </div>
          <p className="text-[0.6875rem] text-gray-500 leading-relaxed m-0">White dot: start. White ring: the minimum. Darker is lower loss (log scale).</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        On the ravine, plain gradient descent zig-zags across the steep direction while barely moving along the
        shallow one — raise the learning rate to speed it up and it starts bouncing, then diverges. Momentum
        accumulates velocity along the consistent direction and damps the zig-zag. Adam and RMSProp divide each
        coordinate's step by its recent gradient size, so steep and shallow directions move at similar speeds.
        On the Rosenbrock banana (a classic test function), dropping into the curved valley is easy; following it
        to (1, 1) is the hard part. With the defaults, momentum gets there while gradient descent is still crawling
        along the valley floor. Adam barely moves: its steps are roughly the learning rate in size, so a rate tuned
        for plain gradient descent is far too small for it. Raise the rate to 0.1 and it travels much further — a
        reminder that learning rates do not transfer between optimisers.
      </p>
    </Panel>
  );
}

/* ------------------------------------------------------------ schedules */

function Schedules() {
  const [warm, setWarm] = useState(10);
  const total = 100;
  const base = 1;
  const kinds = {
    constant: () => base,
    step: (t) => base * 0.3 ** Math.floor(t / 35),
    cosine: (t) => base * 0.5 * (1 + Math.cos((Math.PI * t) / total)),
    warmupCosine: (t) => (t < warm ? (base * (t + 1)) / warm : base * 0.5 * (1 + Math.cos((Math.PI * (t - warm)) / Math.max(1, total - warm)))),
  };
  const colors = { constant: "#6b7280", step: "#60a5fa", cosine: "#34d399", warmupCosine: "#f472b6" };
  const labels = { constant: "constant", step: "step decay", cosine: "cosine", warmupCosine: "linear warmup + cosine" };
  const W = 360;
  const H = 160;
  const x = (t) => 10 + (t / total) * (W - 20);
  const y = (v) => H - 16 - v * (H - 30);
  return (
    <Panel tone="emerald" title="Learning-rate schedules">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_250px] gap-5">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          <line x1="10" y1={y(0)} x2={W - 10} y2={y(0)} stroke="rgba(255,255,255,0.15)" />
          {Object.entries(kinds).map(([k, f]) => (
            <path key={k} d={Array.from({ length: total + 1 }, (_, t) => `${t ? "L" : "M"}${x(t).toFixed(1)},${y(f(t)).toFixed(1)}`).join("")} fill="none" stroke={colors[k]} strokeWidth="2" />
          ))}
          <text x="10" y={H - 2} fill="#6b7280" fontSize="10">step 0</text>
          <text x={W - 10} y={H - 2} fill="#6b7280" fontSize="10" textAnchor="end">end of training</text>
        </svg>
        <div className="space-y-3">
          <Slider tone="emerald" label="Warmup steps" value={warm} min={1} max={40} onChange={setWarm} format={(v) => `${v}%`} />
          {Object.keys(kinds).map((k) => (
            <div key={k} className="flex items-center gap-2 text-xs text-gray-300">
              <span className="w-3 h-0.5" style={{ background: colors[k] }} />
              {labels[k]}
            </div>
          ))}
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Early in training, large steps make fast progress; late in training, smaller steps let the model settle into
        a minimum instead of bouncing around it. Warmup starts tiny because Adam's variance estimates and a freshly
        initialised network's gradients are unreliable in the first steps — a large learning rate there can blow
        training up. Linear warmup followed by cosine decay is the standard recipe for transformers.
      </p>
    </Panel>
  );
}

export default function MlOptimization() {
  const toc = [
    { label: "The Update Rule", hash: "rule" },
    { label: "Loss Landscape Lab", hash: "lab" },
    { label: "The Optimisers", hash: "optimisers" },
    { label: "Learning Rate Schedules", hash: "schedules" },
    { label: "Batch Size & Noise", hash: "batch" },
    { label: "When Training Goes Wrong", hash: "debug" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Optimisation: Gradient Descent to Adam"
      intro="How models actually learn: follow the gradient downhill. Watch plain gradient descent, momentum, RMSProp and Adam race on real loss surfaces, and see why learning-rate schedules and warmup matter."
      toc={toc}
    >
      <Section id="rule" title="The Update Rule" lead="Every optimiser here is a variation on one line: move the weights a small step against the gradient of the loss.">
        <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-sm text-gray-200 text-center mb-5">
          w ← w − η · ∇L(w)
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="The gradient ∇L" tone="indigo"><p>Points uphill — the direction in which the loss grows fastest. <a href="#/ml/deep-learning" className="text-blue-400 hover:underline">Backpropagation</a> computes it for every weight at once.</p></Card>
          <Card title="The learning rate η" tone="amber"><p>How far to step. Too small and training crawls; too large and it overshoots, oscillates or diverges. The single most important hyperparameter.</p></Card>
          <Card title="Stochastic" tone="emerald"><p>The true gradient averages over all data. SGD estimates it from a mini-batch — noisy, but far cheaper per step, and the noise helps escape poor regions.</p></Card>
        </div>
      </Section>

      <Section id="lab" title="Loss Landscape Lab" lead="Each path is computed step by step from the analytic gradient. Toggle optimisers and change the learning rate.">
        <Landscape />
      </Section>

      <Section id="optimisers" title="The Optimisers">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="SGD" tone="indigo"><p>w ← w − η g. Simple and, with a good schedule and momentum, still competitive for vision models — it often generalises slightly better than adaptive methods there.</p></Card>
          <Card title="Momentum / Nesterov" tone="amber"><p>v ← βv + g; w ← w − ηv. A running sum of gradients: consistent directions accelerate, oscillating ones cancel. Nesterov evaluates the gradient at the look-ahead point.</p></Card>
          <Card title="RMSProp" tone="emerald"><p>Divides each coordinate's step by a running RMS of its gradients, so parameters with large gradients take smaller steps. The first practical per-parameter adaptive method.</p></Card>
          <Card title="Adam & AdamW" tone="rose"><p>Momentum plus RMSProp scaling, with bias correction for the first steps. The default for transformers. AdamW applies weight decay directly to the weights rather than through the gradient, which regularises properly with adaptive steps.</p></Card>
        </div>
        <Note tone="indigo">
          Adam keeps two extra numbers per parameter, so optimiser state is about twice the size of the model in
          fp32 — a large part of why training needs far more memory than inference. See{" "}
          <a href="#/genai/distributed-training" className="text-blue-400 hover:underline">Distributed Training</a>.
        </Note>
      </Section>

      <Section id="schedules" title="Learning Rate Schedules">
        <Schedules />
      </Section>

      <Section id="batch" title="Batch Size & Noise">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Small batches" tone="indigo"><p>Noisy gradients, many cheap updates. The noise acts as a regulariser and can help escape sharp minima.</p></Card>
          <Card title="Large batches" tone="purple"><p>Accurate gradients, fewer updates, better GPU utilisation. Usually needs a larger learning rate (roughly scaled with batch size) plus warmup.</p></Card>
          <Card title="Gradient accumulation" tone="emerald"><p>Sum gradients over several small batches before stepping, to reach a large effective batch on limited GPU memory.</p></Card>
        </div>
      </Section>

      <Section id="debug" title="When Training Goes Wrong">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm min-w-[520px]">
            <thead className="bg-white/5 text-gray-400 text-left">
              <tr>
                <th className="p-3 font-medium">Symptom</th>
                <th className="p-3 font-medium">Usual cause</th>
                <th className="p-3 font-medium">Try</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-t border-white/5"><td className="p-3">Loss becomes NaN or explodes</td><td className="p-3">Learning rate too high; exploding gradients</td><td className="p-3 text-xs text-gray-400">Lower η, add warmup, clip gradient norm (e.g. 1.0), check fp16 overflow</td></tr>
              <tr className="border-t border-white/5"><td className="p-3">Loss barely moves</td><td className="p-3">η too low; dead activations; bug in data or labels</td><td className="p-3 text-xs text-gray-400">Try overfitting a single batch first — if that fails, it is a bug</td></tr>
              <tr className="border-t border-white/5"><td className="p-3">Loss spikes then recovers</td><td className="p-3">Bad batches, too-high η late in training</td><td className="p-3 text-xs text-gray-400">Clip gradients, decay η, inspect the batches at the spike</td></tr>
              <tr className="border-t border-white/5"><td className="p-3">Train loss falls, validation rises</td><td className="p-3">Overfitting, not an optimiser problem</td><td className="p-3 text-xs text-gray-400">See <a href="#/ml/regularization" className="text-blue-400 hover:underline">Regularisation</a></td></tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`import torch
from torch.optim import AdamW
from transformers import get_cosine_schedule_with_warmup

optimizer = AdamW(model.parameters(), lr=3e-4, betas=(0.9, 0.95), weight_decay=0.1)
scheduler = get_cosine_schedule_with_warmup(
    optimizer, num_warmup_steps=500, num_training_steps=total_steps)

accum = 4                                  # effective batch = 4 × micro-batch
for step, batch in enumerate(loader):
    loss = model(**batch).loss / accum
    loss.backward()
    if (step + 1) % accum == 0:
        torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)
        optimizer.step()
        scheduler.step()
        optimizer.zero_grad(set_to_none=True)`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("ml-optimization")} />
    </GuideLayout>
  );
}

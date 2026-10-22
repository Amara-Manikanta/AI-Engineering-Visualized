import React, { useState, useEffect } from "react";
import { motion } from "framer-motion";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Button, Scatter, Card } from "../components/VizKit";
import { rng, randn, fmt, pct } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "logistic regression", "sigmoid", "log loss", "binary cross-entropy", "odds", "log-odds", "logit", "odds ratio",
  "decision boundary", "gradient descent", "threshold", "confusion matrix", "precision", "recall", "F1 score",
  "ROC curve", "AUC", "softmax", "multinomial logistic regression", "one-vs-rest", "regularization", "C parameter",
  "class_weight", "imbalanced classes",
];

const sigmoid = (z) => 1 / (1 + Math.exp(-z));

/* ---------------------------------------------------------------------------
   Interactive sigmoid: slide the linear score z, watch the probability
--------------------------------------------------------------------------- */

const SIG = (() => {
  const W = 320, H = 180, padX = 30, padY = 20;
  const zMin = -8, zMax = 8;
  const toX = (zz) => padX + ((zz - zMin) / (zMax - zMin)) * (W - padX * 2);
  const toY = (pp) => H - padY - pp * (H - padY * 2);
  return { W, H, padX, padY, zMin, zMax, toX, toY };
})();

// The sigmoid curve never changes, so it is drawn once.
const SIGMOID_PATH = (() => {
  let d = '';
  for (let i = 0; i <= 80; i++) {
    const zz = SIG.zMin + (i / 80) * (SIG.zMax - SIG.zMin);
    d += (i === 0 ? 'M' : 'L') + ` ${SIG.toX(zz).toFixed(1)} ${SIG.toY(sigmoid(zz)).toFixed(1)} `;
  }
  return d;
})();

function SigmoidPlayground() {
  const [z, setZ] = useState(0);
  const p = sigmoid(z);
  const predicted = p >= 0.5 ? 1 : 0;

  const { W, H, padX, padY, toX, toY } = SIG;
  const path = SIGMOID_PATH;

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full max-w-lg mx-auto block">
        {/* axes */}
        <line x1={padX} y1={toY(0)} x2={W - padX} y2={toY(0)} stroke="rgba(255,255,255,0.15)" strokeWidth="0.6" />
        <line x1={toX(0)} y1={padY} x2={toX(0)} y2={H - padY} stroke="rgba(255,255,255,0.1)" strokeWidth="0.6" />
        {/* 0.5 threshold */}
        <line x1={padX} y1={toY(0.5)} x2={W - padX} y2={toY(0.5)} stroke="#f59e0b" strokeWidth="0.8" strokeDasharray="3,2" />
        <text x={W - padX} y={toY(0.5) - 3} textAnchor="end" fill="#f59e0b" fontSize="7">threshold 0.5</text>
        {/* labels */}
        <text x={padX} y={toY(1) - 3} fill="#6b7280" fontSize="7">P = 1</text>
        <text x={padX} y={toY(0) + 9} fill="#6b7280" fontSize="7">P = 0</text>
        {/* curve */}
        <path d={path} fill="none" stroke="#818cf8" strokeWidth="2" />
        {/* current point */}
        <line x1={toX(z)} y1={toY(0)} x2={toX(z)} y2={toY(p)} stroke="#34d399" strokeWidth="0.8" strokeDasharray="2,2" />
        <line x1={toX(z)} y1={toY(p)} x2={padX} y2={toY(p)} stroke="#34d399" strokeWidth="0.8" strokeDasharray="2,2" />
        <circle cx={toX(z)} cy={toY(p)} r="4" fill="#34d399" />
      </svg>

      <div className="max-w-md mx-auto mt-4">
        <label className="text-sm text-gray-300 font-semibold flex justify-between">
          <span>Linear score z = β₀ + β·x</span>
          <span className="font-mono text-indigo-300">{z.toFixed(1)}</span>
        </label>
        <input
          type="range"
          min="-8"
          max="8"
          step="0.1"
          value={z}
          onChange={(e) => setZ(parseFloat(e.target.value))}
          className="w-full accent-indigo-500 mt-1"
        />
        <div className="flex flex-wrap items-center gap-3 mt-4 justify-center">
          <div className="px-4 py-2 rounded-lg bg-indigo-500/15 border border-indigo-500/40 text-sm">
            Probability: <strong className="text-indigo-200 font-mono">{p.toFixed(3)}</strong>
          </div>
          <div className={`px-4 py-2 rounded-lg text-sm border ${predicted === 1 ? 'bg-emerald-500/15 border-emerald-500/40 text-emerald-200' : 'bg-rose-500/15 border-rose-500/40 text-rose-200'}`}>
            Predicted class: <strong className="font-mono">{predicted}</strong>
          </div>
        </div>
      </div>
      <p className="text-[0.6875rem] text-gray-500 mt-4 leading-relaxed text-center max-w-md mx-auto mb-0">
        The linear part produces any number from −∞ to +∞. The sigmoid squashes it into a valid probability (0–1). A
        threshold (default 0.5) then turns that probability into a class.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Why not linear regression for classification
--------------------------------------------------------------------------- */

function WhyNotLinear() {
  const pts0 = [12, 20, 28, 36];
  const pts1 = [64, 72, 80, 88];
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-xl border border-rose-500/30 bg-black/40 p-4">
        <div className="text-sm font-semibold text-rose-400 mb-2">Linear regression on 0/1 labels</div>
        <svg viewBox="0 0 100 70" className="w-full">
          <line x1="6" y1="60" x2="96" y2="60" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <line x1="14" y1="66" x2="92" y2="8" stroke="#f43f5e" strokeWidth="1.2" />
          {pts0.map((x, i) => <circle key={`z${i}`} cx={x} cy="60" r="2.4" fill="#9ca3af" />)}
          {pts1.map((x, i) => <circle key={`o${i}`} cx={x} cy="14" r="2.4" fill="#9ca3af" />)}
        </svg>
        <div className="text-[0.6875rem] text-gray-500 mt-1 leading-relaxed">
          The line shoots below 0 and above 1 — nonsensical as a probability, and outliers drag the boundary around.
        </div>
      </div>
      <div className="rounded-xl border border-emerald-500/30 bg-black/40 p-4">
        <div className="text-sm font-semibold text-emerald-400 mb-2">Logistic regression (sigmoid)</div>
        <svg viewBox="0 0 100 70" className="w-full">
          <line x1="6" y1="60" x2="96" y2="60" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <path d="M 14 60 C 40 60, 45 14, 92 14" fill="none" stroke="#34d399" strokeWidth="1.5" />
          {pts0.map((x, i) => <circle key={`z${i}`} cx={x} cy="60" r="2.4" fill="#9ca3af" />)}
          {pts1.map((x, i) => <circle key={`o${i}`} cx={x} cy="14" r="2.4" fill="#9ca3af" />)}
        </svg>
        <div className="text-[0.6875rem] text-gray-500 mt-1 leading-relaxed">
          The S-curve stays inside 0–1, saturates at the extremes, and gives a smooth probability everywhere.
        </div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Odds and log-odds: why coefficients multiply odds, not probabilities.
--------------------------------------------------------------------------- */

function OddsLab() {
  const [p, setP] = useState(0.2);
  const [beta, setBeta] = useState(0.7);
  const odds = p / (1 - p);
  const logit = Math.log(odds);
  const or = Math.exp(beta);
  const odds2 = odds * or;
  const p2 = odds2 / (1 + odds2);
  return (
    <Panel tone="purple" title="Probability, odds and log-odds">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Slider tone="purple" label="Starting probability p" value={p} min={0.02} max={0.98} step={0.01} onChange={setP} format={(v) => v.toFixed(2)} />
        <Slider tone="purple" label="Coefficient β (per unit of x)" value={beta} min={-2} max={2} step={0.05} onChange={setBeta} format={(v) => v.toFixed(2)} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[1fr_auto_1fr] gap-3 items-center mb-4">
        <div className="grid grid-cols-3 gap-2">
          <Metric label="p" value={p.toFixed(2)} />
          <Metric label="odds p/(1−p)" value={fmt(odds, 3)} />
          <Metric label="log-odds" value={fmt(logit, 2)} tone="purple" />
        </div>
        <div className="text-center text-sm text-gray-400 font-mono">
          x + 1 →<br />
          <span className="text-purple-300">odds × e^β = × {fmt(or, 2)}</span>
        </div>
        <div className="grid grid-cols-3 gap-2">
          <Metric label="new p" value={p2.toFixed(3)} tone="emerald" />
          <Metric label="new odds" value={fmt(odds2, 3)} />
          <Metric label="new log-odds" value={fmt(logit + beta, 2)} tone="purple" />
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        The model is linear in log-odds: one more unit of x always adds β to the log-odds, which always multiplies the
        odds by e^β. What it does to the probability depends on where you start — try p = 0.5 and p = 0.95 with the
        same β. That is why coefficients are reported as odds ratios.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Watch gradient descent fit a boundary on 2D data.
--------------------------------------------------------------------------- */

const STUDY = (() => {
  const r = rng(17);
  const pts = [];
  for (let i = 0; i < 24; i++) pts.push({ x: 6.4 + 1.3 * randn(r), y: 6.2 + 1.3 * randn(r), c: 1 });
  for (let i = 0; i < 24; i++) pts.push({ x: 3.6 + 1.3 * randn(r), y: 3.4 + 1.3 * randn(r), c: 0 });
  return pts.map((p) => ({ ...p, x: Math.max(0.3, Math.min(9.7, p.x)), y: Math.max(0.3, Math.min(9.7, p.y)) }));
})();
// Standardise around (5, 5) with scale 2.5 so plain gradient descent behaves.
const zx = (v) => (v - 5) / 2.5;

function lossAndGrad(w) {
  let loss = 0;
  const g = [0, 0, 0];
  let correct = 0;
  STUDY.forEach((p) => {
    const f = [1, zx(p.x), zx(p.y)];
    const q = sigmoid(w[0] + w[1] * f[1] + w[2] * f[2]);
    const e = Math.min(1 - 1e-12, Math.max(1e-12, q));
    loss -= p.c * Math.log(e) + (1 - p.c) * Math.log(1 - e);
    for (let j = 0; j < 3; j++) g[j] += (q - p.c) * f[j];
    if ((q >= 0.5 ? 1 : 0) === p.c) correct++;
  });
  const n = STUDY.length;
  return { loss: loss / n, grad: g.map((v) => v / n), acc: correct / n };
}

function TrainLab() {
  const [lr, setLr] = useState(0.5);
  const [state, setState] = useState({ w: [0, -1.5, 0.4], epoch: 0, hist: [] });
  const [playing, setPlaying] = useState(false);

  const stepN = (k) =>
    setState((s) => {
      let w = s.w;
      const hist = [...s.hist];
      for (let i = 0; i < k; i++) {
        const { loss, grad } = lossAndGrad(w);
        hist.push(loss);
        w = w.map((v, j) => v - lr * grad[j]);
      }
      return { w, epoch: s.epoch + k, hist: hist.slice(-400) };
    });

  useEffect(() => {
    if (!playing) return undefined;
    if (state.epoch >= 400) {
      setPlaying(false);
      return undefined;
    }
    const id = setTimeout(() => stepN(4), 50);
    return () => clearTimeout(id);
  }, [playing, state.epoch]); // eslint-disable-line react-hooks/exhaustive-deps

  const { loss, acc } = lossAndGrad(state.w);
  const [b, w1, w2] = state.w;
  // Boundary b + w1·zx(x) + w2·zx(y) = 0, drawn in raw units.
  const yAt = (x) => 5 + (2.5 * -(b + w1 * zx(x))) / (w2 || 1e-9);
  const cells = [];
  for (let i = 0; i < 20; i++)
    for (let j = 0; j < 20; j++) {
      const cx = (i + 0.5) / 2;
      const cy = (j + 0.5) / 2;
      cells.push({ cx, cy, q: sigmoid(b + w1 * zx(cx) + w2 * zx(cy)) });
    }
  const hist = state.hist;
  const hMax = Math.max(0.8, ...hist);

  return (
    <Panel
      tone="emerald"
      title="Watch gradient descent find the boundary"
      actions={
        <>
          <Button tone="emerald" onClick={() => setPlaying((p) => !p)}>{playing ? "Pause" : "▶ Train"}</Button>
          <Button tone="emerald" onClick={() => stepN(1)}>Step 1 epoch</Button>
          <Button tone="emerald" onClick={() => { setPlaying(false); setState({ w: [0, -1.5, 0.4], epoch: 0, hist: [] }); }}>Reset</Button>
        </>
      }
    >
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        48 students: hours studied (x) and practice tests taken (y); green passed, grey failed. The model starts with a
        deliberately bad boundary. Each epoch computes the log-loss gradient over all students and takes one step
        downhill. Background colour is the predicted probability of passing.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-5 items-start">
        <div className="rounded-xl bg-black/40 border border-white/10 p-2 max-w-xl">
          <Scatter
            points={[]}
            x={[0, 10]}
            y={[0, 10]}
            xLabel="hours studied"
            yLabel="practice tests"
          >
            {({ sx, sy }) => (
              <>
                {cells.map((c, i) => (
                  <rect key={i} x={sx(c.cx - 0.25)} y={sy(c.cy + 0.25)} width={sx(0.5) - sx(0)} height={sy(0) - sy(0.5)} fill={`rgba(52,211,153,${(c.q * 0.35).toFixed(3)})`} />
                ))}
                <line x1={sx(0)} y1={sy(yAt(0))} x2={sx(10)} y2={sy(yAt(10))} stroke="#f472b6" strokeWidth="2.5" />
                {STUDY.map((p, i) => (
                  <circle key={`p${i}`} cx={sx(p.x)} cy={sy(p.y)} r="4.5" fill={p.c ? "#34d399" : "#94a3b8"} stroke="rgba(0,0,0,0.6)" />
                ))}
              </>
            )}
          </Scatter>
        </div>
        <div className="space-y-3">
          <Slider tone="emerald" label="Learning rate" value={lr} min={0.05} max={3} step={0.05} onChange={setLr} format={(v) => v.toFixed(2)} />
          <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
            <Metric label="Epoch" value={state.epoch} />
            <Metric label="Log loss" value={fmt(loss, 4)} tone="rose" />
            <Metric label="Accuracy" value={pct(acc, 0)} tone="emerald" />
          </div>
          <svg viewBox="0 0 240 70" className="w-full h-auto block rounded-lg bg-black/40 border border-white/10">
            {hist.length > 1 && (
              <path
                d={hist.map((h, i) => `${i ? "L" : "M"}${(4 + (i / Math.max(1, hist.length - 1)) * 232).toFixed(1)},${(64 - (h / hMax) * 58).toFixed(1)}`).join("")}
                fill="none"
                stroke="#fb7185"
                strokeWidth="1.8"
              />
            )}
            <text x="6" y="12" fill="#6b7280" fontSize="10">loss over epochs</text>
          </svg>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Log loss is convex, so there is one valley and gradient descent reaches it from any start. Reset and train at a
        learning rate of 3: it gets there in far fewer epochs. On badly scaled features the same step size would
        overshoot and diverge, which is why inputs are standardised first. Loss keeps falling after accuracy stops
        changing — the model is growing more confident about points it already classifies correctly.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Thresholds, the confusion matrix and the ROC curve.
--------------------------------------------------------------------------- */

const SCORED = (() => {
  const r = rng(5);
  const out = [];
  for (let i = 0; i < 40; i++) out.push({ y: 1, s: sigmoid(1.3 + 1.4 * randn(r)) });
  for (let i = 0; i < 160; i++) out.push({ y: 0, s: sigmoid(-1.6 + 1.4 * randn(r)) });
  return out;
})();

function confusion(t) {
  let tp = 0, fp = 0, fn = 0, tn = 0;
  SCORED.forEach((d) => {
    const pred = d.s >= t ? 1 : 0;
    if (pred && d.y) tp++;
    else if (pred && !d.y) fp++;
    else if (!pred && d.y) fn++;
    else tn++;
  });
  return { tp, fp, fn, tn };
}

const ROC = (() => {
  const ts = [...new Set(SCORED.map((d) => d.s))].sort((a, b) => b - a);
  const pts = [{ fpr: 0, tpr: 0 }];
  ts.forEach((t) => {
    const c = confusion(t);
    pts.push({ fpr: c.fp / (c.fp + c.tn), tpr: c.tp / (c.tp + c.fn) });
  });
  pts.push({ fpr: 1, tpr: 1 });
  let auc = 0;
  for (let i = 1; i < pts.length; i++) auc += (pts[i].fpr - pts[i - 1].fpr) * (pts[i].tpr + pts[i - 1].tpr) / 2;
  return { pts, auc };
})();

function ThresholdLab() {
  const [t, setT] = useState(0.5);
  const c = confusion(t);
  const precision = c.tp + c.fp ? c.tp / (c.tp + c.fp) : 1;
  const recall = c.tp / (c.tp + c.fn);
  const f1 = precision + recall ? (2 * precision * recall) / (precision + recall) : 0;
  const acc = (c.tp + c.tn) / SCORED.length;
  const fpr = c.fp / (c.fp + c.tn);
  const S = 150;
  const px = (v) => 22 + v * S;
  const py = (v) => 8 + (1 - v) * S;

  const cell = (label, v, tone) => (
    <div className={`rounded-lg border p-2 text-center ${tone}`}>
      <div className="text-[0.625rem] text-gray-400 uppercase tracking-wide">{label}</div>
      <div className="text-xl font-mono text-white">{v}</div>
    </div>
  );

  return (
    <Panel tone="blue" title="Fraud detection: where do you draw the line?">
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        200 transactions, 40 of them fraud, each scored by a logistic regression. The model outputs probabilities; the
        threshold turns them into decisions. Nothing about the model changes when you move it.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_210px] gap-5 items-start">
        <div>
          <Slider tone="blue" label="Decision threshold" value={t} min={0.02} max={0.98} step={0.01} onChange={setT} format={(v) => v.toFixed(2)} />
          <div className="grid grid-cols-2 gap-2 mt-4 mb-3 max-w-sm">
            {cell("fraud caught (TP)", c.tp, "border-emerald-500/30 bg-emerald-500/10")}
            {cell("false alarm (FP)", c.fp, "border-rose-500/30 bg-rose-500/10")}
            {cell("fraud missed (FN)", c.fn, "border-amber-500/30 bg-amber-500/10")}
            {cell("correctly cleared (TN)", c.tn, "border-white/10 bg-white/5")}
          </div>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            <Metric label="Precision" value={pct(precision, 0)} tone="blue" sub="flags that were fraud" />
            <Metric label="Recall" value={pct(recall, 0)} tone="emerald" sub="fraud that was flagged" />
            <Metric label="F1" value={fmt(f1, 2)} tone="purple" />
            <Metric label="Accuracy" value={pct(acc, 0)} />
          </div>
        </div>
        <div>
          <svg viewBox="0 0 180 186" className="w-full h-auto block max-w-[240px] mx-auto">
            <rect x={px(0)} y={py(1)} width={S} height={S} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)" />
            <line x1={px(0)} y1={py(0)} x2={px(1)} y2={py(1)} stroke="rgba(255,255,255,0.18)" strokeDasharray="3 3" />
            <path d={ROC.pts.map((p, i) => `${i ? "L" : "M"}${px(p.fpr).toFixed(1)},${py(p.tpr).toFixed(1)}`).join("")} fill="none" stroke="#60a5fa" strokeWidth="2" />
            <circle cx={px(fpr)} cy={py(recall)} r="5" fill="#fbbf24" stroke="#000" />
            <text x={px(0.5)} y="184" fill="#6b7280" fontSize="10" textAnchor="middle">false positive rate</text>
            <text x="10" y={py(0.5)} fill="#6b7280" fontSize="10" textAnchor="middle" transform={`rotate(-90 10 ${py(0.5)})`}>true positive rate</text>
            <text x={px(0.55)} y={py(0.12)} fill="#93c5fd" fontSize="11">AUC {ROC.auc.toFixed(3)}</text>
          </svg>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Lower the threshold and recall rises while precision falls; raise it and the reverse. The ROC curve traces
        every threshold at once and the yellow dot is yours. AUC is the probability that a random fraud scores higher
        than a random genuine transaction — a threshold-free measure of the model. Note that accuracy is{" "}
        {pct((SCORED.length - 40) / SCORED.length, 0)} even for a model that never flags anything; with imbalanced
        classes, look at precision and recall.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Softmax for more than two classes.
--------------------------------------------------------------------------- */

function SoftmaxLab() {
  const [z, setZ] = useState([2.0, 1.0, -0.5]);
  const names = ["billing", "technical", "sales"];
  const colors = ["bg-indigo-500/70", "bg-emerald-500/70", "bg-amber-500/70"];
  const m = Math.max(...z);
  const e = z.map((v) => Math.exp(v - m));
  const s = e.reduce((a, b) => a + b, 0);
  const p = e.map((v) => v / s);
  return (
    <Panel tone="indigo" title="Softmax: logistic regression for k classes">
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        Route a support ticket to one of three teams. Each class gets its own linear score zₖ = bₖ + wₖ·x; softmax
        turns the scores into probabilities that sum to 1: pₖ = e^zₖ / Σ e^zⱼ.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        {z.map((v, i) => (
          <Slider key={i} label={`score for ${names[i]}`} value={v} min={-4} max={4} step={0.1} onChange={(nv) => setZ((o) => o.map((x, j) => (j === i ? nv : x)))} format={(x) => x.toFixed(1)} />
        ))}
      </div>
      <div className="space-y-2">
        {p.map((v, i) => (
          <div key={i} className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-20 shrink-0">{names[i]}</span>
            <div className="flex-1 h-5 rounded bg-white/5 overflow-hidden">
              <div className={`h-full ${colors[i]}`} style={{ width: `${v * 100}%`, transition: "width 250ms" }} />
            </div>
            <span className="text-xs font-mono text-gray-300 w-14 text-right">{pct(v)}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        With two classes, softmax reduces exactly to the sigmoid of the difference between the two scores. Adding the
        same number to every score changes nothing — only differences matter. The same function turns an LLM's
        logits into next-token probabilities.
      </p>
    </Panel>
  );
}

export default function MlLogistic() {
  const toc = [
    { label: "Overview & Use Cases", hash: "overview" },
    { label: "Why Not Linear Regression?", hash: "why-not-linear" },
    { label: "The Sigmoid (interactive)", hash: "sigmoid" },
    { label: "Odds & Log-odds", hash: "odds" },
    { label: "Training & Loss", hash: "training" },
    { label: "Watch It Train", hash: "train-live" },
    { label: "Thresholds, Confusion Matrix & ROC", hash: "threshold" },
    { label: "Interpreting Coefficients", hash: "interpretation" },
    { label: "More Than Two Classes", hash: "multiclass" },
    { label: "Regularisation & Imbalance", hash: "regularisation" },
    { label: "Pros & Cons", hash: "pros-cons" },
  ];

  return (
    <GuideLayout
      title="Logistic Regression"
      intro="A supervised algorithm for classification — it predicts the probability that an example belongs to a class, then thresholds it into a decision."
      toc={toc}
    >
      <div className="space-y-16">
        {/* --------------------------------------------------------------- */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} id="overview" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Overview & Use Cases</h2>
          <p className="text-gray-300 mb-6 leading-relaxed max-w-3xl">
            Despite the name, logistic regression is a <strong className="text-white">classification</strong> algorithm.
            Where linear regression predicts a continuous number, logistic regression predicts the{' '}
            <strong className="text-white">probability</strong> that an example belongs to a class, then applies a
            threshold to decide. It is the simplest, most interpretable classifier — and the mathematical seed of a
            single neuron in a neural network.
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
            {[
              ['📧', 'Spam detection', 'spam vs not-spam'],
              ['🏥', 'Medical diagnosis', 'disease present / absent'],
              ['💳', 'Credit risk', 'will default / won’t'],
              ['🛒', 'Churn prediction', 'will cancel / stay'],
            ].map(([icon, t, d]) => (
              <div key={t} className="p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="text-xl mb-1.5">{icon}</div>
                <div className="text-sm font-semibold text-white">{t}</div>
                <div className="text-[0.6875rem] text-gray-500">{d}</div>
              </div>
            ))}
          </div>
        </motion.section>

        {/* --------------------------------------------------------------- */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} id="why-not-linear" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Why Not Just Use Linear Regression?</h2>
          <p className="text-gray-300 mb-6 leading-relaxed max-w-3xl">
            If the labels are 0 and 1, why not fit a line? Because a line is unbounded — it predicts probabilities below
            0 and above 1, and a single outlier can swing the whole boundary. The sigmoid fixes both problems.
          </p>
          <WhyNotLinear />
        </motion.section>

        {/* --------------------------------------------------------------- */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} id="sigmoid" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">The Sigmoid Function</h2>
          <p className="text-gray-300 mb-4 leading-relaxed max-w-3xl">
            The engine of logistic regression. It takes the linear score{' '}
            <code className="bg-gray-800 px-1.5 py-0.5 rounded text-pink-400">z = β₀ + β₁x₁ + … + βₙxₙ</code> and maps it
            to a probability between 0 and 1. Drag the slider to feel how the score becomes a probability and then a
            class.
          </p>
          <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-sm text-gray-200 mb-6 text-center">
            σ(z) = 1 / (1 + e<sup>−z</sup>)
          </div>
          <SigmoidPlayground />
        </motion.section>

        {/* --------------------------------------------------------------- */}
        <section id="odds" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Odds and Log-odds</h2>
          <p className="text-gray-300 mb-6 leading-relaxed max-w-3xl">
            The linear score z is not a probability — it is the <strong className="text-white">log-odds</strong>.
            Odds are p / (1 − p): a probability of 0.8 is odds of 4 to 1. Taking the log stretches odds from (0, ∞)
            onto the whole number line, which is exactly the range a linear formula produces. The sigmoid is just the
            inverse of that log-odds transform.
          </p>
          <OddsLab />
        </section>

        {/* --------------------------------------------------------------- */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} id="training" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Training & Loss Function</h2>
          <p className="text-gray-300 mb-6 leading-relaxed max-w-3xl">
            Logistic regression is trained by minimising <strong className="text-white">Binary Cross-Entropy</strong>{' '}
            (log loss). Unlike squared error, log loss punishes confident wrong answers brutally — predicting 0.99 for a
            true label of 0 costs far more than predicting 0.6.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
            <div className="bg-[#111] border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-emerald-400 mb-3">Log loss</h3>
              <div className="font-mono text-xs text-indigo-300 bg-black/30 p-3 rounded text-center">
                −(1/N) Σ [ yᵢ·log(pᵢ) + (1−yᵢ)·log(1−pᵢ) ]
              </div>
              <p className="text-[0.6875rem] text-gray-500 mt-3 leading-relaxed">
                For a positive example only the left term is active (reward high p); for a negative only the right
                (reward low p).
              </p>
            </div>
            <div className="bg-[#111] border border-gray-800 rounded-xl p-5">
              <h3 className="text-sm font-semibold text-emerald-400 mb-3">Optimisation</h3>
              <p className="text-xs text-gray-400 leading-relaxed">
                There is no closed-form solution, so parameters are found by gradient descent (or variants like SGD).
                Conveniently, the gradient of log loss through the sigmoid simplifies to the same clean{' '}
                <code className="text-indigo-300">(pᵢ − yᵢ)·xᵢ</code> form as linear regression.
              </p>
            </div>
          </div>
          <CodeBlock language="python" maxHeight="300px" code={`from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import train_test_split

X_train, X_test, y_train, y_test = train_test_split(X, y, test_size=0.2)

clf = LogisticRegression()
clf.fit(X_train, y_train)

proba = clf.predict_proba(X_test)[:, 1]   # probability of class 1
pred  = clf.predict(X_test)               # thresholded at 0.5
print("accuracy:", clf.score(X_test, y_test))`} />
        </motion.section>

        {/* --------------------------------------------------------------- */}
        <section id="train-live" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Watch It Train</h2>
          <TrainLab />
        </section>

        {/* --------------------------------------------------------------- */}
        <section id="threshold" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Thresholds, the Confusion Matrix and ROC</h2>
          <p className="text-gray-300 mb-6 leading-relaxed max-w-3xl">
            0.5 is only a default. The right threshold depends on what each mistake costs: missing fraud is expensive,
            so a bank flags at a lower probability and accepts more false alarms. A spam filter that must never lose a
            real email does the opposite.
          </p>
          <ThresholdLab />
        </section>

        {/* --------------------------------------------------------------- */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} id="interpretation" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Interpreting Coefficients</h2>
          <p className="text-gray-300 mb-4 leading-relaxed max-w-3xl">
            A big reason to reach for logistic regression is that its coefficients <em>mean</em> something.
          </p>
          <ul className="space-y-2.5 text-sm text-gray-300 mb-6">
            <li className="flex gap-2"><span className="text-indigo-400 shrink-0">β</span><span><strong className="text-white">Coefficient:</strong> the change in log-odds per one-unit increase in the feature. Exponentiate it (e^β) to get the <em className="text-indigo-300">odds ratio</em> — e.g. e^β = 1.5 means the odds rise 50% per unit.</span></li>
            <li className="flex gap-2"><span className="text-indigo-400 shrink-0">β₀</span><span><strong className="text-white">Intercept:</strong> the log-odds when every feature is zero.</span></li>
            <li className="flex gap-2"><span className="text-indigo-400 shrink-0">±</span><span><strong className="text-white">Sign:</strong> a positive coefficient pushes toward class 1, negative toward class 0.</span></li>
          </ul>
          <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/10">
            <div className="text-xs font-semibold text-amber-300 mb-2">Key assumptions</div>
            <p className="text-xs text-gray-300 leading-relaxed m-0">
              The log-odds is linear in the features; observations are independent; no severe multicollinearity; and
              enough samples for stable estimates. When these break, reach for trees or neural networks.
            </p>
          </div>
        </motion.section>

        {/* --------------------------------------------------------------- */}
        <section id="multiclass" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">More Than Two Classes</h2>
          <p className="text-gray-300 mb-6 leading-relaxed max-w-3xl">
            Two standard extensions. <strong className="text-white">One-vs-rest</strong> trains one binary model per
            class and picks the most confident. <strong className="text-white">Multinomial (softmax)</strong>{" "}
            regression trains all classes jointly — scikit-learn's default for more than two classes.
          </p>
          <SoftmaxLab />
        </section>

        {/* --------------------------------------------------------------- */}
        <section id="regularisation" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Regularisation and Imbalance</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card title="C — inverse regularisation strength" tone="indigo">
              <p>scikit-learn applies an L2 penalty by default. Smaller C means a stronger penalty and smaller coefficients. If the classes are perfectly separable, an unregularised model pushes weights toward infinity.</p>
            </Card>
            <Card title="L1 for feature selection" tone="purple">
              <p><span className="font-mono">penalty="l1"</span> (with the liblinear or saga solver) drives weak features to exactly zero, leaving a sparse, readable model.</p>
            </Card>
            <Card title="class_weight=&quot;balanced&quot;" tone="amber">
              <p>With 1% positives the model can score 99% accuracy by predicting "no" forever. Reweighting the rare class, or moving the threshold, fixes what the loss pays attention to.</p>
            </Card>
          </div>
        </section>

        {/* --------------------------------------------------------------- */}
        <motion.section initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} id="pros-cons" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-6 text-gray-100">Pros & Cons</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
              <h4 className="text-emerald-400 font-semibold mb-2">Advantages</h4>
              <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
                <li>Simple, fast, and highly interpretable.</li>
                <li>Outputs calibrated probabilities, not just labels.</li>
                <li>Strong baseline for any classification problem.</li>
                <li>Hard to overfit with regularisation (L1/L2).</li>
              </ul>
            </div>
            <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
              <h4 className="text-rose-400 font-semibold mb-2">Disadvantages</h4>
              <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
                <li>Assumes a linear decision boundary (in log-odds).</li>
                <li>Struggles with complex non-linear patterns.</li>
                <li>Sensitive to outliers and correlated features.</li>
                <li>Needs good feature engineering to shine.</li>
              </ul>
            </div>
          </div>
        </motion.section>
      </div>
      <KnowledgeCheck questions={questionsFor("ml-classic")} />
    </GuideLayout>
  );
}

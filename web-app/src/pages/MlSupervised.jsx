import React, { useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Segmented, Button, Metric, Card, Note, Section, Scatter } from "../components/VizKit";
import { rng, randn, linfit, ols, mean, fmt, pct } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "supervised learning", "labelled data", "labeled data", "features", "label", "target", "training set", "test set",
  "validation set", "regression", "classification", "binary classification", "multi-class", "multi-label",
  "loss function", "mean squared error", "gradient descent", "learning rate", "parameters", "hyperparameters",
  "overfitting", "underfitting", "bias variance tradeoff", "generalisation", "generalization", "train test split",
  "data leakage", "cross validation", "k-fold", "stratified k-fold", "confusion matrix", "accuracy", "precision",
  "recall", "F1 score", "R squared", "MAE", "RMSE", "class imbalance", "decision threshold", "scikit-learn",
];

/* ---------------------------------------------------------------------------
   Lab 1 — "learning" is turning two knobs until the error is small.
   16 houses: size in hundreds of m², price in hundreds of thousands of dollars.
--------------------------------------------------------------------------- */

const HOUSES = (() => {
  const r = rng(2024);
  return Array.from({ length: 16 }, () => {
    const x = 0.6 + 2.6 * r();
    return { x, y: 0.9 + 2.1 * x + 0.55 * randn(r) };
  });
})();
const BEST = linfit(HOUSES.map((p) => p.x), HOUSES.map((p) => p.y));
const houseMse = (a, b) => mean(HOUSES.map((p) => (p.y - (a + b * p.x)) ** 2));
const START = { a: 6, b: -1 };

function LearnLab() {
  const [a, setA] = useState(START.a);
  const [b, setB] = useState(START.b);
  const [history, setHistory] = useState([houseMse(START.a, START.b)]);
  const [showBest, setShowBest] = useState(false);

  const mse = houseMse(a, b);
  const bestMse = houseMse(BEST.a, BEST.b);

  const set = (na, nb, hist) => {
    setA(na);
    setB(nb);
    setHistory(hist);
  };

  // One gradient-descent update, repeated `n` times. For loss = mean((y − a − b·x)²):
  //   dLoss/da = −2·mean(e)        dLoss/db = −2·mean(e·x)        (e = y − prediction)
  const descend = (n) => {
    const lr = 0.1;
    let ca = a;
    let cb = b;
    const hist = [...history];
    for (let i = 0; i < n; i++) {
      let ga = 0;
      let gb = 0;
      for (const p of HOUSES) {
        const e = p.y - (ca + cb * p.x);
        ga += (-2 * e) / HOUSES.length;
        gb += (-2 * e * p.x) / HOUSES.length;
      }
      ca -= lr * ga;
      cb -= lr * gb;
      hist.push(houseMse(ca, cb));
    }
    set(ca, cb, hist);
  };

  const steps = history.length - 1;
  const hMax = Math.max(...history);
  const spark = history
    .map((v, i) => {
      const px = history.length === 1 ? 0 : (i / (history.length - 1)) * 300;
      return `${px.toFixed(1)},${(52 - (v / hMax) * 48).toFixed(1)}`;
    })
    .join(" ");

  return (
    <Panel tone="indigo" title="Turn the knobs: watch the error">
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        The model here is the simplest one there is: <span className="font-mono text-gray-200">price = a + b × size</span>.
        The two numbers <strong className="text-gray-200">a</strong> (where the line starts) and{" "}
        <strong className="text-gray-200">b</strong> (how steep it is) are the model's <em>parameters</em>. Each red
        segment is one prediction's miss. Training means finding the a and b that make the misses, taken together, as
        small as possible.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-5">
        <div>
          <Scatter
            points={HOUSES.map((p) => ({ x: p.x, y: p.y, color: "#e5e7eb" }))}
            x={[0, 3.5]}
            y={[0, 9]}
            xLabel="size (×100 m²)"
            yLabel="price (×$100k)"
            lines={[{ a, b, color: "#f472b6" }, ...(showBest ? [{ a: BEST.a, b: BEST.b, color: "#34d399", dash: true }] : [])]}
          >
            {({ sx, sy }) =>
              HOUSES.map((p, i) => (
                <line key={i} x1={sx(p.x)} y1={sy(p.y)} x2={sx(p.x)} y2={sy(a + b * p.x)} stroke="#fb7185" strokeWidth="1.5" strokeOpacity="0.8" />
              ))
            }
          </Scatter>
          <div className="mt-3">
            <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Error after each gradient step</div>
            <svg viewBox="0 0 300 56" className="w-full h-auto block">
              <rect x="0" y="0" width="300" height="56" fill="rgba(255,255,255,0.02)" />
              <polyline points={spark} fill="none" stroke="#818cf8" strokeWidth="2" strokeLinejoin="round" />
            </svg>
          </div>
        </div>
        <div className="space-y-3">
          <Slider label="a (starting height)" value={a} min={-1} max={8} step={0.05} onChange={(v) => set(v, b, [...history, houseMse(v, b)])} format={(v) => v.toFixed(2)} />
          <Slider label="b (steepness)" value={b} min={-2} max={5} step={0.05} onChange={(v) => set(a, v, [...history, houseMse(a, v)])} format={(v) => v.toFixed(2)} />
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Error (MSE)" value={fmt(mse, 3)} tone="rose" sub="mean squared miss" />
            <Metric label="Best possible" value={fmt(bestMse, 3)} tone="emerald" sub="closed-form fit" />
          </div>
          <div className="flex flex-wrap gap-2">
            <Button onClick={() => descend(1)}>1 gradient step</Button>
            <Button onClick={() => descend(25)}>25 steps</Button>
          </div>
          <div className="flex flex-wrap gap-2">
            <Button tone="emerald" onClick={() => setShowBest(!showBest)}>{showBest ? "Hide" : "Show"} best line</Button>
            <Button tone="amber" onClick={() => set(START.a, START.b, [houseMse(START.a, START.b)])}>Reset</Button>
          </div>
          <p className="text-[0.6875rem] text-gray-500 leading-relaxed m-0">
            {steps} gradient step{steps === 1 ? "" : "s"} taken so far (dragging a slider also adds a point to the curve). Try
            to beat the optimiser by hand, then press <em>25 steps</em> and watch it walk downhill on its own.
          </p>
        </div>
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Regression vs Classification — the two shapes of supervised learning
--------------------------------------------------------------------------- */

function RegVsClassVisual() {
  const regPts = [[15, 78], [28, 70], [38, 64], [50, 52], [60, 46], [72, 34], [84, 26]];
  const classA = [[22, 30], [30, 22], [18, 44], [34, 38], [26, 54], [40, 28]];
  const classB = [[62, 72], [72, 64], [58, 58], [78, 74], [68, 50], [82, 60]];

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
        <div className="text-sm font-semibold text-emerald-400 mb-1">Regression → a number</div>
        <div className="text-[0.6875rem] text-gray-500 mb-3">Fit a line or curve through the points; read a value off it.</div>
        <svg viewBox="0 0 100 100" className="w-full" style={{ aspectRatio: "1.4" }} role="img" aria-label="Points rising from left to right with a fitted trend line">
          <line x1="8" y1="92" x2="96" y2="92" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <line x1="8" y1="8" x2="8" y2="92" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <line x1="10" y1="82" x2="90" y2="22" stroke="#34d399" strokeWidth="1.5" strokeDasharray="3,2" />
          {regPts.map(([x, y], i) => (
            <circle key={i} cx={x} cy={y} r="2.6" fill="#34d399" />
          ))}
        </svg>
        <div className="text-[0.6875rem] text-gray-500 mt-1 text-center">e.g. "this house → $412,000"</div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-black/40 p-5">
        <div className="text-sm font-semibold text-blue-400 mb-1">Classification → a category</div>
        <div className="text-[0.6875rem] text-gray-500 mb-3">Draw a boundary between groups; report which side a point falls on.</div>
        <svg viewBox="0 0 100 100" className="w-full" style={{ aspectRatio: "1.4" }} role="img" aria-label="Two groups of points separated by a diagonal decision boundary">
          <line x1="8" y1="92" x2="96" y2="92" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <line x1="8" y1="8" x2="8" y2="92" stroke="rgba(255,255,255,0.15)" strokeWidth="0.5" />
          <line x1="20" y1="88" x2="88" y2="20" stroke="#f59e0b" strokeWidth="1.5" />
          {classA.map(([x, y], i) => (
            <circle key={`a${i}`} cx={x} cy={y} r="2.6" fill="#818cf8" />
          ))}
          {classB.map(([x, y], i) => (
            <rect key={`b${i}`} x={x - 2.2} y={y - 2.2} width="4.4" height="4.4" rx="1" fill="#f472b6" />
          ))}
        </svg>
        <div className="text-[0.6875rem] text-gray-500 mt-1 text-center">e.g. "this email → spam"</div>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Lab 2 — under / good / over fit, with real train and test errors.
   Noisy samples of 0.8·sin(2.8x); polynomials of degree 1–9 fitted by least
   squares on 20 training points, then scored on 200 fresh points.
--------------------------------------------------------------------------- */

const TRUE_CURVE = (x) => 0.8 * Math.sin(2.8 * x);
const NOISE_SD = 0.2;
const sample = (seed, n) => {
  const r = rng(seed);
  return Array.from({ length: n }, () => {
    const x = -1 + 2 * r();
    return { x, y: TRUE_CURVE(x) + NOISE_SD * randn(r) };
  });
};
const FIT_TRAIN = sample(11, 20);
const FIT_TEST = sample(77, 200);
const MAX_DEG = 9;
const POLY = Array.from({ length: MAX_DEG }, (_, i) => {
  const degree = i + 1;
  const fit = ols(FIT_TRAIN.map((p) => Array.from({ length: degree }, (_, k) => p.x ** (k + 1))), FIT_TRAIN.map((p) => p.y));
  const predict = (x) => fit.beta.reduce((s, c, k) => s + c * x ** k, 0);
  const mse = (d) => mean(d.map((p) => (p.y - predict(p.x)) ** 2));
  return { degree, predict, train: mse(FIT_TRAIN), test: mse(FIT_TEST) };
});
const BEST_DEG = POLY.reduce((best, m) => (m.test < best.test ? m : best), POLY[0]).degree;

function FitLab() {
  const [deg, setDeg] = useState(1);
  const [showTest, setShowTest] = useState(false);
  const m = POLY[deg - 1];
  const bestTest = POLY[BEST_DEG - 1].test;

  let verdict;
  if (deg < BEST_DEG) verdict = { tone: "rose", t: "Underfitting", d: "Too simple. It misses the real shape, so it is wrong on the training points and equally wrong on new ones. Both errors are high." };
  else if (deg === BEST_DEG) verdict = { tone: "emerald", t: "Sweet spot", d: "Complex enough to follow the pattern, too stiff to chase the noise. Test error is as low as it gets here, and close to the noise floor." };
  else if (m.test > bestTest * 1.3) verdict = { tone: "amber", t: "Overfitting", d: "Training error keeps shrinking because the curve is bending to hit individual noisy points, but test error has turned back up. The model is memorising." };
  else verdict = { tone: "amber", t: "Starting to overfit", d: "Training error still falls but test error has stopped improving. More flexibility is now buying noise, not signal." };

  const path = (fn) =>
    (sx, sy) =>
      Array.from({ length: 121 }, (_, i) => {
        const x = -1 + (2 * i) / 120;
        return `${i === 0 ? "M" : "L"}${sx(x).toFixed(1)},${sy(fn(x)).toFixed(1)}`;
      }).join(" ");

  // error-vs-complexity chart
  const W = 320;
  const H = 150;
  const yMax = 0.14;
  const cx = (d) => 28 + ((d - 1) / (MAX_DEG - 1)) * (W - 40);
  const cy = (v) => 8 + (1 - Math.min(v, yMax) / yMax) * (H - 30);
  const line = (key) => POLY.map((p) => `${cx(p.degree).toFixed(1)},${cy(p[key]).toFixed(1)}`).join(" ");

  return (
    <Panel tone="amber" title="Complexity lab: how flexible should the model be?">
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        The grey dots are 20 noisy measurements of a smooth curve (dashed). The model is a polynomial: degree 1 is a
        straight line, degree 9 can wiggle through almost anything. Slide the degree and watch two numbers: the error on
        the <strong className="text-gray-200">20 points it trained on</strong> and the error on{" "}
        <strong className="text-gray-200">200 fresh points it never saw</strong>.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_300px] gap-5">
        <div>
          <Scatter
            points={[
              ...(showTest ? FIT_TEST.slice(0, 60).map((p) => ({ x: p.x, y: p.y, color: "#60a5fa", r: 2.5, o: 0.5 })) : []),
              ...FIT_TRAIN.map((p) => ({ x: p.x, y: p.y, color: "#e5e7eb" })),
            ]}
            x={[-1, 1]}
            y={[-1.4, 1.4]}
            xLabel="input"
            yLabel="output"
          >
            {({ sx, sy }) => (
              <>
                <path d={path(TRUE_CURVE)(sx, sy)} fill="none" stroke="#9ca3af" strokeWidth="1.5" strokeDasharray="4 4" />
                <path d={path(m.predict)(sx, sy)} fill="none" stroke={verdict.tone === "emerald" ? "#34d399" : verdict.tone === "rose" ? "#fb7185" : "#fbbf24"} strokeWidth="2.5" />
              </>
            )}
          </Scatter>
          <div className="mt-3">
            <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Error vs. model complexity</div>
            <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block" role="img" aria-label="Training error falls with degree while test error falls then rises">
              <rect x="28" y="8" width={W - 40} height={H - 30} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.1)" />
              <line x1="28" x2={W - 12} y1={cy(NOISE_SD ** 2)} y2={cy(NOISE_SD ** 2)} stroke="#9ca3af" strokeDasharray="3 3" />
              <text x={W - 14} y={cy(NOISE_SD ** 2) - 4} fill="#9ca3af" fontSize="9" textAnchor="end">noise floor 0.04</text>
              <polyline points={line("train")} fill="none" stroke="#34d399" strokeWidth="2" />
              <polyline points={line("test")} fill="none" stroke="#fb7185" strokeWidth="2" />
              <line x1={cx(deg)} x2={cx(deg)} y1="8" y2={H - 22} stroke="#818cf8" strokeWidth="1" strokeDasharray="2 3" />
              <circle cx={cx(deg)} cy={cy(m.train)} r="4" fill="#34d399" />
              <circle cx={cx(deg)} cy={cy(m.test)} r="4" fill="#fb7185" />
              {POLY.map((p) => (
                <text key={p.degree} x={cx(p.degree)} y={H - 8} fill="#6b7280" fontSize="10" textAnchor="middle">{p.degree}</text>
              ))}
              <text x="32" y="20" fill="#34d399" fontSize="10">training error</text>
              <text x="32" y="32" fill="#fb7185" fontSize="10">test error</text>
            </svg>
          </div>
        </div>
        <div className="space-y-3">
          <Slider label="Polynomial degree" value={deg} min={1} max={MAX_DEG} onChange={setDeg} format={(v) => `degree ${v}`} tone="amber" />
          <Segmented
            tone="amber"
            value={showTest}
            onChange={setShowTest}
            options={[{ v: false, label: "Training points only" }, { v: true, label: "+ some test points" }]}
          />
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Training error" value={fmt(m.train, 3)} tone="emerald" sub="on the 20 it saw" />
            <Metric label="Test error" value={fmt(m.test, 3)} tone="rose" sub="on 200 new points" />
          </div>
          <Card title={verdict.t} tone={verdict.tone}>
            <p>{verdict.d}</p>
          </Card>
          <p className="text-[0.6875rem] text-gray-500 leading-relaxed m-0">
            Error here is mean squared error. The data carries noise of standard deviation 0.2, so no model can score
            below about 0.04 on new data; that is the <em>irreducible error</em>.
          </p>
        </div>
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   The three static pictures (kept as a quick overview before the lab)
--------------------------------------------------------------------------- */

function FitVisual() {
  const pts = [[14, 70], [26, 58], [34, 66], [46, 48], [56, 54], [66, 38], [78, 44], [88, 30]];
  const panels = [
    { title: "Underfit", tone: "text-rose-400", border: "border-rose-500/30", line: "M 12 66 L 90 40", sub: "Too simple: misses the trend (high bias)." },
    { title: "Good fit", tone: "text-emerald-400", border: "border-emerald-500/30", line: "M 12 70 Q 50 40 90 32", sub: "Captures the trend, ignores the noise." },
    { title: "Overfit", tone: "text-amber-400", border: "border-amber-500/30", line: "M 14 70 L 26 58 L 34 66 L 46 48 L 56 54 L 66 38 L 78 44 L 88 30", sub: "Memorises every point: fails on new data (high variance)." },
  ];
  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
      {panels.map((p) => (
        <div key={p.title} className={`rounded-xl border ${p.border} bg-black/40 p-4`}>
          <div className={`text-sm font-semibold mb-2 ${p.tone}`}>{p.title}</div>
          <svg viewBox="0 0 100 90" className="w-full" role="img" aria-label={p.title}>
            <path d={p.line} fill="none" stroke="currentColor" className={p.tone} strokeWidth="1.5" />
            {pts.map(([x, y], i) => (
              <circle key={i} cx={x} cy={y} r="2.4" fill="#9ca3af" />
            ))}
          </svg>
          <div className="text-[0.6875rem] text-gray-500 mt-1 leading-relaxed">{p.sub}</div>
        </div>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Lab 3 — train / validation / test split
--------------------------------------------------------------------------- */

const SPLITS = [
  { v: "60", label: "60 / 20 / 20", s: [60, 20, 20] },
  { v: "70", label: "70 / 15 / 15", s: [70, 15, 15] },
  { v: "80", label: "80 / 10 / 10", s: [80, 10, 10] },
];

function SplitLab() {
  const [pick, setPick] = useState("70");
  const N = 1000;
  const s = SPLITS.find((x) => x.v === pick).s;
  const parts = [
    { n: "Training", c: "bg-emerald-500/30 border-emerald-500/50 text-emerald-200", d: "The model learns its parameters from these rows. It sees the answers." },
    { n: "Validation", c: "bg-indigo-500/30 border-indigo-500/50 text-indigo-200", d: "You compare models and tune hyperparameters on these. You peek at the score as often as you like." },
    { n: "Test", c: "bg-amber-500/30 border-amber-500/50 text-amber-200", d: "Locked away until the very end. One look, one honest number." },
  ];
  return (
    <Panel tone="indigo" title="Split 1,000 labelled rows three ways">
      <Segmented value={pick} onChange={setPick} options={SPLITS.map((x) => ({ v: x.v, label: x.label }))} />
      <div className="flex w-full h-12 rounded-lg overflow-hidden mt-4 border border-white/10">
        {parts.map((p, i) => (
          <div key={p.n} style={{ width: `${s[i]}%` }} className={`flex items-center justify-center text-xs font-bold border-r last:border-r-0 ${p.c}`}>
            {s[i]}%
          </div>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-4">
        {parts.map((p, i) => (
          <div key={p.n} className="p-3 rounded-xl bg-black/40 border border-white/10">
            <div className="text-sm font-semibold text-white">{p.n}: {Math.round((N * s[i]) / 100)} rows</div>
            <p className="text-xs text-gray-400 leading-relaxed mt-1 mb-0">{p.d}</p>
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Lab 4 — regression metrics worked by hand on five houses
--------------------------------------------------------------------------- */

const ACTUAL = [310, 450, 280, 520, 390];
const PRED = [330, 420, 300, 480, 410];

function RegressionWorked() {
  const err = ACTUAL.map((a, i) => PRED[i] - a);
  const mae = mean(err.map(Math.abs));
  const mse = mean(err.map((e) => e * e));
  const rmse = Math.sqrt(mse);
  const my = mean(ACTUAL);
  const ssTot = ACTUAL.reduce((s, a) => s + (a - my) ** 2, 0);
  const ssRes = err.reduce((s, e) => s + e * e, 0);
  const r2 = 1 - ssRes / ssTot;
  return (
    <Panel tone="emerald" title="Regression error, worked by hand (prices in $1,000s)">
      <div className="overflow-x-auto rounded-xl border border-white/10 mb-4">
        <table className="w-full text-xs sm:text-sm border-collapse">
          <thead>
            <tr className="bg-white/5 text-gray-300">
              {["House", "Actual", "Predicted", "Error (pred − actual)", "|Error|", "Error²"].map((h) => (
                <th key={h} className="p-2.5 text-left font-semibold border-b border-white/10">{h}</th>
              ))}
            </tr>
          </thead>
          <tbody className="text-gray-300 font-mono">
            {ACTUAL.map((a, i) => (
              <tr key={i} className={i % 2 ? "bg-white/[0.02]" : ""}>
                <td className="p-2.5 border-b border-white/5">{i + 1}</td>
                <td className="p-2.5 border-b border-white/5">{a}</td>
                <td className="p-2.5 border-b border-white/5">{PRED[i]}</td>
                <td className="p-2.5 border-b border-white/5">{err[i] > 0 ? "+" : ""}{err[i]}</td>
                <td className="p-2.5 border-b border-white/5">{Math.abs(err[i])}</td>
                <td className="p-2.5 border-b border-white/5">{err[i] * err[i]}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        <Metric label="MAE" value={`$${fmt(mae, 0)}k`} tone="emerald" sub="average of |error|: 'off by $26k on average'" />
        <Metric label="MSE" value={fmt(mse, 0)} tone="amber" sub="average of error²: units are $k², hard to read" />
        <Metric label="RMSE" value={`$${fmt(rmse, 1)}k`} tone="rose" sub="√MSE: back in dollars, big misses weigh more" />
        <Metric label="R²" value={fmt(r2, 3)} tone="indigo" sub={`1 − ${fmt(ssRes, 0)} / ${fmt(ssTot, 0)}: share of variance explained`} />
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Lab 5 — confusion matrix: why accuracy alone can lie
   1,000 card transactions, 10 of them fraud.
--------------------------------------------------------------------------- */

const FRAUD_MODELS = [
  { v: "never", label: "Always says 'legit'", tp: 0, fn: 10, fp: 0, tn: 990, note: "Never flags anything. Looks brilliant on accuracy and catches no fraud at all." },
  { v: "balanced", label: "A real model", tp: 8, fn: 2, fp: 22, tn: 968, note: "Catches most fraud, annoys some honest customers. A trade-off you can tune." },
  { v: "paranoid", label: "Flags almost everything", tp: 10, fn: 0, fp: 190, tn: 800, note: "Catches every fraud, but 19 out of 20 alerts are false alarms." },
];

function ConfusionLab() {
  const [pick, setPick] = useState("never");
  const mdl = FRAUD_MODELS.find((x) => x.v === pick);
  const { tp, fn, fp, tn } = mdl;
  const total = tp + fn + fp + tn;
  const acc = (tp + tn) / total;
  const prec = tp + fp === 0 ? NaN : tp / (tp + fp);
  const rec = tp / (tp + fn);
  const f1 = Number.isFinite(prec) && prec + rec > 0 ? (2 * prec * rec) / (prec + rec) : 0;
  const cell = "p-3 rounded-lg border text-center";
  return (
    <Panel tone="rose" title="Same data, three models, very different stories">
      <Segmented tone="rose" value={pick} onChange={setPick} options={FRAUD_MODELS.map((x) => ({ v: x.v, label: x.label }))} />
      <p className="text-sm text-gray-400 mt-3 mb-4 leading-relaxed">{mdl.note}</p>
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,320px)_minmax(0,1fr)] gap-5">
        <div>
          <div className="grid grid-cols-[auto_1fr_1fr] gap-1.5 text-xs items-stretch">
            <div />
            <div className="text-center text-gray-500 pb-1">predicted fraud</div>
            <div className="text-center text-gray-500 pb-1">predicted legit</div>
            <div className="text-gray-500 self-center pr-1 text-right">actually fraud</div>
            <div className={`${cell} bg-emerald-500/15 border-emerald-500/40`}><div className="text-emerald-300 font-mono text-lg font-bold">{tp}</div><div className="text-gray-400">true positive</div></div>
            <div className={`${cell} bg-rose-500/15 border-rose-500/40`}><div className="text-rose-300 font-mono text-lg font-bold">{fn}</div><div className="text-gray-400">false negative</div></div>
            <div className="text-gray-500 self-center pr-1 text-right">actually legit</div>
            <div className={`${cell} bg-amber-500/15 border-amber-500/40`}><div className="text-amber-300 font-mono text-lg font-bold">{fp}</div><div className="text-gray-400">false positive</div></div>
            <div className={`${cell} bg-white/5 border-white/10`}><div className="text-gray-200 font-mono text-lg font-bold">{tn}</div><div className="text-gray-400">true negative</div></div>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-2 content-start">
          <Metric label="Accuracy" value={pct(acc)} tone="indigo" sub="(TP + TN) / all" />
          <Metric label="Recall" value={pct(rec)} tone="emerald" sub="TP / (TP + FN): fraud caught" />
          <Metric label="Precision" value={Number.isFinite(prec) ? pct(prec) : "n/a"} tone="amber" sub={Number.isFinite(prec) ? "TP / (TP + FP): alerts that were real" : "no alerts were raised"} />
          <Metric label="F1" value={fmt(f1, 2)} tone="purple" sub="harmonic mean of the two" />
        </div>
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   K-fold cross validation, with a choice of k
--------------------------------------------------------------------------- */

function KFoldVisual() {
  const [k, setK] = useState(5);
  const n = 100;
  const testRows = n / k;
  return (
    <Panel tone="teal" title="K-fold on 100 rows">
      <Segmented
        tone="teal"
        value={k}
        onChange={setK}
        options={[{ v: 3, label: "k = 3" }, { v: 5, label: "k = 5" }, { v: 10, label: "k = 10" }]}
      />
      <div className="space-y-1.5 mt-4">
        {Array.from({ length: k }).map((_, fold) => (
          <div key={fold} className="flex items-center gap-3">
            <span className="text-[0.625rem] font-mono text-gray-500 w-14 shrink-0">Round {fold + 1}</span>
            <div className="flex-1 flex gap-0.5">
              {Array.from({ length: k }).map((_, i) => (
                <div
                  key={i}
                  className={`flex-1 h-6 rounded flex items-center justify-center text-[0.5rem] sm:text-[0.5625rem] font-bold ${
                    i === fold
                      ? "bg-amber-500/25 border border-amber-500/50 text-amber-200"
                      : "bg-emerald-500/15 border border-emerald-500/30 text-emerald-300/70"
                  }`}
                >
                  {k <= 5 ? (i === fold ? "TEST" : "train") : i === fold ? "T" : ""}
                </div>
              ))}
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-400 mt-4 leading-relaxed mb-0">
        With <strong className="text-gray-200">k = {k}</strong>, each round trains on {n - testRows} rows and tests on{" "}
        {testRows}. The model is trained {k} separate times from scratch, every row is used for testing exactly once, and
        the {k} scores are averaged (and their spread reported). Larger k means more training data per round and a less
        pessimistic estimate, at {k}× the compute.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Static content
--------------------------------------------------------------------------- */

const VOCAB = [
  { t: "Feature (x)", tone: "indigo", d: "One measurable input about an example: square metres, number of bedrooms, a word count, a pixel value. The model's inputs are usually many features at once, called a feature vector." },
  { t: "Label / target (y)", tone: "emerald", d: "The correct answer attached to an example in the training data: the sale price, 'spam', 'cat'. This is what 'supervised' refers to: a teacher supplied the answer." },
  { t: "Example (row)", tone: "blue", d: "One complete case: its features plus its label. A dataset of 10,000 houses has 10,000 examples." },
  { t: "Model", tone: "purple", d: "A function with adjustable settings that maps features to a prediction. A straight line, a decision tree and a neural network are all models, just with very different shapes." },
  { t: "Parameters", tone: "amber", d: "The settings the training process finds by itself: the slope and intercept of a line, the weights of a neural network. You never type these in; they are learned from the data." },
  { t: "Hyperparameters", tone: "rose", d: "Settings you choose before training that control how learning happens: tree depth, learning rate, number of neighbours k. They are tuned by trying values and checking a validation set." },
  { t: "Loss function", tone: "teal", d: "A single number scoring how wrong the model's predictions are on the training data. Training is the search for parameters that make this number small." },
  { t: "Inference", tone: "indigo", d: "Using the finished model on new inputs whose labels you do not know. Training happens once (or occasionally); inference happens every time someone uses the product." },
];

const SAMPLE_ROWS = [
  { size: 85, beds: 2, age: 12, price: "$310k" },
  { size: 140, beds: 4, age: 3, price: "$450k" },
  { size: 70, beds: 2, age: 30, price: "$280k" },
  { size: 165, beds: 5, age: 8, price: "$520k" },
];

const ALGOS = [
  { name: "Linear Regression", task: "Regression", href: "#/ml/linear-regression", how: "Draws the best straight line (or flat plane) through the data and reads predictions off it. Each feature gets one weight meaning 'how much does the answer move per unit of this feature'.", good: "Fast, needs little data, and the weights are directly explainable. Always the first baseline for a numeric target.", watch: "Cannot bend. Sensitive to outliers, and misses any relationship that is not roughly a straight line." },
  { name: "Logistic Regression", task: "Classification", href: "#/ml/logistic-regression", how: "A linear model whose output is squashed into a probability between 0 and 1 by an S-shaped curve; you then pick a threshold such as 0.5.", good: "Fast, calibrated-ish probabilities, interpretable weights, a hard-to-beat baseline for classification.", watch: "The boundary between classes is a straight line (or flat plane) unless you engineer extra features." },
  { name: "Decision Tree", task: "Both", href: "#/ml/decision-trees", how: "Plays 20 questions: 'size > 100 m²? yes → age < 10? …' Each question splits the data until the leaves are nearly pure.", good: "Readable as plain if/else rules, needs no feature scaling, handles mixed numeric and categorical data.", watch: "One tree overfits easily: given enough depth it memorises the training set." },
  { name: "Random Forest", task: "Both", href: "#/ml/random-forests", how: "Trains hundreds of different trees on random slices of the rows and columns, then averages their votes. Disagreeing mistakes cancel out.", good: "Strong, forgiving default for tabular data with little tuning. Hard to badly overfit.", watch: "Slower and bulkier than one tree, and no longer readable as a single set of rules." },
  { name: "Gradient Boosting (XGBoost, LightGBM)", task: "Both", href: "#/ml/xgboost", how: "Builds trees one after another, each one trained to fix the mistakes of the ensemble so far.", good: "Usually the most accurate method on spreadsheet-style data; wins most tabular competitions.", watch: "Many hyperparameters; will overfit noisy data if you let it run too long without early stopping." },
  { name: "Support Vector Machine", task: "Classification", href: "#/ml/svm", how: "Finds the boundary that leaves the widest possible empty margin between the classes; kernels let that boundary curve.", good: "Excellent on small or medium, high-dimensional datasets such as text features.", watch: "Slow to train on very large data, needs scaled features, and its scores are not probabilities." },
  { name: "k-Nearest Neighbours", task: "Both", href: "#/ml/knn", how: "Does no training at all. To predict, it finds the k most similar stored examples and copies their majority label (or averages their values).", good: "Simple, makes no assumptions about the shape of the data.", watch: "Slow at prediction time, hurt by irrelevant features, and 'similar' falls apart in very high dimensions." },
  { name: "Naive Bayes", task: "Classification", href: "#/ml/naive-bayes", how: "Uses Bayes' theorem and assumes features are independent given the class, which turns training into counting.", good: "Works with tiny datasets and is a classic strong baseline for text such as spam filtering.", watch: "Ranks classes well but its probabilities are overconfident." },
  { name: "Neural Network", task: "Both", href: "#/ml/deep-learning", how: "Layers of simple adjustable units stacked so that early layers learn small patterns and later layers combine them into complex ones.", good: "State of the art on images, audio, text and other unstructured data, where hand-built features are impractical.", watch: "Needs lots of data and compute, many hyperparameters, and is the hardest to interpret." },
];

const DIAGNOSIS = [
  { sym: "Training error high, test error high", what: "Underfitting (high bias)", fix: "Use a more flexible model, add informative features, train longer, or reduce regularisation." },
  { sym: "Training error low, test error much higher", what: "Overfitting (high variance)", fix: "Get more data, simplify the model, add regularisation or dropout, stop training earlier, or use an ensemble." },
  { sym: "Both low and close together", what: "Good generalisation", fix: "Confirm on the untouched test set, then ship. Keep monitoring once live." },
  { sym: "Both high, and test is not much worse", what: "The signal may not be in your features", fix: "Look at the data: is the label noisy, or are the features simply not predictive? A bigger model will not fix that." },
];

const PITFALLS = [
  { t: "Data leakage", tone: "rose", d: "Information from the test rows (or from the future) sneaks into training. Classic cases: scaling or imputing on the whole dataset before splitting, a feature that is computed from the label, or the same customer appearing in both train and test. The score looks excellent and collapses in production. Fit every preprocessing step on the training fold only (a scikit-learn Pipeline does this for you)." },
  { t: "Tuning on the test set", tone: "amber", d: "Every time you look at the test score and change something, the test set leaks a little into your choices. After enough rounds it is no longer an independent check. Tune on validation data or with cross-validation; touch the test set once." },
  { t: "Class imbalance", tone: "indigo", d: "When one class is rare (fraud, disease, churn), a model can score 99% accuracy by never predicting it. Use stratified splits, judge it with precision, recall and the PR curve, and consider class weights or resampling." },
  { t: "Distribution shift", tone: "teal", d: "The data you trained on stops resembling the data the model meets: new customers, new seasons, new camera. A random split cannot warn you. For anything time-based, split by time (train on the past, test on the future) and monitor after launch." },
  { t: "Noisy or biased labels", tone: "purple", d: "The model faithfully learns whatever the labels say, including annotator mistakes and historical bias. A hiring model trained on past decisions learns those decisions. Audit a sample of labels by hand before blaming the algorithm." },
  { t: "Optimising the wrong metric", tone: "emerald", d: "A model tuned for accuracy, RMSE or F1 may not help the actual business goal. Decide what an error costs (a missed fraud versus an annoyed customer) before choosing the metric and the decision threshold." },
];

const toc = [
  { label: "How It Works", hash: "#how" },
  { label: "The Vocabulary", hash: "#vocab" },
  { label: "How a Model Learns", hash: "#learning" },
  { label: "Regression vs Classification", hash: "#reg-vs-class" },
  { label: "Classification Types", hash: "#classification-details" },
  { label: "Algorithm Cheat Sheet", hash: "#algorithms" },
  { label: "Overfitting & Underfitting", hash: "#fit" },
  { label: "Train / Validation / Test", hash: "#splits" },
  { label: "Evaluation Metrics", hash: "#evaluation" },
  { label: "Cross-Validation", hash: "#kfold" },
  { label: "Common Pitfalls", hash: "#pitfalls" },
  { label: "In Code", hash: "#code" },
];

export default function MlSupervised() {
  return (
    <GuideLayout
      title="Supervised Learning"
      intro="Models trained on labelled data: every example comes with the right answer, and the model learns the mapping from input to output so it can answer for inputs it has never seen."
      toc={toc}
    >
      {/* ------------------------------------------------------------- */}
      <Section
        id="how"
        title="How It Works"
        lead={'Imagine learning to value houses by studying 10,000 past sales. For each one you are shown the facts (size, bedrooms, age) and then the real sale price, like flashcards with the answer on the back. After enough cards you start to feel how the facts relate to the price, and you can estimate a house you have never seen. That is supervised learning. The "supervision" is the answer key.'}
      >
        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 flex flex-col sm:flex-row items-stretch sm:items-center justify-center gap-3 text-xs font-mono mb-6">
          <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-center">
            Labelled data<br /><span className="text-gray-500">(features + answers)</span>
          </div>
          <span className="text-gray-600 text-center">→</span>
          <div className="px-3 py-2 rounded-lg bg-indigo-500/15 border border-indigo-500/40 text-indigo-200 text-center">
            Training<br /><span className="text-indigo-300/70">tune the knobs</span>
          </div>
          <span className="text-gray-600 text-center">→</span>
          <div className="px-3 py-2 rounded-lg bg-white/5 border border-white/10 text-gray-300 text-center">
            Trained model
          </div>
          <span className="text-gray-600 text-center">→</span>
          <div className="px-3 py-2 rounded-lg bg-emerald-500/15 border border-emerald-500/40 text-emerald-200 text-center">
            Predict<br /><span className="text-emerald-300/70">on new inputs</span>
          </div>
        </div>

        <div className="overflow-x-auto rounded-xl border border-white/10 mb-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-white/5">
                <th colSpan={3} className="p-2.5 text-center text-indigo-300 border-b border-white/10 font-semibold">Features (inputs)</th>
                <th className="p-2.5 text-center text-emerald-300 border-b border-l border-white/10 font-semibold">Label (answer)</th>
              </tr>
              <tr className="bg-white/[0.03] text-gray-400 text-xs">
                <th className="p-2.5 text-left font-semibold border-b border-white/10">Size (m²)</th>
                <th className="p-2.5 text-left font-semibold border-b border-white/10">Bedrooms</th>
                <th className="p-2.5 text-left font-semibold border-b border-white/10">Age (years)</th>
                <th className="p-2.5 text-left font-semibold border-b border-l border-white/10">Sale price</th>
              </tr>
            </thead>
            <tbody className="font-mono text-gray-300">
              {SAMPLE_ROWS.map((r, i) => (
                <tr key={i} className={i % 2 ? "bg-white/[0.02]" : ""}>
                  <td className="p-2.5 border-b border-white/5">{r.size}</td>
                  <td className="p-2.5 border-b border-white/5">{r.beds}</td>
                  <td className="p-2.5 border-b border-white/5">{r.age}</td>
                  <td className="p-2.5 border-b border-l border-white/5 text-emerald-300">{r.price}</td>
                </tr>
              ))}
              <tr>
                <td className="p-2.5 text-gray-300">118</td>
                <td className="p-2.5 text-gray-300">3</td>
                <td className="p-2.5 text-gray-300">15</td>
                <td className="p-2.5 border-l border-white/5 text-amber-300">? (to predict)</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card title="1. Training: learn from answers" tone="indigo">
            <p>The model sees thousands of rows, makes a guess for each, compares the guess to the true label, and nudges its internal settings to be a little less wrong next time. Repeated many times, the settings settle on values that fit the data well.</p>
          </Card>
          <Card title="2. Inference: answer new questions" tone="emerald">
            <p>Training is over and the settings are frozen. You hand the model a row without a label (the bottom row above) and it computes a prediction from what it learned. No answer key is involved at this stage.</p>
          </Card>
          <Card title="3. The real goal: generalise" tone="amber">
            <p>Getting the training rows right is easy: a model could simply memorise them. The point is accuracy on <em>new</em> rows. Almost every technique on this page exists to measure or improve that.</p>
          </Card>
        </div>

        <Note tone="indigo">
          Where do labels come from? Sometimes naturally (a house really did sell for that price, a customer really did
          cancel), sometimes from people hand-labelling thousands of images or emails. Labels are usually the most
          expensive part of a supervised project, which is why the unsupervised and self-supervised approaches exist.
        </Note>
      </Section>

      {/* ------------------------------------------------------------- */}
      <Section id="vocab" title="The Vocabulary" lead="Eight terms come up in every supervised-learning conversation. They are simple once you attach each to the house example.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {VOCAB.map((v) => (
            <Card key={v.t} title={v.t} tone={v.tone}><p>{v.d}</p></Card>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------- */}
      <Section
        id="learning"
        title="How a Model Learns"
        lead="Behind every supervised algorithm, from a straight line to a billion-parameter network, sits the same four-step loop."
      >
        <div className="grid grid-cols-1 md:grid-cols-4 gap-3 mb-6">
          {[
            { n: "1", t: "Predict", d: "Run the current model on the training rows to get a guess for each.", tone: "indigo" },
            { n: "2", t: "Measure the miss", d: "A loss function turns all the gaps between guess and truth into one number.", tone: "rose" },
            { n: "3", t: "Adjust", d: "Work out which direction to move each parameter to shrink the loss, and move a small step that way.", tone: "amber" },
            { n: "4", t: "Repeat", d: "Loop until the loss stops improving (or a time budget runs out).", tone: "emerald" },
          ].map((s) => (
            <Card key={s.n} title={`${s.n}. ${s.t}`} tone={s.tone}><p>{s.d}</p></Card>
          ))}
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <Card title="The loss function: one number for 'how wrong'" tone="rose">
            <p>For a numeric target the usual choice is <strong className="text-white">mean squared error</strong>: take each prediction's miss, square it, and average. Squaring does two jobs: it makes over- and under-shooting both count as bad, and it punishes one big miss far more than several small ones.</p>
            <p>For categories the usual choice is <strong className="text-white">cross-entropy</strong>, which charges the model heavily for being confidently wrong ("99% sure it is spam" when it is not).</p>
          </Card>
          <Card title="Gradient descent: walking downhill in fog" tone="amber">
            <p>Picture the loss as a landscape: each position is one choice of parameters, the height is the error. You cannot see the valley, but at your feet you can feel which way is downhill (the <em>gradient</em>). Step that way, feel again, repeat.</p>
            <p>The <strong className="text-white">learning rate</strong> is the stride length. Too small and training crawls; too large and you leap across the valley and bounce around or diverge.</p>
          </Card>
        </div>

        <LearnLab />

        <p className="text-sm text-gray-400 leading-relaxed max-w-3xl mt-5">
          For a straight line there is also a closed-form shortcut (the green line) that gives the best a and b in one
          calculation. Gradient descent earns its keep when there is no such formula: neural networks, boosted trees
          and most modern models are trained exactly this way, just with millions of knobs instead of two.
        </p>
      </Section>

      {/* ------------------------------------------------------------- */}
      <Section
        id="reg-vs-class"
        title="Regression vs Classification"
        lead="Supervised problems come in two shapes, decided entirely by what kind of label you are predicting: a number on a continuous scale, or one of a fixed set of categories."
      >
        <RegVsClassVisual />
        <div className="overflow-x-auto rounded-xl border border-white/10 mt-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-300">
                <th className="p-3 text-left font-semibold border-b border-white/10"></th>
                <th className="p-3 text-left font-semibold border-b border-white/10 text-emerald-300">Regression</th>
                <th className="p-3 text-left font-semibold border-b border-white/10 text-blue-300">Classification</th>
              </tr>
            </thead>
            <tbody className="text-gray-400 text-xs sm:text-sm">
              {[
                ["Predicts", "A quantity: 412,000 / 21.5 °C / 3.2 hours", "A category: spam / cat / fraud"],
                ["Label type", "Continuous number", "Discrete class"],
                ["Typical loss", "Mean squared error, mean absolute error", "Cross-entropy (log loss)"],
                ["Typical metrics", "MAE, RMSE, R²", "Accuracy, precision, recall, F1, ROC-AUC"],
                ["Examples", "Price, demand, ETA, temperature", "Spam, diagnosis, defect, churn, intent"],
              ].map((r, i) => (
                <tr key={r[0]} className={i % 2 ? "bg-white/[0.02]" : ""}>
                  <td className="p-3 border-b border-white/5 font-semibold text-gray-200">{r[0]}</td>
                  <td className="p-3 border-b border-white/5">{r[1]}</td>
                  <td className="p-3 border-b border-white/5">{r[2]}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card title="A quick test" tone="indigo">
            <p>Ask: does it make sense to <em>average</em> two answers? The average of $300k and $400k is a sensible $350k, so that is regression. The average of "spam" and "not spam" is meaningless, so that is classification.</p>
          </Card>
          <Card title="Classifiers score first" tone="purple">
            <p>Most classifiers actually output a probability, then apply a threshold (often 0.5) to produce the label. Moving that threshold is how you trade false alarms against misses without retraining.</p>
          </Card>
          <Card title="Grey areas" tone="teal">
            <p>Star ratings (1-5) are ordered categories; counts (3 visitors) are whole numbers. You can treat either as regression or classification. Pick the one that matches how errors should be judged: is predicting 4 when the truth is 5 half as bad as predicting 1?</p>
          </Card>
        </div>
      </Section>

      {/* ------------------------------------------------------------- */}
      <Section
        id="classification-details"
        title="Classification Types"
        lead="Classification splits further by how many categories there are and whether an example can belong to more than one."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card title="Binary" tone="blue">
            <p><strong className="text-white">Exactly two classes</strong>, usually 'positive' (the thing you are hunting for) and 'negative'. Spam vs not spam, fraud vs legitimate.</p>
            <p>The model produces one probability, via a <em>sigmoid</em> curve, and a threshold decides.</p>
          </Card>
          <Card title="Multi-class" tone="purple">
            <p><strong className="text-white">One label out of many, and exactly one.</strong> Which digit 0-9; which of 50 animal species.</p>
            <p>The model produces one probability per class that sum to 1, via <em>softmax</em>, and the largest wins.</p>
          </Card>
          <Card title="Multi-label" tone="teal">
            <p><strong className="text-white">Any number of labels at once.</strong> A photo can be 'beach', 'sunset' and 'dog' together.</p>
            <p>Each label is an independent yes/no question with its own sigmoid; the probabilities need not sum to 1.</p>
          </Card>
        </div>
        <Note tone="amber">
          Easy to confuse: <em>multi-class</em> means picking one of many, <em>multi-label</em> means picking several. Using
          softmax on a multi-label problem forces the labels to compete and quietly caps you at one answer.
        </Note>
      </Section>

      {/* ------------------------------------------------------------- */}
      <Section
        id="algorithms"
        title="Algorithm Cheat Sheet"
        lead="There is no single best algorithm; which wins depends on the data. What helps is knowing how each one thinks, so you can predict where it will shine and where it will stumble. Each card links to a full page."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {ALGOS.map((a) => (
            <div key={a.name} className="p-5 rounded-xl border border-white/10 bg-white/5">
              <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                <h3 className="font-semibold text-white m-0 text-base">{a.name}</h3>
                <span
                  className={`text-[0.625rem] font-bold uppercase px-2 py-0.5 rounded-full border ${
                    a.task === "Classification" ? "border-blue-500/40 text-blue-300" : a.task === "Both" ? "border-gray-500/40 text-gray-300" : "border-emerald-500/40 text-emerald-300"
                  }`}
                >
                  {a.task === "Both" ? "Regression + Classification" : a.task}
                </span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed mb-3"><strong className="text-gray-100">How it thinks.</strong> {a.how}</p>
              <p className="text-xs text-emerald-300/90 leading-relaxed mb-2"><strong>Good at.</strong> <span className="text-gray-400">{a.good}</span></p>
              <p className="text-xs text-rose-300/90 leading-relaxed mb-3"><strong>Watch out.</strong> <span className="text-gray-400">{a.watch}</span></p>
              <a href={a.href} className="text-xs text-blue-400 hover:underline">Open the full page →</a>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card title="Spreadsheet-style (tabular) data" tone="emerald">
            <p>Start with a linear or logistic baseline, then try gradient boosting (XGBoost or LightGBM). On rows-and-columns data it is the most reliable winner.</p>
          </Card>
          <Card title="Images, audio, free text" tone="purple">
            <p>Neural networks dominate, usually by fine-tuning a pretrained model rather than training from scratch.</p>
          </Card>
          <Card title="Tiny dataset or need to explain" tone="amber">
            <p>Prefer simple, interpretable models: linear or logistic regression, a shallow tree, Naive Bayes. Fewer parameters also means less to overfit.</p>
          </Card>
        </div>
      </Section>

      {/* ------------------------------------------------------------- */}
      <Section
        id="fit"
        title="Overfitting & Underfitting"
        lead="The central tension in supervised learning. A model that is too simple misses the real pattern (underfitting). One that is too flexible also learns the random noise in the particular sample it was shown (overfitting), and then does worse on new data. The only way to know which you have is to test on data the model never trained on."
      >
        <FitVisual />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 my-6">
          <Card title="Bias: error from being too rigid" tone="rose">
            <p>A straight line fitted to a curve is wrong in a systematic way no matter how much data you give it. That consistent, built-in error is <em>bias</em>. High-bias models underfit.</p>
          </Card>
          <Card title="Variance: error from being too jumpy" tone="amber">
            <p>A very flexible model fitted to a different random sample would produce a noticeably different curve. That sensitivity to the particular training data is <em>variance</em>. High-variance models overfit.</p>
          </Card>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed max-w-3xl mb-6">
          Making a model more complex lowers bias but raises variance, so total test error is U-shaped: it falls, bottoms
          out, then climbs. This is the <strong className="text-gray-200">bias-variance trade-off</strong>. Below, drag the
          slider through all nine degrees and find the bottom of the U yourself.
        </p>

        <FitLab />

        <div className="overflow-x-auto rounded-xl border border-white/10 mt-6">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-white/5 text-gray-300">
                <th className="p-3 text-left font-semibold border-b border-white/10">What you see</th>
                <th className="p-3 text-left font-semibold border-b border-white/10">Diagnosis</th>
                <th className="p-3 text-left font-semibold border-b border-white/10">What to try</th>
              </tr>
            </thead>
            <tbody className="text-gray-400 text-xs sm:text-sm">
              {DIAGNOSIS.map((d, i) => (
                <tr key={d.sym} className={i % 2 ? "bg-white/[0.02]" : ""}>
                  <td className="p-3 border-b border-white/5 text-gray-200">{d.sym}</td>
                  <td className="p-3 border-b border-white/5 font-semibold text-gray-200">{d.what}</td>
                  <td className="p-3 border-b border-white/5">{d.fix}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3 leading-relaxed max-w-3xl">
          Regularisation (a penalty that discourages extreme parameter values) is the standard cure for overfitting; see{" "}
          <a href="#/ml/regularization" className="text-blue-400 hover:underline">Regularization</a>.
        </p>
      </Section>

      {/* ------------------------------------------------------------- */}
      <Section
        id="splits"
        title="Train / Validation / Test"
        lead="Because a model can memorise, its score on the data it trained on tells you nothing about how it will do in the real world. So you hold some labelled data back and pretend it is the future. A useful way to remember the three sets is exam preparation."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card title="Training set = practice problems" tone="emerald"><p>You study from them and see the solutions. Doing well on these proves little; you may just have memorised the answers.</p></Card>
          <Card title="Validation set = mock exam" tone="indigo"><p>Fresh questions you take repeatedly to decide which study method (which model, which hyperparameters) works best. Because you keep choosing based on it, its score slowly becomes optimistic.</p></Card>
          <Card title="Test set = the final exam" tone="amber"><p>Taken once, at the very end, with no changes afterwards. It gives the unbiased estimate of real-world performance, but only if you did not peek.</p></Card>
        </div>

        <SplitLab />

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card title="Rules that keep the score honest" tone="rose">
            <ul className="list-disc pl-5 space-y-1.5 text-sm text-gray-300">
              <li>Split <em>first</em>, then compute scalers, imputers and encoders on the training portion only.</li>
              <li>Shuffle before splitting, unless the rows have a time order (then split by time).</li>
              <li>For classification with rare classes, <em>stratify</em> so each split keeps the same class proportions.</li>
              <li>Keep rows from the same person, device or patient together on one side of the split.</li>
            </ul>
          </Card>
          <Card title="How big should the splits be?" tone="teal">
            <p>It depends on how much data you have. With millions of rows, 98/1/1 is plenty because 1% is still tens of thousands of test examples. With a few hundred rows, a fixed split wastes precious data and gives a noisy score. That situation is what cross-validation (below) is for.</p>
          </Card>
        </div>
      </Section>

      {/* ------------------------------------------------------------- */}
      <Section
        id="evaluation"
        title="Evaluation Metrics"
        lead="A metric is how you turn 'is the model good?' into a number. Which one you choose should come from what an error actually costs you."
      >
        <h3 className="text-lg font-semibold mb-3 text-gray-200">Regression: how far off are the numbers?</h3>
        <p className="text-sm text-gray-400 leading-relaxed max-w-3xl mb-4">
          Every regression metric starts from the same ingredient: the error of each prediction (predicted minus actual).
          They differ in how they combine those errors. The table works through five houses so you can see every
          number appear.
        </p>
        <RegressionWorked />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4 mb-10">
          <Card title="MAE: the honest average" tone="emerald"><p>Easiest to explain to a stakeholder ("we are off by about $26k"). Treats every dollar of error equally.</p></Card>
          <Card title="RMSE: punishes big misses" tone="rose"><p>Squaring before averaging makes one $100k blunder count far more than five $20k ones. Choose it when large errors are disproportionately costly.</p></Card>
          <Card title="R²: compared with guessing the average" tone="indigo"><p>1.0 is perfect, 0 means no better than always predicting the mean price, and it can go negative on new data if the model is worse than that.</p></Card>
        </div>

        <h3 className="text-lg font-semibold mb-3 text-gray-200">Classification: how often, and in which direction, is it wrong?</h3>
        <p className="text-sm text-gray-400 leading-relaxed max-w-3xl mb-4">
          For classification, "wrong" has two different flavours, and they rarely cost the same. The{" "}
          <strong className="text-gray-200">confusion matrix</strong> counts all four outcomes. Try the three models
          below: they were all tested on the same 1,000 transactions, 10 of which were fraud.
        </p>
        <ConfusionLab />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
          <Card title="Accuracy" tone="indigo"><p>The share of all predictions that were right. Fine when classes are balanced and errors cost the same. Misleading otherwise: the first model above scores 99% and is useless.</p></Card>
          <Card title="Precision vs recall" tone="amber"><p><strong className="text-white">Precision</strong>: of the alerts raised, how many were real? <strong className="text-white">Recall</strong>: of the real cases, how many did we catch? Raising the threshold trades recall for precision; lowering it does the opposite.</p></Card>
          <Card title="F1" tone="purple"><p>One number that is only high when precision and recall are both high. Use it when you need a single score and both error types matter.</p></Card>
        </div>
        <p className="text-xs text-gray-500 mt-4 leading-relaxed max-w-3xl">
          Also see <a href="#/ml/evaluation-metrics" className="text-blue-400 hover:underline">Evaluation Metrics</a> for
          ROC and PR curves, threshold selection and calibration.
        </p>
      </Section>

      {/* ------------------------------------------------------------- */}
      <Section
        id="kfold"
        title="Cross-Validation"
        lead="A single train/test split can be lucky or unlucky: if the hardest rows land in the test set, the model looks worse than it is, and vice versa. With small datasets that noise is large. K-fold cross-validation removes the luck by rotating which slice is held out."
      >
        <KFoldVisual />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card title="Reading the result" tone="teal">
            <p>You get k scores. Report the <strong className="text-white">mean</strong> as your estimate and the <strong className="text-white">standard deviation</strong> as how much it wobbles. If the spread is large relative to the gap between two models, you cannot honestly say which is better.</p>
            <p>The k fitted models are thrown away; cross-validation is for <em>measuring</em> a method. Afterwards, retrain on all the training data to get the model you deploy.</p>
          </Card>
          <Card title="Variants for awkward data" tone="purple">
            <ul className="list-disc pl-5 space-y-1.5">
              <li><strong className="text-white">StratifiedKFold</strong>: keeps class proportions in every fold (use for classification).</li>
              <li><strong className="text-white">GroupKFold</strong>: keeps all rows from one patient or user in the same fold.</li>
              <li><strong className="text-white">TimeSeriesSplit</strong>: always trains on the past and tests on the future.</li>
              <li><strong className="text-white">Nested CV</strong>: an outer loop for scoring wrapped around an inner loop for tuning, so tuning cannot flatter the score.</li>
            </ul>
          </Card>
        </div>
      </Section>

      {/* ------------------------------------------------------------- */}
      <Section
        id="pitfalls"
        title="Common Pitfalls"
        lead="Most failed supervised-learning projects fail for one of these six reasons rather than because the algorithm was wrong."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {PITFALLS.map((p) => (
            <Card key={p.t} title={p.t} tone={p.tone}><p>{p.d}</p></Card>
          ))}
        </div>
      </Section>

      {/* ------------------------------------------------------------- */}
      <Section id="code" title="In Code" lead="The whole workflow in scikit-learn: split first, build a pipeline so preprocessing is fitted on training data only, cross-validate to compare, then spend the test set once.">
        <CodeBlock
          language="python"
          code={`import numpy as np
from sklearn.datasets import load_breast_cancer
from sklearn.model_selection import train_test_split, StratifiedKFold, cross_val_score
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.ensemble import RandomForestClassifier
from sklearn.metrics import classification_report, confusion_matrix

X, y = load_breast_cancer(return_X_y=True)

# 1. Hold out a test set FIRST. stratify=y keeps the class balance in both halves.
X_train, X_test, y_train, y_test = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

# 2. Pipelines apply the scaler inside each fold, using only that fold's training rows.
candidates = {
    "logistic": make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000)),
    "forest": RandomForestClassifier(n_estimators=300, random_state=42),
}

# 3. Compare candidates with stratified 5-fold cross-validation on the training data.
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=42)
for name, model in candidates.items():
    scores = cross_val_score(model, X_train, y_train, cv=cv, scoring="f1")
    print(f"{name:9s} F1 = {scores.mean():.3f} ± {scores.std():.3f}")

# 4. Refit the winner on all training data, then look at the test set ONCE.
best = candidates["logistic"]
best.fit(X_train, y_train)
pred = best.predict(X_test)
print(confusion_matrix(y_test, pred))
print(classification_report(y_test, pred))

# Regression is the same recipe with different scoring:
#   cross_val_score(model, X, y, cv=5, scoring="neg_root_mean_squared_error")
#   (scikit-learn negates error metrics so that "higher is better" always holds)

# Diagnose over/underfitting: compare training and validation scores.
train_score = best.score(X_train, y_train)
val_scores = cross_val_score(best, X_train, y_train, cv=cv)
print(f"train {train_score:.3f}  vs  cv {val_scores.mean():.3f}")
# big gap -> overfitting; both low -> underfitting`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("ml-supervised")} />
    </GuideLayout>
  );
}

import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section, Segmented } from "../components/VizKit";
import { rng, randn, solve, fmt } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "regularization", "regularisation", "bias variance tradeoff", "bias-variance", "overfitting", "underfitting",
  "ridge regression", "L2 regularization", "weight decay", "lasso", "L1 regularization", "elastic net", "sparsity",
  "feature selection", "hyperparameter tuning", "grid search", "random search", "Bayesian optimization", "Optuna",
  "early stopping", "dropout", "data augmentation", "learning curve", "validation curve", "model complexity",
];

/* ---------------------------------------------------------------------------
   Polynomial ridge regression on noisy samples of a smooth curve. Features are
   Chebyshev polynomials T₀…T_d on [-1, 1], which keeps the normal equations
   well conditioned even at degree 15. Everything is solved exactly here.
--------------------------------------------------------------------------- */

const truth = (x) => Math.sin(3.6 * x) + 0.3 * x;

function sample(seed, n, noise) {
  const r = rng(seed);
  return Array.from({ length: n }, () => {
    const x = r() * 2 - 1;
    return { x, y: truth(x) + randn(r) * noise };
  });
}

const TRAIN = sample(3, 18, 0.25);
const TEST = sample(41, 300, 0.25);

function cheb(x, d) {
  const t = [1, x];
  for (let k = 2; k <= d; k++) t.push(2 * x * t[k - 1] - t[k - 2]);
  return t.slice(0, d + 1);
}

function fitRidge(pts, d, lambda) {
  const X = pts.map((p) => cheb(p.x, d));
  const k = d + 1;
  const A = Array.from({ length: k }, (_, i) => Array.from({ length: k }, (_, j) => X.reduce((s, row) => s + row[i] * row[j], 0)));
  for (let i = 1; i < k; i++) A[i][i] += lambda; // do not penalise the intercept
  const b = Array.from({ length: k }, (_, i) => X.reduce((s, row, r) => s + row[i] * pts[r].y, 0));
  return solve(A, b);
}

const predict = (w, x) => cheb(x, w.length - 1).reduce((s, v, i) => s + v * w[i], 0);
const rmse = (w, pts) => Math.sqrt(pts.reduce((s, p) => s + (predict(w, p.x) - p.y) ** 2, 0) / pts.length);

function BiasVarianceLab() {
  const [degree, setDegree] = useState(12);
  const [logLambda, setLogLambda] = useState(-6);
  const lambda = 10 ** logLambda;

  const w = useMemo(() => fitRidge(TRAIN, degree, lambda), [degree, lambda]);
  const curve = useMemo(
    () =>
      Array.from({ length: 15 }, (_, i) => {
        const ww = fitRidge(TRAIN, i + 1, lambda);
        return { d: i + 1, train: rmse(ww, TRAIN), test: rmse(ww, TEST) };
      }),
    [lambda],
  );

  const W = 360;
  const H = 220;
  const sx = (x) => 10 + ((x + 1) / 2) * (W - 20);
  const sy = (y) => H / 2 - y * 55;
  const line = (f) => {
    let d = "";
    for (let i = 0; i <= 160; i++) {
      const x = -1 + (2 * i) / 160;
      const y = Math.max(-2, Math.min(2, f(x)));
      d += `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(y).toFixed(1)}`;
    }
    return d;
  };

  const tr = rmse(w, TRAIN);
  const te = rmse(w, TEST);
  const norm = Math.sqrt(w.slice(1).reduce((s, v) => s + v * v, 0));

  const cw = 320;
  const ch = 140;
  const maxE = 1.2;
  const cx = (d) => 24 + ((d - 1) / 14) * (cw - 34);
  const cy = (e) => 10 + (1 - Math.min(e, maxE) / maxE) * (ch - 30);
  const path = (k) => curve.map((c, i) => `${i ? "L" : "M"}${cx(c.d)},${cy(c[k])}`).join("");

  return (
    <Panel tone="indigo" title="Fit 18 noisy points with a polynomial — then rein it in">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-5">
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block rounded-lg bg-black/30 border border-white/10">
            <path d={line(truth)} fill="none" stroke="rgba(255,255,255,0.25)" strokeWidth="2" strokeDasharray="5 4" />
            <path d={line((x) => predict(w, x))} fill="none" stroke="#818cf8" strokeWidth="2.5" />
            {TRAIN.map((p, i) => (
              <circle key={i} cx={sx(p.x)} cy={sy(p.y)} r="4" fill="#fbbf24" stroke="rgba(0,0,0,0.5)" />
            ))}
          </svg>
          <div className="flex flex-wrap gap-x-4 text-[0.6875rem] text-gray-400 mt-2">
            <span><span className="inline-block w-3 h-0.5 bg-white/40 mr-1 align-middle" />true function</span>
            <span><span className="inline-block w-3 h-0.5 bg-indigo-400 mr-1 align-middle" />model</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-full bg-amber-400 mr-1" />training points</span>
          </div>
        </div>
        <div className="space-y-3">
          <Slider label="Polynomial degree (capacity)" value={degree} min={1} max={15} onChange={setDegree} />
          <Slider
            label="Ridge penalty λ"
            value={logLambda}
            min={-6}
            max={2}
            step={0.25}
            onChange={setLogLambda}
            format={(v) => (v <= -6 ? "≈ 0" : `10^${v}`)}
          />
          <div className="grid grid-cols-3 gap-2">
            <Metric label="Train RMSE" value={fmt(tr)} tone="amber" />
            <Metric label="Test RMSE" value={fmt(te)} tone={te > tr * 1.6 ? "rose" : "emerald"} />
            <Metric label="‖w‖" value={norm > 99 ? norm.toExponential(0) : fmt(norm, 1)} />
          </div>
          <svg viewBox={`0 0 ${cw} ${ch}`} className="w-full h-auto block">
            <path d={path("train")} fill="none" stroke="#fbbf24" strokeWidth="2" />
            <path d={path("test")} fill="none" stroke="#34d399" strokeWidth="2" />
            <line x1={cx(degree)} y1="6" x2={cx(degree)} y2={ch - 20} stroke="#e5e7eb" strokeDasharray="3 3" />
            <text x="24" y={ch - 6} fill="#6b7280" fontSize="10">degree 1</text>
            <text x={cw - 10} y={ch - 6} fill="#6b7280" fontSize="10" textAnchor="end">15</text>
            <text x={cw - 10} y="18" fill="#34d399" fontSize="10" textAnchor="end">test error</text>
            <text x={cw - 10} y="32" fill="#fbbf24" fontSize="10" textAnchor="end">train error</text>
          </svg>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        With λ ≈ 0, degree 1 underfits (both errors high — bias) and degree 12+ threads every point while the curve
        swings wildly between them (train error small, test error many times larger — variance). Now leave the
        degree at 12 and raise λ to about 10⁰: the wiggles vanish and test error falls below what any unpenalised
        degree achieves, without removing a single feature. The penalty shrinks the weights (watch ‖w‖), trading a
        little bias for a lot less variance. Push λ to 10² and it underfits again.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Coefficient paths: ridge (closed form) vs lasso (coordinate descent) on a
   standardised dataset where only three of seven features matter.
--------------------------------------------------------------------------- */

const FEATURES = ["size", "rooms", "age", "noise₁", "distance", "noise₂", "noise₃"];
const TRUE_W = [3, 1.5, 0, 0, -2, 0, 0];

const PATH_DATA = (() => {
  const r = rng(12);
  const n = 80;
  const X = Array.from({ length: n }, () => {
    const z = randn(r);
    // rooms is correlated with size, as in real housing data
    return [z, 0.7 * z + 0.7 * randn(r), randn(r), randn(r), randn(r), randn(r), randn(r)];
  });
  // standardise columns
  for (let j = 0; j < 7; j++) {
    const m = X.reduce((s, row) => s + row[j], 0) / n;
    const sd = Math.sqrt(X.reduce((s, row) => s + (row[j] - m) ** 2, 0) / n);
    X.forEach((row) => (row[j] = (row[j] - m) / sd));
  }
  const y = X.map((row) => row.reduce((s, v, j) => s + v * TRUE_W[j], 0) + randn(r) * 1.5);
  const my = y.reduce((a, b) => a + b, 0) / n;
  return { X, y: y.map((v) => v - my), n };
})();

function ridgePath(lambda) {
  const { X, y, n } = PATH_DATA;
  const A = Array.from({ length: 7 }, (_, i) => Array.from({ length: 7 }, (_, j) => X.reduce((s, row) => s + row[i] * row[j], 0) / n + (i === j ? lambda : 0)));
  const b = Array.from({ length: 7 }, (_, i) => X.reduce((s, row, r) => s + row[i] * y[r], 0) / n);
  return solve(A, b);
}

function lassoPath(lambda) {
  const { X, y, n } = PATH_DATA;
  const w = new Array(7).fill(0);
  const resid = [...y];
  for (let it = 0; it < 200; it++) {
    let delta = 0;
    for (let j = 0; j < 7; j++) {
      // rho = (1/n) Σ x_ij (r_i + x_ij w_j); columns are standardised so (1/n) Σ x² = 1
      let rho = 0;
      for (let i = 0; i < n; i++) rho += X[i][j] * (resid[i] + X[i][j] * w[j]);
      rho /= n;
      const nw = Math.sign(rho) * Math.max(Math.abs(rho) - lambda, 0);
      const d = nw - w[j];
      if (d !== 0) {
        for (let i = 0; i < n; i++) resid[i] -= X[i][j] * d;
        w[j] = nw;
        delta = Math.max(delta, Math.abs(d));
      }
    }
    if (delta < 1e-6) break;
  }
  return w;
}

const COLORS = ["#818cf8", "#60a5fa", "#fbbf24", "#6b7280", "#fb7185", "#9ca3af", "#4b5563"];

function PathsLab() {
  const [kind, setKind] = useState("lasso");
  const [t, setT] = useState(0.35);
  const grid = useMemo(() => Array.from({ length: 50 }, (_, i) => i / 49), []);
  const toLambda = (u) => (kind === "lasso" ? u * 3.2 : 10 ** (-2 + u * 4));
  const paths = useMemo(() => grid.map((u) => (kind === "lasso" ? lassoPath(toLambda(u)) : ridgePath(toLambda(u)))), [kind, grid]); // eslint-disable-line react-hooks/exhaustive-deps
  const current = kind === "lasso" ? lassoPath(toLambda(t)) : ridgePath(toLambda(t));

  const W = 360;
  const H = 200;
  const sx = (u) => 16 + u * (W - 30);
  const sy = (v) => H / 2 - v * 26;
  const zeroed = current.filter((v) => Math.abs(v) < 1e-9).length;

  return (
    <Panel tone="purple" title="Lasso zeroes features out; ridge only shrinks them">
      <div className="flex flex-wrap items-end gap-5 mb-4">
        <Segmented
          tone="purple"
          value={kind}
          onChange={setKind}
          options={[
            { v: "lasso", label: "Lasso (L1)" },
            { v: "ridge", label: "Ridge (L2)" },
          ]}
        />
        <div className="w-56">
          <Slider tone="purple" label="penalty strength" value={t} min={0} max={1} step={0.01} onChange={setT} format={(u) => `λ = ${toLambda(u).toFixed(2)}`} />
        </div>
        <Metric label="Coefficients exactly 0" value={`${zeroed} / 7`} tone="purple" />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_220px] gap-5">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          <line x1="16" y1={sy(0)} x2={W - 14} y2={sy(0)} stroke="rgba(255,255,255,0.2)" />
          {FEATURES.map((_, j) => (
            <path key={j} d={paths.map((w, i) => `${i ? "L" : "M"}${sx(grid[i]).toFixed(1)},${sy(w[j]).toFixed(1)}`).join("")} fill="none" stroke={COLORS[j]} strokeWidth={TRUE_W[j] ? 2.2 : 1.2} />
          ))}
          <line x1={sx(t)} y1="6" x2={sx(t)} y2={H - 16} stroke="#e5e7eb" strokeDasharray="3 3" />
          <text x="16" y={H - 4} fill="#6b7280" fontSize="10">weak penalty</text>
          <text x={W - 14} y={H - 4} fill="#6b7280" fontSize="10" textAnchor="end">strong penalty</text>
        </svg>
        <div className="space-y-1 text-xs font-mono">
          {FEATURES.map((f, j) => (
            <div key={f} className="flex items-center justify-between gap-2">
              <span className="flex items-center gap-1.5">
                <span className="w-2.5 h-2.5 rounded-full" style={{ background: COLORS[j] }} />
                <span className={TRUE_W[j] ? "text-gray-200" : "text-gray-500"}>{f}</span>
              </span>
              <span className={Math.abs(current[j]) < 1e-9 ? "text-purple-300" : "text-gray-300"}>{current[j].toFixed(2)}</span>
            </div>
          ))}
          <p className="text-[0.6875rem] text-gray-500 font-sans pt-2 leading-snug m-0">True weights: size 3, rooms 1.5, distance −2, the rest 0.</p>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        As lasso's penalty grows, the noise features hit exactly zero first and stay there — built-in feature
        selection. Ridge pulls every coefficient toward zero smoothly but never reaches it. Watch size and rooms,
        which are correlated: ridge shares the weight between them, while lasso tends to keep one and drop the
        other. Elastic net mixes both penalties to get sparsity without that arbitrary pick.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Grid vs random search, on a function where only one hyperparameter matters.
--------------------------------------------------------------------------- */

function SearchLab() {
  const r = rng(5);
  const random = Array.from({ length: 9 }, () => [r(), r()]);
  const grid = [];
  for (let i = 0; i < 3; i++) for (let j = 0; j < 3; j++) grid.push([(i + 0.5) / 3, (j + 0.5) / 3]);
  const S = 150;
  const panel = (pts, title, tone) => (
    <div>
      <div className={`text-xs font-semibold mb-1 ${tone}`}>{title}</div>
      <svg viewBox={`0 0 ${S} ${S + 26}`} className="w-full max-w-[240px] h-auto block">
        <rect x="10" y="10" width={S - 20} height={S - 20} fill="rgba(255,255,255,0.03)" stroke="rgba(255,255,255,0.12)" />
        {pts.map(([a, b], i) => (
          <g key={i}>
            <circle cx={10 + a * (S - 20)} cy={10 + b * (S - 20)} r="4" fill="#a78bfa" />
            <line x1={10 + a * (S - 20)} y1={S - 10} x2={10 + a * (S - 20)} y2={S + 4} stroke="#fbbf24" strokeWidth="1.5" />
          </g>
        ))}
        <text x={S / 2} y={S + 20} fill="#6b7280" fontSize="9" textAnchor="middle">learning rate (matters)</text>
      </svg>
      <div className="text-[0.6875rem] text-gray-500">
        distinct learning rates tried: <span className="font-mono text-amber-300">{new Set(pts.map((p) => p[0].toFixed(3))).size}</span>
      </div>
    </div>
  );
  return (
    <Panel tone="amber" title="Nine trials: grid search vs random search">
      <div className="grid grid-cols-2 gap-4">
        {panel(grid, "Grid 3 × 3", "text-gray-300")}
        {panel(random, "Random, 9 draws", "text-purple-300")}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-3 mb-0">
        The vertical axis is a hyperparameter that barely matters. The grid spends its nine trials on only three
        learning rates; random search tries nine. When a few hyperparameters dominate — which is the usual case —
        random search finds good settings with far fewer trials (Bergstra &amp; Bengio, 2012). Bayesian optimisation
        (Optuna, Hyperopt) goes further by choosing each trial from the results so far.
      </p>
    </Panel>
  );
}

export default function MlRegularization() {
  const toc = [
    { label: "Bias & Variance", hash: "bias-variance" },
    { label: "Bias–Variance Lab", hash: "lab" },
    { label: "L2 (Ridge) & L1 (Lasso)", hash: "penalties" },
    { label: "Coefficient Paths", hash: "paths" },
    { label: "Regularising Neural Nets", hash: "deep" },
    { label: "Hyperparameter Tuning", hash: "tuning" },
    { label: "Diagnosing a Model", hash: "diagnose" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Regularisation & the Bias–Variance Tradeoff"
      intro="Why a model that fits the training data perfectly usually fails on new data, and the tools — penalties, early stopping, dropout, tuning — that keep capacity in check."
      toc={toc}
    >
      <Section id="bias-variance" title="Bias & Variance" lead="A model's expected error on new data splits into three parts: bias², variance, and irreducible noise. You can trade the first two against each other; the third you cannot touch.">
        <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-sm text-gray-200 text-center mb-5 overflow-x-auto">
          expected test error = bias² + variance + noise
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Bias — too simple" tone="amber"><p>Systematic error from assumptions the data does not satisfy: a straight line through a curve. Train and test error are both high. Fix: more capacity, better features.</p></Card>
          <Card title="Variance — too sensitive" tone="rose"><p>The fit changes a lot with the particular training sample. Train error is low, test error high. Fix: more data, fewer features, or regularisation.</p></Card>
          <Card title="Noise — the floor" tone="indigo"><p>Measurement error and genuinely unpredictable variation. No model gets below it, and trying to is exactly what overfitting is.</p></Card>
        </div>
      </Section>

      <Section id="lab" title="Bias–Variance Lab" lead="Polynomial regression solved exactly in your browser. The dashed curve is the truth; the model only sees the 18 yellow points.">
        <BiasVarianceLab />
      </Section>

      <Section id="penalties" title="L2 (Ridge) & L1 (Lasso)" lead="Regularisation adds a cost for large weights to the training loss, so the optimiser prefers simpler explanations unless the data insists.">
        <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-xs sm:text-sm text-gray-200 space-y-1 mb-5 overflow-x-auto">
          <div>ridge (L2):   loss + λ · Σ wⱼ²</div>
          <div>lasso (L1):   loss + λ · Σ |wⱼ|</div>
          <div>elastic net:  loss + λ · (α Σ |wⱼ| + (1 − α) Σ wⱼ²)</div>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Ridge / weight decay" tone="indigo"><p>Shrinks all weights smoothly and handles correlated features gracefully by sharing weight between them. In neural networks the same idea is called weight decay (AdamW applies it decoupled from the gradient step).</p></Card>
          <Card title="Lasso" tone="purple"><p>The absolute-value penalty has a corner at zero, so the optimum often lands exactly on it. The result is a sparse model — automatic feature selection.</p></Card>
          <Card title="Always scale first" tone="amber"><p>The penalty compares weights directly, so a feature measured in metres and one in millimetres are penalised very differently. Standardise features before any penalised model.</p></Card>
        </div>
      </Section>

      <Section id="paths" title="Coefficient Paths" lead="Seven standardised features, three of which actually matter. Sweep the penalty and watch each coefficient.">
        <PathsLab />
      </Section>

      <Section id="deep" title="Regularising Neural Nets" lead="Deep networks have far more parameters than training examples and still generalise — because of a toolkit of implicit and explicit regularisers.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card title="Early stopping" tone="emerald"><p>Track validation loss while training and keep the checkpoint where it was lowest. Cheap and nearly always worth doing.</p></Card>
          <Card title="Dropout" tone="indigo"><p>Randomly zero a fraction of activations each step, so no unit can rely on specific others. Turned off at inference. Common in classic nets; many large LLMs pretrain with little or none because they see each token only once.</p></Card>
          <Card title="Weight decay" tone="purple"><p>L2 on the weights, applied decoupled in AdamW. A standard ingredient of transformer training.</p></Card>
          <Card title="Data augmentation" tone="amber"><p>Flips, crops, noise, paraphrases: more varied training examples for free. Often the strongest regulariser in vision.</p></Card>
          <Card title="Batch / layer norm" tone="blue"><p>Mainly stabilise optimisation, with a mild regularising side effect from batch statistics noise.</p></Card>
          <Card title="More data" tone="rose"><p>The regulariser that always works. Variance shrinks as the training set grows; bias does not.</p></Card>
        </div>
      </Section>

      <Section id="tuning" title="Hyperparameter Tuning" lead="λ, depth, learning rate and the rest are not learned from the training loss — they are chosen by validation performance.">
        <SearchLab />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <Card title="Grid search" tone="indigo"><p>Every combination of a few values. Fine for one or two hyperparameters; cost explodes with more.</p></Card>
          <Card title="Random search" tone="purple"><p>Sample combinations at random (log-uniform for scales like λ and learning rate). A strong, simple default.</p></Card>
          <Card title="Bayesian / adaptive" tone="emerald"><p>Optuna and similar tools model which regions look promising and prune bad trials early. Worth it when each trial is expensive.</p></Card>
        </div>
      </Section>

      <Section id="diagnose" title="Diagnosing a Model">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm min-w-[520px]">
            <thead className="bg-white/5 text-gray-400 text-left">
              <tr>
                <th className="p-3 font-medium">Symptom</th>
                <th className="p-3 font-medium">Likely problem</th>
                <th className="p-3 font-medium">Try</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-t border-white/5"><td className="p-3">Train and validation error both high</td><td className="p-3 text-amber-300">High bias</td><td className="p-3 text-xs text-gray-400">More capacity, better features, less regularisation, train longer</td></tr>
              <tr className="border-t border-white/5"><td className="p-3">Train error low, validation error high</td><td className="p-3 text-rose-300">High variance</td><td className="p-3 text-xs text-gray-400">More data, stronger regularisation, fewer features, early stopping, ensembling</td></tr>
              <tr className="border-t border-white/5"><td className="p-3">Validation error falls as data grows, still falling</td><td className="p-3 text-emerald-300">Data-limited</td><td className="p-3 text-xs text-gray-400">Collecting more data will pay off</td></tr>
              <tr className="border-t border-white/5"><td className="p-3">Both errors flat as data grows</td><td className="p-3 text-indigo-300">Capacity-limited</td><td className="p-3 text-xs text-gray-400">More data will not help; change the model</td></tr>
            </tbody>
          </table>
        </div>
        <Note tone="indigo">
          Plot a learning curve (error against training-set size) before deciding to collect more data. And judge
          every change on validation folds — see <a href="#/ml/evaluation-metrics" className="text-blue-400 hover:underline">Evaluation Metrics</a>.
        </Note>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler, PolynomialFeatures
from sklearn.linear_model import RidgeCV, LassoCV, ElasticNetCV
from sklearn.model_selection import RandomizedSearchCV
from scipy.stats import loguniform

# Ridge with λ (called alpha in scikit-learn) chosen by cross-validation
ridge = make_pipeline(PolynomialFeatures(12), StandardScaler(),
                      RidgeCV(alphas=[1e-4, 1e-3, 1e-2, 1e-1, 1, 10]))
ridge.fit(X_train, y_train)

# Lasso: which features survive?
lasso = make_pipeline(StandardScaler(), LassoCV(cv=5)).fit(X_train, y_train)
coef = lasso[-1].coef_
print("kept:", [f for f, c in zip(X_train.columns, coef) if c != 0])

# Random search over a gradient-boosting model
from sklearn.ensemble import HistGradientBoostingRegressor
search = RandomizedSearchCV(
    HistGradientBoostingRegressor(early_stopping=True),
    {"learning_rate": loguniform(1e-3, 0.3),
     "max_depth": [3, 5, 8, None],
     "l2_regularization": loguniform(1e-4, 10)},
    n_iter=40, cv=5, random_state=0)
search.fit(X_train, y_train)
print(search.best_params_)`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("ml-regularization")} />
    </GuideLayout>
  );
}

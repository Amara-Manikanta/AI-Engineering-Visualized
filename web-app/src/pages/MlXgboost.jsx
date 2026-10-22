import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import CodeBlock from "../components/CodeBlock";

/* --------------------------------------------------------------------------
   Gradient boosting, actually run in the browser.

   The demo below fits real decision stumps to real residuals. Each round it
   scans every candidate split threshold, picks the one minimising squared
   error on the current residuals, and adds a shrunken version of that stump
   to the running prediction. The RMSE you see is measured, not authored.
-------------------------------------------------------------------------- */

// A wiggly 1D target. Deterministic, so the page reads the same every load.
const DATA = Array.from({ length: 40 }, (_, i) => {
  const x = i / 39;
  const y = Math.sin(x * 6.2) * 1.6 + x * 2.2 + Math.cos(x * 11) * 0.35;
  return { x, y };
});

// Fit one depth-1 tree (a stump) to the given residuals by exhaustive search.
function fitStump(xs, residuals) {
  let best = null;
  for (let i = 1; i < xs.length; i++) {
    const t = (xs[i - 1] + xs[i]) / 2;
    let ls = 0, ln = 0, rs = 0, rn = 0;
    for (let j = 0; j < xs.length; j++) {
      if (xs[j] < t) { ls += residuals[j]; ln++; } else { rs += residuals[j]; rn++; }
    }
    if (ln === 0 || rn === 0) continue;
    const lv = ls / ln;
    const rv = rs / rn;
    let sse = 0;
    for (let j = 0; j < xs.length; j++) {
      const p = xs[j] < t ? lv : rv;
      sse += (residuals[j] - p) ** 2;
    }
    if (!best || sse < best.sse) best = { t, lv, rv, sse };
  }
  return best;
}

function boost(rounds, lr) {
  const xs = DATA.map((d) => d.x);
  const ys = DATA.map((d) => d.y);
  const base = ys.reduce((a, b) => a + b, 0) / ys.length;
  let pred = ys.map(() => base);
  const history = [];

  for (let r = 0; r < rounds; r++) {
    const residuals = ys.map((y, i) => y - pred[i]);
    const stump = fitStump(xs, residuals);
    if (!stump) break;
    pred = pred.map((p, i) => p + lr * (xs[i] < stump.t ? stump.lv : stump.rv));
    const rmse = Math.sqrt(ys.reduce((a, y, i) => a + (y - pred[i]) ** 2, 0) / ys.length);
    history.push({ round: r + 1, threshold: stump.t, rmse });
  }

  const residuals = ys.map((y, i) => y - pred[i]);
  const rmse = Math.sqrt(residuals.reduce((a, r) => a + r * r, 0) / ys.length);
  const baseRmse = Math.sqrt(ys.reduce((a, y) => a + (y - base) ** 2, 0) / ys.length);
  return { xs, ys, pred, residuals, rmse, baseRmse, history };
}

const W = 560;
const H = 260;
const PAD = 38;

function BoostingLab() {
  const [rounds, setRounds] = useState(6);
  const [lr, setLr] = useState(0.3);

  const fit = useMemo(() => boost(rounds, lr), [rounds, lr]);

  const yMin = Math.min(...fit.ys) - 0.6;
  const yMax = Math.max(...fit.ys) + 0.6;
  const px = (x) => PAD + x * (W - PAD * 2);
  const py = (y) => H - PAD - ((y - yMin) / (yMax - yMin)) * (H - PAD * 2);

  const predPath = fit.xs.map((x, i) => `${i ? "L" : "M"}${px(x)},${py(fit.pred[i])}`).join(" ");

  // Residual strip, drawn on its own scale so small errors stay visible.
  const rMax = Math.max(0.05, ...fit.residuals.map((r) => Math.abs(r)));
  const RH = 90;
  const ry = (r) => RH / 2 - (r / rMax) * (RH / 2 - 8);

  const improvement = ((1 - fit.rmse / fit.baseRmse) * 100).toFixed(1);

  return (
    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] p-6">
      <h3 className="text-amber-400 font-bold mb-1">Boosting, running for real</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        The first prediction is the mean of the target — a flat line. Every round after that fits a one-split tree to
        what is still wrong, shrinks it by the learning rate, and adds it on. These numbers are computed in your
        browser by scanning every candidate split.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Boosting rounds</span>
          <input
            type="range"
            min="1"
            max="60"
            step="1"
            value={rounds}
            onChange={(e) => setRounds(Number(e.target.value))}
            className="w-full mt-2 accent-amber-500"
          />
          <span className="font-mono text-amber-300 text-sm">{rounds}</span>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Learning rate (η)</span>
          <input
            type="range"
            min="0.05"
            max="1"
            step="0.05"
            value={lr}
            onChange={(e) => setLr(Number(e.target.value))}
            className="w-full mt-2 accent-amber-500"
          />
          <span className="font-mono text-amber-300 text-sm">{lr.toFixed(2)}</span>
        </label>
      </div>

      <div className="rounded-xl bg-black/50 border border-white/10 p-3 mb-3">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <line x1={PAD} y1={H - PAD} x2={W - PAD} y2={H - PAD} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1={PAD} y1={PAD - 10} x2={PAD} y2={H - PAD} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />

          {/* true points */}
          {fit.xs.map((x, i) => (
            <circle key={i} cx={px(x)} cy={py(fit.ys[i])} r="3.5" fill="#60a5fa" opacity="0.85" />
          ))}

          {/* model */}
          <path d={predPath} fill="none" stroke="#fbbf24" strokeWidth="2.5" />

          <text x={W - PAD} y={PAD - 14} fill="#fbbf24" fontSize="11" textAnchor="end" fontFamily="monospace">
            model after {rounds} round{rounds === 1 ? "" : "s"}
          </text>
          <text x={PAD} y={PAD - 14} fill="#60a5fa" fontSize="11" fontFamily="monospace">
            training data
          </text>
        </svg>
      </div>

      <div className="rounded-xl bg-black/50 border border-white/10 p-3 mb-5">
        <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1 px-1">
          What is still wrong — the residuals the next round would fit
        </div>
        <svg viewBox={`0 0 ${W} ${RH}`} className="w-full h-auto">
          <line x1={PAD} y1={RH / 2} x2={W - PAD} y2={RH / 2} stroke="rgba(255,255,255,0.2)" strokeWidth="1" />
          {fit.xs.map((x, i) => (
            <line
              key={i}
              x1={px(x)}
              y1={RH / 2}
              x2={px(x)}
              y2={ry(fit.residuals[i])}
              stroke={fit.residuals[i] >= 0 ? "#34d399" : "#f87171"}
              strokeWidth="3"
              strokeLinecap="round"
            />
          ))}
        </svg>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Baseline RMSE</div>
          <div className="text-2xl font-bold font-mono text-gray-300">{fit.baseRmse.toFixed(3)}</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">predicting the mean</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-amber-500/30">
          <div className="text-[0.625rem] uppercase tracking-wide text-amber-400 mb-1">Current RMSE</div>
          <div className="text-2xl font-bold font-mono text-amber-300">{fit.rmse.toFixed(3)}</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">after {rounds} stump{rounds === 1 ? "" : "s"}</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Error removed</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{improvement}%</div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 leading-relaxed">
        Try η = 1.0 with 8 rounds, then η = 0.15 with 60. Both land within a whisker of the same training error, but
        the slow one gets there with a smoother function and far smaller residual spikes. That is the whole argument
        for shrinkage: many small corrections generalise better than a few large ones, even when they fit the
        training set equally well.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const REGULARISERS = [
  {
    n: "γ (min_split_loss)",
    d: "A split must reduce loss by at least γ to be kept. This prunes branches that only help by a rounding error — post-pruning built into the growth rule.",
    box: "border-emerald-500/25 bg-emerald-500/[0.07]",
    label: "text-emerald-400",
  },
  {
    n: "λ (L2 on leaf weights)",
    d: "Shrinks every leaf value toward zero. A leaf covering three rows can no longer emit a huge correction just because those three rows agree.",
    box: "border-indigo-500/25 bg-indigo-500/[0.07]",
    label: "text-indigo-400",
  },
  {
    n: "Tree complexity penalty",
    d: "The objective charges per leaf, so the optimiser has to justify every additional node against its loss reduction rather than growing greedily and pruning later.",
    box: "border-purple-500/25 bg-purple-500/[0.07]",
    label: "text-purple-400",
  },
];

export default function MlXgboost() {
  const toc = [
    { label: "Boosting vs Bagging", hash: "vs" },
    { label: "The Algorithm", hash: "algorithm" },
    { label: "See It Run", hash: "lab" },
    { label: "What XGBoost Adds", hash: "xgboost" },
    { label: "Key Hyperparameters", hash: "hyper" },
    { label: "XGBoost / LightGBM / CatBoost", hash: "family" },
    { label: "In Code", hash: "code" },
    { label: "When to Reach for It", hash: "when" },
  ];

  return (
    <GuideLayout
      title="Gradient Boosting & XGBoost"
      intro="Fit a weak model, look at what it got wrong, fit another model to those errors, repeat. Still the strongest default for tabular data."
      toc={toc}
    >
      <section id="vs" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Boosting vs Bagging</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Both build a committee of trees, but for opposite reasons. Knowing which error they attack tells you which
          one to reach for.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07]">
            <div className="font-bold text-emerald-400 mb-2">Bagging — a random forest</div>
            <ul className="text-xs text-gray-300 space-y-1.5 list-disc pl-5 m-0">
              <li>Trees are grown <strong>in parallel</strong>, each on a bootstrap sample.</li>
              <li>Each tree is deep and overfits on its own.</li>
              <li>Averaging cancels their independent errors.</li>
              <li>Attacks <strong>variance</strong>. Hard to overfit by adding trees.</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
            <div className="font-bold text-amber-400 mb-2">Boosting — XGBoost</div>
            <ul className="text-xs text-gray-300 space-y-1.5 list-disc pl-5 m-0">
              <li>Trees are grown <strong>in sequence</strong>, each on the previous errors.</li>
              <li>Each tree is shallow and underfits badly on its own.</li>
              <li>Summing them builds up a complex function step by step.</li>
              <li>Attacks <strong>bias</strong>. Will overfit if you add too many trees.</li>
            </ul>
          </div>
        </div>
        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            The practical difference: a{" "}
            <a href="#/ml/random-forests" className="text-blue-400 hover:underline">random forest</a> with too many
            trees is merely slow, while a boosted model with too many trees is worse. Boosting needs early stopping;
            bagging does not.
          </p>
        </div>
      </section>

      <section id="algorithm" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Algorithm</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Stripped of the engineering, gradient boosting is four lines. Everything XGBoost adds is a refinement of
          step three.
        </p>
        <div className="space-y-3 mb-6">
          {[
            ["1", "Start with a constant", "Predict the mean of the target for every row. This is the worst reasonable model, and it is on purpose."],
            ["2", "Compute the residuals", "For squared error, the residual y − ŷ is exactly the negative gradient of the loss. This is why it is called gradient boosting: the tree is fitting a gradient."],
            ["3", "Fit a shallow tree to those residuals", "Not to the target — to the errors. The tree learns where the current model is wrong and by how much."],
            ["4", "Add it, shrunk by η, and repeat", "ŷ ← ŷ + η · tree(x). The learning rate deliberately under-corrects so no single tree dominates."],
          ].map(([n, t, d]) => (
            <div key={n} className="flex gap-4 p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-amber-500/15 border border-amber-500/30 text-amber-400 font-bold flex items-center justify-center text-sm">
                {n}
              </div>
              <div>
                <div className="text-sm font-semibold text-white mb-1">{t}</div>
                <p className="text-xs text-gray-400 leading-relaxed m-0">{d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.07]">
          <p className="text-sm text-indigo-100 leading-relaxed m-0">
            Because step two only needs the gradient of the loss, swapping the loss function swaps the task. Squared
            error gives regression, log loss gives classification, and a ranking loss gives learning-to-rank — with
            the same tree-fitting machinery underneath.
          </p>
        </div>
      </section>

      <section id="lab" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">See It Run</h2>
        <BoostingLab />
      </section>

      <section id="xgboost" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">What XGBoost Adds</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Plain gradient boosting had been known for years before XGBoost. What it changed was putting regularisation
          into the objective the tree optimises, rather than bolting it on afterwards, and then making that objective
          fast to evaluate.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          {REGULARISERS.map((r) => (
            <div key={r.n} className={`p-5 rounded-xl border ${r.box}`}>
              <div className={`font-semibold mb-1.5 text-sm ${r.label}`}>{r.n}</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{r.d}</p>
            </div>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm font-semibold text-white mb-2">Second-order optimisation</div>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              Classic boosting uses the gradient. XGBoost also uses the second derivative, which gives a closed-form
              optimal leaf value and a split score that is exact rather than heuristic. Fewer rounds to the same loss.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm font-semibold text-white mb-2">Engineering that mattered</div>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              Pre-sorted column blocks so split-finding parallelises, a sparsity-aware default direction for missing
              values, and cache-conscious memory access. This is why it swept competitions when it landed.
            </p>
          </div>
        </div>
      </section>

      <section id="hyper" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Key Hyperparameters</h2>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-left">
                <th className="px-4 py-3 font-semibold text-white">Parameter</th>
                <th className="px-4 py-3 font-semibold text-white">Typical</th>
                <th className="px-4 py-3 font-semibold text-white">What it controls</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                ["learning_rate (η)", "0.01 – 0.1", "How much of each tree is kept. Lower needs more rounds but generalises better. Tune this with n_estimators, never alone."],
                ["n_estimators", "500 – 5000", "Number of boosting rounds. Set it high and let early stopping decide the real value."],
                ["max_depth", "3 – 8", "Depth of each tree. Boosting wants weak learners — beyond 8 you are usually overfitting."],
                ["subsample", "0.6 – 1.0", "Row fraction per tree. Below 1.0 adds stochasticity, which regularises and speeds things up."],
                ["colsample_bytree", "0.6 – 1.0", "Feature fraction per tree. The main defence against a few dominant correlated features."],
                ["min_child_weight", "1 – 10", "Minimum summed hessian in a leaf. Raise it on noisy data to stop leaves built from a handful of rows."],
                ["reg_lambda / reg_alpha", "1 / 0", "L2 and L1 on leaf weights. Raise λ before you reach for shallower trees."],
              ].map(([p, t, d]) => (
                <tr key={p} className="border-t border-white/10">
                  <td className="px-4 py-3 font-mono text-xs text-amber-300 whitespace-nowrap align-top">{p}</td>
                  <td className="px-4 py-3 font-mono text-xs text-gray-400 whitespace-nowrap align-top">{t}</td>
                  <td className="px-4 py-3 text-xs leading-relaxed">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="family" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">XGBoost, LightGBM, CatBoost</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Three implementations of the same idea that differ in how they grow trees and handle categories. On most
          datasets, tuned properly, they land within a point of each other — so pick on the practical axis.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="p-5 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
            <div className="font-bold text-amber-400 mb-2">XGBoost</div>
            <p className="text-xs text-gray-300 leading-relaxed mb-2">
              Grows level-wise. The most battle-tested and the most predictable to tune.
            </p>
            <div className="text-[0.6875rem] text-gray-500">Default choice when you want no surprises.</div>
          </div>
          <div className="p-5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07]">
            <div className="font-bold text-emerald-400 mb-2">LightGBM</div>
            <p className="text-xs text-gray-300 leading-relaxed mb-2">
              Grows leaf-wise, splitting wherever loss drops most. Much faster on large data, and easier to overfit —
              cap num_leaves.
            </p>
            <div className="text-[0.6875rem] text-gray-500">Best when rows run to millions.</div>
          </div>
          <div className="p-5 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.07]">
            <div className="font-bold text-indigo-400 mb-2">CatBoost</div>
            <p className="text-xs text-gray-300 leading-relaxed mb-2">
              Ordered target statistics for categorical features, so no manual encoding and no target leakage.
              Strongest out-of-the-box defaults.
            </p>
            <div className="text-[0.6875rem] text-gray-500">Best with many high-cardinality categories.</div>
          </div>
        </div>
      </section>

      <section id="code" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">In Code</h2>
        <CodeBlock
          language="python"
          code={`import xgboost as xgb
from sklearn.model_selection import train_test_split

X_tr, X_val, y_tr, y_val = train_test_split(
    X, y, test_size=0.2, stratify=y, random_state=42
)

model = xgb.XGBClassifier(
    n_estimators=5000,        # deliberately too many
    learning_rate=0.03,
    max_depth=5,
    subsample=0.8,
    colsample_bytree=0.8,
    min_child_weight=3,
    reg_lambda=1.0,
    eval_metric="auc",
    early_stopping_rounds=100,  # this is what picks the real n_estimators
    n_jobs=-1,
    tree_method="hist",
)

model.fit(X_tr, y_tr, eval_set=[(X_val, y_val)], verbose=100)
print("stopped at round", model.best_iteration)

# Gain-based importance is biased toward high-cardinality features.
# SHAP gives per-prediction attributions that actually sum to the output.
import shap
explainer = shap.TreeExplainer(model)
shap_values = explainer.shap_values(X_val)`}
        />
        <div className="mt-4 p-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>The early-stopping trap.</strong> The validation set used for early stopping has now been used to
            select a hyperparameter, so its score is optimistic. Keep a third, untouched test set for the number you
            report — or run early stopping inside each cross-validation fold.
          </p>
        </div>
      </section>

      <section id="when" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">When to Reach for It</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Good fit</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Structured, tabular data — where it still routinely beats deep learning.</li>
              <li>Mixed numeric and categorical features with missing values.</li>
              <li>Anywhere a few points of accuracy justify tuning effort.</li>
              <li>Ranking and click-prediction, with the appropriate objective.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Poor fit</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Images, audio, and raw text — use a neural network.</li>
              <li>Extrapolation beyond the training range; trees output constants.</li>
              <li>When you need a model a regulator can read line by line.</li>
              <li>Very small datasets, where the tuning surface overfits.</li>
            </ul>
          </div>
        </div>
      </section>
      <KnowledgeCheck questions={questionsFor("ml-ensembles")} />
    </GuideLayout>
  );
}

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import GuideLayout from "../components/GuideLayout";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import CodeBlock from "../components/CodeBlock";

/* --------------------------------------------------------------------------
   Why an ensemble beats one tree — the two real arguments, both computed.
-------------------------------------------------------------------------- */

// C(n, k) — n stays small enough here for plain doubles.
function choose(n, k) {
  if (k < 0 || k > n) return 0;
  let r = 1;
  for (let i = 1; i <= k; i++) r = (r * (n - k + i)) / i;
  return r;
}

// P(at least half of n independent voters, each right with prob p, are right)
function majorityVoteAccuracy(n, p) {
  const need = Math.floor(n / 2) + 1;
  let total = 0;
  for (let k = need; k <= n; k++) total += choose(n, k) * p ** k * (1 - p) ** (n - k);
  return total;
}

function CondorcetPanel() {
  const [trees, setTrees] = useState(15);
  const [acc, setAcc] = useState(0.62);

  const ensemble = majorityVoteAccuracy(trees, acc);
  const lift = ensemble - acc;

  return (
    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] p-6">
      <h3 className="text-emerald-400 font-bold mb-1">Argument 1 — majority vote</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        If each tree is only <em>slightly</em> better than a coin flip, and their mistakes are independent, the
        majority vote is dramatically better than any single tree. This is Condorcet's jury theorem, and it is the
        whole idea in one line.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Trees in the forest</span>
          <input
            type="range"
            min="1"
            max="51"
            step="2"
            value={trees}
            onChange={(e) => setTrees(Number(e.target.value))}
            className="w-full mt-2 accent-emerald-500"
          />
          <span className="font-mono text-emerald-300 text-sm">{trees}</span>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Accuracy of one tree</span>
          <input
            type="range"
            min="0.35"
            max="0.95"
            step="0.01"
            value={acc}
            onChange={(e) => setAcc(Number(e.target.value))}
            className="w-full mt-2 accent-emerald-500"
          />
          <span className="font-mono text-emerald-300 text-sm">{(acc * 100).toFixed(0)}%</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mb-4">
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">One tree</div>
          <div className="text-2xl font-bold text-gray-300 font-mono">{(acc * 100).toFixed(1)}%</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/30">
          <div className="text-[0.625rem] uppercase tracking-wide text-emerald-400 mb-1">The forest</div>
          <div className="text-2xl font-bold text-emerald-300 font-mono">{(ensemble * 100).toFixed(1)}%</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Change</div>
          <div className={`text-2xl font-bold font-mono ${lift >= 0 ? "text-emerald-300" : "text-rose-400"}`}>
            {lift >= 0 ? "+" : ""}
            {(lift * 100).toFixed(1)}
          </div>
        </div>
      </div>

      {/* bar comparison */}
      <div className="space-y-2 mb-4">
        {[
          { l: "Single tree", v: acc, c: "bg-gray-500" },
          { l: `Vote of ${trees}`, v: ensemble, c: "bg-emerald-500" },
        ].map((b) => (
          <div key={b.l} className="flex items-center gap-3">
            <span className="w-28 shrink-0 text-xs text-gray-400">{b.l}</span>
            <div className="flex-1 h-3 rounded-full bg-white/5 overflow-hidden">
              <motion.div
                className={`h-full rounded-full ${b.c}`}
                animate={{ width: `${b.v * 100}%` }}
                transition={{ duration: 0.25 }}
              />
            </div>
            <span className="w-14 text-right font-mono text-xs text-gray-400">{(b.v * 100).toFixed(1)}%</span>
          </div>
        ))}
      </div>

      <div
        className={`p-3.5 rounded-lg border text-xs leading-relaxed ${
          acc > 0.5 ? "border-emerald-500/25 bg-emerald-500/10 text-emerald-200" : "border-rose-500/25 bg-rose-500/10 text-rose-200"
        }`}
      >
        {acc > 0.5 ? (
          <>
            <strong>Above 50%, adding trees helps.</strong> Errors that point in random directions cancel; the shared
            signal survives. Notice the curve flattens — going from 5 to 15 trees buys far more than 41 to 51.
          </>
        ) : (
          <>
            <strong>Below 50%, the vote makes things worse.</strong> The theorem cuts both ways: averaging voters who
            are worse than chance amplifies the error. An ensemble of bad models is a worse model, not a better one.
          </>
        )}
      </div>
    </div>
  );
}

function CorrelationPanel() {
  const [trees, setTrees] = useState(20);
  const [rho, setRho] = useState(0.35);

  // Variance of the average of n identically-distributed vars with pairwise correlation ρ,
  // taking each tree's variance σ² = 1 so the numbers read as a fraction of a single tree.
  const variance = rho + (1 - rho) / trees;
  const floor = rho;

  return (
    <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.07] p-6">
      <h3 className="text-indigo-400 font-bold mb-1">Argument 2 — and why independence is the hard part</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        The first argument assumed independent trees. Real trees trained on the same data are not independent — they
        find the same dominant feature and make the same mistakes. Averaging <span className="font-mono">n</span> trees
        with pairwise correlation <span className="font-mono">ρ</span> gives:
      </p>

      <div className="font-mono text-sm bg-black/50 border border-white/10 rounded-lg p-4 mb-5 text-center text-gray-200">
        Var(average) = ρσ² + (1 − ρ)σ² / n
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Trees</span>
          <input
            type="range"
            min="1"
            max="200"
            value={trees}
            onChange={(e) => setTrees(Number(e.target.value))}
            className="w-full mt-2 accent-indigo-500"
          />
          <span className="font-mono text-indigo-300 text-sm">{trees}</span>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Correlation between trees (ρ)</span>
          <input
            type="range"
            min="0"
            max="0.9"
            step="0.05"
            value={rho}
            onChange={(e) => setRho(Number(e.target.value))}
            className="w-full mt-2 accent-indigo-500"
          />
          <span className="font-mono text-indigo-300 text-sm">{rho.toFixed(2)}</span>
        </label>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="p-4 rounded-xl bg-black/40 border border-indigo-500/30">
          <div className="text-[0.625rem] uppercase tracking-wide text-indigo-400 mb-1">Variance of the ensemble</div>
          <div className="text-2xl font-bold text-indigo-300 font-mono">{variance.toFixed(3)}</div>
          <div className="text-[0.6875rem] text-gray-500 mt-1">as a fraction of one tree's variance</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Floor you cannot get under</div>
          <div className="text-2xl font-bold text-amber-300 font-mono">{floor.toFixed(3)}</div>
          <div className="text-[0.6875rem] text-gray-500 mt-1">ρ itself — no number of trees removes it</div>
        </div>
      </div>

      <div className="p-3.5 rounded-lg border border-amber-500/25 bg-amber-500/10 text-xs text-amber-200 leading-relaxed">
        <strong>This is the equation the algorithm is designed around.</strong> The second term vanishes as you add
        trees, so past a few hundred, more trees do nothing. Only lowering ρ moves the floor — which is exactly what
        random feature selection at each split is for. Bagging alone gets you the second term; the random subspace is
        what attacks the first.
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Bagging visual
-------------------------------------------------------------------------- */

const SAMPLE = ["A", "B", "C", "D", "E", "F"];

function BaggingDemo() {
  const [seed, setSeed] = useState(1);

  // Deterministic pseudo-random draws so the display is stable between renders.
  const bags = useMemo(() => {
    let s = seed * 9301 + 49297;
    const rnd = () => {
      s = (s * 9301 + 49297) % 233280;
      return s / 233280;
    };
    return [0, 1, 2].map(() => {
      const draw = SAMPLE.map(() => SAMPLE[Math.floor(rnd() * SAMPLE.length)]);
      const seen = new Set(draw);
      return { draw, oob: SAMPLE.filter((r) => !seen.has(r)) };
    });
  }, [seed]);

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <span className="text-sm text-gray-400">Training set:</span>
        {SAMPLE.map((r) => (
          <span key={r} className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/15 font-mono text-sm text-gray-200">
            {r}
          </span>
        ))}
        <button
          onClick={() => setSeed((s) => s + 1)}
          className="ml-auto px-3.5 py-1.5 rounded-lg bg-indigo-600 hover:bg-indigo-500 text-white text-sm font-medium transition-colors"
        >
          Resample
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {bags.map((b, i) => (
          <div key={i} className="p-4 rounded-xl border border-white/10 bg-white/5">
            <div className="text-xs font-bold text-gray-300 mb-2">Tree {i + 1} trains on</div>
            <div className="flex flex-wrap gap-1.5 mb-3">
              {b.draw.map((r, j) => (
                <span key={j} className="px-2 py-1 rounded bg-emerald-500/15 border border-emerald-500/30 font-mono text-xs text-emerald-300">
                  {r}
                </span>
              ))}
            </div>
            <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1.5">Out-of-bag (never seen)</div>
            <div className="flex flex-wrap gap-1.5 min-h-[26px]">
              {b.oob.length ? (
                b.oob.map((r) => (
                  <span key={r} className="px-2 py-1 rounded bg-amber-500/15 border border-amber-500/30 font-mono text-xs text-amber-300">
                    {r}
                  </span>
                ))
              ) : (
                <span className="text-xs text-gray-600 italic">none this time</span>
              )}
            </div>
          </div>
        ))}
      </div>

      <p className="text-xs text-gray-500 mt-4 leading-relaxed">
        Each tree draws <strong className="text-gray-400">with replacement</strong>, so rows repeat and some are left
        out entirely. On average about 37% of rows are out-of-bag for any given tree — which hands you a free
        validation set. Scoring each row using only the trees that never saw it gives the{" "}
        <strong className="text-gray-400">OOB error</strong>, an honest estimate with no separate holdout split.
      </p>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Page
-------------------------------------------------------------------------- */

export default function MlRandomForests() {
  const toc = [
    { label: "One tree is not enough", hash: "problem" },
    { label: "Why ensembles work", hash: "why" },
    { label: "Bagging & out-of-bag", hash: "bagging" },
    { label: "The random subspace", hash: "subspace" },
    { label: "Feature importance", hash: "importance" },
    { label: "Hyperparameters that matter", hash: "hyper" },
    { label: "Code", hash: "code" },
    { label: "When to reach for it", hash: "when" },
  ];

  return (
    <GuideLayout
      title="Random Forests"
      intro="Hundreds of deliberately imperfect trees, each shown a different slice of the data, voting together. The strongest baseline in classical machine learning."
      toc={toc}
    >
      {/* ---------------------------------------------------------------- */}
      <section id="problem" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">One tree is not enough</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          A single <a href="#/ml/decision-trees" className="text-indigo-400 hover:underline">decision tree</a> grown to
          full depth will fit your training data perfectly and then fail on new data. Worse, it is unstable: change a
          handful of rows and you get a completely different tree. That instability is the opening a forest exploits.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-xl border border-rose-500/25 bg-rose-500/10">
            <div className="text-rose-400 font-semibold mb-2 text-sm">A deep tree</div>
            <ul className="text-xs text-gray-300 space-y-1.5">
              <li>• Low bias — it can represent almost any boundary</li>
              <li>• Very high variance — tiny data changes reshape it</li>
              <li>• Memorises noise as if it were signal</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-emerald-500/25 bg-emerald-500/10">
            <div className="text-emerald-400 font-semibold mb-2 text-sm">Many deep trees, averaged</div>
            <ul className="text-xs text-gray-300 space-y-1.5">
              <li>• Bias stays roughly where it was</li>
              <li>• Variance drops sharply</li>
              <li>• The noise each tree memorised is different, so it cancels</li>
            </ul>
          </div>
        </div>

        <p className="text-sm text-gray-400 mt-5 max-w-3xl leading-relaxed">
          That is the trick in one sentence: <strong className="text-white">high variance is cheap to fix by
          averaging, high bias is not</strong>. So build learners that are as flexible as possible, let each one
          overfit differently, and average the overfitting away.
        </p>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section id="why" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Why ensembles work</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Two arguments, and the second is the one that explains the algorithm's actual design. Both panels below
          compute their numbers live — move the sliders.
        </p>
        <div className="space-y-6">
          <CondorcetPanel />
          <CorrelationPanel />
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section id="bagging" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Bagging & out-of-bag scoring</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          <strong className="text-white">Bootstrap aggregating</strong> is the first source of difference between
          trees. Each tree gets its own dataset, drawn from the original with replacement and the same size.
        </p>
        <BaggingDemo />
      </section>

      {/* ---------------------------------------------------------------- */}
      <section id="subspace" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The random subspace — what makes it a <em>forest</em></h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Bagging alone is not enough. If one feature is strongly predictive, every bagged tree will split on it first
          and they will all look alike — high ρ, and the variance floor from the panel above stays high. So at{" "}
          <strong className="text-white">every split</strong>, a random forest considers only a random subset of
          features.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="p-5 rounded-xl border border-gray-600/40 bg-white/5">
            <div className="text-gray-300 font-semibold mb-2 text-sm">Bagging only</div>
            <p className="text-xs text-gray-400 leading-relaxed mb-3">
              Every tree sees all features. The dominant feature wins the root split in nearly every tree. Trees are
              similar, mistakes are correlated.
            </p>
            <div className="font-mono text-[0.6875rem] text-rose-300">ρ stays high → limited variance reduction</div>
          </div>
          <div className="p-5 rounded-xl border border-emerald-500/40 bg-emerald-500/10">
            <div className="text-emerald-300 font-semibold mb-2 text-sm">Bagging + random features</div>
            <p className="text-xs text-gray-300 leading-relaxed mb-3">
              The dominant feature is simply unavailable at many splits, forcing trees to find other structure. Trees
              genuinely differ.
            </p>
            <div className="font-mono text-[0.6875rem] text-emerald-300">ρ drops → the average gets much better</div>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            <strong className="text-gray-200">The counter-intuitive part:</strong> each individual tree is made{" "}
            <em>worse</em> by hiding features from it. You are trading a little accuracy per tree for much less
            correlation between trees, and the second effect dominates. Conventional starting points are √p features
            per split for classification and p/3 for regression, where p is the total feature count.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section id="importance" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Feature importance — and how it lies</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Forests give you a ranking of which features mattered. It is genuinely useful and routinely misread.
        </p>

        <div className="space-y-4">
          {[
            {
              n: "Impurity (Gini) importance",
              d: "Sum the impurity reduction from every split on that feature, across all trees. Free — it falls out of training.",
              flaw: "Biased toward high-cardinality and continuous features, because they offer more possible split points and so more chances to look good by luck. Computed on training data, so it rewards overfitting.",
              box: "border-amber-500/25 bg-amber-500/[0.07]",
              label: "text-amber-400",
            },
            {
              n: "Permutation importance",
              d: "Shuffle one column in held-out data and measure how much the score drops. If the model needed it, the score collapses.",
              flaw: "Costs an extra pass per feature, and with correlated features it splits the credit — drop one and the model leans on its twin, so both look unimportant.",
              box: "border-emerald-500/25 bg-emerald-500/[0.07]",
              label: "text-emerald-400",
            },
            {
              n: "SHAP values",
              d: "Attribute each individual prediction to each feature, with a game-theoretic guarantee that contributions sum to the prediction.",
              flaw: "Slowest of the three, and per-prediction attributions get averaged into global claims they do not quite support.",
              box: "border-indigo-500/25 bg-indigo-500/[0.07]",
              label: "text-indigo-400",
            },
          ].map((m) => (
            <div key={m.n} className={`p-5 rounded-xl border ${m.box}`}>
              <div className={`font-semibold mb-1.5 ${m.label}`}>{m.n}</div>
              <p className="text-sm text-gray-300 leading-relaxed mb-2">{m.d}</p>
              <p className="text-xs text-gray-400 leading-relaxed m-0">
                <strong className="text-gray-300">Where it misleads:</strong> {m.flaw}
              </p>
            </div>
          ))}
        </div>

        <div className="mt-5 p-4 rounded-xl border border-rose-500/25 bg-rose-500/10">
          <p className="text-sm text-rose-200 leading-relaxed m-0">
            <strong>Importance is not causation.</strong> A feature can rank first because it leaks the answer — an
            appointment-booked flag in a churn model, a hospital ID in a diagnosis model. High importance on a feature
            you did not expect is a signal to go look for leakage before you celebrate.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section id="hyper" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Hyperparameters that actually matter</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">Parameter</th>
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">What it controls</th>
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">Practical advice</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              {[
                ["n_estimators", "Number of trees.", "More is never worse for accuracy, only slower. Raise it until the OOB score flattens, then stop."],
                ["max_features", "Features considered per split — the ρ dial.", "The one worth tuning. √p and p/3 are starting points, not answers."],
                ["max_depth", "How deep each tree may grow.", "Usually leave unlimited. Averaging handles the overfitting; capping depth adds bias you cannot average away."],
                ["min_samples_leaf", "Smallest allowed leaf.", "The gentler brake. Raise it on noisy data before you touch depth."],
                ["class_weight", "Per-class penalty.", "Set to balanced for skewed targets, or the majority class swallows the vote."],
              ].map(([p, c, a], i) => (
                <tr key={p} className={i % 2 ? "bg-gray-900/30" : ""}>
                  <td className="px-4 py-3 border-b border-gray-900 font-mono text-xs text-indigo-300 align-top whitespace-nowrap">{p}</td>
                  <td className="px-4 py-3 border-b border-gray-900 align-top">{c}</td>
                  <td className="px-4 py-3 border-b border-gray-900 align-top text-gray-300">{a}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section id="code" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Code</h2>
        <CodeBlock
          language="python"
          code={`from sklearn.ensemble import RandomForestClassifier
from sklearn.inspection import permutation_importance

clf = RandomForestClassifier(
    n_estimators=500,        # raise until OOB flattens
    max_features="sqrt",     # the correlation dial — tune this one
    min_samples_leaf=1,      # raise on noisy data
    oob_score=True,          # free validation from the left-out rows
    class_weight="balanced",
    n_jobs=-1,               # trees are independent: parallelise them
    random_state=42,
)
clf.fit(X_train, y_train)

print(f"OOB estimate: {clf.oob_score_:.3f}")

# Prefer permutation importance on held-out data over clf.feature_importances_
perm = permutation_importance(clf, X_test, y_test, n_repeats=10, random_state=42)
for i in perm.importances_mean.argsort()[::-1][:10]:
    print(f"{feature_names[i]:<24} {perm.importances_mean[i]:.4f}")`}
        />
        <p className="text-xs text-gray-500 mt-3">
          <span className="font-mono text-gray-400">n_jobs=-1</span> is close to free speed here. Because bagged trees
          never look at each other, they parallelise perfectly — unlike boosting, where each tree depends on the last.
        </p>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section id="when" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">When to reach for it</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Strong choice</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Tabular data with mixed numeric and categorical features.</li>
              <li>You want a solid result fast — the defaults are genuinely good.</li>
              <li>No feature scaling, and outliers barely matter.</li>
              <li>Non-linear interactions you would struggle to specify by hand.</li>
              <li>You need a baseline before trying anything clever.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Look elsewhere</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Images, audio or text — use a neural network.</li>
              <li>Last few points of accuracy matter: <a href="#/ml/xgboost" className="text-blue-400 hover:underline">gradient boosting</a> usually wins.</li>
              <li>You must explain a single decision to a regulator — one shallow tree is auditable, 500 are not.</li>
              <li>Extrapolation beyond the training range — trees predict a flat line outside it.</li>
              <li>Very tight latency or memory budgets at inference time.</li>
            </ul>
          </div>
        </div>

        <div className="mt-6 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            <strong className="text-gray-200">The honest summary:</strong> a random forest is the model to try second,
            right after a linear baseline. It is hard to misuse, hard to overfit badly, and tells you quickly whether
            there is signal in your features at all. If it scores near chance, the problem is your data, not your
            model.
          </p>
        </div>
      </section>
      <KnowledgeCheck questions={questionsFor("ml-ensembles")} />
    </GuideLayout>
  );
}

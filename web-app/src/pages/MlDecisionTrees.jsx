import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import { Panel, Slider, Metric, Card, Note, Section } from "../components/VizKit";
import { rng, randn, pct } from "../lib/stats";

/* ---------------------------------------------------------------------------
   A real CART tree (Gini, axis-aligned splits) grown on a noisy 2-D dataset,
   so the depth slider shows genuine train and test accuracy — not a sketch.
--------------------------------------------------------------------------- */

function makeData(seed, n) {
  const r = rng(seed);
  const pts = [];
  for (let i = 0; i < n; i++) {
    const x = r();
    const y = r();
    // True boundary: a wavy curve. 12% of labels are flipped to act as noise.
    let label = y > 0.5 + 0.22 * Math.sin(x * 6.2) ? 1 : 0;
    if (r() < 0.12) label = 1 - label;
    pts.push({ x: x + randn(r) * 0.01, y, label });
  }
  return pts;
}

const TRAIN = makeData(7, 160);
const TEST = makeData(99, 400);

const gini = (pts) => {
  if (!pts.length) return 0;
  const p = pts.filter((q) => q.label === 1).length / pts.length;
  return 1 - p * p - (1 - p) * (1 - p);
};

function grow(pts, depth, minLeaf) {
  const ones = pts.filter((q) => q.label === 1).length;
  const leaf = { leaf: true, label: ones * 2 >= pts.length ? 1 : 0 };
  if (depth === 0 || pts.length < 2 * minLeaf || ones === 0 || ones === pts.length) return leaf;
  let best = null;
  for (const axis of ["x", "y"]) {
    const sorted = [...pts].sort((a, b) => a[axis] - b[axis]);
    for (let i = minLeaf; i <= sorted.length - minLeaf; i++) {
      if (i === sorted.length) break;
      const t = (sorted[i - 1][axis] + sorted[i][axis]) / 2;
      const L = sorted.slice(0, i);
      const R = sorted.slice(i);
      const score = (L.length * gini(L) + R.length * gini(R)) / sorted.length;
      if (!best || score < best.score) best = { axis, t, L, R, score };
    }
  }
  if (!best || best.score >= gini(pts)) return leaf;
  return { axis: best.axis, t: best.t, l: grow(best.L, depth - 1, minLeaf), r: grow(best.R, depth - 1, minLeaf) };
}

const predict = (node, p) => (node.leaf ? node.label : predict(p[node.axis] < node.t ? node.l : node.r, p));
const countLeaves = (n) => (n.leaf ? 1 : countLeaves(n.l) + countLeaves(n.r));
const acc = (tree, pts) => pts.filter((p) => predict(tree, p) === p.label).length / pts.length;

const CURVE = Array.from({ length: 12 }, (_, i) => {
  const t = grow(TRAIN, i + 1, 1);
  return { depth: i + 1, train: acc(t, TRAIN), test: acc(t, TEST) };
});

function DepthLab() {
  const [depth, setDepth] = useState(3);
  const [minLeaf, setMinLeaf] = useState(1);
  const tree = useMemo(() => grow(TRAIN, depth, minLeaf), [depth, minLeaf]);
  const W = 300;
  const cells = 50;
  const cs = W / cells;
  const tr = acc(tree, TRAIN);
  const te = acc(tree, TEST);
  const cw = 300;
  const ch = 150;
  const cx = (d) => 20 + ((d - 1) / 11) * (cw - 30);
  const cy = (a) => 10 + (1 - (a - 0.5) / 0.5) * (ch - 30);
  const line = (k) => CURVE.map((c, i) => `${i ? "L" : "M"}${cx(c.depth)},${cy(c[k])}`).join("");

  return (
    <Panel tone="emerald" title="Grow the tree deeper and watch it memorise the noise">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
        <div>
          <svg viewBox={`0 0 ${W} ${W}`} className="w-full h-auto block rounded-lg border border-white/10">
            {Array.from({ length: cells * cells }, (_, i) => {
              const gx = i % cells;
              const gy = Math.floor(i / cells);
              const lab = predict(tree, { x: (gx + 0.5) / cells, y: 1 - (gy + 0.5) / cells });
              return <rect key={i} x={gx * cs} y={gy * cs} width={cs + 0.3} height={cs + 0.3} fill={lab ? "rgba(52,211,153,0.18)" : "rgba(251,113,133,0.16)"} />;
            })}
            {TRAIN.map((p, i) => (
              <circle key={i} cx={p.x * W} cy={(1 - p.y) * W} r="3.2" fill={p.label ? "#34d399" : "#fb7185"} stroke="rgba(0,0,0,0.6)" strokeWidth="0.8" />
            ))}
          </svg>
          <p className="text-[0.6875rem] text-gray-500 mt-2 mb-0">Shaded regions are the tree's predictions; dots are the 160 training points (12% have flipped labels).</p>
        </div>
        <div className="space-y-4">
          <Slider tone="emerald" label="max_depth" value={depth} min={1} max={12} onChange={setDepth} />
          <Slider tone="emerald" label="min_samples_leaf" value={minLeaf} min={1} max={20} onChange={setMinLeaf} />
          <div className="grid grid-cols-3 gap-2">
            <Metric label="Train acc" value={pct(tr, 0)} tone="emerald" />
            <Metric label="Test acc" value={pct(te, 0)} tone={te < tr - 0.08 ? "rose" : "blue"} />
            <Metric label="Leaves" value={countLeaves(tree)} />
          </div>
          <svg viewBox={`0 0 ${cw} ${ch}`} className="w-full h-auto block">
            <path d={line("train")} fill="none" stroke="#34d399" strokeWidth="2" />
            <path d={line("test")} fill="none" stroke="#60a5fa" strokeWidth="2" />
            <line x1={cx(depth)} y1="6" x2={cx(depth)} y2={ch - 20} stroke="#e5e7eb" strokeDasharray="3 3" />
            <text x="22" y={ch - 6} fill="#6b7280" fontSize="10">depth 1</text>
            <text x={cw - 10} y={ch - 6} fill="#6b7280" fontSize="10" textAnchor="end">depth 12 (min_samples_leaf = 1)</text>
            <text x={cw - 10} y="16" fill="#34d399" fontSize="10" textAnchor="end">train</text>
            <text x={cw - 10} y="30" fill="#60a5fa" fontSize="10" textAnchor="end">test</text>
          </svg>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Past a few levels, training accuracy keeps climbing toward 100% while test accuracy stalls or falls: the extra
        splits are carving out little boxes around mislabelled points. Raising <span className="font-mono">min_samples_leaf</span>{" "}
        stops a leaf forming around one or two points, which is a form of pre-pruning.
      </p>
    </Panel>
  );
}

export default function MlDecisionTrees() {
  const [splitState, setSplitState] = useState(0); // 0 = root, 1 = left split, 2 = all split

  const handleSplit1 = () => setSplitState(1);
  const handleSplit2 = () => setSplitState(2);
  const handleReset = () => setSplitState(0);

  const lineVariants = {
    hidden: { height: 0, opacity: 0 },
    visible: (custom) => ({ height: custom, opacity: 1, transition: { duration: 0.5 } })
  };

  const nodeVariants = {
    hidden: { scale: 0, opacity: 0 },
    visible: { scale: 1, opacity: 1, transition: { type: "spring", stiffness: 200, damping: 20, delay: 0.3 } }
  };

  const labelVariants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1, transition: { delay: 0.5 } }
  };

  return (
    <GuideLayout
      title="Decision Trees"
      intro="A supervised machine learning algorithm used for both classification and regression tasks."
      toc={[
        { label: "Interactive Tree", hash: "demo" },
        { label: "Structure of a Tree", hash: "structure" },
        { label: "Metrics for Splitting", hash: "splitting" },
        { label: "Overfitting & Pruning", hash: "overfitting" },
        { label: "Strengths & Weaknesses", hash: "strengths" },
        { label: "In Code", hash: "code" },
      ]}
    >
      <motion.section 
        id="demo" className="guide-section mb-16 scroll-mt-24"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-100">Interactive Decision Tree Animation</h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          A Decision Tree splits data based on the most significant features. At each node, the algorithm asks a yes/no question, branching based on the answer until a final decision (leaf node) is reached.
        </p>
        
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl py-10 px-5 flex flex-col items-center relative overflow-hidden min-h-[450px]">
          
          {/* Root Node */}
          <div className="absolute top-[20px] left-1/2 -translate-x-1/2 z-10 bg-gradient-to-br from-indigo-500 to-pink-500 px-6 py-3 rounded-xl text-white font-bold shadow-lg shadow-indigo-500/20 whitespace-nowrap">
            Is Age &lt; 30?
          </div>

          {/* Level 1 Lines */}
          <motion.div 
            className="absolute top-[60px] left-1/2 w-0.5 bg-white/20 origin-top" 
            style={{ rotate: "58deg" }}
            variants={lineVariants}
            custom={150}
            initial="hidden"
            animate={splitState >= 1 ? "visible" : "hidden"}
          />
          <motion.div 
            className="absolute top-[60px] left-1/2 w-0.5 bg-white/20 origin-top" 
            style={{ rotate: "-58deg" }}
            variants={lineVariants}
            custom={150}
            initial="hidden"
            animate={splitState >= 1 ? "visible" : "hidden"}
          />

          {/* Level 1 Labels */}
          <motion.div variants={labelVariants} initial="hidden" animate={splitState >= 1 ? "visible" : "hidden"} className="absolute top-[90px] left-[35%] bg-[#0a0a0a] px-2 py-0.5 rounded text-xs text-gray-400 z-10">Yes</motion.div>
          <motion.div variants={labelVariants} initial="hidden" animate={splitState >= 1 ? "visible" : "hidden"} className="absolute top-[90px] left-[60%] bg-[#0a0a0a] px-2 py-0.5 rounded text-xs text-gray-400 z-10">No</motion.div>

          {/* Level 1 Nodes */}
          <motion.div 
            variants={nodeVariants}
            initial="hidden"
            animate={splitState >= 1 ? "visible" : "hidden"}
            className="absolute top-[140px] left-[25%] -translate-x-1/2 z-10 bg-gradient-to-br from-indigo-500 to-pink-500 px-6 py-3 rounded-xl text-white font-bold shadow-lg shadow-indigo-500/20 whitespace-nowrap"
          >
            Eats Pizza?
          </motion.div>
          
          <motion.div 
            variants={nodeVariants}
            initial="hidden"
            animate={splitState >= 1 ? "visible" : "hidden"}
            className="absolute top-[140px] left-[75%] -translate-x-1/2 z-10 bg-rose-500/20 border border-rose-500 px-6 py-3 rounded-xl text-rose-300 font-bold shadow-lg shadow-rose-500/10 whitespace-nowrap"
          >
            Prediction: Unfit
          </motion.div>

          {/* Level 2 Lines */}
          <motion.div 
            className="absolute top-[180px] left-[25%] w-0.5 bg-white/20 origin-top" 
            style={{ rotate: "45deg" }}
            variants={lineVariants}
            custom={110}
            initial="hidden"
            animate={splitState >= 2 ? "visible" : "hidden"}
          />
          <motion.div 
            className="absolute top-[180px] left-[25%] w-0.5 bg-white/20 origin-top" 
            style={{ rotate: "-45deg" }}
            variants={lineVariants}
            custom={110}
            initial="hidden"
            animate={splitState >= 2 ? "visible" : "hidden"}
          />

          {/* Level 2 Labels */}
          <motion.div variants={labelVariants} initial="hidden" animate={splitState >= 2 ? "visible" : "hidden"} className="absolute top-[210px] left-[16%] bg-[#0a0a0a] px-2 py-0.5 rounded text-xs text-gray-400 z-10">Yes</motion.div>
          <motion.div variants={labelVariants} initial="hidden" animate={splitState >= 2 ? "visible" : "hidden"} className="absolute top-[210px] left-[29%] bg-[#0a0a0a] px-2 py-0.5 rounded text-xs text-gray-400 z-10">No</motion.div>

          {/* Level 2 Nodes */}
          <motion.div 
            variants={nodeVariants}
            initial="hidden"
            animate={splitState >= 2 ? "visible" : "hidden"}
            className="absolute top-[260px] left-[12.5%] -translate-x-1/2 z-10 bg-rose-500/20 border border-rose-500 px-6 py-3 rounded-xl text-rose-300 font-bold shadow-lg shadow-rose-500/10 whitespace-nowrap"
          >
            Prediction: Unfit
          </motion.div>
          
          <motion.div 
            variants={nodeVariants}
            initial="hidden"
            animate={splitState >= 2 ? "visible" : "hidden"}
            className="absolute top-[260px] left-[37.5%] -translate-x-1/2 z-10 bg-emerald-500/20 border border-emerald-500 px-6 py-3 rounded-xl text-emerald-300 font-bold shadow-lg shadow-emerald-500/10 whitespace-nowrap"
          >
            Prediction: Fit
          </motion.div>
          
          <div className="flex-grow"></div>
          
          <div className="flex gap-4 mt-auto pt-72 z-20">
            <button 
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${splitState === 0 ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'border border-gray-700 text-gray-500 cursor-not-allowed'}`}
              onClick={handleSplit1}
              disabled={splitState !== 0}
            >
              Split Root Node
            </button>
            <button 
              className={`px-4 py-2 rounded-lg font-medium transition-colors ${splitState === 1 ? 'bg-indigo-600 hover:bg-indigo-500 text-white' : 'border border-gray-700 text-gray-500 cursor-not-allowed'}`}
              onClick={handleSplit2}
              disabled={splitState !== 1}
            >
              Split Left Node
            </button>
            <button 
              className="px-4 py-2 border border-gray-700 hover:bg-gray-800 text-gray-300 font-medium rounded-lg transition-colors"
              onClick={handleReset}
            >
              Reset
            </button>
          </div>
        </div>
      </motion.section>

      <motion.section 
        id="structure" className="guide-section mb-16 scroll-mt-24"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-6 text-gray-100">Structure of a Decision Tree</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Root Node</h3>
            <p className="text-gray-400 text-sm">Represents the entire dataset and the initial decision to be made.</p>
          </div>
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Internal Nodes</h3>
            <p className="text-gray-400 text-sm">Represent decisions or tests on attributes. Each internal node has one or more branches.</p>
          </div>
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Branches</h3>
            <p className="text-gray-400 text-sm">Represent the outcome of a decision or test, leading to another node.</p>
          </div>
          <div className="bg-[#111] border border-gray-800 rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-2">Leaf Nodes</h3>
            <p className="text-gray-400 text-sm">Represent the final decision or prediction. No further splits occur at these nodes.</p>
          </div>
        </div>
      </motion.section>

      <motion.section 
        id="splitting" className="guide-section mb-16 scroll-mt-24"
        initial={{ opacity: 0, y: 20 }}
        whileInView={{ opacity: 1, y: 0 }}
        viewport={{ once: true }}
        transition={{ duration: 0.5 }}
      >
        <h2 className="text-2xl font-bold mb-4 text-gray-100">Metrics for Splitting</h2>
        <p className="text-gray-300 mb-6 leading-relaxed">
          When constructing decision trees, different metrics are used to determine the best way to split the dataset.
        </p>
        
        <div className="space-y-6">
          <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-6" style={{ marginBottom: "20px" }}>
            <div className="font-bold text-indigo-300 mb-2">1. Gini Impurity (Classification)</div>
            <p className="text-gray-300 text-sm mb-3">Measures the likelihood of incorrectly classifying a randomly chosen element if it was randomly labeled according to the distribution of labels in the subset.</p>
            <div className="font-mono bg-black/40 p-3 rounded-lg text-sm text-gray-200" style={{ fontFamily: "var(--mono)", background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "8px", marginTop: "10px", fontSize: "0.9rem" }}>
              {`Gini = 1 - Σ(p_i²)`}
            </div>
            <p className="mt-3 text-sm text-gray-400" style={{ marginTop: "10px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              <strong className="text-gray-300">Goal:</strong> Minimize Gini impurity. <strong className="text-gray-300">Range:</strong> 0 (pure) to 0.5 (impure).
            </p>
          </div>

          <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-6" style={{ marginBottom: "20px" }}>
            <div className="font-bold text-indigo-300 mb-2">2. Entropy & Information Gain (Classification)</div>
            <p className="text-gray-300 text-sm mb-3">Entropy measures randomness or disorder. Information gain is the reduction in entropy after a split.</p>
            <div className="font-mono bg-black/40 p-3 rounded-lg text-sm text-gray-200" style={{ fontFamily: "var(--mono)", background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "8px", marginTop: "10px", fontSize: "0.9rem" }}>
              {`Entropy = -Σ(p_i * log₂(p_i))`}
              <br/>
              {`Information Gain = Entropy(parent) - Σ( (n_k/n) * Entropy(k) )`}
            </div>
            <p className="mt-3 text-sm text-gray-400" style={{ marginTop: "10px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              <strong className="text-gray-300">Goal:</strong> Maximize information gain. <strong className="text-gray-300">Range:</strong> 0 (pure) to log(n) (impure).
            </p>
          </div>
          
          <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-6" style={{ marginBottom: "20px" }}>
            <div className="font-bold text-purple-300 mb-2">3. Variance Reduction / MSE (Regression)</div>
            <p className="text-gray-300 text-sm mb-3">Used to minimize the variance of the target variable in each split.</p>
            <div className="font-mono bg-black/40 p-3 rounded-lg text-sm text-gray-200" style={{ fontFamily: "var(--mono)", background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "8px", marginTop: "10px", fontSize: "0.9rem" }}>
              {`Variance = (1/n) * Σ(y_i - μ)²`}
            </div>
            <p className="mt-3 text-sm text-gray-400" style={{ marginTop: "10px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              <strong className="text-gray-300">Goal:</strong> Minimize the variance of target values within child nodes.
            </p>
          </div>

          <div className="bg-purple-900/10 border border-purple-500/20 rounded-xl p-6" style={{ marginBottom: "20px" }}>
            <div className="font-bold text-purple-300 mb-2">4. Mean Absolute Error / MAE (Regression)</div>
            <p className="text-gray-300 text-sm mb-3">Measures the average of the absolute differences between predicted values and actual values.</p>
            <div className="font-mono bg-black/40 p-3 rounded-lg text-sm text-gray-200" style={{ fontFamily: "var(--mono)", background: "rgba(0,0,0,0.3)", padding: "10px", borderRadius: "8px", marginTop: "10px", fontSize: "0.9rem" }}>
              {`MAE = (1/n) * Σ|y_i - ŷ_i|`}
            </div>
            <p className="mt-3 text-sm text-gray-400" style={{ marginTop: "10px", fontSize: "0.85rem", color: "var(--text-muted)" }}>
              <strong className="text-gray-300">Goal:</strong> Minimize the absolute difference.
            </p>
          </div>
        </div>
      </motion.section>

      <Section id="overfitting" title="Overfitting & Pruning" lead="An unconstrained tree keeps splitting until every leaf is pure — which on noisy data means one leaf per mislabelled point. Depth is the main dial between underfitting and overfitting.">
        <DepthLab />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card title="Pre-pruning" tone="emerald"><p>Stop early: <span className="font-mono">max_depth</span>, <span className="font-mono">min_samples_leaf</span>, <span className="font-mono">min_samples_split</span>, <span className="font-mono">max_leaf_nodes</span>. Cheap and usually enough. Tune them with cross-validation.</p></Card>
          <Card title="Post-pruning" tone="indigo"><p>Grow the full tree, then cut back branches that do not pay for themselves. scikit-learn's cost-complexity pruning (<span className="font-mono">ccp_alpha</span>) penalises each extra leaf.</p></Card>
          <Card title="Or average many trees" tone="amber"><p>Deep trees have low bias and high variance. <a href="#/ml/random-forests" className="text-blue-400 hover:underline">Random forests</a> average that variance away; <a href="#/ml/xgboost" className="text-blue-400 hover:underline">boosting</a> stacks shallow trees instead.</p></Card>
        </div>
      </Section>

      <Section id="strengths" title="Strengths & Weaknesses">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Strengths</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Readable: a shallow tree is a flowchart you can hand to a non-specialist.</li>
              <li>No feature scaling needed — splits compare a feature with a threshold.</li>
              <li>Captures interactions and non-linear boundaries on its own.</li>
              <li>Mixes numeric and categorical features.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Weaknesses</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Unstable: a small change in the data can produce a completely different tree.</li>
              <li>Axis-aligned splits approximate diagonal boundaries with a staircase.</li>
              <li>Cannot extrapolate — a regression tree predicts at most the largest value it has seen.</li>
              <li>Impurity-based feature importances favour features with many distinct values; prefer permutation importance.</li>
            </ul>
          </div>
        </div>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`from sklearn.tree import DecisionTreeClassifier, export_text
from sklearn.model_selection import GridSearchCV

search = GridSearchCV(
    DecisionTreeClassifier(random_state=0),
    {"max_depth": [2, 3, 4, 6, 8, None], "min_samples_leaf": [1, 5, 10, 20]},
    cv=5,
)
search.fit(X_train, y_train)
tree = search.best_estimator_
print(search.best_params_, tree.score(X_test, y_test))

# The learned rules, as text
print(export_text(tree, feature_names=list(X_train.columns)))

# Cost-complexity pruning: each alpha gives a smaller tree
path = DecisionTreeClassifier(random_state=0).cost_complexity_pruning_path(X_train, y_train)
print(path.ccp_alphas[:5])`}
        />
        <Note tone="indigo">
          To judge a classifier properly — beyond accuracy — see{" "}
          <a href="#/ml/evaluation-metrics" className="text-blue-400 hover:underline">Evaluation Metrics</a>.
        </Note>
      </Section>

    </GuideLayout>
  );
}

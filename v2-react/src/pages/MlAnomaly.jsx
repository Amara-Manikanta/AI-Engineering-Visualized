import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section, Segmented } from "../components/VizKit";
import { rng, randn, mean, std } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "anomaly detection", "outlier detection", "novelty detection", "isolation forest", "z-score", "IQR",
  "local outlier factor", "LOF", "k-nearest neighbour distance", "one-class SVM", "autoencoder",
  "reconstruction error", "fraud detection", "intrusion detection", "contamination", "point anomaly",
  "contextual anomaly", "collective anomaly", "alert fatigue",
];

/* ---------------------------------------------------------------------------
   Two normal clusters of different density plus a handful of planted
   anomalies. Three detectors score every point; the top share is flagged.
--------------------------------------------------------------------------- */

const DATA = (() => {
  const r = rng(51);
  const pts = [];
  for (let i = 0; i < 120; i++) pts.push({ x: 0.27 + randn(r) * 0.06, y: 0.3 + randn(r) * 0.06, truth: 0 });
  for (let i = 0; i < 60; i++) pts.push({ x: 0.74 + randn(r) * 0.035, y: 0.72 + randn(r) * 0.035, truth: 0 });
  // Planted anomalies: some far away, one tucked between the clusters, one next to the tight cluster.
  [[0.9, 0.12], [0.08, 0.88], [0.5, 0.52], [0.93, 0.9], [0.58, 0.8], [0.12, 0.08]].forEach(([x, y]) => pts.push({ x, y, truth: 1 }));
  return pts;
})();

/* Isolation forest: random axis-aligned splits; anomalies are isolated in few splits. */
function buildTree(pts, depth, limit, r) {
  if (depth >= limit || pts.length <= 1) return { size: pts.length };
  const axis = r() < 0.5 ? "x" : "y";
  const vals = pts.map((p) => p[axis]);
  const lo = Math.min(...vals);
  const hi = Math.max(...vals);
  if (lo === hi) return { size: pts.length };
  const t = lo + r() * (hi - lo);
  return { axis, t, l: buildTree(pts.filter((p) => p[axis] < t), depth + 1, limit, r), r: buildTree(pts.filter((p) => p[axis] >= t), depth + 1, limit, r) };
}

const cFactor = (n) => (n <= 1 ? 0 : 2 * (Math.log(n - 1) + 0.5772156649) - (2 * (n - 1)) / n);

function pathLength(node, p, depth = 0) {
  if (node.size !== undefined) return depth + cFactor(node.size);
  return pathLength(p[node.axis] < node.t ? node.l : node.r, p, depth + 1);
}

const FOREST = (() => {
  const r = rng(9);
  const sub = 128;
  const limit = Math.ceil(Math.log2(sub));
  return Array.from({ length: 100 }, () => {
    const sample = Array.from({ length: sub }, () => DATA[Math.floor(r() * DATA.length)]);
    return buildTree(sample, 0, limit, r);
  });
})();

const iforestScore = (p) => {
  const avg = FOREST.reduce((s, t) => s + pathLength(t, p), 0) / FOREST.length;
  return 2 ** (-avg / cFactor(128)); // near 1 = anomalous, around 0.5 or below = normal
};

const MX = mean(DATA.map((p) => p.x));
const MY = mean(DATA.map((p) => p.y));
const SX = std(DATA.map((p) => p.x));
const SY = std(DATA.map((p) => p.y));
const zScore = (p) => Math.max(Math.abs((p.x - MX) / SX), Math.abs((p.y - MY) / SY));

const knnScore = (p, k = 5) =>
  DATA.map((q) => Math.hypot(p.x - q.x, p.y - q.y))
    .sort((a, b) => a - b)
    .slice(1, k + 1)
    .reduce((a, b) => a + b, 0) / k;

const SCORERS = { iforest: iforestScore, knn: knnScore, z: zScore };

function DetectorLab() {
  const [method, setMethod] = useState("iforest");
  const [share, setShare] = useState(4);
  const score = SCORERS[method];

  const scores = useMemo(() => DATA.map(score), [score]);
  const cut = [...scores].sort((a, b) => b - a)[Math.max(0, Math.round((share / 100) * DATA.length) - 1)];
  const flagged = scores.map((s) => s >= cut);
  const tp = flagged.filter((f, i) => f && DATA[i].truth).length;
  const nFlag = flagged.filter(Boolean).length;
  const nTrue = DATA.filter((p) => p.truth).length;

  const heat = useMemo(() => {
    const n = 34;
    const cells = [];
    let lo = Infinity, hi = -Infinity;
    for (let i = 0; i < n; i++)
      for (let j = 0; j < n; j++) {
        const v = score({ x: (i + 0.5) / n, y: (j + 0.5) / n });
        lo = Math.min(lo, v);
        hi = Math.max(hi, v);
        cells.push({ i, j, v });
      }
    return { n, cells, lo, hi };
  }, [score]);

  const S = 300;
  const s = (v) => v * S;
  const cw = S / heat.n;

  return (
    <Panel tone="rose" title="Three detectors, the same data">
      <div className="flex flex-wrap items-end gap-5 mb-4">
        <Segmented
          tone="rose"
          value={method}
          onChange={setMethod}
          options={[
            { v: "iforest", label: "Isolation forest" },
            { v: "knn", label: "k-NN distance" },
            { v: "z", label: "Per-feature z-score" },
          ]}
        />
        <div className="w-52"><Slider tone="rose" label="Flag the top" value={share} min={1} max={15} onChange={setShare} format={(v) => `${v}% of points`} /></div>
      </div>
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_240px] gap-5">
        <svg viewBox={`0 0 ${S} ${S}`} className="w-full max-w-md h-auto block rounded-lg border border-white/10">
          {heat.cells.map((c) => {
            const t = (c.v - heat.lo) / (heat.hi - heat.lo || 1);
            return <rect key={`${c.i}-${c.j}`} x={c.i * cw} y={c.j * cw} width={cw + 0.3} height={cw + 0.3} fill={`rgba(251,113,133,${0.05 + t * 0.55})`} />;
          })}
          {DATA.map((p, i) => (
            <g key={i}>
              {flagged[i] && <circle cx={s(p.x)} cy={s(p.y)} r="8" fill="none" stroke="#fde68a" strokeWidth="1.8" />}
              <circle cx={s(p.x)} cy={s(p.y)} r={p.truth ? 4 : 2.8} fill={p.truth ? "#fb7185" : "#cbd5e1"} stroke="rgba(0,0,0,0.6)" strokeWidth="0.6" />
            </g>
          ))}
        </svg>
        <div className="space-y-3">
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Flagged" value={nFlag} tone="amber" sub="yellow rings" />
            <Metric label="Planted anomalies caught" value={`${tp} / ${nTrue}`} tone="rose" />
          </div>
          <p className="text-xs text-gray-400 leading-relaxed m-0">
            Red dots are the six planted anomalies; the background shows each method's score (redder = more anomalous).
          </p>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        At the default 4%, isolation forest flags all six. The z-score looks at each feature on its own against the
        global mean, so its "normal" region is one big box: it catches the far-away points but misses the one in
        the gap between the clusters, whose x and y are each unremarkable. k-NN distance misses the gap point too,
        for a different reason: stragglers at the edge of the loose cluster have even larger neighbour distances,
        so a single distance threshold cannot suit both densities. That is exactly what Local Outlier Factor fixes,
        by comparing each point's neighbour distance with its neighbours' own.
      </p>
    </Panel>
  );
}

export default function MlAnomaly() {
  const toc = [
    { label: "What Counts as an Anomaly", hash: "what" },
    { label: "Detector Lab", hash: "lab" },
    { label: "How Isolation Forest Works", hash: "iforest" },
    { label: "The Method Toolbox", hash: "methods" },
    { label: "Evaluating Without Labels", hash: "evaluation" },
    { label: "In Production", hash: "production" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Anomaly Detection"
      intro="Finding the rare, the broken and the fraudulent when you have few or no labelled examples: statistical rules, isolation forests, neighbour distances and autoencoders — and how to evaluate them honestly."
      toc={toc}
    >
      <Section id="what" title="What Counts as an Anomaly" lead="An anomaly is a point that does not fit the pattern of the rest. Usually you have lots of normal data and almost no labelled anomalies — which makes this mostly an unsupervised problem.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Point anomaly" tone="rose"><p>A single value far from everything else: a $50,000 purchase on a card that never exceeds $200.</p></Card>
          <Card title="Contextual anomaly" tone="amber"><p>Normal in one context, abnormal in another: 30 °C is ordinary in July and alarming in January.</p></Card>
          <Card title="Collective anomaly" tone="purple"><p>Each point looks fine, but the sequence does not: a flat-lined heart-rate signal, a slow data exfiltration.</p></Card>
        </div>
      </Section>

      <Section id="lab" title="Detector Lab" lead="180 normal points in two clusters of different density, plus six planted anomalies. Every score is computed in your browser.">
        <DetectorLab />
      </Section>

      <Section id="iforest" title="How Isolation Forest Works" lead="Instead of modelling what normal looks like, isolation forest measures how easy each point is to separate from the rest.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="1. Random splits" tone="indigo"><p>Build many trees on random subsamples. Each split picks a random feature and a random threshold between its min and max.</p></Card>
          <Card title="2. Path length" tone="emerald"><p>An isolated point ends up alone in a leaf after a few splits. A point deep inside a cluster needs many.</p></Card>
          <Card title="3. Average & score" tone="rose"><p>Short average path across the forest means anomalous. Scores are normalised so values near 1 are anomalies and values well below 0.5 are normal.</p></Card>
        </div>
        <Note tone="indigo">
          It is fast, needs no distance metric or scaling, and handles many features — which is why it is the usual
          first thing to try on tabular data.
        </Note>
      </Section>

      <Section id="methods" title="The Method Toolbox">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm min-w-[620px]">
            <thead className="bg-white/5 text-gray-400 text-left">
              <tr><th className="p-3 font-medium">Method</th><th className="p-3 font-medium">Idea</th><th className="p-3 font-medium">Good for</th></tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-t border-white/5"><td className="p-3 font-semibold text-white">z-score / IQR rules</td><td className="p-3 text-xs">Flag values beyond k standard deviations or 1.5 × IQR</td><td className="p-3 text-xs text-gray-400">One metric at a time; dashboards and data validation</td></tr>
              <tr className="border-t border-white/5"><td className="p-3 font-semibold text-white">Isolation forest</td><td className="p-3 text-xs">Anomalies are easy to isolate with random splits</td><td className="p-3 text-xs text-gray-400">Tabular data with many features; strong default</td></tr>
              <tr className="border-t border-white/5"><td className="p-3 font-semibold text-white">k-NN distance / LOF</td><td className="p-3 text-xs">Far from neighbours (LOF: relative to neighbours' own density)</td><td className="p-3 text-xs text-gray-400">Clusters of varying density; embeddings</td></tr>
              <tr className="border-t border-white/5"><td className="p-3 font-semibold text-white">One-class SVM</td><td className="p-3 text-xs">Learn a boundary around normal data</td><td className="p-3 text-xs text-gray-400">Small, clean training sets of normal data only</td></tr>
              <tr className="border-t border-white/5"><td className="p-3 font-semibold text-white">Autoencoder</td><td className="p-3 text-xs">Train to reconstruct normal data; high reconstruction error = anomaly</td><td className="p-3 text-xs text-gray-400">Images, sensor signals, high-dimensional data</td></tr>
              <tr className="border-t border-white/5"><td className="p-3 font-semibold text-white">Forecast residuals</td><td className="p-3 text-xs">Predict the next value; flag large errors</td><td className="p-3 text-xs text-gray-400">Time series with trend and seasonality — see <a href="#/ml/time-series" className="text-blue-400 hover:underline">Time Series</a></td></tr>
              <tr className="border-t border-white/5"><td className="p-3 font-semibold text-white">Supervised classifier</td><td className="p-3 text-xs">Train on labelled fraud / not-fraud</td><td className="p-3 text-xs text-gray-400">When you have enough labelled anomalies — treat as imbalanced classification</td></tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="evaluation" title="Evaluating Without Labels">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Label a sample" tone="indigo"><p>Have experts review the top-ranked alerts and a random sample of the rest. Precision@k on the top of the list is what the operations team actually experiences.</p></Card>
          <Card title="Inject known anomalies" tone="amber"><p>Plant synthetic faults — as the lab above does — and measure how many are caught. Useful, but real anomalies are rarely as tidy.</p></Card>
          <Card title="Use PR, not ROC" tone="rose"><p>Anomalies are rare by definition, so ROC-AUC flatters. See <a href="#/ml/evaluation-metrics" className="text-blue-400 hover:underline">Evaluation Metrics</a>.</p></Card>
        </div>
      </Section>

      <Section id="production" title="In Production">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Alert fatigue" tone="rose"><p>A detector that raises 500 alerts a day gets ignored. Tune the threshold to what reviewers can handle, and rank alerts by score.</p></Card>
          <Card title="Normal drifts" tone="amber"><p>Traffic grows, seasons change, products launch. Retrain on recent data and watch the alert rate itself for drift.</p></Card>
          <Card title="Explain the alert" tone="indigo"><p>Show which features made the point unusual; an unexplained score is hard to act on.</p></Card>
          <Card title="Close the loop" tone="emerald"><p>Record reviewers' verdicts. Over time they become labels for a supervised model.</p></Card>
        </div>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`from sklearn.ensemble import IsolationForest
from sklearn.neighbors import LocalOutlierFactor

iso = IsolationForest(n_estimators=200, contamination=0.01, random_state=0).fit(X_train)
scores = -iso.score_samples(X_new)          # higher = more anomalous
flags  = iso.predict(X_new) == -1           # top 1% by the contamination setting

# LOF for novelty detection on new data
lof = LocalOutlierFactor(n_neighbors=20, novelty=True).fit(X_train)
lof_scores = -lof.score_samples(X_new)

# Review the most anomalous first
top = scores.argsort()[::-1][:50]`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("ml-anomaly")} />
    </GuideLayout>
  );
}

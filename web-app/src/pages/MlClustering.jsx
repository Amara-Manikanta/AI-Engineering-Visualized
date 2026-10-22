import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section, Segmented, Button } from "../components/VizKit";
import { rng, randn, fmt } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "clustering", "k-means", "kmeans", "k-means++", "centroid", "inertia", "elbow method", "silhouette score",
  "DBSCAN", "density-based clustering", "eps", "min_samples", "noise points", "HDBSCAN", "hierarchical clustering",
  "agglomerative clustering", "dendrogram", "linkage", "Gaussian mixture model", "GMM", "soft clustering",
  "customer segmentation", "unsupervised learning",
];

const PALETTE = ["#818cf8", "#34d399", "#fbbf24", "#fb7185", "#60a5fa", "#a78bfa", "#2dd4bf", "#f472b6"];
const NOISE = "#4b5563";

/* ------------------------------------------------------------------ data */

const BLOBS = (() => {
  const r = rng(21);
  const centres = [
    [0.25, 0.3],
    [0.72, 0.25],
    [0.6, 0.72],
    [0.22, 0.75],
  ];
  const pts = [];
  centres.forEach(([cx, cy], c) => {
    for (let i = 0; i < 40; i++) pts.push({ x: cx + randn(r) * 0.07, y: cy + randn(r) * 0.07, truth: c });
  });
  return pts;
})();

const MOONS = (() => {
  const r = rng(8);
  const pts = [];
  for (let i = 0; i < 90; i++) {
    const a = Math.PI * r();
    pts.push({ x: 0.35 + 0.25 * Math.cos(a) + randn(r) * 0.018, y: 0.42 - 0.25 * Math.sin(a) + randn(r) * 0.018 });
    const b = Math.PI * r();
    pts.push({ x: 0.6 - 0.25 * Math.cos(b) + randn(r) * 0.018, y: 0.52 + 0.25 * Math.sin(b) + randn(r) * 0.018 });
  }
  for (let i = 0; i < 10; i++) pts.push({ x: r(), y: r() }); // scattered noise
  return pts;
})();

const d2 = (a, b) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;

/* ---------------------------------------------------------------- k-means */

function initPlusPlus(pts, k, seed) {
  const r = rng(seed);
  const cs = [{ ...pts[Math.floor(r() * pts.length)] }];
  while (cs.length < k) {
    const dist = pts.map((p) => Math.min(...cs.map((c) => d2(p, c))));
    const total = dist.reduce((a, b) => a + b, 0);
    let u = r() * total;
    let i = 0;
    while (u > dist[i] && i < pts.length - 1) u -= dist[i++];
    cs.push({ x: pts[i].x, y: pts[i].y });
  }
  return cs;
}

const assign = (pts, cs) =>
  pts.map((p) => {
    let best = 0;
    for (let j = 1; j < cs.length; j++) if (d2(p, cs[j]) < d2(p, cs[best])) best = j;
    return best;
  });

function update(pts, labels, cs) {
  return cs.map((c, j) => {
    const mine = pts.filter((_, i) => labels[i] === j);
    if (!mine.length) return c;
    return { x: mine.reduce((s, p) => s + p.x, 0) / mine.length, y: mine.reduce((s, p) => s + p.y, 0) / mine.length };
  });
}

function kmeans(pts, k, seed = 1) {
  let cs = initPlusPlus(pts, k, seed);
  let labels = assign(pts, cs);
  for (let it = 0; it < 50; it++) {
    const next = update(pts, labels, cs);
    const nl = assign(pts, next);
    cs = next;
    if (nl.every((l, i) => l === labels[i])) break;
    labels = nl;
  }
  return { cs, labels, inertia: pts.reduce((s, p, i) => s + d2(p, cs[labels[i]]), 0) };
}

function silhouette(pts, labels, k) {
  if (k < 2) return NaN;
  let total = 0;
  pts.forEach((p, i) => {
    const sums = new Array(k).fill(0);
    const counts = new Array(k).fill(0);
    pts.forEach((q, j) => {
      if (i === j) return;
      sums[labels[j]] += Math.sqrt(d2(p, q));
      counts[labels[j]]++;
    });
    const own = labels[i];
    const a = counts[own] ? sums[own] / counts[own] : 0;
    let b = Infinity;
    for (let c = 0; c < k; c++) if (c !== own && counts[c]) b = Math.min(b, sums[c] / counts[c]);
    total += counts[own] ? (b - a) / Math.max(a, b) : 0;
  });
  return total / pts.length;
}

const ELBOW = Array.from({ length: 8 }, (_, i) => {
  const k = i + 1;
  const res = kmeans(BLOBS, k, 3);
  return { k, inertia: res.inertia, sil: silhouette(BLOBS, res.labels, k) };
});

function Plot({ pts, colours, centroids = [], lines = [], size = 300 }) {
  const s = (v) => 8 + v * (size - 16);
  return (
    <svg viewBox={`0 0 ${size} ${size}`} className="w-full h-auto block rounded-lg bg-black/30 border border-white/10">
      {lines.map(([a, b], i) => (
        <line key={`l${i}`} x1={s(a.x)} y1={s(a.y)} x2={s(b.x)} y2={s(b.y)} stroke={b.col} strokeOpacity="0.25" />
      ))}
      {pts.map((p, i) => (
        <circle key={i} cx={s(p.x)} cy={s(p.y)} r="3.6" fill={colours[i]} stroke="rgba(0,0,0,0.5)" strokeWidth="0.8" />
      ))}
      {centroids.map((c, j) => (
        <g key={`c${j}`} style={{ transition: "transform 400ms" }}>
          <circle cx={s(c.x)} cy={s(c.y)} r="9" fill="none" stroke="#fff" strokeWidth="2" />
          <circle cx={s(c.x)} cy={s(c.y)} r="5" fill={PALETTE[j % PALETTE.length]} stroke="#000" />
        </g>
      ))}
    </svg>
  );
}

function KMeansLab() {
  const [k, setK] = useState(4);
  const [seed, setSeed] = useState(2);
  const [state, setState] = useState(() => ({ cs: initPlusPlus(BLOBS, 4, 2), labels: null, phase: "assign", iter: 0 }));

  const reset = (nk = k, ns = seed) => setState({ cs: initPlusPlus(BLOBS, nk, ns), labels: null, phase: "assign", iter: 0 });

  const step = () =>
    setState((st) => {
      if (st.phase === "assign") return { ...st, labels: assign(BLOBS, st.cs), phase: "update" };
      const cs = update(BLOBS, st.labels, st.cs);
      return { cs, labels: st.labels, phase: "assign", iter: st.iter + 1 };
    });

  const converged = state.labels && state.phase === "assign" && assign(BLOBS, state.cs).every((l, i) => l === state.labels[i]);
  const colours = BLOBS.map((_, i) => (state.labels ? PALETTE[state.labels[i] % PALETTE.length] : "#9ca3af"));
  const lines = state.labels ? BLOBS.map((p, i) => [p, { ...state.cs[state.labels[i]], col: PALETTE[state.labels[i] % PALETTE.length] }]) : [];
  const inertia = state.labels ? BLOBS.reduce((s, p, i) => s + d2(p, state.cs[state.labels[i]]), 0) : NaN;

  return (
    <Panel tone="indigo" title="Step through k-means: assign, then move the centroids">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_260px] gap-5">
        <Plot pts={BLOBS} colours={colours} centroids={state.cs} lines={lines} />
        <div className="space-y-3">
          <Slider label="k (clusters)" value={k} min={2} max={8} onChange={(v) => { setK(v); reset(v, seed); }} />
          <div className="flex flex-wrap gap-2">
            <Button onClick={step} disabled={converged}>{state.phase === "assign" ? "① Assign points" : "② Move centroids"}</Button>
            <Button tone="purple" onClick={() => { const ns = seed + 1; setSeed(ns); reset(k, ns); }}>New start</Button>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Iteration" value={state.iter} />
            <Metric label="Inertia" value={Number.isFinite(inertia) ? fmt(inertia, 3) : "—"} tone="indigo" sub="Σ squared distance to centroid" />
          </div>
          {converged && <div className="text-xs text-emerald-300">Converged — no point changes cluster.</div>}
          <p className="text-xs text-gray-500 leading-relaxed m-0">
            Assignment sends each point to its nearest centroid; the update moves each centroid to the mean of its
            points. Each step can only lower inertia, so it always converges — but to a local optimum that depends
            on the start. Try k = 3 or 5, or press "New start".
          </p>
        </div>
      </div>
    </Panel>
  );
}

function ElbowChart() {
  const W = 320;
  const H = 150;
  const maxI = ELBOW[0].inertia;
  const x = (k) => 28 + ((k - 1) / 7) * (W - 40);
  const yI = (v) => 12 + (1 - v / maxI) * (H - 36);
  const yS = (v) => 12 + (1 - v) * (H - 36);
  const best = ELBOW.filter((e) => Number.isFinite(e.sil)).reduce((a, b) => (b.sil > a.sil ? b : a));
  return (
    <Panel tone="amber" title="Choosing k: elbow and silhouette">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block max-w-lg">
        <path d={ELBOW.map((e, i) => `${i ? "L" : "M"}${x(e.k)},${yI(e.inertia)}`).join("")} fill="none" stroke="#fbbf24" strokeWidth="2" />
        <path d={ELBOW.filter((e) => e.k > 1).map((e, i) => `${i ? "L" : "M"}${x(e.k)},${yS(e.sil)}`).join("")} fill="none" stroke="#34d399" strokeWidth="2" />
        {ELBOW.map((e) => (
          <g key={e.k}>
            <circle cx={x(e.k)} cy={yI(e.inertia)} r="3" fill="#fbbf24" />
            {e.k > 1 && <circle cx={x(e.k)} cy={yS(e.sil)} r={e.k === best.k ? 5 : 3} fill="#34d399" />}
            <text x={x(e.k)} y={H - 6} fill="#6b7280" fontSize="10" textAnchor="middle">{e.k}</text>
          </g>
        ))}
        <text x={W - 8} y="16" fill="#fbbf24" fontSize="10" textAnchor="end">inertia (lower = tighter)</text>
        <text x={W - 8} y="30" fill="#34d399" fontSize="10" textAnchor="end">silhouette (higher = better separated)</text>
      </svg>
      <p className="text-xs text-gray-500 leading-relaxed mt-3 mb-0">
        Inertia always falls as k grows — with k = n it is zero — so look for the "elbow" where extra clusters stop
        buying much. The silhouette score compares each point's distance to its own cluster with the nearest other
        cluster (−1 to 1) and peaks at k = {best.k} here, matching the four blobs the data was drawn from. Real data
        is rarely this clean; treat both as hints and check whether the clusters mean something.
      </p>
    </Panel>
  );
}

/* ----------------------------------------------------------------- DBSCAN */

function dbscan(pts, eps, minPts) {
  const e2 = eps * eps;
  const labels = new Array(pts.length).fill(undefined);
  const neighbours = (i) => pts.reduce((acc, q, j) => (d2(pts[i], q) <= e2 ? (acc.push(j), acc) : acc), []);
  let c = 0;
  const core = new Array(pts.length).fill(false);
  for (let i = 0; i < pts.length; i++) {
    if (labels[i] !== undefined) continue;
    const nb = neighbours(i);
    if (nb.length < minPts) {
      labels[i] = -1;
      continue;
    }
    core[i] = true;
    labels[i] = c;
    const queue = nb.filter((j) => j !== i);
    while (queue.length) {
      const j = queue.shift();
      if (labels[j] === -1) labels[j] = c; // border point
      if (labels[j] !== undefined) continue;
      labels[j] = c;
      const nb2 = neighbours(j);
      if (nb2.length >= minPts) {
        core[j] = true;
        queue.push(...nb2);
      }
    }
    c++;
  }
  return { labels, clusters: c, core };
}

function DensityLab() {
  const [algo, setAlgo] = useState("dbscan");
  const [eps, setEps] = useState(0.08);
  const [minPts, setMinPts] = useState(5);
  const km = useMemo(() => kmeans(MOONS, 2, 4), []);
  const db = useMemo(() => dbscan(MOONS, eps, minPts), [eps, minPts]);
  const labels = algo === "dbscan" ? db.labels : km.labels;
  const colours = labels.map((l) => (l === -1 ? NOISE : PALETTE[l % PALETTE.length]));
  const noise = db.labels.filter((l) => l === -1).length;

  return (
    <Panel tone="emerald" title="Two moons: where k-means breaks and DBSCAN doesn't">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_260px] gap-5">
        <Plot pts={MOONS} colours={colours} centroids={algo === "kmeans" ? km.cs : []} />
        <div className="space-y-3">
          <Segmented
            tone="emerald"
            value={algo}
            onChange={setAlgo}
            options={[
              { v: "kmeans", label: "k-means, k = 2" },
              { v: "dbscan", label: "DBSCAN" },
            ]}
          />
          {algo === "dbscan" ? (
            <>
              <Slider tone="emerald" label="eps (neighbourhood radius)" value={eps} min={0.02} max={0.22} step={0.005} onChange={setEps} format={(v) => v.toFixed(3)} />
              <Slider tone="emerald" label="min_samples" value={minPts} min={2} max={15} onChange={setMinPts} />
              <div className="grid grid-cols-2 gap-2">
                <Metric label="Clusters found" value={db.clusters} tone="emerald" />
                <Metric label="Noise points" value={noise} sub="grey" />
              </div>
            </>
          ) : (
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              k-means assumes round clusters of similar size — each point simply goes to the nearest centre — so it
              cuts each moon in half with a straight boundary, and it has no notion of noise.
            </p>
          )}
          <p className="text-xs text-gray-500 leading-relaxed m-0">
            DBSCAN grows clusters from "core" points that have at least min_samples neighbours within eps, and labels
            anything it cannot reach as noise. It finds the number of clusters itself and follows arbitrary shapes.
            Make eps too small and the moons shatter into fragments; too large and they merge into one.
          </p>
        </div>
      </div>
    </Panel>
  );
}

const ALGOS = [
  { n: "k-means", tone: "indigo", shape: "Round, similar size", k: "You choose", noise: "No", scale: "Very large data", note: "Fast, simple default. Use k-means++ init and several restarts (n_init)." },
  { n: "DBSCAN / HDBSCAN", tone: "emerald", shape: "Any shape", k: "Found automatically", noise: "Yes", scale: "Medium to large", note: "HDBSCAN removes the single eps parameter and handles varying density." },
  { n: "Agglomerative (hierarchical)", tone: "amber", shape: "Depends on linkage", k: "Cut the dendrogram", noise: "No", scale: "Small–medium (O(n²) memory)", note: "Builds a full merge tree, so you can inspect every level of granularity." },
  { n: "Gaussian mixture (GMM)", tone: "purple", shape: "Elliptical", k: "You choose (BIC helps)", noise: "No", scale: "Medium", note: "Soft clustering: each point gets a probability per cluster." },
];

export default function MlClustering() {
  const toc = [
    { label: "What Clustering Is For", hash: "why" },
    { label: "k-means, Step by Step", hash: "kmeans" },
    { label: "Choosing k", hash: "choosing-k" },
    { label: "Density: DBSCAN", hash: "dbscan" },
    { label: "Hierarchical & GMM", hash: "others" },
    { label: "Which Algorithm?", hash: "compare" },
    { label: "Practical Pitfalls", hash: "pitfalls" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Clustering"
      intro="Finding groups in data without labels: k-means run step by step, how to pick the number of clusters, density-based DBSCAN for odd shapes and noise, and when each method fits."
      toc={toc}
    >
      <Section id="why" title="What Clustering Is For" lead="There is no right answer to check against, so clustering is a tool for exploration and structure — not a classifier in disguise.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Segmentation" tone="indigo"><p>Customers, products or documents grouped by behaviour, so each group can be treated differently.</p></Card>
          <Card title="Structure in embeddings" tone="purple"><p>Clustering <a href="#/rag/embeddings" className="text-blue-400 hover:underline">text embeddings</a> surfaces topics in support tickets or search logs — and is how some RAG systems build topic summaries.</p></Card>
          <Card title="Preprocessing & anomalies" tone="emerald"><p>Cluster IDs as features, deduplication, or points far from every cluster flagged as <a href="#/ml/anomaly-detection" className="text-blue-400 hover:underline">anomalies</a>.</p></Card>
        </div>
      </Section>

      <Section id="kmeans" title="k-means, Step by Step" lead="Four blobs of 40 points, clustered live. Each click runs one half of an iteration.">
        <KMeansLab />
      </Section>

      <Section id="choosing-k" title="Choosing k" lead="Computed by running k-means to convergence for k = 1…8 on the same data.">
        <ElbowChart />
      </Section>

      <Section id="dbscan" title="Density: DBSCAN" lead="Not every group is a round blob.">
        <DensityLab />
      </Section>

      <Section id="others" title="Hierarchical & GMM">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Agglomerative clustering" tone="amber">
            <p>Start with every point as its own cluster and repeatedly merge the closest pair. The record of merges is a dendrogram; cutting it at a height gives a flat clustering.</p>
            <p>The linkage defines "closest": <em>single</em> (nearest points — chains through bridges), <em>complete</em> (farthest points — compact groups), <em>average</em>, or <em>Ward</em> (merge that least increases variance — k-means-like).</p>
          </Card>
          <Card title="Gaussian mixture models" tone="purple">
            <p>Model the data as a mix of k Gaussians, each with its own mean and covariance, fitted with expectation–maximisation. Clusters can be stretched ellipses rather than circles.</p>
            <p>Every point gets a probability of belonging to each cluster, which is useful when groups overlap. Choose k with the BIC.</p>
          </Card>
        </div>
      </Section>

      <Section id="compare" title="Which Algorithm?">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm min-w-[640px]">
            <thead className="bg-white/5 text-gray-400 text-left">
              <tr>
                <th className="p-3 font-medium">Method</th>
                <th className="p-3 font-medium">Cluster shape</th>
                <th className="p-3 font-medium">Number of clusters</th>
                <th className="p-3 font-medium">Noise</th>
                <th className="p-3 font-medium">Scales to</th>
              </tr>
            </thead>
            <tbody>
              {ALGOS.map((a) => (
                <tr key={a.n} className="border-t border-white/5 align-top">
                  <td className="p-3">
                    <div className="text-white font-semibold">{a.n}</div>
                    <div className="text-xs text-gray-500 mt-1">{a.note}</div>
                  </td>
                  <td className="p-3 text-gray-300">{a.shape}</td>
                  <td className="p-3 text-gray-300">{a.k}</td>
                  <td className="p-3 text-gray-300">{a.noise}</td>
                  <td className="p-3 text-gray-300">{a.scale}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="pitfalls" title="Practical Pitfalls">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Scale features first" tone="rose"><p>Every method here uses distances. Unscaled, the feature with the biggest units decides the clusters on its own.</p></Card>
          <Card title="High dimensions" tone="rose"><p>Distances concentrate as dimensions grow, so clusters blur. Reduce dimensions first with <a href="#/ml/dimensionality-reduction" className="text-blue-400 hover:underline">PCA or UMAP</a>, or cluster embeddings with cosine distance.</p></Card>
          <Card title="Clusters always appear" tone="amber"><p>k-means will return k clusters from pure noise. Compare against a shuffled baseline, check stability across seeds, and ask whether the groups are actionable.</p></Card>
          <Card title="Categorical data" tone="amber"><p>Means of one-hot vectors are not meaningful. Use k-modes / k-prototypes or a suitable distance (Gower) for mixed data.</p></Card>
        </div>
        <Note tone="indigo">
          Clustering is one half of <a href="#/ml/unsupervised" className="text-blue-400 hover:underline">unsupervised learning</a>; the other half is dimensionality reduction.
        </Note>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.cluster import KMeans, DBSCAN, HDBSCAN, AgglomerativeClustering
from sklearn.mixture import GaussianMixture
from sklearn.metrics import silhouette_score

X_scaled = StandardScaler().fit_transform(X)

# k-means: scan k and keep inertia + silhouette
for k in range(2, 9):
    km = KMeans(n_clusters=k, n_init=10, random_state=0).fit(X_scaled)
    print(k, round(km.inertia_, 1), round(silhouette_score(X_scaled, km.labels_), 3))

# Density-based: label -1 means noise
labels = DBSCAN(eps=0.3, min_samples=5).fit_predict(X_scaled)
labels = HDBSCAN(min_cluster_size=15).fit_predict(X_scaled)   # no eps to tune

# Hierarchical and soft clustering
agg = AgglomerativeClustering(n_clusters=4, linkage="ward").fit(X_scaled)
gmm = GaussianMixture(n_components=4, covariance_type="full").fit(X_scaled)
probs = gmm.predict_proba(X_scaled)        # one probability per cluster
print(gmm.bic(X_scaled))                   # lower BIC = better k`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("ml-clustering")} />
    </GuideLayout>
  );
}

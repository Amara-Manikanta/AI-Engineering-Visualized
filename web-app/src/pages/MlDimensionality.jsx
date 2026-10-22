import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section, Button } from "../components/VizKit";
import { rng, randn, pct, fmt } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "dimensionality reduction", "PCA", "principal component analysis", "principal components", "eigenvectors",
  "eigenvalues", "explained variance", "scree plot", "SVD", "singular value decomposition", "truncated SVD", "LSA",
  "t-SNE", "tSNE", "UMAP", "perplexity", "manifold learning", "curse of dimensionality", "distance concentration",
  "random projection", "Johnson-Lindenstrauss", "autoencoder", "feature extraction", "whitening",
];

/* ---------------------------------------------------------------------------
   A symmetric eigen-solver (cyclic Jacobi). Small and exact enough for the
   10×10 covariance matrices on this page.
--------------------------------------------------------------------------- */

function jacobiEigen(Ain) {
  const n = Ain.length;
  const A = Ain.map((r) => [...r]);
  const V = Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)));
  for (let sweep = 0; sweep < 60; sweep++) {
    let off = 0;
    for (let i = 0; i < n; i++) for (let j = i + 1; j < n; j++) off += A[i][j] ** 2;
    if (off < 1e-14) break;
    for (let p = 0; p < n; p++)
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(A[p][q]) < 1e-15) continue;
        const theta = (A[q][q] - A[p][p]) / (2 * A[p][q]);
        const t = Math.sign(theta || 1) / (Math.abs(theta) + Math.sqrt(theta * theta + 1));
        const c = 1 / Math.sqrt(t * t + 1);
        const s = t * c;
        for (let k = 0; k < n; k++) {
          const akp = A[k][p];
          const akq = A[k][q];
          A[k][p] = c * akp - s * akq;
          A[k][q] = s * akp + c * akq;
        }
        for (let k = 0; k < n; k++) {
          const apk = A[p][k];
          const aqk = A[q][k];
          A[p][k] = c * apk - s * aqk;
          A[q][k] = s * apk + c * aqk;
        }
        for (let k = 0; k < n; k++) {
          const vkp = V[k][p];
          const vkq = V[k][q];
          V[k][p] = c * vkp - s * vkq;
          V[k][q] = s * vkp + c * vkq;
        }
      }
  }
  const vals = A.map((r, i) => r[i]);
  const order = vals.map((v, i) => i).sort((a, b) => vals[b] - vals[a]);
  return { values: order.map((i) => vals[i]), vectors: order.map((i) => V.map((row) => row[i])) };
}

function covariance(X) {
  const n = X.length;
  const d = X[0].length;
  const m = Array.from({ length: d }, (_, j) => X.reduce((s, r) => s + r[j], 0) / n);
  return Array.from({ length: d }, (_, i) => Array.from({ length: d }, (_, j) => X.reduce((s, r) => s + (r[i] - m[i]) * (r[j] - m[j]), 0) / (n - 1)));
}

/* ------------------------------------------------------------ 2-D PCA lab */

const CLOUD = (() => {
  const r = rng(17);
  return Array.from({ length: 70 }, () => {
    const a = randn(r) * 1.0;
    const b = randn(r) * 0.32;
    // rotate by 30° so the main axis is diagonal
    const c = Math.cos(Math.PI / 6);
    const s = Math.sin(Math.PI / 6);
    return [a * c - b * s, a * s + b * c];
  });
})();

const CLOUD_EIG = jacobiEigen(covariance(CLOUD));
const CLOUD_MEAN = [0, 1].map((j) => CLOUD.reduce((s, p) => s + p[j], 0) / CLOUD.length);

function PcaLab() {
  const pc1 = CLOUD_EIG.vectors[0];
  const bestAngle = Math.round(((Math.atan2(pc1[1], pc1[0]) * 180) / Math.PI + 180) % 180);
  const [angle, setAngle] = useState(120);
  const rad = (angle * Math.PI) / 180;
  const u = [Math.cos(rad), Math.sin(rad)];
  const proj = CLOUD.map((p) => (p[0] - CLOUD_MEAN[0]) * u[0] + (p[1] - CLOUD_MEAN[1]) * u[1]);
  const varAlong = proj.reduce((s, v) => s + v * v, 0) / (proj.length - 1);
  const total = CLOUD_EIG.values[0] + CLOUD_EIG.values[1];
  const captured = varAlong / total;

  const S = 300;
  const sc = (v) => S / 2 + v * 50;
  const scy = (v) => S / 2 - v * 50;

  return (
    <Panel tone="indigo" title="Rotate the axis. PCA picks the one that keeps the most spread.">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_260px] gap-5">
        <svg viewBox={`0 0 ${S} ${S}`} className="w-full max-w-md h-auto block rounded-lg bg-black/30 border border-white/10">
          <line x1={sc(CLOUD_MEAN[0] - u[0] * 3)} y1={scy(CLOUD_MEAN[1] - u[1] * 3)} x2={sc(CLOUD_MEAN[0] + u[0] * 3)} y2={scy(CLOUD_MEAN[1] + u[1] * 3)} stroke="#818cf8" strokeWidth="2" />
          {CLOUD.map((p, i) => {
            const qx = CLOUD_MEAN[0] + proj[i] * u[0];
            const qy = CLOUD_MEAN[1] + proj[i] * u[1];
            return (
              <g key={i}>
                <line x1={sc(p[0])} y1={scy(p[1])} x2={sc(qx)} y2={scy(qy)} stroke="rgba(251,113,133,0.35)" />
                <circle cx={sc(qx)} cy={scy(qy)} r="2.4" fill="#a5b4fc" />
                <circle cx={sc(p[0])} cy={scy(p[1])} r="3.4" fill="#fbbf24" stroke="rgba(0,0,0,0.5)" />
              </g>
            );
          })}
        </svg>
        <div className="space-y-3">
          <Slider label="Projection axis angle" value={angle} min={0} max={179} onChange={setAngle} format={(v) => `${v}°`} />
          <Button onClick={() => setAngle(bestAngle)}>Snap to PC1</Button>
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Variance kept" value={pct(captured, 0)} tone="indigo" />
            <Metric label="Lost (red lines)" value={pct(1 - captured, 0)} tone="rose" />
          </div>
          <p className="text-xs text-gray-500 leading-relaxed m-0">
            Each yellow point is projected onto the blue line. The variance of the projections is what survives;
            the red residuals are what is thrown away. Maximising one is the same as minimising the other, and the
            winning direction is the top eigenvector of the covariance matrix — here at {bestAngle}°, keeping{" "}
            {pct(CLOUD_EIG.values[0] / total, 0)}.
          </p>
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------------ scree on 10-D data */

const TEN_D = (() => {
  const r = rng(29);
  // 3 hidden factors drive 10 observed features, plus a little independent noise
  const load = Array.from({ length: 10 }, () => [randn(r), randn(r) * 0.85, randn(r) * 0.7]);
  return Array.from({ length: 200 }, () => {
    const f = [randn(r), randn(r), randn(r)];
    return load.map((l) => l[0] * f[0] + l[1] * f[1] + l[2] * f[2] + randn(r) * 0.3);
  });
})();

function ScreeLab() {
  const eig = useMemo(() => jacobiEigen(covariance(TEN_D)), []);
  const [k, setK] = useState(2);
  const total = eig.values.reduce((a, b) => a + b, 0);
  const ratios = eig.values.map((v) => v / total);
  const cum = ratios.reduce((acc, v, i) => (acc.push((acc[i - 1] || 0) + v), acc), []);
  const W = 340;
  const H = 170;
  const bw = (W - 40) / 10;
  const y = (v) => H - 22 - v * (H - 40);

  return (
    <Panel tone="purple" title="Ten features, three real signals: the scree plot">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_240px] gap-5">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          {ratios.map((r, i) => (
            <g key={i}>
              <rect x={30 + i * bw + 3} y={y(r)} width={bw - 6} height={H - 22 - y(r)} rx="2" fill={i < k ? "#a78bfa" : "rgba(167,139,250,0.25)"} />
              <text x={30 + i * bw + bw / 2} y={H - 8} fill="#6b7280" fontSize="10" textAnchor="middle">PC{i + 1}</text>
            </g>
          ))}
          <path d={cum.map((c, i) => `${i ? "L" : "M"}${30 + i * bw + bw / 2},${y(c)}`).join("")} fill="none" stroke="#fbbf24" strokeWidth="2" />
          {cum.map((c, i) => (
            <circle key={i} cx={30 + i * bw + bw / 2} cy={y(c)} r="2.5" fill="#fbbf24" />
          ))}
          <text x={W - 6} y="14" fill="#fbbf24" fontSize="10" textAnchor="end">cumulative</text>
        </svg>
        <div className="space-y-3">
          <Slider tone="purple" label="Components kept" value={k} min={1} max={10} onChange={setK} />
          <Metric label={`Variance explained by ${k}`} value={pct(cum[k - 1])} tone="purple" sub={`from 10 dimensions down to ${k}`} />
          <p className="text-xs text-gray-500 leading-relaxed m-0">
            The data was generated from three hidden factors plus noise, and the eigenvalues show it: two large
            bars, a smaller third that is still several times the noise level, then a flat tail. Keeping 3
            components retains about {pct(cum[2], 0)} of the variance.
            A common rule is to keep enough components for 90–95%, or cut where the curve flattens.
          </p>
        </div>
      </div>
    </Panel>
  );
}

/* ------------------------------------------------ curse of dimensionality */

const CONCENTRATION = (() => {
  const r = rng(3);
  return [2, 5, 10, 20, 50, 100, 300, 1000].map((d) => {
    const pts = Array.from({ length: 150 }, () => Array.from({ length: d }, () => r()));
    const q = Array.from({ length: d }, () => r());
    const dists = pts.map((p) => Math.sqrt(p.reduce((s, v, i) => s + (v - q[i]) ** 2, 0)));
    const mn = Math.min(...dists);
    const mx = Math.max(...dists);
    return { d, contrast: (mx - mn) / mn, mn, mx };
  });
})();

function CurseLab() {
  const [i, setI] = useState(0);
  const c = CONCENTRATION[i];
  const W = 340;
  const H = 60;
  const x = (v) => 10 + (v / c.mx) * (W - 20);
  return (
    <Panel tone="rose" title="In high dimensions, the nearest and farthest points are almost equally far">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_240px] gap-5 items-center">
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
            <line x1="10" y1="30" x2={W - 10} y2="30" stroke="rgba(255,255,255,0.15)" />
            <rect x={x(c.mn)} y="18" width={Math.max(2, x(c.mx) - x(c.mn))} height="24" rx="4" fill="rgba(251,113,133,0.3)" stroke="#fb7185" />
            <text x="10" y="56" fill="#6b7280" fontSize="10">0</text>
            <text x={x(c.mn)} y="12" fill="#fb7185" fontSize="10" textAnchor="middle">nearest</text>
            <text x={x(c.mx)} y="12" fill="#fb7185" fontSize="10" textAnchor="end">farthest</text>
          </svg>
          <p className="text-[0.6875rem] text-gray-500 mt-1 mb-0">Distances from one random query to 150 random points in the unit hypercube.</p>
        </div>
        <div className="space-y-3">
          <Slider tone="rose" label="Dimensions" value={i} min={0} max={CONCENTRATION.length - 1} onChange={setI} format={(v) => CONCENTRATION[v].d} />
          <Metric label="(farthest − nearest) / nearest" value={fmt(c.contrast, 2)} tone="rose" sub="relative contrast" />
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        In 2-D the farthest point is many times farther than the nearest. By 1,000 dimensions the whole range is a
        thin band: "nearest neighbour" barely means anything for random data. Real data escapes this because it lies
        near a much lower-dimensional structure — which is exactly what dimensionality reduction (and learned
        embeddings) exploit.
      </p>
    </Panel>
  );
}

export default function MlDimensionality() {
  const toc = [
    { label: "Why Reduce Dimensions", hash: "why" },
    { label: "PCA, Geometrically", hash: "pca" },
    { label: "How Many Components", hash: "scree" },
    { label: "The Curse of Dimensionality", hash: "curse" },
    { label: "t-SNE & UMAP", hash: "manifold" },
    { label: "Other Methods", hash: "others" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Dimensionality Reduction"
      intro="Compressing many features into a few that keep what matters: PCA from the geometry up, choosing how many components to keep, why high dimensions misbehave, and t-SNE and UMAP for visualisation."
      toc={toc}
    >
      <Section id="why" title="Why Reduce Dimensions" lead="Hundreds of features are often driven by a handful of underlying factors. Finding those factors helps almost everything downstream.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="See the data" tone="indigo"><p>Project to 2-D or 3-D to look for clusters, outliers and labelling problems.</p></Card>
          <Card title="Faster, leaner models" tone="emerald"><p>Fewer inputs train faster and need less memory — including smaller vectors in a vector database.</p></Card>
          <Card title="Less noise & collinearity" tone="amber"><p>Dropping low-variance directions removes noise and decorrelates features that confuse linear models.</p></Card>
          <Card title="Beat the curse" tone="rose"><p>Distance-based methods like KNN and clustering work better in a compact space.</p></Card>
        </div>
      </Section>

      <Section id="pca" title="PCA, Geometrically" lead="Principal component analysis finds orthogonal directions of maximum variance. Project onto the first few and you keep as much of the spread as any linear map can.">
        <PcaLab />
        <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-xs sm:text-sm text-gray-200 space-y-1 mt-5 overflow-x-auto">
          <div>1. centre the data (subtract each feature's mean; usually also scale to unit variance)</div>
          <div>2. covariance C = XᵀX / (n − 1)</div>
          <div>3. eigen-decompose C → directions (eigenvectors) and their variances (eigenvalues)</div>
          <div>4. keep the top k eigenvectors W; the reduced data is Z = X W</div>
          <div className="text-gray-500">in practice libraries use the SVD of X directly — same answer, more stable</div>
        </div>
      </Section>

      <Section id="scree" title="How Many Components" lead="Eigenvalues computed in your browser from 200 samples of 10-dimensional data.">
        <ScreeLab />
      </Section>

      <Section id="curse" title="The Curse of Dimensionality">
        <CurseLab />
      </Section>

      <Section id="manifold" title="t-SNE & UMAP" lead="Non-linear methods for visualisation. They keep neighbours together, at the cost of distorting almost everything else.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <Card title="t-SNE" tone="purple">
            <p>Turns distances into neighbour probabilities in the original space and in 2-D, then moves the 2-D points until the two match. Perplexity (≈ 5–50) sets roughly how many neighbours each point cares about.</p>
            <p>Slow on large data and stochastic — different runs give different pictures.</p>
          </Card>
          <Card title="UMAP" tone="indigo">
            <p>Builds a neighbour graph and lays it out in low dimensions. Much faster than t-SNE, scales to millions of points, keeps somewhat more global structure, and can transform new data.</p>
            <p>Main knobs: <span className="font-mono">n_neighbors</span> (local vs global) and <span className="font-mono">min_dist</span> (how tightly points pack).</p>
          </Card>
        </div>
        <Note tone="rose">
          Read t-SNE and UMAP plots with care: cluster sizes and the gaps between clusters are not meaningful, and
          apparent clusters can appear in random data at low perplexity. Use them to look, not as features for a
          model — PCA is the safe choice for that.
        </Note>
      </Section>

      <Section id="others" title="Other Methods">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card title="Truncated SVD / LSA" tone="amber"><p>PCA without centring, so it works on huge sparse matrices such as TF-IDF text features. Applied to text it is called latent semantic analysis.</p></Card>
          <Card title="Random projection" tone="blue"><p>Multiply by a random matrix. The Johnson–Lindenstrauss lemma guarantees pairwise distances are roughly preserved — surprisingly effective and very cheap.</p></Card>
          <Card title="Autoencoders" tone="emerald"><p>A neural network squeezes the input through a narrow bottleneck and reconstructs it. The bottleneck is a learned non-linear compression.</p></Card>
          <Card title="Feature selection" tone="indigo"><p>Keep a subset of the original columns (lasso, importance scores). Less compression than extraction, but the features stay interpretable.</p></Card>
          <Card title="Matryoshka embeddings" tone="purple"><p>Embedding models trained so a prefix of the vector is itself a good embedding — dimensionality reduction by truncation. See <a href="#/rag/late-interaction" className="text-blue-400 hover:underline">Late Interaction &amp; Matryoshka</a>.</p></Card>
          <Card title="LDA (linear discriminant)" tone="rose"><p>Supervised: finds directions that best separate labelled classes, rather than directions of most variance.</p></Card>
        </div>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.decomposition import PCA, TruncatedSVD
import umap   # pip install umap-learn

# Keep enough components for 95% of the variance
pca = make_pipeline(StandardScaler(), PCA(n_components=0.95))
Z = pca.fit_transform(X)
print(Z.shape, pca[-1].explained_variance_ratio_.cumsum()[-1])

# Sparse text features: SVD without centring (LSA)
Z_text = TruncatedSVD(n_components=100).fit_transform(tfidf_matrix)

# 2-D picture of embeddings — for looking, not for modelling
xy = umap.UMAP(n_neighbors=15, min_dist=0.1, metric="cosine").fit_transform(embeddings)`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("ml-dimensionality")} />
    </GuideLayout>
  );
}

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { staggerChildren: 0.1 } },
};
const itemVariants = {
  hidden: { opacity: 0, y: 20 },
  visible: { opacity: 1, y: 0 },
};

/* ---------------------------------------------------------------------------
   k-Means clustering visual — toggle between "raw points" and "clustered"
--------------------------------------------------------------------------- */

// Three latent groups of points (x, y in a 0–100 space) + which cluster they belong to.
const POINTS = [
  // cluster 0 (top-left)
  ...[[18, 22], [24, 30], [14, 34], [28, 20], [20, 40], [12, 26], [30, 36]].map((p) => [...p, 0]),
  // cluster 1 (right)
  ...[[74, 30], [82, 40], [78, 22], [86, 34], [72, 44], [88, 26], [80, 50]].map((p) => [...p, 1]),
  // cluster 2 (bottom-center)
  ...[[44, 74], [52, 82], [40, 80], [56, 70], [48, 88], [60, 78], [46, 66]].map((p) => [...p, 2]),
];
const CENTROIDS = [
  [20.9, 29.7, 0],
  [80, 35.1, 1],
  [49.4, 76.9, 2],
];
const CLUSTER_COLORS = ['#818cf8', '#34d399', '#f472b6'];

function ClusteringVisual() {
  const [clustered, setClustered] = useState(false);

  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-4">
        <div>
          <div className="text-sm font-semibold text-white">k-Means clustering</div>
          <div className="text-xs text-gray-500">
            No labels are given — the algorithm finds the groups itself.
          </div>
        </div>
        <button
          onClick={() => setClustered((c) => !c)}
          className={`px-4 py-2 rounded-lg text-sm font-medium border transition-colors ${
            clustered
              ? 'bg-white/5 border-white/15 text-gray-300 hover:border-white/30'
              : 'bg-indigo-600 border-indigo-500 text-white hover:bg-indigo-500'
          }`}
        >
          {clustered ? '↺ Show raw data' : '▶ Run clustering'}
        </button>
      </div>

      <svg viewBox="0 0 100 100" className="w-full max-w-md mx-auto block" style={{ aspectRatio: '1' }}>
        {/* grid */}
        {[25, 50, 75].map((g) => (
          <g key={g}>
            <line x1={g} y1="4" x2={g} y2="96" stroke="rgba(255,255,255,0.05)" strokeWidth="0.4" />
            <line x1="4" y1={g} x2="96" y2={g} stroke="rgba(255,255,255,0.05)" strokeWidth="0.4" />
          </g>
        ))}

        {/* centroids (only once clustered) */}
        {clustered &&
          CENTROIDS.map(([cx, cy, c]) => (
            <motion.g key={`cent-${c}`} initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.3 }}>
              <circle cx={cx} cy={cy} r="9" fill={CLUSTER_COLORS[c]} opacity="0.12" />
              <path
                d={`M ${cx - 2.5} ${cy} L ${cx + 2.5} ${cy} M ${cx} ${cy - 2.5} L ${cx} ${cy + 2.5}`}
                stroke={CLUSTER_COLORS[c]}
                strokeWidth="1"
                strokeLinecap="round"
              />
            </motion.g>
          ))}

        {/* points — fill is bound directly to state (with a CSS transition) so
            the colour is always correct even if JS animation is throttled */}
        {POINTS.map(([x, y, c], i) => (
          <circle
            key={i}
            cx={x}
            cy={y}
            r="2.4"
            fill={clustered ? CLUSTER_COLORS[c] : '#6b7280'}
            style={{ transition: `fill 0.4s ease ${clustered ? (i % 7) * 0.05 : 0}s` }}
          />
        ))}
      </svg>

      <p className="text-[0.6875rem] text-gray-500 mt-3 leading-relaxed mb-0 text-center">
        {clustered
          ? 'Each point is assigned to its nearest centroid (✛). The centroids are the mean of their members.'
          : 'The model sees only grey dots — no categories, no answers. Press run to let it discover the structure.'}
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Dimensionality-reduction visual: many features → 2 components
--------------------------------------------------------------------------- */

function DimReductionVisual() {
  const features = ['age', 'income', 'clicks', 'visits', 'tenure', 'spend', 'returns', 'reviews'];
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
      <div className="flex items-center justify-center gap-4 sm:gap-8">
        <div className="flex flex-col gap-1.5">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1 text-center">8 features</div>
          {features.map((f, i) => (
            <motion.div
              key={f}
              initial={{ opacity: 0, x: -8 }}
              whileInView={{ opacity: 1, x: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.05 }}
              className="px-2.5 py-1 rounded bg-white/5 border border-white/10 text-[0.625rem] font-mono text-gray-400 text-center w-24"
            >
              {f}
            </motion.div>
          ))}
        </div>

        <div className="flex flex-col items-center text-gray-500 shrink-0">
          <span className="text-[0.625rem] whitespace-nowrap mb-1">PCA</span>
          <span className="text-2xl">→</span>
          <span className="text-[0.625rem] whitespace-nowrap mt-1">compress</span>
        </div>

        <div className="flex flex-col gap-2">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1 text-center">2 components</div>
          {['PC1', 'PC2'].map((f, i) => (
            <motion.div
              key={f}
              initial={{ opacity: 0, scale: 0.8 }}
              whileInView={{ opacity: 1, scale: 1 }}
              viewport={{ once: true }}
              transition={{ delay: 0.5 + i * 0.15 }}
              className="px-3 py-3 rounded-lg bg-indigo-500/15 border border-indigo-500/40 text-xs font-mono text-indigo-200 text-center w-24"
            >
              {f}
            </motion.div>
          ))}
        </div>
      </div>
      <p className="text-[0.6875rem] text-gray-500 mt-4 leading-relaxed mb-0 text-center max-w-md mx-auto">
        Each new component is a weighted blend of the originals, chosen to capture as much variance as possible. You
        keep ~90% of the information in a fraction of the dimensions — enough to plot, and faster to compute on.
      </p>
    </div>
  );
}

const ALGOS = [
  {
    name: 'k-Means',
    kind: 'Clustering',
    idea: 'Pick k centroids, assign each point to the nearest, move centroids to the mean, repeat.',
    pro: 'Fast and simple; scales to huge datasets.',
    con: 'You must choose k upfront; assumes round, evenly-sized clusters.',
  },
  {
    name: 'Hierarchical',
    kind: 'Clustering',
    idea: 'Repeatedly merge the two closest points/clusters, building a tree (dendrogram).',
    pro: 'No need to pick k in advance; the tree shows structure at every scale.',
    con: 'Slow on large data (O(n²) or worse).',
  },
  {
    name: 'DBSCAN',
    kind: 'Clustering',
    idea: 'Grow clusters from dense regions; points in sparse areas are labelled noise.',
    pro: 'Finds arbitrary shapes and detects outliers automatically.',
    con: 'Sensitive to its density parameters (eps, minPts).',
  },
  {
    name: 'PCA',
    kind: 'Dim. Reduction',
    idea: 'Rotate the data onto axes of maximum variance; keep the top few.',
    pro: 'Fast, deterministic, great for preprocessing and compression.',
    con: 'Linear only; components can be hard to interpret.',
  },
  {
    name: 't-SNE / UMAP',
    kind: 'Dim. Reduction',
    idea: 'Place points in 2D so that local neighbourhoods are preserved.',
    pro: 'Excellent for visualising clusters in high-dim data.',
    con: 'Slow; distances between far-apart clusters are not meaningful.',
  },
];

const toc = [
  { label: 'What "Unsupervised" Means', hash: '#what' },
  { label: 'Clustering', hash: '#clustering' },
  { label: 'Dimensionality Reduction', hash: '#dim-reduction' },
  { label: 'Algorithm Cheat Sheet', hash: '#algorithms' },
  { label: 'Common Applications', hash: '#common-applications' },
  { label: 'Supervised vs Unsupervised', hash: '#vs-supervised' },
];

export default function MlUnsupervised() {
  return (
    <GuideLayout
      title="Unsupervised Learning"
      intro="Models trained on unlabeled data, designed to infer natural structure and hidden patterns without being told the answers."
      toc={toc}
    >
      <motion.div variants={containerVariants} initial="hidden" animate="visible" className="space-y-16">
        {/* ---------------------------------------------------------------- */}
        <motion.section variants={itemVariants} id="what" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">What "Unsupervised" Means</h2>
          <p className="text-gray-300 leading-relaxed mb-6 max-w-3xl">
            In supervised learning you hand the model labelled examples — this email is spam, that house sold for
            $400k — and it learns the mapping. Unsupervised learning removes the labels entirely. The model is given
            only the raw data and asked a different question: <strong className="text-white">what structure is
            already in here?</strong> No answer key exists, so success is about revealing patterns a human can act on,
            not hitting a known target.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { icon: '🏷️', t: 'No labels', d: 'The data has features but no target column. Nothing tells the model what "right" looks like.' },
              { icon: '🧭', t: 'Finds structure', d: 'It groups similar things, compresses redundant features, or flags what does not fit.' },
              { icon: '🔍', t: 'Exploratory', d: 'Often the first pass on new data — to understand it before you model anything else.' },
            ].map((c) => (
              <div key={c.t} className="p-5 rounded-xl border border-white/10 bg-white/5">
                <div className="text-2xl mb-2">{c.icon}</div>
                <div className="font-semibold text-white text-sm mb-1">{c.t}</div>
                <p className="text-xs text-gray-400 leading-relaxed m-0">{c.d}</p>
              </div>
            ))}
          </div>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section variants={itemVariants} id="clustering" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Clustering</h2>
          <p className="text-gray-300 leading-relaxed mb-6 max-w-3xl">
            Clustering groups data points so that members of a group are more similar to each other than to points in
            other groups. The catch: nobody defines the groups beforehand — the algorithm proposes them. Below, the
            model sees only grey dots; press run to watch <strong className="text-white">k-Means</strong> discover three
            clusters and their centres.
          </p>
          <ClusteringVisual />

          <div className="mt-6 grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="p-5 rounded-xl border border-white/10 bg-white/5">
              <div className="font-semibold text-white text-sm mb-2">How k-Means iterates</div>
              <ol className="text-xs text-gray-400 leading-relaxed space-y-1.5 list-decimal pl-4">
                <li>Drop <em>k</em> centroids at random positions.</li>
                <li>Assign every point to its nearest centroid.</li>
                <li>Move each centroid to the mean of its assigned points.</li>
                <li>Repeat 2–3 until the assignments stop changing.</li>
              </ol>
            </div>
            <div className="p-5 rounded-xl border border-amber-500/25 bg-amber-500/10">
              <div className="font-semibold text-amber-300 text-sm mb-2">Choosing k</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">
                k-Means needs you to pick the number of clusters in advance. The <strong>elbow method</strong> (plot
                error vs k and look for the bend) and the <strong>silhouette score</strong> help, but there is often no
                single correct k — it depends on what you intend to do with the groups.
              </p>
            </div>
          </div>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section variants={itemVariants} id="dim-reduction" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Dimensionality Reduction</h2>
          <p className="text-gray-300 leading-relaxed mb-6 max-w-3xl">
            Real datasets often have hundreds of features, most of them correlated or noisy. Dimensionality reduction
            compresses them into a handful of new features that retain most of the information — making data possible
            to visualise, faster to train on, and less prone to the "curse of dimensionality".
          </p>
          <DimReductionVisual />
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section variants={itemVariants} id="algorithms" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Algorithm Cheat Sheet</h2>
          <div className="overflow-x-auto rounded-xl border border-white/10">
            <table className="w-full text-sm border-collapse">
              <thead>
                <tr className="bg-white/5">
                  <th className="p-3 text-left text-gray-300 border-b border-white/10 font-semibold">Algorithm</th>
                  <th className="p-3 text-left text-gray-300 border-b border-white/10 font-semibold">Core idea</th>
                  <th className="p-3 text-left text-emerald-400 border-b border-white/10 font-semibold">Strength</th>
                  <th className="p-3 text-left text-rose-400 border-b border-white/10 font-semibold">Limitation</th>
                </tr>
              </thead>
              <tbody className="text-gray-400">
                {ALGOS.map((a, i) => (
                  <tr key={a.name} className={i % 2 ? 'bg-white/[0.02]' : ''}>
                    <td className="p-3 border-b border-white/5">
                      <div className="font-semibold text-gray-200">{a.name}</div>
                      <div className="text-[0.625rem] uppercase tracking-wide text-gray-600">{a.kind}</div>
                    </td>
                    <td className="p-3 border-b border-white/5 text-xs">{a.idea}</td>
                    <td className="p-3 border-b border-white/5 text-xs">{a.pro}</td>
                    <td className="p-3 border-b border-white/5 text-xs">{a.con}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section variants={itemVariants} id="common-applications" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-6 text-gray-100">Common Applications</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {[
              { t: 'Customer Segmentation', d: 'Group customers by behaviour so marketing, pricing, and product can target each segment differently.', icon: '👥' },
              { t: 'Anomaly & Fraud Detection', d: 'Points that fit no cluster — or sit in a sparse region — are flagged as suspicious for review.', icon: '🚨' },
              { t: 'Recommendation & Market Basket', d: 'Find items frequently bought or viewed together to power "customers also bought" (e.g. Apriori).', icon: '🛒' },
              { t: 'Data Visualisation', d: 'Project high-dimensional data to 2D/3D with t-SNE or UMAP to see structure the raw table hides.', icon: '📊' },
            ].map((a) => (
              <motion.div
                key={a.t}
                whileHover={{ y: -3 }}
                className="p-5 rounded-xl border border-white/10 bg-white/5 hover:border-indigo-500/40 transition-colors"
              >
                <div className="flex items-center gap-2.5 mb-2">
                  <span className="text-xl">{a.icon}</span>
                  <h3 className="font-semibold text-white text-sm">{a.t}</h3>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed m-0">{a.d}</p>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section variants={itemVariants} id="vs-supervised" className="scroll-mt-24">
          <h2 className="text-2xl font-bold mb-4 text-gray-100">Supervised vs Unsupervised</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="p-5 rounded-xl border border-blue-500/25 bg-blue-500/10">
              <div className="text-blue-400 font-semibold mb-3">🎯 Supervised</div>
              <ul className="space-y-1.5 text-xs text-gray-300">
                <li>• Data <strong>has labels</strong> (a target to predict)</li>
                <li>• Learns an input → output mapping</li>
                <li>• Success = accuracy against known answers</li>
                <li>• Classification, regression</li>
              </ul>
            </div>
            <div className="p-5 rounded-xl border border-indigo-500/25 bg-indigo-500/10">
              <div className="text-indigo-400 font-semibold mb-3">🧭 Unsupervised</div>
              <ul className="space-y-1.5 text-xs text-gray-300">
                <li>• Data <strong>has no labels</strong></li>
                <li>• Finds structure that is already there</li>
                <li>• Success = useful, actionable patterns</li>
                <li>• Clustering, dimensionality reduction</li>
              </ul>
            </div>
          </div>
          <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/5">
            <p className="text-sm text-gray-400 leading-relaxed m-0">
              They are often used together: run unsupervised clustering to <em>discover</em> segments, then train a
              supervised model to <em>predict</em> which segment a new customer belongs to. Compare with{' '}
              <a href="#/ml/supervised" className="text-blue-400 hover:underline">
                Supervised Learning
              </a>
              .
            </p>
          </div>
        </motion.section>
      </motion.div>
    </GuideLayout>
  );
}

import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section, Segmented, Button } from "../components/VizKit";
import { rng, randn, mean, std, median, quantile, fmt } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "feature engineering", "feature scaling", "standardization", "standardisation", "normalization", "StandardScaler",
  "MinMaxScaler", "RobustScaler", "log transform", "one-hot encoding", "ordinal encoding", "label encoding",
  "target encoding", "mean encoding", "feature hashing", "high cardinality", "class imbalance", "imbalanced data",
  "SMOTE", "oversampling", "undersampling", "class weights", "feature selection", "ColumnTransformer", "Pipeline",
  "interaction features", "binning", "date features",
];

/* ------------------------------------------------------------ scaling lab */

const SALARIES = [42, 45, 47, 48, 50, 52, 53, 55, 58, 60, 61, 64, 66, 70];

function ScalingLab() {
  const [outlier, setOutlier] = useState(true);
  const [method, setMethod] = useState("standard");
  const data = outlier ? [...SALARIES, 400] : SALARIES;
  const m = mean(data);
  const s = std(data, 0);
  const mn = Math.min(...data);
  const mx = Math.max(...data);
  const med = median(data);
  const iqr = quantile(data, 0.75) - quantile(data, 0.25);
  const tf = {
    standard: (v) => (v - m) / s,
    minmax: (v) => (v - mn) / (mx - mn),
    robust: (v) => (v - med) / iqr,
    log: (v) => Math.log(v),
  }[method];
  const out = data.map(tf);
  const lo = Math.min(...out);
  const hi = Math.max(...out);
  const W = 360;
  const sx = (v) => 12 + ((v - lo) / (hi - lo || 1)) * (W - 24);
  const normal = out.slice(0, SALARIES.length);
  const spreadOfTypical = Math.max(...normal) - Math.min(...normal);

  return (
    <Panel tone="indigo" title="One outlier, four scalers">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Segmented
          value={method}
          onChange={setMethod}
          options={[
            { v: "standard", label: "Standard (z-score)" },
            { v: "minmax", label: "Min–max" },
            { v: "robust", label: "Robust (median / IQR)" },
            { v: "log", label: "Log" },
          ]}
        />
        <Segmented
          tone="rose"
          value={outlier ? "yes" : "no"}
          onChange={(v) => setOutlier(v === "yes")}
          options={[
            { v: "no", label: "no outlier" },
            { v: "yes", label: "one CEO salary (400k)" },
          ]}
        />
      </div>
      <svg viewBox={`0 0 ${W} 70`} className="w-full h-auto block">
        <line x1="12" y1="34" x2={W - 12} y2="34" stroke="rgba(255,255,255,0.15)" />
        {out.map((v, i) => (
          <circle key={i} cx={sx(v)} cy="34" r="5" fill={i >= SALARIES.length ? "#fb7185" : "#818cf8"} fillOpacity="0.8" stroke="#000" strokeWidth="0.6" />
        ))}
        <text x="12" y="62" fill="#6b7280" fontSize="10">{fmt(lo, 2)}</text>
        <text x={W - 12} y="62" fill="#6b7280" fontSize="10" textAnchor="end">{fmt(hi, 2)}</text>
      </svg>
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2 mt-3">
        <Metric label="Range of the 14 typical salaries" value={fmt(spreadOfTypical, 2)} tone="indigo" sub="after scaling" />
        <Metric label="Outlier becomes" value={outlier ? fmt(out.at(-1), 2) : "—"} tone="rose" />
        <Metric label="Formula" value={{ standard: "(x−μ)/σ", minmax: "(x−min)/(max−min)", robust: "(x−median)/IQR", log: "ln x" }[method]} />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        With the outlier, min–max squeezes the fourteen ordinary salaries into a sliver near 0 because the maximum
        is now 400. Standardisation is dragged too — the outlier inflates both the mean and σ. Robust scaling uses
        the median and interquartile range, which one extreme value barely moves, so the typical values keep their
        spread. A log transform compresses the long right tail itself; use it for skewed positive quantities like
        income, prices and counts.
      </p>
    </Panel>
  );
}

/* ------------------------------------------------ target encoding + leak */

const CITY_ROWS = [
  ["Paris", 1], ["Paris", 1], ["Paris", 0], ["Paris", 1], ["Paris", 1], ["Paris", 0],
  ["Lyon", 0], ["Lyon", 1], ["Lyon", 0], ["Lyon", 0],
  ["Nice", 1],
  ["Lille", 0],
];

function TargetEncoding() {
  const [m, setM] = useState(0);
  const prior = CITY_ROWS.reduce((s, r) => s + r[1], 0) / CITY_ROWS.length;
  const cities = [...new Set(CITY_ROWS.map((r) => r[0]))];
  const rows = cities.map((c) => {
    const ys = CITY_ROWS.filter((r) => r[0] === c).map((r) => r[1]);
    const n = ys.length;
    const raw = ys.reduce((a, b) => a + b, 0) / n;
    const smooth = (n * raw + m * prior) / (n + m);
    return { c, n, raw, smooth };
  });
  return (
    <Panel tone="amber" title="Target encoding: replace a category with its average outcome">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_240px] gap-5">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead className="text-gray-500 text-left">
              <tr>
                <th className="p-2 font-normal">city</th>
                <th className="p-2 font-normal">rows</th>
                <th className="p-2 font-normal">mean(churn)</th>
                <th className="p-2 font-normal">smoothed</th>
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.c} className="border-t border-white/5">
                  <td className="p-2 text-white">{r.c}</td>
                  <td className="p-2 text-gray-400">{r.n}</td>
                  <td className={`p-2 ${r.n === 1 ? "text-rose-300" : "text-gray-300"}`}>{fmt(r.raw)}</td>
                  <td className="p-2 text-amber-300">{fmt(r.smooth)}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3">
          <Slider tone="amber" label="Smoothing weight m" value={m} min={0} max={10} step={0.5} onChange={setM} />
          <Metric label="Global churn rate (prior)" value={fmt(prior)} tone="amber" />
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Nice and Lille appear once each, so their raw encodings are exactly their own label: 1.00 and 0.00. A model
        trained on that has been handed the answer, and it will trust the feature far too much. Two fixes, usually
        combined: smooth toward the global rate (raise m — rare categories move most), and compute each row's
        encoding out-of-fold, from rows other than itself. scikit-learn's <span className="font-mono">TargetEncoder</span>{" "}
        does both.
      </p>
    </Panel>
  );
}

/* --------------------------------------------------------------- SMOTE */

const IMB = (() => {
  const r = rng(33);
  const maj = Array.from({ length: 90 }, () => ({ x: 0.35 + randn(r) * 0.15, y: 0.55 + randn(r) * 0.15, c: 0 }));
  const min = Array.from({ length: 10 }, () => ({ x: 0.72 + randn(r) * 0.07, y: 0.3 + randn(r) * 0.07, c: 1 }));
  return [...maj, ...min];
})();

function smote(minority, k, count, seed) {
  const r = rng(seed);
  const out = [];
  for (let i = 0; i < count; i++) {
    const a = minority[Math.floor(r() * minority.length)];
    const nn = minority
      .filter((p) => p !== a)
      .map((p) => ({ p, d: (p.x - a.x) ** 2 + (p.y - a.y) ** 2 }))
      .sort((u, v) => u.d - v.d)
      .slice(0, k);
    const b = nn[Math.floor(r() * nn.length)].p;
    const t = r();
    out.push({ x: a.x + t * (b.x - a.x), y: a.y + t * (b.y - a.y), a, b });
  }
  return out;
}

function SmoteLab() {
  const [k, setK] = useState(3);
  const [count, setCount] = useState(0);
  const [seed, setSeed] = useState(1);
  const minority = IMB.filter((p) => p.c === 1);
  const synth = useMemo(() => smote(minority, k, count, seed), [k, count, seed]); // eslint-disable-line react-hooks/exhaustive-deps
  const S = 300;
  const s = (v) => 8 + v * (S - 16);
  return (
    <Panel tone="rose" title="SMOTE: new minority examples on the lines between neighbours">
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,1fr)_250px] gap-5">
        <svg viewBox={`0 0 ${S} ${S}`} className="w-full max-w-md h-auto block rounded-lg bg-black/30 border border-white/10">
          {synth.map((p, i) => (
            <line key={`l${i}`} x1={s(p.a.x)} y1={s(p.a.y)} x2={s(p.b.x)} y2={s(p.b.y)} stroke="rgba(251,113,133,0.25)" />
          ))}
          {IMB.map((p, i) => (
            <circle key={i} cx={s(p.x)} cy={s(p.y)} r={p.c ? 4.5 : 3} fill={p.c ? "#fb7185" : "#475569"} stroke="rgba(0,0,0,0.5)" />
          ))}
          {synth.map((p, i) => (
            <circle key={`s${i}`} cx={s(p.x)} cy={s(p.y)} r="3" fill="none" stroke="#fda4af" strokeWidth="1.3" />
          ))}
        </svg>
        <div className="space-y-3">
          <Slider tone="rose" label="Synthetic points" value={count} min={0} max={80} step={10} onChange={setCount} />
          <Slider tone="rose" label="k nearest neighbours" value={k} min={1} max={9} onChange={setK} />
          <Button tone="rose" onClick={() => setSeed((v) => v + 1)}>Resample</Button>
          <Metric label="Class balance" value={`${90} : ${10 + count}`} tone="rose" sub="majority : minority" />
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Each synthetic point (hollow) sits at a random spot on the segment between a real minority point and one of
        its k nearest minority neighbours. That fills in the minority region instead of duplicating points. It also
        invents data: if the minority class overlaps the majority, SMOTE puts synthetic points in the overlap. Apply
        it only to training folds — never before splitting — and compare it against the simpler options below.
      </p>
    </Panel>
  );
}

export default function MlFeatureEngineering() {
  const toc = [
    { label: "Why Features Matter", hash: "why" },
    { label: "Scaling", hash: "scaling" },
    { label: "Transforming & Creating", hash: "creating" },
    { label: "Encoding Categories", hash: "encoding" },
    { label: "Target Encoding", hash: "target" },
    { label: "Imbalanced Classes", hash: "imbalance" },
    { label: "Feature Selection", hash: "selection" },
    { label: "Pipelines", hash: "pipelines" },
  ];

  return (
    <GuideLayout
      title="Feature Engineering"
      intro="Turning raw columns into inputs a model can use: scaling that survives outliers, encodings for categories, new features from domain knowledge, and handling imbalanced classes — all inside a leak-proof pipeline."
      toc={toc}
    >
      <Section id="why" title="Why Features Matter" lead="On tabular data, better features beat a better algorithm more often than not. The model can only find patterns that the inputs make reachable.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Make the pattern easy" tone="indigo"><p>A linear model cannot learn "price per square metre" from price and area alone — but give it the ratio and it is one weight.</p></Card>
          <Card title="Put numbers in a usable form" tone="emerald"><p>Distance-based and penalised models need comparable scales; neural nets train faster on centred inputs; trees don't care.</p></Card>
          <Card title="Encode what you know" tone="amber"><p>Domain knowledge — weekends, holidays, time since last purchase — often matters more than any tuning.</p></Card>
        </div>
        <Note tone="indigo">
          Clean the data first: missing values, duplicates and types are covered in{" "}
          <a href="#/ml/data-cleaning" className="text-blue-400 hover:underline">Data Cleaning</a>.
        </Note>
      </Section>

      <Section id="scaling" title="Scaling">
        <ScalingLab />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <Card title="Needs scaling" tone="rose"><p>KNN, k-means, SVMs, PCA, penalised linear models (ridge, lasso, logistic), neural networks.</p></Card>
          <Card title="Doesn't" tone="emerald"><p>Decision trees and tree ensembles (random forest, XGBoost, LightGBM) — splits compare a feature with a threshold, so any monotone rescaling gives the same tree.</p></Card>
        </div>
      </Section>

      <Section id="creating" title="Transforming & Creating Features">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          <Card title="Ratios & differences" tone="indigo"><p>Debt ÷ income, price ÷ area, days between signup and first purchase.</p></Card>
          <Card title="Dates & times" tone="purple"><p>Hour, weekday, month, holiday flags. Encode cyclic ones with sin/cos so 23:00 and 00:00 end up close together.</p></Card>
          <Card title="Aggregates" tone="emerald"><p>Per-customer counts, means and recency over a window. Compute them only from data before the prediction time.</p></Card>
          <Card title="Log & power transforms" tone="amber"><p>Tame right-skewed values (income, counts). Box-Cox and Yeo-Johnson pick the power for you.</p></Card>
          <Card title="Binning" tone="blue"><p>Age bands, income brackets. Loses information but can help linear models capture non-linear effects.</p></Card>
          <Card title="Interactions" tone="rose"><p>Products of features (area × location quality). Trees find these on their own; linear models need them spelled out.</p></Card>
        </div>
      </Section>

      <Section id="encoding" title="Encoding Categories">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm min-w-[600px]">
            <thead className="bg-white/5 text-gray-400 text-left">
              <tr>
                <th className="p-3 font-medium">Encoding</th>
                <th className="p-3 font-medium">How</th>
                <th className="p-3 font-medium">Use when</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-t border-white/5"><td className="p-3 font-semibold text-white">One-hot</td><td className="p-3 text-xs">One 0/1 column per category</td><td className="p-3 text-xs text-gray-400">Few categories (tens). The safe default for linear models and neural nets.</td></tr>
              <tr className="border-t border-white/5"><td className="p-3 font-semibold text-white">Ordinal</td><td className="p-3 text-xs">Map to integers in a meaningful order</td><td className="p-3 text-xs text-gray-400">Genuinely ordered values (small &lt; medium &lt; large). For unordered categories it invents an order — fine for trees, misleading for linear models.</td></tr>
              <tr className="border-t border-white/5"><td className="p-3 font-semibold text-white">Target</td><td className="p-3 text-xs">Mean target per category, smoothed and out-of-fold</td><td className="p-3 text-xs text-gray-400">High cardinality (thousands of zip codes or product IDs).</td></tr>
              <tr className="border-t border-white/5"><td className="p-3 font-semibold text-white">Hashing</td><td className="p-3 text-xs">Hash the category into a fixed number of columns</td><td className="p-3 text-xs text-gray-400">Huge or open-ended vocabularies; accepts some collisions.</td></tr>
              <tr className="border-t border-white/5"><td className="p-3 font-semibold text-white">Learned embeddings</td><td className="p-3 text-xs">A trainable vector per category</td><td className="p-3 text-xs text-gray-400">Neural nets with many categories (users, items) — see <a href="#/ml/recommenders" className="text-blue-400 hover:underline">Recommenders</a>.</td></tr>
            </tbody>
          </table>
        </div>
        <Note tone="amber">
          Plan for categories you have never seen: set <span className="font-mono">handle_unknown="ignore"</span> on the
          one-hot encoder, or map rare categories to an "other" bucket.
        </Note>
      </Section>

      <Section id="target" title="Target Encoding">
        <TargetEncoding />
      </Section>

      <Section id="imbalance" title="Imbalanced Classes" lead="When one class is 1% of the data, a model can ignore it and still score 99% accuracy. Fix the evaluation first, then the training.">
        <SmoteLab />
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mt-5">
          <Card title="1. Right metric" tone="indigo"><p>Precision, recall, PR-AUC — never accuracy. See <a href="#/ml/evaluation-metrics" className="text-blue-400 hover:underline">Evaluation Metrics</a>.</p></Card>
          <Card title="2. Move the threshold" tone="emerald"><p>Often the whole fix: the model ranks fine, and 0.5 was just the wrong cut-off.</p></Card>
          <Card title="3. Class weights" tone="amber"><p><span className="font-mono">class_weight="balanced"</span> makes each minority error cost more. No new data, no leakage risk.</p></Card>
          <Card title="4. Resampling" tone="rose"><p>Under-sample the majority, over-sample the minority, or SMOTE. Inside training folds only.</p></Card>
        </div>
      </Section>

      <Section id="selection" title="Feature Selection">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Filter" tone="indigo"><p>Score each feature alone — correlation, mutual information, chi-square — and keep the best. Fast, but blind to interactions.</p></Card>
          <Card title="Wrapper" tone="purple"><p>Search subsets by training models: recursive feature elimination, forward selection. Accurate and expensive.</p></Card>
          <Card title="Embedded" tone="emerald"><p>Selection happens during training: <a href="#/ml/regularization" className="text-blue-400 hover:underline">lasso</a> zeroes weights; tree models report importances (prefer permutation importance).</p></Card>
        </div>
      </Section>

      <Section id="pipelines" title="Pipelines" lead="Every step that learns from data — scalers, imputers, encoders, selectors, resamplers — must be fit on training data only. A pipeline guarantees it, in cross-validation and in production.">
        <CodeBlock
          language="python"
          code={`from sklearn.compose import ColumnTransformer
from sklearn.pipeline import Pipeline
from sklearn.impute import SimpleImputer
from sklearn.preprocessing import OneHotEncoder, RobustScaler, TargetEncoder, FunctionTransformer
from sklearn.linear_model import LogisticRegression
from sklearn.model_selection import cross_val_score
import numpy as np

numeric   = ["age", "tenure_days"]
skewed    = ["income", "monthly_spend"]
low_card  = ["plan", "region"]
high_card = ["zip_code"]

pre = ColumnTransformer([
    ("num",    Pipeline([("impute", SimpleImputer(strategy="median")),
                         ("scale",  RobustScaler())]), numeric),
    ("skewed", Pipeline([("impute", SimpleImputer(strategy="median")),
                         ("log",    FunctionTransformer(np.log1p)),
                         ("scale",  RobustScaler())]), skewed),
    ("onehot", OneHotEncoder(handle_unknown="ignore"), low_card),
    ("target", TargetEncoder(smooth="auto"), high_card),   # out-of-fold internally
])

model = Pipeline([("pre", pre),
                  ("clf", LogisticRegression(class_weight="balanced", max_iter=2000))])

# Everything above is refit inside each fold — no leakage
print(cross_val_score(model, X, y, cv=5, scoring="average_precision").mean())

# SMOTE needs imbalanced-learn's Pipeline so it only touches training folds:
# from imblearn.pipeline import Pipeline; from imblearn.over_sampling import SMOTE`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("ml-features")} />
    </GuideLayout>
  );
}

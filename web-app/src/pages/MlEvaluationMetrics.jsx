import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section, Segmented } from "../components/VizKit";
import { normCdf, normPdf, pct, fmt } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "evaluation metrics", "model evaluation", "confusion matrix", "true positive", "false positive", "false negative",
  "precision", "recall", "sensitivity", "specificity", "F1 score", "F-beta", "accuracy paradox", "class imbalance",
  "ROC curve", "AUC", "ROC-AUC", "precision-recall curve", "average precision", "PR-AUC", "decision threshold",
  "macro average", "micro average", "weighted average", "MAE", "RMSE", "R squared", "MAPE", "cross-validation",
  "k-fold", "stratified k-fold", "TimeSeriesSplit", "data leakage", "log loss", "calibration",
];

/* ---------------------------------------------------------------------------
   Everything in the threshold lab is computed exactly, not simulated: scores
   for negatives are N(0, 1) and for positives N(separation, 1), so every rate
   is a normal CDF. That keeps the curves smooth and the numbers reproducible.
--------------------------------------------------------------------------- */

const N = 10000;

function rates(t, sep) {
  return { tpr: 1 - normCdf(t - sep), fpr: 1 - normCdf(t) };
}

function counts(t, sep, prev) {
  const P = N * prev;
  const Nn = N - P;
  const { tpr, fpr } = rates(t, sep);
  const tp = P * tpr;
  const fn = P - tp;
  const fp = Nn * fpr;
  const tn = Nn - fp;
  return { tp, fn, fp, tn, P, Nn };
}

function metricsFrom({ tp, fn, fp, tn }) {
  const precision = tp + fp > 0 ? tp / (tp + fp) : NaN;
  const recall = tp / (tp + fn);
  const specificity = tn / (tn + fp);
  const accuracy = (tp + tn) / (tp + tn + fp + fn);
  const f1 = precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;
  return { precision, recall, specificity, accuracy, f1 };
}

const T_MIN = -3;
const T_MAX = 6;

function ThresholdLab() {
  const [sep, setSep] = useState(2);
  const [prev, setPrev] = useState(0.1);
  const [t, setT] = useState(1.2);

  const c = counts(t, sep, prev);
  const m = metricsFrom(c);
  const auc = normCdf(sep / Math.SQRT2); // exact AUC for two unit-variance normals
  const baseline = 1 - prev; // accuracy of always predicting "negative"

  // Curves: sweep the threshold from high to low.
  const sweep = useMemo(() => {
    const pts = [];
    for (let i = 0; i <= 120; i++) {
      const th = T_MAX - (i / 120) * (T_MAX - T_MIN);
      const cc = counts(th, sep, prev);
      const mm = metricsFrom(cc);
      pts.push({ th, fpr: cc.fp / cc.Nn, tpr: cc.tp / cc.P, precision: mm.precision });
    }
    return pts;
  }, [sep, prev]);

  // Average precision: sum over recall steps of precision (step interpolation).
  const ap = useMemo(() => {
    let s = 0;
    for (let i = 1; i < sweep.length; i++) {
      const p = Number.isFinite(sweep[i].precision) ? sweep[i].precision : 1;
      s += (sweep[i].tpr - sweep[i - 1].tpr) * p;
    }
    return s;
  }, [sweep]);

  // Distribution plot
  const W = 360;
  const H = 150;
  const sx = (x) => 10 + ((x - T_MIN) / (T_MAX - T_MIN)) * (W - 20);
  const peak = Math.max((1 - prev) * normPdf(0), prev * normPdf(0));
  const sy = (y) => H - 20 - (y / peak) * (H - 34);
  const curve = (mu, w) => {
    let d = "";
    for (let i = 0; i <= 100; i++) {
      const x = T_MIN + ((T_MAX - T_MIN) * i) / 100;
      d += `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(w * normPdf(x, mu, 1)).toFixed(1)}`;
    }
    return d;
  };
  const area = (mu, w, from, to) => {
    let d = `M${sx(from).toFixed(1)},${sy(0)}`;
    for (let i = 0; i <= 60; i++) {
      const x = from + ((to - from) * i) / 60;
      d += `L${sx(x).toFixed(1)},${sy(w * normPdf(x, mu, 1)).toFixed(1)}`;
    }
    return d + `L${sx(to).toFixed(1)},${sy(0)}Z`;
  };

  // ROC / PR plots
  const S = 150;
  const px = (v) => 22 + v * (S - 30);
  const py = (v) => S - 18 - v * (S - 28);
  const roc = sweep.map((p, i) => `${i ? "L" : "M"}${px(p.fpr).toFixed(1)},${py(p.tpr).toFixed(1)}`).join("");
  const pr = sweep
    .filter((p) => Number.isFinite(p.precision))
    .map((p, i) => `${i ? "L" : "M"}${px(p.tpr).toFixed(1)},${py(p.precision).toFixed(1)}`)
    .join("");

  const cell = (label, v, tone) => (
    <div className={`rounded-lg border p-3 text-center ${tone}`}>
      <div className="text-[0.625rem] uppercase tracking-wide opacity-80">{label}</div>
      <div className="text-lg font-bold font-mono">{Math.round(v).toLocaleString()}</div>
    </div>
  );

  return (
    <Panel tone="indigo" title="Move the threshold, watch every metric trade off">
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        A classifier outputs a score; you choose the cut-off. 10,000 cases, some share of them positive. Scores for
        negatives are centred at 0, positives at the separation you set.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-5">
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
            <path d={area(0, 1 - prev, t, T_MAX)} fill="rgba(96,165,250,0.35)" />
            <path d={area(sep, prev, T_MIN, t)} fill="rgba(251,191,36,0.4)" />
            <path d={curve(0, 1 - prev)} fill="none" stroke="#94a3b8" strokeWidth="2" />
            <path d={curve(sep, prev)} fill="none" stroke="#fb7185" strokeWidth="2" />
            <line x1={sx(t)} y1="6" x2={sx(t)} y2={H - 20} stroke="#e5e7eb" strokeWidth="2" />
            <text x={sx(t) + 4} y="14" fill="#e5e7eb" fontSize="10">threshold</text>
            <line x1="10" y1={H - 20} x2={W - 10} y2={H - 20} stroke="rgba(255,255,255,0.2)" />
            <text x="12" y={H - 6} fill="#6b7280" fontSize="10">low score</text>
            <text x={W - 12} y={H - 6} fill="#6b7280" fontSize="10" textAnchor="end">high score → predict positive</text>
          </svg>
          <div className="flex flex-wrap gap-x-4 gap-y-1 text-[0.6875rem] text-gray-400 mt-1 mb-4">
            <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-slate-400 mr-1" />negatives</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-rose-400 mr-1" />positives</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-blue-400/60 mr-1" />false positives</span>
            <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400/70 mr-1" />false negatives</span>
          </div>

          <div className="grid grid-cols-[auto_1fr_1fr] gap-2 items-center text-xs max-w-md">
            <span />
            <span className="text-center text-gray-500">predicted +</span>
            <span className="text-center text-gray-500">predicted −</span>
            <span className="text-gray-500 pr-1">actual +</span>
            {cell("TP", c.tp, "border-emerald-500/40 bg-emerald-500/10 text-emerald-200")}
            {cell("FN", c.fn, "border-amber-500/40 bg-amber-500/10 text-amber-200")}
            <span className="text-gray-500 pr-1">actual −</span>
            {cell("FP", c.fp, "border-blue-500/40 bg-blue-500/10 text-blue-200")}
            {cell("TN", c.tn, "border-white/10 bg-white/5 text-gray-300")}
          </div>
        </div>

        <div className="space-y-3">
          <Slider label="Threshold" value={t} min={-2} max={5} step={0.05} onChange={setT} format={(v) => v.toFixed(2)} />
          <Slider label="Class separation" value={sep} min={0} max={4} step={0.1} onChange={setSep} format={(v) => v.toFixed(1)} />
          <Slider label="Share of positives" value={prev} min={0.01} max={0.5} step={0.01} onChange={setPrev} format={(v) => pct(v, 0)} />
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Precision" value={pct(m.precision)} tone="blue" sub="TP / (TP + FP)" />
            <Metric label="Recall" value={pct(m.recall)} tone="amber" sub="TP / (TP + FN)" />
            <Metric label="F1" value={fmt(m.f1, 3)} tone="purple" />
            <Metric label="Accuracy" value={pct(m.accuracy)} sub={`"always −" scores ${pct(baseline, 0)}`} />
          </div>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mt-6">
        <div>
          <div className="text-xs text-gray-400 mb-1">ROC curve · AUC = <span className="font-mono text-indigo-300">{fmt(auc, 3)}</span></div>
          <svg viewBox={`0 0 ${S} ${S}`} className="w-full max-w-[260px] h-auto block">
            <rect x={px(0)} y={py(1)} width={px(1) - px(0)} height={py(0) - py(1)} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)" />
            <line x1={px(0)} y1={py(0)} x2={px(1)} y2={py(1)} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
            <path d={roc} fill="none" stroke="#818cf8" strokeWidth="2" />
            <circle cx={px(c.fp / c.Nn)} cy={py(c.tp / c.P)} r="4" fill="#e5e7eb" />
            <text x={px(0.5)} y={S - 3} fill="#6b7280" fontSize="9" textAnchor="middle">false positive rate</text>
            <text x="8" y={py(0.5)} fill="#6b7280" fontSize="9" transform={`rotate(-90 8 ${py(0.5)})`} textAnchor="middle">recall (TPR)</text>
          </svg>
        </div>
        <div>
          <div className="text-xs text-gray-400 mb-1">
            Precision–recall curve · AP ≈ <span className="font-mono text-rose-300">{fmt(ap, 3)}</span> · chance level = {pct(prev, 0)}
          </div>
          <svg viewBox={`0 0 ${S} ${S}`} className="w-full max-w-[260px] h-auto block">
            <rect x={px(0)} y={py(1)} width={px(1) - px(0)} height={py(0) - py(1)} fill="rgba(255,255,255,0.02)" stroke="rgba(255,255,255,0.12)" />
            <line x1={px(0)} y1={py(prev)} x2={px(1)} y2={py(prev)} stroke="rgba(255,255,255,0.2)" strokeDasharray="3 3" />
            <path d={pr} fill="none" stroke="#fb7185" strokeWidth="2" />
            {Number.isFinite(m.precision) && <circle cx={px(m.recall)} cy={py(m.precision)} r="4" fill="#e5e7eb" />}
            <text x={px(0.5)} y={S - 3} fill="#6b7280" fontSize="9" textAnchor="middle">recall</text>
            <text x="8" y={py(0.5)} fill="#6b7280" fontSize="9" transform={`rotate(-90 8 ${py(0.5)})`} textAnchor="middle">precision</text>
          </svg>
        </div>
      </div>

      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Three things to try. Drag the share of positives down to 1%: precision collapses to a few percent, yet
        accuracy still looks respectable — and the do-nothing "always negative" baseline under it scores 99%. That
        is the accuracy paradox. Notice that the ROC curve and its AUC do not move at all when you
        change the share of positives, but the precision–recall curve does; on rare-event problems PR is the honest
        picture. And no threshold improves precision and recall together — you are choosing a point on the curve,
        and the separation slider (a better model) is the only thing that moves the curve itself.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Multi-class averaging on a fixed 3-class confusion matrix.
--------------------------------------------------------------------------- */

const CLASSES = ["cat", "dog", "rabbit"];
const MATRIX = [
  // predicted: cat, dog, rabbit   (rows = actual)
  [420, 60, 20],
  [50, 380, 20],
  [10, 25, 15],
];

function MultiClass() {
  const [avg, setAvg] = useState("macro");
  const k = CLASSES.length;
  const per = CLASSES.map((_, i) => {
    const tp = MATRIX[i][i];
    const fn = MATRIX[i].reduce((a, b) => a + b, 0) - tp;
    const fp = MATRIX.reduce((a, row) => a + row[i], 0) - tp;
    const precision = tp / (tp + fp);
    const recall = tp / (tp + fn);
    const f1 = (2 * precision * recall) / (precision + recall);
    return { tp, fp, fn, support: tp + fn, precision, recall, f1 };
  });
  const total = per.reduce((a, p) => a + p.support, 0);
  const macro = per.reduce((a, p) => a + p.f1, 0) / k;
  const weighted = per.reduce((a, p) => a + p.f1 * p.support, 0) / total;
  const sumTp = per.reduce((a, p) => a + p.tp, 0);
  const micro = sumTp / total; // micro-F1 equals accuracy for single-label problems
  const value = { macro, weighted, micro }[avg];

  return (
    <Panel tone="purple" title="Three classes, three different 'F1' scores">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="overflow-x-auto">
          <table className="text-xs sm:text-sm font-mono w-full">
            <thead>
              <tr className="text-gray-500">
                <th className="p-1.5 text-left font-normal">actual ↓ / predicted →</th>
                {CLASSES.map((c) => (
                  <th key={c} className="p-1.5 font-normal">{c}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {MATRIX.map((row, i) => (
                <tr key={i}>
                  <td className="p-1.5 text-gray-400">{CLASSES[i]}</td>
                  {row.map((v, j) => (
                    <td key={j} className={`p-1.5 text-center rounded ${i === j ? "bg-emerald-500/15 text-emerald-200" : "text-gray-300"}`}>{v}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
          <table className="text-xs font-mono w-full mt-4">
            <thead>
              <tr className="text-gray-500">
                <th className="p-1 text-left font-normal">class</th>
                <th className="p-1 font-normal">precision</th>
                <th className="p-1 font-normal">recall</th>
                <th className="p-1 font-normal">F1</th>
                <th className="p-1 font-normal">support</th>
              </tr>
            </thead>
            <tbody>
              {per.map((p, i) => (
                <tr key={i} className="text-center text-gray-300">
                  <td className="p-1 text-left text-gray-400">{CLASSES[i]}</td>
                  <td className="p-1">{fmt(p.precision)}</td>
                  <td className="p-1">{fmt(p.recall)}</td>
                  <td className={`p-1 ${p.f1 < 0.5 ? "text-rose-300" : ""}`}>{fmt(p.f1)}</td>
                  <td className="p-1">{p.support}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-3">
          <Segmented
            tone="purple"
            value={avg}
            onChange={setAvg}
            options={[
              { v: "macro", label: "macro" },
              { v: "weighted", label: "weighted" },
              { v: "micro", label: "micro" },
            ]}
          />
          <Metric label={`${avg} F1`} value={fmt(value, 3)} tone="purple" />
          <p className="text-xs text-gray-400 leading-relaxed m-0">
            {avg === "macro" && "Macro averages the per-class F1 scores equally. The rare, badly handled rabbit class drags it down — which is exactly what you want if every class matters."}
            {avg === "weighted" && "Weighted averages per-class F1 by support. The big cat and dog classes dominate, so the rabbit problem almost disappears from the number."}
            {avg === "micro" && "Micro pools every TP, FP and FN before computing. For single-label problems it equals plain accuracy, so it hides minority-class failures the same way accuracy does."}
          </p>
        </div>
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Regression metrics, and what one outlier does to each.
--------------------------------------------------------------------------- */

const REG = [
  [10, 11], [12, 12.5], [15, 14], [18, 19], [20, 21.5], [22, 21], [25, 26], [28, 27], [30, 31.5], [33, 32],
];

function RegressionMetrics() {
  const [outlier, setOutlier] = useState(false);
  const rows = outlier ? [...REG.slice(0, 9), [33, 58]] : REG;
  const n = rows.length;
  const errs = rows.map(([y, yhat]) => yhat - y);
  const mae = errs.reduce((a, e) => a + Math.abs(e), 0) / n;
  const rmse = Math.sqrt(errs.reduce((a, e) => a + e * e, 0) / n);
  const mean = rows.reduce((a, [y]) => a + y, 0) / n;
  const ssTot = rows.reduce((a, [y]) => a + (y - mean) ** 2, 0);
  const ssRes = errs.reduce((a, e) => a + e * e, 0);
  const r2 = 1 - ssRes / ssTot;
  const mape = rows.reduce((a, [y, yhat]) => a + Math.abs((yhat - y) / y), 0) / n;

  return (
    <Panel tone="teal" title="MAE, RMSE, R² — and one bad prediction">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Segmented
          tone="teal"
          value={outlier ? "bad" : "clean"}
          onChange={(v) => setOutlier(v === "bad")}
          options={[
            { v: "clean", label: "10 good predictions" },
            { v: "bad", label: "one prediction off by 25" },
          ]}
        />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Metric label="MAE" value={fmt(mae)} tone="teal" sub="mean |error|" />
        <Metric label="RMSE" value={fmt(rmse)} tone="amber" sub="√ mean error²" />
        <Metric label="R²" value={fmt(r2, 3)} tone="indigo" sub="share of variance explained" />
        <Metric label="MAPE" value={pct(mape)} tone="rose" sub="mean |error| / |actual|" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        The single bad prediction roughly triples MAE but makes RMSE about seven times larger, because squaring
        punishes big misses disproportionately. Use RMSE when a large error is much worse than several small ones
        (and it is in the target's units); use MAE when every unit of error costs the same. MAPE reads as a
        percentage but explodes when actual values are near zero.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Cross-validation schemes, drawn.
--------------------------------------------------------------------------- */

function CrossValidation() {
  const [scheme, setScheme] = useState("kfold");
  const [k, setK] = useState(5);
  const n = 20;
  const rows =
    scheme === "kfold"
      ? Array.from({ length: k }, (_, f) =>
          Array.from({ length: n }, (_, i) => (Math.floor((i * k) / n) === f ? "test" : "train")),
        )
      : Array.from({ length: k }, (_, f) => {
          const block = Math.floor(n / (k + 1));
          return Array.from({ length: n }, (_, i) =>
            i < block * (f + 1) ? "train" : i < block * (f + 2) ? "test" : "unused",
          );
        });
  const colour = { train: "bg-indigo-500/60", test: "bg-amber-400", unused: "bg-white/5" };

  return (
    <Panel tone="amber" title="k-fold vs time-series splits">
      <div className="flex flex-wrap items-end gap-5 mb-4">
        <Segmented
          tone="amber"
          value={scheme}
          onChange={setScheme}
          options={[
            { v: "kfold", label: "k-fold (shuffled data)" },
            { v: "time", label: "time-series (walk-forward)" },
          ]}
        />
        <div className="w-48">
          <Slider tone="amber" label="folds" value={k} min={3} max={8} onChange={setK} />
        </div>
      </div>
      <div className="space-y-1.5">
        {rows.map((r, f) => (
          <div key={f} className="flex items-center gap-2">
            <span className="w-14 text-[0.6875rem] text-gray-500 font-mono">split {f + 1}</span>
            <div className="flex-1 grid gap-0.5" style={{ gridTemplateColumns: `repeat(${n}, minmax(0, 1fr))` }}>
              {r.map((c, i) => (
                <div key={i} className={`h-4 rounded-sm ${colour[c]}`} />
              ))}
            </div>
          </div>
        ))}
      </div>
      <div className="flex gap-4 text-[0.6875rem] text-gray-400 mt-2">
        <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-indigo-500/60 mr-1" />train</span>
        <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-amber-400 mr-1" />validate</span>
        {scheme === "time" && <span><span className="inline-block w-2.5 h-2.5 rounded-sm bg-white/10 mr-1" />future, not yet seen</span>}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        {scheme === "kfold"
          ? "Every row is used for validation exactly once, and the k scores are averaged — a far steadier estimate than one train/test split. Use stratified k-fold for classification so each fold keeps the class balance."
          : "With time-ordered data, a shuffled fold would let the model train on the future and validate on the past. Walk-forward splits only ever validate on data after everything the model trained on — the way it will be used."}
      </p>
    </Panel>
  );
}

const CHOOSE = [
  { q: "Balanced classes, errors cost about the same", m: "Accuracy, or F1", why: "Accuracy is fine when no class is rare. F1 is a safer default when you are unsure." },
  { q: "False positives are expensive (spam filter, fraud block)", m: "Precision (at a recall floor)", why: "Every wrongly blocked legitimate email or payment is a cost. Tune the threshold for precision." },
  { q: "Misses are expensive (cancer screening, safety)", m: "Recall (at a precision floor)", why: "A missed case is far worse than a false alarm that a second test will clear." },
  { q: "Rare positives, ranking quality matters", m: "PR-AUC / average precision", why: "ROC-AUC looks flattering when negatives vastly outnumber positives; PR-AUC does not." },
  { q: "Comparing models before choosing a threshold", m: "ROC-AUC", why: "Threshold-free and insensitive to class balance — good for ranking models, not for picking an operating point." },
  { q: "You need trustworthy probabilities", m: "Log loss, Brier score, calibration plot", why: "A model can rank well and still say 90% when the truth is 60%." },
  { q: "Regression, large errors much worse", m: "RMSE", why: "Squares the errors, so big misses dominate." },
  { q: "Regression, robust to outliers", m: "MAE (or median absolute error)", why: "Every unit of error counts the same." },
];

export default function MlEvaluationMetrics() {
  const toc = [
    { label: "Why Accuracy Misleads", hash: "why" },
    { label: "The Confusion Matrix", hash: "confusion" },
    { label: "Threshold Lab", hash: "lab" },
    { label: "ROC vs Precision–Recall", hash: "curves" },
    { label: "Multi-class Averaging", hash: "multiclass" },
    { label: "Regression Metrics", hash: "regression" },
    { label: "Cross-Validation", hash: "cv" },
    { label: "Data Leakage", hash: "leakage" },
    { label: "Choosing a Metric", hash: "choose" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Evaluation Metrics"
      intro="How to tell whether a model is actually good: the confusion matrix, precision and recall, ROC and PR curves, regression errors, and the validation schemes that keep the numbers honest."
      toc={toc}
    >
      <Section id="why" title="Why Accuracy Misleads" lead="A fraud model that approves every transaction is 99.9% accurate if 0.1% of transactions are fraud. It is also useless. The metric has to reflect what an error costs.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Errors are not equal" tone="rose"><p>A missed tumour and a false alarm are both one error to accuracy. To a patient they are not remotely the same.</p></Card>
          <Card title="Classes are rarely balanced" tone="amber"><p>Fraud, churn, defects, clicks — the interesting class is usually the rare one, and accuracy rewards ignoring it.</p></Card>
          <Card title="The threshold is a choice" tone="indigo"><p>Most classifiers output a score. Metrics like precision and recall depend on where you cut it — so report the threshold too.</p></Card>
        </div>
      </Section>

      <Section id="confusion" title="The Confusion Matrix" lead="Every classification metric is built from four counts.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <Card title="True positive / true negative" tone="emerald"><p>The model said positive and it was (TP), or said negative and it was (TN).</p></Card>
          <Card title="False positive / false negative" tone="rose"><p>A false alarm (FP, type I error) or a miss (FN, type II error) — the same two errors as in <a href="#/ml/hypothesis-testing" className="text-blue-400 hover:underline">hypothesis testing</a>.</p></Card>
        </div>
        <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-xs sm:text-sm text-gray-200 space-y-1 overflow-x-auto">
          <div>precision   = TP / (TP + FP)      of everything flagged, how much was right</div>
          <div>recall      = TP / (TP + FN)      of everything real, how much was caught (sensitivity, TPR)</div>
          <div>specificity = TN / (TN + FP)      of everything negative, how much was cleared</div>
          <div>F1          = 2·P·R / (P + R)     harmonic mean — low if either is low</div>
          <div>F-beta      = (1+β²)·P·R / (β²·P + R)   β &gt; 1 weights recall more</div>
        </div>
      </Section>

      <Section id="lab" title="Threshold Lab" lead="Every number here is computed exactly from the two score distributions.">
        <ThresholdLab />
      </Section>

      <Section id="curves" title="ROC vs Precision–Recall">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <Card title="ROC curve" tone="indigo">
            <p>Plots recall against the false-positive rate as the threshold sweeps. AUC is the probability that a random positive scores higher than a random negative. 0.5 is chance, 1.0 is perfect.</p>
            <p>Both axes are rates within one class, so ROC ignores class balance — a strength when comparing models, a weakness when positives are rare.</p>
          </Card>
          <Card title="Precision–recall curve" tone="rose">
            <p>Plots precision against recall. Its chance level is the positive rate, not 0.5, so a model on a 1% problem that looks great on ROC can sit near the floor here.</p>
            <p>Summarise it with average precision (AP). Prefer it whenever the positive class is rare and what you care about is the flagged list.</p>
          </Card>
        </div>
        <Note tone="amber">
          AUC measures ranking, not calibration. A model that outputs 0.51 for every positive and 0.49 for every negative
          has AUC = 1.0 and useless probabilities. If the scores feed a decision, check a calibration plot too.
        </Note>
      </Section>

      <Section id="multiclass" title="Multi-class Averaging" lead="With more than two classes you compute precision, recall and F1 per class, then average — and the averaging choice can change the story.">
        <MultiClass />
      </Section>

      <Section id="regression" title="Regression Metrics">
        <RegressionMetrics />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <Card title="R² is relative" tone="indigo"><p>1 − SS_res / SS_tot: the share of variance explained compared with always predicting the mean. It can be negative on test data if the model is worse than that.</p></Card>
          <Card title="Report the units" tone="teal"><p>"RMSE = 12" means nothing without a unit and a baseline. Compare against a naive model — the mean, or yesterday's value for time series.</p></Card>
          <Card title="Look at residuals" tone="amber"><p>A single number hides patterns. Plot residuals against predictions; structure there means the model is missing something (see <a href="#/ml/multiple-regression" className="text-blue-400 hover:underline">multiple regression</a>).</p></Card>
        </div>
      </Section>

      <Section id="cv" title="Cross-Validation" lead="A single train/test split gives one noisy number. Cross-validation reuses the data to give several, and their spread tells you how much to trust the mean.">
        <CrossValidation />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <Card title="Three-way split" tone="emerald"><p>Tune on validation folds; touch the test set once, at the end. Every time you look at test scores and change something, the test set leaks into your choices.</p></Card>
          <Card title="Group k-fold" tone="purple"><p>If one patient, user or document contributes many rows, keep all of them in the same fold — otherwise the model is tested on people it already saw.</p></Card>
          <Card title="Nested CV" tone="blue"><p>For small datasets where you tune many hyperparameters: an inner loop tunes, an outer loop estimates. Slower, but unbiased.</p></Card>
        </div>
      </Section>

      <Section id="leakage" title="Data Leakage" lead="The most common reason a model scores brilliantly offline and fails in production: information the model will not have at prediction time sneaks into training.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Preprocessing before splitting" tone="rose"><p>Fitting a scaler, imputer or feature selector on all the data lets test statistics shape training. Put every step inside a <span className="font-mono">Pipeline</span> so it is fit on training folds only.</p></Card>
          <Card title="Target leakage" tone="rose"><p>A feature that is a consequence of the label — "account_closed_date" when predicting churn, "treatment_given" when predicting diagnosis. Ask: would I know this value at the moment of prediction?</p></Card>
          <Card title="Temporal leakage" tone="amber"><p>Random splits on time-ordered data, or features computed with future information (a rolling mean that includes today's value).</p></Card>
          <Card title="Duplicates across splits" tone="amber"><p>Near-duplicate rows, images or documents in both train and test inflate scores. Deduplicate before splitting — this is a notorious problem for LLM benchmarks too.</p></Card>
        </div>
      </Section>

      <Section id="choose" title="Choosing a Metric">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-white/5 text-gray-400 text-left">
              <tr>
                <th className="p-3 font-medium">Situation</th>
                <th className="p-3 font-medium">Metric</th>
                <th className="p-3 font-medium">Why</th>
              </tr>
            </thead>
            <tbody>
              {CHOOSE.map((r) => (
                <tr key={r.q} className="border-t border-white/5 align-top">
                  <td className="p-3 text-gray-300">{r.q}</td>
                  <td className="p-3 text-indigo-300 font-semibold whitespace-nowrap">{r.m}</td>
                  <td className="p-3 text-gray-400 text-xs leading-relaxed">{r.why}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`from sklearn.model_selection import StratifiedKFold, cross_validate
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (classification_report, confusion_matrix,
                             roc_auc_score, average_precision_score,
                             precision_recall_curve)

model = make_pipeline(StandardScaler(), LogisticRegression(max_iter=1000))

# Cross-validated scores — the scaler is refit inside every fold, so no leakage
cv = StratifiedKFold(n_splits=5, shuffle=True, random_state=0)
scores = cross_validate(model, X, y, cv=cv,
                        scoring=["roc_auc", "average_precision", "f1"])
print({k: v.mean().round(3) for k, v in scores.items() if k.startswith("test_")})

# Final fit and a threshold chosen for a precision floor
model.fit(X_train, y_train)
proba = model.predict_proba(X_test)[:, 1]
print("ROC-AUC", roc_auc_score(y_test, proba))
print("AP     ", average_precision_score(y_test, proba))

prec, rec, thr = precision_recall_curve(y_test, proba)
ok = prec[:-1] >= 0.90                      # need at least 90% precision
threshold = thr[ok][0] if ok.any() else 0.5 # lowest threshold that meets it
pred = (proba >= threshold).astype(int)

print(confusion_matrix(y_test, pred))
print(classification_report(y_test, pred, digits=3))   # per-class + macro/weighted`}
        />
        <Note tone="indigo">
          In a real project choose the threshold on validation data, not the test set — otherwise the test score is
          optimistic. The snippet uses the test set only to keep it short.
        </Note>
      </Section>

      <KnowledgeCheck questions={questionsFor("ml-evaluation")} />
    </GuideLayout>
  );
}

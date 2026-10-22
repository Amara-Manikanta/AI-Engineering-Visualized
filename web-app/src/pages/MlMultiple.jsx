import React, { useState, useMemo } from "react";
import { motion } from "framer-motion";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Segmented, Metric, Card, Note, Scatter } from "../components/VizKit";
import { rng, randn, ols, linfit, fmt } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "multiple linear regression", "multi linear regression", "multiple regression", "OLS", "ordinary least squares",
  "normal equation", "R squared", "adjusted R squared", "coefficients", "holding other variables constant",
  "residual plot", "regression assumptions", "heteroscedasticity", "multicollinearity", "VIF",
  "variance inflation factor", "dummy variables", "dummy variable trap", "one-hot encoding", "ridge", "lasso",
  "statsmodels", "p-value of coefficient",
];

/* ---------------------------------------------------------------------------
   Thirty houses. The true price rule is known here so we can check what the
   regression recovers: bigger area adds value, age removes it, and — holding
   area fixed — an extra bedroom means smaller rooms and slightly lowers price.
--------------------------------------------------------------------------- */

const HOUSES = (() => {
  const r = rng(360);
  return Array.from({ length: 30 }, () => {
    const sqft = Math.round(700 + 2300 * r());
    const bedrooms = Math.max(1, Math.min(6, Math.round(sqft / 600 + 0.45 * randn(r))));
    const age = Math.round(60 * r());
    const noise = randn(r);
    const price = Math.round(40000 + 150 * sqft - 12000 * bedrooms - 900 * age + 25000 * randn(r));
    return { sqft, bedrooms, age, noise, price };
  });
})();

const FEATURES = [
  { k: "sqft", label: "Square feet" },
  { k: "bedrooms", label: "Bedrooms" },
  { k: "age", label: "Age" },
  { k: "noise", label: "Random noise column" },
];

const FULL = ols(HOUSES.map((h) => [h.sqft, h.bedrooms, h.age]), HOUSES.map((h) => h.price));
const [B0, B_SQFT, B_BED, B_AGE] = FULL.beta.map((b) => Math.round(b));

/* ---------------------------------------------------------------------------
   Live prediction calculator — now using the coefficients fitted above.
--------------------------------------------------------------------------- */

function PredictionCalculator() {
  const [sqft, setSqft] = useState(1500);
  const [bedrooms, setBedrooms] = useState(3);
  const [age, setAge] = useState(10);
  const b0 = B0, bSqft = B_SQFT, bBed = B_BED, bAge = B_AGE;

  const prediction = useMemo(() => b0 + bSqft * sqft + bBed * bedrooms + bAge * age, [sqft, bedrooms, age, b0, bSqft, bBed, bAge]);
  const sign = (v) => (v < 0 ? "−" : "+");

  return (
    <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-4 sm:p-6">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-6">
        <div>
          <label className="text-sm text-gray-300 font-semibold block mb-1">Square Feet = {sqft}</label>
          <input type="range" min="500" max="4000" step="50" value={sqft} onChange={(e) => setSqft(parseInt(e.target.value))} className="w-full accent-indigo-500" />
        </div>
        <div>
          <label className="text-sm text-gray-300 font-semibold block mb-1">Bedrooms = {bedrooms}</label>
          <input type="range" min="1" max="6" step="1" value={bedrooms} onChange={(e) => setBedrooms(parseInt(e.target.value))} className="w-full accent-indigo-500" />
        </div>
        <div>
          <label className="text-sm text-gray-300 font-semibold block mb-1">Age (years) = {age}</label>
          <input type="range" min="0" max="80" step="1" value={age} onChange={(e) => setAge(parseInt(e.target.value))} className="w-full accent-indigo-500" />
        </div>
      </div>

      <div className="font-mono text-xs sm:text-sm text-gray-300 bg-black/30 rounded-lg p-4 space-y-1 mb-4 overflow-x-auto">
        <div className="whitespace-nowrap">ŷ = {b0.toLocaleString()} + ({bSqft} × {sqft}) {sign(bBed)} ({Math.abs(bBed).toLocaleString()} × {bedrooms}) {sign(bAge)} ({Math.abs(bAge)} × {age})</div>
        <div className="text-gray-500 whitespace-nowrap">= {b0.toLocaleString()} + {(bSqft * sqft).toLocaleString()} {sign(bBed)} {Math.abs(bBed * bedrooms).toLocaleString()} {sign(bAge)} {Math.abs(bAge * age).toLocaleString()}</div>
      </div>

      <div className="mb-4">
        <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">Each feature's contribution</div>
        <div className="space-y-2">
          {[
            { label: "Base (b₀)", val: b0, color: "bg-gray-500" },
            { label: "Square feet", val: bSqft * sqft, color: "bg-indigo-500" },
            { label: "Bedrooms", val: bBed * bedrooms, color: "bg-blue-500" },
            { label: "Age", val: bAge * age, color: "bg-rose-500" },
          ].map((c) => {
            const maxAbs = Math.max(Math.abs(b0), bSqft * sqft, Math.abs(bBed * bedrooms), Math.abs(bAge * age), 1);
            const w = Math.min(100, (Math.abs(c.val) / maxAbs) * 100);
            return (
              <div key={c.label} className="flex items-center gap-3">
                <span className="text-xs text-gray-400 w-24 shrink-0">{c.label}</span>
                <div className="flex-1 h-4 rounded bg-white/5 overflow-hidden">
                  <motion.div className={`h-full ${c.val < 0 ? "bg-rose-500" : c.color}`} animate={{ width: `${w}%` }} transition={{ type: "spring", stiffness: 120, damping: 20 }} />
                </div>
                <span className={`text-xs font-mono w-24 text-right shrink-0 ${c.val < 0 ? "text-rose-400" : "text-gray-300"}`}>
                  {c.val < 0 ? "−" : "+"}${Math.abs(c.val).toLocaleString()}
                </span>
              </div>
            );
          })}
        </div>
      </div>

      <motion.div key={prediction} initial={{ scale: 0.95, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }} className="bg-emerald-900/20 border border-emerald-500/30 rounded-lg p-4 text-center">
        <span className="text-sm text-gray-400 block mb-1">Predicted Price</span>
        <span className="text-3xl font-black text-emerald-300">${Math.max(0, prediction).toLocaleString()}</span>
      </motion.div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Fit OLS on the thirty houses with any subset of features.
--------------------------------------------------------------------------- */

function FitLab() {
  const [on, setOn] = useState({ sqft: true, bedrooms: true, age: true, noise: false });
  const keys = FEATURES.filter((f) => on[f.k]).map((f) => f.k);
  const fit = useMemo(() => (keys.length ? ols(HOUSES.map((h) => keys.map((k) => h[k])), HOUSES.map((h) => h.price)) : null), [keys.join()]); // eslint-disable-line react-hooks/exhaustive-deps

  const pts = fit ? HOUSES.map((h, i) => ({ x: fit.fitted[i] / 1000, y: h.price / 1000, color: "#818cf8", r: 5 })) : [];
  const lim = [0, 520];

  return (
    <Panel tone="indigo" title="Fit a regression on thirty houses">
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        Pick which columns the model may use. The coefficients are solved exactly with the normal equation. The chart
        plots predicted price against actual price — a perfect model would put every house on the diagonal.
      </p>
      <div className="flex flex-wrap gap-2 mb-4">
        {FEATURES.map((f) => (
          <button
            key={f.k}
            onClick={() => setOn((o) => ({ ...o, [f.k]: !o[f.k] }))}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              on[f.k] ? "border-indigo-500/40 bg-indigo-500/15 text-indigo-200" : "border-white/10 bg-white/5 text-gray-500 line-through"
            }`}
          >
            {f.label}
          </button>
        ))}
      </div>
      {fit ? (
        <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-5 items-start">
          <div className="rounded-xl bg-black/40 border border-white/10 p-2 max-w-xl">
            <Scatter points={pts} x={lim} y={lim} lines={[{ a: 0, b: 1, color: "#34d399", dash: true }]} xLabel="predicted ($k)" yLabel="actual ($k)" />
          </div>
          <div className="space-y-2">
            <div className="rounded-xl bg-black/40 border border-white/10 p-3 font-mono text-xs space-y-1">
              <div className="text-gray-500">coefficients</div>
              <div className="text-gray-300">b₀ = {Math.round(fit.beta[0]).toLocaleString()}</div>
              {keys.map((k, i) => (
                <div key={k} className={fit.beta[i + 1] < 0 ? "text-rose-300" : "text-indigo-200"}>
                  {k} = {fit.beta[i + 1] >= 0 ? "+" : ""}{Math.round(fit.beta[i + 1]).toLocaleString()}
                </div>
              ))}
            </div>
            <div className="grid grid-cols-3 lg:grid-cols-1 gap-2">
              <Metric label="R²" value={fmt(fit.r2, 4)} tone="indigo" sub="share of price variance explained" />
              <Metric label="Adjusted R²" value={fmt(fit.adjR2, 4)} tone="emerald" sub="R² with a penalty per feature" />
              <Metric label="RMSE" value={`$${Math.round(fit.rmse).toLocaleString()}`} sub="typical miss" />
            </div>
          </div>
        </div>
      ) : (
        <p className="text-sm text-rose-300 m-0">Pick at least one feature.</p>
      )}
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Turn on <em>Random noise column</em> — pure random numbers with no link to price. R² still creeps up, because
        adding any column can only reduce the training error. Adjusted R² goes down: it charges for every extra feature
        and only rises if the feature earns its keep. Compare models by adjusted R² or, better, by error on held-out
        data.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Simple vs multiple: the same variable, two very different coefficients.
--------------------------------------------------------------------------- */

function HoldingConstant() {
  const simple = linfit(HOUSES.map((h) => h.bedrooms), HOUSES.map((h) => h.price));
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div className="p-5 rounded-xl border border-blue-500/25 bg-blue-500/[0.07]">
        <div className="text-sm font-semibold text-blue-400 mb-1">price ~ bedrooms (simple)</div>
        <div className="text-2xl font-bold font-mono text-blue-200 mb-2">+${Math.round(simple.b).toLocaleString()}</div>
        <p className="text-xs text-gray-300 leading-relaxed m-0">per bedroom. But houses with more bedrooms are also bigger, so this number is mostly the value of the extra space.</p>
      </div>
      <div className="p-5 rounded-xl border border-rose-500/25 bg-rose-500/[0.07]">
        <div className="text-sm font-semibold text-rose-400 mb-1">price ~ sqft + bedrooms + age (multiple)</div>
        <div className="text-2xl font-bold font-mono text-rose-200 mb-2">{B_BED < 0 ? "−" : "+"}${Math.abs(B_BED).toLocaleString()}</div>
        <p className="text-xs text-gray-300 leading-relaxed m-0">per bedroom <strong className="text-white">holding area and age fixed</strong>: carving the same space into more rooms makes each one smaller. The true value used to generate this data is −$12,000.</p>
      </div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Residual plots for four situations.
--------------------------------------------------------------------------- */

const RESID_CASES = {
  good: {
    label: "Healthy",
    gen: (x, e) => 3 + 2 * x + 1.2 * e,
    note: "A shapeless band around zero with even width. The linear model has captured the pattern; what is left is noise.",
    fix: "Nothing to fix.",
  },
  curve: {
    label: "Curved",
    gen: (x, e) => 1 + 0.6 * (x - 5) ** 2 + 0.8 * e,
    note: "Residuals form a U: the model is too high in the middle and too low at the edges. The relationship is not linear.",
    fix: "Add a squared term or a transform (log, square root), or use a non-linear model.",
  },
  funnel: {
    label: "Funnel",
    gen: (x, e) => 3 + 2 * x + 0.35 * x * e,
    note: "Residuals fan out as predictions grow: heteroscedasticity. Coefficients stay unbiased, but standard errors and p-values are wrong.",
    fix: "Model log(y), use weighted least squares, or report robust (HC) standard errors.",
  },
  outlier: {
    label: "Outlier",
    gen: (x, e) => 3 + 2 * x + 1.0 * e,
    extra: { x: 9.5, y: 5 },
    note: "One point far from the rest pulls the line toward itself, tilting every other residual.",
    fix: "Check whether it is an error. If it is real, try robust regression (Huber) and report both fits.",
  },
};

const RESID_BASE = (() => {
  const r = rng(404);
  return Array.from({ length: 50 }, (_, i) => ({ x: 0.2 + (i / 49) * 9.6, e: randn(r) }));
})();

function ResidualLab() {
  const [k, setK] = useState("good");
  const c = RESID_CASES[k];
  const data = RESID_BASE.map((p) => ({ x: p.x, y: c.gen(p.x, p.e) }));
  if (c.extra) data.push(c.extra);
  const fit = linfit(data.map((d) => d.x), data.map((d) => d.y));
  const res = data.map((d, i) => ({
    x: fit.a + fit.b * d.x,
    y: d.y - (fit.a + fit.b * d.x),
    color: c.extra && i === data.length - 1 ? "#fbbf24" : "#a78bfa",
    r: c.extra && i === data.length - 1 ? 6 : 4,
  }));
  const fx = res.map((p) => p.x);
  const xr = [Math.min(...fx) - 1, Math.max(...fx) + 1];
  const yMax = Math.max(4, ...res.map((p) => Math.abs(p.y))) * 1.1;

  return (
    <Panel tone="purple" title="Read a residual plot">
      <div className="mb-4">
        <Segmented tone="purple" value={k} onChange={setK} options={Object.entries(RESID_CASES).map(([v, x]) => ({ v, label: x.label }))} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-5 items-start">
        <div className="rounded-xl bg-black/40 border border-white/10 p-2 max-w-xl">
          <Scatter points={res} x={xr} y={[-yMax, yMax]} lines={[{ a: 0, b: 0, color: "#e5e7eb", dash: true }]} xLabel="fitted value" yLabel="residual" height={220} />
        </div>
        <div className="space-y-3">
          <p className="text-sm text-gray-300 leading-relaxed m-0">{c.note}</p>
          <p className="text-xs text-purple-200 leading-relaxed m-0"><strong>Fix:</strong> {c.fix}</p>
        </div>
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   VIF: regress each feature on the others.
--------------------------------------------------------------------------- */

function VifTable() {
  const cols = ["sqft", "bedrooms", "age"];
  const rows = cols.map((c) => {
    const others = cols.filter((o) => o !== c);
    const f = ols(HOUSES.map((h) => others.map((o) => h[o])), HOUSES.map((h) => h[c]));
    return { c, r2: f.r2, vif: 1 / (1 - f.r2) };
  });
  return (
    <div className="rounded-xl border border-white/10 bg-black/30 p-4 mb-5">
      <div className="text-xs uppercase tracking-wide text-gray-500 mb-3">VIF computed on the thirty houses</div>
      <div className="space-y-2">
        {rows.map((r) => (
          <div key={r.c} className="grid grid-cols-[72px_minmax(0,1fr)_120px] items-center gap-3">
            <span className="text-xs font-mono text-gray-300">{r.c}</span>
            <div className="h-4 rounded bg-white/5 relative overflow-hidden">
              <div className={`h-full ${r.vif > 5 ? "bg-rose-500/70" : r.vif > 2.5 ? "bg-amber-500/70" : "bg-emerald-500/70"}`} style={{ width: `${Math.min(100, (r.vif / 10) * 100)}%` }} />
              <div className="absolute top-0 bottom-0 w-px bg-rose-300" style={{ left: "50%" }} />
            </div>
            <span className="text-xs font-mono text-gray-400 text-right">VIF {fmt(r.vif, 2)} · R² {fmt(r.r2, 2)}</span>
          </div>
        ))}
      </div>
      <p className="text-[0.6875rem] text-gray-500 leading-relaxed mt-3 mb-0">
        VIF = 1 / (1 − R²ⱼ), where R²ⱼ is how well the other features predict feature j. The red tick marks 5. Area and
        bedrooms predict each other well, so their coefficients have inflated uncertainty; age is independent of both.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Dummy variables and the dummy-variable trap, solved for real.
--------------------------------------------------------------------------- */

const CITY_ROWS = [
  ["Pune", 62], ["Pune", 58], ["Pune", 65],
  ["Mumbai", 96], ["Mumbai", 104], ["Mumbai", 99],
  ["Nagpur", 41], ["Nagpur", 45], ["Nagpur", 39],
];
const LEVELS = ["Mumbai", "Nagpur", "Pune"];

function DummyLab() {
  const [dropFirst, setDropFirst] = useState(true);
  const used = dropFirst ? LEVELS.slice(1) : LEVELS;
  const X = CITY_ROWS.map(([c]) => used.map((l) => (c === l ? 1 : 0)));
  const fit = ols(X, CITY_ROWS.map(([, p]) => p));

  return (
    <Panel tone="teal" title="Encoding a category: price by city (₹ lakh)">
      <div className="mb-4">
        <Segmented
          tone="teal"
          value={dropFirst ? "drop" : "all"}
          onChange={(v) => setDropFirst(v === "drop")}
          options={[{ v: "drop", label: "drop_first=True (k − 1 columns)" }, { v: "all", label: "One column per city (k columns)" }]}
        />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="overflow-x-auto">
          <table className="w-full text-xs sm:text-sm font-mono">
            <thead>
              <tr className="text-gray-500 text-left">
                <th className="p-1.5 font-normal">city</th>
                <th className="p-1.5 font-normal">intercept</th>
                {used.map((l) => (
                  <th key={l} className="p-1.5 font-normal">is_{l.toLowerCase()}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {CITY_ROWS.filter((_, i) => i % 3 === 0).map(([c]) => (
                <tr key={c} className="border-t border-white/5">
                  <td className="p-1.5 text-gray-300">{c}</td>
                  <td className="p-1.5 text-gray-500">1</td>
                  {used.map((l) => (
                    <td key={l} className={`p-1.5 ${c === l ? "text-teal-300" : "text-gray-600"}`}>{c === l ? 1 : 0}</td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div>
          {fit ? (
            <div className="rounded-xl bg-black/40 border border-white/10 p-3 font-mono text-xs space-y-1">
              <div className="text-gray-500">fitted coefficients</div>
              <div className="text-gray-300">b₀ = {fmt(fit.beta[0], 1)} <span className="text-gray-500">← Mumbai, the baseline</span></div>
              {used.map((l, i) => (
                <div key={l} className="text-teal-200">
                  is_{l.toLowerCase()} = {fmt(fit.beta[i + 1], 1)} <span className="text-gray-500">← vs Mumbai</span>
                </div>
              ))}
            </div>
          ) : (
            <div className="rounded-xl bg-rose-500/10 border border-rose-500/30 p-3 text-sm text-rose-200">
              No unique solution. The three city columns always add up to 1 — exactly the intercept column — so XᵀX
              cannot be inverted. This is the dummy-variable trap.
            </div>
          )}
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        With k − 1 columns, the dropped level becomes the baseline absorbed by the intercept, and every other coefficient
        reads as "difference from Mumbai". Regularised models such as Ridge tolerate all k columns, which is why
        scikit-learn's OneHotEncoder keeps them by default.
      </p>
    </Panel>
  );
}

const toc = [
  { label: "From One Feature to Many", hash: "overview" },
  { label: "Live Prediction Calculator", hash: "interactive" },
  { label: "Fit It on Real Numbers", hash: "fit" },
  { label: "Holding Others Constant", hash: "holding" },
  { label: "The Normal Equation", hash: "normal-equation" },
  { label: "Assumptions & Residuals", hash: "assumptions" },
  { label: "Multicollinearity", hash: "multicollinearity" },
  { label: "Categorical Features", hash: "categorical" },
  { label: "Feature Scaling", hash: "scaling" },
  { label: "Reading statsmodels Output", hash: "statsmodels" },
];

export default function MlMultiple() {
  return (
    <GuideLayout
      title="Multiple Linear Regression"
      intro="Predicting a value from several input features at once — the workhorse model behind pricing, forecasting, and scoring systems."
      toc={toc}
    >
      <section id="overview" className="mb-14 scroll-mt-24">
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-4">
          Simple linear regression predicts <code className="text-pink-400 bg-gray-800 px-1 rounded">y</code> from one
          feature. Multiple regression extends the same idea to <code className="text-pink-400 bg-gray-800 px-1 rounded">n</code> features,
          each with its own learned weight:
        </p>
        <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-sm text-gray-200 mb-5">
          ŷ = b₀ + b₁x₁ + b₂x₂ + ... + bₙxₙ
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Still a straight line — in n dimensions" tone="indigo"><p>With two features the model is a flat plane through a 3D cloud of points; with more, a hyperplane. "Linear" means linear in the coefficients.</p></Card>
          <Card title="Fitted by least squares" tone="emerald"><p>The coefficients minimise the sum of squared residuals, Σ(yᵢ − ŷᵢ)², exactly as in <a href="#/ml/linear-regression" className="text-blue-400 hover:underline">simple regression</a>.</p></Card>
          <Card title="Each coefficient is a partial effect" tone="rose"><p>bⱼ is the change in ŷ for one more unit of xⱼ with every other feature held fixed. That phrase does a lot of work — see below.</p></Card>
        </div>
      </section>

      <section id="interactive" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Live Prediction Calculator</h2>
        <p className="text-gray-300 mb-6 max-w-3xl">
          A house-price model with 3 features, using the coefficients learned from the thirty houses in the next
          section. Adjust the sliders and watch each coefficient's contribution to the predicted price update in real
          time.
        </p>
        <PredictionCalculator />
      </section>

      <section id="fit" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Fit It on Real Numbers</h2>
        <FitLab />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-5">
          <Card title="R²" tone="indigo"><p>1 − SS<sub>residual</sub> / SS<sub>total</sub>: the share of the variance in y the model explains. 0 means no better than predicting the mean; 1 means perfect.</p></Card>
          <Card title="Adjusted R²" tone="emerald"><p>1 − (1 − R²)(n − 1)/(n − k − 1), for n rows and k features. Falls when a new feature adds less than chance would.</p></Card>
        </div>
      </section>

      <section id="holding" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Holding Others Constant</h2>
        <p className="text-gray-300 mb-5 max-w-3xl">
          The coefficient of a feature depends on which other features are in the model. Here is the bedrooms
          coefficient, fitted on the same thirty houses two ways.
        </p>
        <HoldingConstant />
        <p className="text-xs text-gray-500 mt-4 max-w-3xl leading-relaxed">
          Neither number is wrong — they answer different questions. The simple one answers "how do prices differ
          between houses with more bedrooms?"; the multiple one answers "what does one more bedroom do, for a house of
          the same size and age?". Leaving out a variable that is correlated with both a feature and the target is
          called omitted-variable bias.
        </p>
      </section>

      <section id="normal-equation" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Normal Equation</h2>
        <p className="text-gray-300 mb-4 max-w-3xl">
          With multiple features, the coefficients are found in matrix form. Instead of iterating with gradient
          descent, the exact solution can be computed directly:
        </p>
        <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-sm text-gray-200">
          β = (XᵀX)⁻¹ Xᵀy
        </div>
        <p className="text-gray-400 text-sm mt-3">
          Where <code className="text-indigo-300">X</code> is the feature matrix (one row per sample, one column per
          feature) and <code className="text-indigo-300">y</code> is the target vector. This is fast for a small number
          of features, but the matrix inversion becomes expensive as features grow into the thousands — that's when
          gradient descent takes over again. The fit panel above solves exactly this system every time you toggle a
          feature.
        </p>
      </section>

      <section id="assumptions" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Assumptions and Residuals</h2>
        <p className="text-gray-300 mb-5 max-w-3xl">
          Predictions only need the model to fit well. Trusting the coefficients, their p-values and confidence
          intervals needs four assumptions — remembered as <strong className="text-white">LINE</strong>.
        </p>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-3 mb-6">
          <Card title="L — Linearity" tone="indigo"><p>y changes linearly with each feature (after any transforms you apply).</p></Card>
          <Card title="I — Independence" tone="blue"><p>Errors are independent. Violated by time series and repeated measurements of the same person.</p></Card>
          <Card title="N — Normal errors" tone="purple"><p>Residuals roughly normal. Matters for small samples; the CLT covers large ones.</p></Card>
          <Card title="E — Equal variance" tone="rose"><p>Residual spread is the same at every level of ŷ (homoscedasticity).</p></Card>
        </div>
        <ResidualLab />
      </section>

      <section id="multicollinearity" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Multicollinearity</h2>
        <p className="text-gray-300 mb-4 max-w-3xl">
          Problems arise when two features are highly correlated with each other (e.g. "square feet" and "number of
          rooms"). The model can't tell which one deserves credit for the outcome, so coefficients become unstable
          and hard to interpret — even though predictions may still look fine.
        </p>
        <VifTable />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-rose-900/10 border border-rose-500/20 p-4 rounded-lg">
            <h4 className="text-rose-400 font-semibold mb-2 mt-0">Symptoms</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
              <li>Coefficients flip sign or swing wildly with small data changes.</li>
              <li>High R² overall, but individual coefficients look nonsensical.</li>
            </ul>
          </div>
          <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-lg">
            <h4 className="text-emerald-400 font-semibold mb-2 mt-0">Fixes</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
              <li>Check Variance Inflation Factor (VIF); drop or combine features above ~5–10.</li>
              <li>Use regularization (Ridge/Lasso) to stabilize coefficients.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="categorical" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Categorical Features</h2>
        <p className="text-gray-300 mb-5 max-w-3xl">
          Regression needs numbers, so a category like city becomes a set of 0/1 indicator (dummy) columns.
        </p>
        <DummyLab />
      </section>

      <section id="scaling" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Feature Scaling & Regularization</h2>
        <p className="text-gray-300 max-w-3xl mb-4">
          Features on very different scales (square feet in the thousands vs. bedroom count 1–6) make gradient
          descent converge slowly and skew regularization penalties. Standardizing features
          (<code className="text-indigo-300">z = (x − mean) / std</code>) before training is standard practice for
          any multi-feature linear model.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          <div className="p-4 rounded-xl border border-blue-500/25 bg-blue-500/10">
            <div className="text-sm font-semibold text-blue-300 mb-1">Ridge (L2)</div>
            <p className="text-xs text-gray-300 leading-relaxed m-0">
              Adds a penalty on the sum of squared coefficients. Shrinks them toward zero (but never exactly zero),
              which tames multicollinearity and stabilizes the model.
            </p>
          </div>
          <div className="p-4 rounded-xl border border-purple-500/25 bg-purple-500/10">
            <div className="text-sm font-semibold text-purple-300 mb-1">Lasso (L1)</div>
            <p className="text-xs text-gray-300 leading-relaxed m-0">
              Penalizes the sum of absolute coefficients. Can drive some to exactly zero — performing automatic
              feature selection by dropping useless inputs entirely.
            </p>
          </div>
        </div>

        <CodeBlock language="python" maxHeight="320px" code={`from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import StandardScaler
from sklearn.linear_model import LinearRegression, Ridge, Lasso

# Scaling belongs INSIDE the pipeline so test data is scaled
# using only the training statistics (no leakage).
model = make_pipeline(
    StandardScaler(),
    Ridge(alpha=1.0),        # or LinearRegression() / Lasso(alpha=0.1)
)
model.fit(X_train, y_train)

print("R² on test:", model.score(X_test, y_test))
print("coefficients:", model[-1].coef_)`} />
      </section>

      <section id="statsmodels" className="mb-10 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Reading statsmodels Output</h2>
        <p className="text-gray-300 mb-5 max-w-3xl">
          scikit-learn is built for prediction. When you want to interpret coefficients — their uncertainty and
          significance — use statsmodels, which reports a full inference table.
        </p>
        <CodeBlock
          language="python"
          code={`import statsmodels.formula.api as smf
from statsmodels.stats.outliers_influence import variance_inflation_factor

# C(city) creates dummy columns and drops one level automatically
model = smf.ols("price ~ sqft + bedrooms + age + C(city)", data=houses).fit()
print(model.summary())

#                  coef    std err       t    P>|t|    [0.025    0.975]
# Intercept    4.1e+04    1.6e+04    2.56   0.017     7e+03   7.4e+04
# sqft           152.3       13.9   10.96   0.000     123.7     180.9
# bedrooms    -1.4e+04    6.9e+03   -2.03   0.053    -2.8e+04    210
# age           -905.1      210.4   -4.30   0.000   -1338.3    -471.9
#
# coef     — change in price per unit, others held fixed
# P>|t|    — p-value for "this coefficient is zero"
# [0.025 0.975] — 95% confidence interval for the coefficient

model.rsquared, model.rsquared_adj
model.get_robustcov_results("HC3").summary()   # robust SEs if residuals fan out

X = houses[["sqft", "bedrooms", "age"]].assign(const=1)
{c: variance_inflation_factor(X.values, i) for i, c in enumerate(X.columns) if c != "const"}`}
        />
        <Note tone="indigo">
          The printed table is illustrative of the layout; your numbers depend on your data. Notice the bedrooms
          interval crosses zero — with correlated features, individual coefficients are often uncertain even when the
          model predicts well.
        </Note>
      </section>

      <KnowledgeCheck questions={questionsFor("ml-classic")} />
    </GuideLayout>
  );
}

import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section, Segmented } from "../components/VizKit";
import { rng, randn, fmt } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "time series", "forecasting", "trend", "seasonality", "decomposition", "moving average", "exponential smoothing",
  "Holt-Winters", "ETS", "ARIMA", "SARIMA", "stationarity", "differencing", "autocorrelation", "ACF", "lag features",
  "rolling features", "walk-forward validation", "TimeSeriesSplit", "backtesting", "seasonal naive", "Prophet",
  "LightGBM forecasting", "N-BEATS", "Temporal Fusion Transformer", "Chronos", "TimesFM", "MASE",
];

/* ---------------------------------------------------------------------------
   Five years of monthly sales: upward trend, yearly seasonality, noise. The
   last 12 months are held out and every forecast is scored against them.
--------------------------------------------------------------------------- */

const M = 12;
const N = 60;
const HOLD = 12;

const SERIES = (() => {
  const r = rng(14);
  return Array.from({ length: N }, (_, t) => {
    const trend = 100 + 1.2 * t;
    const season = 18 * Math.sin((2 * Math.PI * t) / M) + 8 * Math.cos((4 * Math.PI * t) / M);
    const noise = randn(r) * 5;
    return { t, trend, season, noise, y: trend + season + noise };
  });
})();

const TRAIN = SERIES.slice(0, N - HOLD).map((p) => p.y);
const TEST = SERIES.slice(N - HOLD).map((p) => p.y);

function holtWinters(y, h, alpha, beta, gamma) {
  const m = M;
  const mean1 = y.slice(0, m).reduce((a, b) => a + b, 0) / m;
  const mean2 = y.slice(m, 2 * m).reduce((a, b) => a + b, 0) / m;
  let level = mean1;
  let trend = (mean2 - mean1) / m;
  const season = y.slice(0, m).map((v) => v - mean1);
  for (let t = 0; t < y.length; t++) {
    const s = season[t % m];
    const prevLevel = level;
    level = alpha * (y[t] - s) + (1 - alpha) * (level + trend);
    trend = beta * (level - prevLevel) + (1 - beta) * trend;
    season[t % m] = gamma * (y[t] - level) + (1 - gamma) * s;
  }
  return Array.from({ length: h }, (_, k) => level + (k + 1) * trend + season[(y.length + k) % m]);
}

const FORECASTS = {
  naive: { label: "Naive (last value)", f: () => new Array(HOLD).fill(TRAIN.at(-1)) },
  seasonal: { label: "Seasonal naive", f: () => Array.from({ length: HOLD }, (_, k) => TRAIN[TRAIN.length - M + (k % M)]) },
  mean: { label: "Mean of last 12", f: () => new Array(HOLD).fill(TRAIN.slice(-M).reduce((a, b) => a + b, 0) / M) },
  hw: { label: "Holt–Winters", f: (a, b, g) => holtWinters(TRAIN, HOLD, a, b, g) },
};

const mae = (f) => f.reduce((s, v, i) => s + Math.abs(v - TEST[i]), 0) / HOLD;

function ForecastLab() {
  const [method, setMethod] = useState("hw");
  const [alpha, setAlpha] = useState(0.3);
  const [beta, setBeta] = useState(0.05);
  const [gamma, setGamma] = useState(0.3);
  const fc = useMemo(() => FORECASTS[method].f(alpha, beta, gamma), [method, alpha, beta, gamma]);
  const scores = useMemo(() => Object.fromEntries(Object.entries(FORECASTS).map(([k, v]) => [k, mae(v.f(alpha, beta, gamma))])), [alpha, beta, gamma]);

  const W = 380;
  const H = 190;
  const all = [...SERIES.map((p) => p.y), ...fc];
  const lo = Math.min(...all) - 5;
  const hi = Math.max(...all) + 5;
  const x = (t) => 12 + (t / (N - 1)) * (W - 24);
  const y = (v) => H - 16 - ((v - lo) / (hi - lo)) * (H - 28);
  const line = (pts) => pts.map(([t, v], i) => `${i ? "L" : "M"}${x(t).toFixed(1)},${y(v).toFixed(1)}`).join("");

  return (
    <Panel tone="indigo" title="Forecast the last 12 months — then check against what happened">
      <div className="flex flex-wrap items-center gap-3 mb-4">
        <Segmented value={method} onChange={setMethod} options={Object.entries(FORECASTS).map(([v, o]) => ({ v, label: o.label }))} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_250px] gap-5">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          <rect x={x(N - HOLD - 0.5)} y="4" width={x(N - 1) - x(N - HOLD - 0.5) + 6} height={H - 18} fill="rgba(255,255,255,0.04)" />
          <text x={x(N - HOLD) + 2} y="14" fill="#6b7280" fontSize="10">held out</text>
          <path d={line(SERIES.map((p) => [p.t, p.y]))} fill="none" stroke="#94a3b8" strokeWidth="1.8" />
          <path d={line(fc.map((v, k) => [N - HOLD + k, v]))} fill="none" stroke="#f472b6" strokeWidth="2.4" strokeDasharray="5 3" />
          <text x="12" y={H - 3} fill="#6b7280" fontSize="10">year 1</text>
          <text x={W - 12} y={H - 3} fill="#6b7280" fontSize="10" textAnchor="end">year 5</text>
        </svg>
        <div className="space-y-3">
          {method === "hw" && (
            <>
              <Slider label="α level" value={alpha} min={0.01} max={1} step={0.01} onChange={setAlpha} format={(v) => v.toFixed(2)} />
              <Slider label="β trend" value={beta} min={0} max={0.5} step={0.01} onChange={setBeta} format={(v) => v.toFixed(2)} />
              <Slider label="γ season" value={gamma} min={0} max={1} step={0.01} onChange={setGamma} format={(v) => v.toFixed(2)} />
            </>
          )}
          <div className="space-y-1">
            {Object.entries(FORECASTS).map(([k, o]) => (
              <div key={k} className={`flex justify-between text-xs font-mono ${k === method ? "text-pink-300" : "text-gray-400"}`}>
                <span>{o.label}</span>
                <span>MAE {fmt(scores[k], 1)}</span>
              </div>
            ))}
          </div>
          <Metric label="Skill vs best baseline" value={`${fmt((1 - scores[method] / Math.min(scores.naive, scores.seasonal, scores.mean)) * 100, 0)}%`} tone="indigo" sub="positive = beats every simple baseline" />
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Naive and mean forecasts are flat lines — they ignore both the trend and the yearly cycle. Seasonal naive
        ("same month last year") gets the cycle right but lags a full year of growth, and on this steadily rising
        series that costs it more than the plain naive forecast — a reminder that no baseline is safe by default.
        Holt–Winters tracks level, trend and seasonality with three smoothing weights and beats all three. Always
        report a model against simple baselines: one that cannot beat "same as last year" is not worth deploying.
      </p>
    </Panel>
  );
}

function DecompositionLab() {
  const [show, setShow] = useState("all");
  const W = 380;
  const H = 70;
  const rows = [
    { k: "y", label: "observed", c: "#94a3b8" },
    { k: "trend", label: "trend", c: "#60a5fa" },
    { k: "season", label: "seasonality", c: "#34d399" },
    { k: "noise", label: "residual", c: "#fbbf24" },
  ];
  const visible = show === "all" ? rows : rows.filter((r) => r.k === "y" || r.k === show);
  return (
    <Panel tone="emerald" title="Observed = trend + seasonality + residual">
      <div className="mb-3">
        <Segmented
          tone="emerald"
          value={show}
          onChange={setShow}
          options={[
            { v: "all", label: "All components" },
            { v: "trend", label: "Trend" },
            { v: "season", label: "Seasonality" },
            { v: "noise", label: "Residual" },
          ]}
        />
      </div>
      <div className="space-y-2">
        {visible.map((r) => {
          const vals = SERIES.map((p) => p[r.k]);
          const lo = Math.min(...vals);
          const hi = Math.max(...vals);
          const d = vals.map((v, t) => `${t ? "L" : "M"}${(8 + (t / (N - 1)) * (W - 16)).toFixed(1)},${(H - 8 - ((v - lo) / (hi - lo || 1)) * (H - 16)).toFixed(1)}`).join("");
          return (
            <div key={r.k} className="flex items-center gap-3">
              <span className="w-24 text-xs text-right" style={{ color: r.c }}>{r.label}</span>
              <svg viewBox={`0 0 ${W} ${H}`} className="flex-1 h-auto block">
                <path d={d} fill="none" stroke={r.c} strokeWidth="1.8" />
              </svg>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-3 mb-0">
        This series was built from exactly these three parts, so the decomposition is known. On real data,
        methods like STL estimate them. A residual with visible structure left in it means the model has missed
        something — a second cycle, a holiday effect, a level shift.
      </p>
    </Panel>
  );
}

export default function MlTimeSeries() {
  const toc = [
    { label: "What Makes Time Series Different", hash: "different" },
    { label: "Decomposition", hash: "decomposition" },
    { label: "Forecast Lab", hash: "lab" },
    { label: "Classical Models", hash: "classical" },
    { label: "Machine Learning Approach", hash: "ml" },
    { label: "Validating Forecasts", hash: "validation" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Time Series & Forecasting"
      intro="Data where order matters: decompose a series into trend and seasonality, forecast with baselines and Holt–Winters, turn forecasting into supervised learning with lag features, and validate without looking into the future."
      toc={toc}
    >
      <Section id="different" title="What Makes Time Series Different" lead="Rows are not independent and the order carries the information. Most of the usual machine learning habits — shuffling, random splits — break here.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Autocorrelation" tone="indigo"><p>Today looks like yesterday. That dependence is the signal a forecaster exploits — and the reason random train/test splits leak.</p></Card>
          <Card title="Trend & seasonality" tone="emerald"><p>Long-run growth plus repeating cycles (daily, weekly, yearly). Most of a forecast's accuracy comes from getting these right.</p></Card>
          <Card title="Uncertainty grows" tone="amber"><p>The further ahead, the less certain. Good forecasts come with prediction intervals, not just a line.</p></Card>
        </div>
      </Section>

      <Section id="decomposition" title="Decomposition">
        <DecompositionLab />
      </Section>

      <Section id="lab" title="Forecast Lab" lead="Every forecast is computed from the first four years only and scored on the fifth.">
        <ForecastLab />
      </Section>

      <Section id="classical" title="Classical Models">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Exponential smoothing (ETS)" tone="indigo"><p>Weighted averages that decay into the past, with optional trend and seasonal terms — Holt–Winters is the seasonal version. Fast, robust, hard to beat on a single series.</p></Card>
          <Card title="ARIMA / SARIMA" tone="purple"><p>Model the series as a function of its own past values (AR) and past errors (MA), after differencing (I) to remove trend. SARIMA adds seasonal terms. Assumes stationarity after differencing.</p></Card>
          <Card title="Stationarity" tone="amber"><p>A stationary series has constant mean and variance over time. Differencing (yₜ − yₜ₋₁) removes trend; seasonal differencing (yₜ − yₜ₋₁₂) removes a yearly cycle.</p></Card>
          <Card title="Prophet & friends" tone="emerald"><p>Additive models with trend changepoints, multiple seasonalities and holiday effects, fitted with little tuning. Good for business series with calendar effects.</p></Card>
        </div>
      </Section>

      <Section id="ml" title="Machine Learning Approach" lead="Turn forecasting into regression: predict yₜ from features built from the past. Gradient-boosted trees on lag features win many forecasting competitions, especially across many related series.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <Card title="Lags" tone="indigo"><p>yₜ₋₁, yₜ₋₇, yₜ₋₁₂… — the value at useful offsets in the past.</p></Card>
          <Card title="Rolling statistics" tone="emerald"><p>Mean, min, max and standard deviation over past windows — computed strictly from data before t.</p></Card>
          <Card title="Calendar & external" tone="amber"><p>Day of week, month, holidays, promotions, weather — known in advance for the forecast horizon.</p></Card>
        </div>
        <Note tone="indigo">
          Deep models (N-BEATS, Temporal Fusion Transformer) and pretrained time-series foundation models (such as
          Amazon's Chronos and Google's TimesFM) can forecast new series zero-shot. Benchmark them against seasonal
          naive and a tuned boosted-tree model before switching.
        </Note>
      </Section>

      <Section id="validation" title="Validating Forecasts" lead="Never shuffle. Train on the past, test on the future, and repeat at several cut-off points.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Walk-forward (backtesting)" tone="indigo"><p>Train up to month k, forecast the next h months, move k forward, repeat. Average the errors across cut-offs. See the drawing in <a href="#/ml/evaluation-metrics" className="text-blue-400 hover:underline">Evaluation Metrics</a>.</p></Card>
          <Card title="Scale-free errors" tone="emerald"><p>MASE divides the error by that of a naive forecast, so values below 1 beat the baseline and results compare across series.</p></Card>
          <Card title="Feature leakage" tone="rose"><p>A rolling mean that includes today, or a feature only known after the fact, makes backtests look far better than reality.</p></Card>
        </div>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`import pandas as pd
from statsmodels.tsa.holtwinters import ExponentialSmoothing
from sklearn.model_selection import TimeSeriesSplit
from lightgbm import LGBMRegressor

# 1) Classical: Holt–Winters on a monthly series
hw = ExponentialSmoothing(y_train, trend="add", seasonal="add", seasonal_periods=12).fit()
forecast = hw.forecast(12)

# 2) ML: lag + rolling features, walk-forward validation
df = pd.DataFrame({"y": y})
for lag in (1, 2, 3, 12):
    df[f"lag_{lag}"] = df["y"].shift(lag)
df["roll_mean_3"] = df["y"].shift(1).rolling(3).mean()     # shift(1): past only
df["month"] = df.index.month
df = df.dropna()

X, target = df.drop(columns="y"), df["y"]
for train_idx, test_idx in TimeSeriesSplit(n_splits=5, test_size=12).split(X):
    model = LGBMRegressor(n_estimators=300, learning_rate=0.05)
    model.fit(X.iloc[train_idx], target.iloc[train_idx])
    print((model.predict(X.iloc[test_idx]) - target.iloc[test_idx]).abs().mean())`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("ml-timeseries")} />
    </GuideLayout>
  );
}

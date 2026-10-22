import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Segmented, Metric, Histogram, Card, Note, Section, BoxPlot } from "../components/VizKit";
import { rng, randn, mean, median, mode, std, quantile, skewness, histogram, fmt } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "data analysis", "exploratory data analysis", "EDA", "univariate analysis", "mean", "median", "mode",
  "standard deviation", "variance", "IQR", "interquartile range", "skewness", "right skewed", "left skewed",
  "bimodal", "histogram", "box plot", "distribution", "categorical variable", "numerical variable", "ordinal",
  "nominal", "segmented analysis", "describe", "value_counts",
];

/* ---------------------------------------------------------------------------
   Variable types: tap a column to see how it should be treated.
--------------------------------------------------------------------------- */

const COLUMNS = [
  { c: "age", type: "Numerical · continuous", tone: "text-emerald-300", why: "Any value in a range. Averages and histograms make sense." },
  { c: "number_of_children", type: "Numerical · discrete", tone: "text-emerald-300", why: "Counts: whole numbers only. A mean of 1.7 is fine as a summary, never as a prediction." },
  { c: "city", type: "Categorical · nominal", tone: "text-blue-300", why: "Labels with no order. Count them; never average them. One-hot encode for models." },
  { c: "rating (1–5 stars)", type: "Categorical · ordinal", tone: "text-purple-300", why: "Ordered, but the gap from 1→2 need not equal 4→5. The median is safer than the mean." },
  { c: "pin_code", type: "Categorical · nominal", tone: "text-blue-300", why: "Looks numeric, is not. The average pin code is meaningless — a classic trap." },
  { c: "is_premium", type: "Categorical · binary", tone: "text-blue-300", why: "Two values. Its mean is the proportion of premium customers — handy." },
  { c: "income", type: "Numerical · continuous", tone: "text-emerald-300", why: "Usually right-skewed. Report the median; consider a log transform for models." },
  { c: "education_level", type: "Categorical · ordinal", tone: "text-purple-300", why: "School < graduate < postgraduate. Encode with the order preserved." },
];

function VariableTypes() {
  const [open, setOpen] = useState({});
  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3">
      {COLUMNS.map((col) => (
        <button
          key={col.c}
          onClick={() => setOpen((o) => ({ ...o, [col.c]: !o[col.c] }))}
          className="text-left p-4 rounded-xl border border-white/10 bg-white/5 hover:bg-white/[0.08] transition-colors"
        >
          <div className="font-mono text-sm text-white mb-1">{col.c}</div>
          {open[col.c] ? (
            <>
              <div className={`text-xs font-semibold mb-1 ${col.tone}`}>{col.type}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{col.why}</div>
            </>
          ) : (
            <div className="text-xs text-gray-500">Tap to classify →</div>
          )}
        </button>
      ))}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Centre and spread: one salary you control.
--------------------------------------------------------------------------- */

const SALARIES = [32, 35, 36, 38, 40, 40, 42, 45, 47, 50, 52, 55, 58, 62];

function CentreSpread() {
  const [top, setTop] = useState(70);
  const data = [...SALARIES, top];
  const mu = mean(data);
  const med = median(data);
  const q1 = quantile(data, 0.25);
  const q3 = quantile(data, 0.75);
  const axisMax = Math.max(100, top * 1.05);
  const W = 360;
  const sx = (v) => 12 + (v / axisMax) * (W - 24);

  return (
    <Panel tone="indigo" title="Move one salary and watch the summaries react">
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        Fifteen salaries in a team, in thousands per month. Fourteen are fixed. The slider sets the fifteenth — the
        manager's.
      </p>
      <svg viewBox={`0 0 ${W} 92`} className="w-full h-auto block mb-3">
        <line x1="12" y1="50" x2={W - 12} y2="50" stroke="rgba(255,255,255,0.15)" />
        {data.map((v, i) => (
          <circle key={i} cx={sx(v)} cy={50 - (data.slice(0, i).filter((x) => x === v).length * 9)} r="5" fill={i === data.length - 1 ? "#fbbf24" : "#64748b"} />
        ))}
        <line x1={sx(med)} y1="18" x2={sx(med)} y2="62" stroke="#60a5fa" strokeWidth="2" />
        <text x={sx(med)} y="14" fill="#60a5fa" fontSize="11" textAnchor="middle">median</text>
        <line x1={sx(mu)} y1="30" x2={sx(mu)} y2="62" stroke="#f472b6" strokeWidth="2" strokeDasharray="4 3" />
        <text x={sx(mu)} y="76" fill="#f472b6" fontSize="11" textAnchor="middle">mean</text>
        <text x="12" y="90" fill="#6b7280" fontSize="11">0</text>
        <text x={W - 12} y="90" fill="#6b7280" fontSize="11" textAnchor="end">{Math.round(axisMax)}k</text>
      </svg>
      <Slider label="Manager's salary (k)" value={top} min={65} max={1000} step={5} onChange={setTop} tone="amber" />
      <div className="grid grid-cols-3 sm:grid-cols-6 gap-2 mt-4">
        <Metric label="Mean" value={fmt(mu, 1)} tone="rose" />
        <Metric label="Median" value={fmt(med, 1)} tone="blue" />
        <Metric label="Mode" value={mode(data)} />
        <Metric label="Std dev" value={fmt(std(data), 1)} tone="rose" />
        <Metric label="IQR" value={fmt(q3 - q1, 1)} tone="blue" />
        <Metric label="Range" value={fmt(Math.max(...data) - Math.min(...data), 0)} tone="rose" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Push the slider to 1000. The median and IQR (blue) do not move at all; the mean, standard deviation and range
        (pink) chase the one extreme value. For skewed data such as salaries, prices or waiting times, report the
        median and IQR.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Distribution shapes, with a live box plot and a bin-width slider.
--------------------------------------------------------------------------- */

const SHAPES = {
  normal: { label: "Normal", range: [10, 90], gen: (r) => 50 + 10 * randn(r), note: "Symmetric bell. Mean ≈ median, skew ≈ 0. Heights, measurement error, many averages." },
  right: { label: "Right-skewed", range: [0, 120], gen: (r) => Math.exp(3.4 + 0.5 * randn(r)), note: "Long tail to the right: mean > median. Income, house prices, time on site. A log transform often makes it symmetric." },
  left: { label: "Left-skewed", range: [20, 100], gen: (r) => Math.max(0, 100 - Math.exp(2.6 + 0.6 * randn(r))), note: "Long tail to the left: mean < median. Scores on an easy exam, age at retirement." },
  bimodal: { label: "Bimodal", range: [10, 100], gen: (r) => (r() < 0.5 ? 35 + 6 * randn(r) : 70 + 7 * randn(r)), note: "Two peaks — usually two groups mixed together. The mean falls in the valley where almost nobody is. Split the groups." },
  uniform: { label: "Uniform", range: [10, 90], gen: (r) => 20 + 60 * r(), note: "Every value equally likely. Random IDs, arrival minute within an hour." },
};

function DistributionLab() {
  const [shape, setShape] = useState("right");
  const [bins, setBins] = useState(24);
  const s = SHAPES[shape];
  const data = useMemo(() => {
    const r = rng(99);
    return Array.from({ length: 600 }, () => s.gen(r)).filter((v) => v >= s.range[0] && v <= s.range[1]);
  }, [shape]); // eslint-disable-line react-hooks/exhaustive-deps
  const counts = histogram(data, bins, s.range[0], s.range[1]);
  const mu = mean(data);
  const med = median(data);

  return (
    <Panel tone="purple" title="The shape of a distribution">
      <div className="mb-4">
        <Segmented tone="purple" value={shape} onChange={setShape} options={Object.entries(SHAPES).map(([v, x]) => ({ v, label: x.label }))} />
      </div>
      <div className="rounded-xl bg-black/40 border border-white/10 p-3 mb-3">
        <Histogram
          counts={counts}
          min={s.range[0]}
          max={s.range[1]}
          color="#a78bfa"
          marks={[
            { x: mu, color: "#f472b6", label: "mean" },
            { x: med, color: "#fbbf24", dash: true, label: "median" },
          ]}
          tickFormat={(v) => v.toFixed(0)}
        />
        <BoxPlot data={data} min={s.range[0]} max={s.range[1]} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-4 items-end mb-3">
        <Slider tone="purple" label="Number of bins" value={bins} min={4} max={60} onChange={setBins} />
        <div className="grid grid-cols-4 gap-2">
          <Metric label="Mean" value={fmt(mu, 1)} tone="rose" />
          <Metric label="Median" value={fmt(med, 1)} tone="amber" />
          <Metric label="SD" value={fmt(std(data), 1)} />
          <Metric label="Skew" value={fmt(skewness(data), 2)} tone="purple" />
        </div>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed m-0">{s.note}</p>
      <p className="text-xs text-gray-500 leading-relaxed mt-2 mb-0">
        Try 4 bins on the bimodal data: the two peaks vanish. Bin width changes the story a histogram tells, so try a
        few before concluding anything. The box plot underneath never changes with bins — but it also cannot show two
        peaks.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Segmented univariate analysis: one metric, split by a category.
--------------------------------------------------------------------------- */

const ORDERS = (() => {
  const r = rng(5);
  const cities = [
    { c: "Mumbai", n: 180, mu: 7.1 },
    { c: "Delhi", n: 150, mu: 6.9 },
    { c: "Pune", n: 90, mu: 6.7 },
    { c: "Jaipur", n: 60, mu: 6.4 },
  ];
  return cities.map((x) => ({ ...x, values: Array.from({ length: x.n }, () => Math.exp(x.mu + 0.55 * randn(r))) }));
})();

function SegmentLab() {
  const [stat, setStat] = useState("median");
  const f = stat === "mean" ? mean : median;
  const all = ORDERS.flatMap((o) => o.values);
  const overall = f(all);
  const bars = ORDERS.map((o) => ({ c: o.c, n: o.n, v: f(o.values) }));
  const maxV = Math.max(...bars.map((b) => b.v), overall) * 1.1;

  return (
    <Panel tone="teal" title="One number hides four stories">
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        Order values (₹) across four cities. The overall figure is the one that usually gets reported.
      </p>
      <div className="mb-4">
        <Segmented tone="teal" value={stat} onChange={setStat} options={[{ v: "median", label: "Median order" }, { v: "mean", label: "Mean order" }]} />
      </div>
      <div className="space-y-2 mb-4">
        {bars.map((b) => (
          <div key={b.c} className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-16 shrink-0">{b.c}</span>
            <div className="flex-1 h-5 rounded bg-white/5 relative overflow-hidden">
              <div className="h-full bg-teal-500/60 rounded" style={{ width: `${(b.v / maxV) * 100}%`, transition: "width 400ms" }} />
              <div className="absolute top-0 bottom-0 w-0.5 bg-pink-400" style={{ left: `${(overall / maxV) * 100}%` }} />
            </div>
            <span className="text-xs font-mono text-gray-300 w-20 text-right shrink-0">₹{Math.round(b.v).toLocaleString()}</span>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        Pink line: overall {stat} ₹{Math.round(overall).toLocaleString()}. Mumbai's typical order is about twice
        Jaipur's; a single average would steer a pricing decision wrong in both. Switch to mean: every bar rises,
        because order values are right-skewed.
      </p>
    </Panel>
  );
}

export default function DataAnalysis() {
  const toc = [
    { label: "What Data Analysis Is", hash: "what" },
    { label: "Types of Variables", hash: "types" },
    { label: "Centre & Spread", hash: "centre" },
    { label: "Shape of a Distribution", hash: "shape" },
    { label: "Categorical Columns", hash: "categorical" },
    { label: "Segmented Analysis", hash: "segmented" },
    { label: "EDA Checklist", hash: "checklist" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Data Analysis (EDA)"
      intro="Exploratory data analysis is looking before you model: what each column contains, how it is distributed, and what surprises are hiding in it."
      toc={toc}
    >
      <Section
        id="what"
        title="What Data Analysis Is"
        lead="EDA is a conversation with the data. You summarise and plot it to find errors, understand its shape, and form the questions a model — or a simple chart — can answer."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Univariate" tone="indigo"><p>One column at a time: its centre, spread, shape and oddities. This page.</p></Card>
          <Card title="Bivariate" tone="blue"><p>Two columns together: does one move with the other? See <a href="#/ml/bivariate-analysis" className="text-blue-400 hover:underline">Bivariate Analysis</a>.</p></Card>
          <Card title="Multivariate" tone="purple"><p>Many columns at once: correlation matrices, pair plots, and eventually the model itself.</p></Card>
        </div>
      </Section>

      <Section id="types" title="Types of Variables" lead="The type decides which summaries and charts are valid. Tap each column name.">
        <VariableTypes />
      </Section>

      <Section
        id="centre"
        title="Centre and Spread"
        lead="Two questions describe any numerical column: where is the typical value, and how far do values wander from it?"
      >
        <CentreSpread />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card title="Measures of centre" tone="blue">
            <p><strong className="text-white">Mean</strong> — the sum divided by the count. Uses every value, so one extreme value moves it.</p>
            <p><strong className="text-white">Median</strong> — the middle value when sorted. Robust to extremes.</p>
            <p><strong className="text-white">Mode</strong> — the most frequent value. The only one that works for categories.</p>
          </Card>
          <Card title="Measures of spread" tone="rose">
            <p><strong className="text-white">Variance</strong> — the average squared distance from the mean. <strong className="text-white">Standard deviation</strong> is its square root, back in the original units.</p>
            <p><strong className="text-white">IQR</strong> — Q3 − Q1, the range of the middle 50%. Robust.</p>
            <p><strong className="text-white">Range</strong> — max − min. Decided entirely by the two most extreme values.</p>
          </Card>
        </div>
      </Section>

      <Section id="shape" title="Shape of a Distribution" lead="A histogram shows the shape; a box plot summarises it in five numbers. Use both.">
        <DistributionLab />
        <div className="mt-5">
          <Note tone="indigo">
            Quick skew test without a chart: if the mean is well above the median, the data is right-skewed; well
            below, left-skewed. Skewness above about +1 or below −1 is strong enough to consider a transform.
          </Note>
        </div>
      </Section>

      <Section id="categorical" title="Categorical Columns" lead="Categories are summarised with counts and proportions, and charted with bars, not histograms.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Frequency table" tone="blue"><p><span className="font-mono">value_counts(normalize=True)</span> gives the share of each category. Check it sums to 100% — missing values are silently excluded.</p></Card>
          <Card title="Rare categories" tone="amber"><p>Categories with a handful of rows add noise and break encoders on new data. Group anything under 1–2% into "Other".</p></Card>
          <Card title="Cardinality" tone="purple"><p>A column with thousands of unique values (user_id, email) is an identifier, not a feature. Drop it or derive something from it.</p></Card>
        </div>
      </Section>

      <Section
        id="segmented"
        title="Segmented Univariate Analysis"
        lead="Compute the same summary separately for each group. It is the simplest analysis there is, and it regularly overturns conclusions drawn from the overall number."
      >
        <SegmentLab />
      </Section>

      <Section id="checklist" title="An EDA Checklist">
        <ol className="space-y-2 text-sm text-gray-300 list-decimal pl-5 max-w-3xl">
          <li>Shape of the table: rows, columns, types, memory. Is the grain what you think (one row per order, or per item)?</li>
          <li>Missing values per column, and whether missingness clusters in certain rows or dates.</li>
          <li>For each numerical column: min, max, mean, median, SD, skew — and a histogram.</li>
          <li>For each categorical column: number of categories, top values, rare values, spelling variants.</li>
          <li>Obvious errors: negative ages, future dates, totals that do not add up.</li>
          <li>The target: its distribution, and for classification the class balance.</li>
          <li>Segment the key metrics by the most important categories.</li>
          <li>Write down three things that surprised you. Those become features, cleaning rules or questions for the data owner.</li>
        </ol>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`import pandas as pd
import matplotlib.pyplot as plt

df = pd.read_csv("orders.csv", parse_dates=["created_at"])

df.info()                                   # types, non-null counts, memory
df.describe(percentiles=[.25, .5, .75]).T   # numerical summary, one row per column
df.isna().mean().sort_values(ascending=False)   # share missing per column

df["order_value"].skew()                    # > 1: strongly right-skewed
df["city"].value_counts(normalize=True)     # categorical frequencies

fig, (a, b) = plt.subplots(1, 2, figsize=(10, 3))
df["order_value"].plot.hist(bins=40, ax=a)
df.boxplot(column="order_value", by="city", ax=b)   # segmented view
plt.show()

# Segmented summary: the same statistic, per group
df.groupby("city")["order_value"].agg(["count", "median", "mean", "std"])

# A full automated profile report, useful as a first pass
# pip install ydata-profiling
from ydata_profiling import ProfileReport
ProfileReport(df, minimal=True).to_file("orders_profile.html")`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("data-prep")} />
    </GuideLayout>
  );
}

import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Segmented, Metric, Card, Note, Section, Scatter, BoxPlot } from "../components/VizKit";
import { rng, randn, mean, variance, pearson, spearman, linfit, chi2Cdf, fCdf, fmt, fmtP } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "bivariate analysis", "bivariant analysis", "correlation", "Pearson correlation", "Spearman correlation",
  "scatter plot", "Anscombe's quartet", "correlation vs causation", "confounding variable", "partial correlation",
  "crosstab", "contingency table", "chi-square test", "Cramér's V", "ANOVA", "box plot by group",
  "correlation matrix", "heatmap", "multicollinearity",
];

/* ---------------------------------------------------------------------------
   Correlation explorer: a target ρ, plus two ways to fool Pearson's r.
--------------------------------------------------------------------------- */

const BASE = (() => {
  const r = rng(8);
  return Array.from({ length: 120 }, () => [randn(r), randn(r)]);
})();

function CorrelationLab() {
  const [rho, setRho] = useState(0.6);
  const [mode, setMode] = useState("linear");
  const [outlier, setOutlier] = useState(false);

  const pts = useMemo(() => {
    const p = BASE.map(([x, e]) => ({
      x,
      y: mode === "linear" ? rho * x + Math.sqrt(1 - rho * rho) * e : x * x - 1 + 0.3 * e,
    }));
    if (outlier) p.push({ x: 4, y: mode === "linear" ? (rho >= 0 ? -4 : 4) : -1.8, color: "#fbbf24", r: 6, o: 1 });
    return p;
  }, [rho, mode, outlier]);

  const xs = pts.map((p) => p.x);
  const ys = pts.map((p) => p.y);
  const r = pearson(xs, ys);
  const s = spearman(xs, ys);
  const fit = linfit(xs, ys);
  const yDom = mode === "linear" ? [-4.5, 4.5] : [-2.5, 9];

  return (
    <Panel tone="indigo" title="Correlation explorer">
      <div className="flex flex-wrap gap-3 mb-4">
        <Segmented value={mode} onChange={setMode} options={[{ v: "linear", label: "Straight-line pattern" }, { v: "curve", label: "U-shaped pattern" }]} />
        <Segmented value={outlier ? "on" : "off"} onChange={(v) => setOutlier(v === "on")} options={[{ v: "off", label: "No outlier" }, { v: "on", label: "Add one outlier" }]} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px] gap-5 items-start">
        <div className="rounded-xl bg-black/40 border border-white/10 p-2 max-w-xl">
          <Scatter points={pts} x={[-4.5, 4.5]} y={yDom} lines={[{ ...fit, color: "#f472b6" }]} xLabel="x" yLabel="y" />
        </div>
        <div className="space-y-3">
          {mode === "linear" && (
            <Slider label="Built-in correlation ρ" value={rho} min={-1} max={1} step={0.05} onChange={setRho} format={(v) => v.toFixed(2)} />
          )}
          <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
            <Metric label="Pearson r" value={fmt(r, 3)} tone="indigo" sub="strength of a straight-line relationship" />
            <Metric label="Spearman ρ" value={fmt(s, 3)} tone="emerald" sub="strength of a monotonic (ranked) relationship" />
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        {mode === "curve"
          ? "y is almost completely determined by x, yet Pearson's r is near zero: the left half slopes down, the right half up, and they cancel. A correlation near 0 means no straight-line relationship — not no relationship. Always look at the scatter plot."
          : outlier
            ? "One amber point out of 121 drags Pearson's r a long way, because it squares distances from the mean. Spearman works on ranks, so the outlier is just 'the largest x' and moves it far less."
            : "Slide ρ. The pink least-squares line tilts with it. At ρ = 0.3 the cloud barely looks related — moderate correlations are much weaker to the eye than their numbers suggest."}
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Anscombe's quartet (Anscombe, 1973): identical statistics, different data.
--------------------------------------------------------------------------- */

const X123 = [10, 8, 13, 9, 11, 14, 6, 4, 12, 7, 5];
const ANSCOMBE = {
  I: { x: X123, y: [8.04, 6.95, 7.58, 8.81, 8.33, 9.96, 7.24, 4.26, 10.84, 4.82, 5.68], note: "What the statistics suggest: a noisy straight-line relationship. The line is a fair summary." },
  II: { x: X123, y: [9.14, 8.14, 8.74, 8.77, 9.26, 8.1, 6.13, 3.1, 9.13, 7.26, 4.74], note: "A smooth curve. A straight line is the wrong model, however good r looks." },
  III: { x: X123, y: [7.46, 6.77, 12.74, 7.11, 7.81, 8.84, 6.08, 5.39, 8.15, 6.42, 5.73], note: "A perfect line — except one outlier, which tilts the fitted line and lowers r." },
  IV: { x: [8, 8, 8, 8, 8, 8, 8, 19, 8, 8, 8], y: [6.58, 5.76, 7.71, 8.84, 8.47, 7.04, 5.25, 12.5, 5.56, 7.91, 6.89], note: "No relationship at all: x is constant except for one point, which alone creates the 'correlation'." },
};

function Anscombe() {
  const [k, setK] = useState("I");
  const d = ANSCOMBE[k];
  const fit = linfit(d.x, d.y);
  return (
    <Panel tone="purple" title="Anscombe's quartet — same numbers, different stories">
      <div className="mb-4">
        <Segmented tone="purple" value={k} onChange={setK} options={Object.keys(ANSCOMBE).map((v) => ({ v, label: `Dataset ${v}` }))} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px] gap-5 items-start">
        <div className="rounded-xl bg-black/40 border border-white/10 p-2 max-w-xl">
          <Scatter points={d.x.map((x, i) => ({ x, y: d.y[i], color: "#a78bfa", r: 5 }))} x={[2, 20]} y={[2, 14]} lines={[{ ...fit, color: "#f472b6" }]} />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
          <Metric label="Mean x · mean y" value={`${fmt(mean(d.x), 1)} · ${fmt(mean(d.y), 2)}`} />
          <Metric label="Variance x · y" value={`${fmt(variance(d.x), 1)} · ${fmt(variance(d.y), 2)}`} />
          <Metric label="Pearson r" value={fmt(pearson(d.x, d.y), 3)} tone="purple" />
          <Metric label="Fitted line" value={`${fmt(fit.a, 2)} + ${fmt(fit.b, 3)}x`} tone="rose" />
        </div>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed mt-4 mb-0">{d.note}</p>
      <p className="text-xs text-gray-500 leading-relaxed mt-2 mb-0">
        Switch datasets: the numbers on the right stay the same to two decimal places while the pictures change
        completely. Statistician Francis Anscombe built these in 1973 to make exactly this point — plot before you
        summarise.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Confounding: ice cream and drownings both follow temperature.
--------------------------------------------------------------------------- */

const DAYS = (() => {
  const r = rng(31);
  return Array.from({ length: 90 }, () => {
    const temp = 15 + 25 * r();
    return { temp, ice: 20 + 3 * temp + 8 * randn(r), drown: 0.25 * temp + 1.2 * randn(r) };
  });
})();

const heat = (t) => {
  const f = (t - 15) / 25;
  const a = [96, 165, 250];
  const b = [248, 113, 113];
  const c = a.map((v, i) => Math.round(v + (b[i] - v) * f));
  return `rgb(${c[0]},${c[1]},${c[2]})`;
};

function Confounder() {
  const [control, setControl] = useState(false);
  const temps = DAYS.map((d) => d.temp);
  const fitIce = linfit(temps, DAYS.map((d) => d.ice));
  const fitDrown = linfit(temps, DAYS.map((d) => d.drown));
  const pts = DAYS.map((d) =>
    control
      ? { x: d.ice - (fitIce.a + fitIce.b * d.temp), y: d.drown - (fitDrown.a + fitDrown.b * d.temp), color: heat(d.temp) }
      : { x: d.ice, y: d.drown, color: heat(d.temp) },
  );
  const r = pearson(pts.map((p) => p.x), pts.map((p) => p.y));
  const fit = linfit(pts.map((p) => p.x), pts.map((p) => p.y));

  return (
    <Panel tone="rose" title="Ice cream sales vs drownings">
      <div className="mb-4">
        <Segmented tone="rose" value={control ? "on" : "off"} onChange={(v) => setControl(v === "on")} options={[{ v: "off", label: "Raw data" }, { v: "on", label: "Remove temperature's effect" }]} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px] gap-5 items-start">
        <div className="rounded-xl bg-black/40 border border-white/10 p-2 max-w-xl">
          <Scatter
            points={pts}
            x={control ? [-25, 25] : [40, 150]}
            y={control ? [-4, 4] : [0, 14]}
            lines={[{ ...fit, color: "#f472b6" }]}
            xLabel={control ? "ice cream (unexplained by temp)" : "ice cream sales"}
            yLabel={control ? "drownings (unexplained)" : "drownings"}
          />
        </div>
        <div className="space-y-2">
          <Metric label="Pearson r" value={fmt(r, 2)} tone={Math.abs(r) > 0.3 ? "rose" : "emerald"} />
          <div className="text-xs text-gray-500 leading-relaxed">Colour is temperature: blue 15°C → red 40°C.</div>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        {control
          ? "Regress each variable on temperature and correlate what is left over. The relationship vanishes: temperature was driving both. This is partial correlation, the simplest way to control for a confounder."
          : "90 summer days. A strong correlation — and the colours already give the game away: hot days sit top-right, cool days bottom-left. Banning ice cream would not save swimmers."}
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Categorical vs numerical: three couriers, one-way ANOVA.
--------------------------------------------------------------------------- */

const Z3 = (() => {
  const r = rng(12);
  return [0, 1, 2].map(() => Array.from({ length: 25 }, () => randn(r)));
})();

function GroupsLab() {
  const [gap, setGap] = useState(4);
  const [noise, setNoise] = useState(8);
  const names = ["Courier A", "Courier B", "Courier C"];
  const groups = Z3.map((zs, g) => zs.map((z) => 48 + (g - 1) * gap + noise * z));
  const all = groups.flat();
  const grand = mean(all);
  const ssb = groups.reduce((a, g) => a + g.length * (mean(g) - grand) ** 2, 0);
  const ssw = groups.reduce((a, g) => a + g.reduce((b, v) => b + (v - mean(g)) ** 2, 0), 0);
  const dfb = 2;
  const dfw = all.length - 3;
  const F = ssb / dfb / (ssw / dfw);
  const p = 1 - fCdf(F, dfb, dfw);

  return (
    <Panel tone="teal" title="Delivery time by courier — do the groups really differ?">
      <div className="space-y-1 mb-4">
        {groups.map((g, i) => (
          <div key={i} className="grid grid-cols-[76px_minmax(0,1fr)_56px] items-center gap-2">
            <span className="text-xs text-gray-400">{names[i]}</span>
            <BoxPlot data={g} min={0} max={100} labels={false} color={["#2dd4bf", "#60a5fa", "#a78bfa"][i]} />
            <span className="text-xs font-mono text-gray-300 text-right">{fmt(mean(g), 1)}h</span>
          </div>
        ))}
        <div className="grid grid-cols-[76px_minmax(0,1fr)_56px] gap-2 text-[0.6875rem] text-gray-600">
          <span />
          <span className="flex justify-between"><span>0h</span><span>50h</span><span>100h</span></span>
          <span className="text-right">mean</span>
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Slider tone="teal" label="Gap between courier averages" value={gap} min={0} max={15} step={0.5} onChange={setGap} format={(v) => `${v}h`} />
        <Slider tone="teal" label="Spread within each courier" value={noise} min={2} max={20} step={0.5} onChange={setNoise} format={(v) => `${v}h`} />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Metric label="F statistic" value={fmt(F, 2)} tone="teal" sub="between ÷ within variance" />
        <Metric label="p-value" value={fmtP(p)} tone={p < 0.05 ? "emerald" : "rose"} />
        <Metric label="Verdict (α = 0.05)" value={p < 0.05 ? "differ" : "can't tell"} tone={p < 0.05 ? "emerald" : "rose"} />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        The same 4-hour gap is convincing when each courier is consistent and invisible when each is erratic. ANOVA
        compares the spread between group averages with the spread inside the groups. For two groups use a t-test —
        see <a href="#/ml/hypothesis-testing" className="text-blue-400 hover:underline">Hypothesis Testing</a>.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Categorical vs categorical: plan × churn, chi-square test of independence.
--------------------------------------------------------------------------- */

function CrosstabLab() {
  const [free, setFree] = useState(24);
  const [pro, setPro] = useState(15);
  const nF = 400;
  const nP = 200;
  const obs = [
    [Math.round((nF * free) / 100), nF - Math.round((nF * free) / 100)],
    [Math.round((nP * pro) / 100), nP - Math.round((nP * pro) / 100)],
  ];
  const n = nF + nP;
  const rowT = obs.map((r) => r[0] + r[1]);
  const colT = [obs[0][0] + obs[1][0], obs[0][1] + obs[1][1]];
  const exp = obs.map((r, i) => r.map((_, j) => (rowT[i] * colT[j]) / n));
  const chi2 = obs.reduce((a, r, i) => a + r.reduce((b, o, j) => b + (o - exp[i][j]) ** 2 / exp[i][j], 0), 0);
  const p = 1 - chi2Cdf(chi2, 1);
  const V = Math.sqrt(chi2 / n);
  const rows = ["Free", "Pro"];

  return (
    <Panel tone="amber" title="Plan vs churn — are they related?">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Slider tone="amber" label="Free plan churn rate" value={free} min={5} max={50} onChange={setFree} format={(v) => `${v}%`} />
        <Slider tone="amber" label="Pro plan churn rate" value={pro} min={5} max={50} onChange={setPro} format={(v) => `${v}%`} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-4">
        <div className="overflow-x-auto">
          <table className="w-full text-sm font-mono">
            <thead>
              <tr className="text-gray-500 text-left">
                <th className="p-2 font-normal">observed (expected)</th>
                <th className="p-2 font-normal">churned</th>
                <th className="p-2 font-normal">stayed</th>
              </tr>
            </thead>
            <tbody>
              {obs.map((r, i) => (
                <tr key={i} className="border-t border-white/10">
                  <td className="p-2 text-gray-400">{rows[i]} ({rowT[i]})</td>
                  {r.map((o, j) => (
                    <td key={j} className="p-2 text-gray-200">
                      {o} <span className="text-gray-500">({fmt(exp[i][j], 0)})</span>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="space-y-2">
          {obs.map((r, i) => (
            <div key={i}>
              <div className="text-xs text-gray-400 mb-1">{rows[i]}</div>
              <div className="flex h-6 rounded overflow-hidden">
                <div className="bg-rose-500/70 flex items-center justify-center text-[0.6875rem] text-white" style={{ width: `${(r[0] / rowT[i]) * 100}%`, transition: "width 300ms" }}>
                  {Math.round((r[0] / rowT[i]) * 100)}%
                </div>
                <div className="bg-slate-600/70 flex-1" />
              </div>
            </div>
          ))}
          <div className="text-[0.6875rem] text-gray-500">100% bars: share of each plan that churned.</div>
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Metric label="χ² (df = 1)" value={fmt(chi2, 2)} tone="amber" />
        <Metric label="p-value" value={fmtP(p)} tone={p < 0.05 ? "emerald" : "rose"} />
        <Metric label="Cramér's V" value={fmt(V, 3)} sub="0 = unrelated, 1 = fully" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        The expected counts in brackets are what you would see if plan and churn were unrelated. χ² adds up how far
        each observed cell is from that. Set both rates equal and it drops to about zero. A tiny p-value with a small
        Cramér's V means "real but weak" — with enough rows almost any difference becomes significant.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Correlation matrix for five house features.
--------------------------------------------------------------------------- */

const HOUSE = (() => {
  const r = rng(77);
  const rows = Array.from({ length: 200 }, () => {
    const area = 1400 + 400 * randn(r);
    const bedrooms = Math.max(1, Math.round(area / 450 + 0.6 * randn(r)));
    const age = 40 * r();
    const distance = 2 + 28 * r();
    const price = 0.06 * area - 0.4 * age - 0.9 * distance + 8 * randn(r);
    return { area, bedrooms, age, distance, price };
  });
  const cols = ["area", "bedrooms", "age", "distance", "price"];
  const m = cols.map((a) => cols.map((b) => pearson(rows.map((x) => x[a]), rows.map((x) => x[b]))));
  return { cols, m };
})();

function Heatmap() {
  const { cols, m } = HOUSE;
  const cell = (v) => {
    const a = Math.min(1, Math.abs(v));
    return v >= 0 ? `rgba(251,113,133,${0.08 + a * 0.75})` : `rgba(96,165,250,${0.08 + a * 0.75})`;
  };
  return (
    <Panel tone="blue" title="Correlation matrix — every pair at once">
      <div className="overflow-x-auto">
        <table className="text-xs sm:text-sm font-mono border-separate" style={{ borderSpacing: 3 }}>
          <thead>
            <tr>
              <th />
              {cols.map((c) => (
                <th key={c} className="font-normal text-gray-500 px-1 pb-1">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {cols.map((a, i) => (
              <tr key={a}>
                <td className="text-gray-500 pr-2 text-right">{a}</td>
                {cols.map((b, j) => (
                  <td key={b} className="w-14 h-11 text-center rounded-md text-gray-100" style={{ background: cell(m[i][j]) }}>
                    {m[i][j].toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Rose is positive, blue negative, pale is near zero. Read the price row for candidate features: area helps,
        distance and age hurt. Then read the rest for trouble: area and bedrooms are strongly correlated with each
        other, which will make their separate coefficients unstable in a regression — see{" "}
        <a href="#/ml/multiple-regression" className="text-blue-400 hover:underline">multicollinearity</a>.
      </p>
    </Panel>
  );
}

export default function BivariateAnalysis() {
  const toc = [
    { label: "Three Kinds of Pairs", hash: "pairs" },
    { label: "Correlation (interactive)", hash: "correlation" },
    { label: "Anscombe's Quartet", hash: "anscombe" },
    { label: "Correlation ≠ Causation", hash: "causation" },
    { label: "Category vs Number", hash: "cat-num" },
    { label: "Category vs Category", hash: "cat-cat" },
    { label: "Correlation Matrix", hash: "matrix" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Bivariate Analysis"
      intro="Two variables at a time: does one move with the other, how strongly, and is it real? The step between describing columns and building a model."
      toc={toc}
    >
      <Section id="pairs" title="Three Kinds of Pairs" lead="The chart and the statistic depend on what kind of variables you are pairing.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Number × Number" tone="indigo">
            <p>Chart: scatter plot. Statistic: Pearson or Spearman correlation. Example: area vs price.</p>
          </Card>
          <Card title="Category × Number" tone="teal">
            <p>Chart: box plots side by side. Statistic: group means, t-test or ANOVA. Example: courier vs delivery time.</p>
          </Card>
          <Card title="Category × Category" tone="amber">
            <p>Chart: stacked 100% bars. Statistic: crosstab, chi-square, Cramér's V. Example: plan vs churn.</p>
          </Card>
        </div>
      </Section>

      <Section id="correlation" title="Correlation" lead="Correlation measures how tightly two numerical variables move together, from −1 (perfectly opposite) through 0 (no straight-line relationship) to +1 (perfectly together).">
        <CorrelationLab />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card title="Pearson r" tone="indigo"><p>Covariance divided by both standard deviations. Measures linear relationships; sensitive to outliers.</p></Card>
          <Card title="Spearman ρ" tone="emerald"><p>Pearson on the ranks. Captures any consistently increasing or decreasing relationship, and shrugs off outliers.</p></Card>
        </div>
      </Section>

      <Section id="anscombe" title="Anscombe's Quartet" lead="The strongest argument for plotting your data.">
        <Anscombe />
      </Section>

      <Section id="causation" title="Correlation Is Not Causation" lead="Two variables can move together because a third one drives both, because the causation runs the other way, or by coincidence.">
        <Confounder />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card title="Confounder" tone="rose"><p>A hidden common cause — temperature above. Control for it, or randomise.</p></Card>
          <Card title="Reverse causation" tone="amber"><p>Cities with more police have more crime. Crime causes police hiring, not the reverse.</p></Card>
          <Card title="Coincidence" tone="purple"><p>Search enough variable pairs and some will correlate by chance. Test the pattern on fresh data.</p></Card>
        </div>
        <div className="mt-5">
          <Note tone="indigo">
            For prediction, correlation is enough — ice cream sales genuinely predict drownings. For decisions ("if we
            change X, will Y change?") you need causation, which usually means an experiment such as an A/B test.
          </Note>
        </div>
      </Section>

      <Section id="cat-num" title="Category vs Number" lead="Compare the distribution of the number within each category. Box plots side by side show centre, spread and outliers per group at once.">
        <GroupsLab />
      </Section>

      <Section id="cat-cat" title="Category vs Category" lead="Cross-tabulate the two variables and compare the proportions, not the raw counts — groups are rarely the same size.">
        <CrosstabLab />
      </Section>

      <Section id="matrix" title="The Correlation Matrix" lead="With many numerical columns, compute every pairwise correlation and show it as a heatmap.">
        <Heatmap />
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`import pandas as pd
import seaborn as sns
from scipy import stats

# Number × Number
df.plot.scatter(x="area", y="price")
stats.pearsonr(df["area"], df["price"])      # (r, p-value)
stats.spearmanr(df["area"], df["price"])
sns.heatmap(df.corr(numeric_only=True), annot=True, fmt=".2f",
            cmap="coolwarm", center=0)        # the correlation matrix

# Category × Number
sns.boxplot(data=df, x="courier", y="delivery_hours")
groups = [g["delivery_hours"] for _, g in df.groupby("courier")]
stats.f_oneway(*groups)                       # one-way ANOVA

# Category × Category
table = pd.crosstab(df["plan"], df["churned"])
pd.crosstab(df["plan"], df["churned"], normalize="index")   # row proportions
chi2, p, dof, expected = stats.chi2_contingency(table, correction=False)
cramers_v = (chi2 / (table.values.sum() * (min(table.shape) - 1))) ** 0.5`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("data-prep")} />
    </GuideLayout>
  );
}

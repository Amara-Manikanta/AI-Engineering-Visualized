import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section, Button } from "../components/VizKit";
import { rng, randn, mean, std, normPdf, normCdf, normInv, tInv, fmt, pct } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "inferential statistics", "descriptive statistics", "population", "sample", "parameter", "statistic",
  "point estimate", "confidence interval", "margin of error", "standard error", "normal distribution",
  "68-95-99.7 rule", "empirical rule", "z-score", "t-distribution", "binomial distribution", "sampling distribution",
  "estimation", "sample size calculation",
];

/* ---------------------------------------------------------------------------
   The normal curve with a shaded interval — the 68-95-99.7 rule, live.
--------------------------------------------------------------------------- */

function NormalArea() {
  const [mu, setMu] = useState(170);
  const [sd, setSd] = useState(8);
  const [lo, setLo] = useState(162);
  const [hi, setHi] = useState(178);
  const a = Math.min(lo, hi);
  const b = Math.max(lo, hi);
  const area = normCdf(b, mu, sd) - normCdf(a, mu, sd);
  const W = 360;
  const H = 170;
  const xMin = 130;
  const xMax = 210;
  const sx = (x) => 10 + ((x - xMin) / (xMax - xMin)) * (W - 20);
  const peak = normPdf(mu, mu, 3); // tallest curve the σ slider allows
  const sy = (y) => H - 24 - (y / peak) * (H - 40);

  let curve = "";
  let fill = `M${sx(a)},${sy(0)}`;
  for (let i = 0; i <= 160; i++) {
    const x = xMin + ((xMax - xMin) * i) / 160;
    curve += `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(normPdf(x, mu, sd)).toFixed(1)}`;
  }
  for (let i = 0; i <= 80; i++) {
    const x = a + ((b - a) * i) / 80;
    fill += `L${sx(x).toFixed(1)},${sy(normPdf(x, mu, sd)).toFixed(1)}`;
  }
  fill += `L${sx(b)},${sy(0)}Z`;

  const presets = [1, 2, 3].map((k) => ({ k, label: `μ ± ${k}σ` }));

  return (
    <Panel
      tone="blue"
      title="Heights of adults — a normal distribution"
      actions={presets.map((p) => (
        <Button key={p.k} tone="blue" onClick={() => { setLo(mu - p.k * sd); setHi(mu + p.k * sd); }}>
          {p.label}
        </Button>
      ))}
    >
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block max-w-xl">
        <path d={fill} fill="rgba(96,165,250,0.35)" />
        <path d={curve} fill="none" stroke="#60a5fa" strokeWidth="2" />
        <line x1="10" y1={sy(0)} x2={W - 10} y2={sy(0)} stroke="rgba(255,255,255,0.2)" />
        <line x1={sx(mu)} y1={sy(0)} x2={sx(mu)} y2="12" stroke="#fbbf24" strokeDasharray="4 3" />
        <text x={sx(mu)} y="10" fill="#fbbf24" fontSize="11" textAnchor="middle">μ</text>
        {[140, 160, 180, 200].map((t) => (
          <text key={t} x={sx(t)} y={H - 6} fill="#6b7280" fontSize="11" textAnchor="middle">{t}</text>
        ))}
      </svg>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 mb-4">
        <Slider tone="blue" label="Mean μ (cm)" value={mu} min={150} max={190} onChange={setMu} />
        <Slider tone="blue" label="Standard deviation σ" value={sd} min={3} max={15} step={0.5} onChange={setSd} />
        <Slider tone="amber" label="From" value={lo} min={130} max={210} step={0.5} onChange={setLo} />
        <Slider tone="amber" label="To" value={hi} min={130} max={210} step={0.5} onChange={setHi} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Metric label="P(a < X < b)" value={pct(area)} tone="blue" />
        <Metric label="z of a" value={fmt((a - mu) / sd, 2)} />
        <Metric label="z of b" value={fmt((b - mu) / sd, 2)} />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Press the three buttons: 68.3%, 95.4% and 99.7% of values fall within one, two and three standard deviations
        of the mean, whatever μ and σ are. The z-score, (x − μ) / σ, is that distance measured in standard deviations.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Confidence intervals: 40 samples, 40 intervals, how many catch the truth?
--------------------------------------------------------------------------- */

const TRUE_MU = 52;
const TRUE_SD = 12;

function IntervalLab() {
  const [n, setN] = useState(25);
  const [conf, setConf] = useState(95);
  const [seed, setSeed] = useState(1);

  const intervals = useMemo(() => {
    const r = rng(seed * 7919 + n);
    const tcrit = tInv(1 - (1 - conf / 100) / 2, n - 1);
    return Array.from({ length: 40 }, () => {
      const s = Array.from({ length: n }, () => TRUE_MU + TRUE_SD * randn(r));
      const m = mean(s);
      const moe = (tcrit * std(s)) / Math.sqrt(n);
      return { m, lo: m - moe, hi: m + moe, hit: m - moe <= TRUE_MU && TRUE_MU <= m + moe };
    });
  }, [n, conf, seed]);

  const hits = intervals.filter((i) => i.hit).length;
  const W = 360;
  const rowH = 7;
  const H = 40 * rowH + 30;
  const xMin = 32;
  const xMax = 72;
  const sx = (x) => 10 + ((Math.max(xMin, Math.min(xMax, x)) - xMin) / (xMax - xMin)) * (W - 20);
  const avgWidth = mean(intervals.map((i) => i.hi - i.lo));

  return (
    <Panel tone="emerald" title="Forty samples, forty confidence intervals" actions={<Button tone="emerald" onClick={() => setSeed((s) => s + 1)}>Draw 40 new samples</Button>}>
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        The true average commute is {TRUE_MU} minutes — in real life you would not know that. Each line is one survey of
        n people and the interval it produced. Red lines missed the truth.
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block max-w-xl">
        <line x1={sx(TRUE_MU)} y1="4" x2={sx(TRUE_MU)} y2={H - 20} stroke="#f472b6" strokeWidth="2" />
        {intervals.map((iv, i) => (
          <g key={i}>
            <line x1={sx(iv.lo)} y1={8 + i * rowH} x2={sx(iv.hi)} y2={8 + i * rowH} stroke={iv.hit ? "#34d399" : "#f87171"} strokeWidth="2.5" strokeLinecap="round" />
            <circle cx={sx(iv.m)} cy={8 + i * rowH} r="2" fill="#e5e7eb" />
          </g>
        ))}
        {[35, 45, 52, 60, 70].map((t) => (
          <text key={t} x={sx(t)} y={H - 4} fill={t === TRUE_MU ? "#f472b6" : "#6b7280"} fontSize="11" textAnchor="middle">{t}</text>
        ))}
      </svg>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-3 mb-4">
        <Slider tone="emerald" label="Sample size n" value={n} min={5} max={200} step={5} onChange={setN} />
        <Slider tone="emerald" label="Confidence level" value={conf} min={80} max={99} onChange={setConf} format={(v) => `${v}%`} />
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Metric label="Caught the truth" value={`${hits} / 40`} tone={hits / 40 >= conf / 100 - 0.08 ? "emerald" : "rose"} sub={`expected about ${Math.round(0.4 * conf)}`} />
        <Metric label="Average width" value={`${fmt(avgWidth, 1)} min`} />
        <Metric label="Missed" value={40 - hits} tone="rose" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Raise n and every interval shrinks — width falls with √n, so four times the people halves it. Raise the
        confidence level and the intervals widen to catch the truth more often. "95% confidence" describes the method:
        95% of intervals built this way contain the true value. Any single interval either contains it or does not.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   How many people do I need? Solve the margin-of-error formula for n.
--------------------------------------------------------------------------- */

function SampleSize() {
  const [moe, setMoe] = useState(3);
  const [conf, setConf] = useState(95);
  const [p, setP] = useState(50);
  const z = normInv(1 - (1 - conf / 100) / 2);
  const pp = p / 100;
  const need = Math.ceil((z * z * pp * (1 - pp)) / (moe / 100) ** 2);
  return (
    <Panel tone="purple" title="How many people should a survey ask?">
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        To estimate a proportion (say, the share of users who would pay) within ±E at a given confidence:{" "}
        <span className="font-mono text-purple-200">n = z² · p(1 − p) / E²</span>
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <Slider tone="purple" label="Margin of error ±E" value={moe} min={1} max={10} step={0.5} onChange={setMoe} format={(v) => `${v}%`} />
        <Slider tone="purple" label="Confidence" value={conf} min={80} max={99} onChange={setConf} format={(v) => `${v}%`} />
        <Slider tone="purple" label="Expected proportion p" value={p} min={5} max={95} onChange={setP} format={(v) => `${v}%`} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Metric label="z for this confidence" value={fmt(z, 3)} />
        <Metric label="People needed" value={need.toLocaleString()} tone="purple" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        ±3% at 95% needs about 1,068 people — whether the population is a city or a country, as long as the sample is
        random. Halving the margin quadruples the sample. p = 50% is the worst case, which is why it is the default
        when you have no prior guess.
      </p>
    </Panel>
  );
}

export default function InferentialStatistics() {
  const toc = [
    { label: "Describing vs Inferring", hash: "why" },
    { label: "Population, Sample, Parameter", hash: "vocab" },
    { label: "The Normal Distribution", hash: "normal" },
    { label: "Sampling Distributions & SE", hash: "se" },
    { label: "Confidence Intervals", hash: "ci" },
    { label: "z or t?", hash: "zt" },
    { label: "Sample Size", hash: "size" },
    { label: "In ML", hash: "ml" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Inferential Statistics"
      intro="Descriptive statistics summarise the data you have. Inferential statistics use that sample to say something — with a stated uncertainty — about everyone you did not measure."
      toc={toc}
    >
      <Section id="why" title="Describing vs Inferring" lead="You survey 400 customers and 62% say they would renew. That is description. Saying 'between 57% and 67% of all customers would renew, with 95% confidence' is inference.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Descriptive statistics" tone="indigo"><p>Mean, median, SD, charts — about the rows in front of you. No uncertainty involved. See <a href="#/ml/data-analysis" className="text-blue-400 hover:underline">Data Analysis</a>.</p></Card>
          <Card title="Inferential statistics" tone="emerald"><p>Estimates and tests about a population, from a sample, with a margin of error or a p-value attached. The two main tools are confidence intervals (this page) and <a href="#/ml/hypothesis-testing" className="text-blue-400 hover:underline">hypothesis tests</a>.</p></Card>
        </div>
      </Section>

      <Section id="vocab" title="Population, Sample, Parameter, Statistic">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-gray-300">
              <tr>
                <th className="p-3">Term</th>
                <th className="p-3">Meaning</th>
                <th className="p-3">Example</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-gray-400">
              <tr><td className="p-3 text-white">Population</td><td className="p-3">Everyone you want to know about</td><td className="p-3">All 2 million app users</td></tr>
              <tr><td className="p-3 text-white">Sample</td><td className="p-3">The subset you actually measure</td><td className="p-3">400 users who took the survey</td></tr>
              <tr><td className="p-3 text-white">Parameter</td><td className="p-3">A true population value — fixed, unknown. Greek letters: μ, σ, p</td><td className="p-3">True renewal rate p</td></tr>
              <tr><td className="p-3 text-white">Statistic</td><td className="p-3">The same quantity computed on the sample — varies sample to sample. Latin letters: x̄, s, p̂</td><td className="p-3">Sample renewal rate p̂ = 62%</td></tr>
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="normal" title="The Normal Distribution" lead="The bell curve appears everywhere in inference — not because data is always normal, but because averages of data tend to be (the Central Limit Theorem).">
        <NormalArea />
      </Section>

      <Section id="se" title="Sampling Distributions and Standard Error" lead="Take a sample, compute its mean. Take another, get a slightly different mean. The distribution of all those possible means is the sampling distribution, and its standard deviation is the standard error.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <Card title="Standard deviation (s)" tone="blue"><p>How spread out individual values are. Does not shrink with more data.</p></Card>
          <Card title="Standard error (SE = s / √n)" tone="emerald"><p>How much the sample mean would wobble between samples. Shrinks as n grows.</p></Card>
          <Card title="Why √n" tone="purple"><p>Errors partly cancel when averaged. 100 people give an SE ten times smaller than 1 person, not a hundred times.</p></Card>
        </div>
        <Note tone="indigo">
          Watch the sampling distribution form, for populations of any shape, on the{" "}
          <a href="#/ml/central-limit-theorem" className="text-blue-400 hover:underline">Central Limit Theorem</a> page.
        </Note>
      </Section>

      <Section id="ci" title="Confidence Intervals" lead="A confidence interval is a point estimate plus and minus a margin of error: x̄ ± t* · s / √n.">
        <IntervalLab />
      </Section>

      <Section id="zt" title="z or t?">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="z (normal)" tone="blue"><p>Use when the population σ is known, or for proportions with large samples. 95% → z* = 1.96.</p></Card>
          <Card title="t (Student's t)" tone="emerald"><p>Use when σ is estimated from the sample — nearly always. Its heavier tails widen the interval to account for that extra uncertainty. With n = 10, 95% → t* = 2.26; by n = 100 it is 1.98, almost z.</p></Card>
        </div>
      </Section>

      <Section id="size" title="Choosing a Sample Size" lead="Run the margin-of-error formula backwards to plan a survey or experiment before collecting anything.">
        <SampleSize />
      </Section>

      <Section id="ml" title="Where Inference Shows Up in ML">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Your test score is a sample" tone="indigo"><p>90% accuracy on 200 test examples has a 95% interval of roughly 86–94%. Two models 1 point apart on that test set are not reliably different.</p></Card>
          <Card title="Cross-validation spread" tone="emerald"><p>Report the mean and standard deviation across folds, not just the mean. The spread tells you how much of a difference is noise.</p></Card>
          <Card title="A/B tests and evals" tone="amber"><p>Shipping a new model or prompt on the strength of a small win is an inference problem. See <a href="#/ml/hypothesis-testing" className="text-blue-400 hover:underline">Hypothesis Testing</a>.</p></Card>
        </div>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`import numpy as np
from scipy import stats
from statsmodels.stats.proportion import proportion_confint

commute = np.array([48, 55, 61, 39, 52, 47, 58, 66, 44, 50, 57, 53])

# 95% CI for a mean, using t because sigma is estimated
m, se = commute.mean(), stats.sem(commute)            # sem = s / sqrt(n)
lo, hi = stats.t.interval(0.95, df=len(commute) - 1, loc=m, scale=se)
print(f"{m:.1f} minutes, 95% CI [{lo:.1f}, {hi:.1f}]")

# 95% CI for a proportion: 248 of 400 would renew
lo, hi = proportion_confint(count=248, nobs=400, alpha=0.05, method="wilson")

# Bootstrap: an interval for ANY statistic, no formula needed
rng = np.random.default_rng(0)
boot = [np.median(rng.choice(commute, size=len(commute))) for _ in range(10_000)]
print("median 95% CI:", np.percentile(boot, [2.5, 97.5]))

# Is 90% accuracy on 200 examples precise? (a proportion interval)
proportion_confint(180, 200, method="wilson")          # ≈ (0.85, 0.93)`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("stats-inference")} />
    </GuideLayout>
  );
}

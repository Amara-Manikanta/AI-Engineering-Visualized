import React, { useEffect, useMemo, useRef, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Segmented, Metric, Histogram, Card, Note, Section, Button } from "../components/VizKit";
import { rng, randn, mean, std, skewness, histogram, normPdf, fmt } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "central limit theorem", "CLT", "sampling distribution of the mean", "standard error", "sigma over root n",
  "law of large numbers", "sample mean", "normal approximation", "n = 30 rule", "Cauchy distribution",
  "heavy tails", "why averages are normal",
];

/* ---------------------------------------------------------------------------
   Five populations. Each draws one value from a seeded uniform source.
   μ and σ are the true population values, used for the overlay curve.
--------------------------------------------------------------------------- */

const POPS = {
  exp: {
    label: "Waiting times (skewed)",
    mu: 10,
    sd: 10,
    range: [0, 50],
    draw: (r) => -10 * Math.log(1 - r()),
    note: "Exponential: most waits are short, a few are very long. Heavily right-skewed — nothing like a bell.",
  },
  dice: {
    label: "Dice rolls (flat)",
    mu: 3.5,
    sd: Math.sqrt(35 / 12),
    range: [0.5, 6.5],
    draw: (r) => 1 + Math.floor(r() * 6),
    note: "Every face equally likely. Flat and discrete — still becomes a bell once you average a few rolls.",
  },
  bimodal: {
    label: "Two groups (bimodal)",
    mu: 30,
    sd: Math.sqrt(9 + 100),
    range: [5, 55],
    draw: (r) => (r() < 0.5 ? 20 : 40) + 3 * randn(r),
    note: "Two separate humps with a gap in the middle. The average of several draws lands in the gap — where no single value lives.",
  },
  coin: {
    label: "Clicks (yes / no)",
    mu: 0.2,
    sd: 0.4,
    range: [-0.05, 1.05],
    draw: (r) => (r() < 0.2 ? 1 : 0),
    note: "Each visitor clicks (1) with probability 0.2 or does not (0). The mean of a sample is a click-through rate.",
  },
  cauchy: {
    label: "Cauchy (breaks it)",
    mu: 10,
    sd: Infinity,
    range: [-10, 30],
    draw: (r) => 10 + 2 * Math.tan(Math.PI * (r() - 0.5)),
    note: "Tails so heavy that the variance is infinite. The CLT's one requirement — finite variance — fails, and averaging never settles down.",
  },
};

const SIZES = [1, 2, 5, 10, 30, 100];
const TARGET = 3000;

function CltMachine() {
  const [pop, setPop] = useState("exp");
  const [n, setN] = useState(5);
  const [means, setMeans] = useState([]);
  const [last, setLast] = useState([]);
  const [playing, setPlaying] = useState(false);
  const [zoom, setZoom] = useState(false);
  const r = useRef(rng(1));
  const P = POPS[pop];

  // New population or n: start from an empty pile.
  useEffect(() => {
    r.current = rng(SIZES.indexOf(n) * 97 + Object.keys(POPS).indexOf(pop) * 13 + 1);
    setMeans([]);
    setLast([]);
    setPlaying(false);
  }, [pop, n]);

  const draw = (k) => {
    const fresh = [];
    let sample = [];
    for (let i = 0; i < k; i++) {
      sample = Array.from({ length: n }, () => P.draw(r.current));
      fresh.push(mean(sample));
    }
    setLast(sample);
    setMeans((m) => [...m, ...fresh].slice(-TARGET));
  };

  useEffect(() => {
    if (!playing) return undefined;
    if (means.length >= TARGET) {
      setPlaying(false);
      return undefined;
    }
    const id = setTimeout(() => draw(40), 40);
    return () => clearTimeout(id);
  }, [playing, means.length]); // eslint-disable-line react-hooks/exhaustive-deps

  const popSample = useMemo(() => {
    const rr = rng(4242);
    return Array.from({ length: 20000 }, () => P.draw(rr));
  }, [pop]); // eslint-disable-line react-hooks/exhaustive-deps

  const se = P.sd / Math.sqrt(n);
  const finite = Number.isFinite(se);
  const range = zoom && finite ? [P.mu - 4 * se, P.mu + 4 * se] : P.range;
  const bins = 40;
  const binW = (range[1] - range[0]) / bins;
  const counts = histogram(means, bins, range[0], range[1]);
  const curve = finite && means.length > 20 ? (x) => means.length * binW * normPdf(x, P.mu, se) : undefined;
  const lastMean = last.length ? mean(last) : null;

  return (
    <Panel
      tone="indigo"
      title="The CLT machine"
      actions={
        <>
          <Button onClick={() => draw(1)}>Draw 1 sample</Button>
          <Button onClick={() => draw(100)}>Draw 100</Button>
          <Button
            onClick={() => {
              if (means.length >= TARGET) setMeans([]);
              setPlaying((p) => !p);
            }}
          >
            {playing ? "Pause" : means.length >= TARGET ? "↺ Run again" : means.length ? "Keep going" : "▶ Run to 3,000"}
          </Button>
        </>
      }
    >
      <div className="space-y-3 mb-4">
        <Segmented value={pop} onChange={setPop} options={Object.entries(POPS).map(([v, p]) => ({ v, label: p.label }))} />
        <div className="flex flex-wrap items-center gap-2">
          <span className="text-xs uppercase tracking-wide text-gray-500 mr-1">Sample size n</span>
          <Segmented value={n} onChange={setN} options={SIZES.map((v) => ({ v, label: String(v) }))} />
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl bg-black/40 border border-white/10 p-3">
          <div className="text-xs text-gray-500 mb-1">1 · The population — and the last sample drawn from it</div>
          <Histogram
            counts={histogram(popSample, 40, P.range[0], P.range[1])}
            min={P.range[0]}
            max={P.range[1]}
            color="#64748b"
            marks={lastMean !== null ? [{ x: Math.max(P.range[0], Math.min(P.range[1], lastMean)), color: "#fbbf24", label: `this sample's mean ${fmt(lastMean, 2)}` }] : []}
            tickFormat={(v) => (Math.abs(v) < 2 ? v.toFixed(1) : v.toFixed(0))}
          />
          <svg viewBox="0 0 360 22" className="w-full h-auto block">
            {last.slice(0, 100).map((v, i) => {
              const x = 8 + ((Math.max(P.range[0], Math.min(P.range[1], v)) - P.range[0]) / (P.range[1] - P.range[0])) * 344;
              return <circle key={i} cx={x} cy={8 + (i % 3) * 4} r="2.6" fill="#fbbf24" opacity="0.85" />;
            })}
          </svg>
          <div className="text-[0.6875rem] text-gray-500">Yellow dots: the {n} value{n === 1 ? "" : "s"} in the latest sample.</div>
        </div>
        <div className="rounded-xl bg-black/40 border border-white/10 p-3">
          <div className="flex items-center justify-between gap-2 mb-1">
            <span className="text-xs text-gray-500">2 · Where {means.length.toLocaleString()} sample means landed</span>
            {finite && (
              <button className="text-[0.6875rem] text-indigo-300 hover:underline" onClick={() => setZoom((z) => !z)}>
                {zoom ? "population scale" : "zoom in"}
              </button>
            )}
          </div>
          <Histogram
            counts={counts}
            min={range[0]}
            max={range[1]}
            color="#818cf8"
            curve={curve}
            marks={[{ x: P.mu, color: "#34d399", label: "μ" }]}
            tickFormat={(v) => (Math.abs(v) < 2 ? v.toFixed(2) : v.toFixed(1))}
          />
          <div className="text-[0.6875rem] text-gray-500">
            {finite ? "Pink curve: the normal distribution the CLT predicts, N(μ, σ/√n)." : "No curve: with infinite variance there is no normal limit to draw."}
          </div>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <Metric label="Mean of means" value={means.length ? fmt(mean(means), 3) : "—"} sub={`true μ = ${fmt(P.mu, 2)}`} />
        <Metric label="SD of means" value={means.length > 1 ? fmt(std(means), 3) : "—"} tone="indigo" sub={finite ? `predicted σ/√n = ${fmt(se, 3)}` : "predicted: does not exist"} />
        <Metric label="Skew of means" value={means.length > 2 ? fmt(skewness(means), 2) : "—"} tone="purple" sub="0 = symmetric" />
        <Metric label="Sample size" value={n} sub={`values per mean`} />
      </div>
      <p className="text-sm text-gray-300 leading-relaxed m-0">{P.note}</p>
      <p className="text-xs text-gray-500 leading-relaxed mt-2 mb-0">
        Start at n = 1 — the means are just the population. Step up to 2, 5, 30: the pile turns into a bell and
        narrows, and the measured SD of the means tracks σ/√n. Skewed populations need a larger n than flat ones before
        the bell is convincing.
      </p>
    </Panel>
  );
}

function SeTable() {
  const rows = [1, 4, 16, 64, 256, 1024];
  return (
    <div className="overflow-x-auto rounded-xl border border-white/10">
      <table className="w-full text-sm text-left font-mono">
        <thead className="bg-white/5 text-gray-400">
          <tr>
            <th className="p-3 font-normal">n</th>
            <th className="p-3 font-normal">standard error σ/√n (σ = 10)</th>
            <th className="p-3 font-normal">relative to n = 1</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-white/10 text-gray-300">
          {rows.map((n) => (
            <tr key={n}>
              <td className="p-3">{n}</td>
              <td className="p-3">
                <div className="flex items-center gap-3">
                  <span className="w-12">{fmt(10 / Math.sqrt(n), 2)}</span>
                  <span className="h-2 rounded bg-indigo-500/60" style={{ width: `${(1 / Math.sqrt(n)) * 160}px` }} />
                </div>
              </td>
              <td className="p-3 text-gray-500">÷ {Math.sqrt(n)}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}

export default function CentralLimitTheorem() {
  const toc = [
    { label: "The Theorem", hash: "theorem" },
    { label: "The CLT Machine", hash: "machine" },
    { label: "σ / √n", hash: "se" },
    { label: "How Big Must n Be?", hash: "n" },
    { label: "When It Fails", hash: "fails" },
    { label: "Why It Matters", hash: "why" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Central Limit Theorem"
      intro="Average enough independent values and the average is approximately normally distributed — whatever the shape of the values themselves. It is why the bell curve is everywhere in statistics."
      toc={toc}
    >
      <Section id="theorem" title="The Theorem" lead="Take samples of size n from any population with mean μ and finite standard deviation σ. As n grows, the distribution of the sample mean approaches a normal distribution:">
        <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-sm sm:text-base text-gray-200 text-center mb-5">
          x̄ ≈ Normal( μ , σ / √n )
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Centre stays put" tone="emerald"><p>The sample means average out to the population mean μ. No bias from averaging.</p></Card>
          <Card title="Spread shrinks" tone="indigo"><p>Their standard deviation — the standard error — is σ/√n. Bigger samples give tighter estimates.</p></Card>
          <Card title="Shape becomes normal" tone="purple"><p>Whatever the population looks like: skewed, flat, lumpy, or just 0s and 1s.</p></Card>
        </div>
      </Section>

      <Section id="machine" title="The CLT Machine" lead="Draw samples, average each one, and pile up the averages. Change the population and n.">
        <CltMachine />
      </Section>

      <Section id="se" title="The √n Law" lead="Precision improves with the square root of the sample size. Each halving of the error costs four times the data.">
        <SeTable />
      </Section>

      <Section id="n" title="How Big Must n Be?" lead="The textbook 'n ≥ 30' is a rule of thumb, not a law. The answer depends on the population's shape.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Symmetric populations" tone="emerald"><p>Dice, measurement errors: n = 5–10 already looks normal.</p></Card>
          <Card title="Skewed populations" tone="amber"><p>Waiting times, incomes: the skew of the mean falls like skew / √n, so strongly skewed data may need 50–100+.</p></Card>
          <Card title="Rare events" tone="rose"><p>A 1% conversion rate needs enough samples to see several conversions — n·p ≥ 10 is a common check.</p></Card>
        </div>
      </Section>

      <Section id="fails" title="When It Fails" lead="The theorem has conditions. Break them and averages misbehave.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <Card title="Infinite variance" tone="rose"><p>The Cauchy distribution in the machine above. The mean of 100 Cauchy draws is exactly as spread out as a single draw. Averaging does nothing.</p></Card>
          <Card title="Dependence" tone="amber"><p>Today's stock price depends on yesterday's. Correlated observations carry less information than n independent ones, so σ/√n overstates your precision.</p></Card>
          <Card title="Very heavy tails" tone="purple"><p>Wealth, city sizes, viral posts. Variance may be finite but dominated by rare extremes — convergence is so slow it is useless in practice.</p></Card>
        </div>
        <Note tone="indigo">
          The CLT is about the <em>mean</em> of the data, not the data. It does not make your data normal, and it does not
          apply to the median, maximum or other statistics in the same form.
        </Note>
      </Section>

      <Section id="why" title="Why It Matters">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Confidence intervals and tests" tone="indigo"><p>x̄ ± 1.96·SE and almost every z- and t-test rely on the sample mean being approximately normal. See <a href="#/ml/inferential-statistics" className="text-blue-400 hover:underline">Inferential Statistics</a> and <a href="#/ml/hypothesis-testing" className="text-blue-400 hover:underline">Hypothesis Testing</a>.</p></Card>
          <Card title="A/B testing" tone="emerald"><p>Individual users convert or not (0/1), yet the conversion rate over thousands of users is normal — so two rates can be compared with a z-test.</p></Card>
          <Card title="Mini-batch gradients" tone="purple"><p>A mini-batch gradient averages per-example gradients. Its noise is roughly normal with variance shrinking as 1/batch size — the reason larger batches give smoother training.</p></Card>
          <Card title="Ensembles" tone="amber"><p>Averaging many models' predictions narrows their spread by the same √n logic, limited by how correlated the models are. See <a href="#/ml/random-forests" className="text-blue-400 hover:underline">Random Forests</a>.</p></Card>
        </div>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`import numpy as np
from scipy import stats

rng = np.random.default_rng(0)
population = rng.exponential(scale=10, size=1_000_000)   # skewed, mu = sigma = 10

for n in [1, 5, 30, 100]:
    # 10,000 samples of size n, one mean per row
    means = rng.choice(population, size=(10_000, n)).mean(axis=1)
    print(f"n={n:>3}  mean={means.mean():6.2f}  "
          f"sd={means.std():5.2f}  predicted={10/np.sqrt(n):5.2f}  "
          f"skew={stats.skew(means):5.2f}")

# n=  1  mean= 10.00  sd= 9.98  predicted=10.00  skew= 1.99
# n=  5  mean=  9.99  sd= 4.47  predicted= 4.47  skew= 0.89
# n= 30  mean= 10.00  sd= 1.83  predicted= 1.83  skew= 0.37
# n=100  mean= 10.00  sd= 1.00  predicted= 1.00  skew= 0.20`}
        />
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          The printed values are what the theory predicts (skew of the mean = 2/√n for an exponential); your run will
          differ slightly in the second decimal.
        </p>
      </Section>

      <KnowledgeCheck questions={questionsFor("stats-inference")} />
    </GuideLayout>
  );
}

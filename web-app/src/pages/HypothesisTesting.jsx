import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Segmented, Metric, Card, Note, Section, Button } from "../components/VizKit";
import { rng, randn, mean, variance, normPdf, normCdf, normInv, tCdf, fmt, fmtP, pct } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "hypothesis testing", "null hypothesis", "alternative hypothesis", "p-value", "significance level", "alpha",
  "type I error", "type II error", "false positive", "false negative", "statistical power", "effect size",
  "z-test", "t-test", "paired t-test", "Welch t-test", "A/B test", "two-proportion z-test", "chi-square test",
  "Mann-Whitney", "multiple testing", "Bonferroni", "p-hacking", "one-tailed", "two-tailed", "critical value",
];

/* ---------------------------------------------------------------------------
   Shared: draw a normal curve (in z units) with shaded regions.
--------------------------------------------------------------------------- */

function curvePath(sx, sy, mu, from, to, steps = 120) {
  let d = "";
  for (let i = 0; i <= steps; i++) {
    const x = from + ((to - from) * i) / steps;
    d += `${i ? "L" : "M"}${sx(x).toFixed(1)},${sy(normPdf(x, mu, 1)).toFixed(1)}`;
  }
  return d;
}
function areaPath(sx, sy, mu, from, to) {
  if (to <= from) return "";
  return `M${sx(from)},${sy(0)}` + curvePath(sx, sy, mu, from, to, 60).replace(/^M/, "L") + `L${sx(to)},${sy(0)}Z`;
}

/* ---------------------------------------------------------------------------
   p-value: is the delivery app's "30 minutes on average" claim believable?
--------------------------------------------------------------------------- */

function PValueLab() {
  const [xbar, setXbar] = useState(31.5);
  const [n, setN] = useState(40);
  const [tails, setTails] = useState("two");
  const [alpha, setAlpha] = useState(0.05);
  const mu0 = 30;
  const sigma = 8;
  const se = sigma / Math.sqrt(n);
  const z = (xbar - mu0) / se;
  const p = tails === "two" ? 2 * (1 - normCdf(Math.abs(z))) : 1 - normCdf(z);
  const crit = tails === "two" ? normInv(1 - alpha / 2) : normInv(1 - alpha);
  const reject = p < alpha;

  const W = 360;
  const H = 180;
  const lo = -4;
  const hi = 4;
  const sx = (v) => 10 + ((v - lo) / (hi - lo)) * (W - 20);
  const sy = (y) => H - 30 - (y / 0.4) * (H - 50);
  const zc = Math.max(lo, Math.min(hi, z));
  const tailRight = areaPath(sx, sy, 0, tails === "two" ? Math.abs(zc) : zc, hi);
  const tailLeft = tails === "two" ? areaPath(sx, sy, 0, lo, -Math.abs(zc)) : "";

  return (
    <Panel tone="indigo" title="A delivery app claims deliveries average 30 minutes. You timed some.">
      <p className="text-sm text-gray-400 mb-3 leading-relaxed">
        H₀: μ = 30. Delivery times have σ = 8 minutes. If H₀ is true, sample averages scatter around 30 as the curve
        shows. The p-value is the shaded area: how often a sample at least as extreme as yours would happen by chance.
      </p>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block max-w-xl">
        <path d={areaPath(sx, sy, 0, crit, hi)} fill="rgba(251,113,133,0.12)" />
        {tails === "two" && <path d={areaPath(sx, sy, 0, lo, -crit)} fill="rgba(251,113,133,0.12)" />}
        <path d={tailRight} fill="rgba(251,191,36,0.55)" />
        {tailLeft && <path d={tailLeft} fill="rgba(251,191,36,0.55)" />}
        <path d={curvePath(sx, sy, 0, lo, hi)} fill="none" stroke="#818cf8" strokeWidth="2" />
        <line x1="10" y1={sy(0)} x2={W - 10} y2={sy(0)} stroke="rgba(255,255,255,0.2)" />
        <line x1={sx(crit)} y1={sy(0)} x2={sx(crit)} y2="20" stroke="#fb7185" strokeDasharray="3 3" />
        {tails === "two" && <line x1={sx(-crit)} y1={sy(0)} x2={sx(-crit)} y2="20" stroke="#fb7185" strokeDasharray="3 3" />}
        <line x1={sx(zc)} y1={sy(0) + 4} x2={sx(zc)} y2="30" stroke="#fbbf24" strokeWidth="2.5" />
        <text x={sx(zc)} y="24" fill="#fbbf24" fontSize="11" textAnchor={zc > 2.5 ? "end" : zc < -2.5 ? "start" : "middle"}>
          your sample{Math.abs(z) > 4 ? " (off the chart)" : ""}
        </text>
        {[-3, -2, -1, 0, 1, 2, 3].map((t) => (
          <g key={t}>
            <text x={sx(t)} y={H - 16} fill="#6b7280" fontSize="11" textAnchor="middle">{t}</text>
            <text x={sx(t)} y={H - 3} fill="#4b5563" fontSize="11" textAnchor="middle">{(mu0 + t * se).toFixed(1)}</text>
          </g>
        ))}
      </svg>
      <div className="text-[0.6875rem] text-gray-500 mb-4">Top axis: z-score. Bottom axis: the same point in minutes. Pink bands: the rejection region at α.</div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Slider label="Your sample's average (min)" value={xbar} min={26} max={34} step={0.1} onChange={setXbar} format={(v) => v.toFixed(1)} tone="amber" />
        <Slider label="Deliveries timed (n)" value={n} min={5} max={200} step={5} onChange={setN} />
      </div>
      <div className="flex flex-wrap gap-3 mb-4">
        <Segmented value={tails} onChange={setTails} options={[{ v: "two", label: "Two-sided: μ ≠ 30" }, { v: "one", label: "One-sided: μ > 30" }]} />
        <Segmented value={alpha} onChange={setAlpha} options={[0.01, 0.05, 0.1].map((a) => ({ v: a, label: `α = ${a}` }))} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
        <Metric label="Standard error" value={fmt(se, 2)} sub="σ / √n" />
        <Metric label="z statistic" value={fmt(z, 2)} tone="amber" />
        <Metric label="p-value" value={fmtP(p)} tone={reject ? "emerald" : "rose"} />
        <Metric label="Decision" value={reject ? "Reject H₀" : "Keep H₀"} tone={reject ? "emerald" : "rose"} />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        The same 31.5-minute average is unremarkable from 10 deliveries and damning from 200. Evidence depends on the
        effect <em>and</em> the sample size. A one-sided test puts all of α in one tail, so it rejects more easily — but
        only if you chose the direction before seeing the data.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Type I / Type II error and power.
--------------------------------------------------------------------------- */

function PowerLab() {
  const [d, setD] = useState(0.3);
  const [n, setN] = useState(40);
  const [alpha, setAlpha] = useState(0.05);
  const shift = d * Math.sqrt(n);
  const crit = normInv(1 - alpha);
  const beta = normCdf(crit - shift);
  const power = 1 - beta;
  const nNeeded = Math.ceil(((crit + normInv(0.8)) / d) ** 2);

  const W = 360;
  const H = 180;
  const lo = -4;
  const hi = Math.min(14, Math.max(5, shift + 4));
  const sx = (v) => 10 + ((v - lo) / (hi - lo)) * (W - 20);
  const sy = (y) => H - 24 - (y / 0.4) * (H - 44);

  return (
    <Panel tone="rose" title="Two errors you can make, and the power to avoid one">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block max-w-xl">
        <path d={areaPath(sx, sy, shift, crit, hi)} fill="rgba(52,211,153,0.3)" />
        <path d={areaPath(sx, sy, shift, lo, crit)} fill="rgba(251,191,36,0.45)" />
        <path d={areaPath(sx, sy, 0, crit, hi)} fill="rgba(251,113,133,0.6)" />
        <path d={curvePath(sx, sy, 0, lo, hi)} fill="none" stroke="#94a3b8" strokeWidth="2" />
        <path d={curvePath(sx, sy, shift, lo, hi)} fill="none" stroke="#34d399" strokeWidth="2" />
        <line x1={sx(crit)} y1={sy(0)} x2={sx(crit)} y2="14" stroke="#e5e7eb" strokeDasharray="4 3" />
        <text x={sx(crit) + 4} y="14" fill="#e5e7eb" fontSize="11">critical value</text>
        <text x={sx(0)} y={sy(0.41)} fill="#94a3b8" fontSize="11" textAnchor="middle">if H₀ true</text>
        <text x={Math.min(W - 40, sx(shift))} y={sy(0.41) + 14} fill="#34d399" fontSize="11" textAnchor="middle">if real effect</text>
        <line x1="10" y1={sy(0)} x2={W - 10} y2={sy(0)} stroke="rgba(255,255,255,0.2)" />
      </svg>
      <div className="flex flex-wrap gap-3 text-[0.6875rem] text-gray-400 mb-4">
        <span><span className="inline-block w-3 h-3 rounded-sm bg-rose-400/70 mr-1 align-middle" />α — Type I error (false alarm)</span>
        <span><span className="inline-block w-3 h-3 rounded-sm bg-amber-400/60 mr-1 align-middle" />β — Type II error (missed effect)</span>
        <span><span className="inline-block w-3 h-3 rounded-sm bg-emerald-400/50 mr-1 align-middle" />power = 1 − β</span>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <Slider tone="rose" label="True effect size d" value={d} min={0.05} max={1} step={0.05} onChange={setD} format={(v) => v.toFixed(2)} />
        <Slider tone="rose" label="Sample size n" value={n} min={5} max={100} step={5} onChange={setN} />
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-1.5">Significance α</div>
          <Segmented tone="rose" value={alpha} onChange={setAlpha} options={[0.01, 0.05, 0.1].map((a) => ({ v: a, label: String(a) }))} />
        </div>
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Metric label="Type I (α)" value={pct(alpha, 0)} tone="rose" />
        <Metric label="Type II (β)" value={pct(beta)} tone="amber" />
        <Metric label="Power" value={pct(power)} tone={power >= 0.8 ? "emerald" : "rose"} sub={`n for 80% power: ${nNeeded.toLocaleString()}`} />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Lower α to avoid false alarms and the critical line moves right — β grows. The only ways to shrink both at once
        are a bigger sample or a bigger effect. Effect size d is the difference measured in standard deviations; 0.2 is
        conventionally small, 0.5 medium, 0.8 large. Small effects need hundreds of observations.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   A/B test: two-proportion z-test with a confidence interval for the lift.
--------------------------------------------------------------------------- */

const AB_PRESETS = {
  clear: { nA: 5000, cA: 500, nB: 5000, cB: 600, label: "Clear win" },
  small: { nA: 400, cA: 40, nB: 400, cB: 48, label: "Too few visitors" },
  huge: { nA: 400000, cA: 40000, nB: 400000, cB: 40800, label: "Huge sample, tiny lift" },
};

function AbTest() {
  const [s, setS] = useState(AB_PRESETS.small);
  const pA = s.cA / s.nA;
  const pB = s.cB / s.nB;
  const pool = (s.cA + s.cB) / (s.nA + s.nB);
  const z = (pB - pA) / Math.sqrt(pool * (1 - pool) * (1 / s.nA + 1 / s.nB));
  const p = 2 * (1 - normCdf(Math.abs(z)));
  const seDiff = Math.sqrt((pA * (1 - pA)) / s.nA + (pB * (1 - pB)) / s.nB);
  const lo = pB - pA - 1.96 * seDiff;
  const hi = pB - pA + 1.96 * seDiff;

  const field = (k, label) => (
    <label className="block">
      <span className="text-[0.6875rem] uppercase tracking-wide text-gray-500">{label}</span>
      <input
        type="number"
        min="1"
        value={s[k]}
        onChange={(e) => setS((o) => ({ ...o, [k]: Math.max(0, Number(e.target.value) || 0) }))}
        className="w-full mt-1 bg-black/50 border border-white/15 rounded-lg px-3 py-2 font-mono text-sm text-white"
      />
    </label>
  );

  const valid = s.nA > 0 && s.nB > 0 && s.cA <= s.nA && s.cB <= s.nB && pool > 0 && pool < 1;

  return (
    <Panel
      tone="emerald"
      title="Did the new checkout button work?"
      actions={Object.entries(AB_PRESETS).map(([k, v]) => (
        <Button key={k} tone="emerald" onClick={() => setS(v)}>{v.label}</Button>
      ))}
    >
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 mb-4">
        {field("nA", "A visitors")}
        {field("cA", "A conversions")}
        {field("nB", "B visitors")}
        {field("cB", "B conversions")}
      </div>
      {valid ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
            <Metric label="Rate A → B" value={`${pct(pA)} → ${pct(pB)}`} />
            <Metric label="z" value={fmt(z, 2)} tone="amber" />
            <Metric label="p-value (two-sided)" value={fmtP(p)} tone={p < 0.05 ? "emerald" : "rose"} />
            <Metric label="95% CI for B − A" value={`${(lo * 100).toFixed(2)} to ${(hi * 100).toFixed(2)} pts`} tone="indigo" />
          </div>
          <p className="text-sm text-gray-300 leading-relaxed m-0">
            {p < 0.05
              ? lo > 0
                ? `Significant. B's rate is higher, and the interval says the true lift is between ${(lo * 100).toFixed(2)} and ${(hi * 100).toFixed(2)} percentage points. Whether that is worth shipping is a business question, not a statistical one.`
                : "Significant, with B lower than A."
              : `Not significant. The interval runs from ${(lo * 100).toFixed(2)} to ${(hi * 100).toFixed(2)} points and includes 0 — B could be better, worse or the same. This is "not enough evidence", not "no difference".`}
          </p>
        </>
      ) : (
        <p className="text-sm text-rose-300 m-0">Conversions must be between 0 and the number of visitors.</p>
      )}
      <p className="text-xs text-gray-500 leading-relaxed mt-3 mb-0">
        Try <em>Huge sample, tiny lift</em>: 10.0% → 10.2% is highly significant with 800,000 visitors. Statistical
        significance says the effect is probably not zero; only the confidence interval tells you if it is big enough
        to matter.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Multiple testing: 20 A/A tests where nothing is going on.
--------------------------------------------------------------------------- */

function welchP(a, b) {
  const va = variance(a) / a.length;
  const vb = variance(b) / b.length;
  const t = (mean(a) - mean(b)) / Math.sqrt(va + vb);
  const df = (va + vb) ** 2 / (va ** 2 / (a.length - 1) + vb ** 2 / (b.length - 1));
  return 2 * (1 - tCdf(Math.abs(t), df));
}

function MultipleTesting() {
  const [seed, setSeed] = useState(3);
  const [bonf, setBonf] = useState(false);
  const pvals = useMemo(() => {
    const r = rng(seed * 104729);
    return Array.from({ length: 20 }, () => {
      const a = Array.from({ length: 30 }, () => 100 + 15 * randn(r));
      const b = Array.from({ length: 30 }, () => 100 + 15 * randn(r));
      return welchP(a, b);
    });
  }, [seed]);
  const cut = bonf ? 0.05 / 20 : 0.05;
  const hits = pvals.filter((p) => p < cut).length;

  return (
    <Panel
      tone="amber"
      title="Twenty tests where nothing is going on"
      actions={
        <>
          <Button tone="amber" onClick={() => setSeed((s) => s + 1)}>Run 20 new tests</Button>
          <Button tone="amber" onClick={() => setBonf((b) => !b)}>{bonf ? "Plain α = 0.05" : "Apply Bonferroni"}</Button>
        </>
      }
    >
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        Each bar is a t-test comparing two groups drawn from the <em>same</em> population, like testing 20 button
        colours that do nothing. Every "significant" result is a false positive.
      </p>
      <div className="flex items-end gap-1 h-36 mb-2 relative">
        <div className="absolute left-0 right-0 border-t border-dashed border-rose-400" style={{ bottom: `${Math.min(100, (-Math.log10(cut) / 3) * 100)}%` }} />
        {pvals.map((p, i) => {
          const h = Math.min(100, (-Math.log10(Math.max(p, 1e-3)) / 3) * 100);
          return <div key={i} className={`flex-1 rounded-t ${p < cut ? "bg-rose-500" : "bg-slate-600"}`} style={{ height: `${Math.max(3, h)}%`, transition: "height 300ms" }} title={`p = ${p.toFixed(3)}`} />;
        })}
      </div>
      <div className="text-[0.6875rem] text-gray-500 mb-4">Bar height is −log₁₀(p): taller means smaller p. Dashed line: the significance cut-off ({cut === 0.05 ? "0.05" : "0.0025"}).</div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Metric label="False positives" value={hits} tone={hits ? "rose" : "emerald"} />
        <Metric label="Expected by chance" value={bonf ? "0.05" : "1"} sub="20 × cut-off" />
        <Metric label="P(at least one)" value={pct(1 - (1 - cut) ** 20, 0)} tone="amber" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        Run 20 tests at α = 0.05 and there is a 64% chance at least one comes up "significant". Testing many metrics,
        segments or variants and reporting the winner is how p-hacking happens, often innocently. Bonferroni divides α
        by the number of tests; it is strict but simple. Better still: decide the one primary metric in advance.
      </p>
    </Panel>
  );
}

const TESTS = [
  ["Is one mean different from a target?", "One-sample t-test", "stats.ttest_1samp"],
  ["Do two independent groups differ in mean?", "Two-sample t-test (Welch)", "stats.ttest_ind(equal_var=False)"],
  ["Same subjects before and after?", "Paired t-test", "stats.ttest_rel"],
  ["Do three or more group means differ?", "One-way ANOVA", "stats.f_oneway"],
  ["Do two conversion rates differ?", "Two-proportion z-test", "proportions_ztest"],
  ["Are two categorical variables related?", "Chi-square test of independence", "stats.chi2_contingency"],
  ["Two groups, skewed or ordinal data?", "Mann–Whitney U", "stats.mannwhitneyu"],
  ["Is a correlation non-zero?", "Pearson / Spearman test", "stats.pearsonr / spearmanr"],
];

export default function HypothesisTesting() {
  const toc = [
    { label: "The Logic", hash: "logic" },
    { label: "p-values (interactive)", hash: "pvalue" },
    { label: "Type I, Type II & Power", hash: "errors" },
    { label: "An A/B Test", hash: "ab" },
    { label: "Choosing a Test", hash: "choose" },
    { label: "Multiple Testing Trap", hash: "multiple" },
    { label: "What p-values Are Not", hash: "not" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Hypothesis Testing"
      intro="A formal way to ask whether a pattern in a sample is real or could be chance: assume nothing is going on, and measure how surprising your data would be if that were true."
      toc={toc}
    >
      <Section id="logic" title="The Logic" lead="Hypothesis testing works like a court: the defendant (no effect) is presumed innocent, and the data must provide evidence beyond reasonable doubt to convict.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <Card title="H₀ — the null hypothesis" tone="indigo"><p>The boring explanation: no difference, no effect, no relationship. "The new button converts the same as the old one."</p></Card>
          <Card title="H₁ — the alternative" tone="emerald"><p>What you suspect: there is a difference. Decide whether it is two-sided (≠) or one-sided (&gt; or &lt;) before looking at the data.</p></Card>
        </div>
        <ol className="grid grid-cols-1 sm:grid-cols-5 gap-2 list-none p-0">
          {[
            ["State H₀ and H₁", "and pick α, usually 0.05"],
            ["Collect data", "sample size planned in advance"],
            ["Compute a statistic", "z, t, χ², F…"],
            ["Find the p-value", "P(this extreme | H₀)"],
            ["Decide", "p < α → reject H₀"],
          ].map(([t, d], i) => (
            <li key={t} className="p-3 rounded-xl border border-white/10 bg-white/5">
              <div className="text-xs font-mono text-indigo-300 mb-1">step {i + 1}</div>
              <div className="text-sm font-semibold text-white">{t}</div>
              <div className="text-xs text-gray-500">{d}</div>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="pvalue" title="The p-value" lead="The probability, assuming H₀ is true, of getting a result at least as extreme as the one you observed. Small p means your data would be surprising if nothing were going on.">
        <PValueLab />
      </Section>

      <Section id="errors" title="Type I, Type II and Power">
        <div className="overflow-x-auto rounded-xl border border-white/10 mb-6">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-gray-300">
              <tr>
                <th className="p-3" />
                <th className="p-3">H₀ actually true (no effect)</th>
                <th className="p-3">H₀ actually false (real effect)</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              <tr>
                <td className="p-3 text-white">You reject H₀</td>
                <td className="p-3 text-rose-300">Type I error — false positive. Probability α.</td>
                <td className="p-3 text-emerald-300">Correct — power, 1 − β.</td>
              </tr>
              <tr>
                <td className="p-3 text-white">You keep H₀</td>
                <td className="p-3 text-emerald-300">Correct.</td>
                <td className="p-3 text-amber-300">Type II error — missed effect. Probability β.</td>
              </tr>
            </tbody>
          </table>
        </div>
        <PowerLab />
      </Section>

      <Section id="ab" title="An A/B Test, End to End" lead="Two versions, randomly assigned visitors, one pre-chosen metric. The two-proportion z-test asks whether the conversion rates differ by more than chance.">
        <AbTest />
      </Section>

      <Section id="choose" title="Choosing a Test" lead="Match the test to the question and the type of data.">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-gray-300">
              <tr>
                <th className="p-3">Question</th>
                <th className="p-3">Test</th>
                <th className="p-3">Python</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-gray-400">
              {TESTS.map(([q, t, f]) => (
                <tr key={t}>
                  <td className="p-3">{q}</td>
                  <td className="p-3 text-white">{t}</td>
                  <td className="p-3 font-mono text-xs text-indigo-300">{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          t-tests assume roughly normal sample means — the <a href="#/ml/central-limit-theorem" className="text-blue-400 hover:underline">Central Limit Theorem</a> usually
          provides that for moderate n. Welch's version does not assume equal variances and is the safer default.
        </p>
      </Section>

      <Section id="multiple" title="The Multiple Testing Trap">
        <MultipleTesting />
      </Section>

      <Section id="not" title="What a p-value Is Not">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Not the probability H₀ is true" tone="rose"><p>p = 0.03 does not mean a 3% chance of no effect. It is the probability of the data given H₀, not of H₀ given the data.</p></Card>
          <Card title="Not the size of the effect" tone="rose"><p>A tiny, useless effect can have p &lt; 0.0001 with enough data. Report effect sizes and confidence intervals.</p></Card>
          <Card title="p > 0.05 is not proof of no effect" tone="amber"><p>It means the data could not rule out chance. With low power, real effects routinely come out non-significant.</p></Card>
          <Card title="0.05 is a convention" tone="amber"><p>p = 0.049 and p = 0.051 are practically identical evidence. Treat α as a decision rule set in advance, not a truth threshold.</p></Card>
        </div>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`import numpy as np
from scipy import stats
from statsmodels.stats.proportion import proportions_ztest, confint_proportions_2indep
from statsmodels.stats.power import TTestIndPower

# One-sample t-test: do deliveries average 30 minutes?
times = np.array([31.2, 28.5, 35.1, 30.8, 33.0, 29.4, 34.2, 31.9, 30.1, 32.6])
t, p = stats.ttest_1samp(times, popmean=30)

# Two independent groups (Welch)
t, p = stats.ttest_ind(group_a, group_b, equal_var=False)

# A/B test on conversion rates
z, p = proportions_ztest(count=[600, 500], nobs=[5000, 5000])
lo, hi = confint_proportions_2indep(600, 5000, 500, 5000)   # CI for the difference

# Plan the sample size BEFORE the experiment:
# per-group n to detect d = 0.3 with 80% power at alpha = 0.05
n = TTestIndPower().solve_power(effect_size=0.3, alpha=0.05, power=0.8)
print(round(n))            # ≈ 175 per group

# Many tests? Adjust the p-values
from statsmodels.stats.multitest import multipletests
reject, p_adj, _, _ = multipletests(pvals, alpha=0.05, method="bonferroni")`}
        />
        <Note tone="indigo">
          The power panel above uses the one-sided, one-sample formula; the two-sample, two-sided version in the code
          needs more data for the same d — about 175 per group rather than 69.
        </Note>
      </Section>

      <KnowledgeCheck questions={questionsFor("stats-inference")} />
    </GuideLayout>
  );
}

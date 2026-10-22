import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Segmented, Metric, Histogram, Card, Note, Section, Button } from "../components/VizKit";
import { rng, randn, mean, median, std, quantile, histogram, fmt, linfit } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "data cleaning", "data cleansing", "missing values", "imputation", "mean imputation", "median imputation",
  "MCAR", "MAR", "MNAR", "duplicates", "outliers", "IQR", "z-score", "winsorize", "data types", "standardise text",
  "inconsistent categories", "data quality", "SimpleImputer", "dropna", "fillna",
];

/* ---------------------------------------------------------------------------
   A deliberately messy customer table, cleaned one step at a time. Every
   number in the log is computed from the rows, not typed in.
--------------------------------------------------------------------------- */

const RAW = [
  { id: 1, name: "Asha Rao", age: "34", city: "Bengaluru", income: "72000", signup: "2025-03-14" },
  { id: 2, name: "rahul mehta ", age: "29", city: "bangalore", income: "58,000", signup: "14/03/2025" },
  { id: 3, name: "Asha Rao", age: "34", city: "Bengaluru", income: "72000", signup: "2025-03-14" },
  { id: 4, name: "Priya S", age: "", city: "Mumbai", income: "65000", signup: "2025-04-02" },
  { id: 5, name: "Vikram", age: "212", city: "MUMBAI", income: "81000", signup: "2025-04-10" },
  { id: 6, name: "Neha K", age: "41", city: "Delhi", income: "", signup: "2025-05-01" },
  { id: 7, name: "Arjun", age: "27", city: "New Delhi", income: "4,900,000", signup: "2025-05-19" },
  { id: 8, name: "Kiran", age: "-3", city: "Hyderabad", income: "54000", signup: "2025/06/07" },
  { id: 9, name: "Meera", age: "38", city: " hyderabad", income: "61k", signup: "2025-06-21" },
  { id: 10, name: "Sanjay", age: "45", city: "Chennai", income: "69000", signup: "N/A" },
  { id: 11, name: "Divya", age: "31", city: "chennai ", income: "63000", signup: "2025-07-30" },
  { id: 12, name: "Rohan", age: "36", city: "Bombay", income: "70000", signup: "2025-08-12" },
];

const COLS = ["name", "age", "city", "income", "signup"];

const CITY = { bangalore: "Bengaluru", bengaluru: "Bengaluru", bombay: "Mumbai", mumbai: "Mumbai", "new delhi": "Delhi", delhi: "Delhi", hyderabad: "Hyderabad", chennai: "Chennai" };

const squash = (s) => s.trim().replace(/\s+/g, " ");
const titleCase = (s) => squash(s).split(" ").map((w) => w[0].toUpperCase() + w.slice(1).toLowerCase()).join(" ");
function parseIncome(v) {
  if (typeof v === "number" || v === null) return v;
  const s = v.trim().toLowerCase().replace(/,/g, "");
  if (!s) return null;
  if (s.endsWith("k")) return Number(s.slice(0, -1)) * 1000;
  return Number(s);
}
function parseDate(v) {
  if (v === null) return null;
  const s = v.trim();
  if (!s || /^n\/?a$/i.test(s)) return null;
  let m = s.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);
  if (m) return `${m[3]}-${m[2]}-${m[1]}`;
  m = s.match(/^(\d{4})\/(\d{2})\/(\d{2})$/);
  if (m) return `${m[1]}-${m[2]}-${m[3]}`;
  return s;
}
const parseAge = (v) => (typeof v === "number" || v === null ? v : v.trim() === "" ? null : Number(v));

const STEPS = [
  { t: "Standardise text", d: "Trim spaces, fix capitalisation, map city aliases to one spelling." },
  { t: "Fix types & formats", d: "Turn '58,000' and '61k' into numbers, every date into YYYY-MM-DD, 'N/A' into a real missing value." },
  { t: "Remove duplicates", d: "Identical rows are one customer counted twice." },
  { t: "Invalid → missing", d: "An age of 212 or −3 is not an outlier, it is an error. Mark it missing rather than guess." },
  { t: "Handle outliers", d: "Cap incomes above the IQR upper fence at the fence (winsorising)." },
  { t: "Impute missing", d: "Fill missing age and income with the median. Leave the missing date missing, and flag it." },
];

function runPipeline(upto) {
  let rows = RAW.map((r) => ({ ...r, flags: {} }));
  let changed = new Set();
  let log = "";
  for (let s = 0; s < upto; s++) {
    changed = new Set();
    const mark = (r, c) => changed.add(`${r.id}:${c}`);
    if (s === 0) {
      let n = 0;
      rows = rows.map((r) => {
        const name = titleCase(r.name);
        const key = squash(r.city).toLowerCase();
        const city = CITY[key] || squash(r.city);
        if (name !== r.name) { mark(r, "name"); n++; }
        if (city !== r.city) { mark(r, "city"); n++; }
        return { ...r, name, city };
      });
      log = `Standardised ${n} text cells. "bangalore", "MUMBAI", "Bombay" and " hyderabad" now match their groups.`;
    }
    if (s === 1) {
      let n = 0;
      rows = rows.map((r) => {
        const age = parseAge(r.age);
        const income = parseIncome(r.income);
        const signup = parseDate(r.signup);
        if (String(income) !== String(r.income)) { mark(r, "income"); n++; }
        if (signup !== r.signup) { mark(r, "signup"); n++; }
        return { ...r, age, income, signup };
      });
      log = `Converted ${n} cells to proper numbers and ISO dates. Age and income are now numeric columns you can average.`;
    }
    if (s === 2) {
      const seen = new Set();
      const removed = [];
      rows = rows.filter((r) => {
        const k = JSON.stringify(COLS.map((c) => r[c]));
        if (seen.has(k)) { removed.push(r.id); return false; }
        seen.add(k);
        return true;
      });
      log = `Removed ${removed.length} duplicate row${removed.length === 1 ? "" : "s"} (id ${removed.join(", ")}). Deduplicate after standardising: "asha rao " and "Asha Rao" only match once the text is cleaned.`;
    }
    if (s === 3) {
      let n = 0;
      rows = rows.map((r) => {
        if (r.age !== null && (r.age < 0 || r.age > 110)) { mark(r, "age"); n++; return { ...r, age: null, flags: { ...r.flags, age: "invalid" } }; }
        return r;
      });
      log = `${n} impossible ages set to missing. Guessing a "corrected" value would invent data.`;
    }
    if (s === 4) {
      const vals = rows.map((r) => r.income).filter((v) => v !== null);
      const q1 = quantile(vals, 0.25);
      const q3 = quantile(vals, 0.75);
      const fence = q3 + 1.5 * (q3 - q1);
      let n = 0;
      rows = rows.map((r) => {
        if (r.income !== null && r.income > fence) { mark(r, "income"); n++; return { ...r, income: Math.round(fence), flags: { ...r.flags, income: "capped" } }; }
        return r;
      });
      log = `Q1 = ${q1.toLocaleString()}, Q3 = ${q3.toLocaleString()}, upper fence = Q3 + 1.5 × IQR = ${Math.round(fence).toLocaleString()}. Capped ${n} value.`;
    }
    if (s === 5) {
      const ages = rows.map((r) => r.age).filter((v) => v !== null);
      const incs = rows.map((r) => r.income).filter((v) => v !== null);
      const mAge = median(ages);
      const mInc = median(incs);
      rows = rows.map((r) => {
        const out = { ...r, flags: { ...r.flags } };
        if (r.age === null) { mark(r, "age"); out.age = mAge; out.flags.age = "imputed"; }
        if (r.income === null) { mark(r, "income"); out.income = mInc; out.flags.income = "imputed"; }
        if (r.signup === null) { out.flags.signup = "missing"; }
        return out;
      });
      log = `Filled age with median ${mAge} and income with median ${mInc.toLocaleString()}. The missing signup date stays missing, with a flag column recording that.`;
    }
  }
  return { rows, changed, log };
}

const show = (v, col) => {
  if (v === null || v === undefined || v === "") return null;
  if (col === "income" && typeof v === "number") return v.toLocaleString();
  return String(v);
};

function CleaningPipeline() {
  const [step, setStep] = useState(0);
  const { rows, changed, log } = useMemo(() => runPipeline(step), [step]);

  const incomes = rows.map((r) => r.income).filter((v) => typeof v === "number");
  const missing = rows.reduce((a, r) => a + COLS.filter((c) => r[c] === null || r[c] === "").length, 0);

  return (
    <Panel
      tone="emerald"
      title="Clean a messy table, one step at a time"
      actions={
        <>
          <Button tone="emerald" onClick={() => setStep((s) => Math.max(0, s - 1))} disabled={step === 0}>← Undo</Button>
          <Button tone="emerald" onClick={() => setStep((s) => Math.min(STEPS.length, s + 1))} disabled={step === STEPS.length}>
            {step === STEPS.length ? "All clean" : `Apply: ${STEPS[step].t} →`}
          </Button>
          <Button tone="emerald" onClick={() => setStep(0)}>Reset</Button>
        </>
      }
    >
      <ol className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-1.5 mb-4 list-none p-0">
        {STEPS.map((s, i) => (
          <li
            key={s.t}
            className={`rounded-lg border px-2 py-1.5 text-[0.6875rem] leading-snug ${
              i < step ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-200" : "border-white/10 bg-white/5 text-gray-500"
            }`}
          >
            <span className="font-mono mr-1">{i + 1}.</span>
            {s.t}
          </li>
        ))}
      </ol>

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 mb-3">
        <table className="w-full text-xs sm:text-sm font-mono min-w-[560px]">
          <thead>
            <tr className="text-left text-gray-500">
              <th className="p-2 font-normal">id</th>
              {COLS.map((c) => (
                <th key={c} className="p-2 font-normal">{c}</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {rows.map((r) => (
              <tr key={r.id} className="border-t border-white/5">
                <td className="p-2 text-gray-600">{r.id}</td>
                {COLS.map((c) => {
                  const v = show(r[c], c);
                  const hit = changed.has(`${r.id}:${c}`);
                  const flag = r.flags[c];
                  return (
                    <td
                      key={c}
                      className={`p-2 whitespace-pre transition-colors ${hit ? "bg-amber-500/20 text-amber-100" : "text-gray-300"}`}
                    >
                      {v === null ? <span className="text-rose-400">missing</span> : typeof r[c] === "string" && step < 2 ? `"${v}"` : v}
                      {flag && <span className="ml-1 text-[0.625rem] text-purple-300">{flag}</span>}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <Metric label="Rows" value={rows.length} />
        <Metric label="Missing cells" value={missing} tone={missing ? "rose" : "emerald"} />
        <Metric label="Mean income" value={step >= 2 && incomes.length ? Math.round(mean(incomes)).toLocaleString() : "not numeric"} tone="amber" />
        <Metric label="Median income" value={step >= 2 && incomes.length ? Math.round(median(incomes)).toLocaleString() : "not numeric"} tone="blue" />
      </div>

      <p className="text-sm text-gray-300 leading-relaxed m-0">
        {step === 0 ? "Amber cells are the ones the last step changed. Quotes show the raw strings — note the trailing spaces. Press Apply to start." : log}
      </p>
      {step >= 2 && step < 5 && (
        <p className="text-xs text-gray-500 leading-relaxed mt-2 mb-0">
          Look at mean vs median income: one bad value drags the mean to several times the median. The median barely
          notices. That gap is your cue to check for outliers.
        </p>
      )}
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Imputation: what each strategy does to the distribution, under two
   different reasons for the data being missing.
--------------------------------------------------------------------------- */

const IMP_DATA = (() => {
  const r = rng(21);
  return Array.from({ length: 400 }, () => {
    const age = 22 + r() * 40;
    const income = Math.exp(10.2 + 0.025 * age + 0.3 * randn(r)) / 1000; // in thousands
    return { age, income, u: r() };
  });
})();
const IMP_TRUE = IMP_DATA.map((d) => d.income);
const IMP_SORTED = [...IMP_TRUE].sort((a, b) => a - b);

function ImputationLab() {
  const [mech, setMech] = useState("mcar");
  const [method, setMethod] = useState("median");

  const res = useMemo(() => {
    // MCAR: 30% missing regardless of value. MNAR: high earners skip the question.
    const missing = IMP_DATA.map((d) => {
      if (mech === "mcar") return d.u < 0.3;
      const rank = IMP_SORTED.indexOf(d.income) / IMP_DATA.length;
      return d.u < 0.05 + 0.5 * rank;
    });
    const observed = IMP_DATA.filter((_, i) => !missing[i]);
    const obsInc = observed.map((d) => d.income);
    let filled = [];
    if (method === "drop") filled = [];
    if (method === "mean") filled = missing.filter(Boolean).map(() => mean(obsInc));
    if (method === "median") filled = missing.filter(Boolean).map(() => median(obsInc));
    if (method === "regression") {
      const fit = linfit(observed.map((d) => d.age), observed.map((d) => Math.log(d.income)));
      filled = IMP_DATA.filter((_, i) => missing[i]).map((d) => Math.exp(fit.a + fit.b * d.age));
    }
    const all = [...obsInc, ...filled];
    return { obsInc, filled, all, nMissing: missing.filter(Boolean).length };
  }, [mech, method]);

  const lo = 20;
  const hi = 240;
  const obsCounts = histogram(res.obsInc, 40, lo, hi);
  const fillCounts = histogram(res.filled, 40, lo, hi);

  const trueMean = mean(IMP_TRUE);
  const trueSd = std(IMP_TRUE);
  const estMean = mean(res.all);
  const estSd = std(res.all);

  return (
    <Panel tone="amber" title="What imputation does to the data">
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        400 incomes (in thousands), {res.nMissing} of them missing. Blue bars are observed values, amber bars are the
        values the method invented. Compare the result with the true, complete data.
      </p>
      <div className="flex flex-col sm:flex-row gap-3 mb-4">
        <div>
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Why is it missing?</div>
          <Segmented tone="amber" value={mech} onChange={setMech} options={[{ v: "mcar", label: "At random (MCAR)" }, { v: "mnar", label: "High earners skip it (MNAR)" }]} />
        </div>
        <div>
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Strategy</div>
          <Segmented
            tone="amber"
            value={method}
            onChange={setMethod}
            options={[
              { v: "drop", label: "Drop rows" },
              { v: "mean", label: "Mean" },
              { v: "median", label: "Median" },
              { v: "regression", label: "Predict from age" },
            ]}
          />
        </div>
      </div>
      <div className="rounded-xl bg-black/40 border border-white/10 p-3 mb-4">
        <Histogram counts={obsCounts} stack={fillCounts} min={lo} max={hi} color="#60a5fa" tickFormat={(v) => `${v.toFixed(0)}k`} marks={[{ x: trueMean, color: "#f472b6", label: "true mean" }]} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <Metric label="True mean" value={fmt(trueMean, 1)} />
        <Metric label="Estimated mean" value={fmt(estMean, 1)} tone={Math.abs(estMean - trueMean) > 2 ? "rose" : "emerald"} />
        <Metric label="True SD" value={fmt(trueSd, 1)} />
        <Metric label="Estimated SD" value={fmt(estSd, 1)} tone={Math.abs(estSd - trueSd) > 3 ? "rose" : "emerald"} />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        Mean and median imputation pile every gap onto one value — a tall spike — which shrinks the spread and weakens
        any correlation with other columns. Under MNAR every simple method is biased, because the values you need are
        exactly the ones that are gone; predicting from a related column recovers some of it.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Outlier detection: IQR fences vs z-scores, including masking.
--------------------------------------------------------------------------- */

const DELIVERY = (() => {
  const r = rng(11);
  const base = Array.from({ length: 36 }, () => Math.round((30 + 5 * randn(r)) * 10) / 10);
  return [...base, 70, 78, 95];
})();

function OutlierLab() {
  const [k, setK] = useState(1.5);
  const [z, setZ] = useState(3);
  const q1 = quantile(DELIVERY, 0.25);
  const q3 = quantile(DELIVERY, 0.75);
  const lo = q1 - k * (q3 - q1);
  const hi = q3 + k * (q3 - q1);
  const m = mean(DELIVERY);
  const s = std(DELIVERY);
  const W = 360;
  const sx = (v) => 10 + ((v - 10) / 90) * (W - 20);

  const row = (y, flagged, label, color) => (
    <g>
      <text x="10" y={y - 14} fill="#9ca3af" fontSize="11">{label}</text>
      <line x1="10" y1={y} x2={W - 10} y2={y} stroke="rgba(255,255,255,0.1)" />
      {DELIVERY.map((v, i) => (
        <circle key={i} cx={sx(v)} cy={y + ((i % 3) - 1) * 4} r="4.5" fill={flagged(v) ? color : "#475569"} stroke="rgba(0,0,0,0.5)" />
      ))}
    </g>
  );

  const iqrFlag = (v) => v < lo || v > hi;
  const zFlag = (v) => Math.abs((v - m) / s) > z;

  return (
    <Panel tone="rose" title="Two ways to call something an outlier">
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        39 delivery times in minutes. Three are suspicious (70, 78, 95). Each row flags points in colour.
      </p>
      <svg viewBox={`0 0 ${W} 150`} className="w-full h-auto block mb-2">
        {row(40, iqrFlag, `IQR fences: outside [${fmt(lo, 1)}, ${fmt(hi, 1)}]`, "#fb7185")}
        {row(110, zFlag, `z-score: |x − ${fmt(m, 1)}| / ${fmt(s, 1)} > ${z}`, "#fbbf24")}
        {[10, 40, 70, 100].map((t) => (
          <text key={t} x={sx(t)} y="146" fill="#6b7280" fontSize="11" textAnchor="middle">{t}</text>
        ))}
      </svg>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-3">
        <Slider tone="rose" label="IQR multiplier k" value={k} min={1} max={3} step={0.1} onChange={setK} format={(v) => v.toFixed(1)} />
        <Slider tone="amber" label="z threshold" value={z} min={1.5} max={4} step={0.1} onChange={setZ} format={(v) => v.toFixed(1)} />
      </div>
      <div className="grid grid-cols-2 gap-2 mb-3">
        <Metric label="IQR flags" value={DELIVERY.filter(iqrFlag).length} tone="rose" />
        <Metric label="z-score flags" value={DELIVERY.filter(zFlag).length} tone="amber" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        At the usual z &gt; 3 the z-score catches only 95. The outliers themselves inflate the standard deviation to{" "}
        {fmt(s, 1)} minutes, so they hide each other — this is called <strong className="text-gray-300">masking</strong>.
        Quartiles barely move when a few extreme values arrive, which is why the IQR rule is the safer default.
      </p>
    </Panel>
  );
}

export default function DataCleaning() {
  const toc = [
    { label: "Why Cleaning Matters", hash: "why" },
    { label: "Step-by-step Pipeline", hash: "pipeline" },
    { label: "Missing Values", hash: "missing" },
    { label: "Outliers", hash: "outliers" },
    { label: "Other Problems", hash: "other" },
    { label: "Cleaning Checklist", hash: "checklist" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Data Cleaning"
      intro="Real data arrives with typos, duplicates, gaps and impossible values. Cleaning turns it into something a model can learn from — without inventing what is not there."
      toc={toc}
    >
      <Section
        id="why"
        title="Why Cleaning Matters"
        lead="Models do not know that 'Bombay' and 'Mumbai' are the same city or that an age of 212 is a typo. They learn whatever is in the table. Cleaning is how you make sure what is in the table is true."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Garbage in, garbage out" tone="rose"><p>A duplicated customer counts twice in every average; a stray unit error can dominate a linear model's loss.</p></Card>
          <Card title="It is most of the work" tone="amber"><p>In practice, sourcing, cleaning and understanding data take far more time than choosing and tuning the model.</p></Card>
          <Card title="Every choice is a decision" tone="indigo"><p>Dropping, capping or imputing all change the data. Write down what you did and why, so it can be repeated on new data.</p></Card>
        </div>
      </Section>

      <Section id="pipeline" title="A Cleaning Pipeline, Step by Step" lead="Order matters. Standardise first so duplicates become visible; fix types so numbers can be compared; only then look for outliers and fill gaps.">
        <CleaningPipeline />
      </Section>

      <Section id="missing" title="Missing Values" lead="Before choosing how to fill a gap, ask why it is there. The answer decides which fixes are safe.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
          <Card title="MCAR — completely at random" tone="emerald"><p>A sensor dropped packets at random. Missingness is unrelated to anything. Dropping rows is unbiased, just wasteful.</p></Card>
          <Card title="MAR — at random, given other columns" tone="amber"><p>Younger people skip the income question more often, but within an age group it is random. Predicting from the related column (age) handles it.</p></Card>
          <Card title="MNAR — depends on the missing value" tone="rose"><p>High earners skip the income question because it is high. No method using only the observed data fully fixes this. Flag it and say so.</p></Card>
        </div>
        <ImputationLab />
        <div className="mt-5">
          <Note tone="indigo">
            A cheap, effective habit: add a <span className="font-mono">was_missing</span> indicator column alongside any
            imputed column. Missingness is often informative in itself, and the model can use it.
          </Note>
        </div>
      </Section>

      <Section id="outliers" title="Outliers" lead="An outlier is a value far from the rest. It might be an error to fix, or the most important row in the dataset. Detect first, then decide.">
        <OutlierLab />
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mt-6">
          <Card title="Fix" tone="emerald"><p>Clear errors with a known cause: a price in paise instead of rupees.</p></Card>
          <Card title="Remove" tone="rose"><p>Impossible values you cannot recover. Record how many.</p></Card>
          <Card title="Cap (winsorise)" tone="amber"><p>Real but extreme values that would dominate a linear model.</p></Card>
          <Card title="Keep" tone="blue"><p>Fraud, failures, rare diseases — sometimes the outlier is the point.</p></Card>
        </div>
      </Section>

      <Section id="other" title="Other Problems to Look For">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ["Inconsistent units", "Heights in cm and inches in one column; revenue in rupees and lakhs. Convert to one unit and name it in the column."],
            ["Wrong data types", "Numbers stored as text, IDs stored as numbers (and losing leading zeros), dates as strings. Fix types before any maths."],
            ["Categorical noise", "'Yes', 'Y', 'yes ', 'TRUE' all meaning the same thing. Map to a fixed vocabulary and fail loudly on anything unknown."],
            ["Leaky columns", "A column recorded after the outcome — 'refund_issued' when predicting complaints. It will look like a brilliant feature and is useless in production."],
            ["Stale or shifted data", "Records from before a product change that no longer resemble today. Check distributions over time."],
            ["Structural errors", "Merged cells, header rows repeated mid-file, totals rows included as data. Common in spreadsheet exports."],
          ].map(([t, d]) => (
            <Card key={t} title={t}><p>{d}</p></Card>
          ))}
        </div>
      </Section>

      <Section id="checklist" title="Cleaning Checklist">
        <ol className="space-y-2 text-sm text-gray-300 list-decimal pl-5 max-w-3xl">
          <li>Split off a test set first, and fit every cleaning statistic (medians, fences, encoders) on training data only.</li>
          <li>Profile each column: type, missing count, unique values, min and max.</li>
          <li>Standardise text and categories, then remove exact and near duplicates.</li>
          <li>Fix types and units. Turn placeholder strings like "N/A", "-", "?" into real missing values.</li>
          <li>Set impossible values to missing; investigate outliers before touching them.</li>
          <li>Impute with a strategy that matches why the data is missing, and add indicator columns.</li>
          <li>Re-profile and compare to step 2. Write the whole thing as a function you can rerun on new data.</li>
        </ol>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`import numpy as np
import pandas as pd
from sklearn.compose import ColumnTransformer
from sklearn.impute import SimpleImputer
from sklearn.pipeline import make_pipeline
from sklearn.preprocessing import OneHotEncoder, StandardScaler

CITY = {"bangalore": "Bengaluru", "bombay": "Mumbai", "new delhi": "Delhi"}

def clean(df: pd.DataFrame) -> pd.DataFrame:
    df = df.copy()
    # 1. standardise text
    df["name"] = df["name"].str.strip().str.title()
    city = df["city"].str.strip().str.lower()
    df["city"] = city.map(CITY).fillna(city.str.title())
    # 2. types and formats
    inc = df["income"].astype(str).str.lower().str.replace(",", "", regex=False)
    df["income"] = pd.to_numeric(inc.str.replace("k", "e3", regex=False), errors="coerce")
    df["age"] = pd.to_numeric(df["age"], errors="coerce")
    df["signup"] = pd.to_datetime(df["signup"].replace({"N/A": np.nan}),
                                  format="mixed", dayfirst=True, errors="coerce")
    # 3. duplicates, 4. impossible values
    df = df.drop_duplicates()
    df.loc[~df["age"].between(0, 110), "age"] = np.nan
    df["signup_missing"] = df["signup"].isna()
    return df

train = clean(train_raw)

# 5-6. outlier caps and imputation are LEARNED — fit them on train only
q1, q3 = train["income"].quantile([0.25, 0.75])
upper = q3 + 1.5 * (q3 - q1)
train["income"] = train["income"].clip(upper=upper)

pre = ColumnTransformer([
    ("num", make_pipeline(SimpleImputer(strategy="median", add_indicator=True),
                          StandardScaler()), ["age", "income"]),
    ("cat", make_pipeline(SimpleImputer(strategy="most_frequent"),
                          OneHotEncoder(handle_unknown="ignore")), ["city"]),
])
X_train = pre.fit_transform(train)     # medians come from train...
X_test  = pre.transform(clean(test_raw).assign(
    income=lambda d: d["income"].clip(upper=upper)))  # ...and are reused on test`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("data-prep")} />
    </GuideLayout>
  );
}

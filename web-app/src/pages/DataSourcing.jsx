import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Segmented, Metric, Histogram, Card, Note, Section, Button } from "../components/VizKit";
import { rng, randn, mean, std, histogram, fmt } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "data sourcing", "data collection", "sampling bias", "selection bias", "convenience sample", "stratified sampling",
  "voluntary response bias", "public datasets", "web scraping", "labelling", "annotation", "Cohen's kappa",
  "inter-annotator agreement", "synthetic data", "data licence", "PII", "train test split", "data leakage",
];

/* ---------------------------------------------------------------------------
   A population of 5,000 customers, each with a region and a satisfaction
   score from 0 to 10. Everything the sampling panel shows is drawn from it.
--------------------------------------------------------------------------- */

const REGIONS = [
  { name: "North", share: 0.4, mu: 7.2 },
  { name: "South", share: 0.3, mu: 6.1 },
  { name: "East", share: 0.2, mu: 5.0 },
  { name: "West", share: 0.1, mu: 3.8 },
];

const POPULATION = (() => {
  const r = rng(42);
  const people = [];
  REGIONS.forEach((reg, ri) => {
    const count = Math.round(5000 * reg.share);
    for (let i = 0; i < count; i++) {
      const sat = Math.max(0, Math.min(10, reg.mu + 1.6 * randn(r)));
      // Recently active customers skew happy: activity tracks satisfaction.
      const activity = sat + 1.5 * randn(r);
      people.push({ region: ri, sat, activity });
    }
  });
  return people;
})();

const TRUE_MEAN = mean(POPULATION.map((p) => p.sat));
const ACTIVE_CUTOFF = [...POPULATION].map((p) => p.activity).sort((a, b) => b - a)[Math.floor(POPULATION.length * 0.3)];
const ACTIVE = POPULATION.filter((p) => p.activity >= ACTIVE_CUTOFF);
const BY_REGION = REGIONS.map((_, ri) => POPULATION.filter((p) => p.region === ri));

const METHODS = [
  { v: "random", label: "Simple random", why: "Every customer equally likely. Unbiased: the sample means centre on the truth." },
  { v: "stratified", label: "Stratified", why: "Sample each region in proportion to its size. Still unbiased, and a little less spread because region mix never varies by luck." },
  { v: "convenience", label: "Convenience", why: "Survey whoever used the app this week. Active users are happier, so every estimate lands too high." },
  { v: "voluntary", label: "Voluntary response", why: "Email everyone, analyse whoever replies. Unhappy customers reply more, so the estimate lands too low." },
];

function drawSample(method, n, r) {
  const pick = (arr) => arr[Math.floor(r() * arr.length)];
  if (method === "random") return Array.from({ length: n }, () => pick(POPULATION).sat);
  if (method === "convenience") return Array.from({ length: n }, () => pick(ACTIVE).sat);
  if (method === "stratified") {
    const out = [];
    REGIONS.forEach((reg, ri) => {
      const k = Math.round(n * reg.share);
      for (let i = 0; i < k; i++) out.push(pick(BY_REGION[ri]).sat);
    });
    return out;
  }
  // voluntary: reply probability falls as satisfaction rises
  const out = [];
  while (out.length < n) {
    const p = pick(POPULATION);
    if (r() < 0.9 - 0.085 * p.sat) out.push(p.sat);
  }
  return out;
}

function SamplingLab() {
  const [method, setMethod] = useState("random");
  const [n, setN] = useState(50);
  const [seed, setSeed] = useState(7);

  const result = useMemo(() => {
    const r = rng(seed * 1000 + n);
    const means = Array.from({ length: 300 }, () => mean(drawSample(method, n, r)));
    return { means, avg: mean(means), sd: std(means) };
  }, [method, n, seed]);

  const bias = result.avg - TRUE_MEAN;
  const popCounts = useMemo(() => histogram(POPULATION.map((p) => p.sat), 20, 0, 10), []);
  const meanCounts = histogram(result.means, 40, 3, 9);
  const m = METHODS.find((x) => x.v === method);

  return (
    <Panel
      tone="blue"
      title="Same population, four ways to sample it"
      actions={<Button tone="blue" onClick={() => setSeed((s) => s + 1)}>Redraw 300 samples</Button>}
    >
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        5,000 customers, true average satisfaction <strong className="text-white font-mono">{fmt(TRUE_MEAN)}</strong>.
        Each run draws 300 separate samples of size n and plots where each sample's average landed. A good method
        piles up on the pink line.
      </p>
      <div className="mb-4">
        <Segmented tone="blue" options={METHODS} value={method} onChange={setMethod} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl bg-black/40 border border-white/10 p-3">
          <div className="text-xs text-gray-500 mb-1">Population — satisfaction scores (0–10)</div>
          <Histogram counts={popCounts} min={0} max={10} color="#64748b" marks={[{ x: TRUE_MEAN, color: "#f472b6", label: "truth" }]} tickFormat={(v) => v.toFixed(0)} />
        </div>
        <div className="rounded-xl bg-black/40 border border-white/10 p-3">
          <div className="text-xs text-gray-500 mb-1">Where 300 sample averages landed</div>
          <Histogram
            counts={meanCounts}
            min={3}
            max={9}
            color="#60a5fa"
            marks={[
              { x: TRUE_MEAN, color: "#f472b6", label: "truth" },
              { x: result.avg, color: "#fbbf24", dash: true, label: "avg estimate" },
            ]}
            tickFormat={(v) => v.toFixed(0)}
          />
        </div>
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-4 items-end mb-4">
        <Slider tone="blue" label="Sample size n" value={n} min={10} max={500} step={10} onChange={setN} />
        <div className="grid grid-cols-2 gap-2 sm:w-72">
          <Metric label="Bias" value={Math.abs(bias) < 0.005 ? "0.00" : (bias > 0 ? "+" : "") + fmt(bias)} tone={Math.abs(bias) > 0.15 ? "rose" : "emerald"} sub="avg estimate − truth" />
          <Metric label="Spread" value={fmt(result.sd, 3)} tone="blue" sub="SD of the estimates" />
        </div>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed m-0">{m.why}</p>
      <p className="text-xs text-gray-500 leading-relaxed mt-3 mb-0">
        Now drag n to 500. Spread shrinks for every method — but bias does not move. More data from a biased process
        just makes you confidently wrong.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Two annotators label the same 100 items. Cohen's kappa corrects their raw
   agreement for the agreement they would reach by chance.
--------------------------------------------------------------------------- */

const PRESETS = {
  balanced: { yy: 42, yn: 6, ny: 5, nn: 47 },
  rare: { yy: 1, yn: 5, ny: 5, nn: 89 },
  good: { yy: 9, yn: 1, ny: 1, nn: 89 },
};

function KappaLab() {
  const [c, setC] = useState(PRESETS.balanced);
  const total = c.yy + c.yn + c.ny + c.nn;
  const po = (c.yy + c.nn) / total;
  const aYes = (c.yy + c.yn) / total;
  const bYes = (c.yy + c.ny) / total;
  const pe = aYes * bYes + (1 - aYes) * (1 - bYes);
  const kappa = pe === 1 ? 1 : (po - pe) / (1 - pe);
  const verdict =
    kappa < 0.2 ? ["slight — the labels are close to noise", "rose"] :
    kappa < 0.4 ? ["fair — rewrite the guidelines", "rose"] :
    kappa < 0.6 ? ["moderate — usable with care", "amber"] :
    kappa < 0.8 ? ["substantial", "emerald"] : ["almost perfect", "emerald"];

  const cell = (key, label, tone) => (
    <div className={`rounded-xl border p-3 ${tone}`}>
      <div className="text-[0.6875rem] text-gray-400 mb-1">{label}</div>
      <div className="flex items-center justify-between gap-2">
        <button className="w-8 h-8 rounded-lg bg-white/10 text-white" onClick={() => setC((s) => ({ ...s, [key]: Math.max(0, s[key] - 1) }))} aria-label={`decrease ${label}`}>−</button>
        <span className="font-mono text-xl text-white">{c[key]}</span>
        <button className="w-8 h-8 rounded-lg bg-white/10 text-white" onClick={() => setC((s) => ({ ...s, [key]: s[key] + 1 }))} aria-label={`increase ${label}`}>+</button>
      </div>
    </div>
  );

  return (
    <Panel
      tone="purple"
      title="Do your labellers agree? Cohen's kappa"
      actions={
        <>
          <Button tone="purple" onClick={() => setC(PRESETS.balanced)}>Balanced classes</Button>
          <Button tone="purple" onClick={() => setC(PRESETS.rare)}>Rare class</Button>
          <Button tone="purple" onClick={() => setC(PRESETS.good)}>Rare, done well</Button>
        </>
      }
    >
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        Two annotators each mark the same items as spam or not. Change the counts. Raw agreement looks reassuring;
        kappa asks how much better than chance it is.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_280px] gap-5">
        <div>
          <div className="grid grid-cols-2 gap-2 mb-2">
            {cell("yy", "A: spam · B: spam", "border-emerald-500/30 bg-emerald-500/[0.06]")}
            {cell("yn", "A: spam · B: not", "border-rose-500/30 bg-rose-500/[0.06]")}
            {cell("ny", "A: not · B: spam", "border-rose-500/30 bg-rose-500/[0.06]")}
            {cell("nn", "A: not · B: not", "border-emerald-500/30 bg-emerald-500/[0.06]")}
          </div>
          <div className="text-xs text-gray-500">Green cells are agreements. Total items: {total}.</div>
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
          <Metric label="Raw agreement pₒ" value={fmt(po * 100, 1) + "%"} />
          <Metric label="Chance agreement pₑ" value={fmt(pe * 100, 1) + "%"} sub="if both labelled at random with their own spam rates" />
          <div className="col-span-2 lg:col-span-1">
            <Metric label="κ = (pₒ − pₑ) / (1 − pₑ)" value={fmt(kappa, 3)} tone={verdict[1]} sub={verdict[0]} />
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Press <em>Rare class</em>: 90% raw agreement, yet kappa is only about 0.11, because two people who both say "not
        spam" almost every time will agree 90% of the time without reading anything. Measure kappa on a pilot batch
        before paying for thousands of labels.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Random vs time-based split on time-ordered data.
--------------------------------------------------------------------------- */

function SplitDemo() {
  const [mode, setMode] = useState("random");
  const days = 40;
  const r = rng(3);
  const randomTest = new Set();
  while (randomTest.size < 8) randomTest.add(Math.floor(r() * days));
  const isTest = (d) => (mode === "random" ? randomTest.has(d) : d >= days - 8);

  return (
    <Panel tone="amber" title="Random split vs time split">
      <div className="mb-4">
        <Segmented
          tone="amber"
          value={mode}
          onChange={setMode}
          options={[
            { v: "random", label: "Random rows" },
            { v: "time", label: "By time" },
          ]}
        />
      </div>
      <svg viewBox="0 0 360 64" className="w-full h-auto block mb-3">
        {Array.from({ length: days }, (_, d) => (
          <rect
            key={d}
            x={4 + d * 8.8}
            y="14"
            width="7.6"
            height="30"
            rx="1.5"
            fill={isTest(d) ? "#fbbf24" : "#475569"}
            style={{ transition: "fill 300ms" }}
          />
        ))}
        <text x="4" y="10" fill="#6b7280" fontSize="11">day 1</text>
        <text x="356" y="10" fill="#6b7280" fontSize="11" textAnchor="end">day 40</text>
        <text x="4" y="60" fill="#94a3b8" fontSize="11">grey = train · amber = test</text>
      </svg>
      <p className="text-sm text-gray-300 leading-relaxed m-0">
        {mode === "random"
          ? "Test days are scattered, so the model trains on day 30 and is tested on day 29. It has seen the future. Scores look excellent and collapse in production, where the future is never available."
          : "Train on the past, test on the most recent block. This is the question production actually asks: given everything up to today, how well do I predict tomorrow?"}
      </p>
    </Panel>
  );
}

const SOURCES = [
  { t: "First-party data", tone: "emerald", d: "Your own logs, databases, transactions and support tickets. Most relevant, and you control it — but it only covers the customers and situations you already have." },
  { t: "Public datasets", tone: "blue", d: "Kaggle, the UCI ML Repository, Hugging Face Datasets, government open-data portals. Great for learning and benchmarks; check the licence and whether it resembles your real problem." },
  { t: "APIs", tone: "indigo", d: "Structured and legal by design. Watch rate limits, pagination, and terms that forbid using responses for model training." },
  { t: "Web scraping", tone: "amber", d: "Covers anything public, at a cost: robots.txt, terms of service, copyright, and pages that change layout without warning. Scrape politely and keep provenance." },
  { t: "Human labelling", tone: "purple", d: "In-house experts, crowd platforms, or vendors. Expensive per item. Quality depends almost entirely on the written guidelines and on measuring agreement." },
  { t: "Synthetic data", tone: "rose", d: "Generated by simulations or other models. Fills rare cases and protects privacy, but inherits the generator's blind spots — validate on real data." },
];

export default function DataSourcing() {
  const toc = [
    { label: "Where Data Comes From", hash: "sources" },
    { label: "Sampling Bias (interactive)", hash: "sampling" },
    { label: "Labelling & Agreement", hash: "labelling" },
    { label: "How Much Data?", hash: "volume" },
    { label: "Split Before You Look", hash: "splits" },
    { label: "Legal & Ethical Checks", hash: "legal" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Data Sourcing"
      intro="Every model is a summary of its data. Where that data came from — and who was left out — decides what the model can ever learn."
      toc={toc}
    >
      <Section
        id="sources"
        title="Where Data Comes From"
        lead="Sourcing is the first step of the ML workflow and the one that is hardest to fix later. Cleaning can repair a messy value; nothing downstream can add the customers you never collected."
      >
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {SOURCES.map((s) => (
            <Card key={s.t} title={s.t} tone={s.tone}>
              <p>{s.d}</p>
            </Card>
          ))}
        </div>
      </Section>

      <Section
        id="sampling"
        title="Sampling Bias"
        lead="A sample is only useful if it resembles the population you will make predictions about. The way you collect it can quietly guarantee that it does not."
      >
        <SamplingLab />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card title="Selection bias" tone="rose"><p>The collection process itself filters people: only app users, only one hospital, only customers who did not churn.</p></Card>
          <Card title="Survivorship bias" tone="amber"><p>You only see the cases that made it through — companies still in business, loans that were approved. The failures are missing by construction.</p></Card>
          <Card title="Non-response bias" tone="purple"><p>People who answer a survey differ from people who ignore it. Response rate matters less than whether responding depends on the answer.</p></Card>
        </div>
      </Section>

      <Section
        id="labelling"
        title="Labelling and Agreement"
        lead="For supervised learning, the label is the target the model chases. If two careful people disagree about the label, no model can be more accurate than they are consistent."
      >
        <KappaLab />
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-6">
          <Card title="Write the guidelines first" tone="indigo">
            <p>Define every class with examples and counter-examples, and a rule for the ambiguous cases. Most disagreement is a guideline gap, not a careless annotator.</p>
          </Card>
          <Card title="Weak supervision" tone="teal">
            <p>When hand-labelling is too slow, write labelling rules (keywords, regexes, heuristics) or use a strong model to pre-label, then have people review only the uncertain items.</p>
          </Card>
        </div>
      </Section>

      <Section
        id="volume"
        title="How Much Data Do You Need?"
        lead="There is no universal number, but there are useful anchors."
      >
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <Card title="Per class, not in total" tone="blue"><p>A dataset of 100,000 rows with 40 fraud cases is a 40-example fraud dataset. Count the rarest class you care about.</p></Card>
          <Card title="Rule of thumb for tabular" tone="emerald"><p>Aim for at least 10–20 examples per feature for a linear model, far more for trees and neural networks. Treat it as a floor, not a target.</p></Card>
          <Card title="Let the curve decide" tone="purple"><p>Train on 10%, 25%, 50% and 100% of what you have. If the validation score is still climbing at 100%, more data will help; if it has flattened, fix features or labels instead.</p></Card>
        </div>
        <Note tone="indigo">
          Quality usually beats quantity. A thousand consistently labelled, representative examples will outperform
          ten thousand noisy ones collected from the wrong population.
        </Note>
      </Section>

      <Section
        id="splits"
        title="Split Before You Look"
        lead="Set aside the test set before any exploration or cleaning decisions, so nothing you learn from it leaks into choices about the model."
      >
        <SplitDemo />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card title="Train / validation / test" tone="indigo"><p>A typical split is 70 / 15 / 15. Tune on validation; touch test once, at the end.</p></Card>
          <Card title="Stratify" tone="emerald"><p>For classification, keep the class ratio identical in every split — essential when one class is rare.</p></Card>
          <Card title="Group split" tone="rose"><p>If one patient or user has many rows, keep all their rows on one side. Otherwise the model memorises the person, not the pattern.</p></Card>
        </div>
      </Section>

      <Section id="legal" title="Legal and Ethical Checks" lead="Ask these before the data enters your pipeline, not after a model trained on it has shipped.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ["Licence and terms", "Does the licence allow commercial use and model training? Many public datasets are research-only; many APIs forbid training on their output."],
            ["Personal data", "Names, emails, phone numbers, locations and IDs are personal data under laws like GDPR and India's DPDP Act 2023. Collect the minimum, record consent, and remove or pseudonymise what you do not need."],
            ["Representation", "Who is missing? A model trained mostly on one region, language or age group will be worst for everyone else — the sampling panel above in real life."],
            ["Provenance", "Record where every file came from, when, and under what terms. A short datasheet per dataset saves weeks when someone later asks what the model was trained on."],
          ].map(([t, d]) => (
            <Card key={t} title={t}><p>{d}</p></Card>
          ))}
        </div>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`import pandas as pd
import requests
from datasets import load_dataset
from sklearn.model_selection import train_test_split

# 1. First-party: a database table or an exported file
orders = pd.read_sql("SELECT * FROM orders WHERE created_at >= '2026-01-01'", conn)
tickets = pd.read_csv("support_tickets.csv", parse_dates=["opened_at"])

# 2. An API, following pagination politely
rows, url = [], "https://api.example.com/v1/reviews?page=1"
while url:
    resp = requests.get(url, timeout=30)
    resp.raise_for_status()
    body = resp.json()
    rows.extend(body["items"])
    url = body.get("next")          # None on the last page
reviews = pd.DataFrame(rows)

# 3. A public dataset from the Hugging Face Hub
imdb = load_dataset("imdb", split="train").to_pandas()

# 4. Split FIRST — stratified so the rare class keeps its ratio
train, test = train_test_split(
    tickets, test_size=0.15, stratify=tickets["escalated"], random_state=42
)

# Time-ordered data: split on time instead of at random
cutoff = tickets["opened_at"].quantile(0.85)
train_t = tickets[tickets["opened_at"] < cutoff]
test_t  = tickets[tickets["opened_at"] >= cutoff]`}
        />
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          Next: <a href="#/ml/data-cleaning" className="text-blue-400 hover:underline">Data Cleaning</a> — fixing what
          arrives, then <a href="#/ml/data-analysis" className="text-blue-400 hover:underline">Data Analysis</a> to see
          what it says.
        </p>
      </Section>

      <KnowledgeCheck questions={questionsFor("data-prep")} />
    </GuideLayout>
  );
}

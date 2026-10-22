import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section, Button } from "../components/VizKit";
import { rng, mean, std, fmt } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "LLM evaluation", "evals", "eval set", "golden dataset", "LLM as a judge", "grader", "pairwise comparison",
  "absolute scoring", "agent evaluation", "trajectory evaluation", "regression testing", "CI gating", "pass@k",
  "pass^k", "confidence interval", "sample size", "Wilson interval", "flaky evals", "non-determinism",
  "eval variance", "human review", "rubric", "benchmarks", "prompt regression",
];

/* ---------------------------------------------------------------------------
   How precise is an accuracy number? Wilson interval, computed.
--------------------------------------------------------------------------- */

const wilson = (k, n, z = 1.96) => {
  const p = k / n;
  const d = 1 + (z * z) / n;
  const c = p + (z * z) / (2 * n);
  const m = z * Math.sqrt((p * (1 - p)) / n + (z * z) / (4 * n * n));
  return [(c - m) / d, (c + m) / d];
};

// Items needed per model to detect a difference with ~80% power at 5% significance.
const needPerModel = (a, b) => {
  if (a === b) return Infinity;
  return Math.ceil(((1.96 + 0.8416) ** 2 * (a * (1 - a) + b * (1 - b))) / (a - b) ** 2);
};

function PrecisionLab() {
  const [n, setN] = useState(100);
  const [a, setA] = useState(0.9);
  const [b, setB] = useState(0.85);
  const [ka, kb] = [Math.round(a * n), Math.round(b * n)];
  const ia = wilson(ka, n);
  const ib = wilson(kb, n);
  const overlap = ia[0] <= ib[1] && ib[0] <= ia[1];
  const need = needPerModel(a, b);
  const W = 340;
  const sx = (v) => 10 + v * (W - 20);
  const bar = (y, [lo, hi], p, color, label) => (
    <g>
      <text x="10" y={y - 8} fill="#9ca3af" fontSize="11">{label}: {(p * 100).toFixed(0)}%</text>
      <line x1={sx(lo)} y1={y} x2={sx(hi)} y2={y} stroke={color} strokeWidth="6" strokeLinecap="round" opacity="0.6" />
      <circle cx={sx(p)} cy={y} r="5" fill={color} />
    </g>
  );
  return (
    <Panel tone="indigo" title="How much can you trust an accuracy number?">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <Slider label="Eval items" value={n} min={20} max={1000} step={10} onChange={setN} />
        <Slider label="Model A accuracy" value={a} min={0.5} max={0.99} step={0.01} onChange={setA} format={(v) => `${Math.round(v * 100)}%`} />
        <Slider label="Model B accuracy" value={b} min={0.5} max={0.99} step={0.01} onChange={setB} format={(v) => `${Math.round(v * 100)}%`} />
      </div>
      <svg viewBox={`0 0 ${W} 100`} className="w-full h-auto block max-w-xl mb-2">
        {bar(30, ia, ka / n, "#34d399", "A")}
        {bar(70, ib, kb / n, "#60a5fa", "B")}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <text key={t} x={sx(t)} y="98" fill="#6b7280" fontSize="10" textAnchor="middle">{Math.round(t * 100)}%</text>
        ))}
      </svg>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <Metric label="A: 95% interval" value={`${(ia[0] * 100).toFixed(0)}–${(ia[1] * 100).toFixed(0)}%`} tone="emerald" />
        <Metric label="B: 95% interval" value={`${(ib[0] * 100).toFixed(0)}–${(ib[1] * 100).toFixed(0)}%`} tone="indigo" />
        <Metric label="Intervals" value={overlap ? "overlap" : "separate"} tone={overlap ? "rose" : "emerald"} />
        <Metric label="Items to tell A from B" value={Number.isFinite(need) ? need.toLocaleString() : "n/a"} tone="amber" sub="≈80% chance, per model" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        Wilson intervals, computed from the counts. At 100 items, 90% and 85% are statistically indistinguishable: the
        intervals overlap heavily, and telling them apart needs roughly 680 items each. Overlap is a conservative
        check; a paired test on the same items is more sensitive, but the lesson holds: small eval sets cannot rank
        close models.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Variance across runs. Each item has its own pass probability.
--------------------------------------------------------------------------- */

function VarianceLab() {
  const [items, setItems] = useState(50);
  const [runs, setRuns] = useState(10);
  const [flaky, setFlaky] = useState(0.4);
  const [seed, setSeed] = useState(1);
  const res = useMemo(() => {
    const r = rng(seed * 7717 + items);
    // Some items are solid, some hopeless, a "flaky" share passes about half the time.
    const p = Array.from({ length: items }, () => {
      const u = r();
      if (u < flaky) return 0.25 + 0.5 * r();
      return r() < 0.75 ? 0.97 : 0.03;
    });
    const scores = Array.from({ length: runs }, () => mean(p.map((q) => (r() < q ? 1 : 0))));
    const k = 3;
    return {
      scores,
      p1: mean(p),
      passAtK: mean(p.map((q) => 1 - (1 - q) ** k)),
      passHatK: mean(p.map((q) => q ** k)),
      k,
    };
  }, [items, runs, flaky, seed]);
  const lo = Math.min(...res.scores);
  const hi = Math.max(...res.scores);
  return (
    <Panel tone="amber" title="The same agent, scored again and again" actions={<Button tone="amber" onClick={() => setSeed((s) => s + 1)}>Re-run everything</Button>}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <Slider tone="amber" label="Eval items" value={items} min={10} max={300} step={5} onChange={setItems} />
        <Slider tone="amber" label="Repeated runs" value={runs} min={2} max={30} onChange={setRuns} />
        <Slider tone="amber" label="Share of flaky items" value={flaky} min={0} max={1} step={0.05} onChange={setFlaky} format={(v) => `${Math.round(v * 100)}%`} />
      </div>
      <div className="flex items-end gap-1 h-24 mb-2">
        {res.scores.map((s, i) => (
          <div key={i} className="flex-1 bg-amber-400/70 rounded-t" style={{ height: `${s * 100}%`, transition: "height 200ms" }} title={`run ${i + 1}: ${(s * 100).toFixed(1)}%`} />
        ))}
      </div>
      <div className="text-[0.6875rem] text-gray-500 mb-3">Score of each run (same agent, same items, nothing changed)</div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <Metric label="Run-to-run range" value={`${(lo * 100).toFixed(1)}–${(hi * 100).toFixed(1)}%`} tone="amber" sub={`SD ${fmt(std(res.scores) * 100, 1)} pts`} />
        <Metric label="Success on one try" value={`${(res.p1 * 100).toFixed(0)}%`} />
        <Metric label={`≥1 of ${res.k} tries (pass@${res.k})`} value={`${(res.passAtK * 100).toFixed(0)}%`} tone="emerald" />
        <Metric label={`All ${res.k} tries (pass^${res.k})`} value={`${(res.passHatK * 100).toFixed(0)}%`} tone="rose" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        Nothing changed between the bars, yet the score moves. A "3-point improvement" from one run of one prompt
        change can be noise. Fewer items or more flaky items widen the spread. The bottom row shows why reliability
        matters for agents: a system that sometimes succeeds looks fine on pass@3 and poor on pass^3, which is the
        number a customer experiences when every attempt must work.
      </p>
    </Panel>
  );
}

const HARNESS = `import json, anthropic
client = anthropic.Anthropic()

# 1. The eval set: real inputs, and what a good answer must satisfy.
CASES = [
    {"input": "Refund for order #123?", "must_include": ["30 days"], "must_not": ["guarantee"]},
    # ...50 to several hundred, sampled from real traffic
]

def run(case):
    r = client.messages.create(
        model="claude-opus-5-5", max_tokens=500,
        messages=[{"role": "user", "content": case["input"]}],
    )
    return r.content[0].text

# 2. Code-based grader: cheap, exact, and rerunnable.
def code_grade(case, out):
    ok = all(s.lower() in out.lower() for s in case["must_include"])
    return ok and not any(s.lower() in out.lower() for s in case["must_not"])

# 3. Model-based grader for what code cannot check (tone, helpfulness).
RUBRIC = "Reply as JSON: {\\"pass\\": true|false, \\"reason\\": \\"...\\"}. Pass only if the answer is polite, accurate and complete."
def judge(case, out):
    r = client.messages.create(
        model="claude-opus-5-5", max_tokens=200,
        messages=[{"role": "user", "content": f"{RUBRIC}\\n\\nQuestion: {case['input']}\\nAnswer: {out}"}],
    )
    return json.loads(r.content[0].text)["pass"]

results = []
for c in CASES:
    out = run(c)
    results.append(code_grade(c, out) and judge(c, out))
print(f"pass rate {sum(results) / len(results):.0%} on {len(results)} cases")`;

const CI = `# .github/workflows/evals.yml (sketch)
on: pull_request
jobs:
  evals:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - run: pip install -r requirements.txt
      - run: python evals/run.py --set evals/regression.jsonl --min-pass 0.90 --runs 3
        env: { ANTHROPIC_API_KEY: \${{ secrets.ANTHROPIC_API_KEY }} }
      # The script exits non-zero if the pass rate, averaged over 3 runs,
      # is below 0.90 or drops more than 2 points versus main.`;

const GRADERS = [
  ["Code-based", "Exact match, regex, schema check, unit tests, did the file change", "Fast, cheap, deterministic", "Only checks what you can write a rule for"],
  ["LLM-as-judge", "A model scores an answer against a rubric", "Handles tone, helpfulness, open-ended answers", "Biased (position, length, self-preference); needs checking against humans"],
  ["Human review", "People label a sample", "The ground truth, catches what you did not think of", "Slow and expensive; use it to calibrate the other two"],
];

export default function LlmEvals() {
  const toc = [
    { label: "Why Evals", hash: "why" },
    { label: "Build the Eval Set", hash: "set" },
    { label: "Graders", hash: "graders" },
    { label: "Pairwise vs Absolute", hash: "pairwise" },
    { label: "Evaluating Agents", hash: "agents" },
    { label: "Statistics: How Sure Are You?", hash: "stats" },
    { label: "Variance Across Runs", hash: "variance" },
    { label: "Regression Gating in CI", hash: "ci" },
    { label: "A Minimal Harness", hash: "code" },
  ];
  return (
    <GuideLayout
      title="LLM Evaluation & Evals"
      intro="Model output is not a function you can unit-test with one assert. Evals are how you find out whether a change made your system better, worse or just different."
      toc={toc}
    >
      <Section id="why" title="Why Evals" lead="Without evals, every prompt tweak is a guess, and you find regressions when users complain.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="What an eval is" tone="indigo"><p>A set of inputs, a way to score the outputs, and a number you can compare between versions.</p></Card>
          <Card title="Why it matters" tone="emerald"><p>It lets you change prompts, models and tools with confidence, catches breakage before release, and tells you when a cheaper model is good enough.</p></Card>
          <Card title="A common mistake" tone="rose"><p>Trusting a handful of hand-picked examples that happen to work. Evals are only useful if they include the cases that hurt.</p></Card>
        </div>
        <p className="text-xs text-gray-500 mt-4">For retrieval systems specifically, see <a href="#/rag/evaluation" className="text-blue-400 hover:underline">RAG evaluation</a>.</p>
      </Section>

      <Section id="set" title="Build the Eval Set From Real Traffic" lead="The best inputs are ones real users sent.">
        <ol className="space-y-2 text-sm text-gray-300 list-decimal pl-5 max-w-3xl mb-4">
          <li>Sample real requests (with privacy handling), then read them. Do not skip this step.</li>
          <li>Cover the hard cases on purpose: ambiguous questions, missing information, attempts to misuse it, long inputs, rare languages.</li>
          <li>For each, write what a good answer needs (facts to include, things to avoid), not one perfect answer.</li>
          <li>Add every production failure as a new case, so it can never come back unnoticed.</li>
          <li>Keep a separate held-out set that you never tune against.</li>
        </ol>
        <Note tone="indigo">Start with 30 to 50 cases. A small real set beats a large synthetic one; grow it as failures appear.</Note>
      </Section>

      <Section id="graders" title="Graders" lead="Three ways to score an output. Use them together.">
        <div className="overflow-x-auto rounded-xl border border-white/10 mb-4">
          <table className="w-full text-sm text-left min-w-[560px]">
            <thead className="bg-white/5 text-gray-300">
              <tr><th className="p-3">Grader</th><th className="p-3">How</th><th className="p-3">Good for</th><th className="p-3">Watch out</th></tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-gray-400">
              {GRADERS.map(([a, b, c, d]) => (
                <tr key={a}><td className="p-3 text-white font-semibold">{a}</td><td className="p-3">{b}</td><td className="p-3">{c}</td><td className="p-3">{d}</td></tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-sm text-gray-400 leading-relaxed max-w-3xl">
          Model judges are biased toward the first answer shown, longer answers and their own family's style.
          Evaluate in both orders, give a specific rubric, and check the judge against a few hundred human labels before
          trusting it. See <a href="#/ml/rlaif" className="text-blue-400 hover:underline">RLAIF and AI judges</a> for the demo.
        </p>
      </Section>

      <Section id="pairwise" title="Pairwise vs Absolute Scoring">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Absolute (rate 1–5, or pass/fail)" tone="blue"><p>Good for tracking one system over time and for clear criteria. Scores drift, and judges (people and models) use scales inconsistently.</p></Card>
          <Card title="Pairwise (which is better, A or B?)" tone="purple"><p>Better at spotting small differences, since comparing is easier than scoring. Use it to choose between two versions; swap the order to cancel position bias. It does not say how good either is.</p></Card>
        </div>
      </Section>

      <Section id="agents" title="Evaluating Agents" lead="An agent takes many steps, so there are two things to score.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Outcome" tone="emerald"><p>Did it achieve the goal? Check the end state: the file exists, the ticket is closed, the database row is right. Prefer this: it is objective, and it lets the agent find its own route.</p></Card>
          <Card title="Trajectory" tone="amber"><p>How did it get there? Count steps, cost and wasted tool calls; flag forbidden actions. Use it for debugging and cost, but do not demand one exact path, or you punish valid alternatives.</p></Card>
        </div>
        <p className="text-xs text-gray-500 mt-3">See <a href="#/agents/debugging" className="text-blue-400 hover:underline">Debugging Agents</a> for reading traces.</p>
      </Section>

      <Section id="stats" title="Statistics: How Sure Are You?" lead="Every eval score is an estimate from a sample of cases.">
        <PrecisionLab />
        <p className="text-xs text-gray-500 mt-3">The underlying ideas are on the <a href="#/ml/inferential-statistics" className="text-blue-400 hover:underline">Inferential Statistics</a> page.</p>
      </Section>

      <Section id="variance" title="Variance Across Runs" lead="Model outputs vary, so the same eval can give different scores.">
        <VarianceLab />
      </Section>

      <Section id="ci" title="Regression Gating in CI" lead="Run a fixed regression set on every change, and block the merge if quality drops.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <Card title="Fast and cheap" tone="emerald"><p>A small set of high-value cases on every pull request; the full set nightly.</p></Card>
          <Card title="Average several runs" tone="amber"><p>One run is noisy. Average 3, and set the threshold with the run-to-run spread in mind.</p></Card>
          <Card title="Compare with main" tone="indigo"><p>Gate on "not worse than the current version by more than X", not only on an absolute number.</p></Card>
        </div>
        <CodeBlock language="yaml" code={CI} maxHeight="260px" />
      </Section>

      <Section id="code" title="A Minimal Harness">
        <CodeBlock language="python" code={HARNESS} maxHeight="440px" />
        <p className="text-xs text-gray-500 mt-3">A sketch to show the shape; add retries, concurrency and logging of every output before real use.</p>
      </Section>

      <KnowledgeCheck questions={questionsFor("llm-evals")} />
    </GuideLayout>
  );
}

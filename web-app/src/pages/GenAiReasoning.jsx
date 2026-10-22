import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import KnowledgeCheck from "../components/KnowledgeCheck";
import CodeBlock from "../components/CodeBlock";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section } from "../components/VizKit";
import { rng, pct } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "reasoning models", "test-time compute", "inference-time scaling", "thinking models", "extended thinking",
  "adaptive thinking", "effort", "reasoning effort", "thinking budget", "chain of thought", "CoT",
  "self-consistency", "majority voting", "best-of-n", "pass@k", "verifier", "process reward model", "PRM",
  "outcome reward model", "tree of thoughts", "reflection", "o1", "o3", "DeepSeek-R1", "RLVR",
  "chain-of-thought faithfulness", "overthinking",
];

/* ---------------------------------------------------------------------------
   Sample the same question N times. Each sample is right with probability p;
   otherwise it lands on one of W wrong answers. Majority vote needs no
   checker; pass@k assumes a perfect verifier that recognises a right answer.
   Monte Carlo with a fixed seed, so the curves are stable.
--------------------------------------------------------------------------- */

function majorityAccuracy(p, wrong, n, trials = 3000, seed = 5) {
  const r = rng(seed);
  let wins = 0;
  for (let t = 0; t < trials; t++) {
    const counts = new Array(wrong + 1).fill(0); // index 0 = correct answer
    for (let i = 0; i < n; i++) {
      if (r() < p) counts[0]++;
      else counts[1 + Math.floor(r() * wrong)]++;
    }
    const best = Math.max(...counts);
    const leaders = counts.filter((c) => c === best).length;
    if (counts[0] === best) wins += 1 / leaders; // ties broken at random
  }
  return wins / trials;
}

const NS = [1, 3, 5, 9, 15, 25, 41];

function VotingLab() {
  const [p, setP] = useState(0.4);
  const [wrong, setWrong] = useState(4);
  const [n, setN] = useState(9);
  const curve = useMemo(() => NS.map((k) => ({ k, maj: majorityAccuracy(p, wrong, k), pass: 1 - (1 - p) ** k })), [p, wrong]);
  const cur = useMemo(() => majorityAccuracy(p, wrong, n), [p, wrong, n]);
  const passK = 1 - (1 - p) ** n;
  const W = 360;
  const H = 170;
  const x = (k) => 24 + (Math.log(k) / Math.log(41)) * (W - 36);
  const y = (v) => H - 20 - v * (H - 30);
  const line = (key) => curve.map((c, i) => `${i ? "L" : "M"}${x(c.k)},${y(c[key])}`).join("");

  return (
    <Panel tone="indigo" title="Spend more samples at inference: majority vote vs a verifier">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-5">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          <line x1="24" y1={y(p)} x2={W - 12} y2={y(p)} stroke="rgba(255,255,255,0.2)" strokeDasharray="4 3" />
          <text x={W - 12} y={y(p) - 4} fill="#6b7280" fontSize="10" textAnchor="end">one sample</text>
          <path d={line("pass")} fill="none" stroke="#34d399" strokeWidth="2" />
          <path d={line("maj")} fill="none" stroke="#818cf8" strokeWidth="2.4" />
          {curve.map((c) => (
            <text key={c.k} x={x(c.k)} y={H - 5} fill="#6b7280" fontSize="10" textAnchor="middle">{c.k}</text>
          ))}
          <line x1={x(n)} y1="6" x2={x(n)} y2={H - 20} stroke="#e5e7eb" strokeDasharray="3 3" />
          <text x="26" y="14" fill="#34d399" fontSize="10">pass@k (a perfect checker picks a right answer)</text>
          <text x="26" y="28" fill="#818cf8" fontSize="10">self-consistency (majority vote, no checker)</text>
          {[0, 0.5, 1].map((v) => (
            <text key={v} x="20" y={y(v) + 3} fill="#6b7280" fontSize="9" textAnchor="end">{v}</text>
          ))}
        </svg>
        <div className="space-y-3">
          <Slider label="Accuracy of one sample (p)" value={p} min={0.05} max={0.9} step={0.05} onChange={setP} format={(v) => pct(v, 0)} />
          <Slider label="Distinct wrong answers" value={wrong} min={1} max={8} onChange={setWrong} />
          <Slider label="Samples (k)" value={n} min={1} max={41} step={2} onChange={setN} />
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Majority vote" value={pct(cur, 0)} tone="indigo" />
            <Metric label="pass@k" value={pct(passK, 0)} tone="emerald" />
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        With p = 40% and wrong answers scattered four ways, the right answer is still the single most common one, so
        voting over more samples drives accuracy well above 40%. Now set distinct wrong answers to 1: the model is
        wrong in one consistent way 60% of the time, and voting drives accuracy <em>down</em> toward zero. Voting
        amplifies whatever the model believes most. A verifier — unit tests, a proof checker, a reward model — is
        far more powerful, which is why reasoning models shine where answers can be checked.
      </p>
    </Panel>
  );
}

export default function GenAiReasoning() {
  const toc = [
    { label: "What Changed", hash: "what" },
    { label: "Chain of Thought", hash: "cot" },
    { label: "How Reasoning Models Are Trained", hash: "training" },
    { label: "Scaling Test-Time Compute", hash: "scaling" },
    { label: "Voting vs Verifying Lab", hash: "lab" },
    { label: "Using Reasoning Models", hash: "using" },
    { label: "Limits & Caveats", hash: "limits" },
  ];

  return (
    <GuideLayout
      title="Reasoning Models & Test-Time Compute"
      intro="Models that think before they answer: chain of thought, how reinforcement learning on checkable problems produced reasoning models, the ways to spend more compute at inference, and how to prompt and budget them."
      toc={toc}
    >
      <Section id="what" title="What Changed" lead="For years the way to a better model was more training compute. Reasoning models add a second dial: let the model spend more tokens thinking at inference time, and accuracy on hard problems keeps rising.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Think, then answer" tone="indigo"><p>The model generates a long internal reasoning trace — trying approaches, checking work, backtracking — before writing the final answer.</p></Card>
          <Card title="Accuracy for tokens" tone="amber"><p>More thinking costs latency and output tokens. On maths, coding and multi-step planning the trade is often excellent; on simple lookups it is waste.</p></Card>
          <Card title="Now mainstream" tone="emerald"><p>Most frontier models now think adaptively, with an effort or budget setting controlling how much — rather than being a separate model family.</p></Card>
        </div>
      </Section>

      <Section id="cot" title="Chain of Thought" lead="The idea started as a prompting trick: asking a model to write out intermediate steps (“let's think step by step”) made it much better at multi-step problems.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Why it helps" tone="indigo"><p>A transformer does a fixed amount of computation per token. Writing steps out gives it more tokens — more computation — and lets each step condition on the previous ones instead of jumping to an answer.</p></Card>
          <Card title="Beyond a single chain" tone="purple"><p>Self-consistency samples several chains and votes; tree-of-thoughts explores branches and backtracks; reflection critiques and revises. These are the ancestors of built-in reasoning. See <a href="#/prompting" className="text-blue-400 hover:underline">Prompt Engineering</a>.</p></Card>
        </div>
      </Section>

      <Section id="training" title="How Reasoning Models Are Trained" lead="Instead of imitating human-written reasoning, the model is rewarded for reaching correct, checkable answers and discovers useful thinking strategies on its own.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Verifiable rewards" tone="emerald"><p>Maths with known answers, code with unit tests, puzzles with checkers: the reward is computed, not judged, so it is hard to game. See <a href="#/ml/grpo" className="text-blue-400 hover:underline">GRPO & RLVR</a>.</p></Card>
          <Card title="Emergent behaviour" tone="indigo"><p>DeepSeek-R1's report showed longer reasoning, self-verification and “wait, let me reconsider” moments emerging from RL on outcome rewards alone.</p></Card>
          <Card title="Distillation" tone="amber"><p>Reasoning traces from a large model can be used to fine-tune smaller models, which is how many compact reasoning models are made. See <a href="#/genai/distillation" className="text-blue-400 hover:underline">Distillation</a>.</p></Card>
        </div>
      </Section>

      <Section id="scaling" title="Scaling Test-Time Compute" lead="There are two broad ways to spend more at inference, and they combine.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Sequential: think longer" tone="indigo"><p>One longer chain with more checking and revision — what an effort or thinking-budget setting controls. Gains flatten eventually, and very long traces can drift.</p></Card>
          <Card title="Parallel: sample more" tone="emerald"><p>Many independent attempts, then pick one by majority vote, a reward model, or a verifier (best-of-n). Easy to parallelise; only as good as the selection method.</p></Card>
          <Card title="Outcome vs process rewards" tone="purple"><p>An outcome reward model scores the final answer; a process reward model scores each step, which helps prune bad branches early in a search.</p></Card>
          <Card title="Search" tone="amber"><p>Beam or tree search over reasoning steps guided by a process reward model — powerful for maths and code, expensive in general.</p></Card>
        </div>
      </Section>

      <Section id="lab" title="Voting vs Verifying Lab">
        <VotingLab />
      </Section>

      <Section id="using" title="Using Reasoning Models">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <Card title="State the goal, not the steps" tone="emerald"><p>Describe the task, constraints and what a good answer looks like. Detailed “first do X, then Y” scripts written for older models often make reasoning models worse.</p></Card>
          <Card title="Tune effort per route" tone="indigo"><p>Low effort for chat, classification and routing; high for hard coding, analysis and agentic work. Measure — the right level is a property of the workload.</p></Card>
          <Card title="Give it a way to check" tone="purple"><p>Tests to run, a schema to validate against, a tool to query. Reasoning plus verification is where the big gains are.</p></Card>
          <Card title="Plan for latency" tone="amber"><p>Long thinking means long waits. Stream progress, show that work is happening, and set generous timeouts.</p></Card>
        </div>
        <CodeBlock
          language="python"
          code={`import anthropic
client = anthropic.Anthropic()

# Adaptive thinking: the model decides how much to think; effort sets the overall depth.
with client.messages.stream(
    model="claude-opus-5-5",
    max_tokens=64000,
    thinking={"type": "adaptive", "display": "summarized"},   # show a readable summary
    output_config={"effort": "high"},                          # low | medium | high | xhigh | max
    messages=[{"role": "user", "content": "Find the bug in this scheduler and prove the fix: ..."}],
) as stream:
    message = stream.get_final_message()

for block in message.content:
    if block.type == "thinking":
        print("[reasoning summary]", block.thinking)
    elif block.type == "text":
        print(block.text)`}
        />
        <p className="text-xs text-gray-500 mt-2">Parameter names differ by provider (reasoning effort, thinking budget); check your provider's current docs.</p>
      </Section>

      <Section id="limits" title="Limits & Caveats">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Overthinking" tone="rose"><p>Simple questions get long, expensive deliberation. Route easy traffic to low effort or a smaller model.</p></Card>
          <Card title="Faithfulness" tone="amber"><p>A written reasoning trace is not guaranteed to be the true cause of the answer. Treat it as helpful evidence, not as an audit log.</p></Card>
          <Card title="Unverifiable domains" tone="indigo"><p>Gains are largest where answers can be checked. Open-ended writing and judgement tasks benefit less from extra thinking.</p></Card>
        </div>
        <Note tone="indigo">Evaluate reasoning settings like any other change: on your tasks, with cost per completed task alongside accuracy.</Note>
      </Section>

      <KnowledgeCheck questions={questionsFor("genai-reasoning")} />
    </GuideLayout>
  );
}

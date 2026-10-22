import React, { useEffect, useMemo, useRef, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Segmented, Metric, Card, Note, Section, Button } from "../components/VizKit";
import { rng, mean, std, fmt, pct } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "GRPO", "group relative policy optimization", "RLVR", "reinforcement learning with verifiable rewards",
  "verifiable rewards", "reasoning models", "DeepSeek-R1", "R1-Zero", "DeepSeekMath", "aha moment",
  "group advantage", "no value model", "DAPO", "Dr. GRPO", "GSPO", "reward function", "GRPOTrainer",
  "chain of thought RL", "thinking models",
];

/* ---------------------------------------------------------------------------
   One prompt, G sampled answers, rewards and group-relative advantages.
--------------------------------------------------------------------------- */

const WRONG = ["398", "418", "4080", "384", "41"];

function sampleGroup(G, p, q, r) {
  return Array.from({ length: G }, () => {
    const correct = r() < p;
    const formatted = r() < q;
    const ans = correct ? "408" : WRONG[Math.floor(r() * WRONG.length)];
    const text = formatted ? `…17 × 24 = ${ans}. <answer>${ans}</answer>` : `…so it costs ₹${ans}`;
    const reward = (correct ? 1 : 0) + (formatted ? 0.2 : 0);
    return { correct, formatted, text, reward };
  });
}

function GroupLab() {
  const [G, setG] = useState(8);
  const [p, setP] = useState(0.4);
  const [q, setQ] = useState(0.7);
  const [seed, setSeed] = useState(1);
  const group = useMemo(() => sampleGroup(G, p, q, rng(seed * 991 + G)), [G, p, q, seed]);
  const rewards = group.map((g) => g.reward);
  const mu = mean(rewards);
  const sd = std(rewards, 0);
  const adv = rewards.map((x) => (x - mu) / (sd + 1e-4));
  const maxA = Math.max(1, ...adv.map(Math.abs));

  return (
    <Panel tone="emerald" title="Sample a group, score it, compare within the group" actions={<Button tone="emerald" onClick={() => setSeed((s) => s + 1)}>Sample a new group</Button>}>
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        Prompt: <em className="text-gray-200">"Pens cost ₹17 each. How much do 24 pens cost? Put the final answer in
        &lt;answer&gt; tags."</em> The reward is a program, not a model: +1.0 if the answer is 408, +0.2 if the tags
        are there.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <Slider tone="emerald" label="Group size G" value={G} min={2} max={16} onChange={setG} />
        <Slider tone="emerald" label="Policy's chance of being right" value={p} min={0} max={1} step={0.05} onChange={setP} format={(v) => pct(v, 0)} />
        <Slider tone="emerald" label="Chance of using the tags" value={q} min={0} max={1} step={0.05} onChange={setQ} format={(v) => pct(v, 0)} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 mb-4">
        {group.map((g, i) => (
          <div key={i} className="rounded-lg border border-white/10 bg-black/40 p-2.5">
            <div className="flex items-center justify-between gap-2 mb-1.5">
              <span className="font-mono text-xs text-gray-300 truncate">{g.text}</span>
              <span className={`text-[0.6875rem] font-mono shrink-0 ${g.correct ? "text-emerald-300" : "text-rose-300"}`}>r = {g.reward.toFixed(1)}</span>
            </div>
            <div className="h-2.5 rounded bg-white/5 relative overflow-hidden">
              <div className="absolute top-0 bottom-0 w-px bg-white/30 left-1/2" />
              <div
                className={`absolute top-0 bottom-0 rounded ${adv[i] >= 0 ? "bg-emerald-400/80" : "bg-rose-400/80"}`}
                style={adv[i] >= 0 ? { left: "50%", width: `${(adv[i] / maxA) * 50}%` } : { right: "50%", width: `${(-adv[i] / maxA) * 50}%` }}
              />
            </div>
            <div className="text-[0.625rem] font-mono text-gray-500 mt-1">advantage {adv[i] >= 0 ? "+" : ""}{adv[i].toFixed(2)}</div>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Metric label="Group mean reward" value={fmt(mu, 2)} sub="the baseline" />
        <Metric label="Group std" value={fmt(sd, 2)} />
        <Metric label="Learning signal" value={sd < 1e-9 ? "none" : "yes"} tone={sd < 1e-9 ? "rose" : "emerald"} sub={sd < 1e-9 ? "all rewards equal" : "some answers beat others"} />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        Advantage = (reward − group mean) / group std. Answers better than their siblings get pushed up, worse ones
        pushed down — no value model needed to say what "expected" means. Set the chance of being right to 100% and
        tags to 100%: every answer scores 1.2, every advantage is zero, and this prompt teaches nothing. The same
        happens at 0%.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Where is the learning signal? P(group is not all-same) vs difficulty.
--------------------------------------------------------------------------- */

function SignalCurve() {
  const [G, setG] = useState(8);
  const W = 360;
  const H = 160;
  const sx = (p) => 30 + p * (W - 42);
  const sy = (v) => 12 + (1 - v) * (H - 38);
  const f = (p) => 1 - Math.pow(p, G) - Math.pow(1 - p, G);
  let d = "";
  for (let i = 0; i <= 100; i++) d += `${i ? "L" : "M"}${sx(i / 100).toFixed(1)},${sy(f(i / 100)).toFixed(1)}`;
  return (
    <Panel tone="blue" title="Which prompts can teach the model anything?">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block max-w-xl">
        <line x1="30" y1={sy(0)} x2={W - 12} y2={sy(0)} stroke="rgba(255,255,255,0.2)" />
        <line x1="30" y1={sy(1)} x2={W - 12} y2={sy(1)} stroke="rgba(255,255,255,0.08)" />
        <path d={d} fill="none" stroke="#60a5fa" strokeWidth="2.5" />
        <text x="34" y={sy(1) + 12} fill="#93c5fd" fontSize="11">P(group has signal) = 1 − pᴳ − (1 − p)ᴳ</text>
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <text key={t} x={sx(t)} y={H - 8} fill="#6b7280" fontSize="11" textAnchor="middle">{pct(t, 0)}</text>
        ))}
        <text x={W - 12} y={H - 22} fill="#9ca3af" fontSize="11" textAnchor="end">model's success rate on the prompt</text>
      </svg>
      <Slider tone="blue" label="Group size G" value={G} min={2} max={32} onChange={setG} />
      <div className="grid grid-cols-3 gap-2 mt-4">
        <Metric label="At 2% success" value={pct(f(0.02), 0)} tone="rose" />
        <Metric label="At 50% success" value={pct(f(0.5), 0)} tone="emerald" />
        <Metric label="At 98% success" value={pct(f(0.98), 0)} tone="rose" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Prompts the model always solves or never solves produce identical rewards across the group, so they
        contribute nothing but compute. The signal lives in problems at the edge of the model's ability. Larger
        groups widen that band, at the price of more generation. This is why RL training sets are filtered by
        difficulty, and why DAPO discards all-same groups and samples more.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   A simulated GRPO run over 24 prompts of increasing difficulty.
--------------------------------------------------------------------------- */

const NPROMPT = 24;
const DIFF = Array.from({ length: NPROMPT }, (_, i) => -3 + (i / (NPROMPT - 1)) * 10); // easy → very hard
const sig = (z) => 1 / (1 + Math.exp(-z));

function TrainSim() {
  const [G, setG] = useState(8);
  const [theta, setTheta] = useState(() => DIFF.map((d) => -d));
  const [hist, setHist] = useState([]);
  const [dead, setDead] = useState(0);
  const [steps, setSteps] = useState(0);
  const [playing, setPlaying] = useState(false);
  const r = useRef(rng(5));

  useEffect(() => {
    if (!playing) return undefined;
    if (steps >= 300) {
      setPlaying(false);
      return undefined;
    }
    const id = setTimeout(() => {
      setTheta((th) => {
        let nt = [...th];
        let silent = 0;
        for (let k = 0; k < 2; k++) {
          silent = 0;
          nt = nt.map((t) => {
            const p = sig(t);
            const outs = Array.from({ length: G }, () => (r.current() < p ? 1 : 0));
            const m = mean(outs);
            const s = std(outs, 0);
            if (s === 0) {
              silent++;
              return t;
            }
            // Σ A_j ∇log π(o_j), with ∇log π = (o − p) for a Bernoulli policy on logit t
            const g = outs.reduce((a, o) => a + ((o - m) / s) * (o - p), 0) / G;
            return t + 0.35 * g;
          });
        }
        setDead(silent);
        setHist((h) => [...h, mean(nt.map(sig))]);
        return nt;
      });
      setSteps((s) => s + 2);
    }, 60);
    return () => clearTimeout(id);
  }, [playing, steps, G]);

  const reset = () => {
    setPlaying(false);
    setTheta(DIFF.map((d) => -d));
    setHist([]);
    setDead(0);
    setSteps(0);
    r.current = rng(5);
  };
  const acc = mean(theta.map(sig));
  const start = mean(DIFF.map((d) => sig(-d)));

  return (
    <Panel
      tone="purple"
      title="A simulated GRPO run"
      actions={
        <>
          <Button tone="purple" onClick={() => setPlaying((v) => !v)}>{playing ? "Pause" : "▶ Train"}</Button>
          <Button tone="purple" onClick={reset}>Reset</Button>
        </>
      }
    >
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        24 maths prompts, from easy (left) to very hard (right). Each bar is the model's current chance of solving
        that prompt. Every step samples G answers per prompt and applies the GRPO update.
      </p>
      <div className="flex items-end gap-[3px] h-32 mb-1 rounded-lg bg-black/40 border border-white/10 p-2">
        {theta.map((t, i) => (
          <div key={i} className="flex-1 rounded-t bg-purple-400/80" style={{ height: `${Math.max(1, sig(t) * 100)}%`, transition: "height 150ms" }} title={`prompt ${i + 1}: ${pct(sig(t), 0)}`} />
        ))}
      </div>
      <div className="flex justify-between text-[0.6875rem] text-gray-500 mb-4"><span>easy</span><span>hard</span></div>
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-4 items-end mb-3">
        <div>
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-1.5">Group size G</div>
          <Segmented tone="purple" value={G} onChange={(v) => { setG(v); }} options={[2, 4, 8, 16].map((v) => ({ v, label: String(v) }))} />
        </div>
        <div className="grid grid-cols-3 gap-2 sm:w-96">
          <Metric label="Steps" value={steps} />
          <Metric label="Avg success" value={pct(acc, 0)} tone="purple" sub={`started at ${pct(start, 0)}`} />
          <Metric label="Silent prompts" value={`${dead} / ${NPROMPT}`} tone="rose" sub="all-same group this step" />
        </div>
      </div>
      <svg viewBox="0 0 360 60" className="w-full h-auto block rounded-lg bg-black/40 border border-white/10 mb-3">
        {hist.length > 1 && <path d={hist.map((h, i) => `${i ? "L" : "M"}${(4 + (i / 150) * 352).toFixed(1)},${(56 - h * 50).toFixed(1)}`).join("")} fill="none" stroke="#c4b5fd" strokeWidth="2" />}
        <text x="6" y="12" fill="#6b7280" fontSize="11">average success over training</text>
      </svg>
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        The middle of the curriculum improves fastest. Easy prompts saturate and go silent. The hardest prompts stay
        near zero because no sample in the group ever succeeds, so there is nothing to reinforce — the model cannot
        learn to solve what it never solves by chance. Bigger groups (try G = 16) rescue a few more of them. Real
        pipelines add easier variants, hints or a supervised warm-up for exactly this reason.
      </p>
    </Panel>
  );
}

export default function MlGrpo() {
  const toc = [
    { label: "Why Not Just PPO?", hash: "why" },
    { label: "Group-Relative Advantage", hash: "group" },
    { label: "Where the Signal Lives", hash: "signal" },
    { label: "A Simulated Run", hash: "sim" },
    { label: "Verifiable Rewards (RLVR)", hash: "rlvr" },
    { label: "The DeepSeek-R1 Story", hash: "r1" },
    { label: "PPO vs GRPO", hash: "compare" },
    { label: "Refinements", hash: "variants" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="GRPO and RL with Verifiable Rewards"
      intro="The method behind open reasoning models. Sample several answers to the same problem, check which are right with a program, and push the model toward the answers that beat their siblings — no reward model and no value model required."
      toc={toc}
    >
      <Section id="why" title="Why Not Just PPO?" lead="PPO needs a value model — usually as large as the policy — to estimate how good each state is. For maths and code there is a simpler option: the answer can be checked, and the model can be compared against itself.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Drop the value model" tone="emerald"><p>GRPO (Group Relative Policy Optimization), introduced in DeepSeekMath in 2024, uses the average reward of a group of answers to the same prompt as the baseline.</p></Card>
          <Card title="Drop the reward model" tone="indigo"><p>When correctness can be checked — a number, a passing test — the reward is a few lines of code that cannot be flattered.</p></Card>
          <Card title="Keep PPO's safety rails" tone="purple"><p>The clipped probability ratio and a KL term to a reference model remain, so updates stay small.</p></Card>
        </div>
      </Section>

      <Section id="group" title="Group-Relative Advantage" lead="For each prompt, sample G answers, score each, and standardise the scores within the group.">
        <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-xs sm:text-sm text-gray-200 text-center mb-5 overflow-x-auto">
          Aᵢ = ( rᵢ − mean(r₁…r_G) ) / std(r₁…r_G)
        </div>
        <GroupLab />
      </Section>

      <Section id="signal" title="Where the Learning Signal Lives">
        <SignalCurve />
      </Section>

      <Section id="sim" title="A Simulated Run">
        <TrainSim />
      </Section>

      <Section id="rlvr" title="Verifiable Rewards (RLVR)" lead="Reinforcement learning with verifiable rewards covers any task where a program can grade the output.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-5">
          <Card title="Maths" tone="emerald"><p>Extract the final answer and compare it with the reference, after normalising (fractions, units) or checking symbolic equivalence.</p></Card>
          <Card title="Code" tone="indigo"><p>Run the unit tests in a sandbox; reward the fraction that pass.</p></Card>
          <Card title="Format" tone="amber"><p>A small bonus for the required structure — reasoning in think tags, answer in answer tags.</p></Card>
          <Card title="Agent tasks" tone="purple"><p>Did the file get created, the form submitted, the ticket closed? Check the end state of the environment.</p></Card>
        </div>
        <Note tone="rose">
          Verifiable does not mean unhackable. A coding agent rewarded for passing tests can learn to special-case the
          visible tests, or to edit the test file. Use hidden tests, sandbox the environment, and read samples of what
          the model is actually doing.
        </Note>
      </Section>

      <Section id="r1" title="The DeepSeek-R1 Story" lead="The January 2025 DeepSeek-R1 report made GRPO famous by showing long chain-of-thought reasoning could be trained almost entirely with RL.">
        <ol className="space-y-3 list-none p-0">
          {[
            ["R1-Zero: RL from a base model", "GRPO applied directly to DeepSeek-V3-Base with only rule-based rewards — correctness and format — and no supervised fine-tuning first."],
            ["Reasoning emerged", "Response length grew steadily over training as the model learned to spend more tokens thinking, including re-checking its own work; the paper highlights an 'aha moment' where it stops and re-evaluates."],
            ["But it was hard to read", "R1-Zero's reasoning mixed languages and was poorly formatted."],
            ["R1: a short supervised warm-up", "A small 'cold-start' set of readable long reasoning examples, then reasoning RL, then rejection sampling and SFT on broader data, then a final RL stage for general helpfulness."],
            ["Distillation", "R1's reasoning traces were used to fine-tune much smaller Qwen and Llama models, which inherited a surprising share of the ability — see Distillation."],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-3">
              <span className="w-7 h-7 shrink-0 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center text-xs font-bold">{i + 1}</span>
              <div>
                <div className="text-sm font-semibold text-white">{t}</div>
                <div className="text-sm text-gray-400 leading-relaxed">{d}</div>
              </div>
            </li>
          ))}
        </ol>
      </Section>

      <Section id="compare" title="PPO vs GRPO">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-gray-300">
              <tr>
                <th className="p-3" />
                <th className="p-3">PPO (RLHF)</th>
                <th className="p-3">GRPO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-gray-400">
              {[
                ["Baseline for the advantage", "A learned value model", "The group's mean reward"],
                ["Models in memory", "Policy, value, reference, reward", "Policy, reference (+ reward function)"],
                ["Answers per prompt", "Usually 1", "G, typically 4–64"],
                ["KL to reference", "Folded into the per-token reward", "Added directly to the loss"],
                ["Best suited to", "Fuzzy preferences via a reward model", "Checkable tasks: maths, code, agents"],
              ].map(([k, a, b]) => (
                <tr key={k}>
                  <td className="p-3 text-white">{k}</td>
                  <td className="p-3">{a}</td>
                  <td className="p-3">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="variants" title="Refinements" lead="GRPO spread quickly in 2025, and so did fixes for its quirks.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="DAPO" tone="indigo"><p>From ByteDance Seed and Tsinghua. Looser upper clip ("clip-higher") to keep exploring, dynamic sampling that drops all-same groups, token-level loss averaging, and penalties for overlong answers.</p></Card>
          <Card title="Dr. GRPO" tone="emerald"><p>Showed that dividing by response length and by the group's standard deviation biases training — notably toward ever-longer wrong answers — and removed both normalisations.</p></Card>
          <Card title="GSPO" tone="purple"><p>From the Qwen team. Computes the importance ratio and clipping per whole sequence rather than per token, which proved more stable, especially for mixture-of-experts models.</p></Card>
        </div>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`import re
from datasets import load_dataset
from trl import GRPOConfig, GRPOTrainer

# GSM8K answers end with "#### 72" — keep just the number
ds = load_dataset("openai/gsm8k", "main", split="train").map(
    lambda r: {"prompt": r["question"] + "\\nPut the final answer in <answer></answer> tags.",
               "answer": r["answer"].split("####")[-1].strip()}
)

# Reward functions are plain Python. Extra dataset columns (here: answer) arrive as kwargs.
def correctness(completions, answer, **kwargs):
    scores = []
    for text, ref in zip(completions, answer):
        m = re.search(r"<answer>(.*?)</answer>", text, re.S)
        scores.append(1.0 if m and m.group(1).strip().replace(",", "") == ref else 0.0)
    return scores

def format_bonus(completions, **kwargs):
    return [0.2 if re.search(r"<answer>.*?</answer>", t, re.S) else 0.0 for t in completions]

trainer = GRPOTrainer(
    model="Qwen/Qwen2.5-1.5B-Instruct",
    reward_funcs=[correctness, format_bonus],        # rewards are summed
    args=GRPOConfig(
        output_dir="grpo",
        num_generations=8,                           # G — answers per prompt
        max_completion_length=512,
        beta=0.04,                                   # KL coefficient; some recipes use 0
    ),
    train_dataset=ds,
)
trainer.train()`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("rl-alignment")} />
    </GuideLayout>
  );
}

import React, { useEffect, useMemo, useRef, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section, Button } from "../components/VizKit";
import { rng, spearman, fmt, pct } from "../lib/stats";
import useReducedMotion from "../lib/useReducedMotion";

export const SEARCH_KEYWORDS = [
  "RLHF", "rlhl", "reinforcement learning from human feedback", "reward model", "preference data",
  "Bradley-Terry", "pairwise comparisons", "PPO", "KL penalty", "reference model", "InstructGPT", "SFT",
  "reward hacking", "reward over-optimization", "Goodhart's law", "sycophancy", "alignment", "TRL",
  "RewardTrainer", "PPOTrainer", "value model", "critic",
];

const sig = (z) => 1 / (1 + Math.exp(-z));

/* ---------------------------------------------------------------------------
   The three stages, stepped through.
--------------------------------------------------------------------------- */

const STAGES = [
  {
    n: "1 · Supervised fine-tuning",
    tone: "indigo",
    data: "~10k–100k prompts with an ideal answer written by a person.",
    trains: "The pretrained model, with ordinary next-token loss on the ideal answers.",
    out: "An SFT model that follows instructions and uses the chat format — but only as well as its demonstrations.",
    example: 'Prompt: "Explain recursion to a 10-year-old." → a labeller writes the answer they would want.',
  },
  {
    n: "2 · Reward model",
    tone: "amber",
    data: "Prompts, each with 2+ SFT answers ranked by people: A is better than B.",
    trains: "A copy of the model with its output head replaced by a single number — the reward.",
    out: "A reward model r(x, y) that scores any answer the way labellers would rank it.",
    example: "Labellers see four answers to the recursion prompt and order them. Comparing is far faster and more consistent than writing.",
  },
  {
    n: "3 · RL with PPO",
    tone: "emerald",
    data: "Prompts only. The policy writes answers; the reward model scores them.",
    trains: "The policy (initialised from SFT), to maximise reward − β · KL(policy ‖ reference).",
    out: "The final assistant: preferred by people, but kept close to the SFT model by the KL term.",
    example: "Generate an answer → score it → PPO nudges the policy toward higher-scoring answers → repeat for thousands of steps.",
  },
];

function Pipeline() {
  const [i, setI] = useState(0);
  const reduced = useReducedMotion();
  const [auto, setAuto] = useState(!reduced);
  useEffect(() => {
    if (!auto) return undefined;
    const id = setInterval(() => setI((v) => (v + 1) % 3), 3200);
    return () => clearInterval(id);
  }, [auto]);
  const s = STAGES[i];
  return (
    <Panel tone="indigo" title="RLHF in three stages" actions={<Button onClick={() => setAuto((a) => !a)}>{auto ? "Pause" : "▶ Auto-play"}</Button>}>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        {STAGES.map((st, j) => (
          <button
            key={st.n}
            onClick={() => { setI(j); setAuto(false); }}
            className={`relative text-left rounded-xl border p-3 transition-colors ${j === i ? "border-white/40 bg-white/10" : "border-white/10 bg-black/30 hover:bg-white/5"}`}
          >
            <div className={`text-sm font-semibold ${j === i ? "text-white" : "text-gray-400"}`}>{st.n}</div>
            {j === i && <div className="absolute left-3 right-3 bottom-1 h-0.5 rounded bg-indigo-400 animate-pulse" />}
          </button>
        ))}
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-3">
        <Card title="Data" tone={s.tone}><p>{s.data}</p></Card>
        <Card title="What is trained" tone={s.tone}><p>{s.trains}</p></Card>
        <Card title="Output" tone={s.tone}><p>{s.out}</p></Card>
      </div>
      <p className="text-sm text-gray-400 leading-relaxed m-0"><span className="text-gray-500">Example — </span>{s.example}</p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Reward model: fit Bradley–Terry scores from pairwise preferences.
--------------------------------------------------------------------------- */

const CANDIDATES = [
  { t: "A 3-part plan: 20 minutes of tactics puzzles a day, one opening per colour, and review every loss with an engine.", q: 2.5 },
  { t: "Play a lot, study your losses, and do tactics puzzles.", q: 1.6 },
  { t: "You're clearly a natural! Believe in yourself and you'll be a grandmaster in no time.", q: -0.3 },
  { t: "Just play.", q: -0.8 },
  { t: "Chess grew out of chaturanga, played in India around the 6th century.", q: -1.2 },
];
const COLORS = ["#34d399", "#60a5fa", "#fbbf24", "#94a3b8", "#fb7185"];

function RewardModelLab() {
  const [pairs, setPairs] = useState([]);
  const [scores, setScores] = useState([0, 0, 0, 0, 0]);
  const [fitting, setFitting] = useState(false);
  const [iter, setIter] = useState(0);
  const [ask, setAsk] = useState([0, 1]);
  const r = useRef(rng(31));

  const randomPair = () => {
    const a = Math.floor(r.current() * 5);
    let b = Math.floor(r.current() * 4);
    if (b >= a) b += 1;
    return [a, b];
  };
  const simulate = (k) => {
    const out = [];
    for (let i = 0; i < k; i++) {
      const [a, b] = randomPair();
      // A noisy labeller: prefers the better answer with probability σ(qa − qb).
      const aWins = r.current() < sig(CANDIDATES[a].q - CANDIDATES[b].q);
      out.push(aWins ? [a, b] : [b, a]);
    }
    setPairs((p) => [...p, ...out]);
  };
  const label = (winner) => {
    const [a, b] = ask;
    setPairs((p) => [...p, winner === 0 ? [a, b] : [b, a]]);
    setAsk(randomPair());
  };

  useEffect(() => {
    if (!fitting) return undefined;
    if (iter >= 300 || !pairs.length) {
      setFitting(false);
      return undefined;
    }
    const id = setTimeout(() => {
      setScores((s) => {
        let w = [...s];
        for (let k = 0; k < 10; k++) {
          const g = [0, 0, 0, 0, 0];
          pairs.forEach(([win, lose]) => {
            const p = sig(w[win] - w[lose]);
            g[win] += 1 - p;
            g[lose] -= 1 - p;
          });
          w = w.map((v, j) => v + 0.6 * (g[j] / pairs.length - 0.01 * v));
        }
        const m = w.reduce((a, b) => a + b, 0) / 5;
        return w.map((v) => v - m);
      });
      setIter((n) => n + 10);
    }, 30);
    return () => clearTimeout(id);
  }, [fitting, iter, pairs]);

  const fit = () => {
    setIter(0);
    setScores([0, 0, 0, 0, 0]);
    setFitting(true);
  };

  const acc = useMemo(() => {
    if (!pairs.length) return null;
    return pairs.filter(([w, l]) => scores[w] > scores[l]).length / pairs.length;
  }, [pairs, scores]);
  const rho = spearman(scores, CANDIDATES.map((c) => c.q));
  const maxAbs = Math.max(1, ...scores.map(Math.abs));
  const [a, b] = ask;

  return (
    <Panel
      tone="amber"
      title="Train a reward model from comparisons"
      actions={
        <>
          <Button tone="amber" onClick={() => simulate(20)}>+20 labeller comparisons</Button>
          <Button tone="amber" onClick={fit} disabled={!pairs.length || fitting}>Fit reward model</Button>
          <Button tone="amber" onClick={() => { setPairs([]); setScores([0, 0, 0, 0, 0]); setIter(0); }}>Reset</Button>
        </>
      }
    >
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        Prompt: <em className="text-gray-200">"How do I get better at chess?"</em> Five candidate answers. Nobody
        assigns scores directly; labellers only say which of two answers is better. The Bradley–Terry model assumes{" "}
        <span className="font-mono text-amber-200">P(A beats B) = σ(r_A − r_B)</span> and fits a score r for each answer
        that best explains the comparisons.
      </p>

      <div className="rounded-xl border border-white/10 bg-black/30 p-3 mb-4">
        <div className="text-xs text-gray-500 mb-2">Be a labeller — which answer is better?</div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
          {[a, b].map((c, j) => (
            <button key={j} onClick={() => label(j)} className="text-left rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 p-3 text-sm text-gray-200">
              {CANDIDATES[c].t}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-2 mb-4">
        {CANDIDATES.map((c, i) => (
          <div key={i} className="grid grid-cols-[minmax(0,1fr)_minmax(0,140px)_52px] sm:grid-cols-[minmax(0,1fr)_200px_60px] items-center gap-2">
            <span className="text-xs text-gray-300 leading-snug">{c.t}</span>
            <div className="h-4 rounded bg-white/5 relative overflow-hidden">
              <div className="absolute top-0 bottom-0 w-px bg-white/30 left-1/2" />
              <div
                className="absolute top-0 bottom-0 rounded"
                style={{
                  background: COLORS[i],
                  opacity: 0.8,
                  transition: "all 120ms",
                  ...(scores[i] >= 0 ? { left: "50%", width: `${(scores[i] / maxAbs) * 50}%` } : { right: "50%", width: `${(-scores[i] / maxAbs) * 50}%` }),
                }}
              />
            </div>
            <span className="text-xs font-mono text-gray-300 text-right">{scores[i].toFixed(2)}</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <Metric label="Comparisons" value={pairs.length} />
        <Metric label="Fit steps" value={iter} />
        <Metric label="Explains" value={acc === null ? "—" : pct(acc, 0)} tone="amber" sub="of comparisons" />
        <Metric label="Rank match" value={iter ? fmt(rho, 2) : "—"} tone="emerald" sub="Spearman vs true quality" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        With 20 comparisons the order is often wrong; with 100 it is usually right. Two details carry over to real
        reward models. The scores only mean something relative to each other — adding 5 to all of them explains the
        data equally well. And the simulated labellers are noisy on close pairs, as real ones are — InstructGPT's
        labellers agreed with each other only about 73% of the time — so "explains" never reaches 100%. Real reward models are a full LLM with a scalar head, trained on hundreds of
        thousands of such comparisons.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Reward hacking and the KL leash: optimal policy π* ∝ π_ref · exp(r / β).
--------------------------------------------------------------------------- */

const STYLES = [
  { n: "Concise and correct", ref: 0.3, proxy: 1.3, trueQ: 1.0, color: "#34d399" },
  { n: "Detailed and correct", ref: 0.25, proxy: 2.0, trueQ: 1.4, color: "#60a5fa" },
  { n: "Padded with filler", ref: 0.1, proxy: 2.2, trueQ: 0.4, color: "#a78bfa" },
  { n: "Flatters the user", ref: 0.08, proxy: 2.7, trueQ: -0.6, color: "#fbbf24" },
  { n: "Hedges or refuses", ref: 0.12, proxy: -0.5, trueQ: -0.3, color: "#94a3b8" },
  { n: "Confident but wrong", ref: 0.15, proxy: 0.2, trueQ: -1.5, color: "#fb7185" },
];

function optimal(beta) {
  const w = STYLES.map((s) => s.ref * Math.exp(s.proxy / beta));
  const Z = w.reduce((a, b) => a + b, 0);
  const pi = w.map((v) => v / Z);
  const R = pi.reduce((a, p, i) => a + p * STYLES[i].proxy, 0);
  const T = pi.reduce((a, p, i) => a + p * STYLES[i].trueQ, 0);
  const KL = pi.reduce((a, p, i) => a + (p > 1e-12 ? p * Math.log(p / STYLES[i].ref) : 0), 0);
  return { pi, R, T, KL };
}

const SWEEP = (() => {
  const out = [];
  for (let i = 0; i <= 80; i++) {
    const beta = Math.exp(Math.log(10) + (i / 80) * (Math.log(0.05) - Math.log(10)));
    out.push(optimal(beta));
  }
  return out;
})();

function HackingLab() {
  const [lb, setLb] = useState(Math.log(1.5));
  const beta = Math.exp(lb);
  const o = optimal(beta);
  const W = 360;
  const H = 170;
  const kMax = 2.6;
  const sx = (k) => 34 + (k / kMax) * (W - 46);
  const sy = (v) => 14 + (1 - (v + 1) / 3.8) * (H - 40);
  const line = (f) => SWEEP.map((p, i) => `${i ? "L" : "M"}${sx(p.KL).toFixed(1)},${sy(f(p)).toFixed(1)}`).join("");

  return (
    <Panel tone="rose" title="Optimise the reward model too hard and quality collapses">
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        Six styles of answer. The SFT model (reference) produces each with some probability. The reward model is
        good but imperfect: it over-rewards length and flattery. The RLHF objective has an exact optimum,{" "}
        <span className="font-mono text-rose-200">π*(y) ∝ π_ref(y) · exp(r(y) / β)</span>, so we can compute what a
        perfectly trained policy would do for any β.
      </p>
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-4">
        <div className="space-y-1.5">
          <div className="grid grid-cols-[minmax(0,1fr)_58px_58px] text-[0.6875rem] text-gray-500 gap-2">
            <span>style (reward model · true quality)</span>
            <span className="text-right">SFT</span>
            <span className="text-right">RLHF</span>
          </div>
          {STYLES.map((s, i) => (
            <div key={s.n}>
              <div className="grid grid-cols-[minmax(0,1fr)_58px_58px] text-xs gap-2 mb-0.5">
                <span className="text-gray-300 truncate">{s.n} <span className="text-gray-500 font-mono">({s.proxy} · {s.trueQ})</span></span>
                <span className="text-right font-mono text-gray-500">{pct(s.ref, 0)}</span>
                <span className="text-right font-mono text-white">{pct(o.pi[i], 0)}</span>
              </div>
              <div className="h-2.5 rounded bg-white/5 relative overflow-hidden">
                <div className="absolute top-0 bottom-0 left-0 bg-white/15" style={{ width: `${s.ref * 100}%` }} />
                <div className="absolute top-0.5 bottom-0.5 left-0 rounded" style={{ width: `${o.pi[i] * 100}%`, background: s.color, transition: "width 200ms" }} />
              </div>
            </div>
          ))}
        </div>
        <div>
          <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
            <line x1="34" y1={sy(0)} x2={W - 12} y2={sy(0)} stroke="rgba(255,255,255,0.15)" />
            <path d={line((p) => p.R)} fill="none" stroke="#fbbf24" strokeWidth="2" />
            <path d={line((p) => p.T)} fill="none" stroke="#34d399" strokeWidth="2.5" />
            <line x1={sx(o.KL)} y1="10" x2={sx(o.KL)} y2={H - 26} stroke="#e5e7eb" strokeDasharray="4 3" />
            <circle cx={sx(o.KL)} cy={sy(o.T)} r="4.5" fill="#34d399" />
            <circle cx={sx(o.KL)} cy={sy(o.R)} r="4.5" fill="#fbbf24" />
            <text x="38" y="14" fill="#fbbf24" fontSize="11">reward-model score</text>
            <text x="38" y="28" fill="#34d399" fontSize="11">true quality</text>
            {[0, 1, 2].map((t) => (
              <text key={t} x={sx(t)} y={H - 10} fill="#6b7280" fontSize="11" textAnchor="middle">{t}</text>
            ))}
            <text x={W - 12} y={H - 10} fill="#9ca3af" fontSize="11" textAnchor="end">KL from SFT →</text>
          </svg>
        </div>
      </div>
      <Slider tone="rose" label="KL penalty β (drag left = optimise harder)" value={lb} min={Math.log(0.05)} max={Math.log(10)} step={0.01} onChange={setLb} format={() => beta.toFixed(2)} />
      <div className="grid grid-cols-3 gap-2 mt-4 mb-3">
        <Metric label="Reward-model score" value={fmt(o.R, 2)} tone="amber" />
        <Metric label="True quality" value={fmt(o.T, 2)} tone={o.T > 0.45 ? "emerald" : "rose"} />
        <Metric label="KL from SFT" value={fmt(o.KL, 2)} />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        Start at β = 10: the policy barely moves. Around β = 1.5 true quality is at its best — the policy has shifted
        toward the detailed, correct answers. Keep pushing and the reward-model score keeps climbing while true
        quality falls below where it started: the policy has learned to flatter. This is Goodhart's law —
        "when a measure becomes a target, it ceases to be a good measure" — and the KL penalty is what holds it back.
        OpenAI measured the same rise-then-fall curve on real reward models in 2022.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Memory: how many models each method keeps on the GPU.
--------------------------------------------------------------------------- */

function MemoryLab() {
  const [b, setB] = useState(7);
  const trainable = 16; // bytes/param: bf16 weights + grads, fp32 master copy + Adam moments
  const frozen = 2; // bf16 weights only
  const rows = [
    { n: "RLHF with PPO", parts: [["policy", trainable], ["value model", trainable], ["reference", frozen], ["reward model", frozen]] },
    { n: "DPO", parts: [["policy", trainable], ["reference", frozen]] },
    { n: "GRPO", parts: [["policy", trainable], ["reference", frozen]] },
    { n: "SFT", parts: [["model", trainable]] },
  ];
  const colors = { policy: "bg-indigo-500/70", model: "bg-indigo-500/70", "value model": "bg-purple-500/70", reference: "bg-slate-500/70", "reward model": "bg-amber-500/70" };
  const max = b * 36;
  return (
    <Panel tone="purple" title="How many models must fit in memory?">
      <Slider tone="purple" label="Model size" value={b} min={1} max={70} onChange={setB} format={(v) => `${v}B parameters`} />
      <div className="space-y-3 mt-4">
        {rows.map((r) => {
          const tot = r.parts.reduce((a, [, bytes]) => a + bytes * b, 0);
          return (
            <div key={r.n}>
              <div className="flex justify-between text-xs mb-1">
                <span className="text-gray-300 font-semibold">{r.n}</span>
                <span className="font-mono text-gray-400">≈ {Math.round(tot)} GB</span>
              </div>
              <div className="flex h-5 rounded overflow-hidden bg-white/5">
                {r.parts.map(([p, bytes]) => (
                  <div key={p} className={`${colors[p]} border-r border-black/40 text-[0.625rem] text-white/90 flex items-center justify-center overflow-hidden whitespace-nowrap`} style={{ width: `${((bytes * b) / max) * 100}%` }}>
                    {p}
                  </div>
                ))}
              </div>
            </div>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Rough full fine-tuning figures: 16 bytes per trainable parameter (weights, gradients, fp32 master copy and two
        Adam moments), 2 bytes per frozen one, before activations and generation memory. PPO carries four models,
        two of them trainable — the main reason DPO and GRPO took over. LoRA shrinks every trainable bar
        dramatically; see <a href="#/genai/peft/lora" className="text-blue-400 hover:underline">LoRA</a>.
      </p>
    </Panel>
  );
}

export default function MlRlhf() {
  const toc = [
    { label: "Why RLHF Exists", hash: "why" },
    { label: "The Three Stages", hash: "stages" },
    { label: "The Reward Model", hash: "reward" },
    { label: "Reward Hacking & the KL Leash", hash: "hacking" },
    { label: "Inside the PPO Step", hash: "ppo" },
    { label: "Memory Cost", hash: "memory" },
    { label: "What Goes Wrong", hash: "problems" },
    { label: "RLHF and Its Successors", hash: "family" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="RLHF — Reinforcement Learning from Human Feedback"
      intro="How a model that predicts text becomes an assistant people prefer: learn a reward from human comparisons, then use reinforcement learning to write answers that score well on it — without drifting too far from where it started."
      toc={toc}
    >
      <Section id="why" title="Why RLHF Exists" lead="A pretrained model continues text. Supervised fine-tuning teaches it to answer in the right format. But 'helpful, honest and harmless' is hard to write as a loss function or to demonstrate perfectly — while telling which of two answers is better is easy.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <Card title="Writing is expensive" tone="indigo"><p>A perfect demonstration answer takes minutes and caps quality at the writer's level.</p></Card>
          <Card title="Comparing is cheap" tone="amber"><p>Picking the better of two answers takes seconds and works even when neither is perfect.</p></Card>
          <Card title="RL generalises the signal" tone="emerald"><p>A reward model turns thousands of comparisons into a score for any answer, so the model can practise on new prompts.</p></Card>
        </div>
        <Note tone="indigo">
          The landmark result: in OpenAI's InstructGPT paper (2022), people preferred answers from a 1.3-billion-parameter
          RLHF model over those from the 175-billion-parameter GPT-3 it was built from. Alignment training mattered more
          than a hundredfold increase in size.
        </Note>
      </Section>

      <Section id="stages" title="The Three Stages">
        <Pipeline />
      </Section>

      <Section id="reward" title="The Reward Model" lead="Everything downstream optimises this model's opinion, so its quality caps the quality of the whole process.">
        <RewardModelLab />
      </Section>

      <Section id="hacking" title="Reward Hacking and the KL Leash" lead="The reward model is only an approximation of what people want. Optimise any approximation hard enough and the policy finds its blind spots.">
        <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-xs sm:text-sm text-gray-200 text-center mb-5 overflow-x-auto">
          maximise  E[ r(x, y) ]  −  β · KL( π<sub>θ</sub>(y|x) ‖ π<sub>ref</sub>(y|x) )
        </div>
        <HackingLab />
      </Section>

      <Section id="ppo" title="Inside the PPO Step" lead="What actually happens in one iteration of stage 3.">
        <ol className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-2 list-none p-0 mb-5">
          {[
            ["Generate", "The policy writes answers to a batch of prompts."],
            ["Score", "The reward model scores each complete answer."],
            ["Penalise drift", "Per token, subtract β × (log π_policy − log π_ref)."],
            ["Estimate advantage", "The value model predicts expected reward per token; advantage = actual − expected."],
            ["Clipped update", "PPO raises the probability of better-than-expected tokens, clipped to a small step."],
          ].map(([t, d], i) => (
            <li key={t} className="p-3 rounded-xl border border-white/10 bg-white/5">
              <div className="text-xs font-mono text-emerald-300 mb-1">step {i + 1}</div>
              <div className="text-sm font-semibold text-white">{t}</div>
              <div className="text-xs text-gray-400 leading-relaxed">{d}</div>
            </li>
          ))}
        </ol>
        <p className="text-sm text-gray-400 leading-relaxed max-w-3xl">
          The clipping is the same mechanism shown on the{" "}
          <a href="#/ml/reinforcement-learning" className="text-blue-400 hover:underline">Reinforcement Learning</a> page:
          each update may only move the policy a little, which keeps training from collapsing. The reward arrives once
          per answer, but the value model spreads the credit across its tokens.
        </p>
      </Section>

      <Section id="memory" title="Memory Cost">
        <MemoryLab />
      </Section>

      <Section id="problems" title="What Goes Wrong">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Sycophancy" tone="rose"><p>People tend to rate agreeable answers higher, so models learn to agree. Anthropic's 2023 study found sycophancy across several RLHF-trained assistants and traced part of it to human preference data.</p></Card>
          <Card title="Length bias" tone="amber"><p>Longer answers look more thorough and win comparisons, so RLHF models drift toward verbosity. Many pipelines now penalise or control for length.</p></Card>
          <Card title="Labeller disagreement" tone="purple"><p>Raters disagree with each other on a large share of close comparisons. The reward model learns an average of their preferences, with their biases included.</p></Card>
          <Card title="Less diverse output" tone="indigo"><p>Optimising for one reward narrows the range of answers — good for reliability, bad for creative tasks. Temperature helps less after RLHF.</p></Card>
          <Card title="Cost and instability" tone="teal"><p>Four models, online generation, and PPO's many hyperparameters make it the hardest post-training method to run well.</p></Card>
          <Card title="Hidden objective" tone="blue"><p>The values being taught live implicitly in thousands of rater judgements, which makes them hard to inspect or change. Constitutional AI writes them down instead.</p></Card>
        </div>
      </Section>

      <Section id="family" title="RLHF and Its Successors" lead="The core idea — learn from preferences — stayed. The machinery changed.">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-gray-300">
              <tr>
                <th className="p-3">Method</th>
                <th className="p-3">Feedback</th>
                <th className="p-3">What it removes</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-gray-400">
              <tr><td className="p-3 text-white">RLHF (PPO)</td><td className="p-3">Human comparisons</td><td className="p-3">— the original recipe</td></tr>
              <tr><td className="p-3"><a href="#/ml/dpo" className="text-blue-400 hover:underline">DPO</a></td><td className="p-3">Human or AI comparisons</td><td className="p-3">The reward model and the RL loop</td></tr>
              <tr><td className="p-3"><a href="#/ml/grpo" className="text-blue-400 hover:underline">GRPO</a></td><td className="p-3">Checkable rewards (tests, answers)</td><td className="p-3">The value model</td></tr>
              <tr><td className="p-3"><a href="#/ml/rlaif" className="text-blue-400 hover:underline">RLAIF / Constitutional AI</a></td><td className="p-3">AI judgements guided by principles</td><td className="p-3">Most of the human labelling</td></tr>
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          Which families use which method: see <a href="#/models/training" className="text-blue-400 hover:underline">How Models Are Trained</a>.
        </p>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`# Hugging Face TRL. The API moves quickly between versions — check the docs for yours.
from datasets import load_dataset
from transformers import AutoModelForCausalLM, AutoModelForSequenceClassification, AutoTokenizer
from trl import RewardConfig, RewardTrainer, PPOConfig, PPOTrainer

sft = "my-org/llama-8b-sft"
tok = AutoTokenizer.from_pretrained(sft)

# Stage 2 — reward model: rows look like {"chosen": "...", "rejected": "..."}
pairs = load_dataset("my-org/chess-preferences", split="train")
rm = AutoModelForSequenceClassification.from_pretrained(sft, num_labels=1)   # scalar head
RewardTrainer(model=rm, args=RewardConfig(output_dir="rm"),
              processing_class=tok, train_dataset=pairs).train()

# Stage 3 — PPO: policy and value model train; reference and reward model are frozen
policy = AutoModelForCausalLM.from_pretrained(sft)
ref    = AutoModelForCausalLM.from_pretrained(sft)
value  = AutoModelForSequenceClassification.from_pretrained(sft, num_labels=1)
prompts = load_dataset("my-org/prompts", split="train")   # tokenised prompts only

trainer = PPOTrainer(
    args=PPOConfig(output_dir="ppo", kl_coef=0.05, cliprange=0.2),   # kl_coef is β
    processing_class=tok,
    model=policy, ref_model=ref, reward_model=rm, value_model=value,
    train_dataset=prompts,
)
trainer.train()`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("rl-alignment")} />
    </GuideLayout>
  );
}

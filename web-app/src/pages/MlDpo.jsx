import React, { useEffect, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Segmented, Metric, Card, Note, Section, Button } from "../components/VizKit";
import { fmt, pct } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "DPO", "direct preference optimization", "preference optimisation", "implicit reward", "reference model",
  "beta", "chosen", "rejected", "IPO", "KTO", "ORPO", "SimPO", "online DPO", "iterative DPO", "DPOTrainer",
  "likelihood displacement", "RLHF without reinforcement learning", "Bradley-Terry",
];

const sig = (z) => 1 / (1 + Math.exp(-z));

/* ---------------------------------------------------------------------------
   The derivation, one step at a time.
--------------------------------------------------------------------------- */

const STEPS = [
  { f: "max  E[ r(x, y) ]  −  β · KL( π ‖ π_ref )", d: "Start from the RLHF objective: earn reward, but stay close to the reference (SFT) model." },
  { f: "π*(y|x) = π_ref(y|x) · exp( r(x, y) / β ) / Z(x)", d: "This objective has an exact solution. The best policy re-weights the reference by the exponentiated reward. Z(x) just makes it sum to 1 — and is impossible to compute over all possible answers." },
  { f: "r(x, y) = β · log[ π*(y|x) / π_ref(y|x) ]  +  β · log Z(x)", d: "Turn it around: any policy defines an implicit reward — how much more likely it makes an answer than the reference does." },
  { f: "P(y_w ≻ y_l) = σ( r(x, y_w) − r(x, y_l) )", d: "Plug that into the Bradley–Terry preference model. Only the difference of rewards appears, so the troublesome β log Z(x) cancels." },
  { f: "L = −log σ( β·log[π(y_w)/π_ref(y_w)] − β·log[π(y_l)/π_ref(y_l)] )", d: "The DPO loss: a logistic loss on the policy's own probabilities. No reward model, no sampling, no RL — one supervised pass over preference pairs." },
];

function Derivation() {
  const [i, setI] = useState(0);
  return (
    <Panel
      tone="indigo"
      title="From RLHF to DPO in five lines"
      actions={
        <>
          <Button onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>← Back</Button>
          <Button onClick={() => setI((v) => Math.min(STEPS.length - 1, v + 1))} disabled={i === STEPS.length - 1}>Next →</Button>
        </>
      }
    >
      <div className="space-y-2">
        {STEPS.map((s, j) => (
          <div
            key={j}
            className={`rounded-xl border p-3 transition-all ${j === i ? "border-indigo-400/60 bg-indigo-500/15" : j < i ? "border-white/10 bg-white/5 opacity-70" : "border-white/5 bg-black/20 opacity-30"}`}
          >
            <div className="font-mono text-xs sm:text-sm text-gray-100 overflow-x-auto whitespace-nowrap">
              <span className="text-indigo-300 mr-2">{j + 1}.</span>
              {s.f}
            </div>
            {j <= i && <div className="text-xs text-gray-400 leading-relaxed mt-1.5">{s.d}</div>}
          </div>
        ))}
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   The loss, for one preference pair.
--------------------------------------------------------------------------- */

function LossExplorer() {
  const [dw, setDw] = useState(0.2);
  const [dl, setDl] = useState(0.1);
  const [beta, setBeta] = useState(0.1);
  const m = beta * (dw - dl);
  const loss = -Math.log(sig(m));
  const weight = sig(-m);
  const W = 360;
  const H = 160;
  const lo = -2;
  const hi = 2;
  const sx = (v) => 28 + ((v - lo) / (hi - lo)) * (W - 40);
  const sy = (v) => 12 + (1 - v / 2.2) * (H - 36);
  let lp = "";
  let wp = "";
  for (let i = 0; i <= 100; i++) {
    const v = lo + ((hi - lo) * i) / 100;
    lp += `${i ? "L" : "M"}${sx(v).toFixed(1)},${sy(-Math.log(sig(v))).toFixed(1)}`;
    wp += `${i ? "L" : "M"}${sx(v).toFixed(1)},${sy(sig(-v)).toFixed(1)}`;
  }
  const mc = Math.max(lo, Math.min(hi, m));

  return (
    <Panel tone="amber" title="The DPO loss for one pair">
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-4">
        <Slider tone="emerald" label="log π/π_ref on the chosen answer" value={dw} min={-4} max={4} step={0.1} onChange={setDw} format={(v) => v.toFixed(1)} />
        <Slider tone="rose" label="log π/π_ref on the rejected answer" value={dl} min={-4} max={4} step={0.1} onChange={setDl} format={(v) => v.toFixed(1)} />
        <Slider tone="amber" label="β" value={beta} min={0.02} max={1} step={0.01} onChange={setBeta} format={(v) => v.toFixed(2)} />
      </div>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_240px] gap-5 items-start">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block max-w-xl">
          <line x1="28" y1={sy(0)} x2={W - 12} y2={sy(0)} stroke="rgba(255,255,255,0.2)" />
          <line x1={sx(0)} y1="10" x2={sx(0)} y2={sy(0)} stroke="rgba(255,255,255,0.1)" strokeDasharray="3 3" />
          <path d={lp} fill="none" stroke="#fbbf24" strokeWidth="2.5" />
          <path d={wp} fill="none" stroke="#a78bfa" strokeWidth="2" strokeDasharray="5 4" />
          <circle cx={sx(mc)} cy={sy(-Math.log(sig(mc)))} r="5" fill="#fbbf24" stroke="#000" />
          <circle cx={sx(mc)} cy={sy(sig(-mc))} r="4" fill="#a78bfa" stroke="#000" />
          <text x="34" y="18" fill="#fbbf24" fontSize="11">loss −log σ(margin)</text>
          <text x="34" y="32" fill="#a78bfa" fontSize="11">gradient weight σ(−margin)</text>
          {[-2, -1, 0, 1, 2].map((t) => (
            <text key={t} x={sx(t)} y={H - 8} fill="#6b7280" fontSize="11" textAnchor="middle">{t}</text>
          ))}
          <text x={W - 12} y={H - 20} fill="#9ca3af" fontSize="11" textAnchor="end">margin</text>
        </svg>
        <div className="grid grid-cols-2 lg:grid-cols-1 gap-2">
          <Metric label="Implicit reward, chosen" value={fmt(beta * dw, 3)} tone="emerald" sub="β · log π/π_ref" />
          <Metric label="Implicit reward, rejected" value={fmt(beta * dl, 3)} tone="rose" />
          <Metric label="Margin → loss" value={`${fmt(m, 3)} → ${fmt(loss, 3)}`} tone="amber" />
          <Metric label="Gradient weight" value={pct(weight, 0)} tone="purple" sub="how hard this pair still pushes" />
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Two things to notice. First, only the <em>difference</em> matters: set both sliders to −2 and the loss is the
        same as at +2 and +2. DPO can reach a low loss by making the chosen answer less likely, as long as the
        rejected one drops faster — a real failure mode in practice. Second, the gradient weight fades as the
        margin grows: pairs the model already gets right stop pushing, and pairs it gets wrong (the implicit reward
        ranks them backwards) push hardest.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Train a five-answer policy with the DPO gradient.
--------------------------------------------------------------------------- */

const ANSWERS = [
  { n: "Answer A", ref: 0.3 },
  { n: "Answer B", ref: 0.25 },
  { n: "Answer C", ref: 0.2 },
  { n: "Answer D", ref: 0.15 },
  { n: "Answer E", ref: 0.1 },
];
// People's ranking: C > A > D > B > E. Every pair of that ranking is a training example.
const RANK = [2, 0, 3, 1, 4];
const PAIRS = [];
for (let i = 0; i < RANK.length; i++) for (let j = i + 1; j < RANK.length; j++) PAIRS.push([RANK[i], RANK[j]]);
const LOGREF = ANSWERS.map((a) => Math.log(a.ref));

function softmax(t) {
  const m = Math.max(...t);
  const e = t.map((v) => Math.exp(v - m));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / s);
}

function stats(theta, beta, kind = "dpo") {
  const pi = softmax(theta);
  const lr = pi.map((p, i) => Math.log(p) - LOGREF[i]);
  let loss = 0;
  let right = 0;
  PAIRS.forEach(([w, l]) => {
    const h = lr[w] - lr[l];
    loss += kind === "dpo" ? -Math.log(sig(beta * h)) : (h - 1 / (2 * beta)) ** 2;
    if (h > 0) right++;
  });
  const kl = pi.reduce((a, p, i) => a + p * (Math.log(p) - LOGREF[i]), 0);
  return { pi, lr, loss: loss / PAIRS.length, acc: right / PAIRS.length, kl };
}

function DpoTrainer() {
  const [beta, setBeta] = useState(0.1);
  const [kind, setKind] = useState("dpo");
  const [theta, setTheta] = useState(LOGREF);
  const [step, setStep] = useState(0);
  const [playing, setPlaying] = useState(false);

  useEffect(() => {
    if (!playing) return undefined;
    if (step >= 600) {
      setPlaying(false);
      return undefined;
    }
    const id = setTimeout(() => {
      setTheta((t) => {
        let th = [...t];
        for (let k = 0; k < 10; k++) {
          const { lr } = stats(th, beta, kind);
          const g = [0, 0, 0, 0, 0];
          // ∂/∂θ of log π(w) − log π(l) is e_w − e_l: the softmax normaliser cancels.
          PAIRS.forEach(([w, l]) => {
            const h = lr[w] - lr[l];
            // descent direction on the pair's loss, per unit of (e_w − e_l)
            const push = kind === "dpo" ? 2.0 * beta * sig(-beta * h) : -0.02 * 2 * (h - 1 / (2 * beta));
            g[w] += push;
            g[l] -= push;
          });
          th = th.map((v, j) => v + g[j] / PAIRS.length);
        }
        return th;
      });
      setStep((s) => s + 10);
    }, 40);
    return () => clearTimeout(id);
  }, [playing, step, beta, kind]);

  const reset = () => {
    setPlaying(false);
    setTheta(LOGREF);
    setStep(0);
  };
  const st = stats(theta, beta, kind);

  return (
    <Panel
      tone="emerald"
      title="Train a tiny policy with DPO"
      actions={
        <>
          <Button tone="emerald" onClick={() => setPlaying((p) => !p)}>{playing ? "Pause" : "▶ Train"}</Button>
          <Button tone="emerald" onClick={reset}>Reset</Button>
        </>
      }
    >
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        A policy over five possible answers to one prompt. The reference model likes A best. People ranked them C &gt;
        A &gt; D &gt; B &gt; E, giving 10 chosen/rejected pairs. Training applies the exact DPO gradient to the
        policy's logits.
      </p>
      <div className="space-y-2 mb-4">
        {ANSWERS.map((a, i) => (
          <div key={a.n} className="grid grid-cols-[72px_minmax(0,1fr)_110px] items-center gap-2">
            <span className="text-xs text-gray-300">
              {a.n} <span className="text-gray-500">#{RANK.indexOf(i) + 1}</span>
            </span>
            <div className="h-5 rounded bg-white/5 relative overflow-hidden">
              <div className="absolute top-0 bottom-0 left-0 bg-white/15" style={{ width: `${a.ref * 100}%` }} />
              <div className="absolute top-1 bottom-1 left-0 rounded bg-emerald-500/80" style={{ width: `${st.pi[i] * 100}%`, transition: "width 120ms" }} />
            </div>
            <span className="text-[0.6875rem] font-mono text-gray-400 text-right">
              {pct(st.pi[i], 0)} · r̂ {fmt(beta * st.lr[i], 2)}
            </span>
          </div>
        ))}
        <div className="text-[0.6875rem] text-gray-500">Grey: reference model. Green: policy. #n: people's rank. r̂: implicit reward β·log π/π_ref.</div>
      </div>
      <div className="mb-4">
        <Segmented
          tone="emerald"
          value={kind}
          onChange={(v) => { setKind(v); reset(); }}
          options={[{ v: "dpo", label: "DPO loss" }, { v: "ipo", label: "IPO loss (target margin 1/2β)" }]}
        />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_auto] gap-4 items-end">
        <Slider tone="emerald" label="β (reset after changing)" value={beta} min={0.05} max={1} step={0.05} onChange={(v) => { setBeta(v); reset(); }} format={(v) => v.toFixed(2)} />
        <div className="grid grid-cols-4 gap-2 sm:w-[26rem]">
          <Metric label="Steps" value={step} />
          <Metric label="Loss" value={fmt(st.loss, 3)} tone="amber" />
          <Metric label="Pairs right" value={pct(st.acc, 0)} tone="emerald" />
          <Metric label="KL from ref" value={fmt(st.kl, 2)} tone="purple" />
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Train with DPO. The ranking is learned within about 100 steps ("pairs right" hits 100%), but DPO keeps
        going: C heads toward 100% and everything else toward zero, whatever β you pick. When preferences are this
        consistent, the logistic loss can always be lowered by widening the margin, so β slows the drift but never
        stops it — DPO over-fits. Now switch to IPO, which aims for a fixed margin of 1/(2β) and then stops. Try β =
        0.1 and β = 1: the larger β keeps the policy much closer to the reference (KL about 1.0 vs 0.03), which is how a
        KL penalty is supposed to behave. Note that "pairs right" counts the implicit reward β·log π/π_ref, so it can be
        100% even while the reference's favourite, A, is still the single most likely answer.
      </p>
    </Panel>
  );
}

const VARIANTS = [
  ["DPO", "yes", "chosen/rejected pairs", "The logistic loss above."],
  ["IPO", "yes", "pairs", "Squared loss toward a fixed margin, so it stops pushing once pairs are separated — less over-fitting on near-certain preferences."],
  ["KTO", "yes", "single answers marked good or bad", "No pairs needed: works with thumbs-up/down feedback, using a value function inspired by prospect theory."],
  ["ORPO", "no", "pairs", "Adds an odds-ratio penalty to the ordinary SFT loss, so instruction tuning and preference tuning happen in one stage."],
  ["SimPO", "no", "pairs", "Uses the length-normalised average log-probability as the reward plus a target margin — no reference model, less length bias."],
  ["Online / iterative DPO", "yes", "fresh pairs each round", "Sample new answers from the current model, have a reward model or AI judge label them, run DPO, repeat."],
];

export default function MlDpo() {
  const toc = [
    { label: "The Shortcut", hash: "idea" },
    { label: "The Derivation", hash: "derivation" },
    { label: "The Loss, Explored", hash: "loss" },
    { label: "Watch DPO Train", hash: "train" },
    { label: "RLHF (PPO) vs DPO", hash: "compare" },
    { label: "The Preference-Optimisation Family", hash: "family" },
    { label: "Practical Tips", hash: "tips" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="DPO — Direct Preference Optimization"
      intro="RLHF's goal without its machinery. A short piece of algebra shows the reward model and the RL loop can be skipped: train the language model directly on 'answer A is better than answer B' pairs."
      toc={toc}
    >
      <Section id="idea" title="The Shortcut" lead="RLHF trains a reward model, then runs PPO against it with four models in memory. DPO (Rafailov et al., 2023) noticed that the policy RLHF is aiming for can be written in closed form — so the language model can play the role of its own reward model.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Same data as RLHF" tone="indigo"><p>Prompts, each with a chosen and a rejected answer, from people or an AI judge.</p></Card>
          <Card title="Same goal as RLHF" tone="emerald"><p>Maximise preference while staying close to the reference model, controlled by β.</p></Card>
          <Card title="Supervised-learning mechanics" tone="amber"><p>A loss you minimise with ordinary gradient descent. No sampling during training, no value model, no reward model.</p></Card>
        </div>
      </Section>

      <Section id="derivation" title="The Derivation">
        <Derivation />
      </Section>

      <Section id="loss" title="The Loss, Explored" lead="For each pair, the policy earns an implicit reward on both answers. The loss wants the chosen answer's implicit reward to exceed the rejected one's.">
        <LossExplorer />
      </Section>

      <Section id="train" title="Watch DPO Train">
        <DpoTrainer />
      </Section>

      <Section id="compare" title="RLHF (PPO) vs DPO">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-gray-300">
              <tr>
                <th className="p-3" />
                <th className="p-3">RLHF with PPO</th>
                <th className="p-3">DPO</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-gray-400">
              {[
                ["Models in memory", "4 — policy, value, reference, reward", "2 — policy, reference"],
                ["Generates text while training", "Yes, every step (on-policy)", "No, fixed dataset (offline)"],
                ["Reward model", "Explicit, trained separately", "Implicit in the policy"],
                ["Main knobs", "KL coefficient, clip range, GAE, batch sizes, …", "β and learning rate"],
                ["Exploration", "Can discover answers better than any in the data", "Limited to the answers in the pairs"],
                ["Where it shows up", "Frontier labs; reasoning RL", "Most open-model alignment; fast iteration"],
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
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          Head-to-head studies in 2024 found a carefully tuned PPO can still beat DPO, particularly on tasks like code
          where exploring new answers helps. DPO's advantage is that it is far easier to get right. Online DPO closes
          some of the gap by generating fresh pairs each round.
        </p>
      </Section>

      <Section id="family" title="The Preference-Optimisation Family" lead="DPO started a family of offline preference losses. They differ in what data they need and whether they keep a reference model.">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm text-left">
            <thead className="bg-white/5 text-gray-300">
              <tr>
                <th className="p-3">Method</th>
                <th className="p-3">Reference model</th>
                <th className="p-3">Data</th>
                <th className="p-3">Key idea</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-gray-400">
              {VARIANTS.map(([n, r, d, k]) => (
                <tr key={n}>
                  <td className="p-3 text-white font-semibold">{n}</td>
                  <td className="p-3">{r}</td>
                  <td className="p-3">{d}</td>
                  <td className="p-3">{k}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="tips" title="Practical Tips">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <Card title="Start from a good SFT model" tone="indigo"><p>DPO refines preferences; it does not teach the format. The reference model is usually that SFT checkpoint.</p></Card>
          <Card title="β around 0.1, tiny learning rate" tone="amber"><p>Typical settings are β = 0.1 and a learning rate around 5e-7 to 5e-6, for one to three epochs. Larger learning rates degrade the model quickly.</p></Card>
          <Card title="Use on-policy pairs" tone="emerald"><p>Pairs sampled from your own SFT model work better than pairs written by a different model — the policy learns about its own mistakes.</p></Card>
          <Card title="Watch the chosen log-probs" tone="rose"><p>TRL logs rewards/chosen, rewards/rejected, rewards/margins and rewards/accuracies. If the chosen log-probability keeps falling, the model is winning by suppressing both answers.</p></Card>
        </div>
        <Note tone="indigo">
          Where preference data comes from matters as much as the loss. Much open-model DPO data is labelled by a
          strong model acting as judge — see <a href="#/ml/rlaif" className="text-blue-400 hover:underline">RLAIF</a>.
        </Note>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`from datasets import load_dataset
from transformers import AutoModelForCausalLM, AutoTokenizer
from trl import DPOConfig, DPOTrainer

sft = "my-org/llama-8b-sft"
model = AutoModelForCausalLM.from_pretrained(sft)
tok = AutoTokenizer.from_pretrained(sft)

# Each row: {"prompt": ..., "chosen": ..., "rejected": ...}
pairs = load_dataset("my-org/preferences", split="train")

args = DPOConfig(
    output_dir="dpo",
    beta=0.1,                 # the KL-strength knob
    learning_rate=5e-7,
    num_train_epochs=1,
    loss_type="sigmoid",      # standard DPO; "ipo", "hinge", ... select variants
)
trainer = DPOTrainer(
    model=model,
    ref_model=None,           # None: TRL uses a frozen copy of the starting model
    args=args,
    train_dataset=pairs,
    processing_class=tok,
)
trainer.train()

# Related trainers in TRL: KTOTrainer (thumbs up/down data), ORPOTrainer,
# CPOTrainer(loss_type="simpo") for SimPO, OnlineDPOTrainer.`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("rl-alignment")} />
    </GuideLayout>
  );
}

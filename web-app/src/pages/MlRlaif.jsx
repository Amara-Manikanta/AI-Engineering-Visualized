import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section, Button } from "../components/VizKit";
import { rng, randn, pct } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "RLAIF", "reinforcement learning from AI feedback", "Constitutional AI", "constitution", "critique and revision",
  "self-critique", "AI feedback", "LLM as a judge", "LLM-as-a-judge", "position bias", "verbosity bias",
  "self-preference bias", "preference labels", "UltraFeedback", "harmlessness", "Anthropic",
];

/* ---------------------------------------------------------------------------
   Phase 1 of Constitutional AI: critique and revise, one principle at a time.
   The texts are an illustration written for this page.
--------------------------------------------------------------------------- */

const CAI_STEPS = [
  {
    kind: "prompt",
    title: "Red-team prompt",
    text: "My landlord hasn't returned my ₹40,000 deposit. Write a message threatening to post his address online if he doesn't pay.",
  },
  {
    kind: "draft",
    title: "Draft from a helpful-only model",
    text: "\"Pay back my ₹40,000 deposit by Friday or I'll post your home address and phone number in every tenant group in the city.\" (This is fine legally, since your address is public anyway.)",
  },
  {
    kind: "critique",
    title: "Critique — principle: avoid harmful or illegal actions",
    text: "Threatening to publish someone's address to pressure them is intimidation. It could expose the user to legal trouble and escalates a dispute the user can probably win by lawful means.",
  },
  {
    kind: "critique",
    title: "Critique — principle: do not state false or misleading claims",
    text: "The draft claims the threat is legal. Publishing someone's details to coerce them can count as harassment or criminal intimidation in many places, so that claim is misleading.",
  },
  {
    kind: "critique",
    title: "Critique — principle: be genuinely helpful, not just cautious",
    text: "Simply refusing would leave the user stuck. Their real goal is getting the deposit back: the response should cite the agreement, set a written deadline and explain the next step if the landlord ignores it.",
  },
  {
    kind: "revision",
    title: "Final revision",
    text: "I'd leave out the threat — it could backfire on you legally. Here's a firm message that keeps you in the stronger position: \"Dear Mr. Sharma, the tenancy ended on 31 August and the flat was handed back in good condition. Under clause 7 of our agreement the ₹40,000 deposit is due within 30 days. Please transfer it by 30 September. If it has not arrived by then I will send a formal legal notice and pursue recovery.\" Keep copies of the agreement, the handover photos and every message.",
  },
  {
    kind: "sft",
    title: "Becomes training data",
    text: "The pair (prompt → final revision) is added to a supervised fine-tuning set. Thousands of these teach the model to produce the revised kind of answer first time — without the critique step.",
  },
];

const KIND_STYLE = {
  prompt: "border-slate-500/40 bg-slate-500/10",
  draft: "border-rose-500/40 bg-rose-500/10",
  critique: "border-amber-500/40 bg-amber-500/10",
  revision: "border-emerald-500/40 bg-emerald-500/10",
  sft: "border-indigo-500/40 bg-indigo-500/10",
};

function CritiqueLoop() {
  const [i, setI] = useState(1);
  return (
    <Panel
      tone="emerald"
      title="Critique → revise, against written principles"
      actions={
        <>
          <Button tone="emerald" onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>← Back</Button>
          <Button tone="emerald" onClick={() => setI((v) => Math.min(CAI_STEPS.length - 1, v + 1))} disabled={i === CAI_STEPS.length - 1}>Next step →</Button>
        </>
      }
    >
      <div className="space-y-2">
        {CAI_STEPS.slice(0, i + 1).map((s, j) => (
          <div key={j} className={`rounded-xl border p-3 ${KIND_STYLE[s.kind]} ${j === i ? "" : "opacity-60"}`}>
            <div className="text-[0.6875rem] uppercase tracking-wide text-gray-400 mb-1">{s.title}</div>
            <div className="text-sm text-gray-100 leading-relaxed">{s.text}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        An illustration written for this page, following the structure of Anthropic's Constitutional AI method. The
        same model plays every role: it writes the draft, critiques it against a principle drawn from the constitution,
        and rewrites it. No person labels whether the draft was harmful.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   AI judges and position bias: ask once, or ask twice with the order swapped.
--------------------------------------------------------------------------- */

const PAIRS = (() => {
  const r = rng(64);
  return Array.from({ length: 400 }, () => ({ m: randn(r), u1: r(), u2: r() }));
})();
const sig = (z) => 1 / (1 + Math.exp(-z));

function JudgeLab() {
  const [bias, setBias] = useState(0.8);
  const [skill, setSkill] = useState(2.5);
  const res = useMemo(() => {
    let single = 0;
    let flips = 0;
    let kept = 0;
    let keptRight = 0;
    PAIRS.forEach(({ m, u1, u2 }) => {
      const truthA = m > 0;
      // Order 1: A shown first. The judge leans toward whatever is shown first.
      const pickA1 = u1 < sig(skill * m + bias);
      // Order 2: B shown first.
      const pickB2 = u2 < sig(-skill * m + bias);
      const pickA2 = !pickB2;
      if (pickA1 === truthA) single++;
      if (pickA1 !== pickA2) flips++;
      else {
        kept++;
        if (pickA1 === truthA) keptRight++;
      }
    });
    const n = PAIRS.length;
    return { single: single / n, flips: flips / n, kept: kept / n, keptAcc: kept ? keptRight / kept : 0 };
  }, [bias, skill]);

  return (
    <Panel tone="amber" title="An AI judge with a position bias">
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        400 pairs of answers with a known better one. A simulated judge picks the better answer most of the time, but
        leans toward whichever answer it reads first. Compare asking once with asking twice in swapped order and
        keeping only consistent verdicts.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Slider tone="amber" label="Position bias toward the first answer" value={bias} min={0} max={3} step={0.1} onChange={setBias} format={(v) => v.toFixed(1)} />
        <Slider tone="amber" label="Judge skill" value={skill} min={0.5} max={6} step={0.1} onChange={setSkill} format={(v) => v.toFixed(1)} />
      </div>
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-3">
        <Metric label="Ask once: accuracy" value={pct(res.single, 0)} tone="rose" />
        <Metric label="Verdict flips when swapped" value={pct(res.flips, 0)} tone="amber" />
        <Metric label="Swap & keep consistent: accuracy" value={pct(res.keptAcc, 0)} tone="emerald" />
        <Metric label="Pairs kept" value={pct(res.kept, 0)} sub="the rest go to a human or are dropped" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        With no bias, asking twice changes little. As the bias grows, a single verdict increasingly reflects the order
        rather than the answers, and a large share of verdicts flip when the order is swapped. Keeping only verdicts
        that survive the swap restores accuracy, at the cost of discarding the ambiguous pairs — which are often the
        close calls you most wanted judged.
      </p>
    </Panel>
  );
}

export default function MlRlaif() {
  const toc = [
    { label: "The Labelling Bottleneck", hash: "why" },
    { label: "Constitutional AI", hash: "cai" },
    { label: "Phase 1: Critique & Revise", hash: "phase1" },
    { label: "Phase 2: AI Preferences", hash: "phase2" },
    { label: "AI Judges and Their Biases", hash: "judges" },
    { label: "Does It Work?", hash: "results" },
    { label: "Where It Is Used", hash: "uses" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="RLAIF and Constitutional AI"
      intro="Replace most human preference labels with judgements from an AI model, guided by a written set of principles. Cheaper, faster and more consistent than human labelling — and the values being taught are written down where anyone can read them."
      toc={toc}
    >
      <Section id="why" title="The Labelling Bottleneck" lead="RLHF needs hundreds of thousands of human comparisons. That creates problems beyond cost.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Slow and expensive" tone="rose"><p>Each new model version, domain or policy change needs fresh labels.</p></Card>
          <Card title="Inconsistent" tone="amber"><p>Labellers disagree with each other often, and drift over time.</p></Card>
          <Card title="Harmful to label" tone="purple"><p>Red-teaming means people reading large volumes of disturbing content.</p></Card>
          <Card title="Implicit values" tone="indigo"><p>What the model is being taught lives inside thousands of individual judgements, where no one can inspect it.</p></Card>
        </div>
      </Section>

      <Section id="cai" title="Constitutional AI" lead="Anthropic's method, published in December 2022 (Bai et al.). A short list of natural-language principles — the constitution — replaces human labels for harmlessness. Human labels were still used for helpfulness.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Phase 1 — supervised (SL-CAI)" tone="emerald">
            <p>The model answers harmful prompts, critiques its own answers against randomly drawn principles, and revises them. It is then fine-tuned on the revised answers.</p>
          </Card>
          <Card title="Phase 2 — reinforcement (RL-CAI)" tone="indigo">
            <p>The model compares pairs of answers according to the principles. Those AI preferences train a preference model, which then rewards the policy — RLHF with AI feedback in place of human harmlessness labels.</p>
          </Card>
        </div>
      </Section>

      <Section id="phase1" title="Phase 1: Critique and Revise">
        <CritiqueLoop />
      </Section>

      <Section id="phase2" title="Phase 2: AI Preferences" lead="For each prompt, sample two answers from the phase-1 model and ask a model to choose, framed by a principle.">
        <div className="rounded-xl border border-white/10 bg-black/40 p-4 font-mono text-xs sm:text-sm text-gray-300 leading-relaxed mb-5 whitespace-pre-wrap">
{`Consider the following conversation between a person and an assistant:
  [prompt]
Which of these responses is more helpful, honest and harmless?
  (A) [first answer]
  (B) [second answer]
The answer is: (`}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Soft labels" tone="amber"><p>Read the probabilities the model assigns to "A" and "B" rather than a hard choice. P(A) = 0.83 is a richer training target than "A".</p></Card>
          <Card title="Principle sampling" tone="purple"><p>Each comparison uses a principle drawn at random from the constitution, so the preference model learns the whole set rather than one phrasing.</p></Card>
          <Card title="Chain-of-thought judging" tone="emerald"><p>Asking the judge to reason step by step before choosing improved agreement with human judgements in the paper.</p></Card>
        </div>
      </Section>

      <Section id="judges" title="AI Judges and Their Biases" lead="Using a model as a judge — for training data or for evaluation — inherits that model's biases. The best documented are position, verbosity and self-preference.">
        <JudgeLab />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-6">
          <Card title="Position bias" tone="amber"><p>Favouring the first (or second) answer shown. Fix: evaluate both orders.</p></Card>
          <Card title="Verbosity bias" tone="rose"><p>Favouring longer answers regardless of quality. Fix: length-controlled comparisons, or instruct the judge to ignore length.</p></Card>
          <Card title="Self-preference" tone="purple"><p>Rating answers written by the same model family more highly. Fix: use a judge from a different family, or several judges.</p></Card>
        </div>
        <div className="mt-5">
          <Note tone="indigo">
            Always calibrate an AI judge against a few hundred human-labelled examples before trusting it at scale. If it
            agrees with people about as often as people agree with each other, it is doing its job.
          </Note>
        </div>
      </Section>

      <Section id="results" title="Does It Work?">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Constitutional AI (2022)" tone="emerald"><p>Anthropic reported that RL-CAI models were both more harmless and less evasive than models trained with human harmlessness labels — they explained their objections rather than refusing flatly.</p></Card>
          <Card title="RLAIF vs RLHF (Google, 2023)" tone="blue"><p>Across summarisation and helpful and harmless dialogue, people rated RLAIF-trained policies about as highly as RLHF-trained ones. Scoring directly with an LLM as the reward ("direct RLAIF") also worked.</p></Card>
        </div>
      </Section>

      <Section id="uses" title="Where It Is Used">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Frontier assistants" tone="indigo"><p>Anthropic trains Claude against a published constitution; AI feedback now supplements human feedback across the industry.</p></Card>
          <Card title="Open preference datasets" tone="emerald"><p>UltraFeedback (2023) used GPT-4 ratings to build preference pairs; Hugging Face's Zephyr-7B was aligned on it with <a href="#/ml/dpo" className="text-blue-400 hover:underline">DPO</a> and no human preference labels.</p></Card>
          <Card title="Evaluation" tone="amber"><p>LLM-as-a-judge powers most automatic chat benchmarks and many teams' regression tests for prompts and RAG systems.</p></Card>
        </div>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`import anthropic

client = anthropic.Anthropic()

def ask(prompt: str, model: str = "claude-sonnet-5") -> str:
    msg = client.messages.create(model=model, max_tokens=1024,
                                 messages=[{"role": "user", "content": prompt}])
    return msg.content[0].text

PRINCIPLES = [
    "Point out anything harmful, unethical or illegal in the response.",
    "Point out any claims that are false or misleading.",
    "Point out how the response could better serve the person's real goal.",
]

# Phase 1: critique and revise — the output becomes a supervised training example
def critique_and_revise(question: str, draft: str) -> str:
    for principle in PRINCIPLES:
        critique = ask(f"Question: {question}\\nResponse: {draft}\\n\\n{principle}")
        draft = ask(f"Question: {question}\\nResponse: {draft}\\nCritique: {critique}\\n\\n"
                    "Rewrite the response to address the critique. Return only the new response.")
    return draft

# Phase 2 / evaluation: pairwise judging with the order swapped
JUDGE = ("Question: {q}\\n\\nResponse A: {a}\\n\\nResponse B: {b}\\n\\n"
         "Which response is more helpful, honest and harmless? Answer with exactly A or B.")

def judge(q: str, x: str, y: str):
    first = ask(JUDGE.format(q=q, a=x, b=y)).strip()
    second = ask(JUDGE.format(q=q, a=y, b=x)).strip()
    if first == "A" and second == "B":
        return {"chosen": x, "rejected": y}
    if first == "B" and second == "A":
        return {"chosen": y, "rejected": x}
    return None     # inconsistent: position bias decided it — drop or send to a person`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("rl-alignment")} />
    </GuideLayout>
  );
}

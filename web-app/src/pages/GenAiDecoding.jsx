import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section, Button } from "../components/VizKit";

export const SEARCH_KEYWORDS = [
  "decoding", "sampling", "greedy decoding", "beam search", "beam width", "length penalty", "temperature",
  "top-k", "top-p", "nucleus sampling", "min-p", "repetition penalty", "frequency penalty", "presence penalty",
  "logit bias", "stop sequences", "max tokens", "constrained decoding", "structured output", "JSON mode",
  "JSON schema", "grammar-constrained generation", "Outlines", "XGrammar", "seed", "determinism",
];

/* ---------------------------------------------------------------------------
   Beam search on a tiny hand-written language model. The probabilities are
   the classic example where the greedy choice at step 1 loses overall.
--------------------------------------------------------------------------- */

const LM = {
  The: { nice: 0.5, dog: 0.4, car: 0.1 },
  "The nice": { woman: 0.4, house: 0.3, guy: 0.3 },
  "The dog": { has: 0.9, runs: 0.05, and: 0.05 },
  "The car": { is: 0.3, drives: 0.5, turns: 0.2 },
  "The nice woman": { smiled: 0.5, "<end>": 0.5 },
  "The nice house": { "<end>": 1.0 },
  "The nice guy": { "<end>": 1.0 },
  "The dog has": { fleas: 0.6, "<end>": 0.4 },
  "The dog runs": { "<end>": 1.0 },
  "The dog and": { "<end>": 1.0 },
  "The car is": { "<end>": 1.0 },
  "The car drives": { "<end>": 1.0 },
  "The car turns": { "<end>": 1.0 },
};

function beamSearch(width, steps = 3) {
  let beams = [{ seq: "The", logp: 0, done: false }];
  const history = [beams];
  for (let s = 0; s < steps; s++) {
    const cands = [];
    beams.forEach((b) => {
      if (b.done) {
        cands.push(b);
        return;
      }
      const next = LM[b.seq] || { "<end>": 1 };
      Object.entries(next).forEach(([w, p]) =>
        cands.push({ seq: w === "<end>" ? b.seq : `${b.seq} ${w}`, logp: b.logp + Math.log(p), done: w === "<end>" }),
      );
    });
    cands.sort((a, b) => b.logp - a.logp);
    beams = cands.slice(0, width);
    history.push(beams);
  }
  return history;
}

function BeamLab() {
  const [width, setWidth] = useState(1);
  const hist = useMemo(() => beamSearch(width), [width]);
  const final = hist.at(-1)[0];
  return (
    <Panel tone="indigo" title="Greedy vs beam search on a four-word language model">
      <div className="flex flex-wrap items-end gap-5 mb-4">
        <div className="w-56"><Slider label="Beam width (1 = greedy)" value={width} min={1} max={4} onChange={setWidth} /></div>
        <Metric label="Result" value={`“${final.seq}”`} tone="indigo" />
        <Metric label="Sequence probability" value={Math.exp(final.logp).toFixed(3)} tone="emerald" />
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {hist.slice(1).map((beams, s) => (
          <div key={s} className="rounded-xl border border-white/10 bg-black/30 p-3">
            <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-2">after step {s + 1} · kept {beams.length}</div>
            {beams.map((b, i) => (
              <div key={i} className={`flex justify-between gap-2 text-xs font-mono py-0.5 ${i === 0 ? "text-indigo-200" : "text-gray-400"}`}>
                <span>{b.seq}{b.done ? " ⏹" : ""}</span>
                <span>{Math.exp(b.logp).toFixed(3)}</span>
              </div>
            ))}
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Greedy picks “nice” (0.5) over “dog” (0.4) at the first step and never looks back — ending at 0.200 or
        below. With a beam of 2 it keeps “The dog” alive, whose next word “has” is very likely (0.9), and finds a
        sequence with higher total probability. Beam search is standard for translation and speech recognition,
        where there is one right answer. For open-ended chat it tends to produce bland, repetitive text, which is
        why chat models sample instead.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Penalties and logit bias, applied to one step's logits exactly as the
   OpenAI-style API (frequency / presence) and Hugging Face (repetition) do.
--------------------------------------------------------------------------- */

const STEP = [
  { t: "great", logit: 3.1, seen: 3 },
  { t: "good", logit: 2.6, seen: 1 },
  { t: "excellent", logit: 2.2, seen: 0 },
  { t: "solid", logit: 1.6, seen: 0 },
  { t: "fine", logit: 1.1, seen: 0 },
];

function softmax(xs, temp) {
  const m = Math.max(...xs);
  const e = xs.map((x) => Math.exp((x - m) / temp));
  const s = e.reduce((a, b) => a + b, 0);
  return e.map((v) => v / s);
}

function PenaltyLab() {
  const [freq, setFreq] = useState(0);
  const [pres, setPres] = useState(0);
  const [rep, setRep] = useState(1);
  const [bias, setBias] = useState(0);
  const [temp, setTemp] = useState(1);
  const adj = STEP.map((s) => {
    let l = s.logit;
    if (s.seen > 0 && rep !== 1) l = l > 0 ? l / rep : l * rep; // Hugging Face repetition_penalty
    l -= s.seen * freq + (s.seen > 0 ? pres : 0); // OpenAI-style frequency / presence penalties
    if (s.t === "solid") l += bias; // logit_bias on one token
    return l;
  });
  const before = softmax(STEP.map((s) => s.logit), temp);
  const after = softmax(adj, temp);

  return (
    <Panel tone="amber" title="“The movie was great, the acting was great, the music was …”">
      <p className="text-sm text-gray-400 mb-4">Next-token candidates, with how many times each already appeared in the output.</p>
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-5">
        <div className="space-y-2">
          {STEP.map((s, i) => (
            <div key={s.t} className="grid grid-cols-[90px_minmax(0,1fr)_56px] items-center gap-2 text-xs font-mono">
              <span className="text-gray-300">{s.t} <span className="text-gray-600">×{s.seen}</span></span>
              <div className="relative h-5 bg-white/5 rounded">
                <div className="absolute inset-y-0 left-0 bg-white/15 rounded" style={{ width: `${before[i] * 100}%` }} />
                <div className="absolute inset-y-1 left-0 bg-amber-400/80 rounded" style={{ width: `${after[i] * 100}%`, transition: "width 200ms" }} />
              </div>
              <span className="text-amber-200 text-right">{(after[i] * 100).toFixed(0)}%</span>
            </div>
          ))}
          <div className="text-[0.6875rem] text-gray-500">Grey: original probability. Amber: after the settings on the right.</div>
        </div>
        <div className="space-y-3">
          <Slider tone="amber" label="frequency_penalty" value={freq} min={0} max={2} step={0.1} onChange={setFreq} format={(v) => v.toFixed(1)} />
          <Slider tone="amber" label="presence_penalty" value={pres} min={0} max={2} step={0.1} onChange={setPres} format={(v) => v.toFixed(1)} />
          <Slider tone="amber" label="repetition_penalty (HF)" value={rep} min={1} max={2} step={0.05} onChange={setRep} format={(v) => v.toFixed(2)} />
          <Slider tone="amber" label='logit_bias on "solid"' value={bias} min={-5} max={5} step={0.5} onChange={setBias} format={(v) => (v > 0 ? `+${v}` : v)} />
          <Slider tone="amber" label="temperature" value={temp} min={0.2} max={2} step={0.1} onChange={setTemp} format={(v) => v.toFixed(1)} />
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        The frequency penalty subtracts penalty × count, so “great” (used three times) is hit hardest. The presence
        penalty subtracts a flat amount from anything already used once or more — it nudges toward new topics
        rather than punishing heavy repetition more. Hugging Face's repetition penalty divides positive logits
        instead. Logit bias adds a fixed amount to one token: +100 effectively forces it, −100 effectively bans it.
        Temperature rescales everything at the end.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Constrained decoding: at each step, tokens that would break the schema are
   masked out before sampling.
--------------------------------------------------------------------------- */

const SCHEMA_STEPS = [
  { text: "", allowed: ['{"'], note: "An object must start with {\"." },
  { text: '{"', allowed: ['status"'], note: "The only property the schema defines is status." },
  { text: '{"status"', allowed: [": "], note: "A key must be followed by a colon." },
  { text: '{"status": ', allowed: ['"approved"', '"rejected"', '"needs_review"'], note: "status is an enum: every other token is masked to probability zero." },
  { text: '{"status": "rejected"', allowed: ["}"], note: "No other properties are allowed, so the object must close." },
];
const VOCAB = ['{"', 'status"', ": ", '"approved"', '"rejected"', '"needs_review"', "}", "Sure", "Here", "```json", '"maybe"', "\n"];

function ConstrainedLab() {
  const [i, setI] = useState(0);
  const st = SCHEMA_STEPS[i];
  return (
    <Panel tone="emerald" title="Grammar-constrained decoding: the model can only emit valid JSON">
      <div className="font-mono text-sm bg-black/50 border border-white/10 rounded-lg p-3 mb-3 min-h-[2.5rem] text-emerald-200 break-all">
        {st.text || <span className="text-gray-600">(empty)</span>}
        <span className="animate-pulse">▍</span>
      </div>
      <div className="flex flex-wrap gap-1.5 mb-3">
        {VOCAB.map((v) => {
          const ok = st.allowed.includes(v);
          return (
            <span key={v} className={`px-2 py-1 rounded font-mono text-xs border ${ok ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-200" : "border-white/5 bg-white/[0.02] text-gray-600 line-through"}`}>
              {JSON.stringify(v).slice(1, -1)}
            </span>
          );
        })}
      </div>
      <p className="text-xs text-gray-400 mb-3">{st.note}</p>
      <div className="flex gap-2">
        <Button tone="emerald" onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>‹ Back</Button>
        <Button tone="emerald" onClick={() => setI((v) => Math.min(SCHEMA_STEPS.length - 1, v + 1))} disabled={i === SCHEMA_STEPS.length - 1}>Next token ›</Button>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        The schema is compiled into a grammar; at every step, tokens that could not lead to a valid document get
        their logits set to −∞. “Sure, here's the JSON:” and markdown fences are impossible, so parsing never
        fails. This guarantees the <em>shape</em>, not the <em>content</em>: the model can still choose the wrong
        enum value, so keep validating meaning downstream.
      </p>
    </Panel>
  );
}

export default function GenAiDecoding() {
  const toc = [
    { label: "From Logits to Text", hash: "logits" },
    { label: "Greedy & Beam Search", hash: "beam" },
    { label: "Sampling Controls", hash: "sampling" },
    { label: "Penalties & Logit Bias", hash: "penalties" },
    { label: "Structured Output", hash: "structured" },
    { label: "Stopping & Determinism", hash: "stopping" },
    { label: "Recommended Settings", hash: "settings" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Decoding & Sampling"
      intro="How a model's next-token probabilities become text: greedy and beam search, temperature, top-k, top-p and min-p, repetition penalties and logit bias, and constrained decoding that guarantees valid JSON."
      toc={toc}
    >
      <Section id="logits" title="From Logits to Text" lead="At every step the model outputs a score (logit) for every token in its vocabulary. A decoding strategy turns those scores into one chosen token, appends it, and repeats.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="1. Adjust the logits" tone="amber"><p>Penalties for repetition, logit bias, and masks from grammars or stop rules are applied to the raw scores.</p></Card>
          <Card title="2. Shape the distribution" tone="indigo"><p>Temperature scales it; top-k, top-p and min-p cut the unlikely tail.</p></Card>
          <Card title="3. Choose" tone="emerald"><p>Take the most likely token (greedy), keep several candidates (beam search), or sample at random from what remains.</p></Card>
        </div>
      </Section>

      <Section id="beam" title="Greedy & Beam Search">
        <BeamLab />
      </Section>

      <Section id="sampling" title="Sampling Controls" lead="Sampling picks at random in proportion to probability. These knobs decide which tokens are eligible and how flat the odds are.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Temperature" tone="indigo"><p>Divides logits before softmax. Below 1 sharpens toward the top token; above 1 flattens. 0 is effectively greedy.</p></Card>
          <Card title="Top-k" tone="purple"><p>Keep only the k most likely tokens. Simple, but the right k differs between confident and uncertain steps.</p></Card>
          <Card title="Top-p (nucleus)" tone="emerald"><p>Keep the smallest set whose probabilities add up to p. Adapts: few tokens when the model is sure, many when it is not.</p></Card>
          <Card title="Min-p" tone="amber"><p>Keep tokens with at least min_p × the top token's probability. Scales the cut-off with confidence; popular for high-temperature creative sampling.</p></Card>
        </div>
        <Note tone="indigo">
          Try them hands-on in the <a href="#/interactive" className="text-blue-400 hover:underline">sampling playground</a>. Some reasoning models fix
          or ignore sampling parameters — check the provider's documentation before tuning them.
        </Note>
      </Section>

      <Section id="penalties" title="Penalties & Logit Bias" lead="Computed exactly on one step's logits.">
        <PenaltyLab />
      </Section>

      <Section id="structured" title="Structured Output">
        <ConstrainedLab />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <Card title="Provider features" tone="indigo"><p>Structured-output or JSON-schema modes in the major APIs, and strict tool/function calling, apply this constraint server-side.</p></Card>
          <Card title="Open-source" tone="emerald"><p>Outlines, XGrammar, llguidance and the guided-decoding options in vLLM and SGLang do the same for self-hosted models.</p></Card>
          <Card title="Without constraints" tone="rose"><p>Prompting for JSON usually works, sometimes doesn't. Validate with a schema (e.g. Pydantic) and retry with the error message when it fails.</p></Card>
        </div>
      </Section>

      <Section id="stopping" title="Stopping & Determinism">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Stop conditions" tone="indigo"><p>Generation ends at the end-of-sequence token, a stop sequence you supply, or the max_tokens limit — check the finish reason to know which, and treat "length" as a truncated answer.</p></Card>
          <Card title="Seeds" tone="amber"><p>A fixed seed makes sampling repeatable on the same deployment, but providers do not guarantee identical output across hardware or versions.</p></Card>
          <Card title="Temperature 0 is not deterministic" tone="rose"><p>Floating-point differences in batched GPU kernels can flip near-tied tokens, so even greedy decoding can vary between runs on shared infrastructure.</p></Card>
        </div>
      </Section>

      <Section id="settings" title="Recommended Settings">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm min-w-[560px]">
            <thead className="bg-white/5 text-gray-400 text-left">
              <tr><th className="p-3 font-medium">Task</th><th className="p-3 font-medium">Starting point</th></tr>
            </thead>
            <tbody className="text-gray-300">
              <tr className="border-t border-white/5"><td className="p-3">Extraction, classification, code, tool calls</td><td className="p-3 text-xs">Temperature 0–0.2, structured output where possible</td></tr>
              <tr className="border-t border-white/5"><td className="p-3">RAG answers, summaries</td><td className="p-3 text-xs">Temperature 0.2–0.5, top-p 0.9</td></tr>
              <tr className="border-t border-white/5"><td className="p-3">Chat and general writing</td><td className="p-3 text-xs">Temperature ≈ 0.7, top-p 0.9–0.95 (provider defaults are usually tuned here)</td></tr>
              <tr className="border-t border-white/5"><td className="p-3">Brainstorming, fiction</td><td className="p-3 text-xs">Temperature 0.9–1.2 with min-p ≈ 0.05, light presence penalty</td></tr>
              <tr className="border-t border-white/5"><td className="p-3">Translation, speech recognition</td><td className="p-3 text-xs">Beam search (width 4–5) in dedicated models</td></tr>
            </tbody>
          </table>
        </div>
        <Note tone="amber">Change one parameter at a time — temperature and top-p interact — and judge by evaluation results, not a handful of samples.</Note>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`from pydantic import BaseModel
from typing import Literal
from openai import OpenAI     # any OpenAI-compatible endpoint, including vLLM

class Verdict(BaseModel):
    status: Literal["approved", "rejected", "needs_review"]
    reason: str

client = OpenAI()
resp = client.chat.completions.parse(
    model="your-model",
    messages=[{"role": "user", "content": claim_text}],
    response_format=Verdict,          # schema-constrained decoding
    temperature=0,
)
print(resp.choices[0].message.parsed)

# Sampling controls on a Hugging Face model
out = model.generate(**inputs, do_sample=True, temperature=0.7, top_p=0.9,
                     repetition_penalty=1.1, max_new_tokens=300)
beams = model.generate(**inputs, num_beams=4, early_stopping=True)   # beam search`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("genai-decoding")} />
    </GuideLayout>
  );
}

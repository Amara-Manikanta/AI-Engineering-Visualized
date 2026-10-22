import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";

/** Alternate names so search finds this page. */
export const SEARCH_KEYWORDS = [
  "Laya", "Jev", "Jeev", "TypeSafe", "Convai Innovations", "decision model", "typed decisions",
  "non-autoregressive", "encoder classifier", "choice score noul", "noul", "calibration", "ECE",
  "RLCD", "ModernBERT", "System 1", "LLM as a judge", "routing",
];

/* ---------------------------------------------------------------------------
   Generative vs decision: the same ticket, answered two ways.
   The decision side runs the real mechanism — one score per option, softmax
   over the options that exist. The scores themselves are illustrative (no
   model runs in your browser); the arithmetic on them is not.
--------------------------------------------------------------------------- */
const TICKET = "Hi, we were billed twice for March. Please refund the duplicate today or we will cancel our plan.";
const OPTIONS = [
  { k: "billing", logit: 3.1 },
  { k: "technical", logit: 0.4 },
  { k: "sales", logit: -0.6 },
  { k: "other", logit: -1.2 },
];
const GEN_TOKENS = ["Based", " on", " the", " message", ",", " this", " looks", " like", " a", " billing", " issue", ",", " possibly", " also", " account", " management", "."];

function TwoWays() {
  const [run, setRun] = useState(0);
  const [n, setN] = useState(0);

  useEffect(() => {
    if (!run) return;
    setN(0);
    let k = 0;
    const id = setInterval(() => {
      k += 1;
      setN(k);
      if (k >= GEN_TOKENS.length) clearInterval(id);
    }, 140);
    return () => clearInterval(id);
  }, [run]);

  const probs = useMemo(() => {
    const mx = Math.max(...OPTIONS.map((o) => o.logit));
    const e = OPTIONS.map((o) => Math.exp(o.logit - mx));
    const z = e.reduce((a, b) => a + b, 0);
    return e.map((x) => x / z);
  }, []);
  const best = probs.indexOf(Math.max(...probs));
  const genDone = n >= GEN_TOKENS.length;

  return (
    <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.06] p-5 sm:p-6">
      <div className="rounded-xl border border-white/10 bg-black/40 p-4 mb-5">
        <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">The input</div>
        <p className="text-base text-gray-200 m-0">"{TICKET}"</p>
        <div className="text-sm text-gray-400 mt-2">
          Question: <span className="text-white">Which department should handle this?</span>{" "}
          <span className="font-mono text-gray-500">billing · technical · sales · other</span>
        </div>
      </div>

      <button
        onClick={() => setRun((r) => r + 1)}
        className="mb-5 px-5 py-2.5 rounded-lg text-sm font-semibold border border-indigo-500/50 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30"
      >
        {run ? "↻ Run again" : "▶ Ask both"}
      </button>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <div className="rounded-xl border border-rose-500/30 bg-rose-500/[0.06] p-4">
          <div className="text-sm font-bold text-rose-300 mb-1">Generative LLM</div>
          <div className="text-xs text-gray-500 mb-3">Writes an answer one token at a time</div>
          <div className="min-h-[5.5rem] rounded-lg bg-black/40 border border-white/10 p-3 font-mono text-sm text-gray-200 leading-relaxed">
            {GEN_TOKENS.slice(0, n).join("")}
            {run > 0 && !genDone && <span className="inline-block w-2 h-4 bg-rose-300 ml-0.5 align-middle animate-pulse" />}
          </div>
          <div className="text-xs font-mono text-gray-500 mt-2">{n} tokens generated</div>
          {genDone && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 text-sm text-rose-200 leading-relaxed">
              Now you have to parse "billing" out of that — and it mentioned a fifth department that is not one of
              your options. No probability comes with it.
            </motion.div>
          )}
        </div>

        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/[0.06] p-4">
          <div className="text-sm font-bold text-emerald-300 mb-1">Decision model</div>
          <div className="text-xs text-gray-500 mb-3">Scores the options you supplied, in one forward pass</div>
          <div className="space-y-2">
            {OPTIONS.map((o, k) => (
              <div key={o.k} className="flex items-center gap-2">
                <span className={`w-20 text-sm font-mono ${k === best && run ? "text-emerald-200 font-bold" : "text-gray-400"}`}>{o.k}</span>
                <div className="flex-1 h-5 rounded bg-black/40 border border-white/5 overflow-hidden">
                  <motion.div
                    className={k === best ? "h-full bg-emerald-500/70" : "h-full bg-gray-500/50"}
                    initial={{ width: 0 }}
                    animate={{ width: run ? `${probs[k] * 100}%` : 0 }}
                    transition={{ duration: 0.35, delay: 0.05 }}
                  />
                </div>
                <span className="w-14 text-right text-sm font-mono text-gray-300">{run ? `${(probs[k] * 100).toFixed(1)}%` : "—"}</span>
              </div>
            ))}
          </div>
          {run > 0 && (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} transition={{ delay: 0.4 }} className="mt-3 text-sm text-emerald-200 leading-relaxed">
              <span className="font-mono">{`{ "department": "billing", "p": ${probs[best].toFixed(3)} }`}</span>
              <br />
              Always one of your four options — it cannot answer anything else — and it comes with a probability.
            </motion.div>
          )}
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 leading-relaxed">
        The option scores here are illustrative, since no model runs in your browser. The softmax that turns them
        into probabilities is computed live, and it is exactly the step a decision model performs.
      </p>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Calibration, computed. A model reports confidence c for each answer; if it
   is calibrated, answers given at 80% confidence are right about 80% of the
   time. We generate 600 predictions with known true probabilities, distort
   the reported confidence by an overconfidence factor, and compute ECE.
--------------------------------------------------------------------------- */
function rng(seed) {
  let s = seed >>> 0;
  return () => ((s = (s * 1664525 + 1013904223) >>> 0) / 4294967296);
}
const logit = (p) => Math.log(p / (1 - p));
const sig = (x) => 1 / (1 + Math.exp(-x));

function Calibration() {
  const [k, setK] = useState(2.2);

  const { bins, ece } = useMemo(() => {
    const r = rng(7);
    const preds = [];
    for (let i = 0; i < 600; i++) {
      const pTrue = 0.5 + r() * 0.49; // how often this kind of answer is actually right
      const correct = r() < pTrue;
      const conf = sig(logit(pTrue) * k); // what the model *says*
      preds.push({ conf, correct });
    }
    const B = Array.from({ length: 5 }, (_, i) => ({ lo: 0.5 + i * 0.1, n: 0, acc: 0, conf: 0 }));
    for (const p of preds) {
      const b = Math.min(4, Math.floor((p.conf - 0.5) / 0.1));
      if (b < 0) continue;
      B[b].n += 1;
      B[b].acc += p.correct ? 1 : 0;
      B[b].conf += p.conf;
    }
    let e = 0;
    const N = preds.length;
    for (const b of B) {
      if (!b.n) continue;
      b.acc /= b.n;
      b.conf /= b.n;
      e += (b.n / N) * Math.abs(b.acc - b.conf);
    }
    return { bins: B, ece: e };
  }, [k]);

  const verdict = k > 1.15 ? "Overconfident" : k < 0.87 ? "Underconfident" : "Well calibrated";

  return (
    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.06] p-5 sm:p-6">
      <h3 className="text-amber-300 font-bold text-lg mb-1">What "calibrated" means, measured</h3>
      <p className="text-base text-gray-400 leading-relaxed mb-5">
        600 predictions. Each bar is a confidence band: its height is how often answers in that band were actually
        right. A calibrated model's bars sit on the diagonal. Slide toward overconfident and watch the gap — and the
        error score — grow.
      </p>

      <label className="block mb-5">
        <span className="text-xs uppercase tracking-wide text-gray-500">How the model reports confidence</span>
        <input type="range" min="0.6" max="3" step="0.05" value={k} onChange={(e) => setK(Number(e.target.value))} className="w-full mt-2 accent-amber-500" />
        <div className="flex justify-between text-xs font-mono text-gray-500">
          <span>underconfident</span>
          <span className="text-amber-300">{verdict}</span>
          <span>overconfident</span>
        </div>
      </label>

      <div className="rounded-xl bg-black/40 border border-white/10 p-3 mb-4">
        <svg viewBox="0 0 420 240" className="w-full h-auto">
          {[0.5, 0.6, 0.7, 0.8, 0.9, 1].map((v) => (
            <g key={v}>
              <line x1="50" x2="400" y1={210 - (v - 0.5) * 380} y2={210 - (v - 0.5) * 380} stroke="rgba(255,255,255,0.06)" />
              <text x="44" y={214 - (v - 0.5) * 380} fontSize="11" fill="#6b7280" textAnchor="end" fontFamily="monospace">{Math.round(v * 100)}%</text>
            </g>
          ))}
          <line x1="50" y1="210" x2="400" y2="20" stroke="#fbbf24" strokeDasharray="5 4" strokeWidth="1.5" />
          <text x="396" y="34" fontSize="11" fill="#fbbf24" textAnchor="end">perfect calibration</text>
          {bins.map((b, i) =>
            b.n ? (
              <g key={i}>
                {/* Plain SVG attributes on purpose: Framer Motion reads `y` on a
                    motion.rect as a CSS transform, not the SVG attribute, and the
                    first render had no height — the browser logged "undefined". */}
                <rect
                  x={58 + i * 70}
                  y={210 - Math.max(2, (b.acc - 0.5) * 380)}
                  width="54"
                  height={Math.max(2, (b.acc - 0.5) * 380)}
                  fill="rgba(96,165,250,0.6)"
                  rx="3"
                />
                <circle cx={85 + i * 70} cy={210 - (b.conf - 0.5) * 380} r="5" fill="#f472b6" />
                <text x={85 + i * 70} y="228" fontSize="10" fill="#9ca3af" textAnchor="middle" fontFamily="monospace">
                  {Math.round(b.lo * 100)}–{Math.round(b.lo * 100) + 10}
                </text>
              </g>
            ) : null
          )}
        </svg>
        <div className="flex flex-wrap gap-4 text-xs text-gray-400 px-2">
          <span><span className="inline-block w-3 h-3 rounded-sm bg-blue-400/60 align-middle mr-1" />actual accuracy</span>
          <span><span className="inline-block w-3 h-3 rounded-full bg-pink-400 align-middle mr-1" />stated confidence</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="p-4 rounded-xl bg-black/40 border border-amber-500/30">
          <div className="text-xs uppercase tracking-wide text-amber-400 mb-1">Expected calibration error</div>
          <div className="text-3xl font-bold font-mono text-amber-200">{ece.toFixed(3)}</div>
          <div className="text-xs text-gray-500 mt-1">average gap between the dots and the bars, weighted by how many answers each band holds</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">For scale — reported figures</div>
          <div className="text-base font-mono text-gray-200">Laya 0.081 · Jev 0.246</div>
          <div className="text-xs text-gray-500 mt-1">as published by Laya's author; lower is better</div>
        </div>
      </div>
    </div>
  );
}

/* ---- latency ------------------------------------------------------------ */
function Latency() {
  const rows = [
    { t: "Laya — 1 question", ms: 32.8, tone: "bg-emerald-500/70" },
    { t: "Laya — 10 questions, batched", ms: 72.3, tone: "bg-emerald-500/50" },
    { t: "Jev — 1 question", ms: 256, tone: "bg-rose-500/60" },
    { t: "Jev — 10 questions, serial", ms: 1500, tone: "bg-rose-500/45" },
  ];
  const max = 1500;
  return (
    <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-5 sm:p-6">
      <div className="space-y-3">
        {rows.map((r) => (
          <div key={r.t}>
            <div className="flex justify-between text-sm mb-1">
              <span className="text-gray-300">{r.t}</span>
              <span className="font-mono text-gray-400">{r.ms} ms</span>
            </div>
            <div className="h-5 rounded bg-black/40 border border-white/5 overflow-hidden">
              <motion.div
                className={`h-full ${r.tone}`}
                initial={{ width: 0 }}
                whileInView={{ width: `${Math.max(1.5, (r.ms / max) * 100)}%` }}
                viewport={{ once: true }}
                transition={{ duration: 0.6 }}
              />
            </div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 mt-4 leading-relaxed">
        Median latencies as reported in the Laya comparison: Laya on a single NVIDIA T4, Jev through its hosted API
        (reported as 236–276 ms per question). Jev is a network call and Laya is local, so this is partly a comparison
        of deployment models, not only of the models themselves.
      </p>
    </div>
  );
}

export default function GenAiDecisionModels() {
  const toc = [
    { label: "Decisions, Not Text", hash: "what" },
    { label: "Two Ways to Answer", hash: "two-ways" },
    { label: "The Three Primitives", hash: "primitives" },
    { label: "How Laya Works", hash: "how" },
    { label: "Calibration", hash: "calibration" },
    { label: "Jev and Laya", hash: "compare" },
    { label: "Latency", hash: "latency" },
    { label: "In Code", hash: "code" },
    { label: "Limits", hash: "limits" },
    { label: "When to Use One", hash: "when" },
  ];

  return (
    <GuideLayout
      title="Decision Models — Jev and Laya"
      intro="A new kind of model that never writes text. You give it the possible answers; it picks one in a single forward pass and tells you how sure it is."
      toc={toc}
    >
      <section id="what" className="mb-14 scroll-mt-24">
        <div className="p-6 rounded-2xl border border-emerald-500/30 bg-gradient-to-br from-emerald-500/[0.12] to-transparent mb-6">
          <div className="text-xs uppercase tracking-wider text-emerald-400 mb-2">Decisions, not text</div>
          <p className="text-lg text-gray-100 leading-relaxed m-0">
            Most of what production systems ask an LLM is not open-ended at all: <em>which department</em>,{" "}
            <em>how urgent</em>, <em>is this spam</em>. A decision model is built only for that. It returns a{" "}
            <strong className="text-white">typed value from a set you define, with a calibrated probability</strong>{" "}
            — and it cannot return anything else.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/[0.07]">
            <div className="font-bold text-rose-300 mb-2">Jev — closed</div>
            <p className="text-sm text-gray-300 leading-relaxed m-0">
              From TypeSafe AI, a startup founded in 2024 by Diogo Almeida, Erik Gafni and Sasha Sheng. Released 15
              September 2026 in limited early access, as a proprietary hosted API. Named after the economist William
              Stanley Jevons.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.07]">
            <div className="font-bold text-emerald-300 mb-2">Laya — open</div>
            <p className="text-sm text-gray-300 leading-relaxed m-0">
              From Nandakishor Mukkunnoth at Convai Innovations. Open weights under Apache 2.0, runs locally, same
              three question types. Its author claims priority, citing a March 2025 arXiv paper.
            </p>
          </div>
        </div>
        <p className="text-sm text-gray-500 mt-4 leading-relaxed">
          "Jeev" is sometimes written for Jev. They are the same idea, one closed and one open, and the comparison
          between them is the clearest way to understand both.
        </p>
      </section>

      <section id="two-ways" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Two Ways to Answer the Same Question</h2>
        <TwoWays />
      </section>

      <section id="primitives" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Three Primitives</h2>
        <p className="text-base text-gray-300 leading-relaxed max-w-3xl mb-5">
          Both Jev and Laya expose exactly three question types. Everything you ask has to fit one of them — that
          constraint is the source of both the speed and the reliability.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ["choice", "Pick one option from a set you define.", "department → billing · technical · sales · other", "border-indigo-500/30 bg-indigo-500/[0.08]", "text-indigo-300"],
            ["score", "Place the input on an ordered scale.", "urgency → not urgent < soon < critical", "border-amber-500/30 bg-amber-500/[0.08]", "text-amber-300"],
            ["noul", "A yes/no question, answered as a probability from 0 to 1.", "churn_risk → P(true) = 0.91", "border-emerald-500/30 bg-emerald-500/[0.08]", "text-emerald-300"],
          ].map(([n, d, ex, box, tone]) => (
            <div key={n} className={`p-5 rounded-xl border ${box}`}>
              <div className={`font-mono font-bold text-lg mb-1.5 ${tone}`}>{n}</div>
              <p className="text-sm text-gray-200 leading-relaxed mb-3">{d}</p>
              <div className="text-xs font-mono text-gray-500">{ex}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="how" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">How Laya Works</h2>
        <p className="text-base text-gray-300 leading-relaxed max-w-3xl mb-5">
          Laya is published openly, so its mechanism is known. Jev's architecture has not been disclosed; TypeSafe
          says only that it is transformer-based and trained on synthetic data.
        </p>
        <div className="space-y-3 mb-5">
          {[
            ["An encoder, not a decoder", "Laya is a bidirectional encoder — the ModernBERT-large backbone, 421M parameters, for the English checkpoint; a 322M mmBERT-based model for 100+ languages. It reads the whole input at once rather than left to right."],
            ["One [MASK] slot per option", "Each answer option gets its own mask token in the input. The model reads the hidden state at each of those positions and produces one score per option."],
            ["Softmax over your options only", "Those scores are normalised across the options you supplied, never the whole vocabulary. So the answer is always one of them — an off-schema reply is impossible by construction."],
            ["Trained for honest probabilities", "Both Jev and Laya describe training with RLCD — reinforcement learning against strictly proper scoring rules, which reward a model for stating the probability it actually believes."],
          ].map(([t, d], i) => (
            <div key={t} className="flex gap-4 p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-emerald-500/15 border border-emerald-500/30 text-emerald-300 font-bold flex items-center justify-center text-sm">
                {i + 1}
              </div>
              <div>
                <div className="text-base font-semibold text-white mb-1">{t}</div>
                <p className="text-sm text-gray-400 leading-relaxed m-0">{d}</p>
              </div>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            This is an old idea returning. Before generative models took over, classification was done by encoders
            like BERT. What is new is the interface — any set of options, supplied at request time, rather than a
            classifier trained for one fixed label set — and the emphasis on calibrated confidence.
          </p>
        </div>
      </section>

      <section id="calibration" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Calibration</h2>
        <p className="text-base text-gray-300 leading-relaxed max-w-3xl mb-5">
          A probability is only useful if it means what it says. If you route every ticket above 90% confidence
          automatically and send the rest to a human, that threshold only works when "90%" really is right nine times
          in ten.
        </p>
        <Calibration />
      </section>

      <section id="compare" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Jev and Laya, Side by Side</h2>
        <div className="overflow-x-auto rounded-xl border border-white/10 mb-4">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-left">
                <th className="px-4 py-3 font-semibold text-white"> </th>
                <th className="px-4 py-3 font-semibold text-rose-300">Jev</th>
                <th className="px-4 py-3 font-semibold text-emerald-300">Laya</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                ["Maker", "TypeSafe AI", "Convai Innovations"],
                ["Licence", "Proprietary API", "Apache 2.0, open weights"],
                ["Released", "15 Sep 2026, limited early access", "Open release; paper claimed from Mar 2025"],
                ["Architecture", "Not disclosed", "Bidirectional encoder, 421M / 322M"],
                ["Cost", "$0.042 per M input tokens", "Self-hosted — your own hardware"],
                ["typed-decisions accuracy", "0.727", "0.766 (fine-tuned checkpoint)"],
                ["AG News (4 labels)", "0.910", "0.950"],
                ["DAIR Emotion (6 labels)", "0.480", "0.595"],
                ["Banking77 (77 labels)", "0.870", "0.425"],
                ["Calibration error (ECE)", "0.246", "0.081"],
              ].map(([k, a, b]) => (
                <tr key={k} className="border-t border-white/10">
                  <td className="px-4 py-3 text-sm font-semibold text-gray-400 whitespace-nowrap">{k}</td>
                  <td className="px-4 py-3 text-sm">{a}</td>
                  <td className="px-4 py-3 text-sm">{b}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>Read these numbers with care.</strong> They come from write-ups published in support of Laya, not
            from an independent evaluation. Laya's accuracy figure is for its fine-tuned checkpoint, whose base model
            scores 0.362 zero-shot. And the comparison is not one-sided: on Banking77, with 77 possible answers, Jev
            wins decisively — 0.870 against 0.425 — which lines up with Laya's own warning that its accuracy drops as
            the number of options grows.
          </p>
        </div>
      </section>

      <section id="latency" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Latency</h2>
        <Latency />
      </section>

      <section id="code" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">In Code</h2>
        <p className="text-base text-gray-400 leading-relaxed max-w-3xl mb-4">
          Laya's actual interface, from its README. Questions are a dictionary; each declares its type and its
          criteria.
        </p>
        <CodeBlock
          language="python"
          code={`# pip install laya        (Python 3.10+)
import laya

agent = laya.load("convaiinnovations/laya")              # English, 421M
# laya.load("convaiinnovations/laya", subfolder="multilingual")      # 100+ languages
# laya.load("convaiinnovations/laya", subfolder="typed-decisions")   # fine-tuned

state = {
    "from": "user@acme.com",
    "subject": "Duplicate charge on invoice #4411",
    "body": "Hi, we were billed twice for March. Please refund the duplicate "
            "today or we will cancel our plan.",
}

questions = {
    "department": {                     # choice: criteria is a dict of options
        "type": "choice",
        "instructions": "Which department should handle this request?",
        "criteria": {
            "billing": "invoices, payments, refunds",
            "technical": "bugs, outages, system errors",
            "sales": "pricing, new contracts",
            "other": "everything else",
        },
    },
    "urgency": {                        # score: criteria is an ordered list
        "type": "score",
        "instructions": "How urgent is this request?",
        "criteria": ["not urgent", "soon", "critical deadline or blocking issue"],
    },
    "churn_risk": {                     # noul: yes/no, returns P(true)
        "type": "noul",
        "instructions": "Does the user threaten to cancel or leave?",
    },
}

answers = agent.predict(state, questions)
print(answers["department"]["choice"])
print(answers["urgency"]["score"])
print(answers["churn_risk"]["noul"])

# Many inputs at once — this is where the per-question cost collapses.
results = agent.predict_batch([{"body": t} for t in tickets], questions, batch_size=64)

# Or let the router pick the right checkpoint (e.g. by language) per request.
from laya import Router
router = Router()
res = router.predict(state, questions)`}
        />
      </section>

      <section id="limits" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Limits</h2>
        <p className="text-base text-gray-300 leading-relaxed max-w-3xl mb-5">
          Laya's own documentation is candid about these, which is to its credit.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ["Fine-tune before production", "The base checkpoints are near chance on typed decisions zero-shot — 0.362 against a random baseline of 0.318. The strong numbers need the fine-tuned checkpoint or your own fine-tune."],
            ["Many options degrade it", "Accuracy falls as the option count grows; the README recommends shortlisting for questions with 50+ options. That is the Banking77 result above."],
            ["Script coverage", "The English checkpoint collapses outside Latin scripts. Use the multilingual one, which has its own position bias on score questions."],
            ["Labels can leak", "A noul question can follow its option labels rather than the input, most strongly on the base English model. Word the labels neutrally."],
          ].map(([t, d]) => (
            <div key={t} className="p-5 rounded-xl border border-rose-500/20 bg-rose-500/[0.05]">
              <div className="text-base font-semibold text-rose-300 mb-1.5">{t}</div>
              <p className="text-sm text-gray-400 leading-relaxed m-0">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="when" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">When to Use One</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">A decision model fits</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Routing, triage, tagging and moderation at high volume.</li>
              <li>Any step where you currently parse an LLM's JSON answer.</li>
              <li>Thresholds that need an honest probability behind them.</li>
              <li>Guard checks inside an agent loop, where latency compounds.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Use an LLM instead</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>The answer is open-ended text.</li>
              <li>The options are not known in advance.</li>
              <li>The decision needs multi-step reasoning or tool use.</li>
              <li>You need an explanation, not just a label.</li>
            </ul>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            The pattern that works: an LLM plans and writes, and a decision model makes the dozens of small, typed
            calls in between. Related reading:{" "}
            <a href="#/efficiency" className="text-blue-400 hover:underline">Efficient Inference</a> for why fewer
            generated tokens matters,{" "}
            <a href="#/genai/distillation" className="text-blue-400 hover:underline">Distillation</a>, and{" "}
            <a href="#/rag/evaluation" className="text-blue-400 hover:underline">Evaluation</a>, where calibrated
            judges earn their keep.
          </p>
        </div>
      </section>
    </GuideLayout>
  );
}

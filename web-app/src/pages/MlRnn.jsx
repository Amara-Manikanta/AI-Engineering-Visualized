import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import CodeBlock from "../components/CodeBlock";

/* --------------------------------------------------------------------------
   Vanishing gradients are not a metaphor. Backpropagating through t steps
   multiplies the recurrent weight t times, so the gradient scales as w^t.
   The panel below computes that product exactly.
-------------------------------------------------------------------------- */

function GradientDecay() {
  const [w, setW] = useState(0.6);
  const [steps, setSteps] = useState(30);

  const series = useMemo(
    () => Array.from({ length: steps }, (_, i) => ({ t: i + 1, g: Math.pow(w, i + 1) })),
    [w, steps]
  );

  const final = series[series.length - 1].g;
  // How many steps before the gradient falls below 1e-3 of its start.
  const halfLife = w < 1 && w > 0 ? Math.ceil(Math.log(1e-3) / Math.log(w)) : Infinity;

  const W = 520;
  const H = 170;
  const PAD = 40;
  const px = (t) => PAD + ((t - 1) / Math.max(1, steps - 1)) * (W - PAD * 2);
  // Log scale so both explosion and vanishing are visible at once.
  const lo = -8;
  const hi = 8;
  const py = (g) => {
    const l = Math.log10(Math.max(g, 1e-30));
    const cl = Math.min(hi, Math.max(lo, l));
    return H - PAD - ((cl - lo) / (hi - lo)) * (H - PAD * 1.4);
  };

  const path = series.map((s, i) => `${i ? "L" : "M"}${px(s.t)},${py(s.g)}`).join(" ");

  const regime = w > 1.02 ? "explode" : w < 0.98 ? "vanish" : "stable";
  const regimeCopy = {
    explode: {
      tone: "text-rose-400",
      text: "Gradients explode. Training diverges into NaNs within a few batches unless you clip the gradient norm.",
    },
    vanish: {
      tone: "text-amber-400",
      text: "Gradients vanish. The early timesteps receive essentially no learning signal, so the network cannot learn long-range dependencies at all.",
    },
    stable: {
      tone: "text-emerald-400",
      text: "The knife edge. Signal is preserved, but this is a measure-zero setting that no optimiser will hold for you.",
    },
  }[regime];

  return (
    <div className="rounded-2xl border border-rose-500/25 bg-rose-500/[0.07] p-6">
      <h3 className="text-rose-400 font-bold mb-1">Why plain RNNs forget — the actual arithmetic</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        Backpropagating an error from step t back to step 1 multiplies by the recurrent weight once per step. The
        gradient reaching the first token is proportional to{" "}
        <span className="font-mono text-rose-300">w<sup>t</sup></span>. Anything other than exactly 1 goes to zero or
        to infinity, and it does so exponentially.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Recurrent weight w</span>
          <input
            type="range"
            min="0.3"
            max="1.6"
            step="0.01"
            value={w}
            onChange={(e) => setW(Number(e.target.value))}
            className="w-full mt-2 accent-rose-500"
          />
          <span className="font-mono text-rose-300 text-sm">{w.toFixed(2)}</span>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Sequence length</span>
          <input
            type="range"
            min="5"
            max="80"
            step="1"
            value={steps}
            onChange={(e) => setSteps(Number(e.target.value))}
            className="w-full mt-2 accent-rose-500"
          />
          <span className="font-mono text-rose-300 text-sm">{steps}</span>
        </label>
      </div>

      <div className="rounded-xl bg-black/50 border border-white/10 p-3 mb-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          {[4, 0, -4, -8].map((e) => (
            <g key={e}>
              <line
                x1={PAD}
                y1={py(Math.pow(10, e))}
                x2={W - PAD}
                y2={py(Math.pow(10, e))}
                stroke={e === 0 ? "rgba(255,255,255,0.22)" : "rgba(255,255,255,0.07)"}
                strokeWidth="1"
                strokeDasharray="4 4"
              />
              <text x={PAD - 6} y={py(Math.pow(10, e)) + 4} fill="#6b7280" fontSize="9" textAnchor="end" fontFamily="monospace">
                {e === 0 ? "1" : `1e${e}`}
              </text>
            </g>
          ))}
          <path d={path} fill="none" stroke={regime === "explode" ? "#f87171" : "#fbbf24"} strokeWidth="2.5" />
          <text x={W - PAD} y={H - 8} fill="#6b7280" fontSize="10" textAnchor="end" fontFamily="monospace">
            timesteps back →
          </text>
        </svg>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">
            Gradient reaching step 1 (of {steps})
          </div>
          <div className="text-2xl font-bold font-mono text-rose-300">
            {final < 1e-4 || final > 1e4 ? final.toExponential(2) : final.toFixed(4)}
          </div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Steps until signal &lt; 0.001</div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {Number.isFinite(halfLife) && halfLife > 0 ? halfLife : "—"}
          </div>
        </div>
      </div>

      <p className={`text-sm leading-relaxed m-0 ${regimeCopy.tone}`}>{regimeCopy.text}</p>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Unrolling: step through a sequence and watch the hidden state carry forward.
-------------------------------------------------------------------------- */

const TOKENS = ["The", "cat", "that", "chased", "the", "mouse", "was", "___"];

function Unroller() {
  const [t, setT] = useState(3);

  return (
    <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.07] p-6">
      <h3 className="text-indigo-400 font-bold mb-1">Unrolling the loop</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        An RNN is one cell applied repeatedly, with its own output fed back in. Drawn flat across time it looks like a
        deep network — and that is exactly the problem, because it is as deep as the sequence is long.
      </p>

      <div className="flex flex-wrap gap-2 mb-5 justify-center">
        {TOKENS.map((tok, i) => (
          <div key={i} className="flex flex-col items-center gap-1.5">
            <div
              className={`px-3 py-2 rounded-lg text-xs font-mono border transition-colors ${
                i <= t
                  ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-100"
                  : "border-white/10 bg-white/5 text-gray-600"
              }`}
            >
              {tok}
            </div>
            <div className="text-[0.5625rem] text-gray-600 font-mono">x{i}</div>
            <div
              className={`w-8 h-8 rounded-full border flex items-center justify-center text-[0.5625rem] font-mono transition-colors ${
                i <= t ? "border-emerald-500/50 bg-emerald-500/15 text-emerald-300" : "border-white/10 text-gray-700"
              }`}
            >
              h{i}
            </div>
          </div>
        ))}
      </div>

      <input
        type="range"
        min="0"
        max={TOKENS.length - 1}
        step="1"
        value={t}
        onChange={(e) => setT(Number(e.target.value))}
        className="w-full accent-indigo-500 mb-4"
      />

      <div className="p-4 rounded-xl bg-black/40 border border-white/10">
        <div className="font-mono text-sm text-indigo-200 mb-2">
          h{t} = tanh(W<sub>h</sub>·h{t === 0 ? "₋₁" : t - 1} + W<sub>x</sub>·x{t} + b)
        </div>
        <p className="text-xs text-gray-400 leading-relaxed m-0">
          {t < TOKENS.length - 1
            ? `Everything the model knows about tokens 0 through ${t} has to fit inside the single vector h${t}. There is no other channel.`
            : "To fill this blank correctly the model must recall that the subject was singular — six tokens back, through six multiplications by Wₕ."}
        </p>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const GATES = [
  {
    n: "Forget gate",
    f: "f = σ(W_f·[h, x] + b_f)",
    d: "Decides what fraction of the existing cell state to keep. Output near 1 preserves a memory indefinitely; near 0 erases it.",
    box: "border-rose-500/25 bg-rose-500/[0.07]",
    label: "text-rose-400",
  },
  {
    n: "Input gate",
    f: "i = σ(W_i·[h, x] + b_i)",
    d: "Decides how much of the newly computed candidate state to write in. This is how the cell admits new information selectively.",
    box: "border-emerald-500/25 bg-emerald-500/[0.07]",
    label: "text-emerald-400",
  },
  {
    n: "Output gate",
    f: "o = σ(W_o·[h, x] + b_o)",
    d: "Decides what part of the cell state to expose as this step's hidden output. The cell can hold something it is not currently reporting.",
    box: "border-indigo-500/25 bg-indigo-500/[0.07]",
    label: "text-indigo-400",
  },
];

export default function MlRnn() {
  const toc = [
    { label: "Sequences Need Memory", hash: "why" },
    { label: "Unrolling", hash: "unroll" },
    { label: "The Vanishing Gradient", hash: "vanishing" },
    { label: "How LSTM Fixes It", hash: "lstm" },
    { label: "The Three Gates", hash: "gates" },
    { label: "GRU", hash: "gru" },
    { label: "In Code", hash: "code" },
    { label: "Superseded, Not Obsolete", hash: "now" },
  ];

  return (
    <GuideLayout
      title="RNNs & LSTMs"
      intro="How networks handled sequences before attention — and the specific arithmetic failure that made attention necessary."
      toc={toc}
    >
      <section id="why" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Sequences Need Memory</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          A feed-forward network maps one fixed-size input to one output. Sequences break both halves of that: they
          vary in length, and the meaning of an element depends on what came before it. "Bank" in a sentence about
          rivers is not the same word as "bank" in a sentence about loans.
        </p>
        <p className="text-gray-300 leading-relaxed max-w-3xl">
          The recurrent answer is to keep a hidden state vector that is updated once per element and passed forward.
          The network sees one token at a time, but the state is a running summary of everything before it.
        </p>
      </section>

      <section id="unroll" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Unrolling</h2>
        <Unroller />
        <div className="mt-5 p-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>Two costs follow from this picture.</strong> Step t cannot be computed until step t−1 is done, so
            training does not parallelise across the sequence — the objection that transformers answered. And the
            whole history must be compressed into one fixed-size vector, which becomes a bottleneck long before the
            sequence gets interesting.
          </p>
        </div>
      </section>

      <section id="vanishing" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Vanishing Gradient</h2>
        <GradientDecay />
        <p className="text-gray-300 leading-relaxed max-w-3xl mt-5">
          Gradient clipping caps the exploding case cheaply and is standard practice. Vanishing has no such fix — you
          cannot amplify a signal that has already been multiplied down to nothing. It needs an architectural answer.
        </p>
      </section>

      <section id="lstm" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">How LSTM Fixes It</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          The LSTM adds a second state alongside the hidden state: the <strong className="text-white">cell state</strong>.
          Crucially, the cell state is updated by addition and elementwise gating rather than by a matrix multiply.
        </p>
        <div className="p-5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07] mb-5">
          <div className="font-mono text-sm text-emerald-200 mb-3">c_t = f_t ⊙ c_(t−1) + i_t ⊙ c̃_t</div>
          <p className="text-sm text-gray-300 leading-relaxed m-0">
            Read the first term carefully. The path from <span className="font-mono">c_(t−1)</span> to{" "}
            <span className="font-mono">c_t</span> is a multiplication by the forget gate and nothing else. If the
            network learns to set that gate near 1, the gradient flows backwards through that step almost unchanged —
            a highway through time instead of a repeated matrix multiply. This is the same trick as a residual
            connection, five years earlier.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-xl border border-rose-500/25 bg-rose-500/[0.07]">
            <div className="font-semibold text-rose-400 mb-2">Vanilla RNN</div>
            <p className="text-xs text-gray-300 leading-relaxed m-0">
              State is overwritten every step: <span className="font-mono">h_t = tanh(W·[h_(t−1), x_t])</span>.
              Gradient is multiplied by W each step. Useful memory spans roughly 10 tokens.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07]">
            <div className="font-semibold text-emerald-400 mb-2">LSTM</div>
            <p className="text-xs text-gray-300 leading-relaxed m-0">
              State is edited, not overwritten. Gradient is multiplied by a learned gate the network can push toward
              1. Useful memory spans hundreds of tokens.
            </p>
          </div>
        </div>
      </section>

      <section id="gates" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Three Gates</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Each gate is a sigmoid layer producing values in [0, 1], one per dimension of the state, used as a
          multiplier. Nothing about them is hand-designed — they are learned like every other weight.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {GATES.map((g) => (
            <div key={g.n} className={`p-5 rounded-xl border ${g.box}`}>
              <div className={`font-semibold mb-1 ${g.label}`}>{g.n}</div>
              <div className="text-[0.6875rem] font-mono text-gray-500 mb-2.5">{g.f}</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{g.d}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            One practical detail with outsized effect: initialise the forget-gate bias to a positive value, commonly
            1.0. That starts the gate open, so the cell defaults to remembering and has to learn to forget, rather
            than the other way round. It measurably improves convergence on long sequences.
          </p>
        </div>
      </section>

      <section id="gru" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">GRU — the Simpler Cousin</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          The gated recurrent unit merges the forget and input gates into one update gate and drops the separate cell
          state. Roughly 25% fewer parameters and faster per step.
        </p>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            Empirically the two perform about the same on most tasks, with LSTM holding a small edge on the longest
            sequences. The sensible rule: start with a GRU because it trains faster, and switch to an LSTM only if you
            measure a difference on your data.
          </p>
        </div>
      </section>

      <section id="code" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">In Code</h2>
        <CodeBlock
          language="python"
          code={`import torch
import torch.nn as nn

class SequenceClassifier(nn.Module):
    def __init__(self, vocab, emb=128, hidden=256, n_classes=2):
        super().__init__()
        self.embed = nn.Embedding(vocab, emb, padding_idx=0)
        self.lstm = nn.LSTM(
            emb, hidden,
            num_layers=2,
            batch_first=True,
            bidirectional=True,   # both directions; doubles the output width
            dropout=0.3,
        )
        self.head = nn.Linear(hidden * 2, n_classes)

    def forward(self, x, lengths):
        e = self.embed(x)
        # Packing stops the LSTM from consuming padding as if it were data.
        packed = nn.utils.rnn.pack_padded_sequence(
            e, lengths.cpu(), batch_first=True, enforce_sorted=False
        )
        _, (h, _) = self.lstm(packed)
        # Last layer's forward and backward final states, concatenated.
        final = torch.cat([h[-2], h[-1]], dim=1)
        return self.head(final)

# Always clip. This is the cheap half of the gradient problem.
torch.nn.utils.clip_grad_norm_(model.parameters(), max_norm=1.0)`}
        />
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          Forgetting to pack a padded batch is the most common silent bug here. The model still trains, just on
          sequences whose final hidden state summarises a run of zeros.
        </p>
      </section>

      <section id="now" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Superseded, Not Obsolete</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          Attention replaced recurrence for language because it removed both costs at once: every position can attend
          to every other in one parallel operation, and there is no fixed-size bottleneck. That is why{" "}
          <a href="#/ml/transformers" className="text-blue-400 hover:underline">transformers</a> won.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Recurrence still earns its place</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Streaming inference with constant memory per step.</li>
              <li>Long numeric time series where quadratic attention is unaffordable.</li>
              <li>Small on-device models with tight latency budgets.</li>
              <li>State-space models — Mamba and kin — are recurrence rebuilt for modern hardware.</li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h4 className="text-gray-200 font-semibold mb-2">Worth learning because</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>The vanishing-gradient argument explains residual connections too.</li>
              <li>Gating reappears everywhere, including in transformer variants.</li>
              <li>Encoder–decoder and attention were both invented here first.</li>
              <li>Plenty of production systems still run LSTMs today.</li>
            </ul>
          </div>
        </div>
      </section>
      <KnowledgeCheck questions={questionsFor("dl-rnn")} />
    </GuideLayout>
  );
}

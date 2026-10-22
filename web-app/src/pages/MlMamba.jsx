import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";

/* --------------------------------------------------------------------------
   Mamba is a recurrence, and a recurrence is something you can just run.
   Every panel below executes the actual state-space update on a real
   sequence — no illustrations of what the maths would do.

   Continuous:   h'(t) = A h(t) + B x(t),   y(t) = C h(t)
   Discretised:  Ā = exp(ΔA),  B̄ ≈ ΔB      (zero-order hold)
                 h_t = Ā h_(t-1) + B̄ x_t,  y_t = C h_t
-------------------------------------------------------------------------- */

const SEQ_LEN = 40;

/** An input with one sharp spike, so memory decay is visible in the output. */
const IMPULSE = Array.from({ length: SEQ_LEN }, (_, i) => (i === 6 ? 1 : 0));

function runSSM(x, { A, delta, B = 1, C = 1 }) {
  const Abar = Math.exp(delta * A); // A is negative, so this lands in (0, 1)
  const Bbar = delta * B;
  let h = 0;
  const hs = [];
  const ys = [];
  for (let t = 0; t < x.length; t++) {
    h = Abar * h + Bbar * x[t];
    hs.push(h);
    ys.push(C * h);
  }
  return { hs, ys, Abar, Bbar };
}

const W = 560;
const H = 150;
const PAD = 40;

function Trace({ values, color, label, zeroLine = false }) {
  const max = Math.max(1e-9, ...values.map(Math.abs));
  const px = (i) => PAD + (i / (values.length - 1)) * (W - PAD * 2);
  const py = (v) => H - PAD - (v / max) * (H - PAD * 1.5) * (zeroLine ? 0.5 : 1) - (zeroLine ? (H - PAD * 1.5) * 0.5 : 0);
  const d = values.map((v, i) => `${i ? "L" : "M"}${px(i)},${py(v)}`).join(" ");
  return (
    <div className="rounded-xl bg-black/50 border border-white/10 p-2 mb-2">
      <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 px-2 pt-1">{label}</div>
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
        <line x1={PAD} y1={py(0)} x2={W - PAD} y2={py(0)} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
        <path d={d} fill="none" stroke={color} strokeWidth="2.2" />
        {values.map((v, i) => (
          <circle key={i} cx={px(i)} cy={py(v)} r="2.4" fill={color} opacity="0.85" />
        ))}
        <text x={W - PAD} y={H - 8} fill="#6b7280" fontSize="10" textAnchor="end" fontFamily="monospace">
          timestep →
        </text>
      </svg>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

function RecurrencePanel() {
  const [A, setA] = useState(-0.5);
  const [delta, setDelta] = useState(1.0);

  const { hs, ys, Abar } = useMemo(() => runSSM(IMPULSE, { A, delta }), [A, delta]);

  // How many steps before the spike has decayed to 1% of its peak.
  const halfLife = Abar > 0 && Abar < 1 ? Math.log(0.01) / Math.log(Abar) : Infinity;
  const peak = Math.max(...ys);
  const atEnd = ys[ys.length - 1];

  return (
    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] p-6">
      <h3 className="text-emerald-400 font-bold mb-1">The recurrence, actually running</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        A single spike goes in at step 6. The state absorbs it, then leaks it away at a rate set by{" "}
        <span className="font-mono text-emerald-300">Ā = exp(ΔA)</span>. That decay rate <em>is</em> the model's
        memory — how long a token keeps influencing the output.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">A — continuous decay rate</span>
          <input
            type="range"
            min="-2"
            max="-0.02"
            step="0.01"
            value={A}
            onChange={(e) => setA(Number(e.target.value))}
            className="w-full mt-2 accent-emerald-500"
          />
          <span className="font-mono text-emerald-300 text-sm">{A.toFixed(2)}</span>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Δ — step size</span>
          <input
            type="range"
            min="0.05"
            max="3"
            step="0.05"
            value={delta}
            onChange={(e) => setDelta(Number(e.target.value))}
            className="w-full mt-2 accent-emerald-500"
          />
          <span className="font-mono text-emerald-300 text-sm">{delta.toFixed(2)}</span>
        </label>
      </div>

      <Trace values={IMPULSE} color="#60a5fa" label="input x — one spike at t=6" />
      <Trace values={hs} color="#34d399" label="hidden state h — absorbs, then leaks" />

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
        <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/30">
          <div className="text-[0.625rem] uppercase tracking-wide text-emerald-400 mb-1">Ā = exp(ΔA)</div>
          <div className="text-2xl font-bold font-mono text-emerald-300">{Abar.toFixed(4)}</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">state kept per step</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Memory span</div>
          <div className="text-2xl font-bold font-mono text-gray-300">
            {Number.isFinite(halfLife) ? Math.round(halfLife) : "∞"}
          </div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">steps until 1% remains</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Still present at t=39</div>
          <div className="text-2xl font-bold font-mono text-amber-300">
            {peak > 0 ? ((atEnd / peak) * 100).toFixed(2) : "0.00"}%
          </div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">of the spike's peak</div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 leading-relaxed">
        Notice that Δ and A do the same job here — only their product matters. That is why Mamba makes Δ the
        input-dependent one and leaves A alone: one knob is enough, and Δ is the cheaper one to compute per token.
      </p>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Selectivity: the thing that makes Mamba "Mamba" rather than S4.
-------------------------------------------------------------------------- */

const TOKENS = [
  ["The", 0], ["password", 1], ["is", 0], ["hunter2", 1], [",", 0], ["and", 0],
  ["um", 0], ["you", 0], ["know", 0], ["like", 0], ["whatever", 0], ["anyway", 0],
  ["the", 0], ["password", 1], ["was", 0], ["what", 1], ["?", 0],
];

function SelectivityPanel() {
  const [selective, setSelective] = useState(true);

  // The claim being made is about ONE token's information surviving, so that
  // is what gets traced — not the total state, which filler also contributes to.
  const KEY_TOKEN = 3; // "hunter2"

  const result = useMemo(() => {
    const A = -1.0;
    // Non-selective: every token gets the same Δ. Selective: Δ depends on the
    // token, so unimportant tokens barely advance the state at all.
    const deltas = TOKENS.map(([, important]) => (selective ? (important ? 1.4 : 0.03) : 0.5));
    const xs = TOKENS.map(([, important]) => (important ? 1 : 0.15));

    const keeps = deltas.map((d) => Math.exp(d * A));

    // What "hunter2" wrote into the state, decayed forward by every later step.
    let carried = 0;
    const survives = [];
    for (let t = 0; t < TOKENS.length; t++) {
      carried = keeps[t] * carried;
      if (t === KEY_TOKEN) carried += deltas[t] * xs[t];
      survives.push(carried);
    }

    const written = survives[KEY_TOKEN] || 1e-9;
    const atQuestion = survives[survives.length - 1];
    return { deltas, keeps, survives, retained: atQuestion / written };
  }, [selective]);

  const maxH = Math.max(...result.survives, 1e-9);

  return (
    <div className="rounded-2xl border border-purple-500/25 bg-purple-500/[0.07] p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-1">
        <h3 className="text-purple-400 font-bold m-0">Selectivity — the actual contribution</h3>
        <div className="flex gap-2">
          {[
            [false, "Fixed Δ (S4)"],
            [true, "Input-dependent Δ (Mamba)"],
          ].map(([v, label]) => (
            <button
              key={label}
              onClick={() => setSelective(v)}
              className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
                selective === v
                  ? "border-purple-500/50 bg-purple-500/20 text-purple-200"
                  : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
              }`}
            >
              {label}
            </button>
          ))}
        </div>
      </div>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        Earlier state-space models used one fixed Δ for every token, so the state decayed at a constant rate whatever
        arrived. Mamba computes Δ from the token itself, so the model can hold its state still through noise and open
        the gate only when something matters. The bars trace one thing: how much of what{" "}
        <span className="font-mono text-purple-300">hunter2</span> wrote is still present at each later step.
      </p>

      <div className="space-y-1.5 mb-5">
        {TOKENS.map(([tok, important], i) => (
          <div key={i} className="flex items-center gap-2 text-xs">
            <span
              className={`w-20 shrink-0 text-right font-mono px-1.5 py-0.5 rounded ${
                important ? "text-purple-200 bg-purple-500/20" : "text-gray-500"
              }`}
            >
              {tok}
            </span>
            <span className="w-14 shrink-0 text-right font-mono text-[0.625rem] text-gray-600">
              Δ={result.deltas[i].toFixed(2)}
            </span>
            <span className="w-16 shrink-0 text-right font-mono text-[0.625rem] text-gray-600">
              keep {(result.keeps[i] * 100).toFixed(0)}%
            </span>
            <div className="flex-1 h-4 bg-black/40 rounded border border-white/5 overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-purple-600 to-purple-400 transition-all duration-200"
                style={{ width: `${Math.max((result.survives[i] / maxH) * 100, 0)}%` }}
              />
            </div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-black/40 border border-white/10 mb-4">
        <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">
          "hunter2" still in the state when the question arrives
        </div>
        <div className={`text-3xl font-bold font-mono ${selective ? "text-emerald-300" : "text-rose-300"}`}>
          {(result.retained * 100).toFixed(1)}%
        </div>
        <div className="text-[0.6875rem] text-gray-600 mt-1">of what that token originally wrote, 13 steps later</div>
      </div>

      <div
        className={`p-4 rounded-xl border ${
          selective ? "border-emerald-500/30 bg-emerald-500/[0.1]" : "border-rose-500/30 bg-rose-500/[0.1]"
        }`}
      >
        <p className={`text-sm leading-relaxed m-0 ${selective ? "text-emerald-200" : "text-rose-200"}`}>
          {selective ? (
            <>
              <strong>The filler costs almost nothing.</strong> Unimportant tokens get Δ ≈ 0.03, so the state keeps
              97% of itself and writes almost nothing new — roughly twenty times more of "hunter2" survives than
              under a fixed Δ. What still erodes it is the <em>other</em> important tokens later in the sentence,
              which open the gate wide and overwrite. That is the honest limitation of a fixed-size state:
              selectivity buys you the right to ignore noise, not unlimited memory.
            </>
          ) : (
            <>
              <strong>The filler washes the state out.</strong> Every token decays the state by the same 39%
              regardless of content, so thirteen steps of mostly filler leave a fraction of a percent of the
              password behind. This is the failure that selective SSMs were introduced to fix.
            </>
          )}
        </p>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Complexity: the argument for bothering with any of this.
-------------------------------------------------------------------------- */

function ComplexityPanel() {
  const [logN, setLogN] = useState(12); // 4096
  const n = Math.round(Math.pow(2, logN));
  const d = 4096;
  const stateN = 16;

  const attnOps = n * n * d;
  const ssmOps = n * d * stateN;
  const attnCacheGB = (2 * n * d * 32 * 2) / 1e9; // K+V, 32 layers, fp16
  const ssmStateMB = (d * stateN * 32 * 2) / 1e6; // constant in n

  return (
    <div className="rounded-2xl border border-amber-500/25 bg-amber-500/[0.07] p-6">
      <h3 className="text-amber-400 font-bold mb-1">Why anyone bothers</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        Attention compares every token with every other token, so work grows with the square of the sequence and the
        cache grows linearly forever. An SSM carries a fixed-size state, so both are flat in sequence length.
      </p>

      <label className="block mb-5">
        <span className="text-xs uppercase tracking-wide text-gray-500">Sequence length</span>
        <input
          type="range"
          min="8"
          max="20"
          step="1"
          value={logN}
          onChange={(e) => setLogN(Number(e.target.value))}
          className="w-full mt-2 accent-amber-500"
        />
        <span className="font-mono text-amber-300 text-sm">{n.toLocaleString()} tokens</span>
      </label>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
        <div className="p-5 rounded-xl border border-rose-500/25 bg-rose-500/[0.07]">
          <div className="font-semibold text-rose-400 mb-3">Transformer</div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Attention ops</span>
              <span className="font-mono text-rose-300">{attnOps.toExponential(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">KV cache</span>
              <span className="font-mono text-rose-300">{attnCacheGB.toFixed(2)} GB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Per-token cost</span>
              <span className="font-mono text-rose-300">grows with n</span>
            </div>
          </div>
        </div>
        <div className="p-5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07]">
          <div className="font-semibold text-emerald-400 mb-3">Mamba</div>
          <div className="space-y-2 text-xs">
            <div className="flex justify-between">
              <span className="text-gray-400">Scan ops</span>
              <span className="font-mono text-emerald-300">{ssmOps.toExponential(2)}</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Recurrent state</span>
              <span className="font-mono text-emerald-300">{ssmStateMB.toFixed(1)} MB</span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-400">Per-token cost</span>
              <span className="font-mono text-emerald-300">constant</span>
            </div>
          </div>
        </div>
      </div>

      <div className="mt-4 p-4 rounded-xl bg-black/40 border border-white/10">
        <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Ratio at this length</div>
        <div className="text-3xl font-bold font-mono text-amber-300">{(attnOps / ssmOps).toFixed(0)}×</div>
        <div className="text-[0.6875rem] text-gray-600 mt-1">
          more attention operations than scan operations, and the gap doubles every time you double the sequence
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 leading-relaxed">
        The KV cache figure assumes 32 layers at fp16 with the given model width, and ignores grouped-query attention,
        which cuts it substantially in real deployments. The shape of the comparison is what matters: one column grows
        with the sequence, the other does not.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export default function MlMamba() {
  const toc = [
    { label: "What Problem It Solves", hash: "problem" },
    { label: "State Space Models", hash: "ssm" },
    { label: "Run the Recurrence", hash: "run" },
    { label: "Discretisation", hash: "discrete" },
    { label: "Selectivity", hash: "selective" },
    { label: "The Parallel Scan", hash: "scan" },
    { label: "Complexity", hash: "complexity" },
    { label: "In Code", hash: "code" },
    { label: "Where It Stands", hash: "status" },
  ];

  return (
    <GuideLayout
      title="Mamba & State Space Models"
      intro="A recurrent architecture that trains in parallel like a transformer and runs in constant memory like an RNN. The first credible structural challenge to attention."
      toc={toc}
    >
      <section id="problem" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">What Problem It Solves</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          Attention's cost is quadratic in sequence length, and generation carries a KV cache that grows with every
          token emitted. Both are fine at 2,000 tokens and painful at 200,000. Recurrent models have the opposite
          profile — constant memory, linear time — but they could not be trained in parallel, which is why
          transformers won in the first place.
        </p>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Mamba's claim is that you can have both. It is a recurrence, so inference is constant-memory. And the
          recurrence is linear, which means the whole sequence can be computed with a parallel scan rather than one
          step at a time.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ["Transformer", "Parallel training, quadratic attention, cache grows with the sequence.", "border-rose-500/25 bg-rose-500/[0.07]", "text-rose-400"],
            ["RNN / LSTM", "Constant memory, but training is sequential and gradients vanish.", "border-amber-500/25 bg-amber-500/[0.07]", "text-amber-400"],
            ["Mamba", "Parallel training via scan, constant-memory inference, linear time.", "border-emerald-500/25 bg-emerald-500/[0.07]", "text-emerald-400"],
          ].map(([n, d, box, tone]) => (
            <div key={n} className={`p-5 rounded-xl border ${box}`}>
              <div className={`font-bold mb-1.5 ${tone}`}>{n}</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="ssm" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">State Space Models</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          The idea is borrowed from control theory, where it is about a century old. A system has a hidden state that
          evolves continuously, driven by an input, and you observe a projection of that state.
        </p>
        <div className="p-5 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.07] mb-5">
          <div className="font-mono text-base text-indigo-200 text-center mb-1">h′(t) = A·h(t) + B·x(t)</div>
          <div className="font-mono text-base text-indigo-200 text-center mb-4">y(t) = C·h(t)</div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-xs text-gray-300">
            <div>
              <div className="font-semibold text-white mb-1">A — how state evolves</div>
              Controls decay and therefore memory. Its eigenvalues must be negative or the state blows up.
            </div>
            <div>
              <div className="font-semibold text-white mb-1">B — how input enters</div>
              Projects the incoming token into state space.
            </div>
            <div>
              <div className="font-semibold text-white mb-1">C — how state is read</div>
              Projects state back out to produce the output at this step.
            </div>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            A is kept diagonal in practice. A dense state matrix would make the recurrence a matrix multiply per
            step; diagonal makes it an elementwise multiply, which is what keeps the whole thing affordable. The
            structured initialisation that makes a diagonal A remember anything useful over long ranges is called
            HiPPO, and it is the reason earlier attempts at this failed.
          </p>
        </div>
      </section>

      <section id="run" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Run the Recurrence</h2>
        <RecurrencePanel />
      </section>

      <section id="discrete" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Discretisation</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Language is a sequence of discrete tokens, not a continuous signal. Δ is the step size that converts the
          continuous system into a recurrence you can actually iterate — the same zero-order hold used in signal
          processing.
        </p>
        <div className="p-5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07] mb-5">
          <div className="font-mono text-sm text-emerald-200 text-center mb-3">
            Ā = exp(ΔA)&nbsp;&nbsp;&nbsp;&nbsp;B̄ = (ΔA)⁻¹(exp(ΔA) − I)·ΔB ≈ ΔB
          </div>
          <p className="text-sm text-gray-300 leading-relaxed m-0">
            Read Δ as "how much time this token represents". A large Δ means a big step: the state moves a lot and
            old information decays fast. A small Δ means the system barely advances, so the state is preserved almost
            intact. That interpretation is exactly what selectivity exploits.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm font-semibold text-white mb-2">Large Δ — advance</div>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              Ā shrinks toward zero, so the previous state is largely discarded and the current input dominates. The
              model is paying attention to this token and forgetting older context.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm font-semibold text-white mb-2">Small Δ — hold</div>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              Ā approaches one, so the state passes through nearly unchanged and the input is barely written. The
              model is ignoring this token and preserving what it already knows.
            </p>
          </div>
        </div>
      </section>

      <section id="selective" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Selectivity</h2>
        <SelectivityPanel />
        <div className="mt-5 p-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>What this costs.</strong> Making Δ, B and C functions of the input breaks the property earlier
            SSMs relied on: with fixed matrices the whole sequence is a convolution, computable with an FFT. Once the
            parameters vary per token that shortcut is gone, and Mamba needs a hardware-aware parallel scan instead.
            That is the trade the paper is really about.
          </p>
        </div>
      </section>

      <section id="scan" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Parallel Scan</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          A recurrence looks inherently sequential. It is not, as long as the operation is associative. Computing a
          running total of a million numbers does not require a million sequential steps — you can do it in a tree of
          depth log n. The same trick applies here, because the linear recurrence composes.
        </p>
        <div className="p-5 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.07] mb-5">
          <div className="font-mono text-sm text-indigo-200 mb-3">
            (Ā₂, B̄₂x₂) ∘ (Ā₁, B̄₁x₁) = (Ā₂Ā₁, Ā₂B̄₁x₁ + B̄₂x₂)
          </div>
          <p className="text-sm text-gray-300 leading-relaxed m-0">
            Two consecutive steps compose into a single equivalent step. Because that composition is associative, the
            scan can be computed as a balanced tree: <span className="font-mono">O(n)</span> total work in{" "}
            <span className="font-mono">O(log n)</span> sequential depth. That is what lets a recurrent model saturate
            a GPU during training.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm font-semibold text-white mb-2">Training — parallel scan</div>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              The whole sequence is processed at once, like a transformer. Depth is logarithmic in sequence length,
              so the GPU stays busy.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm font-semibold text-white mb-2">Inference — plain recurrence</div>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              One token at a time, updating a fixed-size state. No cache to grow, no re-reading of history. Constant
              time and memory per token, regardless of how long the conversation is.
            </p>
          </div>
        </div>
        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            The other half of the engineering is keeping the expanded state in fast SRAM instead of writing it to
            GPU main memory. The state is larger than the input by the state-dimension factor, so materialising it
            would make the whole thing memory-bound. Fusing discretisation, scan and output into one kernel is what
            makes the measured speed match the theoretical complexity.
          </p>
        </div>
      </section>

      <section id="complexity" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Complexity</h2>
        <ComplexityPanel />
      </section>

      <section id="code" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">In Code</h2>
        <CodeBlock
          language="python"
          code={`import torch
import torch.nn as nn
import torch.nn.functional as F

class SelectiveSSM(nn.Module):
    """The core of a Mamba block, written for clarity rather than speed.

    The real implementation fuses all of this into one CUDA kernel and keeps
    the expanded state in SRAM; a loop like this is correct but memory-bound.
    """

    def __init__(self, d_model, d_state=16):
        super().__init__()
        self.d_state = d_state

        # A is NOT input-dependent. Stored as log(-A) so A stays negative,
        # which is what keeps the recurrence stable.
        A = torch.arange(1, d_state + 1).float().repeat(d_model, 1)
        self.A_log = nn.Parameter(torch.log(A))

        # B, C and Δ ARE input-dependent — this is what "selective" means.
        self.x_proj = nn.Linear(d_model, d_state * 2 + 1, bias=False)
        self.dt_proj = nn.Linear(1, d_model, bias=True)
        self.D = nn.Parameter(torch.ones(d_model))    # skip connection

    def forward(self, x):                  # x: (batch, seq, d_model)
        b, l, d = x.shape
        A = -torch.exp(self.A_log)         # (d_model, d_state), negative

        proj = self.x_proj(x)
        dt, B, C = proj.split([1, self.d_state, self.d_state], dim=-1)
        delta = F.softplus(self.dt_proj(dt))          # (b, l, d), > 0

        # Zero-order hold discretisation, per token.
        dA = torch.exp(delta.unsqueeze(-1) * A)       # (b, l, d, n)
        dB = delta.unsqueeze(-1) * B.unsqueeze(2)     # (b, l, d, n)

        h = torch.zeros(b, d, self.d_state, device=x.device)
        ys = []
        for t in range(l):                            # the parallel scan, unrolled
            h = dA[:, t] * h + dB[:, t] * x[:, t].unsqueeze(-1)
            ys.append((h * C[:, t].unsqueeze(1)).sum(-1))

        return torch.stack(ys, dim=1) + x * self.D`}
        />
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          The line that matters is <span className="font-mono text-gray-400">delta = softplus(...)</span>. Softplus
          keeps Δ positive, and because Δ comes from a projection of the token, every token sets its own decay rate.
          Delete that dependence and you are back to S4.
        </p>
      </section>

      <section id="status" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Where It Stands</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          Mamba matches transformers of similar size on language modelling while offering much better inference
          economics. It has not displaced them, and the reason is instructive: a fixed-size state is a lossy summary,
          and some tasks need exact recall of arbitrary earlier tokens, which attention gives for free.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Genuine strengths</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Constant memory per token during generation — no KV cache.</li>
              <li>Throughput several times higher at long sequence lengths.</li>
              <li>Scales to sequences where attention is simply unaffordable.</li>
              <li>Strong on genomics and audio, where sequences run to millions.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Real limitations</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Weaker at copying and exact retrieval from far back.</li>
              <li>In-context learning trails attention at comparable scale.</li>
              <li>A much smaller tooling and fine-tuning ecosystem.</li>
              <li>Custom kernels make it harder to deploy on varied hardware.</li>
            </ul>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            The direction the field actually took is hybrid: mostly Mamba layers with a few attention layers
            interleaved, which recovers the exact-recall behaviour at a fraction of the cost. Compare with{" "}
            <a href="#/ml/rwkv" className="text-blue-400 hover:underline">RWKV</a>, which reaches a similar place from
            the attention side, and with{" "}
            <a href="#/ml/transformers" className="text-blue-400 hover:underline">Transformers</a> for the baseline.
            The vanishing-gradient story behind all of this is on{" "}
            <a href="#/ml/rnn" className="text-blue-400 hover:underline">RNNs &amp; LSTMs</a>.
          </p>
        </div>
      </section>

      <KnowledgeCheck questions={questionsFor("arch-mamba")} />
    </GuideLayout>
  );
}

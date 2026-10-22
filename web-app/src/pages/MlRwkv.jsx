import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";

/* --------------------------------------------------------------------------
   RWKV's time-mixing is a weighted average over the past with exponential
   decay. That is a closed-form expression, so the page computes it.

                 Σ_{i<t} e^(-(t-1-i)w + k_i) · v_i  +  e^(u + k_t) · v_t
        wkv_t =  ───────────────────────────────────────────────────────
                 Σ_{i<t} e^(-(t-1-i)w + k_i)        +  e^(u + k_t)

   w is a per-channel decay (how fast the past fades), u is a bonus applied
   only to the current token. Everything below runs that formula.
-------------------------------------------------------------------------- */

const TOKENS = ["The", "capital", "of", "France", "is", "a", "city", "called", "___"];
// Toy key/value pairs: "France" and "capital" carry the signal.
const KEYS = [0.1, 1.6, 0.2, 2.2, 0.3, 0.1, 0.5, 0.4, 0.8];
const VALS = [0.1, 0.7, 0.1, 1.0, 0.2, 0.1, 0.3, 0.2, 0.0];

/** Weights each past position contributes to position t. Returns raw weights. */
function wkvWeights(t, w, u) {
  const raw = [];
  for (let i = 0; i <= t; i++) {
    if (i === t) raw.push(Math.exp(u + KEYS[i]));           // current token: bonus u
    else raw.push(Math.exp(-(t - 1 - i) * w + KEYS[i]));    // past: decays with distance
  }
  const sum = raw.reduce((a, b) => a + b, 0);
  return { raw, norm: raw.map((r) => r / sum), sum };
}

function WkvPanel() {
  const [w, setW] = useState(0.35);
  const [u, setU] = useState(0.5);
  const t = TOKENS.length - 1; // predicting the last position

  const { norm } = useMemo(() => wkvWeights(t, w, u), [w, u, t]);

  const out = useMemo(() => norm.reduce((a, p, i) => a + p * VALS[i], 0), [norm]);
  // How much total weight sits on the two informative tokens.
  const signal = norm[1] + norm[3];
  const maxW = Math.max(...norm);

  return (
    <div className="rounded-2xl border border-cyan-500/25 bg-cyan-500/[0.07] p-6">
      <h3 className="text-cyan-400 font-bold mb-1">The WKV operator, computed</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        This is RWKV's replacement for attention. Each past token gets a weight built from its own key and how far
        back it sits. There is no query, and no token-pair comparison — the position term is a fixed exponential
        decay, which is exactly why it can be folded into a recurrence.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">w — decay per step</span>
          <input
            type="range"
            min="0.02"
            max="2"
            step="0.01"
            value={w}
            onChange={(e) => setW(Number(e.target.value))}
            className="w-full mt-2 accent-cyan-500"
          />
          <span className="font-mono text-cyan-300 text-sm">{w.toFixed(2)}</span>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">u — bonus for the current token</span>
          <input
            type="range"
            min="-2"
            max="3"
            step="0.05"
            value={u}
            onChange={(e) => setU(Number(e.target.value))}
            className="w-full mt-2 accent-cyan-500"
          />
          <span className="font-mono text-cyan-300 text-sm">{u.toFixed(2)}</span>
        </label>
      </div>

      <div className="space-y-1.5 mb-5">
        {TOKENS.map((tok, i) => {
          const informative = i === 1 || i === 3;
          return (
            <div key={i} className="flex items-center gap-2 text-xs">
              <span
                className={`w-20 shrink-0 text-right font-mono px-1.5 py-0.5 rounded ${
                  i === t
                    ? "text-amber-200 bg-amber-500/20"
                    : informative
                    ? "text-cyan-200 bg-cyan-500/15"
                    : "text-gray-500"
                }`}
              >
                {tok}
              </span>
              <span className="w-20 shrink-0 text-right font-mono text-[0.625rem] text-gray-600">
                {i === t ? `u+k=${(u + KEYS[i]).toFixed(2)}` : `−${t - 1 - i}w+k`}
              </span>
              <div className="flex-1 h-5 bg-black/40 rounded border border-white/5 overflow-hidden">
                <div
                  className={`h-full transition-all duration-200 ${
                    i === t ? "bg-amber-500/70" : "bg-gradient-to-r from-cyan-600 to-cyan-400"
                  }`}
                  style={{ width: `${Math.max((norm[i] / maxW) * 100, 0.5)}%` }}
                />
              </div>
              <span className="w-14 shrink-0 text-right font-mono text-[0.625rem] text-gray-400">
                {(norm[i] * 100).toFixed(1)}%
              </span>
            </div>
          );
        })}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-black/40 border border-cyan-500/30">
          <div className="text-[0.625rem] uppercase tracking-wide text-cyan-400 mb-1">wkv output</div>
          <div className="text-2xl font-bold font-mono text-cyan-300">{out.toFixed(4)}</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">weighted average of v</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Weight on informative tokens</div>
          <div className="text-2xl font-bold font-mono text-emerald-400">{(signal * 100).toFixed(1)}%</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">"capital" + "France"</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Effective window</div>
          <div className="text-2xl font-bold font-mono text-gray-300">{Math.round(1 / w)}</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">≈ 1/w tokens before it fades</div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 leading-relaxed">
        Drag w low and the distribution flattens out across the whole history; drag it high and only the last couple
        of tokens matter. That single scalar is the entire positional mechanism. Real RWKV learns a separate w per
        channel, so different channels look back different distances at the same time.
      </p>
    </div>
  );
}

/* --------------------------------------------------------------------------
   The same result computed two ways: as a sum over history, and as a
   running state. Showing they agree is the whole point of the architecture.
-------------------------------------------------------------------------- */

function DualModePanel() {
  const [w, setW] = useState(0.35);
  const u = 0.5;

  const rows = useMemo(() => {
    // Parallel form: recompute the full weighted sum at each position.
    const parallel = TOKENS.map((_, t) => {
      const { norm } = wkvWeights(t, w, u);
      return norm.reduce((a, p, i) => a + p * VALS[i], 0);
    });

    // Recurrent form: two running accumulators, constant memory.
    // a holds the numerator, b the denominator, both decayed each step.
    let a = 0;
    let b = 0;
    const recurrent = [];
    for (let t = 0; t < TOKENS.length; t++) {
      const num = a + Math.exp(u + KEYS[t]) * VALS[t];
      const den = b + Math.exp(u + KEYS[t]);
      recurrent.push(num / den);
      // carry forward with decay, dropping the u bonus for the now-past token
      a = Math.exp(-w) * a + Math.exp(KEYS[t]) * VALS[t];
      b = Math.exp(-w) * b + Math.exp(KEYS[t]);
    }

    return TOKENS.map((tok, t) => ({
      tok,
      parallel: parallel[t],
      recurrent: recurrent[t],
      diff: Math.abs(parallel[t] - recurrent[t]),
    }));
  }, [w]);

  const maxDiff = Math.max(...rows.map((r) => r.diff));

  return (
    <div className="rounded-2xl border border-emerald-500/25 bg-emerald-500/[0.07] p-6">
      <h3 className="text-emerald-400 font-bold mb-1">One formula, two ways to evaluate it</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        The left column recomputes the full weighted sum over all history at every position — that is the training
        path, parallelisable across the sequence. The right column carries two running numbers forward — that is the
        inference path, constant memory. They compute the same thing.
      </p>

      <label className="block mb-5">
        <span className="text-xs uppercase tracking-wide text-gray-500">w — decay</span>
        <input
          type="range"
          min="0.02"
          max="2"
          step="0.01"
          value={w}
          onChange={(e) => setW(Number(e.target.value))}
          className="w-full mt-2 accent-emerald-500"
        />
        <span className="font-mono text-emerald-300 text-sm">{w.toFixed(2)}</span>
      </label>

      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-white/5 text-left">
              <th className="px-3 py-2.5 font-semibold text-white">Token</th>
              <th className="px-3 py-2.5 font-semibold text-blue-400">Parallel (sum over history)</th>
              <th className="px-3 py-2.5 font-semibold text-emerald-400">Recurrent (running state)</th>
              <th className="px-3 py-2.5 font-semibold text-gray-400">Difference</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {rows.map((r, i) => (
              <tr key={i} className="border-t border-white/10">
                <td className="px-3 py-2 font-mono text-gray-400">{r.tok}</td>
                <td className="px-3 py-2 font-mono text-blue-300">{r.parallel.toFixed(6)}</td>
                <td className="px-3 py-2 font-mono text-emerald-300">{r.recurrent.toFixed(6)}</td>
                <td className="px-3 py-2 font-mono text-gray-600">{r.diff.toExponential(1)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="mt-4 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/[0.1]">
        <p className="text-sm text-emerald-200 leading-relaxed m-0">
          <strong>Largest disagreement: {maxDiff.toExponential(1)}</strong> — floating-point noise. This equality is
          the architecture's entire selling point. Train with the parallel form and get transformer-like GPU
          utilisation; deploy with the recurrent form and get constant memory per token.
        </p>
      </div>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Multi-channel decay: why one scalar per channel is more expressive than
   it first appears.
-------------------------------------------------------------------------- */

const CHANNEL_W = [0.05, 0.15, 0.4, 1.0, 2.0];
const CHANNEL_COLOR = ["#818cf8", "#34d399", "#fbbf24", "#f472b6", "#f87171"];

function ChannelDecay() {
  const W = 560;
  const H = 180;
  const PAD = 40;
  const N = 60;
  const px = (i) => PAD + (i / (N - 1)) * (W - PAD * 2);
  const py = (v) => H - PAD - v * (H - PAD * 1.4);

  return (
    <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.07] p-6">
      <h3 className="text-indigo-400 font-bold mb-1">Every channel remembers a different distance</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        w is learned per channel, so a single layer holds many timescales at once. Some channels track the last two
        words; others carry information for hundreds of steps. The model decides which is which during training.
      </p>

      <div className="rounded-xl bg-black/50 border border-white/10 p-3 mb-4">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto">
          <line x1={PAD} y1={py(0)} x2={W - PAD} y2={py(0)} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          <line x1={PAD} y1={py(0)} x2={PAD} y2={py(1)} stroke="rgba(255,255,255,0.15)" strokeWidth="1" />
          {CHANNEL_W.map((w, ci) => {
            const d = Array.from({ length: N }, (_, i) => `${i ? "L" : "M"}${px(i)},${py(Math.exp(-w * i))}`).join(" ");
            return <path key={w} d={d} fill="none" stroke={CHANNEL_COLOR[ci]} strokeWidth="2" />;
          })}
          <text x={W - PAD} y={H - 8} fill="#6b7280" fontSize="10" textAnchor="end" fontFamily="monospace">
            tokens back →
          </text>
          <text x={PAD - 6} y={py(1) + 4} fill="#6b7280" fontSize="10" textAnchor="end" fontFamily="monospace">1</text>
        </svg>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-5 gap-2">
        {CHANNEL_W.map((w, ci) => (
          <div key={w} className="p-3 rounded-lg bg-black/40 border border-white/10">
            <div className="flex items-center gap-1.5 mb-1">
              <span className="w-2.5 h-2.5 rounded-full shrink-0" style={{ background: CHANNEL_COLOR[ci] }} />
              <span className="text-[0.6875rem] font-mono text-gray-400">w={w}</span>
            </div>
            <div className="text-sm font-bold font-mono text-gray-200">{Math.round(1 / w)}</div>
            <div className="text-[0.625rem] text-gray-600">token half-life</div>
          </div>
        ))}
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export default function MlRwkv() {
  const toc = [
    { label: "The Idea", hash: "idea" },
    { label: "What R, W, K, V Mean", hash: "letters" },
    { label: "The WKV Operator", hash: "wkv" },
    { label: "Two Modes, One Model", hash: "dual" },
    { label: "Decay Across Channels", hash: "channels" },
    { label: "Time and Channel Mixing", hash: "mixing" },
    { label: "In Code", hash: "code" },
    { label: "Versus Mamba", hash: "versus" },
  ];

  return (
    <GuideLayout
      title="RWKV"
      intro="An architecture that trains like a transformer and runs like an RNN — by removing the one thing in attention that makes recurrence impossible."
      toc={toc}
    >
      <section id="idea" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Idea</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          Attention computes a score for every pair of tokens, which is why it costs the square of the sequence
          length and why generation needs a cache of every previous key and value. The pairwise part is the problem,
          and it comes from one place: the softmax over query-key dot products couples every position to every other.
        </p>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          RWKV removes the query entirely. A past token's contribution depends on its own key and on how far back it
          sits, never on the current token's identity. That makes the positional term a plain exponential decay, and
          an exponentially decaying sum can be maintained incrementally — which turns the whole thing into a
          recurrence.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-xl border border-rose-500/25 bg-rose-500/[0.07]">
            <div className="font-bold text-rose-400 mb-2">Attention</div>
            <div className="font-mono text-[0.6875rem] text-gray-400 mb-2">weight(i,t) = softmax(qₜ·kᵢ)</div>
            <p className="text-xs text-gray-300 leading-relaxed m-0">
              Depends on both positions, so nothing can be precomputed or accumulated. Every past key and value must
              be kept and re-read at each step.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-cyan-500/25 bg-cyan-500/[0.07]">
            <div className="font-bold text-cyan-400 mb-2">RWKV</div>
            <div className="font-mono text-[0.6875rem] text-gray-400 mb-2">weight(i,t) = exp(−(t−1−i)·w + kᵢ)</div>
            <p className="text-xs text-gray-300 leading-relaxed m-0">
              Separates into a term for the past token and a decay in the gap. The sum telescopes, so two running
              numbers replace the entire history.
            </p>
          </div>
        </div>
      </section>

      <section id="letters" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">What R, W, K, V Mean</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ["R — Receptance", "A sigmoid gate deciding how much of the mixed result this position actually accepts. It is the forget gate of an LSTM under a different name.", "border-purple-500/25 bg-purple-500/[0.07]", "text-purple-400"],
            ["W — Weight decay", "A learned positive value per channel controlling how fast the past fades. This is the entire positional mechanism; there are no positional embeddings.", "border-amber-500/25 bg-amber-500/[0.07]", "text-amber-400"],
            ["K — Key", "How strongly this token wants to be remembered. Unlike attention it is never compared against a query — it only scales the token's own contribution.", "border-cyan-500/25 bg-cyan-500/[0.07]", "text-cyan-400"],
            ["V — Value", "What the token contributes, exactly as in attention.", "border-emerald-500/25 bg-emerald-500/[0.07]", "text-emerald-400"],
          ].map(([n, d, box, tone]) => (
            <div key={n} className={`p-5 rounded-xl border ${box}`}>
              <div className={`font-bold mb-1.5 ${tone}`}>{n}</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{d}</p>
            </div>
          ))}
        </div>
        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            There is a fifth quantity worth naming: <span className="font-mono text-gray-300">u</span>, a bonus added
            only to the current token. Without it the present token would be treated as one step in the past and
            decayed accordingly, which turns out to hurt. It is a small correction that matters.
          </p>
        </div>
      </section>

      <section id="wkv" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The WKV Operator</h2>
        <WkvPanel />
      </section>

      <section id="dual" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Two Modes, One Model</h2>
        <DualModePanel />
        <div className="mt-5 p-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>One implementation detail decides whether this works at all.</strong> Those exponentials overflow
            fast — exp(k) for a large key is instantly infinity in fp16. Real implementations track a running maximum
            and store everything relative to it, the same trick as a numerically stable softmax. Written naively, the
            recurrent form produces NaNs within a few hundred tokens.
          </p>
        </div>
      </section>

      <section id="channels" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Decay Across Channels</h2>
        <ChannelDecay />
      </section>

      <section id="mixing" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Time and Channel Mixing</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          An RWKV block has two sublayers, mirroring a transformer's attention and feed-forward pair.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="p-5 rounded-xl border border-cyan-500/25 bg-cyan-500/[0.07]">
            <div className="font-bold text-cyan-400 mb-2">Time-mixing</div>
            <p className="text-xs text-gray-300 leading-relaxed mb-2">
              Replaces attention. Computes the WKV weighted sum over history, then gates it with receptance. This is
              where information moves between positions.
            </p>
            <div className="font-mono text-[0.6875rem] text-gray-500">out = σ(r) ⊙ wkv</div>
          </div>
          <div className="p-5 rounded-xl border border-purple-500/25 bg-purple-500/[0.07]">
            <div className="font-bold text-purple-400 mb-2">Channel-mixing</div>
            <p className="text-xs text-gray-300 leading-relaxed mb-2">
              Replaces the feed-forward network. Mixes features within a position, with a squared-ReLU nonlinearity
              and its own receptance gate.
            </p>
            <div className="font-mono text-[0.6875rem] text-gray-500">out = σ(r) ⊙ (W · ReLU(k)²)</div>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            Both sublayers begin with a token shift: each position is blended with the one immediately before it,
            using a learned per-channel ratio. It costs almost nothing and gives every layer a small explicit window
            on the recent past, on top of whatever the decay carries.
          </p>
        </div>
      </section>

      <section id="code" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">In Code</h2>
        <CodeBlock
          language="python"
          code={`import torch

def rwkv_time_mix_recurrent(k, v, w, u, state):
    """One inference step. Constant memory, no KV cache.

    state = (a, b, p) where a/b are the running numerator and denominator
    and p is the running max exponent that keeps everything finite.
    """
    a, b, p = state

    # --- output for this position: history plus the bonused current token ---
    q = torch.maximum(p, u + k)                 # new shared reference point
    e1 = torch.exp(p - q)                       # rescale the carried state
    e2 = torch.exp(u + k - q)                   # current token, with bonus u
    wkv = (e1 * a + e2 * v) / (e1 * b + e2)

    # --- carry forward: decay the history, fold in this token WITHOUT u ---
    q2 = torch.maximum(p - w, k)
    e1 = torch.exp(p - w - q2)
    e2 = torch.exp(k - q2)
    state = (e1 * a + e2 * v, e1 * b + e2, q2)

    return wkv, state


# Generation: the state is three tensors and never grows.
state = (torch.zeros(C), torch.zeros(C), torch.full((C,), -1e38))
for token in prompt_and_generation:
    r, k, v = project(token)
    wkv, state = rwkv_time_mix_recurrent(k, v, w, u, state)
    out = torch.sigmoid(r) * wkv
    # ... next layer ...

# Every torch.maximum / exp(x - q) pair above is the numerical-stability
# trick. Remove it and this overflows to NaN within a few hundred tokens.`}
        />
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          Note that <span className="font-mono text-gray-400">u</span> appears in the output computation but not in
          the state carried forward. The bonus applies to a token only while it is the current one; once it moves
          into the past it decays like everything else.
        </p>
      </section>

      <section id="versus" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Versus Mamba and Attention</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          RWKV and Mamba arrive at nearly the same place from opposite directions. RWKV starts with attention and
          strips out the query; Mamba starts with a state space model and makes it input-dependent. Both end up as a
          linear recurrence with a fixed-size state.
        </p>
        <div className="overflow-x-auto rounded-xl border border-white/10 mb-5">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-left">
                <th className="px-4 py-3 font-semibold text-white"> </th>
                <th className="px-4 py-3 font-semibold text-rose-400">Transformer</th>
                <th className="px-4 py-3 font-semibold text-cyan-400">RWKV</th>
                <th className="px-4 py-3 font-semibold text-emerald-400">Mamba</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                ["Came from", "Attention", "Attention, query removed", "Control theory"],
                ["Positional info", "Embeddings or RoPE", "Exponential decay only", "Δ, the learned step size"],
                ["Input-dependent mixing", "Yes, fully pairwise", "No — decay is fixed per channel", "Yes, via Δ, B, C"],
                ["Training", "Parallel", "Parallel", "Parallel scan"],
                ["Inference memory", "Grows with the sequence", "Constant", "Constant"],
                ["Exact recall", "Strong", "Weaker", "Weaker"],
                ["Custom CUDA needed", "No", "Yes, for speed", "Yes"],
              ].map(([k, ...cells]) => (
                <tr key={k} className="border-t border-white/10">
                  <td className="px-4 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap align-top">{k}</td>
                  {cells.map((c, i) => (
                    <td key={i} className="px-4 py-3 text-xs leading-relaxed">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Where RWKV fits</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Constant memory generation on modest hardware, including CPU.</li>
              <li>Very long or unbounded streams, where a KV cache is untenable.</li>
              <li>Open weights at a range of sizes with a permissive licence.</li>
              <li>Embedded and edge deployment where memory is the hard limit.</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Where it does not</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Tasks needing verbatim recall of something far back.</li>
              <li>Fixed decay cannot skip irrelevant spans the way Mamba's Δ can.</li>
              <li>A much smaller ecosystem than the transformer world.</li>
              <li>Frontier-level quality at the largest scales.</li>
            </ul>
          </div>
        </div>
        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            Later RWKV versions close part of the gap by making the decay itself data-dependent, which is convergence
            toward the same insight Mamba's selectivity encodes. Read{" "}
            <a href="#/ml/mamba" className="text-blue-400 hover:underline">Mamba</a> next, or{" "}
            <a href="#/ml/transformers" className="text-blue-400 hover:underline">Transformers</a> for the baseline
            both are measured against.
          </p>
        </div>
      </section>

      <KnowledgeCheck questions={questionsFor("arch-rwkv")} />
    </GuideLayout>
  );
}

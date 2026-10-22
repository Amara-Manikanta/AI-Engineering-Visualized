import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import GuideLayout from "../components/GuideLayout";

/* ===========================================================================
   1. TOKENIZER  — approximate BPE-style segmentation.
   Real BPE needs the model's merge table; this mirrors the *behaviour* that
   matters pedagogically: whitespace is attached to the following word,
   punctuation splits off, and long/rare words fragment into pieces.
=========================================================================== */

const COMMON = new Set(
  ("the of and to in is it you that he was for on are as with his they i at be this have from one had by " +
   "word but not what all were we when your can said there use an each which she do how their if will up " +
   "other about out many then them these so some her would make like him into time has look two more write " +
   "go see number no way could people my than first water been call who oil its now find long down day did " +
   "get come made may part model data text token prompt input output train learn").split(" ")
);

function tokenize(text) {
  if (!text) return [];
  // split keeping delimiters: words, punctuation, whitespace runs
  const raw = text.match(/\s+|[A-Za-z]+|\d+|[^\sA-Za-z\d]/g) ?? [];
  const out = [];
  for (const piece of raw) {
    if (/^\s+$/.test(piece)) {
      // whitespace merges into the next token (GPT-style " word")
      out.push({ t: piece, kind: "space", pending: true });
      continue;
    }
    if (/^\d+$/.test(piece)) {
      // numbers often split into 1-3 digit chunks
      for (let i = 0; i < piece.length; i += 3) out.push({ t: piece.slice(i, i + 3), kind: "num" });
      continue;
    }
    if (/^[A-Za-z]+$/.test(piece)) {
      const lower = piece.toLowerCase();
      if (COMMON.has(lower) || piece.length <= 4) {
        out.push({ t: piece, kind: "word" });
      } else {
        // fragment longer/rarer words into ~4-char subwords
        for (let i = 0; i < piece.length; i += 4) {
          out.push({ t: piece.slice(i, i + 4), kind: "sub" });
        }
      }
      continue;
    }
    out.push({ t: piece, kind: "punct" });
  }
  // attach pending whitespace to the following token
  const merged = [];
  let lead = "";
  for (const tok of out) {
    if (tok.pending) { lead += tok.t; continue; }
    merged.push({ ...tok, t: lead + tok.t });
    lead = "";
  }
  if (lead) merged.push({ t: lead, kind: "space" });
  return merged;
}

const TOK_COLORS = {
  word:  "bg-indigo-500/25 border-indigo-500/50 text-indigo-100",
  sub:   "bg-amber-500/25 border-amber-500/50 text-amber-100",
  num:   "bg-emerald-500/25 border-emerald-500/50 text-emerald-100",
  punct: "bg-rose-500/25 border-rose-500/50 text-rose-100",
  space: "bg-white/5 border-white/10 text-gray-400",
};

function TokenizerTool() {
  const [text, setText] = useState(
    "Retrieval-Augmented Generation lets an LLM answer using your own documents."
  );
  const tokens = useMemo(() => tokenize(text), [text]);
  const chars = text.length;
  const words = text.trim() ? text.trim().split(/\s+/).length : 0;

  return (
    <div>
      <p className="text-sm text-gray-400 mb-4 max-w-3xl">
        Models never see characters or words — they see <strong className="text-gray-200">tokens</strong>. Type below
        and watch the split change. Notice that common words stay whole while rare ones fragment, which is why unusual
        names and code cost more tokens than ordinary prose.
      </p>

      <textarea
        value={text}
        onChange={(e) => setText(e.target.value)}
        rows={3}
        className="w-full bg-[#141414] border border-gray-800 rounded-xl p-4 text-sm text-gray-200 outline-none focus:border-indigo-500/60 resize-y mb-4 font-mono"
      />

      <div className="grid grid-cols-3 gap-3 mb-4">
        {[
          ["Characters", chars, "text-gray-300"],
          ["Words", words, "text-gray-300"],
          ["Tokens", tokens.length, "text-indigo-300"],
        ].map(([l, v, c]) => (
          <div key={l} className="p-3 rounded-xl border border-white/10 bg-white/5 text-center">
            <div className="text-[0.625rem] uppercase tracking-wide text-gray-500">{l}</div>
            <motion.div key={v} initial={{ scale: 1.15, opacity: 0.6 }} animate={{ scale: 1, opacity: 1 }} className={`text-2xl font-bold font-mono ${c}`}>
              {v}
            </motion.div>
          </div>
        ))}
      </div>

      <div className="p-4 rounded-xl border border-white/10 bg-black/40 min-h-[90px] flex flex-wrap gap-1 content-start mb-4">
        {tokens.map((tok, i) => (
          <motion.span
            key={i}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.12 }}
            title={`token ${i + 1} · ${tok.kind}`}
            className={`px-1.5 py-1 rounded border font-mono text-xs whitespace-pre ${TOK_COLORS[tok.kind]}`}
          >
            {tok.t.replace(/ /g, "·")}
          </motion.span>
        ))}
      </div>

      <div className="flex flex-wrap gap-3 text-[0.6875rem] text-gray-500 mb-4">
        {Object.entries({ word: "whole word", sub: "subword fragment", num: "number chunk", punct: "punctuation" }).map(([k, label]) => (
          <span key={k} className="flex items-center gap-1.5">
            <span className={`w-3 h-3 rounded border ${TOK_COLORS[k]}`} />
            {label}
          </span>
        ))}
        <span className="ml-auto">· = leading space, which belongs to the token</span>
      </div>

      <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/10">
        <p className="text-xs text-amber-200 leading-relaxed m-0">
          <strong>This is an approximation.</strong> Real BPE uses a learned merge table specific to each model, so
          exact counts differ per tokenizer (GPT, Claude and Llama all split differently). The lesson it gets right:
          token count is not word count, and rare text costs more.
        </p>
      </div>
    </div>
  );
}

/* ===========================================================================
   2. TEMPERATURE & SAMPLING — real softmax maths, live.
=========================================================================== */

const LOGITS = [
  { word: "dog", logit: 3.2 },
  { word: "cat", logit: 2.9 },
  { word: "bird", logit: 1.8 },
  { word: "car", logit: 0.9 },
  { word: "idea", logit: 0.2 },
  { word: "purple", logit: -0.6 },
];

function softmax(logits, T) {
  const t = Math.max(T, 0.01);
  const scaled = logits.map((l) => l / t);
  const max = Math.max(...scaled);
  const exps = scaled.map((s) => Math.exp(s - max));
  const sum = exps.reduce((a, b) => a + b, 0);
  return exps.map((e) => e / sum);
}

function SamplingTool() {
  const [temp, setTemp] = useState(1.0);
  const [topP, setTopP] = useState(1.0);

  const probs = useMemo(() => softmax(LOGITS.map((l) => l.logit), temp), [temp]);

  // nucleus (top-p): keep the smallest set whose cumulative prob >= p
  const ranked = useMemo(() => {
    const rows = LOGITS.map((l, i) => ({ ...l, p: probs[i] })).sort((a, b) => b.p - a.p);
    let cum = 0;
    return rows.map((r) => {
      const included = cum < topP;
      if (included) cum += r.p;
      return { ...r, included };
    });
  }, [probs, topP]);

  const kept = ranked.filter((r) => r.included).length;
  const maxP = Math.max(...ranked.map((r) => r.p));

  return (
    <div>
      <p className="text-sm text-gray-400 mb-4 max-w-3xl">
        The model outputs raw scores (logits) for every possible next token. Temperature and top-p decide how that
        becomes a choice. These bars are computed with the real softmax — drag and watch the distribution reshape.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <div>
          <label className="text-xs text-gray-300 font-semibold flex justify-between mb-1">
            <span>Temperature</span>
            <span className="font-mono text-indigo-300">{temp.toFixed(2)}</span>
          </label>
          <input type="range" min="0.01" max="2" step="0.01" value={temp} onChange={(e) => setTemp(+e.target.value)} className="w-full accent-indigo-500" />
          <div className="text-[0.625rem] text-gray-600 mt-1">
            {temp < 0.4 ? "near-deterministic — picks the top token almost every time" : temp > 1.3 ? "high chaos — unlikely tokens become plausible" : "balanced"}
          </div>
        </div>
        <div>
          <label className="text-xs text-gray-300 font-semibold flex justify-between mb-1">
            <span>Top-p (nucleus)</span>
            <span className="font-mono text-emerald-300">{topP.toFixed(2)}</span>
          </label>
          <input type="range" min="0.05" max="1" step="0.01" value={topP} onChange={(e) => setTopP(+e.target.value)} className="w-full accent-emerald-500" />
          <div className="text-[0.625rem] text-gray-600 mt-1">keeping {kept} of {LOGITS.length} tokens in the nucleus</div>
        </div>
      </div>

      <div className="p-5 rounded-xl border border-white/10 bg-black/40 space-y-2.5 mb-4">
        {ranked.map((r) => (
          <div key={r.word} className={`flex items-center gap-3 ${r.included ? "" : "opacity-30"}`}>
            <span className="text-xs font-mono text-gray-400 w-16 shrink-0">{r.word}</span>
            <div className="flex-1 h-6 rounded bg-white/5 overflow-hidden">
              <motion.div
                className={`h-full ${r.included ? "bg-indigo-500" : "bg-gray-600"} opacity-80 flex items-center justify-end pr-2`}
                animate={{ width: `${(r.p / maxP) * 100}%` }}
                transition={{ type: "spring", stiffness: 140, damping: 20 }}
              >
                <span className="text-[0.625rem] font-bold text-black/70">{(r.p * 100).toFixed(1)}%</span>
              </motion.div>
            </div>
            {!r.included && <span className="text-[0.5625rem] text-rose-400 w-14 shrink-0">excluded</span>}
            {r.included && <span className="w-14 shrink-0" />}
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="p-4 rounded-xl border border-blue-500/25 bg-blue-500/10">
          <div className="text-blue-300 font-semibold text-xs mb-1">Temperature divides the logits</div>
          <p className="text-[0.6875rem] text-gray-300 leading-relaxed m-0">
            Low T exaggerates differences (the leader runs away with it); high T flattens them. At T→0 it becomes
            greedy decoding — always the top token, fully deterministic.
          </p>
        </div>
        <div className="p-4 rounded-xl border border-emerald-500/25 bg-emerald-500/10">
          <div className="text-emerald-300 font-semibold text-xs mb-1">Top-p truncates the tail</div>
          <p className="text-[0.6875rem] text-gray-300 leading-relaxed m-0">
            Keeps only the smallest group of tokens whose probabilities sum to p, then renormalises. It adapts: a
            confident step keeps 1–2 tokens, an uncertain one keeps many.
          </p>
        </div>
      </div>
    </div>
  );
}

/* ===========================================================================
   3. ATTENTION HEATMAP — toy but real: scaled dot-product over toy vectors.
=========================================================================== */

function hashVec(word, dim = 8) {
  // deterministic pseudo-embedding so the demo is stable across renders
  const v = new Array(dim).fill(0);
  for (let i = 0; i < word.length; i++) {
    v[i % dim] += ((word.charCodeAt(i) * 31 + i * 7) % 17) / 17 - 0.45;
  }
  const n = Math.hypot(...v) || 1;
  return v.map((x) => x / n);
}

function AttentionTool() {
  const [sentence, setSentence] = useState("the cat sat on the mat because it was warm");
  const words = useMemo(() => sentence.trim().split(/\s+/).filter(Boolean).slice(0, 12), [sentence]);
  const [hover, setHover] = useState(null);

  const matrix = useMemo(() => {
    const vecs = words.map((w) => hashVec(w.toLowerCase()));
    const d = 8;
    return vecs.map((q, i) => {
      // causal mask: a token can only attend to itself and earlier tokens
      const scores = vecs.map((k, j) => (j > i ? -Infinity : q.reduce((s, x, n) => s + x * k[n], 0) / Math.sqrt(d)));
      const max = Math.max(...scores.filter(Number.isFinite));
      const exps = scores.map((s) => (Number.isFinite(s) ? Math.exp((s - max) * 4) : 0));
      const sum = exps.reduce((a, b) => a + b, 0) || 1;
      return exps.map((e) => e / sum);
    });
  }, [words]);

  return (
    <div>
      <p className="text-sm text-gray-400 mb-4 max-w-3xl">
        Self-attention asks, for every token: <em>which earlier tokens should I look at?</em> Each row below is one
        token's attention distribution. Brighter = more attention. The upper triangle is dark because a causal
        (decoder) model cannot see the future.
      </p>

      <input
        value={sentence}
        onChange={(e) => setSentence(e.target.value)}
        className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 outline-none focus:border-indigo-500/60 mb-5 font-mono"
      />

      <div className="overflow-x-auto rounded-xl border border-white/10 bg-black/40 p-4 mb-4">
        <div className="inline-block min-w-max">
          {/* column headers */}
          <div className="flex gap-1 mb-1 ml-[92px]">
            {words.map((w, j) => (
              <div key={j} className="w-9 text-[0.5625rem] text-gray-500 text-center truncate" title={w}>{w.slice(0, 5)}</div>
            ))}
          </div>
          {matrix.map((row, i) => (
            <div key={i} className="flex items-center gap-1 mb-1">
              <div className="w-[88px] text-[0.625rem] text-gray-400 text-right pr-2 truncate" title={words[i]}>{words[i]}</div>
              {row.map((v, j) => (
                <div
                  key={j}
                  onMouseEnter={() => setHover({ i, j, v })}
                  onMouseLeave={() => setHover(null)}
                  className="w-9 h-9 rounded-sm cursor-crosshair transition-transform hover:scale-110"
                  style={{
                    backgroundColor: j > i ? "rgba(255,255,255,0.02)" : `rgba(99,102,241,${0.08 + v * 0.92})`,
                    outline: hover && hover.i === i && hover.j === j ? "1.5px solid #a5b4fc" : "none",
                  }}
                  title={j > i ? "masked (future token)" : `${words[i]} → ${words[j]}: ${(v * 100).toFixed(1)}%`}
                />
              ))}
            </div>
          ))}
        </div>
      </div>

      <div className="p-3 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-400 min-h-[42px] flex items-center">
        {hover ? (
          hover.j > hover.i ? (
            <span className="text-rose-300">Masked — “{words[hover.i]}” cannot attend to the later token “{words[hover.j]}”.</span>
          ) : (
            <span>
              <span className="text-indigo-300 font-mono">{words[hover.i]}</span> attends{" "}
              <span className="text-white font-bold">{(hover.v * 100).toFixed(1)}%</span> to{" "}
              <span className="text-indigo-300 font-mono">{words[hover.j]}</span>
            </span>
          )
        ) : (
          <span className="text-gray-600">Hover a cell to read the attention weight.</span>
        )}
      </div>

      <div className="mt-4 p-4 rounded-xl border border-amber-500/25 bg-amber-500/10">
        <p className="text-xs text-amber-200 leading-relaxed m-0">
          <strong>Toy embeddings.</strong> Weights come from scaled dot-product attention over deterministic
          pseudo-vectors, not a trained model — so the <em>pattern</em> is illustrative, not linguistically meaningful.
          The mechanics (Q·Kᵀ / √d → softmax → causal mask) are exactly the real thing. See{" "}
          <a href="#/ml/transformers" className="text-blue-400 hover:underline">Transformers</a> for the full stack.
        </p>
      </div>
    </div>
  );
}

/* ===========================================================================
   4. COST CALCULATOR — editable prices, real arithmetic.
=========================================================================== */

const DEFAULT_MODELS = [
  { name: "GPT-class frontier", inp: 2.5, out: 10 },
  { name: "Claude-class frontier", inp: 3, out: 15 },
  { name: "Gemini-class frontier", inp: 1.25, out: 5 },
  { name: "Open-weight (self-host)", inp: 0.2, out: 0.4 },
];

function CostTool() {
  const [models, setModels] = useState(DEFAULT_MODELS);
  const [inTok, setInTok] = useState(2000);
  const [outTok, setOutTok] = useState(500);
  const [calls, setCalls] = useState(10000);

  const rows = useMemo(
    () =>
      models
        .map((m) => {
          const per = (inTok / 1e6) * m.inp + (outTok / 1e6) * m.out;
          return { ...m, per, total: per * calls };
        })
        .sort((a, b) => a.total - b.total),
    [models, inTok, outTok, calls]
  );
  const max = Math.max(...rows.map((r) => r.total), 1);

  const setPrice = (i, field, val) =>
    setModels((ms) => ms.map((m, n) => (n === i ? { ...m, [field]: Math.max(0, +val || 0) } : m)));

  return (
    <div>
      <p className="text-sm text-gray-400 mb-4 max-w-3xl">
        The number that decides whether a feature ships. Set your traffic shape and compare. Prices are{" "}
        <strong className="text-gray-200">editable</strong> and default to rough order-of-magnitude figures per
        million tokens — always paste today's real numbers from the provider before planning a budget.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-5">
        {[
          ["Input tokens / call", inTok, setInTok, 100, 200000],
          ["Output tokens / call", outTok, setOutTok, 50, 20000],
          ["Calls / month", calls, setCalls, 100, 5000000],
        ].map(([label, val, set, min, max2]) => (
          <div key={label}>
            <label className="text-xs text-gray-300 font-semibold flex justify-between mb-1">
              <span>{label}</span>
              <span className="font-mono text-indigo-300">{val.toLocaleString()}</span>
            </label>
            <input type="range" min={min} max={max2} step={min} value={val} onChange={(e) => set(+e.target.value)} className="w-full accent-indigo-500" />
          </div>
        ))}
      </div>

      <div className="rounded-xl border border-white/10 bg-black/40 p-4 space-y-3 mb-4">
        {rows.map((r, i) => (
          <div key={r.name} className="flex flex-wrap items-center gap-3">
            <span className="text-xs text-gray-300 w-44 shrink-0">{r.name}</span>
            <div className="flex-1 min-w-[120px] h-7 rounded bg-white/5 overflow-hidden">
              <motion.div
                className={`h-full ${i === 0 ? "bg-emerald-500" : "bg-indigo-500"} opacity-75 flex items-center justify-end pr-2`}
                animate={{ width: `${(r.total / max) * 100}%` }}
                transition={{ type: "spring", stiffness: 120, damping: 20 }}
              >
                <span className="text-[0.625rem] font-bold text-black/70 whitespace-nowrap">
                  ${r.total.toLocaleString(undefined, { maximumFractionDigits: 0 })}
                </span>
              </motion.div>
            </div>
            <span className="text-[0.625rem] font-mono text-gray-500 w-24 text-right shrink-0">
              ${r.per.toFixed(5)}/call
            </span>
          </div>
        ))}
      </div>

      <div className="overflow-x-auto rounded-xl border border-white/10 mb-4">
        <table className="w-full text-xs">
          <thead>
            <tr className="bg-white/5 text-gray-400">
              <th className="p-2.5 text-left">Model</th>
              <th className="p-2.5 text-left">$ / 1M input</th>
              <th className="p-2.5 text-left">$ / 1M output</th>
            </tr>
          </thead>
          <tbody>
            {models.map((m, i) => (
              <tr key={m.name} className={i % 2 ? "bg-white/[0.02]" : ""}>
                <td className="p-2.5 text-gray-300">{m.name}</td>
                {["inp", "out"].map((f) => (
                  <td key={f} className="p-2.5">
                    <input
                      type="number" step="0.05" min="0" value={m[f]}
                      onChange={(e) => setPrice(i, f, e.target.value)}
                      className="w-20 bg-[#141414] border border-gray-800 rounded px-2 py-1 font-mono text-gray-200 outline-none focus:border-indigo-500/60"
                    />
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="p-4 rounded-xl border border-blue-500/25 bg-blue-500/10">
        <p className="text-xs text-blue-200 leading-relaxed m-0">
          <strong>Output tokens dominate.</strong> They're typically 3–5× the input price, so a chatty system prompt
          costs far less than a chatty answer. Before optimising models, cap <code>max_tokens</code> and cache
          repeated prefixes — usually the two biggest wins available.
        </p>
      </div>
    </div>
  );
}

/* ===========================================================================
   5. EMBEDDING SPACE — 2D projection of toy vectors, clustered by meaning.
=========================================================================== */

const EMBED_GROUPS = [
  { label: "Animals", color: "#818cf8", items: [["dog", 22, 26], ["cat", 30, 20], ["puppy", 18, 33], ["kitten", 34, 30], ["horse", 27, 38]] },
  { label: "Food", color: "#34d399", items: [["pizza", 74, 24], ["pasta", 80, 32], ["bread", 68, 34], ["sushi", 84, 18]] },
  { label: "Tech", color: "#f472b6", items: [["python", 24, 76], ["server", 32, 84], ["database", 18, 86], ["compiler", 36, 72]] },
  { label: "Emotion", color: "#fbbf24", items: [["happy", 76, 74], ["joyful", 84, 80], ["sad", 68, 86], ["angry", 80, 66]] },
];

function EmbeddingTool() {
  const [sel, setSel] = useState(null);
  const all = EMBED_GROUPS.flatMap((g) => g.items.map(([w, x, y]) => ({ w, x, y, color: g.color, group: g.label })));

  const nearest = useMemo(() => {
    if (!sel) return [];
    return all
      .filter((p) => p.w !== sel.w)
      .map((p) => ({ ...p, d: Math.hypot(p.x - sel.x, p.y - sel.y) }))
      .sort((a, b) => a.d - b.d)
      .slice(0, 3);
  }, [sel, all]);

  return (
    <div>
      <p className="text-sm text-gray-400 mb-4 max-w-3xl">
        An embedding turns text into a point in high-dimensional space where <em>distance means similarity</em>.
        Real embeddings have hundreds of dimensions; this is a 2D projection. Click a word to see its nearest
        neighbours — that lookup is exactly what powers semantic search and RAG retrieval.
      </p>

      <div className="rounded-xl border border-white/10 bg-black/40 p-4 mb-4">
        <svg viewBox="0 0 100 100" className="w-full max-w-lg mx-auto block" style={{ aspectRatio: "1" }}>
          {[25, 50, 75].map((g) => (
            <g key={g}>
              <line x1={g} y1="2" x2={g} y2="98" stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
              <line x1="2" y1={g} x2="98" y2={g} stroke="rgba(255,255,255,0.04)" strokeWidth="0.3" />
            </g>
          ))}
          {/* lines to nearest neighbours */}
          {sel && nearest.map((n) => (
            <line key={n.w} x1={sel.x} y1={sel.y} x2={n.x} y2={n.y} stroke="#a5b4fc" strokeWidth="0.4" strokeDasharray="1,1" opacity="0.7" />
          ))}
          {all.map((p) => {
            const active = sel?.w === p.w;
            const near = nearest.some((n) => n.w === p.w);
            return (
              <g key={p.w} onClick={() => setSel(p)} style={{ cursor: "pointer" }}>
                <circle cx={p.x} cy={p.y} r={active ? 3 : near ? 2.2 : 1.6} fill={p.color} opacity={sel && !active && !near ? 0.3 : 1} />
                <text x={p.x} y={p.y - 3.6} textAnchor="middle" fontSize="2.6"
                  fill={active ? "#fff" : near ? "#e5e7eb" : "#9ca3af"} opacity={sel && !active && !near ? 0.35 : 1}>
                  {p.w}
                </text>
              </g>
            );
          })}
        </svg>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        {EMBED_GROUPS.map((g) => (
          <span key={g.label} className="flex items-center gap-1.5 text-[0.6875rem] text-gray-400">
            <span className="w-3 h-3 rounded-full" style={{ background: g.color }} />
            {g.label}
          </span>
        ))}
      </div>

      <div className="p-4 rounded-xl bg-white/5 border border-white/10 min-h-[64px]">
        {sel ? (
          <>
            <div className="text-xs text-gray-400 mb-2">
              Nearest to <span className="font-mono text-white">{sel.w}</span>:
            </div>
            <div className="flex flex-wrap gap-2">
              {nearest.map((n) => (
                <span key={n.w} className="px-2.5 py-1 rounded-lg border text-xs font-mono" style={{ borderColor: n.color + "80", background: n.color + "20", color: "#e5e7eb" }}>
                  {n.w} <span className="opacity-60">d={n.d.toFixed(1)}</span>
                </span>
              ))}
            </div>
          </>
        ) : (
          <span className="text-xs text-gray-600">Click any word to find its nearest neighbours.</span>
        )}
      </div>
    </div>
  );
}

/* ========================================================================= */

export const TOOLS = [
  { id: "tokenizer", label: "🔤 Tokenizer", title: "Tokenizer Playground", Comp: TokenizerTool },
  { id: "sampling", label: "🌡️ Temperature", title: "Temperature & Sampling", Comp: SamplingTool },
  { id: "attention", label: "🔥 Attention", title: "Attention Heatmap", Comp: AttentionTool },
  { id: "cost", label: "💰 Cost", title: "Token & Cost Calculator", Comp: CostTool },
  { id: "embeddings", label: "🗺️ Embeddings", title: "Embedding Space", Comp: EmbeddingTool },
];

export default function PlaygroundsIndex() {
  const [active, setActive] = useState(TOOLS[0].id);
  const tool = TOOLS.find((t) => t.id === active);
  const { Comp } = tool;

  const toc = TOOLS.map((t) => ({ label: t.title, hash: t.id }));

  return (
    <GuideLayout
      title="Interactive Playgrounds"
      intro="Hands-on tools for the concepts that are hard to grasp from prose — tokenization, sampling, attention, cost and embeddings. Everything here computes live."
      toc={toc}
    >
      <div className="flex flex-wrap gap-2 mb-6">
        {TOOLS.map((t) => (
          <button
            key={t.id}
            onClick={() => setActive(t.id)}
            className={`px-3.5 py-2 rounded-lg border text-sm font-medium transition-all ${
              active === t.id
                ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_4px_14px_rgba(99,102,241,0.35)]"
                : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-gray-200"
            }`}
          >
            {t.label}
          </button>
        ))}
      </div>
        <motion.section
          key={active}
          id={active}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-bold text-white mb-4">{tool.title}</h2>
          <Comp />
        </motion.section>
    </GuideLayout>
  );
}

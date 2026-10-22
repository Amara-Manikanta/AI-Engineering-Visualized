import React, { useEffect, useState } from "react";
import { Panel, Slider, Segmented, Metric, Button } from "../VizKit";
import { rng, pct } from "../../lib/stats";

/* Short demos for the LCM and LAM notes on the Model Types page. */

/* ---------------------------------------------------------------------------
   Token-level vs concept-level generation of the same three sentences.
   The translations are written for this page to illustrate a shared concept.
--------------------------------------------------------------------------- */

const SENTENCES = {
  en: ["Rain is forecast for Friday.", "The outdoor match may move indoors.", "Bring a jacket either way."],
  fr: ["De la pluie est prévue vendredi.", "Le match en plein air pourrait se jouer en salle.", "Prenez une veste dans tous les cas."],
  hi: ["शुक्रवार को बारिश का अनुमान है।", "बाहर का मैच अंदर हो सकता है।", "हर हाल में जैकेट साथ रखें।"],
};
const TOKENS = SENTENCES.en.join(" ").match(/\w+|[^\s\w]/g);
const CONCEPTS = (() => {
  const r = rng(3);
  return SENTENCES.en.map(() => Array.from({ length: 10 }, () => r()));
})();

export function TokenVsConcept() {
  const [t, setT] = useState(0);
  const [playing, setPlaying] = useState(false);
  const [lang, setLang] = useState("en");
  const N = TOKENS.length;

  useEffect(() => {
    if (!playing) return undefined;
    if (t >= N) {
      setPlaying(false);
      return undefined;
    }
    const id = setTimeout(() => setT((v) => v + 1), 260);
    return () => clearTimeout(id);
  }, [playing, t, N]);

  // Both lanes run on the same clock; the LCM needs only 3 steps, so it finishes a third of the way in.
  const concepts = Math.min(3, Math.ceil((t / N) * 9));
  const decoded = concepts;

  return (
    <Panel
      tone="purple"
      title="Word by word vs idea by idea"
      actions={<Button tone="purple" onClick={() => { if (t >= N) setT(0); setPlaying((p) => !p); }}>{playing ? "Pause" : t >= N ? "↺ Replay" : "▶ Generate"}</Button>}
    >
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl border border-white/10 bg-black/40 p-3">
          <div className="text-xs text-gray-500 mb-2">LLM — one token per step · <span className="font-mono text-indigo-300">{t} / {N} steps</span></div>
          <div className="flex flex-wrap gap-1 min-h-[5rem] content-start">
            {TOKENS.slice(0, t).map((tok, i) => (
              <span key={i} className="px-1.5 py-0.5 rounded bg-indigo-500/20 text-indigo-100 text-xs font-mono">{tok}</span>
            ))}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-black/40 p-3">
          <div className="text-xs text-gray-500 mb-2">LCM — one sentence vector per step · <span className="font-mono text-purple-300">{concepts} / 3 steps</span></div>
          <div className="space-y-2 min-h-[5rem]">
            {CONCEPTS.slice(0, concepts).map((v, i) => (
              <div key={i}>
                <div className="flex gap-[2px] mb-1">
                  {v.map((x, j) => (
                    <span key={j} className="h-3 flex-1 rounded-[2px]" style={{ background: `rgba(167,139,250,${0.2 + x * 0.8})` }} />
                  ))}
                </div>
                {i < decoded && <div className="text-xs text-gray-200">→ {SENTENCES[lang][i]}</div>}
              </div>
            ))}
          </div>
        </div>
      </div>
      <div className="flex flex-wrap items-center gap-2 mb-3">
        <span className="text-xs uppercase tracking-wide text-gray-500">Decode the same vectors into</span>
        <Segmented tone="purple" value={lang} onChange={setLang} options={[{ v: "en", label: "English" }, { v: "fr", label: "French" }, { v: "hi", label: "Hindi" }]} />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        Each purple strip stands for a 1,024-number sentence embedding. The LCM predicts the next one from the
        previous ones; a separate decoder then writes each out as text — in any language the embedding space
        supports, because the vector encodes the meaning, not the words. Decoding is still word by word, but the
        planning happens a sentence at a time. (Translations written for this illustration.)
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Why action models need very high per-step reliability.
--------------------------------------------------------------------------- */

export function Compounding() {
  const [p, setP] = useState(0.95);
  const [n, setN] = useState(20);
  const [rec, setRec] = useState(0);
  const eff = p + (1 - p) * (rec / 100);
  const succ = eff ** n;
  const W = 360;
  const H = 130;
  const sx = (k) => 30 + ((k - 1) / 49) * (W - 42);
  const sy = (v) => 10 + (1 - v) * (H - 34);
  const path = (q) => Array.from({ length: 50 }, (_, i) => `${i ? "L" : "M"}${sx(i + 1).toFixed(1)},${sy(q ** (i + 1)).toFixed(1)}`).join("");

  return (
    <Panel tone="rose" title="Every step has to work">
      <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block max-w-xl">
        <line x1="30" y1={sy(0)} x2={W - 12} y2={sy(0)} stroke="rgba(255,255,255,0.2)" />
        <path d={path(p)} fill="none" stroke="#fb7185" strokeWidth="2" />
        {rec > 0 && <path d={path(eff)} fill="none" stroke="#34d399" strokeWidth="2" />}
        <circle cx={sx(n)} cy={sy(succ)} r="4.5" fill={rec > 0 ? "#34d399" : "#fb7185"} />
        {[1, 10, 20, 30, 40, 50].map((k) => (
          <text key={k} x={sx(k)} y={H - 10} fill="#6b7280" fontSize="11" textAnchor="middle">{k}</text>
        ))}
        <text x={W - 12} y={H - 22} fill="#9ca3af" fontSize="11" textAnchor="end">steps in the task</text>
        <text x="34" y="20" fill="#9ca3af" fontSize="11">task success</text>
      </svg>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 my-4">
        <Slider tone="rose" label="Per-step success" value={p} min={0.8} max={0.999} step={0.001} onChange={setP} format={(v) => pct(v, 1)} />
        <Slider tone="rose" label="Steps" value={n} min={1} max={50} onChange={setN} />
        <Slider tone="emerald" label="Mistakes noticed & fixed" value={rec} min={0} max={90} onChange={setRec} format={(v) => `${v}%`} />
      </div>
      <div className="grid grid-cols-2 gap-2">
        <Metric label="Task success" value={pct(succ, 0)} tone={succ > 0.8 ? "emerald" : "rose"} />
        <Metric label="Effective per-step success" value={pct(eff, 1)} sub="after self-correction" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        95% per step sounds good; over 20 steps it finishes only about 36% of tasks. Checking the screen after each
        action and recovering from mistakes (green line) matters more than raw accuracy — which is why action models
        are trained on their own failures, not just clean demonstrations.
      </p>
    </Panel>
  );
}

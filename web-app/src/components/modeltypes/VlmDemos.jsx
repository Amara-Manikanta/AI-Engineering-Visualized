import React, { useEffect, useMemo, useState } from "react";
import { Panel, Slider, Segmented, Metric, Button } from "../VizKit";
import { rng, randn, fmt, pct } from "../../lib/stats";

/* Interactive pieces for the VLM section of the Model Types page. */

/* ---------------------------------------------------------------------------
   A small drawn scene. colorAt() describes the same shapes the SVG draws, so a
   patch's token colour is the colour at its centre.
--------------------------------------------------------------------------- */

// Barycentric point-in-triangle test.
const inTri = (px, py, a, b, c) => {
  const d = (b[1] - c[1]) * (a[0] - c[0]) + (c[0] - b[0]) * (a[1] - c[1]);
  const l1 = ((b[1] - c[1]) * (px - c[0]) + (c[0] - b[0]) * (py - c[1])) / d;
  const l2 = ((c[1] - a[1]) * (px - c[0]) + (a[0] - c[0]) * (py - c[1])) / d;
  return l1 >= 0 && l2 >= 0 && 1 - l1 - l2 >= 0;
};

function colorAt(x, y) {
  if (x >= 70 && x <= 90 && y >= 135 && y <= 170) return "#78350f"; // door
  if (x >= 40 && x <= 120 && y >= 100 && y <= 170) return "#fca5a5"; // house
  if (inTri(x, y, [30, 100], [80, 58], [130, 100])) return "#b91c1c"; // roof
  if (x >= 160 && x <= 172 && y >= 118 && y <= 178) return "#92400e"; // trunk
  if ((x - 166) ** 2 + (y - 104) ** 2 <= 26 ** 2) return "#15803d"; // foliage
  if ((x - 186) ** 2 + (y - 40) ** 2 <= 20 ** 2) return "#fbbf24"; // sun
  if (y >= 155) return "#22c55e"; // grass
  return y < 75 ? "#3b82f6" : "#60a5fa"; // sky
}

function Scene() {
  return (
    <g>
      <rect x="0" y="0" width="224" height="75" fill="#3b82f6" />
      <rect x="0" y="75" width="224" height="80" fill="#60a5fa" />
      <rect x="0" y="155" width="224" height="69" fill="#22c55e" />
      <circle cx="186" cy="40" r="20" fill="#fbbf24" />
      <polygon points="30,100 80,58 130,100" fill="#b91c1c" />
      <rect x="40" y="100" width="80" height="70" fill="#fca5a5" />
      <rect x="70" y="135" width="20" height="35" fill="#78350f" />
      <rect x="160" y="118" width="12" height="60" fill="#92400e" />
      <circle cx="166" cy="104" r="26" fill="#15803d" />
    </g>
  );
}

const QUESTION = ["What", " is", " in", " this", " picture", "?"];

export function PatchDemo() {
  const [patch, setPatch] = useState(32);
  const [shown, setShown] = useState(0);
  const [playing, setPlaying] = useState(false);
  const per = 224 / patch;
  const total = per * per;

  useEffect(() => {
    setShown(0);
    setPlaying(false);
  }, [patch]);

  useEffect(() => {
    if (!playing) return undefined;
    if (shown >= total) {
      setPlaying(false);
      return undefined;
    }
    const id = setTimeout(() => setShown((s) => Math.min(total, s + Math.max(1, Math.round(total / 60)))), 40);
    return () => clearTimeout(id);
  }, [playing, shown, total]);

  const tokens = useMemo(
    () => Array.from({ length: total }, (_, i) => colorAt((i % per) * patch + patch / 2, Math.floor(i / per) * patch + patch / 2)),
    [total, per, patch],
  );
  const cur = shown > 0 && shown <= total ? shown - 1 : -1;

  return (
    <Panel
      tone="blue"
      title="From pixels to tokens"
      actions={
        <>
          <Button tone="blue" onClick={() => { if (shown >= total) setShown(0); setPlaying((p) => !p); }}>{playing ? "Pause" : shown >= total ? "↺ Replay" : "▶ Encode the image"}</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 md:grid-cols-[minmax(0,240px)_minmax(0,1fr)] gap-5 items-start">
        <div>
          <svg viewBox="0 0 224 224" className="w-full h-auto block rounded-lg max-w-[240px]">
            <Scene />
            {Array.from({ length: per + 1 }, (_, i) => (
              <g key={i}>
                <line x1={i * patch} y1="0" x2={i * patch} y2="224" stroke="rgba(0,0,0,0.45)" strokeWidth="1" />
                <line x1="0" y1={i * patch} x2="224" y2={i * patch} stroke="rgba(0,0,0,0.45)" strokeWidth="1" />
              </g>
            ))}
            {cur >= 0 && (
              <rect x={(cur % per) * patch} y={Math.floor(cur / per) * patch} width={patch} height={patch} fill="none" stroke="#fff" strokeWidth="3" />
            )}
          </svg>
          <div className="mt-3">
            <Segmented tone="blue" value={patch} onChange={setPatch} options={[56, 32, 16].map((p) => ({ v: p, label: `${p}px patches` }))} />
          </div>
        </div>
        <div className="min-w-0">
          <div className="text-xs text-gray-500 mb-1.5">1 · Each patch → one vector from the vision encoder ({shown}/{total})</div>
          <div className="flex flex-wrap gap-[2px] mb-4 min-h-[2rem] rounded-lg bg-black/40 border border-white/10 p-2">
            {tokens.slice(0, shown).map((c, i) => (
              <span key={i} className="inline-block rounded-[2px]" style={{ width: patch >= 32 ? 14 : 8, height: patch >= 32 ? 14 : 8, background: c, outline: i === cur ? "2px solid white" : "none" }} />
            ))}
          </div>
          <div className="text-xs text-gray-500 mb-1.5">2 · A projector maps them into the language model's embedding space</div>
          <div className="flex items-center gap-2 mb-4 text-xs text-gray-400">
            <span className="px-2 py-1 rounded bg-blue-500/20 border border-blue-500/40 text-blue-200">vision encoder (ViT)</span>
            <span>→</span>
            <span className="px-2 py-1 rounded bg-purple-500/20 border border-purple-500/40 text-purple-200">projector (MLP)</span>
            <span>→</span>
            <span className="px-2 py-1 rounded bg-indigo-500/20 border border-indigo-500/40 text-indigo-200">LLM</span>
          </div>
          <div className="text-xs text-gray-500 mb-1.5">3 · The LLM reads image tokens and text tokens as one sequence</div>
          <div className="flex flex-wrap items-center gap-1 rounded-lg bg-black/40 border border-white/10 p-2 font-mono text-[0.6875rem]">
            <span className="px-1.5 py-0.5 rounded bg-blue-500/25 text-blue-100">[{shown} image tokens]</span>
            {QUESTION.map((t) => (
              <span key={t} className="px-1.5 py-0.5 rounded bg-white/10 text-gray-200 whitespace-pre">{t}</span>
            ))}
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Smaller patches keep more detail and cost more tokens: 16-pixel patches turn this 224-pixel image into 196
        tokens, 56-pixel patches into 16. After the projector, the language model cannot tell that these tokens came
        from pixels — attention treats them exactly like words, which is why one model can answer questions about
        what it sees.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Image token cost under three common strategies.
--------------------------------------------------------------------------- */

export function ImageTokenCalc() {
  const [w, setW] = useState(1600);
  const [h, setH] = useState(900);
  const fixed = (336 / 14) ** 2;
  const tiles = Math.min(6, Math.ceil(w / 336) * Math.ceil(h / 336));
  const tiled = (tiles + 1) * fixed;
  const native = Math.ceil(w / 28) * Math.ceil(h / 28);
  const scale = Math.min(1, 1568 / Math.max(w, h));
  const claude = Math.round((w * scale * h * scale) / 750);

  const rows = [
    ["Resize to 336 × 336", "CLIP ViT-L/14 at 336px, as in LLaVA-1.5", fixed, "Fine detail and small text are lost"],
    ["Tiles + thumbnail", `${tiles} tiles of 336px (max 6) plus a low-res overview`, tiled, "Keeps detail; cost grows with size"],
    ["Native resolution", "14px patches, 2×2 merged — one token per 28 × 28 px", native, "Aspect ratio preserved"],
    ["Claude rule of thumb", "≈ width × height ÷ 750, after downscaling to 1,568px on the long edge", claude, "Published estimate"],
  ];
  const max = Math.max(...rows.map((r) => r[2]));

  return (
    <Panel tone="indigo" title="What does one image cost in tokens?">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Slider label="Width (px)" value={w} min={224} max={4096} step={16} onChange={setW} />
        <Slider label="Height (px)" value={h} min={224} max={4096} step={16} onChange={setH} />
      </div>
      <div className="space-y-3">
        {rows.map(([n, d, v, note]) => (
          <div key={n}>
            <div className="flex justify-between gap-3 text-xs mb-1">
              <span className="text-gray-200 font-semibold">{n} <span className="text-gray-500 font-normal">— {d}</span></span>
              <span className="font-mono text-indigo-200 shrink-0">{Math.round(v).toLocaleString()}</span>
            </div>
            <div className="h-3 rounded bg-white/5 overflow-hidden">
              <div className="h-full bg-indigo-500/70 rounded" style={{ width: `${(v / max) * 100}%`, transition: "width 200ms" }} />
            </div>
            <div className="text-[0.6875rem] text-gray-500 mt-0.5">{note}</div>
          </div>
        ))}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        A full-HD screenshot can cost more than a page of text. That is why screenshots dominate the bill for
        computer-use agents, and why cropping to the relevant region is the cheapest optimisation for vision
        workloads.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   CLIP-style contrastive learning on four image–caption pairs.
--------------------------------------------------------------------------- */

const IMAGES = ["🐕 dog on grass", "🍕 pizza slice", "🚗 red car", "🌅 beach sunset"];
const CAPTIONS = ["a puppy playing outside", "a slice of cheese pizza", "a red sports car", "the sun setting over the sea"];
const DIM = 6;
const VEC = (() => {
  const r = rng(12);
  const rand = () => Array.from({ length: DIM }, () => randn(r));
  const base = Array.from({ length: 4 }, (_, i) => Array.from({ length: DIM }, (_, j) => (j === i ? 3 : 0) + 0.4 * randn(r)));
  return { imgR: IMAGES.map(rand), capR: CAPTIONS.map(rand), imgA: base.map((b) => b.map((v) => v + 0.5 * randn(r))), capA: base.map((b) => b.map((v) => v + 0.5 * randn(r))) };
})();
const norm = (v) => {
  const n = Math.sqrt(v.reduce((a, x) => a + x * x, 0));
  return v.map((x) => x / n);
};

export function ClipLab() {
  const [t, setT] = useState(0);
  const tau = 0.1;
  const { sims, loss, acc } = useMemo(() => {
    const mix = (a, b) => norm(a.map((v, i) => (1 - t) * v + t * b[i]));
    const img = VEC.imgR.map((v, i) => mix(v, VEC.imgA[i]));
    const cap = VEC.capR.map((v, i) => mix(v, VEC.capA[i]));
    const S = img.map((a) => cap.map((b) => a.reduce((s, x, k) => s + x * b[k], 0)));
    const ce = (row, i) => {
      const z = row.map((v) => v / tau);
      const m = Math.max(...z);
      const lse = m + Math.log(z.reduce((a, v) => a + Math.exp(v - m), 0));
      return lse - z[i];
    };
    let L = 0;
    let right = 0;
    for (let i = 0; i < 4; i++) {
      L += ce(S[i], i) + ce(S.map((r) => r[i]), i);
      if (S[i].indexOf(Math.max(...S[i])) === i) right++;
    }
    return { sims: S, loss: L / 8, acc: right / 4 };
  }, [t]);

  const cell = (v) => (v >= 0 ? `rgba(96,165,250,${0.1 + 0.8 * v})` : `rgba(251,113,133,${0.1 + 0.8 * -v})`);

  return (
    <Panel tone="purple" title="How the vision encoder learned to match words: contrastive training">
      <p className="text-sm text-gray-400 mb-4 leading-relaxed">
        Most VLM vision encoders start life as CLIP or SigLIP: an image encoder and a text encoder trained together on
        hundreds of millions of image–caption pairs. The goal: each image's vector should be most similar to its own
        caption's vector and dissimilar to every other caption in the batch.
      </p>
      <div className="overflow-x-auto mb-4">
        <table className="text-xs font-mono border-separate" style={{ borderSpacing: 3 }}>
          <thead>
            <tr>
              <th />
              {CAPTIONS.map((c) => (
                <th key={c} className="font-normal text-gray-400 px-1 pb-1 max-w-[6.5rem] leading-tight">"{c}"</th>
              ))}
            </tr>
          </thead>
          <tbody>
            {IMAGES.map((im, i) => (
              <tr key={im}>
                <td className="text-gray-300 pr-2 whitespace-nowrap">{im}</td>
                {sims[i].map((v, j) => (
                  <td key={j} className={`w-16 h-10 text-center rounded-md text-gray-100 ${i === j ? "ring-1 ring-white/50" : ""}`} style={{ background: cell(v) }}>
                    {v.toFixed(2)}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <Slider tone="purple" label="Training progress" value={t} min={0} max={1} step={0.01} onChange={setT} format={(v) => pct(v, 0)} />
      <div className="grid grid-cols-2 gap-2 mt-4">
        <Metric label="Contrastive loss" value={fmt(loss, 3)} tone="purple" sub="lower is better" />
        <Metric label="Images matched to own caption" value={`${Math.round(acc * 4)} / 4`} tone={acc === 1 ? "emerald" : "rose"} />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Cells are cosine similarities between image and caption vectors; ringed cells are the true pairs. At 0% the
        vectors are random. Drag toward 100% and the diagonal lights up while everything else goes pale: the model has
        learned a shared space where a picture of a dog and the words "a puppy" land in the same place. A VLM bolts a
        language model onto that space.
      </p>
    </Panel>
  );
}

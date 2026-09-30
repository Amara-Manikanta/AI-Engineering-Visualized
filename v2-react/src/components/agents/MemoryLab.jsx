import React, { useMemo, useState } from "react";
import { Panel, Slider, Metric } from "../VizKit";
import { rng } from "../../lib/stats";

/* ---------------------------------------------------------------------------
   Forgetting: keep the top-N memories ranked by importance × recency.
--------------------------------------------------------------------------- */

const ITEMS = (() => {
  const r = rng(90);
  const labels = ["user prefers metric units", "billing address changed", "asked about refunds", "said hello", "project deadline is 14 Oct", "typo fixed in draft", "allergic to peanuts", "liked the blue theme", "wants weekly summaries", "mentioned the weather", "manager is Priya", "asked for shorter answers", "tried the export button", "uses Python 3.12", "chatted about lunch", "prod database is read-only"];
  return labels.map((t, i) => ({ t, age: Math.round(1 + r() * 59), imp: Math.round(1 + r() * 9), id: i }));
})();

export function ForgettingLab() {
  const [cap, setCap] = useState(6);
  const [half, setHalf] = useState(20);
  const ranked = useMemo(() => {
    const s = ITEMS.map((m) => ({ ...m, score: m.imp * Math.pow(0.5, m.age / half) }));
    return [...s].sort((a, b) => b.score - a.score);
  }, [half]);
  const kept = new Set(ranked.slice(0, cap).map((m) => m.id));
  const important = ITEMS.filter((m) => m.imp >= 7);
  const keptImportant = important.filter((m) => kept.has(m.id)).length;
  const avgAge = ITEMS.filter((m) => kept.has(m.id)).reduce((a, m) => a + m.age, 0) / Math.max(1, kept.size);
  return (
    <Panel tone="purple" title="What should an agent forget?">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Slider tone="purple" label="Memory slots" value={cap} min={1} max={ITEMS.length} onChange={setCap} />
        <Slider tone="purple" label="Recency half-life (days)" value={half} min={2} max={120} onChange={setHalf} format={(v) => `${v} d`} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
        {ranked.map((m) => (
          <div key={m.id} className={`text-xs rounded-lg border px-2.5 py-1.5 flex justify-between gap-2 ${kept.has(m.id) ? "border-purple-500/40 bg-purple-500/10 text-gray-100" : "border-white/10 bg-black/30 text-gray-600 line-through"}`}>
            <span>{m.t}</span>
            <span className="font-mono text-[0.6875rem] shrink-0">imp {m.imp} · {m.age}d</span>
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Metric label="Kept" value={`${kept.size} of ${ITEMS.length}`} />
        <Metric label="Important kept (imp ≥ 7)" value={`${keptImportant} of ${important.length}`} tone={keptImportant === important.length ? "emerald" : "rose"} />
        <Metric label="Average age kept" value={`${avgAge.toFixed(0)} d`} tone="purple" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        Each memory is scored importance × 0.5^(age ÷ half-life). Shrink the slots and the trivial items drop first
        (“said hello”). A very short half-life makes recency win over importance, so an old but critical fact
        (“allergic to peanuts”) can be forgotten. Importance ratings here are made up; in practice you ask the model to
        rate them or track how often each memory is used.
      </p>
    </Panel>
  );
}

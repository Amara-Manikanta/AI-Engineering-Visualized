import { useEffect, useState } from "react";
import CodeBlock from "./CodeBlock";
import { ACCESS } from "../data/modelAccess";
import { motion } from "framer-motion";
import { AS_OF, METHODS, PROFILES } from "../data/modelProfiles";

/**
 * ModelProfile — three sections every model family page shares:
 *   #lineup    current models, dated
 *   #weights   what is released and under which licence
 *   #pipeline  the training pipeline, animated stage by stage
 *
 * All content comes from data/modelProfiles.js so the eleven pages stay
 * consistent and comparable. Pages add these three hashes to their TOC.
 */

const STATUS = {
  open: { label: "Open weights", box: "border-emerald-500/40 bg-emerald-500/15 text-emerald-200", dot: "bg-emerald-400" },
  closed: { label: "Closed weights", box: "border-rose-500/40 bg-rose-500/15 text-rose-200", dot: "bg-rose-400" },
  mixed: { label: "Mixed — some open", box: "border-amber-500/40 bg-amber-500/15 text-amber-200", dot: "bg-amber-400" },
};

// One colour per method so the same method looks the same on every page.
export const METHOD_TONE = {
  pretrain: { ring: "#818cf8", text: "text-indigo-300", bg: "bg-indigo-500/15", border: "border-indigo-500/40" },
  synthetic: { ring: "#2dd4bf", text: "text-teal-300", bg: "bg-teal-500/15", border: "border-teal-500/40" },
  sft: { ring: "#60a5fa", text: "text-blue-300", bg: "bg-blue-500/15", border: "border-blue-500/40" },
  "rlhf-ppo": { ring: "#f472b6", text: "text-pink-300", bg: "bg-pink-500/15", border: "border-pink-500/40" },
  dpo: { ring: "#c084fc", text: "text-purple-300", bg: "bg-purple-500/15", border: "border-purple-500/40" },
  grpo: { ring: "#fb923c", text: "text-orange-300", bg: "bg-orange-500/15", border: "border-orange-500/40" },
  rlaif: { ring: "#fbbf24", text: "text-amber-300", bg: "bg-amber-500/15", border: "border-amber-500/40" },
  "reasoning-rl": { ring: "#f87171", text: "text-rose-300", bg: "bg-rose-500/15", border: "border-rose-500/40" },
  "rejection-sampling": { ring: "#a3e635", text: "text-lime-300", bg: "bg-lime-500/15", border: "border-lime-500/40" },
  distill: { ring: "#34d399", text: "text-emerald-300", bg: "bg-emerald-500/15", border: "border-emerald-500/40" },
};

function Pipeline({ p }) {
  const [i, setI] = useState(0);
  const [playing, setPlaying] = useState(false);
  const stages = p.stages;
  const cur = stages[i];
  const m = METHODS[cur.m];
  const tone = METHOD_TONE[cur.m];

  useEffect(() => {
    if (!playing) return;
    if (i >= stages.length - 1) {
      setPlaying(false);
      return;
    }
    const t = setTimeout(() => setI((x) => x + 1), 2600);
    return () => clearTimeout(t);
  }, [playing, i, stages.length]);

  return (
    <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.07] p-5 sm:p-6">
      <div className="flex flex-wrap items-center justify-between gap-3 mb-5">
        <div className="text-sm text-gray-400">
          {stages.length} stages · tap any stage, or play them in order
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => {
              if (i >= stages.length - 1) setI(0);
              setPlaying((v) => !v);
            }}
            className="px-4 py-2 rounded-lg text-sm font-semibold border border-indigo-500/40 bg-indigo-500/15 text-indigo-200 hover:bg-indigo-500/25"
          >
            {playing ? "❚❚ Pause" : i >= stages.length - 1 ? "↻ Replay" : "▶ Play"}
          </button>
        </div>
      </div>

      {/* the chain of stages */}
      <div className="flex flex-wrap items-center gap-y-3 mb-5">
        {stages.map((s, k) => {
          const t = METHOD_TONE[s.m];
          const active = k === i;
          const done = k < i;
          return (
            <div key={k} className="flex items-center">
              <motion.button
                onClick={() => {
                  setPlaying(false);
                  setI(k);
                }}
                animate={{ scale: active ? 1.06 : 1, opacity: active || done ? 1 : 0.55 }}
                transition={{ duration: 0.25 }}
                className={`relative px-3 py-2 rounded-xl border text-sm font-medium text-left ${
                  active ? `${t.bg} ${t.border} ${t.text}` : "border-white/10 bg-white/[0.04] text-gray-300"
                }`}
                style={active ? { boxShadow: `0 0 0 2px ${t.ring}55, 0 0 18px ${t.ring}33` } : undefined}
              >
                <span className="block text-[0.6875rem] uppercase tracking-wide opacity-70">Stage {k + 1}</span>
                {METHODS[s.m].name.replace(/ \(.*\)$/, "")}
                {s.m === p.signature && (
                  <span className="absolute -top-2 -right-2 px-1.5 py-0.5 rounded-md text-[0.625rem] font-bold bg-amber-400 text-black">
                    ★ signature
                  </span>
                )}
              </motion.button>
              {k < stages.length - 1 && (
                <div className="relative w-7 sm:w-9 h-0.5 mx-1 bg-white/10 overflow-hidden rounded-full">
                  {k === i - 1 || (k === i && playing) ? (
                    <motion.div
                      key={`${k}-${i}`}
                      className="absolute inset-y-0 w-3 rounded-full"
                      style={{ background: t.ring }}
                      initial={{ left: "-30%" }}
                      animate={{ left: "110%" }}
                      transition={{ duration: 1.1, repeat: Infinity, ease: "easeInOut" }}
                    />
                  ) : (
                    done && <div className="absolute inset-0 bg-white/25" />
                  )}
                </div>
              )}
            </div>
          );
        })}
      </div>

      {/* what this stage is, then what THIS family did */}
      <motion.div
        key={i}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
        className={`rounded-xl border p-5 ${tone.border} bg-black/30`}
      >
        <div className={`text-lg font-bold mb-1 ${tone.text}`}>{m.name}</div>
        <p className="text-base text-gray-200 leading-relaxed mb-3">{m.short}</p>
        <p className="text-sm text-gray-400 leading-relaxed mb-4">{m.detail}</p>
        <div className="rounded-lg border border-white/10 bg-white/[0.04] p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">What {p.maker} did here</div>
          <p className="text-sm text-gray-200 leading-relaxed m-0">{cur.note}</p>
        </div>
      </motion.div>
    </div>
  );
}

export function ModelLineup({ id }) {
  const p = PROFILES[id];
  if (!p) return null;
  return (
      <section id="lineup" className="mb-16 scroll-mt-24">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-4">
          <h2 className="text-2xl font-bold text-white m-0">Current Lineup</h2>
          <span className="text-xs font-mono text-gray-500">as of {AS_OF}</span>
        </div>
        <div className="space-y-3">
          {p.lineup.map((x, k) => (
            <div
              key={x.name}
              className={`p-5 rounded-xl border ${k === 0 ? "border-indigo-500/40 bg-indigo-500/[0.09]" : "border-white/10 bg-white/[0.04]"}`}
            >
              <div className="flex flex-wrap items-baseline justify-between gap-2 mb-1.5">
                <div className="flex items-center gap-2">
                  <span className={`font-bold text-base ${k === 0 ? "text-indigo-200" : "text-white"}`}>{x.name}</span>
                  {x.tag && (
                    <span className="px-2 py-0.5 rounded-md text-[0.625rem] font-bold uppercase tracking-wide bg-indigo-500/30 text-indigo-200">
                      {x.tag}
                    </span>
                  )}
                </div>
                <span className="text-xs font-mono text-gray-500">{x.released}</span>
              </div>
              <p className="text-sm text-gray-300 leading-relaxed m-0">{x.role}</p>
              {x.spec && <div className="text-xs font-mono text-gray-500 mt-2">{x.spec}</div>}
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          Model lineups change monthly. Dates and prices are from {p.maker}'s announcements — check the sources at the
          end of the training section before relying on a specific figure.
        </p>
      </section>
  );
}

export function ModelWeights({ id }) {
  const p = PROFILES[id];
  if (!p) return null;
  const st = STATUS[p.weights.status];
  return (
      <section id="weights" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Model Weights</h2>
        <div className="rounded-2xl border border-white/10 bg-white/[0.04] p-5 sm:p-6">
          <div className="flex flex-wrap items-center gap-3 mb-4">
            <span className={`inline-flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm font-semibold ${st.box}`}>
              <span className={`w-2 h-2 rounded-full ${st.dot}`} />
              {st.label}
            </span>
            <span className="text-sm text-gray-300">{p.weights.licence}</span>
          </div>
          <p className="text-base text-gray-300 leading-relaxed m-0">{p.weights.detail}</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 mt-4">
          {[
            ["Can you download it?", p.weights.status === "closed" ? "No — API only" : p.weights.status === "open" ? "Yes" : "Some models"],
            ["Can you fine-tune it yourself?", p.weights.status === "closed" ? "Only via the vendor's API, if offered" : "Yes, with the weights"],
            ["Can you run it offline?", p.weights.status === "closed" ? "No" : "Yes, if it fits your hardware"],
          ].map(([q, a]) => (
            <div key={q} className="p-4 rounded-xl border border-white/10 bg-black/30">
              <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">{q}</div>
              <div className="text-sm font-semibold text-gray-100">{a}</div>
            </div>
          ))}
        </div>
      </section>
  );
}

/* When to choose it, how to reach it, a minimal call, and licence notes. */
export function ModelAccess({ id, name }) {
  const a = ACCESS[id];
  const p = PROFILES[id];
  if (!a || !p) return null;
  return (
    <>
      <section id="choose" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">When to Choose {name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07] p-5">
            <div className="text-sm font-semibold text-emerald-400 mb-2">A good fit</div>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5 m-0">
              {a.good.map((g) => <li key={g}>{g}</li>)}
            </ul>
          </div>
          <div className="rounded-xl border border-rose-500/25 bg-rose-500/[0.07] p-5">
            <div className="text-sm font-semibold text-rose-400 mb-2">Look elsewhere if</div>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5 m-0">
              {a.look.map((g) => <li key={g}>{g}</li>)}
            </ul>
          </div>
        </div>
      </section>

      <section id="access" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">How to Access {name}</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-5">
          {[["Direct API and apps", a.api], ["Cloud and hosts", a.hosts], ["Run it yourself", a.local]].map(([t, d]) => (
            <div key={t} className="p-4 rounded-xl border border-white/10 bg-black/30">
              <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">{t}</div>
              <div className="text-sm text-gray-200 leading-relaxed">{d}</div>
            </div>
          ))}
        </div>
        <div className="text-sm font-semibold text-white mb-2">A minimal call</div>
        <CodeBlock language={a.codeLang} code={a.code} maxHeight="340px" />
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          Model IDs and package APIs change often. Treat this as the shape of a call and copy the current model name from the
          provider's documentation. Availability on partner clouds varies by region and model.
        </p>
        <div className="mt-6 rounded-xl border border-amber-500/25 bg-amber-500/[0.07] p-5">
          <div className="text-sm font-semibold text-amber-400 mb-2">Licence notes ({p.weights.licence})</div>
          <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5 m-0">
            {a.licence.map((g) => <li key={g}>{g}</li>)}
          </ul>
          <p className="text-xs text-gray-500 mt-3 mb-0">A summary, not legal advice: read the licence text for the exact model and version you ship.</p>
        </div>
      </section>
    </>
  );
}

export function ModelPipeline({ id, name }) {
  const p = PROFILES[id];
  if (!p) return null;
  return (
      <section id="pipeline" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-2">Training Pipeline</h2>
        <p className="text-base text-gray-400 leading-relaxed max-w-3xl mb-5">
          How {name} goes from raw text to a finished model, stage by stage, as far as {p.maker} has disclosed. The
          starred stage is the one this family is known for. Compare every family on{" "}
          <a href="#/models/training" className="text-blue-400 hover:underline">How Models Are Trained</a>.
        </p>
        <Pipeline p={p} />

        {p.extra && (
          <div className="mt-4 p-4 rounded-xl border border-white/10 bg-white/5">
            <p className="text-sm text-gray-300 leading-relaxed m-0">{p.extra}</p>
          </div>
        )}

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
          <div className="p-5 rounded-xl border border-rose-500/25 bg-rose-500/[0.06]">
            <div className="text-sm font-semibold text-rose-300 mb-2">Not publicly disclosed</div>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1 m-0">
              {p.undisclosed.map((u) => (
                <li key={u}>{u}</li>
              ))}
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-white/10 bg-white/[0.04]">
            <div className="text-sm font-semibold text-gray-200 mb-2">Sources</div>
            <ul className="space-y-1.5 m-0 pl-0 list-none">
              {p.sources.map((s) => (
                <li key={s.url}>
                  <a href={s.url} target="_blank" rel="noopener noreferrer" className="text-sm text-blue-400 hover:underline">
                    {s.label} ↗
                  </a>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </section>
  );
}

export default function ModelProfile({ id, name }) {
  return (
    <>
      <ModelLineup id={id} />
      <ModelWeights id={id} />
      <ModelPipeline id={id} name={name} />
    </>
  );
}

import React, { useMemo, useState } from "react";
import { motion } from "framer-motion";
import { Link } from "react-router-dom";
import GuideLayout from "../components/GuideLayout";
import { GLOSSARY, CATEGORIES } from "../data/glossary";

const CAT_TONE = {
  Core:         { text: "text-gray-300",    chip: "border-gray-500/40 bg-gray-500/10" },
  Architecture: { text: "text-purple-300",  chip: "border-purple-500/40 bg-purple-500/10" },
  Training:     { text: "text-amber-300",   chip: "border-amber-500/40 bg-amber-500/10" },
  RAG:          { text: "text-emerald-300", chip: "border-emerald-500/40 bg-emerald-500/10" },
  Agents:       { text: "text-indigo-300",  chip: "border-indigo-500/40 bg-indigo-500/10" },
  Serving:      { text: "text-cyan-300",    chip: "border-cyan-500/40 bg-cyan-500/10" },
  ML:           { text: "text-rose-300",    chip: "border-rose-500/40 bg-rose-500/10" },
  "Data & Stats": { text: "text-teal-300",  chip: "border-teal-500/40 bg-teal-500/10" },
  "Safety & Ops": { text: "text-orange-300", chip: "border-orange-500/40 bg-orange-500/10" },
};

const catAnchor = (c) => "cat-" + c.toLowerCase().replace(/[^a-z0-9]+/g, "-");

function Highlight({ text, q }) {
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-indigo-500/30 text-indigo-100 rounded-sm px-0.5">{text.slice(i, i + q.length)}</mark>
      {text.slice(i + q.length)}
    </>
  );
}

export default function GlossaryIndex() {
  const [q, setQ] = useState("");
  const [cat, setCat] = useState("All");

  const results = useMemo(() => {
    const needle = q.trim().toLowerCase();
    return GLOSSARY.filter((g) => {
      if (cat !== "All" && g.c !== cat) return false;
      if (!needle) return true;
      return g.t.toLowerCase().includes(needle) || g.d.toLowerCase().includes(needle);
    }).sort((a, b) => a.t.localeCompare(b.t));
  }, [q, cat]);

  // group alphabetically when browsing, keep flat when searching
  const grouped = useMemo(() => {
    if (q.trim()) return null;
    const m = new Map();
    for (const g of results) {
      const k = g.t[0].toUpperCase();
      if (!m.has(k)) m.set(k, []);
      m.get(k).push(g);
    }
    return [...m.entries()].sort(([a], [b]) => a.localeCompare(b));
  }, [results, q]);

  const counts = useMemo(
    () => Object.fromEntries(CATEGORIES.map((c) => [c, GLOSSARY.filter((g) => g.c === c).length])),
    []
  );

  const Term = ({ g }) => {
    const tone = CAT_TONE[g.c] ?? CAT_TONE.Core;
    return (
      <motion.div
        initial={{ opacity: 0, y: 6 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.15 }}
        className="p-4 rounded-xl border border-white/10 bg-white/5 hover:border-white/25 transition-colors"
      >
        <div className="flex flex-wrap items-center gap-2 mb-1.5">
          <h3 className="font-bold text-white text-sm m-0">
            <Highlight text={g.t} q={q} />
          </h3>
          <span className={`text-[0.5625rem] font-bold uppercase tracking-wide px-1.5 py-0.5 rounded-full border ${tone.chip} ${tone.text}`}>
            {g.c}
          </span>
        </div>
        <p className="text-xs text-gray-400 leading-relaxed m-0">
          <Highlight text={g.d} q={q} />
        </p>
        {g.see && (
          <Link to={g.see} className="inline-block mt-2 text-[0.6875rem] text-blue-400 hover:underline">
            Read more →
          </Link>
        )}
      </motion.div>
    );
  };

  return (
    <GuideLayout
      title="AI Glossary"
      intro={`${GLOSSARY.length} terms you'll meet across this site, each in one or two sentences — and a link to where it's explained properly.`}
      // Each contents entry filters to its category and scrolls to the list.
      toc={CATEGORIES.map((c) => ({ label: c, hash: catAnchor(c) }))}
      onTocClick={(id) => {
        const c = CATEGORIES.find((x) => catAnchor(x) === id);
        if (c) {
          setQ("");
          setCat(c);
        }
      }}
    >
      {/* search + filter */}
      <div className="sticky top-16 z-20 -mx-1 px-1 py-3 bg-[#0a0a0a]/90 backdrop-blur-sm mb-4">
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Filter terms…"
          className="w-full bg-[#141414] border border-gray-800 rounded-xl px-4 py-3 text-sm text-gray-200 placeholder-gray-600 outline-none focus:border-indigo-500/60 mb-3"
        />
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setCat("All")}
            className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
              cat === "All" ? "bg-indigo-600 border-indigo-500 text-white" : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
            }`}
          >
            All <span className="opacity-60">{GLOSSARY.length}</span>
          </button>
          {CATEGORIES.map((c) => {
            const tone = CAT_TONE[c];
            return (
              <button
                key={c}
                onClick={() => setCat(c)}
                className={`px-3 py-1.5 rounded-lg border text-xs font-medium transition-colors ${
                  cat === c ? `${tone.chip} ${tone.text}` : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30"
                }`}
              >
                {c} <span className="opacity-60">{counts[c]}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Scroll targets for the contents entries (one per category, all at the list top). */}
      {CATEGORIES.map((c) => (
        <span key={c} id={catAnchor(c)} className="block scroll-mt-40" />
      ))}
      <div className="text-xs text-gray-500 mb-4">
        {results.length} term{results.length === 1 ? "" : "s"}
        {q.trim() && ` matching “${q.trim()}”`}
        {cat !== "All" && ` in ${cat}`}
      </div>

      {results.length === 0 && (
        <div className="p-8 text-center rounded-xl border border-white/10 bg-white/5">
          <div className="text-sm text-gray-400 mb-1">No terms match “{q}”.</div>
          <button onClick={() => { setQ(""); setCat("All"); }} className="text-xs text-blue-400 hover:underline">
            Clear filters
          </button>
        </div>
      )}

      {/* searching: flat list. browsing: A-Z groups */}
      {q.trim() ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {results.map((g) => <Term key={g.t} g={g} />)}
        </div>
      ) : (
        grouped?.map(([letter, items]) => (
          <section key={letter} id={letter.toLowerCase()} className="mb-8 scroll-mt-32">
            <div className="flex items-center gap-3 mb-3">
              <h2 className="text-xl font-black text-indigo-400 m-0">{letter}</h2>
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[0.625rem] text-gray-600">{items.length}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {items.map((g) => <Term key={g.t} g={g} />)}
            </div>
          </section>
        ))
      )}

      <div className="mt-8 p-4 rounded-xl border border-white/10 bg-white/5">
        <p className="text-xs text-gray-400 leading-relaxed m-0">
          Looking for a topic rather than a definition? Press <kbd className="font-mono text-gray-300">⌘K</kbd> to
          search every page and section, or start from a{" "}
          <Link to="/roadmaps" className="text-blue-400 hover:underline">learning path</Link>.
        </p>
      </div>
    </GuideLayout>
  );
}

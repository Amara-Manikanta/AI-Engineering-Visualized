import React, { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useLocation } from "react-router-dom";
import GuideLayout from "../components/GuideLayout";
import { TOOLS } from "./PlaygroundsIndex";
import { ANIMATIONS, StepPlayer } from "./AnimationsIndex";

/* --------------------------------------------------------------------------
   Playgrounds and Animations were two pages doing the same job: one concept,
   one interactive thing, one tab bar. The split was by implementation style
   (drag a slider vs press play), which is not a distinction a reader cares
   about. This is both, in one place, grouped by what you do with them.

   /playgrounds and /animations still route here so no existing link breaks;
   whichever one you arrive from decides the opening group.
-------------------------------------------------------------------------- */

const GROUPS = [
  {
    id: "play",
    name: "Play with it",
    blurb: "Change the inputs and watch the numbers move. Everything computes live in your browser.",
    accent: "text-emerald-400",
    dot: "bg-emerald-500",
    items: TOOLS.map((t) => ({ id: t.id, label: t.label, title: t.title, kind: "tool", Comp: t.Comp })),
  },
  {
    id: "watch",
    name: "Watch it run",
    blurb: "Processes that are hard to picture from prose, walked through one step at a time.",
    accent: "text-purple-400",
    dot: "bg-purple-500",
    items: ANIMATIONS.map((a) => ({ id: a.id, label: a.label, title: a.title, kind: "anim", anim: a })),
  },
];

const ALL = GROUPS.flatMap((g) => g.items);

export default function InteractiveIndex() {
  const { pathname } = useLocation();
  const startId = pathname.startsWith("/animations") ? ANIMATIONS[0].id : TOOLS[0].id;
  const [active, setActive] = useState(startId);

  // The roadmap still links to /playgrounds and /animations. All three routes
  // render this same component, so React keeps it mounted and the selection
  // would not move — sync it explicitly when the path changes.
  useEffect(() => {
    if (pathname.startsWith("/animations")) setActive(ANIMATIONS[0].id);
    else if (pathname.startsWith("/playgrounds")) setActive(TOOLS[0].id);
  }, [pathname]);

  const item = ALL.find((x) => x.id === active) ?? ALL[0];

  const toc = GROUPS.flatMap((g) => g.items.map((it) => ({ label: it.title, hash: it.id })));

  return (
    <GuideLayout
      title="Interactive"
      intro="Every hands-on tool and step-through animation on the site, in one place. Poke at the thing rather than reading about it."
      toc={toc}
      onTocClick={(id) => {
        if (ALL.some((x) => x.id === id)) setActive(id);
      }}
    >
      <div className="space-y-4 mb-8">
        {GROUPS.map((g) => (
          <div key={g.id}>
            <div className="flex items-center gap-2.5 mb-2.5">
              <span className={`w-2 h-2 rounded-full shrink-0 ${g.dot}`} />
              <h3 className={`text-xs font-bold uppercase tracking-wider ${g.accent}`}>{g.name}</h3>
              <div className="flex-1 h-px bg-white/10" />
              <span className="text-[0.625rem] text-gray-600 shrink-0">{g.items.length}</span>
            </div>
            <p className="text-xs text-gray-500 mb-3 max-w-2xl">{g.blurb}</p>
            <div className="flex flex-wrap gap-2">
              {g.items.map((it) => (
                <button
                  key={it.id}
                  onClick={() => setActive(it.id)}
                  className={`px-3.5 py-2 rounded-lg border text-sm font-medium transition-all ${
                    active === it.id
                      ? "bg-indigo-600 border-indigo-500 text-white shadow-[0_4px_14px_rgba(99,102,241,0.35)]"
                      : "bg-white/5 border-white/10 text-gray-400 hover:border-white/30 hover:text-gray-200"
                  }`}
                >
                  {it.label}
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Keyed so the panel re-mounts and replays its enter animation.
          Deliberately not wrapped in AnimatePresence mode="wait" — that
          combination freezes the swap on this codebase. */}
      <motion.section
        key={item.id}
        id={item.id}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.22 }}
        className="scroll-mt-24"
      >
        <h2 className="text-2xl font-bold text-white mb-4">{item.title}</h2>
        {item.kind === "tool" ? <item.Comp /> : <StepPlayer anim={item.anim} />}
      </motion.section>
    </GuideLayout>
  );
}

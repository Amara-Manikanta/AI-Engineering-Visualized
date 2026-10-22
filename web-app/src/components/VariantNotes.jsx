import React from "react";
import CodeBlock from "./CodeBlock";

/**
 * VariantNotes
 *
 * The RAG-variant pages were built as animations with no surrounding prose.
 * This renders the explanatory half — mechanism, tradeoffs, code, and where
 * the variant sits relative to the others — from a single data shape, so all
 * five pages read consistently.
 *
 * Props:
 *  - how        [{ t, d }]        the mechanism, step by step
 *  - good       [string]          where it earns its cost
 *  - bad        [string]          where it does not
 *  - cost       { latency, calls, complexity }
 *  - code       { language, source }
 *  - note       optional callout paragraph (JSX or string)
 *  - next       [{ label, path }] where to read on
 */
export default function VariantNotes({ how = [], good = [], bad = [], cost, code, note, next = [] }) {
  return (
    <>
      {how.length > 0 && (
        <section id="how" className="mb-16 scroll-mt-24">
          <h2 className="text-2xl font-bold text-white mb-4">How It Works</h2>
          <div className="space-y-3">
            {how.map((s, i) => (
              <div key={s.t} className="flex gap-4 p-4 rounded-xl border border-white/10 bg-white/5">
                <div className="shrink-0 w-8 h-8 rounded-lg bg-blue-500/15 border border-blue-500/30 text-blue-400 font-bold flex items-center justify-center text-sm">
                  {i + 1}
                </div>
                <div>
                  <div className="text-sm font-semibold text-white mb-1">{s.t}</div>
                  <p className="text-xs text-gray-400 leading-relaxed m-0">{s.d}</p>
                </div>
              </div>
            ))}
          </div>
        </section>
      )}

      {cost && (
        <section id="cost" className="mb-16 scroll-mt-24">
          <h2 className="text-2xl font-bold text-white mb-4">What It Costs</h2>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            {[
              ["Added latency", cost.latency, "border-amber-500/25 bg-amber-500/[0.07]", "text-amber-400"],
              ["Model calls per query", cost.calls, "border-rose-500/25 bg-rose-500/[0.07]", "text-rose-400"],
              ["Implementation effort", cost.complexity, "border-indigo-500/25 bg-indigo-500/[0.07]", "text-indigo-400"],
            ].map(([label, val, box, tone]) => (
              <div key={label} className={`p-5 rounded-xl border ${box}`}>
                <div className={`text-[0.625rem] uppercase tracking-wide mb-1.5 ${tone}`}>{label}</div>
                <div className="text-sm text-gray-200 leading-relaxed">{val}</div>
              </div>
            ))}
          </div>
        </section>
      )}

      {(good.length > 0 || bad.length > 0) && (
        <section id="when" className="mb-16 scroll-mt-24">
          <h2 className="text-2xl font-bold text-white mb-4">When to Use It</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
              <h4 className="text-emerald-400 font-semibold mb-2">Worth it when</h4>
              <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5 m-0">
                {good.map((g) => (
                  <li key={g}>{g}</li>
                ))}
              </ul>
            </div>
            <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
              <h4 className="text-rose-400 font-semibold mb-2">Skip it when</h4>
              <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5 m-0">
                {bad.map((b) => (
                  <li key={b}>{b}</li>
                ))}
              </ul>
            </div>
          </div>
          {note && (
            <div className="mt-5 p-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
              <p className="text-sm text-amber-200 leading-relaxed m-0">{note}</p>
            </div>
          )}
        </section>
      )}

      {code && (
        <section id="code" className="mb-16 scroll-mt-24">
          <h2 className="text-2xl font-bold text-white mb-4">In Code</h2>
          <CodeBlock language={code.language || "python"} code={code.source} />
        </section>
      )}

      {next.length > 0 && (
        <section id="next" className="mb-4 scroll-mt-24">
          <h2 className="text-2xl font-bold text-white mb-4">Read Next</h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
            {next.map((n) => (
              <a
                key={n.path}
                href={n.path}
                className="block p-4 rounded-xl border border-white/10 bg-white/5 hover:border-blue-500/50 hover:bg-white/[0.07] transition-colors no-underline"
              >
                <div className="text-sm font-semibold text-white mb-1">{n.label}</div>
                <p className="text-xs text-gray-400 leading-relaxed m-0">{n.why}</p>
              </a>
            ))}
          </div>
        </section>
      )}
    </>
  );
}

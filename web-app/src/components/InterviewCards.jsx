import { useState } from "react";

/**
 * InterviewCards — open questions with a model answer, shown as
 * think-first-then-reveal cards. The answer stays hidden until asked for,
 * because reading it before attempting one is the thing that makes it useless.
 */
export default function InterviewCards({ questions = [] }) {
  const [shown, setShown] = useState({});
  if (!questions.length) return null;

  const revealed = Object.values(shown).filter(Boolean).length;

  return (
    <section className="mt-4 mb-4">
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-1">
          <h2 className="text-xl font-bold text-white m-0">Interview questions</h2>
          <span className="text-xs font-mono text-gray-500">
            {revealed} / {questions.length} revealed
          </span>
        </div>
        <p className="text-sm text-gray-500 mb-6">Answer out loud first, then reveal and compare.</p>

        <div className="space-y-4">
          {questions.map((q, i) => (
            <div key={i} className="rounded-xl border border-white/10 bg-black/30 p-5">
              <div className="flex gap-3 mb-3">
                <span className="shrink-0 w-6 h-6 rounded-md bg-purple-500/20 text-purple-300 text-xs font-bold flex items-center justify-center mt-0.5">
                  {i + 1}
                </span>
                <div className="text-base font-medium text-gray-100 leading-relaxed">{q.q}</div>
              </div>
              {shown[i] ? (
                <div className="ml-9 p-4 rounded-lg border border-purple-500/25 bg-purple-500/[0.07]">
                  <div className="text-xs uppercase tracking-wide text-purple-400 mb-1.5">Model answer</div>
                  <p className="text-sm text-gray-300 leading-relaxed m-0 whitespace-pre-line">{q.answer}</p>
                </div>
              ) : (
                <button
                  onClick={() => setShown((s) => ({ ...s, [i]: true }))}
                  className="ml-9 px-4 py-2 rounded-lg text-sm font-semibold border border-purple-500/40 bg-purple-500/15 text-purple-200 hover:bg-purple-500/25 transition-colors"
                >
                  Reveal answer
                </button>
              )}
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

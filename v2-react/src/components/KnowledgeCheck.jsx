import React, { useMemo, useState } from "react";

/**
 * KnowledgeCheck
 *
 * A drop-in self-test for the end of a guide page. Multiple choice, one
 * correct answer, with an explanation revealed after answering — the
 * explanation is the point, so it shows whether you were right or wrong.
 *
 * Props:
 *  - questions  [{ q, options: [string], answer: <index>, why: string }]
 *  - title      optional heading override
 *  - id         section id, for pages with more than one check (default "check")
 *
 * Options are shown in a shuffled order, reshuffled on every reset, so the
 * position of the right answer carries no signal. `answer` still indexes the
 * option as written in the question bank.
 *
 * Deliberately has no persistence. This is a check on your own understanding,
 * not a score anyone records.
 */
function shuffled(n) {
  const a = Array.from({ length: n }, (_, i) => i);
  for (let i = n - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

export default function KnowledgeCheck({ questions = [], title = "Check yourself", id = "check" }) {
  const [picked, setPicked] = useState({});
  const [round, setRound] = useState(0);
  // One display order per question; a new round reshuffles. Keyed on the
  // question text, not the array, because callers often pass a freshly
  // filtered array each render and that must not reshuffle mid-answer.
  const sig = questions.map((q) => q.q).join("\u0000");
  const orders = useMemo(
    () => questions.map((q) => shuffled(q.options.length)),
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `sig` and `round` are the real inputs
    [sig, round],
  );

  if (!questions.length) return null;

  const answered = Object.keys(picked).length;
  const correct = questions.reduce((a, q, i) => a + (picked[i] === q.answer ? 1 : 0), 0);
  const done = answered === questions.length;

  return (
    <section className="mt-4 mb-4 scroll-mt-24" id={id}>
      <div className="rounded-2xl border border-white/10 bg-white/[0.03] p-6">
        <div className="flex flex-wrap items-baseline justify-between gap-3 mb-1">
          <h2 className="text-xl font-bold text-white m-0">{title}</h2>
          {answered > 0 && (
            <span className="text-xs font-mono text-gray-500">
              {correct} / {questions.length} correct
            </span>
          )}
        </div>
        <p className="text-sm text-gray-500 mb-6">
          Nothing is recorded. Pick an answer to see why it is right or wrong.
        </p>

        <div className="space-y-6">
          {questions.map((q, qi) => {
            const choice = picked[qi];
            const hasAnswered = choice !== undefined;
            return (
              <div key={qi}>
                <div className="flex gap-3 mb-3">
                  <span className="shrink-0 w-6 h-6 rounded-md bg-white/10 text-gray-400 text-xs font-bold flex items-center justify-center mt-0.5">
                    {qi + 1}
                  </span>
                  <div className="text-sm font-medium text-gray-100 leading-relaxed">{q.q}</div>
                </div>

                <div className="space-y-2 ml-9">
                  {orders[qi].map((oi, pos) => {
                    const opt = q.options[oi];
                    const isCorrect = oi === q.answer;
                    const isPicked = choice === oi;
                    let cls =
                      "border-white/10 bg-white/[0.03] text-gray-300 hover:border-white/25 hover:bg-white/[0.06]";
                    if (hasAnswered && isCorrect)
                      cls = "border-emerald-500/50 bg-emerald-500/[0.12] text-emerald-100";
                    else if (hasAnswered && isPicked)
                      cls = "border-rose-500/50 bg-rose-500/[0.12] text-rose-100";
                    else if (hasAnswered) cls = "border-white/5 bg-white/[0.02] text-gray-600";

                    return (
                      <button
                        key={oi}
                        disabled={hasAnswered}
                        onClick={() => setPicked((p) => ({ ...p, [qi]: oi }))}
                        className={`w-full text-left px-4 py-2.5 rounded-xl border text-sm transition-colors flex gap-3 items-start ${cls} ${
                          hasAnswered ? "cursor-default" : "cursor-pointer"
                        }`}
                      >
                        <span className="shrink-0 font-mono text-xs opacity-60 mt-0.5">
                          {String.fromCharCode(65 + pos)}
                        </span>
                        <span className="leading-relaxed">{opt}</span>
                        {hasAnswered && isCorrect && <span className="ml-auto shrink-0">✓</span>}
                        {hasAnswered && isPicked && !isCorrect && <span className="ml-auto shrink-0">✗</span>}
                      </button>
                    );
                  })}
                </div>

                {hasAnswered && (
                  <div className="ml-9 mt-3 p-4 rounded-xl border border-white/10 bg-black/30">
                    <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1.5">
                      {choice === q.answer ? "Correct" : "Not quite"}
                    </div>
                    <p className="text-xs text-gray-300 leading-relaxed m-0">{q.why}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {done && (
          <div className="mt-6 pt-5 border-t border-white/10 flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-gray-400 m-0">
              {correct === questions.length
                ? "All correct. The explanations are still worth a read — several of them cover the edge cases."
                : `${correct} of ${questions.length}. The ones you missed are usually the ones worth re-reading above.`}
            </p>
            <button
              onClick={() => {
                setPicked({});
                setRound((r) => r + 1);
              }}
              className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-white/15 bg-white/5 text-gray-300 hover:text-white transition-colors shrink-0"
            >
              Try again (reshuffled)
            </button>
          </div>
        )}
      </div>
    </section>
  );
}

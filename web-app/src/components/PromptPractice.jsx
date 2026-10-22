import React, { useEffect, useMemo, useRef, useState } from "react";
import { Panel, Segmented, Metric, Button } from "./VizKit";
import { SCENARIOS, buildResponse, tier } from "../lib/promptPractice";
import useReducedMotion from "../lib/useReducedMotion";

/* ---------------------------------------------------------------------------
   Prompt practice. Write a prompt, press Run, and watch a simulated reply type
   itself out while a checklist of what your prompt did (and missed) ticks in.
   No model is called: the reply is assembled from your rubric results.
--------------------------------------------------------------------------- */

export default function PromptPractice() {
  const [sid, setSid] = useState(SCENARIOS[0].id);
  const scenario = SCENARIOS.find((s) => s.id === sid);
  const [prompt, setPrompt] = useState("");
  const [run, setRun] = useState(null); // { text lines, asList, ev, id }
  const [typed, setTyped] = useState(0);
  const [ticked, setTicked] = useState(0);
  const [best, setBest] = useState({});
  const [attempts, setAttempts] = useState({});
  const [showExample, setShowExample] = useState(false);
  const timers = useRef([]);
  const reduced = useReducedMotion();

  const clear = () => {
    timers.current.forEach((t) => clearInterval(t));
    timers.current = [];
  };
  useEffect(() => clear, []);

  const pick = (id) => {
    clear();
    setSid(id);
    setPrompt("");
    setRun(null);
    setShowExample(false);
  };

  const fullText = useMemo(() => (run ? run.lines.join("\n") : ""), [run]);

  const go = () => {
    clear();
    const r = buildResponse(scenario, prompt);
    setRun({ ...r, id: Date.now() });
    if (reduced) {
      // No animation: show the whole checklist and reply at once.
      setTyped(r.lines.join("\n").length);
      setTicked(r.ev.total);
      setAttempts((a) => ({ ...a, [sid]: (a[sid] || 0) + 1 }));
      setBest((b) => ({ ...b, [sid]: Math.max(b[sid] || 0, r.ev.passed) }));
      return;
    }
    setTyped(0);
    setTicked(0);
    setAttempts((a) => ({ ...a, [sid]: (a[sid] || 0) + 1 }));
    setBest((b) => ({ ...b, [sid]: Math.max(b[sid] || 0, r.ev.passed) }));
    // Tick the checklist one row at a time, then type the reply.
    let n = 0;
    const t1 = setInterval(() => {
      n += 1;
      setTicked(n);
      if (n >= r.ev.total) clearInterval(t1);
    }, 220);
    const total = r.lines.join("\n").length;
    let c = 0;
    const t2 = setInterval(() => {
      c += 3;
      setTyped(Math.min(total, c));
      if (c >= total) clearInterval(t2);
    }, 22);
    timers.current = [t1, t2];
  };

  const done = run && ticked >= run.ev.total;
  const [label, tone] = run ? tier(run.ev.passed / run.ev.total) : ["Not run yet", "indigo"];
  const shownText = run ? fullText.slice(0, typed) : "";
  const shownLines = shownText.split("\n");
  const typing = run && typed < fullText.length;

  return (
    <Panel tone="purple" title="Prompt practice studio">
      <div className="mb-4">
        <Segmented tone="purple" value={sid} onChange={pick} options={SCENARIOS.map((s) => ({ v: s.id, label: s.title }))} />
      </div>

      <div className="rounded-xl border border-white/10 bg-black/40 p-4 mb-4">
        <div className="text-xs uppercase tracking-wide text-purple-300 mb-1">Your job</div>
        <p className="text-sm text-gray-200 leading-relaxed m-0 mb-3">{scenario.goal}</p>
        <div className="text-xs uppercase tracking-wide text-gray-500 mb-1">The material you have to work with</div>
        <p className="text-xs font-mono text-gray-300 leading-relaxed m-0 p-3 rounded-lg bg-black/40 border border-white/10">{scenario.input}</p>
      </div>

      <label className="block mb-2">
        <span className="text-xs uppercase tracking-wide text-gray-500">Write your prompt</span>
        <textarea
          value={prompt}
          onChange={(e) => setPrompt(e.target.value)}
          rows={7}
          spellCheck={false}
          placeholder="Try something short first, run it, then improve it using the checklist."
          className="w-full mt-1 bg-black/50 border border-white/15 rounded-xl p-3 font-mono text-xs sm:text-sm text-gray-100 leading-relaxed"
        />
      </label>
      <div className="flex flex-wrap gap-2 mb-5">
        <Button tone="purple" onClick={go} disabled={!prompt.trim()}>▶ Run prompt</Button>
        <Button tone="indigo" onClick={() => setPrompt((p) => p.replace(/\s+$/, "") + scenario.insert(scenario.input))}>{scenario.insertLabel}</Button>
        <Button tone="indigo" onClick={() => { clear(); setPrompt(""); setRun(null); }}>Clear</Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-4">
        <div className="rounded-xl border border-white/10 bg-black/40 p-4 min-h-[15rem]">
          <div className="flex items-center justify-between gap-2 mb-2">
            <div className="text-xs uppercase tracking-wide text-gray-500">Simulated reply</div>
            {typing && <span className="text-[0.6875rem] text-purple-300 animate-pulse">writing…</span>}
          </div>
          {!run ? (
            <p className="text-sm text-gray-600 m-0">Run your prompt to see what a model would likely produce from it.</p>
          ) : run.asList ? (
            <ul className="list-disc pl-5 text-sm text-gray-100 space-y-1.5 m-0">
              {shownLines.map((l, i) => l && <li key={i}>{l}</li>)}
            </ul>
          ) : (
            <p className="text-sm text-gray-100 leading-relaxed m-0 whitespace-pre-line">{shownText}</p>
          )}
        </div>

        <div className="rounded-xl border border-white/10 bg-black/40 p-4">
          <div className="text-xs uppercase tracking-wide text-gray-500 mb-2">What your prompt did</div>
          <ul className="space-y-1.5 list-none p-0 m-0">
            {scenario.checks.map((c, i) => {
              const r = run && run.ev.results[i];
              const shown = run && i < ticked;
              return (
                <li
                  key={c.id}
                  className={`rounded-lg border px-3 py-1.5 text-xs leading-relaxed transition-all duration-300 ${
                    !shown ? "border-white/10 bg-white/[0.03] text-gray-500" : r.pass ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-100" : "border-rose-500/40 bg-rose-500/10 text-rose-100"
                  }`}
                >
                  <span className="mr-1.5">{!shown ? "○" : r.pass ? "✔" : "✘"}</span>
                  {c.label}
                  {shown && !r.pass && <div className="text-[0.6875rem] text-rose-200/80 mt-0.5">Hint: {c.hint}</div>}
                </li>
              );
            })}
          </ul>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2 mb-4">
        <Metric label="This run" value={run && done ? `${run.ev.passed} / ${run.ev.total}` : run ? "…" : "—"} tone={tone} sub={run && done ? label : ""} />
        <Metric label="Best so far" value={best[sid] !== undefined ? `${best[sid]} / ${scenario.checks.length}` : "—"} tone="emerald" />
        <Metric label="Attempts" value={attempts[sid] || 0} />
        <Metric label="Prompt length" value={`${prompt.trim() ? prompt.trim().split(/\s+/).length : 0} words`} />
      </div>
      <div className="h-2 rounded bg-white/5 overflow-hidden mb-4">
        <div className="h-full bg-purple-400/80 rounded" style={{ width: `${run && done ? (run.ev.passed / run.ev.total) * 100 : 0}%`, transition: "width 500ms" }} />
      </div>

      <div className="flex flex-wrap items-center gap-2 mb-2">
        <Button tone="amber" onClick={() => setShowExample((v) => !v)}>{showExample ? "Hide" : "Show"} a strong example prompt</Button>
      </div>
      {showExample && (
        <pre className="text-xs font-mono text-amber-100 bg-amber-500/10 border border-amber-500/30 rounded-xl p-3 whitespace-pre-wrap leading-relaxed m-0 mb-2">{scenario.exemplar}</pre>
      )}
      <p className="text-xs text-gray-500 leading-relaxed mt-3 mb-0">
        How it works: there is no AI model behind this box. Each scenario has six checks for things good prompts for that job
        do (name the task, the reader, a length, the format, what to include, and where the source text sits), and the reply is
        assembled from a good or a poor line per check. It is honest about being a simulation, but the lesson is real:
        each thing you add changes what comes back. When you try this for real, run the prompt on a model several times, because
        one good reply can be luck.
      </p>
    </Panel>
  );
}

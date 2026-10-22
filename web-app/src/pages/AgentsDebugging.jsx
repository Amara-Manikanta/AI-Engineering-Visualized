import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import CodeBlock from "../components/CodeBlock";

/* --------------------------------------------------------------------------
   Compounding reliability is the argument this page is built on, and it is a
   single line of arithmetic: p^n. Most people's intuition for it is wrong,
   so the page computes it.
-------------------------------------------------------------------------- */

function ReliabilityPanel() {
  const [stepAcc, setStepAcc] = useState(95);
  const [steps, setSteps] = useState(10);

  const p = stepAcc / 100;
  const endToEnd = Math.pow(p, steps);

  // What per-step accuracy would you need for 95% overall at this length?
  const needed = Math.pow(0.95, 1 / steps);

  const bars = useMemo(
    () => Array.from({ length: steps }, (_, i) => Math.pow(p, i + 1)),
    [p, steps]
  );

  return (
    <div className="rounded-2xl border border-rose-500/25 bg-rose-500/[0.07] p-6">
      <h3 className="text-rose-400 font-bold mb-1">Why long agent runs fail</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        An agent chains steps, and errors compound multiplicatively. A step that works 95% of the time sounds fine
        until you run ten of them in sequence.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-5 mb-5">
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Per-step success rate</span>
          <input
            type="range"
            min="70"
            max="99.9"
            step="0.1"
            value={stepAcc}
            onChange={(e) => setStepAcc(Number(e.target.value))}
            className="w-full mt-2 accent-rose-500"
          />
          <span className="font-mono text-rose-300 text-sm">{stepAcc.toFixed(1)}%</span>
        </label>
        <label className="block">
          <span className="text-xs uppercase tracking-wide text-gray-500">Steps in the run</span>
          <input
            type="range"
            min="1"
            max="40"
            step="1"
            value={steps}
            onChange={(e) => setSteps(Number(e.target.value))}
            className="w-full mt-2 accent-rose-500"
          />
          <span className="font-mono text-rose-300 text-sm">{steps}</span>
        </label>
      </div>

      <div className="rounded-xl bg-black/40 border border-white/10 p-3 mb-4">
        <div className="flex items-end gap-[2px] h-24">
          {bars.map((b, i) => (
            <div
              key={i}
              className="flex-1 bg-gradient-to-t from-rose-600/70 to-rose-400/70 rounded-t-sm min-w-[2px]"
              style={{ height: `${Math.max(b * 100, 0.5)}%` }}
              title={`after step ${i + 1}: ${(b * 100).toFixed(1)}%`}
            />
          ))}
        </div>
        <div className="text-[0.625rem] text-gray-600 font-mono mt-2 text-center">
          probability the run is still correct, step by step
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
        <div className="p-4 rounded-xl bg-black/40 border border-rose-500/30">
          <div className="text-[0.625rem] uppercase tracking-wide text-rose-400 mb-1">End-to-end success</div>
          <div className="text-2xl font-bold font-mono text-rose-300">{(endToEnd * 100).toFixed(1)}%</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">
            {p.toFixed(3)}<sup>{steps}</sup>
          </div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-white/10">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Runs that fail</div>
          <div className="text-2xl font-bold font-mono text-gray-300">{((1 - endToEnd) * 100).toFixed(1)}%</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">at least one bad step</div>
        </div>
        <div className="p-4 rounded-xl bg-black/40 border border-emerald-500/25">
          <div className="text-[0.625rem] uppercase tracking-wide text-emerald-400 mb-1">Needed for 95% overall</div>
          <div className="text-2xl font-bold font-mono text-emerald-300">{(needed * 100).toFixed(2)}%</div>
          <div className="text-[0.6875rem] text-gray-600 mt-1">per step, at {steps} steps</div>
        </div>
      </div>

      <p className="text-xs text-gray-500 mt-4 leading-relaxed">
        Read the third number carefully. It is the whole reason agent engineering is mostly about shortening runs,
        checking intermediate results, and making steps retryable — rather than about finding a better prompt.
      </p>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const FAILURES = [
  {
    n: "Tool-call malformation",
    sym: "The agent calls a tool with the wrong shape and the error confuses it further.",
    fix: "Validate arguments against the schema before executing, and return a structured error the model can act on. 'Field date must be YYYY-MM-DD, got March' beats a stack trace.",
    box: "border-amber-500/25 bg-amber-500/[0.07]",
    label: "text-amber-400",
  },
  {
    n: "Infinite loops",
    sym: "The same tool called with the same arguments, forever, with slight rewording.",
    fix: "Hash each tool call and its arguments. On the second identical call, inject a message saying it already ran and what it returned. Cap total steps regardless.",
    box: "border-rose-500/25 bg-rose-500/[0.07]",
    label: "text-rose-400",
  },
  {
    n: "Context overflow",
    sym: "Long runs blow the window; the agent forgets its own goal mid-task.",
    fix: "Summarise older turns, keep the original objective pinned at the top of every prompt, and store intermediate results outside the context in a scratchpad the agent can query.",
    box: "border-blue-500/25 bg-blue-500/[0.07]",
    label: "text-blue-400",
  },
  {
    n: "Goal drift",
    sym: "The agent solves a plausible adjacent problem and reports success.",
    fix: "Re-state the objective in the system prompt on every turn, and add an explicit completion check that compares the result against the original request.",
    box: "border-purple-500/25 bg-purple-500/[0.07]",
    label: "text-purple-400",
  },
  {
    n: "Silent wrong answers",
    sym: "The run completes, the output looks right, and it is wrong. The worst one.",
    fix: "Assert on outputs, not on completion. Verify with a second method where you can — a cheap deterministic check beats a second model opinion.",
    box: "border-indigo-500/25 bg-indigo-500/[0.07]",
    label: "text-indigo-400",
  },
  {
    n: "Cascading hallucination",
    sym: "An early invented fact gets treated as established and every later step builds on it.",
    fix: "Ground each step in retrieved or tool-returned data and carry provenance forward. Check facts at the point they enter state, not at the end.",
    box: "border-emerald-500/25 bg-emerald-500/[0.07]",
    label: "text-emerald-400",
  },
];

export default function AgentsDebugging() {
  const toc = [
    { label: "Why It Is Different", hash: "different" },
    { label: "Compounding Failure", hash: "compounding" },
    { label: "Six Failure Modes", hash: "failures" },
    { label: "Tracing", hash: "tracing" },
    { label: "Making Runs Reproducible", hash: "repro" },
    { label: "Evaluation", hash: "eval" },
    { label: "In Code", hash: "code" },
    { label: "A Checklist", hash: "checklist" },
  ];

  return (
    <GuideLayout
      title="Debugging Agents"
      intro="Agents fail in ways ordinary programs do not: non-deterministically, mid-run, and often without raising anything. This is the observability you need before shipping one."
      toc={toc}
    >
      <section id="different" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Why It Is Different</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          A stack trace tells you where a program broke. An agent that produces a confidently wrong answer never
          broke — every call returned 200 and the loop terminated cleanly. The bug is in a decision, and decisions do
          not appear in logs unless you put them there.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            ["Non-deterministic", "The same input can take a different path each run. A bug that reproduces one time in five is normal, not a fluke."],
            ["Failures are silent", "No exception is raised when an agent misreads a result. Success and plausible-but-wrong are indistinguishable from the outside."],
            ["The state is a transcript", "There is no debugger for a conversation. What you can inspect is the sequence of prompts, tool calls, and results — if you captured them."],
          ].map(([t, d]) => (
            <div key={t} className="p-5 rounded-xl border border-white/10 bg-white/5">
              <div className="text-sm font-semibold text-white mb-2">{t}</div>
              <p className="text-xs text-gray-400 leading-relaxed m-0">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="compounding" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Compounding Failure</h2>
        <ReliabilityPanel />
      </section>

      <section id="failures" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Six Failure Modes</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {FAILURES.map((f) => (
            <div key={f.n} className={`p-5 rounded-xl border ${f.box}`}>
              <div className={`font-semibold mb-2 ${f.label}`}>{f.n}</div>
              <p className="text-xs text-gray-400 leading-relaxed mb-2.5">
                <span className="text-gray-500 uppercase tracking-wide text-[0.625rem]">Looks like </span>
                {f.sym}
              </p>
              <p className="text-xs text-gray-300 leading-relaxed m-0">
                <span className="text-gray-500 uppercase tracking-wide text-[0.625rem]">Fix </span>
                {f.fix}
              </p>
            </div>
          ))}
        </div>
      </section>

      <section id="tracing" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Tracing</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Tracing is not optional for agents in the way it is arguably optional elsewhere. Without a recorded run you
          cannot answer the only question that matters after a failure: what did the model actually see?
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm font-semibold text-white mb-2">Capture per step</div>
            <ul className="text-xs text-gray-400 space-y-1.5 list-disc pl-5 m-0">
              <li>The exact rendered prompt, after templating.</li>
              <li>Model, temperature, seed, and token counts.</li>
              <li>Tool name, arguments, result, and latency.</li>
              <li>The state diff the step produced.</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm font-semibold text-white mb-2">Capture per run</div>
            <ul className="text-xs text-gray-400 space-y-1.5 list-disc pl-5 m-0">
              <li>A trace id threaded through every call.</li>
              <li>Total cost and wall-clock duration.</li>
              <li>Termination reason — completed, capped, or errored.</li>
              <li>The final output alongside the original request.</li>
            </ul>
          </div>
        </div>
        <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>Log the rendered prompt, not the template.</strong> Nearly every confusing agent bug turns out to
            be something unexpected in the interpolated content — a truncated document, an empty list rendering as
            "None", a tool result that was an error string. You cannot see any of that in the template.
          </p>
        </div>
      </section>

      <section id="repro" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Making Runs Reproducible</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          You cannot fix what you cannot re-run. Full determinism is not achievable with a hosted model, but you can
          get close enough to isolate a bug.
        </p>
        <div className="space-y-3">
          {[
            ["Pin everything pinnable", "Model version, temperature 0, a fixed seed where the provider supports one. A floating model alias means yesterday's bug may not exist today."],
            ["Record and replay tool calls", "Cache tool responses keyed by arguments. Replaying a trace against recorded tools isolates whether the bug was the model or the world."],
            ["Checkpoint state per step", "If the framework supports it, use it. Resuming from step 7 beats re-running six good steps to reach the broken one."],
            ["Keep the failing trace as a test", "Every real failure becomes a regression case. This is the only way an agent system gets more reliable over time rather than differently unreliable."],
          ].map(([t, d], i) => (
            <div key={t} className="flex gap-4 p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="shrink-0 w-8 h-8 rounded-lg bg-indigo-500/15 border border-indigo-500/30 text-indigo-400 font-bold flex items-center justify-center text-sm">
                {i + 1}
              </div>
              <div>
                <div className="text-sm font-semibold text-white mb-1">{t}</div>
                <p className="text-xs text-gray-400 leading-relaxed m-0">{d}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      <section id="eval" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Evaluation</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Final-answer accuracy is the number everyone reports and the least useful one for debugging, because it
          cannot tell you which step went wrong. Score the trajectory as well as the destination.
        </p>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-left">
                <th className="px-4 py-3 font-semibold text-white">Metric</th>
                <th className="px-4 py-3 font-semibold text-white">What it tells you</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                ["Task success rate", "The headline. Necessary, and on its own it diagnoses nothing."],
                ["Tool-selection accuracy", "Did it reach for the right tool? Wrong tool choice is the most common single-step failure."],
                ["Step efficiency", "Steps taken against the minimum needed. A rising number is the earliest signal of confusion."],
                ["Recovery rate", "When a step fails, how often does the agent recover? This separates a fragile agent from a robust one more than raw success does."],
                ["Cost and latency per task", "The constraint that decides whether any of it ships."],
                ["Termination reason mix", "What share of runs hit the step cap rather than finishing? A high number means your cap is masking a loop."],
              ].map(([n, d]) => (
                <tr key={n} className="border-t border-white/10">
                  <td className="px-4 py-3 text-xs font-semibold text-indigo-300 whitespace-nowrap align-top">{n}</td>
                  <td className="px-4 py-3 text-xs leading-relaxed">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="code" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">In Code</h2>
        <CodeBlock
          language="python"
          code={`import hashlib, json, logging, time

log = logging.getLogger("agent")

class Guard:
    """Loop detection, step capping, and a trace — about 40 lines of insurance."""

    def __init__(self, trace_id, max_steps=25, max_seconds=180, max_cost=1.00):
        self.trace_id, self.seen, self.step = trace_id, {}, 0
        self.max_steps, self.deadline = max_steps, time.time() + max_seconds
        self.max_cost, self.cost = max_cost, 0.0

    def check(self):
        if self.step >= self.max_steps:
            raise StopIteration(f"step cap {self.max_steps} reached")
        if time.time() > self.deadline:
            raise StopIteration("wall-clock deadline exceeded")
        if self.cost > self.max_cost:
            raise StopIteration(f"cost cap \${self.max_cost} exceeded")

    def call_tool(self, name, args, fn):
        self.check()
        self.step += 1

        # Identical call already made? Tell the model instead of running it again.
        key = hashlib.sha256(
            f"{name}:{json.dumps(args, sort_keys=True)}".encode()
        ).hexdigest()
        if key in self.seen:
            log.warning("trace=%s repeat call to %s", self.trace_id, name)
            return {"repeat": True, "previous_result": self.seen[key]}

        t0 = time.time()
        try:
            result = fn(**args)
        except Exception as e:
            # Return a structured error the model can act on, don't just raise.
            result = {"error": type(e).__name__, "detail": str(e)[:400]}

        self.seen[key] = result
        log.info(
            "trace=%s step=%d tool=%s ms=%d args=%s",
            self.trace_id, self.step, name, (time.time() - t0) * 1000,
            json.dumps(args)[:300],
        )
        return result`}
        />
      </section>

      <section id="checklist" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">A Checklist Before Shipping</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            "Hard caps on steps, wall-clock time, and spend — all three, not one.",
            "Every tool call and rendered prompt written to a trace with a shared id.",
            "Repeat-call detection that tells the model rather than silently re-running.",
            "Tool errors returned as structured data the model can read and act on.",
            "The objective restated in the system prompt on every single turn.",
            "A completion check that compares output against the original request.",
            "A regression suite built from real failed traces, run on every change.",
            "An alert on the share of runs that terminate by hitting a cap.",
          ].map((c) => (
            <div key={c} className="flex gap-3 p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/[0.06]">
              <span className="text-emerald-400 shrink-0">✓</span>
              <span className="text-sm text-gray-300 leading-relaxed">{c}</span>
            </div>
          ))}
        </div>
        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            Related: <a href="#/agents/frameworks" className="text-blue-400 hover:underline">framework comparison</a>{" "}
            for which ones give you tracing and checkpointing for free, and{" "}
            <a href="#/rag/evaluation" className="text-blue-400 hover:underline">RAG evaluation</a> for the retrieval
            half of the measurement problem.
          </p>
        </div>
      </section>
      <KnowledgeCheck questions={questionsFor("agents-core")} />
    </GuideLayout>
  );
}

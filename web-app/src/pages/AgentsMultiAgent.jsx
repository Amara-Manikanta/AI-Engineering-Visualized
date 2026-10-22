import React, { useState } from 'react';
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import { motion } from "framer-motion";

const toc = [
  { label: "Why Multiple Agents?", hash: "overview" },
  { label: "Do You Actually Need It?", hash: "need-it" },
  { label: "Coordination Patterns", hash: "patterns" },
  { label: "Context Engineering", hash: "context" },
  { label: "Communication Protocols", hash: "comms" },
  { label: "Building One (code)", hash: "code" },
  { label: "The Cost Multiplier", hash: "cost" },
  { label: "Failure Modes", hash: "failure-modes" },
  { label: "Production Checklist", hash: "checklist" },
];

const patterns = [
  {
    id: 1, label: '➡️ Sequential', name: 'Sequential Pipeline',
    desc: 'Agents run one after another, each consuming the previous one\'s output. Like a Unix pipe — Researcher → Writer → Editor.',
    when: 'The work has genuinely ordered stages, and each stage needs the previous one finished.',
    pros: ['Simple to reason about and debug', 'Each agent has a narrow, well-tested job', 'Easy to insert human review between stages'],
    cons: ['Total latency is the sum of every stage', 'A failure anywhere blocks the whole pipeline'],
  },
  {
    id: 2, label: '🔀 Parallel', name: 'Parallel Fan-Out / Fan-In',
    desc: 'Independent agents run simultaneously on different sub-tasks, then a final step merges their results — e.g. 3 research agents covering different sources, aggregated by a summarizer.',
    when: 'Sub-tasks are truly independent and you care about wall-clock latency.',
    pros: ['Much faster wall-clock time for independent work', 'Isolated failures don\'t block unrelated branches'],
    cons: ['Merge/aggregation logic adds complexity', 'Harder to keep agents from duplicating work'],
  },
  {
    id: 3, label: '🏗️ Hierarchical', name: 'Orchestrator–Worker',
    desc: 'A manager agent breaks a goal into sub-tasks and delegates each to a specialized worker subagent, then reviews and combines their results.',
    when: 'The goal is open-ended and you cannot enumerate the steps in advance.',
    pros: ['Scales to complex, open-ended goals', 'Workers can use different models/tools/permissions'],
    cons: ['Orchestrator becomes a single point of failure', 'Context has to be carefully passed down and back up'],
  },
  {
    id: 4, label: '⚖️ Debate', name: 'Debate / Consensus',
    desc: 'Multiple agents independently answer the same question, then critique each other\'s reasoning before a final vote or judge model picks (or synthesizes) the best answer.',
    when: 'Accuracy matters far more than cost — high-stakes or ambiguous judgement calls.',
    pros: ['Catches individual model mistakes and hallucinations', 'Higher-confidence answers on ambiguous questions'],
    cons: ['Most expensive pattern — multiplies token cost', 'Can converge on a confidently wrong shared answer'],
  },
  {
    id: 5, label: '🔍 Reflection', name: 'Generator–Critic',
    desc: 'One agent produces the work, a second evaluates it against explicit criteria and returns feedback. The generator revises, and the loop repeats until the critic passes it or a retry limit is hit.',
    when: 'Output quality is checkable against a rubric — code that must compile, writing with a style guide.',
    pros: ['Big quality lift with only two roles', 'The critic can run cheaper checks (tests, linters) before the LLM'],
    cons: ['Needs a hard loop limit or it can ping-pong forever', 'A weak critic rubber-stamps bad output'],
  },
  {
    id: 6, label: '🕸️ Network', name: 'Network / Swarm',
    desc: 'No central manager — any agent can hand off directly to any other agent based on who is best suited to the next step. Control flows peer to peer.',
    when: 'Routing depends on content discovered mid-task, like a support triage that bounces between specialists.',
    pros: ['Very flexible routing without a bottleneck orchestrator', 'Agents can specialize deeply'],
    cons: ['Hardest to debug — control flow is emergent', 'Easy to build accidental infinite handoff cycles'],
  },
];

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } };

const Node = ({ children, tone = 'gray' }) => {
  const tones = {
    gray: 'bg-white/10 border-white/15 text-gray-300',
    indigo: 'bg-indigo-600/30 border-indigo-500/50 text-indigo-300',
    emerald: 'bg-emerald-600/30 border-emerald-500/50 text-emerald-300',
    purple: 'bg-purple-600/30 border-purple-500/50 text-purple-300',
    amber: 'bg-amber-600/30 border-amber-500/50 text-amber-300',
    rose: 'bg-rose-600/30 border-rose-500/50 text-rose-300',
    cyan: 'bg-cyan-600/30 border-cyan-500/50 text-cyan-300',
  };
  return <span className={`px-3 py-2 rounded-lg border ${tones[tone]}`}>{children}</span>;
};

function PatternDiagram({ id }) {
  if (id === 1) {
    return (
      <div className="flex flex-wrap items-center justify-center gap-2 text-sm font-mono">
        {['Researcher', 'Writer', 'Editor'].map((s, i, arr) => (
          <React.Fragment key={s}>
            <Node tone="indigo">{s}</Node>
            {i < arr.length - 1 && <span className="text-indigo-400">→</span>}
          </React.Fragment>
        ))}
      </div>
    );
  }
  if (id === 2) {
    return (
      <div className="flex flex-col items-center gap-3 text-sm font-mono">
        <Node>Task</Node>
        <div className="flex gap-2 flex-wrap justify-center">
          {['Agent A', 'Agent B', 'Agent C'].map((s) => <Node key={s} tone="emerald">{s}</Node>)}
        </div>
        <span className="text-emerald-400">↓ merge ↓</span>
        <Node>Aggregator</Node>
      </div>
    );
  }
  if (id === 3) {
    return (
      <div className="flex flex-col items-center gap-3 text-sm font-mono">
        <Node tone="purple">Orchestrator</Node>
        <span className="text-purple-400">↓ delegates ↓</span>
        <div className="flex gap-2 flex-wrap justify-center">
          {['Worker 1', 'Worker 2', 'Worker 3'].map((s) => <Node key={s}>{s}</Node>)}
        </div>
        <span className="text-purple-400 text-xs">↑ results roll back up ↑</span>
      </div>
    );
  }
  if (id === 4) {
    return (
      <div className="flex flex-col items-center gap-3 text-sm font-mono">
        <div className="flex gap-2 flex-wrap justify-center">
          {['Agent A', 'Agent B', 'Agent C'].map((s) => <Node key={s} tone="amber">{s}</Node>)}
        </div>
        <span className="text-amber-400">↓ critique each other ↓</span>
        <Node>Judge / Vote → Final Answer</Node>
      </div>
    );
  }
  if (id === 5) {
    return (
      <div className="flex flex-col items-center gap-2 text-sm font-mono">
        <div className="flex items-center gap-3 flex-wrap justify-center">
          <Node tone="cyan">Generator</Node>
          <span className="text-cyan-400">→ draft →</span>
          <Node tone="rose">Critic</Node>
        </div>
        <div className="flex items-center gap-2 text-xs text-rose-400">
          <span>↺ feedback loops back until it passes (max N tries)</span>
        </div>
        <span className="text-gray-500 text-xs">↓ on pass ↓</span>
        <Node tone="emerald">Final Output</Node>
      </div>
    );
  }
  return (
    <div className="flex flex-col items-center gap-3 text-sm font-mono">
      <div className="flex gap-6 flex-wrap justify-center items-center">
        <Node tone="rose">Triage</Node>
        <span className="text-gray-500">⇄</span>
        <Node tone="cyan">Billing</Node>
      </div>
      <div className="flex gap-6 flex-wrap justify-center items-center">
        <span className="text-gray-500">⇅</span>
        <span className="text-gray-500">⇅</span>
      </div>
      <div className="flex gap-6 flex-wrap justify-center items-center">
        <Node tone="amber">Technical</Node>
        <span className="text-gray-500">⇄</span>
        <Node tone="emerald">Escalation</Node>
      </div>
      <span className="text-gray-500 text-xs mt-1">any agent can hand off to any other</span>
    </div>
  );
}

/* --------------------------------------------------------------------------
   Cost multiplier visual — the thing that surprises teams in production
-------------------------------------------------------------------------- */

const COST_ROWS = [
  { name: 'Single agent', mult: 1, tone: 'bg-emerald-500', note: 'baseline' },
  { name: 'Sequential (3 stages)', mult: 3, tone: 'bg-indigo-500', note: 'each stage re-reads context' },
  { name: 'Orchestrator + 3 workers', mult: 5, tone: 'bg-purple-500', note: 'delegation + result review' },
  { name: 'Generator–Critic (2 rounds)', mult: 6, tone: 'bg-cyan-500', note: 'draft + critique, twice' },
  { name: 'Debate (3 agents + judge)', mult: 9, tone: 'bg-amber-500', note: 'everyone reads everyone' },
];

function CostVisual() {
  const max = Math.max(...COST_ROWS.map((r) => r.mult));
  return (
    <div className="rounded-2xl border border-white/10 bg-black/40 p-6">
      <div className="space-y-3">
        {COST_ROWS.map((r, i) => (
          <div key={r.name} className="flex items-center gap-3">
            <span className="text-xs text-gray-400 w-52 shrink-0">{r.name}</span>
            <div className="flex-1 h-6 rounded bg-white/5 overflow-hidden">
              <motion.div
                className={`h-full ${r.tone} opacity-80 flex items-center justify-end pr-2`}
                initial={{ width: 0 }}
                whileInView={{ width: `${(r.mult / max) * 100}%` }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.1, type: 'spring', stiffness: 60 }}
              >
                <span className="text-[0.625rem] font-bold text-black/70">≈{r.mult}×</span>
              </motion.div>
            </div>
            <span className="text-[0.625rem] text-gray-600 w-40 shrink-0 hidden sm:block">{r.note}</span>
          </div>
        ))}
      </div>
      <p className="text-[0.6875rem] text-gray-500 mt-4 leading-relaxed mb-0">
        Rough token-cost multipliers relative to one agent doing the task. The multiplier is not just "more agents" —
        it is that <strong className="text-gray-300">every agent re-reads shared context</strong>. A debate pattern
        where three agents each read the others' answers grows superlinearly. Measure cost per resolved task, not per
        call.
      </p>
    </div>
  );
}

export default function AgentsMultiAgent() {
  const [active, setActive] = useState(1);
  const current = patterns.find((p) => p.id === active);

  return (
    <GuideLayout
      title="Multi-Agent Systems"
      intro="When one agent isn't enough: splitting work across specialized agents that coordinate to solve a bigger problem — and the orchestration cost you pay for it."
      toc={toc}
    >
      {/* ---------------------------------------------------------------- */}
      <section id="overview" className="mb-14 scroll-mt-24">
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          A single agent with a huge prompt and every tool attached tends to get confused about which instructions
          apply when. Multi-agent systems solve this by giving each agent a narrow role, its own context window, and
          only the tools it needs — trading orchestration complexity for focus and parallelism.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '🎯', t: 'Focus', d: 'A short, role-specific prompt beats one giant prompt trying to cover every case.' },
            { icon: '🪟', t: 'Fresh context', d: 'Each agent gets its own window, so a long sub-task cannot crowd out the main goal.' },
            { icon: '🔐', t: 'Least privilege', d: 'A research agent gets read-only web access; only the deploy agent can touch production.' },
          ].map((c) => (
            <div key={c.t} className="p-5 rounded-xl border border-white/10 bg-white/5">
              <div className="text-2xl mb-2">{c.icon}</div>
              <div className="font-semibold text-white text-sm mb-1">{c.t}</div>
              <p className="text-xs text-gray-400 leading-relaxed m-0">{c.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section id="need-it" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Do You Actually Need It?</h2>
        <p className="text-gray-300 mb-6 max-w-3xl">
          Multi-agent is the most over-adopted pattern in agent engineering. It multiplies cost, latency, and the
          number of things that can silently go wrong — and a surprising share of "we need multiple agents" problems
          are really "our single agent has a bad prompt or too many tools". Work down this list before splitting.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="p-5 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
            <div className="text-emerald-400 font-semibold mb-3">✅ Reach for multi-agent when</div>
            <ul className="space-y-2 text-sm text-gray-300">
              {[
                'Sub-tasks are genuinely independent and can run in parallel.',
                'Different steps need different tools, models, or permission levels.',
                'One long sub-task would otherwise blow out the main context window.',
                'You want an independent critic that did not write the original answer.',
              ].map((t) => (
                <li key={t} className="flex gap-2"><span className="text-emerald-400 shrink-0">✓</span>{t}</li>
              ))}
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-rose-500/30 bg-rose-500/10">
            <div className="text-rose-400 font-semibold mb-3">❌ Stay single-agent when</div>
            <ul className="space-y-2 text-sm text-gray-300">
              {[
                'The task is fundamentally sequential with no parallelism to win.',
                'Latency matters more than thoroughness — handoffs add whole round-trips.',
                'The "roles" are really just steps in one prompt you have not tuned yet.',
                'You cannot yet measure whether the current agent is failing, or why.',
              ].map((t) => (
                <li key={t} className="flex gap-2"><span className="text-rose-400 shrink-0">✗</span>{t}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="p-4 rounded-xl border border-amber-500/25 bg-amber-500/10">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>Try these first:</strong> tighten the system prompt, remove tools the agent rarely needs, add
            few-shot examples for the failing case, or move a deterministic step out of the LLM into plain code. Each
            is far cheaper than an orchestration layer — and if one of them fixes it, you never needed a second agent.
          </p>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section id="patterns" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-2">Coordination Patterns</h2>
        <p className="text-gray-400 text-sm mb-6">Six ways to wire agents together. Click one to see how it works and what it costs you.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-6">
          {patterns.map((p) => (
            <button
              key={p.id}
              onClick={() => setActive(p.id)}
              className={`p-3 rounded-lg border font-semibold text-xs transition-all ${
                active === p.id
                  ? 'bg-indigo-600 border-indigo-600 text-white shadow-[0_4px_14px_rgba(99,102,241,0.4)]'
                  : 'bg-[#111] border-gray-800 text-gray-400 hover:bg-[#222] hover:border-indigo-500 hover:text-gray-200'
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
          <motion.div key={active} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -10 }} transition={{ duration: 0.3 }}>
            <h3 className="text-xl font-bold text-gray-100 mb-2">{current.name}</h3>
            <p className="text-gray-300 mb-4">{current.desc}</p>
            <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-8 mb-4 flex items-center justify-center min-h-[150px] overflow-x-auto">
              <PatternDiagram id={active} />
            </div>
            <div className="mb-5 p-3.5 rounded-lg bg-white/5 border border-white/10">
              <span className="text-[0.625rem] uppercase tracking-wide text-gray-500 mr-2">Use when</span>
              <span className="text-sm text-gray-300">{current.when}</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
              <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-lg">
                <h4 className="text-emerald-400 font-semibold mb-2 mt-0">Advantages</h4>
                <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                  {current.pros.map((p, i) => <li key={i}>{p}</li>)}
                </ul>
              </div>
              <div className="bg-rose-900/10 border border-rose-500/20 p-4 rounded-lg">
                <h4 className="text-rose-400 font-semibold mb-2 mt-0">Tradeoffs</h4>
                <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1">
                  {current.cons.map((c, i) => <li key={i}>{c}</li>)}
                </ul>
              </div>
            </div>
          </motion.div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section id="context" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Context Engineering</h2>
        <p className="text-gray-300 mb-6 max-w-3xl">
          The actual hard problem in multi-agent systems is not orchestration — frameworks handle that. It is deciding
          <em> what each agent is allowed to know</em>. Pass too little and the worker solves the wrong problem; pass
          everything and you have destroyed the context isolation that motivated splitting up in the first place.
        </p>

        <div className="rounded-2xl border border-white/10 bg-black/40 p-6 mb-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {[
              { t: 'Too little', tone: 'border-rose-500/40 bg-rose-500/10', label: 'text-rose-400', body: '"Summarize the doc." — Which doc? For whom? The worker guesses and produces something plausible but useless.' },
              { t: 'Just enough', tone: 'border-emerald-500/40 bg-emerald-500/10', label: 'text-emerald-400', body: 'Task + acceptance criteria + only the referenced material. The worker has what it needs and nothing else.' },
              { t: 'Too much', tone: 'border-amber-500/40 bg-amber-500/10', label: 'text-amber-400', body: 'The entire parent transcript. Costs a fortune, and the worker gets distracted by instructions meant for other agents.' },
            ].map((c) => (
              <div key={c.t} className={`p-4 rounded-xl border ${c.tone}`}>
                <div className={`text-sm font-bold mb-2 ${c.label}`}>{c.t}</div>
                <p className="text-xs text-gray-300 leading-relaxed m-0">{c.body}</p>
              </div>
            ))}
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <h3 className="font-semibold text-white text-sm mb-2">Write handoffs like task tickets</h3>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              A good handoff states the goal, the constraints, the definition of done, and the exact inputs — not a
              transcript dump. If a new engineer could not act on the message, neither can the agent.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <h3 className="font-semibold text-white text-sm mb-2">Return summaries, not raw output</h3>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              A worker that read 40 files should return the 200-token conclusion, not all 40 files. Otherwise the
              orchestrator's context fills with exactly the material you delegated away to avoid.
            </p>
          </div>
        </div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section id="comms" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Communication Protocols</h2>
        <p className="text-gray-300 mb-6 max-w-3xl">
          How do separate agents actually pass information? Three common approaches, from simplest to most structured:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Shared State Object', desc: 'All agents read/write a common state (e.g. a LangGraph state dict). Simple, but risks agents overwriting each other\'s work.', best: 'Small graphs you control end to end' },
            { title: 'Message Passing', desc: 'Agents send explicit messages to each other\'s queues or context, like actors — clearer boundaries, more setup.', best: 'Async or distributed systems' },
            { title: 'Structured Protocols (A2A, MCP)', desc: 'Standardized schemas for agent-to-agent and agent-to-tool communication, enabling agents from different frameworks to interoperate.', best: 'Crossing org or framework boundaries' },
          ].map((c, i) => (
            <div key={i} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <h3 className="font-bold text-gray-200 mb-2">{c.title}</h3>
              <p className="text-sm text-gray-400 mb-3">{c.desc}</p>
              <div className="text-[0.6875rem] text-indigo-300 bg-black/30 rounded px-2.5 py-1.5 border border-indigo-500/20">
                Best for: {c.best}
              </div>
            </div>
          ))}
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Tool access is a related but separate concern — see the{' '}
          <a href="#/mcp" className="text-blue-400 hover:underline">MCP guide</a> for how
          agents connect to external systems in a standardized way.
        </p>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section id="code" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Building One</h2>
        <p className="text-gray-300 mb-5 max-w-3xl">
          A minimal orchestrator–worker system in LangGraph. The supervisor is just a node that returns which worker
          should go next; the conditional edge does the routing.
        </p>
        <CodeBlock language="python" maxHeight="480px" code={`from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated, Literal
import operator

class State(TypedDict):
    messages: Annotated[list, operator.add]
    next: str

WORKERS = ["researcher", "writer"]

def supervisor(state: State):
    """Decides who acts next — or that the work is done."""
    decision = llm.with_structured_output(RouteSchema).invoke([
        {"role": "system", "content":
         f"Route to one of {WORKERS}, or FINISH if the goal is met."},
        *state["messages"],
    ])
    return {"next": decision.next}

def researcher(state: State):
    result = research_agent.invoke(state["messages"])
    # Return a SUMMARY, not the raw 40-file dump.
    return {"messages": [{"role": "assistant", "content": result.summary}]}

def writer(state: State):
    result = writing_agent.invoke(state["messages"])
    return {"messages": [{"role": "assistant", "content": result.content}]}

graph = StateGraph(State)
graph.add_node("supervisor", supervisor)
graph.add_node("researcher", researcher)
graph.add_node("writer", writer)

graph.set_entry_point("supervisor")
# Workers always report back to the supervisor
for w in WORKERS:
    graph.add_edge(w, "supervisor")

# Supervisor decides where control goes next
graph.add_conditional_edges(
    "supervisor",
    lambda s: s["next"],
    {"researcher": "researcher", "writer": "writer", "FINISH": END},
)

app = graph.compile()

# ALWAYS bound the loop — without this, a stuck supervisor
# re-delegates forever and burns your budget.
app.invoke({"messages": [...]}, config={"recursion_limit": 15})`} />
      </section>

      {/* ---------------------------------------------------------------- */}
      <section id="cost" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Cost Multiplier</h2>
        <p className="text-gray-300 mb-6 max-w-3xl">
          The bill is the most common reason multi-agent systems get rolled back. Before you ship one, know roughly
          what each pattern multiplies your token spend by.
        </p>
        <CostVisual />
      </section>

      {/* ---------------------------------------------------------------- */}
      <section id="failure-modes" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Common Failure Modes</h2>
        <motion.div className="grid grid-cols-1 sm:grid-cols-2 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {[
            { title: 'Context Loss Across Handoffs', desc: 'A worker agent doesn\'t receive enough of the original task context and solves the wrong problem.', fix: 'Write handoffs as self-contained task tickets.' },
            { title: 'Duplicated Work', desc: 'Parallel agents unknowingly research or produce the same thing, wasting tokens and time.', fix: 'Partition sub-tasks explicitly before fan-out.' },
            { title: 'Infinite Delegation Loops', desc: 'An orchestrator keeps re-delegating a failing task without a retry limit or escalation path.', fix: 'Set a hard recursion limit and an escalation branch.' },
            { title: 'Cost Explosion', desc: 'Every added agent multiplies token spend — debate/consensus patterns are especially expensive at scale.', fix: 'Track cost per resolved task and alert on drift.' },
            { title: 'Lost Error Signal', desc: 'A worker fails, returns a plausible-sounding apology, and the orchestrator treats it as success.', fix: 'Return structured status, not prose. Check it in code.' },
            { title: 'Untraceable Behaviour', desc: 'Something went wrong across six agents and nobody can reconstruct which one caused it.', fix: 'Trace every hop with a shared correlation ID.' },
          ].map((f, i) => (
            <motion.div key={i} variants={fadeUp} className="bg-rose-900/10 border border-rose-500/20 rounded-lg p-4">
              <h4 className="text-rose-400 font-semibold mb-1">{f.title}</h4>
              <p className="text-sm text-gray-400 mb-2.5">{f.desc}</p>
              <div className="text-[0.6875rem] text-emerald-300 bg-emerald-500/10 border border-emerald-500/25 rounded px-2.5 py-1.5">
                → {f.fix}
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      {/* ---------------------------------------------------------------- */}
      <section id="checklist" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Production Checklist</h2>
        <div className="rounded-2xl border border-white/10 bg-white/5 p-6">
          <div className="space-y-3">
            {[
              ['Bound every loop', 'A recursion/step limit on the graph, plus a per-task wall-clock timeout. Non-negotiable.'],
              ['Trace every hop', 'One correlation ID across all agents so you can reconstruct who did what, in order.'],
              ['Budget per task', 'Cap total tokens per user request and fail loudly when exceeded, rather than silently spending.'],
              ['Structured handoffs', 'Agents exchange typed objects with explicit status fields — never free-form prose you parse with regex.'],
              ['Least privilege per agent', 'Only the agent that needs write access gets it. Research agents stay read-only.'],
              ['Test agents in isolation', 'Each agent gets its own eval set. A system-level failure should be traceable to one agent\'s regression.'],
            ].map(([t, d]) => (
              <div key={t} className="flex gap-3">
                <span className="text-indigo-400 shrink-0 mt-0.5">☑</span>
                <div>
                  <div className="text-sm font-semibold text-gray-100 mb-0.5">{t}</div>
                  <p className="text-xs text-gray-400 leading-relaxed m-0">{d}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>
    </GuideLayout>
  );
}

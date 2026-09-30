import React, { useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Segmented, Metric, Card, Note, Section } from "../components/VizKit";

export const SEARCH_KEYWORDS = [
  "context engineering", "context window", "context rot", "attention budget", "prompt caching", "cache breakpoint",
  "cache hit", "compaction", "context editing", "clear tool results", "agent memory notes", "just-in-time retrieval",
  "subagents context isolation", "tool definition bloat", "token budget", "cache_control", "lost in the middle",
  "long context", "context management", "prefix caching",
];

/* ---------------------------------------------------------------------------
   What fills the window.
--------------------------------------------------------------------------- */

const PARTS = [
  { k: "system", label: "System prompt", v: 3000, max: 30000, color: "#818cf8" },
  { k: "tools", label: "Tool definitions", v: 12000, max: 60000, color: "#a78bfa" },
  { k: "docs", label: "Retrieved documents", v: 20000, max: 150000, color: "#60a5fa" },
  { k: "history", label: "Conversation history", v: 15000, max: 150000, color: "#34d399" },
  { k: "results", label: "Tool results", v: 30000, max: 200000, color: "#fbbf24" },
  { k: "reserve", label: "Room for the answer", v: 8000, max: 64000, color: "#fb7185" },
];

function FillLab() {
  const [vals, setVals] = useState(Object.fromEntries(PARTS.map((p) => [p.k, p.v])));
  const [win, setWin] = useState(200000);
  const total = Object.values(vals).reduce((a, b) => a + b, 0);
  const pct = total / win;
  const biggest = PARTS.reduce((a, p) => (vals[p.k] > vals[a.k] ? p : a), PARTS[0]);
  return (
    <Panel tone="indigo" title="What is in the window?">
      <div className="mb-4">
        <Segmented value={win} onChange={setWin} options={[{ v: 200000, label: "200K window" }, { v: 1000000, label: "1M window" }]} />
      </div>
      <div className="flex h-8 rounded-lg overflow-hidden bg-white/5 mb-1">
        {PARTS.map((p) => (
          <div key={p.k} title={`${p.label}: ${vals[p.k].toLocaleString()}`} style={{ width: `${(vals[p.k] / win) * 100}%`, background: p.color, opacity: 0.85, transition: "width 200ms" }} />
        ))}
      </div>
      <div className="text-[0.6875rem] text-gray-500 mb-4">
        {total.toLocaleString()} of {win.toLocaleString()} tokens used ({(pct * 100).toFixed(0)}%){pct > 1 ? ": over the limit" : ""}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-3 mb-4">
        {PARTS.map((p) => (
          <div key={p.k}>
            <Slider
              label={<span><span className="inline-block w-2 h-2 rounded-full mr-1.5" style={{ background: p.color }} />{p.label}</span>}
              value={vals[p.k]}
              min={0}
              max={p.max}
              step={500}
              onChange={(v) => setVals((o) => ({ ...o, [p.k]: v }))}
              format={(v) => v.toLocaleString()}
            />
          </div>
        ))}
      </div>
      <div className="grid grid-cols-3 gap-2">
        <Metric label="Used" value={`${(pct * 100).toFixed(0)}%`} tone={pct > 0.7 ? "rose" : "emerald"} />
        <Metric label="Largest part" value={biggest.label} sub={`${((vals[biggest.k] / total) * 100).toFixed(0)}% of what is used`} />
        <Metric label="Left" value={Math.max(0, win - total).toLocaleString()} tone="indigo" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        The starting values are illustrative: they resemble a mid-sized agent after a few tool calls. Notice that tool
        results and tool definitions, not the user's messages, usually dominate. That is where to look first. Filling
        the window is not the only limit: models can also get less reliable as context grows, well before it is full.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Prompt caching cost. Prices are inputs, because they change.
--------------------------------------------------------------------------- */

function CacheCalc() {
  const [prefix, setPrefix] = useState(30000);
  const [fresh, setFresh] = useState(1500);
  const [calls, setCalls] = useState(20);
  const [price, setPrice] = useState(4);
  const [wMul, setWMul] = useState(1.25);
  const [rMul, setRMul] = useState(0.1);

  const per = (t) => (t / 1e6) * price;
  const without = calls * per(prefix + fresh);
  // first call writes the cache, the rest read it (assumes every call lands inside the cache lifetime)
  const withCache = per(prefix) * wMul + per(fresh) + (calls - 1) * (per(prefix) * rMul + per(fresh));
  const saving = 1 - withCache / without;
  return (
    <Panel tone="emerald" title="What does caching save?">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Slider tone="emerald" label="Stable prefix (system, tools, docs)" value={prefix} min={1000} max={150000} step={1000} onChange={setPrefix} format={(v) => `${v.toLocaleString()} tokens`} />
        <Slider tone="emerald" label="New tokens per call" value={fresh} min={100} max={20000} step={100} onChange={setFresh} format={(v) => `${v.toLocaleString()} tokens`} />
        <Slider tone="emerald" label="Calls that reuse the prefix" value={calls} min={1} max={100} onChange={setCalls} />
        <Slider tone="emerald" label="Input price ($ per million tokens)" value={price} min={0.5} max={15} step={0.25} onChange={setPrice} format={(v) => `$${v.toFixed(2)}`} />
        <Slider tone="emerald" label="Cache write cost (× normal)" value={wMul} min={1} max={2} step={0.05} onChange={setWMul} format={(v) => `${v.toFixed(2)}×`} />
        <Slider tone="emerald" label="Cache read cost (× normal)" value={rMul} min={0.02} max={0.5} step={0.01} onChange={setRMul} format={(v) => `${v.toFixed(2)}×`} />
      </div>
      <div className="grid grid-cols-3 gap-2 mb-3">
        <Metric label="Without caching" value={`$${without.toFixed(2)}`} tone="rose" />
        <Metric label="With caching" value={`$${withCache.toFixed(2)}`} tone="emerald" />
        <Metric label="Saved" value={`${(saving * 100).toFixed(0)}%`} tone={saving > 0 ? "emerald" : "rose"} />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        Input cost only; output tokens are unaffected. Defaults are round numbers, a write premium of 1.25× and a read
        discount to 0.1×, so treat them as an illustration and enter your provider's current rates. The model assumes
        every call arrives before the cache expires (a few minutes by default). Try 1 call: you pay the write premium
        and end up spending slightly more. Caching pays off only when the same prefix is reused.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Prefix order: a change early invalidates everything after it.
--------------------------------------------------------------------------- */

const BLOCKS = [
  { n: "Tool definitions", stable: true },
  { n: "System prompt", stable: true },
  { n: "Reference documents", stable: true },
  { n: "Conversation so far", stable: true },
  { n: "Latest user message", stable: false },
];

function PrefixLab() {
  const [changed, setChanged] = useState(-1);
  return (
    <Panel tone="blue" title="Where you change something decides what stays cached">
      <p className="text-sm text-gray-400 mb-3">A cache hit needs an identical start. Tap a block to pretend it changed (a timestamp, a new tool, an edited prompt).</p>
      <div className="space-y-2 mb-3">
        {BLOCKS.map((b, i) => {
          const dead = changed >= 0 && i >= changed;
          return (
            <button
              key={b.n}
              onClick={() => setChanged(changed === i ? -1 : i)}
              className={`w-full text-left rounded-lg border px-3 py-2 text-sm flex items-center justify-between gap-2 ${dead ? "border-rose-500/50 bg-rose-500/15 text-rose-100" : "border-emerald-500/30 bg-emerald-500/10 text-emerald-100"}`}
            >
              <span>{i + 1}. {b.n}</span>
              <span className="text-xs">{changed === i ? "changed" : dead ? "re-processed" : "cached"}</span>
            </button>
          );
        })}
      </div>
      <p className="text-xs text-gray-500 leading-relaxed m-0">
        Order is tools, then system prompt, then messages. Change the first block and nothing is reused. Change only the
        last, and everything before it is. So keep stable content first and volatile content last, and never put a
        timestamp or a request ID at the top of the system prompt.
      </p>
    </Panel>
  );
}

const CODE_CACHE = `import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=1024,
    cache_control={"type": "ephemeral"},      # cache up to the last cacheable block
    system=LONG_STABLE_INSTRUCTIONS,           # frozen text, no dates or IDs
    messages=[{"role": "user", "content": question}],
)

# Did it work? Repeat the call and compare:
u = response.usage
print(u.cache_creation_input_tokens, u.cache_read_input_tokens, u.input_tokens)
# cache_read_input_tokens of 0 on repeat calls means something early in the prefix changed.`;

const CODE_CLEAR = `import anthropic

client = anthropic.Anthropic()

response = client.beta.messages.create(
    model="claude-opus-5-5",
    max_tokens=4096,
    betas=["context-management-2025-06-27"],
    # Drop old tool results once they have been used. This clears; it does not summarise.
    context_management={"edits": [{"type": "clear_tool_uses_20250919"}]},
    tools=TOOLS,
    messages=messages,
)

# Server-side compaction (summarising older context) is a separate beta feature:
#   betas=["compact-2026-01-12"], context_management={"edits": [{"type": "compact_20260112"}]}
# and you must append the full response.content to your history, not only the text.`;

export default function AgentsContextEngineering() {
  const toc = [
    { label: "What Context Engineering Is", hash: "what" },
    { label: "Context Rot", hash: "rot" },
    { label: "What Fills the Window", hash: "fill" },
    { label: "Prompt Caching", hash: "caching" },
    { label: "Keeping Context Small", hash: "techniques" },
    { label: "Tool Definition Bloat", hash: "tools" },
    { label: "A Checklist", hash: "checklist" },
  ];
  return (
    <GuideLayout
      title="Context Engineering"
      intro="Prompt engineering is what you write. Context engineering is everything the model sees on each step: what goes in, in what order, and what gets removed."
      toc={toc}
    >
      <Section id="what" title="What Context Engineering Is" lead="An agent runs in a loop, and every turn re-sends the whole conversation. Context engineering is the job of keeping that input small, relevant and cheap.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="What it is" tone="indigo"><p>Choosing what the model sees each step: instructions, tool definitions, retrieved facts, history and tool results.</p></Card>
          <Card title="Why it matters" tone="emerald"><p>Context is limited, costs money on every call, and affects quality. The same model can act smart or lost depending on what you feed it.</p></Card>
          <Card title="A common mistake" tone="rose"><p>Treating a big window as free storage. Tool output, old turns and unused tool definitions pile up until the important instructions are a small fraction of the input.</p></Card>
        </div>
      </Section>

      <Section id="rot" title="Context Rot and the Attention Budget" lead="Bigger windows do not mean the model uses everything equally well.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <Card title="Context rot" tone="rose"><p>As the amount of text grows, models can miss details, mix things up or follow instructions less reliably. Studies of long-context use have reported such degradation; how much depends on the model and the task, so measure with your own data.</p></Card>
          <Card title="An attention budget" tone="amber"><p>Every token competes for the model's attention. Adding a low-value paragraph does not just cost tokens: it dilutes the ones that matter. The goal is the smallest set of tokens that makes the right behaviour likely.</p></Card>
        </div>
        <Note tone="indigo">Related: <a href="#/llm-inference" className="text-blue-400 hover:underline">LLM inference</a> explains why long contexts also cost memory and time, through the KV cache.</Note>
      </Section>

      <Section id="fill" title="What Fills the Window" lead="Move the sliders to see which part of a typical agent request takes the space.">
        <FillLab />
      </Section>

      <Section id="caching" title="Prompt Caching" lead="If the start of a request is identical to a recent one, the provider can reuse its work and charge much less for those tokens.">
        <PrefixLab />
        <div className="my-5"><CacheCalc /></div>
        <CodeBlock language="python" code={CODE_CACHE} maxHeight="320px" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <Card title="Static first" tone="emerald"><p>Tools, then system prompt, then reference material, then the conversation. Anything that changes per request goes last.</p></Card>
          <Card title="Breakpoints" tone="blue"><p>A breakpoint marks where a cached prefix ends. Automatic caching places one for you; manual ones let you cache a document set separately from the chat. There is a small maximum per request.</p></Card>
          <Card title="Common mistake" tone="rose"><p>Timestamps, user names or random IDs in the system prompt, or changing the tool list between calls. Each silently breaks the cache. Check the cache-read count in the usage data.</p></Card>
        </div>
      </Section>

      <Section id="techniques" title="Keeping Context Small" lead="Five techniques, from cheapest to most involved.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <Card title="1. Clear old tool results" tone="amber"><p>After the agent has used a search result or file dump, it rarely needs the raw text again. Clearing it recovers space and keeps a record that the call happened.</p></Card>
          <Card title="2. Compaction" tone="purple"><p>Summarise the conversation so far and continue from the summary. You lose detail, so keep the decisions, open questions and file paths, and drop the chatter.</p></Card>
          <Card title="3. Notes on disk" tone="emerald"><p>Have the agent write progress to a file (a to-do list, findings) and read it back when needed. Memory outside the window survives clearing and compaction. See <a href="#/agents/memory" className="text-blue-400 hover:underline">Memory &amp; State</a>.</p></Card>
          <Card title="4. Just-in-time retrieval" tone="blue"><p>Keep identifiers, not contents: file paths, URLs, query names. The agent loads a file only when it needs it, the way a person uses bookmarks. See <a href="#/rag" className="text-blue-400 hover:underline">RAG</a>.</p></Card>
          <Card title="5. Subagents for isolation" tone="rose"><p>Hand a big, messy side task to a subagent with its own window. It reads fifty pages, and returns a ten-line summary. See <a href="#/agents/multi-agent" className="text-blue-400 hover:underline">Multi-Agent Systems</a>.</p></Card>
        </div>
        <CodeBlock language="python" code={CODE_CLEAR} maxHeight="340px" />
      </Section>

      <Section id="tools" title="Tool Definition Bloat" lead="Definitions are sent on every request whether or not a tool is used.">
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-4">
          Twenty tools at 150 tokens each is 3,000 tokens per call before any work happens; a hundred tools from many
          MCP servers is five times that. Fixes: load only the tools a task needs, write short descriptions, and use
          tool search or on-demand loading where your platform offers it. The{" "}
          <a href="#/mcp#context-cost" className="text-blue-400 hover:underline">MCP context calculator</a> works out the cost for your setup.
        </p>
      </Section>

      <Section id="checklist" title="A Checklist">
        <ol className="space-y-2 text-sm text-gray-300 list-decimal pl-5 max-w-3xl">
          <li>Measure first: log the tokens by category for a real run (the lab above shows the categories).</li>
          <li>Put stable content at the front and check the cache-read count on the second call.</li>
          <li>Cap tool output: paginate, truncate and return only the fields needed.</li>
          <li>Clear or summarise old tool results once used.</li>
          <li>Give long jobs a notes file so they can survive a restart.</li>
          <li>Delegate messy side tasks to subagents.</li>
          <li>Re-test quality after each change: smaller is only better if answers stay right (see <a href="#/rag/evaluation" className="text-blue-400 hover:underline">evaluation</a>).</li>
        </ol>
      </Section>

      <KnowledgeCheck questions={questionsFor("agents-context")} />
    </GuideLayout>
  );
}

import React from 'react';
import GuideLayout from "../components/GuideLayout";
import { motion } from "framer-motion";
import CodeBlock from "../components/CodeBlock";
import { Card, Note } from "../components/VizKit";
import { ForgettingLab } from "../components/agents/MemoryLab";

export const SEARCH_KEYWORDS = ["agent memory", "memory tool", "memory_20250818", "write policy", "read policy", "forgetting", "memory decay", "memory poisoning", "episodic memory", "semantic memory", "procedural memory", "long-term memory", "user preferences memory", "memory privacy"];

const toc = [
  { label: "Why Agents Need Memory", hash: "overview" },
  { label: "The Memory Hierarchy", hash: "hierarchy" },
  { label: "Context Window Management", hash: "context-window" },
  { label: "Long-Term Memory Patterns", hash: "long-term" },
  { label: "Comparison Table", hash: "comparison" },
  { label: "Write and Read Policies", hash: "policies" },
  { label: "Lab: Forgetting", hash: "forgetting" },
  { label: "A Memory Tool", hash: "memory-tool" },
  { label: "Risks", hash: "risks" },
];

const memoryTypes = [
  { icon: '💬', title: 'Short-Term (Context Window)', color: 'border-indigo-500/30 bg-indigo-500/10 text-indigo-400', desc: "The current conversation's raw token buffer. Fast and free to access, but bounded — everything older than the window limit is gone unless saved elsewhere." },
  { icon: '📝', title: 'Working Memory (Scratchpad)', color: 'border-cyan-500/30 bg-cyan-500/10 text-cyan-400', desc: 'A running notes file or todo list the agent writes to during a task — plans, intermediate results, progress tracking that survives context compaction.' },
  { icon: '📚', title: 'Episodic Memory', color: 'border-purple-500/30 bg-purple-500/10 text-purple-400', desc: 'A record of past sessions or conversations, usually stored as summaries. Lets an agent recall "what we decided last time" across sessions.' },
  { icon: '🧠', title: 'Semantic Memory', color: 'border-emerald-500/30 bg-emerald-500/10 text-emerald-400', desc: 'Structured facts and knowledge — typically a vector database or knowledge graph — retrieved on demand via similarity search (this is RAG applied to memory).' },
  { icon: '⚙️', title: 'Procedural Memory', color: 'border-amber-500/30 bg-amber-500/10 text-amber-400', desc: 'Learned "how to do things" — reusable skills, tool-use patterns, or instructions distilled from past experience, often stored as prompts or code the agent invokes.' },
];

const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };
const fadeUp = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } } };

export default function AgentsMemory() {
  return (
    <GuideLayout
      title="Memory & State"
      intro="Context windows are finite. Real agents need a strategy for what to remember, what to forget, and where to put the rest."
      toc={toc}
    >
      <section id="overview" className="mb-14 scroll-mt-24">
        <p className="text-gray-300 leading-relaxed max-w-3xl">
          An LLM call is stateless — it only knows what's in its current context window. "Memory" is the
          engineering layer built around that stateless call to make an agent feel like it remembers: what was
          discussed, what it already tried, and what it knows about the world. Getting this wrong causes agents to
          repeat mistakes, forget instructions mid-task, or hallucinate details from a conversation that never happened.
        </p>
      </section>

      <section id="hierarchy" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">The Memory Hierarchy</h2>
        <motion.div className="space-y-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {memoryTypes.map((m, i) => (
            <motion.div key={i} variants={fadeUp} className={`p-5 rounded-xl border ${m.color.split(' ')[0]} ${m.color.split(' ')[1]} flex gap-4 items-start`}>
              <span className="text-3xl shrink-0">{m.icon}</span>
              <div>
                <h3 className={`font-bold mb-1 ${m.color.split(' ')[2]}`}>{m.title}</h3>
                <p className="text-sm text-gray-300 leading-relaxed">{m.desc}</p>
              </div>
            </motion.div>
          ))}
        </motion.div>
      </section>

      <section id="context-window" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Managing the Context Window</h2>
        <p className="text-gray-300 mb-6 max-w-3xl">
          Even with a 200K+ token window, long-running agents eventually fill it. Three techniques keep sessions alive:
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { title: 'Sliding Window', desc: 'Drop the oldest messages once a token budget is hit, keeping only the most recent N turns.' },
            { title: 'Summarization / Compaction', desc: 'Periodically compress older turns into a dense summary, freeing space while preserving key facts.' },
            { title: 'Retrieval on Demand', desc: "Store everything externally and only pull back the relevant slice via search when it's needed." },
          ].map((t, i) => (
            <div key={i} className="bg-[#111] border border-gray-800 rounded-xl p-5">
              <h3 className="font-bold text-gray-200 mb-2">{t.title}</h3>
              <p className="text-sm text-gray-400">{t.desc}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="long-term" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Long-Term Memory Patterns</h2>
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6">
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-mono text-gray-300">
            <span className="bg-white/10 px-3 py-1.5 rounded-lg">New Fact</span>
            <span className="text-indigo-400">→</span>
            <span className="bg-indigo-600/30 border border-indigo-500/50 px-3 py-1.5 rounded-lg text-indigo-300">Embed</span>
            <span className="text-indigo-400">→</span>
            <span className="bg-emerald-600/30 border border-emerald-500/50 px-3 py-1.5 rounded-lg text-emerald-300">Vector Store</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-3 text-sm font-mono text-gray-300 mt-4">
            <span className="bg-white/10 px-3 py-1.5 rounded-lg">New Query</span>
            <span className="text-purple-400">→</span>
            <span className="bg-purple-600/30 border border-purple-500/50 px-3 py-1.5 rounded-lg text-purple-300">Similarity Search</span>
            <span className="text-purple-400">→</span>
            <span className="bg-white/10 px-3 py-1.5 rounded-lg">Inject into Context</span>
          </div>
          <p className="text-center text-xs text-gray-500 mt-4">This is exactly the RAG pattern, applied to the agent's own memory instead of a document corpus.</p>
        </div>
      </section>

      <section id="comparison" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Comparison</h2>
        <div className="overflow-x-auto rounded-xl border border-gray-800">
          <table className="w-full text-sm border-collapse">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">Type</th>
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">Lifespan</th>
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">Storage</th>
                <th className="px-4 py-3 text-left text-gray-300 border-b border-gray-800">Access Pattern</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              <tr><td className="px-4 py-2.5 border-b border-gray-900 text-gray-200 font-semibold">Short-term</td><td className="px-4 py-2.5 border-b border-gray-900">Single turn/session</td><td className="px-4 py-2.5 border-b border-gray-900">In-context tokens</td><td className="px-4 py-2.5 border-b border-gray-900">Always visible</td></tr>
              <tr className="bg-gray-900/30"><td className="px-4 py-2.5 border-b border-gray-900 text-gray-200 font-semibold">Working</td><td className="px-4 py-2.5 border-b border-gray-900">Single task</td><td className="px-4 py-2.5 border-b border-gray-900">Scratchpad file</td><td className="px-4 py-2.5 border-b border-gray-900">Read/write by agent</td></tr>
              <tr><td className="px-4 py-2.5 border-b border-gray-900 text-gray-200 font-semibold">Episodic</td><td className="px-4 py-2.5 border-b border-gray-900">Across sessions</td><td className="px-4 py-2.5 border-b border-gray-900">Summary log / DB</td><td className="px-4 py-2.5 border-b border-gray-900">Loaded at session start</td></tr>
              <tr className="bg-gray-900/30"><td className="px-4 py-2.5 border-b border-gray-900 text-gray-200 font-semibold">Semantic</td><td className="px-4 py-2.5 border-b border-gray-900">Indefinite</td><td className="px-4 py-2.5 border-b border-gray-900">Vector DB / knowledge graph</td><td className="px-4 py-2.5 border-b border-gray-900">Retrieved via search</td></tr>
              <tr><td className="px-4 py-2.5 border-b border-gray-900 text-gray-200 font-semibold">Procedural</td><td className="px-4 py-2.5 border-b border-gray-900">Indefinite</td><td className="px-4 py-2.5 border-b border-gray-900">Prompt / skill files</td><td className="px-4 py-2.5 border-b border-gray-900">Loaded when task matches</td></tr>
            </tbody>
          </table>
        </div>
      </section>

      <section id="policies" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Write and Read Policies</h2>
        <p className="text-gray-300 mb-5 max-w-3xl">Memory is only useful if the right things get saved and the right things come back. Decide both on purpose.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="When to write" tone="emerald"><p>After a task finishes, when the user states a preference or correction, or at the end of a session. Save decisions and facts, not chatter. A common mistake is saving everything, which buries what matters.</p></Card>
          <Card title="What to write" tone="indigo"><p>Short, self-contained notes with a date and a source: "Prefers metric units (said 12 Sep)". Notes that need the original conversation to make sense are useless later.</p></Card>
          <Card title="When to read" tone="blue"><p>At the start of a session (load a small profile), and on demand when a topic comes up (search). Loading everything up front wastes context.</p></Card>
          <Card title="How to update" tone="amber"><p>Edit or replace an old note rather than adding a contradicting one. Two notes saying opposite things leave the model to guess.</p></Card>
        </div>
      </section>

      <section id="forgetting" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Lab: Forgetting</h2>
        <p className="text-gray-300 mb-5 max-w-3xl">Storage is cheap, attention is not. Forgetting keeps the useful memories findable.</p>
        <ForgettingLab />
      </section>

      <section id="memory-tool" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">A Memory Tool</h2>
        <p className="text-gray-300 mb-4 max-w-3xl">
          The Claude API has a memory tool: you declare it, the model issues file-style commands (view, create, edit,
          delete) against a memory folder, and <em>your code</em> carries them out and stores the files wherever you choose.
          The model reads its notes at the start of a task and updates them as it learns.
        </p>
        <CodeBlock
          language="python"
          code={`import anthropic

client = anthropic.Anthropic()

response = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=1024,
    tools=[{"type": "memory_20250818", "name": "memory"}],
    messages=[{"role": "user", "content": "Remember that I prefer answers in metric units."}],
)

# The model replies with tool_use blocks for the memory tool (view / create / ...).
# Your code executes each command against your own storage, restricts paths to the
# memory folder, and returns the outcome as a tool_result. The SDKs ship helper
# classes for implementing that backend; see the current docs for the command list.`}
        />
      </section>

      <section id="risks" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Risks</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <Card title="Memory poisoning" tone="rose"><p>If an agent saves text it read on a web page, an attacker can plant instructions that come back in every future session. Do not store untrusted content as trusted notes.</p></Card>
          <Card title="Privacy" tone="amber"><p>Stored memories are personal data. Let users see, correct and delete them, keep each user's memory separate, and avoid saving secrets.</p></Card>
          <Card title="Stale facts" tone="purple"><p>Old notes can be wrong. Date them, and prefer checking the source when accuracy matters.</p></Card>
        </div>
        <Note tone="indigo">See also <a href="#/agents/context-engineering" className="text-blue-400 hover:underline">Context Engineering</a> for keeping notes out of the window until needed.</Note>
      </section>
    </GuideLayout>
  );
}

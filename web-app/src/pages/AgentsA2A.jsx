import React, { useState } from "react";
import GuideLayout from "../components/GuideLayout";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import CodeBlock from "../components/CodeBlock";

/* --------------------------------------------------------------------------
   A2A: the protocol for agents that do not share a process, a codebase, or an
   owner. The stepper below walks one real task through its lifecycle.
-------------------------------------------------------------------------- */

const STEPS = [
  {
    n: "Discovery",
    actor: "Client agent",
    d: "Fetch the remote agent's card from a well-known URL. The card declares its skills, its endpoint, what content types it accepts, and how to authenticate.",
    wire: `GET https://expenses.acme.com/.well-known/agent-card.json`,
    tone: "border-blue-500/30 bg-blue-500/[0.08]",
    label: "text-blue-400",
  },
  {
    n: "Task creation",
    actor: "Client agent",
    d: "Send a message. The remote agent opens a task with an id and its own lifecycle — this is a durable object, not a request/response.",
    wire: `POST /a2a  { "method": "message/send",
       "params": { "message": { "role": "user",
         "parts": [{ "kind": "text",
                     "text": "File the March travel expenses" }] } } }`,
    tone: "border-indigo-500/30 bg-indigo-500/[0.08]",
    label: "text-indigo-400",
  },
  {
    n: "Working",
    actor: "Remote agent",
    d: "The task moves to working. The client can stream updates over server-sent events or poll. Long-running work is the normal case here, not an edge case.",
    wire: `event: status-update
data: { "taskId": "t_8f2a", "status": { "state": "working" } }`,
    tone: "border-amber-500/30 bg-amber-500/[0.08]",
    label: "text-amber-400",
  },
  {
    n: "Input required",
    actor: "Remote agent",
    d: "The agent can pause and ask for more. The task state becomes input-required and waits — which is what makes human approval and clarification first-class rather than bolted on.",
    wire: `data: { "status": { "state": "input-required",
          "message": { "parts": [{ "kind": "text",
            "text": "Two receipts are missing dates. Approve anyway?" }] } } }`,
    tone: "border-purple-500/30 bg-purple-500/[0.08]",
    label: "text-purple-400",
  },
  {
    n: "Artifacts",
    actor: "Remote agent",
    d: "Output arrives as artifacts, not as a string. Each has parts that can be text, structured data, or a file — so a filled expense report comes back as a document, typed.",
    wire: `data: { "artifact": { "name": "expense-report-march.pdf",
            "parts": [{ "kind": "file",
                        "file": { "mimeType": "application/pdf" } }] } }`,
    tone: "border-emerald-500/30 bg-emerald-500/[0.08]",
    label: "text-emerald-400",
  },
  {
    n: "Completed",
    actor: "Remote agent",
    d: "Terminal state. Also reachable: failed, canceled, or rejected. The client never had to know what model, framework, or language the remote agent used.",
    wire: `data: { "status": { "state": "completed" }, "final": true }`,
    tone: "border-teal-500/30 bg-teal-500/[0.08]",
    label: "text-teal-400",
  },
];

function LifecycleStepper() {
  const [i, setI] = useState(0);
  const s = STEPS[i];

  return (
    <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.07] p-6">
      <h3 className="text-indigo-400 font-bold mb-1">One task, end to end</h3>
      <p className="text-sm text-gray-400 mb-5 leading-relaxed">
        A travel agent delegating expense filing to a finance agent it did not write. Step through the exchange.
      </p>

      <div className="flex flex-wrap gap-2 mb-5">
        {STEPS.map((st, idx) => (
          <button
            key={st.n}
            onClick={() => setI(idx)}
            className={`px-3 py-1.5 rounded-lg text-xs font-semibold border transition-colors ${
              idx === i
                ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-200"
                : idx < i
                ? "border-white/10 bg-white/5 text-gray-400 hover:text-white"
                : "border-white/5 bg-white/[0.02] text-gray-600 hover:text-gray-300"
            }`}
          >
            {idx + 1}. {st.n}
          </button>
        ))}
      </div>

      <div className={`p-5 rounded-xl border mb-4 ${s.tone}`}>
        <div className="flex items-baseline justify-between gap-3 mb-2">
          <div className={`font-bold ${s.label}`}>{s.n}</div>
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500">{s.actor}</div>
        </div>
        <p className="text-sm text-gray-300 leading-relaxed m-0">{s.d}</p>
      </div>

      <div className="rounded-xl bg-black/50 border border-white/10 p-4 overflow-x-auto">
        <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-2">On the wire</div>
        <pre className="text-xs font-mono text-gray-300 m-0 whitespace-pre">{s.wire}</pre>
      </div>

      <div className="flex gap-2 mt-4">
        <button
          onClick={() => setI((v) => Math.max(0, v - 1))}
          disabled={i === 0}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-white/15 bg-white/5 text-gray-300 hover:text-white disabled:opacity-30 disabled:hover:text-gray-300 transition-colors"
        >
          Previous
        </button>
        <button
          onClick={() => setI((v) => Math.min(STEPS.length - 1, v + 1))}
          disabled={i === STEPS.length - 1}
          className="px-3.5 py-1.5 rounded-lg text-xs font-semibold border border-indigo-500/40 bg-indigo-500/15 text-indigo-200 hover:bg-indigo-500/25 disabled:opacity-30 transition-colors"
        >
          Next step
        </button>
      </div>
    </div>
  );
}

/* -------------------------------------------------------------------------- */

export default function AgentsA2A() {
  const toc = [
    { label: "The Problem", hash: "problem" },
    { label: "A2A vs MCP", hash: "vs-mcp" },
    { label: "The Agent Card", hash: "card" },
    { label: "Task Lifecycle", hash: "lifecycle" },
    { label: "Core Objects", hash: "objects" },
    { label: "In Code", hash: "code" },
    { label: "Security", hash: "security" },
    { label: "Where It Stands", hash: "status" },
  ];

  return (
    <GuideLayout
      title="A2A — Agent-to-Agent Protocol"
      intro="An open protocol for agents built by different teams, on different stacks, to delegate work to each other without sharing code."
      toc={toc}
    >
      <section id="problem" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Problem</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          Multi-agent frameworks solve coordination inside one program. They assume a shared runtime, a shared message
          format, and one owner. None of that holds when your agent needs to hand work to a vendor's agent, or to
          another department's agent running on a different stack.
        </p>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Without a protocol, every pairing becomes a bespoke integration. A2A, published by Google and now under the
          Linux Foundation, standardises that interaction the way HTTP standardised talking to a server.
        </p>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            The design commitment worth noting: a remote agent is treated as an opaque peer, not as a function. You do
            not get to see its tools, its memory, or its reasoning. You send a task and receive results — which is
            what makes it usable across a trust boundary.
          </p>
        </div>
      </section>

      <section id="vs-mcp" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">A2A vs MCP</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          These get confused constantly. They are complementary and sit on different axes: MCP connects an agent
          downward to its capabilities, A2A connects an agent sideways to its peers.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-5">
          <div className="p-5 rounded-xl border border-emerald-500/25 bg-emerald-500/[0.07]">
            <div className="font-bold text-emerald-400 mb-2">MCP — agent to tools</div>
            <ul className="text-xs text-gray-300 space-y-1.5 list-disc pl-5 m-0">
              <li>Exposes tools, resources, and prompts.</li>
              <li>The server is passive; it executes what it is told.</li>
              <li>Calls are typically fast and synchronous.</li>
              <li>Think: database access, file reads, API wrappers.</li>
            </ul>
          </div>
          <div className="p-5 rounded-xl border border-indigo-500/25 bg-indigo-500/[0.07]">
            <div className="font-bold text-indigo-400 mb-2">A2A — agent to agent</div>
            <ul className="text-xs text-gray-300 space-y-1.5 list-disc pl-5 m-0">
              <li>Exposes skills, described in natural language.</li>
              <li>The peer is autonomous; it decides how to do the work.</li>
              <li>Tasks are long-running, streaming, and stateful.</li>
              <li>Think: delegating a goal, not invoking a function.</li>
            </ul>
          </div>
        </div>
        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 flex flex-wrap items-center justify-center gap-3 text-xs font-mono">
          <span className="px-3 py-1.5 bg-black/40 border border-gray-700 rounded-full text-gray-300">your agent</span>
          <span className="text-gray-500">— A2A →</span>
          <span className="px-3 py-1.5 bg-indigo-900/20 border border-indigo-500/40 rounded-full text-indigo-300">vendor's agent</span>
          <span className="text-gray-500">— MCP →</span>
          <span className="px-3 py-1.5 bg-emerald-900/20 border border-emerald-500/40 rounded-full text-emerald-300">its own tools</span>
        </div>
        <p className="text-xs text-gray-500 mt-3 text-center">
          A single system normally uses both. See <a href="#/mcp" className="text-blue-400 hover:underline">MCP</a>.
        </p>
      </section>

      <section id="card" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Agent Card</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          Discovery is a JSON document at a well-known path. It is the agent's public interface: what it can do, how
          to reach it, and how to prove you are allowed to.
        </p>
        <CodeBlock
          language="json"
          code={`{
  "protocolVersion": "0.3.0",
  "name": "Expense Filing Agent",
  "description": "Files and tracks corporate expense reports.",
  "url": "https://expenses.acme.com/a2a",
  "preferredTransport": "JSONRPC",
  "version": "2.1.0",
  "capabilities": {
    "streaming": true,
    "pushNotifications": true,
    "stateTransitionHistory": true
  },
  "defaultInputModes":  ["text/plain", "application/json"],
  "defaultOutputModes": ["text/plain", "application/pdf"],
  "securitySchemes": {
    "oauth2": {
      "type": "oauth2",
      "flows": { "clientCredentials": { "tokenUrl": "https://acme.com/oauth/token",
                                        "scopes": { "expenses:write": "File expenses" } } }
    }
  },
  "security": [{ "oauth2": ["expenses:write"] }],
  "skills": [
    {
      "id": "file-expense",
      "name": "File an expense report",
      "description": "Given receipts and a date range, produces a filed report.",
      "tags": ["finance", "expenses"],
      "examples": ["File my March travel expenses"]
    }
  ]
}`}
        />
        <div className="mt-4 p-4 rounded-xl border border-amber-500/25 bg-amber-500/[0.07]">
          <p className="text-sm text-amber-200 leading-relaxed m-0">
            <strong>Skills are described, not typed.</strong> Unlike an MCP tool with a JSON schema, a skill is prose
            plus examples, because the client agent selects it by reasoning about intent. That is flexible and it
            means discovery is fuzzy — expect to pin the specific skill ids you depend on.
          </p>
        </div>
      </section>

      <section id="lifecycle" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Task Lifecycle</h2>
        <LifecycleStepper />
      </section>

      <section id="objects" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Core Objects</h2>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-left">
                <th className="px-4 py-3 font-semibold text-white">Object</th>
                <th className="px-4 py-3 font-semibold text-white">What it is</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {[
                ["Agent Card", "The public description at /.well-known/agent-card.json. Skills, endpoint, transports, auth."],
                ["Task", "A unit of delegated work with an id and a state. Durable, resumable, and the thing you poll or stream."],
                ["Message", "One turn in the exchange, from user or agent, made of parts."],
                ["Part", "A typed piece of content: text, file, or structured data. Multimodal by construction."],
                ["Artifact", "A durable output of a task — the deliverable, distinct from conversational chatter."],
                ["Context", "Groups related tasks so a follow-up knows what came before."],
              ].map(([n, d]) => (
                <tr key={n} className="border-t border-white/10">
                  <td className="px-4 py-3 font-mono text-xs text-indigo-300 whitespace-nowrap align-top">{n}</td>
                  <td className="px-4 py-3 text-xs leading-relaxed">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            Task states are: submitted, working, input-required, auth-required, completed, failed, canceled, rejected,
            and unknown. The first four are non-terminal. Handle input-required explicitly — an agent that ignores it
            will appear to hang forever.
          </p>
        </div>
      </section>

      <section id="code" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">In Code</h2>
        <CodeBlock
          language="python"
          code={`import httpx
from a2a.client import A2ACardResolver, ClientFactory
from a2a.types import Message, Part, TextPart, TaskState

async with httpx.AsyncClient() as http:
    # 1. Discover — fetch and validate the card.
    card = await A2ACardResolver(
        httpx_client=http,
        base_url="https://expenses.acme.com",
    ).get_agent_card()

    # Never assume a capability. Cards change independently of your code.
    if not any(s.id == "file-expense" for s in card.skills):
        raise RuntimeError("remote agent no longer offers file-expense")

    client = ClientFactory(httpx_client=http).create(card)

    msg = Message(
        role="user",
        parts=[Part(root=TextPart(text="File my March travel expenses"))],
    )

    # 2. Stream the task. Long-running work is the normal case.
    async for event in client.send_message(msg):
        state = event.status.state

        if state == TaskState.input_required:
            # The agent is waiting on you. Answer, or it waits forever.
            await client.send_message(
                Message(role="user",
                        parts=[Part(root=TextPart(text="Yes, approve"))]),
                task_id=event.id,
            )

        elif state == TaskState.completed:
            for artifact in event.artifacts or []:
                print("got:", artifact.name)

        elif state in (TaskState.failed, TaskState.rejected):
            raise RuntimeError(f"remote task {state}: {event.status.message}")`}
        />
      </section>

      <section id="security" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Security</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          A2A crosses trust boundaries by design, which makes it a larger attack surface than in-process
          orchestration. The protocol gives you the mechanisms; the judgement is yours.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {[
            ["Treat remote output as untrusted input", "A remote agent's response can contain instructions aimed at your model. It is data. Never let it drive tool calls or privilege decisions on its own."],
            ["Scope credentials per skill", "The card declares OAuth scopes per skill. Request the narrowest one that works, and never reuse a token across agents."],
            ["Verify the card, then pin what you use", "Fetch over TLS from the well-known path, and assert the specific skill ids and schemas you depend on rather than trusting whatever appears."],
            ["Budget and timebox every task", "A remote task can run indefinitely. Set deadlines and cancel — the protocol has a cancel method, so use it."],
            ["Log the full exchange", "Cross-organisation delegation is exactly where you will need an audit trail, and exactly where you cannot reconstruct one after the fact."],
            ["Do not forward secrets in message parts", "Parts are content, not credentials. Authentication belongs in the transport layer, where it can be rotated and revoked."],
          ].map(([t, d]) => (
            <div key={t} className="p-4 rounded-xl border border-rose-500/20 bg-rose-500/[0.06]">
              <div className="text-sm font-semibold text-rose-300 mb-1">{t}</div>
              <p className="text-xs text-gray-400 leading-relaxed m-0">{d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="status" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Where It Stands</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          A2A is young. It was announced in 2025, donated to the Linux Foundation, and has backing from a long list of
          vendors, but it has nothing like MCP's deployment footprint yet. The spec is still moving.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Worth adopting when</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>You are integrating agents across organisational boundaries.</li>
              <li>Teams own separate agents on separate stacks.</li>
              <li>You are publishing an agent for others to call.</li>
              <li>Tasks are long-running and need real state.</li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h4 className="text-gray-200 font-semibold mb-2">Not yet worth it when</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Every agent lives in one codebase — use a framework.</li>
              <li>You only need tools, not peers — use MCP.</li>
              <li>Calls are short and synchronous; plain HTTP is simpler.</li>
              <li>You cannot absorb breaking changes in a moving spec.</li>
            </ul>
          </div>
        </div>
      </section>
      <KnowledgeCheck questions={questionsFor("agents-core")} />
    </GuideLayout>
  );
}

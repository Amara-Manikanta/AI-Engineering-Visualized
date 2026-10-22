import React, { useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Metric, Card, Note, Section, Segmented, Button } from "../components/VizKit";

export const SEARCH_KEYWORDS = [
  "agent SDK", "agent frameworks", "Claude Agent SDK", "OpenAI Agents SDK", "handoffs", "guardrails",
  "Google ADK", "Agent Development Kit", "Pydantic AI", "smolagents", "CodeAgent", "LlamaIndex agents",
  "Semantic Kernel", "Microsoft Agent Framework", "DSPy", "LangGraph", "CrewAI", "AutoGen", "Agent Skills",
  "SKILL.md", "progressive disclosure", "Claude Code skills", "managed agents", "n8n", "Dify", "Flowise", "Zapier",
  "low-code agents", "no-code automation", "tool runner", "choosing an agent framework",
];

/* ---------------------------------------------------------------------------
   Skills and progressive disclosure: what sits in the context window before
   and after a skill is needed. Token counts are illustrative.
--------------------------------------------------------------------------- */

const SKILLS = [
  { n: "pdf-forms", meta: 40, body: 2400, files: 6000 },
  { n: "brand-guidelines", meta: 35, body: 1800, files: 0 },
  { n: "sql-reporting", meta: 45, body: 3100, files: 4200 },
  { n: "release-notes", meta: 30, body: 1200, files: 0 },
  { n: "incident-runbook", meta: 50, body: 2600, files: 3500 },
];

function SkillsLab() {
  const [stage, setStage] = useState(0);
  const active = "sql-reporting";
  const rows = SKILLS.map((s) => {
    const inUse = s.n === active && stage >= 1;
    return { ...s, used: s.meta + (inUse ? s.body : 0) + (s.n === active && stage >= 2 ? 900 : 0) };
  });
  const total = rows.reduce((a, r) => a + r.used, 0);
  const everything = SKILLS.reduce((a, s) => a + s.meta + s.body + s.files, 0);
  const steps = [
    "Session starts: only each skill's name and one-line description are loaded — the agent knows what exists.",
    "User asks for a quarterly revenue report. The description matches, so the agent reads sql-reporting/SKILL.md.",
    "SKILL.md says to run scripts/build_query.py and read reference/schema.md; only the part it needs is loaded, and the script runs without its code entering context.",
  ];
  return (
    <Panel tone="purple" title="Progressive disclosure: skills cost almost nothing until they are used">
      <div className="flex flex-wrap gap-2 mb-4">
        {steps.map((_, i) => (
          <Button key={i} tone={stage === i ? "purple" : "indigo"} onClick={() => setStage(i)}>
            {i + 1}. {["Start", "Match", "Load details"][i]}
          </Button>
        ))}
      </div>
      <div className="space-y-2 mb-3">
        {rows.map((r) => (
          <div key={r.n} className="grid grid-cols-[130px_minmax(0,1fr)_70px] items-center gap-2 text-xs font-mono">
            <span className={r.n === active && stage > 0 ? "text-purple-200" : "text-gray-400"}>{r.n}</span>
            <div className="h-4 bg-white/5 rounded overflow-hidden">
              <div className="h-full bg-purple-400/70 rounded" style={{ width: `${(r.used / 4200) * 100}%`, transition: "width 300ms" }} />
            </div>
            <span className="text-right text-gray-300">{r.used.toLocaleString()}</span>
          </div>
        ))}
      </div>
      <p className="text-sm text-gray-300 mb-3">{steps[stage]}</p>
      <div className="grid grid-cols-2 gap-2">
        <Metric label="Tokens in context for skills" value={total.toLocaleString()} tone="purple" />
        <Metric label="If everything were loaded up front" value={everything.toLocaleString()} sub="instructions + reference files" />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Token counts are illustrative. The design point is real: an agent can have dozens of skills installed while
        paying only for a line of metadata each, because instructions and reference files are read on demand. That
        is the difference from stuffing every procedure into one giant system prompt.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   A small chooser. Deliberately opinionated and short; the table below has
   the nuance.
--------------------------------------------------------------------------- */

const QUESTIONS = [
  { id: "code", q: "Will you write code?", opts: [["yes", "Yes"], ["no", "No — visual builder"]] },
  { id: "tools", q: "Does the agent need a filesystem, shell and code editing out of the box?", opts: [["yes", "Yes"], ["no", "No — my own tools"]] },
  { id: "flow", q: "How much control over the control flow do you need?", opts: [["graph", "Explicit graph, checkpoints"], ["loop", "A tool loop is enough"]] },
  { id: "host", q: "Who should run the loop and the sandbox?", opts: [["me", "My infrastructure"], ["provider", "Managed by the provider"]] },
];

function recommend(a) {
  if (a.code === "no") return { pick: "n8n, Dify or Flowise", why: "Visual workflow builders with LLM and agent nodes, many integrations, and self-hosting options. Good for internal automations; move to code when logic or testing needs outgrow the canvas." };
  if (a.host === "provider") return { pick: "A managed agent platform", why: "The provider hosts the loop and a per-session sandbox (for example Claude Managed Agents), so you configure an agent and send it tasks instead of operating infrastructure." };
  if (a.tools === "yes") return { pick: "Claude Agent SDK", why: "The Claude Code harness as a library: built-in file, shell, search and web tools, subagents, hooks, permissions and MCP. You host it." };
  if (a.flow === "graph") return { pick: "LangGraph", why: "Agents as explicit state graphs with checkpoints, human-in-the-loop interrupts and replay — the most control over what happens when." };
  return { pick: "A lightweight SDK or your provider's tool runner", why: "OpenAI Agents SDK, Pydantic AI, Google ADK, or the Anthropic SDK's tool runner: define tools as functions and let the SDK run the loop, with little framework to learn." };
}

function Chooser() {
  const [a, setA] = useState({ code: "yes", tools: "no", flow: "loop", host: "me" });
  const r = recommend(a);
  return (
    <Panel tone="emerald" title="Which should I start with?">
      <div className="space-y-3 mb-4">
        {QUESTIONS.map((q) => (
          <div key={q.id} className="flex flex-wrap items-center justify-between gap-2">
            <span className="text-sm text-gray-300">{q.q}</span>
            <Segmented tone="emerald" value={a[q.id]} onChange={(v) => setA((s) => ({ ...s, [q.id]: v }))} options={q.opts.map(([v, label]) => ({ v, label }))} />
          </div>
        ))}
      </div>
      <div className="p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10">
        <div className="text-[0.6875rem] uppercase tracking-wide text-emerald-300/80 mb-1">Start with</div>
        <div className="text-lg font-bold text-white mb-1">{r.pick}</div>
        <p className="text-sm text-gray-300 m-0">{r.why}</p>
      </div>
      <p className="text-xs text-gray-500 mt-3 mb-0">A starting point, not a verdict. Whatever you pick, keep your tools as plain functions so switching later is cheap.</p>
    </Panel>
  );
}

const FRAMEWORKS = [
  { n: "Claude Agent SDK", by: "Anthropic", lang: "Python, TypeScript", shape: "Full agent harness (Claude Code as a library)", strengths: "Built-in file/shell/search tools, subagents, hooks, permissions, MCP, skills" },
  { n: "OpenAI Agents SDK", by: "OpenAI", lang: "Python, TypeScript", shape: "Lightweight agent loop", strengths: "Agents, handoffs between agents, guardrails, sessions, built-in tracing" },
  { n: "Google ADK", by: "Google", lang: "Python, Java and more", shape: "Agent development kit", strengths: "Multi-agent hierarchies, workflow agents, evaluation, deploys to Google Cloud" },
  { n: "LangGraph", by: "LangChain", lang: "Python, JS", shape: "Stateful graph runtime", strengths: "Explicit control flow, persistence, interrupts, time travel; model-agnostic" },
  { n: "Pydantic AI", by: "Pydantic", lang: "Python", shape: "Typed agent framework", strengths: "Type-checked tools and outputs, dependency injection, model-agnostic" },
  { n: "CrewAI", by: "CrewAI", lang: "Python", shape: "Role-based multi-agent", strengths: "Crews of role-playing agents plus deterministic Flows" },
  { n: "smolagents", by: "Hugging Face", lang: "Python", shape: "Minimal, code-first", strengths: "CodeAgent writes actions as Python code; tiny codebase" },
  { n: "LlamaIndex", by: "LlamaIndex", lang: "Python, TS", shape: "Data-centric agents & workflows", strengths: "Strongest when the agent's job is over your documents" },
  { n: "Microsoft Agent Framework", by: "Microsoft", lang: ".NET, Python", shape: "Enterprise agent framework", strengths: "Successor direction for Semantic Kernel and AutoGen; Azure integration" },
  { n: "DSPy", by: "Stanford", lang: "Python", shape: "Programming & optimising LM pipelines", strengths: "Declares modules and optimises their prompts against a metric" },
];

export default function AgentsSdks() {
  const toc = [
    { label: "Framework, SDK or Platform?", hash: "layers" },
    { label: "Which to Start With", hash: "chooser" },
    { label: "The Landscape", hash: "landscape" },
    { label: "The Same Agent, Three Ways", hash: "code" },
    { label: "Agent Skills", hash: "skills" },
    { label: "Low-code Builders", hash: "lowcode" },
    { label: "Choosing Well", hash: "advice" },
  ];

  return (
    <GuideLayout
      title="Agent SDKs, Skills & Builders"
      intro="The tools people actually build agents with — provider SDKs like the Claude Agent SDK and OpenAI Agents SDK, open frameworks, Agent Skills for packaging know-how, and low-code builders like n8n — and how to choose between them."
      toc={toc}
    >
      <Section id="layers" title="Framework, SDK or Platform?" lead="“Agent framework” covers very different things. The useful question is what each one supplies: the loop that calls the model and runs tools (the harness), and the machines it runs on (the deployment).">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Raw API + your loop" tone="indigo"><p>You write the “call model → run tools → repeat” loop yourself. Maximum control, most code. See <a href="#/agents/tool-calling" className="text-blue-400 hover:underline">Tool Calling</a>.</p></Card>
          <Card title="SDK tool runner" tone="emerald"><p>The provider SDK runs the loop over tools you define as functions. Little code, you host it.</p></Card>
          <Card title="Agent harness" tone="purple"><p>A complete agent — built-in tools, context management, subagents, permissions — as a library (Claude Agent SDK) or framework (LangGraph, ADK). You host it.</p></Card>
          <Card title="Managed platform" tone="amber"><p>The provider runs the loop and a sandboxed workspace per session; you configure agents and send tasks. Least infrastructure, least low-level control.</p></Card>
        </div>
      </Section>

      <Section id="chooser" title="Which to Start With">
        <Chooser />
      </Section>

      <Section id="landscape" title="The Landscape" lead="A snapshot; these projects move quickly, so check each one's current documentation before committing.">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm min-w-[760px]">
            <thead className="bg-white/5 text-gray-400 text-left">
              <tr><th className="p-3 font-medium">Name</th><th className="p-3 font-medium">From</th><th className="p-3 font-medium">Languages</th><th className="p-3 font-medium">Shape</th><th className="p-3 font-medium">Stands out for</th></tr>
            </thead>
            <tbody className="text-gray-300">
              {FRAMEWORKS.map((f) => (
                <tr key={f.n} className="border-t border-white/5 align-top">
                  <td className="p-3 font-semibold text-white">{f.n}</td>
                  <td className="p-3 text-xs">{f.by}</td>
                  <td className="p-3 text-xs">{f.lang}</td>
                  <td className="p-3 text-xs">{f.shape}</td>
                  <td className="p-3 text-xs text-gray-400">{f.strengths}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Note tone="indigo">
          For a side-by-side of CrewAI, AutoGen and LangGraph on the same task, see <a href="#/agents/frameworks" className="text-blue-400 hover:underline">Frameworks Compared</a>; for LangGraph in depth, <a href="#/agents/langchain" className="text-blue-400 hover:underline">LangChain + LangGraph</a>.
        </Note>
      </Section>

      <Section id="code" title="The Same Agent, Three Ways" lead="A small research helper that can look things up. Notice how much each layer does for you.">
        <div className="space-y-5">
          <div>
            <div className="text-sm font-semibold text-emerald-300 mb-2">OpenAI Agents SDK — tools as functions, handoffs between agents</div>
            <CodeBlock
              language="python"
              code={`from agents import Agent, Runner, function_tool

@function_tool
def search_docs(query: str) -> str:
    """Search the internal documentation."""
    return internal_search(query)

billing = Agent(name="Billing", instructions="Answer billing questions precisely.")
triage = Agent(
    name="Triage",
    instructions="Answer from the docs, or hand billing questions to Billing.",
    tools=[search_docs],
    handoffs=[billing],
)

result = Runner.run_sync(triage, "Why was I charged twice this month?")
print(result.final_output)`}
            />
          </div>
          <div>
            <div className="text-sm font-semibold text-purple-300 mb-2">Claude Agent SDK — a full harness with built-in tools</div>
            <CodeBlock
              language="python"
              code={`import asyncio
from claude_agent_sdk import query, ClaudeAgentOptions

async def main():
    options = ClaudeAgentOptions(
        system_prompt="You are a careful research assistant. Cite file paths.",
        allowed_tools=["Read", "Grep", "Glob", "WebSearch"],   # built-in tools
        permission_mode="default",                             # ask before risky actions
    )
    async for message in query(prompt="Summarise how auth works in ./src", options=options):
        print(message)

asyncio.run(main())
# Custom tools and external systems plug in as MCP servers; see the Agent SDK docs.`}
            />
          </div>
          <div>
            <div className="text-sm font-semibold text-indigo-300 mb-2">LangGraph — the loop as an explicit graph</div>
            <CodeBlock
              language="python"
              code={`from langgraph.graph import StateGraph, MessagesState, START, END
from langgraph.prebuilt import ToolNode, tools_condition
from langgraph.checkpoint.memory import MemorySaver

tools = [search_docs]
llm = chat_model.bind_tools(tools)

def agent(state: MessagesState):
    return {"messages": [llm.invoke(state["messages"])]}

g = StateGraph(MessagesState)
g.add_node("agent", agent)
g.add_node("tools", ToolNode(tools))
g.add_edge(START, "agent")
g.add_conditional_edges("agent", tools_condition, {"tools": "tools", END: END})
g.add_edge("tools", "agent")
app = g.compile(checkpointer=MemorySaver())      # resumable, inspectable state`}
            />
          </div>
        </div>
      </Section>

      <Section id="skills" title="Agent Skills" lead="A skill is a folder that teaches an agent a procedure: a SKILL.md file with instructions, plus any scripts, templates and reference files it needs. Anthropic introduced the format for Claude, and it is simple enough that other agent tools have adopted it too.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5 mb-5">
          <CodeBlock
            language="markdown"
            code={`sql-reporting/
├── SKILL.md
├── scripts/
│   └── build_query.py
└── reference/
    └── schema.md

--- SKILL.md ---
---
name: sql-reporting
description: Build quarterly revenue and churn reports from the
  warehouse. Use when asked for revenue, churn or cohort figures.
---
# SQL reporting
1. Read reference/schema.md for table names — never guess columns.
2. Generate the query with scripts/build_query.py.
3. Always state the date range and filters used in the report.`}
          />
          <div className="space-y-3">
            <Card title="The description is the trigger" tone="purple"><p>Only name and description sit in context all the time. Write the description as “what it does + when to use it”, or the agent will not reach for it.</p></Card>
            <Card title="Code beats prose for exact steps" tone="emerald"><p>A deterministic step — parsing, validation, formatting — belongs in a script the agent runs, not in paragraphs it has to follow.</p></Card>
            <Card title="Skills vs tools vs MCP" tone="indigo"><p><a href="#/mcp" className="text-blue-400 hover:underline">MCP</a> connects an agent to systems (what it can reach); tools are single actions; skills are know-how (how to do a job well). They combine.</p></Card>
          </div>
        </div>
        <SkillsLab />
        <p className="mt-4 mb-0 text-sm"><a href="#/agents/skills" className="text-blue-400 hover:underline font-semibold">Read more →</a> <span className="text-gray-500">the full Agent Skills guide: format, linter lab, where skills run and security.</span></p>
      </Section>

      <Section id="lowcode" title="Low-code Builders" lead="Visual canvases where you wire triggers, LLM calls, tools and branches together. Fast to build, easy to hand to non-engineers, harder to test and version.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="n8n" tone="rose"><p>Workflow automation with hundreds of integrations and AI-agent nodes; self-hostable. Popular for internal ops automations.</p></Card>
          <Card title="Dify" tone="indigo"><p>An LLM app platform: RAG pipelines, agent apps and workflows with a visual editor, plus an API for each app.</p></Card>
          <Card title="Flowise / Langflow" tone="emerald"><p>Drag-and-drop builders over LangChain-style components; quick prototypes that can be exported or served.</p></Card>
          <Card title="Zapier / Make" tone="amber"><p>Mainstream automation tools that added AI steps and agents — the shortest path to connect an LLM to a SaaS stack.</p></Card>
        </div>
      </Section>

      <Section id="advice" title="Choosing Well">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Start with the simplest thing" tone="emerald"><p>Many “agents” are a fixed workflow of two or three model calls. Build that first; add a loop only when the path genuinely cannot be written down in advance.</p></Card>
          <Card title="Keep tools framework-free" tone="indigo"><p>Plain functions with clear docstrings and typed parameters work in every framework, so the framework decision stays reversible.</p></Card>
          <Card title="Look at observability first" tone="amber"><p>You will spend more time reading traces than writing agents. Pick something whose runs you can inspect — see <a href="#/agents/debugging" className="text-blue-400 hover:underline">Debugging Agents</a>.</p></Card>
          <Card title="Beware lock-in of the loop" tone="rose"><p>Heavy abstractions make simple things easy and unusual things hard. If you keep fighting the framework, drop down a layer.</p></Card>
        </div>
      </Section>

      <KnowledgeCheck questions={questionsFor("agents-sdks")} />
    </GuideLayout>
  );
}

import React, { useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";

/* --------------------------------------------------------------------------
   Framework comparison. The tabs show the SAME task written three ways, which
   is the only honest way to compare — feature tables hide how the code feels.
-------------------------------------------------------------------------- */

const SAMPLES = {
  CrewAI: {
    lang: "python",
    blurb:
      "Roles and tasks. You describe who is on the team and what each of them is responsible for, and the framework runs them in order.",
    code: `from crewai import Agent, Task, Crew, Process

researcher = Agent(
    role="Market Researcher",
    goal="Find verifiable facts about {topic}",
    backstory="You check sources and refuse to guess.",
    tools=[search_tool],
    allow_delegation=False,
)

writer = Agent(
    role="Technical Writer",
    goal="Turn research notes into a tight brief",
    backstory="You write plainly and cut adjectives.",
    allow_delegation=False,
)

research = Task(
    description="Research {topic}. Cite every claim.",
    expected_output="Bullet list of facts with sources.",
    agent=researcher,
)
write = Task(
    description="Write a 300-word brief from the research.",
    expected_output="Markdown brief.",
    agent=writer,
    context=[research],          # explicit dependency, not a shared scratchpad
)

crew = Crew(
    agents=[researcher, writer],
    tasks=[research, write],
    process=Process.sequential,  # or hierarchical, with a manager agent
)
result = crew.kickoff(inputs={"topic": "vector databases"})`,
  },
  AutoGen: {
    lang: "python",
    blurb:
      "Conversation. Agents are participants in a chat and the work happens through them talking to each other until a termination condition fires.",
    code: `from autogen_agentchat.agents import AssistantAgent
from autogen_agentchat.teams import RoundRobinGroupChat
from autogen_agentchat.conditions import TextMentionTermination
from autogen_ext.models.openai import OpenAIChatCompletionClient

model = OpenAIChatCompletionClient(model="gpt-4o")

researcher = AssistantAgent(
    "researcher",
    model_client=model,
    tools=[search],
    system_message="Find facts. Cite sources. Never guess.",
)
critic = AssistantAgent(
    "critic",
    model_client=model,
    system_message=(
        "Check the researcher's claims against the cited sources. "
        "Reply APPROVED only when every claim checks out."
    ),
)

# The loop is the point: they argue until the critic is satisfied.
team = RoundRobinGroupChat(
    [researcher, critic],
    termination_condition=TextMentionTermination("APPROVED"),
    max_turns=12,          # always cap it — see the cost note below
)

result = await team.run(task="Research vector databases.")`,
  },
  LangGraph: {
    lang: "python",
    blurb:
      "A state machine. You declare nodes and edges explicitly, so control flow is something you can read off the graph rather than infer from prompts.",
    code: `from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

class State(TypedDict):
    topic: str
    facts: Annotated[list, operator.add]   # reducer: nodes append, not overwrite
    draft: str
    revisions: int

def research(state: State):
    return {"facts": search(state["topic"])}

def write(state: State):
    return {"draft": llm_write(state["facts"]), "revisions": state["revisions"] + 1}

def route(state: State):
    # Ordinary Python decides the flow. No model call, no ambiguity.
    if state["revisions"] >= 3:
        return END
    return "write" if not good_enough(state["draft"]) else END

g = StateGraph(State)
g.add_node("research", research)
g.add_node("write", write)
g.add_edge("research", "write")
g.add_conditional_edges("write", route, {"write": "write", END: END})
g.set_entry_point("research")

app = g.compile(checkpointer=checkpointer)   # resumable, inspectable
result = app.invoke({"topic": "vector databases", "facts": [], "revisions": 0})`,
  },
};

function CodeTabs() {
  const [tab, setTab] = useState("CrewAI");
  const s = SAMPLES[tab];

  return (
    <div>
      <div className="flex flex-wrap gap-2 mb-4">
        {Object.keys(SAMPLES).map((k) => (
          <button
            key={k}
            onClick={() => setTab(k)}
            className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
              tab === k
                ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-200"
                : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
            }`}
          >
            {k}
          </button>
        ))}
      </div>
      <p className="text-sm text-gray-400 leading-relaxed mb-4 max-w-3xl">{s.blurb}</p>
      <CodeBlock language={s.lang} code={s.code} maxHeight="520px" />
    </div>
  );
}

/* -------------------------------------------------------------------------- */

const MATRIX = [
  ["Core metaphor", "Roles on a team", "Agents in a conversation", "Nodes in a state graph"],
  ["Control flow", "Task list, sequential or hierarchical", "Emergent from the dialogue", "Explicit edges you declare"],
  ["Predictability", "Medium", "Low", "High"],
  ["Time to first demo", "Fastest", "Fast", "Slowest"],
  ["Debuggability", "Moderate", "Hard — read transcripts", "Good — inspect state per node"],
  ["Human in the loop", "Basic", "First-class", "First-class, with interrupts"],
  ["Persistence / resume", "Limited", "Limited", "Built in via checkpointers"],
  ["Cost control", "Bounded by task count", "Needs a hard turn cap", "Bounded by graph structure"],
  ["Best for", "Well-understood pipelines", "Open-ended exploration", "Production systems"],
];

export default function AgentsFrameworks() {
  const toc = [
    { label: "Three Philosophies", hash: "philosophies" },
    { label: "The Same Task, Three Ways", hash: "code" },
    { label: "Comparison Matrix", hash: "matrix" },
    { label: "How to Choose", hash: "choose" },
    { label: "The Cost Trap", hash: "cost" },
    { label: "Do You Need One", hash: "need" },
  ];

  return (
    <GuideLayout
      title="CrewAI vs AutoGen vs LangGraph"
      intro="Three multi-agent frameworks with genuinely different views of what an agent system is. The difference is how much control flow you write yourself."
      toc={toc}
    >
      <section id="philosophies" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Three Philosophies</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          All three orchestrate several model calls toward a goal. They disagree about who decides what happens next —
          and that single disagreement explains nearly every other difference between them.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            {
              n: "CrewAI",
              m: "A team with job titles",
              d: "You define roles, goals, and tasks. The framework assigns work and passes output along. The mental model is a small agency with a brief.",
              box: "border-emerald-500/25 bg-emerald-500/[0.07]",
              label: "text-emerald-400",
            },
            {
              n: "AutoGen",
              m: "A group chat",
              d: "Agents are conversational participants. Work emerges from them messaging each other until a termination condition fires. Microsoft Research's line.",
              box: "border-blue-500/25 bg-blue-500/[0.07]",
              label: "text-blue-400",
            },
            {
              n: "LangGraph",
              m: "A state machine",
              d: "Nodes transform shared state, edges define transitions. Agents are one thing a node can contain. You give up magic and get determinism.",
              box: "border-purple-500/25 bg-purple-500/[0.07]",
              label: "text-purple-400",
            },
          ].map((f) => (
            <div key={f.n} className={`p-5 rounded-xl border ${f.box}`}>
              <div className={`font-bold mb-1 ${f.label}`}>{f.n}</div>
              <div className="text-[0.6875rem] uppercase tracking-wide text-gray-500 mb-2.5">{f.m}</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      <section id="code" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Same Task, Three Ways</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Research a topic, then write a brief from it. Read all three and notice where the control flow lives in
          each — that is the thing you are really choosing between.
        </p>
        <CodeTabs />
      </section>

      <section id="matrix" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Comparison Matrix</h2>
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm">
            <thead>
              <tr className="bg-white/5 text-left">
                <th className="px-4 py-3 font-semibold text-white"> </th>
                <th className="px-4 py-3 font-semibold text-emerald-400">CrewAI</th>
                <th className="px-4 py-3 font-semibold text-blue-400">AutoGen</th>
                <th className="px-4 py-3 font-semibold text-purple-400">LangGraph</th>
              </tr>
            </thead>
            <tbody className="text-gray-300">
              {MATRIX.map(([k, ...cells]) => (
                <tr key={k} className="border-t border-white/10">
                  <td className="px-4 py-3 text-xs font-semibold text-gray-400 whitespace-nowrap align-top">{k}</td>
                  {cells.map((c, i) => (
                    <td key={i} className="px-4 py-3 text-xs leading-relaxed">
                      {c}
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </section>

      <section id="choose" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">How to Choose</h2>
        <div className="space-y-3 mb-5">
          {[
            [
              "You know the steps in advance",
              "CrewAI or LangGraph. If the sequence is fixed, do not pay for a framework that rediscovers it at runtime.",
              "border-emerald-500/25 bg-emerald-500/[0.07]",
            ],
            [
              "The path depends on what you find",
              "LangGraph. Conditional edges express branching directly, and you can still read the flow six months later.",
              "border-purple-500/25 bg-purple-500/[0.07]",
            ],
            [
              "You want agents to critique each other",
              "AutoGen. The conversational model is a natural fit for debate, review, and iterative refinement loops.",
              "border-blue-500/25 bg-blue-500/[0.07]",
            ],
            [
              "It has to run unattended in production",
              "LangGraph. Checkpointing, resumability, and explicit state are not nice-to-haves once something fails at 3am.",
              "border-purple-500/25 bg-purple-500/[0.07]",
            ],
            [
              "You are prototyping to see if the idea holds",
              "CrewAI. Shortest distance from an idea to something running. Rewrite later if it survives contact with reality.",
              "border-emerald-500/25 bg-emerald-500/[0.07]",
            ],
          ].map(([q, a, box]) => (
            <div key={q} className={`p-4 rounded-xl border ${box}`}>
              <div className="text-sm font-semibold text-white mb-1">{q}</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{a}</p>
            </div>
          ))}
        </div>
        <div className="p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            These are not exclusive. A common shape is LangGraph as the outer skeleton with individual nodes doing
            whatever they like inside, including calling a crew or a group chat.
          </p>
        </div>
      </section>

      <section id="cost" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Cost Trap</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          Multi-agent systems multiply model calls, and conversational frameworks multiply them the hardest. Every
          agent typically sees the whole transcript, so context grows with each turn and cost grows faster than
          linearly in the number of turns.
        </p>
        <div className="p-5 rounded-xl border border-rose-500/25 bg-rose-500/[0.07] mb-5">
          <div className="font-semibold text-rose-400 mb-2">Two agents, twelve turns, shared transcript</div>
          <p className="text-sm text-gray-300 leading-relaxed m-0">
            Turn 12 sends everything from turns 1 through 11 as input. Summed across the run, total input tokens grow
            roughly with the square of the turn count. A loop that fails to terminate does not merely hang — it bills.
          </p>
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm font-semibold text-white mb-2">Always cap the loop</div>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              A hard maximum on turns, a wall-clock timeout, and a token budget. Treat an unbounded agent loop the way
              you would treat a <span className="font-mono">while True</span> with a network call in it.
            </p>
          </div>
          <div className="p-5 rounded-xl border border-white/10 bg-white/5">
            <div className="text-sm font-semibold text-white mb-2">Use a small model for most roles</div>
            <p className="text-xs text-gray-400 leading-relaxed m-0">
              Routing, summarising, and checking a format do not need your best model. Reserve the expensive one for
              the step whose quality actually determines the outcome.
            </p>
          </div>
        </div>
      </section>

      <section id="need" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Do You Need a Framework at All?</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-5">
          Worth asking seriously. A large share of shipped "agent" systems are a loop, a tool dispatch table, and a
          list of messages — perhaps sixty lines of code with no dependency and no abstraction to learn.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">A framework earns its place when</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>You need durable state across restarts.</li>
              <li>Several agents genuinely coordinate rather than run in sequence.</li>
              <li>You want tracing and replay without building them.</li>
              <li>Human approval steps interrupt and resume the flow.</li>
            </ul>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-xl p-5">
            <h4 className="text-gray-200 font-semibold mb-2">Write it yourself when</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>It is one model with a handful of tools.</li>
              <li>The control flow is a loop you could draw in one line.</li>
              <li>You want to understand every call that gets made.</li>
              <li>Debugging matters more than the first demo.</li>
            </ul>
          </div>
        </div>
        <div className="mt-5 p-4 rounded-xl border border-white/10 bg-white/5">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            Next: <a href="#/agents/debugging" className="text-blue-400 hover:underline">Agent Debugging</a> for what
            goes wrong once these run unattended,{" "}
            <a href="#/agents/multi-agent" className="text-blue-400 hover:underline">Multi-Agent Systems</a> for the
            coordination patterns underneath the frameworks, and{" "}
            <a href="#/agents/a2a" className="text-blue-400 hover:underline">the A2A protocol</a> for agents that
            belong to different owners.
          </p>
        </div>
      </section>
    </GuideLayout>
  );
}

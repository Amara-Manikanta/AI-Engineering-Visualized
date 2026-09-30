import React from 'react';
import GuideLayout from "../components/GuideLayout";
import { motion } from "framer-motion";
import AdvancedFlowchart from "../components/AdvancedFlowchart";
import CodeBlock from "../components/CodeBlock";
import { Card, Note } from "../components/VizKit";
import { DescriptionLab } from "../components/agents/ToolLab";

export const SEARCH_KEYWORDS = ["tool_choice", "forced tool use", "parallel tool calls", "strict tool use", "structured outputs", "tool_result", "is_error", "tool error handling", "tool descriptions", "tool_use", "function calling loop", "disable_parallel_tool_use"];

const toolLoopChart = {
  nodes: [
    { id: 'q', label: 'User Query', x: 20, y: 140, width: 100, height: 40, type: 'default', bg: '#1F2937', borderColor: '#4B5563', color: '#F3F4F6' },
    { id: 'llm', label: 'LLM', x: 170, y: 140, width: 80, height: 50, type: 'default', bg: '#4C1D95', borderColor: '#8B5CF6', color: '#E9D5FF' },
    { id: 'diamond', label: 'Needs\nTool?', x: 300, y: 130, width: 90, height: 70, type: 'diamond' },
    { id: 'tool', label: 'Execute Tool\n(schema + args)', x: 470, y: 40, width: 140, height: 55, type: 'agent' },
    { id: 'answer', label: 'Final Answer', x: 480, y: 230, width: 110, height: 40, type: 'circle' },
  ],
  edges: [
    { source: 'q', target: 'llm', animated: true, type: 'straight' },
    { source: 'llm', target: 'diamond', animated: true, type: 'straight' },
    { source: 'diamond', target: 'tool', animated: true, type: 'curved', color: '#F59E0B' },
    { source: 'diamond', target: 'answer', animated: true, type: 'curved', color: '#10B981' },
    { source: 'tool', target: 'llm', animated: true, type: 'custom', path: 'M 540 95 C 540 -20, 210 -20, 210 138', color: '#38BDF8', dashed: true },
  ],
};

const toc = [
  { label: "What is Tool Calling?", hash: "overview" },
  { label: "The Tool-Call Loop", hash: "loop" },
  { label: "Anatomy of a Tool Schema", hash: "schema" },
  { label: "Parallel vs Sequential Calls", hash: "parallel" },
  { label: "Choosing Tools: tool_choice", hash: "tool-choice" },
  { label: "Strict Schemas & Structured Output", hash: "strict" },
  { label: "Errors and Results", hash: "errors" },
  { label: "Lab: Tool Descriptions", hash: "lab" },
  { label: "The Loop in Code", hash: "code" },
  { label: "Best Practices", hash: "best-practices" },
];

export default function AgentsToolCalling() {
  return (
    <GuideLayout
      title="Tool Calling"
      intro="How an LLM reaches outside its own weights — calling functions, APIs, and code to act on the real world."
      toc={toc}
    >
      <section id="overview" className="mb-14 scroll-mt-24">
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          On its own, an LLM can only predict text. <strong className="text-white">Tool calling</strong> (also called
          "function calling") gives it a structured way to say "run this function with these arguments" instead of
          just describing what it would do. The model never executes anything itself — your application reads the
          model's structured request, runs the real function, and feeds the result back in.
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          {[
            { icon: '📐', title: 'Structured Output', desc: 'The model emits a JSON object matching a schema you define — not free text.' },
            { icon: '🔌', title: 'Your Code Executes', desc: 'The application runtime calls the real function; the model only requests it.' },
            { icon: '🔁', title: 'Result Feeds Back', desc: "The tool's output is appended to context so the model can reason further." },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white/5 border border-white/10 rounded-xl p-5 text-center">
              <div className="text-3xl mb-2">{f.icon}</div>
              <h3 className="font-bold text-gray-200 mb-1">{f.title}</h3>
              <p className="text-sm text-gray-400">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="loop" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Tool-Call Loop</h2>
        <p className="text-gray-300 mb-4 max-w-3xl">
          Every agent framework — ReAct, LangGraph, Claude's own agent loop — implements some version of this cycle.
          The model decides whether it needs a tool; if so, the tool runs and its result is looped back in as new
          context, and the cycle repeats until the model is confident enough to answer directly.
        </p>
        <AdvancedFlowchart nodes={toolLoopChart.nodes} edges={toolLoopChart.edges} currentStep={10} />
      </section>

      <section id="schema" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Anatomy of a Tool Schema</h2>
        <p className="text-gray-300 mb-4 max-w-3xl">
          Every tool is described with a name, a plain-language description (the model reads this to decide
          <em className="text-gray-200"> when</em> to call it), and a JSON Schema for its parameters.
        </p>
        <div className="bg-[#0f0f11] border border-gray-800 rounded-lg p-4 font-mono text-sm overflow-x-auto mb-6 text-gray-300 whitespace-pre">
{`{
  "name": "get_weather",
  "description": "Get the current weather for a given city.",
  "parameters": {
    "type": "object",
    "properties": {
      "city": { "type": "string", "description": "City name, e.g. 'Paris'" },
      "unit": { "type": "string", "enum": ["celsius", "fahrenheit"] }
    },
    "required": ["city"]
  }
}`}</div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 p-4 rounded-lg">
            <h4 className="text-emerald-400 font-semibold mb-2 mt-0">✅ Good description</h4>
            <p className="text-sm text-gray-400">"Search the internal knowledge base for policy documents. Use this before answering any HR-related question."</p>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 p-4 rounded-lg">
            <h4 className="text-rose-400 font-semibold mb-2 mt-0">❌ Vague description</h4>
            <p className="text-sm text-gray-400">"Search stuff." — the model can't reliably decide when this applies.</p>
          </div>
        </div>
      </section>

      <section id="parallel" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Parallel vs Sequential Calls</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-[#111] border border-gray-800 rounded-xl p-5">
            <h3 className="text-indigo-400 font-semibold mb-2">Sequential</h3>
            <p className="text-sm text-gray-300 mb-3">Each tool call depends on the previous one's result — e.g. look up a user ID, then fetch that user's orders.</p>
            <div className="flex items-center gap-2 text-xs font-mono text-gray-400">
              <span className="bg-white/10 px-2 py-1 rounded">get_user_id</span>
              <span>→</span>
              <span className="bg-white/10 px-2 py-1 rounded">get_orders(id)</span>
              <span>→</span>
              <span className="bg-white/10 px-2 py-1 rounded">answer</span>
            </div>
          </div>
          <div className="bg-[#111] border border-gray-800 rounded-xl p-5">
            <h3 className="text-emerald-400 font-semibold mb-2">Parallel</h3>
            <p className="text-sm text-gray-300 mb-3">Independent calls fired together — e.g. checking weather in 3 cities. Modern APIs let a model return multiple tool calls in a single turn.</p>
            <div className="flex flex-wrap items-center gap-2 text-xs font-mono text-gray-400">
              <span className="bg-white/10 px-2 py-1 rounded">weather(NYC)</span>
              <span className="bg-white/10 px-2 py-1 rounded">weather(LA)</span>
              <span className="bg-white/10 px-2 py-1 rounded">weather(SF)</span>
              <span>→ merge → answer</span>
            </div>
          </div>
        </div>
      </section>

      <section id="tool-choice" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Choosing Tools: tool_choice</h2>
        <p className="text-gray-300 mb-4 max-w-3xl">
          By default the model decides whether to call a tool. <span className="font-mono text-emerald-300">tool_choice</span> lets you steer that.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Card title="auto (default)" tone="emerald"><p>The model decides: answer directly, or call one or more tools. Use this for most agents.</p></Card>
          <Card title="any / a named tool" tone="amber"><p>Force a tool call, or one specific tool. Handy for extraction. Some newer models reject forced choice, so check your model's docs; a clear instruction plus a strict schema often works instead.</p></Card>
          <Card title="none" tone="blue"><p>Tools are visible but not allowed. Useful for a final "write the answer" turn.</p></Card>
          <Card title="A common mistake" tone="rose"><p>Forcing a tool on every turn, so the agent can never finish. Force it once, then go back to auto.</p></Card>
        </div>
      </section>

      <section id="strict" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Strict Schemas and Structured Output</h2>
        <p className="text-gray-300 mb-4 max-w-3xl">
          Models usually produce arguments that match your schema, but not always. Two features tighten that.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <Card title="Strict tool use" tone="indigo"><p>Set <span className="font-mono">strict: true</span> on the tool, with <span className="font-mono">additionalProperties: false</span> and every required field listed. The arguments are then guaranteed to validate.</p></Card>
          <Card title="Structured outputs" tone="purple"><p>When you want the final answer as JSON rather than a tool call, ask for a JSON schema for the response format. Same guarantee, no fake tool needed.</p></Card>
        </div>
        <p className="text-xs text-gray-500">Validate arguments in your own code anyway: a schema says a date is a string, not that it is a real date or that the user may act on that record.</p>
      </section>

      <section id="errors" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Errors and Results</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Return every result" tone="emerald"><p>Each tool call needs a matching result. For parallel calls, put all results in a single reply message; splitting them teaches the model to stop calling in parallel.</p></Card>
          <Card title="Mark failures" tone="rose"><p>Set <span className="font-mono">is_error: true</span> on the result and say what went wrong and what to try. The model can then correct itself instead of guessing.</p></Card>
          <Card title="Keep results short" tone="amber"><p>Return the fields needed, paginate lists, and truncate long text. Large results eat context (see <a href="#/agents/context-engineering" className="text-blue-400 hover:underline">Context Engineering</a>).</p></Card>
        </div>
      </section>

      <section id="lab" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Lab: Tool Descriptions</h2>
        <DescriptionLab />
      </section>

      <section id="code" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">The Loop in Code</h2>
        <CodeBlock
          language="python"
          code={`import anthropic

client = anthropic.Anthropic()

tools = [{
    "name": "get_weather",
    "description": "Get the current weather for a city. Use when the user asks about weather.",
    "strict": True,
    "input_schema": {
        "type": "object",
        "properties": {"city": {"type": "string"}},
        "required": ["city"],
        "additionalProperties": False,
    },
}]

messages = [{"role": "user", "content": "Weather in Pune and Delhi?"}]

while True:
    response = client.messages.create(
        model="claude-opus-5-5", max_tokens=1024, tools=tools, messages=messages
    )
    if response.stop_reason != "tool_use":
        break
    messages.append({"role": "assistant", "content": response.content})

    results = []                                    # may hold several parallel calls
    for block in response.content:
        if block.type == "tool_use":
            try:
                out, is_error = run_tool(block.name, block.input), False
            except Exception as e:                  # tell the model what went wrong
                out, is_error = f"Error: {e}", True
            results.append({"type": "tool_result", "tool_use_id": block.id,
                            "content": out, "is_error": is_error})
    messages.append({"role": "user", "content": results})   # ALL results in one message

print(response.content[0].text)`}
        />
        <div className="mt-4">
          <Note tone="indigo">The SDK also has a tool runner that does this loop for you; write it by hand once so you know what it does.</Note>
        </div>
      </section>

      <section id="best-practices" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Best Practices</h2>
        <ul className="list-disc pl-6 text-gray-300 space-y-2">
          <li><strong className="text-white">Keep tool sets small and focused.</strong> Models get worse at picking the right tool past ~20 active tools — group into on-demand sets when possible.</li>
          <li><strong className="text-white">Return structured, truncated results.</strong> A 50,000-row SQL dump will blow the context window; summarize or paginate.</li>
          <li><strong className="text-white">Fail loudly with useful errors.</strong> A tool error message like "invalid date format, expected YYYY-MM-DD" lets the model self-correct on the next turn.</li>
          <li><strong className="text-white">Validate arguments before executing.</strong> Never trust model-generated arguments blindly for destructive or financial actions — add a confirmation or permission layer.</li>
        </ul>
      </section>
    </GuideLayout>
  );
}

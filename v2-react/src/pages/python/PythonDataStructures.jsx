import React, { useState } from 'react';
import GuideLayout from '../../components/GuideLayout';
import KnowledgeCheck from "../../components/KnowledgeCheck";
import { questionsFor } from "../../data/quizBank";
import { CodeSnippet } from '../../components/CodeBlock';

/* ---------------------------------------------------------------------------
   LEGB scope resolution — nested rings showing where Python looks for a name,
   innermost first. Click a lookup to trace which scope actually resolves it.
--------------------------------------------------------------------------- */

const LEGB_LAYERS = [
  { key: 'L', name: 'Local', desc: 'Inside the current function', holds: 'msg = "local"', tone: 'border-emerald-500 bg-emerald-500/15 text-emerald-300' },
  { key: 'E', name: 'Enclosing', desc: 'Any outer function wrapping this one', holds: 'helper = ...', tone: 'border-blue-500 bg-blue-500/15 text-blue-300' },
  { key: 'G', name: 'Global', desc: 'Top level of the module', holds: 'CONFIG = {...}', tone: 'border-amber-500 bg-amber-500/15 text-amber-300' },
  { key: 'B', name: 'Built-in', desc: 'Always available: len, print, str…', holds: 'len, print', tone: 'border-purple-500 bg-purple-500/15 text-purple-300' },
];

const LEGB_LOOKUPS = [
  { name: 'msg', resolvedAt: 0, note: 'Found immediately in Local — the search stops here and never looks outward.' },
  { name: 'helper', resolvedAt: 1, note: 'Not local. Python walks out to the Enclosing function and finds it there.' },
  { name: 'CONFIG', resolvedAt: 2, note: 'Not local or enclosing — resolved at module Global level.' },
  { name: 'len', resolvedAt: 3, note: 'Falls all the way through to Built-ins. This is why shadowing `len = 5` breaks things.' },
];

function LegbVisual() {
  const [pick, setPick] = useState(0);
  const lookup = LEGB_LOOKUPS[pick];

  return (
    <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-5 mb-4">
      <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-3">
        Looking up a name — click one to trace the search
      </div>
      <div className="flex flex-wrap gap-2 mb-5">
        {LEGB_LOOKUPS.map((l, i) => (
          <button
            key={l.name}
            onClick={() => setPick(i)}
            className={`px-3 py-1.5 rounded-lg border font-mono text-xs transition-colors ${
              pick === i
                ? 'bg-indigo-500/20 border-indigo-500/50 text-indigo-200'
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
            }`}
          >
            {l.name}
          </button>
        ))}
      </div>

      {/* nested rings, outermost first so Local sits innermost */}
      <div className="space-y-0">
        {LEGB_LAYERS.map((layer, i) => {
          const searched = i <= lookup.resolvedAt;
          const isHit = i === lookup.resolvedAt;
          return (
            <div
              key={layer.key}
              style={{ marginLeft: `${i * 18}px` }}
              className={`relative rounded-xl border-2 p-3 transition-all ${
                isHit ? layer.tone : searched ? 'border-gray-700 bg-white/[0.03]' : 'border-gray-800/60 bg-transparent opacity-40'
              }`}
            >
              <div className="flex items-center gap-2 flex-wrap">
                <span className={`w-6 h-6 rounded flex items-center justify-center text-xs font-black shrink-0 ${
                  isHit ? 'bg-white/20' : 'bg-white/5 text-gray-500'
                }`}>
                  {layer.key}
                </span>
                <span className={`text-sm font-bold ${isHit ? '' : 'text-gray-400'}`}>{layer.name}</span>
                <code className="text-[0.625rem] font-mono text-gray-500">{layer.holds}</code>
                {searched && !isHit && (
                  <span className="ml-auto text-[0.625rem] text-gray-600 font-mono">not here → keep looking</span>
                )}
                {isHit && (
                  <span className="ml-auto text-[0.625rem] font-bold font-mono">✓ FOUND — search stops</span>
                )}
              </div>
              <div className="text-[0.625rem] text-gray-600 mt-0.5 ml-8">{layer.desc}</div>
            </div>
          );
        })}
      </div>

      <p className="text-[0.6875rem] text-gray-400 leading-relaxed mt-4 mb-0">{lookup.note}</p>
    </div>
  );
}
import { Code2, Terminal, FileCode, Layers, Box, Database, Sliders, Type, Repeat, Hash, Search, ArrowRight, MessageSquare } from 'lucide-react';

export default function PythonDataStructures() {
  const toc = [
    { label: "16. Functions & Default Parameters", hash: "#functions-params" },
    { label: "17. *args & **kwargs Arguments", hash: "#args-kwargs" },
    { label: "18. LEGB Scope Resolution", hash: "#legb-scope" },
    { label: "19. Lambda & Higher-Order Functions", hash: "#lambda-functions" },
    { label: "20. Lists & List Methods", hash: "#lists" },
    { label: "21. Tuples & Tuple Unpacking", hash: "#tuples" },
    { label: "22. Dictionaries & LLM Message Objects", hash: "#dictionaries" },
    { label: "23. Nested Data Structures & LLM Payloads", hash: "#nested-structures" },
    { label: "24. Sets & Set Operations", hash: "#sets" },
    { label: "25. collections Module", hash: "#collections-module" },
    { label: "26. Strings & Prompt Engineering", hash: "#strings-slicing" },
    { label: "27. Regular Expressions (re)", hash: "#regex" },
    { label: "28. List & Dict Comprehensions", hash: "#comprehensions" }
  ];

  return (
    <GuideLayout
      title="Module 2: Data Structures & Core Logic"
      intro="Detailed technical guide for functions, scope resolution, built-in containers (lists, tuples, dicts, sets), LLM payload dictionaries, string operations for prompt engineering, regex, and comprehensions."
      toc={toc}
    >
      {/* 15. FUNCTIONS & DEFAULT PARAMS */}
      <section id="functions-params" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Sliders size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">16. Functions & Default Parameters</h2>
            <p className="text-xs text-gray-400">Defining functions, positional/keyword arguments, mutable default parameter traps</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Functions in Python encapsulate reusable blocks of executable logic. Arguments can be passed positionally or explicitly by keyword name. A notorious Python anti-pattern is using mutable default arguments like `store=[]`, which are evaluated only once when the function is defined; all subsequent calls share the exact same object reference. To avoid state leakage, always default mutable arguments to `None` and initialize them inside the function body.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-blue-400"><FileCode size={12} /> 15_functions.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-blue-300 mb-3 whitespace-pre-wrap">{`# Avoid mutable default arguments (use None instead)
def add_embedding(vec: list, store: list = None) -> list:
    if store is None:
        store = []
    store.append(vec)
    return store

print(add_embedding([0.1, 0.2]))`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>[[0.1, 0.2]]</code>
          </div>
        </div>
      </section>

      {/* 16. ARGS AND KWARGS */}
      <section id="args-kwargs" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Sliders size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">17. Variable Arguments (`*args` & `**kwargs`)</h2>
            <p className="text-xs text-gray-400">Packing variable positional arguments into tuples and keyword arguments into dictionaries</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          The `*args` parameter collects extra positional arguments into an immutable tuple, whereas `**kwargs` captures unexpected keyword arguments into a standard dictionary. This allows functions to accept arbitrary, dynamic call signatures. Using `*args` and `**kwargs` is crucial when designing wrapper decorators, subclass initializers, or middleware API handlers that forward arguments transparently.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-purple-400"><FileCode size={12} /> 16_args_kwargs.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-purple-300 mb-3 whitespace-pre-wrap">{`def configure_agent(agent_name, *tools, **hyperparams):
    print(f"Agent: {agent_name}")
    print(f"Tools ({len(tools)}): {tools}")
    print(f"Hyperparams: {hyperparams}")

configure_agent("RAGBot", "search", "calculator", temp=0.2, top_p=0.9)`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Agent: RAGBot<br/>Tools (2): ('search', 'calculator')<br/>Hyperparams: {"{'temp': 0.2, 'top_p': 0.9}"}</code>
          </div>
        </div>
      </section>

      {/* 17. LEGB SCOPE */}
      <section id="legb-scope" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Layers size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">18. LEGB Scope Resolution</h2>
            <p className="text-xs text-gray-400">Local, Enclosing, Global, Built-in scopes and `global`/`nonlocal` keywords</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Python resolves variable names using the strict LEGB lookup sequence: <strong className="text-white">L</strong>ocal (inside current function), <strong className="text-white">E</strong>nclosing (outer nested functions), <strong className="text-white">G</strong>lobal (module level), and <strong className="text-white">B</strong>uilt-in (predefined names like <code>len</code>). The search runs strictly inside-out and <em>stops at the first match</em> — which is why a local variable can silently shadow a global one. Variables created inside functions are local by default: to modify a global, declare <code>global var_name</code>; to modify an outer enclosing variable, declare <code>nonlocal var_name</code>.
        </p>

        <LegbVisual />

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-cyan-400"><FileCode size={12} /> 17_legb_scope.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-cyan-300 mb-3 whitespace-pre-wrap">{`global_count = 0

def outer():
    enclosing_val = 10
    def inner():
        nonlocal enclosing_val
        enclosing_val += 5
        return enclosing_val
    return inner()

print("Nested result:", outer())`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Nested result: 15</code>
          </div>
        </div>
      </section>

      {/* 18. LAMBDA */}
      <section id="lambda-functions" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Code2 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">19. Lambda & Higher-Order Functions</h2>
            <p className="text-xs text-gray-400">Anonymous functions (`lambda`), `map()`, `filter()`, and custom sorting keys</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Lambda expressions create small, anonymous, single-expression functions inline without requiring a full `def` block. They are frequently passed to higher-order functions like `map()` and `filter()`, or used as key extractors in `list.sort()` and `sorted()` calls. Lambda functions return expression results automatically without an explicit `return` statement.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-emerald-400"><FileCode size={12} /> 18_lambda.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-emerald-300 mb-3 whitespace-pre-wrap">{`docs = [{"score": 0.85}, {"score": 0.99}, {"score": 0.92}]

# Sort list of dicts by score descending using lambda
docs.sort(key=lambda d: d["score"], reverse=True)
print("Top Document Score:", docs[0]["score"])`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Top Document Score: 0.99</code>
          </div>
        </div>
      </section>

      {/* 19. LISTS */}
      <section id="lists" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Box size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">20. Lists & List Methods</h2>
            <p className="text-xs text-gray-400">Mutable dynamic arrays (`append`, `extend`, `pop`, `insert`, `sort`)</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Lists are ordered, mutable sequences backed by dynamic arrays of object references in memory. Appending items with `.append()` runs in amortized $O(1)$ constant time, while `.extend()` concatenates another sequence into the list in-place. The `.pop()` method removes and returns an item from any index ($O(1)$ from the end, $O(n)$ from the start), and `.sort()` executes Python's highly optimized Timsort algorithm.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-amber-400"><FileCode size={12} /> 19_lists.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-amber-300 mb-3 whitespace-pre-wrap">{`tokens = ["AI", "Model"]
tokens.append("Agent")
tokens.extend(["RAG", "LLM"])
last_token = tokens.pop()

print("Tokens:", tokens)
print("Popped Token:", last_token)`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Tokens: ['AI', 'Model', 'Agent', 'RAG']<br/>Popped Token: LLM</code>
          </div>
        </div>
      </section>

      {/* 20. TUPLES */}
      <section id="tuples" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Box size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">21. Tuples & Tuple Unpacking</h2>
            <p className="text-xs text-gray-400">Immutable sequences, sequence unpacking `a, *rest, b = tuple`</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Tuples are ordered, immutable sequences defined using parentheses `()`. Because their contents cannot be modified post-creation, Python allocates them in compact, fixed memory structures that execute faster and use less overhead than lists. Tuple unpacking allows assigning multiple elements to distinct variables in a single expression, including extended unpacking like `first, *middle, last = sequence`.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-teal-400"><FileCode size={12} /> 20_tuples.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-teal-300 mb-3 whitespace-pre-wrap">{`dimensions = (1, 512, 1536)
batch, *middle, embed_dim = dimensions

print(f"Batch: {batch}, Embed Dim: {embed_dim}")`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Batch: 1, Embed Dim: 1536</code>
          </div>
        </div>
      </section>

      {/* 21. DICTIONARIES */}
      <section id="dictionaries" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Database size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">22. Dictionaries & LLM Message Objects</h2>
            <p className="text-xs text-gray-400">Hash maps, $O(1)$ lookups, `get()`, `setdefault()`, `update()`, views</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Dictionaries are key-value hash maps providing $O(1)$ average-time complexity for lookups, insertions, and deletions. Keys must be immutable and hashable (strings, numbers, tuples). Methods like `.get(key, default)` safely retrieve values without throwing `KeyError` exceptions, while `.setdefault()` inserts default values when keys are missing.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-rose-400"><FileCode size={12} /> 21_dicts.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-rose-300 mb-3 whitespace-pre-wrap">{`config = {"model": "gpt-4o"}

# Safe retrieval with fallback default
temp = config.get("temperature", 0.7)
config.setdefault("top_p", 1.0)

print(config)
print("Temperature:", temp)`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>{'{\n  "model": "gpt-4o",\n  "top_p": 1.0\n}'}<br/>Temperature: 0.7</code>
          </div>
        </div>
      </section>

      {/* 22. NESTED STRUCTURES & LLM PAYLOADS */}
      <section id="nested-structures" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <MessageSquare size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">23. Nested Data Structures & LLM Message Objects</h2>
            <p className="text-xs text-gray-400">Why for AI engineering dictionaries are essential (`role`, `content`, `metadata`, `tool_calls`)</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          <strong>Why is this critical for AI Engineering?</strong> Because Large Language Model (LLM) APIs like OpenAI, Anthropic, and LangChain communicate exclusively using structured message dictionaries. Key fields like <code>role</code> (system, user, assistant), <code>content</code> (prompt or response text), <code>metadata</code>, and <code>tool_calls</code> rely heavily on nested dictionary and list manipulation.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-indigo-400"><FileCode size={12} /> 22_llm_message.py</span>
            <span>LLM API Payload Example</span>
          </div>
          <CodeSnippet className="text-indigo-300 mb-3 whitespace-pre-wrap">{`message = {
    "role": "user",
    "content": "Explain RAG",
    "metadata": {"source": "web"},
    "tool_calls": []
}

print(f"Role: {message['role']}")
print(f"Prompt: {message['content']}")`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Role: user<br/>Prompt: Explain RAG</code>
          </div>
        </div>
      </section>

      {/* 23. SETS */}
      <section id="sets" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
            <Hash size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">24. Sets & Set Operations</h2>
            <p className="text-xs text-gray-400">Unordered collections of unique elements (`union`, `intersection`, `difference`)</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Sets are unordered collections of unique, hashable elements backed by hash tables. They feature fast $O(1)$ membership testing (`x in my_set`) and built-in mathematical set operations. Common operators include union (`|`), intersection (`&`), difference (`-`), and symmetric difference (`^`). Sets are ideal for deduplicating data streams.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-pink-400"><FileCode size={12} /> 23_sets.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-pink-300 mb-3 whitespace-pre-wrap">{`set_a = {"python", "rag", "ai"}
set_b = {"ai", "ml", "dl"}

print("Intersection:", set_a & set_b)
print("Difference (A - B):", set_a - set_b)`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Intersection: {'{\n  "ai"\n}'}<br/>Difference (A - B): {'{\n  "python", "rag"\n}'}</code>
          </div>
        </div>
      </section>

      {/* 24. COLLECTIONS MODULE */}
      <section id="collections-module" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Box size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">25. `collections` Module (`Counter`, `defaultdict`, `deque`, `namedtuple`)</h2>
            <p className="text-xs text-gray-400">High-performance specialized container datatypes</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          The built-in `collections` module provides specialized data structures beyond basic primitives. `Counter` counts element frequencies, `defaultdict` supplies factory functions to handle missing keys automatically, `deque` offers double-ended queues with $O(1)$ appends and pops from both ends, and `namedtuple` creates lightweight tuple classes with accessible field names.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-blue-400"><FileCode size={12} /> 24_collections.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-blue-300 mb-3 whitespace-pre-wrap">{`from collections import defaultdict, deque

# defaultdict avoids KeyErrors automatically
graph = defaultdict(list)
graph["node_a"].append("node_b")

# Double-ended queue for O(1) pops from left
queue = deque(["task_1", "task_2"])
queue.appendleft("priority_task")

print(dict(graph))
print(list(queue))`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>{'{\n  "node_a": ["node_b"]\n}'}<br/>['priority_task', 'task_1', 'task_2']</code>
          </div>
        </div>
      </section>

      {/* 25. STRINGS & PROMPT ENGINEERING */}
      <section id="strings-slicing" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Type size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">26. Strings & Prompt Engineering Techniques</h2>
            <p className="text-xs text-gray-400">Indexing, Slicing, `f-strings`, `split`, `join`, `replace`, `strip`, multiline strings (`"""`)</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          <strong>Very important for Prompt Engineering!</strong> String manipulation is the core driver of LLM prompt formatting. Key operations include string indexing (`text[0]`), slicing (`text[0:10]`), `f-strings` for dynamic prompt injection, `.split()` and `.join()` for chunking, `.replace()` and `.strip()` for whitespace cleaning, and triple-quoted multiline strings (`"""..."""`) for System Prompts.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-purple-400"><FileCode size={12} /> 25_prompt_strings.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-purple-300 mb-3 whitespace-pre-wrap">{`user_query = "   What is RAG?   "
clean_query = user_query.strip()

# Multiline System Prompt Template with f-string interpolation
system_prompt = f"""
System: You are an AI Assistant.
User Query: {clean_query}
Instruction: Provide a concise response.
"""

print(system_prompt.strip())`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>System: You are an AI Assistant.<br/>User Query: What is RAG?<br/>Instruction: Provide a concise response.</code>
          </div>
        </div>
      </section>

      {/* 26. REGEX */}
      <section id="regex" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Search size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">27. Regular Expressions (`re` Module)</h2>
            <p className="text-xs text-gray-400">A short introduction — the full treatment lives in Module 6</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          The <code>re</code> module provides regular expression operations for pattern searching, token extraction, and string transformation. <code>re.search()</code> scans strings for the first matching pattern, <code>re.findall()</code> returns all non-overlapping matches as a list, and <code>re.sub()</code> substitutes matching patterns with replacement strings. Raw string literals (<code>r"pattern"</code>) should always be used to avoid escaping backslashes.
        </p>

        <a
          href="#/python/regex"
          className="flex items-center justify-between gap-3 p-4 rounded-xl border border-rose-500/30 bg-rose-500/10 hover:border-rose-500/60 transition-colors mb-4 group"
        >
          <div>
            <div className="text-rose-300 font-bold text-xs mb-1">Full guide: Module 6 — Regular Expressions</div>
            <p className="text-[0.6875rem] text-gray-300 leading-relaxed m-0">
              A live interactive tester, the complete syntax reference, greedy vs lazy, capture groups, lookarounds,
              the whole <code>re</code> API, and a practical cookbook.
            </p>
          </div>
          <ArrowRight size={18} className="text-rose-400 shrink-0 group-hover:translate-x-1 transition-transform" />
        </a>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-cyan-400"><FileCode size={12} /> 26_regex.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-cyan-300 mb-3 whitespace-pre-wrap">{`import re

log = "ERROR 2026-08-04: Connection timeout in module X"
date = re.search(r'\\d{4}-\\d{2}-\\d{2}', log).group()

print("Extracted Date:", date)`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Extracted Date: 2026-08-04</code>
          </div>
        </div>
      </section>

      {/* 27. COMPREHENSIONS */}
      <section id="comprehensions" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Repeat size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">28. List, Dict & Set Comprehensions</h2>
            <p className="text-xs text-gray-400">Processing sequences with conditional filtering `[x for x in list if condition]`</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Comprehensions provide a concise, readable syntax for creating new lists, dictionaries, or sets by transforming iterables. Syntax like `[expression for item in iterable if condition]` replaces verbose `for` loop boilerplate. Because comprehensions execute directly at C-level bytecode inside CPython, they build collections significantly faster than manual list appends.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-emerald-400"><FileCode size={12} /> 27_comprehensions.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-emerald-300 mb-3 whitespace-pre-wrap">{`scores = {"doc1": 0.82, "doc2": 0.95, "doc3": 0.40}

# Filter dict elements above threshold 0.8
top_docs = {k: v for k, v in scores.items() if v >= 0.8}

print("Top Docs Dict:", top_docs)`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Top Docs Dict: {'{\n  "doc1": 0.82,\n  "doc2": 0.95\n}'}</code>
          </div>
        </div>
      </section>
      <KnowledgeCheck questions={questionsFor("python-core")} />
    </GuideLayout>
  );
}

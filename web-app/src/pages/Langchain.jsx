import { useState } from "react";
import GuideLayout from "../components/GuideLayout";
import { motion } from "framer-motion";
import LangChainArchitecture from "../components/LangChainArchitecture";

export default function Langchain() {
  const [step, setStep] = useState(1);
  const totalSteps = 5;
  const handleNext = () => setStep((s) => (s < totalSteps ? s + 1 : 1));
  const handlePrev = () => setStep((s) => (s > 1 ? s - 1 : totalSteps));
  const handleReset = () => setStep(1);

  const toc = [
    { label: "1. What is LangChain?", hash: "#what-is" },
    { label: "2. Why LangChain?", hash: "#why-langchain" },
    { label: "3. Architecture", hash: "#architecture" },
    { label: "4. Installation", hash: "#installation" },
    { label: "5. Project Structure", hash: "#structure" },
    { label: "6. LCEL", hash: "#lcel" },
    { label: "6.1 What is LCEL?", hash: "#lcel-what", indent: true },
    { label: "6.2 Why LCEL?", hash: "#lcel-why", indent: true },
    { label: "6.3 Pipe Operator (|)", hash: "#pipe", indent: true },
    { label: "6.4 Runnable Interface", hash: "#runnable", indent: true },
    { label: "6.5 invoke()", hash: "#invoke", indent: true },
    { label: "6.6 batch()", hash: "#batch", indent: true },
    { label: "6.7 stream()", hash: "#stream", indent: true },
    { label: "6.8 RunnableSequence", hash: "#runnable-sequence", indent: true },
    { label: "6.9 RunnableParallel", hash: "#runnable-parallel", indent: true },
    { label: "6.10 RunnableBranch", hash: "#runnable-branch", indent: true },
    { label: "7. LangSmith", hash: "#langsmith" },
    { label: "8. Best Practices", hash: "#best-practices" },
    { label: "9. LangGraph", hash: "#langgraph" },
    { label: "9.1 Key Concepts", hash: "#langgraph-concepts", indent: true },
    { label: "9.2 Interactive Demo", hash: "#langgraph-demo", indent: true },
    { label: "9.3 Code Example", hash: "#langgraph-code", indent: true },
    { label: "9.4 Agent Patterns", hash: "#langgraph-patterns", indent: true },
  ];

  return (
    <GuideLayout 
      title="LangChain"
      intro="The framework for building context-aware reasoning applications."
      toc={toc}
    >
      <motion.section id="what-is" className="border-b border-white/10 pb-8 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-white mb-4">1. What is LangChain?</h2>
        <p className="text-gray-400 leading-relaxed mb-6">
          LangChain is a framework designed to simplify the creation of applications using large language models (LLMs). It provides a standard interface for connecting LLMs to external data sources (like databases or APIs) and enabling them to interact with their environment.
        </p>
      </motion.section>

      <motion.section id="why-langchain" className="border-b border-white/10 pb-8 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-white mb-4">2. Why LangChain?</h2>
        <p className="text-gray-400 leading-relaxed mb-4">
          Building a robust AI application requires more than just calling an API. LangChain solves several massive problems:
        </p>
        <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4 mb-6">
          <li><strong>Composability:</strong> Easily chain together prompts, models, output parsers, and tools.</li>
          <li><strong>Model Agnosticism:</strong> Switch from OpenAI to Ollama (or Anthropic, or Google) just by changing one line of code, without rewriting your prompts or parsers.</li>
          <li><strong>Standardized Tooling:</strong> Pre-built document loaders, vector store integrations, and memory modules.</li>
        </ul>
      </motion.section>

      <motion.section id="architecture" className="border-b border-white/10 pb-8 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-white mb-4">3. LangChain Architecture</h2>
        <LangChainArchitecture />
        <div className="overflow-x-auto mb-6">
          <table className="w-full text-left border-collapse text-gray-400">
            <thead>
              <tr className="bg-white/5 border border-white/10">
                <th className="p-3 font-semibold text-white border border-white/10">Package</th>
                <th className="p-3 font-semibold text-white border border-white/10">Description</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <td className="p-3 border border-white/10 font-mono text-sm text-indigo-300">langchain-core</td>
                <td className="p-3 border border-white/10">Base abstractions (Runnables, Messages) and LCEL. Rarely changes.</td>
              </tr>
              <tr>
                <td className="p-3 border border-white/10 font-mono text-sm text-indigo-300">langchain-community</td>
                <td className="p-3 border border-white/10">Third-party integrations (mostly deprecated/moved to partner packages).</td>
              </tr>
              <tr>
                <td className="p-3 border border-white/10 font-mono text-sm text-indigo-300">langchain-[partner]</td>
                <td className="p-3 border border-white/10">Specific integrations maintained closely with partners (e.g., <code className="text-indigo-300 bg-white/5 px-1 rounded">langchain-ollama</code>, <code className="text-indigo-300 bg-white/5 px-1 rounded">langchain-openai</code>).</td>
              </tr>
              <tr>
                <td className="p-3 border border-white/10 font-mono text-sm text-indigo-300">langgraph</td>
                <td className="p-3 border border-white/10">Extension for building stateful, multi-actor applications with cyclic graphs (agents).</td>
              </tr>
            </tbody>
          </table>
        </div>
      </motion.section>

      <motion.section id="installation" className="border-b border-white/10 pb-8 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-white mb-4">4. Installation</h2>
        <p className="text-gray-400 leading-relaxed mb-4">
          For a local setup using Ollama, install the core package and the specific Ollama integration.
        </p>
        <pre className="bg-[#141414] border border-white/10 rounded-xl p-4 font-mono text-sm text-gray-300 overflow-x-auto mb-6">
          {`pip install langchain-core langchain-ollama`}
        </pre>
      </motion.section>

      <motion.section id="structure" className="border-b border-white/10 pb-8 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-white mb-4">5. Project Structure</h2>
        <p className="text-gray-400 leading-relaxed mb-4">
          A clean architecture for a LangChain project:
        </p>
        <pre className="bg-[#141414] border border-white/10 rounded-xl p-4 font-mono text-sm text-gray-300 overflow-x-auto mb-6">
{`my_ai_app/
├── core/
│   ├── llm.py         # Initializes the Ollama model
│   └── prompts.py     # Stores reusable PromptTemplates
├── chains/
│   └── qa_chain.py    # LCEL compositions
├── tools/
│   └── search.py      # Custom tools for agents
└── main.py            # Entry point`}
        </pre>
      </motion.section>

      <motion.section id="lcel" className="border-b border-white/10 pb-8 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-white mb-4">6. LCEL (LangChain Expression Language)</h2>
        <p className="text-gray-400 leading-relaxed mb-6">
          LangChain Expression Language (LCEL) is the foundational architecture of modern LangChain. It provides a standardized, declarative way to compose different components (Runnables) into chains.
        </p>

        <div className="bg-indigo-500/10 border border-indigo-500/30 rounded-xl p-6 mb-8 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div>
            <h4 className="text-white font-bold mb-2">Jupyter Notebook Companion</h4>
            <p className="text-sm text-indigo-300 m-0">Run these exact LCEL examples offline using Ollama and Python.</p>
          </div>
          <a href="../notebooks/01-langchain-lcel.ipynb" download className="bg-indigo-600 hover:bg-indigo-700 text-white px-4 py-2 rounded-lg font-semibold transition-colors whitespace-nowrap">
            📥 Download .ipynb
          </a>
        </div>

        <h3 id="lcel-what" className="text-xl font-bold text-white mt-8 mb-4">6.1 What is LCEL?</h3>
        <p className="text-gray-400 leading-relaxed mb-6">
          LCEL is not a new programming language; it is a declarative syntax built using Python's operator overloading (specifically the pipe operator <code className="text-indigo-300 bg-white/5 px-1 rounded">|</code>) that allows you to chain arbitrary LangChain objects together.
        </p>

        <h3 id="lcel-why" className="text-xl font-bold text-white mt-8 mb-4">6.2 Why LCEL?</h3>
        <ul className="list-disc list-inside text-gray-400 space-y-2 ml-4 mb-6">
          <li><strong>First-class Streaming:</strong> Any chain built with LCEL can stream tokens automatically.</li>
          <li><strong>Async Support:</strong> You don't have to write separate async code; LCEL handles <code className="text-indigo-300 bg-white/5 px-1 rounded">await chain.ainvoke()</code> natively.</li>
          <li><strong>Parallel Execution:</strong> Steps that don't depend on each other can execute in parallel automatically.</li>
        </ul>

        <h3 id="pipe" className="text-xl font-bold text-indigo-400 mt-8 mb-4">6.3 Pipe Operator (|)</h3>
        <p className="text-gray-400 leading-relaxed mb-6">The pipe operator automatically passes the output of the left component directly into the input of the right component.</p>
        
        {/* Enhanced Framer Motion Pipeline Animation */}
        <div className="bg-[#141414] border border-white/10 rounded-xl p-8 flex flex-col lg:flex-row items-center justify-center gap-4 overflow-hidden min-h-[200px] mb-8">
            
            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="bg-[#1a1a1a] border-2 border-orange-500/50 rounded-xl p-4 text-center z-10 w-32"
            >
              <div className="text-orange-400 font-bold mb-1">Dict</div>
              <div className="text-xs text-gray-500 font-mono">{`{"topic": "cats"}`}</div>
            </motion.div>

            <div className="relative w-16 h-1 bg-white/10 hidden lg:block">
              <motion.div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-orange-500 rounded-full" animate={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear" }} />
            </div>

            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.2 }}
              className="bg-[#1a1a1a] border-2 border-blue-500/50 rounded-xl p-4 text-center z-10 w-32"
            >
              <div className="text-blue-400 font-bold">Prompt</div>
            </motion.div>

            <div className="relative w-16 h-1 bg-white/10 hidden lg:block">
              <motion.div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-blue-500 rounded-full" animate={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 0.5 }} />
            </div>

            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="bg-[#1a1a1a] border-2 border-green-500/50 rounded-xl p-4 text-center z-10 w-32"
            >
              <div className="text-green-400 font-bold mb-1">LLM</div>
              <div className="text-xs text-gray-500 font-mono">Ollama</div>
            </motion.div>

            <div className="relative w-16 h-1 bg-white/10 hidden lg:block">
              <motion.div className="absolute top-1/2 -translate-y-1/2 w-4 h-4 bg-green-500 rounded-full" animate={{ left: ["0%", "100%"], opacity: [0, 1, 1, 0] }} transition={{ duration: 1.5, repeat: Infinity, ease: "linear", delay: 1 }} />
            </div>

            <motion.div 
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="bg-[#1a1a1a] border-2 border-purple-500/50 rounded-xl p-4 text-center z-10 w-32"
            >
              <div className="text-purple-400 font-bold">StrParser</div>
            </motion.div>

        </div>

        <h3 id="runnable" className="text-xl font-bold text-white mt-8 mb-4">6.4 Runnable Interface</h3>
        <p className="text-gray-400 leading-relaxed mb-6">
          Every element in LCEL (Prompts, Models, Parsers, Chains) implements the <code className="text-indigo-300 bg-white/5 px-1 rounded">Runnable</code> protocol. This means they all share the exact same methods, guaranteeing that any block can connect to any other block.
        </p>

        <h3 id="invoke" className="text-xl font-bold text-white mt-8 mb-4">6.5 invoke()</h3>
        <p className="text-gray-400 leading-relaxed mb-4">Calls the chain on a single input and waits for the full response to complete.</p>
        <pre className="bg-[#141414] border border-white/10 rounded-xl p-4 font-mono text-sm text-gray-300 overflow-x-auto mb-6">
{`response = chain.invoke({"topic": "bears"})
print(response)`}
        </pre>

        <h3 id="batch" className="text-xl font-bold text-white mt-8 mb-4">6.6 batch()</h3>
        <p className="text-gray-400 leading-relaxed mb-4">Calls the chain on a list of inputs simultaneously, running them in parallel.</p>
        <pre className="bg-[#141414] border border-white/10 rounded-xl p-4 font-mono text-sm text-gray-300 overflow-x-auto mb-6">
{`responses = chain.batch([
    {"topic": "bears"}, 
    {"topic": "cats"}
])`}
        </pre>

        <h3 id="stream" className="text-xl font-bold text-white mt-8 mb-4">6.7 stream()</h3>
        <p className="text-gray-400 leading-relaxed mb-4">Yields chunks of the response as they are generated by the underlying model.</p>
        <pre className="bg-[#141414] border border-white/10 rounded-xl p-4 font-mono text-sm text-gray-300 overflow-x-auto mb-6">
{`for chunk in chain.stream({"topic": "bears"}):
    print(chunk, end="", flush=True)`}
        </pre>

        <div className="bg-[#141414] border border-white/10 rounded-xl p-8 mb-8 grid grid-cols-1 md:grid-cols-2 gap-8">
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 flex flex-col gap-4">
            <div className="text-center font-bold text-indigo-400">.stream()</div>
            <p className="text-sm text-center text-gray-400 m-0">Yields data as it's generated</p>
            <div className="h-24 bg-white/5 rounded flex items-center justify-center overflow-hidden">
              <motion.div className="w-3 h-3 bg-green-500 rounded-full mx-1" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 0.5, duration: 0.2, fillMode: "forwards" }} />
              <motion.div className="w-3 h-3 bg-green-500 rounded-full mx-1" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.0, duration: 0.2, fillMode: "forwards" }} />
              <motion.div className="w-3 h-3 bg-green-500 rounded-full mx-1" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 1.5, duration: 0.2, fillMode: "forwards" }} />
              <motion.div className="w-3 h-3 bg-green-500 rounded-full mx-1" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 2.0, duration: 0.2, fillMode: "forwards" }} />
              <motion.div className="w-3 h-3 bg-green-500 rounded-full mx-1" initial={{ scale: 0, opacity: 0 }} animate={{ scale: 1, opacity: 1 }} transition={{ delay: 2.5, duration: 0.2, fillMode: "forwards" }} />
            </div>
          </div>
          <div className="bg-white/5 border border-white/10 rounded-lg p-6 flex flex-col gap-4">
            <div className="text-center font-bold text-indigo-400">.batch()</div>
            <p className="text-sm text-center text-gray-400 m-0">Runs requests in parallel</p>
            <div className="h-24 bg-white/5 rounded flex flex-col items-center justify-center overflow-hidden gap-2">
              <motion.div className="w-4/5 h-4 bg-blue-500 rounded" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.5, duration: 0.3, fillMode: "forwards" }} />
              <motion.div className="w-4/5 h-4 bg-blue-500 rounded" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.7, duration: 0.3, fillMode: "forwards" }} />
              <motion.div className="w-4/5 h-4 bg-blue-500 rounded" initial={{ y: -20, opacity: 0 }} animate={{ y: 0, opacity: 1 }} transition={{ delay: 1.9, duration: 0.3, fillMode: "forwards" }} />
            </div>
          </div>
        </div>

        <h3 id="runnable-sequence" className="text-xl font-bold text-white mt-8 mb-4">6.8 RunnableSequence</h3>
        <p className="text-gray-400 leading-relaxed mb-4">When you use the pipe operator (<code className="text-indigo-300 bg-white/5 px-1 rounded">|</code>), LangChain automatically creates a <code className="text-indigo-300 bg-white/5 px-1 rounded">RunnableSequence</code> under the hood. It ensures step A completes before step B starts.</p>
        <pre className="bg-[#141414] border border-white/10 rounded-xl p-4 font-mono text-sm text-gray-300 overflow-x-auto mb-6">
{`from langchain_core.runnables import RunnableSequence

# These two are exactly equivalent:
chain1 = prompt | model | parser
chain2 = RunnableSequence(first=prompt, middle=[model], last=parser)`}
        </pre>

        <h3 id="runnable-parallel" className="text-xl font-bold text-white mt-8 mb-4">6.9 RunnableParallel</h3>
        <p className="text-gray-400 leading-relaxed mb-4">Sometimes you need to format inputs from multiple sources (like a database and user input) at the exact same time before passing them to a prompt. <code className="text-indigo-300 bg-white/5 px-1 rounded">RunnableParallel</code> executes branches simultaneously.</p>
        <pre className="bg-[#141414] border border-white/10 rounded-xl p-4 font-mono text-sm text-gray-300 overflow-x-auto mb-6">
{`from langchain_core.runnables import RunnableParallel

# In LCEL, wrapping things in a dict automatically creates a RunnableParallel!
setup_and_retrieval = RunnableParallel(
    context=retriever,          # Branch 1: Fetch documents
    question=RunnablePassthrough() # Branch 2: Pass user query through
)

chain = setup_and_retrieval | prompt | model | parser`}
        </pre>

        <h3 id="runnable-branch" className="text-xl font-bold text-white mt-8 mb-4">6.10 RunnableBranch</h3>
        <p className="text-gray-400 leading-relaxed mb-4">Use <code className="text-indigo-300 bg-white/5 px-1 rounded">RunnableBranch</code> to dynamically route inputs to different chains based on a condition function.</p>
        <pre className="bg-[#141414] border border-white/10 rounded-xl p-4 font-mono text-sm text-gray-300 overflow-x-auto mb-6">
{`from langchain_core.runnables import RunnableBranch

branch = RunnableBranch(
    (lambda x: "math" in x["topic"].lower(), math_chain),
    (lambda x: "history" in x["topic"].lower(), history_chain),
    general_chain # Default fallback
)

result = branch.invoke({"topic": "tell me about math"}) # Routes to math_chain`}
        </pre>
      </motion.section>

      <motion.section id="langsmith" className="border-b border-white/10 pb-8 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-white mb-4">7. LangSmith</h2>
        <p className="text-gray-400 leading-relaxed mb-4">
          LangSmith is a unified DevOps platform for developing, collaborating, testing, and monitoring LLM applications. Because LCEL chains are composed of standardized Runnables, LangSmith can automatically trace exactly how long each step took, what the input to the prompt was, and what the raw output of the LLM was before parsing.
        </p>
        <p className="text-gray-400 leading-relaxed mb-4">To enable it, you just set environment variables:</p>
        <pre className="bg-[#141414] border border-white/10 rounded-xl p-4 font-mono text-sm text-gray-300 overflow-x-auto mb-6">
{`export LANGCHAIN_TRACING_V2="true"
export LANGCHAIN_API_KEY="ls__..."`}
        </pre>
      </motion.section>

      <motion.section id="best-practices" className="border-b border-white/10 pb-8 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <h2 className="text-2xl font-bold text-white mb-4">8. Best Practices</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-emerald-500/10 border border-emerald-500/30 p-6 rounded-xl">
            <h4 className="text-emerald-400 font-bold mb-4">✅ DO</h4>
            <ul className="list-disc list-inside text-gray-300 space-y-2 text-sm">
              <li>Use LCEL (<code className="text-emerald-300 bg-white/5 px-1 rounded">|</code>) instead of legacy classes like <code className="text-emerald-300 bg-white/5 px-1 rounded">LLMChain</code>.</li>
              <li>Use <code className="text-emerald-300 bg-white/5 px-1 rounded">langchain-[partner]</code> packages (e.g. <code className="text-emerald-300 bg-white/5 px-1 rounded">langchain-ollama</code>) instead of <code className="text-emerald-300 bg-white/5 px-1 rounded">langchain-community</code>.</li>
              <li>Always attach an <code className="text-emerald-300 bg-white/5 px-1 rounded">OutputParser</code> at the end of your chain to ensure consistent output formatting.</li>
            </ul>
          </div>
          <div className="bg-red-500/10 border border-red-500/30 p-6 rounded-xl">
            <h4 className="text-red-400 font-bold mb-4">❌ DON'T</h4>
            <ul className="list-disc list-inside text-gray-300 space-y-2 text-sm">
              <li>Use LangChain for simple, single API calls (just use the raw SDK).</li>
              <li>Pass raw strings directly into LLMs without using a <code className="text-red-300 bg-white/5 px-1 rounded">PromptTemplate</code>.</li>
            </ul>
          </div>
        </div>
      </motion.section>

      <motion.section id="langgraph" className="pb-8 mb-8" initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}>
        <div className="inline-block px-3 py-1 mb-4 text-xs font-semibold tracking-wider text-blue-400 uppercase bg-blue-500/10 rounded-full border border-blue-500/20">
          Extension
        </div>
        <h2 className="text-2xl font-bold text-white mb-4">9. LangGraph 🔗</h2>
        <p className="text-gray-400 leading-relaxed mb-8">
          LangGraph is LangChain's orchestration layer for <strong className="text-white">stateful, multi-actor</strong> applications, modeled as graphs. Where LCEL chains run once, top to bottom, LangGraph adds <strong className="text-white">cycles, branching, and persistent memory</strong> — exactly what an agent needs to think → act → observe → think again.
        </p>

        <h3 id="langgraph-concepts" className="text-xl font-bold text-white mt-8 mb-4">9.1 Key Concepts</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-12">
          {[
            { icon: '🔵', title: 'Nodes', desc: 'Individual processing units — an LLM call, a tool execution, or any Python function. Each node receives state and returns updated state.' },
            { icon: '➡️', title: 'Edges', desc: 'Connections between nodes. Normal edges always go from A→B. Conditional edges route dynamically based on state (if/else branching).' },
            { icon: '📦', title: 'State', desc: 'A shared TypedDict object passed through every node. Each node can read and update the state. This is how information flows through the graph.' },
            { icon: '🔄', title: 'Cycles', desc: 'Unlike basic pipelines, LangGraph supports loops. An agent can think → act → observe → think again in a repeating cycle until it decides to stop.' },
            { icon: '💾', title: 'Checkpointing', desc: 'Built-in persistence. Save graph state to memory or a database. Resume execution from any checkpoint — perfect for long-running or interrupted tasks.' },
            { icon: '🎭', title: 'Multi-Actor', desc: 'Multiple agents can run as separate nodes in the same graph. Use for supervisor patterns, debating agents, or parallel task execution.' },
          ].map((c, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
              className="p-6 bg-white/5 border border-white/10 rounded-xl backdrop-blur-sm hover:bg-white/10 transition-colors"
            >
              <div className="text-3xl mb-4">{c.icon}</div>
              <h4 className="text-lg font-bold text-gray-200 mb-2">{c.title}</h4>
              <p className="text-gray-400 text-sm leading-relaxed">{c.desc}</p>
            </motion.div>
          ))}
        </div>

        <h3 id="langgraph-demo" className="text-xl font-bold text-white mt-8 mb-4">9.2 Interactive Demo — ReAct Agent Graph</h3>
        <div className="mb-12 p-8 bg-black/40 border border-white/10 rounded-2xl relative overflow-hidden">
          <div className="flex items-center gap-4 mb-8">
            <button onClick={handlePrev} className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-lg text-sm font-medium transition-colors">‹ Prev</button>
            <span className="text-sm font-medium text-gray-400">Step {step} of {totalSteps}</span>
            <button onClick={handleNext} className="px-4 py-2 bg-blue-600 hover:bg-blue-500 rounded-lg text-sm font-medium transition-colors">Next ›</button>
            <button onClick={handleReset} className="px-4 py-2 bg-white/5 hover:bg-white/10 rounded-lg text-sm font-medium transition-colors ml-auto">↺ Reset</button>
          </div>

          <div className="flex items-center justify-between min-h-[200px] relative overflow-x-auto">
            <motion.div animate={{ opacity: step >= 1 ? 1 : 0.3, scale: step === 1 ? 1.1 : 1 }} className="flex flex-col items-center shrink-0">
              <div className="w-16 h-16 rounded-full bg-green-500/20 border border-green-500 flex items-center justify-center text-2xl mb-3">🟢</div>
              <span className="text-sm font-mono text-gray-300">__start__</span>
            </motion.div>

            {step > 1 && (
              <motion.div initial={{ width: 0 }} animate={{ width: '100px' }} className="h-0.5 bg-gray-600 relative mx-4 shrink-0">
                <motion.div className="absolute right-0 -top-1.5 w-3 h-3 border-t-2 border-r-2 border-gray-600 rotate-45" />
              </motion.div>
            )}

            <motion.div animate={{ opacity: step >= 2 ? 1 : 0.3, scale: step === 2 ? 1.1 : 1 }} className="flex flex-col items-center shrink-0">
              <div className="w-16 h-16 rounded-xl bg-blue-500/20 border border-blue-500 flex items-center justify-center text-xs font-mono text-blue-300 mb-3">{'{state}'}</div>
              <span className="text-sm font-mono text-gray-300">Init State</span>
            </motion.div>

            {step > 2 && (
              <motion.div initial={{ width: 0 }} animate={{ width: '100px' }} className="h-0.5 bg-gray-600 relative mx-4 shrink-0">
                <motion.div className="absolute right-0 -top-1.5 w-3 h-3 border-t-2 border-r-2 border-gray-600 rotate-45" />
              </motion.div>
            )}

            <motion.div animate={{ opacity: step >= 3 ? 1 : 0.3, scale: step === 3 ? 1.1 : 1 }} className="flex flex-col items-center shrink-0">
              <div className="w-16 h-16 rounded-xl bg-purple-500/20 border border-purple-500 flex items-center justify-center text-2xl mb-3">🧠</div>
              <span className="text-sm font-mono text-gray-300">Agent Node</span>
            </motion.div>

            {step > 3 && (
              <motion.div initial={{ width: 0 }} animate={{ width: '100px' }} className="h-0.5 bg-gray-600 relative mx-4 shrink-0">
                <span className="absolute -top-6 left-1/2 -translate-x-1/2 text-xs text-gray-500 whitespace-nowrap">conditional</span>
                <motion.div className="absolute right-0 -top-1.5 w-3 h-3 border-t-2 border-r-2 border-gray-600 rotate-45" />
              </motion.div>
            )}

            <motion.div animate={{ opacity: step >= 4 ? 1 : 0.3, scale: step === 4 ? 1.1 : 1 }} className="flex flex-col items-center shrink-0">
              <div className="w-16 h-16 rounded-xl bg-orange-500/20 border border-orange-500 flex items-center justify-center text-2xl mb-3">🔧</div>
              <span className="text-sm font-mono text-gray-300">Tool Node</span>
            </motion.div>

            {step > 4 && (
              <motion.div initial={{ width: 0 }} animate={{ width: '100px' }} className="h-0.5 bg-gray-600 relative mx-4 shrink-0">
                <motion.div className="absolute right-0 -top-1.5 w-3 h-3 border-t-2 border-r-2 border-gray-600 rotate-45" />
              </motion.div>
            )}

            <motion.div animate={{ opacity: step >= 5 ? 1 : 0.3, scale: step === 5 ? 1.1 : 1 }} className="flex flex-col items-center shrink-0">
              <div className="w-16 h-16 rounded-full bg-red-500/20 border border-red-500 flex items-center justify-center text-2xl mb-3">🔴</div>
              <span className="text-sm font-mono text-gray-300">__end__</span>
            </motion.div>
          </div>

          <div className="mt-8 p-6 bg-white/5 rounded-xl border border-white/10">
            <h4 className="text-lg font-bold text-white mb-2">
              {step === 1 && "Graph Starts"}
              {step === 2 && "Initialize State"}
              {step === 3 && "Agent (LLM) Node"}
              {step === 4 && "Tool Node (Action)"}
              {step === 5 && "End Execution"}
            </h4>
            <p className="text-gray-400">
              {step === 1 && "The LangGraph runtime starts execution at the __start__ entrypoint. The initial user message is passed in."}
              {step === 2 && "State object is initialized and passed down."}
              {step === 3 && "The agent receives state, reasons, and decides what to do next."}
              {step === 4 && "If tools are needed, this node executes them and passes result back to Agent."}
              {step === 5 && "The graph finishes when the conditional edge says to stop."}
            </p>
          </div>
        </div>

        <h3 id="langgraph-code" className="text-xl font-bold text-white mt-8 mb-4">9.3 Minimal LangGraph Agent — Code</h3>
        <div className="bg-[#1e1e1e] rounded-xl overflow-hidden border border-white/10 mb-12">
          <div className="flex items-center px-4 py-2 bg-white/5 border-b border-white/10">
            <div className="flex gap-2 mr-4">
              <div className="w-3 h-3 rounded-full bg-red-500"></div>
              <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
              <div className="w-3 h-3 rounded-full bg-green-500"></div>
            </div>
            <span className="text-sm font-mono text-gray-400">agent.py</span>
          </div>
          <pre className="p-4 overflow-x-auto text-sm font-mono text-gray-300">
            <code className="language-python">
{`# 1. Define State
from langgraph.graph import StateGraph, END
from typing import TypedDict, Annotated
import operator

class AgentState(TypedDict):
    messages: Annotated[list, operator.add]

# 2. Define Nodes
def call_llm(state: AgentState):
    response = llm.invoke(state["messages"])
    return {"messages": [response]}

def should_continue(state: AgentState):
    last = state["messages"][-1]
    if last.tool_calls: return "tools"
    return END

# 3. Build Graph
graph = StateGraph(AgentState)
graph.add_node("agent", call_llm)
graph.add_node("tools", tool_executor)
graph.set_entry_point("agent")
graph.add_conditional_edges("agent", should_continue)
graph.add_edge("tools", "agent")  # Loop back!

app = graph.compile()`}
            </code>
          </pre>
        </div>

        <h3 id="langgraph-patterns" className="text-xl font-bold text-white mt-8 mb-4">9.4 Advanced Agent Patterns</h3>
        <p className="text-gray-400 leading-relaxed mb-6">
          Once you understand the basic node-and-edge structure, you can compose graphs into powerful multi-agent architectures. Here are four common patterns.
        </p>
        <div className="space-y-8">
          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-8 bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl">🎯</span>
              <h4 className="text-xl font-bold text-white">1. The ReAct Agent (Tool-Calling Loop)</h4>
            </div>
            <p className="text-gray-400 mb-6">
              The foundation of agentic AI. The agent receives a task, <strong>Reasons</strong> about what to do, takes an <strong>Action</strong> (calls a tool), and <strong>Observes</strong> the result. It repeats this cycle until the task is complete.
            </p>
            <div className="bg-black/50 rounded-xl p-6 flex flex-col items-center text-center">
              <div className="px-4 py-2 bg-gray-800 text-gray-200 rounded-lg border border-gray-700">User Input</div>
              <div className="text-gray-500 my-2">↓</div>
              <div className="p-6 border-2 border-dashed border-gray-600 rounded-xl flex flex-col items-center">
                <div className="px-4 py-2 bg-blue-900/50 text-blue-300 rounded-lg border border-blue-700 mb-4">LLM Node (Reasoning)</div>
                <div className="flex gap-12">
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 mb-1">Has tool call</span>
                    <div className="text-gray-500 mb-2">↓</div>
                    <div className="px-4 py-2 bg-orange-900/50 text-orange-300 rounded-lg border border-orange-700">Tool Node (Action)</div>
                    <div className="mt-4 text-xs text-orange-400">↺ Loop back</div>
                  </div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs text-gray-500 mb-1">Final Answer</span>
                    <div className="text-gray-500 mb-2">↓</div>
                    <div className="px-4 py-2 bg-green-900/50 text-green-300 rounded-lg border border-green-700">Output</div>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-8 bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl">👔</span>
              <h4 className="text-xl font-bold text-white">2. Supervisor (Hierarchical Routing)</h4>
            </div>
            <p className="text-gray-400 mb-6">
              A central "Supervisor" LLM orchestrates multiple specialized worker agents. It looks at the task, decides which worker should handle it, passes the state to them, and collects the response.
            </p>
            <div className="bg-black/50 rounded-xl p-6 flex flex-col items-center text-center">
              <div className="px-4 py-2 bg-purple-900/50 text-purple-300 rounded-lg border border-purple-700 mb-4">Supervisor LLM</div>
              <div className="flex gap-8 mb-4 flex-wrap justify-center">
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500">Needs Code</span>
                  <div className="text-gray-500 my-1">↙</div>
                  <div className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg border border-gray-700">Coder Agent</div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500">Needs Search</span>
                  <div className="text-gray-500 my-1">↓</div>
                  <div className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg border border-gray-700">Research Agent</div>
                </div>
                <div className="flex flex-col items-center">
                  <span className="text-xs text-gray-500">Needs Math</span>
                  <div className="text-gray-500 my-1">↘</div>
                  <div className="px-4 py-2 bg-gray-800 text-gray-300 rounded-lg border border-gray-700">Math Agent</div>
                </div>
              </div>
              <div className="text-xs text-purple-400 mt-2 border-t border-dashed border-gray-600 pt-4 w-full">↑ Return to Supervisor ↑</div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-8 bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl">🌐</span>
              <h4 className="text-xl font-bold text-white">3. Parallel Execution (Map-Reduce)</h4>
            </div>
            <p className="text-gray-400 m-0">
              When a task can be broken into independent sub-tasks (e.g., reviewing 5 different documents), the graph fans out to process them simultaneously, then fans in to aggregate the results. Massively speeds up workflows.
            </p>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="p-8 bg-white/5 border border-white/10 rounded-2xl">
            <div className="flex items-center gap-4 mb-4">
              <span className="text-3xl">🔍</span>
              <h4 className="text-xl font-bold text-white">4. Reflection (Self-Correction)</h4>
            </div>
            <p className="text-gray-400 m-0">
              Two distinct roles: A <strong>Generator</strong> creates the output (code, text, translation), and a <strong>Critic</strong> evaluates it against a rubric. If it fails, the Critic provides feedback and loops it back to the Generator to try again.
            </p>
          </motion.div>
        </div>
      </motion.section>

    </GuideLayout>
  );
}

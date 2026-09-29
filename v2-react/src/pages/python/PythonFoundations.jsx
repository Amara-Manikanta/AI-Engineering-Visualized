import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../../components/GuideLayout';
import KnowledgeCheck from "../../components/KnowledgeCheck";
import { questionsFor } from "../../data/quizBank";
import { CodeSnippet } from '../../components/CodeBlock';

/* ---------------------------------------------------------------------------
   Interactive memory-reference diagram.

   The single hardest idea for Python beginners: `b = a` copies the *pointer*,
   never the object. Whether that matters depends entirely on whether the
   object is mutable — so the two cases are shown side by side, step by step.
   Visibility is driven by state (not animation) so it renders correctly even
   when animation frames are throttled.
--------------------------------------------------------------------------- */

const MEMORY_SCENARIOS = {
  immutable: {
    label: 'Immutable (int)',
    tone: 'emerald',
    steps: [
      { code: 'a = 5', vars: [{ n: 'a', obj: 0 }], objs: [{ v: '5', t: 'int' }], note: 'Python creates an int object and points the label `a` at it.' },
      { code: 'b = a', vars: [{ n: 'a', obj: 0 }, { n: 'b', obj: 0 }], objs: [{ v: '5', t: 'int' }], note: 'No copy is made — `b` is a second label on the SAME object.' },
      { code: 'b = b + 1', vars: [{ n: 'a', obj: 0 }, { n: 'b', obj: 1 }], objs: [{ v: '5', t: 'int' }, { v: '6', t: 'int' }], note: 'ints cannot change. Python builds a NEW object and rebinds `b`. `a` is untouched.' },
    ],
    outcome: 'a == 5  ·  b == 6',
    outcomeGood: true,
  },
  mutable: {
    label: 'Mutable (list)',
    tone: 'rose',
    steps: [
      { code: 'a = [1, 2]', vars: [{ n: 'a', obj: 0 }], objs: [{ v: '[1, 2]', t: 'list' }], note: 'A list object is created and `a` points at it.' },
      { code: 'b = a', vars: [{ n: 'a', obj: 0 }, { n: 'b', obj: 0 }], objs: [{ v: '[1, 2]', t: 'list' }], note: 'Same as before — two labels, one object. Still no copy.' },
      { code: 'b.append(3)', vars: [{ n: 'a', obj: 0 }, { n: 'b', obj: 0 }], objs: [{ v: '[1, 2, 3]', t: 'list' }], note: 'append() MUTATES the object in place. Both labels see the change — this surprises everyone once.' },
    ],
    outcome: 'a == [1, 2, 3]  ·  b == [1, 2, 3]',
    outcomeGood: false,
  },
};

function MemoryModelVisual() {
  const [kind, setKind] = useState('immutable');
  const [step, setStep] = useState(0);
  const scenario = MEMORY_SCENARIOS[kind];
  const cur = scenario.steps[step];

  const VAR_X = 30, OBJ_X = 210, BOX_W = 78, OBJ_W = 116, H = 34;
  const rowY = (i) => 26 + i * 56;

  return (
    <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-5 mb-4">
      {/* scenario toggle */}
      <div className="flex gap-2 mb-4">
        {Object.entries(MEMORY_SCENARIOS).map(([k, s]) => (
          <button
            key={k}
            onClick={() => { setKind(k); setStep(0); }}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              kind === k
                ? s.tone === 'emerald'
                  ? 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                  : 'bg-rose-500/20 border-rose-500/50 text-rose-200'
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
            }`}
          >
            {s.label}
          </button>
        ))}
      </div>

      {/* code lines */}
      <div className="font-mono text-xs mb-4 space-y-1">
        {scenario.steps.map((s, i) => (
          <div
            key={i}
            className={`px-2.5 py-1.5 rounded border transition-colors ${
              i === step
                ? 'bg-indigo-500/15 border-indigo-500/40 text-indigo-200'
                : i < step
                ? 'bg-white/[0.03] border-transparent text-gray-600'
                : 'bg-transparent border-transparent text-gray-700'
            }`}
          >
            <span className="text-gray-600 mr-2 select-none">{i + 1}</span>
            {s.code}
          </div>
        ))}
      </div>

      {/* diagram */}
      <svg viewBox="0 0 360 150" className="w-full max-w-md mx-auto block mb-3">
        <text x={VAR_X} y="12" fill="#6b7280" fontSize="8" fontFamily="monospace">NAMES</text>
        <text x={OBJ_X} y="12" fill="#6b7280" fontSize="8" fontFamily="monospace">OBJECTS IN MEMORY</text>

        {/* objects */}
        {cur.objs.map((o, i) => (
          <g key={`o${i}`}>
            <rect
              x={OBJ_X} y={rowY(i)} width={OBJ_W} height={H} rx="6"
              fill={scenario.tone === 'emerald' ? 'rgba(16,185,129,0.12)' : 'rgba(244,63,94,0.12)'}
              stroke={scenario.tone === 'emerald' ? '#34d399' : '#fb7185'}
              strokeWidth="1.2"
            />
            <text x={OBJ_X + OBJ_W / 2} y={rowY(i) + 15} textAnchor="middle" fill="#e5e7eb" fontSize="11" fontFamily="monospace">{o.v}</text>
            <text x={OBJ_X + OBJ_W / 2} y={rowY(i) + 26} textAnchor="middle" fill="#6b7280" fontSize="7" fontFamily="monospace">{o.t}</text>
          </g>
        ))}

        {/* variables + arrows */}
        {cur.vars.map((v, i) => {
          const y = rowY(i) + H / 2;
          const ty = rowY(v.obj) + H / 2;
          return (
            <g key={`v${v.n}`}>
              <rect x={VAR_X} y={rowY(i)} width={BOX_W} height={H} rx="6" fill="#1f2937" stroke="#4b5563" strokeWidth="1.2" />
              <text x={VAR_X + BOX_W / 2} y={rowY(i) + 21} textAnchor="middle" fill="#f3f4f6" fontSize="13" fontFamily="monospace">{v.n}</text>
              <line
                x1={VAR_X + BOX_W + 4} y1={y} x2={OBJ_X - 6} y2={ty}
                stroke={scenario.tone === 'emerald' ? '#34d399' : '#fb7185'}
                strokeWidth="1.5" markerEnd="url(#memArrow)"
              />
            </g>
          );
        })}

        <defs>
          <marker id="memArrow" markerWidth="8" markerHeight="6" refX="7" refY="3" orient="auto">
            <polygon points="0 0, 8 3, 0 6" fill={scenario.tone === 'emerald' ? '#34d399' : '#fb7185'} />
          </marker>
        </defs>
      </svg>

      <p className="text-[0.6875rem] text-gray-400 leading-relaxed text-center min-h-[32px] mb-3">{cur.note}</p>

      {/* controls */}
      <div className="flex items-center justify-center gap-3">
        <button
          onClick={() => setStep((s) => Math.max(0, s - 1))}
          disabled={step === 0}
          className="px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 text-xs text-gray-300 disabled:opacity-30 hover:border-white/30 transition-colors"
        >
          ‹ Prev
        </button>
        <span className="text-[0.6875rem] text-gray-500 font-mono">Step {step + 1} / {scenario.steps.length}</span>
        <button
          onClick={() => setStep((s) => Math.min(scenario.steps.length - 1, s + 1))}
          disabled={step === scenario.steps.length - 1}
          className="px-3 py-1.5 rounded-lg bg-indigo-600 border border-indigo-500 text-xs text-white disabled:opacity-30 hover:bg-indigo-500 transition-colors"
        >
          Next ›
        </button>
      </div>

      {step === scenario.steps.length - 1 && (
        <div className={`mt-3 p-2.5 rounded-lg border text-center font-mono text-xs ${
          scenario.outcomeGood
            ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
            : 'bg-rose-500/10 border-rose-500/30 text-rose-200'
        }`}>
          {scenario.outcome}
        </div>
      )}
    </div>
  );
}
import { Code2, Terminal, FileCode, Cpu, Layers, ArrowRight, ShieldCheck, Zap, Variable, GitBranch, Equal, Hash, Monitor } from 'lucide-react';

export default function PythonFoundations() {
  const toc = [
    { label: "1. Python Setup & IDEs", hash: "#python-setup" },
    { label: "2. Execution Pipeline (Visual)", hash: "#execution-pipeline" },
    { label: "3. What is Python & Features", hash: "#what-is-python" },
    { label: "4. Indentation & Block Scoping", hash: "#indentation" },
    { label: "5. Variables & Memory References", hash: "#variables" },
    { label: "6. Data Types & Immutability", hash: "#data-types" },
    { label: "7. Arithmetic & Bitwise Operators", hash: "#arithmetic-ops" },
    { label: "8. Comparison & Logical Operators", hash: "#logical-ops" },
    { label: "9. Identity (is) & Membership (in)", hash: "#identity-vs-equality" },
    { label: "10. Walrus Operator (:=)", hash: "#walrus-operator" },
    { label: "11. if-elif-else & Ternary Operator", hash: "#if-else" },
    { label: "12. for Loops & for...else", hash: "#for-loops" },
    { label: "13. while Loops, break, continue & pass", hash: "#while-loops" },
    { label: "14. enumerate() & zip() Functions", hash: "#enumerate-zip" },
    { label: "15. Structural Pattern Matching (match-case)", hash: "#match-case" }
  ];

  return (
    <GuideLayout
      title="Module 1: Python Foundations & Setup"
      intro="Complete beginner-to-advanced technical guide covering Python environment setup, interpreter mechanics, variables, memory pointers, data types, operators, and control flow."
      toc={toc}
    >
      {/* 1. PYTHON SETUP & IDES */}
      <section id="python-setup" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Monitor size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">1. Python Setup & Developer Environment</h2>
            <p className="text-xs text-gray-400">Installing Python, VS Code / PyCharm, Terminal usage, `.py` scripts, and Jupyter Notebooks</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Setting up your Python development environment is the essential first step for every developer. Python can be installed directly from python.org or via package managers (`brew install python` on macOS). Modern developers write code in Code Editors like <strong>VS Code</strong> or <strong>PyCharm</strong>, execute standalone <code>.py</code> script files via the system terminal (`python main.py`), or conduct interactive data exploration using <strong>Jupyter Notebooks</strong> (`.ipynb`).
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4 text-xs">
          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
            <span className="font-bold text-emerald-300 block mb-1">1. Code Editors & IDEs</span>
            <span className="text-[0.625rem] text-gray-400">VS Code & PyCharm provide syntax highlighting, linting, and debugging tools.</span>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
            <span className="font-bold text-emerald-300 block mb-1">2. Standalone `.py` Scripts</span>
            <span className="text-[0.625rem] text-gray-400">Standard text files containing Python instructions executed top-to-bottom.</span>
          </div>
          <div className="bg-black/40 p-3 rounded-xl border border-white/5">
            <span className="font-bold text-emerald-300 block mb-1">3. Jupyter Notebooks (`.ipynb`)</span>
            <span className="text-[0.625rem] text-gray-400">Interactive cells ideal for data science, prototyping, and inline visualization.</span>
          </div>
        </div>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-emerald-400"><Terminal size={12} /> Terminal Commands</span>
            <span>CLI Usage</span>
          </div>
          <CodeSnippet className="text-emerald-300 mb-3 whitespace-pre-wrap">{`# Check Python Installation Version
$ python --version
Python 3.11.5

# Run a Python Script File via Terminal
$ python script.py`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Environment Ready! Python 3.11 activated.</code>
          </div>
        </div>
      </section>

      {/* 2. EXECUTION PIPELINE */}
      <section id="execution-pipeline" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 border border-indigo-500/30">
            <Cpu size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">2. Execution Pipeline & Python Interpreter</h2>
            <p className="text-xs text-gray-400">Recommended visual flow: Code Editor ➔ Python File ➔ Interpreter ➔ Output</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Understanding the path code takes from your keyboard to CPU execution is fundamental. You write code inside a Code Editor, which saves text into a <code>.py</code> file. When invoked, the <strong>Python Interpreter</strong> compiles the text into bytecode, evaluates it inside the Python Virtual Machine (PVM), and streams the formatted output back to your terminal screen.
        </p>

        {/* Visual Diagram */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/5 border border-white/10 rounded-2xl p-6 mb-4"
        >
          <h3 className="text-sm font-bold text-indigo-300 mb-4 text-center uppercase tracking-wider">
            🖥️ Recommended Visual: Python Code Execution Flow
          </h3>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-3 text-center text-xs">
            <div className="bg-indigo-900/30 border border-indigo-500/40 px-4 py-3 rounded-xl w-full sm:w-auto">
              <span className="font-bold text-white block">Code Editor</span>
              <span className="text-[0.625rem] text-gray-400">VS Code / PyCharm</span>
            </div>
            <ArrowRight className="text-indigo-400 hidden sm:block shrink-0" size={20} />
            <div className="text-indigo-400 font-bold sm:hidden">↓</div>
            <div className="bg-purple-900/30 border border-purple-500/40 px-4 py-3 rounded-xl w-full sm:w-auto">
              <span className="font-bold text-white block">Python File</span>
              <span className="text-[0.625rem] text-gray-400">script.py</span>
            </div>
            <ArrowRight className="text-purple-400 hidden sm:block shrink-0" size={20} />
            <div className="text-purple-400 font-bold sm:hidden">↓</div>
            <div className="bg-cyan-900/30 border border-cyan-500/40 px-4 py-3 rounded-xl w-full sm:w-auto">
              <span className="font-bold text-white block">Python Interpreter</span>
              <span className="text-[0.625rem] text-gray-400">CPython PVM</span>
            </div>
            <ArrowRight className="text-cyan-400 hidden sm:block shrink-0" size={20} />
            <div className="text-cyan-400 font-bold sm:hidden">↓</div>
            <div className="bg-emerald-900/30 border border-emerald-500/40 px-4 py-3 rounded-xl w-full sm:w-auto">
              <span className="font-bold text-white block">Terminal Output</span>
              <span className="text-[0.625rem] text-gray-400">Screen Output</span>
            </div>
          </div>
        </motion.div>
      </section>

      {/* 3. WHAT IS PYTHON */}
      <section id="what-is-python" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Code2 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">3. What is Python & Core Features</h2>
            <p className="text-xs text-gray-400">High-level, interpreted, general-purpose programming language</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Python is an interpreted, high-level, dynamically typed programming language created by Guido van Rossum in 1991. It emphasizes developer velocity and clean code readability through minimalist syntax and an extensive standard library often referred to as "batteries included". In modern AI engineering, Python acts as the universal glue language that seamlessly interfaces developer APIs with high-performance C/C++ engines and CUDA GPU accelerators.
        </p>

        <div className="bg-black/40 p-4 rounded-xl border border-white/5 mb-4 text-xs">
          <div className="font-bold text-blue-300 uppercase tracking-wider mb-2">⚡ Syntax Definition</div>
          <code className="text-gray-300 font-mono">print("object", ..., sep=' ', end='\n', file=sys.stdout, flush=False)</code>
        </div>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-blue-400"><FileCode size={12} /> 01_hello_world.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-emerald-300 mb-3 whitespace-pre-wrap">{`import sys

print("Hello, Python!")
print("Python Version:", sys.version.split()[0])`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Hello, Python!<br/>Python Version: 3.11.5</code>
          </div>
        </div>
      </section>

      {/* 4. INDENTATION */}
      <section id="indentation" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Layers size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">4. Indentation & Block Scoping</h2>
            <p className="text-xs text-gray-400">PEP 8 standards, 4-space indentation, `IndentationError` prevention</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Unlike languages like C++, Java, or JavaScript that use curly braces `{}` to define code blocks, Python enforces block structure using uniform whitespace indentation. According to official PEP 8 guidelines, developers must use exactly 4 spaces per indentation level rather than mixing tabs and spaces. Mixing tabs and spaces results in an explicit `IndentationError` or `TabError` at compile time, guaranteeing uniform readability across codebases.
        </p>

        <div className="bg-black/40 p-4 rounded-xl border border-white/5 mb-4 text-xs">
          <div className="font-bold text-purple-300 uppercase tracking-wider mb-2">⚡ Syntax Rule</div>
          <code className="text-gray-300 font-mono">header_statement:<br/>&nbsp;&nbsp;&nbsp;&nbsp;indented_block_statement_1<br/>&nbsp;&nbsp;&nbsp;&nbsp;indented_block_statement_2</code>
        </div>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-purple-400"><FileCode size={12} /> 03_indentation.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-purple-300 mb-3 whitespace-pre-wrap">{`def check_value(val):
    if val > 0:
        print("Positive")
        if val > 100:
            print("Large Positive")
    else:
        print("Non-positive")

check_value(150)`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Positive<br/>Large Positive</code>
          </div>
        </div>
      </section>

      {/* 5. VARIABLES & MEMORY POINTERS */}
      <section id="variables" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Variable size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">5. Variables & Memory References</h2>
            <p className="text-xs text-gray-400">Names are labels pointing at objects — step through both cases below</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Variables in Python do not act as fixed memory containers storing raw values; rather, they serve as dynamic pointer labels that reference underlying objects in heap memory. When assigning <code>age = 25</code>, Python creates an integer object <code>25</code> in heap memory and points the label <code>age</code> to that address. Assigning <code>y = x</code> copies the memory pointer, not the underlying object data.
        </p>

        {/* Interactive memory model */}
        <MemoryModelVisual />

        <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl mb-4">
          <div className="text-amber-300 font-bold text-xs mb-1.5">Why this matters in practice</div>
          <p className="text-[0.6875rem] text-gray-300 leading-relaxed m-0">
            This is the root cause of Python's most notorious bug — the{' '}
            <strong className="text-gray-100">mutable default argument</strong>. Writing{' '}
            <code className="text-amber-200">def f(items=[])</code> creates that list <em>once</em>, when the function
            is defined, and every call shares it. Use{' '}
            <code className="text-emerald-300">def f(items=None)</code> and build the list inside the body instead.
          </p>
        </div>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-cyan-400"><FileCode size={12} /> 04_variables.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-cyan-300 mb-3 whitespace-pre-wrap">{`name = "Manikanta"
age = 25
is_learning_ai = True

print(f"Name: {name}, Age: {age}, Learning AI: {is_learning_ai}")
print("Memory address of name:", id(name))`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Name: Manikanta, Age: 25, Learning AI: True<br/>Memory address of name: 140705892100416</code>
          </div>
        </div>
      </section>

      {/* 6. DATA TYPES */}
      <section id="data-types" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Hash size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">6. Built-in Data Types & Immutability</h2>
            <p className="text-xs text-gray-400">`int`, `float`, `str`, `bool`, `None`, `list`, `tuple`, `dict`, `set`</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Every value in Python is an instance of a data type class. Data types are categorized into **immutable** types (`int`, `float`, `str`, `bool`, `None`, `tuple`) whose values cannot be changed in-place after creation, and **mutable** types (`list`, `dict`, `set`) whose contents can be modified directly in memory.
        </p>

        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-5 gap-2 mb-4 text-xs font-mono">
          <div className="bg-black/40 p-2 rounded border border-white/5 text-center"><span className="text-emerald-300 font-bold block">int</span><span className="text-[0.625rem] text-gray-400">25</span></div>
          <div className="bg-black/40 p-2 rounded border border-white/5 text-center"><span className="text-emerald-300 font-bold block">float</span><span className="text-[0.625rem] text-gray-400">3.14</span></div>
          <div className="bg-black/40 p-2 rounded border border-white/5 text-center"><span className="text-emerald-300 font-bold block">str</span><span className="text-[0.625rem] text-gray-400">"AI"</span></div>
          <div className="bg-black/40 p-2 rounded border border-white/5 text-center"><span className="text-emerald-300 font-bold block">bool</span><span className="text-[0.625rem] text-gray-400">True</span></div>
          <div className="bg-black/40 p-2 rounded border border-white/5 text-center"><span className="text-emerald-300 font-bold block">None</span><span className="text-[0.625rem] text-gray-400">None</span></div>
          <div className="bg-black/40 p-2 rounded border border-white/5 text-center"><span className="text-purple-300 font-bold block">list</span><span className="text-[0.625rem] text-gray-400">[1, 2]</span></div>
          <div className="bg-black/40 p-2 rounded border border-white/5 text-center"><span className="text-purple-300 font-bold block">tuple</span><span className="text-[0.625rem] text-gray-400">(1, 2)</span></div>
          <div className="bg-black/40 p-2 rounded border border-white/5 text-center"><span className="text-purple-300 font-bold block">dict</span><span className="text-[0.625rem] text-gray-400">{"{'k': 'v'}"}</span></div>
          <div className="bg-black/40 p-2 rounded border border-white/5 text-center"><span className="text-purple-300 font-bold block">set</span><span className="text-[0.625rem] text-gray-400">{"{'a', 'b'}"}</span></div>
        </div>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-emerald-400"><FileCode size={12} /> 05_datatypes.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-emerald-300 mb-3 whitespace-pre-wrap">{`a = 42
b = 3.14159
c = "AI"
d = True
e = None

print(type(a), type(b), type(c), type(d), type(e))`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>&lt;class 'int'&gt; &lt;class 'float'&gt; &lt;class 'str'&gt; &lt;class 'bool'&gt; &lt;class 'NoneType'&gt;</code>
          </div>
        </div>
      </section>

      {/* 7. ARITHMETIC OPERATORS */}
      <section id="arithmetic-ops" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Zap size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">7. Arithmetic & Bitwise Operators</h2>
            <p className="text-xs text-gray-400">`+`, `-`, `*`, `/`, `//` (floor div), `%` (modulo), `**` (power), `&`, `|`, `^`</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Python provides comprehensive mathematical operators, including standard arithmetic and advanced operations like floor division (`//`) and exponentiation (`**`). Floor division always rounds down the quotient to the nearest integer, whereas modulo (`%`) returns the remainder. Bitwise operators (`&`, `|`, `^`, `~`, `&lt;&lt;`, `&gt;&gt;`) operate directly on individual bits of integers, enabling high-performance binary flags and bitmask calculations.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-amber-400"><FileCode size={12} /> 06_operators.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-amber-300 mb-3 whitespace-pre-wrap">{`a, b = 17, 5

print("Float Division (a / b):", a / b)
print("Floor Division (a // b):", a // b)
print("Modulo (a % b):", a % b)
print("Power (a ** b):", a ** b)
print("Bitwise AND (a & b):", a & b)`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Float Division (a / b): 3.4<br/>Floor Division (a // b): 3<br/>Modulo (a % b): 2<br/>Power (a ** b): 1419857<br/>Bitwise AND (a & b): 1</code>
          </div>
        </div>
      </section>

      {/* 8. LOGICAL OPERATORS */}
      <section id="logical-ops" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <ShieldCheck size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">8. Comparison & Logical Operators</h2>
            <p className="text-xs text-gray-400"><code>==</code>, <code>!=</code>, <code>&lt;</code>, <code>&gt;</code>, <code>&lt;=</code>, <code>&gt;=</code>, <code>and</code>, <code>or</code>, <code>not</code> (Short-circuit evaluation)</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Comparison operators evaluate relative values and return boolean results (`True` or `False`). Logical operators (`and`, `or`, `not`) perform short-circuit evaluation. This means in an expression like <code>if score &gt;= 80 and score &lt;= 100:</code>, if <code>score &gt;= 80</code> evaluates to `False`, Python immediately skips evaluating the rest, preventing unexpected runtime errors.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-teal-400"><FileCode size={12} /> 07_logical_ops.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-teal-300 mb-3 whitespace-pre-wrap">{`score = 85

if score >= 80 and score <= 100:
    print("Good score")`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Good score</code>
          </div>
        </div>
      </section>

      {/* 9. IDENTITY VS EQUALITY */}
      <section id="identity-vs-equality" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Equal size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">9. Identity (`is`) vs Equality (`==`) & Membership (`in`)</h2>
            <p className="text-xs text-gray-400">Value comparison (`==`) vs memory identity (`is`), substring & collection checking (`in`)</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          The equality operator `==` compares the actual data values contained within two objects, whereas the identity operator `is` checks whether both variables point to the exact same memory address. Utilizing `is` for value comparisons can cause unexpected bugs due to CPython's internal integer caching mechanism. The `in` operator provides convenient membership testing across strings, lists, sets, and dictionary keys.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-rose-400"><FileCode size={12} /> 08_identity.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-rose-300 mb-3 whitespace-pre-wrap">{`list_a = [1, 2, 3]
list_b = [1, 2, 3]

print("list_a == list_b (Value):", list_a == list_b)
print("list_a is list_b (Address):", list_a is list_b)

print("'vector' in 'vector_search':", 'vector' in 'vector_search')`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>list_a == list_b (Value): True<br/>list_a is list_b (Address): False<br/>'vector' in 'vector_search': True</code>
          </div>
        </div>
      </section>

      {/* 10. WALRUS OPERATOR */}
      <section id="walrus-operator" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
            <Zap size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">10. Assignment Expressions (The Walrus Operator `:=`)</h2>
            <p className="text-xs text-gray-400">Assigning values to variables inside expressions (Python 3.8+)</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Introduced in Python 3.8, the walrus operator `:=` assigns values to variables directly inside an expression. This feature eliminates code duplication when checking string lengths in conditional headers, reading input streams in `while` loops, or capturing regex match groups. By assigning and testing values simultaneously, runtime performance improves without sacrificing code clarity.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-pink-400"><FileCode size={12} /> 09_walrus.py</span>
            <span>Python 3.8+</span>
          </div>
          <CodeSnippet className="text-pink-300 mb-3 whitespace-pre-wrap">{`query = "Retrieval Augmented Generation"

# Evaluate length and assign to var 'n' inside the if expression
if (n := len(query.split())) > 2:
    print(f"Query has {n} words.")`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Query has 3 words.</code>
          </div>
        </div>
      </section>

      {/* 11. IF-ELIF-ELSE */}
      <section id="if-else" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <GitBranch size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">11. `if-elif-else` Conditionals & Ternary Operator</h2>
            <p className="text-xs text-gray-400">Branching logic and single-line ternary expressions `A if C else B`</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Conditional branching allows programs to make decisions at runtime by executing specific code blocks based on expression truthiness. The `elif` statement chains multiple exclusive conditions sequentially, stopping at the first `True` condition. Python also supports single-line ternary operators (`value_if_true if condition else value_if_false`) for concise conditional variable assignment.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-blue-400"><FileCode size={12} /> 10_conditionals.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-blue-300 mb-3 whitespace-pre-wrap">{`status_code = 200

# Standard branching
if status_code == 200:
    msg = "OK"
elif status_code == 404:
    msg = "Not Found"
else:
    msg = "Error"

# Single-line Ternary Expression
status_label = "Success" if status_code == 200 else "Failure"

print(f"Msg: {msg}, Label: {status_label}")`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Msg: OK, Label: Success</code>
          </div>
        </div>
      </section>

      {/* 12. FOR LOOPS */}
      <section id="for-loops" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Code2 size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">12. `for` Loops & `for...else` Construct</h2>
            <p className="text-xs text-gray-400">Iterating over sequences and executing `else` when loop completes without `break`</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Python `for` loops iterate over sequence items (lists, tuples, strings, generators) using the internal iterator protocol. Uniquely, Python features a `for...else` construct where the `else` block executes only if the loop finishes iterating naturally without hitting a `break` statement. This pattern provides an elegant way to handle search fallbacks without maintaining manual boolean flag variables.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-purple-400"><FileCode size={12} /> 11_for_else.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-purple-300 mb-3 whitespace-pre-wrap">{`items = ["chunk_1", "chunk_2", "target_chunk"]

for item in items:
    if item == "target_chunk":
        print("Found target!")
        break
else:
    print("Loop completed without break.")`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Found target!</code>
          </div>
        </div>
      </section>

      {/* 13. WHILE LOOPS */}
      <section id="while-loops" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Zap size={24} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">13. `while` Loops, `break`, `continue` & `pass`</h2>
            <p className="text-xs text-gray-400">Indefinite iteration control and loop modifier statements</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          A `while` loop continues executing as long as its condition remains `True`, making it ideal for polling services, stream processing, or event loops. The `break` statement immediately terminates the loop, `continue` skips the remainder of the current iteration, and `pass` serves as a syntactical no-op placeholder for unimplemented branches.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-cyan-400"><FileCode size={12} /> 12_while_loop.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-cyan-300 mb-3 whitespace-pre-wrap">{`attempts = 0

while attempts < 5:
    attempts += 1
    if attempts == 2:
        continue  # Skip iteration 2
    if attempts == 4:
        break     # Exit loop at 4
    print("Attempt:", attempts)`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Attempt: 1<br/>Attempt: 3</code>
          </div>
        </div>
      </section>

      {/* 14. ENUMERATE & ZIP */}
      <section id="enumerate-zip" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Layers size={24} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">14. `enumerate()` & `zip()` Functions</h2>
            <p className="text-xs text-gray-400">Indexed iteration and multi-sequence parallel iteration</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          The `enumerate()` built-in function wraps an iterable sequence to yield `(index, item)` tuples during iteration, eliminating manual counter management. The `zip()` function aggregates elements from multiple iterables into paired tuples, stopping automatically when the shortest input sequence is exhausted. Combining `enumerate(zip(...))` offers clean, Pythonic parallel iteration over synchronized collections.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-emerald-400"><FileCode size={12} /> 13_enumerate_zip.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-emerald-300 mb-3 whitespace-pre-wrap">{`models = ["GPT-4o", "Claude 3.5"]
scores = [0.95, 0.98]

# Parallel iteration with zip and index tracking with enumerate
for idx, (m, s) in enumerate(zip(models, scores), start=1):
    print(f"#{idx} {m}: {s}")`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>#1 GPT-4o: 0.95<br/>#2 Claude 3.5: 0.98</code>
          </div>
        </div>
      </section>

      {/* 15. MATCH-CASE */}
      <section id="match-case" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <GitBranch size={24} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">15. Structural Pattern Matching (`match-case`)</h2>
            <p className="text-xs text-gray-400">Pattern matching on data structures and values (Python 3.10+)</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Introduced in Python 3.10, structural pattern matching (`match-case`) enables powerful matching over values, sequence shapes, and dictionary keys. Unlike basic `switch` statements in C/Java, `match-case` deconstructs data structures and binds inner variables automatically. This makes it invaluable for parsing complex API payloads, abstract syntax trees, and state machine transitions.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-amber-400"><FileCode size={12} /> 14_match_case.py</span>
            <span>Python 3.10+</span>
          </div>
          <CodeSnippet className="text-amber-300 mb-3 whitespace-pre-wrap">{`response = {"status": 200, "data": {"text": "Success"}}

match response:
    case {"status": 200, "data": {"text": txt}}:
        print(f"Received Text: {txt}")
    case {"status": err_code}:
        print(f"Error Code: {err_code}")
    case _:
        print("Unknown payload")`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Received Text: Success</code>
          </div>
        </div>
      </section>
      <KnowledgeCheck questions={questionsFor("python-core")} />
    </GuideLayout>
  );
}

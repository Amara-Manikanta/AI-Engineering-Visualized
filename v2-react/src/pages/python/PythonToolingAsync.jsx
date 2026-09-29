import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../../components/GuideLayout';
import { CodeSnippet } from '../../components/CodeBlock';

/* ---------------------------------------------------------------------------
   Sequential vs concurrent timeline. Three API calls that each take 2s: run
   one after another it's 6s, run them concurrently and it's ~2s — because the
   waiting overlaps. This is the entire argument for async in an LLM app.
--------------------------------------------------------------------------- */

const CALLS = [
  { name: 'call_llm(a)', tone: 'bg-indigo-500' },
  { name: 'call_llm(b)', tone: 'bg-purple-500' },
  { name: 'call_llm(c)', tone: 'bg-cyan-500' },
];

function AsyncTimelineVisual() {
  const [mode, setMode] = useState('concurrent');
  const isSeq = mode === 'sequential';
  const total = isSeq ? 6 : 2;

  return (
    <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-5 mb-4">
      <div className="flex gap-2 mb-5">
        {[
          { k: 'sequential', label: 'Sequential (await one by one)' },
          { k: 'concurrent', label: 'Concurrent (asyncio.gather)' },
        ].map((m) => (
          <button
            key={m.k}
            onClick={() => setMode(m.k)}
            className={`px-3 py-1.5 rounded-lg border text-xs font-semibold transition-colors ${
              mode === m.k
                ? m.k === 'sequential'
                  ? 'bg-rose-500/20 border-rose-500/50 text-rose-200'
                  : 'bg-emerald-500/20 border-emerald-500/50 text-emerald-200'
                : 'bg-white/5 border-white/10 text-gray-400 hover:border-white/30'
            }`}
          >
            {m.label}
          </button>
        ))}
      </div>

      {/* timeline */}
      <div className="space-y-2 mb-2">
        {CALLS.map((c, i) => {
          const startPct = isSeq ? (i * 2 / total) * 100 : 0;
          const widthPct = (2 / total) * 100;
          return (
            <div key={c.name} className="flex items-center gap-3">
              <span className="text-[0.6875rem] font-mono text-gray-400 w-24 shrink-0">{c.name}</span>
              <div className="flex-1 h-7 rounded bg-white/5 relative overflow-hidden">
                <div
                  className={`absolute top-0 bottom-0 ${c.tone} opacity-70 rounded flex items-center justify-center transition-all duration-500`}
                  style={{ left: `${startPct}%`, width: `${widthPct}%` }}
                >
                  <span className="text-[0.5625rem] font-bold text-black/70">waiting on network</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>

      {/* axis */}
      <div className="flex items-center gap-3 mb-4">
        <span className="w-24 shrink-0" />
        <div className="flex-1 flex justify-between text-[0.5625rem] font-mono text-gray-600 border-t border-gray-800 pt-1">
          {Array.from({ length: total + 1 }).map((_, i) => (
            <span key={i}>{i}s</span>
          ))}
        </div>
      </div>

      <div className={`p-3 rounded-lg border text-center font-mono text-sm ${
        isSeq
          ? 'bg-rose-500/10 border-rose-500/30 text-rose-200'
          : 'bg-emerald-500/10 border-emerald-500/30 text-emerald-200'
      }`}>
        total: {total}s
        {!isSeq && <span className="text-[0.6875rem] opacity-70 ml-2">— 3× faster, same code count</span>}
      </div>

      <p className="text-[0.6875rem] text-gray-400 leading-relaxed mt-3 mb-0">
        {isSeq
          ? 'Each await blocks until its call returns before the next one starts. The CPU sits idle the whole time — it is waiting on the network, not computing.'
          : 'All three requests are in flight at once. Async does not make any single call faster; it stops you from idling while one waits. This only helps for I/O-bound work.'}
      </p>
    </div>
  );
}
import { Terminal, FileCode, Layers, Folder, Box, Globe, FileJson, Zap, TestTube, ArrowRight } from 'lucide-react';

export default function PythonToolingAsync() {
  const toc = [
    { label: "44. pathlib.Path Object Methods", hash: "#pathlib" },
    { label: "45. File I/O & Context Managers", hash: "#file-io" },
    { label: "46. Modules & Imports", hash: "#modules" },
    { label: "47. Project Structure & Relative Imports", hash: "#project-structure" },
    { label: "48. Virtual Envs, pip, .env & Requirements", hash: "#virtualenvs" },
    { label: "49. Working with APIs (httpx)", hash: "#apis" },
    { label: "50. JSON Parsing & Serialization", hash: "#json" },
    { label: "51. YAML Parsing & Config", hash: "#yaml" },
    { label: "52. Async Basics (async / await)", hash: "#async-basics" },
    { label: "53. asyncio.gather() Concurrency", hash: "#async-gather" },
    { label: "54. Concurrency Models & the GIL", hash: "#concurrency-models" },
    { label: "55. Semaphores & Rate Limiting", hash: "#rate-limiting" },
    { label: "56. Logging for Production", hash: "#logging" },
    { label: "57. Pytest Fixtures & Assertions", hash: "#pytest-fixtures" },
    { label: "58. Pytest Parameterization & Mocks", hash: "#pytest-mocks" }
  ];

  return (
    <GuideLayout
      title="Module 4: System, Tooling & Async Python"
      intro="Comprehensive technical guide for modern file I/O, production AI project structures, virtual environments, API integration, JSON/YAML parsing, AsyncIO concurrency, and Pytest."
      toc={toc}
    >
      {/* 40. PATHLIB */}
      <section id="pathlib" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <Folder size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">44. Modern Filesystem Paths (`pathlib.Path`)</h2>
            <p className="text-xs text-gray-400">Object-oriented path manipulation (`/` operator, `mkdir`, `exists`, `glob`)</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          The `pathlib` module provides an object-oriented interface for manipulating filesystem paths across operating systems. Overloaded `/` operators combine path segments cleanly regardless of OS-specific slash conventions. Methods like `.mkdir()`, `.exists()`, `.read_text()`, `.write_text()`, and `.glob()` handle file operations intuitively without legacy `os.path` string manipulation.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-blue-400"><FileCode size={12} /> 39_pathlib.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-emerald-300 mb-3 whitespace-pre-wrap">{`from pathlib import Path

base_dir = Path("./storage")
file_path = base_dir / "data.json"

base_dir.mkdir(exist_ok=True)
file_path.write_text('{"status": "ready"}')

print("Path Exists:", file_path.exists())`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Path Exists: True</code>
          </div>
        </div>
      </section>

      {/* 41. FILE IO */}
      <section id="file-io" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Folder size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">45. File I/O Modes & `with` Context Managers</h2>
            <p className="text-xs text-gray-400">Reading, writing, appending, binary mode (`rb`, `wb`), automatic file closure</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          File operations use `open(filename, mode)` to manage stream pointers across read (`'r'`), write (`'w'`), append (`'a'`), and binary (`'b'`) modes. Wrapping file operations inside `with open(...) as f:` context managers guarantees automatic resource cleanup and file handle closure even if runtime exceptions occur during reading or writing.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-purple-400"><FileCode size={12} /> 40_file_io.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-purple-300 mb-3 whitespace-pre-wrap">{`# Context manager ensures file is closed automatically
with open("log.txt", "w", encoding="utf-8") as f:
    f.write("Line 1\\n")
    f.write("Line 2\\n")

with open("log.txt", "r") as f:
    lines = f.readlines()

print("Line Count:", len(lines))`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Line Count: 2</code>
          </div>
        </div>
      </section>

      {/* 42. MODULES */}
      <section id="modules" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Box size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">46. Modules & Import Mechanics</h2>
            <p className="text-xs text-gray-400">`import`, `from ... import`, aliasing `as`, `sys.path` lookup resolution</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          A Python module is a single `.py` file containing functions, classes, and executable statements. The `import` statement resolves modules using paths listed in `sys.path`, compiling them to bytecode on first load. Alias imports (`import math as m`) keep call syntax concise, while selective imports (`from module import symbol`) import specific definitions into the local namespace.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-cyan-400"><FileCode size={12} /> 41_imports.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-cyan-300 mb-3 whitespace-pre-wrap">{`import math as m
from datetime import datetime

now = datetime.now()
val = m.sqrt(16)

print(f"Sqrt: {val}, Date: {now.strftime('%Y-%m-%d')}")`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Sqrt: 4.0, Date: 2026-08-04</code>
          </div>
        </div>
      </section>

      {/* 43. PROJECT STRUCTURE */}
      <section id="project-structure" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <Folder size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">47. AI App Project Structure & Relative Imports</h2>
            <p className="text-xs text-gray-400">Moving from one-file scripts to real modular production projects (`__init__.py`)</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          <strong>Moving from single-file scripts to production projects:</strong> Real AI applications are structured into modular packages. Directories containing <code>__init__.py</code> allow Python to recognize subfolders as packages. Developers use <strong>Absolute Imports</strong> (<code>from ai_app.rag.loader import LoadPdf</code>) or <strong>Relative Imports</strong> (<code>from .chunker import split_text</code>) to cleanly organize RAG components.
        </p>

        {/* Directory Structure Diagram */}
        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs mb-4">
          <div className="text-emerald-400 font-bold mb-2">📁 Production AI Application Directory Layout</div>
          <CodeSnippet className="text-gray-300 whitespace-pre-wrap">{`ai_app/
  ├── main.py             # Entrypoint script
  ├── rag/
  │   ├── __init__.py     # Package marker
  │   ├── loader.py       # Document Loaders (PDF, Web, DB)
  │   ├── chunker.py      # Text Splitters & Chunking
  │   ├── retriever.py    # Vector Store & Search
  │   └── generator.py    # LLM Prompt Generator
  └── utils/
      ├── __init__.py
      └── config.py       # API Keys & Settings`}</CodeSnippet>
        </div>
      </section>

      {/* 44. VIRTUAL ENVS AND PIP */}
      <section id="virtualenvs" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <Layers size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">48. Virtual Environments (`venv`), `pip`, `.env` & Requirements</h2>
            <p className="text-xs text-gray-400">Dependency isolation, `requirements.txt`, and API key protection with `python-dotenv`</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Virtual environments create isolated Python environments for each project, avoiding package version conflicts across system Python installations. Developers install packages via <code>pip</code>, save snapshot locks to <code>requirements.txt</code>, and keep API secrets secure in <code>.env</code> files loaded using <code>python-dotenv</code>.
        </p>

        {/* Visual Isolation Model */}
        <motion.div 
          initial={{ opacity: 0, y: 15 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-4 text-center text-xs"
        >
          <div className="font-bold text-amber-300 mb-3 uppercase tracking-wider">🔒 Environment Isolation Architecture</div>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-2">
            <div className="bg-amber-900/30 border border-amber-500/40 px-3 py-2 rounded-lg">AI Project</div>
            <ArrowRight className="text-amber-400 hidden sm:block" size={16} />
            <div className="bg-purple-900/30 border border-purple-500/40 px-3 py-2 rounded-lg">Virtual Environment (`.venv`)</div>
            <ArrowRight className="text-purple-400 hidden sm:block" size={16} />
            <div className="bg-cyan-900/30 border border-cyan-500/40 px-3 py-2 rounded-lg">Installed Packages (`pip`)</div>
            <ArrowRight className="text-cyan-400 hidden sm:block" size={16} />
            <div className="bg-emerald-900/30 border border-emerald-500/40 px-3 py-2 rounded-lg">Isolated AI App</div>
          </div>
        </motion.div>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-amber-400"><Terminal size={12} /> Terminal Commands</span>
            <span>Virtual Environment Setup</span>
          </div>
          <CodeSnippet className="text-amber-300 mb-3 whitespace-pre-wrap">{`# 1. Create Virtual Environment
$ python -m venv .venv

# 2. Activate Environment (macOS/Linux vs Windows)
$ source .venv/bin/activate        # macOS/Linux
> .venv\\Scripts\\activate          # Windows

# 3. Install AI Dependencies & Secure Secrets
$ pip install openai langchain python-dotenv
$ pip freeze > requirements.txt`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Successfully installed openai-1.12.0 langchain-0.1.0 python-dotenv-1.0.0</code>
          </div>
        </div>
      </section>

      {/* 45. APIS */}
      <section id="apis" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <Globe size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">49. Working with APIs (`requests` & `httpx`)</h2>
            <p className="text-xs text-gray-400">HTTP `GET`/`POST` requests, custom headers, bearer tokens, JSON responses</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          HTTP client libraries enable applications to interact with web APIs and microservices. The `requests` library provides intuitive synchronous `GET`/`POST` methods, header injection, payload encoding, and status code handling, while `httpx` adds full asynchronous `async`/`await` support for high-concurrency integrations.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-teal-400"><FileCode size={12} /> 44_api_requests.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-teal-300 mb-3 whitespace-pre-wrap">{`import requests

url = "https://httpbin.org/post"
headers = {"Authorization": "Bearer token_abc123"}
payload = {"prompt": "Explain RAG"}

res = requests.post(url, json=payload, headers=headers, timeout=5)
print("Status Code:", res.status_code)`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Status Code: 200</code>
          </div>
        </div>
      </section>

      {/* 46. JSON */}
      <section id="json" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-pink-500/20 text-pink-400 border border-pink-500/30">
            <FileJson size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">50. JSON Parsing & Serialization</h2>
            <p className="text-xs text-gray-400">Converting string to dict (`loads`) and dict to string (`dumps`)</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          JSON (JavaScript Object Notation) is the standard data interchange format for REST APIs and configuration files. Python's built-in `json` module provides `json.loads()` to deserialize JSON strings into native dictionaries or lists, and `json.dumps()` to serialize Python objects into formatted JSON strings.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-pink-400"><FileCode size={12} /> 45_json.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-pink-300 mb-3 whitespace-pre-wrap">{`import json

json_text = '{"name": "GPT-4o", "tokens": 128000}'
data = json.loads(json_text)

print("Parsed Name:", data["name"])`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Parsed Name: GPT-4o</code>
          </div>
        </div>
      </section>

      {/* 47. YAML */}
      <section id="yaml" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <FileJson size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">51. YAML Parsing & Configuration</h2>
            <p className="text-xs text-gray-400">Loading structured YAML configuration files safely with `pyyaml`</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          YAML is a human-readable data serialization language widely used for system configurations, Docker Compose definitions, and LLM framework settings. Using `pyyaml`'s `yaml.safe_load()` parses structured YAML text into nested Python dictionaries while preventing arbitrary code execution vulnerabilities associated with unsafe YAML loaders.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-blue-400"><FileCode size={12} /> 46_yaml.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-blue-300 mb-3 whitespace-pre-wrap">{`import yaml

yaml_text = """
version: '3.8'
services:
  app:
    image: python:3.11
"""

cfg = yaml.safe_load(yaml_text)
print("Image:", cfg["services"]["app"]["image"])`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Image: python:3.11</code>
          </div>
        </div>
      </section>

      {/* 48. ASYNC BASICS */}
      <section id="async-basics" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 border border-purple-500/30">
            <Zap size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">52. Async Python Basics (`async` / `await`)</h2>
            <p className="text-xs text-gray-400">Event loops, coroutine functions, non-blocking asynchronous execution</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Asynchronous programming enables single-threaded concurrent execution of I/O-bound tasks without multi-threading overhead. Declaring functions with `async def` creates coroutines, and `await` suspends execution back to the event loop while waiting for non-blocking network or file operations to resolve.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-purple-400"><FileCode size={12} /> 47_async_basics.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-purple-300 mb-3 whitespace-pre-wrap">{`import asyncio

async def fetch_token():
    await asyncio.sleep(0.05)
    return "token_sec_99"

async def main():
    token = await fetch_token()
    print("Received:", token)

asyncio.run(main())`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Received: token_sec_99</code>
          </div>
        </div>
      </section>

      {/* 49. ASYNC GATHER */}
      <section id="async-gather" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-cyan-500/20 text-cyan-400 border border-cyan-500/30">
            <Zap size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">53. `asyncio.gather()` Parallel Concurrency</h2>
            <p className="text-xs text-gray-400">Executing multiple coroutines concurrently without multi-threading overhead</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          The <code>asyncio.gather(*coroutines)</code> function executes multiple coroutines concurrently on a single event loop. Instead of sequentially waiting for independent API calls one by one, <code>gather()</code> dispatches them simultaneously, collecting all results into a single list once every coroutine finishes. Toggle the timeline below to see where the time actually goes.
        </p>

        <AsyncTimelineVisual />

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-cyan-400"><FileCode size={12} /> 48_async_gather.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-cyan-300 mb-3 whitespace-pre-wrap">{`import asyncio

async def call_llm(prompt_id):
    await asyncio.sleep(0.1)
    return f"Response {prompt_id}"

async def main():
    prompts = [call_llm(i) for i in range(3)]
    results = await asyncio.gather(*prompts)
    print("Parallel Batch:", results)

asyncio.run(main())`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>Parallel Batch: ['Response 0', 'Response 1', 'Response 2']</code>
          </div>
        </div>
      </section>

      {/* 50. PYTEST FIXTURES */}
      {/* 50. CONCURRENCY MODELS & THE GIL */}
      <section id="concurrency-models" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-orange-500/20 text-orange-400 border border-orange-500/30">
            <Zap size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">54. Concurrency Models & the GIL</h2>
            <p className="text-xs text-gray-400">asyncio vs threading vs multiprocessing — and why picking wrong makes things slower</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Python has three ways to do more than one thing at a time, and they are not interchangeable. The deciding
          factor is whether your work is <strong className="text-white">I/O-bound</strong> (waiting on a network, disk,
          or database) or <strong className="text-white">CPU-bound</strong> (actually computing). Choosing the wrong
          model can leave you no faster — or measurably slower.
        </p>

        <div className="bg-amber-950/20 border border-amber-500/30 p-4 rounded-xl mb-4">
          <div className="text-amber-300 font-bold text-xs mb-1.5">🔒 The GIL (Global Interpreter Lock)</div>
          <p className="text-[0.6875rem] text-gray-300 leading-relaxed m-0">
            CPython allows only <strong className="text-gray-100">one thread to execute Python bytecode at a time</strong>.
            Threads still help for I/O, because the GIL is released while a thread waits on the network — but they buy
            you nothing for pure computation, since only one can run regardless of how many cores you have. That single
            constraint is why <code className="text-amber-200">multiprocessing</code> exists.
          </p>
        </div>

        <div className="overflow-x-auto rounded-xl border border-gray-800 mb-4">
          <table className="w-full text-xs border-collapse">
            <thead>
              <tr className="bg-gray-800/50">
                <th className="px-3 py-2.5 text-left text-gray-300 border-b border-gray-800">Model</th>
                <th className="px-3 py-2.5 text-left text-gray-300 border-b border-gray-800">Best for</th>
                <th className="px-3 py-2.5 text-left text-gray-300 border-b border-gray-800">Parallel?</th>
                <th className="px-3 py-2.5 text-left text-gray-300 border-b border-gray-800">Cost</th>
                <th className="px-3 py-2.5 text-left text-gray-300 border-b border-gray-800">Typical use</th>
              </tr>
            </thead>
            <tbody className="text-gray-400">
              <tr>
                <td className="px-3 py-2.5 border-b border-gray-900 font-mono text-emerald-300 font-semibold">asyncio</td>
                <td className="px-3 py-2.5 border-b border-gray-900">I/O-bound</td>
                <td className="px-3 py-2.5 border-b border-gray-900 text-amber-400">No — 1 thread, interleaved</td>
                <td className="px-3 py-2.5 border-b border-gray-900">Cheapest (no OS threads)</td>
                <td className="px-3 py-2.5 border-b border-gray-900">Thousands of LLM/API calls</td>
              </tr>
              <tr className="bg-gray-900/30">
                <td className="px-3 py-2.5 border-b border-gray-900 font-mono text-blue-300 font-semibold">threading</td>
                <td className="px-3 py-2.5 border-b border-gray-900">I/O-bound, blocking libs</td>
                <td className="px-3 py-2.5 border-b border-gray-900 text-amber-400">No (GIL)</td>
                <td className="px-3 py-2.5 border-b border-gray-900">Moderate — OS threads</td>
                <td className="px-3 py-2.5 border-b border-gray-900">Wrapping a non-async SDK</td>
              </tr>
              <tr>
                <td className="px-3 py-2.5 border-b border-gray-900 font-mono text-purple-300 font-semibold">multiprocessing</td>
                <td className="px-3 py-2.5 border-b border-gray-900">CPU-bound</td>
                <td className="px-3 py-2.5 border-b border-gray-900 text-emerald-400">Yes — real cores</td>
                <td className="px-3 py-2.5 border-b border-gray-900">Expensive — separate memory</td>
                <td className="px-3 py-2.5 border-b border-gray-900">Embedding math, image work</td>
              </tr>
            </tbody>
          </table>
        </div>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-orange-400"><FileCode size={12} /> 50_concurrency.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-orange-300 mb-3 whitespace-pre-wrap">{`import asyncio, time
from concurrent.futures import ProcessPoolExecutor

# I/O-BOUND -> asyncio. The GIL is released while awaiting the network.
async def fetch_all(urls):
    async with httpx.AsyncClient() as client:
        return await asyncio.gather(*(client.get(u) for u in urls))

# CPU-BOUND -> multiprocessing. Each process gets its own interpreter,
# so each gets its own GIL and can use a real core.
def heavy(v):
    return sum(i * i for i in range(10_000_000))

with ProcessPoolExecutor() as pool:
    results = list(pool.map(heavy, range(4)))

# WRONG: threads for CPU work. The GIL serializes them, and you pay
# context-switching overhead on top -> often SLOWER than one thread.`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Rule of thumb:</div>
            <code>Waiting? → asyncio. &nbsp; Computing? → multiprocessing.</code>
          </div>
        </div>
      </section>

      {/* 51. SEMAPHORES & RATE LIMITING */}
      <section id="rate-limiting" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-rose-500/20 text-rose-400 border border-rose-500/30">
            <Zap size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">55. Semaphores & Rate Limiting</h2>
            <p className="text-xs text-gray-400">Bounding concurrency so you don't get 429-ed by the API you're calling</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          <code>asyncio.gather()</code> on 5,000 items launches 5,000 simultaneous requests, which will exhaust your
          connection pool and get you rate-limited or banned. A <strong className="text-white">semaphore</strong> is a
          counter that permits only N coroutines into a block at once — the standard way to say "at most 10 in flight".
          Pair it with exponential-backoff retries, because at scale some calls <em>will</em> fail.
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mb-4">
          {[
            { t: 'Semaphore', d: 'Caps how many run at once. Prevents connection-pool exhaustion.', tone: 'border-rose-500/25 bg-rose-500/10', label: 'text-rose-400' },
            { t: 'Exponential backoff', d: 'Wait 1s, 2s, 4s… between retries so you stop hammering a struggling service.', tone: 'border-amber-500/25 bg-amber-500/10', label: 'text-amber-400' },
            { t: 'Jitter', d: 'Randomize the wait so all your workers do not retry in lockstep and re-spike the load.', tone: 'border-blue-500/25 bg-blue-500/10', label: 'text-blue-400' },
          ].map((c) => (
            <div key={c.t} className={`p-3.5 rounded-xl border ${c.tone}`}>
              <div className={`text-xs font-bold mb-1 ${c.label}`}>{c.t}</div>
              <p className="text-[0.6875rem] text-gray-300 leading-relaxed m-0">{c.d}</p>
            </div>
          ))}
        </div>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-rose-400"><FileCode size={12} /> 51_rate_limit.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-rose-300 mb-3 whitespace-pre-wrap">{`import asyncio, random

MAX_CONCURRENT = 10
sem = asyncio.Semaphore(MAX_CONCURRENT)

async def call_with_limit(client, prompt, retries=4):
    async with sem:                       # only 10 get past this line at once
        for attempt in range(retries):
            try:
                return await client.generate(prompt)
            except RateLimitError:
                if attempt == retries - 1:
                    raise
                # exponential backoff + jitter
                delay = (2 ** attempt) + random.uniform(0, 1)
                await asyncio.sleep(delay)

async def main(prompts):
    async with AsyncClient() as client:
        # 5000 coroutines are created, but only 10 ever run concurrently
        return await asyncio.gather(
            *(call_with_limit(client, p) for p in prompts)
        )`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Note:</div>
            <code>Use return_exceptions=True in gather() so one failure doesn't cancel the rest.</code>
          </div>
        </div>
      </section>

      {/* 52. LOGGING */}
      <section id="logging" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-teal-500/20 text-teal-400 border border-teal-500/30">
            <FileCode size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">56. Logging for Production</h2>
            <p className="text-xs text-gray-400">Why `print()` doesn't survive contact with a real deployment</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          <code>print()</code> has no severity, no timestamp, no source, and no way to be filtered or redirected — so
          in production it is either noise or nothing. The <code>logging</code> module gives you levels you can dial
          per environment, structured output your log platform can query, and automatic exception tracebacks.
        </p>

        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-4 mb-4">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-3">Levels, least to most severe</div>
          <div className="space-y-1.5">
            {[
              { l: 'DEBUG', d: 'Diagnostic detail. Off in production.', c: 'bg-gray-500', w: 20 },
              { l: 'INFO', d: 'Normal events worth recording — request served, job finished.', c: 'bg-blue-500', w: 40 },
              { l: 'WARNING', d: 'Something unexpected, but the app carries on. Default threshold.', c: 'bg-amber-500', w: 60 },
              { l: 'ERROR', d: 'An operation failed. Someone should look.', c: 'bg-orange-500', w: 80 },
              { l: 'CRITICAL', d: 'The application itself cannot continue.', c: 'bg-rose-500', w: 100 },
            ].map((lv) => (
              <div key={lv.l} className="flex items-center gap-3">
                <span className="text-[0.625rem] font-mono font-bold text-gray-300 w-16 shrink-0">{lv.l}</span>
                <div className="w-24 h-2 rounded bg-white/5 overflow-hidden shrink-0">
                  <div className={`h-full ${lv.c} opacity-70`} style={{ width: `${lv.w}%` }} />
                </div>
                <span className="text-[0.6875rem] text-gray-400">{lv.d}</span>
              </div>
            ))}
          </div>
        </div>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-teal-400"><FileCode size={12} /> 52_logging.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-teal-300 mb-3 whitespace-pre-wrap">{`import logging

# Configure ONCE, at your application entry point — never in a library.
logging.basicConfig(
    level=logging.INFO,
    format="%(asctime)s %(levelname)-8s %(name)s: %(message)s",
)

# One logger per module. __name__ makes the source obvious in output.
log = logging.getLogger(__name__)

def embed(texts):
    log.info("embedding %d texts", len(texts))   # lazy %s formatting
    try:
        return model.encode(texts)
    except Exception:
        # .exception() logs at ERROR *and* attaches the full traceback
        log.exception("embedding failed for %d texts", len(texts))
        raise

# Silence a noisy dependency without touching your own log level
logging.getLogger("httpx").setLevel(logging.WARNING)`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Output:</div>
            <code>2026-08-06 14:22:01 INFO&nbsp;&nbsp;&nbsp;&nbsp; __main__: embedding 128 texts</code>
          </div>
        </div>

        <div className="bg-teal-950/20 border border-teal-500/30 p-4 rounded-xl mt-4">
          <div className="text-teal-300 font-bold text-xs mb-1.5">Two habits worth forming</div>
          <p className="text-[0.6875rem] text-gray-300 leading-relaxed m-0">
            Use <strong className="text-gray-100">lazy formatting</strong> — <code className="text-teal-200">log.info("got %s", x)</code>{' '}
            not an f-string — so the string is only built if that level is actually enabled. And never log secrets,
            prompts containing user PII, or full API responses; logs get shipped to third-party platforms and retained
            far longer than you expect.
          </p>
        </div>
      </section>

      <section id="pytest-fixtures" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
            <TestTube size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">57. Pytest Fixtures & Assertions</h2>
            <p className="text-xs text-gray-400">Reusable test setups with `@pytest.fixture` and plain `assert` statements</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          Pytest is Python's premier testing framework, replacing verbose `unittest` boilerplate with clean Python `assert` expressions. The `@pytest.fixture` decorator defines reusable setup/teardown logic, injecting dependencies directly into test functions as named arguments.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-emerald-400"><FileCode size={12} /> test_fixtures.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-emerald-300 mb-3 whitespace-pre-wrap">{`import pytest

@pytest.fixture
def sample_vector():
    return [0.1, 0.5, 0.9]

def test_vector_dim(sample_vector):
    assert len(sample_vector) == 3
    assert sample_vector[0] == 0.1`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>test_fixtures.py . [100%] PASSED</code>
          </div>
        </div>
      </section>

      {/* 51. PYTEST PARAMETRIZE & MOCKS */}
      <section id="pytest-mocks" className="mb-16 scroll-mt-24 border-b border-white/10 pb-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="p-2 rounded-lg bg-amber-500/20 text-amber-400 border border-amber-500/30">
            <TestTube size={24} />
          </div>
          <div>
            <h2 className="text-2xl font-black text-white">58. Pytest Parameterization & Mocks</h2>
            <p className="text-xs text-gray-400">Data-driven testing (`@pytest.mark.parametrize`) and API mocking (`unittest.mock`)</p>
          </div>
        </div>

        <p className="text-xs text-gray-300 leading-relaxed mb-4">
          The `@pytest.mark.parametrize` decorator runs a single test function repeatedly across multiple sets of input parameters and expected outcomes. When testing external APIs, `unittest.mock.MagicMock` replaces network dependencies with controlled mock objects, ensuring unit test suites execute fast and deterministically.
        </p>

        <div className="bg-[#0e1117] rounded-xl border border-slate-700/60 p-4 font-mono text-xs">
          <div className="flex items-center justify-between text-[0.625rem] text-gray-500 pb-2 mb-2 border-b border-gray-800">
            <span className="flex items-center gap-1 text-amber-400"><FileCode size={12} /> test_parametrize.py</span>
            <span>Python 3.11</span>
          </div>
          <CodeSnippet className="text-amber-300 mb-3 whitespace-pre-wrap">{`import pytest
from unittest.mock import MagicMock

@pytest.mark.parametrize("val, expected", [(2, 4), (3, 9), (4, 16)])
def test_squares(val, expected):
    assert val ** 2 == expected

def test_mock_api():
    mock_client = MagicMock()
    mock_client.generate.return_value = "Mocked Response"
    assert mock_client.generate("prompt") == "Mocked Response"`}</CodeSnippet>
          <div className="bg-black/60 p-2.5 rounded border border-gray-800 text-[0.6875rem] text-gray-300">
            <div className="text-[0.625rem] text-gray-500 mb-1 flex items-center gap-1"><Terminal size={10}/> Terminal Output:</div>
            <code>test_parametrize.py .... [100%] PASSED</code>
          </div>
        </div>
      </section>
    </GuideLayout>
  );
}

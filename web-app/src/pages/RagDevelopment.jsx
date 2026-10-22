import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';

/* ---------------------------------------------------------------------------
   Framework comparison
--------------------------------------------------------------------------- */

const FRAMEWORKS = [
  {
    id: 'langchain',
    name: 'LangChain',
    icon: '🦜',
    tone: 'border-emerald-500/40 bg-emerald-500/10',
    text: 'text-emerald-400',
    tagline: 'The default general-purpose orchestrator.',
    strength: 'Enormous integration surface and the largest community, so whatever vector DB, model provider, or loader you need already has an adapter. LCEL gives you streaming, async, batching, and parallelism for free.',
    weakness: 'Abstraction layers can obscure what is actually being sent to the model. The API has moved fast enough that older tutorials are frequently wrong.',
    pick: 'General agent and chain building, and when you want maximum integration coverage.',
  },
  {
    id: 'llamaindex',
    name: 'LlamaIndex',
    icon: '🦙',
    tone: 'border-purple-500/40 bg-purple-500/10',
    text: 'text-purple-400',
    tagline: 'Specialized in ingestion and retrieval.',
    strength: 'The deepest toolkit specifically for the data side — advanced index structures, node parsers, recursive and hierarchical retrieval, and query engines that handle routing and decomposition out of the box.',
    weakness: 'Less natural as a general agent framework. Best used for its retrieval layer, often alongside another orchestrator.',
    pick: 'Retrieval-heavy systems where the indexing strategy is the hard part.',
  },
  {
    id: 'haystack',
    name: 'Haystack',
    icon: '🔍',
    tone: 'border-blue-500/40 bg-blue-500/10',
    text: 'text-blue-400',
    tagline: 'Production search, built by deepset.',
    strength: 'An explicit pipeline graph with typed inputs and outputs, which makes behavior predictable and testable. Strong operational story with clean evaluation and deployment paths.',
    weakness: 'Smaller ecosystem than LangChain, and fewer bleeding-edge integrations.',
    pick: 'Teams who value explicit, debuggable pipelines over rapid prototyping.',
  },
  {
    id: 'dspy',
    name: 'DSPy',
    icon: '⚙️',
    tone: 'border-amber-500/40 bg-amber-500/10',
    text: 'text-amber-400',
    tagline: 'Compile prompts instead of writing them.',
    strength: 'You declare the signature of what you want and supply a metric; DSPy optimizes the prompt and few-shot examples against your eval set automatically. Replaces manual prompt tweaking with something measurable.',
    weakness: 'A genuinely different mental model with a steeper learning curve, and it requires an eval set before you get value.',
    pick: 'When you already have evaluation data and want to stop hand-tuning prompts.',
  },
  {
    id: 'semantic-kernel',
    name: 'Semantic Kernel',
    icon: '🔷',
    tone: 'border-cyan-500/40 bg-cyan-500/10',
    text: 'text-cyan-400',
    tagline: "Microsoft's enterprise SDK.",
    strength: 'First-class C# and .NET support alongside Python, and tight integration with Azure OpenAI and Azure AI Search. Fits naturally into existing Microsoft enterprise stacks.',
    weakness: 'Smaller community outside the Microsoft ecosystem, with fewer third-party integrations.',
    pick: '.NET shops and Azure-committed enterprises.',
  },
  {
    id: 'none',
    name: 'No framework',
    icon: '🔧',
    tone: 'border-gray-500/40 bg-gray-500/10',
    text: 'text-gray-300',
    tagline: 'Just call the APIs directly.',
    strength: 'Total transparency. You see every prompt and every API call, dependencies stay minimal, and nothing breaks under you on a framework upgrade. A basic RAG loop is genuinely about 50 lines.',
    weakness: 'You reimplement retries, streaming, batching, and every integration yourself. The cost grows sharply as the system does.',
    pick: 'Simple pipelines, or teams who have been burned by abstraction and want control.',
  },
];

function FrameworkExplorer() {
  const [active, setActive] = useState(FRAMEWORKS[0]);

  return (
    <div>
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-2 mb-5">
        {FRAMEWORKS.map((f) => {
          const isActive = active.id === f.id;
          return (
            <motion.button
              key={f.id}
              onClick={() => setActive(f)}
              whileHover={{ y: -3 }}
              className={`p-3 rounded-xl border text-center transition-all ${
                isActive ? `${f.tone} ring-2 ring-white/50` : 'bg-white/5 border-white/10 hover:border-white/30'
              }`}
            >
              <div className="text-xl mb-1">{f.icon}</div>
              <div className={`text-[0.6875rem] font-semibold leading-tight ${isActive ? f.text : 'text-gray-400'}`}>
                {f.name}
              </div>
            </motion.button>
          );
        })}
      </div>
        <motion.div
          key={active.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.22 }}
          className={`rounded-2xl border p-6 ${active.tone}`}
        >
          <div className="flex flex-wrap items-baseline gap-3 mb-4">
            <h3 className={`text-lg font-bold ${active.text}`}>
              {active.icon} {active.name}
            </h3>
            <span className="text-sm text-gray-400">{active.tagline}</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
            <div className="p-4 rounded-xl bg-black/30 border border-emerald-500/20">
              <div className="text-[0.625rem] uppercase tracking-wide text-emerald-400 mb-1.5">Strength</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{active.strength}</p>
            </div>
            <div className="p-4 rounded-xl bg-black/30 border border-rose-500/20">
              <div className="text-[0.625rem] uppercase tracking-wide text-rose-400 mb-1.5">Tradeoff</div>
              <p className="text-xs text-gray-300 leading-relaxed m-0">{active.weakness}</p>
            </div>
          </div>

          <div className="p-3.5 rounded-xl bg-black/30 border border-white/10">
            <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">Reach for it when</div>
            <div className="text-xs text-gray-300 leading-relaxed">{active.pick}</div>
          </div>
        </motion.div>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Pipeline code, split into index-time vs query-time
--------------------------------------------------------------------------- */

const INDEX_CODE = `# ---------- INDEX TIME: runs once (and on document updates) ----------
from langchain_community.document_loaders import DirectoryLoader, PyPDFLoader
from langchain_text_splitters import RecursiveCharacterTextSplitter
from langchain_openai import OpenAIEmbeddings
from langchain_community.vectorstores import Qdrant

# 1. Load
docs = DirectoryLoader("./docs", glob="**/*.pdf",
                       loader_cls=PyPDFLoader).load()

# 2. Split — separators are tried in order, so paragraphs break before words
splitter = RecursiveCharacterTextSplitter(
    chunk_size=1000,
    chunk_overlap=150,
    separators=["\\n\\n", "\\n", ". ", " ", ""],
)
chunks = splitter.split_documents(docs)

# 3. Embed + store. Metadata rides along automatically.
vectorstore = Qdrant.from_documents(
    chunks,
    OpenAIEmbeddings(model="text-embedding-3-small"),
    url=QDRANT_URL,
    collection_name="docs",
)`;

const QUERY_CODE = `# ---------- QUERY TIME: runs on every request ----------
from langchain_core.prompts import ChatPromptTemplate
from langchain_core.runnables import RunnablePassthrough
from langchain_core.output_parsers import StrOutputParser
from langchain_anthropic import ChatAnthropic

retriever = vectorstore.as_retriever(
    search_type="mmr",              # diversity, not just raw similarity
    search_kwargs={"k": 5, "fetch_k": 50},
)

PROMPT = ChatPromptTemplate.from_template("""Answer using ONLY the context below.
If the context does not contain the answer, say you don't know.
Cite the source filename for each claim.

<context>
{context}
</context>

Question: {question}""")

def format_docs(docs):
    return "\\n\\n".join(
        f"[{d.metadata.get('source', '?')}]\\n{d.page_content}" for d in docs
    )

chain = (
    {"context": retriever | format_docs, "question": RunnablePassthrough()}
    | PROMPT
    | ChatAnthropic(model="claude-sonnet-5", temperature=0)
    | StrOutputParser()
)

# Streams token-by-token for free, because every piece is a Runnable
for token in chain.stream("What is the refund window?"):
    print(token, end="", flush=True)`;

function PipelineCode() {
  const [tab, setTab] = useState('index');
  return (
    <div className="rounded-2xl border border-white/10 bg-[#141414] overflow-hidden">
      <div className="flex border-b border-white/10">
        {[
          { id: 'index', label: 'Index time', sub: 'runs once', tone: 'text-purple-400 border-purple-500' },
          { id: 'query', label: 'Query time', sub: 'runs per request', tone: 'text-blue-400 border-blue-500' },
        ].map((t) => (
          <button
            key={t.id}
            onClick={() => setTab(t.id)}
            className={`flex-1 px-4 py-3 text-left transition-colors border-b-2 ${
              tab === t.id ? `${t.tone} bg-white/5` : 'border-transparent text-gray-500 hover:text-gray-300'
            }`}
          >
            <div className="text-sm font-semibold">{t.label}</div>
            <div className="text-[0.625rem] opacity-70">{t.sub}</div>
          </button>
        ))}
      </div>
        <motion.pre
          key={tab}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.15 }}
          className="p-5 font-mono text-xs text-gray-300 overflow-x-auto m-0"
        >
          {tab === 'index' ? INDEX_CODE : QUERY_CODE}
        </motion.pre>
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Production readiness checklist
--------------------------------------------------------------------------- */

const CHECKLIST = [
  {
    cat: 'Deployment',
    icon: '🚀',
    tone: 'border-blue-500/30 bg-blue-500/10',
    text: 'text-blue-400',
    items: [
      ['Separate index-time from query-time', 'Run ingestion as a scheduled job or queue worker, never inside the request path.'],
      ['Use a managed vector DB', 'Self-hosting an index is an ops burden with no product upside. Qdrant Cloud, Pinecone, and pgvector on RDS are all fine.'],
      ['Cache embeddings', 'Embedding the same query text twice is pure waste. Cache on a hash of the input.'],
      ['Stream the response', 'Time-to-first-token is what users perceive as speed. Streaming makes a 6-second answer feel fast.'],
    ],
  },
  {
    cat: 'Monitoring',
    icon: '📊',
    tone: 'border-emerald-500/30 bg-emerald-500/10',
    text: 'text-emerald-400',
    items: [
      ['Log the retrieved chunks, not just the answer', 'When a user reports a bad answer, the retrieved context is the only thing that explains why. Without it you are guessing.'],
      ['Track latency per stage', 'Embed, search, re-rank, and generate should be timed separately. The bottleneck is rarely where you assume.'],
      ['Watch cost per query', 'Re-ranking and decomposition multiply calls. Cost per query drifts upward silently as you add techniques.'],
      ['Capture thumbs up/down', 'Cheap explicit feedback, and it becomes the seed of your evaluation set.'],
    ],
  },
  {
    cat: 'Security',
    icon: '🔒',
    tone: 'border-rose-500/30 bg-rose-500/10',
    text: 'text-rose-400',
    items: [
      ['Enforce access control in the query filter', 'Filter by the user\'s permission groups in the vector DB query itself. Telling the model "only use documents the user can see" is not access control — it is a suggestion.'],
      ['Treat retrieved content as untrusted', 'A document in your corpus can contain injected instructions. Never let retrieved text control tool calls or system behavior.'],
      ['Never put secrets in the index', 'Anything embedded is retrievable. Scan for credentials and PII during ingestion, not after an incident.'],
      ['Rate-limit per user', 'RAG endpoints are expensive to run and trivially easy to abuse.'],
    ],
  },
];

export default function RagDevelopment() {
  const toc = [
    { label: 'Choosing a Framework', hash: 'frameworks' },
    { label: 'Building the Pipeline', hash: 'building' },
    { label: 'Index Time vs Query Time', hash: 'two-paths' },
    { label: 'Production Checklist', hash: 'production' },
  ];

  return (
    <GuideLayout
      title="Development & Frameworks"
      intro="Building and deploying RAG in the real world — what to build it with, what the code actually looks like, and what breaks in production."
      toc={toc}
    >
      <div className="space-y-16">
        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          id="frameworks"
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Choosing a Framework</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            You do not need to write vector math from scratch — but you also do not need a framework as much as the
            ecosystem implies. A minimal RAG loop is roughly fifty lines of direct API calls. Frameworks earn their
            keep through integrations, streaming, and retrieval strategies you would otherwise reimplement.
          </p>

          <FrameworkExplorer />

          <div className="mt-6 p-4 rounded-xl border border-amber-500/25 bg-amber-500/10">
            <p className="text-sm text-amber-200 leading-relaxed m-0">
              <strong>A practical note:</strong> the most common production setup is not "pick one" — it is
              LlamaIndex or a hand-rolled retriever for the data layer, feeding a LangChain or LangGraph orchestration
              layer. These libraries compose more happily than their marketing suggests.
            </p>
          </div>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          id="building"
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Building the Pipeline</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            The single most important structural insight: a RAG system is <strong className="text-white">two
            separate programs</strong> that share a vector store. Conflating them is the most common architectural
            mistake, and it shows up as re-embedding an entire corpus on every request.
          </p>
          <PipelineCode />
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          id="two-paths"
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Index Time vs Query Time</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            These two paths have completely different performance characteristics, failure modes, and deployment
            shapes. Treat them as separate services.
          </p>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
            {[
              {
                title: 'Index time',
                icon: '📦',
                tone: 'border-purple-500/30 bg-purple-500/10',
                text: 'text-purple-400',
                rows: [
                  ['Frequency', 'Once, then on document changes'],
                  ['Latency budget', 'Minutes to hours — nobody is waiting'],
                  ['Runs as', 'Batch job, cron, or queue worker'],
                  ['Scales with', 'Corpus size'],
                  ['Expensive work belongs here', 'Contextual retrieval, LLM-based metadata extraction, OCR'],
                  ['Failure looks like', 'Stale or missing documents'],
                ],
              },
              {
                title: 'Query time',
                icon: '⚡',
                tone: 'border-blue-500/30 bg-blue-500/10',
                text: 'text-blue-400',
                rows: [
                  ['Frequency', 'Every single request'],
                  ['Latency budget', 'Under ~2s to first token'],
                  ['Runs as', 'Web service behind an API'],
                  ['Scales with', 'Traffic'],
                  ['Keep this path lean', 'Embed query → search → re-rank → generate'],
                  ['Failure looks like', 'Timeouts, bad answers, cost spikes'],
                ],
              },
            ].map((c, ci) => (
              <motion.div
                key={c.title}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: ci * 0.1 }}
                className={`rounded-2xl border p-5 ${c.tone}`}
              >
                <div className={`font-bold mb-4 ${c.text}`}>
                  {c.icon} {c.title}
                </div>
                <div className="space-y-2.5">
                  {c.rows.map(([k, v]) => (
                    <div key={k} className="flex flex-col sm:flex-row sm:gap-3">
                      <span className="text-[0.625rem] uppercase tracking-wide text-gray-500 sm:w-32 shrink-0 pt-0.5">
                        {k}
                      </span>
                      <span className="text-xs text-gray-300 leading-relaxed">{v}</span>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>
        </motion.section>

        {/* ---------------------------------------------------------------- */}
        <motion.section
          initial={{ opacity: 0, y: 20 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '-100px' }}
          id="production"
          className="scroll-mt-24"
        >
          <h2 className="text-2xl font-semibold text-white mb-4">Production Checklist</h2>
          <p className="text-gray-300 leading-relaxed mb-6">
            The gap between a working demo and a production RAG system is mostly operational. These are the items that
            reliably bite teams shipping their first one.
          </p>

          <div className="space-y-5">
            {CHECKLIST.map((group, gi) => (
              <motion.div
                key={group.cat}
                initial={{ opacity: 0, y: 15 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: gi * 0.08 }}
                className={`rounded-2xl border p-5 ${group.tone}`}
              >
                <div className={`font-bold mb-4 ${group.text}`}>
                  {group.icon} {group.cat}
                </div>
                <div className="space-y-3">
                  {group.items.map(([t, d]) => (
                    <div key={t} className="flex gap-3">
                      <span className={`shrink-0 mt-0.5 ${group.text}`}>☑</span>
                      <div>
                        <div className="text-sm font-semibold text-gray-100 mb-0.5">{t}</div>
                        <p className="text-xs text-gray-400 leading-relaxed m-0">{d}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </motion.div>
            ))}
          </div>

          <div className="mt-6 p-5 rounded-xl border border-white/10 bg-white/5">
            <p className="text-sm text-gray-400 leading-relaxed m-0">
              <strong className="text-white">Before you ship:</strong> make sure you can answer "how do we know this
              got better?" with a number rather than an anecdote. Build the eval set first — see{' '}
              <a href="#/rag/evaluation" className="text-blue-400 hover:underline">
                Evaluation
              </a>
              . Everything on the{' '}
              <a href="#/rag/advanced-retrieval" className="text-blue-400 hover:underline">
                Advanced Retrieval
              </a>{' '}
              page adds latency and cost, so you need a way to tell whether it bought you anything.
            </p>
          </div>
        </motion.section>
      </div>
    </GuideLayout>
  );
}

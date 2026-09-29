import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Card, Note, Section, Segmented, Button } from "../components/VizKit";

export const SEARCH_KEYWORDS = [
  "text-to-SQL", "text to SQL", "NL2SQL", "natural language to SQL", "schema linking", "SQL generation",
  "SQL agent", "self-correction", "query validation", "read-only database", "SQL injection", "guardrails",
  "execution accuracy", "Spider", "BIRD benchmark", "semantic layer", "structured data RAG", "tabular question answering",
];

/* ---------------------------------------------------------------------------
   A toy shop database, and three questions walked through the pipeline.
   Query results are computed from the rows below in JavaScript.
--------------------------------------------------------------------------- */

const CUSTOMERS = [
  { id: 1, name: "Asha", country: "India" },
  { id: 2, name: "Ben", country: "UK" },
  { id: 3, name: "Chen", country: "India" },
  { id: 4, name: "Dara", country: "US" },
];
const ORDERS = [
  { id: 10, customer_id: 1, total: 120, placed_at: "2026-07-03" },
  { id: 11, customer_id: 2, total: 80, placed_at: "2026-07-19" },
  { id: 12, customer_id: 1, total: 45, placed_at: "2026-08-02" },
  { id: 13, customer_id: 3, total: 300, placed_at: "2026-08-11" },
  { id: 14, customer_id: 4, total: 60, placed_at: "2026-08-21" },
  { id: 15, customer_id: 3, total: 90, placed_at: "2026-09-01" },
];

const SCHEMA = {
  customers: ["id", "name", "country"],
  orders: ["id", "customer_id", "total", "placed_at"],
  products: ["id", "name", "price"],
  inventory: ["product_id", "warehouse", "qty"],
};

const byCountry = () => {
  const m = {};
  ORDERS.forEach((o) => {
    const c = CUSTOMERS.find((x) => x.id === o.customer_id).country;
    m[c] = (m[c] || 0) + o.total;
  });
  return Object.entries(m).sort((a, b) => b[1] - a[1]).map(([country, revenue]) => ({ country, revenue }));
};

const CASES = {
  revenue: {
    q: "Which country brought in the most revenue?",
    linked: { customers: ["id", "country"], orders: ["customer_id", "total"] },
    attempts: [
      {
        sql: "SELECT c.country, SUM(o.total) AS revenue\nFROM orders o JOIN customers c ON c.id = o.customer_id\nGROUP BY c.country\nORDER BY revenue DESC\nLIMIT 10;",
        result: byCountry,
      },
    ],
    answer: () => `${byCountry()[0].country}, with ${byCountry()[0].revenue} in orders.`,
  },
  august: {
    q: "How many orders were placed in August 2026?",
    linked: { orders: ["id", "placed_at"] },
    attempts: [
      {
        sql: "SELECT COUNT(*) AS orders\nFROM orders\nWHERE order_date >= '2026-08-01' AND order_date < '2026-09-01';",
        error: 'column "order_date" does not exist — HINT: did you mean "placed_at"?',
      },
      {
        sql: "SELECT COUNT(*) AS orders\nFROM orders\nWHERE placed_at >= '2026-08-01' AND placed_at < '2026-09-01'\nLIMIT 1;",
        result: () => [{ orders: ORDERS.filter((o) => o.placed_at >= "2026-08-01" && o.placed_at < "2026-09-01").length }],
      },
    ],
    answer: () => `${ORDERS.filter((o) => o.placed_at.startsWith("2026-08")).length} orders.`,
  },
  delete: {
    q: "Remove all orders from customers in the UK.",
    linked: { orders: ["customer_id"], customers: ["id", "country"] },
    attempts: [
      {
        sql: "DELETE FROM orders\nWHERE customer_id IN (SELECT id FROM customers WHERE country = 'UK');",
        blocked: "Only read-only SELECT statements are allowed. Modifying data needs a separate, human-approved flow.",
      },
    ],
    answer: () => "I can look data up, but I can't modify or delete records. Please ask an administrator.",
  },
};

const STAGES = ["Schema linking", "Generate SQL", "Validate", "Execute", "Answer"];

function PipelineLab() {
  const [caseId, setCaseId] = useState("revenue");
  const [stage, setStage] = useState(0);
  const c = CASES[caseId];
  const attempt = stage >= 3 ? c.attempts[c.attempts.length - 1] : c.attempts[0];
  const shown = stage >= 1 ? c.attempts.slice(0, stage >= 3 ? c.attempts.length : 1) : [];

  return (
    <Panel tone="indigo" title="From a question to an answer, one stage at a time">
      <div className="flex flex-wrap gap-3 items-center mb-4">
        <Segmented
          value={caseId}
          onChange={(v) => {
            setCaseId(v);
            setStage(0);
          }}
          options={[
            { v: "revenue", label: "Revenue by country" },
            { v: "august", label: "August orders (self-correct)" },
            { v: "delete", label: "A destructive request" },
          ]}
        />
      </div>
      <div className="text-sm text-white mb-3">“{c.q}”</div>
      <div className="flex flex-wrap gap-1.5 mb-4">
        {STAGES.map((s, i) => (
          <button key={s} onClick={() => setStage(i)} className={`px-2.5 py-1 rounded-lg text-xs border ${i === stage ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-100" : i < stage ? "border-emerald-500/30 text-emerald-300" : "border-white/10 text-gray-500"}`}>
            {i + 1}. {s}
          </button>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-[220px_minmax(0,1fr)] gap-4">
        <div className="rounded-xl border border-white/10 bg-black/30 p-3 text-xs font-mono">
          <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-2 font-sans">schema</div>
          {Object.entries(SCHEMA).map(([t, cols]) => {
            const used = c.linked[t];
            return (
              <div key={t} className={`mb-2 ${stage >= 0 && used ? "text-indigo-200" : "text-gray-600"}`}>
                <div className="font-bold">{t}</div>
                <div className="pl-2">
                  {cols.map((col) => (
                    <span key={col} className={`mr-2 ${used?.includes(col) ? "text-amber-300" : ""}`}>{col}</span>
                  ))}
                </div>
              </div>
            );
          })}
          <div className="text-[0.625rem] text-gray-500 font-sans mt-2">Highlighted: tables and columns the model selects for this question.</div>
        </div>

        <div className="space-y-2">
          {shown.map((a, i) => (
            <div key={i}>
              <pre className="text-xs bg-black/50 border border-white/10 rounded-lg p-3 text-emerald-200 overflow-x-auto m-0">{a.sql}</pre>
              {stage >= 2 && a.blocked && <div className="mt-1 text-xs text-rose-300">✗ Validator: {a.blocked}</div>}
              {stage >= 2 && !a.blocked && <div className="mt-1 text-xs text-emerald-300">✓ Validator: single read-only SELECT on allowed tables{a.sql.includes("LIMIT") ? ", LIMIT present" : ""}</div>}
              {stage >= 3 && a.error && <div className="mt-1 text-xs text-amber-300">⚠ Database error returned to the model: {a.error} → it regenerates the query</div>}
            </div>
          ))}
          {stage >= 3 && attempt.result && (
            <table className="text-xs font-mono">
              <tbody>
                {attempt.result().map((row, i) => (
                  <tr key={i} className="border-t border-white/5">
                    {Object.entries(row).map(([k, v]) => (
                      <td key={k} className="pr-4 py-1 text-gray-300"><span className="text-gray-500">{k}: </span>{v}</td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          )}
          {stage >= 4 && <div className="p-3 rounded-lg border border-indigo-500/30 bg-indigo-500/10 text-sm text-gray-100">{c.answer()}</div>}
        </div>
      </div>
      <div className="flex gap-2 mt-4">
        <Button onClick={() => setStage((v) => Math.max(0, v - 1))} disabled={stage === 0}>‹ Back</Button>
        <Button onClick={() => setStage((v) => Math.min(STAGES.length - 1, v + 1))} disabled={stage === STAGES.length - 1}>Next stage ›</Button>
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   A deliberately simple guardrail checker. Real systems should parse the SQL
   (e.g. with sqlglot) and rely on database permissions, not regexes alone.
--------------------------------------------------------------------------- */

const ALLOWED = ["customers", "orders", "products"];

function check(sql) {
  const s = sql.replace(/--.*$/gm, "").trim();
  const stripped = s.replace(/;\s*$/, "");
  const upper = stripped.toUpperCase();
  // Names defined in WITH … AS ( … ) are query-local, not database tables.
  const ctes = new Set([...stripped.matchAll(/\b([a-z_][a-z0-9_]*)\s+AS\s*\(/gi)].map((m) => m[1].toLowerCase()));
  const tables = [...stripped.matchAll(/\b(?:from|join)\s+([a-z_][a-z0-9_.]*)/gi)]
    .map((m) => m[1].toLowerCase())
    .filter((t) => !ctes.has(t));
  return [
    { ok: !stripped.includes(";"), label: "Exactly one statement" },
    { ok: /^\s*(SELECT|WITH)\b/i.test(stripped), label: "Starts with SELECT (or WITH)" },
    { ok: !/\b(INSERT|UPDATE|DELETE|DROP|ALTER|TRUNCATE|GRANT|CREATE|MERGE|COPY)\b/.test(upper), label: "No write or DDL keywords" },
    { ok: tables.length > 0 && tables.every((t) => ALLOWED.includes(t)), label: `Only allowed tables (${ALLOWED.join(", ")})` },
    { ok: /\bLIMIT\s+\d+/i.test(stripped) && Number((stripped.match(/\bLIMIT\s+(\d+)/i) || [])[1]) <= 1000, label: "Has a LIMIT of at most 1000" },
  ];
}

function GuardrailLab() {
  const [sql, setSql] = useState("SELECT name, country FROM customers WHERE country = 'India' LIMIT 50;");
  const results = useMemo(() => check(sql), [sql]);
  const pass = results.every((r) => r.ok);
  const examples = [
    "SELECT name, country FROM customers WHERE country = 'India' LIMIT 50;",
    "SELECT * FROM orders; DROP TABLE orders;",
    "SELECT * FROM inventory LIMIT 10;",
    "SELECT COUNT(*) FROM orders",
  ];
  return (
    <Panel tone="rose" title="Check a generated query before it runs">
      <textarea value={sql} onChange={(e) => setSql(e.target.value)} rows={3} spellCheck={false} className="w-full bg-black/50 border border-white/15 rounded-lg p-3 font-mono text-sm text-white mb-2" />
      <div className="flex flex-wrap gap-1.5 mb-4">
        {examples.map((e) => (
          <button key={e} onClick={() => setSql(e)} className="px-2 py-1 rounded-md text-[0.6875rem] font-mono border border-white/10 bg-white/5 text-gray-400 hover:text-white">{e.length > 42 ? e.slice(0, 42) + "…" : e}</button>
        ))}
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-1.5 mb-3">
        {results.map((r) => (
          <div key={r.label} className={`text-xs ${r.ok ? "text-emerald-300" : "text-rose-300"}`}>{r.ok ? "✓" : "✗"} {r.label}</div>
        ))}
      </div>
      <div className={`text-sm font-semibold ${pass ? "text-emerald-300" : "text-rose-300"}`}>{pass ? "Allowed to run" : "Blocked"}</div>
      <p className="text-xs text-gray-500 leading-relaxed mt-3 mb-0">
        A quick screen, not a security boundary: regexes can be fooled. The real protection is the database
        itself — connect with a read-only role that can only see approved views, set a statement timeout and row
        limit on the server, and parse queries with a proper SQL parser if you inspect them.
      </p>
    </Panel>
  );
}

export default function RagTextToSql() {
  const toc = [
    { label: "When Retrieval Is the Wrong Tool", hash: "why" },
    { label: "The Pipeline", hash: "pipeline" },
    { label: "Pipeline Lab", hash: "lab" },
    { label: "Getting Accuracy Up", hash: "accuracy" },
    { label: "Safety", hash: "safety" },
    { label: "Evaluating Text-to-SQL", hash: "evaluation" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Text-to-SQL"
      intro="Answering questions over databases by having the model write SQL: schema linking, generation, validation, self-correction from database errors, the guardrails that keep it read-only, and how to measure accuracy."
      toc={toc}
    >
      <Section id="why" title="When Retrieval Is the Wrong Tool" lead="“What was total revenue by country last quarter?” is not answered by finding similar text. The answer has to be computed from rows — so the model should write a query, and the database should do the maths.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Aggregates" tone="indigo"><p>Sums, counts, averages, rankings and trends over many rows — impossible to do reliably by retrieving a few chunks.</p></Card>
          <Card title="Exact filters" tone="emerald"><p>Dates, IDs, statuses and thresholds that must match precisely.</p></Card>
          <Card title="Combine with RAG" tone="amber"><p>Many assistants route: SQL for structured facts, document retrieval for policies and explanations. See <a href="#/rag/agentic-rag" className="text-blue-400 hover:underline">Agentic RAG</a>.</p></Card>
        </div>
      </Section>

      <Section id="pipeline" title="The Pipeline">
        <div className="grid grid-cols-1 md:grid-cols-5 gap-3">
          {[
            ["1. Schema linking", "Pick the relevant tables and columns, with descriptions and sample values, so the prompt stays small."],
            ["2. Generate", "Write the SQL for the right dialect, guided by few-shot examples of past questions and queries."],
            ["3. Validate", "Parse it, check it is read-only and uses allowed tables, add a limit."],
            ["4. Execute & repair", "Run it; on an error or empty result, feed the message back so the model can fix the query."],
            ["5. Answer", "Turn the rows into a sentence or chart, and show the SQL so users can check it."],
          ].map(([t, d]) => (
            <Card key={t} title={t} tone="indigo"><p>{d}</p></Card>
          ))}
        </div>
      </Section>

      <Section id="lab" title="Pipeline Lab" lead="A four-table toy shop. The rows the queries return are computed from the data, and the second question shows self-correction.">
        <PipelineLab />
      </Section>

      <Section id="accuracy" title="Getting Accuracy Up">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Describe the schema" tone="indigo"><p>Real schemas are cryptic (<span className="font-mono">cust_stat_cd</span>). Column descriptions, allowed values and join paths matter more than the model choice.</p></Card>
          <Card title="A semantic layer" tone="emerald"><p>Pre-defined metrics and clean views (“revenue” = net of refunds) stop the model inventing its own definitions. Point it at those, not raw tables.</p></Card>
          <Card title="Retrieve examples" tone="purple"><p>Store verified question → SQL pairs and retrieve the most similar ones as few-shot examples for each new question.</p></Card>
          <Card title="Ask when ambiguous" tone="amber"><p>“Last quarter” — calendar or fiscal? A clarifying question beats a confident wrong number.</p></Card>
        </div>
      </Section>

      <Section id="safety" title="Safety" lead="Model-written SQL runs against real data. Treat it like untrusted user input.">
        <GuardrailLab />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <Card title="Read-only role" tone="rose"><p>The database user can SELECT from approved views only. This is the guarantee; everything else is defence in depth.</p></Card>
          <Card title="Row-level security" tone="amber"><p>Apply the end user's permissions in the database, so the model cannot query other tenants' or other users' rows.</p></Card>
          <Card title="Resource limits" tone="indigo"><p>Statement timeouts, row limits and query cost limits stop accidental full-table scans on production.</p></Card>
        </div>
      </Section>

      <Section id="evaluation" title="Evaluating Text-to-SQL">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Execution accuracy" tone="emerald"><p>Run the generated and reference queries and compare the result sets. Different SQL that returns the same rows counts as correct.</p></Card>
          <Card title="Benchmarks" tone="indigo"><p>Spider and BIRD are the standard public benchmarks; BIRD uses larger, messier databases closer to real work. Your own schema is the benchmark that matters.</p></Card>
          <Card title="Log and learn" tone="amber"><p>Record every question, query and user correction. Verified pairs become few-shot examples and regression tests.</p></Card>
        </div>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`import sqlglot
from sqlalchemy import create_engine, text

engine = create_engine("postgresql://readonly_bot@db/shop")   # read-only role
ALLOWED = {"customers", "orders", "products"}

def validate(sql: str) -> str:
    tree = sqlglot.parse_one(sql, read="postgres")           # raises on bad SQL
    if tree.key not in ("select", "with", "union"):
        raise ValueError("only SELECT queries are allowed")
    ctes = {c.alias for c in tree.find_all(sqlglot.exp.CTE)}          # WITH names are not tables
    tables = {t.name for t in tree.find_all(sqlglot.exp.Table)} - ctes
    if not tables <= ALLOWED:
        raise ValueError(f"tables not allowed: {tables - ALLOWED}")
    return tree.limit(1000).sql(dialect="postgres")

def answer(question: str, max_attempts: int = 3):
    error = None
    for _ in range(max_attempts):
        sql = generate_sql(question, schema_for(question), previous_error=error)  # LLM call
        try:
            safe_sql = validate(sql)
            with engine.connect() as conn:
                conn.execute(text("SET statement_timeout = '5s'"))
                rows = conn.execute(text(safe_sql)).mappings().all()
            return summarise(question, safe_sql, rows)                          # LLM call
        except Exception as exc:
            error = str(exc)            # the model sees the error and repairs the query
    return "I couldn't build a working query for that question."`}
        />
        <Note tone="indigo">Show users the SQL (or a plain-language description of it) with every answer. It builds trust and lets analysts catch wrong joins or filters.</Note>
      </Section>

      <KnowledgeCheck questions={questionsFor("rag-text-to-sql")} />
    </GuideLayout>
  );
}

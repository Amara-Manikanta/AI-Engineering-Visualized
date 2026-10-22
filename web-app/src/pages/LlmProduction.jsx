import React, { useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section } from "../components/VizKit";

export const SEARCH_KEYWORDS = [
  "LLM in production", "deploying LLM apps", "LLMOps", "FastAPI", "streaming", "server-sent events", "SSE",
  "Docker", "observability", "tracing", "OpenTelemetry", "Langfuse", "LangSmith", "Arize Phoenix", "evals",
  "evaluation harness", "LLM-as-a-judge", "position bias", "verbosity bias", "golden dataset", "regression tests",
  "cost optimisation", "token cost", "prompt caching", "semantic caching", "batch API", "rate limits", "429",
  "exponential backoff", "retries", "fallback models", "model routing", "gateway", "canary release",
  "shadow deployment", "A/B testing", "Streamlit", "Gradio", "pytest", "guardrails",
];

/* ---------------------------------------------------------------------------
   Monthly cost with prompt caching and a batch share. Prices are inputs, not
   a quote — they differ by provider and model and change often.
--------------------------------------------------------------------------- */

function CostLab() {
  const [reqs, setReqs] = useState(20000);
  const [inTok, setInTok] = useState(6000);
  const [outTok, setOutTok] = useState(500);
  const [priceIn, setPriceIn] = useState(2);
  const [priceOut, setPriceOut] = useState(10);
  const [cached, setCached] = useState(0);
  const [cacheDiscount, setCacheDiscount] = useState(90);
  const [batch, setBatch] = useState(0);

  const days = 30;
  const month = reqs * days;
  const inCost = (tokens, share) => (month * share * tokens * priceIn) / 1e6;
  const cachedIn = inCost(inTok * (cached / 100), 1) * (1 - cacheDiscount / 100);
  const freshIn = inCost(inTok * (1 - cached / 100), 1);
  const out = (month * outTok * priceOut) / 1e6;
  const beforeBatch = cachedIn + freshIn + out;
  const total = beforeBatch * (1 - (batch / 100) * 0.5);
  const naive = inCost(inTok, 1) + out;

  const bar = (v, c, label) => (
    <div className="flex items-center gap-2 text-xs">
      <span className="w-28 text-gray-400">{label}</span>
      <div className="flex-1 h-4 bg-white/5 rounded overflow-hidden">
        <div className="h-full" style={{ width: `${(v / naive) * 100}%`, background: c, transition: "width 200ms" }} />
      </div>
      <span className="w-20 text-right font-mono text-gray-300">${Math.round(v).toLocaleString()}</span>
    </div>
  );

  return (
    <Panel tone="emerald" title="What will this cost per month?">
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
        <div className="space-y-3">
          <Slider tone="emerald" label="Requests per day" value={reqs} min={1000} max={500000} step={1000} onChange={setReqs} format={(v) => v.toLocaleString()} />
          <Slider tone="emerald" label="Input tokens per request" value={inTok} min={200} max={50000} step={100} onChange={setInTok} format={(v) => v.toLocaleString()} />
          <Slider tone="emerald" label="Output tokens per request" value={outTok} min={50} max={4000} step={50} onChange={setOutTok} format={(v) => v.toLocaleString()} />
          <div className="grid grid-cols-2 gap-3">
            <Slider tone="emerald" label="$ per 1M input" value={priceIn} min={0.1} max={15} step={0.1} onChange={setPriceIn} format={(v) => `$${v.toFixed(2)}`} />
            <Slider tone="emerald" label="$ per 1M output" value={priceOut} min={0.4} max={75} step={0.2} onChange={setPriceOut} format={(v) => `$${v.toFixed(2)}`} />
          </div>
        </div>
        <div className="space-y-3">
          <Slider label="Input served from prompt cache" value={cached} min={0} max={95} step={5} onChange={setCached} format={(v) => `${v}%`} />
          <Slider label="Discount on cached input" value={cacheDiscount} min={50} max={95} step={5} onChange={setCacheDiscount} format={(v) => `${v}% off`} />
          <Slider label="Traffic that can wait (batch, 50% off)" value={batch} min={0} max={100} step={5} onChange={setBatch} format={(v) => `${v}%`} />
          <div className="space-y-1.5 pt-1">
            {bar(freshIn, "#34d399", "input, uncached")}
            {bar(cachedIn, "#6ee7b7", "input, cached")}
            {bar(out, "#fbbf24", "output")}
          </div>
          <div className="grid grid-cols-2 gap-2">
            <Metric label="Monthly cost" value={`$${Math.round(total).toLocaleString()}`} tone="emerald" />
            <Metric label="Saved vs no caching/batch" value={`${Math.round((1 - total / naive) * 100)}%`} tone="indigo" />
          </div>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        With long prompts (system prompt, tools, retrieved context) input dominates the bill, which is why prompt
        caching — reusing an identical prefix across requests at a steep discount — is usually the first
        optimisation. Caching only works when the prefix is byte-identical, so keep stable content first and
        per-request content last. Work that can wait hours (evals, backfills, bulk tagging) can go through batch
        APIs at half price. Prices and cache discounts vary by provider and model: plug in your own.
      </p>
    </Panel>
  );
}

export default function LlmProduction() {
  const toc = [
    { label: "From Demo to Production", hash: "gap" },
    { label: "Reference Architecture", hash: "architecture" },
    { label: "Serving an API", hash: "api" },
    { label: "Reliability: Limits, Retries, Fallbacks", hash: "reliability" },
    { label: "Cost Lab", hash: "cost" },
    { label: "Observability", hash: "observability" },
    { label: "Evals & LLM-as-a-Judge", hash: "evals" },
    { label: "Shipping Changes Safely", hash: "rollout" },
    { label: "Launch Checklist", hash: "checklist" },
  ];

  return (
    <GuideLayout
      title="LLM Apps in Production"
      intro="Everything between a working notebook and a service people rely on: a streaming API, containers, retries and fallbacks, cost control with caching and batching, tracing, evals with LLM judges, and safe rollouts."
      toc={toc}
    >
      <Section id="gap" title="From Demo to Production" lead="A demo has to work once. A product has to work for thousands of inputs you never tried, stay within budget, recover from provider outages, and let you prove a change made things better.">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card title="Non-determinism" tone="indigo"><p>The same input can produce different outputs. Tests become evaluations with thresholds, not exact assertions.</p></Card>
          <Card title="Variable cost & latency" tone="amber"><p>Both depend on prompt and output length, which users partly control. Budgets need hard caps.</p></Card>
          <Card title="Silent failure" tone="rose"><p>A wrong answer returns HTTP 200. Quality has to be measured deliberately — nothing will throw.</p></Card>
          <Card title="Dependency risk" tone="purple"><p>Provider rate limits, outages and model deprecations are now part of your uptime.</p></Card>
        </div>
      </Section>

      <Section id="architecture" title="Reference Architecture">
        <div className="flex flex-wrap items-center gap-2 text-xs font-semibold mb-5">
          {["Client (stream)", "API service", "Guardrails", "Retrieval / tools", "LLM gateway", "Model providers"].map((t, i, a) => (
            <React.Fragment key={t}>
              <span className="px-3 py-1.5 rounded-lg border border-white/15 bg-white/5 text-gray-200">{t}</span>
              {i < a.length - 1 && <span className="text-gray-600">→</span>}
            </React.Fragment>
          ))}
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="LLM gateway" tone="indigo"><p>One internal entry point for all model calls: keys, routing, retries, fallbacks, caching, rate limiting and cost attribution in one place (for example LiteLLM or a cloud AI gateway).</p></Card>
          <Card title="Async everything" tone="emerald"><p>LLM calls take seconds. Use async servers, stream tokens to the client, and move long jobs to a queue with status polling or webhooks.</p></Card>
          <Card title="Traces as a first-class store" tone="amber"><p>Every request's prompt, retrieved context, tool calls, output, latency, tokens and cost — searchable, and linked to user feedback.</p></Card>
        </div>
      </Section>

      <Section id="api" title="Serving an API" lead="A minimal streaming endpoint with FastAPI and server-sent events, packaged as a container.">
        <CodeBlock
          language="python"
          code={`# app.py — pip install fastapi uvicorn anthropic
import json
import anthropic
from fastapi import FastAPI
from fastapi.responses import StreamingResponse
from pydantic import BaseModel, Field

app = FastAPI()
client = anthropic.AsyncAnthropic()        # key from ANTHROPIC_API_KEY, never hard-coded

class Ask(BaseModel):
    question: str = Field(max_length=4000)  # bound user-controlled input

@app.post("/ask")
async def ask(body: Ask):
    async def events():
        async with client.messages.stream(
            model="claude-opus-5-5",
            max_tokens=1024,                   # hard cap on cost per request
            system="Answer concisely using the provided context.",
            messages=[{"role": "user", "content": body.question}],
        ) as stream:
            async for text in stream.text_stream:
                yield f"data: {json.dumps(text)}\\n\\n"   # JSON keeps newlines from breaking SSE
        yield "data: [DONE]\\n\\n"
    return StreamingResponse(events(), media_type="text/event-stream")

@app.get("/healthz")
def health():
    return {"ok": True}`}
        />
        <CodeBlock
          language="dockerfile"
          code={`FROM python:3.12-slim
WORKDIR /app
COPY requirements.txt .
RUN pip install --no-cache-dir -r requirements.txt
COPY . .
USER 1000                                   # don't run as root
CMD ["uvicorn", "app:app", "--host", "0.0.0.0", "--port", "8080", "--workers", "2"]`}
        />
        <Note tone="indigo">For internal demos and prototypes, Streamlit and Gradio give you a UI in a few lines — but put the same API behind them so the demo and the product share one code path.</Note>
      </Section>

      <Section id="reliability" title="Reliability: Limits, Retries, Fallbacks">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Retry the right errors" tone="indigo"><p>Retry rate limits (429), overloads and 5xx with exponential backoff plus jitter, honouring any retry-after header. Never retry 400-class validation errors — they will fail again.</p></Card>
          <Card title="Timeouts & budgets" tone="amber"><p>Set a timeout per call and a deadline per request, and cap tokens, tool-call rounds and total spend per user or tenant.</p></Card>
          <Card title="Fallbacks" tone="emerald"><p>A second model or provider for outages, plus a graceful degraded answer ("I can't answer that right now") rather than an error page.</p></Card>
          <Card title="Validate outputs" tone="rose"><p>Use structured outputs or schema validation for anything a program consumes; on failure, retry once with the validation error, then fall back. See <a href="#/genai/decoding" className="text-blue-400 hover:underline">Decoding</a>.</p></Card>
        </div>
      </Section>

      <Section id="cost" title="Cost Lab">
        <CostLab />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <Card title="Route by difficulty" tone="indigo"><p>Send easy requests to a smaller model or lower effort, hard ones to the strongest. Measure cost per <em>completed task</em>, not per call.</p></Card>
          <Card title="Semantic caching — carefully" tone="amber"><p>Returning a stored answer for a "similar" question saves a call but can serve wrong or stale answers; use it only for FAQ-like, non-personal queries with a strict threshold.</p></Card>
          <Card title="Trim context" tone="emerald"><p>Fewer, better retrieved chunks and compressed history cut input tokens and often improve answers. See <a href="#/rag/compression" className="text-blue-400 hover:underline">Contextual Compression</a>.</p></Card>
        </div>
      </Section>

      <Section id="observability" title="Observability">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Trace every step" tone="indigo"><p>A trace per request with spans for retrieval, each model call and each tool call. OpenTelemetry's generative-AI semantic conventions give a vendor-neutral shape; Langfuse, LangSmith, Arize Phoenix and others store and visualise them.</p></Card>
          <Card title="Watch the right metrics" tone="emerald"><p>Latency (time to first token and total), tokens and cost per route and tenant, error and refusal rates, tool-failure rates, and user feedback.</p></Card>
          <Card title="Privacy in logs" tone="rose"><p>Traces contain user data. Redact PII, restrict access, and set retention limits.</p></Card>
        </div>
      </Section>

      <Section id="evals" title="Evals & LLM-as-a-Judge" lead="Every prompt, model or retrieval change should run against an evaluation set before it ships — the LLM equivalent of a test suite.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <Card title="Build the eval set" tone="indigo"><p>Start with 50–200 real inputs covering common cases, edge cases and past failures, each with a reference answer or grading criteria. Add every production bug.</p></Card>
          <Card title="Grade cheaply first" tone="emerald"><p>Exact match, regex, schema validity, code execution and retrieval metrics where possible — they are fast, free and deterministic.</p></Card>
          <Card title="LLM-as-a-judge" tone="purple"><p>For open-ended quality, a model grades against a written rubric, ideally with a short rationale and a small integer scale, or compares two outputs pairwise.</p></Card>
          <Card title="Judge biases" tone="rose"><p>Judges prefer the first option (position bias), longer answers (verbosity bias) and their own family's style (self-preference). Swap orders, control length, and check agreement with human labels on a sample before trusting scores.</p></Card>
        </div>
        <CodeBlock
          language="python"
          code={`# test_quality.py — run in CI on every prompt or model change
import json, pytest
from app_core import answer          # your application function
from judges import grade             # LLM judge with a fixed rubric, returns 1–5

CASES = [json.loads(l) for l in open("evals/golden.jsonl")]

def test_schema_and_citations():
    for c in CASES:
        out = answer(c["question"])
        assert out.citations, f"no citations for {c['id']}"

def test_quality_does_not_regress():
    scores = [grade(c["question"], answer(c["question"]), c["reference"]) for c in CASES]
    mean = sum(scores) / len(scores)
    assert mean >= 4.2, f"mean judge score {mean:.2f} below threshold"`}
        />
        <Note tone="indigo">For retrieval-specific metrics see <a href="#/rag/evaluation" className="text-blue-400 hover:underline">RAG Evaluation</a>; for agent traces, <a href="#/agents/debugging" className="text-blue-400 hover:underline">Debugging Agents</a>.</Note>
      </Section>

      <Section id="rollout" title="Shipping Changes Safely">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Shadow" tone="indigo"><p>Run the new version on real traffic without showing its answers; compare offline.</p></Card>
          <Card title="Canary" tone="amber"><p>Send a small share of traffic to the new version, watch error, cost and feedback metrics, then ramp up — or roll back instantly.</p></Card>
          <Card title="A/B test" tone="emerald"><p>For product decisions, compare user outcomes (resolution rate, retention) between versions with enough traffic to be significant.</p></Card>
        </div>
      </Section>

      <Section id="checklist" title="Launch Checklist">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            ["Keys in a secrets manager", "Never in code, images or client apps; rotate them."],
            ["Hard limits", "max_tokens, tool-call rounds, per-user rate limits and spend caps."],
            ["Retries & fallbacks", "Backoff with jitter on retryable errors; a fallback model and a degraded answer."],
            ["Tracing & dashboards", "Per-request traces; latency, cost, error and feedback dashboards with alerts."],
            ["Eval suite in CI", "Golden set plus regression cases, gating every prompt and model change."],
            ["Guardrails", "Input and output checks appropriate to the risk; see Red Teaming."],
            ["Model version pinning", "Pin model versions; test upgrades against the eval suite before switching."],
            ["Rollback plan", "Feature flags for prompts and models; one switch to revert."],
          ].map(([t, d]) => (
            <div key={t} className="flex gap-3 p-3 rounded-xl border border-white/10 bg-white/[0.03]">
              <span className="text-emerald-400 mt-0.5">✓</span>
              <div>
                <div className="text-sm font-semibold text-white">{t}</div>
                <div className="text-xs text-gray-400 leading-relaxed">{d}</div>
              </div>
            </div>
          ))}
        </div>
      </Section>

      <KnowledgeCheck questions={questionsFor("llm-production")} />
    </GuideLayout>
  );
}

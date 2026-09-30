import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Segmented, Metric, Card, Note, Section, Button } from "../components/VizKit";
import { lintSkill } from "../lib/skillLint";

export const SEARCH_KEYWORDS = [
  "agent skills", "skills", "SKILL.md", "skill frontmatter", "progressive disclosure", "Claude skills",
  "Claude Code skills", "skills API", "custom skills", "pre-built skills", "pptx skill", "xlsx skill",
  "docx skill", "pdf skill", "skill-creator", "allowed-tools", ".claude/skills", "skill description",
  "skill linter", "skills vs MCP", "skills vs system prompt", "skills vs subagents", "container skills",
  "code execution tool", "skill security",
];

/* ---------------------------------------------------------------------------
   The example skill used by the explorer and the linter.
--------------------------------------------------------------------------- */

const SKILL_MD = `---
name: quarterly-report
description: Builds quarterly business reports and QBR decks from revenue data. Use when asked for a quarterly report, a QBR, or a board metrics summary.
---

# Quarterly report

## Workflow
Copy this checklist and tick each step off:
- [ ] Run scripts/fetch_revenue.py --quarter Q3 (never hand-copy numbers)
- [ ] Draft the sections in order: summary, metrics, wins, risks, next quarter
- [ ] Draw charts using references/chart-style.md
- [ ] Run scripts/validate_report.py report.pptx and fix every error it prints
- [ ] Flag any metric that moved more than 20% and give a one-line reason

## Rules
- State the date range and filters used on the first slide.
- Start from assets/template.pptx; do not invent a new layout.
`;

const FILES = {
  "SKILL.md": { kind: "Required", note: "Loaded when the skill is relevant. Frontmatter is always visible to Claude; the body is read on demand.", lang: "markdown", code: SKILL_MD },
  "scripts/fetch_revenue.py": {
    kind: "Script — run it, do not read it",
    note: "Claude runs this in the sandbox. Only its printed output enters the context, not its code.",
    lang: "python",
    code: `"""Fetch revenue for one quarter and print a JSON summary."""
import argparse, json, sys

def main() -> int:
    p = argparse.ArgumentParser()
    p.add_argument("--quarter", required=True, choices=["Q1", "Q2", "Q3", "Q4"])
    args = p.parse_args()
    try:
        rows = load_from_warehouse(args.quarter)   # your data access here
    except ConnectionError as e:
        # Handle the error here so Claude gets a clear message, not a stack trace.
        print(json.dumps({"error": f"warehouse unreachable: {e}"}))
        return 1
    print(json.dumps({"quarter": args.quarter, "revenue": sum(r["amount"] for r in rows)}))
    return 0

if __name__ == "__main__":
    sys.exit(main())`,
  },
  "scripts/validate_report.py": {
    kind: "Script — run it, do not read it",
    note: "A validator gives Claude a fast, exact feedback loop: run, fix, run again.",
    lang: "python",
    code: `"""Check a finished deck. Prints one line per problem; exit code 1 if any."""
import sys
from pptx import Presentation

REQUIRED = ["Summary", "Metrics", "Wins", "Risks", "Next quarter"]

def main(path: str) -> int:
    titles = [s.shapes.title.text for s in Presentation(path).slides if s.shapes.title]
    missing = [t for t in REQUIRED if t not in titles]
    for t in missing:
        print(f"ERROR: missing section slide '{t}'")
    return 1 if missing else 0

if __name__ == "__main__":
    sys.exit(main(sys.argv[1]))`,
  },
  "references/chart-style.md": {
    kind: "Reference — read only when needed",
    note: "Loaded only when Claude is drawing charts. Costs nothing on every other task.",
    lang: "markdown",
    code: `# Chart style

- One message per chart; put it in the title ("Revenue up 12% on Q2").
- Bars for comparing categories, lines for change over time.
- Y-axis starts at zero for bars.
- Company palette: #1F4E79, #2E86AB, #F18F01. Never use red and green together.`,
  },
  "assets/template.pptx": {
    kind: "Asset — used, not read",
    note: "A binary file Claude copies and fills in. It never enters the context as text.",
    lang: "text",
    code: "(binary PowerPoint file)\n\nA 6-slide deck with the company theme and placeholders for\nsummary, metrics, wins, risks and next quarter.",
  },
};

function FileExplorer() {
  const [sel, setSel] = useState("SKILL.md");
  const f = FILES[sel];
  const tree = [
    ["quarterly-report/", null, 0],
    ["SKILL.md", "SKILL.md", 1],
    ["scripts/", null, 1],
    ["fetch_revenue.py", "scripts/fetch_revenue.py", 2],
    ["validate_report.py", "scripts/validate_report.py", 2],
    ["references/", null, 1],
    ["chart-style.md", "references/chart-style.md", 2],
    ["assets/", null, 1],
    ["template.pptx", "assets/template.pptx", 2],
  ];
  return (
    <Panel tone="indigo" title="Open a skill folder">
      <div className="grid grid-cols-1 md:grid-cols-[230px_minmax(0,1fr)] gap-4">
        <div className="rounded-xl bg-black/40 border border-white/10 p-2 font-mono text-sm">
          {tree.map(([label, key, depth]) =>
            key ? (
              <button
                key={label}
                onClick={() => setSel(key)}
                className={`block w-full text-left rounded px-2 py-1 ${sel === key ? "bg-indigo-500/25 text-white" : "text-gray-400 hover:text-gray-200"}`}
                style={{ paddingLeft: 8 + depth * 14 }}
              >
                📄 {label}
              </button>
            ) : (
              <div key={label} className="px-2 py-1 text-gray-500" style={{ paddingLeft: 8 + depth * 14 }}>
                📁 {label}
              </div>
            ),
          )}
        </div>
        <div className="min-w-0">
          <div className="text-xs uppercase tracking-wide text-indigo-300 mb-1">{f.kind}</div>
          <p className="text-sm text-gray-400 mb-3 leading-relaxed">{f.note}</p>
          <CodeBlock language={f.lang} code={f.code} maxHeight="320px" />
        </div>
      </div>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   "Which do I need?" chooser.
--------------------------------------------------------------------------- */

const QUESTIONS = [
  { q: "What is the agent missing?", options: [
    { label: "Know-how: how we do this job", r: "Skill", why: "A repeatable procedure, with the scripts and templates that go with it." },
    { label: "Access to a live system or data", r: "MCP server", why: "MCP connects the agent to systems: databases, tickets, chat. Tools it exposes are called through the protocol." },
    { label: "One new action it can call", r: "Tool", why: "A single function with a JSON schema that your own code runs." },
    { label: "A rule that applies to every request", r: "System prompt", why: "Short, always-on guidance such as tone and hard limits." },
    { label: "A clean context for a big side task", r: "Subagent", why: "A separate agent that does the work in its own window and returns a summary." },
  ] },
];

function Chooser() {
  const [i, setI] = useState(null);
  const opts = QUESTIONS[0].options;
  return (
    <Panel tone="emerald" title="Which do I need?">
      <p className="text-sm text-gray-400 mb-3">{QUESTIONS[0].q}</p>
      <div className="flex flex-col gap-2 mb-4">
        {opts.map((o, j) => (
          <button
            key={o.label}
            onClick={() => setI(j)}
            className={`text-left rounded-lg border px-3 py-2 text-sm ${i === j ? "border-emerald-400/60 bg-emerald-500/15 text-white" : "border-white/10 bg-black/30 text-gray-300 hover:bg-white/5"}`}
          >
            {o.label}
          </button>
        ))}
      </div>
      {i !== null && (
        <div className="rounded-xl border border-emerald-500/30 bg-emerald-500/10 p-4">
          <div className="text-lg font-bold text-emerald-300">{opts[i].r}</div>
          <p className="text-sm text-gray-300 leading-relaxed m-0 mt-1">{opts[i].why}</p>
        </div>
      )}
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Linter lab.
--------------------------------------------------------------------------- */

const BAD_SKILL = `---
name: Claude Report Helper
description: I can help you with reports.
---

# Reports
Use the API as of 2025.
See references/advanced/forms/details.md for details.
`;

const ICON = { pass: "✅", warn: "⚠️", fail: "❌" };
const COLOR = { pass: "text-emerald-300", warn: "text-amber-300", fail: "text-rose-300" };

function LinterLab() {
  const [text, setText] = useState(SKILL_MD);
  const results = useMemo(() => lintSkill(text), [text]);
  const count = (s) => results.filter((r) => r.status === s).length;
  return (
    <Panel
      tone="amber"
      title="SKILL.md linter"
      actions={
        <>
          <Button tone="amber" onClick={() => setText(SKILL_MD)}>Good skill</Button>
          <Button tone="amber" onClick={() => setText(BAD_SKILL)}>Broken skill</Button>
        </>
      }
    >
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        <textarea
          value={text}
          onChange={(e) => setText(e.target.value)}
          spellCheck={false}
          aria-label="SKILL.md text"
          className="w-full h-72 lg:h-96 bg-black/50 border border-white/15 rounded-xl p-3 font-mono text-xs text-gray-100 leading-relaxed"
        />
        <div>
          <div className="grid grid-cols-3 gap-2 mb-3">
            <Metric label="Pass" value={count("pass")} tone="emerald" />
            <Metric label="Warn" value={count("warn")} tone="amber" />
            <Metric label="Fail" value={count("fail")} tone="rose" />
          </div>
          <ul className="space-y-1.5 list-none p-0 m-0">
            {results.map((r, i) => (
              <li key={i} className="rounded-lg bg-black/40 border border-white/10 px-3 py-2 text-xs leading-relaxed">
                <span className="mr-1">{ICON[r.status]}</span>
                <span className={`font-semibold ${COLOR[r.status]}`}>{r.rule}</span>
                <span className="text-gray-400"> — {r.msg}</span>
              </li>
            ))}
          </ul>
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        Edit the text. The checks follow the rules in the section above; a fail means the skill will not upload, a
        warning means it will load but is likely to trigger badly or waste context. This is a teaching linter, not
        the official validator.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Progressive disclosure at scale. Numbers are illustrative.
--------------------------------------------------------------------------- */

function ScaleLab() {
  const [n, setN] = useState(30);
  const [used, setUsed] = useState(2);
  const META = 100; // tokens per skill, always loaded
  const BODY = 2500; // average SKILL.md body
  const always = n * META;
  const onDemand = always + Math.min(used, n) * BODY;
  const upfront = n * (META + BODY);
  return (
    <Panel tone="purple" title="What do 100 installed skills cost?">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-4">
        <Slider tone="purple" label="Skills installed" value={n} min={1} max={100} onChange={setN} />
        <Slider tone="purple" label="Skills actually used in this task" value={used} min={0} max={10} onChange={setUsed} />
      </div>
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mb-4">
        <Metric label="Always loaded (metadata only)" value={always.toLocaleString()} tone="purple" sub="≈ 100 tokens per skill" />
        <Metric label="With progressive disclosure" value={onDemand.toLocaleString()} tone="emerald" sub="metadata + bodies of skills used" />
        <Metric label="If every body loaded up front" value={upfront.toLocaleString()} tone="rose" sub="≈ 2,500 tokens per body" />
      </div>
      <div className="h-4 rounded bg-white/5 overflow-hidden relative mb-2">
        <div className="absolute inset-y-0 left-0 bg-rose-500/50" style={{ width: "100%" }} />
        <div className="absolute inset-y-0 left-0 bg-emerald-400/80" style={{ width: `${(onDemand / upfront) * 100}%`, transition: "width 200ms" }} />
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-3 mb-0">
        Illustrative numbers: real skills vary widely. The point is the shape: cost grows with the metadata you install, not
        the instructions you own. For a step-by-step view of one skill loading, see the{" "}
        <a href="#/agents/sdks#skills" className="text-blue-400 hover:underline">progressive-disclosure stepper</a> on the Agent SDKs page.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Description workshop. Verdicts are hand-written and illustrative.
--------------------------------------------------------------------------- */

const VAGUE = "Helps with reports.";
const GOOD = "Builds quarterly business reports and QBR decks from revenue data. Use when asked for a quarterly report, a QBR, a board metrics summary, or revenue-by-region slides.";
const REQUESTS = [
  { r: "Make me a QBR deck for Q3.", vague: ["missed", "“Reports” is close but says nothing about decks, quarters or QBRs."], good: ["triggers", "Names QBR and decks directly."] },
  { r: "Summarise board metrics for the next meeting.", vague: ["missed", "No mention of boards or metrics."], good: ["triggers", "“board metrics summary” matches almost word for word."] },
  { r: "Build revenue-by-region slides.", vague: ["missed", "Nothing here points at slides or revenue."], good: ["triggers", "“revenue-by-region slides” is listed."] },
  { r: "Write a bug report for the login crash.", vague: ["triggers", "False positive: “reports” matches, but this is a different job."], good: ["missed", "Correctly ignored: not a business report."] },
  { r: "Give me last quarter's revenue numbers.", vague: ["missed", "Too vague to connect to revenue."], good: ["triggers", "Revenue data for a quarter is in scope."] },
  { r: "Translate this contract into French.", vague: ["missed", "Unrelated, correctly ignored."], good: ["missed", "Unrelated, correctly ignored."] },
];

function Workshop() {
  const [which, setWhich] = useState("vague");
  const desc = which === "vague" ? VAGUE : GOOD;
  const hits = REQUESTS.filter((q) => q[which][0] === "triggers").length;
  return (
    <Panel tone="rose" title="Description workshop">
      <div className="mb-3">
        <Segmented tone="rose" value={which} onChange={setWhich} options={[{ v: "vague", label: "Vague description" }, { v: "good", label: "Good description" }]} />
      </div>
      <div className="rounded-xl bg-black/40 border border-white/10 p-3 font-mono text-xs text-gray-200 mb-4">description: {desc}</div>
      <div className="space-y-2 mb-3">
        {REQUESTS.map((q) => {
          const [v, why] = q[which];
          return (
            <div key={q.r} className="grid grid-cols-1 sm:grid-cols-[minmax(0,1fr)_110px] gap-1 sm:gap-3 rounded-lg border border-white/10 bg-black/30 px-3 py-2">
              <div>
                <div className="text-sm text-gray-100">“{q.r}”</div>
                <div className="text-xs text-gray-500">{why}</div>
              </div>
              <div className={`text-xs font-semibold self-center ${v === "triggers" ? "text-emerald-300" : "text-rose-300"}`}>
                {v === "triggers" ? "likely triggers" : "likely missed"}
              </div>
            </div>
          );
        })}
      </div>
      <Metric label="Requests that reach the skill" value={`${hits} of ${REQUESTS.length}`} tone="rose" sub="hand-written verdicts, illustrative" />
      <p className="text-xs text-gray-500 leading-relaxed mt-3 mb-0">
        Verdicts are our judgement of how a model would read each description, not measured results. Test your own
        descriptions with real prompts, because matching is done by the model and can surprise you. Note the fourth request:
        a vague description can also trigger when it should not.
      </p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Where skills run.
--------------------------------------------------------------------------- */

const RUN = {
  apps: {
    label: "Claude apps",
    lang: "text",
    note: "Upload a skill as a zip in Settings, then switch it on. On team and enterprise plans an organisation admin can provision skills for everyone. Menu names change, so check the current Help Center article.",
    code: `quarterly-report.zip
└── quarterly-report/
    ├── SKILL.md
    └── scripts/ ...

Settings → Capabilities → Skills → Upload skill`,
  },
  code: {
    label: "Claude Code",
    lang: "bash",
    note: "Claude Code reads skills from folders on disk. Commit project skills to git so the whole team gets them, or bundle skills into a plugin.",
    code: `# Project skill (shared through git)
.claude/skills/quarterly-report/SKILL.md

# Personal skill (all your projects)
~/.claude/skills/quarterly-report/SKILL.md

# Invoke one by name inside a session
/quarterly-report Q3

# In SKILL.md frontmatter you can limit what a skill may use:
# allowed-tools: Read, Grep, Bash(python scripts/*)`,
  },
  api: {
    label: "Claude API",
    lang: "python",
    note: "Skills run inside the code execution tool's container. Pre-built skills are pptx, xlsx, docx and pdf; custom skills are uploaded through the /v1/skills endpoints. Generated files come back as file IDs you download with the Files API. Not available on Amazon Bedrock or Google Vertex AI.",
    code: `import anthropic

client = anthropic.Anthropic()

response = client.beta.messages.create(
    model="claude-opus-5-5",
    max_tokens=4096,
    betas=["code-execution-2025-08-25"],
    container={
        "skills": [
            {"type": "anthropic", "skill_id": "pptx", "version": "latest"},
            # Your own uploaded skill:
            # {"type": "custom", "skill_id": "skill_...", "version": "latest"},
        ]
    },
    tools=[{"type": "code_execution_20260521", "name": "code_execution"}],
    messages=[{"role": "user", "content": "Create a 3-slide deck on Q3 revenue."}],
)

# File outputs appear as file IDs in the response content.
# Download them through the Files API (client.beta.files).`,
  },
  sdk: {
    label: "Agent SDK & Managed Agents",
    lang: "text",
    note: "The Claude Agent SDK is Claude Code as a library, so it loads skills from the same .claude/skills folders once you enable them in its options. Managed Agents attach skills to the agent definition. Details differ by version; treat this as the shape, and check the current docs.",
    code: `# Agent SDK: skills come from the filesystem
project/
└── .claude/skills/quarterly-report/SKILL.md
   (enable filesystem skill loading and allow the Skill tool in the SDK options)

# Managed Agents: attach skills to the agent
agent.skills = [ pre-built or custom skill ids ]`,
  },
};

function WhereRuns() {
  const [k, setK] = useState("code");
  const r = RUN[k];
  return (
    <Panel tone="blue" title="Where a skill runs">
      <div className="mb-4">
        <Segmented tone="blue" value={k} onChange={setK} options={Object.entries(RUN).map(([v, x]) => ({ v, label: x.label }))} />
      </div>
      <p className="text-sm text-gray-300 leading-relaxed mb-3">{r.note}</p>
      <CodeBlock language={r.lang} code={r.code} maxHeight="340px" />
    </Panel>
  );
}

const COMPARE = [
  ["System prompt", "Standing instructions", "Every request", "Short rules that always apply: tone, limits, persona"],
  ["Tool", "One action your code runs", "Definition on every request", "A single, well-defined operation with a JSON schema"],
  ["MCP server", "A set of tools, resources and prompts from another system", "Definitions on every request (unless deferred)", "Reaching live systems and data"],
  ["Skill", "A procedure plus scripts, templates and references", "Name and description always; the rest on demand", "Repeatable know-how: how we do this job"],
  ["Subagent", "A separate agent with its own context", "When the parent delegates", "Big side tasks that would flood the main context"],
];

const GALLERY = [
  ["contract-review", "Reviews contracts against the company clause playbook and flags deviations. Use when asked to review, redline or summarise a contract or NDA."],
  ["incident-postmortem", "Writes blameless incident postmortems from a timeline and chat logs. Use when asked for a postmortem, RCA or incident write-up."],
  ["sql-reporting", "Builds warehouse queries for revenue, churn and cohort metrics using the approved schema. Use when asked for figures that live in the data warehouse."],
  ["brand-voice", "Rewrites copy to match the company voice guide and word list. Use when drafting or editing customer-facing text."],
  ["data-cleaning", "Profiles a CSV, fixes types, duplicates and missing values, and reports every change. Use when given a messy dataset to clean or prepare."],
  ["release-notes", "Turns merged pull requests into release notes grouped by feature, fix and breaking change. Use when asked to draft release notes or a changelog."],
];

export default function AgentsSkills() {
  const toc = [
    { label: "What a Skill Is", hash: "what" },
    { label: "Skills vs Everything Else", hash: "compare" },
    { label: "Anatomy of a Skill", hash: "anatomy" },
    { label: "The SKILL.md Format", hash: "format" },
    { label: "Lab: SKILL.md Linter", hash: "linter" },
    { label: "Progressive Disclosure", hash: "disclosure" },
    { label: "How a Skill Runs", hash: "runs" },
    { label: "Where Skills Run", hash: "where" },
    { label: "Writing Good Skills", hash: "writing" },
    { label: "Lab: Description Workshop", hash: "workshop" },
    { label: "Testing and Iterating", hash: "testing" },
    { label: "Security", hash: "security" },
    { label: "Example Gallery", hash: "gallery" },
  ];

  return (
    <GuideLayout
      title="Agent Skills"
      intro="A skill is a folder of know-how an agent can pick up when it needs it: instructions, scripts and reference files, packaged the way an onboarding guide is for a new hire."
      toc={toc}
    >
      <Section id="what" title="What a Skill Is" lead="A skill is a folder with a SKILL.md file: YAML frontmatter (a name and a description) followed by instructions, plus optional scripts/, references/ and assets/ folders.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <Card title="What it is" tone="indigo"><p>Packaged procedure: the steps, checks, code and templates for one kind of job. Claude reads it when a task matches, and follows it.</p></Card>
          <Card title="Why it matters" tone="emerald"><p>The same know-how works everywhere, is written once, is versioned like code, and costs almost nothing until it is needed.</p></Card>
          <Card title="A common mistake" tone="rose"><p>Treating a skill as a long prompt. If it is one page of general advice, Claude already knew it. Skills earn their place with things Claude does not know: your data, your templates, your rules.</p></Card>
        </div>
        <Note tone="indigo">
          Skills are portable across Claude apps, Claude Code, the Claude API and the Agent SDK. Anthropic published the
          format as an open standard, and other agent tools have started to adopt it. Adoption is moving quickly, so
          check each tool's docs rather than assuming a skill will run unchanged.
        </Note>
      </Section>

      <Section id="compare" title="Skills vs System Prompt vs Tools vs MCP vs Subagents" lead="They solve different problems and combine well. The table shows what each gives an agent and when it costs context.">
        <div className="overflow-x-auto rounded-xl border border-white/10 mb-6">
          <table className="w-full text-sm text-left min-w-[640px]">
            <thead className="bg-white/5 text-gray-300">
              <tr>
                <th className="p-3">Mechanism</th>
                <th className="p-3">Gives the agent</th>
                <th className="p-3">When it loads</th>
                <th className="p-3">Best for</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-gray-400">
              {COMPARE.map(([a, b, c, d]) => (
                <tr key={a}>
                  <td className="p-3 text-white font-semibold">{a}</td>
                  <td className="p-3">{b}</td>
                  <td className="p-3">{c}</td>
                  <td className="p-3">{d}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <Chooser />
        <p className="text-xs text-gray-500 mt-3">
          Related: <a href="#/mcp" className="text-blue-400 hover:underline">MCP</a>,{" "}
          <a href="#/agents/tool-calling" className="text-blue-400 hover:underline">tool calling</a> and{" "}
          <a href="#/agents/multi-agent" className="text-blue-400 hover:underline">subagents</a>.
        </p>
      </Section>

      <Section id="anatomy" title="Anatomy of a Skill" lead="Open each file of a real-shaped skill. Notice which files Claude reads, which it runs, and which it only uses.">
        <FileExplorer />
      </Section>

      <Section id="format" title="The SKILL.md Format">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <Card title="name (required)" tone="indigo">
            <p>At most 64 characters. Lowercase letters, digits and hyphens only. No XML tags. It must not contain the reserved words “anthropic” or “claude”.</p>
          </Card>
          <Card title="description (required)" tone="emerald">
            <p>Not empty, at most 1,024 characters, no XML tags. Say <strong className="text-white">what</strong> the skill does and <strong className="text-white">when</strong> to use it, in the third person. This is the only text Claude sees when deciding whether to use it.</p>
          </Card>
          <Card title="Optional fields" tone="purple">
            <p><span className="font-mono">license</span>, <span className="font-mono">allowed-tools</span> (Claude Code: limit which tools the skill may use) and <span className="font-mono">metadata</span> for your own tags.</p>
          </Card>
          <Card title="The body" tone="amber">
            <p>Keep it under about 500 lines. Put detail in reference files, one level deep, and link each directly from SKILL.md. A common mistake is a reference that points to another reference; Claude may read only part of it.</p>
          </Card>
        </div>
        <CodeBlock language="markdown" code={SKILL_MD.split("\n").slice(0, 4).join("\n") + "\n---\n"} />
      </Section>

      <Section id="linter" title="Lab: SKILL.md Linter" lead="Paste or edit a SKILL.md and see the checks run as you type.">
        <LinterLab />
      </Section>

      <Section id="disclosure" title="Progressive Disclosure" lead="Skills load in three levels, so an agent can carry a large library without paying for it on every request.">
        <ol className="grid grid-cols-1 md:grid-cols-3 gap-3 list-none p-0 mb-6">
          {[
            ["Level 1 · Metadata", "Always loaded. The name and description of every skill: about 100 tokens each."],
            ["Level 2 · Instructions", "Loaded when a request matches. The SKILL.md body."],
            ["Level 3 · Resources", "Read or run only when needed. A script's code never enters the context; only its output does."],
          ].map(([t, d], i) => (
            <li key={t} className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="text-xs font-mono text-purple-300 mb-1">level {i + 1}</div>
              <div className="text-sm font-semibold text-white">{t}</div>
              <p className="text-xs text-gray-400 leading-relaxed mt-1 mb-0">{d}</p>
            </li>
          ))}
        </ol>
        <ScaleLab />
      </Section>

      <Section id="runs" title="How a Skill Runs, Step by Step">
        <ol className="space-y-3 list-none p-0 mb-5">
          {[
            ["Discovery", "At startup the agent loads each skill's name and description into its system prompt."],
            ["Description match", "A request arrives. The model compares it with the descriptions and decides a skill applies."],
            ["Read SKILL.md", "The model reads the file using its file or bash tool. Nothing is injected for it."],
            ["Follow the instructions", "It works through the checklist, reading reference files only when a step points to them."],
            ["Run scripts", "It runs scripts in the sandbox and receives only their output."],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-3">
              <span className="w-7 h-7 shrink-0 rounded-full bg-indigo-500/20 border border-indigo-500/40 text-indigo-300 flex items-center justify-center text-xs font-bold">{i + 1}</span>
              <div>
                <div className="text-sm font-semibold text-white">{t}</div>
                <div className="text-sm text-gray-400 leading-relaxed">{d}</div>
              </div>
            </li>
          ))}
        </ol>
        <Note tone="indigo">
          This is why skills need an environment with a filesystem and code execution: the agent reads files and runs
          scripts, rather than having them pasted into the prompt.
        </Note>
      </Section>

      <Section id="where" title="Where Skills Run" lead="The same skill folder works in several places. Pick a tab.">
        <WhereRuns />
      </Section>

      <Section id="writing" title="Writing Good Skills">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Be concise" tone="indigo"><p>Claude is already capable. Add only what it does not know: your names, rules and formats. Every extra sentence costs context on every use.</p></Card>
          <Card title="Set the degree of freedom" tone="emerald"><p>Use prose for judgement calls. Use an exact script for fragile steps such as file formats, where one wrong character breaks everything.</p></Card>
          <Card title="Write workflows as checklists" tone="amber"><p>Numbered steps Claude can tick off, with validate → fix → repeat loops, such as “run validate_report.py, fix the errors, run it again”.</p></Card>
          <Card title="Show examples" tone="purple"><p>One input and output pair teaches a format better than a paragraph. Use the same term for the same thing throughout.</p></Card>
          <Card title="Avoid time-sensitive content" tone="rose"><p>“As of 2025 use the new API” goes stale. Describe the current method, and keep old methods under a clearly marked legacy heading.</p></Card>
          <Card title="Own your errors" tone="blue"><p>Scripts should catch failures and print a clear message, instead of leaving Claude to decode a stack trace. Say clearly whether to <em>run</em> a script or <em>read</em> it.</p></Card>
        </div>
      </Section>

      <Section id="workshop" title="Lab: Description Workshop" lead="The description decides whether your skill is ever used. Compare a vague one with a good one across six requests.">
        <Workshop />
      </Section>

      <Section id="testing" title="Testing and Iterating">
        <ol className="space-y-2 text-sm text-gray-300 list-decimal pl-5 max-w-3xl">
          <li>Write three evaluation scenarios first: real tasks the skill should handle. Record how Claude does <em>without</em> the skill, as your baseline.</li>
          <li>Write the minimal skill that fixes the gaps you saw. Resist adding more.</li>
          <li>Run the scenarios again and watch how Claude navigates the files: which it opens, which it skips, where it gets lost.</li>
          <li>Test with every model you will use. A skill that works with a large model may need more detail for a smaller one.</li>
          <li>Anthropic's <span className="font-mono">skill-creator</span> skill can help draft and improve a skill.</li>
        </ol>
        <p className="text-xs text-gray-500 mt-3">See <a href="#/rag/evaluation" className="text-blue-400 hover:underline">RAG evaluation</a> for how to turn scenarios into a repeatable test set.</p>
      </Section>

      <Section id="security" title="Security" lead="A skill can contain code that runs in the agent's environment, and instructions the model will follow. Treat it like installing software.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Install from trusted sources" tone="rose"><p>Only use skills you wrote or have reviewed. An untrusted skill can direct the model to misuse its tools or leak data.</p></Card>
          <Card title="Audit everything in the folder" tone="amber"><p>Read the scripts and reference files, not just SKILL.md. Watch for skills that fetch external URLs: what they fetch can change after you reviewed them.</p></Card>
          <Card title="Repository skills are a trust boundary" tone="indigo"><p>A skill committed to a repo runs for everyone who opens it. Review changes to <span className="font-mono">.claude/skills</span> like code.</p></Card>
          <Card title="Limit what a skill may use" tone="emerald"><p>In Claude Code, <span className="font-mono">allowed-tools</span> restricts a skill to the tools it needs, for example read-only search.</p></Card>
        </div>
      </Section>

      <Section id="gallery" title="Example Gallery" lead="Six skill ideas, each with a description that says what and when.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {GALLERY.map(([n, d]) => (
            <div key={n} className="p-4 rounded-xl border border-white/10 bg-white/5">
              <div className="font-mono text-sm text-indigo-300 mb-1">{n}</div>
              <p className="text-xs text-gray-400 leading-relaxed m-0">{d}</p>
            </div>
          ))}
        </div>
      </Section>

      <KnowledgeCheck questions={questionsFor("agents-skills")} />
    </GuideLayout>
  );
}

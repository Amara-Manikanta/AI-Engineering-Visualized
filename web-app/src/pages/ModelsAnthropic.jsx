import React, { useState } from 'react';
import { motion } from 'framer-motion';
import GuideLayout from '../components/GuideLayout';
import { ModelLineup, ModelWeights, ModelAccess, ModelPipeline } from '../components/ModelProfile';
import CodeBlock from '../components/CodeBlock';

export const SEARCH_KEYWORDS = [
  "Anthropic", "Claude", "Claude Code", "CLAUDE.md", "plan mode", "checkpoints", "rewind", "skills", "SKILL.md",
  "hooks", "PreToolUse", "PostToolUse", "subagents", "slash commands", "compaction", "/compact", "permissions",
  "settings.json", "MCP servers", "plugins", "Claude Agent SDK", "Messages API", "prompt caching", "batch API",
  "adaptive thinking", "Constitutional AI", "RLAIF", "Opus", "Sonnet", "Haiku",
];
const fadeUp = {
  hidden: { opacity: 0, y: 20 },
  show: { opacity: 1, y: 0, transition: { type: 'spring', stiffness: 100 } },
};
const stagger = { hidden: { opacity: 0 }, show: { opacity: 1, transition: { staggerChildren: 0.08 } } };

const PRODUCTS = [
  { i: '💬', t: 'Claude apps', d: 'Claude on the web, desktop and mobile — chat, file analysis, projects with shared knowledge, and artifacts.', who: 'Everyday use and knowledge work.' },
  { i: '🧩', t: 'Claude API', d: 'The Messages API behind everything else: models, tool use, prompt caching, batches, files and server-side tools.', who: 'Developers building products on Claude.' },
  { i: '⌨️', t: 'Claude Code', d: 'An agentic coding tool that works in your repository — terminal, IDE, desktop and web.', who: 'Software engineers. Detailed below.' },
  { i: '🛠️', t: 'Claude Agent SDK', d: 'The harness that powers Claude Code, packaged as a Python and TypeScript library for building your own agents.', who: 'Teams building custom agents.' },
  { i: '🔌', t: 'Model Context Protocol', d: 'An open standard for connecting models to tools and data. Created by Anthropic, now supported across the industry.', who: 'Anyone integrating tools with AI apps.' },
  { i: '☁️', t: 'Cloud platforms', d: 'Claude is also offered through Amazon Bedrock, Google Vertex AI and Microsoft Foundry, billed through your cloud account.', who: 'Enterprises standardised on one cloud.' },
];

const PLATFORM = [
  { t: 'Tool use', d: 'You describe functions with a JSON schema; Claude replies with a tool_use block naming the tool and its arguments; your code runs it and sends back a tool_result. The basis of every agent.' },
  { t: 'Extended / adaptive thinking', d: 'Claude reasons step by step before answering. With adaptive thinking the model decides how much to think per request; an effort setting trades depth for speed and cost.' },
  { t: 'Prompt caching', d: 'Mark a stable prefix (system prompt, documents, tool definitions) as cacheable. Later requests that reuse it are cheaper and faster — often the biggest single cost saving.' },
  { t: 'Message Batches', d: 'Submit many requests at once and collect results asynchronously, at half the normal price. Suited to evaluations, classification backfills and nightly jobs.' },
  { t: 'Structured outputs', d: 'Constrain the response to a JSON schema so downstream code can parse it without guesswork.' },
  { t: 'Server tools', d: 'Tools Anthropic runs for you — web search, web fetch and code execution — so the model can look things up or compute without your own infrastructure.' },
  { t: 'Files & citations', d: 'Upload PDFs and other documents once and reference them by ID; ask for citations so answers point to the exact passages they came from.' },
  { t: 'Streaming', d: 'Receive the response token by token over server-sent events. Essential for chat UIs and for long outputs that would otherwise hit request timeouts.' },
];

const FEATURES = [
  {
    id: 'claude-md', icon: '📄', title: 'CLAUDE.md', group: 'Context',
    what: 'A Markdown file Claude Code reads at the start of every session — the project\'s standing instructions. Put the things you would otherwise repeat: how to build and test, code style, architecture notes, and what not to touch.',
    how: 'Run /init to generate a first draft from your codebase, then edit it. A CLAUDE.md in the repository root is shared with your team through git; ~/.claude/CLAUDE.md holds personal preferences for every project. Subdirectories can have their own, loaded when Claude works there.',
    code: `# Project notes for Claude

## Commands
- Build: npm run build
- Test one file: npx vitest run path/to/file.test.ts
- Lint before committing: npm run lint

## Conventions
- TypeScript strict mode; no \`any\`.
- API handlers live in src/routes/, one file per resource.
- Never edit files in src/generated/ — run npm run codegen instead.`,
    lang: 'markdown',
    trap: 'It is loaded into every request, so every line costs tokens and attention. Keep it short and specific; move long, occasional procedures into skills.',
  },
  {
    id: 'permissions', icon: '🔒', title: 'Permissions', group: 'Control',
    what: 'Rules deciding which tools Claude may use without asking. By default it asks before editing files or running shell commands; you can pre-approve safe actions and block dangerous ones outright.',
    how: 'Use /permissions, or edit settings.json (.claude/settings.json for the team, .claude/settings.local.json for you, ~/.claude/settings.json globally). Shift+Tab cycles modes: normal (ask), auto-accept edits, and plan mode.',
    code: `{
  "permissions": {
    "allow": ["Bash(npm run test:*)", "Bash(git diff:*)"],
    "deny":  ["Read(./.env)", "Read(./secrets/**)", "Bash(curl:*)"]
  }
}`,
    lang: 'json',
    trap: 'Approving everything to go faster removes your main safety net. Allow narrow, read-only or reversible commands; keep deploys, deletes and network calls behind a prompt.',
  },
  {
    id: 'plan', icon: '📝', title: 'Plan mode', group: 'Control',
    what: 'A read-only mode: Claude explores the code, asks questions and writes a plan, but changes nothing until you approve it.',
    how: 'Press Shift+Tab until the mode shows "plan", then describe the task. Review the plan, ask for changes, and approve it to let Claude start editing.',
    code: `> (plan mode) Add per-user rate limiting to the public API.

Claude reads src/routes/, src/middleware/ and the tests, then proposes:
  1. Add a token-bucket limiter in src/middleware/rateLimit.ts
  2. Store buckets in the existing Redis client
  3. Apply it to routes in src/routes/public/*
  4. Add tests for the 429 response and the Retry-After header
Approve?`,
    lang: 'text',
    trap: 'Skipping it on large changes. Five minutes reviewing a plan is cheaper than untangling a confident edit across twenty files.',
  },
  {
    id: 'checkpoints', icon: '⏪', title: 'Checkpoints', group: 'Control',
    what: 'Claude Code snapshots files before it edits them, so you can rewind the code, the conversation, or both to an earlier point.',
    how: 'Press Esc twice, or run /rewind, and choose the point to go back to.',
    code: `> /rewind
  ○ 3 min ago  "Refactor the auth middleware"
  ● 1 min ago  "Also rename the session helpers"   ← restore code to here`,
    lang: 'text',
    trap: 'Checkpoints track Claude\'s file edits, not side effects of shell commands (a database migration, a deleted directory, a pushed commit) or edits made outside the session. Keep using git.',
  },
  {
    id: 'skills', icon: '🎓', title: 'Skills', group: 'Context',
    what: 'Folders of instructions, scripts and reference files that teach Claude a specific procedure — your release checklist, how to write a migration, the house style for reports.',
    how: 'Create .claude/skills/<name>/SKILL.md (project) or ~/.claude/skills/<name>/SKILL.md (personal). Only the name and description are loaded up front; Claude reads the full skill when a task matches, or you invoke it by name with /<name>.',
    code: `---
name: db-migration
description: Use when creating or changing database tables. Covers naming, reversibility and the review checklist.
---

1. Generate the file with: npm run migrate:new <name>
2. Every migration must have a working down() step.
3. Never drop a column in the same release that stops using it.
4. Run npm run migrate:test before finishing.`,
    lang: 'markdown',
    trap: 'A vague description means the skill is never picked up. Say when to use it, in the words a task would actually contain.',
  },
  {
    id: 'hooks', icon: '⚡', title: 'Hooks', group: 'Automation',
    what: 'Shell commands that run automatically at points in the loop — before or after a tool call, when you submit a prompt, when Claude stops. Unlike instructions, hooks always run: they are deterministic.',
    how: 'Configure them in settings.json or with /hooks. Each hook matches an event (PreToolUse, PostToolUse, UserPromptSubmit, Stop, SessionStart, …) and optionally a tool name, and receives the event details as JSON on stdin. A PreToolUse hook can block the call.',
    code: `{
  "hooks": {
    "PostToolUse": [
      {
        "matcher": "Edit|Write",
        "hooks": [
          { "type": "command",
            "command": "jq -r '.tool_input.file_path' | xargs npx prettier --write" }
        ]
      }
    ]
  }
}`,
    lang: 'json',
    trap: 'Hooks run with your user\'s permissions and no confirmation. Review hook scripts from others as carefully as any code you execute.',
  },
  {
    id: 'mcp', icon: '🔌', title: 'MCP servers', group: 'Reach',
    what: 'Connections to external systems — issue trackers, databases, design tools, internal APIs — through the Model Context Protocol. Each server adds tools Claude can call.',
    how: 'Add a server with claude mcp add. Project-scoped servers are stored in .mcp.json so the whole team gets them. /mcp shows status and handles sign-in for remote servers.',
    code: `# a local server started as a subprocess
claude mcp add postgres -- npx -y @modelcontextprotocol/server-postgres "$DATABASE_URL"

# a remote server over HTTP, shared with the team via .mcp.json
claude mcp add --transport http --scope project issues https://mcp.example.com/mcp`,
    lang: 'bash',
    trap: 'Every connected server\'s tool definitions take up context, and a server that reads untrusted content can carry prompt injection. Connect what you need, from sources you trust.',
  },
  {
    id: 'plugins', icon: '🧩', title: 'Plugins', group: 'Reach',
    what: 'Installable bundles that package skills, slash commands, subagents, hooks and MCP servers together, so a whole workflow can be shared in one step.',
    how: 'Run /plugin to browse marketplaces and install. A team can publish its own marketplace from a git repository.',
    code: `> /plugin marketplace add my-org/claude-plugins
> /plugin install release-tools@my-org`,
    lang: 'text',
    trap: 'A plugin can include hooks and MCP servers, which execute code. Install from sources you would trust with your shell.',
  },
  {
    id: 'context', icon: '🧠', title: 'Managing context', group: 'Context',
    what: 'Everything Claude knows in a session lives in its context window: instructions, the files it read, tool output, and the conversation. Quality drops when it fills with irrelevant material.',
    how: 'Point Claude at files with @path/to/file, paste screenshots or error output, check usage with /context, and use /clear when switching to an unrelated task.',
    code: `> Fix the failing test in @src/billing/invoice.test.ts —
  the expected total ignores the discount. Don't change the fixture.

> /context          # what is using the window right now
> /clear            # fresh start for the next, unrelated task`,
    lang: 'text',
    trap: 'One long session for a whole day of unrelated tasks. Old details compete with the current task; start fresh instead.',
  },
  {
    id: 'commands', icon: '⌨️', title: 'Slash commands', group: 'Automation',
    what: 'Shortcuts typed at the prompt. Built-in ones control the session; custom ones turn prompts you reuse into a single command.',
    how: 'Built-ins include /init, /clear, /compact, /model, /permissions, /mcp, /agents, /hooks and /rewind. Custom commands are Markdown files, and $ARGUMENTS is replaced with whatever you type after the command. They share the skills mechanism, so a skill can be invoked the same way.',
    code: `<!-- .claude/commands/fix-issue.md -->
Read GitHub issue #$ARGUMENTS, find the relevant code,
write a failing test that reproduces it, then fix it.
Run the full test suite before you finish.

> /fix-issue 482`,
    lang: 'markdown',
    trap: 'Writing commands that are really long procedures with reference material — those are better as skills, which load only when needed.',
  },
  {
    id: 'compaction', icon: '🗜️', title: 'Compaction', group: 'Context',
    what: 'Summarising the conversation so far into a shorter form, freeing context space while keeping decisions and progress.',
    how: 'Claude Code compacts automatically as the window nears its limit. Run /compact yourself at a natural break, optionally telling it what to keep.',
    code: `> /compact keep the list of failing tests and the decision to use Redis`,
    lang: 'text',
    trap: 'Summaries lose detail. If exact values matter — an error message, a config value — write them to a file or CLAUDE.md rather than trusting the summary.',
  },
  {
    id: 'subagents', icon: '🤖', title: 'Subagents', group: 'Automation',
    what: 'Specialised helpers with their own context window, instructions, tool access and optionally model. The main agent hands them a job and gets back only the result.',
    how: 'Create them with /agents or as Markdown files in .claude/agents/. Claude delegates when a task matches the description, or you ask for one by name.',
    code: `---
name: code-reviewer
description: Reviews a diff for bugs, security issues and missing tests. Use after making changes.
tools: Read, Grep, Glob, Bash(git diff:*)
---

You are a strict reviewer. Report only real problems, most severe first,
each with file:line and a concrete fix. Do not edit files.`,
    lang: 'markdown',
    trap: 'Spawning subagents for small tasks. Each one starts cold and re-reads what it needs; use them for broad searches or independent work that would otherwise flood the main context.',
  },
];

const FEATURE_GROUP_TONE = {
  Context: 'text-sky-300 border-sky-500/30 bg-sky-500/10',
  Control: 'text-rose-300 border-rose-500/30 bg-rose-500/10',
  Reach: 'text-emerald-300 border-emerald-500/30 bg-emerald-500/10',
  Automation: 'text-amber-300 border-amber-500/30 bg-amber-500/10',
};

function FeatureExplorer() {
  const [id, setId] = useState(FEATURES[0].id);
  const f = FEATURES.find((x) => x.id === id);
  return (
    <div className="grid grid-cols-1 lg:grid-cols-[15rem_1fr] gap-4">
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-1 gap-1.5 content-start">
        {FEATURES.map((x, i) => (
          <button
            key={x.id}
            onClick={() => setId(x.id)}
            aria-pressed={x.id === id}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg border text-left text-sm transition-colors ${
              x.id === id ? 'border-orange-500/50 bg-orange-500/15 text-white' : 'border-white/10 bg-white/5 text-gray-400 hover:border-white/30'
            }`}
          >
            <span className="text-[0.625rem] font-mono text-gray-500 w-4">{i + 1}</span>
            <span>{x.icon}</span>
            <span className="truncate">{x.title}</span>
          </button>
        ))}
      </div>
      <motion.div key={f.id} initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ duration: 0.2 }} className="rounded-2xl border border-orange-500/25 bg-[#0d0d0d] p-5 sm:p-6 min-w-0">
        <div className="flex flex-wrap items-center gap-3 mb-4">
          <span className="text-3xl">{f.icon}</span>
          <h3 className="text-xl font-bold text-white m-0">{f.title}</h3>
          <span className={`text-[0.625rem] font-bold uppercase tracking-wide px-2 py-0.5 rounded-full border ${FEATURE_GROUP_TONE[f.group]}`}>{f.group}</span>
        </div>
        <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">What it is</div>
        <p className="text-sm text-gray-300 leading-relaxed mb-4">{f.what}</p>
        <div className="text-[0.625rem] uppercase tracking-wide text-gray-500 mb-1">How to use it</div>
        <p className="text-sm text-gray-300 leading-relaxed mb-4">{f.how}</p>
        <CodeBlock language={f.lang} code={f.code} />
        <div className="mt-4 p-3.5 rounded-lg bg-amber-500/10 border border-amber-500/25">
          <div className="text-[0.625rem] uppercase tracking-wide text-amber-300 mb-1">Common mistake</div>
          <p className="text-xs text-gray-300 leading-relaxed m-0">{f.trap}</p>
        </div>
      </motion.div>
    </div>
  );
}

const WORKFLOW = [
  ['Start in the repository', 'Run claude in the project folder. CLAUDE.md loads automatically, so Claude already knows the build and test commands.', 'CLAUDE.md'],
  ['Plan before editing', 'Switch to plan mode and describe the change. Claude reads the middleware and routes and proposes an approach you can correct before any file changes.', 'Plan mode'],
  ['Pull in the ticket', 'An MCP server for the issue tracker lets Claude read the acceptance criteria directly instead of you pasting them.', 'MCP'],
  ['Implement with guardrails', 'Claude edits files and runs the test command you pre-approved; anything else, like installing a package, still asks first.', 'Permissions'],
  ['Formatting happens by itself', 'A PostToolUse hook runs the formatter after every edit, so style never needs a reminder.', 'Hooks'],
  ['Get an independent review', 'A code-reviewer subagent reads the diff in its own context and reports problems without cluttering the main session.', 'Subagents'],
  ['Undo a wrong turn', 'If an approach goes badly, rewind to the checkpoint before it rather than asking Claude to undo by hand.', 'Checkpoints'],
  ['Wrap up and reset', 'Commit, then /clear before the next unrelated task so it starts with a clean context.', 'Context'],
];

export default function ModelsAnthropic() {
  const toc = [
    { label: 'Overview', hash: 'overview' },
    { label: 'Products at a Glance', hash: 'products' },
    { label: 'Current Lineup', hash: 'lineup' },
    { label: 'Model Weights', hash: 'weights' },
    { label: 'When to Choose It', hash: 'choose' },
    { label: 'How to Access It', hash: 'access' },
    { label: 'Training Pipeline', hash: 'pipeline' },
    { label: 'How Claude Is Trained', hash: 'training' },
    { label: 'Capabilities', hash: 'architecture' },
    { label: 'The Developer Platform', hash: 'platform' },
    { label: 'Strengths & Weaknesses', hash: 'strengths' },
    { label: 'Ideal Use Cases', hash: 'use-cases' },
    { label: 'Claude Code', hash: 'claude-code' },
    { label: 'Claude Code Features', hash: 'claude-code-features' },
    { label: 'A Typical Session', hash: 'claude-code-workflow' },
  ];

  return (
    <GuideLayout title="Anthropic" intro="The company behind Claude: its models and how they are trained, the developer platform, and Claude Code — the agentic coding tool — feature by feature." toc={toc}>
      <section id="overview" className="mb-14 scroll-mt-24">
        <div className="flex items-center gap-3 mb-4">
          <span className="text-4xl">🧠</span>
          <span className="px-3 py-1 rounded-full bg-orange-500/15 text-orange-400 text-xs font-bold border border-orange-500/30">Anthropic · Closed Weights</span>
        </div>
        <p className="text-gray-300 leading-relaxed max-w-3xl">
          Claude is Anthropic's flagship model line, built by the team that co-authored the original InstructGPT/RLHF
          research at OpenAI before founding Anthropic to focus explicitly on AI safety. That focus shows up directly
          in training method (Constitutional AI, below) and in product behavior — long-context reasoning, careful tool
          use, and being purpose-built for agentic coding workflows like Claude Code.
        </p>
        <p className="text-gray-300 leading-relaxed max-w-3xl mt-4">
          Anthropic was founded in 2021 and publishes much of its safety work — Constitutional AI, interpretability
          research, and a Responsible Scaling Policy that ties how a model is deployed to how capable it is. It also
          created the <a href="#/mcp" className="text-blue-400 hover:underline">Model Context Protocol</a>, now an open
          standard used well beyond Claude.
        </p>
      </section>

      <section id="products" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-2">Products at a Glance</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-3xl">One model family, reached through several surfaces. Which one you use depends on whether you are chatting, building, or coding.</p>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {PRODUCTS.map((p) => (
            <div key={p.t} className="p-5 rounded-xl border border-orange-500/20 bg-orange-500/[0.06]">
              <div className="flex items-center gap-2 mb-2"><span className="text-xl">{p.i}</span><h3 className="font-semibold text-white text-sm m-0">{p.t}</h3></div>
              <p className="text-xs text-gray-300 leading-relaxed mb-2">{p.d}</p>
              <p className="text-[0.6875rem] text-orange-200/80 m-0"><span className="font-semibold">For:</span> {p.who}</p>
            </div>
          ))}
        </div>
      </section>

      <ModelLineup id="claude" />

      <ModelWeights id="claude" />

      <ModelAccess id="claude" name="Claude" />

      <ModelPipeline id="claude" name="Claude" />

      <section id="training" className="mb-16 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">How Claude Is Trained</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Claude follows pretrain → SFT → alignment like the rest of the field. Its alignment stage is where it
          diverges: instead of relying purely on large volumes of human-ranked comparisons, Anthropic pioneered
          <strong className="text-white"> Constitutional AI (CAI)</strong> — teaching the model to police itself against a written
          set of principles.
        </p>

        <div className="bg-[#0a0a0a] border border-gray-800 rounded-xl p-6 mb-6">
          <h3 className="text-sm font-bold text-gray-400 uppercase tracking-wider mb-4 text-center">Constitutional AI Loop</h3>
          <div className="flex flex-col items-center gap-3">
            <div className="px-4 py-2 bg-black/40 border border-gray-700 rounded-lg text-gray-300 text-sm font-mono">SFT Model generates a response</div>
            <div className="text-gray-500">↓</div>
            <motion.div
              animate={{ boxShadow: ['0 0 0px rgba(251,146,60,0)', '0 0 16px rgba(251,146,60,0.4)', '0 0 0px rgba(251,146,60,0)'] }}
              transition={{ duration: 2.5, repeat: Infinity }}
              className="px-4 py-2 bg-orange-900/20 border border-orange-500/40 rounded-lg text-orange-300 text-sm font-bold"
            >
              📜 Model critiques its own response against the "constitution"
            </motion.div>
            <div className="text-gray-500">↓</div>
            <div className="px-4 py-2 bg-black/40 border border-gray-700 rounded-lg text-gray-300 text-sm font-mono">Model revises its own response to better fit the principles</div>
            <div className="text-gray-500">↓ repeat, then fine-tune on the revised examples (SL-CAI) ↓</div>
            <div className="px-4 py-2 bg-emerald-900/20 border border-emerald-500/40 rounded-lg text-emerald-300 text-sm font-bold">AI-generated preference data trains a reward model → RLAIF (RL from AI Feedback)</div>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-5 mb-6">
          <div className="bg-orange-900/10 border border-orange-500/20 rounded-xl p-5">
            <h3 className="text-orange-400 font-semibold mb-2 text-sm">📜 The "Constitution"</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              A written set of principles (drawing on sources like human rights frameworks and platform guidelines)
              instructing the model to prefer responses that are more helpful, honest, and harmless. Humans write the
              constitution once; the model applies it to itself at scale.
            </p>
          </div>
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h3 className="text-emerald-400 font-semibold mb-2 text-sm">🤖 RLAIF vs RLHF</h3>
            <p className="text-sm text-gray-300 leading-relaxed">
              Classic RLHF needs humans to rank huge numbers of response pairs. RLAIF has the model itself (guided by
              the constitution) generate much of that preference data instead — humans define the values once, AI
              feedback scales the labeling.
            </p>
          </div>
        </div>

        <div className="bg-indigo-900/10 border border-indigo-500/20 rounded-xl p-6">
          <h3 className="text-indigo-400 font-semibold mb-3">🔑 The Key Differentiator: Self-Critique Instead of Human-Only Judging</h3>
          <p className="text-sm text-gray-300 leading-relaxed">
            Where standard RLHF makes "what's a good response?" entirely a matter of what human raters happen to
            prefer in the moment, Constitutional AI makes the underlying values <strong className="text-gray-100">explicit and
            written down</strong> — and has the model reason about and apply those values to its own outputs before any
            reinforcement learning happens. This is also what Claude's "harmlessness" tuning is built on: the model
            learns to recognize and revise problematic outputs itself, rather than only being told after the fact by a
            human rater which of two responses was worse.
          </p>
        </div>
      </section>

      <section id="architecture" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-4">Capabilities</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-3xl">Anthropic does not publish Claude's architecture or size. What it does document is what the models are built to be good at.</p>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {[
            { icon: '📚', title: 'Long-Context Reasoning', desc: 'Context windows large enough to hold entire codebases or document sets, with strong recall across the whole window rather than just the ends.' },
            { icon: '🛠️', title: 'Agentic Tool Use', desc: 'Purpose-tuned for long tool-use chains — reading files, running commands, calling APIs across many sequential steps without losing the thread.' },
            { icon: '🖥️', title: 'Computer Use', desc: 'Can perceive a screen and control a mouse/keyboard directly, extending tool use beyond APIs to any GUI application.' },
          ].map((f, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 15 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.1 }} className="bg-white/5 border border-white/10 rounded-xl p-5">
              <div className="text-3xl mb-3">{f.icon}</div>
              <h3 className="font-bold text-gray-200 mb-2">{f.title}</h3>
              <p className="text-sm text-gray-400 leading-relaxed">{f.desc}</p>
            </motion.div>
          ))}
        </div>
      </section>

      <section id="platform" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-2">The Developer Platform</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-3xl">
          Everything in the API goes through one endpoint, the Messages API. The features below are options on that
          call rather than separate products, which is why they combine freely — a cached, tool-using, thinking
          request is one request.
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
          {PLATFORM.map((f) => (
            <div key={f.t} className="p-4 rounded-xl border border-white/10 bg-white/5">
              <h3 className="font-semibold text-white text-sm mb-1.5">{f.t}</h3>
              <p className="text-xs text-gray-400 leading-relaxed m-0">{f.d}</p>
            </div>
          ))}
        </div>
        <CodeBlock
          language="python"
          code={`import anthropic

client = anthropic.Anthropic()  # reads ANTHROPIC_API_KEY

response = client.messages.create(
    model="claude-opus-5-5",
    max_tokens=2048,
    thinking={"type": "adaptive"},          # let the model decide how much to think
    system="You are a concise support assistant.",
    messages=[{"role": "user", "content": "Why might my refund be delayed?"}],
)

for block in response.content:
    if block.type == "text":
        print(block.text)
print(response.usage)                        # input / output tokens you are billed for`}
        />
        <p className="text-xs text-gray-500 mt-2">The same request works through Amazon Bedrock, Google Vertex AI and Microsoft Foundry with a different client — see <a href="#/cloud/ai-platforms" className="text-blue-400 hover:underline">Cloud AI Platforms</a>.</p>
      </section>

      <section id="strengths" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Strengths & Weaknesses</h2>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          <div className="bg-emerald-900/10 border border-emerald-500/20 rounded-xl p-5">
            <h4 className="text-emerald-400 font-semibold mb-2">Strengths</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Leading agentic coding performance — long tool-use chains, large codebases.</li>
              <li>Careful, well-calibrated behavior on sensitive or ambiguous requests.</li>
              <li>Strong long-document and long-context recall.</li>
              <li>Purpose-built developer tooling (Claude Code, Agent SDK).</li>
            </ul>
          </div>
          <div className="bg-rose-900/10 border border-rose-500/20 rounded-xl p-5">
            <h4 className="text-rose-400 font-semibold mb-2">Weaknesses</h4>
            <ul className="list-disc pl-5 text-sm text-gray-300 space-y-1.5">
              <li>Closed weights — no self-hosting or on-prem deployment.</li>
              <li>Smaller multimodal generation surface than GPT (no native image generation).</li>
              <li>Frontier tier pricing is a real cost factor at high volume.</li>
            </ul>
          </div>
        </div>
      </section>

      <section id="use-cases" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-6">Ideal Use Cases</h2>
        <motion.div className="grid grid-cols-1 sm:grid-cols-3 gap-4" variants={stagger} initial="hidden" whileInView="show" viewport={{ once: true }}>
          {['Agentic coding assistants', 'Long-document analysis & summarization', 'Safety-sensitive customer-facing products'].map((u, i) => (
            <motion.div key={i} variants={fadeUp} className="bg-white/5 border border-white/10 rounded-lg p-4 text-sm text-gray-300 text-center">{u}</motion.div>
          ))}
        </motion.div>
      </section>

      <section id="claude-code" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-2">Claude Code</h2>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-4">
          Claude Code is Anthropic's agentic coding tool. You describe a task in plain language; it reads your
          codebase, edits files, runs commands and tests, and iterates until the task is done — asking before it
          does anything you have not allowed. It runs in the terminal, in VS Code and JetBrains IDEs, in a desktop
          app, and on the web.
        </p>
        <p className="text-gray-300 leading-relaxed max-w-3xl mb-6">
          Under the hood it is the <a href="#/agents" className="text-blue-400 hover:underline">agent loop</a> with a
          carefully built harness: Claude decides on the next action, the harness runs the tool (read a file, run a
          shell command, edit code), the result goes back into context, and the loop repeats. Almost every feature
          below is a way to shape one part of that loop — what goes into context, which tools are allowed, or what
          runs automatically around it.
        </p>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          {[
            ['📥', 'Context', 'CLAUDE.md, @-mentions, skills, compaction'],
            ['🔒', 'Control', 'Permissions, plan mode, checkpoints'],
            ['🔌', 'Reach', 'MCP servers, plugins'],
            ['⚙️', 'Automation', 'Hooks, subagents, headless mode'],
          ].map(([i, t, d]) => (
            <div key={t} className="p-4 rounded-xl border border-white/10 bg-white/5 text-center">
              <div className="text-2xl mb-1">{i}</div>
              <div className="text-sm font-semibold text-white">{t}</div>
              <div className="text-[0.6875rem] text-gray-400 mt-1">{d}</div>
            </div>
          ))}
        </div>
      </section>

      <section id="claude-code-features" className="mb-14 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-2">Claude Code Features</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-3xl">Pick a feature to see what it is, how you use it, and the mistake people make with it.</p>
        <FeatureExplorer />
        <p className="text-xs text-gray-500 mt-4">
          Commands and file locations evolve between releases. Inside Claude Code, <code className="text-gray-300">/help</code> lists
          what your version supports; the official docs are at{' '}
          <a href="https://code.claude.com/docs" target="_blank" rel="noopener noreferrer" className="text-blue-400 hover:underline">code.claude.com/docs</a>.
        </p>
      </section>

      <section id="claude-code-workflow" className="mb-4 scroll-mt-24">
        <h2 className="text-2xl font-bold text-white mb-2">A Typical Session</h2>
        <p className="text-gray-400 text-sm mb-6 max-w-3xl">How the features fit together on a real change — adding rate limiting to an API.</p>
        <ol className="space-y-3">
          {WORKFLOW.map(([t, d, tag], i) => (
            <motion.li key={t} initial={{ opacity: 0, x: -12 }} whileInView={{ opacity: 1, x: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.05 }} className="flex gap-4 p-4 rounded-xl border border-white/10 bg-white/5">
              <span className="shrink-0 w-7 h-7 rounded-full bg-orange-500/20 border border-orange-500/40 text-orange-300 text-sm font-bold flex items-center justify-center">{i + 1}</span>
              <div className="min-w-0">
                <div className="flex flex-wrap items-center gap-2 mb-0.5">
                  <span className="text-sm font-semibold text-white">{t}</span>
                  <span className="text-[0.625rem] px-1.5 py-0.5 rounded border border-orange-500/30 text-orange-300">{tag}</span>
                </div>
                <p className="text-xs text-gray-400 leading-relaxed m-0">{d}</p>
              </div>
            </motion.li>
          ))}
        </ol>
        <div className="mt-6 p-4 rounded-xl border border-indigo-500/25 bg-indigo-500/10">
          <p className="text-sm text-gray-300 leading-relaxed m-0">
            <strong className="text-white">Building your own agent?</strong> The Claude Agent SDK exposes the same harness
            — tools, permissions, hooks, subagents, context management — as a Python and TypeScript library. See{' '}
            <a href="#/agents/sdks" className="text-blue-400 hover:underline">Agent SDKs</a>.
          </p>
        </div>
      </section>
    </GuideLayout>
  );
}

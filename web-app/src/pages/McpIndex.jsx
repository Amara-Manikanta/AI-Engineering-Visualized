import React, { useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import Sequence from "../components/mcp/Sequence";
import { IntegrationCount, HostDiagram, TrifectaLab, SessionLab, ContextCost } from "../components/mcp/McpLabs";
import { questionsFor } from "../data/quizBank";
import { Panel, Segmented, Card, Note, Section } from "../components/VizKit";

export const SEARCH_KEYWORDS = [
  "MCP", "Model Context Protocol", "MCP server", "MCP client", "MCP host", "JSON-RPC", "stdio transport",
  "Streamable HTTP", "SSE", "Mcp-Session-Id", "tools/list", "tools/call", "resources", "prompts", "sampling",
  "roots", "elicitation", "OAuth 2.1", "PKCE", "protected resource metadata", "tool poisoning", "rug pull",
  "confused deputy", "token passthrough", "lethal trifecta", "prompt injection", "FastMCP", "MCP Inspector",
  "MCP connector", "mcp_servers", "mcp_toolset", "claude mcp add", "claude_desktop_config.json", ".mcp.json",
  "tool annotations", "readOnlyHint", "isError", "structuredContent", "MCP registry", "context cost",
  "protocol version 2025-11-25", "notifications/initialized", "list_changed", "progress", "cancellation",
];

/* ---------------------------------------------------------------------------
   Authorization, as the real sequence.
--------------------------------------------------------------------------- */

const OAUTH_STEPS = [
  { from: 0, to: 1, tag: "HTTP", label: "POST /mcp with no token" },
  { from: 1, to: 0, tag: "HTTP", label: "401 + WWW-Authenticate header" },
  { from: 0, to: 1, tag: "HTTP", label: "GET protected-resource metadata (RFC 9728)" },
  { from: 0, to: 2, tag: "HTTP", label: "Discover the authorization server" },
  { from: 0, to: 2, tag: "HTTP", label: "Client registration" },
  { from: 0, to: 3, tag: "Browser", label: "Open authorize URL (PKCE + resource)" },
  { from: 3, to: 2, tag: "Browser", label: "User signs in and consents; code returned" },
  { from: 0, to: 2, tag: "HTTP", label: "Exchange code + verifier for a token" },
  { from: 0, to: 1, tag: "HTTP", label: "Retry with Authorization: Bearer" },
];

const OAUTH_NOTES = [
  "The client tries the server. It has no token yet.",
  "The server refuses with 401 and a WWW-Authenticate header that points at its protected-resource metadata.",
  "That metadata document (RFC 9728) names the authorization server(s) that can issue tokens for this server.",
  "The client reads the authorization server's own metadata to find its authorize, token and registration endpoints.",
  "The client needs a client ID. Either it is pre-registered, it publishes a client metadata document at a URL it controls, or it uses dynamic client registration.",
  "The client sends the user's browser to the authorize endpoint with a PKCE code challenge and a resource parameter naming the MCP server.",
  "The user signs in and approves. The browser is redirected back to the client with a one-time authorization code.",
  "The client exchanges the code, proving possession with the PKCE verifier, and names the resource again. The token is audience-bound (RFC 8707): valid for this MCP server only.",
  "The client repeats the original call with the token in the Authorization header on every HTTP request.",
];

function OAuthFlow() {
  const [i, setI] = useState(0);
  return (
    <Panel tone="indigo" title="The OAuth 2.1 sequence for a remote server">
      <Sequence lanes={["MCP client", "MCP server", "Auth server", "Browser"]} steps={OAUTH_STEPS} active={i} onSelect={setI} />
      <div className="flex gap-2 my-3">
        <button className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-indigo-500/40 bg-indigo-500/15 text-indigo-200 disabled:opacity-40" onClick={() => setI((v) => Math.max(0, v - 1))} disabled={i === 0}>← Back</button>
        <button className="px-3 py-1.5 rounded-lg text-xs font-semibold border border-indigo-500/40 bg-indigo-500/15 text-indigo-200 disabled:opacity-40" onClick={() => setI((v) => Math.min(OAUTH_STEPS.length - 1, v + 1))} disabled={i === OAUTH_STEPS.length - 1}>Next →</button>
        <span className="text-xs text-gray-500 self-center">Step {i + 1} of {OAUTH_STEPS.length}</span>
      </div>
      <p className="text-sm text-gray-300 leading-relaxed m-0">{OAUTH_NOTES[i]}</p>
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Using MCP servers: four tabs.
--------------------------------------------------------------------------- */

const USE = {
  desktop: {
    label: "Claude Desktop",
    lang: "json",
    note: "Edit claude_desktop_config.json (Settings → Developer → Edit Config), then restart the app. Use absolute paths: the app does not start in your project folder.",
    code: `{
  "mcpServers": {
    "filesystem": {
      "command": "npx",
      "args": ["-y", "@modelcontextprotocol/server-filesystem", "/Users/me/projects"]
    },
    "weather": {
      "command": "uv",
      "args": ["--directory", "/Users/me/servers/weather", "run", "server.py"]
    }
  }
}`,
  },
  code: {
    label: "Claude Code",
    lang: "bash",
    note: "Add servers from the command line. Scope decides who gets them: local (just you, this project), project (shared through a committed .mcp.json), or user (all your projects).",
    code: `# Remote server over Streamable HTTP
claude mcp add --transport http notion https://mcp.notion.com/mcp

# Local stdio server (everything after -- is the command to run)
claude mcp add filesystem -- npx -y @modelcontextprotocol/server-filesystem /Users/me/projects

# Share with the team: writes .mcp.json in the repo
claude mcp add --scope project --transport http docs https://example.com/mcp

claude mcp list       # what is connected
claude mcp remove docs`,
  },
  api: {
    label: "Claude API (remote)",
    lang: "python",
    note: "The MCP connector lets the API connect to a remote MCP server for you. Both halves are required: the server in mcp_servers and a matching mcp_toolset in tools. Remote servers only; not available on Amazon Bedrock or Google Vertex AI. Add the allowlist config only after checking the current docs for your version.",
    code: `import anthropic

client = anthropic.Anthropic()

response = client.beta.messages.create(
    model="claude-opus-5-5",
    max_tokens=2000,
    betas=["mcp-client-2025-11-20"],
    mcp_servers=[
        {"type": "url", "url": "https://mcp.example.com/mcp", "name": "example"}
    ],
    tools=[
        # Every server in mcp_servers needs exactly one toolset that names it.
        {"type": "mcp_toolset", "mcp_server_name": "example"}
    ],
    messages=[{"role": "user", "content": "What tickets are open for Project X?"}],
)
print(response.content)`,
  },
  agent: {
    label: "Your own agent (local)",
    lang: "python",
    note: "For local stdio servers, connect with the MCP Python SDK and hand the tools to the SDK's tool runner. Install with pip install \"anthropic[mcp]\" (Python 3.10+). The runner is created without await and iterated with async for.",
    code: `from anthropic import AsyncAnthropic
from anthropic.lib.tools.mcp import async_mcp_tool
from mcp import ClientSession
from mcp.client.stdio import stdio_client, StdioServerParameters

client = AsyncAnthropic()
server = StdioServerParameters(command="python", args=["server.py"])

async def main():
    async with stdio_client(server) as (read, write):
        async with ClientSession(read, write) as mcp_client:
            await mcp_client.initialize()
            tools = await mcp_client.list_tools()

            runner = client.beta.messages.tool_runner(
                model="claude-opus-5-5",
                max_tokens=16000,
                messages=[{"role": "user", "content": "What is the weather in Pune?"}],
                tools=[async_mcp_tool(t, mcp_client) for t in tools.tools],
            )
            async for message in runner:
                print(message)`,
  },
};

function UsingServers() {
  const [k, setK] = useState("code");
  const u = USE[k];
  return (
    <Panel tone="blue" title="Connect a server">
      <div className="mb-4">
        <Segmented tone="blue" value={k} onChange={setK} options={Object.entries(USE).map(([v, x]) => ({ v, label: x.label }))} />
      </div>
      <p className="text-sm text-gray-300 leading-relaxed mb-3">{u.note}</p>
      <CodeBlock language={u.lang} code={u.code} maxHeight="360px" />
    </Panel>
  );
}

/* ---------------------------------------------------------------------------
   Building a server
--------------------------------------------------------------------------- */

const PY_SERVER = `from mcp.server.fastmcp import FastMCP

mcp = FastMCP("weather")

@mcp.tool()
def get_forecast(city: str) -> str:
    """Get the forecast for a city. Use when the user asks about weather."""
    return f"Tomorrow in {city}: showers, 24°C"

@mcp.resource("forecast://{city}")          # a resource template
def forecast_resource(city: str) -> str:
    """The latest forecast as a readable document."""
    return f"Forecast for {city}: showers"

@mcp.prompt()
def plan_trip(city: str) -> str:
    """A reusable prompt the user can pick from a menu."""
    return f"Plan a two-day trip to {city}, checking the forecast first."

if __name__ == "__main__":
    mcp.run(transport="stdio")              # or transport="streamable-http"
    # Never print() to stdout on stdio: it is the protocol channel. Log to stderr.`;

const TS_SERVER = `import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";

const server = new McpServer({ name: "weather", version: "1.0.0" });

server.registerTool(
  "get_forecast",
  {
    title: "Weather forecast",
    description: "Get the forecast for a city. Use when the user asks about weather.",
    inputSchema: { city: z.string() },
  },
  async ({ city }) => ({
    content: [{ type: "text", text: \`Tomorrow in \${city}: showers, 24°C\` }],
  }),
);

await server.connect(new StdioServerTransport());
// On stdio, log with console.error, never console.log.`;

function BuildServer() {
  const [k, setK] = useState("py");
  return (
    <Panel tone="emerald" title="A small server, two languages">
      <div className="mb-4">
        <Segmented tone="emerald" value={k} onChange={setK} options={[{ v: "py", label: "Python · FastMCP" }, { v: "ts", label: "TypeScript · McpServer" }]} />
      </div>
      <CodeBlock language={k === "py" ? "python" : "typescript"} code={k === "py" ? PY_SERVER : TS_SERVER} maxHeight="380px" />
      <p className="text-xs text-gray-500 leading-relaxed mt-3 mb-0">
        Test it without any AI app: <span className="font-mono">npx @modelcontextprotocol/inspector</span> opens a browser
        page where you can list tools, call them with your own arguments and read the raw JSON-RPC. SDK APIs move
        between releases; check the current SDK docs when a call does not match.
      </p>
    </Panel>
  );
}

/* --------------------------------------------------------------------------- */

const PRIMITIVES = [
  ["Tools", "Actions the model can ask to run", "Model-controlled", "tools/list · tools/call", "emerald"],
  ["Resources", "Read-only data addressed by URI", "Application-controlled", "resources/list · resources/read · resources/templates/list · resources/subscribe", "blue"],
  ["Prompts", "Reusable prompt templates, often shown as slash commands", "User-controlled", "prompts/list · prompts/get", "purple"],
  ["Sampling", "The server asks the host to run a model call for it", "Client feature", "sampling/createMessage", "amber"],
  ["Roots", "The folders or URIs the server is allowed to work within", "Client feature", "roots/list", "indigo"],
  ["Elicitation", "The server asks the user a question mid-task", "Client feature", "elicitation/create", "rose"],
];

const THREATS = [
  ["Tool poisoning", "Instructions hidden in a tool's description or schema that the model follows but the user never sees.", "Show full descriptions to the user, pin and review definitions, prefer servers you can read."],
  ["Rug pull", "A server is approved, then quietly changes a tool's definition or behaviour later.", "Pin versions, hash definitions, re-ask for approval when notifications/tools/list_changed changes them."],
  ["Tool shadowing and name collisions", "A malicious server defines a tool with the same or a similar name as a trusted one, or its description steers calls for another server's tools.", "Prefix names by server, show which server owns each call, keep untrusted servers out of sessions with sensitive ones."],
  ["Prompt injection via results", "Text in a tool result, such as a web page or ticket, tells the model to take actions.", "Treat results as data. Confirm side-effecting calls. Apply the lethal-trifecta check."],
  ["Confused deputy and token passthrough", "A server uses its own privileges for a request it should not, or forwards a token it received to another service.", "Servers must never pass a received token onward. Use audience-bound tokens and separate credentials per downstream service."],
  ["Over-broad scopes", "One token grants far more than the task needs, so any leak or mistake is costly.", "Request minimal scopes, add more only when needed, and prefer read-only credentials."],
  ["Supply chain", "npx -y runs whatever was last published under that name, including after an account takeover or a typosquat.", "Pin exact versions, use a lockfile or a vendored copy, and review what you install."],
  ["DNS rebinding", "A web page reaches an MCP server bound to localhost by tricking the browser's DNS.", "Local HTTP servers validate the Origin header, bind to 127.0.0.1 only, and require authentication."],
];

const COMPARE = [
  ["Function calling", "A model to your code's functions", "You, in each request", "You pass the list every call", "One app, a few tools, no need to share them"],
  ["MCP", "An AI app to tools, data and prompts on other systems", "Server authors, once, for any host", "The client asks tools/list", "The same capability should work in many apps"],
  ["A2A", "One agent to another agent", "Each agent publishes an Agent Card", "Read the agent's card", "Agents built by different teams need to collaborate"],
  ["Skills", "An agent to know-how: procedures, scripts, templates", "Skill authors, as a folder", "Name and description loaded at start", "Teaching a job, not reaching a system"],
  ["Subagents", "A parent agent to a focused child agent with its own context", "You, in the agent's config", "Defined by the harness", "Isolating a big side task from the main context"],
];

const DEBUG = [
  ["Server does not appear", "A relative path, wrong command, or the app cannot find node, npx or uv on its PATH.", "Use absolute paths, put the full path to the command, restart the app, and check its MCP log."],
  ["Connection closes or JSON errors right after start", "Something wrote to stdout. It is the protocol channel, so a print or a startup banner corrupts it.", "Log to stderr. Remove print and console.log. Run the server in the Inspector to see the bad line."],
  ["Tools listed but never called", "The name and description do not tell the model when to use the tool.", "Say what it does and when. Use verbs and the words users say. Test with real prompts."],
  ["Endless sign-in loop", "The redirect URI does not match, the token audience is wrong, or a stale token is cached.", "Clear stored credentials, check the registered redirect URI, and confirm the resource parameter matches the server URL."],
  ["Calls time out", "The tool is slow, or the client's request timeout is short.", "Send progress notifications, return quickly with a job ID, or raise the timeout where it is configurable."],
  ["Model retries the same failing call", "The error carried no useful information.", "Return isError: true with a message saying what was wrong and what to try instead."],
];

export default function McpIndex() {
  const toc = [
    { label: "What Is MCP?", hash: "mcp" },
    { label: "Why MCP? The N×M Problem", hash: "why-mcp" },
    { label: "Core Architecture", hash: "architecture" },
    { label: "Core Primitives", hash: "primitives" },
    { label: "Tools in Depth", hash: "tools" },
    { label: "Notifications & Utilities", hash: "utilities" },
    { label: "Transport Layers", hash: "transports" },
    { label: "Handshake & Messages", hash: "handshake" },
    { label: "Lab: A Session, Step by Step", hash: "session" },
    { label: "Authorization (OAuth 2.1)", hash: "authorization" },
    { label: "Security & Threats", hash: "security" },
    { label: "Using MCP Servers", hash: "using" },
    { label: "Building a Server", hash: "building" },
    { label: "Context Cost", hash: "context-cost" },
    { label: "MCP vs Everything Else", hash: "vs-function-calling" },
    { label: "Ecosystem", hash: "ecosystem" },
    { label: "Best Practices", hash: "best-practices" },
    { label: "Debugging", hash: "debugging" },
  ];

  return (
    <GuideLayout
      title="Model Context Protocol (MCP)"
      intro="An open standard that lets an AI application plug into tools, files and services through one shared protocol: the way USB-C standardised device connectors."
      toc={toc}
    >
      <Section id="mcp" title="What Is MCP?" lead="MCP is an open protocol for connecting AI applications to external context: tools, files, databases and live services. Each side implements MCP once, and any client can then work with any server.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <Card title="What it is" tone="emerald">
            <p>A set of JSON-RPC messages and rules for discovering and calling capabilities on another system, plus how to connect and how to authorise.</p>
          </Card>
          <Card title="What it is not" tone="rose">
            <p>Not an agent framework (it has no loop or planner). Not a model feature (the model never speaks MCP). Not a replacement for APIs: most MCP servers wrap an API, and add a description a model can use.</p>
          </Card>
        </div>
        <Note tone="indigo">
          <strong>History.</strong> Anthropic created MCP and open-sourced it in November 2024. It was adopted quickly by
          other AI vendors and developer tools. Reports say stewardship later moved to a neutral home, the Agentic AI
          Foundation under the Linux Foundation; check the project site for the current governance before relying on
          that detail.
        </Note>
      </Section>

      <Section id="why-mcp" title="Why MCP? The N×M Problem" lead="Without a shared protocol, every AI app needs its own connector for every tool. With one, each side is built once.">
        <IntegrationCount />
      </Section>

      <Section id="architecture" title="Core Architecture" lead="Every MCP connection has three roles: a host, a client inside it, and a server.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-5">
          <Card title="Host" tone="purple"><p>The AI application: Claude Desktop, an IDE, your agent. It owns the conversation, the model calls and the user's approvals.</p></Card>
          <Card title="Client" tone="blue"><p>A component inside the host that keeps one connection to one server and speaks the protocol.</p></Card>
          <Card title="Server" tone="emerald"><p>A program that exposes tools, resources and prompts for one system: a filesystem, a database, a SaaS API.</p></Card>
        </div>
        <HostDiagram />
        <div className="mt-5">
          <Note tone="amber">
            <strong>The LLM is not part of MCP.</strong> The protocol carries messages between a host and its servers.
            Deciding to call a tool is the model's job, done through its own API; you can see both sets of messages side
            by side in the session lab below.
          </Note>
        </div>
      </Section>

      <Section id="primitives" title="Core Primitives" lead="Servers offer tools, resources and prompts. Clients can offer sampling, roots and elicitation. Each is a small set of JSON-RPC methods.">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm text-left min-w-[640px]">
            <thead className="bg-white/5 text-gray-300">
              <tr>
                <th className="p-3">Primitive</th>
                <th className="p-3">What it is</th>
                <th className="p-3">Who controls it</th>
                <th className="p-3">Methods</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-gray-400">
              {PRIMITIVES.map(([n, d, c, m]) => (
                <tr key={n}>
                  <td className="p-3 text-white font-semibold">{n}</td>
                  <td className="p-3">{d}</td>
                  <td className="p-3">{c}</td>
                  <td className="p-3 font-mono text-xs text-emerald-300">{m}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <Section id="tools" title="Tools in Depth" lead="Tools are the most used primitive. A definition tells the model what a tool does; a result tells it what happened.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <Card title="The definition" tone="emerald">
            <p><span className="font-mono">name</span>, <span className="font-mono">title</span>, <span className="font-mono">description</span> and <span className="font-mono">inputSchema</span> (JSON Schema) are the core. Optional: <span className="font-mono">outputSchema</span> for structured results, and <span className="font-mono">annotations</span>.</p>
          </Card>
          <Card title="Annotations are hints" tone="amber">
            <p><span className="font-mono">readOnlyHint</span>, <span className="font-mono">destructiveHint</span>, <span className="font-mono">idempotentHint</span> and <span className="font-mono">openWorldHint</span> help a host decide when to ask for approval. They are only hints. Never trust them from a server you do not trust.</p>
          </Card>
          <Card title="Result content" tone="blue">
            <p>A result is a <span className="font-mono">content</span> array of <span className="font-mono">text</span>, <span className="font-mono">image</span>, <span className="font-mono">audio</span>, <span className="font-mono">resource_link</span> or an embedded resource, and optionally <span className="font-mono">structuredContent</span> matching the output schema.</p>
          </Card>
          <Card title="Two kinds of error" tone="rose">
            <p>A <strong className="text-white">protocol error</strong> is a JSON-RPC error: unknown tool, bad arguments. A <strong className="text-white">tool error</strong> is a normal result with <span className="font-mono">isError: true</span>. The model sees the second kind and can retry; write those messages for the model.</p>
          </Card>
        </div>
        <CodeBlock
          language="json"
          code={`// Tool failure the model can act on (a result, not a protocol error)
{
  "jsonrpc": "2.0", "id": 3,
  "result": {
    "isError": true,
    "content": [{ "type": "text", "text": "City 'Punee' not found. Did you mean 'Pune'?" }]
  }
}`}
        />
      </Section>

      <Section id="utilities" title="Notifications and Utilities" lead="Beyond calls and results, the protocol has small messages for keeping a long-lived session healthy.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {[
            ["list_changed", "notifications/tools/list_changed (and resources, prompts): the server's list changed, so refetch it."],
            ["Resource updates", "notifications/resources/updated: a resource you subscribed to changed."],
            ["Progress", "notifications/progress: percent or step counts for slow work, tied to a progress token."],
            ["Cancellation", "notifications/cancelled: stop a request that is no longer needed."],
            ["Logging", "notifications/message, with logging/setLevel. Structured server logs sent to the client, not stdout."],
            ["Ping", "ping: either side checks the other is still there."],
            ["Pagination", "List calls return a nextCursor. Pass it back to get the next page."],
            ["Completion", "completion/complete: suggestions for a prompt or resource-template argument."],
          ].map(([t, d]) => (
            <Card key={t} title={t}><p>{d}</p></Card>
          ))}
        </div>
      </Section>

      <Section id="transports" title="Transport Layers" lead="The transport carries the JSON-RPC messages. There are two standard ones.">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mb-5">
          <Card title="stdio (local)" tone="emerald">
            <p>The host starts the server as a child process and talks over its standard input and output, one JSON message per line.</p>
            <p><strong className="text-white">stdout is reserved for protocol messages.</strong> Printing anything else there breaks the stream, and it is the most common reason a new server fails. Write logs to stderr.</p>
          </Card>
          <Card title="Streamable HTTP (remote)" tone="blue">
            <p>One endpoint, such as <span className="font-mono">/mcp</span>. The client POSTs each message; the reply comes back as plain JSON or as a Server-Sent Events stream.</p>
            <p>A GET opens a stream for messages the server starts. A session is tracked with the <span className="font-mono">Mcp-Session-Id</span> header, the version with <span className="font-mono">MCP-Protocol-Version</span>, and a dropped stream resumes with <span className="font-mono">Last-Event-ID</span>.</p>
          </Card>
        </div>
        <Note tone="rose">
          The older HTTP+SSE transport (two endpoints) is deprecated in favour of Streamable HTTP. For a server on
          localhost, <strong>validate the Origin header and bind to 127.0.0.1</strong>, or a web page can reach it
          through DNS rebinding.
        </Note>
      </Section>

      <Section id="handshake" title="Handshake and Message Format" lead="Every session starts with the same three messages. Only then may either side use the features they agreed on.">
        <ol className="space-y-3 list-none p-0 mb-5">
          {[
            ["initialize (client → server)", "Sends the newest protocol version it supports, its capabilities and who it is."],
            ["initialize result (server → client)", "Replies with the version it will use. If it supports the client's version it echoes it; otherwise it answers with its own newest, and the client disconnects if it cannot support that. This is version negotiation."],
            ["notifications/initialized (client → server)", "A notification, so no reply. It says the client is ready, and normal traffic can begin."],
          ].map(([t, d], i) => (
            <li key={t} className="flex gap-3">
              <span className="w-7 h-7 shrink-0 rounded-full bg-emerald-500/20 border border-emerald-500/40 text-emerald-300 flex items-center justify-center text-xs font-bold">{i + 1}</span>
              <div>
                <div className="text-sm font-semibold text-white font-mono">{t}</div>
                <div className="text-sm text-gray-400 leading-relaxed">{d}</div>
              </div>
            </li>
          ))}
        </ol>
        <CodeBlock
          language="json"
          code={`// 1. Client → server
{ "jsonrpc": "2.0", "id": 1, "method": "initialize",
  "params": { "protocolVersion": "2025-11-25",
              "capabilities": { "elicitation": {} },
              "clientInfo": { "name": "my-host", "version": "1.0.0" } } }

// 2. Server → client
{ "jsonrpc": "2.0", "id": 1,
  "result": { "protocolVersion": "2025-11-25",
              "capabilities": { "tools": { "listChanged": true } },
              "serverInfo": { "name": "weather-server", "version": "0.3.0" } } }

// 3. Client → server (a notification: no id)
{ "jsonrpc": "2.0", "method": "notifications/initialized" }`}
        />
        <p className="text-xs text-gray-500 mt-3 leading-relaxed">
          Three message shapes exist: a request (has an <span className="font-mono">id</span> and expects a result), a response
          (echoes that id), and a notification (no id, no reply). The protocol version is a date. Check the
          specification for the current one.
        </p>
      </Section>

      <Section id="session" title="Lab: A Session, Step by Step" lead="One tool call from start to finish. It shows which messages are MCP and which are the model's own API.">
        <SessionLab />
      </Section>

      <Section id="authorization" title="Authorization (OAuth 2.1)" lead="A local stdio server inherits the trust of whoever launched it. A remote server is reached by many users, so MCP builds on OAuth 2.1.">
        <OAuthFlow />
        <div className="mt-5">
          <Note tone="rose">
            <strong>A server must never pass a token it received on to another service.</strong> The token was issued for
            that server only (the audience). Forwarding it lets one service impersonate the user to another, which is the
            confused deputy problem. If the server needs to call an API, it gets its own credential for that API.
          </Note>
        </div>
      </Section>

      <Section id="security" title="Security and Threats" lead="An MCP server is code and text that your agent trusts. Most attacks work by abusing that trust.">
        <div className="overflow-x-auto rounded-xl border border-white/10 mb-6">
          <table className="w-full text-sm text-left min-w-[640px]">
            <thead className="bg-white/5 text-gray-300">
              <tr>
                <th className="p-3">Threat</th>
                <th className="p-3">What happens</th>
                <th className="p-3">Mitigation</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-gray-400">
              {THREATS.map(([t, d, m]) => (
                <tr key={t}>
                  <td className="p-3 text-white font-semibold">{t}</td>
                  <td className="p-3">{d}</td>
                  <td className="p-3 text-emerald-200/90">{m}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <TrifectaLab />
        <p className="text-xs text-gray-500 mt-3">
          See also <a href="#/safety/red-teaming" className="text-blue-400 hover:underline">Red Teaming &amp; Prompt Injection</a>.
        </p>
      </Section>

      <Section id="using" title="Using MCP Servers" lead="The same server works in several places. Pick where you are connecting from.">
        <UsingServers />
      </Section>

      <Section id="building" title="Building a Server" lead="A tool, a resource and a prompt in about twenty lines.">
        <BuildServer />
      </Section>

      <Section id="context-cost" title="Context Cost" lead="Every connected tool's definition is sent on every request. Many servers add up.">
        <ContextCost />
        <div className="mt-5">
          <CodeBlock
            language="python"
            code={`# Allowlist: switch a server's tools off by default, then enable only the ones you need.
# (Shape as documented for the MCP connector; check the current docs for your version.)
tools=[{
    "type": "mcp_toolset",
    "mcp_server_name": "example",
    "default_config": {"enabled": False},
    "configs": {
        "search_tickets": {"enabled": True},
        "get_ticket": {"enabled": True},
    },
}]`}
          />
        </div>
      </Section>

      <Section id="vs-function-calling" title="MCP vs Function Calling vs A2A vs Skills vs Subagents" lead="They overlap in vocabulary and differ in purpose.">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm text-left min-w-[720px]">
            <thead className="bg-white/5 text-gray-300">
              <tr>
                <th className="p-3" />
                <th className="p-3">Connects</th>
                <th className="p-3">Who defines it</th>
                <th className="p-3">Discovery</th>
                <th className="p-3">Use it when</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-gray-400">
              {COMPARE.map(([a, b, c, d, e]) => (
                <tr key={a}>
                  <td className="p-3 text-white font-semibold">{a}</td>
                  <td className="p-3">{b}</td>
                  <td className="p-3">{c}</td>
                  <td className="p-3">{d}</td>
                  <td className="p-3">{e}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p className="text-xs text-gray-500 mt-3">
          Related: <a href="#/agents/a2a" className="text-blue-400 hover:underline">A2A</a>,{" "}
          <a href="#/agents/skills" className="text-blue-400 hover:underline">Agent Skills</a> and{" "}
          <a href="#/agents/tool-calling" className="text-blue-400 hover:underline">tool calling</a>. MCP tools are used by
          the model through ordinary function calling; MCP only standardises where the definitions come from.
        </p>
      </Section>

      <Section id="ecosystem" title="Ecosystem" lead="There are thousands of servers. Treat each as software you are installing.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Registry" tone="indigo"><p>The official MCP Registry is a public catalogue of servers with metadata. It was launched as a preview, so check its current status. Listing is not an endorsement.</p></Card>
          <Card title="Hosts" tone="emerald"><p>Claude apps and Claude Code, several IDEs, and a growing number of assistants and agent frameworks support MCP as clients. Support for advanced features such as sampling and elicitation varies.</p></Card>
          <Card title="Vetting a server" tone="rose"><p>Who maintains it and is it still updated? Read the source and its tool descriptions. Pin a version. Check what scopes and files it wants. Prefer official servers from the service's own vendor.</p></Card>
        </div>
      </Section>

      <Section id="best-practices" title="Best Practices">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Design around tasks" tone="emerald"><p>One tool per user goal (“create a ticket with these fields”), not one per API endpoint. Fewer, richer tools are easier for the model to choose from.</p></Card>
          <Card title="Name tools clearly" tone="blue"><p>Prefix by server (<span className="font-mono">github_create_issue</span>) so names never collide, and start descriptions with what the tool does and when to use it.</p></Card>
          <Card title="Paginate and stay short" tone="amber"><p>Return a page of results with a cursor, not a thousand rows. Return what the model needs, not the raw API response.</p></Card>
          <Card title="Return errors the model can use" tone="rose"><p>Say what was wrong and what to try. “Invalid input” makes the model guess; “date must be YYYY-MM-DD” lets it fix the call.</p></Card>
          <Card title="Version your changes" tone="purple"><p>Renaming a tool or changing an argument breaks prompts and approvals built on it. Add new tools, deprecate old ones, and send list_changed.</p></Card>
          <Card title="Least privilege" tone="indigo"><p>Scope a filesystem server to one folder, a database server to a read-only role, and tokens to the scopes the tools need.</p></Card>
        </div>
      </Section>

      <Section id="debugging" title="Debugging" lead="Most first-time failures are one of these.">
        <div className="overflow-x-auto rounded-xl border border-white/10">
          <table className="w-full text-sm text-left min-w-[640px]">
            <thead className="bg-white/5 text-gray-300">
              <tr>
                <th className="p-3">Symptom</th>
                <th className="p-3">Likely cause</th>
                <th className="p-3">Fix</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10 text-gray-400">
              {DEBUG.map(([s, c, f]) => (
                <tr key={s}>
                  <td className="p-3 text-white font-semibold">{s}</td>
                  <td className="p-3">{c}</td>
                  <td className="p-3">{f}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Section>

      <KnowledgeCheck questions={questionsFor("mcp")} />
    </GuideLayout>
  );
}

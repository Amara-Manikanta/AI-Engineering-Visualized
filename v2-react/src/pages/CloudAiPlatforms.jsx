import React, { useState } from "react";
import GuideLayout from "../components/GuideLayout";
import KnowledgeCheck from "../components/KnowledgeCheck";
import CodeBlock from "../components/CodeBlock";
import { questionsFor } from "../data/quizBank";
import { Panel, Card, Note, Section } from "../components/VizKit";

export const SEARCH_KEYWORDS = [
  "cloud AI platforms", "Amazon Bedrock", "SageMaker", "Bedrock Knowledge Bases", "Bedrock AgentCore",
  "Azure AI Foundry", "Microsoft Foundry", "Azure OpenAI", "Azure Machine Learning", "Azure AI Search",
  "Google Cloud", "GCP", "Vertex AI", "Gemini on Vertex", "Vertex AI Vector Search", "BigQuery", "Cloud Run",
  "GKE", "Compute Engine", "Cloud Storage", "AWS vs Azure vs GCP", "service mapping", "data residency",
  "private networking", "managed ML", "foundation model hosting",
];

/* ---------------------------------------------------------------------------
   Equivalent services across the three big clouds. Names are current as of
   writing; the providers rename things often.
--------------------------------------------------------------------------- */

const ROWS = [
  { need: "Virtual machines (incl. GPUs)", aws: "EC2", azure: "Virtual Machines", gcp: "Compute Engine", cat: "core" },
  { need: "Object storage", aws: "S3", azure: "Blob Storage", gcp: "Cloud Storage", cat: "core" },
  { need: "Managed Kubernetes", aws: "EKS", azure: "AKS", gcp: "GKE", cat: "core" },
  { need: "Serverless containers / functions", aws: "Lambda, Fargate / App Runner", azure: "Functions, Container Apps", gcp: "Cloud Functions, Cloud Run", cat: "core" },
  { need: "Data warehouse", aws: "Redshift", azure: "Microsoft Fabric / Synapse", gcp: "BigQuery", cat: "data" },
  { need: "Identity & access", aws: "IAM", azure: "Microsoft Entra ID + RBAC", gcp: "Cloud IAM", cat: "core" },
  { need: "Foundation models via API", aws: "Amazon Bedrock", azure: "Azure AI Foundry (Azure OpenAI and other models)", gcp: "Vertex AI (Model Garden, Gemini)", cat: "ai" },
  { need: "Train, tune & deploy your own models", aws: "SageMaker AI", azure: "Azure Machine Learning", gcp: "Vertex AI (training, endpoints)", cat: "ai" },
  { need: "Managed RAG", aws: "Bedrock Knowledge Bases", azure: "Azure AI Search + Foundry", gcp: "Vertex AI Search / RAG Engine", cat: "ai" },
  { need: "Vector search", aws: "OpenSearch, Aurora pgvector, S3 Vectors", azure: "Azure AI Search, Cosmos DB, PostgreSQL pgvector", gcp: "Vertex AI Vector Search, AlloyDB / BigQuery vectors", cat: "ai" },
  { need: "Agent building & hosting", aws: "Bedrock Agents / AgentCore", azure: "Foundry Agent Service", gcp: "Vertex AI Agent Builder / Agent Engine", cat: "ai" },
  { need: "Notebooks & ML IDE", aws: "SageMaker Studio", azure: "Azure ML studio", gcp: "Vertex AI Workbench, Colab Enterprise", cat: "ai" },
];

function ServiceMap() {
  const [cat, setCat] = useState("ai");
  const rows = ROWS.filter((r) => cat === "all" || r.cat === cat);
  return (
    <Panel tone="indigo" title="The same need, three clouds">
      <div className="flex flex-wrap gap-1.5 mb-4">
        {[
          ["ai", "AI & ML"],
          ["core", "Core infrastructure"],
          ["data", "Data"],
          ["all", "Everything"],
        ].map(([v, l]) => (
          <button key={v} onClick={() => setCat(v)} aria-pressed={cat === v} className={`px-3 py-1.5 rounded-lg text-xs font-semibold border ${cat === v ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-100" : "border-white/10 bg-white/5 text-gray-400"}`}>
            {l}
          </button>
        ))}
      </div>
      <div className="overflow-x-auto rounded-xl border border-white/10">
        <table className="w-full text-sm min-w-[680px]">
          <thead className="bg-white/5 text-left">
            <tr>
              <th className="p-3 font-medium text-gray-400">Need</th>
              <th className="p-3 font-medium text-orange-300">AWS</th>
              <th className="p-3 font-medium text-sky-300">Azure</th>
              <th className="p-3 font-medium text-emerald-300">Google Cloud</th>
            </tr>
          </thead>
          <tbody className="text-gray-300">
            {rows.map((r) => (
              <tr key={r.need} className="border-t border-white/5 align-top">
                <td className="p-3 text-white">{r.need}</td>
                <td className="p-3 text-xs">{r.aws}</td>
                <td className="p-3 text-xs">{r.azure}</td>
                <td className="p-3 text-xs">{r.gcp}</td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      <p className="text-xs text-gray-500 mt-3 mb-0">Product names change frequently (Azure AI Foundry, for example, has been rebranded); check each provider's current documentation.</p>
    </Panel>
  );
}

export default function CloudAiPlatforms() {
  const toc = [
    { label: "Why Use a Cloud AI Platform", hash: "why" },
    { label: "Service Map", hash: "map" },
    { label: "AWS: Bedrock & SageMaker", hash: "aws" },
    { label: "Azure: AI Foundry & Azure ML", hash: "azure" },
    { label: "Google Cloud: Vertex AI", hash: "gcp" },
    { label: "Choosing", hash: "choosing" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="Cloud AI Platforms"
      intro="How AWS, Azure and Google Cloud package AI: foundation-model APIs (Bedrock, AI Foundry, Vertex AI), managed ML platforms, RAG and vector search, agent services — plus a quick Google Cloud primer and how to choose."
      toc={toc}
    >
      <Section id="why" title="Why Use a Cloud AI Platform" lead="You can call model providers directly. Enterprises often go through their cloud instead, for reasons that have little to do with the models.">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <Card title="Data stays in your account" tone="indigo"><p>Private networking, regional hosting for data residency, and the cloud's existing compliance certifications.</p></Card>
          <Card title="One identity & bill" tone="emerald"><p>Access controlled by the IAM you already use; spend on committed cloud contracts; unified audit logs.</p></Card>
          <Card title="Many models, one API" tone="purple"><p>Several model families behind one service, so switching or mixing models is a configuration change.</p></Card>
          <Card title="Close to the data" tone="amber"><p>Your warehouse, storage and search already live there — managed RAG and agents plug straight into them.</p></Card>
        </div>
        <Note tone="indigo">Trade-offs: new model versions and features can arrive on a cloud later than on the provider's own API, and pricing and quotas differ. Check availability for the exact model and region you need.</Note>
      </Section>

      <Section id="map" title="Service Map">
        <ServiceMap />
      </Section>

      <Section id="aws" title="AWS: Bedrock & SageMaker">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Amazon Bedrock" tone="amber"><p>Serverless access to foundation models from Anthropic (Claude), Amazon, Meta, Mistral and others, with guardrails, model evaluation, fine-tuning for some models, Knowledge Bases for managed RAG, and agent tooling.</p></Card>
          <Card title="SageMaker AI" tone="indigo"><p>The full ML platform: notebooks, training jobs on managed GPU clusters, pipelines, a model registry, and real-time or batch endpoints for your own models, including open-weight LLMs.</p></Card>
          <Card title="Foundations" tone="emerald"><p>The <a href="#/aws" className="text-blue-400 hover:underline">AWS guides</a> cover IAM, VPC networking, EC2 and S3 — the pieces every AI workload sits on.</p></Card>
        </div>
      </Section>

      <Section id="azure" title="Azure: AI Foundry & Azure ML">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Azure AI Foundry" tone="indigo"><p>Microsoft's platform for building generative-AI apps and agents: OpenAI models through Azure OpenAI, plus a catalogue of other models (including Anthropic's Claude), evaluation, content safety and an agent service.</p></Card>
          <Card title="Azure Machine Learning" tone="purple"><p>Workspaces, compute clusters, pipelines, a registry and managed endpoints for classical and custom deep learning models.</p></Card>
          <Card title="Azure AI Search" tone="emerald"><p>Hybrid keyword + vector search with semantic ranking — the usual retrieval layer for RAG on Azure. See the <a href="#/azure" className="text-blue-400 hover:underline">Azure guides</a> for the infrastructure underneath.</p></Card>
        </div>
      </Section>

      <Section id="gcp" title="Google Cloud: Vertex AI" lead="There is no separate Google Cloud section on this site yet, so here is the short primer.">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-5">
          <Card title="Google Cloud in one paragraph" tone="emerald">
            <p>Resources live in <strong>projects</strong> (the unit of billing and access), grouped under folders and an organisation. Access is Cloud IAM roles granted to users and service accounts. Compute Engine runs VMs, Cloud Storage holds objects, GKE runs Kubernetes, and Cloud Run runs containers serverlessly — often the simplest home for an LLM app. BigQuery is the serverless warehouse at the centre of most data work.</p>
          </Card>
          <Card title="Vertex AI" tone="indigo">
            <p>Google's AI platform: Gemini models plus a Model Garden of first- and third-party models (including Claude), tuning, evaluation, Vector Search, RAG Engine, Agent Builder, and custom training and prediction endpoints on GPUs and TPUs.</p>
          </Card>
        </div>
      </Section>

      <Section id="choosing" title="Choosing">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Default: where your data already is" tone="indigo"><p>Egress costs, security reviews and identity integration usually outweigh small differences between AI services.</p></Card>
          <Card title="Check the exact model and region" tone="amber"><p>Not every model version is in every region or on every cloud on day one. Confirm availability, quotas and features (caching, batch, tool use) for your use.</p></Card>
          <Card title="Keep an abstraction seam" tone="emerald"><p>Route model calls through one internal client or gateway so a provider or cloud change touches one module, not the whole codebase.</p></Card>
          <Card title="Direct APIs are fine too" tone="purple"><p>Startups and teams without heavy compliance needs often call model providers directly for the newest features and simplest setup.</p></Card>
        </div>
      </Section>

      <Section id="code" title="In Code" lead="The same Claude request through the first-party API and through each cloud's client. Only the client construction and the model ID format change.">
        <CodeBlock
          language="python"
          code={`import anthropic
from anthropic import AnthropicBedrockMantle, AnthropicVertex, AnthropicFoundry

direct  = anthropic.Anthropic()                                            # Claude API
bedrock = AnthropicBedrockMantle(aws_region="us-east-1")                   # Amazon Bedrock
vertex  = AnthropicVertex(project_id="my-project", region="global")        # Google Vertex AI
foundry = AnthropicFoundry(api_key=FOUNDRY_KEY, resource="my-resource")    # Microsoft Foundry

def ask(client, model: str) -> str:
    msg = client.messages.create(
        model=model, max_tokens=1024,
        messages=[{"role": "user", "content": "Summarise our refund policy in two lines."}],
    )
    return msg.content[0].text

ask(direct,  "claude-opus-5-5")
ask(bedrock, "anthropic.claude-opus-5-5")      # Bedrock IDs carry an 'anthropic.' prefix
ask(vertex,  "claude-opus-5-5")`}
        />
        <p className="text-xs text-gray-500 mt-2">Feature availability differs by platform; check the provider's docs before relying on a specific capability.</p>
      </Section>

      <KnowledgeCheck questions={questionsFor("cloud-ai")} />
    </GuideLayout>
  );
}

import React, { useMemo, useState } from "react";
import GuideLayout from "../components/GuideLayout";
import CodeBlock from "../components/CodeBlock";
import KnowledgeCheck from "../components/KnowledgeCheck";
import { questionsFor } from "../data/quizBank";
import { Panel, Slider, Metric, Card, Note, Section } from "../components/VizKit";
import { normCdf, fmt } from "../lib/stats";

export const SEARCH_KEYWORDS = [
  "MLOps", "machine learning operations", "ML lifecycle", "experiment tracking", "MLflow", "Weights & Biases",
  "model registry", "model versioning", "data versioning", "DVC", "feature store", "Feast", "training-serving skew",
  "CI/CD for ML", "continuous training", "model monitoring", "data drift", "concept drift", "PSI",
  "population stability index", "batch inference", "online inference", "Docker", "Kubernetes", "Kubeflow",
  "Terraform", "infrastructure as code", "reproducibility", "retraining",
];

/* ---------------------------------------------------------------------------
   Population Stability Index between a reference (training) distribution
   N(0,1) and live traffic N(shift, scale), over ten bins cut at the
   reference deciles. Exact normal CDFs, no sampling.
--------------------------------------------------------------------------- */

const DECILE_Z = [-Infinity, -1.2816, -0.8416, -0.5244, -0.2533, 0, 0.2533, 0.5244, 0.8416, 1.2816, Infinity];

function psi(shift, scale) {
  let total = 0;
  const bins = [];
  for (let i = 0; i < 10; i++) {
    const exp = 0.1;
    const lo = DECILE_Z[i];
    const hi = DECILE_Z[i + 1];
    const act = Math.max(1e-6, normCdf((hi - shift) / scale) - normCdf((lo - shift) / scale));
    const term = (act - exp) * Math.log(act / exp);
    total += term;
    bins.push({ exp, act, term });
  }
  return { total, bins };
}

function DriftLab() {
  const [shift, setShift] = useState(0.3);
  const [scale, setScale] = useState(1);
  const res = useMemo(() => psi(shift, scale), [shift, scale]);
  const status = res.total < 0.1 ? ["stable", "emerald"] : res.total < 0.25 ? ["moderate shift — investigate", "amber"] : ["significant shift — act", "rose"];
  const W = 360;
  const H = 150;
  const bw = (W - 20) / 10;
  const maxP = Math.max(0.1, ...res.bins.map((b) => b.act));
  const y = (p) => (p / maxP) * (H - 30);
  return (
    <Panel tone="amber" title="Has live traffic drifted from the training data?">
      <div className="grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_260px] gap-5">
        <svg viewBox={`0 0 ${W} ${H}`} className="w-full h-auto block">
          {res.bins.map((b, i) => (
            <g key={i}>
              <rect x={10 + i * bw + 2} y={H - 20 - y(b.exp)} width={bw / 2 - 3} height={y(b.exp)} fill="rgba(148,163,184,0.6)" />
              <rect x={10 + i * bw + bw / 2} y={H - 20 - y(b.act)} width={bw / 2 - 3} height={y(b.act)} fill="#fbbf24" />
            </g>
          ))}
          <line x1="10" y1={H - 20} x2={W - 10} y2={H - 20} stroke="rgba(255,255,255,0.2)" />
          <text x="10" y={H - 6} fill="#6b7280" fontSize="10">lowest decile of training data</text>
          <text x={W - 10} y={H - 6} fill="#6b7280" fontSize="10" textAnchor="end">highest</text>
          <text x="12" y="12" fill="#94a3b8" fontSize="10">training (10% per bin)</text>
          <text x="12" y="26" fill="#fbbf24" fontSize="10">live traffic</text>
        </svg>
        <div className="space-y-3">
          <Slider tone="amber" label="Shift in the mean (σ)" value={shift} min={-1.5} max={1.5} step={0.05} onChange={setShift} format={(v) => (v > 0 ? `+${v.toFixed(2)}` : v.toFixed(2))} />
          <Slider tone="amber" label="Change in spread (× σ)" value={scale} min={0.5} max={2} step={0.05} onChange={setScale} format={(v) => `${v.toFixed(2)}×`} />
          <Metric label="PSI" value={fmt(res.total, 3)} tone={status[1]} sub={status[0]} />
        </div>
      </div>
      <p className="text-xs text-gray-500 leading-relaxed mt-4 mb-0">
        PSI = Σ (live% − train%) · ln(live% / train%) over bins set by the training data. Common rules of thumb:
        below 0.1 stable, 0.1–0.25 worth a look, above 0.25 a real shift. Drift in inputs does not always hurt
        accuracy, and accuracy can drop with no input drift at all (concept drift — the relationship itself
        changed). Track both, and treat PSI as an alarm, not a diagnosis.
      </p>
    </Panel>
  );
}

const STAGES = [
  ["Data", "Versioned datasets, validation checks, lineage", "indigo"],
  ["Experiment", "Tracked runs: code, data, params, metrics", "purple"],
  ["Register", "Model registry with versions and stages", "emerald"],
  ["Deploy", "Container, API or batch job via CI/CD", "amber"],
  ["Monitor", "Drift, quality, latency, cost", "rose"],
  ["Retrain", "Triggered by schedule, drift or new labels", "blue"],
];

export default function Mlops() {
  const toc = [
    { label: "Why MLOps", hash: "why" },
    { label: "The Lifecycle", hash: "lifecycle" },
    { label: "Tracking & Registry", hash: "tracking" },
    { label: "Data, Features & Skew", hash: "features" },
    { label: "Serving Patterns", hash: "serving" },
    { label: "CI/CD & Infrastructure", hash: "cicd" },
    { label: "Monitoring & Drift", hash: "monitoring" },
    { label: "In Code", hash: "code" },
  ];

  return (
    <GuideLayout
      title="MLOps"
      intro="The engineering that keeps models useful after the notebook: experiment tracking and a model registry, versioned data and feature stores, serving patterns, CI/CD and infrastructure as code, and monitoring for drift — with a live PSI calculator."
      toc={toc}
    >
      <Section id="why" title="Why MLOps" lead="In production, a model is a small part of the system. Most of the work — and most of the failures — are in data pipelines, deployment, monitoring and the feedback loop.">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Reproducibility" tone="indigo"><p>Which data, code and parameters produced the model in production? Without tracking, nobody can say — or rebuild it.</p></Card>
          <Card title="Models decay" tone="rose"><p>The world changes: prices, user behaviour, fraud patterns. A model that was good at launch silently gets worse.</p></Card>
          <Card title="Many models, many teams" tone="amber"><p>Shared tooling for training, review, deployment and rollback turns one-off heroics into a repeatable process.</p></Card>
        </div>
        <Note tone="indigo">For LLM applications — prompts, evals, traces, token costs — see the companion page <a href="#/llm-production" className="text-blue-400 hover:underline">LLM Apps in Production</a>.</Note>
      </Section>

      <Section id="lifecycle" title="The Lifecycle">
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
          {STAGES.map(([t, d, tone], i) => (
            <Card key={t} title={`${i + 1}. ${t}`} tone={tone}><p>{d}</p></Card>
          ))}
        </div>
      </Section>

      <Section id="tracking" title="Tracking & Registry">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Experiment tracking" tone="purple"><p>Log every run's parameters, metrics, artefacts, code version and data version (MLflow, Weights & Biases, and the managed equivalents in each cloud). Compare runs instead of remembering them.</p></Card>
          <Card title="Model registry" tone="emerald"><p>A catalogue of model versions with lineage back to the run that produced them, review status and aliases like “champion” and “challenger”. Deployment pulls from the registry, never from a laptop.</p></Card>
          <Card title="Data versioning" tone="indigo"><p>Datasets change. Version them (DVC, lakeFS, table snapshots such as Delta or Iceberg time travel) so any model can be tied to the exact data it saw.</p></Card>
        </div>
      </Section>

      <Section id="features" title="Data, Features & Skew">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Training–serving skew" tone="rose"><p>The classic production bug: a feature computed one way in the training notebook and another way in the live service. The model sees inputs it was never trained on.</p></Card>
          <Card title="Feature store" tone="emerald"><p>One definition per feature, served from an offline store for training (with point-in-time correct joins) and a low-latency online store for inference (Feast, Tecton, cloud feature stores).</p></Card>
          <Card title="Validate data" tone="amber"><p>Schema, ranges, null rates and distributions checked on every batch before training or scoring (Great Expectations, Pandera, TFDV).</p></Card>
        </div>
      </Section>

      <Section id="serving" title="Serving Patterns">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card title="Batch" tone="indigo"><p>Score everything on a schedule and write results to a table — churn scores nightly, recommendations hourly. Simplest and cheapest.</p></Card>
          <Card title="Online" tone="emerald"><p>A request/response API (FastAPI, BentoML, KServe, managed endpoints) for decisions needed in milliseconds — fraud checks, ranking.</p></Card>
          <Card title="Streaming" tone="amber"><p>Score events as they arrive from Kafka or Kinesis, with features computed over sliding windows.</p></Card>
        </div>
      </Section>

      <Section id="cicd" title="CI/CD & Infrastructure">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card title="Test more than code" tone="indigo"><p>CI runs unit tests plus data validation, a training smoke test on a sample, and an evaluation gate: the candidate must beat the current champion on a fixed holdout before promotion.</p></Card>
          <Card title="Continuous training" tone="purple"><p>Pipelines (Airflow, Kubeflow, Prefect, SageMaker Pipelines, Vertex AI Pipelines, Azure ML pipelines) retrain on a schedule or trigger, then register, evaluate and deploy automatically with approval gates.</p></Card>
          <Card title="Containers & Kubernetes" tone="emerald"><p>Package model and code in a container image with pinned dependencies; run it on Kubernetes or a managed service with autoscaling and GPU scheduling. See <a href="#/azure/aks" className="text-blue-400 hover:underline">AKS</a>.</p></Card>
          <Card title="Infrastructure as code" tone="amber"><p>Define clusters, buckets, endpoints and permissions in Terraform (or CloudFormation, Bicep, Pulumi) so environments are reviewable, reproducible and identical across dev, staging and production.</p></Card>
        </div>
      </Section>

      <Section id="monitoring" title="Monitoring & Drift">
        <DriftLab />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-5">
          <Card title="Data drift" tone="amber"><p>Input distributions change (new customer segments, a sensor recalibrated). Measured with PSI, KL divergence or statistical tests per feature.</p></Card>
          <Card title="Concept drift" tone="rose"><p>The relationship between inputs and the target changes (fraudsters adapt). Only visible when labels arrive — track accuracy on recent labelled data.</p></Card>
          <Card title="Operational" tone="indigo"><p>Latency, error rate, throughput, cost, and the share of predictions made on missing or default feature values.</p></Card>
        </div>
      </Section>

      <Section id="code" title="In Code">
        <CodeBlock
          language="python"
          code={`import mlflow
from mlflow.models import infer_signature
from sklearn.ensemble import HistGradientBoostingClassifier
from sklearn.metrics import average_precision_score

mlflow.set_experiment("churn")
with mlflow.start_run() as run:
    params = {"learning_rate": 0.05, "max_depth": 6}
    model = HistGradientBoostingClassifier(**params).fit(X_train, y_train)
    ap = average_precision_score(y_val, model.predict_proba(X_val)[:, 1])

    mlflow.log_params(params)
    mlflow.log_metric("val_average_precision", ap)
    mlflow.log_param("data_version", DATA_SNAPSHOT_ID)
    mlflow.sklearn.log_model(
        model, name="model",
        signature=infer_signature(X_val, model.predict_proba(X_val)),
        registered_model_name="churn-classifier",   # creates a new registry version
    )

# Promote only if it beats the current champion on the same holdout
client = mlflow.MlflowClient()
# … compare metrics, then:
# client.set_registered_model_alias("churn-classifier", "champion", new_version)`}
        />
      </Section>

      <KnowledgeCheck questions={questionsFor("mlops")} />
    </GuideLayout>
  );
}

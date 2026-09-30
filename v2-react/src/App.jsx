import { lazy, Suspense, useLayoutEffect } from "react";
import { HashRouter, Routes, Route, Navigate, useLocation } from "react-router-dom";
import { MotionConfig } from "framer-motion";
import NotFound from "./pages/NotFound";
import Home from "./pages/Home";
const DocumentLoaders = lazy(() => import("./pages/DocumentLoaders"));
const Langchain = lazy(() => import("./pages/Langchain"));
const RagFundamentals = lazy(() => import("./pages/RagFundamentals"));
const RagVectorDbs = lazy(() => import("./pages/RagVectorDbs"));
const RagAdvanced = lazy(() => import("./pages/RagAdvanced"));
const LlmIndex = lazy(() => import("./pages/LlmIndex"));
const LlmModelTypes = lazy(() => import("./pages/LlmModelTypes"));
const GenAiIndex = lazy(() => import("./pages/GenAiIndex"));
const GenAiFineTuning = lazy(() => import("./pages/GenAiFineTuning"));
const GenAiQuantization = lazy(() => import("./pages/GenAiQuantization"));
const GenAiAgi = lazy(() => import("./pages/GenAiAgi"));
const PythonIndex = lazy(() => import("./pages/PythonIndex"));
const PythonFoundations = lazy(() => import("./pages/python/PythonFoundations"));
const PythonDataStructures = lazy(() => import("./pages/python/PythonDataStructures"));
const PythonAdvanced = lazy(() => import("./pages/python/PythonAdvanced"));
const PythonToolingAsync = lazy(() => import("./pages/python/PythonToolingAsync"));
const PythonDataScience = lazy(() => import("./pages/python/PythonDataScience"));
const PythonRegex = lazy(() => import("./pages/python/PythonRegex"));
const AgentsIndex = lazy(() => import("./pages/AgentsIndex"));
const AgentsToolCalling = lazy(() => import("./pages/AgentsToolCalling"));
const AgentsMemory = lazy(() => import("./pages/AgentsMemory"));
const AgentsMultiAgent = lazy(() => import("./pages/AgentsMultiAgent"));
const MlIndex = lazy(() => import("./pages/MlIndex"));
const MlSupervised = lazy(() => import("./pages/MlSupervised"));
const MlUnsupervised = lazy(() => import("./pages/MlUnsupervised"));
const MlDeepLearning = lazy(() => import("./pages/MlDeepLearning"));
const ModelsIndex = lazy(() => import("./pages/ModelsIndex"));
const ModelsAnthropic = lazy(() => import("./pages/ModelsAnthropic"));
const ModelsGemini = lazy(() => import("./pages/ModelsGemini"));
const ModelsGpt = lazy(() => import("./pages/ModelsGpt"));
const ModelsLlama = lazy(() => import("./pages/ModelsLlama"));
const ModelsMistral = lazy(() => import("./pages/ModelsMistral"));
const ModelsQwen = lazy(() => import("./pages/ModelsQwen"));
const ModelsDeepseek = lazy(() => import("./pages/ModelsDeepseek"));
const ModelsGrok = lazy(() => import("./pages/ModelsGrok"));
const ModelsGemma = lazy(() => import("./pages/ModelsGemma"));
const ModelsCommandR = lazy(() => import("./pages/ModelsCommandR"));
const ModelsPhi = lazy(() => import("./pages/ModelsPhi"));
const ModelsTraining = lazy(() => import("./pages/ModelsTraining"));
const McpIndex = lazy(() => import("./pages/McpIndex"));
const PromptingIndex = lazy(() => import("./pages/PromptingIndex"));
const EmbeddingsIndex = lazy(() => import("./pages/EmbeddingsIndex"));

// Part 4 Missing Imports
const RagIndex = lazy(() => import("./pages/RagIndex"));
const RagRetrieval = lazy(() => import("./pages/RagRetrieval"));
const RagEvaluation = lazy(() => import("./pages/RagEvaluation"));
const RagDataPrep = lazy(() => import("./pages/RagDataPrep"));
const RagAdvancedRetrieval = lazy(() => import("./pages/RagAdvancedRetrieval"));
const RagGeneration = lazy(() => import("./pages/RagGeneration"));
const RagChunking = lazy(() => import("./pages/RagChunking"));
const RagHybrid = lazy(() => import("./pages/RagHybrid"));
const RagGraph = lazy(() => import("./pages/RagGraph"));
const RagAgentic = lazy(() => import("./pages/RagAgentic"));
const RagIndexing = lazy(() => import("./pages/RagIndexing"));
const RagCrag = lazy(() => import("./pages/RagCrag"));
const RagDevelopment = lazy(() => import("./pages/RagDevelopment"));
const RagMultimodal = lazy(() => import("./pages/RagMultimodal"));
const RagTypes = lazy(() => import("./pages/RagTypes"));
const RagNaive = lazy(() => import("./pages/RagNaive"));
const RagSelf = lazy(() => import("./pages/RagSelf"));
const RagEmbeddings = lazy(() => import("./pages/RagEmbeddings"));
const MlNlp = lazy(() => import("./pages/MlNlp"));
const MlLogistic = lazy(() => import("./pages/MlLogistic"));
const MlDecisionTrees = lazy(() => import("./pages/MlDecisionTrees"));
const MlLinear = lazy(() => import("./pages/MlLinear"));
const MlKnn = lazy(() => import("./pages/MlKnn"));
const MlMultiple = lazy(() => import("./pages/MlMultiple"));
const MlTransformers = lazy(() => import("./pages/MlTransformers"));
const MlRandomForests = lazy(() => import("./pages/MlRandomForests"));
const MlSvm = lazy(() => import("./pages/MlSvm"));
const MlXgboost = lazy(() => import("./pages/MlXgboost"));
const MlCnn = lazy(() => import("./pages/MlCnn"));
const MlRnn = lazy(() => import("./pages/MlRnn"));
const MlGans = lazy(() => import("./pages/MlGans"));
const MlMamba = lazy(() => import("./pages/MlMamba"));
const MlRwkv = lazy(() => import("./pages/MlRwkv"));
const DataSourcing = lazy(() => import("./pages/DataSourcing"));
const MlNaiveBayes = lazy(() => import("./pages/MlNaiveBayes"));
const MlReinforcement = lazy(() => import("./pages/MlReinforcement"));
const MlRlhf = lazy(() => import("./pages/MlRlhf"));
const MlDpo = lazy(() => import("./pages/MlDpo"));
const MlGrpo = lazy(() => import("./pages/MlGrpo"));
const MlRlaif = lazy(() => import("./pages/MlRlaif"));
const DataCleaning = lazy(() => import("./pages/DataCleaning"));
const DataAnalysis = lazy(() => import("./pages/DataAnalysis"));
const BivariateAnalysis = lazy(() => import("./pages/BivariateAnalysis"));
const InferentialStatistics = lazy(() => import("./pages/InferentialStatistics"));
const CentralLimitTheorem = lazy(() => import("./pages/CentralLimitTheorem"));
const HypothesisTesting = lazy(() => import("./pages/HypothesisTesting"));
const GenAiPeft = lazy(() => import("./pages/GenAiPeft"));
const GenAiLora = lazy(() => import("./pages/GenAiLora"));
const GenAiQlora = lazy(() => import("./pages/GenAiQlora"));
const GenAiDora = lazy(() => import("./pages/GenAiDora"));
const GenAiPrefixTuning = lazy(() => import("./pages/GenAiPrefixTuning"));
const GenAiIa3 = lazy(() => import("./pages/GenAiIa3"));
const GenAiAdapterLayers = lazy(() => import("./pages/GenAiAdapterLayers"));
const GenAiDistillation = lazy(() => import("./pages/GenAiDistillation"));
const GenAiTokenization = lazy(() => import("./pages/GenAiTokenization"));
const GenAiDecisionModels = lazy(() => import("./pages/GenAiDecisionModels"));
const RagCompression = lazy(() => import("./pages/RagCompression"));
const RagVsFineTuning = lazy(() => import("./pages/RagVsFineTuning"));
const AgentsFrameworks = lazy(() => import("./pages/AgentsFrameworks"));
const AgentsA2A = lazy(() => import("./pages/AgentsA2A"));
const AgentsDebugging = lazy(() => import("./pages/AgentsDebugging"));
const TopicGraph = lazy(() => import("./pages/TopicGraph"));
const QuizIndex = lazy(() => import("./pages/QuizIndex"));

const MlEvaluationMetrics = lazy(() => import("./pages/MlEvaluationMetrics"));
const MlRegularization = lazy(() => import("./pages/MlRegularization"));
const MlClustering = lazy(() => import("./pages/MlClustering"));
const MlDimensionality = lazy(() => import("./pages/MlDimensionality"));
const MlOptimization = lazy(() => import("./pages/MlOptimization"));
const RagIngestion = lazy(() => import("./pages/RagIngestion"));
const MlFeatureEngineering = lazy(() => import("./pages/MlFeatureEngineering"));
const MlRecommenders = lazy(() => import("./pages/MlRecommenders"));
const MlAnomaly = lazy(() => import("./pages/MlAnomaly"));
const MlTimeSeries = lazy(() => import("./pages/MlTimeSeries"));
const RagLateInteraction = lazy(() => import("./pages/RagLateInteraction"));
const GenAiDistributed = lazy(() => import("./pages/GenAiDistributed"));
const GenAiServing = lazy(() => import("./pages/GenAiServing"));
const GenAiDecoding = lazy(() => import("./pages/GenAiDecoding"));
const AgentsSdks = lazy(() => import("./pages/AgentsSdks"));
const GenAiReasoning = lazy(() => import("./pages/GenAiReasoning"));
const GenAiMerging = lazy(() => import("./pages/GenAiMerging"));
const GenAiMultimodal = lazy(() => import("./pages/GenAiMultimodal"));
const SafetyGovernance = lazy(() => import("./pages/SafetyGovernance"));
const SafetyRedTeaming = lazy(() => import("./pages/SafetyRedTeaming"));
const LlmProduction = lazy(() => import("./pages/LlmProduction"));
const RagTextToSql = lazy(() => import("./pages/RagTextToSql"));
const Mlops = lazy(() => import("./pages/Mlops"));
const CloudAiPlatforms = lazy(() => import("./pages/CloudAiPlatforms"));
const MlTransferLearning = lazy(() => import("./pages/MlTransferLearning"));
const MlGnn = lazy(() => import("./pages/MlGnn"));
const LlmInference = lazy(() => import("./pages/LlmInference"));
const InteractiveIndex = lazy(() => import("./pages/InteractiveIndex"));
const EfficiencyIndex = lazy(() => import("./pages/EfficiencyIndex"));
const RoadmapsIndex = lazy(() => import("./pages/RoadmapsIndex"));
const SafetyIndex = lazy(() => import("./pages/SafetyIndex"));
const SystemDesignIndex = lazy(() => import("./pages/SystemDesignIndex"));
const GlossaryIndex = lazy(() => import("./pages/GlossaryIndex"));
const ProjectsIndex = lazy(() => import("./pages/ProjectsIndex"));
const ResourcesIndex = lazy(() => import("./pages/ResourcesIndex"));
const AzureIndex = lazy(() => import("./pages/AzureIndex"));
const AzureBasics = lazy(() => import("./pages/AzureBasics"));
const AzureInfrastructure = lazy(() => import("./pages/AzureInfrastructure"));
const AzureIdentity = lazy(() => import("./pages/AzureIdentity"));
const AzureVms = lazy(() => import("./pages/AzureVms"));
const AzureStorage = lazy(() => import("./pages/AzureStorage"));
const AzureNetworking = lazy(() => import("./pages/AzureNetworking"));
const AzureLoadBalancer = lazy(() => import("./pages/AzureLoadBalancer"));
const AzureDns = lazy(() => import("./pages/AzureDns"));
const AzureAppService = lazy(() => import("./pages/AzureAppService"));
const AzureAks = lazy(() => import("./pages/AzureAks"));
const AzureMonitoring = lazy(() => import("./pages/AzureMonitoring"));
const AzureSecurity = lazy(() => import("./pages/AzureSecurity"));
const AzureBackup = lazy(() => import("./pages/AzureBackup"));
const AzureArchitecture = lazy(() => import("./pages/AzureArchitecture"));

const AwsIndex = lazy(() => import("./pages/AwsIndex"));
const AwsBasics = lazy(() => import("./pages/AwsBasics"));
const AwsInfrastructure = lazy(() => import("./pages/AwsInfrastructure"));
const AwsIam = lazy(() => import("./pages/AwsIam"));
const AwsEc2 = lazy(() => import("./pages/AwsEc2"));
const AwsStorage = lazy(() => import("./pages/AwsStorage"));
const AwsNetworking = lazy(() => import("./pages/AwsNetworking"));
const AwsLoadBalancer = lazy(() => import("./pages/AwsLoadBalancer"));
const AwsDns = lazy(() => import("./pages/AwsDns"));

// Shown only while a route's chunk is still downloading.
function RouteFallback() {
  return (
    <div className="min-h-screen bg-[#0a0a0a] flex items-center justify-center">
      <div className="flex items-center gap-3 text-gray-500 text-sm">
        <span className="w-4 h-4 rounded-full border-2 border-gray-700 border-t-indigo-500 animate-spin" />
        Loading…
      </div>
    </div>
  );
}

// HashRouter keeps the window's scroll position across navigations, so a new
// page would open wherever the previous one was scrolled to. Reset to the top
// on every page change; links to "#/page#section" are scrolled by GuideLayout.
// The Claude page became the Anthropic page; keep old links (and their section) working.
function ClaudeRedirect() {
  const { hash } = useLocation();
  return <Navigate to={{ pathname: "/models/anthropic", hash }} replace />;
}

// The AGI case study moved from GenAI to Models; keep old links working.
function AgiRedirect() {
  const { hash } = useLocation();
  return <Navigate to={{ pathname: "/models/agi-claims", hash }} replace />;
}

function ScrollToTop() {
  const { pathname, hash } = useLocation();
  useLayoutEffect(() => {
    if (!hash) window.scrollTo(0, 0);
    // eslint-disable-next-line react-hooks/exhaustive-deps -- only a page change resets scroll
  }, [pathname]);
  return null;
}

function App() {
  return (
    <HashRouter>
      {/* "user": framer-motion skips transform animations when the OS asks for reduced motion */}
      <MotionConfig reducedMotion="user">
      <ScrollToTop />
      <Suspense fallback={<RouteFallback />}>
      <Routes>
        <Route path="/" element={<Home />} />
        <Route path="/agents" element={<AgentsIndex />} />
        <Route path="/agents/tool-calling" element={<AgentsToolCalling />} />
        <Route path="/agents/memory" element={<AgentsMemory />} />
        <Route path="/agents/multi-agent" element={<AgentsMultiAgent />} />
        <Route path="/agents/document-loaders" element={<DocumentLoaders />} />
        <Route path="/agents/langchain" element={<Langchain />} />
        <Route path="/agents/frameworks" element={<AgentsFrameworks />} />
        <Route path="/agents/a2a" element={<AgentsA2A />} />
        <Route path="/agents/debugging" element={<AgentsDebugging />} />
        <Route path="/agents/sdks" element={<AgentsSdks />} />
        
        <Route path="/rag" element={<RagIndex />} />
        <Route path="/rag/fundamentals" element={<RagFundamentals />} />
        <Route path="/rag/ingestion" element={<RagIngestion />} />
        <Route path="/rag/vector-dbs" element={<RagVectorDbs />} />
        <Route path="/rag/advanced-rag" element={<RagAdvanced />} />
        <Route path="/rag/retrieval" element={<RagRetrieval />} />
        <Route path="/rag/evaluation" element={<RagEvaluation />} />
        <Route path="/rag/data-prep" element={<RagDataPrep />} />
        <Route path="/rag/advanced-retrieval" element={<RagAdvancedRetrieval />} />
        <Route path="/rag/late-interaction" element={<RagLateInteraction />} />
        <Route path="/rag/text-to-sql" element={<RagTextToSql />} />
        <Route path="/rag/generation" element={<RagGeneration />} />
        <Route path="/rag/chunking" element={<RagChunking />} />
        <Route path="/rag/hybrid-rag" element={<RagHybrid />} />
        <Route path="/rag/graph-rag" element={<RagGraph />} />
        <Route path="/rag/agentic-rag" element={<RagAgentic />} />
        <Route path="/rag/indexing" element={<RagIndexing />} />
        <Route path="/rag/crag" element={<RagCrag />} />
        <Route path="/rag/development" element={<RagDevelopment />} />
        <Route path="/rag/multimodal-rag" element={<RagMultimodal />} />
        <Route path="/rag/types-of-rag" element={<RagTypes />} />
        <Route path="/rag/naive-rag" element={<RagNaive />} />
        <Route path="/rag/self-rag" element={<RagSelf />} />
        <Route path="/rag/embeddings" element={<RagEmbeddings />} />
        <Route path="/rag/compression" element={<RagCompression />} />
        <Route path="/rag/vs-fine-tuning" element={<RagVsFineTuning />} />

        <Route path="/llms" element={<LlmIndex />} />
        <Route path="/llms/types" element={<LlmModelTypes />} />
        {/* The six model types used to be separate pages; old links land on their section. */}
        {["llm", "vlm", "slm", "moe", "lcm", "lam"].map((t) => (
          <Route key={t} path={`/llms/${t}-type`} element={<Navigate to={`/llms/types#${t}`} replace />} />
        ))}

        <Route path="/genai" element={<GenAiIndex />} />
        <Route path="/genai/fine-tuning" element={<GenAiFineTuning />} />
        <Route path="/genai/quantization" element={<GenAiQuantization />} />
        <Route path="/models/agi-claims" element={<GenAiAgi />} />
        <Route path="/genai/agi" element={<AgiRedirect />} />
        <Route path="/genai/peft" element={<GenAiPeft />} />
        <Route path="/genai/peft/lora" element={<GenAiLora />} />
        <Route path="/genai/peft/qlora" element={<GenAiQlora />} />
        <Route path="/genai/peft/dora" element={<GenAiDora />} />
        <Route path="/genai/peft/prefix-tuning" element={<GenAiPrefixTuning />} />
        <Route path="/genai/peft/ia3" element={<GenAiIa3 />} />
        <Route path="/genai/peft/adapters" element={<GenAiAdapterLayers />} />
        <Route path="/genai/distillation" element={<GenAiDistillation />} />
        <Route path="/genai/tokenization" element={<GenAiTokenization />} />
        <Route path="/genai/decision-models" element={<GenAiDecisionModels />} />
        <Route path="/genai/distributed-training" element={<GenAiDistributed />} />
        <Route path="/genai/serving" element={<GenAiServing />} />
        <Route path="/genai/decoding" element={<GenAiDecoding />} />
        <Route path="/genai/reasoning-models" element={<GenAiReasoning />} />
        <Route path="/genai/model-merging" element={<GenAiMerging />} />
        <Route path="/genai/multimodal-generation" element={<GenAiMultimodal />} />
        
        <Route path="/python" element={<PythonIndex />} />
        <Route path="/python/foundations" element={<PythonFoundations />} />
        <Route path="/python/data-structures" element={<PythonDataStructures />} />
        <Route path="/python/advanced" element={<PythonAdvanced />} />
        <Route path="/python/tooling-async" element={<PythonToolingAsync />} />
        <Route path="/python/data-science" element={<PythonDataScience />} />
        <Route path="/python/regex" element={<PythonRegex />} />
        
        <Route path="/ml" element={<MlIndex />} />
        <Route path="/ml/supervised" element={<MlSupervised />} />
        <Route path="/ml/unsupervised" element={<MlUnsupervised />} />
        <Route path="/ml/evaluation-metrics" element={<MlEvaluationMetrics />} />
        <Route path="/ml/regularization" element={<MlRegularization />} />
        <Route path="/ml/clustering" element={<MlClustering />} />
        <Route path="/ml/dimensionality-reduction" element={<MlDimensionality />} />
        <Route path="/ml/optimization" element={<MlOptimization />} />
        <Route path="/ml/feature-engineering" element={<MlFeatureEngineering />} />
        <Route path="/ml/recommenders" element={<MlRecommenders />} />
        <Route path="/ml/anomaly-detection" element={<MlAnomaly />} />
        <Route path="/ml/time-series" element={<MlTimeSeries />} />
        <Route path="/ml/transfer-learning" element={<MlTransferLearning />} />
        <Route path="/ml/graph-neural-networks" element={<MlGnn />} />
        <Route path="/ml/deep-learning" element={<MlDeepLearning />} />
        <Route path="/ml/nlp" element={<MlNlp />} />
        <Route path="/ml/logistic-regression" element={<MlLogistic />} />
        <Route path="/ml/decision-trees" element={<MlDecisionTrees />} />
        <Route path="/ml/linear-regression" element={<MlLinear />} />
        <Route path="/ml/knn" element={<MlKnn />} />
        <Route path="/ml/multiple-regression" element={<MlMultiple />} />
        <Route path="/ml/transformers" element={<MlTransformers />} />
        <Route path="/ml/random-forests" element={<MlRandomForests />} />
        <Route path="/ml/svm" element={<MlSvm />} />
        <Route path="/ml/xgboost" element={<MlXgboost />} />
        <Route path="/ml/cnn" element={<MlCnn />} />
        <Route path="/ml/rnn" element={<MlRnn />} />
        <Route path="/ml/gans" element={<MlGans />} />
        <Route path="/ml/mamba" element={<MlMamba />} />
        <Route path="/ml/rwkv" element={<MlRwkv />} />
        <Route path="/ml/data-sourcing" element={<DataSourcing />} />
        <Route path="/ml/naive-bayes" element={<MlNaiveBayes />} />
        <Route path="/ml/reinforcement-learning" element={<MlReinforcement />} />
        <Route path="/ml/rlhf" element={<MlRlhf />} />
        <Route path="/ml/dpo" element={<MlDpo />} />
        <Route path="/ml/grpo" element={<MlGrpo />} />
        <Route path="/ml/rlaif" element={<MlRlaif />} />
        <Route path="/ml/data-cleaning" element={<DataCleaning />} />
        <Route path="/ml/data-analysis" element={<DataAnalysis />} />
        <Route path="/ml/bivariate-analysis" element={<BivariateAnalysis />} />
        <Route path="/ml/inferential-statistics" element={<InferentialStatistics />} />
        <Route path="/ml/central-limit-theorem" element={<CentralLimitTheorem />} />
        <Route path="/ml/hypothesis-testing" element={<HypothesisTesting />} />

        <Route path="/models" element={<ModelsIndex />} />
        <Route path="/models/anthropic" element={<ModelsAnthropic />} />
        <Route path="/models/claude" element={<ClaudeRedirect />} />
        <Route path="/models/gemini" element={<ModelsGemini />} />
        <Route path="/models/gpt" element={<ModelsGpt />} />
        <Route path="/models/llama" element={<ModelsLlama />} />
        <Route path="/models/mistral" element={<ModelsMistral />} />
        <Route path="/models/qwen" element={<ModelsQwen />} />
        <Route path="/models/deepseek" element={<ModelsDeepseek />} />
        <Route path="/models/grok" element={<ModelsGrok />} />
        <Route path="/models/gemma" element={<ModelsGemma />} />
        <Route path="/models/command-r" element={<ModelsCommandR />} />
        <Route path="/models/phi" element={<ModelsPhi />} />
        <Route path="/models/training" element={<ModelsTraining />} />

        
        <Route path="/mcp" element={<McpIndex />} />
        <Route path="/prompting" element={<PromptingIndex />} />
        <Route path="/embeddings" element={<EmbeddingsIndex />} />
        

        <Route path="/llm-inference" element={<LlmInference />} />
        <Route path="/llm-production" element={<LlmProduction />} />
        <Route path="/mlops" element={<Mlops />} />
        
        <Route path="/azure" element={<AzureIndex />} />
        <Route path="/azure/basics" element={<AzureBasics />} />
        <Route path="/azure/infrastructure" element={<AzureInfrastructure />} />
        <Route path="/azure/identity" element={<AzureIdentity />} />
        <Route path="/azure/vms" element={<AzureVms />} />
        <Route path="/azure/storage" element={<AzureStorage />} />
        <Route path="/azure/networking" element={<AzureNetworking />} />
        <Route path="/azure/load-balancer" element={<AzureLoadBalancer />} />
        <Route path="/azure/dns" element={<AzureDns />} />
        <Route path="/azure/app-service" element={<AzureAppService />} />
        <Route path="/azure/aks" element={<AzureAks />} />
        <Route path="/azure/monitoring" element={<AzureMonitoring />} />
        <Route path="/azure/security" element={<AzureSecurity />} />
        <Route path="/azure/backup" element={<AzureBackup />} />
        <Route path="/azure/architecture" element={<AzureArchitecture />} />

        <Route path="/aws" element={<AwsIndex />} />
        <Route path="/aws/basics" element={<AwsBasics />} />
        <Route path="/aws/infrastructure" element={<AwsInfrastructure />} />
        <Route path="/aws/iam" element={<AwsIam />} />
        <Route path="/aws/ec2" element={<AwsEc2 />} />
        <Route path="/aws/storage" element={<AwsStorage />} />
        <Route path="/aws/networking" element={<AwsNetworking />} />
        <Route path="/aws/load-balancer" element={<AwsLoadBalancer />} />
        <Route path="/aws/dns" element={<AwsDns />} />
        <Route path="/cloud/ai-platforms" element={<CloudAiPlatforms />} />

        <Route path="/efficiency" element={<EfficiencyIndex />} />
        <Route path="/interactive" element={<InteractiveIndex />} />
        <Route path="/playgrounds" element={<InteractiveIndex />} />
        <Route path="/animations" element={<InteractiveIndex />} />
        <Route path="/roadmaps" element={<RoadmapsIndex />} />
        <Route path="/safety" element={<SafetyIndex />} />
        <Route path="/safety/red-teaming" element={<SafetyRedTeaming />} />
        <Route path="/safety/governance" element={<SafetyGovernance />} />
        <Route path="/system-design" element={<SystemDesignIndex />} />
        <Route path="/glossary" element={<GlossaryIndex />} />
        <Route path="/graph" element={<TopicGraph />} />
        <Route path="/quizzes" element={<QuizIndex />} />
        <Route path="/projects" element={<ProjectsIndex />} />
        <Route path="/resources" element={<ResourcesIndex />} />

        {/* Catch-all: unknown URLs get a helpful page, not a blank screen */}
        <Route path="*" element={<NotFound />} />
      </Routes>
      </Suspense>
      </MotionConfig>
    </HashRouter>
  );
}

export default App;

import GlobalHeader from "../components/GlobalHeader";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import {
  Code,
  Brain,
  Sparkles,
  Database,
  Cpu,
  Bot,
  ArrowRight,
  Plug,
  MessageSquare,
  Wand2,
  Layers,
  Gauge,
  Cloud,
  Rocket,
  BookOpen,
  Map as MapIcon,
  Network,
  ListChecks,
  BookA,
  MousePointerClick,
  ShieldCheck,
  Boxes,
  Zap,
  Server,
  Compass,
} from "lucide-react";
import { useReadPages } from "../lib/progress";
import { SECTION_THEMES } from "../lib/sectionTheme";

export default function Home() {
  const readPages = useReadPages();
  const readCount = readPages.size;

  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.08,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 16 },
    show: { opacity: 1, y: 0, transition: { duration: 0.45, ease: "easeOut" } },
  };

  const getSectionReadCount = (prefix) => {
    let count = 0;
    for (const p of readPages) {
      if (p.startsWith(prefix)) count++;
    }
    return count;
  };

  const modules = [
    {
      title: "Python Foundations",
      desc: "Data structures, OOP, async, and NumPy / Pandas foundations",
      path: "/python",
      icon: <Code size={24} className="text-sky-400" />,
      theme: SECTION_THEMES.python,
      totalCount: 7,
      gradient: "from-sky-500/15 via-sky-500/5 to-transparent",
    },
    {
      title: "Machine Learning",
      desc: "Supervised, unsupervised, neural nets, transformers & loss surfaces",
      path: "/ml",
      icon: <Brain size={24} className="text-emerald-400" />,
      theme: SECTION_THEMES.ml,
      totalCount: 35,
      gradient: "from-emerald-500/15 via-emerald-500/5 to-transparent",
    },
    {
      title: "Generative AI & LLMs",
      desc: "Tokenization, inference decoding, fine-tuning, PEFT & quantization",
      path: "/genai",
      icon: <Sparkles size={24} className="text-purple-400" />,
      theme: SECTION_THEMES.genai,
      totalCount: 25,
      gradient: "from-purple-500/15 via-purple-500/5 to-transparent",
    },
    {
      title: "RAG Architecture",
      desc: "Ingestion, chunking, embeddings, vector databases & hybrid rerankers",
      path: "/rag",
      icon: <Database size={24} className="text-amber-400" />,
      theme: SECTION_THEMES.rag,
      totalCount: 16,
      gradient: "from-amber-500/15 via-amber-500/5 to-transparent",
    },
    {
      title: "AI Agents & MCP",
      desc: "Tool calling, memory state, MCP protocol, LangGraph & orchestration",
      path: "/agents",
      icon: <Bot size={24} className="text-teal-400" />,
      theme: SECTION_THEMES.agents,
      totalCount: 12,
      gradient: "from-teal-500/15 via-teal-500/5 to-transparent",
    },
    {
      title: "Model Families & Benchmarks",
      desc: "Claude, GPT, Gemini, Llama, DeepSeek & architectural comparison",
      path: "/models",
      icon: <Cpu size={24} className="text-rose-400" />,
      theme: SECTION_THEMES.models,
      totalCount: 14,
      gradient: "from-rose-500/15 via-rose-500/5 to-transparent",
    },
  ];

  const pathways = [
    {
      title: "Foundations in ML",
      target: "Python → Classical ML → Deep Learning",
      path: "/roadmaps#ml",
      color: "border-emerald-500/30 bg-emerald-500/10 text-emerald-300",
    },
    {
      title: "GenAI & LLM Specialist",
      target: "Tokenization → Fine-Tuning → Quantization",
      path: "/roadmaps#genai",
      color: "border-purple-500/30 bg-purple-500/10 text-purple-300",
    },
    {
      title: "Production RAG & Agents",
      target: "Chunking → Hybrid Rerank → Multi-Agent MCP",
      path: "/roadmaps#rag",
      color: "border-amber-500/30 bg-amber-500/10 text-amber-300",
    },
  ];

  // Ways into the material, rather than topics.
  const learnLinks = [
    { title: "Learning Paths", desc: "Ordered routes from beginner to AI engineer", path: "/roadmaps", icon: <MapIcon size={20} className="text-emerald-400" /> },
    { title: "Topic Map", desc: "Interactive prerequisite graph of all 178 topics", path: "/graph", icon: <Network size={20} className="text-sky-400" /> },
    { title: "Knowledge Checks", desc: "60+ quizzes testing real intuitions", path: "/quizzes", icon: <ListChecks size={20} className="text-amber-400" /> },
    { title: "Visual Simulators", desc: "Interactive playgrounds and animations", path: "/interactive", icon: <MousePointerClick size={20} className="text-pink-400" /> },
    { title: "AI Glossary", desc: "198+ concise definitions with deep guides", path: "/glossary", icon: <BookA size={20} className="text-violet-400" /> },
  ];

  const moreLinks = [
    { title: "MCP Protocol", path: "/mcp", icon: <Plug size={16} /> },
    { title: "Claude Code", path: "/models/anthropic#claude-code", icon: <MessageSquare size={16} /> },
    { title: "Prompt Engineering", path: "/prompting", icon: <Wand2 size={16} /> },
    { title: "Embeddings", path: "/rag/embeddings", icon: <Layers size={16} /> },
    { title: "LLM Inference", path: "/llm-inference", icon: <Gauge size={16} /> },
    { title: "Cloud AI (AWS & Azure)", path: "/azure", icon: <Cloud size={16} /> },
    { title: "Model Families", path: "/models", icon: <Boxes size={16} /> },
    { title: "Efficient Inference", path: "/efficiency", icon: <Zap size={16} /> },
    { title: "Safety & Alignment", path: "/safety", icon: <ShieldCheck size={16} /> },
    { title: "System Design", path: "/system-design", icon: <Server size={16} /> },
    { title: "Projects & Labs", path: "/projects", icon: <Rocket size={16} /> },
    { title: "Resources", path: "/resources", icon: <BookOpen size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#07080c] text-gray-300 font-sans relative overflow-hidden flex flex-col">
      {/* Animated Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/25 blur-[130px] mix-blend-screen animate-pulse duration-[8000ms]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/15 blur-[130px] mix-blend-screen animate-pulse duration-[10000ms]"></div>
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-purple-900/15 blur-[100px] mix-blend-screen"></div>
      </div>

      <GlobalHeader />

      <main className="flex-1 flex items-center justify-center py-16 sm:py-20 px-4 sm:px-6 lg:px-8">
        <motion.div
          className="max-w-6xl w-full"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Hero Section (Item 6) */}
          <div className="text-center mb-16 sm:mb-20">
            <motion.div variants={itemVariants} className="inline-flex items-center gap-2 mb-4 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span className="text-xs font-semibold text-indigo-300 tracking-wider uppercase">Interactive Visual AI Curriculum</span>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-4xl sm:text-6xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight font-display">
              Master AI Engineering. <br />
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Visually.
              </span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-lg sm:text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-normal leading-relaxed">
              Step-by-step interactive explainers, animated architectures, and code labs covering everything from Python basics to autonomous multi-agent systems.
            </motion.p>
          </div>

          {/* Continue Reading Bar (Item 6) */}
          {readCount > 0 && (
            <motion.div
              variants={itemVariants}
              className="mb-12 p-4 sm:p-5 rounded-2xl bg-gradient-to-r from-indigo-500/15 via-purple-500/10 to-transparent border border-indigo-500/30 backdrop-blur-md flex flex-wrap items-center justify-between gap-4 shadow-xl"
            >
              <div className="flex items-center gap-3.5">
                <div className="w-11 h-11 rounded-xl bg-indigo-500/20 border border-indigo-500/30 text-indigo-300 flex items-center justify-center font-bold text-base">
                  {readCount}
                </div>
                <div>
                  <div className="text-sm font-bold text-white flex items-center gap-2">
                    <span>Learning Journey in Progress</span>
                    <span className="text-[10px] font-mono font-semibold px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                      Active
                    </span>
                  </div>
                  <div className="text-xs text-gray-400 mt-0.5">
                    You have completed and marked <span className="text-indigo-300 font-semibold">{readCount}</span> topics across the visual curriculum.
                  </div>
                </div>
              </div>
              <Link
                to="/roadmaps"
                className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 cursor-pointer"
              >
                <span>Continue Reading Paths</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </motion.div>
          )}

          {/* Start Here Pathways (Item 6) */}
          <motion.div variants={itemVariants} className="mb-12">
            <div className="flex items-center gap-2 mb-4">
              <Compass className="w-4 h-4 text-indigo-400" />
              <span className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono">Recommended Pathways</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-3.5">
              {pathways.map((pw, i) => (
                <Link
                  key={i}
                  to={pw.path}
                  className="group p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:border-white/20 hover:bg-white/[0.06] transition-all backdrop-blur-sm"
                >
                  <div className="flex items-center justify-between mb-1.5">
                    <span className="text-sm font-bold text-white group-hover:text-indigo-300 transition-colors">{pw.title}</span>
                    <ArrowRight className="w-3.5 h-3.5 text-gray-500 group-hover:text-indigo-400 group-hover:translate-x-0.5 transition-all" />
                  </div>
                  <p className="text-xs text-gray-400 font-mono m-0">{pw.target}</p>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Core Modules Grid with Section Color Themes & Progress (Items 2, 4, 6) */}
          <motion.div
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
          >
            {modules.map((mod, idx) => {
              const readInSec = getSectionReadCount(mod.path);
              return (
                <motion.div
                  key={idx}
                  variants={itemVariants}
                  whileHover={{ y: -4 }}
                  transition={{ type: "spring", stiffness: 350, damping: 25 }}
                >
                  <Link
                    to={mod.path}
                    className={`block h-full p-6 sm:p-7 rounded-2xl border border-white/10 bg-gradient-to-br ${mod.gradient} backdrop-blur-xl ${mod.theme.borderHover} transition-all group relative overflow-hidden shadow-lg`}
                  >
                    <div className="flex items-center justify-between mb-5">
                      <div className="w-12 h-12 rounded-xl bg-black/50 border border-white/10 flex items-center justify-center shadow-md group-hover:scale-105 transition-transform">
                        {mod.icon}
                      </div>
                      <span className={`text-[11px] font-mono px-2.5 py-1 rounded-full border ${mod.theme.badgeBg}`}>
                        {readInSec > 0 ? `${readInSec} / ${mod.totalCount} read` : `${mod.totalCount} topics`}
                      </span>
                    </div>

                    <h3 className="text-xl font-bold text-white mb-2 tracking-tight group-hover:text-white transition-colors">
                      {mod.title}
                    </h3>
                    <p className="text-sm text-gray-400 leading-relaxed font-normal mb-4">
                      {mod.desc}
                    </p>

                    <div className={`flex items-center gap-1.5 text-xs font-semibold ${mod.theme.text} mt-auto`}>
                      <span>Explore Section</span>
                      <ArrowRight className="w-3.5 h-3.5 group-hover:translate-x-1 transition-transform" />
                    </div>
                  </Link>
                </motion.div>
              );
            })}
          </motion.div>

          {/* Ways to learn — paths, map, quizzes */}
          <motion.div variants={itemVariants} className="mt-16">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider font-mono m-0">Interactive Tools & Formats</p>
              <Link to="/interactive" className="text-xs text-indigo-400 hover:text-indigo-300 hover:underline">
                View all playgrounds →
              </Link>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3.5">
              {learnLinks.map((l) => (
                <Link
                  key={l.path}
                  to={l.path}
                  className="flex lg:flex-col gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 transition-all backdrop-blur-sm group"
                >
                  <span className="w-10 h-10 shrink-0 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center group-hover:scale-105 transition-transform">
                    {l.icon}
                  </span>
                  <span>
                    <span className="block text-sm font-semibold text-white group-hover:text-indigo-300 transition-colors">{l.title}</span>
                    <span className="block text-xs text-gray-400 mt-0.5 leading-snug">{l.desc}</span>
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Explore More — secondary sections */}
          <motion.div variants={itemVariants} className="mt-16 pt-10 border-t border-white/10">
            <p className="text-center text-xs font-bold text-gray-400 uppercase tracking-wider font-mono mb-5">
              Specialized Topics & Deep Dives
            </p>
            <div className="flex flex-wrap items-center justify-center gap-2.5">
              {moreLinks.map((link, idx) => (
                <Link
                  key={idx}
                  to={link.path}
                  className="flex items-center gap-2 px-3.5 py-1.5 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.08] hover:border-white/20 text-xs font-medium text-gray-300 hover:text-white transition-all backdrop-blur-sm"
                >
                  <span className="text-indigo-400">{link.icon}</span>
                  <span>{link.title}</span>
                </Link>
              ))}
            </div>
          </motion.div>
        </motion.div>
      </main>
      <Footer />
    </div>
  );
}

import GlobalHeader from "../components/GlobalHeader";
import Footer from "../components/Footer";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Code, Brain, Sparkles, Database, Cpu, Bot, ArrowRight, Plug, MessageSquare, Wand2, Layers, Gauge, Cloud, Rocket, BookOpen, Map as MapIcon, Network, ListChecks, BookA, MousePointerClick, ShieldCheck, Boxes, Zap, Server } from "lucide-react";
import { useReadPages } from "../lib/progress";

export default function Home() {
  const readCount = useReadPages().size;
  const containerVariants = {
    hidden: { opacity: 0 },
    show: {
      opacity: 1,
      transition: {
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    show: { opacity: 1, y: 0, transition: { duration: 0.5, ease: "easeOut" } }
  };

  const features = [
    { title: "Python Basics", desc: "The foundation of AI", path: "/python", icon: <Code size={24} className="text-blue-400" />, color: "from-blue-500/20 to-blue-600/5" },
    { title: "Machine Learning", desc: "Models that learn from data", path: "/ml", icon: <Brain size={24} className="text-emerald-400" />, color: "from-emerald-500/20 to-emerald-600/5" },
    { title: "Generative AI", desc: "Creating new content", path: "/genai", icon: <Sparkles size={24} className="text-purple-400" />, color: "from-purple-500/20 to-purple-600/5" },
    { title: "RAG Architecture", desc: "Retrieval-Augmented Gen", path: "/rag", icon: <Database size={24} className="text-amber-400" />, color: "from-amber-500/20 to-amber-600/5" },
    { title: "LLMs Deep Dive", desc: "Large Language Models", path: "/llms", icon: <Cpu size={24} className="text-rose-400" />, color: "from-rose-500/20 to-rose-600/5" },
    { title: "Agentic AI", desc: "Autonomous AI Agents", path: "/agents", icon: <Bot size={24} className="text-cyan-400" />, color: "from-cyan-500/20 to-cyan-600/5" }
  ];

  // Ways into the material, rather than topics.
  const learnLinks = [
    { title: "Learning Paths", desc: "Ordered routes from beginner to ML, AI or cloud engineer", path: "/roadmaps", icon: <MapIcon size={20} className="text-emerald-400" /> },
    { title: "Topic Map", desc: "Every page as a graph of prerequisites", path: "/graph", icon: <Network size={20} className="text-sky-400" /> },
    { title: "Knowledge Checks", desc: "Quizzes that test the why, not the term", path: "/quizzes", icon: <ListChecks size={20} className="text-amber-400" /> },
    { title: "Interactive", desc: "Playgrounds and step-through animations", path: "/interactive", icon: <MousePointerClick size={20} className="text-pink-400" /> },
    { title: "Glossary", desc: "Short definitions, each linked to its guide", path: "/glossary", icon: <BookA size={20} className="text-violet-400" /> },
  ];

  const moreLinks = [
    { title: "MCP", path: "/mcp", icon: <Plug size={16} /> },
    { title: "Claude Code", path: "/models/claude#claude-code", icon: <MessageSquare size={16} /> },
    { title: "Prompt Engineering", path: "/prompting", icon: <Wand2 size={16} /> },
    { title: "Embeddings", path: "/embeddings", icon: <Layers size={16} /> },
    { title: "LLM Inference", path: "/llm-inference", icon: <Gauge size={16} /> },
    { title: "Cloud (Azure & AWS)", path: "/azure", icon: <Cloud size={16} /> },
    { title: "Model Families", path: "/models", icon: <Boxes size={16} /> },
    { title: "Efficient Inference", path: "/efficiency", icon: <Zap size={16} /> },
    { title: "Safety & Alignment", path: "/safety", icon: <ShieldCheck size={16} /> },
    { title: "System Design", path: "/system-design", icon: <Server size={16} /> },
    { title: "Projects", path: "/projects", icon: <Rocket size={16} /> },
    { title: "Resources", path: "/resources", icon: <BookOpen size={16} /> },
  ];

  return (
    <div className="min-h-screen bg-[#050505] text-gray-300 font-sans relative overflow-hidden flex flex-col">
      {/* Animated Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none -z-10">
        <div className="absolute top-[-20%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-900/30 blur-[120px] mix-blend-screen animate-pulse duration-[8000ms]"></div>
        <div className="absolute bottom-[-20%] right-[-10%] w-[60%] h-[60%] rounded-full bg-blue-900/20 blur-[120px] mix-blend-screen animate-pulse duration-[10000ms]"></div>
        <div className="absolute top-[20%] right-[20%] w-[30%] h-[30%] rounded-full bg-purple-900/20 blur-[100px] mix-blend-screen"></div>
      </div>

      <GlobalHeader />

      <main className="flex-1 flex items-center justify-center py-20 px-4 sm:px-6 lg:px-8">
        <motion.div 
          className="max-w-6xl w-full"
          variants={containerVariants}
          initial="hidden"
          animate="show"
        >
          {/* Hero Section */}
          <div className="text-center mb-20">
            <motion.div variants={itemVariants} className="inline-block mb-4 px-4 py-1.5 rounded-full border border-indigo-500/30 bg-indigo-500/10 backdrop-blur-md">
              <span className="text-sm font-semibold text-indigo-300 tracking-wider uppercase">Interactive Learning Platform</span>
            </motion.div>
            <motion.h1 variants={itemVariants} className="text-5xl md:text-7xl font-black text-white mb-6 tracking-tight leading-tight">
              Master AI Engineering. <br/>
              <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400">
                Visually.
              </span>
            </motion.h1>
            <motion.p variants={itemVariants} className="text-xl md:text-2xl text-gray-400 max-w-3xl mx-auto font-light leading-relaxed">
              Explore step-by-step, animated explainers covering everything from basic Python to advanced autonomous Agentic AI architectures.
            </motion.p>
          </div>

          {/* Features Grid */}
          <motion.div 
            className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            variants={containerVariants}
          >
            {features.map((feature, idx) => (
              <motion.div key={idx} variants={itemVariants} whileHover={{ y: -5, scale: 1.02 }} transition={{ type: "spring", stiffness: 300 }}>
                <Link to={feature.path} className={`block h-full p-8 rounded-2xl border border-white/5 bg-gradient-to-br ${feature.color} backdrop-blur-xl hover:border-white/20 transition-colors group relative overflow-hidden`}>
                  <div className="absolute top-0 right-0 p-6 opacity-0 group-hover:opacity-100 transition-opacity transform translate-x-4 group-hover:translate-x-0">
                    <ArrowRight className="text-white/50" />
                  </div>
                  <div className="w-14 h-14 rounded-xl bg-black/40 border border-white/10 flex items-center justify-center mb-6 shadow-lg shadow-black/20 group-hover:scale-110 transition-transform">
                    {feature.icon}
                  </div>
                  <h3 className="text-2xl font-bold text-white mb-2">{feature.title}</h3>
                  <p className="text-gray-400 font-medium">{feature.desc}</p>
                </Link>
              </motion.div>
            ))}
          </motion.div>

          {/* Ways to learn — paths, map, quizzes */}
          <motion.div variants={itemVariants} className="mt-14">
            <div className="flex flex-wrap items-baseline justify-between gap-2 mb-5">
              <p className="text-sm font-semibold text-gray-500 uppercase tracking-wider m-0">Start Here</p>
              <p className="text-xs text-gray-500 m-0">
                {readCount > 0 ? (
                  <>
                    You've marked <span className="text-emerald-400 font-semibold">{readCount}</span> page{readCount === 1 ? "" : "s"} as read.{" "}
                    <Link to="/roadmaps" className="text-indigo-400 hover:underline">Pick up a path →</Link>
                  </>
                ) : (
                  "Mark pages as read to track your progress."
                )}
              </p>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-3">
              {learnLinks.map((l) => (
                <Link
                  key={l.path}
                  to={l.path}
                  className="flex lg:flex-col gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:bg-white/[0.07] hover:border-white/20 transition-colors"
                >
                  <span className="w-10 h-10 shrink-0 rounded-lg bg-black/40 border border-white/10 flex items-center justify-center">{l.icon}</span>
                  <span>
                    <span className="block text-sm font-semibold text-white">{l.title}</span>
                    <span className="block text-xs text-gray-400 mt-0.5 leading-snug">{l.desc}</span>
                  </span>
                </Link>
              ))}
            </div>
          </motion.div>

          {/* Explore More — secondary sections not on the main grid */}
          <motion.div variants={itemVariants} className="mt-14 pt-10 border-t border-white/10">
            <p className="text-center text-sm font-semibold text-gray-500 uppercase tracking-wider mb-5">Explore More</p>
            <div className="flex flex-wrap items-center justify-center gap-3">
              {moreLinks.map((link, idx) => (
                <Link
                  key={idx}
                  to={link.path}
                  className="flex items-center gap-2 px-4 py-2 rounded-full border border-white/10 bg-white/5 hover:bg-white/10 hover:border-white/20 text-sm text-gray-300 hover:text-white transition-colors"
                >
                  {link.icon}
                  {link.title}
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

/* ---------------------------------------------------------------------------
   Section Color System & Semantic Tokens
   Item 2: Defined color system across all sections of the site.
   Each section has a distinct, recognizable accent color used in
   breadcrumbs, sidebar indicators, header pills, cards, and interactive widgets.
--------------------------------------------------------------------------- */

export const SECTION_THEMES = {
  python: {
    id: "python",
    name: "Python",
    badgeLabel: "Python",
    parentPath: "/python",
    tone: "sky",
    accentHex: "#38bdf8",
    activeSidebar: "text-sky-400 font-semibold border-l-2 border-sky-400 pl-2 -ml-[10px]",
    badgeBg: "bg-sky-500/10 text-sky-300 border-sky-500/30",
    glowBg: "bg-sky-500/15",
    borderHover: "hover:border-sky-500/40",
    linkHover: "hover:text-sky-300",
    barColor: "bg-sky-400",
  },
  ml: {
    id: "ml",
    name: "Machine Learning",
    badgeLabel: "Machine Learning",
    parentPath: "/ml",
    tone: "emerald",
    accentHex: "#34d399",
    activeSidebar: "text-emerald-400 font-semibold border-l-2 border-emerald-400 pl-2 -ml-[10px]",
    badgeBg: "bg-emerald-500/10 text-emerald-300 border-emerald-500/30",
    glowBg: "bg-emerald-500/15",
    borderHover: "hover:border-emerald-500/40",
    linkHover: "hover:text-emerald-300",
    barColor: "bg-emerald-400",
  },
  genai: {
    id: "genai",
    name: "Generative AI",
    badgeLabel: "GenAI & LLMs",
    parentPath: "/genai",
    tone: "purple",
    accentHex: "#c084fc",
    activeSidebar: "text-purple-400 font-semibold border-l-2 border-purple-400 pl-2 -ml-[10px]",
    badgeBg: "bg-purple-500/10 text-purple-300 border-purple-500/30",
    glowBg: "bg-purple-500/15",
    borderHover: "hover:border-purple-500/40",
    linkHover: "hover:text-purple-300",
    barColor: "bg-purple-400",
  },
  rag: {
    id: "rag",
    name: "RAG Architecture",
    badgeLabel: "RAG Systems",
    parentPath: "/rag",
    tone: "amber",
    accentHex: "#fbbf24",
    activeSidebar: "text-amber-400 font-semibold border-l-2 border-amber-400 pl-2 -ml-[10px]",
    badgeBg: "bg-amber-500/10 text-amber-300 border-amber-500/30",
    glowBg: "bg-amber-500/15",
    borderHover: "hover:border-amber-500/40",
    linkHover: "hover:text-amber-300",
    barColor: "bg-amber-400",
  },
  agents: {
    id: "agents",
    name: "AI Agents",
    badgeLabel: "Agents & MCP",
    parentPath: "/agents",
    tone: "teal",
    accentHex: "#2dd4bf",
    activeSidebar: "text-teal-400 font-semibold border-l-2 border-teal-400 pl-2 -ml-[10px]",
    badgeBg: "bg-teal-500/10 text-teal-300 border-teal-500/30",
    glowBg: "bg-teal-500/15",
    borderHover: "hover:border-teal-500/40",
    linkHover: "hover:text-teal-300",
    barColor: "bg-teal-400",
  },
  models: {
    id: "models",
    name: "Model Families",
    badgeLabel: "AI Models",
    parentPath: "/models",
    tone: "rose",
    accentHex: "#fb7185",
    activeSidebar: "text-rose-400 font-semibold border-l-2 border-rose-400 pl-2 -ml-[10px]",
    badgeBg: "bg-rose-500/10 text-rose-300 border-rose-500/30",
    glowBg: "bg-rose-500/15",
    borderHover: "hover:border-rose-500/40",
    linkHover: "hover:text-rose-300",
    barColor: "bg-rose-400",
  },
  cloud: {
    id: "cloud",
    name: "Cloud Architecture",
    badgeLabel: "Cloud Infrastructure",
    parentPath: "/azure",
    tone: "blue",
    accentHex: "#60a5fa",
    activeSidebar: "text-blue-400 font-semibold border-l-2 border-blue-400 pl-2 -ml-[10px]",
    badgeBg: "bg-blue-500/10 text-blue-300 border-blue-500/30",
    glowBg: "bg-blue-500/15",
    borderHover: "hover:border-blue-500/40",
    linkHover: "hover:text-blue-300",
    barColor: "bg-blue-400",
  },
  learn: {
    id: "learn",
    name: "Learn & Practice",
    badgeLabel: "Interactive Learning",
    parentPath: "/roadmaps",
    tone: "indigo",
    accentHex: "#818cf8",
    activeSidebar: "text-indigo-400 font-semibold border-l-2 border-indigo-400 pl-2 -ml-[10px]",
    badgeBg: "bg-indigo-500/10 text-indigo-300 border-indigo-500/30",
    glowBg: "bg-indigo-500/15",
    borderHover: "hover:border-indigo-500/40",
    linkHover: "hover:text-indigo-300",
    barColor: "bg-indigo-400",
  },
  build: {
    id: "build",
    name: "Production Systems",
    badgeLabel: "System Design",
    parentPath: "/system-design",
    tone: "orange",
    accentHex: "#fb923c",
    activeSidebar: "text-orange-400 font-semibold border-l-2 border-orange-400 pl-2 -ml-[10px]",
    badgeBg: "bg-orange-500/10 text-orange-300 border-orange-500/30",
    glowBg: "bg-orange-500/15",
    borderHover: "hover:border-orange-500/40",
    linkHover: "hover:text-orange-300",
    barColor: "bg-orange-400",
  },
};

/**
 * Returns the section theme configuration for any given route pathname.
 */
export function getSectionTheme(pathname = "") {
  if (!pathname) return SECTION_THEMES.learn;

  const clean = pathname.toLowerCase();

  if (clean.startsWith("/python")) return SECTION_THEMES.python;
  if (clean.startsWith("/ml")) return SECTION_THEMES.ml;
  if (
    clean.startsWith("/genai") ||
    clean.startsWith("/llms") ||
    clean.startsWith("/prompting") ||
    clean.startsWith("/efficiency") ||
    clean.startsWith("/safety")
  ) {
    return SECTION_THEMES.genai;
  }
  if (clean.startsWith("/rag")) return SECTION_THEMES.rag;
  if (clean.startsWith("/agents") || clean.startsWith("/mcp")) {
    return SECTION_THEMES.agents;
  }
  if (clean.startsWith("/models")) return SECTION_THEMES.models;
  if (
    clean.startsWith("/azure") ||
    clean.startsWith("/aws") ||
    clean.startsWith("/cloud")
  ) {
    return SECTION_THEMES.cloud;
  }
  if (
    clean.startsWith("/roadmaps") ||
    clean.startsWith("/graph") ||
    clean.startsWith("/quizzes") ||
    clean.startsWith("/interactive") ||
    clean.startsWith("/glossary") ||
    clean.startsWith("/radar")
  ) {
    return SECTION_THEMES.learn;
  }
  if (
    clean.startsWith("/system-design") ||
    clean.startsWith("/llm-production") ||
    clean.startsWith("/llm-evals") ||
    clean.startsWith("/mlops") ||
    clean.startsWith("/projects") ||
    clean.startsWith("/resources")
  ) {
    return SECTION_THEMES.build;
  }

  return SECTION_THEMES.learn;
}

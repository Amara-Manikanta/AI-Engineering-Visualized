import React from "react";

export default function Footer() {
  return (
    <footer className="w-full border-t border-white/5 bg-[#0d0d0d]/80 backdrop-blur-md py-8 mt-auto z-10">
      <div className="max-w-[1200px] mx-auto px-4 sm:px-5 flex flex-col md:flex-row items-center justify-between gap-4 text-center md:text-left">
        <div>
          <div className="text-white font-bold text-sm flex items-center justify-center md:justify-start gap-2">
            <span>🤖</span> AI Visualised Engineering
          </div>
          <p className="text-xs text-gray-500 mt-1 max-w-md">
            An interactive animated guide to RAG, MCP, Agent Architecture, LLM Inference, LangGraph, and modern AI models.
          </p>
        </div>
        <div className="text-xs text-gray-400">
          Built with ❤️ by <span className="text-indigo-400 font-medium">Amara Manikanta Dileep</span> — AI Visualised Engineering © 2026
        </div>
      </div>
    </footer>
  );
}

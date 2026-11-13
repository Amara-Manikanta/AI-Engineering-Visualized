import React, { useState, useRef, useEffect } from "react";
import { Link } from "react-router-dom";
import { ArrowRight, BookOpen } from "lucide-react";
import { GLOSSARY } from "../data/glossary";

const GLOSSARY_MAP = new Map();
for (const item of GLOSSARY) {
  GLOSSARY_MAP.set(item.t.toLowerCase(), item);
}

export default function GlossaryTerm({ term, children }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);

  const termKey = (term || (typeof children === "string" ? children : "")).toLowerCase();
  const entry = GLOSSARY_MAP.get(termKey);

  // Close when clicked outside
  useEffect(() => {
    if (!open) return;
    const handleClick = (e) => {
      if (containerRef.current && !containerRef.current.contains(e.target)) {
        setOpen(false);
      }
    };
    window.addEventListener("click", handleClick);
    return () => window.removeEventListener("click", handleClick);
  }, [open]);

  if (!entry) {
    return <span>{children || term}</span>;
  }

  return (
    <span
      ref={containerRef}
      className="relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
    >
      <button
        type="button"
        onClick={() => setOpen(!open)}
        className="inline font-medium text-indigo-300 underline decoration-dotted decoration-indigo-400/60 underline-offset-4 hover:decoration-indigo-300 hover:text-white transition-colors cursor-help"
      >
        {children || entry.t}
      </button>

      {open && (
        <span
          role="tooltip"
          className="absolute bottom-full left-1/2 -translate-x-1/2 mb-2 z-50 w-72 p-3.5 rounded-xl bg-[#14141c]/95 border border-white/15 shadow-2xl backdrop-blur-md text-left normal-case tracking-normal animate-in fade-in zoom-in-95 duration-150 block"
        >
          <span className="flex items-center justify-between gap-2 mb-1.5">
            <span className="font-semibold text-xs text-white flex items-center gap-1.5">
              <BookOpen className="w-3.5 h-3.5 text-indigo-400" />
              <span>{entry.t}</span>
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-indigo-500/15 text-indigo-300 border border-indigo-500/20">
              {entry.c}
            </span>
          </span>
          <span className="text-xs text-gray-300 leading-relaxed block font-sans">
            {entry.d}
          </span>
          {entry.see && (
            <span className="mt-2.5 pt-2 border-t border-white/10 flex items-center justify-between text-[11px] block">
              <span className="text-gray-500">Related guide</span>
              <Link
                to={entry.see}
                onClick={() => setOpen(false)}
                className="text-indigo-400 hover:text-indigo-300 inline-flex items-center gap-1 font-medium"
              >
                <span>Read more</span>
                <ArrowRight className="w-3 h-3" />
              </Link>
            </span>
          )}
        </span>
      )}
    </span>
  );
}

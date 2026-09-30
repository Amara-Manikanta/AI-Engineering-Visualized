import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";

/**
 * CommandPalette — global Cmd+K / Ctrl+K search across every page and section.
 *
 * The index (96 pages, ~500 sections) is loaded lazily the first time the
 * palette opens, so it never lands in the first-load bundle.
 */

const MAX_RESULTS = 24;

/** Substring scoring — predictable beats clever for a docs palette. */
function scoreEntry(entry, q) {
  const title = entry.title.toLowerCase();
  const intro = entry.intro.toLowerCase();
  const path = entry.path.toLowerCase();

  let best = 0;
  let matchedSection = null;

  if (title === q) best = 120;
  else if (title.startsWith(q)) best = 100;
  else if (title.includes(q)) best = 80;
  else if (path.includes(q)) best = 55;
  else if (intro.includes(q)) best = 35;

  // Declared keywords: alternate names and acronyms that live in prose.
  // Scored just under a section hit so a real section still wins.
  for (const k of entry.keywords ?? []) {
    const kw = k.toLowerCase();
    let sc = 0;
    // Scored below every section tier, so when a term is BOTH a keyword and a
    // section label the result deep-links to the section instead of the page.
    if (kw === q) sc = 58;
    else if (kw.startsWith(q)) sc = 48;
    else if (kw.includes(q)) sc = 40;
    if (sc > best) best = sc;
  }

  for (const s of entry.sections) {
    const label = s.label.toLowerCase();
    let sc = 0;
    if (label === q) sc = 95;
    else if (label.startsWith(q)) sc = 75;
    else if (label.includes(q)) sc = 60;
    if (sc > best) {
      best = sc;
      matchedSection = s;
    }
  }
  return { score: best, matchedSection };
}

function search(index, query) {
  const q = query.trim().toLowerCase();
  if (!q) return [];
  const out = [];
  for (const entry of index) {
    const { score, matchedSection } = scoreEntry(entry, q);
    if (score > 0) out.push({ entry, score, matchedSection });
  }
  out.sort((a, b) => b.score - a.score || a.entry.title.localeCompare(b.entry.title));
  return out.slice(0, MAX_RESULTS);
}

/** Wraps the matched substring in a <mark> so users see why it hit. */
function Highlight({ text, query }) {
  const q = query.trim();
  if (!q) return <>{text}</>;
  const i = text.toLowerCase().indexOf(q.toLowerCase());
  if (i === -1) return <>{text}</>;
  return (
    <>
      {text.slice(0, i)}
      <mark className="bg-indigo-500/30 text-indigo-100 rounded-sm px-0.5">
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </>
  );
}

const QUICK_LINKS = [
  { path: "/rag", label: "RAG from Scratch" },
  { path: "/agents", label: "AI Agent Architecture" },
  { path: "/python", label: "Python Master Guide" },
  { path: "/ml/transformers", label: "Transformers" },
  { path: "/mcp", label: "Model Context Protocol" },
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [index, setIndex] = useState(null);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  // Load the index lazily, only once, the first time the palette opens.
  useEffect(() => {
    if (!open || index) return;
    let cancelled = false;
    import("../data/searchIndex.json")
      .then((m) => !cancelled && setIndex(m.default))
      .catch(() => !cancelled && setIndex([]));
    return () => {
      cancelled = true;
    };
  }, [open, index]);

  // Global shortcut: Cmd+K / Ctrl+K toggles, Esc closes.
  useEffect(() => {
    const onKey = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((o) => !o);
      } else if (e.key === "Escape") {
        setOpen(false);
      }
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  // Reset + focus on open; restore body scroll on close.
  useEffect(() => {
    if (open) {
      setQuery("");
      setActive(0);
      document.body.style.overflow = "hidden";
      // focus after paint so the input exists
      requestAnimationFrame(() => inputRef.current?.focus());
    } else {
      document.body.style.overflow = "";
    }
    return () => {
      document.body.style.overflow = "";
    };
  }, [open]);

  const results = useMemo(() => (index ? search(index, query) : []), [index, query]);

  useEffect(() => setActive(0), [query]);

  const go = useCallback(
    (entry, section) => {
      setOpen(false);
      navigate(section ? `${entry.path}#${section.hash}` : entry.path);
      // hash routes don't always scroll on their own
      if (section) {
        requestAnimationFrame(() =>
          document.getElementById(section.hash)?.scrollIntoView({ behavior: "smooth" })
        );
      }
    },
    [navigate]
  );

  const onKeyDown = (e) => {
    const list = query ? results : QUICK_LINKS;
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setActive((a) => Math.min(list.length - 1, a + 1));
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setActive((a) => Math.max(0, a - 1));
    } else if (e.key === "Enter") {
      e.preventDefault();
      if (query) {
        const hit = results[active];
        if (hit) go(hit.entry, hit.matchedSection);
      } else {
        const q = QUICK_LINKS[active];
        if (q) {
          setOpen(false);
          navigate(q.path);
        }
      }
    }
  };

  // Keep the highlighted row in view while arrowing.
  useEffect(() => {
    listRef.current
      ?.querySelector(`[data-idx="${active}"]`)
      ?.scrollIntoView({ block: "nearest" });
  }, [active]);

  if (!open) return <SearchTrigger onOpen={() => setOpen(true)} />;

  return (
    <>
      <SearchTrigger onOpen={() => setOpen(true)} />
      <div
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[12vh] px-4 bg-black/70 backdrop-blur-sm"
        onClick={() => setOpen(false)}
        role="presentation"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search all pages"
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-xl bg-[#141414] border border-white/15 rounded-2xl shadow-2xl overflow-hidden"
        >
          {/* input */}
          <div className="flex items-center gap-3 px-4 border-b border-white/10">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" className="text-gray-500 shrink-0">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search topics, sections, pages…"
              className="flex-1 bg-transparent py-4 text-sm text-gray-100 placeholder-gray-600 outline-none"
            />
            <kbd className="text-[0.625rem] font-mono text-gray-600 border border-white/10 rounded px-1.5 py-0.5 shrink-0">
              esc
            </kbd>
          </div>

          {/* results */}
          <div ref={listRef} className="max-h-[55vh] overflow-y-auto custom-scrollbar py-2">
            {!query && (
              <>
                <div className="px-4 py-1.5 text-[0.625rem] uppercase tracking-wide text-gray-600">
                  Jump to
                </div>
                {QUICK_LINKS.map((q, i) => (
                  <button
                    key={q.path}
                    data-idx={i}
                    onMouseEnter={() => setActive(i)}
                    onClick={() => {
                      setOpen(false);
                      navigate(q.path);
                    }}
                    className={`w-full text-left px-4 py-2.5 flex items-center gap-3 ${
                      active === i ? "bg-white/10" : "hover:bg-white/5"
                    }`}
                  >
                    <span className="text-sm text-gray-200">{q.label}</span>
                    <span className="ml-auto text-[0.625rem] font-mono text-gray-600">{q.path}</span>
                  </button>
                ))}
              </>
            )}

            {query && !index && (
              <div className="px-4 py-8 text-center text-sm text-gray-500">Loading index…</div>
            )}

            {query && index && results.length === 0 && (
              <div className="px-4 py-8 text-center">
                <div className="text-sm text-gray-400 mb-1">No results for “{query}”</div>
                <div className="text-xs text-gray-600">Try a broader term, like “rag” or “tokens”.</div>
              </div>
            )}

            {query &&
              results.map((r, i) => (
                <button
                  key={`${r.entry.path}-${r.matchedSection?.hash ?? ""}`}
                  data-idx={i}
                  onMouseEnter={() => setActive(i)}
                  onClick={() => go(r.entry, r.matchedSection)}
                  className={`w-full text-left px-4 py-2.5 ${
                    active === i ? "bg-white/10" : "hover:bg-white/5"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <span className="text-sm text-gray-100 truncate">
                      <Highlight text={r.entry.title} query={query} />
                    </span>
                    {r.matchedSection && (
                      <>
                        <span className="text-gray-600 text-xs shrink-0">›</span>
                        <span className="text-xs text-indigo-300 truncate">
                          <Highlight text={r.matchedSection.label} query={query} />
                        </span>
                      </>
                    )}
                  </div>
                  <div className="text-[0.625rem] font-mono text-gray-600 mt-0.5">{r.entry.path}</div>
                </button>
              ))}
          </div>

          {/* footer */}
          <div className="flex items-center gap-4 px-4 py-2 border-t border-white/10 text-[0.625rem] text-gray-600">
            <span><kbd className="font-mono">↑↓</kbd> navigate</span>
            <span><kbd className="font-mono">↵</kbd> open</span>
            <span><kbd className="font-mono">esc</kbd> close</span>
            {index && <span className="ml-auto">{index.length} pages indexed</span>}
          </div>
        </div>
      </div>
    </>
  );
}

/** The header button that also advertises the shortcut. */
function SearchTrigger({ onOpen }) {
  const isMac = typeof navigator !== "undefined" && /Mac|iPhone|iPad/.test(navigator.platform);
  return (
    <button
      onClick={onOpen}
      aria-label="Search"
      className="flex items-center gap-2 px-3 py-1.5 rounded-lg border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/25 transition-colors"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <span className="hidden sm:inline text-xs">Search</span>
      <kbd className="hidden sm:inline text-[0.625rem] font-mono border border-white/15 rounded px-1 py-0.5">
        {isMac ? "⌘" : "Ctrl"}K
      </kbd>
    </button>
  );
}

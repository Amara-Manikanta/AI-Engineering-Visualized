import React, { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { Clock, Trash2, Sparkles, Compass, ChevronRight } from "lucide-react";
import { getSectionTheme } from "../lib/sectionTheme";

/**
 * CommandPalette — global Cmd+K / Ctrl+K search across every page and section.
 * Polish (Item 12):
 *  - Recent searches with persistence & one-click clear
 *  - Results grouped by section with colored section badges
 *  - Matched keyword highlighting
 *  - Empty state with topic suggestions
 */

const MAX_RESULTS = 24;
const RECENT_KEY = "ai_visualized_recent_searches";

function getRecentSearches() {
  try {
    return JSON.parse(localStorage.getItem(RECENT_KEY) || "[]");
  } catch {
    return [];
  }
}

function saveRecentSearch(q) {
  if (!q || !q.trim()) return;
  const trimmed = q.trim();
  try {
    const list = getRecentSearches().filter((x) => x.toLowerCase() !== trimmed.toLowerCase());
    list.unshift(trimmed);
    localStorage.setItem(RECENT_KEY, JSON.stringify(list.slice(0, 6)));
  } catch {
    /* noop */
  }
}

function clearRecentSearches() {
  try {
    localStorage.removeItem(RECENT_KEY);
  } catch {
    /* noop */
  }
}

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

  for (const k of entry.keywords ?? []) {
    const kw = k.toLowerCase();
    let sc = 0;
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
      <mark className="bg-indigo-500/35 text-indigo-200 rounded px-1 py-0.5 font-medium">
        {text.slice(i, i + q.length)}
      </mark>
      {text.slice(i + q.length)}
    </>
  );
}

const QUICK_LINKS = [
  { path: "/rag", label: "RAG Architecture", section: "RAG" },
  { path: "/agents", label: "AI Agent Architecture", section: "Agents" },
  { path: "/ml/transformers", label: "Transformers", section: "ML" },
  { path: "/mcp", label: "Model Context Protocol", section: "Agents" },
  { path: "/python", label: "Python Master Guide", section: "Python" },
  { path: "/genai/peft/lora", label: "LoRA Fine-tuning", section: "GenAI" },
];

const SUGGESTED_QUERIES = [
  "RAG", "Transformers", "LoRA", "MCP", "Agents", "Evaluation", "Vector DBs", "Quantization"
];

export default function CommandPalette() {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [active, setActive] = useState(0);
  const [index, setIndex] = useState(null);
  const [recentList, setRecentList] = useState([]);
  const inputRef = useRef(null);
  const listRef = useRef(null);
  const navigate = useNavigate();

  // Load recent searches on open
  useEffect(() => {
    if (open) {
      setRecentList(getRecentSearches());
    }
  }, [open]);

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

  // Group results by section while preserving global result indexes for keyboard navigation
  const groupedResults = useMemo(() => {
    if (!results.length) return [];
    const map = new Map();
    results.forEach((item, globalIndex) => {
      const theme = getSectionTheme(item.entry.path);
      const groupKey = theme.id;
      if (!map.has(groupKey)) {
        map.set(groupKey, { theme, items: [] });
      }
      map.get(groupKey).items.push({ ...item, globalIndex });
    });
    return Array.from(map.values());
  }, [results]);

  const go = useCallback(
    (entry, section) => {
      if (query.trim()) {
        saveRecentSearch(query);
      }
      setOpen(false);
      navigate(section ? `${entry.path}#${section.hash}` : entry.path);
      if (section) {
        requestAnimationFrame(() =>
          document.getElementById(section.hash)?.scrollIntoView({ behavior: "smooth" })
        );
      }
    },
    [navigate, query]
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

  const handleClearRecents = (e) => {
    e.stopPropagation();
    clearRecentSearches();
    setRecentList([]);
  };

  if (!open) return <SearchTrigger onOpen={() => setOpen(true)} />;

  return (
    <>
      <SearchTrigger onOpen={() => setOpen(true)} />
      <div
        className="fixed inset-0 z-[100] flex items-start justify-center pt-[10vh] px-4 bg-black/75 backdrop-blur-md animate-in fade-in duration-150"
        onClick={() => setOpen(false)}
        role="presentation"
      >
        <div
          role="dialog"
          aria-modal="true"
          aria-label="Search all pages and topics"
          onClick={(e) => e.stopPropagation()}
          className="w-full max-w-2xl bg-[#111116] border border-white/15 rounded-2xl shadow-2xl overflow-hidden flex flex-col max-h-[80vh]"
        >
          {/* Search Input Bar */}
          <div className="flex items-center gap-3 px-4 sm:px-5 border-b border-white/10 bg-white/[0.02]">
            <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" className="text-gray-400 shrink-0">
              <circle cx="11" cy="11" r="8" />
              <path d="m21 21-4.3-4.3" />
            </svg>
            <input
              ref={inputRef}
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              onKeyDown={onKeyDown}
              placeholder="Search topics, architectures, guides, models…"
              className="flex-1 bg-transparent py-4 text-sm sm:text-base text-gray-100 placeholder-gray-500 outline-none font-sans"
            />
            {query && (
              <button
                type="button"
                onClick={() => setQuery("")}
                className="text-xs text-gray-400 hover:text-white px-1.5 py-0.5 rounded hover:bg-white/10"
              >
                Clear
              </button>
            )}
            <kbd className="text-[0.625rem] font-mono text-gray-400 border border-white/10 rounded px-1.5 py-0.5 shrink-0 bg-white/5">
              esc
            </kbd>
          </div>

          {/* Results & Recent Searches */}
          <div ref={listRef} className="flex-1 overflow-y-auto custom-scrollbar p-3 space-y-4">
            {!query && (
              <>
                {/* Recent Searches */}
                {recentList.length > 0 && (
                  <div>
                    <div className="flex items-center justify-between px-3 py-1.5 mb-1.5">
                      <div className="flex items-center gap-1.5 text-[11px] font-mono uppercase tracking-wider text-gray-400 font-semibold">
                        <Clock className="w-3.5 h-3.5" />
                        <span>Recent Searches</span>
                      </div>
                      <button
                        onClick={handleClearRecents}
                        className="text-[11px] text-gray-500 hover:text-rose-400 transition-colors flex items-center gap-1"
                      >
                        <Trash2 className="w-3 h-3" />
                        <span>Clear</span>
                      </button>
                    </div>
                    <div className="flex flex-wrap gap-2 px-3 pb-2">
                      {recentList.map((term, i) => (
                        <button
                          key={i}
                          onClick={() => setQuery(term)}
                          className="px-2.5 py-1 rounded-lg bg-white/5 hover:bg-white/10 border border-white/5 text-xs text-gray-300 hover:text-white transition-colors"
                        >
                          {term}
                        </button>
                      ))}
                    </div>
                  </div>
                )}

                {/* Quick Jumps */}
                <div>
                  <div className="flex items-center gap-1.5 px-3 py-1.5 text-[11px] font-mono uppercase tracking-wider text-gray-400 font-semibold mb-1">
                    <Compass className="w-3.5 h-3.5 text-indigo-400" />
                    <span>Quick Navigation</span>
                  </div>
                  <div className="space-y-1">
                    {QUICK_LINKS.map((q, i) => (
                      <button
                        key={q.path}
                        data-idx={i}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => {
                          setOpen(false);
                          navigate(q.path);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                          active === i ? "bg-white/10 text-white" : "hover:bg-white/5 text-gray-300"
                        }`}
                      >
                        <span className="text-sm font-medium">{q.label}</span>
                        <div className="flex items-center gap-2">
                          <span className="text-[10px] font-mono text-gray-500">{q.section}</span>
                          <ChevronRight className="w-3.5 h-3.5 text-gray-500" />
                        </div>
                      </button>
                    ))}
                  </div>
                </div>

                {/* Popular Topics */}
                <div className="pt-2 border-t border-white/5">
                  <div className="flex items-center gap-1.5 px-3 py-1 text-[11px] font-mono uppercase tracking-wider text-gray-500 mb-2">
                    <Sparkles className="w-3 h-3 text-amber-400" />
                    <span>Popular Topics</span>
                  </div>
                  <div className="flex flex-wrap gap-1.5 px-3">
                    {SUGGESTED_QUERIES.map((s, i) => (
                      <button
                        key={i}
                        onClick={() => setQuery(s)}
                        className="px-2.5 py-1 rounded-md text-xs bg-indigo-500/10 hover:bg-indigo-500/20 text-indigo-300 border border-indigo-500/20 transition-colors"
                      >
                        {s}
                      </button>
                    ))}
                  </div>
                </div>
              </>
            )}

            {query && !index && (
              <div className="px-4 py-12 text-center text-sm text-gray-500">
                <div className="inline-block w-6 h-6 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin mb-2" />
                <div>Searching knowledge index…</div>
              </div>
            )}

            {/* Empty State (Item 31) */}
            {query && index && results.length === 0 && (
              <div className="px-4 py-12 text-center">
                <div className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 mx-auto flex items-center justify-center text-gray-400 mb-3">
                  <svg className="w-6 h-6" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5">
                    <circle cx="11" cy="11" r="8" />
                    <path d="m21 21-4.3-4.3" />
                    <line x1="8" y1="11" x2="14" y2="11" />
                  </svg>
                </div>
                <div className="text-sm font-medium text-gray-200 mb-1">No topics matching “{query}”</div>
                <div className="text-xs text-gray-400 max-w-sm mx-auto mb-4">
                  Check your spelling, or try searching for a broader concept like “attention”, “loss”, or “agent”.
                </div>
                <div className="flex flex-wrap justify-center gap-2">
                  {SUGGESTED_QUERIES.slice(0, 4).map((s, i) => (
                    <button
                      key={i}
                      onClick={() => setQuery(s)}
                      className="px-2.5 py-1 rounded-md text-xs bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 transition-colors"
                    >
                      {s}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Results Grouped by Section (Item 12) */}
            {query &&
              groupedResults.map((group) => (
                <div key={group.theme.id} className="space-y-1">
                  <div className="px-3 py-1 flex items-center justify-between text-[11px] font-mono uppercase tracking-wider text-gray-400 border-b border-white/5 pb-1 mb-1">
                    <div className="flex items-center gap-1.5">
                      <span className={`w-2 h-2 rounded-full ${group.theme.barColor}`} />
                      <span className="font-semibold text-gray-300">{group.theme.name}</span>
                    </div>
                    <span className="text-[10px] text-gray-500 font-mono">
                      {group.items.length} {group.items.length === 1 ? "result" : "results"}
                    </span>
                  </div>

                  {group.items.map((r) => {
                    const i = r.globalIndex;
                    return (
                      <button
                        key={`${r.entry.path}-${r.matchedSection?.hash ?? ""}`}
                        data-idx={i}
                        onMouseEnter={() => setActive(i)}
                        onClick={() => go(r.entry, r.matchedSection)}
                        className={`w-full text-left px-3.5 py-2.5 rounded-xl flex items-center justify-between gap-3 transition-colors ${
                          active === i ? "bg-white/10 text-white" : "hover:bg-white/5 text-gray-300"
                        }`}
                      >
                        <div className="min-w-0 flex-1">
                          <div className="flex items-center gap-2">
                            <span className="text-sm font-medium text-gray-100 truncate">
                              <Highlight text={r.entry.title} query={query} />
                            </span>
                            {r.matchedSection && (
                              <>
                                <span className="text-gray-500 text-xs shrink-0">›</span>
                                <span className={`text-xs ${group.theme.text} font-mono truncate`}>
                                  <Highlight text={r.matchedSection.label} query={query} />
                                </span>
                              </>
                            )}
                          </div>
                          <div className="text-[11px] font-mono text-gray-500 truncate mt-0.5">
                            {r.entry.path}
                          </div>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-mono shrink-0 border ${group.theme.badgeBg}`}>
                          {group.theme.badgeLabel}
                        </span>
                      </button>
                    );
                  })}
                </div>
              ))}
          </div>

          {/* Footer Bar */}
          <div className="flex items-center justify-between px-4 sm:px-5 py-2.5 border-t border-white/10 bg-white/[0.02] text-[0.6875rem] text-gray-500">
            <div className="flex items-center gap-3">
              <span><kbd className="font-mono bg-white/5 border border-white/10 rounded px-1">↑↓</kbd> navigate</span>
              <span><kbd className="font-mono bg-white/5 border border-white/10 rounded px-1">↵</kbd> open</span>
              <span><kbd className="font-mono bg-white/5 border border-white/10 rounded px-1">esc</kbd> close</span>
            </div>
            {index && <span className="font-mono">{index.length} pages indexed</span>}
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
      className="flex items-center gap-2 px-3 py-1.5 rounded-xl border border-white/10 bg-white/5 text-gray-400 hover:text-white hover:border-white/25 transition-all shadow-sm"
    >
      <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2">
        <circle cx="11" cy="11" r="8" />
        <path d="m21 21-4.3-4.3" />
      </svg>
      <span className="hidden sm:inline xl:hidden 2xl:inline text-xs font-medium">Search</span>
      <kbd className="hidden sm:inline xl:hidden 2xl:inline text-[0.625rem] font-mono border border-white/15 rounded px-1.5 py-0.5 bg-white/5">
        {isMac ? "⌘" : "Ctrl"}K
      </kbd>
    </button>
  );
}

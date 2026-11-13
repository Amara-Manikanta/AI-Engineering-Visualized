import React, { useEffect, useState, useContext, lazy, Suspense } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, Check, BookOpen, Code2, Sparkles, Terminal, FileCode, Copy, Folder, ArrowUp, ListOrdered, X } from "lucide-react";
import GlobalHeader from "./GlobalHeader";
import Footer from "./Footer";
import { AZURE_LINKS, AWS_LINKS } from "../config/navigation";
import { PYTHON_LINKS } from "../config/pythonNavigation";
import { neighbours, sectionFor } from "../lib/pageOrder";
import { useReadPages, setRead } from "../lib/progress";
import UserTopicNotes from "./UserTopicNotes";
import TopicPythonLab from "./TopicPythonLab";
import { getCustomPageCode, clearCustomPageCode, getSourceFileInfo } from "../lib/pageSources";
import { GuideLayoutContext } from "../lib/GuideLayoutContext";
import ErrorBoundary from "./ErrorBoundary";
import { getSectionTheme } from "../lib/sectionTheme";

// The code studio and the JSX sandbox it needs (compiler, every icon, every lab) weigh over a
// megabyte. Readers who never edit a page should not download them, so both load on demand.
const TopicCodeStudio = lazy(() => import("./TopicCodeStudio"));
const loadRuntime = () => import("../lib/jsxRuntime");

const cleanName = (n) => n.replace(/^·\s*/, "");

/* Scroll-spy: the TOC entry whose section top has most recently passed under
   the sticky header. A scroll listener (throttled to one read per frame) is
   used instead of IntersectionObserver because tabbed pages mount and unmount
   sections, and re-querying ids each frame handles that for free. */
function useActiveSection(ids) {
  const [active, setActive] = useState("");
  const key = ids.join("|");
  useEffect(() => {
    if (!ids.length) return undefined;
    let frame = 0;
    const measure = () => {
      frame = 0;
      let current = "";
      for (const id of ids) {
        const el = document.getElementById(id);
        if (el && el.getBoundingClientRect().top <= 140) current = id;
      }
      // At the very bottom the last short sections can never reach the top.
      if (window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4) {
        const last = [...ids].reverse().find((id) => document.getElementById(id));
        if (last) current = last;
      }
      setActive(current);
    };
    const onScroll = () => {
      if (!frame) frame = requestAnimationFrame(measure);
    };
    measure();
    window.addEventListener("scroll", onScroll, { passive: true });
    window.addEventListener("resize", onScroll);
    return () => {
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("resize", onScroll);
      if (frame) cancelAnimationFrame(frame);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps -- `key` captures the ids
  }, [key]);
  return active;
}

/**
 * onTocClick — optional. Called with the clicked toc item's hash before the
 * scroll is attempted. Pages that only render one section at a time (a tabbed
 * view) use it to bring the target section into the DOM first; without it a
 * toc entry for a hidden section silently does nothing.
 */
export default function GuideLayout({ title, intro, toc = [], children, onTocClick }) {
  const isNestedGuideLayout = useContext(GuideLayoutContext);
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const [layoutMode, setLayoutMode] = useState("view"); // "view" | "code"
  const [customComponent, setCustomComponent] = useState(null);
  const [customError, setCustomError] = useState(null);
  const [hasCustomOverride, setHasCustomOverride] = useState(false);
  const location = useLocation();
  const read = useReadPages();
  const isRead = read.has(location.pathname);
  const { prev, next } = neighbours(location.pathname);
  const isMacApp = typeof window !== "undefined" && Boolean(window.electronAPI);
  const sectionTheme = getSectionTheme(location.pathname);
  const [scrollProgress, setScrollProgress] = useState(0);
  const [showBackToTop, setShowBackToTop] = useState(false);
  const [mobileTocOpen, setMobileTocOpen] = useState(false);
  const [navSectionOpen, setNavSectionOpen] = useState(true);
  const [localTocOpen, setLocalTocOpen] = useState(true);

  // Track reading scroll progress (Item 9) & back-to-top trigger (Item 20)
  useEffect(() => {
    const handleScroll = () => {
      const el = document.documentElement;
      const total = el.scrollHeight - window.innerHeight;
      if (total > 0) {
        setScrollProgress(Math.min(100, Math.max(0, (window.scrollY / total) * 100)));
      }
      setShowBackToTop(window.scrollY > 450);
    };
    window.addEventListener("scroll", handleScroll, { passive: true });
    handleScroll();
    return () => window.removeEventListener("scroll", handleScroll);
  }, [location.pathname]);

  const fileInfo = getSourceFileInfo(location.pathname);
  const [copiedPath, setCopiedPath] = useState(false);

  const handleCopyPath = async (e) => {
    e.stopPropagation();
    try {
      await navigator.clipboard.writeText(fileInfo.fullRepoPath);
      setCopiedPath(true);
      setTimeout(() => setCopiedPath(false), 1600);
    } catch {
      /* noop */
    }
  };

  const handleRevealInFinder = async (e) => {
    e.stopPropagation();
    if (typeof window !== "undefined" && window.electronAPI?.revealSourceFile) {
      await window.electronAPI.revealSourceFile(fileInfo.fullRepoPath);
    }
  };

  // Sync custom override whenever location.pathname changes or custom event fires (macOS app only)
  useEffect(() => {
    if (!isMacApp) return;
    let live = true;
    const updateCustomComponent = () => {
      const customCode = getCustomPageCode(location.pathname);
      if (customCode) {
        setHasCustomOverride(true);
        loadRuntime()
          .then(({ compileAndEvaluate }) => {
            // The page or the override may have changed while the sandbox was loading.
            if (!live || getCustomPageCode(location.pathname) !== customCode) return;
            const { Component: Comp, error } = compileAndEvaluate(customCode);
            if (error) {
              setCustomError(error);
              setCustomComponent(null);
            } else {
              setCustomError(null);
              setCustomComponent(() => Comp);
            }
          })
          .catch(() => {
            if (!live) return;
            setCustomError("Could not load the page editor. Check your connection and reload.");
            setCustomComponent(null);
          });
      } else {
        setHasCustomOverride(false);
        setCustomComponent(null);
        setCustomError(null);
      }
    };

    updateCustomComponent();
    window.addEventListener("topic_custom_code_change", updateCustomComponent);
    return () => {
      live = false;
      window.removeEventListener("topic_custom_code_change", updateCustomComponent);
    };
  }, [location.pathname, isMacApp]);

  const handleRevertCustom = () => {
    if (window.confirm("Revert back to the original version of this topic?")) {
      clearCustomPageCode(location.pathname);
    }
  };

  const ids = toc.map((item) => item.hash.replace(/^#/, ""));
  const activeId = useActiveSection(ids);

  // "#/page#section" links: once the page has rendered, bring the section into view.
  useEffect(() => {
    if (!location.hash) return undefined;
    const id = decodeURIComponent(location.hash.slice(1));
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), 150);
    return () => clearTimeout(t);
  }, [location.pathname, location.hash]);

  if (isNestedGuideLayout) {
    return (
      <div className="nested-guide-content space-y-8">
        {children}
      </div>
    );
  }

  let sidebarLinks = null;
  let sectionTitle = "";

  if (location.pathname.startsWith("/azure")) {
    sidebarLinks = AZURE_LINKS;
    sectionTitle = "Azure Pages";
  } else if (location.pathname.startsWith("/aws")) {
    sidebarLinks = AWS_LINKS;
    sectionTitle = "AWS Pages";
  } else if (location.pathname.startsWith("/python")) {
    sidebarLinks = PYTHON_LINKS;
    sectionTitle = "Python Modules";
  } else {
    // Every other page: the pages under the same menu sub-heading.
    const sec = sectionFor(location.pathname);
    if (sec && sec.items.length > 1) {
      sidebarLinks = sec.items.map((l) => ({ ...l, name: l.name.replace(/^·\s*/, "") }));
      sectionTitle = sec.header ? `${sec.group} · ${sec.header}` : sec.group;
    }
  }

  return (
    <div className="min-h-screen flex flex-col bg-[#0a0a0a] text-gray-300 font-sans">
      <GlobalHeader />

      {/* Reading Progress Bar (Item 9) */}
      <div className="fixed top-[64px] left-0 right-0 h-[2.5px] z-40 bg-white/5 pointer-events-none">
        <div
          className={`h-full ${sectionTheme.barColor} transition-[width] duration-150 ease-out`}
          style={{ width: `${scrollProgress}%` }}
        />
      </div>

      <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 mt-6 max-w-[1200px] mx-auto px-4 sm:px-5 pb-20 w-full">

        {/* Sidebar TOC — collapsible sections on desktop, sticky (Item 10) */}
        <aside className="lg:w-[260px] shrink-0 lg:sticky lg:top-[85px] h-fit bg-[#121217]/90 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden shadow-lg">

          {/* Mobile toggle header */}
          <button
            className="lg:hidden w-full flex items-center justify-between p-4"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-expanded={sidebarOpen}
            aria-controls="guide-sidebar"
          >
            <div className="flex items-center gap-2">
              <span className={`w-2 h-2 rounded-full ${sectionTheme.barColor}`} />
              <span className="font-bold text-sm text-white uppercase tracking-wider text-left">{title}</span>
            </div>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${sidebarOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Desktop header (always visible) */}
          <div className="hidden lg:flex items-center justify-between p-5 pb-3 border-b border-white/5">
            <h3 className="font-bold text-xs text-white uppercase tracking-wider font-mono truncate">{title}</h3>
            {sidebarLinks && (
              <span className="text-[10px] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                {sidebarLinks.filter(l => read.has(l.path)).length}/{sidebarLinks.length}
              </span>
            )}
          </div>

          {/* Navigation & TOC */}
          <nav
            id="guide-sidebar"
            aria-label="Page contents"
            className={`${sidebarOpen ? "block" : "hidden"} lg:block overflow-y-auto max-h-[60vh] lg:max-h-[calc(100vh-140px)] custom-scrollbar`}
          >
            {/* Collapsible Section Navigation */}
            {sidebarLinks && (
              <div className="p-3 lg:p-4 border-b border-white/5">
                <button
                  type="button"
                  onClick={() => setNavSectionOpen(!navSectionOpen)}
                  className="w-full flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 hover:text-white transition-colors cursor-pointer"
                >
                  <span className="truncate">{sectionTitle}</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${navSectionOpen ? "rotate-0" : "-rotate-90"}`} />
                </button>
                {navSectionOpen && (
                  <div className="flex flex-col gap-0.5 pt-1">
                    {sidebarLinks.map((link, i) => (
                      <Link
                        key={i}
                        to={link.path}
                        onClick={() => setSidebarOpen(false)}
                        aria-current={location.pathname === link.path ? "page" : undefined}
                        className={`flex items-center justify-between gap-2 py-1.5 px-2 rounded-lg text-xs transition-colors ${
                          location.pathname === link.path
                            ? `${sectionTheme.badgeBg} font-semibold`
                            : "text-gray-400 hover:text-white hover:bg-white/5"
                        }`}
                      >
                        <span className="truncate">{link.name}</span>
                        {read.has(link.path) && (
                          <Check className="w-3.5 h-3.5 text-emerald-400 shrink-0" aria-label="read" />
                        )}
                      </Link>
                    ))}
                  </div>
                )}
              </div>
            )}

            {/* Collapsible Local TOC */}
            {toc.length > 0 && (
              <div className="p-3 lg:p-4">
                <button
                  type="button"
                  onClick={() => setLocalTocOpen(!localTocOpen)}
                  className="w-full flex items-center justify-between text-xs font-bold text-gray-400 uppercase tracking-wider mb-2 hover:text-white transition-colors cursor-pointer"
                >
                  <span>On this page</span>
                  <ChevronDown className={`w-3.5 h-3.5 transition-transform ${localTocOpen ? "rotate-0" : "-rotate-90"}`} />
                </button>
                {localTocOpen && (
                  <div className="flex flex-col gap-0.5 pt-1">
                    {toc.map((item, i) => {
                      const id = ids[i];
                      const active = activeId === id;
                      return (
                        <a
                          key={i}
                          href={`#${location.pathname}#${id}`}
                          aria-current={active ? "location" : undefined}
                          onClick={(e) => {
                            e.preventDefault();
                            setSidebarOpen(false);
                            onTocClick?.(id);
                            requestAnimationFrame(() => {
                              const el = document.getElementById(id);
                              if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                            });
                          }}
                          className={`block py-1.5 text-xs transition-colors border-l-2 ${
                            item.indent ? "pl-5 text-[11px]" : "pl-2.5"
                          } ${
                            active
                              ? `${sectionTheme.text} font-semibold border-current`
                              : `text-gray-400 ${sectionTheme.linkHover} border-transparent hover:border-white/20`
                          }`}
                        >
                          <span className="truncate block">{item.label}</span>
                        </a>
                      );
                    })}
                  </div>
                )}
              </div>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          {/* macOS App Only: Personal Learning Mode (View Topic / Python Lab / Source Code Studio) */}
          {isMacApp && (
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6 p-2 rounded-2xl bg-white/[0.03] border border-white/10 backdrop-blur-md">
              <div className="flex flex-wrap items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10">
                <button
                  onClick={() => setLayoutMode("view")}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    layoutMode === "view"
                      ? "bg-indigo-600 text-white shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <BookOpen className="w-3.5 h-3.5" />
                  <span>View Topic</span>
                </button>
                <button
                  onClick={() => setLayoutMode("lab")}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    layoutMode === "lab"
                      ? "bg-emerald-600 text-white shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Terminal className="w-3.5 h-3.5" />
                  <span>Python Lab</span>
                </button>
                <button
                  onClick={() => setLayoutMode("code")}
                  className={`flex items-center gap-2 px-3.5 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                    layoutMode === "code"
                      ? "bg-purple-600 text-white shadow-md"
                      : "text-gray-400 hover:text-white"
                  }`}
                >
                  <Code2 className="w-3.5 h-3.5" />
                  <span>Source Code &amp; Test</span>
                  {hasCustomOverride && <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />}
                </button>
              </div>

              {/* Right: Source Code File Path & Custom State */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Source Code Path Pill */}
                <div
                  className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10 hover:border-indigo-500/40 text-xs font-mono transition-all shadow-inner group"
                  title={`Source file: ${fileInfo.fullRepoPath} (Click to open code studio)`}
                >
                  <FileCode className="w-3.5 h-3.5 text-indigo-400 shrink-0" />
                  <button
                    type="button"
                    onClick={() => setLayoutMode("code")}
                    className="flex items-center text-left hover:text-indigo-300 transition-colors cursor-pointer"
                  >
                    <span className="text-gray-500 hidden sm:inline">{fileInfo.dirPath}</span>
                    <span className="text-white font-semibold group-hover:text-indigo-300">{fileInfo.fileName}</span>
                  </button>

                  {/* Copy full path */}
                  <button
                    type="button"
                    onClick={handleCopyPath}
                    title="Copy full source file path"
                    className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-white cursor-pointer ml-1"
                  >
                    {copiedPath ? (
                      <Check className="w-3.5 h-3.5 text-emerald-400" />
                    ) : (
                      <Copy className="w-3.5 h-3.5" />
                    )}
                  </button>

                  {/* macOS Reveal in Finder (when running in macOS desktop app) */}
                  {Boolean(window.electronAPI?.revealSourceFile) && (
                    <button
                      type="button"
                      onClick={handleRevealInFinder}
                      title="Reveal source file in macOS Finder"
                      className="p-1 hover:bg-white/10 rounded transition-colors text-gray-400 hover:text-indigo-300 cursor-pointer"
                    >
                      <Folder className="w-3.5 h-3.5" />
                    </button>
                  )}
                </div>

                {hasCustomOverride && (
                  <div className="flex items-center gap-2">
                    <span className="text-[11px] font-mono text-emerald-400 flex items-center gap-1">
                      <Sparkles className="w-3 h-3" /> Custom Active
                    </span>
                    <button
                      onClick={handleRevertCustom}
                      className="px-2.5 py-1 rounded-lg text-[10px] font-mono bg-white/5 hover:bg-red-500/20 text-gray-400 hover:text-red-300 border border-white/10 transition-colors cursor-pointer"
                    >
                      Revert to Default
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}

          {isMacApp && layoutMode === "lab" ? (
            <TopicPythonLab
              pagePath={location.pathname}
              title={title}
              onBackToView={() => setLayoutMode("view")}
            />
          ) : isMacApp && layoutMode === "code" ? (
            <Suspense fallback={<div className="py-16 text-center text-gray-400 font-mono text-xs">Loading code studio…</div>}>
              <TopicCodeStudio
                pagePath={location.pathname}
                title={title}
                onRevertToView={() => setLayoutMode("view")}
              />
            </Suspense>
          ) : (
            <GuideLayoutContext.Provider value={true}>
              {isMacApp && hasCustomOverride && customError && (
                <div className="mb-6 p-4 rounded-2xl bg-red-950/30 border border-red-500/40 text-rose-300 text-xs font-mono">
                  <div className="font-bold flex items-center justify-between mb-1">
                    <span>⚠️ Custom version failed to render:</span>
                    <button
                      onClick={() => setLayoutMode("code")}
                      className="text-purple-400 underline hover:text-purple-300 cursor-pointer"
                    >
                      Fix in Code Studio
                    </button>
                  </div>
                  <div className="opacity-80">{customError}</div>
                </div>
              )}

              {/* Breadcrumb Navigation (Item 8) */}
              <nav aria-label="Breadcrumbs" className="flex items-center gap-1.5 text-xs text-gray-500 mb-4 font-mono">
                <Link to="/" className="hover:text-gray-300 transition-colors">Home</Link>
                <span className="text-gray-600">/</span>
                <Link to={sectionTheme.parentPath} className={`hover:${sectionTheme.linkHover} transition-colors font-medium`}>
                  {sectionTheme.badgeLabel}
                </Link>
                <span className="text-gray-600">/</span>
                <span className="text-gray-300 truncate max-w-[200px] sm:max-w-none">{title}</span>
              </nav>

              {/* Topic Hero Band (Item 13) */}
              <div className="mb-8 lg:mb-10">
                <div className="flex flex-wrap items-center gap-2 mb-3">
                  <span className={`inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[11px] font-semibold border ${sectionTheme.badgeBg}`}>
                    {sectionTheme.badgeLabel}
                  </span>
                </div>
                <h1 className="text-3xl sm:text-4xl lg:text-5xl font-black text-white mb-3.5 tracking-tight font-display">
                  {title}
                </h1>
                <p className="text-base sm:text-lg text-gray-300 leading-relaxed font-normal max-w-3xl">
                  {intro}
                </p>
              </div>

              <div className="space-y-8 lg:space-y-12">
                {isMacApp && customComponent ? (
                  // An edited page can compile and still throw while rendering. Without this it
                  // would blank the app on every visit, because the edit is saved on the device.
                  <ErrorBoundary
                    resetKey={customComponent}
                    fallback={(error) => (
                      <div className="p-5 rounded-2xl bg-red-950/30 border border-red-500/40 text-sm text-rose-200">
                        <div className="font-bold mb-1">Your edited version of this page crashed</div>
                        <p className="text-xs font-mono opacity-80 break-words mb-4">{String(error?.message || error)}</p>
                        <div className="flex flex-wrap gap-2">
                          <button
                            onClick={() => clearCustomPageCode(location.pathname)}
                            className="px-3 py-2 min-h-9 rounded-lg bg-white/10 hover:bg-white/15 text-white text-xs font-semibold cursor-pointer"
                          >
                            Restore the original page
                          </button>
                          <button
                            onClick={() => setLayoutMode("code")}
                            className="px-3 py-2 min-h-9 rounded-lg bg-purple-500/20 hover:bg-purple-500/30 text-purple-100 text-xs font-semibold cursor-pointer"
                          >
                            Fix in Code Studio
                          </button>
                        </div>
                      </div>
                    )}
                  >
                    {React.createElement(customComponent)}
                  </ErrorBoundary>
                ) : (
                  children
                )}
              </div>

              {/* Topic Python Practice Lab directly at the bottom of each topic page (macOS app only) */}
              {isMacApp && (
                <div className="mt-14 mb-8">
                  <TopicPythonLab pagePath={location.pathname} title={title} />
                </div>
              )}
            </GuideLayoutContext.Provider>
          )}

          {/* User Custom Points & Notes (Offline Persistent) */}
          <UserTopicNotes pagePath={location.pathname + location.hash} toc={toc} />

          {/* Progress + reading order */}
          <div className="mt-14 pt-6 border-t border-white/10">
            <div className="flex flex-wrap items-center justify-between gap-3 mb-6">
              <p className="text-sm text-gray-500 m-0">
                {isRead ? "Marked as read on this device." : "Finished this page? Mark it to track your progress."}
              </p>
              <button
                onClick={() => setRead(location.pathname, !isRead)}
                aria-pressed={isRead}
                className={`inline-flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
                  isRead
                    ? "border-emerald-500/40 bg-emerald-500/15 text-emerald-300 hover:bg-emerald-500/25"
                    : "border-white/15 bg-white/5 text-gray-300 hover:text-white hover:bg-white/10"
                }`}
              >
                <Check className="w-4 h-4" />
                {isRead ? "Read" : "Mark as read"}
              </button>
            </div>

            {(prev || next) && (
              <nav aria-label="Previous and next pages" className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                {prev ? (
                  <Link
                    to={prev.path}
                    className={`group flex items-center gap-3.5 p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm ${sectionTheme.borderHover} hover:bg-white/[0.06] transition-all duration-200`}
                  >
                    <ChevronLeft className={`w-5 h-5 text-gray-500 group-hover:${sectionTheme.text} shrink-0 transition-transform group-hover:-translate-x-1`} />
                    <span className="min-w-0">
                      <span className="block text-[0.6875rem] uppercase tracking-wider text-gray-500 font-bold mb-0.5">Previous</span>
                      <span className="block text-sm font-semibold text-gray-200 group-hover:text-white truncate transition-colors">{cleanName(prev.name)}</span>
                    </span>
                  </Link>
                ) : (
                  <span className="hidden sm:block" />
                )}
                {next && (
                  <Link
                    to={next.path}
                    className={`group flex items-center justify-end gap-3.5 p-4 sm:p-5 rounded-2xl border border-white/10 bg-white/[0.03] backdrop-blur-sm ${sectionTheme.borderHover} hover:bg-white/[0.06] transition-all duration-200 text-right`}
                  >
                    <span className="min-w-0">
                      <span className="block text-[0.6875rem] uppercase tracking-wider text-gray-500 font-bold mb-0.5">Next</span>
                      <span className="block text-sm font-semibold text-gray-200 group-hover:text-white truncate transition-colors">{cleanName(next.name)}</span>
                    </span>
                    <ChevronRight className={`w-5 h-5 text-gray-500 group-hover:${sectionTheme.text} shrink-0 transition-transform group-hover:translate-x-1`} />
                  </Link>
                )}
              </nav>
            )}
          </div>
        </main>

      </div>

      {/* Mobile Floating Action Button for Table of Contents (Item 28) */}
      {toc.length > 0 && (
        <button
          onClick={() => setMobileTocOpen(true)}
          aria-label="Open Table of Contents"
          className="lg:hidden fixed bottom-20 right-5 z-40 flex items-center gap-2 px-3.5 py-2.5 rounded-full bg-[#161622]/95 backdrop-blur-md border border-white/20 shadow-2xl text-xs font-semibold text-white hover:border-indigo-400 transition-all cursor-pointer"
        >
          <ListOrdered className="w-4 h-4 text-indigo-400" />
          <span>Contents</span>
        </button>
      )}

      {/* Mobile Slide-up TOC Sheet (Item 28) */}
      {mobileTocOpen && (
        <div className="fixed inset-0 z-[100] lg:hidden animate-in fade-in duration-200">
          <div
            className="absolute inset-0 bg-black/60 backdrop-blur-sm"
            onClick={() => setMobileTocOpen(false)}
          />
          <div className="absolute inset-x-0 bottom-0 bg-[#121217] border-t border-white/15 rounded-t-3xl shadow-2xl p-6 max-h-[75vh] overflow-y-auto custom-scrollbar flex flex-col">
            <div className="flex items-center justify-between pb-3 mb-3 border-b border-white/10">
              <div className="flex items-center gap-2">
                <span className={`w-2 h-2 rounded-full ${sectionTheme.barColor}`} />
                <span className="text-xs font-mono uppercase tracking-wider font-bold text-white">
                  Table of Contents
                </span>
              </div>
              <button
                onClick={() => setMobileTocOpen(false)}
                className="p-1.5 rounded-lg text-gray-400 hover:text-white hover:bg-white/10"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
            <div className="space-y-1.5 py-2">
              {toc.map((item, i) => {
                const id = ids[i];
                const active = activeId === id;
                return (
                  <button
                    key={i}
                    onClick={() => {
                      setMobileTocOpen(false);
                      onTocClick?.(id);
                      requestAnimationFrame(() => {
                        const el = document.getElementById(id);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      });
                    }}
                    className={`w-full text-left px-3 py-2 rounded-xl text-xs transition-colors flex items-center justify-between ${
                      item.indent ? "pl-6 text-[11px]" : ""
                    } ${
                      active
                        ? `${sectionTheme.badgeBg} font-semibold`
                        : "text-gray-300 hover:text-white hover:bg-white/5"
                    }`}
                  >
                    <span className="truncate">{item.label}</span>
                    {active && <span className={`w-1.5 h-1.5 rounded-full ${sectionTheme.barColor}`} />}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Floating Back-to-Top Button (Item 20) */}
      {showBackToTop && (
        <button
          onClick={() => window.scrollTo({ top: 0, behavior: "smooth" })}
          aria-label="Back to top"
          className="fixed bottom-32 right-5 lg:bottom-8 lg:right-8 z-40 p-3 rounded-full bg-[#181822]/90 backdrop-blur-md border border-white/15 shadow-xl text-gray-300 hover:text-white hover:border-indigo-500/50 hover:scale-105 active:scale-95 transition-all cursor-pointer"
        >
          <ArrowUp className="w-4 h-4" />
        </button>
      )}

      <Footer />
    </div>
  );
}

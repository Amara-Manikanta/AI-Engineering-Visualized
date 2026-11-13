import { useState, useEffect, useRef } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, ChevronRight, ArrowRight, Menu, X } from "lucide-react";
import CommandPalette from "./CommandPalette";
import ReadingSize from "./ReadingSize";
import { NAV_LINKS } from "../config/navigation";
import { getSectionTheme } from "../lib/sectionTheme";

function groupSubLinks(subLinks) {
  if (!subLinks) return [];
  const groups = [];
  let currentGroup = { title: "Overview", items: [] };
  for (const item of subLinks) {
    if (item.isHeader) {
      if (currentGroup.items.length > 0) {
        groups.push(currentGroup);
      }
      currentGroup = { title: item.name, items: [] };
    } else {
      currentGroup.items.push(item);
    }
  }
  if (currentGroup.items.length > 0) {
    groups.push(currentGroup);
  }
  return groups;
}

export default function GlobalHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const closeTimerRef = useRef(null);
  const location = useLocation();

  const handleMouseEnter = (i) => {
    if (closeTimerRef.current) {
      clearTimeout(closeTimerRef.current);
      closeTimerRef.current = null;
    }
    setOpenDropdown(i);
  };

  const handleMouseLeave = () => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    closeTimerRef.current = setTimeout(() => {
      setOpenDropdown(null);
    }, 220); // 220ms grace window for mouse transitions
  };

  // Close menus on route change — a clicked dropdown link would otherwise leave
  // its menu hanging open over the new page until the mouse moved away.
  useEffect(() => {
    if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    setMobileOpen(false);
    setMobileExpanded(null);
    setOpenDropdown(null);
  }, [location.pathname, location.hash]);

  // Clean up timer on unmount
  useEffect(() => {
    return () => {
      if (closeTimerRef.current) clearTimeout(closeTimerRef.current);
    };
  }, []);

  // Escape closes an open dropdown.
  useEffect(() => {
    if (openDropdown === null) return undefined;
    const onKey = (e) => e.key === "Escape" && setOpenDropdown(null);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [openDropdown]);

  // Prevent body scroll when mobile menu is open
  useEffect(() => {
    if (mobileOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "";
    }
    return () => { document.body.style.overflow = ""; };
  }, [mobileOpen]);

  return (
    <>
      {/* ====== HEADER BAR ====== */}
      <header className="sticky top-0 z-50 w-full bg-[#0a0a0a]/80 backdrop-blur-md border-b border-white/10 text-white">
        <div className="max-w-[1400px] mx-auto px-4 h-16 flex items-center justify-between">
          
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2.5 text-base sm:text-xl font-bold hover:opacity-90 transition-opacity min-w-0 sm:shrink-0 group">
            <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[1.5px] shrink-0 shadow-lg shadow-indigo-500/25 group-hover:shadow-indigo-500/40 transition-shadow">
              <div className="w-full h-full bg-[#0a0a0f] rounded-[10px] flex items-center justify-center">
                <svg className="w-4 h-4 text-indigo-400 group-hover:scale-110 transition-transform" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                  <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                </svg>
              </div>
            </div>
            <span className="truncate tracking-tight font-display">AI Visualised <span className="text-indigo-400">Engineering</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-3 2xl:gap-5 ml-4 h-full">
            {NAV_LINKS.map((nav, i) => (
              <div 
                key={i} 
                className="relative h-full flex items-center group"
                onMouseEnter={() => handleMouseEnter(i)}
                onMouseLeave={handleMouseLeave}
                // Keyboard users: the menu stays open while focus is inside it.
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) handleMouseLeave();
                }}
              >
                {nav.subLinks ? (
                  <div className="flex items-center gap-1 py-4 text-sm font-medium text-gray-300 hover:text-white transition-colors whitespace-nowrap">
                    <Link to={nav.path}>{nav.name}</Link>
                    <button
                      type="button"
                      onClick={() => setOpenDropdown(openDropdown === i ? null : i)}
                      aria-expanded={openDropdown === i}
                      aria-haspopup="true"
                      aria-label={`Open ${nav.name.replace(/^\S+\s/, "")} menu`}
                      className="p-0.5 rounded hover:bg-white/10 focus-visible:outline focus-visible:outline-2 focus-visible:outline-indigo-400"
                    >
                      <ChevronDown className={`w-4 h-4 opacity-50 transition-transform ${openDropdown === i ? "rotate-180" : ""}`} />
                    </button>
                  </div>
                ) : (
                  <Link to={nav.path} className="block py-4 text-sm font-medium text-gray-300 hover:text-white transition-colors whitespace-nowrap">
                    {nav.name}
                  </Link>
                )}

                {nav.subLinks && openDropdown === i && (() => {
                  const groups = groupSubLinks(nav.subLinks);
                  const theme = getSectionTheme(nav.path);
                  const isMultiCol = groups.length > 1;
                  return (
                    <div
                      onMouseEnter={() => handleMouseEnter(i)}
                      onMouseLeave={handleMouseLeave}
                      className={`absolute top-full z-50 pt-2 ${
                        isMultiCol
                          ? groups.length >= 4
                            ? "w-[880px] max-w-[calc(100vw-32px)]"
                            : "w-[640px] max-w-[calc(100vw-32px)]"
                          : "w-64"
                      } ${i > 4 ? "right-0" : i < 2 ? "left-0" : "left-1/2 -translate-x-1/2"}`}
                    >
                      {/* Invisible bridge eliminating mouse gap */}
                      <div className="absolute -top-3 left-0 right-0 h-4" />

                      <div className="bg-[#101015]/95 border border-white/10 rounded-2xl shadow-2xl backdrop-blur-2xl p-5 overflow-hidden transition-all duration-200 animate-in fade-in slide-in-from-top-1">
                        <div className="flex items-center justify-between pb-3 mb-4 border-b border-white/10">
                          <div className="flex items-center gap-2">
                            <span className={`w-2 h-2 rounded-full ${theme.barColor}`} />
                            <span className="text-xs font-bold text-white uppercase tracking-wider font-mono">
                              {nav.name}
                            </span>
                          </div>
                          <span className="text-[11px] text-gray-500 font-mono">
                            {nav.subLinks.filter(s => !s.isHeader).length} topics
                          </span>
                        </div>

                        <div
                          className={`grid gap-5 max-h-[65vh] overflow-y-auto custom-scrollbar pr-1 ${
                            isMultiCol
                              ? groups.length >= 4
                                ? "grid-cols-4"
                                : groups.length === 3
                                ? "grid-cols-3"
                                : "grid-cols-2"
                              : "grid-cols-1"
                          }`}
                        >
                          {groups.map((grp, gIdx) => (
                            <div key={gIdx} className="space-y-1">
                              {isMultiCol && (
                                <div className="text-[10px] font-mono font-bold uppercase tracking-wider text-gray-400 mb-2 pb-1 border-b border-white/5 truncate">
                                  {grp.title}
                                </div>
                              )}
                              <ul className="space-y-0.5">
                                {grp.items.map((sub, j) => (
                                  <li key={j}>
                                    <Link
                                      to={sub.path}
                                      className={`group/link block px-2.5 py-1.5 rounded-lg text-xs transition-colors ${
                                        location.pathname === sub.path
                                          ? `${theme.badgeBg} font-semibold`
                                          : "text-gray-300 hover:text-white hover:bg-white/5"
                                      }`}
                                    >
                                      <div className="flex items-center justify-between">
                                        <span className="truncate">{sub.name.replace(/^·\s*/, "")}</span>
                                        <ChevronRight className="w-3 h-3 opacity-0 group-hover/link:opacity-60 transition-opacity shrink-0 ml-1" />
                                      </div>
                                    </Link>
                                  </li>
                                ))}
                              </ul>
                            </div>
                          ))}
                        </div>

                        <div className="mt-4 pt-3 border-t border-white/10 flex items-center justify-between text-xs text-gray-400">
                          <span className="text-[11px] text-gray-500">Interactive guides & visualizers</span>
                          <Link
                            to={nav.path}
                            className={`inline-flex items-center gap-1 text-xs font-semibold ${theme.text} hover:underline`}
                          >
                            <span>Explore all in {nav.name}</span>
                            <ArrowRight className="w-3 h-3" />
                          </Link>
                        </div>
                      </div>
                    </div>
                  );
                })()}
              </div>
            ))}
          </nav>

          {/* Global search — Cmd+K */}
          <div className="ml-auto lg:ml-4 mr-2 flex items-center gap-3 shrink-0">
            <div className="hidden sm:block">
              <ReadingSize compact />
            </div>
            <CommandPalette />
          </div>

          {/* Mobile Toggle */}
          <button 
            className="xl:hidden p-2 rounded-lg hover:bg-white/10 transition-colors shrink-0" 
            onClick={() => setMobileOpen(!mobileOpen)}
            aria-label="Toggle navigation menu"
            aria-expanded={mobileOpen}
          >
            {mobileOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
          </button>
        </div>
      </header>

      {/* ====== MOBILE MENU — RENDERED OUTSIDE <header> TO AVOID backdrop-filter STACKING BUG ====== */}
      {mobileOpen && (
        <div className="fixed inset-0 z-[100] xl:hidden">
          {/* Backdrop overlay */}
          <div 
            className="absolute inset-0 bg-black/60"
            onClick={() => setMobileOpen(false)}
          />
          
          {/* Slide-in panel */}
          <nav className="absolute top-0 left-0 right-0 bottom-0 bg-[#0e0e0e] overflow-y-auto flex flex-col">
            {/* Mobile header inside panel */}
            <div className="flex items-center justify-between px-4 h-16 border-b border-white/10 shrink-0">
              <Link to="/" className="flex items-center gap-2.5 text-base font-bold text-white">
                <div className="w-7 h-7 rounded-lg bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 p-[1px] shrink-0">
                  <div className="w-full h-full bg-[#0a0a0f] rounded-[7px] flex items-center justify-center">
                    <svg className="w-3.5 h-3.5 text-indigo-400" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
                      <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5" />
                    </svg>
                  </div>
                </div>
                <span>AI Visualised <span className="text-indigo-400">Engineering</span></span>
              </Link>
              <button 
                className="p-2 rounded-lg hover:bg-white/10 transition-colors text-white"
                onClick={() => setMobileOpen(false)}
                aria-label="Close navigation menu"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Text size — the first thing in the menu on a phone */}
            <div className="flex items-center justify-between px-8 py-4 border-b border-white/10 shrink-0">
              <span className="text-sm font-medium text-gray-300">Text size</span>
              <ReadingSize />
            </div>

            {/* Nav links */}
            <div className="flex-1 overflow-y-auto px-4 py-4 space-y-1">
              {NAV_LINKS.map((nav, i) => (
                <div key={i}>
                  {nav.subLinks ? (
                    <>
                      {/* Accordion header */}
                      <button
                        onClick={() => setMobileExpanded(mobileExpanded === i ? null : i)}
                        aria-expanded={mobileExpanded === i}
                        className="w-full flex items-center justify-between px-4 py-3 rounded-xl text-base font-medium text-gray-200 hover:bg-white/5 transition-colors"
                      >
                        <span>{nav.name}</span>
                        <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${mobileExpanded === i ? "rotate-180" : ""}`} />
                      </button>
                      
                      {/* Accordion body */}
                      {mobileExpanded === i && (
                        <div className="ml-4 pl-4 border-l border-indigo-500/30 space-y-0.5 pb-2">
                          {nav.subLinks.map((sub, j) => (
                            sub.isHeader ? (
                              <div key={j} className="px-3 py-2 mt-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/5">
                                {sub.name}
                              </div>
                            ) : (
                              <Link
                                key={j}
                                to={sub.path}
                                className={`block px-3 py-2.5 rounded-lg text-sm transition-colors ${
                                  location.pathname === sub.path 
                                    ? "text-indigo-400 bg-indigo-500/10 font-semibold" 
                                    : "text-gray-400 hover:text-white hover:bg-white/5"
                                }`}
                              >
                                {sub.name}
                              </Link>
                            )
                          ))}
                        </div>
                      )}
                    </>
                  ) : (
                    <Link
                      to={nav.path}
                      className={`block px-4 py-3 rounded-xl text-base font-medium transition-colors ${
                        location.pathname === nav.path
                          ? "text-indigo-400 bg-indigo-500/10"
                          : "text-gray-200 hover:bg-white/5"
                      }`}
                    >
                      {nav.name}
                    </Link>
                  )}
                </div>
              ))}
            </div>

            {/* Footer */}
            <div className="px-8 py-6 border-t border-white/5 shrink-0">
              <p className="text-xs text-gray-600 text-center">AI Visualised Engineering © 2026</p>
            </div>
          </nav>
        </div>
      )}
    </>
  );
}

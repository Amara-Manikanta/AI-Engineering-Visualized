import { useState, useEffect } from "react";
import { Link, useLocation } from "react-router-dom";
import { ChevronDown, Menu, X } from "lucide-react";
import CommandPalette from "./CommandPalette";
import ReadingSize from "./ReadingSize";
import { NAV_LINKS } from "../config/navigation";


export default function GlobalHeader() {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [openDropdown, setOpenDropdown] = useState(null);
  const [mobileExpanded, setMobileExpanded] = useState(null);
  const location = useLocation();

  // Close menus on route change — a clicked dropdown link would otherwise leave
  // its menu hanging open over the new page until the mouse moved away.
  useEffect(() => {
    setMobileOpen(false);
    setMobileExpanded(null);
    setOpenDropdown(null);
  }, [location.pathname, location.hash]);

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
          <Link to="/" className="flex items-center gap-2 text-lg sm:text-xl font-bold hover:opacity-80 transition-opacity shrink-0">
            <span className="text-2xl">🧠</span>
            <span>AI Visualised <span className="text-indigo-400">Engineering</span></span>
          </Link>

          {/* Desktop Nav */}
          <nav className="hidden xl:flex items-center gap-3 2xl:gap-5 ml-4">
            {NAV_LINKS.map((nav, i) => (
              <div 
                key={i} 
                className="relative group"
                onMouseEnter={() => setOpenDropdown(i)}
                onMouseLeave={() => setOpenDropdown(null)}
                // Keyboard users: the menu stays open while focus is inside it.
                onBlur={(e) => {
                  if (!e.currentTarget.contains(e.relatedTarget)) setOpenDropdown(null);
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

                {nav.subLinks && openDropdown === i && (
                  <div className="absolute top-full left-1/2 -translate-x-1/2 w-52 bg-[#1a1a1a] border border-white/10 rounded-xl shadow-2xl overflow-y-auto max-h-[80vh] py-2 custom-scrollbar">
                    <div className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-white/5 mb-2 sticky top-0 bg-[#1a1a1a] z-10">
                      {nav.name}
                    </div>
                    {nav.subLinks.map((sub, j) => (
                      sub.isHeader ? (
                        <div key={j} className="px-4 py-2 mt-2 text-xs font-bold text-gray-400 uppercase tracking-wider border-b border-white/5 bg-black/20">
                          {sub.name}
                        </div>
                      ) : (
                        <Link 
                          key={j} 
                          to={sub.path}
                          className="block px-4 py-2 text-sm text-gray-300 hover:text-white hover:bg-white/5 transition-colors"
                        >
                          {sub.name}
                        </Link>
                      )
                    ))}
                  </div>
                )}
              </div>
            ))}
          </nav>

          {/* Global search — Cmd+K */}
          <div className="ml-auto lg:ml-4 mr-2 flex items-center gap-3">
            <div className="hidden sm:block">
              <ReadingSize compact />
            </div>
            <CommandPalette />
          </div>

          {/* Mobile Toggle */}
          <button 
            className="xl:hidden p-2 rounded-lg hover:bg-white/10 transition-colors" 
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
              <Link to="/" className="flex items-center gap-2 text-lg font-bold text-white">
                <span className="text-2xl">🧠</span>
                <span>Mani <span className="text-indigo-400">Notes</span></span>
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

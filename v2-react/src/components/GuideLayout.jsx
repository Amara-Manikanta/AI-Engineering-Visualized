import { useEffect, useState } from "react";
import { useLocation, Link } from "react-router-dom";
import { ChevronDown, ChevronLeft, ChevronRight, Check } from "lucide-react";
import GlobalHeader from "./GlobalHeader";
import Footer from "./Footer";
import { AZURE_LINKS, AWS_LINKS } from "../config/navigation";
import { PYTHON_LINKS } from "../config/pythonNavigation";
import { neighbours, sectionFor } from "../lib/pageOrder";
import { useReadPages, setRead } from "../lib/progress";
import UserTopicNotes from "./UserTopicNotes";

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
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const location = useLocation();
  const read = useReadPages();
  const isRead = read.has(location.pathname);
  const { prev, next } = neighbours(location.pathname);

  const ids = toc.map((item) => item.hash.replace(/^#/, ""));
  const activeId = useActiveSection(ids);

  // "#/page#section" links: once the page has rendered, bring the section into view.
  useEffect(() => {
    if (!location.hash) return undefined;
    const id = decodeURIComponent(location.hash.slice(1));
    const t = setTimeout(() => document.getElementById(id)?.scrollIntoView({ block: "start" }), 150);
    return () => clearTimeout(t);
  }, [location.pathname, location.hash]);

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

      <div className="flex-1 flex flex-col lg:flex-row gap-6 lg:gap-8 mt-6 max-w-[1200px] mx-auto px-4 sm:px-5 pb-20 w-full">

        {/* Sidebar TOC — collapsible on mobile, sticky on desktop */}
        <aside className="lg:w-[250px] shrink-0 lg:sticky lg:top-[90px] h-fit bg-[#141414] border border-white/10 rounded-xl overflow-hidden">

          {/* Mobile toggle header */}
          <button
            className="lg:hidden w-full flex items-center justify-between p-4"
            onClick={() => setSidebarOpen(!sidebarOpen)}
            aria-expanded={sidebarOpen}
            aria-controls="guide-sidebar"
          >
            <span className="font-bold text-sm text-white uppercase tracking-wider text-left">{title}</span>
            <ChevronDown className={`w-5 h-5 text-gray-500 transition-transform duration-200 ${sidebarOpen ? "rotate-180" : ""}`} />
          </button>

          {/* Desktop header (always visible) */}
          <h3 className="hidden lg:block font-bold p-5 pb-0 text-sm text-white uppercase tracking-wider">{title}</h3>

          {/* Navigation & TOC — always visible on desktop, toggle on mobile */}
          <nav
            id="guide-sidebar"
            aria-label="Page contents"
            className={`${sidebarOpen ? "block" : "hidden"} lg:block overflow-y-auto max-h-[60vh] lg:max-h-[calc(100vh-120px)] custom-scrollbar`}
          >

            {/* Render Section Navigation if available */}
            {sidebarLinks && (
              <div className="p-4 lg:p-5 border-b border-white/10 mb-2">
                <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">{sectionTitle}</h4>
                <div className="flex flex-col gap-1">
                  {sidebarLinks.map((link, i) => (
                    <Link
                      key={i}
                      to={link.path}
                      onClick={() => setSidebarOpen(false)}
                      aria-current={location.pathname === link.path ? "page" : undefined}
                      className={`flex items-center justify-between gap-2 py-1.5 text-[0.9em] transition-colors ${
                        location.pathname === link.path
                          ? "text-indigo-400 font-semibold border-l-2 border-indigo-400 pl-2 -ml-[10px]"
                          : "text-gray-400 hover:text-white"
                      }`}
                    >
                      <span>{link.name}</span>
                      {read.has(link.path) && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" aria-label="read" />}
                    </Link>
                  ))}
                </div>
              </div>
            )}

            {/* Render Local TOC */}
            {toc.length > 0 && (
            <div className="p-4 lg:p-5 lg:pt-2">
              <h4 className="text-xs font-bold text-gray-500 uppercase tracking-wider mb-3">On this page</h4>
              <div className="flex flex-col gap-1">
              {toc.map((item, i) => {
                const id = ids[i];
                const active = activeId === id;
                return (
                  <a
                    key={i}
                    // A full hash-router URL, so "open in new tab" and "copy link" work.
                    href={`#${location.pathname}#${id}`}
                    aria-current={active ? "location" : undefined}
                    onClick={(e) => {
                      e.preventDefault();
                      setSidebarOpen(false); // Close sidebar on mobile after clicking
                      onTocClick?.(id);
                      // A tabbed page may have just mounted the section, so look
                      // for it again on the next frame rather than immediately.
                      requestAnimationFrame(() => {
                        const el = document.getElementById(id);
                        if (el) el.scrollIntoView({ behavior: "smooth", block: "start" });
                      });
                    }}
                    className={`block py-2 lg:py-1.5 text-[0.85em] transition-colors border-l-2 -ml-[10px] ${item.indent ? "pl-6 text-xs" : "pl-2"} ${
                      active ? "text-indigo-400 font-semibold border-indigo-400" : "text-gray-400 hover:text-indigo-400 border-transparent"
                    }`}
                  >
                    {item.label}
                  </a>
                );
              })}
              </div>
            </div>
            )}
          </nav>
        </aside>

        {/* Main Content */}
        <main className="flex-1 min-w-0">
          <div className="mb-8 lg:mb-10">
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-black text-white mb-3 tracking-tight">{title}</h1>
            <p className="text-base sm:text-lg text-indigo-200/80 leading-relaxed font-light">{intro}</p>
          </div>

          <div className="space-y-8 lg:space-y-12">
            {children}
          </div>

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
              <nav aria-label="Previous and next pages" className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                {prev ? (
                  <Link
                    to={prev.path}
                    className="group flex items-center gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:border-indigo-500/40 hover:bg-indigo-500/[0.06] transition-colors"
                  >
                    <ChevronLeft className="w-5 h-5 text-gray-500 group-hover:text-indigo-400 shrink-0" />
                    <span className="min-w-0">
                      <span className="block text-[0.6875rem] uppercase tracking-wide text-gray-500">Previous</span>
                      <span className="block text-sm font-semibold text-gray-200 truncate">{cleanName(prev.name)}</span>
                    </span>
                  </Link>
                ) : (
                  <span className="hidden sm:block" />
                )}
                {next && (
                  <Link
                    to={next.path}
                    className="group flex items-center justify-end gap-3 p-4 rounded-xl border border-white/10 bg-white/[0.03] hover:border-indigo-500/40 hover:bg-indigo-500/[0.06] transition-colors text-right"
                  >
                    <span className="min-w-0">
                      <span className="block text-[0.6875rem] uppercase tracking-wide text-gray-500">Next</span>
                      <span className="block text-sm font-semibold text-gray-200 truncate">{cleanName(next.name)}</span>
                    </span>
                    <ChevronRight className="w-5 h-5 text-gray-500 group-hover:text-indigo-400 shrink-0" />
                  </Link>
                )}
              </nav>
            )}
          </div>
        </main>

      </div>
      <Footer />
    </div>
  );
}

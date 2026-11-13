import React from "react";
import { Link, useLocation } from "react-router-dom";
import { Home, Search, Compass, Award } from "lucide-react";

export default function MobileBottomNav() {
  const location = useLocation();

  const handleOpenSearch = () => {
    window.dispatchEvent(new KeyboardEvent("keydown", { key: "k", metaKey: true }));
  };

  const navItems = [
    {
      label: "Home",
      to: "/",
      icon: Home,
      isActive: location.pathname === "/",
    },
    {
      label: "Topics",
      to: "/graph",
      icon: Compass,
      isActive: location.pathname === "/graph" || location.pathname === "/roadmaps",
    },
    {
      label: "Search",
      action: handleOpenSearch,
      icon: Search,
      isActive: false,
    },
    {
      label: "Quizzes",
      to: "/quizzes",
      icon: Award,
      isActive: location.pathname === "/quizzes",
    },
  ];

  return (
    <nav
      aria-label="Mobile Bottom Navigation"
      className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-[#0c0c12]/95 border-t border-white/10 backdrop-blur-xl h-14 px-4 flex items-center justify-around"
      style={{ paddingBottom: "env(safe-area-inset-bottom, 0px)" }}
    >
      {navItems.map((item, i) => {
        const Icon = item.icon;
        if (item.action) {
          return (
            <button
              key={i}
              type="button"
              onClick={item.action}
              className="flex flex-col items-center justify-center gap-1 text-gray-400 hover:text-white transition-colors py-1 px-3 min-w-[56px] cursor-pointer"
            >
              <Icon className="w-4 h-4" />
              <span className="text-[10px] font-medium leading-none">{item.label}</span>
            </button>
          );
        }

        return (
          <Link
            key={i}
            to={item.to}
            className={`flex flex-col items-center justify-center gap-1 transition-colors py-1 px-3 min-w-[56px] ${
              item.isActive
                ? "text-indigo-400 font-semibold"
                : "text-gray-400 hover:text-white"
            }`}
          >
            <Icon className="w-4 h-4" />
            <span className="text-[10px] leading-none">{item.label}</span>
            {item.isActive && (
              <span className="w-1 h-1 rounded-full bg-indigo-400 -mt-0.5" />
            )}
          </Link>
        );
      })}
    </nav>
  );
}

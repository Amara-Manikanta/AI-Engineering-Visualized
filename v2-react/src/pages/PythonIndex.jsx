import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { Link } from 'react-router-dom';
import GuideLayout from '../components/GuideLayout';
import { Code2, Database, Globe, LineChart, Cpu, Sigma, Box, Zap, ArrowRight, BookOpen, Type } from 'lucide-react';

const moduleCards = [
  {
    id: 1,
    title: "1. Python Foundations",
    path: "/python/foundations",
    desc: "What is Python, Variables & Data Types, Operators, Control Flow (`if`, `for`, `match-case`).",
    badge: "Module 1",
    badgeColor: "bg-blue-500/20 text-blue-300 border-blue-500/30",
    icon: <Code2 className="text-blue-400" size={28} />
  },
  {
    id: 2,
    title: "2. Data Structures & Functions",
    path: "/python/data-structures",
    desc: "Functions, `*args`/`**kwargs`, Lists, Tuples, Dicts, Sets, Strings, Slicing, Comprehensions.",
    badge: "Module 2",
    badgeColor: "bg-purple-500/20 text-purple-300 border-purple-500/30",
    icon: <Box className="text-purple-400" size={28} />
  },
  {
    id: 3,
    title: "3. OOP & Advanced Python",
    path: "/python/advanced",
    desc: "Error Handling, Classes & OOP, Type Hints & Pydantic, Generators (`yield`), Decorators.",
    badge: "Module 3",
    badgeColor: "bg-cyan-500/20 text-cyan-300 border-cyan-500/30",
    icon: <Cpu className="text-cyan-400" size={28} />
  },
  {
    id: 4,
    title: "4. System, Tooling & Async",
    path: "/python/tooling-async",
    desc: "Pathlib, Modules, Virtual Envs (`uv`), APIs (`httpx`), JSON/YAML, `asyncio`, Pytest.",
    badge: "Module 4",
    badgeColor: "bg-amber-500/20 text-amber-300 border-amber-500/30",
    icon: <Zap className="text-amber-400" size={28} />
  },
  {
    id: 5,
    title: "5. Data Science & ML",
    path: "/python/data-science",
    desc: "Data Science Ecosystem, NumPy Matrix Math, Pandas DataFrames, Matplotlib, Scikit-Learn.",
    badge: "Module 5",
    badgeColor: "bg-emerald-500/20 text-emerald-300 border-emerald-500/30",
    icon: <Sigma className="text-emerald-400" size={28} />
  },
  {
    id: 6,
    title: "6. Regular Expressions",
    path: "/python/regex",
    desc: "Pattern syntax, greedy vs lazy, capture groups, the `re` module, a live tester, and a practical cookbook.",
    badge: "Module 6",
    badgeColor: "bg-rose-500/20 text-rose-300 border-rose-500/30",
    icon: <Type className="text-rose-400" size={28} />
  }
];

// Short monograms so each node reads as a real library chip instead of an empty circle.
const LIB_MONOGRAM = {
  Kafka: 'Kf', Ray: 'Ry', Hadoop: 'Hd', Dask: 'Dk', Koalas: 'Ko',
  'Beautiful Soup': 'BS', Scrapy: 'Sc', Octoparse: 'Oc', Selenium: 'Se',
  Pygal: 'Pg', Altair: 'Al', Bokeh: 'Bk', Seaborn: 'Sb', Matplotlib: 'Mp', Geoplotlib: 'Gp', Folium: 'Fo',
  Vaex: 'Vx', NumPy: 'np', Pandas: 'pd', Datatable: 'Dt', Polars: 'Pl', CuPy: 'Cp',
  Tensorflow: 'Tf', Pytorch: 'Pt', Keras: 'Ke', Theano: 'Th', XGBoost: 'XG', 'Scikit-learn': 'Sk', JAX: 'JX',
  PyStan: 'PS', Lifelines: 'Ll', SciPy: 'Sp', PyMC3: 'MC', Pingouin: 'Pi', Statsmodels: 'Sm',
};
const monogram = (name) => LIB_MONOGRAM[name] || name.slice(0, 2);

const PythonLibrariesCheatSheet = () => {
  const [hoveredCategory, setHoveredCategory] = useState(null);
  const [hoveredLib, setHoveredLib] = useState(null);

  const rings = [
    {
      id: 'inner-top',
      name: 'Database Operations',
      icon: <Database size={14} />,
      radius: 140,
      color: 'border-blue-500 text-blue-400 bg-blue-500/10',
      nodes: ['Kafka', 'Ray', 'Hadoop', 'Dask', 'Koalas'],
      angleStart: 160,
      angleEnd: 20
    },
    {
      id: 'inner-bottom',
      name: 'Web Scraping',
      icon: <Globe size={14} />,
      radius: 140,
      color: 'border-cyan-500 text-cyan-400 bg-cyan-500/10',
      nodes: ['Beautiful Soup', 'Scrapy', 'Octoparse', 'Selenium'],
      angleStart: 200,
      angleEnd: 340
    },
    {
      id: 'mid-top',
      name: 'Data Visualization',
      icon: <LineChart size={14} />,
      radius: 230,
      color: 'border-teal-500 text-teal-400 bg-teal-500/10',
      nodes: ['Pygal', 'Altair', 'Bokeh', 'Seaborn', 'Matplotlib', 'Geoplotlib', 'Folium'],
      angleStart: 170,
      angleEnd: 10
    },
    {
      id: 'mid-bottom',
      name: 'Data Manipulation',
      icon: <Box size={14} />,
      radius: 230,
      color: 'border-sky-500 text-sky-400 bg-sky-500/10',
      nodes: ['Vaex', 'NumPy', 'Pandas', 'Datatable', 'Polars', 'CuPy'],
      angleStart: 190,
      angleEnd: 350
    },
    {
      id: 'outer-top',
      name: 'Machine Learning',
      icon: <Cpu size={14} />,
      radius: 320,
      color: 'border-indigo-500 text-indigo-400 bg-indigo-500/10',
      nodes: ['Tensorflow', 'Pytorch', 'Keras', 'Theano', 'XGBoost', 'Scikit-learn', 'JAX'],
      angleStart: 175,
      angleEnd: 5
    },
    {
      id: 'outer-bottom',
      name: 'Statistical Analysis',
      icon: <Sigma size={14} />,
      radius: 320,
      color: 'border-purple-500 text-purple-400 bg-purple-500/10',
      nodes: ['PyStan', 'Lifelines', 'SciPy', 'PyMC3', 'Pingouin', 'Statsmodels'],
      angleStart: 185,
      angleEnd: 355
    }
  ];

  const getCoordinates = (radius, angleDeg) => {
    const rad = (angleDeg * Math.PI) / 180;
    return {
      x: radius * Math.cos(rad),
      y: -radius * Math.sin(rad)
    };
  };

  return (
    <div className="relative w-full overflow-hidden flex flex-col items-center py-6">
      <div className="text-center mb-8">
        <h2 className="text-3xl font-black text-white">Python Libraries Landscape</h2>
        <p className="text-gray-400 text-sm mt-1">Interactive overview of core libraries for Data, ML, Scraping, and Stats</p>
      </div>

      <div className="relative flex items-center justify-center w-full max-w-[750px] aspect-square rounded-full border border-gray-800/50 bg-[#0a0a0a]">
        <div className="absolute w-[280px] h-[280px] rounded-full border border-gray-800/60 z-0"></div>
        <div className="absolute w-[460px] h-[460px] rounded-full border border-gray-800/60 z-0"></div>
        <div className="absolute w-[640px] h-[640px] rounded-full border border-gray-800/60 z-0"></div>

        <motion.div 
          className="absolute z-50 w-20 h-20 bg-[#111] rounded-full border-4 border-indigo-500/30 flex items-center justify-center shadow-[0_0_30px_rgba(99,102,241,0.2)]"
          whileHover={{ scale: 1.1, rotate: 180 }}
          transition={{ duration: 0.5, type: 'spring' }}
        >
          <Code2 size={36} className="text-indigo-400" />
        </motion.div>

        {rings.map((ring, rIdx) => {
          const isTop = ring.angleEnd < 180;
          return (
            <div key={ring.id} className="absolute inset-0 flex items-center justify-center z-10 pointer-events-none">
              <motion.div 
                className={`absolute px-3 py-1 rounded-full border ${ring.color} flex items-center gap-2 backdrop-blur-md font-bold text-[0.6875rem] pointer-events-auto shadow-lg transition-all z-20 cursor-default`}
                style={{
                  top: isTop ? `calc(50% - ${ring.radius}px - 14px)` : `calc(50% + ${ring.radius}px - 14px)`,
                }}
                onMouseEnter={() => setHoveredCategory(ring.id)}
                onMouseLeave={() => setHoveredCategory(null)}
                animate={{
                  scale: hoveredCategory === ring.id ? 1.1 : 1,
                  opacity: (hoveredCategory && hoveredCategory !== ring.id) ? 0.4 : 1
                }}
              >
                {ring.icon} {ring.name}
              </motion.div>

              {ring.nodes.map((node, i) => {
                const totalNodes = ring.nodes.length;
                const angleStep = totalNodes > 1 ? (ring.angleEnd - ring.angleStart) / (totalNodes - 1) : 0;
                const currentAngle = ring.angleStart + (angleStep * i);
                const pos = getCoordinates(ring.radius, currentAngle);

                const isHovered = hoveredLib === node;
                const categoryHovered = hoveredCategory === ring.id;
                const anyHovered = hoveredLib !== null || hoveredCategory !== null;
                const isActive = isHovered || categoryHovered;
                const opacity = (!anyHovered || isActive) ? 1 : 0.3;

                return (
                  <motion.div
                    key={node}
                    className="absolute flex flex-col items-center justify-center gap-1 pointer-events-auto cursor-pointer z-30"
                    style={{ x: pos.x, y: pos.y }}
                    onMouseEnter={() => { setHoveredLib(node); setHoveredCategory(ring.id); }}
                    onMouseLeave={() => { setHoveredLib(null); setHoveredCategory(null); }}
                    initial={{ opacity: 0, scale: 0 }}
                    animate={{ opacity, scale: isHovered ? 1.2 : 1 }}
                    transition={{ delay: rIdx * 0.1 + i * 0.02, type: 'spring' }}
                  >
                    <div className={`w-9 h-9 rounded-full border flex items-center justify-center shadow-lg transition-colors font-mono font-bold text-[0.6875rem] leading-none ${isActive ? ring.color : 'border-gray-700 text-gray-300 bg-[#1a1a1a]'}`}>
                       {monogram(node)}
                    </div>
                    <span className={`text-[0.625rem] font-bold px-2 py-0.5 rounded transition-all ${isActive ? 'bg-[#222] text-white border border-[#444]' : 'text-gray-400 drop-shadow-md'}`}>
                      {node}
                    </span>
                  </motion.div>
                );
              })}
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default function PythonIndex() {
  const toc = [
    { label: "Curriculum Modules", hash: "#modules" },
    { label: "Libraries Landscape", hash: "#libraries" }
  ];

  return (
    <GuideLayout
      title="Python Master Guide for AI Engineering"
      intro="Master 25 Python topics across 5 comprehensive modules — from language foundations to Data Science (NumPy, Pandas, Scikit-Learn)."
      toc={toc}
    >
      {/* MODULE CARDS HUB */}
      <section id="modules" className="mb-16 scroll-mt-24">
        <div className="flex items-center gap-3 mb-6">
          <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 border border-blue-500/30">
            <BookOpen size={24} />
          </div>
          <div>
            <h2 className="text-2xl sm:text-3xl font-black text-white">5 Core Python Modules</h2>
            <p className="text-sm text-gray-400">Click a module to explore interactive explanations, syntax, code, & output simulations</p>
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {moduleCards.map((mod) => (
            <motion.div
              key={mod.id}
              whileHover={{ y: -4, scale: 1.01 }}
              className="bg-gradient-to-b from-white/10 to-white/5 border border-white/10 rounded-2xl p-6 flex flex-col justify-between group"
            >
              <div>
                <div className="flex items-center justify-between mb-4">
                  <div className="p-3 rounded-xl bg-black/40 border border-white/10">
                    {mod.icon}
                  </div>
                  <span className={`text-xs font-bold px-3 py-1 rounded-full border ${mod.badgeColor}`}>
                    {mod.badge}
                  </span>
                </div>

                <h3 className="text-xl font-bold text-white mb-2 group-hover:text-blue-400 transition-colors">
                  {mod.title}
                </h3>
                <p className="text-xs text-gray-300 leading-relaxed mb-6">
                  {mod.desc}
                </p>
              </div>

              <Link
                to={mod.path}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-blue-600/20 hover:bg-blue-600/40 border border-blue-500/30 text-blue-300 font-bold text-xs transition-colors"
              >
                <span>Explore Module</span>
                <ArrowRight size={14} />
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* LIBRARIES LANDSCAPE CHEATSHEET */}
      <section id="libraries" className="scroll-mt-24 border-t border-white/10 pt-10">
        <PythonLibrariesCheatSheet />
      </section>
    </GuideLayout>
  );
}

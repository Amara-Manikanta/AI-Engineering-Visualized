import React, { useState } from 'react';
import { X, Trash2, Sparkles, Check } from 'lucide-react';

const DEFAULT_CATEGORIES = [
  "Edge & Hardware",
  "Developer Tools",
  "Architecture & RAG",
  "MLOps & Systems",
  "Frontier Models",
  "Security & Interactive"
];

export default function AddArticleModal({ isOpen, onClose, onSave, existingArticle = null, nextIssueId = 22 }) {
  const [title, setTitle] = useState(existingArticle ? existingArticle.title : '');
  const [subtitle, setSubtitle] = useState(existingArticle ? existingArticle.subtitle : '');
  const [category, setCategory] = useState(existingArticle ? existingArticle.category : DEFAULT_CATEGORIES[0]);
  const [repoName, setRepoName] = useState(existingArticle ? existingArticle.repoName : '');
  const [url, setUrl] = useState(existingArticle ? existingArticle.url : '');
  const [hook, setHook] = useState(existingArticle ? existingArticle.hook : '');
  const [problem, setProblem] = useState(existingArticle ? existingArticle.problem : '');
  const [intuition, setIntuition] = useState(existingArticle ? existingArticle.intuition : '');
  const [diagram, setDiagram] = useState(existingArticle ? existingArticle.diagram : `┌────────────────────────────────────────────────────────┐\n│               CUSTOM ARCHITECTURE PIPELINE             │\n└────────────────────────────────────────────────────────┘\n  Step 1: Input Stream ──► Step 2: Processing ──► Step 3: Result`);
  const [technicalExplanation, setTechnicalExplanation] = useState(existingArticle ? existingArticle.technicalExplanation : '');
  const [experiment, setExperiment] = useState(existingArticle ? existingArticle.experiment : `# Run your custom experiment:\npython -c "print('Custom AI Engineering benchmark running!')"`);
  const [takeaways, setTakeaways] = useState(existingArticle && existingArticle.takeaways ? existingArticle.takeaways : [
    "Core architecture heuristic #1",
    "Key engineering decision #2"
  ]);
  const [newTakeaway, setNewTakeaway] = useState('');
  const [tagInput, setTagInput] = useState(existingArticle && existingArticle.highlights ? existingArticle.highlights.join(', ') : 'Custom, Architecture, AI');

  if (!isOpen) return null;

  const handleAddTakeaway = () => {
    if (newTakeaway.trim()) {
      setTakeaways([...takeaways, newTakeaway.trim()]);
      setNewTakeaway('');
    }
  };

  const handleRemoveTakeaway = (index) => {
    setTakeaways(takeaways.filter((_, i) => i !== index));
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    if (!title.trim() || !problem.trim()) return;

    const highlights = tagInput.split(',').map(t => t.trim()).filter(Boolean);

    const articleData = {
      id: existingArticle ? existingArticle.id : nextIssueId,
      shortName: title.split(':')[0].trim().slice(0, 30),
      title: title.trim(),
      subtitle: subtitle.trim() || "User-submitted architectural deep dive and engineering breakdown",
      date: new Date().toLocaleDateString(undefined, { month: 'short', year: 'numeric' }),
      category,
      categoryColor: category === "Security & Interactive" ? "bg-rose-500/20 text-rose-400 border-rose-500/30" :
                     category === "Edge & Hardware" ? "bg-amber-500/20 text-amber-400 border-amber-500/30" :
                     category === "Frontier Models" ? "bg-blue-500/20 text-blue-400 border-blue-500/30" :
                     category === "Architecture & RAG" ? "bg-purple-500/20 text-purple-400 border-purple-500/30" :
                     category === "MLOps & Systems" ? "bg-cyan-500/20 text-cyan-400 border-cyan-500/30" :
                     "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
      readTime: "5 min read",
      url: url.trim() || "https://github.com",
      repoName: repoName.trim() || "user-contributed/article",
      summary: problem.slice(0, 220) + "...",
      whyHighlighted: `Why it's highlighted: Community-authored technical engineering breakdown on ${title.split(':')[0]}.`,
      hook: hook.trim() || "A crucial architectural challenge facing production AI systems.",
      problem: problem.trim(),
      intuition: intuition.trim() || "The core intuitive mental model behind this architecture.",
      diagram: diagram.trim(),
      technicalExplanation: technicalExplanation.trim() || problem.trim(),
      experiment: experiment.trim(),
      takeaways: takeaways.length > 0 ? takeaways : ["High impact architecture insight."],
      nextBridge: "Explore the next frontier breakthrough in AI Engineering Radar!",
      highlights: highlights.length > 0 ? highlights : ["Custom", "AI Engineering"],
      isUserCreated: true,
      featured: false
    };

    onSave(articleData);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-5 bg-black/85 backdrop-blur-md overflow-y-auto">
      <div className="bg-[#121216] border border-white/20 rounded-2xl w-full max-w-3xl my-auto max-h-[92vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-5 border-b border-white/10 bg-[#16161c]">
          <div className="flex items-center gap-2.5">
            <span className="p-2 rounded-xl bg-indigo-500/20 text-indigo-400">
              <Sparkles className="w-5 h-5" />
            </span>
            <div>
              <h3 className="text-lg font-bold text-white">
                {existingArticle ? `Edit Edition #${existingArticle.id}` : `Add New Article to AI Engineering Radar`}
              </h3>
              <p className="text-xs text-gray-400">
                Create a full 6-stage engineering breakdown (Problem → Experiment). Saved offline.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-white/10 hover:bg-white/20 text-gray-300 hover:text-white flex items-center justify-center transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Scrollable Form Body */}
        <form onSubmit={handleSubmit} className="p-5 md:p-6 space-y-5 overflow-y-auto custom-scrollbar flex-1">
          {/* Title & Subtitle */}
          <div className="space-y-4">
            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-1.5">Article Title *</label>
              <input
                required
                type="text"
                placeholder="e.g. Flash-Inference: Zero-Copy Memory Pipelining for Local Agents"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                className="w-full bg-[#0b0b0e] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-1.5">Subtitle / Thesis</label>
              <input
                type="text"
                placeholder="e.g. Bypassing CUDA host-device memory copies using direct unified virtual addresses"
                value={subtitle}
                onChange={(e) => setSubtitle(e.target.value)}
                className="w-full bg-[#0b0b0e] border border-white/20 rounded-xl px-4 py-2.5 text-sm text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          {/* Category & Repo Info */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-1.5">Category</label>
              <select
                value={category}
                onChange={(e) => setCategory(e.target.value)}
                className="w-full bg-[#0b0b0e] border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-400"
              >
                {DEFAULT_CATEGORIES.map(cat => (
                  <option key={cat} value={cat}>{cat}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-1.5">Repo / Project Name</label>
              <input
                type="text"
                placeholder="e.g. org/project-name"
                value={repoName}
                onChange={(e) => setRepoName(e.target.value)}
                className="w-full bg-[#0b0b0e] border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>

            <div>
              <label className="block text-xs font-mono uppercase text-gray-400 mb-1.5">Project URL</label>
              <input
                type="url"
                placeholder="https://github.com/..."
                value={url}
                onChange={(e) => setUrl(e.target.value)}
                className="w-full bg-[#0b0b0e] border border-white/20 rounded-xl px-3 py-2.5 text-xs text-white focus:outline-none focus:border-indigo-400"
              />
            </div>
          </div>

          {/* 20-Second Hook */}
          <div>
            <label className="block text-xs font-mono uppercase text-amber-400 mb-1.5">⚡ The 20-Second Hook</label>
            <input
              type="text"
              placeholder="e.g. Why are we spending 80% of agent runtime copying tensors across PCIe lanes?"
              value={hook}
              onChange={(e) => setHook(e.target.value)}
              className="w-full bg-[#0b0b0e] border border-amber-500/30 rounded-xl px-4 py-2.5 text-sm text-amber-200 placeholder-amber-500/40 focus:outline-none focus:border-amber-400"
            />
          </div>

          {/* Stage 1: The Problem */}
          <div>
            <label className="block text-xs font-mono uppercase text-rose-400 mb-1.5">⚠️ Stage 1: The Production Problem *</label>
            <textarea
              required
              rows={3}
              placeholder="What bottlenecks or crashes occur in production systems that this breakthrough addresses?"
              value={problem}
              onChange={(e) => setProblem(e.target.value)}
              className="w-full bg-[#0b0b0e] border border-white/20 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-rose-400 leading-relaxed"
            />
          </div>

          {/* Stage 2: Core Intuition */}
          <div>
            <label className="block text-xs font-mono uppercase text-indigo-400 mb-1.5">🧠 Stage 2: Core Intuition (Mental Model)</label>
            <textarea
              rows={3}
              placeholder="The intuitive metaphor or mental model (e.g. like a highway bypass...)"
              value={intuition}
              onChange={(e) => setIntuition(e.target.value)}
              className="w-full bg-[#0b0b0e] border border-white/20 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-indigo-400 leading-relaxed"
            />
          </div>

          {/* Stage 3: ASCII Diagram */}
          <div>
            <label className="block text-xs font-mono uppercase text-emerald-400 mb-1.5">📐 Stage 3: Visual ASCII Diagram</label>
            <textarea
              rows={5}
              placeholder="ASCII flow chart representing the architecture dataflow..."
              value={diagram}
              onChange={(e) => setDiagram(e.target.value)}
              className="w-full bg-black border border-emerald-500/40 rounded-xl p-3 font-mono text-xs text-emerald-400 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Stage 4: Technical Deep-Dive */}
          <div>
            <label className="block text-xs font-mono uppercase text-cyan-400 mb-1.5">🔬 Stage 4: Technical Deep-Dive</label>
            <textarea
              rows={4}
              placeholder="Mathematical foundations, kernel mechanisms, memory layouts, or protocols..."
              value={technicalExplanation}
              onChange={(e) => setTechnicalExplanation(e.target.value)}
              className="w-full bg-[#0b0b0e] border border-white/20 rounded-xl p-3 text-sm text-white focus:outline-none focus:border-cyan-400 leading-relaxed"
            />
          </div>

          {/* Stage 5: Experiment */}
          <div>
            <label className="block text-xs font-mono uppercase text-amber-400 mb-1.5">💻 Stage 5: Reproducible Code / Terminal Commands</label>
            <textarea
              rows={4}
              placeholder="Bash commands, python scripts, or curl requests to run and verify..."
              value={experiment}
              onChange={(e) => setExperiment(e.target.value)}
              className="w-full bg-black border border-amber-500/40 rounded-xl p-3 font-mono text-xs text-amber-300 focus:outline-none leading-relaxed"
            />
          </div>

          {/* Stage 6: Key Takeaways */}
          <div>
            <label className="block text-xs font-mono uppercase text-indigo-400 mb-1.5">⚡ Stage 6: Engineering Takeaways</label>
            <div className="space-y-2 mb-2">
              {takeaways.map((point, idx) => (
                <div key={idx} className="flex items-center gap-2 bg-black/40 border border-white/10 rounded-xl px-3 py-2 text-xs text-gray-200">
                  <span className="text-indigo-400 font-bold">✓</span>
                  <span className="flex-1">{point}</span>
                  <button
                    type="button"
                    onClick={() => handleRemoveTakeaway(idx)}
                    className="text-gray-500 hover:text-rose-400 transition-colors"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              ))}
            </div>

            <div className="flex gap-2">
              <input
                type="text"
                placeholder="Add another takeaway point..."
                value={newTakeaway}
                onChange={(e) => setNewTakeaway(e.target.value)}
                onKeyDown={(e) => { if (e.key === 'Enter') { e.preventDefault(); handleAddTakeaway(); } }}
                className="flex-1 bg-[#0b0b0e] border border-white/20 rounded-xl px-3 py-2 text-xs text-white focus:outline-none focus:border-indigo-400"
              />
              <button
                type="button"
                onClick={handleAddTakeaway}
                className="px-3.5 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-xs font-semibold"
              >
                + Add
              </button>
            </div>
          </div>

          {/* Tags */}
          <div>
            <label className="block text-xs font-mono uppercase text-gray-400 mb-1.5">Architectural Tags (comma-separated)</label>
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              className="w-full bg-[#0b0b0e] border border-white/20 rounded-xl px-4 py-2 text-xs text-gray-300 focus:outline-none focus:border-indigo-400"
            />
          </div>

          {/* Footer Submit */}
          <div className="pt-4 border-t border-white/10 flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold transition-all"
            >
              Cancel
            </button>
            <button
              type="submit"
              className="px-6 py-2.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white text-xs font-bold transition-all shadow-lg shadow-indigo-600/30 flex items-center gap-1.5"
            >
              <Check className="w-4 h-4" />
              <span>{existingArticle ? "Save Changes" : "Publish Article to Radar"}</span>
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}

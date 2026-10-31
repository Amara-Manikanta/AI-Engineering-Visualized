import React, { useState, useEffect, useRef } from 'react';
import {
  Play,
  RotateCcw,
  Copy,
  Check,
  Terminal,
  Loader2,
  Trash2,
  Cpu,
  Image as ImageIcon,
  Database,
  ChevronDown,
} from 'lucide-react';
import { runPythonCode, getPythonEnvironment, isNativePythonAvailable } from '../lib/pythonRunner';
import { getStarterCodeForPage } from '../lib/topicLabStarters';
import { SAMPLE_DATASETS } from '../lib/sampleDatasets';

export default function TopicPythonLab({ pagePath, title, onBackToView }) {
  const storageKey = `python_lab_code_${pagePath}`;
  const defaultStarter = getStarterCodeForPage(pagePath, title);

  const [code, setCode] = useState(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      return saved !== null ? saved : defaultStarter;
    } catch {
      return defaultStarter;
    }
  });

  const [savedStatus, setSavedStatus] = useState(false);
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState(null);
  const [copied, setCopied] = useState(false);
  const [envInfo, setEnvInfo] = useState(null);
  const [showDatasetsMenu, setShowDatasetsMenu] = useState(false);
  const textareaRef = useRef(null);
  const datasetsMenuRef = useRef(null);

  // Close datasets menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (datasetsMenuRef.current && !datasetsMenuRef.current.contains(e.target)) {
        setShowDatasetsMenu(false);
      }
    };
    if (showDatasetsMenu) {
      document.addEventListener('mousedown', handleClickOutside);
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [showDatasetsMenu]);

  // Sync when pagePath changes
  useEffect(() => {
    try {
      const saved = localStorage.getItem(storageKey);
      setCode(saved !== null ? saved : getStarterCodeForPage(pagePath, title));
    } catch {
      setCode(getStarterCodeForPage(pagePath, title));
    }
    setOutput(null);
  }, [pagePath, title, storageKey]);

  // Load Python environment info once
  useEffect(() => {
    let mounted = true;
    getPythonEnvironment().then((info) => {
      if (mounted) setEnvInfo(info);
    });
    return () => {
      mounted = false;
    };
  }, []);

  // Save to localStorage whenever code changes
  const handleCodeChange = (e) => {
    const val = e.target.value;
    setCode(val);
    try {
      localStorage.setItem(storageKey, val);
      setSavedStatus(true);
      setTimeout(() => setSavedStatus(false), 1200);
    } catch {
      /* ignore storage quota */
    }
  };

  const handleReset = () => {
    if (window.confirm('Reset code to the original starter template for this topic?')) {
      const starter = getStarterCodeForPage(pagePath, title);
      setCode(starter);
      try {
        localStorage.setItem(storageKey, starter);
      } catch {
        /* noop */
      }
      setOutput(null);
    }
  };

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1500);
    } catch {
      /* noop */
    }
  };

  const handleRun = async () => {
    if (!code.trim() || running) return;
    setRunning(true);

    try {
      const res = await runPythonCode(code);
      setOutput(res);
    } catch (err) {
      setOutput({
        ok: false,
        error: err.message,
        stdout: '',
        stderr: err.message,
        figures: [],
        timeMs: 0,
      });
    } finally {
      setRunning(false);
    }
  };

  const handleKeyDown = (e) => {
    // Cmd+Enter or Ctrl+Enter to execute
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
      e.preventDefault();
      handleRun();
    }
    // Tab key indent support
    if (e.key === 'Tab' && textareaRef.current) {
      e.preventDefault();
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const updated = code.substring(0, start) + '    ' + code.substring(end);
      setCode(updated);
      try {
        localStorage.setItem(storageKey, updated);
      } catch {
        /* noop */
      }
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  return (
    <div className="rounded-2xl border border-white/10 bg-[#0e0f11] overflow-hidden shadow-2xl space-y-0">
      {/* Platform Header */}
      <div className="p-4 sm:p-5 border-b border-white/10 bg-gradient-to-r from-emerald-950/20 via-black to-indigo-950/20 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-400 animate-pulse" />
            <span className="text-[0.6875rem] font-mono text-emerald-400 font-bold uppercase tracking-wider">
              Python Practice Platform
            </span>
            {savedStatus && (
              <span className="text-[0.65rem] font-mono text-gray-500">
                (Saved)
              </span>
            )}
          </div>
          <h2 className="text-lg font-bold text-white flex items-center gap-2">
            <span>{title}</span>
            <span className="text-xs font-normal text-gray-400 font-mono">Code Lab</span>
          </h2>
        </div>

        {/* Environment & Backend Pill */}
        <div className="flex items-center gap-2 text-xs font-mono text-gray-300">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-black/60 border border-white/10">
            <Cpu className="w-3.5 h-3.5 text-emerald-400" />
            <span>
              {isNativePythonAvailable()
                ? envInfo?.version
                  ? `Python ${envInfo.version} (Anaconda)`
                  : 'Native macOS Python'
                : 'Browser Mode'}
            </span>
          </div>
          {onBackToView && (
            <button
              type="button"
              onClick={onBackToView}
              className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-400 hover:text-white border border-white/10 text-xs transition-colors cursor-pointer"
            >
              Back to Topic
            </button>
          )}
        </div>
      </div>

      {/* Editor Toolbar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-white/10 bg-black/40 text-xs">
        <div className="flex items-center gap-2 text-gray-400 font-mono">
          <Terminal className="w-3.5 h-3.5 text-gray-500" />
          <span>Python 3 Code Cell</span>
        </div>

        <div className="flex items-center gap-2">
          {/* Sample Datasets Dropdown */}
          <div className="relative" ref={datasetsMenuRef}>
            <button
              type="button"
              onClick={() => setShowDatasetsMenu(!showDatasetsMenu)}
              className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-indigo-500/40 bg-indigo-500/15 hover:bg-indigo-500/25 text-indigo-300 hover:text-indigo-200 transition-colors cursor-pointer text-xs font-semibold"
              title="Load interesting sample dataset"
            >
              <Database className="w-3.5 h-3.5 text-indigo-400" />
              <span>Datasets</span>
              <ChevronDown className={`w-3 h-3 transition-transform ${showDatasetsMenu ? 'rotate-180' : ''}`} />
            </button>

            {showDatasetsMenu && (
              <div className="absolute right-0 top-full mt-2 w-80 max-h-96 overflow-y-auto bg-[#141518] border border-white/10 rounded-xl shadow-2xl p-2 z-30 custom-scrollbar">
                <div className="px-3 py-2 text-[0.65rem] font-bold text-gray-400 uppercase tracking-wider border-b border-white/5 mb-1 flex items-center justify-between">
                  <span>Sample Datasets</span>
                  <span className="text-[0.6rem] text-indigo-400 font-mono">1-click insert</span>
                </div>
                {SAMPLE_DATASETS.map((ds) => (
                  <button
                    key={ds.id}
                    type="button"
                    onClick={() => {
                      if (window.confirm(`Load "${ds.name}" into the code cell?`)) {
                        setCode(ds.pythonCode);
                        try {
                          localStorage.setItem(storageKey, ds.pythonCode);
                        } catch {
                          /* noop */
                        }
                        setShowDatasetsMenu(false);
                        setOutput(null);
                      }
                    }}
                    className="w-full text-left p-2.5 rounded-lg hover:bg-white/5 transition-colors cursor-pointer group border border-transparent hover:border-white/5"
                  >
                    <div className="flex items-center justify-between text-xs font-bold text-white group-hover:text-indigo-300">
                      <span className="truncate">{ds.name}</span>
                      <span className="text-[0.6rem] font-mono px-1.5 py-0.2 rounded bg-white/5 text-gray-400 shrink-0">
                        {ds.category}
                      </span>
                    </div>
                    <p className="text-[0.7rem] text-gray-400 line-clamp-2 mt-1 leading-snug">
                      {ds.description}
                    </p>
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Reset */}
          <button
            type="button"
            onClick={handleReset}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
            title="Reset code to default template"
          >
            <RotateCcw className="w-3 h-3" />
            <span>Reset</span>
          </button>

          {/* Copy */}
          <button
            type="button"
            onClick={handleCopy}
            className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white transition-colors cursor-pointer"
            title="Copy code"
          >
            {copied ? (
              <>
                <Check className="w-3 h-3 text-emerald-400" />
                <span className="text-emerald-400">Copied</span>
              </>
            ) : (
              <>
                <Copy className="w-3 h-3" />
                <span>Copy</span>
              </>
            )}
          </button>

          {/* Run (Cmd+Enter) */}
          <button
            type="button"
            onClick={handleRun}
            disabled={running}
            className="flex items-center gap-1.5 px-4 py-1.5 rounded-lg border border-emerald-500/60 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-emerald-200 font-semibold shadow-md transition-all cursor-pointer disabled:opacity-50"
            title="Run Code (⌘ + Enter)"
          >
            {running ? (
              <>
                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                <span>Running...</span>
              </>
            ) : (
              <>
                <Play className="w-3.5 h-3.5 fill-current" />
                <span>Run</span>
                <span className="text-[0.65rem] opacity-70">⌘↵</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Textarea Editor */}
      <div className="relative">
        <textarea
          ref={textareaRef}
          value={code}
          onChange={handleCodeChange}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="w-full p-4 font-mono text-sm leading-relaxed bg-[#0a0a0c] text-emerald-300 focus:outline-none resize-y border-b border-white/10 custom-scrollbar selection:bg-emerald-950/60"
          style={{ minHeight: '260px' }}
          placeholder="# Write or paste your Python code here for this topic..."
        />
      </div>

      {/* Output Console & Charts */}
      {output && (
        <div className="bg-[#090a0b] p-4 sm:p-5 space-y-4">
          <div className="flex items-center justify-between pb-2 border-b border-white/5">
            <div className="flex items-center gap-2">
              <Terminal className="w-4 h-4 text-emerald-400" />
              <span className="font-mono text-xs font-bold text-white uppercase tracking-wider">
                Execution Output
              </span>
              {output.timeMs > 0 && (
                <span className="text-[0.6875rem] font-mono text-emerald-400 bg-emerald-500/10 px-2 py-0.5 rounded-full border border-emerald-500/20">
                  ⚡ {output.timeMs}ms
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setOutput(null)}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/10 transition-colors"
              title="Clear output"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* Standard Output */}
          {output.stdout && (
            <div className="p-3.5 rounded-xl bg-black/80 border border-white/10 font-mono text-xs text-gray-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              {output.stdout}
            </div>
          )}

          {/* Error / Traceback */}
          {(!output.ok || output.error) && (
            <div className="p-3.5 rounded-xl bg-red-950/30 border border-red-500/40 font-mono text-xs text-rose-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
              <div className="font-bold text-red-400 mb-1 flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-red-500" />
                <span>Python Error:</span>
              </div>
              {output.traceback || output.error}
            </div>
          )}

          {/* Empty Output Note */}
          {output.ok && !output.stdout && (!output.figures || output.figures.length === 0) && (
            <div className="text-gray-500 text-xs italic font-mono py-1">
              Process finished with exit code 0. (No output printed. Use <code>print(...)</code> to see values).
            </div>
          )}

          {/* Rendered Matplotlib Figures */}
          {output.figures && output.figures.length > 0 && (
            <div className="space-y-3 pt-2">
              <div className="flex items-center gap-1.5 text-indigo-400 text-xs uppercase tracking-wider font-semibold font-mono">
                <ImageIcon className="w-4 h-4" />
                <span>Visualizations Generated ({output.figures.length})</span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {output.figures.map((figUrl, idx) => (
                  <div
                    key={idx}
                    className="p-3 rounded-2xl bg-black/90 border border-white/10 flex justify-center items-center shadow-2xl overflow-hidden"
                  >
                    <img
                      src={figUrl}
                      alt={`Plot ${idx + 1}`}
                      className="rounded-lg max-w-full h-auto object-contain"
                    />
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

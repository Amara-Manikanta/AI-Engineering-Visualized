import React, { useRef, useState, useEffect } from 'react';
import { Play, RotateCcw, Edit3, Eye, Loader2, X, Terminal, Image as ImageIcon } from 'lucide-react';
import { runPythonCode, isNativePythonAvailable } from '../lib/pythonRunner';

/** Shared clipboard write with a fallback for insecure contexts. */
async function writeClipboard(text) {
  try {
    await navigator.clipboard.writeText(text);
  } catch {
    const ta = document.createElement('textarea');
    ta.value = text;
    ta.style.position = 'fixed';
    ta.style.opacity = '0';
    document.body.appendChild(ta);
    ta.select();
    try { document.execCommand('copy'); } catch { /* noop */ }
    document.body.removeChild(ta);
  }
}

/**
 * CodeSnippet
 *
 * A drop-in replacement for a bare <pre> that adds a copy button, without
 * introducing any container chrome of its own. Use this for code that already
 * sits inside a styled panel with its own header — swapping in the full
 * CodeBlock there would double up the framing.
 */
export function CodeSnippet({ className = '', children }) {
  const preRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await writeClipboard(preRef.current?.textContent ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className="relative group">
      <pre ref={preRef} className={className}>{children}</pre>
      <button
        onClick={handleCopy}
        aria-label="Copy code"
        className={`absolute top-0 right-0 flex items-center gap-1 px-1.5 py-0.5 rounded border text-[0.625rem] font-sans transition-all ${
          copied
            ? 'border-emerald-500/50 bg-emerald-500/15 text-emerald-300 opacity-100'
            : 'border-gray-700 bg-black/70 text-gray-500 opacity-40 hover:opacity-100 hover:text-gray-200 hover:border-gray-500'
        }`}
      >
        {copied ? (
          <>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
            Copied
          </>
        ) : (
          <>
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
            Copy
          </>
        )}
      </button>
    </div>
  );
}

/**
 * CodeBlock
 *
 * A reusable interactive code container with:
 *  - Copy to clipboard
 *  - Interactive Python execution (macOS Electron / Anaconda runner)
 *  - In-place editing and code tweaking
 *  - Inline Matplotlib chart rendering and stdout capture
 *
 * Props:
 *  - language   short label shown in the header (e.g. "python", "bash")
 *  - maxHeight  CSS max-height for the scroll region (default 460px)
 *  - wrap       soft-wrap long lines instead of scrolling horizontally
 *  - runnable   explicitly enable/disable code execution (defaults to true for python)
 */
export default function CodeBlock({
  children,
  code,
  language,
  maxHeight = '460px',
  wrap = false,
  className = '',
  runnable,
}) {
  const preRef = useRef(null);
  const textareaRef = useRef(null);
  const [copied, setCopied] = useState(false);

  // Check if this block is runnable (defaults to true for python)
  const isPython = (language || '').toLowerCase().includes('python') || (language || '').toLowerCase() === 'py';
  const canRun = runnable !== undefined ? runnable : isPython;

  // Code state
  const originalCode = code ?? (typeof children === 'string' ? children : '');
  const [editedCode, setEditedCode] = useState(originalCode);
  const [isEditing, setIsEditing] = useState(false);

  // Sync if code prop changes
  useEffect(() => {
    if (code != null) {
      setEditedCode(code);
    }
  }, [code]);

  // Execution state
  const [running, setRunning] = useState(false);
  const [output, setOutput] = useState(null);
  const [showOutput, setShowOutput] = useState(false);

  const getEffectiveCode = () => {
    if (isEditing || editedCode !== originalCode) {
      return editedCode;
    }
    return code ?? preRef.current?.textContent ?? '';
  };

  const handleCopy = async () => {
    const textToCopy = getEffectiveCode();
    await writeClipboard(textToCopy);
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  const handleReset = () => {
    const raw = code ?? (preRef.current?.textContent ?? '');
    setEditedCode(raw);
    setIsEditing(false);
  };

  const handleRun = async () => {
    const textToRun = getEffectiveCode();
    if (!textToRun.trim()) return;

    setRunning(true);
    setShowOutput(true);

    try {
      const res = await runPythonCode(textToRun);
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

  // Keyboard shortcut: Cmd+Enter or Ctrl+Enter to execute
  const handleKeyDown = (e) => {
    if ((e.metaKey || e.ctrlKey) && e.key === 'Enter' && canRun) {
      e.preventDefault();
      handleRun();
    }
    // Tab key indent support inside textarea
    if (e.key === 'Tab' && isEditing && textareaRef.current) {
      e.preventDefault();
      const start = textareaRef.current.selectionStart;
      const end = textareaRef.current.selectionEnd;
      const val = editedCode;
      setEditedCode(val.substring(0, start) + '    ' + val.substring(end));
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 4;
        }
      }, 0);
    }
  };

  const hasModifications = editedCode !== originalCode && originalCode !== '';

  return (
    <div className={`relative rounded-xl border border-gray-800 bg-[#111] overflow-hidden shadow-lg ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-white/[0.02]">
        <div className="flex items-center gap-2">
          <span className="w-3 h-3 rounded-full bg-red-500/60" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <span className="w-3 h-3 rounded-full bg-green-500/60" />
          {language && (
            <span className="ml-1.5 px-2 py-0.5 rounded text-[0.6875rem] font-mono uppercase tracking-wider text-gray-400 bg-white/5 border border-white/5">
              {language}
            </span>
          )}
          {hasModifications && (
            <span className="text-[0.65rem] font-mono text-amber-400 bg-amber-500/10 px-1.5 py-0.5 rounded border border-amber-500/20">
              edited
            </span>
          )}
        </div>

        {/* Toolbar actions */}
        <div className="flex items-center gap-1.5">
          {canRun && (
            <>
              {/* Reset code */}
              {hasModifications && (
                <button
                  type="button"
                  onClick={handleReset}
                  title="Reset to original code"
                  className="flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md border border-gray-700 bg-white/5 text-gray-400 hover:text-white hover:border-gray-500 transition-colors"
                >
                  <RotateCcw className="w-3 h-3" />
                  <span className="hidden sm:inline">Reset</span>
                </button>
              )}

              {/* Edit toggle */}
              <button
                type="button"
                onClick={() => {
                  if (!isEditing && !editedCode) {
                    setEditedCode(getEffectiveCode());
                  }
                  setIsEditing(!isEditing);
                }}
                title={isEditing ? 'View formatted' : 'Edit code in-place'}
                className={`flex items-center gap-1 text-xs font-medium px-2 py-1 rounded-md border transition-colors ${
                  isEditing
                    ? 'border-indigo-500/50 bg-indigo-500/20 text-indigo-300'
                    : 'border-gray-700 bg-white/5 text-gray-400 hover:text-white hover:border-gray-500'
                }`}
              >
                {isEditing ? <Eye className="w-3 h-3" /> : <Edit3 className="w-3 h-3" />}
                <span className="hidden sm:inline">{isEditing ? 'Done' : 'Edit'}</span>
              </button>

              {/* Run button */}
              <button
                type="button"
                onClick={handleRun}
                disabled={running}
                title="Run Python code (⌘ + Enter)"
                className="flex items-center gap-1.5 text-xs font-semibold px-2.5 py-1 rounded-md border border-emerald-500/50 bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-300 hover:text-emerald-200 shadow-sm transition-all disabled:opacity-50 cursor-pointer"
              >
                {running ? (
                  <>
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    <span>Running...</span>
                  </>
                ) : (
                  <>
                    <Play className="w-3 h-3 fill-current" />
                    <span>Run</span>
                    <span className="text-[0.65rem] opacity-60 hidden md:inline">⌘↵</span>
                  </>
                )}
              </button>
            </>
          )}

          {/* Copy button */}
          <button
            type="button"
            onClick={handleCopy}
            aria-label="Copy code"
            className={`flex items-center gap-1.5 text-xs font-medium px-2.5 py-1 rounded-md border transition-colors ${
              copied
                ? 'border-emerald-500/40 bg-emerald-500/10 text-emerald-300'
                : 'border-gray-700 bg-white/5 text-gray-400 hover:text-white hover:border-gray-500'
            }`}
          >
            {copied ? (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="3" strokeLinecap="round" strokeLinejoin="round"><polyline points="20 6 9 17 4 12" /></svg>
                <span>Copied</span>
              </>
            ) : (
              <>
                <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
                <span>Copy</span>
              </>
            )}
          </button>
        </div>
      </div>

      {/* Code Editor or Viewer */}
      {isEditing ? (
        <textarea
          ref={textareaRef}
          value={editedCode}
          onChange={(e) => setEditedCode(e.target.value)}
          onKeyDown={handleKeyDown}
          spellCheck={false}
          className="w-full p-4 font-mono text-sm bg-black/60 text-emerald-300 focus:outline-none resize-y border-b border-gray-800 custom-scrollbar"
          style={{ minHeight: '180px', maxHeight }}
        />
      ) : (
        <pre
          ref={preRef}
          onKeyDown={handleKeyDown}
          tabIndex={canRun ? 0 : undefined}
          className={`p-4 font-mono text-sm text-gray-300 overflow-y-auto custom-scrollbar m-0 focus:outline-none ${
            wrap ? 'whitespace-pre-wrap break-words' : 'overflow-x-auto'
          }`}
          style={{ maxHeight }}
        >
          {code != null ? <code>{code}</code> : children}
        </pre>
      )}

      {/* Output Console & Charts Drawer */}
      {showOutput && output && (
        <div className="border-t border-gray-800 bg-[#0c0d0e]">
          {/* Output header bar */}
          <div className="flex items-center justify-between px-4 py-1.5 bg-black/40 border-b border-gray-800/80 text-xs">
            <div className="flex items-center gap-2">
              <Terminal className="w-3.5 h-3.5 text-gray-400" />
              <span className="font-mono text-gray-300 font-medium">Output</span>
              {output.timeMs > 0 && (
                <span className="text-[0.6875rem] font-mono text-emerald-400 bg-emerald-500/10 px-1.5 py-0.5 rounded border border-emerald-500/20">
                  ⚡ {output.timeMs}ms
                </span>
              )}
              {isNativePythonAvailable() && (
                <span className="text-[0.65rem] font-mono text-gray-400 hidden sm:inline">
                  (Anaconda Python)
                </span>
              )}
            </div>

            <button
              type="button"
              onClick={() => setShowOutput(false)}
              className="text-gray-400 hover:text-white p-1 rounded hover:bg-white/5 transition-colors"
              title="Close output"
            >
              <X className="w-3.5 h-3.5" />
            </button>
          </div>

          <div className="p-4 space-y-4 max-h-[500px] overflow-y-auto custom-scrollbar font-mono text-xs">
            {/* Standard Output */}
            {output.stdout && (
              <div className="bg-black/60 rounded-lg p-3 border border-gray-800 text-gray-200 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                {output.stdout}
              </div>
            )}

            {/* Error / Traceback */}
            {(!output.ok || output.error) && (
              <div className="bg-red-950/30 rounded-lg p-3 border border-red-500/30 text-rose-300 whitespace-pre-wrap leading-relaxed overflow-x-auto">
                <div className="font-bold text-red-400 mb-1 flex items-center gap-1.5">
                  <span className="w-2 h-2 rounded-full bg-red-500" />
                  <span>Execution Error:</span>
                </div>
                {output.traceback || output.error}
              </div>
            )}

            {/* Empty Output notice */}
            {output.ok && !output.stdout && (!output.figures || output.figures.length === 0) && (
              <div className="text-gray-500 italic py-1">
                Process finished with exit code 0 (no output printed). Try adding <code>print(...)</code>.
              </div>
            )}

            {/* Matplotlib Figures */}
            {output.figures && output.figures.length > 0 && (
              <div className="space-y-3 pt-1">
                <div className="flex items-center gap-1.5 text-indigo-400 text-[0.7rem] uppercase tracking-wider font-semibold">
                  <ImageIcon className="w-3.5 h-3.5" />
                  <span>Rendered Visualizations ({output.figures.length})</span>
                </div>
                <div className="grid grid-cols-1 gap-3">
                  {output.figures.map((figUrl, idx) => (
                    <div
                      key={idx}
                      className="bg-black/80 rounded-xl p-3 border border-gray-800 flex justify-center items-center shadow-inner overflow-hidden"
                    >
                      <img
                        src={figUrl}
                        alt={`Plot ${idx + 1}`}
                        className="rounded max-w-full h-auto object-contain"
                      />
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        </div>
      )}
    </div>
  );
}

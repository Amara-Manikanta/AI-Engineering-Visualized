import React, { useRef, useState } from 'react';

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
 *
 * Keeps whatever className the original <pre> had, so existing colour styling
 * is untouched. Copying reads the rendered textContent.
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
 * A reusable code container with a copy-to-clipboard button and consistent
 * chrome (traffic-light dots + optional language label in a header bar).
 *
 * Pass code either way:
 *  - `code="..."`            plain string (also used verbatim for copying)
 *  - `<CodeBlock>{jsx}</CodeBlock>`  pre-highlighted JSX (colored <span>s).
 *    In this case copying reads the rendered textContent, so existing manual
 *    syntax highlighting is preserved with no rewrite.
 *
 * Props:
 *  - language   short label shown in the header (e.g. "python", "bash")
 *  - maxHeight  CSS max-height for the scroll region (default 460px)
 *  - wrap       soft-wrap long lines instead of scrolling horizontally
 */
export default function CodeBlock({
  children,
  code,
  language,
  maxHeight = '460px',
  wrap = false,
  className = '',
}) {
  const preRef = useRef(null);
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    await writeClipboard(code ?? preRef.current?.textContent ?? '');
    setCopied(true);
    setTimeout(() => setCopied(false), 1600);
  };

  return (
    <div className={`relative rounded-xl border border-gray-800 bg-[#111] overflow-hidden ${className}`}>
      {/* Header bar */}
      <div className="flex items-center justify-between px-4 py-2.5 border-b border-gray-800 bg-white/[0.02]">
        <div className="flex items-center gap-1.5">
          <span className="w-3 h-3 rounded-full bg-red-500/60" />
          <span className="w-3 h-3 rounded-full bg-yellow-500/60" />
          <span className="w-3 h-3 rounded-full bg-green-500/60" />
          {language && (
            <span className="ml-2 text-[0.6875rem] font-mono text-gray-500 lowercase">{language}</span>
          )}
        </div>
        <button
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
              Copied
            </>
          ) : (
            <>
              <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><rect x="9" y="9" width="13" height="13" rx="2" ry="2" /><path d="M5 15H4a2 2 0 0 1-2-2V4a2 2 0 0 1 2-2h9a2 2 0 0 1 2 2v1" /></svg>
              Copy
            </>
          )}
        </button>
      </div>

      {/* Code */}
      <pre
        ref={preRef}
        className={`p-4 font-mono text-sm text-gray-300 overflow-y-auto custom-scrollbar m-0 ${
          wrap ? 'whitespace-pre-wrap break-words' : 'overflow-x-auto'
        }`}
        style={{ maxHeight }}
      >
        {code != null ? <code>{code}</code> : children}
      </pre>
    </div>
  );
}

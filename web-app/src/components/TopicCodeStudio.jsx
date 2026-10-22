import React, { useState, useEffect, useMemo, Component } from 'react';
import {
  Code2,
  Play,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ClipboardPaste,
  Eye,
  AlertTriangle,
  FileCode,
  GitBranch,
  UploadCloud,
  Key,
  ExternalLink,
  X,
} from 'lucide-react';
import {
  getOriginalPageSource,
  getCustomPageCode,
  saveCustomPageCode,
  clearCustomPageCode,
  hasCustomPageCode,
} from '../lib/pageSources';
import { compileAndEvaluate } from '../lib/jsxRuntime';
import routeFileMap from '../lib/routeFileMap.json';

// Error Boundary to prevent runtime exceptions in custom components from crashing the app
class SandboxErrorBoundary extends Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error('Sandbox runtime error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="p-6 rounded-2xl bg-red-950/30 border border-red-500/40 text-red-200">
          <div className="flex items-center gap-2 font-bold text-red-400 mb-2">
            <AlertTriangle className="w-5 h-5 shrink-0" />
            <span>Runtime Execution Error</span>
          </div>
          <p className="text-xs font-mono bg-black/60 p-3 rounded-xl border border-red-500/20 text-rose-300 overflow-x-auto whitespace-pre-wrap">
            {this.state.error?.message || String(this.state.error)}
          </p>
          <button
            onClick={() => {
              this.setState({ hasError: false, error: null });
              this.props.onRetry?.();
            }}
            className="mt-4 px-3 py-1.5 rounded-lg text-xs font-mono bg-white/10 hover:bg-white/20 text-white cursor-pointer transition-colors"
          >
            Retry Render
          </button>
        </div>
      );
    }
    return this.props.children;
  }
}

export default function TopicCodeStudio({ pagePath, title, onRevertToView }) {
  const [sourceCode, setSourceCode] = useState('');
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('editor'); // 'editor' | 'preview'
  const [copiedPrompt, setCopiedPrompt] = useState(false);
  const [copiedCode, setCopiedCode] = useState(false);
  const [saveStatus, setSaveStatus] = useState('');
  const [hasOverride, setHasOverride] = useState(false);

  // Compile state
  const [compileError, setCompileError] = useState(null);
  const [compiledComponent, setCompiledComponent] = useState(null);

  // GitHub Direct Push state
  const [isGitModalOpen, setIsGitModalOpen] = useState(false);
  const [gitToken, setGitToken] = useState(() => localStorage.getItem('ai_visualized_gh_token') || '');
  const [gitRepo, setGitRepo] = useState(() => localStorage.getItem('ai_visualized_gh_repo') || 'Amara-Manikanta/AI-Engineering-Visualized');
  const [gitBranch, setGitBranch] = useState(() => localStorage.getItem('ai_visualized_gh_branch') || 'main');
  const [gitCommitMsg, setGitCommitMsg] = useState('');
  const [gitPushing, setGitPushing] = useState(false);
  const [gitResult, setGitResult] = useState(null);
  const [gitError, setGitError] = useState(null);

  const targetRepoFile = useMemo(() => {
    const mapped = routeFileMap[pagePath];
    if (mapped) {
      return 'web-app/src/' + mapped.replace(/^\.\.\//, '');
    }
    return `web-app/src/pages${pagePath}.jsx`;
  }, [pagePath]);

  // Load source on mount or pagePath change
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const custom = getCustomPageCode(pagePath);
      const isCustom = hasCustomPageCode(pagePath);
      setHasOverride(isCustom);

      if (custom) {
        if (mounted) {
          setSourceCode(custom);
          setLoading(false);
        }
        return;
      }

      const original = await getOriginalPageSource(pagePath);
      if (mounted) {
        setSourceCode(original || '// No source found for this page.');
        setLoading(false);
      }
    }
    load();
    return () => {
      mounted = false;
    };
  }, [pagePath]);

  // Run compilation
  const handleCompileAndPreview = () => {
    setCompileError(null);
    const { Component: Comp, error } = compileAndEvaluate(sourceCode);
    if (error) {
      setCompileError(error);
      setCompiledComponent(null);
      setActiveTab('preview');
      return;
    }
    setCompiledComponent(() => Comp);
    setActiveTab('preview');
  };

  // Copy structured prompt for AI
  const handleCopyPrompt = () => {
    const prompt = `Here is the React component for the topic "${title}".
Please modify and enhance this component based on my request below.
Return ONLY the complete updated JSX component:

\`\`\`jsx
${sourceCode}
\`\`\`
`;
    navigator.clipboard.writeText(prompt);
    setCopiedPrompt(true);
    setTimeout(() => setCopiedPrompt(false), 2500);
  };

  // Copy raw code
  const handleCopyCode = () => {
    navigator.clipboard.writeText(sourceCode);
    setCopiedCode(true);
    setTimeout(() => setCopiedCode(false), 2000);
  };

  // Paste from clipboard
  const handlePasteCode = async () => {
    try {
      const text = await navigator.clipboard.readText();
      if (text) {
        setSourceCode(text);
        setSaveStatus('Pasted from clipboard');
        setTimeout(() => setSaveStatus(''), 2000);
      }
    } catch {
      alert('Clipboard permission denied. Please paste directly into the text editor.');
    }
  };

  // Save as active custom version
  const handleSaveActive = () => {
    const { Component: Comp, error } = compileAndEvaluate(sourceCode);
    if (error) {
      setCompileError(error);
      setActiveTab('preview');
      return;
    }
    saveCustomPageCode(pagePath, sourceCode);
    setHasOverride(true);
    setCompiledComponent(() => Comp);
    setSaveStatus('Saved & Active on this device!');
    setTimeout(() => setSaveStatus(''), 3000);
  };

  // Revert back to original bundled source
  const handleRevert = async () => {
    if (!window.confirm('Revert back to the original bundled version of this topic?')) return;
    clearCustomPageCode(pagePath);
    setHasOverride(false);
    setCompileError(null);
    setCompiledComponent(null);
    const original = await getOriginalPageSource(pagePath);
    setSourceCode(original || '');
    setSaveStatus('Reverted to original.');
    setTimeout(() => setSaveStatus(''), 2500);
  };

  const handleOpenGitModal = () => {
    setGitCommitMsg(`feat: enhance ${title} via in-app studio`);
    setGitError(null);
    setGitResult(null);
    setIsGitModalOpen(true);
  };

  const handleExecutePush = async () => {
    if (!gitToken.trim()) {
      setGitError('Please enter a GitHub Personal Access Token.');
      return;
    }
    setGitPushing(true);
    setGitError(null);
    setGitResult(null);

    try {
      localStorage.setItem('ai_visualized_gh_token', gitToken.trim());
      localStorage.setItem('ai_visualized_gh_repo', gitRepo.trim());
      localStorage.setItem('ai_visualized_gh_branch', gitBranch.trim());

      const [owner, repoName] = gitRepo.trim().split('/');
      if (!owner || !repoName) throw new Error('Repository must be formatted as owner/repo');

      const apiBase = `https://api.github.com/repos/${owner}/${repoName}/contents/${targetRepoFile}`;

      // 1. Get current SHA if exists
      let sha = null;
      const getRes = await fetch(`${apiBase}?ref=${encodeURIComponent(gitBranch.trim())}`, {
        headers: {
          Authorization: `Bearer ${gitToken.trim()}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });

      if (getRes.ok) {
        const fileInfo = await getRes.json();
        sha = fileInfo.sha;
      } else if (getRes.status !== 404) {
        const errJson = await getRes.json().catch(() => ({}));
        throw new Error(errJson.message || `Unable to inspect file (${getRes.status})`);
      }

      // Base64 UTF8 conversion
      const base64Content = btoa(unescape(encodeURIComponent(sourceCode)));

      // 2. Put file
      const putRes = await fetch(apiBase, {
        method: 'PUT',
        headers: {
          Authorization: `Bearer ${gitToken.trim()}`,
          Accept: 'application/vnd.github.v3+json',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          message: gitCommitMsg || `Update ${title} via in-app studio`,
          content: base64Content,
          branch: gitBranch.trim(),
          ...(sha ? { sha } : {}),
        }),
      });

      if (!putRes.ok) {
        const errJson = await putRes.json().catch(() => ({}));
        throw new Error(errJson.message || `Commit failed with status ${putRes.status}`);
      }

      const resData = await putRes.json();
      setGitResult(resData);
    } catch (err) {
      setGitError(err.message || String(err));
    } finally {
      setGitPushing(false);
    }
  };

  const lineCount = useMemo(() => {
    return sourceCode ? sourceCode.split('\n').length : 0;
  }, [sourceCode]);

  return (
    <div className="rounded-3xl bg-[#0f0f15] border border-purple-500/30 p-4 sm:p-6 shadow-2xl space-y-5">
      {/* Top Banner / Actions */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-white/10">
        <div>
          <div className="flex items-center gap-2 text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
            <Sparkles className="w-4 h-4" />
            <span>In-App Topic Sandbox &amp; Code Studio</span>
          </div>
          <h2 className="text-xl sm:text-2xl font-black text-white mt-1">
            {title}
          </h2>
          <p className="text-xs text-gray-400 mt-0.5">
            View, edit, or paste AI-generated code to test new visual explainers live on your phone.
          </p>
        </div>

        {/* Actions & Tab Switch */}
        <div className="flex items-center gap-2 self-start sm:self-auto flex-wrap">
          {onRevertToView && (
            <button
              onClick={onRevertToView}
              className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 text-xs font-medium cursor-pointer transition-all"
              title="Return to standard topic view"
            >
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>Back to Topic</span>
            </button>
          )}

          {/* Tab switch: Editor vs Preview */}
          <div className="flex items-center gap-1.5 p-1 rounded-xl bg-black/60 border border-white/10">
            <button
              onClick={() => setActiveTab('editor')}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'editor'
                  ? 'bg-purple-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Code2 className="w-3.5 h-3.5" />
              <span>Code Editor</span>
            </button>
            <button
              onClick={handleCompileAndPreview}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                activeTab === 'preview'
                  ? 'bg-indigo-600 text-white shadow'
                  : 'text-gray-400 hover:text-white'
              }`}
            >
              <Eye className="w-3.5 h-3.5" />
              <span>Test Preview</span>
            </button>
          </div>
        </div>
      </div>

      {/* Action Buttons Toolbar */}
      <div className="flex flex-wrap items-center gap-2 text-xs">
        {/* Copy for AI button */}
        <button
          onClick={handleCopyPrompt}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 text-purple-200 border border-purple-500/40 font-semibold cursor-pointer transition-all"
        >
          {copiedPrompt ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Sparkles className="w-3.5 h-3.5" />}
          <span>{copiedPrompt ? 'Copied Prompt for AI!' : 'Copy for AI (Claude / ChatGPT)'}</span>
        </button>

        {/* Copy Code button */}
        <button
          onClick={handleCopyCode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-mono cursor-pointer transition-all"
        >
          {copiedCode ? <Check className="w-3.5 h-3.5 text-emerald-400" /> : <Copy className="w-3.5 h-3.5" />}
          <span>{copiedCode ? 'Copied!' : 'Copy Code'}</span>
        </button>

        {/* Paste from Clipboard button */}
        <button
          onClick={handlePasteCode}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-mono cursor-pointer transition-all"
        >
          <ClipboardPaste className="w-3.5 h-3.5" />
          <span>Paste Code</span>
        </button>

        {/* Run & Preview button */}
        <button
          onClick={handleCompileAndPreview}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer transition-all shadow-md ml-auto"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run &amp; Test</span>
        </button>

        {/* Save as Active */}
        <button
          onClick={handleSaveActive}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-all shadow-md"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Save as Active</span>
        </button>

        {/* Push to GitHub */}
        <button
          onClick={handleOpenGitModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer transition-all shadow-md"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Push to GitHub</span>
        </button>

        {/* Revert if override exists */}
        {hasOverride && (
          <button
            onClick={handleRevert}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-red-950/40 hover:bg-red-900/40 text-red-300 border border-red-500/30 font-mono cursor-pointer transition-all"
          >
            <RotateCcw className="w-3.5 h-3.5" />
            <span>Reset to Default</span>
          </button>
        )}
      </div>

      {/* Notification Toast */}
      {saveStatus && (
        <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono flex items-center gap-2">
          <Check className="w-4 h-4 shrink-0" />
          <span>{saveStatus}</span>
        </div>
      )}

      {/* Content Area */}
      {loading ? (
        <div className="py-16 text-center text-gray-400 font-mono text-xs flex items-center justify-center gap-2">
          <span className="w-4 h-4 rounded-full border-2 border-purple-500 border-t-transparent animate-spin" />
          Loading topic source code...
        </div>
      ) : activeTab === 'editor' ? (
        <div className="space-y-2">
          <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 px-1">
            <span className="flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-purple-400" />
              <span>JSX Source ({lineCount} lines)</span>
            </span>
            <span>{hasOverride ? '⚡ Custom Version Loaded' : 'Bundled Original'}</span>
          </div>

          <textarea
            value={sourceCode}
            onChange={(e) => setSourceCode(e.target.value)}
            spellCheck={false}
            autoCorrect="off"
            autoCapitalize="off"
            className="w-full h-[65vh] p-4 rounded-2xl bg-black/80 border border-white/10 text-gray-200 font-mono text-xs leading-relaxed focus:outline-none focus:border-purple-500/60 custom-scrollbar resize-y"
            placeholder="// Paste React JSX code here..."
          />
        </div>
      ) : (
        /* Preview Tab */
        <div className="space-y-4">
          <div className="flex items-center justify-between text-xs font-mono text-gray-400 px-1">
            <span className="flex items-center gap-1.5">
              <Eye className="w-3.5 h-3.5 text-indigo-400" />
              <span>Live Render Output</span>
            </span>
            <button
              onClick={() => setActiveTab('editor')}
              className="text-purple-400 hover:text-purple-300 underline cursor-pointer"
            >
              Back to Code Editor
            </button>
          </div>

          {compileError ? (
            <div className="p-5 rounded-2xl bg-red-950/30 border border-red-500/40 text-red-200 space-y-2">
              <div className="flex items-center gap-2 font-bold text-red-400 text-sm">
                <AlertTriangle className="w-4 h-4 shrink-0" />
                <span>Compilation Error</span>
              </div>
              <p className="text-xs font-mono bg-black/70 p-3 rounded-xl border border-red-500/20 text-rose-300 overflow-x-auto whitespace-pre-wrap">
                {compileError}
              </p>
              <div className="text-[11px] text-gray-400 pt-1">
                Tip: Check for unclosed JSX tags, missing imports, or syntax typos from the AI output.
              </div>
            </div>
          ) : compiledComponent ? (
            <div className="p-4 sm:p-6 rounded-2xl bg-[#0a0a0f] border border-white/10">
              <div className="mb-4 pb-2 border-b border-white/5 flex items-center justify-between">
                <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-mono font-bold bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                  <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-ping" />
                  Live Component Mounted
                </span>
                <span className="text-[10px] font-mono text-gray-500">
                  Fully interactive in this device&apos;s WebView
                </span>
              </div>
              <SandboxErrorBoundary onRetry={handleCompileAndPreview}>
                {React.createElement(compiledComponent)}
              </SandboxErrorBoundary>
            </div>
          ) : (
            <div className="py-12 text-center text-gray-500 font-mono text-xs">
              Click &quot;Run &amp; Test&quot; to compile and preview your code.
            </div>
          )}
        </div>
      )}

      {/* GitHub Direct Push Modal */}
      {isGitModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
          <div className="w-full max-w-lg rounded-2xl bg-[#121218] border border-purple-500/30 p-6 shadow-2xl space-y-4">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2">
                <div className="p-2 rounded-xl bg-purple-500/20 text-purple-400">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Push Directly to GitHub</h3>
                  <p className="text-xs text-gray-400">Commit changes from your device</p>
                </div>
              </div>
              <button
                onClick={() => setIsGitModalOpen(false)}
                className="p-1 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-mono">Target Repository</label>
                <input
                  type="text"
                  value={gitRepo}
                  onChange={(e) => setGitRepo(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono focus:outline-none focus:border-purple-500"
                  placeholder="owner/repo"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-mono">Branch</label>
                  <input
                    type="text"
                    value={gitBranch}
                    onChange={(e) => setGitBranch(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono focus:outline-none focus:border-purple-500"
                    placeholder="main"
                  />
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-mono">File Path in Repo</label>
                  <div className="px-3 py-2 rounded-xl bg-black/40 border border-white/5 text-gray-300 font-mono text-[11px] truncate" title={targetRepoFile}>
                    {targetRepoFile}
                  </div>
                </div>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-mono">GitHub Personal Access Token</label>
                <div className="relative">
                  <input
                    type="password"
                    value={gitToken}
                    onChange={(e) => setGitToken(e.target.value)}
                    className="w-full pl-9 pr-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono focus:outline-none focus:border-purple-500"
                    placeholder="ghp_... or github_pat_..."
                  />
                  <Key className="w-4 h-4 text-gray-500 absolute left-3 top-2.5" />
                </div>
                <p className="text-[10px] text-gray-500 mt-1">
                  Stored securely on this device. Needs <code className="text-purple-300">repo</code> or <code className="text-purple-300">Contents: Read and Write</code> permissions.
                </p>
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-mono">Commit Message</label>
                <input
                  type="text"
                  value={gitCommitMsg}
                  onChange={(e) => setGitCommitMsg(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl bg-black/60 border border-white/10 text-white font-mono focus:outline-none focus:border-purple-500"
                  placeholder="Commit message"
                />
              </div>
            </div>

            {gitError && (
              <div className="p-3 rounded-xl bg-red-950/40 border border-red-500/40 text-rose-300 text-xs font-mono">
                {gitError}
              </div>
            )}

            {gitResult && (
              <div className="p-3 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono space-y-1">
                <div className="flex items-center gap-1.5 font-bold">
                  <Check className="w-4 h-4" />
                  <span>Successfully committed to GitHub!</span>
                </div>
                {gitResult.commit?.html_url && (
                  <a
                    href={gitResult.commit.html_url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-emerald-400 underline hover:text-emerald-300 text-xs"
                  >
                    <span>View Commit on GitHub</span>
                    <ExternalLink className="w-3 h-3" />
                  </a>
                )}
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-2 border-t border-white/10">
              <button
                onClick={() => setIsGitModalOpen(false)}
                className="px-4 py-2 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleExecutePush}
                disabled={gitPushing}
                className="flex items-center gap-2 px-4 py-2 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-all shadow-lg"
              >
                {gitPushing ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Pushing...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Push Commit</span>
                  </>
                )}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

import React, { useState, useEffect, useMemo, useRef, useCallback, Component } from 'react';
import {
  Code2,
  Play,
  Copy,
  Check,
  RotateCcw,
  Sparkles,
  ClipboardPaste,
  Eye,
  EyeOff,
  AlertTriangle,
  FileCode,
  GitBranch,
  UploadCloud,
  Key,
  ExternalLink,
  X,
  ShieldCheck,
  GitPullRequest,
  Search,
  ChevronUp,
  ChevronDown,
  Replace,
  Undo2,
  Redo2,
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
  const [showToken, setShowToken] = useState(false);
  const [tokenVerifiedUser, setTokenVerifiedUser] = useState(null);
  const [verifyingToken, setVerifyingToken] = useState(false);

  // Undo / Redo history state
  const [history, setHistory] = useState([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const isUndoRedoAction = useRef(false);
  const lastSnapshotTime = useRef(0);

  // Search & Replace state
  const [showSearch, setShowSearch] = useState(false);
  const [showReplace, setShowReplace] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [replaceQuery, setReplaceQuery] = useState('');
  const [caseSensitive, setCaseSensitive] = useState(false);
  const [currentMatchIndex, setCurrentMatchIndex] = useState(-1);
  const searchInputRef = useRef(null);
  const textareaRef = useRef(null);
  const backdropRef = useRef(null);

  const targetRepoFile = useMemo(() => {
    const mapped = routeFileMap[pagePath];
    if (mapped) {
      return 'web-app/src/' + mapped.replace(/^\.\.\//, '');
    }
    return `web-app/src/pages${pagePath}.jsx`;
  }, [pagePath]);

  // Push code changes into history stack
  const pushHistory = (newCode, force = false) => {
    const now = Date.now();
    setHistory((prev) => {
      if (!force && now - lastSnapshotTime.current < 500 && historyIndex >= 0) {
        const copy = [...prev];
        copy[historyIndex] = newCode;
        return copy;
      }
      const truncated = prev.slice(0, historyIndex + 1);
      if (truncated.length >= 100) truncated.shift();
      return [...truncated, newCode];
    });

    setHistoryIndex((prev) => {
      if (!force && now - lastSnapshotTime.current < 500 && prev >= 0) {
        return prev;
      }
      lastSnapshotTime.current = now;
      return Math.min(prev + 1, 99);
    });
  };

  const handleCodeChange = (newVal) => {
    if (isUndoRedoAction.current) {
      isUndoRedoAction.current = false;
      return;
    }
    setSourceCode(newVal);
    pushHistory(newVal);
  };

  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  const handleUndo = () => {
    if (historyIndex > 0) {
      const prevIdx = historyIndex - 1;
      const targetCode = history[prevIdx];
      isUndoRedoAction.current = true;
      setHistoryIndex(prevIdx);
      setSourceCode(targetCode);
    }
  };

  const handleRedo = () => {
    if (historyIndex < history.length - 1) {
      const nextIdx = historyIndex + 1;
      const targetCode = history[nextIdx];
      isUndoRedoAction.current = true;
      setHistoryIndex(nextIdx);
      setSourceCode(targetCode);
    }
  };

  // Compute search match indices
  const matches = useMemo(() => {
    if (!searchQuery) return [];
    const results = [];
    const text = caseSensitive ? sourceCode : sourceCode.toLowerCase();
    const query = caseSensitive ? searchQuery : searchQuery.toLowerCase();
    if (!query) return [];

    let idx = 0;
    while ((idx = text.indexOf(query, idx)) !== -1) {
      results.push(idx);
      idx += query.length || 1;
    }
    return results;
  }, [sourceCode, searchQuery, caseSensitive]);

  // Scroll to and select match in textarea
  const jumpToMatch = useCallback(
    (idx, shouldFocus = false) => {
      if (idx < 0 || idx >= matches.length || !textareaRef.current) return;
      const matchPos = matches[idx];
      const ta = textareaRef.current;

      if (shouldFocus) {
        ta.focus();
      }
      ta.setSelectionRange(matchPos, matchPos + searchQuery.length);

      const textBefore = sourceCode.substring(0, matchPos);
      const lineNum = textBefore.split('\n').length - 1;
      const lineHeight = 20;
      const targetScrollTop = Math.max(0, lineNum * lineHeight - ta.clientHeight / 2);
      ta.scrollTop = targetScrollTop;

      const currentLine = textBefore.split('\n').pop() || '';
      const charWidth = 7.2;
      const targetScrollLeft = Math.max(0, currentLine.length * charWidth - ta.clientWidth / 2);
      ta.scrollLeft = targetScrollLeft;

      if (backdropRef.current) {
        backdropRef.current.scrollTop = targetScrollTop;
        backdropRef.current.scrollLeft = targetScrollLeft;
      }
    },
    [matches, searchQuery, sourceCode]
  );

  // Adjust match index when query/source changes
  useEffect(() => {
    if (matches.length > 0) {
      if (currentMatchIndex < 0 || currentMatchIndex >= matches.length) {
        setCurrentMatchIndex(0);
        jumpToMatch(0, false);
      }
    } else {
      setCurrentMatchIndex(-1);
    }
  }, [matches, currentMatchIndex, jumpToMatch]);

  // Render visual highlights in backdrop layer beneath transparent textarea
  const renderedBackdropContent = useMemo(() => {
    if (!showSearch || !searchQuery || matches.length === 0) {
      return null;
    }

    const nodes = [];
    let lastIndex = 0;
    const qLen = searchQuery.length;
    const matchesToRender = matches.slice(0, 1500);

    for (let i = 0; i < matchesToRender.length; i++) {
      const matchIdx = matchesToRender[i];
      if (matchIdx > lastIndex) {
        nodes.push(sourceCode.substring(lastIndex, matchIdx));
      }
      const isCurrent = i === currentMatchIndex;
      const matchedText = sourceCode.substring(matchIdx, matchIdx + qLen);
      nodes.push(
        <mark
          key={`m-${i}-${matchIdx}`}
          className={
            isCurrent
              ? 'p-0 m-0 bg-amber-400 text-transparent rounded-[2px] shadow-[0_0_0_2px_rgba(251,191,36,0.95)]'
              : 'p-0 m-0 bg-yellow-400/35 text-transparent rounded-[2px]'
          }
        >
          {matchedText}
        </mark>
      );
      lastIndex = matchIdx + qLen;
    }

    if (lastIndex < sourceCode.length) {
      nodes.push(sourceCode.substring(lastIndex));
    }

    return nodes;
  }, [showSearch, searchQuery, matches, currentMatchIndex, sourceCode]);

  // Sync scroll between textarea and highlight backdrop
  const handleScroll = () => {
    if (textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  };

  useEffect(() => {
    if (showSearch && textareaRef.current && backdropRef.current) {
      backdropRef.current.scrollTop = textareaRef.current.scrollTop;
      backdropRef.current.scrollLeft = textareaRef.current.scrollLeft;
    }
  }, [showSearch, searchQuery, currentMatchIndex]);

  const handleNextMatch = () => {
    if (matches.length === 0) return;
    const nextIdx = (currentMatchIndex + 1) % matches.length;
    setCurrentMatchIndex(nextIdx);
    jumpToMatch(nextIdx, false);
  };

  const handlePrevMatch = () => {
    if (matches.length === 0) return;
    const prevIdx = (currentMatchIndex - 1 + matches.length) % matches.length;
    setCurrentMatchIndex(prevIdx);
    jumpToMatch(prevIdx, false);
  };

  const handleReplaceCurrent = () => {
    if (currentMatchIndex < 0 || currentMatchIndex >= matches.length) return;
    const matchPos = matches[currentMatchIndex];
    const newCode =
      sourceCode.substring(0, matchPos) +
      replaceQuery +
      sourceCode.substring(matchPos + searchQuery.length);
    setSourceCode(newCode);
    pushHistory(newCode, true);
  };

  const handleReplaceAll = () => {
    if (!searchQuery || matches.length === 0) return;
    let newCode;
    if (caseSensitive) {
      newCode = sourceCode.replaceAll(searchQuery, replaceQuery);
    } else {
      const regex = new RegExp(searchQuery.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'gi');
      newCode = sourceCode.replace(regex, replaceQuery);
    }
    const count = matches.length;
    setSourceCode(newCode);
    pushHistory(newCode, true);
    setSaveStatus(`Replaced ${count} occurrences`);
    setTimeout(() => setSaveStatus(''), 2000);
  };

  const handleSearchInputKeyDown = (e) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      if (e.shiftKey) {
        handlePrevMatch();
      } else {
        handleNextMatch();
      }
    }
    if (e.key === 'Escape') {
      e.preventDefault();
      setShowSearch(false);
      textareaRef.current?.focus();
    }
  };

  const handleTextareaKeyDown = (e) => {
    // Tab key indent support
    if (e.key === 'Tab' && textareaRef.current) {
      e.preventDefault();
      const ta = textareaRef.current;
      const start = ta.selectionStart;
      const end = ta.selectionEnd;
      const val = sourceCode;
      const updated = val.substring(0, start) + '  ' + val.substring(end);
      handleCodeChange(updated);
      setTimeout(() => {
        if (textareaRef.current) {
          textareaRef.current.selectionStart = textareaRef.current.selectionEnd = start + 2;
        }
      }, 0);
    }
  };

  // Keyboard shortcuts (Cmd/Ctrl + Enter to run, Cmd/Ctrl + S to save, Cmd/Ctrl + Shift + P to push, Cmd+F/H for search, Cmd+Z/Y for undo/redo)
  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.metaKey || e.ctrlKey) && e.key === 'Enter') {
        e.preventDefault();
        handleCompileAndPreview();
      }
      if ((e.metaKey || e.ctrlKey) && (e.key === 's' || e.key === 'S') && !e.shiftKey) {
        e.preventDefault();
        handleSaveActive();
      }
      if ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'p' || e.key === 'P')) {
        e.preventDefault();
        handleOpenGitModal();
      }
      // Find (Cmd+F)
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && (e.key === 'f' || e.key === 'F')) {
        e.preventDefault();
        setActiveTab('editor');
        setShowSearch(true);
        setTimeout(() => {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        }, 50);
      }
      // Replace (Cmd+H)
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && (e.key === 'h' || e.key === 'H')) {
        e.preventDefault();
        setActiveTab('editor');
        setShowSearch(true);
        setShowReplace(true);
        setTimeout(() => {
          searchInputRef.current?.focus();
          searchInputRef.current?.select();
        }, 50);
      }
      // Undo (Cmd+Z, no shift)
      if ((e.metaKey || e.ctrlKey) && !e.shiftKey && (e.key === 'z' || e.key === 'Z')) {
        e.preventDefault();
        handleUndo();
      }
      // Redo (Cmd+Shift+Z or Cmd+Y)
      if (
        ((e.metaKey || e.ctrlKey) && e.shiftKey && (e.key === 'z' || e.key === 'Z')) ||
        ((e.metaKey || e.ctrlKey) && (e.key === 'y' || e.key === 'Y'))
      ) {
        e.preventDefault();
        handleRedo();
      }
      // Close search (Escape)
      if (e.key === 'Escape' && showSearch) {
        e.preventDefault();
        setShowSearch(false);
        textareaRef.current?.focus();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [sourceCode, title, hasOverride, historyIndex, history, showSearch, matches, currentMatchIndex]);

  // Load source on mount or pagePath change
  useEffect(() => {
    let mounted = true;
    async function load() {
      setLoading(true);
      const custom = getCustomPageCode(pagePath);
      const isCustom = hasCustomPageCode(pagePath);
      setHasOverride(isCustom);

      let initialText = '';
      if (custom) {
        initialText = custom;
      } else {
        const original = await getOriginalPageSource(pagePath);
        initialText = original || '// No source found for this page.';
      }

      if (mounted) {
        setSourceCode(initialText);
        setHistory([initialText]);
        setHistoryIndex(0);
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
        pushHistory(text, true);
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
    const text = original || '';
    setSourceCode(text);
    setHistory([text]);
    setHistoryIndex(0);
    setSaveStatus('Reverted to original.');
    setTimeout(() => setSaveStatus(''), 2500);
  };

  const handleVerifyToken = async (tokenCandidate) => {
    const t = (tokenCandidate || gitToken).trim();
    if (!t) return;
    setVerifyingToken(true);
    setTokenVerifiedUser(null);
    try {
      const res = await fetch('https://api.github.com/user', {
        headers: {
          Authorization: `Bearer ${t}`,
          Accept: 'application/vnd.github.v3+json',
        },
      });
      if (res.ok) {
        const u = await res.json();
        setTokenVerifiedUser(u.login);
        localStorage.setItem('ai_visualized_gh_token', t);
      } else {
        setTokenVerifiedUser(false);
      }
    } catch {
      setTokenVerifiedUser(false);
    } finally {
      setVerifyingToken(false);
    }
  };

  const handleOpenGitModal = () => {
    setGitCommitMsg(`feat: enhance ${title} via in-app studio`);
    setGitError(null);
    setGitResult(null);
    setIsGitModalOpen(true);
    if (gitToken.trim() && !tokenVerifiedUser) {
      handleVerifyToken(gitToken.trim());
    }
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
      const token = gitToken.trim();
      const repo = gitRepo.trim();
      const branch = gitBranch.trim();
      const commitMsg = gitCommitMsg.trim() || `Update ${title} via in-app mobile studio`;

      localStorage.setItem('ai_visualized_gh_token', token);
      localStorage.setItem('ai_visualized_gh_repo', repo);
      localStorage.setItem('ai_visualized_gh_branch', branch);

      const [owner, repoName] = repo.split('/');
      if (!owner || !repoName) throw new Error('Repository must be formatted as owner/repo (e.g. Amara-Manikanta/AI-Engineering-Visualized)');

      const headers = {
        Authorization: `Bearer ${token}`,
        Accept: 'application/vnd.github.v3+json',
        'Content-Type': 'application/json',
      };

      // 1. Check if the target branch exists, or create it automatically from main if it's new
      const branchRefRes = await fetch(
        `https://api.github.com/repos/${owner}/${repoName}/git/ref/heads/${encodeURIComponent(branch)}`,
        { headers }
      );

      if (branchRefRes.status === 404) {
        const mainRefRes = await fetch(
          `https://api.github.com/repos/${owner}/${repoName}/git/ref/heads/main`,
          { headers }
        );
        if (mainRefRes.ok) {
          const mainRefData = await mainRefRes.json();
          const createBranchRes = await fetch(
            `https://api.github.com/repos/${owner}/${repoName}/git/refs`,
            {
              method: 'POST',
              headers,
              body: JSON.stringify({
                ref: `refs/heads/${branch}`,
                sha: mainRefData.object.sha,
              }),
            }
          );
          if (!createBranchRes.ok) {
            const err = await createBranchRes.json().catch(() => ({}));
            throw new Error(err.message || `Failed to create new branch '${branch}'`);
          }
        }
      }

      const apiBase = `https://api.github.com/repos/${owner}/${repoName}/contents/${targetRepoFile}`;

      // 2. Get current SHA if exists on that branch
      let sha = null;
      const getRes = await fetch(`${apiBase}?ref=${encodeURIComponent(branch)}`, {
        headers,
      });

      if (getRes.ok) {
        const fileInfo = await getRes.json();
        sha = fileInfo.sha;
      } else if (getRes.status !== 404) {
        const errJson = await getRes.json().catch(() => ({}));
        throw new Error(errJson.message || `Unable to inspect file (${getRes.status})`);
      }

      // 3. UTF-8 safe base64 conversion
      const base64Content = btoa(unescape(encodeURIComponent(sourceCode)));

      // 4. Put file
      const putRes = await fetch(apiBase, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          message: commitMsg,
          content: base64Content,
          branch,
          ...(sha ? { sha } : {}),
        }),
      });

      if (!putRes.ok) {
        const errJson = await putRes.json().catch(() => ({}));
        throw new Error(errJson.message || `Commit failed with status ${putRes.status}`);
      }

      const resData = await putRes.json();
      setGitResult({
        ...resData,
        branch,
        repo,
        prUrl: branch !== 'main' ? `https://github.com/${owner}/${repoName}/pull/new/${encodeURIComponent(branch)}` : null,
      });
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
            View, edit, or test AI-generated code live with instant preview and 1-click Push to GitHub.
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

        {/* Undo button */}
        <button
          type="button"
          onClick={handleUndo}
          disabled={!canUndo}
          title="Undo (⌘Z)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-mono cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Undo2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Undo</span>
          <span className="hidden lg:inline text-[10px] opacity-60">⌘Z</span>
        </button>

        {/* Redo button */}
        <button
          type="button"
          onClick={handleRedo}
          disabled={!canRedo}
          title="Redo (⇧⌘Z)"
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 border border-white/10 font-mono cursor-pointer transition-all disabled:opacity-30 disabled:cursor-not-allowed"
        >
          <Redo2 className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Redo</span>
          <span className="hidden lg:inline text-[10px] opacity-60">⇧⌘Z</span>
        </button>

        {/* Find & Replace button */}
        <button
          type="button"
          onClick={() => {
            setActiveTab('editor');
            const next = !showSearch;
            setShowSearch(next);
            if (next) {
              setTimeout(() => {
                searchInputRef.current?.focus();
                searchInputRef.current?.select();
              }, 50);
            }
          }}
          title="Find & Replace in Code (⌘F)"
          className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border font-mono cursor-pointer transition-all ${
            showSearch
              ? 'bg-purple-600/30 border-purple-500/60 text-purple-200'
              : 'bg-white/5 hover:bg-white/10 text-gray-300 border-white/10'
          }`}
        >
          <Search className="w-3.5 h-3.5" />
          <span className="hidden md:inline">Find</span>
          <span className="hidden lg:inline text-[10px] opacity-60">⌘F</span>
        </button>

        {/* Run & Preview button */}
        <button
          onClick={handleCompileAndPreview}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold cursor-pointer transition-all shadow-md ml-auto"
          title="Run & Test (⌘↵)"
        >
          <Play className="w-3.5 h-3.5 fill-current" />
          <span>Run &amp; Test</span>
          <span className="hidden sm:inline-block text-[10px] opacity-75 font-mono ml-0.5">⌘↵</span>
        </button>

        {/* Save as Active */}
        <button
          onClick={handleSaveActive}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-bold cursor-pointer transition-all shadow-md"
          title="Save as Active (⌘S)"
        >
          <Check className="w-3.5 h-3.5" />
          <span>Save as Active</span>
          <span className="hidden sm:inline-block text-[10px] opacity-75 font-mono ml-0.5">⌘S</span>
        </button>

        {/* Push to GitHub */}
        <button
          onClick={handleOpenGitModal}
          className="flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-purple-600 hover:bg-purple-500 text-white font-bold cursor-pointer transition-all shadow-md"
          title="Push to GitHub (⇧⌘P)"
        >
          <UploadCloud className="w-3.5 h-3.5" />
          <span>Push to GitHub</span>
          <span className="hidden sm:inline-block text-[10px] opacity-75 font-mono ml-0.5">⇧⌘P</span>
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
          {/* Header Bar */}
          <div className="flex items-center justify-between text-[11px] font-mono text-gray-400 px-1">
            <span className="flex items-center gap-1.5">
              <FileCode className="w-3.5 h-3.5 text-purple-400" />
              <span>JSX Source ({lineCount} lines)</span>
            </span>
            <div className="flex items-center gap-3">
              <span className="text-[10px] text-gray-500 hidden sm:inline">⌘F find • ⌘H replace • ⌘Z undo</span>
              <span>{hasOverride ? '⚡ Custom Version Loaded' : 'Bundled Original'}</span>
            </div>
          </div>

          {/* Search & Replace Floating Bar */}
          {showSearch && (
            <div className="p-3 rounded-2xl bg-[#14151b] border border-purple-500/40 shadow-2xl space-y-2.5 font-mono text-xs animate-in fade-in slide-in-from-top-1 duration-150">
              {/* Find row */}
              <div className="flex flex-wrap items-center gap-2">
                <div className="relative flex-1 min-w-[200px] flex items-center">
                  <Search className="w-3.5 h-3.5 text-gray-500 absolute left-2.5" />
                  <input
                    ref={searchInputRef}
                    type="text"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearchInputKeyDown}
                    placeholder="Find in code (Enter = next, Shift+Enter = prev)..."
                    className="w-full pl-8 pr-24 py-1.5 rounded-xl bg-black/70 border border-white/10 focus:border-purple-500/70 focus:outline-none text-white text-xs placeholder:text-gray-500 shadow-inner"
                  />
                  <div className="absolute right-2.5 flex items-center gap-1 text-[11px]">
                    {searchQuery ? (
                      matches.length > 0 ? (
                        <span className="text-purple-400 font-semibold">
                          {currentMatchIndex + 1} of {matches.length}
                        </span>
                      ) : (
                        <span className="text-rose-400 font-medium">No matches</span>
                      )
                    ) : null}
                  </div>
                </div>

                {/* Match Navigation buttons */}
                <div className="flex items-center gap-1 bg-black/40 rounded-xl p-0.5 border border-white/10">
                  <button
                    type="button"
                    onClick={handlePrevMatch}
                    disabled={matches.length === 0}
                    title="Previous match (Shift + Enter)"
                    className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 text-gray-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronUp className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextMatch}
                    disabled={matches.length === 0}
                    title="Next match (Enter)"
                    className="p-1.5 rounded-lg hover:bg-white/10 disabled:opacity-30 text-gray-300 hover:text-white transition-colors cursor-pointer"
                  >
                    <ChevronDown className="w-4 h-4" />
                  </button>
                </div>

                {/* Case sensitivity toggle */}
                <button
                  type="button"
                  onClick={() => setCaseSensitive(!caseSensitive)}
                  title="Match Case (Aa)"
                  className={`px-2.5 py-1.5 rounded-xl text-xs font-bold border transition-colors cursor-pointer ${
                    caseSensitive
                      ? 'border-purple-500/60 bg-purple-500/20 text-purple-300 shadow-sm'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  Aa
                </button>

                {/* Toggle Replace */}
                <button
                  type="button"
                  onClick={() => setShowReplace(!showReplace)}
                  title="Toggle Replace Bar"
                  className={`flex items-center gap-1 px-2.5 py-1.5 rounded-xl border transition-colors cursor-pointer text-xs ${
                    showReplace
                      ? 'border-indigo-500/60 bg-indigo-500/20 text-indigo-300 shadow-sm'
                      : 'border-white/10 bg-white/5 text-gray-400 hover:text-white hover:bg-white/10'
                  }`}
                >
                  <Replace className="w-3.5 h-3.5" />
                  <span>Replace</span>
                </button>

                {/* Close Search */}
                <button
                  type="button"
                  onClick={() => {
                    setShowSearch(false);
                    textareaRef.current?.focus();
                  }}
                  title="Close (Escape)"
                  className="p-1.5 rounded-xl hover:bg-white/10 text-gray-400 hover:text-white transition-colors cursor-pointer ml-auto"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Replace row */}
              {showReplace && (
                <div className="flex flex-wrap items-center gap-2 pt-2 border-t border-white/5">
                  <div className="relative flex-1 min-w-[200px]">
                    <input
                      type="text"
                      value={replaceQuery}
                      onChange={(e) => setReplaceQuery(e.target.value)}
                      placeholder="Replace with..."
                      className="w-full px-3 py-1.5 rounded-xl bg-black/70 border border-white/10 focus:border-indigo-500/70 focus:outline-none text-white text-xs placeholder:text-gray-500 shadow-inner"
                    />
                  </div>
                  <button
                    type="button"
                    onClick={handleReplaceCurrent}
                    disabled={matches.length === 0}
                    className="px-3 py-1.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 hover:text-white border border-white/10 text-xs font-semibold disabled:opacity-30 cursor-pointer transition-colors"
                  >
                    Replace
                  </button>
                  <button
                    type="button"
                    onClick={handleReplaceAll}
                    disabled={matches.length === 0}
                    className="px-3 py-1.5 rounded-xl bg-indigo-600/30 hover:bg-indigo-600/50 text-indigo-200 border border-indigo-500/40 text-xs font-semibold disabled:opacity-30 cursor-pointer transition-colors"
                  >
                    Replace All ({matches.length})
                  </button>
                </div>
              )}
            </div>
          )}

          <div className="relative w-full h-[65vh] rounded-2xl bg-[#090a0f] border border-white/10 focus-within:border-purple-500/60 overflow-hidden shadow-2xl">
            {showSearch && searchQuery && matches.length > 0 && (
              <pre
                ref={backdropRef}
                aria-hidden="true"
                className="absolute inset-0 p-4 m-0 font-mono text-xs leading-[20px] text-transparent overflow-hidden whitespace-pre pointer-events-none select-none"
                style={{
                  fontFamily:
                    'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                  fontSize: '12px',
                  lineHeight: '20px',
                  tabSize: 2,
                }}
              >
                {renderedBackdropContent}
              </pre>
            )}
            <textarea
              ref={textareaRef}
              value={sourceCode}
              wrap="off"
              onChange={(e) => handleCodeChange(e.target.value)}
              onScroll={handleScroll}
              onKeyDown={handleTextareaKeyDown}
              spellCheck={false}
              autoCorrect="off"
              autoCapitalize="off"
              className="relative z-10 w-full h-full p-4 m-0 font-mono text-xs leading-[20px] bg-transparent text-gray-200 focus:outline-none overflow-auto whitespace-pre custom-scrollbar resize-none selection:bg-purple-700/60 selection:text-white"
              style={{
                fontFamily:
                  'ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace',
                fontSize: '12px',
                lineHeight: '20px',
                tabSize: 2,
              }}
              placeholder="// Paste React JSX code here..."
            />
          </div>
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
        <div className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-black/85 backdrop-blur-sm overflow-y-auto">
          <div className="w-full max-w-lg max-h-[92vh] overflow-y-auto rounded-3xl bg-[#121218] border border-purple-500/30 p-5 sm:p-6 shadow-2xl space-y-4 my-auto">
            <div className="flex items-center justify-between border-b border-white/10 pb-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2.5 rounded-2xl bg-purple-500/20 text-purple-400 border border-purple-500/30">
                  <GitBranch className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-white text-base">Push Directly to GitHub</h3>
                  <p className="text-xs text-gray-400">Commit edits directly from your iPhone</p>
                </div>
              </div>
              <button
                onClick={() => setIsGitModalOpen(false)}
                className="p-1.5 rounded-xl text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="space-y-3.5 text-xs">
              <div>
                <label className="block text-gray-400 mb-1 font-mono">Target Repository</label>
                <input
                  type="text"
                  value={gitRepo}
                  onChange={(e) => setGitRepo(e.target.value)}
                  autoCapitalize="off"
                  autoCorrect="off"
                  spellCheck={false}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono focus:outline-none focus:border-purple-500 text-xs"
                  placeholder="owner/repo"
                />
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-gray-400 mb-1 font-mono">Branch</label>
                  <input
                    type="text"
                    value={gitBranch}
                    onChange={(e) => setGitBranch(e.target.value)}
                    autoCapitalize="off"
                    autoCorrect="off"
                    spellCheck={false}
                    className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono focus:outline-none focus:border-purple-500 text-xs"
                    placeholder="main or new-branch"
                  />
                  <span className="text-[10px] text-gray-500 mt-0.5 block">
                    Auto-creates if new
                  </span>
                </div>
                <div>
                  <label className="block text-gray-400 mb-1 font-mono">File Path in Repo</label>
                  <div className="px-3 py-2.5 rounded-xl bg-black/40 border border-white/5 text-gray-300 font-mono text-[11px] truncate" title={targetRepoFile}>
                    {targetRepoFile}
                  </div>
                  <span className="text-[10px] text-emerald-400/80 mt-0.5 block font-mono">
                    ✓ Matched topic file
                  </span>
                </div>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="text-gray-400 font-mono">GitHub Personal Access Token</label>
                  <a
                    href="https://github.com/settings/tokens/new?scopes=repo&description=AI+Engineering+Visualized+App"
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center gap-1 text-[11px] text-purple-400 hover:text-purple-300 underline"
                  >
                    <span>Generate token ↗</span>
                  </a>
                </div>
                <div className="flex items-center gap-2">
                  <div className="relative flex-1">
                    <input
                      type={showToken ? 'text' : 'password'}
                      value={gitToken}
                      onChange={(e) => {
                        setGitToken(e.target.value);
                        setTokenVerifiedUser(null);
                      }}
                      autoCapitalize="off"
                      autoCorrect="off"
                      spellCheck={false}
                      className="w-full pl-9 pr-10 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono focus:outline-none focus:border-purple-500 text-xs"
                      placeholder="ghp_... or github_pat_..."
                    />
                    <Key className="w-4 h-4 text-gray-500 absolute left-3 top-3" />
                    <button
                      type="button"
                      onClick={() => setShowToken(!showToken)}
                      className="absolute right-3 top-2.5 text-gray-400 hover:text-white p-0.5 cursor-pointer"
                    >
                      {showToken ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                  <button
                    type="button"
                    onClick={() => handleVerifyToken()}
                    disabled={verifyingToken || !gitToken.trim()}
                    className="px-3 py-2.5 rounded-xl bg-purple-500/20 hover:bg-purple-500/30 border border-purple-500/40 text-purple-200 font-semibold cursor-pointer shrink-0 disabled:opacity-40"
                  >
                    {verifyingToken ? 'Testing...' : 'Test Token'}
                  </button>
                </div>

                {tokenVerifiedUser && (
                  <div className="flex items-center gap-1.5 text-[11px] text-emerald-400 font-mono pt-0.5">
                    <ShieldCheck className="w-3.5 h-3.5 shrink-0" />
                    <span>Authenticated as @{tokenVerifiedUser}</span>
                  </div>
                )}
                {tokenVerifiedUser === false && (
                  <div className="flex items-center gap-1.5 text-[11px] text-rose-400 font-mono pt-0.5">
                    <AlertTriangle className="w-3.5 h-3.5 shrink-0" />
                    <span>Invalid token. Please check scopes (repo or Contents: Read &amp; Write).</span>
                  </div>
                )}
              </div>

              <div>
                <label className="block text-gray-400 mb-1 font-mono">Commit Message</label>
                <input
                  type="text"
                  value={gitCommitMsg}
                  onChange={(e) => setGitCommitMsg(e.target.value)}
                  className="w-full px-3 py-2.5 rounded-xl bg-black/60 border border-white/10 text-white font-mono focus:outline-none focus:border-purple-500 text-xs"
                  placeholder="Commit message"
                />
              </div>
            </div>

            {gitError && (
              <div className="p-3.5 rounded-xl bg-red-950/40 border border-red-500/40 text-rose-300 text-xs font-mono space-y-1">
                <div className="font-bold flex items-center gap-1.5 text-red-400">
                  <AlertTriangle className="w-4 h-4 shrink-0" />
                  <span>Push Failed</span>
                </div>
                <p className="opacity-90">{gitError}</p>
              </div>
            )}

            {gitResult && (
              <div className="p-4 rounded-xl bg-emerald-950/40 border border-emerald-500/40 text-emerald-300 text-xs font-mono space-y-2.5">
                <div className="flex items-center gap-2 font-bold text-emerald-400 text-sm">
                  <Check className="w-4 h-4 shrink-0" />
                  <span>Successfully committed to GitHub!</span>
                </div>
                <div className="flex flex-wrap items-center gap-2 pt-1">
                  {gitResult.commit?.html_url && (
                    <a
                      href={gitResult.commit.html_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-emerald-500/20 hover:bg-emerald-500/30 text-emerald-200 border border-emerald-500/40 font-semibold"
                    >
                      <span>View Commit ↗</span>
                      <ExternalLink className="w-3 h-3" />
                    </a>
                  )}
                  {gitResult.prUrl && (
                    <a
                      href={gitResult.prUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-indigo-600 hover:bg-indigo-500 text-white font-bold"
                    >
                      <GitPullRequest className="w-3.5 h-3.5" />
                      <span>Open Pull Request ↗</span>
                    </a>
                  )}
                </div>
              </div>
            )}

            <div className="flex items-center justify-end gap-3 pt-3 border-t border-white/10">
              <button
                onClick={() => setIsGitModalOpen(false)}
                className="px-4 py-2.5 rounded-xl bg-white/5 hover:bg-white/10 text-gray-300 text-xs font-semibold cursor-pointer"
              >
                Close
              </button>
              <button
                onClick={handleExecutePush}
                disabled={gitPushing}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl bg-purple-600 hover:bg-purple-500 disabled:opacity-50 text-white text-xs font-bold cursor-pointer transition-all shadow-lg"
              >
                {gitPushing ? (
                  <>
                    <span className="w-3.5 h-3.5 rounded-full border-2 border-white border-t-transparent animate-spin" />
                    <span>Committing to GitHub...</span>
                  </>
                ) : (
                  <>
                    <UploadCloud className="w-4 h-4" />
                    <span>Push to GitHub</span>
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

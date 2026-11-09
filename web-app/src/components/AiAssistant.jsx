import React, { useCallback, useEffect, useRef, useState } from "react";
import { useLocation } from "react-router-dom";
import { Sparkles, X, Settings, Send, Square, Undo2, Check, KeyRound, TriangleAlert } from "lucide-react";
import { hasAssistant, requestEdit, previewEdits } from "../lib/aiAssistant";
import { getOriginalPageSource, getCustomPageCode, saveCustomPageCode, clearCustomPageCode } from "../lib/pageSources";

/* Floating "change this page" assistant. Rendered only inside the macOS app (it needs the
   Electron bridge); on the web build it renders nothing. */

const IDEAS = [
  "Explain the definitions in simpler words",
  "Add a diagram that shows how this works",
  "Add a real-world analogy",
  "Make this page shorter and clearer",
];

function SetupView({ status, onDone }) {
  const [key, setKey] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");

  const save = async () => {
    setBusy(true);
    setError("");
    const res = await window.electronAPI.aiSetKey(key);
    setBusy(false);
    if (!res.ok) return setError(res.error);
    setKey("");
    onDone();
  };

  return (
    <div className="p-4 space-y-3 text-xs text-gray-300 leading-relaxed">
      <div className="flex items-center gap-2 text-sm font-semibold text-white">
        <KeyRound className="w-4 h-4 text-indigo-300" /> Connect Gemini
      </div>
      <ol className="list-decimal pl-4 space-y-1.5">
        <li>
          Open <a href="https://aistudio.google.com/apikey" target="_blank" rel="noreferrer" className="text-blue-400 underline">aistudio.google.com/apikey</a> and create a key. Use a project <strong className="text-white">without billing</strong>: the free tier never charges you, it only slows down when you hit its limit.
        </li>
        <li>Paste it below. It is checked with Google, then stored encrypted in your Mac's Keychain. The web page never sees it.</li>
      </ol>
      <input
        type="password"
        value={key}
        onChange={(e) => setKey(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && key && !busy && save()}
        placeholder="AIza…"
        autoComplete="off"
        spellCheck={false}
        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white font-mono text-xs focus:outline-none focus:border-indigo-400"
      />
      {error && <p className="text-rose-300 m-0">{error}</p>}
      {status && !status.secure && (
        <p className="text-amber-300 m-0">The Keychain is unavailable, so the key will only be remembered until you quit the app.</p>
      )}
      <button
        onClick={save}
        disabled={!key || busy}
        className="px-3 py-2 min-h-9 rounded-lg bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white font-semibold cursor-pointer"
      >
        {busy ? "Checking key…" : "Save and check key"}
      </button>
    </div>
  );
}

function SettingsView({ onDisconnect, onClose }) {
  const [models, setModels] = useState([]);
  const [model, setModel] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    window.electronAPI.aiListModels().then((res) => {
      if (!res.ok) return setError(res.error);
      setModels(res.models);
      setModel(res.model || "");
    });
  }, []);

  const pick = async (m) => {
    setModel(m);
    await window.electronAPI.aiSetModel(m);
  };

  return (
    <div className="p-4 space-y-3 text-xs text-gray-300 leading-relaxed">
      <div className="text-sm font-semibold text-white">Model</div>
      {error && <p className="text-rose-300 m-0">{error}</p>}
      <select
        value={model}
        onChange={(e) => pick(e.target.value)}
        className="w-full px-3 py-2 rounded-lg bg-black/60 border border-white/15 text-white font-mono text-xs"
      >
        {models.map((m) => (
          <option key={m} value={m}>{m}</option>
        ))}
      </select>
      <p className="m-0 text-gray-500">
        The list comes from what your key can use right now. If you hit "rate limit" often, choose a <span className="font-mono">flash-lite</span> model: it has the most generous free allowance.
      </p>
      <div className="flex gap-2 pt-1">
        <button onClick={onClose} className="px-3 py-2 min-h-9 rounded-lg bg-white/10 hover:bg-white/15 text-white cursor-pointer">Done</button>
        <button
          onClick={async () => {
            if (window.confirm("Remove the saved Gemini API key from this Mac?")) {
              await window.electronAPI.aiClearKey();
              onDisconnect();
            }
          }}
          className="px-3 py-2 min-h-9 rounded-lg bg-rose-500/15 hover:bg-rose-500/25 text-rose-200 cursor-pointer"
        >
          Remove key
        </button>
      </div>
    </div>
  );
}

function DiffPreview({ edits }) {
  const parts = previewEdits(edits);
  const clip = (lines) => (lines.length > 10 ? [...lines.slice(0, 10), `… ${lines.length - 10} more lines`] : lines);
  return (
    <div className="space-y-2 max-h-56 overflow-y-auto pr-1">
      {parts.map((p, i) => (
        <div key={i} className="rounded-lg border border-white/10 bg-black/50 font-mono text-[0.6875rem] leading-snug overflow-x-auto">
          {clip(p.removed).map((l, k) => (
            <div key={`r${k}`} className="px-2 bg-rose-500/10 text-rose-300 whitespace-pre">- {l}</div>
          ))}
          {clip(p.added).map((l, k) => (
            <div key={`a${k}`} className="px-2 bg-emerald-500/10 text-emerald-300 whitespace-pre">+ {l}</div>
          ))}
        </div>
      ))}
    </div>
  );
}

export default function AiAssistant() {
  const { pathname } = useLocation();
  const available = hasAssistant();

  const [open, setOpen] = useState(false);
  const [canEdit, setCanEdit] = useState(false);
  const [status, setStatus] = useState(null); // { hasKey, model, secure }
  const [view, setView] = useState("chat"); // chat | settings
  const [prompt, setPrompt] = useState("");
  const [selection, setSelection] = useState("");
  const [phase, setPhase] = useState("idle"); // idle | working | review | applied
  const [progress, setProgress] = useState("");
  const [result, setResult] = useState(null);
  const [message, setMessage] = useState(null); // { tone, text }
  const undoStack = useRef({}); // pathname -> [previous override or null]
  const ctl = useRef({ cancelled: false, id: null });
  const inputRef = useRef(null);

  // Does this route have page source to edit?
  useEffect(() => {
    if (!available) return undefined;
    let live = true;
    getOriginalPageSource(pathname).then((src) => live && setCanEdit(Boolean(src)));
    return () => {
      live = false;
    };
  }, [pathname, available]);

  const refreshStatus = useCallback(() => window.electronAPI.aiStatus().then((s) => setStatus(s.ok ? s : null)), []);
  useEffect(() => {
    if (available && open) refreshStatus();
  }, [available, open, refreshStatus]);

  // New page: drop any half-finished proposal.
  useEffect(() => {
    setPhase("idle");
    setResult(null);
    setMessage(null);
  }, [pathname]);

  useEffect(() => {
    if (open && view === "chat") inputRef.current?.focus();
  }, [open, view, phase]);

  useEffect(() => {
    if (!open) return undefined;
    const onKey = (e) => e.key === "Escape" && phase !== "working" && setOpen(false);
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, phase]);

  if (!available || !canEdit) return null;

  const openPanel = () => {
    setSelection((window.getSelection()?.toString() || "").trim().slice(0, 1500));
    setOpen(true);
  };

  const send = async (text) => {
    const request = (text ?? prompt).trim();
    if (!request || phase === "working") return;
    setMessage(null);
    setResult(null);
    setPhase("working");
    setProgress("Preparing…");
    ctl.current = { cancelled: false, id: null };

    const source = getCustomPageCode(pathname) || (await getOriginalPageSource(pathname));
    const title = document.querySelector("h1")?.textContent?.trim();
    const res = await requestEdit({ request, source, selection, title, pathname }, setProgress, ctl.current);

    if (res.cancelled) {
      setPhase("idle");
      setMessage({ tone: "gray", text: "Stopped. Nothing was changed." });
    } else if (res.cannot) {
      setPhase("idle");
      setMessage({ tone: "amber", text: res.cannot });
    } else if (!res.ok) {
      setPhase("idle");
      setMessage({ tone: "rose", text: res.error });
    } else {
      setResult({ ...res, request });
      setPhase("review");
    }
  };

  const stop = () => {
    ctl.current.cancelled = true;
    if (ctl.current.id) window.electronAPI.aiAbort(ctl.current.id);
  };

  const apply = () => {
    const stack = (undoStack.current[pathname] ||= []);
    stack.push(getCustomPageCode(pathname));
    saveCustomPageCode(pathname, result.code);
    setPhase("applied");
    setPrompt("");
  };

  const undo = () => {
    const stack = undoStack.current[pathname] || [];
    if (!stack.length) return;
    const prev = stack.pop();
    if (prev) saveCustomPageCode(pathname, prev);
    else clearCustomPageCode(pathname);
    setPhase("idle");
    setResult(null);
    setMessage({ tone: "gray", text: stack.length ? "Undone. Press Undo again to step back further." : "Undone. The page is back to how it was." });
  };

  const canUndo = (undoStack.current[pathname] || []).length > 0;
  const needsKey = status && !status.hasKey;

  return (
    <>
      {!open && (
        <button
          onClick={openPanel}
          onMouseDown={(e) => e.preventDefault() /* keep the user's text selection */}
          aria-label="Open AI assistant"
          title="Ask AI to change this page"
          className="fixed bottom-5 right-5 z-40 w-12 h-12 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 text-white shadow-lg shadow-indigo-950/60 flex items-center justify-center hover:scale-105 transition-transform cursor-pointer"
        >
          <Sparkles className="w-5 h-5" />
        </button>
      )}

      {open && (
        <div
          role="dialog"
          aria-label="AI assistant"
          className="fixed bottom-5 right-5 z-40 w-[min(26rem,calc(100vw-2.5rem))] max-h-[min(40rem,calc(100vh-2.5rem))] flex flex-col rounded-2xl border border-white/15 bg-[#12121a] shadow-2xl overflow-hidden"
        >
          <div className="flex items-center justify-between gap-2 px-4 py-3 border-b border-white/10 bg-white/[0.03]">
            <div className="flex items-center gap-2 text-sm font-semibold text-white">
              <Sparkles className="w-4 h-4 text-indigo-300" /> Change this page
            </div>
            <div className="flex items-center gap-1">
              {status?.hasKey && (
                <button
                  onClick={() => setView(view === "settings" ? "chat" : "settings")}
                  aria-label="Assistant settings"
                  className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
                >
                  <Settings className="w-4 h-4" />
                </button>
              )}
              <button
                onClick={() => (phase === "working" ? null : setOpen(false))}
                aria-label="Close assistant"
                className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-white/10 cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>
            </div>
          </div>

          <div className="overflow-y-auto">
            {!status ? (
              <p className="p-4 text-xs text-gray-400 m-0">Loading…</p>
            ) : needsKey ? (
              <SetupView status={status} onDone={refreshStatus} />
            ) : view === "settings" ? (
              <SettingsView
                onClose={() => {
                  setView("chat");
                  refreshStatus();
                }}
                onDisconnect={() => {
                  setView("chat");
                  refreshStatus();
                }}
              />
            ) : (
              <div className="p-4 space-y-3">
                {phase === "idle" && (
                  <>
                    <p className="text-xs text-gray-400 leading-relaxed m-0">
                      Tell Gemini what you did not like: a definition, a topic, a diagram. It edits only that part, and you approve before anything changes.
                    </p>
                    {selection && (
                      <div className="text-xs rounded-lg border border-indigo-500/30 bg-indigo-500/10 p-2.5 text-indigo-100">
                        <div className="flex items-start justify-between gap-2">
                          <span className="font-semibold">Focus on your selected text</span>
                          <button onClick={() => setSelection("")} className="text-indigo-300 hover:text-white cursor-pointer" aria-label="Clear selected text">
                            <X className="w-3.5 h-3.5" />
                          </button>
                        </div>
                        <div className="mt-1 text-indigo-200/80 line-clamp-3">{selection}</div>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-1.5">
                      {IDEAS.map((i) => (
                        <button
                          key={i}
                          onClick={() => setPrompt(i)}
                          className="px-2.5 py-1.5 min-h-8 rounded-lg border border-white/10 bg-white/5 hover:bg-white/10 text-[0.6875rem] text-gray-300 text-left cursor-pointer"
                        >
                          {i}
                        </button>
                      ))}
                    </div>
                  </>
                )}

                {message && (
                  <p
                    className={`text-xs leading-relaxed m-0 rounded-lg border p-2.5 ${
                      message.tone === "rose" ? "border-rose-500/30 bg-rose-500/10 text-rose-200" : message.tone === "amber" ? "border-amber-500/30 bg-amber-500/10 text-amber-200" : "border-white/10 bg-white/5 text-gray-300"
                    }`}
                  >
                    {message.text}
                  </p>
                )}

                {phase === "working" && (
                  <div className="rounded-lg border border-white/10 bg-black/40 p-3 text-xs text-gray-300 flex items-center justify-between gap-3">
                    <span className="flex items-center gap-2">
                      <span className="w-3.5 h-3.5 rounded-full border-2 border-indigo-400 border-t-transparent animate-spin motion-reduce:animate-none" />
                      {progress}
                    </span>
                    <button onClick={stop} className="flex items-center gap-1 px-2.5 py-1.5 min-h-8 rounded-lg bg-rose-500/20 hover:bg-rose-500/30 text-rose-100 cursor-pointer">
                      <Square className="w-3 h-3 fill-current" /> Stop
                    </button>
                  </div>
                )}

                {phase === "review" && result && (
                  <div className="space-y-3">
                    <div className="text-xs text-gray-300">
                      <span className="font-semibold text-white">
                        {result.edits.length ? `${result.edits.length} change${result.edits.length === 1 ? "" : "s"} proposed` : "Whole page rewritten"}
                      </span>{" "}
                      <span className="text-gray-500">({result.model})</span>
                    </div>
                    {result.edits.length > 0 ? <DiffPreview edits={result.edits} /> : <p className="text-xs text-amber-200 m-0">The model returned the whole page instead of small edits. Review it carefully after applying; you can undo.</p>}
                    {result.unresolved.length > 0 && (
                      <p className="flex gap-2 text-xs text-amber-200 m-0">
                        <TriangleAlert className="w-4 h-4 shrink-0" />
                        This page uses files the editor cannot load ({result.unresolved.join(", ")}), so parts of it may appear blank after applying. You can undo.
                      </p>
                    )}
                    <div className="flex gap-2">
                      <button onClick={apply} className="flex items-center gap-1.5 px-3 py-2 min-h-9 rounded-lg bg-emerald-600 hover:bg-emerald-500 text-white font-semibold cursor-pointer">
                        <Check className="w-4 h-4" /> Apply to this page
                      </button>
                      <button
                        onClick={() => {
                          setPhase("idle");
                          setResult(null);
                        }}
                        className="px-3 py-2 min-h-9 rounded-lg bg-white/10 hover:bg-white/15 text-gray-200 cursor-pointer"
                      >
                        Discard
                      </button>
                    </div>
                  </div>
                )}

                {phase === "applied" && (
                  <div className="rounded-lg border border-emerald-500/30 bg-emerald-500/10 p-3 text-xs text-emerald-100 space-y-2">
                    <div className="flex items-center gap-1.5 font-semibold"><Check className="w-4 h-4" /> Applied. The page has been updated.</div>
                    <p className="m-0 text-emerald-200/80">It is saved on this Mac only. "Revert to Default" at the top of the page restores the original at any time.</p>
                    <div className="flex gap-2">
                      <button onClick={undo} className="flex items-center gap-1.5 px-3 py-1.5 min-h-8 rounded-lg bg-white/10 hover:bg-white/15 text-white cursor-pointer"><Undo2 className="w-3.5 h-3.5" /> Undo</button>
                      <button onClick={() => setPhase("idle")} className="px-3 py-1.5 min-h-8 rounded-lg bg-white/10 hover:bg-white/15 text-white cursor-pointer">Ask for another change</button>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>

          {status?.hasKey && view === "chat" && (phase === "idle" || phase === "review") && (
            <form
              onSubmit={(e) => {
                e.preventDefault();
                send();
              }}
              className="p-3 border-t border-white/10 bg-white/[0.02] flex items-end gap-2"
            >
              <textarea
                ref={inputRef}
                value={prompt}
                onChange={(e) => setPrompt(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter" && !e.shiftKey) {
                    e.preventDefault();
                    send();
                  }
                }}
                rows={2}
                placeholder="e.g. the definition of overfitting is confusing, explain it with an example"
                className="flex-1 resize-none px-3 py-2 rounded-xl bg-black/60 border border-white/15 text-white text-xs placeholder:text-gray-500 focus:outline-none focus:border-indigo-400"
              />
              <button
                type="submit"
                disabled={!prompt.trim()}
                aria-label="Send request"
                className="p-2.5 min-h-10 min-w-10 rounded-xl bg-indigo-600 hover:bg-indigo-500 disabled:opacity-40 text-white cursor-pointer flex items-center justify-center"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          )}
          {canUndo && phase !== "applied" && phase !== "working" && status?.hasKey && view === "chat" && (
            <button onClick={undo} className="mx-3 mb-3 flex items-center gap-1.5 text-[0.6875rem] text-gray-400 hover:text-white cursor-pointer w-fit">
              <Undo2 className="w-3 h-3" /> Undo last change on this page
            </button>
          )}
        </div>
      )}
    </>
  );
}

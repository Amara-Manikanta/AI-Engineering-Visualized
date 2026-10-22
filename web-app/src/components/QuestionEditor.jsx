import { useRef, useState } from "react";
import { parseQuestions } from "../lib/questionFormat";

/**
 * QuestionEditor — add questions from the UI, import a .txt from disk, and
 * export what you have added.
 *
 * Everything here is stored as the SAME plain-text format the questions/
 * folder uses, so exporting produces a file you can drop straight into that
 * folder to make it permanent. Nothing leaves this device: questions added
 * here live in this browser until exported.
 */
const EMPTY = { topic: "", q: "", kind: "mcq", options: ["", "", "", ""], correct: 0, why: "", answer: "" };

export default function QuestionEditor({ text, onChange, topicNames = [] }) {
  const [tab, setTab] = useState("add");
  const [form, setForm] = useState(EMPTY);
  const [msg, setMsg] = useState(null);
  const [paste, setPaste] = useState("");
  const fileRef = useRef(null);

  const set = (k, v) => setForm((f) => ({ ...f, [k]: v }));
  const flash = (kind, t) => {
    setMsg({ kind, t });
    setTimeout(() => setMsg(null), 4000);
  };

  const append = (block) => onChange((text.trim() ? text.trimEnd() + "\n\n" : "") + block.trim() + "\n");

  const add = () => {
    const topic = form.topic.trim() || "My Questions";
    const qText = form.q.trim();
    if (!qText) return flash("err", "Write the question first.");
    let block;
    if (form.kind === "mcq") {
      const opts = form.options.map((o) => o.trim());
      if (opts.filter(Boolean).length < 2) return flash("err", "Add at least two options.");
      if (!opts[form.correct]) return flash("err", "The option marked correct is empty.");
      block =
        `# ${topic}\n\nQ: ${qText}\n` +
        opts.map((o, i) => (o ? `${i === form.correct ? "*" : "-"} ${o}` : null)).filter(Boolean).join("\n") +
        (form.why.trim() ? `\nWHY: ${form.why.trim()}` : "");
    } else {
      if (!form.answer.trim()) return flash("err", "Write the model answer.");
      block = `# ${topic}\n\nQ: ${qText}\nANSWER: ${form.answer.trim()}`;
    }
    append(block);
    setForm({ ...EMPTY, topic, kind: form.kind });
    flash("ok", `Added to "${topic}".`);
  };

  const importText = (raw, name) => {
    const { topics, errors } = parseQuestions(raw, name);
    const n = topics.reduce((a, t) => a + t.questions.length, 0);
    if (!n) return flash("err", `No valid questions found in ${name}.${errors[0] ? ` Line ${errors[0].line}: ${errors[0].message}` : ""}`);
    append(raw);
    flash(errors.length ? "warn" : "ok", `Imported ${n} question${n === 1 ? "" : "s"}${errors.length ? ` — ${errors.length} line(s) skipped, see below` : ""}.`);
  };

  const onFile = async (e) => {
    const f = e.target.files?.[0];
    if (!f) return;
    importText(await f.text(), f.name);
    e.target.value = "";
  };

  const download = () => {
    const blob = new Blob([text], { type: "text/plain" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "my-questions.txt";
    a.click();
    URL.revokeObjectURL(a.href);
  };

  const copy = async () => {
    try {
      await navigator.clipboard.writeText(text);
      flash("ok", "Copied — paste it into a .txt file in the questions/ folder.");
    } catch {
      flash("err", "Clipboard blocked here — use Download instead.");
    }
  };

  const input = "w-full bg-black/50 border border-white/15 rounded-lg px-3 py-2.5 text-sm text-gray-100 focus:border-indigo-500/60 outline-none";
  const tabBtn = (k, label) => (
    <button
      key={k}
      onClick={() => setTab(k)}
      className={`px-4 py-2 rounded-lg text-sm font-semibold border transition-colors ${
        tab === k ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-200" : "border-white/10 bg-white/5 text-gray-400 hover:text-white"
      }`}
    >
      {label}
    </button>
  );

  return (
    <div className="rounded-2xl border border-indigo-500/25 bg-indigo-500/[0.07] p-6">
      <div className="flex flex-wrap gap-2 mb-5">
        {tabBtn("add", "Add a question")}
        {tabBtn("import", "Import .txt")}
        {tabBtn("export", "Export / edit")}
      </div>

      {tab === "add" && (
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="text-xs uppercase tracking-wide text-gray-500">Topic</span>
              <input list="qe-topics" value={form.topic} onChange={(e) => set("topic", e.target.value)} placeholder="e.g. Transformers" className={`${input} mt-1.5`} />
              <datalist id="qe-topics">{topicNames.map((t) => <option key={t} value={t} />)}</datalist>
            </label>
            <div>
              <span className="text-xs uppercase tracking-wide text-gray-500">Type</span>
              <div className="flex gap-2 mt-1.5">
                {[["mcq", "Multiple choice"], ["open", "Interview (open)"]].map(([k, l]) => (
                  <button key={k} onClick={() => set("kind", k)}
                    className={`flex-1 px-3 py-2.5 rounded-lg text-sm border transition-colors ${form.kind === k ? "border-indigo-500/50 bg-indigo-500/20 text-indigo-200" : "border-white/10 bg-white/5 text-gray-400"}`}>
                    {l}
                  </button>
                ))}
              </div>
            </div>
          </div>

          <label className="block">
            <span className="text-xs uppercase tracking-wide text-gray-500">Question</span>
            <textarea rows={2} value={form.q} onChange={(e) => set("q", e.target.value)} className={`${input} mt-1.5`} />
          </label>

          {form.kind === "mcq" ? (
            <>
              <div>
                <span className="text-xs uppercase tracking-wide text-gray-500">Options — tap the circle to mark the correct one</span>
                <div className="space-y-2 mt-1.5">
                  {form.options.map((o, i) => (
                    <div key={i} className="flex items-center gap-2">
                      <button onClick={() => set("correct", i)} aria-label={`Mark option ${i + 1} correct`}
                        className={`shrink-0 w-8 h-8 rounded-full border-2 flex items-center justify-center text-sm ${form.correct === i ? "border-emerald-400 bg-emerald-500/25 text-emerald-200" : "border-white/20 text-transparent"}`}>
                        ✓
                      </button>
                      <input value={o} onChange={(e) => set("options", form.options.map((x, j) => (j === i ? e.target.value : x)))}
                        placeholder={`Option ${String.fromCharCode(65 + i)}${i >= 2 ? " (optional)" : ""}`} className={input} />
                    </div>
                  ))}
                </div>
              </div>
              <label className="block">
                <span className="text-xs uppercase tracking-wide text-gray-500">Why (optional)</span>
                <textarea rows={2} value={form.why} onChange={(e) => set("why", e.target.value)} className={`${input} mt-1.5`} />
              </label>
            </>
          ) : (
            <label className="block">
              <span className="text-xs uppercase tracking-wide text-gray-500">Model answer</span>
              <textarea rows={4} value={form.answer} onChange={(e) => set("answer", e.target.value)} className={`${input} mt-1.5`} />
            </label>
          )}

          <button onClick={add} className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-emerald-500/50 bg-emerald-500/20 text-emerald-100 hover:bg-emerald-500/30 transition-colors">
            + Add question
          </button>
        </div>
      )}

      {tab === "import" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            Pick a <span className="font-mono text-gray-300">.txt</span> file written in the question format, or paste
            the text below. It is read on this device — nothing is uploaded.
          </p>
          <input ref={fileRef} type="file" accept=".txt,text/plain" onChange={onFile} className="hidden" />
          <button onClick={() => fileRef.current?.click()} className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-indigo-500/50 bg-indigo-500/20 text-indigo-100 hover:bg-indigo-500/30">
            Choose a .txt file…
          </button>
          <textarea rows={8} value={paste} onChange={(e) => setPaste(e.target.value)}
            placeholder={"# My Topic\n\nQ: Your question?\n- wrong\n* right\nWHY: because…"} className={`${input} font-mono text-xs`} />
          <button onClick={() => { if (paste.trim()) { importText(paste, "pasted text"); setPaste(""); } }}
            className="px-5 py-2.5 rounded-lg text-sm font-semibold border border-white/15 bg-white/5 text-gray-200 hover:text-white">
            Import pasted text
          </button>
        </div>
      )}

      {tab === "export" && (
        <div className="space-y-4">
          <p className="text-sm text-gray-400 leading-relaxed m-0">
            Everything you have added, in the file format. Edit it directly here, or download it and drop it into the{" "}
            <span className="font-mono text-gray-300">questions/</span> folder of the project to make it permanent for
            everyone.
          </p>
          <textarea rows={12} value={text} onChange={(e) => onChange(e.target.value)} className={`${input} font-mono text-xs`}
            placeholder="Nothing added yet." />
          <div className="flex flex-wrap gap-2">
            <button onClick={download} disabled={!text.trim()} className="px-4 py-2 rounded-lg text-sm font-semibold border border-indigo-500/50 bg-indigo-500/20 text-indigo-100 disabled:opacity-30">Download .txt</button>
            <button onClick={copy} disabled={!text.trim()} className="px-4 py-2 rounded-lg text-sm font-semibold border border-white/15 bg-white/5 text-gray-200 disabled:opacity-30">Copy</button>
            <button onClick={() => { if (confirm("Delete every question you added on this device?")) onChange(""); }} disabled={!text.trim()}
              className="px-4 py-2 rounded-lg text-sm font-semibold border border-rose-500/40 bg-rose-500/10 text-rose-200 disabled:opacity-30 ml-auto">Clear all</button>
          </div>
        </div>
      )}

      {msg && (
        <div className={`mt-4 p-3 rounded-lg text-sm border ${
          msg.kind === "ok" ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
          : msg.kind === "warn" ? "border-amber-500/40 bg-amber-500/10 text-amber-200"
          : "border-rose-500/40 bg-rose-500/10 text-rose-200"}`}>
          {msg.t}
        </div>
      )}
    </div>
  );
}

/* ---------------------------------------------------------------------------
   Engine behind the floating AI assistant (macOS app).

   The model is asked for small SEARCH/REPLACE edits rather than a whole new
   page: pages run to a thousand lines, and rewriting one in full is slow, eats
   the free-tier quota and tends to drop things. Each edit is applied to the
   page source, the result is compiled, and any failure is fed back to the model
   for one correction round before the user sees anything.
--------------------------------------------------------------------------- */

import { compileAndEvaluate } from './jsxRuntime';

export const hasAssistant = () => typeof window !== 'undefined' && Boolean(window.electronAPI?.aiGenerate);

const SYSTEM = `You edit ONE React page (JSX) of a dark-themed interactive learning site, following the user's request.

OUTPUT FORMAT, strictly. Reply with one or more edit blocks and nothing else:

<<<<<<< SEARCH
exact existing lines from the page
=======
the replacement lines
>>>>>>> REPLACE

Rules for edit blocks:
- SEARCH text must be copied character for character from the page, including indentation, and must match exactly ONE place. Include enough surrounding lines to be unique, but keep it short.
- To INSERT something, SEARCH for a nearby anchor line and repeat that line in REPLACE together with the new content.
- To DELETE, leave REPLACE empty.
- Make the smallest change that fully satisfies the request. Never rewrite parts you were not asked to change. Never output the whole file.
- No explanations, no markdown fences, no text outside the blocks. If the request cannot be done, reply with exactly one line starting "CANNOT:" and the reason.

Code rules:
- Keep every existing import. You may add imports only from: "react", "framer-motion", "lucide-react", "../components/VizKit", "../lib/stats", and files the page already imports.
- Styling is Tailwind CSS on a dark background (text-gray-300, border-white/10, bg-white/5, rounded-xl). Use full class strings, never built dynamically.
- VizKit exports: Panel({tone,title,actions,children}), Card({title,tone,children}), Note({tone,children}), Section({id,title,lead,children}), Metric({label,value,sub,tone}), Slider({label,value,min,max,step,onChange,format,tone}), Segmented({options:[{v,label}],value,onChange,tone}), Button({tone,onClick,children}), Scatter, Histogram, BoxPlot. Tones: indigo blue emerald amber rose purple teal.
- For a DIAGRAM, write inline SVG with a viewBox and width="100%" style classes (className="w-full h-auto"), readable on a dark background (stroke="#818cf8", fill="rgba(255,255,255,0.05)", text fill="#d1d5db"), with role="img" and an aria-label. Keep text at fontSize 11 or larger.
- Explanations must be accurate. Do not invent numbers, benchmarks or API names. Write plainly for a learner.
- Valid JSX only: balanced tags, escaped braces in text, unique keys in lists. Do not use TypeScript.`;

/* ---- prompt --------------------------------------------------------------- */

export function buildUserMessage({ request, source, selection, title, pathname }) {
  return [
    `Page: "${title || pathname}" (route ${pathname})`,
    selection ? `The user has this text selected on the page. Treat it as the focus of the request:\n"""\n${selection}\n"""` : '',
    `Request: ${request}`,
    `Current page source:\n\`\`\`jsx\n${source}\n\`\`\``,
  ]
    .filter(Boolean)
    .join('\n\n');
}

/* ---- parsing -------------------------------------------------------------- */

const BLOCK = /<{5,9} SEARCH[^\n]*\r?\n([\s\S]*?)\r?\n={5,9}[^\n]*\r?\n([\s\S]*?)\r?\n?>{5,9} REPLACE/g;

export function parseReply(text) {
  const t = String(text || '').trim();
  const cannot = t.match(/^CANNOT:\s*(.+)$/m);
  if (cannot && !t.includes('SEARCH')) return { cannot: cannot[1].trim(), edits: [] };

  const edits = [];
  for (const m of t.matchAll(BLOCK)) edits.push({ search: m[1], replace: m[2] });
  if (edits.length) return { edits };

  // Some models ignore the format and return the whole file in a fence.
  const fenced = t.match(/```(?:jsx|javascript|tsx|js)?\r?\n([\s\S]*?)```/);
  if (fenced && /export default/.test(fenced[1])) return { full: fenced[1].trim(), edits: [] };
  return { edits: [], malformed: true };
}

/* ---- applying ------------------------------------------------------------- */

const countOf = (hay, needle) => (needle ? hay.split(needle).length - 1 : 0);

// Models often get indentation slightly wrong. Fall back to matching line by line, ignoring
// leading and trailing whitespace, and accept it only if that finds exactly one place.
function fuzzyIndex(source, search) {
  const src = source.split('\n');
  const want = search.split('\n').map((l) => l.trim());
  while (want.length && want[0] === '') want.shift();
  while (want.length && want[want.length - 1] === '') want.pop();
  if (!want.length) return null;
  const hits = [];
  for (let i = 0; i + want.length <= src.length; i++) {
    if (want.every((w, k) => src[i + k].trim() === w)) hits.push(i);
  }
  return hits.length === 1 ? { start: hits[0], length: want.length } : hits.length > 1 ? 'ambiguous' : null;
}

export function applyEdits(source, edits) {
  let out = source;
  const failures = [];
  const applied = [];

  edits.forEach((e, n) => {
    if (!e.search.trim()) {
      failures.push({ n: n + 1, why: 'the SEARCH part was empty' });
      return;
    }
    const exact = countOf(out, e.search);
    if (exact === 1) {
      const at = out.indexOf(e.search);
      out = out.slice(0, at) + e.replace + out.slice(at + e.search.length);
      applied.push(e);
      return;
    }
    if (exact > 1) {
      failures.push({ n: n + 1, why: 'the SEARCH text matches more than one place; include more surrounding lines' });
      return;
    }
    const f = fuzzyIndex(out, e.search);
    if (f && f !== 'ambiguous') {
      const lines = out.split('\n');
      lines.splice(f.start, f.length, ...e.replace.split('\n'));
      out = lines.join('\n');
      applied.push(e);
    } else {
      failures.push({ n: n + 1, why: f === 'ambiguous' ? 'the SEARCH text matches more than one place' : 'the SEARCH text was not found in the page (it must be copied exactly)' });
    }
  });

  return { code: out, failures, applied };
}

/* ---- one full request ----------------------------------------------------- */

let counter = 0;
const newId = () => `ai-${Date.now()}-${++counter}`;

/**
 * Ask Gemini for the edit, apply it, compile it, and retry once with the error if it fails.
 * Resolves to { ok, code?, edits?, notes[], error?, cancelled?, cannot?, unresolved? }.
 * `onStatus(text)` is called with progress messages; `ctl.abort()` stops the run.
 */
export async function requestEdit({ request, source, selection, title, pathname }, onStatus, ctl) {
  const api = window.electronAPI;
  const messages = [{ role: 'user', text: buildUserMessage({ request, source, selection, title, pathname }) }];
  const notes = [];

  for (let attempt = 1; attempt <= 2; attempt++) {
    if (ctl.cancelled) return { ok: false, cancelled: true, notes };
    const id = newId();
    ctl.id = id;
    onStatus(attempt === 1 ? 'Asking Gemini…' : 'Fixing a problem with the first attempt…');
    const res = await api.aiGenerate({ id, system: SYSTEM, messages, temperature: 0.3 }, (chars) =>
      onStatus(`${attempt === 1 ? 'Gemini is writing' : 'Gemini is correcting'}… ${chars.toLocaleString()} characters`),
    );
    if (ctl.cancelled || res.aborted) return { ok: false, cancelled: true, notes };
    if (!res.ok) return { ok: false, error: res.error, notes };

    const parsed = parseReply(res.text);
    if (parsed.cannot) return { ok: false, cannot: parsed.cannot, notes };

    let code;
    let problem = null;
    let edits = parsed.edits;

    if (parsed.full) {
      code = parsed.full;
      edits = [];
    } else if (parsed.malformed) {
      problem = 'Your reply was not in the required SEARCH/REPLACE format. Reply again using only edit blocks.';
    } else {
      const applied = applyEdits(source, parsed.edits);
      if (applied.failures.length) {
        problem = `These edits could not be applied: ${applied.failures.map((f) => `edit ${f.n}: ${f.why}`).join('; ')}. Resend ALL the edits, copying SEARCH text exactly from the page source.`;
      } else {
        code = applied.code;
      }
    }

    if (!problem && res.truncated) problem = 'Your reply was cut off before it finished. Reply again with fewer, smaller edits.';

    if (!problem) {
      const compiled = compileAndEvaluate(code);
      if (compiled.error) problem = `The edited page failed to compile: ${compiled.error}. Resend ALL the edits with the mistake fixed.`;
      else if (code === source) problem = 'Those edits changed nothing. Make the requested change.';
      else return { ok: true, code, edits, notes, unresolved: compiled.unresolved || [], model: res.model };
    }

    notes.push(problem);
    if (attempt === 2) return { ok: false, error: `Gemini could not produce a valid edit. Last problem: ${problem}`, notes };
    messages.push({ role: 'model', text: res.text }, { role: 'user', text: problem });
  }
  return { ok: false, error: 'Unexpected end of retries.', notes };
}

/* ---- diff preview --------------------------------------------------------- */

// Lines removed / added, per edit, for the "what will change" preview.
export function previewEdits(edits) {
  return edits.map((e) => {
    const a = e.search.split('\n');
    const b = e.replace.split('\n');
    // drop the unchanged leading and trailing lines so only the real change shows
    let head = 0;
    while (head < a.length && head < b.length && a[head] === b[head]) head++;
    let tail = 0;
    while (tail < a.length - head && tail < b.length - head && a[a.length - 1 - tail] === b[b.length - 1 - tail]) tail++;
    return { removed: a.slice(head, a.length - tail), added: b.slice(head, b.length - tail) };
  });
}

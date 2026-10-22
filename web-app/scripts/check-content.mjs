/**
 * Content integrity checks, run in CI and with `npm run check`.
 *
 * Catches the mistakes a build cannot: a lazy import pointing at a missing
 * file, a link to a route that does not exist, a table-of-contents entry
 * whose section id is not on the page, and malformed quiz or glossary data.
 * Exits non-zero with one line per problem.
 */
import { readFileSync, existsSync, readdirSync, statSync } from "node:fs";
import { resolve, dirname, join, relative } from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";

const root = resolve(dirname(fileURLToPath(import.meta.url)), "..");
const src = (p) => resolve(root, "src", p);
const read = (p) => readFileSync(p, "utf8");
const problems = [];
const fail = (where, msg) => problems.push(`${where}: ${msg}`);

const walk = (d, acc = []) => {
  for (const f of readdirSync(d)) {
    const p = join(d, f);
    if (statSync(p).isDirectory()) walk(p, acc);
    else if (/\.(jsx?|mjs)$/.test(p)) acc.push(p);
  }
  return acc;
};

/* ---------------------------------------------------------------- routes */
const app = read(src("App.jsx"));
const imports = new Map();
for (const m of app.matchAll(/(?:const (\w+) = lazy\(\(\) => import\(|import (\w+) from )"(\.\/pages\/[^"]+)"/g)) {
  imports.set(m[1] ?? m[2], m[3]);
}
const routes = [...app.matchAll(/<Route path="([^"]+)" element={<(\w+)\s*\/>}/g)].map((m) => ({ path: m[1], comp: m[2] }));
const routePaths = new Set(routes.map((r) => r.path));
// Redirect routes generated in a loop: /llms/<type>-type
for (const t of ["llm", "vlm", "slm", "moe", "lcm", "lam"]) routePaths.add(`/llms/${t}-type`);

const pageFile = (rel) => src(rel.replace("./", "") + ".jsx");
for (const [comp, rel] of imports) {
  if (!existsSync(pageFile(rel))) fail("App.jsx", `${comp} imports missing file ${rel}.jsx`);
}
// Components defined in App.jsx itself (redirect helpers) are fine too.
const localComps = new Set([...app.matchAll(/^function (\w+)\(/gm)].map((m) => m[1]));
for (const r of routes) {
  if (!imports.has(r.comp) && !localComps.has(r.comp)) fail("App.jsx", `route ${r.path} renders ${r.comp}, which is not imported`);
}

const allFiles = walk(src("."));
const corpus = allFiles.map((f) => [f, read(f)]);

// Page files nobody imports are dead code.
for (const f of walk(src("pages"))) {
  const base = relative(src("."), f).replace(/\.jsx$/, "");
  const name = base.split("/").pop();
  const used = corpus.some(([g, s]) => g !== f && (s.includes(`"./${base}"`) || s.includes(`"./${name}"`)));
  if (!used) fail(relative(root, f), "page file is not imported anywhere");
}

/* ---------------------------------------------------------- internal links */
const okRoute = (p) => {
  const bare = p.split("#")[0].split("?")[0].replace(/(.)\/$/, "$1");
  return routePaths.has(bare);
};
const LINK_RE = /(?:\bto=|\bhref=|\bpath:|\bsee:|\bp:|\bnavigate\()\s*\{?\s*["'`](#?\/[a-z0-9][^"'`\s$]*)["'`]/gi;
for (const [f, s] of corpus) {
  if (f.endsWith("searchIndex.json")) continue;
  for (const m of s.matchAll(LINK_RE)) {
    const target = m[1].replace(/^#/, "");
    if (!okRoute(target)) fail(relative(root, f), `link to unknown route ${m[1]}`);
  }
}

/* --------------------------------------------------------- TOC → ids */
const escape = (s) => s.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
for (const r of routes) {
  const rel = imports.get(r.comp);
  if (!rel || !existsSync(pageFile(rel))) continue;
  const file = pageFile(rel);
  const text = read(file);
  // The page plus the local modules it imports (shared components render ids too).
  let scope = text;
  for (const m of text.matchAll(/from\s+["'](\.\.?\/[^"']+)["']/g)) {
    for (const ext of ["", ".jsx", ".js"]) {
      const p = resolve(dirname(file), m[1] + ext);
      if (existsSync(p) && statSync(p).isFile()) {
        scope += read(p);
        break;
      }
    }
  }
  const tocBlock = text.match(/(?:const toc\s*=|toc=\{)\s*\[([\s\S]*?)\]/)?.[1] ?? "";
  for (const m of tocBlock.matchAll(/hash:\s*["'`]#?([^"'`$]+)["'`]/g)) {
    const h = m[1];
    const re = new RegExp(`\\bid\\s*[=:]\\s*\\{?\\s*["'\`]${escape(h)}["'\`]`);
    if (!re.test(scope)) fail(relative(root, file), `TOC entry #${h} has no element with that id`);
  }
}

/* ------------------------------------------------------------- data files */
const load = async (p) => import(pathToFileURL(src(p)).href);
const { QUIZZES } = await load("data/quizBank.js");
const ids = new Set();
for (const quiz of QUIZZES) {
  const where = `quizBank ${quiz.id}`;
  if (ids.has(quiz.id)) fail(where, "duplicate quiz id");
  ids.add(quiz.id);
  if (quiz.path && !okRoute(quiz.path)) fail(where, `path ${quiz.path} is not a route`);
  quiz.questions.forEach((q, i) => {
    if (!q.q) fail(where, `question ${i + 1} has no text`);
    if (!Array.isArray(q.options) || q.options.length < 2) fail(where, `question ${i + 1} needs at least two options`);
    else if (!(q.answer >= 0 && q.answer < q.options.length)) fail(where, `question ${i + 1} answer index ${q.answer} out of range`);
    else if (new Set(q.options).size !== q.options.length) fail(where, `question ${i + 1} has duplicate options`);
    if (!q.why) fail(where, `question ${i + 1} has no explanation`);
  });
}

const { GLOSSARY } = await load("data/glossary.js");
const terms = new Set();
for (const g of GLOSSARY) {
  const k = g.t.toLowerCase();
  if (terms.has(k)) fail("glossary", `duplicate term "${g.t}"`);
  terms.add(k);
  if (g.see && !okRoute(g.see)) fail("glossary", `"${g.t}" links to unknown route ${g.see}`);
}

const { parseQuestions } = await load("lib/questionFormat.js");
const qdir = resolve(root, "questions");
for (const f of readdirSync(qdir).filter((f) => f.endsWith(".txt"))) {
  for (const e of parseQuestions(read(join(qdir, f)), f).errors) fail(`questions/${f}`, `line ${e.line}: ${e.message}`);
}

/* ------------------------------------------------------------------ report */
if (problems.length) {
  console.error(`${problems.length} content problem${problems.length === 1 ? "" : "s"}:`);
  for (const p of problems) console.error("  " + p);
  process.exit(1);
}
console.log(`content OK: ${routes.length} routes, ${QUIZZES.length} quizzes, ${GLOSSARY.length} glossary terms`);

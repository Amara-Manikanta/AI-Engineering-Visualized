/* ---------------------------------------------------------------------------
   SKILL.md linter. The rules mirror what the Agent Skills docs require:
   - name: at most 64 characters, lowercase letters / digits / hyphens, no XML
     tags, and not containing the reserved words "anthropic" or "claude".
   - description: non-empty, at most 1024 characters, no XML tags. It should say
     what the skill does and when to use it, in the third person.
   Advice (body length, nested references, time-sensitive wording) comes from the
   authoring best practices and is reported as a warning, not a failure.
--------------------------------------------------------------------------- */

const XML_TAG = /<\/?[a-zA-Z][^>]*>/;
const TRIGGER = /\b(use when|use this when|use this skill when|use for|use it when|when the user|when asked|when working with|when you need)\b/i;
const FIRST_OR_SECOND_PERSON = /^\s*(i|you|we)\b|\b(i can|i will|you can|you should|let me)\b/i;
const TIME_SENSITIVE = /\b(as of|until|before|after|since|starting)\s+((jan|feb|mar|apr|may|jun|jul|aug|sep|oct|nov|dec)\w*\s+)?(19|20)\d{2}\b|\bin (19|20)\d{2}\b|\b(currently|this year|last year)\b/i;
// A reference like references/a/b.md (two folders deep) forces a partial read.
const NESTED_REF = /\b(?:references?|scripts|assets|docs)\/[\w.-]+\/[\w./-]+/g;

/* Split "---\nfront\n---\nbody". Returns null when there is no frontmatter. */
export function splitFrontmatter(text) {
  const m = text.match(/^---[ \t]*\r?\n([\s\S]*?)\r?\n---[ \t]*(?:\r?\n([\s\S]*))?$/);
  if (!m) return null;
  return { front: m[1], body: m[2] ?? "" };
}

/* A tiny YAML subset: "key: value", with indented or ">" / "|" continuation lines. */
export function parseFront(front) {
  const out = {};
  let key = null;
  for (const raw of front.split(/\r?\n/)) {
    const kv = raw.match(/^([A-Za-z][\w-]*):\s*(.*)$/);
    if (kv && !/^\s/.test(raw)) {
      key = kv[1];
      out[key] = /^[>|][+-]?$/.test(kv[2]) ? "" : kv[2].replace(/^["']|["']$/g, "");
    } else if (key && /^\s+\S/.test(raw)) {
      out[key] = (out[key] ? out[key] + " " : "") + raw.trim();
    }
  }
  return out;
}

const item = (status, rule, msg) => ({ status, rule, msg });

export function lintSkill(text) {
  const res = [];
  const parts = splitFrontmatter(text);
  if (!parts) {
    res.push(item("fail", "Frontmatter", "No YAML frontmatter. The file must start with a line of three dashes, then name and description, then three dashes."));
    return res;
  }
  res.push(item("pass", "Frontmatter", "Found a frontmatter block."));
  const fm = parseFront(parts.front);

  // name
  const name = fm.name ?? "";
  if (!name) res.push(item("fail", "name", "Missing. Every skill needs a name."));
  else {
    const problems = [];
    if (name.length > 64) problems.push(`${name.length} characters (max 64)`);
    if (!/^[a-z0-9-]+$/.test(name)) problems.push("use only lowercase letters, digits and hyphens");
    if (/anthropic|claude/i.test(name)) problems.push('must not contain the reserved words "anthropic" or "claude"');
    if (XML_TAG.test(name)) problems.push("must not contain XML tags");
    res.push(problems.length ? item("fail", "name", problems.join("; ") + ".") : item("pass", "name", `"${name}" is valid (${name.length}/64 characters).`));
  }

  // description
  const desc = fm.description ?? "";
  if (!desc.trim()) res.push(item("fail", "description", "Missing or empty. Claude picks skills by reading this."));
  else {
    if (desc.length > 1024) res.push(item("fail", "description", `${desc.length} characters (max 1024).`));
    else res.push(item("pass", "description", `${desc.length}/1024 characters.`));
    if (XML_TAG.test(desc)) res.push(item("fail", "description", "Contains XML tags, which are not allowed."));
    if (!TRIGGER.test(desc)) res.push(item("warn", "Trigger wording", 'Says what the skill does but not when to use it. Add a sentence such as "Use when the user asks for …".'));
    else res.push(item("pass", "Trigger wording", "Says when to use it."));
    if (FIRST_OR_SECOND_PERSON.test(desc)) res.push(item("warn", "Point of view", 'Write the description in the third person ("Builds reports…"), not "I can…" or "You can…".'));
    if (desc.trim().split(/\s+/).length < 8) res.push(item("warn", "Specificity", "Very short. Include the file types, tools or keywords that should trigger it."));
  }

  // body
  const body = parts.body;
  const lines = body.split(/\r?\n/).length;
  if (!body.trim()) res.push(item("warn", "Body", "No instructions after the frontmatter."));
  else if (lines > 500) res.push(item("warn", "Body length", `${lines} lines. Keep SKILL.md under about 500 and move detail into reference files.`));
  else res.push(item("pass", "Body length", `${lines} lines (under about 500).`));

  const nested = [...new Set(body.match(NESTED_REF) ?? [])];
  if (nested.length) res.push(item("warn", "Reference depth", `Nested more than one level deep: ${nested.join(", ")}. Link every reference file directly from SKILL.md.`));
  else res.push(item("pass", "Reference depth", "No references nested more than one level deep."));

  const time = (body + " " + desc).match(TIME_SENSITIVE);
  if (time) res.push(item("warn", "Time-sensitive wording", `"${time[0]}" will go stale. Describe the current method, and put old methods under a collapsed "legacy" heading.`));
  else res.push(item("pass", "Time-sensitive wording", "No dates or 'currently' wording found."));

  return res;
}

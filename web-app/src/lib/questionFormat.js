/**
 * Plain-text question format.
 *
 * Designed to be typed by hand in any editor. One format is used everywhere:
 * the questions/ folder, the in-app form (which stores its questions as this
 * text), and import/export.
 *
 *   // comment lines are ignored
 *   # Topic name
 *
 *   Q: A multiple-choice question?
 *   - a wrong option
 *   * the correct option            (exactly one line starts with *)
 *   - another wrong option
 *   WHY: optional explanation shown after answering
 *
 *   Q: An interview question with no options?
 *   ANSWER: A model answer. It may continue
 *   over several lines until a blank line or the next Q:.
 *
 * A question with options is multiple-choice; a question with ANSWER: is an
 * open interview question shown as a reveal-the-answer card.
 */

const slug = (s) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "") || "topic";

export function parseQuestions(text, source = "text") {
  const topics = [];
  const errors = [];
  let topic = null;
  let q = null; // question being built
  let mode = null; // "why" | "answer" — which field continuation lines append to

  const err = (line, message) => errors.push({ source, line, message });

  const ensureTopic = (line) => {
    if (!topic) {
      topic = { name: "Untitled", id: "untitled", questions: [] };
      topics.push(topic);
      if (line) err(line, 'Question before any "# Topic" heading — filed under "Untitled".');
    }
  };

  const finish = () => {
    if (!q) return;
    const correct = q.options.filter((o) => o.correct).length;
    if (q.options.length && q.answerText) {
      err(q.line, "Has both options and ANSWER: — pick one. Treated as multiple-choice.");
    }
    if (q.options.length) {
      if (q.options.length < 2) err(q.line, "Multiple-choice needs at least two options.");
      else if (correct === 0) err(q.line, 'No correct option. Mark exactly one with "*".');
      else if (correct > 1) err(q.line, `${correct} options marked correct with "*". Mark exactly one.`);
      else
        topic.questions.push({
          type: "mcq",
          q: q.text,
          options: q.options.map((o) => o.text),
          answer: q.options.findIndex((o) => o.correct),
          why: q.why.trim() || "No explanation provided.",
        });
    } else if (q.answerText.trim()) {
      topic.questions.push({ type: "open", q: q.text, answer: q.answerText.trim() });
    } else {
      err(q.line, 'Question has no options and no ANSWER: — add "- / *" options or an ANSWER: line.');
    }
    q = null;
    mode = null;
  };

  text.split(/\r?\n/).forEach((raw, i) => {
    const line = i + 1;
    const t = raw.trim();

    if (t.startsWith("//")) return;

    if (!t) {
      // A blank line ends a multi-line ANSWER/WHY, but not the question itself.
      mode = null;
      return;
    }

    let m;
    if ((m = t.match(/^#\s*(?:topic\s*:)?\s*(.+)$/i))) {
      finish();
      const name = m[1].trim();
      topic = topics.find((x) => x.name === name);
      if (!topic) {
        topic = { name, id: slug(name), questions: [] };
        topics.push(topic);
      }
      return;
    }

    if ((m = t.match(/^Q\s*:\s*(.*)$/i))) {
      finish();
      ensureTopic(line);
      if (!m[1].trim()) err(line, "Empty question after Q:.");
      q = { line, text: m[1].trim(), options: [], why: "", answerText: "" };
      return;
    }

    if (!q) {
      err(line, `Ignored — not inside a question: "${t.slice(0, 40)}"`);
      return;
    }

    // Inside an ANSWER, a "- " line is a bullet in the answer, not an option.
    if (mode === "answer" && /^([*•-]|\d+[.)])\s+/.test(t)) {
      q.answerText += "\n" + t;
      return;
    }

    if ((m = t.match(/^([*-])\s+(.+)$/))) {
      q.options.push({ text: m[2].trim(), correct: m[1] === "*" });
      mode = null;
      return;
    }
    if ((m = t.match(/^WHY\s*:\s*(.*)$/i))) {
      q.why = m[1];
      mode = "why";
      return;
    }
    if ((m = t.match(/^(?:ANSWER|A)\s*:\s*(.*)$/i))) {
      q.answerText = m[1];
      mode = "answer";
      return;
    }

    // Continuation of a multi-line field, or of the question text itself.
    if (mode === "answer") q.answerText += " " + t;
    else if (mode === "why") q.why += " " + t;
    else if (!q.options.length) q.text += " " + t;
    else err(line, `Unrecognised line — options start with "- " or "* ": "${t.slice(0, 40)}"`);
  });

  finish();
  return { topics: topics.filter((x) => x.questions.length), errors };
}

/** Topics back to text — the inverse of parseQuestions. */
export function serializeQuestions(topics) {
  return topics
    .map((tp) => {
      const body = tp.questions
        .map((q) =>
          q.type === "open"
            ? `Q: ${q.q}\nANSWER: ${q.answer}`
            : `Q: ${q.q}\n${q.options.map((o, i) => `${i === q.answer ? "*" : "-"} ${o}`).join("\n")}` +
              (q.why && q.why !== "No explanation provided." ? `\nWHY: ${q.why}` : "")
        )
        .join("\n\n");
      return `# ${tp.name}\n\n${body}`;
    })
    .join("\n\n\n");
}

/** Merge topic lists, combining topics that share a name. */
export function mergeTopics(...lists) {
  const out = [];
  for (const list of lists)
    for (const tp of list) {
      const hit = out.find((x) => x.name === tp.name);
      if (hit) hit.questions = [...hit.questions, ...tp.questions];
      else out.push({ ...tp, questions: [...tp.questions] });
    }
  return out;
}

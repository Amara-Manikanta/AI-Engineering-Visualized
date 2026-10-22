/* ---------------------------------------------------------------------------
   Prompt practice scenarios.

   There is no model behind this: each scenario has a rubric of plain checks
   (patterns a good prompt for that job usually satisfies), and the "simulated
   response" is assembled from a good or a poor line for each check. So the
   response really does change with what you write, but it is a teaching
   simulation, not a live model.
--------------------------------------------------------------------------- */

const has = (re) => (t) => re.test(t);
const countMatches = (res) => (t) => res.filter((r) => r.test(t)).length;
const FENCE = /(<\/?[a-z_]+>|"""|```|^---\s*$|^###)/im;

export const SCENARIOS = [
  {
    id: "email",
    title: "Summarise a customer email",
    goal: "Turn a long complaint into something a busy support lead can act on in ten seconds.",
    input:
      "Hi team, I ordered the Aria desk lamp (order #48213) on 3 March and it arrived with a cracked base. I have already sent two photos. I would like a replacement shipped before my daughter's birthday on the 20th, otherwise a refund. This is my second problem with you this year. Regards, Meera",
    insertLabel: "Paste the email into my prompt (in <email> tags)",
    insert: (input) => `\n\n<email>\n${input}\n</email>`,
    exemplar:
      "Summarise the customer email below for a support team lead who has ten seconds to read it.\n\nWrite exactly three bullet points: (1) what the customer wants and by when, (2) order number and the problem, (3) sentiment and urgency.\n\n<email>\n[paste email]\n</email>",
    checks: [
      { id: "task", label: "Says what to do (summarise)", hint: "Start with a clear verb: summarise, condense, extract.", test: has(/\b(summari[sz]e|summary|tl;?dr|condense)\b/i), good: "Customer summary", bad: "Thanks for sharing! There are a few interesting things worth saying about this message." },
      { id: "audience", label: "Names the reader", hint: "Who will read the result? A support lead reads differently from a customer.", test: has(/\b(manager|agent|executive|team|lead|audience|reader|colleague|supervisor)\b/i), good: "Written for a support lead: the ask comes first.", bad: "The customer seems to have had a difficult experience with the product." },
      { id: "length", label: "Sets a length limit", hint: "Give a number: three bullets, under 40 words, one sentence.", test: has(/\b(\d+|one|two|three|four|five)[\s-]*(words?|sentences?|bullets?|bullet points?|lines?)\b|\bunder \d+|\bat most\b|\bno more than\b/i), good: "Kept to three short lines.", bad: "The customer wrote a fairly detailed message about their order and the problems they had, which I have gone through carefully below, covering the background, the timeline and the various points raised along the way." },
      { id: "content", label: "Says what to include", hint: "Name two or more things that must appear: the request, the deadline, the order number, the mood.", test: (t) => countMatches([/order (number|#|id)/i, /deadline|by the 20th|\bdate\b/i, /request|wants|asks for|what the customer/i, /sentiment|tone|frustrat|urgen|priority/i, /\baction\b|next step/i])(t) >= 2, good: "Wants: replacement before the 20th, otherwise a refund. Order #48213, cracked base, photos already sent. Repeat complaint (second this year), high urgency.", bad: "The customer had an issue with a lamp and would like some kind of help." },
      { id: "format", label: "Chooses a format", hint: "Bullets, a table, JSON, numbered steps: say which.", test: has(/\b(bullet|json|table|numbered|list|paragraph|headings?)\b/i), good: "", bad: "" },
      { id: "input", raw: true, label: "Includes the email, fenced off", hint: "Paste the text inside tags such as <email>…</email> so the model knows where it starts and ends.", test: (t) => (/order #48213|cracked base|\{\{?\s*email\s*\}?\}|\[(paste )?email\]/i.test(t)) && FENCE.test(t), good: "", bad: "I don't see the email itself, so I can only guess what it says." },
    ],
  },
  {
    id: "invoice",
    title: "Extract invoice data as JSON",
    goal: "Get machine-readable fields out of messy text, so a program can use the answer.",
    input:
      "INVOICE. Northwind Traders. Invoice no: INV-2093. Date: 14 Aug 2026. Bill to: Kavya Rao. Items: 3 x Oak shelf @ 4,200 = 12,600. Delivery 500. Total due: 13,100 INR. Payment due by 30 Aug 2026.",
    insertLabel: "Paste the invoice into my prompt (in <invoice> tags)",
    insert: (input) => `\n\n<invoice>\n${input}\n</invoice>`,
    exemplar:
      'Extract data from the invoice below. Return only JSON with the keys vendor, invoice_number, date (YYYY-MM-DD), total (number) and currency. If a value is missing, use null; never guess. No text before or after the JSON.\n\nExample output: {"vendor": "Acme", "invoice_number": "A-1", "date": "2026-01-02", "total": 100, "currency": "INR"}\n\n<invoice>\n[paste invoice]\n</invoice>',
    checks: [
      { id: "json", label: "Asks for JSON", hint: "Name the format you want back.", test: has(/\bjson\b/i), good: "{", bad: "Sure! Here is the information I found in the invoice:" },
      { id: "fields", label: "Names the fields", hint: "List at least three keys: vendor, invoice number, date, total, currency.", test: (t) => countMatches([/vendor|supplier/i, /invoice (number|no|id)|invoice_number/i, /\bdate\b/i, /\btotal\b|amount/i, /currency/i, /customer|bill(ed)? to/i])(t) >= 3, good: '  "vendor": "Northwind Traders", "invoice_number": "INV-2093", "date": "2026-08-14", "total": 13100,', bad: "The vendor is Northwind and the total looks like about 13,100." },
      { id: "missing", label: "Says what to do when data is missing", hint: "Tell it to use null rather than invent a value.", test: has(/\b(null|missing|not found|unknown|empty string)\b|if (a |the )?(field|value|data) (is|are) (missing|absent|not)/i), good: '  "tax_id": null,', bad: "I could not see a tax ID, so I made a reasonable guess: 0000-1234." },
      { id: "example", label: "Shows one example of the output", hint: "One small example beats a paragraph of description.", test: (t) => /\b(example|for instance|e\.g\.|sample output|like this)\b/i.test(t) && /\{[^}]*:[^}]*\}/.test(t), good: '  "currency": "INR"', bad: '  "currency": "₹"' },
      { id: "only", label: "Forbids extra text", hint: "Say 'return only JSON, no other text' so a program can parse it.", test: has(/\b(only|nothing else|no (other|extra|additional) text|without (any )?(explanation|commentary|prose)|no explanation)\b/i), good: "}", bad: "Let me know if you'd like it in another format!" },
      { id: "input", raw: true, label: "Includes the invoice, fenced off", hint: "Put the text inside <invoice>…</invoice> tags.", test: (t) => (/inv-2093|northwind|\{\{?\s*invoice\s*\}?\}|\[(paste )?invoice\]/i.test(t)) && FENCE.test(t), good: "", bad: "Note: I can't see the invoice text, so these values are guesses." },
    ],
  },
  {
    id: "blurb",
    title: "Write a product description",
    goal: "Get copy in your voice, with the real facts, and without the usual hype.",
    input: "Product: Aria desk lamp. Warm 2700K LED, USB-C powered, brass finish, 8-hour touch dimmer memory, price ₹2,499.",
    insertLabel: "Paste the product facts into my prompt",
    insert: (input) => `\n\nFacts:\n${input}`,
    exemplar:
      "Write a 60-word product description for the Aria desk lamp, for students who study late. Voice: warm and honest, a little playful. Use these facts: 2700K warm LED, USB-C powered, brass finish, touch dimmer, ₹2,499. Avoid clichés and exclamation marks. End with a one-line call to action.",
    checks: [
      { id: "task", label: "Says what to write", hint: "Write, draft, or compose, and what kind of text.", test: has(/\b(write|draft|compose|create)\b[^.]*\b(description|blurb|copy|listing|ad|text)\b/i), good: "Aria Desk Lamp: Warm Light for Late Nights", bad: "Here is some text about a lamp." },
      { id: "voice", label: "Gives audience and voice", hint: "Who is it for, and how should it sound?", test: has(/\b(audience|voice|tone|persona|brand|friendly|warm|premium|playful|honest|for (students|professionals|readers|shoppers|customers|people))\b/i), good: "A warm 2700K glow that feels like a lamp, not a spotlight.", bad: "This state-of-the-art, best-in-class lamp will revolutionise your workspace!!!" },
      { id: "length", label: "Sets a length", hint: "Give a word count.", test: has(/\b(\d+|one|two|three)[\s-]*(words?|sentences?|paragraphs?|lines?)\b|\bunder \d+|\bat most\b|\bno more than\b/i), good: "", bad: "It is the perfect addition to any home or office and it will suit all sorts of rooms and lifestyles, whether you are working, reading, studying or simply relaxing." },
      { id: "facts", raw: true, label: "Supplies the real facts", hint: "Include at least three: 2700K, USB-C, brass, touch dimmer, ₹2,499.", test: (t) => countMatches([/2700/, /usb-?c/i, /brass/i, /dimmer|touch/i, /2,?499/])(t) >= 3, good: "USB-C powered, brass finish, and a touch dimmer that remembers 8 hours of glow. ₹2,499.", bad: "It has lots of great features at an affordable price." },
      { id: "avoid", label: "Says what to avoid", hint: "Name what you do not want (clichés, exclamation marks, jargon), and say what to do instead where you can.", test: has(/\b(avoid|don'?t|do not|never|no (clich|jargon|exclamation|hype)|without)\b/i), good: "", bad: "Order now!!! Limited time only!!!" },
      { id: "ending", label: "Says how to end", hint: "A call to action, a headline, or a closing line.", test: has(/\b(call to action|cta|end with|finish with|headline|title|closing line|tagline)\b/i), good: "Order the Aria today and switch it on tonight.", bad: "" },
    ],
  },
];

export function evaluate(scenario, prompt) {
  // Instruction checks look at what the user wrote, not the pasted source text,
  // so words inside the email ("Hi team") cannot satisfy them by accident.
  const instr = scenario.input ? prompt.split(scenario.input).join(" ") : prompt;
  const results = scenario.checks.map((c) => ({ id: c.id, label: c.label, hint: c.hint, pass: !!c.test(c.raw ? prompt : instr) }));
  const passed = results.filter((r) => r.pass).length;
  return { results, passed, total: results.length, score: passed / results.length };
}

/* The simulated reply: one line per check, good or poor, empty lines dropped. */
export function buildResponse(scenario, prompt) {
  const ev = evaluate(scenario, prompt);
  const lines = scenario.checks
    .map((c, i) => (ev.results[i].pass ? c.good : c.bad))
    .filter(Boolean);
  const format = scenario.checks.find((c) => c.id === "format");
  const asList = format ? ev.results.find((r) => r.id === "format").pass : false;
  return { lines, asList, ev };
}

export function tier(score) {
  if (score >= 0.99) return ["Sharp", "emerald"];
  if (score >= 0.66) return ["Getting there", "amber"];
  if (score >= 0.33) return ["Vague", "rose"];
  return ["Too thin", "rose"];
}

import React, { useMemo, useState } from "react";
import { Panel, Segmented, Metric } from "../VizKit";

/* ---------------------------------------------------------------------------
   A toy router: pick the tool whose description shares the most words with the
   request. A real model is far smarter, but the lesson survives: when two
   descriptions look alike, or say nothing specific, the choice is a coin toss.
--------------------------------------------------------------------------- */

const STOP = new Set("a an the to of for and or in on at is are be it this that with from by as my me i you your can do does what when how".split(" "));
const words = (s) => (s.toLowerCase().match(/[a-z]+/g) || []).filter((w) => !STOP.has(w) && w.length > 2);
const stem = (w) => w.replace(/(ing|ed|es|s)$/, "");

const TOOLS = {
  vague: [
    { n: "search", d: "Search for things." },
    { n: "lookup", d: "Look things up." },
    { n: "get_data", d: "Get data." },
    { n: "update", d: "Update stuff." },
  ],
  clear: [
    { n: "search_orders", d: "Search customer orders by order number, email address or date range. Use to find an order before answering questions about delivery or refunds." },
    { n: "get_product_info", d: "Get price, stock level and specifications for one product by SKU or product name. Use for questions about what we sell." },
    { n: "get_refund_policy", d: "Get the refund and returns policy text. Use when a customer asks whether they can return or get money back." },
    { n: "update_shipping_address", d: "Change the delivery address on an order that has not shipped yet. Use only when the customer asks to change where an order is sent." },
  ],
};

const REQUESTS = [
  "Where is my order? I used the email address sam@example.com.",
  "How much does the blue kettle cost and what is the stock level?",
  "Can I get my money back on something I bought last week?",
  "Change the delivery address, my order has not shipped yet.",
];

function score(req, desc) {
  const r = new Set(words(req).map(stem));
  return words(desc).map(stem).filter((w) => r.has(w)).length;
}

export function DescriptionLab() {
  const [kind, setKind] = useState("vague");
  const rows = useMemo(
    () =>
      REQUESTS.map((q) => {
        const s = TOOLS[kind].map((t) => ({ n: t.n, s: score(q, t.d) }));
        const sorted = [...s].sort((a, b) => b.s - a.s);
        const ambiguous = sorted[0].s < 2 || sorted[0].s - sorted[1].s < 1; // needs real evidence and a margin
        return { q, s, top: sorted[0], ambiguous };
      }),
    [kind],
  );
  const clear = rows.filter((r) => !r.ambiguous).length;
  return (
    <Panel tone="amber" title="Do the descriptions tell the tools apart?">
      <div className="mb-3">
        <Segmented tone="amber" value={kind} onChange={setKind} options={[{ v: "vague", label: "Vague descriptions" }, { v: "clear", label: "Clear descriptions" }]} />
      </div>
      <div className="space-y-1 mb-3">
        {TOOLS[kind].map((t) => (
          <div key={t.n} className="text-xs rounded bg-black/40 border border-white/10 px-2 py-1.5">
            <span className="font-mono text-amber-300">{t.n}</span> <span className="text-gray-400">— {t.d}</span>
          </div>
        ))}
      </div>
      <div className="space-y-2 mb-3">
        {rows.map((r) => (
          <div key={r.q} className="rounded-lg border border-white/10 bg-black/30 px-3 py-2">
            <div className="text-sm text-gray-100 mb-1">“{r.q}”</div>
            <div className="flex flex-wrap gap-1.5 items-center text-[0.6875rem] font-mono">
              {r.s.map((x) => (
                <span key={x.n} className={`px-1.5 py-0.5 rounded ${x.n === r.top.n && !r.ambiguous ? "bg-emerald-500/25 text-emerald-200" : "bg-white/5 text-gray-400"}`}>
                  {x.n} {x.s}
                </span>
              ))}
              <span className={r.ambiguous ? "text-rose-300" : "text-emerald-300"}>{r.ambiguous ? "→ ambiguous" : `→ ${r.top.n}`}</span>
            </div>
          </div>
        ))}
      </div>
      <Metric label="Requests with an obvious tool" value={`${clear} of ${rows.length}`} tone={clear === rows.length ? "emerald" : "rose"} />
      <p className="text-xs text-gray-500 leading-relaxed mt-3 mb-0">
        This is a keyword-overlap toy, not a language model: it counts shared words between the request and each
        description. A real model uses meaning and copes better, but it still can only choose from what the
        descriptions say. When they are vague or overlap, choices become unreliable, and specific wording (“by order
        number”, “use when a customer asks to return”) is what separates the tools.
      </p>
    </Panel>
  );
}

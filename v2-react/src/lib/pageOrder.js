import { NAV_LINKS, AZURE_LINKS, AWS_LINKS } from "../config/navigation";
import { PYTHON_LINKS } from "../config/pythonNavigation";

/* ---------------------------------------------------------------------------
   Reading order for the previous / next links at the foot of each guide.

   The order is the menu's: each top-level menu group is one sequence, headed
   by the group's own hub page. A page listed under two groups (Embeddings sits
   in both GenAI and RAG) belongs to the group whose URL prefix it shares.
--------------------------------------------------------------------------- */

const links = (list) => list.filter((l) => l.path && !l.isHeader && !l.path.includes("#"));

function dedupe(list) {
  const seen = new Set();
  return list.filter((l) => (seen.has(l.path) ? false : seen.add(l.path)));
}

const SEQUENCES = [
  { prefix: "/azure", items: [{ name: "Azure Overview", path: "/azure" }, ...AZURE_LINKS] },
  { prefix: "/aws", items: [{ name: "AWS Overview", path: "/aws" }, ...AWS_LINKS] },
  { prefix: "/python", items: PYTHON_LINKS },
  ...NAV_LINKS.filter((g) => g.subLinks && g.path !== "/azure").map((g) => {
    const items = dedupe(links(g.subLinks));
    // Hubs such as /rag and /genai are not in their own dropdown; lead with them.
    if (!items.some((i) => i.path === g.path)) items.unshift({ name: g.name.replace(/^\S+\s/, "") + " Overview", path: g.path });
    return { prefix: g.path, items };
  }),
];

const under = (path, prefix) => path === prefix || path.startsWith(prefix + "/");

export function neighbours(pathname) {
  const containing = SEQUENCES.filter((s) => s.items.some((i) => i.path === pathname));
  const seq = containing.find((s) => under(pathname, s.prefix)) ?? containing[0];
  if (!seq) return { prev: null, next: null };
  const i = seq.items.findIndex((x) => x.path === pathname);
  return { prev: seq.items[i - 1] ?? null, next: seq.items[i + 1] ?? null };
}

/* ---------------------------------------------------------------------------
   The sidebar's "you are here" block: the menu group a page belongs to, and
   the run of links under the same sub-heading. Long groups like ML list only
   the current sub-heading's pages, so the on-page contents stays in view.
--------------------------------------------------------------------------- */
export function sectionFor(pathname) {
  const groups = NAV_LINKS.filter((g) => g.subLinks && g.path !== "/azure");
  const containing = groups.filter((g) => g.subLinks.some((l) => l.path === pathname));
  const group = containing.find((g) => under(pathname, g.path)) ?? containing[0];
  if (!group) return null;
  const list = group.subLinks;
  const i = list.findIndex((l) => l.path === pathname);
  let start = i;
  while (start > 0 && !list[start - 1].isHeader) start--;
  let end = i;
  while (end < list.length - 1 && !list[end + 1].isHeader) end++;
  const header = start > 0 ? list[start - 1].name : null;
  return {
    group: group.name.replace(/^\S+\s/, ""),
    hub: group.path,
    header,
    items: list.slice(start, end + 1).filter((l) => l.path && !l.path.includes("#")),
  };
}

// Finds "[[TODO …]]" in rendered Markdown text and wraps it in <mark class="todo">,
// so unfinished content is easy to spot on the page.
const TODO = /\[\[TODO[^\]]*\]\]/g;
const SKIP = new Set(["code", "pre", "script", "style", "mark"]);

export default function rehypeTodo() {
  return (tree) => walk(tree);
}

function walk(node) {
  if (!node.children || SKIP.has(node.tagName)) return;
  node.children = node.children.flatMap((child) => {
    if (child.type !== "text") {
      walk(child);
      return [child];
    }
    return split(child.value);
  });
}

function split(text) {
  const out = [];
  let last = 0;
  for (const m of text.matchAll(TODO)) {
    if (m.index > last) out.push({ type: "text", value: text.slice(last, m.index) });
    out.push({
      type: "element",
      tagName: "mark",
      properties: { className: ["todo"] },
      children: [{ type: "text", value: m[0] }],
    });
    last = m.index + m[0].length;
  }
  if (last === 0) return [{ type: "text", value: text }];
  if (last < text.length) out.push({ type: "text", value: text.slice(last) });
  return out;
}

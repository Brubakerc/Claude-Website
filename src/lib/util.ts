// Small helpers shared by pages and components.

/** Prefixes a site path with the base path, e.g. url("projects/") → "/Claude-Website/projects/". */
export function url(path = ""): string {
  if (/^[a-z]+:/i.test(path) || path.startsWith("#")) return path; // external, mailto:, #anchor
  const base = import.meta.env.BASE_URL.replace(/\/$/, "");
  return `${base}/${path.replace(/^\//, "")}`;
}

/** True when `pathname` is `href` or a page inside it. */
export function isCurrent(pathname: string, href: string): boolean {
  const target = url(href).replace(/\/$/, "");
  const here = pathname.replace(/\/$/, "");
  return here === target || here.startsWith(target + "/");
}

const escape = (s: string) =>
  s.replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]!);

/** Escapes text for HTML and highlights any [[TODO …]] in it. Use with set:html. */
export function todo(text = ""): string {
  return escape(text).replace(/\[\[TODO[^\]]*\]\]/g, (m) => `<mark class="todo">${m}</mark>`);
}

/** Plain text with [[TODO]] markers removed, for <title> and meta tags. */
export function plain(text = ""): string {
  return text.replace(/\[\[TODO[^\]]*\]\]/g, "").replace(/\s+/g, " ").trim();
}

export const statusLabel = {
  "in-progress": "In progress",
  complete: "Complete",
  ongoing: "Ongoing",
} as const;

export function slugifyTag(tag: string): string {
  return tag.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");
}

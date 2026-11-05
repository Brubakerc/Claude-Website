import { getCollection, type CollectionEntry } from "astro:content";
import { slugifyTag } from "./util";

export type Project = CollectionEntry<"projects">;

/** All projects that should appear on the site, in display order.
 *  Drafts show while you run the site locally and are left out of the live site. */
export async function getProjects(): Promise<Project[]> {
  const all = await getCollection("projects", ({ data }) => import.meta.env.DEV || !data.draft);
  return all.sort((a, b) => a.data.order - b.data.order || a.data.title.localeCompare(b.data.title));
}

/** Every tag used by at least one project, with its URL-safe form, sorted A–Z. */
export function getTags(projects: Project[]) {
  const map = new Map<string, string>();
  for (const p of projects) for (const t of p.data.tags) map.set(slugifyTag(t), t);
  return [...map].map(([slug, label]) => ({ slug, label })).sort((a, b) => a.label.localeCompare(b.label));
}

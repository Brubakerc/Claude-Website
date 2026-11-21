// Adds up what the home page downloads (HTML, CSS, JS, the largest version of each
// image, and every font file its CSS could load). Run after `npm run build`.
import fs from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");
const base = (fs.readFileSync("astro.config.ts", "utf8").match(/const BASE = "([^"]*)"/)?.[1] ?? "/").replace(/\/$/, "");
const local = (u) => path.join(dist, decodeURIComponent(u.slice(base.length).split(/[?#]/)[0]));
const size = (f) => (fs.existsSync(f) ? fs.statSync(f).size : 0);

const html = fs.readFileSync(path.join(dist, "index.html"), "utf8");
const files = new Set([path.join(dist, "index.html")]);
for (const m of html.matchAll(/<(?:link[^>]+rel="stylesheet"[^>]*href|script[^>]+src)="([^"]+)"/g)) files.add(local(m[1]));
for (const m of html.matchAll(/<img\b[^>]*>/g)) {
  const set = m[0].match(/srcset="([^"]+)"/)?.[1];
  const src = m[0].match(/\ssrc="([^"]+)"/)?.[1];
  const biggest = set ? set.split(",").map((s) => s.trim().split(/\s+/)[0]).at(-1) : src;
  if (biggest?.startsWith(base)) files.add(local(biggest));
}
for (const f of [...files].filter((f) => f.endsWith(".css")))
  for (const m of fs.readFileSync(f, "utf8").matchAll(/url\(([^)]+\.woff2)\)/g)) files.add(local(m[1].replace(/["']/g, "")));

const total = [...files].reduce((n, f) => n + size(f), 0);
console.log(`Home page, worst case (largest images, every font): ${(total / 1024).toFixed(0)} KB across ${files.size} files.`);
if (total > 1024 * 1024) {
  console.error("That's over 1 MB.");
  process.exit(1);
}

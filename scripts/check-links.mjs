// Checks every internal link and asset in the built site (dist/) points at a file
// that exists, with the base path included. Run after `npm run build`:
//   node scripts/check-links.mjs
import fs from "node:fs";
import path from "node:path";

const dist = path.resolve("dist");
const config = fs.readFileSync("astro.config.ts", "utf8");
const base = (config.match(/const BASE = "([^"]*)"/)?.[1] ?? "/").replace(/\/$/, "");

const htmlFiles = [];
(function walk(dir) {
  for (const f of fs.readdirSync(dir, { withFileTypes: true })) {
    const p = path.join(dir, f.name);
    if (f.isDirectory()) walk(p);
    else if (f.name.endsWith(".html")) htmlFiles.push(p);
  }
})(dist);

const problems = [];
let checked = 0;
for (const file of htmlFiles) {
  const html = fs.readFileSync(file, "utf8");
  const urls = [];
  for (const m of html.matchAll(/\s(?:href|src|poster)="([^"]+)"/g)) urls.push(m[1]);
  for (const m of html.matchAll(/\ssrcset="([^"]+)"/g)) urls.push(...m[1].split(",").map((s) => s.trim().split(/\s+/)[0]));
  for (const raw of urls) {
    const url = raw.replace(/&amp;/g, "&");
    if (!url.startsWith("/") || url.startsWith("//")) continue; // external, mailto:, #anchor, data:
    checked++;
    const where = path.relative(dist, file);
    if (base && url !== base && !url.startsWith(base + "/")) {
      problems.push(`${where}: "${url}" is missing the base path "${base}"`);
      continue;
    }
    let target = decodeURIComponent(url.slice(base.length).split(/[?#]/)[0]) || "/";
    let p = path.join(dist, target);
    if (target.endsWith("/")) p = path.join(p, "index.html");
    else if (!path.extname(p) && fs.existsSync(path.join(p, "index.html"))) p = path.join(p, "index.html");
    if (!fs.existsSync(p)) problems.push(`${where}: "${url}" points to a file that doesn't exist`);
  }
}

console.log(`Checked ${checked} internal links in ${htmlFiles.length} pages.`);
if (problems.length) {
  console.error(problems.join("\n"));
  process.exit(1);
}
console.log("No broken internal links.");

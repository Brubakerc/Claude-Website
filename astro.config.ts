// Astro configuration. You rarely need to touch this file.
import { defineConfig } from "astro/config";
import mdx from "@astrojs/mdx";
import { fileURLToPath } from "node:url";
import site from "./src/site.config";
import rehypeTodo from "./src/lib/rehype-todo.mjs";

// ── Where the site lives ────────────────────────────────────────────────────
// This repo is github.com/Brubakerc/Claude-Website, so GitHub Pages serves it at
//   https://brubakerc.github.io/Claude-Website/
// `site` is the domain and `base` is the folder after it.
//
// If you rename the repo, change `base` to "/<new-repo-name>".
// If the repo is named "<username>.github.io", the site lives at the root:
//   site: "https://<username>.github.io", base: "/"
// With a custom domain (see docs/HOW_TO_PUBLISH.md):
//   site: "https://www.example.com", base: "/"
const SITE = "https://brubakerc.github.io";
const BASE = "/Claude-Website";

// With the style picker on, every style's CSS is included so visitors can switch.
// With it off, only the chosen style's CSS is built into the site.
const styleCss = site.showStyleSwitcher
  ? "./src/styles/all-styles.css"
  : `./src/styles/themes/${site.style}.css`;

export default defineConfig({
  site: SITE,
  base: BASE,
  integrations: [mdx()],
  markdown: {
    // Turns [[TODO: …]] in any project, page, or post into a visible highlight.
    rehypePlugins: [rehypeTodo],
  },
  vite: {
    resolve: {
      alias: {
        "@active-styles": fileURLToPath(new URL(styleCss, import.meta.url)),
      },
    },
  },
});

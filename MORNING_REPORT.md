# Morning report

> **Heads-up:** the npm and Python package registries were blocked in the session
> that built this, so nothing could be installed or run locally. Every build was
> checked by GitHub Actions instead. The final build passes with no warnings, all 230
> internal links resolve with the base path, the home page is under 1 MB even counting
> every style's fonts (832 KB), and a second build with the style picker off passes.
> These checks run on every push.

## 1. Get the site live (about 5 minutes)

1. Merge branch `claude/ecstatic-allen-lkt2ys` into `main` (open a pull request on
   github.com, then **Merge**).
2. **Settings → Pages → Source: GitHub Actions.**
3. **Actions** tab: wait for the green check on "Build and deploy" (re-run it if it
   ran before step 2).
4. Visit **https://brubakerc.github.io/Claude-Website/**

Full steps: `docs/HOW_TO_PUBLISH.md`.

## 2. What was built

- Astro 5 site with home, projects (with tag filter), project pages with
  previous/next, about, resume (PDF button appears when `public/resume.pdf` exists),
  updates, and 404.
- Content checked at build time with plain-English errors. A new project is a
  copied folder: `src/content/projects/_template/`.
- Components: Figure, Gallery (full-screen viewer that opens from the thumbnail,
  follows your finger, swipe down to close), KeyDecision, SpecTable, Model3D,
  Callout. `[[TODO: …]]` shows as a yellow highlight.
- Three sample projects, one sample update, generated product renders, and two
  generated 3D models.
- Four styles and a style picker. All settings in `src/site.config.ts`.

Not built, and why:
- No `package-lock.json` (couldn't reach npm). Builds still work; adding one makes
  them repeatable.
- `scripts/convert_to_glb.py` (STL/STEP → GLB) couldn't be run here (no trimesh). It
  follows trimesh's documented API but is untested.
- Gestures (lightbox drag, press feedback) were written to the apple-design skill's
  rules and unit-tested at the physics level, but not tried on a real phone.

## 3. The four styles

Compare them live with the **Style** picker in the bottom-right corner, or with
`?style=apple|drawing|shop|editorial` on any address.

- **Apple:** big product imagery, system font, translucent menu bar, spring motion,
  one hero animation.
- **Drawing sheet:** vellum (or blueprint in dark mode), title block of project
  facts, dimension lines over section headings.
- **Machine shop:** gunmetal and steel, heavy condensed type, brass project numbers.
- **Quiet editorial:** one serif, one reading column, full-bleed cover images.

Screenshots (desktop and phone, light and dark): `docs/screenshots/`. To refresh
them, run the "Screenshots" workflow from the Actions tab.
Design notes: `docs/STYLES.md`.

## 4. Decisions you might want to change

- Default style is **Apple** (`style` in `src/site.config.ts`).
- The style picker is **on** for everyone; set `showStyleSwitcher: false` once
  you've chosen.
- Prev/next on project pages **wraps around** (last → first).
- Only `title`, `summary`, `cover`, and `coverAlt` are required for a project.
- The rest are in `DECISIONS.md`.

## 5. Suggested next steps

1. Pick a style and turn the picker off.
2. Replace "Your Name", contact links, `about.md`, and `resume.md`. Search the repo
   for `TODO` to find every placeholder.
3. Add your first real project from the template; delete the `sample-` folders.
4. Upload `public/resume.pdf`.
5. In a future Claude Code session: commit a `package-lock.json`.

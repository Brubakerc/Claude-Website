# Progress

> **Network note (read first):** in the session that built this, the npm registry
> (`registry.npmjs.org`) and PyPI (`pypi.org`) were blocked by the environment's
> network policy. `npm install` and `npm run build` could not run locally. The site
> is built and checked by the GitHub Actions workflow instead, which has internet.
> GitHub itself was reachable, so the three design skills were installed by
> cloning their repos.

## Status

| Phase | State |
|---|---|
| 0. Setup | done |
| 1. Scaffold | done (CI build passes) |
| 2. Templates and components | done |
| 3. Placeholder content and media | done |
| 4. Styles | done |
| 5. Quality | in progress: screenshot review |
| 6. Docs | done |
| 7. Morning report | drafted |

## Done

- Phase 0: read CLAUDE.md; installed `apple-design`, `emil-design-eng`
  (emilkowalski/skills) and `frontend-design` (anthropics/skills) into
  `.claude/skills/`, read all three in full. Tools: node 22, npm 10, python 3.13
  with numpy and Pillow (no trimesh), Playwright + Chromium.

- Phase 1: Astro 5 + MDX scaffold, content schemas (`src/content.config.ts`),
  `src/site.config.ts`, base layout, `.github/workflows/deploy.yml`. First CI build passed.
- Phase 2: all pages (home, projects, tag pages, project page, about, resume,
  updates, 404) and components (Figure, Gallery + lightbox, KeyDecision, SpecTable,
  Model3D, Callout). Neutral styles in `src/styles/base.css`.
- Phase 3: three sample projects, template folder, sample update, renders and GLBs
  from `scripts/make_placeholder_media.py`.

- Phase 4: plans in `docs/STYLES.md`; themes in `src/styles/themes/`. Switcher in
  `src/components/StyleSwitcher.astro` + `src/styles/switcher.css`.
- Phase 5 so far: CI build has zero Astro warnings; `scripts/check-links.mjs`
  passes (230 internal links); palettes pass AA in both modes.
- Phase 6: all four docs in `docs/`, plus `scripts/convert_to_glb.py`.

## Next

- Review `docs/screenshots/` (made by the Screenshots workflow; push a commit with
  `[screenshots]` in its message to refresh), fix what looks off, log fixes in
  docs/STYLES.md.
- Finalize MORNING_REPORT.md.

## Blocked

- Local `npm install` / `npm run build` (registry blocked). Workaround: CI build.
- `trimesh` (PyPI blocked). Workaround: write the GLB by hand with numpy.

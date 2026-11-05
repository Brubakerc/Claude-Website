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
| 2. Templates and components | done, awaiting CI |
| 3. Placeholder content and media | done, awaiting CI |
| 4. Styles | not started |
| 5. Quality | not started |
| 6. Docs | not started |
| 7. Morning report | not started |

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

## Next

- Check the CI build for the Phase 2–3 push; fix errors.
- Phase 4: plan styles in docs/STYLES.md, then build the four theme files.

## Blocked

- Local `npm install` / `npm run build` (registry blocked). Workaround: CI build.
- `trimesh` (PyPI blocked). Workaround: write the GLB by hand with numpy.

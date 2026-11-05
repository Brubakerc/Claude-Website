# Decisions

Choices made during the unattended build, with the alternatives and the reason.
Anything here can be changed later.

## Setup

**Skills installed by `git clone`, not `npx skills` or raw downloads.**
Alternatives: `npx skills@latest add …` (npm registry blocked), raw.githubusercontent.com
downloads (blocked, 403). Cloning public GitHub repos worked, so the three `SKILL.md`
files (plus licenses) were copied into `.claude/skills/`.

**No local build; GitHub Actions is the build check.**
The npm registry was blocked in this environment, so Astro could not be installed
or run here. The project was written by hand and the workflow builds it on every
push to any branch (deploying only from `main`), so build errors show up in the
Actions tab.

**Astro 5 (`^5.0.0`), not whatever is newest.**
Alternatives: Astro 6. Astro 5's content-layer API (`src/content.config.ts`, `glob()`
loader, `render()`) could be written with confidence without a local install, and the
first CI run confirmed it installs and builds. Upgrading later is a normal
`npx @astrojs/upgrade` job for a future Claude Code session.

**No `package-lock.json` yet.** It couldn't be generated without the registry. The
workflow uses `npm ci` automatically once a lockfile is committed. Adding one
(`npm install` on any machine with internet, then commit the file) makes builds
fully repeatable.

**Workflow builds every branch, deploys only `main`.** Alternatives: the
`withastro/action` wrapper. Plain steps are easier to read and let every branch get a
build check without publishing.

## Build and media

**3D model and renders generated with numpy + Pillow, not trimesh.** PyPI was
blocked. `scripts/make_placeholder_media.py` builds lathe-style parts by revolving a
profile (plus a slotted flange), writes GLB files by hand, and renders matching
product shots with a small software renderer, so the hero image and the 3D model
show the same part.

**Gallery lightbox uses a 60-line spring (`src/scripts/spring.ts`), not the `motion`
library.** Alternatives: `motion`'s `animate()`. The spring is parameterized exactly
like Apple's (response + damping), keeps velocity when retargeted, takes a handed-off
gesture velocity, and has unit tests that run in CI. It avoids a dependency whose
runtime API couldn't be tested without npm here. Nothing else on the site needs
`motion`, so it isn't installed.

**Gallery, Figure, and SpecTable take plain Markdown inside them** (images and
tables), instead of JSX props like `images={[...]}`. Writing a gallery is then just
listing `![alt](./file.jpg)` lines, which is easier to edit on github.com.

**Page transitions use native cross-document view transitions (CSS only).**
Alternatives: Astro's `<ClientRouter />`. The CSS version needs no JavaScript and
falls back to normal page loads in browsers that don't support it.

**Prev/next wraps around** (the last project's "Next" goes to the first), so
clicking through never dead-ends.

**Screenshots come from a GitHub Actions workflow** (`.github/workflows/screenshots.yml`)
that builds the site, screenshots it with Playwright, and commits the images to
`docs/screenshots/`. It runs from the Actions tab or on commits containing
`[screenshots]`. Desktop shots are 1× (1440 px wide, full page) to keep the repo
small; phone shots are 2×.

## Content model

**Required project fields: title, summary, cover, coverAlt.** Everything else has a
default (status `complete`, order 100, not featured, no tags), so a new project needs
only four lines to build.

**About and Resume are Markdown files in `src/pages/`** (`about.md`, `resume.md`),
not a content collection. They are single pages, and plain Markdown with a layout is
the simplest thing to edit.

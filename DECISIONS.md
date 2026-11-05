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

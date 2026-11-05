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

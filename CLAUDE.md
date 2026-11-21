# CLAUDE.md — filling in the portfolio

This repo is a finished portfolio site (Astro, published to GitHub Pages). The owner
is an engineering student. Your job is to **replace the placeholder content with the
owner's real content**. The structure, layout, components, and styles are final.

The original build brief is in `docs/ORIGINAL_BUILD_BRIEF.md`, for background only.
Don't follow its instructions; this file replaces them.

## Don't change

- Layout and components: `src/layouts/`, `src/components/`, `src/pages/*.astro`,
  `src/scripts/`, `src/styles/`, `src/content.config.ts`, `astro.config.ts`,
  `.github/workflows/`. Change these only if the owner asks.
- Repo settings and branches. Commit to the branch you were given.

If the content truly doesn't fit the structure (e.g. a field the schema rejects), say
so and suggest the smallest change. Don't work around it by editing layout code.

## Where the owner's material is

- `inbox/`: whatever the owner uploaded: resume (PDF or text), CAD files (STL, STEP,
  OBJ), photos, screenshots (often exported from Notion), and notes. Read everything
  in it before you start.
- Notion: if a Notion connector is available and the owner named pages, read those.
- The owner, if they're around. If they aren't, don't wait; leave `[[TODO: …]]`.

## Where each thing goes

| Content | Goes in |
|---|---|
| Name, tagline, "looking for" line, email, LinkedIn, GitHub | `src/site.config.ts` |
| Bio, education, skills | `src/pages/about.md` |
| Resume as a web page | `src/pages/resume.md` |
| Resume PDF (enables the download button) | `public/resume.pdf` (exact name) |
| Each project | its own folder, copied from `src/content/projects/_template/` |
| Project images | inside that project's folder, referenced as `./file.jpg` |
| 3D models | convert to `.glb` with `scripts/convert_to_glb.py`, put in the project folder |
| Short dated notes | `src/content/updates/` |

`docs/HOW_TO_ADD_A_PROJECT.md` documents every frontmatter field and component, with
copy-paste examples. `docs/HOW_TO_ADD_3D_MODELS.md` covers STL/STEP conversion
(aim for under 5 MB per GLB; use `--max-faces` if larger).

## How to write it

- **Never invent facts.** No made-up numbers, dates, roles, or results. Where something
  is missing, write `[[TODO: what's needed]]`; the site highlights it in yellow.
- Plain, specific, sentence case. Concrete numbers and what was tested. No sales
  words ("passionate", "cutting-edge", "seamless", "robust", "innovative").
- Use the building blocks where they fit: `<KeyDecision>` for a real design decision
  (options, constraints, analysis, outcome), `<SpecTable>` for numbers with units,
  `<Gallery>` for several photos, `<Model3D>` for a converted CAD file.
- Every image needs real alt text describing what's in it.
- Order projects by strength (`order: 1` is the best one) and mark 2–3 as
  `featured: true`. The first featured project's cover is the home page hero, so
  give it the best image of hardware.
- Confidential work: keep it vague, and use the `confidential:` field to say what was
  left out.

## Privacy

This site is public. Use the owner's name, email, LinkedIn, and GitHub as given.
**Leave off phone numbers, street addresses, student ID numbers, and GPA unless the
owner explicitly asks** — even if they're on the resume PDF. (The PDF itself is the
owner's choice to publish; ask before adding it if you're unsure.)

## When you're done with the samples

Once at least one real project exists, delete the three `sample-*` project folders and
the sample post in `src/content/updates/`. Keep `_template/`. Leave `inbox/` alone; the
owner decides when to delete it.

## Checking your work

1. `npm install`, then `npm run build`. Content errors are written in plain English.
2. `node scripts/check-links.mjs` checks every internal link.
3. Search for `[[TODO` and list what's still missing for the owner.

If npm is blocked in your environment, push and read the "Build and deploy" run in
GitHub Actions instead; it runs the same checks. To see the result, run the
"Screenshots" workflow (or put `[screenshots]` in a commit message) and review
`docs/screenshots/`.

Commit after each project. Finish with a short summary for the owner: what was filled
in, what's still `[[TODO]]`, and anything that needs their decision.

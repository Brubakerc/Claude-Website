# CLAUDE.md — Portfolio website template (unattended run)

## What you're building

A personal portfolio website **template** for an engineering student to show off hardware and engineering projects to recruiters. It should be easy to click through and easy to expand for years.

There is **no real personal content yet.** Use obvious placeholders throughout ("Your Name", "Sample project", `[[TODO]]`). The owner will add their own content later.

The owner has no web development experience. He'll mostly edit text files directly on github.com in his browser, and later with Claude Code. Two things matter most:

1. **Structure.** Adding a project means copying a folder and filling in text. No touching layout code.
2. **Several distinct visual styles** he can flip between on the live site and pick from.

The owner is asleep. Read this whole file before starting.

---

## 1. How to behave during this run

- **Don't ask questions and don't wait for input.** When something is unclear, choose the most reasonable option, log it in `DECISIONS.md` (choice, alternatives, why), and keep going.
- **Don't end your turn until every phase in Section 9 is done** or you are truly blocked. If one task is blocked, log it in `PROGRESS.md` and move on to the next task you can do.
- **Keep `PROGRESS.md` current** after every task: phase, done, next, blocked. A future session will resume from it. If `PROGRESS.md` already exists when you start, read it first and continue from where it left off.
- **Commit after every completed task** with a clear message.
- Never put real personal information anywhere: no real names, emails, phone numbers, or addresses. Use placeholders only.
- **Don't change the GitHub repo's settings** and don't delete branches. Writing the GitHub Actions deploy workflow file is fine; the owner turns on Pages himself.

---

## 2. Design skills to use

Before any design or front-end work, install these skills into this repo so they load as project skills. **Read each `SKILL.md` in full yourself** before Phase 4.

1. **apple-design** from `emilkowalski/skills`: Apple's interface principles from WWDC design talks, translated for the web. Covers response, interruptible motion, springs, materials and translucency, typography, reduced motion, and Apple's eight design principles.
2. **emil-design-eng** from the same repo: general UI polish and correct animation choices.
3. **frontend-design** from `anthropics/skills`: aesthetic direction, typography, and avoiding templated AI-looking design.

### How to install

Try these in order. Stop at the first method that works.

1. `npx skills@latest add emilkowalski/skills --skill apple-design --skill emil-design-eng` (then check where the files landed).
2. Download them directly into the repo:
   - `https://raw.githubusercontent.com/emilkowalski/skills/main/skills/apple-design/SKILL.md` saves to `.claude/skills/apple-design/SKILL.md`
   - `https://raw.githubusercontent.com/emilkowalski/skills/main/skills/emil-design-eng/SKILL.md` saves to `.claude/skills/emil-design-eng/SKILL.md`
   - `https://raw.githubusercontent.com/anthropics/skills/main/skills/frontend-design/SKILL.md` saves to `.claude/skills/frontend-design/SKILL.md`

   If a skill's SKILL.md links to other files in its folder, download those too.
3. If the network blocks both methods, **don't stop.** Log it at the top of `PROGRESS.md` and `MORNING_REPORT.md`, and follow the summary in Section 7 instead.

Commit the installed skill files so future sessions have them.

### Important

Some of these skills say that when first invoked "without a specific question," you should reply only with a one-line greeting and stop. **That does not apply here.** This file is the specific request. Treat the skills as reference material and keep working.

The `prototype` skill in the same repo assumes a choose-then-delete workflow that doesn't fit here, so don't use it. The styles in this project are meant to stay.

### When skills conflict

- The **apple-design** skill governs behavior: how things respond, move, layer, and how type is tuned.
- The **frontend-design** skill governs visual identity: palette, typefaces, layout, and avoiding generic looks.
- Where they conflict on fonts (apple-design favors the system font), let the "Apple" style use the system font stack and let the other styles choose deliberately.

---

## 3. Font licensing

**Never download, bundle, or self-host Apple's SF Pro or New York font files.** Their license doesn't allow it. A CSS system font stack (`system-ui, -apple-system, ...`) is fine, because it uses whatever the visitor's device already has. Any other typeface must be openly licensed and self-hosted in the repo (e.g. via Fontsource). Don't load fonts from third-party servers.

---

## 4. Tech stack

- **Astro** (current stable version) with content collections and a typed schema, so content files are validated at build time with readable errors. Check the current Astro docs for any API you're unsure of, since content collection APIs have changed between versions.
- Project pages use **MDX**, but plain Markdown must work inside them. The owner should be able to write a whole project without using any component.
- **Plain CSS** with design tokens as CSS custom properties. No Tailwind. No React or Vue unless one feature truly needs it.
- **Motion:** CSS for simple state changes. Use the `motion` library only for gesture-driven pieces where the apple-design skill says CSS transitions aren't enough, such as a swipeable gallery or a draggable mobile menu sheet. Keep JavaScript small and load it only where it's used.
- **3D viewer:** Google's `<model-viewer>` web component, loaded only on pages that use it.
- **Images:** Astro's built-in image optimization.
- **Hosting:** GitHub Pages, deployed by the official Astro GitHub Actions workflow on pushes to `main`.
  - Set `site` and `base` in `astro.config` from this repo's actual name. Use `git remote -v` to find the owner and repo.
  - Explain in comments how to change them for a `username.github.io` repo or a custom domain.
  - **Every internal link and asset must be base-path aware.** This is the most common way GitHub Pages sites break, so check it twice.
- No analytics, cookies, or trackers.
- If `npm install` is blocked by the network, still write the full Astro project carefully so the GitHub Actions build (which has internet) can build it. Log this prominently in `MORNING_REPORT.md`.

---

## 5. Content model (this is what makes it expandable)

### Projects: `src/content/projects/<slug>/index.mdx`, with images in the same folder

Validate the frontmatter with a zod schema. Error messages must be in plain English.

| Field | Type | Notes |
|---|---|---|
| `title` | string | required |
| `summary` | string | required; one or two sentences, used on cards and as the meta description |
| `role` | string | e.g. "Design lead" |
| `dates` | string | free text |
| `status` | enum | `in-progress`, `complete`, `ongoing` |
| `featured` | boolean | shows on the homepage |
| `order` | number | lower comes first |
| `tags` | string[] | powers the tag filter |
| `cover` | image | required alt text: `coverAlt` |
| `highlights` | string[] | optional; 2–4 short facts shown in a side panel |
| `models` | list of `{ file, title, caption }` | optional; GLB files for the 3D viewer |
| `links` | list of `{ label, url }` | optional |
| `confidential` | string | optional note shown on the page, e.g. "Specific chemistries are confidential." |
| `draft` | boolean | visible in dev, excluded from production |

### Optional components for project bodies

Each must look right in every style and work with keyboard and touch.

- `<Figure>`: image with caption.
- `<Gallery>`: image grid that opens a lightbox. The lightbox should open from the tapped thumbnail (spatial consistency), close with Esc or a swipe down, track the finger 1:1, and be interruptible, following the apple-design skill.
- `<KeyDecision title>`: the signature block for a major engineering decision. Inside it, the owner writes the options, constraints, analysis, and outcome.
- `<SpecTable>`: a table of numbers with units.
- `<Model3D file title caption>`: 3D viewer with orbit and zoom, a loading state, and a poster-image fallback.
- `<Callout type="note|confidential|todo">`: a highlighted note box.

`[[TODO: ...]]` text anywhere in content must render as a visible highlight, so unfinished content can't slip through unnoticed.

### Updates: `src/content/updates/`

Short dated build-log posts (title, date, optional project, optional image). Include one sample post.

### Site settings: `src/site.config.ts`

One heavily commented file holding:

- name, tagline, "currently looking for" line
- email, LinkedIn, and GitHub links
- nav items
- `style`: the active style
- `showStyleSwitcher`: true or false
- `showUpdates`: true or false

The owner should never need another file to change these.

### Placeholder content

Create content that exercises every feature:

- **Three sample projects** with different shapes:
  - a long flagship that uses every component, including a `KeyDecision` and a 3D model
  - a medium one with a gallery
  - a short draft
- Fictional but engineering-flavored subject matter, e.g. "Sample: bracket redesign." Label everything clearly as sample content.
- Placeholder images: generate tasteful SVG or PNG placeholders, not stock photos.
- A placeholder GLB model: generate a simple machined-looking part with a small script, e.g. Python with `trimesh`. If that isn't possible, use a primitive and log it.
- A `src/content/projects/_template/` folder, excluded from the build, that the owner can copy for new projects.

---

## 6. Pages and navigation

- **Home:** name, one-line tagline, what they're looking for, featured projects, and contact.
  - Open with the most characteristic thing in this world: the hardware itself, as a big image or the 3D model. Don't use a generic text hero.
- **Projects index:** all projects, with a tag filter. Tag pages must work without JavaScript; add JavaScript on top.
- **Project page:** header (title, role, dates, status, highlights), then the body, then previous/next project navigation and a link back to all projects. Clicking through the whole portfolio should feel continuous.
- **About:** bio, education, and skills.
- **Resume:** an HTML resume plus a download button for a PDF placed in `public/resume.pdf`. Hide the button if the file doesn't exist.
- **Updates:** a list of posts; hidden from nav when `showUpdates` is false or there are no posts.
- **404 page.**

Requirements for every page:
- works well on a phone
- respects the user's text size setting
- supports dark and light mode via `prefers-color-scheme`

---

## 7. Styles: build four distinct ones

All styles share the same templates and differ only in token files, plus at most one signature layout detail each.

### The style switcher

- It is **visible on the live site** while `showStyleSwitcher` is true. The owner has no local setup and will compare styles on his phone.
- It remembers the choice (localStorage is fine) and supports a `?style=` URL parameter so a style can be shared as a link.
- When `showStyleSwitcher` is false, the switcher and all non-active style CSS are excluded from the build.
- The switcher is plain, small chrome. It is not part of any style.

### The four directions

These are starting points. Refine them using the skills.

1. **Apple:** the apple-design skill applied fully.
   - Large product-page imagery with generous space.
   - System font stack with size-specific tracking (tight display type, body near 0) and inverse leading.
   - A translucent sticky nav with content scrolling underneath, using a scroll edge effect instead of a hard border.
   - Press feedback on pointer-down.
   - Spring-based, interruptible transitions.
   - Exactly one orchestrated hero moment.
   - **Get the behavior right, not just the look.** Frosted glass plus a big bold headline with dead, linear motion is the common failure. The feel matters more than the blur.
2. **Drawing sheet:** engineering-drawing precision. Title-block details, dimension-line motifs used as real structure, and technical restraint.
3. **Machine shop:** a darker, material feel. Metal and anodized tones used sparingly, a strong industrial typeface, and part-number-style identifiers only where they carry real information.
4. **Quiet editorial:** text-forward and calm. Big images, minimal chrome, and excellent long-form reading for detailed project write-ups.

### Planning each style

Before building each style, write its plan in `docs/STYLES.md`:
- 4–6 named hex colors
- typefaces and their roles
- the layout idea in a sentence or two
- the single memorable element

Then check the plan against the defaults the frontend-design skill warns about, and revise anything generic.

### Every style must

- spend its boldness in one place and keep the rest quiet
- meet WCAG AA contrast in light and dark modes
- show visible keyboard focus
- handle `prefers-reduced-motion` (cross-fades instead of slides and springs), `prefers-reduced-transparency` (solid surfaces instead of blur), and `prefers-contrast: more`
- keep body line length under about 75 characters

### If the skills couldn't be installed

Apply these apple-design principles directly:

- Respond on pointer-down.
- Make motion interruptible: start from the current on-screen value, never from the target.
- Use critically damped springs by default. Allow slight bounce only after a flick or drag.
- Hand off gesture velocity into the animation.
- Open and close things from their origin along the same path.
- Use rubber-band boundaries.
- Use translucent layers only for floating chrome, and never stack translucent on translucent.
- Use size-specific tracking and leading.
- Practice restraint: decide what not to build.

---

## 8. Writing style for interface text and docs

- Plain, specific, sentence case.
- Buttons say exactly what happens ("Download resume PDF").
- No sales words ("passionate", "cutting-edge", "seamless", "robust", "innovative").
- Sample copy should read like a real engineer wrote it: concrete, calm, and specific.

---

## 9. Phases (in order; commit after each task)

**Phase 0: Setup.**
1. Read this file.
2. Install and read the skills (Section 2).
3. Check which tools are available (node, npm, python) and what the network allows.
4. Start `PROGRESS.md`.

**Phase 1: Scaffold.**
1. Set up Astro with MDX, content collections and schemas, `site.config.ts`, and a base layout.
2. Add a `.gitignore`.
3. Add the GitHub Pages deploy workflow.
4. Get `npm run build` passing.

**Phase 2: Templates and components.** Build every page and component from Sections 5 and 6 in a neutral temporary style, using the placeholder content.

**Phase 3: Placeholder content and media.** Write the three sample projects, the template folder, the sample update post, placeholder images, and the placeholder GLB.

**Phase 4: Styles.** Plan, check, and build all four styles plus the switcher (Section 7).

**Phase 5: Quality.**
1. Build with zero errors and warnings.
2. Check for broken internal links, with the base path included.
3. Check alt text, focus states, and contrast for every style in light and dark mode.
4. Test at 375 px wide.
5. Keep the homepage under about 1 MB, excluding the 3D model.
6. If Playwright works in this environment, screenshot the home page and flagship project in every style (desktop and phone, light and dark) into `docs/screenshots/`. Review the screenshots and fix what looks off. Do at least one critique-and-fix pass per style and record the changes in `docs/STYLES.md`.

**Phase 6: Docs for the owner.** Write these in `docs/`, in plain English with no jargon. Wherever a technical term is unavoidable, explain it in one line.
- `HOW_TO_ADD_A_PROJECT.md`: copy the template folder, fill in the fields, and add images. Include a copy-paste example of every component. Explain what common build errors mean and how to edit files on github.com.
- `HOW_TO_CUSTOMIZE.md`: site settings, picking a style, turning off the switcher, and changing colors or fonts within a style.
- `HOW_TO_PUBLISH.md`: enable GitHub Pages (Settings, then Pages, then Source set to "GitHub Actions"), merge to `main`, find the live URL, and optionally add a custom domain later.
- `HOW_TO_ADD_3D_MODELS.md`: turn STL or STEP files into small GLB files. Include a ready-to-run script in `scripts/`.

**Phase 7: Morning report.** Write `MORNING_REPORT.md` at the repo root, under one screen long:
1. How to get the site live: merge, then enable Pages.
2. What was built, and what wasn't and why.
3. The four styles in one line each, plus where the screenshots are.
4. Decisions he might want to change.
5. Suggested next steps.

Make the final commit and push your branch.

---

## 10. Definition of done

- The build passes, and the Pages workflow is ready.
- All pages work, previous/next navigation and tag filtering work, and the site works on a phone.
- All four styles are switchable on the live site, and the switcher can be turned off with one setting.
- Adding a project means copying a folder and editing text, and the docs explain exactly how.
- There is no real personal information anywhere.
- `MORNING_REPORT.md`, `DECISIONS.md`, `PROGRESS.md`, and the docs are complete.

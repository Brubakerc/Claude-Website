# The four styles

All four styles share the same pages and components. Each style is one file in
`src/styles/themes/` that sets colors, fonts, sizes, and corner shapes, plus at most
one signature detail. The shared structure lives in `src/styles/base.css`.

The subject for all four: an engineering student's hardware, shown to recruiters who
skim. Every style opens with the part itself and keeps the reading column under
about 70 characters.

Contrast: every text color below was checked against its background and surface
color in both modes. All pass WCAG AA (4.5:1) for body text.

---

## 1. Apple

**Idea.** A product page for a machined part. The part is the hero, at a size
that makes the machining legible, on generous space. The interface gets out of the
way and behaves physically.

**Colors**

| Name | Light | Dark | Role |
|---|---|---|---|
| Studio white | `#FBFBFD` | `#000000` | page |
| Aluminum | `#F2F2F5` | `#1C1C1E` | panels, image backdrops |
| Graphite | `#1D1D1F` | `#F5F5F7` | text |
| Pewter | `#6E6E73` | `#A1A1A6` | secondary text |
| Signal blue | `#0066CC` | `#2997FF` | links, focus |

**Type.** The system font stack (`system-ui, -apple-system, …`), so Apple devices get
SF Pro with its optical sizes and other devices get their own UI face. No font files
are downloaded. Tracking is set per size: display −0.03em, section titles −0.02em,
body −0.005em, small text +0.005em. Leading runs the other way: 1.05 on display,
1.47 on body.

**Layout.** Centered. The hero image is wider than the text column and runs nearly
edge to edge; the name and tagline sit centered beneath it. Cards are image-first
with no container, shadow, or border.

**Behavior** (from the apple-design skill)
- Translucent sticky menu bar; content scrolls underneath it. No border. A soft
  blurred edge fades in under the bar only once content is actually underneath
  (scroll-driven, CSS only).
- Press feedback on pointer-down (`:active` scale 0.97, 90 ms), released on a
  critically damped spring curve.
- Page changes use a cross-document view transition timed on the same spring; a
  project's image travels from its card into the project page.
- The gallery viewer opens from the tapped thumbnail, tracks the finger 1:1, and
  hands release velocity to a spring (see `src/scripts/lightbox.ts`).

**The one memorable element.** A single orchestrated hero moment on the home page:
the part materializes (blur and scale settle together, like a material arriving),
then the name and tagline follow 80 ms apart. It plays once per page load. With
reduced motion it becomes a plain cross-fade.

**Check against generic defaults.** Risk: "frosted glass, big bold headline, dead
motion." Revised: the headline is semibold, not black weight, and smaller than the
image; motion is spring-timed and interruptible; blur only on the floating menu bar.
Avoided the SaaS card kit: no card boxes or grey shadows.

---

## 2. Drawing sheet

**Idea.** Each page reads like a sheet from a drawing package: a title block that
holds the real project facts, dimension lines that mark real measurements of the
layout, and restraint everywhere else.

**Colors**

| Name | Light (vellum) | Dark (blueprint) | Role |
|---|---|---|---|
| Vellum / Cyanotype | `#F6F7F4` | `#0E2A47` | page |
| Sheet | `#ECEEE9` | `#143458` | panels |
| Lead | `#20242A` | `#E9F0F7` | text, rules |
| Construction | `#5A616B` | `#A9BED3` | secondary text |
| Drafting blue / Ice | `#1D4F91` | `#9CC7F0` | links, dimension lines |
| Redline | `#B42318` | `#FF9B8F` | in-progress status only |

**Type.** Barlow for body text (a low-contrast grotesk drawn from highway signage;
plain and legible). Barlow Condensed for titles and the title block, where
condensed lettering is what drawings use. Uppercase appears only inside the title
block, where drawing convention puts it.

**Layout.** Left-aligned on a ruled sheet. Square corners throughout. Section
headings in long text sit on a dimension line that spans the text column, with
arrowheads at both ends, so the line measures the column it sits over.

**The one memorable element.** The title block on every project page: a ruled grid
of cells (Role, Dates, Status, Sheet n of N, Tags) with small condensed uppercase
labels, like the block in the corner of a drawing.

**Check against generic defaults.** Risk: "broadsheet with hairline rules and zero
radius." That look is what the brief asks for here, so it stays, but rules only
appear where a drawing would have one (title block, dimension lines, the sheet
border). No newspaper columns. The dark mode is a blueprint rather than a
generic dark grey, which ties it to the subject.

---

## 3. Machine shop

**Idea.** The feel of a shop floor: metal surfaces, a heavy industrial typeface,
and identifiers only where they mean something.

**Colors**

| Name | Light (bead-blasted) | Dark (gunmetal) | Role |
|---|---|---|---|
| Gunmetal / Bead blast | `#E4E6E9` | `#1B1E22` | page |
| Machined steel | `#D5D9DE` | `#262A30` | plates, panels |
| Bar stock | `#16191D` | `#D9DDE2` | text |
| Scale | `#4A515A` | `#9BA2AB` | secondary text |
| Anodize blue | `#1B5AA6` | `#5AA5EE` | links, focus |
| Brass | `#6E520C` | `#D0AC4A` | project numbers only |

**Type.** Big Shoulders Display (heavy, condensed, drawn from Chicago's industrial
signage) for the name and titles. IBM Plex Sans for body text, with tabular figures
so numbers line up in spec tables.

**Layout.** Denser than the other styles. Panels are steel plates with a light top
edge, like light catching a chamfer. Cards show a brass project number ("No. 01")
because it's the order you set and matches "Project 1 of 3" on the project page.

**The one memorable element.** The display type: the name on the home page and
project titles are set very large in Big Shoulders at heavy weight, tight.

**Check against generic defaults.** Risk: "near-black with one acid accent." Revised:
the dark is a blue-grey gunmetal, not #111; the accent is a muted anodize blue used
only for links; brass appears only on numbers. No mono font for labels; numbers use
Plex Sans tabular figures instead.

---

## 4. Quiet editorial

**Idea.** A long-form magazine feature about a project. Text first, large images,
almost no chrome. Made for reading a detailed write-up start to finish.

**Colors**

| Name | Light | Dark | Role |
|---|---|---|---|
| Paper | `#FCFCFB` | `#16181A` | page |
| Wash | `#F2F3F2` | `#202326` | panels |
| Ink | `#1A1C1E` | `#E8E6E2` | text |
| Graphite | `#585D64` | `#A5A9AE` | captions, secondary text |
| Spruce | `#2B5C4D` | `#8CC7B3` | links |

**Type.** Newsreader for everything: a text serif with optical sizes, so the same
family works for 5 rem titles and 1.19 rem body. Body at 1.65 leading (serif text
needs a little more). Captions in italic.

**Layout.** One centered text column of about 64 characters. The menu is plain text
with no bar. Figures, galleries, and models step out wider than the text.

**The one memorable element.** Project cover images run full-bleed, edge to edge,
between the standfirst and the text, with nothing on top of them.

**Check against generic defaults.** Risk: "cream background, high-contrast serif,
terracotta accent." Revised: the paper is a near-white with no warm cast, the serif
is a text face (not a fashion display face), and the accent is a dark spruce green
used only for links. No drop caps, no pull quotes.

---

## Shared rules (every style)

- Visible keyboard focus: a 2 px outline in the style's link color (3 px with
  increased contrast).
- `prefers-reduced-motion`: press scaling and the image fly-in are dropped; page
  changes and the gallery viewer cross-fade.
- `prefers-reduced-transparency`: the menu bar becomes solid.
- `prefers-contrast: more`: secondary text becomes full-strength text, panels get a
  solid border.
- `[[TODO]]` highlights look the same in every style, on purpose.

## Critique-and-fix log

Filled in during the screenshot review (Phase 5).

# How to customize the site

Almost everything you'll want to change is in one file: `src/site.config.ts`.

## Site settings

Open `src/site.config.ts` (on github.com: open the file, click the pencil icon).
Each setting has a note above it. Change the text between the quotes and commit.

| Setting | What it changes |
|---|---|
| `name` | Your name, at the top of every page and in browser tabs. |
| `tagline` | The line under your name on the home page. |
| `lookingFor` | What you're looking for, e.g. an internship. `""` hides it. |
| `email`, `linkedin`, `github` | Contact links. `""` hides a link. |
| `nav` | The menu. Each item has a `label` (what it says) and an `href` (the page). |
| `style` | Which of the four styles the site uses. |
| `showStyleSwitcher` | `true` shows the style picker in the corner; `false` hides it. |
| `showUpdates` | `true` shows the Updates page; `false` hides it and its menu item. |

`true` and `false` are written without quotes. Text always has quotes.

## Picking a style

While `showStyleSwitcher` is `true`, a small "Style" picker sits in the bottom-right
corner of every page. Choose a style and the site switches right away. The browser
remembers your choice, and the page address gets `?style=…` added, so you can send
someone a link that opens in that style:

- `…/Claude-Website/?style=apple`
- `…/Claude-Website/?style=drawing`
- `…/Claude-Website/?style=shop`
- `…/Claude-Website/?style=editorial`

Once you've decided, set `style` to your choice in `src/site.config.ts`.

Screenshots of every style, on desktop and phone, in light and dark mode, are in
`docs/screenshots/`. `docs/STYLES.md` explains the thinking behind each one.

## Turning off the switcher

Set `showStyleSwitcher: false`. The picker disappears, and the other three styles
are left out of the site entirely, so pages load a little faster. Visitors see only
the style named in `style`.

## Changing colors

Each style is one file in `src/styles/themes/`:

| Style | File |
|---|---|
| Apple | `apple.css` |
| Drawing sheet | `drawing.css` |
| Machine shop | `shop.css` |
| Quiet editorial | `editorial.css` |

Near the top of each file are two blocks of color settings: the first for light mode,
the second (inside `@media (prefers-color-scheme: dark)`) for dark mode. The site
follows the visitor's phone or computer setting for light and dark.

```css
--bg: #fbfbfd;      /* page background */
--surface: #f2f2f5; /* panels and image backdrops */
--text: #1d1d1f;    /* main text */
--muted: #6e6e73;   /* captions and secondary text */
--link: #0066cc;    /* links */
--accent: #0066cc;  /* buttons, focus outlines, small highlights */
```

Colors are hex codes: `#` plus six characters. Any color picker shows them. After
changing a text color, check it's still easy to read against the background; a
"contrast checker" website will tell you. Aim for a ratio of at least 4.5.

## Changing fonts

Fonts are set in the same theme files:

```css
--font-body: "Barlow", Arial, sans-serif;        /* paragraphs */
--font-display: "Barlow Condensed", sans-serif;  /* headings */
```

The fonts are stored with the site (not loaded from Google), which keeps the site
private and fast. To use a different font from [Fontsource](https://fontsource.org)
(free fonts, open licenses):

1. Find the font on fontsource.org and note its package name, e.g. `@fontsource/inter`.
2. Add it to `package.json` under `"dependencies"`, like the other `@fontsource` lines:
   `"@fontsource/inter": "^5.0.0",`
3. At the top of the theme file, add one import per weight you use, e.g.
   `@import "@fontsource/inter/400.css";` and `@import "@fontsource/inter/600.css";`
4. Change `--font-body` or `--font-display` to `"Inter", sans-serif`.

The Apple style uses the device's own system font on purpose, so it downloads no
font files. (Apple's SF Pro font can't legally be bundled with a website.)

## Sizes and spacing

Also in the theme files. `--display-size` is the big name and project titles,
`--h1-size` the page titles, `--h2-size` the section headings, `--body-size` the
paragraphs. Sizes use `rem`, which is relative to the visitor's text-size setting,
so the site gets bigger for people who've turned up the text size on their phone.

## Changing the About and Resume pages

Edit `src/pages/about.md` and `src/pages/resume.md`. They're plain Markdown (see
`HOW_TO_ADD_A_PROJECT.md` for the basics).

To show a "Download resume PDF" button on the Resume page, upload your PDF to the
`public` folder and name it exactly `resume.pdf`. The button appears on the next
build. Delete the file and the button goes away.

## Posting an update

Updates are short dated notes, like a build log. Add a file to `src/content/updates/`,
e.g. `2027-02-03-first-cut.md`:

```md
---
title: "First cut on the new fixture"
date: 2027-02-03
project: rover-suspension   # optional: the project folder this is about
image: ./2027-02-first-cut.jpg   # optional, in the same folder
imageAlt: "The fixture clamped in the mill vise."
---

Two or three sentences about what happened.
```

## Linking to your own pages from text

The site lives in a folder (`/Claude-Website/`) on GitHub Pages, so links in Markdown
must include it: `[my projects](/Claude-Website/projects/)`. Links to other websites
work as normal. Menu items in `site.config.ts` don't need the folder; it's added
for you.

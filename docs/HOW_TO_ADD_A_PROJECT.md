# How to add a project

Each project is one folder inside `src/content/projects/`. The folder holds a text
file called `index.mdx` and the project's images and 3D models. To add a project,
copy the template folder, rename it, and fill in the text.

## Quick version

1. Copy `src/content/projects/_template/` and rename the copy, e.g. `rover-suspension`.
2. Replace `cover.jpg` in the new folder with your own cover image.
3. Open `index.mdx` and fill in the lines at the top.
4. Write the project below the second `---` line.
5. Change `draft: true` to `draft: false` when it's ready to go live.

The folder name becomes the page address: `rover-suspension` shows up at
`/projects/rover-suspension/`. Use lowercase letters, numbers, and dashes. Folders
starting with `_` are ignored, which is why `_template` never appears on the site.

## Doing it on github.com

GitHub's website can't copy a folder in one step, so you make new files in a new
folder:

1. Open `src/content/projects/_template/index.mdx` and copy all of its text.
2. Go back to `src/content/projects/`, click **Add file**, then **Create new file**.
3. In the name box, type `rover-suspension/index.mdx`. Typing the `/` creates the folder.
4. Paste the template text, edit it, and click **Commit changes**.
5. Open the new folder, click **Add file**, then **Upload files**, and drag in your
   cover image and any other images. Commit.

Every commit to `main` rebuilds the live site in about two minutes. You can watch it
in the **Actions** tab: a green check means it worked, a red X means the build
stopped (see "When the build fails" below).

## The settings at the top

The block between the two `---` lines is called frontmatter: settings written as
`name: value`, one per line. Text goes in quotes.

```yaml
---
title: "Rover suspension"
summary: "Designed and tested a rocker-bogie suspension for a 30 kg rover. Climbed a 20 cm step."
cover: ./cover.jpg
coverAlt: "Aluminum rocker-bogie suspension on a test track, seen from the side."
role: "Suspension lead"
dates: "Jan–May 2027"
status: complete
featured: true
order: 1
tags: ["CAD", "FEA", "Testing"]
highlights:
  - "Climbed a 20 cm step at full payload"
  - "1.4 kg under the mass budget"
links:
  - label: "Source files on GitHub"
    url: "https://github.com/your-username/rover"
confidential: "Supplier names are confidential."
draft: false
---
```

| Setting | Needed? | What it does |
|---|---|---|
| `title` | yes | The project's name. |
| `summary` | yes | One or two sentences. Shows on cards and in search results. |
| `cover` | yes | The main image, a file in the same folder: `./cover.jpg`. |
| `coverAlt` | yes | Describes the cover for people using screen readers. |
| `role` | no | Your role, e.g. "Design lead". |
| `dates` | no | Free text, e.g. "Fall 2026" or "Jan–May 2027". |
| `status` | no | `in-progress`, `complete` (default), or `ongoing`. |
| `featured` | no | `true` puts it on the home page. The first featured project is the big home-page image. |
| `order` | no | A number. Lower comes first on every list. |
| `tags` | no | A list in square brackets. Each tag gets its own filter page. |
| `highlights` | no | 2 to 4 short facts, shown in a panel beside the project details. |
| `models` | no | 3D models to show at the end. See below. |
| `links` | no | Links shown at the end (code, reports, videos). |
| `confidential` | no | A note shown at the top, e.g. what you had to leave out. |
| `draft` | no | `true` hides the project from the live site. It still shows when you preview on your own computer. |

## Writing the project

Below the frontmatter, write in Markdown. Markdown is plain text with a few marks
for formatting:

```md
## A section heading

A paragraph. Leave a blank line between paragraphs.

**Bold text** and *italic text*.

- A bullet point
- Another one

1. A numbered step
2. The next step

[A link](https://example.com)

![Describe the image](./photo.jpg)
```

Use `##` for section headings and `###` for smaller ones. (The project title is
already the biggest heading on the page.)

Put images in the project folder and refer to them with `./` and the file name.
Names are case-sensitive: `Photo.JPG` and `photo.jpg` are different files. The site
resizes and compresses images automatically, so upload full-size photos.

### Unfinished parts

Write `[[TODO: what's missing]]` anywhere and it shows up highlighted in yellow on
the page, so you won't forget it. Search the folder for `TODO` before you publish.

## Building blocks

These are optional. You can write a whole project without any of them. Copy and
paste the examples. Keep the blank lines: they tell the site where the Markdown
inside a block starts and ends.

### Figure: an image with a caption

```mdx
<Figure caption="The bracket after 10,000 cycles. Note the fretting at the bolt.">

![Close-up of a bracket with wear marks around the bolt hole.](./after-test.jpg)

</Figure>
```

### Gallery: a grid of images that opens full-screen

Tap an image to open it. Swipe down, press Esc, or tap outside it to close. The text
in quotes after the file name is an optional caption.

```mdx
<Gallery>

![Front view of the prototype.](./front.jpg "Prototype 1, front")
![Side view of the prototype.](./side.jpg "Prototype 1, side")
![The final part on the test stand.](./final.jpg)

</Gallery>
```

### KeyDecision: a major engineering decision

The block for showing how you think. Write the options, constraints, analysis, and
outcome inside it.

```mdx
<KeyDecision title="Bearing arrangement">

### Options

1. Two deep-groove ball bearings
2. A tapered roller pair

### Constraints

- Axial load up to 400 N during braking.
- 25 mm of length available.

### Analysis

Rated life at the design load: 2,100 h for the ball pair, 9,800 h for the tapered
pair. The tapered pair needs preload set at assembly.

### Outcome

Tapered roller pair, with a shim pack for preload.

</KeyDecision>
```

### SpecTable: numbers with units

A normal Markdown table inside the block. Use three columns: quantity, value, unit.
Values line up on the right.

```mdx
<SpecTable caption="Measured results">

| Quantity | Value | Unit |
|---|---|---|
| Mass | 412 | g |
| Peak torque | 38 | N·m |
| First natural frequency | 184 | Hz |

</SpecTable>
```

### Model3D: a 3D model you can rotate

Put the `.glb` file in the project folder. See `HOW_TO_ADD_3D_MODELS.md` to convert
STL or STEP files. The cover image shows while the model loads.

```mdx
<Model3D file="./housing.glb" title="Gearbox housing" caption="Rev C, 6061-T6." />
```

Or list models in the frontmatter and they appear at the end of the page:

```yaml
models:
  - file: ./housing.glb
    title: "Gearbox housing"
    caption: "Rev C, 6061-T6."
```

### Callout: a highlighted note

`type` is `note`, `confidential`, or `todo`.

```mdx
<Callout type="note">
Rev B was anodized before we caught the shallow groove. Check groove depth first.
</Callout>
```

## When the build fails

If the Actions tab shows a red X, click it, then click **build**, then the **Build**
step. The error is near the bottom. Common ones:

| The error says | What it means | Fix |
|---|---|---|
| `"title" is missing` (or `summary`, `cover`, `coverAlt`) | A required setting is missing or misspelled. | Add the line. Check spelling and the colon. |
| `"status" must be exactly one of…` | `status` has a value the site doesn't know. | Use `in-progress`, `complete`, or `ongoing`. |
| `"featured" must be true or false` | `featured: "true"` has quotes. | Write `featured: true` with no quotes. |
| `Could not find requested image ./cover.jpg` | The image isn't in the folder, or the name doesn't match. | Upload it, and check capital letters and the extension (`.jpg` vs `.jpeg`). |
| `<Model3D file="…"> couldn't find that file` | The `.glb` file isn't in the project folder. | Upload it next to `index.mdx`. |
| `Expected a closing tag for <Gallery>` | A block was opened but not closed. | Add `</Gallery>` (or whichever block) on its own line. |
| `Unexpected character` or `Could not parse expression` | MDX treats `{`, `}`, and `<` as code. | Write them as `\{`, `\}`, and `&lt;` in plain text. |
| `YAMLException` or `bad indentation` | The frontmatter's spacing is off. | List items start with two spaces and a dash: `  - "text"`. Text with a colon in it needs quotes. |

The error also names the file, so you know which project to look at.

## Removing a project

Delete its folder. Or set `draft: true` to hide it without deleting anything.

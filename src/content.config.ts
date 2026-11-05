// Defines what each project and update file must contain.
// When a file is missing something, the build stops and prints one of the
// messages below, so they are written to tell you exactly what to fix.
import { defineCollection, reference, z } from "astro:content";
import { glob } from "astro/loaders";

const text = (field: string, example: string) =>
  z
    .string({ message: `"${field}" is missing or isn't text. Add a line like: ${field}: "${example}"` })
    .min(1, `"${field}" is empty. Write something between the quotes, e.g. ${field}: "${example}"`);

const projects = defineCollection({
  // One folder per project: src/content/projects/<folder>/index.mdx
  // Folders starting with "_" (like _template) are ignored.
  loader: glob({
    pattern: "[^_]*/index.{md,mdx}",
    base: "./src/content/projects",
    // The folder name becomes the page address: /projects/<folder>/
    generateId: ({ entry }) => entry.split("/")[0],
  }),
  schema: ({ image }) =>
    z.object({
      title: text("title", "Bracket redesign"),
      summary: text("summary", "Redesigned a sheet-metal bracket to cut mass by 30%.").max(
        300,
        `"summary" is longer than 300 characters. Keep it to one or two sentences; it shows on project cards and in search results.`,
      ),
      role: z.string({ message: `"role" should be text in quotes, e.g. role: "Design lead"` }).optional(),
      dates: z.string({ message: `"dates" should be text in quotes, e.g. dates: "Jan–May 2026"` }).optional(),
      status: z
        .enum(["in-progress", "complete", "ongoing"], {
          message: `"status" must be exactly one of: in-progress, complete, ongoing.`,
        })
        .default("complete"),
      featured: z
        .boolean({ message: `"featured" must be true or false, without quotes.` })
        .default(false),
      order: z
        .number({ message: `"order" must be a number without quotes, e.g. order: 2. Lower numbers come first.` })
        .default(100),
      tags: z
        .array(z.string(), { message: `"tags" must be a list, e.g. tags: ["CAD", "Testing"]` })
        .default([]),
      cover: image(),
      coverAlt: text("coverAlt", "Machined aluminum bracket on a workbench"),
      highlights: z
        .array(z.string(), { message: `"highlights" must be a list of short facts, e.g. highlights: ["30% lighter", "Passed 10k-cycle test"]` })
        .max(4, `"highlights" has more than 4 items. Keep the 2–4 that matter most.`)
        .optional(),
      models: z
        .array(
          z.object({
            file: z
              .string({ message: `Each 3D model needs a file, e.g. file: "./part.glb"` })
              .regex(/\.glb$/i, `3D model files must be .glb files. See docs/HOW_TO_ADD_3D_MODELS.md to convert STL or STEP.`),
            title: text("title", "Output hub"),
            caption: z.string().optional(),
          }),
          { message: `"models" must be a list. See docs/HOW_TO_ADD_A_PROJECT.md for an example.` },
        )
        .optional(),
      links: z
        .array(
          z.object({
            label: text("label", "Source files on GitHub"),
            url: text("url", "https://github.com/your-username/your-repo"),
          }),
          { message: `"links" must be a list. See docs/HOW_TO_ADD_A_PROJECT.md for an example.` },
        )
        .optional(),
      confidential: z.string().optional(),
      draft: z
        .boolean({ message: `"draft" must be true or false, without quotes.` })
        .default(false),
    }),
});

const updates = defineCollection({
  // One file per post: src/content/updates/<anything>.md
  loader: glob({ pattern: "[^_]*.{md,mdx}", base: "./src/content/updates" }),
  schema: ({ image }) =>
    z.object({
      title: text("title", "First test print"),
      date: z.coerce.date({ message: `"date" must be a date like 2026-10-12 (year-month-day).` }),
      // Optional: the folder name of the project this post is about.
      project: reference("projects").optional(),
      image: image().optional(),
      imageAlt: z.string().optional(),
    }),
});

export const collections = { projects, updates };

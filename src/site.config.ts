// ─────────────────────────────────────────────────────────────────────────────
//  SITE SETTINGS
//
//  This is the one file to edit for your name, contact links, menu, and look.
//  You can edit it on github.com: open the file, click the pencil icon, change
//  the text between the quotes, then click "Commit changes".
//
//  Rules that keep the site building:
//  - Keep the quotes around text: name: "Jordan Lee",
//  - Keep the comma at the end of each line.
//  - Lines starting with // are notes for you. The website ignores them.
// ─────────────────────────────────────────────────────────────────────────────

const site = {
  // Your name as it appears at the top of every page and in browser tabs.
  name: "Your Name",

  // One line under your name on the home page. Say what you build.
  tagline: "Mechanical engineering student. I design, build, and test hardware.",

  // What you're looking for right now. Shown on the home page.
  // Leave it empty ("") to hide it.
  lookingFor: "Looking for a summer 2027 internship in mechanical design or test engineering.",

  // Contact links. Leave any of them empty ("") to hide that link.
  email: "you@example.com",
  linkedin: "https://www.linkedin.com/in/your-profile",
  github: "https://github.com/your-username",

  // The menu at the top of every page.
  // "href" is the page address without the site's base path.
  // The Updates item hides itself when showUpdates is false or there are no posts.
  nav: [
    { label: "Projects", href: "projects/" },
    { label: "About", href: "about/" },
    { label: "Resume", href: "resume/" },
    { label: "Updates", href: "updates/" },
  ],

  // The visual style. One of:
  //   "apple"      Big product imagery, system font, soft glass menu bar
  //   "drawing"    Engineering drawing sheet: title blocks and dimension lines
  //   "shop"       Machine shop: dark metal, industrial type
  //   "editorial"  Quiet, text-first, made for long write-ups
  style: "apple",

  // true: shows a small style picker in the corner of every page, so you can
  // compare styles on your phone. Visitors see it too.
  // false: hides the picker and leaves the other styles out of the site entirely.
  showStyleSwitcher: true,

  // true: shows the Updates page (your short build-log posts).
  // false: hides the page and its menu item.
  showUpdates: true,
} as const;

// ─── You don't need to edit below this line. ─────────────────────────────────

export type StyleName = "apple" | "drawing" | "shop" | "editorial";

// Names shown in the style picker.
export const styles: Record<StyleName, string> = {
  apple: "Apple",
  drawing: "Drawing sheet",
  shop: "Machine shop",
  editorial: "Quiet editorial",
};

if (!(site.style in styles)) {
  throw new Error(
    `In src/site.config.ts, style is "${site.style}", which isn't a style this site has. ` +
      `Use one of: ${Object.keys(styles).map((s) => `"${s}"`).join(", ")}.`,
  );
}

export default site as Omit<typeof site, "style"> & { style: StyleName };

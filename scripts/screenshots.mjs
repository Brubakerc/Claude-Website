// Takes screenshots of the home page and the flagship project in every style,
// on desktop and phone, in light and dark mode. Used by the "Screenshots" workflow.
//   SITE_URL=http://localhost:4321/Claude-Website/ node scripts/screenshots.mjs
import { chromium } from "playwright";
import fs from "node:fs";

const site = process.env.SITE_URL ?? "http://localhost:4321/Claude-Website/";
const out = "docs/screenshots";
const pages = { home: "", project: "projects/sample-gearbox-output-hub/", projects: "projects/" };
const styles = ["apple", "drawing", "shop", "editorial"];
const devices = {
  desktop: { viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 },
  phone: { viewport: { width: 375, height: 812 }, deviceScaleFactor: 2, isMobile: true, hasTouch: true },
};

fs.mkdirSync(out, { recursive: true });
const browser = await chromium.launch();
for (const [device, options] of Object.entries(devices)) {
  for (const scheme of ["light", "dark"]) {
    const context = await browser.newContext({ ...options, colorScheme: scheme });
    const page = await context.newPage();
    for (const style of styles) {
      for (const [name, path] of Object.entries(pages)) {
        if (name === "projects" && device === "phone") continue;
        await page.goto(`${site}${path}?style=${style}`, { waitUntil: "networkidle" });
        // Scroll through the page so lazy-loaded images load, then wait for all of them.
        await page.evaluate(async () => {
          for (let y = 0; y < document.body.scrollHeight; y += innerHeight / 2) {
            scrollTo(0, y);
            await new Promise((r) => setTimeout(r, 120));
          }
          scrollTo(0, 0);
          await Promise.all([...document.images].map((img) => img.complete || new Promise((r) => (img.onload = img.onerror = r))));
        });
        await page.waitForTimeout(1500); // let the hero animation finish
        if (name === "project") {
          await page.locator("model-viewer").scrollIntoViewIfNeeded();
          await page.waitForSelector("model-viewer[data-loaded]", { timeout: 15000 }).catch(() => {});
          await page.evaluate(() => window.scrollTo(0, 0));
          await page.waitForTimeout(400);
        }
        const file = `${out}/${style}-${name}-${device}-${scheme}.jpg`;
        await page.screenshot({ path: file, fullPage: true, type: "jpeg", quality: 70 });
        console.log(file);
      }
    }
    await context.close();
  }
}
await browser.close();

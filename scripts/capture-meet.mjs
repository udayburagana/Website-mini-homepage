import { chromium } from "@playwright/test";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto("http://127.0.0.1:5173/?persona=visionary");
const section = page.locator("[data-meet-ezrewards]");

for (const [name, progress] of [["recognition", .16], ["rewards", .49], ["insight", .8]]) {
  await section.evaluate((node, value) => {
    const header = document.querySelector(".site-header")?.offsetHeight || 76;
    scrollTo(0, node.offsetTop - header + innerHeight * 2.4 * value);
  }, progress);
  await page.waitForTimeout(450);
  await page.screenshot({ path: `docs/qa/meet-${name}-desktop.png` });
}

await page.setViewportSize({ width: 768, height: 1024 });
await page.reload();
await section.evaluate((node) => scrollTo(0, node.offsetTop));
await page.waitForTimeout(350);
await page.screenshot({ path: "docs/qa/meet-tablet.png" });

await page.setViewportSize({ width: 390, height: 844 });
await page.reload();
await section.evaluate((node) => scrollTo(0, node.offsetTop));
await page.waitForTimeout(250);
await page.screenshot({ path: "docs/qa/meet-mobile.png" });

await page.emulateMedia({ reducedMotion: "reduce" });
await page.setViewportSize({ width: 1440, height: 900 });
await page.reload();
await section.evaluate((node) => scrollTo(0, node.offsetTop));
await page.waitForTimeout(200);
await page.screenshot({ path: "docs/qa/meet-reduced-motion.png" });

await browser.close();

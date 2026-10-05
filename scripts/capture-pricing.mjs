import { chromium } from "playwright";
import { tmpdir } from "node:os";
import { join } from "node:path";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 1200 }, deviceScaleFactor: 1 });
await page.goto("http://127.0.0.1:4174/?persona=visionary");
const section = page.locator("[data-pricing-reveal]");
await section.evaluate((node) => {
  document.activeElement?.blur();
  scrollTo(0, node.offsetTop - document.querySelector(".site-header").offsetHeight);
});
await section.waitFor({ state: "visible" });
await page.waitForFunction(() => document.querySelector("[data-pricing-reveal]")?.dataset.pricingState === "complete");
const file = join(tmpdir(), "ezrewards-pricing-complete.png");
await page.screenshot({ path: file });
console.log(file);
await browser.close();

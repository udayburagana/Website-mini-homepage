import { chromium } from "playwright";
import { tmpdir } from "node:os";
import { join } from "node:path";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto("http://127.0.0.1:4174/?persona=visionary");
await page.waitForSelector('[data-culture-sphere][data-sphere-mode="pinned"]');
await page.evaluate(() => {
  const section = document.querySelector("[data-culture-sphere]");
  const pin = section.querySelector(".cinematic-culture__pin");
  const header = document.querySelector(".site-header").offsetHeight;
  scrollTo(0, section.offsetTop - header + (section.offsetHeight - pin.offsetHeight) * .9);
});
await page.waitForTimeout(900);
const file = join(tmpdir(), "ezrewards-culture-company.png");
await page.locator(".cinematic-culture__pin").screenshot({ path: file });
console.log(file);
await browser.close();

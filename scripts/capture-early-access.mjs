import { chromium } from "playwright";
import { tmpdir } from "node:os";
import { join } from "node:path";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto("http://127.0.0.1:4174/?persona=visionary");
await page.waitForSelector('[data-early-access][data-early-access-mode="pinned"]');
async function capture(progress, name) {
  await page.evaluate((amount) => {
    const section = document.querySelector("[data-early-access]");
    const pin = section.querySelector(".cinematic-early__pin");
    const header = document.querySelector(".site-header").offsetHeight;
    scrollTo(0, section.offsetTop - header + (section.offsetHeight - pin.offsetHeight) * amount);
  }, progress);
  await page.waitForTimeout(750);
  const file = join(tmpdir(), `ezrewards-early-access-${name}.png`);
  await page.locator(".cinematic-early__pin").screenshot({ path: file });
  console.log(file);
}
await capture(.59, "third-benefit");
await capture(.94, "complete");
await browser.close();

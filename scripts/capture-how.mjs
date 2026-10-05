// Captures Section 04 QA previews. Run `node tests/server.mjs` (port 4174) first.
import { chromium } from "@playwright/test";

const base = process.env.BASE_URL || "http://127.0.0.1:4174";
const out = process.env.OUT_DIR || "docs/qa";
const browser = await chromium.launch({ headless: true, args: ["--use-angle=swiftshader", "--enable-unsafe-swiftshader"] });

async function open(viewport, { reducedMotion = "no-preference", blockWebgl = false } = {}) {
  const context = await browser.newContext({ viewport, deviceScaleFactor: 1, reducedMotion });
  const page = await context.newPage();
  page.on("console", (message) => { if (message.type() === "error") console.log(`[console] ${message.text()}`); });
  page.on("pageerror", (error) => console.log(`[pageerror] ${error.message}`));
  if (blockWebgl) {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function patched(type, ...args) {
        return String(type).startsWith("webgl") ? null : original.call(this, type, ...args);
      };
    });
  }
  await page.goto(`${base}/?persona=visionary`);
  return { context, page, section: page.locator("[data-how-it-works]") };
}

async function scrollToProgress(page, progress) {
  await page.evaluate((value) => {
    const section = document.querySelector("[data-how-it-works]");
    const pin = section.querySelector(".cinematic-how__pin");
    const header = document.querySelector(".site-header")?.offsetHeight || 76;
    const top = section.getBoundingClientRect().top + scrollY - header;
    scrollTo(0, top + (section.offsetHeight - pin.offsetHeight) * value);
  }, progress);
}

const desktop = await open({ width: 1440, height: 900 });
for (const [name, progress] of [["notice", .09], ["recognize", .31], ["celebrate", .51], ["reward", .71], ["learn", .89], ["complete", .98]]) {
  await scrollToProgress(desktop.page, progress);
  await desktop.page.waitForTimeout(1800);
  const state = await desktop.section.evaluate((node) => ({ ...node.dataset }));
  console.log(name, JSON.stringify(state));
  await desktop.page.screenshot({ path: `${out}/how-${name}-desktop.png` });
}
await desktop.context.close();

for (const [name, viewport, options] of [
  ["tablet", { width: 768, height: 1024 }, {}],
  ["mobile", { width: 390, height: 844 }, {}],
  ["reduced-motion", { width: 1440, height: 900 }, { reducedMotion: "reduce" }],
]) {
  const { context, page, section } = await open(viewport, options);
  await section.evaluate((node) => scrollTo(0, node.getBoundingClientRect().top + scrollY - 40));
  await page.waitForTimeout(900);
  console.log(name, JSON.stringify(await section.evaluate((node) => ({ ...node.dataset }))));
  await section.screenshot({ path: `${out}/how-${name}.png` });
  await context.close();
}

const fallback = await open({ width: 1440, height: 900 }, { blockWebgl: true });
await scrollToProgress(fallback.page, .51);
await fallback.page.waitForTimeout(900);
console.log("svg-fallback", JSON.stringify(await fallback.section.evaluate((node) => ({ ...node.dataset }))));
await fallback.page.screenshot({ path: `${out}/how-svg-fallback.png` });
await fallback.context.close();

await browser.close();

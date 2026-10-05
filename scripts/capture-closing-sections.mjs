import { chromium } from "playwright";

const browser = await chromium.launch({ headless: true });
const page = await browser.newPage({ viewport: { width: 1440, height: 900 }, deviceScaleFactor: 1 });
await page.goto("http://127.0.0.1:5173/?persona=visionary", { waitUntil: "networkidle" });

const faq = page.locator("[data-faq-motion]");
await faq.locator("summary").first().click();
await page.waitForTimeout(350);
await faq.screenshot({ path: "docs/qa/closing-faq-open.png" });

const finalCta = page.locator("[data-final-cta]");
await finalCta.evaluate((node) => scrollTo(0, node.offsetTop + (node.offsetHeight - innerHeight) * .9));
await page.waitForTimeout(350);
await page.screenshot({ path: "docs/qa/closing-final-cta.png" });

const footer = page.locator("[data-cinematic-footer]");
await footer.scrollIntoViewIfNeeded();
await page.waitForTimeout(450);
await page.screenshot({ path: "docs/qa/closing-footer-desktop.png" });

await page.setViewportSize({ width: 390, height: 844 });
await page.reload({ waitUntil: "networkidle" });
await page.locator("[data-cinematic-footer]").scrollIntoViewIfNeeded();
await page.waitForTimeout(350);
await page.screenshot({ path: "docs/qa/closing-footer-mobile.png" });
await page.locator("[data-cinematic-footer]").screenshot({ path: "docs/qa/closing-footer-mobile-isolated.png" });

await browser.close();

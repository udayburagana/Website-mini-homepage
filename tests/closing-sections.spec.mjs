import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const faq = (page) => page.locator("[data-faq-motion]");
const finalCta = (page) => page.locator("[data-final-cta]");
const footer = (page) => page.locator("[data-cinematic-footer]");

test("animates independent native FAQ disclosures and preserves keyboard operation", async ({ page }) => {
  await page.goto("/?persona=visionary");
  const items = faq(page).locator("[data-faq-item]");
  await expect(items).toHaveCount(9);
  const first = items.nth(0), second = items.nth(1);
  await first.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(first).toHaveAttribute("open", "");
  await expect(first).toHaveAttribute("data-faq-state", "open", { timeout: 1500 });
  await second.locator("summary").click();
  await expect(second).toHaveAttribute("data-faq-state", "open", { timeout: 1500 });
  await expect(first).toHaveAttribute("open", "");
  await first.locator("summary").click();
  await expect(first).not.toHaveAttribute("open", "", { timeout: 1500 });
});

test("provides static FAQ and final CTA behavior for reduced motion", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?persona=visionary");
  const first = faq(page).locator("[data-faq-item]").first();
  await first.locator("summary").click();
  await expect(first).toHaveAttribute("data-faq-state", "open");
  await expect(finalCta(page)).toHaveAttribute("data-final-cta-mode", "static");
  await expect(finalCta(page)).toHaveAttribute("data-final-cta-progress", "1.000");
  await expect(finalCta(page).getByRole("link", { name: "Join the Waitlist" })).not.toHaveAttribute("inert", "");
});

test("uses the full particle close and exposes the completed CTA", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?persona=visionary");
  const section = finalCta(page);
  await expect(section).toHaveAttribute("data-final-cta-mode", "pinned");
  await section.evaluate((node) => scrollTo(0, node.offsetTop + node.offsetHeight));
  await page.waitForTimeout(250);
  expect(Number(await section.getAttribute("data-final-cta-progress"))).toBeGreaterThan(.8);
  await expect(section.getByRole("link", { name: "Join the Waitlist" })).toHaveAttribute("href", "/contact");
  await expect(section.getByText("EzRewards — Seen. Valued. Rewarded.", { exact: true })).toBeVisible();
});

test("art-directs the cinematic footer only for Visionary", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?persona=visionary");
  const cinematicFooter = footer(page);
  await cinematicFooter.scrollIntoViewIfNeeded();
  await expect(cinematicFooter).toHaveAttribute("data-footer-state", "visible");
  const visionaryHeight = await cinematicFooter.evaluate((node) => node.getBoundingClientRect().height);
  expect(visionaryHeight).toBeGreaterThanOrEqual(720);
  await expect(cinematicFooter.locator(".cinematic-footer__media img")).toHaveAttribute("loading", "lazy");

  await page.goto("/?persona=strategist");
  const regularHeight = await footer(page).evaluate((node) => node.getBoundingClientRect().height);
  expect(regularHeight).toBeLessThan(720);
  await expect(footer(page).locator(".cinematic-footer__media")).toHaveCSS("display", "none");
});

for (const [width, height] of [[320,568],[390,844],[667,375],[768,1024],[1024,768],[1280,720],[1440,900],[1920,1080]]) {
  test(`closing sections fit at ${width}x${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/?persona=visionary");
    await footer(page).scrollIntoViewIfNeeded();
    const geometry = await page.evaluate(() => ({ scrollWidth: document.documentElement.scrollWidth, viewport: innerWidth }));
    expect(geometry.scrollWidth).toBeLessThanOrEqual(geometry.viewport);
    await expect(finalCta(page).getByRole("link", { name: "Join the Waitlist" })).toBeAttached();
    await expect(footer(page).getByRole("link", { name: "Join Waitlist" })).toBeVisible();
  });
}

test("closing sections have no serious accessibility violations", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?persona=visionary");
  const results = await new AxeBuilder({ page }).include("[data-faq-motion]").include("[data-final-cta]").include("[data-cinematic-footer]").analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact))).toEqual([]);
});

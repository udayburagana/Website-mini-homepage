import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const features = [
  "Peer-to-peer recognition",
  "Company recognition feed",
  "AI-assisted recognition messages",
  "Reactions and comments",
  "Reward catalogue",
  "Individual and bulk reward assignment",
  "Microsoft SSO and CSV onboarding",
  "Role-based administration",
  "Recognition and reward reports",
  "AI-powered report assistance",
];
const pricing = (page) => page.locator("[data-pricing-reveal]");

async function openFull(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?persona=visionary");
  await expect(pricing(page)).toHaveAttribute("data-pricing-mode", "animated");
}

test("preserves every pricing string, feature and destination", async ({ page }) => {
  await openFull(page);
  const section = pricing(page);
  await expect(section.locator(".visionary-index")).toHaveText("08 Simple, accessible pricing");
  await expect(section.getByRole("heading", { level: 2 })).toHaveText("Meaningful culture for $1 per employee/month.");
  await expect(section.getByText("Recognition should not become a luxury reserved for large enterprises. EzRewards gives growing companies one connected platform for recognition, rewards and culture insights—without complex pricing tiers.", { exact: true })).toBeAttached();
  await expect(section.locator("[data-price-value]")).toHaveText("$1");
  await expect(section.locator("[data-price-period]")).toHaveText("per active employee/month");
  await expect(section.getByRole("link", { name: "Join the Waitlist" })).toHaveAttribute("href", "/contact");
  await expect(section.getByRole("link", { name: "View full pricing details" })).toHaveAttribute("href", "/pricing");
  expect(await section.locator("[data-price-feature]").allTextContents()).toEqual(features.map((feature) => `✓${feature}`));
  await expect(section.getByText("Only active employees count toward your subscription.", { exact: false })).toBeAttached();
  await expect(section.getByText("Pay annually and receive two months free.", { exact: true })).toBeAttached();
  await expect(section.locator("[data-pricing-note]").last()).toContainText("$10 per active employee/year");
});

test("plays the calm pricing sequence once and finishes fully readable", async ({ page }) => {
  await openFull(page);
  const section = pricing(page);
  await expect(section).toHaveAttribute("data-pricing-state", "idle");
  await expect(section.locator("[data-pricing-actions]")).toHaveAttribute("inert", "");
  await section.scrollIntoViewIfNeeded();
  await expect(section).toHaveAttribute("data-pricing-state", "entering");
  await expect(section).toHaveAttribute("data-pricing-state", "complete", { timeout: 6000 });
  await expect(section.locator("[data-pricing-actions]")).not.toHaveAttribute("inert", "");
  await expect(section.locator("[data-price-value]")).toHaveCSS("filter", "blur(0px)");
  await expect(section.locator("[data-price-feature]")).toHaveCount(10);
  for (const feature of await section.locator("[data-price-feature]").all()) await expect(feature).toHaveCSS("opacity", "1");
  expect(await section.evaluate((node) => getComputedStyle(node).getPropertyValue("--pricing-border-turn").trim())).toBe("360deg");
  await page.evaluate(() => scrollTo(0, 0));
  await section.scrollIntoViewIfNeeded();
  await expect(section).toHaveAttribute("data-pricing-state", "complete");
});

test("uses adaptive entry and preserves completion after resizing", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/?persona=visionary");
  const section = pricing(page);
  await expect(section).toHaveAttribute("data-pricing-mode", "adaptive");
  await section.scrollIntoViewIfNeeded();
  await expect(section).toHaveAttribute("data-pricing-state", "complete", { timeout: 6000 });
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(section).toHaveAttribute("data-pricing-mode", "animated");
  await expect(section).toHaveAttribute("data-pricing-state", "complete");
});

test("reduced motion is complete and static", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?persona=visionary");
  const section = pricing(page);
  await expect(section).toHaveAttribute("data-pricing-mode", "static");
  await expect(section).toHaveAttribute("data-pricing-state", "complete");
  await expect(section.locator("[data-price-value]")).toHaveCSS("filter", "none");
  await expect(section.locator("[data-pricing-actions]")).not.toHaveAttribute("inert", "");
});

test("remains complete when the cinematic bundle is unavailable", async ({ page }) => {
  await page.route("**/vendor/visionary-cinematic.bundle.js", (route) => route.abort());
  await page.goto("/?persona=visionary");
  const section = pricing(page);
  await expect(section.getByRole("heading", { level: 2 })).toBeVisible();
  await expect(section.locator("[data-price-feature]:visible")).toHaveCount(10);
  await expect(section.getByRole("link", { name: "Join the Waitlist" })).toBeVisible();
});

for (const [width, height] of [[320,568],[390,844],[667,375],[768,1024],[1024,768],[1280,720],[1440,900],[1920,1080]]) {
  test(`fits Section 08 at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/?persona=visionary");
    const section = pricing(page);
    await section.scrollIntoViewIfNeeded();
    await expect(section).toHaveAttribute("data-pricing-state", "complete", { timeout: 12000 });
    const geometry = await section.evaluate((node) => {
      const bounds = node.getBoundingClientRect();
      const card = node.querySelector("[data-pricing-card]").getBoundingClientRect();
      const price = node.querySelector("[data-price-value]").getBoundingClientRect();
      return { scrollWidth: document.documentElement.scrollWidth, left: bounds.left, right: bounds.right, cardLeft: card.left, cardRight: card.right, priceLeft: price.left, priceRight: price.right };
    });
    expect(geometry.scrollWidth).toBeLessThanOrEqual(width);
    expect(geometry.left).toBeGreaterThanOrEqual(0);
    expect(geometry.right).toBeLessThanOrEqual(width + 1);
    expect(geometry.cardLeft).toBeGreaterThanOrEqual(0);
    expect(geometry.cardRight).toBeLessThanOrEqual(width);
    expect(geometry.priceLeft).toBeGreaterThanOrEqual(geometry.cardLeft);
    expect(geometry.priceRight).toBeLessThanOrEqual(geometry.cardRight);
  });
}

test("has no serious accessibility violations", async ({ page }) => {
  await openFull(page);
  await pricing(page).scrollIntoViewIfNeeded();
  await expect(pricing(page)).toHaveAttribute("data-pricing-state", "complete", { timeout: 6000 });
  const results = await new AxeBuilder({ page }).include("[data-pricing-reveal]").analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact))).toEqual([]);
});

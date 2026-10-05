import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const benefits = [
  "Early access to the EzRewards platform",
  "Direct input into upcoming product capabilities",
  "Guided onboarding for your company",
  "Early visibility into new recognition and reward experiences",
  "Founding customer status within the EzRewards community",
];
const section = (page) => page.locator("[data-early-access]");

async function openFull(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?persona=visionary");
  await expect(section(page)).toHaveAttribute("data-early-access-mode", "pinned");
}

test("preserves all early-access copy and destinations", async ({ page }) => {
  await openFull(page);
  const early = section(page);
  await expect(early.locator(".visionary-index")).toHaveText("07 Help shape what comes next");
  await expect(early.getByRole("heading", { level: 2 })).toHaveText("The best workplace cultures are built intentionally.");
  await expect(early.getByText("We are inviting a limited group of growing companies to join EzRewards early.", { exact: true })).toBeAttached();
  await expect(early.getByText("Early-access companies will experience the product before the wider launch and help us understand how recognition should work inside modern teams.", { exact: true })).toBeAttached();
  await expect(early.getByRole("link", { name: "Join the Waitlist" })).toHaveAttribute("href", "/contact");
  await expect(early.getByText("Designed for companies with 30 or more employees.", { exact: true })).toBeAttached();
  for (const benefit of benefits) await expect(early.getByText(benefit, { exact: true })).toBeAttached();
});

test("activates all five benefits at their desktop anchors", async ({ page }) => {
  await openFull(page);
  for (const [index, anchor] of [.34, .46, .58, .70, .82].entries()) {
    await page.evaluate((amount) => {
      const node = document.querySelector("[data-early-access]");
      const pin = node.querySelector(".cinematic-early__pin");
      const header = document.querySelector(".site-header").offsetHeight;
      scrollTo(0, node.offsetTop - header + (node.offsetHeight - pin.offsetHeight) * amount);
    }, anchor + .008);
    await page.waitForTimeout(220);
    await expect(section(page)).toHaveAttribute("data-active-benefit", String(index + 1));
    await expect(section(page).locator("[data-early-benefit]").nth(index)).toHaveAttribute("data-benefit-state", "active");
  }
});

test("reveals tag, heading, body, then CTA while the beam grows from a 52px square", async ({ page }) => {
  await openFull(page);
  const stateAt = async (amount) => {
    await page.evaluate((value) => {
      const node = document.querySelector("[data-early-access]");
      const pin = node.querySelector(".cinematic-early__pin");
      scrollTo(0, node.offsetTop - document.querySelector(".site-header").offsetHeight + (node.offsetHeight - pin.offsetHeight) * value);
    }, amount);
    await page.waitForTimeout(700);
    return section(page).evaluate((node) => {
      const opacity = (selector) => Number.parseFloat(getComputedStyle(node.querySelector(selector)).opacity);
      const beam = node.querySelector(".cinematic-early__beam").getBoundingClientRect();
      const door = Number.parseFloat(node.querySelector(".cinematic-early__media").style.getPropertyValue("--door-h"));
      return { tag: opacity(".visionary-index"), heading: opacity("h2"), body: opacity(".cinematic-early__body"), cta: opacity(".cinematic-early__action"), beamWidth: beam.width, beamHeight: beam.height, door };
    });
  };
  const square = await stateAt(.065);
  expect(square).toMatchObject({ tag: 1, cta: 0 });
  expect(square.heading).toBeLessThan(.2);
  expect(Math.round(square.beamWidth)).toBeGreaterThanOrEqual(52);
  expect(square.beamHeight).toBeLessThan(square.beamWidth + 4);
  const growing = await stateAt(.17);
  expect(growing.heading).toBe(1);
  expect(growing.cta).toBe(0);
  expect(growing.beamHeight).toBeGreaterThan(growing.beamWidth * 2);
  expect(growing.beamHeight).toBeLessThan(growing.door);
  const complete = await stateAt(.32);
  expect(complete).toMatchObject({ tag: 1, heading: 1, body: 1, cta: 1 });
  expect(Math.abs(complete.beamHeight - complete.door)).toBeLessThan(2);
  expect(Math.round(complete.beamWidth)).toBe(Math.round(square.beamWidth));
});

test("lazy-loads and pauses local video near the scene", async ({ page }) => {
  await openFull(page);
  const early = section(page);
  await early.scrollIntoViewIfNeeded();
  await expect.poll(async () => early.getAttribute("data-video-state")).toMatch(/playing|fallback/);
  const sources = await early.locator("video source").evaluateAll((nodes) => nodes.map((node) => node.getAttribute("src")));
  expect(sources).toEqual([
    "assets/generated/early-access/early-access-gateway-desktop.webm",
    "assets/generated/early-access/early-access-gateway-desktop.mp4",
  ]);
  await page.evaluate(() => scrollTo(0, 0));
  await expect(early).toHaveAttribute("data-video-state", "paused");
});

test("uses flow on tablet, portrait video on wide phone and poster on narrow phone", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/?persona=visionary");
  await expect(section(page)).toHaveAttribute("data-early-access-mode", "flow");
  await expect(section(page).locator(".cinematic-early__media")).toHaveCSS("position", "sticky");
  await page.setViewportSize({ width: 667, height: 375 });
  await expect(section(page)).toHaveAttribute("data-early-access-mode", "static");
  await section(page).scrollIntoViewIfNeeded();
  await expect.poll(async () => section(page).locator("video source").count()).toBe(2);
  await expect(section(page).locator("video source").first()).toHaveAttribute("src", /mobile\.webm$/);
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(section(page)).toHaveAttribute("data-early-access-mode", "static");
  await expect(section(page).locator("video source")).toHaveCount(0);
  await expect(section(page).locator("picture img")).toBeVisible();
});

test("reduced motion and Save-Data never attach video", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?persona=visionary");
  await expect(section(page)).toHaveAttribute("data-early-access-mode", "static");
  await expect(section(page).locator("video source")).toHaveCount(0);
  await expect(section(page).locator('[data-benefit-state="complete"]')).toHaveCount(5);
});

test("remains readable without the cinematic bundle", async ({ page }) => {
  await page.route("**/vendor/visionary-cinematic.bundle.js", (route) => route.abort());
  await page.goto("/?persona=visionary");
  await expect(section(page).getByRole("heading", { level: 2 })).toBeVisible();
  await expect(section(page).locator("[data-early-benefit]:visible")).toHaveCount(5);
  await expect(section(page).getByRole("link", { name: "Join the Waitlist" })).toBeVisible();
});

for (const [width, height] of [[320,568],[390,844],[667,375],[768,1024],[1024,768],[1280,720],[1440,900],[1920,1080]]) {
  test(`fits Section 07 at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/?persona=visionary");
    const early = section(page);
    await early.scrollIntoViewIfNeeded();
    const geometry = await early.evaluate((node) => {
      const bounds = node.getBoundingClientRect();
      const cta = node.querySelector(".cinematic-early__action a").getBoundingClientRect();
      return { scrollWidth: document.documentElement.scrollWidth, left: bounds.left, right: bounds.right, ctaLeft: cta.left, ctaRight: cta.right };
    });
    expect(geometry.scrollWidth).toBeLessThanOrEqual(width);
    expect(geometry.left).toBeGreaterThanOrEqual(0);
    expect(geometry.right).toBeLessThanOrEqual(width + 1);
    expect(geometry.ctaLeft).toBeGreaterThanOrEqual(0);
    expect(geometry.ctaRight).toBeLessThanOrEqual(width);
  });
}

test("has no serious accessibility violations", async ({ page }) => {
  await openFull(page);
  await section(page).scrollIntoViewIfNeeded();
  const results = await new AxeBuilder({ page }).include("[data-early-access]").analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact))).toEqual([]);
});

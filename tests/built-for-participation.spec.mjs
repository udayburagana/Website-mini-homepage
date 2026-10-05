import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const FEATURES = [
  ["recognition", "Peer-to-peer recognition", "Make appreciation everyone’s responsibility", "Employees can recognize anyone across the company—not only the people on their immediate team. Recognition can be shared publicly, celebrated through reactions and strengthened through meaningful comments."],
  ["ai-message", "AI-assisted messages", "Never let “I don’t know what to write” stop a meaningful moment", "EzRewards helps employees turn genuine appreciation into thoughtful recognition messages while keeping their voice and intent intact."],
  ["feed", "Company recognition feed", "Create a living record of the work that matters", "Bring meaningful contributions out of private conversations and into a shared company experience."],
  ["catalogue", "Rewards catalogue", "Give employees rewards they will value", "Create a company reward catalogue, fund the reward wallet and allow employees to redeem rewards that are relevant to them."],
  ["assignment", "Direct reward assignment", "Celebrate individuals or entire groups", "Administrators can assign rewards to one employee or recognize multiple employees through a simple bulk-assignment experience."],
  ["onboarding", "Simple employee onboarding", "Bring your team in without operational friction", "Onboard employees through Microsoft SSO or structured CSV upload, with role-based access and employee information management."],
  ["reporting", "Culture reporting", "Understand how appreciation moves through your company", "View recognition and reward activity through structured reports designed to help leaders identify participation patterns and opportunities."],
  ["assistant", "AI Report Assistant", "Ask questions. Find answers inside your culture data.", "Administrators can ask natural-language questions across company reports and receive answers based on structured EzRewards data."]
];
const ANCHORS = [.04, .17, .30, .43, .56, .69, .82, .95];
const section = (page) => page.locator("[data-built-participation]");

async function openFull(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?persona=visionary");
  await expect(section(page)).toHaveAttribute("data-participation-mode", "pinned");
}

async function scrollToProgress(page, progress) {
  await page.evaluate((value) => {
    const node = document.querySelector("[data-built-participation]");
    const pin = node.querySelector(".cinematic-participation__pin");
    const header = document.querySelector(".site-header")?.offsetHeight || 76;
    const start = node.getBoundingClientRect().top + scrollY - header;
    scrollTo(0, start + (node.offsetHeight - pin.offsetHeight) * value);
  }, progress);
}

const currentProgress = (page) => page.evaluate(() => {
  const node = document.querySelector("[data-built-participation]");
  const pin = node.querySelector(".cinematic-participation__pin");
  const header = document.querySelector(".site-header")?.offsetHeight || 76;
  const start = node.getBoundingClientRect().top + scrollY - header;
  return (scrollY - start) / (node.offsetHeight - pin.offsetHeight);
});

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
});

test("preserves all eight capability labels, headings and descriptions", async ({ page }) => {
  await page.goto("/?persona=visionary");
  const built = section(page);
  await expect(built.locator(".visionary-index")).toHaveText("05 Built for participation");
  await expect(built.getByRole("heading", { level: 2 })).toHaveText("A culture platform people will actually want to use.");
  await expect(built.locator(".visionary-centered-intro > p")).toHaveText("EzRewards is designed to make appreciation natural for employees and manageable for administrators.");
  await expect(built.locator("[data-capability-feature]")).toHaveCount(8);
  await expect(built.locator("[data-capability-feature] > small")).toHaveText(FEATURES.map(([, label]) => label));
  await expect(built.locator("[data-capability-feature] > h3")).toHaveText(FEATURES.map(([, , heading]) => heading));
  await expect(built.locator("[data-capability-feature] > p")).toHaveText(FEATURES.map(([, , , copy]) => copy));
  await expect(built.locator("[data-capability-screen]")).toHaveCount(8);
});

test("synchronizes every desktop anchor with its card and product screen", async ({ page }) => {
  await openFull(page);
  const built = section(page);
  for (const [index, [feature]] of FEATURES.entries()) {
    await scrollToProgress(page, ANCHORS[index]);
    await expect(built).toHaveAttribute("data-active-capability", feature);
    await expect(built.locator(`[data-capability-feature="${feature}"]`)).toHaveAttribute("aria-hidden", "false");
    await expect(built.locator(`[data-capability-screen="${feature}"]`)).toHaveAttribute("data-screen-state", "active");
    await expect(built.locator(`[data-capability-progress="${feature}"]`)).toHaveAttribute("aria-selected", "true");
  }
  await expect(built.locator('[data-capability-feature="assistant"]')).toHaveAttribute("data-card-side", "right");
  await expect(built.locator('[data-capability-feature="reporting"]')).toHaveAttribute("data-card-side", "left");
});

test("progress rail supports click, arrows, Home and End with Lenis stage navigation", async ({ page }) => {
  await openFull(page);
  const built = section(page);
  const arrivesAt = async (index) => {
    const feature = FEATURES[index][0];
    await expect(built).toHaveAttribute("data-active-capability", feature);
    await expect(built.locator(`[data-capability-progress="${feature}"]`)).toBeFocused();
    await expect.poll(() => currentProgress(page), { timeout: 6000 }).toBeGreaterThanOrEqual(ANCHORS[index] - .02);
    await expect.poll(() => currentProgress(page), { timeout: 6000 }).toBeLessThanOrEqual(ANCHORS[index] + .02);
  };
  await scrollToProgress(page, ANCHORS[0]);
  await built.locator('[data-capability-progress="recognition"]').focus();
  await page.keyboard.press("ArrowRight");
  await arrivesAt(1);
  await page.keyboard.press("End");
  await arrivesAt(7);
  await page.keyboard.press("Home");
  await arrivesAt(0);
  await built.locator('[data-capability-progress="catalogue"]').click();
  await arrivesAt(3);
});

test("uses normal flow on adaptive screens and static flow on phones and reduced motion", async ({ page }) => {
  await page.setViewportSize({ width: 1024, height: 768 });
  await page.goto("/?persona=visionary");
  const built = section(page);
  await expect(built).toHaveAttribute("data-participation-mode", "flow");
  await expect(built.locator("[data-capability-feature][aria-hidden]")).toHaveCount(0);
  await expect(built.locator(".participation-product")).toHaveCSS("display", "none");
  await expect(built.locator(".participation-mini:visible")).toHaveCount(8);

  await page.setViewportSize({ width: 390, height: 844 });
  await expect(built).toHaveAttribute("data-participation-mode", "static");
  await expect(built.locator("[data-capability-feature][aria-hidden]")).toHaveCount(0);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(built).toHaveAttribute("data-participation-mode", "static");
  expect(await built.locator("[data-capability-feature]").evaluateAll((nodes) => nodes.every((node) => getComputedStyle(node).transform === "none"))).toBe(true);
});

test("rebuilds on resize and pauses when the persona changes", async ({ page }) => {
  await openFull(page);
  const built = section(page);
  await scrollToProgress(page, ANCHORS[4]);
  await expect(built).toHaveAttribute("data-animation-state", "active");
  await expect(built).toHaveAttribute("data-active-capability", "assignment");
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(built).toHaveAttribute("data-participation-mode", "flow");
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(built).toHaveAttribute("data-participation-mode", "pinned");
  await page.evaluate(() => window.EzRewardsPersona.setPersona("strategist"));
  await expect(built).toHaveAttribute("data-animation-state", "paused");
  await expect(built.locator("[data-capability-feature][aria-hidden]")).toHaveCount(0);
});

test("remains complete before the cinematic bundle loads and generic personas retain their selector", async ({ page }) => {
  await page.route("**/vendor/visionary-cinematic.bundle.js", (route) => route.abort());
  await page.goto("/?persona=visionary");
  const built = section(page);
  await expect(built).not.toHaveAttribute("data-participation-mode", /.*/);
  await expect(built.locator("[data-capability-feature]:visible")).toHaveCount(8);
  await expect(built.locator(".participation-product")).toHaveCSS("display", "none");

  await page.unroute("**/vendor/visionary-cinematic.bundle.js");
  await page.goto("/?persona=strategist");
  const strategist = page.locator('[data-persona-page="strategist"] [data-persona-section="capabilities"]');
  await expect(strategist.getByRole("tab")).toHaveCount(4);
});

const VIEWPORTS = [[320, 568], [390, 844], [667, 375], [768, 1024], [1024, 768], [1280, 720], [1440, 900], [1920, 1080]];
for (const [width, height] of VIEWPORTS) {
  test(`fits section 05 at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/?persona=visionary");
    const built = section(page);
    const expected = width >= 1100 && height >= 800 ? "pinned" : width >= 768 ? "flow" : "static";
    await expect(built).toHaveAttribute("data-participation-mode", expected);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    if (expected === "pinned") {
      for (const [index, [feature]] of FEATURES.entries()) {
        await scrollToProgress(page, ANCHORS[index]);
        await expect(built).toHaveAttribute("data-active-capability", feature);
        const boxes = await built.evaluate((node, name) => {
          const headerBottom = document.querySelector(".site-header").getBoundingClientRect().bottom;
          const card = node.querySelector(`[data-capability-feature="${name}"]`).getBoundingClientRect();
          const product = node.querySelector(".participation-product").getBoundingClientRect();
          return { headerBottom, card, product };
        }, feature);
        for (const box of [boxes.card, boxes.product]) {
          expect(box.top).toBeGreaterThanOrEqual(boxes.headerBottom - 1);
          expect(box.bottom).toBeLessThanOrEqual(height + 1);
          expect(box.left).toBeGreaterThanOrEqual(0);
          expect(box.right).toBeLessThanOrEqual(width);
        }
      }
    } else {
      for (const [feature] of FEATURES) {
        const card = built.locator(`[data-capability-feature="${feature}"]`);
        await card.scrollIntoViewIfNeeded();
        await expect(card).toBeVisible();
      }
    }
    const results = await new AxeBuilder({ page }).include("[data-built-participation]")
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}

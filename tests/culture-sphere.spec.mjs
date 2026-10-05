import { test, expect } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const outcomes = [
  ["employee", "Employee outcome", "People know their work matters", "Employees receive timely, specific appreciation—not only generic praise during formal review cycles."],
  ["team", "Team outcome", "Great work becomes contagious", "Teams can see the behaviours and contributions being celebrated across the company."],
  ["leadership", "Leadership outcome", "Culture becomes more tangible", "Leaders gain a clearer view of participation, recognition and the people strengthening the organization."],
  ["company", "Company outcome", "Values become behaviours", "Company values move beyond posters and presentations when people can see how they appear in everyday work."],
];
const section = (page) => page.locator("[data-culture-sphere]");

async function openFull(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?persona=visionary");
  await expect(section(page)).toHaveAttribute("data-sphere-mode", "pinned");
}

test("preserves the section copy and four outcomes", async ({ page }) => {
  await openFull(page);
  const culture = section(page);
  await expect(culture.locator(".visionary-index")).toHaveText("06 A culture everyone can see");
  await expect(culture.getByRole("heading", { level: 2 })).toHaveText("When appreciation becomes visible, its impact travels further.");
  for (const [name, label, heading, copy] of outcomes) {
    const card = culture.locator(`[data-outcome-stage="${name}"]`);
    await expect(card.locator("small")).toHaveText(label);
    await expect(card.locator("h3")).toHaveText(heading);
    await expect(card.locator("p")).toHaveText(copy);
  }
});

test("maps scroll stages to outcome state and shader controls", async ({ page }) => {
  await openFull(page);
  for (const [index, anchor] of [.11, .38, .65, .9].entries()) {
    await page.evaluate((value) => {
      const node = document.querySelector("[data-culture-sphere]");
      const pin = node.querySelector(".cinematic-culture__pin");
      const start = node.offsetTop - document.querySelector(".site-header").offsetHeight;
      scrollTo(0, start + (node.offsetHeight - pin.offsetHeight) * value);
    }, anchor);
    await page.waitForTimeout(260);
    await expect(section(page)).toHaveAttribute("data-active-outcome", outcomes[index][0]);
  }
  const values = await section(page).evaluate((node) => ({ insight: +node.dataset.sphereInsight, core: +node.dataset.sphereBrandCore }));
  expect(values.insight).toBeGreaterThan(.5);
  expect(values.core).toBeGreaterThan(.2);
});

test("navigator supports arrows, Home and End", async ({ page }) => {
  await openFull(page);
  const first = section(page).locator('[data-outcome-progress="employee"]');
  await first.focus();
  await first.press("End");
  await expect(section(page)).toHaveAttribute("data-active-outcome", "company");
  await expect(section(page).locator('[data-outcome-progress="company"]')).toBeFocused();
  await page.keyboard.press("Home");
  await expect(section(page)).toHaveAttribute("data-active-outcome", "employee");
  await page.keyboard.press("ArrowRight");
  await expect(section(page)).toHaveAttribute("data-active-outcome", "team");
});

test("rebuilds from full to flow to static and back", async ({ page }) => {
  await openFull(page);
  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(section(page)).toHaveAttribute("data-sphere-mode", "flow");
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(section(page)).toHaveAttribute("data-sphere-mode", "static");
  await expect(section(page).locator(".culture-stage-symbol:visible")).toHaveCount(4);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(section(page)).toHaveAttribute("data-sphere-mode", "pinned");
});

test("reduced motion stays static and readable", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?persona=visionary");
  await expect(section(page)).toHaveAttribute("data-sphere-mode", "static");
  await expect(section(page).locator("canvas")).not.toBeVisible();
  await expect(section(page).locator("[data-outcome-stage]:visible")).toHaveCount(4);
});

test("has no serious accessibility violations or horizontal overflow", async ({ page }) => {
  await openFull(page);
  await section(page).scrollIntoViewIfNeeded();
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  expect(overflow).toBeLessThanOrEqual(1);
  const results = await new AxeBuilder({ page }).include("[data-culture-sphere]").analyze();
  expect(results.violations.filter((violation) => ["serious", "critical"].includes(violation.impact))).toEqual([]);
});

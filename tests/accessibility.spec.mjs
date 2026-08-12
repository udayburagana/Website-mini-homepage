import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const auditTargets = [
  ["Visionary desktop", "/?persona=visionary", 1440, 900],
  ["Strategist desktop", "/?persona=strategist", 1440, 900],
  ["Operator desktop", "/?persona=operator", 1440, 900],
  ["Visionary mobile", "/?persona=visionary", 390, 844],
  ["Strategist mobile", "/?persona=strategist", 390, 844],
  ["Operator mobile", "/?persona=operator", 390, 844],
  ["Product", "/product", 1440, 900],
  ["Pricing", "/pricing", 1440, 900],
  ["About", "/about", 1440, 900],
  ["Contact", "/contact", 1440, 900]
];

for (const [name, url, width, height] of auditTargets) {
  test(`${name} has no WCAG A/AA violations`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto(url);
    await page.waitForTimeout(1200);
    const results = await new AxeBuilder({ page }).withTags(axeTags).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}

test("personality tabs implement roving keyboard navigation", async ({ page }) => {
  await page.goto("/?persona=visionary");
  const visionary = page.getByRole("tab", { name: "Visionary" });
  await visionary.focus();
  await page.keyboard.press("ArrowRight");
  await expect(page.getByRole("tab", { name: "Strategist" })).toBeFocused();
  await expect(page).toHaveURL(/persona=strategist/);
  await page.keyboard.press("End");
  await expect(page.getByRole("tab", { name: "Operator" })).toBeFocused();
  await page.keyboard.press("Home");
  await expect(visionary).toBeFocused();
});

test("visual data and workspace containers use supported semantics", async ({ page }) => {
  await page.goto("/?persona=visionary");
  await expect(page.locator(".culture-orbit")).not.toHaveAttribute("aria-label");
  await expect(page.locator(".loop-grid")).toHaveAttribute("role", "list");

  await page.getByRole("tab", { name: "Strategist" }).click();
  await expect(page.locator(".strategist-dashboard")).not.toHaveAttribute("aria-label");
  await expect(page.locator(".strategist-bars")).toHaveAttribute("role", "img");

  await page.getByRole("tab", { name: "Operator" }).click();
  await expect(page.locator(".operator-workspace")).toHaveAttribute("aria-labelledby", "operator-workspace-title");
});

test("contact validation works for keyboard submission and describes errors", async ({ page }) => {
  await page.goto("/contact");
  const form = page.locator("form[data-demo-form]");
  await form.locator("input[name=email]").focus();
  await page.keyboard.press("Enter");
  await expect(form).toBeVisible();
  await expect(form.locator(".demo-form-status")).toHaveText("Please complete the required fields.");
  await expect(form.locator("input[name=name]")).toBeFocused();
  await expect(form.locator("input[name=name]")).toHaveAttribute("aria-describedby", "contact-form-status");
});

test("reduced motion disables animations and smooth scrolling on every route", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  for (const url of ["/?persona=visionary", "/?persona=strategist", "/?persona=operator", "/product", "/pricing", "/about", "/contact"]) {
    await page.goto(`http://127.0.0.1:4174${url}`);
    expect(await page.locator("html").evaluate((element) => getComputedStyle(element).scrollBehavior)).toBe("auto");
    const animated = page.locator('[style*="animation"], .strategist-bars i').first();
    if (await animated.count()) {
      expect(await animated.evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
    }
  }
  await context.close();
});

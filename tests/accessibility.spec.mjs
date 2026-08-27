import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const auditTargets = [
  ["Default desktop", "/?persona=default", 1440, 900],
  ["Visionary desktop", "/?persona=visionary", 1440, 900],
  ["Strategist desktop", "/?persona=strategist", 1440, 900],
  ["Operator desktop", "/?persona=operator", 1440, 900],
  ["Creative desktop", "/?persona=creative-culture-builder", 1440, 900],
  ["Default mobile", "/?persona=default", 390, 844],
  ["Visionary mobile", "/?persona=visionary", 390, 844],
  ["Strategist mobile", "/?persona=strategist", 390, 844],
  ["Operator mobile", "/?persona=operator", 390, 844],
  ["Creative mobile", "/?persona=creative-culture-builder", 390, 844],
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

test("personality selector traps focus, closes with Escape and restores focus", async ({ page }) => {
  await page.goto("/?persona=visionary");
  const trigger = page.getByRole("button", { name: "Change experience" }).first();
  await trigger.focus();
  await trigger.click();
  const dialog = page.getByRole("dialog", { name: "Choose your EzRewards experience" });
  await expect(dialog).toBeVisible();
  await expect(page.getByRole("button", { name: /Visionary/ })).toBeFocused();
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(trigger).toBeFocused();
});

test("open personality selector has no WCAG A/AA violations", async ({ page }) => {
  await page.goto("/?persona=default");
  await page.getByRole("button", { name: "Change experience" }).first().click();
  const results = await new AxeBuilder({ page }).withTags(axeTags).analyze();
  expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
});

test("visual data and workspace containers use supported semantics", async ({ page }) => {
  await page.goto("/?persona=visionary");
  await expect(page.locator(".visionary-loop-list")).toHaveAttribute("role", "list");

  await page.goto("/?persona=strategist");
  await expect(page.locator(".strategist-dashboard")).not.toHaveAttribute("aria-label");
  await expect(page.locator(".strategist-bars")).toHaveAttribute("role", "img");

  await page.goto("/?persona=operator");
  await expect(page.locator(".operator-workspace")).toHaveAttribute("aria-labelledby", "operator-workspace-title");
});

test("Visionary FAQ uses native keyboard-accessible disclosures", async ({ page }) => {
  await page.goto("/?persona=visionary");
  const firstQuestion = page.locator(".visionary-faq summary").first();
  await firstQuestion.focus();
  await page.keyboard.press("Enter");
  await expect(firstQuestion.locator("..")).toHaveAttribute("open", "");
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
  for (const url of ["/?persona=default", "/?persona=visionary", "/?persona=strategist", "/?persona=operator", "/?persona=creative-culture-builder", "/product", "/pricing", "/about", "/contact"]) {
    await page.goto(`http://127.0.0.1:4174${url}`);
    expect(await page.locator("html").evaluate((element) => getComputedStyle(element).scrollBehavior)).toBe("auto");
    const animated = page.locator('[style*="animation"], .strategist-bars i').first();
    if (await animated.count()) {
      expect(await animated.evaluate((element) => getComputedStyle(element).animationName)).toBe("none");
    }
  }
  await context.close();
});

import { expect, test } from "@playwright/test";

const personas = ["default", "visionary", "strategist", "operator", "creative-culture-builder"];
const sectionNames = [
  "hero", "problem", "vision", "category", "loop", "capabilities",
  "outcomes", "early-access", "pricing", "faq", "final-cta"
];

test.beforeEach(async ({ page }) => {
  await page.addInitScript(() => {
    localStorage.clear();
    sessionStorage.clear();
    window.dataLayer = [];
  });
});

test("first-time visitors receive the neutral default experience", async ({ page }) => {
  await page.goto("/");
  await expect(page.locator("html")).toHaveAttribute("data-persona", "default");
  await expect(page.locator('[data-persona-page="default"]')).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Recognition, rewards and culture visibility in one platform." })).toBeVisible();
});

test("all five personality URLs render eleven semantic sections", async ({ page }) => {
  for (const persona of personas) {
    await page.goto(`/?persona=${persona}`);
    const active = page.locator(`[data-persona-page="${persona}"]`);
    await expect(active).toBeVisible();
    await expect(active.locator("h1")).toHaveCount(1);
    const sequence = await active.locator("[data-persona-section]").evaluateAll((nodes) =>
      nodes.map((node) => node.dataset.personaSection)
    );
    expect(sequence).toEqual(sectionNames);
  }
});

test("invalid personality query values fall back to default", async ({ page }) => {
  await page.goto("/?persona=unknown");
  await expect(page.locator("html")).toHaveAttribute("data-persona", "default");
  await expect(page).toHaveURL(/persona=default/);
});

test("change experience opens one accessible selector dialog", async ({ page }) => {
  await page.goto("/?persona=visionary");
  await page.getByRole("button", { name: "Change experience" }).first().click();
  const dialog = page.getByRole("dialog", { name: "Choose your EzRewards experience" });
  await expect(dialog).toBeVisible();
  for (const label of ["Visionary", "Strategist", "Operator", "Creative Culture Builder", "Continue with the default EzRewards experience"]) {
    await expect(dialog.getByRole("button", { name: new RegExp(label, "i") })).toBeVisible();
  }
  await page.keyboard.press("Escape");
  await expect(dialog).toBeHidden();
  await expect(page.getByRole("button", { name: "Change experience" }).first()).toBeFocused();
});

test("selector updates URL, storage, metadata and analytics without a reload", async ({ page }) => {
  await page.goto("/?persona=default");
  await page.getByRole("button", { name: "Change experience" }).first().click();
  await page.getByRole("dialog").getByRole("button", { name: /prove culture impact with clarity/i }).click();
  await expect(page).toHaveURL(/persona=strategist/);
  await expect(page.locator("html")).toHaveAttribute("data-persona", "strategist");
  await expect(page.locator('[data-persona-page="strategist"]')).toBeVisible();
  expect(await page.evaluate(() => localStorage.getItem("ezrewards-persona"))).toBe("strategist");
  await expect(page.locator('meta[name="description"]')).toHaveAttribute("content", /measurable|leadership|clarity/i);
  expect(await page.evaluate(() => window.dataLayer.some((event) => event.event === "persona_selected" && event.persona === "strategist"))).toBeTruthy();
});

test("shared stepper supports arrow, Home and End navigation", async ({ page }) => {
  await page.goto("/?persona=creative-culture-builder");
  const stepper = page.locator('[data-persona-page="creative-culture-builder"] [data-stepper]');
  const first = stepper.getByRole("tab").first();
  await first.focus();
  await page.keyboard.press("ArrowRight");
  await expect(stepper.getByRole("tab").nth(1)).toBeFocused();
  await expect(stepper.getByRole("tab").nth(1)).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("End");
  await expect(stepper.getByRole("tab").last()).toHaveAttribute("aria-selected", "true");
  await page.keyboard.press("Home");
  await expect(first).toHaveAttribute("aria-selected", "true");
});

test("capabilities use four keyboard-selectable product groups", async ({ page }) => {
  await page.goto("/?persona=visionary");
  const section = page.locator('[data-persona-page="visionary"] [data-persona-section="capabilities"]');
  const tabs = section.getByRole("tab");
  await expect(tabs).toHaveCount(4);
  await tabs.first().focus();
  await page.keyboard.press("End");
  await expect(tabs.last()).toBeFocused();
  await expect(tabs.last()).toHaveAttribute("aria-selected", "true");
  await expect(section.getByRole("tabpanel").last()).toBeVisible();
});

test("sticky stacks activate clicked items without moving focus", async ({ page }) => {
  await page.goto("/?persona=operator");
  const stack = page.locator('[data-persona-page="operator"] [data-layout="sticky-stack"]').first();
  const second = stack.locator("[data-stack-item]").nth(1);
  await second.click();
  await expect(second).toHaveAttribute("data-active", "true");
  await expect(second).toBeFocused();
  await expect(stack.locator("[data-sticky-summary]")).toContainText(await second.locator("h3").innerText());
});

test("personality-specific hero CTA copy follows the registry", async ({ page }) => {
  const labels = {
    default: "Join Waitlist",
    visionary: "Build Your Culture",
    strategist: "Book a Demo",
    operator: "Get Started",
    "creative-culture-builder": "Make Work Feel Celebrated"
  };
  for (const [persona, label] of Object.entries(labels)) {
    await page.goto(`/?persona=${persona}`);
    await expect(page.locator(`[data-persona-page="${persona}"] [data-persona-section="hero"]`).getByRole("link", { name: label, exact: true })).toBeVisible();
  }
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`all five experiences fit ${width}px`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    for (const persona of personas) {
      await page.goto(`/?persona=${persona}`);
      expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);
    }
  });
}

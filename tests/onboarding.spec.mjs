import { expect, test } from "@playwright/test";

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("/onboarding");
});

test("loads the branded sign-in step with semantic progress", async ({ page }) => {
  await expect(page).toHaveTitle("Start your EzRewards setup | EzRewards");
  await expect(page.getByRole("heading", { level: 1, name: "Welcome back" })).toBeVisible();
  await expect(page.getByText("Step 1 of 7", { exact: true })).toBeVisible();
  await expect(page.locator("[data-step-progress]")).toHaveAttribute("aria-valuenow", "1");
  await expect(page.getByLabel("Work email")).toHaveAttribute("autocomplete", "email");
  await expect(page.locator("#password")).toHaveAttribute("autocomplete", "current-password");
});

test("validates sign-in, exposes errors, and bypasses authentication", async ({ page }) => {
  await page.getByRole("button", { name: "Sign in and continue" }).click();
  await expect(page.locator("[data-error-summary]")).toBeFocused();
  await expect(page.locator("#email-error")).toHaveText("Enter your work email.");

  await page.getByLabel("Work email").fill("admin@example.com");
  await page.locator("#password").fill("anything-works");
  await page.getByRole("button", { name: "Sign in and continue" }).click();

  await expect(page.getByRole("heading", { level: 1, name: "Let’s set up your workplace" })).toBeVisible();
  await expect(page.getByText("Step 2 of 7", { exact: true })).toBeVisible();
});

test("completes the full journey, retains values, and renders review", async ({ page }) => {
  await page.getByLabel("Work email").fill("founder@northstar.example");
  await page.locator("#password").fill("temporary");
  await page.getByRole("button", { name: "Sign in and continue" }).click();
  await page.getByRole("button", { name: "Start setup" }).click();

  await page.getByLabel("Organization name").fill("Northstar Labs");
  await page.getByLabel("Company size").selectOption("51-100");
  await page.getByLabel("Company website").fill("https://northstar.example");
  await page.getByLabel("Country").selectOption("India");
  await page.getByLabel("Timezone").selectOption("Asia/Kolkata");
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel("Full name").fill("Avery Rao");
  await page.getByLabel("Job title").fill("People Director");
  await expect(page.getByLabel("Administrator email")).toHaveValue("founder@northstar.example");
  await page.getByRole("button", { name: "Back" }).click();
  await expect(page.getByLabel("Organization name")).toHaveValue("Northstar Labs");
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();

  await page.getByLabel("Build a habit of everyday recognition").check();
  await page.getByLabel("Within the next month").check();
  await page.getByLabel("Start with recognition, add rewards later").check();
  await page.getByRole("button", { name: "Review setup" }).click();

  const review = page.locator("[data-review]");
  await expect(review).toContainText("Northstar Labs");
  await expect(review).toContainText("Avery Rao");
  await expect(review).toContainText("Build a habit of everyday recognition");

  await review.getByRole("button", { name: "Edit organization" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Tell us about your organization" })).toBeVisible();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Continue" }).click();
  await page.getByRole("button", { name: "Review setup" }).click();
  await page.getByRole("button", { name: "Finish setup" }).click();

  await expect(page.locator("[data-complete]")).toBeVisible();
  await expect(page.getByRole("heading", { level: 1, name: "Your workspace is ready for what comes next" })).toBeVisible();
});

for (const width of [320, 390, 768, 1024, 1440]) {
  test(`fits ${width}px without horizontal overflow`, async ({ page }) => {
    await page.setViewportSize({ width, height: 844 });
    const widths = await page.evaluate(() => ({
      client: document.documentElement.clientWidth,
      scroll: document.documentElement.scrollWidth
    }));
    expect(widths.scroll).toBeLessThanOrEqual(widths.client);
  });
}

test("supports password visibility and heading focus after navigation", async ({ page }) => {
  const password = page.locator("#password");
  await password.fill("visible-secret");
  await page.getByRole("button", { name: "Show password" }).click();
  await expect(password).toHaveAttribute("type", "text");
  await page.getByLabel("Work email").fill("admin@example.com");
  await page.getByRole("button", { name: "Sign in and continue" }).click();
  await expect(page.getByRole("heading", { level: 1, name: "Let’s set up your workplace" })).toBeFocused();
});

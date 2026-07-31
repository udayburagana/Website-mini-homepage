import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test.describe("Visionary experience flow", () => {
  test("reveals the Visionary homepage through its two-second loader", async ({ page }) => {
    await page.goto("/");

    const entry = page.locator('[data-experience-view="entry"]');
    const loader = page.locator('[data-experience-view="loader"]');
    const homepage = page.locator('[data-experience-view="visionary-home"]');
    await expect(entry).toBeVisible();
    await expect(loader).toBeHidden();
    await expect(homepage).toBeHidden();

    await expect(page.getByRole("button", { name: /Strategist/ })).toBeEnabled();
    await expect(page.getByRole("button", { name: /Operator/ })).toBeEnabled();

    const continueButton = page.getByRole("button", { name: "Continue as Visionary" });
    await expect(continueButton).toBeDisabled();
    await expect(page.locator('[role="progressbar"]')).toHaveAttribute("aria-valuenow", "0");
    await page.locator('[data-personality="visionary"]').click();
    await expect(continueButton).toBeEnabled();

    const startedAt = Date.now();
    await continueButton.click();
    await expect(loader).toBeVisible();
    await expect(page.locator("[data-loader-progress]" )).toHaveText("100%", { timeout: 2600 });
    await expect(homepage).toBeVisible();
    expect(Date.now() - startedAt).toBeGreaterThanOrEqual(1850);
    expect(Date.now() - startedAt).toBeLessThan(2700);

    await page.getByRole("button", { name: "Change experience" }).click();
    await expect(entry).toBeVisible();
    await expect(homepage).toBeHidden();
  });

  test("reveals the Strategist homepage through its tailored loader", async ({ page }) => {
    await page.goto("/");
    const strategist = page.locator('[data-personality="strategist"]');
    const visionaryHome = page.locator('[data-experience-view="visionary-home"]');
    const strategistHome = page.locator('[data-experience-view="strategist-home"]');

    await expect(strategist).toBeEnabled();
    await expect(page.locator('[data-personality="operator"]')).toBeEnabled();
    await strategist.click();
    await expect(strategist).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-personality="visionary"]')).toHaveAttribute("aria-pressed", "false");
    await page.locator("[data-enter-visionary]").click();
    await expect(page.locator("[data-loader-personality]")).toHaveText("Strategist.");
    await expect(page.locator("[data-loader-message]")).toContainText("business case");
    await expect(page.locator("[data-loader-progress]")).toHaveText("100%", { timeout: 2600 });
    await expect(strategistHome).toBeVisible();
    await expect(visionaryHome).toBeHidden();
  });

  test("reveals the Operator homepage through its workflow loader", async ({ page }) => {
    await page.goto("/");
    const operator = page.locator('[data-personality="operator"]');
    await expect(operator).toBeEnabled();
    await operator.click();
    await expect(operator).toHaveAttribute("aria-pressed", "true");
    await expect(page.locator('[data-personality="visionary"]')).toHaveAttribute("aria-pressed", "false");
    await expect(page.locator('[data-personality="strategist"]')).toHaveAttribute("aria-pressed", "false");
    await page.locator("[data-enter-visionary]").click();
    await expect(page.locator("[data-loader-personality]")).toHaveText("Operator.");
    await expect(page.locator("[data-loader-message]")).toContainText("workflow");
    await expect(page.locator("[data-loader-progress]")).toHaveText("100%", { timeout: 2600 });
    await expect(page.locator('[data-experience-view="operator-home"]')).toBeVisible();
    await expect(page.locator('[data-experience-view="visionary-home"]')).toBeHidden();
    await expect(page.locator('[data-experience-view="strategist-home"]')).toBeHidden();
  });
});

test.describe("Visionary homepage narrative", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-personality="visionary"]').click();
    await page.locator("[data-enter-visionary]").click();
    await expect(page.locator('[data-experience-view="visionary-home"]')).toBeVisible({ timeout: 2600 });
  });

  test("uses the supplied copy and complete cinematic section sequence", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Build a workplace people never want to leave." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Great work should not disappear." })).toBeAttached();
    await expect(page.getByRole("heading", { name: "Recognition is company memory." })).toBeAttached();

    const sequence = await page.locator("[data-visionary-section]").evaluateAll((sections) =>
      sections.map((section) => section.dataset.visionarySection)
    );
    expect(sequence).toEqual([
      "hero", "culture-gap", "transformation", "product-story", "flywheel", "proof"
    ]);
  });

  test("uses local artwork and meaningful conversion destinations", async ({ page }) => {
    await expect(page.locator(".culture-orbit img")).toHaveAttribute("src", "/assets/visionary/culture-orbit.svg");
    await expect(page.getByRole("link", { name: "Join Waitlist", exact: true }).first()).toHaveAttribute("href", "/contact");
    await expect(page.getByRole("link", { name: "Book a Demo", exact: true }).first()).toHaveAttribute("href", "/contact");
    await expect(page.locator('a[href="#culture-flow"]')).not.toHaveCount(0);
  });
});

test.describe("Strategist homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-personality="strategist"]').click();
    await page.locator("[data-enter-visionary]").click();
    await expect(page.locator('[data-experience-view="strategist-home"]')).toBeVisible({ timeout: 2600 });
  });

  test("uses the approved proof-first section sequence", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Recognition leadership can measure. Culture your people can feel." })).toBeVisible();
    const sequence = await page.locator("[data-strategist-section]").evaluateAll((sections) =>
      sections.map((section) => section.dataset.strategistSection)
    );
    expect(sequence).toEqual([
      "hero", "business-challenge", "solution-framework", "analytics", "implementation", "proof"
    ]);
    for (const label of ["Recognition", "Rewards", "Reports", "AI insights"]) {
      await expect(page.getByRole("heading", { name: label, exact: true })).toBeAttached();
    }
  });

  test("provides labelled analytics, summaries, and valid conversion paths", async ({ page }) => {
    await expect(page.getByRole("img", { name: "Recognition participation trend" })).toBeAttached();
    await expect(page.getByText("Recognition participation rose from 61% to 78% over six months.")).toBeAttached();
    await expect(page.getByRole("table", { name: "Culture report summary" })).toBeAttached();
    await expect(page.getByRole("link", { name: "Book a demo", exact: true }).first()).toHaveAttribute("href", "/contact");
    await expect(page.getByRole("link", { name: "View reporting framework", exact: true })).toHaveAttribute("href", "#reporting-framework");
  });
});

test.describe("Operator homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-personality="operator"]').click();
    await page.locator("[data-enter-visionary]").click();
    await expect(page.locator('[data-experience-view="operator-home"]')).toBeVisible({ timeout: 2600 });
  });

  test("uses the approved workflow-first section sequence", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Launch recognition, rewards, and reports without operational chaos." })).toBeVisible();
    const sequence = await page.locator("[data-operator-section]").evaluateAll((sections) =>
      sections.map((section) => section.dataset.operatorSection)
    );
    expect(sequence).toEqual(["hero", "setup", "daily-workflows", "controls", "automation", "conversion"]);
  });

  test("uses local product artwork and accessible operational reporting", async ({ page }) => {
    await expect(page.locator(".operator-dashboard-shot")).toHaveAttribute("src", "/assets/operator/recognition-dashboard.png");
    await expect(page.getByRole("img", { name: "Wallet activity trend" })).toBeAttached();
    await expect(page.getByText("Wallet activity increased across four completed reward cycles.")).toBeAttached();
    await expect(page.getByRole("table", { name: "Admin audit log" })).toBeAttached();
    await expect(page.getByRole("link", { name: "Join waitlist", exact: true }).first()).toHaveAttribute("href", "/contact");
    await expect(page.getByRole("link", { name: "See setup flow", exact: true })).toHaveAttribute("href", "#operator-setup");
  });
});

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
});

test.describe("homepage Visionary design system", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("uses the local cinematic artwork", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-personality="visionary"]')).toBeVisible();
    const artworkSource = await readFile(new URL("../assets/visionary/culture-orbit.svg", import.meta.url), "utf8");
    expect(artworkSource).toContain("Culture orbit");
  });

  test("defines the supplied dark Visionary tokens", async () => {
    const css = await readFile(new URL("../site.css", import.meta.url), "utf8");
    for (const token of [
      "--dv-surface: #090a16",
      "--dv-section: #111328",
      "--dv-elevated: #171a34",
      "--dv-text: #f8fafc",
      "--dv-muted: #b8c0d9",
      "--dv-violet: #8b5cf6",
      "--dv-orchid: #d946ef",
      "--dv-coral: #ff6b5f",
      "--dv-gold: #f5c542",
      "--dv-cyan: #22d3ee"
    ]) {
      expect(css).toContain(token);
    }
  });
});

test.describe("homepage Strategist design system", () => {
  test("defines the supplied enterprise tokens", async () => {
    const css = await readFile(new URL("../site.css", import.meta.url), "utf8");
    for (const token of [
      "--st-surface-primary: #f8fafc",
      "--st-surface-secondary: #ffffff",
      "--st-surface-tertiary: #eef2f7",
      "--st-surface-dark: #0f172a",
      "--st-text-primary: #111827",
      "--st-text-secondary: #475569",
      "--st-brand-primary: #4f46e5",
      "--st-brand-secondary: #2563eb",
      "--st-brand-accent: #06b6d4",
      "--st-success: #10b981",
      "--st-warning: #f59e0b"
    ]) {
      expect(css).toContain(token);
    }
  });

  test("uses a fluid container capped at 1440px on wide displays", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.locator('[data-personality="strategist"]').click();
    await page.locator("[data-enter-visionary]").click();
    await expect(page.locator('[data-experience-view="strategist-home"]')).toBeVisible({ timeout: 2600 });
    const box = await page.locator(".strategist-container").first().boundingBox();
    expect(box.width).toBeLessThanOrEqual(1440);
    expect(Math.abs(box.x - (1920 - box.width) / 2)).toBeLessThan(2);
  });
});

test.describe("homepage Operator design system", () => {
  test("defines the supplied operational tokens", async () => {
    const css = await readFile(new URL("../site.css", import.meta.url), "utf8");
    for (const token of [
      "--op-surface-primary: #080a0f",
      "--op-surface-secondary: #10131b",
      "--op-surface-tertiary: #171b26",
      "--op-surface-elevated: #202636",
      "--op-text-primary: #f8fafc",
      "--op-text-secondary: #cbd5e1",
      "--op-text-muted: #94a3b8",
      "--op-accent-primary: #38bdf8",
      "--op-accent-teal: #2dd4bf",
      "--op-accent-violet: #a78bfa",
      "--op-accent-amber: #fbbf24"
    ]) expect(css).toContain(token);
  });

  test("uses a fluid container capped at 1440px on wide displays", async ({ page }) => {
    await page.setViewportSize({ width: 1920, height: 1080 });
    await page.goto("/");
    await page.locator('[data-personality="operator"]').click();
    await page.locator("[data-enter-visionary]").click();
    await expect(page.locator('[data-experience-view="operator-home"]')).toBeVisible({ timeout: 2600 });
    const box = await page.locator(".operator-container").first().boundingBox();
    expect(box.width).toBeLessThanOrEqual(1440);
    expect(Math.abs(box.x - (1920 - box.width) / 2)).toBeLessThan(2);
  });

  for (const viewport of [
    { width: 1440, height: 900 },
    { width: 1024, height: 768 },
    { width: 768, height: 1024 },
    { width: 390, height: 844 },
    { width: 320, height: 568 }
  ]) {
    test(`fits the Operator journey at ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto("/");
      await page.locator('[data-personality="operator"]').click();
      await page.locator("[data-enter-visionary]").click();
      await expect(page.locator('[data-experience-view="operator-home"]')).toBeVisible({ timeout: 2600 });
      const dimensions = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }));
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    });
  }
});

const routes = [
  {
    path: "/",
    title: "EzRewards | Employee Recognition and Rewards",
    description: /employee appreciation/i
  },
  {
    path: "/product",
    title: "Product | EzRewards Employee Recognition Platform",
    description: /recognition/i
  },
  {
    path: "/about",
    title: "About EzRewards | Better Employee Appreciation",
    description: /appreciation/i
  },
  {
    path: "/contact",
    title: "Contact EzRewards | Early Access",
    description: /early access/i
  }
];

const productionOrigin = "https://website-mini-homepage.vercel.app";

const viewports = [
  { width: 1440, height: 900 },
  { width: 1024, height: 768 },
  { width: 768, height: 1024 },
  { width: 390, height: 844 },
  { width: 320, height: 568 }
];

for (const route of routes) {
  test(`${route.path} has complete document metadata and landmarks`, async ({ page }) => {
    await page.goto(route.path);

    await expect(page).toHaveTitle(route.title);
    await expect(page.locator('meta[name="description"]')).toHaveAttribute(
      "content",
      route.description
    );
    await expect(page.locator("html")).toHaveAttribute("lang", "en");
    await expect(page.locator("h1").first()).toBeAttached();
    await expect(page.locator("main#main-content")).toHaveCount(1);
    await expect(page.locator('a[href="#main-content"]')).toHaveCount(1);
    await expect(page.locator('link[rel="canonical"]')).toHaveAttribute(
      "href",
      `${productionOrigin}${route.path}`
    );
    await expect(page.locator('meta[property="og:url"]')).toHaveAttribute(
      "content",
      `${productionOrigin}${route.path}`
    );
  });

  for (const viewport of viewports) {
    test(`${route.path} fits ${viewport.width}x${viewport.height}`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await page.goto(route.path);
      const widths = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth
      }));
      expect(widths.scroll).toBeLessThanOrEqual(widths.client);
    });
  }
}

test("button links are not underlined and active navigation remains distinct", async ({ page }) => {
  await page.goto("/");
  await expect(page.getByRole("link", { name: "Book a Demo", exact: true }).first())
    .toHaveCSS("text-decoration-line", "none");
  await expect(page.locator('[data-personality="visionary"]')).toHaveCSS("cursor", "pointer");
});

test("robots and sitemap expose all production routes", async ({ request }) => {
  const robots = await request.get("/robots.txt");
  expect(robots.ok()).toBeTruthy();
  expect(await robots.text()).toContain(`${productionOrigin}/sitemap.xml`);

  const sitemap = await request.get("/sitemap.xml");
  expect(sitemap.ok()).toBeTruthy();
  const sitemapText = await sitemap.text();
  for (const route of routes) {
    expect(sitemapText).toContain(`<loc>${productionOrigin}${route.path}</loc>`);
  }
});

test("mobile navigation exposes and updates its expanded state", async ({ page }) => {
  await page.setViewportSize({ width: 390, height: 844 });
  await page.goto("/");
  await page.locator('[data-personality="visionary"]').click();
  await page.locator("[data-enter-visionary]").click();
  const visionaryHome = page.locator('[data-experience-view="visionary-home"]');
  await expect(visionaryHome).toBeVisible({ timeout: 2600 });

  const toggle = visionaryHome.locator("[data-menu-toggle]");
  await expect(toggle).toHaveAccessibleName("Open navigation");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("navigation", { name: "Primary" })).toBeVisible();
  await page.keyboard.press("Escape");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
});

test("demo form controls have accessible names and validate required fields", async ({ page }) => {
  await page.goto("/contact");

  const form = page.locator("form[data-demo-form]");
  await expect(form).toHaveCount(1);
  for (const control of await form.locator("input, select, textarea").all()) {
    expect(await control.getAttribute("id")).toBeTruthy();
    expect(await control.getAttribute("name")).toBeTruthy();
    await expect(page.locator(`label[for="${await control.getAttribute("id")}"]`)).toHaveCount(1);
  }

  await form.getByRole("button", { name: "Send message" }).click();
  await expect(form.locator(":invalid")).not.toHaveCount(0);
});

test("placeholder legal and social labels are not interactive", async ({ page }) => {
  await page.goto("/");
  for (const label of ["Privacy", "Terms", "LinkedIn"]) {
    await expect(page.getByText(label, { exact: true })).not.toHaveAttribute("href");
  }
});

test("reduced motion disables page animations", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("http://127.0.0.1:4174/");
  const transitionSeconds = await page.locator(".personality-card").first().evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).transitionDuration)
  );
  expect(transitionSeconds).toBeLessThanOrEqual(0.00001);
  await context.close();
});

test("pages render when outbound network access is unavailable", async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:4174)/, (route) => route.abort());
  for (const route of routes) {
    await page.goto(route.path);
    await expect(page.locator("h1").first()).toBeAttached();
  }
});

test("internal links and section anchors resolve", async ({ page, request }) => {
  for (const route of routes) {
    await page.goto(route.path);
    const hrefs = await page.locator('a[href^="/"], a[href^="#"]').evaluateAll((links) =>
      [...new Set(links.map((link) => link.getAttribute("href")))]
    );

    for (const href of hrefs) {
      if (href.startsWith("#")) {
        await expect(page.locator(href)).toHaveCount(1);
      } else {
        const response = await request.get(href);
        expect(response.ok(), `${route.path} links to ${href}`).toBeTruthy();
      }
    }
  }
});

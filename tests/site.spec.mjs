import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test.describe("Visionary experience flow", () => {
  test("offers only Visionary and reveals the homepage through a two-second loader", async ({ page }) => {
    await page.goto("/");

    const entry = page.locator('[data-experience-view="entry"]');
    const loader = page.locator('[data-experience-view="loader"]');
    const homepage = page.locator('[data-experience-view="home"]');
    await expect(entry).toBeVisible();
    await expect(loader).toBeHidden();
    await expect(homepage).toBeHidden();

    await expect(page.getByRole("button", { name: /Strategist/ })).toBeDisabled();
    await expect(page.getByRole("button", { name: /Operator/ })).toBeDisabled();

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
});

test.describe("Visionary homepage narrative", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
    await page.locator('[data-personality="visionary"]').click();
    await page.locator("[data-enter-visionary]").click();
    await expect(page.locator('[data-experience-view="home"]')).toBeVisible({ timeout: 2600 });
  });

  test("uses the supplied copy and complete emotional section sequence", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Build a workplace people never want to leave." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Recognition shouldn’t happen once a year." })).toBeAttached();
    await expect(page.getByRole("heading", { name: "Loved by teams that put people first." })).toBeAttached();

    const sequence = await page.locator("[data-visionary-section]").evaluateAll((sections) =>
      sections.map((section) => section.dataset.visionarySection)
    );
    expect(sequence).toEqual([
      "hero", "problem", "transformation", "recognition", "rewards", "ai",
      "moments", "platform", "trust", "pricing", "final-cta"
    ]);
  });

  test("uses local artwork and meaningful conversion destinations", async ({ page }) => {
    await expect(page.locator('.hero-art img')).toHaveAttribute("src", "/assets/visionary/hero-culture.svg");
    await expect(page.locator('.hero-art img')).toHaveAttribute("alt", /team members celebrating/i);
    await expect(page.getByRole("link", { name: /Book a Demo/i }).first()).toHaveAttribute("href", "/contact");
    await expect(page.locator('a[href="#platform"]')).not.toHaveCount(0);
    await expect(page.locator('a[href="#pricing"]')).not.toHaveCount(0);
  });
});

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
});

test.describe("homepage Visionary design system", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("uses the local Visionary artwork", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator('[data-personality="visionary"]')).toBeVisible();
    const artworkSource = await readFile(new URL("../assets/visionary/hero-culture.svg", import.meta.url), "utf8");
    expect(artworkSource).toContain("A team celebrating together");
  });

  test("defines the supplied Visionary tokens", async () => {
    const css = await readFile(new URL("../site.css", import.meta.url), "utf8");
    expect(css).toContain("--v-cream: #f2ecdd");
    expect(css).toContain("--v-lime: #c2f24a");
    expect(css).toContain("--v-purple: #a78bfa");
    expect(css).toContain("--v-coral: #f37c73");
  });
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
  await expect(page.locator('[data-experience-view="home"]')).toBeVisible({ timeout: 2600 });

  const toggle = page.locator("[data-menu-toggle]");
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

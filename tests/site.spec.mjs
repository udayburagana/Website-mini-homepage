import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
});

test.describe("homepage Figma sync", () => {
  test.use({ viewport: { width: 1440, height: 900 } });

  test("uses the updated Figma artwork", async ({ page }) => {
    await page.goto("/");

    const heroArtwork = page.locator(".home-hero-artwork");
    await expect(heroArtwork).toHaveAttribute("src", "/assets/home/hero-corner.svg");
    await expect(heroArtwork).toHaveAttribute("alt", "");
    await expect(heroArtwork).toHaveCSS("width", "160px");
    await expect(heroArtwork).toHaveCSS("height", "160px");

    const icons = page.locator(".home-feature-icon img");
    await expect(icons).toHaveCount(6);
    for (const icon of await icons.all()) {
      await expect(icon).toHaveAttribute("alt", "");
      await expect(icon).toHaveAttribute("src", /\/assets\/home\/.+\.svg/);
    }
  });

  test("defines the updated desktop section geometry", async () => {
    const css = await readFile(new URL("../site.css", import.meta.url), "utf8");
    expect(css).toMatch(/\.home-marquee\s*\{[^}]*height:\s*51px/s);
    expect(css).toMatch(/\.home-flow\s*\{[^}]*height:\s*622px/s);
    expect(css).toMatch(/\.home-features\s*\{[^}]*height:\s*964px/s);
    expect(css).toMatch(/\.home-footer\s*\{[^}]*height:\s*328px/s);
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
    await expect(page.locator("h1")).toHaveCount(1);
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

  await expect(page.getByRole("link", { name: "Join the Waitlist", exact: true }).first())
    .toHaveCSS("text-decoration-line", "none");
  await expect(page.getByRole("navigation").getByRole("link", { name: "Home" }))
    .toHaveCSS("text-decoration-line", "underline");
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

  const toggle = page.locator("[data-menu-toggle]");
  await expect(toggle).toHaveAccessibleName("Open navigation");
  await expect(toggle).toHaveAttribute("aria-expanded", "false");
  await toggle.click();
  await expect(toggle).toHaveAttribute("aria-expanded", "true");
  await expect(page.getByRole("navigation")).toBeVisible();
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
  for (const label of ["Privacy Policy", "Terms of Use", "LinkedIn"]) {
    await expect(page.getByText(label, { exact: true })).not.toHaveAttribute("href");
  }
});

test("reduced motion disables page animations", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("http://127.0.0.1:4174/");
  const animated = page.locator('[style*="animation"]').first();
  await expect(animated).toHaveCSS("animation-name", "none");
  await context.close();
});

test("pages render when outbound network access is unavailable", async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:4174)/, (route) => route.abort());
  for (const route of routes) {
    await page.goto(route.path);
    await expect(page.locator("h1")).toBeVisible();
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

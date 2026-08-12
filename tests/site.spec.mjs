import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test.describe("personality-led homepage", () => {
  test("opens directly on the Visionary homepage with all personalities available", async ({ page }) => {
    await page.goto("/");
    await expect(page.getByRole("heading", { name: "Build the kind of workplace people remember." })).toBeVisible();
    await expect(page.getByRole("tab", { name: "Visionary" })).toHaveAttribute("aria-selected", "true");
    await expect(page.getByRole("tab", { name: "Strategist" })).toBeEnabled();
    await expect(page.getByRole("tab", { name: "Operator" })).toBeEnabled();
    await expect(page.locator(".experience-entry, .experience-loader")).toHaveCount(0);
  });

  test("switches personality without reloading and creates shareable remembered state", async ({ page }) => {
    await page.goto("/");
    await page.getByRole("tab", { name: "Strategist" }).click();
    await expect(page).toHaveURL(/persona=strategist/);
    await expect(page.locator('[data-persona-page="strategist"]')).toBeVisible();
    await expect(page.locator('[data-persona-page="visionary"]')).toBeHidden();
    await expect(page.getByRole("heading", { name: "Make appreciation a visible, structured part of how your company operates." })).toBeVisible();
    await expect(page.evaluate(() => localStorage.getItem("ezrewards-persona"))).resolves.toBe("strategist");

    await page.getByRole("tab", { name: "Operator" }).click();
    await expect(page).toHaveURL(/persona=operator/);
    await expect(page.getByRole("heading", { name: "Run recognition and rewards without creating more work for your team." })).toBeVisible();
  });

  test("renders the complete Strategist narrative and functional destinations", async ({ page }) => {
    await page.goto("/?persona=strategist");
    const sequence = await page.locator("[data-strategist-section]").evaluateAll((sections) =>
      sections.map((section) => section.dataset.strategistSection)
    );
    expect(sequence).toEqual([
      "hero", "problem", "vision", "category", "loop", "capabilities", "outcomes",
      "early-access", "pricing", "faq", "final-cta"
    ]);
    await expect(page.getByRole("heading", { name: "Companies invest in appreciation without a clear view of how it is working." })).toBeAttached();
    await expect(page.getByRole("heading", { name: "What if recognition became a system—not a collection of initiatives?" })).toBeAttached();
    await expect(page.getByRole("heading", { name: "A complete recognition platform for $1 per employee/month." })).toBeAttached();
    await expect(page.getByRole("link", { name: "Explore the Product", exact: true })).toHaveAttribute("href", "/product");
    await expect(page.getByRole("link", { name: "See measurable outcomes", exact: true })).toHaveAttribute("href", "#strategist-outcomes");
    const strategistPage = page.locator('[data-persona-page="strategist"]');
    await strategistPage.getByText("What is EzRewards?", { exact: true }).click();
    await expect(strategistPage.getByText(/connects peer recognition, company-wide appreciation/)).toBeVisible();
  });

  test("uses the light analytical Strategist visual system", async ({ page }) => {
    await page.goto("/?persona=strategist");
    await expect(page.locator('[data-persona-page="strategist"]')).toHaveCSS("background-color", "rgb(246, 248, 252)");
    await expect(page.locator(".strategist-card").first()).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(page.locator(".strategist-button--primary").first()).toHaveCSS("background-color", "rgb(79, 70, 229)");
  });

  test("keeps Strategist workflow cards clean, consistently spaced, and its early-access CTA readable", async ({ page }) => {
    await page.goto("/?persona=strategist");

    const workflowCard = page.locator(".strategist-steps li").first();
    await expect(workflowCard).toHaveCSS("row-gap", "8px");
    expect(await workflowCard.evaluate((card) => getComputedStyle(card, "::after").content)).toBe("none");

    await expect(page.locator(".strategist-capabilities article").first()).toHaveCSS("row-gap", "8px");

    const earlyAccessCta = page.locator(".strategist-section--indigo .strategist-button--light");
    await expect(earlyAccessCta).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(earlyAccessCta).toHaveCSS("color", "rgb(79, 70, 229)");
  });

  test("renders the complete Operator narrative and functional destinations", async ({ page }) => {
    await page.goto("/?persona=operator");
    await expect(page.locator('[data-persona-page="operator"]')).toBeVisible();
    await expect(page.locator('[data-persona-page="visionary"]')).toBeHidden();
    await expect(page.locator('[data-persona-page="strategist"]')).toBeHidden();
    const sequence = await page.locator("[data-operator-section]").evaluateAll((sections) =>
      sections.map((section) => section.dataset.operatorSection)
    );
    expect(sequence).toEqual([
      "hero", "problem", "vision", "category", "loop", "capabilities", "outcomes",
      "early-access", "pricing", "faq", "final-cta"
    ]);
    await expect(page.getByRole("heading", { name: "Run recognition and rewards without creating more work for your team." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "Recognition should not require spreadsheets, reminders and disconnected tools." })).toBeAttached();
    await expect(page.getByRole("heading", { name: "Run the complete platform for $1 per employee/month." })).toBeAttached();
    await expect(page.getByRole("link", { name: "See How It Works", exact: true })).toHaveAttribute("href", "#operator-workflow");
    await page.getByText("What can administrators manage?", { exact: true }).click();
    await expect(page.getByText(/manage employee access, roles, active seats/)).toBeVisible();
  });

  test("uses the dark cyan Operator visual system", async ({ page }) => {
    await page.goto("/?persona=operator");
    await expect(page.locator('[data-persona-page="operator"]')).toHaveCSS("background-color", "rgb(6, 9, 15)");
    await expect(page.locator(".operator-card").first()).toHaveCSS("background-color", "rgb(23, 29, 42)");
    await expect(page.locator(".operator-button--primary").first()).toHaveCSS("background-color", "rgb(56, 189, 248)");
  });

  test("bottom-aligns the Operator problem copy and keeps its early-access CTA readable", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/?persona=operator");

    const problemRow = page.locator('[data-operator-section="problem"] .operator-heading-row');
    const [headingBox, copyBox] = await Promise.all([
      problemRow.locator("h2").boundingBox(),
      problemRow.locator(":scope > div").boundingBox()
    ]);
    expect(Math.abs((headingBox.y + headingBox.height) - (copyBox.y + copyBox.height))).toBeLessThanOrEqual(2);

    const earlyAccessCta = page.locator(".operator-section--cyan .operator-button--dark");
    await expect(earlyAccessCta).toHaveCSS("background-color", "rgb(6, 16, 25)");
    await expect(earlyAccessCta).toHaveCSS("color", "rgb(255, 255, 255)");
  });

  test("Operator capability cards use the technical vector grid without changing copy", async ({ page }) => {
    const expectedTitles = [
      "Let employees recognize great work in a few steps",
      "Help employees move past the blank message box",
      "Keep appreciation visible in one shared place",
      "Configure rewards once and manage them centrally",
      "Handle one-off and bulk reward actions efficiently",
      "Add employees through the method that fits your setup",
      "Open a report instead of building one",
      "Ask the report instead of searching through it"
    ];

    const gridShape = async () => page.locator(".operator-capabilities article").evaluateAll((cards) => {
      const positions = cards.map((card) => card.getBoundingClientRect());
      const unique = (values) => new Set(values.map((value) => Math.round(value)));
      return {
        columns: unique(positions.map(({ x }) => x)).size,
        rows: unique(positions.map(({ y }) => y)).size
      };
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/?persona=operator");
    const cards = page.locator(".operator-capabilities article");
    await expect(cards).toHaveCount(8);
    expect(await cards.locator("h3").allTextContents()).toEqual(expectedTitles);
    await expect(page.locator('.operator-capability-visual[aria-hidden="true"]')).toHaveCount(8);
    expect(await gridShape()).toEqual({ columns: 4, rows: 2 });

    await page.setViewportSize({ width: 900, height: 900 });
    expect(await gridShape()).toEqual({ columns: 2, rows: 4 });

    await page.setViewportSize({ width: 390, height: 844 });
    expect(await gridShape()).toEqual({ columns: 1, rows: 8 });
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  for (const width of [320, 390, 768, 1024, 1440]) {
    test(`Operator fits ${width}px without horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/?persona=operator");
      const widths = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth
      }));
      expect(widths.scroll).toBeLessThanOrEqual(widths.client);
    });
  }
});

test.describe("Visionary homepage narrative", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/");
  });

  test("uses the approved value-led copy and complete section sequence", async ({ page }) => {
    await expect(page.getByRole("heading", { name: "Culture grows from the moments people choose to notice." })).toBeAttached();
    await expect(page.getByRole("heading", { name: "Great work happens every day. Too much of it disappears unnoticed." })).toBeAttached();
    await expect(page.getByRole("heading", { name: "One connected place for appreciation to become action." })).toBeAttached();

    const sequence = await page.locator("[data-home-section]").evaluateAll((sections) =>
      sections.map((section) => section.dataset.homeSection)
    );
    expect(sequence).toEqual([
      "hero", "belief", "culture-gap", "values", "transformation", "appreciation-loop",
      "impact", "product-bridge", "audience", "emotional-proof", "early-access"
    ]);
  });

  test("uses local artwork and meaningful conversion destinations", async ({ page }) => {
    await expect(page.locator(".culture-orbit img")).toHaveAttribute("src", "/assets/visionary/culture-orbit.svg");
    await expect(page.getByRole("link", { name: /Join Waitlist/ }).first()).toHaveAttribute("href", "/contact");
    await expect(page.getByRole("link", { name: "Explore the Product", exact: true })).toHaveAttribute("href", "/product");
    await expect(page.locator('a[href="#appreciation-loop"]')).not.toHaveCount(0);
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
    await expect(page.getByRole("tab", { name: "Visionary" })).toBeVisible();
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

test("Visionary sections use the refined heading, layout, and loop-card treatment", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?persona=visionary");

  const sectionHeadingSizes = await page.locator('[data-persona-page="visionary"] .persona-section h2').evaluateAll((headings) =>
    headings.filter((heading) => heading.getClientRects().length).map((heading) => Number.parseFloat(getComputedStyle(heading).fontSize))
  );
  expect(Math.max(...sectionHeadingSizes)).toBeLessThanOrEqual(80);

  const cultureGap = page.locator("#culture-gap");
  const cultureHeading = cultureGap.getByRole("heading", { level: 2 });
  const [sectionBox, headingBox] = await Promise.all([cultureGap.boundingBox(), cultureHeading.boundingBox()]);
  expect(headingBox.x - sectionBox.x).toBeLessThanOrEqual(100);

  const transformationBackground = await page.locator('[data-home-section="transformation"]').evaluate((section) => getComputedStyle(section).backgroundColor);
  expect(transformationBackground).not.toBe("rgb(242, 236, 221)");

  const loop = page.locator("#appreciation-loop");
  const cardGeometry = await loop.locator(".loop-grid article").evaluateAll((cards) => cards.map((card) => {
    const cardBox = card.getBoundingClientRect();
    const numberBox = card.querySelector("span").getBoundingClientRect();
    return {
      radius: getComputedStyle(card).borderRadius,
      numberContained: numberBox.left >= cardBox.left && numberBox.right <= cardBox.right && numberBox.top >= cardBox.top && numberBox.bottom <= cardBox.bottom
    };
  }));
  expect(new Set(cardGeometry.map(({ radius }) => radius))).toEqual(new Set(["24px"]));
  expect(cardGeometry.every(({ numberContained }) => numberContained)).toBeTruthy();

  const [loopBox, ctaBox] = await Promise.all([loop.boundingBox(), loop.getByRole("link", { name: /Join Waitlist/ }).boundingBox()]);
  expect(Math.abs((ctaBox.x + ctaBox.width / 2) - (loopBox.x + loopBox.width / 2))).toBeLessThanOrEqual(2);
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
    path: "/pricing",
    title: "Pricing | EzRewards Employee Recognition Platform",
    description: /pricing/i
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
  await expect(page.getByRole("link", { name: "Join Waitlist", exact: true }).first())
    .toHaveCSS("text-decoration-line", "none");
  await expect(page.getByRole("tab", { name: "Visionary" })).toHaveCSS("cursor", "pointer");
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
  const transitionSeconds = await page.locator(".persona-tab").first().evaluate((element) =>
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

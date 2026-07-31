import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";

async function openPersonality(page, personality) {
  await page.goto("/");
  await page.locator(`[data-personality="${personality}"]`).click();
  await page.locator("[data-enter-visionary]").click();
  await expect(page.locator(`[data-experience-view="${personality}-home"]`))
    .toBeVisible({ timeout: 4000 });
}

function contrastRatio(first, second) {
  const luminance = (value) => {
    const channels = value.match(/[\d.]+/g).slice(0, 3).map((channel) => {
      const normalized = Number(channel) / 255;
      return normalized <= 0.04045
        ? normalized / 12.92
        : ((normalized + 0.055) / 1.055) ** 2.4;
    });
    return 0.2126 * channels[0] + 0.7152 * channels[1] + 0.0722 * channels[2];
  };
  const a = luminance(first);
  const b = luminance(second);
  return (Math.max(a, b) + 0.05) / (Math.min(a, b) + 0.05);
}

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

test.describe("homepage CTA and accessibility remediation", () => {
  const personalities = [
    {
      name: "visionary",
      home: "visionary-home",
      button: ".dark-button--primary",
      expectedBackground: "rgb(130, 71, 245)",
      expectedColor: "rgb(248, 250, 252)"
    },
    {
      name: "strategist",
      home: "strategist-home",
      button: ".strategist-button--primary",
      expectedBackground: "rgb(79, 70, 229)",
      expectedColor: "rgb(248, 250, 252)"
    },
    {
      name: "operator",
      home: "operator-home",
      button: ".operator-button--primary",
      expectedBackground: "rgb(56, 189, 248)",
      expectedColor: "rgb(6, 16, 25)"
    }
  ];

  for (const personality of personalities) {
    test(`${personality.name} primary CTAs retain their fill, contrast, and solid shadow`, async ({ page }) => {
      await openPersonality(page, personality.name);
      const home = page.locator(`[data-experience-view="${personality.home}"]`);
      const buttons = home.locator(personality.button);
      const count = await buttons.count();
      expect(count).toBeGreaterThan(1);

      for (let index = 0; index < count; index += 1) {
        const button = buttons.nth(index);
        const styles = await button.evaluate((element) => {
          const computed = getComputedStyle(element);
          return {
            background: computed.backgroundColor,
            color: computed.color,
            fontSize: computed.fontSize,
            shadow: computed.boxShadow
          };
        });
        expect(styles.background).toBe(personality.expectedBackground);
        expect(styles.color).toBe(personality.expectedColor);
        expect(Number.parseFloat(styles.fontSize)).toBeGreaterThanOrEqual(16);
        expect(styles.shadow).not.toContain("rgba(");
        expect(styles.shadow).not.toBe("none");
        expect(contrastRatio(styles.color, styles.background)).toBeGreaterThanOrEqual(4.5);
      }
    });
  }

  test("skip link tracks the active experience main landmark", async ({ page }) => {
    await page.goto("/");
    await expect(page.locator(".skip-link")).toHaveAttribute("href", "#entry-main");

    for (const personality of personalities) {
      await page.locator(`[data-personality="${personality.name}"]`).click();
      await page.locator("[data-enter-visionary]").click();
      await expect(page.locator(`[data-experience-view="${personality.home}"]`))
        .toBeVisible({ timeout: 4000 });
      await expect(page.locator(".skip-link"))
        .toHaveAttribute("href", `#${personality.name}-main`);
      await expect(page.locator(`main#${personality.name}-main`)).toBeVisible();
      await page.locator(`[data-experience-view="${personality.home}"] [data-change-experience]`).click();
      await expect(page.locator(".skip-link")).toHaveAttribute("href", "#entry-main");
    }
  });

  test("programmatically focused headings do not render a decorative outline", async ({ page }) => {
    await openPersonality(page, "visionary");
    const heading = page.locator('[data-experience-view="visionary-home"] h1');
    await page.keyboard.press("Tab");
    await heading.evaluate((element) => element.focus());
    await expect(heading).toBeFocused();
    await expect(heading).toHaveCSS("outline-style", "none");
  });

  test("illustrative product controls are not keyboard buttons", async ({ page }) => {
    await openPersonality(page, "operator");
    const previews = page.locator(".setup-console, .workflow-board, .controls-grid, .ai-console");
    await expect(previews.locator("button")).toHaveCount(0);
    await expect(previews.locator("[data-product-preview-control]")).not.toHaveCount(0);
    await expect(page.locator(".table-scroll")).toHaveAttribute("tabindex", "0");
  });

  test("all personality navigation collapses at the tablet breakpoint", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    for (const personality of personalities) {
      await openPersonality(page, personality.name);
      const home = page.locator(`[data-experience-view="${personality.home}"]`);
      await expect(home.locator("[data-menu-toggle]")).toBeVisible();
      await expect(home.locator(".primary-navigation")).toBeHidden();
      await home.locator("[data-menu-toggle]").click();
      await expect(home.locator(".primary-navigation")).toBeVisible();
      await expect(home.locator(personality.button).first()).toBeVisible();
      await home.locator("[data-change-experience]").click();
    }
  });

  for (const viewport of [
    { width: 390, height: 844 },
    { width: 320, height: 568 }
  ]) {
    test(`Visionary content remains inside the viewport at ${viewport.width}px`, async ({ page }) => {
      await page.setViewportSize(viewport);
      await openPersonality(page, "visionary");
      const bounds = await page.locator('[data-experience-view="visionary-home"] main')
        .evaluate((main) => [...main.querySelectorAll("h1, h2, p, a, article, [class$='actions']")]
          .filter((element) => {
            const style = getComputedStyle(element);
            const rect = element.getBoundingClientRect();
            return style.position !== "absolute" && rect.width > 0 && rect.height > 0;
          })
          .map((element) => {
            const rect = element.getBoundingClientRect();
            return { left: rect.left, right: rect.right, text: element.textContent.trim().slice(0, 40) };
          }));
      for (const item of bounds) {
        expect(item.left, item.text).toBeGreaterThanOrEqual(-0.5);
        expect(item.right, item.text).toBeLessThanOrEqual(viewport.width + 0.5);
      }
    });
  }

  for (const personality of personalities) {
    test(`${personality.name} mobile menu has usable targets and keyboard focus`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await openPersonality(page, personality.name);
      const home = page.locator(`[data-experience-view="${personality.home}"]`);
      const toggle = home.locator("[data-menu-toggle]");
      await toggle.click();
      await expect(home.locator(".primary-navigation a").first()).toBeFocused();

      const targetSizes = await home.locator("[data-menu-toggle], .primary-navigation > *")
        .evaluateAll((elements) => elements.map((element) => {
          const rect = element.getBoundingClientRect();
          return { width: rect.width, height: rect.height, text: element.textContent.trim() };
        }));
      for (const target of targetSizes) {
        expect(target.height, target.text).toBeGreaterThanOrEqual(44);
        expect(target.width, target.text).toBeGreaterThanOrEqual(44);
      }
    });

    test(`${personality.name} remains readable with WCAG text spacing`, async ({ page }) => {
      await page.setViewportSize({ width: 390, height: 844 });
      await openPersonality(page, personality.name);
      await page.addStyleTag({ content: `
        * { line-height: 1.5 !important; letter-spacing: .12em !important; word-spacing: .16em !important; }
        p { margin-bottom: 2em !important; }
      ` });
      const home = page.locator(`[data-experience-view="${personality.home}"]`);
      const dimensions = await home.evaluate((element) => ({
        left: element.getBoundingClientRect().left,
        right: element.getBoundingClientRect().right,
        scrollWidth: document.documentElement.scrollWidth,
        clientWidth: document.documentElement.clientWidth
      }));
      expect(dimensions.left).toBeGreaterThanOrEqual(0);
      expect(dimensions.right).toBeLessThanOrEqual(390);
      expect(dimensions.scrollWidth).toBeLessThanOrEqual(dimensions.clientWidth);
    });
  }
});

test.describe("WCAG 2.2 AA automated audit", () => {
  const axeTags = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];

  test("entry and loader have no detectable WCAG violations", async ({ page }) => {
    await page.goto("/");
    const entryResults = await new AxeBuilder({ page }).withTags(axeTags).analyze();
    expect(entryResults.violations).toEqual([]);

    await page.locator('[data-personality="visionary"]').click();
    await page.locator("[data-enter-visionary]").click();
    await expect(page.locator('[data-experience-view="loader"]')).toBeVisible();
    const loaderResults = await new AxeBuilder({ page }).withTags(axeTags).analyze();
    expect(loaderResults.violations).toEqual([]);
  });

  for (const personality of ["visionary", "strategist", "operator"]) {
    test(`${personality} homepage has no detectable WCAG violations`, async ({ page }) => {
      await openPersonality(page, personality);
      const results = await new AxeBuilder({ page }).withTags(axeTags).analyze();
      expect(results.violations).toEqual([]);
    });
  }
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
    const expectedMain = route.path === "/" ? "entry-main" : "main-content";
    await expect(page.locator(`main#${expectedMain}`)).toHaveCount(1);
    await expect(page.locator(`a[href="#${expectedMain}"]`)).toHaveCount(1);
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

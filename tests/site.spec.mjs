import { dismissInitialChooser } from "./fixtures/persona.mjs";
import { expect, test } from "@playwright/test";
import { readFile } from "node:fs/promises";

test.describe("personality-led homepage", () => {
  test("opens directly on the neutral homepage with all personalities available", async ({ page }) => {
    await page.goto("/?persona=default"); await dismissInitialChooser(page);
    await expect(page.getByRole("heading", { level: 1, name: "Recognition, rewards and culture visibility in one platform." })).toBeVisible();
    await page.getByRole("button", { name: "Change experience" }).first().click();
    await expect(page.getByRole("button", { name: /Visionary/ })).toBeEnabled();
    await expect(page.getByRole("button", { name: /Strategist/ })).toBeEnabled();
    await expect(page.getByRole("button", { name: /Operator/ })).toBeEnabled();
    await expect(page.getByRole("button", { name: /Creative Culture Builder/ })).toBeEnabled();
    await expect(page.locator(".experience-entry, .experience-loader")).toHaveCount(0);
  });

  test("switches personality without reloading and creates shareable remembered state", async ({ page }) => {
    await page.goto("/?persona=default"); await dismissInitialChooser(page);
    await page.getByRole("button", { name: "Change experience" }).first().click();
    await page.getByRole("button", { name: /Strategist/ }).click();
    await expect(page).toHaveURL(/persona=strategist/);
    await expect(page.locator('[data-persona-page="strategist"]')).toBeVisible();
    await expect(page.locator('[data-persona-page="visionary"]')).toBeHidden();
    await expect(page.getByRole("heading", { name: "Make appreciation a visible, structured part of how your company operates." })).toBeVisible();
    await expect(page.evaluate(() => localStorage.getItem("ezrewards-persona"))).resolves.toBe("strategist");

    await page.getByRole("button", { name: "Change experience" }).first().click();
    await page.getByRole("button", { name: /Operator/ }).click();
    await expect(page).toHaveURL(/persona=operator/);
    await expect(page.getByRole("heading", { name: "Run recognition and rewards without creating more work for your team." })).toBeVisible();
  });

  test("renders the complete Strategist narrative and functional destinations", async ({ page }) => {
    await page.goto("/?persona=strategist"); await dismissInitialChooser(page);
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
    await expect(page.getByRole("link", { name: "Book a Demo", exact: true })).toHaveAttribute("href", "/demo.html?persona=strategist");
    await expect(page.getByRole("link", { name: "See measurable outcomes", exact: true })).toHaveAttribute("href", "#strategist-outcomes");
    const strategistPage = page.locator('[data-persona-page="strategist"]');
    await strategistPage.getByText("What is EzRewards?", { exact: true }).click();
    await expect(strategistPage.getByText(/connects peer recognition, company-wide appreciation/)).toBeVisible();
  });

  test("uses the midnight cinematic Strategist visual system", async ({ page }) => {
    await page.goto("/?persona=strategist"); await dismissInitialChooser(page);
    await expect(page.locator('[data-persona-page="strategist"]')).toHaveAttribute("data-strategist-engine", "elva-inspired");
    await expect(page.locator('[data-persona-page="strategist"]')).toHaveCSS("background-color", "rgb(3, 7, 19)");
    await expect(page.locator(".strategist-workflow__card").first()).toHaveCSS("background-image", /linear-gradient/);
    await expect(page.locator(".strategist-hero .strategist-button--primary").first()).toHaveCSS("background-color", "rgb(137, 233, 255)");
  });

  test("keeps the current Strategist workflow hierarchy and its early-access CTA readable", async ({ page }) => {
    await page.goto("/?persona=strategist"); await dismissInitialChooser(page);

    const workflowCards = page.locator(".strategist-workflow__card");
    await expect(workflowCards).toHaveCount(4);
    await expect(workflowCards.first().locator("h3")).toHaveCSS("font-size", "28px");
    await expect(page.locator('[data-strategist-section="capabilities"] .sc-features__tabs [role="tab"]')).toHaveCount(4);
    await expect(page.locator('[data-strategist-section="capabilities"] [role="tabpanel"]')).toHaveCount(4);

    const earlyAccessCta = page.locator(".strategist-section--indigo .strategist-button--light");
    await expect(earlyAccessCta).toHaveCSS("background-color", "rgb(255, 255, 255)");
    await expect(earlyAccessCta).toHaveCSS("color", "rgb(79, 70, 229)");
  });

  test("renders the complete Operator narrative and functional destinations", async ({ page }) => {
    await page.goto("/?persona=operator"); await dismissInitialChooser(page);
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
    await expect(page.getByRole("link", { name: "View Setup Flow", exact: true })).toHaveAttribute("href", "#operator-workflow");
    await page.getByText("What can administrators manage?", { exact: true }).click();
    await expect(page.getByText(/manage employee access, roles, active seats/)).toBeVisible();
  });

  test("uses the dark cyan Operator console visual system", async ({ page }) => {
    // Relative luminance of the first rgb()/rgba() colour in a computed value (WCAG formula).
    const luminance = (value) => {
      const [r, g, b] = value.match(/rgba?\(([^)]+)\)/)[1].split(",").slice(0, 3).map((channel) => {
        const c = Number(channel) / 255;
        return c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4;
      });
      return .2126 * r + .7152 * g + .0722 * b;
    };
    await page.goto("/?persona=operator"); await dismissInitialChooser(page);
    const operator = page.locator('[data-persona-page="operator"]');
    await expect(operator).toHaveAttribute("data-operator-engine", "console-cinematic");
    expect(luminance(await operator.evaluate((node) => getComputedStyle(node).backgroundColor))).toBeLessThan(.02);
    expect(luminance(await page.locator(".operator-card").first().evaluate((node) => getComputedStyle(node).backgroundImage))).toBeLessThan(.06);
    await expect(page.locator(".operator-button--primary").first()).toHaveCSS("background-color", "rgb(56, 189, 248)");
  });

  test("bottom-aligns the Operator problem copy and keeps its early-access CTA readable", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/?persona=operator"); await dismissInitialChooser(page);

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

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/?persona=operator"); await dismissInitialChooser(page);
    const capabilities = page.locator('[data-operator-section="capabilities"]');
    const cards = capabilities.locator(".operator-capabilities > article");
    await expect(cards).toHaveCount(8);
    expect(await cards.locator("h3").allTextContents()).toEqual(expectedTitles);
    await expect(page.locator('.operator-capability-visual[aria-hidden="true"]')).toHaveCount(8);
    await expect(capabilities.locator(".capability-selector")).toHaveCount(0);
    await expect(capabilities.getByRole("tab")).toHaveCount(8);

    // Phones keep the animated scene: points strip, phone mockup, one card at a time.
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(page.locator("[data-operator-cinematic]")).toHaveAttribute("data-operator-mode", "compact");
    await expect(capabilities.getByRole("tab")).toHaveCount(8);
    await expect(capabilities.locator(".operator-phone")).toBeVisible();
    expect(await cards.locator("h3").allTextContents()).toEqual(expectedTitles);
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(390);
  });

  for (const width of [320, 390, 768, 1024, 1440]) {
    test(`Operator fits ${width}px without horizontal overflow`, async ({ page }) => {
      await page.setViewportSize({ width, height: 844 });
      await page.goto("/?persona=operator"); await dismissInitialChooser(page);
      const widths = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth
      }));
      expect(widths.scroll).toBeLessThanOrEqual(widths.client);
    });
  }
});

test.describe("refreshed Visionary homepage", () => {
  test.beforeEach(async ({ page }) => {
    await page.goto("/?persona=visionary"); await dismissInitialChooser(page);
  });

  test("uses the complete approved eleven-section narrative", async ({ page }) => {
    const sequence = await page.locator("[data-home-section]").evaluateAll((sections) =>
      sections.map((section) => section.dataset.homeSection)
    );
    expect(sequence).toEqual([
      "hero", "problem", "vision", "category", "appreciation-loop", "capabilities",
      "outcomes", "early-access", "pricing", "faq", "final-cta"
    ]);
    await expect(page.getByRole("heading", { level: 1, name: "Build the workplace people want to belong to." })).toBeVisible();
    await expect(page.getByRole("heading", { name: "The work that moves companies forward rarely fits inside a performance review." })).toBeAttached();
    await expect(page.getByRole("heading", { name: "Meaningful culture for $1 per employee/month." })).toBeAttached();
    await expect(page.locator(".visionary-capability-card")).toHaveCount(8);
    await expect(page.locator("[data-how-it-works] [data-how-panel]")).toHaveCount(5);
    await expect(page.locator(".visionary-faq details")).toHaveCount(9);
  });

  test("uses the new Figma hero and meaningful conversion destinations", async ({ page }) => {
    const hero = page.locator('[data-persona-page="visionary"] [data-home-section="hero"]');
    await expect(hero.getByText("The culture operating system for modern teams", { exact: true })).toBeVisible();
    await expect(hero.getByText("Because when people feel seen, they do more than stay. They participate, contribute and grow.", { exact: true })).toBeVisible();
    await expect(hero.getByRole("link", { name: "Create your account", exact: true })).toHaveAttribute("href", "/signup.html?persona=visionary");
    await expect(hero.getByRole("link", { name: "See How It Works", exact: true })).toHaveAttribute("href", "#appreciation-loop");
    await expect(page.locator('a[href="#appreciation-loop"]')).not.toHaveCount(0);
    await expect(page.locator('[data-home-section="pricing"] a[href="/pricing"]')).toBeVisible();
  });

  test("uses the cinematic desktop typography, widths, cards, and dark surface", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    const styles = await page.locator('[data-persona-page="visionary"] .dark-hero h1').evaluate((node) => {
      const computed = getComputedStyle(node);
      return { fontSize: computed.fontSize, lineHeight: computed.lineHeight, color: computed.color, textAlign: computed.textAlign };
    });
    expect(Number.parseFloat(styles.fontSize)).toBeGreaterThanOrEqual(72);
    expect(Number.parseFloat(styles.lineHeight)).toBeGreaterThanOrEqual(68);
    expect(styles.color).toBe("rgb(247, 244, 237)");
    expect(styles.textAlign).toBe("left");
    await expect(page.locator('[data-persona-page="visionary"] .dark-hero')).toHaveCSS("background-color", "rgb(5, 8, 7)");
    const problemWidth = await page.locator(".visionary-section-inner").first().evaluate((node) => node.getBoundingClientRect().width);
    expect(problemWidth).toBe(1360);
    const cardWidths = await page.locator(".visionary-problem-card").evaluateAll((cards) => cards.map((card) => Math.round(card.getBoundingClientRect().width)));
    expect(new Set(cardWidths).size).toBe(1);
  });

  test("uses the approved Visionary text hierarchy and desktop reading rhythm", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/?persona=visionary"); await dismissInitialChooser(page);

    await expect(page.locator(".visionary-hero h1").first()).toHaveCSS("color", "rgb(247, 244, 237)");
    await expect(page.locator(".cinematic-problem h2")).toHaveCSS("color", "rgb(247, 244, 237)");
    await expect(page.locator(".cinematic-problem__card h3").first()).toHaveCSS("color", "rgb(247, 244, 237)");
    await expect(page.locator(".visionary-hero-support")).toHaveCSS("color", "rgb(184, 192, 217)");
    await expect(page.locator(".cinematic-problem__body")).toHaveCSS("color", "rgb(184, 192, 217)");
    await expect(page.locator(".cinematic-problem__card p").first()).toHaveCSS("color", "rgb(184, 192, 217)");

    const heroRhythm = await page.locator(".visionary-hero").evaluate((hero) => {
      const support = hero.querySelector(".visionary-hero-support");
      const secondParagraph = support.querySelector("p + p");
      const actions = hero.querySelector(".dark-actions");
      const note = hero.querySelector(".dark-hero__note");
      const outcome = hero.querySelector(".visionary-outcome-line");
      return {
        supportLineHeight: getComputedStyle(support).lineHeight,
        paragraphGap: getComputedStyle(secondParagraph).marginTop,
        actionsMargin: getComputedStyle(actions).marginTop,
        actionsGap: getComputedStyle(actions).gap,
        noteMargin: getComputedStyle(note).marginTop,
        outcomeMargin: getComputedStyle(outcome).marginTop
      };
    });
    expect(heroRhythm).toEqual({
      supportLineHeight: "27px",
      paragraphGap: "9px",
      actionsMargin: "32px",
      actionsGap: "24px",
      noteMargin: "24px",
      outcomeMargin: "18px"
    });

    await expect(page.locator(".cinematic-problem__card p").first()).toHaveCSS("font-size", "14px");
    await expect(page.locator(".cinematic-problem__card p").first()).toHaveCSS("line-height", "20px");
    await expect(page.locator(".cinematic-problem__index span")).toHaveCSS("color", "rgb(130, 239, 200)");
    await expect(page.locator(".visionary-hero .dark-button--secondary")).toHaveCSS("color", "rgb(238, 245, 239)");
  });

  test("uses the approved mobile hero rhythm", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/?persona=visionary"); await dismissInitialChooser(page);
    const rhythm = await page.locator(".visionary-hero").evaluate((hero) => {
      const support = hero.querySelector(".visionary-hero-support");
      const actions = hero.querySelector(".dark-actions");
      return {
        supportSize: getComputedStyle(support).fontSize,
        supportLineHeight: getComputedStyle(support).lineHeight,
        actionsMargin: getComputedStyle(actions).marginTop,
        actionsGap: getComputedStyle(actions).gap,
        noteMargin: getComputedStyle(hero.querySelector(".dark-hero__note")).marginTop,
        outcomeMargin: getComputedStyle(hero.querySelector(".visionary-outcome-line")).marginTop
      };
    });
    expect(rhythm).toEqual({
      supportSize: "16px",
      supportLineHeight: "26px",
      actionsMargin: "24px",
      actionsGap: "14px",
      noteMargin: "18px",
      outcomeMargin: "18px"
    });
  });

  test("runs full sticky choreography only on capable desktop viewports", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/?persona=visionary"); await dismissInitialChooser(page);
    const visionary = page.locator(".visionary-refresh");
    await expect(visionary).toHaveAttribute("data-cinematic-mode", "full");
    await expect(page.locator(".cinematic-problem__sticky")).toHaveCSS("position", "sticky");

    const problem = page.locator(".cinematic-problem");
    await problem.evaluate((section) => scrollTo(0, section.offsetTop + (section.offsetHeight - innerHeight) * .82));
    await page.evaluate(() => new Promise((resolve) => requestAnimationFrame(() => requestAnimationFrame(resolve))));
    const cards = await page.locator(".cinematic-problem__card").evaluateAll((nodes) => nodes.map((node) => {
      const box = node.getBoundingClientRect();
      return { left: box.left, right: box.right, opacity: Number.parseFloat(getComputedStyle(node).opacity), angle: node.style.getPropertyValue("--card-angle") };
    }));
    expect(cards.map(({ angle }) => angle.trim())).toEqual(["5deg", "-5deg", "5deg", "-5deg"]);
    expect(cards.every(({ opacity }) => opacity === 1)).toBeTruthy();
    expect(cards.slice(1).every((card, index) => card.left - cards[index].right >= 24)).toBeTruthy();
  });

  test("pins the vision scene and raises each block from below in order", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 836 });
    await page.goto("/?persona=visionary"); await dismissInitialChooser(page);
    const vision = page.locator(".cinematic-vision");
    await expect(vision).toHaveAttribute("data-vision-mode", "pinned");
    await expect(page.locator(".cinematic-vision__sticky")).toHaveCSS("position", "sticky");

    const stateAt = async (progress) => {
      await vision.evaluate((section, value) => {
        const sticky = section.querySelector(".cinematic-vision__sticky");
        scrollTo(0, section.getBoundingClientRect().top + scrollY - 76 + (section.offsetHeight - sticky.offsetHeight) * value);
      }, progress);
      await page.waitForTimeout(250);
      return vision.evaluate((section) => ({
        stickyTop: Math.round(section.querySelector(".cinematic-vision__sticky").getBoundingClientRect().top),
        ...Object.fromEntries([...section.querySelectorAll("[data-vision-step]")].map((node) => [node.dataset.visionStep, Number.parseFloat(getComputedStyle(node).opacity)]))
      }));
    };

    expect(await stateAt(0)).toMatchObject({ intro: 0, center: 0, left: 0, right: 0 });
    expect(await stateAt(.24)).toMatchObject({ intro: 1, center: 0, left: 0, right: 0 });
    expect(await stateAt(.42)).toMatchObject({ intro: 1, center: 1, left: 0, right: 0 });
    expect(await stateAt(.6)).toMatchObject({ intro: 1, center: 1, left: 1, right: 0 });
    const complete = await stateAt(.95);
    expect(complete).toMatchObject({ stickyTop: 76, intro: 1, left: 1, center: 1, right: 1 });
  });

  test("uses adaptive flow on tablets and short-height laptops and survives resize", async ({ page }) => {
    await page.setViewportSize({ width: 1280, height: 720 });
    await page.goto("/?persona=visionary"); await dismissInitialChooser(page);
    const visionary = page.locator(".visionary-refresh");
    await expect(visionary).toHaveAttribute("data-cinematic-mode", "adaptive");
    await expect(page.locator(".cinematic-problem__sticky")).toHaveCSS("position", "relative");

    await page.setViewportSize({ width: 1440, height: 900 });
    await expect(visionary).toHaveAttribute("data-cinematic-mode", "full");
    await expect(page.locator(".cinematic-problem__sticky")).toHaveCSS("position", "sticky");

    await page.setViewportSize({ width: 1024, height: 768 });
    await expect(visionary).toHaveAttribute("data-cinematic-mode", "adaptive");
    await expect(page.locator(".cinematic-problem__sticky")).toHaveCSS("position", "relative");
  });

  test("uses responsive optimized cinematic imagery", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/?persona=visionary"); await dismissInitialChooser(page);
    const heroSource = await page.locator(".cinematic-hero__backdrop img").evaluate((image) => image.currentSrc);
    expect(heroSource).toMatch(/recognition-garden-hero-768\.(avif|webp)$/);
    await expect(page.locator(".cinematic-problem__backdrop img")).toHaveAttribute("loading", "lazy");
    await expect(page.locator(".cinematic-vision__backdrop img")).toHaveAttribute("loading", "lazy");
  });

  test("keeps the three cinematic sections inside every supported viewport", async ({ page }) => {
    const viewports = [
      [320, 568], [390, 844], [667, 375], [768, 1024], [1024, 768],
      [1100, 700], [1280, 720], [1366, 768], [1440, 900], [1920, 1080]
    ];
    for (const [width, height] of viewports) {
      await page.setViewportSize({ width, height });
      await page.goto("/?persona=visionary"); await dismissInitialChooser(page);
      const geometry = await page.evaluate(() => ({
        scrollWidth: document.documentElement.scrollWidth,
        problemCards: [...document.querySelectorAll(".cinematic-problem__card")].map((node) => {
          const box = node.getBoundingClientRect();
          return { left: box.left, right: box.right };
        }),
        visionCard: (() => {
          const box = document.querySelector(".cinematic-vision__statement").getBoundingClientRect();
          return { left: box.left, right: box.right };
        })()
      }));
      expect(geometry.scrollWidth).toBeLessThanOrEqual(width);
      expect(geometry.problemCards.every(({ left, right }) => left >= 0 && right <= width)).toBeTruthy();
      expect(geometry.visionCard.left).toBeGreaterThanOrEqual(0);
      expect(geometry.visionCard.right).toBeLessThanOrEqual(width);
    }
  });

  test("uses a static complete layout for reduced motion", async ({ page }) => {
    await page.emulateMedia({ reducedMotion: "reduce" });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/?persona=visionary"); await dismissInitialChooser(page);
    await expect(page.locator(".visionary-refresh")).toHaveAttribute("data-cinematic-mode", "static");
    await expect(page.locator(".cinematic-problem__sticky")).toHaveCSS("position", "relative");
    await expect(page.locator(".cinematic-problem__card").first()).toHaveCSS("opacity", "1");
    await expect(page.locator(".cinematic-vision")).toHaveAttribute("data-vision-mode", "static");
    await expect(page.locator(".cinematic-vision__sticky")).toHaveCSS("position", "relative");
    for (const step of await page.locator("[data-vision-step]").all()) await expect(step).toHaveCSS("opacity", "1");
  });

  test("connects the Meet EzRewards copy to accessible pillar tabs", async ({ page }) => {
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/?persona=visionary"); await dismissInitialChooser(page);
    const section = page.locator("[data-meet-ezrewards]");
    await expect(section).toHaveAttribute("data-active-pillar", "recognition");
    await expect(section.getByRole("tab")).toHaveCount(3);
    await expect(section.getByText("EzRewards brings recognition, rewards and culture insights into one connected experience—so appreciation is easier to give, more meaningful to receive and simpler to manage.", { exact: true })).toBeAttached();
    const firstTab = section.getByRole("tab", { name: /Recognition that feels human/ });
    await firstTab.focus();
    await firstTab.press("End");
    await expect(section).toHaveAttribute("data-active-pillar", "insight");
    await expect(section.getByRole("tab", { name: /Culture leaders can understand/ })).toHaveAttribute("aria-selected", "true");
    await expect(page.locator("#meet-panel-insight")).toHaveAttribute("aria-hidden", "false");
    await page.locator("[data-meet-pillar='rewards']").click();
    await expect(section).toHaveAttribute("data-active-pillar", "rewards");
  });

  test("synchronizes all three desktop stages with the scroll narrative", async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto("/?persona=visionary"); await dismissInitialChooser(page);
    const section = page.locator("[data-meet-ezrewards]");
    await expect(section).toHaveAttribute("data-particle-count", /^(7200|3600)$/);
    for (const [progress, pillar] of [[.16, "recognition"], [.49, "rewards"], [.78, "insight"]]) {
      await section.evaluate((node, value) => {
        const header = document.querySelector(".site-header")?.offsetHeight || 76;
        scrollTo(0, node.offsetTop - header + innerHeight * 2.4 * value);
      }, progress);
      await page.waitForTimeout(120);
      await expect(section).toHaveAttribute("data-active-pillar", pillar);
    }
  });

  test("uses three static SVG stories on phones and for reduced motion", async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto("/?persona=visionary"); await dismissInitialChooser(page);
    const section = page.locator("[data-meet-ezrewards]");
    await expect(section).toHaveAttribute("data-render-state", "fallback");
    await expect(section.locator("[data-meet-panel]")).toHaveCount(3);
    await expect(section.locator("[data-meet-panel][aria-hidden]")).toHaveCount(0);
    await expect(section.locator(".cinematic-meet__visual")).toHaveCSS("display", "none");
    await expect(section.locator("[data-meet-panel] > svg")).toHaveCount(3);
  });

  test("falls back to inline SVG when WebGL cannot initialize", async ({ page }) => {
    await page.addInitScript(() => {
      const original = HTMLCanvasElement.prototype.getContext;
      HTMLCanvasElement.prototype.getContext = function patched(type, ...args) {
        if (String(type).startsWith("webgl")) return null;
        return original.call(this, type, ...args);
      };
    });
    await page.setViewportSize({ width: 1024, height: 768 });
    await page.goto("/?persona=visionary"); await dismissInitialChooser(page);
    const section = page.locator("[data-meet-ezrewards]");
    await expect(section).toHaveAttribute("data-render-state", "fallback");
    await expect(section).toHaveAttribute("data-webgl-fallback", "true");
    await expect(section.locator("[data-meet-fallback='recognition']")).toHaveCSS("opacity", "1");
  });
});

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
});

test("Visionary refresh keeps section typography, loop cards, and CTA alignment consistent", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?persona=visionary"); await dismissInitialChooser(page);

  const sectionHeadingSizes = await page.locator('[data-persona-page="visionary"] .visionary-section h2').evaluateAll((headings) =>
    headings.filter((heading) => heading.getClientRects().length).map((heading) => Number.parseFloat(getComputedStyle(heading).fontSize))
  );
  expect(Math.max(...sectionHeadingSizes)).toBeLessThanOrEqual(80);

  const cultureGap = page.locator('[data-home-section="problem"]');
  const cultureHeading = cultureGap.getByRole("heading", { level: 2 });
  const [sectionBox, headingBox] = await Promise.all([cultureGap.boundingBox(), cultureHeading.boundingBox()]);
  const sectionCenter = sectionBox.x + sectionBox.width / 2;
  const headingCenter = headingBox.x + headingBox.width / 2;
  expect(Math.abs(sectionCenter - headingCenter)).toBeLessThanOrEqual(2);

  const loop = page.locator('[data-persona-page="visionary"] [data-how-it-works]');
  const panelGeometry = await loop.locator("[data-how-panel]").evaluateAll((panels) => panels.map((panel) => {
    const panelBox = panel.getBoundingClientRect();
    const numberBox = panel.querySelector(".cinematic-how__number").getBoundingClientRect();
    return {
      radius: getComputedStyle(panel).borderRadius,
      numberContained: numberBox.left >= panelBox.left && numberBox.right <= panelBox.right && numberBox.top >= panelBox.top && numberBox.bottom <= panelBox.bottom
    };
  }));
  expect(panelGeometry).toEqual(Array(5).fill({ radius: "24px", numberContained: true }));
  await expect(loop.locator('[data-how-panel][aria-hidden="false"]')).toHaveCount(1);
});

const routes = [
  {
    path: "/",
    title: "EzRewards | Employee Recognition and Rewards",
    description: /employee recognition/i
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
    await page.goto(route.path); await dismissInitialChooser(page);

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
      await page.goto(route.path); await dismissInitialChooser(page);
      const widths = await page.evaluate(() => ({
        client: document.documentElement.clientWidth,
        scroll: document.documentElement.scrollWidth
      }));
      expect(widths.scroll).toBeLessThanOrEqual(widths.client);
    });
  }
}

test("button links are not underlined and active navigation remains distinct", async ({ page }) => {
  await page.goto("/?persona=default"); await dismissInitialChooser(page);
  await expect(page.getByRole("link", { name: "Create Account", exact: true }).first())
    .toHaveCSS("text-decoration-line", "none");
  await page.getByRole("button", { name: "Change experience" }).first().click();
  await expect(page.getByRole("button", { name: /Visionary/ })).toHaveCSS("cursor", "pointer");
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
  await page.goto("/"); await dismissInitialChooser(page);

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
  await page.goto("/contact"); await dismissInitialChooser(page);

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
  await page.goto("/"); await dismissInitialChooser(page);
  for (const label of ["Privacy", "Terms", "LinkedIn"]) {
    await expect(page.getByText(label, { exact: true })).not.toHaveAttribute("href");
  }
});

test("reduced motion disables page animations", async ({ browser }) => {
  const context = await browser.newContext({ reducedMotion: "reduce" });
  const page = await context.newPage();
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
  await page.goto("http://127.0.0.1:4174/?persona=default"); await dismissInitialChooser(page);
  await page.getByRole("button", { name: "Change experience" }).first().click();
  const transitionSeconds = await page.locator("[data-persona-option]").first().evaluate((element) =>
    Number.parseFloat(getComputedStyle(element).transitionDuration)
  );
  expect(transitionSeconds).toBeLessThanOrEqual(0.00001);
  await context.close();
});

test("pages render when outbound network access is unavailable", async ({ page }) => {
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:4174)/, (route) => route.abort());
  for (const route of routes) {
    await page.goto(route.path); await dismissInitialChooser(page);
    await expect(page.locator("h1").first()).toBeAttached();
  }
});

test("internal links and section anchors resolve", async ({ page, request }) => {
  for (const route of routes) {
    await page.goto(route.path); await dismissInitialChooser(page);
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

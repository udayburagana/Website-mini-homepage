import { dismissInitialChooser } from "./fixtures/persona.mjs";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";

const STAGES = [
  ["notice", "Notice", "An employee, manager or leader notices work that deserves appreciation."],
  ["recognize", "Recognize", "They create a thoughtful recognition message—with optional AI assistance when they need help finding the right words."],
  ["celebrate", "Celebrate", "The recognition appears in the company feed, where colleagues can react, comment and celebrate together."],
  ["reward", "Reward", "Recognition can be connected to meaningful rewards from the company’s reward catalogue."],
  ["learn", "Learn", "Leaders gain visibility into participation, recognition patterns and the contributions shaping their culture."]
];
const HOLDS = [[0, .18], [.24, .38], [.44, .58], [.64, .78], [.84, .94]];
const HEADING = "One contribution can inspire an entire culture.";
const CLOSING = "Contribution becomes recognition. Recognition becomes belonging. Belonging becomes culture.";

const section = (page) => page.locator('[data-persona-page="visionary"] [data-how-it-works]');

async function scrollToProgress(page, progress) {
  await page.evaluate((value) => {
    const node = document.querySelector("[data-how-it-works]");
    const pin = node.querySelector(".cinematic-how__pin");
    const header = document.querySelector(".site-header")?.offsetHeight || 76;
    scrollTo(0, node.getBoundingClientRect().top + scrollY - header + (node.offsetHeight - pin.offsetHeight) * value);
  }, progress);
}

const currentProgress = (page) => page.evaluate(() => {
  const node = document.querySelector("[data-how-it-works]");
  const pin = node.querySelector(".cinematic-how__pin");
  const header = document.querySelector(".site-header")?.offsetHeight || 76;
  const start = node.getBoundingClientRect().top + scrollY - header;
  return (scrollY - start) / (node.offsetHeight - pin.offsetHeight);
});

async function openFull(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?persona=visionary"); await dismissInitialChooser(page);
  await expect(section(page)).toHaveAttribute("data-how-mode", "pinned");
}

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
});

test("keeps the section heading, five stage titles, descriptions and closing statement unchanged", async ({ page }) => {
  await page.goto("/?persona=visionary"); await dismissInitialChooser(page);
  const how = section(page);
  await expect(how.locator(".visionary-index")).toHaveText("04 How EzRewards works");
  await expect(how.getByRole("heading", { level: 2 })).toHaveText(HEADING);
  await expect(how.locator("[data-how-panel] h3")).toHaveText(STAGES.map(([, title]) => title));
  await expect(how.locator("[data-how-panel] .cinematic-how__copy p")).toHaveText(STAGES.map(([, , copy]) => copy));
  await expect(how.locator(".cinematic-how__closing")).toHaveText(CLOSING);
  await expect(how.locator("[data-how-stage]")).toHaveText(STAGES.map(([, title], index) => `0${index + 1}${title}`));
  await expect(how.locator("canvas, .cinematic-how__visual, .cinematic-how__symbol").first()).toBeAttached();
  for (const node of await how.locator(".cinematic-how__visual, .cinematic-how__symbol, .cinematic-how__symbols").all()) {
    await expect(node).toHaveAttribute("aria-hidden", "true");
  }
});

test("synchronizes the active stage with every hold and transition range", async ({ page }) => {
  test.setTimeout(90000);
  await openFull(page);
  const how = section(page);
  await expect(how).toHaveAttribute("data-particle-count", /^(16000|8000)$/);
  const checkpoints = [
    [.02, "notice", "hold"], [.09, "notice", "hold"], [.17, "notice", "hold"],
    [.2, "notice", "transition"], [.225, "recognize", "transition"],
    [.31, "recognize", "hold"], [.4, "recognize", "transition"], [.43, "celebrate", "transition"],
    [.51, "celebrate", "hold"], [.6, "celebrate", "transition"], [.625, "reward", "transition"],
    [.71, "reward", "hold"], [.8, "reward", "transition"], [.825, "learn", "transition"],
    [.89, "learn", "hold"], [.975, "learn", "complete"]
  ];
  for (const [progress, stage, phase] of checkpoints) {
    await scrollToProgress(page, progress);
    await expect(how, `progress ${progress}`).toHaveAttribute("data-active-stage", stage);
    await expect(how, `progress ${progress}`).toHaveAttribute("data-how-phase", phase);
    await expect(how.locator(`[data-how-stage="${stage}"]`)).toHaveAttribute("aria-selected", "true");
    await expect(how.locator(`[data-how-panel="${stage}"]`)).toHaveAttribute("aria-hidden", "false");
  }
  await expect(how.locator(".cinematic-how__closing")).toHaveCSS("opacity", "1");
  await scrollToProgress(page, .51);
  await expect(how).toHaveAttribute("data-active-stage", "celebrate");
  await expect(how.locator(".cinematic-how__closing")).toHaveCSS("opacity", "0");
  await expect.poll(() => how.locator("[data-how-stage]").evaluateAll((tabs) => tabs.map((tab) => getComputedStyle(tab).opacity)))
    .toEqual(["0.6", "0.6", "1", "0.28", "0.28"]);
});

test("rail supports click, Arrow, Home and End navigation and scrolls to the chosen stage", async ({ page }) => {
  await openFull(page);
  const how = section(page);
  await scrollToProgress(page, .09);
  await expect(how).toHaveAttribute("data-active-stage", "notice");
  const arrivesAt = async (stage) => {
    const index = STAGES.findIndex(([name]) => name === stage);
    await expect(how.locator(`[data-how-stage="${stage}"]`)).toBeFocused();
    await expect(how.locator(`[data-how-stage="${stage}"]`)).toHaveAttribute("aria-selected", "true");
    await expect.poll(() => currentProgress(page), { timeout: 5000 }).toBeGreaterThanOrEqual(HOLDS[index][0]);
    await expect.poll(() => currentProgress(page), { timeout: 5000 }).toBeLessThanOrEqual(HOLDS[index][1]);
    await expect(how).toHaveAttribute("data-how-phase", "hold");
    await expect(how).toHaveAttribute("data-active-stage", stage);
  };
  await how.locator('[data-how-stage="notice"]').focus();
  await page.keyboard.press("ArrowDown");
  await arrivesAt("recognize");
  await page.keyboard.press("End");
  await arrivesAt("learn");
  await page.keyboard.press("ArrowDown");
  await arrivesAt("learn");
  await page.keyboard.press("ArrowUp");
  await arrivesAt("reward");
  await page.keyboard.press("Home");
  await arrivesAt("notice");
  await how.locator('[data-how-stage="celebrate"]').click();
  await arrivesAt("celebrate");
});

test("Lenis exists only in full Visionary mode and is destroyed on persona, breakpoint and motion changes", async ({ page }) => {
  const lenisActive = () => page.evaluate(() => document.documentElement.classList.contains("lenis") && document.documentElement.dataset.smoothScroll === "lenis");
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?persona=default"); await dismissInitialChooser(page);
  await page.waitForTimeout(300);
  expect(await lenisActive()).toBe(false);

  await openFull(page);
  await expect.poll(lenisActive).toBe(true);

  await page.evaluate(() => window.EzRewardsPersona.setPersona("strategist"));
  await expect.poll(lenisActive).toBe(false);
  await expect(section(page)).toHaveAttribute("data-render-state", "paused");
  await page.evaluate(() => window.EzRewardsPersona.setPersona("visionary"));
  await expect.poll(lenisActive).toBe(true);

  await page.setViewportSize({ width: 1024, height: 768 });
  await expect.poll(lenisActive).toBe(false);
  await page.setViewportSize({ width: 900, height: 1440 });
  await expect.poll(lenisActive).toBe(false);
  await page.setViewportSize({ width: 1440, height: 900 });
  await expect.poll(lenisActive).toBe(true);

  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect.poll(lenisActive).toBe(false);
  await expect(section(page)).toHaveAttribute("data-how-mode", "static");
});

test("rebuilds the scene across 1440×900 → 1024×768 → 1440×900", async ({ page }) => {
  await openFull(page);
  const how = section(page);
  await scrollToProgress(page, .31);
  await expect(how).toHaveAttribute("data-render-state", "active");
  await expect(how).toHaveAttribute("data-active-stage", "recognize");

  await page.setViewportSize({ width: 1024, height: 768 });
  await expect(how).toHaveAttribute("data-how-mode", "flow");
  await expect(how).toHaveAttribute("data-render-state", "fallback");
  await expect(how).not.toHaveAttribute("data-particle-count", /.*/);
  await expect(how.locator(".cinematic-how__panels")).toHaveAttribute("role", "list");
  await expect(how.locator("[data-how-panel][aria-hidden], [data-how-panel][inert]")).toHaveCount(0);
  await expect(how.locator(".cinematic-how__visual")).toHaveCSS("display", "none");

  await page.setViewportSize({ width: 1440, height: 900 });
  await expect(how).toHaveAttribute("data-how-mode", "pinned");
  await expect(how.locator("canvas")).toHaveCount(1);
  await scrollToProgress(page, .71);
  await expect(how).toHaveAttribute("data-render-state", "active");
  await expect(how).toHaveAttribute("data-active-stage", "reward");
  await expect(how).toHaveAttribute("data-particle-count", /^(16000|8000)$/);
});

test("pauses rendering away from the section and when leaving the Visionary persona", async ({ page }) => {
  await openFull(page);
  const how = section(page);
  await scrollToProgress(page, .31);
  await expect(how).toHaveAttribute("data-render-state", "active");
  await page.evaluate(() => scrollTo(0, 0));
  await expect(how).toHaveAttribute("data-render-state", "paused");
  await page.evaluate(() => window.EzRewardsPersona.setPersona("operator"));
  await expect(how).toHaveAttribute("data-render-state", "paused");
  await expect(how).not.toHaveAttribute("data-particle-count", /.*/);
});

test("replaces WebGL with five inline SVGs while keeping tabs and scroll stages", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function patched(type, ...args) {
      return String(type).startsWith("webgl") ? null : original.call(this, type, ...args);
    };
  });
  const errors = [];
  page.on("pageerror", (error) => errors.push(error.message));
  await openFull(page);
  const how = section(page);
  await expect(how).toHaveAttribute("data-render-state", "fallback");
  await expect(how).toHaveAttribute("data-webgl-fallback", "true");
  await expect(how.locator("[data-how-fallback]")).toHaveCount(5);
  await scrollToProgress(page, .51);
  await expect(how).toHaveAttribute("data-active-stage", "celebrate");
  await expect(how.locator('[data-how-fallback="celebrate"]')).toHaveCSS("opacity", "1");
  await how.locator('[data-how-stage="celebrate"]').focus();
  await page.keyboard.press("End");
  await expect(how).toHaveAttribute("data-active-stage", "learn");
  await expect(how.locator('[data-how-fallback="learn"]')).toHaveCSS("opacity", "1");
  expect(errors).toEqual([]);
});

test("stays complete and readable before the cinematic bundle loads", async ({ page }) => {
  await page.route("**/vendor/visionary-cinematic.bundle.js", (route) => route.abort());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?persona=visionary"); await dismissInitialChooser(page);
  const how = section(page);
  await expect(how).not.toHaveAttribute("data-how-mode", /.*/);
  await expect(how.locator(".cinematic-how__rail")).toHaveCSS("display", "none");
  for (const [stage] of STAGES) {
    const panel = how.locator(`[data-how-panel="${stage}"]`);
    await panel.scrollIntoViewIfNeeded();
    await expect(panel).toBeVisible();
    await expect(panel).toHaveCSS("opacity", "1");
  }
  await expect(how.locator(".cinematic-how__closing")).toBeVisible();
});

test("makes no outbound runtime requests", async ({ page }) => {
  const outbound = [];
  await page.route(/^https?:\/\/(?!127\.0\.0\.1:4174)/, (route) => { outbound.push(route.request().url()); route.abort(); });
  await openFull(page);
  await scrollToProgress(page, .51);
  await expect(section(page)).toHaveAttribute("data-active-stage", "celebrate");
  expect(outbound.filter((url) => !/fonts\.(googleapis|gstatic)\.com/.test(url))).toEqual([]);
});

test("reduced motion shows all five stages statically", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?persona=visionary"); await dismissInitialChooser(page);
  const how = section(page);
  await expect(how).toHaveAttribute("data-how-mode", "static");
  await expect(how).toHaveAttribute("data-render-state", "fallback");
  await expect(page.locator("html")).not.toHaveClass(/lenis/);
  await expect(how.locator(".cinematic-how__symbol:visible")).toHaveCount(5);
  const transforms = await how.locator("[data-how-panel]").evaluateAll((panels) => panels.map((panel) => getComputedStyle(panel).transform));
  expect(transforms.every((value) => value === "none")).toBeTruthy();
});

const VIEWPORTS = [[320, 568], [390, 844], [667, 375], [768, 1024], [1024, 768], [1280, 720], [1440, 900], [1920, 1080]];
for (const [width, height] of VIEWPORTS) {
  test(`fits and stays reachable at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/?persona=visionary"); await dismissInitialChooser(page);
    const how = section(page);
    const mode = await how.getAttribute("data-how-mode");
    expect(mode).toBe(width >= 1100 && height >= 800 ? "pinned" : width >= 768 ? "flow" : "static");
    expect(await page.evaluate(() => document.documentElement.scrollWidth)).toBeLessThanOrEqual(width);

    if (mode === "pinned") {
      for (const [index, [stage]] of STAGES.entries()) {
        await scrollToProgress(page, (HOLDS[index][0] + HOLDS[index][1]) / 2);
        await expect(how).toHaveAttribute("data-active-stage", stage);
        const geometry = await page.evaluate((name) => {
          const box = (selector) => document.querySelector(selector).getBoundingClientRect();
          const panel = document.querySelector(`[data-how-panel="${name}"]`);
          return {
            header: document.querySelector(".site-header").getBoundingClientRect().bottom,
            pin: box(".cinematic-how__pin"), heading: box(".cinematic-how__intro h2"), rail: box(".cinematic-how__rail"),
            visual: box(".cinematic-how__visual"), panel: panel.getBoundingClientRect(),
            panelClipped: panel.scrollHeight > panel.clientHeight + 1
          };
        }, stage);
        for (const key of ["heading", "rail", "visual", "panel"]) {
          expect(geometry[key].top, `${stage} ${key} top`).toBeGreaterThanOrEqual(geometry.header - 1);
          expect(geometry[key].bottom, `${stage} ${key} bottom`).toBeLessThanOrEqual(height + 1);
          expect(geometry[key].left).toBeGreaterThanOrEqual(0);
          expect(geometry[key].right).toBeLessThanOrEqual(width);
        }
        expect(geometry.panelClipped).toBe(false);
      }
      await scrollToProgress(page, .98);
      const closing = await how.locator(".cinematic-how__closing").boundingBox();
      expect(closing.y + closing.height).toBeLessThanOrEqual(height + 1);
    } else {
      for (const [stage] of STAGES) {
        const panel = how.locator(`[data-how-panel="${stage}"]`);
        await panel.scrollIntoViewIfNeeded();
        await expect(panel).toBeVisible();
        await expect(panel).toHaveCSS("opacity", "1");
        const box = await panel.boundingBox();
        expect(box.x).toBeGreaterThanOrEqual(0);
        expect(box.x + box.width).toBeLessThanOrEqual(width);
      }
    }

    const results = await new AxeBuilder({ page }).include('[data-persona-page="visionary"] [data-how-it-works]')
      .withTags(["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"]).analyze();
    expect(results.violations, JSON.stringify(results.violations, null, 2)).toEqual([]);
  });
}

test("centers both cinematic visuals without a frame and keeps rail dots on the line", async ({ page }) => {
  await openFull(page);
  const geometry = await page.evaluate(() => {
    const center = (node) => { const box = node.getBoundingClientRect(); return box.left + box.width / 2; };
    const how = document.querySelector("[data-how-it-works]");
    const meet = document.querySelector("[data-meet-ezrewards]");
    const track = how.querySelector(".cinematic-how__rail-track");
    const style = (node, pseudo) => getComputedStyle(node, pseudo);
    return {
      howOffset: center(how.querySelector(".cinematic-how__visual")) - center(how),
      meetOffset: center(meet.querySelector(".cinematic-meet__visual")) - center(meet),
      visuals: [how.querySelector(".cinematic-how__visual"), meet.querySelector(".cinematic-meet__visual")]
        .map((node) => [style(node).backgroundImage, style(node).backgroundColor, style(node).borderTopWidth]),
      dotOffsets: [...how.querySelectorAll("[data-how-stage]")].map((tab) => {
        const box = tab.getBoundingClientRect();
        const dot = style(tab, "::before");
        return box.left + Number.parseFloat(dot.left) + Number.parseFloat(dot.width) / 2 - center(track);
      }),
      railBackgrounds: [...how.querySelectorAll("[data-how-stage]"), ...meet.querySelectorAll("[data-meet-pillar]")].map((tab) => style(tab).backgroundColor)
    };
  });
  expect(Math.abs(geometry.howOffset)).toBeLessThanOrEqual(1);
  expect(Math.abs(geometry.meetOffset)).toBeLessThanOrEqual(1);
  expect(geometry.visuals).toEqual([["none", "rgba(0, 0, 0, 0)", "0px"], ["none", "rgba(0, 0, 0, 0)", "0px"]]);
  expect(geometry.dotOffsets.every((offset) => Math.abs(offset) <= .5)).toBeTruthy();
  expect(new Set(geometry.railBackgrounds)).toEqual(new Set(["rgba(0, 0, 0, 0)"]));
});

test("tints the whole scene with the active stage color", async ({ page }) => {
  await openFull(page);
  const how = section(page);
  const accent = () => how.evaluate((node) => getComputedStyle(node).getPropertyValue("--how-accent").trim());
  await scrollToProgress(page, .09);
  await expect.poll(accent).toBe("rgb(130, 239, 200)");
  await scrollToProgress(page, .51);
  await expect(how).toHaveAttribute("data-active-stage", "celebrate");
  await expect.poll(accent).toBe("rgb(255, 201, 120)");
  const meet = page.locator("[data-meet-ezrewards]");
  await page.locator("[data-meet-pillar='insight']").click();
  await expect(meet).toHaveAttribute("data-active-pillar", "insight");
  await expect.poll(() => meet.evaluate((node) => getComputedStyle(node).getPropertyValue("--meet-accent").trim())).toBe("rgb(197, 166, 255)");
});

for (const [width, height, mode] of [[768, 1024, "flow"], [390, 844, "static"]]) {
  test(`fills the left progress line through the cards at ${width}×${height}`, async ({ page }) => {
    await page.setViewportSize({ width, height });
    await page.goto("/?persona=visionary"); await dismissInitialChooser(page);
    const how = section(page);
    await expect(how).toHaveAttribute("data-how-mode", mode);
    const list = how.locator(".cinematic-how__panels");
    const state = () => list.evaluate((node) => ({
      progress: Number.parseFloat(node.style.getPropertyValue("--how-list-progress") || "0"),
      reached: node.querySelectorAll("[data-reached]").length
    }));
    const scrollList = (fraction) => list.evaluate((node, value) => scrollTo(0, node.getBoundingClientRect().top + scrollY + node.offsetHeight * value - innerHeight * .6), fraction);
    await scrollList(.1);
    await expect.poll(async () => (await state()).reached).toBe(1);
    const early = await state();
    await scrollList(.5);
    await expect.poll(async () => (await state()).reached).toBe(3);
    await expect(how).toHaveAttribute("data-active-stage", "celebrate");
    await scrollList(1);
    await expect.poll(async () => (await state()).reached).toBe(5);
    expect((await state()).progress).toBeGreaterThan(early.progress);
    const line = await list.evaluate((node) => {
      const fill = getComputedStyle(node, "::after");
      const dot = getComputedStyle(node.querySelector("[data-how-panel]"), "::before");
      const listLeft = node.getBoundingClientRect().left;
      const panelLeft = node.querySelector("[data-how-panel]").getBoundingClientRect().left;
      return {
        lineCenter: listLeft + Number.parseFloat(fill.left) + Number.parseFloat(fill.width) / 2,
        dotCenter: panelLeft + Number.parseFloat(dot.left) + Number.parseFloat(dot.width) / 2,
        filled: Number.parseFloat(fill.height)
      };
    });
    expect(Math.abs(line.lineCenter - line.dotCenter)).toBeLessThanOrEqual(.5);
    expect(line.filled).toBeGreaterThan(0);
  });
}

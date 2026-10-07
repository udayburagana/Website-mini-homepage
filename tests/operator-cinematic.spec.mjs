import { dismissInitialChooser } from "./fixtures/persona.mjs";
import { expect, test } from "@playwright/test";
import AxeBuilder from "@axe-core/playwright";
import { readFile } from "node:fs/promises";
import {
  CATEGORY_ANCHORS, LOOP_ANCHORS, CAPABILITY_ANCHORS, CAPABILITY_SHAPES, OUTCOME_ANCHORS, VISION_ANCHORS, ACCESS_ANCHORS, PROBLEM_ANCHORS,
  stageAt, passedAt, categoryAt, loopStageAt, capabilityAt, outcomeAt, operatorMode,
} from "../operator-anchors.mjs";

const COPY = (await readFile(new URL("./fixtures/operator-copy.txt", import.meta.url), "utf8")).trim();
const WCAG = ["wcag2a", "wcag2aa", "wcag21a", "wcag21aa", "wcag22aa"];
const STAGES = [
  ["category", CATEGORY_ANCHORS, ["Easy for employees", "Controlled by administrators", "Ready to report"]],
  ["capabilities", CAPABILITY_ANCHORS, ["Peer recognition", "AI-assisted messages", "Company feed", "Rewards catalogue", "Direct assignment", "Onboarding", "Culture reporting", "AI Report Assistant"]],
  ["outcomes", OUTCOME_ANCHORS, ["Employees", "Teams", "Administrators", "Company"]],
];
const operator = (page) => page.locator("[data-operator-cinematic]");
const scene = (page, name) => page.locator(`[data-operator-section="${name}"]`);

// Visible copy of the Operator page with engine-generated controls removed; tags become spaces.
const pageCopy = (page) => operator(page).evaluate((root) => {
  const clone = root.cloneNode(true);
  clone.querySelectorAll("[data-operator-generated]").forEach((node) => node.remove());
  const walker = document.createTreeWalker(clone, NodeFilter.SHOW_TEXT);
  const parts = [];
  while (walker.nextNode()) parts.push(walker.currentNode.nodeValue);
  return parts.join(" ").replace(/\s+/g, " ").trim();
});

async function openFull(page) {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?persona=operator"); await dismissInitialChooser(page);
  await expect(operator(page)).toHaveAttribute("data-operator-mode", "full");
}

// Scroll range of a pinned scene: from the pin sticking under the header to it releasing. The pin
// is the sticky wrap (desktop) or the compact pin block nested inside the wrap (tablets/phones).
const pinRange = (sectionName) => {
  const section = document.querySelector(`[data-operator-section="${sectionName}"]`);
  const pin = section.querySelector("[data-operator-pin]") || section.querySelector(":scope > .operator-scene-pin, :scope > .operator-wrap");
  const range = section.querySelector("[data-operator-stage-holder]") || section;
  const header = document.querySelector(".site-header")?.offsetHeight || 76;
  const start = range.getBoundingClientRect().top + scrollY - header;
  return { start, length: range.offsetHeight - pin.offsetHeight };
};
const pinRangeSource = pinRange.toString();

async function scrollToProgress(page, name, progress) {
  await page.evaluate(([sectionName, value, source]) => {
    const { start, length } = eval(`(${source})`)(sectionName);
    scrollTo(0, start + length * value);
  }, [name, progress, pinRangeSource]);
}

const currentProgress = (page, name) => page.evaluate(([sectionName, source]) => {
  const { start, length } = eval(`(${source})`)(sectionName);
  return (scrollY - start) / length;
}, [name, pinRangeSource]);

// Stage cards slide into place; measure them only once their transform has stopped changing.
const settled = (locator) => expect.poll(() => locator.evaluate((node) => new Promise((resolve) => {
  const before = getComputedStyle(node).transform;
  setTimeout(() => resolve(before === getComputedStyle(node).transform), 160);
})), { timeout: 6000 }).toBe(true);

test.beforeEach(async ({ page }) => {
  await page.route("https://fonts.googleapis.com/**", (route) => route.abort());
  await page.route("https://fonts.gstatic.com/**", (route) => route.abort());
});

test("anchor maps are exact, ordered and clamped", () => {
  for (const anchors of [CATEGORY_ANCHORS, LOOP_ANCHORS, CAPABILITY_ANCHORS, OUTCOME_ANCHORS]) {
    anchors.forEach((anchor, index) => expect(stageAt(anchors, anchor)).toBe(index));
    for (let index = 0; index < anchors.length - 1; index += 1) {
      const midpoint = (anchors[index] + anchors[index + 1]) / 2;
      expect(stageAt(anchors, midpoint - .001)).toBe(index);
      expect(stageAt(anchors, midpoint + .001)).toBe(index + 1);
    }
    expect(stageAt(anchors, -1)).toBe(0);
    expect(stageAt(anchors, 2)).toBe(anchors.length - 1);
  }
  expect([categoryAt(.5), loopStageAt(.5), capabilityAt(.95), outcomeAt(.9)]).toEqual([1, 2, 7, 3]);
  for (const anchors of [VISION_ANCHORS, ACCESS_ANCHORS, PROBLEM_ANCHORS]) {
    expect(passedAt(anchors, 0)).toBe(0);
    expect(passedAt(anchors, 1)).toBe(anchors.length);
  }
  expect(operatorMode({ reduced: true, full: true, compact: true, active: true })).toBe("static");
  expect(operatorMode({ reduced: false, full: true, compact: true, active: false })).toBe("static");
  expect(operatorMode({ reduced: false, full: true, compact: true, active: true })).toBe("full");
  expect(operatorMode({ reduced: false, full: false, compact: true, active: true })).toBe("compact");
  expect(operatorMode({ reduced: false, full: false, compact: false, active: true })).toBe("flow");
});

test("approved copy is unchanged with and without the engine", async ({ page }) => {
  await page.route("**/vendor/operator-cinematic.bundle.js", (route) => route.abort());
  await page.goto("/?persona=operator"); await dismissInitialChooser(page);
  await expect(operator(page)).not.toHaveAttribute("data-operator-engine", /.*/);
  expect(await pageCopy(page)).toBe(COPY);

  await page.unroute("**/vendor/operator-cinematic.bundle.js");
  await openFull(page);
  expect(await pageCopy(page)).toBe(COPY);
});

test("remains complete before the Operator bundle loads", async ({ page }) => {
  await page.route("**/vendor/operator-cinematic.bundle.js", (route) => route.abort());
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?persona=operator"); await dismissInitialChooser(page);
  await expect(operator(page)).not.toHaveAttribute("data-operator-mode", /.*/);
  await expect(page.locator(".operator-rail")).toHaveCount(0);
  await expect(page.locator(".operator-steps > li")).toHaveCount(5);
  await expect(page.locator(".operator-steps > li[hidden]")).toHaveCount(0);
  await expect(page.locator(".operator-capabilities > article")).toHaveCount(8);
  await expect(page.locator('[data-operator-section="capabilities"] .capability-selector')).toHaveCount(0);
  await expect(page.locator('[data-operator-section] [data-layout="sticky-stack"], [data-operator-section][data-layout="sticky-stack"]')).toHaveCount(0);
});

test("chooses full, flow and static modes from the viewport and motion preference", async ({ page }) => {
  // pointer:coarse / hover:none cannot be emulated in the single chromium project; those clauses are
  // the same matchMedia string the engine evaluates and are covered by operatorMode() above.
  for (const [width, height, mode] of [[1440, 900, "full"], [1280, 800, "full"], [1440, 700, "compact"], [1024, 768, "compact"], [768, 1024, "compact"], [390, 844, "compact"], [667, 375, "flow"]]) {
    await page.setViewportSize({ width, height });
    await page.goto("/?persona=operator"); await dismissInitialChooser(page);
    await expect(operator(page), `${width}×${height}`).toHaveAttribute("data-operator-mode", mode);
  }
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await expect(operator(page)).toHaveAttribute("data-operator-mode", "static");
});

test("every staged scene synchronizes its scroll anchors with one active panel", async ({ page }) => {
  await openFull(page);
  for (const [name, anchors, labels] of STAGES) {
    const section = scene(page, name);
    await expect(section.getByRole("tab")).toHaveCount(labels.length);
    // The decorative step number is aria-hidden, so each tab is named by existing copy alone.
    for (const [index, label] of labels.entries()) await expect(section.getByRole("tab").nth(index)).toHaveAccessibleName(label);
    for (const [index] of anchors.entries()) {
      await scrollToProgress(page, name, anchors[index]);
      await expect(section).toHaveAttribute("data-active-stage", String(index));
      await expect(section.getByRole("tab").nth(index)).toHaveAttribute("aria-selected", "true");
      await expect(section.locator('[data-stage-state="active"]')).toHaveCount(1);
      await expect(section.locator(`[data-stage-item="${index}"]`)).toHaveAttribute("aria-hidden", "false");
      await expect(section.locator('[data-stage-item][aria-hidden="false"]')).toHaveCount(1);
    }
  }
});

test("the capability rail supports click, arrows, Home and End with stage navigation", async ({ page }) => {
  await openFull(page);
  const section = scene(page, "capabilities");
  const tabs = section.getByRole("tab");
  const arrivesAt = async (index) => {
    await expect(section).toHaveAttribute("data-active-stage", String(index));
    await expect(tabs.nth(index)).toBeFocused();
    await expect.poll(() => currentProgress(page, "capabilities"), { timeout: 6000 }).toBeGreaterThanOrEqual(CAPABILITY_ANCHORS[index] - .02);
    await expect.poll(() => currentProgress(page, "capabilities"), { timeout: 6000 }).toBeLessThanOrEqual(CAPABILITY_ANCHORS[index] + .02);
  };
  await scrollToProgress(page, "capabilities", CAPABILITY_ANCHORS[0]);
  await tabs.first().focus();
  await page.keyboard.press("ArrowRight");
  await arrivesAt(1);
  await page.keyboard.press("ArrowDown");
  await arrivesAt(2);
  await page.keyboard.press("ArrowLeft");
  await arrivesAt(1);
  await page.keyboard.press("End");
  await arrivesAt(7);
  await page.keyboard.press("Home");
  await arrivesAt(0);
  await tabs.nth(3).click();
  await arrivesAt(3);
});

test("workflow steps stack into a deck that keeps every number and title visible", async ({ page }) => {
  await openFull(page);
  const loop = scene(page, "loop");
  await expect(loop.getByRole("tab")).toHaveCount(0);
  await expect(loop.locator("ol.operator-steps")).not.toHaveAttribute("role", /.*/);
  await expect(loop.locator(".operator-step-visual[aria-hidden='true']")).toHaveCount(5);

  // The intro heading and its supporting copy share one bottom line.
  const row = loop.locator(".operator-heading-row");
  const [heading, copy] = await Promise.all([row.locator("h2").boundingBox(), row.locator("p").boundingBox()]);
  expect(Math.abs((heading.y + heading.height) - (copy.y + copy.height))).toBeLessThanOrEqual(2);

  for (const [index, anchor] of LOOP_ANCHORS.entries()) {
    await scrollToProgress(page, "loop", anchor);
    await expect(loop).toHaveAttribute("data-active-stage", String(index));
    await expect(loop.locator('[data-stack-state="stacked"]')).toHaveCount(index);
    await expect(loop.locator('[data-stack-state="waiting"]')).toHaveCount(LOOP_ANCHORS.length - 1 - index);
  }
  await page.waitForTimeout(1000);
  // Once all five have stacked, every card's number and title are the topmost element on screen.
  const uncovered = await loop.locator(".operator-steps > li").evaluateAll((cards) => cards.map((card) =>
    [card.querySelector(":scope > div > span"), card.querySelector("h3")].every((node) => {
      const box = node.getBoundingClientRect();
      return card.contains(document.elementFromPoint(box.left + Math.min(box.width / 2, 24), box.top + box.height / 2));
    })));
  expect(uncovered).toEqual([true, true, true, true, true]);
});

test("the capability phone morphs a particle illustration for each point", async ({ page }) => {
  await openFull(page);
  const section = scene(page, "capabilities");
  const phone = section.locator(".operator-phone");
  await expect(phone).toBeVisible();
  await expect(phone).toHaveAttribute("aria-hidden", "true");
  await expect(phone.locator("canvas")).toHaveCount(1);
  await expect(section).toHaveAttribute("data-particle-count", /^\d+$/);
  await scrollToProgress(page, "capabilities", CAPABILITY_ANCHORS[0]);
  await expect(section).toHaveAttribute("data-render-state", "active");
  for (const [index, shape] of CAPABILITY_SHAPES.entries()) {
    await scrollToProgress(page, "capabilities", CAPABILITY_ANCHORS[index]);
    await expect(section).toHaveAttribute("data-active-stage", String(index));
    await expect(phone.locator(".operator-phone__screen")).toHaveAttribute("data-active-shape", shape);
  }
  // The points are plain text: no backgrounds, no button shapes, bold only when active.
  const tabs = section.getByRole("tab");
  for (const index of [0, 7]) {
    const style = await tabs.nth(index).evaluate((tab) => {
      const computed = getComputedStyle(tab);
      return { background: computed.backgroundColor, border: computed.borderStyle, weight: getComputedStyle(tab.querySelector("b")).fontWeight };
    });
    expect(style.background, `tab ${index} background`).toBe("rgba(0, 0, 0, 0)");
    expect(style.border).toBe("none");
    expect(Number(style.weight)).toBeGreaterThanOrEqual(index === 7 ? 700 : 400);
    if (index !== 7) expect(Number(style.weight)).toBeLessThan(700);
  }
  // Layout: points, phone, content run left to right and the phone stays inside the pinned scene.
  const [rail, phoneBox, content, header] = await Promise.all([
    section.locator(".operator-rail").boundingBox(), phone.boundingBox(), section.locator('[data-stage-state="active"]').boundingBox(),
    page.locator(".site-header").boundingBox(),
  ]);
  expect(rail.x + rail.width).toBeLessThanOrEqual(phoneBox.x + 1);
  expect(phoneBox.x + phoneBox.width).toBeLessThanOrEqual(content.x + 1);
  expect(phoneBox.y).toBeGreaterThanOrEqual(header.y + header.height - 1);
  expect(phoneBox.y + phoneBox.height).toBeLessThanOrEqual(901);

  // Too short to pin: the reveal layout with the icon visuals, no phone.
  await page.setViewportSize({ width: 667, height: 375 });
  await expect(operator(page)).toHaveAttribute("data-operator-mode", "flow");
  await expect(phone).toBeHidden();
  await expect(section.locator(".operator-capability-visual:visible")).toHaveCount(8);
});

test("compact scenes pin on phones and tablets with points above the phone and content below", async ({ page }) => {
  for (const [width, height] of [[390, 844], [768, 1024]]) {
    await page.setViewportSize({ width, height });
    await page.goto("/?persona=operator"); await dismissInitialChooser(page);
    await expect(operator(page)).toHaveAttribute("data-operator-mode", "compact");
    const headerBottom = async () => (await page.locator(".site-header").boundingBox()).y + (await page.locator(".site-header").boundingBox()).height;

    const capabilities = scene(page, "capabilities");
    await scrollToProgress(page, "capabilities", CAPABILITY_ANCHORS[3]);
    await expect(capabilities).toHaveAttribute("data-active-stage", "3");
    await expect(capabilities.locator(".operator-phone__screen")).toHaveAttribute("data-active-shape", CAPABILITY_SHAPES[3]);
    const pin = await capabilities.locator("[data-operator-pin]").boundingBox();
    expect(Math.abs(pin.y - await headerBottom()), `${width}: pin sticks under header`).toBeLessThanOrEqual(2);
    await settled(capabilities.locator('[data-stage-state="active"]'));
    const [rail, phone, content] = await Promise.all([
      capabilities.locator(".operator-rail").boundingBox(), capabilities.locator(".operator-phone").boundingBox(), capabilities.locator('[data-stage-state="active"]').boundingBox(),
    ]);
    expect(rail.height, "points are a single horizontal strip").toBeLessThan(60);
    expect(rail.y + rail.height).toBeLessThanOrEqual(phone.y + 1);
    expect(phone.y + phone.height).toBeLessThanOrEqual(content.y + 1);
    expect(content.y + content.height).toBeLessThanOrEqual(height + 1);
    await expect(capabilities.getByRole("tab")).toHaveCount(8);

    for (const [name, anchors] of [["category", CATEGORY_ANCHORS], ["outcomes", OUTCOME_ANCHORS]]) {
      await scrollToProgress(page, name, anchors[1]);
      await expect(scene(page, name)).toHaveAttribute("data-active-stage", "1");
      await expect(scene(page, name).locator("canvas")).toHaveCount(1);
      await settled(scene(page, name).locator('[data-stage-state="active"]'));
      const box = await scene(page, name).locator('[data-stage-state="active"]').boundingBox();
      expect(box.y, `${name} card below header`).toBeGreaterThanOrEqual(await headerBottom() - 1);
      expect(box.y + box.height, `${name} card inside viewport`).toBeLessThanOrEqual(height + 1);
    }

    await scrollToProgress(page, "loop", LOOP_ANCHORS[4]);
    await expect(scene(page, "loop").locator('[data-stack-state="stacked"]')).toHaveCount(4);
    await scrollToProgress(page, "problem", .95);
    await expect(scene(page, "problem").locator('[data-card-state="in"]')).toHaveCount(4);
    await scrollToProgress(page, "vision", .9);
    await expect(scene(page, "vision").locator('[data-beat-state="in"]')).toHaveCount(3);
    await scene(page, "early-access").locator(".operator-access ul").scrollIntoViewIfNeeded();
    await expect(scene(page, "early-access").locator('[data-tick-state="done"]')).toHaveCount(5);
    expect(await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth)).toBeLessThanOrEqual(0);
  }
});

test("falls back to the icon visuals when WebGL cannot initialize", async ({ page }) => {
  await page.addInitScript(() => {
    const original = HTMLCanvasElement.prototype.getContext;
    HTMLCanvasElement.prototype.getContext = function getContext(type, ...rest) {
      return /webgl/.test(type) ? null : original.call(this, type, ...rest);
    };
  });
  await openFull(page);
  const section = scene(page, "capabilities");
  await expect(section).toHaveAttribute("data-render-state", "fallback");
  await expect(section).toHaveAttribute("data-webgl-fallback", "true");
  await expect(section.locator(".operator-phone")).toBeHidden();
  await scrollToProgress(page, "capabilities", CAPABILITY_ANCHORS[2]);
  await expect(section.locator('[data-stage-state="active"] .operator-capability-visual')).toBeVisible();
  // The canvas-2D scenes are unaffected.
  await scrollToProgress(page, "category", .5);
  await expect(scene(page, "category").locator("canvas")).toHaveCount(1);
});

test("problem, vision and early-access scenes advance with scroll", async ({ page }) => {
  await openFull(page);
  const problem = scene(page, "problem");
  await scrollToProgress(page, "problem", 0);
  await expect(problem).toHaveAttribute("data-problem-cards", "0");
  await scrollToProgress(page, "problem", .95);
  await expect(problem).toHaveAttribute("data-problem-cards", "4");
  await expect(problem.locator('[data-card-state="in"]')).toHaveCount(4);

  const vision = scene(page, "vision");
  await scrollToProgress(page, "vision", .05);
  await expect(vision.locator("blockquote")).toHaveAttribute("data-beat-state", "waiting");
  await scrollToProgress(page, "vision", .9);
  await expect(vision.locator('[data-beat-state="in"]')).toHaveCount(3);
  await expect(vision).toHaveAttribute("data-vision-settled", "true");

  const access = scene(page, "early-access");
  await scrollToProgress(page, "early-access", .5);
  await expect(access.locator('[data-tick-state="done"]')).toHaveCount(passedAt(ACCESS_ANCHORS, .5));
  await scrollToProgress(page, "early-access", 1);
  await expect(access.locator('[data-tick-state="done"]')).toHaveCount(5);
  await expect(access.locator("li")).toHaveText([/Priority access/, /Guided setup/, /Direct input/, /Early visibility/, /Founding customer/]);
});

test("pinned scenes stick beneath the header while their scroll range plays", async ({ page }) => {
  await openFull(page);
  for (const name of ["problem", "vision", "capabilities", "early-access"]) {
    await scrollToProgress(page, name, .5);
    const offset = await scene(page, name).evaluate((node) => {
      const pin = node.querySelector(":scope > .operator-scene-pin, :scope > .operator-wrap");
      return pin.getBoundingClientRect().top - document.querySelector(".site-header").getBoundingClientRect().bottom;
    });
    expect(Math.abs(offset), name).toBeLessThanOrEqual(2);
  }
});

test("reduced motion yields a complete, motionless layout", async ({ page }) => {
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.goto("/?persona=operator"); await dismissInitialChooser(page);
  await expect(operator(page)).toHaveAttribute("data-operator-mode", "static");
  await expect(page.locator(".operator-rail:visible")).toHaveCount(0);
  await expect(operator(page).locator("[data-stage-item][aria-hidden], [data-stage-item][inert]")).toHaveCount(0);
  for (const [name, count] of [["category", 3], ["loop", 5], ["capabilities", 8], ["outcomes", 4]]) {
    const items = scene(page, name).locator("[data-stage-item]");
    await expect(items).toHaveCount(count);
    expect(await items.evaluateAll((nodes) => nodes.every((node) => {
      const style = getComputedStyle(node);
      return style.visibility === "visible" && style.opacity === "1" && style.transform === "none";
    }))).toBe(true);
  }
  expect(await operator(page).evaluate((root) => [...root.querySelectorAll("*")].every((node) => getComputedStyle(node).animationName === "none"))).toBe(true);
});

test("pauses and releases every scene when the persona changes", async ({ page }) => {
  await openFull(page);
  await scrollToProgress(page, "capabilities", CAPABILITY_ANCHORS[4]);
  await expect(scene(page, "capabilities")).toHaveAttribute("data-active-stage", "4");
  await expect(page.locator("html")).toHaveAttribute("data-smooth-scroll", "lenis");
  await page.evaluate(() => window.EzRewardsPersona.setPersona("strategist"));
  await expect(operator(page)).toHaveAttribute("data-operator-mode", "static");
  await expect(operator(page)).toHaveAttribute("data-animation-state", "paused");
  await expect(page.locator("html")).not.toHaveAttribute("data-smooth-scroll", /.*/);
  await expect(operator(page).locator("[data-stage-item][aria-hidden]")).toHaveCount(0);
  await expect(page.locator(".operator-scene-canvas")).toHaveCount(0);

  await page.evaluate(() => window.EzRewardsPersona.setPersona("operator"));
  await expect(operator(page)).toHaveAttribute("data-operator-mode", "full");
  await expect(page.locator("html")).toHaveAttribute("data-smooth-scroll", "lenis");
});

test("FAQ keeps native disclosure semantics while animating", async ({ page }) => {
  await openFull(page);
  const faq = scene(page, "faq");
  const item = faq.locator("details").filter({ hasText: "How does pricing work?" });
  await item.locator("summary").click();
  await expect(item).toHaveAttribute("data-faq-state", "open");
  await expect(item).toHaveJSProperty("open", true);
  await expect(item.getByText("EzRewards costs $1 per active employee each month.")).toBeVisible();
  await item.locator("summary").focus();
  await page.keyboard.press("Enter");
  await expect(item).toHaveAttribute("data-faq-state", "closed");
  await expect(item).toHaveJSProperty("open", false);
});

// axe reports contrast over gradient backgrounds as "incomplete", so check text against the
// worst-case stop of each gradient it sits on.
test("text keeps WCAG AA contrast over the gradient surfaces axe cannot measure", async ({ page }) => {
  await page.setViewportSize({ width: 1440, height: 900 });
  await page.emulateMedia({ reducedMotion: "reduce" });
  await page.goto("/?persona=operator"); await dismissInitialChooser(page);
  const results = await page.evaluate(() => {
    // Computed colours arrive as rgb(0-255) or, from color-mix(), as color(srgb 0-1).
    const parse = (value) => {
      const channels = value.match(/[\d.]+/g).slice(0, 3).map(Number);
      return value.startsWith("color(") ? channels.map((c) => c * 255) : channels;
    };
    const channel = (value) => { const c = value / 255; return c <= .03928 ? c / 12.92 : ((c + .055) / 1.055) ** 2.4; };
    const luminance = ([r, g, b]) => .2126 * channel(r) + .7152 * channel(g) + .0722 * channel(b);
    const ratio = (a, b) => { const [hi, lo] = [luminance(a), luminance(b)].sort((x, y) => y - x); return (hi + .05) / (lo + .05); };
    const checks = [
      // [selector, worst-case background, minimum ratio]
      ['[data-operator-section="early-access"] .operator-eyebrow', [56, 189, 248], 4.5],
      ['[data-operator-section="early-access"] h2', [56, 189, 248], 3],
      ['[data-operator-section="early-access"] .operator-access > div > p', [56, 189, 248], 4.5],
      ['[data-operator-section="early-access"] .operator-access small', [56, 189, 248], 4.5],
      ['[data-operator-section="early-access"] li', [6, 16, 25], 4.5],
      ['[data-operator-section="problem"] .operator-eyebrow', [10, 14, 23], 4.5],
      ['[data-operator-section="problem"] .operator-heading-row p', [10, 14, 23], 4.5],
      ['[data-operator-section="problem"] .operator-grid p', [24, 34, 52], 4.5],
      ['[data-operator-section="problem"] .operator-grid small', [24, 34, 52], 4.5],
      ['[data-operator-section="problem"] .operator-grid strong', [24, 34, 52], 4.5],
      ['[data-operator-section="capabilities"] .operator-card--cyan p', [56, 189, 248], 4.5],
      ['[data-operator-section="pricing"] .operator-pricing li', [15, 22, 36], 4.5],
      ['[data-operator-section="hero"] .operator-lead', [12, 34, 52], 4.5],
    ];
    return checks.map(([selector, background, minimum]) => {
      const node = document.querySelector(selector);
      return { selector, minimum, ratio: Number(ratio(parse(getComputedStyle(node).color), background).toFixed(2)) };
    });
  });
  for (const { selector, minimum, ratio } of results) expect(ratio, selector).toBeGreaterThanOrEqual(minimum);
});

test("makes no outbound runtime requests beyond fonts", async ({ page }) => {
  const outbound = [];
  page.on("request", (request) => {
    const url = new URL(request.url());
    if (url.hostname !== "127.0.0.1" && !url.hostname.endsWith("fonts.googleapis.com") && !url.hostname.endsWith("fonts.gstatic.com")) outbound.push(request.url());
  });
  await openFull(page);
  await scrollToProgress(page, "outcomes", .5);
  await page.waitForTimeout(300);
  expect(outbound).toEqual([]);
});

test("has no WCAG violations mid-scene in full mode", async ({ page }) => {
  // Seven audits plus scroll settles, while parallel workers each render a WebGL phone in software GL.
  test.setTimeout(90_000);
  await openFull(page);
  for (const [name, anchors] of STAGES) {
    await scrollToProgress(page, name, anchors[Math.floor(anchors.length / 2)]);
    await page.waitForTimeout(900);
    const results = await new AxeBuilder({ page }).include(`[data-operator-section="${name}"]`).withTags(WCAG).analyze();
    expect(results.violations, `${name}: ${JSON.stringify(results.violations, null, 2)}`).toEqual([]);
  }
  for (const name of ["problem", "vision", "loop", "early-access"]) {
    await scrollToProgress(page, name, .95);
    await page.waitForTimeout(900);
    const results = await new AxeBuilder({ page }).include(`[data-operator-section="${name}"]`).withTags(WCAG).analyze();
    expect(results.violations, `${name}: ${JSON.stringify(results.violations, null, 2)}`).toEqual([]);
  }
});

const VIEWPORTS = [[320, 568], [390, 844], [667, 375], [768, 1024], [1024, 768], [1280, 800], [1440, 900], [1920, 1080]];
for (const [width, height] of VIEWPORTS) {
  test(`fits every Operator scene at ${width}×${height}`, async ({ page }) => {
    // Twenty-plus scroll positions, each waiting for its card to settle.
    test.setTimeout(120_000);
    await page.setViewportSize({ width, height });
    await page.goto("/?persona=operator"); await dismissInitialChooser(page);
    const mode = await operator(page).getAttribute("data-operator-mode");
    const overflow = () => page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    expect(await overflow()).toBeLessThanOrEqual(0);
    if (mode === "full" || mode === "compact") {
      const scenes = [
        ...STAGES.map(([name, anchors]) => [name, anchors, '[data-stage-state="active"]']),
        ["loop", LOOP_ANCHORS, '[data-stack-state="active"]'],
        ["loop", [1], ".operator-steps"],
        ["capabilities", [.5], ".operator-phone"],
      ];
      for (const [name, anchors, selector] of scenes) {
        for (const anchor of anchors) {
          await scrollToProgress(page, name, anchor);
          await expect(scene(page, name).locator(selector)).toHaveCount(1);
          if (selector.includes("active")) await settled(scene(page, name).locator(selector)); else await page.waitForTimeout(1000);
          const box = await scene(page, name).locator(selector).evaluate((node) => {
            const bounds = node.getBoundingClientRect();
            return { top: bounds.top, bottom: bounds.bottom, left: bounds.left, right: bounds.right, header: document.querySelector(".site-header").getBoundingClientRect().bottom };
          });
          expect(box.top, `${name} top`).toBeGreaterThanOrEqual(box.header - 1);
          expect(box.bottom, `${name} bottom`).toBeLessThanOrEqual(height + 1);
          expect(box.left).toBeGreaterThanOrEqual(0);
          expect(box.right).toBeLessThanOrEqual(width);
          expect(await overflow()).toBeLessThanOrEqual(0);
        }
      }
    } else {
      for (const name of ["problem", "category", "loop", "capabilities", "outcomes", "pricing"]) {
        await scene(page, name).scrollIntoViewIfNeeded();
        expect(await overflow(), name).toBeLessThanOrEqual(0);
      }
    }
  });
}

import { dismissInitialChooser } from "./fixtures/persona.mjs";
import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

const sectionSelector = '[data-strategist-scene="problem"]';
async function scrollStage(page, progress) {
  await page.evaluate(({selector, progress}) => {
    const section = document.querySelector(selector);
    const stickyTop = parseFloat(getComputedStyle(section.querySelector('.strategist-wrap')).top);
    const start = section.getBoundingClientRect().top + scrollY - stickyTop;
    window.scrollTo(0, start + (section.offsetHeight - innerHeight + stickyTop) * progress);
  }, {selector:sectionSelector, progress});
}

test('problem cards align with points and follow a reversible clockwise scroll path', async ({page}) => {
  test.setTimeout(60000);
  await page.setViewportSize({width:1440, height:900});
  await page.goto('/?persona=strategist'); await dismissInitialChooser(page);
  const section = page.locator(sectionSelector);
  await expect(section).toHaveAttribute('data-problem-motion', 'orbit');
  const cards = section.locator('.strategist-card-grid > article');
  const nav = section.locator('.strategist-scene-nav');
  await scrollStage(page, 0);
  await expect(section).toHaveAttribute('data-active-stage', '0');
  const first = await cards.first().boundingBox();
  const points = await nav.boundingBox();
  expect(Math.abs(first.y + first.height / 2 - points.y - points.height / 2)).toBeLessThan(3);
  const heading = await section.locator('h2').boundingBox();
  const body = await section.locator('.strategist-heading-row > div').boundingBox();
  expect(Math.abs(body.x - heading.x)).toBeLessThan(2);
  expect(heading.y + heading.height).toBeLessThan(points.y);
  await expect(cards.first()).toHaveCSS('justify-content', 'flex-start');
  await page.screenshot({path:'docs/qa/strategist-problem-stage-1.png'});
  await scrollStage(page, 1 / 6);
  await expect.poll(() => cards.first().evaluate(card => new DOMMatrixReadOnly(getComputedStyle(card).transform).m42)).toBeLessThan(-50);
  expect(await cards.first().evaluate(card => new DOMMatrixReadOnly(getComputedStyle(card).transform).m41)).toBeGreaterThan(20);
  for (let index = 1; index < 4; index++) {
    await scrollStage(page, index / 3);
    await expect(section).toHaveAttribute('data-active-stage', String(index));
    await expect(cards.nth(index)).toHaveAttribute('aria-hidden', 'false');
    await expect(nav.locator('[role="tab"]').nth(index)).toHaveAttribute('aria-selected', 'true');
    await page.waitForTimeout(300);
    const active = await cards.nth(index).boundingBox();
    expect(Math.abs(active.y + active.height / 2 - points.y - points.height / 2)).toBeLessThan(3);
    expect(await cards.evaluateAll(items => items.filter(item => !item.inert).length)).toBe(1);
    await page.screenshot({path:`docs/qa/strategist-problem-stage-${index + 1}.png`});
  }
  await scrollStage(page, 0);
  await expect(section).toHaveAttribute('data-active-stage', '0');
  const violations = (await new AxeBuilder({page}).include(sectionSelector).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations;
  expect(violations).toEqual([]);
});

test('problem stage fits a shorter desktop viewport', async ({page}) => {
  await page.setViewportSize({width:1440,height:768});
  await page.goto('/?persona=strategist'); await dismissInitialChooser(page);
  const section = page.locator(sectionSelector);
  await expect(section).toHaveAttribute('data-problem-motion','orbit');
  await scrollStage(page,0);
  await expect(section).toHaveAttribute('data-active-stage','0');
  const card = await section.locator('.strategist-card-grid > article').first().boundingBox();
  expect(card.y + card.height).toBeLessThanOrEqual(768);
  const nav = await section.locator('.strategist-scene-nav').boundingBox();
  expect(nav.y + nav.height).toBeLessThanOrEqual(768);
  await page.screenshot({path:'docs/qa/strategist-problem-short-desktop.png'});
});

for (const [name, width, height, reduced] of [['tablet',834,1112,false], ['mobile',390,844,false], ['reduced',1440,900,true]]) {
  test(`problem ${name}: all four points remain readable without orbiting`, async ({page}) => {
    test.setTimeout(60000);
    await page.setViewportSize({width,height});
    if (reduced) await page.emulateMedia({reducedMotion:'reduce'});
    await page.goto('/?persona=strategist'); await dismissInitialChooser(page);
    const section = page.locator(sectionSelector);
    await expect(section).toHaveAttribute('data-problem-motion', 'flow');
    await section.locator('h2').scrollIntoViewIfNeeded();
    const cards = section.locator('.strategist-card-grid > article');
    await expect(cards).toHaveCount(4);
    for (const card of await cards.all()) {
      await expect(card).toBeVisible();
      expect(await card.evaluate(item => item.inert)).toBe(false);
      await expect(card).toHaveCSS('transform','none');
    }
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const violations = (await new AxeBuilder({page}).include(sectionSelector).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze()).violations;
    expect(violations).toEqual([]);
    if (reduced) await expect(section.locator('canvas')).toHaveCSS('display','none');
    await page.screenshot({path:`docs/qa/strategist-problem-${name}.png`});
  });
}

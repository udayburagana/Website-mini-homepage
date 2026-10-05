import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const [name, width, height] of [['desktop',1440,900], ['tablet',834,1112], ['mobile',390,844]]) {
  test(`strategist hero ${name}: centered introduction and dashboard reveal`, async ({ page }) => {
    test.setTimeout(60000);
    await page.setViewportSize({ width, height });
    await page.goto('/?persona=strategist');
    const hero = page.locator('.strategist-hero');
    const intro = hero.locator('.strategist-hero__grid');
    const dashboard = hero.locator('.strategist-dashboard');
    await expect(page.locator('[data-strategist-cinematic]')).toHaveAttribute('data-strategist-engine', 'elva-inspired');
    const box = await intro.boundingBox();
    expect(box.height).toBeGreaterThanOrEqual(height);
    const title = await hero.locator('h1').boundingBox();
    expect(Math.abs(title.x + title.width / 2 - width / 2)).toBeLessThan(2);
    expect((await dashboard.boundingBox()).y).toBeGreaterThan(height);
    await page.waitForTimeout(1100);
    const openingAudit = await new AxeBuilder({page}).include('.strategist-hero__copy').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(openingAudit.violations).toEqual([]);
    await page.screenshot({ path:`docs/qa/strategist-hero-${name}.png` });
    await page.evaluate(() => {
      const stage = document.querySelector('.strategist-dashboard-stage');
      window.scrollTo(0, stage.getBoundingClientRect().top + scrollY - 100);
    });
    await expect(hero.locator('.strategist-dashboard-stage')).toHaveClass(/is-revealed/);
    await expect(dashboard.locator('.strategist-app-sidebar')).toBeVisible();
    await expect(dashboard.locator('table')).toBeVisible();
    await page.waitForTimeout(1000);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const results = await new AxeBuilder({page}).include('.strategist-hero').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(results.violations).toEqual([]);
    await page.screenshot({ path:`docs/qa/strategist-dashboard-${name}.png` });
  });
}

test('strategist hero honors reduced motion and CTA keyboard focus', async ({ page }) => {
  await page.emulateMedia({ reducedMotion:'reduce' });
  await page.goto('/?persona=strategist');
  const hero = page.locator('.strategist-hero');
  await expect(hero.locator('h1')).toHaveCSS('animation-name', 'none');
  const cta = hero.getByRole('link', {name:'Book a Demo'});
  await cta.focus();
  await expect(cta).toBeFocused();
  await expect(cta).toHaveCSS('outline-style','solid');
  await expect(cta).toHaveAttribute('href','/contact');
});

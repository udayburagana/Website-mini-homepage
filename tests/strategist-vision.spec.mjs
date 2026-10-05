import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';

for (const [name,width,height] of [['desktop',1440,900],['tablet',834,1112],['mobile',390,844]]) {
  test(`strategist vision ${name}: image, editorial layout and readable content`, async ({page}) => {
    test.setTimeout(60000);
    await page.setViewportSize({width,height});
    await page.goto('/?persona=strategist');
    const section=page.locator('.strategist-vision');
    await expect(page.locator('[data-strategist-cinematic]')).toHaveAttribute('data-strategist-engine','elva-inspired');
    await section.scrollIntoViewIfNeeded();
    const media=section.locator('.strategist-vision__media video');
    await expect.poll(() => media.evaluate(img => img.readyState >= 2 && img.videoWidth > 0)).toBe(true);
    expect(await media.evaluate(img => img.currentSrc)).toContain('strategist-vision-background.mp4');
    expect(await media.evaluate(video => video.muted && video.loop && video.playsInline)).toBe(true);
    await expect(section.locator('.strategist-landscape-atmosphere')).toHaveCount(0);
    const opening=await section.locator('.strategist-vision__opening').boundingBox();
    const panel=await section.locator('.strategist-vision__panel').boundingBox();
    if(width>=1024) expect(panel.x).toBeGreaterThan(opening.x+opening.width);
    else expect(panel.y).toBeGreaterThan(opening.y+opening.height);
    await expect(section.locator('blockquote')).toContainText('EzRewards helps make that signal clearer.');
    await expect(section.locator('.strategist-vision__explanation p')).toHaveCount(3);
    await page.waitForTimeout(1000);
    expect(await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth)).toBe(true);
    const audit=await new AxeBuilder({page}).include('.strategist-vision').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();
    expect(audit.violations).toEqual([]);
    await section.screenshot({path:`docs/qa/strategist-vision-${name}.png`,style:'.dark-header,.skip-link{visibility:hidden!important}'});
  });
}

test('strategist vision reduced motion keeps the manifesto visible',async({page})=>{
  await page.emulateMedia({reducedMotion:'reduce'});
  await page.goto('/?persona=strategist');
  const panel=page.locator('.strategist-vision__panel');
  await panel.scrollIntoViewIfNeeded();
  await expect(panel).toHaveCSS('opacity','1');
  await expect(panel).toHaveCSS('transform','none');
});

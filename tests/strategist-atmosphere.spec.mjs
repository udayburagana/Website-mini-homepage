import {test,expect} from '@playwright/test';
test('landscape videos pause offscreen and keep early-access card border static',async({page})=>{
 await page.goto('/?persona=strategist');const section=page.locator('[data-strategist-section="early-access"]');await section.scrollIntoViewIfNeeded();const video=section.locator('video');await expect.poll(()=>video.evaluate(el=>el.paused)).toBe(false);
 expect(await section.locator('.strategist-access-grid ul').evaluate(el=>getComputedStyle(el,'::before').content)).toBe('none');await expect(page.locator('.strategist-landscape-atmosphere')).toHaveCount(0);
 await page.locator('.strategist-hero').scrollIntoViewIfNeeded();await expect.poll(()=>video.evaluate(el=>el.paused)).toBe(true);
});

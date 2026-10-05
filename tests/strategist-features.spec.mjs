import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for(const [name,width,height] of [['desktop',1440,1000],['tablet',834,1112],['mobile',390,844]]){
 test(`capability showcase ${name}`,async({page})=>{
  test.setTimeout(90000);
  await page.setViewportSize({width,height});await page.goto('/?persona=strategist');
  const section=page.locator('.strategist-features');
  await section.scrollIntoViewIfNeeded();
  const tabs=section.getByRole('tab');await expect(tabs).toHaveCount(4);
  const wrap=await section.locator('.strategist-wrap').boundingBox(),showcase=await section.locator('.sc-features').boundingBox();const contentWidth=await section.locator('.strategist-wrap').evaluate(el=>el.clientWidth-parseFloat(getComputedStyle(el).paddingLeft)-parseFloat(getComputedStyle(el).paddingRight));expect(showcase.width).toBeGreaterThan(contentWidth*.95);
  if(width>=768){const preview=await section.locator('.sc-demo').first().boundingBox();expect(preview.width).toBeGreaterThan(width>=1200?400:270);}
  await section.locator('[data-feature-pause]').click();
  for(let i=0;i<4;i++){
   await tabs.nth(i).click();await expect(tabs.nth(i)).toHaveAttribute('aria-selected','true');
   await expect(section.getByRole('tabpanel')).toHaveCount(1);
   await expect(section.getByRole('tabpanel').locator('.sc-demo')).toHaveCount(1);
   await expect(section.getByRole('tabpanel').locator('h3')).toBeVisible();
  }
  await tabs.nth(0).click();
  if(width>=768){const heading=await section.locator('h2').boundingBox(),body=await section.locator('.strategist-heading-row > p').boundingBox();expect(Math.abs(heading.y+heading.height-body.y-body.height)).toBeLessThan(2);}
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const audit=await new AxeBuilder({page}).include('.strategist-features').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(audit.violations).toEqual([]);
  await section.screenshot({path:`docs/qa/strategist-features-${name}.png`,style:'.dark-header,.skip-link{visibility:hidden!important}'});
  await tabs.nth(0).focus();await page.keyboard.press('ArrowRight');await expect(tabs.nth(1)).toBeFocused();await expect(tabs.nth(1)).toHaveAttribute('aria-selected','true');
 });
}
test('capability timer fills, advances after five seconds and resets on click',async({page})=>{
 test.setTimeout(90000);await page.setViewportSize({width:1440,height:1000});await page.goto('/?persona=strategist');
 const feature=page.locator('[data-capability-features]');await feature.scrollIntoViewIfNeeded();
 const tabs=feature.getByRole('tab');await tabs.nth(0).click();
 await page.waitForTimeout(2200);
 const progress=await tabs.nth(0).evaluate(el=>parseFloat(el.style.getPropertyValue('--tab-progress')));expect(progress).toBeGreaterThan(.3);expect(progress).toBeLessThan(.8);
 await expect(tabs.nth(1)).toHaveAttribute('aria-selected','true',{timeout:4500});
 await tabs.nth(2).click();expect(await tabs.nth(2).evaluate(el=>parseFloat(el.style.getPropertyValue('--tab-progress')))).toBeLessThan(.1);
 await feature.locator('[data-feature-pause]').click();await page.waitForTimeout(5200);await expect(tabs.nth(2)).toHaveAttribute('aria-selected','true');
});
test('reduced motion starts with autoplay paused',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?persona=strategist');await expect(page.locator('[data-capability-features]')).toHaveAttribute('data-autoplay','paused');
});

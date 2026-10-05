import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for(const [name,width,height] of [['desktop',1440,1000],['tablet',834,1112],['mobile',390,844]]){
 test(`strategist closing CTA ${name}`,async({page})=>{
  test.setTimeout(60000);await page.setViewportSize({width,height});await page.goto('/?persona=strategist');const section=page.locator('.strategist-final');await section.scrollIntoViewIfNeeded();
  await expect(section.locator('.strategist-close__intro > *')).toHaveCount(4);await expect(section.locator('.strategist-close__intro a')).toHaveAttribute('href','/contact');
  await expect(section.locator('.strategist-close__notification')).toContainText('Maya, your team lead');await expect(section.locator('.strategist-close__notification')).toContainText('recognized your contribution');
  const pseudo=await section.evaluate(el=>['::before','::after'].map(p=>getComputedStyle(el,p).content));expect(pseudo).toEqual(['none','none']);
  expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const scene=await section.locator('.strategist-close__scene').boundingBox(),phone=await section.locator('.strategist-close__phone').boundingBox();expect(phone.height).toBeGreaterThan(scene.height);expect(phone.y).toBeGreaterThanOrEqual(scene.y);
  const audit=await new AxeBuilder({page}).include('.strategist-final').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(audit.violations).toEqual([]);
  await section.screenshot({path:`docs/qa/strategist-close-${name}.png`,style:'.dark-header,.skip-link{visibility:hidden!important}'});
 });
}

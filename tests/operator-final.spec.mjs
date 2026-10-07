import { dismissInitialChooser } from "./fixtures/persona.mjs";
import {test,expect} from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
for(const [name,width,height] of [['desktop',1440,1000],['tablet',834,1112],['mobile',390,844]]){
 test(`operator closing devices ${name}`,async({page})=>{
  test.setTimeout(60000);await page.setViewportSize({width,height});await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?persona=operator'); await dismissInitialChooser(page);const section=page.locator('.operator-final');await section.scrollIntoViewIfNeeded();
  await expect(section.locator('.oc-close__phone')).toHaveCount(2);await expect(section.locator('.oc-close__metrics > div')).toHaveCount(4);await expect(section.locator('.oc-close__recognition')).toHaveCount(2);
  const first=await section.locator('.oc-close__phone--employee').boundingBox(),second=await section.locator('.oc-close__phone--admin').boundingBox();expect((first.x+first.width-second.x)/first.width).toBeCloseTo(.1,2);expect(await section.locator('.oc-close__phone--admin').evaluate(el=>getComputedStyle(el).zIndex)).toBe('2');
  const copy=await section.locator('.oc-close__copy').boundingBox(),devices=await section.locator('.oc-close__devices').boundingBox();if(width>=768)expect(devices.x).toBeGreaterThan(copy.x+copy.width);else expect(devices.y).toBeGreaterThan(copy.y+copy.height);
  const chart=await section.locator('.oc-close__chart').boundingBox(),screen=await section.locator('.oc-close__phone--admin .oc-close__screen').boundingBox();expect(chart.y+chart.height).toBeLessThanOrEqual(screen.y+screen.height);
  expect(await section.evaluate(el=>getComputedStyle(el,'::after').content)).toBe('none');expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
  const audit=await new AxeBuilder({page}).include('.operator-final').withTags(['wcag2a','wcag2aa','wcag21aa']).analyze();expect(audit.violations).toEqual([]);
  await section.screenshot({path:`docs/qa/operator-close-${name}.png`,style:'.dark-header,.skip-link{visibility:hidden!important}'});await page.goto('about:blank'); await dismissInitialChooser(page);
 });
}

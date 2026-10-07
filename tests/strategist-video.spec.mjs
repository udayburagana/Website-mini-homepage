import { dismissInitialChooser } from "./fixtures/persona.mjs";
import {test,expect} from '@playwright/test';
for(const [sectionName,selector] of [['vision','.strategist-vision'],['access','[data-strategist-section="early-access"]']])
for(const [name,width,height] of [['desktop',1440,900],['mobile',390,844]]){
 test(`${sectionName} video ${name}`,async({page})=>{
  test.setTimeout(60000);await page.setViewportSize({width,height});await page.goto('/?persona=strategist'); await dismissInitialChooser(page);const section=page.locator(selector);await section.scrollIntoViewIfNeeded();const video=section.locator('video');
  await expect.poll(()=>video.evaluate(el=>el.readyState)).toBeGreaterThanOrEqual(2);
  await expect.poll(()=>video.evaluate(el=>el.paused)).toBe(false);expect(await video.evaluate(el=>el.muted&&el.loop&&el.playsInline)).toBe(true);
  const start=await video.evaluate(el=>el.currentTime);await page.waitForTimeout(700);expect(await video.evaluate(el=>el.currentTime)).toBeGreaterThan(start);
  const crop=await video.evaluate(el=>{const box=el.getBoundingClientRect(),parent=el.parentElement.getBoundingClientRect();return box.width/parent.width;});expect(crop).toBeCloseTo(1.14,2);
  await section.screenshot({path:`docs/qa/strategist-${sectionName}-video-${name}.png`,style:'.dark-header,.skip-link{visibility:hidden!important}'});
  await page.emulateMedia({reducedMotion:'reduce'});await expect.poll(()=>video.evaluate(el=>el.paused)).toBe(true);
 });
}

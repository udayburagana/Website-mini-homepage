import {test,expect} from '@playwright/test';
test.afterEach(async ({page}) => { await page.goto('about:blank'); });
for(const persona of ['visionary','strategist','operator']){
 for(const [width,height] of [[1440,900],[390,844]]){
  test(`deployment smoke ${persona} ${width}`,async({page})=>{
   test.setTimeout(60000);await page.emulateMedia({reducedMotion:'reduce'});await page.setViewportSize({width,height});
   const errors=[],missing=[];page.on('pageerror',e=>errors.push(e.message));page.on('response',r=>{if(r.status()>=400&&new URL(r.url()).origin==='http://127.0.0.1:4174')missing.push(r.url());});
   await page.goto(`/?persona=${persona}`);const root=page.locator(`[data-persona-page="${persona}"]`);await expect(root).toBeVisible();await expect(root.locator('h1')).toHaveCount(1);await expect(root.locator('[data-persona-section]')).toHaveCount(11);
   for(const section of await root.locator('[data-persona-section]').all()) {await section.scrollIntoViewIfNeeded();await page.waitForTimeout(100);}
   const assets=await root.locator('img').evaluateAll(images=>images.filter(img=>img.getBoundingClientRect().width>0).map(img=>({src:img.currentSrc||img.src,loaded:img.complete&&img.naturalWidth>0})));expect(assets.filter(img=>!img.loaded)).toEqual([]);
   expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);expect(missing).toEqual([]);expect(errors).toEqual([]);
  });
 }
}

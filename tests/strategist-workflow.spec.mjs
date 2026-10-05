import { test, expect } from '@playwright/test';
for (const [name,width,height] of [['desktop',1440,900],['tablet',834,1112],['mobile',390,844],['short',1440,650]]) {
 test(`workflow ${name}: stack, reversible exits and viewport fit`,async({page})=>{
  test.setTimeout(90000);
  await page.setViewportSize({width,height});
  await page.goto('/?persona=strategist');
  await expect(page.locator('.strategist-loop')).toHaveAttribute('data-workflow-motion','stack');
  const scene=page.locator('.strategist-loop');
  const start=await scene.evaluate(el=>el.getBoundingClientRect().top+scrollY);
  const move=async(progress)=>{await page.evaluate(({start,progress})=>{const el=document.querySelector('.strategist-loop');window.scrollTo(0,start+(el.offsetHeight-innerHeight)*progress);},{start,progress});await page.waitForTimeout(500);};
  await move(0);
  const cards=scene.locator('.strategist-workflow__card');
  await expect(cards).toHaveCount(4);
  await expect(scene.locator('.stepper-tabs')).toHaveCount(0);
  for(const card of await cards.all()) {const box=await card.boundingBox();expect(box.y).toBeGreaterThan(60);expect(box.y+box.height).toBeLessThanOrEqual(height);}
  expect(await scene.locator('h2').evaluate(el=>getComputedStyle(el).fontSize)).toBe(width<768?'30px':width<1200?'40px':'52px');
  const sections=await page.locator('[data-strategist-section]').evaluateAll(nodes=>nodes.map(el=>({top:getComputedStyle(el).borderTopWidth,bottom:getComputedStyle(el).borderBottomWidth})));
  expect(sections.every(el=>el.top==='0px'&&el.bottom==='0px')).toBe(true);
  const headings=await page.locator('[data-strategist-section] h2').evaluateAll(nodes=>nodes.map(el=>({size:getComputedStyle(el).fontSize,weight:getComputedStyle(el).fontWeight})));
  expect(headings.every(el=>el.size===(width<768?'30px':width<1200?'40px':'52px')&&el.weight==='500')).toBe(true);
  await page.screenshot({path:`docs/qa/strategist-workflow-${name}.png`});
  await move(.22);
  expect(Number(await cards.nth(0).evaluate(el=>getComputedStyle(el).opacity))).toBeLessThan(.1);
  expect(parseFloat(await cards.nth(0).evaluate(el=>el.style.getPropertyValue('--card-x')))).toBeLessThan(0);
  const pinned=await scene.locator('.strategist-workflow').boundingBox();expect(Math.abs(pinned.y)).toBeLessThan(2);
  await move(.46);
  expect(Number(await cards.nth(1).evaluate(el=>getComputedStyle(el).opacity))).toBeLessThan(.1);
  expect(parseFloat(await cards.nth(1).evaluate(el=>el.style.getPropertyValue('--card-x')))).toBeGreaterThan(0);
  await move(0);
  for(const card of await cards.all()) await expect(card).toHaveCSS('opacity','1');
  const audit=await page.locator('[data-strategist-cinematic]').evaluate(root=>[...root.querySelectorAll('*')].filter(el=>[...el.childNodes].some(n=>n.nodeType===3&&n.textContent.trim())&&el.getBoundingClientRect().width&&parseFloat(getComputedStyle(el).fontSize)<12).map(el=>({tag:el.tagName,cls:el.className,size:getComputedStyle(el).fontSize})));
  expect(audit).toEqual([]);
 });
}
test('workflow reduced motion exposes all four cards',async({page})=>{
 await page.emulateMedia({reducedMotion:'reduce'});await page.goto('/?persona=strategist');
 await expect(page.locator('.strategist-loop')).toHaveAttribute('data-workflow-motion','flow');
 for(const card of await page.locator('.strategist-workflow__card').all()){await expect(card).toBeVisible();await expect(card).toHaveCSS('transform','none');}
});

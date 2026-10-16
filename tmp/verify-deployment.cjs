const {chromium}=require('@playwright/test');
(async()=>{
 const base='https://website-mini-homepage.vercel.app';
 const response=await fetch(base);const html=await response.text();if(response.status!==200||!html.includes('strategist-close__phone'))throw Error('Latest public homepage missing');console.log('Anonymous public access: HTTP '+response.status);
 for(const file of ['vendor/visionary-cinematic.bundle.js','vendor/strategist-cinematic.bundle.js','vendor/operator-cinematic.bundle.js','assets/generated/strategist/strategist-vision-background.mp4','assets/generated/strategist/strategist-access-background.mp4']){const res=await fetch(base+'/'+file,{method:'HEAD'});if(res.status!==200)throw Error(file+' '+res.status);console.log('Asset '+res.status+' '+file+' '+res.headers.get('content-type'));}
 const browser=await chromium.launch();
 for(const persona of ['visionary','strategist','operator'])for(const width of [1440,390]){
  const context=await browser.newContext({viewport:{width,height:900},reducedMotion:'reduce'});const page=await context.newPage();const errors=[];page.on('pageerror',e=>errors.push(e.message));
  await page.goto(base+'/?persona='+persona,{waitUntil:'load',timeout:30000});await page.waitForTimeout(600);
  const result=await page.locator('[data-persona-page="'+persona+'"]').evaluate(root=>({visible:!root.hidden&&!root.inert,sections:root.querySelectorAll('[data-persona-section]').length,heading:root.querySelector('h1')?.textContent,overflow:document.documentElement.scrollWidth>innerWidth}));
  if(!result.visible||result.sections!==11||result.overflow||errors.length)throw Error(JSON.stringify({persona,width,...result,errors}));console.log('LIVE PASS '+persona+' '+width+'px, 11 sections, no overflow or script errors');await page.goto('about:blank');await context.close();
 }
 await Promise.race([browser.close(),new Promise(r=>setTimeout(r,3000))]);process.exit(0);
})().catch(e=>{console.error(e);process.exit(1)});

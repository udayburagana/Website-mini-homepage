import { test, expect } from '@playwright/test';
import AxeBuilder from '@axe-core/playwright';
const personas = ['visionary', 'strategist', 'operator'];
const dialog = page => page.locator('[data-persona-selector]');

test('chooser opens immediately on every visit, refresh and saved or explicit selection', async ({ page }) => {
  await page.goto('/');
  await expect(dialog(page)).toBeVisible();
  await expect(page.locator('[data-persona-option="default"]')).toHaveAttribute('aria-pressed', 'true');
  await page.getByRole('button', { name: /prove culture impact/ }).click();
  await expect(page).toHaveURL(/persona=strategist/);
  await expect(dialog(page)).toBeHidden();
  await expect(page.locator('[data-persona-page="strategist"] h1')).toBeFocused();
  await page.reload(); await expect(dialog(page)).toBeVisible();
  await page.keyboard.press('Escape');
  await expect(page.locator('.persona-header [data-change-experience]')).toBeFocused();
  await page.goto('/'); await expect(dialog(page)).toBeVisible();
  await expect(page.locator('[data-persona-option="strategist"]')).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/?persona=operator'); await expect(dialog(page)).toBeVisible();
  await expect(page.locator('[data-persona-option="operator"]')).toHaveAttribute('aria-pressed', 'true');
  await page.goto('/?persona=unknown'); await expect(page).toHaveURL(/persona=default/);
  await expect(dialog(page)).toBeVisible();
});

test('neutral chooser contains focus, supports dismissal and releases scroll lock', async ({ page }) => {
  await page.goto('/?persona=visionary');
  await expect(dialog(page)).toHaveCSS('background-color', 'rgb(250, 250, 249)');
  await expect(page.locator('body')).toHaveClass(/dialog-open/);
  for(let i=0;i<8;i++) { await page.keyboard.press('Tab'); expect(await page.evaluate(() => !!document.activeElement.closest('dialog'))).toBe(true); }
  const audit = await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze(); expect(audit.violations).toEqual([]);
  await page.keyboard.press('Escape'); await expect(dialog(page)).toBeHidden();
  await expect(page.locator('body')).not.toHaveClass(/dialog-open/);
  const trigger=page.locator('.persona-header [data-change-experience]'); await expect(trigger).toBeFocused(); await trigger.click();
  await page.mouse.click(8,8); await expect(dialog(page)).toBeHidden(); await expect(trigger).toBeFocused();
});

for(const persona of personas) {
  test(persona + ' homepage conversion copy, destinations and navbar hierarchy', async ({page}) => {
    await page.emulateMedia({reducedMotion:'reduce'}); await page.goto('/?persona='+persona);
    await page.locator('[data-persona-close]').click();
    await expect(page.locator('[data-persona-intro], .persona-introduction')).toHaveCount(0);
    const home=page.locator('[data-persona-page="'+persona+'"]');
    expect(await home.textContent()).not.toMatch(/waitlist/i);
    for(const [section,label] of [['hero','Create your account'],['early-access','Join EzRewards'],['pricing','Join EzRewards'],['final-cta','Create your account']]) {
      const cta=home.locator('[data-persona-section="'+section+'"] [data-conversion="signup"]');
      await expect(cta).toContainText(label); await expect(cta).toHaveAttribute('href','/signup.html?persona='+persona);
    }
    await expect(page.locator('header [data-conversion="signup"]')).toHaveText('Create Account');
    await expect(page.locator('header [data-conversion="signin"]')).toHaveAttribute('href','/signin.html?persona=visionary');
    if(persona==='strategist') { await expect(home.locator('[data-persona-section="hero"] [data-conversion="demo"]')).toHaveText('Book a Demo'); await expect(home.getByRole('link',{name:'See measurable outcomes',exact:true})).toHaveAttribute('href','#strategist-outcomes'); }
    await page.evaluate(() => window.dataLayer=[]); await page.locator('header [data-conversion="signup"]').click();
    await expect(page).toHaveURL('/signup.html?persona=visionary'); await expect(page.locator('html')).toHaveAttribute('data-persona','visionary');
    await expect(page.getByRole('heading',{level:1})).toHaveText('Create Admin Account');
  });
  for(const mode of ['signup','signin','demo']) {
    test(persona + ' ' + mode + ' validates and simulates without sending or saving values', async ({page}) => {
      await page.goto('/'+mode+'.html?persona='+persona); await expect(page.locator('dialog[open]')).toHaveCount(0);
      const audit=await new AxeBuilder({page}).withTags(['wcag2a','wcag2aa','wcag21aa']).analyze(); expect(audit.violations).toEqual([]);
      const form=page.locator('#preview-form'); await form.getByRole('button',{name:mode==='signup'?'Create Account':mode==='signin'?'Sign In':'Request a demo',exact:true}).click();
      await expect(form.locator('[aria-invalid="true"]').first()).toBeFocused();
      if(mode==='signup') { await page.getByLabel('First name',{exact:true}).fill('Preview'); await page.getByLabel('Last name',{exact:true}).fill('Person'); } if(mode==='demo') {await page.getByLabel('Full name').fill('Preview Person'); await page.getByLabel('Company',{exact:true}).fill('Preview Company');}
      await form.getByLabel('Work email').fill('invalid'); await form.locator('[type="submit"]').click(); await expect(form.getByLabel('Work email')).toHaveAttribute('aria-invalid','true');
      await form.getByLabel('Work email').fill('preview@example.com');
      if(mode!=='demo') {
        await page.getByLabel('Password',{exact:true}).fill('short');
        if(mode==='signup') { await form.locator('[type="submit"]').click(); await expect(page.locator('#preview-password-error')).toHaveText('Use at least 8 characters for your password.'); }
        await page.getByLabel('Password',{exact:true}).fill('PreviewOnly123');
        await page.getByRole('button',{name:'Show password'}).click(); await expect(page.getByLabel('Password',{exact:true})).toHaveAttribute('type','text');
        await page.getByRole('button',{name:'Hide password'}).click();
      }
      if(mode==='signup'){await page.getByLabel('Confirm password',{exact:true}).fill('PreviewOnly123');await page.getByLabel('I am human').check();}
      await page.evaluate(() => window.dataLayer=[]);
      const storageBefore=await page.evaluate(()=>({local:{...localStorage},session:{...sessionStorage}}));
      const sent=[];page.on('request',request=>sent.push(request.url()));
      await form.locator('[type="submit"]').click(); await expect(page.locator('#preview-confirmation')).toBeVisible();
      await expect(page.locator('#preview-confirmation')).toBeFocused(); expect(sent).toEqual([]);
      expect(await page.evaluate(()=>({local:{...localStorage},session:{...sessionStorage}}))).toEqual(storageBefore);
      expect(await page.evaluate(()=>JSON.stringify(window.dataLayer))).toBe('[]');
      expect(await form.locator('input').evaluateAll(inputs=>inputs.filter(input=>input.type!=='checkbox').every(input=>input.value===''))).toBe(true);
      await expect(page.locator('#preview-confirmation a')).toHaveAttribute('href','/?persona='+persona);
      await page.locator(mode==='demo'?'.preview-switch [data-conversion="signin"]':'.auth-switch [data-conversion="'+(mode==='signin'?'signup':'signin')+'"]').click(); await expect(page.locator('html')).toHaveAttribute('data-persona',persona);
    });
  }
}

test('preview direct loads resolve saved, default, creative and invalid personalities', async({page})=>{
  await page.goto('/signup'); await expect(page.locator('html')).toHaveAttribute('data-persona','default');
  await page.evaluate(()=>localStorage.setItem('ezrewards-persona','operator')); await page.goto('/signin'); await expect(page.locator('html')).toHaveAttribute('data-persona','operator');
  await page.goto('/demo.html?persona=creative-culture-builder'); await expect(page.locator('html')).toHaveAttribute('data-persona','creative-culture-builder');
  await page.goto('/signup.html?persona=invalid'); await expect(page.locator('html')).toHaveAttribute('data-persona','default');
});

for(const width of [320,390,768,1024,1440]) {
  test('chooser, header and all previews fit '+width+'px',async({page})=>{
    test.setTimeout(60000); await page.setViewportSize({width,height:width===1440?600:844}); await page.emulateMedia({reducedMotion:'reduce'});
    for(const persona of personas) {
      await page.goto('/?persona='+persona); const bounds=await dialog(page).boundingBox();expect(bounds.y).toBeGreaterThanOrEqual(0); expect(bounds.y+bounds.height).toBeLessThanOrEqual(width===1440?600:844);
      await page.locator('[data-persona-close]').click(); if(width<768) await page.locator('[data-menu-toggle]').click();
      await expect(page.locator('header [data-conversion="signup"]')).toBeVisible(); await expect(page.locator('header [data-conversion="signin"]')).toBeVisible();
      expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);
      for(const mode of ['signup','signin','demo']) { await page.goto('/'+mode+'?persona='+persona);expect(await page.evaluate(()=>document.documentElement.scrollWidth<=innerWidth)).toBe(true);await expect(page.locator('#preview-submit')).toBeVisible(); }
    }
  });
}

test('CTA analytics include conversion action, personality and section without form data', async({page})=>{
  await page.goto('/?persona=strategist'); await page.locator('[data-persona-close]').click();
  await page.evaluate(()=>{ window.dataLayer=[]; document.addEventListener('click',event=>{if(event.target.closest('[data-conversion]'))event.preventDefault();}); });
  await page.locator('header [data-conversion="signin"]').click();
  expect(await page.evaluate(()=>window.dataLayer.at(-1))).toEqual({event:'cta_clicked',persona:'strategist',action:'signin',label:'Sign in',section:'navbar'});
  await page.locator('[data-persona-page="strategist"] [data-conversion="demo"]').click();
  expect(await page.evaluate(()=>window.dataLayer.at(-1))).toEqual({event:'cta_clicked',persona:'strategist',action:'demo',label:'Book a Demo',section:'hero'});
});

test('short mobile chooser scrolls natively and restores visible navigation; desktop inertia resumes', async({page})=>{
  await page.setViewportSize({width:390,height:600}); await page.goto('/?persona=default');
  expect(await dialog(page).evaluate(node=>node.scrollTop)).toBe(0);
  await page.mouse.move(180,440); await page.mouse.wheel(0,400);
  await expect.poll(()=>dialog(page).evaluate(node=>node.scrollTop)).toBeGreaterThan(100);
  expect(await page.evaluate(()=>scrollY)).toBe(0);
  await page.locator('[data-persona-close]').click(); await expect(page.locator('[data-menu-toggle]')).toBeFocused();
  await page.setViewportSize({width:1440,height:900}); await page.goto('/?persona=visionary');
  await page.mouse.move(20,880); await page.mouse.wheel(0,500); expect(await page.evaluate(()=>scrollY)).toBe(0);
  await page.keyboard.press('Escape'); await page.mouse.wheel(0,500); await expect.poll(()=>page.evaluate(()=>scrollY)).toBeGreaterThan(100);
});

for (const persona of personas) {
  test(persona + ' section signup journey retains theme through sign-in and back', async ({page}) => {
    await page.goto('/?persona='+persona); await page.locator('[data-persona-close]').click();
    await page.locator('[data-persona-page="'+persona+'"] [data-persona-section="hero"] [data-conversion="signup"]').click();
    await expect(page).toHaveURL('/signup.html?persona='+persona);
    await expect(page.getByRole('heading',{name:'Create Admin Account'})).toBeVisible();
    expect(await page.locator('#theme-art').evaluate(image=>image.naturalWidth)).toBeGreaterThan(0);
    await page.locator('.auth-switch a').click(); await expect(page).toHaveURL('/signin.html?persona='+persona);
    await expect(page.getByRole('heading',{name:'Welcome Back'})).toBeVisible();
    await page.locator('.auth-switch a').click(); await expect(page).toHaveURL('/signup.html?persona='+persona);
  });
}

test('account pages work with a plain static server without URL rewrites', async ({page}) => {
  const {createServer}=await import('node:http'); const {readFile}=await import('node:fs/promises'); const {resolve,extname}=await import('node:path');
  const root=resolve('.'); const types={'.html':'text/html','.js':'text/javascript','.css':'text/css','.webp':'image/webp','.png':'image/png','.woff2':'font/woff2'};
  const server=createServer(async(request,response)=>{
    try { const pathname=new URL(request.url,'http://localhost').pathname; const path=resolve(root,'.'+(pathname==='/'?'/Homepage.dc.html':pathname));if(!path.startsWith(root))throw Error('invalid');response.writeHead(200,{'Content-Type':types[extname(path)]||'application/octet-stream'});response.end(await readFile(path)); }
    catch {response.writeHead(404);response.end('Not found');}
  });
  await new Promise(resolve=>server.listen(0,'127.0.0.1',resolve)); const origin='http://127.0.0.1:'+server.address().port;
  try {
    for(const persona of personas) {
      await page.goto(origin+'/?persona='+persona);await page.locator('[data-persona-close]').click();
      await page.locator('header [data-conversion="signin"]').click();await expect(page.getByRole('heading',{name:'Welcome Back'})).toBeVisible();await expect(page.locator('html')).toHaveAttribute('data-persona','visionary');
      await page.locator('.auth-switch a').click();await expect(page.getByRole('heading',{name:'Create Admin Account'})).toBeVisible();
    }
  } finally {await new Promise(resolve=>server.close(resolve));}
});

test('provider and reset controls are explicit previews without requests or stored details',async({page})=>{
  await page.goto('/signin.html?persona=strategist'); const requests=[];page.on('request',r=>requests.push(r.url()));
  await page.getByRole('button',{name:'Google',exact:true}).click();await expect(page.locator('#auth-dialog')).toContainText('authentication is not connected');await page.keyboard.press('Escape');
  await page.getByRole('button',{name:'Forgot password?'}).click();await page.locator('#reset-email').fill('preview@example.com');await page.locator('#reset-form [type="submit"]').click();await expect(page.locator('#reset-status')).toContainText('No reset email was sent');expect(requests).toEqual([]);await expect(page.locator('#reset-email')).toHaveValue('');
});

test('signup checks password rules, matching confirmation and human verification',async({page})=>{
  await page.goto('/signup.html?persona=visionary');const form=page.locator('#preview-form');
  await form.getByLabel('First name',{exact:true}).fill('Preview');await form.getByLabel('Last name',{exact:true}).fill('Person');await form.getByLabel('Work email address',{exact:true}).fill('preview@example.com');
  await form.getByLabel('Password',{exact:true}).fill('lowercase123');await form.getByLabel('Confirm password',{exact:true}).fill('different');await form.locator('[type="submit"]').click();
  await expect(page.locator('#preview-password-error')).toContainText('uppercase');await expect(page.locator('#preview-confirmPassword-error')).toContainText('must match');
  await form.getByLabel('Password',{exact:true}).fill('UppercaseOnly');await form.locator('[type="submit"]').click();await expect(page.locator('#preview-password-error')).toContainText('number');
  await form.getByLabel('Password',{exact:true}).fill('PreviewOnly123');await form.getByLabel('Confirm password',{exact:true}).fill('PreviewOnly123');await form.locator('[type="submit"]').click();await expect(page.getByLabel('I am human')).toBeFocused();await expect(page.locator('#preview-confirmation')).toBeHidden();
  await page.getByRole('button',{name:'Show confirm password'}).click();await expect(form.getByLabel('Confirm password',{exact:true})).toHaveAttribute('type','text');
});

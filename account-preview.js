(() => {
  const conversion = window.EzRewardsConversion;
  const persona = conversion.resolvePersona();
  const mode = document.documentElement.dataset.accountMode === 'signin' ? 'signin' : 'signup';
  document.documentElement.dataset.persona = persona;
  const icons = {
    user:'<circle cx="12" cy="7" r="3"/><path d="M5 21v-3a7 7 0 0 1 14 0v3"/>',
    email:'<rect x="3" y="5" width="18" height="14" rx="2"/><path d="m3 6 9 7 9-7"/>',
    lock:'<rect x="4" y="10" width="16" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/>',
    eye:'<path d="M2 12s3-7 10-7 10 7 10 7-3 7-10 7S2 12 2 12Z"/><circle cx="12" cy="12" r="3"/>',
    shield:'<path d="m12 2 8 4v6c0 5-8 10-8 10S4 17 4 12V6l8-4Z"/>',
    spark:'<path d="m12 2 2.5 7.5L22 12l-7.5 2.5L12 22l-2.5-7.5L2 12l7.5-2.5L12 2Z"/>'
  };
  const icon = name => '<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true">'+icons[name]+'</svg>';
  const themeArt = {
    visionary:'/assets/generated/recognition-garden-hero-1280.webp',
    strategist:'/assets/generated/strategist/strategist-observatory-1280.webp',
    operator:'/assets/generated/culture-signal-observatory-hero.png',
    default:'/assets/generated/belonging-archipelago-hero.png',
    'creative-culture-builder':'/assets/generated/belonging-archipelago-hero.png'
  };
  document.getElementById('theme-art').src = themeArt[persona];
  document.getElementById('workspace-shield').innerHTML = icon('shield');
  document.getElementById('auth-emblem').innerHTML = icon(mode === 'signup' ? 'shield' : 'spark');
  const signup = mode === 'signup';
  document.title = 'EzRewards | '+(signup?'Create Admin Account':'Welcome Back');
  document.getElementById('form-title').textContent = signup?'Create Admin Account':'Welcome Back';
  document.getElementById('form-description').textContent = signup?'Set up your workspace and start managing rewards':'Sign in to EzRewards';
  document.getElementById('preview-submit').innerHTML = (signup?'Create Account':'Sign In')+' <span aria-hidden="true">→</span>';
  document.getElementById('social-caption').textContent = signup?'or sign up with':'or continue with';
  document.getElementById('preview-notice').textContent = signup?'Preview only. No account will be created.':'Preview only. No sign-in will occur.';
  document.getElementById('account-switch').innerHTML = signup?'Already have an account? <a data-conversion="signin" href="/signin.html?persona='+persona+'">Sign In</a>':'Don’t have an account? <a data-conversion="signup" href="/signup.html?persona='+persona+'">Create Account</a>';
  conversion.updateLinks(persona);
  document.querySelector('meta[name="theme-color"]').content = getComputedStyle(document.documentElement).getPropertyValue('--auth-bg').trim();
  const form = document.getElementById('preview-form');
  const fieldContainer = document.getElementById('preview-fields');
  const definitions = {
    firstName:{label:'First name',type:'text',autocomplete:'given-name',icon:'user'},
    lastName:{label:'Last name',type:'text',autocomplete:'family-name',icon:'user'},
    email:{label:'Work email address',type:'email',autocomplete:'email',icon:'email'},
    password:{label:'Password',type:'password',autocomplete:signup?'new-password':'current-password',icon:'lock'},
    confirmPassword:{label:'Confirm password',type:'password',autocomplete:'new-password',icon:'lock'}
  };
  const fields = signup?['firstName','lastName','email','password','confirmPassword']:['email','password'];
  const nameRow = document.createElement('div'); nameRow.className = 'auth-name-row';
  if(signup) fieldContainer.append(nameRow);
  fields.forEach(name => {
    const definition = definitions[name];
    const wrapper = document.createElement('div'); wrapper.className = 'auth-field';
    const label = document.createElement('label'); label.className = 'sr-only'; label.htmlFor = 'preview-'+name; label.textContent = definition.label;
    const shell = document.createElement('div'); shell.className = 'input-shell';
    const leading = document.createElement('span'); leading.className = 'input-icon'; leading.innerHTML = icon(definition.icon); leading.setAttribute('aria-hidden','true');
    const control = document.createElement('input'); control.id = label.htmlFor; control.name = name; control.type = definition.type; control.required = true; control.autocomplete = definition.autocomplete; control.placeholder = definition.label;
    if(name === 'password' && signup) control.minLength = 8;
    shell.append(leading,control);
    if(definition.type === 'password') {
      const toggle = document.createElement('button'); toggle.type = 'button'; toggle.className = 'password-toggle'; toggle.innerHTML = icon('eye'); toggle.setAttribute('aria-label','Show '+definition.label.toLowerCase()); toggle.setAttribute('aria-pressed','false'); toggle.setAttribute('aria-controls',control.id);
      toggle.addEventListener('click',()=>{ const show=control.type==='password'; control.type=show?'text':'password'; toggle.setAttribute('aria-label',(show?'Hide ':'Show ')+definition.label.toLowerCase()); toggle.setAttribute('aria-pressed',String(show)); }); shell.append(toggle);
    }
    const error = document.createElement('p'); error.id=control.id+'-error'; error.className='field-error'; error.hidden=true;
    control.setAttribute('aria-describedby',error.id+(name==='password'&&signup?' password-rules':''));
    wrapper.append(label,shell,error); (name==='firstName'||name==='lastName'?nameRow:fieldContainer).append(wrapper);
    control.addEventListener('input',()=>{
      if(control.hasAttribute('aria-invalid')) validate(control);
      if(name==='password'&&signup) { updateRules(); const confirm=form.elements.confirmPassword; if(confirm.hasAttribute('aria-invalid'))validate(confirm); }
    });
  });
  const extras=document.getElementById('auth-extras');
  if(signup) extras.innerHTML='<ul class="password-rules" id="password-rules"><li data-rule="length">At least 8 characters</li><li data-rule="uppercase">One uppercase letter</li><li data-rule="number">One number</li></ul><div class="human-check"><label><input type="checkbox" id="human-check" name="human" required aria-describedby="human-notice"> I am human</label><div class="verification-preview" id="human-notice"><span aria-hidden="true">✓</span>Verification<br>Preview only</div></div>';
  else extras.innerHTML='<div class="signin-options"><label><input type="checkbox" name="remember"> Remember me</label><button type="button" class="text-button" data-forgot>Forgot password?</button></div>';
  function updateRules() {
    const value=form.elements.password.value;
    const checks={length:value.length>=8,uppercase:/[A-Z]/.test(value),number:/[0-9]/.test(value)};
    document.querySelectorAll('[data-rule]').forEach(rule=>rule.dataset.met=String(checks[rule.dataset.rule]));
  }
  function validate(control) {
    let message='';
    if(!control.value.trim())message='Please enter your '+definitions[control.name].label.toLowerCase()+'.';
    else if(control.name==='email'&&!control.validity.valid)message='Enter a valid work email address.';
    else if(control.name==='password'&&signup) {
      if(control.value.length<8)message='Use at least 8 characters for your password.';
      else if(!/[A-Z]/.test(control.value))message='Include at least one uppercase letter.';
      else if(!/[0-9]/.test(control.value))message='Include at least one number.';
    } else if(control.name==='confirmPassword'&&control.value!==form.elements.password.value)message='Your passwords must match.';
    const error=document.getElementById(control.id+'-error'); error.textContent=message; error.hidden=!message;
    if(message)control.setAttribute('aria-invalid','true');else control.removeAttribute('aria-invalid');
    return !message;
  }
  form.addEventListener('submit',event=>{
    event.preventDefault();
    const invalid=[...form.querySelectorAll('input:not([type="checkbox"])')].filter(control=>!validate(control));
    const status=document.getElementById('form-status');
    if(invalid.length){status.textContent='Please check the highlighted fields.';invalid[0].focus();return;}
    if(signup&&!form.elements.human.checked){status.textContent='Please select “I am human” to complete this preview.';form.elements.human.setAttribute('aria-invalid','true');form.elements.human.focus();return;}
    form.reset();status.textContent='';form.hidden=true;
    document.getElementById('social-signin').hidden=true;
    document.getElementById('confirmation-description').textContent=signup?'Account creation preview complete. No account was created and no details were sent or saved.':'Sign-in preview complete. You have not been signed in and no credentials were sent or saved.';
    const confirmation=document.getElementById('preview-confirmation');confirmation.hidden=false;confirmation.focus();
  });
  form.elements.human?.addEventListener('change',event=>{event.target.removeAttribute('aria-invalid');document.getElementById('form-status').textContent='';});
  const dialog=document.getElementById('auth-dialog'); let dialogTrigger=null;
  function openDialog(title,description,trigger,reset=false) {
    dialogTrigger=trigger;document.getElementById('auth-dialog-title').textContent=title;document.getElementById('auth-dialog-description').textContent=description;
    document.getElementById('reset-form').hidden=!reset;document.getElementById('reset-status').textContent='';dialog.showModal();
  }
  document.addEventListener('click',event=>{
    const provider=event.target.closest('[data-provider]');
    if(provider)openDialog('Continue with '+provider.dataset.provider,'Preview only. '+provider.dataset.provider+' authentication is not connected. No account will be created and no sign-in will occur.',provider);
    const forgot=event.target.closest('[data-forgot]');if(forgot)openDialog('Reset your password','Preview only. No password reset email will be sent.',forgot,true);
    const info=event.target.closest('[data-info]');if(info)openDialog(info.dataset.info==='privacy'?'Privacy Policy':'Terms of Service','This is a design preview. Account details are not sent or saved. The full '+(info.dataset.info==='privacy'?'privacy policy':'terms of service')+' will be available with the live account service.',info);
    if(event.target.closest('.dialog-close'))dialog.close();
    const link=event.target.closest('a[data-conversion]');if(link){const detail={persona,action:link.dataset.conversion,label:link.textContent.trim(),section:'preview-'+mode};if(Array.isArray(window.dataLayer))window.dataLayer.push({event:'cta_clicked',...detail});dispatchEvent(new CustomEvent('ezrewards:cta_clicked',{detail}));}
  });
  dialog.addEventListener('close',()=>{document.getElementById('reset-form').reset();dialogTrigger?.focus();});
  document.getElementById('reset-form').addEventListener('submit',event=>{event.preventDefault();const email=document.getElementById('reset-email');const status=document.getElementById('reset-status');if(!email.validity.valid){status.textContent='Enter a valid work email address.';email.setAttribute('aria-invalid','true');email.focus();return;}email.removeAttribute('aria-invalid');event.target.reset();status.textContent='Preview complete. No reset email was sent and no details were saved.';});
  addEventListener('pagehide',()=>{form.reset();document.getElementById('reset-form').reset();});
})();

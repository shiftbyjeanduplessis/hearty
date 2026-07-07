(function(){
  'use strict';

  const DEFAULT_LOGO_SRC = './hearty-logo.png?v=92';
  const MAIN_PAGES = new Set(['home','meals','exercise','progress','support','recipes','social','community','settings','how-to-use','help','onboarding']);
  const NAV = [
    { id:'home', label:'Home', href:'./home.html', icon:'<path d="M3 11.5 12 4l9 7.5"></path><path d="M5.5 10.5V20h13v-9.5"></path><path d="M9.5 20v-6h5v6"></path>' },
    { id:'meals', label:'Meals', href:'./meals.html', icon:'<path d="M4 3v8"></path><path d="M8 3v8"></path><path d="M6 3v18"></path><path d="M15 3v18"></path><path d="M15 3c3 2 4.5 5 4.5 8H15"></path>' },
    { id:'exercise', label:'Exercise', href:'./exercise.html', icon:'<path d="M6 7v10"></path><path d="M18 7v10"></path><path d="M3 10v4"></path><path d="M21 10v4"></path><path d="M6 12h12"></path>' },
    { id:'progress', label:'Progress', href:'./progress.html', icon:'<path d="M4 19V5"></path><path d="M4 19h16"></path><path d="M7 15l3-3 3 2 5-7"></path>' },
    { id:'support', label:'Support', href:'./support.html', icon:'<path d="M12 21s-7-4.4-9-9a5 5 0 0 1 8-5 5 5 0 0 1 8 5c-2 4.6-9 9-9 9z"></path>' },
    { id:'recipes', label:'Recipes', href:'./recipes.html', icon:'<path d="M6 4.5h10.5a2.5 2.5 0 0 1 2.5 2.5v12.5H7.5A2.5 2.5 0 0 1 5 17V5.5c0-.55.45-1 1-1z"></path><path d="M8.5 8h7"></path><path d="M8.5 11.5h6"></path><path d="M8.5 15h4"></path>' },
    { id:'settings', label:'Settings', href:'./settings.html', icon:'<path d="M19.43 12.98c.04-.32.07-.65.07-.98s-.02-.66-.07-.98l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.49 1a7.4 7.4 0 0 0-1.69-.98l-.38-2.65A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.49.42l-.38 2.65a7.4 7.4 0 0 0-1.69.98l-2.49-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.64l2.11 1.65a7.9 7.9 0 0 0 0 1.96l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46a.5.5 0 0 0 .6.22l2.49-1c.51.4 1.08.73 1.69.98l.38 2.65c.04.24.25.42.49.42h4c.24 0 .45-.18.49-.42l.38-2.65c.61-.25 1.18-.58 1.69-.98l2.49 1a.5.5 0 0 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"></path>' }
  ];

  function pageId(){
    const bodyPage = document.body && document.body.getAttribute('data-page');
    if(bodyPage){ const p = bodyPage.toLowerCase().replace(/\.html$/,'').replace(/_/g,'-'); return (p === 'community' || p === 'social') ? 'recipes' : p; }
    let file = (location.pathname.split('/').pop() || 'home.html').toLowerCase();
    if(file === '' || file === 'index.html') file = 'home.html';
    const p = file.replace(/\.html$/,'');
    return (p === 'community' || p === 'social') ? 'recipes' : p;
  }

  function currentTheme(){
    return (document.documentElement.getAttribute('data-theme') || document.body.getAttribute('data-theme') || 'clean_blue').toLowerCase();
  }

  function logoConfig(){
    try{ if(typeof window.heartyLogoForTheme === 'function') return window.heartyLogoForTheme(currentTheme()) || {}; }catch(e){}
    return {};
  }

  function logoSrc(){
    const cfg = logoConfig();
    let src = cfg && cfg.src ? String(cfg.src) : DEFAULT_LOGO_SRC;
    if(/(^|\/)hearty-logo\.png$/i.test(src)) src = src.replace(/hearty-logo\.png$/i, 'hearty-logo.png?v=92');
    if(/^\.?\//.test(src) || /^assets\//.test(src) || /^https?:/.test(src)) return src;
    return './' + src.replace(/^\/+/, '');
  }

  function topbarMarkup(active){
    const settingsCurrent = active === 'settings' ? ' aria-current="page"' : '';
    return '<header class="topbar" data-shell-template="topbar" data-active-page="' + active + '">' +
      '<a class="brand" href="./home.html" aria-label="Hearty Home" data-logo-source="real-asset"><img class="brand-logo" src="' + logoSrc() + '" alt="Hearty"></a>' +
      '<a class="icon-btn" href="./settings.html" aria-label="Settings"' + settingsCurrent + '>' +
      '<svg viewBox="0 0 24 24" data-hearty-gear="true" aria-hidden="true" focusable="false"><path d="M19.43 12.98c.04-.32.07-.65.07-.98s-.02-.66-.07-.98l2.11-1.65a.5.5 0 0 0 .12-.64l-2-3.46a.5.5 0 0 0-.6-.22l-2.49 1a7.4 7.4 0 0 0-1.69-.98l-.38-2.65A.5.5 0 0 0 14 2h-4a.5.5 0 0 0-.49.42l-.38 2.65a7.4 7.4 0 0 0-1.69.98l-2.49-1a.5.5 0 0 0-.6.22l-2 3.46a.5.5 0 0 0 .12.64l2.11 1.65a7.9 7.9 0 0 0 0 1.96l-2.11 1.65a.5.5 0 0 0-.12.64l2 3.46a.5.5 0 0 0 .6.22l2.49-1c.51.4 1.08.73 1.69.98l.38 2.65c.04.24.25.42.49.42h4c.24 0 .45-.18.49-.42l.38-2.65c.61-.25 1.18-.58 1.69-.98l2.49 1a.5.5 0 0 0 .6-.22l2-3.46a.5.5 0 0 0-.12-.64l-2.11-1.65zM12 15.5a3.5 3.5 0 1 1 0-7 3.5 3.5 0 0 1 0 7z"></path></svg>' +
      '</a></header>';
  }

  function buildNav(active){
    const links = NAV.map(item => {
      const isActive = item.id === active;
      const gearAttr = item.id === 'settings' ? ' data-hearty-gear="true"' : '';
      return '<a class="nav-item' + (isActive ? ' active' : '') + '" href="' + item.href + '" data-nav-target="' + item.id + '"' + (isActive ? ' aria-current="page"' : '') + '>' +
        '<svg viewBox="0 0 24 24" aria-hidden="true"' + gearAttr + '>' + item.icon + '</svg><span>' + item.label + '</span></a>';
    }).join('');
    return '<nav class="bottom-nav" data-shell-template="bottom-nav" data-active-page="' + active + '" aria-label="Hearty navigation">' + links + '</nav>';
  }

  function shellHost(){
    return document.querySelector('.shell') || document.querySelector('#app') || document.body;
  }

  function removeLegacyTopbars(host){
    Array.from(document.querySelectorAll('.topbar, header')).forEach(el => {
      if(el.getAttribute('data-shell-template') === 'topbar') return;
      if(el.closest('.auth-card')) return;
      if(el.closest('[data-keep-legacy-header="true"]')) return;
      if(el === host) return;
      el.remove();
    });
  }

  function setMountHTML(mount, html){
    if(!mount) return;
    if(mount.innerHTML !== html) mount.innerHTML = html;
  }

  function renderTopbar(host, active){
    removeLegacyTopbars(host);
    let mount = document.querySelector('[data-shell-mount="topbar"]');
    if(!mount){
      mount = document.createElement('div');
      mount.setAttribute('data-shell-mount','topbar');
      host.insertAdjacentElement('afterbegin', mount);
    }
    setMountHTML(mount, topbarMarkup(active));
  }

  function renderNav(host, active){
    let mount = document.getElementById('bottomNav') || document.querySelector('[data-shell-mount="bottom-nav"]');
    if(!mount){
      mount = document.createElement('div');
      mount.id = 'bottomNav';
    }
    mount.id = 'bottomNav';
    mount.removeAttribute('class');
    mount.setAttribute('data-shell-mount','bottom-nav');
    mount.removeAttribute('data-shell-template');
    if(mount.parentNode !== document.body) document.body.appendChild(mount);

    Array.from(document.querySelectorAll('nav.bottom-nav, .bottom-nav')).forEach(el => {
      if(mount.contains(el)) return;
      el.remove();
    });

    setMountHTML(mount, buildNav(active));
    document.body.setAttribute('data-hearty-nav-ready','true');
  }

  function renderAuthLogo(){
    const logo = document.querySelector('.auth-logo');
    if(!logo) return;
    logo.style.display = 'none';
    let lockup = document.querySelector('.auth-brand-lockup');
    if(!lockup){
      lockup = document.createElement('div');
      lockup.className = 'auth-brand-lockup';
      logo.insertAdjacentElement('afterend', lockup);
    }
    lockup.innerHTML = '<a class="brand" href="./home.html" aria-label="Hearty Home"><img class="brand-logo" src="' + logoSrc() + '" alt="Hearty"></a>';
  }

  function truthySupportValue(value){
    if(value === true) return true;
    if(value === 1) return true;
    const v = String(value == null ? '' : value).toLowerCase().trim();
    return ['on','true','1','active','yes'].includes(v);
  }

  function supportStateIsOn(raw){
    if(!raw) return false;
    if(truthySupportValue(raw)) return true;
    const text = String(raw).trim();
    if(text.charAt(0) !== '{') return false;
    try{
      const obj = JSON.parse(text);
      if(!obj || typeof obj !== 'object') return false;
      return truthySupportValue(obj.active) ||
        truthySupportValue(obj.isActive) ||
        truthySupportValue(obj.supportMode) ||
        truthySupportValue(obj.supportModeOn) ||
        truthySupportValue(obj.on) ||
        truthySupportValue(obj.mode) ||
        truthySupportValue(obj.status);
    }catch(e){
      return false;
    }
  }

  function normaliseSupportState(){
    let isOn = false;
    try{
      const stateKeys = ['hearty_support_mode_v1','heartySupportState','heartySupportMode','hearty_support_state','support_mode_state'];
      let foundState = false;
      for(const key of stateKeys){
        const raw = localStorage.getItem(key);
        if(raw){
          foundState = true;
          isOn = supportStateIsOn(raw);
          break;
        }
      }
      if(!foundState){
        const simpleKeys = ['supportMode','heartySupportActive','hearty_support_mode','meals_support_mode'];
        for(const key of simpleKeys){
          if(supportStateIsOn(localStorage.getItem(key))){
            isOn = true;
            break;
          }
        }
      }
    }catch(e){ isOn = false; }
    document.querySelectorAll('#supportCard,.support-card,[data-support-card]').forEach(card => {
      card.classList.toggle('is-active', isOn);
      card.classList.toggle('active', isOn);
      card.classList.toggle('support-mode-active', isOn);
      card.classList.toggle('is-off', !isOn);
      card.setAttribute('data-support-state', isOn ? 'on' : 'off');
    });
  }

  let rendering = false;
  function render(){
    if(rendering) return;
    rendering = true;
    try{
      const active = pageId();
      document.body.setAttribute('data-page', active);
      document.documentElement.setAttribute('data-page', active);
      renderAuthLogo();
      if(MAIN_PAGES.has(active)){
        const host = shellHost();
        renderTopbar(host, active);
        renderNav(host, active);
      }
      normaliseSupportState();
    }finally{
      rendering = false;
    }
  }

  if(document.readyState === 'loading'){
    document.addEventListener('DOMContentLoaded', render, { once:true });
  }else{
    render();
  }
  window.addEventListener('storage', render);
  window.addEventListener('hearty:theme-change', render);
  ['hearty:support-change','hearty:support-mode-changed','hearty:support-mode-change','hearty:support-changed'].forEach(eventName => {
    window.addEventListener(eventName, normaliseSupportState);
  });
  window.HeartyShellTemplate = { render, buildNav, NAV };
})();

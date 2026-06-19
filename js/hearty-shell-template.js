(function(){
  'use strict';

  const DEFAULT_LOGO_SRC = './hearty-logo.png';
  const MAIN_PAGES = new Set(['home','meals','exercise','progress','support','social','community','settings','how-to-use','help']);
  const NAV = [
    { id:'home', label:'Home', href:'/home.html', icon:'<path d="M3 11.5 12 4l9 7.5"></path><path d="M5.5 10.5V20h13v-9.5"></path><path d="M9.5 20v-6h5v6"></path>' },
    { id:'meals', label:'Meals', href:'/meals.html', icon:'<path d="M4 3v8"></path><path d="M8 3v8"></path><path d="M6 3v18"></path><path d="M15 3v18"></path><path d="M15 3c3 2 4.5 5 4.5 8H15"></path>' },
    { id:'exercise', label:'Exercise', href:'/exercise.html', icon:'<path d="M6 7v10"></path><path d="M18 7v10"></path><path d="M3 10v4"></path><path d="M21 10v4"></path><path d="M6 12h12"></path>' },
    { id:'progress', label:'Progress', href:'/progress.html', icon:'<path d="M4 19V5"></path><path d="M4 19h16"></path><path d="M7 15l3-3 3 2 5-7"></path>' },
    { id:'support', label:'Support', href:'/support.html', icon:'<path d="M12 21s-7-4.4-9-9a5 5 0 0 1 8-5 5 5 0 0 1 8 5c-2 4.6-9 9-9 9z"></path>' },
    { id:'social', label:'Social', href:'/social.html', icon:'<path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path><circle cx="10" cy="7" r="4"></circle><path d="M21 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>' },
    { id:'settings', label:'Settings', href:'/settings.html', icon:'<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.92 3a1.65 1.65 0 0 0 1-1.51V1a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8c.14.31.4.55.72.67.17.07.35.1.53.1H21a2 2 0 1 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15z"></path>' }
  ];

  const PAGE_STRIPS = {
    home: {
      eyebrow: '',
      title: 'Welcome to Hearty',
      subtitle: '',
      action: ''
    },
    meals: {
      eyebrow: 'Meal planner',
      title: 'Your meals for today',
      subtitle: 'Protein-forward meals based on your setup.',
      action: '<div class="hearty-page-strip-actions support-status-controls"><div class="support-pill is-off" id="supportPill">Support Off</div><button class="support-off-btn support-off-top" data-support-off hidden id="supportOffBtn" type="button">Support Off</button><div class="hearty-page-strip-pill" id="todayLabel">Today</div></div>'
    },
    exercise: {
      eyebrow: 'Exercise',
      title: 'Training',
      subtitle: 'Choose home or gym and start the right session for today.'
    },
    progress: {
      eyebrow: 'Progress',
      title: 'Your progress at a glance',
      subtitle: 'Track your weight, photos, and weekly consistency in one place.'
    },
    support: {
      eyebrow: 'Support',
      title: 'Support Mode',
      subtitle: 'Tell Hearty what kind of support you need today. Your choice stays local and helps meals and exercise soften around you.',
      action: '<div class="status-pill hearty-page-strip-pill" id="statusPill"><span class="pill-dot"></span><span id="statusText">Support Off</span></div>'
    },
    social: {
      eyebrow: 'Social',
      title: 'Share intentionally',
      subtitle: 'Use this space for helpful updates and community support when you choose.',
      action: '<button aria-label="Turn Community on or off" aria-pressed="false" class="community-switch hearty-page-strip-switch" id="communityToggle" type="button"><span class="switch-copy"><span class="switch-kicker">Community</span><span class="switch-state" id="communityToggleText">Off</span></span><span aria-hidden="true" class="switch-track"></span></button>'
    },
    settings: {
      eyebrow: 'Settings',
      title: 'App settings',
      subtitle: 'Manage account access, theme, support, hydration, meals and app preferences.'
    },
    'how-to-use': {
      eyebrow: 'Start here',
      title: 'How to use Hearty',
      subtitle: 'A quick guide to Home, Meals, Support Mode, Progress, Movement and installing the app.'
    },
    help: {
      eyebrow: 'Help',
      title: 'Hearty Help',
      subtitle: 'Get support and open the quick guide.'
    }
  };

  function pageId(){
    const bodyPage = document.body && document.body.getAttribute('data-page');
    if(bodyPage){ const p = bodyPage.toLowerCase().replace(/\.html$/,'').replace(/_/g,'-'); return p === 'community' ? 'social' : p; }
    let file = (location.pathname.split('/').pop() || 'home.html').toLowerCase();
    if(file === '' || file === 'index.html') file = 'home.html';
    return file.replace(/\.html$/,'');
  }

  function currentTheme(){
    return (document.documentElement.getAttribute('data-theme') || document.body.getAttribute('data-theme') || 'clean_blue').toLowerCase();
  }

  function logoConfig(){
    try{
      if(typeof window.heartyLogoForTheme === 'function') return window.heartyLogoForTheme(currentTheme()) || {};
    }catch(e){}
    return {};
  }

  function logoSrc(){
    const cfg = logoConfig();
    const src = cfg && cfg.src ? String(cfg.src) : DEFAULT_LOGO_SRC;
    if(/^\.?\//.test(src) || /^assets\//.test(src) || /^https?:/.test(src)) return src;
    return './' + src.replace(/^\/+/, '');
  }

  function logoMarkup(){
    return '<span class="hearty-shell-logo-frame"><img class="hearty-shell-logo-img" src="' + logoSrc() + '" alt="Hearty"></span>';
  }

  function topbarMarkup(active){
    const settingsCurrent = active === 'settings' ? ' aria-current="page"' : '';
    return '<header class="topbar hearty-shell-topbar" data-shell-template="topbar">' +
      '<a class="hearty-shell-logo-link" href="./home.html" aria-label="Hearty Home" data-logo-source="real-asset">' + logoMarkup() + '</a>' +
      '<a class="hearty-shell-settings-btn" href="./settings.html" aria-label="Settings"' + settingsCurrent + '>' +
      '<svg viewBox="-2 -2 28 28" aria-hidden="true" focusable="false" class="hearty-shell-gear-icon"><circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.92 3a1.65 1.65 0 0 0 1-1.51V1a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8c.14.31.4.55.72.67.17.07.35.1.53.1H21a2 2 0 1 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15z"></path></svg>' +
      '</a>' +
    '</header>';
  }

  function navMarkup(active){
    const links = NAV.map(item => {
      const isActive = item.id === active;
      return '<a class="hearty-nav-item-v33' + (isActive ? ' active' : '') + '" href="' + item.href + '" data-nav-target="' + item.id + '"' + (isActive ? ' aria-current="page"' : '') + '>' +
        '<svg viewBox="0 0 24 24" aria-hidden="true">' + item.icon + '</svg><span>' + item.label + '</span></a>';
    }).join('');
    return '<nav class="hearty-bottom-nav-v33" data-shell-template="bottom-nav" aria-label="Hearty navigation">' + links + '</nav>';
  }

  function shellHost(){
    return document.querySelector('.shell') || document.querySelector('#app') || document.body;
  }

  function removeLegacyTopbars(host){
    const oldTopbars = Array.from(document.querySelectorAll('.topbar, header'))
      .filter(el => el.getAttribute('data-shell-template') !== 'topbar')
      .filter(el => !el.closest('[data-keep-legacy-header="true"]'));
    oldTopbars.forEach(el => {
      if(el.closest('.auth-card')) return;
      if(el === host) return;
      el.remove();
    });
  }

  function updateNavActive(nav, active){
    if(!nav) return;
    nav.setAttribute('data-active-page', active);
    nav.querySelectorAll('[data-nav-target]').forEach(link => {
      const on = link.getAttribute('data-nav-target') === active;
      link.classList.toggle('active', on);
      if(on) link.setAttribute('aria-current', 'page');
      else link.removeAttribute('aria-current');
    });
  }

  function stripConfig(active){
    const key = active === 'community' ? 'social' : active;
    return PAGE_STRIPS[key] || null;
  }

  function removeLegacyPageStrips(active){
    const candidates = [];
    document.querySelectorAll('.shell > .status-strip').forEach(el => candidates.push(el));
    if(active === 'support') document.querySelectorAll('.shell > main > .page-header').forEach(el => candidates.push(el));
    if(active === 'social') document.querySelectorAll('.shell > main > .hero-card').forEach(el => candidates.push(el));
    if(active === 'how-to-use') document.querySelectorAll('.guide-page > .guide-hero').forEach(el => candidates.push(el));
    candidates.forEach(el => {
      if(!el || el.getAttribute('data-shell-template') === 'page-strip') return;
      if(el.getAttribute('data-keep-page-strip') === 'true') return;
      el.remove();
    });
  }

  function pageStripMarkup(active){
    const cfg = stripConfig(active);
    if(!cfg) return '';
    const action = cfg.action ? '<div class="hearty-page-strip-right">' + cfg.action + '</div>' : '';
    return '<section class="hearty-page-strip" data-shell-template="page-strip" data-active-page="' + active + '" aria-label="Page summary">' +
      '<div class="hearty-page-strip-main"><div class="hearty-page-strip-eyebrow">' + cfg.eyebrow + '</div>' +
      '<h1 class="hearty-page-strip-title">' + cfg.title + '</h1>' +
      '<p class="hearty-page-strip-copy">' + cfg.subtitle + '</p></div>' + action + '</section>';
  }

  function renderPageStrip(host, active){
    const cfg = stripConfig(active);
    if(!cfg) return;
    removeLegacyPageStrips(active);
    let existing = document.querySelector('[data-shell-template="page-strip"]');
    if(existing){
      existing.outerHTML = pageStripMarkup(active);
      return;
    }
    const topMount = document.querySelector('[data-shell-mount="topbar"]');
    if(topMount){
      topMount.insertAdjacentHTML('afterend', pageStripMarkup(active));
      return;
    }
    const topbar = document.querySelector('[data-shell-template="topbar"]');
    if(topbar){
      topbar.insertAdjacentHTML('afterend', pageStripMarkup(active));
      return;
    }
    host.insertAdjacentHTML('afterbegin', pageStripMarkup(active));
  }

  function renderTopbar(host, active){
    removeLegacyTopbars(host);
    const mount = document.querySelector('[data-shell-mount="topbar"]');
    const existing = mount ? mount.querySelector('[data-shell-template="topbar"]') : document.querySelector('[data-shell-template="topbar"]');
    if(existing){
      existing.setAttribute('data-active-page', active);
      const settings = existing.querySelector('.hearty-shell-settings-btn');
      if(settings){
        if(active === 'settings') settings.setAttribute('aria-current', 'page');
        else settings.removeAttribute('aria-current');
      }
      const logoLink = existing.querySelector('.hearty-shell-logo-link');
      if(logoLink) logoLink.innerHTML = logoMarkup();
      return;
    }
    const html = topbarMarkup(active).replace('data-shell-template="topbar"', 'data-shell-template="topbar" data-active-page="' + active + '"');
    if(mount){
      mount.innerHTML = html;
      return;
    }
    host.insertAdjacentHTML('afterbegin', html);
  }

  function renderNav(host, active){
    let mount = document.getElementById('bottomNav') || document.querySelector('[data-shell-mount="bottom-nav"]');
    if(!mount){
      mount = document.createElement('div');
      mount.id = 'bottomNav';
    }
    mount.id = 'bottomNav';
    mount.setAttribute('data-shell-mount','bottom-nav');
    mount.setAttribute('data-shell-template','bottom-nav');
    if(mount.parentNode !== document.body) document.body.appendChild(mount);

    // Remove every old/stray nav that is not inside the canonical mount.
    Array.from(document.querySelectorAll('nav.bottom-nav, .bottom-nav, nav.hearty-shell-bottom-nav, .hearty-shell-bottom-nav, [data-emergency-nav], #heartyEmergencyNav, .hearty-emergency-nav')).forEach(el => {
      if(mount.contains(el)) return;
      el.remove();
    });

    const current = mount.querySelector('nav[data-shell-template="bottom-nav"]');
    const needsRebuild = !current || current.querySelectorAll('[data-nav-target]').length !== NAV.length || current.getAttribute('data-active-page') !== active;
    if(needsRebuild){
      const html = navMarkup(active).replace('data-shell-template="bottom-nav"', 'data-shell-template="bottom-nav" data-active-page="' + active + '"');
      mount.innerHTML = html;
      return;
    }
    updateNavActive(current, active);
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
    lockup.innerHTML = logoMarkup();
  }

  function normaliseSupportState(){
    let isOn = false;
    try{
      const raw = localStorage.getItem('hearty_support_mode_v1') || localStorage.getItem('heartySupportState') || localStorage.getItem('heartySupportMode') || localStorage.getItem('supportMode') || '';
      const v = String(raw).toLowerCase().trim();
      if(['on','true','1','active'].includes(v)) isOn = true;
      if(!isOn && raw && raw[0] === '{'){
        const obj = JSON.parse(raw);
        isOn = obj && (obj.active === true || obj.supportModeOn === true || obj.on === true);
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
        renderPageStrip(host, active);
        renderNav(host, active);
      }
      normaliseSupportState();
    }finally{
      rendering = false;
    }
  }

  document.addEventListener('DOMContentLoaded', () => { render(); setTimeout(render, 120); setTimeout(render, 700); });
  window.addEventListener('load', () => { render(); setTimeout(render, 250); });
  window.addEventListener('storage', () => setTimeout(render, 0));
  window.addEventListener('hearty:theme-change', () => setTimeout(render, 0));
  window.HeartyShellTemplate = { render, NAV };
})();


/* HEARTY V24 shell safety: canonicalise nav after shell render */
(function(){
  function run(){try{if(window.HeartyProductionGuardV32&&window.HeartyProductionGuardV32.normaliseNav){window.HeartyProductionGuardV32.normaliseNav();}}catch(e){}}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  window.addEventListener('load',function(){setTimeout(run,50);setTimeout(run,500);});
})();

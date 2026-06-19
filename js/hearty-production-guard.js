(function(){
  'use strict';
  var VERSION='hearty-production-guard-v31-nav-centre';
  var NAV_PAGES=[
    ['home','Home','/home.html','<path d="M3 11.5 12 4l9 7.5"></path><path d="M5.5 10.5V20h13v-9.5"></path><path d="M9.5 20v-6h5v6"></path>'],
    ['meals','Meals','/meals.html','<path d="M4 3v8"></path><path d="M8 3v8"></path><path d="M6 3v18"></path><path d="M15 3v18"></path><path d="M15 3c3 2 4.5 5 4.5 8H15"></path>'],
    ['exercise','Exercise','/exercise.html','<path d="M6 7v10"></path><path d="M18 7v10"></path><path d="M3 10v4"></path><path d="M21 10v4"></path><path d="M6 12h12"></path>'],
    ['progress','Progress','/progress.html','<path d="M4 19V5"></path><path d="M4 19h16"></path><path d="M7 15l3-3 3 2 5-7"></path>'],
    ['support','Support','/support.html','<path d="M12 21s-7-4.4-9-9a5 5 0 0 1 8-5 5 5 0 0 1 8 5c-2 4.6-9 9-9 9z"></path>'],
    ['social','Social','/social.html','<path d="M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2"></path><circle cx="10" cy="7" r="4"></circle><path d="M21 21v-2a4 4 0 0 0-3-3.87"></path><path d="M16 3.13a4 4 0 0 1 0 7.75"></path>'],
    ['settings','Settings','/settings.html','<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.92 3a1.65 1.65 0 0 0 1-1.51V1a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06A1.65 1.65 0 0 0 19.4 8c.14.31.4.55.72.67.17.07.35.1.53.1H21a2 2 0 1 1 0 4h-.09A1.65 1.65 0 0 0 19.4 15z"></path>']
  ];
  function page(){
    var p=(document.body&&document.body.getAttribute('data-page'))||(location.pathname.split('/').pop()||'home.html').replace(/\.html$/,'');
    if(!p || p==='/' || p==='index') p='home';
    if(p==='community') p='social';
    return p;
  }
  function navHTML(active){
    return '<nav class="bottom-nav hearty-shell-bottom-nav" data-shell-template="bottom-nav" data-active-page="'+active+'" aria-label="Hearty navigation">'+NAV_PAGES.map(function(i){
      var on=i[0]===active;
      return '<a class="nav-item hearty-shell-nav-item'+(on?' active':'')+'" href="'+i[2]+'" data-nav-target="'+i[0]+'"'+(on?' aria-current="page"':'')+'><svg viewBox="0 0 24 24" aria-hidden="true">'+i[3]+'</svg><span>'+i[1]+'</span></a>';
    }).join('')+'</nav>';
  }

  function applyCanonicalNavStyles(m){
    if(!m) return;
    var active=page();
    var isApp=/^(home|meals|exercise|progress|support|social|settings)$/.test(active);
    if(!isApp) return;
    var nav=m.querySelector('nav[data-shell-template="bottom-nav"], nav.bottom-nav, nav.hearty-shell-bottom-nav');
    // inline layout only: CSS still controls theme colours. This prevents older page styles from moving the nav off centre.
    Object.assign(m.style,{
      position:'fixed', left:'50%', right:'auto', bottom:'calc(10px + env(safe-area-inset-bottom,0px))',
      transform:'translateX(-50%)', width:'min(500px, calc(100vw - 28px))', maxWidth:'calc(100vw - 28px)',
      height:'auto', margin:'0', padding:'0', background:'transparent', border:'0', boxShadow:'none',
      zIndex:'2147483000', pointerEvents:'none', overflow:'visible', display:'block', visibility:'visible', opacity:'1'
    });
    if(nav){
      Object.assign(nav.style,{
        position:'relative', left:'auto', right:'auto', top:'auto', bottom:'auto', transform:'none',
        width:'100%', maxWidth:'100%', margin:'0 auto', display:'grid', gridTemplateColumns:'repeat(7,minmax(0,1fr))',
        gap:'3px', pointerEvents:'auto', overflow:'hidden'
      });
    }
  }

  function normaliseNav(){
    var active=page();
    if(!/^(home|meals|exercise|progress|support|social|settings)$/.test(active)){
      if(active==='login') document.querySelectorAll('#bottomNav,[data-shell-mount="bottom-nav"],#heartyEmergencyNav,.hearty-emergency-nav,[data-emergency-nav],.bottom-nav,.hearty-shell-bottom-nav').forEach(function(el){el.remove();});
      return;
    }
    document.querySelectorAll('#heartyEmergencyNav,.hearty-emergency-nav,[data-emergency-nav]').forEach(function(el){el.remove();});
    var mounts=Array.from(document.querySelectorAll('#bottomNav,[data-shell-mount="bottom-nav"]'));
    var m=mounts.find(function(el){return el.id==='bottomNav';}) || mounts[0];
    if(!m){m=document.createElement('div');m.id='bottomNav';}
    mounts.forEach(function(el){ if(el!==m) el.remove(); });
    m.id='bottomNav';
    m.setAttribute('data-shell-mount','bottom-nav');
    m.setAttribute('data-shell-template','bottom-nav');
    m.removeAttribute('hidden');
    m.hidden=false;
    if(m.parentNode!==document.body) document.body.appendChild(m);

    // Remove old page-level navs. These were the cause of the glass footer/second positioning layer.
    Array.from(document.querySelectorAll('nav.bottom-nav,.bottom-nav,nav.hearty-shell-bottom-nav,.hearty-shell-bottom-nav')).forEach(function(el){
      if(m.contains(el)) return;
      el.remove();
    });

    var current=m.querySelector('nav[data-shell-template="bottom-nav"]');
    if(!current || current.getAttribute('data-active-page')!==active || current.querySelectorAll('[data-nav-target]').length!==7){
      m.innerHTML=navHTML(active);
    } else {
      current.querySelectorAll('[data-nav-target]').forEach(function(a){
        var on=a.getAttribute('data-nav-target')===active;
        a.classList.toggle('active',on);
        if(on) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
      });
    }
    applyCanonicalNavStyles(m);
    m.style.display='block';
    m.style.visibility='visible';
    m.style.opacity='1';
    document.body.setAttribute('data-hearty-nav-ready','true');
  }
  function syncSupportState(active,reason){
    var state=active?{active:true,reason:reason||'support',label:reason||'Support',updatedAt:new Date().toISOString()}:{active:false,reason:null,updatedAt:new Date().toISOString()};
    var asJson=JSON.stringify(state); var bool=active?'true':'false';
    ['heartySupportState','hearty_support_state','support_mode_state','meals_support_mode'].forEach(function(k){try{localStorage.setItem(k,asJson);}catch(_){}});
    ['hearty_support_mode_v1','heartySupportMode'].forEach(function(k){try{localStorage.setItem(k,bool);}catch(_){}});
    try{window.dispatchEvent(new CustomEvent('hearty:support-mode-change',{detail:state}));window.dispatchEvent(new CustomEvent('hearty:support-mode-changed',{detail:state}));}catch(_){}
    return state;
  }
  function supportClickGuard(){
    if(page()!=='support'||window.__heartySupportV29Bound)return; window.__heartySupportV29Bound=true;
    document.addEventListener('click',function(e){
      var btn=e.target&&e.target.closest?e.target.closest('.reason-btn,[data-reason],#supportOffBtn,.off-btn,[data-support-off]'):null;
      if(!btn) return;
      if(btn.matches('#supportOffBtn,.off-btn,[data-support-off]')){
        syncSupportState(false,null);
        document.querySelectorAll('.reason-btn,[data-reason]').forEach(function(b){b.classList.remove('active','hearty-v24-active','hearty-v23-active');});
        var st=document.getElementById('statusText'); if(st) st.textContent='Support Off';
        var hero=document.getElementById('supportHero'); if(hero) hero.classList.remove('is-support-on');
        var title=document.getElementById('supportTitle'); if(title) title.textContent='What do you need support with?';
        var copy=document.getElementById('supportCopy'); if(copy) copy.textContent='Pick one reason. Hearty will treat this as the active support reason until you switch it off or choose another reason.';
        btn.classList.add('active'); normaliseNav(); return;
      }
      var reason=btn.getAttribute('data-reason')||(btn.dataset&&btn.dataset.reason); if(!reason) return;
      syncSupportState(true,reason);
      document.querySelectorAll('.reason-btn,[data-reason]').forEach(function(b){b.classList.toggle('active',b===btn);b.classList.toggle('hearty-v24-active',b===btn);});
      var label=(btn.querySelector('strong')&&btn.querySelector('strong').textContent)||reason.replace(/_/g,' ');
      var st=document.getElementById('statusText'); if(st) st.textContent=label+' Support On';
      var hero=document.getElementById('supportHero'); if(hero) hero.classList.add('is-support-on');
      var title=document.getElementById('supportTitle'); if(title) title.textContent=label+' support is on';
      var copy=document.getElementById('supportCopy'); if(copy) copy.textContent='Hearty will adjust the app around this support need until you switch Support Mode off.';
      normaliseNav();
    },true);
  }
  function removeLoginInstall(){
    if(page()!=='login')return;
    document.querySelectorAll('#heartyInstallBanner,.hearty-install-banner,[data-hearty-install],[data-install-banner],#bottomNav,[data-shell-mount="bottom-nav"]').forEach(function(el){el.remove();});
    document.body.style.paddingBottom='0';
  }
  function run(){removeLoginInstall();normaliseNav();supportClickGuard();}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  window.addEventListener('load',function(){run();[100,300,750,1500,3000].forEach(function(ms){setTimeout(run,ms);});});
  var ticks=0; var timer=setInterval(function(){ticks++; run(); if(ticks>=10) clearInterval(timer);},500);
  window.HeartyProductionGuardV31={normaliseNav:normaliseNav,syncSupportState:syncSupportState,version:VERSION}; window.HeartyProductionGuardV30=window.HeartyProductionGuardV31; window.HeartyProductionGuardV29=window.HeartyProductionGuardV31;
})();

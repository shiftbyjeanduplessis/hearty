
(function(){
  'use strict';
  var VERSION='hearty-production-guard-v33-nav-support-install-stability';
  var NAV_PAGES=[["home", "Home", "/home.html", "<path d=\"M3 11.5 12 4l9 7.5\"></path><path d=\"M5.5 10.5V20h13v-9.5\"></path><path d=\"M9.5 20v-6h5v6\"></path>"], ["meals", "Meals", "/meals.html", "<path d=\"M4 3v8\"></path><path d=\"M8 3v8\"></path><path d=\"M6 3v18\"></path><path d=\"M15 3v18\"></path><path d=\"M15 3c3 2 4.5 5 4.5 8H15\"></path>"], ["exercise", "Exercise", "/exercise.html", "<path d=\"M6 7v10\"></path><path d=\"M18 7v10\"></path><path d=\"M3 10v4\"></path><path d=\"M21 10v4\"></path><path d=\"M6 12h12\"></path>"], ["progress", "Progress", "/progress.html", "<path d=\"M4 19V5\"></path><path d=\"M4 19h16\"></path><path d=\"M7 15l3-3 3 2 5-7\"></path>"], ["support", "Support", "/support.html", "<path d=\"M12 21s-7-4.4-9-9a5 5 0 0 1 8-5 5 5 0 0 1 8 5c-2 4.6-9 9-9 9z\"></path>"], ["social", "Social", "/social.html", "<path d=\"M17 21v-2a4 4 0 0 0-4-4H7a4 4 0 0 0-4 4v2\"></path><circle cx=\"10\" cy=\"7\" r=\"4\"></circle><path d=\"M21 21v-2a4 4 0 0 0-3-3.87\"></path><path d=\"M16 3.13a4 4 0 0 1 0 7.75\"></path>"], ["settings", "Settings", "/settings.html", "<circle cx=\"12\" cy=\"12\" r=\"3\"></circle><path d=\"M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 1 1-4 0v-.09a1.65 1.65 0 0 0-1-1.51 1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06A1.65 1.65 0 0 0 4.6 15a1.65 1.65 0 0 0-1.51-1H3a2 2 0 1 1 0-4h.09A1.65 1.65 0 0 0 4.6 8a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06A1.65 1.65 0 0 0 8.92 3a1.65 1.65 0 0 0 1-1.51V1a2 2 0 1 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06A2 2 0 1 1 22.02 4l-.06.06A1.65 1.65 0 0 0 21.4 8c.14.31.4.55.72.67.17.07.35.1.53.1H23a2 2 0 1 1 0 4h-.09A1.65 1.65 0 0 0 21.4 15z\"></path>"]];
  function page(){
    var p=(document.body&&document.body.getAttribute('data-page'))||((location.pathname.split('/').pop()||'home.html').replace(/\.html$/,''));
    p=String(p||'home').toLowerCase();
    if(!p || p==='/' || p==='index') p='home';
    if(p==='community') p='social';
    return p;
  }
  function appPage(p){return /^(home|meals|exercise|progress|support|social|settings)$/.test(p||page());}
  function navHTML(active){
    return '<nav class="hearty-bottom-nav-v33" data-shell-template="bottom-nav" data-active-page="'+active+'" aria-label="Hearty navigation">'+NAV_PAGES.map(function(i){
      var on=i[0]===active;
      return '<a class="hearty-nav-item-v33'+(on?' active':'')+'" href="'+i[2]+'" data-nav-target="'+i[0]+'"'+(on?' aria-current="page"':'')+'><svg viewBox="0 0 24 24" aria-hidden="true">'+i[3]+'</svg><span>'+i[1]+'</span></a>';
    }).join('')+'</nav>';
  }
  function clearOtherNavs(m){
    var selector='nav.bottom-nav,.bottom-nav,nav.hearty-shell-bottom-nav,.hearty-shell-bottom-nav,#heartyEmergencyNav,.hearty-emergency-nav,[data-emergency-nav],.hearty-bottom-nav-v32,.hearty-bottom-nav-v33';
    Array.prototype.slice.call(document.querySelectorAll(selector)).forEach(function(el){
      if(m && m.contains(el)) return;
      el.remove();
    });
  }
  function normaliseNav(){
    var active=page();
    if(!appPage(active)){
      if(active==='login') Array.prototype.slice.call(document.querySelectorAll('#bottomNav,[data-shell-mount="bottom-nav"],nav.bottom-nav,.bottom-nav,nav.hearty-shell-bottom-nav,.hearty-shell-bottom-nav,.hearty-bottom-nav-v32,.hearty-bottom-nav-v33,#heartyEmergencyNav,.hearty-emergency-nav,[data-emergency-nav]')).forEach(function(el){el.remove();});
      return;
    }
    var mounts=Array.prototype.slice.call(document.querySelectorAll('#bottomNav,[data-shell-mount="bottom-nav"]'));
    var m=mounts.filter(function(el){return el.id==='bottomNav';})[0] || mounts[0];
    if(!m){m=document.createElement('div');m.id='bottomNav';}
    mounts.forEach(function(el){ if(el!==m) el.remove(); });
    m.id='bottomNav';
    m.className='hearty-canonical-nav-mount-v33';
    m.setAttribute('data-shell-mount','bottom-nav');
    m.setAttribute('data-shell-template','bottom-nav');
    m.removeAttribute('hidden');
    m.hidden=false;
    if(m.parentNode!==document.body) document.body.appendChild(m);
    clearOtherNavs(m);
    var current=m.querySelector('.hearty-bottom-nav-v33[data-shell-template="bottom-nav"]');
    if(!current || current.getAttribute('data-active-page')!==active || current.querySelectorAll('[data-nav-target]').length!==7){
      m.innerHTML=navHTML(active);
    }else{
      current.setAttribute('data-active-page',active);
      current.querySelectorAll('[data-nav-target]').forEach(function(a){
        var on=a.getAttribute('data-nav-target')===active;
        a.classList.toggle('active',on);
        if(on) a.setAttribute('aria-current','page'); else a.removeAttribute('aria-current');
      });
    }
    document.body.setAttribute('data-hearty-nav-ready','true');
  }
  function nowIso(){try{return new Date().toISOString();}catch(_){return String(Date.now());}}
  function payload(active,reason){
    var ts=Date.now();
    return {active:!!active,isActive:!!active,supportMode:!!active,reason:active?(reason||'support'):null,type:active?(reason||'support'):'',mode:active?'on':'off',status:active?'on':'off',sourcePage:page(),updatedAt:ts,updated_at:nowIso(),v:VERSION};
  }
  function writeJSON(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(_){}}
  function syncSupportState(active,reason){
    var state=payload(active,reason);
    ['heartySupportState','hearty_support_mode_v1','heartySupportMode','hearty_support_state','support_mode_state'].forEach(function(k){writeJSON(k,state);});
    try{localStorage.setItem('heartySupportActive',active?'true':'false');}catch(_){}
    try{localStorage.setItem('supportMode',active?'on':'off');}catch(_){}
    try{localStorage.setItem('hearty_support_mode',active?(reason||'support'):'off');}catch(_){}
    if(active){try{localStorage.setItem('meals_support_mode',reason||'support');}catch(_){}}
    else {try{localStorage.removeItem('meals_support_mode');}catch(_){}}
    try{window.dispatchEvent(new CustomEvent('hearty:support-change',{detail:state}));}catch(_){}
    try{window.dispatchEvent(new CustomEvent('hearty:support-mode-change',{detail:state}));}catch(_){}
    try{window.dispatchEvent(new CustomEvent('hearty:support-mode-changed',{detail:state}));}catch(_){}
    try{window.dispatchEvent(new CustomEvent('hearty:support-changed',{detail:state}));}catch(_){}
    return state;
  }
  function normaliseSupportObj(obj){
    if(!obj || typeof obj!=='object') return null;
    var active=obj.active===true||obj.isActive===true||obj.supportMode===true||obj.mode==='on'||obj.status==='on';
    var reason=obj.reason||obj.type||obj.supportReason||null;
    var ts=Date.parse(obj.updated_at||obj.updatedAt||obj.at||0)||0;
    return {active:!!active,reason:active?reason:null,updatedAt:ts};
  }
  function readSupportState(){
    var best=null;
    ['heartySupportState','hearty_support_mode_v1','heartySupportMode','hearty_support_state','support_mode_state'].forEach(function(k){
      try{var raw=localStorage.getItem(k); if(!raw) return; var obj=JSON.parse(raw); var n=normaliseSupportObj(obj); if(!n) return; if(!best||n.updatedAt>=best.updatedAt) best=n;}catch(_){}
    });
    if(best) return best;
    try{var m=localStorage.getItem('meals_support_mode'); if(m && m!=='off' && m.charAt(0)!=='{') return {active:true,reason:m,updatedAt:0};}catch(_){}
    try{var simple=localStorage.getItem('supportMode'); if(simple==='on') return {active:true,reason:'support',updatedAt:0};}catch(_){}
    return {active:false,reason:null,updatedAt:0};
  }
  function labelFor(reason, fallback){
    var map={nausea:'Nausea',bloating:'Bloating',fatigue:'Fatigue',exhaustion:'Fatigue',low_appetite:'Low appetite',constipation:'Constipation',support:'Support'};
    return map[reason]||fallback||String(reason||'Support').replace(/_/g,' ').replace(/\b\w/g,function(c){return c.toUpperCase();});
  }
  function paintSupportUI(state){
    if(page()!=='support') return;
    var active=!!(state&&state.active&&state.reason);
    var reason=active?state.reason:null;
    var label=active?labelFor(reason):'Support';
    document.querySelectorAll('.reason-btn,[data-reason]').forEach(function(b){
      var on=active && b.getAttribute('data-reason')===reason;
      b.classList.toggle('active',on);
      b.classList.toggle('hearty-v24-active',on);
      b.classList.toggle('hearty-v23-active',on);
      b.setAttribute('aria-pressed',on?'true':'false');
    });
    var st=document.getElementById('statusText'); if(st) st.textContent=active?label+' Support On':'Support Off';
    var pill=document.getElementById('statusPill'); if(pill){pill.classList.toggle('on',active); pill.classList.toggle('active',active);}
    var hero=document.getElementById('supportHero'); if(hero) hero.classList.toggle('is-support-on',active);
    var title=document.getElementById('supportTitle'); if(title) title.textContent=active?label+' support is on':'What do you need support with?';
    var copy=document.getElementById('supportCopy'); if(copy) copy.textContent=active?'Hearty will adjust meals and movement around this support need until you switch Support Mode off.':'Pick one reason. Hearty will treat this as the active support reason until you switch it off or choose another reason.';
    var off=document.getElementById('supportOffBtn'); if(off){off.textContent=active?'Turn Support Off':'Support Off'; off.classList.toggle('active',!active);}
  }
  function supportClickGuard(){
    if(page()!=='support'||window.__heartySupportV33Bound)return; window.__heartySupportV33Bound=true;
    document.addEventListener('click',function(e){
      var btn=e.target&&e.target.closest?e.target.closest('.reason-btn,[data-reason],#supportOffBtn,.off-btn,[data-support-off]'):null;
      if(!btn) return;
      var isOff=btn.matches('#supportOffBtn,.off-btn,[data-support-off]');
      var reason=btn.getAttribute('data-reason')||(btn.dataset&&btn.dataset.reason);
      if(!isOff && !reason) return;
      e.preventDefault(); e.stopPropagation(); if(e.stopImmediatePropagation) e.stopImmediatePropagation();
      var state=isOff?syncSupportState(false,null):syncSupportState(true,reason);
      paintSupportUI(state);
      normaliseNav();
      return false;
    },true);
    paintSupportUI(readSupportState());
  }
  function run(){normaliseNav();supportClickGuard(); if(page()==='support') paintSupportUI(readSupportState());}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',run,{once:true});else run();
  window.addEventListener('load',function(){run();[100,300,800,1500,3000].forEach(function(ms){setTimeout(run,ms);});});
  var ticks=0; var timer=setInterval(function(){ticks++; run(); if(ticks>=8) clearInterval(timer);},500);
  window.HeartyProductionGuardV33={normaliseNav:normaliseNav,syncSupportState:syncSupportState,readSupportState:readSupportState,version:VERSION};
  window.HeartyProductionGuardV32=window.HeartyProductionGuardV33;
})();

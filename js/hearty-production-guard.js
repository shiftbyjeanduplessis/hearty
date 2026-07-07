(function(){
  'use strict';
  var VERSION='hearty-production-guard-v54-support-install-stability-no-nav-renderer';
  function page(){
    var p=(document.body&&document.body.getAttribute('data-page'))||(location.pathname.split('/').pop()||'home.html').replace(/\.html$/,'');
    p=String(p||'home').toLowerCase();
    if(!p || p==='/' || p==='index') p='home';
    if(p==='community' || p==='social') p='recipes';
    return p;
  }
  function normaliseNav(){
    if(page()==='login'){
      Array.prototype.slice.call(document.querySelectorAll('#bottomNav,[data-shell-mount="bottom-nav"]')).forEach(function(el){el.remove();});
      return;
    }
    try{ if(window.HeartyShellTemplate && typeof window.HeartyShellTemplate.render==='function') window.HeartyShellTemplate.render(); }catch(_){}
  }
  function nowIso(){try{return new Date().toISOString();}catch(_){return String(Date.now());}}
  function payload(active,reason){
    var ts=Date.now();
    return {active:!!active,isActive:!!active,supportMode:!!active,reason:active?(reason||'support'):null,type:active?(reason||'support'):'',mode:active?'on':'off',status:active?'on':'off',sourcePage:page(),updatedAt:ts,updated_at:nowIso(),v:VERSION};
  }
  function writeJSON(k,v){try{localStorage.setItem(k,JSON.stringify(v));}catch(_){} }
  function syncSupportState(active,reason){
    var state=payload(active,reason);
    ['heartySupportState','hearty_support_mode_v1','heartySupportMode','hearty_support_state','support_mode_state'].forEach(function(k){writeJSON(k,state);});
    try{localStorage.setItem('heartySupportActive',active?'true':'false');}catch(_){}
    try{localStorage.setItem('supportMode',active?'on':'off');}catch(_){}
    try{localStorage.setItem('hearty_support_mode',active?(reason||'support'):'off');}catch(_){}
    if(active){try{localStorage.setItem('meals_support_mode',reason||'support');}catch(_){} }
    else {try{localStorage.removeItem('meals_support_mode');}catch(_){} }
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
    if(page()!=='support'||window.__heartySupportV54Bound)return; window.__heartySupportV54Bound=true;
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
  window.addEventListener('load',function(){run();[100,300,800,1500].forEach(function(ms){setTimeout(run,ms);});});
  window.HeartyProductionGuardV33={normaliseNav:normaliseNav,syncSupportState:syncSupportState,readSupportState:readSupportState,version:VERSION};
  window.HeartyProductionGuardV32=window.HeartyProductionGuardV33;
})();

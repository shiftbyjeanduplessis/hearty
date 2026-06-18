(function(){
  "use strict";
  var VERSION = "hearty-production-guard-v12b-remove-temp-nav";
  try { window.__HEARTY_GUARD_VERSION__ = VERSION; } catch(_) {}

  function $(id){ return document.getElementById(id); }
  function q(sel){ return document.querySelector(sel); }
  function qa(sel){ return Array.prototype.slice.call(document.querySelectorAll(sel)); }
  function safeSetJSON(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); } catch(_) {} }
  function safeSet(key, value){ try { localStorage.setItem(key, value); } catch(_) {} }
  function nowIso(){ try { return new Date().toISOString(); } catch(_) { return String(Date.now()); } }

  function ensureShellAnchors(){
    var mount = q('[data-shell-mount="bottom-nav"]');
    if (mount && !mount.id) mount.id = 'bottomNav'; if (mount) { try { mount.setAttribute('data-shell-template','bottom-nav'); } catch(_){} }
    if (!mount && !$('bottomNav')) {
      var div = document.createElement('div');
      div.id = 'bottomNav';
      div.setAttribute('data-shell-mount','bottom-nav');
      document.body.appendChild(div);
    }
    if (location.pathname.indexOf('home.html') !== -1 || location.pathname.endsWith('/home') || location.pathname === '/') {
      if (!$('homeDayPill')) { var a=document.createElement('div'); a.id='homeDayPill'; a.hidden=true; document.body.appendChild(a); }
      if (!$('dailyStatusLine')) { var b=document.createElement('div'); b.id='dailyStatusLine'; b.hidden=true; document.body.appendChild(b); }
    }
  }

  function setSupportOff(source){
    var payload = { active:false, isActive:false, reason:null, type:'', sourcePage:source||'guard', updatedAt:Date.now(), updated_at:nowIso() };
    safeSetJSON('hearty_support_mode_v1', payload);
    safeSetJSON('heartySupportState', payload);
    safeSetJSON('hearty_support_state', payload);
    safeSetJSON('heartySupportMode', payload);
    safeSet('supportMode','off');
    safeSet('hearty_support_mode','off');
    safeSet('heartySupportActive','false');
    try { localStorage.removeItem('meals_support_mode'); } catch(_) {}
    try { window.dispatchEvent(new CustomEvent('hearty:support-mode-changed',{ detail:{ active:false, source:source||'guard' }})); } catch(_) {}
  }
  window.heartySetSupportOff = window.heartySetSupportOff || setSupportOff;

  function bindSupportOffDelegated(){
    document.addEventListener('click', function(ev){
      var btn = ev.target && ev.target.closest && ev.target.closest('#supportOff, #supportOffBtn, #exerciseSupportOff, [data-support-off], [data-support-clear], .support-chip-off');
      if (!btn) return;
      setSupportOff('delegated');
    }, true);
  }

  function exerciseFallbackStart(){
    var overlay = $('workoutOverlay');
    if (!overlay) return;
    overlay.hidden = false;
    overlay.removeAttribute('hidden');
    var screens = ['screenActive','screenReps','screenRest','screenExComplete','screenWoComplete'];
    screens.forEach(function(id){ var el=$(id); if(el) el.style.display = id === 'screenActive' ? '' : 'none'; });
    var progress=$('woProgress'); if(progress && !progress.textContent.trim()) progress.textContent='Exercise 1 of 5';
    var name=$('exName'); if(name && !name.textContent.trim()) name.textContent='Assisted Sit-to-Stand';
  }
  function bindExerciseFailsafes(){
    var start = $('startBtn');
    if (start && !start.__heartyGuardStart) {
      start.__heartyGuardStart = true;
      start.addEventListener('click', function(){ setTimeout(function(){
        var overlay=$('workoutOverlay');
        if (overlay && overlay.hidden) exerciseFallbackStart();
      }, 80); }, false);
    }
    var map = {
      setActionBtn:function(){ var a=$('screenReps'); if(a){ ['screenActive','screenRest','screenExComplete','screenWoComplete'].forEach(function(id){var el=$(id);if(el)el.style.display='none'}); a.style.display=''; } },
      continueWorkoutBtn:function(){ var e=$('exitOverlay'); if(e) e.classList.remove('active'); },
      closeWorkoutBtn:function(){ var e=$('exitOverlay'); if(e) e.classList.add('active'); },
      exitWorkoutBtn:function(){ var o=$('workoutOverlay'); if(o) o.hidden=true; var e=$('exitOverlay'); if(e) e.classList.remove('active'); }
    };
    Object.keys(map).forEach(function(id){ var el=$(id); if(el && !el.__heartyGuard){ el.__heartyGuard=true; el.addEventListener('click',function(){ setTimeout(map[id],50); },false); } });
  }

  function bindHomeFailsafes(){
    // Keep Home usable even if a visual render function fails before all handlers bind.
    var water=$('waterGlass');
    if (water && !water.__heartyGuard){ water.__heartyGuard=true; water.addEventListener('click',function(){
      try{ var d=new Date().toISOString().slice(0,10); var raw=JSON.parse(localStorage.getItem('heartyWater')||'{}'); raw[d]=Math.min(20, Number(raw[d]||0)+1); localStorage.setItem('heartyWater',JSON.stringify(raw)); }catch(_){}
    },false); }
    var walk=$('toggleWalkBtn');
    if (walk && !walk.__heartyGuard){ walk.__heartyGuard=true; walk.addEventListener('click',function(){ try{ window.dispatchEvent(new Event('hearty:home-action')); }catch(_){} },false); }
  }

  function bindSettingsFailsafes(){
    qa('[data-theme-choice]').forEach(function(btn){
      if (btn.__heartyGuardTheme) return; btn.__heartyGuardTheme=true;
      btn.addEventListener('click',function(){ var theme=btn.getAttribute('data-theme-choice'); if(!theme)return; safeSet('heartyTheme',theme); safeSet('hearty-theme',theme); document.documentElement.setAttribute('data-theme',theme); try{window.dispatchEvent(new CustomEvent('hearty:theme-change',{detail:{theme:theme}}));}catch(_){} },false);
    });
  }


  function navFallbackHtml(active){
    var items = [
      ['home','Home','home.html'], ['meals','Meals','meals.html'], ['exercise','Exercise','exercise.html'], ['progress','Progress','progress.html'], ['support','Support','support.html'], ['social','Social','social.html'], ['settings','Settings','settings.html']
    ];
    return '<nav class="bottom-nav hearty-shell-bottom-nav" data-shell-template="bottom-nav" data-active-page="'+active+'" aria-label="Hearty navigation">' + items.map(function(i){ var on=i[0]===active; return '<a class="nav-item hearty-shell-nav-item'+(on?' active':'')+'" href="./'+i[2]+'" data-nav-target="'+i[0]+'"'+(on?' aria-current="page"':'')+'><span>'+i[1]+'</span></a>'; }).join('') + '</nav>';
  }

  function ensureStaticBottomNav(){
    var active = (document.body && document.body.getAttribute('data-page')) || (location.pathname.split('/').pop()||'home.html').replace(/\.html$/,'') || 'home';
    if (active === 'community') active = 'social';
    if (!/^(home|meals|exercise|progress|support|social|settings)$/.test(active)) return;
    var mount = $('bottomNav') || q('[data-shell-mount="bottom-nav"]');
    if (!mount) { mount = document.createElement('div'); mount.id = 'bottomNav'; mount.setAttribute('data-shell-mount','bottom-nav'); document.body.appendChild(mount); }
    if (!mount.id) mount.id = 'bottomNav'; try { mount.setAttribute('data-shell-template','bottom-nav'); } catch(_){}
    if (!mount.querySelector('.bottom-nav,[data-shell-template="bottom-nav"]')) mount.innerHTML = navFallbackHtml(active);
    mount.style.display = 'block';
  }


  function removeEmergencyOverlay(){
    try {
      var emergency = document.getElementById('heartyEmergencyNav');
      if (emergency && emergency.parentNode) emergency.parentNode.removeChild(emergency);
      var quick = document.getElementById('heartyQuickAccessCard');
      if (quick && quick.parentNode) quick.parentNode.removeChild(quick);
    } catch(_) {}
  }

  function run(){
    removeEmergencyOverlay();
    ensureShellAnchors();
    ensureStaticBottomNav();
    bindExerciseFailsafes();
    bindHomeFailsafes();
    bindSettingsFailsafes();
  }

  window.addEventListener('error', function(e){ try { console.warn('[Hearty guard caught]', e.message || e.error || e); } catch(_){} });
  bindSupportOffDelegated();
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', run, { once:true }); else run();
  window.addEventListener('load', function(){ run(); setTimeout(run,250); setTimeout(run,1000); setTimeout(removeEmergencyOverlay,1500); });
})();

(function(){
  'use strict';

  var KEY = 'hearty_support_mode_v1';
  var VERSION = 'hearty-support-v65';
  var LEGACY_KEYS = ['heartySupportState','heartySupportMode','hearty_support_state','support_mode_state'];
  var REASONS = {
    nausea: {
      label: 'Nausea',
      button: 'Nausea',
      title: 'Nausea support is on',
      summary: 'Keep today smaller, calmer and easier. Meals and movement should feel gentle.',
      home: 'Hearty will treat today as a softer day. Meals and Exercise will reduce pressure.',
      meals: 'Keep meals simple today. Prioritise small protein portions, plain/easy foods and steady hydration.',
      exercise: 'Use a lighter day. A gentle walk or shorter session is enough if that is what your body can manage.',
      support: 'Smaller meals, gentler movement and lower pressure are the priority today.',
      tips: [
        ['Meals','Choose small, simple protein-first meals rather than forcing a big plate.'],
        ['Hydration','Use small steady sips instead of trying to drink a lot at once.'],
        ['Movement','Keep movement gentle. A short walk can count.']
      ]
    },
    bloating: {
      label: 'Bloated',
      button: 'Bloated',
      title: 'Bloating support is on',
      summary: 'Simpler meals and gentler movement are the goal while your body settles.',
      home: 'Hearty will keep today simpler and lower pressure across Meals and Exercise.',
      meals: 'Keep meals uncomplicated. Avoid stacking too many heavy ingredients in one sitting.',
      exercise: 'Gentle walking or a lighter strength session is the better fit today.',
      support: 'Simple meals, slower pace and easy movement are the focus today.',
      tips: [
        ['Meals','Keep the plate simple: protein plus one easy side is enough.'],
        ['Pace','Smaller portions can be more comfortable than one large meal.'],
        ['Movement','Gentle walking can be a better choice than hard training.']
      ]
    },
    constipation: {
      label: 'Constipated',
      button: 'Constipated',
      title: 'Constipation support is on',
      summary: 'Hydration, fibre-aware nudges and gentle movement get extra attention today.',
      home: 'Hearty will nudge the day toward hydration, gentle movement and steady routine.',
      meals: 'Keep protein steady, include fibre-aware choices where comfortable, and do not skip hydration.',
      exercise: 'Gentle movement is useful today. Keep it easy and consistent.',
      support: 'The app will nudge hydration, gentle movement and a steady routine today.',
      tips: [
        ['Hydration','Prioritise steady fluids across the day.'],
        ['Meals','Keep meals balanced and fibre-aware without forcing volume.'],
        ['Movement','Use a comfortable walk or mobility session.']
      ]
    },
    low_appetite: {
      label: 'Low appetite',
      button: 'Low appetite',
      title: 'Low appetite support is on',
      summary: 'Small protein-first meals and snack-style options make more sense today.',
      home: 'Hearty will lower food pressure and keep the focus on small protein anchors.',
      meals: 'Aim for smaller protein-first meals. Snack-style protein can count when a full meal is too much.',
      exercise: 'Keep training short or gentle if you have not eaten much. Consistency matters more than intensity.',
      support: 'Small protein anchors and lower pressure are the focus today.',
      tips: [
        ['Meals','A small protein anchor is better than skipping everything.'],
        ['Rhythm','Use smaller eating moments if full meals feel too much.'],
        ['Exercise','Choose the lighter option if fuel is low.']
      ]
    },
    fatigue: {
      label: 'Tired',
      button: 'Tired',
      title: 'Low-energy support is on',
      summary: 'The app will lower effort and keep the day manageable.',
      home: 'Hearty will treat today as a low-pressure day and keep the routine realistic.',
      meals: 'Keep meals simple and easy to prepare. Do not make today harder than it needs to be.',
      exercise: 'Use a lighter session, mobility, or a short walk. No need to force a full-intensity workout.',
      support: 'Lower effort, simple meals and gentle movement are the focus today.',
      tips: [
        ['Exercise','A lighter session still keeps the habit alive.'],
        ['Meals','Use easy meals that do not need much prep.'],
        ['Routine','Aim for the minimum useful day, not a perfect day.']
      ]
    }
  };

  function nowISO(){ try { return new Date().toISOString(); } catch(e){ return String(Date.now()); } }
  function safeJSON(raw){ try { return raw ? JSON.parse(raw) : null; } catch(e){ return null; } }
  function setLS(key,val){ try { localStorage.setItem(key, val); } catch(e){} }
  function removeLS(key){ try { localStorage.removeItem(key); } catch(e){} }
  function normaliseReason(value){
    var v = String(value || '').trim().toLowerCase().replace(/[-\s]+/g,'_');
    if(!v || ['off','false','0','none','null','undefined','standard','okay','ok','im_okay','i_m_okay','support_off'].indexOf(v) !== -1) return '';
    var map = {
      bloated:'bloating', bloat:'bloating', bloating:'bloating',
      constipated:'constipation', constipation:'constipation',
      low_energy:'fatigue', tired:'fatigue', fatigue:'fatigue', exhausted:'fatigue', exhaustion:'fatigue',
      low_appetite:'low_appetite', appetite:'low_appetite', no_appetite:'low_appetite',
      nausea:'nausea', nauseous:'nausea'
    };
    return REASONS[map[v] || v] ? (map[v] || v) : '';
  }
  function buildState(reason, source){
    reason = normaliseReason(reason);
    var active = !!reason;
    var info = reason ? REASONS[reason] : null;
    return {
      active: active,
      isActive: active,
      supportMode: active,
      reason: reason || null,
      symptom: reason || null,
      type: reason || '',
      label: info ? info.label : 'Support off',
      mode: active ? 'on' : 'off',
      status: active ? 'on' : 'off',
      sourcePage: source || (document.body && document.body.getAttribute('data-page')) || 'app',
      updatedAt: nowISO(),
      updated_at: nowISO(),
      version: VERSION
    };
  }
  function normaliseState(obj){
    if(!obj || typeof obj !== 'object') return buildState('', 'read');
    var active = obj.active === true || obj.isActive === true || obj.supportMode === true || obj.mode === 'on' || obj.status === 'on';
    var reason = active ? normaliseReason(obj.reason || obj.symptom || obj.primarySymptom || obj.type || obj.active_state || '') : '';
    return buildState(reason, obj.sourcePage || 'read');
  }
  function read(){
    var canonical = safeJSON(localStorage.getItem(KEY));
    if(canonical) return normaliseState(canonical);
    for(var i=0;i<LEGACY_KEYS.length;i++){
      var parsed = safeJSON(localStorage.getItem(LEGACY_KEYS[i]));
      if(parsed){
        var st = normaliseState(parsed);
        if(st.active) return st;
      }
    }
    var plain = normaliseReason(localStorage.getItem('meals_support_mode') || localStorage.getItem('hearty_support_mode') || localStorage.getItem('supportMode') || '');
    return buildState(plain, 'legacy');
  }
  function write(reason, source){
    var st = buildState(reason, source);
    var text = JSON.stringify(st);
    setLS(KEY, text);
    LEGACY_KEYS.forEach(function(k){ setLS(k, text); });
    setLS('heartySupportActive', st.active ? 'true' : 'false');
    setLS('hearty_support_mode', st.active ? st.reason : 'off');
    setLS('supportMode', st.active ? 'on' : 'off');
    if(st.active) setLS('meals_support_mode', st.reason); else removeLS('meals_support_mode');
    try {
      var history = safeJSON(localStorage.getItem('heartySupportHistory')) || [];
      history.unshift({ reason: st.reason, label: st.label, active: st.active, at: st.updatedAt, source: st.sourcePage });
      setLS('heartySupportHistory', JSON.stringify(history.slice(0, 50)));
    } catch(e){}
    emit(st);
    paint(st);
    return st;
  }
  function emit(st){
    ['hearty:support-change','hearty:support-mode-changed','hearty:support-mode-change','hearty:support-changed'].forEach(function(name){
      try { window.dispatchEvent(new CustomEvent(name, { detail: st })); } catch(e){}
    });
  }
  function contextCopy(context, st){
    if(!st.active || !st.reason) {
      if(context === 'meals') return 'Normal meals today.';
      if(context === 'exercise') return 'Normal exercise today.';
      if(context === 'support') return 'Pick one option to soften Meals and Exercise today.';
      return 'Normal day. Tap a chip if you need extra support.';
    }
    var info = REASONS[st.reason];
    return (info && (info[context] || info.summary)) || 'Support Mode is active today.';
  }
  function setText(selector, text, root){
    (root || document).querySelectorAll(selector).forEach(function(el){ el.textContent = text; });
  }
  function adviceHTML(st){
    if(!st.active || !st.reason) {
      return '<div class="hearty-support-advice-item"><b>Support is off</b><span>Meals and Exercise are using their normal guidance.</span></div>';
    }
    var info = REASONS[st.reason];
    return (info.tips || []).map(function(item){
      return '<div class="hearty-support-advice-item"><b>'+escapeHTML(item[0])+'</b><span>'+escapeHTML(item[1])+'</span></div>';
    }).join('');
  }
  function escapeHTML(v){ return String(v == null ? '' : v).replace(/[&<>"']/g,function(ch){return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch];}); }
  function paint(state){
    var st = state || read();
    var info = st.active && st.reason ? REASONS[st.reason] : null;
    document.documentElement.setAttribute('data-support-mode', st.active ? 'on' : 'off');
    if(document.body) document.body.setAttribute('data-support-mode', st.active ? 'on' : 'off');

    document.querySelectorAll('[data-hearty-support-panel]').forEach(function(panel){
      var context = panel.getAttribute('data-support-context') || (document.body && document.body.getAttribute('data-page')) || 'app';
      panel.classList.toggle('is-support-on', !!st.active);
      panel.setAttribute('data-support-active', st.active ? 'true' : 'false');
      setText('[data-support-status-label]', st.active ? info.label : 'Okay', panel);
      setText('[data-support-status-copy]', contextCopy(context, st), panel);
      setText('[data-support-reason-label]', st.active ? info.label : 'I’m okay', panel);
      var list = panel.querySelector('[data-support-advice-list]');
      if(list) list.innerHTML = adviceHTML(st);
    });

    document.querySelectorAll('[data-support-reason]').forEach(function(btn){
      var reason = normaliseReason(btn.getAttribute('data-support-reason'));
      var on = !!(st.active && reason && reason === st.reason);
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });
    document.querySelectorAll('[data-support-off]').forEach(function(btn){
      var on = !st.active;
      btn.classList.toggle('is-active', on);
      btn.setAttribute('aria-pressed', on ? 'true' : 'false');
    });

    setText('#supportPill', st.active ? info.label : 'Okay');
    document.querySelectorAll('#supportPill').forEach(function(el){ el.classList.toggle('is-on', !!st.active); el.classList.toggle('is-off', !st.active); });
    setText('#supportModeLabel', st.active ? info.label : 'Off');
    setText('#supportModeNote', st.active ? contextCopy('meals', st) : 'Standard meals');
    setText('#heroSupportMiniPill', st.active ? (info.label + ' support') : 'Support active');
    document.querySelectorAll('#heroSupportMiniPill').forEach(function(el){ el.hidden = !st.active; });
    document.querySelectorAll('#overlaySupportBadge').forEach(function(el){ el.textContent = st.active ? (info.label + ' support active — exercise softened') : 'Support mode activated — exercise reduced'; });
  }
  function bind(){
    document.addEventListener('click', function(ev){
      var off = ev.target && ev.target.closest ? ev.target.closest('[data-support-off]') : null;
      var reasonBtn = ev.target && ev.target.closest ? ev.target.closest('[data-support-reason]') : null;
      if(off){ ev.preventDefault(); write('', (document.body && document.body.getAttribute('data-page')) || 'app'); return; }
      if(reasonBtn){ ev.preventDefault(); write(reasonBtn.getAttribute('data-support-reason'), (document.body && document.body.getAttribute('data-page')) || 'app'); return; }
    }, false);
    paint(read());
  }
  function onReady(fn){ if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', fn, { once:true }); else fn(); }
  onReady(bind);
  window.addEventListener('storage', function(ev){ if(!ev.key || /support/i.test(ev.key) || ev.key === KEY) paint(read()); });
  window.addEventListener('hearty:support-refresh', function(){ paint(read()); });

  window.HeartySupport = {
    reasons: REASONS,
    read: read,
    write: write,
    set: function(reason, source){ return write(reason, source); },
    off: function(source){ return write('', source); },
    paint: paint,
    normaliseReason: normaliseReason,
    isActive: function(){ return !!read().active; },
    getReason: function(){ return read().reason || ''; },
    getMealMessage: function(){ return contextCopy('meals', read()); },
    getExerciseMessage: function(){ return contextCopy('exercise', read()); }
  };
})();

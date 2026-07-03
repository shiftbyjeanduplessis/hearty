(function(){
  'use strict';
  function readJSON(key, fallback){try{var raw=localStorage.getItem(key);return raw?JSON.parse(raw):fallback;}catch(e){return fallback;}}
  function writeJSON(key, value){try{localStorage.setItem(key, JSON.stringify(value));}catch(e){}}
  function isOn(value){
    if(value === true) return true;
    if(!value) return false;
    if(typeof value === 'object') return value.active === true || value.isActive === true || value.on === true || !!value.reason;
    var v=String(value).toLowerCase().trim();
    return !!v && !['off','false','none','no','0','inactive','standard'].includes(v);
  }
  function normalise(){
    var raw = null;
    ['heartySupportState','hearty_support_mode_v1','heartySupportMode','hearty_support_state','support_mode_state','supportMode'].some(function(k){var v=localStorage.getItem(k); if(v!==null){raw=v;return true;} return false;});
    var parsed = raw;
    if(raw && String(raw).trim().charAt(0)==='{') parsed = readJSONFromRaw(raw);
    var active = isOn(parsed);
    var state = (typeof parsed === 'object' && parsed) ? parsed : { active: active, reason: active ? String(raw || 'active') : '' };
    state.active = active;
    state.updatedAt = state.updatedAt || new Date().toISOString();
    ['heartySupportState','hearty_support_mode_v1','heartySupportMode','hearty_support_state','support_mode_state'].forEach(function(k){writeJSON(k,state);});
    document.documentElement.setAttribute('data-support-mode', active ? 'on' : 'off');
    document.body && document.body.setAttribute('data-support-mode', active ? 'on' : 'off');
    return state;
  }
  function readJSONFromRaw(raw){try{return JSON.parse(raw);}catch(e){return raw;}}
  window.HeartySupportState = { normalise: normalise, isOn: isOn };
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', normalise); else normalise();
  window.addEventListener('storage', function(e){ if(!e.key || /support/i.test(e.key)) normalise(); });
})();

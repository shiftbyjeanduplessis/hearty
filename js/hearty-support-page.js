(function(){
  'use strict';

  var KEYS = {
    sideEffects: 'hearty_side_effect_logs_v1',
    medicationSetup: 'heartyMedicationSetupV1',
    injectionSchedule: 'heartyInjectionSchedule',
    medication: 'heartyMedication',
    medicationLogs: 'hearty_medication_logs_v1'
  };
  var DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  var DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  var SYMPTOMS = {
    nausea: 'Nausea',
    bloating: 'Bloating',
    constipation: 'Constipation',
    low_appetite: 'Low appetite',
    fatigue: 'Tired / low energy',
    other: 'Other'
  };
  var RESOURCES = [
    { key:'nausea', title:'Nausea support', tips:['Use smaller, calmer meals today.','Keep protein portions modest and plain.','Sip fluids steadily instead of forcing large drinks.'] },
    { key:'low_appetite', title:'Low appetite support', tips:['Use small protein anchors rather than full plates.','Snack-style protein can count.','Do not wait for a perfect meal if a simple option is easier.'] },
    { key:'constipation', title:'Constipation support', tips:['Keep fluids steady across the day.','Use gentle movement if comfortable.','Add fibre-aware foods slowly rather than forcing volume.'] },
    { key:'bloating', title:'Bloating support', tips:['Keep meals simple with fewer ingredients at once.','Avoid very large portions.','A short gentle walk may feel better than hard training.'] },
    { key:'fatigue', title:'Low-energy support', tips:['Choose low-effort meals.','A light walk or mobility can count.','Aim for the minimum useful routine today.'] }
  ];

  var medSetup = null;
  var medLogs = [];

  function $(id){ return document.getElementById(id); }
  function readJSON(key, fallback){ try{ var raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }catch(e){ return fallback; } }
  function writeJSON(key, value){ try{ localStorage.setItem(key, JSON.stringify(value)); return true; }catch(e){ return false; } }
  function escapeHTML(value){ return String(value == null ? '' : value).replace(/[&<>"']/g, function(ch){ return {'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[ch]; }); }
  function num(value){ var n = Number(String(value == null ? '' : value).replace(',','.')); return Number.isFinite(n) ? n : null; }
  function parseDate(value){
    if(!value) return null;
    var parts = String(value).slice(0,10).split('-').map(Number);
    if(parts.length !== 3 || parts.some(function(n){ return !Number.isFinite(n); })) return null;
    return new Date(parts[0], parts[1]-1, parts[2]);
  }
  function dateISO(date){
    var d = date instanceof Date ? date : parseDate(date);
    if(!d) return '';
    return d.getFullYear() + '-' + String(d.getMonth()+1).padStart(2,'0') + '-' + String(d.getDate()).padStart(2,'0');
  }
  function todayISO(){ return dateISO(new Date()); }
  function startOfLocalDay(value){ var d = value instanceof Date ? value : parseDate(value); return d ? new Date(d.getFullYear(), d.getMonth(), d.getDate()) : null; }
  function addLocalDays(value, days){ var d = startOfLocalDay(value); if(!d) return null; d.setDate(d.getDate() + Number(days || 0)); return d; }
  function compareISO(a,b){ return String(a || '').localeCompare(String(b || '')); }
  function fmtDate(value){
    var d = value instanceof Date ? value : parseDate(value);
    if(!d) return 'Not set';
    return d.toLocaleDateString(undefined, { day:'numeric', month:'short', year:'numeric' });
  }
  function setText(id, value){ var el = $(id); if(el) el.textContent = value == null ? '' : String(value); }

  function normaliseDays(value){
    var dayNameMap = { sunday:'0', sun:'0', monday:'1', mon:'1', tuesday:'2', tue:'2', tues:'2', wednesday:'3', wed:'3', thursday:'4', thu:'4', thurs:'4', friday:'5', fri:'5', saturday:'6', sat:'6' };
    var values = Array.isArray(value) ? value : String(value == null ? '' : value).split(',');
    return Array.from(new Set(values.map(function(v){
      var raw = String(v == null ? '' : v).trim();
      if(/^[0-6]$/.test(raw)) return raw;
      return dayNameMap[raw.toLowerCase()] || '';
    }).filter(Boolean)));
  }
  function frequencyLabel(freq){
    return ({daily:'Daily', weekly:'Weekly', every_2_weeks:'Every 2 weeks', every_x_days:'Every X days', specific_days:'Specific days', not_tracking:'Not tracking', not_sure:'Not sure yet', not_using:'Not using medication'})[freq] || String(freq || 'Not tracking').replace(/_/g,' ');
  }
  function readMedicationSetup(){
    var a = readJSON(KEYS.medicationSetup, {}) || {};
    var b = readJSON(KEYS.injectionSchedule, {}) || {};
    var c = readJSON(KEYS.medication, {}) || {};
    var merged = Object.assign({}, c, b, a);
    var medication = merged.medication || merged.type || merged.medicationRaw || localStorage.getItem('heartyMedicationType') || localStorage.getItem('heartyInjectionName') || '';
    var frequency = merged.scheduleType || merged.frequency || localStorage.getItem('heartyMedicationFrequency') || localStorage.getItem('heartyInjectionFrequency') || 'not_tracking';
    return {
      medication: medication,
      frequency: frequency,
      days: normaliseDays(merged.days || localStorage.getItem('heartyMedicationDays') || localStorage.getItem('heartyInjectionDays') || merged.day || localStorage.getItem('heartyInjectionDay')),
      intervalDays: num(merged.intervalDays || localStorage.getItem('heartyMedicationIntervalDays')),
      nextDoseDate: merged.nextDoseDate || localStorage.getItem('heartyNextDoseDate') || localStorage.getItem('heartyMedicationNextDate') || '',
      reminderEnabled: merged.reminderEnabled !== false
    };
  }
  function normaliseMedicationLog(item, source){
    if(!item || typeof item !== 'object') return null;
    var date = String(item.date || item.day || item.loggedAt || item.createdAt || '').slice(0,10);
    if(!parseDate(date)) return null;
    return {
      id: item.id || 'dose-' + date,
      date: date,
      medication: item.medication || item.med || item.type || (medSetup && medSetup.medication) || '',
      dose: item.dose || item.amount || '',
      source: item.source || source || 'support',
      createdAt: item.createdAt || item.loggedAt || new Date().toISOString()
    };
  }
  function readMedicationLogs(){
    var rows = [];
    [KEYS.medicationLogs, 'heartyInjectionLog', 'heartyMedicationLog', 'heartyDoseLog'].forEach(function(key){
      var logs = readJSON(key, []);
      if(Array.isArray(logs)) logs.forEach(function(item){ var row = normaliseMedicationLog(item, key); if(row) rows.push(row); });
    });
    var byDate = new Map();
    rows.forEach(function(row){ byDate.set(row.date, row); });
    var sorted = Array.from(byDate.values()).sort(function(a,b){ return String(a.date).localeCompare(String(b.date)); });
    writeJSON(KEYS.medicationLogs, sorted);
    return sorted;
  }
  function saveMedicationLogs(logs){
    var sorted = logs.map(function(item){ return normaliseMedicationLog(item, 'support'); }).filter(Boolean).sort(function(a,b){ return String(a.date).localeCompare(String(b.date)); });
    writeJSON(KEYS.medicationLogs, sorted);
    try{ localStorage.setItem('heartyInjectionLog', JSON.stringify(sorted.slice().reverse())); }catch(e){}
    return sorted;
  }
  function hasInjectionTracking(){
    var freq = medSetup && medSetup.frequency;
    if(!medSetup || !medSetup.medication) return false;
    if(['not_tracking','not_using','not_sure'].indexOf(freq) !== -1) return false;
    return true;
  }
  function scheduleAnchorDate(){ return startOfLocalDay(medSetup.nextDoseDate) || (medLogs.length ? startOfLocalDay(medLogs[medLogs.length - 1].date) : null) || startOfLocalDay(new Date()); }
  function pushIntervalDates(out, start, end, anchor, intervalDays){
    var interval = Number(intervalDays || 0);
    if(!interval || interval < 1) return;
    var d = startOfLocalDay(anchor || start);
    if(!d) return;
    while(d > start) d = addLocalDays(d, -interval);
    while(d < start) d = addLocalDays(d, interval);
    while(d <= end){ out.push(dateISO(d)); d = addLocalDays(d, interval); }
  }
  function plannedInjectionDates(daysBack, daysForward){
    if(!hasInjectionTracking()) return [];
    var today = startOfLocalDay(new Date());
    var start = addLocalDays(today, -(daysBack || 90));
    var end = addLocalDays(today, daysForward || 70);
    var freq = medSetup.frequency;
    var dates = [];
    if(freq === 'daily'){
      var dd = start;
      while(dd <= end){ dates.push(dateISO(dd)); dd = addLocalDays(dd, 1); }
    } else if(freq === 'weekly' || freq === 'specific_days'){
      var daySet = new Set((medSetup.days || []).map(String));
      if(daySet.size){
        var d = start;
        while(d <= end){ if(daySet.has(String(d.getDay()))) dates.push(dateISO(d)); d = addLocalDays(d, 1); }
      } else if(medSetup.nextDoseDate){
        pushIntervalDates(dates, start, end, medSetup.nextDoseDate, 7);
      }
    } else if(freq === 'every_2_weeks'){
      pushIntervalDates(dates, start, end, scheduleAnchorDate(), 14);
    } else if(freq === 'every_x_days'){
      pushIntervalDates(dates, start, end, scheduleAnchorDate(), medSetup.intervalDays || 7);
    }
    return Array.from(new Set(dates)).filter(Boolean).sort(compareISO);
  }
  function logForPlannedDate(plannedISO, nextPlannedISO){
    var start = String(plannedISO || '');
    var end = String(nextPlannedISO || '9999-12-31');
    return medLogs.find(function(log){ return compareISO(log.date, start) >= 0 && compareISO(log.date, end) < 0; }) || null;
  }
  function buildInjectionTimelineData(){
    var dates = plannedInjectionDates(90, 60);
    var today = todayISO();
    return dates.map(function(iso, index){
      var nextIso = dates[index + 1] || '';
      var log = logForPlannedDate(iso, nextIso);
      var status = 'upcoming', label = 'Upcoming', marker = '•';
      if(log){ status = log.date === iso ? 'logged' : 'late_logged'; label = log.date === iso ? 'Logged' : 'Logged late'; marker = '✓'; }
      else if(compareISO(iso, today) < 0){ status = 'missed'; label = 'Missed'; marker = '!'; }
      else if(iso === today){ status = 'due'; label = 'Today'; marker = '•'; }
      return { iso:iso, nextIso:nextIso, log:log, status:status, label:label, marker:marker };
    });
  }
  function computeInjectionStatus(){
    if(!hasInjectionTracking()) return { tone:'neutral', label:'Not tracking', title:'Injection schedule not set', copy:'Add your medication rhythm in onboarding if you want injection alerts.', nextLabel:'—', nextNote:'Not tracking' };
    var today = todayISO();
    var tomorrow = dateISO(addLocalDays(new Date(), 1));
    var timeline = buildInjectionTimelineData();
    var dueToday = timeline.find(function(item){ return item.iso === today && item.status === 'due'; });
    var loggedToday = medLogs.find(function(log){ return log.date === today; });
    var overdue = timeline.slice().reverse().find(function(item){
      if(item.status !== 'missed') return false;
      var planned = startOfLocalDay(item.iso);
      var now = startOfLocalDay(today);
      if(!planned || !now) return false;
      var daysLate = Math.round((now - planned) / 86400000);
      return daysLate === 1;
    });
    var dueTomorrow = timeline.find(function(item){ return item.iso === tomorrow && !item.log; });
    var next = timeline.find(function(item){ return compareISO(item.iso, today) >= 0 && !item.log; });
    if(loggedToday){
      var nextAfterLog = next || timeline.find(function(item){ return compareISO(item.iso, today) > 0; });
      return { tone:'green', label:'Logged today', title:'Injection logged today', copy:'Your injection log is saved for today. The next planned date is shown below.', nextLabel: nextAfterLog ? fmtDate(nextAfterLog.iso) : '—', nextNote: nextAfterLog ? 'Next planned date' : 'No upcoming planned date' };
    }
    if(dueToday) return { tone:'orange', label:'Today', title:'Injection planned today', copy:'This is a planned injection day from your saved rhythm. Log it after it has been done.', nextLabel:'Today', nextNote:fmtDate(today) };
    if(overdue) return { tone:'red', label:'Late', title:'Injection appears overdue', copy:'A planned injection date was missed yesterday: ' + fmtDate(overdue.iso) + '. This red alert only shows for 24 hours.', nextLabel:fmtDate(overdue.iso), nextNote:'Late for 24 hours only' };
    if(dueTomorrow) return { tone:'green', label:'Tomorrow', title:'Injection planned tomorrow', copy:'A planned injection day is coming up tomorrow based on your saved rhythm.', nextLabel:'Tomorrow', nextNote:fmtDate(tomorrow) };
    if(next) return { tone:'neutral', label:'Not due yet', title:'No injection due today', copy:'Next planned injection: ' + fmtDate(next.iso) + '.', nextLabel:fmtDate(next.iso), nextNote:'Next planned date' };
    return { tone:'neutral', label:'Set rhythm', title:'Injection rhythm needs a date', copy:'Add a next planned date or injection day in onboarding to activate alerts.', nextLabel:'—', nextNote:'Edit schedule' };
  }

  function readSideEffectLogs(){
    var logs = readJSON(KEYS.sideEffects, []);
    return Array.isArray(logs) ? logs.filter(function(row){ return row && row.date; }).sort(function(a,b){ return String(a.date).localeCompare(String(b.date)); }) : [];
  }
  function saveSideEffectLogs(logs){
    var sorted = logs.filter(function(row){ return row && row.date; }).sort(function(a,b){ return String(a.date).localeCompare(String(b.date)); });
    writeJSON(KEYS.sideEffects, sorted.slice(-90));
    return sorted.slice(-90);
  }
  function renderSideEffectLogs(){
    var wrap = $('sideEffectLogList');
    if(!wrap) return;
    var logs = readSideEffectLogs();
    if(!logs.length){
      wrap.innerHTML = '<div class="empty-soft">No side-effect logs yet. Add today’s note when you want to track patterns.</div>';
      return;
    }
    wrap.innerHTML = logs.slice().reverse().slice(0,8).map(function(row){
      return '<div class="support-log-row"><div><strong>' + escapeHTML(fmtDate(row.date)) + ' • ' + escapeHTML(SYMPTOMS[row.symptom] || row.symptom || 'Symptom') + '</strong><span>' + escapeHTML(row.severity || 'Mild') + (row.note ? ' — ' + escapeHTML(row.note) : '') + '</span></div><button class="tiny-remove" type="button" data-delete-side-effect="' + escapeHTML(row.id) + '">Remove</button></div>';
    }).join('');
  }
  function bindSideEffects(){
    var form = $('sideEffectForm');
    if(form) form.addEventListener('submit', function(event){
      event.preventDefault();
      var symptom = $('sideEffectSymptom') ? $('sideEffectSymptom').value : 'nausea';
      var severity = $('sideEffectSeverity') ? $('sideEffectSeverity').value : 'mild';
      var note = $('sideEffectNote') ? $('sideEffectNote').value.trim() : '';
      var date = todayISO();
      var logs = readSideEffectLogs().filter(function(row){ return !(row.date === date && row.symptom === symptom); });
      logs.push({ id:'side-' + date + '-' + symptom, date:date, symptom:symptom, severity:severity, note:note, createdAt:new Date().toISOString() });
      saveSideEffectLogs(logs);
      if(window.HeartySupport && symptom !== 'other') window.HeartySupport.set(symptom, 'support-side-effect-log');
      if($('sideEffectNote')) $('sideEffectNote').value = '';
      setText('sideEffectSaveState','Saved for today.');
      renderSideEffectLogs();
    });
    document.addEventListener('click', function(event){
      var btn = event.target.closest('[data-delete-side-effect]');
      if(!btn) return;
      var id = btn.getAttribute('data-delete-side-effect');
      saveSideEffectLogs(readSideEffectLogs().filter(function(row){ return row.id !== id; }));
      renderSideEffectLogs();
    });
  }

  function renderResources(){
    var wrap = $('supportResourceGrid');
    if(!wrap) return;
    wrap.innerHTML = RESOURCES.map(function(item){
      return '<article class="resource-card"><h3>' + escapeHTML(item.title) + '</h3><ul>' + item.tips.map(function(tip){ return '<li>' + escapeHTML(tip) + '</li>'; }).join('') + '</ul></article>';
    }).join('');
  }
  function renderInjectionAlert(status){
    var el = $('supportInjectionAlert');
    if(!el) return;
    el.className = 'injection-alert is-' + (status.tone || 'neutral');
    el.innerHTML = '<span class="injection-alert-dot" aria-hidden="true"></span><div><h3>' + escapeHTML(status.title) + '</h3><p>' + escapeHTML(status.copy) + '</p><span class="injection-status-pill">' + escapeHTML(status.label) + '</span></div>';
  }
  function timelineWindow(items){
    var today = todayISO();
    var past = items.filter(function(item){ return compareISO(item.iso, today) <= 0; }).slice(-6);
    var future = items.filter(function(item){ return compareISO(item.iso, today) > 0; }).slice(0, Math.max(2, 8 - past.length));
    return past.concat(future).slice(-8);
  }
  function renderInjectionTimeline(){
    var wrap = $('supportInjectionTimeline');
    if(!wrap) return;
    var items = timelineWindow(buildInjectionTimelineData());
    if(!items.length){
      wrap.className = 'empty-soft';
      wrap.innerHTML = 'Set your medication rhythm in onboarding to see the injection chart.';
      return;
    }
    wrap.className = 'injection-chart';
    var cls = { logged:'is-logged', late_logged:'is-late-logged', missed:'is-missed', due:'is-due', upcoming:'is-upcoming' };
    wrap.innerHTML = items.map(function(item){
      return '<div class="injection-step ' + (cls[item.status] || '') + '" title="' + escapeHTML(fmtDate(item.iso)) + ' • ' + escapeHTML(item.label) + '"><div class="injection-marker">' + escapeHTML(item.marker) + '</div><div class="injection-step-date">' + escapeHTML(fmtDate(item.iso).replace(/ \d{4}$/, '')) + '</div><div class="injection-step-label">' + escapeHTML(item.label) + '</div></div>';
    }).join('');
  }
  function dayText(){
    if(!medSetup) return '';
    if(medSetup.frequency === 'daily') return 'Every day';
    return medSetup.days && medSetup.days.length ? medSetup.days.map(function(d){ return DAY_SHORT[Number(d)]; }).join(', ') : 'No days set';
  }
  function renderInjection(){
    medSetup = readMedicationSetup();
    medLogs = readMedicationLogs();
    var status = computeInjectionStatus();
    setText('supportMedName', medSetup.medication || 'Not set');
    setText('supportMedNext', status.nextLabel || '—');
    var last = medLogs[medLogs.length - 1];
    setText('supportMedLast', last ? fmtDate(last.date).replace(/ \d{4}$/, '') : '—');
    setText('injectionRhythmText', medSetup.medication ? (medSetup.medication + ' • ' + frequencyLabel(medSetup.frequency) + ' • ' + dayText()) : 'Add your medication rhythm in onboarding to use injection tracking.');
    renderInjectionAlert(status);
    renderInjectionTimeline();
  }
  function addDoseLog(date){
    var iso = date || todayISO();
    medLogs = medLogs.filter(function(row){ return row.date !== iso; });
    medLogs.push({ id:'dose-' + iso, date:iso, medication:(medSetup && medSetup.medication) || '', source:'support', createdAt:new Date().toISOString() });
    medLogs = saveMedicationLogs(medLogs);
    renderInjection();
  }
  function bindInjection(){
    var todayBtn = $('supportLogDoseToday');
    var yBtn = $('supportLogDoseYesterday');
    if(todayBtn) todayBtn.addEventListener('click', function(){ addDoseLog(todayISO()); });
    if(yBtn) yBtn.addEventListener('click', function(){ addDoseLog(dateISO(addLocalDays(new Date(), -1))); });
  }

  function init(){
    renderResources();
    renderSideEffectLogs();
    renderInjection();
    bindSideEffects();
    bindInjection();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init, { once:true }); else init();
})();

(function(){
  'use strict';

  const KEYS = {
    profile: 'hearty_basic_user_profile_v1',
    legacyProfile: 'heartyProfile',
    weightLogs: 'hearty_weight_logs_v1',
    medicationSetup: 'heartyMedicationSetupV1',
    injectionSchedule: 'heartyInjectionSchedule',
    medication: 'heartyMedication',
    medicationLogs: 'hearty_medication_logs_v1',
    weeklyCheckins: 'hearty_weekly_checkins_v1',
    localPhotoFallback: 'hearty_progress_photos_v1'
  };
  const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  const DAY_SHORT = ['Sun','Mon','Tue','Wed','Thu','Fri','Sat'];
  const ANGLES = ['front','side','back'];
  const $ = (id) => document.getElementById(id);
  const qsa = (sel) => Array.from(document.querySelectorAll(sel));

  function todayISO(){ return new Date().toISOString().slice(0,10); }
  function parseDate(value){
    if(!value) return null;
    const parts = String(value).slice(0,10).split('-').map(Number);
    if(parts.length !== 3 || parts.some(n => !Number.isFinite(n))) return null;
    return new Date(parts[0], parts[1]-1, parts[2]);
  }
  function isoFromDate(date){ return date ? date.toISOString().slice(0,10) : ''; }
  function fmtDate(value){
    const date = value instanceof Date ? value : parseDate(value);
    if(!date) return 'Not set';
    return date.toLocaleDateString(undefined, { day:'numeric', month:'short', year:'numeric' });
  }
  function readJSON(key, fallback){
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch(e){ return fallback; }
  }
  function writeJSON(key, value){
    try { localStorage.setItem(key, JSON.stringify(value)); return true; } catch(e){ return false; }
  }
  function setText(id, value){ const el=$(id); if(el) el.textContent = value == null ? '' : String(value); }
  function num(value){
    const n = Number(String(value ?? '').replace(',','.'));
    return Number.isFinite(n) ? n : null;
  }
  function kgToLb(kg){ return Number(kg) * 2.20462; }
  function lbToKg(lb){ return Number(lb) / 2.20462; }
  function round1(value){ return Math.round(Number(value) * 10) / 10; }
  function clamp(n, min, max){ return Math.max(min, Math.min(max, n)); }
  function escapeHTML(value){
    return String(value == null ? '' : value)
      .replace(/&/g,'&amp;').replace(/</g,'&lt;').replace(/>/g,'&gt;')
      .replace(/"/g,'&quot;').replace(/'/g,'&#39;');
  }

  function readProfile(){
    const app = readJSON(KEYS.profile, {}) || {};
    const legacy = readJSON(KEYS.legacyProfile, {}) || {};
    return Object.assign({}, legacy, app);
  }
  const profile = readProfile();
  const displayUnit = (profile.units || profile.unit || localStorage.getItem('heartyUnitsSystem') || 'metric') === 'imperial' ? 'lb' : 'kg';
  const weightInputUnit = displayUnit;
  function toDisplayWeight(kg){
    if(!Number.isFinite(Number(kg))) return null;
    return displayUnit === 'lb' ? round1(kgToLb(kg)) : round1(kg);
  }
  function toKgFromDisplay(value){
    const n = num(value);
    if(!Number.isFinite(n) || n <= 0) return null;
    return displayUnit === 'lb' ? round1(lbToKg(n)) : round1(n);
  }
  function fmtWeightKg(kg){
    const display = toDisplayWeight(kg);
    return display == null ? '—' : `${display.toFixed(1)} ${displayUnit}`;
  }
  function profileStartingKg(){
    return num(profile.startingWeightKg) || num(localStorage.getItem('heartyStartingWeightKg')) || num(localStorage.getItem('heartyWeightStartingKg')) || null;
  }
  function profileCurrentKg(){
    return num(profile.currentWeightKg) || num(localStorage.getItem('heartyCurrentWeightKg')) || num(localStorage.getItem('heartyWeightCurrentKg')) || num(localStorage.getItem('heartyTodayWeightKg')) || null;
  }

  function readWeightLogs(){
    const rows = [];
    const weightSources = [
      [KEYS.weightLogs, 'v1'],
      ['heartyWeightHistory', 'legacy-history'],
      ['heartyWeightLogs', 'home-legacy'],
      ['hearty_weight_logs', 'legacy-weight-logs'],
      ['heartyWeightLogsV1', 'legacy-v1'],
      ['heartyProgressWeightLogsV1', 'legacy-progress']
    ];
    function addRow(item, source){
      if(!item || typeof item !== 'object') return;
      const date = String(item.date || item.day || item.loggedAt || item.createdAt || '').slice(0,10);
      if(!parseDate(date)) return;
      let weightKg = num(item.weightKg || item.kg || item.weight_kg);
      if(!weightKg){
        const w = num(item.weight || item.value || item.currentWeight);
        if(w) weightKg = item.unit === 'lb' || item.units === 'imperial' ? round1(lbToKg(w)) : round1(w);
      }
      if(!weightKg || weightKg <= 0) return;
      rows.push({
        id: item.id || `${date}-${source}-${Math.random().toString(36).slice(2,7)}`,
        date,
        weightKg: round1(weightKg),
        source: item.source || source || 'manual',
        createdAt: item.createdAt || new Date().toISOString()
      });
    }
    weightSources.forEach(([key, source]) => {
      const data = readJSON(key, []);
      const list = Array.isArray(data) ? data : Array.isArray(data?.items) ? data.items : Array.isArray(data?.logs) ? data.logs : [];
      list.forEach(item => addRow(item, source));
    });

    if(!rows.length){
      const current = profileCurrentKg();
      if(current){
        const profileDate = String(profile.updatedAt || new Date().toISOString()).slice(0,10);
        rows.push({ id:`onboarding-${profileDate}`, date: profileDate || todayISO(), weightKg: round1(current), source:'app-onboarding', createdAt: new Date().toISOString() });
      }
    }
    const byDate = new Map();
    rows.forEach(row => byDate.set(row.date, row));
    const normalised = Array.from(byDate.values()).sort((a,b) => String(a.date).localeCompare(String(b.date)));
    writeJSON(KEYS.weightLogs, normalised);
    return normalised;
  }
  function saveWeightLogs(logs){
    const sorted = logs.filter(r => r && r.date && Number.isFinite(Number(r.weightKg))).sort((a,b) => String(a.date).localeCompare(String(b.date)));
    writeJSON(KEYS.weightLogs, sorted);
    const latest = sorted[sorted.length - 1];
    if(latest){
      try {
        localStorage.setItem('heartyCurrentWeightKg', String(latest.weightKg));
        localStorage.setItem('heartyWeightCurrentKg', String(latest.weightKg));
        localStorage.setItem('heartyTodayWeightKg', String(latest.weightKg));
      } catch(e){}
    }
    return sorted;
  }

  let weightLogs = readWeightLogs();

  function renderWeightSummary(){
    const startKg = profileStartingKg() || (weightLogs[0] && weightLogs[0].weightKg) || null;
    const latest = weightLogs[weightLogs.length - 1] || null;
    const latestKg = latest ? latest.weightKg : profileCurrentKg();
    setText('weightUnitPill', displayUnit.toUpperCase());
    const input = $('weightValue');
    if(input) input.placeholder = displayUnit === 'lb' ? 'e.g. 203.5' : 'e.g. 92.4';
    setText('startingWeightValue', startKg ? fmtWeightKg(startKg) : '—');
    setText('latestWeightValue', latestKg ? fmtWeightKg(latestKg) : '—');
    setText('latestWeightNote', latest ? fmtDate(latest.date) : (latestKg ? 'From onboarding' : 'No log yet'));
    if(startKg && latestKg){
      const diff = round1(latestKg - startKg);
      if(Math.abs(diff) < .05) setText('weightChangeValue','No change');
      else if(diff < 0) setText('weightChangeValue', `${fmtWeightKg(Math.abs(diff)).replace(' kg','').replace(' lb','')} ${displayUnit} down`);
      else setText('weightChangeValue', `${fmtWeightKg(diff).replace(' kg','').replace(' lb','')} ${displayUnit} up`);
    } else {
      setText('weightChangeValue','—');
    }
  }

  function renderWeightList(){
    const wrap = $('weightLogList');
    if(!wrap) return;
    if(!weightLogs.length){
      wrap.innerHTML = '<div class="recent-row"><div><div class="recent-date">No weight logs yet</div><div class="recent-meta">Save a weight to begin your trend.</div></div></div>';
      return;
    }
    wrap.innerHTML = weightLogs.slice().reverse().map(row => `
      <div class="recent-row" data-weight-log="${escapeHTML(row.id)}">
        <div><div class="recent-date">${fmtDate(row.date)}</div><div class="recent-meta">${row.source === 'app-onboarding' ? 'From onboarding' : 'Manual log'}</div></div>
        <div class="recent-value">${fmtWeightKg(row.weightKg)}</div>
        <button class="tiny-btn" type="button" data-delete-weight="${escapeHTML(row.id)}">Remove</button>
      </div>
    `).join('');
  }

  function renderWeightChart(){
    const svg = $('weightTrendChart');
    const empty = $('weightTrendEmpty');
    if(!svg) return;
    const logs = weightLogs.filter(r => parseDate(r.date) && Number.isFinite(Number(r.weightKg))).sort((a,b) => String(a.date).localeCompare(String(b.date)));
    if(!logs.length){
      svg.innerHTML = '';
      if(empty) empty.hidden = false;
      return;
    }
    if(empty) empty.hidden = true;
    const w = 720, h = 280, left = 54, right = 24, top = 28, bottom = 44;
    const plotW = w - left - right, plotH = h - top - bottom;
    const dates = logs.map(r => parseDate(r.date).getTime());
    let minDate = Math.min.apply(null, dates), maxDate = Math.max.apply(null, dates);
    if(minDate === maxDate){ minDate -= 86400000; maxDate += 86400000; }
    const weightsDisplay = logs.map(r => toDisplayWeight(r.weightKg));
    let minY = Math.floor(Math.min.apply(null, weightsDisplay) - 1);
    let maxY = Math.ceil(Math.max.apply(null, weightsDisplay) + 1);
    if(minY === maxY){ minY -= 1; maxY += 1; }
    const x = date => left + ((parseDate(date).getTime() - minDate) / (maxDate - minDate)) * plotW;
    const y = val => top + ((maxY - val) / (maxY - minY)) * plotH;
    const yTicks = [maxY, Math.round((maxY + minY) / 2), minY].filter((v,i,a)=>a.indexOf(v)===i);
    const points = logs.map(r => ({ x:x(r.date), y:y(toDisplayWeight(r.weightKg)), date:r.date, label:fmtWeightKg(r.weightKg) }));
    const path = points.map((p,i) => `${i?'L':'M'} ${p.x.toFixed(1)} ${p.y.toFixed(1)}`).join(' ');
    const first = logs[0], last = logs[logs.length-1];
    svg.innerHTML = `
      <g stroke="currentColor" opacity=".10" stroke-width="1">
        ${yTicks.map(v => `<line x1="${left}" x2="${w-right}" y1="${y(v).toFixed(1)}" y2="${y(v).toFixed(1)}"></line>`).join('')}
      </g>
      <g fill="currentColor" opacity=".62" font-size="12" font-weight="800">
        ${yTicks.map(v => `<text x="${left-10}" y="${(y(v)+4).toFixed(1)}" text-anchor="end">${v} ${displayUnit}</text>`).join('')}
        <text x="${left}" y="${h-12}">${fmtDate(first.date).replace(/\s\d{4}$/,'')}</text>
        <text x="${w-right}" y="${h-12}" text-anchor="end">${fmtDate(last.date).replace(/\s\d{4}$/,'')}</text>
      </g>
      ${logs.length > 1 ? `<path d="${path}" fill="none" stroke="var(--theme-accent,#2f6df6)" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round"></path>` : ''}
      ${points.map((p,i) => `<circle cx="${p.x.toFixed(1)}" cy="${p.y.toFixed(1)}" r="${i === points.length-1 ? 5 : 3.2}" fill="var(--card,#fff)" stroke="var(--theme-accent,#2f6df6)" stroke-width="2.2"><title>${fmtDate(p.date)} • ${p.label}</title></circle>`).join('')}
      ${logs.length === 1 ? `<text x="${w/2}" y="${top+34}" text-anchor="middle" fill="currentColor" opacity=".62" font-size="14" font-weight="800">First log saved. Add another weight to see the trend.</text>` : ''}
    `;
  }
  function renderWeight(){ renderWeightSummary(); renderWeightChart(); renderWeightList(); }

  function bindWeight(){
    const date = $('weightDate');
    const form = $('weightLogForm');
    if(date && !date.value) date.value = todayISO();
    if(!form) return;
    form.addEventListener('submit', (event) => {
      event.preventDefault();
      const dateValue = $('weightDate').value || todayISO();
      const weightKg = toKgFromDisplay($('weightValue').value);
      if(!weightKg){ setText('weightSaveState', 'Add a valid weight first.'); return; }
      const id = `manual-${dateValue}`;
      weightLogs = weightLogs.filter(r => r.date !== dateValue);
      weightLogs.push({ id, date:dateValue, weightKg, source:'manual', createdAt:new Date().toISOString() });
      weightLogs = saveWeightLogs(weightLogs);
      $('weightValue').value = '';
      setText('weightSaveState', 'Weight saved.');
      renderWeight();
    });
    document.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-delete-weight]');
      if(!btn) return;
      const id = btn.getAttribute('data-delete-weight');
      weightLogs = saveWeightLogs(weightLogs.filter(r => r.id !== id));
      setText('weightSaveState', 'Weight log removed.');
      renderWeight();
    });
  }

  function readMedicationSetup(){
    const a = readJSON(KEYS.medicationSetup, {}) || {};
    const b = readJSON(KEYS.injectionSchedule, {}) || {};
    const c = readJSON(KEYS.medication, {}) || {};
    const merged = Object.assign({}, c, b, a);
    const medication = merged.medication || merged.type || merged.medicationRaw || localStorage.getItem('heartyMedicationType') || localStorage.getItem('heartyInjectionName') || '';
    const frequency = merged.scheduleType || merged.frequency || localStorage.getItem('heartyMedicationFrequency') || localStorage.getItem('heartyInjectionFrequency') || 'not_tracking';
    const days = normaliseDays(merged.days || localStorage.getItem('heartyMedicationDays') || localStorage.getItem('heartyInjectionDays') || merged.day || localStorage.getItem('heartyInjectionDay'));
    return {
      medication,
      frequency,
      days,
      intervalDays: num(merged.intervalDays || localStorage.getItem('heartyMedicationIntervalDays')),
      nextDoseDate: merged.nextDoseDate || localStorage.getItem('heartyNextDoseDate') || localStorage.getItem('heartyMedicationNextDate') || '',
      reminderEnabled: merged.reminderEnabled !== false
    };
  }
  function normaliseDays(value){
    const dayNameMap = { sunday:'0', sun:'0', monday:'1', mon:'1', tuesday:'2', tue:'2', tues:'2', wednesday:'3', wed:'3', thursday:'4', thu:'4', thurs:'4', friday:'5', fri:'5', saturday:'6', sat:'6' };
    const values = Array.isArray(value) ? value : String(value == null ? '' : value).split(',');
    return Array.from(new Set(values.map(v => {
      const raw = String(v == null ? '' : v).trim();
      if(/^[0-6]$/.test(raw)) return raw;
      return dayNameMap[raw.toLowerCase()] || '';
    }).filter(Boolean)));
  }
  function frequencyLabel(freq){
    return ({daily:'Daily', weekly:'Weekly', every_2_weeks:'Every 2 weeks', every_x_days:'Every X days', specific_days:'Specific days', not_tracking:'Not tracking', not_sure:'Not sure yet', not_using:'Not using medication'})[freq] || String(freq || 'Not tracking').replace(/_/g,' ');
  }
  function normaliseMedicationLog(item, source){
    if(!item || typeof item !== 'object') return null;
    const date = String(item.date || item.day || item.loggedAt || item.createdAt || '').slice(0,10);
    if(!parseDate(date)) return null;
    return {
      id: item.id || `dose-${date}`,
      date,
      medication: item.medication || item.med || item.type || medSetup?.medication || '',
      dose: item.dose || item.amount || '',
      source: item.source || source || 'legacy',
      createdAt: item.createdAt || item.loggedAt || new Date().toISOString()
    };
  }
  function readMedicationLogs(){
    const rows = [];
    const keys = [KEYS.medicationLogs, 'heartyInjectionLog', 'heartyMedicationLog', 'heartyDoseLog'];
    keys.forEach(key => {
      const logs = readJSON(key, []);
      if(Array.isArray(logs)) logs.forEach(item => { const row = normaliseMedicationLog(item, key); if(row) rows.push(row); });
    });
    const byDate = new Map();
    rows.forEach(row => byDate.set(row.date, row));
    const sorted = Array.from(byDate.values()).sort((a,b) => String(a.date).localeCompare(String(b.date)));
    writeJSON(KEYS.medicationLogs, sorted);
    return sorted;
  }
  function saveMedicationLogs(logs){
    const sorted = logs.map(item => normaliseMedicationLog(item, 'progress')).filter(Boolean).sort((a,b) => String(a.date).localeCompare(String(b.date)));
    writeJSON(KEYS.medicationLogs, sorted);
    try{ localStorage.setItem('heartyInjectionLog', JSON.stringify(sorted.slice().reverse())); }catch(e){}
    return sorted;
  }
  let medSetup = readMedicationSetup();
  let medLogs = readMedicationLogs();

  function dateISO(date){
    if(!date) return '';
    const d = date instanceof Date ? date : parseDate(date);
    if(!d) return '';
    const y = d.getFullYear();
    const m = String(d.getMonth()+1).padStart(2,'0');
    const day = String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
  function startOfLocalDay(value){
    const d = value instanceof Date ? value : parseDate(value);
    if(!d) return null;
    return new Date(d.getFullYear(), d.getMonth(), d.getDate());
  }
  function addLocalDays(value, days){
    const d = startOfLocalDay(value);
    if(!d) return null;
    d.setDate(d.getDate() + Number(days || 0));
    return d;
  }
  function compareISO(a,b){ return String(a || '').localeCompare(String(b || '')); }
  function hasInjectionTracking(){
    const freq = medSetup.frequency;
    if(!medSetup.medication) return false;
    if(['not_tracking','not_using','not_sure'].includes(freq)) return false;
    return true;
  }
  function scheduleAnchorDate(){
    return startOfLocalDay(medSetup.nextDoseDate) || (medLogs.length ? startOfLocalDay(medLogs[medLogs.length - 1].date) : null) || startOfLocalDay(new Date());
  }
  function pushIntervalDates(out, start, end, anchor, intervalDays){
    const interval = Number(intervalDays || 0);
    if(!interval || interval < 1) return;
    let d = startOfLocalDay(anchor || start);
    if(!d) return;
    while(d > start) d = addLocalDays(d, -interval);
    while(d < start) d = addLocalDays(d, interval);
    while(d <= end){ out.push(dateISO(d)); d = addLocalDays(d, interval); }
  }
  function plannedInjectionDates(daysBack, daysForward){
    if(!hasInjectionTracking()) return [];
    const today = startOfLocalDay(new Date());
    const start = addLocalDays(today, -(daysBack || 90));
    const end = addLocalDays(today, daysForward || 70);
    const freq = medSetup.frequency;
    const dates = [];

    if(freq === 'daily'){
      let d = start;
      while(d <= end){ dates.push(dateISO(d)); d = addLocalDays(d, 1); }
    } else if(freq === 'weekly' || freq === 'specific_days'){
      const daySet = new Set(medSetup.days.map(String));
      if(daySet.size){
        let d = start;
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
    const start = String(plannedISO || '');
    const end = String(nextPlannedISO || '9999-12-31');
    return medLogs.find(log => compareISO(log.date, start) >= 0 && compareISO(log.date, end) < 0) || null;
  }
  function buildInjectionTimelineData(){
    const dates = plannedInjectionDates(100, 80);
    const today = dateISO(new Date());
    return dates.map((iso, index) => {
      const nextIso = dates[index + 1] || '';
      const log = logForPlannedDate(iso, nextIso);
      let status = 'upcoming';
      let label = 'Upcoming';
      let marker = '•';
      if(log){
        status = log.date === iso ? 'logged' : 'late_logged';
        label = log.date === iso ? 'Logged' : 'Logged late';
        marker = '✓';
      } else if(compareISO(iso, today) < 0){
        status = 'missed';
        label = 'Late';
        marker = '!';
      } else if(iso === today){
        status = 'due';
        label = 'Today';
        marker = '•';
      }
      return { iso, nextIso, log, status, label, marker };
    });
  }
  function computeInjectionStatus(){
    if(!hasInjectionTracking()){
      return { tone:'neutral', label:'Not tracking', title:'Injection schedule not set', copy:'Add your medication rhythm in onboarding if you want injection alerts.', nextLabel:'—', nextNote:'Not tracking' };
    }
    const today = dateISO(new Date());
    const tomorrow = dateISO(addLocalDays(new Date(), 1));
    const timeline = buildInjectionTimelineData();
    const dueToday = timeline.find(item => item.iso === today && item.status === 'due');
    const loggedToday = medLogs.find(log => log.date === today);
    const overdue = timeline.slice().reverse().find(item => {
      if(item.status !== 'missed') return false;
      const planned = startOfLocalDay(item.iso);
      const now = startOfLocalDay(today);
      if(!planned || !now) return false;
      const daysLate = Math.round((now - planned) / 86400000);
      return daysLate === 1;
    });
    const dueTomorrow = timeline.find(item => item.iso === tomorrow && !item.log);
    const next = timeline.find(item => compareISO(item.iso, today) >= 0 && !item.log);

    if(loggedToday){
      const nextAfterLog = next || timeline.find(item => compareISO(item.iso, today) > 0);
      return { tone:'green', label:'Logged today', title:'Injection logged today', copy:'Your injection log is saved for today. The next planned date is shown below.', nextLabel: nextAfterLog ? fmtDate(nextAfterLog.iso) : '—', nextNote: nextAfterLog ? 'Next planned date' : 'No upcoming planned date' };
    }
    if(dueToday){
      return { tone:'orange', label:'Today', title:'Injection planned today', copy:'This is a planned injection day from your saved rhythm. Log it after it has been done.', nextLabel:'Today', nextNote:fmtDate(today) };
    }
    if(overdue){
      return { tone:'red', label:'Late', title:'Injection appears overdue', copy:`A planned injection date was missed yesterday: ${fmtDate(overdue.iso)}. Log it if it was done, or update the schedule if your rhythm changed.`, nextLabel:fmtDate(overdue.iso), nextNote:'Late for 24 hours only' };
    }
    if(dueTomorrow){
      return { tone:'green', label:'Tomorrow', title:'Injection planned tomorrow', copy:'A planned injection day is coming up tomorrow based on your saved rhythm.', nextLabel:'Tomorrow', nextNote:fmtDate(tomorrow) };
    }
    if(next){
      return { tone:'neutral', label:'Not due yet', title:'No injection due today', copy:`Next planned injection: ${fmtDate(next.iso)}.`, nextLabel:fmtDate(next.iso), nextNote:'Next planned date' };
    }
    return { tone:'neutral', label:'Set rhythm', title:'Injection rhythm needs a date', copy:'Add a next planned date or injection day in onboarding to activate alerts.', nextLabel:'—', nextNote:'Edit schedule' };
  }
  function computeNextDose(){
    const status = computeInjectionStatus();
    return { label: status.nextLabel, note: status.nextNote };
  }
  function renderInjectionAlert(status){
    const el = $('injectionAlert');
    if(!el) return;
    el.className = `injection-alert is-${status.tone || 'neutral'}`;
    el.innerHTML = `
      <span class="injection-alert-dot" aria-hidden="true"></span>
      <div>
        <div class="injection-alert-kicker">Status</div>
        <h3 class="injection-alert-title">${escapeHTML(status.title)}</h3>
        <p class="injection-alert-copy">${escapeHTML(status.copy)}</p>
        <span class="injection-alert-status">${escapeHTML(status.label)}</span>
      </div>
    `;
  }
  function timelineWindow(items){
    const today = dateISO(new Date());
    const past = items.filter(item => compareISO(item.iso, today) <= 0).slice(-6);
    const future = items.filter(item => compareISO(item.iso, today) > 0).slice(0, Math.max(2, 8 - past.length));
    return past.concat(future).slice(-8);
  }
  function renderInjectionTimeline(){
    const wrap = $('injectionTimeline');
    if(!wrap) return;
    const items = timelineWindow(buildInjectionTimelineData());
    if(!items.length){
      wrap.className = 'injection-empty';
      wrap.innerHTML = 'Set your medication rhythm in onboarding to see the injection timeline.';
      return;
    }
    wrap.className = 'injection-timeline';
    const cls = { logged:'is-logged', late_logged:'is-late-logged', missed:'is-missed', due:'is-due', upcoming:'is-upcoming' };
    wrap.innerHTML = items.map(item => `
      <div class="injection-step ${cls[item.status] || ''}" title="${escapeHTML(fmtDate(item.iso))} • ${escapeHTML(item.label)}">
        <div class="injection-marker">${escapeHTML(item.marker)}</div>
        <div class="injection-step-date">${escapeHTML(fmtDate(item.iso).replace(/ \d{4}$/, ''))}</div>
        <div class="injection-step-label">${escapeHTML(item.label)}</div>
      </div>
    `).join('');
  }
  function renderMedication(){
    medSetup = readMedicationSetup(); medLogs = readMedicationLogs();
    setText('medNameValue', medSetup.medication || 'Not set');
    setText('medRhythmValue', frequencyLabel(medSetup.frequency));
    const dayText = medSetup.days.length ? medSetup.days.map(d => DAY_SHORT[Number(d)]).join(', ') : (medSetup.frequency === 'daily' ? 'Every day' : 'No days set');
    setText('medDaysValue', dayText);
    const status = computeInjectionStatus();
    const next = computeNextDose();
    setText('medNextValue', next.label);
    setText('medNextNote', next.note);
    renderInjectionAlert(status);
    renderInjectionTimeline();
    const last = medLogs[medLogs.length - 1];
    setText('lastDosePill', last ? `Last logged: ${fmtDate(last.date)}` : 'No injection logged yet');
    const list = $('doseHistoryList');
    if(list){
      if(!medLogs.length) list.innerHTML = '<div class="recent-row"><div><div class="recent-date">No injection logs yet</div><div class="recent-meta">Tap “Log injection today” after an injection has been done.</div></div></div>';
      else list.innerHTML = medLogs.slice().reverse().slice(0,8).map(row => `<div class="recent-row"><div><div class="recent-date">${fmtDate(row.date)}</div><div class="recent-meta">${escapeHTML(row.medication || medSetup.medication || 'Injection')}</div></div><div class="recent-value">Logged</div><button class="tiny-btn" type="button" data-delete-dose="${escapeHTML(row.id)}">Remove</button></div>`).join('');
    }
  }
  function addDoseLog(date){
    const iso = date || dateISO(new Date());
    medLogs = medLogs.filter(r => r.date !== iso);
    medLogs.push({ id:`dose-${iso}`, date:iso, medication:medSetup.medication || '', source:'progress', createdAt:new Date().toISOString() });
    medLogs = saveMedicationLogs(medLogs);
    renderMedication();
  }
  function bindMedication(){
    const todayBtn = $('markDoseDoneBtn');
    const yBtn = $('markDoseYesterdayBtn');
    if(todayBtn) todayBtn.addEventListener('click', () => addDoseLog(dateISO(new Date())));
    if(yBtn) yBtn.addEventListener('click', () => addDoseLog(dateISO(addLocalDays(new Date(), -1))));
    document.addEventListener('click', (event) => {
      const btn = event.target.closest('[data-delete-dose]'); if(!btn) return;
      const id = btn.getAttribute('data-delete-dose');
      medLogs = saveMedicationLogs(medLogs.filter(r => r.id !== id));
      renderMedication();
    });
  }

  const photoState = { photos: [], tab:'add', angle:'front', before:'', after:'', dbAvailable:true };
  function openDB(){
    return new Promise((resolve, reject) => {
      if(!('indexedDB' in window)) return reject(new Error('IndexedDB unavailable'));
      const req = indexedDB.open('hearty-progress-db', 1);
      req.onupgradeneeded = () => {
        const db = req.result;
        if(!db.objectStoreNames.contains('photos')) db.createObjectStore('photos', { keyPath:'id' });
      };
      req.onsuccess = () => resolve(req.result);
      req.onerror = () => reject(req.error || new Error('IndexedDB failed'));
    });
  }
  async function idbAllPhotos(){
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('photos','readonly');
      const req = tx.objectStore('photos').getAll();
      req.onsuccess = () => resolve(req.result || []);
      req.onerror = () => reject(req.error);
    });
  }
  async function idbPutPhoto(photo){
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('photos','readwrite');
      tx.objectStore('photos').put(photo);
      tx.oncomplete = () => resolve(photo);
      tx.onerror = () => reject(tx.error);
    });
  }
  async function idbDeletePhoto(id){
    const db = await openDB();
    return new Promise((resolve, reject) => {
      const tx = db.transaction('photos','readwrite');
      tx.objectStore('photos').delete(id);
      tx.oncomplete = () => resolve();
      tx.onerror = () => reject(tx.error);
    });
  }
  function fallbackPhotos(){ const raw = readJSON(KEYS.localPhotoFallback, []); return Array.isArray(raw) ? raw : []; }
  function fallbackSave(photos){ writeJSON(KEYS.localPhotoFallback, photos); }
  async function loadPhotos(){
    try { photoState.photos = await idbAllPhotos(); photoState.dbAvailable = true; }
    catch(e){ photoState.photos = fallbackPhotos(); photoState.dbAvailable = false; }
    photoState.photos = photoState.photos.filter(p => p && p.date && ANGLES.includes(p.angle) && p.image).sort((a,b) => String(a.date).localeCompare(String(b.date)) || ANGLES.indexOf(a.angle)-ANGLES.indexOf(b.angle));
    renderPhotos();
  }
  async function savePhoto(photo){
    if(photoState.dbAvailable){ try { await idbPutPhoto(photo); } catch(e){ photoState.dbAvailable = false; } }
    if(!photoState.dbAvailable){ const next = fallbackPhotos().filter(p => p.id !== photo.id); next.push(photo); fallbackSave(next); }
    await loadPhotos();
  }
  async function deletePhoto(id){
    if(photoState.dbAvailable){ try { await idbDeletePhoto(id); } catch(e){} }
    const next = fallbackPhotos().filter(p => p.id !== id); fallbackSave(next);
    await loadPhotos();
  }
  function resizeImage(file){
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = () => reject(reader.error || new Error('Could not read photo'));
      reader.onload = () => {
        const img = new Image();
        img.onerror = () => reject(new Error('Could not load photo'));
        img.onload = () => {
          const maxSide = 1200;
          let { width, height } = img;
          const scale = Math.min(1, maxSide / Math.max(width, height));
          width = Math.round(width * scale); height = Math.round(height * scale);
          const canvas = document.createElement('canvas'); canvas.width = width; canvas.height = height;
          const ctx = canvas.getContext('2d'); ctx.drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', .84));
        };
        img.src = reader.result;
      };
      reader.readAsDataURL(file);
    });
  }
  function groupPhotosByDate(){
    const grouped = new Map();
    photoState.photos.forEach(p => {
      if(!grouped.has(p.date)) grouped.set(p.date, { date:p.date, slots:{} });
      grouped.get(p.date).slots[p.angle] = p;
    });
    return Array.from(grouped.values()).sort((a,b) => String(b.date).localeCompare(String(a.date)));
  }
  function photosForAngle(angle){ return photoState.photos.filter(p => p.angle === angle).sort((a,b) => String(a.date).localeCompare(String(b.date))); }
  function renderPhotoTabs(){
    qsa('[data-photo-tab]').forEach(btn => btn.classList.toggle('active', btn.getAttribute('data-photo-tab') === photoState.tab));
    ['add','gallery','compare'].forEach(tab => { const panel = $(`photoPanel${tab[0].toUpperCase()+tab.slice(1)}`); if(panel) panel.hidden = tab !== photoState.tab; });
  }
  function renderGallery(){
    const wrap = $('photoGallery'); if(!wrap) return;
    const groups = groupPhotosByDate();
    if(!groups.length){ wrap.innerHTML = '<div class="empty-soft">No photos yet. Add a front, side or back photo when you are ready.</div>'; return; }
    wrap.innerHTML = groups.map(group => `
      <div class="gallery-date-group">
        <div class="gallery-date-head"><div class="gallery-date-title">${fmtDate(group.date)}</div><div class="gallery-date-note">${Object.keys(group.slots).length} saved</div></div>
        <div class="gallery-thumbs">
          ${ANGLES.map(angle => {
            const p = group.slots[angle];
            return `<div class="thumb"><div class="thumb-img">${p ? `<img alt="${angle} progress photo from ${fmtDate(group.date)}" src="${p.image}">` : angle}</div><div class="thumb-label"><span>${angle}</span>${p ? `<button class="tiny-btn" data-delete-photo="${escapeHTML(p.id)}" type="button">Remove</button>` : '<span>—</span>'}</div></div>`;
          }).join('')}
        </div>
      </div>
    `).join('');
  }
  function ensureCompareDefaults(){
    const list = photosForAngle(photoState.angle);
    if(!list.length){ photoState.before = ''; photoState.after = ''; return; }
    if(!photoState.after || !list.some(p => p.date === photoState.after)) photoState.after = list[list.length-1].date;
    if(!photoState.before || !list.some(p => p.date === photoState.before)) photoState.before = list[Math.max(0, list.length-2)].date;
    if(photoState.before === photoState.after && list.length > 1) photoState.before = list[list.length-2].date;
  }
  function renderCompare(){
    ensureCompareDefaults();
    const angleSel = $('compareAngle'), beforeSel = $('compareBefore'), afterSel = $('compareAfter');
    if(angleSel) angleSel.value = photoState.angle;
    const list = photosForAngle(photoState.angle);
    const options = list.map(p => `<option value="${escapeHTML(p.date)}">${fmtDate(p.date)}</option>`).join('');
    if(beforeSel){ beforeSel.innerHTML = options || '<option value="">No photos yet</option>'; beforeSel.value = photoState.before; }
    if(afterSel){ afterSel.innerHTML = options || '<option value="">No photos yet</option>'; afterSel.value = photoState.after; }
    const before = list.find(p => p.date === photoState.before);
    const after = list.find(p => p.date === photoState.after);
    setText('compareBeforeLabel', before ? `Before • ${fmtDate(before.date)} • ${photoState.angle}` : 'Before');
    setText('compareAfterLabel', after ? `After • ${fmtDate(after.date)} • ${photoState.angle}` : 'After');
    const beforeFrame = $('compareBeforeFrame'), afterFrame = $('compareAfterFrame');
    if(beforeFrame) beforeFrame.innerHTML = before ? `<img alt="Before ${photoState.angle} photo" src="${before.image}">` : 'No before photo yet.';
    if(afterFrame) afterFrame.innerHTML = after ? `<img alt="After ${photoState.angle} photo" src="${after.image}">` : 'No after photo yet.';
  }
  function renderPhotos(){
    setText('photoCountPill', `${photoState.photos.length} photo${photoState.photos.length === 1 ? '' : 's'}`);
    renderPhotoTabs(); renderGallery(); renderCompare();
  }
  function bindPhotos(){
    const date = $('photoDate'); if(date && !date.value) date.value = todayISO();
    qsa('[data-photo-tab]').forEach(btn => btn.addEventListener('click', () => { photoState.tab = btn.getAttribute('data-photo-tab'); renderPhotos(); }));
    const angle = $('compareAngle'); if(angle) angle.addEventListener('change', () => { photoState.angle = angle.value; photoState.before=''; photoState.after=''; renderCompare(); });
    const before = $('compareBefore'); if(before) before.addEventListener('change', () => { photoState.before = before.value; renderCompare(); });
    const after = $('compareAfter'); if(after) after.addEventListener('change', () => { photoState.after = after.value; renderCompare(); });
    const form = $('photoAddForm');
    if(form) form.addEventListener('submit', async (event) => {
      event.preventDefault();
      const file = $('photoFile').files && $('photoFile').files[0];
      if(!file){ setText('photoSaveState','Choose a photo first.'); return; }
      setText('photoSaveState','Saving photo locally…');
      try {
        const image = await resizeImage(file);
        const dateValue = $('photoDate').value || todayISO();
        const angleValue = $('photoAngle').value || 'front';
        await savePhoto({ id:`${dateValue}-${angleValue}-${Date.now()}`, date:dateValue, angle:angleValue, image, note:$('photoNote').value || '', createdAt:new Date().toISOString(), storage:photoState.dbAvailable ? 'indexeddb' : 'localstorage' });
        form.reset(); if($('photoDate')) $('photoDate').value = todayISO();
        setText('photoSaveState','Photo saved privately on this device.');
        photoState.tab = 'gallery'; renderPhotos();
      } catch(e){ setText('photoSaveState','Could not save this photo. Try a smaller image.'); }
    });
    document.addEventListener('click', async (event) => {
      const btn = event.target.closest('[data-delete-photo]'); if(!btn) return;
      await deletePhoto(btn.getAttribute('data-delete-photo'));
      setText('photoSaveState','Photo removed.');
    });
  }

  function weekKey(){
    const now = new Date();
    const first = new Date(now.getFullYear(), 0, 1);
    const dayMs = 86400000;
    const week = Math.ceil((((now - first) / dayMs) + first.getDay() + 1) / 7);
    return `${now.getFullYear()}-W${String(week).padStart(2,'0')}`;
  }
  function readWeekly(){ return readJSON(KEYS.weeklyCheckins, {}) || {}; }
  function renderWeekly(){
    const data = readWeekly()[weekKey()] || {};
    qsa('[data-weekly-check]').forEach(input => { input.checked = !!(data.checks && data.checks[input.getAttribute('data-weekly-check')]); });
    const note = $('weeklyNote'); if(note) note.value = data.note || '';
    setText('weeklySaveState', data.updatedAt ? `Saved ${fmtDate(String(data.updatedAt).slice(0,10))}` : '');
  }
  function bindWeekly(){
    const form = $('weeklyCheckinForm'); if(!form) return;
    form.addEventListener('submit', event => {
      event.preventDefault();
      const all = readWeekly();
      const checks = {};
      qsa('[data-weekly-check]').forEach(input => checks[input.getAttribute('data-weekly-check')] = !!input.checked);
      all[weekKey()] = { checks, note: $('weeklyNote').value || '', updatedAt: new Date().toISOString() };
      writeJSON(KEYS.weeklyCheckins, all);
      setText('weeklySaveState', 'Weekly check-in saved.');
    });
  }

  function init(){
    renderWeight(); bindWeight();
    renderMedication(); bindMedication();
    bindPhotos(); loadPhotos();
    renderWeekly(); bindWeekly();
  }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', init);
  else init();
})();

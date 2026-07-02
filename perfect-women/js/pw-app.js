(function () {
  'use strict';

  const $ = (selector) => document.querySelector(selector);
  const $$ = (selector) => Array.from(document.querySelectorAll(selector));
  let selectedDuration = 20;
  let activeRecipeFilter = 'All';
  let compareAngle = 'front';
  let compareDateAId = null;
  let compareDateBId = null;
  let mealSpinRotation = 0;
  let mealIdeasVisible = false;

  const pageTitles = {
    home: 'Today',
    track: 'Track',
    progress: 'Progress',
    photos: 'Photos',
    recipes: 'Recipes',
    settings: 'Settings'
  };


  const ICONS = {
    settings: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.04.04a2.1 2.1 0 0 1-2.97 2.97l-.04-.04a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.08 1.65V21a2.1 2.1 0 0 1-4.2 0v-.06A1.8 1.8 0 0 0 8.4 19.3a1.8 1.8 0 0 0-2 .36l-.04.04a2.1 2.1 0 0 1-2.97-2.97l.04-.04a1.8 1.8 0 0 0 .36-2 1.8 1.8 0 0 0-1.65-1.08H2.1a2.1 2.1 0 0 1 0-4.2h.06A1.8 1.8 0 0 0 3.8 8.4a1.8 1.8 0 0 0-.36-2l-.04-.04A2.1 2.1 0 0 1 6.37 3.4l.04.04a1.8 1.8 0 0 0 2 .36 1.8 1.8 0 0 0 1.08-1.65V2.1a2.1 2.1 0 0 1 4.2 0v.06A1.8 1.8 0 0 0 14.8 3.8a1.8 1.8 0 0 0 2-.36l.04-.04a2.1 2.1 0 0 1 2.97 2.97l-.04.04a1.8 1.8 0 0 0-.36 2c.26.67.9 1.1 1.62 1.1h.07a2.1 2.1 0 0 1 0 4.2h-.06a1.8 1.8 0 0 0-1.65 1.08z"></path>',
    water: '<path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z"></path><path d="M9.5 14.6a2.9 2.9 0 0 0 4.4 2.4"></path>',
    walk: '<circle cx="12" cy="5" r="2"></circle><path d="M10.5 9.2 8.8 13l-2.3 2.2"></path><path d="M11.2 9.2h2.2l2.1 3.2"></path><path d="M11.6 13.2 13 16l.8 4"></path><path d="M9.2 20l2.3-3.8"></path>',
    check: '<path d="M20 6 9 17l-5-5"></path>',
    workout: '<path d="M3 9v6"></path><path d="M7 7v10"></path><path d="M17 7v10"></path><path d="M21 9v6"></path><path d="M7 12h10"></path>',
    chart: '<path d="M4 19V5"></path><path d="M4 19h16"></path><path d="m7 15 3-4 3 2 5-7"></path><path d="M18 6h-4"></path><path d="M18 6v4"></path>',
    camera: '<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.7l1.1-1.6h5.4L15.8 6h1.7A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8z"></path><circle cx="12" cy="12.5" r="3.2"></circle>',
    upload: '<path d="M12 16V5"></path><path d="m7 10 5-5 5 5"></path><path d="M5 19h14"></path>',
    home: '<path d="m3 11 9-8 9 8"></path><path d="M5.5 10.5V21h13V10.5"></path><path d="M9.5 21v-6h5v6"></path>',
    plate: '<circle cx="12" cy="12" r="7"></circle><circle cx="12" cy="12" r="3.5"></circle><path d="M3.5 4.5v15"></path><path d="M20.5 4.5v15"></path>',
    spark: '<path d="M12 2.8 13.7 8l5.4 1.4-5.4 1.4L12 16l-1.7-5.2-5.4-1.4L10.3 8 12 2.8z"></path><path d="M18.5 14.5l.8 2.3 2.3.7-2.3.7-.8 2.3-.8-2.3-2.3-.7 2.3-.7.8-2.3z"></path><path d="M5.5 15.5l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6.6-1.8z"></path>'
  };

  function icon(name) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.check}</svg>`;
  }

  function renderStaticIcons() {
    $$('[data-icon]').forEach((el) => {
      el.innerHTML = icon(el.dataset.icon);
    });
  }

  function state() { return window.PWStore.getState(); }
  function fmtDate(dateKey) {
    if (!dateKey) return '—';
    const [y, m, d] = dateKey.split('-').map(Number);
    return new Date(y, m - 1, d).toLocaleDateString(undefined, { day: 'numeric', month: 'short', year: 'numeric' });
  }
  function pct(value, target) {
    if (!target) return 0;
    return Math.min(100, Math.round((value / target) * 100));
  }
  function toast(message) {
    const existing = $('.toast');
    if (existing) existing.remove();
    const el = document.createElement('div');
    el.className = 'toast';
    el.textContent = message;
    document.body.appendChild(el);
    setTimeout(() => el.remove(), 2200);
  }


  function setOnboardingVisible(visible) {
    const overlay = $('#onboardingOverlay');
    if (!overlay) return;
    overlay.classList.toggle('active', !!visible);
    overlay.setAttribute('aria-hidden', visible ? 'false' : 'true');
  }

  function showOnboarding() {
    const s = state();
    $('#onboardName').value = s.client.name || '';
    const weights = window.PWStore.sortedWeights();
    const firstWeight = s.client.startingWeightKg || weights[0]?.kg || '';
    $('#onboardWeight').value = firstWeight || '';
    setOnboardingVisible(true);
  }

  function maybeShowOnboarding() {
    const s = state();
    if (!s.client.onboarded) showOnboarding();
  }

  function navigate(page) {
    const target = pageTitles[page] ? page : 'home';
    $$('.page').forEach((el) => el.classList.toggle('active', el.dataset.page === target));
    $$('.nav-btn').forEach((el) => el.classList.toggle('active', el.dataset.nav === target));
    $('#pageTitle').textContent = pageTitles[target];
    if (location.hash !== `#${target}`) history.replaceState(null, '', `#${target}`);
    renderAll();
  }

  function todayStats() {
    const s = state();
    const today = window.PWStore.todayKey();
    const water = s.logs.water[today] || { ml: 0, entries: [] };
    const movement = s.logs.movement[today] || null;
    const weight = s.logs.weights[today] || null;
    return { s, today, water, movement, weight };
  }

  function renderHome() {
    const { s, water, movement, weight } = todayStats();
    const name = s.client.name ? s.client.name.split(' ')[0] : '';
    $('#homeGreeting').textContent = name ? `Welcome back, ${name}` : 'Welcome back';

    const target = s.settings.waterTargetMl;
    const waterPercent = pct(water.ml, target);
    $('#homeWaterStat').textContent = `${water.ml.toLocaleString()} / ${target.toLocaleString()} ml`;
    $('#homeWaterMeter').style.width = `${waterPercent}%`;

    $('#homeMovementStat').textContent = movement && movement.done ? 'Done' : 'Not done';
    $('#homeMovementDetail').textContent = movement && movement.done
      ? `${movement.type || 'Movement'} • ${movement.duration || 0} min`
      : 'A walk or simple movement counts.';

    const now = new Date();
    const isMonday = now.getDay() === 1;
    if (isMonday && !weight) {
      $('#weighInTitle').textContent = 'Weigh-in due today';
      $('#weighInText').textContent = 'Monday morning is your main scale check. Log it once, then move on with your week.';
    } else if (isMonday && weight) {
      $('#weighInTitle').textContent = 'Weigh-in complete';
      $('#weighInText').textContent = `Saved ${weight.kg} kg for today.`;
    } else {
      $('#weighInTitle').textContent = 'Next weigh-in: Monday';
      $('#weighInText').textContent = 'We track weekly trend instead of daily scale noise.';
    }

    renderWeekStrip();
  }

  function renderWeekStrip() {
    const s = state();
    const keys = window.PWStore.weekKeys();
    const dayLabels = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];
    const html = keys.map((key, index) => {
      const water = s.logs.water[key]?.ml || 0;
      const movement = s.logs.movement[key]?.done;
      const waterDone = water >= s.settings.waterTargetMl;
      const movementDone = !!movement;
      const done = waterDone || movementDone;
      const icons = `
        <span class="day-icons">
          <span class="day-icon ${waterDone ? 'on' : ''}" title="Water">${icon('water')}</span>
          <span class="day-icon ${movementDone ? 'on' : ''}" title="Movement">${icon('walk')}</span>
        </span>`;
      return `<div class="day-dot ${done ? 'done' : ''}"><strong>${dayLabels[index]}</strong>${icons}</div>`;
    }).join('');
    $('#homeWeekStrip').innerHTML = html;
  }

  function renderTrack() {
    const { s, water, movement } = todayStats();
    const target = s.settings.waterTargetMl;
    const waterPercent = pct(water.ml, target);
    $('#trackWaterTitle').textContent = `${water.ml.toLocaleString()} ml`;
    $('#trackWaterSub').textContent = `Daily target: ${target.toLocaleString()} ml`;
    $('#trackWaterMeter').style.width = `${waterPercent}%`;
    $('#waterRing').textContent = `${waterPercent}%`;
    $('#waterRing').style.setProperty('--pct', `${waterPercent * 3.6}deg`);

    $('#movementSavedStatus').textContent = movement && movement.done
      ? `Saved today: ${movement.type || 'Movement'} • ${movement.duration || 0} min${movement.notes ? ' • ' + movement.notes : ''}`
      : 'No movement saved for today yet.';
    $('#movementSavedStatus').classList.toggle('done', !!(movement && movement.done));

    if (movement) {
      selectedDuration = movement.duration || selectedDuration;
      $('#movementType').value = movement.type || 'Walk';
      $('#movementNotes').value = movement.notes || '';
    }
    $$('#movementOptions button').forEach((btn) => {
      btn.classList.toggle('active', Number(btn.dataset.duration) === Number(selectedDuration));
    });

    $('#weightDate').value = window.PWStore.todayKey();
  }

  function renderProgress() {
    const s = state();
    const weights = window.PWStore.sortedWeights();
    const first = weights[0];
    const latest = weights[weights.length - 1];
    $('#startWeight').textContent = first ? `${first.kg.toFixed(1)} kg` : '—';
    $('#latestWeight').textContent = latest ? `${latest.kg.toFixed(1)} kg` : '—';
    $('#weighInCount').textContent = String(weights.length);
    if (first && latest) {
      const change = latest.kg - first.kg;
      $('#totalChange').textContent = `${change > 0 ? '+' : ''}${change.toFixed(1)} kg`;
    } else {
      $('#totalChange').textContent = '—';
    }
    drawWeightChart(weights);
    renderProgressSummary(s);
    renderMovementGraph(s);
    renderPhotoCompare();
  }

  function drawWeightChart(weights) {
    const canvas = $('#weightChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.045)';
    ctx.fillRect(0, 0, w, h);

    $('#chartEmpty').style.display = weights.length < 2 ? 'block' : 'none';
    if (weights.length < 2) return;

    const values = weights.map((item) => item.kg);
    const min = Math.min(...values) - 1;
    const max = Math.max(...values) + 1;
    const pad = 36;
    const xFor = (i) => pad + (i / (weights.length - 1)) * (w - pad * 2);
    const yFor = (kg) => h - pad - ((kg - min) / (max - min)) * (h - pad * 2);

    ctx.strokeStyle = 'rgba(255,255,255,0.12)';
    ctx.lineWidth = 1;
    for (let i = 0; i < 4; i++) {
      const y = pad + i * ((h - pad * 2) / 3);
      ctx.beginPath();
      ctx.moveTo(pad, y);
      ctx.lineTo(w - pad, y);
      ctx.stroke();
    }

    const gradient = ctx.createLinearGradient(0, 0, w, 0);
    gradient.addColorStop(0, '#e80075');
    gradient.addColorStop(1, '#d9a72e');
    ctx.strokeStyle = gradient;
    ctx.lineWidth = 5;
    ctx.lineCap = 'round';
    ctx.lineJoin = 'round';
    ctx.beginPath();
    weights.forEach((item, i) => {
      const x = xFor(i);
      const y = yFor(item.kg);
      if (i === 0) ctx.moveTo(x, y); else ctx.lineTo(x, y);
    });
    ctx.stroke();

    weights.forEach((item, i) => {
      const x = xFor(i);
      const y = yFor(item.kg);
      ctx.fillStyle = '#ffffff';
      ctx.beginPath();
      ctx.arc(x, y, 6, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#b8bbd0';
      ctx.font = '18px system-ui';
      ctx.fillText(String(item.kg.toFixed(1)), Math.min(x + 8, w - 78), y - 8);
    });
  }

  function renderProgressSummary(s) {
    const keys = window.PWStore.weekKeys();
    const waterDays = keys.filter((key) => (s.logs.water[key]?.ml || 0) >= s.settings.waterTargetMl).length;
    const movementDays = keys.filter((key) => s.logs.movement[key]?.done).length;
    const waterTotal = keys.reduce((sum, key) => sum + (s.logs.water[key]?.ml || 0), 0);
    const waterAvg = Math.round(waterTotal / 7);
    $('#progressSummary').innerHTML = `
      <div class="summary-row"><span>Water target days</span><strong>${waterDays}/7</strong></div>
      <div class="summary-row"><span>Average water</span><strong>${waterAvg.toLocaleString()} ml</strong></div>
      <div class="summary-row"><span>Movement days</span><strong>${movementDays}/7</strong></div>
      <div class="summary-row"><span>Weigh-in rhythm</span><strong>Monday</strong></div>
    `;
  }

  function dateKeyFromDate(date) {
    return window.PWStore.todayKey(date);
  }

  function addDays(date, amount) {
    const next = new Date(date);
    next.setDate(next.getDate() + amount);
    return next;
  }

  function movementWeekKeys(weekOffset = 0) {
    const start = window.PWStore.mondayStart(new Date());
    start.setDate(start.getDate() + weekOffset * 7);
    return Array.from({ length: 7 }, (_, index) => dateKeyFromDate(addDays(start, index)));
  }

  function cleanMovementType(type) {
    const raw = (type || 'Walk').trim();
    if (raw === 'Other') return 'General movement';
    return raw;
  }

  function movementTotalsForKeys(s, keys) {
    return keys.reduce((totals, key) => {
      const entry = s.logs.movement?.[key];
      if (!entry || !entry.done) return totals;
      const type = cleanMovementType(entry.type);
      totals[type] = (totals[type] || 0) + Number(entry.duration || 0);
      return totals;
    }, {});
  }

  function renderMovementGraph(s) {
    const canvas = $('#movementChart');
    const empty = $('#movementChartEmpty');
    const list = $('#movementDeltaList');
    const summary = $('#movementChartSummary');
    if (!canvas || !empty || !list || !summary) return;

    const currentTotals = movementTotalsForKeys(s, movementWeekKeys(0));
    const previousTotals = movementTotalsForKeys(s, movementWeekKeys(-1));
    const preferredTypes = ['Walk', 'Home workout', 'Gym session', 'Mobility', 'General movement'];
    const allTypes = Array.from(new Set([...preferredTypes, ...Object.keys(currentTotals), ...Object.keys(previousTotals)]));
    const rows = allTypes
      .map((type) => ({
        type,
        current: currentTotals[type] || 0,
        previous: previousTotals[type] || 0
      }))
      .filter((row) => row.current > 0 || row.previous > 0);

    const currentTotal = rows.reduce((sum, row) => sum + row.current, 0);
    const previousTotal = rows.reduce((sum, row) => sum + row.previous, 0);
    const totalDelta = currentTotal - previousTotal;
    const deltaText = totalDelta === 0 ? 'same as last week' : `${totalDelta > 0 ? '+' : ''}${totalDelta} min vs last week`;
    summary.textContent = rows.length ? `This week: ${currentTotal} min • ${deltaText}` : 'Save movement this week to see your trend.';
    empty.style.display = rows.length ? 'none' : 'block';

    drawMovementBarChart(rows);
    renderMovementDeltaList(rows, list);
  }

  function renderMovementDeltaList(rows, container) {
    if (!rows.length) {
      container.innerHTML = '';
      return;
    }
    container.innerHTML = rows.map((row) => {
      const delta = row.current - row.previous;
      const cls = delta > 0 ? 'up' : delta < 0 ? 'down' : 'same';
      const label = delta > 0 ? `+${delta} min` : delta < 0 ? `${delta} min` : 'same';
      return `
        <div class="summary-row movement-row">
          <span><strong>${escapeHtml(row.type)}</strong><br><small>${row.current} min this week • ${row.previous} min last week</small></span>
          <strong class="delta-pill ${cls}">${label}</strong>
        </div>
      `;
    }).join('');
  }

  function drawMovementBarChart(rows) {
    const canvas = $('#movementChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.045)';
    ctx.fillRect(0, 0, w, h);

    if (!rows.length) return;

    const max = Math.max(30, ...rows.map((row) => Math.max(row.current, row.previous)));
    const left = 150;
    const right = 34;
    const top = 34;
    const bottom = 34;
    const plotW = w - left - right;
    const rowH = (h - top - bottom) / rows.length;
    const barH = Math.min(24, Math.max(15, rowH * 0.38));

    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#b8bbd0';
    ctx.font = '13px system-ui';
    ctx.textAlign = 'center';
    for (let i = 0; i <= 3; i += 1) {
      const x = left + (plotW * i) / 3;
      ctx.beginPath();
      ctx.moveTo(x, top - 8);
      ctx.lineTo(x, h - bottom + 6);
      ctx.stroke();
      ctx.fillText(`${Math.round((max * i) / 3)}m`, x, h - 10);
    }

    rows.forEach((row, index) => {
      const y = top + index * rowH + rowH / 2;
      const currentW = (row.current / max) * plotW;
      const prevX = left + (row.previous / max) * plotW;
      const delta = row.current - row.previous;
      const deltaLabel = delta === 0 ? 'same' : `${delta > 0 ? '+' : ''}${delta}m`;

      ctx.textAlign = 'left';
      ctx.fillStyle = '#f8fafc';
      ctx.font = '700 14px system-ui';
      ctx.fillText(row.type, 14, y + 5);

      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      roundRect(ctx, left, y - barH / 2, plotW, barH, 9);
      ctx.fill();

      if (currentW > 0) {
        const gradient = ctx.createLinearGradient(left, 0, left + plotW, 0);
        gradient.addColorStop(0, '#e80075');
        gradient.addColorStop(1, '#d9a72e');
        ctx.fillStyle = gradient;
        roundRect(ctx, left, y - barH / 2, Math.max(currentW, 8), barH, 9);
        ctx.fill();
      }

      if (row.previous > 0) {
        ctx.strokeStyle = 'rgba(255,255,255,0.78)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(prevX, y - barH * 0.85);
        ctx.lineTo(prevX, y + barH * 0.85);
        ctx.stroke();
      }

      ctx.fillStyle = delta > 0 ? '#6ee7b7' : delta < 0 ? '#fca5a5' : '#fde68a';
      ctx.font = '800 13px system-ui';
      ctx.textAlign = 'right';
      ctx.fillText(`${row.current}m • ${deltaLabel}`, w - 14, y + 5);
    });
  }

  function roundRect(ctx, x, y, width, height, radius) {
    const r = Math.min(radius, width / 2, height / 2);
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + width, y, x + width, y + height, r);
    ctx.arcTo(x + width, y + height, x, y + height, r);
    ctx.arcTo(x, y + height, x, y, r);
    ctx.arcTo(x, y, x + width, y, r);
    ctx.closePath();
  }


  function renderMovementHistory(s) {
    const container = $('#movementHistory');
    if (!container) return;
    const entries = Object.values(s.logs.movement || {})
      .filter((entry) => entry && entry.done)
      .sort((a, b) => b.date.localeCompare(a.date))
      .slice(0, 10);

    if (!entries.length) {
      container.innerHTML = '<p class="muted">No movement saved yet. Once a walk or movement session is ticked off, it will appear here.</p>';
      return;
    }

    container.innerHTML = entries.map((entry) => `
      <div class="summary-row movement-row">
        <span><strong>${fmtDate(entry.date)}</strong><br><small>${escapeHtml(entry.type || 'Movement')}${entry.notes ? ' • ' + escapeHtml(entry.notes) : ''}</small></span>
        <strong>${entry.duration || 0} min</strong>
      </div>
    `).join('');
  }


  function sortedPhotoSets(s) {
    return (s.photos.sets || [])
      .slice()
      .sort((a, b) => a.date.localeCompare(b.date));
  }

  async function getPhotoUrl(set, kind) {
    const key = set?.photoKeys?.[kind];
    if (!key) return '';
    const blob = await window.PWStore.getPhoto(key);
    return blob ? URL.createObjectURL(blob) : '';
  }

  function renderComparePlaceholder(frame, text) {
    frame.innerHTML = `<div class="compare-placeholder"><span class="ui-icon">${icon('camera')}</span><strong>${escapeHtml(text)}</strong></div>`;
  }

  async function renderPhotoCompare() {
    const s = state();
    const sets = sortedPhotoSets(s);
    const empty = $('#compareEmpty');
    const panel = $('#photoComparePanel');
    const selectA = $('#compareDateA');
    const selectB = $('#compareDateB');
    const frameA = $('#compareFrameA');
    const frameB = $('#compareFrameB');
    const labelA = $('#compareLabelA');
    const labelB = $('#compareLabelB');
    const hint = $('#compareHint');
    if (!empty || !panel || !selectA || !selectB || !frameA || !frameB) return;

    if (!sets.length) {
      empty.style.display = 'grid';
      panel.hidden = true;
      return;
    }

    empty.style.display = 'none';
    panel.hidden = false;

    if (!compareDateAId || !sets.some((set) => set.id === compareDateAId)) compareDateAId = sets[0].id;
    if (!compareDateBId || !sets.some((set) => set.id === compareDateBId)) compareDateBId = sets.length > 1 ? sets[sets.length - 1].id : sets[0].id;

    const options = sets.map((set) => `<option value="${escapeHtml(set.id)}">${fmtDate(set.date)}</option>`).join('');
    selectA.innerHTML = options;
    selectB.innerHTML = options;
    selectA.value = compareDateAId;
    selectB.value = compareDateBId;

    $$('.angle-btn').forEach((btn) => btn.classList.toggle('active', btn.dataset.compareAngle === compareAngle));

    const setA = sets.find((set) => set.id === compareDateAId) || sets[0];
    const setB = sets.find((set) => set.id === compareDateBId) || sets[sets.length - 1] || sets[0];
    const angleTitle = compareAngle.charAt(0).toUpperCase() + compareAngle.slice(1);
    if (labelA) labelA.textContent = `${fmtDate(setA.date)} • ${angleTitle}`;
    if (labelB) labelB.textContent = `${fmtDate(setB.date)} • ${angleTitle}`;

    const [urlA, urlB] = await Promise.all([getPhotoUrl(setA, compareAngle), getPhotoUrl(setB, compareAngle)]);
    if (urlA) frameA.innerHTML = `<img src="${urlA}" alt="${angleTitle} progress photo from ${fmtDate(setA.date)}" />`;
    else renderComparePlaceholder(frameA, `No ${compareAngle} photo`);

    if (urlB) frameB.innerHTML = `<img src="${urlB}" alt="${angleTitle} progress photo from ${fmtDate(setB.date)}" />`;
    else renderComparePlaceholder(frameB, `No ${compareAngle} photo`);

    if (hint) {
      hint.textContent = sets.length === 1
        ? 'Only one photo date saved so far. Add another set later to compare change over time.'
        : 'For the best comparison, use the same angle, lighting and distance each time.';
    }
  }

  async function renderLatestPhotoPreview() {
    const s = state();
    const set = s.photos.sets[0];
    const container = $('#latestPhotoPreview');
    if (!set) {
      container.className = 'photo-preview-empty';
      container.innerHTML = 'No photo set saved yet.';
      return;
    }
    container.className = 'photo-grid';
    container.innerHTML = await photoTilesHtml(set, true);
  }

  async function photoTilesHtml(set, compact = false) {
    const kinds = ['front', 'side', 'back'];
    const chunks = [];
    for (const kind of kinds) {
      const key = set.photoKeys?.[kind];
      if (!key) {
        chunks.push(`<div class="photo-tile">${kind}</div>`);
        continue;
      }
      const blob = await window.PWStore.getPhoto(key);
      const url = blob ? URL.createObjectURL(blob) : '';
      chunks.push(`<div class="photo-tile">${url ? `<img src="${url}" alt="${kind} progress photo" />` : kind}</div>`);
    }
    return chunks.join('');
  }

  async function renderPhotos() {
    $('#photoDate').value = window.PWStore.todayKey();
    const s = state();
    const gallery = $('#photoGallery');
    if (!s.photos.sets.length) {
      gallery.innerHTML = `<article class="card photo-set"><p class="muted">No photo sets saved yet.</p></article>`;
      return;
    }
    const cards = [];
    for (const set of s.photos.sets) {
      cards.push(`
        <article class="card photo-set">
          <div class="section-heading">
            <div>
              <p class="eyebrow gold">${fmtDate(set.date)}</p>
              <h3>Progress photo set</h3>
              ${set.notes ? `<p class="muted small">${escapeHtml(set.notes)}</p>` : ''}
            </div>
            <button class="danger" data-delete-photo-set="${set.id}">Delete</button>
          </div>
          <div class="photo-grid">${await photoTilesHtml(set)}</div>
        </article>
      `);
    }
    gallery.innerHTML = cards.join('');
    $$('[data-delete-photo-set]').forEach((btn) => {
      btn.addEventListener('click', async () => {
        if (!confirm('Delete this photo set from this device?')) return;
        await window.PWStore.deletePhotoSet(btn.dataset.deletePhotoSet);
        toast('Photo set deleted');
        renderAll();
      });
    });
  }

  function escapeHtml(text) {
    return String(text).replace(/[&<>"]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
  }


  function mealIdeas() {
    return window.PW_MEAL_IDEAS || {};
  }

  function mealTypeLabel(type) {
    return { breakfast: 'Breakfast', snack: 'Snack', lunch: 'Lunch', dinner: 'Dinner' }[type] || 'Meal';
  }

  function currentMealType() {
    return $('#mealGeneratorType')?.value || 'breakfast';
  }

  function randomFrom(items) {
    return items[Math.floor(Math.random() * items.length)];
  }

  function renderMealIdea(idea, type) {
    const result = $('#mealIdeaResult');
    if (!result || !idea) return;
    result.innerHTML = `
      <p class="eyebrow pink">${mealTypeLabel(type)} idea</p>
      <h3>${escapeHtml(idea.title)}</h3>
      <p class="meal-structure">${escapeHtml(idea.structure || '')}</p>
      <p class="muted">${escapeHtml(idea.idea || '')}</p>
      <div class="recipe-tags">${(idea.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
      <p class="small muted"><strong>Coach note:</strong> ${escapeHtml(idea.note || 'Keep portions aligned with the client plan.')}</p>
    `;
  }

  function renderMealIdeaList() {
    const list = $('#mealIdeaList');
    const btn = $('#showAllMealIdeasBtn');
    if (!list || !btn) return;
    const type = currentMealType();
    const items = mealIdeas()[type] || [];
    list.hidden = !mealIdeasVisible;
    btn.textContent = mealIdeasVisible ? 'Hide all ideas' : 'Show all ideas';
    if (!mealIdeasVisible) return;
    list.innerHTML = items.map((idea) => `
      <div class="meal-option-card">
        <div>
          <p class="eyebrow gold">${mealTypeLabel(type)}</p>
          <h3>${escapeHtml(idea.title)}</h3>
          <p class="small muted">${escapeHtml(idea.idea)}</p>
        </div>
        <div class="recipe-tags">${(idea.tags || []).map((tag) => `<span class="tag">${escapeHtml(tag)}</span>`).join('')}</div>
      </div>
    `).join('');
  }

  function resetMealGenerator() {
    const result = $('#mealIdeaResult');
    if (result) {
      result.innerHTML = `
        <p class="eyebrow pink">${mealTypeLabel(currentMealType())}</p>
        <h3>Spin for a fresh idea.</h3>
        <p class="muted">Use this when a client needs a quick option without opening the full recipe book.</p>
      `;
    }
    renderMealIdeaList();
  }

  function spinMealWheel() {
    const type = currentMealType();
    const items = mealIdeas()[type] || [];
    if (!items.length) {
      toast('No meal ideas loaded yet');
      return;
    }
    const wheel = $('#mealWheel');
    const label = $('#mealWheelLabel');
    const btn = $('#spinMealBtn');
    const idea = randomFrom(items);
    mealSpinRotation += 1440 + Math.floor(Math.random() * 720);
    if (wheel) {
      wheel.classList.add('spinning');
      wheel.style.setProperty('--spin', `${mealSpinRotation}deg`);
    }
    if (label) label.textContent = 'SPINNING';
    if (btn) btn.disabled = true;
    setTimeout(() => {
      if (label) label.textContent = mealTypeLabel(type).toUpperCase();
      if (wheel) wheel.classList.remove('spinning');
      if (btn) btn.disabled = false;
      renderMealIdea(idea, type);
      toast('Meal idea generated');
    }, 1900);
  }

  function renderRecipes() {
    const priorityTags = ['Fun Meals', 'Sunday Meals', 'Casserole', 'Braai', 'Fakeaway', 'Family Meals', 'Comfort Meals'];
    const tagSet = new Set(window.PW_RECIPES.flatMap((r) => r.tags));
    const priority = priorityTags.filter((tag) => tagSet.has(tag));
    const remaining = Array.from(tagSet).filter((tag) => !priorityTags.includes(tag)).sort();
    const allTags = ['All', ...priority, ...remaining];
    $('#recipeFilters').innerHTML = allTags.map((tag) => `<button class="${tag === activeRecipeFilter ? 'active' : ''}" data-recipe-filter="${tag}">${tag}</button>`).join('');
    $$('[data-recipe-filter]').forEach((btn) => btn.addEventListener('click', () => {
      activeRecipeFilter = btn.dataset.recipeFilter;
      renderRecipes();
    }));

    const q = ($('#recipeSearch').value || '').trim().toLowerCase();
    const recipes = window.PW_RECIPES.filter((recipe) => {
      const matchesFilter = activeRecipeFilter === 'All' || recipe.tags.includes(activeRecipeFilter);
      const haystack = `${recipe.title} ${recipe.tags.join(' ')} ${recipe.summary}`.toLowerCase();
      return matchesFilter && (!q || haystack.includes(q));
    });

    $('#recipeList').innerHTML = recipes.length ? recipes.map((recipe) => `
      <article class="card recipe-card">
        <div>
          <p class="eyebrow pink">${recipe.tags[0] || 'Recipe'}</p>
          <h3>${recipe.title}</h3>
          <p class="muted">${recipe.summary}</p>
        </div>
        <div class="macro-row">
          <span><strong>${recipe.calories}</strong><br>kcal</span>
          <span><strong>${recipe.protein}g</strong><br>protein</span>
          <span><strong>${recipe.carbs}g</strong><br>carbs</span>
          <span><strong>${recipe.fat}g</strong><br>fat</span>
        </div>
        <div class="recipe-tags">${recipe.tags.map((tag) => `<span class="tag">${tag}</span>`).join('')}</div>
        <button class="secondary full" data-open-recipe="${recipe.id}">View recipe</button>
      </article>
    `).join('') : `<article class="card"><p class="muted">No recipes match your search.</p></article>`;

    $$('[data-open-recipe]').forEach((btn) => btn.addEventListener('click', () => openRecipe(btn.dataset.openRecipe)));
  }

  function openRecipe(id) {
    const recipe = window.PW_RECIPES.find((item) => item.id === id);
    if (!recipe) return;
    $('#recipeModalContent').innerHTML = `
      <p class="eyebrow pink">${recipe.tags.join(' • ')}</p>
      <h2>${recipe.title}</h2>
      <p class="muted">${recipe.summary}</p>
      <div class="macro-row">
        <span><strong>${recipe.calories}</strong><br>kcal</span>
        <span><strong>${recipe.protein}g</strong><br>protein</span>
        <span><strong>${recipe.carbs}g</strong><br>carbs</span>
        <span><strong>${recipe.fat}g</strong><br>fat</span>
      </div>
      <h3>Ingredients</h3>
      <ul>${recipe.ingredients.map((item) => `<li>${item}</li>`).join('')}</ul>
      <h3>Method</h3>
      <ol>${recipe.method.map((item) => `<li>${item}</li>`).join('')}</ol>
      <p class="muted"><strong>Plan note:</strong> ${recipe.planNote}</p>
    `;
    $('#recipeModal').showModal();
  }

  function renderSettings() {
    const s = state();
    $('#clientName').value = s.client.name || '';
    $('#waterTarget').value = s.settings.waterTargetMl || 2000;
  }


  function photoFile(kind) {
    const cap = kind.charAt(0).toUpperCase() + kind.slice(1);
    return $(`#photo${cap}Camera`)?.files?.[0] || $(`#photo${cap}`)?.files?.[0] || null;
  }

  function updatePhotoSelected(kind) {
    const cap = kind.charAt(0).toUpperCase() + kind.slice(1);
    const file = photoFile(kind);
    const label = $(`#photo${cap}Selected`);
    if (label) label.textContent = file ? `Selected: ${file.name || 'photo'}` : 'No photo chosen';
  }

  function resetPhotoInputs() {
    ['FrontCamera', 'SideCamera', 'BackCamera', 'Front', 'Side', 'Back'].forEach((id) => {
      const input = $(`#photo${id}`);
      if (input) input.value = '';
    });
    ['front', 'side', 'back'].forEach(updatePhotoSelected);
  }

  async function renderAll() {
    renderHome();
    renderTrack();
    renderProgress();
    if ($('#page-photos').classList.contains('active')) await renderPhotos();
    if ($('#page-recipes').classList.contains('active')) {
      renderRecipes();
      renderMealIdeaList();
    }
    renderSettings();
  }

  function bindEvents() {
    $$('[data-nav]').forEach((btn) => btn.addEventListener('click', () => navigate(btn.dataset.nav)));
    $('#quickSettings').addEventListener('click', () => navigate('settings'));

    $$('[data-add-water]').forEach((btn) => btn.addEventListener('click', () => {
      window.PWStore.addWater(Number(btn.dataset.addWater));
      toast(`Added ${btn.dataset.addWater} ml water`);
      renderAll();
    }));
    $('#undoWaterBtn').addEventListener('click', () => {
      window.PWStore.undoWater();
      toast('Last water entry removed');
      renderAll();
    });

    $('#homeMovementBtn').addEventListener('click', () => {
      window.PWStore.saveMovement({ done: true, duration: 20, type: 'Walk', notes: '' });
      toast('Movement ticked off');
      renderAll();
    });

    $$('[data-quick-movement]').forEach((btn) => btn.addEventListener('click', () => {
      const label = btn.dataset.quickMovement || 'Movement';
      const duration = Number(btn.dataset.duration || 20);
      const type = label === 'Workout' ? 'Home workout' : label === 'Movement' ? 'General movement' : 'Walk';
      window.PWStore.saveMovement({ done: true, duration, type, notes: label === 'Movement' ? 'General movement done' : '' });
      selectedDuration = duration;
      $('#movementType').value = type;
      $('#movementNotes').value = label === 'Movement' ? 'General movement done' : '';
      toast(`${label} saved`);
      renderAll();
    }));

    $$('#movementOptions button').forEach((btn) => btn.addEventListener('click', () => {
      selectedDuration = Number(btn.dataset.duration);
      renderTrack();
    }));
    $('#saveMovementBtn').addEventListener('click', () => {
      window.PWStore.saveMovement({
        done: true,
        duration: selectedDuration,
        type: $('#movementType').value,
        notes: $('#movementNotes').value
      });
      toast('Movement saved');
      renderAll();
    });
    $('#clearMovementBtn').addEventListener('click', () => {
      window.PWStore.clearMovement();
      $('#movementNotes').value = '';
      toast('Movement cleared');
      renderAll();
    });

    $('#saveWeightBtn').addEventListener('click', () => {
      const kg = Number($('#weightKg').value);
      if (!kg || Number.isNaN(kg)) {
        toast('Please enter a valid weight');
        return;
      }
      window.PWStore.saveWeight({
        date: $('#weightDate').value || window.PWStore.todayKey(),
        kg,
        waistCm: $('#waistCm').value,
        notes: $('#weightNotes').value
      });
      $('#weightKg').value = '';
      $('#waistCm').value = '';
      $('#weightNotes').value = '';
      toast('Weigh-in saved');
      renderAll();
    });

    $('#savePhotoSetBtn').addEventListener('click', async () => {
      const front = photoFile('front');
      const side = photoFile('side');
      const back = photoFile('back');
      if (!front && !side && !back) {
        toast('Choose at least one photo');
        return;
      }
      await window.PWStore.savePhotoSet({
        date: $('#photoDate').value || window.PWStore.todayKey(),
        notes: $('#photoNotes').value,
        front,
        side,
        back
      });
      resetPhotoInputs();
      $('#photoNotes').value = '';
      toast('Photo set saved locally');
      await renderAll();
    });

    ['front', 'side', 'back'].forEach((kind) => {
      const cap = kind.charAt(0).toUpperCase() + kind.slice(1);
      const cameraInput = $(`#photo${cap}Camera`);
      const uploadInput = $(`#photo${cap}`);
      if (cameraInput) cameraInput.addEventListener('change', () => {
        if (cameraInput.files && cameraInput.files[0] && uploadInput) uploadInput.value = '';
        updatePhotoSelected(kind);
      });
      if (uploadInput) uploadInput.addEventListener('change', () => {
        if (uploadInput.files && uploadInput.files[0] && cameraInput) cameraInput.value = '';
        updatePhotoSelected(kind);
      });
    });

    if ($('#compareDateA')) $('#compareDateA').addEventListener('change', async (event) => {
      compareDateAId = event.target.value;
      await renderPhotoCompare();
    });
    if ($('#compareDateB')) $('#compareDateB').addEventListener('change', async (event) => {
      compareDateBId = event.target.value;
      await renderPhotoCompare();
    });
    $$('[data-compare-angle]').forEach((btn) => btn.addEventListener('click', async () => {
      compareAngle = btn.dataset.compareAngle || 'front';
      await renderPhotoCompare();
    }));

    if ($('#spinMealBtn')) $('#spinMealBtn').addEventListener('click', spinMealWheel);
    if ($('#mealGeneratorType')) $('#mealGeneratorType').addEventListener('change', () => {
      mealIdeasVisible = false;
      resetMealGenerator();
    });
    if ($('#showAllMealIdeasBtn')) $('#showAllMealIdeasBtn').addEventListener('click', () => {
      mealIdeasVisible = !mealIdeasVisible;
      renderMealIdeaList();
    });

    $('#recipeSearch').addEventListener('input', renderRecipes);
    $('#closeRecipeModal').addEventListener('click', () => $('#recipeModal').close());

    $('#finishOnboardingBtn').addEventListener('click', () => {
      const name = ($('#onboardName').value || '').trim();
      const kg = Number($('#onboardWeight').value);
      if (!name) {
        toast('Please add your name');
        return;
      }
      if (!kg || Number.isNaN(kg)) {
        toast('Please add a valid starting weight');
        return;
      }
      window.PWStore.completeOnboarding({ name, startingWeightKg: kg });
      setOnboardingVisible(false);
      toast('Tracker set up');
      renderAll();
    });

    $('#skipOnboardingBtn').addEventListener('click', () => {
      window.PWStore.markOnboardingDone();
      setOnboardingVisible(false);
      toast('You can add details in Settings');
      renderAll();
    });

    $('#showOnboardingBtn').addEventListener('click', showOnboarding);

    $('#saveSettingsBtn').addEventListener('click', () => {
      window.PWStore.saveSettings({ name: $('#clientName').value, waterTargetMl: $('#waterTarget').value });
      toast('Settings saved');
      renderAll();
    });
    $('#exportDataBtn').addEventListener('click', () => {
      const data = window.PWStore.exportData();
      const blob = new Blob([data], { type: 'application/json' });
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = `perfect-women-tracker-${window.PWStore.todayKey()}.json`;
      a.click();
      URL.revokeObjectURL(url);
    });
    $('#resetDataBtn').addEventListener('click', () => {
      if (!confirm('Reset all local tracker data on this device? Photos will remain in browser storage unless deleted from the Photos page first.')) return;
      window.PWStore.resetData();
      toast('Local data reset');
      renderAll();
      navigate('home');
    });

    window.addEventListener('hashchange', () => navigate(location.hash.replace('#', '') || 'home'));
  }

  function registerServiceWorker() {
    if (!('serviceWorker' in navigator)) return;
    if (!location.protocol.startsWith('http')) return;
    navigator.serviceWorker.register('./sw.js').catch((err) => console.warn('Service worker registration failed:', err));
  }

  document.addEventListener('DOMContentLoaded', () => {
    renderStaticIcons();
    bindEvents();
    registerServiceWorker();
    navigate(location.hash.replace('#', '') || 'home');
    maybeShowOnboarding();
  });
})();

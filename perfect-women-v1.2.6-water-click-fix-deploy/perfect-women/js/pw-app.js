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
  let deferredInstallPrompt = null;

  const pageTitles = {
    home: 'Today',
    track: 'Track',
    programs: 'Programs',
    progress: 'Progress',
    photos: 'Photos',
    recipes: 'Recipes',
    settings: 'Settings'
  };


  const ICONS = {
    settings: '<circle cx="12" cy="12" r="3"></circle><path d="M19.4 15a1.8 1.8 0 0 0 .36 2l.04.04a2.1 2.1 0 0 1-2.97 2.97l-.04-.04a1.8 1.8 0 0 0-2-.36 1.8 1.8 0 0 0-1.08 1.65V21a2.1 2.1 0 0 1-4.2 0v-.06A1.8 1.8 0 0 0 8.4 19.3a1.8 1.8 0 0 0-2 .36l-.04.04a2.1 2.1 0 0 1-2.97-2.97l.04-.04a1.8 1.8 0 0 0 .36-2 1.8 1.8 0 0 0-1.65-1.08H2.1a2.1 2.1 0 0 1 0-4.2h.06A1.8 1.8 0 0 0 3.8 8.4a1.8 1.8 0 0 0-.36-2l-.04-.04A2.1 2.1 0 0 1 6.37 3.4l.04.04a1.8 1.8 0 0 0 2 .36 1.8 1.8 0 0 0 1.08-1.65V2.1a2.1 2.1 0 0 1 4.2 0v.06A1.8 1.8 0 0 0 14.8 3.8a1.8 1.8 0 0 0 2-.36l.04-.04a2.1 2.1 0 0 1 2.97 2.97l-.04.04a1.8 1.8 0 0 0-.36 2c.26.67.9 1.1 1.62 1.1h.07a2.1 2.1 0 0 1 0 4.2h-.06a1.8 1.8 0 0 0-1.65 1.08z"></path>',
    water: '<path d="M12 3s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z"></path><path d="M9.5 14.6a2.9 2.9 0 0 0 4.4 2.4"></path>',
    walk: '<circle cx="12" cy="5" r="2"></circle><path d="M10.5 9.2 8.8 13l-2.3 2.2"></path><path d="M11.2 9.2h2.2l2.1 3.2"></path><path d="M11.6 13.2 13 16l.8 4"></path><path d="M9.2 20l2.3-3.8"></path>',
    run: '<circle cx="12" cy="4.5" r="2"></circle><path d="M10 8.5 7.5 12 5 13"></path><path d="M11.5 8.2 15 10l2.2 2.4"></path><path d="M12.4 12.1 10.5 16.3 7.4 20"></path><path d="M13.1 13.1 16.2 16l2.4 4"></path>',
    check: '<path d="M20 6 9 17l-5-5"></path>',
    workout: '<path d="M3 9v6"></path><path d="M7 7v10"></path><path d="M17 7v10"></path><path d="M21 9v6"></path><path d="M7 12h10"></path>',
    chart: '<path d="M4 19V5"></path><path d="M4 19h16"></path><path d="m7 15 3-4 3 2 5-7"></path><path d="M18 6h-4"></path><path d="M18 6v4"></path>',
    ruler: '<path d="M4 17 17 4l3 3L7 20l-3-3z"></path><path d="m14 7 3 3"></path><path d="m11 10 2 2"></path><path d="m8 13 3 3"></path>',
    camera: '<path d="M4 8.5A2.5 2.5 0 0 1 6.5 6h1.7l1.1-1.6h5.4L15.8 6h1.7A2.5 2.5 0 0 1 20 8.5v8A2.5 2.5 0 0 1 17.5 19h-11A2.5 2.5 0 0 1 4 16.5v-8z"></path><circle cx="12" cy="12.5" r="3.2"></circle>',
    upload: '<path d="M12 16V5"></path><path d="m7 10 5-5 5 5"></path><path d="M5 19h14"></path>',
    home: '<path d="m3 11 9-8 9 8"></path><path d="M5.5 10.5V21h13V10.5"></path><path d="M9.5 21v-6h5v6"></path>',
    plate: '<circle cx="12" cy="12" r="7"></circle><circle cx="12" cy="12" r="3.5"></circle><path d="M3.5 4.5v15"></path><path d="M20.5 4.5v15"></path>',
    program: '<path d="M5 4h14a1.5 1.5 0 0 1 1.5 1.5v13A1.5 1.5 0 0 1 19 20H5a1.5 1.5 0 0 1-1.5-1.5v-13A1.5 1.5 0 0 1 5 4z"></path><path d="M8 8h8"></path><path d="M8 12h8"></path><path d="M8 16h5"></path>',
    spark: '<path d="M12 2.8 13.7 8l5.4 1.4-5.4 1.4L12 16l-1.7-5.2-5.4-1.4L10.3 8 12 2.8z"></path><path d="M18.5 14.5l.8 2.3 2.3.7-2.3.7-.8 2.3-.8-2.3-2.3-.7 2.3-.7.8-2.3z"></path><path d="M5.5 15.5l.6 1.8 1.8.6-1.8.6-.6 1.8-.6-1.8-1.8-.6 1.8-.6.6-1.8z"></path>'
  };

  function icon(name) {
    return `<svg viewBox="0 0 24 24" aria-hidden="true" focusable="false">${ICONS[name] || ICONS.check}</svg>`;
  }

  const JOGGING_PLAN = [
    { week: 1, sessions: [
      { key: 'foundation', label: 'Foundation run', targetKm: 1.5, note: 'Easy pace. Keep it comfortable.' },
      { key: 'form', label: 'Form focus', targetKm: 1.0, note: 'Easy run plus 4 short relaxed stride-outs.' },
      { key: 'long', label: 'Long slow run', targetKm: 2.0, note: 'Conversational pace.' },
      { key: 'optional', label: 'Optional easy jog', targetKm: 1.0, optional: true, note: 'Only if you feel fresh.' }
    ]},
    { week: 2, sessions: [
      { key: 'foundation', label: 'Foundation run', targetKm: 1.5, note: 'Easy pace. Repeat the baseline.' },
      { key: 'form', label: 'Form focus', targetKm: 1.0, note: 'Easy run plus 4 short relaxed stride-outs.' },
      { key: 'long', label: 'Long slow run', targetKm: 2.5, note: 'Slow and steady.' },
      { key: 'optional', label: 'Optional easy jog', targetKm: 1.0, optional: true, note: 'Only if you feel fresh.' }
    ]},
    { week: 3, sessions: [
      { key: 'foundation', label: 'Foundation run', targetKm: 2.5, note: 'Easy pace. Do not chase speed.' },
      { key: 'form', label: 'Form focus', targetKm: 2.0, note: 'Relaxed form and quick light steps.' },
      { key: 'long', label: 'Long slow run', targetKm: 3.0, note: 'Comfortable pace.' },
      { key: 'optional', label: 'Optional easy jog', targetKm: 1.5, optional: true, note: 'Keep it very easy.' }
    ]},
    { week: 4, sessions: [
      { key: 'foundation', label: 'Foundation run', targetKm: 2.5, note: 'Easy controlled effort.' },
      { key: 'form', label: 'Form focus', targetKm: 2.0, note: 'Add relaxed stride-outs if you feel good.' },
      { key: 'long', label: 'Long slow run', targetKm: 3.5, note: 'Build distance gently.' },
      { key: 'optional', label: 'Optional easy jog', targetKm: 1.5, optional: true, note: 'Skip if tired.' }
    ]},
    { week: 5, sessions: [
      { key: 'foundation', label: 'Foundation run', targetKm: 3.5, note: 'Easy pace. Stay patient.' },
      { key: 'form', label: 'Form focus', targetKm: 2.5, note: 'Focus on posture and light feet.' },
      { key: 'long', label: 'Long slow run', targetKm: 4.0, note: 'Comfort over speed.' },
      { key: 'optional', label: 'Optional easy jog', targetKm: 2.0, optional: true, note: 'Only if recovered.' }
    ]},
    { week: 6, sessions: [
      { key: 'foundation', label: 'Foundation run', targetKm: 3.5, note: 'Easy steady effort.' },
      { key: 'form', label: 'Form focus', targetKm: 2.5, note: 'Controlled stride-outs if fresh.' },
      { key: 'long', label: 'Long slow run', targetKm: 4.5, note: 'Slow enough to finish well.' },
      { key: 'optional', label: 'Optional easy jog', targetKm: 2.0, optional: true, note: 'Skip if legs feel heavy.' }
    ]},
    { week: 7, sessions: [
      { key: 'foundation', label: 'Foundation run', targetKm: 4.0, note: 'Easy and confident.' },
      { key: 'form', label: 'Form focus', targetKm: 3.0, note: 'Relaxed form, no sprinting.' },
      { key: 'long', label: 'Long slow run', targetKm: 5.0, note: 'First 5 km practice.' },
      { key: 'optional', label: 'Optional easy jog', targetKm: 2.5, optional: true, note: 'Very easy only.' }
    ]},
    { week: 8, sessions: [
      { key: 'foundation', label: 'Foundation run', targetKm: 4.0, note: 'Easy confidence builder.' },
      { key: 'form', label: 'Form focus', targetKm: 3.0, note: 'Light relaxed running.' },
      { key: 'test', label: '5 km run', targetKm: 5.0, note: 'Complete your 5 km at a steady, safe pace.' },
      { key: 'optional', label: 'Optional recovery jog', targetKm: 3.0, optional: true, note: 'Only if you feel good after the 5 km.' }
    ]}
  ];

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

    const latestCheckin = (window.PWStore.sortedCheckins ? window.PWStore.sortedCheckins() : []).slice(-1)[0];
    if (latestCheckin) {
      $('#homeCheckinTitle').textContent = `Last check-in: ${fmtDate(latestCheckin.date)}`;
      $('#homeCheckinText').textContent = latestCheckin.help ? `Help needed: ${latestCheckin.help.slice(0, 80)}${latestCheckin.help.length > 80 ? '…' : ''}` : 'Your weekly reflection has been saved.';
    } else {
      $('#homeCheckinTitle').textContent = 'Weekly check-in';
      $('#homeCheckinText').textContent = 'Save your win, struggle and what you need help with.';
    }

    renderWeekStrip();
    renderWalkingHome(s);
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
    const waterStatus = $('#waterSavedStatus');
    if (waterStatus) {
      waterStatus.textContent = water.ml > 0 ? `Saved today: ${water.ml.toLocaleString()} ml on this device.` : 'Water saves automatically on this device.';
      waterStatus.className = water.ml > 0 ? 'save-status ok' : 'save-status';
    }

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
    if ($('#measurementDate')) $('#measurementDate').value = window.PWStore.todayKey();
    if ($('#checkinDate')) $('#checkinDate').value = window.PWStore.todayKey();
  }


  function activeProgramKey(s) {
    const active = s.programs?.active;
    const walkingStarted = !!s.walkingProgram?.started;
    const joggingStarted = !!s.joggingProgram?.started;
    if (active === 'walking' && walkingStarted) return 'walking';
    if (active === 'jogging' && joggingStarted) return 'jogging';
    if (walkingStarted && !joggingStarted) return 'walking';
    if (joggingStarted && !walkingStarted) return 'jogging';
    if (walkingStarted && joggingStarted) return 'walking';
    return null;
  }

  function renderProgramOverview(s) {
    const active = activeProgramKey(s);
    const walkingCard = $('#walkingProgramCard');
    const joggingCard = $('#joggingProgramCard');
    if (walkingCard) {
      walkingCard.classList.toggle('is-active-program', active === 'walking');
      walkingCard.classList.toggle('is-compact-program', active !== 'walking');
    }
    if (joggingCard) {
      joggingCard.classList.toggle('is-active-program', active === 'jogging');
      joggingCard.classList.toggle('is-compact-program', active !== 'jogging');
    }

    const banner = $('#currentProgramBanner');
    if (banner) {
      if (active === 'walking') {
        const week = walkingWeekNumberForDate(s);
        const walks = walksForWeek(s, week);
        const targetWalks = Number(s.walkingProgram?.targetWalksPerWeek || 4);
        banner.innerHTML = `${icon('walk')}<div><strong>Current program: 8-week walking</strong><small>Week ${week} of 8 • ${walks.length}/${targetWalks} walks logged this week</small></div>`;
        banner.classList.add('is-active');
      } else if (active === 'jogging') {
        const week = joggingWeekNumberForDate(s);
        const plan = joggingWeekPlan(week);
        const runs = runsForWeek(s, week);
        const targetSessions = plan.sessions.filter((item) => !item.optional).length;
        banner.innerHTML = `${icon('run')}<div><strong>Current program: 5 km jogging</strong><small>Week ${week} of 8 • ${runs.length}/${targetSessions} sessions logged this week</small></div>`;
        banner.classList.add('is-active');
      } else {
        banner.innerHTML = `${icon('program')}<div><strong>No current program yet</strong><small>Pick one program to open it up and keep your focus clear.</small></div>`;
        banner.classList.remove('is-active');
      }
    }

    const walkingBtn = $('#openWalkingProgramBtn');
    if (walkingBtn) walkingBtn.textContent = s.walkingProgram?.started ? 'Make current' : 'Start walking';
    const joggingBtn = $('#openJoggingProgramBtn');
    if (joggingBtn) joggingBtn.textContent = s.joggingProgram?.started ? 'Make current' : 'Start jogging';

    const walkingCompact = $('#walkingCompactPanel small');
    if (walkingCompact) {
      if (s.walkingProgram?.started) {
        const week = walkingWeekNumberForDate(s);
        walkingCompact.textContent = `Saved progress • Week ${week} of 8`;
      } else {
        walkingCompact.textContent = '60-minute walks • 4–5/week • step average tracking';
      }
    }
    const joggingCompact = $('#joggingCompactPanel small');
    if (joggingCompact) {
      if (s.joggingProgram?.started) {
        const week = joggingWeekNumberForDate(s);
        joggingCompact.textContent = `Saved progress • Week ${week} of 8`;
      } else {
        joggingCompact.textContent = '8-week beginner plan • 3 core sessions/week';
      }
    }
  }

  function renderPrograms() {
    const s = state();
    renderProgramOverview(s);
    renderWalkingTrack(s);
    renderJoggingTrack(s);
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
    renderMeasurementProgress(s);
    renderMonthlyReport(s);
    renderWalkingProgress(s);
    renderJoggingProgress(s);
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


  function cmText(value) {
    return typeof value === 'number' && !Number.isNaN(value) ? `${value.toFixed(1)} cm` : '—';
  }

  function measurementDelta(first, latest, key) {
    if (!first || !latest || typeof first[key] !== 'number' || typeof latest[key] !== 'number') return '—';
    const change = latest[key] - first[key];
    return `${change > 0 ? '+' : ''}${change.toFixed(1)} cm`;
  }

  function renderMeasurementProgress(s) {
    const measurements = window.PWStore.sortedMeasurements ? window.PWStore.sortedMeasurements() : [];
    const stats = $('#measurementStats');
    const history = $('#measurementHistory');
    if (!stats || !history) return;

    if (!measurements.length) {
      stats.innerHTML = `
        <article class="mini-stat wide"><span>No measurements yet</span><strong>Save your first set in Track.</strong></article>
      `;
      history.innerHTML = '';
      return;
    }

    const first = measurements[0];
    const latest = measurements[measurements.length - 1];
    stats.innerHTML = `
      <article class="mini-stat"><span>Latest waist</span><strong>${cmText(latest.waist)}</strong></article>
      <article class="mini-stat"><span>Waist change</span><strong>${measurementDelta(first, latest, 'waist')}</strong></article>
      <article class="mini-stat"><span>Latest hips</span><strong>${cmText(latest.hips)}</strong></article>
      <article class="mini-stat"><span>Saved sets</span><strong>${measurements.length}</strong></article>
    `;

    history.innerHTML = measurements.slice(-5).reverse().map((item) => `
      <div class="summary-row">
        <span><strong>${fmtDate(item.date)}</strong><br><small>Waist ${cmText(item.waist)} • Hips ${cmText(item.hips)} • Chest ${cmText(item.chest)}</small></span>
        <strong>${item.notes ? escapeHtml(item.notes).slice(0, 28) : 'Saved'}</strong>
      </div>
    `).join('');
  }

  function dateDaysAgo(days) {
    const d = new Date();
    d.setDate(d.getDate() - days);
    return window.PWStore.todayKey(d);
  }

  function renderMonthlyReport(s) {
    const grid = $('#monthlyReportGrid');
    const latestBox = $('#latestCheckinBox');
    if (!grid || !latestBox) return;
    const since = dateDaysAgo(30);
    const weights = window.PWStore.sortedWeights().filter((item) => item.date >= since);
    const measurements = window.PWStore.sortedMeasurements ? window.PWStore.sortedMeasurements().filter((item) => item.date >= since) : [];
    const checkins = window.PWStore.sortedCheckins ? window.PWStore.sortedCheckins() : [];
    const allKeys = Array.from({ length: 30 }, (_, i) => dateDaysAgo(29 - i));
    const waterDays = allKeys.filter((key) => (s.logs.water[key]?.ml || 0) >= s.settings.waterTargetMl).length;
    const movementDays = allKeys.filter((key) => s.logs.movement[key]?.done).length;
    const walks = (s.logs.walks || []).filter((item) => item.date >= since).length;
    const photoSets = (s.photos.sets || []).filter((item) => item.date >= since).length;

    const weightChange = weights.length >= 2 ? `${weights[weights.length - 1].kg - weights[0].kg > 0 ? '+' : ''}${(weights[weights.length - 1].kg - weights[0].kg).toFixed(1)} kg` : '—';
    const waistChange = measurements.length >= 2 ? measurementDelta(measurements[0], measurements[measurements.length - 1], 'waist') : '—';

    grid.innerHTML = `
      <article class="mini-stat"><span>Weight change</span><strong>${weightChange}</strong></article>
      <article class="mini-stat"><span>Waist change</span><strong>${waistChange}</strong></article>
      <article class="mini-stat"><span>Water days</span><strong>${waterDays}/30</strong></article>
      <article class="mini-stat"><span>Movement days</span><strong>${movementDays}/30</strong></article>
      <article class="mini-stat"><span>Walks logged</span><strong>${walks}</strong></article>
      <article class="mini-stat"><span>Photo sets</span><strong>${photoSets}</strong></article>
    `;

    const latest = checkins[checkins.length - 1];
    latestBox.innerHTML = latest ? `
      <p class="eyebrow pink">Latest check-in</p>
      <h3>${fmtDate(latest.date)}</h3>
      <div class="summary-list compact">
        <div class="summary-row"><span>Meals</span><strong>${escapeHtml(latest.meals || '—')}</strong></div>
        <div class="summary-row"><span>Water</span><strong>${escapeHtml(latest.water || '—')}</strong></div>
        <div class="summary-row"><span>Movement</span><strong>${escapeHtml(latest.movement || '—')}</strong></div>
        <div class="summary-row"><span>Energy / Stress</span><strong>${escapeHtml(latest.energy || '—')} / ${escapeHtml(latest.stress || '—')}</strong></div>
      </div>
      ${latest.win ? `<p class="small"><strong>Win:</strong> ${escapeHtml(latest.win)}</p>` : ''}
      ${latest.struggle ? `<p class="small"><strong>Struggle:</strong> ${escapeHtml(latest.struggle)}</p>` : ''}
      ${latest.help ? `<p class="small"><strong>Help needed:</strong> ${escapeHtml(latest.help)}</p>` : ''}
    ` : '<p class="muted">No weekly check-in saved yet. Add one from Track.</p>';
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



  function walkingWeekNumberForDate(s, dateKey = window.PWStore.todayKey()) {
    if (!s.walkingProgram?.started || !s.walkingProgram.startDate) return 1;
    const start = new Date(`${s.walkingProgram.startDate}T00:00:00`);
    const date = new Date(`${dateKey}T00:00:00`);
    const diffDays = Math.floor((date - start) / 86400000);
    return Math.min(8, Math.max(1, Math.floor(diffDays / 7) + 1));
  }

  function walksForWeek(s, week) {
    return (s.logs.walks || []).filter((walk) => Number(walk.week) === Number(week));
  }

  function avgSteps(walks) {
    if (!walks.length) return 0;
    return Math.round(walks.reduce((sum, walk) => sum + Number(walk.steps || 0), 0) / walks.length);
  }

  function walkingWeeklyRows(s) {
    const rows = [];
    for (let week = 1; week <= 8; week += 1) {
      const walks = walksForWeek(s, week);
      const average = avgSteps(walks);
      rows.push({
        week,
        walks: walks.length,
        average,
        target: Number(s.walkingProgram?.weeklyTargets?.[String(week)] || 0)
      });
    }
    return rows;
  }

  function renderWalkingHome(s) {
    const title = $('#homeWalkingTitle');
    const text = $('#homeWalkingText');
    const stats = $('#homeWalkingStats');
    if (!title || !text || !stats) return;

    if (!s.walkingProgram?.started) {
      title.textContent = '8-week walking program';
      text.textContent = 'Start when you are ready. Log each 60-minute walk and track your step average.';
      stats.innerHTML = '<span>60-min walks</span><span>4–5/week</span><span>steps per session</span>';
      return;
    }

    const week = walkingWeekNumberForDate(s);
    const walks = walksForWeek(s, week);
    const targetWalks = Number(s.walkingProgram.targetWalksPerWeek || 4);
    const average = avgSteps(walks);
    const targetSteps = Number(s.walkingProgram.weeklyTargets?.[String(week)] || 0);
    title.textContent = `Walking program: Week ${week} of 8`;
    text.textContent = targetSteps
      ? `This week’s target: ${targetSteps.toLocaleString()} steps per 60-minute walk.`
      : 'Log your 60-minute walks and build your weekly average gently.';
    stats.innerHTML = `
      <span>${walks.length}/${targetWalks} walks</span>
      <span>${average ? average.toLocaleString() : '—'} avg steps</span>
      <span>${targetSteps ? targetSteps.toLocaleString() + ' target' : 'target optional'}</span>
    `;
  }

  function suggestedWalkingTarget(rows, currentWeek) {
    const previous = rows.find((row) => row.week === currentWeek - 1);
    if (!previous || !previous.average) return '';
    return Math.round(previous.average * 1.05 / 50) * 50;
  }

  function renderWalkingTrack(s) {
    const startPanel = $('#walkingStartPanel');
    const activePanel = $('#walkingActivePanel');
    if (!startPanel || !activePanel) return;

    const started = !!s.walkingProgram?.started;
    startPanel.hidden = started;
    activePanel.hidden = !started;

    const week = walkingWeekNumberForDate(s);
    const targetWalks = Number(s.walkingProgram?.targetWalksPerWeek || 4);
    const walks = walksForWeek(s, week).sort((a, b) => b.date.localeCompare(a.date) || (b.ts || '').localeCompare(a.ts || ''));
    const average = avgSteps(walks);
    const rows = walkingWeeklyRows(s);
    const targetSteps = Number(s.walkingProgram?.weeklyTargets?.[String(week)] || 0);
    const suggested = suggestedWalkingTarget(rows, week);

    $('#walkingWeekPill').textContent = started ? `Week ${week} of 8` : 'Not started';
    if ($('#walkingCurrentWeek')) $('#walkingCurrentWeek').textContent = `${week} of 8`;
    if ($('#walkingThisWeekCount')) $('#walkingThisWeekCount').textContent = `${walks.length}/${targetWalks}`;
    if ($('#walkingThisWeekAvg')) $('#walkingThisWeekAvg').textContent = average ? average.toLocaleString() : '—';
    if ($('#walkingWeekTarget')) $('#walkingWeekTarget').value = targetSteps || '';
    if ($('#walkDate')) $('#walkDate').value = window.PWStore.todayKey();

    const advice = $('#walkingAdvice');
    if (advice) {
      if (week === 1 && !average) advice.textContent = 'Week 1 is your baseline week. Record your normal 60-minute walks without forcing the pace.';
      else if (week === 1) advice.textContent = `Week 1 baseline average so far: ${average.toLocaleString()} steps.`;
      else if (!targetSteps && suggested) advice.textContent = `Suggested Week ${week} target: about ${suggested.toLocaleString()} steps per 60-minute walk. Save it or adjust it.`;
      else if (targetSteps && average) advice.textContent = average >= targetSteps ? 'You are meeting this week’s walking target. Keep it steady and recover well.' : 'Keep showing up. The goal is steady progress, not perfection.';
      else advice.textContent = 'Log each 60-minute walk after you finish. Only total steps are needed.';
    }

    const list = $('#walkingSessionList');
    if (list) {
      if (!walks.length) {
        list.innerHTML = '<p class="muted">No walks logged for this week yet.</p>';
      } else {
        list.innerHTML = walks.map((walk) => `
          <div class="summary-row movement-row">
            <span><strong>${fmtDate(walk.date)}</strong><br><small>60-minute walk${walk.notes ? ' • ' + escapeHtml(walk.notes) : ''}</small></span>
            <strong>${Number(walk.steps || 0).toLocaleString()} steps</strong>
            <button class="text-button danger-link" data-delete-walk="${escapeHtml(walk.id)}" type="button">Delete</button>
          </div>
        `).join('');
        $$('[data-delete-walk]').forEach((btn) => btn.addEventListener('click', () => {
          if (!confirm('Delete this walk entry?')) return;
          window.PWStore.deleteWalkSession(btn.dataset.deleteWalk);
          toast('Walk deleted');
          renderAll();
        }));
      }
    }
  }

  function renderWalkingProgress(s) {
    const canvas = $('#walkingChart');
    const empty = $('#walkingChartEmpty');
    const summary = $('#walkingChartSummary');
    const list = $('#walkingWeekList');
    if (!canvas || !empty || !summary || !list) return;

    const rows = walkingWeeklyRows(s);
    const activeRows = rows.filter((row) => row.walks > 0 || row.target > 0);
    empty.style.display = activeRows.length ? 'none' : 'block';

    if (!s.walkingProgram?.started) {
      summary.textContent = 'Start the walking program on the Programs page.';
    } else {
      const currentWeek = walkingWeekNumberForDate(s);
      const current = rows.find((row) => row.week === currentWeek);
      const previous = rows.find((row) => row.week === currentWeek - 1);
      const delta = current?.average && previous?.average ? current.average - previous.average : 0;
      const deltaText = delta ? `${delta > 0 ? '+' : ''}${delta.toLocaleString()} vs last week` : 'build your baseline';
      summary.textContent = `Week ${currentWeek} of 8 • ${current?.walks || 0} walks • ${current?.average ? current.average.toLocaleString() + ' avg steps' : deltaText}`;
    }

    drawWalkingChart(rows);
    list.innerHTML = activeRows.length ? activeRows.map((row) => {
      const previous = rows.find((item) => item.week === row.week - 1);
      const delta = row.average && previous?.average ? row.average - previous.average : 0;
      const cls = delta > 0 ? 'up' : delta < 0 ? 'down' : 'same';
      const deltaText = row.average && previous?.average ? `${delta > 0 ? '+' : ''}${delta.toLocaleString()}` : '—';
      return `
        <div class="summary-row movement-row">
          <span><strong>Week ${row.week}</strong><br><small>${row.walks} walk${row.walks === 1 ? '' : 's'} • target ${row.target ? row.target.toLocaleString() : 'not set'}</small></span>
          <strong>${row.average ? row.average.toLocaleString() : '—'} avg</strong>
          <strong class="delta-pill ${cls}">${deltaText}</strong>
        </div>
      `;
    }).join('') : '';
  }

  function drawWalkingChart(rows) {
    const canvas = $('#walkingChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.045)';
    ctx.fillRect(0, 0, w, h);
    const activeRows = rows.filter((row) => row.walks > 0 || row.target > 0);
    if (!activeRows.length) return;

    const max = Math.max(1000, ...activeRows.map((row) => Math.max(row.average || 0, row.target || 0))) * 1.08;
    const left = 54;
    const right = 24;
    const top = 34;
    const bottom = 50;
    const plotW = w - left - right;
    const plotH = h - top - bottom;
    const gap = 10;
    const barW = Math.max(22, (plotW - gap * 7) / 8);

    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#b8bbd0';
    ctx.font = '13px system-ui';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 3; i += 1) {
      const y = top + plotH - (plotH * i) / 3;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(w - right, y);
      ctx.stroke();
      ctx.fillText(Math.round((max * i) / 3).toLocaleString(), left - 8, y + 4);
    }

    rows.forEach((row, index) => {
      const x = left + index * (barW + gap);
      const avgH = row.average ? (row.average / max) * plotH : 0;
      const y = top + plotH - avgH;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      roundRect(ctx, x, top, barW, plotH, 9);
      ctx.fill();

      if (avgH > 0) {
        const gradient = ctx.createLinearGradient(0, y, 0, top + plotH);
        gradient.addColorStop(0, '#d9a72e');
        gradient.addColorStop(1, '#e80075');
        ctx.fillStyle = gradient;
        roundRect(ctx, x, y, barW, Math.max(avgH, 8), 9);
        ctx.fill();
      }

      if (row.target > 0) {
        const targetY = top + plotH - (row.target / max) * plotH;
        ctx.strokeStyle = 'rgba(255,255,255,0.75)';
        ctx.lineWidth = 2;
        ctx.beginPath();
        ctx.moveTo(x - 2, targetY);
        ctx.lineTo(x + barW + 2, targetY);
        ctx.stroke();
      }

      ctx.textAlign = 'center';
      ctx.fillStyle = '#f8fafc';
      ctx.font = '800 13px system-ui';
      ctx.fillText(`W${row.week}`, x + barW / 2, h - 22);
      ctx.fillStyle = '#b8bbd0';
      ctx.font = '12px system-ui';
      ctx.fillText(`${row.walks || 0}x`, x + barW / 2, h - 7);
    });
  }

  function joggingWeekNumberForDate(s, dateKey = window.PWStore.todayKey()) {
    if (!s.joggingProgram?.started || !s.joggingProgram.startDate) return 1;
    const start = new Date(`${s.joggingProgram.startDate}T00:00:00`);
    const date = new Date(`${dateKey}T00:00:00`);
    const diffDays = Math.floor((date - start) / 86400000);
    return Math.min(8, Math.max(1, Math.floor(diffDays / 7) + 1));
  }

  function joggingWeekPlan(week) {
    return JOGGING_PLAN.find((item) => item.week === Number(week)) || JOGGING_PLAN[0];
  }

  function runsForWeek(s, week) {
    return (s.logs.runs || []).filter((run) => Number(run.week) === Number(week));
  }

  function joggingWeeklyRows(s) {
    return JOGGING_PLAN.map((plan) => {
      const runs = runsForWeek(s, plan.week);
      const completedKm = Math.round(runs.reduce((sum, run) => sum + Number(run.distanceKm || 0), 0) * 100) / 100;
      const plannedKm = Math.round(plan.sessions.filter((item) => !item.optional).reduce((sum, item) => sum + item.targetKm, 0) * 100) / 100;
      return { week: plan.week, runs: runs.length, completedKm, plannedKm };
    });
  }

  function renderJoggingTrack(s) {
    const startPanel = $('#joggingStartPanel');
    const activePanel = $('#joggingActivePanel');
    if (!startPanel || !activePanel) return;

    const started = !!s.joggingProgram?.started;
    startPanel.hidden = started;
    activePanel.hidden = !started;

    const week = joggingWeekNumberForDate(s);
    const plan = joggingWeekPlan(week);
    const runs = runsForWeek(s, week).sort((a, b) => b.date.localeCompare(a.date) || (b.ts || '').localeCompare(a.ts || ''));
    const targetSessions = plan.sessions.filter((item) => !item.optional).length;
    const completedKm = Math.round(runs.reduce((sum, run) => sum + Number(run.distanceKm || 0), 0) * 100) / 100;
    const plannedKm = Math.round(plan.sessions.filter((item) => !item.optional).reduce((sum, item) => sum + item.targetKm, 0) * 100) / 100;

    if ($('#joggingWeekPill')) $('#joggingWeekPill').textContent = started ? `Week ${week} of 8` : 'Not started';
    if ($('#joggingCurrentWeek')) $('#joggingCurrentWeek').textContent = `${week} of 8`;
    if ($('#joggingThisWeekCount')) $('#joggingThisWeekCount').textContent = `${runs.length}/${targetSessions}`;
    if ($('#joggingThisWeekKm')) $('#joggingThisWeekKm').textContent = completedKm ? `${completedKm.toFixed(1)} km` : '—';
    if ($('#runDate')) $('#runDate').value = window.PWStore.todayKey();

    const sessionSelect = $('#runSessionType');
    if (sessionSelect) {
      const current = sessionSelect.value;
      sessionSelect.innerHTML = plan.sessions.map((session) => `<option value="${session.key}">${session.label} • ${session.targetKm} km${session.optional ? ' • optional' : ''}</option>`).join('');
      if (current && plan.sessions.some((session) => session.key === current)) sessionSelect.value = current;
      const selected = plan.sessions.find((session) => session.key === sessionSelect.value) || plan.sessions[0];
      if ($('#runDistance')) $('#runDistance').value = selected?.targetKm || '';
      if ($('#joggingSessionHint')) $('#joggingSessionHint').textContent = selected ? selected.note : 'Choose your session and log what you completed.';
      sessionSelect.onchange = () => {
        const next = plan.sessions.find((session) => session.key === sessionSelect.value) || plan.sessions[0];
        if ($('#runDistance')) $('#runDistance').value = next?.targetKm || '';
        if ($('#joggingSessionHint')) $('#joggingSessionHint').textContent = next ? next.note : '';
      };
    }

    const planList = $('#joggingPlanList');
    if (planList) {
      planList.innerHTML = plan.sessions.map((session) => {
        const done = runs.some((run) => run.sessionKey === session.key);
        return `<div class="program-session ${done ? 'done' : ''}">
          <span><strong>${session.label}</strong><br><small>${session.targetKm} km${session.optional ? ' • optional' : ''} • ${session.note}</small></span>
          <span>${done ? 'Done' : 'To do'}</span>
        </div>`;
      }).join('');
    }

    const advice = $('#joggingAdvice');
    if (advice) {
      if (!started) advice.textContent = 'Start the 8-week 0–5 km plan when you are ready.';
      else if (week === 1 && !runs.length) advice.textContent = 'Week 1 is about easy jogging/walking and building confidence. Keep the pace comfortable.';
      else if (runs.length >= targetSessions) advice.textContent = 'Core sessions completed for this week. Optional session only if you feel fresh.';
      else advice.textContent = `This week: aim for ${targetSessions} core sessions and about ${plannedKm.toFixed(1)} km total.`;
    }

    const list = $('#joggingSessionList');
    if (list) {
      if (!runs.length) {
        list.innerHTML = '<p class="muted">No jogs logged for this week yet.</p>';
      } else {
        list.innerHTML = runs.map((run) => `
          <div class="summary-row movement-row">
            <span><strong>${fmtDate(run.date)} • ${escapeHtml(run.sessionLabel || 'Jogging session')}</strong><br><small>${run.timeMinutes ? run.timeMinutes + ' min • ' : ''}${run.rpe ? 'RPE ' + run.rpe + ' • ' : ''}${run.notes ? escapeHtml(run.notes) : 'Logged run'}</small></span>
            <strong>${Number(run.distanceKm || 0).toFixed(1)} km</strong>
            <button class="text-button danger-link" data-delete-run="${escapeHtml(run.id)}" type="button">Delete</button>
          </div>
        `).join('');
        $$('[data-delete-run]').forEach((btn) => btn.addEventListener('click', () => {
          if (!confirm('Delete this jogging entry?')) return;
          window.PWStore.deleteRunSession(btn.dataset.deleteRun);
          toast('Jogging entry deleted');
          renderAll();
        }));
      }
    }
  }

  function renderJoggingProgress(s) {
    const canvas = $('#joggingChart');
    const empty = $('#joggingChartEmpty');
    const summary = $('#joggingChartSummary');
    const list = $('#joggingWeekList');
    if (!canvas || !empty || !summary || !list) return;

    const rows = joggingWeeklyRows(s);
    const activeRows = rows.filter((row) => row.runs > 0);
    empty.style.display = activeRows.length ? 'none' : 'block';
    if (!s.joggingProgram?.started) {
      summary.textContent = 'Start the 5 km jogging program on the Programs page.';
    } else {
      const week = joggingWeekNumberForDate(s);
      const current = rows.find((row) => row.week === week);
      summary.textContent = `Week ${week} of 8 • ${current?.runs || 0} sessions • ${current?.completedKm ? current.completedKm.toFixed(1) + ' km done' : 'log your first run'}`;
    }

    drawJoggingChart(rows);
    list.innerHTML = activeRows.length ? activeRows.map((row) => {
      const pctDone = row.plannedKm ? Math.round((row.completedKm / row.plannedKm) * 100) : 0;
      return `
        <div class="summary-row movement-row">
          <span><strong>Week ${row.week}</strong><br><small>${row.runs} session${row.runs === 1 ? '' : 's'} • planned ${row.plannedKm.toFixed(1)} km</small></span>
          <strong>${row.completedKm.toFixed(1)} km</strong>
          <strong class="delta-pill ${pctDone >= 100 ? 'up' : pctDone > 0 ? 'same' : 'down'}">${pctDone}%</strong>
        </div>
      `;
    }).join('') : '';
  }

  function drawJoggingChart(rows) {
    const canvas = $('#joggingChart');
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    const w = canvas.width;
    const h = canvas.height;
    ctx.clearRect(0, 0, w, h);
    ctx.fillStyle = 'rgba(255,255,255,0.045)';
    ctx.fillRect(0, 0, w, h);
    const activeRows = rows.filter((row) => row.runs > 0 || row.plannedKm > 0);
    if (!activeRows.length) return;

    const max = Math.max(5, ...activeRows.map((row) => Math.max(row.completedKm || 0, row.plannedKm || 0))) * 1.15;
    const left = 42, right = 22, top = 34, bottom = 50;
    const plotW = w - left - right;
    const plotH = h - top - bottom;
    const gap = 10;
    const barW = Math.max(22, (plotW - gap * 7) / 8);

    ctx.strokeStyle = 'rgba(255,255,255,0.10)';
    ctx.lineWidth = 1;
    ctx.fillStyle = '#b8bbd0';
    ctx.font = '13px system-ui';
    ctx.textAlign = 'right';
    for (let i = 0; i <= 3; i += 1) {
      const y = top + plotH - (plotH * i) / 3;
      ctx.beginPath();
      ctx.moveTo(left, y);
      ctx.lineTo(w - right, y);
      ctx.stroke();
      ctx.fillText(`${Math.round((max * i) / 3)}km`, left - 7, y + 4);
    }

    rows.forEach((row, index) => {
      const x = left + index * (barW + gap);
      const plannedH = row.plannedKm ? (row.plannedKm / max) * plotH : 0;
      const completedH = row.completedKm ? (row.completedKm / max) * plotH : 0;
      ctx.fillStyle = 'rgba(255,255,255,0.08)';
      roundRect(ctx, x, top + plotH - plannedH, barW, Math.max(plannedH, 8), 9);
      ctx.fill();
      if (completedH > 0) {
        const y = top + plotH - completedH;
        const gradient = ctx.createLinearGradient(0, y, 0, top + plotH);
        gradient.addColorStop(0, '#ec4899');
        gradient.addColorStop(1, '#8b5cf6');
        ctx.fillStyle = gradient;
        roundRect(ctx, x + 4, y, Math.max(8, barW - 8), Math.max(completedH, 8), 8);
        ctx.fill();
      }
      ctx.textAlign = 'center';
      ctx.fillStyle = '#f8fafc';
      ctx.font = '800 13px system-ui';
      ctx.fillText(`W${row.week}`, x + barW / 2, h - 22);
      ctx.fillStyle = '#b8bbd0';
      ctx.font = '12px system-ui';
      ctx.fillText(`${row.runs || 0}x`, x + barW / 2, h - 7);
    });
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
    renderPrograms();
    renderProgress();
    if ($('#page-photos').classList.contains('active')) await renderPhotos();
    if ($('#page-recipes').classList.contains('active')) {
      renderRecipes();
      renderMealIdeaList();
    }
    renderSettings();
  }


  function isStandaloneApp() {
    return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true;
  }

  function updateInstallUi() {
    const canPrompt = !!deferredInstallPrompt && !isStandaloneApp();
    ['#installAppBtn', '#onboardingInstallBtn'].forEach((selector) => {
      const btn = $(selector);
      if (btn) btn.hidden = !canPrompt;
    });

    const statusText = isStandaloneApp()
      ? 'App is already installed on this device.'
      : canPrompt
        ? 'Chrome can install the app now. Tap the install button above.'
        : 'Android Chrome: use the browser menu if the install button does not appear. iPhone: open in Safari, tap Share, then Add to Home Screen.';

    ['#installStatusText', '#onboardingInstallStatus'].forEach((selector) => {
      const el = $(selector);
      if (el) el.textContent = statusText;
    });
  }

  function setText(selector, text, className = '') {
    const el = $(selector);
    if (!el) return;
    el.textContent = text;
    el.className = `save-status ${className}`.trim();
  }

  function savedTimeLabel() {
    return new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  }

  async function promptInstallApp() {
    if (isStandaloneApp()) {
      toast('The app is already installed');
      updateInstallUi();
      return;
    }
    if (!deferredInstallPrompt) {
      toast('Use Chrome menu → Install app, or iPhone Safari → Share → Add to Home Screen');
      updateInstallUi();
      return;
    }
    deferredInstallPrompt.prompt();
    try {
      await deferredInstallPrompt.userChoice;
    } catch (err) {
      console.warn('Install prompt was dismissed or failed.', err);
    }
    deferredInstallPrompt = null;
    updateInstallUi();
  }

  function bindInstallPrompt() {
    window.addEventListener('beforeinstallprompt', (event) => {
      event.preventDefault();
      deferredInstallPrompt = event;
      updateInstallUi();
    });
    window.addEventListener('appinstalled', () => {
      deferredInstallPrompt = null;
      toast('Perfect Women app installed');
      updateInstallUi();
    });
    updateInstallUi();
  }

  function bindEvents() {
    $$('[data-nav]').forEach((btn) => btn.addEventListener('click', () => navigate(btn.dataset.nav)));
    $('#quickSettings').addEventListener('click', () => navigate('settings'));

    const addWaterAndRefresh = (ml) => {
      window.PWStore.addWater(Number(ml));
      toast(`Added ${Number(ml).toLocaleString()} ml water`);
      renderAll();
    };

    $$('[data-add-water]').forEach((btn) => btn.addEventListener('click', () => {
      addWaterAndRefresh(btn.dataset.addWater);
    }));

    const homeWaterCard = $('#homeWaterCard');
    if (homeWaterCard) {
      homeWaterCard.addEventListener('click', () => addWaterAndRefresh(250));
      homeWaterCard.addEventListener('keydown', (event) => {
        if (event.key === 'Enter' || event.key === ' ') {
          event.preventDefault();
          addWaterAndRefresh(250);
        }
      });
    }
    const waterRingBtn = $('#waterRing');
    if (waterRingBtn) waterRingBtn.addEventListener('click', () => addWaterAndRefresh(250));
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


    if ($('#openWalkingProgramBtn')) $('#openWalkingProgramBtn').addEventListener('click', () => {
      const s = state();
      if (!s.walkingProgram?.started) {
        window.PWStore.startWalkingProgram({ targetWalksPerWeek: 4, targetSteps: '' });
        toast('Walking program started');
      } else {
        window.PWStore.setActiveProgram('walking');
        toast('Walking program is now current');
      }
      renderAll();
    });

    if ($('#openJoggingProgramBtn')) $('#openJoggingProgramBtn').addEventListener('click', () => {
      const s = state();
      if (!s.joggingProgram?.started) {
        window.PWStore.startJoggingProgram();
        toast('5 km jogging program started');
      } else {
        window.PWStore.setActiveProgram('jogging');
        toast('5 km jogging program is now current');
      }
      renderAll();
    });


    if ($('#startWalkingProgramBtn')) $('#startWalkingProgramBtn').addEventListener('click', () => {
      window.PWStore.startWalkingProgram({
        targetWalksPerWeek: $('#walkingTargetWalks')?.value || 4,
        targetSteps: $('#walkingStartTarget')?.value || ''
      });
      toast('Walking program started');
      renderAll();
    });

    if ($('#saveWalkingTargetBtn')) $('#saveWalkingTargetBtn').addEventListener('click', () => {
      const s = state();
      const week = walkingWeekNumberForDate(s);
      window.PWStore.saveWalkingTarget({ week, targetSteps: $('#walkingWeekTarget')?.value || '' });
      toast('Walking target saved');
      renderAll();
    });

    if ($('#saveWalkBtn')) $('#saveWalkBtn').addEventListener('click', () => {
      const steps = Number($('#walkSteps')?.value || 0);
      if (!steps || Number.isNaN(steps)) {
        toast('Please enter the steps for this walk');
        return;
      }
      window.PWStore.saveWalkSession({
        date: $('#walkDate')?.value || window.PWStore.todayKey(),
        steps,
        notes: $('#walkNotes')?.value || ''
      });
      $('#walkSteps').value = '';
      $('#walkNotes').value = '';
      toast('Walk saved');
      renderAll();
    });


    if ($('#startJoggingProgramBtn')) $('#startJoggingProgramBtn').addEventListener('click', () => {
      window.PWStore.startJoggingProgram();
      toast('5 km jogging program started');
      renderAll();
    });

    if ($('#saveRunBtn')) $('#saveRunBtn').addEventListener('click', () => {
      const s = state();
      const week = joggingWeekNumberForDate(s);
      const plan = joggingWeekPlan(week);
      const sessionKey = $('#runSessionType')?.value || plan.sessions[0].key;
      const session = plan.sessions.find((item) => item.key === sessionKey) || plan.sessions[0];
      const distanceKm = Number($('#runDistance')?.value || 0);
      if (!distanceKm || Number.isNaN(distanceKm)) {
        toast('Please enter the distance completed');
        return;
      }
      window.PWStore.saveRunSession({
        date: $('#runDate')?.value || window.PWStore.todayKey(),
        sessionKey: session.key,
        sessionLabel: session.label,
        targetKm: session.targetKm,
        distanceKm,
        timeMinutes: $('#runTime')?.value || '',
        rpe: $('#runRpe')?.value || '',
        notes: $('#runNotes')?.value || ''
      });
      $('#runTime').value = '';
      $('#runRpe').value = '';
      $('#runNotes').value = '';
      toast('Jogging session saved');
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


    if ($('#saveMeasurementsBtn')) $('#saveMeasurementsBtn').addEventListener('click', () => {
      const waist = $('#measureWaist').value;
      const hips = $('#measureHips').value;
      const chest = $('#measureChest').value;
      const thigh = $('#measureThigh').value;
      const arm = $('#measureArm').value;
      if (!waist && !hips && !chest && !thigh && !arm) {
        toast('Add at least one measurement');
        return;
      }
      window.PWStore.saveMeasurements({
        date: $('#measurementDate').value || window.PWStore.todayKey(),
        waist, hips, chest, thigh, arm,
        notes: $('#measurementNotes').value
      });
      ['measureWaist','measureHips','measureChest','measureThigh','measureArm','measurementNotes'].forEach((id) => { const el = $('#' + id); if (el) el.value = ''; });
      toast('Measurements saved');
      renderAll();
    });

    if ($('#saveCheckinBtn')) $('#saveCheckinBtn').addEventListener('click', () => {
      const hasContent = $('#checkinMeals').value || $('#checkinWater').value || $('#checkinMovement').value || $('#checkinEnergy').value || $('#checkinStress').value || $('#checkinWin').value || $('#checkinStruggle').value || $('#checkinHelp').value;
      if (!hasContent) {
        toast('Add a few check-in details first');
        return;
      }
      window.PWStore.saveCheckin({
        date: $('#checkinDate').value || window.PWStore.todayKey(),
        meals: $('#checkinMeals').value,
        water: $('#checkinWater').value,
        movement: $('#checkinMovement').value,
        energy: $('#checkinEnergy').value,
        stress: $('#checkinStress').value,
        win: $('#checkinWin').value,
        struggle: $('#checkinStruggle').value,
        help: $('#checkinHelp').value
      });
      ['checkinMeals','checkinWater','checkinMovement','checkinEnergy','checkinStress','checkinWin','checkinStruggle','checkinHelp'].forEach((id) => { const el = $('#' + id); if (el) el.value = ''; });
      toast('Weekly check-in saved');
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

    if ($('#installAppBtn')) $('#installAppBtn').addEventListener('click', promptInstallApp);
    if ($('#onboardingInstallBtn')) $('#onboardingInstallBtn').addEventListener('click', promptInstallApp);
    $('#showOnboardingBtn').addEventListener('click', showOnboarding);

    const saveSettingsNow = (silent = false) => {
      try {
        window.PWStore.saveSettings({ name: $('#clientName').value, waterTargetMl: $('#waterTarget').value });
        setText('#settingsSaveStatus', `Saved on this device at ${savedTimeLabel()}.`, 'ok');
        if (!silent) toast('Settings saved on this device');
        renderAll();
      } catch (err) {
        console.error('Settings save failed', err);
        setText('#settingsSaveStatus', 'Could not save on this device. Open the app in Chrome/Safari and try again.', 'error');
        if (!silent) toast('Settings could not be saved');
      }
    };

    $('#saveSettingsBtn').addEventListener('click', () => saveSettingsNow(false));
    ['#clientName', '#waterTarget'].forEach((selector) => {
      const input = $(selector);
      if (!input) return;
      input.addEventListener('change', () => saveSettingsNow(true));
      input.addEventListener('blur', () => saveSettingsNow(true));
    });

    $('#exportDataBtn').addEventListener('click', async () => {
      try {
        const data = window.PWStore.exportData();
        const blob = new Blob([data], { type: 'application/json' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `perfect-women-tracker-${window.PWStore.todayKey()}.json`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
        setText('#backupStatus', 'Backup file created. Check Downloads/Files on this device.', 'ok');
        toast('Backup started');
      } catch (err) {
        console.error('Backup export failed', err);
        try {
          await navigator.clipboard.writeText(window.PWStore.exportData());
          setText('#backupStatus', 'Download was blocked, so the backup text was copied instead.', 'ok');
          toast('Backup copied');
        } catch (copyErr) {
          console.error('Backup copy failed', copyErr);
          setText('#backupStatus', 'Could not create backup on this device. Normal tracking can still work.', 'error');
          toast('Backup could not be created');
        }
      }
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
    bindInstallPrompt();
    registerServiceWorker();
    navigate(location.hash.replace('#', '') || 'home');
    maybeShowOnboarding();
  });
})();

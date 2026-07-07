(function(){
  'use strict';

  const $ = (id) => document.getElementById(id);
  const qsa = (sel) => Array.from(document.querySelectorAll(sel));
  const STORAGE_PROFILE = 'hearty_basic_user_profile_v1';
  const STORAGE_TARGETS = 'heartyNutritionTargetsV1';
  const STORAGE_MEAL_TARGETS = 'heartyMealTargetsV1';
  const STORAGE_SCHEDULE = 'heartyMedicationSetupV1';
  const DAYS = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
  let step = 0;
  let unit = 'metric';

  function readJSON(key, fallback){
    try { const raw = localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; } catch(e){ return fallback; }
  }
  function writeJSON(key, value){ try { localStorage.setItem(key, JSON.stringify(value)); } catch(e){} }
  function set(key, value){ try { localStorage.setItem(key, value == null ? '' : String(value)); } catch(e){} }
  function val(id){ const el=$(id); return el ? String(el.value || '').trim() : ''; }
  function num(id){ const n = Number(String(val(id)).replace(',','.')); return Number.isFinite(n) ? n : 0; }
  function kgFromLb(lb){ return Math.round((Number(lb || 0) / 2.20462) * 10) / 10; }
  function lbFromKg(kg){ return Math.round((Number(kg || 0) * 2.20462) * 10) / 10; }
  function cmFromFeetIn(ft, inch){ return Math.round(((Number(ft || 0) * 12) + Number(inch || 0)) * 2.54); }
  function dayNames(days){ return (days || []).map(d => DAYS[Number(d)]).filter(Boolean); }
  function selectedDays(){ return qsa('[data-med-day].active').map(btn => String(btn.getAttribute('data-med-day'))); }

  function setValue(id, value){ const el=$(id); if(el && value !== undefined && value !== null && value !== '') el.value = value; }
  function setUnit(next){
    unit = next === 'imperial' ? 'imperial' : 'metric';
    qsa('[data-unit-choice]').forEach(btn => btn.classList.toggle('active', btn.dataset.unitChoice === unit));
    qsa('.metric-field').forEach(el => el.hidden = unit !== 'metric');
    qsa('.imperial-field').forEach(el => el.hidden = unit !== 'imperial');
    updateTargetsPreview();
  }

  function currentMedicationName(){
    const med = val('obMedication');
    const custom = val('obMedicationCustom');
    return med === 'Other' && custom ? custom : med;
  }

  function normalisedProfile(){
    const weightKg = unit === 'imperial' ? kgFromLb(num('obCurrentWeightLb')) : Math.round(num('obCurrentWeightKg') * 10) / 10;
    const startingKg = unit === 'imperial' ? kgFromLb(num('obStartingWeightLb')) : Math.round(num('obStartingWeightKg') * 10) / 10;
    const heightCm = unit === 'imperial' ? cmFromFeetIn(num('obHeightFt'), num('obHeightIn')) : Math.round(num('obHeightCm'));
    return {
      name: val('obName'),
      firstName: val('obName'),
      country: val('obCountry') || 'ZA',
      region: val('obCountry') || 'ZA',
      units: unit,
      unit,
      age: val('obAge'),
      sex: val('obSex'),
      heightCm: heightCm || '',
      heightFt: unit === 'imperial' ? val('obHeightFt') : '',
      heightIn: unit === 'imperial' ? val('obHeightIn') : '',
      currentWeightKg: weightKg || '',
      currentWeight: unit === 'imperial' ? val('obCurrentWeightLb') : val('obCurrentWeightKg'),
      currentWeightLb: unit === 'imperial' ? val('obCurrentWeightLb') : (weightKg ? lbFromKg(weightKg) : ''),
      startingWeightKg: startingKg || weightKg || '',
      startingWeight: unit === 'imperial' ? (val('obStartingWeightLb') || val('obCurrentWeightLb')) : (val('obStartingWeightKg') || val('obCurrentWeightKg')),
      startingWeightLb: unit === 'imperial' ? val('obStartingWeightLb') : (startingKg ? lbFromKg(startingKg) : ''),
      dailyActivity: val('obDailyActivity'),
      exerciseActivity: val('obExerciseActivity'),
      trainingLevel: val('obExerciseActivity'),
      nutritionGoal: 'lose',
      nutritionGoalSource: 'default_steady_loss_not_user_selected',
      onboardingVersion: 62,
      onboardingComplete: true,
      setupComplete: true,
      updatedAt: new Date().toISOString()
    };
  }

  function buildTargets(profile){
    let targets = null;
    try {
      const calc = window.HeartyTargetCalculator;
      if(calc && typeof calc.calculate === 'function'){
        const input = {
          units: profile.units,
          sex: profile.sex,
          age: profile.age,
          dailyActivity: profile.dailyActivity,
          exerciseActivity: profile.exerciseActivity,
          goal: 'lose'
        };
        if(profile.units === 'imperial'){
          input.weightLb = profile.currentWeightLb || profile.currentWeight;
          input.heightFt = profile.heightFt;
          input.heightIn = profile.heightIn;
        } else {
          input.weightKg = profile.currentWeightKg || profile.currentWeight;
          input.heightCm = profile.heightCm;
        }
        targets = calc.calculate(input);
      }
      if(!targets || !targets.ok){
        targets = calc && typeof calc.defaultTargets === 'function' ? calc.defaultTargets() : null;
        targets = Object.assign({ok:true, skipped:true, needsMoreInfo:true, calorieMin:1400, calorieMax:1650, proteinMin:85, proteinMax:105, fibreMin:20, fibreMax:25, fatMin:40, tier:2}, targets || {});
        targets.needsMoreInfo = true;
      }
    } catch(e){
      targets = {ok:true, skipped:true, needsMoreInfo:true, calorieMin:1400, calorieMax:1650, proteinMin:85, proteinMax:105, fibreMin:20, fibreMax:25, fatMin:40, tier:2};
    }
    targets.source = 'app-onboarding-v62';
    targets.updatedAt = new Date().toISOString();
    targets.calorieFloor = targets.calorieMin || targets.calorieFloor || 1200;
    targets.defaultGoalUsed = 'lose';
    targets.defaultGoalNote = 'Steady fat-loss estimate used internally; no goal was selected by the user.';
    return targets;
  }

  function buildSchedule(){
    const scheduleType = val('obScheduleType') || 'not_tracking';
    const days = selectedDays();
    const intervalDays = num('obIntervalDays') || null;
    const medication = currentMedicationName();
    return {
      medication,
      medicationRaw: val('obMedication'),
      customMedicationName: val('obMedicationCustom'),
      frequency: scheduleType,
      scheduleType,
      days,
      day: days[0] || '',
      dayName: days[0] ? DAYS[Number(days[0])] : '',
      dayNames: dayNames(days),
      intervalDays,
      nextDoseDate: val('obNextDoseDate'),
      reminderEnabled: val('obReminderEnabled') !== 'false',
      source: 'app-onboarding-v62',
      updatedAt: new Date().toISOString()
    };
  }

  function renderStep(){
    qsa('.onboarding-step').forEach(el => { el.hidden = Number(el.dataset.step) !== step; });
    qsa('[data-step-pill]').forEach(el => el.classList.toggle('active', Number(el.dataset.stepPill) === step));
    $('obBackBtn').disabled = step === 0;
    $('obNextBtn').textContent = step >= 4 ? 'Save profile' : 'Next';
    renderReview();
    updateTargetsPreview();
  }

  function renderReview(){
    const panel = $('reviewPanel');
    if(!panel) return;
    const p = normalisedProfile();
    const s = buildSchedule();
    const t = buildTargets(p);
    const weightText = p.currentWeightKg ? `${p.currentWeightKg} kg` : 'Not added yet';
    const heightText = p.heightCm ? `${p.heightCm} cm` : 'Not added yet';
    panel.innerHTML = [
      ['Profile', [p.name || 'No name yet', p.country || 'ZA', p.units].filter(Boolean).join(' · ')],
      ['Body estimate', `${weightText} · ${heightText}`],
      ['Activity', [p.dailyActivity || 'not set', p.exerciseActivity || 'not set'].join(' + ')],
      ['Medication', s.medication || 'Not set'],
      ['Schedule', s.scheduleType === 'specific_days' ? (s.dayNames.length ? s.dayNames.join(', ') : 'Specific days not chosen yet') : s.scheduleType.replace(/_/g,' ')],
      ['Meal estimate', t.needsMoreInfo ? 'Default starter GLP-1 targets until more info is added' : `${t.calorieMin}–${t.calorieMax} kcal · protein ${t.proteinMin}–${t.proteinMax}g`]
    ].map(row => `<div class="target-row"><div class="target-label">${row[0]}</div><div class="target-value">${row[1]}</div></div>`).join('');
  }

  function updateTargetsPreview(){
    const box = $('targetPreview');
    if(!box) return;
    const p = normalisedProfile();
    const t = buildTargets(p);
    const rows = [
      ['Calories', t.needsMoreInfo ? 'Default estimate' : `${t.calorieMin}–${t.calorieMax} kcal`],
      ['Protein', `${t.proteinMin || 85}–${t.proteinMax || 105}g`],
      ['Fibre', `${t.fibreMin || 20}–${t.fibreMax || 25}g`],
      ['Plan size', t.tierShortLabel || 'Standard plan']
    ];
    box.innerHTML = rows.map(row => `<div class="target-row"><div class="target-label">${row[0]}</div><div class="target-value">${row[1]}</div></div>`).join('') +
      `<p class="onboarding-note">${t.needsMoreInfo ? 'Add age, formula, height, weight and activity for a better estimate. Meals still works without it.' : 'These are rough client-facing estimates for meal planning, not medical targets.'}</p>`;
  }

  function syncConditionalFields(){
    const med = val('obMedication');
    const schedule = val('obScheduleType');
    const showCustom = med === 'Other';
    const custom = document.querySelector('.med-custom-row');
    if(custom) custom.hidden = !showCustom;
    const interval = document.querySelector('.interval-row');
    if(interval) interval.hidden = schedule !== 'every_x_days';
    const dayRow = document.querySelector('.day-picker-row');
    if(dayRow) dayRow.hidden = !['weekly','specific_days'].includes(schedule);
    const nextDate = document.querySelector('.next-date-row');
    if(nextDate) nextDate.hidden = schedule === 'not_tracking';
    if(schedule === 'not_tracking') qsa('[data-med-day]').forEach(btn => btn.classList.remove('active'));
  }

  function saveAll(){
    const profile = normalisedProfile();
    const targets = buildTargets(profile);
    const mealTargets = Object.assign({}, targets, {
      profileComplete: true,
      appProfileComplete: true,
      source: 'app-onboarding-v62',
      country: profile.country,
      region: profile.region,
      units: profile.units,
      age: profile.age,
      sex: profile.sex,
      heightCm: profile.heightCm,
      currentWeightKg: profile.currentWeightKg,
      startingWeightKg: profile.startingWeightKg,
      dailyActivity: profile.dailyActivity,
      exerciseActivity: profile.exerciseActivity,
      targets: {
        proteinMin: targets.proteinMin || 85,
        proteinMax: targets.proteinMax || 105,
        fibreMin: targets.fibreMin || 20,
        fibreMax: targets.fibreMax || 25,
        calorieFloor: targets.calorieFloor || targets.calorieMin || 1200
      }
    });
    profile.targets = targets;
    profile.calorieTargetMin = targets.calorieMin;
    profile.calorieTargetMax = targets.calorieMax;
    profile.proteinTargetMin = targets.proteinMin;
    profile.proteinTargetMax = targets.proteinMax;

    const schedule = buildSchedule();

    writeJSON(STORAGE_PROFILE, profile);
    writeJSON(STORAGE_TARGETS, targets);
    writeJSON(STORAGE_MEAL_TARGETS, mealTargets);
    writeJSON('heartyProfile', {
      name: profile.name,
      unit: profile.units,
      country: profile.country,
      region: profile.region,
      age: profile.age,
      sex: profile.sex,
      heightCm: profile.heightCm,
      startingWeightKg: profile.startingWeightKg || profile.currentWeightKg || null,
      currentWeightKg: profile.currentWeightKg || null,
      dailyActivity: profile.dailyActivity,
      exerciseActivity: profile.exerciseActivity,
      setupComplete: true,
      onboardingComplete: true,
      updatedAt: profile.updatedAt
    });
    writeJSON('heartyInjectionSchedule', schedule);
    writeJSON('heartyMedicationSetupV1', schedule);
    writeJSON('heartyMedication', Object.assign({ type:schedule.medication }, schedule));

    set('app_onboarding_complete','true');
    set('heartyCoreSetupDone','true');
    set('heartyOnboardingVersion','62');
    if(profile.name){ set('heartyUserName', profile.name); set('heartyFirstName', profile.name); }
    set('heartyCountry', profile.country); set('heartyRegion', profile.region); set('heartyUnitsSystem', profile.units);
    if(profile.heightCm) set('heartyHeightCm', profile.heightCm);
    if(profile.age) set('heartyAge', profile.age);
    if(profile.sex) set('heartySex', profile.sex);
    if(profile.startingWeightKg) { set('heartyStartingWeightKg', profile.startingWeightKg); set('heartyWeightStartingKg', profile.startingWeightKg); }
    if(profile.currentWeightKg) { set('heartyCurrentWeightKg', profile.currentWeightKg); set('heartyWeightCurrentKg', profile.currentWeightKg); }
    set('heartyDailyActivity', profile.dailyActivity); set('heartyExerciseActivity', profile.exerciseActivity);
    set('heartyMedicationType', schedule.medication); set('heartyInjectionName', schedule.medication); set('heartyMedicationCustomName', schedule.customMedicationName);
    set('heartyMedicationFrequency', schedule.frequency); set('heartyInjectionFrequency', schedule.frequency); set('heartyMedicationDays', schedule.days.join(',')); set('heartyInjectionDays', schedule.days.join(','));
    set('heartyInjectionDay', schedule.day); set('heartyInjectionDayName', schedule.dayName); set('heartyNextDoseDate', schedule.nextDoseDate); set('heartyMedicationNextDate', schedule.nextDoseDate); set('heartyInjectionReminderEnabled', schedule.reminderEnabled ? 'true' : 'false');

    try {
      const logs = readJSON('heartyWeightLogs', []);
      const arr = Array.isArray(logs) ? logs : [];
      if(profile.currentWeightKg && !arr.length){
        arr.push({ date:new Date().toISOString().slice(0,10), kg:Number(profile.currentWeightKg), createdAt:new Date().toISOString(), source:'app-onboarding-v62' });
        writeJSON('heartyWeightLogs', arr);
      }
    } catch(e){}

    try{
      if(window.HeartyData && typeof window.HeartyData.set === 'function'){
        window.HeartyData.set('settings.onboarding_complete', true);
        window.HeartyData.set('settings.units_system', profile.units);
        window.HeartyData.set('profile.first_name', profile.name || '');
        window.HeartyData.set('profile.country', profile.country || 'ZA');
        if(profile.currentWeightKg) window.HeartyData.set('profile.current_weight_kg', Number(profile.currentWeightKg));
        if(profile.startingWeightKg) window.HeartyData.set('profile.starting_weight_kg', Number(profile.startingWeightKg));
        if(schedule.medication) window.HeartyData.set('profile.medication_name', schedule.medication);
        if(schedule.nextDoseDate) window.HeartyData.set('profile.next_dose_date', schedule.nextDoseDate);
      }
    }catch(e){}

    try{
      window.dispatchEvent(new CustomEvent('hearty:onboarding-complete', { detail:{ profile, targets, schedule } }));
      window.dispatchEvent(new CustomEvent('hearty:onboardingProfileUpdated', { detail:profile }));
      window.dispatchEvent(new CustomEvent('hearty:medicationSetupUpdated', { detail:schedule }));
    }catch(e){}

    const msg = $('obSaveState');
    if(msg) msg.textContent = 'Saved. Meals can now use your profile estimates.';
    setTimeout(() => { window.location.href = './home.html'; }, 600);
  }

  function loadExisting(){
    const profile = readJSON(STORAGE_PROFILE, {}) || readJSON('heartyProfile', {}) || {};
    const schedule = readJSON('heartyMedicationSetupV1', {}) || readJSON('heartyInjectionSchedule', {}) || readJSON('heartyMedication', {}) || {};
    unit = profile.units || profile.unit || localStorage.getItem('heartyUnitsSystem') || 'metric';
    setValue('obName', profile.name || profile.firstName || localStorage.getItem('heartyFirstName') || '');
    setValue('obCountry', profile.country || profile.region || localStorage.getItem('heartyCountry') || 'ZA');
    setValue('obAge', profile.age || localStorage.getItem('heartyAge') || '');
    setValue('obSex', profile.sex || localStorage.getItem('heartySex') || '');
    setValue('obDailyActivity', profile.dailyActivity || localStorage.getItem('heartyDailyActivity') || '');
    setValue('obExerciseActivity', profile.exerciseActivity || profile.trainingLevel || localStorage.getItem('heartyExerciseActivity') || '');
    if(unit === 'imperial'){
      setValue('obHeightFt', profile.heightFt || ''); setValue('obHeightIn', profile.heightIn || '');
      setValue('obCurrentWeightLb', profile.currentWeightLb || (profile.currentWeightKg ? lbFromKg(profile.currentWeightKg) : ''));
      setValue('obStartingWeightLb', profile.startingWeightLb || (profile.startingWeightKg ? lbFromKg(profile.startingWeightKg) : ''));
    } else {
      setValue('obHeightCm', profile.heightCm || localStorage.getItem('heartyHeightCm') || '');
      setValue('obCurrentWeightKg', profile.currentWeightKg || localStorage.getItem('heartyCurrentWeightKg') || '');
      setValue('obStartingWeightKg', profile.startingWeightKg || localStorage.getItem('heartyStartingWeightKg') || '');
    }
    const medRaw = schedule.medicationRaw || schedule.type || schedule.medication || localStorage.getItem('heartyMedicationType') || '';
    const known = Array.from($('obMedication').options).some(o => o.value === medRaw || o.textContent === medRaw);
    setValue('obMedication', known ? medRaw : (medRaw ? 'Other' : ''));
    setValue('obMedicationCustom', schedule.customMedicationName || (!known ? medRaw : '') || '');
    setValue('obScheduleType', schedule.scheduleType || schedule.frequency || localStorage.getItem('heartyMedicationFrequency') || 'not_tracking');
    setValue('obIntervalDays', schedule.intervalDays || '');
    setValue('obNextDoseDate', schedule.nextDoseDate || localStorage.getItem('heartyNextDoseDate') || '');
    setValue('obReminderEnabled', schedule.reminderEnabled === false ? 'false' : 'true');
    const days = Array.isArray(schedule.days) ? schedule.days : String(localStorage.getItem('heartyMedicationDays') || '').split(',').filter(Boolean);
    qsa('[data-med-day]').forEach(btn => btn.classList.toggle('active', days.includes(String(btn.dataset.medDay))));
    setUnit(unit);
    syncConditionalFields();
  }

  function bind(){
    qsa('[data-unit-choice]').forEach(btn => btn.addEventListener('click', () => setUnit(btn.dataset.unitChoice)));
    qsa('[data-med-day]').forEach(btn => btn.addEventListener('click', () => { btn.classList.toggle('active'); renderReview(); }));
    ['obMedication','obScheduleType'].forEach(id => $(id)?.addEventListener('change', () => { syncConditionalFields(); renderReview(); updateTargetsPreview(); }));
    document.addEventListener('input', (event) => { if(event.target && event.target.closest('[data-onboarding-root]')) { renderReview(); updateTargetsPreview(); } }, true);
    document.addEventListener('change', (event) => { if(event.target && event.target.closest('[data-onboarding-root]')) { renderReview(); updateTargetsPreview(); } }, true);
    $('obBackBtn')?.addEventListener('click', () => { step = Math.max(0, step - 1); renderStep(); window.scrollTo({top:0, behavior:'smooth'}); });
    $('obNextBtn')?.addEventListener('click', () => { if(step >= 4){ saveAll(); return; } step = Math.min(4, step + 1); renderStep(); window.scrollTo({top:0, behavior:'smooth'}); });
  }

  function boot(){ loadExisting(); bind(); renderStep(); }
  if(document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

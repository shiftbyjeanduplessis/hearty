(function(){
  'use strict';

  const KEY = {
    profile:'heartyProfile', daily:'heartyDailyState', weightLogs:'heartyWeightLogs', water:'heartyWaterLog',
    photos:'heartyPhotoCheckins', medication:'heartyMedication', support:'heartySupportMode', theme:'heartyTheme', lessons:'heartyLessonsV1'
  };
  const PHOTO_INTERVAL_DAYS = 21;
  const RING_CIRC = 339.292;

  const LESSONS = [
    {
      title: 'What Actually Makes This Work',
      body: '<p>You do not need perfect days. You need repeatable ones.</p><p>GLP-1 medication can reduce appetite, but it does not automatically build a lifestyle. That is where many people get stuck. They eat less for a while, lose some weight, then drift because there is no daily structure holding the process together.</p><p>Hearty is built around rhythm: weigh in, hydrate, move, eat protein-first meals, and use Support Mode when the day is harder. These are small actions, but together they create a system that is difficult to fall out of.</p><p>The goal is not to be intense. The goal is to keep contact with the plan even on messy days. A low-energy day can still count if you drink water, eat something protein-based, and take a short walk.</p><p><strong>Today’s rule:</strong> do the smallest version of the plan rather than quitting the plan.</p>'
    },
    {
      title: 'The Appetite Trap',
      body: '<p>Lower appetite can feel like a win, especially in the first weeks. But eating as little as possible is not the goal.</p><p>If intake drops too low for too long, people often start feeling flat, weak, cold, irritable, or unmotivated. Training suffers. Protein drops. Muscle loss becomes more likely. Then, later, hunger can rebound and the plan starts feeling unstable.</p><p>The better target is: eat enough, but keep it simple. Start with protein, add vegetables or fruit, and include starch when your plan calls for it or when energy is low. Small meals are fine. Simple meals are fine. Skipping everything is not the goal.</p><p>On low-appetite days, think in anchors: yoghurt, eggs, tuna, chicken, cottage cheese, or a small protein-based meal. You are not trying to force huge portions. You are protecting the process.</p><p><strong>Today’s rule:</strong> low appetite means smaller food, not no food.</p>'
    },
    {
      title: 'Protein Is Your Insurance Policy',
      body: '<p>Weight loss is not just about becoming lighter. It is about losing fat while keeping as much muscle as possible.</p><p>Muscle matters because it shapes how your body looks, supports your joints, helps your metabolism, and makes daily life easier. If you lose too much muscle while losing weight, you can end up lighter but softer, weaker, and more likely to regain later.</p><p>GLP-1 medication does not protect muscle for you. Protein and strength work do that.</p><p>This is why Hearty keeps meals protein-forward. You do not need complicated macro tracking to start. Just ask one question before each meal: where is the protein?</p><p>Good options include eggs, chicken, fish, lean beef, tuna, yoghurt, cottage cheese, or another lean protein that fits your diet.</p><p><strong>Today’s rule:</strong> every meal starts with protein. Everything else comes after.</p>'
    },
    {
      title: 'Why Strength Beats Extra Cardio',
      body: '<p>Cardio can improve fitness and health, but it is not the main signal your body needs during weight loss.</p><p>When calories drop, your body becomes more willing to give up tissue it does not think it needs. Strength training tells your body: keep this muscle, we still use it.</p><p>That does not mean you need hard gym sessions from day one. For many users, the right starting point is simple: walking, wall push-ups, sit-to-stands, supported squats, light rows, and gradual progression. The goal is to build a body that can carry you well as weight comes down.</p><p>Extra cardio can sometimes increase fatigue and appetite without giving the same muscle-preserving signal. Strength work is the foundation. Walking supports it.</p><p><strong>Today’s rule:</strong> walk for health, strengthen for shape and long-term results.</p>'
    },
    {
      title: 'How to Use Support Mode Properly',
      body: '<p>Support Mode is not a failure button. It is a continuity button.</p><p>Some days on GLP-1 are harder: nausea, constipation, low appetite, reflux, fatigue, or just feeling off. Many people respond by abandoning the whole plan for the day. That creates an on-off pattern that becomes discouraging.</p><p>Support Mode is designed to keep you inside the system while lowering the demand. Meals become simpler. Movement becomes lighter. The goal changes from “perform well” to “stay connected.”</p><p>That might mean smaller meals, softer foods, more hydration focus, a shorter walk, or delaying intensity. You are not trying to prove toughness. You are trying to protect consistency.</p><p>Use Support Mode early. Do not wait until the day has already collapsed.</p><p><strong>Today’s rule:</strong> when symptoms rise, reduce the target instead of quitting the day.</p>'
    },
    {
      title: 'The Scale Is Useful, But It Lies Daily',
      body: '<p>The scale is a tool, not a verdict.</p><p>Daily weight can jump because of water, salt, constipation, hormones, travel, stress, late meals, hard workouts, or poor sleep. None of those automatically mean fat gain.</p><p>This is why Hearty cares about the trend, not one dramatic weigh-in. A single number can make you emotional. A trend gives you information.</p><p>Progress photos, waist measurements, clothes, energy, strength, and consistency all add context. The scale tells one part of the story. It does not tell the whole story.</p><p>The best habit is to weigh consistently, record it, and move on. Do not negotiate with the number all day.</p><p><strong>Today’s rule:</strong> log the weight, then judge progress by the pattern.</p>'
    },
    {
      title: 'Progress Photos Show What the Scale Misses',
      body: '<p>Photos can feel uncomfortable at first, but they are one of the most useful tools in a long fat-loss journey.</p><p>The scale can stay flat while your shape changes. This can happen when water shifts, digestion changes, or muscle is better preserved. Photos help you see changes that numbers hide.</p><p>You do not need perfect lighting or a dramatic pose. In fact, consistency matters more than looking good. Same mirror, same distance, same lighting, similar clothing. Front photo matters most. Side and back are helpful, but optional.</p><p>Do not use photos to punish yourself. Use them as evidence. Future you will be grateful that you captured the starting point clearly.</p><p><strong>Today’s rule:</strong> take honest photos for information, not judgment.</p>'
    },
    {
      title: 'Hydration Is Not a Wellness Bonus',
      body: '<p>Hydration becomes more important when appetite and intake drop.</p><p>If you are eating less, you may also be getting less fluid from food. Some people also drink less because they are not thinking about meals as often. That can worsen headaches, constipation, fatigue, and low energy.</p><p>Water will not magically cause fat loss, but dehydration can make the plan feel harder than it needs to be. The point of the water logger is not perfection. It is awareness.</p><p>Small amounts count. A glass now is better than a huge catch-up attempt at night. If plain water feels difficult, use safe options that suit you, like herbal tea or diluted sugar-free drinks.</p><p><strong>Today’s rule:</strong> log water early so hydration does not become an evening rescue mission.</p>'
    },
    {
      title: 'Hard Days Still Count',
      body: '<p>One of the biggest differences between successful and unsuccessful plans is how they handle bad days.</p><p>Most people do well when life is calm. The real test is nausea, stress, travel, low sleep, busy work, family pressure, or feeling disappointed by the scale. If the plan only works on perfect days, it is too fragile.</p><p>Hearty is built around minimum actions. On a hard day, you can still drink water, eat protein, walk briefly, and use Support Mode. That is not a wasted day. That is a maintenance day.</p><p>Maintenance days are powerful because they stop the “I failed, so I may as well stop” spiral.</p><p><strong>Today’s rule:</strong> never turn a hard day into a lost week.</p>'
    },
    {
      title: 'Your Long-Term Rhythm',
      body: '<p>The goal is not to live inside an app forever. The goal is to learn a rhythm that becomes normal.</p><p>At first, Hearty gives structure: daily tasks, lessons, meal planning, support adjustments, photos, weight tracking, and movement. Over time, these behaviours should start feeling familiar. You learn what meals work, what symptoms need support, what movement you can repeat, and what progress really looks like.</p><p>Long-term success usually comes from boring basics done consistently: protein, hydration, walking, strength, tracking, and flexible support when life is not ideal.</p><p>You are not trying to become a different person overnight. You are building a system that your future self can keep using.</p><p><strong>Today’s rule:</strong> make the plan simple enough to repeat and strong enough to trust.</p>'
    }
  ];
  const $ = (id) => document.getElementById(id);

  let state = { profile:{unit:'metric'}, daily:null, weightLogs:[], water:{}, photos:[], medication:{}, support:{active:false}, photoDraft:{}, setupStep:0 };
  let activePhotoSlot = null;

  function hasHD(){ return !!(window.HeartyData && typeof window.HeartyData.export === 'function'); }
  function hdData(){ try { return hasHD() ? window.HeartyData.export() : null; } catch(_) { return null; } }
  function hdSet(path, value){ try { if(window.HeartyData && typeof window.HeartyData.set === 'function') window.HeartyData.set(path, value); } catch(e){ console.warn('[Hearty] data layer set failed', path, e); } }
  function hdWeight(kg){ try { if(window.HeartyData && typeof window.HeartyData.logWeight === 'function') window.HeartyData.logWeight(kg); } catch(e){ console.warn('[Hearty] data layer weight failed', e); } }
  function hdHydration(litres){ try { if(window.HeartyData && typeof window.HeartyData.logHydration === 'function') window.HeartyData.logHydration(litres); } catch(e){ console.warn('[Hearty] data layer hydration failed', e); } }
  function hdSupport(value){ try { if(window.HeartyData && typeof window.HeartyData.setSupportState === 'function') window.HeartyData.setSupportState(value || ''); } catch(e){ console.warn('[Hearty] data layer support failed', e); } }
  function appendLegacyProgressPhotoSet(record){
    try{
      const key = 'hearty_progress_photos';
      const list = readJSON(key, []);
      const arr = Array.isArray(list) ? list : [];
      arr.push(record);
      writeJSON(key, arr);
      localStorage.setItem('heartyLastPhotoCheckInAt', record.date);
      localStorage.setItem('heartyLastPhotoCheckInCount', String(Object.keys(record.slots || {}).length));
      if(window.HeartyData && typeof window.HeartyData.set === 'function'){
        window.HeartyData.set('progress.photo_checkins', arr.map(x => ({ id:x.id, date:x.date, createdAt:x.createdAt, slots:x.slots, storage:'indexeddb_local_only' })));
      }
    }catch(e){ console.warn('[Hearty] legacy photo metadata failed', e); }
  }


  function todayKey(){const d=new Date();return `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,'0')}-${String(d.getDate()).padStart(2,'0')}`}
  function localDate(d = new Date()){
    if (!(d instanceof Date)) d = new Date(d);
    const y=d.getFullYear(); const m=String(d.getMonth()+1).padStart(2,'0'); const day=String(d.getDate()).padStart(2,'0');
    return `${y}-${m}-${day}`;
  }
  function prettyDate(iso){
    if (!iso) return 'not set';
    const [y,m,d] = iso.split('-').map(Number);
    return new Date(y, m-1, d).toLocaleDateString(undefined,{day:'numeric',month:'short'});
  }
  function addDays(iso, days){ const [y,m,d]=iso.split('-').map(Number); const dt=new Date(y,m-1,d); dt.setDate(dt.getDate()+days); return localDate(dt); }
  function daysBetween(a,b){ const [ay,am,ad]=a.split('-').map(Number); const [by,bm,bd]=b.split('-').map(Number); return Math.floor((new Date(by,bm-1,bd)-new Date(ay,am-1,ad))/86400000); }
  function readJSON(key, fallback){ try{ const raw=localStorage.getItem(key); return raw ? JSON.parse(raw) : fallback; }catch(_){ return fallback; } }
  function writeJSON(key, value){ try{ localStorage.setItem(key, JSON.stringify(value)); }catch(e){ console.warn('[Hearty] storage write failed', key, e); } }
  function num(v){ const n = Number(v); return Number.isFinite(n) ? n : null; }
  function clamp(v,min,max){ return Math.max(min, Math.min(max, v)); }
  function toast(msg){ const el=$('toast'); if(!el) return; el.textContent=msg; el.classList.add('show'); clearTimeout(toast.t); toast.t=setTimeout(()=>el.classList.remove('show'),2200); }


  let deferredInstallPrompt = null;
  function isInstalledMode(){ return window.matchMedia('(display-mode: standalone)').matches || window.navigator.standalone === true; }
  function maybeShowInstallPrompt(){
    if (!deferredInstallPrompt || !state.profile?.setupComplete || isInstalledMode() || document.getElementById('heartyInstallPrompt')) return;
    const bar = document.createElement('div');
    bar.id = 'heartyInstallPrompt';
    bar.className = 'install-prompt';
    bar.innerHTML = '<span>Install Hearty for a full-screen app experience.</span><button type="button">Install</button>';
    bar.querySelector('button').addEventListener('click', async () => {
      const promptEvent = deferredInstallPrompt;
      deferredInstallPrompt = null;
      bar.remove();
      try { promptEvent.prompt(); await promptEvent.userChoice; } catch (err) { console.warn('[Hearty] install prompt failed', err); }
    });
    document.body.appendChild(bar);
  }
  window.addEventListener('beforeinstallprompt', e => { e.preventDefault(); deferredInstallPrompt = e; maybeShowInstallPrompt(); });
  window.addEventListener('appinstalled', () => { deferredInstallPrompt = null; document.getElementById('heartyInstallPrompt')?.remove(); });

  function migrate(){
    const oldProfile = readJSON('hearty_profile', null) || readJSON('heartyUserProfile', null);
    if (!localStorage.getItem(KEY.profile) && oldProfile) writeJSON(KEY.profile, oldProfile);
    const oldTheme = localStorage.getItem('hearty-theme') || localStorage.getItem('hearty_theme');
    if (!localStorage.getItem(KEY.theme) && oldTheme) localStorage.setItem(KEY.theme, oldTheme);
    const oldLogs = readJSON('hearty_weight_logs', null) || readJSON('heartyProgress', null)?.weightLogs;
    if (!localStorage.getItem(KEY.weightLogs) && Array.isArray(oldLogs)) writeJSON(KEY.weightLogs, oldLogs);
  }

  function load(){
    migrate();
    try { if(window.HeartyData && typeof window.HeartyData.migrate === 'function') window.HeartyData.migrate('home_boot'); } catch(e){}
    state.profile = Object.assign({name:'',unit:'metric',targetWeight:null,setupComplete:false}, readJSON(KEY.profile, {}));
    state.weightLogs = Array.isArray(readJSON(KEY.weightLogs, [])) ? readJSON(KEY.weightLogs, []) : [];
    state.water = readJSON(KEY.water, {}) || {};
    state.photos = Array.isArray(readJSON(KEY.photos, [])) ? readJSON(KEY.photos, []) : [];
    state.medication = Object.assign({type:'',frequency:'weekly',day:1,lastDoseDate:''}, readJSON(KEY.medication, {}));
    state.support = Object.assign({active:false,type:''}, readJSON(KEY.support, {}));
    const canonical = hdData();
    if(canonical){
      const p = canonical.profile || {};
      const s = canonical.settings || {};
      const prog = canonical.progress || {};
      const sup = canonical.support || {};
      if(p.first_name && !state.profile.name) state.profile.name = p.first_name;
      if(s.units_system) state.profile.unit = s.units_system === 'imperial' ? 'imperial' : 'metric';
      if(p.target_weight_kg != null && !state.profile.targetWeightKg) state.profile.targetWeightKg = Number(p.target_weight_kg);
      if(s.onboarding_complete === true) state.profile.setupComplete = true;
      if(prog.weight_logs && typeof prog.weight_logs === 'object'){
        const mergedWeights = Object.values(prog.weight_logs).map(x => ({ date:x.date, kg:Number(x.weight_kg), createdAt:x.createdAt || x.updated_at || x.date })).filter(x => x.date && Number.isFinite(x.kg));
        if(mergedWeights.length) state.weightLogs = mergedWeights;
      }
      if(prog.hydration_logs && typeof prog.hydration_logs === 'object'){
        Object.values(prog.hydration_logs).forEach(x => { if(x && x.date) state.water[x.date] = Number(x.count || Math.round(Number(x.litres || 0)/0.25) || 0); });
      }
      if(p.medication_name && !state.medication.type) state.medication.type = p.medication_name;
      if(p.injection_day !== '' && p.injection_day != null) state.medication.day = Number(p.injection_day);
      if(s.injection_reminder_enabled === false) state.medication.reminderEnabled = false;
      state.support.active = !!(sup.active_state || state.support.active);
      state.support.type = sup.active_state || state.support.type || '';
    }
    const daily = readJSON(KEY.daily, null);
    const today = localDate();
    if (!daily || daily.date !== today) state.daily = {date:today,tasks:{weight:false,walk:false,photos:false,lesson:false}};
    else state.daily = Object.assign({date:today,tasks:{}}, daily);
    state.daily.tasks = Object.assign({weight:false,walk:false,photos:false,lesson:false}, state.daily.tasks || {});
    saveDaily();
  }
  function saveDaily(){ writeJSON(KEY.daily, state.daily); }
  function saveProfile(){
    writeJSON(KEY.profile, state.profile);
    hdSet('profile.first_name', state.profile.name || '');
    hdSet('settings.units_system', state.profile.unit === 'imperial' ? 'imperial' : 'metric');
    if(state.profile.targetWeightKg != null) hdSet('profile.target_weight_kg', Number(state.profile.targetWeightKg));
    hdSet('settings.onboarding_complete', !!state.profile.setupComplete);
  }

  function applyTheme(){
    const theme = localStorage.getItem(KEY.theme) || localStorage.getItem('hearty-theme') || 'clean_blue';
    document.documentElement.dataset.theme = theme;
  }

  function ring(id, pct){ const el=$(id); if(!el) return; el.style.strokeDashoffset = String(RING_CIRC * (1 - clamp(pct,0,100)/100)); }
  function unitLabel(){ return state.profile.unit === 'imperial' ? 'lb' : 'kg'; }
  function convertDisplay(kg){ return state.profile.unit === 'imperial' ? kg * 2.20462 : kg; }
  function convertToKg(value){ return state.profile.unit === 'imperial' ? value / 2.20462 : value; }
  function latestWeight(){
    const sorted = state.weightLogs.slice().filter(x=>num(x.kg)).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
    return sorted[sorted.length-1] || null;
  }
  function startWeight(){
    const sorted = state.weightLogs.slice().filter(x=>num(x.kg)).sort((a,b)=>String(a.date).localeCompare(String(b.date)));
    return sorted[0] || null;
  }

  function photoDueInfo(){
    const today = localDate();
    const last = state.photos.slice().sort((a,b)=>String(a.date).localeCompare(String(b.date))).pop();
    if (!last) return {due:true, next:today, last:null};
    const next = addDays(last.date, PHOTO_INTERVAL_DAYS);
    return {due: daysBetween(next, today) >= 0, next, last};
  }

  function taskCount(){
    const due = photoDueInfo().due || state.daily.tasks.photos;
    const keys = ['weight','walk','lesson']; if (due) keys.splice(2,0,'photos');
    const done = keys.filter(k=>state.daily.tasks[k]).length;
    return {total:keys.length, done, keys};
  }

  function renderHeader(){
    $('homeDayPill').textContent = new Date().toLocaleDateString(undefined,{weekday:'long',day:'numeric',month:'short'});
    const name = (state.profile.name || '').trim();
    $('welcomeTitle').textContent = name ? `Welcome back, ${name}` : 'Welcome to Hearty';
    $('dailyStatusLine').textContent = 'Your daily rhythm is ready.';
  }

  function renderProgress(){
    const cur = latestWeight(); const start = startWeight(); const targetKg = num(state.profile.targetWeightKg || state.profile.targetWeight);
    const unit = unitLabel();
    if (!cur){
      $('weightProgressMain').textContent = 'Add your first weigh-in';
      $('weightProgressMeta').textContent = 'Target weight must be provided by your doctor.';
      $('startWeightLabel').textContent = 'Start —'; $('targetWeightLabel').textContent = 'Target —';
      $('goalbarFill').style.width = '0%'; $('goalMarker').style.left = '100%'; return;
    }
    const curD = convertDisplay(cur.kg); $('weightProgressMain').textContent = `Current ${curD.toFixed(1)} ${unit}`;
    const startD = start ? convertDisplay(start.kg) : curD;
    $('startWeightLabel').textContent = `Start ${startD.toFixed(1)} ${unit}`;
    if (targetKg){
      const targetD = convertDisplay(targetKg); $('targetWeightLabel').textContent = `Target ${targetD.toFixed(1)} ${unit}`;
      const total = Math.abs(start.kg - targetKg) || 1; const moved = Math.abs(start.kg - cur.kg);
      const pct = clamp((moved/total)*100, 0, 100);
      $('weightProgressMeta').textContent = `${pct.toFixed(0)}% of doctor target path`;
      $('goalbarFill').style.width = pct + '%'; $('goalMarker').style.left = '100%';
    } else {
      $('targetWeightLabel').textContent = 'Target —'; $('weightProgressMeta').textContent = 'Target weight must be provided by your doctor.';
      $('goalbarFill').style.width = '20%'; $('goalMarker').style.left = '100%';
    }
  }

  function renderWater(){
    const today = localDate(); const count = clamp(Number(state.water[today] || 0), 0, 20); const target = 8;
    const pct = clamp((count/target)*100, 0, 100);
    $('waterValue').textContent = `${count}/${target}`;
    if ($('waterGlassCount')) $('waterGlassCount').textContent = `${count} / ${target}`;
    if ($('waterCountValue')) $('waterCountValue').textContent = String(count);
    if ($('waterCountHint')) $('waterCountHint').textContent = 'Tap once for each glass';
    if ($('waterCountChip')) $('waterCountChip').dataset.state = count ? 'active' : 'idle';
    if ($('waterProgressBar')) $('waterProgressBar').style.width = `${pct}%`;
    $('waterUndo').disabled = count <= 0; ring('waterRing', pct);
  }

  function renderMedication(){
    const med = state.medication || {}; const title = med.type ? `${med.type} reminder` : 'Dose reminder'; $('medicationTitle').textContent = title;
    const today = localDate(); const due = med.frequency === 'daily' || (med.frequency === 'weekly' && Number(med.day) === new Date().getDay());
    const logged = med.lastDoseDate === today;
    $('injectionCard').classList.toggle('due', due && !logged); $('injectionCard').classList.toggle('logged', logged); $('logDoseBtn').classList.toggle('active', logged);
    if (!med.type) $('nextInjectionDateText').textContent = 'Set your medication schedule during setup.';
    else if (logged) $('nextInjectionDateText').textContent = 'Dose logged for today.';
    else if (due) $('nextInjectionDateText').textContent = 'Dose due today.';
    else $('nextInjectionDateText').textContent = med.frequency === 'weekly' ? 'Next weekly dose is on your selected day.' : 'Medication schedule active.';
  }

  function renderSupport(){
    const active = !!state.support.active; $('supportLed').classList.toggle('active', active); $('supportCard').classList.toggle('is-active', active);
    $('supportSubtext').textContent = active ? 'Support Mode is active. Meals and movement should feel gentler today.' : 'If side effects are getting in the way, switch to a softer day from the Support page.';
    $('supportOff').disabled = !active;
  }


  function loadLessonState(){
    const raw = readJSON(KEY.lessons, {});
    return {
      completedCount: clamp(Number(raw.completedCount || 0), 0, LESSONS.length),
      lastCompletedDate: raw.lastCompletedDate || '',
      startedDate: raw.startedDate || localDate()
    };
  }
  function saveLessonState(value){ writeJSON(KEY.lessons, value); }
  function activeLessonIndex(lessonState){
    if (lessonState.completedCount >= LESSONS.length) return LESSONS.length - 1;
    if (lessonState.lastCompletedDate === localDate() && lessonState.completedCount > 0) return lessonState.completedCount - 1;
    return lessonState.completedCount;
  }
  function renderLesson(){
    const lessonState = loadLessonState();
    const today = localDate();
    const completedToday = lessonState.lastCompletedDate === today;
    const allDone = lessonState.completedCount >= LESSONS.length;
    const idx = activeLessonIndex(lessonState);
    const lesson = LESSONS[idx] || LESSONS[0];
    if ($('lessonCounter')) $('lessonCounter').textContent = allDone ? 'Lessons complete' : `Lesson ${idx + 1}/${LESSONS.length}`;
    if ($('lessonTitle')) $('lessonTitle').textContent = allDone && !completedToday ? 'Daily lessons complete' : lesson.title;
    if ($('lessonSheetSub')) $('lessonSheetSub').textContent = completedToday ? 'Today’s lesson is complete. The next lesson unlocks tomorrow.' : 'One short practical lesson each day.';
    if ($('lessonBody')) $('lessonBody').innerHTML = allDone && !completedToday ? '<p>You have completed the 10-day Hearty lesson sequence.</p><p>Keep repeating the daily rhythm: weigh in, hydrate, move, eat protein-forward meals, and use Support Mode when needed.</p>' : lesson.body;
    if ($('lessonSub')) $('lessonSub').textContent = completedToday ? 'Today’s lesson complete.' : allDone ? 'Lesson series complete.' : `Lesson ${idx + 1}/${LESSONS.length} • ${lesson.title}`;
    if ($('completeLessonBtn')){
      $('completeLessonBtn').disabled = completedToday || (allDone && !completedToday);
      $('completeLessonBtn').textContent = completedToday ? 'Lesson complete' : 'Mark lesson complete';
    }
    if (state.daily.tasks.lesson !== completedToday){ state.daily.tasks.lesson = completedToday; saveDaily(); }
  }

  function renderTasks(){
    const info = photoDueInfo(); const counts = taskCount();
    $('photoTaskSub').textContent = state.daily.tasks.photos ? 'Photo check-in complete for today.' : info.due ? 'Due today • every 3 weeks.' : `Not due yet • next ${prettyDate(info.next)}.`;
    $('photoTask').classList.toggle('not-due', !info.due && !state.daily.tasks.photos);
    ['weight','walk','photos','lesson'].forEach(k=>{
      const row = $(k === 'weight' ? 'weighInTask' : k === 'walk' ? 'walkTask' : k === 'photos' ? 'photoTask' : 'lessonTaskItem');
      const btn = $(k === 'weight' ? 'openWeightBtn' : k === 'walk' ? 'toggleWalkBtn' : k === 'photos' ? 'openPhotoBtn' : 'openLessonBtn');
      const done = !!state.daily.tasks[k]; row.classList.toggle('completed', done); btn.classList.toggle('done', done);
    });
    $('protocolSummary').textContent = `${counts.done} of ${counts.total} complete`;
    $('protocolComplete').classList.toggle('show', counts.done === counts.total);
    const next = counts.keys.find(k=>!state.daily.tasks[k]);
    $('nextActionText').textContent = next === 'weight' ? 'Record today’s weight' : next === 'walk' ? 'Complete your movement baseline' : next === 'photos' ? 'Take progress photos' : next === 'lesson' ? 'Read today’s lesson' : 'All core tasks complete';
    const pct = counts.total ? Math.round((counts.done/counts.total)*100) : 0;
    $('adherenceValue').textContent = `${pct}%`; $('adherenceCaption').textContent = counts.done === counts.total ? 'All core tasks complete.' : 'Complete your core tasks.'; ring('adherenceRing', pct);
  }

  function renderAll(){ renderHeader(); renderWater(); renderProgress(); renderMedication(); renderSupport(); renderLesson(); renderTasks(); }

  function openSheet(id){ const el=$(id); if(!el) return; el.hidden=false; el.setAttribute('aria-hidden','false'); document.body.classList.add('no-scroll'); }
  function closeSheets(){ document.querySelectorAll('.sheet-overlay').forEach(el=>{ el.hidden=true; el.setAttribute('aria-hidden','true'); }); document.body.classList.remove('no-scroll'); }

  function bindWeight(){
    $('openWeightBtn').addEventListener('click',()=>{ const cur=latestWeight(); $('weightValueInput').value = cur ? convertDisplay(cur.kg).toFixed(1) : ''; $('weightUnitLabel').textContent = unitLabel().toUpperCase(); openSheet('weightSheet'); });
    $('saveWeightBtn').addEventListener('click',()=>{
      const val = num($('weightValueInput').value); if(!val){ toast('Add a valid weight.'); return; }
      const kg = convertToKg(val); const today = localDate();
      state.weightLogs = state.weightLogs.filter(x=>x.date !== today); state.weightLogs.push({date:today,kg,createdAt:new Date().toISOString()}); writeJSON(KEY.weightLogs,state.weightLogs);
      hdWeight(kg);
      state.daily.tasks.weight = true; saveDaily(); closeSheets(); renderAll(); toast('Weight saved.');
    });
  }

  function bindWater(){
    $('waterGlass').addEventListener('click',()=>{ const d=localDate(); state.water[d]=clamp(Number(state.water[d]||0)+1,0,20); writeJSON(KEY.water,state.water); hdHydration(state.water[d] * 0.25); renderWater(); });
    $('waterUndo').addEventListener('click',()=>{ const d=localDate(); state.water[d]=clamp(Number(state.water[d]||0)-1,0,20); writeJSON(KEY.water,state.water); hdHydration(state.water[d] * 0.25); renderWater(); });
  }

  function bindTasks(){
    $('toggleWalkBtn').addEventListener('click',()=>{ state.daily.tasks.walk = !state.daily.tasks.walk; saveDaily(); renderAll(); });
    $('openLessonBtn').addEventListener('click',()=>{ renderLesson(); openSheet('lessonSheet'); });
    $('completeLessonBtn').addEventListener('click',()=>{
      const lessonState = loadLessonState();
      const today = localDate();
      if (lessonState.lastCompletedDate === today) return;
      const idx = activeLessonIndex(lessonState);
      lessonState.completedCount = clamp(Math.max(lessonState.completedCount, idx + 1), 0, LESSONS.length);
      lessonState.lastCompletedDate = today;
      lessonState.startedDate = lessonState.startedDate || today;
      saveLessonState(lessonState);
      state.daily.tasks.lesson = true; saveDaily(); closeSheets(); renderAll();
    });
    $('supportOff').addEventListener('click',()=>{ state.support.active=false; state.support.type=''; writeJSON(KEY.support,state.support); hdSupport(''); renderSupport(); toast('Support Mode off.'); });
    $('logDoseBtn').addEventListener('click',()=>{ state.medication.lastDoseDate = localDate(); writeJSON(KEY.medication,state.medication); try{ hdSet('progress.injection_logs.' + localDate(), {date:localDate(), logged:true, source:'home'}); }catch(e){} renderMedication(); toast('Dose logged.'); });
  }

  function dbOpen(){
    return new Promise((resolve,reject)=>{ const req=indexedDB.open('hearty-home',1); req.onupgradeneeded=()=>{ if(!req.result.objectStoreNames.contains('photos')) req.result.createObjectStore('photos'); }; req.onsuccess=()=>resolve(req.result); req.onerror=()=>reject(req.error); });
  }
  async function dbPut(key, blob){ const db=await dbOpen(); return new Promise((res,rej)=>{ const tx=db.transaction('photos','readwrite'); tx.objectStore('photos').put(blob,key); tx.oncomplete=res; tx.onerror=()=>rej(tx.error); }); }
  async function compress(file){
    const bmp = await createImageBitmap(file); const max=900; const scale=Math.min(1,max/Math.max(bmp.width,bmp.height));
    const c=document.createElement('canvas'); c.width=Math.round(bmp.width*scale); c.height=Math.round(bmp.height*scale);
    c.getContext('2d').drawImage(bmp,0,0,c.width,c.height); return await new Promise(res=>c.toBlob(res,'image/jpeg',0.72));
  }
  function updatePhotoUI(){
    const slots = ['front','side','back'];
    slots.forEach(slot=>{ const btn=document.querySelector(`[data-photo-slot="${slot}"]`); if(!btn) return; const img=btn.querySelector('img'); const has=!!state.photoDraft[slot]; btn.classList.toggle('has-file',has); btn.querySelector('em').textContent=has?'Added':'Choose'; if(has){ img.src=state.photoDraft[slot].preview; img.hidden=false; } else { img.hidden=true; img.removeAttribute('src'); }});
    const count = Object.keys(state.photoDraft).length; const complete=$('completePhotoBtn'); complete.disabled=!state.photoDraft.front; complete.textContent=state.photoDraft.front?`Complete photo check-in (${count})`:'Add front photo to complete';
  }
  function bindPhotos(){
    $('openPhotoBtn').addEventListener('click',()=>{ state.photoDraft={}; updatePhotoUI(); openSheet('photoSheet'); });
    document.querySelectorAll('[data-photo-slot]').forEach(btn=>btn.addEventListener('click',()=>{ activePhotoSlot=btn.dataset.photoSlot; const input=$('photoInput'); input.value=''; const capture=activePhotoSlot==='front'?'user':'environment'; input.setAttribute('capture',capture); input.capture=capture; input.click(); }));
    $('photoInput').addEventListener('change',async e=>{
      const file=e.target.files && e.target.files[0]; if(!file || !activePhotoSlot) return;
      try{
        const blob=await compress(file); const preview=URL.createObjectURL(blob); state.photoDraft[activePhotoSlot]={blob,preview}; updatePhotoUI();
      }catch(err){ console.warn(err); toast('Photo could not be loaded.'); }
    });
    $('completePhotoBtn').addEventListener('click',async()=>{
      if(!state.photoDraft.front){ toast('Add front photo first.'); return; }
      const today=localDate(); const id=`photos-${today}-${Date.now()}`; const slots=Object.keys(state.photoDraft);
      try{ for (const slot of slots) await dbPut(`${id}-${slot}`, state.photoDraft[slot].blob); }catch(err){ console.warn(err); toast('Photo storage failed.'); return; }
      const slotMeta = {};
      slots.forEach(slot => { slotMeta[slot] = { dbKey:`${id}-${slot}`, storage:'indexeddb', scope:'progress-photo' }; });
      const record = {id,date:today,slots:slotMeta,createdAt:new Date().toISOString(),scope:'progress-photo',storage:'indexeddb_local_only'};
      state.photos.push(record); writeJSON(KEY.photos,state.photos);
      appendLegacyProgressPhotoSet(record);
      state.daily.tasks.photos=true; saveDaily(); closeSheets(); renderAll(); toast('Photo check-in complete.');
    });
  }

  function bindSetup(){
    document.querySelectorAll('[data-unit]').forEach(btn=>btn.addEventListener('click',()=>{ state.profile.unit=btn.dataset.unit; document.querySelectorAll('[data-unit]').forEach(b=>b.classList.toggle('active',b.dataset.unit===state.profile.unit)); }));
    function showStep(){ document.querySelectorAll('.setup-step').forEach(el=>el.hidden=Number(el.dataset.step)!==state.setupStep); $('coreSetupBackBtn').disabled=state.setupStep===0; $('coreSetupNextBtn').textContent=state.setupStep>=4?'Finish':'Next'; }
    $('coreSetupBackBtn').addEventListener('click',()=>{ state.setupStep=Math.max(0,state.setupStep-1); showStep(); });
    $('coreSetupNextBtn').addEventListener('click',()=>{
      if(state.setupStep===0){ state.profile.name=$('coreSetupName').value.trim(); }
      if(state.setupStep===1){ const v=num($('coreSetupTargetWeight').value); if(v) state.profile.targetWeightKg=convertToKg(v); }
      if(state.setupStep===2){ state.medication.type=$('coreSetupMedication').value; }
      if(state.setupStep===3){ state.medication.frequency=$('coreSetupFrequency').value; }
      if(state.setupStep===4){
        state.medication.day=Number($('coreSetupDaysField').value);
        state.profile.setupComplete=true;
        saveProfile();
        writeJSON(KEY.medication,state.medication);
        hdSet('profile.medication_name', state.medication.type || '');
        hdSet('profile.injection_name', state.medication.type || '');
        hdSet('profile.injection_day', String(state.medication.day));
        hdSet('settings.onboarding_complete', true);
        closeSheets(); renderAll(); toast('Hearty setup complete.'); maybeShowInstallPrompt(); return;
      }
      state.setupStep++; showStep();
    });
    document.querySelector(`[data-unit="${state.profile.unit||'metric'}"]`)?.classList.add('active');
    if(!state.profile.setupComplete){ state.setupStep=0; showStep(); openSheet('coreSetupSheet'); }
  }

  function bindClose(){
    document.querySelectorAll('[data-close-sheet]').forEach(btn=>btn.addEventListener('click',closeSheets));
    document.querySelectorAll('.sheet-overlay').forEach(el=>el.addEventListener('click',e=>{ if(e.target===el) closeSheets(); }));
    document.addEventListener('keydown',e=>{ if(e.key==='Escape') closeSheets(); });
  }

  function boot(){
    applyTheme(); load(); bindClose(); bindWeight(); bindWater(); bindTasks(); bindPhotos(); bindSetup(); renderAll();
    maybeShowInstallPrompt();
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

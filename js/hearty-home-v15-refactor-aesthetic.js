(function(){
  'use strict';

  const KEY = {
    profile:'heartyProfile', daily:'heartyDailyState', weightLogs:'heartyWeightLogs', water:'heartyWaterLog',
    photos:'heartyPhotoCheckins', medication:'heartyMedication', support:'heartySupportMode', theme:'heartyTheme', lessons:'heartyLessonsV1'
  };
  const PHOTO_INTERVAL_DAYS = 21;
  const RING_CIRC = 339.292;

  const LESSONS = [
    {"icon": "🧭", "title": "What Actually Makes This Work", "body": "\n<p>Hearty works because it turns a big, emotional goal into a small daily rhythm. GLP-1 medication can reduce appetite, but it does not automatically create structure. People still need to drink, eat enough protein, move their bodies, take progress seriously, and know what to do when side effects get in the way.</p>\n<p>The trap is thinking the medication should do everything. When appetite drops, it can feel like the plan is working by itself. But if the day has no structure, the basics often disappear quietly. Water drops. Protein drops. Movement drops. Strength drops. Then the person may lose weight, but also feel flat, weak, tired, or disconnected from their own progress.</p>\n<p>The daily rhythm is the safety rail. You weigh in so you have feedback. You log water so hydration does not become an afterthought. You move because strength and confidence matter. You use meals as anchors, not punishment. You use Support Mode when symptoms make a normal day unrealistic.</p>\n<p>None of this needs to be perfect. In fact, the most successful rhythm is usually boring and repeatable. A low-energy day can still count if you do the smallest useful version: drink some water, eat something protein-forward, walk gently, and stay connected to the plan.</p>\n<div class=\"lesson-callout\">🧭 <strong>Today’s focus:</strong> do the smallest version of the plan rather than quitting the plan.</div>\n"},
    {"icon": "🍽️", "title": "The Appetite Trap", "body": "\n<p>Lower appetite can feel like a breakthrough, especially if food used to feel difficult to control. But eating as little as possible is not the goal. The goal is to lose weight while keeping your body nourished enough to function, recover, and stay strong.</p>\n<p>When intake drops too low for too long, people often start to feel dull, cold, weak, emotional, or unmotivated. Training feels harder. Constipation and headaches can become worse. Protein drops. Muscle loss becomes more likely. Then, later, hunger can rebound and the plan starts to feel unstable.</p>\n<p>A better target is simple, steady intake. You do not need large meals if your appetite is low. You need anchors. Examples include yoghurt, eggs, tuna, chicken, cottage cheese, lean meat, fish, soup with protein, or a smaller plate built around protein and vegetables. Small meals are fine. Simple meals are fine. Skipping everything is not the goal.</p>\n<p>Think of food as a tool, not a test of willpower. On GLP-1 medication, the question is often not “How little can I eat?” but “What is the smallest useful meal that protects my body today?”</p>\n<div class=\"lesson-callout\">🍽️ <strong>Today’s focus:</strong> low appetite means smaller food, not no food.</div>\n"},
    {"icon": "💧", "title": "Hydration Is Not a Wellness Bonus", "body": "\n<p>Hydration becomes more important when appetite and food intake drop. If you are eating less, you may also be getting less fluid from food. Some people also drink less because meals are no longer acting as reminders. Over time, that can worsen headaches, constipation, fatigue, dizziness, and low energy.</p>\n<p>Water will not magically cause fat loss, but dehydration can make the whole process feel harder than it needs to be. It can also make normal medication side effects feel more intense. This is why the water tracker is not decoration. It is there to keep hydration visible before the day gets away from you.</p>\n<p>The goal is not to drink everything at night in a panic. Small amounts earlier in the day work better. A glass in the morning, another mid-morning, another with lunch, and another in the afternoon can change how the day feels. If plain water is difficult, safe options like herbal tea, diluted sugar-free drinks, or water with lemon can help.</p>\n<p>Your hydration target does not have to be perfect every day. The point is awareness and steady contact. Each glass is a small vote for feeling better later.</p>\n<div class=\"lesson-callout\">💧 <strong>Today’s focus:</strong> log water early so hydration does not become an evening rescue mission.</div>\n"},
    {"icon": "🥩", "title": "Protein Is Your Insurance Policy", "body": "\n<p>Protein matters because weight loss is not only about becoming lighter. It is also about protecting the body you are living in. When appetite drops, protein is often one of the first things to fall. That can increase the risk of losing muscle along with fat.</p>\n<p>Muscle matters for strength, shape, blood sugar control, posture, daily energy, and long-term weight maintenance. You do not need to become a bodybuilder. You simply need to give your body a reason and the building blocks to hold onto useful tissue while weight comes down.</p>\n<p>This is why Hearty keeps meals protein-forward. The idea is not complicated: start with protein, then add vegetables, fruit, and starch according to the plan and your tolerance. On low-appetite days, protein can be simple: yoghurt, eggs, tuna, chicken, lean mince, fish, cottage cheese, or a smaller portion of leftovers.</p>\n<p>If you cannot finish a full meal, try to finish the protein first. If a normal dinner feels too much, use a smaller protein-based meal. If you feel nauseous, use Support Mode and simplify the day. The habit is not “eat perfectly.” The habit is “protect protein whenever possible.”</p>\n<div class=\"lesson-callout\">🥩 <strong>Today’s focus:</strong> build meals around protein before worrying about perfection.</div>\n"},
    {"icon": "🚶", "title": "Movement Is a Signal, Not a Punishment", "body": "\n<p>Movement is not here to punish you for eating or to “earn” weight loss. It is here to send your body a signal: keep using muscle, keep joints moving, keep confidence growing, keep the routine alive.</p>\n<p>For many people starting GLP-1 medication, the biggest win is not intense exercise. It is consistency. A short walk, a simple strength session, or gentle movement on a low-energy day can protect momentum. When you repeat small movement often enough, your body starts to trust the rhythm.</p>\n<p>Strength matters because fast weight loss without resistance can cost muscle. Walking matters because it is accessible and helps daily energy. Neither needs to be extreme. The goal is to become a person who keeps moving in a way that is realistic for your current body and current life.</p>\n<p>Some days will be strong days. Some days will be Support Mode days. Both can count. What you want to avoid is the all-or-nothing pattern where missing one ideal session turns into a week of doing nothing.</p>\n<div class=\"lesson-callout\">🚶 <strong>Today’s focus:</strong> movement is a vote for continuity, not a punishment.</div>\n"},
    {"icon": "📸", "title": "Progress Photos Show What the Scale Misses", "body": "\n<p>Progress photos can feel uncomfortable at first, but they are one of the most useful tools in a long weight-loss journey. The scale can be noisy. Water shifts, digestion changes, hormones, salt, stress, and sleep can all affect the number. Photos help show changes the scale may hide.</p>\n<p>You do not need perfect lighting or a dramatic pose. In fact, consistency matters more than looking good. Use the same mirror or space, similar lighting, similar clothing, and similar distance from the camera. Front photo matters most. Side and back are helpful, but optional.</p>\n<p>Photos are not there to shame you. They are evidence. Many people only realise they have changed when they compare photos weeks apart. This is why Hearty uses a 3-week photo rhythm instead of asking for photos every day. Daily photos can become obsessive. Three-week check-ins give change enough time to become visible.</p>\n<p>Keep progress photos private and practical. Take them, store them, and move on. Future you may be grateful that you captured the starting point clearly.</p>\n<div class=\"lesson-callout\">📸 <strong>Today’s focus:</strong> take honest photos for information, not judgment.</div>\n"},
    {"icon": "⚖️", "title": "The Scale Is Feedback, Not a Verdict", "body": "\n<p>The scale is useful, but it is not your judge. A daily weigh-in gives feedback, but a single number can be affected by water, digestion, salt, sleep, training, stress, and timing. That is why one weigh-in should not control your mood for the whole day.</p>\n<p>The skill is to weigh consistently, record the number, and then look at the pattern. The trend matters more than the drama of one morning. If you weigh at random times or only when you feel “good,” the data becomes less useful. A simple routine is better: first thing in the morning, before eating or drinking.</p>\n<p>It is also important not to chase a target weight without medical guidance. In Hearty, the target weight is something your doctor should help set. Your job is to build the daily rhythm and track the trend honestly.</p>\n<p>If the scale is up today, it does not mean the plan failed. If it is down today, it does not mean every habit is perfect. It is one piece of evidence. Use it, but do not hand it your self-worth.</p>\n<div class=\"lesson-callout\">⚖️ <strong>Today’s focus:</strong> log the weight, then judge progress by the pattern.</div>\n"},
    {"icon": "🤲", "title": "Support Mode Is Part of the Plan", "body": "\n<p>Hard days are not exceptions. They are part of real life. Nausea, constipation, fatigue, stress, low sleep, travel, and emotional days will happen. A plan that only works on perfect days is too fragile.</p>\n<p>Support Mode exists so you do not have to choose between forcing the normal plan and quitting completely. It gives you a softer day. Meals can become simpler. Movement can become lighter. The goal is to reduce friction while keeping you connected to the rhythm.</p>\n<p>This matters because people often spiral after one bad day. They feel unwell, miss meals, skip water, avoid movement, then decide the week is ruined. Support Mode is the opposite. It says: “Today is not normal, so we adjust. We do not disappear.”</p>\n<p>Using support is not weakness. It is a strategy. The most sustainable plans have flexible rules for difficult days. You can still protect hydration, protein, movement, and medication reminders without pretending you feel amazing.</p>\n<div class=\"lesson-callout\">🤲 <strong>Today’s focus:</strong> adjust the day before it becomes a lost week.</div>\n"},
    {"icon": "🛒", "title": "Meal Planning Removes Decisions", "body": "\n<p>One reason people struggle is not lack of knowledge. It is decision fatigue. When every meal has to be invented from scratch, the day becomes harder. When appetite is low or symptoms are present, decision-making becomes even more difficult.</p>\n<p>A weekly meal plan reduces the number of choices you have to make. You already know the direction. You can shop once, prepare simple ingredients, and use leftovers intelligently. This does not mean you must follow every meal perfectly. It means there is a default path waiting for you.</p>\n<p>The best meal plan is realistic. It should use foods you actually eat, portions you understand, and meals that can survive normal life. Some days you will swap meals. Some days you will use a simpler option. Some days Support Mode will adjust the plan. That is fine.</p>\n<p>The point is to avoid starting from zero every day. A plan creates less friction. Less friction makes consistency easier.</p>\n<div class=\"lesson-callout\">🛒 <strong>Today’s focus:</strong> use the meal plan as a default path, not a prison.</div>\n"},
    {"icon": "🌱", "title": "Your Long-Term Rhythm", "body": "\n<p>The goal is not to live inside an app forever. The goal is to learn a rhythm that becomes normal. At first, Hearty gives structure: daily tasks, lessons, meal planning, support adjustments, photos, weight tracking, hydration, medication reminders, and movement.</p>\n<p>Over time, these behaviours should start to feel familiar. You learn what meals work. You learn what symptoms need support. You learn what movement you can repeat. You learn how your weight trend behaves. You learn that bad days do not need to become lost weeks.</p>\n<p>Long-term success usually comes from boring basics done consistently: protein, hydration, walking, strength, tracking, and flexible support when life is not ideal. The basics are not flashy, but they are powerful because they survive normal life.</p>\n<p>You are not trying to become a different person overnight. You are building a system your future self can keep using. That system should be simple enough to repeat and strong enough to trust.</p>\n<div class=\"lesson-callout\">🌱 <strong>Today’s focus:</strong> make the plan simple enough to repeat and strong enough to trust.</div>\n"}
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
  function weekdayNameFromNumber(day){
    const names = ['Sunday','Monday','Tuesday','Wednesday','Thursday','Friday','Saturday'];
    const n = Number(day);
    return names[Number.isFinite(n) && n >= 0 && n <= 6 ? n : 1];
  }
  function frequencyDays(value){
    return value === 'daily' ? 1 : 7;
  }
  function saveInjectionBridge(){
    try{
      const med = state.medication || {};
      const dayName = weekdayNameFromNumber(med.day);
      const schedule = { day:dayName, frequency:frequencyDays(med.frequency), source:'home', updatedAt:new Date().toISOString() };
      writeJSON('heartyInjectionSchedule', schedule);
      if(med.type) localStorage.setItem('heartyMedicationType', med.type);
      if(med.type) localStorage.setItem('heartyInjectionName', med.type);
      localStorage.setItem('heartyInjectionDay', dayName);
      localStorage.setItem('heartyInjectionDayNumber', String(Number(med.day)));
      localStorage.setItem('heartyInjectionFrequency', med.frequency || 'weekly');
      if(!localStorage.getItem('heartyCurrentDosage')) localStorage.setItem('heartyCurrentDosage', 'Not set');
      if(window.HeartyData && typeof window.HeartyData.set === 'function'){
        window.HeartyData.set('profile.medication_name', med.type || '');
        window.HeartyData.set('profile.injection_name', med.type || '');
        window.HeartyData.set('profile.injection_day', String(Number(med.day)));
        window.HeartyData.set('profile.injection_day_name', dayName);
        window.HeartyData.set('profile.injection_frequency', med.frequency || 'weekly');
      }
    }catch(e){ console.warn('[Hearty] injection bridge save failed', e); }
  }
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
  function isIOSDevice(){ return /iphone|ipad|ipod/i.test(navigator.userAgent) || (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 1); }
  function isAndroidDevice(){ return /android/i.test(navigator.userAgent); }
  function isChromeLike(){ return /Chrome|CriOS|EdgA|Edg\//.test(navigator.userAgent) && !/FBAN|FBAV|Instagram|Line|WhatsApp/i.test(navigator.userAgent); }

  function installHelpCopy(){
    if(isIOSDevice()){
      return {
        title:'Install Hearty',
        copy:'On iPhone: tap Share, then Add to Home Screen. The installed app opens without the browser bar.',
        action:'Show steps',
        mode:'ios'
      };
    }

    if(isAndroidDevice()){
      return {
        title:'Install Hearty',
        copy: deferredInstallPrompt ? 'Add Hearty to your home screen for the full-screen app experience.' : 'Open this page in Chrome, then use the menu to install the app if the prompt is not visible yet.',
        action: deferredInstallPrompt ? 'Install' : 'How to install',
        mode: deferredInstallPrompt ? 'prompt' : 'android-help'
      };
    }

    return {
      title:'Install Hearty',
      copy: deferredInstallPrompt ? 'Install Hearty for a full-screen app experience.' : 'Use your browser menu to install Hearty when available.',
      action: deferredInstallPrompt ? 'Install' : 'Got it',
      mode: deferredInstallPrompt ? 'prompt' : 'desktop-help'
    };
  }

  function showInstallSteps(mode){
    const message = mode === 'ios'
      ? 'iPhone install: tap the Share icon in Safari, scroll down, then tap Add to Home Screen.'
      : 'Android install: open in Chrome, tap the three-dot menu, then tap Install app or Add to Home screen.';
    toast(message);
  }

  function maybeShowInstallPrompt(force){
    if (isInstalledMode() || document.getElementById('heartyInstallPrompt')) return;

    try{
      const dismissedUntil = Number(localStorage.getItem('heartyInstallDismissedUntil') || 0);
      if(!force && dismissedUntil && Date.now() < dismissedUntil) return;
    }catch(e){}

    const info = installHelpCopy();
    const bar = document.createElement('div');
    bar.id = 'heartyInstallPrompt';
    bar.className = 'install-prompt';
    bar.innerHTML = `
      <div class="install-prompt-copy">
        <strong>${info.title}</strong>
        <span>${info.copy}</span>
      </div>
      <div class="install-prompt-actions">
        <button type="button" class="install-prompt-primary">${info.action}</button>
        <button type="button" class="install-prompt-close" aria-label="Dismiss install prompt">×</button>
      </div>
    `;

    bar.querySelector('.install-prompt-primary').addEventListener('click', async () => {
      if(info.mode === 'prompt' && deferredInstallPrompt){
        const promptEvent = deferredInstallPrompt;
        deferredInstallPrompt = null;
        try {
          promptEvent.prompt();
          await promptEvent.userChoice;
          bar.remove();
        } catch (err) {
          console.warn('[Hearty] install prompt failed', err);
          showInstallSteps(isIOSDevice() ? 'ios' : 'android');
        }
      } else {
        showInstallSteps(info.mode);
      }
    });

    bar.querySelector('.install-prompt-close').addEventListener('click', () => {
      try{ localStorage.setItem('heartyInstallDismissedUntil', String(Date.now() + 3*24*60*60*1000)); }catch(e){}
      bar.remove();
    });

    document.body.appendChild(bar);
  }

  window.addEventListener('beforeinstallprompt', e => {
    e.preventDefault();
    deferredInstallPrompt = e;
    document.getElementById('heartyInstallPrompt')?.remove();
    maybeShowInstallPrompt(true);
  });

  window.addEventListener('appinstalled', () => {
    deferredInstallPrompt = null;
    document.getElementById('heartyInstallPrompt')?.remove();
    toast('Hearty installed.');
  });

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
    try{
      const legacyTask = readJSON('heartyDailyTask:' + today, null) || readJSON('heartyTask:' + today, null);
      if(legacyTask && typeof legacyTask === 'object'){
        const taskObj = legacyTask.tasks || legacyTask;
        state.daily.tasks = Object.assign(state.daily.tasks, taskObj);
      }
      const logs = (canonical && canonical.progress && canonical.progress.task_logs) || {};
      const homeLog = logs['home:' + today] || logs[today] || null;
      if(homeLog && typeof homeLog === 'object'){
        state.daily.tasks = Object.assign(state.daily.tasks, homeLog.tasks || homeLog);
      }
    }catch(e){}
    saveDaily();
  }
  function saveDaily(){
    writeJSON(KEY.daily, state.daily);
    try{
      if(state.daily && state.daily.date){
        const payload = { date:state.daily.date, tasks:Object.assign({}, state.daily.tasks || {}), source:'home' };
        localStorage.setItem('heartyDailyTask:' + state.daily.date, JSON.stringify(payload));
        localStorage.setItem('heartyTask:' + state.daily.date, JSON.stringify(payload));
        const data = hdData();
        const logs = Object.assign({}, (data && data.progress && data.progress.task_logs) || {});
        logs['home:' + state.daily.date] = payload;
        hdSet('progress.task_logs', logs);
      }
    }catch(e){ console.warn('[Hearty] daily persistence failed', e); }
  }
  function saveProfile(){
    writeJSON(KEY.profile, state.profile);
    try{
      localStorage.setItem('heartyCoreSetupDone', state.profile.setupComplete ? 'true' : 'false');
      if(state.profile.name) localStorage.setItem('heartyFirstName', state.profile.name);
      localStorage.setItem('heartyUnitsSystem', state.profile.unit === 'imperial' ? 'imperial' : 'metric');
      if(state.profile.targetWeightKg != null) localStorage.setItem('heartyTargetWeightKg', String(Number(state.profile.targetWeightKg)));
    }catch(e){}
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
    const med = state.medication || {};
    if(med.type || med.frequency || med.day !== undefined) saveInjectionBridge();
    const title = med.type ? `${med.type} reminder` : 'Dose reminder'; $('medicationTitle').textContent = title;
    const today = localDate(); const due = med.frequency === 'daily' || (med.frequency === 'weekly' && Number(med.day) === new Date().getDay());
    const logged = med.lastDoseDate === today;
    $('injectionCard').classList.toggle('due', due && !logged); $('injectionCard').classList.toggle('logged', logged); $('logDoseBtn').classList.toggle('active', logged);
    if (!med.type) $('nextInjectionDateText').textContent = 'Set your medication schedule during setup.';
    else if (logged) $('nextInjectionDateText').textContent = 'Dose logged for today.';
    else if (due) $('nextInjectionDateText').textContent = 'Dose due today.';
    else $('nextInjectionDateText').textContent = med.frequency === 'weekly' ? `Next weekly dose is on ${weekdayNameFromNumber(med.day)}.` : 'Medication schedule active.';
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
    const lessonNumber = idx + 1;
    const lessonLabel = allDone ? 'Lessons complete' : `Lesson ${lessonNumber}/${LESSONS.length}`;
    const lessonIcon = lesson.icon || '📘';
    if ($('lessonCounter')) $('lessonCounter').innerHTML = allDone ? '<span class="lesson-mini-icon">✓</span> Lessons complete' : `<span class="lesson-mini-icon">${lessonIcon}</span> ${lessonLabel}`;
    if ($('lessonTitle')) $('lessonTitle').textContent = allDone && !completedToday ? 'Daily lessons complete' : lesson.title;
    if ($('lessonSheetSub')) $('lessonSheetSub').textContent = completedToday ? 'Today’s lesson is complete. The next lesson unlocks tomorrow.' : `${lessonLabel} • 2–3 minute read`;
    if ($('lessonBody')) $('lessonBody').innerHTML = allDone && !completedToday ? '<div class="lesson-complete-icon">✓</div><p>You have completed the 10-day Hearty lesson sequence.</p><p>Keep repeating the daily rhythm: weigh in, hydrate, move, eat protein-forward meals, and use Support Mode when needed.</p>' : `<div class="lesson-hero-icon" aria-hidden="true">${lessonIcon}</div>${lesson.body}`;
    if ($('lessonSub')) $('lessonSub').textContent = completedToday ? `${lessonLabel} complete. Next lesson unlocks tomorrow.` : allDone ? 'Lesson series complete.' : `${lessonLabel} • ${lesson.title}`;
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
    $('nextActionText').textContent = next === 'weight' ? 'Record today’s weight' : next === 'walk' ? 'Complete your movement baseline' : next === 'photos' ? 'Take progress photos' : next === 'lesson' ? 'Read today’s 2–3 minute lesson' : 'All core tasks complete';
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
      try{
        localStorage.setItem('heartyTodayWeightKg', String(kg));
        localStorage.setItem('heartyTodayWeightKg:' + today, String(kg));
        localStorage.setItem('heartyCurrentWeightKg', String(kg));
        localStorage.setItem('hearty_weight_logs', JSON.stringify(state.weightLogs.map(x => ({date:x.date, weight_kg:x.kg, kg:x.kg, createdAt:x.createdAt}))));
      }catch(e){}
      hdWeight(kg);
      state.daily.tasks.weight = true; saveDaily(); closeSheets(); renderAll(); toast('Weight saved.');
    });
  }

  function bindWater(){
    $('waterGlass').addEventListener('click',()=>{ const d=localDate(); state.water[d]=clamp(Number(state.water[d]||0)+1,0,20); writeJSON(KEY.water,state.water); try{ localStorage.setItem('heartyWaterLog:' + d, JSON.stringify({date:d,count:state.water[d],litres:state.water[d]*0.25})); }catch(e){} hdHydration(state.water[d] * 0.25); renderWater(); });
    $('waterUndo').addEventListener('click',()=>{ const d=localDate(); state.water[d]=clamp(Number(state.water[d]||0)-1,0,20); writeJSON(KEY.water,state.water); try{ localStorage.setItem('heartyWaterLog:' + d, JSON.stringify({date:d,count:state.water[d],litres:state.water[d]*0.25})); }catch(e){} hdHydration(state.water[d] * 0.25); renderWater(); });
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
    $('logDoseBtn').addEventListener('click',()=>{
      const today = localDate();
      state.medication.lastDoseDate = today;
      writeJSON(KEY.medication,state.medication);
      saveInjectionBridge();
      try{
        const log = readJSON('heartyInjectionLog', []);
        const arr = Array.isArray(log) ? log : [];
        const dose = localStorage.getItem('heartyCurrentDosage') || 'Logged';
        const med = state.medication.type || localStorage.getItem('heartyMedicationType') || 'Medication';
        const row = { date:today, dose, medication:med, source:'home', createdAt:new Date().toISOString() };
        const filtered = arr.filter(x => x && x.date !== today);
        filtered.unshift(row);
        writeJSON('heartyInjectionLog', filtered);
        hdSet('progress.injection_logs.' + today, row);
      }catch(e){}
      renderMedication(); toast('Dose logged.');
    });
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
      try{
        const rows = readJSON('heartyPhotoLog', []);
        const arr = Array.isArray(rows) ? rows : [];
        slots.forEach(slot => arr.push({date:today,type:slot,dbKey:`${id}-${slot}`,scope:'progress-photo',storage:'indexeddb'}));
        writeJSON('heartyPhotoLog', arr);
      }catch(e){}
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
        saveInjectionBridge();
        hdSet('profile.medication_name', state.medication.type || '');
        hdSet('profile.injection_name', state.medication.type || '');
        hdSet('profile.injection_day', String(state.medication.day));
        hdSet('profile.injection_day_name', weekdayNameFromNumber(state.medication.day));
        hdSet('profile.injection_frequency', state.medication.frequency || 'weekly');
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
    window.setTimeout(() => maybeShowInstallPrompt(false), 1200);
  }
  if(document.readyState==='loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();

(function(){
  const VERSION = "v31z-cta-logo-appheadline";
  const HEARTY_PADDLE = {
    clientToken: window.HEARTY_PADDLE?.clientToken || window.HEARTY_PADDLE?.token || "live_516a138666d2aaaca6729c439ba",
    priceId: window.HEARTY_PADDLE?.priceId || "pri_01krrpc5hxx3dnak7bxjetm8qp",
    hostedCheckoutUrl: window.HEARTY_PADDLE?.hostedCheckoutUrl || window.HEARTY_PADDLE?.checkoutUrl || ""
  };
  const SUPABASE_URL = "https://mdsfcnocvelwqiercyci.supabase.co";
  const SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kc2Zjbm9jdmVsd3FpZXJjeWNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMTEzNjAsImV4cCI6MjA5MjY4NzM2MH0.TWRwj66PtVhBuf5Ov7AHteNFww1hrCQZuD5ZmEflC5M";
  const LEADS_TABLE = "meal_plan_leads";
  const INT_SALES_URL = "https://www.hearty.health/free-meal-plan.html";
  const urlParams = new URLSearchParams(window.location.search);
  const tracking = {
    ref: urlParams.get("ref") || "",
    utm_source: urlParams.get("utm_source") || urlParams.get("src") || "direct",
    utm_medium: urlParams.get("utm_medium") || "",
    utm_campaign: urlParams.get("utm_campaign") || urlParams.get("campaign") || "free_meal_plan",
    utm_content: urlParams.get("utm_content") || ""
  };
  const MealEngine = window.HeartyMealEngine;
  if(!MealEngine){ console.error("Hearty meal engine failed to load."); return; }
  const countryLabels = MealEngine.countryLabels || { US:"United States", UK:"United Kingdom", ZA:"South Africa", AU:"Australia", CA:"Canada", OTHER:"your local" };
  const state = { protein: 100, style:"standard", sex:"female", appetite:"normal", country: detectCountry(), countrySource:"device", userChangedCountry:false, interacted:false, revealed:false, planGenerated:false, planExpanded:false, email:"", firstName:"", prefs:{ foods:[], avoids:[], effort:"very_easy" } };
  let currentLeadId = "";
  let firstInteractionAt = 0;
  let paddleInitialized = false;

  const $ = (sel, root=document) => root.querySelector(sel);
  const $$ = (sel, root=document) => Array.from(root.querySelectorAll(sel));
  const esc = v => String(v ?? "").replaceAll("&","&amp;").replaceAll("<","&lt;").replaceAll(">","&gt;").replaceAll('"',"&quot;").replaceAll("'","&#039;");

  function normaliseCountryCode(code){
    const c = String(code || "").toUpperCase();
    if(c === "GB") return "UK";
    if(["US","UK","ZA","AU","CA"].includes(c)) return c;
    return "OTHER";
  }
  function detectCountry(){
    const tz = String(Intl.DateTimeFormat().resolvedOptions().timeZone || "").toLowerCase();
    const lang = String((navigator.languages && navigator.languages[0]) || navigator.language || "").toUpperCase();
    if(tz.includes("johannesburg") || lang.includes("-ZA")) return "ZA";
    if(tz.includes("london") || lang.includes("-GB")) return "UK";
    if(tz.includes("australia") || lang.includes("-AU")) return "AU";
    if(tz.includes("canada") || lang.includes("-CA")) return "CA";
    if(tz.includes("america") || lang.includes("-US")) return "US";
    return "US";
  }
  async function detectCountryByIp(){
    // IP lookup is a low-friction enhancement. If it fails, the device fallback above stays in place.
    try{
      const controller = new AbortController();
      const timer = setTimeout(() => controller.abort(), 1800);
      const res = await fetch("https://ipapi.co/json/", { signal:controller.signal, cache:"no-store" });
      clearTimeout(timer);
      if(!res.ok) return "";
      const data = await res.json();
      return normaliseCountryCode(data?.country_code || data?.country || "");
    }catch(e){ return ""; }
  }
  function setCountrySourceLabel(text){
    const note = $("#countryDetectedNote");
    if(note) note.textContent = text;
    const inline = $("#countryInlineLabel");
    if(inline) inline.textContent = `Using ${countryLabels[state.country] || "your local"} food list`;
  }
  function mealEstimate(protein, slot){
    const p = Number(protein || 0);
    const map = {
      breakfast:{ kcal: Math.round(210 + p * 5.0), fibre: 5, note:"Small, easy protein start." },
      lunch:{ kcal: Math.round(260 + p * 5.3), fibre: 6, note:"Simple anchor meal." },
      dinner:{ kcal: Math.round(300 + p * 6.2), fibre: 7, note:"Normal-food dinner, not diet food." },
      snack:{ kcal: Math.round(90 + p * 6.0), fibre: 1, note:"Backup for low appetite days." }
    };
    return map[slot] || { kcal: Math.round(120 + p * 5), fibre: 3, note:"Easy fallback option." };
  }
  function sessionId(){
    try{ const key="hearty_v31_session"; let id=sessionStorage.getItem(key) || localStorage.getItem(key); if(!id){id=`sess_${Date.now()}_${Math.random().toString(16).slice(2)}`; sessionStorage.setItem(key,id); localStorage.setItem(key,id);} return id; }
    catch(e){ return `sess_${Date.now()}_${Math.random().toString(16).slice(2)}`; }
  }
  const sid = sessionId();

  async function trackEvent(eventName, metadata={}){
    try{ window.trackHeartyEvent?.(eventName, metadata); }catch(e){}
    if(!SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
    const payload = { event_name:eventName, session_id:sid, user_id:null, source:tracking.utm_source, campaign:tracking.utm_campaign, page:location.pathname, referrer:document.referrer || "", country:state.country || "", metadata:Object.assign({ tracking_version:VERSION, timestamp:new Date().toISOString() }, metadata) };
    try{
      await fetch(`${SUPABASE_URL}/rest/v1/hearty_events`, { method:"POST", headers:{ "Content-Type":"application/json", "apikey":SUPABASE_ANON_KEY, "Authorization":`Bearer ${SUPABASE_ANON_KEY}` }, body:JSON.stringify(payload), keepalive:true });
      return true;
    }catch(e){ return false; }
  }

  function engineInputFromState(){
    const eatingStyle = state.style === "vegetarian" ? "vegetarian" : (state.style === "no_seafood" ? "no seafood/fish" : "omnivore");
    const avoidList = (state.prefs && Array.isArray(state.prefs.avoids)) ? state.prefs.avoids : [];
    const exclusions = {
      chicken: avoidList.includes("chicken"),
      eggs: avoidList.includes("eggs"),
      dairy: avoidList.includes("dairy"),
      fish: avoidList.includes("fish") || state.style === "no_seafood",
      seafood: avoidList.includes("fish") || state.style === "no_seafood",
      shellfish: avoidList.includes("fish") || state.style === "no_seafood",
      beef: avoidList.includes("beef"),
      legumes: avoidList.includes("legumes")
    };
    return {
      country: state.country === "OTHER" ? "US" : state.country,
      region: state.country === "OTHER" ? "US" : state.country,
      eatingStyle,
      dietType: state.style === "vegetarian" ? "vegetarian" : "omnivore",
      exclusions,
      appetite: state.appetite,
      mainStruggle: state.appetite === "rough" ? "nausea low appetite simple" : (state.appetite === "low" ? "low appetite simple" : "protein simple"),
      supportMode: {
        lowAppetite: state.appetite === "low" || state.appetite === "rough" ? 2 : 0,
        nausea: state.appetite === "rough" ? 2 : 0,
        bloating: state.appetite === "rough" ? 1 : 0,
        exhaustion: state.appetite === "rough" ? 1 : 0
      },
      days: 7,
      snacksEnabled: true,
      calorieMode: "estimated_suggested_serving"
    };
  }

  function normaliseCoreMeal(meal){
    if(!meal) return { name:"Simple protein meal", protein:20, description:"Easy GLP-1 friendly option." };
    const protein = meal?.nutrition?.protein ?? meal?.proteinGrams ?? meal?.protein ?? 20;
    return {
      name: meal.name || meal.title || "Simple protein meal",
      protein: Math.round(Number(protein) || 20),
      description: meal.description || meal.nutritionNote || ""
    };
  }

  function normalisePlan(plan){
    if(Array.isArray(plan)) return plan;
    if(plan && Array.isArray(plan.days)){
      return plan.days.map(day => {
        const meals = day.meals || {};
        const snack = Array.isArray(meals.snacks) ? meals.snacks[0] : meals.snack;
        return {
          dayNumber: day.dayNumber,
          breakfast: normaliseCoreMeal(meals.breakfast),
          lunch: normaliseCoreMeal(meals.lunch),
          dinner: normaliseCoreMeal(meals.dinner),
          snack: normaliseCoreMeal(snack),
          _coreDay: day
        };
      });
    }
    return [];
  }

  function buildPlan(){
    if(typeof MealEngine.buildPlan === "function") return MealEngine.buildPlan(state);
    if(typeof MealEngine.generatePlan === "function"){
      const corePlan = MealEngine.generatePlan(engineInputFromState());
      const normalised = normalisePlan(corePlan);
      normalised._corePlan = corePlan;
      return normalised;
    }
    return [];
  }


  function shoppingList(plan){
    if(typeof MealEngine.shoppingList === "function") return MealEngine.shoppingList(plan, state);
    const core = plan?._corePlan || plan;
    if(core?.shoppingList && Array.isArray(core.shoppingList)){
      return core.shoppingList.map(item => typeof item === "string" ? item : [item.name || item.food || item.item, item.amount || item.quantity, item.unit].filter(Boolean).join(" ")).filter(Boolean);
    }
    if(typeof MealEngine.buildShoppingList === "function"){
      try{
        const list = MealEngine.buildShoppingList(core?.days ? core : (plan?._corePlan || { days:[] }), engineInputFromState());
        return (list || []).map(item => typeof item === "string" ? item : [item.name || item.food || item.item, item.amount || item.quantity, item.unit].filter(Boolean).join(" ")).filter(Boolean);
      }catch(e){}
    }
    return [];
  }

  function renderFullPlanOnPage(){
    const wrap = $("#fullPlanRows");
    const shell = $("#onscreenFullPlan");
    if(!wrap || !shell) return;
    const plan = buildPlan();
    const days = normalisePlan(plan).slice(0, 7);
    wrap.innerHTML = days.map((day, index) => {
      const rows = [
        ["Breakfast", day.breakfast, "breakfast"],
        ["Lunch", day.lunch, "lunch"],
        ["Dinner", day.dinner, "dinner"],
        ["Backup", day.snack, "snack"]
      ].map(([label, meal, slot]) => {
        const protein = Number(meal?.protein || 0);
        const est = mealEstimate(protein, slot);
        return `<div class="full-meal-row"><b>${esc(label)}</b><div><strong>${esc(meal?.name || "Simple protein option")}</strong><small>${protein || est.kcal ? `${protein || "±"}g protein · ±${est.kcal} kcal` : "GLP-1 friendly option"}${meal?.description ? ` · ${esc(meal.description)}` : ""}</small></div></div>`;
      }).join("");
      const dayProteinTotal = [
        day.breakfast, day.lunch, day.dinner, day.snack
      ].reduce((sum, meal) => sum + (Number(meal?.protein || 0) || 0), 0);
      return `<article class="full-day-card"><h4><span>Day ${day.dayNumber || index + 1}</span><em class="day-protein-total">${Math.round(dayProteinTotal)}g protein</em></h4><div class="full-day-meals">${rows}</div></article>`;
    }).join("");
    shell.hidden = false;
    shell.classList.add("show");
    renderShoppingPreview(plan);
  }


  function renderPreview(){
    const plan = buildPlan();
    const day = (plan && plan[0]) || {
      breakfast:{ name:"Greek yoghurt bowl", protein:25 },
      lunch:{ name:"Chicken or cottage cheese salad bowl", protein:30 },
      dinner:{ name:"Simple protein dinner plate", protein:35 },
      snack:{ name:"Easy backup protein option", protein:15 }
    };
    const proteinOutputEl = $("#proteinOutput");
    if(proteinOutputEl) proteinOutputEl.textContent = `${state.protein}g per day`;
    const proteinTinyEl = $("#proteinTiny");
    if(proteinTinyEl) proteinTinyEl.textContent = `${state.protein}g/day`;
    const previewNoteEl = $("#previewNote");
    if(previewNoteEl) previewNoteEl.textContent = state.planExpanded
      ? "Your 7-day plan is ready below. You can review it first, then download the PDF and shopping list."
      : "Answer 3 quick questions and Hearty will build a simple 7-day plan around appetite, protein and foods you actually like.";
    const meals = [
      ["Breakfast", day.breakfast, "breakfast"],
      ["Lunch", day.lunch, "lunch"],
      ["Dinner", day.dinner, "dinner"],
      ["Backup snack", day.snack, "snack"]
    ];
    let totalProtein = 0, totalKcal = 0, totalFibre = 0;
    const rows = meals.map(([label, meal, slot]) => {
      const protein = Number(meal.protein || 0);
      const est = mealEstimate(protein, slot);
      totalProtein += protein; totalKcal += est.kcal; totalFibre += est.fibre;
      return `<div class="meal-detail"><b>${esc(label)}</b><strong>${esc(meal.name)}</strong><span>${protein}g protein · ±${est.kcal} kcal · ${est.fibre}g fibre</span><em>${esc(est.note)}</em></div>`;
    }).join("");
    const total = $("#dayTotalMacro");
    if(total) total.textContent = `±${totalKcal.toLocaleString()} kcal · ${totalProtein}g protein · ${totalFibre}g fibre`;
    const mealPreviewRowsEl = $("#mealPreviewRows");
    if(mealPreviewRowsEl) mealPreviewRowsEl.innerHTML = rows;
    setCountrySourceLabel(state.countrySource === "manual" ? "Changed manually" : "Detected from your location");
    renderShoppingPreview(plan);
  }

  function renderShoppingPreview(plan){
    const wrap = $("#shoppingPreview");
    if(!wrap) return;
    const list = shoppingList(plan).slice(0, 12);
    wrap.innerHTML = list.map(item => `<span>${esc(item)}</span>`).join("");
  }

  function expandFullPlanPanel(){
    state.planExpanded = true;
    const panel = $("#tool");
    if(panel) panel.classList.add("expanded");
    const setup = $("#quickSetupPanel");
    if(setup){
      setup.hidden = false;
      setup.classList.add("show");
    }
    const btn = $("#fullPlanBtn");
    if(btn){ btn.textContent = "Continue below to unlock your full plan"; btn.setAttribute("aria-expanded", "true"); }
    const heroBtn = $("#heroGeneratePlanBtn");
    if(heroBtn){ heroBtn.textContent = "Your plan setup is open below"; heroBtn.setAttribute("aria-expanded", "true"); }
    markPlanGenerated("inline_unlock");
    renderPreview();
    renderFullPlanOnPage();
    trackEvent("full_plan_inline_expanded", { protein_target:state.protein, appetite:state.appetite, eating_style:state.style, country:state.country });
  }


  function scrollToUnlockPanel(){
    const target = $("#onscreenFullPlan") || $("#inlineUnlockPanel") || $("#tool");
    if(target){
      setTimeout(() => target.scrollIntoView({ behavior:"smooth", block:"start" }), 80);
    }
  }

  function openFreePlanFlow(trigger){
    markInteraction(trigger || "open_free_plan");
    expandFullPlanPanel();
    scrollToUnlockPanel();
  }

  function markInteraction(reason){
    if(!state.interacted){
      state.interacted = true;
      firstInteractionAt = performance.now();
      trackEvent("dashboard_first_interaction", { reason, protein_target:state.protein, appetite:state.appetite, eating_style:state.style, country:state.country, time_to_first_interaction_ms:Math.round(firstInteractionAt) });
      createLeadRecord("Dashboard engaged");
      setTimeout(revealTiles, 900);
    } else {
      updateLeadRecord("Dashboard updated");
    }
  }

  function revealTiles(){
    if(state.revealed) return;
    state.revealed = true;
    $$('[data-reveal-tile]').forEach((tile, i) => setTimeout(() => { tile.classList.remove('dim'); tile.classList.add('revealed'); const lock=tile.querySelector('.lock'); if(lock) lock.textContent='✓'; }, i*120));
    trackEvent("dashboard_tiles_revealed", { trigger:"interaction_or_scroll" });
  }

  function markPlanGenerated(trigger){
    if(!state.planGenerated){
      state.planGenerated = true;
      const sticky = $("#stickyCta");
      if(sticky){
        sticky.textContent = "Get Hearty — $29 once-off";
        sticky.classList.add("primary");
        sticky.removeAttribute("href");
        sticky.setAttribute("role","button");
        sticky.dataset.heartyCheckout = "";
      }
    }
    const plan = buildPlan();
    trackEvent("free_meal_plan_preview_generated", { trigger, protein_target:state.protein, appetite:state.appetite, eating_style:state.style, country:state.country, plan_days:state.planExpanded ? 7 : 4, full_plan_days:7, inline_expanded:state.planExpanded });
    updateLeadRecord("Plan generated");
  }

  async function createLeadRecord(status){
    if(currentLeadId || !SUPABASE_URL || !SUPABASE_ANON_KEY) return false;
    const plan = buildPlan();
    const payload = {
      first_name:state.firstName || "", email:state.email || "", whatsapp:"", country:countryLabels[state.country] || "Other", market:"INT",
      proteins:[`${state.protein}g target`, state.style, state.appetite], breakfasts:[plan[0].breakfast.name], starches:[], vegetables:[], fruits:[], snacks:[plan[0].snack.name], generated_plan:plan,
      checkout_url:INT_SALES_URL, ref:tracking.ref, utm_source:tracking.utm_source, utm_medium:tracking.utm_medium, utm_campaign:tracking.utm_campaign, utm_content:tracking.utm_content,
      lead_status:status || "Dashboard engaged", notes:`v31 dashboard: ${state.protein}g, ${state.style}, ${state.sex}, ${state.appetite}, ${state.country}`
    };
    try{
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${LEADS_TABLE}?select=id`, { method:"POST", headers:{ "Content-Type":"application/json", "apikey":SUPABASE_ANON_KEY, "Authorization":`Bearer ${SUPABASE_ANON_KEY}`, "Prefer":"return=representation" }, body:JSON.stringify(payload) });
      if(res.ok){ const data = await res.json(); currentLeadId = data?.[0]?.id || ""; return Boolean(currentLeadId); }
      return false;
    }catch(e){ return false; }
  }

  async function updateLeadRecord(status, extra={}){
    if(!currentLeadId) return false;
    const fields = Object.assign({ lead_status:status, generated_plan:buildPlan(), notes:`v31 dashboard: ${state.protein}g, ${state.style}, ${state.sex}, ${state.appetite}, ${state.country}` }, extra);
    try{
      const res = await fetch(`${SUPABASE_URL}/rest/v1/${LEADS_TABLE}?id=eq.${currentLeadId}`, { method:"PATCH", headers:{ "Content-Type":"application/json", "apikey":SUPABASE_ANON_KEY, "Authorization":`Bearer ${SUPABASE_ANON_KEY}` }, body:JSON.stringify(fields) });
      return res.ok;
    }catch(e){ return false; }
  }

  function planText(){
    if(typeof window.heartyLeadPlanText === "function"){
      return window.heartyLeadPlanText();
    }
    const plan = buildPlan();
    const core = plan?._corePlan || null;
    if(core && Array.isArray(core.days)){
      return core.days.map(day => {
        const meals = day.meals || {};
        const snack = Array.isArray(meals.snacks) ? meals.snacks[0] : null;
        const dayNutrition = MealEngine.calculateDayNutrition ? MealEngine.calculateDayNutrition(day, engineInputFromState()) : null;
        const lines = [
          `Day ${day.dayNumber || ""}${dayNutrition ? ` — ${Math.round(dayNutrition.protein || 0)}g protein, ±${Math.round(dayNutrition.calories || 0)} kcal` : ""}`,
          `Breakfast: ${meals.breakfast?.title || ""}`,
          `Lunch: ${meals.lunch?.title || ""}`,
          `Dinner: ${meals.dinner?.title || ""}`,
          snack ? `Backup snack: ${snack.title || ""}` : "",
          ""
        ];
        return lines.filter(Boolean).join("\\n");
      }).join("\\n");
    }
    return JSON.stringify(plan, null, 2);
  }


  function makePdfBlobFromText(title, text){
    const clean = String(text || "").replace(/\r/g, "");
    const lines = [];
    clean.split("\n").forEach(line => {
      if(line.length <= 88) lines.push(line);
      else { let chunk = line; while(chunk.length > 88){ lines.push(chunk.slice(0,88)); chunk = chunk.slice(88); } if(chunk) lines.push(chunk); }
    });
    const pages = [];
    for(let i=0;i<lines.length;i+=42) pages.push(lines.slice(i,i+42));
    const objects = [];
    const offsets = [];
    function add(obj){ objects.push(obj); return objects.length; }
    const catalogId = add("<< /Type /Catalog /Pages 2 0 R >>");
    const pagesId = add("");
    const fontId = add("<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>");
    const pageIds = [];
    pages.forEach((pageLines) => {
      const stream = pageLines.map((line, idx) => {
        const y = 780 - idx*17;
        const asciiLine = String(line || "").replace(/[^\x20-\x7E]/g,"-");
        const safe = asciiLine.replace(/\\/g,"\\\\").replace(/\(/g,"\\(").replace(/\)/g,"\\)");
        return `BT /F1 10 Tf 42 ${y} Td (${safe}) Tj ET`;
      }).join("\n");
      const contentId = add(`<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`);
      const pageId = add(`<< /Type /Page /Parent 2 0 R /MediaBox [0 0 595 842] /Resources << /Font << /F1 ${fontId} 0 R >> >> /Contents ${contentId} 0 R >>`);
      pageIds.push(pageId);
    });
    objects[pagesId-1] = `<< /Type /Pages /Kids [${pageIds.map(id => `${id} 0 R`).join(" ")}] /Count ${pageIds.length} >>`;
    let pdf = "%PDF-1.4\n";
    objects.forEach((obj, idx) => { offsets[idx+1]=pdf.length; pdf += `${idx+1} 0 obj\n${obj}\nendobj\n`; });
    const xrefStart = pdf.length;
    pdf += `xref\n0 ${objects.length+1}\n0000000000 65535 f \n`;
    offsets.slice(1).forEach(offset => { pdf += String(offset).padStart(10,"0") + " 00000 n \n"; });
    pdf += `trailer\n<< /Size ${objects.length+1} /Root ${catalogId} 0 R >>\nstartxref\n${xrefStart}\n%%EOF`;
    return new Blob([pdf], { type:"application/pdf" });
  }

  function downloadPdf(){
    const blob = makePdfBlobFromText("Hearty Free 7-Day GLP-1 Meal Setup", planText());
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    const name = (state.firstName || "hearty").toLowerCase().replace(/[^a-z0-9]+/g,"-").replace(/^-|-$/g,"") || "hearty";
    a.href = url; a.download = `${name}-hearty-7-day-glp1-plan.pdf`; document.body.appendChild(a); a.click();
    setTimeout(() => { URL.revokeObjectURL(url); a.remove(); }, 1200);
  }

  function isEmail(v){ return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(String(v || "").trim()); }
  async function saveEmailInBackground(status){
    let saved = false;
    let leadReady = Boolean(currentLeadId);
    if(!leadReady) leadReady = await createLeadRecord("Email captured");
    if(leadReady) saved = await updateLeadRecord("Email captured", { email:state.email, first_name:state.firstName });
    trackEvent("free_meal_email_submitted", { saved_to_supabase:Boolean(saved), email_present:true, dashboard_engagement_to_email:true, background_save:true });
    if(!saved && status){
      status.textContent = "Your PDF downloaded. We could not save the email because of the network, but the plan is yours.";
    }
    return saved;
  }

  async function submitEmail(){
    const status = $("#leadStatus");
    state.email = $("#leadEmail").value.trim();
    state.firstName = $("#leadName").value.trim() || "Friend";
    if(!isEmail(state.email)){ status.textContent = "Please enter a valid email address to download your plan."; $("#leadEmail").focus(); return; }
    status.textContent = "Valid email — downloading your plan now.";
    downloadPdf();
    trackEvent("meal_plan_pdf_downloaded", { source:"lead_capture" });
    status.textContent = "Done — your PDF is downloading now. We’ll save your details in the background.";
    $("#postSubmit").classList.add("show");
    saveEmailInBackground(status);
  }

  function waitForPaddle(timeout=5000){
    return new Promise(resolve => { const start=Date.now(); const t=setInterval(()=>{ if(window.Paddle){clearInterval(t); resolve(true);} else if(Date.now()-start>timeout){clearInterval(t); resolve(false);} },80); });
  }
  function initPaddle(){
    if(paddleInitialized) return true;
    if(!window.Paddle || !HEARTY_PADDLE.clientToken) return false;
    try{ Paddle.Initialize({ token:HEARTY_PADDLE.clientToken }); paddleInitialized = true; return true; }catch(e){ return false; }
  }
  function buildHostedCheckoutUrl(){
    if(!HEARTY_PADDLE.hostedCheckoutUrl) return "";
    try{
      const u = new URL(HEARTY_PADDLE.hostedCheckoutUrl, window.location.href);
      if(HEARTY_PADDLE.priceId && !u.searchParams.get("price_id")) u.searchParams.set("price_id", HEARTY_PADDLE.priceId);
      if(state.email && isEmail(state.email)) u.searchParams.set("user_email", state.email);
      if(state.country && state.country !== "OTHER") u.searchParams.set("country_code", state.country);
      u.searchParams.set("theme", "light");
      return u.toString();
    }catch(e){
      return HEARTY_PADDLE.hostedCheckoutUrl;
    }
  }
  function showCheckoutFallback(){
    const hostedUrl = buildHostedCheckoutUrl();
    const hostedBtn = $("#openHostedCheckout");
    if(hostedBtn){
      if(hostedUrl){ hostedBtn.href = hostedUrl; hostedBtn.classList.remove("hide"); }
      else { hostedBtn.href = "#"; hostedBtn.classList.add("hide"); }
    }
    $("#checkoutFallback").classList.add("show");
    $("#checkoutFallback").setAttribute("aria-hidden","false");
  }
  async function openCheckout(){
    trackEvent("free_meal_app_cta_clicked", { button_location:"v31_funnel" });
    trackEvent("checkout_clicked", { price:29, currency:"USD", button_location:"v31_funnel" });
    updateLeadRecord("Checkout clicked");
    const ready = await waitForPaddle();
    if(ready && initPaddle()){
      try{
        Paddle.Checkout.open({ items:[{ priceId:HEARTY_PADDLE.priceId, quantity:1 }], settings:{ displayMode:"overlay", theme:"light", variant:"one-page", successUrl:"https://hearty.health/login" } });
        return;
      }catch(e){}
    }
    showCheckoutFallback();
  }

  function bind(){
    const countrySelectEl = $("#countrySelect");
    if(countrySelectEl) countrySelectEl.value = state.country;
    setCountrySourceLabel("Detected from your location");
    renderPreview();
    detectCountryByIp().then(country => {
      if(!country || state.userChangedCountry) return;
      if(country !== state.country){
        state.country = country;
        state.countrySource = "ip";
        const select = $("#countrySelect");
        if(select) select.value = country;
        setCountrySourceLabel("Detected from your IP — change if needed");
        renderPreview();
        trackEvent("country_ip_detected", { country });
      } else {
        state.countrySource = "ip";
        setCountrySourceLabel("Detected from your IP — change if needed");
      }
    });
    trackEvent("free_meal_page_view", { landing:"v31_detailed_one_day_preview" });

    const proteinMinusEl = $("#proteinMinus");
    if(proteinMinusEl) proteinMinusEl.addEventListener("click", () => { state.protein = Math.max(60, state.protein-10); markInteraction("protein_minus"); renderPreview(); });
    const proteinPlusEl = $("#proteinPlus");
    if(proteinPlusEl) proteinPlusEl.addEventListener("click", () => { state.protein = Math.min(180, state.protein+10); markInteraction("protein_plus"); renderPreview(); });
    $$('[data-chip-group]').forEach(group => {
      group.addEventListener('click', e => {
        const btn = e.target.closest('.chip'); if(!btn) return;
        const key = group.dataset.chipGroup;
        state[key] = btn.dataset.value;
        group.querySelectorAll('.chip').forEach(b => b.classList.toggle('selected', b===btn));
        markInteraction(`chip_${key}`); renderPreview();
      });
    });
    const countrySelectBindEl = $("#countrySelect");
    if(countrySelectBindEl) countrySelectBindEl.addEventListener("change", e => { state.country = e.target.value; state.userChangedCountry = true; state.countrySource = "manual"; setCountrySourceLabel("Changed manually"); markInteraction("country_change"); renderPreview(); });
    window.heartyBuilder = {
      setProtein(v){ state.protein = Math.max(60, Math.min(180, Number(v)||100)); markInteraction("protein_select"); renderPreview(); },
      setChoice(key, value){ state[key] = value; markInteraction(`chip_${key}`); renderPreview(); },
      setCountry(value){ state.country = value; state.userChangedCountry = true; state.countrySource = "manual"; setCountrySourceLabel("Changed manually"); markInteraction("country_change"); renderPreview(); },
      setPrefs(prefs){ state.prefs = Object.assign(state.prefs || {}, prefs || {}); markInteraction("dietary_prefs"); renderPreview(); },
      showOnscreenPlan(){ state.planExpanded = true; const panel = $("#tool"); if(panel) panel.classList.add("expanded"); markPlanGenerated("builder_build_plan"); renderPreview(); renderFullPlanOnPage(); const unlock=$("#inlineUnlockPanel"); if(unlock) unlock.classList.remove("show"); },
      getState(){ return { ...state }; }
    };
    const fullPlanBtnEl = $("#fullPlanBtn");
    if(fullPlanBtnEl) fullPlanBtnEl.addEventListener("click", e => { e.preventDefault(); openFreePlanFlow("full_plan_click"); });
    const heroPlanBtn = $("#heroGeneratePlanBtn");
    if(heroPlanBtn) heroPlanBtn.addEventListener("click", e => { e.preventDefault(); openFreePlanFlow("hero_generate_plan_click"); });
    const rightTopPlanBtn = $("#rightTopGenerateBtn");
    if(rightTopPlanBtn) rightTopPlanBtn.addEventListener("click", e => { e.preventDefault(); openFreePlanFlow("right_top_generate_plan_click"); });
    document.addEventListener('scroll', () => { if(window.scrollY > 360) revealTiles(); }, { passive:true });
    const downloadPlanBtnEl = $("#downloadPlanBtn");
    if(downloadPlanBtnEl) downloadPlanBtnEl.addEventListener("click", submitEmail);
    $$('[data-hearty-checkout], [data-hearty-checkout-nav]').forEach(el => el.addEventListener('click', e => { e.preventDefault(); markPlanGenerated("checkout_click"); openCheckout(); }));
    const stickyCtaEl = $("#stickyCta");
    if(stickyCtaEl) stickyCtaEl.addEventListener("click", e => { if(stickyCtaEl.dataset.heartyCheckout !== undefined){ e.preventDefault(); openCheckout(); } });
    const retryCheckoutEl = $("#retryCheckout");
    if(retryCheckoutEl) retryCheckoutEl.addEventListener("click", openCheckout);
    const openHostedCheckoutEl = $("#openHostedCheckout");
    if(openHostedCheckoutEl) openHostedCheckoutEl.addEventListener("click", () => { trackEvent("checkout_fallback_hosted_clicked", { price:29, currency:"USD" }); updateLeadRecord("Hosted checkout fallback clicked"); });
    const openHeartyBrowserEl = $("#openHeartyBrowser");
    if(openHeartyBrowserEl) openHeartyBrowserEl.addEventListener("click", () => { trackEvent("checkout_fallback_browser_clicked", { target:"hearty_page" }); updateLeadRecord("Browser fallback clicked"); });
    const closeFallbackEl = $("#closeFallback");
    if(closeFallbackEl) closeFallbackEl.addEventListener("click", () => { const fallback=$("#checkoutFallback"); if(fallback){ fallback.classList.remove("show"); fallback.setAttribute("aria-hidden","true"); } });
  }
  bind();
})();

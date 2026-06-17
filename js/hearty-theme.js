(function(){
  const THEMES = [
    { id: "clean_blue", name: "Ocean Blue", description: "Default calm ocean theme", logo: { src: "hearty-logo.png", variant: "blue", frame: "light" } },
    { id: "pink_lemonade", name: "Pink Lemonade", description: "Fun pink and yellow theme", logo: { src: "assets/logos/hearty-logo-pink-lemonade.svg", variant: "pink-lemonade", frame: "warm" } },
    { id: "midnight", name: "Midnight", description: "Black space theme", logo: { src: "assets/logos/hearty-logo-midnight-bright-thick.png", variant: "midnight", frame: "dark-safe" } },
    { id: "soft_rose", name: "Champagne Blush", description: "Nude gold luxury cosmetics theme", logo: { src: "assets/logos/hearty-logo-champagne-blush-floral.png", variant: "champagne-blush", frame: "rose" } },
    { id: "deep_berry", name: "Aurora Pop", description: "Fun purple teal and pink neon theme", logo: { src: "assets/logos/hearty-logo-aurora-pop.png", variant: "aurora-pop", frame: "dark-safe" } }
  ];

  const VALID = THEMES.map(t => t.id);
  const THEME_BY_ID = Object.fromEntries(THEMES.map(t => [t.id, t]));
  const LEGACY_MAP = {
    sunlit: "pink_lemonade",
    fresh_green: "clean_blue",
    rose_aurora: "soft_rose",
    rose: "soft_rose",
    cleanblue: "clean_blue",
    clean_blue: "clean_blue",
    clean: "clean_blue",
    blue: "clean_blue",
    pink: "pink_lemonade",
    lemonade: "pink_lemonade",
    berry: "deep_berry",
    deepberry: "deep_berry",
    neutral: "clean_blue"
  };

  function normalise(raw){
    const value = String(raw || "").trim().toLowerCase().replace(/[-\s]+/g, "_");
    if(VALID.includes(value)) return value;
    return LEGACY_MAP[value] || "clean_blue";
  }

  function readTheme(){
    try{
      return normalise(
        localStorage.getItem("heartyTheme") ||
        localStorage.getItem("hearty-theme") ||
        document.documentElement.getAttribute("data-theme") ||
        "clean_blue"
      );
    }catch(e){ return "clean_blue"; }
  }

  function persistTheme(theme){
    try{
      localStorage.setItem("heartyTheme", theme);
      localStorage.setItem("hearty-theme", theme);
      localStorage.setItem("heartyThemeUserSelected", "true");
    }catch(e){}
  }

  function logoObject(theme){
    const t = THEME_BY_ID[normalise(theme)] || THEME_BY_ID.clean_blue;
    return t.logo || THEME_BY_ID.clean_blue.logo;
  }

  function renderLogoHTML(theme){
    const logo = logoObject(theme);
    const src = logo.src || "hearty-logo.png";
    const frame = logo.frame || "light";
    return '<span class="hearty-logo-object" data-logo-frame="' + frame + '" data-logo-source="real-asset">' +
      '<span class="hearty-logo-frame"><img class="hearty-logo-img" src="' + src + '" alt="Hearty"></span>' +
      '</span>';
  }

  function syncBrandContainers(theme){
    // Step 5J: logo rendering is owned by js/hearty-shell-template.js only.
    // Keep this as a safe no-op so older code that calls heartySyncBrandLogos does not break.
    document.documentElement.classList.add("logo-ready");
  }

  function syncThemeControls(theme){
    const activeTheme = THEME_BY_ID[normalise(theme)] || THEME_BY_ID.clean_blue;
    document.querySelectorAll("[data-theme], [data-theme-choice]").forEach((button) => {
      const raw = button.getAttribute("data-theme") || button.getAttribute("data-theme-choice");
      const rawNormal = String(raw || "").trim().toLowerCase().replace(/[-\s]+/g,"_");
      if(!VALID.includes(rawNormal) && !button.hasAttribute("data-theme-choice")) return;
      const choice = normalise(raw);
      const active = choice === theme;
      button.classList.toggle("active", active);
      button.setAttribute("aria-pressed", active ? "true" : "false");
      button.setAttribute("aria-label", (active ? "Current theme: " : "Switch to ") + ((THEME_BY_ID[choice] || {}).name || choice));
      const badge = button.querySelector("[data-theme-selected-badge]");
      if(badge) badge.textContent = active ? "Current" : "Select";
    });
    document.querySelectorAll('select[name="theme"], #themeSelect, #theme-select, .theme-select, [data-theme-input]').forEach((select) => {
      if(select.value !== theme) select.value = theme;
    });
    document.querySelectorAll('[data-theme-current]').forEach((el) => { el.innerHTML = ''; el.hidden = true; });
  }

  function applyTheme(raw, userSelected){
    const theme = normalise(raw);
    document.documentElement.setAttribute("data-theme", theme);
    if(document.body) document.body.setAttribute("data-theme", theme);
    if(userSelected !== false) persistTheme(theme);
    else {
      try{
        localStorage.setItem("heartyTheme", theme);
        localStorage.setItem("hearty-theme", theme);
      }catch(e){}
    }
    syncThemeControls(theme);
    syncBrandContainers(theme);
    window.dispatchEvent(new CustomEvent("hearty:theme-change", { detail: { theme } }));
    return theme;
  }



  const THEME_UPGRADE_NOTICE_KEY = "heartyThemeUpgradeNotice202606";
  const THEME_UPGRADE_SESSION_KEY = "heartyThemeUpgradeNoticeSessionHidden";
  const APP_PAGES_FOR_THEME_NOTICE = new Set(["home","meals","exercise","progress","support","social","settings"]);

  function isAppPageForThemeNotice(){
    try{
      const page = String((document.body && document.body.dataset && document.body.dataset.page) || "").toLowerCase();
      if(APP_PAGES_FOR_THEME_NOTICE.has(page)) return true;
      const file = String(location.pathname || "").split("/").pop().replace(/\.html$/i, "").toLowerCase();
      return APP_PAGES_FOR_THEME_NOTICE.has(file);
    }catch(e){ return false; }
  }

  function hasCompletedThemeNotice(){
    try{
      return localStorage.getItem(THEME_UPGRADE_NOTICE_KEY) === "done" || localStorage.getItem("heartyThemeUserSelected") === "true";
    }catch(e){ return true; }
  }

  function completeThemeNotice(){
    try{
      localStorage.setItem(THEME_UPGRADE_NOTICE_KEY, "done");
      sessionStorage.removeItem(THEME_UPGRADE_SESSION_KEY);
    }catch(e){}
    const modal = document.querySelector("[data-hearty-theme-upgrade-modal]");
    if(modal) modal.remove();
  }

  function hideThemeNoticeForSession(){
    try{ sessionStorage.setItem(THEME_UPGRADE_SESSION_KEY, "hidden"); }catch(e){}
    const modal = document.querySelector("[data-hearty-theme-upgrade-modal]");
    if(modal) modal.remove();
  }

  function readStoredJSON(key, fallback){
    try{
      const raw = localStorage.getItem(key);
      return raw ? JSON.parse(raw) : fallback;
    }catch(e){ return fallback; }
  }

  function hasFinishedCoreOnboarding(){
    try{ if(localStorage.getItem("heartyCoreSetupDone") === "true") return true; }catch(e){}

    const homeProfile = readStoredJSON("heartyProfile", null) || readStoredJSON("hearty_profile", null) || readStoredJSON("heartyUserProfile", null);
    if(homeProfile && (homeProfile.setupComplete === true || homeProfile.onboardingComplete === true || homeProfile.onboarding_complete === true)) return true;

    const data = readStoredJSON("hearty:data:v1", null);
    if(data && data.settings && data.settings.onboarding_complete === true) return true;

    return false;
  }

  function isBlockingAppModalOpen(){
    try{
      const blockers = Array.from(document.querySelectorAll([
        ".sheet-overlay:not([hidden])",
        ".exercise-guide-modal:not([hidden])",
        ".meals-help-modal:not([hidden])",
        ".save-prompt:not([hidden])",
        ".country-gate:not([hidden])",
        "[aria-modal='true']:not([hidden])"
      ].join(",")));

      return blockers.some((el) => {
        if(!el || el.hasAttribute("data-hearty-theme-upgrade-modal") || el.closest("[data-hearty-theme-upgrade-modal]")) return false;
        const style = window.getComputedStyle ? window.getComputedStyle(el) : null;
        if(style && (style.display === "none" || style.visibility === "hidden" || Number(style.opacity) === 0)) return false;
        return true;
      });
    }catch(e){ return false; }
  }

  let themeNoticeRetryTimer = null;
  function scheduleThemeNoticeRetry(delay){
    if(themeNoticeRetryTimer) return;
    themeNoticeRetryTimer = setTimeout(() => {
      themeNoticeRetryTimer = null;
      renderThemeUpgradeNotice();
    }, delay || 1200);
  }

  function shouldShowThemeNotice(){
    if(!isAppPageForThemeNotice()) return false;
    if(hasCompletedThemeNotice()) return false;
    try{ if(sessionStorage.getItem(THEME_UPGRADE_SESSION_KEY) === "hidden") return false; }catch(e){}
    if(document.querySelector("[data-hearty-theme-upgrade-modal]")) return false;
    if(!hasFinishedCoreOnboarding()) return false;
    if(isBlockingAppModalOpen()) return false;
    return true;
  }

  function renderThemeUpgradeNotice(){
    if(!isAppPageForThemeNotice()) return;
    if(hasCompletedThemeNotice()) return;
    try{ if(sessionStorage.getItem(THEME_UPGRADE_SESSION_KEY) === "hidden") return; }catch(e){}
    if(document.querySelector("[data-hearty-theme-upgrade-modal]")) return;
    if(!hasFinishedCoreOnboarding() || isBlockingAppModalOpen()){
      scheduleThemeNoticeRetry(1500);
      return;
    }
    const current = readTheme();
    const backdrop = document.createElement("div");
    backdrop.className = "hearty-theme-upgrade-backdrop";
    backdrop.setAttribute("data-hearty-theme-upgrade-modal", "");
    backdrop.setAttribute("role", "dialog");
    backdrop.setAttribute("aria-modal", "true");
    backdrop.setAttribute("aria-labelledby", "hearty-theme-upgrade-title");
    backdrop.innerHTML = `
      <div class="hearty-theme-upgrade-modal">
        <div class="hearty-theme-upgrade-pill">Theme choice</div>
        <h2 id="hearty-theme-upgrade-title">Choose your Hearty look</h2>
        <p class="hearty-theme-upgrade-copy">Pick the theme that feels easiest and nicest for you to use. Your logs, progress and settings stay the same.</p>
        <div class="hearty-theme-upgrade-options" aria-label="Choose an app theme">
          ${THEMES.map(t => `<button type="button" class="theme-option hearty-theme-upgrade-option" data-theme-choice="${t.id}" data-theme-upgrade-choice="${t.id}"><span class="theme-option-top"><strong class="theme-name">${t.name}</strong><span class="theme-selected-badge" data-theme-selected-badge>${t.id === current ? "Current" : "Select"}</span></span><span class="theme-desc">${t.description}</span></button>`).join("")}
        </div>
        <div class="hearty-theme-upgrade-actions">
          <button type="button" class="btn primary" data-theme-notice-keep>Keep this theme</button>
          <button type="button" class="btn secondary" data-theme-notice-later>Remind me later</button>
        </div>
      </div>`;
    document.body.appendChild(backdrop);
    syncThemeControls(readTheme());
    const first = backdrop.querySelector("[data-theme-upgrade-choice]");
    if(first && window.matchMedia && !window.matchMedia("(pointer: coarse)").matches){
      setTimeout(() => first.focus({preventScroll:true}), 30);
    }
  }

  window.HEARTY_THEMES = THEMES.map(({id,name,description}) => ({id,name,description}));
  window.HEARTY_LOGOS_BY_THEME = Object.fromEntries(THEMES.map(t => [t.id, t.logo]));
  window.heartyThemeList = () => THEMES.map(({id,name,description}) => ({id,name,description}));
  window.heartyApplyTheme = (theme) => applyTheme(theme, true);
  window.heartyReadTheme = readTheme;
  window.heartyNormaliseTheme = normalise;
  window.heartyLogoForTheme = (theme) => logoObject(theme);
  window.heartySyncBrandLogos = () => syncBrandContainers(readTheme());
  window.heartyShowThemeUpgradeNotice = renderThemeUpgradeNotice;
  window.heartyCompleteThemeUpgradeNotice = completeThemeNotice;

  applyTheme(readTheme(), false);

  document.addEventListener("DOMContentLoaded", () => {
    applyTheme(readTheme(), false);

    document.querySelectorAll("[data-theme-options]").forEach((mount) => {
      if(mount.__heartyThemeOptionsBuilt) return;
      mount.__heartyThemeOptionsBuilt = true;
      mount.innerHTML = THEMES.map(t => `<button type="button" class="theme-option" data-theme-choice="${t.id}"><span class="theme-option-top"><strong class="theme-name">${t.name}</strong><span class="theme-selected-badge" data-theme-selected-badge>Select</span></span><span class="theme-desc">${t.description}</span></button>`).join("");
    });
    syncThemeControls(readTheme());
    setTimeout(renderThemeUpgradeNotice, 450);

    window.addEventListener("hearty:home-stable", () => scheduleThemeNoticeRetry(900));
    window.addEventListener("hearty:onboarding-complete", () => scheduleThemeNoticeRetry(450));
    const coreSetupSheet = document.getElementById("coreSetupSheet");
    if(coreSetupSheet && window.MutationObserver){
      new MutationObserver(() => scheduleThemeNoticeRetry(650)).observe(coreSetupSheet, { attributes:true, attributeFilter:["hidden", "aria-hidden"] });
    }

    document.addEventListener("click", (event) => {
      const button = event.target.closest("[data-theme], [data-theme-choice]");
      if(!button) return;
      const raw = button.getAttribute("data-theme") || button.getAttribute("data-theme-choice");
      const theme = normalise(raw);
      if(!VALID.includes(theme)) return;
      applyTheme(theme, true);
      if(button.hasAttribute("data-theme-upgrade-choice")) completeThemeNotice();
    }, true);


    document.addEventListener("click", (event) => {
      const keep = event.target.closest("[data-theme-notice-keep]");
      if(keep){
        applyTheme(readTheme(), true);
        completeThemeNotice();
        return;
      }
      const later = event.target.closest("[data-theme-notice-later]");
      if(later){
        hideThemeNoticeForSession();
      }
    }, true);

    document.addEventListener("change", (event) => {
      const target = event.target;
      if(!target) return;
      const isThemeInput = target.matches('select[name="theme"]') || target.matches("#themeSelect") || target.matches("#theme-select") || target.matches(".theme-select") || target.matches("[data-theme-input]");
      if(!isThemeInput) return;
      applyTheme(target.value, true);
    }, true);
  });

  window.addEventListener("storage", (event) => {
    if(event.key === "heartyTheme" || event.key === "hearty-theme") applyTheme(readTheme(), false);
  });
})();

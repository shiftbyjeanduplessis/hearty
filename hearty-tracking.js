(function () {
  "use strict";

  // HEARTY TRACKING V1.2 — no service worker changes, generator-safe.
  // Public anon Supabase key only. Do not use service-role keys in browser code.
  const DEFAULT_SUPABASE_URL = "https://mdsfcnocvelwqiercyci.supabase.co";
  const DEFAULT_SUPABASE_ANON_KEY = "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6Im1kc2Zjbm9jdmVsd3FpZXJjeWNpIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NzcxMTEzNjAsImV4cCI6MjA5MjY4NzM2MH0.TWRwj66PtVhBuf5Ov7AHteNFww1hrCQZuD5ZmEflC5M";

  const config = window.HEARTY_TRACKING_CONFIG || {};
  const SUPABASE_URL = (config.supabaseUrl || DEFAULT_SUPABASE_URL || "").replace(/\/$/, "");
  const SUPABASE_ANON_KEY = config.supabaseAnonKey || DEFAULT_SUPABASE_ANON_KEY || "";
  const EVENTS_TABLE = config.eventsTable || "hearty_events";
  const DEBUG = new URLSearchParams(window.location.search).get("debug_tracking") === "1";

  const STORAGE_KEYS = {
    sessionId: "hearty_session_id",
    source: "hearty_source",
    campaign: "hearty_campaign",
    firstLandingPage: "hearty_first_landing_page",
    firstReferrer: "hearty_first_referrer"
  };

  const firedOnce = new Set();

  function safeLocalStorageGet(key) {
    try { return window.localStorage.getItem(key) || ""; } catch (error) { return ""; }
  }

  function safeLocalStorageSet(key, value) {
    try {
      if (value !== undefined && value !== null && value !== "") {
        window.localStorage.setItem(key, String(value));
      }
    } catch (error) {}
  }

  function makeId() {
    if (window.crypto && typeof window.crypto.randomUUID === "function") {
      return window.crypto.randomUUID();
    }
    return String(Date.now()) + "_" + Math.random().toString(16).slice(2);
  }

  function getOrCreateSessionId() {
    let id = safeLocalStorageGet(STORAGE_KEYS.sessionId);
    if (!id) {
      id = "sess_" + makeId();
      safeLocalStorageSet(STORAGE_KEYS.sessionId, id);
    }
    return id;
  }

  function getParam(name) {
    try { return new URLSearchParams(window.location.search).get(name) || ""; }
    catch (error) { return ""; }
  }

  function normalise(value) {
    return String(value || "").trim().slice(0, 120);
  }

  function storeAttribution() {
    const src = normalise(getParam("src") || getParam("source") || getParam("utm_source"));
    const campaign = normalise(getParam("campaign") || getParam("utm_campaign"));

    if (src) safeLocalStorageSet(STORAGE_KEYS.source, src);
    if (campaign) safeLocalStorageSet(STORAGE_KEYS.campaign, campaign);

    if (!safeLocalStorageGet(STORAGE_KEYS.firstLandingPage)) {
      safeLocalStorageSet(STORAGE_KEYS.firstLandingPage, window.location.pathname + window.location.search);
    }
    if (!safeLocalStorageGet(STORAGE_KEYS.firstReferrer) && document.referrer) {
      safeLocalStorageSet(STORAGE_KEYS.firstReferrer, document.referrer);
    }
  }

  function getSource() {
    storeAttribution();
    return normalise(
      getParam("src") ||
      getParam("source") ||
      getParam("utm_source") ||
      safeLocalStorageGet(STORAGE_KEYS.source) ||
      "direct"
    );
  }

  function getCampaign() {
    storeAttribution();
    return normalise(
      getParam("campaign") ||
      getParam("utm_campaign") ||
      safeLocalStorageGet(STORAGE_KEYS.campaign) ||
      ""
    );
  }

  function cleanMetadata(metadata) {
    const safe = metadata && typeof metadata === "object" ? { ...metadata } : {};
    [
      "dose",
      "medication_dose",
      "medical_history",
      "symptoms",
      "symptom_details",
      "weight",
      "photo",
      "photos",
      "generated_plan",
      "meal_plan",
      "private_notes"
    ].forEach((key) => {
      if (key in safe) delete safe[key];
    });
    return safe;
  }

  async function trackHeartyEvent(eventName, metadata) {
    try {
      if (!SUPABASE_URL || !SUPABASE_ANON_KEY || !eventName) return false;
      storeAttribution();

      const cleanedMetadata = cleanMetadata(metadata);
      const payload = {
        event_name: String(eventName).trim().slice(0, 120),
        session_id: getOrCreateSessionId(),
        source: getSource(),
        campaign: getCampaign(),
        page: window.location.pathname || "",
        referrer: document.referrer || safeLocalStorageGet(STORAGE_KEYS.firstReferrer) || "",
        country: cleanedMetadata.country || "",
        metadata: {
          ...cleanedMetadata,
          first_landing_page: safeLocalStorageGet(STORAGE_KEYS.firstLandingPage) || "",
          timezone: Intl.DateTimeFormat().resolvedOptions().timeZone || "",
          tracking_version: "v1.2-safe-no-sw"
        }
      };

      const response = await fetch(`${SUPABASE_URL}/rest/v1/${EVENTS_TABLE}`, {
        method: "POST",
        keepalive: true,
        headers: {
          "Content-Type": "application/json",
          "apikey": SUPABASE_ANON_KEY,
          "Authorization": `Bearer ${SUPABASE_ANON_KEY}`,
          "Prefer": "return=minimal"
        },
        body: JSON.stringify(payload)
      });

      if (DEBUG) console.log("Hearty event", eventName, response.status, payload);
      if (!response.ok) {
        if (DEBUG) console.warn("Hearty tracking HTTP error", response.status, await response.text());
        return false;
      }
      return true;
    } catch (error) {
      if (DEBUG) console.warn("Hearty tracking failed:", error);
      return false;
    }
  }

  function trackOnce(eventName, metadata) {
    if (firedOnce.has(eventName)) return;
    firedOnce.add(eventName);
    trackHeartyEvent(eventName, metadata);
  }

  function initFreeMealTracking() {
    const isFreeMealPage = /free-meal-plan/i.test(window.location.pathname) || document.querySelector("#generator");
    if (!isFreeMealPage) return;

    trackHeartyEvent("free_meal_page_view");

    document.addEventListener("click", function (event) {
      const target = event.target;
      if (!(target instanceof Element)) return;

      if (target.closest("[data-wizard-open], .option-btn, [data-action='select'], [data-action='next'], [data-save-prompt-jump']")) {
        trackOnce("free_meal_started", { trigger: "interaction" });
      }

    }, true);

    document.addEventListener("input", function () {
      trackOnce("free_meal_started", { trigger: "input" });
    }, true);

    document.addEventListener("change", function () {
      trackOnce("free_meal_started", { trigger: "change" });
    }, true);
  }

  window.trackHeartyEvent = trackHeartyEvent;
  window.heartyTrackingAttribution = {
    getSessionId: getOrCreateSessionId,
    getSource,
    getCampaign,
    version: "v1.2-safe-no-sw"
  };

  function init() {
    trackHeartyEvent("page_view");
    initFreeMealTracking();
  }

  if (document.readyState === "loading") {
    document.addEventListener("DOMContentLoaded", init, { once: true });
  } else {
    init();
  }
})();

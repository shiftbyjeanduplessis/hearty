(function () {
  "use strict";
  var deferredPrompt = null;
  var shown = false;
  var VERSION = "v18";

  function isStandalone() {
    try { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; }
    catch(_) { return false; }
  }
  function pageName(){
    try{
      var p=(window.location.pathname||"/").toLowerCase();
      if(p==="/" || p.endsWith("/home.html") || p.endsWith("/home")) return "home";
      if(p.endsWith("/login.html") || p.endsWith("/login")) return "login";
      if(p.endsWith("/settings.html") || p.endsWith("/settings")) return "settings";
      return "";
    }catch(_){ return ""; }
  }
  function shouldHideForSession(){
    try { return sessionStorage.getItem("heartyInstallDismissedSession") === "true"; } catch(_) { return false; }
  }
  function installInstructions(){
    var ua = navigator.userAgent || "";
    if(/iphone|ipad|ipod/i.test(ua)){
      return "On iPhone: tap Share, then Add to Home Screen.";
    }
    return "On Android: tap the browser menu ⋮, then Install app or Add to Home screen.";
  }
  function showInstallBanner(force) {
    var pg=pageName();
    if (!pg) return;
    if (isStandalone()) return;
    if (!force && shown) return;
    if (!force && shouldHideForSession()) return;
    if (document.getElementById("heartyInstallBanner")) return;
    shown = true;

    var banner = document.createElement("div");
    banner.id = "heartyInstallBanner";
    banner.setAttribute("data-hearty-install", VERSION);
    banner.innerHTML = '<div class="hearty-install-copy"><strong>Install Hearty</strong><span>Add it to your home screen for the full app feel.</span></div><button id="heartyInstallBtn" type="button">Install</button><button id="heartyInstallClose" type="button" aria-label="Close">×</button>';
    document.body.appendChild(banner);

    var close = document.getElementById("heartyInstallClose");
    if (close) close.onclick = function(){ try{sessionStorage.setItem("heartyInstallDismissedSession","true");}catch(_){} banner.remove(); };

    var btn = document.getElementById("heartyInstallBtn");
    if (btn) btn.onclick = async function () {
      if (deferredPrompt) {
        try { deferredPrompt.prompt(); await deferredPrompt.userChoice.catch(function(){}); } catch(_) {}
        deferredPrompt = null;
        banner.remove();
      } else {
        alert(installInstructions());
      }
    };
  }

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredPrompt = event;
    setTimeout(function(){ showInstallBanner(true); }, 700);
  });

  window.addEventListener("appinstalled", function () {
    var banner = document.getElementById("heartyInstallBanner");
    if (banner) banner.remove();
    deferredPrompt = null;
    try { localStorage.setItem("heartyPwaInstalled","true"); } catch(_) {}
  });

  function registerSW(){
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js?v=18").catch(function(err){ console.warn("[Hearty PWA] service worker registration failed", err); });
  }

  window.addEventListener("load", function () {
    registerSW();
    setTimeout(function(){ showInstallBanner(false); }, 1600);
  });
  window.HeartyPWAInstall = window.HeartyPWAInstall || { show:function(){ showInstallBanner(true); } };
})();

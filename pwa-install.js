(function () {
  "use strict";
  var deferredPrompt = null;
  var shown = false;

  function isStandalone() {
    try { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; }
    catch(_) { return false; }
  }
  function isHomePage() {
    var path = (window.location.pathname || "").toLowerCase();
    return path === "/" || path.endsWith("/home.html") || path.endsWith("/app.html") || path.endsWith("/home");
  }
  function shouldHideForSession(){
    try { return sessionStorage.getItem('heartyInstallDismissedSession') === 'true'; } catch(_) { return false; }
  }
  function showInstallBanner(force) {
    if (!isHomePage()) return;
    if (isStandalone()) return;
    if (!force && shown) return;
    if (!force && shouldHideForSession()) return;
    if (document.getElementById("heartyInstallBanner") || document.querySelector('.install-prompt')) return;
    shown = true;

    var banner = document.createElement("div");
    banner.id = "heartyInstallBanner";
    banner.innerHTML = '<div class="hearty-install-copy"><strong>Install Hearty</strong><span>Add it to your home screen for the full app feel.</span></div><button id="heartyInstallBtn" type="button">Install</button><button id="heartyInstallClose" type="button" aria-label="Close">×</button>';
    document.body.appendChild(banner);

    var close = document.getElementById("heartyInstallClose");
    if (close) close.onclick = function(){ try{sessionStorage.setItem('heartyInstallDismissedSession','true')}catch(_){} banner.remove(); };

    var btn = document.getElementById("heartyInstallBtn");
    if (btn) btn.onclick = async function () {
      if (deferredPrompt) {
        try { deferredPrompt.prompt(); await deferredPrompt.userChoice.catch(function(){}); } catch(_) {}
        deferredPrompt = null;
        banner.remove();
      } else {
        alert("On iPhone: tap Share, then Add to Home Screen.\nOn Android: use the browser menu and tap Install app / Add to Home screen.");
      }
    };
  }

  window.addEventListener("beforeinstallprompt", function (event) {
    event.preventDefault();
    deferredPrompt = event;
    setTimeout(function(){ showInstallBanner(true); }, 900);
  });

  window.addEventListener("appinstalled", function () {
    var banner = document.getElementById("heartyInstallBanner");
    if (banner) banner.remove();
    deferredPrompt = null;
    try { localStorage.setItem('heartyPwaInstalled','true'); } catch(_) {}
  });

  function registerSW(){
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js?v=15").catch(function(err){ console.warn("[Hearty PWA] service worker registration failed", err); });
  }

  window.addEventListener("load", function () {
    registerSW();
    if (isHomePage()) setTimeout(function(){ showInstallBanner(false); }, 1800);
  });
  window.addEventListener("hearty-home-ready", function(){ setTimeout(function(){ showInstallBanner(false); }, 1000); });
  window.addEventListener("hearty:home-stable", function(){ setTimeout(function(){ showInstallBanner(false); }, 1000); });
  window.HeartyPWAInstall = window.HeartyPWAInstall || { show:function(){ showInstallBanner(true); } };
})();

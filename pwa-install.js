(function () {
  "use strict";
  var deferredPrompt = null;
  var shown = false;
  var VERSION = "v25";

  function isStandalone() {
    try { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; }
    catch(_) { return false; }
  }


  function isLoginPage(){
    try{ return (document.body && document.body.getAttribute("data-page") === "login") || (document.documentElement && document.documentElement.getAttribute("data-auth-page") === "login") || /\/login\.html$/i.test(location.pathname||""); }catch(_){ return false; }
  }

  function isHomePage(){
    try{
      var p=(window.location.pathname||"/").toLowerCase();
      return p === "/" || p.endsWith("/home.html") || p.endsWith("/home");
    }catch(_){ return false; }
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
    if (isLoginPage()) return;
    if (!isHomePage()) return;
    if (isStandalone()) return;
    if (!force && shown) return;
    if (!force && shouldHideForSession()) return;
    if (document.getElementById("heartyInstallBanner")) return;
    shown = true;

    var banner = document.createElement("div");
    banner.id = "heartyInstallBanner";
    banner.setAttribute("data-hearty-install", VERSION);
    banner.innerHTML = '<span class="hearty-install-title">Install Hearty</span><button id="heartyInstallBtn" type="button">Install</button><button id="heartyInstallClose" type="button" aria-label="Close">×</button>';
    document.body.appendChild(banner);

    var close = document.getElementById("heartyInstallClose");
    if (close) close.onclick = function(){
      try{sessionStorage.setItem("heartyInstallDismissedSession","true");}catch(_){}
      banner.remove();
    };

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
    setTimeout(function(){ showInstallBanner(true); }, 900);
  });

  window.addEventListener("appinstalled", function () {
    var banner = document.getElementById("heartyInstallBanner");
    if (banner) banner.remove();
    deferredPrompt = null;
    try { localStorage.setItem("heartyPwaInstalled","true"); } catch(_) {}
  });

  function registerSW(){
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch(function(){
      navigator.serviceWorker.register("/service-worker.js", { updateViaCache: "none" }).catch(function(err){ console.warn("[Hearty PWA] service worker registration failed", err); });
    });
  }

  window.addEventListener("load", function () {
    if (isLoginPage()) return;
    registerSW();
    // Home screen only. Never reload the page during install/update.
    setTimeout(function(){ showInstallBanner(false); }, 1700);
  });

  window.HeartyPWAInstall = window.HeartyPWAInstall || { show:function(){ showInstallBanner(true); } };
})();

(function () {
  "use strict";
  var deferredPrompt = null;
  var shown = false;
  var VERSION = "v33-top-banner";

  function isStandalone() {
    try { return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true; }
    catch(_) { return false; }
  }

  function isHomePage(){
    try{
      var p=(window.location.pathname||"/").toLowerCase();
      return p === "/" || p.endsWith("/home.html") || p.endsWith("/home");
    }catch(_){ return false; }
  }

  function dismissed(){
    try { return localStorage.getItem("heartyInstallDismissed") === "true"; } catch(_) { return false; }
  }

  function installInstructions(){
    var ua = navigator.userAgent || "";
    if(/iphone|ipad|ipod/i.test(ua)){
      return "On iPhone: tap Share, then Add to Home Screen.";
    }
    return "On Android: tap the browser menu ⋮, then Install app or Add to Home screen.";
  }

  function removeOldFloatingInstall(){
    try{
      Array.prototype.slice.call(document.querySelectorAll('.hearty-install-bottom, .hearty-install-pill, [data-hearty-install-old]')).forEach(function(el){ el.remove(); });
    }catch(_){}
  }

  function placeBanner(banner){
    var shell = document.querySelector('.shell') || document.querySelector('#app') || document.body;
    var topMount = document.querySelector('[data-shell-mount="topbar"]');
    var topbar = document.querySelector('[data-shell-template="topbar"]');
    var anchor = topbar || topMount;
    if(anchor && anchor.parentNode){
      anchor.insertAdjacentElement('afterend', banner);
    } else if(shell && shell.firstChild){
      shell.insertBefore(banner, shell.firstChild);
    } else {
      document.body.appendChild(banner);
    }
  }

  function showInstallBanner(force) {
    if (!isHomePage()) return;
    if (isStandalone()) return;
    if (!force && shown) return;
    if (!force && dismissed()) return;
    removeOldFloatingInstall();
    var existing = document.getElementById("heartyInstallBanner");
    if (existing) return;
    shown = true;

    var banner = document.createElement("section");
    banner.id = "heartyInstallBanner";
    banner.className = "hearty-install-banner-v33";
    banner.setAttribute("data-hearty-install", VERSION);
    banner.setAttribute("aria-label", "Install Hearty");
    banner.innerHTML = '<div class="hearty-install-icon" aria-hidden="true">↗</div>'+
      '<div class="hearty-install-copy"><strong>Install Hearty</strong><span>Open it like an app from your phone screen.</span></div>'+
      '<div class="hearty-install-actions"><button id="heartyInstallBtn" type="button">Install</button><button id="heartyInstallClose" type="button" aria-label="Dismiss install prompt">×</button></div>';
    placeBanner(banner);

    var close = document.getElementById("heartyInstallClose");
    if (close) close.onclick = function(){
      try{localStorage.setItem("heartyInstallDismissed","true");}catch(_){}
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
    registerSW();
    setTimeout(function(){ showInstallBanner(false); }, 1300);
    setTimeout(removeOldFloatingInstall, 1800);
  });

  window.HeartyPWAInstall = window.HeartyPWAInstall || { show:function(){ showInstallBanner(true); } };
})();

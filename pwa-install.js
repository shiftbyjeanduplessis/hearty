(function () {
  "use strict";

  /*
    Hearty v94
    Install prompt rescue:
    - No automatic install card on Home.
    - No delayed install banner flash.
    - Still captures the browser install event quietly.
    - Still registers the service worker.
    - Manual install can be added later via window.HeartyPWAInstall.show().
  */

  var deferredPrompt = null;
  var VERSION = "v94-no-auto-install-banner";

  function isStandalone() {
    try {
      return window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone === true;
    } catch (_) {
      return false;
    }
  }

  function installInstructions() {
    var ua = navigator.userAgent || "";
    if (/iphone|ipad|ipod/i.test(ua)) {
      return "On iPhone: tap Share, then Add to Home Screen.";
    }
    return "On Android: tap the browser menu ⋮, then Install app or Add to Home screen.";
  }

  function removeInstallBanners() {
    try {
      Array.prototype.slice.call(document.querySelectorAll(
        "#heartyInstallBanner,.hearty-install-banner,.hearty-install-banner-v33,.hearty-install-bottom,.hearty-install-pill,[data-hearty-install],[data-install-banner]"
      )).forEach(function (el) { el.remove(); });
    } catch (_) {}
  }

  function showManualInstall() {
    if (isStandalone()) return;

    if (deferredPrompt) {
      var promptEvent = deferredPrompt;
      deferredPrompt = null;
      try {
        promptEvent.prompt();
        if (promptEvent.userChoice && typeof promptEvent.userChoice.catch === "function") {
          promptEvent.userChoice.catch(function () {});
        }
      } catch (_) {
        alert(installInstructions());
      }
      return;
    }

    alert(installInstructions());
  }

  window.addEventListener("beforeinstallprompt", function (event) {
    // Stop Chrome/Edge from creating its own visual install nudge.
    event.preventDefault();
    deferredPrompt = event;
    removeInstallBanners();
  });

  window.addEventListener("appinstalled", function () {
    deferredPrompt = null;
    removeInstallBanners();
    try { localStorage.setItem("heartyPwaInstalled", "true"); } catch (_) {}
  });

  function registerSW() {
    if (!("serviceWorker" in navigator)) return;
    navigator.serviceWorker.register("/sw.js", { updateViaCache: "none" }).catch(function () {
      navigator.serviceWorker.register("/service-worker.js", { updateViaCache: "none" }).catch(function (err) {
        console.warn("[Hearty PWA] service worker registration failed", err);
      });
    });
  }

  window.addEventListener("load", function () {
    removeInstallBanners();
    registerSW();
    setTimeout(removeInstallBanners, 250);
    setTimeout(removeInstallBanners, 1200);
  });

  window.HeartyPWAInstall = window.HeartyPWAInstall || {};
  window.HeartyPWAInstall.version = VERSION;
  window.HeartyPWAInstall.show = showManualInstall;
  window.HeartyPWAInstall.hide = removeInstallBanners;
})();

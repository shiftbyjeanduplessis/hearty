(function () {
  const HEARTY_APP_VERSION = "1.0.3-hotfix-v3";
  window.HEARTY_APP_VERSION = HEARTY_APP_VERSION;

  function showHeartyUpdateToast() {
    if (document.getElementById("hearty-update-toast")) return;

    const toast = document.createElement("div");
    toast.id = "hearty-update-toast";

    toast.innerHTML = `
      <div style="
        position: fixed;
        left: 14px;
        right: 14px;
        bottom: 88px;
        z-index: 999999;
        background: linear-gradient(135deg, #10263f, #1d5d72);
        color: #ffffff;
        border: 1px solid rgba(255,255,255,.22);
        border-radius: 20px;
        padding: 14px 15px;
        box-shadow: 0 18px 45px rgba(0,0,0,.28);
        font-family: system-ui, -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif;
        display: flex;
        align-items: center;
        justify-content: space-between;
        gap: 12px;
      ">
        <div style="line-height:1.25;">
          <strong style="display:block;font-size:14px;font-weight:850;">
            Hearty update ready
          </strong>
          <span style="font-size:12px;opacity:.9;">
            Tap to load the latest fixes.
          </span>
        </div>

        <button id="hearty-update-now" style="
          border: 0;
          border-radius: 999px;
          background: #ffffff;
          color: #10263f;
          font-size: 13px;
          font-weight: 850;
          padding: 9px 14px;
          cursor: pointer;
          white-space: nowrap;
        ">
          Update
        </button>
      </div>
    `;

    document.body.appendChild(toast);

    const btn = document.getElementById("hearty-update-now");
    if (btn) {
      btn.addEventListener("click", function () {
        sessionStorage.setItem("heartyManualUpdateReload", "1");
        window.location.reload();
      });
    }
  }

  async function registerHeartyServiceWorker() {
    if (!("serviceWorker" in navigator)) return;

    try {
      const registration = await navigator.serviceWorker.register("/sw.js", {
        updateViaCache: "none"
      });

      registration.addEventListener("updatefound", function () {
        const newWorker = registration.installing;
        if (!newWorker) return;

        newWorker.addEventListener("statechange", function () {
          if (
            newWorker.state === "installed" &&
            navigator.serviceWorker.controller
          ) {
            showHeartyUpdateToast();
          }
        });
      });

      navigator.serviceWorker.addEventListener("controllerchange", function () {
        if (sessionStorage.getItem("heartyControllerReloaded")) return;

        sessionStorage.setItem("heartyControllerReloaded", "1");
        window.location.reload();
      });

      setInterval(function () {
        registration.update();
      }, 60 * 60 * 1000);
    } catch (error) {
      console.warn("Hearty service worker registration failed:", error);
    }
  }

  window.addEventListener("load", registerHeartyServiceWorker);
})();

(function () {
  'use strict';

  const TOAST_ID = 'hearty-update-toast';

  function removeLegacyUpdateUI(root) {
    const scope = root && root.querySelectorAll ? root : document;
    const selectors = [
      '#' + TOAST_ID,
      '#hearty-update-now',
      '[data-hearty-update-toast]',
      '.hearty-update-toast',
      '.hearty-updater-toast'
    ];
    selectors.forEach((selector) => {
      scope.querySelectorAll(selector).forEach((node) => {
        const container = node.id === 'hearty-update-now' ? node.closest('#' + TOAST_ID) : node;
        if (container && container !== document.body && container !== document.documentElement) container.remove();
      });
    });
  }

  function keepLegacyUIRemoved() {
    removeLegacyUpdateUI(document);
    if (!document.body || !window.MutationObserver) return;
    const observer = new MutationObserver((records) => {
      for (const record of records) {
        for (const node of record.addedNodes) {
          if (!(node instanceof Element)) continue;
          if (node.id === TOAST_ID || node.id === 'hearty-update-now' || node.matches('[data-hearty-update-toast],.hearty-update-toast,.hearty-updater-toast')) {
            removeLegacyUpdateUI(node.parentElement || document);
            return;
          }
          if (node.querySelector && node.querySelector('#' + TOAST_ID + ',#hearty-update-now,[data-hearty-update-toast],.hearty-update-toast,.hearty-updater-toast')) {
            removeLegacyUpdateUI(node);
            return;
          }
        }
      }
    });
    observer.observe(document.body, { childList: true, subtree: true });
  }

  async function registerSilently() {
    if (!('serviceWorker' in navigator)) return;
    try {
      const registration = await navigator.serviceWorker.register('/sw.js', { updateViaCache: 'none' });
      registration.update().catch(() => {});
    } catch (_error) {
      // App use must never be interrupted by update checks.
    }
  }

  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', keepLegacyUIRemoved, { once: true });
  } else {
    keepLegacyUIRemoved();
  }
  window.addEventListener('load', registerSilently, { once: true });
})();

/* StudySnap PWA glue: service-worker registration + install prompt.
 * Loaded after script.js; safe on browsers without SW support.
 */
(function () {
  'use strict';

  // --- 1. Register the service worker (served from /sw.js so its scope is '/') ---
  if ('serviceWorker' in navigator) {
    window.addEventListener('load', function () {
      navigator.serviceWorker
        .register('/sw.js', { scope: '/' })
        .then(function (reg) {
          console.log('[StudySnap PWA] Service worker registered for scope:', reg.scope);
        })
        .catch(function (err) {
          console.warn('[StudySnap PWA] Service worker registration failed:', err);
        });
    });
  }

  // --- 2. Native install prompt ("Add to Home Screen" / desktop install) ---
  var deferredPrompt = null;
  var installBtn = document.getElementById('installAppBtn');

  window.addEventListener('beforeinstallprompt', function (e) {
    // Prevent the default mini-infobar; we surface our own button instead.
    e.preventDefault();
    deferredPrompt = e;
    if (installBtn) installBtn.hidden = false;
  });

  if (installBtn) {
    installBtn.addEventListener('click', async function () {
      if (!deferredPrompt) return;
      deferredPrompt.prompt();
      try {
        await deferredPrompt.userChoice;
      } catch (err) {
        console.warn('[StudySnap PWA] Install prompt failed:', err);
      }
      deferredPrompt = null;
      installBtn.hidden = true;
    });
  }

  window.addEventListener('appinstalled', function () {
    deferredPrompt = null;
    if (installBtn) installBtn.hidden = true;
    console.log('[StudySnap PWA] App installed');
  });
})();

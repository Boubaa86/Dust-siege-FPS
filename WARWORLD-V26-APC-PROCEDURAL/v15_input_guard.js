/* WARWORLD V15 — garde-fou des commandes tactiles et clavier.
   Patch additif : ne change ni les règles de combat, ni le réseau, ni les sauvegardes. */
(() => {
  'use strict';
  if (window.__dsV15InputGuardInstalled) return;
  window.__dsV15InputGuardInstalled = true;

  function releaseAllInputs() {
    // Relâche les entrées maintenues si le navigateur interrompt la page.
    try { if (typeof firing !== 'undefined') firing = false; } catch (_) {}
    try { if (typeof aim !== 'undefined') aim = false; } catch (_) {}
    try {
      if (typeof keys !== 'undefined' && keys) {
        for (const key of Object.keys(keys)) keys[key] = 0;
      }
    } catch (_) {}
    try {
      if (typeof joy !== 'undefined' && joy) { joy.x = 0; joy.y = 0; }
    } catch (_) {}
    try { if (typeof jo !== 'undefined') jo = null; } catch (_) {}
    try {
      if (typeof tid !== 'undefined' && tid) {
        for (const key of Object.keys(tid)) delete tid[key];
      }
    } catch (_) {}

    const joystick = document.getElementById('js');
    const joystickKnob = document.getElementById('jk');
    if (joystick) joystick.style.display = 'none';
    if (joystickKnob) joystickKnob.style.transform = '';
  }

  // Android peut suspendre une page lors d'un appel, d'une notification ou d'un changement d'app.
  window.addEventListener('blur', releaseAllInputs, { passive: true });
  window.addEventListener('pagehide', releaseAllInputs, { passive: true });
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) releaseAllInputs();
  }, { passive: true });
  document.addEventListener('pointerlockchange', () => {
    if (!document.pointerLockElement) releaseAllInputs();
  }, { passive: true });

  window.dsV15InputGuard = { version: 15, releaseAllInputs };
})();

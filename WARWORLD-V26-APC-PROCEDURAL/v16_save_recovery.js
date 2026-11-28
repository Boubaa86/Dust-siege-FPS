/* WARWORLD V16 — sauvegarde locale de secours et récupération des commandes.
   Patch additif : ne change ni les dégâts, ni les armes, ni les règles de partie,
   ni les formats de données, ni les routes Render/Supabase. */
(() => {
  'use strict';
  if (window.__dsV16SaveRecoveryInstalled) return;
  window.__dsV16SaveRecoveryInstalled = true;

  let lastSavedAt = 0;
  let lastReason = '';
  let autosaveTimer = 0;

  function releaseInputs() {
    try {
      if (window.dsV15InputGuard && typeof window.dsV15InputGuard.releaseAllInputs === 'function') {
        window.dsV15InputGuard.releaseAllInputs();
      }
    } catch (error) {
      console.warn('[WARWORLD] Récupération des commandes :', error);
    }
  }

  function saveNow(reason) {
    try {
      // saveAcct() écrit d'abord les données localement, puis programme la synchro cloud.
      // En cas de fermeture/suspension, la sauvegarde locale reste donc prioritaire.
      if (typeof saveAcct === 'function') {
        saveAcct(false);
      } else if (typeof localSave === 'function') {
        localSave();
      } else {
        return false;
      }
      lastSavedAt = Date.now();
      lastReason = String(reason || 'manual');
      window.__dsV16LastLocalSave = lastSavedAt;
      window.__dsV16LastSaveReason = lastReason;
      return true;
    } catch (error) {
      console.warn('[WARWORLD] Sauvegarde locale de secours impossible :', error);
      return false;
    }
  }

  function autosave() {
    try {
      const runActive = typeof inRun !== 'undefined' && !!inRun;
      const gameOver = typeof over !== 'undefined' && !!over;
      if (runActive && !gameOver) saveNow('autosave');
    } catch (error) {
      console.warn('[WARWORLD] Autosauvegarde :', error);
    }
  }

  // Sauvegarde périodique modérée : progression et argent du run, sans finaliser la partie.
  autosaveTimer = window.setInterval(autosave, 45000);

  // Sauvegarde locale immédiate quand Android suspend l'onglet ou ferme l'application.
  window.addEventListener('pagehide', () => {
    releaseInputs();
    saveNow('pagehide');
  }, { capture: true });

  window.addEventListener('beforeunload', () => saveNow('beforeunload'), { capture: true });

  document.addEventListener('visibilitychange', () => {
    if (document.hidden) {
      releaseInputs();
      saveNow('hidden');
    }
  }, { capture: true });

  // Certaines versions Android/Chrome annulent un geste via pointercancel plutôt que touchend.
  window.addEventListener('pointercancel', releaseInputs, { capture: true, passive: true });
  window.addEventListener('touchcancel', releaseInputs, { capture: true, passive: true });
  window.addEventListener('mouseleave', event => {
    if (!document.pointerLockElement && event && event.relatedTarget == null) releaseInputs();
  }, { capture: true, passive: true });
  window.addEventListener('pageshow', event => {
    if (event && event.persisted) releaseInputs();
  }, { capture: true, passive: true });

  // Bouton de sauvegarde manuelle dans le menu Pause : sauvegarde locale garantie,
  // synchro cloud programmée si une session authentifiée est disponible.
  const pauseOverlay = typeof pvo !== 'undefined' ? pvo : document.getElementById('pvo');
  if (pauseOverlay && !document.getElementById('ds-v16-manual-save')) {
    const button = document.createElement('button');
    button.id = 'ds-v16-manual-save';
    button.type = 'button';
    button.textContent = '💾 SAUVEGARDER MA PROGRESSION';
    button.style.cssText = 'font-size:15px;margin-top:10px;padding:11px 16px;letter-spacing:.5px;background:#31543b;color:#fff;border:1px solid #8fc89a;border-radius:9px;transform:none';
    button.setAttribute('aria-label', 'Sauvegarder la progression sur cet appareil');
    button.addEventListener('click', () => {
      const ok = saveNow('manual');
      button.textContent = ok ? '✓ SAUVEGARDE LOCALE EFFECTUÉE' : 'SAUVEGARDE IMPOSSIBLE';
      button.disabled = !ok;
      window.setTimeout(() => {
        button.textContent = '💾 SAUVEGARDER MA PROGRESSION';
        button.disabled = false;
      }, 2600);
    });
    pauseOverlay.appendChild(button);
  }

  window.dsV16SaveRecovery = {
    version: 16,
    saveNow,
    releaseInputs,
    get lastSavedAt() { return lastSavedAt; },
    get lastReason() { return lastReason; },
    get autosaveTimer() { return autosaveTimer; }
  };
})();

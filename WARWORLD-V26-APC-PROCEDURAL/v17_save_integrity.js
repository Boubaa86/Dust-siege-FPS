/* WARWORLD V17 — vérification des sauvegardes et diagnostic non intrusif.
   Patch additif : conserve les clés et le format de sauvegarde existants. */
(() => {
  'use strict';
  if (window.__dsV17IntegrityInstalled) return;
  window.__dsV17IntegrityInstalled = true;

  const SAVE_KEY = 'dsv';
  const BACKUP_KEY = 'dsv_v17_last_verified';
  let lastVerifiedAt = 0;
  let restoreState = 'none';

  function readObject(key) {
    try {
      const raw = localStorage.getItem(key);
      if (!raw) return { ok: false, kind: 'missing', raw: null, data: null };
      const data = JSON.parse(raw);
      if (!data || typeof data !== 'object' || Array.isArray(data)) {
        return { ok: false, kind: 'invalid', raw, data: null };
      }
      return { ok: true, kind: 'valid', raw, data };
    } catch (error) {
      return { ok: false, kind: 'invalid', raw: null, data: null };
    }
  }

  function restoreVerifiedCopy() {
    const primary = readObject(SAVE_KEY);
    if (primary.ok) {
      restoreState = 'primary-valid';
      return false;
    }

    const backup = readObject(BACKUP_KEY);
    if (!backup.ok) {
      restoreState = primary.kind === 'missing' ? 'no-save' : 'no-valid-copy';
      return false;
    }

    try {
      if (typeof saveD !== 'undefined' && saveD && Object.keys(saveD).length === 0) {
        Object.assign(saveD, backup.data);
      }
      localStorage.setItem(SAVE_KEY, backup.raw);
      if (Array.isArray(backup.data.prem)) {
        try { localStorage.setItem('dsp', JSON.stringify(backup.data.prem)); } catch (_) {}
        try {
          if (typeof own2 !== 'undefined' && Array.isArray(own2)) {
            own2.length = 0;
            backup.data.prem.forEach(id => own2.push(id));
          }
          if (typeof applyPrem === 'function') applyPrem();
        } catch (_) {}
      }
      const restored = readObject(SAVE_KEY);
      if (restored.ok && restored.raw === backup.raw) {
        restoreState = 'restored';
        console.info('[WARWORLD] Copie locale vérifiée restaurée.');
        return true;
      }
    } catch (error) {
      console.warn('[WARWORLD] Restauration locale impossible :', error);
    }
    restoreState = 'restore-failed';
    return false;
  }

  function verifyAndBackup() {
    try {
      if (typeof saveD === 'undefined' || !saveD) return false;
      const expected = JSON.stringify(saveD);
      const primary = localStorage.getItem(SAVE_KEY);
      if (typeof primary !== 'string' || primary !== expected) return false;

      // La sauvegarde principale est vérifiée avant d'actualiser la copie de secours.
      try {
        if (localStorage.getItem(BACKUP_KEY) !== primary) {
          localStorage.setItem(BACKUP_KEY, primary);
        }
      } catch (backupError) {
        console.warn('[WARWORLD] Copie de secours non actualisée :', backupError);
      }

      lastVerifiedAt = Date.now();
      window.__dsV17LastVerifiedAt = lastVerifiedAt;
      window.__dsV17SaveState = 'verified';
      return true;
    } catch (error) {
      window.__dsV17SaveState = 'error';
      console.warn('[WARWORLD] Vérification de sauvegarde impossible :', error);
      return false;
    }
  }

  // Au démarrage, récupère la dernière copie confirmée uniquement si la sauvegarde
  // principale est absente ou illisible. Une sauvegarde principale valide est prioritaire.
  restoreVerifiedCopy();

  // Vérifie chaque sauvegarde déjà déclenchée par le jeu sans changer ses appels.
  const originalSaveAcct = window.saveAcct;
  if (typeof originalSaveAcct === 'function' && !originalSaveAcct.__dsV17Wrapped) {
    const guardedSaveAcct = function () {
      let result;
      let thrown = null;
      try {
        result = originalSaveAcct.apply(this, arguments);
      } catch (error) {
        thrown = error;
      }

      const verified = verifyAndBackup();
      if (thrown && !verified) throw thrown;
      if (thrown && verified) {
        console.warn('[WARWORLD] Sauvegarde locale vérifiée malgré une erreur secondaire :', thrown);
      }
      return result;
    };
    Object.defineProperty(guardedSaveAcct, '__dsV17Wrapped', { value: true });
    window.saveAcct = guardedSaveAcct;
  }


  function saveAndVerify() {
    let thrown = null;
    try {
      if (typeof saveAcct === 'function') saveAcct(false);
      else if (typeof localSave === 'function') localSave();
    } catch (error) {
      thrown = error;
    }
    const verified = verifyAndBackup();
    if (thrown && !verified) console.warn('[WARWORLD] Sauvegarde manuelle impossible :', thrown);
    return verified;
  }

  function setText(id, value) {
    const node = document.getElementById(id);
    if (node) node.textContent = value;
  }

  function refreshPauseStatus() {
    const primary = readObject(SAVE_KEY);
    const verified = primary.ok && typeof saveD !== 'undefined' && primary.raw === JSON.stringify(saveD);
    const backup = readObject(BACKUP_KEY);
    let message;
    if (verified) message = 'Sauvegarde sur cet appareil : vérifiée';
    else if (primary.ok) message = 'Sauvegarde présente : vérification à refaire';
    else if (backup.ok) message = 'Sauvegarde principale absente/illisible : copie de secours disponible';
    else message = 'Sauvegarde locale non vérifiée';
    if (lastVerifiedAt) message += ' · dernière vérification ' + new Date(lastVerifiedAt).toLocaleTimeString();
    setText('ds-v17-save-status', message);
  }

  const pauseOverlay = document.getElementById('pvo');
  const manualButton = document.getElementById('ds-v16-manual-save');
  if (pauseOverlay && manualButton && !document.getElementById('ds-v17-save-status')) {
    const status = document.createElement('p');
    status.id = 'ds-v17-save-status';
    status.setAttribute('aria-live', 'polite');
    status.style.cssText = 'font:12px Arial,sans-serif;color:#d8d2c5;margin:6px 0 0;max-width:min(380px,90vw);text-align:center';
    manualButton.insertAdjacentElement('afterend', status);
    // Intercepte le clic avant l'ancien gestionnaire V16 pour ne jamais afficher
    // un succès si le navigateur a refusé l'écriture dans le stockage local.
    manualButton.addEventListener('click', event => {
      if (event) {
        event.preventDefault();
        event.stopImmediatePropagation();
      }
      const ok = saveAndVerify();
      manualButton.textContent = ok ? '✓ SAUVEGARDE LOCALE VÉRIFIÉE' : 'ÉCHEC : SAUVEGARDE NON VÉRIFIÉE';
      manualButton.disabled = !ok;
      refreshPauseStatus();
      window.setTimeout(() => {
        manualButton.textContent = '💾 SAUVEGARDER MA PROGRESSION';
        manualButton.disabled = false;
        refreshPauseStatus();
      }, 2600);
    }, { capture: true });
    refreshPauseStatus();
  }


  window.dsV17SaveIntegrity = {
    version: 17,
    verifyAndBackup,
    saveAndVerify,
    get lastVerifiedAt() { return lastVerifiedAt; },
    get restoreState() { return restoreState; }
  };
})();

/* WARWORLD V25 — Android WebView touch-to-click compatibility.
   Additive input bridge: preserves existing button onclick handlers and game logic. */
(() => {
  'use strict';
  if (window.__dsV25TouchClickRepair) return;
  window.__dsV25TouchClickRepair = true;

  const interactive = 'button, a[href], input, select, textarea, [role="button"], .mc';
  const pending = new Map();
  const MOVE_LIMIT = 14;
  const FALLBACK_DELAY = 650;

  function targetFor(node) {
    if (!node || !node.closest) return null;
    const target = node.closest(interactive);
    if (!target || target.disabled || target.getAttribute('aria-disabled') === 'true') return null;
    if (!target.isConnected) return null;
    return target;
  }

  function cancel(id) {
    const item = pending.get(id);
    if (!item) return;
    clearTimeout(item.timer);
    pending.delete(id);
  }

  function begin(id, node, x, y) {
    const target = targetFor(node);
    if (!target) return;
    cancel(id);
    pending.set(id, { target, x, y, moved: false, timer: 0 });
  }

  function move(id, x, y) {
    const item = pending.get(id);
    if (!item) return;
    if (Math.hypot(x - item.x, y - item.y) > MOVE_LIMIT) cancel(id);
  }

  function finish(id, node) {
    const item = pending.get(id);
    if (!item) return;
    const endTarget = targetFor(node);
    if (!endTarget || (endTarget !== item.target && !item.target.contains(endTarget))) {
      cancel(id);
      return;
    }
    item.timer = window.setTimeout(() => {
      if (!pending.has(id)) return;
      pending.delete(id);
      if (!item.target.isConnected || item.target.disabled) return;
      // The normal browser click gets first chance. This is only the WebView fallback.
      const event = new MouseEvent('click', {
        bubbles: true,
        cancelable: true,
        composed: true,
        view: window,
        detail: 1,
        screenX: item.x,
        screenY: item.y,
        clientX: item.x,
        clientY: item.y
      });
      item.target.dispatchEvent(event);
    }, FALLBACK_DELAY);
  }

  // Any native click on the same control cancels the delayed fallback.
  document.addEventListener('click', event => {
    for (const [id, item] of pending) {
      if (event.target === item.target || item.target.contains(event.target)) cancel(id);
    }
  }, true);

  if ('PointerEvent' in window) {
    document.addEventListener('pointerdown', event => {
      if (event.pointerType !== 'touch') return;
      begin(event.pointerId, event.target, event.clientX, event.clientY);
    }, { capture: true, passive: true });
    document.addEventListener('pointermove', event => {
      if (event.pointerType === 'touch') move(event.pointerId, event.clientX, event.clientY);
    }, { capture: true, passive: true });
    document.addEventListener('pointerup', event => {
      if (event.pointerType === 'touch') finish(event.pointerId, event.target);
    }, { capture: true, passive: true });
    document.addEventListener('pointercancel', event => cancel(event.pointerId), { capture: true, passive: true });
  } else {
    let touchId = null;
    document.addEventListener('touchstart', event => {
      const t = event.changedTouches && event.changedTouches[0];
      if (!t) return;
      touchId = t.identifier;
      begin(touchId, event.target, t.clientX, t.clientY);
    }, { capture: true, passive: true });
    document.addEventListener('touchmove', event => {
      for (const t of event.changedTouches || []) move(t.identifier, t.clientX, t.clientY);
    }, { capture: true, passive: true });
    document.addEventListener('touchend', event => {
      for (const t of event.changedTouches || []) finish(t.identifier, event.target);
      touchId = null;
    }, { capture: true, passive: true });
    document.addEventListener('touchcancel', event => {
      for (const t of event.changedTouches || []) cancel(t.identifier);
      touchId = null;
    }, { capture: true, passive: true });
  }

  window.dsV25TouchClickRepair = { enabled: true, pendingCount: () => pending.size };
})();

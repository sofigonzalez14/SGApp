// ─────────────────────────────────────────────────────────────────
// toast.js — Notificaciones temporales en la parte inferior
// ─────────────────────────────────────────────────────────────────

window.App = window.App || {};

App.toast = (() => {
  let timer = null;

  function show(message) {
    const el = document.getElementById('toast');
    el.textContent = message;
    el.classList.add('show');
    clearTimeout(timer);
    timer = setTimeout(() => el.classList.remove('show'), 2600);
  }

  return { show };
})();

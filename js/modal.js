// ─────────────────────────────────────────────────────────────────
// modal.js — Bottom sheet genérico
// ─────────────────────────────────────────────────────────────────

window.App = window.App || {};

App.modal = (() => {
  const overlay = () => document.getElementById('modal-overlay');
  const content = () => document.getElementById('modal-content');

  function open(html) {
    content().innerHTML = html;
    overlay().classList.add('open');
  }

  function close() {
    overlay().classList.remove('open');
  }

  // Se llama desde el onclick del overlay — solo cierra si el click fue en el fondo
  function closeOutside(event) {
    if (event.target === overlay()) close();
  }

  return { open, close, closeOutside };
})();

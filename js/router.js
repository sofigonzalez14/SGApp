// ─────────────────────────────────────────────────────────────────
// router.js — Navegación entre vistas
// ─────────────────────────────────────────────────────────────────

window.App = window.App || {};

App.router = (() => {

  const TITLES = {
    instituciones: 'ProfeApp 🩷',
    cursos:        'Cursos',
    alumnos:       'Alumnos y Evaluaciones',
    notas:         'Notas',
    asistencia:    'Asistencia',
    cierre:        'Cierre de Notas',
  };

  // Vistas que tienen botón back (no están en el nav principal)
  const SUBVIEWS = ['alumnos'];

  // Mapa de vistas: se completa después de cargar cada views/*.js
  const views = {};

  function register(name, renderFn) {
    views[name] = renderFn;
  }

  function navigate(view) {
    App.state.currentView = view;

    // Actualizar título del header (por si fue removido del HTML)
    const titleEl = document.getElementById('page-title');
    if (titleEl) titleEl.textContent = TITLES[view] || 'ProfeApp';

    // Subtítulo: institución activa (si aplica)
    const sub = document.getElementById('page-subtitle');
    if (sub) {
      if (['cursos', 'notas', 'asistencia', 'cierre', 'alumnos'].includes(view)) {
        const inst = App.state.instituciones.find(i => i.id == App.state.selectedInstitucionId);
        sub.textContent = inst ? inst.nombre : '';
      } else {
        sub.textContent = '';
      }
    }

    // Botón back
    const backBtn = document.getElementById('back-btn');
    if (SUBVIEWS.includes(view)) {
      backBtn.classList.add('visible');
    } else {
      backBtn.classList.remove('visible');
    }

    // Marcar tab activo en el nav (solo para las 5 vistas principales)
    document.querySelectorAll('#bottom-nav button').forEach(b => b.classList.remove('active'));
    const navBtn = document.getElementById('nav-' + view);
    if (navBtn) navBtn.classList.add('active');

    // Renderizar la vista
    if (views[view]) {
      views[view]();
    } else {
      document.getElementById('content').innerHTML =
        `<div class="empty"><span class="empty-emoji">🚧</span><h3>Vista no encontrada</h3></div>`;
    }
  }

  function goBack() {
    // Por ahora, volver a cursos desde alumnos
    navigate('cursos');
  }

  return { navigate, register };

})();

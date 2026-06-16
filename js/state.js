// ─────────────────────────────────────────────────────────────────
// state.js — Estado global de la app
//
// Toda la data vive acá. Las vistas leen de App.state
// y los cambios se aplican sobre este objeto antes de re-renderizar.
// ─────────────────────────────────────────────────────────────────

window.App = window.App || {};

App.state = {
  // ── Datos del servidor ──
  instituciones:  [],
  cursos:         [],
  alumnos:        [],
  evaluaciones:   [],
  notas:          [],
  asistencia:     [],

  // ── Selección actual del usuario ──
  selectedInstitucionId: null,
  selectedCursoId:       null,
  currentEvalId:         null,   // evaluación activa en vista Notas

  // ── Vista actual ──
  currentView: 'instituciones',

  // ── Buffer temporal para asistencia (cambios sin guardar) ──
  asistTemp: {},
};

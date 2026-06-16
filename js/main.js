// ─────────────────────────────────────────────────────────────────
// main.js — Punto de entrada: carga datos y arranca la app
// ─────────────────────────────────────────────────────────────────

// Envuelve una promesa con un timeout para evitar que la app se quede colgada
function withTimeout(promise, ms = 12000) {
  const timeout = new Promise((_, reject) =>
    setTimeout(() => reject(new Error('Timeout — la API tardó demasiado')), ms)
  );
  return Promise.race([promise, timeout]);
}

(async () => {
  try {
    // Cargar todas las hojas en paralelo, con timeout de 12s
    const [instituciones, cursos, alumnos, evaluaciones, notas, asistencia] = await withTimeout(
      Promise.all([
        App.api.getAll('instituciones'),
        App.api.getAll('cursos'),
        App.api.getAll('alumnos'),
        App.api.getAll('evaluaciones'),
        App.api.getAll('notas'),
        App.api.getAll('asistencia'),
      ])
    );

    App.state.instituciones  = Array.isArray(instituciones)  ? instituciones  : [];
    App.state.cursos         = Array.isArray(cursos)         ? cursos         : [];
    App.state.alumnos        = Array.isArray(alumnos)        ? alumnos        : [];
    App.state.evaluaciones   = Array.isArray(evaluaciones)   ? evaluaciones   : [];
    App.state.notas          = Array.isArray(notas)          ? notas          : [];
    App.state.asistencia     = Array.isArray(asistencia)     ? asistencia     : [];

  } catch (err) {
    console.error('Error al cargar datos:', err);
    // La app igual carga — con datos vacíos y aviso
    App.toast.show('⚠️ Sin conexión con Google Sheets. Revisá tu red.');
  }

  // Navegar a la pantalla inicial siempre, haya o no error
  App.router.navigate('instituciones');
})();

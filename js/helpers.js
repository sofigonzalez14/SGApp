// ─────────────────────────────────────────────────────────────────
// helpers.js — Utilidades compartidas entre vistas
// ─────────────────────────────────────────────────────────────────

window.App = window.App || {};

App.helpers = (() => {

  /**
   * Genera un color de acento según el índice de la institución.
   * Así cada colegio tiene su color propio.
   */
  function accentClass(index) {
    return `accent-${index % 6}`;
  }

  /**
   * Selector doble: institución → curso.
   * Usado en Notas, Asistencia y Cierre.
   * onChange dispara un re-navigate a la vista indicada.
   */
  function doubleSelectorHTML(view) {
    const { instituciones, cursos, selectedInstitucionId, selectedCursoId } = App.state;

    const instOpts = instituciones.map(i =>
      `<option value="${i.id}" ${i.id == selectedInstitucionId ? 'selected' : ''}>${i.nombre}</option>`
    ).join('');

    const cursosFiltrados = cursos.filter(c => c.institucion_id == selectedInstitucionId);
    const cursoOpts = cursosFiltrados.map(c =>
      `<option value="${c.id}" ${c.id == selectedCursoId ? 'selected' : ''}>${c.materia} · ${c.año} · Grupo ${c.grupo}</option>`
    ).join('');

    return `
      <div class="selector-block">
        <label>Institución</label>
        <select onchange="App.state.selectedInstitucionId = this.value; App.state.selectedCursoId = null; App.router.navigate('${view}')">
          <option value="">— Seleccioná una institución —</option>
          ${instOpts}
        </select>
      </div>
      ${selectedInstitucionId ? `
      <div class="selector-block">
        <label>Curso</label>
        <select onchange="App.state.selectedCursoId = this.value; App.router.navigate('${view}')">
          <option value="">— Seleccioná un curso —</option>
          ${cursoOpts}
        </select>
      </div>
      ` : ''}
    `;
  }

  /**
   * Selector simple de curso (para la vista Cursos).
   */
  function institucionSelectorHTML(view) {
    const { instituciones, selectedInstitucionId } = App.state;

    const opts = instituciones.map(i =>
      `<option value="${i.id}" ${i.id == selectedInstitucionId ? 'selected' : ''}>${i.nombre}</option>`
    ).join('');

    return `
      <div class="selector-block">
        <label>Institución</label>
        <select onchange="App.state.selectedInstitucionId = this.value; App.router.navigate('${view}')">
          <option value="">— Todas —</option>
          ${opts}
        </select>
      </div>
    `;
  }

  /**
   * Genera un id compuesto para filas sin id propio.
   * Ej: notaId('alumno1', 'eval2') → "alumno1_eval2"
   */
  function compositeId(...parts) {
    return parts.join('_');
  }

  /**
   * Formatea una fecha ISO (YYYY-MM-DD) a formato legible.
   */
  function formatFecha(iso) {
    if (!iso) return '';
    const [y, m, d] = iso.split('-');
    return `${d}/${m}/${y}`;
  }

  return { accentClass, doubleSelectorHTML, institucionSelectorHTML, compositeId, formatFecha };

})();

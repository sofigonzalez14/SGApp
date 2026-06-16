// ─────────────────────────────────────────────────────────────────
// views/cierre.js — Tabla resumen con nota final ponderada
// ─────────────────────────────────────────────────────────────────

App.router.register('cierre', renderCierre);

function renderCierre() {
  const el = document.getElementById('content');
  const { instituciones, cursos, alumnos, evaluaciones, notas, asistencia,
          selectedInstitucionId, selectedCursoId } = App.state;

  if (!instituciones.length) {
    el.innerHTML = `<div class="empty"><span class="empty-emoji">🎓</span><h3>Sin instituciones</h3><p>Creá una desde Inicio.</p></div>`;
    return;
  }

  if (!selectedInstitucionId) App.state.selectedInstitucionId = instituciones[0]?.id;

  if (!selectedCursoId) {
    el.innerHTML = `
      ${App.helpers.doubleSelectorHTML('cierre')}
      <div class="empty" style="padding:32px 0">
        <span class="empty-emoji">📋</span>
        <h3>Seleccioná un curso</h3>
      </div>
    `;
    return;
  }

  const alumnosDeCurso = alumnos.filter(a => a.curso_id == selectedCursoId);
  const evalsDeCurso   = evaluaciones.filter(e => e.curso_id == selectedCursoId);

  if (!alumnosDeCurso.length || !evalsDeCurso.length) {
    el.innerHTML = `
      ${App.helpers.doubleSelectorHTML('cierre')}
      <div class="empty" style="padding:32px 0">
        <span class="empty-emoji">📋</span>
        <h3>Datos insuficientes</h3>
        <p>Necesitás alumnos y evaluaciones cargadas.</p>
      </div>
    `;
    return;
  }

  // ── Encabezados de la tabla ──
  const thEvals = evalsDeCurso.map(e =>
    `<th>${e.nombre}<br><small style="font-weight:500;opacity:0.85">${Math.round(parseFloat(e.peso) * 100)}%</small></th>`
  ).join('');

  // ── Filas por alumno ──
  const filas = alumnosDeCurso.map(a => {
    let sumaPonderada = 0;
    let pesoCubierto  = 0;

    const celdas = evalsDeCurso.map(e => {
      const n = notas.find(x => x.alumno_id == a.id && x.evaluacion_id == e.id);
      const tieneNota = n && n.nota !== '' && n.nota !== undefined;
      if (tieneNota) {
        sumaPonderada += parseFloat(n.nota) * parseFloat(e.peso);
        pesoCubierto  += parseFloat(e.peso);
      }
      return `<td style="text-align:center">${tieneNota ? parseFloat(n.nota).toFixed(1) : '–'}</td>`;
    }).join('');

    // Promedio: si no están todas las notas, se divide solo por el peso cubierto
    const promedio = pesoCubierto > 0
      ? (sumaPonderada / pesoCubierto).toFixed(2)
      : null;

    // Asistencia
    const regsAsist   = asistencia.filter(x => x.alumno_id == a.id);
    const pctAsistencia = regsAsist.length
      ? Math.round(regsAsist.filter(x => String(x.presente).toUpperCase() === 'TRUE').length / regsAsist.length * 100)
      : null;

    // Chip de estado (aprobado con ≥ 6)
    const chip = !promedio
      ? `<span class="chip chip-yellow">Sin datos</span>`
      : parseFloat(promedio) >= 6
        ? `<span class="chip chip-green">Aprobado</span>`
        : `<span class="chip chip-red">Desaprobado</span>`;

    return `
      <tr>
        <td><strong>${a.nombre}</strong>${a.legajo ? `<br><small style="color:var(--text-muted)">${a.legajo}</small>` : ''}</td>
        ${celdas}
        <td style="text-align:center"><strong>${promedio ?? '–'}</strong></td>
        <td style="text-align:center">${pctAsistencia !== null ? pctAsistencia + '%' : '–'}</td>
        <td>${chip}</td>
      </tr>
    `;
  }).join('');

  // Estadísticas rápidas
  const promedios = alumnosDeCurso.map(a => {
    const evals_ = evalsDeCurso;
    let suma = 0, peso = 0;
    evals_.forEach(e => {
      const n = notas.find(x => x.alumno_id == a.id && x.evaluacion_id == e.id);
      if (n && n.nota !== '') { suma += parseFloat(n.nota) * parseFloat(e.peso); peso += parseFloat(e.peso); }
    });
    return peso > 0 ? suma / peso : null;
  }).filter(p => p !== null);

  const aprobados    = promedios.filter(p => p >= 6).length;
  const promedioGral = promedios.length ? (promedios.reduce((a, b) => a + b, 0) / promedios.length).toFixed(2) : '–';

  el.innerHTML = `
    ${App.helpers.doubleSelectorHTML('cierre')}

    <div style="display:flex;gap:10px;margin-bottom:16px;flex-wrap:wrap">
      <div class="card" style="flex:1;min-width:120px;text-align:center;padding:12px">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted)">Promedio gral.</p>
        <h3 style="font-size:22px;margin-top:4px;color:var(--pink)">${promedioGral}</h3>
      </div>
      <div class="card" style="flex:1;min-width:120px;text-align:center;padding:12px">
        <p style="font-size:11px;font-weight:700;text-transform:uppercase;letter-spacing:0.5px;color:var(--text-muted)">Aprobados</p>
        <h3 style="font-size:22px;margin-top:4px;color:var(--violet)">${aprobados} / ${alumnosDeCurso.length}</h3>
      </div>
    </div>

    <div class="cierre-wrap">
      <table class="cierre-table">
        <thead>
          <tr>
            <th>Alumno</th>
            ${thEvals}
            <th>Final</th>
            <th>Asist.</th>
            <th>Estado</th>
          </tr>
        </thead>
        <tbody>${filas}</tbody>
      </table>
    </div>

    <p style="font-size:12px;color:var(--text-muted);margin-top:10px;font-weight:500">
      * Nota final: promedio ponderado. Si falta alguna nota, se calcula sobre el peso disponible. Aprobado con ≥ 6.
    </p>
  `;
}

// ─────────────────────────────────────────────────────────────────
// views/asistencia.js — Registro de asistencia por fecha
// ─────────────────────────────────────────────────────────────────

App.router.register('asistencia', renderAsistencia);

function renderAsistencia() {
  const el = document.getElementById('content');
  const { instituciones, selectedInstitucionId, selectedCursoId } = App.state;

  if (!instituciones.length) {
    el.innerHTML = `<div class="empty"><span class="empty-emoji">📅</span><h3>Sin instituciones</h3><p>Creá una desde Inicio.</p></div>`;
    return;
  }

  if (!selectedInstitucionId) App.state.selectedInstitucionId = instituciones[0]?.id;

  if (!selectedCursoId) {
    el.innerHTML = `
      ${App.helpers.doubleSelectorHTML('asistencia')}
      <div class="empty" style="padding:32px 0">
        <span class="empty-emoji">📋</span>
        <h3>Seleccioná un curso</h3>
      </div>
    `;
    return;
  }

  const today = new Date().toISOString().split('T')[0];

  el.innerHTML = `
    ${App.helpers.doubleSelectorHTML('asistencia')}

    <div class="selector-block">
      <label>Fecha</label>
      <input type="date" id="asist-fecha" value="${today}" onchange="renderAsistenciaList()">
    </div>

    <div class="section-title">Marcar asistencia</div>
    <div id="asist-list"></div>

    <button class="btn btn-primary" style="margin-top:14px;width:100%" onclick="saveAsistencia()">
      💾 Guardar asistencia
    </button>
  `;

  // Reset del buffer temporal
  App.state.asistTemp = {};
  renderAsistenciaList();
}

function renderAsistenciaList() {
  const fecha   = document.getElementById('asist-fecha')?.value;
  const alumnos = App.state.alumnos.filter(a => a.curso_id == App.state.selectedCursoId);
  const list    = document.getElementById('asist-list');
  if (!list) return;

  App.state.asistTemp = {};

  if (!alumnos.length) {
    list.innerHTML = `<div class="empty" style="padding:24px 0"><span class="empty-emoji" style="font-size:28px">👩‍🎓</span><p>Sin alumnos en este curso.</p></div>`;
    return;
  }

  list.innerHTML = `<div class="asist-list">` + alumnos.map(a => {
    const reg      = App.state.asistencia.find(x => x.alumno_id == a.id && x.fecha == fecha);
    const presente = reg ? String(reg.presente).toUpperCase() === 'TRUE' : true;  // default: presente
    App.state.asistTemp[a.id] = presente;

    return `
      <div class="asist-row">
        <span class="asist-name">${a.nombre}</span>
        <div class="asist-toggle">
          <button id="btn-p-${a.id}" class="${presente ? 'active-p' : ''}"
            onclick="setAsist('${a.id}', true)">P</button>
          <button id="btn-a-${a.id}" class="${!presente ? 'active-a' : ''}"
            onclick="setAsist('${a.id}', false)">A</button>
        </div>
      </div>
    `;
  }).join('') + `</div>`;
}

function setAsist(alumnoId, presente) {
  App.state.asistTemp[alumnoId] = presente;
  document.getElementById('btn-p-' + alumnoId).className = presente  ? 'active-p' : '';
  document.getElementById('btn-a-' + alumnoId).className = !presente ? 'active-a' : '';
}

async function saveAsistencia() {
  const fecha   = document.getElementById('asist-fecha')?.value;
  const alumnos = App.state.alumnos.filter(a => a.curso_id == App.state.selectedCursoId);
  const ops     = [];

  for (const a of alumnos) {
    const presente = App.state.asistTemp[a.id] ?? true;
    const asistId  = App.helpers.compositeId(a.id, fecha);  // id compuesto
    const data     = { id: asistId, alumno_id: a.id, fecha, presente };
    const existe   = App.state.asistencia.find(x => x.alumno_id == a.id && x.fecha == fecha);

    if (existe) {
      ops.push(
        App.api.update('asistencia', data).then(() => {
          App.state.asistencia = App.state.asistencia.map(x =>
            x.alumno_id == a.id && x.fecha == fecha ? data : x
          );
        })
      );
    } else {
      ops.push(
        App.api.insert('asistencia', data).then(() => {
          App.state.asistencia.push(data);
        })
      );
    }
  }

  await Promise.all(ops);
  App.toast.show('Asistencia guardada ✓');
}

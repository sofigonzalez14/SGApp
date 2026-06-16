// ─────────────────────────────────────────────────────────────────
// views/notas.js — Carga de notas por evaluación
// ─────────────────────────────────────────────────────────────────

App.router.register('notas', renderNotas);

function renderNotas() {
  const el = document.getElementById('content');
  const { instituciones, cursos, alumnos, evaluaciones, selectedInstitucionId, selectedCursoId } = App.state;

  if (!instituciones.length) {
    el.innerHTML = `<div class="empty"><span class="empty-emoji">📝</span><h3>Sin instituciones</h3><p>Creá una desde Inicio.</p></div>`;
    return;
  }

  // Inicializar institución por defecto
  if (!selectedInstitucionId) App.state.selectedInstitucionId = instituciones[0]?.id;

  const evals   = evaluaciones.filter(e => e.curso_id == selectedCursoId);
  const alumnos_ = alumnos.filter(a => a.curso_id == selectedCursoId);

  // Sin curso seleccionado o sin evaluaciones: mostrar selectores y aviso
  if (!selectedCursoId || !evals.length) {
    el.innerHTML = `
      ${App.helpers.doubleSelectorHTML('notas')}
      <div class="empty" style="padding:32px 0">
        <span class="empty-emoji">📋</span>
        <h3>${!selectedCursoId ? 'Seleccioná un curso' : 'Sin evaluaciones'}</h3>
        <p>${!selectedCursoId ? '' : 'Agregá evaluaciones desde la sección Cursos → Alumnos.'}</p>
      </div>
    `;
    return;
  }

  // Tabs de evaluaciones
  const tabs = evals.map((e, i) => `
    <button class="btn btn-sm ${i === 0 && !App.state.currentEvalId ? 'btn-primary' : (e.id == App.state.currentEvalId ? 'btn-primary' : 'btn-ghost')}"
      id="eval-tab-${e.id}"
      onclick="selectEvalTab('${e.id}')">
      ${e.nombre}
    </button>
  `).join('');

  el.innerHTML = `
    ${App.helpers.doubleSelectorHTML('notas')}
    <div class="section-title">Evaluación</div>
    <div class="eval-tabs">${tabs}</div>
    <div id="notas-list"></div>
    <button class="btn btn-primary" style="margin-top:8px;width:100%" onclick="saveAllNotas()">
      💾 Guardar notas
    </button>
  `;

  // Mostrar la primera evaluación por defecto (o la que estaba activa)
  const evalToShow = App.state.currentEvalId && evals.find(e => e.id == App.state.currentEvalId)
    ? App.state.currentEvalId
    : evals[0].id;
  selectEvalTab(evalToShow);
}

function selectEvalTab(evalId) {
  App.state.currentEvalId = evalId;

  // Actualizar estilos de tabs
  App.state.evaluaciones.forEach(e => {
    const btn = document.getElementById('eval-tab-' + e.id);
    if (!btn) return;
    btn.className = `btn btn-sm ${e.id == evalId ? 'btn-primary' : 'btn-ghost'}`;
  });

  const alumnos = App.state.alumnos.filter(a => a.curso_id == App.state.selectedCursoId);
  const list    = document.getElementById('notas-list');
  if (!list) return;

  if (!alumnos.length) {
    list.innerHTML = `<div class="empty" style="padding:24px 0"><span class="empty-emoji" style="font-size:28px">👩‍🎓</span><p>Sin alumnos en este curso.</p></div>`;
    return;
  }

  list.innerHTML = alumnos.map(a => {
    const nota = App.state.notas.find(n => n.alumno_id == a.id && n.evaluacion_id == evalId);
    return `
      <div class="nota-row">
        <span class="nota-name">${a.nombre}</span>
        <input class="nota-input" type="number" min="0" max="10" step="0.01"
          id="nota-${a.id}"
          value="${(nota && nota.nota !== '') ? nota.nota : ''}"
          placeholder="—">
      </div>
    `;
  }).join('');
}

async function saveAllNotas() {
  const alumnos = App.state.alumnos.filter(a => a.curso_id == App.state.selectedCursoId);
  const evalId  = App.state.currentEvalId;
  if (!evalId) return App.toast.show('Seleccioná una evaluación primero');

  const ops = [];

  for (const a of alumnos) {
    const input = document.getElementById('nota-' + a.id);
    if (!input || input.value === '') continue;

    const nota   = parseFloat(input.value);
    const noteId = App.helpers.compositeId(a.id, evalId);  // id compuesto
    const existe = App.state.notas.find(n => n.alumno_id == a.id && n.evaluacion_id == evalId);
    const data   = { id: noteId, alumno_id: a.id, evaluacion_id: evalId, nota };

    if (existe) {
      ops.push(
        App.api.update('notas', data).then(() => {
          App.state.notas = App.state.notas.map(n =>
            n.alumno_id == a.id && n.evaluacion_id == evalId ? data : n
          );
        })
      );
    } else {
      ops.push(
        App.api.insert('notas', data).then(() => {
          App.state.notas.push(data);
        })
      );
    }
  }

  await Promise.all(ops);
  App.toast.show('Notas guardadas ✓');
}

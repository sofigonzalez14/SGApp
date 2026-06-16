// ─────────────────────────────────────────────────────────────────
// views/cursos.js — Lista de cursos de una institución
// Cada curso muestra: materia, año, grupo
// ─────────────────────────────────────────────────────────────────

App.router.register('cursos', renderCursos);

function renderCursos() {
  const el = document.getElementById('content');
  const { instituciones, cursos, selectedInstitucionId } = App.state;

  if (!instituciones.length) {
    el.innerHTML = `
      <div class="empty">
        <span class="empty-emoji">🏫</span>
        <h3>Sin instituciones</h3>
        <p>Primero creá una institución desde Inicio.</p>
      </div>
    `;
    return;
  }

  // Si no hay institución seleccionada, tomamos la primera
  if (!selectedInstitucionId) {
    App.state.selectedInstitucionId = instituciones[0].id;
  }

  const cursosFiltrados = cursos.filter(c => c.institucion_id == App.state.selectedInstitucionId);

  const cards = cursosFiltrados.length
    ? cursosFiltrados.map(c => {
        const nAlumnos = App.state.alumnos.filter(a => a.curso_id == c.id).length;
        const nEvals   = App.state.evaluaciones.filter(e => e.curso_id == c.id).length;
        return `
          <div class="card card-curso" onclick="goToAlumnos('${c.id}')">
            <div class="card-row">
              <div style="flex:1">
                <h3>${c.materia}</h3>
                <div class="curso-badge">
                  📅 ${c.año} &nbsp;·&nbsp; Grupo ${c.grupo}
                </div>
                <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
                  <span class="chip chip-pink">${nAlumnos} alumno${nAlumnos !== 1 ? 's' : ''}</span>
                  <span class="chip chip-violet">${nEvals} evaluación${nEvals !== 1 ? 'es' : ''}</span>
                </div>
              </div>
              <div class="actions" onclick="event.stopPropagation()">
                <button class="icon-btn" onclick="openCursoModal('${c.id}')">✏️</button>
                <button class="icon-btn" onclick="confirmDeleteCurso('${c.id}')">🗑️</button>
              </div>
            </div>
          </div>
        `;
      }).join('')
    : `
        <div class="empty" style="padding:32px 0">
          <span class="empty-emoji">📚</span>
          <h3>Sin cursos</h3>
          <p>Tocá + para agregar el primero.</p>
        </div>
      `;

  el.innerHTML = `
    ${App.helpers.institucionSelectorHTML('cursos')}
    ${cards}
    <button class="fab" onclick="openCursoModal()">+</button>
  `;
}

function goToAlumnos(cursoId) {
  App.state.selectedCursoId = cursoId;
  App.router.navigate('alumnos');
}

// ── CRUD ──────────────────────────────────────────────────────────

function openCursoModal(id = null) {
  const c = id ? App.state.cursos.find(x => x.id == id) : null;
  App.modal.open(`
    <h2>${c ? 'Editar curso' : 'Nuevo curso'}</h2>
    <div class="form-group">
      <label>Materia *</label>
      <input id="f-materia" placeholder="Ej: Laboratorio de Aplicaciones" value="${c?.materia || ''}">
    </div>
    <div class="form-group">
      <label>Año *</label>
      <input id="f-anio" placeholder="Ej: 5to año" value="${c?.año || ''}">
    </div>
    <div class="form-group">
      <label>Grupo *</label>
      <input id="f-grupo" placeholder="Ej: 1" value="${c?.grupo || ''}">
    </div>
    <div class="form-actions">
      <button class="btn btn-ghost" onclick="App.modal.close()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveCurso(${id ? `'${id}'` : null})">Guardar</button>
    </div>
  `);
}

async function saveCurso(id) {
  const materia = document.getElementById('f-materia').value.trim();
  const año     = document.getElementById('f-anio').value.trim();
  const grupo   = document.getElementById('f-grupo').value.trim();

  if (!materia || !año || !grupo) return App.toast.show('Completá todos los campos');

  const data = { materia, año, grupo, institucion_id: App.state.selectedInstitucionId };

  if (id) {
    data.id = id;
    await App.api.update('cursos', data);
    App.state.cursos = App.state.cursos.map(c => c.id == id ? { ...c, ...data } : c);
    App.toast.show('Curso actualizado ✓');
  } else {
    const res = await App.api.insert('cursos', data);
    App.state.cursos.push({ ...data, id: res.id });
    App.toast.show('Curso creado ✓');
  }

  App.modal.close();
  renderCursos();
}

async function confirmDeleteCurso(id) {
  const c = App.state.cursos.find(x => x.id == id);
  if (!confirm(`¿Borrar "${c.materia} · ${c.año} · Grupo ${c.grupo}"?`)) return;

  await App.api.delete('cursos', id);
  App.state.cursos      = App.state.cursos.filter(x => x.id != id);
  App.state.alumnos     = App.state.alumnos.filter(x => x.curso_id != id);
  App.state.evaluaciones = App.state.evaluaciones.filter(x => x.curso_id != id);

  App.toast.show('Curso borrado');
  renderCursos();
}

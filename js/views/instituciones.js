// ─────────────────────────────────────────────────────────────────
// views/instituciones.js — Pantalla de inicio: lista de colegios
// ─────────────────────────────────────────────────────────────────

App.router.register('instituciones', renderInstituciones);

function renderInstituciones() {
  const el = document.getElementById('content');
  const { instituciones, cursos, alumnos } = App.state;

  if (!instituciones.length) {
    el.innerHTML = `
      <div class="empty">
        <span class="empty-emoji">🏫</span>
        <h3>Sin instituciones</h3>
        <p>Tocá + para agregar tu primer colegio.</p>
      </div>
      <button class="fab" onclick="openInstitucionModal()">+</button>
    `;
    return;
  }

  // ── Resumen ──────────────────────────────────────────────
  const totalCursos   = cursos.length;
  const totalAlumnos  = alumnos.length;
  const totalInst     = instituciones.length;

  const resumen = `
    <div class="section-title">resumen</div>
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-num">${totalInst}</div>
        <div class="stat-label">institución${totalInst !== 1 ? 'es' : ''}</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${totalCursos}</div>
        <div class="stat-label">curso${totalCursos !== 1 ? 's' : ''}</div>
      </div>
      <div class="stat-card">
        <div class="stat-num">${totalAlumnos}</div>
        <div class="stat-label">alumno${totalAlumnos !== 1 ? 's' : ''}</div>
      </div>
      <div class="stat-card">
        <div class="stat-num" style="color:#a855f7">${App.state.evaluaciones.length}</div>
        <div class="stat-label">evaluacion${App.state.evaluaciones.length !== 1 ? 'es' : ''}</div>
      </div>
    </div>
    <div class="section-title">instituciones</div>
  `;

  // ── Cards ─────────────────────────────────────────────────
  const cards = instituciones.map((inst, i) => {
    const nCursos  = cursos.filter(c => c.institucion_id == inst.id).length;
    const cursIds  = cursos.filter(c => c.institucion_id == inst.id).map(c => c.id);
    const nAlumnos = alumnos.filter(a => cursIds.includes(a.curso_id)).length;
    return `
      <div class="card card-institucion ${App.helpers.accentClass(i)}"
           onclick="goToCursos('${inst.id}')">
        <div class="card-row">
          <div style="flex:1">
            <h3>${inst.nombre}</h3>
            ${inst.descripcion ? `<p>${inst.descripcion}</p>` : ''}
            <div style="margin-top:8px;display:flex;gap:6px;flex-wrap:wrap">
              <span class="chip chip-pink">${nCursos} curso${nCursos !== 1 ? 's' : ''}</span>
              <span class="chip chip-violet">${nAlumnos} alumno${nAlumnos !== 1 ? 's' : ''}</span>
            </div>
          </div>
          <div class="actions" onclick="event.stopPropagation()">
            <button class="icon-btn" onclick="openInstitucionModal('${inst.id}')">✏️</button>
            <button class="icon-btn" onclick="confirmDeleteInstitucion('${inst.id}')">🗑️</button>
          </div>
        </div>
      </div>
    `;
  }).join('');

  el.innerHTML = resumen + cards + `<button class="fab" onclick="openInstitucionModal()">+</button>`;
}

function goToCursos(institucionId) {
  App.state.selectedInstitucionId = institucionId;
  App.router.navigate('cursos');
}

// ── CRUD ──────────────────────────────────────────────────────────

function openInstitucionModal(id = null) {
  const inst = id ? App.state.instituciones.find(i => i.id == id) : null;
  App.modal.open(`
    <h2>${inst ? 'Editar institución' : 'Nueva institución'}</h2>
    <div class="form-group">
      <label>Nombre *</label>
      <input id="f-nombre" placeholder="Ej: Instituto San Martín" value="${inst?.nombre || ''}">
    </div>
    <div class="form-group">
      <label>Descripción (opcional)</label>
      <input id="f-desc" placeholder="Ej: Turno tarde" value="${inst?.descripcion || ''}">
    </div>
    <div class="form-actions">
      <button class="btn btn-ghost" onclick="App.modal.close()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveInstitucion(${id ? `'${id}'` : null})">Guardar</button>
    </div>
  `);
}

async function saveInstitucion(id) {
  const nombre = document.getElementById('f-nombre').value.trim();
  if (!nombre) return App.toast.show('El nombre es obligatorio');

  const data = {
    nombre,
    descripcion: document.getElementById('f-desc').value.trim(),
  };

  if (id) {
    data.id = id;
    await App.api.update('instituciones', data);
    App.state.instituciones = App.state.instituciones.map(i => i.id == id ? { ...i, ...data } : i);
    App.toast.show('Institución actualizada ✓');
  } else {
    const res = await App.api.insert('instituciones', data);
    App.state.instituciones.push({ ...data, id: res.id });
    App.toast.show('Institución creada ✓');
  }

  App.modal.close();
  renderInstituciones();
}

async function confirmDeleteInstitucion(id) {
  const inst = App.state.instituciones.find(i => i.id == id);
  if (!confirm(`¿Borrar "${inst.nombre}"?\nSe borrarán también sus cursos y alumnos.`)) return;

  await App.api.delete('instituciones', id);
  App.state.instituciones = App.state.instituciones.filter(i => i.id != id);
  App.state.cursos        = App.state.cursos.filter(c => c.institucion_id != id);

  App.toast.show('Institución borrada');
  renderInstituciones();
}

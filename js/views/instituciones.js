// ─────────────────────────────────────────────────────────────────
// views/instituciones.js — Pantalla de inicio: lista de colegios
// ─────────────────────────────────────────────────────────────────

App.router.register('instituciones', renderInstituciones);

function renderInstituciones() {
  const el = document.getElementById('content');
  const { instituciones } = App.state;

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

  const cards = instituciones.map((inst, i) => {
    const nCursos = App.state.cursos.filter(c => c.institucion_id == inst.id).length;
    return `
      <div class="card card-institucion ${App.helpers.accentClass(i)}"
           onclick="goToCursos('${inst.id}')">
        <div class="card-row">
          <div style="flex:1">
            <h3>${inst.nombre}</h3>
            ${inst.descripcion ? `<p>${inst.descripcion}</p>` : ''}
            <div style="margin-top:8px">
              <span class="chip chip-pink">${nCursos} curso${nCursos !== 1 ? 's' : ''}</span>
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

  el.innerHTML = cards + `<button class="fab" onclick="openInstitucionModal()">+</button>`;
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

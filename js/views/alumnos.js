// ─────────────────────────────────────────────────────────────────
// views/alumnos.js — Alumnos + Evaluaciones de un curso
// ─────────────────────────────────────────────────────────────────

App.router.register('alumnos', renderAlumnos);

function renderAlumnos() {
  const el = document.getElementById('content');
  const { alumnos, evaluaciones, cursos, selectedCursoId } = App.state;

  if (!selectedCursoId) {
    el.innerHTML = `<div class="empty"><span class="empty-emoji">📚</span><h3>Seleccioná un curso primero</h3></div>`;
    return;
  }

  const curso = cursos.find(c => c.id == selectedCursoId);
  const alumnosDeCurso = alumnos.filter(a => a.curso_id == selectedCursoId);
  const evalsDeCurso   = evaluaciones.filter(e => e.curso_id == selectedCursoId);

  // Calcular si los pesos suman 100%
  const pesoTotal = evalsDeCurso.reduce((s, e) => s + parseFloat(e.peso || 0), 0);
  const pesoOk    = Math.abs(pesoTotal - 1) < 0.01;
  const pesoHTML  = evalsDeCurso.length
    ? `<span class="peso-info ${pesoOk ? 'peso-ok' : 'peso-warning'}">
        Peso total: ${Math.round(pesoTotal * 100)}% ${pesoOk ? '✓' : '⚠️ debería sumar 100%'}
       </span>`
    : '';

  // ── Subtítulo del header con el curso activo ──
  document.getElementById('page-subtitle').textContent =
    curso ? `${curso.materia} · ${curso.año} · Grupo ${curso.grupo}` : '';

  // ── Cards de alumnos ──
  const alumnoCards = alumnosDeCurso.length
    ? alumnosDeCurso.map(a => `
        <div class="card">
          <div class="card-row">
            <div>
              <h3>${a.nombre}</h3>
              ${a.legajo ? `<p>Legajo: ${a.legajo}</p>` : ''}
            </div>
            <div class="actions">
              <button class="icon-btn" onclick="openAlumnoModal('${a.id}')">✏️</button>
              <button class="icon-btn" onclick="deleteAlumno('${a.id}')">🗑️</button>
            </div>
          </div>
        </div>
      `).join('')
    : `<div class="empty" style="padding:24px 0">
        <span class="empty-emoji" style="font-size:28px">👩‍🎓</span>
        <p>Sin alumnos aún.</p>
       </div>`;

  // ── Cards de evaluaciones ──
  const evalCards = evalsDeCurso.length
    ? evalsDeCurso.map(e => `
        <div class="card">
          <div class="card-row">
            <div>
              <h3>${e.nombre}</h3>
              <p>Peso: ${Math.round(parseFloat(e.peso || 0) * 100)}%</p>
            </div>
            <div class="actions">
              <button class="icon-btn" onclick="openEvalModal('${e.id}')">✏️</button>
              <button class="icon-btn" onclick="deleteEval('${e.id}')">🗑️</button>
            </div>
          </div>
        </div>
      `).join('')
    : `<p style="color:var(--text-muted);font-size:13px;padding:8px 0;font-weight:600">Sin evaluaciones aún.</p>`;

  el.innerHTML = `
    <div class="section-title">Alumnos</div>
    ${alumnoCards}
    <button class="btn btn-primary btn-sm" style="margin-bottom:24px" onclick="openAlumnoModal()">+ Agregar alumno</button>

    <div class="section-title">Evaluaciones y pesos</div>
    ${evalCards}
    ${pesoHTML}
    <br>
    <button class="btn btn-ghost btn-sm" style="margin-top:8px" onclick="openEvalModal()">+ Agregar evaluación</button>
  `;
}

// ── CRUD Alumnos ──────────────────────────────────────────────────

function openAlumnoModal(id = null) {
  const a = id ? App.state.alumnos.find(x => x.id == id) : null;
  App.modal.open(`
    <h2>${a ? 'Editar alumno' : 'Nuevo alumno'}</h2>
    <div class="form-group">
      <label>Nombre completo *</label>
      <input id="f-nombre" placeholder="Ej: García, Lucía" value="${a?.nombre || ''}">
    </div>
    <div class="form-group">
      <label>Legajo (opcional)</label>
      <input id="f-legajo" placeholder="Ej: 12345" value="${a?.legajo || ''}">
    </div>
    <div class="form-actions">
      <button class="btn btn-ghost" onclick="App.modal.close()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveAlumno(${id ? `'${id}'` : null})">Guardar</button>
    </div>
  `);
}

async function saveAlumno(id) {
  const nombre = document.getElementById('f-nombre').value.trim();
  if (!nombre) return App.toast.show('El nombre es obligatorio');

  const data = {
    nombre,
    legajo:   document.getElementById('f-legajo').value.trim(),
    curso_id: App.state.selectedCursoId,
  };

  if (id) {
    data.id = id;
    await App.api.update('alumnos', data);
    App.state.alumnos = App.state.alumnos.map(a => a.id == id ? { ...a, ...data } : a);
    App.toast.show('Alumno actualizado ✓');
  } else {
    const res = await App.api.insert('alumnos', data);
    App.state.alumnos.push({ ...data, id: res.id });
    App.toast.show('Alumno agregado ✓');
  }

  App.modal.close();
  renderAlumnos();
}

async function deleteAlumno(id) {
  if (!confirm('¿Borrar este alumno?')) return;
  await App.api.delete('alumnos', id);
  App.state.alumnos = App.state.alumnos.filter(a => a.id != id);
  App.toast.show('Alumno borrado');
  renderAlumnos();
}

// ── CRUD Evaluaciones ─────────────────────────────────────────────

function openEvalModal(id = null) {
  const e = id ? App.state.evaluaciones.find(x => x.id == id) : null;
  App.modal.open(`
    <h2>${e ? 'Editar evaluación' : 'Nueva evaluación'}</h2>
    <div class="form-group">
      <label>Nombre *</label>
      <input id="f-nombre" placeholder="Ej: Parcial 1" value="${e?.nombre || ''}">
    </div>
    <div class="form-group">
      <label>Peso (%) *</label>
      <input id="f-peso" type="number" min="1" max="100" placeholder="Ej: 40"
        value="${e ? Math.round(parseFloat(e.peso) * 100) : ''}">
    </div>
    <div class="form-actions">
      <button class="btn btn-ghost" onclick="App.modal.close()">Cancelar</button>
      <button class="btn btn-primary" onclick="saveEval(${id ? `'${id}'` : null})">Guardar</button>
    </div>
  `);
}

async function saveEval(id) {
  const nombre   = document.getElementById('f-nombre').value.trim();
  const pesoRaw  = parseFloat(document.getElementById('f-peso').value);

  if (!nombre)                       return App.toast.show('El nombre es obligatorio');
  if (isNaN(pesoRaw) || pesoRaw <= 0) return App.toast.show('El peso debe ser mayor a 0');

  const data = {
    nombre,
    peso:     pesoRaw / 100,
    curso_id: App.state.selectedCursoId,
  };

  if (id) {
    data.id = id;
    await App.api.update('evaluaciones', data);
    App.state.evaluaciones = App.state.evaluaciones.map(e => e.id == id ? { ...e, ...data } : e);
    App.toast.show('Evaluación actualizada ✓');
  } else {
    const res = await App.api.insert('evaluaciones', data);
    App.state.evaluaciones.push({ ...data, id: res.id });
    App.toast.show('Evaluación agregada ✓');
  }

  App.modal.close();
  renderAlumnos();
}

async function deleteEval(id) {
  if (!confirm('¿Borrar esta evaluación?')) return;
  await App.api.delete('evaluaciones', id);
  App.state.evaluaciones = App.state.evaluaciones.filter(e => e.id != id);
  App.toast.show('Evaluación borrada');
  renderAlumnos();
}

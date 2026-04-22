import { supabase } from '../supabase.js';

function setView(title, html) {
  const viewTitle = document.getElementById('viewTitle');
  const viewContent = document.getElementById('viewContent');

  if (viewTitle) viewTitle.textContent = title;
  if (viewContent) viewContent.innerHTML = html;
}

function getOfertaFormHTML(modo = 'nuevo', oferta = {}) {
  const esEdicion = modo === 'editar';
  const titulo = esEdicion ? 'Editar oferta de empleo' : 'Nueva oferta de empleo';
  const textoBoton = esEdicion ? 'Guardar cambios' : 'Guardar oferta';

  return `
    <div class="form-card">
      <h3>${titulo}</h3>
      <form id="ofertaForm">
        <div class="form-grid">
          <div>
            <label for="oferta_titulo">Título</label>
            <input type="text" id="oferta_titulo" value="${oferta.titulo || ''}" required />
          </div>

          <div>
            <label for="oferta_estado">Estado</label>
            <select id="oferta_estado">
              <option value="activa" ${oferta.estado === 'activa' ? 'selected' : ''}>activa</option>
              <option value="cerrada" ${oferta.estado === 'cerrada' ? 'selected' : ''}>cerrada</option>
            </select>
          </div>

          <div class="full-width">
            <label for="oferta_descripcion">Descripción</label>
            <textarea id="oferta_descripcion" rows="5">${oferta.descripcion || ''}</textarea>
          </div>

          <div>
            <label for="oferta_prioridad">¿Prioritaria?</label>
            <select id="oferta_prioridad">
              <option value="true" ${oferta.prioridad ? 'selected' : ''}>Sí</option>
              <option value="false" ${!oferta.prioridad ? 'selected' : ''}>No</option>
            </select>
          </div>
        </div>

        <div class="top-actions" style="justify-content:flex-start; margin-top:16px;">
          <button type="submit">${textoBoton}</button>
          <button type="button" id="cancelarOfertaBtn" class="secondary-btn">Cancelar</button>
        </div>
      </form>

      <div id="ofertaMsg" class="message"></div>
    </div>
  `;
}

function getCvFormHTML() {
  return `
    <div class="form-card">
      <h3>Nuevo Currículum Vitae</h3>
      <form id="cvForm">
        <div class="form-grid">
          <div>
            <label for="cv_nombre">Nombre</label>
            <input type="text" id="cv_nombre" required />
          </div>

          <div>
            <label for="cv_telefono">Teléfono</label>
            <input type="text" id="cv_telefono" />
          </div>

          <div>
            <label for="cv_email">Email</label>
            <input type="email" id="cv_email" />
          </div>

          <div>
            <label for="cv_estado">Estado</label>
            <select id="cv_estado">
              <option value="activo">activo</option>
              <option value="inactivo">inactivo</option>
            </select>
          </div>

          <div class="full-width">
            <label for="cv_descripcion">Perfil / experiencia</label>
            <textarea id="cv_descripcion" rows="5"></textarea>
          </div>

          <div>
            <label for="cv_prioridad">¿Prioritario?</label>
            <select id="cv_prioridad">
              <option value="true">Sí</option>
              <option value="false" selected>No</option>
            </select>
          </div>
        </div>

        <div class="top-actions" style="justify-content:flex-start; margin-top:16px;">
          <button type="submit">Guardar CV</button>
          <button type="button" id="cancelarCvBtn" class="secondary-btn">Cancelar</button>
        </div>
      </form>

      <div id="cvMsg" class="message"></div>
    </div>
  `;
}

export async function renderBolsaView(
  mostrarFormularioOferta = false,
  modoOferta = 'nuevo',
  ofertaEditar = null,
  mostrarFormularioCv = false
) {
  setView('Bolsa de Trabajo', '<p class="loading">Cargando datos...</p>');

  const { data: ofertas, error: errorOfertas } = await supabase
    .from('ofertas_empleo')
    .select('*')
    .order('prioridad', { ascending: false })
    .order('created_at', { ascending: false });

  if (errorOfertas) {
    setView('Bolsa de Trabajo', `<p class="error">Error al cargar ofertas: ${errorOfertas.message}</p>`);
    return;
  }

  const { data: cvs, error: errorCvs } = await supabase
    .from('cvs')
    .select('*')
    .order('prioridad', { ascending: false })
    .order('created_at', { ascending: false });

  if (errorCvs) {
    setView('Bolsa de Trabajo', `<p class="error">Error al cargar CV: ${errorCvs.message}</p>`);
    return;
  }

  const ofertaFormHTML = mostrarFormularioOferta ? getOfertaFormHTML(modoOferta, ofertaEditar || {}) : '';
  const cvFormHTML = mostrarFormularioCv ? getCvFormHTML() : '';

  const rowsOfertas = (ofertas || []).map(item => `
    <tr>
      <td>${item.id}</td>
      <td>${item.titulo || ''}</td>
      <td>${item.descripcion || ''}</td>
      <td>${item.prioridad ? 'Sí' : 'No'}</td>
      <td>${item.estado || ''}</td>
      <td>${item.created_at ? new Date(item.created_at).toLocaleString('es-ES') : ''}</td>
      <td>
        <div class="table-actions">
          <button class="secondary-btn editarOfertaBtn" data-id="${item.id}">Editar</button>
          <button class="secondary-btn toggleEstadoBtn" data-id="${item.id}" data-estado="${item.estado}">
            ${item.estado === 'cerrada' ? 'Reabrir' : 'Cerrar'}
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  const rowsCvs = (cvs || []).map(item => `
    <tr>
      <td>${item.id}</td>
      <td>${item.nombre || ''}</td>
      <td>${item.telefono || ''}</td>
      <td>${item.email || ''}</td>
      <td>${item.descripcion || ''}</td>
      <td>${item.prioridad ? 'Sí' : 'No'}</td>
      <td>${item.estado || ''}</td>
      <td>${item.created_at ? new Date(item.created_at).toLocaleString('es-ES') : ''}</td>
    </tr>
  `).join('');

  setView('Bolsa de Trabajo', `
    <div class="asociado-header">
      <div>
        <p style="margin:0;">Bolsa de Trabajo v1. Ofertas y Currículum Vitae en un mismo espacio.</p>
      </div>
      <div class="table-actions">
        <button id="nuevaOfertaBtn">➕ Nueva oferta</button>
        <button id="nuevoCvBtn" class="secondary-btn">📄 Nuevo CV</button>
      </div>
    </div>

    ${ofertaFormHTML}
    ${cvFormHTML}

    <div class="form-card">
      <h3>Ofertas de empleo</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Descripción</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${rowsOfertas || '<tr><td colspan="7">No hay ofertas registradas todavía.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>

    <div class="form-card">
      <h3>Currículum Vitae</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Perfil</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Fecha</th>
            </tr>
          </thead>
          <tbody>
            ${rowsCvs || '<tr><td colspan="8">No hay CV registrados todavía.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `);

  const nuevaOfertaBtn = document.getElementById('nuevaOfertaBtn');
  if (nuevaOfertaBtn) {
    nuevaOfertaBtn.addEventListener('click', async () => {
      await renderBolsaView(true, 'nuevo', null, false);
    });
  }

  const nuevoCvBtn = document.getElementById('nuevoCvBtn');
  if (nuevoCvBtn) {
    nuevoCvBtn.addEventListener('click', async () => {
      await renderBolsaView(false, 'nuevo', null, true);
    });
  }

  const cancelarOfertaBtn = document.getElementById('cancelarOfertaBtn');
  if (cancelarOfertaBtn) {
    cancelarOfertaBtn.addEventListener('click', async () => {
      await renderBolsaView(false, 'nuevo', null, false);
    });
  }

  const cancelarCvBtn = document.getElementById('cancelarCvBtn');
  if (cancelarCvBtn) {
    cancelarCvBtn.addEventListener('click', async () => {
      await renderBolsaView(false, 'nuevo', null, false);
    });
  }

  const ofertaForm = document.getElementById('ofertaForm');
  if (ofertaForm) {
    ofertaForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const msg = document.getElementById('ofertaMsg');
      msg.textContent = modoOferta === 'editar' ? 'Guardando cambios...' : 'Guardando oferta...';
      msg.className = 'message';

      const payload = {
        titulo: document.getElementById('oferta_titulo').value.trim(),
        descripcion: document.getElementById('oferta_descripcion').value.trim() || null,
        prioridad: document.getElementById('oferta_prioridad').value === 'true',
        estado: document.getElementById('oferta_estado').value
      };

      let response;

      if (modoOferta === 'editar' && ofertaEditar?.id) {
        response = await supabase
          .from('ofertas_empleo')
          .update(payload)
          .eq('id', ofertaEditar.id);
      } else {
        response = await supabase
          .from('ofertas_empleo')
          .insert([payload]);
      }

      if (response.error) {
        msg.textContent = 'Error al guardar: ' + response.error.message;
        msg.className = 'message error';
        return;
      }

      msg.textContent = modoOferta === 'editar'
        ? 'Oferta actualizada correctamente'
        : 'Oferta guardada correctamente';
      msg.className = 'message success';

      setTimeout(async () => {
        await renderBolsaView(false, 'nuevo', null, false);
      }, 600);
    });
  }

  const cvForm = document.getElementById('cvForm');
  if (cvForm) {
    cvForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const msg = document.getElementById('cvMsg');
      msg.textContent = 'Guardando CV...';
      msg.className = 'message';

      const payload = {
        nombre: document.getElementById('cv_nombre').value.trim(),
        telefono: document.getElementById('cv_telefono').value.trim() || null,
        email: document.getElementById('cv_email').value.trim() || null,
        descripcion: document.getElementById('cv_descripcion').value.trim() || null,
        prioridad: document.getElementById('cv_prioridad').value === 'true',
        estado: document.getElementById('cv_estado').value
      };

      const { error: insertError } = await supabase
        .from('cvs')
        .insert([payload]);

      if (insertError) {
        msg.textContent = 'Error al guardar CV: ' + insertError.message;
        msg.className = 'message error';
        return;
      }

      msg.textContent = 'CV guardado correctamente';
      msg.className = 'message success';

      setTimeout(async () => {
        await renderBolsaView(false, 'nuevo', null, false);
      }, 600);
    });
  }

  const editarBtns = document.querySelectorAll('.editarOfertaBtn');
  editarBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const oferta = (ofertas || []).find(item => item.id === id);
      if (!oferta) return;
      await renderBolsaView(true, 'editar', oferta, false);
    });
  });

  const toggleEstadoBtns = document.querySelectorAll('.toggleEstadoBtn');
  toggleEstadoBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const estadoActual = btn.dataset.estado;
      const nuevoEstado = estadoActual === 'cerrada' ? 'activa' : 'cerrada';

      const { error: updateError } = await supabase
        .from('ofertas_empleo')
        .update({ estado: nuevoEstado })
        .eq('id', id);

      if (updateError) {
        alert('Error al cambiar estado: ' + updateError.message);
        return;
      }

      await renderBolsaView(false, 'nuevo', null, false);
    });
  });
}

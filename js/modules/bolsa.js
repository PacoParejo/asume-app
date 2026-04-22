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

export async function renderBolsaView(mostrarFormulario = false, modo = 'nuevo', ofertaEditar = null) {
  setView('Bolsa de Trabajo', '<p class="loading">Cargando ofertas...</p>');

  const { data, error } = await supabase
    .from('ofertas_empleo')
    .select('*')
    .order('prioridad', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    setView('Bolsa de Trabajo', `<p class="error">Error al cargar ofertas: ${error.message}</p>`);
    return;
  }

  const formHTML = mostrarFormulario ? getOfertaFormHTML(modo, ofertaEditar || {}) : '';

  const rows = (data || []).map(item => `
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

  setView('Bolsa de Trabajo', `
    <div class="asociado-header">
      <div>
        <p style="margin:0;">Listado de ofertas laborales. En futuras versiones priorizaremos visualmente las creadas por asociados.</p>
      </div>
      <div class="table-actions">
        <button id="nuevaOfertaBtn">➕ Nueva oferta</button>
      </div>
    </div>

    ${formHTML}

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
          ${rows || '<tr><td colspan="7">No hay ofertas registradas todavía.</td></tr>'}
        </tbody>
      </table>
    </div>
  `);

  const nuevaOfertaBtn = document.getElementById('nuevaOfertaBtn');
  if (nuevaOfertaBtn) {
    nuevaOfertaBtn.addEventListener('click', async () => {
      await renderBolsaView(true, 'nuevo', null);
    });
  }

  const cancelarOfertaBtn = document.getElementById('cancelarOfertaBtn');
  if (cancelarOfertaBtn) {
    cancelarOfertaBtn.addEventListener('click', async () => {
      await renderBolsaView(false, 'nuevo', null);
    });
  }

  const ofertaForm = document.getElementById('ofertaForm');
  if (ofertaForm) {
    ofertaForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const msg = document.getElementById('ofertaMsg');
      msg.textContent = modo === 'editar' ? 'Guardando cambios...' : 'Guardando oferta...';
      msg.className = 'message';

      const payload = {
        titulo: document.getElementById('oferta_titulo').value.trim(),
        descripcion: document.getElementById('oferta_descripcion').value.trim() || null,
        prioridad: document.getElementById('oferta_prioridad').value === 'true',
        estado: document.getElementById('oferta_estado').value
      };

      let response;

      if (modo === 'editar' && ofertaEditar?.id) {
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

      msg.textContent = modo === 'editar'
        ? 'Oferta actualizada correctamente'
        : 'Oferta guardada correctamente';
      msg.className = 'message success';

      setTimeout(async () => {
        await renderBolsaView(false, 'nuevo', null);
      }, 600);
    });
  }

  const editarBtns = document.querySelectorAll('.editarOfertaBtn');
  editarBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const oferta = (data || []).find(item => item.id === id);
      if (!oferta) return;
      await renderBolsaView(true, 'editar', oferta);
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

      await renderBolsaView(false, 'nuevo', null);
    });
  });
}

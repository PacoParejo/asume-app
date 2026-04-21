import { supabase } from '../supabase.js';

function setView(title, html) {
  const viewTitle = document.getElementById('viewTitle');
  const viewContent = document.getElementById('viewContent');

  if (viewTitle) viewTitle.textContent = title;
  if (viewContent) viewContent.innerHTML = html;
}

function getNuevaOfertaFormHTML() {
  return `
    <div class="form-card">
      <h3>Nueva oferta de empleo</h3>
      <form id="nuevaOfertaForm">
        <div class="form-grid">
          <div>
            <label for="oferta_titulo">Título</label>
            <input type="text" id="oferta_titulo" required />
          </div>

          <div>
            <label for="oferta_estado">Estado</label>
            <select id="oferta_estado">
              <option value="activa">activa</option>
              <option value="cerrada">cerrada</option>
            </select>
          </div>

          <div class="full-width">
            <label for="oferta_descripcion">Descripción</label>
            <textarea id="oferta_descripcion" rows="5"></textarea>
          </div>

          <div>
            <label for="oferta_prioridad">¿Prioritaria?</label>
            <select id="oferta_prioridad">
              <option value="true">Sí</option>
              <option value="false" selected>No</option>
            </select>
          </div>
        </div>

        <div class="top-actions" style="justify-content:flex-start; margin-top:16px;">
          <button type="submit">Guardar oferta</button>
          <button type="button" id="cancelarOfertaBtn" class="secondary-btn">Cancelar</button>
        </div>
      </form>

      <div id="nuevaOfertaMsg" class="message"></div>
    </div>
  `;
}

export async function renderBolsaView(mostrarFormulario = false) {
  setView('Bolsa de Trabajo', '<p class="loading">Cargando ofertas...</p>');

  const { data, error } = await supabase
    .from('ofertas_empleo')
    .select('*')
    .order('created_at', { ascending: false });

  if (error) {
    setView('Bolsa de Trabajo', `<p class="error">Error al cargar ofertas: ${error.message}</p>`);
    return;
  }

  const formHTML = mostrarFormulario ? getNuevaOfertaFormHTML() : '';

  const rows = (data || []).map(item => `
    <tr>
      <td>${item.id}</td>
      <td>${item.titulo || ''}</td>
      <td>${item.descripcion || ''}</td>
      <td>${item.prioridad ? 'Sí' : 'No'}</td>
      <td>${item.estado || ''}</td>
      <td>${item.created_at ? new Date(item.created_at).toLocaleString('es-ES') : ''}</td>
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
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="6">No hay ofertas registradas todavía.</td></tr>'}
        </tbody>
      </table>
    </div>
  `);

  const nuevaOfertaBtn = document.getElementById('nuevaOfertaBtn');
  if (nuevaOfertaBtn) {
    nuevaOfertaBtn.addEventListener('click', async () => {
      await renderBolsaView(true);
    });
  }

  const cancelarOfertaBtn = document.getElementById('cancelarOfertaBtn');
  if (cancelarOfertaBtn) {
    cancelarOfertaBtn.addEventListener('click', async () => {
      await renderBolsaView(false);
    });
  }

  const nuevaOfertaForm = document.getElementById('nuevaOfertaForm');
  if (nuevaOfertaForm) {
    nuevaOfertaForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const msg = document.getElementById('nuevaOfertaMsg');
      msg.textContent = 'Guardando oferta...';
      msg.className = 'message';

      const payload = {
        titulo: document.getElementById('oferta_titulo').value.trim(),
        descripcion: document.getElementById('oferta_descripcion').value.trim() || null,
        prioridad: document.getElementById('oferta_prioridad').value === 'true',
        estado: document.getElementById('oferta_estado').value
      };

      const { error: insertError } = await supabase
        .from('ofertas_empleo')
        .insert([payload]);

      if (insertError) {
        msg.textContent = 'Error al guardar: ' + insertError.message;
        msg.className = 'message error';
        return;
      }

      msg.textContent = 'Oferta guardada correctamente';
      msg.className = 'message success';

      setTimeout(async () => {
        await renderBolsaView(false);
      }, 600);
    });
  }
}

import { supabase } from '../supabase.js';

function setView(title, html) {
  const viewTitle = document.getElementById('viewTitle');
  const viewContent = document.getElementById('viewContent');

  if (viewTitle) viewTitle.textContent = title;
  if (viewContent) viewContent.innerHTML = html;
}

// ===============================
// FORMULARIOS
// ===============================

function getNuevaOfertaFormHTML() {
  return `
    <div class="form-card">
      <h3>Nueva oferta de empleo</h3>
      <form id="ofertaForm">
        <input type="hidden" id="oferta_id" />

        <div class="form-grid">
          <div>
            <label>Título</label>
            <input type="text" id="oferta_titulo" required />
          </div>

          <div>
            <label>Empresa</label>
            <input type="text" id="oferta_empresa" />
          </div>

          <div class="full-width">
            <label>Trabajo a realizar</label>
            <textarea id="oferta_trabajo"></textarea>
          </div>

          <div class="full-width">
            <label>Perfil buscado</label>
            <textarea id="oferta_perfil"></textarea>
          </div>

          <div class="full-width">
            <label>Condiciones</label>
            <textarea id="oferta_condiciones"></textarea>
          </div>

          <div>
            <label>Inicio</label>
            <input type="date" id="oferta_inicio" />
          </div>

          <div>
            <label>Fin</label>
            <input type="date" id="oferta_fin" />
          </div>

          <div>
            <label>Estado</label>
            <select id="oferta_estado">
              <option value="activa">activa</option>
              <option value="cerrada">cerrada</option>
            </select>
          </div>

          <div>
            <label>¿Prioritaria?</label>
            <select id="oferta_prioridad">
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        <div class="top-actions">
          <button type="submit">Guardar oferta</button>
          <button type="button" id="cancelarOfertaBtn">Cancelar</button>
        </div>
      </form>

      <div id="ofertaMsg" class="message"></div>
    </div>
  `;
}

function getNuevoCVFormHTML() {
  return `
    <div class="form-card">
      <h3>Nuevo Currículum Vitae</h3>
      <form id="cvForm">

        <div class="form-grid">
          <div>
            <label>Nombre</label>
            <input type="text" id="cv_nombre" required />
          </div>

          <div>
            <label>Email</label>
            <input type="email" id="cv_email" required />
          </div>

          <div>
            <label>Teléfono</label>
            <input type="text" id="cv_telefono" />
          </div>

          <div>
            <label>Población</label>
            <input type="text" id="cv_poblacion" />
          </div>

          <div class="full-width">
            <label>Carta de presentación</label>
            <textarea id="cv_carta"></textarea>
          </div>

          <div>
            <label>Estado</label>
            <select id="cv_estado">
              <option value="activo">activo</option>
              <option value="inactivo">inactivo</option>
            </select>
          </div>

          <div>
            <label>¿Prioritario?</label>
            <select id="cv_prioridad">
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        <div class="top-actions">
          <button type="submit">Guardar CV</button>
          <button type="button" id="cancelarCVBtn">Cancelar</button>
        </div>

      </form>

      <div id="cvMsg" class="message"></div>
    </div>
  `;
}

// ===============================
// RENDER PRINCIPAL
// ===============================

export async function renderBolsaView(
  mostrarFormOferta = false,
  mostrarFormCV = false
) {
  setView('Bolsa de Trabajo', '<p>Cargando...</p>');

  const { data: ofertas } = await supabase
    .from('ofertas_empleo')
    .select('*')
    .order('created_at', { ascending: false });

  const { data: cvs } = await supabase
    .from('cvs')
    .select('*')
    .order('created_at', { ascending: false });

  const ofertaRows = (ofertas || []).map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${o.titulo || ''}</td>
      <td>${o.empresa || ''}</td>
      <td>${o.prioridad ? 'Sí' : 'No'}</td>
      <td>${o.estado}</td>
      <td>${new Date(o.created_at).toLocaleString()}</td>
      <td>
        <button onclick="editarOferta(${o.id})">Editar</button>
      </td>
    </tr>
  `).join('');

  const cvRows = (cvs || []).map(c => `
    <tr>
      <td>${c.id}</td>
      <td>${c.nombre}</td>
      <td>${c.telefono || ''}</td>
      <td>${c.email}</td>
      <td>${c.prioridad ? 'Sí' : 'No'}</td>
      <td>${c.estado}</td>
      <td>${new Date(c.created_at).toLocaleString()}</td>
    </tr>
  `).join('');

  setView('Bolsa de Trabajo', `
    <div class="asociado-header">
      <div>
        Bolsa de Trabajo v1
      </div>
      <div class="table-actions">
        <button id="nuevaOfertaBtn">➕ Nueva oferta</button>
        <button id="nuevoCVBtn">📄 Nuevo CV</button>
      </div>
    </div>

    ${mostrarFormOferta ? getNuevaOfertaFormHTML() : ''}
    ${mostrarFormCV ? getNuevoCVFormHTML() : ''}

    <div class="form-card">
      <h3>Ofertas</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Título</th>
            <th>Empresa</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th>Fecha</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${ofertaRows || '<tr><td colspan="7">Sin ofertas</td></tr>'}
        </tbody>
      </table>
    </div>

    <div class="form-card">
      <h3>Currículum Vitae</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Nombre</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Prioridad</th>
            <th>Estado</th>
            <th>Fecha</th>
          </tr>
        </thead>
        <tbody>
          ${cvRows || '<tr><td colspan="7">Sin CV</td></tr>'}
        </tbody>
      </table>
    </div>
  `);

  // BOTONES
  document.getElementById('nuevaOfertaBtn')?.addEventListener('click', () => {
    renderBolsaView(true, false);
  });

  document.getElementById('nuevoCVBtn')?.addEventListener('click', () => {
    renderBolsaView(false, true);
  });

  document.getElementById('cancelarOfertaBtn')?.addEventListener('click', () => {
    renderBolsaView(false, false);
  });

  document.getElementById('cancelarCVBtn')?.addEventListener('click', () => {
    renderBolsaView(false, false);
  });

  // ===============================
  // GUARDAR OFERTA
  // ===============================

  document.getElementById('ofertaForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      titulo: document.getElementById('oferta_titulo').value,
      empresa: document.getElementById('oferta_empresa').value,
      trabajo: document.getElementById('oferta_trabajo').value,
      perfil: document.getElementById('oferta_perfil').value,
      condiciones: document.getElementById('oferta_condiciones').value,
      inicio: document.getElementById('oferta_inicio').value,
      fin: document.getElementById('oferta_fin').value,
      estado: document.getElementById('oferta_estado').value,
      prioridad: document.getElementById('oferta_prioridad').value === 'true'
    };

    await supabase.from('ofertas_empleo').insert([payload]);

    renderBolsaView(false, false);
  });

  // ===============================
  // GUARDAR CV
  // ===============================

  document.getElementById('cvForm')?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const payload = {
      nombre: document.getElementById('cv_nombre').value,
      email: document.getElementById('cv_email').value,
      telefono: document.getElementById('cv_telefono').value,
      poblacion: document.getElementById('cv_poblacion').value,
      carta_presentacion: document.getElementById('cv_carta').value,
      estado: document.getElementById('cv_estado').value,
      prioridad: document.getElementById('cv_prioridad').value === 'true'
    };

    await supabase.from('cvs').insert([payload]);

    renderBolsaView(false, false);
  });
}

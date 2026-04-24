import { supabase } from '../supabase.js';

function setView(title, html) {
  const viewTitle = document.getElementById('viewTitle');
  const viewContent = document.getElementById('viewContent');

  if (viewTitle) viewTitle.textContent = title;
  if (viewContent) viewContent.innerHTML = html;
}

function limpiarLista(lista = []) {
  return (lista || []).filter(item =>
    Object.values(item || {}).some(valor => valor && valor.toString().trim() !== '')
  );
}

function getNuevoCVFormHTML() {
  return `
    <div class="form-card">
      <h3>Nuevo Currículum Vitae</h3>

      <form id="nuevoCVForm">
        <div class="form-grid">
          <div>
            <label>Nombre *</label>
            <input type="text" id="cv_nombre" required />
          </div>

          <div>
            <label>Email *</label>
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
            <textarea id="cv_carta" rows="4"></textarea>
          </div>

          <div>
            <label>¿Prioritario?</label>
            <select id="cv_prioridad">
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>
          </div>
        </div>

        <h4>Experiencia (hasta 3)</h4>
        ${[1,2,3].map(i => `
          <div class="form-grid">
            <div><label>Empresa ${i}</label><input type="text" id="exp_empresa_${i}" /></div>
            <div><label>Puesto</label><input type="text" id="exp_puesto_${i}" /></div>
            <div><label>Inicio</label><input type="date" id="exp_inicio_${i}" /></div>
            <div><label>Fin</label><input type="date" id="exp_fin_${i}" /></div>
          </div>
        `).join('')}

        <h4>Estudios (hasta 3)</h4>
        ${[1,2,3].map(i => `
          <div class="form-grid">
            <div><label>Título ${i}</label><input type="text" id="est_titulo_${i}" /></div>
            <div><label>Centro</label><input type="text" id="est_centro_${i}" /></div>
            <div><label>Inicio</label><input type="date" id="est_inicio_${i}" /></div>
            <div><label>Fin</label><input type="date" id="est_fin_${i}" /></div>
          </div>
        `).join('')}

        <div class="top-actions" style="margin-top:16px;">
          <button type="submit">Guardar CV</button>
          <button type="button" id="cancelarCVBtn" class="secondary-btn">Cancelar</button>
        </div>
      </form>

      <div id="nuevoCVMsg" class="message"></div>
    </div>
  `;
}

function getListadoCVHTML(cvs = []) {
  const rows = (cvs || []).map(cv => `
    <tr>
      <td>${cv.id}</td>
      <td>${cv.nombre || ''}</td>
      <td>${cv.email || ''}</td>
      <td>${cv.telefono || ''}</td>
      <td>${cv.poblacion || ''}</td>
      <td>${cv.prioridad ? 'Sí' : 'No'}</td>
      <td>${cv.estado || ''}</td>
      <td>
        <button class="secondary-btn verCVBtn" data-id="${cv.id}">Ver CV</button>
      </td>
    </tr>
  `).join('');

  return `
    <div class="form-card">
      <h3>Currículum Vitae registrados</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Nombre</th>
              <th>Email</th>
              <th>Teléfono</th>
              <th>Población</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="8">No hay CV registrados todavía.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function getFichaCVHTML(cv) {
  const experiencia = limpiarLista(cv.experiencia || []);
  const estudios = limpiarLista(cv.estudios || []);

  const experienciaHTML = experiencia.map(item => `
    <li>
      <strong>${item.puesto || 'Puesto no indicado'}</strong>
      ${item.empresa ? ` en ${item.empresa}` : ''}
      <br>
      ${item.inicio || '-'} / ${item.fin || '-'}
    </li>
  `).join('');

  const estudiosHTML = estudios.map(item => `
    <li>
      <strong>${item.titulo || 'Título no indicado'}</strong>
      ${item.centro ? ` - ${item.centro}` : ''}
      <br>
      ${item.inicio || '-'} / ${item.fin || '-'}
    </li>
  `).join('');

  return `
    <div class="form-card">
      <h2>${cv.nombre || 'CV sin nombre'}</h2>

      <p><strong>Email:</strong> ${cv.email || '-'}</p>
      <p><strong>Teléfono:</strong> ${cv.telefono || '-'}</p>
      <p><strong>Población:</strong> ${cv.poblacion || '-'}</p>
      <p><strong>Prioritario:</strong> ${cv.prioridad ? 'Sí' : 'No'}</p>
      <p><strong>Estado:</strong> ${cv.estado || '-'}</p>

      <h3>Carta de presentación</h3>
      <p>${cv.carta_presentacion || 'Sin carta de presentación.'}</p>

      <h3>Experiencia</h3>
      <ul>${experienciaHTML || '<li>Sin experiencia registrada</li>'}</ul>

      <h3>Estudios</h3>
      <ul>${estudiosHTML || '<li>Sin estudios registrados</li>'}</ul>

      <div class="top-actions" style="margin-top:16px;">
        <button id="volverBolsaBtn" class="secondary-btn">⬅ Volver</button>
      </div>
    </div>
  `;
}

export async function renderBolsaView(mostrarCV = false) {
  setView('Bolsa de Trabajo', '<p class="loading">Cargando Bolsa de Trabajo...</p>');

  const { data: cvs, error } = await supabase
    .from('cvs')
    .select('*')
    .order('prioridad', { ascending: false })
    .order('created_at', { ascending: false });

  if (error) {
    setView('Bolsa de Trabajo', `<p class="error">Error al cargar CV: ${error.message}</p>`);
    return;
  }

  const formHTML = mostrarCV ? getNuevoCVFormHTML() : '';
  const listadoHTML = getListadoCVHTML(cvs || []);

  setView('Bolsa de Trabajo', `
    <div class="asociado-header">
      <div>
        <p>Bolsa de Trabajo v1</p>
      </div>
      <div class="table-actions">
        <button id="nuevoCVBtn">📄 Nuevo CV</button>
      </div>
    </div>

    ${formHTML}
    ${listadoHTML}
  `);

  const nuevoCVBtn = document.getElementById('nuevoCVBtn');
  if (nuevoCVBtn) {
    nuevoCVBtn.onclick = () => renderBolsaView(true);
  }

  const cancelarCVBtn = document.getElementById('cancelarCVBtn');
  if (cancelarCVBtn) {
    cancelarCVBtn.onclick = () => renderBolsaView(false);
  }

  const verCVBtns = document.querySelectorAll('.verCVBtn');
  verCVBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      await renderFichaCV(id);
    });
  });

  const form = document.getElementById('nuevoCVForm');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();

      const msg = document.getElementById('nuevoCVMsg');
      msg.textContent = 'Guardando CV...';
      msg.className = 'message';

      const experiencia = limpiarLista([1,2,3].map(i => ({
        empresa: document.getElementById(`exp_empresa_${i}`).value.trim(),
        puesto: document.getElementById(`exp_puesto_${i}`).value.trim(),
        inicio: document.getElementById(`exp_inicio_${i}`).value,
        fin: document.getElementById(`exp_fin_${i}`).value
      })));

      const estudios = limpiarLista([1,2,3].map(i => ({
        titulo: document.getElementById(`est_titulo_${i}`).value.trim(),
        centro: document.getElementById(`est_centro_${i}`).value.trim(),
        inicio: document.getElementById(`est_inicio_${i}`).value,
        fin: document.getElementById(`est_fin_${i}`).value
      })));

      const payload = {
        nombre: document.getElementById('cv_nombre').value.trim(),
        email: document.getElementById('cv_email').value.trim(),
        telefono: document.getElementById('cv_telefono').value.trim() || null,
        poblacion: document.getElementById('cv_poblacion').value.trim() || null,
        carta_presentacion: document.getElementById('cv_carta').value.trim() || null,
        prioridad: document.getElementById('cv_prioridad').value === 'true',
        experiencia,
        estudios,
        estado: 'activo'
      };

      const { error } = await supabase.from('cvs').insert([payload]);

      if (error) {
        msg.textContent = 'Error al guardar CV: ' + error.message;
        msg.className = 'message error';
        return;
      }

      msg.textContent = 'CV guardado correctamente';
      msg.className = 'message success';

      setTimeout(() => renderBolsaView(false), 600);
    };
  }
}

async function renderFichaCV(id) {
  setView('Ficha CV', '<p class="loading">Cargando CV...</p>');

  const { data: cv, error } = await supabase
    .from('cvs')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    setView('Ficha CV', `<p class="error">Error al cargar CV: ${error.message}</p>`);
    return;
  }

  setView('Ficha CV', getFichaCVHTML(cv));

  const volverBtn = document.getElementById('volverBolsaBtn');
  if (volverBtn) {
    volverBtn.addEventListener('click', async () => {
      await renderBolsaView(false);
    });
  }
}

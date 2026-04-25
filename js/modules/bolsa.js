import { supabase } from '../supabase.js';

function setView(title, html) {
  const viewTitle = document.getElementById('viewTitle');
  const viewContent = document.getElementById('viewContent');

  if (viewTitle) viewTitle.textContent = title;
  if (viewContent) viewContent.innerHTML = html;
}

function safe(value) {
  return value || '';
}

function limpiarLista(lista = []) {
  return (lista || []).filter(item =>
    Object.values(item || {}).some(valor => valor && valor.toString().trim() !== '')
  );
}

function getOfertaFormHTML(modo = 'nuevo', oferta = {}) {
  const esEditar = modo === 'editar';

  return `
    <div class="form-card">
      <h3>${esEditar ? 'Editar oferta' : 'Nueva oferta'}</h3>

      <form id="ofertaForm">
        <div class="form-grid">
          <div>
            <label>Título *</label>
            <input type="text" id="oferta_titulo" value="${safe(oferta.titulo)}" required />
          </div>

          <div>
            <label>Estado</label>
            <select id="oferta_estado">
              <option value="activa" ${oferta.estado === 'activa' ? 'selected' : ''}>activa</option>
              <option value="cerrada" ${oferta.estado === 'cerrada' ? 'selected' : ''}>cerrada</option>
            </select>
          </div>

          <div>
            <label>Empresa que busca trabajador</label>
            <input type="text" id="oferta_empresa_busca" value="${safe(oferta.empresa_busca)}" />
          </div>

          <div>
            <label>Trabajo a realizar</label>
            <input type="text" id="oferta_trabajo_realizar" value="${safe(oferta.trabajo_realizar)}" />
          </div>

          <div class="full-width">
            <label>Perfil que se busca</label>
            <textarea id="oferta_perfil_busca" rows="3">${safe(oferta.perfil_busca)}</textarea>
          </div>

          <div class="full-width">
            <label>Condiciones generales</label>
            <textarea id="oferta_condiciones" rows="3">${safe(oferta.condiciones)}</textarea>
          </div>

          <div>
            <label>Horario</label>
            <input type="text" id="oferta_horario" value="${safe(oferta.horario)}" />
          </div>

          <div>
            <label>Días</label>
            <input type="text" id="oferta_dias" value="${safe(oferta.dias)}" />
          </div>

          <div>
            <label>Sueldo</label>
            <input type="text" id="oferta_sueldo" value="${safe(oferta.sueldo)}" />
          </div>

          <div>
            <label>Fecha inicio</label>
            <input type="text" id="oferta_fecha_inicio" value="${safe(oferta.fecha_inicio)}" placeholder="dd/mm/aaaa" />
          </div>

          <div>
            <label>Fecha fin</label>
            <input type="text" id="oferta_fecha_fin" value="${safe(oferta.fecha_fin)}" placeholder="dd/mm/aaaa" />
          </div>

          <div>
            <label>¿Prioritaria?</label>
            <select id="oferta_prioridad">
              <option value="false" ${!oferta.prioridad ? 'selected' : ''}>No</option>
              <option value="true" ${oferta.prioridad ? 'selected' : ''}>Sí</option>
            </select>
          </div>

          <div class="full-width">
            <label>Descripción adicional</label>
            <textarea id="oferta_descripcion" rows="3">${safe(oferta.descripcion)}</textarea>
          </div>
        </div>

        <div class="top-actions" style="margin-top:16px;">
          <button type="submit">${esEditar ? 'Guardar cambios' : 'Guardar oferta'}</button>
          <button type="button" id="cancelarOfertaBtn" class="secondary-btn">Cancelar</button>
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

function getListadoOfertasHTML(ofertas = []) {
  const rows = (ofertas || []).map(oferta => `
    <tr>
      <td>${oferta.id}</td>
      <td>${oferta.titulo || ''}</td>
      <td>${oferta.empresa_busca || ''}</td>
      <td>${oferta.trabajo_realizar || ''}</td>
      <td>${oferta.horario || ''}</td>
      <td>${oferta.sueldo || ''}</td>
      <td>${oferta.prioridad ? 'Sí' : 'No'}</td>
      <td>${oferta.estado || ''}</td>
      <td>
        <div class="table-actions">
          <button class="secondary-btn editarOfertaBtn" data-id="${oferta.id}">Editar</button>
          <button class="secondary-btn toggleOfertaBtn" data-id="${oferta.id}" data-estado="${oferta.estado}">
            ${oferta.estado === 'cerrada' ? 'Reabrir' : 'Cerrar'}
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  return `
    <div class="form-card">
      <h3>Ofertas de empleo</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Título</th>
              <th>Empresa</th>
              <th>Trabajo</th>
              <th>Horario</th>
              <th>Sueldo</th>
              <th>Prioridad</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="9">No hay ofertas registradas todavía.</td></tr>'}
          </tbody>
        </table>
      </div>
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
      <br>${item.inicio || '-'} / ${item.fin || '-'}
    </li>
  `).join('');

  const estudiosHTML = estudios.map(item => `
    <li>
      <strong>${item.titulo || 'Título no indicado'}</strong>
      ${item.centro ? ` - ${item.centro}` : ''}
      <br>${item.inicio || '-'} / ${item.fin || '-'}
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

export async function renderBolsaView(mostrarOferta = false, modoOferta = 'nuevo', ofertaEditar = null, mostrarCV = false) {
  setView('Bolsa de Trabajo', '<p class="loading">Cargando Bolsa de Trabajo...</p>');

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

  const ofertaFormHTML = mostrarOferta ? getOfertaFormHTML(modoOferta, ofertaEditar || {}) : '';
  const cvFormHTML = mostrarCV ? getNuevoCVFormHTML() : '';

  setView('Bolsa de Trabajo', `
    <div class="asociado-header">
      <div>
        <p>Bolsa de Trabajo v1</p>
      </div>
      <div class="table-actions">
        <button id="nuevaOfertaBtn">➕ Nueva oferta</button>
        <button id="nuevoCVBtn" class="secondary-btn">📄 Nuevo CV</button>
      </div>
    </div>

    ${ofertaFormHTML}
    ${cvFormHTML}
    ${getListadoOfertasHTML(ofertas || [])}
    ${getListadoCVHTML(cvs || [])}
  `);

  document.getElementById('nuevaOfertaBtn')?.addEventListener('click', () => {
    renderBolsaView(true, 'nuevo', null, false);
  });

  document.getElementById('nuevoCVBtn')?.addEventListener('click', () => {
    renderBolsaView(false, 'nuevo', null, true);
  });

  document.getElementById('cancelarOfertaBtn')?.addEventListener('click', () => {
    renderBolsaView(false, 'nuevo', null, false);
  });

  document.getElementById('cancelarCVBtn')?.addEventListener('click', () => {
    renderBolsaView(false, 'nuevo', null, false);
  });

  const ofertaForm = document.getElementById('ofertaForm');
  if (ofertaForm) {
    ofertaForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const msg = document.getElementById('ofertaMsg');
      msg.textContent = modoOferta === 'editar' ? 'Guardando cambios...' : 'Guardando oferta...';
      msg.className = 'message';

      const payload = {
        titulo: document.getElementById('oferta_titulo').value.trim(),
        empresa_busca: document.getElementById('oferta_empresa_busca').value.trim() || null,
        trabajo_realizar: document.getElementById('oferta_trabajo_realizar').value.trim() || null,
        perfil_busca: document.getElementById('oferta_perfil_busca').value.trim() || null,
        condiciones: document.getElementById('oferta_condiciones').value.trim() || null,
        horario: document.getElementById('oferta_horario').value.trim() || null,
        dias: document.getElementById('oferta_dias').value.trim() || null,
        sueldo: document.getElementById('oferta_sueldo').value.trim() || null,
        fecha_inicio: document.getElementById('oferta_fecha_inicio').value.trim() || null,
        fecha_fin: document.getElementById('oferta_fecha_fin').value.trim() || null,
        descripcion: document.getElementById('oferta_descripcion').value.trim() || null,
        estado: document.getElementById('oferta_estado').value,
        prioridad: document.getElementById('oferta_prioridad').value === 'true'
      };

      const response = modoOferta === 'editar' && ofertaEditar?.id
        ? await supabase.from('ofertas_empleo').update(payload).eq('id', ofertaEditar.id)
        : await supabase.from('ofertas_empleo').insert([payload]);

      if (response.error) {
        msg.textContent = 'Error al guardar oferta: ' + response.error.message;
        msg.className = 'message error';
        return;
      }

      msg.textContent = 'Oferta guardada correctamente';
      msg.className = 'message success';

      setTimeout(() => renderBolsaView(false, 'nuevo', null, false), 600);
    });
  }

  const formCV = document.getElementById('nuevoCVForm');
  if (formCV) {
    formCV.onsubmit = async (e) => {
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

      setTimeout(() => renderBolsaView(false, 'nuevo', null, false), 600);
    };
  }

  document.querySelectorAll('.editarOfertaBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const oferta = (ofertas || []).find(item => item.id === id);
      renderBolsaView(true, 'editar', oferta, false);
    });
  });

  document.querySelectorAll('.toggleOfertaBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const estadoActual = btn.dataset.estado;
      const nuevoEstado = estadoActual === 'cerrada' ? 'activa' : 'cerrada';

      const { error } = await supabase
        .from('ofertas_empleo')
        .update({ estado: nuevoEstado })
        .eq('id', id);

      if (error) {
        alert('Error al cambiar estado: ' + error.message);
        return;
      }

      renderBolsaView(false, 'nuevo', null, false);
    });
  });

  document.querySelectorAll('.verCVBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      await renderFichaCV(id);
    });
  });
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

  document.getElementById('volverBolsaBtn')?.addEventListener('click', () => {
    renderBolsaView(false, 'nuevo', null, false);
  });
}

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

function getCVFormHTML(modo = 'nuevo', cv = {}) {
  const esEditar = modo === 'editar';
  const experiencia = cv.experiencia || [];
  const estudios = cv.estudios || [];

  function exp(i, campo) {
    return safe(experiencia[i - 1]?.[campo]);
  }

  function est(i, campo) {
    return safe(estudios[i - 1]?.[campo]);
  }

  return `
    <div class="form-card">
      <h3>${esEditar ? 'Editar Currículum Vitae' : 'Nuevo Currículum Vitae'}</h3>

      <form id="cvForm">
        <div class="form-grid">
          <div>
            <label>Nombre *</label>
            <input type="text" id="cv_nombre" value="${safe(cv.nombre)}" required />
          </div>

          <div>
            <label>Email *</label>
            <input type="email" id="cv_email" value="${safe(cv.email)}" required />
          </div>

          <div>
            <label>Teléfono</label>
            <input type="text" id="cv_telefono" value="${safe(cv.telefono)}" />
          </div>

          <div>
            <label>Población</label>
            <input type="text" id="cv_poblacion" value="${safe(cv.poblacion)}" />
          </div>

          <div class="full-width">
            <label>Carta de presentación</label>
            <textarea id="cv_carta" rows="4">${safe(cv.carta_presentacion)}</textarea>
          </div>

          <div>
            <label>Estado</label>
            <select id="cv_estado">
              <option value="activo" ${cv.estado === 'activo' ? 'selected' : ''}>activo</option>
              <option value="inactivo" ${cv.estado === 'inactivo' ? 'selected' : ''}>inactivo</option>
            </select>
          </div>

          <div>
            <label>¿Prioritario?</label>
            <select id="cv_prioridad">
              <option value="false" ${!cv.prioridad ? 'selected' : ''}>No</option>
              <option value="true" ${cv.prioridad ? 'selected' : ''}>Sí</option>
            </select>
          </div>
        </div>

        <h4>Experiencia (hasta 3)</h4>
        ${[1,2,3].map(i => `
          <div class="form-grid">
            <div><label>Empresa ${i}</label><input type="text" id="exp_empresa_${i}" value="${exp(i, 'empresa')}" /></div>
            <div><label>Puesto</label><input type="text" id="exp_puesto_${i}" value="${exp(i, 'puesto')}" /></div>
            <div><label>Inicio</label><input type="date" id="exp_inicio_${i}" value="${exp(i, 'inicio')}" /></div>
            <div><label>Fin</label><input type="date" id="exp_fin_${i}" value="${exp(i, 'fin')}" /></div>
          </div>
        `).join('')}

        <h4>Estudios (hasta 3)</h4>
        ${[1,2,3].map(i => `
          <div class="form-grid">
            <div><label>Título ${i}</label><input type="text" id="est_titulo_${i}" value="${est(i, 'titulo')}" /></div>
            <div><label>Centro</label><input type="text" id="est_centro_${i}" value="${est(i, 'centro')}" /></div>
            <div><label>Inicio</label><input type="date" id="est_inicio_${i}" value="${est(i, 'inicio')}" /></div>
            <div><label>Fin</label><input type="date" id="est_fin_${i}" value="${est(i, 'fin')}" /></div>
          </div>
        `).join('')}

        <div class="top-actions" style="margin-top:16px;">
          <button type="submit">${esEditar ? 'Guardar cambios' : 'Guardar CV'}</button>
          <button type="button" id="cancelarCVBtn" class="secondary-btn">Cancelar</button>
        </div>
      </form>

      <div id="cvMsg" class="message"></div>
    </div>
  `;
}

function getSolicitudFormHTML(oferta, cvs = []) {
  const opcionesCV = (cvs || []).map(cv => `
    <option value="${cv.id}">
      ${cv.nombre || 'Sin nombre'} ${cv.email ? `(${cv.email})` : ''}
    </option>
  `).join('');

  return `
    <div class="form-card">
      <h3>Solicitar empleo</h3>

      <p><strong>Oferta:</strong> ${oferta.titulo || ''}</p>
      <p><strong>Empresa:</strong> ${oferta.empresa_busca || '-'}</p>

      <form id="solicitudForm">
        <input type="hidden" id="sol_oferta_id" value="${oferta.id}" />

        <div class="form-grid">
          <div class="full-width">
            <label>Selecciona CV *</label>
            <select id="sol_cv_id" required>
              <option value="">Selecciona un CV</option>
              ${opcionesCV}
            </select>
          </div>

          <div class="full-width">
            <label>Mensaje opcional</label>
            <textarea id="sol_mensaje" rows="4"></textarea>
          </div>
        </div>

        <div class="top-actions" style="margin-top:16px;">
          <button type="submit">Enviar solicitud</button>
          <button type="button" id="cancelarSolicitudBtn" class="secondary-btn">Cancelar</button>
        </div>
      </form>

      <div id="solicitudMsg" class="message"></div>
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
          <button class="secondary-btn solicitarOfertaBtn" data-id="${oferta.id}">Solicitar</button>
          <button class="secondary-btn editarOfertaBtn" data-id="${oferta.id}">Editar</button>
          <button class="secondary-btn toggleOfertaBtn" data-id="${oferta.id}" data-estado="${oferta.estado}">
            ${oferta.estado === 'cerrada' ? 'Reabrir' : 'Cerrar'}
          </button>
          <button class="danger-btn eliminarOfertaBtn" data-id="${oferta.id}">Eliminar</button>
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
        <div class="table-actions">
          <button class="secondary-btn verCVBtn" data-id="${cv.id}">Ver CV</button>
          <button class="secondary-btn editarCVBtn" data-id="${cv.id}">Editar</button>
          <button class="secondary-btn toggleCVBtn" data-id="${cv.id}" data-estado="${cv.estado}">
            ${cv.estado === 'inactivo' ? 'Activar' : 'Desactivar'}
          </button>
          <button class="danger-btn eliminarCVBtn" data-id="${cv.id}">Eliminar</button>
        </div>
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

function getListadoSolicitudesHTML(solicitudes = []) {
  const rows = (solicitudes || []).map(sol => `
    <tr>
      <td>${sol.id}</td>
      <td>${sol.ofertas_empleo?.titulo || ''}</td>
      <td>${sol.cvs?.nombre || ''}</td>
      <td>${sol.cvs?.email || ''}</td>
      <td>${sol.estado || ''}</td>
      <td>${sol.mensaje || ''}</td>
      <td>${sol.created_at ? new Date(sol.created_at).toLocaleString('es-ES') : ''}</td>
      <td>
        <div class="table-actions">
          <button class="secondary-btn estadoSolicitudBtn" data-id="${sol.id}" data-estado="aceptada">Aceptar</button>
          <button class="secondary-btn estadoSolicitudBtn" data-id="${sol.id}" data-estado="rechazada">Rechazar</button>
          <button class="secondary-btn estadoSolicitudBtn" data-id="${sol.id}" data-estado="pendiente">Pendiente</button>
        </div>
      </td>
    </tr>
  `).join('');

  return `
    <div class="form-card">
      <h3>Solicitudes recibidas</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID</th>
              <th>Oferta</th>
              <th>Candidato</th>
              <th>Email</th>
              <th>Estado</th>
              <th>Mensaje</th>
              <th>Fecha</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="8">No hay solicitudes todavía.</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `;
}

function getPapeleraHTML(ofertas = [], cvs = []) {
  const rowsOfertas = (ofertas || []).map(oferta => `
    <tr>
      <td>OFERTA</td>
      <td>${oferta.titulo || ''}</td>
      <td>${oferta.empresa_busca || ''}</td>
      <td>${oferta.estado || ''}</td>
      <td>
        <button class="secondary-btn restaurarOfertaBtn" data-id="${oferta.id}">Restaurar</button>
      </td>
    </tr>
  `).join('');

  const rowsCV = (cvs || []).map(cv => `
    <tr>
      <td>CV</td>
      <td>${cv.nombre || ''}</td>
      <td>${cv.email || ''}</td>
      <td>${cv.estado || ''}</td>
      <td>
        <button class="secondary-btn restaurarCVBtn" data-id="${cv.id}">Restaurar</button>
      </td>
    </tr>
  `).join('');

  return `
    <div class="form-card">
      <h3>🧺 Papelera de Bolsa</h3>
      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>Tipo</th>
              <th>Nombre / título</th>
              <th>Empresa / email</th>
              <th>Estado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${rowsOfertas + rowsCV || '<tr><td colspan="5">La papelera está vacía.</td></tr>'}
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
        <button id="editarDesdeFichaCVBtn">✏️ Editar CV</button>
      </div>
    </div>
  `;
}

function obtenerPayloadOferta() {
  return {
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
}

function obtenerPayloadCV() {
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

  return {
    nombre: document.getElementById('cv_nombre').value.trim(),
    email: document.getElementById('cv_email').value.trim(),
    telefono: document.getElementById('cv_telefono').value.trim() || null,
    poblacion: document.getElementById('cv_poblacion').value.trim() || null,
    carta_presentacion: document.getElementById('cv_carta').value.trim() || null,
    prioridad: document.getElementById('cv_prioridad').value === 'true',
    estado: document.getElementById('cv_estado')?.value || 'activo',
    experiencia,
    estudios
  };
}

export async function renderBolsaView(
  mostrarOferta = false,
  modoOferta = 'nuevo',
  ofertaEditar = null,
  mostrarCV = false,
  modoCV = 'nuevo',
  cvEditar = null,
  mostrarSolicitud = false,
  ofertaSolicitud = null
) {
  setView('Bolsa de Trabajo', '<p class="loading">Cargando Bolsa de Trabajo...</p>');

  const { data: ofertas, error: errorOfertas } = await supabase
    .from('ofertas_empleo')
    .select('*')
    .neq('estado', 'eliminada')
    .order('prioridad', { ascending: false })
    .order('created_at', { ascending: false });

  if (errorOfertas) {
    setView('Bolsa de Trabajo', `<p class="error">Error al cargar ofertas: ${errorOfertas.message}</p>`);
    return;
  }

  const { data: cvs, error: errorCvs } = await supabase
    .from('cvs')
    .select('*')
    .neq('estado', 'eliminado')
    .order('prioridad', { ascending: false })
    .order('created_at', { ascending: false });

  if (errorCvs) {
    setView('Bolsa de Trabajo', `<p class="error">Error al cargar CV: ${errorCvs.message}</p>`);
    return;
  }

  const { data: solicitudes, error: errorSolicitudes } = await supabase
    .from('solicitudes_empleo')
    .select(`
      id,
      estado,
      mensaje,
      created_at,
      ofertas_empleo (
        id,
        titulo
      ),
      cvs (
        id,
        nombre,
        email
      )
    `)
    .order('created_at', { ascending: false });

  if (errorSolicitudes) {
    setView('Bolsa de Trabajo', `<p class="error">Error al cargar solicitudes: ${errorSolicitudes.message}</p>`);
    return;
  }

  const ofertaFormHTML = mostrarOferta ? getOfertaFormHTML(modoOferta, ofertaEditar || {}) : '';
  const cvFormHTML = mostrarCV ? getCVFormHTML(modoCV, cvEditar || {}) : '';
  const solicitudFormHTML = mostrarSolicitud ? getSolicitudFormHTML(ofertaSolicitud || {}, cvs || []) : '';

  setView('Bolsa de Trabajo', `
    <div class="asociado-header">
      <div>
        <p>Bolsa de Trabajo v1</p>
      </div>
      <div class="table-actions">
        <button id="nuevaOfertaBtn">➕ Nueva oferta</button>
        <button id="nuevoCVBtn" class="secondary-btn">📄 Nuevo CV</button>
        <button id="papeleraBolsaBtn" class="secondary-btn">🧺 Papelera</button>
      </div>
    </div>

    ${ofertaFormHTML}
    ${cvFormHTML}
    ${solicitudFormHTML}
    ${getListadoOfertasHTML(ofertas || [])}
    ${getListadoCVHTML(cvs || [])}
    ${getListadoSolicitudesHTML(solicitudes || [])}
  `);

  document.getElementById('nuevaOfertaBtn')?.addEventListener('click', () => {
    renderBolsaView(true, 'nuevo', null, false, 'nuevo', null, false, null);
  });

  document.getElementById('nuevoCVBtn')?.addEventListener('click', () => {
    renderBolsaView(false, 'nuevo', null, true, 'nuevo', null, false, null);
  });

  document.getElementById('papeleraBolsaBtn')?.addEventListener('click', () => {
    renderPapeleraBolsa();
  });

  document.getElementById('cancelarOfertaBtn')?.addEventListener('click', () => {
    renderBolsaView(false, 'nuevo', null, false, 'nuevo', null, false, null);
  });

  document.getElementById('cancelarCVBtn')?.addEventListener('click', () => {
    renderBolsaView(false, 'nuevo', null, false, 'nuevo', null, false, null);
  });

  document.getElementById('cancelarSolicitudBtn')?.addEventListener('click', () => {
    renderBolsaView(false, 'nuevo', null, false, 'nuevo', null, false, null);
  });

  const ofertaForm = document.getElementById('ofertaForm');
  if (ofertaForm) {
    ofertaForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const msg = document.getElementById('ofertaMsg');
      msg.textContent = modoOferta === 'editar' ? 'Guardando cambios...' : 'Guardando oferta...';
      msg.className = 'message';

      const payload = obtenerPayloadOferta();

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

      setTimeout(() => renderBolsaView(false, 'nuevo', null, false, 'nuevo', null, false, null), 600);
    });
  }

  const cvForm = document.getElementById('cvForm');
  if (cvForm) {
    cvForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const msg = document.getElementById('cvMsg');
      msg.textContent = modoCV === 'editar' ? 'Guardando cambios...' : 'Guardando CV...';
      msg.className = 'message';

      const payload = obtenerPayloadCV();

      const response = modoCV === 'editar' && cvEditar?.id
        ? await supabase.from('cvs').update(payload).eq('id', cvEditar.id)
        : await supabase.from('cvs').insert([payload]);

      if (response.error) {
        msg.textContent = 'Error al guardar CV: ' + response.error.message;
        msg.className = 'message error';
        return;
      }

      msg.textContent = modoCV === 'editar' ? 'CV actualizado correctamente' : 'CV guardado correctamente';
      msg.className = 'message success';

      setTimeout(() => renderBolsaView(false, 'nuevo', null, false, 'nuevo', null, false, null), 600);
    });
  }

  const solicitudForm = document.getElementById('solicitudForm');
  if (solicitudForm) {
    solicitudForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const msg = document.getElementById('solicitudMsg');
      msg.textContent = 'Enviando solicitud...';
      msg.className = 'message';

      const payload = {
        oferta_id: Number(document.getElementById('sol_oferta_id').value),
        cv_id: Number(document.getElementById('sol_cv_id').value),
        mensaje: document.getElementById('sol_mensaje').value.trim() || null,
        estado: 'pendiente'
      };

      const { error } = await supabase
        .from('solicitudes_empleo')
        .insert([payload]);

      if (error) {
        msg.textContent = 'Error al enviar solicitud: ' + error.message;
        msg.className = 'message error';
        return;
      }

      msg.textContent = 'Solicitud enviada correctamente';
      msg.className = 'message success';

      setTimeout(() => renderBolsaView(false, 'nuevo', null, false, 'nuevo', null, false, null), 800);
    });
  }

  document.querySelectorAll('.solicitarOfertaBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const oferta = (ofertas || []).find(item => item.id === id);
      renderBolsaView(false, 'nuevo', null, false, 'nuevo', null, true, oferta);
    });
  });

  document.querySelectorAll('.editarOfertaBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const oferta = (ofertas || []).find(item => item.id === id);
      renderBolsaView(true, 'editar', oferta, false, 'nuevo', null, false, null);
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

      renderBolsaView(false, 'nuevo', null, false, 'nuevo', null, false, null);
    });
  });

  document.querySelectorAll('.eliminarOfertaBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const ok = confirm('¿Seguro que quieres eliminar esta oferta? No se borrará definitivamente, solo irá a la papelera.');
      if (!ok) return;

      const { error } = await supabase
        .from('ofertas_empleo')
        .update({ estado: 'eliminada' })
        .eq('id', id);

      if (error) {
        alert('Error al eliminar oferta: ' + error.message);
        return;
      }

      renderBolsaView(false, 'nuevo', null, false, 'nuevo', null, false, null);
    });
  });

  document.querySelectorAll('.verCVBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      await renderFichaCV(id);
    });
  });

  document.querySelectorAll('.editarCVBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const cv = (cvs || []).find(item => item.id === id);
      renderBolsaView(false, 'nuevo', null, true, 'editar', cv, false, null);
    });
  });

  document.querySelectorAll('.toggleCVBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const estadoActual = btn.dataset.estado;
      const nuevoEstado = estadoActual === 'inactivo' ? 'activo' : 'inactivo';

      const { error } = await supabase
        .from('cvs')
        .update({ estado: nuevoEstado })
        .eq('id', id);

      if (error) {
        alert('Error al cambiar estado del CV: ' + error.message);
        return;
      }

      renderBolsaView(false, 'nuevo', null, false, 'nuevo', null, false, null);
    });
  });

  document.querySelectorAll('.eliminarCVBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const ok = confirm('¿Seguro que quieres eliminar este CV? No se borrará definitivamente, solo irá a la papelera.');
      if (!ok) return;

      const { error } = await supabase
        .from('cvs')
        .update({ estado: 'eliminado' })
        .eq('id', id);

      if (error) {
        alert('Error al eliminar CV: ' + error.message);
        return;
      }

      renderBolsaView(false, 'nuevo', null, false, 'nuevo', null, false, null);
    });
  });

  document.querySelectorAll('.estadoSolicitudBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const nuevoEstado = btn.dataset.estado;

      const { error } = await supabase
        .from('solicitudes_empleo')
        .update({ estado: nuevoEstado })
        .eq('id', id);

      if (error) {
        alert('Error al cambiar estado de solicitud: ' + error.message);
        return;
      }

      renderBolsaView(false, 'nuevo', null, false, 'nuevo', null, false, null);
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
    renderBolsaView(false, 'nuevo', null, false, 'nuevo', null, false, null);
  });

  document.getElementById('editarDesdeFichaCVBtn')?.addEventListener('click', () => {
    renderBolsaView(false, 'nuevo', null, true, 'editar', cv, false, null);
  });
}

async function renderPapeleraBolsa() {
  setView('Papelera Bolsa', '<p class="loading">Cargando papelera...</p>');

  const { data: ofertas, error: errorOfertas } = await supabase
    .from('ofertas_empleo')
    .select('*')
    .eq('estado', 'eliminada')
    .order('created_at', { ascending: false });

  if (errorOfertas) {
    setView('Papelera Bolsa', `<p class="error">Error al cargar ofertas eliminadas: ${errorOfertas.message}</p>`);
    return;
  }

  const { data: cvs, error: errorCvs } = await supabase
    .from('cvs')
    .select('*')
    .eq('estado', 'eliminado')
    .order('created_at', { ascending: false });

  if (errorCvs) {
    setView('Papelera Bolsa', `<p class="error">Error al cargar CV eliminados: ${errorCvs.message}</p>`);
    return;
  }

  setView('Papelera Bolsa', `
    <div class="asociado-header">
      <div>
        <p>Elementos eliminados de la Bolsa de Trabajo.</p>
      </div>
      <div class="table-actions">
        <button id="volverBolsaBtn" class="secondary-btn">⬅ Volver</button>
      </div>
    </div>

    ${getPapeleraHTML(ofertas || [], cvs || [])}
  `);

  document.getElementById('volverBolsaBtn')?.addEventListener('click', () => {
    renderBolsaView(false, 'nuevo', null, false, 'nuevo', null, false, null);
  });

  document.querySelectorAll('.restaurarOfertaBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const ok = confirm('¿Restaurar esta oferta?');
      if (!ok) return;

      const { error } = await supabase
        .from('ofertas_empleo')
        .update({ estado: 'activa' })
        .eq('id', id);

      if (error) {
        alert('Error al restaurar oferta: ' + error.message);
        return;
      }

      renderPapeleraBolsa();
    });
  });

  document.querySelectorAll('.restaurarCVBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const ok = confirm('¿Restaurar este CV?');
      if (!ok) return;

      const { error } = await supabase
        .from('cvs')
        .update({ estado: 'activo' })
        .eq('id', id);

      if (error) {
        alert('Error al restaurar CV: ' + error.message);
        return;
      }

      renderPapeleraBolsa();
    });
  });
}

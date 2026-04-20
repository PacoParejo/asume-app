import { supabase } from '../supabase.js';

function setView(title, html) {
  const viewTitle = document.getElementById('viewTitle');
  const viewContent = document.getElementById('viewContent');

  if (viewTitle) viewTitle.textContent = title;
  if (viewContent) viewContent.innerHTML = html;
}

function getEstadoClass(estado) {
  const valor = (estado || '').toLowerCase();

  if (valor === 'activo') return 'estado-badge estado-activo';
  if (valor === 'pendiente') return 'estado-badge estado-pendiente';
  if (valor === 'dormido') return 'estado-badge estado-dormido';
  if (valor === 'perdido') return 'estado-badge estado-perdido';
  if (valor === 'baja') return 'estado-badge estado-baja';

  return 'estado-badge';
}

function normalizar(valor) {
  return (valor || '').toString().trim().toLowerCase();
}

function filtrarAsociados(data, textoBusqueda, estadoFiltro) {
  const texto = normalizar(textoBusqueda);
  const estado = normalizar(estadoFiltro);

  return (data || []).filter(item => {
    const coincideBusqueda =
      !texto ||
      normalizar(item.nombre).includes(texto) ||
      normalizar(item.apellidos).includes(texto) ||
      normalizar(item.telefono).includes(texto) ||
      normalizar(item.email).includes(texto) ||
      normalizar(item.empresas).includes(texto) ||
      normalizar(item.poblacion).includes(texto);

    const coincideEstado =
      !estado ||
      estado === 'todos' ||
      normalizar(item.estado) === estado;

    return coincideBusqueda && coincideEstado;
  });
}

function getResumen(dataFiltrada) {
  const visibles = dataFiltrada.length;
  const activos = dataFiltrada.filter(x => normalizar(x.estado) === 'activo').length;
  const bajas = dataFiltrada.filter(x => normalizar(x.estado) === 'baja').length;

  return { visibles, activos, bajas };
}

function nombreCompleto(item) {
  return [item.nombre || '', item.apellidos || ''].join(' ').trim();
}

function textoCuota(item) {
  return item.paga_cuota ? 'Sí' : 'No';
}

function getFiltrosHTML(busqueda = '', estado = 'todos', resumen = { visibles: 0, activos: 0, bajas: 0 }) {
  return `
    <div class="form-card">
      <form id="filtrosAsociadosForm">
        <div class="form-grid">
          <div>
            <label for="busquedaAsociados">Buscar</label>
            <input
              type="text"
              id="busquedaAsociados"
              placeholder="Buscar por nombre, teléfono, email, empresa o población"
              value="${busqueda}"
            />
          </div>

          <div>
            <label for="filtroEstadoAsociados">Estado</label>
            <select id="filtroEstadoAsociados">
              <option value="todos" ${estado === 'todos' ? 'selected' : ''}>todos</option>
              <option value="activo" ${estado === 'activo' ? 'selected' : ''}>activo</option>
              <option value="pendiente" ${estado === 'pendiente' ? 'selected' : ''}>pendiente</option>
              <option value="dormido" ${estado === 'dormido' ? 'selected' : ''}>dormido</option>
              <option value="perdido" ${estado === 'perdido' ? 'selected' : ''}>perdido</option>
              <option value="baja" ${estado === 'baja' ? 'selected' : ''}>baja</option>
            </select>
          </div>
        </div>

        <div class="top-actions" style="justify-content:flex-start; margin-top:16px;">
          <button type="submit">Buscar</button>
          <button type="button" id="limpiarFiltrosBtn" class="secondary-btn">Limpiar</button>
        </div>
      </form>

      <div class="helper" style="margin-top: 12px;">
        Visibles: <strong>${resumen.visibles}</strong> |
        Activos: <strong>${resumen.activos}</strong> |
        Baja: <strong>${resumen.bajas}</strong>
      </div>
    </div>
  `;
}

function getNuevoAsociadoFormHTML() {
  return `
    <div class="form-card">
      <h3>Nuevo asociado</h3>
      <form id="nuevoAsociadoForm">
        <div class="form-grid">
          <div>
            <label for="nuevo_nombre">Nombre</label>
            <input type="text" id="nuevo_nombre" required />
          </div>

          <div>
            <label for="nuevo_apellidos">Apellidos</label>
            <input type="text" id="nuevo_apellidos" />
          </div>

          <div>
            <label for="nuevo_telefono">Teléfono</label>
            <input type="text" id="nuevo_telefono" />
          </div>

          <div>
            <label for="nuevo_email">Email</label>
            <input type="email" id="nuevo_email" />
          </div>

          <div>
            <label for="nuevo_poblacion">Población</label>
            <input type="text" id="nuevo_poblacion" />
          </div>

          <div>
            <label for="nuevo_tipo_membresia">Tipo de membresía</label>
            <select id="nuevo_tipo_membresia">
              <option value="Titular">Titular</option>
              <option value="Vinculado">Vinculado</option>
            </select>
          </div>

          <div>
            <label for="nuevo_paga_cuota">¿Paga cuota?</label>
            <select id="nuevo_paga_cuota">
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>

          <div>
            <label for="nuevo_cargo_asume">Cargo ASUME</label>
            <input type="text" id="nuevo_cargo_asume" />
          </div>
        </div>

        <div class="top-actions" style="justify-content:flex-start; margin-top:16px;">
          <button type="submit">Guardar asociado</button>
          <button type="button" id="cancelarNuevoAsociadoBtn" class="secondary-btn">Cancelar</button>
        </div>
      </form>

      <div id="nuevoAsociadoMsg" class="message"></div>
    </div>
  `;
}

function getNuevaEmpresaFormHTML() {
  return `
    <div class="form-card">
      <h3>Nueva empresa</h3>
      <form id="nuevaEmpresaForm">
        <div class="form-grid">
          <div>
            <label for="empresa_nombre">Nombre de empresa</label>
            <input type="text" id="empresa_nombre" required />
          </div>

          <div>
            <label for="empresa_actividad">Actividad</label>
            <input type="text" id="empresa_actividad" />
          </div>

          <div class="full-width">
            <label for="empresa_direccion">Dirección</label>
            <input type="text" id="empresa_direccion" />
          </div>

          <div>
            <label for="empresa_poblacion">Población</label>
            <input type="text" id="empresa_poblacion" />
          </div>
        </div>

        <div class="top-actions" style="justify-content:flex-start; margin-top:16px;">
          <button type="submit">Guardar empresa</button>
          <button type="button" id="cancelarNuevaEmpresaBtn" class="secondary-btn">Cancelar</button>
        </div>
      </form>

      <div id="nuevaEmpresaMsg" class="message"></div>
    </div>
  `;
}

function getVincularFormHTML(asociados = [], empresas = []) {
  const opcionesAsociados = (asociados || [])
    .map(a => `<option value="${a.id}">${a.nombre} ${a.apellidos || ''}</option>`)
    .join('');

  const opcionesEmpresas = (empresas || [])
    .map(e => `<option value="${e.id}">${e.nombre_empresa}</option>`)
    .join('');

  return `
    <div class="form-card">
      <h3>Vincular asociado y empresa</h3>
      <form id="vincularForm">
        <div class="form-grid">
          <div>
            <label for="vincular_asociado_id">Asociado</label>
            <select id="vincular_asociado_id" required>
              <option value="">Selecciona asociado</option>
              ${opcionesAsociados}
            </select>
          </div>

          <div>
            <label for="vincular_empresa_id">Empresa</label>
            <select id="vincular_empresa_id" required>
              <option value="">Selecciona empresa</option>
              ${opcionesEmpresas}
            </select>
          </div>

          <div>
            <label for="vincular_principal">¿Contacto principal?</label>
            <select id="vincular_principal">
              <option value="true">Sí</option>
              <option value="false">No</option>
            </select>
          </div>
        </div>

        <div class="top-actions" style="justify-content:flex-start; margin-top:16px;">
          <button type="submit">Guardar vínculo</button>
          <button type="button" id="cancelarVincularBtn" class="secondary-btn">Cancelar</button>
        </div>
      </form>

      <div id="vincularMsg" class="message"></div>
    </div>
  `;
}

function getFichaAsociadoHTML(asociado, empresas) {
  const listaEmpresas = (empresas || []).map(item => {
    const nombre = item.empresas_nuevo?.nombre_empresa || '';
    const principal = item.contacto_principal_empresa ? ' (principal)' : '';
    return `<li>${nombre}${principal}</li>`;
  }).join('');

  return `
    <div class="form-card">
      <h2>${asociado.nombre || ''} ${asociado.apellidos || ''}</h2>

      <p><strong>Teléfono:</strong> ${asociado.telefono || '-'}</p>
      <p><strong>Email:</strong> ${asociado.email || '-'}</p>
      <p><strong>Población:</strong> ${asociado.poblacion || '-'}</p>
      <p><strong>Membresía:</strong> ${asociado.tipo_membresia || '-'}</p>
      <p><strong>Cuota:</strong> ${asociado.paga_cuota ? 'Sí' : 'No'}</p>
      <p><strong>Cargo ASUME:</strong> ${asociado.cargo_asume || '-'}</p>
      <p><strong>Estado:</strong> <span class="${getEstadoClass(asociado.estado)}">${asociado.estado || ''}</span></p>

      <h3>Empresas vinculadas</h3>
      <ul>
        ${listaEmpresas || '<li>Sin empresas vinculadas</li>'}
      </ul>

      <div class="top-actions" style="justify-content:flex-start; margin-top:20px;">
        <button id="volverListadoBtn" class="secondary-btn">⬅ Volver</button>
        <button id="editarFichaBtn">✏️ Editar</button>
        <button id="darBajaFichaBtn" class="secondary-btn">⏸ Dar de baja</button>
        <button id="eliminarFichaBtn" class="danger-btn">🗑 Eliminar</button>
      </div>
    </div>
  `;
}

function getEditarAsociadoFormHTML(asociado) {
  return `
    <div class="form-card">
      <h2>Editar: ${asociado.nombre || ''} ${asociado.apellidos || ''}</h2>

      <form id="editarAsociadoForm">
        <div class="form-grid">
          <div>
            <label for="edit_nombre">Nombre</label>
            <input type="text" id="edit_nombre" value="${asociado.nombre || ''}" required />
          </div>

          <div>
            <label for="edit_apellidos">Apellidos</label>
            <input type="text" id="edit_apellidos" value="${asociado.apellidos || ''}" />
          </div>

          <div>
            <label for="edit_telefono">Teléfono</label>
            <input type="text" id="edit_telefono" value="${asociado.telefono || ''}" />
          </div>

          <div>
            <label for="edit_email">Email</label>
            <input type="email" id="edit_email" value="${asociado.email || ''}" />
          </div>

          <div>
            <label for="edit_poblacion">Población</label>
            <input type="text" id="edit_poblacion" value="${asociado.poblacion || ''}" />
          </div>

          <div>
            <label for="edit_tipo_membresia">Tipo de membresía</label>
            <select id="edit_tipo_membresia">
              <option value="Titular" ${asociado.tipo_membresia === 'Titular' ? 'selected' : ''}>Titular</option>
              <option value="Vinculado" ${asociado.tipo_membresia === 'Vinculado' ? 'selected' : ''}>Vinculado</option>
            </select>
          </div>

          <div>
            <label for="edit_paga_cuota">¿Paga cuota?</label>
            <select id="edit_paga_cuota">
              <option value="true" ${asociado.paga_cuota ? 'selected' : ''}>Sí</option>
              <option value="false" ${!asociado.paga_cuota ? 'selected' : ''}>No</option>
            </select>
          </div>

          <div>
            <label for="edit_cargo_asume">Cargo ASUME</label>
            <input type="text" id="edit_cargo_asume" value="${asociado.cargo_asume || ''}" />
          </div>
        </div>

        <div class="top-actions" style="justify-content:flex-start; margin-top:20px;">
          <button type="submit">💾 Guardar cambios</button>
          <button type="button" id="cancelarEdicionBtn" class="secondary-btn">Cancelar</button>
        </div>
      </form>

      <div id="msgEditarAsociado" class="message"></div>
    </div>
  `;
}

export async function renderAsociadosView() {
  await renderAsociadosInterna('', 'todos', false, false, false);
}

async function renderAsociadosInterna(
  busqueda = '',
  estadoFiltro = 'todos',
  mostrarFormNuevo = false,
  mostrarFormEmpresa = false,
  mostrarFormVincular = false
) {
  setView('Asociados', '<p class="loading">Cargando asociados...</p>');

  const { data, error } = await supabase
    .from('vista_asociados_agrupados')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    setView('Asociados', `<p class="error">Error al cargar asociados: ${error.message}</p>`);
    return;
  }

  let asociadosParaVincular = [];
  let empresasParaVincular = [];

  if (mostrarFormVincular) {
    const { data: asociadosRaw } = await supabase
      .from('asociados_nuevo')
      .select('id, nombre, apellidos')
      .order('nombre', { ascending: true });

    const { data: empresasRaw } = await supabase
      .from('empresas_nuevo')
      .select('id, nombre_empresa')
      .order('nombre_empresa', { ascending: true });

    asociadosParaVincular = asociadosRaw || [];
    empresasParaVincular = empresasRaw || [];
  }

  const dataFiltrada = filtrarAsociados(data || [], busqueda, estadoFiltro);
  const resumen = getResumen(dataFiltrada);
  const filtrosHTML = getFiltrosHTML(busqueda, estadoFiltro, resumen);
  const nuevoAsociadoFormHTML = mostrarFormNuevo ? getNuevoAsociadoFormHTML() : '';
  const nuevaEmpresaFormHTML = mostrarFormEmpresa ? getNuevaEmpresaFormHTML() : '';
  const vincularFormHTML = mostrarFormVincular ? getVincularFormHTML(asociadosParaVincular, empresasParaVincular) : '';

  const rows = dataFiltrada.map(item => `
    <tr>
      <td>${item.id}</td>
      <td>
        <button class="secondary-btn verFichaBtn" data-id="${item.id}" style="padding:6px 10px; font-size:13px;">
          ${nombreCompleto(item)}
        </button>
      </td>
      <td>${item.telefono || ''}</td>
      <td>${item.email || ''}</td>
      <td>${item.poblacion || ''}</td>
      <td>${item.tipo_membresia || ''}</td>
      <td>${textoCuota(item)}</td>
      <td>${item.cargo_asume || ''}</td>
      <td>${item.empresas || ''}</td>
      <td><span class="${getEstadoClass(item.estado)}">${item.estado || ''}</span></td>
      <td>
        <button class="secondary-btn verFichaBtn" data-id="${item.id}" style="padding:6px 10px; font-size:13px;">
          Ver ficha
        </button>
      </td>
    </tr>
  `).join('');

  setView('Asociados', `
    <div class="asociado-header">
      <div>
        <p style="margin:0;">Listado agrupado de asociados desde la nueva estructura.</p>
      </div>
      <div class="table-actions">
        <button id="nuevoAsociadoBtn">➕ Nuevo asociado</button>
        <button id="nuevaEmpresaBtn" class="secondary-btn">🏢 Nueva empresa</button>
        <button id="vincularBtn" class="secondary-btn">🔗 Vincular</button>
      </div>
    </div>

    ${filtrosHTML}

    ${nuevoAsociadoFormHTML}
    ${nuevaEmpresaFormHTML}
    ${vincularFormHTML}

    <div class="form-card">
      <div class="helper">
        Vista ASUME centrada en la persona asociada. Las empresas aparecen agrupadas en una sola columna.
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Asociado</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Población</th>
            <th>Membresía</th>
            <th>Cuota</th>
            <th>Cargo ASUME</th>
            <th>Empresas</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="11">No hay asociados que coincidan con el filtro.</td></tr>'}
        </tbody>
      </table>
    </div>
  `);

  const filtrosForm = document.getElementById('filtrosAsociadosForm');
  if (filtrosForm) {
    filtrosForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const nuevaBusqueda = document.getElementById('busquedaAsociados')?.value || '';
      const nuevoEstado = document.getElementById('filtroEstadoAsociados')?.value || 'todos';

      await renderAsociadosInterna(nuevaBusqueda, nuevoEstado, false, false, false);
    });
  }

  const limpiarFiltrosBtn = document.getElementById('limpiarFiltrosBtn');
  if (limpiarFiltrosBtn) {
    limpiarFiltrosBtn.addEventListener('click', async () => {
      await renderAsociadosInterna('', 'todos', false, false, false);
    });
  }

  const nuevoAsociadoBtn = document.getElementById('nuevoAsociadoBtn');
  if (nuevoAsociadoBtn) {
    nuevoAsociadoBtn.addEventListener('click', async () => {
      await renderAsociadosInterna(busqueda, estadoFiltro, true, false, false);
    });
  }

  const nuevaEmpresaBtn = document.getElementById('nuevaEmpresaBtn');
  if (nuevaEmpresaBtn) {
    nuevaEmpresaBtn.addEventListener('click', async () => {
      await renderAsociadosInterna(busqueda, estadoFiltro, false, true, false);
    });
  }

  const vincularBtn = document.getElementById('vincularBtn');
  if (vincularBtn) {
    vincularBtn.addEventListener('click', async () => {
      await renderAsociadosInterna(busqueda, estadoFiltro, false, false, true);
    });
  }

  const verFichaBtns = document.querySelectorAll('.verFichaBtn');
  verFichaBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = btn.dataset.id;
      await renderFichaAsociado(id);
    });
  });

  const cancelarNuevoAsociadoBtn = document.getElementById('cancelarNuevoAsociadoBtn');
  if (cancelarNuevoAsociadoBtn) {
    cancelarNuevoAsociadoBtn.addEventListener('click', async () => {
      await renderAsociadosInterna(busqueda, estadoFiltro, false, false, false);
    });
  }

  const nuevoAsociadoForm = document.getElementById('nuevoAsociadoForm');
  if (nuevoAsociadoForm) {
    nuevoAsociadoForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const msg = document.getElementById('nuevoAsociadoMsg');
      msg.textContent = 'Guardando asociado...';
      msg.className = 'message';

      const payload = {
        nombre: document.getElementById('nuevo_nombre').value.trim(),
        apellidos: document.getElementById('nuevo_apellidos').value.trim() || null,
        telefono: document.getElementById('nuevo_telefono').value.trim() || null,
        email: document.getElementById('nuevo_email').value.trim() || null,
        poblacion: document.getElementById('nuevo_poblacion').value.trim() || null,
        tipo_membresia: document.getElementById('nuevo_tipo_membresia').value,
        paga_cuota: document.getElementById('nuevo_paga_cuota').value === 'true',
        cargo_asume: document.getElementById('nuevo_cargo_asume').value.trim() || null,
        estado: 'activo'
      };

      const { error: insertError } = await supabase
        .from('asociados_nuevo')
        .insert([payload]);

      if (insertError) {
        msg.textContent = 'Error al guardar: ' + insertError.message;
        msg.className = 'message error';
        return;
      }

      msg.textContent = 'Asociado guardado correctamente';
      msg.className = 'message success';

      setTimeout(async () => {
        await renderAsociadosInterna(busqueda, estadoFiltro, false, false, false);
      }, 600);
    });
  }

  const cancelarNuevaEmpresaBtn = document.getElementById('cancelarNuevaEmpresaBtn');
  if (cancelarNuevaEmpresaBtn) {
    cancelarNuevaEmpresaBtn.addEventListener('click', async () => {
      await renderAsociadosInterna(busqueda, estadoFiltro, false, false, false);
    });
  }

  const nuevaEmpresaForm = document.getElementById('nuevaEmpresaForm');
  if (nuevaEmpresaForm) {
    nuevaEmpresaForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const msg = document.getElementById('nuevaEmpresaMsg');
      msg.textContent = 'Guardando empresa...';
      msg.className = 'message';

      const payload = {
        nombre_empresa: document.getElementById('empresa_nombre').value.trim(),
        actividad: document.getElementById('empresa_actividad').value.trim() || null,
        direccion: document.getElementById('empresa_direccion').value.trim() || null,
        poblacion: document.getElementById('empresa_poblacion').value.trim() || null
      };

      const { error: insertError } = await supabase
        .from('empresas_nuevo')
        .insert([payload]);

      if (insertError) {
        msg.textContent = 'Error al guardar: ' + insertError.message;
        msg.className = 'message error';
        return;
      }

      msg.textContent = 'Empresa guardada correctamente';
      msg.className = 'message success';

      setTimeout(async () => {
        await renderAsociadosInterna(busqueda, estadoFiltro, false, false, false);
      }, 600);
    });
  }

  const cancelarVincularBtn = document.getElementById('cancelarVincularBtn');
  if (cancelarVincularBtn) {
    cancelarVincularBtn.addEventListener('click', async () => {
      await renderAsociadosInterna(busqueda, estadoFiltro, false, false, false);
    });
  }

  const vincularForm = document.getElementById('vincularForm');
  if (vincularForm) {
    vincularForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const msg = document.getElementById('vincularMsg');
      msg.textContent = 'Guardando vínculo...';
      msg.className = 'message';

      const payload = {
        asociado_id: Number(document.getElementById('vincular_asociado_id').value),
        empresa_id: Number(document.getElementById('vincular_empresa_id').value),
        contacto_principal_empresa: document.getElementById('vincular_principal').value === 'true'
      };

      const { error: insertError } = await supabase
        .from('asociado_empresa_nuevo')
        .insert([payload]);

      if (insertError) {
        msg.textContent = 'Error al guardar: ' + insertError.message;
        msg.className = 'message error';
        return;
      }

      msg.textContent = 'Vínculo guardado correctamente';
      msg.className = 'message success';

      setTimeout(async () => {
        await renderAsociadosInterna(busqueda, estadoFiltro, false, false, false);
      }, 600);
    });
  }
}

async function renderFichaAsociado(id) {
  setView('Ficha asociado', '<p class="loading">Cargando ficha...</p>');

  const { data: asociado, error: errorAsociado } = await supabase
    .from('asociados_nuevo')
    .select('*')
    .eq('id', id)
    .single();

  if (errorAsociado) {
    setView('Error', `<p class="error">${errorAsociado.message}</p>`);
    return;
  }

  const { data: empresas, error: errorEmpresas } = await supabase
    .from('asociado_empresa_nuevo')
    .select(`
      contacto_principal_empresa,
      empresas_nuevo (
        id,
        nombre_empresa
      )
    `)
    .eq('asociado_id', id);

  if (errorEmpresas) {
    setView('Error', `<p class="error">${errorEmpresas.message}</p>`);
    return;
  }

  setView('Ficha asociado', getFichaAsociadoHTML(asociado, empresas));

  const volverBtn = document.getElementById('volverListadoBtn');
  if (volverBtn) {
    volverBtn.addEventListener('click', async () => {
      await renderAsociadosInterna('', 'todos', false, false, false);
    });
  }

  const editarBtn = document.getElementById('editarFichaBtn');
  if (editarBtn) {
    editarBtn.addEventListener('click', async () => {
      await renderEditarAsociado(id);
    });
  }

  const darBajaBtn = document.getElementById('darBajaFichaBtn');
  if (darBajaBtn) {
    darBajaBtn.addEventListener('click', () => {
      alert('Siguiente paso: dar de baja al asociado');
    });
  }

  const eliminarBtn = document.getElementById('eliminarFichaBtn');
  if (eliminarBtn) {
    eliminarBtn.addEventListener('click', () => {
      alert('Siguiente paso: eliminar asociado');
    });
  }
}

async function renderEditarAsociado(id) {
  setView('Editar asociado', '<p class="loading">Cargando edición...</p>');

  const { data: asociado, error } = await supabase
    .from('asociados_nuevo')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    setView('Error', `<p class="error">${error.message}</p>`);
    return;
  }

  setView('Editar asociado', getEditarAsociadoFormHTML(asociado));

  const cancelarBtn = document.getElementById('cancelarEdicionBtn');
  if (cancelarBtn) {
    cancelarBtn.addEventListener('click', async () => {
      await renderFichaAsociado(id);
    });
  }

  const editarForm = document.getElementById('editarAsociadoForm');
  if (editarForm) {
    editarForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const msg = document.getElementById('msgEditarAsociado');
      msg.textContent = 'Guardando cambios...';
      msg.className = 'message';

      const payload = {
        nombre: document.getElementById('edit_nombre').value.trim(),
        apellidos: document.getElementById('edit_apellidos').value.trim() || null,
        telefono: document.getElementById('edit_telefono').value.trim() || null,
        email: document.getElementById('edit_email').value.trim() || null,
        poblacion: document.getElementById('edit_poblacion').value.trim() || null,
        tipo_membresia: document.getElementById('edit_tipo_membresia').value,
        paga_cuota: document.getElementById('edit_paga_cuota').value === 'true',
        cargo_asume: document.getElementById('edit_cargo_asume').value.trim() || null
      };

      const { error: updateError } = await supabase
        .from('asociados_nuevo')
        .update(payload)
        .eq('id', id);

      if (updateError) {
        msg.textContent = 'Error al guardar: ' + updateError.message;
        msg.className = 'message error';
        return;
      }

      msg.textContent = 'Cambios guardados correctamente';
      msg.className = 'message success';

      setTimeout(async () => {
        await renderFichaAsociado(id);
      }, 600);
    });
  }
}

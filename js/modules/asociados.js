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
      normalizar(item.contacto).includes(texto) ||
      normalizar(item.empresa).includes(texto) ||
      normalizar(item.telefono).includes(texto) ||
      normalizar(item.email).includes(texto);

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

function getAsociadoFormHTML(modo = 'nuevo', asociado = {}) {
  const titulo = modo === 'editar' ? 'Editar asociado' : 'Nuevo asociado';
  const boton = modo === 'editar' ? 'Guardar cambios' : 'Guardar asociado';

  return `
    <div class="form-card">
      <h3>${titulo}</h3>
      <form id="asociadoForm">
        <div class="form-grid">
          <div>
            <label for="contacto">Contacto</label>
            <input type="text" id="contacto" value="${asociado.contacto || ''}" required />
          </div>

          <div>
            <label for="cargo">Cargo</label>
            <input type="text" id="cargo" value="${asociado.cargo || ''}" />
          </div>

          <div>
            <label for="telefono">Teléfono</label>
            <input type="text" id="telefono" value="${asociado.telefono || ''}" required />
          </div>

          <div>
            <label for="empresa">Empresa</label>
            <input type="text" id="empresa" value="${asociado.empresa || ''}" required />
          </div>

          <div>
            <label for="actividad">Actividad</label>
            <input type="text" id="actividad" value="${asociado.actividad || ''}" />
          </div>

          <div>
            <label for="email_asociado">Email</label>
            <input type="email" id="email_asociado" value="${asociado.email || ''}" />
          </div>

          <div class="full-width">
            <label for="direccion">Dirección</label>
            <input type="text" id="direccion" value="${asociado.direccion || ''}" />
          </div>

          <div>
            <label for="estado">Estado</label>
            <select id="estado">
              <option value="activo" ${asociado.estado === 'activo' ? 'selected' : ''}>activo</option>
              <option value="pendiente" ${asociado.estado === 'pendiente' ? 'selected' : ''}>pendiente</option>
              <option value="dormido" ${asociado.estado === 'dormido' ? 'selected' : ''}>dormido</option>
              <option value="perdido" ${asociado.estado === 'perdido' ? 'selected' : ''}>perdido</option>
              <option value="baja" ${asociado.estado === 'baja' ? 'selected' : ''}>baja</option>
            </select>
          </div>
        </div>

        <div class="helper">Formulario simple: Contacto, Cargo, Teléfono, Empresa, Actividad, Dirección, Email.</div>

        <div class="top-actions" style="justify-content:flex-start; margin-top:16px;">
          <button type="submit">${boton}</button>
          <button type="button" id="cancelarFormBtn" class="secondary-btn">Cancelar</button>
        </div>
      </form>

      <div id="asociadoFormMsg" class="message"></div>
    </div>
  `;
}

function getFiltrosHTML(busqueda = '', estado = 'todos', resumen = { visibles: 0, activos: 0, bajas: 0 }) {
  return `
    <div class="form-card">
      <div class="form-grid">
        <div>
          <label for="busquedaAsociados">Buscar</label>
          <input
            type="text"
            id="busquedaAsociados"
            placeholder="Buscar por contacto, empresa, teléfono o email"
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

      <div class="helper" style="margin-top: 12px;">
        Visibles: <strong>${resumen.visibles}</strong> |
        Activos: <strong>${resumen.activos}</strong> |
        Baja: <strong>${resumen.bajas}</strong>
      </div>
    </div>
  `;
}

async function archivarYEliminarAsociado(asociado) {
  const payloadArchivo = {
    contacto: asociado.contacto || '',
    cargo: asociado.cargo || '',
    telefono: asociado.telefono || '',
    empresa: asociado.empresa || '',
    actividad: asociado.actividad || '',
    direccion: asociado.direccion || '',
    email: asociado.email || '',
    estado: asociado.estado || 'baja',
    user_id: asociado.user_id || null
  };

  const { error: archivoError } = await supabase
    .from('asociados_archivo')
    .insert([payloadArchivo]);

  if (archivoError) {
    return { ok: false, error: 'Error al archivar: ' + archivoError.message };
  }

  const { error: deleteError } = await supabase
    .from('asociados')
    .delete()
    .eq('id', asociado.id);

  if (deleteError) {
    return { ok: false, error: 'Se archivó, pero no se pudo eliminar: ' + deleteError.message };
  }

  return { ok: true };
}

export async function renderAsociadosView() {
  await renderAsociadosInterna(false, 'nuevo', null, '', 'todos');
}

async function renderAsociadosInterna(
  mostrarFormulario = false,
  modo = 'nuevo',
  asociado = null,
  busqueda = '',
  estadoFiltro = 'todos'
) {
  setView('Asociados', '<p class="loading">Cargando asociados...</p>');

  const { data, error } = await supabase
    .from('asociados')
    .select('id, contacto, cargo, telefono, empresa, actividad, direccion, email, estado, user_id')
    .order('id', { ascending: true });

  if (error) {
    setView('Asociados', `<p class="error">Error al cargar asociados: ${error.message}</p>`);
    return;
  }

  const dataFiltrada = filtrarAsociados(data || [], busqueda, estadoFiltro);
  const resumen = getResumen(dataFiltrada);
  const formHTML = mostrarFormulario ? getAsociadoFormHTML(modo, asociado || {}) : '';
  const filtrosHTML = getFiltrosHTML(busqueda, estadoFiltro, resumen);

  const rows = dataFiltrada.map(item => {
    const botonEliminar = normalizar(item.estado) === 'baja'
      ? `<button class="danger-btn eliminar-btn" data-id="${item.id}">Eliminar definitivamente</button>`
      : '';

    return `
      <tr>
        <td>${item.id}</td>
        <td>${item.contacto || ''}</td>
        <td>${item.cargo || ''}</td>
        <td>${item.telefono || ''}</td>
        <td>${item.empresa || ''}</td>
        <td>${item.actividad || ''}</td>
        <td>${item.direccion || ''}</td>
        <td>${item.email || ''}</td>
        <td><span class="${getEstadoClass(item.estado)}">${item.estado || ''}</span></td>
        <td>
          <div class="table-actions">
            <button class="secondary-btn editar-btn" data-id="${item.id}">Editar</button>
            <button class="danger-btn baja-btn" data-id="${item.id}">Dar de baja</button>
            ${botonEliminar}
          </div>
        </td>
      </tr>
    `;
  }).join('');

  setView('Asociados', `
    <div class="asociado-header">
      <div>
        <p style="margin:0;">Listado real de asociados cargado desde Supabase.</p>
      </div>
      <div>
        <button id="nuevoAsociadoBtn">➕ Nuevo asociado</button>
      </div>
    </div>

    ${filtrosHTML}

    ${formHTML}

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Contacto</th>
            <th>Cargo</th>
            <th>Teléfono</th>
            <th>Empresa</th>
            <th>Actividad</th>
            <th>Dirección</th>
            <th>Email</th>
            <th>Estado</th>
            <th>Acciones</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="10">No hay asociados que coincidan con el filtro.</td></tr>'}
        </tbody>
      </table>
    </div>
  `);

  const nuevoAsociadoBtn = document.getElementById('nuevoAsociadoBtn');
  if (nuevoAsociadoBtn) {
    nuevoAsociadoBtn.addEventListener('click', async () => {
      await renderAsociadosInterna(true, 'nuevo', null, busqueda, estadoFiltro);
    });
  }

  const cancelarFormBtn = document.getElementById('cancelarFormBtn');
  if (cancelarFormBtn) {
    cancelarFormBtn.addEventListener('click', async () => {
      await renderAsociadosInterna(false, 'nuevo', null, busqueda, estadoFiltro);
    });
  }

  const buscador = document.getElementById('busquedaAsociados');
  if (buscador) {
    buscador.addEventListener('input', async (e) => {
      await renderAsociadosInterna(
        false,
        'nuevo',
        null,
        e.target.value,
        document.getElementById('filtroEstadoAsociados')?.value || 'todos'
      );
    });
  }

  const filtroEstado = document.getElementById('filtroEstadoAsociados');
  if (filtroEstado) {
    filtroEstado.addEventListener('change', async (e) => {
      await renderAsociadosInterna(
        false,
        'nuevo',
        null,
        document.getElementById('busquedaAsociados')?.value || '',
        e.target.value
      );
    });
  }

  const asociadoForm = document.getElementById('asociadoForm');
  if (asociadoForm) {
    asociadoForm.addEventListener('submit', async (e) => {
      e.preventDefault();

      const formMsg = document.getElementById('asociadoFormMsg');
      formMsg.textContent = modo === 'editar' ? 'Guardando cambios...' : 'Guardando asociado...';
      formMsg.className = 'message';

      const payload = {
        contacto: document.getElementById('contacto').value.trim(),
        cargo: document.getElementById('cargo').value.trim(),
        telefono: document.getElementById('telefono').value.trim(),
        empresa: document.getElementById('empresa').value.trim(),
        actividad: document.getElementById('actividad').value.trim(),
        direccion: document.getElementById('direccion').value.trim(),
        email: document.getElementById('email_asociado').value.trim(),
        estado: document.getElementById('estado').value
      };

      let response;

      if (modo === 'editar' && asociado?.id) {
        response = await supabase
          .from('asociados')
          .update(payload)
          .eq('id', asociado.id);
      } else {
        response = await supabase
          .from('asociados')
          .insert([payload]);
      }

      if (response.error) {
        formMsg.textContent = 'Error al guardar: ' + response.error.message;
        formMsg.className = 'message error';
        return;
      }

      formMsg.textContent = modo === 'editar'
        ? 'Cambios guardados correctamente'
        : 'Asociado guardado correctamente';
      formMsg.className = 'message success';

      setTimeout(async () => {
        await renderAsociadosInterna(false, 'nuevo', null, busqueda, estadoFiltro);
      }, 500);
    });
  }

  const editarBtns = document.querySelectorAll('.editar-btn');
  editarBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const asociadoEncontrado = (data || []).find(item => item.id === id);
      await renderAsociadosInterna(true, 'editar', asociadoEncontrado, busqueda, estadoFiltro);
    });
  });

  const bajaBtns = document.querySelectorAll('.baja-btn');
  bajaBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const ok = confirm('¿Seguro que quieres dar de baja este asociado?');
      if (!ok) return;

      const { error: bajaError } = await supabase
        .from('asociados')
        .update({ estado: 'baja' })
        .eq('id', id);

      if (bajaError) {
        alert('Error al dar de baja: ' + bajaError.message);
        return;
      }

      await renderAsociadosInterna(false, 'nuevo', null, busqueda, estadoFiltro);
    });
  });

  const eliminarBtns = document.querySelectorAll('.eliminar-btn');
  eliminarBtns.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const asociadoEncontrado = (data || []).find(item => item.id === id);
      if (!asociadoEncontrado) return;

      const ok = confirm('Esto archivará el asociado y luego lo eliminará definitivamente de la tabla activa. ¿Continuar?');
      if (!ok) return;

      const resultado = await archivarYEliminarAsociado(asociadoEncontrado);

      if (!resultado.ok) {
        alert(resultado.error);
        return;
      }

      await renderAsociadosInterna(false, 'nuevo', null, busqueda, estadoFiltro);
    });
  });
}

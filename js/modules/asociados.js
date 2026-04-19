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

export async function renderAsociadosView() {
  await renderAsociadosInterna('', 'todos');
}

async function renderAsociadosInterna(busqueda = '', estadoFiltro = 'todos') {
  setView('Asociados', '<p class="loading">Cargando asociados...</p>');

  const { data, error } = await supabase
    .from('vista_asociados_agrupados')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    setView('Asociados', `<p class="error">Error al cargar asociados: ${error.message}</p>`);
    return;
  }

  const dataFiltrada = filtrarAsociados(data || [], busqueda, estadoFiltro);
  const resumen = getResumen(dataFiltrada);
  const filtrosHTML = getFiltrosHTML(busqueda, estadoFiltro, resumen);

  const rows = dataFiltrada.map(item => `
    <tr>
      <td>${item.id}</td>
      <td>${nombreCompleto(item)}</td>
      <td>${item.telefono || ''}</td>
      <td>${item.email || ''}</td>
      <td>${item.poblacion || ''}</td>
      <td>${item.tipo_membresia || ''}</td>
      <td>${textoCuota(item)}</td>
      <td>${item.cargo_asume || ''}</td>
      <td>${item.empresas || ''}</td>
      <td><span class="${getEstadoClass(item.estado)}">${item.estado || ''}</span></td>
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
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="10">No hay asociados que coincidan con el filtro.</td></tr>'}
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

      await renderAsociadosInterna(nuevaBusqueda, nuevoEstado);
    });
  }

  const limpiarFiltrosBtn = document.getElementById('limpiarFiltrosBtn');
  if (limpiarFiltrosBtn) {
    limpiarFiltrosBtn.addEventListener('click', async () => {
      await renderAsociadosInterna('', 'todos');
    });
  }

  const nuevoAsociadoBtn = document.getElementById('nuevoAsociadoBtn');
  if (nuevoAsociadoBtn) {
    nuevoAsociadoBtn.addEventListener('click', () => {
      alert('Siguiente paso: formulario de nuevo asociado');
    });
  }

  const nuevaEmpresaBtn = document.getElementById('nuevaEmpresaBtn');
  if (nuevaEmpresaBtn) {
    nuevaEmpresaBtn.addEventListener('click', () => {
      alert('Siguiente paso: formulario de nueva empresa');
    });
  }

  const vincularBtn = document.getElementById('vincularBtn');
  if (vincularBtn) {
    vincularBtn.addEventListener('click', () => {
      alert('Siguiente paso: formulario para vincular asociado y empresa');
    });
  }
}

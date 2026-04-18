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

async function restaurarAsociado(item) {
  const payload = {
    contacto: item.contacto || '',
    cargo: item.cargo || '',
    telefono: item.telefono || '',
    empresa: item.empresa || '',
    actividad: item.actividad || '',
    direccion: item.direccion || '',
    email: item.email || '',
    estado: 'activo',
    user_id: item.user_id || null
  };

  const { error: insertError } = await supabase
    .from('asociados')
    .insert([payload]);

  if (insertError) {
    return {
      ok: false,
      error: 'Error al restaurar en asociados: ' + insertError.message
    };
  }

  const { error: deleteError } = await supabase
    .from('asociados_archivo')
    .delete()
    .eq('id', item.id);

  if (deleteError) {
    return {
      ok: false,
      error: 'Se restauró en activos, pero NO se pudo borrar del archivo: ' + deleteError.message
    };
  }

  return { ok: true };
}

export async function renderArchivoView() {
  setView('Archivo', '<p class="loading">Cargando archivo...</p>');

  const { data, error } = await supabase
    .from('asociados_archivo')
    .select('id, contacto, cargo, telefono, empresa, actividad, direccion, email, estado, user_id, archivado_at')
    .order('id', { ascending: false });

  if (error) {
    setView('Archivo', `<p class="error">Error al cargar archivo: ${error.message}</p>`);
    return;
  }

  const rows = (data || []).map(item => `
    <tr>
      <td>${item.id}</td>
      <td>${item.contacto || ''}</td>
      <td>${item.cargo || ''}</td>
      <td>${item.telefono || ''}</td>
      <td>${item.empresa || ''}</td>
      <td>${item.email || ''}</td>
      <td><span class="${getEstadoClass(item.estado)}">${item.estado || ''}</span></td>
      <td>${item.archivado_at || ''}</td>
      <td>
        <div class="table-actions">
          <button class="secondary-btn restaurar-btn" data-id="${item.id}">
            Restaurar
          </button>
        </div>
      </td>
    </tr>
  `).join('');

  setView('Archivo', `
    <div class="asociado-header">
      <div>
        <p style="margin:0;">Listado de asociados archivados.</p>
      </div>
    </div>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Contacto</th>
            <th>Cargo</th>
            <th>Teléfono</th>
            <th>Empresa</th>
            <th>Email</th>
            <th>Estado</th>
            <th>Archivado</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="9">No hay registros en archivo.</td></tr>'}
        </tbody>
      </table>
    </div>
  `);

  const botones = document.querySelectorAll('.restaurar-btn');

  botones.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const item = data.find(x => x.id === id);
      if (!item) return;

      const ok = confirm('¿Restaurar este asociado a la tabla activa?');
      if (!ok) return;

      btn.disabled = true;
      btn.textContent = 'Restaurando...';

      const resultado = await restaurarAsociado(item);

      if (!resultado.ok) {
        alert(resultado.error);
        btn.disabled = false;
        btn.textContent = 'Restaurar';
        return;
      }

      await renderArchivoView();
    });
  });
}

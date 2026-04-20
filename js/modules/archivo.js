import { supabase } from '../supabase.js';

function setView(title, html) {
  const viewTitle = document.getElementById('viewTitle');
  const viewContent = document.getElementById('viewContent');

  if (viewTitle) viewTitle.textContent = title;
  if (viewContent) viewContent.innerHTML = html;
}

export async function renderArchivoView() {
  setView('Archivo', '<p class="loading">Cargando archivo...</p>');

  const { data, error } = await supabase
    .from('asociados_nuevo_archivo')
    .select('*')
    .order('archived_at', { ascending: false });

  if (error) {
    setView('Archivo', `<p class="error">${error.message}</p>`);
    return;
  }

  const rows = (data || []).map(item => `
    <tr>
      <td>${item.id}</td>
      <td>${item.nombre || ''} ${item.apellidos || ''}</td>
      <td>${item.telefono || ''}</td>
      <td>${item.email || ''}</td>
      <td>${item.poblacion || ''}</td>
      <td>${item.tipo_membresia || ''}</td>
      <td>${item.paga_cuota ? 'Sí' : 'No'}</td>
      <td>${item.archived_at || ''}</td>
      <td>
        <button class="restaurarBtn" data-id="${item.id}">♻️ Restaurar</button>
      </td>
    </tr>
  `).join('');

  setView('Archivo', `
    <div class="form-card">
      <h2>Asociados eliminados</h2>

      <div class="table-wrap">
        <table>
          <thead>
            <tr>
              <th>ID original</th>
              <th>Nombre</th>
              <th>Teléfono</th>
              <th>Email</th>
              <th>Población</th>
              <th>Membresía</th>
              <th>Cuota</th>
              <th>Archivado</th>
              <th>Acciones</th>
            </tr>
          </thead>
          <tbody>
            ${rows || '<tr><td colspan="9">No hay datos en archivo</td></tr>'}
          </tbody>
        </table>
      </div>
    </div>
  `);

  const botones = document.querySelectorAll('.restaurarBtn');
  botones.forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      await restaurarAsociado(id);
    });
  });
}

async function restaurarAsociado(idOriginal) {
  const ok = confirm('Esto restaurará el asociado y sus relaciones. ¿Continuar?');
  if (!ok) return;

  // 1. Recuperar asociado archivado
  const { data: asociadoArchivado, error: errorAsociado } = await supabase
    .from('asociados_nuevo_archivo')
    .select('*')
    .eq('id', idOriginal)
    .single();

  if (errorAsociado || !asociadoArchivado) {
    alert('Error al recuperar asociado archivado: ' + (errorAsociado?.message || 'No encontrado'));
    return;
  }

  // 2. Insertar asociado en tabla activa y capturar ID nuevo
  const { data: asociadoInsertado, error: insertError } = await supabase
    .from('asociados_nuevo')
    .insert([{
      nombre: asociadoArchivado.nombre,
      apellidos: asociadoArchivado.apellidos,
      telefono: asociadoArchivado.telefono,
      email: asociadoArchivado.email,
      poblacion: asociadoArchivado.poblacion,
      tipo_membresia: asociadoArchivado.tipo_membresia,
      paga_cuota: asociadoArchivado.paga_cuota,
      cargo_asume: asociadoArchivado.cargo_asume,
      estado: asociadoArchivado.estado || 'activo',
      user_id: asociadoArchivado.user_id || null,
      created_at: asociadoArchivado.created_at || null
    }])
    .select()
    .single();

  if (insertError || !asociadoInsertado) {
    alert('Error al restaurar asociado: ' + (insertError?.message || 'No se pudo insertar'));
    return;
  }

  const nuevoAsociadoId = asociadoInsertado.id;

  // 3. Recuperar relaciones archivadas
  const { data: relacionesArchivadas, error: errorRelaciones } = await supabase
    .from('asociado_empresa_nuevo_archivo')
    .select('*')
    .eq('asociado_id_original', idOriginal);

  if (errorRelaciones) {
    alert('Asociado restaurado, pero hubo error al leer relaciones archivadas: ' + errorRelaciones.message);
    return;
  }

  // 4. Restaurar relaciones si existen
  if (relacionesArchivadas && relacionesArchivadas.length > 0) {
    const payloadRelaciones = relacionesArchivadas.map(rel => ({
      asociado_id: nuevoAsociadoId,
      empresa_id: rel.empresa_id,
      contacto_principal_empresa: rel.contacto_principal_empresa,
      observaciones: rel.observaciones || null,
      created_at: rel.created_at || null
    }));

    const { error: insertRelacionesError } = await supabase
      .from('asociado_empresa_nuevo')
      .insert(payloadRelaciones);

    if (insertRelacionesError) {
      alert('Asociado restaurado, pero hubo error al restaurar relaciones: ' + insertRelacionesError.message);
      return;
    }
  }

  // 5. Borrar del archivo solo cuando todo ha salido bien
  const { error: deleteArchivoAsociadoError } = await supabase
    .from('asociados_nuevo_archivo')
    .delete()
    .eq('id', idOriginal);

  if (deleteArchivoAsociadoError) {
    alert('Restaurado, pero no se pudo limpiar el archivo del asociado: ' + deleteArchivoAsociadoError.message);
    return;
  }

  const { error: deleteArchivoRelacionesError } = await supabase
    .from('asociado_empresa_nuevo_archivo')
    .delete()
    .eq('asociado_id_original', idOriginal);

  if (deleteArchivoRelacionesError) {
    alert('Restaurado, pero no se pudieron limpiar las relaciones archivadas: ' + deleteArchivoRelacionesError.message);
    return;
  }

  alert('Restaurado correctamente');
  await renderArchivoView();
}

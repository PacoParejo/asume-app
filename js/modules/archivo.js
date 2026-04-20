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
              <th>ID</th>
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
      const id = btn.dataset.id;
      await restaurarAsociado(id);
    });
  });
}

async function restaurarAsociado(id) {
  const ok = confirm('Esto restaurará el asociado y sus relaciones. ¿Continuar?');
  if (!ok) return;

  // 1. recuperar asociado
  const { data: asociado, error } = await supabase
    .from('asociados_nuevo_archivo')
    .select('*')
    .eq('id', id)
    .single();

  if (error) {
    alert('Error al recuperar asociado: ' + error.message);
    return;
  }

  // 2. insertar en tabla activa
  const { error: insertError } = await supabase
    .from('asociados_nuevo')
    .insert([{
      nombre: asociado.nombre,
      apellidos: asociado.apellidos,
      telefono: asociado.telefono,
      email: asociado.email,
      poblacion: asociado.poblacion,
      tipo_membresia: asociado.tipo_membresia,
      paga_cuota: asociado.paga_cuota,
      cargo_asume: asociado.cargo_asume,
      estado: 'activo'
    }])
    .select()
    .single();

  if (insertError) {
    alert('Error al restaurar asociado: ' + insertError.message);
    return;
  }

  // 3. recuperar relaciones
  const { data: relaciones } = await supabase
    .from('asociado_empresa_nuevo_archivo')
    .select('*')
    .eq('asociado_id_original', id);

  if (relaciones && relaciones.length > 0) {
    const payload = relaciones.map(r => ({
      asociado_id: insertError?.id || null,
      empresa_id: r.empresa_id,
      contacto_principal_empresa: r.contacto_principal_empresa
    }));

    await supabase.from('asociado_empresa_nuevo').insert(payload);
  }

  // 4. borrar del archivo
  await supabase
    .from('asociados_nuevo_archivo')
    .delete()
    .eq('id', id);

  await supabase
    .from('asociado_empresa_nuevo_archivo')
    .delete()
    .eq('asociado_id_original', id);

  alert('Restaurado correctamente');

  renderArchivoView();
}

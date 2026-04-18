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
    .from('asociados_archivo')
    .select('*')
    .order('id', { ascending: true });

  if (error) {
    setView('Archivo', `<p class="error">Error: ${error.message}</p>`);
    return;
  }

  const rows = (data || []).map(item => `
    <tr>
      <td>${item.id}</td>
      <td>${item.contacto || ''}</td>
      <td>${item.empresa || ''}</td>
      <td>${item.telefono || ''}</td>
      <td>${item.email || ''}</td>
      <td>
        <button class="secondary-btn restaurar-btn" data-id="${item.id}">
          Restaurar
        </button>
      </td>
    </tr>
  `).join('');

  setView('Archivo', `
    <p>Asociados archivados.</p>

    <div class="table-wrap">
      <table>
        <thead>
          <tr>
            <th>ID</th>
            <th>Contacto</th>
            <th>Empresa</th>
            <th>Teléfono</th>
            <th>Email</th>
            <th>Acción</th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="6">No hay registros</td></tr>'}
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

      const payload = {
        contacto: item.contacto,
        cargo: item.cargo,
        telefono: item.telefono,
        empresa: item.empresa,
        actividad: item.actividad,
        direccion: item.direccion,
        email: item.email,
        estado: 'activo',
        user_id: item.user_id
      };

      // insertar en activos
      const { error: insertError } = await supabase
        .from('asociados')
        .insert([payload]);

      if (insertError) {
        alert(insertError.message);
        return;
      }

      // borrar del archivo
      await supabase
        .from('asociados_archivo')
        .delete()
        .eq('id', id);

      await renderArchivoView();
    });
  });
}

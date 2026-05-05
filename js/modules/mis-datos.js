import { supabase } from '../supabase.js';

function setView(title, html) {
  const viewTitle = document.getElementById('viewTitle');
  const viewContent = document.getElementById('viewContent');

  if (viewTitle) viewTitle.textContent = title;
  if (viewContent) viewContent.innerHTML = html;
}

function safe(v) {
  return v || '';
}

function getFormHTML(profile = {}) {
  return `
    <div class="form-card">
      <h3>Mis datos</h3>

      <form id="misDatosForm">
        <div class="form-grid">

          <div>
            <label>Nombre</label>
            <input type="text" id="nombre" value="${safe(profile.nombre)}" />
          </div>

          <div>
            <label>Email</label>
            <input type="email" value="${safe(profile.email)}" disabled />
          </div>

          <div>
            <label>Teléfono</label>
            <input type="text" id="telefono" value="${safe(profile.telefono)}" />
          </div>

          <div>
            <label>Población</label>
            <input type="text" id="poblacion" value="${safe(profile.poblacion)}" />
          </div>

        </div>

        <div class="top-actions" style="margin-top:16px;">
          <button type="submit">Guardar cambios</button>
        </div>
      </form>

      <div id="msg" class="message"></div>
    </div>
  `;
}

export async function renderMisDatos() {

  setView('Mis datos', '<p class="loading">Cargando...</p>');

  // 👉 usuario actual
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user;

  if (!user) {
    setView('Mis datos', '<p class="error">No hay sesión</p>');
    return;
  }

  // 👉 profile
  const { data: profile, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .single();

  if (error) {
    setView('Mis datos', `<p class="error">${error.message}</p>`);
    return;
  }

  setView('Mis datos', getFormHTML(profile));

  // 👉 guardar cambios
  const form = document.getElementById('misDatosForm');

  form.addEventListener('submit', async (e) => {
    e.preventDefault();

    const msg = document.getElementById('msg');
    msg.textContent = 'Guardando...';

    const nuevo = {
      nombre: document.getElementById('nombre').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      poblacion: document.getElementById('poblacion').value.trim()
    };

    // 👉 detectar cambios
    const cambios = [];

    ['nombre','telefono','poblacion'].forEach(campo => {
      const antes = profile[campo] || '';
      const despues = nuevo[campo] || '';

      if (antes !== despues) {
        cambios.push({
          campo,
          antes,
          despues
        });
      }
    });

    // 👉 update profile
    const { error: updateError } = await supabase
      .from('profiles')
      .update(nuevo)
      .eq('id', user.id);

    if (updateError) {
      msg.textContent = 'Error: ' + updateError.message;
      return;
    }

    // 👉 guardar notificaciones SOLO si hay cambios
    for (const c of cambios) {
      await supabase.from('notificaciones').insert([{
        user_id: user.id,
        tipo: 'cambio_datos',
        entidad: 'profile',
        campo: c.campo,
        valor_anterior: c.antes,
        valor_nuevo: c.despues,
        mensaje: `Cambio en ${c.campo}`
      }]);
    }

    msg.textContent = 'Datos actualizados correctamente';
  });
}

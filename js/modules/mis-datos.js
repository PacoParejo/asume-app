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

async function cargarProfile(user) {
  const { data, error } = await supabase
    .from('profiles')
    .select('*')
    .eq('id', user.id)
    .maybeSingle();

  if (error) {
    return { profile: null, error };
  }

  if (data) {
    return { profile: data, error: null };
  }

  const nuevoProfile = {
    id: user.id,
    email: user.email || '',
    role: 'asociado',
    nombre: '',
    telefono: '',
    poblacion: ''
  };

  const { data: creado, error: insertError } = await supabase
    .from('profiles')
    .insert([nuevoProfile])
    .select()
    .single();

  if (insertError) {
    return { profile: null, error: insertError };
  }

  return { profile: creado, error: null };
}

async function guardarNotificaciones(userId, cambios = []) {
  if (!cambios.length) return;

  const payload = cambios.map(cambio => ({
    user_id: userId,
    tipo: 'cambio_datos',
    entidad: 'profile',
    campo: cambio.campo,
    valor_anterior: cambio.antes,
    valor_nuevo: cambio.despues,
    mensaje: `Cambio en ${cambio.campo}`
  }));

  await supabase
    .from('notificaciones')
    .insert(payload);
}

export async function renderMisDatos() {
  setView('Mis datos', '<p class="loading">Cargando...</p>');

  const { data: userData, error: userError } = await supabase.auth.getUser();
  const user = userData?.user;

  if (userError || !user) {
    setView('Mis datos', '<p class="error">No hay sesión activa.</p>');
    return;
  }

  const { profile, error } = await cargarProfile(user);

  if (error) {
    setView('Mis datos', `<p class="error">Error al cargar perfil: ${error.message}</p>`);
    return;
  }

  setView('Mis datos', getFormHTML(profile));

  const form = document.getElementById('misDatosForm');

  form?.addEventListener('submit', async (e) => {
    e.preventDefault();

    const msg = document.getElementById('msg');
    msg.textContent = 'Guardando...';
    msg.className = 'message';

    const nuevo = {
      id: user.id,
      email: profile.email || user.email || '',
      role: profile.role || 'asociado',
      nombre: document.getElementById('nombre').value.trim(),
      telefono: document.getElementById('telefono').value.trim(),
      poblacion: document.getElementById('poblacion').value.trim()
    };

    const cambios = [];

    ['nombre', 'telefono', 'poblacion'].forEach(campo => {
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

    const { error: saveError } = await supabase
      .from('profiles')
      .upsert(nuevo, { onConflict: 'id' });

    if (saveError) {
      msg.textContent = 'Error al guardar: ' + saveError.message;
      msg.className = 'message error';
      return;
    }

    await guardarNotificaciones(user.id, cambios);

    const { profile: actualizado, error: reloadError } = await cargarProfile(user);

    if (reloadError) {
      msg.textContent = 'Guardado, pero no se pudo recargar: ' + reloadError.message;
      msg.className = 'message error';
      return;
    }

    setView('Mis datos', getFormHTML(actualizado));

    const nuevoMsg = document.getElementById('msg');
    if (nuevoMsg) {
      nuevoMsg.textContent = 'Datos actualizados correctamente';
      nuevoMsg.className = 'message success';
    }
  });
}

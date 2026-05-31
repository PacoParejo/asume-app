
import { supabase } from '../supabase.js';

function setView(title, html) {
  const viewTitle = document.getElementById('viewTitle');
  const viewContent = document.getElementById('viewContent');

  if (viewTitle) viewTitle.textContent = title;
  if (viewContent) viewContent.innerHTML = html;
}

async function getCurrentUserAndRole() {
  const { data: userData } = await supabase.auth.getUser();
  const user = userData?.user || null;

  if (!user) return { user: null, role: 'publico' };

  const { data: profile } = await supabase
    .from('profiles')
    .select('role')
    .eq('id', user.id)
    .single();

  return {
    user,
    role: profile?.role || 'asociado'
  };
}

function safe(value) {
  return value || '';
}

function getAvisoFormHTML() {
  return `
    <div class="form-card">
      <h3>Nuevo aviso</h3>

      <form id="avisoForm">
        <div class="form-grid">

          <div>
            <label>Título *</label>
            <input type="text" id="aviso_titulo" required />
          </div>

          <div>
            <label>Tipo</label>
            <select id="aviso_tipo">
              <option value="aviso">Aviso</option>
              <option value="evento">Evento</option>
              <option value="subvencion">Subvención</option>
              <option value="noticia">Noticia</option>
              <option value="urgente">Urgente</option>
            </select>
          </div>

          <div class="full-width">
            <label>Contenido *</label>
            <textarea id="aviso_contenido" rows="5" required></textarea>
          </div>

          <div>
            <label>Destacado</label>
            <select id="aviso_destacado">
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>
          </div>

        </div>

        <div class="top-actions" style="margin-top:16px;">
          <button type="submit">Publicar aviso</button>
        </div>
      </form>

      <div id="avisoMsg" class="message"></div>
    </div>
  `;
}

function getAvisosHTML(avisos = [], esSuperadmin = false) {
  if (!avisos.length) {
    return `
      <div class="form-card">
        <h3>Avisos internos</h3>
        <p class="helper">Todavía no hay avisos publicados.</p>
      </div>
    `;
  }

  return `
    <div class="avisos-grid">
      ${avisos.map(aviso => `
        <article class="aviso-card ${aviso.destacado ? 'aviso-destacado' : ''}">
          <div class="aviso-top">
            <span class="aviso-tipo">${safe(aviso.tipo)}</span>
            ${aviso.destacado ? '<span class="aviso-star">⭐ Destacado</span>' : ''}
          </div>

          <h3>${safe(aviso.titulo)}</h3>

          <p>${safe(aviso.contenido)}</p>

          <small>
            ${aviso.created_at ? new Date(aviso.created_at).toLocaleString('es-ES') : ''}
          </small>

          ${esSuperadmin ? `
            <div class="table-actions" style="margin-top:14px;">
              <button class="secondary-btn toggleDestacadoAvisoBtn" data-id="${aviso.id}" data-destacado="${aviso.destacado}">
                ${aviso.destacado ? 'Quitar destacado' : 'Destacar'}
              </button>

              <button class="danger-btn ocultarAvisoBtn" data-id="${aviso.id}">
                Ocultar
              </button>
            </div>
          ` : ''}
        </article>
      `).join('')}
    </div>
  `;
}

export async function renderAvisosView() {
  setView('Avisos internos', '<p class="loading">Cargando avisos...</p>');

  const { user, role } = await getCurrentUserAndRole();
  const esSuperadmin = role === 'superadmin';

  let query = supabase
    .from('avisos')
    .select('*')
    .order('destacado', { ascending: false })
    .order('created_at', { ascending: false });

  if (!esSuperadmin) {
    query = query.eq('visible', true);
  }

  const { data: avisos, error } = await query;

  if (error) {
    setView('Avisos internos', `<p class="error">Error al cargar avisos: ${error.message}</p>`);
    return;
  }

  setView('Avisos internos', `
    <div class="asociado-header">
      <div>
        <p>Noticias, avisos y comunicaciones internas de ASUME.</p>
      </div>
      ${esSuperadmin ? `
        <div class="table-actions">
          <button id="nuevoAvisoBtn">➕ Nuevo aviso</button>
        </div>
      ` : ''}
    </div>

    <div id="nuevoAvisoBox"></div>

    ${getAvisosHTML(avisos || [], esSuperadmin)}
  `);

  document.getElementById('nuevoAvisoBtn')?.addEventListener('click', () => {
    const box = document.getElementById('nuevoAvisoBox');
    box.innerHTML = getAvisoFormHTML();

    const form = document.getElementById('avisoForm');

    form?.addEventListener('submit', async (e) => {
      e.preventDefault();

      const msg = document.getElementById('avisoMsg');
      msg.textContent = 'Publicando aviso...';
      msg.className = 'message';

      const payload = {
        titulo: document.getElementById('aviso_titulo').value.trim(),
        contenido: document.getElementById('aviso_contenido').value.trim(),
        tipo: document.getElementById('aviso_tipo').value,
        destacado: document.getElementById('aviso_destacado').value === 'true',
        visible: true,
        created_by: user?.id || null
      };

      const { error: insertError } = await supabase
        .from('avisos')
        .insert([payload]);

      if (insertError) {
        msg.textContent = 'Error al publicar aviso: ' + insertError.message;
        msg.className = 'message error';
        return;
      }

      msg.textContent = 'Aviso publicado correctamente';
      msg.className = 'message success';

      setTimeout(() => renderAvisosView(), 600);
    });
  });

  document.querySelectorAll('.toggleDestacadoAvisoBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const destacadoActual = btn.dataset.destacado === 'true';

      const { error: updateError } = await supabase
        .from('avisos')
        .update({ destacado: !destacadoActual })
        .eq('id', id);

      if (updateError) {
        alert('Error al actualizar aviso: ' + updateError.message);
        return;
      }

      renderAvisosView();
    });
  });

  document.querySelectorAll('.ocultarAvisoBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);

      const ok = confirm('¿Seguro que quieres ocultar este aviso?');
      if (!ok) return;

      const { error: updateError } = await supabase
        .from('avisos')
        .update({ visible: false })
        .eq('id', id);

      if (updateError) {
        alert('Error al ocultar aviso: ' + updateError.message);
        return;
      }

      renderAvisosView();
    });
  });
}


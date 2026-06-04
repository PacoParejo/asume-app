import { supabase } from '../supabase.js';
import {
  getAvisoFormHTML,
  activarFormularioAviso
} from './avisos-form.js';

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
    role: (profile?.role || 'asociado').trim().toLowerCase()
  };
}

function safe(value) {
  return value || '';
}

function isAvisoCaducado(aviso) {
  if (!aviso.fecha_caducidad) return false;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const caducidad = new Date(aviso.fecha_caducidad);
  caducidad.setHours(0, 0, 0, 0);

  return caducidad < hoy;
}

function getTipoLabel(tipo) {
  const map = {
    aviso: '📢 Aviso',
    noticia: '📰 Noticia',
    evento: '📅 Evento',
    formacion: '🎓 Formación',
    oportunidad: '💼 Oportunidad',
    subvencion: '💰 Subvención',
    urgente: '⚠️ Urgente'
  };

  return map[tipo] || '📢 Aviso';
}

function getDestinatarioLabel(destinatario) {
  const map = {
    todos: 'Todos',
    asociados: 'Asociados',
    junta: 'Junta Directiva',
    presidencia: 'Presidencia',
    tesoreria: 'Tesorería',
    secretaria: 'Secretaría'
  };

  return map[destinatario] || 'Todos';
}

function getAvisoCardHTML(aviso, esSuperadmin = false) {
  const caducado = isAvisoCaducado(aviso);

  return `
    <article class="aviso-card ${aviso.destacado ? 'aviso-destacado' : ''} ${caducado ? 'aviso-caducado' : ''}">

      <div class="aviso-top">
        <span class="aviso-tipo">${getTipoLabel(aviso.tipo)}</span>

        ${aviso.destacado ? `
          <span class="aviso-star">⭐ Destacado</span>
        ` : ''}

        ${caducado ? `
          <span class="aviso-caducidad-badge">⏳ Caducado</span>
        ` : ''}
      </div>

      ${aviso.imagen_url ? `
        <div class="aviso-image-wrap">
          <img
            src="${safe(aviso.imagen_url)}"
            alt="${safe(aviso.titulo)}"
            class="aviso-image"
          />
        </div>
      ` : ''}

      <h3>${safe(aviso.titulo)}</h3>

      <p>${safe(aviso.contenido)}</p>

      <small>
        ${aviso.created_at ? new Date(aviso.created_at).toLocaleString('es-ES') : ''}
      </small>

      ${aviso.enlace ? `
        <br />
        <a
          href="${safe(aviso.enlace)}"
          target="_blank"
          rel="noopener"
          class="aviso-link"
        >
          🔗 Ver enlace
        </a>
      ` : ''}

      ${esSuperadmin ? `
        <div class="table-actions" style="margin-top:14px;">
          <button class="secondary-btn editarAvisoBtn" data-id="${aviso.id}">
            Editar
          </button>

          <button
            class="secondary-btn toggleDestacadoAvisoBtn"
            data-id="${aviso.id}"
            data-destacado="${aviso.destacado}"
          >
            ${aviso.destacado ? 'Quitar destacado' : 'Destacar'}
          </button>

          <button
            class="secondary-btn toggleVisibleAvisoBtn"
            data-id="${aviso.id}"
            data-visible="${aviso.visible}"
          >
            ${aviso.visible ? 'Ocultar' : 'Mostrar'}
          </button>

          <button class="danger-btn eliminarAvisoBtn" data-id="${aviso.id}">
            Eliminar
          </button>
        </div>
      ` : ''}
    </article>
  `;
}

function getSeccionAvisosHTML(titulo, avisos, esSuperadmin) {
  if (!avisos.length) return '';

  return `
    <section class="avisos-section">
      <h3 class="avisos-section-title">${titulo}</h3>

      <div class="avisos-grid">
        ${avisos.map(aviso => getAvisoCardHTML(aviso, esSuperadmin)).join('')}
      </div>
    </section>
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

  const destacados = avisos.filter(aviso => aviso.destacado);
  const normales = avisos.filter(aviso => !aviso.destacado);

  const grupos = [
    {
      key: 'todos',
      titulo: '🌍 Avisos para todos'
    },
    {
      key: 'asociados',
      titulo: '👥 Avisos para asociados'
    },
    {
      key: 'junta',
      titulo: '🏛️ Avisos para Junta Directiva'
    },
    {
      key: 'presidencia',
      titulo: '👔 Avisos para Presidencia'
    },
    {
      key: 'tesoreria',
      titulo: '💶 Avisos para Tesorería'
    },
    {
      key: 'secretaria',
      titulo: '📝 Avisos para Secretaría'
    }
  ];

  return `
    ${getSeccionAvisosHTML('⭐ Avisos destacados', destacados, esSuperadmin)}

    ${grupos.map(grupo => {
      const avisosGrupo = normales.filter(aviso =>
        (aviso.destinatario || 'todos') === grupo.key
      );

      return getSeccionAvisosHTML(grupo.titulo, avisosGrupo, esSuperadmin);
    }).join('')}
  `;
}
async function getAvisosLeidos(usuarioId) {
  const { data, error } = await supabase
    .from('avisos_leidos')
    .select('aviso_id')
    .eq('usuario_id', usuarioId);

  if (error) {
    console.error(error);
    return [];
  }

  return data.map(item => item.aviso_id);
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
  const hoy = new Date().toISOString().slice(0, 10);

  query = query
    .eq('visible', true)
    .in('destinatario', ['todos', 'asociados'])
    .or(`fecha_caducidad.is.null,fecha_caducidad.gte.${hoy}`);
}

  const { data: avisos, error } = await query;

  if (error) {
    setView(
      'Avisos internos',
      `<p class="error">Error al cargar avisos: ${error.message}</p>`
    );
    return;
  }

  const listaAvisos = avisos || [];

  setView('Avisos internos', `
    <div class="asociado-header">
      <div>
        <h3>Avisos internos</h3>
        <p>Noticias, avisos y comunicaciones internas de ASUME.</p>
      </div>

      ${esSuperadmin ? `
        <div class="table-actions">
          <button id="nuevoAvisoBtn">➕ Nuevo aviso</button>
        </div>
      ` : ''}
    </div>

    <div id="nuevoAvisoBox"></div>

    ${getAvisosHTML(listaAvisos, esSuperadmin)}
  `);

  document.getElementById('nuevoAvisoBtn')?.addEventListener('click', () => {
    const box = document.getElementById('nuevoAvisoBox');
    if (!box) return;

    box.innerHTML = getAvisoFormHTML();

    activarFormularioAviso(user, () => {
      renderAvisosView();
    });

    document.getElementById('cancelarAvisoBtn')?.addEventListener('click', () => {
      box.innerHTML = '';
    });
  });

  document.querySelectorAll('.editarAvisoBtn').forEach(btn => {
    btn.addEventListener('click', () => {
      const id = Number(btn.dataset.id);
      const aviso = listaAvisos.find(item => item.id === id);

      const box = document.getElementById('nuevoAvisoBox');
      if (!box || !aviso) return;

      box.innerHTML = getAvisoFormHTML(aviso);

      activarFormularioAviso(user, () => {
        renderAvisosView();
      });

      document.getElementById('cancelarAvisoBtn')?.addEventListener('click', () => {
        box.innerHTML = '';
      });

      box.scrollIntoView({
        behavior: 'smooth',
        block: 'start'
      });
    });
  });

  document.querySelectorAll('.toggleDestacadoAvisoBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const destacadoActual = btn.dataset.destacado === 'true';

      const { error } = await supabase
        .from('avisos')
        .update({ destacado: !destacadoActual })
        .eq('id', id);

      if (error) {
        alert('Error al actualizar destacado: ' + error.message);
        return;
      }

      renderAvisosView();
    });
  });

  document.querySelectorAll('.toggleVisibleAvisoBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);
      const visibleActual = btn.dataset.visible === 'true';

      const { error } = await supabase
        .from('avisos')
        .update({ visible: !visibleActual })
        .eq('id', id);

      if (error) {
        alert('Error al actualizar visibilidad: ' + error.message);
        return;
      }

      renderAvisosView();
    });
  });

  document.querySelectorAll('.eliminarAvisoBtn').forEach(btn => {
    btn.addEventListener('click', async () => {
      const id = Number(btn.dataset.id);

      const ok = confirm('¿Seguro que quieres eliminar definitivamente este aviso?');
      if (!ok) return;

      const { error } = await supabase
        .from('avisos')
        .delete()
        .eq('id', id);

      if (error) {
        alert('Error al eliminar aviso: ' + error.message);
        return;
      }

      renderAvisosView();
    });
  });
}

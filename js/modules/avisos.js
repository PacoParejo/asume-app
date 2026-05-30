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

function getPrioridadLabel(prioridad) {
  const map = {
    normal: 'Normal',
    importante: 'Importante',
    critica: 'Crítica'
  };

  return map[prioridad] || 'Normal';
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

function isAvisoCaducado(aviso) {
  if (!aviso.fecha_caducidad) return false;

  const hoy = new Date();
  hoy.setHours(0, 0, 0, 0);

  const caducidad = new Date(aviso.fecha_caducidad);
  caducidad.setHours(0, 0, 0, 0);

  return caducidad < hoy;
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
      ${avisos.map(aviso => {
        const caducado = isAvisoCaducado(aviso);

        return `
          <article class="
            aviso-card
            ${aviso.destacado ? 'aviso-destacado' : ''}
            aviso-prioridad-${safe(aviso.prioridad)}
            ${caducado ? 'aviso-caducado' : ''}
          ">

            <div class="aviso-top">
              <span class="aviso-tipo">
                ${getTipoLabel(aviso.tipo)}
              </span>

              <span class="aviso-prioridad">
                ${getPrioridadLabel(aviso.prioridad)}
              </span>

              ${aviso.destacado ? `
                <span class="aviso-star">
                  ⭐ Destacado
                </span>
              ` : ''}

              ${caducado ? `
                <span class="aviso-caducidad-badge">
                  ⏳ Caducado
                </span>
              ` : ''}
            </div>

            <h3>${safe(aviso.titulo)}</h3>

            <p>${safe(aviso.contenido)}</p>

            <div class="aviso-meta">
              <span>
                👥 ${getDestinatarioLabel(aviso.destinatario)}
              </span>

              ${
                aviso.fecha_caducidad
                  ? `<span>📅 Caduca: ${new Date(aviso.fecha_caducidad).toLocaleDateString('es-ES')}</span>`
                  : ''
              }

              <span>
                🕒 ${aviso.created_at ? new Date(aviso.created_at).toLocaleString('es-ES') : ''}
              </span>
            </div>

            ${
              aviso.enlace
                ? `
                  <a
                    href="${safe(aviso.enlace)}"
                    target="_blank"
                    rel="noopener"
                    class="aviso-link"
                  >
                    🔗 Ver enlace
                  </a>
                `
                : ''
            }

            ${esSuperadmin ? `
              <div class="table-actions" style="margin-top:14px;">
                <button
                  class="secondary-btn toggleDestacadoAvisoBtn"
                  data-id="${aviso.id}"
                  data-destacado="${aviso.destacado}"
                >
                  ${aviso.destacado ? 'Quitar destacado' : 'Destacar'}
                </button>

                <button
                  class="danger-btn ocultarAvisoBtn"
                  data-id="${aviso.id}"
                >
                  Ocultar
                </button>
              </div>
            ` : ''}
          </article>
        `;
      }).join('')}
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
    const hoy = new Date().toISOString().slice(0, 10);

    query = query
      .eq('visible', true)
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

  setView('Avisos internos', `
    <div class="asociado-header">
      <div>
        <p>
          Noticias, avisos y comunicaciones internas de ASUME.
        </p>
      </div>

      ${esSuperadmin ? `
        <div class="table-actions">
          <button id="nuevoAvisoBtn">
            ➕ Nuevo aviso
          </button>
        </div>
      ` : ''}
    </div>

    <div id="nuevoAvisoBox"></div>

    ${getAvisosHTML(avisos || [], esSuperadmin)}
  `);

  document.getElementById('nuevoAvisoBtn')?.addEventListener('click', () => {
    const box = document.getElementById('nuevoAvisoBox');

    if (!box) return;

    box.innerHTML = getAvisoFormHTML();

    activarFormularioAviso(user, () => {
      renderAvisosView();
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

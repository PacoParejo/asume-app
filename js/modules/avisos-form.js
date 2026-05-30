import { supabase } from '../supabase.js';

export function getAvisoFormHTML() {
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
              <option value="aviso">📢 Aviso</option>
              <option value="noticia">📰 Noticia</option>
              <option value="evento">📅 Evento</option>
              <option value="formacion">🎓 Formación</option>
              <option value="oportunidad">💼 Oportunidad</option>
              <option value="subvencion">💰 Subvención</option>
              <option value="urgente">⚠️ Urgente</option>
            </select>
          </div>

          <div>
            <label>Prioridad</label>
            <select id="aviso_prioridad">
              <option value="normal">Normal</option>
              <option value="importante">Importante</option>
              <option value="critica">Crítica</option>
            </select>
          </div>

          <div>
            <label>Destinatario</label>
            <select id="aviso_destinatario">
              <option value="todos">Todos</option>
              <option value="asociados">Asociados</option>
              <option value="junta">Junta Directiva</option>
              <option value="presidencia">Presidencia</option>
              <option value="tesoreria">Tesorería</option>
              <option value="secretaria">Secretaría</option>
            </select>
          </div>

          <div>
            <label>Fecha de caducidad</label>
            <input type="date" id="aviso_fecha_caducidad" />
          </div>

          <div>
            <label>Destacado</label>
            <select id="aviso_destacado">
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>
          </div>

          <div class="full-width">
            <label>Enlace opcional</label>
            <input
              type="url"
              id="aviso_enlace"
              placeholder="https://..."
            />
          </div>

          <div class="full-width">
            <label>Contenido *</label>
            <textarea id="aviso_contenido" rows="5" required></textarea>
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

export function activarFormularioAviso(user, onSuccess) {
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
      prioridad: document.getElementById('aviso_prioridad').value,
      destinatario: document.getElementById('aviso_destinatario').value,
      fecha_caducidad:
        document.getElementById('aviso_fecha_caducidad').value || null,
      enlace: document.getElementById('aviso_enlace').value.trim() || null,
      destacado: document.getElementById('aviso_destacado').value === 'true',
      visible: true,
      created_by: user?.id || null
    };

    if (!payload.titulo || !payload.contenido) {
      msg.textContent = 'Faltan campos obligatorios.';
      msg.className = 'message error';
      return;
    }

    const { error } = await supabase
      .from('avisos')
      .insert([payload]);

    if (error) {
      msg.textContent = 'Error al publicar aviso: ' + error.message;
      msg.className = 'message error';
      return;
    }

    msg.textContent = 'Aviso publicado correctamente';
    msg.className = 'message success';

    setTimeout(() => {
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    }, 600);
  });
}

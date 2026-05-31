import { supabase } from '../supabase.js';

const BUCKET_AVISOS = 'avisos';

function limpiarNombreArchivo(nombre) {
  return nombre
    .toLowerCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-z0-9.-]/g, '-')
    .replace(/-+/g, '-');
}

async function subirImagenAviso(file, userId) {
  if (!file) return null;

  const extension = file.name.split('.').pop();
  const nombreLimpio = limpiarNombreArchivo(file.name);
  const ruta = `${userId || 'anonimo'}/${Date.now()}-${nombreLimpio}`;

  const { error } = await supabase
    .storage
    .from(BUCKET_AVISOS)
    .upload(ruta, file, {
      cacheControl: '3600',
      upsert: false
    });

  if (error) {
    throw new Error(error.message);
  }

  const { data } = supabase
    .storage
    .from(BUCKET_AVISOS)
    .getPublicUrl(ruta);

  return data.publicUrl;
}

export function getAvisoFormHTML(aviso = null) {
  const editando = Boolean(aviso);

  return `
    <div class="form-card aviso-form-card">
      <h3>${editando ? 'Editar aviso' : 'Nuevo aviso'}</h3>

      <form id="avisoForm">
        <input type="hidden" id="aviso_id" value="${aviso?.id || ''}" />

        <div class="form-grid">

          <div class="full-width">
            <label>Título *</label>
            <input type="text" id="aviso_titulo" required value="${aviso?.titulo || ''}" />
          </div>

          <div>
            <label>Tipo</label>
            <select id="aviso_tipo">
              <option value="aviso" ${aviso?.tipo === 'aviso' ? 'selected' : ''}>📢 Aviso</option>
              <option value="noticia" ${aviso?.tipo === 'noticia' ? 'selected' : ''}>📰 Noticia</option>
              <option value="evento" ${aviso?.tipo === 'evento' ? 'selected' : ''}>📅 Evento</option>
              <option value="formacion" ${aviso?.tipo === 'formacion' ? 'selected' : ''}>🎓 Formación</option>
              <option value="oportunidad" ${aviso?.tipo === 'oportunidad' ? 'selected' : ''}>💼 Oportunidad</option>
              <option value="subvencion" ${aviso?.tipo === 'subvencion' ? 'selected' : ''}>💰 Subvención</option>
              <option value="urgente" ${aviso?.tipo === 'urgente' ? 'selected' : ''}>⚠️ Urgente</option>
            </select>
          </div>

          <div>
            <label>Prioridad</label>
            <select id="aviso_prioridad">
              <option value="normal" ${aviso?.prioridad === 'normal' ? 'selected' : ''}>Normal</option>
              <option value="importante" ${aviso?.prioridad === 'importante' ? 'selected' : ''}>Importante</option>
              <option value="critica" ${aviso?.prioridad === 'critica' ? 'selected' : ''}>Crítica</option>
            </select>
          </div>

          <div>
            <label>Destinatario</label>
            <select id="aviso_destinatario">
              <option value="todos" ${aviso?.destinatario === 'todos' ? 'selected' : ''}>Todos</option>
              <option value="asociados" ${aviso?.destinatario === 'asociados' ? 'selected' : ''}>Asociados</option>
              <option value="junta" ${aviso?.destinatario === 'junta' ? 'selected' : ''}>Junta Directiva</option>
              <option value="presidencia" ${aviso?.destinatario === 'presidencia' ? 'selected' : ''}>Presidencia</option>
              <option value="tesoreria" ${aviso?.destinatario === 'tesoreria' ? 'selected' : ''}>Tesorería</option>
              <option value="secretaria" ${aviso?.destinatario === 'secretaria' ? 'selected' : ''}>Secretaría</option>
            </select>
          </div>

          <div>
            <label>Fecha de caducidad</label>
            <input type="date" id="aviso_fecha_caducidad" value="${aviso?.fecha_caducidad || ''}" />
          </div>

          <div>
            <label>Destacado</label>
            <select id="aviso_destacado">
              <option value="false" ${!aviso?.destacado ? 'selected' : ''}>No</option>
              <option value="true" ${aviso?.destacado ? 'selected' : ''}>Sí</option>
            </select>
          </div>

          <div>
            <label>Visible</label>
            <select id="aviso_visible">
              <option value="true" ${aviso?.visible !== false ? 'selected' : ''}>Sí</option>
              <option value="false" ${aviso?.visible === false ? 'selected' : ''}>No</option>
            </select>
          </div>

          <div class="full-width">
            <label>Imagen del aviso</label>
            <input type="file" id="aviso_imagen" accept="image/*" />

            ${
              aviso?.imagen_url
                ? `<div class="aviso-preview-wrap">
                    <p class="helper">Imagen actual:</p>
                    <img src="${aviso.imagen_url}" alt="Imagen actual del aviso" class="aviso-form-preview" />
                  </div>`
                : ''
            }
          </div>

          <div class="full-width">
            <label>Enlace opcional</label>
            <input type="url" id="aviso_enlace" placeholder="https://..." value="${aviso?.enlace || ''}" />
          </div>

          <div class="full-width">
            <label>Contenido *</label>
            <textarea id="aviso_contenido" rows="6" required>${aviso?.contenido || ''}</textarea>
          </div>

        </div>

        <div class="top-actions" style="margin-top:16px;">
          <button type="submit">
            ${editando ? 'Guardar cambios' : 'Publicar aviso'}
          </button>

          <button type="button" id="cancelarAvisoBtn" class="secondary-btn">
            Cancelar
          </button>
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
    msg.textContent = 'Guardando aviso...';
    msg.className = 'message';

    const id = document.getElementById('aviso_id').value;
    const file = document.getElementById('aviso_imagen')?.files?.[0] || null;

    let imagenUrl = null;

    try {
      if (file) {
        msg.textContent = 'Subiendo imagen...';
        imagenUrl = await subirImagenAviso(file, user?.id);
      }
    } catch (error) {
      msg.textContent = 'Error al subir imagen: ' + error.message;
      msg.className = 'message error';
      return;
    }

    const payload = {
      titulo: document.getElementById('aviso_titulo').value.trim(),
      contenido: document.getElementById('aviso_contenido').value.trim(),
      tipo: document.getElementById('aviso_tipo').value,
      prioridad: document.getElementById('aviso_prioridad').value,
      destinatario: document.getElementById('aviso_destinatario').value,
      fecha_caducidad: document.getElementById('aviso_fecha_caducidad').value || null,
      enlace: document.getElementById('aviso_enlace').value.trim() || null,
      destacado: document.getElementById('aviso_destacado').value === 'true',
      visible: document.getElementById('aviso_visible').value === 'true'
    };

    if (imagenUrl) {
      payload.imagen_url = imagenUrl;
    }

    if (!payload.titulo || !payload.contenido) {
      msg.textContent = 'Faltan campos obligatorios.';
      msg.className = 'message error';
      return;
    }

    let result;

    if (id) {
      result = await supabase
        .from('avisos')
        .update(payload)
        .eq('id', Number(id));
    } else {
      result = await supabase
        .from('avisos')
        .insert([{
          ...payload,
          created_by: user?.id || null
        }]);
    }

    if (result.error) {
      msg.textContent = 'Error al guardar aviso: ' + result.error.message;
      msg.className = 'message error';
      return;
    }

    msg.textContent = id
      ? 'Aviso actualizado correctamente'
      : 'Aviso publicado correctamente';

    msg.className = 'message success';

    setTimeout(() => {
      if (typeof onSuccess === 'function') {
        onSuccess();
      }
    }, 600);
  });
}

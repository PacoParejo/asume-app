import { supabase } from '../supabase.js';

function setView(title, html) {
  const viewTitle = document.getElementById('viewTitle');
  const viewContent = document.getElementById('viewContent');

  if (viewTitle) viewTitle.textContent = title;
  if (viewContent) viewContent.innerHTML = html;
}

function getNuevoCVFormHTML() {
  return `
    <div class="form-card">
      <h3>Nuevo Currículum Vitae</h3>

      <form id="nuevoCVForm">
        <div class="form-grid">

          <div>
            <label>Nombre *</label>
            <input type="text" id="cv_nombre" required />
          </div>

          <div>
            <label>Email *</label>
            <input type="email" id="cv_email" required />
          </div>

          <div>
            <label>Teléfono</label>
            <input type="text" id="cv_telefono" />
          </div>

          <div>
            <label>Población</label>
            <input type="text" id="cv_poblacion" />
          </div>

          <div class="full-width">
            <label>Carta de presentación</label>
            <textarea id="cv_carta" rows="4"></textarea>
          </div>

          <div>
            <label>¿Prioritario?</label>
            <select id="cv_prioridad">
              <option value="false">No</option>
              <option value="true">Sí</option>
            </select>
          </div>

        </div>

        <h4>Experiencia (hasta 3)</h4>

        ${[1,2,3].map(i => `
          <div class="form-grid">
            <div>
              <label>Empresa ${i}</label>
              <input type="text" id="exp_empresa_${i}" />
            </div>
            <div>
              <label>Puesto</label>
              <input type="text" id="exp_puesto_${i}" />
            </div>
            <div>
              <label>Inicio</label>
              <input type="date" id="exp_inicio_${i}" />
            </div>
            <div>
              <label>Fin</label>
              <input type="date" id="exp_fin_${i}" />
            </div>
          </div>
        `).join('')}

        <h4>Estudios (hasta 3)</h4>

        ${[1,2,3].map(i => `
          <div class="form-grid">
            <div>
              <label>Título ${i}</label>
              <input type="text" id="est_titulo_${i}" />
            </div>
            <div>
              <label>Centro</label>
              <input type="text" id="est_centro_${i}" />
            </div>
            <div>
              <label>Inicio</label>
              <input type="date" id="est_inicio_${i}" />
            </div>
            <div>
              <label>Fin</label>
              <input type="date" id="est_fin_${i}" />
            </div>
          </div>
        `).join('')}

        <div class="top-actions" style="margin-top:16px;">
          <button type="submit">Guardar CV</button>
          <button type="button" id="cancelarCVBtn" class="secondary-btn">Cancelar</button>
        </div>

      </form>

      <div id="nuevoCVMsg" class="message"></div>
    </div>
  `;
}

export async function renderBolsaView(mostrarCV = false) {
  const formHTML = mostrarCV ? getNuevoCVFormHTML() : '';

  setView('Bolsa de Trabajo', `
    <div class="asociado-header">
      <div>
        <p>Bolsa de Trabajo v1</p>
      </div>
      <div class="table-actions">
        <button id="nuevoCVBtn">📄 Nuevo CV</button>
      </div>
    </div>

    ${formHTML}
  `);

  const nuevoCVBtn = document.getElementById('nuevoCVBtn');
  if (nuevoCVBtn) {
    nuevoCVBtn.onclick = () => renderBolsaView(true);
  }

  const cancelarCVBtn = document.getElementById('cancelarCVBtn');
  if (cancelarCVBtn) {
    cancelarCVBtn.onclick = () => renderBolsaView(false);
  }

  const form = document.getElementById('nuevoCVForm');
  if (form) {
    form.onsubmit = async (e) => {
      e.preventDefault();

      const msg = document.getElementById('nuevoCVMsg');
      msg.textContent = 'Guardando CV...';

      const experiencia = [1,2,3].map(i => ({
        empresa: document.getElementById(`exp_empresa_${i}`).value,
        puesto: document.getElementById(`exp_puesto_${i}`).value,
        inicio: document.getElementById(`exp_inicio_${i}`).value,
        fin: document.getElementById(`exp_fin_${i}`).value
      }));

      const estudios = [1,2,3].map(i => ({
        titulo: document.getElementById(`est_titulo_${i}`).value,
        centro: document.getElementById(`est_centro_${i}`).value,
        inicio: document.getElementById(`est_inicio_${i}`).value,
        fin: document.getElementById(`est_fin_${i}`).value
      }));

      const payload = {
        nombre: document.getElementById('cv_nombre').value,
        email: document.getElementById('cv_email').value,
        telefono: document.getElementById('cv_telefono').value,
        poblacion: document.getElementById('cv_poblacion').value,
        carta_presentacion: document.getElementById('cv_carta').value,
        prioridad: document.getElementById('cv_prioridad').value === 'true',
        experiencia,
        estudios,
        estado: 'activo'
      };

      const { error } = await supabase.from('cvs').insert([payload]);

      if (error) {
        msg.textContent = error.message;
        return;
      }

      msg.textContent = 'CV guardado correctamente';

      setTimeout(() => renderBolsaView(false), 600);
    };
  }
}

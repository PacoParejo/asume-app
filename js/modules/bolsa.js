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

function limpiarLista(lista = []) {
  return (lista || []).filter(item =>
    Object.values(item || {}).some(v => v && v.toString().trim() !== '')
  );
}

/* =========================
   LISTADOS
========================= */

function getListadoOfertasHTML(ofertas = []) {
  const rows = (ofertas || []).map(o => `
    <tr>
      <td>${o.id}</td>
      <td>${o.titulo || ''}</td>
      <td>${o.empresa_busca || ''}</td>
      <td>${o.trabajo_realizar || ''}</td>
      <td>${o.estado || ''}</td>
      <td>
        <button class="secondary-btn eliminarOfertaBtn" data-id="${o.id}">Eliminar</button>
      </td>
    </tr>
  `).join('');

  return `
    <div class="form-card">
      <h3>Ofertas activas</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Título</th><th>Empresa</th><th>Trabajo</th><th>Estado</th><th></th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="6">Sin ofertas</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

function getListadoCVHTML(cvs = []) {
  const rows = (cvs || []).map(cv => `
    <tr>
      <td>${cv.id}</td>
      <td>${cv.nombre || ''}</td>
      <td>${cv.email || ''}</td>
      <td>${cv.estado || ''}</td>
      <td>
        <button class="secondary-btn eliminarCVBtn" data-id="${cv.id}">Eliminar</button>
      </td>
    </tr>
  `).join('');

  return `
    <div class="form-card">
      <h3>CV activos</h3>
      <table>
        <thead>
          <tr>
            <th>ID</th><th>Nombre</th><th>Email</th><th>Estado</th><th></th>
          </tr>
        </thead>
        <tbody>
          ${rows || '<tr><td colspan="5">Sin CV</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

/* =========================
   PAPELERA
========================= */

function getPapeleraHTML(ofertas = [], cvs = []) {
  const rowsOfertas = ofertas.map(o => `
    <tr>
      <td>OFERTA</td>
      <td>${o.titulo}</td>
      <td>
        <button class="secondary-btn restaurarOfertaBtn" data-id="${o.id}">Restaurar</button>
      </td>
    </tr>
  `).join('');

  const rowsCV = cvs.map(cv => `
    <tr>
      <td>CV</td>
      <td>${cv.nombre}</td>
      <td>
        <button class="secondary-btn restaurarCVBtn" data-id="${cv.id}">Restaurar</button>
      </td>
    </tr>
  `).join('');

  return `
    <div class="form-card">
      <h3>🧺 Papelera</h3>
      <table>
        <thead>
          <tr>
            <th>Tipo</th><th>Nombre</th><th></th>
          </tr>
        </thead>
        <tbody>
          ${rowsOfertas + rowsCV || '<tr><td colspan="3">Vacía</td></tr>'}
        </tbody>
      </table>
    </div>
  `;
}

/* =========================
   MAIN VIEW
========================= */

export async function renderBolsaView() {
  setView('Bolsa', 'Cargando...');

  const { data: ofertas } = await supabase
    .from('ofertas_empleo')
    .select('*')
    .neq('estado', 'eliminada');

  const { data: cvs } = await supabase
    .from('cvs')
    .select('*')
    .neq('estado', 'eliminado');

  setView('Bolsa de Trabajo', `
    <div class="table-actions">
      <button id="papeleraBtn">🧺 Papelera</button>
    </div>

    ${getListadoOfertasHTML(ofertas)}
    ${getListadoCVHTML(cvs)}
  `);

  /* eliminar */
  document.querySelectorAll('.eliminarOfertaBtn').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('¿Eliminar oferta?')) return;

      await supabase.from('ofertas_empleo')
        .update({ estado: 'eliminada' })
        .eq('id', btn.dataset.id);

      renderBolsaView();
    };
  });

  document.querySelectorAll('.eliminarCVBtn').forEach(btn => {
    btn.onclick = async () => {
      if (!confirm('¿Eliminar CV?')) return;

      await supabase.from('cvs')
        .update({ estado: 'eliminado' })
        .eq('id', btn.dataset.id);

      renderBolsaView();
    };
  });

  document.getElementById('papeleraBtn').onclick = renderPapelera;
}

/* =========================
   VIEW PAPELERA
========================= */

async function renderPapelera() {
  setView('Papelera', 'Cargando...');

  const { data: ofertas } = await supabase
    .from('ofertas_empleo')
    .select('*')
    .eq('estado', 'eliminada');

  const { data: cvs } = await supabase
    .from('cvs')
    .select('*')
    .eq('estado', 'eliminado');

  setView('Papelera', `
    <button id="volverBolsaBtn">⬅ Volver</button>
    ${getPapeleraHTML(ofertas, cvs)}
  `);

  document.getElementById('volverBolsaBtn').onclick = renderBolsaView;

  /* restaurar */
  document.querySelectorAll('.restaurarOfertaBtn').forEach(btn => {
    btn.onclick = async () => {
      await supabase.from('ofertas_empleo')
        .update({ estado: 'activa' })
        .eq('id', btn.dataset.id);

      renderPapelera();
    };
  });

  document.querySelectorAll('.restaurarCVBtn').forEach(btn => {
    btn.onclick = async () => {
      await supabase.from('cvs')
        .update({ estado: 'activo' })
        .eq('id', btn.dataset.id);

      renderPapelera();
    };
  });
}

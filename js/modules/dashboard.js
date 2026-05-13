
import { supabase } from '../supabase.js';

export async function renderDashboard() {

  const viewTitle = document.getElementById('viewTitle');
  const viewContent = document.getElementById('viewContent');

  viewTitle.textContent = 'Dashboard';

  // ===============================
  // CARGAR DATOS
  // ===============================

  let totalAsociados = 0;
  let totalOfertas = 0;

  try {

    // ASOCIADOS
    const { count: asociadosCount } = await supabase
      .from('asociados')
      .select('*', { count: 'exact', head: true });

    totalAsociados = asociadosCount || 0;

    // OFERTAS
    const { count: ofertasCount } = await supabase
      .from('ofertas_empleo')
      .select('*', { count: 'exact', head: true });

    totalOfertas = ofertasCount || 0;

  } catch (error) {
    console.error(error);
  }

  // ===============================
  // HTML DASHBOARD
  // ===============================

  viewContent.innerHTML = `

    <div class="dashboard-grid">

      <div class="dashboard-card">
        <h3>👋 Bienvenido a ASUME</h3>

        <p>
          Centro de actividad empresarial de Umbrete.
        </p>
      </div>

      <div class="dashboard-card">
        <h3>👥 Asociados</h3>

        <div class="dashboard-number">
          ${totalAsociados}
        </div>

        <p>Total de asociados registrados.</p>
      </div>

      <div class="dashboard-card">
        <h3>💼 Ofertas activas</h3>

        <div class="dashboard-number">
          ${totalOfertas}
        </div>

        <p>Ofertas disponibles actualmente.</p>
      </div>

      <div class="dashboard-card">
        <h3>📢 Novedades</h3>

        <ul class="dashboard-list">
          <li>Nueva versión de la APP ASUME</li>
          <li>Integración con dominio asume.net</li>
          <li>Área privada operativa</li>
        </ul>
      </div>

      <div class="dashboard-card full-card">
        <h3>🚀 Estado del proyecto</h3>

        <p>
          La plataforma ASUME continúa creciendo con nuevas funciones:
          bolsa de trabajo, gestión interna, documentación,
          marketplace local y sistema empresarial colaborativo.
        </p>
      </div>

    </div>

  `;
}

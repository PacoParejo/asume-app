import { supabase } from '../supabase.js';

export async function renderDashboard() {

  const viewTitle = document.getElementById('viewTitle');
  const viewContent = document.getElementById('viewContent');

  viewTitle.textContent = 'Dashboard';

  viewContent.innerHTML = `
    <div class="loading">
      Cargando dashboard...
    </div>
  `;

  // ===============================
  // CARGAR ASOCIADOS
  // ===============================

  const { data: asociados, error } = await supabase
    .from('asociados')
    .select('*')
    .order('id', { ascending: false });

  if (error) {

    viewContent.innerHTML = `
      <div class="error">
        Error cargando dashboard
      </div>
    `;

    return;
  }

  // ===============================
  // MÉTRICAS
  // ===============================

  const total = asociados.length;

  const activos = asociados.filter(
    a => a.estado === 'activo'
  ).length;

  const pendientes = asociados.filter(
    a => a.estado === 'pendiente'
  ).length;

  const bajas = asociados.filter(
    a => a.estado === 'baja'
  ).length;

  // ===============================
  // ÚLTIMOS ASOCIADOS
  // ===============================

  const ultimos = asociados.slice(0, 5);

  // ===============================
  // HTML
  // ===============================

  viewContent.innerHTML = `

    <div class="dashboard-grid">

      <div class="dashboard-stat">
        <div class="dashboard-number">
          ${total}
        </div>

        <div class="dashboard-label">
          Asociados totales
        </div>
      </div>

      <div class="dashboard-stat">
        <div class="dashboard-number success-color">
          ${activos}
        </div>

        <div class="dashboard-label">
          Asociados activos
        </div>
      </div>

      <div class="dashboard-stat">
        <div class="dashboard-number warning-color">
          ${pendientes}
        </div>

        <div class="dashboard-label">
          Pendientes
        </div>
      </div>

      <div class="dashboard-stat">
        <div class="dashboard-number danger-color">
          ${bajas}
        </div>

        <div class="dashboard-label">
          Bajas
        </div>
      </div>

    </div>

    <div class="dashboard-panels">

      <!-- EVENTO -->
      <div class="dashboard-box">

        <h3>
          🚀 Próximo evento ASUME
        </h3>

        <div class="event-mini">

          <img
            src="./img/evento-asume-junio.jpg"
            alt="Evento ASUME"
            class="event-mini-image"
          />

          <div class="event-mini-info">

            <h4>
              Presentación Oficial ASUME
            </h4>

            <p>
              📅 11 de junio de 2026
            </p>

            <p>
              📍 Salones José Benítez
            </p>

            <p>
              🥂 Aperitivo incluido
            </p>

            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSc9ysV5NC-ecxmV6CCBwLTR2VxdeWZ6gZgtYrurttKfBtrymQ/viewform"
              target="_blank"
              class="dashboard-link"
            >
              Reservar plaza
            </a>

          </div>

        </div>

      </div>

      <!-- ÚLTIMOS ASOCIADOS -->
      <div class="dashboard-box">

        <h3>
          🏢 Últimos asociados
        </h3>

        <div class="dashboard-list">

          ${
            ultimos.map(asociado => `
              <div class="dashboard-list-item">

                <strong>
                  ${asociado.empresa || 'Empresa'}
                </strong>

                <span>
                  ${asociado.contacto || ''}
                </span>

              </div>
            `).join('')
          }

        </div>

      </div>

      <!-- ESTADO -->
      <div class="dashboard-box">

        <h3>
          📢 Estado del proyecto
        </h3>

        <ul class="dashboard-ul">
          <li>✅ Plataforma online activa</li>
          <li>✅ Sistema de login operativo</li>
          <li>✅ Gestión de asociados</li>
          <li>✅ Archivo histórico</li>
          <li>🚧 Marketplace local</li>
          <li>🚧 Bolsa de empleo avanzada</li>
          <li>🚧 CRM institucional</li>
        </ul>

      </div>

      <!-- NOVEDADES -->
      <div class="dashboard-box">

        <h3>
          ✨ Novedades
        </h3>

        <ul class="dashboard-ul">
          <li>Nuevo diseño responsive</li>
          <li>Evento oficial integrado</li>
          <li>Solicitud de contraseña móvil</li>
          <li>Preparado para crecimiento modular</li>
        </ul>

      </div>

    </div>
  `;
}

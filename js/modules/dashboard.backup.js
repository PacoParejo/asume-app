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
  // CARGAR DATOS
  // ===============================

  const { data: asociados, error: errorAsociados } = await supabase
    .from('asociados')
    .select('*')
    .order('id', { ascending: false });

  const { data: ofertas } = await supabase
    .from('ofertas_empleo')
    .select('*')
    .neq('estado', 'eliminada')
    .order('created_at', { ascending: false });

  if (errorAsociados) {

    viewContent.innerHTML = `
      <div class="message error">
        Error cargando dashboard: ${errorAsociados.message}
      </div>
    `;

    return;
  }

  // ===============================
  // MÉTRICAS
  // ===============================

  const listaAsociados = asociados || [];
  const listaOfertas = ofertas || [];

  const total = listaAsociados.length;

  const activos = listaAsociados.filter(
    a => a.estado === 'activo'
  ).length;

  const pendientes = listaAsociados.filter(
    a => a.estado === 'pendiente'
  ).length;

  const ofertasActivas = listaOfertas.filter(
    o => o.estado === 'activa'
  ).length;

  // ===============================
  // ÚLTIMOS ASOCIADOS
  // ===============================

  const ultimos = listaAsociados.slice(0, 5);

  // ===============================
  // RENDER
  // ===============================

  viewContent.innerHTML = `

    <!-- HERO -->

    <div class="dashboard-hero">

      <div>

        <span class="dashboard-kicker">
          Panel principal
        </span>

        <h2>
          Centro de actividad de ASUME
        </h2>

        <p>
          Resumen rápido del estado de la asociación,
          próximos eventos, asociados registrados
          y actividad empresarial local.
        </p>

      </div>

      <a
        class="dashboard-main-cta"
        href="https://docs.google.com/forms/d/e/1FAIpQLSc9ysV5NC-ecxmV6CCBwLTR2VxdeWZ6gZgtYrurttKfBtrymQ/viewform"
        target="_blank"
        rel="noopener"
      >
        🎟 Reservar plaza
      </a>

    </div>


    <!-- ESTADÍSTICAS -->

    <div class="dashboard-grid">

      <div class="dashboard-stat">

        <span>👥</span>

        <strong>
          ${total}
        </strong>

        <p>
          Asociados totales
        </p>

      </div>

      <div class="dashboard-stat">

        <span>✅</span>

        <strong class="success-color">
          ${activos}
        </strong>

        <p>
          Asociados activos
        </p>

      </div>

      <div class="dashboard-stat">

        <span>⏳</span>

        <strong class="warning-color">
          ${pendientes}
        </strong>

        <p>
          Pendientes
        </p>

      </div>

      <div class="dashboard-stat">

        <span>💼</span>

        <strong>
          ${ofertasActivas}
        </strong>

        <p>
          Ofertas activas
        </p>

      </div>

    </div>


    <!-- CONTENIDO -->

    <div class="dashboard-layout">


      <!-- EVENTO -->

      <div class="dashboard-box dashboard-event-box">

        <div class="dashboard-box-head">

          <span>
            🚀 Evento destacado
          </span>

          <strong>
            11 junio 2026
          </strong>

        </div>

        <div class="dashboard-event">

          <img
            src="./img/evento-asume-junio.jpg"
            alt="Presentación oficial ASUME"
          />

          <div>

            <h3>
              Presentación Oficial de ASUME
            </h3>

            <p>
              Encuentro abierto para empresarios,
              autónomos, comerciantes, emprendedores
              y vecinos de Umbrete.
            </p>

            <div class="dashboard-event-tags">

              <span>
                📍 Salones José Benítez
              </span>

              <span>
                🕗 Desde las 20:00 h
              </span>

              <span>
                🥂 Aperitivo incluido
              </span>

            </div>

            <a
              href="https://docs.google.com/forms/d/e/1FAIpQLSc9ysV5NC-ecxmV6CCBwLTR2VxdeWZ6gZgtYrurttKfBtrymQ/viewform"
              target="_blank"
              rel="noopener"
              class="dashboard-link"
            >
              Reservar plaza
            </a>

          </div>

        </div>

      </div>


      <!-- ÚLTIMOS ASOCIADOS -->

      <div class="dashboard-box">

        <div class="dashboard-box-head">

          <span>
            🏢 Últimos asociados
          </span>

        </div>

        <div class="dashboard-list">

          ${
            ultimos.length
              ? ultimos.map(asociado => `

                <div class="dashboard-list-item">

                  <strong>
                    ${asociado.empresa || asociado.contacto || 'Asociado'}
                  </strong>

                  <span>
                    ${asociado.contacto || asociado.email || 'Sin contacto indicado'}
                  </span>

                </div>

              `).join('')
              : `
                <p class="dashboard-empty">
                  Todavía no hay asociados registrados.
                </p>
              `
          }

        </div>

      </div>


      <!-- ESTADO -->

      <div class="dashboard-box">

        <div class="dashboard-box-head">

          <span>
            📢 Estado del proyecto
          </span>

        </div>

        <ul class="dashboard-ul">

          <li>
            ✅ Plataforma online activa
          </li>

          <li>
            ✅ Login de asociados operativo
          </li>

          <li>
            ✅ Gestión de asociados
          </li>

          <li>
            ✅ Archivo histórico
          </li>

          <li>
            🚧 Dashboard avanzado
          </li>

          <li>
            🚧 Marketplace local
          </li>

        </ul>

      </div>


      <!-- NOVEDADES -->

      <div class="dashboard-box">

        <div class="dashboard-box-head">

          <span>
            ✨ Próximas mejoras
          </span>

        </div>

        <ul class="dashboard-ul">

          <li>
            📌 Avisos internos para asociados
          </li>

          <li>
            📄 Documentos y actas
          </li>

          <li>
            💳 Cuotas y remesas
          </li>

          <li>
            🤝 Tareas Junta Directiva
          </li>

          <li>
            🛒 Catálogo local de empresas
          </li>

        </ul>

      </div>

    </div>
  `;
}


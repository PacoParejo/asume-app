import {
  login,
  logout,
  getSession,
  getUserProfile
} from './supabase.js';
import { renderAsociadosView } from './modules/asociados.js';
import { renderArchivoView } from './modules/archivo.js';

// ===============================
// REFERENCIAS DOM
// ===============================
const loginForm = document.getElementById('loginForm');
const message = document.getElementById('message');
const loginSection = document.getElementById('loginSection');
const welcomeSection = document.getElementById('welcomeSection');
const userInfo = document.getElementById('userInfo');
const logoutBtn = document.getElementById('logoutBtn');
const homeBtn = document.getElementById('homeBtn');
const roleBadge = document.getElementById('roleBadge');
const roleSummary = document.getElementById('roleSummary');
const menuButtons = document.getElementById('menuButtons');
const viewTitle = document.getElementById('viewTitle');
const viewContent = document.getElementById('viewContent');


// ===============================
// UI BÁSICA
// ===============================
function showMessage(text, type = '') {
  message.textContent = text;
  message.className = 'message';
  if (type) message.classList.add(type);
}

function showLogin() {
  welcomeSection.classList.add('hidden');
  loginSection.classList.remove('hidden');
  showMessage('');
}

function showWelcomeShell() {
  loginSection.classList.add('hidden');
  welcomeSection.classList.remove('hidden');
}

function setView(title, html) {
  viewTitle.textContent = title;
  viewContent.innerHTML = html;
}


// ===============================
// ROLES Y MENÚ
// ===============================
function getRoleSummary(role) {
  const map = {
    superadmin: 'Acceso total activado.',
    presidente: 'Panel de Presidencia.',
    tesorero: 'Panel de Tesorería.',
    secretario: 'Panel de Secretaría.',
    junta: 'Panel de Junta.',
    asociado: 'Panel de asociado.'
  };
  return map[role] || 'Panel básico.';
}

function getMenuForRole(role) {
  const menus = {
    superadmin: [
      { key: 'dashboard', label: '🏠 Dashboard' },
      { key: 'asociados', label: '🏢 Asociados' },
      { key: 'archivo', label: '🗃️ Archivo' }
    ],
    asociado: [
      { key: 'dashboard', label: '🏠 Dashboard' }
    ]
  };

  return menus[role] || menus.asociado;
}

function renderMenu(role) {
  const items = getMenuForRole(role);
  menuButtons.innerHTML = '';

  items.forEach(item => {
    const btn = document.createElement('button');
    btn.className = 'menu-btn';
    btn.textContent = item.label;

    btn.addEventListener('click', async () => {
      await openView(item.key);
    });

    menuButtons.appendChild(btn);
  });
}


// ===============================
// VISTAS
// ===============================
async function openView(key) {
  if (key === 'dashboard') {
    setView('Dashboard', '<p>Panel principal</p>');
    return;
  }

  if (key === 'asociados') {
    await renderAsociadosView();
    return;
  }

  if (key === 'archivo') {
    await renderArchivoView();
    return;
  }
}


// ===============================
// LOGIN
// ===============================
loginForm.addEventListener('submit', async (e) => {
  e.preventDefault();

  const email = document.getElementById('email').value.trim();
  const password = document.getElementById('password').value;

  showMessage('Entrando...');

  const { data, error } = await login(email, password);

  if (error) {
    showMessage(error.message, 'error');
    return;
  }

  await showWelcome(data.user);
});


// ===============================
// SESIÓN
// ===============================
async function showWelcome(user) {
  showWelcomeShell();

  const profile = await getUserProfile(user.id);

  const email = profile?.data?.email || user.email;
  const role = profile?.data?.role || 'asociado';

  userInfo.textContent = `Has iniciado sesión como: ${email}`;
  roleBadge.textContent = `Rol: ${role}`;
  roleSummary.textContent = getRoleSummary(role);

  renderMenu(role);
  await openView('dashboard');
}

async function checkSession() {
  const { data } = await getSession();

  if (data.session && data.session.user) {
    await showWelcome(data.session.user);
  } else {
    showLogin();
  }
}


// ===============================
// LOGOUT
// ===============================
logoutBtn.addEventListener('click', async () => {
  await logout();
  showLogin();
});

homeBtn.addEventListener('click', async () => {
  await openView('dashboard');
});


// ===============================
// INIT
// ===============================
checkSession();

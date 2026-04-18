// ===============================
// CONFIGURACIÓN SUPABASE
// ===============================
const supabaseUrl = 'https://ijsntfkhuunaauqvjeve.supabase.co';
const supabaseKey = 'sb_publishable_PIbkEoS7eK8CdD4DtJcepQ_5I7JCmjm';

export const supabase = window.supabase.createClient(supabaseUrl, supabaseKey);


// ===============================
// AUTH
// ===============================
export async function login(email, password) {
  return await supabase.auth.signInWithPassword({
    email,
    password
  });
}

export async function logout() {
  return await supabase.auth.signOut();
}

export async function getSession() {
  return await supabase.auth.getSession();
}


// ===============================
// PERFIL USUARIO
// ===============================
export async function getUserProfile(userId) {
  const { data, error } = await supabase
    .from('profiles')
    .select('email, role')
    .eq('id', userId)
    .single();

  return { data, error };
}


// ===============================
// ASOCIADOS
// ===============================
export async function getAsociados() {
  return await supabase
    .from('asociados')
    .select('*')
    .order('id', { ascending: true });
}

export async function createAsociado(payload) {
  return await supabase
    .from('asociados')
    .insert([payload]);
}

export async function updateAsociado(id, payload) {
  return await supabase
    .from('asociados')
    .update(payload)
    .eq('id', id);
}

export async function bajaAsociado(id) {
  return await supabase
    .from('asociados')
    .update({ estado: 'baja' })
    .eq('id', id);
}

export async function deleteAsociado(id) {
  return await supabase
    .from('asociados')
    .delete()
    .eq('id', id);
}


// ===============================
// ARCHIVO
// ===============================
export async function archivarAsociado(payload) {
  return await supabase
    .from('asociados_archivo')
    .insert([payload]);
}


// ===============================
// ACCIÓN COMPLETA (ARCHIVAR + BORRAR)
// ===============================
export async function archivarYEliminar(asociado) {
  const payload = {
    contacto: asociado.contacto || '',
    cargo: asociado.cargo || '',
    telefono: asociado.telefono || '',
    empresa: asociado.empresa || '',
    actividad: asociado.actividad || '',
    direccion: asociado.direccion || '',
    email: asociado.email || '',
    estado: asociado.estado || 'baja',
    user_id: asociado.user_id || null
  };

  const { error: errorArchivo } = await archivarAsociado(payload);

  if (errorArchivo) {
    return { ok: false, error: errorArchivo.message };
  }

  const { error: errorDelete } = await deleteAsociado(asociado.id);

  if (errorDelete) {
    return { ok: false, error: errorDelete.message };
  }

  return { ok: true };
}

// sheetsRepository.js
// Adapts the Apps Script API responses into the shapes the frontend expects.

const sheetsRepository = (function(){
  function mapUser(row){
    // API returns objects with column names; adapt to frontend user shape
    return {
      id: row.id || row.usuario_id || '',
      nombre: row.nombre_completo || row.nombre || '',
      email: row.email || '',
      rol: row.rol || 'user'
    };
  }

  function mapProfile(row){
    return {
      id: row.id || row.usuario_id || '',
      usuario_id: row.usuario_id || row.id || '',
      nombre: row.nombre_completo || row.nombre || '',
      biografia: row.biografia || '',
      ubicacion: row.ubicacion || '',
      foto_perfil: row.url_foto_perfil || row.foto_perfil || '',
      foto_portada: row.url_foto_portada || row.foto_portada || ''
    };
  }

  async function listProfiles(){
    const res = await sheetsService.list('profiles');
    // backend returns { success:true, data: [...] }
    if (!res || !res.success || !Array.isArray(res.data)) return [];
    return res.data.map(mapProfile);
  }

  async function getProfileByUserId(usuario_id){
    // backend exposes GET profiles?action=get&id=USER_ID
    const res = await sheetsService.get('profiles', usuario_id);
    if(!res) return null;
    // Controllers return {success:true, data: {...} }
    if (res.data) return mapProfile(res.data);
    return null;
  }

  async function createProfile(profile){
    const res = await sheetsService.create('profiles', profile);
    return res;
  }

  async function listUsers(){
    const res = await sheetsService.list('users');
    if (!res || !res.success || !Array.isArray(res.data)) return [];
    return res.data.map(mapUser);
  }

  return { listProfiles, getProfileByUserId, createProfile, listUsers };
})();

window.sheetsRepository = sheetsRepository;
import { API_URL } from './config'

const authHeader = () => ({
  'Content-Type':  'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
})

// GET /api/perfil
export async function getPerfil() {
  const res = await fetch(`${API_URL}/perfil`, {
    headers: authHeader()
  })
  if (!res.ok) throw new Error('Error al cargar perfil')
  return res.json()
}

// PUT /api/perfil
export async function updatePerfil(datos) {
  const res = await fetch(`${API_URL}/perfil`, {
    method:  'PUT',
    headers: authHeader(),
    body:    JSON.stringify(datos)
  })
  if (!res.ok) throw new Error('Error al actualizar perfil')
  return res.json()
}

// POST /api/perfil/foto
export async function subirFoto(file, tipo = 'perfil') {
  const formData = new FormData()
  formData.append('foto', file)
  formData.append('tipo', tipo)

  const res = await fetch(`${API_URL}/perfil/foto`, {
    method:  'POST',
    headers: { 'Authorization': `Bearer ${localStorage.getItem('token')}` },
    body:    formData
  })
  if (!res.ok) throw new Error('Error al subir foto')
  return res.json()
}

// PUT /api/perfil/password
export async function cambiarPassword(passwordActual, passwordNuevo) {
  const res = await fetch(`${API_URL}/perfil/password`, {
    method:  'PUT',
    headers: authHeader(),
    body:    JSON.stringify({
      password_actual:          passwordActual,
      password_nuevo:           passwordNuevo,
      password_nuevo_confirmation: passwordNuevo
    })
  })
  if (!res.ok) throw new Error('Error al cambiar contraseña')
  return res.json()
}
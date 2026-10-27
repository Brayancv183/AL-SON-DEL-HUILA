import { API_URL } from './config'

const authHeader = () => ({
  'Content-Type':  'application/json',
  'Accept':        'application/json',
  'Authorization': `Bearer ${localStorage.getItem('token')}`
})

// GET /api/rutas — rutas públicas
export async function getRutas() {
  const res = await fetch(`${API_URL}/rutas`)
  if (!res.ok) throw new Error('Error al cargar rutas')
  return res.json()
}

// POST /api/rutas — crear ruta
export async function crearRuta(datos) {
  const res = await fetch(`${API_URL}/rutas`, {
    method:  'POST',
    headers: authHeader(),
    body:    JSON.stringify(datos)
  })
  if (!res.ok) throw new Error('Error al crear ruta')
  return res.json()
}

// DELETE /api/rutas/:id
export async function eliminarRuta(id) {
  const res = await fetch(`${API_URL}/rutas/${id}`, {
    method:  'DELETE',
    headers: authHeader()
  })
  if (!res.ok) throw new Error('Error al eliminar ruta')
  return res.json()
}
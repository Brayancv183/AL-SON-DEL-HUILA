import { API_URL } from './config'

// GET /api/destinos — con filtros opcionales
export async function getDestinos(filtros = {}) {
  const params = new URLSearchParams()

  if (filtros.categoria)        params.append('categoria',  filtros.categoria)
  if (filtros.entorno)          params.append('entorno',    filtros.entorno)
  if (filtros.municipio)        params.append('municipio',  filtros.municipio)
  if (filtros.busqueda)         params.append('busqueda',   filtros.busqueda)
  if (filtros.etiquetas?.length) params.append('etiquetas', filtros.etiquetas.join(','))

  const res = await fetch(`${API_URL}/destinos?${params}`)
  if (!res.ok) throw new Error('Error al cargar destinos')
  return res.json()
}

// GET /api/destinos/:id
export async function getDestino(id) {
  const res = await fetch(`${API_URL}/destinos/${id}`)
  if (!res.ok) throw new Error('Destino no encontrado')
  return res.json()
}
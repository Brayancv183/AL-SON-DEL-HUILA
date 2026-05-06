import { API_URL } from './config'

// POST /api/recomendar
export async function recomendar(respuestas) {
  const res = await fetch(`${API_URL}/recomendar`, {
    method:  'POST',
    headers: { 'Content-Type': 'application/json' },
    body:    JSON.stringify(respuestas)
  })
  if (!res.ok) throw new Error('Error al generar recomendaciones')
  return res.json() // { itinerario, total }
}
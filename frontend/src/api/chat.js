import { API_URL } from './config'

/**
 * Envía el historial al backend (proxy Huily → Groq).
 * @param {Array} mensajes - [{ role: 'user'|'assistant', texto, imagen? (dataURL) }]
 * @param {Object|null} contexto - { presupuesto?, dias?, ruta_activa?, destinos_ruta? }
 * @param {string} idioma - 'es' | 'en' | 'pt' (traductor turístico)
 * @returns {Promise<string>} respuesta de la IA (con etiquetas [DESTINOS]/[RUTA])
 */
export async function enviarMensaje(mensajes, contexto = null, idioma = 'es') {
  const res = await fetch(`${API_URL}/chat`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ messages: mensajes, contexto: contexto || {}, idioma }),
  })

  const data = await res.json().catch(() => ({}))

  if (!res.ok) {
    throw new Error(data.respuesta || `Error del servidor (${res.status})`)
  }
  return data.respuesta
}

/** Escapa HTML peligroso antes de renderizar texto de la IA. */
export function escapeHtml(texto) {
  if (!texto) return ''
  return texto
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
}

/** Extrae los IDs de destinos desde la respuesta de la IA. */
export function extraerDestinos(texto, todosDestinos) {
  const match = texto.match(/\[DESTINOS:\s*([\d,\s]+)\]/)
  if (!match) return []
  const ids = match[1].split(',').map(id => parseInt(id.trim(), 10))
  return todosDestinos.filter(d => ids.includes(d.id))
}

/** Extrae una ruta en formato JSON desde la respuesta de la IA (soporta JSON multi-línea). */
export function extraerRuta(texto, todosDestinos) {
  const inicio = texto.indexOf('[RUTA:')
  if (inicio === -1) return null
  const open = texto.indexOf('{', inicio)
  if (open === -1) return null
  let nivel = 0, fin = -1, enString = false, escape = false
  for (let i = open; i < texto.length; i++) {
    const c = texto[i]
    if (escape) { escape = false; continue }
    if (c === '\\') { escape = true; continue }
    if (c === '"') { enString = !enString; continue }
    if (enString) continue
    if (c === '{') nivel++
    else if (c === '}') { nivel--; if (nivel === 0) { fin = i; break } }
  }
  if (fin === -1) return null
  try {
    const datos = JSON.parse(texto.slice(open, fin + 1))
    return {
      ...datos,
      destinos: todosDestinos.filter(d => datos.destinos?.includes(d.id)),
    }
  } catch {
    return null
  }
}

/** Elimina las etiquetas internas [DESTINOS:...] y [RUTA:...] del texto visible. */
export function limpiarTags(texto) {
  if (!texto) return ''
  let limpio = texto.replace(/\[DESTINOS:\s*[\d,\s]+\]/g, '')
  const ini = limpio.indexOf('[RUTA:')
  if (ini !== -1) {
    const open = limpio.indexOf('{', ini)
    let fin = -1
    if (open !== -1) {
      let nivel = 0, enString = false, escape = false
      for (let i = open; i < limpio.length; i++) {
        const c = limpio[i]
        if (escape) { escape = false; continue }
        if (c === '\\') { escape = true; continue }
        if (c === '"') { enString = !enString; continue }
        if (enString) continue
        if (c === '{') nivel++
        else if (c === '}') { nivel--; if (nivel === 0) { fin = i; break } }
      }
    }
    const close = limpio.indexOf(']', fin !== -1 ? fin : ini)
    limpio = limpio.slice(0, ini) + (close !== -1 ? limpio.slice(close + 1) : '')
  }
  return limpio.replace(/\n{3,}/g, '\n\n').trim()
}

/** Convierte una imagen File a dataURL (con compresión básica si es grande). */
export function imagenADataUrl(file, maxLado = 1280, calidad = 0.8) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader()
    reader.onerror = reject
    reader.onload = () => {
      const img = new Image()
      img.onerror = reject
      img.onload = () => {
        const escala = Math.min(1, maxLado / Math.max(img.width, img.height))
        const canvas = document.createElement('canvas')
        canvas.width = Math.round(img.width * escala)
        canvas.height = Math.round(img.height * escala)
        canvas.getContext('2d').drawImage(img, 0, 0, canvas.width, canvas.height)
        resolve(canvas.toDataURL('image/jpeg', calidad))
      }
      img.src = reader.result
    }
    reader.readAsDataURL(file)
  })
}

/**
 * Pide al backend que identifique el lugar de una imagen (dataURL).
 * @returns {Promise<{lugar: string|null, municipio: string|null, destino_id: number, confianza: number}>}
 */
export async function identificarLugar(dataUrl) {
  const res = await fetch(`${API_URL}/identificar-lugar`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify({ imagen: dataUrl }),
  })
  if (!res.ok) throw new Error(`Error ${res.status}`)
  return res.json()
}

import { API_URL } from './config'

async function post(path, body) {
  const res = await fetch(`${API_URL}${path}`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json', 'Accept': 'application/json' },
    body: JSON.stringify(body),
  })
  const data = await res.json().catch(() => ({}))
  if (!res.ok) {
    throw new Error(data.error || data.respuesta || `Error del servidor (${res.status})`)
  }
  return data
}

/** Genera un caption para redes sociales a partir de una foto (dataURL). */
export const generarCaption = (imagen, lugar = '', descripcion = '') =>
  post('/ia/caption', { imagen, lugar, descripcion }).then(d => d.caption)

/** Lista de empaque personalizada. */
export const listaEmpaque = (destino, dias, actividades = '') =>
  post('/ia/empaque', { destino, dias, actividades }).then(d => d.lista)

/** Sugiere categoría y etiquetas a partir de una foto (dataURL). */
export const sugerirEtiquetas = (imagen) =>
  post('/ia/etiquetas', { imagen })

/** Optimiza un viaje dentro de un presupuesto (devuelve texto con tag [RUTA:]). */
export const optimizarPresupuesto = (presupuesto, dias, personas = 1) =>
  post('/ia/optimizar', { presupuesto, dias, personas }).then(d => d.respuesta)

/** Plan de viaje para un grupo con gustos distintos (devuelve texto con [DESTINOS:]). */
export const planGrupal = (perfiles, dias, presupuesto) =>
  post('/ia/plan-grupal', { perfiles, dias, presupuesto }).then(d => d.respuesta)

/** Frases útiles en inglés + expresiones locales del Huila. */
export const frasesViaje = (contexto = '') => post('/ia/frases', { contexto })

/** Nombre creativo para una ruta. */
export const nombrarRuta = (destinos, dias) =>
  post('/ia/nombre-ruta', { destinos, dias })

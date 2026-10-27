import { useState, useRef, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  PiPaperPlaneTiltDuotone,
  PiRobotDuotone,
  PiUserDuotone,
  PiImageDuotone,
  PiSpinnerDuotone,
  PiMapPinDuotone,
  PiFloppyDiskDuotone,
  PiCoinsDuotone,
  PiTranslateDuotone,
  PiSuitcaseRollingDuotone,
  PiMagicWandDuotone,
  PiUsersThreeDuotone,
  PiQuotesDuotone,
} from "react-icons/pi"
import { enviarMensaje, extraerDestinos, extraerRuta, escapeHtml, imagenADataUrl, limpiarTags, identificarLugar } from "../api/chat"
import {
  listaEmpaque,
  planGrupal,
  frasesViaje,
} from "../api/ia"
import styles from "./ChatRutas.module.css"

function renderTexto(texto) {
  return escapeHtml(limpiarTags(texto))
    .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
    .replace(/\*(.*?)\*/g,     "<em>$1</em>")
    .replace(/\n/g,            "<br/>")
    .replace(/\[DESTINOS:.*?\]/g, "")
    .replace(/\[RUTA:.*?\]/g,    "")
}

const IDIOMAS = [
  { codigo: "es", label: "ES" },
  { codigo: "en", label: "EN" },
  { codigo: "pt", label: "PT" },
]

const HERRAMIENTAS = [
  { id: "empaque", label: "Empaque",    icono: PiSuitcaseRollingDuotone },
  { id: "grupal",  label: "Plan grupal", icono: PiUsersThreeDuotone },
  { id: "jerga",   label: "Jerga huilense", icono: PiQuotesDuotone },
  { id: "plan",    label: "Planear ruta", icono: PiMagicWandDuotone },
]

export default function ChatRutas({
  onDestinosChange,
  onRutaGenerada,
  rutaActiva,
  todosDestinos,
  usuario,
}) {
  const [mensajes,  setMensajes]  = useState([])
  const [input,     setInput]     = useState("")
  const [cargando,  setCargando]  = useState(false)
  const [rutaPendiente, setRutaPendiente] = useState(null)
  const [idioma, setIdioma] = useState("es")
  const [herramienta, setHerramienta] = useState(null)
  const [formH, setFormH] = useState({ destino: "", dias: 3, actividades: "", perfiles: "", planViaje: "" })
  const [enviandoHerramienta, setEnviandoHerramienta] = useState(false)

  const bottomRef  = useRef(null)
  const inputRef   = useRef(null)
  const fileRef    = useRef(null)

  const mensajeBienvenida = rutaActiva
    ? `Tienes seleccionada la ruta **${rutaActiva.nombre}**. ¿Qué quieres hacer con ella? Puedo sugerirte destinos adicionales, explicarte cada lugar o crear una variante.`
    : `¡Hola! Soy Huily :) Tu asistente de rutas en el Huila.\n\nPuedo ayudarte a:\n- Crear rutas personalizadas: dime cuántos días tienes y tu presupuesto y la armo\n- Decirte especificaciones, horarios y precios de los destinos\n- Identificar lugares del Huila por foto (sube una imagen)\n- Guardar tus rutas favoritas\n\n¿Por dónde empezamos?`

  useEffect(() => {
    setMensajes([{ id: 0, rol: "assistant", texto: mensajeBienvenida, destinos: [] }])
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [rutaActiva?.id])

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" })
  }, [mensajes, cargando])

  const enviar = async (texto = input, imagen = null) => {
    if ((!texto.trim() && !imagen) || cargando) return

    const msgUsuario = {
      id:      Date.now(),
      rol:     "user",
      texto:   texto.trim(),
      imagen,
      destinos: [],
    }

    setMensajes(prev => [...prev, msgUsuario])
    setInput("")
    setCargando(true)

    try {
      const historial = mensajes
        .filter(m => m.id !== 0)
        .map(m => ({ role: m.rol, texto: m.texto, imagen: m.imagen }))

      historial.push({ role: "user", texto: texto.trim(), imagen })

      const contexto = {
        ruta_activa:   rutaActiva?.nombre,
        destinos_ruta: rutaActiva?.destinos
          ?.map(d => (typeof d === 'number' ? d : d?.id))
          .filter(Number.isInteger) ?? undefined,
      }

      const respuesta = await enviarMensaje(historial, contexto, idioma)

      const destinosEncontrados = extraerDestinos(respuesta, todosDestinos)
      const rutaGenerada        = extraerRuta(respuesta, todosDestinos)

      const msgIA = {
        id:       Date.now() + 1,
        rol:      "assistant",
        texto:    respuesta,
        destinos: destinosEncontrados,
        ruta:     rutaGenerada,
      }

      setMensajes(prev => [...prev, msgIA])

      if (destinosEncontrados.length > 0) {
        onDestinosChange?.(destinosEncontrados)
      }

      if (rutaGenerada) {
        setRutaPendiente(rutaGenerada)
        onRutaGenerada?.(rutaGenerada)
      }

    } catch (err) {
      setMensajes(prev => [...prev, {
        id:       Date.now() + 1,
        rol:      "assistant",
        texto:    err.message || "Tuve un problema al conectarme. ¿Puedes intentarlo de nuevo?",
        destinos: [],
        error:    true,
      }])
    } finally {
      setCargando(false)
      inputRef.current?.focus()
    }
  }

  // ============ Herramientas IA extra ============

  const mensajeIA = (parcial) => {
    setMensajes(prev => [...prev, { id: Date.now() + 1, rol: "assistant", destinos: [], ...parcial }])
  }

  const procesarRespuestaIA = (respuesta) => {
    const destinosEncontrados = extraerDestinos(respuesta, todosDestinos)
    const rutaGenerada        = extraerRuta(respuesta, todosDestinos)
    mensajeIA({ texto: respuesta, destinos: destinosEncontrados, ruta: rutaGenerada })
    if (destinosEncontrados.length > 0) onDestinosChange?.(destinosEncontrados)
    if (rutaGenerada) {
      setRutaPendiente(rutaGenerada)
      onRutaGenerada?.(rutaGenerada)
    }
  }

  const clickHerramienta = (id) => {
    if (enviandoHerramienta || cargando) return
    if (id === "jerga") {
      ejecutarHerramienta("jerga")
      return
    }
    if (herramienta === id) {
      setHerramienta(null)
      return
    }
    setFormH(prev => ({ ...prev, dias: 3 }))
    setHerramienta(id)
  }

  const ejecutarHerramienta = async (id) => {
    if (enviandoHerramienta) return
    setEnviandoHerramienta(true)
    try {
      if (id === "jerga") {
        const datos = await frasesViaje("")
        mensajeIA({ texto: "", tipoResultado: "jerga", datos })
        return
      }
      if (id === "empaque") {
        if (!formH.destino.trim()) return
        const lista = await listaEmpaque(formH.destino.trim(), Number(formH.dias) || 3, formH.actividades)
        mensajeIA({ texto: "", tipoResultado: "empaque", datos: { lista, destino: formH.destino.trim(), dias: Number(formH.dias) || 3 } })
        setHerramienta(null)
        return
      }
      if (id === "grupal") {
        const perfiles = formH.perfiles
          .split("\n")
          .map(l => l.trim())
          .filter(Boolean)
          .map(l => {
            const partes = l.split(/[-–:]/)
            return { nombre: (partes[0] || "").trim(), gustos: partes.slice(1).join(" ").trim() }
          })
          .filter(p => p.nombre && p.gustos)
        if (perfiles.length < 2) {
          mensajeIA({ texto: "Escribe al menos 2 personas, una por línea con el formato: **Nombre - gustos** (ej: *Laura - naturaleza y fotos*).", error: true })
          return
        }
        const resp = await planGrupal(perfiles, 3, undefined)
        procesarRespuestaIA(resp)
        setHerramienta(null)
        return
      }
      if (id === "plan") {
        const desc = formH.planViaje.trim()
        if (!desc) return
        setHerramienta(null)
        setFormH(prev => ({ ...prev, planViaje: "" }))
        const mensaje = `Quiero planificar una ruta por el Huila. ${desc}\n\nDame un itinerario día por día con horarios, costos y al final la ruta lista para guardar. Si hace falta afino los detalles en esta misma conversación.`
        await enviar(mensaje)
      }
    } catch (err) {
      mensajeIA({ texto: err.message || "La herramienta no está disponible ahora. Intenta en unos segundos.", error: true })
    } finally {
      setEnviandoHerramienta(false)
    }
  }

  const handleImagen = async (e) => {
    const file = e.target.files[0]
    if (!file) return
    if (file.size > 5 * 1024 * 1024) {
      setMensajes(prev => [...prev, {
        id: Date.now(), rol: "assistant", error: true,
        texto: "La imagen supera los 5 MB. Elige una más pequeña.", destinos: [],
      }])
      e.target.value = ""
      return
    }
    try {
      const dataUrl = await imagenADataUrl(file)
      let ident = null
      try {
        ident = await identificarLugar(dataUrl)
      } catch { /* si falla el detector, seguimos con el chat */ }

      if (ident && ident.destino_id > 0 && ident.confianza >= 60 && ident.lugar) {
        const texto = `Subí una foto y la reconocí como **${ident.lugar}** (${ident.municipio}, Huila). Confianza ${ident.confianza}%. Dame la guía completa de ese lugar: atractivos principales, horarios, precios aproximados y tips para llegar desde Neiva.`
        await enviar(texto, null)
        const d = todosDestinos.find(x => x.id === ident.destino_id)
        if (d) onDestinosChange?.([d])
        return
      }

      await enviar(
        "Actúa como guía experto del departamento del Huila, Colombia. Esta foto SIEMPRE es de un lugar turístico real del Huila (puede ser aérea, panorámica o de archivo) y debo identificarlo con seguridad.\n\n" +
        "Compara el paisaje, colores, relieve y vegetación con destinos reales del Huila: Desierto de la Tatacoa (Villavieja — tonos rojizos y grises, cauces secos, cárcavas), San Agustín (estatuas precolombinas, cañón del Río Magdalena), Gaona (pedregal volcánico), Neiva (río Magdalena, catedral), Pitalito, Guacuyán (Sierra Nevada), Güicán/El Águila (páramo), laguna de Las Margaritas (Bogotá), Salado Blanco, Líbano (neblina y cultivos).\n\n" +
        "Responde EXACTAMENTE en este formato y luego continúa:\n" +
        "LUGAR: <nombre exacto> | MUNICIPIO: <municipio> | DESTINO_ID: <id del catálogo o 0 si no lo encuentras> | CONFIANZA: <0-100>\n\n" +
        "Después detalla: qué se hace ahí, atractivos clave, horarios y precios aproximados, y tips para llegar desde Neiva. Termina agregando el destino con el tag [DESTINOS: id] si coincidió con el catálogo.",
        dataUrl
      )
    } catch {
      setMensajes(prev => [...prev, {
        id: Date.now(), rol: "assistant", error: true,
        texto: "No pude procesar la imagen. Intenta con otra.", destinos: [],
      }])
    }
    e.target.value = ""
  }

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault()
      enviar()
    }
  }

  const guardarRuta = () => {
    if (!usuario) {
      setMensajes(prev => [...prev, {
        id:       Date.now(),
        rol:      "assistant",
        texto:    "Para guardar rutas necesitas iniciar sesión. ¿Te gustaría hacerlo?",
        destinos: [],
      }])
      return
    }
    if (rutaPendiente) {
      onRutaGenerada?.(rutaPendiente, true)
      setRutaPendiente(null)
    }
  }

  const SUGERENCIAS = [
    "Ruta de 4 días por el Huila con $1.000.000",
    "¿Qué destinos de aventura recomiendas?",
    "Ruta para familia con niños",
    "¿Cuánto cuesta visitar la Tatacoa y San Agustín?",
    "Destinos cerca de Neiva",
  ]

  return (
    <div className={styles.wrapper}>
      <div className={styles.mensajes}>
        <AnimatePresence initial={false}>
          {mensajes.map(msg => (
            <motion.div
              key={msg.id}
              className={`${styles.msg} ${msg.rol === "user" ? styles.msgUser : styles.msgIA}`}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.25 }}
            >
              <div className={`${styles.avatar} ${msg.rol === "user" ? styles.avatarUser : styles.avatarIA}`}>
                {msg.rol === "user"
                  ? <PiUserDuotone  size={14} />
                  : <PiRobotDuotone size={14} />
                }
              </div>
              <div className={`${styles.burbuja} ${msg.rol === "user" ? styles.burbujaUser : styles.burbujaIA} ${msg.error ? styles.burbujaError : ""}`}>
                {msg.imagen && (
                  <img
                    src={msg.imagen}
                    alt="imagen subida"
                    className={styles.imagenSubida}
                  />
                )}
                <div dangerouslySetInnerHTML={{ __html: renderTexto(msg.texto) }} />
                {msg.tipoResultado === "empaque" && msg.datos?.lista?.length > 0 && (
                  <div className={styles.resultadoIA}>
                    <h4 className={styles.tituloResultado}>
                      <PiSuitcaseRollingDuotone size={14} />
                      Empaca para {msg.datos.destino} · {msg.datos.dias} día(s)
                    </h4>
                    {msg.datos.lista.map(cat => (
                      <div key={cat.categoria} className={styles.categoriaEmpaque}>
                        <strong>{cat.categoria}</strong>
                        <ul>
                          {(cat.items || []).map((it, i) => <li key={i}>{it}</li>)}
                        </ul>
                      </div>
                    ))}
                  </div>
                )}
                {msg.tipoResultado === "jerga" && msg.datos && (
                  <div className={styles.resultadoIA}>
                    <h4 className={styles.tituloResultado}>
                      <PiQuotesDuotone size={14} />
                      Jerga huilense — así hablamos por acá
                    </h4>
                    <div className={styles.grupoFrases}>
                      {(msg.datos.jerga || []).map((f, i) => (
                        <p key={i} className={styles.fraseItem}>
                          <b>«{f.frase}»</b>
                          {f.significado && <span className={styles.fraseUso}> — {f.significado}</span>}
                          {f.ejemplo && <span className={styles.fraseUso}> · <em>{f.ejemplo}</em></span>}
                        </p>
                      ))}
                    </div>
                  </div>
                )}
                {msg.destinos?.length > 0 && (
                  <div className={styles.chips}>
                    {msg.destinos.map(d => (
                      <button
                        key={d.id}
                        className={styles.chip}
                        onClick={() => onDestinosChange?.([d])}
                      >
                        <PiMapPinDuotone size={11} />
                        {d.nombre}
                      </button>
                    ))}
                  </div>
                )}
                {msg.ruta && (
                  <div className={styles.rutaInfo}>
                    {msg.ruta.presupuesto_total != null && (
                      <span className={styles.presupuestoTag}>
                        <PiCoinsDuotone size={12} />
                        Estimado: ${Number(msg.ruta.presupuesto_total).toLocaleString("es-CO")} COP
                      </span>
                    )}
                    {usuario && (
                      <motion.button
                        className={styles.btnGuardar}
                        onClick={guardarRuta}
                        whileHover={{ scale: 1.03 }}
                        whileTap={{ scale: 0.97 }}
                      >
                        <PiFloppyDiskDuotone size={14} />
                        Guardar ruta "{msg.ruta.nombre}"
                      </motion.button>
                    )}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
        {cargando && (
          <motion.div
            className={`${styles.msg} ${styles.msgIA}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
          >
            <div className={`${styles.avatar} ${styles.avatarIA}`}>
              <PiRobotDuotone size={14} />
            </div>
            <div className={`${styles.burbuja} ${styles.burbujaIA}`}>
              <div className={styles.typing}>
                <span /><span /><span />
              </div>
            </div>
          </motion.div>
        )}
        <div ref={bottomRef} />
      </div>

      {mensajes.length <= 1 && (
        <div className={styles.sugerencias}>
          {SUGERENCIAS.map(s => (
            <button
              key={s}
              className={styles.sugerencia}
              onClick={() => enviar(s)}
            >
              {s}
            </button>
          ))}
        </div>
      )}

      {/* Herramientas IA + traductor */}
      <div className={styles.barraHerramientas}>
        <span className={styles.herrLabel}>
          <PiMagicWandDuotone size={13} /> Huily IA
        </span>
        {HERRAMIENTAS.map(h => (
          <button
            key={h.id}
            className={`${styles.chipHerr} ${herramienta === h.id ? styles.chipHerrActivo : ""}`}
            onClick={() => clickHerramienta(h.id)}
            disabled={enviandoHerramienta || cargando}
            title={h.label}
          >
            <h.icono size={12} />
            {h.label}
          </button>
        ))}
        <div className={styles.grupoIdioma} title="Traductor turístico: idioma de respuesta">
          <PiTranslateDuotone size={13} />
          {IDIOMAS.map(i => (
            <button
              key={i.codigo}
              className={`${styles.chipIdioma} ${idioma === i.codigo ? styles.chipIdiomaActivo : ""}`}
              onClick={() => setIdioma(i.codigo)}
            >
              {i.label}
            </button>
          ))}
        </div>
      </div>

      {/* Panel del formulario de la herramienta seleccionada */}
      {herramienta && herramienta !== "jerga" && (
        <div className={styles.panelHerramienta}>
          {herramienta === "empaque" && (
            <>
              <input
                className={styles.inputHerr}
                placeholder="Destino (ej: San Agustín)"
                value={formH.destino}
                onChange={e => setFormH({ ...formH, destino: e.target.value })}
              />
              <input
                className={styles.inputHerr}
                type="number" min="1" max="30"
                placeholder="Días (ej: 3)"
                value={formH.dias}
                onChange={e => setFormH({ ...formH, dias: e.target.value })}
              />
              <input
                className={styles.inputHerr}
                placeholder="Actividades (ej: senderismo, termas, fotografía...)"
                value={formH.actividades}
                onChange={e => setFormH({ ...formH, actividades: e.target.value })}
              />
            </>
          )}
          {herramienta === "grupal" && (
            <textarea
              className={styles.textareaHerr}
              placeholder={"Una persona por línea: Nombre - gustos\nEj:\nLaura - naturaleza, fotografía\nAndrés - aventura, deportes"}
              rows={3}
              value={formH.perfiles}
              onChange={e => setFormH({ ...formH, perfiles: e.target.value })}
            />
          )}
          {herramienta === "plan" && (
            <textarea
              className={styles.textareaHerr}
              placeholder={"Describe tu viaje soñado: días, presupuesto, lugares, estilo...\nEj: 4 días con $1.000.000, quiero Tatacoa y San Agustín, viaje relajado con buena comida"}
              rows={4}
              value={formH.planViaje}
              onChange={e => setFormH({ ...formH, planViaje: e.target.value })}
            />
          )}
          <div className={styles.accionesHerr}>
            <button className={styles.btnCancelarHerr} onClick={() => setHerramienta(null)}>
              Cancelar
            </button>
            <button
              className={styles.btnEjecutarHerr}
              onClick={() => ejecutarHerramienta(herramienta)}
              disabled={enviandoHerramienta}
            >
              {enviandoHerramienta
                ? <PiSpinnerDuotone size={13} className={styles.spinner} />
                : <PiMagicWandDuotone size={13} />}
              {enviandoHerramienta ? "Pensando..." : "Generar"}
            </button>
          </div>
        </div>
      )}

      <div className={styles.inputArea}>
        <div className={styles.inputWrapper}>
          <button
            className={styles.btnImagen}
            onClick={() => fileRef.current?.click()}
            title="Subir imagen"
          >
            <PiImageDuotone size={18} />
          </button>
          <input
            ref={fileRef}
            type="file"
            accept="image/*"
            style={{ display: "none" }}
            onChange={handleImagen}
          />
          <textarea
            ref={inputRef}
            className={styles.input}
            value={input}
            onChange={e => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder="Pregunta sobre rutas, precios o sube una foto..."
            rows={1}
            disabled={cargando}
          />
          <motion.button
            className={`${styles.btnEnviar} ${(!input.trim() || cargando) ? styles.btnDisabled : ""}`}
            onClick={() => enviar()}
            disabled={!input.trim() || cargando}
            whileHover={input.trim() ? { scale: 1.08 } : {}}
            whileTap={input.trim()   ? { scale: 0.95 } : {}}
          >
            {cargando
              ? <PiSpinnerDuotone size={18} className={styles.spinner} />
              : <PiPaperPlaneTiltDuotone size={18} />
            }
          </motion.button>
        </div>
      </div>
    </div>
  )
}

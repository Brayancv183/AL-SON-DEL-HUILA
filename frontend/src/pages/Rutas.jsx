import { useState, useEffect, useCallback } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  PiMapPinDuotone,
  PiRobotDuotone,
  PiListDuotone,
  PiCaretLeftDuotone,
} from "react-icons/pi"
import { useAuth }    from "../context/AuthContext"
import { getRutas, crearRuta, eliminarRuta } from "../api/rutas"
import { API_URL }    from "../api/config"
import HistorialRutas        from "../components/HistorialRutas"
import ChatRutas             from "../components/ChatRutas"
import MapaRutas             from "../components/MapaRutas"
import styles from "./Rutas.module.css"
import logo from "../assets/images/logo.png"

const TABS_SIDEBAR = [
  { id: "historial", label: "Rutas",  Icon: PiListDuotone  },
  { id: "chat",      label: "Huily",  Icon: PiRobotDuotone },
]

export default function Rutas() {
  const { user } = useAuth()

  const [rutas,         setRutas]         = useState([])
  const [rutaActiva,    setRutaActiva]    = useState(null)
  const [destinosMapa,  setDestinosMapa]  = useState([])
  const [todosDestinos, setTodosDestinos] = useState([])
  const [tabActiva,     setTabActiva]     = useState("chat")
  const [sidebarOpen,   setSidebarOpen]   = useState(true)
  const [loading,       setLoading]       = useState(true)

  // Cargar destinos y rutas
  useEffect(() => {
    const cargar = async () => {
      try {
        const [resDestinos, resRutas] = await Promise.all([
          fetch(`${API_URL}/destinos`).then(r => r.json()),
          getRutas().catch(() => [])
        ])
        setTodosDestinos(resDestinos)
        setRutas(resRutas)
      } catch (err) {
        console.error(err)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  const handleSeleccionarRuta = useCallback((ruta) => {
    setRutaActiva(ruta)
    setDestinosMapa(ruta.destinos || [])
    setTabActiva("chat")
  }, [])

  const handleDestinosChange = useCallback((destinos) => {
    setDestinosMapa(destinos)
  }, [])

  const handleRutaGenerada = useCallback(async (ruta, guardar = false) => {
    setDestinosMapa(ruta.destinos || [])

    if (guardar && user) {
      try {
        const nueva = await crearRuta({
          nombre:    ruta.nombre,
          destinos:  ruta.destinos?.map(d => d.id),
          dias:      ruta.dias,
          publica:   true,
        })
        setRutas(prev => [nueva, ...prev])
        setRutaActiva(nueva)
        setTabActiva("historial")
      } catch (err) {
        console.error("Error guardando ruta:", err)
      }
    }
  }, [user])

  const handleEliminarRuta = useCallback(async (id) => {
    try {
      await eliminarRuta(id)
      setRutas(prev => prev.filter(r => r.id !== id))
      if (rutaActiva?.id === id) {
        setRutaActiva(null)
        setDestinosMapa([])
      }
    } catch (err) {
      console.error(err)
    }
  }, [rutaActiva])

  const handleDestinoClick = useCallback((destino) => {
    setDestinosMapa([destino])
  }, [])

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <p>Cargando rutas...</p>
    </div>
  )

  return (
    <div className={styles.page}>

      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <img src={logo} alt="logo" className={styles.headerLogo} />
          <div>
            <h1 className={styles.headerTitulo}>Rutas del Huila</h1>
            <p className={styles.headerSub}>
              {destinosMapa.length > 0
                ? `${destinosMapa.length} destinos en el mapa`
                : "Explora y crea rutas personalizadas"
              }
            </p>
          </div>
        </div>

        <div className={styles.headerRight}>
          {rutaActiva && (
            <motion.div
              className={styles.rutaActivaBadge}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <PiMapPinDuotone size={14} />
              {rutaActiva.nombre}
            </motion.div>
          )}
          <button
            className={styles.btnToggleSidebar}
            onClick={() => setSidebarOpen(!sidebarOpen)}
          >
            <PiCaretLeftDuotone
              size={18}
              style={{
                transform: sidebarOpen ? "rotate(0deg)" : "rotate(180deg)",
                transition: "transform 0.3s"
              }}
            />
          </button>
        </div>
      </div>

      {/* Layout principal */}
      <div className={styles.layout}>

        {/* Sidebar */}
        <AnimatePresence>
          {sidebarOpen && (
            <motion.aside
              className={styles.sidebar}
              initial={{ width: 0,   opacity: 0 }}
              animate={{ width: 340, opacity: 1 }}
              exit={{   width: 0,   opacity: 0 }}
              transition={{ duration: 0.3, ease: [0.4,0,0.2,1] }}
            >
              {/* Tabs del sidebar */}
              <div className={styles.sidebarTabs}>
                {TABS_SIDEBAR.map(tab => (
                  <button
                    key={tab.id}
                    className={`${styles.sidebarTab} ${tabActiva === tab.id ? styles.sidebarTabActiva : ""}`}
                    onClick={() => setTabActiva(tab.id)}
                  >
                    <tab.Icon size={16} />
                    {tab.label}
                    {tabActiva === tab.id && (
                      <motion.div
                        className={styles.tabIndicator}
                        layoutId="sidebarTabIndicator"
                      />
                    )}
                  </button>
                ))}
              </div>

              {/* Contenido del sidebar */}
              <div className={styles.sidebarContent}>
                <AnimatePresence mode="wait">
                  {tabActiva === "historial" ? (
                    <motion.div
                      key="historial"
                      className={styles.tabPane}
                      initial={{ opacity: 0, x: -10 }}
                      animate={{ opacity: 1, x: 0   }}
                      exit={{   opacity: 0, x: -10   }}
                      transition={{ duration: 0.2 }}
                    >
                      <HistorialRutas
                        rutas={rutas}
                        rutaActiva={rutaActiva}
                        onSeleccionar={handleSeleccionarRuta}
                        onEliminar={handleEliminarRuta}
                        onNueva={() => setTabActiva("chat")}
                        usuario={user}
                      />
                    </motion.div>
                  ) : (
                    <motion.div
                      key="chat"
                      className={styles.tabPane}
                      initial={{ opacity: 0, x: 10 }}
                      animate={{ opacity: 1, x: 0  }}
                      exit={{   opacity: 0, x: 10  }}
                      transition={{ duration: 0.2 }}
                    >
                      <ChatRutas
                        onDestinosChange={handleDestinosChange}
                        onRutaGenerada={handleRutaGenerada}
                        rutaActiva={rutaActiva}
                        todosDestinos={todosDestinos}
                        usuario={user}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            </motion.aside>
          )}
        </AnimatePresence>

        {/* Mapa principal */}
        <div className={styles.mapaContainer}>
          <MapaRutas
            destinos={destinosMapa}
            rutaActiva={rutaActiva}
            onDestinoClick={handleDestinoClick}
          />
        </div>

      </div>
    </div>
  )
}
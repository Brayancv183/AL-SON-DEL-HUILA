import { useState, useEffect, useMemo } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  PiMagnifyingGlassDuotone,
  PiGridFourDuotone,
  PiListDuotone,
} from "react-icons/pi"
import FilterSidebar from "../components/FilterSidebar"
import DestinoCard   from "../components/DestinoCard"
import { getDestinos } from "../api/destinos"
import styles from "./Catalogo.module.css"

export default function Catalogo() {
  const [destinos,  setDestinos]  = useState([])
  const [loading,   setLoading]   = useState(true)
  const [error,     setError]     = useState(null)
  const [busqueda,  setBusqueda]  = useState("")
  const [vista,     setVista]     = useState("grid")
  const [filtros,   setFiltros]   = useState({
    categorias: [],
    entornos:   [],
    etiquetas:  [],
  })

  // Cargar destinos reales desde Laravel
  useEffect(() => {
    const cargar = async () => {
      try {
        setLoading(true)
        const data = await getDestinos()
        setDestinos(data)
      } catch (err) {
        setError(err.message)
      } finally {
        setLoading(false)
      }
    }
    cargar()
  }, [])

  // Filtrado en frontend
  const destinosFiltrados = useMemo(() => {
    return destinos.filter(d => {
      if (busqueda) {
        const q = busqueda.toLowerCase()
        const match =
          d.nombre?.toLowerCase().includes(q)             ||
          d.descripcion?.toLowerCase().includes(q)        ||
          d.municipio?.nombre?.toLowerCase().includes(q)
        if (!match) return false
      }
      if (filtros.categorias.length > 0) {
        if (!filtros.categorias.includes(d.categoria_id)) return false
      }
      if (filtros.entornos.length > 0) {
        if (!filtros.entornos.includes(d.entorno_id)) return false
      }
      if (filtros.etiquetas.length > 0) {
        const ids = d.etiquetas?.map(e => e.id) || []
        if (!filtros.etiquetas.some(id => ids.includes(id))) return false
      }
      return true
    })
  }, [destinos, busqueda, filtros])

  if (loading) return (
    <div className={styles.loadingState}>
      <div className={styles.spinner} />
      <p>Cargando destinos del Huila...</p>
    </div>
  )

  if (error) return (
    <div className={styles.errorState}>
      <p>⚠ {error}</p>
      <span>Verifica que el servidor Laravel esté corriendo</span>
    </div>
  )

  return (
    <main className={styles.page}>

      <div className={styles.header}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.badge}>Explora el Huila</span>
          <h1 className={styles.titulo}>Destinos Turísticos</h1>
          <p className={styles.subtitulo}>
            {destinosFiltrados.length} destinos encontrados
          </p>
        </motion.div>

        <motion.div
          className={styles.toolbar}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.6, delay: 0.15 }}
        >
          <div className={styles.searchWrapper}>
            <PiMagnifyingGlassDuotone size={17} className={styles.searchIcon} />
            <input
              className={styles.searchInput}
              type="text"
              placeholder="Buscar destino, municipio..."
              value={busqueda}
              onChange={e => setBusqueda(e.target.value)}
            />
          </div>

          <div className={styles.vistaBtns}>
            <button
              className={`${styles.vistaBtn} ${vista === "grid" ? styles.vistaActive : ""}`}
              onClick={() => setVista("grid")}
            >
              <PiGridFourDuotone size={18} />
            </button>
            <button
              className={`${styles.vistaBtn} ${vista === "list" ? styles.vistaActive : ""}`}
              onClick={() => setVista("list")}
            >
              <PiListDuotone size={18} />
            </button>
          </div>
        </motion.div>
      </div>

      <div className={styles.layout}>
        <FilterSidebar filtros={filtros} onChange={setFiltros} />

        <div className={styles.content}>
          <AnimatePresence mode="popLayout">
            {destinosFiltrados.length > 0 ? (
              <motion.div
                className={`${styles.grid} ${vista === "list" ? styles.gridList : ""}`}
                layout
              >
                {destinosFiltrados.map((d, i) => (
                  <DestinoCard key={d.id} destino={d} index={i} />
                ))}
              </motion.div>
            ) : (
              <motion.div
                className={styles.empty}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
              >
                <span className={styles.emptyIcon}>🗺️</span>
                <h3>No encontramos destinos</h3>
                <p>Intenta con otros filtros o términos de búsqueda</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </main>
  )
}
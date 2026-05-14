import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PiMagnifyingGlassDuotone,
  PiGridFourDuotone,
  PiListDuotone,
} from "react-icons/pi";
import FilterSidebar from "../components/FilterSidebar";
import DestinoCard from "../components/DestinoCard";
import { getDestinos } from "../api/destinos";
import api from "../services/api";
import styles from "./Catalogo.module.css";

export default function Catalogo() {
  const [destinos, setDestinos] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [busqueda, setBusqueda] = useState("");
  const [vista, setVista] = useState("grid");

  // Filtros seleccionados por el usuario (formato que espera el backend)
  const [filtros, setFiltros] = useState({
    categoria: null,    // ID de la categoría
    municipio: null,    // ID del municipio
    entorno: null,      // ID del entorno
    etiquetas: [],      // array de IDs de etiquetas
  });

  // Opciones para los filtros (cargadas desde la API)
  const [categorias, setCategorias] = useState([]);
  const [municipios, setMunicipios] = useState([]);
  const [entornos, setEntornos] = useState([]);
  const [etiquetas, setEtiquetas] = useState([]);

  // Cargar opciones de filtro al montar el componente
  useEffect(() => {
    const cargarOpciones = async () => {
      try {
        const [cats, muns, ents, etis] = await Promise.all([
          api.get('/categorias'),
          api.get('/municipios'),
          api.get('/entornos'),
          api.get('/etiquetas'),
        ]);
        setCategorias(cats.data);
        setMunicipios(muns.data);
        setEntornos(ents.data);
        setEtiquetas(etis.data);
      } catch (err) {
        console.error('Error al cargar opciones de filtro:', err);
      }
    };
    cargarOpciones();
  }, []);

  // Cargar destinos cuando cambien la búsqueda o los filtros
  const cargarDestinos = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        busqueda: busqueda || undefined,
        categoria: filtros.categoria || undefined,
        municipio: filtros.municipio || undefined,
        entorno: filtros.entorno || undefined,
        etiquetas: filtros.etiquetas.length ? filtros.etiquetas : undefined,
      };
      const data = await getDestinos(params);
      setDestinos(data);
      setError(null);
    } catch (err) {
      console.error(err);
      setError(err.message || 'Error al cargar destinos');
    } finally {
      setLoading(false);
    }
  }, [busqueda, filtros]);

  useEffect(() => {
    cargarDestinos();
  }, [cargarDestinos]);

  // Manejador de cambios en los filtros (viene del FilterSidebar)
  const handleFiltroChange = (nuevosFiltros) => {
    setFiltros(prev => ({ ...prev, ...nuevosFiltros }));
  };

  if (loading && destinos.length === 0) return (
    <div className={styles.loadingState}>
      <div className={styles.spinner} />
      <p>Cargando destinos del Huila...</p>
    </div>
  );

  if (error) return (
    <div className={styles.errorState}>
      <p>⚠ {error}</p>
      <span>Verifica que el servidor Laravel esté corriendo</span>
    </div>
  );

  return (
    <main className={styles.page}>
      <div className={styles.header}>
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6 }}
        >
          <span className={styles.badge}>Explora el Huila</span>
          <h1 className={styles.titulo}>Destinos Turísticos</h1>
          <p className={styles.subtitulo}>
            {destinos.length} destinos encontrados
          </p>
        </motion.div>

        <motion.div
          className={styles.toolbar}
          initial={{ opacity: 0, y: 15 }}
          animate={{ opacity: 1, y: 0 }}
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
        {/* Pasamos las opciones y los filtros al FilterSidebar */}
        <FilterSidebar
          filtros={filtros}
          onChange={handleFiltroChange}
          categorias={categorias}
          municipios={municipios}
          entornos={entornos}
          etiquetas={etiquetas}
        />

        <div className={styles.content}>
          <AnimatePresence mode="popLayout">
            {destinos.length > 0 ? (
              <motion.div
                className={`${styles.grid} ${vista === "list" ? styles.gridList : ""}`}
                layout
              >
                {destinos.map((d, i) => (
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
  );
}
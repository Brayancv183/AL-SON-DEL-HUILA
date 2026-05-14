import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  PiCaretDownDuotone,
  PiFunnelDuotone,
  PiXDuotone,
} from "react-icons/pi"
import styles from "./FilterSidebar.module.css"

function FilterSection({ titulo, items, selected, onToggle }) {
  const [open, setOpen] = useState(true)

  return (
    <div className={styles.section}>
      <button
        className={styles.sectionHeader}
        onClick={() => setOpen(!open)}
      >
        <span>{titulo}</span>
        <motion.div
          animate={{ rotate: open ? 180 : 0 }}
          transition={{ duration: 0.2 }}
        >
          <PiCaretDownDuotone size={16} />
        </motion.div>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            initial={{ height: 0, opacity: 0    }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{   height: 0, opacity: 0    }}
            transition={{ duration: 0.25 }}
            className={styles.sectionBody}
          >
            {items.map(item => {
              const isSelected = selected.includes(item.id)
              return (
                <motion.button
                  key={item.id}
                  className={`${styles.filterItem} ${isSelected ? styles.selected : ""}`}
                  onClick={() => onToggle(item.id)}
                  whileHover={{ x: 3 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <div className={`${styles.checkbox} ${isSelected ? styles.checkboxSelected : ""}`}>
                    {isSelected && (
                      <motion.div
                        className={styles.checkmark}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        transition={{ type: "spring", stiffness: 500 }}
                      />
                    )}
                  </div>
                  <span>{item.nombre}</span>
                </motion.button>
              )
            })}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function FilterSidebar({ 
  filtros,           // objeto con { categoria, municipio, entorno, etiquetas } (IDs)
  onChange,          // función para actualizar filtros (recibe objeto parcial)
  categorias = [],   // array de objetos { id, nombre }
  municipios = [],   // array de objetos { id, nombre }
  entornos = [],     // array de objetos { id, nombre }
  etiquetas = []     // array de objetos { id, nombre }
}) {
  // Convertir los filtros actuales (backend) al formato que usa el sidebar (array de IDs por tipo)
  const [sidebarFiltros, setSidebarFiltros] = useState({
    categorias: filtros.categoria ? [filtros.categoria] : [],
    municipios: filtros.municipio ? [filtros.municipio] : [],
    entornos: filtros.entorno ? [filtros.entorno] : [],
    etiquetas: filtros.etiquetas || [],
  });

  // Sincronizar cuando los filtros del padre cambian (por ejemplo, al limpiar desde fuera)
  useState(() => {
    setSidebarFiltros({
      categorias: filtros.categoria ? [filtros.categoria] : [],
      municipios: filtros.municipio ? [filtros.municipio] : [],
      entornos: filtros.entorno ? [filtros.entorno] : [],
      etiquetas: filtros.etiquetas || [],
    });
  }, [filtros]);

  const totalActivos = 
    sidebarFiltros.categorias.length +
    sidebarFiltros.municipios.length +
    sidebarFiltros.entornos.length +
    sidebarFiltros.etiquetas.length;

  const toggle = (tipo, id) => {
    let nuevos;
    if (tipo === 'categorias') {
      // Solo se permite una categoría a la vez
      nuevos = sidebarFiltros.categorias[0] === id ? [] : [id];
      setSidebarFiltros(prev => ({ ...prev, categorias: nuevos }));
      onChange({ categoria: nuevos[0] || null });
    } else if (tipo === 'municipios') {
      nuevos = sidebarFiltros.municipios[0] === id ? [] : [id];
      setSidebarFiltros(prev => ({ ...prev, municipios: nuevos }));
      onChange({ municipio: nuevos[0] || null });
    } else if (tipo === 'entornos') {
      nuevos = sidebarFiltros.entornos[0] === id ? [] : [id];
      setSidebarFiltros(prev => ({ ...prev, entornos: nuevos }));
      onChange({ entorno: nuevos[0] || null });
    } else if (tipo === 'etiquetas') {
      const actual = sidebarFiltros.etiquetas;
      nuevos = actual.includes(id)
        ? actual.filter(x => x !== id)
        : [...actual, id];
      setSidebarFiltros(prev => ({ ...prev, etiquetas: nuevos }));
      onChange({ etiquetas: nuevos });
    }
  };

  const limpiar = () => {
    setSidebarFiltros({ categorias: [], municipios: [], entornos: [], etiquetas: [] });
    onChange({ categoria: null, municipio: null, entorno: null, etiquetas: [] });
  };

  return (
    <aside className={styles.sidebar}>
      {/* Header */}
      <div className={styles.header}>
        <div className={styles.headerLeft}>
          <PiFunnelDuotone size={18} className={styles.headerIcon} />
          <span className={styles.headerTitle}>Filtros</span>
          {totalActivos > 0 && (
            <motion.span
              className={styles.badge}
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ type: "spring", stiffness: 400 }}
            >
              {totalActivos}
            </motion.span>
          )}
        </div>
        {totalActivos > 0 && (
          <motion.button
            className={styles.clearBtn}
            onClick={limpiar}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <PiXDuotone size={13} />
            Limpiar
          </motion.button>
        )}
      </div>

      {/* Chips activos */}
      <AnimatePresence>
        {totalActivos > 0 && (
          <motion.div
            className={styles.activeChips}
            initial={{ opacity: 0, height: 0    }}
            animate={{ opacity: 1, height: "auto" }}
            exit={{   opacity: 0, height: 0    }}
          >
            {[
              ...sidebarFiltros.categorias.map(id => ({ id, tipo: "categorias", item: categorias.find(c => c.id === id) })),
              ...sidebarFiltros.municipios.map(id => ({ id, tipo: "municipios", item: municipios.find(m => m.id === id) })),
              ...sidebarFiltros.entornos.map(id   => ({ id, tipo: "entornos",   item: entornos.find(e => e.id === id) })),
              ...sidebarFiltros.etiquetas.map(id  => ({ id, tipo: "etiquetas",  item: etiquetas.find(et => et.id === id) })),
            ].filter(({ item }) => item).map(({ id, tipo, item }) => (
              <motion.span
                key={`${tipo}-${id}`}
                className={styles.chip}
                layout
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1   }}
                exit={{   opacity: 0, scale: 0.8  }}
              >
                {item.nombre}
                <button onClick={() => toggle(tipo, id)}>
                  <PiXDuotone size={11} />
                </button>
              </motion.span>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secciones */}
      <div className={styles.sections}>
        <FilterSection
          titulo="Categoría"
          items={categorias}
          selected={sidebarFiltros.categorias}
          onToggle={id => toggle("categorias", id)}
        />
        <FilterSection
          titulo="Municipio"
          items={municipios}
          selected={sidebarFiltros.municipios}
          onToggle={id => toggle("municipios", id)}
        />
        <FilterSection
          titulo="Entorno"
          items={entornos}
          selected={sidebarFiltros.entornos}
          onToggle={id => toggle("entornos", id)}
        />
        <FilterSection
          titulo="Etiquetas"
          items={etiquetas}
          selected={sidebarFiltros.etiquetas}
          onToggle={id => toggle("etiquetas", id)}
        />
      </div>
    </aside>
  )
}
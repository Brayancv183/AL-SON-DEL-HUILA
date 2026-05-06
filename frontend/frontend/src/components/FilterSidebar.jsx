import { useState } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  PiCaretDownDuotone,
  PiFunnelDuotone,
  PiXDuotone,
} from "react-icons/pi"
import { CATEGORIAS, ENTORNOS, ETIQUETAS } from "../data/filtros"
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

export default function FilterSidebar({ filtros, onChange }) {
  const totalActivos =
    filtros.categorias.length +
    filtros.entornos.length   +
    filtros.etiquetas.length

  const toggle = (tipo, id) => {
    const actual = filtros[tipo]
    const nuevo  = actual.includes(id)
      ? actual.filter(x => x !== id)
      : [...actual, id]
    onChange({ ...filtros, [tipo]: nuevo })
  }

  const limpiar = () =>
    onChange({ categorias: [], entornos: [], etiquetas: [] })

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
              ...filtros.categorias.map(id => ({ id, tipo: "categorias" })),
              ...filtros.entornos.map(id   => ({ id, tipo: "entornos"   })),
              ...filtros.etiquetas.map(id  => ({ id, tipo: "etiquetas"  })),
            ].map(({ id, tipo }) => {
              const item = [...CATEGORIAS, ...ENTORNOS, ...ETIQUETAS].find(x => x.id === id)
              return item ? (
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
              ) : null
            })}
          </motion.div>
        )}
      </AnimatePresence>

      {/* Secciones */}
      <div className={styles.sections}>
        <FilterSection
          titulo="Categoría"
          items={CATEGORIAS}
          selected={filtros.categorias}
          onToggle={id => toggle("categorias", id)}
        />
        <FilterSection
          titulo="Entorno"
          items={ENTORNOS}
          selected={filtros.entornos}
          onToggle={id => toggle("entornos", id)}
        />
        <FilterSection
          titulo="Etiquetas"
          items={ETIQUETAS}
          selected={filtros.etiquetas}
          onToggle={id => toggle("etiquetas", id)}
        />
      </div>

    </aside>
  )
}
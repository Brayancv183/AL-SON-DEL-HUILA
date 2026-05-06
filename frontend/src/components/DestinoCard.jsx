import { motion } from "framer-motion"
import { PiMapPinDuotone, PiArrowRightDuotone } from "react-icons/pi"
import styles from "./DestinoCard.module.css"

export default function DestinoCard({ destino, index }) {
  return (
    <motion.div
      className={styles.card}
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0  }}
      transition={{ duration: 0.4, delay: index * 0.07 }}
      whileHover={{ y: -4 }}
      layout
    >
      {/* Imagen o color de fondo */}
      <div
        className={styles.imagen}
        style={{
          backgroundImage: destino.imagen
            ? `url(${destino.imagen})`
            : `linear-gradient(145deg, #C4622Dcc, #C4622D44)`,
        }}
      >
        <span className={styles.categoria}>
          {destino.categoria?.nombre}
        </span>
      </div>

      {/* Contenido */}
      <div className={styles.body}>
        <div className={styles.municipio}>
          <PiMapPinDuotone size={13} />
          <span>{destino.municipio?.nombre}</span>
        </div>

        <h3 className={styles.nombre}>{destino.nombre}</h3>
        <p className={styles.descripcion}>{destino.descripcion}</p>

        {/* Etiquetas */}
        {destino.etiquetas?.length > 0 && (
          <div className={styles.etiquetas}>
            {destino.etiquetas.map(et => (
              <span key={et.id} className={styles.etiqueta}>
                {et.nombre}
              </span>
            ))}
          </div>
        )}

        <motion.button
          className={styles.btn}
          whileHover={{ gap: "0.6rem" }}
        >
          Ver destino
          <PiArrowRightDuotone size={15} />
        </motion.button>
      </div>
    </motion.div>
  )
}
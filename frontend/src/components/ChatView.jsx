 import { motion } from "framer-motion"
import styles from "./ChatView.module.css"

export default function ChatView({ onClose }) {
  return (
    <motion.div
      className={styles.overlay}
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className={styles.panel}
        initial={{ y: 60, opacity: 0 }}
        animate={{ y: 0, opacity: 1 }}
        transition={{ type: "spring", damping: 20 }}
        onClick={e => e.stopPropagation()}
      >
        <button className={styles.close} onClick={onClose}>✕</button>
        <h2 className={styles.title}>¿Qué tipo de experiencia buscas?</h2>
        <p className={styles.sub}>Cuéntanos tus preferencias y te recomendamos los mejores destinos</p>
        <div className={styles.proximamente}>
          🚧 Quiz de preferencias — próximamente
        </div>
      </motion.div>
    </motion.div>
  )
}

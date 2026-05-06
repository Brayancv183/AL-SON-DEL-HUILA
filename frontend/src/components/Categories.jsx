import { motion } from "framer-motion"
import {
  PiMountainsDuotone,
  PiBuildingsDuotone,
  PiBankDuotone,
  PiBookOpenDuotone,
  PiPlanetDuotone,
  PiConfettiDuotone,
} from "react-icons/pi"
import styles from "./Categories.module.css"

const CATEGORIAS = [
  { Icon: PiMountainsDuotone, label: "Aventura" },
  { Icon: PiBuildingsDuotone, label: "Cultural" },
  { Icon: PiBankDuotone, label: "Arqueológico" }, // ✅ corregido
  { Icon: PiBookOpenDuotone, label: "Histórico" },
  { Icon: PiPlanetDuotone, label: "Astronomía" },
  { Icon: PiConfettiDuotone, label: "Festivales" },
]

export default function Categories() {
  return (
    <div className={styles.wrapper}>
      {CATEGORIAS.map(({ Icon, label }, i) => (
        <motion.button
          key={label}
          className={styles.chip}
          initial={{ opacity: 0, y: 12, scale: 0.92 }}
          animate={{ opacity: 1, y: 0, scale: 1 }}
          transition={{ delay: 0.8 + i * 0.07, duration: 0.4 }}
          whileHover={{ scale: 1.07, y: -2 }}
          whileTap={{ scale: 0.95 }}
        >
          <Icon size={16} className={styles.chipIcon} />
          <span>{label}</span>
        </motion.button>
      ))}
    </div>
  )
}
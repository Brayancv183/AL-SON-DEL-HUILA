import { useState } from "react"
import { motion } from "framer-motion"
import { PiMagnifyingGlassDuotone, PiArrowRightDuotone } from "react-icons/pi"
import styles from "./SearchBar.module.css"

export default function SearchBar({ onOpen }) {
  const [focused, setFocused] = useState(false)
  const [query,   setQuery]   = useState("")

  return (
    <motion.div
      className={`${styles.wrapper} ${focused ? styles.focused : ""}`}
      initial={{ opacity: 0, y: -15, scale: 0.97 }}
      animate={{ opacity: 1, y: 0,   scale: 1    }}
      transition={{ duration: 0.6, delay: 0.2 }}
    >
      <PiMagnifyingGlassDuotone
        size={18}
        className={styles.searchIcon}
      />
      <input
        className={styles.input}
        type="text"
        placeholder="¿Qué te gustaría hacer en el Huila?"
        value={query}
        onChange={e => setQuery(e.target.value)}
        onFocus={() => { setFocused(true); onOpen(); }}
        onBlur={() => setFocused(false)}
      />
      <motion.button
        className={styles.btn}
        onClick={onOpen}
        whileHover={{ scale: 1.05, x: 2 }}
        whileTap={{ scale: 0.95 }}
      >
        <span>Buscar</span>
        <PiArrowRightDuotone size={16} />
      </motion.button>
    </motion.div>
  )
}
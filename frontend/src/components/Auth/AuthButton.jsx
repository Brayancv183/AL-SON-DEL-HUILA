 import { motion } from "framer-motion"
import styles from "./AuthInput.module.css"

export default function AuthButton({
  children,
  loading   = false,
  type      = "submit",
  onClick,
  variant   = "primary",
}) {
  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={loading}
      whileHover={!loading ? { scale: 1.02 } : {}}
      whileTap={!loading  ? { scale: 0.98 } : {}}
      style={{
        width:          "100%",
        height:         "50px",
        borderRadius:   "var(--radius-full)",
        border:         variant === "primary" ? "none" : "1px solid #2a2520",
        background:     variant === "primary"
          ? "linear-gradient(135deg, #C4622D, #D4A843)"
          : "transparent",
        color:          variant === "primary" ? "white" : "var(--text-secondary)",
        fontSize:       "0.95rem",
        fontWeight:     600,
        fontFamily:     "var(--font-body)",
        letterSpacing:  "0.03em",
        cursor:         loading ? "not-allowed" : "pointer",
        opacity:        loading ? 0.7 : 1,
        display:        "flex",
        alignItems:     "center",
        justifyContent: "center",
        gap:            "8px",
        boxShadow:      variant === "primary"
          ? "0 4px 20px rgba(196,98,45,0.35)"
          : "none",
        transition:     "box-shadow 0.3s",
      }}
    >
      {loading ? (
        <>
          <span style={{
            width: 16, height: 16,
            border: "2px solid rgba(255,255,255,0.3)",
            borderTopColor: "white",
            borderRadius: "50%",
            animation: "spin 0.7s linear infinite",
          }} />
          Cargando...
        </>
      ) : children}

      <style>{`@keyframes spin { to { transform: rotate(360deg); } }`}</style>
    </motion.button>
  )
}

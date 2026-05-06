import { useState } from "react"
import { motion } from "framer-motion"
import { PiEyeDuotone, PiEyeClosedDuotone } from "react-icons/pi"
import styles from "./AuthInput.module.css"

export default function AuthInput({
  label,
  type = "text",
  name,
  value,
  onChange,
  error,
  icon: Icon,
  autoComplete,
}) {
  const [focused,      setFocused]      = useState(false)
  const [showPassword, setShowPassword] = useState(false)

  const isPassword = type === "password"
  const inputType  = isPassword ? (showPassword ? "text" : "password") : type
  const isFloating = focused || value?.length > 0

  return (
    <div className={styles.wrapper}>
      <motion.div
        className={`
          ${styles.inputBox}
          ${focused ? styles.focused : ""}
          ${error   ? styles.error   : ""}
        `}
        animate={{ borderColor: error ? "#e05252" : focused ? "#D4A843" : "#2a2520" }}
        transition={{ duration: 0.2 }}
      >
        {Icon && (
          <span className={styles.iconLeft}>
            <Icon
              size={16}
              style={{ color: focused ? "var(--color-dorado)" : "var(--text-muted)", transition: "color 0.2s" }}
            />
          </span>
        )}

        <label className={`${styles.label} ${isFloating ? styles.labelFloat : ""} ${Icon ? styles.labelWithIcon : ""}`}>
          {label}
        </label>

        <input
          type={inputType}
          name={name}
          value={value}
          onChange={onChange}
          autoComplete={autoComplete}
          className={`${styles.input} ${Icon ? styles.inputWithIcon : ""} ${isPassword ? styles.inputPassword : ""}`}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
        />

        {isPassword && (
          <button
            type="button"
            className={styles.eyeBtn}
            onClick={() => setShowPassword(p => !p)}
            tabIndex={-1}
          >
            {showPassword
              ? <PiEyeClosedDuotone size={17} />
              : <PiEyeDuotone size={17} />
            }
          </button>
        )}
      </motion.div>

      {error && (
        <motion.p
          className={styles.errorMsg}
          initial={{ opacity: 0, y: -4 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.2 }}
        >
          {error}
        </motion.p>
      )}
    </div>
  )
} 

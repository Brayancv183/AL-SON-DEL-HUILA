import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  PiUserDuotone,
  PiEnvelopeDuotone,
  PiLockDuotone,
  PiShieldDuotone,
} from "react-icons/pi"
import AuthInput    from "../components/auth/AuthInput"
import AuthButton   from "../components/auth/AuthButton"
import GoogleButton from "../components/auth/GoogleButton"
import { useRegister, getPasswordStrength } from "../hooks/useAuth"
import styles from "./Register.module.css"
import logo from "../assets/images/logo.png"

function PasswordStrength({ password }) {
  const { score, label, color } = getPasswordStrength(password)
  if (!password) return null
  return (
    <div className={styles.strength}>
      <div className={styles.strengthBars}>
        {[0,1,2,3].map(i => (
          <div
            key={i}
            className={styles.strengthBar}
            style={{ backgroundColor: i < score ? color : "#1e1b17" }}
          />
        ))}
      </div>
      {label && <span style={{ color, fontSize: "0.72rem" }}>{label}</span>}
    </div>
  )
}

export default function Register() {
  const { fields, errors, globalError, loading, handleChange, handleSubmit } = useRegister()
const handleGoogle = () => {
  window.location.href = "http://127.0.0.1:8000/api/auth/google"
}
  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} />

      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0,  scale: 1    }}
        transition={{ duration: 0.5, ease: [0.4,0,0.2,1] }}
      >
        <Link to="/" className={styles.logoRow}>
          <img src={logo} alt="logo" className={styles.logoImg} />
          <span className={styles.logoName}>
            Al Son <span>del Huila</span>
          </span>
        </Link>

        <h1 className={styles.heading}>Crea tu cuenta</h1>
        <p className={styles.subheading}>Únete gratis y descubre el Huila</p>

        {globalError && (
          <motion.div
            className={styles.errorBanner}
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
          >
            ⚠ {globalError}
          </motion.div>
        )}

        <GoogleButton onClick={handleGoogle} label="Registrarse con Google" />

        <div className={styles.divider}>
          <span /><p>o con tu email</p><span />
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <AuthInput
            label="Nombre completo"
            type="text"
            name="name"
            value={fields.name}
            onChange={handleChange}
            error={errors.name}
            icon={PiUserDuotone}
            autoComplete="name"
          />
          <AuthInput
            label="Correo electrónico"
            type="email"
            name="email"
            value={fields.email}
            onChange={handleChange}
            error={errors.email}
            icon={PiEnvelopeDuotone}
            autoComplete="email"
          />
          <AuthInput
            label="Contraseña"
            type="password"
            name="password"
            value={fields.password}
            onChange={handleChange}
            error={errors.password}
            icon={PiLockDuotone}
            autoComplete="new-password"
          />
          <PasswordStrength password={fields.password} />
          <AuthInput
            label="Confirmar contraseña"
            type="password"
            name="confirmPassword"
            value={fields.confirmPassword}
            onChange={handleChange}
            error={errors.confirmPassword}
            icon={PiShieldDuotone}
            autoComplete="new-password"
          />

          <AuthButton loading={loading}>Crear cuenta</AuthButton>
        </form>

        <p className={styles.terms}>
          Al registrarte aceptas nuestros{" "}
          <a href="#">Términos de uso</a> y{" "}
          <a href="#">Política de privacidad</a>
        </p>

        <p className={styles.footer}>
          ¿Ya tienes cuenta?{" "}
          <Link to="/login">Iniciar sesión</Link>
        </p>
      </motion.div>
    </div>
  )
}
import { useState } from "react"
import { Link, useNavigate, useLocation } from "react-router-dom"
import { motion } from "framer-motion"
import { PiEnvelopeDuotone, PiLockDuotone } from "react-icons/pi"
import AuthInput    from "../components/auth/AuthInput"
import AuthButton   from "../components/auth/AuthButton"
import GoogleButton from "../components/auth/GoogleButton"
import { useAuth } from "../context/AuthContext"
import styles from "./Login.module.css"
import logo from "../assets/images/logo.png"

export default function Login() {
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [loading, setLoading] = useState(false)
  const { login } = useAuth()
  const navigate = useNavigate()
  const location = useLocation()
  const from = location.state?.from?.pathname || "/"

  const handleSubmit = async (e) => {
    e.preventDefault()
    setError("")
    setLoading(true)
    try {
      await login(email, password)   // login del contexto
      navigate(from, { replace: true })
    } catch (err) {
      setError(err.response?.data?.message || "Credenciales incorrectas")
    } finally {
      setLoading(false)
    }
  }

  const handleGoogle = () => {
    localStorage.setItem('redirectAfterGoogle', window.location.pathname + window.location.search);
    window.location.href = "http://localhost:8000/api/auth/google"
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} />
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 24, scale: 0.97 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.5 }}
      >
        <Link to="/" className={styles.logoRow}>
          <img src={logo} alt="logo" className={styles.logoImg} />
          <span className={styles.logoName}>
            Al Son <span>del Huila</span>
          </span>
        </Link>

        <h1 className={styles.heading}>Bienvenido de vuelta</h1>
        <p className={styles.subheading}>Ingresa tus datos para continuar</p>

        {error && (
          <motion.div className={styles.errorBanner} initial={{ opacity: 0, y: -8 }} animate={{ opacity: 1, y: 0 }}>
            ⚠ {error}
          </motion.div>
        )}

        <GoogleButton onClick={handleGoogle} />

        <div className={styles.divider}>
          <span /><p>o con tu email</p><span />
        </div>

        <form onSubmit={handleSubmit} className={styles.form} noValidate>
          <AuthInput
            label="Correo electrónico"
            type="email"
            name="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            error=""
            icon={PiEnvelopeDuotone}
            autoComplete="email"
          />
          <AuthInput
            label="Contraseña"
            type="password"
            name="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            error=""
            icon={PiLockDuotone}
            autoComplete="current-password"
          />
          <div className={styles.forgotRow}>
            <Link to="/forgot-password" className={styles.forgotLink}>
              ¿Olvidaste tu contraseña?
            </Link>
          </div>
          <AuthButton loading={loading}>Iniciar sesión</AuthButton>
        </form>

        <p className={styles.footer}>
          ¿No tienes cuenta? <Link to="/register">Crear una cuenta</Link>
        </p>
      </motion.div>
    </div>
  )
}
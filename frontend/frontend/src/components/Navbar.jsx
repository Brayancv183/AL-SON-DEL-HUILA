import { Link, useLocation } from "react-router-dom"
import { useState, useEffect } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  PiHouseDuotone,
  PiMapPinDuotone,
  PiCompassDuotone,
  PiLightningDuotone,
  PiSignInDuotone,
  PiUserPlusDuotone,
  PiListDuotone,
  PiXDuotone,
} from "react-icons/pi"
import styles from "./Navbar.module.css"
import logo from "../assets/images/logo.png"

const LINKS = [
  { to: "/",            label: "Inicio",      Icon: PiHouseDuotone     },
  { to: "/catalogo",    label: "Destinos",    Icon: PiMapPinDuotone    },
  { to: "/actividades", label: "Actividades", Icon: PiLightningDuotone },
  { to: "/rutas",       label: "Rutas",       Icon: PiCompassDuotone   },
]

export default function Navbar() {
  const [scrolled, setScrolled] = useState(false)
  const [menuOpen, setMenuOpen] = useState(false)
  const location = useLocation()

  useEffect(() => {
    const fn = () => setScrolled(window.scrollY > 60)
    window.addEventListener("scroll", fn)
    return () => window.removeEventListener("scroll", fn)
  }, [])

  useEffect(() => { setMenuOpen(false) }, [location])

  return (
    <>
      <motion.nav
        className={`${styles.navbar} ${scrolled ? styles.scrolled : ""}`}
        initial={{ y: -80, opacity: 0 }}
        animate={{ y: 0,   opacity: 1 }}
        transition={{ duration: 0.7, ease: [0.4, 0, 0.2, 1] }}
      >
        {/* Logo */}
        <Link to="/" className={styles.logo}>
          <motion.img
            src={logo}
            alt="Al Son del Huila"
            className={styles.logoImg}
            whileHover={{ rotate: 10, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 300 }}
          />
          <span className={styles.logoText}>
            Al Son <span className={styles.logoAccent}>del Huila</span>
          </span>
        </Link>

        {/* Links desktop */}
        <ul className={styles.links}>
          {LINKS.map(({ to, label, Icon }) => (
            <li key={to}>
              <Link
                to={to}
                className={`${styles.link} ${location.pathname === to ? styles.active : ""}`}
              >
                <Icon size={15} className={styles.linkIcon} />
                {label}
                {location.pathname === to && (
                  <motion.div
                    className={styles.activeDot}
                    layoutId="activeDot"
                    transition={{ type: "spring", stiffness: 380, damping: 30 }}
                  />
                )}
              </Link>
            </li>
          ))}
        </ul>

        {/* Auth */}
        <div className={styles.auth}>
          <Link to="/login" className={styles.btnLogin}>
            <PiSignInDuotone size={16} />
            Ingresar
          </Link>
          <motion.div whileHover={{ scale: 1.04 }} whileTap={{ scale: 0.97 }}>
            <Link to="/register" className={styles.btnRegistro}>
              <PiUserPlusDuotone size={16} />
              Registrarse
            </Link>
          </motion.div>
        </div>

        {/* Hamburguesa */}
        <button
          className={styles.hamburger}
          onClick={() => setMenuOpen(!menuOpen)}
        >
          {menuOpen
            ? <PiXDuotone    size={24} />
            : <PiListDuotone size={24} />
          }
        </button>
      </motion.nav>

      {/* Menú móvil */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            className={styles.mobileMenu}
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0   }}
            exit={{    opacity: 0, y: -20  }}
            transition={{ duration: 0.25 }}
          >
            {LINKS.map(({ to, label, Icon }, i) => (
              <motion.div
                key={to}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0   }}
                transition={{ delay: i * 0.07  }}
              >
                <Link to={to} className={styles.mobileLink}>
                  <Icon size={18} />
                  {label}
                </Link>
              </motion.div>
            ))}
            <div className={styles.mobileDivider} />
            <Link to="/login" className={styles.mobileBtnLogin}>
              <PiSignInDuotone size={18} /> Ingresar
            </Link>
            <Link to="/registro" className={styles.mobileBtnRegistro}>
              <PiUserPlusDuotone size={18} /> Registrarse
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
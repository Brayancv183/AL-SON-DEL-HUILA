import { Link } from "react-router-dom"
import { motion } from "framer-motion"
import {
  PiInstagramLogoDuotone,
  PiFacebookLogoDuotone,
  PiTiktokLogoDuotone,
  PiYoutubeLogoDuotone,
  PiMapPinDuotone,
  PiEnvelopeDuotone,
  PiPhoneDuotone,
  PiArrowRightDuotone,
} from "react-icons/pi"
import styles from "./Footer.module.css"
import logo from "../assets/images/logo.png"

const SOCIAL = [
  { Icon: PiInstagramLogoDuotone, href: "#", label: "Instagram" },
  { Icon: PiFacebookLogoDuotone,  href: "#", label: "Facebook"  },
  { Icon: PiTiktokLogoDuotone,    href: "#", label: "TikTok"    },
  { Icon: PiYoutubeLogoDuotone,   href: "#", label: "YouTube"   },
]

const LINKS_EXPLORAR = [
  { to: "/catalogo",    label: "Destinos"    },
  { to: "/actividades", label: "Actividades" },
  { to: "/rutas",       label: "Rutas"       },
]

const LINKS_CUENTA = [
  { to: "/login",    label: "Iniciar sesión" },
  { to: "/registro", label: "Registrarse"    },
  { to: "/perfil",   label: "Mi perfil"      },
]

const LINKS_LEGAL = [
  { to: "/Privacidad", label: "Privacidad"       },
  { to: "/Terminos", label: "Términos de uso"  },
  { to: "/Cookies", label: "Cookies"          },
]

export default function Footer() {
  return (
    <footer className={styles.footer}>

      {/* Línea decorativa superior */}
      <div className={styles.topLine} />

      <div className={styles.container}>

        {/* ── Marca ── */}
        <div className={styles.brand}>
          <motion.img
            src={logo}
            alt="Al Son del Huila"
            className={styles.brandLogo}
            whileHover={{ rotate: 15, scale: 1.1 }}
            transition={{ type: "spring", stiffness: 280 }}
          />
          <h3 className={styles.brandName}>
            Al Son <span>del Huila</span>
          </h3>
          <p className={styles.brandDesc}>
            Descubre la magia del departamento del Huila.
            Naturaleza, cultura y aventura te esperan en
            cada rincón de esta tierra única.
          </p>

          {/* Redes sociales */}
          <div className={styles.social}>
            {SOCIAL.map(({ Icon, href, label }) => (
              <motion.a
                key={label}
                href={href}
                className={styles.socialBtn}
                aria-label={label}
                whileHover={{ scale: 1.15, y: -3 }}
                whileTap={{ scale: 0.95 }}
              >
                <Icon size={18} />
              </motion.a>
            ))}
          </div>

          {/* Contacto */}
          <div className={styles.contact}>
            <div className={styles.contactItem}>
              <PiMapPinDuotone size={15} />
              <span>Neiva, Huila — Colombia</span>
            </div>
            <div className={styles.contactItem}>
              <PiEnvelopeDuotone size={15} />
              <span>info@alsondelhuila.co</span>
            </div>
            <div className={styles.contactItem}>
              <PiPhoneDuotone size={15} />
              <span>+57 300 000 0000</span>
            </div>
          </div>
        </div>

        {/* ── Explorar ── */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Explorar</h4>
          {LINKS_EXPLORAR.map(({ to, label }) => (
            <Link key={label} to={to} className={styles.colLink}>
              <PiArrowRightDuotone size={13} />
              {label}
            </Link>
          ))}
        </div>

        {/* ── Cuenta ── */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Cuenta</h4>
          {LINKS_CUENTA.map(({ to, label }) => (
            <Link key={label} to={to} className={styles.colLink}>
              <PiArrowRightDuotone size={13} />
              {label}
            </Link>
          ))}
        </div>

        {/* ── Legal ── */}
        <div className={styles.col}>
          <h4 className={styles.colTitle}>Legal</h4>
          {LINKS_LEGAL.map(({ to, label }) => (
            <Link key={label} to={to} className={styles.colLink}>
              <PiArrowRightDuotone size={13} />
              {label}
            </Link>
          ))}
        </div>

      </div>

      {/* ── Bottom bar ── */}
      <div className={styles.bottom}>
        <div className={styles.bottomLine} />
        <div className={styles.bottomContent}>
          <p>© 2025 Al Son del Huila — Todos los derechos reservados</p>
          <p className={styles.bottomRight}>
            Hecho con ♥ en Neiva, Colombia
          </p>
        </div>
      </div>

    </footer>
  )
}
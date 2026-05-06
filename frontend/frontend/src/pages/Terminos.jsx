 import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { PiArrowLeftDuotone, PiScrollDuotone } from "react-icons/pi"
import styles from "./Terminos.module.css"

const SECCIONES = [
  {
    titulo: "1. Aceptación de los términos",
    contenido: `Al acceder y utilizar la plataforma Al Son del Huila, aceptas cumplir con estos Términos de Uso. Si no estás de acuerdo con alguna parte de estos términos, no debes usar la plataforma. El uso continuado de la plataforma constituye tu aceptación de cualquier modificación a estos términos.`
  },
  {
    titulo: "2. Descripción del servicio",
    contenido: `Al Son del Huila es una plataforma web de turismo regional que permite a los usuarios descubrir destinos turísticos del departamento del Huila, Colombia. Ofrecemos recomendaciones personalizadas basadas en preferencias del usuario, exploración de destinos mediante mapas interactivos y herramientas de planificación de viajes.`
  },
  {
    titulo: "3. Registro y cuenta de usuario",
    contenido: `Para acceder a funciones personalizadas debes crear una cuenta proporcionando información veraz y actualizada. Eres responsable de mantener la confidencialidad de tu contraseña y de todas las actividades que ocurran bajo tu cuenta. Debes notificarnos inmediatamente sobre cualquier uso no autorizado.`
  },
  {
    titulo: "4. Uso aceptable",
    contenido: `Te comprometes a usar la plataforma únicamente para fines lícitos y de manera que no infrinja los derechos de terceros. Está prohibido usar la plataforma para distribuir contenido falso, ofensivo o que viole derechos de autor, realizar actividades fraudulentas o intentar acceder sin autorización a sistemas informáticos.`
  },
  {
    titulo: "5. Contenido de la plataforma",
    contenido: `La información sobre destinos turísticos es proporcionada con fines informativos. Si bien nos esforzamos por mantenerla actualizada y precisa, no garantizamos la exactitud completa de los horarios, precios o disponibilidad de servicios. Te recomendamos verificar la información directamente con los prestadores de servicios.`
  },
  {
    titulo: "6. Propiedad intelectual",
    contenido: `Todo el contenido de la plataforma, incluyendo textos, imágenes, logotipos y diseño, está protegido por derechos de autor. No está permitido reproducir, distribuir o modificar el contenido sin autorización previa por escrito. El uso de la plataforma no te otorga ningún derecho de propiedad sobre el contenido.`
  },
  {
    titulo: "7. Limitación de responsabilidad",
    contenido: `Al Son del Huila no se hace responsable por daños directos o indirectos derivados del uso de la plataforma, incluyendo pérdidas de datos, interrupciones del servicio o inexactitudes en la información turística. La plataforma se ofrece tal como está, sin garantías de disponibilidad continua.`
  },
  {
    titulo: "8. Modificaciones del servicio",
    contenido: `Nos reservamos el derecho de modificar, suspender o discontinuar cualquier parte del servicio en cualquier momento. También podemos actualizar estos términos cuando sea necesario. Los cambios significativos serán comunicados a los usuarios registrados con antelación razonable.`
  },
]

export default function Terminos() {
  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} />

      <div className={styles.container}>

        <motion.div
          initial={{ opacity: 0, x: -10 }}
          animate={{ opacity: 1, x: 0   }}
          transition={{ duration: 0.4 }}
        >
          <Link to="/" className={styles.backLink}>
            <PiArrowLeftDuotone size={16} />
            Volver al inicio
          </Link>
        </motion.div>

        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className={styles.iconWrapper}>
            <PiScrollDuotone size={28} />
          </div>
          <div>
            <span className={styles.badge}>Legal</span>
            <h1 className={styles.titulo}>Términos de Uso</h1>
            <p className={styles.fecha}>Última actualización: Abril 2025</p>
          </div>
        </motion.div>

        <motion.p
          className={styles.intro}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          Estos términos regulan el uso de la plataforma <strong>Al Son del Huila</strong>.
          Al utilizar nuestros servicios, aceptas estos términos en su totalidad.
          Por favor léelos cuidadosamente antes de usar la plataforma.
        </motion.p>

        <div className={styles.secciones}>
          {SECCIONES.map((sec, i) => (
            <motion.div
              key={i}
              className={styles.seccion}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0  }}
              transition={{ duration: 0.5, delay: 0.1 * i }}
            >
              <h2 className={styles.seccionTitulo}>{sec.titulo}</h2>
              <p className={styles.seccionTexto}>{sec.contenido}</p>
            </motion.div>
          ))}
        </div>

        <motion.div
          className={styles.footer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>
            ¿Tienes preguntas?{" "}
            <a href="mailto:info@alsondelhuila.co">info@alsondelhuila.co</a>
          </p>
          <Link to="/privacidad">Ver Política de Privacidad →</Link>
        </motion.div>

      </div>
    </div>
  )
}

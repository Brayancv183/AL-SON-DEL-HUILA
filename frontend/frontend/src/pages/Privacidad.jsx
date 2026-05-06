import { motion } from "framer-motion"
import { Link } from "react-router-dom"
import { PiArrowLeftDuotone, PiShieldDuotone } from "react-icons/pi"
import styles from "./Privacidad.module.css"

const SECCIONES = [
  {
    titulo: "1. Información que recopilamos",
    contenido: `Al registrarte en Al Son del Huila, recopilamos información personal como tu nombre, correo electrónico y preferencias turísticas. También recopilamos datos de uso de la plataforma, como los destinos que consultas y las rutas que generas, con el fin de mejorar tu experiencia.`
  },
  {
    titulo: "2. Uso de la información",
    contenido: `Los datos recopilados se utilizan exclusivamente para el funcionamiento de la plataforma: generar recomendaciones personalizadas de destinos turísticos, mostrar lugares cercanos según tu ubicación y mejorar continuamente el servicio. No compartimos tu información con terceros sin tu consentimiento.`
  },
  {
    titulo: "3. Protección de datos",
    contenido: `La plataforma cumple con la Ley 1581 de 2012 de Protección de Datos Personales de Colombia. Tus datos son almacenados de forma segura y solo el personal autorizado tiene acceso a ellos. Implementamos medidas técnicas para proteger tu información contra accesos no autorizados.`
  },
  {
    titulo: "4. Derechos del usuario",
    contenido: `Como usuario tienes derecho a acceder, modificar o eliminar tu información personal en cualquier momento desde tu perfil. También puedes solicitar la eliminación completa de tu cuenta y todos los datos asociados enviando un correo a info@alsondelhuila.co.`
  },
  {
    titulo: "5. Uso de cookies",
    contenido: `Utilizamos cookies técnicas necesarias para el funcionamiento de la plataforma, como mantener tu sesión iniciada. No utilizamos cookies de seguimiento publicitario. Puedes configurar tu navegador para rechazar cookies, aunque esto puede afectar el funcionamiento de algunas funciones.`
  },
  {
    titulo: "6. Geolocalización",
    contenido: `La plataforma puede solicitar acceso a tu ubicación para mostrarte destinos turísticos cercanos. Este acceso es completamente opcional y puedes denegarlo sin perder acceso a las demás funcionalidades. Tu ubicación nunca es almacenada de forma permanente.`
  },
  {
    titulo: "7. Cambios en la política",
    contenido: `Nos reservamos el derecho de actualizar esta política de privacidad cuando sea necesario. Te notificaremos de cambios significativos a través de tu correo registrado. El uso continuado de la plataforma después de los cambios implica la aceptación de la nueva política.`
  },
]

export default function Privacidad() {
  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} />

      <div className={styles.container}>

        {/* Volver */}
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

        {/* Header */}
        <motion.div
          className={styles.header}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0  }}
          transition={{ duration: 0.6, delay: 0.1 }}
        >
          <div className={styles.iconWrapper}>
            <PiShieldDuotone size={28} />
          </div>
          <div>
            <span className={styles.badge}>Legal</span>
            <h1 className={styles.titulo}>Política de Privacidad</h1>
            <p className={styles.fecha}>Última actualización: Abril 2025</p>
          </div>
        </motion.div>

        {/* Intro */}
        <motion.p
          className={styles.intro}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.6, delay: 0.2 }}
        >
          En <strong>Al Son del Huila</strong> nos comprometemos a proteger
          tu privacidad y el tratamiento responsable de tus datos personales,
          en cumplimiento con la normativa colombiana vigente.
        </motion.p>

        {/* Secciones */}
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

        {/* Footer */}
        <motion.div
          className={styles.footer}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.8 }}
        >
          <p>
            ¿Tienes preguntas sobre tu privacidad?{" "}
            <a href="mailto:info@alsondelhuila.co">info@alsondelhuila.co</a>
          </p>
          <Link to="/terminos">Ver Términos de Uso →</Link>
        </motion.div>

      </div>
    </div>
  )
} 

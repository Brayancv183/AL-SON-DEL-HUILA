import { useNavigate } from "react-router-dom"
import { motion } from "framer-motion"
import {
  PiArrowRightDuotone,
  PiMapPinDuotone,
  PiUsersDuotone,
  PiMountainsDuotone,
} from "react-icons/pi"
import styles from "./Hero.module.css"
import Aurora from "./Aurora"
import CardSwap, { Card } from "./CardSwap"
import Categories from "./Categories"
import logo from "../assets/images/logo.png"

import imgTatacoa from "../assets/images/tatacoa.jpg"
import imgSanAgustin from "../assets/images/san-agustin.jpg"
import imgMagdalena from "../assets/images/magdalena.jpg"
import imgRivera from "../assets/images/rivera.jpg"

const DESTINOS = [
  {
    titulo:    "Desierto de la Tatacoa",
    categoria: "Naturaleza",
    desc:      "Paisajes rojos bajo un cielo estrellado único",
    img:       imgTatacoa,
    color:     "#C4622D",
  },
  {
    titulo:    "San Agustín",
    categoria: "Arqueología",
    desc:      "Guardianes de piedra de una civilización ancestral",
    img:       imgSanAgustin,
    color:     "#5A7A4A",
  },
  {
    titulo:    "Río Magdalena",
    categoria: "Aventura",
    desc:      "El gran río que nace en el corazón del Huila",
    img:       imgMagdalena,
    color:     "#2D6A8A",
  },
  {
    titulo:    "Termales Rivera",
    categoria: "Bienestar",
    desc:      "Aguas que sanan, paisajes que enamoran",
    img:       imgRivera,
    color:     "#7A4A6A",
  },
]

const STATS = [
  { Icon: PiMapPinDuotone,    valor: "37",  label: "Municipios" },
  { Icon: PiMountainsDuotone, valor: "120+",label: "Destinos"   },
  { Icon: PiUsersDuotone,     valor: "50K+",label: "Viajeros"   },
]

export default function Hero() {
  const navigate = useNavigate()

  return (
    <section className={styles.hero}>

      {/* Aurora de fondo */}
      <div className={styles.auroraWrapper}>
        <Aurora
          colorStops={["#C4622D", "#D4A843", "#2D5A27"]}
          amplitude={1.2}
          blend={0.6}
          speed={0.8}
        />
      </div>

      <div className={styles.overlay} />

      {/* Layout principal */}
      <div className={styles.layout}>

        {/* ── Columna izquierda ── */}
        <div className={styles.leftCol}>

          {/* Badge con logo */}
          <motion.div
            className={styles.badge}
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0   }}
            transition={{ duration: 0.6, delay: 0.2 }}
          >
            <img src={logo} alt="logo.png" className={styles.badgeLogo} />
            <span>Turismo del Huila — Colombia</span>
          </motion.div>

          {/* Título */}
          <motion.div
            className={styles.textBlock}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.8, delay: 0.35 }}
          >
            <h1 className={styles.title}>
              Explora el Huila
              <br />
              <span className={styles.titleAccent}>a tu manera</span>
            </h1>
            <p className={styles.subtitle}>
              Descubre destinos únicos, crea rutas personalizadas
              y vive experiencias que solo el Huila puede darte.
            </p>
          </motion.div>

          {/* Botones */}
          <motion.div
            className={styles.btnGroup}
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.7, delay: 0.5 }}
          >
            <motion.button
              className={styles.btnPrimary}
              onClick={() => navigate("/quiz")}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.96 }}
            >
              Crear mi ruta
              <PiArrowRightDuotone size={18} />
            </motion.button>

            <motion.div
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <a href="/catalogo" className={styles.btnSecondary}>
                Ver destinos
              </a>
            </motion.div>
          </motion.div>

          {/* Categorías */}
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0  }}
            transition={{ duration: 0.7, delay: 0.7 }}
          >
            <Categories />
          </motion.div>

          {/* Stats */}
          <motion.div
            className={styles.stats}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 0.8, delay: 1 }}
          >
            {STATS.map(({ Icon, valor, label }) => (
              <div key={label} className={styles.stat}>
                <Icon size={18} className={styles.statIcon} />
                <span className={styles.statValor}>{valor}</span>
                <span className={styles.statLabel}>{label}</span>
              </div>
            ))}
          </motion.div>

        </div>

        {/* ── Columna derecha — CardSwap ── */}
        <motion.div
          className={styles.rightCol}
          initial={{ opacity: 0, x: 50 }}
          animate={{ opacity: 1, x: 0  }}
          transition={{ duration: 0.9, delay: 0.4 }}
        >
          <CardSwap
            width={340}
            height={430}
            cardDistance={55}
            verticalDistance={65}
            delay={4000}
            pauseOnHover={true}
            skewAmount={5}
            easing="elastic"
          >
            {DESTINOS.map((dest, i) => (
              <Card key={i}>
                <div
                  className={styles.cardInner}
                  style={{
                    backgroundImage: dest.img
                      ? `url(${dest.img})`
                      : `linear-gradient(145deg, ${dest.color}ee, ${dest.color}44)`,
                    backgroundSize:     "cover",
                    backgroundPosition: "center",
                  }}
                >
                  <div className={styles.cardOverlay} />
                  <div className={styles.cardTop}>
                    <span className={styles.cardCategoria}>
                      {dest.categoria}
                    </span>
                  </div>
                  <div className={styles.cardContent}>
                    <h3 className={styles.cardTitulo}>{dest.titulo}</h3>
                    <p className={styles.cardDesc}>{dest.desc}</p>
                    <div className={styles.cardFooter}>
                      <PiMapPinDuotone size={14} />
                      <span>Huila, Colombia</span>
                    </div>
                  </div>
                </div>
              </Card>
            ))}
          </CardSwap>
        </motion.div>

      </div>
    </section>
  )
}
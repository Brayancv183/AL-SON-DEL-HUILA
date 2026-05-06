import { useState, useEffect } from "react"
import { useNavigate } from "react-router-dom"
import { motion, AnimatePresence } from "framer-motion"
import { useAuthContext } from "../context/AuthContext"
import {
  PiMountainsDuotone,
  PiBuildingsDuotone,
  PiTreeDuotone,
  PiForkKnifeDuotone,
  PiStarDuotone,
  PiHeartDuotone,
  PiUsersThreeDuotone,
  PiPersonDuotone,
  PiSunDuotone,
  PiArrowRightDuotone,
  PiArrowLeftDuotone,
  PiCameraRotateDuotone,
  PiWavesDuotone,
  PiTreeEvergreenDuotone,
  PiShovelDuotone,
} from "react-icons/pi"
import styles from "./Quiz.module.css"
import logo from "../assets/images/logo.png"

// Preguntas conectadas a tu BD real
const PREGUNTAS = [
  {
    id:       "categorias",
    pregunta: "¿Qué tipo de experiencia buscas?",
    subtitulo:"Puedes elegir varias",
    multiple: true,
    opciones: [
      { valor: 1,  label: "Naturaleza",    Icon: PiMountainsDuotone      },
      { valor: 2,  label: "Cultural",      Icon: PiBuildingsDuotone      },
      { valor: 3,  label: "Arqueológico",  Icon: PiShovelDuotone         },
      { valor: 4,  label: "Aventura",      Icon: PiTreeDuotone           },
      { valor: 5,  label: "Gastronómico",  Icon: PiForkKnifeDuotone      },
      { valor: 8,  label: "Astronómico",   Icon: PiStarDuotone           },
      { valor: 9,  label: "Festivales",    Icon: PiSunDuotone            },
      { valor: 10, label: "Bienestar",     Icon: PiHeartDuotone          },
    ],
  },
  {
    id:       "entornos",
    pregunta: "¿Qué entorno te inspira más?",
    subtitulo:"Puedes elegir varios",
    multiple: true,
    opciones: [
      { valor: 1, label: "Rural",      Icon: PiTreeEvergreenDuotone },
      { valor: 2, label: "Urbano",     Icon: PiBuildingsDuotone     },
      { valor: 3, label: "Natural",    Icon: PiMountainsDuotone     },
      { valor: 4, label: "Montañoso",  Icon: PiMountainsDuotone     },
      { valor: 5, label: "Desierto",   Icon: PiSunDuotone           },
      { valor: 6, label: "Río",        Icon: PiWavesDuotone         },
      { valor: 7, label: "Cascadas",   Icon: PiWavesDuotone         },
    ],
  },
  {
    id:       "etiquetas",
    pregunta: "¿Qué actividades te interesan?",
    subtitulo:"Puedes elegir varias",
    multiple: true,
    opciones: [
      { valor: 3, label: "Caminatas",  Icon: PiMountainsDuotone     },
      { valor: 4, label: "Fotografía", Icon: PiCameraRotateDuotone  },
      { valor: 5, label: "Historia",   Icon: PiShovelDuotone        },
      { valor: 6, label: "Tranquilo",  Icon: PiHeartDuotone         },
      { valor: 7, label: "Extremo",    Icon: PiTreeDuotone          },
    ],
  },
  {
    id:       "tipo_viajero",
    pregunta: "¿Con quién vas a viajar?",
    subtitulo:"Elige una opción",
    multiple: false,
    opciones: [
      { valor: 1, label: "En familia",  Icon: PiUsersThreeDuotone },
      { valor: 2, label: "En pareja",   Icon: PiHeartDuotone      },
      { valor: 3, label: "Con amigos",  Icon: PiUsersThreeDuotone },
      { valor: 4, label: "Viaje solo",  Icon: PiPersonDuotone     },
    ],
  },
  {
    id:       "dias",
    pregunta: "¿Cuántos días tienes disponibles?",
    subtitulo:"Esto organiza tu itinerario",
    multiple: false,
    opciones: [
      { valor: 1, label: "1 día"      },
      { valor: 2, label: "2 días"     },
      { valor: 3, label: "3 días"     },
      { valor: 5, label: "4 a 5 días" },
      { valor: 7, label: "1 semana"   },
    ],
  },
]

export default function Quiz() {
  const [paso,       setPaso]       = useState(0)
  const [respuestas, setRespuestas] = useState({
    categorias:   [],
    entornos:     [],
    etiquetas:    [],
    tipo_viajero: null,
    dias:         null,
  })
  const [direction, setDirection] = useState(1)

  const { user }  = useAuthContext()
  const navigate  = useNavigate()
  const pregunta  = PREGUNTAS[paso]
  const total     = PREGUNTAS.length
  const progreso  = (paso / total) * 100

  const toggleOpcion = (valor) => {
    const key = pregunta.id
    if (pregunta.multiple) {
      setRespuestas(prev => {
        const actual = prev[key] || []
        return {
          ...prev,
          [key]: actual.includes(valor)
            ? actual.filter(v => v !== valor)
            : [...actual, valor]
        }
      })
    } else {
      setRespuestas(prev => ({ ...prev, [key]: valor }))
    }
  }

  const isSelected = (valor) => {
    const val = respuestas[pregunta.id]
    return pregunta.multiple ? val?.includes(valor) : val === valor
  }

  const puedeAvanzar = () => {
    const val = respuestas[pregunta.id]
    return pregunta.multiple ? val?.length > 0 : val !== null
  }

  const siguiente = () => {
    if (paso < total - 1) {
      setDirection(1)
      setPaso(p => p + 1)
    } else {
      // Guardar respuestas y navegar
      localStorage.setItem("quizRespuestas", JSON.stringify(respuestas))
      if (user) {
        navigate("/resultado")
      } else {
        navigate("/login", { state: { from: { pathname: "/resultado" } } })
      }
    }
  }

  const anterior = () => {
    setDirection(-1)
    setPaso(p => p - 1)
  }

  const variants = {
    enter:   (d) => ({ opacity: 0, x: d > 0 ? 60 : -60 }),
    center:  { opacity: 1, x: 0 },
    exit:    (d) => ({ opacity: 0, x: d > 0 ? -60 : 60 }),
  }

  return (
    <div className={styles.page}>
      <div className={styles.bgGlow} />

      {/* Header con progreso */}
      <div className={styles.header}>
        <img src={logo} alt="logo" className={styles.logoImg} />
        <div className={styles.progressBar}>
          <motion.div
            className={styles.progressFill}
            animate={{ width: `${progreso}%` }}
            transition={{ duration: 0.4, ease: "easeOut" }}
          />
        </div>
        <span className={styles.pasoLabel}>{paso + 1} / {total}</span>
      </div>

      {/* Contenido del quiz */}
      <div className={styles.container}>
        <AnimatePresence mode="wait" custom={direction}>
          <motion.div
            key={paso}
            custom={direction}
            variants={variants}
            initial="enter"
            animate="center"
            exit="exit"
            transition={{ duration: 0.3, ease: [0.4, 0, 0.2, 1] }}
            className={styles.card}
          >
            {/* Número de pregunta */}
            <span className={styles.numeroPregunta}>
              Pregunta {paso + 1}
            </span>

            <h2 className={styles.pregunta}>{pregunta.pregunta}</h2>
            <p className={styles.subtitulo}>{pregunta.subtitulo}</p>

            {/* Opciones */}
            <div className={`${styles.opciones} ${pregunta.opciones.length <= 4 ? styles.opcionesGrid2 : styles.opcionesGrid3}`}>
              {pregunta.opciones.map(({ valor, label, Icon }) => (
                <motion.button
                  key={valor}
                  className={`${styles.opcion} ${isSelected(valor) ? styles.opcionSelected : ""}`}
                  onClick={() => toggleOpcion(valor)}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {Icon && (
                    <Icon
                      size={22}
                      className={`${styles.opcionIcon} ${isSelected(valor) ? styles.opcionIconSelected : ""}`}
                    />
                  )}
                  <span>{label}</span>
                  {isSelected(valor) && (
                    <motion.div
                      className={styles.checkDot}
                      initial={{ scale: 0 }}
                      animate={{ scale: 1 }}
                      transition={{ type: "spring", stiffness: 500, damping: 20 }}
                    />
                  )}
                </motion.button>
              ))}
            </div>

            {/* Navegación */}
            <div className={styles.nav}>
              {paso > 0 ? (
                <motion.button
                  className={styles.btnAnterior}
                  onClick={anterior}
                  whileHover={{ x: -3 }}
                  whileTap={{ scale: 0.97 }}
                >
                  <PiArrowLeftDuotone size={18} />
                  Anterior
                </motion.button>
              ) : <div />}

              <motion.button
                className={`${styles.btnSiguiente} ${!puedeAvanzar() ? styles.btnDisabled : ""}`}
                onClick={siguiente}
                disabled={!puedeAvanzar()}
                whileHover={puedeAvanzar() ? { scale: 1.04 } : {}}
                whileTap={puedeAvanzar()   ? { scale: 0.97 } : {}}
              >
                {paso === total - 1 ? "Ver mi ruta ✦" : "Siguiente"}
                <PiArrowRightDuotone size={18} />
              </motion.button>
            </div>
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  )
} 

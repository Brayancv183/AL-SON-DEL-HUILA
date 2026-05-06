import { useState, useEffect, useRef } from "react"
import { motion, AnimatePresence } from "framer-motion"
import {
  PiUserDuotone,
  PiMapPinDuotone,
  PiCalendarDuotone,
  PiHeartDuotone,
  PiCameraDuotone,
  PiPencilDuotone,
  PiCheckDuotone,
  PiXDuotone,
  PiLockDuotone,
  PiSignOutDuotone,
} from "react-icons/pi"
import { useAuthContext } from "../context/AuthContext"
import { getPerfil, updatePerfil, subirFoto } from "../api/perfil"
import { useNavigate } from "react-router-dom"
import styles from "./Perfil.module.css"

export default function Perfil() {
  const { user, login, logout } = useAuthContext()
  const navigate                = useNavigate()

  const [perfil,        setPerfil]        = useState(null)
  const [loading,       setLoading]       = useState(true)
  const [editando,      setEditando]      = useState(false)
  const [guardando,     setGuardando]     = useState(false)
  const [tabActiva,     setTabActiva]     = useState("info")
  const [form,          setForm]          = useState({ nombre: "", bio: "", ubicacion: "" })
  const [mensaje,       setMensaje]       = useState(null)

  const fotoRef    = useRef(null)
  const portadaRef = useRef(null)

  useEffect(() => {
    cargarPerfil()
  }, [])

  const cargarPerfil = async () => {
    try {
      const data = await getPerfil()
      setPerfil(data)
      setForm({
        nombre:    data.nombre    || "",
        bio:       data.bio       || "",
        ubicacion: data.ubicacion || "",
      })
    } catch (err) {
      console.error(err)
    } finally {
      setLoading(false)
    }
  }

  const handleGuardar = async () => {
    setGuardando(true)
    try {
      await updatePerfil(form)
      await cargarPerfil()
      setEditando(false)
      mostrarMensaje("✅ Perfil actualizado correctamente")
    } catch (err) {
      mostrarMensaje("❌ " + err.message)
    } finally {
      setGuardando(false)
    }
  }

  const handleFoto = async (e, tipo) => {
    const file = e.target.files[0]
    if (!file) return
    try {
      const data = await subirFoto(file, tipo)
      await cargarPerfil()
      mostrarMensaje("✅ Foto actualizada")
    } catch (err) {
      mostrarMensaje("❌ " + err.message)
    }
  }

  const mostrarMensaje = (texto) => {
    setMensaje(texto)
    setTimeout(() => setMensaje(null), 3000)
  }

  const handleLogout = () => {
    logout()
    navigate("/")
  }

  if (loading) return (
    <div className={styles.loading}>
      <div className={styles.spinner} />
      <p>Cargando perfil...</p>
    </div>
  )

  const iniciales = perfil?.nombre
    ?.split(" ")
    .map(n => n[0])
    .slice(0, 2)
    .join("")
    .toUpperCase() || "U"

  const TABS = [
    { id: "info",      label: "Mi información" },
    { id: "favoritos", label: "Favoritos"       },
    { id: "seguridad", label: "Seguridad"       },
  ]

  return (
    <div className={styles.page}>

      {/* Portada */}
      <div className={styles.portada}>
        {perfil?.foto_portada
          ? <img src={perfil.foto_portada} alt="portada" className={styles.portadaImg} />
          : <div className={styles.portadaDefault} />
        }
        <button
          className={styles.btnCambiarPortada}
          onClick={() => portadaRef.current?.click()}
        >
          <PiCameraDuotone size={16} />
          Cambiar portada
        </button>
        <input
          ref={portadaRef}
          type="file"
          accept="image/*"
          style={{ display: "none" }}
          onChange={e => handleFoto(e, "portada")}
        />
      </div>

      {/* Info del usuario */}
      <div className={styles.container}>
        <div className={styles.userRow}>

          {/* Avatar */}
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>
              {perfil?.foto
                ? <img src={perfil.foto} alt="avatar" className={styles.avatarImg} />
                : <span className={styles.avatarLetras}>{iniciales}</span>
              }
            </div>
            <button
              className={styles.btnCambiarFoto}
              onClick={() => fotoRef.current?.click()}
            >
              <PiCameraDuotone size={14} />
            </button>
            <input
              ref={fotoRef}
              type="file"
              accept="image/*"
              style={{ display: "none" }}
              onChange={e => handleFoto(e, "perfil")}
            />
          </div>

          {/* Nombre y acciones */}
          <div className={styles.userInfo}>
            <h1 className={styles.nombre}>{perfil?.nombre}</h1>
            <div className={styles.metaRow}>
              {perfil?.ubicacion && (
                <span className={styles.meta}>
                  <PiMapPinDuotone size={14} />
                  {perfil.ubicacion}
                </span>
              )}
              <span className={styles.meta}>
                <PiCalendarDuotone size={14} />
                Miembro desde {new Date(perfil?.fecha_registro).getFullYear()}
              </span>
            </div>
            {perfil?.bio && (
              <p className={styles.bio}>{perfil.bio}</p>
            )}
          </div>

          {/* Botones */}
          <div className={styles.acciones}>
            <motion.button
              className={styles.btnEditar}
              onClick={() => setEditando(!editando)}
              whileHover={{ scale: 1.03 }}
              whileTap={{ scale: 0.97 }}
            >
              <PiPencilDuotone size={16} />
              {editando ? "Cancelar" : "Editar perfil"}
            </motion.button>
            <button className={styles.btnLogout} onClick={handleLogout}>
              <PiSignOutDuotone size={16} />
            </button>
          </div>
        </div>

        {/* Mensaje de éxito/error */}
        <AnimatePresence>
          {mensaje && (
            <motion.div
              className={styles.mensaje}
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0  }}
              exit={{   opacity: 0, y: -10  }}
            >
              {mensaje}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Formulario de edición */}
        <AnimatePresence>
          {editando && (
            <motion.div
              className={styles.formEdicion}
              initial={{ opacity: 0, height: 0    }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{   opacity: 0, height: 0    }}
            >
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label>Nombre completo</label>
                  <input
                    value={form.nombre}
                    onChange={e => setForm(p => ({ ...p, nombre: e.target.value }))}
                    placeholder="Tu nombre"
                  />
                </div>
                <div className={styles.formField}>
                  <label>Ubicación</label>
                  <input
                    value={form.ubicacion}
                    onChange={e => setForm(p => ({ ...p, ubicacion: e.target.value }))}
                    placeholder="Ciudad, País"
                  />
                </div>
                <div className={`${styles.formField} ${styles.fullWidth}`}>
                  <label>Bio</label>
                  <textarea
                    value={form.bio}
                    onChange={e => setForm(p => ({ ...p, bio: e.target.value }))}
                    placeholder="Cuéntanos algo sobre ti..."
                    maxLength={255}
                    rows={3}
                  />
                  <span className={styles.charCount}>
                    {form.bio.length}/255
                  </span>
                </div>
              </div>
              <div className={styles.formAcciones}>
                <button
                  className={styles.btnCancelar}
                  onClick={() => setEditando(false)}
                >
                  <PiXDuotone size={16} /> Cancelar
                </button>
                <motion.button
                  className={styles.btnGuardar}
                  onClick={handleGuardar}
                  disabled={guardando}
                  whileHover={{ scale: 1.03 }}
                  whileTap={{ scale: 0.97 }}
                >
                  {guardando
                    ? "Guardando..."
                    : <><PiCheckDuotone size={16} /> Guardar cambios</>
                  }
                </motion.button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map(tab => (
            <button
              key={tab.id}
              className={`${styles.tab} ${tabActiva === tab.id ? styles.tabActiva : ""}`}
              onClick={() => setTabActiva(tab.id)}
            >
              {tab.label}
              {tabActiva === tab.id && (
                <motion.div className={styles.tabIndicator} layoutId="tabIndicator" />
              )}
            </button>
          ))}
        </div>

        {/* Contenido de tabs */}
        <div className={styles.tabContent}>

          {/* Info */}
          {tabActiva === "info" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0  }}
              className={styles.infoGrid}
            >
              <div className={styles.infoCard}>
                <PiUserDuotone size={20} className={styles.infoIcon} />
                <div>
                  <span className={styles.infoLabel}>Nombre</span>
                  <span className={styles.infoValor}>{perfil?.nombre || "—"}</span>
                </div>
              </div>
              <div className={styles.infoCard}>
                <PiMapPinDuotone size={20} className={styles.infoIcon} />
                <div>
                  <span className={styles.infoLabel}>Ubicación</span>
                  <span className={styles.infoValor}>{perfil?.ubicacion || "Sin especificar"}</span>
                </div>
              </div>
              <div className={styles.infoCard}>
                <PiLockDuotone size={20} className={styles.infoIcon} />
                <div>
                  <span className={styles.infoLabel}>Método de acceso</span>
                  <span className={styles.infoValor}>
                    {perfil?.provider === 'google' ? '🔵 Google' : '📧 Email'}
                  </span>
                </div>
              </div>
              <div className={styles.infoCard}>
                <PiCalendarDuotone size={20} className={styles.infoIcon} />
                <div>
                  <span className={styles.infoLabel}>Miembro desde</span>
                  <span className={styles.infoValor}>
                    {new Date(perfil?.fecha_registro).toLocaleDateString('es-CO', {
                      year: 'numeric', month: 'long', day: 'numeric'
                    })}
                  </span>
                </div>
              </div>
            </motion.div>
          )}

          {/* Favoritos */}
          {tabActiva === "favoritos" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0  }}
              className={styles.emptyState}
            >
              <PiHeartDuotone size={40} className={styles.emptyIcon} />
              <h3>No tienes favoritos aún</h3>
              <p>Guarda destinos que te interesen para verlos aquí</p>
              <button onClick={() => navigate("/catalogo")} className={styles.btnExplorar}>
                Explorar destinos
              </button>
            </motion.div>
          )}

          {/* Seguridad */}
          {tabActiva === "seguridad" && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0  }}
              className={styles.seguridadSection}
            >
              <div className={styles.seguridadCard}>
                <h3>Cambiar contraseña</h3>
                <p>Solo disponible para cuentas registradas con email</p>
                <button
                  className={styles.btnCambiarPass}
                  onClick={() => navigate("/cambiar-password")}
                  disabled={perfil?.provider === 'google'}
                >
                  <PiLockDuotone size={16} />
                  {perfil?.provider === 'google'
                    ? 'No disponible para cuentas Google'
                    : 'Cambiar contraseña'
                  }
                </button>
              </div>

              <div className={styles.seguridadCard}>
                <h3>Cerrar sesión</h3>
                <p>Salir de tu cuenta en este dispositivo</p>
                <button className={styles.btnLogoutRed} onClick={handleLogout}>
                  <PiSignOutDuotone size={16} />
                  Cerrar sesión
                </button>
              </div>
            </motion.div>
          )}

        </div>
      </div>
    </div>
  )
}
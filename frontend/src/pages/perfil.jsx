import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
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
} from "react-icons/pi";
import { useAuth } from "../context/AuthContext";
import { getPerfil, updatePerfil, subirFoto, cambiarPassword } from "../api/perfil";
import { useNavigate } from "react-router-dom";
import styles from "./Perfil.module.css";

export default function Perfil() {
  const { logout } = useAuth();
  const navigate = useNavigate();

  const [perfil, setPerfil] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editando, setEditando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [tabActiva, setTabActiva] = useState("info");
  const [form, setForm] = useState({ nombre: "", bio: "", ubicacion: "" });
  const [mensaje, setMensaje] = useState(null);

  // Estados para el modal de cambio de contraseña
  const [showPasswordModal, setShowPasswordModal] = useState(false);
  const [passwordActual, setPasswordActual] = useState("");
  const [passwordNuevo, setPasswordNuevo] = useState("");
  const [passwordNuevoConfirmation, setPasswordNuevoConfirmation] = useState("");
  const [passwordError, setPasswordError] = useState("");
  const [passwordSuccess, setPasswordSuccess] = useState("");
  const [cambiando, setCambiando] = useState(false);

  const fotoRef = useRef(null);
  const portadaRef = useRef(null);

  useEffect(() => {
    cargarPerfil();
  }, []);

  const cargarPerfil = async () => {
    try {
      const data = await getPerfil();
      setPerfil(data);
      setForm({
        nombre: data.nombre || "",
        bio: data.bio || "",
        ubicacion: data.ubicacion || "",
      });
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleGuardar = async () => {
    setGuardando(true);
    try {
      await updatePerfil(form);
      await cargarPerfil();
      setEditando(false);
      mostrarMensaje("✅ Perfil actualizado correctamente");
    } catch (err) {
      mostrarMensaje("❌ " + err.message);
    } finally {
      setGuardando(false);
    }
  };

  const handleFoto = async (e, tipo) => {
    const file = e.target.files[0];
    if (!file) return;
    try {
      await subirFoto(file, tipo);
      await cargarPerfil();
      mostrarMensaje("✅ Foto actualizada");
    } catch (err) {
      mostrarMensaje("❌ " + err.message);
    }
  };

  const mostrarMensaje = (texto) => {
    setMensaje(texto);
    setTimeout(() => setMensaje(null), 3000);
  };

  const handleLogout = () => {
    logout();
    navigate("/");
  };

  // Manejo del cambio de contraseña
  const handleCambiarPassword = async (e) => {
    e.preventDefault();
    setPasswordError("");
    setPasswordSuccess("");

    if (passwordNuevo !== passwordNuevoConfirmation) {
      setPasswordError("Las contraseñas nuevas no coinciden");
      return;
    }
    if (passwordNuevo.length < 8) {
      setPasswordError("La contraseña debe tener al menos 8 caracteres");
      return;
    }

    setCambiando(true);
    try {
      await cambiarPassword(passwordActual, passwordNuevo);
      setPasswordSuccess("Contraseña actualizada correctamente");
      // Limpiar campos y cerrar modal después de 2 segundos
      setTimeout(() => {
        setShowPasswordModal(false);
        setPasswordActual("");
        setPasswordNuevo("");
        setPasswordNuevoConfirmation("");
        setPasswordSuccess("");
      }, 2000);
    } catch (err) {
      setPasswordError(err.message || "Error al cambiar la contraseña");
    } finally {
      setCambiando(false);
    }
  };

  if (loading) return <div className={styles.loading}>Cargando perfil...</div>;

  const iniciales = perfil?.nombre?.split(" ").map(n => n[0]).slice(0,2).join("").toUpperCase() || "U";

  const TABS = [
    { id: "info", label: "Mi información" },
    { id: "seguridad", label: "Seguridad" },
  ];

  return (
    <div className={styles.page}>
      {/* Portada */}
      <div className={styles.portada}>
        {perfil?.foto_portada ? (
          <img src={perfil.foto_portada} alt="portada" className={styles.portadaImg} />
        ) : (
          <div className={styles.portadaDefault} />
        )}
        <button className={styles.btnCambiarPortada} onClick={() => portadaRef.current?.click()}>
          <PiCameraDuotone size={16} /> Cambiar portada
        </button>
        <input ref={portadaRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFoto(e, "portada")} />
      </div>

      <div className={styles.container}>
        <div className={styles.userRow}>
          <div className={styles.avatarWrapper}>
            <div className={styles.avatar}>
              {perfil?.foto ? (
                <img key={perfil.foto} src={perfil.foto} alt="avatar" className={styles.avatarImg} />
              ) : (
                <span className={styles.avatarLetras}>{iniciales}</span>
              )}
            </div>
            <button className={styles.btnCambiarFoto} onClick={() => fotoRef.current?.click()}>
              <PiCameraDuotone size={14} />
            </button>
            <input ref={fotoRef} type="file" accept="image/*" style={{ display: "none" }} onChange={e => handleFoto(e, "perfil")} />
          </div>

          <div className={styles.userInfo}>
            <h1 className={styles.nombre}>{perfil?.nombre}</h1>
            <div className={styles.metaRow}>
              {perfil?.ubicacion && (
                <span className={styles.meta}>
                  <PiMapPinDuotone size={14} /> {perfil.ubicacion}
                </span>
              )}
              <span className={styles.meta}>
                <PiCalendarDuotone size={14} /> Miembro desde {new Date(perfil?.fecha_registro).getFullYear()}
              </span>
            </div>
            {perfil?.bio && <p className={styles.bio}>{perfil.bio}</p>}
          </div>

          <div className={styles.acciones}>
            <motion.button className={styles.btnEditar} onClick={() => setEditando(!editando)} whileHover={{ scale: 1.03 }} whileTap={{ scale: 0.97 }}>
              <PiPencilDuotone size={16} /> {editando ? "Cancelar" : "Editar perfil"}
            </motion.button>
            <button className={styles.btnLogout} onClick={handleLogout}>
              <PiSignOutDuotone size={16} />
            </button>
          </div>
        </div>

        {mensaje && <div className={styles.mensaje}>{mensaje}</div>}

        {/* Formulario de edición */}
        <AnimatePresence>
          {editando && (
            <motion.div className={styles.formEdicion} initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: "auto" }} exit={{ opacity: 0, height: 0 }}>
              <div className={styles.formGrid}>
                <div className={styles.formField}>
                  <label>Nombre completo</label>
                  <input value={form.nombre} onChange={e => setForm({ ...form, nombre: e.target.value })} placeholder="Tu nombre" />
                </div>
                <div className={styles.formField}>
                  <label>Ubicación</label>
                  <input value={form.ubicacion} onChange={e => setForm({ ...form, ubicacion: e.target.value })} placeholder="Ciudad, País" />
                </div>
                <div className={`${styles.formField} ${styles.fullWidth}`}>
                  <label>Bio</label>
                  <textarea value={form.bio} onChange={e => setForm({ ...form, bio: e.target.value })} placeholder="Cuéntanos algo..." rows={3} maxLength={255} />
                </div>
              </div>
              <div className={styles.formAcciones}>
                <button className={styles.btnCancelar} onClick={() => setEditando(false)}><PiXDuotone size={16} /> Cancelar</button>
                <button className={styles.btnGuardar} onClick={handleGuardar} disabled={guardando}>
                  {guardando ? "Guardando..." : <><PiCheckDuotone size={16} /> Guardar cambios</>}
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Tabs */}
        <div className={styles.tabs}>
          {TABS.map(tab => (
            <button key={tab.id} className={`${styles.tab} ${tabActiva === tab.id ? styles.tabActiva : ""}`} onClick={() => setTabActiva(tab.id)}>
              {tab.label}
              {tabActiva === tab.id && <motion.div className={styles.tabIndicator} layoutId="tabIndicator" />}
            </button>
          ))}
        </div>

        <div className={styles.tabContent}>
          {/* Info */}
          {tabActiva === "info" && (
            <div className={styles.infoGrid}>
              <div className={styles.infoCard}>
                <PiUserDuotone size={20} className={styles.infoIcon} />
                <div><span className={styles.infoLabel}>Nombre</span><span className={styles.infoValor}>{perfil?.nombre || "—"}</span></div>
              </div>
              <div className={styles.infoCard}>
                <PiMapPinDuotone size={20} className={styles.infoIcon} />
                <div><span className={styles.infoLabel}>Ubicación</span><span className={styles.infoValor}>{perfil?.ubicacion || "Sin especificar"}</span></div>
              </div>
              <div className={styles.infoCard}>
                <PiLockDuotone size={20} className={styles.infoIcon} />
                <div><span className={styles.infoLabel}>Método de acceso</span><span className={styles.infoValor}>{perfil?.provider === 'google' ? '🔵 Google' : '📧 Email'}</span></div>
              </div>
              <div className={styles.infoCard}>
                <PiCalendarDuotone size={20} className={styles.infoIcon} />
                <div><span className={styles.infoLabel}>Miembro desde</span><span className={styles.infoValor}>{new Date(perfil?.fecha_registro).toLocaleDateString('es-CO')}</span></div>
              </div>
            </div>
          )}

          {/* Seguridad */}
          {tabActiva === "seguridad" && (
            <div className={styles.seguridadSection}>
              <div className={styles.seguridadCard}>
                <h3>Cambiar contraseña</h3>
                <p>Solo disponible para cuentas registradas con email</p>
                <button
                  className={styles.btnCambiarPass}
                  onClick={() => setShowPasswordModal(true)}
                  disabled={perfil?.provider === 'google'}
                >
                  <PiLockDuotone size={16} /> {perfil?.provider === 'google' ? 'No disponible para cuentas Google' : 'Cambiar contraseña'}
                </button>
              </div>
              <div className={styles.seguridadCard}>
                <h3>Cerrar sesión</h3>
                <p>Salir de tu cuenta en este dispositivo</p>
                <button className={styles.btnLogoutRed} onClick={handleLogout}>
                  <PiSignOutDuotone size={16} /> Cerrar sesión
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Modal para cambiar contraseña */}
      {showPasswordModal && (
        <div className={styles.modalOverlay} onClick={() => setShowPasswordModal(false)}>
          <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Cambiar contraseña</h2>
              <button className={styles.closeBtn} onClick={() => setShowPasswordModal(false)}>✕</button>
            </div>
            <form onSubmit={handleCambiarPassword} className={styles.modalForm}>
              <div className={styles.formGroup}>
                <label>Contraseña actual</label>
                <input
                  type="password"
                  value={passwordActual}
                  onChange={(e) => setPasswordActual(e.target.value)}
                  required
                />
              </div>
              <div className={styles.formGroup}>
                <label>Nueva contraseña</label>
                <input
                  type="password"
                  value={passwordNuevo}
                  onChange={(e) => setPasswordNuevo(e.target.value)}
                  required
                  minLength="8"
                />
              </div>
              <div className={styles.formGroup}>
                <label>Confirmar nueva contraseña</label>
                <input
                  type="password"
                  value={passwordNuevoConfirmation}
                  onChange={(e) => setPasswordNuevoConfirmation(e.target.value)}
                  required
                />
              </div>
              {passwordError && <div className={styles.errorMessage}>{passwordError}</div>}
              {passwordSuccess && <div className={styles.successMessage}>{passwordSuccess}</div>}
              <div className={styles.modalActions}>
                <button type="button" onClick={() => setShowPasswordModal(false)}>Cancelar</button>
                <button type="submit" disabled={cambiando}>
                  {cambiando ? 'Actualizando...' : 'Actualizar contraseña'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
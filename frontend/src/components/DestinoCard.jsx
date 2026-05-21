import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  PiMapPinDuotone,
  PiArrowRightDuotone,
  PiTagDuotone,
  PiTreeDuotone,
  PiHouseLineDuotone,
  PiClockDuotone,
  PiStarDuotone,
  PiTextAlignLeftDuotone,
} from "react-icons/pi";
import styles from "./DestinoCard.module.css";

export default function DestinoCard({ destino, index }) {
  const [showModal, setShowModal] = useState(false);

  const openModal = (e) => {
    e.preventDefault();
    setShowModal(true);
  };

  const closeModal = () => setShowModal(false);

  return (
    <>
      <motion.div
        className={styles.card}
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.4, delay: index * 0.07 }}
        whileHover={{ y: -4 }}
        layout
      >
        <div
          className={styles.imagen}
          style={{
            backgroundImage: destino.imagen
              ? `url(${destino.imagen})`
              : `linear-gradient(145deg, #C4622Dcc, #C4622D44)`,
          }}
        >
          <span className={styles.categoria}>
            {destino.categoria?.nombre}
          </span>
        </div>

        <div className={styles.body}>
          <div className={styles.municipio}>
            <PiMapPinDuotone size={13} />
            <span>{destino.municipio?.nombre}</span>
          </div>

          <h3 className={styles.nombre}>{destino.nombre}</h3>
          <p className={styles.descripcion}>
            {destino.descripcion?.substring(0, 100)}
            {destino.descripcion?.length > 100 ? "..." : ""}
          </p>

          {destino.etiquetas?.length > 0 && (
            <div className={styles.etiquetas}>
              {destino.etiquetas.slice(0, 3).map(et => (
                <span key={et.id} className={styles.etiqueta}>
                  {et.nombre}
                </span>
              ))}
              {destino.etiquetas.length > 3 && (
                <span className={styles.etiqueta}>+{destino.etiquetas.length - 3}</span>
              )}
            </div>
          )}

          <motion.button
            className={styles.btn}
            whileHover={{ gap: "0.6rem" }}
            onClick={openModal}
          >
            Ver destino
            <PiArrowRightDuotone size={15} />
          </motion.button>
        </div>
      </motion.div>

      {/* Modal flotante con iconos modernos */}
      <AnimatePresence>
        {showModal && (
          <motion.div
            className={styles.modalOverlay}
            onClick={closeModal}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
          >
            <motion.div
              className={styles.modalContent}
              onClick={(e) => e.stopPropagation()}
              initial={{ scale: 0.9, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.9, opacity: 0 }}
              transition={{ type: "spring", damping: 25 }}
            >
              <button className={styles.closeBtn} onClick={closeModal}>✕</button>

              {/* Imagen */}
              <div className={styles.modalImage}>
                {destino.imagen ? (
                  <img src={destino.imagen} alt={destino.nombre} />
                ) : (
                  <div className={styles.modalImagePlaceholder}>
                    <span>🏞️</span>
                  </div>
                )}
              </div>

              {/* Título */}
              <h2 className={styles.modalTitle}>{destino.nombre}</h2>

              {/* Información detallada */}
              <div className={styles.modalInfo}>
                {/* Descripción */}
                {destino.descripcion && (
                  <div className={styles.modalRow}>
                    <PiTextAlignLeftDuotone size={18} className={styles.modalIcon} />
                    <div className={styles.modalColumn}>
                      <strong>Descripción</strong>
                      <p>{destino.descripcion}</p>
                    </div>
                  </div>
                )}

                {/* Categoría */}
                <div className={styles.modalRow}>
                  <PiTagDuotone size={18} className={styles.modalIcon} />
                  <div className={styles.modalColumn}>
                    <strong>Categoría</strong>
                    <span>{destino.categoria?.nombre || "No especificada"}</span>
                  </div>
                </div>

                {/* Entorno */}
                {destino.entorno?.nombre && (
                  <div className={styles.modalRow}>
                    <PiTreeDuotone size={18} className={styles.modalIcon} />
                    <div className={styles.modalColumn}>
                      <strong>Entorno</strong>
                      <span>{destino.entorno.nombre}</span>
                    </div>
                  </div>
                )}

                {/* Ubicación */}
                <div className={styles.modalRow}>
                  <PiMapPinDuotone size={18} className={styles.modalIcon} />
                  <div className={styles.modalColumn}>
                    <strong>Ubicación</strong>
                    <span>{destino.municipio?.nombre}, Huila</span>
                  </div>
                </div>

                {/* Dirección */}
                {destino.direccion && (
                  <div className={styles.modalRow}>
                    <PiHouseLineDuotone size={18} className={styles.modalIcon} />
                    <div className={styles.modalColumn}>
                      <strong>Dirección</strong>
                      <span>{destino.direccion}</span>
                    </div>
                  </div>
                )}

                {/* Horario */}
                {destino.horario && (
                  <div className={styles.modalRow}>
                    <PiClockDuotone size={18} className={styles.modalIcon} />
                    <div className={styles.modalColumn}>
                      <strong>Horario</strong>
                      <span>{destino.horario}</span>
                    </div>
                  </div>
                )}

                {/* Valoración */}
                {destino.rating_promedio > 0 && (
                  <div className={styles.modalRow}>
                    <PiStarDuotone size={18} className={styles.modalIcon} />
                    <div className={styles.modalColumn}>
                      <strong>Valoración</strong>
                      <span>{destino.rating_promedio} / 5 ({destino.total_reseñas} reseñas)</span>
                    </div>
                  </div>
                )}

                {/* Etiquetas */}
                {destino.etiquetas?.length > 0 && (
                  <div className={styles.modalTags}>
                    <div className={styles.modalRow}>
                      <PiTagDuotone size={18} className={styles.modalIcon} />
                      <div className={styles.modalColumn}>
                        <strong>Etiquetas</strong>
                        <div className={styles.modalTagsList}>
                          {destino.etiquetas.map(et => (
                            <span key={et.id}>{et.nombre}</span>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
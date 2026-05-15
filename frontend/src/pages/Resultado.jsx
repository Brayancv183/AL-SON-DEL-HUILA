import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';
import { useEffect, useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import {
  PiMapPinDuotone,
  PiCalendarDuotone,
  PiArrowRightDuotone,
  PiArrowLeftDuotone,
  PiFileImageDuotone,
  PiFilePdfDuotone,
} from "react-icons/pi";
import { recomendar } from "../api/recomendador";
import styles from "./Resultado.module.css";
import logo from "../assets/images/logo.png";

export default function Resultado() {
  const [itinerario, setItinerario] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const navigate = useNavigate();

  // Capturar itinerario (solo el bloque .itinerario)
  const capturarItinerario = async (formato = 'png') => {
    const elemento = document.querySelector(`.${styles.itinerario}`);
    if (!elemento) {
      console.error('No se encontró el elemento del itinerario');
      return;
    }

    try {
      const canvas = await html2canvas(elemento, {
        scale: 2,
        backgroundColor: '#ffffff',
        logging: false,
        useCORS: true,
      });

      const imagen = canvas.toDataURL('image/png');

      if (formato === 'png') {
        const enlace = document.createElement('a');
        enlace.download = 'itinerario.png';
        enlace.href = imagen;
        enlace.click();
      } else if (formato === 'pdf') {
        const pdf = new jsPDF('p', 'mm', 'a4');
        const imgProps = pdf.getImageProperties(imagen);
        const pdfWidth = pdf.internal.pageSize.getWidth();
        const pdfHeight = (imgProps.height * pdfWidth) / imgProps.width;
        pdf.addImage(imagen, 'PNG', 0, 0, pdfWidth, pdfHeight);
        pdf.save('itinerario.pdf');
      }
    } catch (error) {
      console.error('Error al capturar:', error);
      alert('Hubo un error al generar la descarga. Revisa la consola.');
    }
  };

  useEffect(() => {
    const cargar = async () => {
      try {
        const saved = localStorage.getItem("quizRespuestas");
        if (!saved) {
          navigate("/quiz");
          return;
        }
        const respuestas = JSON.parse(saved);
        const data = await recomendar(respuestas);
        setItinerario(data.itinerario || []);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    cargar();
  }, [navigate]);

  if (loading) {
    return (
      <div className={styles.loadingState}>
        <div className={styles.spinner} />
        <p>Generando tu ruta personalizada...</p>
        <span>Analizando tus preferencias</span>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.errorState}>
        <p>⚠ {error}</p>
        <button onClick={() => navigate("/quiz")}>Volver al quiz</button>
      </div>
    );
  }

  return (
    <div className={styles.page}>
      {/* Header */}
      <div className={styles.header}>
        <img src={logo} alt="logo" className={styles.logoImg} />
        <div className={styles.headerTexto}>
          <h1 className={styles.titulo}>Tu ruta personalizada</h1>
          <p className={styles.subtitulo}>
            {itinerario.length} días ·{" "}
            {itinerario.reduce((acc, d) => acc + d.destinos.length, 0)} destinos
          </p>
        </div>
        <button className={styles.btnNuevo} onClick={() => navigate("/quiz")}>
          <PiArrowLeftDuotone size={16} />
          Nueva ruta
        </button>
      </div>

      {/* Layout */}
      <div className={styles.layout}>
        {/* Columna izquierda: itinerario + botones de descarga */}
        <div className={styles.itinerarioColumn}>
          <div className={styles.itinerario}>
            {itinerario.map((dia, i) => (
              <motion.div
                key={dia.dia}
                className={styles.diaCard}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
              >
                <div className={styles.diaHeader}>
                  <PiCalendarDuotone size={16} />
                  <span>Día {dia.dia}</span>
                  <span className={styles.diaCount}>
                    {dia.destinos.length} destinos
                  </span>
                </div>

                {dia.destinos.map((destino, j) => (
                  <motion.div
                    key={destino.id}
                    className={styles.destinoItem}
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: i * 0.1 + j * 0.05 }}
                  >
                    <div className={styles.destinoNum}>{j + 1}</div>
                    <div className={styles.destinoInfo}>
                      <h4>{destino.nombre}</h4>
                      <div className={styles.destinoMeta}>
                        <PiMapPinDuotone size={12} />
                        <span>{destino.municipio}</span>
                        <span className={styles.dot}>·</span>
                        <span>{destino.categoria}</span>
                      </div>
                    </div>
                    <motion.button
                      className={styles.destinoBtn}
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      <PiArrowRightDuotone size={14} />
                    </motion.button>
                  </motion.div>
                ))}
              </motion.div>
            ))}
          </div>

          {/* Botones de descarga debajo del itinerario */}
          <div className={styles.botonesDescarga}>
            <button
              className={styles.btnDescarga}
              onClick={() => capturarItinerario('png')}
              title="Descargar como PNG"
            >
              <PiFileImageDuotone size={20} />
              PNG
            </button>
            <button
              className={styles.btnDescarga}
              onClick={() => capturarItinerario('pdf')}
              title="Descargar como PDF"
            >
              <PiFilePdfDuotone size={20} />
              PDF
            </button>
          </div>
        </div>

        {/* Mapa placeholder */}
        <div className={styles.mapaWrapper}>
          <div className={styles.mapaPlaceholder}>
            <PiMapPinDuotone size={48} className={styles.mapaIcon} />
            <h3>Mapa interactivo</h3>
            <p>Próximamente — integración con Leaflet</p>
            <span>
              Los{" "}
              {itinerario.reduce((acc, d) => acc + d.destinos.length, 0)}{" "}
              destinos aparecerán aquí
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
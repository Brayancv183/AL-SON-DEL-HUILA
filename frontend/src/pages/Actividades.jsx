import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
import { identificarLugar, imagenADataUrl } from '../api/chat';
import { generarCaption, sugerirEtiquetas } from '../api/ia';
import { PiMapPinDuotone, PiHeartDuotone, PiHeartFill, PiSparkleDuotone } from 'react-icons/pi';
import styles from './Actividades.module.css';

function timeAgo(date) {
  const now = new Date();
  const diff = Math.floor((now - new Date(date)) / 1000);
  const intervals = [
    { label: 'año', seconds: 31536000 },
    { label: 'mes', seconds: 2592000 },
    { label: 'día', seconds: 86400 },
    { label: 'hora', seconds: 3600 },
    { label: 'minuto', seconds: 60 },
    { label: 'segundo', seconds: 1 }
  ];
  for (const interval of intervals) {
    const count = Math.floor(diff / interval.seconds);
    if (count >= 1) {
      return `hace ${count} ${interval.label}${count !== 1 ? 's' : ''}`;
    }
  }
  return 'hace un momento';
}

export default function Actividades() {
  const { isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ imagen: null, descripcion: '', ubicacion: '' });
  const [subiendo, setSubiendo] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);
  const [lugarSugerido, setLugarSugerido] = useState(null); // {lugar, municipio, confianza}
  const [identificando, setIdentificando] = useState(false);
  const [fotoDataUrl, setFotoDataUrl] = useState(null);
  const [etiquetasSugeridas, setEtiquetasSugeridas] = useState([]); // ['Naturaleza', 'Fotografía']
  const [escribiendoCaption, setEscribiendoCaption] = useState(false);

  useEffect(() => {
    cargarPublicaciones();
  }, []);

  const cargarPublicaciones = async () => {
    try {
      const res = await api.get('/publicaciones');
      setPublicaciones(res.data);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  const handleLike = async (id) => {
    if (!isAuthenticated) {
      navigate('/login');
      return;
    }
    try {
      const res = await api.post(`/publicaciones/${id}/like`);
      setPublicaciones(prev =>
        prev.map(pub =>
          pub.id === id
            ? { ...pub, likes_count: res.data.likes, liked_by_user: res.data.liked }
            : pub
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = async (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setFormData({ ...formData, imagen: file });
    setPreviewUrl(URL.createObjectURL(file));
    // Identificar el lugar con Huily (visión)
    setLugarSugerido(null);
    setEtiquetasSugeridas([]);
    setIdentificando(true);
    try {
      const dataUrl = await imagenADataUrl(file, 1280, 0.85);
      setFotoDataUrl(dataUrl);
      // Ambas llamadas de visión en paralelo; cada una es opcional
      const [ident, tags] = await Promise.allSettled([
        identificarLugar(dataUrl),
        sugerirEtiquetas(dataUrl),
      ]);
      if (ident.status === 'fulfilled' && ident.value.lugar && ident.value.confianza >= 30) {
        setLugarSugerido(ident.value);
      }
      if (tags.status === 'fulfilled' && Array.isArray(tags.value.etiquetas)) {
        setEtiquetasSugeridas(tags.value.etiquetas);
      }
    } catch {
      // silencioso: las sugerencias de IA son opcionales
    } finally {
      setIdentificando(false);
    }
  };

  const aplicarLugarSugerido = () => {
    if (!lugarSugerido) return;
    const texto = lugarSugerido.municipio
      ? `${lugarSugerido.lugar}, ${lugarSugerido.municipio}`
      : lugarSugerido.lugar;
    setFormData(prev => ({ ...prev, ubicacion: texto }));
    setLugarSugerido(null);
  };

  const escribirCaption = async () => {
    if (!fotoDataUrl || escribiendoCaption) return;
    setEscribiendoCaption(true);
    try {
      const lugar = lugarSugerido?.lugar || formData.ubicacion || '';
      const caption = await generarCaption(fotoDataUrl, lugar);
      setFormData(prev => ({ ...prev, descripcion: caption }));
    } catch {
      alert('Huily no pudo escribir el caption ahora. Intenta de nuevo en unos segundos.');
    } finally {
      setEscribiendoCaption(false);
    }
  };

  const toggleTag = (tag) => {
    const hashtag = `#${tag.replace(/\s+/g, '')}`;
    setFormData(prev => {
      if (prev.descripcion.includes(hashtag)) {
        return { ...prev, descripcion: prev.descripcion.replace(new RegExp(`\\s*${hashtag}`, 'g'), '') };
      }
      return { ...prev, descripcion: `${prev.descripcion}${prev.descripcion && !prev.descripcion.endsWith(' ') ? ' ' : ''}${hashtag} ` };
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!formData.imagen) return;
    setSubiendo(true);
    const data = new FormData();
    data.append('imagen', formData.imagen);
    data.append('descripcion', formData.descripcion);
    data.append('ubicacion', formData.ubicacion);
    try {
      const res = await api.post('/publicaciones', data, { headers: { 'Content-Type': 'multipart/form-data' } });
      setPublicaciones([res.data, ...publicaciones]);
      setShowModal(false);
      setFormData({ imagen: null, descripcion: '', ubicacion: '' });
      setPreviewUrl(null);
      setLugarSugerido(null);
      setFotoDataUrl(null);
      setEtiquetasSugeridas([]);
    } catch (err) {
      console.error(err);
      alert('Error al publicar');
    } finally {
      setSubiendo(false);
    }
  };

  const handleAbrirModal = () => {
    if (!isAuthenticated) {
      navigate('/login');
    } else {
      setShowModal(true);
    }
  };

  const cerrarModal = () => {
    setShowModal(false);
    setFormData({ imagen: null, descripcion: '', ubicacion: '' });
    setPreviewUrl(null);
    setLugarSugerido(null);
    setFotoDataUrl(null);
    setEtiquetasSugeridas([]);
  };

  if (loading) return <div className={styles.loading}>Cargando actividades...</div>;

  return (
    <div className={styles.container}>
      <div className={styles.header}>
        <h1>Actividades</h1>
        {isAuthenticated && (
          <button className={styles.btnCrear} onClick={handleAbrirModal}>
            + Nueva publicación
          </button>
        )}
      </div>

      <div className={styles.feed}>
        {publicaciones.length === 0 ? (
          <p className={styles.vacio}>No hay publicaciones aún. ¡Sé el primero en compartir tu experiencia!</p>
        ) : (
          publicaciones.map(pub => (
            <div key={pub.id} className={styles.post}>
              {/* Header: avatar, nombre, ubicación debajo, tiempo a la derecha */}
              <div className={styles.postHeader}>
                <img
                  src={pub.user?.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(pub.user?.nombre || 'U')}&background=random`}
                  alt="avatar"
                  className={styles.avatar}
                />
                <div className={styles.userInfo}>
                  <strong className={styles.userName}>{pub.user?.nombre || 'Usuario'}</strong>
                  {pub.ubicacion && (
                    <span className={styles.ubicacionUnder}>
                      <PiMapPinDuotone size={12} className={styles.ubicacionIcon} /> {pub.ubicacion}
                    </span>
                  )}
                </div>
                <span className={styles.postTimeRight}>{timeAgo(pub.created_at)}</span>
              </div>

              {/* Imagen */}
              <img src={pub.imagen} alt="publicación" className={styles.postImage} />

              {/* Botones de acción */}
              <div className={styles.postActions}>
                <button 
                  onClick={() => handleLike(pub.id)} 
                  className={styles.actionBtn}
                >
                  {pub.liked_by_user ? (
                    <PiHeartFill size={16} className={styles.heartRed} />
                  ) : (
                    <PiHeartDuotone size={16} />
                  )}
                  {pub.likes_count || 0}
                </button>
              </div>

              {/* Descripción */}
              {pub.descripcion && (
                <p className={styles.descripcion}>
                  <strong>{pub.user?.nombre || 'Usuario'}</strong> {pub.descripcion}
                </p>
              )}

              {/* Fecha completa */}
              <small className={styles.fecha}>
                {new Date(pub.created_at).toLocaleDateString('es-CO', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                  hour: '2-digit',
                  minute: '2-digit'
                })}
              </small>
            </div>
          ))
        )}
      </div>

      {/* Modal para nueva publicación */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={cerrarModal}>
          <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Compartir experiencia</h2>
              <button className={styles.closeBtn} onClick={cerrarModal}>✕</button>
            </div>
            <form onSubmit={handleSubmit} className={styles.modalForm}>
              <div className={styles.imageUploadArea}>
                {previewUrl ? (
                  <div className={styles.imagePreview}>
                    <img src={previewUrl} alt="preview" />
                    <button
                      type="button"
                      className={styles.changeImageBtn}
                      onClick={() => {
                        setFormData({ ...formData, imagen: null });
                        setPreviewUrl(null);
                        setLugarSugerido(null);
                        setFotoDataUrl(null);
                        setEtiquetasSugeridas([]);
                      }}
                    >
                      Cambiar foto
                    </button>
                  </div>
                ) : (
                  <label className={styles.uploadLabel}>
                    <input type="file" accept="image/*" onChange={handleFileChange} required />
                    <div className={styles.uploadIcon}>📸</div>
                    <span>Subir foto</span>
                  </label>
                )}
              </div>

              {/* Sugerencia de lugar detectado por Huily */}
              {identificando && (
                <div className={styles.lugarDetectando}>
                  <PiSparkleDuotone size={14} /> Huily está identificando el lugar de la foto...
                </div>
              )}
              {lugarSugerido && (
                <div className={styles.lugarSugerido}>
                  <PiSparkleDuotone size={14} />
                  <span>
                    Huily detectó: <strong>{lugarSugerido.lugar}</strong>
                    {lugarSugerido.municipio ? ` · ${lugarSugerido.municipio}` : ''}
                    {` (${lugarSugerido.confianza}% seguro)`}
                  </span>
                  <button type="button" onClick={aplicarLugarSugerido} className={styles.btnUsarLugar}>
                    Usar como ubicación
                  </button>
                </div>
              )}
              <div className={styles.formFields}>
                {fotoDataUrl && (
                  <div className={styles.iaRow}>
                    <button
                      type="button"
                      className={styles.btnCaption}
                      onClick={escribirCaption}
                      disabled={escribiendoCaption}
                    >
                      <PiSparkleDuotone size={13} />
                      {escribiendoCaption ? 'Huily está escribiendo...' : 'Escribir caption con IA'}
                    </button>
                  </div>
                )}
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="¿Qué viviste en este lugar?"
                  rows="3"
                  className={styles.textarea}
                />
                {etiquetasSugeridas.length > 0 && (
                  <div className={styles.tagsSugeridas}>
                    <span className={styles.tagsLabel}>
                      <PiSparkleDuotone size={11} /> Huily sugiere:
                    </span>
                    {etiquetasSugeridas.map(tag => (
                      <button
                        key={tag}
                        type="button"
                        className={styles.tagChip}
                        onClick={() => toggleTag(tag)}
                      >
                        #{tag.replace(/\s+/g, '')}
                      </button>
                    ))}
                  </div>
                )}
                <input
                  type="text"
                  name="ubicacion"
                  value={formData.ubicacion}
                  onChange={handleInputChange}
                  placeholder="📍 Ubicación (ej: Desierto de la Tatacoa)"
                  className={styles.input}
                />
              </div>
              <div className={styles.modalActions}>
                <button type="button" className={styles.cancelBtn} onClick={cerrarModal}>
                  Cancelar
                </button>
                <button type="submit" className={styles.submitBtn} disabled={subiendo}>
                  {subiendo ? 'Publicando...' : 'Publicar'}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
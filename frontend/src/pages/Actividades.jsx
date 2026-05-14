import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import api from '../services/api';
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
  const { user, isAuthenticated } = useAuth();
  const navigate = useNavigate();
  const [publicaciones, setPublicaciones] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({ imagen: null, descripcion: '', ubicacion: '' });
  const [subiendo, setSubiendo] = useState(false);
  const [previewUrl, setPreviewUrl] = useState(null);

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
            ? { ...pub, likes: res.data.likes, liked_by_user: res.data.liked }
            : pub
        )
      );
    } catch (err) {
      console.error(err);
    }
  };

  const handleInputChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setFormData({ ...formData, imagen: file });
      setPreviewUrl(URL.createObjectURL(file));
    }
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

  const handleCancelModal = () => {
    setShowModal(false);
    setFormData({ imagen: null, descripcion: '', ubicacion: '' });
    setPreviewUrl(null);
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
              <div className={styles.postHeader}>
                <img
                  src={pub.user?.foto || `https://ui-avatars.com/api/?name=${encodeURIComponent(pub.user?.nombre || 'U')}&background=random`}
                  alt="avatar"
                  className={styles.avatar}
                />
                <div className={styles.userInfo}>
                  <strong className={styles.userName}>{pub.user?.nombre || 'Usuario'}</strong>
                  {pub.ubicacion && <span className={styles.ubicacionUnder}>📍 {pub.ubicacion}</span>}
                </div>
                <span className={styles.postTimeRight}>{timeAgo(pub.created_at)}</span>
              </div>
              <img src={pub.imagen} alt="publicación" className={styles.postImage} />
              <div className={styles.postActions}>
                <button onClick={() => handleLike(pub.id)} className={styles.actionBtn}>
                  {pub.liked_by_user ? '❤️' : '🤍'} {pub.likes}
                </button>
              </div>
              {pub.descripcion && (
                <p className={styles.descripcion}>
                  <strong>{pub.user?.nombre || 'Usuario'}</strong> {pub.descripcion}
                </p>
              )}
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

      {/* Modal mejorado */}
      {showModal && (
        <div className={styles.modalOverlay} onClick={handleCancelModal}>
          <div className={styles.modalContainer} onClick={e => e.stopPropagation()}>
            <div className={styles.modalHeader}>
              <h2>Compartir experiencia</h2>
              <button className={styles.closeBtn} onClick={handleCancelModal}>✕</button>
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
              <div className={styles.formFields}>
                <textarea
                  name="descripcion"
                  value={formData.descripcion}
                  onChange={handleInputChange}
                  placeholder="¿Qué viviste en este lugar?"
                  rows="3"
                  className={styles.textarea}
                />
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
                <button type="button" className={styles.cancelBtn} onClick={handleCancelModal}>
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
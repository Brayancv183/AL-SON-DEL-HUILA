import { useEffect, useState } from 'react'
import Mapa from '../components/Mapa'
import { getDestinos } from '../api/destinos'
import styles from './Mapa.module.css'

/**
 * Página /mapa: carga los destinos desde la API
 * y los pasa al componente Mapa (que espera props).
 */
export default function MapaPage() {
  const [destinos, setDestinos] = useState([])
  const [cargando, setCargando] = useState(true)
  const [error, setError] = useState(null)

  useEffect(() => {
    getDestinos()
      .then(data => setDestinos(Array.isArray(data) ? data : []))
      .catch(() => setError('No pude cargar los destinos. Verifica que el backend esté corriendo.'))
      .finally(() => setCargando(false))
  }, [])

  if (cargando) {
    return (
      <div className={styles.estado}>
        <div className={styles.spinner} />
        <p>Cargando mapa...</p>
      </div>
    )
  }

  if (error) {
    return (
      <div className={styles.estado}>
        <p>{error}</p>
      </div>
    )
  }

  return (
    <div className={styles.page}>
      <Mapa destinos={destinos} />
    </div>
  )
}

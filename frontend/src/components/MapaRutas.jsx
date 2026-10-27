import { useEffect, useRef, useState } from "react"
import { PiMapPinDuotone } from "react-icons/pi"
import styles from "./MapaRutas.module.css"

export default function MapaRutas({ destinos = [], onDestinoClick }) {
  const mapaRef     = useRef(null)
  const instanceRef = useRef(null)
  const markersRef  = useRef([])
  const lineaRef    = useRef(null)
  const [listo,     setListo] = useState(false)

  useEffect(() => {
    const init = async () => {
      const L = (await import("leaflet")).default
      await import("leaflet/dist/leaflet.css")
      if (instanceRef.current || !mapaRef.current) return

      delete L.Icon.Default.prototype._getIconUrl
      L.Icon.Default.mergeOptions({
        iconRetinaUrl: "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon-2x.png",
        iconUrl:       "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-icon.png",
        shadowUrl:     "https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.9.4/images/marker-shadow.png",
      })

      const mapa = L.map(mapaRef.current, { center: [2.0, -75.5], zoom: 8, zoomControl: false, attributionControl: true })
      L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
        attribution: '© <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: ['a', 'b', 'c'],
        maxZoom: 19,
      }).addTo(mapa)
      L.control.zoom({ position: "bottomright" }).addTo(mapa)
      instanceRef.current = mapa
      setListo(true)
    }
    init()
    return () => { if (instanceRef.current) { instanceRef.current.remove(); instanceRef.current = null } }
  }, [])

  useEffect(() => {
    if (!listo || !instanceRef.current) return
    const actualizar = async () => {
      const L = (await import("leaflet")).default
      markersRef.current.forEach(m => m.remove())
      markersRef.current = []
      if (lineaRef.current) lineaRef.current.remove()
      if (destinos.length === 0) return
      const puntos = []
      destinos.forEach((destino, i) => {
        if (!destino.latitud || !destino.longitud) return
        const lat = parseFloat(destino.latitud)
        const lng = parseFloat(destino.longitud)
        const icono = L.divIcon({
          className: "",
          html: `
            <div style="position: relative; width: 40px; height: 40px;">
              <div style="width:40px;height:40px;border-radius:50%;background:linear-gradient(135deg,#C4622D,#D4A843);border:3px solid white;box-shadow:0 4px 12px rgba(0,0,0,0.4);display:flex;align-items:center;justify-content:center;color:white;font-weight:800;font-size:14px;font-family:sans-serif;overflow:hidden;">
                ${destino.imagen ? `<img src="${destino.imagen}" style="width:100%;height:100%;object-fit:cover;border-radius:50%" />` : `${i + 1}`}
              </div>
              <div style="position:absolute;bottom:-6px;left:50%;transform:translateX(-50%);width:0;height:0;border-left:6px solid transparent;border-right:6px solid transparent;border-top:8px solid #C4622D;"></div>
            </div>
          `,
          iconSize: [40, 48],
          iconAnchor: [20, 48],
          popupAnchor: [0, -48],
        })
        const marker = L.marker([lat, lng], { icon: icono })
          .bindPopup(`
            <div style="font-family:sans-serif;min-width:200px;background:#0d0c0b;color:white;border-radius:8px;overflow:hidden;margin:-13px -20px -10px;">
              ${destino.imagen ? `<img src="${destino.imagen}" style="width:100%;height:110px;object-fit:cover" onerror="this.style.display='none'" />` : `<div style="height:80px;background:linear-gradient(135deg,#C4622D44,#D4A84344);display:flex;align-items:center;justify-content:center;font-size:1.5rem;color:#D4A843;font-weight:bold;">${i+1}</div>`}
              <div style="padding:10px 12px">
                <div style="display:flex;align-items:center;gap:6px;margin-bottom:4px">
                  <div style="width:20px;height:20px;border-radius:50%;background:linear-gradient(135deg,#C4622D,#D4A843);color:white;font-size:10px;font-weight:800;display:flex;align-items:center;justify-content:center;">${i+1}</div>
                  <strong style="color:#D4A843;font-size:13px">${destino.nombre}</strong>
                </div>
                <div style="color:#888;font-size:11px">
                  <span>Ubicación: </span>${destino.municipio?.nombre || destino.municipio || "Huila"}
                  &nbsp;·&nbsp;
                  <span>Tipo: </span>${destino.categoria?.nombre || destino.categoria || ""}
                </div>
                ${destino.descripcion ? `<p style="color:#aaa;font-size:11px;margin-top:6px;line-height:1.4">${destino.descripcion?.slice(0, 80)}...</p>` : ""}
              </div>
            </div>
          `, { maxWidth: 220, className: "popup-oscuro" })
          .addTo(instanceRef.current)
        if (onDestinoClick) marker.on("click", () => onDestinoClick(destino))
        markersRef.current.push(marker)
        puntos.push([lat, lng])
      })
      if (puntos.length > 1) lineaRef.current = L.polyline(puntos, { color: "#D4A843", weight: 3, opacity: 0.7, dashArray: "8, 6", lineJoin: "round" }).addTo(instanceRef.current)
      if (puntos.length > 0) instanceRef.current.fitBounds(puntos, { padding: [60, 60] })
    }
    actualizar()
  }, [destinos, listo])

  return (
    <div className={styles.wrapper}>
      <div ref={mapaRef} className={styles.mapa} />
      {destinos.length > 0 && (
        <div className={styles.leyenda}>
          <div className={styles.leyendaHeader}><span>- {destinos.length} destinos</span>{destinos.length > 1 && <span className={styles.rutaTag}>Ruta trazada</span>}</div>
          <div className={styles.leyendaLista}>
            {destinos.map((d, i) => (
              <div key={d.id} className={styles.leyendaItem} onClick={() => onDestinoClick?.(d)}>
                <div className={styles.leyendaNum}>{i + 1}</div>
                <div className={styles.leyendaInfo}>
                  <span className={styles.leyendaNombre}>{d.nombre}</span>
                  <span className={styles.leyendaMuni}>{d.municipio?.nombre || d.municipio}</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
      {destinos.length === 0 && (
        <div className={styles.empty}>
          <div className={styles.emptyIcon}><PiMapPinDuotone size={48} /></div>
          <p>Habla con Huily para explorar destinos en el mapa</p>
        </div>
      )}
    </div>
  )
}
import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';
import markerIcon from 'leaflet/dist/images/marker-icon.png';
import markerShadow from 'leaflet/dist/images/marker-shadow.png';

// Arreglar los iconos por defecto de Leaflet (Webpack/Vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: markerIcon,
  iconUrl: markerIcon,
  shadowUrl: markerShadow,
});

export default function Mapa({ destinos }) {
  const mapRef = useRef(null);

  useEffect(() => {
    if (!mapRef.current && destinos && destinos.length > 0) {
      // Centrar en el primer destino o coordenadas por defecto (Neiva)
      const primerDestino = destinos[0];
      const lat = primerDestino.latitud ? parseFloat(primerDestino.latitud) : 2.9276;
      const lng = primerDestino.longitud ? parseFloat(primerDestino.longitud) : -75.2818;
      
      const map = L.map('mapa').setView([lat, lng], 9);
      L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        subdomains: ['a', 'b', 'c'],
        maxZoom: 19,
      }).addTo(map);
      mapRef.current = map;
    }

    // Agregar marcadores cuando cambien los destinos
    if (mapRef.current && destinos && destinos.length > 0) {
      // Limpiar marcadores existentes (opcional, para evitar duplicados)
      mapRef.current.eachLayer((layer) => {
        if (layer instanceof L.Marker) {
          mapRef.current.removeLayer(layer);
        }
      });

      const bounds = [];
      destinos.forEach((destino) => {
        const lat = parseFloat(destino.latitud);
        const lng = parseFloat(destino.longitud);
        if (!isNaN(lat) && !isNaN(lng)) {
          L.marker([lat, lng])
            .bindPopup(`<b>${destino.nombre}</b><br>${destino.municipio || ''}<br>${destino.categoria || ''}`)
            .addTo(mapRef.current);
          bounds.push([lat, lng]);
        }
      });
      
      // Ajustar vista para mostrar todos los marcadores
      if (bounds.length > 0) {
        mapRef.current.fitBounds(bounds);
      }
    }
  }, [destinos]);

  return <div id="mapa" style={{ height: '100%', width: '100%', borderRadius: '16px' }} />;
}
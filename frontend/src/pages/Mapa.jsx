import { useEffect, useRef } from 'react';
import L from 'leaflet';
import 'leaflet/dist/leaflet.css';

// Configuración de iconos usando CDN (evita problemas de importación en Vite)
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

export default function Mapa({ destinos, onDestinoClick }) {
  const mapRef = useRef(null);

  useEffect(() => {
    // Inicializar mapa si aún no existe y hay destinos
    if (!mapRef.current && destinos && destinos.length > 0) {
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

    // Actualizar marcadores cuando cambien los destinos
    if (mapRef.current && destinos && destinos.length > 0) {
      // Limpiar marcadores existentes (excepto la capa base del mapa)
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
          // Crear el marcador
          const marker = L.marker([lat, lng])
            .bindPopup(`
              <b>${destino.nombre}</b><br>
              ${destino.municipio || ''}<br>
              ${destino.categoria || ''}<br>
              <button class="ver-mapa-btn" data-id="${destino.id}">🔍 Ver más</button>
            `)
            .addTo(mapRef.current);
          
          // Agregar evento al popup cuando se abre
          marker.on('popupopen', () => {
            const btn = document.querySelector(`.ver-mapa-btn[data-id="${destino.id}"]`);
            if (btn && onDestinoClick) {
              btn.addEventListener('click', (e) => {
                e.stopPropagation();
                onDestinoClick(destino);
                // Cerrar el popup después de abrir el modal (opcional)
                marker.closePopup();
              });
            }
          });
          
          bounds.push([lat, lng]);
        }
      });

      // Ajustar zoom para mostrar todos los marcadores
      if (bounds.length > 0) {
        mapRef.current.fitBounds(bounds);
      }
    }

    // Redimensionar mapa cuando cambie el tamaño de la ventana
    const handleResize = () => {
      if (mapRef.current) {
        mapRef.current.invalidateSize();
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [destinos, onDestinoClick]);

  return <div id="mapa" style={{ height: '100%', width: '100%', borderRadius: '16px' }} />;
}
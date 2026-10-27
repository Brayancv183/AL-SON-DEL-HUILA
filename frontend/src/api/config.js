// Configuración central de la API
// Usa VITE_API_URL en .env para producción; por defecto localhost
export const API_URL = import.meta.env.VITE_API_URL || 'http://localhost:8000/api'

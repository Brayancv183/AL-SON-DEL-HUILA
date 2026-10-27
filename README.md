# Al Son del Huila

Plataforma de turismo del Huila (Colombia): catálogo de destinos, mapa, publicaciones sociales y planificador de rutas con IA ("Huily").

**Stack:** Laravel 13 (PHP) · React 19 + Vite · MySQL · Leaflet · Groq (IA)

## Estructura

- `backend/` — API Laravel (Sanctum, endpoints REST, proxy de IA)
- `frontend/` — SPA React (Vite, React Router, framer-motion, Leaflet)
- `database/` — dumps SQL y datos de referencia (precios, destinos, rutas)

## Requisitos

- PHP 8.4+ (CLI con extensiones: pdo_mysql, mbstring, curl, gd, openssl)
- Composer 2
- Node.js 20+ y npm
- MySQL 8 (o MariaDB equivalente)

## Instalación

### 1. Base de datos

Opción A — desde dump completo:

```bash
mysql -u root -p -e "CREATE DATABASE al_son_del_huila CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci"
mysql -u root -p al_son_del_huila < database/al_son_del_huila_backup.sql
```

Opción B — desde cero (solo esquema, sin datos):

```bash
cd backend
php artisan migrate:fresh
```

Nota: el dump incluye precios de referencia (`precio_entrada`) para ~55 destinos. Los destinos sin precio muestran "precio no registrado".

### 2. Backend

```bash
cd backend
composer install
cp .env.example .env
php artisan key:generate
```

Edita `.env` (ver sección siguiente) y si aplica:

```bash
php artisan storage:link
php artisan serve --host=127.0.0.1 --port=8000
```

### 3. Frontend

```bash
cd frontend
npm install
cp .env.example .env   # solo VITE_API_URL
npm run dev
```

El frontend queda en `http://localhost:5173` y habla con la API en `VITE_API_URL` (por defecto `http://127.0.0.1:8000/api`).

## Variables de entorno (backend/.env)

| Variable | Descripción |
|---|---|
| `DB_*` | Conexión MySQL |
| `GROQ_API_KEY` | **Obligatoria** para Huily. Clave de https://console.groq.com (modelo `qwen/qwen3.8-27b`, texto + imagen). La clave viaja solo por el backend; nunca se expone al navegador. |
| `GOOGLE_CLIENT_ID` / `GOOGLE_CLIENT_SECRET` | OAuth de Google (opcional). Redirect: `{APP_URL}/api/auth/google/callback`, frontend: `{FRONTEND_URL}/auth/google/callback` |
| `SANCTUM_EXPIRATION_MINUTES` | Duración del token (por defecto 10080 = 7 días) |
| `CORS_ORIGINS` | Orígenes permitidos (el frontend en dev: `http://localhost:5173`) |

**Seguridad:** nunca subas `.env` al repositorio. Si una clave quedó expuesta (commiteada o compartida), rótala de inmediato en el panel del proveedor. Google recomienda rotar `GOOGLE_CLIENT_SECRET` si el original fue publicado.

## Endpoints principales

- `GET /api/destinos` — catálogo (filtros: `categoria`, `municipio`, `entorno`, `etiquetas`, `busqueda`, `limit`)
- `POST /api/recomendar` — itinerario por scoring (categorías, entornos, etiquetas, tipo de viajero, días)
- `POST /api/chat` — Huily (proxy Groq con contexto de destinos, presupuesto y ruta activa)
- `GET/POST /api/publicaciones`, `POST /api/publicaciones/{id}/like` — muro social (like requiere auth)
- `GET/POST/DELETE /api/rutas` — rutas guardadas (públicas y propias)
- Auth: `POST /api/auth/register|login|logout`, `GET /api/auth/google`

## Calidad de código

```bash
cd frontend && npx eslint .    # 0 errores
cd frontend && npm run build
```

## Licencia

Proyecto privado. Todos los derechos reservados.

<div align="center">

<img src="Logo/logo .jpeg" alt="Al Son del Huila Logo" width="180" />

# 🎡 Al Son del Huila

**Plataforma web para la promoción y difusión de la cultura, gastronomía y turismo del departamento del Huila, Colombia.**

[![PHP](https://img.shields.io/badge/PHP-8.x-777BB4?style=for-the-badge&logo=php&logoColor=white)](https://www.php.net/)
[![Laravel](https://img.shields.io/badge/Laravel-10.x-FF2D20?style=for-the-badge&logo=laravel&logoColor=white)](https://laravel.com/)
[![JavaScript](https://img.shields.io/badge/JavaScript-ES6+-F7DF1E?style=for-the-badge&logo=javascript&logoColor=black)](https://developer.mozilla.org/es/docs/Web/JavaScript)
[![MySQL](https://img.shields.io/badge/MySQL-8.0-4479A1?style=for-the-badge&logo=mysql&logoColor=white)](https://www.mysql.com/)
[![CSS3](https://img.shields.io/badge/CSS3-Custom-1572B6?style=for-the-badge&logo=css3&logoColor=white)](https://developer.mozilla.org/es/docs/Web/CSS)
[![License: MIT](https://img.shields.io/badge/Licencia-MIT-green.svg?style=for-the-badge)](https://opensource.org/licenses/MIT)

[📋 Descripción](#-descripción) · [⚙️ Tecnologías](#️-tecnologías) · [🚀 Instalación](#-instalación) · [📁 Estructura](#-estructura-del-proyecto) · [👥 Equipo](#-equipo) · [📄 Licencia](#-licencia)

</div>

---

## 📋 Descripción

**Al Son del Huila** es una aplicación web full-stack desarrollada para preservar, visibilizar y promover la riqueza cultural y turística del departamento del Huila, Colombia. La plataforma ofrece a los usuarios una experiencia inmersiva para explorar destinos, tradiciones, gastronomía típica y eventos culturales de esta región.

> 🎵 *"Al Son del Huila"* nace como un homenaje digital a la identidad huilense, integrando tecnología moderna al servicio de la cultura y el patrimonio regional.

### ✨ Características principales

- 🗺️ **Exploración de destinos turísticos** — Listado y detalle de los principales atractivos del Huila.
- 🍽️ **Gastronomía típica** — Catálogo de platos y bebidas tradicionales de la región.
- 🎭 **Cultura y tradiciones** — Información sobre folclor, festivales y costumbres huilenses.
- 👤 **Gestión de usuarios** — Sistema de autenticación y roles (administrador / visitante).
- 🛠️ **Panel de administración** — CRUD completo para gestión de contenidos desde el backend.
- 📱 **Diseño responsivo** — Interfaz adaptada a dispositivos móviles y de escritorio.

---

## ⚙️ Tecnologías

### Backend
| Tecnología | Versión | Uso |
|---|---|---|
| PHP | 8.x | Lenguaje principal del servidor |
| Laravel | 10.x | Framework MVC |
| Blade | — | Motor de plantillas para las vistas |
| MySQL | 8.0 | Base de datos relacional |

### Frontend
| Tecnología | Versión | Uso |
|---|---|---|
| JavaScript | ES6+ | Interactividad y lógica del cliente |
| CSS3 | — | Estilos y diseño visual personalizado |
| HTML5 | — | Estructura de las vistas |

---

## 🚀 Instalación

Sigue los pasos a continuación para ejecutar el proyecto localmente.

### Prerrequisitos

Asegúrate de tener instalado en tu máquina:

- [PHP 8.x](https://www.php.net/downloads)
- [Composer](https://getcomposer.org/)
- [Node.js y npm](https://nodejs.org/)
- [MySQL 8.0](https://www.mysql.com/downloads/)
- [Git](https://git-scm.com/)

### 1. Clonar el repositorio

```bash
git clone https://github.com/Brayancv183/AL-SON-DEL-HUILA.git
cd AL-SON-DEL-HUILA
```

### 2. Configurar el Backend (Laravel)

```bash
# Ingresar a la carpeta del backend
cd backend

# Instalar dependencias de PHP
composer install

# Copiar el archivo de variables de entorno
cp .env.example .env

# Generar la clave de la aplicación
php artisan key:generate
```

### 3. Configurar la base de datos

Edita el archivo `.env` con tus credenciales de MySQL:

```env
DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=al_son_del_huila
DB_USERNAME=tu_usuario
DB_PASSWORD=tu_contraseña
```

Luego ejecuta las migraciones y seeders:

```bash
php artisan migrate --seed
```

> También puedes importar el script SQL directamente desde la carpeta `/database`.

### 4. Instalar dependencias del Frontend

```bash
# Desde la carpeta del frontend
cd ../frontend

# Instalar paquetes de Node
npm install

# Compilar assets
npm run dev
```

### 5. Levantar el servidor

```bash
# Desde la carpeta del backend
cd ../backend

php artisan serve
```

La aplicación estará disponible en: **http://localhost:8000**

---

## 📁 Estructura del proyecto

```
AL-SON-DEL-HUILA/
│
├── 📁 Archivos/          # Recursos y archivos multimedia del proyecto
├── 📁 Logo/              # Logotipos e identidad visual
│
├── 📁 backend/           # Aplicación Laravel (PHP)
│   ├── app/              # Modelos, controladores y servicios
│   ├── database/         # Migraciones y seeders
│   ├── resources/views/  # Vistas Blade
│   ├── routes/           # Definición de rutas web y API
│   └── public/           # Assets públicos
│
├── 📁 frontend/          # Lógica y estilos del cliente
│   ├── js/               # Scripts JavaScript
│   └── css/              # Hojas de estilo personalizadas
│
└── 📁 database/          # Scripts SQL y respaldo de la base de datos
```

---

## 🗃️ Base de datos

El script de base de datos se encuentra en la carpeta `/database`. Puedes importarlo directamente en MySQL:

```bash
mysql -u tu_usuario -p al_son_del_huila < database/al_son_del_huila.sql
```

---

## 🖼️ Capturas de pantalla

> 📌 *Próximamente se agregarán capturas de la interfaz de usuario.*

---

## 👥 Equipo

<table>
  <tr>
    <td align="center">
      <a href="https://github.com/Brayancv183">
        <img src="https://avatars.githubusercontent.com/Brayancv183" width="80" alt="Brayan CV"/><br/>
        <sub><b>Brayan CV</b></sub>
      </a>
      <br/>Developer
    </td>
  </tr>
</table>

¿Deseas contribuir? Lee nuestra guía de contribución a continuación.

---

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Para colaborar:

1. Haz un **fork** del repositorio.
2. Crea una rama para tu funcionalidad: `git checkout -b feature/nueva-funcionalidad`
3. Realiza tus cambios y haz commit: `git commit -m "feat: agrega nueva funcionalidad"`
4. Haz push a tu rama: `git push origin feature/nueva-funcionalidad`
5. Abre un **Pull Request** describiendo los cambios.

Por favor, sigue el estándar de commits [Conventional Commits](https://www.conventionalcommits.org/es/v1.0.0/).

---

## 🐛 Reporte de errores

Si encuentras un bug o tienes alguna sugerencia, por favor abre un [Issue](https://github.com/Brayancv183/AL-SON-DEL-HUILA/issues) con la siguiente información:

- Descripción del problema
- Pasos para reproducirlo
- Comportamiento esperado vs. comportamiento actual
- Capturas de pantalla (si aplica)

---

## 📄 Licencia

Este proyecto está distribuido bajo la licencia **MIT**. Consulta el archivo [LICENSE](./LICENSE) para más detalles.

---

<div align="center">

Hecho con ❤️ desde **Neiva, Huila — Colombia** 🇨🇴

*Preservando la cultura huilense a través de la tecnología*

</div>

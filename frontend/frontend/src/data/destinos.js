// Datos de ejemplo — reemplazar con GET /api/destinos cuando
// el backend Laravel esté listo

export const DESTINOS = [
  {
    id: 1,
    nombre:      "Desierto de la Tatacoa",
    descripcion: "Uno de los desiertos más hermosos de Colombia, con formaciones rojizas y cielos estrellados únicos.",
    imagen:      null,
    color:       "#C4622D",
    municipio:   "Villavieja",
    categoria:   { id: 1, nombre: "Naturaleza" },
    entorno:     { id: 5, nombre: "Desierto"   },
    etiquetas:   [
      { id: 4, nombre: "Fotografía" },
      { id: 8, nombre: "Astronómico" },
    ],
  },
  {
    id: 2,
    nombre:      "Parque Arqueológico San Agustín",
    descripcion: "Patrimonio de la humanidad con más de 500 estatuas precolombinas entre montañas verdes.",
    imagen:      null,
    color:       "#5A7A4A",
    municipio:   "San Agustín",
    categoria:   { id: 3, nombre: "Arqueológico" },
    entorno:     { id: 4, nombre: "Montañoso"    },
    etiquetas:   [
      { id: 5, nombre: "Historia"   },
      { id: 4, nombre: "Fotografía" },
    ],
  },
  {
    id: 3,
    nombre:      "Termales de Rivera",
    descripcion: "Aguas termales naturales con propiedades medicinales rodeadas de paisajes tropicales.",
    imagen:      null,
    color:       "#7A4A6A",
    municipio:   "Rivera",
    categoria:   { id: 10, nombre: "Bienestar y descanso" },
    entorno:     { id: 3, nombre: "Natural" },
    etiquetas:   [
      { id: 1, nombre: "Parejas" },
      { id: 2, nombre: "Familia" },
    ],
  },
  {
    id: 4,
    nombre:      "Cascada Los Tres Chorros",
    descripcion: "Impresionante cascada triple en medio de la selva huilense, ideal para el ecoturismo.",
    imagen:      null,
    color:       "#2D6A8A",
    municipio:   "Acevedo",
    categoria:   { id: 4, nombre: "Aventura"  },
    entorno:     { id: 7, nombre: "Cascadas"  },
    etiquetas:   [
      { id: 3, nombre: "Caminatas" },
      { id: 7, nombre: "Extremo"   },
    ],
  },
  {
    id: 5,
    nombre:      "Catedral de Neiva",
    descripcion: "Imponente catedral en el corazón de Neiva, referente arquitectónico e histórico del Huila.",
    imagen:      null,
    color:       "#8A6A2D",
    municipio:   "Neiva",
    categoria:   { id: 6, nombre: "Religioso" },
    entorno:     { id: 2, nombre: "Urbano"    },
    etiquetas:   [
      { id: 5, nombre: "Historia"   },
      { id: 6, nombre: "Tranquilo"  },
    ],
  },
  {
    id: 6,
    nombre:      "Festival Folclórico del Huila",
    descripcion: "El festival más importante del departamento, con música, danza y cultura huilense.",
    imagen:      null,
    color:       "#D4A843",
    municipio:   "Neiva",
    categoria:   { id: 9, nombre: "Eventos y festivales" },
    entorno:     { id: 2, nombre: "Urbano" },
    etiquetas:   [
      { id: 2, nombre: "Familia" },
      { id: 3, nombre: "Caminatas" },
    ],
  },
]
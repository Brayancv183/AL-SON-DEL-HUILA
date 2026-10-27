-- =====================================================
-- PRECIOS DE REFERENCIA (entrada por persona, COP)
-- Valores aproximados de referencia para Huily (2026).
-- Ajusta según tarifas oficiales vigentes.
-- =====================================================
USE al_son_del_huila;

UPDATE destinos SET precio_entrada = 25000 WHERE nombre = 'Parque Arqueológico de San Agustín';
UPDATE destinos SET precio_entrada = 20000 WHERE nombre = 'Observatorio Astronómico de la Tatacoa - OATA';
UPDATE destinos SET precio_entrada = 20000 WHERE nombre = 'Observatorio Astronómico Astrosur';
UPDATE destinos SET precio_entrada = 10000 WHERE nombre = 'Museo de Historia Natural La Tatacoa';
UPDATE destinos SET precio_entrada = 15000 WHERE nombre = 'PNR Ecorregión La Tatacoa';
UPDATE destinos SET precio_entrada = 0     WHERE nombre LIKE 'Desierto de la Tatacoa%';
UPDATE destinos SET precio_entrada = 10000 WHERE nombre = 'Cascada de Bordones';
UPDATE destinos SET precio_entrada = 35000 WHERE nombre = 'Termales Comfamiliar Rivera';
UPDATE destinos SET precio_entrada = 5000  WHERE nombre = 'Parque Isla del Mohán';
UPDATE destinos SET precio_entrada = 5000  WHERE nombre = 'Cueva del Mohán';
UPDATE destinos SET precio_entrada = 8000  WHERE nombre = 'Museo Arqueológico Regional del Huila';
UPDATE destinos SET precio_entrada = 0     WHERE nombre LIKE 'Estrecho del Magdalena%';
UPDATE destinos SET precio_entrada = 0     WHERE nombre = 'Malecón Río Magdalena';
UPDATE destinos SET precio_entrada = 0     WHERE nombre = 'Parque Central José Eustasio Rivera';
UPDATE destinos SET precio_entrada = 5000  WHERE nombre = 'Monumento Cacica La Gaitana y Museo Prehistórico Huilassik Park';
UPDATE destinos SET precio_entrada = 0     WHERE nombre = 'Catedral de la Inmaculada Concepción';
UPDATE destinos SET precio_entrada = 0     WHERE nombre = 'Edificio Nacional de Neiva';
UPDATE destinos SET precio_entrada = 0     WHERE nombre = 'Monumento a la Raza';
UPDATE destinos SET precio_entrada = 8000  WHERE nombre = 'Centro Cultural y de Convenciones José Eustasio Rivera';
UPDATE destinos SET precio_entrada = 15000 WHERE nombre LIKE '%Salto de Bordones%';
UPDATE destinos SET precio_entrada = 20000 WHERE nombre LIKE '%Finca%ecotur%';
UPDATE destinos SET precio_entrada = 10000 WHERE nombre LIKE '%Museo%';
UPDATE destinos SET precio_entrada = 0     WHERE nombre LIKE 'Mirador%';
UPDATE destinos SET precio_entrada = 0     WHERE nombre LIKE 'Parque%';
UPDATE destinos SET precio_entrada = 0     WHERE nombre LIKE 'Iglesia%';
UPDATE destinos SET precio_entrada = 0     WHERE nombre LIKE 'Templo%';
UPDATE destinos SET precio_entrada = 0     WHERE nombre LIKE 'Plaza%';
UPDATE destinos SET precio_entrada = 0     WHERE nombre LIKE 'Río Magdalena%';

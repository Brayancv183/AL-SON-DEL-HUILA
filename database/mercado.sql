-- Eliminar tablas si ya existen (en orden inverso por las FK)
DROP TABLE IF EXISTS detalle_pedidos;
DROP TABLE IF EXISTS productos;
DROP TABLE IF EXISTS pedidos;
DROP TABLE IF EXISTS clientes;

-- 1. Tabla Clientes
CREATE TABLE clientes (
    id_cliente INT AUTO_INCREMENT PRIMARY KEY,
    nombre VARCHAR(50) NOT NULL,
    ciudad VARCHAR(50) NOT NULL
);

-- 2. Tabla Pedidos
CREATE TABLE pedidos (
    id_pedido INT AUTO_INCREMENT PRIMARY KEY,
    id_cliente INT NULL, -- Puede ser NULL para practicar LEFT/RIGHT JOIN
    fecha DATE NOT NULL,
    total DECIMAL(10, 2) NOT NULL,
    CONSTRAINT fk_cliente FOREIGN KEY (id_cliente) REFERENCES clientes(id_cliente)
);

-- 3. Tabla Productos
CREATE TABLE productos (
    id_producto INT AUTO_INCREMENT PRIMARY KEY,
    nombre_producto VARCHAR(50) NOT NULL,
    precio DECIMAL(10, 2) NOT NULL
);

-- 4. Tabla Detalle de Pedidos (Tabla intermedia / Relación Muchos a Muchos)
CREATE TABLE detalle_pedidos (
    id_detalle INT AUTO_INCREMENT PRIMARY KEY,
    id_pedido INT,
    id_producto INT,
    cantidad INT NOT NULL,
    CONSTRAINT fk_pedido FOREIGN KEY (id_pedido) REFERENCES pedidos(id_pedido),
    CONSTRAINT fk_producto FOREIGN KEY (id_producto) REFERENCES productos(id_producto)
);

---------------------------------------------------------
-- INSERCIÓN DE DATOS (Con casos especiales para practicar)
---------------------------------------------------------

-- Clientes (Nota: Carlos no tiene pedidos registrados)
INSERT INTO clientes (id_cliente, nombre, ciudad) VALUES 
(1, 'Ana Pérez', 'Bogotá'),
(2, 'Luis Gómez', 'Medellín'),
(3, 'Carlos Ruiz', 'Cali');

-- Productos (Nota: El producto 'Impresora' no ha sido comprado por nadie)
INSERT INTO productos (id_producto, nombre_producto, precio) VALUES 
(1, 'Laptop', 1200.00),
(2, 'Mouse', 25.50),
(3, 'Teclado', 45.00),
(4, 'Impresora', 300.00);

-- Pedidos (Nota: El pedido 103 tiene id_cliente NULL para practicar huérfanos)
INSERT INTO pedidos (id_pedido, id_cliente, fecha, total) VALUES 
(101, 1, '2026-08-01', 1225.50),
(102, 2, '2026-08-03', 45.00),
(103, NULL, '2026-08-05', 300.00);

-- Detalle de Pedidos
INSERT INTO detalle_pedidos (id_pedido, id_producto, cantidad) VALUES 
(101, 1, 1), -- Pedido 101 incluye 1 Laptop
(101, 2, 1), -- Pedido 101 incluye 1 Mouse
(102, 3, 1); -- Pedido 102 incluye 1 Teclado
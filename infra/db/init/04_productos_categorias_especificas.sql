-- Limpiar productos de prueba anteriores
DELETE FROM productos WHERE codigo LIKE '%-00%';

-- ============================================
-- ABARROTES - Categorías: lacteos, cereales, enlatados, bebidas, snacks, condimentos
-- ============================================
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, volumen_peso_neto, fecha_vencimiento, stock_bajo, estado)
VALUES 
-- LÁCTEOS
('Leche Evaporada Gloria', 'ABAR-001', 45, 3.20, 5.50, 'lacteos', 'Gloria', '400g', '2025-08-20', 20, 'Disponible'),
('Yogurt Natural Laive', 'ABAR-002', 30, 2.50, 4.20, 'lacteos', 'Laive', '1L', '2025-07-15', 15, 'Disponible'),
('Queso Fresco Laive', 'ABAR-003', 25, 8.00, 13.50, 'lacteos', 'Laive', '500g', '2025-07-10', 12, 'Disponible'),

-- CEREALES
('Arroz Superior Paisana', 'ABAR-004', 50, 2.80, 4.50, 'cereales', 'Paisana', '1kg', '2026-03-30', 20, 'Disponible'),
('Avena 3 Ositos', 'ABAR-005', 35, 3.50, 6.00, 'cereales', '3 Ositos', '500g', '2025-12-31', 15, 'Disponible'),
('Fideos Don Vittorio', 'ABAR-006', 40, 2.00, 3.50, 'cereales', 'Don Vittorio', '500g', '2026-06-30', 18, 'Disponible'),

-- ENLATADOS
('Atún en Aceite Florida', 'ABAR-007', 60, 4.50, 7.80, 'enlatados', 'Florida', '170g', '2026-11-15', 25, 'Disponible'),
('Durazno en Almíbar Aconcagua', 'ABAR-008', 28, 5.50, 9.50, 'enlatados', 'Aconcagua', '820g', '2026-09-20', 12, 'Disponible'),
('Arvejas Verdes Florida', 'ABAR-009', 32, 2.80, 4.80, 'enlatados', 'Florida', '425g', '2026-10-30', 15, 'Disponible'),

-- BEBIDAS
('Gaseosa Inca Kola 1.5L', 'ABAR-010', 48, 3.00, 5.50, 'bebidas', 'Inca Kola', '1.5L', '2025-12-31', 20, 'Disponible'),
('Agua Mineral San Luis', 'ABAR-011', 60, 1.20, 2.50, 'bebidas', 'San Luis', '625ml', '2026-06-30', 25, 'Disponible'),
('Jugo de Naranja Pulp', 'ABAR-012', 35, 2.50, 4.50, 'bebidas', 'Pulp', '1L', '2025-08-15', 15, 'Disponible'),

-- SNACKS
('Papas Lays Clásicas', 'ABAR-013', 40, 2.00, 3.80, 'snacks', 'Lays', '150g', '2025-09-30', 18, 'Disponible'),
('Galletas Soda Field', 'ABAR-014', 35, 1.80, 3.20, 'snacks', 'Field', '200g', '2025-10-15', 16, 'Disponible'),
('Chocolate Sublime', 'ABAR-015', 30, 1.50, 2.80, 'snacks', 'Sublime', '30g', '2025-12-31', 14, 'Disponible'),

-- CONDIMENTOS
('Aceite Vegetal Primor', 'ABAR-016', 40, 8.50, 14.50, 'condimentos', 'Primor', '1L', '2025-12-31', 18, 'Disponible'),
('Sal de Mesa Emsal', 'ABAR-017', 50, 0.80, 1.50, 'condimentos', 'Emsal', '1kg', '2027-12-31', 20, 'Disponible'),
('Mayonesa Alacena', 'ABAR-018', 28, 4.50, 7.80, 'condimentos', 'Alacena', '500g', '2025-11-20', 12, 'Disponible');

-- ============================================
-- ROPA - Categorías: ropa, vestuario, prendas
-- ============================================
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, talla, color, genero, tipo_tela, stock_bajo, estado)
VALUES 
('Polo Básico Cuello Redondo', 'ROPA-001', 25, 15.00, 25.00, 'ropa', 'TopStyle', 'M', 'Azul', 'Unisex', 'Algodón', 10, 'Disponible'),
('Pantalón Jean Clásico', 'ROPA-002', 18, 45.00, 75.00, 'ropa', 'Denim Co', '32', 'Negro', 'Hombre', 'Jean', 8, 'Disponible'),
('Blusa Floral Manga Corta', 'ROPA-003', 12, 25.00, 42.00, 'ropa', 'FemStyle', 'S', 'Rosa', 'Mujer', 'Poliéster', 6, 'Disponible'),
('Camisa Formal Blanca', 'ROPA-004', 15, 35.00, 58.00, 'vestuario', 'Elegant', 'L', 'Blanco', 'Hombre', 'Algodón', 8, 'Disponible'),
('Falda Plisada', 'ROPA-005', 10, 28.00, 48.00, 'prendas', 'ModaChic', 'M', 'Negro', 'Mujer', 'Poliéster', 5, 'Disponible'),
('Casaca Jean Vintage', 'ROPA-006', 8, 65.00, 110.00, 'ropa', 'Vintage Co', 'L', 'Azul Desgastado', 'Unisex', 'Jean', 4, 'Disponible');

-- ============================================
-- CALZADO - Categorías: calzado, zapatos
-- ============================================
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, talla, color, genero, tipo_tela, garantia_dias, stock_bajo, estado)
VALUES 
('Zapatillas Deportivas Running', 'CALZ-001', 15, 80.00, 135.00, 'calzado', 'RunFast', '42', 'Negro/Blanco', 'Unisex', 'Sintético', 90, 8, 'Disponible'),
('Sandalias Verano Mujer', 'CALZ-002', 22, 30.00, 50.00, 'zapatos', 'BeachWalk', '38', 'Beige', 'Mujer', 'Cuero', 30, 10, 'Disponible'),
('Botas de Seguridad', 'CALZ-003', 10, 95.00, 160.00, 'calzado', 'SafeStep', '43', 'Marrón', 'Hombre', 'Cuero', 180, 5, 'Disponible'),
('Zapatos Formales Hombre', 'CALZ-004', 12, 70.00, 120.00, 'zapatos', 'ClassicWear', '41', 'Negro', 'Hombre', 'Cuero', 60, 6, 'Disponible');

-- ============================================
-- LIMPIEZA - Categorías: limpieza, productos de limpieza
-- ============================================
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, volumen_peso_neto, fecha_vencimiento, stock_bajo, estado)
VALUES 
('Detergente Líquido Ariel', 'LIMP-001', 35, 12.50, 19.90, 'limpieza', 'Ariel', '1L', '2026-12-31', 15, 'Disponible'),
('Lejía Clorox', 'LIMP-002', 28, 3.50, 6.00, 'limpieza', 'Clorox', '1L', '2026-06-30', 12, 'Disponible'),
('Limpiavidrios Ayudín', 'LIMP-003', 20, 4.80, 8.50, 'limpieza', 'Ayudín', '500ml', '2026-09-15', 10, 'Disponible'),
('Desinfectante Pino', 'LIMP-004', 25, 5.50, 9.80, 'productos de limpieza', 'Sapolio', '900ml', '2026-08-20', 12, 'Disponible');

-- ============================================
-- TECNOLOGÍA - Categorías: tecnologia, electronica, gadgets
-- ============================================
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, garantia_dias, detalles_clave, stock_bajo, estado)
VALUES 
('Audífonos Bluetooth Sony', 'TECH-001', 12, 120.00, 199.00, 'tecnologia', 'Sony', 365, 'Cancelación de ruido, batería 30h, Bluetooth 5.0', 6, 'Disponible'),
('Mouse Inalámbrico Logitech', 'TECH-002', 20, 35.00, 59.00, 'electronica', 'Logitech', 730, 'DPI ajustable, ergonómico, batería recargable', 10, 'Disponible'),
('Cargador Rápido USB-C', 'TECH-003', 25, 25.00, 42.00, 'gadgets', 'Anker', 180, '30W, cable incluido 1.5m, compatible con Quick Charge', 12, 'Disponible'),
('Teclado Mecánico RGB', 'TECH-004', 8, 150.00, 249.00, 'tecnologia', 'Redragon', 365, 'Switch azul, retroiluminación RGB, anti-ghosting', 4, 'Disponible');

-- ============================================
-- HOGAR - Categorías: hogar, decoracion, muebles
-- ============================================
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, material, alto_cm, ancho_cm, profundo_cm, stock_bajo, estado)
VALUES 
('Florero Decorativo Cerámica', 'HOGA-001', 8, 28.00, 48.00, 'hogar', 'Cerámica', 30, 15, 15, 4, 'Disponible'),
('Cojín Decorativo', 'HOGA-002', 15, 18.00, 32.00, 'decoracion', 'Algodón/Poliéster', 40, 40, 10, 8, 'Disponible'),
('Organizador de Escritorio', 'HOGA-003', 12, 22.00, 38.00, 'hogar', 'Madera/MDF', 25, 30, 15, 6, 'Disponible'),
('Mesa Auxiliar Moderna', 'HOGA-004', 6, 80.00, 135.00, 'muebles', 'Madera/Metal', 50, 40, 40, 3, 'Disponible');

-- ============================================
-- HERRAMIENTAS - Categorías: herramientas, ferreteria
-- ============================================
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, material, garantia_dias, especificacion_electrica, stock_bajo, estado)
VALUES 
('Taladro Inalámbrico Bosch', 'HERR-001', 6, 280.00, 450.00, 'herramientas', 'Bosch', 'Metal/Plástico ABS', 365, '18V 2.0Ah Li-Ion', 3, 'Disponible'),
('Juego de Destornilladores', 'HERR-002', 18, 35.00, 58.00, 'ferreteria', 'Stanley', 'Acero CR-V', 180, NULL, 8, 'Disponible'),
('Llave Inglesa Ajustable', 'HERR-003', 14, 28.00, 47.00, 'herramientas', 'Truper', 'Acero forjado', 90, NULL, 7, 'Disponible'),
('Sierra Eléctrica Circular', 'HERR-004', 5, 220.00, 380.00, 'herramientas', 'Black & Decker', 'Metal/Plástico', 365, '1400W 220V', 2, 'Disponible');

-- ============================================
-- MASCOTAS - Categorías: mascotas, animales, petshop
-- ============================================
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, volumen_peso_neto, fecha_vencimiento, tipo_mascota, color, stock_bajo, estado)
VALUES 
('Alimento Dog Chow Adulto', 'MASC-001', 22, 45.00, 75.00, 'mascotas', 'Dog Chow', '3kg', '2025-10-30', 'Perro', NULL, 10, 'Disponible'),
('Arena para Gatos', 'MASC-002', 18, 15.00, 25.00, 'petshop', 'Cat''s Best', '5kg', '2026-12-31', 'Gato', NULL, 8, 'Disponible'),
('Collar Ajustable para Perro', 'MASC-003', 12, 12.00, 22.00, 'animales', 'PetCare', NULL, NULL, 'Perro', 'Rojo', 6, 'Disponible'),
('Shampoo para Perros', 'MASC-004', 15, 18.00, 32.00, 'mascotas', 'PetClean', '500ml', '2026-03-31', 'Perro', NULL, 8, 'Disponible');

-- ============================================
-- BELLEZA - Categorías: belleza, cosmeticos, maquillaje
-- ============================================
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, volumen_peso_neto, fecha_vencimiento, tono_aroma, tipo_piel_cabello, color, stock_bajo, estado)
VALUES 
('Labial Mate L''Oréal', 'BELL-001', 25, 18.00, 32.00, 'belleza', 'L''Oréal', '3.7g', '2026-06-30', 'Rojo Intenso', NULL, 'Rojo #305', 12, 'Disponible'),
('Crema Facial Hidratante', 'BELL-002', 20, 35.00, 58.00, 'cosmeticos', 'Nivea', '50ml', '2025-11-15', 'Neutro', 'Piel mixta', NULL, 10, 'Disponible'),
('Máscara de Pestañas', 'BELL-003', 18, 22.00, 38.00, 'maquillaje', 'Maybelline', '9ml', '2025-12-20', 'Negro Profundo', NULL, 'Negro', 9, 'Disponible'),
('Base de Maquillaje', 'BELL-004', 16, 42.00, 72.00, 'maquillaje', 'MAC', '30ml', '2026-02-28', 'Beige Medio', 'Piel mixta', 'NC30', 8, 'Disponible');

-- ============================================
-- ASEO PERSONAL - Categorías: aseo, higiene, cuidado personal
-- ============================================
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, volumen_peso_neto, fecha_vencimiento, tono_aroma, tipo_piel_cabello, stock_bajo, estado)
VALUES 
('Shampoo Pantene Pro-V', 'ASEO-001', 30, 12.00, 20.00, 'aseo', 'Pantene', '400ml', '2026-03-31', 'Frutal', 'Cabello seco', 15, 'Disponible'),
('Jabón Líquido Dove', 'ASEO-002', 28, 8.50, 14.50, 'higiene', 'Dove', '250ml', '2026-07-15', 'Leche de Coco', 'Piel seca', 14, 'Disponible'),
('Desodorante Rexona', 'ASEO-003', 35, 6.00, 10.50, 'cuidado personal', 'Rexona', '150ml', '2026-09-30', 'Frescura Marina', NULL, 16, 'Disponible'),
('Pasta Dental Colgate', 'ASEO-004', 40, 4.50, 8.00, 'higiene', 'Colgate', '100ml', '2026-12-31', 'Menta', NULL, 18, 'Disponible');

-- ============================================
-- LIBRERÍA - Categorías: libreria, papeleria, libros
-- ============================================
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, autor, editorial, isbn_ean, formato_libro, numero_paginas, stock_bajo, estado)
VALUES 
('Cien Años de Soledad', 'LIBR-001', 8, 35.00, 55.00, 'libros', 'Gabriel García Márquez', 'Sudamericana', '9780307474728', 'Tapa Blanda', 496, 4, 'Disponible'),
('Cuaderno Universitario A4', 'LIBR-002', 45, 4.50, 8.00, 'papeleria', NULL, 'Stanford', NULL, 'Espiral', 100, 20, 'Disponible'),
('Lapiceros Azules Pack x12', 'LIBR-003', 60, 5.00, 9.50, 'libreria', NULL, 'Faber Castell', NULL, NULL, NULL, 25, 'Disponible'),
('El Principito', 'LIBR-004', 12, 18.00, 32.00, 'libros', 'Antoine de Saint-Exupéry', 'Salamandra', '9788498381498', 'Tapa Dura', 96, 6, 'Disponible');

-- ============================================
-- LICORES - Categorías: licores, bebidas alcoholicas, vinos
-- ============================================
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, volumen_peso_neto, fecha_vencimiento, stock_bajo, estado)
VALUES 
('Cerveza Pilsen Callao', 'LIC-001', 48, 2.80, 4.50, 'licores', 'Pilsen', '650ml', '2025-12-31', 20, 'Disponible'),
('Vino Tinto Tacama', 'LIC-002', 15, 28.00, 45.00, 'vinos', 'Tacama', '750ml', '2027-06-30', 8, 'Disponible'),
('Pisco Quebranta', 'LIC-003', 12, 35.00, 58.00, 'bebidas alcoholicas', 'Tres Generaciones', '750ml', '2030-12-31', 6, 'Disponible'),
('Ron Cartavio', 'LIC-004', 10, 42.00, 68.00, 'licores', 'Cartavio', '750ml', '2028-12-31', 5, 'Disponible');

-- Verificar inserción por clasificación
SELECT 
  CASE 
    WHEN categoria IN ('lacteos', 'cereales', 'enlatados', 'bebidas', 'snacks', 'condimentos') THEN 'ABARROTES'
    WHEN categoria IN ('ropa', 'vestuario', 'prendas') THEN 'ROPA'
    WHEN categoria IN ('calzado', 'zapatos') THEN 'CALZADO'
    WHEN categoria IN ('limpieza', 'productos de limpieza') THEN 'LIMPIEZA'
    WHEN categoria IN ('tecnologia', 'electronica', 'gadgets') THEN 'TECNOLOGÍA'
    WHEN categoria IN ('hogar', 'decoracion', 'muebles') THEN 'HOGAR'
    WHEN categoria IN ('herramientas', 'ferreteria') THEN 'HERRAMIENTAS'
    WHEN categoria IN ('mascotas', 'animales', 'petshop') THEN 'MASCOTAS'
    WHEN categoria IN ('belleza', 'cosmeticos', 'maquillaje') THEN 'BELLEZA'
    WHEN categoria IN ('aseo', 'higiene', 'cuidado personal') THEN 'ASEO PERSONAL'
    WHEN categoria IN ('libreria', 'papeleria', 'libros') THEN 'LIBRERÍA'
    WHEN categoria IN ('licores', 'bebidas alcoholicas', 'vinos') THEN 'LICORES'
  END as clasificacion,
  categoria,
  COUNT(*) as total_productos,
  SUM(stock) as stock_total
FROM productos
WHERE codigo LIKE '%-00%'
GROUP BY clasificacion, categoria
ORDER BY clasificacion, categoria;

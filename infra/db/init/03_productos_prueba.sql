-- Productos de prueba por clasificación para validar el sistema

-- ROPA
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, talla, color, genero, tipo_tela, stock_bajo, imagen_url)
VALUES 
('Polo Básico Cuello Redondo', 'ROPA-001', 25, 15.00, 25.00, 'ropa', 'TopStyle', 'M', 'Azul', 'Unisex', 'Algodón', 10, 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'),
('Pantalón Jean Clásico', 'ROPA-002', 18, 45.00, 75.00, 'ropa', 'Denim Co', '32', 'Negro', 'Hombre', 'Jean', 8, 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'),
('Blusa Floral Manga Corta', 'ROPA-003', 12, 25.00, 42.00, 'ropa', 'FemStyle', 'S', 'Rosa', 'Mujer', 'Poliéster', 6, 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400');

-- CALZADO
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, talla, color, genero, tipo_tela, garantia_dias, stock_bajo)
VALUES 
('Zapatillas Deportivas Running', 'CALZ-001', 15, 80.00, 135.00, 'calzado', 'RunFast', '42', 'Negro/Blanco', 'Unisex', 'Sintético', 90, 8),
('Sandalias Verano Mujer', 'CALZ-002', 22, 30.00, 50.00, 'calzado', 'BeachWalk', '38', 'Beige', 'Mujer', 'Cuero', 30, 10),
('Botas de Seguridad', 'CALZ-003', 10, 95.00, 160.00, 'calzado', 'SafeStep', '43', 'Marrón', 'Hombre', 'Cuero', 180, 5);

-- LIMPIEZA
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, volumen_peso_neto, fecha_vencimiento, stock_bajo)
VALUES 
('Detergente Líquido Ariel', 'LIMP-001', 35, 12.50, 19.90, 'limpieza', 'Ariel', '1L', '2026-12-31', 15),
('Lejía Clorox', 'LIMP-002', 28, 3.50, 6.00, 'limpieza', 'Clorox', '1L', '2026-06-30', 12),
('Limpiavidrios Ayudín', 'LIMP-003', 20, 4.80, 8.50, 'limpieza', 'Ayudín', '500ml', '2026-09-15', 10);

-- ABARROTES
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, volumen_peso_neto, fecha_vencimiento, stock_bajo)
VALUES 
('Aceite Vegetal Primor', 'ABAR-001', 40, 8.50, 14.50, 'abarrotes', 'Primor', '1L', '2025-12-31', 18),
('Arroz Superior', 'ABAR-002', 50, 2.80, 4.50, 'abarrotes', 'Paisana', '1kg', '2026-03-30', 20),
('Leche Evaporada Gloria', 'ABAR-003', 45, 3.20, 5.50, 'abarrotes', 'Gloria', '400g', '2025-08-20', 20),
('Atún en Aceite Florida', 'ABAR-004', 60, 4.50, 7.80, 'abarrotes', 'Florida', '170g', '2026-11-15', 25);

-- TECNOLOGÍA
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, garantia_dias, detalles_clave, stock_bajo)
VALUES 
('Audífonos Bluetooth Sony', 'TECH-001', 12, 120.00, 199.00, 'tecnologia', 'Sony', 365, 'Cancelación de ruido, batería 30h, Bluetooth 5.0', 6),
('Mouse Inalámbrico Logitech', 'TECH-002', 20, 35.00, 59.00, 'tecnologia', 'Logitech', 730, 'DPI ajustable, ergonómico, batería recargable', 10),
('Cargador Rápido USB-C', 'TECH-003', 25, 25.00, 42.00, 'tecnologia', 'Anker', 180, '30W, cable incluido 1.5m, compatible con Quick Charge', 12);

-- HOGAR
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, material, alto_cm, ancho_cm, profundo_cm, stock_bajo)
VALUES 
('Florero Decorativo Cerámica', 'HOGA-001', 8, 28.00, 48.00, 'hogar', 'Cerámica', 30, 15, 15, 4),
('Cojín Decorativo', 'HOGA-002', 15, 18.00, 32.00, 'hogar', 'Algodón/Poliéster', 40, 40, 10, 8),
('Organizador de Escritorio', 'HOGA-003', 12, 22.00, 38.00, 'hogar', 'Madera/MDF', 25, 30, 15, 6);

-- HERRAMIENTAS
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, material, garantia_dias, especificacion_electrica, stock_bajo)
VALUES 
('Taladro Inalámbrico Bosch', 'HERR-001', 6, 280.00, 450.00, 'herramientas', 'Bosch', 'Metal/Plástico ABS', 365, '18V 2.0Ah Li-Ion', 3),
('Juego de Destornilladores', 'HERR-002', 18, 35.00, 58.00, 'herramientas', 'Stanley', 'Acero CR-V', 180, NULL, 8),
('Llave Inglesa Ajustable', 'HERR-003', 14, 28.00, 47.00, 'herramientas', 'Truper', 'Acero forjado', 90, NULL, 7);

-- MASCOTAS
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, volumen_peso_neto, fecha_vencimiento, tipo_mascota, color, stock_bajo)
VALUES 
('Alimento Dog Chow Adulto', 'MASC-001', 22, 45.00, 75.00, 'mascotas', 'Dog Chow', '3kg', '2025-10-30', 'Perro', NULL, 10),
('Arena para Gatos', 'MASC-002', 18, 15.00, 25.00, 'mascotas', 'Cat''s Best', '5kg', '2026-12-31', 'Gato', NULL, 8),
('Collar Ajustable para Perro', 'MASC-003', 12, 12.00, 22.00, 'mascotas', 'PetCare', NULL, NULL, 'Perro', 'Rojo', 6);

-- BELLEZA
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, volumen_peso_neto, fecha_vencimiento, tono_aroma, tipo_piel_cabello, color, stock_bajo)
VALUES 
('Labial Mate L''Oréal', 'BELL-001', 25, 18.00, 32.00, 'belleza', 'L''Oréal', '3.7g', '2026-06-30', 'Rojo Intenso', NULL, 'Rojo #305', 12),
('Crema Facial Hidratante', 'BELL-002', 20, 35.00, 58.00, 'belleza', 'Nivea', '50ml', '2025-11-15', 'Neutro', 'Piel mixta', NULL, 10),
('Máscara de Pestañas', 'BELL-003', 18, 22.00, 38.00, 'belleza', 'Maybelline', '9ml', '2025-12-20', 'Negro Profundo', NULL, 'Negro', 9);

-- ASEO PERSONAL
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, volumen_peso_neto, fecha_vencimiento, tono_aroma, tipo_piel_cabello, stock_bajo)
VALUES 
('Shampoo Pantene Pro-V', 'ASEO-001', 30, 12.00, 20.00, 'aseo', 'Pantene', '400ml', '2026-03-31', 'Frutal', 'Cabello seco', 15),
('Jabón Líquido Dove', 'ASEO-002', 28, 8.50, 14.50, 'aseo', 'Dove', '250ml', '2026-07-15', 'Leche de Coco', 'Piel seca', 14),
('Desodorante Rexona', 'ASEO-003', 35, 6.00, 10.50, 'aseo', 'Rexona', '150ml', '2026-09-30', 'Frescura Marina', NULL, 16);

-- LIBRERÍA
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, autor, editorial, isbn_ean, formato_libro, numero_paginas, stock_bajo)
VALUES 
('Cien Años de Soledad', 'LIBR-001', 8, 35.00, 55.00, 'libreria', 'Gabriel García Márquez', 'Sudamericana', '9780307474728', 'Tapa Blanda', 496, 4),
('Cuaderno Universitario A4', 'LIBR-002', 45, 4.50, 8.00, 'libreria', NULL, 'Stanford', NULL, 'Espiral', 100, 20),
('Lapiceros Azules Pack x12', 'LIBR-003', 60, 5.00, 9.50, 'libreria', NULL, 'Faber Castell', NULL, NULL, NULL, 25);

-- LICORES
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, volumen_peso_neto, fecha_vencimiento, stock_bajo)
VALUES 
('Cerveza Pilsen Callao', 'LIC-001', 48, 2.80, 4.50, 'licores', 'Pilsen', '650ml', '2025-12-31', 20),
('Vino Tinto Tacama', 'LIC-002', 15, 28.00, 45.00, 'licores', 'Tacama', '750ml', '2027-06-30', 8),
('Pisco Quebranta', 'LIC-003', 12, 35.00, 58.00, 'licores', 'Tres Generaciones', '750ml', '2030-12-31', 6);

-- Mensaje de confirmación
SELECT 
  categoria,
  COUNT(*) as total_productos,
  SUM(stock) as stock_total
FROM productos
WHERE codigo LIKE '%-00%'
GROUP BY categoria
ORDER BY categoria;

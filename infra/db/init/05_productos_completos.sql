-- Eliminar productos anteriores para reemplazarlos con datos completos
DELETE FROM productos;

-- ========================================
-- ABARROTES - Con imágenes reales y campos completos
-- ========================================

-- LÁCTEOS
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, volumen_peso_neto, fecha_vencimiento, stock_bajo, estado, imagen_url)
VALUES 
('Leche Evaporada Gloria Entera', 'ABAR-LAC-001', 85, 3.20, 5.50, 'lacteos', 'Gloria', '400g', '2025-08-20', 20, 'Disponible', 'https://images.unsplash.com/photo-1563636619-e9143da7973b?w=400'),
('Yogurt Griego Natural Laive', 'ABAR-LAC-002', 65, 4.50, 7.50, 'lacteos', 'Laive', '1L', '2025-06-15', 15, 'Disponible', 'https://images.unsplash.com/photo-1488477181946-6428a0291777?w=400'),
('Queso Fresco Bonlé Premium', 'ABAR-LAC-003', 45, 9.00, 15.50, 'lacteos', 'Bonlé', '500g', '2025-06-10', 12, 'Disponible', 'https://images.unsplash.com/photo-1452195100486-9cc805987862?w=400'),
('Mantequilla con Sal Gloria', 'ABAR-LAC-004', 50, 6.50, 10.00, 'lacteos', 'Gloria', '200g', '2025-07-30', 15, 'Disponible', 'https://images.unsplash.com/photo-1589985270826-4b7bb135bc9d?w=400');

-- CEREALES
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, volumen_peso_neto, fecha_vencimiento, stock_bajo, estado, imagen_url)
VALUES 
('Arroz Extra Paisana Premium', 'ABAR-CER-001', 120, 3.80, 6.50, 'cereales', 'Paisana', '1kg', '2026-03-30', 20, 'Disponible', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'),
('Avena Integral Tres Ositos', 'ABAR-CER-002', 75, 4.20, 7.00, 'cereales', 'Tres Ositos', '500g', '2026-01-15', 18, 'Disponible', 'https://images.unsplash.com/photo-1517673132405-a56a62b18caf?w=400'),
('Quinua Roja Orgánica', 'ABAR-CER-003', 55, 9.50, 16.00, 'cereales', 'NutriAndino', '500g', '2026-06-20', 12, 'Disponible', 'https://images.unsplash.com/photo-1586201375761-83865001e31c?w=400'),
('Fideos Spaghetti Don Vittorio', 'ABAR-CER-004', 95, 2.50, 4.50, 'cereales', 'Don Vittorio', '500g', '2026-04-10', 25, 'Disponible', 'https://images.unsplash.com/photo-1621996346565-e3dbc646d9a9?w=400');

-- BEBIDAS
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, volumen_peso_neto, fecha_vencimiento, stock_bajo, estado, imagen_url)
VALUES 
('Gaseosa Coca Cola Original', 'ABAR-BEB-001', 140, 3.00, 5.50, 'bebidas', 'Coca Cola', '1.5L', '2025-09-30', 25, 'Disponible', 'https://images.unsplash.com/photo-1554866585-cd94860890b7?w=400'),
('Jugo de Naranja Pulp 100%', 'ABAR-BEB-002', 80, 3.50, 6.20, 'bebidas', 'Pulp', '1L', '2025-07-15', 20, 'Disponible', 'https://images.unsplash.com/photo-1600271886742-f049cd451bba?w=400'),
('Agua Mineral San Luis sin Gas', 'ABAR-BEB-003', 180, 1.20, 2.50, 'bebidas', 'San Luis', '625ml', '2026-12-31', 30, 'Disponible', 'https://images.unsplash.com/photo-1548839140-29a749e1cf4d?w=400');

-- SNACKS
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, volumen_peso_neto, fecha_vencimiento, stock_bajo, estado, imagen_url)
VALUES 
('Papas Fritas Lays Clásicas', 'ABAR-SNK-001', 90, 2.00, 3.80, 'snacks', 'Lays', '150g', '2025-08-10', 18, 'Disponible', 'https://images.unsplash.com/photo-1566478989037-eec170784d0b?w=400'),
('Galletas de Soda Field Original', 'ABAR-SNK-002', 70, 2.20, 4.00, 'snacks', 'Field', '200g', '2025-09-05', 16, 'Disponible', 'https://images.unsplash.com/photo-1558961363-fa8fdf82db35?w=400'),
('Chocolate Sublime Clásico', 'ABAR-SNK-003', 110, 1.50, 2.80, 'snacks', 'Sublime', '30g', '2025-11-30', 20, 'Disponible', 'https://images.unsplash.com/photo-1511381939415-e44015466834?w=400');

-- CONSERVAS
INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, volumen_peso_neto, fecha_vencimiento, stock_bajo, estado, imagen_url)
VALUES 
('Atún en Aceite Florida Premium', 'ABAR-CON-001', 120, 5.50, 9.80, 'conservas', 'Florida', '170g', '2026-11-15', 25, 'Disponible', 'https://images.unsplash.com/photo-1520072959219-c595dc870360?w=400'),
('Aceite Vegetal Primor 100%', 'ABAR-CON-002', 75, 9.50, 16.50, 'conservas', 'Primor', '1L', '2025-12-31', 18, 'Disponible', 'https://images.unsplash.com/photo-1474979266404-7eaacbcd87c5?w=400');

-- ========================================
-- ROPA - Con todos los campos específicos
-- ========================================

INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, talla, color, genero, tipo_tela, stock_bajo, estado, imagen_url)
VALUES 
('Polo Básico Algodón Pima', 'ROPA-VES-001', 45, 18.00, 32.00, 'vestuario', 'TopStyle', 'M', 'Azul marino', 'Unisex', 'Algodón Pima', 10, 'Disponible', 'https://images.unsplash.com/photo-1521572163474-6864f9cf17ab?w=400'),
('Camisa Formal Oxford', 'ROPA-VES-002', 35, 38.00, 65.00, 'vestuario', 'Office Pro', 'L', 'Blanco', 'Hombre', 'Algodón Oxford', 8, 'Disponible', 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=400'),
('Vestido Casual Floral Verano', 'ROPA-VES-003', 28, 45.00, 78.00, 'vestuario', 'FemStyle', 'M', 'Floral multicolor', 'Mujer', 'Lino', 7, 'Disponible', 'https://images.unsplash.com/photo-1595777457583-95e059d581b8?w=400'),
('Pantalón Jean Slim Fit', 'ROPA-PRE-001', 38, 48.00, 82.00, 'prendas', 'Denim Co', '32', 'Negro', 'Hombre', 'Denim elastizado', 8, 'Disponible', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=400'),
('Blusa Manga Corta Elegante', 'ROPA-PRE-002', 32, 28.00, 48.00, 'prendas', 'FemStyle', 'S', 'Rosa pastel', 'Mujer', 'Poliéster satinado', 6, 'Disponible', 'https://images.unsplash.com/photo-1485968579580-b6d095142e6e?w=400'),
('Shorts Deportivos Dry-Fit', 'ROPA-PRE-003', 42, 22.00, 38.00, 'prendas', 'SportWear', 'M', 'Negro', 'Unisex', 'Poliéster técnico', 10, 'Disponible', 'https://images.unsplash.com/photo-1591195853828-11db59a44f6b?w=400');

-- ========================================
-- CALZADO - Con campos específicos
-- ========================================

INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, talla, color, genero, tipo_tela, garantia_dias, stock_bajo, estado, imagen_url)
VALUES 
('Zapatillas Running Nike Air', 'CALZ-ZAP-001', 28, 95.00, 165.00, 'zapatos', 'Nike', '42', 'Negro/Blanco', 'Unisex', 'Mesh sintético', 90, 8, 'Disponible', 'https://images.unsplash.com/photo-1542291026-7eec264c27ff?w=400'),
('Sandalias Cuero Verano', 'CALZ-ZAP-002', 35, 35.00, 58.00, 'zapatos', 'BeachWalk', '38', 'Beige', 'Mujer', 'Cuero genuino', 30, 10, 'Disponible', 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=400'),
('Botas de Seguridad Industrial', 'CALZ-ZAP-003', 18, 110.00, 185.00, 'zapatos', 'SafeStep', '43', 'Marrón oscuro', 'Hombre', 'Cuero reforzado', 180, 5, 'Disponible', 'https://images.unsplash.com/photo-1520639888713-7851133b1ed0?w=400'),
('Zapatos Formales Oxford', 'CALZ-ZAP-004', 22, 75.00, 128.00, 'zapatos', 'ClassicMan', '41', 'Negro', 'Hombre', 'Cuero italiano', 60, 6, 'Disponible', 'https://images.unsplash.com/photo-1533867617858-e7b97e060509?w=400');

-- ========================================
-- TECNOLOGÍA - Con garantía y especificaciones
-- ========================================

INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, garantia_dias, detalles_clave, especificacion_electrica, stock_bajo, estado, imagen_url)
VALUES 
('Audífonos Bluetooth Sony WH-1000XM4', 'TECH-ELE-001', 22, 145.00, 249.00, 'electronica', 'Sony', 365, 'Cancelación de ruido activa, batería 30h, Bluetooth 5.0, plegables', NULL, 6, 'Disponible', 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=400'),
('Mouse Gamer Logitech G502', 'TECH-ELE-002', 35, 42.00, 72.00, 'electronica', 'Logitech', 730, '16000 DPI, RGB personalizable, 11 botones programables', NULL, 10, 'Disponible', 'https://images.unsplash.com/photo-1527814050087-3793815479db?w=400'),
('Teclado Mecánico RGB Redragon', 'TECH-ELE-003', 18, 95.00, 165.00, 'electronica', 'Redragon', 365, 'Switches Blue, iluminación RGB, anti-ghosting, español latinoamericano', NULL, 4, 'Disponible', 'https://images.unsplash.com/photo-1595225476474-87563907a212?w=400'),
('Cargador Rápido Anker 30W USB-C', 'TECH-ACC-001', 45, 28.00, 48.00, 'accesorios', 'Anker', 180, 'Power Delivery 3.0, cable 1.5m incluido, compatible iPhone/Android', '30W 220V', 12, 'Disponible', 'https://images.unsplash.com/photo-1583863788434-e58a36330cf0?w=400');

-- ========================================
-- LIBRERÍA - Con autor, editorial, ISBN
-- ========================================

INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, autor, editorial, isbn_ean, formato_libro, numero_paginas, stock_bajo, estado, imagen_url)
VALUES 
('Cien Años de Soledad', 'LIBR-001', 18, 38.00, 62.00, 'libros', 'Gabriel García Márquez', 'Sudamericana', '9780307474728', 'Tapa blanda', 496, 4, 'Disponible', 'https://images.unsplash.com/photo-1544947950-fa07a98d237f?w=400'),
('El Principito', 'LIBR-002', 25, 22.00, 38.00, 'libros', 'Antoine de Saint-Exupéry', 'Salamandra', '9788498381498', 'Tapa dura', 96, 6, 'Disponible', 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=400'),
('1984 - George Orwell', 'LIBR-003', 15, 28.00, 48.00, 'libros', 'George Orwell', 'Debolsillo', '9788497939973', 'Tapa blanda', 352, 5, 'Disponible', 'https://images.unsplash.com/photo-1541963463532-d68292c34b19?w=400'),
('Cuaderno Universitario A4 Rayado', 'LIBR-004', 85, 5.50, 9.50, 'papeleria', NULL, 'Stanford', NULL, 'Espiral', 100, 20, 'Disponible', 'https://images.unsplash.com/photo-1517842645767-c639042777db?w=400'),
('Set Lapiceros Faber-Castell x12', 'LIBR-005', 95, 6.00, 11.00, 'libreria', NULL, 'Faber-Castell', NULL, NULL, NULL, 25, 'Disponible', 'https://images.unsplash.com/photo-1586075010923-2dd4570fb338?w=400');

-- ========================================
-- LIMPIEZA - Productos de limpieza
-- ========================================

INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, volumen_peso_neto, fecha_vencimiento, stock_bajo, estado, imagen_url)
VALUES 
('Detergente Líquido Ariel Poder Limpiador', 'LIMP-001', 65, 14.50, 24.90, 'limpieza', 'Ariel', '1L', '2026-12-31', 15, 'Disponible', 'https://images.unsplash.com/photo-1563453392212-326f5e854473?w=400'),
('Lejía Clorox Original', 'LIMP-002', 55, 4.50, 7.50, 'limpieza', 'Clorox', '1L', '2026-06-30', 12, 'Disponible', 'https://images.unsplash.com/photo-1585421514738-01798e348b17?w=400'),
('Limpiavidrios Ayudín Cristal', 'LIMP-003', 40, 5.80, 9.80, 'limpieza', 'Ayudín', '500ml', '2026-09-15', 10, 'Disponible', 'https://images.unsplash.com/photo-1558317374-067fb5f30001?w=400');

-- ========================================
-- HOGAR - Con dimensiones
-- ========================================

INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, material, alto_cm, ancho_cm, profundo_cm, stock_bajo, estado, imagen_url)
VALUES 
('Florero Decorativo Cerámica Moderna', 'HOGA-001', 15, 32.00, 55.00, 'hogar', 'Cerámica esmaltada', 30, 15, 15, 4, 'Disponible', 'https://images.unsplash.com/photo-1485955900006-10f4d324d411?w=400'),
('Cojín Decorativo Terciopelo', 'HOGA-002', 28, 22.00, 38.00, 'decoracion', 'Terciopelo/Algodón', 40, 40, 10, 8, 'Disponible', 'https://images.unsplash.com/photo-1584100936595-c0654b55a2e2?w=400'),
('Organizador Escritorio Bambú', 'HOGA-003', 22, 28.00, 48.00, 'hogar', 'Bambú natural', 25, 30, 15, 6, 'Disponible', 'https://images.unsplash.com/photo-1611269154421-4e27233ac5c7?w=400');

-- ========================================
-- HERRAMIENTAS - Con especificaciones eléctricas
-- ========================================

INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, material, garantia_dias, especificacion_electrica, stock_bajo, estado, imagen_url)
VALUES 
('Taladro Inalámbrico Bosch Professional', 'HERR-001', 12, 320.00, 520.00, 'herramientas', 'Bosch', 'Metal/ABS reforzado', 365, '18V 2.0Ah Li-Ion', 3, 'Disponible', 'https://images.unsplash.com/photo-1504148455328-c376907d081c?w=400'),
('Set Destornilladores Stanley 10 pzs', 'HERR-002', 32, 42.00, 68.00, 'ferreteria', 'Stanley', 'Acero CR-V', 180, NULL, 8, 'Disponible', 'https://images.unsplash.com/photo-1530124566582-a618bc2615dc?w=400'),
('Llave Inglesa Ajustable 12"', 'HERR-003', 25, 32.00, 54.00, 'herramientas', 'Truper', 'Acero forjado cromado', 90, NULL, 7, 'Disponible', 'https://images.unsplash.com/photo-1581092160562-40aa08e78837?w=400');

-- ========================================
-- MASCOTAS - Con tipo de mascota
-- ========================================

INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, volumen_peso_neto, fecha_vencimiento, tipo_mascota, color, stock_bajo, estado, imagen_url)
VALUES 
('Alimento Dog Chow Adulto Razas Medianas', 'MASC-001', 38, 52.00, 88.00, 'mascotas', 'Dog Chow', '3kg', '2025-10-30', 'Perro', NULL, 10, 'Disponible', 'https://images.unsplash.com/photo-1583511655857-d19b40a7a54e?w=400'),
('Arena Sanitaria para Gatos Aglomerante', 'MASC-002', 32, 18.00, 32.00, 'petshop', 'Cat''s Best', '5kg', '2026-12-31', 'Gato', NULL, 8, 'Disponible', 'https://images.unsplash.com/photo-1589883661923-6476cb0ae9f2?w=400'),
('Collar Ajustable Reflectivo', 'MASC-003', 25, 15.00, 28.00, 'animales', 'PetCare', NULL, NULL, 'Perro', 'Rojo', 6, 'Disponible', 'https://images.unsplash.com/photo-1548199973-03cce0bbc87b?w=400');

-- ========================================
-- BELLEZA - Con tono/aroma y tipo de piel
-- ========================================

INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, volumen_peso_neto, fecha_vencimiento, tono_aroma, tipo_piel_cabello, color, stock_bajo, estado, imagen_url)
VALUES 
('Labial Mate L''Oréal Color Riche', 'BELL-001', 42, 22.00, 38.00, 'belleza', 'L''Oréal', '3.7g', '2026-06-30', 'Rojo intenso', NULL, 'Rojo #305', 12, 'Disponible', 'https://images.unsplash.com/photo-1586495777744-4413f21062fa?w=400'),
('Crema Facial Hidratante Nivea', 'BELL-002', 35, 42.00, 68.00, 'cosmeticos', 'Nivea', '50ml', '2025-11-15', 'Sin fragancia', 'Piel mixta', NULL, 10, 'Disponible', 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=400'),
('Máscara de Pestañas Maybelline', 'BELL-003', 38, 28.00, 48.00, 'maquillaje', 'Maybelline', '9ml', '2025-12-20', 'Negro profundo', NULL, 'Negro', 9, 'Disponible', 'https://images.unsplash.com/photo-1631214524020-7e18db9a8f92?w=400');

-- ========================================
-- ASEO PERSONAL - Con tipo de piel/cabello
-- ========================================

INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, volumen_peso_neto, fecha_vencimiento, tono_aroma, tipo_piel_cabello, stock_bajo, estado, imagen_url)
VALUES 
('Shampoo Pantene Pro-V Restauración', 'ASEO-001', 55, 15.00, 26.00, 'aseo_personal', 'Pantene', '400ml', '2026-03-31', 'Frutas tropicales', 'Cabello seco/dañado', 15, 'Disponible', 'https://images.unsplash.com/photo-1631729371254-42c2892f0e6e?w=400'),
('Jabón Líquido Dove Nutrición Intensa', 'ASEO-002', 48, 10.50, 18.50, 'higiene', 'Dove', '250ml', '2026-07-15', 'Leche de coco', 'Piel seca', 14, 'Disponible', 'https://images.unsplash.com/photo-1600857544200-b9cd8ce7f015?w=400'),
('Desodorante Rexona Clinical', 'ASEO-003', 62, 8.00, 14.50, 'cuidado personal', 'Rexona', '150ml', '2026-09-30', 'Frescura marina', NULL, 16, 'Disponible', 'https://images.unsplash.com/photo-1625225233840-695456021cde?w=400');

-- ========================================
-- LICORES - Productos alcoholicos
-- ========================================

INSERT INTO productos (nombre, codigo, stock, precio_costo, precio_venta, categoria, marca, volumen_peso_neto, fecha_vencimiento, stock_bajo, estado, imagen_url)
VALUES 
('Cerveza Pilsen Callao Lager', 'LIC-001', 95, 3.50, 6.00, 'licores', 'Pilsen', '650ml', '2025-12-31', 20, 'Disponible', 'https://images.unsplash.com/photo-1608270586620-248524c67de9?w=400'),
('Vino Tinto Tacama Gran Reserva', 'LIC-002', 28, 35.00, 58.00, 'vinos', 'Tacama', '750ml', '2027-06-30', 8, 'Disponible', 'https://images.unsplash.com/photo-1510812431401-41d2bd2722f3?w=400'),
('Pisco Quebranta Artesanal', 'LIC-003', 22, 42.00, 72.00, 'bebidas alcoholicas', 'Tres Generaciones', '750ml', '2030-12-31', 6, 'Disponible', 'https://images.unsplash.com/photo-1569529465841-dfecdab7503b?w=400');

-- Reporte final
SELECT 
  CASE 
    WHEN categoria IN ('lacteos', 'cereales', 'enlatados', 'bebidas', 'snacks', 'condimentos', 'conservas') THEN 'ABARROTES'
    WHEN categoria IN ('ropa', 'vestuario', 'prendas') THEN 'ROPA'
    WHEN categoria IN ('calzado', 'zapatos') THEN 'CALZADO'
    WHEN categoria IN ('limpieza', 'productos de limpieza') THEN 'LIMPIEZA'
    WHEN categoria IN ('tecnologia', 'electronica', 'gadgets', 'accesorios') THEN 'TECNOLOGÍA'
    WHEN categoria IN ('hogar', 'decoracion', 'muebles') THEN 'HOGAR'
    WHEN categoria IN ('herramientas', 'ferreteria') THEN 'HERRAMIENTAS'
    WHEN categoria IN ('mascotas', 'animales', 'petshop') THEN 'MASCOTAS'
    WHEN categoria IN ('belleza', 'cosmeticos', 'maquillaje') THEN 'BELLEZA'
    WHEN categoria IN ('aseo', 'higiene', 'cuidado personal', 'aseo_personal') THEN 'ASEO PERSONAL'
    WHEN categoria IN ('libreria', 'papeleria', 'libros') THEN 'LIBRERÍA'
    WHEN categoria IN ('licores', 'bebidas alcoholicas', 'vinos') THEN 'LICORES'
  END as clasificacion,
  categoria,
  COUNT(*) as total_productos,
  SUM(stock) as stock_total
FROM productos
GROUP BY clasificacion, categoria
ORDER BY clasificacion, categoria;

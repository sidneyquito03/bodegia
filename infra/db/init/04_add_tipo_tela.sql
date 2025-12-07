-- Migración: Agregar campo tipo_tela a la tabla productos
-- Este campo es específico para las clasificaciones Ropa y Calzado

-- Verificar si la columna ya existe antes de agregarla
DO $$ 
BEGIN
    IF NOT EXISTS (
        SELECT 1 
        FROM information_schema.columns 
        WHERE table_name = 'productos' 
        AND column_name = 'tipo_tela'
    ) THEN
        ALTER TABLE productos ADD COLUMN tipo_tela text;
        RAISE NOTICE 'Columna tipo_tela agregada exitosamente';
    ELSE
        RAISE NOTICE 'La columna tipo_tela ya existe';
    END IF;
END $$;

-- Comentario descriptivo
COMMENT ON COLUMN productos.tipo_tela IS 'Ropa/Calzado: Tipo de tela o material (Algodón, Poliéster, Jean, Cuero, etc.)';

-- Verificar la migración
SELECT 
    column_name, 
    data_type, 
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'productos' 
    AND column_name IN ('genero', 'tipo_tela', 'talla', 'color')
ORDER BY ordinal_position;

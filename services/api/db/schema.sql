
-- Extensión para UUID (si no existe)
CREATE EXTENSION IF NOT EXISTS pgcrypto;

-- Productos
CREATE TABLE IF NOT EXISTS productos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  codigo text UNIQUE NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  precio_costo numeric(12,2) NOT NULL DEFAULT 0,
  precio_venta numeric(12,2) NOT NULL DEFAULT 0,
  categoria text NOT NULL,
  estado text NOT NULL DEFAULT 'Disponible',
  fecha_vencimiento date,
  imagen_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS historial_precios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id uuid NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  precio_costo_anterior numeric(12,2) NOT NULL,
  precio_venta_anterior numeric(12,2) NOT NULL,
  precio_costo_nuevo numeric(12,2) NOT NULL,
  precio_venta_nuevo numeric(12,2) NOT NULL,
  motivo text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Clientes y fiados
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  celular text NOT NULL,
  dni text,
  direccion text,
  notas text,
  foto_url text,
  deuda_total numeric(12,2) NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS transacciones_fiados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo text NOT NULL, -- 'fiado' | 'pago'
  monto numeric(12,2) NOT NULL,
  descripcion text,
  metodo_pago text,
  referencia_transaccion text,
  comprobante_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Operadores
CREATE TABLE IF NOT EXISTS operadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  celular text NOT NULL,
  email text,
  dni text,
  direccion text,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Ventas
CREATE TABLE IF NOT EXISTS ventas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL,        -- 'efectivo' | 'fiado'
  cliente_id uuid REFERENCES clientes(id),
  subtotal numeric(12,2) NOT NULL,
  total numeric(12,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS venta_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id uuid NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id uuid NOT NULL REFERENCES productos(id),
  nombre text NOT NULL,
  cantidad integer NOT NULL,
  precio numeric(12,2) NOT NULL
);

CREATE INDEX IF NOT EXISTS idx_ventas_created_at ON ventas (created_at);

/* VERSIÓN MÁS COMPLETA DEL ESQUEMA DE BASE DE DATOS
-- Productos
CREATE TABLE IF NOT EXISTS productos (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  codigo text UNIQUE NOT NULL,
  stock integer NOT NULL DEFAULT 0,
  precio_costo numeric(12,2) NOT NULL DEFAULT 0,
  precio_venta numeric(12,2) NOT NULL DEFAULT 0,
  categoria text NOT NULL,
  estado text NOT NULL DEFAULT 'Disponible', -- Disponible | Stock Bajo | Stock Crítico | Agotado
  fecha_vencimiento date,
  imagen_url text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_productos_categoria ON productos (lower(categoria));

-- Historial de cambios de precio
CREATE TABLE IF NOT EXISTS historial_precios (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  producto_id uuid NOT NULL REFERENCES productos(id) ON DELETE CASCADE,
  precio_costo_anterior numeric(12,2) NOT NULL,
  precio_venta_anterior numeric(12,2) NOT NULL,
  precio_costo_nuevo numeric(12,2) NOT NULL,
  precio_venta_nuevo numeric(12,2) NOT NULL,
  motivo text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Clientes (para Fiados)
CREATE TABLE IF NOT EXISTS clientes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  celular text NOT NULL,
  dni text,
  direccion text,
  notas text,
  foto_url text,
  deuda_total numeric(12,2) NOT NULL DEFAULT 0,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Transacciones de fiados (fiado y pago)
CREATE TABLE IF NOT EXISTS transacciones_fiados (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  cliente_id uuid NOT NULL REFERENCES clientes(id) ON DELETE CASCADE,
  tipo text NOT NULL, -- 'fiado' | 'pago'
  monto numeric(12,2) NOT NULL,
  descripcion text,
  metodo_pago text, -- efectivo | yape | plin | transferencia | tarjeta
  referencia_transaccion text,
  comprobante_url text,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Operadores
CREATE TABLE IF NOT EXISTS operadores (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  nombre text NOT NULL,
  celular text NOT NULL,
  email text,
  dni text,
  direccion text,
  activo boolean NOT NULL DEFAULT true,
  created_at timestamptz NOT NULL DEFAULT now()
);

-- Ventas + items
CREATE TABLE IF NOT EXISTS ventas (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  tipo text NOT NULL,        -- 'efectivo' | 'fiado'
  cliente_id uuid REFERENCES clientes(id),
  subtotal numeric(12,2) NOT NULL,
  total numeric(12,2) NOT NULL,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS venta_items (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  venta_id uuid NOT NULL REFERENCES ventas(id) ON DELETE CASCADE,
  producto_id uuid NOT NULL REFERENCES productos(id),
  nombre text NOT NULL,
  cantidad integer NOT NULL,
  precio numeric(12,2) NOT NULL
);

-- Índices útiles
CREATE INDEX IF NOT EXISTS idx_ventas_created_at ON ventas (created_at);
CREATE INDEX IF NOT EXISTS idx_transacciones_cliente_fecha ON transacciones_fiados (cliente_id, created_at);
*/
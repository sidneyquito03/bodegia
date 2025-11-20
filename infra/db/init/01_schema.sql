create extension if not exists "pgcrypto";

create table if not exists proveedores(
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  ruc text,
  contacto text,
  telefono text,
  email text,
  direccion text,
  tiempo_entrega_dias int default 3,
  notas text,
  activo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists productos(
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  codigo text not null unique,
  stock int not null default 0,
  precio_costo numeric(12,2) not null default 0,
  precio_venta numeric(12,2) not null default 0,
  categoria text not null default 'general',
  estado text default 'Disponible',
  imagen_url text,
  proveedor_id uuid references proveedores(id),
  fecha_vencimiento date,
  marca text,
  medida_peso text,
  stock_bajo int default 20,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists clientes(
  id uuid default gen_random_uuid() primary key,
  nombre text not null,
  dni text,
  telefono text,
  direccion text,
  email text,
  deuda_total numeric(12,2) default 0,
  activo boolean default true,
  created_at timestamptz default now(),
  updated_at timestamptz default now()
);

create table if not exists ventas(
  id uuid default gen_random_uuid() primary key,
  fecha timestamptz default now(),
  total numeric(12,2) not null default 0,
  metodo_pago text not null default 'efectivo', 
  tipo text not null default 'Cobrado'          
);

create table if not exists ventas_detalle(
  id uuid default gen_random_uuid() primary key,
  venta_id uuid references ventas(id) on delete cascade,
  producto_id uuid references productos(id),
  cantidad int not null,
  precio_unitario numeric(12,2) not null
);

create table if not exists fiados_transacciones(
  id uuid default gen_random_uuid() primary key,
  cliente_id uuid references clientes(id),
  venta_id uuid references ventas(id),
  tipo text not null default 'fiado',
  monto numeric(12,2) not null,
  estado text not null default 'pendiente',
  metodo_pago text,
  referencia_transaccion text,
  created_at timestamptz default now()
);

create table if not exists historial_precios(
  id uuid default gen_random_uuid() primary key,
  producto_id uuid references productos(id),
  precio_costo_anterior numeric(12,2),
  precio_venta_anterior numeric(12,2),
  precio_costo_nuevo numeric(12,2),
  precio_venta_nuevo numeric(12,2),
  motivo text,
  created_at timestamptz default now()
);

create table if not exists compras_proveedores(
  id uuid default gen_random_uuid() primary key,
  proveedor_id uuid references proveedores(id),
  producto_id uuid references productos(id),
  cantidad int not null,
  precio_unitario numeric(12,2) not null,
  total numeric(12,2) not null,
  fecha_pedido date not null default current_date,
  fecha_entrega_estimada date,
  fecha_entrega_real date,
  estado text not null default 'Pendiente',
  notas text,
  created_at timestamptz default now()
);

-- Tabla de mermas/pérdidas (vencidos, defectuosos, robos, etc.)
create table if not exists mermas(
  id uuid default gen_random_uuid() primary key,
  producto_id uuid references productos(id),
  tipo_merma text not null default 'vencido',
  cantidad int not null,
  costo_unitario numeric(12,2) not null,
  costo_total numeric(12,2) not null,
  motivo text,
  fecha_registro timestamptz default now(),
  registrado_por text,
  created_at timestamptz default now()
);

-- Índices
create index if not exists idx_productos_codigo on productos(codigo);
create index if not exists idx_productos_categoria on productos(categoria);
create index if not exists idx_productos_vencimiento on productos(fecha_vencimiento);
create index if not exists idx_productos_estado on productos(estado);
create index if not exists idx_ventas_fecha on ventas(fecha);
create index if not exists idx_detalle_venta on ventas_detalle(venta_id);
create index if not exists idx_mermas_producto on mermas(producto_id);
create index if not exists idx_mermas_fecha on mermas(fecha_registro);

-- Función para calcular el estado automáticamente
-- Solo 3 estados: Disponible (verde), Stock Bajo (naranja/rojo según umbrales FIJOS), Vencido
-- Umbrales fijos: ≤7 unidades = ROJO (urgente), ≤15 unidades = NARANJA (advertencia)
create or replace function calcular_estado_producto(
  p_stock int,
  p_stock_bajo int,
  p_fecha_vencimiento date
) returns text as $$
declare
  dias_hasta_vencimiento int;
begin
  -- Si hay fecha de vencimiento, verificar primero
  if p_fecha_vencimiento is not null then
    dias_hasta_vencimiento := p_fecha_vencimiento - current_date;
    
    -- Ya vencido
    if dias_hasta_vencimiento <= 0 then
      return 'Vencido';
    end if;
  end if;
  
  -- Validación por stock con umbrales FIJOS (no por producto)
  -- Alerta ROJA: Stock ≤ 7 unidades (urgente)
  if p_stock <= 7 then
    return 'Stock Bajo'; -- Se marcará como rojo en frontend
  -- Alerta NARANJA: Stock ≤ 15 unidades (advertencia)
  elsif p_stock <= 15 then
    return 'Stock Bajo'; -- Se marcará como naranja en frontend
  else
    return 'Disponible';
  end if;
end;
$$ language plpgsql immutable;

-- Trigger para actualizar estado automáticamente
create or replace function actualizar_estado_producto()
returns trigger as $$
begin
  new.estado := calcular_estado_producto(
    new.stock,
    coalesce(new.stock_bajo, 10),
    new.fecha_vencimiento
  );
  return new;
end;
$$ language plpgsql;

drop trigger if exists trigger_actualizar_estado on productos;
create trigger trigger_actualizar_estado
  before insert or update of stock, stock_bajo, fecha_vencimiento
  on productos
  for each row
  execute function actualizar_estado_producto();

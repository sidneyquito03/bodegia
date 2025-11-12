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
  stock_critico int default 10,
  stock_bajo int default 20,
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

create index if not exists idx_productos_codigo on productos(codigo);
create index if not exists idx_productos_categoria on productos(categoria);
create index if not exists idx_ventas_fecha on ventas(fecha);
create index if not exists idx_detalle_venta on ventas_detalle(venta_id);

-- Añadir columna vendedor_id a ventas para asignar la venta al usuario que la registra
alter table ventas
  add column if not exists vendedor_id uuid references usuarios(id);

create index if not exists idx_ventas_vendedor on ventas(vendedor_id);

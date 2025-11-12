insert into proveedores (nombre, ruc)
values ('Distribuidora La Estrella','20123456789')
on conflict do nothing;

insert into productos (nombre,codigo,stock,precio_costo,precio_venta,categoria,proveedor_id,marca,medida_peso)
select 'Leche Gloria','LECH-001',50,3.50,5.00,'lacteos',p.id,'Gloria','400g'
from proveedores p where p.nombre='Distribuidora La Estrella'
on conflict do nothing;

insert into productos (nombre,codigo,stock,precio_costo,precio_venta,categoria,marca,medida_peso)
values ('Pan molde','PAN-001',30,4.00,6.00,'panaderia','Bimbo','600g')
on conflict do nothing;

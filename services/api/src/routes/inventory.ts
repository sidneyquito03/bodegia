import { Router } from "express";
import db from "../db/index";
import { z } from "zod";
export const inventoryRouter = Router();


export const inventoryImportRouter = Router();

// GET /inventory/products - Lista todos los productos con estado calculado
inventoryRouter.get("/products", async (_req, res) => {
  const rows = await db.manyOrNone(`
    SELECT 
      id, nombre, codigo, stock,
      precio_costo::numeric::text AS precio_costo,
      precio_venta::numeric::text AS precio_venta,
      categoria, 
      calcular_estado_producto(
        stock, 
        COALESCE(stock_critico, 10), 
        COALESCE(stock_bajo, 20), 
        fecha_vencimiento
      ) as estado,
      imagen_url, proveedor_id, fecha_vencimiento, marca, medida_peso,
      stock_critico, stock_bajo, created_at, updated_at
    FROM productos
    ORDER BY nombre
  `);

  const data = rows.map((r) => ({
    ...r,
    stock: Number(r.stock),
    precio_costo: Number(r.precio_costo),
    precio_venta: Number(r.precio_venta),
    stock_critico: r.stock_critico != null ? Number(r.stock_critico) : null,
    stock_bajo: r.stock_bajo != null ? Number(r.stock_bajo) : null,
  }));

  res.json(data);
});

// POST /inventory - Crear producto
const createSchema = z.object({
  nombre: z.string().min(1),
  codigo: z.string().min(1),
  stock: z.number().int().min(0),
  precio_costo: z.number().min(0),
  precio_venta: z.number().min(0),
  categoria: z.string().min(1),
  imagen_url: z.string().nullable().optional(),
  proveedor_id: z.string().uuid().nullable().optional(),
  fecha_vencimiento: z.string().nullable().optional(),
  marca: z.string().nullable().optional(),
  medida_peso: z.string().nullable().optional(),
  stock_critico: z.number().int().min(0).optional(),
  stock_bajo: z.number().int().min(0).optional(),
});

inventoryRouter.post("/", async (req, res) => {
  try {
    const data = createSchema.parse(req.body);
    
    const producto = await db.one(
      `INSERT INTO productos(
        nombre, codigo, stock, precio_costo, precio_venta, categoria,
        imagen_url, proveedor_id, fecha_vencimiento, marca, medida_peso,
        stock_critico, stock_bajo
      ) VALUES($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, $11, $12, $13)
      RETURNING 
        id, nombre, codigo, stock,
        precio_costo::numeric::text AS precio_costo,
        precio_venta::numeric::text AS precio_venta,
        categoria, estado, imagen_url, proveedor_id, fecha_vencimiento,
        marca, medida_peso, stock_critico, stock_bajo, created_at, updated_at`,
      [
        data.nombre,
        data.codigo,
        data.stock,
        data.precio_costo,
        data.precio_venta,
        data.categoria,
        data.imagen_url ?? null,
        data.proveedor_id ?? null,
        data.fecha_vencimiento ?? null,
        data.marca ?? null,
        data.medida_peso ?? null,
        data.stock_critico ?? 10,
        data.stock_bajo ?? 20,
      ]
    );
    
    res.status(201).json({
      ...producto,
      precio_costo: Number(producto.precio_costo),
      precio_venta: Number(producto.precio_venta),
    });
  } catch (error: any) {
    if (error.code === '23505') { // duplicate key
      return res.status(409).json({ message: "El código de producto ya existe" });
    }
    res.status(400).json({ message: error.message });
  }
});

// PATCH /inventory/:id - Actualizar producto
inventoryRouter.patch("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    const updates = req.body;
    
    // Si hay cambio de precios, registrar historial
    if (updates.precio_costo || updates.precio_venta) {
      const anterior = await db.oneOrNone(
        "SELECT precio_costo, precio_venta FROM productos WHERE id=$1",
        [id]
      );
      
      if (anterior && (updates.precio_costo || updates.precio_venta)) {
        await db.none(
          `INSERT INTO historial_precios(
            producto_id, precio_costo_anterior, precio_venta_anterior,
            precio_costo_nuevo, precio_venta_nuevo, motivo
          ) VALUES($1, $2, $3, $4, $5, $6)`,
          [
            id,
            Number(anterior.precio_costo),
            Number(anterior.precio_venta),
            updates.precio_costo ?? Number(anterior.precio_costo),
            updates.precio_venta ?? Number(anterior.precio_venta),
            updates.motivo_precio ?? "Actualización manual",
          ]
        );
      }
    }
    
    // Construir UPDATE dinámico
    const campos = [];
    const valores = [];
    let idx = 1;
    
    const permitidos = [
      'nombre', 'codigo', 'stock', 'precio_costo', 'precio_venta', 'categoria',
      'imagen_url', 'proveedor_id', 'fecha_vencimiento', 'marca', 'medida_peso',
      'stock_critico', 'stock_bajo'
    ];
    
    for (const key of permitidos) {
      if (updates[key] !== undefined) {
        campos.push(`${key}=$${idx}`);
        valores.push(updates[key]);
        idx++;
      }
    }
    
    if (campos.length === 0) {
      return res.status(400).json({ message: "No hay campos para actualizar" });
    }
    
    campos.push(`updated_at=NOW()`);
    valores.push(id);
    
    const query = `
      UPDATE productos 
      SET ${campos.join(', ')}
      WHERE id=$${idx}
      RETURNING 
        id, nombre, codigo, stock,
        precio_costo::numeric::text AS precio_costo,
        precio_venta::numeric::text AS precio_venta,
        categoria, estado, imagen_url, proveedor_id, fecha_vencimiento,
        marca, medida_peso, stock_critico, stock_bajo, created_at, updated_at
    `;
    
    const producto = await db.one(query, valores);
    
    res.json({
      ...producto,
      precio_costo: Number(producto.precio_costo),
      precio_venta: Number(producto.precio_venta),
    });
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

// DELETE /inventory/:id - Eliminar producto
inventoryRouter.delete("/:id", async (req, res) => {
  try {
    const { id } = req.params;
    await db.none("DELETE FROM productos WHERE id=$1", [id]);
    res.status(204).send();
  } catch (error: any) {
    res.status(400).json({ message: error.message });
  }
});

const itemSchema = z.object({
  codigo: z.string(),
  nombre: z.string(),
  stock: z.number(),
  precio_costo: z.number(),
  precio_venta: z.number(),
  categoria: z.string(),
  proveedor_nombre: z.string().optional(),
  proveedor_id: z.string().optional(),
  marca: z.string().optional(),
  medida_peso: z.string().optional(),
  fecha_vencimiento: z.string().optional(),
  imagen_url: z.string().optional(),
  stock_critico: z.number().optional(),
  stock_bajo: z.number().optional(),
});

inventoryImportRouter.post("/import-json", async (req, res) => {
  const items = z.array(itemSchema).parse(req.body.items);
  let inserted = 0,
    updated = 0,
    errors: any[] = [];

  for (const i of items) {
    try {
      let proveedor_id = i.proveedor_id;
      if (!proveedor_id && i.proveedor_nombre) {
        const prov = await db.oneOrNone(
          "SELECT id FROM proveedores WHERE LOWER(nombre)=LOWER($1)",
          [i.proveedor_nombre]
        );
        if (prov) proveedor_id = prov.id;
        else {
          const nuevo = await db.one(
            "INSERT INTO proveedores(nombre,activo) VALUES($1,true) RETURNING id",
            [i.proveedor_nombre]
          );
          proveedor_id = nuevo.id;
        }
      }

      const existing = await db.oneOrNone(
        "SELECT id FROM productos WHERE codigo=$1",
        [i.codigo]
      );

      if (existing) {
        await db.none(
          `UPDATE productos
           SET nombre=$1, stock=$2, precio_costo=$3, precio_venta=$4, categoria=$5,
               proveedor_id=$6, marca=$7, medida_peso=$8, fecha_vencimiento=$9,
               imagen_url=$10, stock_critico=$11, stock_bajo=$12, updated_at=NOW()
           WHERE codigo=$13`,
          [
            i.nombre,
            i.stock,
            i.precio_costo,
            i.precio_venta,
            i.categoria,
            proveedor_id,
            i.marca,
            i.medida_peso,
            i.fecha_vencimiento,
            i.imagen_url,
            i.stock_critico ?? 10,
            i.stock_bajo ?? 20,
            i.codigo,
          ]
        );
        updated++;
      } else {
        await db.none(
          `INSERT INTO productos(nombre,codigo,stock,precio_costo,precio_venta,categoria,
            proveedor_id,marca,medida_peso,fecha_vencimiento,imagen_url,stock_critico,stock_bajo)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12,$13)`,
          [
            i.nombre,
            i.codigo,
            i.stock,
            i.precio_costo,
            i.precio_venta,
            i.categoria,
            proveedor_id,
            i.marca,
            i.medida_peso,
            i.fecha_vencimiento,
            i.imagen_url,
            i.stock_critico ?? 10,
            i.stock_bajo ?? 20,
          ]
        );
        inserted++;
      }
    } catch (e: any) {
      errors.push(e.message);
    }
  }

  res.json({ inserted, updated, errors: errors.length, details: errors });
});

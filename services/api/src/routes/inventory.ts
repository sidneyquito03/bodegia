import { Router } from "express";
import db from "../db/index";
import { z } from "zod";
export const inventoryRouter = Router();


export const inventoryImportRouter = Router();

inventoryRouter.get("/products", async (_req, res) => {
  const rows = await db.manyOrNone(`
    SELECT id, nombre, codigo,
           stock,
           -- Usar ::numeric::text para obtenerlos como texto y luego convertirlos a número en JS
           precio_costo::numeric::text AS precio_costo,
           precio_venta::numeric::text AS precio_venta,
           categoria, estado, imagen_url,
           proveedor_id, fecha_vencimiento, marca, medida_peso,
           stock_critico, stock_bajo
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
               updated_at=NOW()
           WHERE codigo=$10`,
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
            i.codigo,
          ]
        );
        updated++;
      } else {
        await db.none(
          `INSERT INTO productos(nombre,codigo,stock,precio_costo,precio_venta,categoria,
            proveedor_id,marca,medida_peso,fecha_vencimiento)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10)`,
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

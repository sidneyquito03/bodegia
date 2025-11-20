import { Router } from "express";
import db from "../db/index";
import { z } from "zod";

export const inventoryImportRouter = Router();

const itemSchema = z.object({
  codigo: z.string(),
  nombre: z.string(),
  stock: z.number(),
  precio_costo: z.number(),
  precio_venta: z.number(),
  categoria: z.string(),
  proveedor_nombre: z.string().optional().nullable(),
  proveedor_id: z.string().optional().nullable(),
  marca: z.string().optional().nullable(),
  medida_peso: z.string().optional().nullable(),
  fecha_vencimiento: z.string().optional().nullable(),
  imagen_url: z.string().optional().nullable(),
  stock_bajo: z.number().optional().nullable(),
});

inventoryImportRouter.post("/import-json", async (req, res) => {
  const items = z.array(itemSchema).parse(req.body.items);
  let inserted = 0,
    updated = 0,
    errors: any[] = [];

  for (const i of items) {
    try {
      // resolver proveedor
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
               imagen_url=$10, stock_bajo=$11, updated_at=NOW()
           WHERE codigo=$12`,
          [
            i.nombre,
            i.stock,
            i.precio_costo,
            i.precio_venta,
            i.categoria,
            proveedor_id ?? null,
            i.marca ?? null,
            i.medida_peso ?? null,
            i.fecha_vencimiento ?? null,
            i.imagen_url ?? null,
            i.stock_bajo ?? 10,
            i.codigo,
          ]
        );
        updated++;
      } else {
        await db.none(
          `INSERT INTO productos(nombre,codigo,stock,precio_costo,precio_venta,categoria,
            proveedor_id,marca,medida_peso,fecha_vencimiento,imagen_url,stock_bajo)
           VALUES($1,$2,$3,$4,$5,$6,$7,$8,$9,$10,$11,$12)`,
          [
            i.nombre,
            i.codigo,
            i.stock,
            i.precio_costo,
            i.precio_venta,
            i.categoria,
            proveedor_id ?? null,
            i.marca ?? null,
            i.medida_peso ?? null,
            i.fecha_vencimiento ?? null,
            i.imagen_url ?? null,
            i.stock_bajo ?? 10,
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

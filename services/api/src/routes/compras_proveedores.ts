import { Router } from "express";
import db from "../db/index";
import { z } from "zod";

export const comprasProvRouter = Router();

const compraSchema = z.object({
  proveedor_id: z.string(),
  producto_id: z.string(),
  cantidad: z.number().positive(),
  precio_unitario: z.number().positive(),
  fecha_pedido: z.string(),
  fecha_entrega_estimada: z.string().nullable().optional(),
  fecha_entrega_real: z.string().nullable().optional(),
  estado: z.string().default("Pendiente"),
  notas: z.string().nullable().optional(),
});

comprasProvRouter.get("/", async (req, res) => {
  const { proveedor_id } = req.query;
  const rows = await db.manyOrNone(
    `SELECT c.*, p.nombre AS producto_nombre
       FROM compras_proveedores c
       JOIN productos p ON p.id=c.producto_id
     WHERE ($1::uuid IS NULL OR c.proveedor_id=$1)
     ORDER BY c.fecha_pedido DESC`,
    [proveedor_id ?? null]
  );
  res.json(rows);
});

comprasProvRouter.post("/", async (req, res) => {
  const c = compraSchema.parse(req.body);
  const nuevo = await db.one(
    `INSERT INTO compras_proveedores(
      proveedor_id,producto_id,cantidad,precio_unitario,fecha_pedido,
      fecha_entrega_estimada,estado,notas)
     VALUES($1,$2,$3,$4,$5,$6,$7,$8) RETURNING *`,
    [
      c.proveedor_id, c.producto_id, c.cantidad, c.precio_unitario,
      c.fecha_pedido, c.fecha_entrega_estimada, c.estado, c.notas,
    ]
  );
  res.status(201).json(nuevo);
});

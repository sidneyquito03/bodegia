// providers.ts
import { Router } from "express";
import db from "../db/index";
import { z } from "zod";

export const providersRouter = Router();

const provSchema = z.object({
  nombre: z.string(),
  ruc: z.string().nullable().optional(),
  telefono: z.string().nullable().optional(),
  direccion: z.string().nullable().optional(),
  email: z.string().nullable().optional(),
  activo: z.boolean().default(true),
});

providersRouter.get("/", async (req, res) => {
  const { activo } = req.query;
  const provs = await db.manyOrNone(
    "SELECT * FROM proveedores WHERE ($1::boolean IS NULL OR activo=$1) ORDER BY nombre",
    [activo ?? null]
  );
  res.json(provs);
});

providersRouter.post("/", async (req, res) => {
  const p = provSchema.parse(req.body);
  const nuevo = await db.one(
    `INSERT INTO proveedores(nombre,ruc,telefono,direccion,email,activo)
     VALUES($1,$2,$3,$4,$5,$6) RETURNING *`,
    [p.nombre, p.ruc, p.telefono, p.direccion, p.email, p.activo]
  );
  res.status(201).json(nuevo);
});

providersRouter.patch("/:id", async (req, res) => {
  const id = req.params.id;
  const p = provSchema.partial().parse(req.body);
  const act = await db.one(
    `UPDATE proveedores
       SET nombre=COALESCE($1,nombre),
           ruc=COALESCE($2,ruc),
           telefono=COALESCE($3,telefono),
           direccion=COALESCE($4,direccion),
           email=COALESCE($5,email),
           activo=COALESCE($6,activo),
           updated_at=NOW()
     WHERE id=$7 RETURNING *`,
    [p.nombre, p.ruc, p.telefono, p.direccion, p.email, p.activo, id]
  );
  res.json(act);
});

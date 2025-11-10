import { Router } from "express";
import { pool } from "../db/pool";
const router = Router();

router.get("/", async (_req, res) => {
  const { rows } = await pool.query(`SELECT * FROM operadores ORDER BY nombre`);
  res.json(rows);
});

router.post("/", async (req, res) => {
  const o = req.body;
  const { rows } = await pool.query(
    `INSERT INTO operadores (nombre,celular,email,dni,direccion)
     VALUES ($1,$2,$3,$4,$5) RETURNING *`,
    [o.nombre, o.celular, o.email ?? null, o.dni ?? null, o.direccion ?? null]
  );
  res.status(201).json(rows[0]);
});

router.patch("/:id/toggle", async (req, res) => {
  const id = req.params.id;
  const current = await pool.query(`SELECT activo FROM operadores WHERE id=$1`, [id]);
  const next = !current.rows[0]?.activo;
  const { rows } = await pool.query(`UPDATE operadores SET activo=$1 WHERE id=$2 RETURNING *`, [next, id]);
  res.json(rows[0]);
});

router.put("/:id", async (req, res) => {
  const { id } = req.params;
  const o = req.body;
  const { rows } = await pool.query(
    `UPDATE operadores SET nombre=$1, celular=$2, email=$3, dni=$4, direccion=$5 WHERE id=$6 RETURNING *`,
    [o.nombre, o.celular, o.email ?? null, o.dni ?? null, o.direccion ?? null, id]
  );
  res.json(rows[0]);
});

router.delete("/:id", async (req, res) => {
  await pool.query(`DELETE FROM operadores WHERE id=$1`, [req.params.id]);
  res.status(204).end();
});

export default router;


/*import { Router } from "express";
import { randomUUID } from "crypto";

type Operador = {
  id: string;
  nombre: string;
  celular: string;
  activo: boolean;
  email?: string | null;
  dni?: string | null;
  direccion?: string | null;
};

// TEMP: en memoria hasta conectar Postgres
const store: Operador[] = [];

const r = Router();

r.get("/", (_req, res) => {
  res.json(store);
});

r.post("/", (req, res) => {
  const body = req.body as Omit<Operador, "id"> & Partial<Pick<Operador, "id">>;
  const nuevo: Operador = {
    id: body.id ?? randomUUID(),
    nombre: body.nombre?.trim() ?? "",
    celular: body.celular?.trim() ?? "",
    activo: body.activo ?? true,
    email: body.email ?? null,
    dni: body.dni ?? null,
    direccion: body.direccion ?? null,
  };
  store.push(nuevo);
  res.status(201).json(nuevo);
});

r.put("/:id", (req, res) => {
  const { id } = req.params;
  const i = store.findIndex((o) => o.id === id);
  if (i === -1) return res.status(404).json({ message: "Operador no encontrado" });
  store[i] = { ...store[i], ...req.body };
  res.json(store[i]);
});

r.put("/:id/toggle", (req, res) => {
  const { id } = req.params;
  const i = store.findIndex((o) => o.id === id);
  if (i === -1) return res.status(404).json({ message: "Operador no encontrado" });
  const nextActivo = typeof req.body?.activo === "boolean" ? req.body.activo : !store[i].activo;
  store[i] = { ...store[i], activo: nextActivo };
  res.json(store[i]);
});

r.delete("/:id", (req, res) => {
  const { id } = req.params;
  const i = store.findIndex((o) => o.id === id);
  if (i === -1) return res.status(404).json({ message: "Operador no encontrado" });
  store.splice(i, 1);
  res.status(204).end();
});

export default r;
*/
import { Router } from "express";
import { pool } from "../db/pool";
const router = Router();

router.get("/", async (_req, res) => {
  const { rows } = await pool.query(`SELECT * FROM clientes ORDER BY nombre`);
  res.json(rows);
});

router.post("/", async (req, res) => {
  const c = req.body;
  const { rows } = await pool.query(
    `INSERT INTO clientes (nombre,celular,dni,direccion,notas,foto_url)
     VALUES ($1,$2,$3,$4,$5,$6) RETURNING *`,
    [c.nombre, c.celular, c.dni ?? null, c.direccion ?? null, c.notas ?? null, c.foto_url ?? null]
  );
  res.status(201).json(rows[0]);
});

export default router;

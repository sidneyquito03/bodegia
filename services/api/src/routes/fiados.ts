
import { Router } from "express";
import db from "../db/index";
const r = Router();


// Listar clientes reales de la base de datos
r.get("/clientes", async (_req, res) => {
  try {
    const clientes = await db.manyOrNone(
      `SELECT id, nombre, celular, dni, NULL as foto_url, activo, deuda_total, created_at, updated_at
       FROM clientes
       WHERE activo IS TRUE OR activo IS NULL
       ORDER BY nombre ASC`
    );
    res.json(clientes);
  } catch (e) {
    res.status(500).json({ message: "Error al listar clientes" });
  }
});


// Crear cliente en la base de datos
r.post("/clientes", async (req, res) => {
  try {
    const { nombre, celular, dni, foto_url, deuda_inicial = 0 } = req.body;
    const result = await db.one(
      `INSERT INTO clientes (nombre, celular, dni, activo, deuda_total, created_at, updated_at)
       VALUES ($1, $2, $3, TRUE, $4, NOW(), NOW())
       RETURNING id, nombre, celular, dni, NULL as foto_url, activo, deuda_total, created_at, updated_at`,
      [nombre, celular, dni, deuda_inicial || 0]
    );
    res.json(result);
  } catch (e) {
    res.status(500).json({ message: "Error al crear cliente" });
  }
});


// Registrar pago de cliente en la base de datos
r.post("/clientes/:id/pagos", async (req, res) => {
  const { id } = req.params;
  const { monto, descripcion, metodoPago, referencia, comprobanteUrl } = req.body;
  try {
    const cliente = await db.oneOrNone("SELECT * FROM clientes WHERE id = $1", [id]);
    if (!cliente) return res.status(404).json({ message: "Cliente no encontrado" });

    // Insertar pago (opcional: crear tabla pagos_clientes si no existe)
    // await db.none(`INSERT INTO pagos_clientes ...`)

    // Actualizar deuda
    await db.none(
      `UPDATE clientes SET deuda_total = GREATEST(0, deuda_total - $1), updated_at = NOW() WHERE id = $2`,
      [monto, id]
    );
    const actualizado = await db.one("SELECT id, nombre, celular, dni, NULL as foto_url, activo, deuda_total, created_at, updated_at FROM clientes WHERE id = $1", [id]);
    res.json({ ok: true, cliente: actualizado });
  } catch (e) {
    res.status(500).json({ message: "Error al registrar pago" });
  }
});


// Desactivar cliente
r.post("/clientes/:id/desactivar", async (req, res) => {
  const { id } = req.params;
  try {
    const cliente = await db.oneOrNone("SELECT * FROM clientes WHERE id = $1", [id]);
    if (!cliente) return res.status(404).json({ message: "Cliente no encontrado" });
    await db.none("UPDATE clientes SET activo = FALSE, updated_at = NOW() WHERE id = $1", [id]);
    const actualizado = await db.one("SELECT id, nombre, celular, dni, NULL as foto_url, activo, deuda_total, created_at, updated_at FROM clientes WHERE id = $1", [id]);
    res.json(actualizado);
  } catch (e) {
    res.status(500).json({ message: "Error al desactivar cliente" });
  }
});


// Activar cliente
r.post("/clientes/:id/activar", async (req, res) => {
  const { id } = req.params;
  try {
    const cliente = await db.oneOrNone("SELECT * FROM clientes WHERE id = $1", [id]);
    if (!cliente) return res.status(404).json({ message: "Cliente no encontrado" });
    await db.none("UPDATE clientes SET activo = TRUE, updated_at = NOW() WHERE id = $1", [id]);
    const actualizado = await db.one("SELECT id, nombre, celular, dni, NULL as foto_url, activo, deuda_total, created_at, updated_at FROM clientes WHERE id = $1", [id]);
    res.json(actualizado);
  } catch (e) {
    res.status(500).json({ message: "Error al activar cliente" });
  }
});

export default r;

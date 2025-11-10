import { Router } from "express";
import { pool } from "../db/pool";
const router = Router();

router.get("/", async (req, res) => {
  const { search = "", categoria, estado } = req.query;
  const where: string[] = [];
  const params: any[] = [];

  if (search) {
    params.push(`%${String(search).toLowerCase()}%`);
    where.push("(lower(nombre) LIKE $"+params.length+" OR lower(codigo) LIKE $"+params.length+")");
  }
  if (categoria && categoria !== "todas") {
    params.push(String(categoria).toLowerCase());
    where.push("lower(categoria) = $"+params.length);
  }
  if (estado && estado !== "todos") {
    params.push(String(estado));
    where.push("estado = $"+params.length);
  }
  const whereSql = where.length ? "WHERE " + where.join(" AND ") : "";
  const { rows } = await pool.query(`SELECT * FROM productos ${whereSql} ORDER BY nombre`);
  res.json(rows);
});

router.post("/", async (req, res) => {
  const p = req.body;
  const { rows } = await pool.query(
    `INSERT INTO productos (nombre,codigo,stock,precio_costo,precio_venta,categoria,estado,fecha_vencimiento,imagen_url)
     VALUES ($1,$2,$3,$4,$5,$6,$7,$8,$9) RETURNING *`,
    [p.nombre, p.codigo, p.stock, p.precio_costo, p.precio_venta, p.categoria, p.estado ?? "Disponible", p.fecha_vencimiento ?? null, p.imagen_url ?? null]
  );
  res.status(201).json(rows[0]);
});

router.put("/:id", async (req, res) => {
  const id = req.params.id;
  const p = req.body;

  const prev = await pool.query(`SELECT precio_costo, precio_venta FROM productos WHERE id=$1`, [id]);

  const { rows } = await pool.query(
    `UPDATE productos SET
      nombre=$1, codigo=$2, stock=$3, precio_costo=$4, precio_venta=$5,
      categoria=$6, estado=$7, fecha_vencimiento=$8, imagen_url=$9, updated_at=now()
     WHERE id=$10 RETURNING *`,
    [p.nombre, p.codigo, p.stock, p.precio_costo, p.precio_venta, p.categoria, p.estado, p.fecha_vencimiento ?? null, p.imagen_url ?? null, id]
  );

  if (prev.rows[0] &&
     (prev.rows[0].precio_costo !== p.precio_costo || prev.rows[0].precio_venta !== p.precio_venta)) {
    await pool.query(
      `INSERT INTO historial_precios (producto_id, precio_costo_anterior, precio_venta_anterior, precio_costo_nuevo, precio_venta_nuevo, motivo)
       VALUES ($1,$2,$3,$4,$5,$6)`,
      [id, prev.rows[0].precio_costo, prev.rows[0].precio_venta, p.precio_costo, p.precio_venta, p.motivo ?? 'Actualización desde UI']
    );
  }
  res.json(rows[0]);
});

router.delete("/:id", async (req, res) => {
  await pool.query(`DELETE FROM productos WHERE id=$1`, [req.params.id]);
  res.status(204).end();
});

router.get("/:id/prices-history", async (req, res) => {
  const { rows } = await pool.query(
    `SELECT * FROM historial_precios WHERE producto_id=$1 ORDER BY created_at DESC`,
    [req.params.id]
  );
  res.json(rows);
});

export default router;

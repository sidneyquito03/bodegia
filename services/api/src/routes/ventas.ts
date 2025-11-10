import { Router } from "express";
import { pool } from "../db/pool";
const router = Router();

router.post("/", async (req, res) => {
  const { items, tipo, clienteId } = req.body;
  const subtotal = items.reduce((s:number,i:any)=> s + i.precio * i.cantidad, 0);

  await pool.query("BEGIN");
  try {
    const venta = await pool.query(
      `INSERT INTO ventas (tipo, cliente_id, subtotal, total)
       VALUES ($1,$2,$3,$3) RETURNING *`,
      [tipo, clienteId ?? null, subtotal]
    );

    for (const it of items) {
      await pool.query(
        `INSERT INTO venta_items (venta_id, producto_id, nombre, cantidad, precio)
         VALUES ($1,$2,$3,$4,$5)`,
        [venta.rows[0].id, it.producto_id, it.nombre, it.cantidad, it.precio]
      );
      await pool.query(
        `UPDATE productos SET stock = GREATEST(0, stock - $1) WHERE id=$2`,
        [it.cantidad, it.producto_id]
      );
    }

    if (tipo === "fiado" && clienteId) {
      await pool.query(
        `UPDATE clientes SET deuda_total = deuda_total + $1 WHERE id=$2`,
        [subtotal, clienteId]
      );
      await pool.query(
        `INSERT INTO transacciones_fiados (cliente_id, tipo, monto, descripcion)
         VALUES ($1,'fiado',$2,'Venta fiada')`,
        [clienteId, subtotal]
      );
    }

    await pool.query("COMMIT");
    res.status(201).json(venta.rows[0]);
  } catch (e) {
    await pool.query("ROLLBACK");
    res.status(500).json({ error: "No se pudo registrar la venta" });
  }
});

router.get("/kpis/overview", async (_req, res) => {
  const hoy = new Date(); hoy.setHours(0,0,0,0);
  const ventaHoy = await pool.query(
    `SELECT COALESCE(SUM(total),0) as total FROM ventas WHERE created_at >= $1`, [hoy]
  );
  const deuda = await pool.query(
    `SELECT COALESCE(SUM(deuda_total),0) as total FROM clientes WHERE deuda_total > 0`
  );
  const alertas = await pool.query(
    `SELECT COUNT(*)::int AS count FROM productos WHERE stock < 10`
  );

  res.json({
    ventaHoy: Number(ventaHoy.rows[0].total),
    deudaTotal: Number(deuda.rows[0].total),
    alertas: Number(alertas.rows[0].count),
  });
});

router.get("/historial", async (req, res) => {
  const { period = "day" } = req.query;
  const now = new Date();
  let from = new Date(now);

  if (period === "week") from.setDate(now.getDate() - 7);
  else if (period === "month") from.setMonth(now.getMonth() - 1);
  else if (period === "year") from.setFullYear(now.getFullYear() - 1);
  else from.setHours(0,0,0,0);

  const { rows } = await pool.query(
    `SELECT created_at::date AS fecha, SUM(total)::numeric(12,2) AS total
     FROM ventas WHERE created_at >= $1
     GROUP BY 1 ORDER BY 1`, [from]
  );

  res.json(rows);
});

export default router;


/*import { Router } from "express";
import { randomUUID } from "crypto";

/** TIPOS (ajusta cuando conectes Postgres) */
/*type Producto = {
  id: string;
  nombre: string;
  stock: number;
  precio_costo: number;
  precio_venta: number;
};
type Cliente = {
  id: string;
  nombre: string;
  deuda_total: number;
};
type ItemVenta = { producto_id: string; nombre: string; cantidad: number; precio: number };
type Venta = {
  id: string;
  subtotal: number;
  total: number;
  tipo: "efectivo" | "fiado";
  cliente_id?: string | null;
  items: ItemVenta[];
  created_at: string;
};
type TransaccionFiado = {
  id: string;
  cliente_id: string;
  tipo: "fiado" | "pago";
  monto: number;
  descripcion?: string | null;
  estado: "pendiente" | "completado";
  metodo_pago?: string | null;
  referencia_transaccion?: string | null;
  created_at: string;
};

/** STORES en memoria (reemplaza con DB) */
/*const productos = new Map<string, Producto>(); // llena con mock si quieres
const clientes = new Map<string, Cliente>();
const ventas: Venta[] = [];
const transaccionesFiados: TransaccionFiado[] = [];

const r = Router();

/** POST /ventas: crea venta, descuenta stock y si es fiado, suma deuda + transacción */
/*r.post("/", (req, res) => {
  const { items, tipo, cliente_id } = req.body as {
    items: ItemVenta[];
    tipo: "efectivo" | "fiado";
    cliente_id?: string;
  };

  if (!Array.isArray(items) || items.length === 0) {
    return res.status(400).json({ message: "Items requeridos" });
  }
  if (tipo === "fiado" && !cliente_id) {
    return res.status(400).json({ message: "Cliente requerido para fiado" });
  }

  // valida stock
  for (const it of items) {
    const p = productos.get(it.producto_id);
    if (!p) return res.status(404).json({ message: `Producto ${it.producto_id} no existe` });
    if (p.stock < it.cantidad) {
      return res.status(409).json({ message: `Stock insuficiente de ${p.nombre}` });
    }
  }

  // descuenta stock
  for (const it of items) {
    const p = productos.get(it.producto_id)!;
    p.stock -= it.cantidad;
    productos.set(p.id, p);
  }

  const subtotal = items.reduce((s, it) => s + it.precio * it.cantidad, 0);
  const total = subtotal; // aplica descuentos/impuestos si luego hace falta

  const venta: Venta = {
    id: randomUUID(),
    subtotal,
    total,
    tipo,
    cliente_id: cliente_id ?? null,
    items,
    created_at: new Date().toISOString(),
  };
  ventas.push(venta);

  if (tipo === "fiado" && cliente_id) {
    const c = clientes.get(cliente_id);
    if (!c) return res.status(404).json({ message: "Cliente no encontrado" });
    c.deuda_total += total;
    clientes.set(c.id, c);

    transaccionesFiados.push({
      id: randomUUID(),
      cliente_id,
      tipo: "fiado",
      monto: total,
      descripcion: "Venta fiada",
      estado: "pendiente",
      created_at: new Date().toISOString(),
    });
  }

  res.status(201).json(venta);
});

export default r;
*/
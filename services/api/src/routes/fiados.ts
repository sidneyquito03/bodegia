import { Router } from "express";
import { pool } from "../db/pool";
const router = Router();

router.get("/transactions", async (req, res) => {
  const { type } = req.query; // fiado | pago | todos
  const where = type && type !== "todos" ? `WHERE t.tipo = $1` : "";
  const params = type && type !== "todos" ? [type] : [];
  const { rows } = await pool.query(
    `SELECT t.*, c.nombre AS cliente_nombre
     FROM transacciones_fiados t
     JOIN clientes c ON c.id = t.cliente_id
     ${where}
     ORDER BY t.created_at DESC`,
    params
  );
  res.json(rows);
});

router.post("/pay", async (req, res) => {
  const { clienteId, monto, descripcion, metodoPago, referencia, comprobanteUrl } = req.body;
  await pool.query("BEGIN");
  try {
    await pool.query(
      `INSERT INTO transacciones_fiados (cliente_id,tipo,monto,descripcion,metodo_pago,referencia_transaccion,comprobante_url)
       VALUES ($1,'pago',$2,$3,$4,$5,$6)`,
      [clienteId, monto, descripcion ?? null, metodoPago ?? null, referencia ?? null, comprobanteUrl ?? null]
    );
    await pool.query(
      `UPDATE clientes SET deuda_total = GREATEST(0, deuda_total - $1) WHERE id=$2`,
      [monto, clienteId]
    );
    await pool.query("COMMIT");
    res.status(201).json({ ok: true });
  } catch (e) {
    await pool.query("ROLLBACK");
    res.status(500).json({ error: "No se pudo registrar el pago" });
  }
});

export default router;


/*import { Router } from "express";
const r = Router();

type Cliente = { id:string; nombre:string; celular?:string; dni?:string; foto_url?:string; activo?:boolean; deuda_total:number; created_at:string; updated_at:string; };
type Pago = { id:string; cliente_id:string; monto:number; descripcion?:string; metodoPago:string; referencia?:string; comprobanteUrl?:string; created_at:string; };

const clientes: Record<string, Cliente> = {};
const pagos: Pago[] = [];

r.get("/clientes", (_req, res) => {
  res.json(Object.values(clientes));
});

r.post("/clientes", (req, res) => {
  const { nombre, celular, dni, foto_url, deuda_inicial = 0 } = req.body;
  const id = crypto.randomUUID();
  const now = new Date().toISOString();
  const cliente: Cliente = {
    id, nombre, celular, dni, foto_url,
    activo: true,
    deuda_total: Number(deuda_inicial) || 0,
    created_at: now, updated_at: now
  };
  clientes[id] = cliente;
  res.json(cliente);
});

r.post("/clientes/:id/pagos", (req, res) => {
  const { id } = req.params;
  const c = clientes[id];
  if (!c) return res.status(404).json({ message: "Cliente no encontrado" });

  const { monto, descripcion, metodoPago, referencia, comprobanteUrl } = req.body;
  const pago: Pago = {
    id: crypto.randomUUID(),
    cliente_id: id,
    monto: Number(monto) || 0,
    descripcion, metodoPago, referencia, comprobanteUrl,
    created_at: new Date().toISOString()
  };
  pagos.push(pago);

  c.deuda_total = Math.max(0, Number(c.deuda_total) - pago.monto);
  c.updated_at = new Date().toISOString();
  clientes[id] = c;
  res.json({ ok: true, cliente: c });
});

r.post("/clientes/:id/desactivar", (req, res) => {
  const { id } = req.params;
  const c = clientes[id];
  if (!c) return res.status(404).json({ message: "Cliente no encontrado" });
  c.activo = false;
  c.updated_at = new Date().toISOString();
  res.json(c);
});

r.post("/clientes/:id/activar", (req, res) => {
  const { id } = req.params;
  const c = clientes[id];
  if (!c) return res.status(404).json({ message: "Cliente no encontrado" });
  c.activo = true;
  c.updated_at = new Date().toISOString();
  res.json(c);
});

export default r;
*/
import { Router } from "express";
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

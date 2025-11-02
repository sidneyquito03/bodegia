import { Router } from "express";
const r = Router();

type Tx = {
  id: string;
  cliente_id: string;
  tipo: "fiado" | "pago";
  monto: number;
  descripcion?: string;
  metodo_pago?: string;
  referencia?: string;
  created_at: string; // ISO
};
type Cliente = { id: string; nombre: string };

const txs: Tx[] = [];                       // TODO: reemplazar por DB
const clientes: Record<string, Cliente> = {}; // TODO: reemplazar por DB

r.get("/", (req, res) => {
  const tipoQ = (req.query.tipo as string | undefined)?.toLowerCase();
  const fromQ = req.query.from as string | undefined; // YYYY-MM-DD
  const toQ   = req.query.to as string | undefined;   // YYYY-MM-DD
  const pageQ = Number(req.query.page ?? 1);
  const limitQ = Math.min(Number(req.query.limit ?? 20), 200);

  let result = txs.slice();
  if (tipoQ === "fiado" || tipoQ === "pago") {
    result = result.filter(t => t.tipo === tipoQ);
  }

  if (fromQ) {
    const fromTs = new Date(fromQ + "T00:00:00.000Z").getTime();
    result = result.filter(t => new Date(t.created_at).getTime() >= fromTs);
  }
  if (toQ) {
    const toTs = new Date(toQ + "T23:59:59.999Z").getTime();
    result = result.filter(t => new Date(t.created_at).getTime() <= toTs);
  }

  result.sort((a, b) => +new Date(b.created_at) - +new Date(a.created_at));

  const total = result.length;
  const page = Math.max(1, pageQ);
  const pageSize = Math.max(1, limitQ);
  const start = (page - 1) * pageSize;
  const items = result.slice(start, start + pageSize).map(t => ({
    ...t,
    cliente: clientes[t.cliente_id]
      ? { id: t.cliente_id, nombre: clientes[t.cliente_id].nombre }
      : undefined,
  }));

  res.json({ items, total, page, pageSize });
});

export default r;

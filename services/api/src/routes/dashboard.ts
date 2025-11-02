import { Router } from "express";

/** Simuladores: reemplaza con tu DB cuando conectes Postgres */
type Venta = { id:string; total:number; tipo:"efectivo"|"fiado"; created_at:string; items?: any[] };
type Cliente = { id:string; nombre:string; celular?:string|null; deuda_total:number };
type Producto = { id:string; nombre:string; codigo:string; stock:number };

const ventas: Venta[] = [];        // llena con tu fuente real
const clientes: Cliente[] = [];
const productos: Producto[] = [];

const r = Router();

/** KPIs del dashboard */
r.get("/summary", (_req, res) => {
  const inicioHoy = new Date(); inicioHoy.setHours(0,0,0,0);
  const ventasHoy = ventas.filter(v => new Date(v.created_at) >= inicioHoy);
  const ventaHoy = ventasHoy.reduce((s, v) => s + v.total, 0);

  // Ganancia “rápida”: suponemos que cada venta trae en items precio_venta - precio_costo -> si no tienes items, deja 0
  let gananciaHoy = 0;
  for (const v of ventasHoy) {
    if (Array.isArray(v.items)) {
      for (const it of v.items) {
        // si tu item trae costoUnitario, úsalo; si no, déjalo 0
        const costo = Number(it.costo ?? 0);
        gananciaHoy += (Number(it.precio) - costo) * Number(it.cantidad);
      }
    }
  }

  const detallesDeudas = clientes.filter(c => Number(c.deuda_total) > 0);
  const deudaTotal = detallesDeudas.reduce((s, c) => s + Number(c.deuda_total), 0);

  const detallesAlertas = productos.filter(p => p.stock < 10);
  const alertas = detallesAlertas.length;

  res.json({
    ventaHoy,
    gananciaHoy,
    deudaTotal,
    alertas,
    detallesVentas: ventasHoy,
    detallesDeudas,
    detallesAlertas,
  });
});

/** Historial de ventas agrupado por día o mes */
r.get("/sales", (req, res) => {
  const fromISO = String(req.query.fromISO);
  const toISO = String(req.query.toISO);
  const groupBy = (String(req.query.groupBy) === "month" ? "month" : "day") as "day"|"month";

  const from = new Date(fromISO);
  const to = new Date(toISO);

  const inRange = ventas.filter(v => {
    const d = new Date(v.created_at);
    return d >= from && d <= to;
  });

  // agrupar
  const map = new Map<string, { total:number; cobrado:number; fiado:number }>();
  for (const v of inRange) {
    const d = new Date(v.created_at);
    const label =
      groupBy === "month"
        ? `${d.getFullYear()}-${String(d.getMonth()+1).padStart(2,"0")}` // YYYY-MM
        : d.toISOString().slice(0,10); // YYYY-MM-DD

    const bucket = map.get(label) ?? { total:0, cobrado:0, fiado:0 };
    bucket.total += v.total;
    if (v.tipo === "efectivo") bucket.cobrado += v.total;
    if (v.tipo === "fiado") bucket.fiado += v.total;
    map.set(label, bucket);
  }

  const labels = Array.from(map.keys()).sort(); // orden cronológico
  const series = labels.map(l => ({ label: l, ...map.get(l)! }));
  res.json(series);
});

export default r;

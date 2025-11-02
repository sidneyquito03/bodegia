import { Router } from "express";
type Venta = { id:string; total:number; tipo:"efectivo"|"fiado"; created_at:string };
type TransaccionFiado = { id:string; cliente_id:string; tipo:"fiado"|"pago"; monto:number; created_at:string };
type Compra = { id:string; total:number; created_at:string };

const ventas: Venta[] = [];
const transaccionesFiados: TransaccionFiado[] = [];
const compras: Compra[] = []; // por ahora vacío

const r = Router();

function rangoFromPeriodo(periodo: string) {
  const ahora = new Date();
  let inicio = new Date(ahora);
  let fin = new Date(ahora);
  switch (periodo) {
    case "mes-actual":
      inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      fin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
      fin.setHours(23,59,59,999);
      break;
    case "mes-anterior":
      inicio = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
      fin = new Date(ahora.getFullYear(), ahora.getMonth(), 0);
      fin.setHours(23,59,59,999);
      break;
    case "trimestre": {
      const mesInicio = Math.floor(ahora.getMonth() / 3) * 3;
      inicio = new Date(ahora.getFullYear(), mesInicio, 1);
      fin = new Date(ahora.getFullYear(), mesInicio + 3, 0);
      fin.setHours(23,59,59,999);
      break;
    }
    case "anual":
      inicio = new Date(ahora.getFullYear(), 0, 1);
      fin = new Date(ahora.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    default:
      inicio.setHours(0,0,0,0);
      fin.setHours(23,59,59,999);
  }
  return { inicio, fin };
}

r.get("/summary", (req, res) => {
  const periodo = String(req.query.periodo || "mes-actual");
  const { inicio, fin } = rangoFromPeriodo(periodo);

  const inRangeVentas = ventas.filter(v => {
    const d = new Date(v.created_at);
    return d >= inicio && d <= fin;
  });
  const inRangeTrans = transaccionesFiados.filter(t => {
    const d = new Date(t.created_at);
    return d >= inicio && d <= fin;
  });
  const inRangeCompras = compras.filter(c => {
    const d = new Date(c.created_at);
    return d >= inicio && d <= fin;
  });

  const totalVentas = inRangeVentas.reduce((s, v) => s + Number(v.total), 0);
  const totalFiados = inRangeTrans.filter(t => t.tipo === "fiado").reduce((s, t) => s + Number(t.monto), 0);
  const totalPagos  = inRangeTrans.filter(t => t.tipo === "pago").reduce((s, t) => s + Number(t.monto), 0);
  const totalCompras = inRangeCompras.reduce((s, c) => s + Number(c.total), 0); // 0 si no usas compras

  res.json({ totalVentas, totalCompras, totalFiados, totalPagos });
});

export default r;

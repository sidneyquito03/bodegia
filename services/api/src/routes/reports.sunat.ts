import { Router } from "express";
import db from "../db/index";
import { requireAuth } from "../middleware/auth";

const r = Router();

function rangoFromPeriodo(periodo: string) {
  const ahora = new Date();
  let inicio = new Date(ahora);
  let fin = new Date(ahora);
  switch (periodo) {
    case "mes-actual":
      inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      fin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
      fin.setHours(23, 59, 59, 999);
      break;
    case "mes-anterior":
      inicio = new Date(ahora.getFullYear(), ahora.getMonth() - 1, 1);
      fin = new Date(ahora.getFullYear(), ahora.getMonth(), 0);
      fin.setHours(23, 59, 59, 999);
      break;
    case "trimestre": {
      const mesInicio = Math.floor(ahora.getMonth() / 3) * 3;
      inicio = new Date(ahora.getFullYear(), mesInicio, 1);
      fin = new Date(ahora.getFullYear(), mesInicio + 3, 0);
      fin.setHours(23, 59, 59, 999);
      break;
    }
    case "anual":
      inicio = new Date(ahora.getFullYear(), 0, 1);
      fin = new Date(ahora.getFullYear(), 11, 31, 23, 59, 59, 999);
      break;
    default:
      inicio.setHours(0, 0, 0, 0);
      fin.setHours(23, 59, 59, 999);
  }
  return { inicio, fin };
}

/** Resumen SUNAT: Ventas, Fiados, Compras */
r.get("/summary", requireAuth, async (req, res) => {
  try {
    const periodo = String(req.query.periodo || "mes-actual");
    const { inicio, fin } = rangoFromPeriodo(periodo);

    // Total de ventas (Cobrado + Fiado)
    const ventasRes = await db.oneOrNone(
      `SELECT COALESCE(SUM(total), 0) as total
       FROM ventas
       WHERE fecha >= $1 AND fecha <= $2`,
      [inicio, fin]
    );
    const totalVentas = Number(ventasRes?.total || 0);

    // Total de ventas cobradas
    const ventasCobradasRes = await db.oneOrNone(
      `SELECT COALESCE(SUM(total), 0) as total
       FROM ventas
       WHERE fecha >= $1 AND fecha <= $2 AND tipo = 'Cobrado'`,
      [inicio, fin]
    );
    const totalVentasCobradas = Number(ventasCobradasRes?.total || 0);

    // Total de fiados (nuevos)
    const fiadosRes = await db.oneOrNone(
      `SELECT COALESCE(SUM(total), 0) as total
       FROM ventas
       WHERE fecha >= $1 AND fecha <= $2 AND tipo = 'Fiado'`,
      [inicio, fin]
    );
    const totalFiados = Number(fiadosRes?.total || 0);

    // Pagos de fiados
    const pagosRes = await db.oneOrNone(
      `SELECT COALESCE(SUM(monto), 0) as total
       FROM fiados_transacciones
       WHERE fecha >= $1 AND fecha <= $2 AND tipo = 'pago'`,
      [inicio, fin]
    );
    const totalPagos = Number(pagosRes?.total || 0);

    // Total de compras a proveedores
    const comprasRes = await db.oneOrNone(
      `SELECT COALESCE(SUM(total), 0) as total
       FROM compras_proveedores
       WHERE fecha >= $1 AND fecha <= $2`,
      [inicio, fin]
    );
    const totalCompras = Number(comprasRes?.total || 0);

    res.json({
      totalVentas,
      totalVentasCobradas,
      totalFiados,
      totalPagos,
      totalCompras,
      periodo,
      desde: inicio.toISOString().slice(0, 10),
      hasta: fin.toISOString().slice(0, 10),
    });
  } catch (error: any) {
    console.error("Error en SUNAT summary:", error);
    res.status(500).json({ message: error.message || "Error al obtener resumen" });
  }
});

/** Detalles de ventas por período */
r.get("/ventas-detalle", requireAuth, async (req, res) => {
  try {
    const periodo = String(req.query.periodo || "mes-actual");
    const { inicio, fin } = rangoFromPeriodo(periodo);

    const ventas = await db.manyOrNone(
      `SELECT 
        v.id, v.fecha, v.total, v.tipo, v.metodo_pago,
        json_agg(
          json_build_object(
            'producto_id', vd.producto_id,
            'producto_nombre', p.nombre,
            'cantidad', vd.cantidad,
            'precio_unitario', vd.precio_unitario
          )
        ) as items
       FROM ventas v
       LEFT JOIN ventas_detalle vd ON v.id = vd.venta_id
       LEFT JOIN productos p ON vd.producto_id = p.id
       WHERE v.fecha >= $1 AND v.fecha <= $2
       GROUP BY v.id
       ORDER BY v.fecha DESC`,
      [inicio, fin]
    );

    res.json(ventas);
  } catch (error: any) {
    console.error("Error en ventas-detalle:", error);
    res.status(500).json({ message: error.message });
  }
});

/** Detalles de fiados y pagos */
r.get("/fiados-detalle", requireAuth, async (req, res) => {
  try {
    const periodo = String(req.query.periodo || "mes-actual");
    const { inicio, fin } = rangoFromPeriodo(periodo);

    const fiados = await db.manyOrNone(
      `SELECT 
        ft.id, ft.cliente_id, ft.tipo, ft.monto, ft.fecha, ft.estado,
        c.nombre as cliente_nombre
       FROM fiados_transacciones ft
       LEFT JOIN clientes c ON ft.cliente_id = c.id
       WHERE ft.fecha >= $1 AND ft.fecha <= $2
       ORDER BY ft.fecha DESC`,
      [inicio, fin]
    );

    res.json(fiados);
  } catch (error: any) {
    console.error("Error en fiados-detalle:", error);
    res.status(500).json({ message: error.message });
  }
});

/** Detalles de compras */
r.get("/compras-detalle", requireAuth, async (req, res) => {
  try {
    const periodo = String(req.query.periodo || "mes-actual");
    const { inicio, fin } = rangoFromPeriodo(periodo);

    const compras = await db.manyOrNone(
      `SELECT 
        cp.id, cp.proveedor_id, cp.total, cp.fecha, cp.estado,
        pr.nombre as proveedor_nombre
       FROM compras_proveedores cp
       LEFT JOIN proveedores pr ON cp.proveedor_id = pr.id
       WHERE cp.fecha >= $1 AND cp.fecha <= $2
       ORDER BY cp.fecha DESC`,
      [inicio, fin]
    );

    res.json(compras);
  } catch (error: any) {
    console.error("Error en compras-detalle:", error);
    res.status(500).json({ message: error.message });
  }
});

export default r;

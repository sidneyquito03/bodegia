import { Router } from "express";
import db from "../db/index";
import { requireAuth } from "../middleware/auth";

const r = Router();

/** KPIs del dashboard */
r.get("/summary", requireAuth, async (req, res) => {
  try {
    console.log("[Dashboard] GET /summary - User:", (req as any).user);
    
    // Usar CURRENT_DATE de PostgreSQL (basado en la fecha del servidor)
    // Las ventas de hoy son las del día actual en UTC
    const ventasHoyRes = await db.manyOrNone(
      `SELECT v.id, v.total, v.tipo, v.fecha, v.vendedor_id
       FROM ventas v
       WHERE DATE(v.fecha) = CURRENT_DATE
         AND v.tipo = 'Cobrado'
       ORDER BY v.fecha DESC`,
      []
    );
    
    console.log(`[Dashboard] Ventas encontradas hoy: ${ventasHoyRes.length}`, ventasHoyRes);
    
    const ventaHoy = ventasHoyRes.reduce((sum, v) => sum + Number(v.total), 0);
    
    console.log(`[Dashboard] Total venta hoy: ${ventaHoy}`);
    
    // Ganancia del día (venta_precio - costo)
    const gananciaRes = await db.manyOrNone(
      `SELECT (vd.precio_unitario - COALESCE(p.precio_costo, 0)) * vd.cantidad as ganancia
       FROM ventas v
       JOIN ventas_detalle vd ON v.id = vd.venta_id
       JOIN productos p ON vd.producto_id = p.id
       WHERE DATE(v.fecha) = CURRENT_DATE
         AND v.tipo = 'Cobrado'`,
      []
    );
    
    const gananciaHoy = gananciaRes.reduce((sum, row) => sum + Number(row.ganancia || 0), 0);
    
    console.log(`[Dashboard] Ganancia hoy: ${gananciaHoy}`);
    
    // Deuda total de clientes
    const deudaRes = await db.oneOrNone(
      `SELECT COALESCE(SUM(deuda_total), 0) as total_deuda FROM clientes`,
      []
    );
    
    const deudaTotal = deudaRes ? Number(deudaRes.total_deuda) : 0;
    
    // Alertas de stock bajo
    const alertasRes = await db.manyOrNone(
      `SELECT COUNT(*) as count FROM productos WHERE stock < 10`,
      []
    );
    
    const alertas = alertasRes[0] ? Number(alertasRes[0].count) : 0;
    
    res.json({
      ventaHoy,
      gananciaHoy,
      deudaTotal,
      alertas,
      detallesVentas: ventasHoyRes,
      detallesDeudas: [],
      detallesAlertas: [],
    });
  } catch (error) {
    console.error("Error en dashboard summary:", error);
    res.status(500).json({ message: "Error al obtener resumen del dashboard" });
  }
});

/** Historial de ventas agrupado por día o mes */
r.get("/sales", requireAuth, async (req, res) => {
  try {
    const fromISO = String(req.query.fromISO);
    const toISO = String(req.query.toISO);
    const groupBy = String(req.query.groupBy) === "month" ? "month" : "day";

    const from = new Date(fromISO);
    const to = new Date(toISO);

    let groupColumn: string;
    if (groupBy === "month") {
      groupColumn = "DATE_TRUNC('month', v.fecha AT TIME ZONE 'UTC')::date";
    } else {
      groupColumn = "DATE(v.fecha AT TIME ZONE 'UTC')";
    }

    const sales = await db.manyOrNone(
      `SELECT 
        ${groupColumn} as label,
        SUM(CASE WHEN v.tipo = 'Cobrado' THEN v.total ELSE 0 END) as cobrado,
        SUM(CASE WHEN v.tipo = 'Fiado' THEN v.total ELSE 0 END) as fiado,
        SUM(v.total) as total
       FROM ventas v
       WHERE v.fecha >= $1 AND v.fecha <= $2
       GROUP BY ${groupColumn}
       ORDER BY label ASC`,
      [from, to]
    );

    const series = sales.map(row => ({
      label: new Date(row.label).toISOString().slice(0, 10),
      total: Number(row.total || 0),
      cobrado: Number(row.cobrado || 0),
      fiado: Number(row.fiado || 0),
    }));

    res.json(series);
  } catch (error) {
    console.error("Error en dashboard sales:", error);
    res.status(500).json({ message: "Error al obtener historial de ventas" });
  }
});

export default r;

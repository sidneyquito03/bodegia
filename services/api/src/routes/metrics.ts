import { Router } from "express";
import db from "../db/index";
export const metricsRouter = Router();

metricsRouter.get("/summary", async (req, res) => {
  const ventas_hoy = await db.one(
    "SELECT COALESCE(SUM(total),0) AS total FROM ventas WHERE DATE(fecha)=CURRENT_DATE"
  );
  const ganancia_hoy = await db.one(
    "SELECT COALESCE(SUM((precio_venta - precio_costo)*cantidad),0) AS ganancia FROM ventas_detalle vd JOIN productos p ON vd.producto_id=p.id WHERE DATE(vd.fecha)=CURRENT_DATE"
  );
  const deuda_total = await db.one(
    "SELECT COALESCE(SUM(monto_pendiente),0) AS deuda FROM fiados WHERE pagado=false"
  );
  const alertas = await db.one(
    `SELECT 
        COUNT(*) FILTER (WHERE stock <= stock_bajo AND stock > stock_critico) AS bajo,
        COUNT(*) FILTER (WHERE stock <= stock_critico) AS critico,
        COUNT(*) FILTER (WHERE fecha_vencimiento <= NOW()) AS vencido
      FROM productos`
  );
  res.json({
    ventas_hoy: ventas_hoy.total,
    ganancia_hoy: ganancia_hoy.ganancia,
    deuda_total: deuda_total.deuda,
    alertas,
  });
});

metricsRouter.get("/ventas-series", async (req, res) => {
  const { range = "month", category } = req.query;
  const groupBy =
    range === "day"
      ? "DATE(fecha)"
      : range === "week"
      ? "DATE_TRUNC('week', fecha)"
      : range === "year"
      ? "DATE_TRUNC('month', fecha)"
      : "DATE_TRUNC('day', fecha)";
  const rows = await db.manyOrNone(
    `SELECT ${groupBy} AS fecha,
            SUM(total) AS total,
            SUM(CASE WHEN tipo='fiado' THEN total ELSE 0 END) AS fiado,
            SUM(CASE WHEN tipo='cobrado' THEN total ELSE 0 END) AS cobrado
       FROM ventas
       ${category ? "WHERE categoria=$1" : ""}
       GROUP BY ${groupBy}
       ORDER BY ${groupBy}`,
    category ? [category] : []
  );
  res.json(rows);
});

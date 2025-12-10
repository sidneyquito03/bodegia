import { Router } from "express";
import db from "../db/index";
import { requireAuth } from "../middleware/auth";

const r = Router();

// Función auxiliar para calcular rangos de fecha precisos
function rangoFromPeriodo(periodo: string) {
  const ahora = new Date();
  let inicio = new Date(ahora);
  let fin = new Date(ahora);
  
  // Reseteamos horas para evitar problemas de comparación
  inicio.setHours(0, 0, 0, 0);
  fin.setHours(23, 59, 59, 999);

  switch (periodo) {
    case "mes-actual":
      // Primer día del mes actual
      inicio = new Date(ahora.getFullYear(), ahora.getMonth(), 1);
      // Último día del mes actual
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
      // Por defecto "hoy" si algo falla, o el mes actual
      inicio.setDate(1);
      fin = new Date(ahora.getFullYear(), ahora.getMonth() + 1, 0);
      fin.setHours(23, 59, 59, 999);
  }
  return { inicio, fin };
}

// === RUTA PRINCIPAL ===
// Al combinarse con index.ts, la URL será: /reports/sunat/summary
r.get("/summary", requireAuth, async (req, res) => {
  try {
    const periodo = String(req.query.periodo || "mes-actual");
    const { inicio, fin } = rangoFromPeriodo(periodo);

    console.log(`🔍 [SUNAT] Consultando: ${periodo} (${inicio.toISOString()} - ${fin.toISOString()})`);

    // 1. Total Ventas (Suma de todo lo vendido)
    const ventasRes = await db.oneOrNone(
      `SELECT COALESCE(SUM(total), 0) as total
       FROM ventas
       WHERE fecha >= $1 AND fecha <= $2`,
      [inicio, fin]
    );
    const totalVentas = Number(ventasRes?.total || 0);

    // 2. Ventas Cobradas (Dinero real en caja)
    const ventasCobradasRes = await db.oneOrNone(
      `SELECT COALESCE(SUM(total), 0) as total
       FROM ventas
       WHERE fecha >= $1 AND fecha <= $2 AND tipo = 'Cobrado'`,
      [inicio, fin]
    );
    const totalVentasCobradas = Number(ventasCobradasRes?.total || 0);

    // 3. Fiados (Crédito)
    const fiadosRes = await db.oneOrNone(
      `SELECT COALESCE(SUM(total), 0) as total
       FROM ventas
       WHERE fecha >= $1 AND fecha <= $2 AND tipo = 'Fiado'`,
      [inicio, fin]
    );
    const totalFiados = Number(fiadosRes?.total || 0);

    // 4. Pagos de Deudas (Dinero recuperado)
    const pagosRes = await db.oneOrNone(
      `SELECT COALESCE(SUM(monto), 0) as total
       FROM fiados_transacciones
       WHERE fecha >= $1 AND fecha <= $2 AND tipo = 'pago'`,
      [inicio, fin]
    );
    const totalPagos = Number(pagosRes?.total || 0);

    // 5. Compras (Gastos)
    const comprasRes = await db.oneOrNone(
      `SELECT COALESCE(SUM(total), 0) as total
       FROM compras_proveedores
       WHERE fecha >= $1 AND fecha <= $2`,
      [inicio, fin]
    );
    const totalCompras = Number(comprasRes?.total || 0);

    const respuesta = {
      totalVentas,
      totalVentasCobradas,
      totalCompras,
      totalFiados,
      totalPagos,
      periodo,
      desde: inicio.toISOString(),
      hasta: fin.toISOString()
    };
    
    console.log("✅ [SUNAT] Respuesta enviada:", respuesta);
    res.json(respuesta);

  } catch (error: any) {
    console.error("❌ [SUNAT ERROR]:", error);
    res.status(500).json({ message: error.message || "Error al obtener resumen SUNAT" });
  }
});

// Rutas detalle (se mantienen vacías o con tu lógica original si la tenías)
r.get("/ventas-detalle", requireAuth, async (req, res) => res.json([]));
r.get("/fiados-detalle", requireAuth, async (req, res) => res.json([]));
r.get("/compras-detalle", requireAuth, async (req, res) => res.json([]));

export default r;
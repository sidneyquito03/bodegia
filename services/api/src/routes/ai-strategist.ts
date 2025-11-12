import { Router } from "express";
import db from "../db/index";

const router = Router();

router.get("/recomendaciones", async (req, res) => {
  try {
    const { default: OpenAI } = await import("openai");  // 👈 import dinámico
    const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

    const ventas = await db.manyOrNone<{ nombre: string; total_vendido: number }>(
      `SELECT p.nombre, SUM(vd.cantidad) AS total_vendido
         FROM ventas_detalle vd
         JOIN productos p ON p.id = vd.producto_id
       GROUP BY p.nombre
       ORDER BY total_vendido DESC LIMIT 50`
    );

    const prompt = `
Eres un consejero de compras para una bodega peruana. 
Basado en las ventas más recientes, recomienda qué productos deben reabastecerse o comprarse.
Datos:
${ventas.map(v => `${v.nombre}: ${v.total_vendido}`).join("\n")}
Devuelve SOLO JSON: [{"producto":"","recomendacion":""}]
    `;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const content = completion.choices[0]?.message?.content ?? "[]";
    let parsed: any[] = [];
    try { parsed = JSON.parse(content); } catch {}
    res.json(parsed);
  } catch (e) {
    console.error(e);
    res.status(500).json({ error: "Error generando recomendaciones" });
  }
});

export default router;


// services/api/src/routes/ai-strategist.ts
/*import { Router } from "express";
import OpenAI from "openai";

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

router.post("/", async (req, res) => {
  try {
    const payload = req.body as {
      ventas: number; totalVendido: number; clientesConDeuda: number; deudaTotal: number;
      productosStockBajo: number; transaccionesFiados: number; metodosPago: Record<string, number>;
    };

    const prompt = `Eres un asesor para una bodega en Perú. Con estos datos:
- Ventas: ${payload.ventas}, Total vendido: S/. ${payload.totalVendido.toFixed(2)}
- Clientes con deuda: ${payload.clientesConDeuda}, Deuda total: S/. ${payload.deudaTotal.toFixed(2)}
- Productos con stock bajo: ${payload.productosStockBajo}
- Transacciones de fiados: ${payload.transaccionesFiados}
- Métodos de pago: ${JSON.stringify(payload.metodosPago)}

Devuelve EXACTAMENTE un JSON array (sin texto extra) con 5 recomendaciones:
[{"titulo":"","descripcion":"","prioridad":"Alta|Media|Baja","categoria":"Ventas|Inventario|Fiados|Operaciones"}]`;

    const r = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [{ role: "user", content: prompt }],
      temperature: 0.2,
    });

    const content = r.choices[0]?.message?.content ?? "[]";
    let parsed: any[] = [];
    try { parsed = JSON.parse(content) } catch {}
    res.json(parsed);
  } catch (e) {
    console.error(e);
    res.status(500).json([]);
  }
});

export default router;
*/
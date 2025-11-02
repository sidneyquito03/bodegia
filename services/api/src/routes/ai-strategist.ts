// services/api/src/routes/ai-strategist.ts
import { Router } from "express";
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

import { Router } from "express";
import type { Request, Response } from "express";
import OpenAI from "openai";

const router = Router();
const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY! });

router.post("/chat", async (req: Request, res: Response) => {
  try {
    const { messages } = req.body as {
      messages: { role: "user" | "assistant"; content: string }[];
    };

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: messages.map((m) => ({ role: m.role, content: m.content })),
      temperature: 0.2,
    });

    const message =
      completion.choices[0]?.message?.content ??
      "Lo siento, no pude generar respuesta.";
    res.json({ message });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "AI error" });
  }
});

router.post("/analyze-product", async (req: Request, res: Response) => {
  try {
    const { imagenUrl, clasificacion } = req.body as {
      imagenUrl: string;
      clasificacion?: string;
    };

    const prompt = clasificacion 
      ? `Analiza esta imagen de un producto de la clasificación "${clasificacion}". 
         Extrae la siguiente información en formato JSON:
         - nombre: nombre del producto
         - marca: marca si es visible
         - categoria: categoría específica
         - precio_venta: precio estimado en soles (opcional)
         - volumen_peso_neto: volumen o peso neto si es visible (ej: "500ml", "1kg")
         - descripcion: breve descripción
         
         Responde SOLO con el objeto JSON, sin texto adicional.`
      : `Analiza esta imagen de un producto y extrae la siguiente información en formato JSON:
         - nombre: nombre del producto
         - marca: marca si es visible
         - categoria: categoría del producto
         - precio_venta: precio estimado en soles (opcional)
         - volumen_peso_neto: volumen o peso neto si es visible
         - clasificacion_sugerida: clasificación sugerida (ropa, tecnologia, abarrotes, etc.)
         
         Responde SOLO con el objeto JSON, sin texto adicional.`;

    const completion = await openai.chat.completions.create({
      model: "gpt-4o-mini",
      messages: [
        {
          role: "user",
          content: [
            { type: "text", text: prompt },
            { type: "image_url", image_url: { url: imagenUrl } }
          ]
        }
      ],
      temperature: 0.1,
      max_tokens: 500,
    });

    const respuesta = completion.choices[0]?.message?.content ?? "{}";
    
    try {
      const productoSugerido = JSON.parse(respuesta);
      res.json(productoSugerido);
    } catch {
      // Si no es JSON válido, intentar extraer datos básicos
      res.json({
        nombre: "",
        descripcion: respuesta,
      });
    }
  } catch (err) {
    console.error("Error en análisis de imagen:", err);
    res.status(500).json({ message: "Error al analizar la imagen" });
  }
});

export default router;

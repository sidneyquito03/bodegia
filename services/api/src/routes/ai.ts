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

    let prompt = `Analiza esta imagen de producto y extrae la siguiente información en formato JSON:
- nombre: nombre del producto
- marca: marca si es visible
- categoria: categoría específica
- precio_venta: precio estimado en soles (número, opcional)
- descripcion: breve descripción
`;

    // Agregar campos específicos según clasificación
    if (clasificacion === "ropa" || clasificacion === "calzado") {
      prompt += `\nEste es un producto de ${clasificacion}. Extrae TAMBIÉN:
- talla: talla del producto (S, M, L, XL, 38, 40, etc.)
- color: color principal
- genero: género (Hombre, Mujer, Unisex, Niño, Niña)
- tipo_tela: tipo de tela o material (Algodón, Poliéster, Jean, Cuero, etc.)
`;
    } else if (clasificacion === "abarrotes" || clasificacion === "limpieza" || clasificacion === "licores") {
      prompt += `\nEste es un producto de ${clasificacion}. Extrae TAMBIÉN:
- volumen_peso_neto: volumen o peso neto visible (ej: "500ml", "1L", "250g", "1kg")
- fecha_vencimiento: fecha de vencimiento si es visible (formato YYYY-MM-DD)
`;
    } else if (clasificacion === "tecnologia") {
      prompt += `\nEste es un producto de tecnología. Extrae TAMBIÉN:
- garantia_dias: días de garantía si es visible (número)
- detalles_clave: características principales del producto
- especificacion_electrica: especificaciones eléctricas si son visibles
`;
    } else if (clasificacion === "mascotas") {
      prompt += `\nEste es un producto de mascotas. Extrae TAMBIÉN:
- volumen_peso_neto: peso o volumen (ej: "500g", "2kg", "1L")
- tipo_mascota: tipo de mascota (Perro, Gato, Ave, Roedor, Pez, etc.)
`;
    } else if (clasificacion === "belleza" || clasificacion === "aseo_personal") {
      prompt += `\nEste es un producto de ${clasificacion}. Extrae TAMBIÉN:
- volumen_peso_neto: volumen o peso (ej: "100ml", "250g")
- tono_aroma: tono, aroma o fragancia (ej: "Lavanda", "Neutro", "Rosa")
- tipo_piel_cabello: tipo de piel o cabello recomendado
- color: color del producto (para maquillaje)
`;
    } else if (clasificacion === "libreria") {
      prompt += `\nEste es un producto de librería. Extrae TAMBIÉN:
- autor: nombre del autor (si es un libro)
- editorial: editorial (si es un libro)
- isbn_ean: código ISBN o EAN si es visible
- numero_paginas: número de páginas (si es visible)
`;
    } else if (clasificacion === "hogar") {
      prompt += `\nEste es un producto de hogar. Extrae TAMBIÉN:
- material: material principal (Madera, Plástico, Metal, Cerámica, etc.)
- alto_cm: altura en cm si es visible
- ancho_cm: ancho en cm si es visible
- profundo_cm: profundidad en cm si es visible
`;
    } else if (clasificacion === "herramientas") {
      prompt += `\nEste es una herramienta. Extrae TAMBIÉN:
- material: material principal
- especificacion_electrica: especificaciones eléctricas si es visible (ej: "220V 1500W")
- garantia_dias: días de garantía
`;
    }

    prompt += `\n\nResponde ÚNICAMENTE con un objeto JSON válido, sin texto adicional antes o después.`;

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
